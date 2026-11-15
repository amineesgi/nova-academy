import { Link, useNavigate } from 'react-router';
import { HelpCircle, Plus, ShieldCheck, Sparkles } from 'lucide-react';
import { useApp } from '../AppContext';
import { LEVELS } from '@/curriculum/registry';
import type { LevelId } from '@/curriculum/types';
import { Avatar } from '@/art/Avatar';
import { Mascot } from '@/art/Mascot';
import { levelFromXp } from '@/rewards/rewards';

function NovaLogo() {
  return (
    <svg viewBox="0 0 64 64" width="56" height="56" aria-hidden="true">
      <defs>
        <linearGradient id="nova-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffc94a" />
          <stop offset="1" stopColor="#ff6b8b" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="30" fill="#2d2b7d" />
      <path d="M32 8 L37 26 L56 32 L37 38 L32 56 L27 38 L8 32 L27 26 Z" fill="url(#nova-g)" />
      <circle cx="48" cy="14" r="3" fill="#4fd6c8" />
    </svg>
  );
}

export function Welcome() {
  const { profiles } = useApp();
  const nav = useNavigate();
  const card = (id: LevelId) => {
    const lvl = LEVELS[id];
    const mine = profiles.filter((p) => p.level === id);
    const ce2 = id === 'ce2';
    return (
      <article
        className="card anim-slide"
        style={{
          padding: 0,
          overflow: 'hidden',
          background: ce2 ? 'linear-gradient(160deg, #fff4e0, #ffd9e2 60%, #d9f3dc)' : 'linear-gradient(160deg, #18224a, #2b2470 60%, #13405a)',
          color: ce2 ? '#2b2638' : '#eef2ff',
          animationDelay: ce2 ? '0ms' : '120ms',
        }}
        aria-labelledby={`lvl-${id}`}
      >
        <div className="row" style={{ padding: '28px 28px 0', alignItems: 'flex-start', flexWrap: 'nowrap' }}>
          <div style={{ flex: 1 }}>
            <span className="pill" style={{ background: ce2 ? '#2b9667' : '#2fbfa9', color: '#fff', border: 0 }}>
              Parcours {lvl.label} · {lvl.cycle}
            </span>
            <h2 id={`lvl-${id}`} style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', margin: '12px 0 6px' }}>
              {lvl.worldName}
            </h2>
            <p style={{ opacity: 0.85, margin: 0 }}>{lvl.tagline}</p>
          </div>
          <div className="anim-float">
            <Mascot id={ce2 ? 'pip' : 'orbi'} mood="happy" size={130} />
          </div>
        </div>
        <div className="stack" style={{ padding: 28 }}>
          {mine.map((p) => (
            <button
              key={p.id}
              className="choice"
              style={{ background: ce2 ? '#ffffffcc' : '#ffffff14', color: 'inherit', borderColor: ce2 ? '#0001' : '#fff2' }}
              onClick={() => nav(`/p/${p.id}`)}
            >
              <Avatar config={p.avatar} size={52} title={`Avatar de ${p.name}`} />
              <span style={{ flex: 1 }}>
                <span style={{ display: 'block', fontSize: 'var(--fs-l)' }}>{p.name}</span>
                <span style={{ opacity: 0.75, fontSize: 'var(--fs-s)' }}>Niveau {levelFromXp(p.rewards.xp).level} · {p.rewards.stars} étoiles</span>
              </span>
              <span className="btn btn-sm btn-primary" aria-hidden="true">
                Continuer
              </span>
            </button>
          ))}
          <Link to={`/nouveau/${id}`} className={mine.length ? 'btn btn-ghost' : 'btn btn-primary btn-lg'} style={mine.length ? { color: 'inherit', borderColor: ce2 ? '#0002' : '#fff3' } : undefined}>
            <Plus /> {mine.length ? 'Ajouter un autre profil' : `Commencer l’aventure ${lvl.label}`}
          </Link>
        </div>
      </article>
    );
  };

  return (
    <main id="main" className="page">
      <div className="container stack" style={{ gap: 32 }}>
        <header className="row" style={{ justifyContent: 'space-between' }}>
          <div className="brand">
            <NovaLogo />
            <span>
              Nova Academy<small>Révisions CE2 · CM2</small>
            </span>
          </div>
          <nav className="row" aria-label="Liens utiles">
            <Link to="/aide" className="btn btn-ghost btn-sm">
              <HelpCircle size={18} /> Aide
            </Link>
            <Link to="/parent" className="btn btn-ghost btn-sm">
              <ShieldCheck size={18} /> Espace parent
            </Link>
          </nav>
        </header>
        <section className="center stack" style={{ alignItems: 'center', gap: 6 }}>
          <span className="pill pill-accent">
            <Sparkles size={16} /> Gratuit · sans compte · fonctionne hors ligne
          </span>
          <h1 className="hero-title">Bienvenue dans Nova Academy</h1>
          <p style={{ fontSize: 'var(--fs-xl)', fontFamily: 'var(--font-display)', color: 'var(--ink-soft)', margin: 0 }}>Deux aventures, mille découvertes.</p>
        </section>
        <div className="grid-2">
          {card('ce2')}
          {card('cm2')}
        </div>
        <p className="center muted" style={{ fontSize: 'var(--fs-s)' }}>
          Les progrès sont enregistrés uniquement dans ce navigateur, sur cet ordinateur. Pour changer d’ordinateur, utilise l’export de sauvegarde dans l’espace parent.
        </p>
      </div>
    </main>
  );
}
