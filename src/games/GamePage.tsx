import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router';
import { ArrowLeft, RotateCcw, Volume2 } from 'lucide-react';
import { useProfileCtx } from '@/app/screens/ProfileLayout';
import { useApp } from '@/app/AppContext';
import { isUnlocked } from '@/adaptive-engine/planner';
import { todayISO } from '@/adaptive-engine/mastery';
import type { Exercise, VocabCard } from '@/curriculum/types';
import { ExercisePlayer, type ExerciseOutcome } from '@/exercises/ExercisePlayer';
import { PictureCard } from '@/exercises/Visuals';
import { Avatar } from '@/art/Avatar';
import { Mascot } from '@/art/Mascot';
import { chime, speak } from '@/audio/audio';
import { Confetti, Loading } from '@/components/ui';
import { grantRewards } from '@/progression/progress';
import { BADGES, COSMETICS, XP } from '@/rewards/rewards';
import { addSession, recordAttempt } from '@/storage/repo';
import { shuffle } from '@/utils/rng';
import { GAMES, gameQuestions, type GameDef, type GameId } from './catalog';

function Track({ steps, pos, avatar }: { steps: number; pos: number; avatar: JSX.Element }) {
  return (
    <svg viewBox="0 0 600 90" width="100%" aria-label={`Position : case ${pos} sur ${steps}`} role="img">
      <path d="M20 60 C 150 20, 250 90, 350 50 S 520 30, 580 55" stroke="var(--line)" strokeWidth="18" fill="none" strokeLinecap="round" />
      {Array.from({ length: steps + 1 }, (_, i) => {
        const t = i / steps;
        const x = 20 + t * 560;
        const y = 55 + Math.sin(t * Math.PI * 2) * 14;
        return <circle key={i} cx={x} cy={y} r={i <= pos ? 9 : 6} fill={i <= pos ? 'var(--accent)' : 'var(--surface-2)'} stroke="var(--ink)" strokeWidth="1.5" />;
      })}
      <g transform={`translate(${20 + (pos / steps) * 560 - 22} ${55 + Math.sin((pos / steps) * Math.PI * 2) * 14 - 52})`} style={{ transition: 'transform 600ms var(--ease-spring)' }}>
        <foreignObject width="44" height="44">{avatar}</foreignObject>
      </g>
      <text x="582" y="28" textAnchor="end" fontWeight="900" fill="var(--ink)">
        Arrivée
      </text>
    </svg>
  );
}

function Flask({ level }: { level: number }) {
  const h = 70 * level;
  return (
    <svg viewBox="0 0 100 110" width="90" role="img" aria-label={`Éprouvette remplie à ${Math.round(level * 100)} %`}>
      <defs>
        <clipPath id="flask-clip">
          <path d="M38 6 h24 v26 l24 58 a8 8 0 0 1 -7 12 h-58 a8 8 0 0 1 -7 -12 l24 -58 Z" />
        </clipPath>
      </defs>
      <rect x="0" y={102 - h} width="100" height={h} fill="#4fd6c8" clipPath="url(#flask-clip)" style={{ transition: 'all 600ms var(--ease-out)' }} />
      <path d="M38 6 h24 v26 l24 58 a8 8 0 0 1 -7 12 h-58 a8 8 0 0 1 -7 -12 l24 -58 Z" fill="none" stroke="var(--ink)" strokeWidth="4" />
    </svg>
  );
}

function Chest({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 120 100" width="130" role="img" aria-label={open ? 'Coffre ouvert' : 'Coffre fermé'} className={open ? 'anim-pop' : ''}>
      {open && (
        <g>
          {[20, 45, 70, 95].map((x, i) => (
            <path key={x} d={`M${x} 30 l3 -8 3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 Z`} fill="#ffd166" style={{ animation: `float 2s ${i * 0.2}s infinite` }} />
          ))}
        </g>
      )}
      <rect x="14" y="52" width="92" height="42" rx="6" fill="#a0612f" />
      <path d={open ? 'M14 52 L24 20 L114 26 L106 52 Z' : 'M14 52 a46 26 0 0 1 92 0 Z'} fill="#c07a3c" />
      <rect x="52" y="58" width="16" height="18" rx="3" fill="#ffd166" />
    </svg>
  );
}

