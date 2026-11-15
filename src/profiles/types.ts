import type { LevelId, SubjectId } from '@/curriculum/types';

export interface AvatarConfig {
  skin: number;
  hair: number;
  hairColor: number;
  outfit: number;
  accessory: string | null;
  background: number;
}

export type MascotId = 'pip' | 'luma' | 'orbi' | 'kip';
export type ThemeId = 'jardin' | 'aurore' | 'ocean' | 'academie' | 'cosmos' | 'volcan';

export interface ProfileSettings {
  /** Échelle du texte : 1 (normal) à 1.3. */
  textScale: number;
  reducedMotion: boolean;
  soundEffects: boolean;
  /** Navigation simple en liste plutôt que la carte. */
  listMode: boolean;
}

export interface WeeklyPlan {
  /** Jours de révision : index 0 = lundi … 6 = dimanche. */
  days: boolean[];
  minutes: number;
  /** Matières incluses dans les missions. */
  subjects: SubjectId[];
  /** Matières prioritaires (plus souvent proposées). */
  priorities: SubjectId[];
  /** Le parent autorise l'exploration libre de toutes les compétences. */
  freeExplore: boolean;
}

export interface CustomSession {
  id: string;
  title: string;
  skillIds: string[];
  createdAt: string;
  done: boolean;
}

export interface Rewards {
  xp: number;
  stars: number;
  badges: { id: string; at: string }[];
  cosmetics: string[];
  /** Coffres ouverts (mini-jeu du coffre des connaissances). */
  chests: number;
}

export interface Profile {
  id: string;
  level: LevelId;
  name: string;
  avatar: AvatarConfig;
  mascot: MascotId;
  theme: ThemeId;
  createdAt: string;
  settings: ProfileSettings;
  plan: WeeklyPlan;
  rewards: Rewards;
  diagnosticDone: boolean;
  activeDays: string[];
  customSessions: CustomSession[];
  /** Dernière mission terminée (date) pour ne pas la reproposer le même jour. */
  lastMissionDate: string | null;
}

export const DEFAULT_SUBJECTS: Record<LevelId, SubjectId[]> = {
  ce2: ['francais', 'maths', 'anglais', 'qlm', 'emc', 'arts'],
  cm2: ['francais', 'maths', 'anglais', 'histoire', 'geographie', 'sciences', 'emc', 'arts'],
};
