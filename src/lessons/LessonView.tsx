/**
 * Leçon structurée en étapes : objectif → introduction → explication → exemple →
 * démonstration guidée → à retenir. Bouton « Explique-moi autrement » toujours disponible.
 */
import { useState } from 'react';
import { ArrowLeft, ArrowRight, Sparkles, Volume2, Wand2 } from 'lucide-react';
import type { Skill } from '@/curriculum/types';
import { SUBJECT_LABELS } from '@/curriculum/types';
import { Mascot } from '@/art/Mascot';
import { speak } from '@/audio/audio';
import type { MascotId } from '@/profiles/types';
import { Modal, SubjectBadge } from '@/components/ui';
import { PictureCard } from '@/exercises/Visuals';

interface Props {
  skill: Skill;
  mascot: MascotId;
  alternativeFirst?: boolean;
  onStart: () => void;
}

export function LessonView({ skill, mascot, alternativeFirst, onStart }: Props) {
  const L = skill.lesson;
  const steps = ['Objectif', 'Découverte', 'Explication', 'Exemple', 'Pas à pas', ...(L.vocab ? ['Écoute et répète'] : []), 'À retenir'];
  const [step, setStep] = useState(0);
  const [demoShown, setDemoShown] = useState(1);
  const [alt, setAlt] = useState(!!alternativeFirst);
  const [showAnswer, setShowAnswer] = useState(false);
  const name = steps[step];
  const last = step === steps.length - 1;

  return (
    <section className="card stack anim-slide" aria-labelledby="lesson-title" style={{ gap: 20 }}>
      <div className="row">
        <SubjectBadge subject={skill.subject} />
        <div style={{ flex: 1 }}>
          <span className="muted" style={{ fontWeight: 800 }}>
            {SUBJECT_LABELS[skill.subject]} · Leçon
          </span>
          <h2 id="lesson-title" style={{ margin: 0 }}>
            {skill.title}
          </h2>
        </div>
        <button className="btn btn-accent" onClick={() => setAlt(true)}>
          <Wand2 size={20} /> Explique-moi autrement
        </button>
      </div>

      <div className="row" aria-label={`Étape ${step + 1} sur ${steps.length} : ${name}`}>
        <div className="step-dots" aria-hidden="true">
          {steps.map((s, i) => (
            <span key={s} className={i <= step ? 'on' : ''} />
          ))}
        </div>
        <strong className="muted">{name}</strong>
      </div>

      <div className="row" style={{ alignItems: 'flex-start', gap: 20, flexWrap: 'nowrap' }}>
        <div style={{ flex: 'none' }} className="anim-float">
          <Mascot id={mascot} mood={name === 'À retenir' ? 'cheer' : name === 'Pas à pas' ? 'think' : 'happy'} size={110} />
        </div>
        <div className="stack" style={{ flex: 1, minWidth: 0 }}>
          {name === 'Objectif' && (
            <div className="speech" style={{ fontSize: 'var(--fs-l)' }}>
              🎯 {L.objective}
            </div>
          )}
          {name === 'Découverte' && <div className="speech">{L.intro}</div>}
          {name === 'Explication' && (
            <ul className="stack" style={{ paddingLeft: 20, margin: 0 }}>
              {L.explanation.map((p, i) => (
                <li key={i} className="anim-slide" style={{ animationDelay: `${i * 120}ms` }}>
                  {p}
                </li>
              ))}
            </ul>
          )}
          {name === 'Exemple' && (
            <div className="card-flat stack">
              <strong>{L.example.prompt}</strong>
              {showAnswer ? (
                <div className="feedback feedback-ok anim-pop">{L.example.answer}</div>
              ) : (
                <button className="btn btn-ghost" onClick={() => setShowAnswer(true)}>
                  Voir la réponse
                </button>
              )}
            </div>
          )}
          {name === 'Pas à pas' && (
            <ol className="stack" style={{ paddingLeft: 22, margin: 0 }}>
              {L.demo.slice(0, demoShown).map((d, i) => (
                <li key={i} className="anim-slide">
                  {d}
                </li>
              ))}
              {demoShown < L.demo.length && (
                <li style={{ listStyle: 'none', marginLeft: -22 }}>
                  <button className="btn btn-sm btn-primary" onClick={() => setDemoShown(demoShown + 1)}>
                    Étape suivante <ArrowRight size={16} />
                  </button>
                </li>
              )}
            </ol>
          )}
          {name === 'Écoute et répète' && L.vocab && (
            <div className="stack">
              <p className="muted" style={{ margin: 0 }}>
                Clique sur chaque carte pour écouter, puis répète le mot à voix haute. (L’application ne vérifie pas ta prononciation : demande à un adulte de t’écouter !)
              </p>
              <div className="grid-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))' }}>
                {L.vocab.map((v) => (
                  <button key={v.en} className="choice choice-visual" onClick={() => void speak(v.en, 'en')} style={{ minHeight: 130 }}>
                    <PictureCard symbol={v.symbol} label={v.fr} />
                    <strong>{v.en}</strong>
                    <span className="muted" style={{ fontSize: 'var(--fs-s)' }}>
                      {v.fr}
                    </span>
                    <Volume2 size={16} />
                  </button>
                ))}
              </div>
            </div>
          )}
          {name === 'À retenir' && (
            <div className="card-flat" style={{ borderLeft: '6px solid var(--accent)' }}>
              <div className="row" style={{ marginBottom: 6 }}>
                <Sparkles color="var(--accent)" />
                <strong>À retenir</strong>
              </div>
              <p style={{ fontSize: 'var(--fs-l)', fontWeight: 800, margin: 0 }}>{L.remember}</p>
            </div>
          )}
        </div>
      </div>

      <div className="row">
        <button className="btn btn-ghost" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>
          <ArrowLeft size={20} /> Retour
        </button>
        <span className="spacer" />
        {!last ? (
          <button className="btn btn-primary btn-lg" onClick={() => setStep(step + 1)} autoFocus>
            Suivant <ArrowRight />
          </button>
        ) : (
          <button className="btn btn-success btn-lg pulse" onClick={onStart} autoFocus>
            Je m’entraîne ! <ArrowRight />
          </button>
        )}
      </div>

      {alt && (
        <Modal title="Je t’explique autrement" onClose={() => setAlt(false)}>
          <div className="row" style={{ alignItems: 'flex-start', flexWrap: 'nowrap' }}>
            <Mascot id={mascot} mood="calm" size={90} />
            <div className="stack">
              {L.alternative.map((a, i) => (
                <p key={i} className="speech" style={{ margin: 0 }}>
                  {a}
                </p>
              ))}
              <p className="muted" style={{ margin: 0 }}>
                <strong>À retenir :</strong> {L.remember}
              </p>
            </div>
          </div>
          <div className="row" style={{ justifyContent: 'flex-end', marginTop: 16 }}>
            <button className="btn btn-primary" onClick={() => setAlt(false)}>
              J’ai compris !
            </button>
          </div>
        </Modal>
      )}
    </section>
  );
}
