import { useState } from 'react';
import { Lock, Save } from 'lucide-react';
import { useProfileCtx } from './ProfileLayout';
import { BADGES, COSMETICS, levelFromXp, unlockedCosmetics, xpForLevel, type Badge } from '@/rewards/rewards';
import { AvatarEditor, MascotPicker, ThemePicker } from '@/profiles/AvatarEditor';
import { ProgressBar } from '@/components/ui';
import { useApp } from '../AppContext';

const VALUE_COLORS: Record<Badge['value'], string> = {
  persévérance: '#e0703c',
  progrès: '#2e9fd8',
  régularité: '#3bb37f',
  maîtrise: '#8a6ee8',
  curiosité: '#d9a73a',
};

function Medal({ badge, earned }: { badge: Badge; earned: boolean }) {
  const c = VALUE_COLORS[badge.value];
  return (
    <svg viewBox="0 0 80 96" width="64" height="77" aria-hidden="true" style={{ filter: earned ? 'none' : 'grayscale(1)', opacity: earned ? 1 : 0.4, flex: 'none' }}>
      <path d="M22 0 h14 l8 30 h-14 Z" fill="#c43d5a" />
      <path d="M58 0 h-14 l-8 30 h14 Z" fill="#3d6fc4" />
      <circle cx="40" cy="58" r="30" fill={c} stroke="#fff" strokeWidth="4" />
      <circle cx="40" cy="58" r="21" fill="none" stroke="#ffffff88" strokeWidth="2" strokeDasharray="3 4" />
      <path d="M40 44 l4.5 9 10 1.5 -7.2 7 1.7 10 -9 -4.7 -9 4.7 1.7 -10 -7.2 -7 10 -1.5 Z" fill="#fff" />
    </svg>
  );
}

export default function RewardsPage() {
  const { profile, update } = useProfileCtx();
  const { notify } = useApp();
  const [avatar, setAvatar] = useState(profile.avatar);
  const lv = levelFromXp(profile.rewards.xp);
  const unlocked = unlockedCosmetics(profile.rewards);
  const owned = new Set(profile.rewards.badges.map((b) => b.id));

  return (
    <div className="stack" style={{ gap: 24 }}>
      <section className="card stack">
        <h1 style={{ margin: 0 }}>Mes trésors</h1>
        <div className="row">
          <span className="pill pill-accent" style={{ fontSize: 'var(--fs-l)' }}>
            Niveau {lv.level}
          </span>
          <span className="pill">{profile.rewards.xp} XP au total</span>
          <span className="pill">{profile.rewards.stars} étoiles</span>
          <span className="pill">{profile.rewards.chests} coffre(s) ouvert(s)</span>
        </div>
        <ProgressBar value={lv.into} max={lv.span} label="Progression vers le niveau suivant" />
        <span className="muted">
          Encore {xpForLevel(lv.level + 1) - profile.rewards.xp} XP pour le niveau {lv.level + 1}. Chaque réponse, même fausse, rapporte un peu d’XP : l’effort compte !
        </span>
      </section>

      <section className="card stack" aria-labelledby="badges-title">
        <h2 id="badges-title">Badges</h2>
        <div className="grid-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 230px), 1fr))' }}>
          {BADGES.map((b) => (
            <div key={b.id} className="card-flat row" style={{ flexWrap: 'nowrap', alignItems: 'center' }}>
              <Medal badge={b} earned={owned.has(b.id)} />
              <div>
                <strong>{b.label}</strong>
                <div className="muted" style={{ fontSize: 'var(--fs-s)' }}>
                  {b.description}
                </div>
                <span className="pill" style={{ marginTop: 4, fontSize: 'var(--fs-xs)' }}>
                  {owned.has(b.id) ? 'Obtenu ✔' : b.value}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="card stack" aria-labelledby="avatar-title">
        <h2 id="avatar-title">Mon avatar</h2>
        <AvatarEditor value={avatar} onChange={setAvatar} unlocked={unlocked} />
        <button
          className="btn btn-primary"
          style={{ alignSelf: 'flex-start' }}
          onClick={async () => {
            await update({ avatar });
            notify('Avatar enregistré !', 'success');
          }}
        >
          <Save size={18} /> Enregistrer mon avatar
        </button>
        <h3>Objets à débloquer</h3>
        <ul className="row" style={{ listStyle: 'none', padding: 0 }}>
          {COSMETICS.map((c) => (
            <li key={c.id} className="pill" style={unlocked.includes(c.id) ? { borderColor: 'var(--success)' } : undefined}>
              {!unlocked.includes(c.id) && <Lock size={14} />} {c.label} · {c.level ? `niveau ${c.level}` : `${c.chests} coffre(s)`}
            </li>
          ))}
        </ul>
      </section>

      <section className="card stack">
        <h2>Ma mascotte</h2>
        <MascotPicker value={profile.mascot} onChange={(mascot) => void update({ mascot })} />
      </section>
      <section className="card stack">
        <h2>Mes couleurs</h2>
        <ThemePicker value={profile.theme} onChange={(theme) => void update({ theme })} />
      </section>
    </div>
  );
}
