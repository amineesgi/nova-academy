/** Graphiques SVG légers (aucune bibliothèque externe). Valeurs aussi données en texte. */
import { STATE_LABELS, type SkillState } from '@/adaptive-engine/mastery';
import { SUBJECT_LABELS } from '@/curriculum/types';
import { SUBJECT_COLORS } from '@/components/ui';
import type { SubjectStat, WeekStat } from './stats';

export function WeeklyChart({ data }: { data: WeekStat[] }) {
  const max = Math.max(30, ...data.map((d) => d.minutes));
  const W = 560;
  const H = 200;
  const bw = (W - 50) / data.length;
  return (
    <figure style={{ margin: 0 }}>
      <svg viewBox={`0 0 ${W} ${H + 30}`} width="100%" role="img" aria-label={`Minutes de travail par semaine : ${data.map((d) => `${d.week} ${d.minutes} min`).join(', ')}`}>
        {[0, 0.5, 1].map((f) => (
          <g key={f}>
            <line x1="40" x2={W} y1={H - f * (H - 20)} y2={H - f * (H - 20)} stroke="var(--line)" />
            <text x="34" y={H - f * (H - 20) + 4} textAnchor="end" fontSize="11" fill="var(--ink-soft)">
              {Math.round(max * f)}
            </text>
          </g>
        ))}
        {data.map((d, i) => {
          const h = (d.minutes / max) * (H - 20);
          const [, m, day] = d.week.split('-');
          return (
            <g key={d.week}>
              <rect x={46 + i * bw + bw * 0.15} y={H - h} width={bw * 0.7} height={Math.max(h, 1)} rx="6" fill={i === data.length - 1 ? 'var(--accent)' : 'var(--primary)'} />
              {d.minutes > 0 && (
                <text x={46 + i * bw + bw / 2} y={H - h - 6} textAnchor="middle" fontSize="11" fontWeight="800" fill="var(--ink)">
                  {d.minutes}
                </text>
              )}
              <text x={46 + i * bw + bw / 2} y={H + 18} textAnchor="middle" fontSize="11" fill="var(--ink-soft)">
                {day}/{m}
              </text>
            </g>
          );
        })}
      </svg>
      <figcaption className="kbd-hint">Minutes par semaine (semaines commençant le lundi indiqué). Semaine en cours en couleur d’accent.</figcaption>
    </figure>
  );
}

export function SubjectBars({ data }: { data: SubjectStat[] }) {
  return (
    <div className="stack" style={{ gap: 10 }} role="list" aria-label="Réussite par matière">
      {data.map((d) => {
        const rate = d.answered ? d.correct / d.answered : 0;
        return (
          <div key={d.subject} role="listitem" style={{ display: 'grid', gridTemplateColumns: 'minmax(110px, 170px) 1fr 120px', gap: 10, alignItems: 'center' }}>
            <strong style={{ fontSize: 'var(--fs-s)' }}>{SUBJECT_LABELS[d.subject]}</strong>
            <div className="progress" style={{ height: 18 }} aria-hidden="true">
              <span style={{ width: `${rate * 100}%`, background: SUBJECT_COLORS[d.subject] }} />
            </div>
            <span className="muted" style={{ fontSize: 'var(--fs-xs)' }}>
              {d.answered ? `${Math.round(rate * 100)} % · ${d.answered} rép.` : 'pas encore'} · {d.consolidated}/{d.skills} cons.
            </span>
          </div>
        );
      })}
    </div>
  );
}

const STATE_COL: Record<SkillState, string> = { not_started: '#c9c6d6', discovery: '#7cb7ff', learning: '#ffb547', consolidate: '#a77ee6', mastered: '#2fbf71' };

export function StatesBar({ dist }: { dist: Record<SkillState, number> }) {
  const total = Object.values(dist).reduce((a, b) => a + b, 0) || 1;
  const keys = Object.keys(dist) as SkillState[];
  return (
    <div className="stack" style={{ gap: 8 }}>
      <div style={{ display: 'flex', height: 26, borderRadius: 999, overflow: 'hidden', border: '1px solid var(--line)' }} role="img" aria-label={keys.map((k) => `${STATE_LABELS[k]} : ${dist[k]}`).join(', ')}>
        {keys.map((k) => (dist[k] ? <span key={k} style={{ width: `${(dist[k] / total) * 100}%`, background: STATE_COL[k] }} /> : null))}
      </div>
      <div className="row" style={{ gap: 12 }}>
        {keys.map((k) => (
          <span key={k} className="row" style={{ gap: 6, fontSize: 'var(--fs-xs)', fontWeight: 700 }}>
            <span style={{ width: 12, height: 12, borderRadius: 4, background: STATE_COL[k] }} /> {STATE_LABELS[k]} ({dist[k]})
          </span>
        ))}
      </div>
    </div>
  );
}
