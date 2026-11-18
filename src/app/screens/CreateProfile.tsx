import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { LEVELS } from '@/curriculum/registry';
import { LEVEL_DEFAULTS } from '@/profiles/levelDefaults';
import type { LevelId } from '@/curriculum/types';
import { AvatarEditor, MascotPicker, ThemePicker } from '@/profiles/AvatarEditor';
import { newProfile, saveProfile } from '@/storage/repo';
import { applyAppearance, useApp } from '../AppContext';
import type { Profile } from '@/profiles/types';

const STEPS = ['Ton prénom', 'Ton avatar', 'Ta mascotte', 'Tes couleurs'];

export function CreateProfile() {
  const { level } = useParams();
  const { reloadProfiles } = useApp();
  const nav = useNavigate();
  const valid = !!level && level in LEVELS;
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Profile | null>(valid ? newProfile(level as LevelId, '') : null);
  const [name, setName] = useState('');

  useEffect(() => {
    if (draft && step >= 3) applyAppearance(draft.theme);
  }, [draft, step]);

  if (!valid || !draft) return <Navigate to="/" replace />;
  const lvl = LEVELS[draft.level];
  const cleanName = name.replace(/[^\p{L}\p{N} '’-]/gu, '').slice(0, 20);

  const finish = async () => {
    const p = { ...draft, name: cleanName.trim() || draft.name };
    await saveProfile(p);
    await reloadProfiles();
    nav(`/p/${p.id}/diagnostic`);
  };

  return (
    <main id="main" className="page">
      <div className="container stack" style={{ maxWidth: 900, gap: 20 }}>
        <Link to="/" className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-start' }}>
          <ArrowLeft size={18} /> Accueil
        </Link>
        <div className="card stack" style={{ gap: 20 }}>
          <div>
            <span className="pill pill-primary">
              {lvl.label} · {lvl.worldName}
            </span>
            <h1 style={{ marginTop: 10 }}>Création de ton profil</h1>
            <div className="row">
              <div className="step-dots" aria-hidden="true">
                {STEPS.map((s, i) => (
                  <span key={s} className={i <= step ? 'on' : ''} />
                ))}
              </div>
              <strong className="muted">
                Étape {step + 1} / {STEPS.length} : {STEPS[step]}
              </strong>
            </div>
          </div>

          {step === 0 && (
            <div className="field">
              <label htmlFor="pname">Comment veux-tu qu’on t’appelle ? (un prénom ou un surnom)</label>
              <input id="pname" className="input" autoFocus maxLength={20} value={name} onChange={(e) => setName(e.target.value)} placeholder={LEVEL_DEFAULTS[draft.level].namePlaceholder} autoComplete="off" />
              <span className="kbd-hint">Pas besoin de nom de famille : un prénom ou un pseudo suffit.</span>
            </div>
          )}
          {step === 1 && <AvatarEditor value={draft.avatar} onChange={(avatar) => setDraft({ ...draft, avatar })} unlocked={[]} />}
          {step === 2 && <MascotPicker value={draft.mascot} onChange={(mascot) => setDraft({ ...draft, mascot })} />}
          {step === 3 && (
            <div className="stack">
              <p className="muted" style={{ margin: 0 }}>
                Choisis l’ambiance de ton aventure. Tu pourras la changer quand tu veux.
              </p>
              <ThemePicker value={draft.theme} onChange={(theme) => setDraft({ ...draft, theme })} />
            </div>
          )}

          <div className="row">
            <button className="btn btn-ghost" disabled={step === 0} onClick={() => setStep(step - 1)}>
              <ArrowLeft size={20} /> Retour
            </button>
            <span className="spacer" />
            {step < STEPS.length - 1 ? (
              <button className="btn btn-primary btn-lg" disabled={step === 0 && !cleanName.trim()} onClick={() => setStep(step + 1)}>
                Suivant <ArrowRight />
              </button>
            ) : (
              <button className="btn btn-success btn-lg" onClick={() => void finish()}>
                <Check /> C’est parti !
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
