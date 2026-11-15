/**
 * Petites fonctions d'écriture du contenu pédagogique.
 * Elles rendent les fichiers de contenu compacts et lisibles par un enseignant,
 * tout en produisant des objets Exercise entièrement typés.
 *
 * Convention : dans une liste de choix, la bonne réponse est préfixée par « * ».
 * Les identifiants sont dérivés de la position : on AJOUTE toujours les nouveaux
 * exercices en fin de liste pour conserver l'historique des enfants.
 */
import type { Difficulty, Exercise, Generator, Lesson, Skill, Visual } from './types';
import { Rng } from '@/utils/rng';

type DistributiveOmit<T, K extends keyof any> = T extends unknown ? Omit<T, K> : never;
export type ItemSpec = DistributiveOmit<Exercise, 'id' | 'skillId' | 'difficulty' | 'hints'> & {
  difficulty?: Difficulty;
  hints?: string[];
};

export interface Opts {
  d?: Difficulty;
  hint?: string | string[];
  passage?: string;
  visual?: Visual;
}

function base(prompt: string, explanation: string, o: Opts = {}) {
  return {
    prompt,
    explanation,
    ...(o.d ? { difficulty: o.d } : {}),
    ...(o.hint ? { hints: Array.isArray(o.hint) ? o.hint : [o.hint] } : {}),
    ...(o.passage ? { passage: o.passage } : {}),
    ...(o.visual ? { visual: o.visual } : {}),
  };
}

export function parseChoices(raw: string[]): { choices: string[]; answer: number } {
  let answer = -1;
  const choices = raw.map((c, i) => {
    if (c.startsWith('*')) {
      if (answer !== -1) throw new Error(`Deux bonnes réponses marquées : ${raw.join(' | ')}`);
      answer = i;
      return c.slice(1);
    }
    return c;
  });
  if (answer === -1) throw new Error(`Aucune bonne réponse marquée : ${raw.join(' | ')}`);
  return { choices, answer };
}

export const qcm = (prompt: string, raw: string[], explanation: string, o?: Opts & { choiceVisuals?: Visual[] }): ItemSpec => ({
  type: 'mcq',
  ...base(prompt, explanation, o),
  ...parseChoices(raw),
  ...(o?.choiceVisuals ? { choiceVisuals: o.choiceVisuals } : {}),
});

export const vf = (prompt: string, answer: boolean, explanation: string, o?: Opts): ItemSpec => ({
  type: 'truefalse',
  ...base(prompt, explanation, o),
  answer,
});

export const num = (prompt: string, answer: number, explanation: string, o?: Opts & { unit?: string }): ItemSpec => ({
  type: 'numeric',
  ...base(prompt, explanation, o),
  answer,
  ...(o?.unit ? { unit: o.unit } : {}),
  ...(!Number.isInteger(answer) ? { decimals: true } : {}),
});

export const txt = (
  prompt: string,
  answers: string | string[],
  explanation: string,
  o?: Opts & { strictAccents?: boolean; placeholder?: string },
): ItemSpec => ({
  type: 'text',
  ...base(prompt, explanation, o),
  answers: Array.isArray(answers) ? answers : [answers],
  ...(o?.strictAccents === false ? { strictAccents: false } : {}),
  ...(o?.placeholder ? { placeholder: o.placeholder } : {}),
});

export const assoc = (prompt: string, pairs: [string, string][], explanation: string, o?: Opts): ItemSpec => ({
  type: 'match',
  ...base(prompt, explanation, o),
  pairs,
});

export const ordre = (
  prompt: string,
  items: string[],
  explanation: string,
  mode: 'sentence' | 'timeline' | 'sequence' | 'number' = 'sequence',
  o?: Opts,
): ItemSpec => ({ type: 'order', ...base(prompt, explanation, o), items, mode });

export const phrase = (sentence: string, explanation = 'Une phrase commence par une majuscule, se termine par un point et suit l’ordre : sujet, verbe, complément.', o?: Opts): ItemSpec =>
  ordre('Remets les mots dans l’ordre pour former une phrase correcte.', sentence.split(' '), explanation, 'sentence', o);

export const tri = (
  prompt: string,
  categories: string[],
  items: [string, number][],
  explanation: string,
  o?: Opts,
): ItemSpec => ({
  type: 'categorize',
  ...base(prompt, explanation, o),
  categories,
  items: items.map(([label, cat]) => ({ label, cat })),
});

export const ecoute = (say: string, raw: string[], explanation: string, o?: Opts & { prompt?: string; choiceVisuals?: Visual[] }): ItemSpec => ({
  type: 'listen',
  ...base(o?.prompt ?? 'Écoute et choisis la bonne réponse.', explanation, o),
  say,
  ...parseChoices(raw),
  ...(o?.choiceVisuals ? { choiceVisuals: o.choiceVisuals } : {}),
});

