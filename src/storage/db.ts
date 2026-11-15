/**
 * Stockage local (IndexedDB via Dexie). Toutes les données restent dans le navigateur.
 * Les données sont séparées par profil grâce à la clé profileId présente dans chaque table.
 *
 * Gestion de versions : chaque évolution du schéma ajoute un `this.version(n)` avec
 * une fonction `upgrade` si des données doivent être transformées. Ne jamais modifier
 * une version déjà publiée.
 */
import Dexie, { type Table } from 'dexie';
import type { SkillRecord } from '@/adaptive-engine/mastery';
import type { Profile } from '@/profiles/types';

export interface AttemptRow {
  id?: number;
  profileId: string;
  skillId: string;
  exerciseId: string;
  correct: boolean;
  hintsUsed: number;
  tries: number;
  ms: number;
  at: string; // ISO date-heure
  day: string; // AAAA-MM-JJ
  context: 'mission' | 'free' | 'game' | 'diagnostic' | 'custom';
  prompt: string;
  given: string;
  expected: string;
  /** Type d'exercice (champ non indexé, ajouté sans changement de schéma). */
  type?: string;
}

export interface SessionRow {
  id?: number;
  profileId: string;
  day: string;
  startedAt: string;
  endedAt: string;
  minutes: number;
  kind: 'mission' | 'free' | 'game' | 'diagnostic' | 'custom';
  answered: number;
  correct: number;
  skills: string[];
}

export interface MetaRow {
  key: string;
  value: unknown;
}

export const DB_NAME = 'nova-academy';
export const SCHEMA_VERSION = 1;

export class NovaDB extends Dexie {
  profiles!: Table<Profile, string>;
  skillRecords!: Table<SkillRecord, [string, string]>;
  attempts!: Table<AttemptRow, number>;
  sessions!: Table<SessionRow, number>;
  meta!: Table<MetaRow, string>;

  constructor(name = DB_NAME) {
    super(name);
    this.version(1).stores({
      profiles: 'id, level',
      skillRecords: '[profileId+skillId], profileId',
      attempts: '++id, profileId, [profileId+day], skillId',
      sessions: '++id, profileId, [profileId+day]',
      meta: 'key',
    });
  }
}

export const db = new NovaDB();

/** Demande au navigateur de ne pas effacer les données en cas de manque d'espace. */
export async function requestPersistence(): Promise<boolean> {
  try {
    if (navigator.storage?.persist) return await navigator.storage.persist();
  } catch {
    /* non supporté */
  }
  return false;
}
