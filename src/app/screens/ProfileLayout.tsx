import { useState } from 'react';
import { NavLink, Navigate, Outlet, useNavigate, useOutletContext, useParams } from 'react-router';
import { Gamepad2, Gem, Map as MapIcon, Rocket, Settings, Users } from 'lucide-react';
import { useApp, useProfileData } from '../AppContext';
import { Avatar } from '@/art/Avatar';
import { ConfirmModal, Loading, ProgressBar } from '@/components/ui';
import { levelFromXp } from '@/rewards/rewards';
import type { RecordMap } from '@/adaptive-engine/planner';
import type { LevelDefinition } from '@/curriculum/types';
import type { Profile } from '@/profiles/types';

export interface ProfileCtx {
  profile: Profile;
  level: LevelDefinition;
  records: RecordMap;
  refresh: () => Promise<void>;
  update: (patch: Partial<Profile>) => Promise<void>;
}

export function useProfileCtx() {
  return useOutletContext<ProfileCtx>();
}

export function ProfileLayout() {
  const { profileId } = useParams();
  const { busy, setBusy, ready } = useApp();
  const data = useProfileData(profileId);
  const nav = useNavigate();
  const [confirmSwitch, setConfirmSwitch] = useState(false);

  if (!ready) return <Loading />;
  if (!data.profile || !data.level) return <Navigate to="/" replace />;
  if (!data.loaded) return <Loading label="Chargement de ton aventure…" />;
  const { profile, level } = data;
  const lv = levelFromXp(profile.rewards.xp);
  const base = `/p/${profile.id}`;
  const links = [
    { to: base, label: 'Carte', icon: MapIcon, end: true },
    { to: `${base}/mission`, label: 'Mission du jour', icon: Rocket },
    { to: `${base}/jeux`, label: 'Jeux', icon: Gamepad2 },
    { to: `${base}/tresors`, label: 'Trésors', icon: Gem },
    { to: `${base}/reglages`, label: 'Réglages', icon: Settings },
  ];

  const switchProfile = () => (busy ? setConfirmSwitch(true) : nav('/'));

  return (
    <>
      <header className="topbar">
        <div className="container topbar-inner">
          <div className="row" style={{ gap: 10, flexWrap: 'nowrap' }}>
            <Avatar config={profile.avatar} size={46} title={`Avatar de ${profile.name}`} />
            <div style={{ minWidth: 120 }}>
              <strong style={{ display: 'block', lineHeight: 1.1 }}>{profile.name}</strong>
              <span className="muted" style={{ fontSize: 'var(--fs-xs)', fontWeight: 800 }}>
                {level.label} · Niveau {lv.level}
              </span>
              <div style={{ width: 110 }}>
                <ProgressBar value={lv.into} max={lv.span} label={`Expérience : ${lv.into} sur ${lv.span} pour le niveau suivant`} />
              </div>
            </div>
          </div>
          <nav className="nav" aria-label="Navigation principale" style={{ marginLeft: 'auto' }}>
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end}>
                <l.icon size={18} />
                <span>{l.label}</span>
              </NavLink>
            ))}
          </nav>
          <button className="btn btn-ghost btn-sm" onClick={switchProfile} title="Changer de profil">
            <Users size={18} />
            <span className="sr-only">Changer de profil</span>
          </button>
        </div>
      </header>
      <main id="main" className="page">
        <div className="container">
          <Outlet context={{ profile, level, records: data.records, refresh: data.refresh, update: data.update } satisfies ProfileCtx} />
        </div>
      </main>
      {confirmSwitch && (
        <ConfirmModal
          title="Changer de profil ?"
          text="Une activité est en cours. Les réponses déjà données sont sauvegardées, mais l’étape en cours sera interrompue."
          confirmLabel="Oui, changer"
          onCancel={() => setConfirmSwitch(false)}
          onConfirm={() => {
            setBusy(false);
            setConfirmSwitch(false);
            nav('/');
          }}
        />
      )}
    </>
  );
}
