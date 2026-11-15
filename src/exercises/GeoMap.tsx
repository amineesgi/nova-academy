/**
 * Cartes interactives schématiques (France métropolitaine et planisphère).
 * Tracés simplifiés à partir de coordonnées géographiques approximatives :
 * ce sont des cartes d'apprentissage, pas des cartes précises.
 */
import { useMemo } from 'react';

type LonLat = [number, number];

// ----- France -----
const FR_OUTLINE: LonLat[] = [
  [2.55, 51.08], [1.85, 50.95], [1.6, 50.6], [1.4, 50.06], [0.15, 49.7], [0.1, 49.45], [-0.35, 49.32], [-1.15, 49.38],
  [-1.3, 49.7], [-1.95, 49.72], [-1.6, 48.75], [-2.05, 48.63], [-3.0, 48.82], [-4.0, 48.7], [-4.77, 48.4], [-4.35, 48.1],
  [-4.73, 48.02], [-4.2, 47.8], [-3.4, 47.7], [-2.75, 47.48], [-2.2, 47.25], [-2.05, 46.85], [-1.4, 46.35], [-1.15, 46.15],
  [-1.25, 45.68], [-1.1, 45.5], [-1.25, 44.65], [-1.45, 43.95], [-1.55, 43.48], [-1.78, 43.36], [-1.0, 43.05], [0.0, 42.8],
  [0.7, 42.86], [1.45, 42.6], [2.2, 42.42], [3.17, 42.44], [3.05, 43.0], [3.5, 43.28], [4.2, 43.46], [4.6, 43.36],
  [5.35, 43.27], [5.95, 43.1], [6.65, 43.2], [7.27, 43.69], [7.5, 43.78], [7.0, 44.2], [6.9, 44.85], [7.12, 45.25],
  [6.8, 45.83], [6.15, 46.2], [6.1, 46.55], [6.45, 46.95], [7.0, 47.45], [7.58, 47.58], [7.55, 48.1], [7.8, 48.6],
  [8.2, 48.97], [7.0, 49.15], [6.4, 49.47], [5.8, 49.55], [4.85, 50.15], [4.2, 49.97], [3.7, 50.32], [3.2, 50.75], [2.55, 51.08],
];
const CORSICA: LonLat[] = [[9.4, 43.0], [9.56, 42.7], [9.52, 42.1], [9.4, 41.4], [9.2, 41.37], [8.6, 41.85], [8.7, 42.4], [9.3, 42.7], [9.4, 43.0]];

const RIVERS: { name: string; path: LonLat[] }[] = [
  { name: 'Seine', path: [[4.7, 47.5], [4.07, 48.3], [3.2, 48.4], [2.35, 48.86], [1.6, 49.0], [1.1, 49.44], [0.1, 49.48]] },
  { name: 'Loire', path: [[4.2, 44.84], [4.0, 45.6], [4.0, 46.2], [3.15, 46.99], [2.85, 47.4], [1.9, 47.9], [0.69, 47.39], [-0.55, 47.47], [-1.55, 47.22], [-2.2, 47.27]] },
  { name: 'Rhône', path: [[6.1, 46.2], [5.4, 45.9], [4.84, 45.76], [4.88, 44.93], [4.8, 43.95], [4.63, 43.68], [4.75, 43.38]] },
  { name: 'Garonne', path: [[0.7, 42.9], [1.0, 43.2], [1.44, 43.6], [0.62, 44.2], [-0.2, 44.55], [-0.58, 44.84], [-1.1, 45.55]] },
];

const FR_POINTS: { name: string; at: LonLat; kind: 'ville' | 'relief' | 'mer' }[] = [
  { name: 'Paris', at: [2.35, 48.86], kind: 'ville' },
  { name: 'Lyon', at: [4.84, 45.76], kind: 'ville' },
  { name: 'Marseille', at: [5.37, 43.3], kind: 'ville' },
  { name: 'Bordeaux', at: [-0.58, 44.84], kind: 'ville' },
  { name: 'Lille', at: [3.06, 50.63], kind: 'ville' },
  { name: 'Strasbourg', at: [7.75, 48.58], kind: 'ville' },
  { name: 'Nantes', at: [-1.55, 47.22], kind: 'ville' },
  { name: 'Toulouse', at: [1.44, 43.6], kind: 'ville' },
  { name: 'Brest', at: [-4.49, 48.39], kind: 'ville' },
  { name: 'Nice', at: [7.27, 43.7], kind: 'ville' },
  { name: 'Alpes', at: [6.5, 45.1], kind: 'relief' },
  { name: 'Pyrénées', at: [0.6, 42.95], kind: 'relief' },
  { name: 'Massif central', at: [2.9, 45.3], kind: 'relief' },
  { name: 'Jura', at: [6.0, 46.75], kind: 'relief' },
  { name: 'Vosges', at: [7.0, 48.15], kind: 'relief' },
  { name: 'Manche', at: [-2.4, 50.0], kind: 'mer' },
  { name: 'Océan Atlantique', at: [-3.6, 45.6], kind: 'mer' },
  { name: 'Mer Méditerranée', at: [5.2, 42.5], kind: 'mer' },
];

