/**
 * Cartes d'aventure illustrées (SVG original) :
 *  - CE2 : le Jardin des Savoirs (jour, pastel, végétal) ;
 *  - CM2 : l'Académie des Explorateurs (nuit étoilée, observatoire, constellations).
 * Chaque région est un bouton accessible au clavier, avec sa progression.
 */
import { Lock } from 'lucide-react';
import type { LevelDefinition, Region } from '@/curriculum/types';

export interface RegionStatus {
  region: Region;
  open: boolean;
  done: number;
  total: number;
  /** Message d'ouverture si verrouillée. */
  unlockHint?: string;
}

function Landmark({ id, color }: { id: string; color: string }) {
  switch (id) {
    case 'foret-nombres':
      return (
        <g>
          <rect x="-4" y="6" width="8" height="18" fill="#7a5130" />
          <circle cx="0" cy="-4" r="20" fill={color} />
          <circle cx="-16" cy="8" r="13" fill="#4cb67c" />
          <circle cx="16" cy="8" r="13" fill="#4cb67c" />
          <text x="0" y="2" textAnchor="middle" fontWeight="900" fontSize="16" fill="#fff">
            123
          </text>
        </g>
      );
    case 'bibliotheque-mots':
    case 'citadelle-francais':
      return (
        <g>
          <rect x="-22" y="-14" width="44" height="38" rx="4" fill={color} />
          <polygon points="-28,-14 0,-36 28,-14" fill="#a0442a" />
          <rect x="-7" y="6" width="14" height="18" rx="7" fill="#3b2418" />
          <rect x="-17" y="-6" width="9" height="9" rx="2" fill="#ffe6a8" />
          <rect x="8" y="-6" width="9" height="9" rx="2" fill="#ffe6a8" />
          <text x="0" y="-18" textAnchor="middle" fontWeight="900" fontSize="12" fill="#fff">
            Aa
          </text>
        </g>
      );
    case 'vallee-anglais':
    case 'english-station':
      return (
        <g>
          <path d="M-30 22 L-12 -10 L0 6 L12 -18 L30 22 Z" fill={color} />
          <path d="M12 -18 L4 -6 L12 -4 L20 -6 Z" fill="#fff" />
          <circle cx="0" cy="12" r="10" fill="#fff" />
          <text x="0" y="16" textAnchor="middle" fontWeight="900" fontSize="11" fill={color}>
            Hi!
          </text>
        </g>
      );
    case 'jardin-sciences':
    case 'observatoire-sciences':
      return (
        <g>
          <rect x="-20" y="2" width="40" height="22" rx="3" fill="#dfe6ff" />
          <path d="M-22 4 A22 22 0 0 1 22 4 Z" fill={color} />
          <rect x="4" y="-26" width="8" height="22" rx="3" fill="#59607a" transform="rotate(30 8 -14)" />
          <circle cx="-8" cy="-6" r="3" fill="#fff" />
        </g>
      );
    case 'ile-decouvertes':
    case 'agora':
      return (
        <g>
          <ellipse cx="0" cy="18" rx="30" ry="9" fill="#f4d9a0" />
          <rect x="-20" y="-8" width="40" height="24" fill="#fff8e6" />
          <polygon points="-24,-8 0,-28 24,-8" fill={color} />
          {[-14, -5, 5, 14].map((x) => (
            <rect key={x} x={x - 2} y="-6" width="4" height="22" fill="#e6d7b5" />
          ))}
        </g>
      );
    case 'labo-maths':
      return (
        <g>
          <path d="M-8 -26 h16 v14 l16 30 a6 6 0 0 1 -5 8 h-38 a6 6 0 0 1 -5 -8 l16 -30 Z" fill="#dff4ff" stroke="#fff" strokeWidth="2" />
          <path d="M-18 10 h36 l6 12 a4 4 0 0 1 -4 4 h-40 a4 4 0 0 1 -4 -4 Z" fill={color} />
          <text x="0" y="0" textAnchor="middle" fontWeight="900" fontSize="13" fill={color}>
            π
          </text>
        </g>
      );
    case 'portail-histoire':
      return (
        <g>
          <path d="M-24 24 V-6 A24 24 0 0 1 24 -6 V24 h-10 V-2 A14 14 0 0 0 -14 -2 V24 Z" fill={color} />
          <circle cx="0" cy="-2" r="10" fill="#ffd166" opacity=".8" />
        </g>
      );
    case 'atlas-geo':
      return (
        <g>
          <circle cx="0" cy="0" r="22" fill="#4aa3df" />
          <path d="M-14 -10 q8 -6 14 2 q6 8 -2 12 q-8 2 -12 -6 Z" fill={color} />
          <path d="M6 6 q8 -2 10 6 q-6 6 -12 0 Z" fill={color} />
          <rect x="-3" y="22" width="6" height="6" fill="#8a6a40" />
        </g>
      );
    default:
      return <circle r="20" fill={color} />;
  }
}

