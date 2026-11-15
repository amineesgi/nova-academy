/**
 * Tests de cohérence de la banque pédagogique : chaque exercice écrit et chaque variante
 * générée (sur toutes les graines comptées dans l'inventaire) doit être bien formé et
 * sa réponse attendue doit être acceptée par le moteur de correction.
 */
import { describe, expect, it } from 'vitest';
import { LEVELS, findExercise, getSkill, inventory } from '@/curriculum/registry';
import type { Exercise } from '@/curriculum/types';
import { checkAnswer, computeColumn, type Response } from '@/exercises/check';
import { MAP_TARGETS } from '@/exercises/GeoMap';

function correctResponse(ex: Exercise): Response {
  switch (ex.type) {
    case 'mcq':
    case 'listen':
      return { kind: 'choice', index: ex.answer };
    case 'truefalse':
      return { kind: 'bool', value: ex.answer };
    case 'numeric':
      return { kind: 'number', value: ex.answer };
    case 'column':
      return { kind: 'number', value: computeColumn(ex.op, ex.a, ex.b) };
    case 'text':
    case 'dictation':
      return { kind: 'text', value: ex.answers[0] ?? '' };
    case 'match':
      return { kind: 'pairs', value: Object.fromEntries(ex.pairs) };
    case 'order':
      return { kind: 'sequence', value: [...ex.items] };
    case 'categorize':
      return { kind: 'buckets', value: Object.fromEntries(ex.items.map((i) => [i.label, i.cat])) };
    case 'fraction-build':
      return { kind: 'number', value: ex.num };
    case 'map':
      return { kind: 'id', value: ex.target };
    case 'spot':
      return { kind: 'choice', index: ex.wrong };
  }
}

function validate(ex: Exercise) {
  expect(ex.prompt.length, ex.id).toBeGreaterThan(5);
  expect(ex.explanation.length, ex.id).toBeGreaterThan(3);
  expect(ex.hints.length, ex.id).toBeGreaterThan(0);
  expect([1, 2, 3]).toContain(ex.difficulty);
  if (ex.type === 'mcq' || ex.type === 'listen') {
    expect(new Set(ex.choices).size, `${ex.id} choix en double : ${ex.choices.join('|')}`).toBe(ex.choices.length);
    expect(ex.answer).toBeGreaterThanOrEqual(0);
    expect(ex.answer).toBeLessThan(ex.choices.length);
    expect(ex.choices.length).toBeGreaterThanOrEqual(2);
    if (ex.choiceVisuals) expect(ex.choiceVisuals.length).toBe(ex.choices.length);
  }
  if (ex.type === 'numeric') expect(Number.isFinite(ex.answer), ex.id).toBe(true);
  if (ex.type === 'order') {
    expect(ex.items.length).toBeGreaterThanOrEqual(2);
    expect(new Set(ex.items).size, `${ex.id} éléments en double`).toBe(ex.items.length);
  }
  if (ex.type === 'match') expect(new Set(ex.pairs.map((p) => p[1])).size, ex.id).toBe(ex.pairs.length);
  if (ex.type === 'categorize') {
    expect(new Set(ex.items.map((i) => i.label)).size, ex.id).toBe(ex.items.length);
    for (const it of ex.items) expect(it.cat).toBeLessThan(ex.categories.length);
  }
  if (ex.type === 'fraction-build') expect(ex.num).toBeLessThanOrEqual(ex.den);
  if (ex.type === 'map') expect(MAP_TARGETS[ex.mapId], ex.id).toContain(ex.target);
  if (ex.type === 'column' && ex.op === '-') expect(ex.a).toBeGreaterThan(ex.b);
  expect(checkAnswer(ex, correctResponse(ex)).correct, `${ex.id} : la bonne réponse est refusée`).toBe(true);
}

describe.each(Object.values(LEVELS))('Banque $label', (level) => {
  it('identifiants uniques et prérequis existants', () => {
    const ids = new Set<string>();
    for (const s of level.skills) {
      expect(ids.has(s.id), s.id).toBe(false);
      ids.add(s.id);
      expect(s.level).toBe(level.id);
      for (const p of s.prerequisites) expect(getSkill(p)?.level, `${s.id} → ${p}`).toBe(level.id);
      expect(level.regions.some((r) => r.id === s.region), s.region).toBe(true);
      expect(level.subjects).toContain(s.subject);
    }
    const exIds = level.skills.flatMap((s) => s.exercises.map((e) => e.id));
    expect(new Set(exIds).size).toBe(exIds.length);
  });

  it('chaque compétence a une leçon complète et au moins 3 exercices', () => {
    for (const s of level.skills) {
      expect(s.lesson.explanation.length, s.id).toBeGreaterThan(0);
      expect(s.lesson.demo.length, s.id).toBeGreaterThan(0);
      expect(s.lesson.alternative.length, s.id).toBeGreaterThan(0);
      expect(s.exercises.length + s.generators.length, s.id).toBeGreaterThanOrEqual(3);
    }
  });

  it('chaque matière annoncée contient des compétences', () => {
    for (const subj of level.subjects) expect(level.skills.some((s) => s.subject === subj), subj).toBe(true);
  });

  it('exercices écrits valides', () => {
    for (const s of level.skills) for (const ex of s.exercises) validate(ex);
  });

  it('générateurs : toutes les variantes comptées sont valides et distinctes', () => {
    for (const s of level.skills) {
      for (const g of s.generators) {
        const prompts = new Set<string>();
        for (let seed = 1; seed <= g.variants; seed++) {
          const ex = g.make(seed);
          validate(ex);
          expect(findExercise(ex.id)?.prompt, ex.id).toBe(ex.prompt);
          prompts.add(JSON.stringify([ex.prompt, ex.type === 'column' ? [ex.a, ex.b] : ex.type === 'fraction-build' ? [ex.num, ex.den] : ex.type === 'mcq' || ex.type === 'listen' ? ex.choices : ex.type === 'order' ? ex.items : 0, ex.visual ?? null]));
        }
        expect(prompts.size, `${g.id} : variantes trop répétitives`).toBeGreaterThanOrEqual(Math.ceil(g.variants * 0.6));
      }
    }
  });

  it('volume : au moins 300 exercices ou variantes validées', () => {
    const inv = inventory(level);
    expect(inv.total).toBeGreaterThanOrEqual(300);
  });

  it('diagnostic : au moins 6 compétences de positionnement', () => {
    expect(level.skills.filter((s) => s.diagnostic).length).toBeGreaterThanOrEqual(6);
  });
});
