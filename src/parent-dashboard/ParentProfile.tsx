import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router';
import { ArrowLeft, Check, Plus, Save, Trash2, X } from 'lucide-react';
import { useApp } from '@/app/AppContext';
import { LEVELS, getSkill } from '@/curriculum/registry';
import { SUBJECT_LABELS, type SubjectId } from '@/curriculum/types';
import { STATE_LABELS, accuracy, computeState } from '@/adaptive-engine/mastery';
import { blockCountFor } from '@/adaptive-engine/planner';
import { Avatar } from '@/art/Avatar';
import { ConfirmModal, Loading } from '@/components/ui';
import { StateDot } from '@/app/screens/Home';
import type { Profile, WeeklyPlan } from '@/profiles/types';
import { deleteProfile, resetProfileProgress, saveProfile, uid } from '@/storage/repo';
import { loadProfileData, type ProfileData } from './ParentOverview';
import { changePin } from './ParentArea';

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
type Tab = 'progression' | 'historique' | 'planning' | 'seance' | 'gestion';

export function ParentProfile() {
  const { profileId } = useParams();
  const { profiles, reloadProfiles, notify } = useApp();
  const profile = profiles.find((p) => p.id === profileId);
  const [data, setData] = useState<ProfileData | null>(null);
  const [tab, setTab] = useState<Tab>('progression');
  useEffect(() => {
    if (profileId) void loadProfileData(profileId).then(setData);
  }, [profileId]);
  if (!profile) return <Navigate to="/parent" replace />;
  const level = LEVELS[profile.level];
  const save = async (p: Profile, msg = 'Modifications enregistrées.') => {
    await saveProfile(p);
    await reloadProfiles();
    notify(msg, 'success');
  };
  const tabs: [Tab, string][] = [
    ['progression', 'Progression'],
    ['historique', 'Historique et corrections'],
    ['planning', 'Planning'],
    ['seance', 'Séance personnalisée'],
    ['gestion', 'Gestion'],
  ];

  return (
    <div className="stack" style={{ gap: 20 }}>
      <Link to="/parent" className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-start' }}>
        <ArrowLeft size={18} /> Tableau de bord
      </Link>
      <div className="row">
        <Avatar config={profile.avatar} size={60} />
        <h1 style={{ margin: 0 }}>
          {profile.name} · {level.label}
        </h1>
      </div>
      <div className="row" role="tablist" aria-label="Sections">
        {tabs.map(([id, label]) => (
          <button key={id} role="tab" aria-selected={tab === id} className={`btn btn-sm ${tab === id ? 'btn-primary' : ''}`} onClick={() => setTab(id)}>
            {label}
          </button>
        ))}
      </div>
      {!data ? (
        <Loading />
      ) : (
        <div role="tabpanel">
          {tab === 'progression' && <ProgressionTab profile={profile} data={data} />}
          {tab === 'historique' && <HistoryTab data={data} />}
          {tab === 'planning' && <PlanningTab profile={profile} onSave={(p) => void save(p, 'Planning enregistré.')} />}
          {tab === 'seance' && <CustomTab profile={profile} data={data} onSave={(p) => void save(p, 'Séance ajoutée : elle apparaît sur l’accueil de l’enfant.')} />}
          {tab === 'gestion' && <ManageTab profile={profile} onChanged={async () => { await reloadProfiles(); setData(await loadProfileData(profile.id)); }} />}
        </div>
      )}
    </div>
  );
}

