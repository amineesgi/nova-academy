/**
 * Déroulé d'une séance (mission du jour, entraînement libre ou séance préparée par l'adulte) :
 * pour chaque bloc → leçon éventuelle → exercices progressifs → mini-bilan → bloc suivant.
 * Chaque réponse est enregistrée immédiatement (sauvegarde automatique).
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { CalendarClock, Home, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router';
import { BLOCK_LABELS, getRecord, pickExercises, type MissionBlock } from '@/adaptive-engine/planner';
import { computeState, quality, STATE_LABELS, todayISO } from '@/adaptive-engine/mastery';
import { getSkill } from '@/curriculum/registry';
import type { Exercise, Skill } from '@/curriculum/types';
import { Mascot } from '@/art/Mascot';
import { chime } from '@/audio/audio';
import { ExercisePlayer, type ExerciseOutcome } from '@/exercises/ExercisePlayer';
import { LessonView } from '@/lessons/LessonView';
import { grantRewards } from '@/progression/progress';
import type { Profile } from '@/profiles/types';
import { BADGES, COSMETICS, starsForBlock, XP } from '@/rewards/rewards';
import { addSession, finishBlock, loadRecords, markLessonSeen, recordAttempt, saveProfile } from '@/storage/repo';
import { Confetti, ProgressBar, Stars, SubjectBadge } from '@/components/ui';
import { useApp } from '../AppContext';

type Phase = { t: 'lesson' } | { t: 'exercise'; i: number } | { t: 'block-summary' } | { t: 'done' };

interface Props {
  profile: Profile;
  blocks: MissionBlock[];
  kind: 'mission' | 'free' | 'custom';
  title: string;
  onComplete?: () => void | Promise<void>;
}

interface BlockResult {
  skill: Skill;
  outcomes: ExerciseOutcome[];
  stars: number;
  nextReview: string | null;
  stateLabel: string;
}

function formatDate(iso: string | null): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number) as [number, number, number];
  return new Date(y, m - 1, d).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
}

export function SessionRunner({ profile, blocks, kind, title, onComplete }: Props) {
  const { setBusy, notify, reloadProfiles } = useApp();
  const nav = useNavigate();
  const [bi, setBi] = useState(0);
  const [phase, setPhase] = useState<Phase>({ t: 'lesson' });
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [outcomes, setOutcomes] = useState<ExerciseOutcome[]>([]);
  const [results, setResults] = useState<BlockResult[]>([]);
  const [reward, setReward] = useState<{ xp: number; badges: string[]; cosmetics: string[]; levelUp: boolean } | null>(null);
  const startedAt = useRef(new Date());
  const xpRef = useRef(0);

  const block = blocks[bi];
  const skill = useMemo(() => (block ? getSkill(block.skillId) : undefined), [block]);

  useEffect(() => {
    setBusy(true);
    return () => setBusy(false);
  }, [setBusy]);

  // Préparation d'un bloc : choix des exercices selon l'état de la compétence.
  useEffect(() => {
    if (!block || !skill) return;
    let cancelled = false;
    void loadRecords(profile.id).then((map) => {
      if (cancelled) return;
      const rec = getRecord(map, profile.id, skill.id);
      setExercises(pickExercises(skill, rec, block.kind, block.count));
      setOutcomes([]);
      setPhase(block.withLesson ? { t: 'lesson' } : { t: 'exercise', i: 0 });
    });
    return () => {
      cancelled = true;
    };
  }, [block, skill, profile.id]);

  if (!block || !skill) {
    if (phase.t !== 'done' && blocks.length === 0) {
      return (
        <div className="card stack center" style={{ alignItems: 'center' }}>
          <Mascot id={profile.mascot} mood="calm" />
          <p>Aucune activité à proposer pour l’instant. Demande à ton adulte d’ajouter des matières dans le planning.</p>
        </div>
      );
    }
  }

  const onAnswered = async (o: ExerciseOutcome) => {
    const all = [...outcomes, o];
    setOutcomes(all);
    xpRef.current += o.correct ? (o.tries === 1 && o.hintsUsed === 0 ? XP.correctFirst : XP.correctLater) : XP.effort;
    await recordAttempt(profile.id, {
      skillId: o.exercise.skillId,
      exerciseId: o.exercise.id,
      correct: o.correct,
      hintsUsed: o.hintsUsed,
      tries: o.tries,
      ms: o.ms,
      context: kind === 'custom' ? 'custom' : kind === 'free' ? 'free' : 'mission',
      prompt: o.exercise.prompt,
      given: o.given,
      expected: o.expected,
      type: o.exercise.type,
    });
    if (phase.t === 'exercise' && phase.i + 1 < exercises.length) setPhase({ t: 'exercise', i: phase.i + 1 });
    else void endBlock(all);
  };

  const endBlock = async (all: ExerciseOutcome[]) => {
    if (!skill || !block) return;
    const score = all.reduce((a, o) => a + quality({ correct: o.correct, hintsUsed: o.hintsUsed, tryNumber: o.tries }), 0) / Math.max(1, all.length);
    const rec = await finishBlock(profile.id, skill.id, { score, answered: all.length, wasReview: block.kind === 'review', date: todayISO() });
    const stars = starsForBlock(score);
    xpRef.current += XP.blockDone;
    setResults((r) => [...r, { skill, outcomes: all, stars, nextReview: rec.nextReview, stateLabel: STATE_LABELS[computeState(rec)] }]);
    setPhase({ t: 'block-summary' });
  };

  const nextBlock = async () => {
    if (bi + 1 < blocks.length) {
      setBi(bi + 1);
      return;
    }
    // Fin de séance
    const end = new Date();
    const all = [...results];
    const answered = all.reduce((a, r) => a + r.outcomes.length, 0);
    const correct = all.reduce((a, r) => a + r.outcomes.filter((o) => o.correct).length, 0);
    if (kind === 'mission') xpRef.current += XP.missionDone;
    await addSession({
      profileId: profile.id,
      day: todayISO(),
      startedAt: startedAt.current.toISOString(),
      endedAt: end.toISOString(),
      minutes: Math.max(1, Math.round((end.getTime() - startedAt.current.getTime()) / 60000)),
      kind: kind === 'custom' ? 'custom' : kind === 'free' ? 'free' : 'mission',
      answered,
      correct,
      skills: all.map((r) => r.skill.id),
    });
    const stars = all.reduce((a, r) => a + r.stars, 0);
    const res = await grantRewards(profile.id, { xp: xpRef.current, stars });
    if (kind === 'mission' && res) await saveProfile({ ...res.profile, lastMissionDate: todayISO() });
    await onComplete?.();
    await reloadProfiles();
    setReward({ xp: xpRef.current, badges: res?.newBadges ?? [], cosmetics: res?.newCosmetics ?? [], levelUp: !!res?.levelUp });
    if (profile.settings.soundEffects) chime('win');
    setBusy(false);
    setPhase({ t: 'done' });
    res?.newBadges.forEach((b) => notify(`Nouveau badge : ${BADGES.find((x) => x.id === b)?.label}`, 'reward'));
  };

  const progress = blocks.length ? (bi + (phase.t === 'exercise' ? phase.i / Math.max(1, exercises.length) : phase.t === 'block-summary' ? 1 : 0)) / blocks.length : 0;

  if (phase.t === 'done' && reward) {
    const totalStars = results.reduce((a, r) => a + r.stars, 0);
    return (
      <section className="card stack center anim-pop" style={{ alignItems: 'center', gap: 18 }} aria-labelledby="done-title">
        <Confetti />
        <Mascot id={profile.mascot} mood="cheer" size={150} />
        <h1 id="done-title">{kind === 'mission' ? 'Mission accomplie !' : 'Séance terminée !'}</h1>
        <p className="muted" style={{ maxWidth: 520 }}>
          Tu as travaillé {results.length} compétence{results.length > 1 ? 's' : ''}. Chaque effort compte : continue comme ça !
        </p>
        <div className="row" style={{ justifyContent: 'center' }}>
          <span className="pill pill-accent" style={{ fontSize: 'var(--fs-l)' }}>
            +{reward.xp} XP
          </span>
          <span className="pill pill-primary" style={{ fontSize: 'var(--fs-l)' }}>
            {totalStars} étoiles
          </span>
          {reward.levelUp && (
            <span className="pill pill-accent anim-pop" style={{ fontSize: 'var(--fs-l)' }}>
              <Trophy size={18} /> Niveau supérieur !
            </span>
          )}
        </div>
        {reward.badges.length > 0 && (
          <div className="card-flat">
            <strong>Nouveaux badges : </strong>
            {reward.badges.map((b) => BADGES.find((x) => x.id === b)?.label).join(', ')}
          </div>
        )}
        {reward.cosmetics.length > 0 && (
          <div className="card-flat">
            <strong>Débloqué : </strong>
            {reward.cosmetics.map((c) => COSMETICS.find((x) => x.id === c)?.label).join(', ')} — à essayer dans « Mon avatar » !
          </div>
        )}
        <div className="row" style={{ justifyContent: 'center' }}>
          <button className="btn btn-primary btn-lg" onClick={() => nav(`/p/${profile.id}`)} autoFocus>
            <Home /> Retour à la carte
          </button>
        </div>
      </section>
    );
  }

  if (!skill || !block) return null;
  const last = results[results.length - 1];

  return (
    <div className="stack" style={{ gap: 18 }}>
      <div className="row">
        <SubjectBadge subject={skill.subject} size={38} />
        <div style={{ flex: 1 }}>
          <div className="muted" style={{ fontWeight: 800, fontSize: 'var(--fs-s)' }}>
            {title} · {BLOCK_LABELS[block.kind]} · étape {bi + 1}/{blocks.length}
          </div>
          <ProgressBar value={progress} label="Progression de la séance" />
        </div>
      </div>

      {phase.t === 'lesson' && (
        <LessonView
          skill={skill}
          mascot={profile.mascot}
          alternativeFirst={block.alternativeFirst}
          onStart={() => {
            void markLessonSeen(profile.id, skill.id);
            xpRef.current += XP.lessonDone;
            setPhase({ t: 'exercise', i: 0 });
          }}
        />
      )}

      {phase.t === 'exercise' && exercises[phase.i] && (
        <section className="card" aria-label={`Question ${phase.i + 1} sur ${exercises.length}`}>
          <div className="row" style={{ marginBottom: 12 }}>
            <span className="pill">
              Question {phase.i + 1} / {exercises.length}
            </span>
            {phase.i === 0 && <span className="pill pill-primary">On commence en douceur</span>}
          </div>
          <ExercisePlayer exercise={exercises[phase.i]!} mascot={profile.mascot} soundEffects={profile.settings.soundEffects} onDone={(o) => void onAnswered(o)} nextLabel={phase.i + 1 < exercises.length ? 'Question suivante' : 'Voir mon bilan'} />
        </section>
      )}

      {phase.t === 'block-summary' && last && (
        <section className="card stack anim-pop" aria-labelledby="bilan-title" style={{ alignItems: 'center', textAlign: 'center' }}>
          <Mascot id={profile.mascot} mood={last.stars >= 2 ? 'cheer' : 'happy'} size={110} />
          <h2 id="bilan-title">Mini-bilan : {last.skill.title}</h2>
          <Stars count={last.stars} size={38} />
          <p style={{ margin: 0 }}>
            {last.outcomes.filter((o) => o.correct).length} réponse{last.outcomes.filter((o) => o.correct).length > 1 ? 's' : ''} juste{last.outcomes.filter((o) => o.correct).length > 1 ? 's' : ''} sur {last.outcomes.length}.{' '}
            {last.stars === 3 ? 'Superbe travail !' : last.stars === 2 ? 'Beau progrès, continue !' : 'Tu as persévéré : c’est comme ça qu’on apprend. On y reviendra bientôt.'}
          </p>
          <span className="pill">Compétence : {last.stateLabel}</span>
          {last.nextReview && (
            <p className="muted row" style={{ justifyContent: 'center', margin: 0 }}>
              <CalendarClock size={18} /> Prochaine révision conseillée : {formatDate(last.nextReview)}
            </p>
          )}
          <button className="btn btn-primary btn-lg" onClick={() => void nextBlock()} autoFocus>
            {bi + 1 < blocks.length ? 'Étape suivante' : 'Terminer la séance'}
          </button>
        </section>
      )}
    </div>
  );
}
