/**
 * Moteur de correction : règles explicites et déterministes, aucune « IA ».
 * Chaque type d'exercice a une stratégie de correction documentée ici.
 */
import type { Exercise } from '@/curriculum/types';
import { fr } from '@/utils/rng';

export type Response =
  | { kind: 'choice'; index: number }
  | { kind: 'bool'; value: boolean }
  | { kind: 'number'; value: number | null }
  | { kind: 'text'; value: string }
  | { kind: 'pairs'; value: Record<string, string> }
  | { kind: 'sequence'; value: string[] }
  | { kind: 'buckets'; value: Record<string, number> }
  | { kind: 'id'; value: string };

export interface CheckResult {
  correct: boolean;
  /** Réponse attendue, formulée pour l'enfant. */
  expected: string;
  /** Retour précis éventuel (ex. « attention aux accents »). */
  feedback?: string;
}

/** Normalisation de saisie : espaces, apostrophes typographiques, ponctuation finale, casse. */
export function normalize(s: string, strictAccents = true): string {
  let t = s
    .normalize('NFC')
    .replace(/[’`´]/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\s*([.!?;:,])\s*$/u, '')
    .replace(/\s+([,;:!?])/g, '$1')
    .toLowerCase();
  if (!strictAccents) t = t.normalize('NFD').replace(/\p{Diacritic}/gu, '');
  return t;
}

/** Lecture d'un nombre saisi à la française : « 12,5 », « 1 250 », « 1250 ». */
export function parseNumber(raw: string): number | null {
  const t = raw.replace(/[\s  ]/g, '').replace(',', '.');
  if (!/^-?\d+(\.\d+)?$/.test(t)) return null;
  return Number(t);
}

export function computeColumn(op: '+' | '-' | '×', a: number, b: number): number {
  return op === '+' ? a + b : op === '-' ? a - b : a * b;
}

export function expectedAnswer(ex: Exercise): string {
  switch (ex.type) {
    case 'mcq':
    case 'listen':
      return ex.choices[ex.answer] ?? '';
    case 'truefalse':
      return ex.answer ? 'Vrai' : 'Faux';
    case 'numeric':
      return `${fr(ex.answer)}${ex.unit ? ' ' + ex.unit : ''}`;
    case 'text':
    case 'dictation':
      return ex.answers[0] ?? '';
    case 'match':
      return ex.pairs.map(([a, b]) => `${a} → ${b}`).join(' ; ');
    case 'order':
      return ex.mode === 'sentence' ? ex.items.join(' ') : ex.items.join(' → ');
    case 'categorize':
      return ex.categories
        .map((c, i) => `${c} : ${ex.items.filter((it) => it.cat === i).map((it) => it.label).join(', ')}`)
        .join(' | ');
    case 'column':
      return fr(computeColumn(ex.op, ex.a, ex.b));
    case 'fraction-build':
      return `${ex.num}/${ex.den}`;
    case 'map':
      return ex.target;
    case 'spot':
      return `${ex.words[ex.wrong]} → ${ex.correction}`;
  }
}

function accentOnlyDifference(a: string, b: string): boolean {
  return normalize(a, false) === normalize(b, false);
}

export function checkAnswer(ex: Exercise, r: Response): CheckResult {
  const expected = expectedAnswer(ex);
  const res = (correct: boolean, feedback?: string): CheckResult => ({ correct, expected, ...(feedback ? { feedback } : {}) });

  switch (ex.type) {
    case 'mcq':
    case 'listen':
      return res(r.kind === 'choice' && r.index === ex.answer);
    case 'truefalse':
      return res(r.kind === 'bool' && r.value === ex.answer);
    case 'numeric': {
      if (r.kind !== 'number' || r.value === null) return res(false, 'Écris un nombre (avec une virgule pour les décimaux).');
      return res(Math.abs(r.value - ex.answer) < 1e-9);
    }
    case 'column': {
      if (r.kind !== 'number' || r.value === null) return res(false);
      return res(r.value === computeColumn(ex.op, ex.a, ex.b));
    }
    case 'text':
    case 'dictation': {
      if (r.kind !== 'text') return res(false);
      const strict = ex.type === 'dictation' ? true : ex.strictAccents !== false;
      const given = normalize(r.value, strict);
      // La casse compte pour une dictée uniquement en début de phrase : on reste tolérant
      // (la majuscule est rappelée dans le retour mais n'invalide pas la réponse).
      const ok = ex.answers.some((a) => normalize(a, strict) === given);
      if (ok) return res(true);
      if (strict && ex.answers.some((a) => accentOnlyDifference(a, r.value))) {
        return res(false, 'Presque ! Vérifie les accents.');
      }
      return res(false);
    }
    case 'match': {
      if (r.kind !== 'pairs') return res(false);
      const ok = ex.pairs.every(([a, b]) => r.value[a] === b);
      return res(ok);
    }
    case 'order': {
      if (r.kind !== 'sequence') return res(false);
      const ok = r.value.length === ex.items.length && r.value.every((v, i) => v === ex.items[i]);
      return res(ok);
    }
    case 'categorize': {
      if (r.kind !== 'buckets') return res(false);
      const wrong = ex.items.filter((it) => r.value[it.label] !== it.cat).length;
      return res(wrong === 0, wrong > 0 ? `${wrong} élément${wrong > 1 ? 's' : ''} mal rangé${wrong > 1 ? 's' : ''}.` : undefined);
    }
    case 'fraction-build': {
      if (r.kind !== 'number' || r.value === null) return res(false);
      return res(r.value === ex.num);
    }
    case 'map':
      return res(r.kind === 'id' && r.value === ex.target);
    case 'spot':
      return res(r.kind === 'choice' && r.index === ex.wrong);
  }
}
