import { Lock } from 'lucide-react';
import { ACCESSORIES, Avatar, BACKGROUNDS, HAIR_COLORS, HAIR_STYLES, OUTFITS, SKINS } from '@/art/Avatar';
import { Mascot, MASCOTS } from '@/art/Mascot';
import { COSMETICS } from '@/rewards/rewards';
import type { AvatarConfig, MascotId, ThemeId } from './types';

const Swatch = ({ color, on, label, onClick }: { color: string; on: boolean; label: string; onClick: () => void }) => (
  <button type="button" aria-label={label} aria-pressed={on} onClick={onClick} style={{ width: 42, height: 42, borderRadius: 14, background: color, border: on ? '4px solid var(--ink)' : '2px solid var(--line)', cursor: 'pointer' }} />
);

export function AvatarEditor({ value, onChange, unlocked }: { value: AvatarConfig; onChange: (a: AvatarConfig) => void; unlocked: string[] }) {
  const set = (patch: Partial<AvatarConfig>) => onChange({ ...value, ...patch });
  const bgUnlocked = (i: number) => i < 6 || unlocked.includes(`bg-${i}`);
  return (
    <div className="row" style={{ alignItems: 'flex-start', gap: 28 }}>
      <div className="anim-pop" style={{ flex: 'none' }}>
        <Avatar config={value} size={170} title="Aperçu de ton avatar" />
      </div>
      <div className="stack" style={{ flex: 1, minWidth: 260 }}>
        <div className="label">Couleur de peau</div>
        <div className="row">{SKINS.map((c, i) => <Swatch key={c} color={c} on={value.skin === i} label={`Teinte ${i + 1}`} onClick={() => set({ skin: i })} />)}</div>
        <div className="label">Coiffure</div>
        <div className="row">
          {HAIR_STYLES.map((h, i) => (
            <button key={h} type="button" className="btn btn-sm" aria-pressed={value.hair === i} style={value.hair === i ? { outline: '3px solid var(--primary)' } : undefined} onClick={() => set({ hair: i })}>
              {h}
            </button>
          ))}
        </div>
        <div className="label">Couleur des cheveux</div>
        <div className="row">{HAIR_COLORS.map((c, i) => <Swatch key={c} color={c} on={value.hairColor === i} label={`Cheveux couleur ${i + 1}`} onClick={() => set({ hairColor: i })} />)}</div>
        <div className="label">Tenue</div>
        <div className="row">{OUTFITS.map((c, i) => <Swatch key={c} color={c} on={value.outfit === i} label={`Tenue couleur ${i + 1}`} onClick={() => set({ outfit: i })} />)}</div>
        <div className="label">Fond</div>
        <div className="row">
          {BACKGROUNDS.map((b, i) =>
            bgUnlocked(i) ? (
              <Swatch key={i} color={`linear-gradient(135deg, ${b[0]}, ${b[1]})`} on={value.background === i} label={`Fond ${i + 1}`} onClick={() => set({ background: i })} />
            ) : (
              <span key={i} title={COSMETICS.find((c) => c.id === `bg-${i}`)?.label} style={{ width: 42, height: 42, borderRadius: 14, display: 'grid', placeItems: 'center', border: '2px dashed var(--line)' }} aria-label="Fond à débloquer">
                <Lock size={16} />
              </span>
            ),
          )}
        </div>
        <div className="label">Accessoire</div>
        <div className="row">
          <button type="button" className="btn btn-sm" aria-pressed={value.accessory === null} onClick={() => set({ accessory: null })}>
            Aucun
          </button>
          {ACCESSORIES.map((a) => {
            const ok = unlocked.includes(a.id);
            const c = COSMETICS.find((x) => x.id === a.id);
            return (
              <button key={a.id} type="button" className="btn btn-sm" disabled={!ok} aria-pressed={value.accessory === a.id} style={value.accessory === a.id ? { outline: '3px solid var(--primary)' } : undefined} onClick={() => set({ accessory: a.id })} title={ok ? a.label : c?.level ? `Se débloque au niveau ${c.level}` : `Se débloque avec ${c?.chests} coffre(s)`}>
                {!ok && <Lock size={14} />} {a.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function MascotPicker({ value, onChange }: { value: MascotId; onChange: (m: MascotId) => void }) {
  return (
    <div className="grid-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
      {MASCOTS.map((m) => (
        <button key={m.id} type="button" className="choice choice-visual" aria-pressed={value === m.id} onClick={() => onChange(m.id)} style={{ minHeight: 220 }}>
          <Mascot id={m.id} mood={value === m.id ? 'cheer' : 'happy'} size={110} />
          <strong style={{ fontSize: 'var(--fs-l)' }}>{m.name}</strong>
          <span className="muted" style={{ fontSize: 'var(--fs-s)', fontWeight: 600 }}>
            {m.description}
          </span>
        </button>
      ))}
    </div>
  );
}

export const THEMES: { id: ThemeId; name: string; colors: [string, string, string] }[] = [
  { id: 'jardin', name: 'Jardin', colors: ['#fdf4e7', '#2b9667', '#f0814f'] },
  { id: 'aurore', name: 'Aurore', colors: ['#fff1f3', '#c93f6c', '#e89b19'] },
  { id: 'ocean', name: 'Océan', colors: ['#ebf6fb', '#1878a8', '#e88e1a'] },
  { id: 'academie', name: 'Académie', colors: ['#111832', '#2fbfa9', '#f5b642'] },
  { id: 'cosmos', name: 'Cosmos', colors: ['#150e2b', '#a27bff', '#ffcf5c'] },
  { id: 'volcan', name: 'Volcan', colors: ['#1c1315', '#ff7a45', '#ffd166'] },
];

export function ThemePicker({ value, onChange }: { value: ThemeId; onChange: (t: ThemeId) => void }) {
  return (
    <div className="grid-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
      {THEMES.map((t) => (
        <button key={t.id} type="button" className="choice choice-visual" aria-pressed={value === t.id} onClick={() => onChange(t.id)}>
          <svg viewBox="0 0 120 70" width="120" aria-hidden="true">
            <rect width="120" height="70" rx="14" fill={t.colors[0]} stroke="#0002" />
            <rect x="12" y="14" width="60" height="14" rx="7" fill={t.colors[1]} />
            <rect x="12" y="38" width="40" height="14" rx="7" fill={t.colors[2]} />
            <circle cx="96" cy="35" r="14" fill={t.colors[1]} />
          </svg>
          <strong>{t.name}</strong>
        </button>
      ))}
    </div>
  );
}
