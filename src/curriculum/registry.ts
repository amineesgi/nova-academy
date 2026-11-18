/**
 * Registre des niveaux. Pour ajouter un niveau (ex. CM1) : créer src/curriculum/cm1,
 * l'ajouter ici et à LevelId dans types.ts. Rien d'autre n'est à modifier.
 */
import { CE2 } from './ce2';
import { CM1 } from './cm1';
import { CM2 } from './cm2';
import type { Exercise, Generator, LevelDefinition, LevelId, Skill } from './types';

export const LEVELS: Record<LevelId, LevelDefinition> = { ce2: CE2, cm1: CM1, cm2: CM2 };

const skillIndex = new Map<string, Skill>();
const genIndex = new Map<string, Generator>();
for (const lvl of Object.values(LEVELS))
  for (const s of lvl.skills) {
    skillIndex.set(s.id, s);
    for (const g of s.generators) genIndex.set(g.id, g);
  }

export function getSkill(id: string): Skill | undefined {
  return skillIndex.get(id);
}

export function findExercise(id: string): Exercise | undefined {
  const m = /^(.*)-s(\d+)$/.exec(id);
  const gen = m ? genIndex.get(m[1] ?? '') : undefined;
  if (gen && m) return gen.make(Number(m[2]));
  for (const s of skillIndex.values()) {
    const e = s.exercises.find((x) => x.id === id);
    if (e) return e;
  }
  return undefined;
}

/** Inventaire réel des contenus (affiché dans l'espace parent et docs/INVENTAIRE.md). */
export function inventory(level: LevelDefinition) {
  const authored = level.skills.reduce((a, s) => a + s.exercises.length, 0);
  const generators = level.skills.reduce((a, s) => a + s.generators.length, 0);
  const variants = level.skills.reduce((a, s) => a + s.generators.reduce((b, g) => b + g.variants, 0), 0);
  const bySubject = new Map<string, { skills: number; authored: number; variants: number }>();
  for (const s of level.skills) {
    const cur = bySubject.get(s.subject) ?? { skills: 0, authored: 0, variants: 0 };
    cur.skills += 1;
    cur.authored += s.exercises.length;
    cur.variants += s.generators.reduce((b, g) => b + g.variants, 0);
    bySubject.set(s.subject, cur);
  }
  return { skills: level.skills.length, authored, generators, variants, total: authored + variants, bySubject };
}
