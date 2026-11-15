/**
 * Lecteur d'exercice : énoncé, support, zone de réponse, indices, correction expliquée.
 * Règle : 2 essais. Après une erreur, on encourage et on propose un indice ; après la
 * 2e erreur, on montre la correction et l'explication. Aucun chronomètre.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight, Check, Lightbulb, RotateCcw, Volume2 } from 'lucide-react';
import type { Exercise } from '@/curriculum/types';
import { chime, speak } from '@/audio/audio';
import { Mascot } from '@/art/Mascot';
import type { MascotId } from '@/profiles/types';
import { checkAnswer, expectedAnswer, type CheckResult, type Response } from './check';
import {
  CategorizeInput,
  ChoiceInput,
  ColumnInput,
  FractionBuildInput,
  ListenInput,
  MapInput,
  MatchInput,
  NumberInput,
  OrderInput,
  SpotInput,
  TextInput,
  TrueFalseInput,
} from './inputs';
import { VisualView } from './Visuals';

export interface ExerciseOutcome {
  exercise: Exercise;
  correct: boolean;
  tries: number;
  hintsUsed: number;
  ms: number;
  given: string;
  expected: string;
}

const PRAISE = ['Bravo !', 'Excellent !', 'Super, c’est juste !', 'Bien joué !', 'Parfait !', 'Tu as trouvé !'];
const AGAIN = ['Pas tout à fait… Essaie encore !', 'Presque ! Regarde bien et réessaie.', 'On réfléchit encore un peu ?'];

function describe(r: Response | null, ex: Exercise): string {
  if (!r) return '';
  switch (r.kind) {
    case 'choice':
      return ex.type === 'spot' ? ex.words[r.index] ?? '' : 'choices' in ex ? ex.choices[r.index] ?? '' : String(r.index);
    case 'bool':
      return r.value ? 'Vrai' : 'Faux';
    case 'number':
      return r.value === null ? '?' : r.value.toLocaleString('fr-FR');
    case 'text':
      return r.value;
    case 'pairs':
      return Object.entries(r.value).map(([a, b]) => `${a} → ${b}`).join(' ; ');
    case 'sequence':
      return r.value.join(' | ');
    case 'buckets':
      return Object.entries(r.value).map(([l, c]) => `${l}:${'categories' in ex ? ex.categories[c] : c}`).join(' ; ');
    case 'id':
      return r.value;
  }
}

interface Props {
  exercise: Exercise;
  mascot: MascotId;
  soundEffects: boolean;
  onDone: (o: ExerciseOutcome) => void;
  /** Texte du bouton final (« Question suivante », « Voir mon bilan »…). */
  nextLabel?: string;
  /** Mode diagnostic : un seul essai, pas de correction détaillée stressante. */
  gentle?: boolean;
}

