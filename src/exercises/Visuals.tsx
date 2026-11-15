/** Rendu SVG des supports visuels des exercices (formes, fractions, horloges, graphiques…). */
import type { ShapeKind, Visual } from '@/curriculum/types';
import { fr } from '@/utils/rng';

const INK = 'var(--ink)';
const FILL = 'color-mix(in srgb, var(--accent-2) 55%, transparent)';

export function ShapeSvg({ shape, size = 120 }: { shape: ShapeKind; size?: number }) {
  const s = { fill: FILL, stroke: INK, strokeWidth: 3, strokeLinejoin: 'round' as const };
  const poly = (n: number) =>
    Array.from({ length: n }, (_, i) => {
      const a = (Math.PI * 2 * i) / n - Math.PI / 2;
      return `${60 + 46 * Math.cos(a)},${62 + 46 * Math.sin(a)}`;
    }).join(' ');
  let el: JSX.Element;
  switch (shape) {
    case 'carre':
      el = <rect x="20" y="20" width="80" height="80" {...s} />;
      break;
    case 'rectangle':
      el = <rect x="10" y="32" width="100" height="56" {...s} />;
      break;
    case 'triangle':
      el = <polygon points="60,14 108,100 12,100" {...s} />;
      break;
    case 'triangle-rectangle':
      el = (
        <g>
          <polygon points="18,16 18,102 104,102" {...s} />
          <path d="M18 88 h14 v14" fill="none" stroke={INK} strokeWidth="2" />
        </g>
      );
      break;
    case 'cercle':
      el = <circle cx="60" cy="60" r="46" {...s} />;
      break;
    case 'losange':
      el = <polygon points="60,10 100,60 60,110 20,60" {...s} />;
      break;
    case 'hexagone':
      el = <polygon points={poly(6)} {...s} />;
      break;
    case 'pentagone':
      el = <polygon points={poly(5)} {...s} />;
      break;
    case 'cube':
      el = (
        <g {...s}>
          <rect x="18" y="40" width="60" height="60" />
          <polygon points="18,40 42,18 102,18 78,40" fill="color-mix(in srgb, var(--accent-2) 30%, transparent)" />
          <polygon points="78,40 102,18 102,78 78,100" fill="color-mix(in srgb, var(--accent-2) 75%, transparent)" />
        </g>
      );
      break;
    case 'pave':
      el = (
        <g {...s}>
          <rect x="10" y="50" width="76" height="46" />
          <polygon points="10,50 34,28 110,28 86,50" fill="color-mix(in srgb, var(--accent-2) 30%, transparent)" />
          <polygon points="86,50 110,28 110,74 86,96" fill="color-mix(in srgb, var(--accent-2) 75%, transparent)" />
        </g>
      );
      break;
    case 'cylindre':
      el = (
        <g {...s}>
          <path d="M24 26 V94 A36 12 0 0 0 96 94 V26" />
          <ellipse cx="60" cy="26" rx="36" ry="12" fill="color-mix(in srgb, var(--accent-2) 30%, transparent)" />
        </g>
      );
      break;
    case 'pyramide':
      el = (
        <g {...s}>
          <polygon points="60,10 14,92 70,106" />
          <polygon points="60,10 70,106 106,86" fill="color-mix(in srgb, var(--accent-2) 75%, transparent)" />
        </g>
      );
      break;
    case 'cone':
      el = (
        <g {...s}>
          <path d="M60 12 L22 92 A38 12 0 0 0 98 92 Z" />
        </g>
      );
      break;
    case 'boule':
      el = (
        <g>
          <circle cx="60" cy="60" r="46" {...s} />
          <ellipse cx="60" cy="60" rx="46" ry="14" fill="none" stroke={INK} strokeWidth="1.5" strokeDasharray="4 4" />
        </g>
      );
      break;
  }
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} aria-hidden="true">
      {el}
    </svg>
  );
}

export function FractionSvg({ num, den, style = 'bar', size = 220 }: { num: number; den: number; style?: 'bar' | 'disc'; size?: number }) {
  if (style === 'disc') {
    const parts = Array.from({ length: den }, (_, i) => {
      const a0 = (Math.PI * 2 * i) / den - Math.PI / 2;
      const a1 = (Math.PI * 2 * (i + 1)) / den - Math.PI / 2;
      const large = a1 - a0 > Math.PI ? 1 : 0;
      const d = `M60 60 L${60 + 50 * Math.cos(a0)} ${60 + 50 * Math.sin(a0)} A50 50 0 ${large} 1 ${60 + 50 * Math.cos(a1)} ${60 + 50 * Math.sin(a1)} Z`;
      return <path key={i} d={d} fill={i < num ? 'var(--accent)' : 'var(--surface)'} stroke={INK} strokeWidth="2" />;
    });
    return (
      <svg viewBox="0 0 120 120" width={size * 0.6} height={size * 0.6} role="img" aria-label={`Disque partagé en ${den} parts, ${num} coloriées`}>
        {parts}
      </svg>
    );
  }
  const w = 200 / den;
  return (
    <svg viewBox="0 0 204 44" width={size} height={size * 0.22} role="img" aria-label={`Bande partagée en ${den} parts, ${num} coloriées`}>
      {Array.from({ length: den }, (_, i) => (
        <rect key={i} x={2 + i * w} y="2" width={w} height="40" fill={i < num ? 'var(--accent)' : 'var(--surface)'} stroke={INK} strokeWidth="2" />
      ))}
    </svg>
  );
}

