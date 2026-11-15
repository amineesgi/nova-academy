/** Outils mathématiques partagés par les générateurs (testés dans tests/unit/math-helpers.test.ts). */
import { fr, type Rng } from '@/utils/rng';

const UNITS = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize'];
const TENS = ['', 'dix', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante'];

/** Nombre < 100 en lettres (orthographe rectifiée de 1990 : traits d'union partout). */
function below100(n: number): string {
  if (n <= 16) return UNITS[n] as string;
  if (n < 20) return `dix-${UNITS[n - 10]}`;
  const t = Math.floor(n / 10);
  const u = n % 10;
  if (t === 7 || t === 9) {
    const base = t === 7 ? 'soixante' : 'quatre-vingt';
    const rest = 10 + u;
    if (t === 7 && u === 1) return 'soixante-et-onze';
    return `${base}-${below100(rest)}`;
  }
  if (t === 8) return u === 0 ? 'quatre-vingts' : `quatre-vingt-${UNITS[u]}`;
  if (u === 0) return TENS[t] as string;
  if (u === 1) return `${TENS[t]}-et-un`;
  return `${TENS[t]}-${UNITS[u]}`;
}

function below1000(n: number, final: boolean): string {
  const h = Math.floor(n / 100);
  const r = n % 100;
  let s = '';
  if (h > 0) {
    s = h === 1 ? 'cent' : `${UNITS[h]}-cent${r === 0 && final ? 's' : ''}`;
  }
  if (r > 0) {
    const w = below100(r);
    // « quatre-vingts » perd son s s'il n'est pas final (ex. quatre-vingt-mille).
    const ww = !final && w === 'quatre-vingts' ? 'quatre-vingt' : w;
    s = s ? `${s}-${ww}` : ww;
  }
  return s;
}

/** Nombre entier en lettres (jusqu'à 999 999 999 999). */
export function numberToWords(n: number): string {
  if (!Number.isInteger(n) || n < 0) throw new Error(`numberToWords: ${n}`);
  if (n === 0) return 'zéro';
  const parts: string[] = [];
  const billions = Math.floor(n / 1e9);
  const millions = Math.floor((n % 1e9) / 1e6);
  const thousands = Math.floor((n % 1e6) / 1000);
  const rest = n % 1000;
  if (billions) parts.push(`${below1000(billions, true)}-milliard${billions > 1 ? 's' : ''}`);
  if (millions) parts.push(`${below1000(millions, true)}-million${millions > 1 ? 's' : ''}`);
  if (thousands) parts.push(thousands === 1 ? 'mille' : `${below1000(thousands, false)}-mille`);
  if (rest) parts.push(below1000(rest, true));
  return parts.join('-');
}

export const PLACE_NAMES = ['unités', 'dizaines', 'centaines', 'unités de mille', 'dizaines de mille', 'centaines de mille', 'unités de millions', 'dizaines de millions', 'centaines de millions'];

export function digitAt(n: number, place: number): number {
  return Math.floor(n / 10 ** place) % 10;
}

/** Trois réponses fausses plausibles et distinctes autour d'une valeur. */
export function distractors(r: Rng, answer: number, candidates: number[]): number[] {
  const set = new Set<number>();
  for (const c of r.shuffle(candidates)) {
    if (c !== answer && c >= 0 && Number.isFinite(c)) set.add(Math.round(c * 1000) / 1000);
    if (set.size === 3) break;
  }
  let k = 1;
  while (set.size < 3) {
    const c = answer + k * (k % 2 === 0 ? -1 : 1) * Math.max(1, Math.round(Math.abs(answer) / 10));
    if (c !== answer && c >= 0) set.add(c);
    k++;
  }
  return [...set];
}

/** QCM numérique : renvoie les choix formatés avec la bonne réponse marquée « * ». */
export function numericChoices(r: Rng, answer: number, candidates: number[], unit = ''): string[] {
  const all = r.shuffle([answer, ...distractors(r, answer, candidates)]);
  return all.map((v) => `${v === answer ? '*' : ''}${fr(v)}${unit ? ' ' + unit : ''}`);
}

export function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

export const PRENOMS = ['Léa', 'Nour', 'Tom', 'Inès', 'Sacha', 'Lina', 'Hugo', 'Maël', 'Jade', 'Adam', 'Zoé', 'Yanis', 'Rose', 'Nino', 'Aya', 'Liam'];
