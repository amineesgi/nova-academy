/**
 * Planificateur : prépare la « mission du jour » et choisit les exercices.
 * Entièrement local et déterministe à données égales (hors tirage des variantes).
 */
import type { Exercise, LevelDefinition, Skill, SubjectId } from '@/curriculum/types';
import type { Profile } from '@/profiles/types';
import { accuracy, computeState, emptyRecord, isDue, type SkillRecord, type SkillState } from './mastery';

export type BlockKind = 'new' | 'learn' | 'review' | 'support' | 'prerequisite';

export interface MissionBlock {
  skillId: string;
  kind: BlockKind;
  /** Afficher la leçon avant les exercices. */
  withLesson: boolean;
  /** Commencer par l'explication alternative (« explique-moi autrement »). */
  alternativeFirst: boolean;
  count: number;
}

export const BLOCK_LABELS: Record<BlockKind, string> = {
  new: 'Nouvelle découverte',
  learn: 'Entraînement',
  review: 'Révision',
  support: 'On reprend ensemble',
  prerequisite: 'Retour aux bases',
};

export type RecordMap = Map<string, SkillRecord>;

export function getRecord(map: RecordMap, profileId: string, skillId: string): SkillRecord {
  return map.get(skillId) ?? emptyRecord(profileId, skillId);
}

export function stateOf(map: RecordMap, profileId: string, skillId: string): SkillState {
  return computeState(getRecord(map, profileId, skillId));
}

const STARTED: SkillState[] = ['learning', 'consolidate', 'mastered'];

/** Une compétence est accessible si ses prérequis sont au moins « en apprentissage ». */
export function isUnlocked(level: LevelDefinition, skill: Skill, map: RecordMap, profile: Profile): boolean {
  if (profile.plan.freeExplore) return true;
  const regionSkills = level.skills.filter((s) => s.region === skill.region);
  if (regionSkills[0]?.id === skill.id) return true;
  if (getRecord(map, profile.id, skill.id).attempts > 0) return true;
  if (skill.prerequisites.length === 0) {
    // Sans prérequis explicite : on ouvre dès que la compétence précédente de la région est commencée.
    const idx = regionSkills.findIndex((s) => s.id === skill.id);
    const prev = regionSkills[idx - 1];
    return !prev || getRecord(map, profile.id, prev.id).attempts > 0;
  }
  return skill.prerequisites.every((p) => STARTED.includes(stateOf(map, profile.id, p)));
}

/** Matières du jour : rotation régulière sur les matières choisies, priorités en tête. */
export function subjectsForDay(profile: Profile, level: LevelDefinition, date: Date): SubjectId[] {
  const chosen = level.subjects.filter((s) => profile.plan.subjects.includes(s));
  const core: SubjectId[] = ['francais', 'maths'];
  const others = chosen.filter((s) => !core.includes(s));
  const dayIndex = Math.floor(date.getTime() / 86_400_000);
  const rotating = others.length ? [others[dayIndex % others.length] as SubjectId] : [];
  const englishDaily = others.includes('anglais') && dayIndex % 2 === 0 ? ['anglais' as SubjectId] : [];
  const list = [...profile.plan.priorities.filter((p) => chosen.includes(p)), ...core.filter((c) => chosen.includes(c)), ...englishDaily, ...rotating];
  return [...new Set(list)];
}

export function blockCountFor(minutes: number, level: LevelDefinition): number {
  const perBlock = level.id === 'ce2' ? 6 : 7;
  return Math.max(2, Math.min(5, Math.round(minutes / perBlock)));
}

/**
 * Construit la mission du jour.
 * Ordre de priorité : 1) difficultés (avec retour aux prérequis), 2) révisions échues,
 * 3) compétences en cours, 4) nouvelles compétences des matières du jour.
 */