function GardenBackdrop() {
  return (
    <g>
      <defs>
        <linearGradient id="sky-ce2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#bfe8ff" />
          <stop offset="1" stopColor="#fff3dc" />
        </linearGradient>
      </defs>
      <rect width="1000" height="620" fill="url(#sky-ce2)" />
      <circle cx="880" cy="80" r="46" fill="#ffd95a" opacity=".9" />
      <path d="M0 260 C 200 200, 360 280, 520 230 C 700 175, 840 250, 1000 210 V620 H0 Z" fill="#b9e4a3" />
      <path d="M0 360 C 180 320, 340 400, 560 350 C 760 300, 880 380, 1000 340 V620 H0 Z" fill="#9fd88c" />
      <path d="M0 470 C 200 440, 420 500, 620 460 C 820 420, 900 480, 1000 460 V620 H0 Z" fill="#8bcf7a" />
      {/* rivière */}
      <path d="M560 230 C 520 300, 640 340, 560 410 C 500 460, 620 520, 580 620" stroke="#7cc6f0" strokeWidth="34" fill="none" strokeLinecap="round" />
      {/* lac de l'île */}
      <ellipse cx="780" cy="470" rx="170" ry="70" fill="#8fd3f5" />
      {/* chemins */}
      <path d="M240 210 C 330 300, 420 330, 500 360 C 600 390, 680 340, 780 440 M500 360 C 380 400, 300 430, 220 460 M500 360 C 600 260, 650 200, 700 160" stroke="#f3dfb1" strokeWidth="16" fill="none" strokeLinecap="round" strokeDasharray="2 22" />
      {/* arbres et fleurs */}
      {[
        [80, 300], [140, 250], [930, 300], [880, 260], [60, 520], [400, 560], [300, 300], [960, 560],
      ].map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <rect x="-3" y="0" width="6" height="16" fill="#7a5130" />
          <circle cx="0" cy="-6" r="16" fill={i % 2 ? '#5cbf7f' : '#73cf8f'} />
        </g>
      ))}
      {Array.from({ length: 26 }, (_, i) => (
        <circle key={`f${i}`} cx={(i * 137) % 1000} cy={300 + ((i * 89) % 300)} r="4" fill={['#ff8fab', '#ffd166', '#c4a7ff', '#fff'][i % 4]} />
      ))}
      {[[160, 90], [420, 60], [640, 110]].map(([x, y], i) => (
        <g key={`c${i}`} fill="#fff" opacity=".9">
          <ellipse cx={x} cy={y} rx="46" ry="16" />
          <ellipse cx={(x ?? 0) + 26} cy={(y ?? 0) - 10} rx="26" ry="16" />
        </g>
      ))}
    </g>
  );
}

