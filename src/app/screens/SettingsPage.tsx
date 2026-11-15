import { Link } from 'react-router';
import { useProfileCtx } from './ProfileLayout';
import type { ProfileSettings } from '@/profiles/types';

export default function SettingsPage() {
  const { profile, update } = useProfileCtx();
  const s = profile.settings;
  const set = (patch: Partial<ProfileSettings>) => void update({ settings: { ...s, ...patch } });
  return (
    <section className="card stack" style={{ gap: 20, maxWidth: 760 }}>
      <h1 style={{ margin: 0 }}>Réglages</h1>
      <div className="field">
        <label htmlFor="ts">Taille du texte : {Math.round(s.textScale * 100)} %</label>
        <input id="ts" type="range" min={1} max={1.35} step={0.05} value={s.textScale} onChange={(e) => set({ textScale: Number(e.target.value) })} style={{ accentColor: 'var(--primary)' }} />
        <p className="muted" style={{ margin: 0 }}>
          Exemple de texte : Le petit hibou lit un grand livre.
        </p>
      </div>
      <label className="switch">
        <input type="checkbox" checked={s.reducedMotion} onChange={(e) => set({ reducedMotion: e.target.checked })} /> Réduire les animations
      </label>
      <label className="switch">
        <input type="checkbox" checked={s.soundEffects} onChange={(e) => set({ soundEffects: e.target.checked })} /> Petits sons de réussite
      </label>
      <label className="switch">
        <input type="checkbox" checked={s.listMode} onChange={(e) => set({ listMode: e.target.checked })} /> Afficher les régions en liste plutôt qu’en carte
      </label>
      <Link className="btn btn-ghost" style={{ alignSelf: 'flex-start' }} to={`/p/${profile.id}/diagnostic`}>
        {profile.diagnosticDone ? 'Refaire le tour de découverte' : 'Faire le tour de découverte'}
      </Link>
      <p className="muted" style={{ margin: 0 }}>
        Le planning, les matières et la durée des séances se règlent dans l’espace parent.
      </p>
    </section>
  );
}
