/** Accès aux données : toutes les écritures passent par ici (sauvegarde automatique). */
import { applyAttempt, applyBlock, emptyRecord, todayISO, type BlockSummary, type SkillRecord } from '@/adaptive-engine/mastery';
import type { RecordMap } from '@/adaptive-engine/planner';
import type { LevelId } from '@/curriculum/types';
import { DEFAULT_SUBJECTS, type Profile } from '@/profiles/types';
import { LEVEL_DEFAULTS } from '@/profiles/levelDefaults';
import { db, type AttemptRow, type NovaDB, type SessionRow } from './db';

export function uid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `p-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function newProfile(level: LevelId, name: string, partial: Partial<Profile> = {}): Profile {
  const def = LEVEL_DEFAULTS[level];
  return {
    id: uid(),
    level,
    name: name.trim().slice(0, 20) || def.defaultName,
    avatar: { skin: 1, hairColor: 1, accessory: null, ...def.avatar },
    mascot: def.mascot,
    theme: def.theme,
    createdAt: new Date().toISOString(),
    settings: { textScale: 1, reducedMotion: false, soundEffects: true, listMode: false },
    plan: {
      days: [true, true, true, true, true, false, false],
      minutes: def.minutes,
      subjects: [...DEFAULT_SUBJECTS[level]],
      priorities: [],
      freeExplore: false,
    },
    rewards: { xp: 0, stars: 0, badges: [], cosmetics: [], chests: 0 },
    diagnosticDone: false,
    activeDays: [],
    customSessions: [],
    lastMissionDate: null,
    ...partial,
  };
}

/**
 * Compatibilité ascendante : un profil enregistré par une ancienne version peut ne pas avoir
 * certains champs ajoutés depuis. On complète avec les valeurs par défaut, sans rien perdre.
 */
export function normalizeProfile(raw: Partial<Profile> & Pick<Profile, 'id' | 'level' | 'name'>): Profile {
  const def = newProfile(raw.level, raw.name);
  return {
    ...def,
    ...raw,
    id: raw.id,
    settings: { ...def.settings, ...(raw.settings ?? {}) },
    plan: { ...def.plan, ...(raw.plan ?? {}) },
    rewards: { ...def.rewards, ...(raw.rewards ?? {}) },
    avatar: { ...def.avatar, ...(raw.avatar ?? {}) },
    activeDays: raw.activeDays ?? [],
    customSessions: raw.customSessions ?? [],
    createdAt: raw.createdAt ?? def.createdAt,
  };
}

export async function listProfiles(d: NovaDB = db): Promise<Profile[]> {
  return (await d.profiles.toArray()).map(normalizeProfile).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function saveProfile(p: Profile, d: NovaDB = db): Promise<void> {
  await d.profiles.put(p);
}

export async function getProfile(id: string, d: NovaDB = db): Promise<Profile | undefined> {
  const p = await d.profiles.get(id);
  return p ? normalizeProfile(p) : undefined;
}

export async function loadRecords(profileId: string, d: NovaDB = db): Promise<RecordMap> {
  const rows = await d.skillRecords.where('profileId').equals(profileId).toArray();
  return new Map(rows.map((r) => [r.skillId, r]));
}

export interface RecordAttemptInput extends Omit<AttemptRow, 'id' | 'day' | 'at' | 'profileId'> {
  at?: Date;
}

/** Enregistre une réponse ET met à jour la compétence, dans une seule transaction. */
export async function recordAttempt(profileId: string, input: RecordAttemptInput, d: NovaDB = db): Promise<SkillRecord> {
  const at = input.at ?? new Date();
  const day = todayISO(at);
  return d.transaction('rw', d.attempts, d.skillRecords, d.profiles, async () => {
    const { at: _ignored, ...rest } = input;
    void _ignored;
    await d.attempts.add({ ...rest, profileId, at: at.toISOString(), day });
    const prev = (await d.skillRecords.get([profileId, input.skillId])) ?? emptyRecord(profileId, input.skillId);
    const next = applyAttempt(prev, {
      correct: input.correct,
      hintsUsed: input.hintsUsed,
      tryNumber: input.tries,
      exerciseId: input.exerciseId,
      date: day,
    });
    await d.skillRecords.put(next);
    const p = await d.profiles.get(profileId);
    if (p && !p.activeDays.includes(day)) {
      await d.profiles.put({ ...p, activeDays: [...p.activeDays, day].slice(-400) });
    }
    return next;
  });
}

export async function markLessonSeen(profileId: string, skillId: string, d: NovaDB = db): Promise<void> {
  const prev = (await d.skillRecords.get([profileId, skillId])) ?? emptyRecord(profileId, skillId);
  if (!prev.lessonSeen) await d.skillRecords.put({ ...prev, lessonSeen: true });
}

export async function finishBlock(profileId: string, skillId: string, summary: BlockSummary, d: NovaDB = db): Promise<SkillRecord> {
  const prev = (await d.skillRecords.get([profileId, skillId])) ?? emptyRecord(profileId, skillId);
  const next = applyBlock(prev, summary);
  await d.skillRecords.put(next);
  return next;
}

export async function addSession(row: Omit<SessionRow, 'id'>, d: NovaDB = db): Promise<void> {
  await d.sessions.add(row);
}

export async function attemptsFor(profileId: string, d: NovaDB = db): Promise<AttemptRow[]> {
  return d.attempts.where('profileId').equals(profileId).toArray();
}

export async function sessionsFor(profileId: string, d: NovaDB = db): Promise<SessionRow[]> {
  return d.sessions.where('profileId').equals(profileId).toArray();
}

/** Réinitialise la progression d'un profil (garde prénom, avatar, réglages). */
export async function resetProfileProgress(profileId: string, d: NovaDB = db): Promise<void> {
  await d.transaction('rw', d.attempts, d.skillRecords, d.sessions, d.profiles, async () => {
    await d.attempts.where('profileId').equals(profileId).delete();
    await d.sessions.where('profileId').equals(profileId).delete();
    await d.skillRecords.where('profileId').equals(profileId).delete();
    const p = await d.profiles.get(profileId);
    if (p) {
      await d.profiles.put({
        ...p,
        rewards: { xp: 0, stars: 0, badges: [], cosmetics: [], chests: 0 },
        diagnosticDone: false,
        activeDays: [],
        customSessions: [],
        lastMissionDate: null,
      });
    }
  });
}

export async function deleteProfile(profileId: string, d: NovaDB = db): Promise<void> {
  await resetProfileProgress(profileId, d);
  await d.profiles.delete(profileId);
}

export async function getMeta<T>(key: string, d: NovaDB = db): Promise<T | undefined> {
  return (await d.meta.get(key))?.value as T | undefined;
}

export async function setMeta(key: string, value: unknown, d: NovaDB = db): Promise<void> {
  await d.meta.put({ key, value });
}