const pf = ([lon, lat]: LonLat): [number, number] => [(lon + 5.5) * 50, (51.5 - lat) * 72];
const pathOf = (pts: LonLat[], proj: (p: LonLat) => [number, number], close = true) =>
  pts.map((p, i) => `${i ? 'L' : 'M'}${proj(p)[0].toFixed(1)} ${proj(p)[1].toFixed(1)}`).join(' ') + (close ? ' Z' : '');

// ----- Monde (tracés très simplifiés) -----
const WORLD: { name: string; pts: LonLat[]; color: string }[] = [
  { name: 'Amérique du Nord', color: '#f4a261', pts: [[-168, 66], [-140, 70], [-110, 72], [-80, 73], [-62, 60], [-55, 50], [-66, 44], [-76, 35], [-81, 25], [-97, 26], [-97, 19], [-87, 21], [-83, 10], [-78, 8], [-92, 15], [-105, 20], [-112, 30], [-124, 40], [-125, 49], [-135, 58], [-150, 60], [-165, 60]] },
  { name: 'Groenland', color: '#f4a261', pts: [[-55, 82], [-25, 82], [-20, 70], [-43, 60], [-53, 66], [-60, 76]] },
  { name: 'Amérique du Sud', color: '#e76f51', pts: [[-78, 8], [-60, 10], [-50, 0], [-35, -6], [-40, -22], [-48, -27], [-58, -38], [-65, -55], [-72, -50], [-73, -35], [-71, -18], [-81, -5], [-80, 0]] },
  { name: 'Europe', color: '#2a9d8f', pts: [[-10, 36], [-9, 43], [-2, 43.5], [-5, 48], [0, 50], [5, 53], [8, 57], [5, 62], [15, 69], [28, 71], [40, 67], [60, 68], [60, 50], [50, 45], [40, 41], [28, 41], [26, 38], [22, 36.5], [16, 38], [12, 44], [8, 44], [3, 43], [0, 39], [-6, 36]] },
  { name: 'Asie', color: '#e9c46a', pts: [[60, 68], [80, 73], [110, 77], [140, 72], [180, 68], [170, 60], [160, 55], [140, 52], [135, 42], [122, 30], [120, 22], [108, 18], [105, 10], [100, 13], [98, 8], [92, 22], [80, 15], [77, 8], [72, 20], [66, 25], [57, 25], [52, 15], [43, 13], [35, 28], [34, 31], [36, 36], [28, 41], [40, 41], [50, 45], [60, 50]] },
  { name: 'Afrique', color: '#8ab17d', pts: [[-17, 21], [-6, 35], [10, 37], [32, 31], [34, 28], [43, 12], [51, 12], [40, -5], [40, -15], [35, -24], [20, -35], [17, -30], [12, -18], [13, -5], [9, 4], [-8, 4], [-16, 12]] },
  { name: 'Océanie', color: '#b56576', pts: [[114, -22], [130, -12], [142, -11], [146, -19], [153, -28], [150, -37], [140, -38], [132, -32], [116, -35], [114, -28]] },
  { name: 'Antarctique', color: '#cfd8e3', pts: [[-180, -72], [-120, -73], [-60, -64], [0, -70], [60, -67], [120, -66], [180, -72], [180, -88], [-180, -88]] },
];
const OCEANS: { name: string; at: LonLat }[] = [
  { name: 'Océan Atlantique', at: [-35, 15] },
  { name: 'Océan Pacifique', at: [-145, 5] },
  { name: 'Océan Indien', at: [78, -22] },
  { name: 'Océan Arctique', at: [0, 82] },
];
const pw = ([lon, lat]: LonLat): [number, number] => [(lon + 180) * 2, (90 - lat) * 2];

export const MAP_TARGETS = {
  france: [...FR_POINTS.map((p) => p.name), ...RIVERS.map((r) => r.name)],
  monde: [...WORLD.filter((w) => w.name !== 'Groenland').map((w) => w.name), ...OCEANS.map((o) => o.name)],
};

interface Props {
  mapId: 'france' | 'monde';
  /** Élément cliqué (sélection en cours). */
  selected?: string | null;
  /** Après correction : bonne réponse à mettre en évidence. */
  reveal?: string | null;
  onPick?: (name: string) => void;
  disabled?: boolean;
  showLabels?: boolean;
}