export const dictee = (say: string, explanation: string, o?: Opts & { answers?: string[] }): ItemSpec => ({
  type: 'dictation',
  ...base('Écoute la phrase puis écris-la sans erreur.', explanation, o),
  say,
  answers: o?.answers ?? [say],
});

/** Mot fautif marqué entre crochets : « Les [chat|chats] dorment. » */
export const detective = (sentence: string, explanation: string, o?: Opts): ItemSpec => {
  const words = sentence.split(' ');
  let wrong = -1;
  let correction = '';
  const clean = words.map((w, i) => {
    const m = /^\[([^|\]]+)\|([^\]]+)\](.*)$/.exec(w);
    if (m) {
      wrong = i;
      correction = (m[2] ?? '') + (m[3] ?? '');
      return (m[1] ?? '') + (m[3] ?? '');
    }
    return w;
  });
  if (wrong === -1) throw new Error(`Mot fautif manquant : ${sentence}`);
  return {
    type: 'spot',
    ...base('Le détective a repéré une erreur ! Clique sur le mot mal écrit.', explanation, o),
    words: clean,
    wrong,
    correction,
  };
};

export const carte = (prompt: string, target: string, mapId: 'france' | 'monde', explanation: string, o?: Opts): ItemSpec => ({
  type: 'map',
  ...base(prompt, explanation, o),
  target,
  mapId,
});

export interface SkillSpec extends Omit<Skill, 'exercises' | 'generators' | 'lesson'> {
  lesson: Lesson;
  items: ItemSpec[];
  generators?: GenSpec[];
}

/** Générateur paramétrique : `build` reçoit un générateur pseudo-aléatoire déterministe. */
export interface GenSpec {
  id: string;
  difficulty: Difficulty;
  /** Nombre de graines vérifiées par les tests et comptées dans l'inventaire. */
  variants?: number;
  build: (r: Rng) => ItemSpec;
}

/** Difficulté progressive par défaut : premier tiers facile, puis moyen, puis difficile. */
function defaultDifficulty(i: number, n: number): Difficulty {
  const r = i / Math.max(1, n);
  return r < 0.34 ? 1 : r < 0.7 ? 2 : 3;
}

export function defineSkill(spec: SkillSpec): Skill {
  const { items, generators = [], ...rest } = spec;
  const fallbackHint = `Rappelle-toi : ${spec.lesson.remember}`;
  const exercises = items.map((it, i) => {
    const ex = {
      ...it,
      id: `${spec.id}-${i + 1}`,
      skillId: spec.id,
      difficulty: it.difficulty ?? defaultDifficulty(i, items.length),
      hints: it.hints && it.hints.length > 0 ? it.hints : [fallbackHint],
    } as Exercise;
    return ex;
  });
  return {
    ...rest,
    exercises,
    generators: generators.map(
      (g): Generator => ({
        id: `${spec.id}-${g.id}`,
        skillId: spec.id,
        difficulty: g.difficulty,
        variants: g.variants ?? 12,
        make: (seed: number) => {
          const it = g.build(new Rng(seed));
          return {
            ...it,
            id: `${spec.id}-${g.id}-s${seed}`,
            skillId: spec.id,
            difficulty: g.difficulty,
            hints: it.hints && it.hints.length > 0 ? it.hints : [fallbackHint],
          } as Exercise;
        },
      }),
    ),
  };
}

/** Écriture compacte d'une leçon. */
export function L(
  objective: string,
  intro: string,
  explanation: string[],
  example: [string, string],
  demo: string[],
  alternative: string[],
  remember: string,
): Lesson {
  return { objective, intro, explanation, example: { prompt: example[0], answer: example[1] }, demo, alternative, remember };
}

export const DEFAULT_MASTERY =
  'Au moins 85 % de réussite sur les 8 dernières réponses, sur au moins deux jours différents, et une révision espacée réussie.';

interface BuilderBase {
  level: Skill['level'];
  subject: Skill['subject'];
  programRef: string;
  region: string;
}

export interface QuickSkill {
  id: string;
  domain: string;
  title: string;
  lesson: Lesson;
  items: ItemSpec[];
  gens?: GenSpec[];
  prereq?: string[];
  d?: Difficulty;
  diag?: boolean;
  mastery?: string;
  region?: string;
  programRef?: string;
}

/** Fabrique de compétences partageant niveau, matière, référence et région. */
export function skillsOf(b: BuilderBase) {
  return (q: QuickSkill): Skill =>
    defineSkill({
      id: q.id,
      level: b.level,
      subject: b.subject,
      domain: q.domain,
      title: q.title,
      objective: q.lesson.objective,
      prerequisites: q.prereq ?? [],
      difficulty: q.d ?? 1,
      programRef: q.programRef ?? b.programRef,
      masteryCriteria: q.mastery ?? DEFAULT_MASTERY,
      region: q.region ?? b.region,
      lesson: q.lesson,
      items: q.items,
      generators: q.gens ?? [],
      ...(q.diag ? { diagnostic: true } : {}),
    });
}
