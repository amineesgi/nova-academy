import { describe, expect, it } from 'vitest';
import { applyAttempt, applyBlock, computeState, emptyRecord, addDays, isDue, type SkillRecord } from '@/adaptive-engine/mastery';
import { buildDailyMission, isUnlocked, pickExercises } from '@/adaptive-engine/planner';
import { CE2 } from '@/curriculum/ce2';
import { CM1 } from '@/curriculum/cm1';
import { CM2 } from '@/curriculum/cm2';
import { newProfile } from '@/storage/repo';
import { openRegions } from '@/progression/regions';

const day = (n: number) => addDays('2026-11-02', n);
const ans = (rec: SkillRecord, correct: boolean, d: string, hints = 0, tryNumber = 1) =>
  applyAttempt(rec, { correct, hintsUsed: hints, tryNumber, exerciseId: `e${rec.attempts}`, date: d });

describe('modèle de maîtrise', () => {
  it('suit les états de « non commencée » à « maîtrisée provisoirement »', () => {
    let r = emptyRecord('p', 's');
    expect(computeState(r)).toBe('not_started');
    r = ans(r, true, day(0));
    expect(computeState(r)).toBe('discovery');
    for (let i = 0; i < 3; i++) r = ans(r, false, day(0));
    expect(computeState(r)).toBe('learning');
    expect(r.needsSupport).toBe(true);
    for (let i = 0; i < 8; i++) r = ans(r, true, day(1));
    expect(computeState(r)).toBe('consolidate');
    r = applyBlock(r, { score: 0.9, answered: 5, wasReview: true, date: day(4) });
    expect(computeState(r)).toBe('mastered');
  });
  it('un indice ou un 2e essai compte à moitié', () => {
    let r = emptyRecord('p', 's');
    r = ans(r, true, day(0), 1);
    r = ans(r, true, day(0), 0, 2);
    expect(r.recent).toEqual([0.5, 0.5]);
  });
  it('programme les révisions espacées et revient à la boîte 1 en cas d’échec', () => {
    let r = emptyRecord('p', 's');
    r = applyBlock(r, { score: 0.9, answered: 5, wasReview: false, date: day(0) });
    expect(r.box).toBe(1);
    expect(r.nextReview).toBe(day(1));
    r = applyBlock(r, { score: 0.9, answered: 5, wasReview: true, date: day(1) });
    expect(r.box).toBe(2);
    expect(r.nextReview).toBe(day(4));
    expect(isDue(r, day(3))).toBe(false);
    expect(isDue(r, day(4))).toBe(true);
    r = applyBlock(r, { score: 0.3, answered: 5, wasReview: true, date: day(4) });
    expect(r.box).toBe(1);
    expect(r.needsSupport).toBe(true);
  });
});

describe('planificateur', () => {
  it('propose une mission non vide pour un nouveau profil CE2, CM1 et CM2', () => {
    for (const lvl of [CE2, CM1, CM2]) {
      const p = newProfile(lvl.id, 'Test');
      const m = buildDailyMission(lvl, p, new Map(), new Date('2026-11-16'), '2026-11-16', openRegions(lvl, p, 0));
      expect(m.length).toBeGreaterThanOrEqual(2);
      expect(m.every((b) => b.kind === 'new' && b.withLesson)).toBe(true);
      expect(m.every((b) => lvl.skills.some((s) => s.id === b.skillId))).toBe(true);
    }
  });
  it('en cas de difficulté, revient d’abord sur un prérequis fragile', () => {
    const p = newProfile('ce2', 'Test');
    const skill = CE2.skills.find((s) => s.id === 'ce2-ma-multiplication')!;
    const rec = { ...emptyRecord(p.id, skill.id), attempts: 6, recent: [0, 0, 0, 1, 0, 0], needsSupport: true, lessonSeen: true };
    const m = buildDailyMission(CE2, p, new Map([[skill.id, rec]]), new Date('2026-11-16'), '2026-11-16', openRegions(CE2, p, 0));
    expect(m[0]?.kind).toBe('prerequisite');
    expect(skill.prerequisites).toContain(m[0]?.skillId);
    expect(m.find((b) => b.skillId === skill.id)?.alternativeFirst).toBe(true);
  });
  it('place les révisions échues dans la mission', () => {
    const p = newProfile('cm2', 'Test');
    const rec = { ...emptyRecord(p.id, 'cm2-fr-classes'), attempts: 8, recent: [1, 1, 1, 1, 1, 1, 1, 1], box: 2, nextReview: '2026-11-10', lessonSeen: true, days: ['a', 'b'] };
    const m = buildDailyMission(CM2, p, new Map([[rec.skillId, rec]]), new Date('2026-11-16'), '2026-11-16', openRegions(CM2, p, 0));
    expect(m.some((b) => b.skillId === 'cm2-fr-classes' && b.kind === 'review')).toBe(true);
  });
  it('respecte les matières choisies par le parent', () => {
    const p = newProfile('cm2', 'Test');
    p.plan.subjects = ['maths'];
    const m = buildDailyMission(CM2, p, new Map(), new Date('2026-11-16'), '2026-11-16');
    expect(m.length).toBeGreaterThan(0);
    expect(m.every((b) => b.skillId.startsWith('cm2-ma-'))).toBe(true);
  });
  it('verrouille une compétence tant que ses prérequis ne sont pas travaillés, sauf exploration libre', () => {
    const p = newProfile('ce2', 'Test');
    const s = CE2.skills.find((x) => x.id === 'ce2-ma-multiplication')!;
    expect(isUnlocked(CE2, s, new Map(), p)).toBe(false);
    expect(isUnlocked(CE2, s, new Map(), { ...p, plan: { ...p.plan, freeExplore: true } })).toBe(true);
  });
  it('commence toujours un bloc par la question la plus facile disponible', () => {
    for (const s of [...CE2.skills, ...CM1.skills, ...CM2.skills]) {
      const list = pickExercises(s, emptyRecord('p', s.id), 'new', 5, 42);
      const easiest = Math.min(...[...s.exercises, ...s.generators.map((g) => g.make(1))].map((e) => e.difficulty));
      expect(list.length, s.id).toBeGreaterThanOrEqual(3);
      expect(list[0]!.difficulty, s.id).toBe(easiest);
      expect(new Set(list.map((e) => e.id)).size).toBe(list.length);
    }
  });
  it('CM1 : une difficulté sur les décimaux ramène d’abord aux fractions', () => {
    const p = newProfile('cm1', 'Test');
    const skill = CM1.skills.find((s) => s.id === 'cm1-ma-decimaux')!;
    const rec = { ...emptyRecord(p.id, skill.id), attempts: 6, recent: [0, 0, 1, 0, 0, 0], needsSupport: true, lessonSeen: true };
    const m = buildDailyMission(CM1, p, new Map([[skill.id, rec]]), new Date('2026-11-16'), '2026-11-16', openRegions(CM1, p, 0));
    expect(m[0]).toMatchObject({ kind: 'prerequisite', skillId: 'cm1-ma-fractions' });
    expect(m.every((b) => b.skillId.startsWith('cm1-'))).toBe(true);
  });
});
