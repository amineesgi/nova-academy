import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { AlertTriangle, ChevronRight, Clock, Target } from 'lucide-react';
import { useApp } from '@/app/AppContext';
import { LEVELS, getSkill } from '@/curriculum/registry';
import type { RecordMap } from '@/adaptive-engine/planner';
import { todayISO } from '@/adaptive-engine/mastery';
import { Avatar } from '@/art/Avatar';
import { Loading } from '@/components/ui';
import type { AttemptRow, SessionRow } from '@/storage/db';
import { attemptsFor, loadRecords, sessionsFor } from '@/storage/repo';
import type { Profile } from '@/profiles/types';
import { levelFromXp } from '@/rewards/rewards';
import { recommendations, stateDistribution, subjectStats, weeklyStats } from './stats';
import { StatesBar, SubjectBars, WeeklyChart } from './charts';

export interface ProfileData {
  attempts: AttemptRow[];
  sessions: SessionRow[];
  records: RecordMap;
}

export async function loadProfileData(id: string): Promise<ProfileData> {
  const [attempts, sessions, records] = await Promise.all([attemptsFor(id), sessionsFor(id), loadRecords(id)]);
  return { attempts, sessions, records };
}

function ProfileSummary({ profile }: { profile: Profile }) {
  const [data, setData] = useState<ProfileData | null>(null);
  useEffect(() => {
    void loadProfileData(profile.id).then(setData);
  }, [profile.id]);
  const level = LEVELS[profile.level];
  if (!data) return <div className="card"><Loading /></div>;
  const weeks = weeklyStats(data.sessions, data.attempts);
  const thisWeek = weeks[weeks.length - 1]!;
  const recos = recommendations(level, data.records, data.attempts);
  const rate = data.attempts.length ? Math.round((data.attempts.filter((a) => a.correct).length / data.attempts.length) * 100) : 0;
  const today = todayISO();
  return (
    <article className="card stack" aria-labelledby={`p-${profile.id}`} style={{ gap: 18 }}>
      <div className="row" style={{ flexWrap: 'nowrap' }}>
        <Avatar config={profile.avatar} size={64} title={`Avatar de ${profile.name}`} />
        <div style={{ flex: 1 }}>
          <h2 id={`p-${profile.id}`} style={{ margin: 0 }}>
            {profile.name} <span className="pill pill-primary">{level.label}</span>
          </h2>
          <span className="muted">
            Niveau {levelFromXp(profile.rewards.xp).level} · {profile.rewards.badges.length} badges · créé le {new Date(profile.createdAt).toLocaleDateString('fr-FR')}
          </span>
        </div>
        <Link className="btn btn-primary" to={`profil/${profile.id}`}>
          Détails <ChevronRight size={18} />
        </Link>
      </div>
      <div className="grid-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
        <div className="card-flat"><div className="muted">Cette semaine</div><strong style={{ fontSize: 'var(--fs-xl)' }}><Clock size={18} /> {thisWeek.minutes} min</strong></div>
        <div className="card-flat"><div className="muted">Séances (total)</div><strong style={{ fontSize: 'var(--fs-xl)' }}>{data.sessions.length}</strong></div>
        <div className="card-flat"><div className="muted">Réponses justes</div><strong style={{ fontSize: 'var(--fs-xl)' }}>{rate} %</strong><div className="kbd-hint">sur {data.attempts.length} réponses</div></div>
        <div className="card-flat"><div className="muted">Aujourd’hui</div><strong style={{ fontSize: 'var(--fs-l)' }}>{profile.lastMissionDate === today ? 'Mission faite' : 'Pas encore'}</strong></div>
      </div>
      <div className="grid-2">
        <div className="stack">
          <h3 style={{ margin: 0 }}>Évolution hebdomadaire</h3>
          <WeeklyChart data={weeks} />
        </div>
        <div className="stack">
          <h3 style={{ margin: 0 }}>Résultats par matière</h3>
          <SubjectBars data={subjectStats(level, data.attempts, data.records, profile.id)} />
        </div>
      </div>
      <div className="stack">
        <h3 style={{ margin: 0 }}>État des compétences ({level.skills.length})</h3>
        <StatesBar dist={stateDistribution(level, data.records)} />
      </div>
      <div className="stack">
        <h3 className="row" style={{ margin: 0 }}>
          <Target size={20} /> Recommandations de révision
        </h3>
        {recos.length === 0 ? (
          <p className="muted" style={{ margin: 0 }}>Rien à signaler pour l’instant.</p>
        ) : (
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {recos.map((r) => (
              <li key={r.skillId + r.reason}>
                <strong>{getSkill(r.skillId)?.title}</strong> — {r.reason}
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}

export function ParentOverview() {
  const { profiles } = useApp();
  return (
    <div className="stack" style={{ gap: 24 }}>
      <div>
        <h1 style={{ margin: 0 }}>Tableau de bord</h1>
        <p className="muted" style={{ margin: 0 }}>
          Toutes les données affichées proviennent des réponses réellement enregistrées sur ce navigateur.
        </p>
      </div>
      <div className="feedback feedback-info">
        <AlertTriangle size={20} style={{ flex: 'none' }} />
        <span>
          Les données restent sur cet ordinateur (pas de synchronisation). Pensez à exporter une sauvegarde régulièrement dans « Sauvegardes ».
        </span>
      </div>
      {profiles.length === 0 && (
        <div className="card">
          Aucun profil pour l’instant. <Link to="/">Créer un profil depuis l’accueil</Link>.
        </div>
      )}
      {profiles.map((p) => (
        <ProfileSummary key={p.id} profile={p} />
      ))}
    </div>
  );
}
