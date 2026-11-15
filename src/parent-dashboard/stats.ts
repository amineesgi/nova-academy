/** Calculs des statistiques de l'espace parent, à partir des vraies données enregistrées. */
import { accuracy, addDays, computeState, todayISO, type SkillState } from '@/adaptive-engine/mastery';
import type { RecordMap } from '@/adaptive-engine/planner';
import type { LevelDefinition, SubjectId } from '@/curriculum/types';
import type { AttemptRow, SessionRow } from '@/storage/db';

export function mondayOf(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number) as [number, number, number];
  const date = new Date(y, m - 1, d);
  const delta = (date.getDay() + 6) % 7;
  return addDays(iso, -delta);
}

export interface WeekStat {
  week: string; // lundi AAAA-MM-JJ
  minutes: number;
  sessions: number;
  answered: number;
  correct: number;
}

export function weeklyStats(sessions: SessionRow[], attempts: AttemptRow[], weeks = 8, today = todayISO()): WeekStat[] {
  const start = mondayOf(today);
  const list: WeekStat[] = Array.from({ length: weeks }, (_, i) => ({ week: addDays(start, -7 * (weeks - 1 - i)), minutes: 0, sessions: 0, answered: 0, correct: 0 }));
  const idx = new Map(list.map((w, i) => [w.week, i]));
  for (const s of sessions) {
    const i = idx.get(mondayOf(s.day));
    if (i !== undefined) {
      list[i]!.minutes += s.minutes;
      list[i]!.sessions += 1;
    }
  }
  for (const a of attempts) {
    const i = idx.get(mondayOf(a.day));
    if (i !== undefined) {
      list[i]!.answered += 1;
      if (a.correct) list[i]!.correct += 1;
    }
  }
  return list;
}

export interface SubjectStat {
  subject: SubjectId;
  answered: number;
  correct: number;
  skills: number;
  consolidated: number;
}

export function subjectStats(level: LevelDefinition, attempts: AttemptRow[], records: RecordMap, profileId: string): SubjectStat[] {
  const bySkill = new Map(level.skills.map((s) => [s.id, s.subject]));
  return level.subjects.map((subject) => {
    const att = attempts.filter((a) => bySkill.get(a.skillId) === subject);
    const skills = level.skills.filter((s) => s.subject === subject);
    return {
      subject,
      answered: att.length,
      correct: att.filter((a) => a.correct).length,
      skills: skills.length,
      consolidated: skills.filter((s) => {
        const r = records.get(s.id);
        return r && r.profileId === profileId && ['consolidate', 'mastered'].includes(computeState(r));
      }).length,
    };
  });
}

export function stateDistribution(level: LevelDefinition, records: RecordMap): Record<SkillState, number> {
  const out: Record<SkillState, number> = { not_started: 0, discovery: 0, learning: 0, consolidate: 0, mastered: 0 };
  for (const s of level.skills) {
    const r = records.get(s.id);
    out[r ? computeState(r) : 'not_started'] += 1;
  }
  return out;
}

export interface Recommendation {
  skillId: string;
  reason: string;
}

/** Recommandations lisibles : difficultés persistantes, révisions en retard, matières délaissées. */
export function recommendations(level: LevelDefinition, records: RecordMap, attempts: AttemptRow[], today = todayISO()): Recommendation[] {
  const out: Recommendation[] = [];
  for (const s of level.skills) {
    const r = records.get(s.id);
    if (!r) continue;
    if (r.needsSupport) out.push({ skillId: s.id, reason: `Difficulté repérée (réussite récente ${Math.round(accuracy(r) * 100)} %) : revoir la leçon ensemble, avec l’explication alternative.` });
    else if (r.nextReview && r.nextReview < addDays(today, -3)) out.push({ skillId: s.id, reason: 'Révision en retard de plus de 3 jours.' });
  }
  const recent = new Set(attempts.filter((a) => a.day >= addDays(today, -14)).map((a) => level.skills.find((s) => s.id === a.skillId)?.subject));
  for (const subj of level.subjects) {
    if (!recent.has(subj)) {
      const first = level.skills.find((s) => s.subject === subj);
      if (first) out.push({ skillId: first.id, reason: 'Matière non travaillée depuis 2 semaines : pensez à l’inclure (planning ou séance personnalisée).' });
    }
  }
  return out.slice(0, 8);
}
