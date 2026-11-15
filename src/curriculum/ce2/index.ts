import type { LevelDefinition } from '../types';
import { ce2Anglais } from './anglais';
import { ce2Francais } from './francais';
import { ce2Maths } from './maths';
import { ce2Monde } from './monde';

export const CE2: LevelDefinition = {
  id: 'ce2',
  label: 'CE2',
  cycle: 'Cycle 2',
  worldName: 'Le Jardin des Savoirs',
  tagline: 'Un jardin magique où chaque graine de savoir devient une fleur.',
  ageHint: '8–9 ans',
  defaultSessionMinutes: 20,
  sessionRange: [15, 25],
  subjects: ['francais', 'maths', 'anglais', 'qlm', 'emc', 'arts'],
  regions: [
    { id: 'foret-nombres', name: 'Forêt des Nombres', subjects: ['maths'], description: 'Calculs, mesures et formes parmi les grands arbres.', x: 24, y: 34, color: '#3fa66b' },
    { id: 'bibliotheque-mots', name: 'Bibliothèque des Mots', subjects: ['francais'], description: 'Lecture, grammaire, conjugaison et dictées.', x: 70, y: 26, color: '#d9733b' },
    { id: 'vallee-anglais', name: 'Vallée de l’Anglais', subjects: ['anglais'], description: 'Hello! Mots, sons et petits dialogues.', x: 50, y: 58, color: '#4a8fd9' },
    { id: 'jardin-sciences', name: 'Jardin des Sciences', subjects: ['qlm'], description: 'Le vivant, la matière, les objets, le temps et l’espace.', x: 22, y: 74, color: '#8c6ad1' },
    { id: 'ile-decouvertes', name: 'Île des Découvertes', subjects: ['emc', 'arts'], description: 'Vivre ensemble, arts, musique et santé.', x: 78, y: 72, color: '#e0b43c' },
  ],
  skills: [...ce2Francais, ...ce2Maths, ...ce2Anglais, ...ce2Monde],
};
