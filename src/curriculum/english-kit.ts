/**
 * Outils pour les compétences d'anglais : vocabulaire illustré + générateurs d'écoute.
 * Les pictogrammes sont des symboles Unicode affichés dans des cartes illustrées ;
 * l'identité graphique de l'application (mascottes, cartes, avatars) est en SVG original.
 */
import type { ItemSpec } from './authoring';
import type { GenSpec } from './authoring';
import type { VocabCard, Visual } from './types';

export const v = (en: string, fr: string, symbol: string): VocabCard => ({ en, fr, symbol });

export const pic = (c: VocabCard): Visual => ({ kind: 'picture', symbol: c.symbol, label: c.fr });

/** Générateurs d'écoute : on entend un mot anglais, on choisit l'image (4 choix). */
export function listenGens(words: VocabCard[], idPrefix: string): GenSpec[] {
  return [
    {
      id: `${idPrefix}-ecoute`,
      difficulty: 1,
      variants: Math.min(12, words.length),
      build: (r): ItemSpec => {
        const target = r.pick(words);
        const others = r.shuffle(words.filter((w) => w.en !== target.en)).slice(0, 3);
        const all = r.shuffle([target, ...others]);
        return {
          type: 'listen',
          prompt: 'Écoute le mot anglais et clique sur la bonne image.',
          say: target.en,
          choices: all.map((w) => w.fr),
          answer: all.indexOf(target),
          choiceVisuals: all.map(pic),
          explanation: `« ${target.en} » veut dire « ${target.fr} ».`,
        };
      },
    },
    {
      id: `${idPrefix}-lire`,
      difficulty: 2,
      variants: Math.min(12, words.length),
      build: (r): ItemSpec => {
        const target = r.pick(words);
        const others = r.shuffle(words.filter((w) => w.en !== target.en)).slice(0, 3);
        const all = r.shuffle([target, ...others]);
        return {
          type: 'mcq',
          prompt: 'Comment dit-on ce mot en anglais ?',
          visual: pic(target),
          choices: all.map((w) => w.en),
          answer: all.indexOf(target),
          explanation: `« ${target.fr} » se dit « ${target.en} ».`,
        };
      },
    },
  ];
}
