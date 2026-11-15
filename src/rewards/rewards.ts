/**
 * Gamification : points d'expérience, niveaux, étoiles, badges et objets cosmétiques.
 * Principes : on valorise l'effort, la persévérance et la régularité ; aucune punition,
 * aucun tirage aléatoire, aucun classement entre enfants.
 */
import type { Rewards } from '@/profiles/types';

export const XP = { correctFirst: 10, correctLater: 6, effort: 2, blockDone: 15, missionDone: 40, lessonDone: 8 } as const;

/** XP total nécessaire pour atteindre le niveau L : 50 × L × (L − 1). Niveau 1 = 0 XP. */
export function xpForLevel(level: number): number {
  return 50 * level * (level - 1);
}

export function levelFromXp(xp: number): { level: number; into: number; span: number } {
  let level = 1;
  while (xp >= xpForLevel(level + 1)) level++;
  const start = xpForLevel(level);
  const span = xpForLevel(level + 1) - start;
  return { level, into: xp - start, span };
}

/** Étoiles d'un bloc : 1 pour l'avoir terminé, +1 si ≥ 60 %, +1 si ≥ 85 %. */
export function starsForBlock(score: number): number {
  return 1 + (score >= 0.6 ? 1 : 0) + (score >= 0.85 ? 1 : 0);
}

export interface Cosmetic {
  id: string;
  label: string;
  kind: 'accessory' | 'background' | 'map';
  /** Niveau requis (déblocage déterministe). */
  level?: number;
  /** Ou nombre de coffres ouverts. */
  chests?: number;
}

export const COSMETICS: Cosmetic[] = [
  { id: 'acc-lunettes', label: 'Lunettes rondes', kind: 'accessory', level: 2 },
  { id: 'acc-casquette', label: 'Casquette', kind: 'accessory', level: 3 },
  { id: 'acc-couronne', label: 'Couronne de fleurs', kind: 'accessory', level: 4 },
  { id: 'acc-casque', label: 'Casque d’explorateur', kind: 'accessory', level: 5 },
  { id: 'acc-etoile', label: 'Barrette étoile', kind: 'accessory', chests: 1 },
  { id: 'acc-echarpe', label: 'Écharpe', kind: 'accessory', level: 6 },
  { id: 'acc-cape', label: 'Cape de savant', kind: 'accessory', chests: 3 },
  { id: 'acc-headset', label: 'Casque audio', kind: 'accessory', level: 8 },
  { id: 'bg-6', label: 'Fond aurore', kind: 'background', level: 3 },
  { id: 'bg-7', label: 'Fond galaxie', kind: 'background', level: 5 },
  { id: 'bg-8', label: 'Fond arc-en-ciel', kind: 'background', chests: 2 },
  { id: 'map-lanternes', label: 'Lanternes sur la carte', kind: 'map', level: 4 },
  { id: 'map-etoiles', label: 'Étoiles filantes sur la carte', kind: 'map', chests: 4 },
];

export function unlockedCosmetics(r: Rewards): string[] {
  const { level } = levelFromXp(r.xp);
  return COSMETICS.filter((c) => (c.level !== undefined && level >= c.level) || (c.chests !== undefined && r.chests >= c.chests)).map((c) => c.id);
}

export interface BadgeStats {
  answered: number;
  correct: number;
  /** Réussites obtenues juste après une erreur sur le même exercice (persévérance). */
  comebacks: number;
  missions: number;
  activeDays: number;
  mastered: number;
  subjectsTried: number;
  lessons: number;
  games: number;
  chests: number;
  listened: number;
}

export interface Badge {
  id: string;
  label: string;
  description: string;
  value: 'persévérance' | 'progrès' | 'régularité' | 'maîtrise' | 'curiosité';
  test: (s: BadgeStats) => boolean;
}

export const BADGES: Badge[] = [
  { id: 'premier-pas', label: 'Premier pas', description: 'Répondre à sa toute première question.', value: 'progrès', test: (s) => s.answered >= 1 },
  { id: 'premiere-mission', label: 'Première mission', description: 'Terminer une mission du jour.', value: 'progrès', test: (s) => s.missions >= 1 },
  { id: 'tenace', label: 'Tenace', description: 'Réussir 5 fois après s’être trompé.', value: 'persévérance', test: (s) => s.comebacks >= 5 },
  { id: 'roc', label: 'Solide comme un roc', description: 'Réussir 25 fois après s’être trompé.', value: 'persévérance', test: (s) => s.comebacks >= 25 },
  { id: 'regulier-3', label: 'Bon rythme', description: 'Travailler 3 jours différents (pas forcément d’affilée).', value: 'régularité', test: (s) => s.activeDays >= 3 },
  { id: 'regulier-10', label: 'Habitude d’explorateur', description: 'Travailler 10 jours différents.', value: 'régularité', test: (s) => s.activeDays >= 10 },
  { id: 'regulier-30', label: 'Fidèle au poste', description: 'Travailler 30 jours différents.', value: 'régularité', test: (s) => s.activeDays >= 30 },
  { id: 'maitre-1', label: 'Première maîtrise', description: 'Consolider une compétence.', value: 'maîtrise', test: (s) => s.mastered >= 1 },
  { id: 'maitre-5', label: 'Cinq savoirs', description: 'Consolider 5 compétences.', value: 'maîtrise', test: (s) => s.mastered >= 5 },
  { id: 'maitre-15', label: 'Grand savant', description: 'Consolider 15 compétences.', value: 'maîtrise', test: (s) => s.mastered >= 15 },
  { id: 'curieux', label: 'Esprit curieux', description: 'Essayer 4 matières différentes.', value: 'curiosité', test: (s) => s.subjectsTried >= 4 },
  { id: 'lecteur', label: 'Élève attentif', description: 'Suivre 10 leçons complètes.', value: 'progrès', test: (s) => s.lessons >= 10 },
  { id: 'joueur', label: 'As des défis', description: 'Terminer 5 mini-jeux.', value: 'curiosité', test: (s) => s.games >= 5 },
  { id: 'coffre', label: 'Gardien du coffre', description: 'Ouvrir un coffre des connaissances.', value: 'progrès', test: (s) => s.chests >= 1 },
  { id: 'oreille', label: 'Oreille fine', description: 'Réussir 20 exercices d’écoute en anglais.', value: 'progrès', test: (s) => s.listened >= 20 },
  { id: 'cent', label: 'Cent réponses justes', description: 'Atteindre 100 bonnes réponses.', value: 'progrès', test: (s) => s.correct >= 100 },
];

export function newBadges(current: Rewards, stats: BadgeStats, date: string): { id: string; at: string }[] {
  const owned = new Set(current.badges.map((b) => b.id));
  return BADGES.filter((b) => !owned.has(b.id) && b.test(stats)).map((b) => ({ id: b.id, at: date }));
}