export function ClockSvg({ h, m, size = 160 }: { h: number; m: number; size?: number }) {
  const ma = (m / 60) * 360;
  const ha = ((h % 12) / 12) * 360 + (m / 60) * 30;
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} role="img" aria-label="Horloge à aiguilles">
      <circle cx="60" cy="60" r="54" fill="var(--surface)" stroke={INK} strokeWidth="4" />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i * 30 * Math.PI) / 180;
        return (
          <text key={i} x={60 + 42 * Math.sin(a)} y={64 - 42 * Math.cos(a)} textAnchor="middle" fontSize="11" fontWeight="800" fill={INK}>
            {i === 0 ? 12 : i}
          </text>
        );
      })}
      <line x1="60" y1="60" x2="60" y2="32" stroke={INK} strokeWidth="6" strokeLinecap="round" transform={`rotate(${ha} 60 60)`} />
      <line x1="60" y1="60" x2="60" y2="16" stroke="var(--primary)" strokeWidth="4" strokeLinecap="round" transform={`rotate(${ma} 60 60)`} />
      <circle cx="60" cy="60" r="4" fill={INK} />
    </svg>
  );
}

export function AngleSvg({ deg, size = 170 }: { deg: number; size?: number }) {
  const a = (deg * Math.PI) / 180;
  const x = 30 + 90 * Math.cos(-a);
  const y = 100 + 90 * Math.sin(-a);
  const r = 26;
  const ax = 30 + r * Math.cos(-a);
  const ay = 100 + r * Math.sin(-a);
  return (
    <svg viewBox="0 0 140 120" width={size} height={size * 0.86} role="img" aria-label="Angle à identifier">
      {deg === 90 ? (
        <path d="M30 82 h18 v18" fill="none" stroke="var(--accent)" strokeWidth="3" />
      ) : (
        <path d={`M${30 + r} 100 A${r} ${r} 0 0 0 ${ax} ${ay}`} fill="none" stroke="var(--accent)" strokeWidth="3" />
      )}
      <line x1="30" y1="100" x2="125" y2="100" stroke={INK} strokeWidth="4" strokeLinecap="round" />
      <line x1="30" y1="100" x2={x} y2={y} stroke={INK} strokeWidth="4" strokeLinecap="round" />
      <circle cx="30" cy="100" r="4" fill={INK} />
    </svg>
  );
}

export function BarsSvg({ title, labels, values, unit }: { title: string; labels: string[]; values: number[]; unit?: string }) {
  const max = Math.max(...values, 1);
  const step = max <= 10 ? 2 : max <= 50 ? 10 : max <= 100 ? 20 : max <= 500 ? 100 : 200;
  const top = Math.ceil(max / step) * step;
  const W = 360;
  const H = 220;
  const bw = (W - 60) / labels.length;
  return (
    <figure style={{ margin: 0 }}>
      <figcaption className="label" style={{ marginBottom: 6 }}>
        {title}
        {unit ? ` (${unit})` : ''}
      </figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: 440 }} role="img" aria-label={`${title} : ${labels.map((l, i) => `${l} ${values[i]}`).join(', ')}`}>
        {Array.from({ length: top / step + 1 }, (_, i) => {
          const y = 190 - (i * step * 170) / top;
          return (
            <g key={i}>
              <line x1="44" x2={W - 6} y1={y} y2={y} stroke="var(--line)" />
              <text x="38" y={y + 4} fontSize="11" textAnchor="end" fill="var(--ink-soft)" fontWeight="700">
                {fr(i * step)}
              </text>
            </g>
          );
        })}
        {values.map((v, i) => {
          const h = (v * 170) / top;
          return (
            <g key={i}>
              <rect x={52 + i * bw + bw * 0.15} y={190 - h} width={bw * 0.7} height={h} rx="6" fill={['var(--primary)', 'var(--accent)', 'var(--accent-2)', 'var(--danger)', 'var(--success)'][i % 5]} />
              <text x={52 + i * bw + bw / 2} y="208" fontSize="12" textAnchor="middle" fill={INK} fontWeight="800">
                {labels[i]}
              </text>
            </g>
          );
        })}
      </svg>
    </figure>
  );
}