export function GeoMap({ mapId, selected, reveal, onPick, disabled, showLabels }: Props) {
  const fill = (name: string, base: string) => (reveal === name ? 'var(--success)' : selected === name ? 'var(--accent)' : base);
  const pick = (name: string) => () => !disabled && onPick?.(name);
  const keyPick = (name: string) => (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      pick(name)();
    }
  };
  const common = (name: string) => ({
    role: 'button' as const,
    tabIndex: disabled ? -1 : 0,
    'aria-label': showLabels || reveal ? name : `Repère numéro ${MAP_TARGETS[mapId].indexOf(name) + 1}`,
    'aria-pressed': selected === name,
    onClick: pick(name),
    onKeyDown: keyPick(name),
    style: { cursor: disabled ? 'default' : 'pointer' },
  });

  const france = useMemo(
    () => ({ outline: pathOf(FR_OUTLINE, pf), corsica: pathOf(CORSICA, pf), rivers: RIVERS.map((r) => ({ ...r, d: pathOf(r.path, pf, false) })) }),
    [],
  );

  if (mapId === 'france') {
    return (
      <svg viewBox="-10 -10 790 760" width="100%" style={{ maxWidth: 560, background: 'color-mix(in srgb, #4aa3df 22%, var(--surface))', borderRadius: 18 }} aria-label="Carte de France schématique : choisis un élément">
        <path d={france.outline} fill="color-mix(in srgb, #9bd18b 70%, var(--surface))" stroke="var(--ink)" strokeWidth="3" />
        <path d={france.corsica} fill="color-mix(in srgb, #9bd18b 70%, var(--surface))" stroke="var(--ink)" strokeWidth="3" />
        {france.rivers.map((r) => (
          <g key={r.name} {...common(r.name)}>
            <path d={r.d} fill="none" stroke="transparent" strokeWidth="26" />
            <path d={r.d} fill="none" stroke={fill(r.name, '#2f7fd1')} strokeWidth={selected === r.name || reveal === r.name ? 9 : 6} strokeLinecap="round" strokeLinejoin="round" />
            {(showLabels || reveal === r.name) && (
              <text x={pf(r.path[Math.floor(r.path.length / 2)]!)[0] + 8} y={pf(r.path[Math.floor(r.path.length / 2)]!)[1] - 8} fontWeight="900" fontSize="20" fill="var(--ink)">
                {r.name}
              </text>
            )}
          </g>
        ))}
        {FR_POINTS.map((p) => {
          const [x, y] = pf(p.at);
          return (
            <g key={p.name} {...common(p.name)}>
              {p.kind === 'ville' && <circle cx={x} cy={y} r={selected === p.name || reveal === p.name ? 14 : 10} fill={fill(p.name, '#e5484d')} stroke="#fff" strokeWidth="3" />}
              {p.kind === 'relief' && <path d={`M${x - 26} ${y + 14} L${x - 8} ${y - 16} L${x + 4} ${y} L${x + 14} ${y - 12} L${x + 30} ${y + 14} Z`} fill={fill(p.name, '#a0703f')} stroke="#fff" strokeWidth="2.5" />}
              {p.kind === 'mer' && <circle cx={x} cy={y} r={selected === p.name || reveal === p.name ? 26 : 22} fill={fill(p.name, '#1e66b8')} opacity=".9" stroke="#fff" strokeWidth="3" />}
              <circle cx={x} cy={y} r="30" fill="transparent" />
              {(showLabels || reveal === p.name) && (
                <text x={x + 16} y={y - 14} fontWeight="900" fontSize="20" fill="var(--ink)" paintOrder="stroke" stroke="var(--surface)" strokeWidth="5">
                  {p.name}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 720 360" width="100%" style={{ maxWidth: 720, background: 'color-mix(in srgb, #4aa3df 30%, var(--surface))', borderRadius: 18 }} aria-label="Planisphère schématique : choisis un continent ou un océan">
      {OCEANS.map((o) => {
        const [x, y] = pw(o.at);
        return (
          <g key={o.name} {...common(o.name)}>
            <circle cx={x} cy={y} r={selected === o.name || reveal === o.name ? 24 : 18} fill={fill(o.name, '#1e66b8')} stroke="#fff" strokeWidth="3" />
            <circle cx={x} cy={y} r="34" fill="transparent" />
            {(showLabels || reveal === o.name) && (
              <text x={x} y={y + 40} textAnchor="middle" fontWeight="900" fontSize="14" fill="var(--ink)">
                {o.name}
              </text>
            )}
          </g>
        );
      })}
      {WORLD.map((w) => {
        const target = w.name === 'Groenland' ? 'Amérique du Nord' : w.name;
        return (
          <g key={w.name} {...common(target)}>
            <path d={pathOf(w.pts, pw)} fill={fill(target, w.color)} stroke="var(--ink)" strokeWidth="1.5" />
          </g>
        );
      })}
      {(showLabels || reveal) &&
        WORLD.filter((w) => w.name !== 'Groenland' && (showLabels || reveal === w.name)).map((w) => {
          const xs = w.pts.map((p) => pw(p)[0]);
          const ys = w.pts.map((p) => pw(p)[1]);
          return (
            <text key={`l-${w.name}`} x={(Math.min(...xs) + Math.max(...xs)) / 2} y={(Math.min(...ys) + Math.max(...ys)) / 2} textAnchor="middle" fontWeight="900" fontSize="15" fill="#1b1b1b" pointerEvents="none">
              {w.name}
            </text>
          );
        })}
    </svg>
  );
}
