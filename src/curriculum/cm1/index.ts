import type { LevelDefinition } from '../types';
import { cm1Anglais } from './anglais';
import { cm1Francais } from './francais';
import { cm1Maths } from './maths';
import { cm1Monde } from './monde';

export const CM1: LevelDefinition = {
  id: 'cm1',
  label: 'CM1',
  cycle: 'Cycle 3',
  worldName: 'Le Royaume des Inventeurs',
  tagline: 'Un royaume d’ateliers et d’énigmes où chaque découverte devient une invention.',
  ageHint: '9–10 ans',
  defaultSessionMinutes: 25,
  sessionRange: [20, 30],
  subjects: ['francais', 'maths', 'anglais', 'histoire', 'geographie', 'sciences', 'emc', 'arts'],
  regions: [
    { id: 'atelier-nombres', name: 'Atelier des Nombres', subjects: ['maths'], description: 'Engrenages de calculs, fractions, mesures et géométrie.', x: 20, y: 34, color: '#c46a1f' },
    { id: 'tour-mots', name: 'Tour des Mots', subjects: ['francais'], description: 'Lire, conjuguer, accorder, écrire.', x: 50, y: 20, color: '#7b4fc9' },
    { id: 'port-langues', name: 'Port des Langues', subjects: ['anglais'], description: 'Hello! Écouter, parler et comprendre l’anglais.', x: 80, y: 34, color: '#2a8fb8' },
    { id: 'chateau-temps', name: 'Château du Temps', subjects: ['histoire'], description: 'Du Moyen Âge à la Révolution.', x: 22, y: 70, color: '#9c4a3a' },
    { id: 'labo-inventions', name: 'Laboratoire des Inventions', subjects: ['sciences'], description: 'Mélanges, ombres, vivant, cerveau et robots.', x: 50, y: 54, color: '#2a8f8a' },
    { id: 'cartotheque', name: 'Cartothèque', subjects: ['geographie'], description: 'Se nourrir, inégalités, déplacements, Internet.', x: 78, y: 70, color: '#3f8f3a' },
    { id: 'place-conseil', name: 'Place du Conseil', subjects: ['emc', 'arts'], description: 'Citoyenneté, esprit critique, arts et santé.', x: 50, y: 84, color: '#c99a2e' },
  ],
  skills: [...cm1Francais, ...cm1Maths, ...cm1Anglais, ...cm1Monde],
};