function ProgressionTab({ profile, data }: { profile: Profile; data: ProfileData }) {
  const level = LEVELS[profile.level];
  return (
    <div className="stack">
      {level.subjects.map((subj) => (
        <section key={subj} className="card stack">
          <h2 style={{ margin: 0 }}>{SUBJECT_LABELS[subj]}</h2>
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Compétence</th>
                  <th>État</th>
                  <th>Réponses</th>
                  <th>Réussite récente</th>
                  <th>Prochaine révision</th>
                  <th>Référence</th>
                </tr>
              </thead>
              <tbody>
                {level.skills
                  .filter((s) => s.subject === subj)
                  .map((s) => {
                    const r = data.records.get(s.id);
                    const st = r ? computeState(r) : 'not_started';
                    return (
                      <tr key={s.id}>
                        <td>
                          <strong>{s.title}</strong>
                          <div className="kbd-hint">{s.domain}</div>
                        </td>
                        <td>
                          <span className="row" style={{ gap: 6, flexWrap: 'nowrap' }}>
                            <StateDot state={st} /> {STATE_LABELS[st]}
                            {r?.needsSupport && <span className="pill" style={{ fontSize: 'var(--fs-xs)' }}>à accompagner</span>}
                          </span>
                        </td>
                        <td>{r?.attempts ?? 0}</td>
                        <td>{r && r.recent.length ? `${Math.round(accuracy(r) * 100)} %` : '—'}</td>
                        <td>{r?.nextReview ? r.nextReview.split('-').reverse().join('/') : '—'}</td>
                        <td className="kbd-hint" style={{ maxWidth: 260 }}>{s.programRef}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </section>
      ))}
      <p className="kbd-hint">
        « Maîtrisée provisoirement » = au moins 85 % de réussite sur les 8 dernières réponses, sur 2 jours différents, avec une révision espacée réussie. Ce n’est pas une note scolaire : c’est un repère pour orienter les révisions.
      </p>
    </div>
  );
}

function HistoryTab({ data }: { data: ProfileData }) {
  const [onlyErrors, setOnlyErrors] = useState(false);
  const rows = [...data.attempts].sort((a, b) => b.at.localeCompare(a.at)).filter((a) => !onlyErrors || !a.correct).slice(0, 150);
  return (
    <section className="card stack">
      <label className="switch">
        <input type="checkbox" checked={onlyErrors} onChange={(e) => setOnlyErrors(e.target.checked)} /> Afficher seulement les erreurs
      </label>
      <div style={{ overflowX: 'auto' }}>
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Compétence</th>
              <th>Question</th>
              <th>Réponse donnée</th>
              <th>Réponse attendue</th>
              <th>Résultat</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((a) => (
              <tr key={a.id}>
                <td>{new Date(a.at).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}</td>
                <td>{getSkill(a.skillId)?.title ?? a.skillId}</td>
                <td style={{ maxWidth: 280 }}>{a.prompt}</td>
                <td>{a.given || '—'}</td>
                <td>{a.expected}</td>
                <td>
                  {a.correct ? <Check color="var(--success)" aria-label="juste" /> : <X color="var(--danger)" aria-label="faux" />}
                  <span className="kbd-hint"> {a.tries > 1 ? '2e essai' : ''}{a.hintsUsed ? ' · indice' : ''} · {a.context}</span>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="muted">Aucune réponse enregistrée.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <span className="kbd-hint">150 réponses les plus récentes affichées. L’export de sauvegarde contient l’historique complet.</span>
    </section>
  );
}

function PlanningTab({ profile, onSave }: { profile: Profile; onSave: (p: Profile) => void }) {
  const level = LEVELS[profile.level];
  const [plan, setPlan] = useState<WeeklyPlan>(profile.plan);
  const toggleSubj = (s: SubjectId, key: 'subjects' | 'priorities') => setPlan({ ...plan, [key]: plan[key].includes(s) ? plan[key].filter((x) => x !== s) : [...plan[key], s] });
  return (
    <section className="card stack" style={{ gap: 20 }}>
      <div className="field">
        <label htmlFor="dur">
          Durée d’une séance : {plan.minutes} minutes (conseillé : {level.sessionRange[0]} à {level.sessionRange[1]} min) — environ {blockCountFor(plan.minutes, level)} étapes
        </label>
        <input id="dur" type="range" min={10} max={40} step={5} value={plan.minutes} onChange={(e) => setPlan({ ...plan, minutes: Number(e.target.value) })} style={{ accentColor: 'var(--primary)' }} />
      </div>
      <fieldset className="stack" style={{ border: 0, padding: 0 }}>
        <legend className="label">Jours de révision ({plan.days.filter(Boolean).length} par semaine)</legend>
        <div className="row">
          {DAYS.map((d, i) => (
            <label key={d} className="switch pill">
              <input type="checkbox" checked={plan.days[i]} onChange={(e) => setPlan({ ...plan, days: plan.days.map((v, k) => (k === i ? e.target.checked : v)) })} /> {d}
            </label>
          ))}
        </div>
        <span className="kbd-hint">Les jours non cochés, aucune mission n’est attendue. Une séance manquée n’est jamais pénalisée.</span>
      </fieldset>
      <fieldset className="stack" style={{ border: 0, padding: 0 }}>
        <legend className="label">Matières incluses dans les missions</legend>
        <div className="row">
          {level.subjects.map((s) => (
            <label key={s} className="switch pill">
              <input type="checkbox" checked={plan.subjects.includes(s)} onChange={() => toggleSubj(s, 'subjects')} /> {SUBJECT_LABELS[s]}
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset className="stack" style={{ border: 0, padding: 0 }}>
        <legend className="label">Matières prioritaires (proposées plus souvent)</legend>
        <div className="row">
          {level.subjects.map((s) => (
            <label key={s} className="switch pill">
              <input type="checkbox" checked={plan.priorities.includes(s)} onChange={() => toggleSubj(s, 'priorities')} /> {SUBJECT_LABELS[s]}
            </label>
          ))}
        </div>
      </fieldset>
      <label className="switch">
        <input type="checkbox" checked={plan.freeExplore} onChange={(e) => setPlan({ ...plan, freeExplore: e.target.checked })} /> Exploration libre : ouvrir toutes les régions et compétences sans attendre les prérequis
      </label>
      <button className="btn btn-primary" style={{ alignSelf: 'flex-start' }} disabled={plan.subjects.length === 0} onClick={() => onSave({ ...profile, plan })}>
        <Save size={18} /> Enregistrer le planning
      </button>
    </section>
  );
}

function CustomTab({ profile, data, onSave }: { profile: Profile; data: ProfileData; onSave: (p: Profile) => void }) {
  const level = LEVELS[profile.level];
  const [title, setTitle] = useState('Séance spéciale');
  const [sel, setSel] = useState<string[]>([]);
  const weak = useMemo(() => level.skills.filter((s) => data.records.get(s.id)?.needsSupport).map((s) => s.id), [level, data]);
  return (
    <section className="card stack">
      <p className="muted" style={{ margin: 0 }}>
        Choisissez jusqu’à 5 compétences. La séance apparaîtra sur l’accueil de l’enfant (« Séance préparée par ton adulte »).
      </p>
      <div className="field">
        <label htmlFor="ctitle">Titre</label>
        <input id="ctitle" className="input" value={title} maxLength={40} onChange={(e) => setTitle(e.target.value)} />
      </div>
      {weak.length > 0 && (
        <button className="btn btn-sm btn-ghost" style={{ alignSelf: 'flex-start' }} onClick={() => setSel(weak.slice(0, 5))}>
          Sélectionner les compétences à accompagner ({weak.length})
        </button>
      )}
      {level.subjects.map((subj) => (
        <details key={subj}>
          <summary style={{ cursor: 'pointer', fontWeight: 800 }}>{SUBJECT_LABELS[subj]}</summary>
          <div className="stack" style={{ padding: '8px 0' }}>
            {level.skills
              .filter((s) => s.subject === subj)
              .map((s) => (
                <label key={s.id} className="switch">
                  <input type="checkbox" checked={sel.includes(s.id)} disabled={!sel.includes(s.id) && sel.length >= 5} onChange={(e) => setSel(e.target.checked ? [...sel, s.id] : sel.filter((x) => x !== s.id))} /> {s.title}
                </label>
              ))}
          </div>
        </details>
      ))}
      <button
        className="btn btn-primary"
        style={{ alignSelf: 'flex-start' }}
        disabled={sel.length === 0}
        onClick={() => {
          onSave({ ...profile, customSessions: [...profile.customSessions, { id: uid(), title: title.trim() || 'Séance spéciale', skillIds: sel, createdAt: new Date().toISOString(), done: false }] });
          setSel([]);
        }}
      >
        <Plus size={18} /> Créer la séance ({sel.length})
      </button>
      {profile.customSessions.length > 0 && (
        <>
          <h3>Séances créées</h3>
          <ul>
            {profile.customSessions.map((c) => (
              <li key={c.id}>
                {c.title} — {c.skillIds.map((id) => getSkill(id)?.title).join(', ')} — {c.done ? 'terminée' : 'à faire'}
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

function ManageTab({ profile, onChanged }: { profile: Profile; onChanged: () => Promise<void> }) {
  const nav = useNavigate();
  const { notify } = useApp();
  const [confirm, setConfirm] = useState<null | 'reset' | 'delete'>(null);
  const [typed, setTyped] = useState('');
  const [pin, setPin] = useState('');
  return (
    <section className="card stack" style={{ gap: 20 }}>
      <div className="stack">
        <h3 style={{ margin: 0 }}>Changer le code parent</h3>
        <div className="row">
          <input className="input" style={{ maxWidth: 160 }} type="password" inputMode="numeric" maxLength={4} aria-label="Nouveau code" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} />
          <button className="btn" disabled={pin.length !== 4} onClick={() => void changePin(pin).then(() => { setPin(''); notify('Code parent modifié.', 'success'); })}>
            Enregistrer
          </button>
        </div>
      </div>
      <div className="stack">
        <h3 style={{ margin: 0 }}>Réinitialiser la progression</h3>
        <p className="muted" style={{ margin: 0 }}>Efface l’historique, les compétences, les récompenses et les séances de {profile.name}. Le prénom, l’avatar et le planning sont conservés. Pensez à exporter une sauvegarde avant.</p>
        <button className="btn btn-danger" style={{ alignSelf: 'flex-start' }} onClick={() => setConfirm('reset')}>
          Réinitialiser…
        </button>
      </div>
      <div className="stack">
        <h3 style={{ margin: 0 }}>Supprimer le profil</h3>
        <button className="btn btn-danger" style={{ alignSelf: 'flex-start' }} onClick={() => setConfirm('delete')}>
          <Trash2 size={18} /> Supprimer…
        </button>
      </div>
      {confirm && (
        <ConfirmModal
          danger
          title={confirm === 'reset' ? 'Réinitialiser la progression ?' : 'Supprimer le profil ?'}
          confirmLabel={confirm === 'reset' ? 'Réinitialiser' : 'Supprimer définitivement'}
          text={
            <div className="stack">
              <p style={{ margin: 0 }}>Cette action est définitive sur cet ordinateur (sauf si vous avez une sauvegarde). Pour confirmer, tapez le prénom « {profile.name} ».</p>
              <input className="input" aria-label="Prénom pour confirmer" value={typed} onChange={(e) => setTyped(e.target.value)} />
            </div>
          }
          onCancel={() => {
            setConfirm(null);
            setTyped('');
          }}
          onConfirm={async () => {
            if (typed.trim() !== profile.name) return notify('Le prénom ne correspond pas.');
            if (confirm === 'reset') {
              await resetProfileProgress(profile.id);
              notify('Progression réinitialisée.', 'success');
              await onChanged();
            } else {
              await deleteProfile(profile.id);
              await onChanged();
              nav('/parent');
            }
            setConfirm(null);
            setTyped('');
          }}
        />
      )}
    </section>
  );
}