export function buildDailyMission(
  level: LevelDefinition,
  profile: Profile,
  map: RecordMap,
  date: Date,
  today: string,
  open?: Set<string>,
): MissionBlock[] {
  const allowed = new Set(profile.plan.subjects);
  const skills = level.skills.filter((s) => allowed.has(s.subject) && (!open || open.has(s.region)));
  const n = blockCountFor(profile.plan.minutes, level);
  const blocks: MissionBlock[] = [];
  const used = new Set<string>();
  const perSubject = new Map<SubjectId, number>();
  const bySkill = new Map(level.skills.map((s) => [s.id, s]));
  const count = level.id === 'ce2' ? 5 : 6;

  const push = (skill: Skill, kind: BlockKind) => {
    if (blocks.length >= n || used.has(skill.id)) return;
    const c = perSubject.get(skill.subject) ?? 0;
    if (c >= 2 && !profile.plan.priorities.includes(skill.subject)) return;
    used.add(skill.id);
    perSubject.set(skill.subject, c + 1);
    const rec = getRecord(map, profile.id, skill.id);
    blocks.push({
      skillId: skill.id,
      kind,
      withLesson: kind === 'new' || kind === 'support' || kind === 'prerequisite' || !rec.lessonSeen,
      alternativeFirst: kind === 'support',
      count,
    });
  };

  // 1. Difficultés : on vérifie d'abord les prérequis fragiles.
  for (const s of skills) {
    const rec = getRecord(map, profile.id, s.id);
    if (!rec.needsSupport) continue;
    const weakPrereq = s.prerequisites
      .map((p) => bySkill.get(p))
      .find((p): p is Skill => !!p && ['not_started', 'discovery', 'learning'].includes(stateOf(map, profile.id, p.id)));
    if (weakPrereq) push(weakPrereq, 'prerequisite');
    push(s, 'support');
  }
  // 2. Révisions échues, les plus anciennes d'abord.
  skills
    .map((s) => ({ s, rec: getRecord(map, profile.id, s.id) }))
    .filter(({ rec }) => isDue(rec, today))
    .sort((a, b) => (a.rec.nextReview ?? '').localeCompare(b.rec.nextReview ?? ''))
    .forEach(({ s }) => push(s, 'review'));

  const daySubjects = subjectsForDay(profile, level, date);
  // 3. Compétences en cours dans les matières du jour, puis ailleurs.
  const inProgress = skills
    .filter((s) => ['discovery', 'learning', 'consolidate'].includes(stateOf(map, profile.id, s.id)))
    .filter((s) => !isDue(getRecord(map, profile.id, s.id), today) || used.has(s.id));
  const sortByDay = (a: Skill, b: Skill) => rank(daySubjects, a.subject) - rank(daySubjects, b.subject);
  inProgress
    .filter((s) => stateOf(map, profile.id, s.id) !== 'consolidate' || accuracy(getRecord(map, profile.id, s.id)) < 0.85)
    .sort(sortByDay)
    .slice(0, Math.ceil(n / 2))
    .forEach((s) => push(s, 'learn'));
  // 4. Nouvelles compétences accessibles, dans l'ordre du programme.
  for (const subj of daySubjects) {
    const next = skills.find((s) => s.subject === subj && stateOf(map, profile.id, s.id) === 'not_started' && isUnlocked(level, s, map, profile));
    if (next) push(next, 'new');
  }
  // 5. Compléter si nécessaire.
  for (const s of [...skills].sort(sortByDay)) {
    if (blocks.length >= n) break;
    const st = stateOf(map, profile.id, s.id);
    if (st === 'not_started' && isUnlocked(level, s, map, profile)) push(s, 'new');
    else if (st !== 'not_started' && st !== 'mastered') push(s, 'learn');
  }
  return blocks;
}

function rank(list: SubjectId[], s: SubjectId): number {
  const i = list.indexOf(s);
  return i === -1 ? 99 : i;
}

/** Toutes les variantes disponibles pour une compétence (écrites + générées). */
export function exercisePool(skill: Skill, seedBase: number): Exercise[] {
  const generated = skill.generators.flatMap((g) =>
    Array.from({ length: 3 }, (_, k) => g.make(seedBase + k * 7919 + g.id.length)),
  );
  return [...skill.exercises, ...generated];
}

/**
 * Sélection des exercices d'un bloc :
 *  - la première question est toujours facile ;
 *  - difficulté cible selon le type de bloc et la réussite récente ;
 *  - on évite les exercices vus récemment.
 */
export function pickExercises(skill: Skill, rec: SkillRecord, kind: BlockKind, n: number, seedBase = Date.now() % 100000): Exercise[] {
  const pool = exercisePool(skill, seedBase);
  const acc = accuracy(rec);
  const target: number[] =
    kind === 'support' || kind === 'prerequisite'
      ? [1, 1, 1, 2, 2, 2]
      : kind === 'new'
        ? [1, 1, 2, 2, 3, 3]
        : kind === 'review'
          ? [1, 2, 2, 3, 3, 3]
          : acc < 0.6
            ? [1, 1, 2, 2, 2, 3]
            : [1, 2, 3, 3, 3, 3];
  const seen = new Set(rec.seen);
  const chosen: Exercise[] = [];
  const takenIds = new Set<string>();
  for (let i = 0; i < n; i++) {
    const want = target[Math.min(i, target.length - 1)] ?? 2;
    const candidates = pool
      .filter((e) => !takenIds.has(e.id))
      .map((e) => ({
        e,
        cost: Math.abs(e.difficulty - want) * 10 + (seen.has(e.id) ? 5 : 0) + (i === 0 && e.difficulty > 1 ? 30 : 0) + randomJitter(e.id, seedBase),
      }))
      .sort((a, b) => a.cost - b.cost);
    const best = candidates[0]?.e;
    if (!best) break;
    chosen.push(best);
    takenIds.add(best.id);
  }
  return chosen;
}

function randomJitter(id: string, seed: number): number {
  let h = seed;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return (h % 1000) / 250; // 0..4
}
