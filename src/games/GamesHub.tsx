import { Link } from 'react-router';
import { Play, Target } from 'lucide-react';
import { useProfileCtx } from '@/app/screens/ProfileLayout';
import { GAMES } from './catalog';
import { GameArt } from './GameArt';

export default function GamesHub() {
  const { profile } = useProfileCtx();
  return (
    <div className="stack" style={{ gap: 20 }}>
      <div>
        <h1 style={{ margin: 0 }}>Les défis</h1>
        <p className="muted" style={{ margin: 0 }}>
          Des mini-jeux pour s’entraîner autrement. Les questions viennent de ton programme de {profile.level.toUpperCase()}.
        </p>
      </div>
      <div className="grid-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))' }}>
        {GAMES.map((g, i) => (
          <Link key={g.id} to={g.id} className="card card-interactive stack anim-slide" style={{ textDecoration: 'none', padding: 0, overflow: 'hidden', animationDelay: `${i * 50}ms` }}>
            <div style={{ background: g.color, display: 'grid', placeItems: 'center', height: 130 }}>
              <GameArt id={g.id} />
            </div>
            <div className="stack" style={{ padding: '0 20px 20px', gap: 6 }}>
              <h2 style={{ fontSize: 'var(--fs-l)', margin: 0 }}>{g.name}</h2>
              <span className="pill" style={{ alignSelf: 'flex-start' }}>
                <Target size={14} /> {g.goal}
              </span>
              <p className="muted" style={{ margin: 0, fontSize: 'var(--fs-s)' }}>
                {g.description}
              </p>
              <span className="btn btn-sm btn-primary" style={{ alignSelf: 'flex-start' }}>
                <Play size={16} /> Jouer
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
