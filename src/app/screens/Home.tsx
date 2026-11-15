import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { CalendarCheck, CheckCircle2, ClipboardList, Compass, List, Lock, Map as MapIcon, Play, RefreshCcw, Star, Trophy } from 'lucide-react';
import { useProfileCtx } from './ProfileLayout';
import { BLOCK_LABELS, buildDailyMission, isUnlocked, stateOf } from '@/adaptive-engine/planner';
import { STATE_LABELS, isDue, todayISO, type SkillState } from '@/adaptive-engine/mastery';
import { getSkill } from '@/curriculum/registry';
import { SUBJECT_LABELS, type Region } from '@/curriculum/types';
import { AdventureMap, type RegionStatus } from '@/art/AdventureMap';
import { Mascot } from '@/art/Mascot';
import { Modal, SubjectBadge } from '@/components/ui';
import { openRegions, unlockHint } from '@/progression/regions';
import { sessionsFor } from '@/storage/repo';

const STATE_COLORS: Record<SkillState, string> = {
  not_started: 'var(--line)',
  discovery: '#7cb7ff',
  learning: '#ffb547',
  consolidate: '#a77ee6',
  mastered: '#2fbf71',
};

export function StateDot({ state }: { state: SkillState }) {
  return <span aria-hidden="true" style={{ display: 'inline-block', width: 14, height: 14, borderRadius: 99, background: STATE_COLORS[state], border: '2px solid var(--surface)', boxShadow: '0 0 0 1px var(--line)', flex: 'none' }} />;
}

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Bonjour' : h < 18 ? 'Bon après-midi' : 'Bonsoir';
}

export function Home() {
  const { profile, level, records } = useProfileCtx();
  const nav = useNavigate();
  const [missions, setMissions] = useState(0);
  const [region, setRegion] = useState<Region | null>(null);
  const [listMode, setListMode] = useState(profile.settings.listMode);
  const today = todayISO();

  useEffect(() => {
    void sessionsFor(profile.id).then((s) => setMissions(s.filter((x) => x.kind === 'mission').length));
  }, [profile.id]);

  const open = useMemo(() => openRegions(level, profile, missions), [level, profile, missions]);
  const mission = useMemo(() => buildDailyMission(level, profile, records, new Date(), today, open), [level, profile, records, today, open]);
  const dueCount = level.skills.filter((s) => { const r = records.get(s.id); return r && isDue(r, today); }).length;
  const consolidated = level.skills.filter((s) => ['consolidate', 'mastered'].includes(stateOf(records, profile.id, s.id))).length;
  const missionDone = profile.lastMissionDate === today;
  const dayIdx = (new Date().getDay() + 6) % 7;
  const plannedToday = profile.plan.days[dayIdx];
  const pendingCustom = profile.customSessions.filter((c) => !c.done);
  const showDiag = !profile.diagnosticDone && missions === 0;

  const statuses: RegionStatus[] = level.regions.map((r) => {
    const skills = level.skills.filter((s) => s.region === r.id);
    return {
      region: r,
      open: open.has(r.id),
      done: skills.filter((s) => ['consolidate', 'mastered'].includes(stateOf(records, profile.id, s.id))).length,
      total: skills.length,
      unlockHint: unlockHint(level, r, missions),
    };
  });

  return (
    <div className="stack" style={{ gap: 24 }}>
      <section className="grid-2" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))' }}>
        <div className="card row anim-slide" style={{ alignItems: 'center', flexWrap: 'nowrap', gap: 18 }}>
          <div className="anim-float" style={{ flex: 'none' }}>
            <Mascot id={profile.mascot} mood="happy" size={120} />
          </div>
          <div className="stack" style={{ gap: 8 }}>
            <h1 style={{ margin: 0, fontSize: 'var(--fs-xl)' }}>
              {greeting()} {profile.name} !
            </h1>
            <p className="speech" style={{ margin: 0 }}>
              {showDiag
                ? 'Avant de commencer, faisons un petit tour de découverte pour savoir par où commencer.'
                : missionDone
                  ? 'Mission du jour accomplie ! Tu peux explorer la carte ou jouer à un défi.'
                  : plannedToday
                    ? 'Ta mission du jour est prête. On y va ?'
                    : 'Aujourd’hui est un jour de repos prévu. Tu peux quand même explorer si tu en as envie !'}
            </p>
            <div className="row" style={{ gap: 8 }}>
              <span className="pill">
                <Star size={16} color="#e8a400" fill="#ffc93c" /> {profile.rewards.stars} étoiles
              </span>
              <span className="pill">
                <Trophy size={16} /> {profile.rewards.badges.length} badges
              </span>
              <span className="pill">
                <CheckCircle2 size={16} /> {consolidated}/{level.skills.length} compétences consolidées
              </span>
            </div>
          </div>
        </div>

        <div className="card stack anim-slide" style={{ animationDelay: '80ms', background: 'linear-gradient(135deg, color-mix(in srgb, var(--primary) 22%, var(--surface)), var(--surface))' }}>
          {showDiag ? (
            <>
              <h2 className="row" style={{ margin: 0 }}>
                <Compass /> Le tour de découverte
              </h2>
              <p style={{ margin: 0 }}>Quelques questions tranquilles, sans note, pour préparer des missions à ta mesure.</p>
              <button className="btn btn-primary btn-lg pulse" onClick={() => nav('diagnostic')}>
                <Play /> Commencer la découverte
              </button>
              <button className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-start' }} onClick={() => nav('mission')}>
                Passer et aller à la mission
              </button>
            </>
          ) : (
            <>
              <h2 className="row" style={{ margin: 0 }}>
                <CalendarCheck /> Mission du jour {missionDone && <span className="pill pill-primary">Accomplie</span>}
              </h2>
              <ul className="stack" style={{ listStyle: 'none', padding: 0, margin: 0, gap: 8 }}>
                {mission.map((b) => {
                  const s = getSkill(b.skillId);
                  if (!s) return null;
                  return (
                    <li key={b.skillId} className="row" style={{ flexWrap: 'nowrap' }}>
                      <SubjectBadge subject={s.subject} size={34} />
                      <span style={{ flex: 1 }}>
                        <strong>{s.title}</strong>
                        <span className="muted" style={{ display: 'block', fontSize: 'var(--fs-xs)', fontWeight: 800 }}>
                          {SUBJECT_LABELS[s.subject]} · {BLOCK_LABELS[b.kind]}
                        </span>
                      </span>
                    </li>
                  );
                })}
              </ul>
              <div className="row">
                <button className={`btn btn-lg ${missionDone ? 'btn-ghost' : 'btn-primary pulse'}`} onClick={() => nav('mission')} disabled={mission.length === 0}>
                  <Play /> {missionDone ? 'Refaire une mission' : 'Lancer la mission'}
                </button>
                <span className="muted" style={{ fontSize: 'var(--fs-s)' }}>
                  ≈ {profile.plan.minutes} min{dueCount > 0 ? ` · ${dueCount} révision${dueCount > 1 ? 's' : ''} prévue${dueCount > 1 ? 's' : ''}` : ''}
                </span>
              </div>
            </>
          )}
        </div>
      </section>

      {pendingCustom.length > 0 && (
        <section className="card stack" aria-labelledby="custom-title">
          <h2 id="custom-title" className="row" style={{ margin: 0 }}>
            <ClipboardList /> Séance préparée par ton adulte
          </h2>
          {pendingCustom.map((c) => (
            <div key={c.id} className="row">
              <strong style={{ flex: 1 }}>{c.title}</strong>
              <span className="muted">{c.skillIds.length} compétence(s)</span>
              <Link className="btn btn-accent" to={`seance/${c.id}`}>
                <Play size={18} /> Commencer
              </Link>
            </div>
          ))}
        </section>
      )}

      <section className="stack" aria-labelledby="map-title">
        <div className="row">
          <h2 id="map-title" style={{ margin: 0, flex: 1 }}>
            {level.worldName}
          </h2>
          <div className="row" role="group" aria-label="Affichage">
            <button className="btn btn-sm" aria-pressed={!listMode} onClick={() => setListMode(false)}>
              <MapIcon size={16} /> Carte
            </button>
            <button className="btn btn-sm" aria-pressed={listMode} onClick={() => setListMode(true)}>
              <List size={16} /> Liste
            </button>
          </div>
        </div>
        {!listMode ? (
          <AdventureMap level={level} statuses={statuses} onSelect={setRegion} decorations={profile.rewards.cosmetics} />
        ) : (
          <div className="stack">
            {statuses.map((st) => (
              <RegionPanel key={st.region.id} status={st} inline />
            ))}
          </div>
        )}
      </section>

      {region && (
        <Modal title={region.name} onClose={() => setRegion(null)}>
          <RegionPanel status={statuses.find((s) => s.region.id === region.id)!} />
        </Modal>
      )}
    </div>
  );
}

