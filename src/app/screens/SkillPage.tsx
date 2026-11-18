import { useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router';
import { BookOpen, Dumbbell } from 'lucide-react';
import { useProfileCtx } from './ProfileLayout';
import { getRecord, isUnlocked, type BlockKind, type MissionBlock } from '@/adaptive-engine/planner';
import { STATE_LABELS, computeState, isDue, todayISO } from '@/adaptive-engine/mastery';
import { getSkill } from '@/curriculum/registry';
import { SUBJECT_LABELS } from '@/curriculum/types';
import { SubjectBadge } from '@/components/ui';
import { Mascot } from '@/art/Mascot';
import { LEVEL_DEFAULTS } from '@/profiles/levelDefaults';
import { SessionRunner } from '../session/SessionRunner';

export default function SkillPage() {
  const { skillId } = useParams();
  const { profile, level, records, refresh } = useProfileCtx();
  // La séance est figée au démarrage : un nouveau rendu ne doit pas la relancer.
  const [blocks, setBlocks] = useState<MissionBlock[] | null>(null);
  useEffect(() => setBlocks(null), [skillId]);
  const skill = skillId ? getSkill(skillId) : undefined;
  if (!skill || skill.level !== profile.level || !isUnlocked(level, skill, records, profile)) return <Navigate to={`/p/${profile.id}`} replace />;
  const rec = getRecord(records, profile.id, skill.id);
  const state = computeState(rec);
  const kind: BlockKind = state === 'not_started' ? 'new' : rec.needsSupport ? 'support' : isDue(rec, todayISO()) ? 'review' : 'learn';

  const start = (withLesson: boolean) =>
    setBlocks([{ skillId: skill.id, kind, withLesson, alternativeFirst: kind === 'support', count: LEVEL_DEFAULTS[level.id].blockSize }]);

  if (blocks) {
    return (
      <SessionRunner
        profile={profile}
        kind="free"
        title="Entraînement"
        blocks={blocks}
        onComplete={() => void refresh()}
      />
    );
  }
  return (
    <section className="card stack anim-slide" style={{ gap: 18 }} aria-labelledby="skill-title">
      <div className="row" style={{ flexWrap: 'nowrap' }}>
        <SubjectBadge subject={skill.subject} size={56} />
        <div style={{ flex: 1 }}>
          <span className="muted" style={{ fontWeight: 800 }}>
            {SUBJECT_LABELS[skill.subject]} · {skill.domain}
          </span>
          <h1 id="skill-title" style={{ margin: 0, fontSize: 'var(--fs-2xl)' }}>
            {skill.title}
          </h1>
        </div>
        <Mascot id={profile.mascot} size={96} />
      </div>
      <p style={{ fontSize: 'var(--fs-l)', margin: 0 }}>{skill.objective}</p>
      <div className="row">
        <span className="pill pill-primary">{STATE_LABELS[state]}</span>
        {rec.nextReview && <span className="pill">Révision conseillée : {rec.nextReview.split('-').reverse().join('/')}</span>}
      </div>
      <div className="row">
        <button className="btn btn-primary btn-lg" onClick={() => start(true)} autoFocus>
          <BookOpen /> {rec.lessonSeen ? 'Revoir la leçon puis m’entraîner' : 'Découvrir la leçon'}
        </button>
        {rec.lessonSeen && (
          <button className="btn btn-accent btn-lg" onClick={() => start(false)}>
            <Dumbbell /> M’entraîner directement
          </button>
        )}
      </div>
    </section>
  );
}
