/**
 * Sauvegarde / restauration JSON.
 * Format versionné : { format, formatVersion, exportedAt, appVersion, data }.
 * Les anciennes versions du format sont migrées par `migrateBackup`.
 */
import type { SkillRecord } from '@/adaptive-engine/mastery';
import type { Profile } from '@/profiles/types';
import { db, type AttemptRow, type NovaDB, type SessionRow } from './db';
import { normalizeProfile } from './repo';

export const BACKUP_FORMAT = 'nova-academy-backup';
export const BACKUP_VERSION = 1;

export interface BackupData {
  profiles: Profile[];
  skillRecords: SkillRecord[];
  attempts: AttemptRow[];
  sessions: SessionRow[];
}

export interface BackupFile {
  format: typeof BACKUP_FORMAT;
  formatVersion: number;
  exportedAt: string;
  appVersion: string;
  data: BackupData;
}

export class BackupError extends Error {}

export async function exportBackup(d: NovaDB = db, profileIds?: string[]): Promise<BackupFile> {
  const keep = <T extends { profileId?: string; id?: unknown }>(rows: T[], key: (r: T) => string) =>
    profileIds ? rows.filter((r) => profileIds.includes(key(r))) : rows;
  const [profiles, skillRecords, attempts, sessions] = await Promise.all([
    d.profiles.toArray(),
    d.skillRecords.toArray(),
    d.attempts.toArray(),
    d.sessions.toArray(),
  ]);
  return {
    format: BACKUP_FORMAT,
    formatVersion: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    appVersion: __APP_VERSION__,
    data: {
      profiles: keep(profiles as (Profile & { profileId?: string })[], (p) => p.id),
      skillRecords: keep(skillRecords, (r) => r.profileId),
      attempts: keep(attempts, (r) => r.profileId),
      sessions: keep(sessions, (r) => r.profileId),
    },
  };
}

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const isStr = (v: unknown): v is string => typeof v === 'string';

/** Migration des anciens formats (aucun pour l'instant : la v1 est la première publiée). */
export function migrateBackup(raw: Record<string, unknown>): Record<string, unknown> {
  const v = raw.formatVersion;
  if (typeof v !== 'number') throw new BackupError('Version de sauvegarde absente.');
  if (v > BACKUP_VERSION) {
    throw new BackupError('Cette sauvegarde vient d’une version plus récente de Nova Academy. Mets l’application à jour puis réessaie.');
  }
  // if (v === 1) raw = migrateV1toV2(raw) … (à ajouter lors d'une future évolution)
  return raw;
}

/** Validation stricte d'un fichier importé. Renvoie des données prêtes à écrire. */
export function validateBackup(input: unknown): BackupData {
  if (!isObj(input) || input.format !== BACKUP_FORMAT) {
    throw new BackupError('Ce fichier n’est pas une sauvegarde Nova Academy.');
  }
  const raw = migrateBackup(input);
  const data = raw.data;
  if (!isObj(data)) throw new BackupError('Sauvegarde incomplète : données manquantes.');
  const arr = (k: string) => {
    const v = data[k];
    if (!Array.isArray(v)) throw new BackupError(`Sauvegarde incomplète : « ${k} » manquant.`);
    return v as unknown[];
  };
  const profiles = arr('profiles').map((p, i) => {
    if (!isObj(p) || !isStr(p.id) || (p.level !== 'ce2' && p.level !== 'cm2') || !isStr(p.name)) {
      throw new BackupError(`Profil n°${i + 1} invalide.`);
    }
    // Les champs manquants (ajoutés dans des versions plus récentes) reçoivent une valeur par défaut.
    return normalizeProfile(p as unknown as Profile);
  });
  const ids = new Set(profiles.map((p) => p.id));
  const owned = (r: unknown, what: string): r is Record<string, unknown> => {
    if (!isObj(r) || !isStr(r.profileId)) throw new BackupError(`Entrée « ${what} » invalide.`);
    if (!ids.has(r.profileId)) throw new BackupError(`Entrée « ${what} » liée à un profil inconnu.`);
    return true;
  };
  const skillRecords = arr('skillRecords').filter((r) => owned(r, 'compétence')) as unknown as SkillRecord[];
  for (const r of skillRecords) {
    if (!isStr(r.skillId) || !Array.isArray(r.recent) || typeof r.attempts !== 'number') {
      throw new BackupError('Une compétence enregistrée est invalide.');
    }
  }
  const attempts = arr('attempts').filter((r) => owned(r, 'réponse')) as unknown as AttemptRow[];
  for (const a of attempts) {
    if (!isStr(a.skillId) || typeof a.correct !== 'boolean' || !isStr(a.day)) throw new BackupError('Une réponse enregistrée est invalide.');
  }
  const sessions = arr('sessions').filter((r) => owned(r, 'séance')) as unknown as SessionRow[];
  return { profiles, skillRecords, attempts, sessions };
}

export function parseBackupText(text: string): BackupData {
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    throw new BackupError('Le fichier est illisible (JSON invalide).');
  }
  return validateBackup(json);
}

/**
 * Restaure les données. Mode « replace » : remplace tout. Mode « merge » : remplace uniquement
 * les profils présents dans la sauvegarde (les autres profils de cet ordinateur sont conservés).
 */
export async function restoreBackup(data: BackupData, mode: 'replace' | 'merge', d: NovaDB = db): Promise<void> {
  await d.transaction('rw', [d.profiles, d.skillRecords, d.attempts, d.sessions], async () => {
    if (mode === 'replace') {
      await Promise.all([d.profiles.clear(), d.skillRecords.clear(), d.attempts.clear(), d.sessions.clear()]);
    } else {
      for (const p of data.profiles) {
        await d.attempts.where('profileId').equals(p.id).delete();
        await d.sessions.where('profileId').equals(p.id).delete();
        await d.skillRecords.where('profileId').equals(p.id).delete();
      }
    }
    await d.profiles.bulkPut(data.profiles);
    await d.skillRecords.bulkPut(data.skillRecords);
    await d.attempts.bulkAdd(data.attempts.map(({ id: _id, ...a }) => a));
    await d.sessions.bulkAdd(data.sessions.map(({ id: _id, ...s }) => s));
  });
}

export function backupFileName(date = new Date()): string {
  return `nova-academy-sauvegarde-${date.toISOString().slice(0, 10)}.json`;
}
