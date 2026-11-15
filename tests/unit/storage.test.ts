import { beforeEach, describe, expect, it } from 'vitest';
import { NovaDB } from '@/storage/db';
import { attemptsFor, deleteProfile, loadRecords, newProfile, recordAttempt, resetProfileProgress, saveProfile, listProfiles } from '@/storage/repo';
import { BackupError, exportBackup, parseBackupText, restoreBackup, validateBackup } from '@/storage/backup';

let d: NovaDB;
let n = 0;
beforeEach(async () => {
  d = new NovaDB(`test-${n++}`);
  await d.open();
});

const attempt = (skillId: string, correct: boolean) => ({ skillId, exerciseId: `${skillId}-1`, correct, hintsUsed: 0, tries: 1, ms: 1000, context: 'mission' as const, prompt: 'q', given: 'a', expected: 'b' });

describe('stockage local', () => {
  it('sépare complètement les progressions CE2 et CM2', async () => {
    const a = newProfile('ce2', 'Lili');
    const b = newProfile('cm2', 'Max');
    await saveProfile(a, d);
    await saveProfile(b, d);
    await recordAttempt(a.id, attempt('ce2-ma-num', true), d);
    await recordAttempt(b.id, attempt('cm2-ma-decimaux', false), d);
    await recordAttempt(b.id, attempt('cm2-ma-decimaux', true), d);
    const ra = await loadRecords(a.id, d);
    const rb = await loadRecords(b.id, d);
    expect([...ra.keys()]).toEqual(['ce2-ma-num']);
    expect([...rb.keys()]).toEqual(['cm2-ma-decimaux']);
    expect(rb.get('cm2-ma-decimaux')!.attempts).toBe(2);
    expect((await attemptsFor(a.id, d)).length).toBe(1);
    expect((await listProfiles(d)).find((p) => p.id === a.id)!.activeDays.length).toBe(1);
  });

  it('les données persistent après fermeture et réouverture de la base', async () => {
    const a = newProfile('ce2', 'Lili');
    await saveProfile(a, d);
    await recordAttempt(a.id, attempt('ce2-ma-num', true), d);
    const name = d.name;
    d.close();
    const again = new NovaDB(name);
    await again.open();
    expect((await loadRecords(a.id, again)).get('ce2-ma-num')!.correct).toBe(1);
  });

  it('réinitialise et supprime un profil sans toucher l’autre', async () => {
    const a = newProfile('ce2', 'Lili');
    const b = newProfile('cm2', 'Max');
    await saveProfile(a, d);
    await saveProfile(b, d);
    await recordAttempt(a.id, attempt('ce2-ma-num', true), d);
    await recordAttempt(b.id, attempt('cm2-ma-decimaux', true), d);
    await resetProfileProgress(a.id, d);
    expect((await loadRecords(a.id, d)).size).toBe(0);
    expect((await loadRecords(b.id, d)).size).toBe(1);
    await deleteProfile(a.id, d);
    expect((await listProfiles(d)).map((p) => p.name)).toEqual(['Max']);
  });
});

describe('sauvegarde et restauration', () => {
  it('exporte puis restaure à l’identique sur un autre navigateur', async () => {
    const a = newProfile('ce2', 'Lili');
    await saveProfile(a, d);
    await recordAttempt(a.id, attempt('ce2-ma-num', true), d);
    await recordAttempt(a.id, attempt('ce2-fr-classes', false), d);
    const text = JSON.stringify(await exportBackup(d));
    const other = new NovaDB(`other-${n++}`);
    await other.open();
    await restoreBackup(parseBackupText(text), 'replace', other);
    expect((await listProfiles(other))[0]!.name).toBe('Lili');
    expect((await attemptsFor(a.id, other)).length).toBe(2);
    expect((await loadRecords(a.id, other)).get('ce2-fr-classes')!.attempts).toBe(1);
  });

  it('le mode fusion conserve les autres profils de l’ordinateur', async () => {
    const a = newProfile('ce2', 'Lili');
    await saveProfile(a, d);
    const file = await exportBackup(d);
    const other = new NovaDB(`other-${n++}`);
    await other.open();
    await saveProfile(newProfile('cm2', 'Max'), other);
    await restoreBackup(validateBackup(JSON.parse(JSON.stringify(file))), 'merge', other);
    expect((await listProfiles(other)).map((p) => p.name).sort()).toEqual(['Lili', 'Max']);
  });

  it('refuse les fichiers invalides avec un message compréhensible', () => {
    expect(() => parseBackupText('pas du json')).toThrow(BackupError);
    expect(() => validateBackup({ format: 'autre' })).toThrow(/pas une sauvegarde/);
    expect(() => validateBackup({ format: 'nova-academy-backup', formatVersion: 99, data: {} })).toThrow(/plus récente/);
    expect(() => validateBackup({ format: 'nova-academy-backup', formatVersion: 1, data: { profiles: [{ id: 'x', level: 'ce5', name: 'a' }], skillRecords: [], attempts: [], sessions: [] } })).toThrow(/invalide/);
    expect(() => validateBackup({ format: 'nova-academy-backup', formatVersion: 1, data: { profiles: [], skillRecords: [{ profileId: 'inconnu' }], attempts: [], sessions: [] } })).toThrow(/profil inconnu/);
  });

  it('complète les champs manquants d’une ancienne sauvegarde (compatibilité)', () => {
    const data = validateBackup({ format: 'nova-academy-backup', formatVersion: 1, data: { profiles: [{ id: 'x', level: 'cm2', name: 'Ancien', plan: { minutes: 20 } }], skillRecords: [], attempts: [], sessions: [] } });
    expect(data.profiles[0]!.plan.minutes).toBe(20);
    expect(data.profiles[0]!.plan.days.length).toBe(7);
    expect(data.profiles[0]!.rewards.xp).toBe(0);
  });
});
