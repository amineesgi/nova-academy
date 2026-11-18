/**
 * Test de positionnement : quelques questions par compétence clé, sans note ni chronomètre.
 * Il oriente les premières missions (révision programmée sur les points à revoir) et ne
 * fige jamais l'enfant dans un niveau : tout évolue ensuite avec ses réponses.
 */
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowRight, HelpCircle, Sparkles } from 'lucide-react';
import { useProfileCtx } from './ProfileLayout';
import { exercisePool } from '@/adaptive-engine/planner';
import { todayISO, emptyRecord } from '@/adaptive-engine/mastery';
import { getSkill } from '@/curriculum/registry';
import type { Exercise } from '@/curriculum/types';
import { SUBJECT_LABELS } from '@/curriculum/types';
import { ExercisePlayer, type ExerciseOutcome } from '@/exercises/ExercisePlayer';
import { expectedAnswer } from '@/exercises/check';
import { Mascot } from '@/art/Mascot';
import { ProgressBar, SubjectBadge } from '@/components/ui';
import { db } from '@/storage/db';
import { recordAttempt, saveProfile } from '@/storage/repo';
import { grantRewards } from '@/progression/progress';
import { LEVEL_DEFAULTS } from '@/profiles/levelDefaults';

export default function Diagnostic() {
  const { profile, level, refresh } = useProfileCtx();
  const nav = useNavigate();
  const [started, setStarted] = useState(false);
  const [i, setI] = useState(0);
  const [results, setResults] = useState<{ skillId: string; ok: boolean }[]>([]);
  const [done, setDone] = useState(false);

  const questions = useMemo(() => {
    const perSkill = LEVEL_DEFAULTS[level.id].diagnosticPerSkill;
    const seed = Date.now() % 9973;
    return level.skills
      .filter((s) => s.diagnostic)
      .flatMap((s) => {
        const pool = exercisePool(s, seed).filter((e) => e.difficulty <= (level.id === 'ce2' ? 1 : 2) && e.type !== 'dictation' && e.type !== 'column');
        const easy = pool.filter((e) => e.difficulty === 1);
        const pick = [...easy.slice(0, 1), ...pool.filter((e) => e.difficulty === 2).slice(0, perSkill - 1)];
        return (pick.length ? pick : pool.slice(0, 1)).slice(0, perSkill);
      });
  }, [level]);

  const record = async (ex: Exercise, ok: boolean, given: string, ms: number) => {
    await recordAttempt(profile.id, { skillId: ex.skillId, exerciseId: ex.id, correct: ok, hintsUsed: 0, tries: 1, ms, context: 'diagnostic', prompt: ex.prompt, given, expected: expectedAnswer(ex), type: ex.type });
    const r = [...results, { skillId: ex.skillId, ok }];
    setResults(r);
    if (i + 1 < questions.length) setI(i + 1);
    else await finish(r);
  };

  const finish = async (r: { skillId: string; ok: boolean }[]) => {
    const toReview = [...new Set(r.filter((x) => !x.ok).map((x) => x.skillId))];
    for (const id of toReview) {
      const rec = (await db.skillRecords.get([profile.id, id])) ?? emptyRecord(profile.id, id);
      await db.skillRecords.put({ ...rec, box: 1, nextReview: todayISO() });
    }
    const res = await grantRewards(profile.id, { xp: 30 });
    await saveProfile({ ...(res?.profile ?? profile), diagnosticDone: true });
    await refresh();
    setDone(true);
  };

  if (!started) {
    return (
      <section className="card stack anim-slide" style={{ alignItems: 'center', textAlign: 'center', gap: 16 }}>
        <Mascot id={profile.mascot} mood="happy" size={140} />
        <h1>Le tour de découverte</h1>
        <p style={{ maxWidth: 560, fontSize: 'var(--fs-l)' }}>
          {level.id === 'ce2'
            ? 'Je vais te poser quelques petites questions. Ce n’est pas une évaluation : il n’y a pas de note ! Si tu ne sais pas, ce n’est pas grave, tu peux le dire.'
            : 'Quelques questions pour repérer tes points forts et ce qu’on va renforcer. Pas de note, pas de chrono : réponds tranquillement, et dis-le si tu ne sais pas.'}
        </p>
        <span className="pill">{questions.length} questions · environ {Math.round(questions.length * 0.8)} minutes</span>
        <div className="row" style={{ justifyContent: 'center' }}>
          <button className="btn btn-primary btn-lg" onClick={() => setStarted(true)} autoFocus>
            On commence <ArrowRight />
          </button>
          <button className="btn btn-ghost" onClick={() => nav(`/p/${profile.id}`)}>
            Plus tard
          </button>
        </div>
      </section>
    );
  }

  if (done) {
    const ok = [...new Set(results.filter((r) => r.ok).map((r) => r.skillId))].filter((id) => !results.some((r) => r.skillId === id && !r.ok));
    const review = [...new Set(results.filter((r) => !r.ok).map((r) => r.skillId))];
    return (
      <section className="card stack anim-pop" style={{ gap: 16 }}>
        <div className="row" style={{ flexWrap: 'nowrap' }}>
          <Mascot id={profile.mascot} mood="cheer" size={120} />
          <div>
            <h1 style={{ margin: 0 }}>Merci {profile.name} !</h1>
            <p style={{ margin: 0 }}>Grâce à tes réponses, tes missions seront faites pour toi. Elles changeront au fil de tes progrès.</p>
          </div>
        </div>
        <div className="grid-2">
          <div className="card-flat stack">
            <strong className="row">
              <Sparkles color="var(--accent)" /> Ce qui roule déjà
            </strong>
            {ok.length ? ok.map((id) => <span key={id}>• {getSkill(id)?.title}</span>) : <span className="muted">On va le découvrir ensemble !</span>}
          </div>
          <div className="card-flat stack">
            <strong>Ce qu’on va travailler en premier</strong>
            {review.length ? review.map((id) => <span key={id}>• {getSkill(id)?.title}</span>) : <span className="muted">Rien de particulier : on avance dans le programme !</span>}
          </div>
        </div>
        <button className="btn btn-primary btn-lg" style={{ alignSelf: 'flex-start' }} onClick={() => nav(`/p/${profile.id}`)} autoFocus>
          Voir ma carte <ArrowRight />
        </button>
      </section>
    );
  }

  const ex = questions[i]!;
  const skill = getSkill(ex.skillId)!;
  return (
    <div className="stack">
      <div className="row">
        <SubjectBadge subject={skill.subject} size={36} />
        <div style={{ flex: 1 }}>
          <div className="muted" style={{ fontWeight: 800, fontSize: 'var(--fs-s)' }}>
            Découverte · {SUBJECT_LABELS[skill.subject]} · question {i + 1}/{questions.length}
          </div>
          <ProgressBar value={i} max={questions.length} label="Avancement du tour de découverte" />
        </div>
      </div>
      <section className="card">
        <ExercisePlayer key={ex.id} exercise={ex} mascot={profile.mascot} soundEffects={profile.settings.soundEffects} gentle onDone={(o: ExerciseOutcome) => void record(ex, o.correct, o.given, o.ms)} nextLabel="Question suivante" />
        <button className="btn btn-ghost btn-sm" style={{ marginTop: 14 }} onClick={() => void record(ex, false, 'Je ne sais pas encore', 0)}>
          <HelpCircle size={18} /> Je ne sais pas encore
        </button>
      </section>
    </div>
  );
}