/** English Quest — phase 1 : memory audio (mot anglais ↔ image). */
function Memory({ cards, onDone }: { cards: VocabCard[]; onDone: (mistakes: number) => void }) {
  const deck = useMemo(() => shuffle(cards.flatMap((c) => [{ key: `${c.en}-w`, pair: c.en, kind: 'word' as const, c }, { key: `${c.en}-p`, pair: c.en, kind: 'pic' as const, c }])), [cards]);
  const [flipped, setFlipped] = useState<string[]>([]);
  const [found, setFound] = useState<string[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const flip = (k: string) => {
    if (flipped.length === 2 || flipped.includes(k)) return;
    const card = deck.find((d) => d.key === k)!;
    void speak(card.c.en, 'en');
    const f = [...flipped, k];
    setFlipped(f);
    if (f.length === 2) {
      const [a, b] = f.map((x) => deck.find((d) => d.key === x)!);
      setTimeout(() => {
        if (a!.pair === b!.pair) {
          const nf = [...found, a!.pair];
          setFound(nf);
          if (nf.length === cards.length) onDone(mistakes);
        } else setMistakes((m) => m + 1);
        setFlipped([]);
      }, 900);
    }
  };
  return (
    <div className="stack">
      <p className="muted" style={{ margin: 0 }}>
        Retourne deux cartes : un mot anglais et son image. Chaque carte se fait entendre quand tu la retournes.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 12 }}>
        {deck.map((d) => {
          const shown = flipped.includes(d.key) || found.includes(d.pair);
          return (
            <button key={d.key} type="button" className="choice choice-visual" style={{ minHeight: 120, background: shown ? 'var(--surface)' : 'linear-gradient(135deg, var(--primary), var(--accent-2))', borderColor: found.includes(d.pair) ? 'var(--success)' : undefined }} aria-label={shown ? (d.kind === 'word' ? d.c.en : d.c.fr) : 'Carte retournée'} disabled={found.includes(d.pair)} onClick={() => flip(d.key)}>
              {shown ? d.kind === 'word' ? <strong style={{ fontSize: 'var(--fs-l)' }}>{d.c.en}</strong> : <PictureCard symbol={d.c.symbol} label={d.c.fr} /> : <Volume2 color="#fff" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function GamePage() {
  const { gameId } = useParams();
  const { profile, level, records } = useProfileCtx();
  const { setBusy, notify, reloadProfiles } = useApp();
  const game: GameDef | undefined = GAMES.find((g) => g.id === gameId);
  const [questions, setQuestions] = useState<Exercise[] | null>(null);
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [phase, setPhase] = useState<'memory' | 'play' | 'end'>('play');
  const [end, setEnd] = useState<{ xp: number; chest: boolean; badges: string[]; cosmetics: string[] } | null>(null);
  const [round, setRound] = useState(0);
  const started = useRef(new Date());
  const xp = useRef(0);

  const vocab = useMemo(() => shuffle(level.skills.filter((s) => s.subject === 'anglais').flatMap((s) => s.lesson.vocab ?? []).filter((v) => v.en.length < 16)).slice(0, 6), [level, round]);

  useEffect(() => {
    if (!game) return;
    const unlocked = new Set(level.skills.filter((s) => isUnlocked(level, s, records, profile)).map((s) => s.id));
    const practiced = [...records.values()].filter((r) => r.attempts > 0).map((r) => r.skillId);
    setQuestions(gameQuestions(game.id as GameId, level, practiced, unlocked));
    setI(0);
    setScore(0);
    setPhase(game.id === 'english' ? 'memory' : 'play');
    setEnd(null);
    started.current = new Date();
    xp.current = 0;
    setBusy(true);
    return () => setBusy(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game?.id, round]);

  if (!game) return <Navigate to={`/p/${profile.id}/jeux`} replace />;
  if (!questions) return <Loading />;

  const finish = async (finalScore: number) => {
    const chest = game.id === 'coffre' && finalScore >= 5;
    const endAt = new Date();
    await addSession({ profileId: profile.id, day: todayISO(), startedAt: started.current.toISOString(), endedAt: endAt.toISOString(), minutes: Math.max(1, Math.round((endAt.getTime() - started.current.getTime()) / 60000)), kind: 'game', answered: questions.length, correct: finalScore, skills: [...new Set(questions.map((q) => q.skillId))] });
    xp.current += XP.blockDone;
    const res = await grantRewards(profile.id, { xp: xp.current, stars: finalScore >= questions.length * 0.6 ? 2 : 1, chests: chest ? 1 : 0 });
    await reloadProfiles();
    setEnd({ xp: xp.current, chest, badges: res?.newBadges ?? [], cosmetics: res?.newCosmetics ?? [] });
    setPhase('end');
    setBusy(false);
    if (profile.settings.soundEffects) chime('win');
    res?.newBadges.forEach((b) => notify(`Nouveau badge : ${BADGES.find((x) => x.id === b)?.label}`, 'reward'));
  };

  const onDone = async (o: ExerciseOutcome) => {
    await recordAttempt(profile.id, { skillId: o.exercise.skillId, exerciseId: o.exercise.id, correct: o.correct, hintsUsed: o.hintsUsed, tries: o.tries, ms: o.ms, context: 'game', prompt: o.exercise.prompt, given: o.given, expected: o.expected, type: o.exercise.type });
    xp.current += o.correct ? (o.tries === 1 ? XP.correctFirst : XP.correctLater) : XP.effort;
    const s = score + (o.correct ? 1 : 0);
    setScore(s);
    if (i + 1 < questions.length) setI(i + 1);
    else await finish(s);
  };

  const ex = questions[i];
  const header = (
    <div className="row" style={{ flexWrap: 'nowrap' }}>
      <Link to={`/p/${profile.id}/jeux`} className="btn btn-ghost btn-sm">
        <ArrowLeft size={18} /> Défis
      </Link>
      <h1 style={{ margin: 0, flex: 1, fontSize: 'var(--fs-xl)' }}>{game.name}</h1>
      <span className="pill pill-accent">Score : {score}</span>
    </div>
  );

  if (questions.length === 0 && phase !== 'memory') {
    return (
      <div className="stack">
        {header}
        <div className="card stack" style={{ alignItems: 'center' }}>
          <Mascot id={profile.mascot} mood="think" />
          <p>Ce défi s’ouvrira quand tu auras découvert d’autres compétences sur la carte. Continue ta mission du jour !</p>
        </div>
      </div>
    );
  }

  if (phase === 'end' && end) {
    return (
      <div className="stack">
        {header}
        <section className="card stack anim-pop" style={{ alignItems: 'center', textAlign: 'center' }}>
          <Confetti count={end.chest ? 90 : 40} />
          {game.id === 'coffre' ? <Chest open={end.chest} /> : <Mascot id={profile.mascot} mood="cheer" size={140} />}
          <h2>
            {game.id === 'coffre' ? (end.chest ? 'Le coffre s’ouvre !' : 'Le coffre résiste encore…') : 'Défi terminé !'}
          </h2>
          <p>
            {score} bonne{score > 1 ? 's' : ''} réponse{score > 1 ? 's' : ''} sur {questions.length}. {game.id === 'coffre' && !end.chest ? 'Il fallait 5 bonnes réponses : tu peux retenter quand tu veux, sans pénalité.' : 'Bravo pour ton effort !'}
          </p>
          <span className="pill pill-accent">+{end.xp} XP</span>
          {end.cosmetics.length > 0 && <div className="card-flat">Nouvel objet : {end.cosmetics.map((c) => COSMETICS.find((x) => x.id === c)?.label).join(', ')}</div>}
          <div className="row" style={{ justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={() => setRound(round + 1)}>
              <RotateCcw size={18} /> Rejouer
            </button>
            <Link className="btn btn-ghost" to={`/p/${profile.id}/jeux`}>
              Autres défis
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="stack">
      {header}
      {phase === 'memory' ? (
        <section className="card stack">
          <h2 style={{ margin: 0 }}>Étape 1 : les paires</h2>
          <Memory
            cards={vocab}
            onDone={(m) => {
              xp.current += Math.max(5, 30 - m * 3);
              notify(`Toutes les paires trouvées${m === 0 ? ' sans erreur' : ''} ! Place à l’écoute.`, 'success');
              setPhase('play');
            }}
          />
        </section>
      ) : (
        <>
          <div className="card-flat row" style={{ justifyContent: 'center' }}>
            {game.id === 'course' && <Track steps={questions.length} pos={score} avatar={<Avatar config={profile.avatar} size={44} />} />}
            {game.id === 'labo' && (
              <>
                <Flask level={score / questions.length} />
                <span className="muted">Chaque bonne réponse remplit l’éprouvette !</span>
              </>
            )}
            {game.id === 'coffre' && (
              <>
                <Chest open={false} />
                <span className="muted">
                  {score}/5 clés trouvées · question {i + 1}/{questions.length}
                </span>
              </>
            )}
            {!['course', 'labo', 'coffre'].includes(game.id) && (
              <span className="muted">
                Question {i + 1} / {questions.length}
              </span>
            )}
          </div>
          {ex && (
            <section className="card">
              <ExercisePlayer exercise={ex} mascot={profile.mascot} soundEffects={profile.settings.soundEffects} onDone={(o) => void onDone(o)} nextLabel={i + 1 < questions.length ? (game.id === 'course' ? 'Avancer' : 'Suivant') : 'Résultats'} />
            </section>
          )}
        </>
      )}
    </div>
  );
}