function AcademyBackdrop({ stars }: { stars: boolean }) {
  return (
    <g>
      <defs>
        <linearGradient id="sky-cm2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0b1030" />
          <stop offset="1" stopColor="#24346e" />
        </linearGradient>
      </defs>
      <rect width="1000" height="620" fill="url(#sky-cm2)" />
      {Array.from({ length: 70 }, (_, i) => (
        <circle key={i} cx={(i * 173) % 1000} cy={(i * 97) % 330} r={i % 5 === 0 ? 2.2 : 1.2} fill="#fff" opacity={0.4 + (i % 3) * 0.2} style={{ animation: `twinkle ${3 + (i % 4)}s ease-in-out ${i % 5}s infinite` }} />
      ))}
      {/* constellations */}
      <polyline points="90,70 140,40 200,60 240,30" stroke="#8fa3ff" strokeWidth="1.5" fill="none" opacity=".6" />
      <polyline points="720,60 770,90 830,70 880,110 940,80" stroke="#8fa3ff" strokeWidth="1.5" fill="none" opacity=".6" />
      <circle cx="860" cy="70" r="30" fill="#f4f1d0" opacity=".9" />
      <circle cx="872" cy="62" r="28" fill="#0f1640" />
      {stars && <path d="M100 160 l140 -60" stroke="#ffd166" strokeWidth="3" strokeLinecap="round" opacity=".8" />}
      <path d="M0 300 C 200 250, 420 330, 620 280 C 800 240, 900 300, 1000 270 V620 H0 Z" fill="#1b2a5c" />
      <path d="M0 420 C 220 380, 420 450, 640 400 C 820 360, 920 420, 1000 400 V620 H0 Z" fill="#20336e" />
      <path d="M0 520 C 240 490, 460 540, 680 510 C 840 490, 940 520, 1000 510 V620 H0 Z" fill="#253c7e" />
      {/* chemins lumineux */}
      <path d="M200 190 C 300 260, 420 300, 500 330 C 600 300, 700 240, 800 190 M500 330 C 420 400, 300 420, 220 430 M500 330 C 580 400, 700 420, 780 430 M500 330 C 500 420, 500 470, 500 520" stroke="#5be2cf" strokeWidth="4" fill="none" strokeDasharray="6 14" opacity=".7" />
    </g>
  );
}

export function AdventureMap({ level, statuses, onSelect, decorations = [] }: { level: LevelDefinition; statuses: RegionStatus[]; onSelect: (r: Region) => void; decorations?: string[] }) {
  const ce2 = level.id === 'ce2';
  return (
    <svg viewBox="0 0 1000 620" width="100%" style={{ borderRadius: 28, boxShadow: 'var(--shadow-l)', display: 'block' }} role="group" aria-label={`Carte de ${level.worldName}`}>
      {ce2 ? <GardenBackdrop /> : <AcademyBackdrop stars={decorations.includes('map-etoiles')} />}
      {decorations.includes('map-lanternes') &&
        [[150, 420], [350, 470], [650, 300], [860, 380]].map(([x, y], i) => (
          <g key={i}>
            <line x1={x} y1={(y ?? 0) - 40} x2={x} y2={y} stroke="#6b4a2a" strokeWidth="3" />
            <circle cx={x} cy={(y ?? 0) - 44} r="9" fill="#ffd166" opacity=".9" />
          </g>
        ))}
      {statuses.map(({ region, open, done, total, unlockHint }) => {
        const x = region.x * 10;
        const y = region.y * 6.2;
        const pct = total ? done / total : 0;
        const r = 52;
        const c = 2 * Math.PI * r;
        return (
          <g
            key={region.id}
            transform={`translate(${x} ${y})`}
            role="button"
            tabIndex={0}
            aria-label={`${region.name} : ${done} compétence${done > 1 ? 's' : ''} consolidée${done > 1 ? 's' : ''} sur ${total}${open ? '' : ` (verrouillée — ${unlockHint ?? ''})`}`}
            onClick={() => onSelect(region)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect(region);
              }
            }}
            style={{ cursor: 'pointer' }}
            className="map-node"
          >
            <circle r="62" fill={ce2 ? 'rgba(255,255,255,.75)' : 'rgba(10,16,48,.6)'} stroke={region.color} strokeWidth="4" />
            <circle r={r} fill="none" stroke={ce2 ? '#e8e2d2' : '#33437f'} strokeWidth="8" />
            <circle r={r} fill="none" stroke={region.color} strokeWidth="8" strokeDasharray={`${c * pct} ${c}`} transform="rotate(-90)" strokeLinecap="round" />
            <g opacity={open ? 1 : 0.45}>
              <Landmark id={region.id} color={region.color} />
            </g>
            {!open && (
              <g transform="translate(26 -40)">
                <circle r="16" fill="#2a2340" />
                <foreignObject x="-10" y="-10" width="20" height="20">
                  <Lock size={20} color="#fff" />
                </foreignObject>
              </g>
            )}
            <g transform="translate(0 84)">
              <rect x={-region.name.length * 5 - 16} y="-18" width={region.name.length * 10 + 32} height="32" rx="16" fill={region.color} />
              <text textAnchor="middle" y="4" fontWeight="900" fontSize="17" fill="#fff" fontFamily="'Baloo 2', sans-serif">
                {region.name}
              </text>
            </g>
          </g>
        );
      })}
    </svg>
  );
}