export function GridSvg({ size, points, axis }: { size: number; points: { x: number; y: number; label: string }[]; axis?: boolean }) {
  const c = 220 / size;
  return (
    <svg viewBox="-24 -10 260 260" width="260" role="img" aria-label="Quadrillage avec des points">
      {Array.from({ length: size + 1 }, (_, i) => (
        <g key={i} stroke="var(--line)" strokeWidth="1.5">
          <line x1={i * c} y1={0} x2={i * c} y2={220} />
          <line x1={0} y1={i * c} x2={220} y2={i * c} />
        </g>
      ))}
      {axis &&
        Array.from({ length: size + 1 }, (_, i) => (
          <g key={`t${i}`} fontSize="11" fontWeight="800" fill="var(--ink-soft)">
            <text x={i * c} y={236} textAnchor="middle">
              {i}
            </text>
            <text x={-10} y={220 - i * c + 4} textAnchor="middle">
              {i}
            </text>
          </g>
        ))}
      {points.map((p) => (
        <g key={p.label}>
          <circle cx={p.x * c} cy={220 - p.y * c} r="7" fill="var(--primary)" />
          <text x={p.x * c + 10} y={220 - p.y * c - 8} fontSize="14" fontWeight="900" fill={INK}>
            {p.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

export function CoinsView({ cents }: { cents: number[] }) {
  return (
    <div className="row" aria-label="Pièces de monnaie">
      {cents.map((c, i) => {
        const euro = c >= 100;
        const label = euro ? `${c / 100} €` : `${c} c`;
        const big = c >= 100 ? 64 : c >= 10 ? 54 : 46;
        return (
          <svg key={i} viewBox="0 0 64 64" width={big} height={big} role="img" aria-label={label}>
            <circle cx="32" cy="32" r="30" fill={euro ? '#e9c25b' : c >= 10 ? '#e6c86e' : '#c9824a'} stroke="#8a6a1f" strokeWidth="3" />
            {euro && <circle cx="32" cy="32" r="19" fill="#d7dbe3" stroke="#8a8f99" strokeWidth="2" />}
            <text x="32" y="38" textAnchor="middle" fontSize="15" fontWeight="900" fill="#3a2a00">
              {label}
            </text>
          </svg>
        );
      })}
    </div>
  );
}

export function RectView({ w, h, unit, squares }: { w: number; h: number; unit: string; squares?: boolean }) {
  const scale = Math.min(220 / w, 140 / h, squares ? 34 : 40);
  const W = w * scale;
  const H = h * scale;
  return (
    <svg viewBox={`-40 -10 ${W + 60} ${H + 50}`} width={Math.min(360, W + 60)} role="img" aria-label={`Rectangle ${w} sur ${h} ${unit}`}>
      <rect x="0" y="0" width={W} height={H} fill={FILL} stroke={INK} strokeWidth="3" />
      {squares &&
        Array.from({ length: w - 1 }, (_, i) => <line key={`v${i}`} x1={(i + 1) * scale} x2={(i + 1) * scale} y1="0" y2={H} stroke={INK} strokeWidth="1" />)}
      {squares &&
        Array.from({ length: h - 1 }, (_, i) => <line key={`h${i}`} y1={(i + 1) * scale} y2={(i + 1) * scale} x1="0" x2={W} stroke={INK} strokeWidth="1" />)}
      {!squares && (
        <>
          <text x={W / 2} y={H + 24} textAnchor="middle" fontWeight="800" fontSize="16" fill={INK}>
            {w} {unit}
          </text>
          <text x={-10} y={H / 2 + 5} textAnchor="end" fontWeight="800" fontSize="16" fill={INK}>
            {h} {unit}
          </text>
        </>
      )}
    </svg>
  );
}

export function PictureCard({ symbol, label, size = 'm' }: { symbol: string; label: string; size?: 's' | 'm' | 'l' }) {
  const px = size === 'l' ? 84 : size === 's' ? 40 : 60;
  return (
    <span className="picture-card" role="img" aria-label={label} style={{ fontSize: px, lineHeight: 1.1, display: 'inline-block' }}>
      {symbol}
    </span>
  );
}

export function VisualView({ v }: { v: Visual }) {
  switch (v.kind) {
    case 'shape':
      return <ShapeSvg shape={v.shape} size={150} />;
    case 'fraction':
      return <FractionSvg num={v.num} den={v.den} style={v.style} />;
    case 'picture':
      return <PictureCard symbol={v.symbol} label={v.label} size="l" />;
    case 'clock':
      return <ClockSvg h={v.h} m={v.m} />;
    case 'angle':
      return <AngleSvg deg={v.deg} />;
    case 'bars':
      return <BarsSvg title={v.title} labels={v.labels} values={v.values} unit={v.unit} />;
    case 'table':
      return (
        <table className="table" style={{ maxWidth: 480, background: 'var(--surface)', borderRadius: 12 }}>
          <tbody>
            {v.rows.map((r, i) => (
              <tr key={i}>
                {r.map((c, j) => (i === 0 || j === 0 ? <th key={j}>{c}</th> : <td key={j} style={{ fontWeight: 800 }}>{c}</td>))}
              </tr>
            ))}
          </tbody>
        </table>
      );
    case 'grid':
      return <GridSvg size={v.size} points={v.points} axis={v.axis} />;
    case 'coins':
      return <CoinsView cents={v.cents} />;
    case 'rect':
      return <RectView w={v.w} h={v.h} unit={v.unit} squares={v.squares} />;
  }
}