function RegionPanel({ status, inline }: { status: RegionStatus; inline?: boolean }) {
  const { profile, level, records } = useProfileCtx();
  const nav = useNavigate();
  const skills = level.skills.filter((s) => s.region === status.region.id);
  const content = (
    <div className="stack">
      <p className="muted" style={{ margin: 0 }}>
        {status.region.description}
      </p>
      {!status.open && (
        <div className="feedback feedback-info">
          <Lock size={20} /> Cette région s’ouvrira bientôt : {status.unlockHint}.
        </div>
      )}
      <ul className="stack" style={{ listStyle: 'none', padding: 0, margin: 0, gap: 8 }}>
        {skills.map((s) => {
          const st = stateOf(records, profile.id, s.id);
          const unlocked = status.open && isUnlocked(level, s, records, profile);
          const rec = records.get(s.id);
          return (
            <li key={s.id}>
              <button className="choice" style={{ width: '100%' }} disabled={!unlocked} onClick={() => nav(`competence/${s.id}`)} aria-label={`${s.title} — ${STATE_LABELS[st]}${unlocked ? '' : ' (verrouillée)'}`}>
                <StateDot state={st} />
                <span style={{ flex: 1 }}>
                  {s.title}
                  <span className="muted" style={{ display: 'block', fontSize: 'var(--fs-xs)' }}>
                    {SUBJECT_LABELS[s.subject]} · {STATE_LABELS[st]}
                    {rec && isDue(rec, todayISO()) ? ' · révision à faire' : ''}
                  </span>
                </span>
                {!unlocked ? <Lock size={18} /> : rec && isDue(rec, todayISO()) ? <RefreshCcw size={18} /> : <Play size={18} />}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
  if (!inline) return content;
  return (
    <details className="card" open={false}>
      <summary className="row" style={{ cursor: 'pointer', listStyle: 'none' }}>
        <span style={{ width: 16, height: 16, borderRadius: 99, background: status.region.color }} />
        <strong style={{ flex: 1, fontSize: 'var(--fs-l)' }}>{status.region.name}</strong>
        <span className="pill">
          {status.done}/{status.total}
        </span>
        {!status.open && <Lock size={18} />}
      </summary>
      <div style={{ marginTop: 12 }}>{content}</div>
    </details>
  );
}
