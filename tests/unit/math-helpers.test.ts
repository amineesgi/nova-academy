import { describe, expect, it } from 'vitest';
import { numberToWords } from '@/curriculum/math-helpers';
import { normalize, parseNumber, checkAnswer } from '@/exercises/check';
import type { Exercise } from '@/curriculum/types';

describe('numberToWords (orthographe rectifiée)', () => {
  it.each([
    [0, 'zéro'],
    [21, 'vingt-et-un'],
    [71, 'soixante-et-onze'],
    [80, 'quatre-vingts'],
    [81, 'quatre-vingt-un'],
    [91, 'quatre-vingt-onze'],
    [100, 'cent'],
    [200, 'deux-cents'],
    [280, 'deux-cent-quatre-vingts'],
    [1000, 'mille'],
    [2500, 'deux-mille-cinq-cents'],
    [80000, 'quatre-vingt-mille'],
    [200000, 'deux-cent-mille'],
    [1000000, 'un-million'],
    [2050000, 'deux-millions-cinquante-mille'],
    [149600000, 'cent-quarante-neuf-millions-six-cent-mille'],
  ])('%i → %s', (n, w) => expect(numberToWords(n)).toBe(w));
});

describe('saisie et normalisation', () => {
  it('lit les nombres à la française', () => {
    expect(parseNumber('12,5')).toBe(12.5);
    expect(parseNumber('1 250')).toBe(1250);
    expect(parseNumber('abc')).toBeNull();
  });
  it('tolère espaces, apostrophes et ponctuation finale', () => {
    expect(normalize('  Il ne mange jamais d’épinards. ')).toBe(normalize("il ne mange jamais d'épinards"));
  });
  it('les accents comptent en orthographe et un message aide l’enfant', () => {
    const ex = { id: 'x', skillId: 's', difficulty: 1, prompt: 'p', hints: ['h'], explanation: 'e', type: 'text', answers: ['étions'] } as Exercise;
    const r = checkAnswer(ex, { kind: 'text', value: 'etions' });
    expect(r.correct).toBe(false);
    expect(r.feedback).toMatch(/accents/);
    expect(checkAnswer(ex, { kind: 'text', value: 'Étions' }).correct).toBe(true);
  });
  it('l’anglais peut ignorer les accents', () => {
    const ex = { id: 'x', skillId: 's', difficulty: 1, prompt: 'p', hints: ['h'], explanation: 'e', type: 'text', answers: ['black'], strictAccents: false } as Exercise;
    expect(checkAnswer(ex, { kind: 'text', value: 'Black' }).correct).toBe(true);
  });
});
