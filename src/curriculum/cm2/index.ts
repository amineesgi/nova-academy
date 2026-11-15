import type { LevelDefinition } from '../types';
import { cm2Anglais } from './anglais';
import { cm2Francais } from './francais';
import { cm2Maths } from './maths';
import { cm2Monde } from './monde';

export const CM2: LevelDefinition = {
  id: 'cm2',
  label: 'CM2',
  cycle: 'Cycle 3',
  worldName: 'L’Académie des Explorateurs',
  tagline: 'Une académie d’aventuriers où chaque savoir ouvre une nouvelle expédition.',
  ageHint: '10–11 ans',
  defaultSessionMinutes: 25,
  sessionRange: [20, 30],
  subjects: ['francais', 'maths', 'anglais', 'histoire', 'geographie', 'sciences', 'emc', 'arts'],
  regions: [
    { id: 'labo-maths', name: 'Laboratoire des Maths', subjects: ['maths'], description: 'Nombres, calculs, mesures, géométrie et données.', x: 20, y: 30, color: '#3aa0d8' },
    { id: 'citadelle-francais', name: 'Citadelle du Français', subjects: ['francais'], description: 'Lire, analyser, conjuguer, écrire.', x: 50, y: 18, color: '#d8603a' },
    { id: 'english-station', name: 'English Station', subjects: ['anglais'], description: 'Listen, speak, read: let’s go!', x: 80, y: 30, color: '#3ac08c' },
    { id: 'portail-histoire', name: 'Portail de l’Histoire', subjects: ['histoire'], description: 'De la République à l’Europe.', x: 22, y: 70, color: '#b0782f' },
    { id: 'observatoire-sciences', name: 'Observatoire des Sciences', subjects: ['sciences'], description: 'Matière, énergie, vivant, Terre et technique.', x: 50, y: 52, color: '#7a62e0' },
    { id: 'atlas-geo', name: 'Atlas de Géographie', subjects: ['geographie'], description: 'Cartes, déplacements, Internet, mieux habiter.', x: 78, y: 70, color: '#2fa3a0' },
    { id: 'agora', name: 'Agora des Citoyens', subjects: ['emc', 'arts'], description: 'Citoyenneté, esprit critique, arts et santé.', x: 50, y: 84, color: '#d9a73a' },
  ],
  skills: [...cm2Francais, ...cm2Maths, ...cm2Anglais, ...cm2Monde],
};
