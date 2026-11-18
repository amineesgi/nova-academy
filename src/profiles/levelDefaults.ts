/**
 * Réglages par défaut propres à chaque niveau (mascotte, thème, durée, avatar, présentation).
 * Les valeurs CE2 et CM2 sont strictement celles d'origine ; ajouter un niveau = ajouter une entrée.
 */
import type { LevelId } from '@/curriculum/types';
import type { AvatarConfig, MascotId, ThemeId } from './types';

export interface LevelDefaults {
  defaultName: string;
  namePlaceholder: string;
  mascot: MascotId;
  theme: ThemeId;
  minutes: number;
  avatar: Pick<AvatarConfig, 'hair' | 'outfit' | 'background'>;
  /** Exercices par étape de mission, minutes par étape, questions de positionnement par compétence. */
  blockSize: number;
  minutesPerBlock: number;
  diagnosticPerSkill: number;
  /** Carte de l'écran d'accueil. */
  card: { background: string; color: string; pill: string; choiceBg: string; choiceBorder: string; ghostBorder: string };
}

export const LEVEL_DEFAULTS: Record<LevelId, LevelDefaults> = {
  ce2: {
    defaultName: 'Exploratrice',
    namePlaceholder: 'Ex. : Lili',
    mascot: 'pip',
    theme: 'jardin',
    minutes: 20,
    avatar: { hair: 2, outfit: 0, background: 0 },
    blockSize: 5,
    minutesPerBlock: 6,
    diagnosticPerSkill: 1,
    card: { background: 'linear-gradient(160deg, #fff4e0, #ffd9e2 60%, #d9f3dc)', color: '#2b2638', pill: '#2b9667', choiceBg: '#ffffffcc', choiceBorder: '#0001', ghostBorder: '#0002' },
  },
  cm1: {
    defaultName: 'Inventeur',
    namePlaceholder: 'Ex. : Noa',
    mascot: 'cogi',
    theme: 'atelier',
    minutes: 25,
    avatar: { hair: 0, outfit: 1, background: 4 },
    blockSize: 6,
    minutesPerBlock: 7,
    diagnosticPerSkill: 1,
    card: { background: 'linear-gradient(160deg, #fff1d6, #ffd2a1 55%, #c9e7e4)', color: '#2e2216', pill: '#b5651d', choiceBg: '#ffffffcc', choiceBorder: '#0001', ghostBorder: '#0002' },
  },
  cm2: {
    defaultName: 'Explorateur',
    namePlaceholder: 'Ex. : Capitaine Max',
    mascot: 'orbi',
    theme: 'academie',
    minutes: 25,
    avatar: { hair: 0, outfit: 3, background: 3 },
    blockSize: 6,
    minutesPerBlock: 7,
    diagnosticPerSkill: 2,
    card: { background: 'linear-gradient(160deg, #18224a, #2b2470 60%, #13405a)', color: '#eef2ff', pill: '#2fbfa9', choiceBg: '#ffffff14', choiceBorder: '#fff2', ghostBorder: '#fff3' },
  },
};
