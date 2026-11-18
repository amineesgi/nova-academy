/**
 * Mini-jeux éducatifs : chacun a un objectif pédagogique explicite et puise ses questions
 * dans la banque d'exercices du niveau de l'enfant (aucun contenu décoratif).
 */
import { exercisePool } from '@/adaptive-engine/planner';
import type { Exercise, LevelDefinition, Skill, SubjectId } from '@/curriculum/types';
import { shuffle } from '@/utils/rng';

export type GameId = 'course' | 'detective' | 'english' | 'phrases' | 'temps' | 'labo' | 'fractions' | 'coffre';

export interface GameDef {
  id: GameId;
  name: string;
  goal: string;
  description: string;
  color: string;
  subjects: SubjectId[];
}

export const GAMES: GameDef[] = [
  { id: 'course', name: 'La course aux calculs', goal: 'Calcul mental et tables', description: 'Chaque calcul juste fait avancer ton coureur vers l’arrivée. Pas de chrono : prends ton temps !', color: '#2e9fd8', subjects: ['maths'] },
  { id: 'detective', name: 'Le détective des mots', goal: 'Orthographe et accords', description: 'Repère le mot mal écrit dans chaque phrase et découvre la règle.', color: '#e0703c', subjects: ['francais'] },
  { id: 'english', name: 'English Quest', goal: 'Vocabulaire anglais à l’oral', description: 'Retrouve les paires mot-image en écoutant, puis réussis l’épreuve d’écoute.', color: '#3bb37f', subjects: ['anglais'] },
  { id: 'phrases', name: 'La machine à phrases', goal: 'Construire des phrases correctes', description: 'Remets les mots en ordre pour faire fonctionner la machine.', color: '#d65a8c', subjects: ['francais', 'anglais'] },
  { id: 'temps', name: 'L’explorateur du temps', goal: 'Se repérer dans le temps', description: 'Place les événements dans le bon ordre sur la frise.', color: '#b0782f', subjects: ['histoire', 'qlm', 'arts'] },
  { id: 'labo', name: 'Le laboratoire des sciences', goal: 'Démarche et connaissances scientifiques', description: 'Résous les énigmes pour remplir l’éprouvette du laboratoire.', color: '#7a62e0', subjects: ['sciences', 'qlm'] },
  { id: 'fractions', name: 'Le défi des fractions', goal: 'Comprendre et représenter les fractions', description: 'Colorie, reconnais et calcule des fractions.', color: '#d9a73a', subjects: ['maths'] },
  { id: 'coffre', name: 'Le coffre des connaissances', goal: 'Réviser plusieurs compétences', description: 'Réponds juste à 5 questions sur 8 pour ouvrir le coffre et gagner un objet !', color: '#8a6ee8', subjects: [] },
];

function pool(skills: Skill[], seed: number, filter: (e: Exercise) => boolean): Exercise[] {
  return shuffle(skills.flatMap((s) => exercisePool(s, seed)).filter(filter));
}

/** Questions d'un jeu (hors English Quest, qui a sa propre mécanique). */
export function gameQuestions(game: GameId, level: LevelDefinition, practicedSkillIds: string[], unlockedSkillIds: Set<string>): Exercise[] {
  const seed = Math.floor(Math.random() * 100000);
  const sk = (pred: (s: Skill) => boolean) => level.skills.filter((s) => pred(s) && unlockedSkillIds.has(s.id));
  const take = (list: Exercise[], n: number) => list.slice(0, n);
  switch (game) {
    case 'course': {
      const ids = { ce2: ['ce2-ma-mental', 'ce2-ma-tables'], cm1: ['cm1-ma-mental', 'cm1-ma-decimaux', 'cm1-ma-fractions'], cm2: ['cm2-ma-mental', 'cm2-ma-decimaux', 'cm2-ma-fractions'] }[level.id];
      return take(pool(level.skills.filter((s) => ids.includes(s.id)), seed, (e) => e.type === 'numeric' && e.difficulty <= 2), 10);
    }
    case 'detective':
      return take(pool(sk((s) => s.subject === 'francais'), seed, (e) => e.type === 'spot'), 6);
    case 'english':
      return take(pool(sk((s) => s.subject === 'anglais'), seed, (e) => e.type === 'listen'), 6);
    case 'phrases':
      return take(pool(sk((s) => s.subject === 'francais' || s.subject === 'anglais'), seed, (e) => e.type === 'order' && (e.mode === 'sentence' || e.items.every((w) => w.split(' ').length < 7))), 6);
    case 'temps':
      return take(pool(sk((s) => ['histoire', 'qlm', 'arts', 'sciences', 'francais'].includes(s.subject)), seed, (e) => e.type === 'order' && (e.mode === 'timeline' || e.mode === 'sequence')), 5);
    case 'labo':
      return take(pool(sk((s) => s.subject === 'sciences' || s.subject === 'qlm'), seed, (e) => ['mcq', 'truefalse', 'categorize', 'numeric'].includes(e.type)), 6);
    case 'fractions': {
      const ids = { ce2: ['ce2-ma-fractions'], cm1: ['cm1-ma-fractions', 'cm1-ma-decimaux'], cm2: ['cm2-ma-fractions', 'cm2-ma-decimaux'] }[level.id];
      return take(pool(level.skills.filter((s) => ids.includes(s.id)), seed, (e) => e.type === 'fraction-build' || e.visual?.kind === 'fraction' || /fraction|\/\d/.test(e.prompt)), 6);
    }
    case 'coffre': {
      const base = practicedSkillIds.length >= 3 ? level.skills.filter((s) => practicedSkillIds.includes(s.id)) : sk(() => true);
      const perSkill = shuffle(base).slice(0, 8).map((s) => shuffle(exercisePool(s, seed).filter((e) => e.type !== 'dictation'))[0]);
      return perSkill.filter((e) => e !== undefined) as Exercise[];
    }
  }
}