export function ExercisePlayer({ exercise: ex, mascot, soundEffects, onDone, nextLabel = 'Continuer', gentle }: Props) {
  const [response, setResponse] = useState<Response | null>(null);
  const [tries, setTries] = useState(0);
  const [hints, setHints] = useState(0);
  const [result, setResult] = useState<CheckResult | null>(null);
  const [finished, setFinished] = useState(false);
  const [attemptKey, setAttemptKey] = useState(0);
  const start = useRef(Date.now());
  const firstGiven = useRef('');
  const maxTries = gentle ? 1 : 2;

  useEffect(() => {
    setResponse(null);
    setTries(0);
    setHints(0);
    setResult(null);
    setFinished(false);
    setAttemptKey((k) => k + 1);
    start.current = Date.now();
    firstGiven.current = '';
  }, [ex.id]);

  const submit = useCallback(() => {
    if (!response || finished) return;
    const r = checkAnswer(ex, response);
    const t = tries + 1;
    setTries(t);
    setResult(r);
    if (t === 1) firstGiven.current = describe(response, ex);
    if (soundEffects) chime(r.correct ? 'ok' : 'ko');
    if (r.correct || t >= maxTries) setFinished(true);
  }, [response, finished, ex, tries, soundEffects, maxTries]);

  const retry = () => {
    setResult(null);
    setResponse(null);
    setAttemptKey((k) => k + 1);
  };

  const next = () =>
    onDone({
      exercise: ex,
      correct: !!result?.correct,
      tries,
      hintsUsed: hints,
      ms: Date.now() - start.current,
      given: tries > 1 ? `${firstGiven.current} puis ${describe(response, ex)}` : firstGiven.current,
      expected: expectedAnswer(ex),
    });

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' || e.shiftKey) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'BUTTON') return;
      if (tag === 'TEXTAREA' && !e.ctrlKey) return;
      e.preventDefault();
      if (finished) next();
      else if (result && !result.correct) retry();
      else submit();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  });

  const locked = finished || (result !== null && !result.correct);
  const reveal = finished;
  const common = { onChange: setResponse, locked, reveal, value: response };
  const readPrompt = () => void speak(ex.prompt, 'fr');

  return (
    <div className="stack anim-slide" key={ex.id}>
      <div className="row" style={{ alignItems: 'flex-start', gap: 16 }}>
        <h2 style={{ flex: 1, fontSize: 'var(--fs-xl)', margin: 0 }} id={`q-${ex.id}`}>
          {ex.prompt}
        </h2>
        <button type="button" className="btn btn-ghost btn-icon" onClick={readPrompt} aria-label="Relire la consigne à voix haute" title="Relire la consigne">
          <Volume2 size={20} />
        </button>
      </div>
      {ex.passage && (
        <div className="passage" tabIndex={0} aria-label="Texte à lire">
          {ex.passage}
        </div>
      )}
      {ex.visual && (
        <div className="card-flat" style={{ display: 'flex', justifyContent: 'center' }}>
          <VisualView v={ex.visual} />
        </div>
      )}

      <div key={attemptKey} aria-labelledby={`q-${ex.id}`}>
        {(ex.type === 'mcq') && <ChoiceInput ex={ex} {...common} />}
        {ex.type === 'listen' && <ListenInput ex={ex} {...common} />}
        {ex.type === 'truefalse' && <TrueFalseInput ex={ex} {...common} />}
        {ex.type === 'numeric' && <NumberInput ex={ex} {...common} />}
        {(ex.type === 'text' || ex.type === 'dictation') && <TextInput ex={ex} {...common} />}
        {ex.type === 'match' && <MatchInput ex={ex} {...common} />}
        {ex.type === 'order' && <OrderInput ex={ex} {...common} />}
        {ex.type === 'categorize' && <CategorizeInput ex={ex} {...common} />}
        {ex.type === 'column' && <ColumnInput ex={ex} {...common} />}
        {ex.type === 'fraction-build' && <FractionBuildInput ex={ex} {...common} />}
        {ex.type === 'map' && <MapInput ex={ex} {...common} />}
        {ex.type === 'spot' && <SpotInput ex={ex} {...common} />}
      </div>

      {hints > 0 && !finished && (
        <div className="feedback feedback-info" role="note">
          <Lightbulb size={22} style={{ flex: 'none' }} />
          <div>
            {ex.hints.slice(0, hints).map((h, i) => (
              <p key={i} style={{ margin: 0 }}>
                {h}
              </p>
            ))}
          </div>
        </div>
      )}

      {result && (
        <div className={`feedback ${result.correct ? 'feedback-ok' : gentle ? 'feedback-info' : 'feedback-ko'}`} role="status" aria-live="assertive">
          <Mascot id={mascot} mood={result.correct ? 'cheer' : 'think'} size={64} />
          <div className="stack" style={{ gap: 6 }}>
            <strong style={{ fontSize: 'var(--fs-l)' }}>
              {result.correct ? PRAISE[(ex.id.length + tries) % PRAISE.length] : finished ? (gentle ? 'Merci, c’est noté ! On travaillera cela ensemble.' : 'Ce n’est pas grave, regardons la correction ensemble.') : AGAIN[(ex.id.length + tries) % AGAIN.length]}
            </strong>
            {result.feedback && !result.correct && <span>{result.feedback}</span>}
            {finished && !result.correct && !gentle && (
              <span>
                La bonne réponse : <strong>{result.expected}</strong>
              </span>
            )}
            {finished && !gentle && <span className="muted">{ex.explanation}</span>}
          </div>
        </div>
      )}

      <div className="row">
        {!finished && !locked && (
          <button type="button" className="btn btn-primary btn-lg" onClick={submit} disabled={!response}>
            <Check /> Valider
          </button>
        )}
        {!finished && result && !result.correct && (
          <button type="button" className="btn btn-accent btn-lg" onClick={retry} autoFocus>
            <RotateCcw /> Réessayer
          </button>
        )}
        {!finished && !gentle && hints < ex.hints.length && (
          <button type="button" className="btn btn-ghost" onClick={() => setHints(hints + 1)}>
            <Lightbulb size={20} /> Un indice
          </button>
        )}
        {finished && (
          <button type="button" className="btn btn-primary btn-lg" onClick={next} autoFocus>
            {nextLabel} <ArrowRight />
          </button>
        )}
      </div>
    </div>
  );
}
