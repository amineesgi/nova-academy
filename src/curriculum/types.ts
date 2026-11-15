/**
 * Modèle de données pédagogique de Nova Academy.
 * Toute la structure est indépendante du niveau : ajouter un niveau (CM1, CE1…)
 * revient à créer un nouveau dossier dans src/curriculum et à l'enregistrer dans registry.ts.
 */

export type LevelId = 'ce2' | 'cm2';

export type SubjectId =
  | 'francais'
  | 'maths'
  | 'anglais'
  | 'qlm'
  | 'histoire'
  | 'geographie'
  | 'sciences'
  | 'emc'
  | 'arts';

export type Difficulty = 1 | 2 | 3;

/** Leçon structurée (voir docs/PEDAGOGIE.md, « structure d'une leçon »). */
export interface Lesson {
  /** 1. Objectif expliqué à l'enfant (« Je vais apprendre à… »). */
  objective: string;
  /** 2. Introduction illustrée (courte mise en situation). */
  intro: string;
  /** 3. Explication simple (paragraphes courts). */
  explanation: string[];
  /** 4. Exemple concret. */
  example: { prompt: string; answer: string };
  /** 5. Démonstration guidée pas à pas. */
  demo: string[];
  /** Bouton « Explique-moi autrement » : explication alternative pré-écrite. */
  alternative: string[];
  /** Petit mémo à retenir (trace écrite). */
  remember: string;
  /** Anglais : vocabulaire illustré à écouter et répéter (audio local). */
  vocab?: VocabCard[];
}

export interface VocabCard {
  en: string;
  fr: string;
  symbol: string;
}

/** Choix visuel facultatif (forme géométrique, fraction, pictogramme). */
export type Visual =
  | { kind: 'shape'; shape: ShapeKind }
  | { kind: 'fraction'; num: number; den: number; style?: 'bar' | 'disc' }
  | { kind: 'picture'; symbol: string; label: string }
  | { kind: 'clock'; h: number; m: number }
  | { kind: 'angle'; deg: number }
  | { kind: 'bars'; title: string; labels: string[]; values: number[]; unit?: string }
  | { kind: 'table'; rows: string[][] }
  | { kind: 'grid'; size: number; points: { x: number; y: number; label: string }[]; axis?: boolean }
  | { kind: 'coins'; cents: number[] }
  | { kind: 'rect'; w: number; h: number; unit: string; squares?: boolean };

export type ShapeKind =
  | 'carre'
  | 'rectangle'
  | 'triangle'
  | 'triangle-rectangle'
  | 'cercle'
  | 'losange'
  | 'hexagone'
  | 'pentagone'
  | 'cube'
  | 'pave'
  | 'cylindre'
  | 'pyramide'
  | 'cone'
  | 'boule';

interface ExerciseBase {
  id: string;
  skillId: string;
  difficulty: Difficulty;
  /** Énoncé. */
  prompt: string;
  /** Texte support (lecture, document, problème). */
  passage?: string;
  /** Visuel illustrant l'énoncé. */
  visual?: Visual;
  /** Indices progressifs. */
  hints: string[];
  /** Explication affichée après la réponse. */
  explanation: string;
}

export type Exercise = ExerciseBase &
  (
    | { type: 'mcq'; choices: string[]; answer: number; choiceVisuals?: Visual[] }
    | { type: 'truefalse'; answer: boolean }
    | { type: 'numeric'; answer: number; unit?: string; decimals?: boolean }
    | {
        type: 'text';
        /** Réponses acceptées (la première est la réponse modèle). */
        answers: string[];
        /** Comparaison stricte des accents (orthographe). Par défaut : true. */
        strictAccents?: boolean;
        placeholder?: string;
      }
    | { type: 'match'; pairs: [string, string][] }
    | {
        type: 'order';
        /** Éléments dans l'ordre correct. */
        items: string[];
        mode: 'sentence' | 'timeline' | 'sequence' | 'number';
      }
    | { type: 'categorize'; categories: string[]; items: { label: string; cat: number }[] }
    | {
        type: 'listen';
        /** Texte anglais lu (fichier audio local généré, voir scripts/generate-audio.ps1). */
        say: string;
        choices: string[];
        answer: number;
        choiceVisuals?: Visual[];
      }
    | { type: 'dictation'; say: string; answers: string[] }
    | { type: 'column'; op: '+' | '-' | '×'; a: number; b: number }
    | { type: 'fraction-build'; num: number; den: number }
    | { type: 'map'; target: string; mapId: 'france' | 'monde' }
    | { type: 'spot'; words: string[]; wrong: number; correction: string }
  );

export type ExerciseType = Exercise['type'];

/** Générateur paramétrique (mathématiques) : produit une variante pour une graine donnée. */
export interface Generator {
  id: string;
  skillId: string;
  difficulty: Difficulty;
  /** Nombre de graines validées automatiquement par les tests (comptées dans l'inventaire). */
  variants: number;
  make: (seed: number) => Exercise;
}

export interface Skill {
  /** Identifiant unique stable, ex. "ce2-ma-num-1000". */
  id: string;
  level: LevelId;
  subject: SubjectId;
  /** Domaine du programme. */
  domain: string;
  title: string;
  /** Objectif pédagogique. */
  objective: string;
  prerequisites: string[];
  difficulty: Difficulty;
  /** Référence au programme officiel applicable en 2026-2027. */
  programRef: string;
  /** Critère de maîtrise lisible par le parent. */
  masteryCriteria: string;
  /** Région de la carte d'aventure. */
  region: string;
  lesson: Lesson;
  exercises: Exercise[];
  generators: Generator[];
  /** Compétence incluse dans le test de positionnement. */
  diagnostic?: boolean;
}

export interface Region {
  id: string;
  name: string;
  subjects: SubjectId[];
  description: string;
  /** Position sur la carte (pourcentages). */
  x: number;
  y: number;
  color: string;
}

export interface LevelDefinition {
  id: LevelId;
  label: string;
  cycle: string;
  worldName: string;
  tagline: string;
  ageHint: string;
  regions: Region[];
  skills: Skill[];
  subjects: SubjectId[];
  /** Durée de séance conseillée (minutes). */
  defaultSessionMinutes: number;
  sessionRange: [number, number];
}

export const SUBJECT_LABELS: Record<SubjectId, string> = {
  francais: 'Français',
  maths: 'Mathématiques',
  anglais: 'Anglais',
  qlm: 'Questionner le monde',
  histoire: 'Histoire',
  geographie: 'Géographie',
  sciences: 'Sciences et technologie',
  emc: 'EMC',
  arts: 'Arts et culture',
};
