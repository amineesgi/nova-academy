/**
 * Moteur adaptatif — modèle de maîtrise d'une compétence.
 *
 * Algorithme transparent (documenté dans docs/MOTEUR_ADAPTATIF.md) :
 *  - chaque réponse produit une « qualité » : 1 (juste sans indice), 0.5 (juste avec indice
 *    ou au 2e essai), 0 (erreur) ;
 *  - on conserve les 8 dernières qualités (fenêtre glissante) ;
 *  - l'état découle de règles lisibles (nombre de réponses, taux de réussite récent,
 *    nombre de jours distincts de pratique, révision réussie) ;
 *  - les révisions sont espacées par « boîtes » (système de Leitner) : 1, 3, 7, 14, 30 jours.
 * Ce n'est PAS une mesure scientifique du niveau : c'est un outil d'orientation des révisions.
 */

export type SkillState = 'not_started' | 'discovery' | 'learning' | 'consolidate' | 'mastered';

export const STATE_LABELS: Record<SkillState, string> = {
  not_started: 'Non commencée',
  discovery: 'En découverte',
  learning: 'En apprentissage',
  consolidate: 'À consolider',
  mastered: 'Maîtrisée provisoirement',
};

export const STATE_ORDER: SkillState[] = ['not_started', 'discovery', 'learning', 'consolidate', 'mastered'];

export interface SkillRecord {
  profileId: string;
  skillId: string;
  attempts: number;
  correct: number;
  hintsUsed: number;
  /** Fenêtre glissante des 8 dernières qualités (0, 0.5, 1). */
  recent: number[];
  /** Erreurs consécutives (sert à détecter une difficulté répétée). */
  errorStreak: number;
  /** Boîte de Leitner (0 = jamais révisée, 1..5). */
  box: number;
  /** Date (AAAA-MM-JJ) de la prochaine révision conseillée. */
  nextReview: string | null;
  lastPracticed: string | null;
  /** Jours distincts de pratique (10 derniers). */
  days: string[];
  lessonSeen: boolean;
  reviewsPassed: number;
  /** Difficulté détectée : la prochaine séance repassera par une explication et des exercices guidés. */
  needsSupport: boolean;
  /** Identifiants des derniers exercices vus (évite les répétitions immédiates). */
  seen: string[];
}

export const REVIEW_INTERVALS = [0, 1, 3, 7, 14, 30];
export const WINDOW = 8;

export function emptyRecord(profileId: string, skillId: string): SkillRecord {
  return {
    profileId,
    skillId,
    attempts: 0,
    correct: 0,
    hintsUsed: 0,
    recent: [],
    errorStreak: 0,
    box: 0,
    nextReview: null,
    lastPracticed: null,
    days: [],
    lessonSeen: false,
    reviewsPassed: 0,
    needsSupport: false,
    seen: [],
  };
}

export function todayISO(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function addDays(iso: string, n: number): string {
  const [y, m, d] = iso.split('-').map(Number) as [number, number, number];
  return todayISO(new Date(y, m - 1, d + n));
}

export function accuracy(rec: SkillRecord): number {
  if (rec.recent.length === 0) return 0;
  return rec.recent.reduce((a, b) => a + b, 0) / rec.recent.length;
}

export function computeState(rec: SkillRecord): SkillState {
  if (rec.attempts === 0) return rec.lessonSeen ? 'discovery' : 'not_started';
  if (rec.attempts < 4) return 'discovery';
  const acc = accuracy(rec);
  if (acc >= 0.85 && rec.attempts >= 6 && rec.days.length >= 2 && rec.reviewsPassed >= 1) return 'mastered';
  if (acc >= 0.6) return 'consolidate';
  return 'learning';
}

export interface AttemptOutcome {
  correct: boolean;
  hintsUsed: number;
  /** Numéro de l'essai (1 = premier essai). */
  tryNumber: number;
  exerciseId: string;
  date: string;
}

export function quality(o: Pick<AttemptOutcome, 'correct' | 'hintsUsed' | 'tryNumber'>): number {
  if (!o.correct) return 0;
  return o.hintsUsed === 0 && o.tryNumber === 1 ? 1 : 0.5;
}

/** Met à jour un enregistrement après une réponse (fonction pure). */
export function applyAttempt(rec: SkillRecord, o: AttemptOutcome): SkillRecord {
  const q = quality(o);
  const recent = [...rec.recent, q].slice(-WINDOW);
  const days = rec.days.includes(o.date) ? rec.days : [...rec.days, o.date].slice(-10);
  const errorStreak = o.correct ? 0 : rec.errorStreak + 1;
  return {
    ...rec,
    attempts: rec.attempts + 1,
    correct: rec.correct + (o.correct ? 1 : 0),
    hintsUsed: rec.hintsUsed + o.hintsUsed,
    recent,
    days,
    errorStreak,
    lastPracticed: o.date,
    needsSupport: rec.needsSupport || errorStreak >= 3,
    seen: [...rec.seen.filter((id) => id !== o.exerciseId), o.exerciseId].slice(-20),
  };
}

export interface BlockSummary {
  /** Proportion de réponses justes du bloc (0..1), pondérée par la qualité. */
  score: number;
  answered: number;
  /** Le bloc était une révision programmée (échéance atteinte). */
  wasReview: boolean;
  date: string;
}

/** Fin d'un bloc d'exercices sur une compétence : programmation de la prochaine révision. */
export function applyBlock(rec: SkillRecord, b: BlockSummary): SkillRecord {
  if (b.answered === 0) return rec;
  let box = rec.box;
  let reviewsPassed = rec.reviewsPassed;
  let needsSupport = rec.needsSupport;
  if (b.score >= 0.8) {
    box = Math.min(5, Math.max(1, box + 1));
    if (b.wasReview) reviewsPassed += 1;
    needsSupport = false;
  } else if (b.score >= 0.5) {
    box = Math.max(1, box);
  } else {
    box = 1;
    needsSupport = true;
  }
  return {
    ...rec,
    box,
    reviewsPassed,
    needsSupport,
    nextReview: addDays(b.date, REVIEW_INTERVALS[box] ?? 1),
  };
}

export function isDue(rec: SkillRecord, today: string): boolean {
  return rec.nextReview !== null && rec.nextReview <= today;
}
