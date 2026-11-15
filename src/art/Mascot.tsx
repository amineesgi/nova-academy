/**
 * Mascottes originales de Nova Academy, dessinées en SVG (aucune image externe).
 *  - Pip : jeune chouette-graine du Jardin des Savoirs.
 *  - Luma : luciole lumineuse.
 *  - Orbi : petit robot-boussole de l'Académie des Explorateurs.
 *  - Kip : jeune dragon cartographe.
 */
import type { MascotId } from '@/profiles/types';

export type Mood = 'happy' | 'think' | 'cheer' | 'calm';

interface Props {
  id: MascotId;
  mood?: Mood;
  size?: number;
  className?: string;
  title?: string;
}

export const MASCOTS: { id: MascotId; name: string; description: string }[] = [
  { id: 'pip', name: 'Pip', description: 'Une petite chouette-graine curieuse qui adore les jardins.' },
  { id: 'luma', name: 'Luma', description: 'Une luciole qui éclaire les idées difficiles.' },
  { id: 'orbi', name: 'Orbi', description: 'Un robot-boussole qui ne perd jamais le nord.' },
  { id: 'kip', name: 'Kip', description: 'Un jeune dragon cartographe, explorateur infatigable.' },
];

function Eyes({ mood, cx1, cx2, cy, r = 7 }: { mood: Mood; cx1: number; cx2: number; cy: number; r?: number }) {
  if (mood === 'cheer') {
    return (
      <g stroke="#2a2340" strokeWidth="4" strokeLinecap="round" fill="none">
        <path d={`M${cx1 - r} ${cy + 2} Q${cx1} ${cy - r - 2} ${cx1 + r} ${cy + 2}`} />
        <path d={`M${cx2 - r} ${cy + 2} Q${cx2} ${cy - r - 2} ${cx2 + r} ${cy + 2}`} />
      </g>
    );
  }
  const look = mood === 'think' ? -3 : 0;
  return (
    <g>
      <circle cx={cx1} cy={cy} r={r + 5} fill="#fff" />
      <circle cx={cx2} cy={cy} r={r + 5} fill="#fff" />
      <circle cx={cx1 + look} cy={cy + look} r={r} fill="#2a2340" />
      <circle cx={cx2 + look} cy={cy + look} r={r} fill="#2a2340" />
      <circle cx={cx1 + look + 2.5} cy={cy + look - 2.5} r={2.4} fill="#fff" />
      <circle cx={cx2 + look + 2.5} cy={cy + look - 2.5} r={2.4} fill="#fff" />
      {mood === 'calm' && (
        <g fill="currentColor" opacity="0">
          <rect />
        </g>
      )}
    </g>
  );
}

function Mouth({ mood, x, y }: { mood: Mood; x: number; y: number }) {
  if (mood === 'think') return <path d={`M${x - 6} ${y + 2} Q${x} ${y - 2} ${x + 7} ${y + 1}`} stroke="#2a2340" strokeWidth="3.5" fill="none" strokeLinecap="round" />;
  if (mood === 'cheer') return <path d={`M${x - 10} ${y - 2} Q${x} ${y + 14} ${x + 10} ${y - 2} Z`} fill="#7a2338" />;
  return <path d={`M${x - 8} ${y} Q${x} ${y + 8} ${x + 8} ${y}`} stroke="#2a2340" strokeWidth="3.5" fill="none" strokeLinecap="round" />;
}

function Pip({ mood }: { mood: Mood }) {
  return (
    <g>
      <ellipse cx="100" cy="182" rx="46" ry="8" fill="rgba(0,0,0,.12)" />
      {/* feuille-crête */}
      <path d="M100 38 C 88 14, 120 6, 122 26 C 112 22, 106 30, 100 38 Z" fill="#4fbf7c" />
      <path d="M100 38 C 96 22, 104 14, 112 18" stroke="#2e8d55" strokeWidth="3" fill="none" />
      {/* corps */}
      <path d="M100 40 C 150 40, 166 92, 160 128 C 154 166, 128 180, 100 180 C 72 180, 46 166, 40 128 C 34 92, 50 40, 100 40 Z" fill="#7fcf8f" />
      <path d="M100 96 C 132 96, 142 130, 132 156 C 124 172, 112 176, 100 176 C 88 176, 76 172, 68 156 C 58 130, 68 96, 100 96 Z" fill="#f6e7c4" />
      {/* motif plumes */}
      <g fill="#e9d3a2">
        <path d="M86 128 q6 8 12 0" />
        <path d="M102 128 q6 8 12 0" />
        <path d="M94 146 q6 8 12 0" />
      </g>
      {/* ailes */}
      <path d={mood === 'cheer' ? 'M42 108 C 18 90, 14 64, 30 58 C 38 76, 46 90, 52 104 Z' : 'M44 104 C 28 116, 28 146, 46 156 C 48 138, 50 120, 52 106 Z'} fill="#5cb877" />
      <path d={mood === 'cheer' ? 'M158 108 C 182 90, 186 64, 170 58 C 162 76, 154 90, 148 104 Z' : 'M156 104 C 172 116, 172 146, 154 156 C 152 138, 150 120, 148 106 Z'} fill="#5cb877" />
      {/* masque facial */}
      <ellipse cx="78" cy="84" rx="22" ry="20" fill="#e9f7ea" />
      <ellipse cx="122" cy="84" rx="22" ry="20" fill="#e9f7ea" />
      <Eyes mood={mood} cx1={78} cx2={122} cy={84} />
      <path d="M94 100 L100 112 L106 100 Z" fill="#f2a43a" />
      {/* pattes */}
      <g fill="#f2a43a">
        <ellipse cx="84" cy="180" rx="10" ry="5" />
        <ellipse cx="116" cy="180" rx="10" ry="5" />
      </g>
      <circle cx="62" cy="104" r="6" fill="#ff9aa8" opacity=".55" />
      <circle cx="138" cy="104" r="6" fill="#ff9aa8" opacity=".55" />
    </g>
  );
}

function Luma({ mood }: { mood: Mood }) {
  return (
    <g>
      <defs>
        <radialGradient id="luma-glow" cx="50%" cy="70%" r="50%">
          <stop offset="0" stopColor="#fff6a8" />
          <stop offset="1" stopColor="#ffd23f" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="100" cy="140" r="60" fill="url(#luma-glow)" className="anim-float" />
      {/* ailes */}
      <g opacity=".85">
        <ellipse cx="62" cy="70" rx="30" ry="18" fill="#cfe9ff" transform={`rotate(${mood === 'cheer' ? -40 : -25} 62 70)`} />
        <ellipse cx="138" cy="70" rx="30" ry="18" fill="#cfe9ff" transform={`rotate(${mood === 'cheer' ? 40 : 25} 138 70)`} />
      </g>
      {/* antennes */}
      <path d="M86 46 C 80 26, 70 22, 64 24" stroke="#4b3f8c" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M114 46 C 120 26, 130 22, 136 24" stroke="#4b3f8c" strokeWidth="4" fill="none" strokeLinecap="round" />
      <circle cx="63" cy="24" r="6" fill="#ffd23f" />
      <circle cx="137" cy="24" r="6" fill="#ffd23f" />
      {/* corps */}
      <ellipse cx="100" cy="140" rx="36" ry="38" fill="#ffd94f" />
      <ellipse cx="100" cy="146" rx="26" ry="26" fill="#fff2a6" />
      <circle cx="100" cy="82" r="40" fill="#6c5fd3" />
      <ellipse cx="100" cy="92" rx="30" ry="24" fill="#857aeb" />
      <Eyes mood={mood} cx1={84} cx2={116} cy={80} r={6} />
      <Mouth mood={mood} x={100} y={100} />
      <circle cx="70" cy="96" r="5" fill="#ff9aa8" opacity=".6" />
      <circle cx="130" cy="96" r="5" fill="#ff9aa8" opacity=".6" />
    </g>
  );
}

function Orbi({ mood }: { mood: Mood }) {
  return (
    <g>
      <ellipse cx="100" cy="184" rx="44" ry="7" fill="rgba(0,0,0,.18)" />
      {/* antenne-boussole */}
      <line x1="100" y1="44" x2="100" y2="22" stroke="#9aa6d6" strokeWidth="5" strokeLinecap="round" />
      <circle cx="100" cy="18" r="9" fill="#f5b642" />
      <path d="M100 11 L103 18 L100 25 L97 18 Z" fill="#c2412d" />
      {/* tête */}
      <rect x="40" y="42" width="120" height="90" rx="40" fill="#dfe6ff" />
      <rect x="52" y="56" width="96" height="62" rx="28" fill="#1c2550" />
      <g fill="#59f0d6">
        {mood === 'cheer' ? (
          <>
            <path d="M68 90 q10 -16 20 0" stroke="#59f0d6" strokeWidth="5" fill="none" strokeLinecap="round" />
            <path d="M112 90 q10 -16 20 0" stroke="#59f0d6" strokeWidth="5" fill="none" strokeLinecap="round" />
          </>
        ) : (
          <>
            <rect x={mood === 'think' ? 70 : 72} y="76" width="14" height={mood === 'calm' ? 6 : 20} rx="7" />
            <rect x={mood === 'think' ? 112 : 116} y="76" width="14" height={mood === 'calm' ? 6 : 20} rx="7" />
          </>
        )}
        <path d="M88 104 q12 8 24 0" stroke="#59f0d6" strokeWidth="4" fill="none" strokeLinecap="round" />
      </g>
      <circle cx="36" cy="88" r="10" fill="#9aa6d6" />
      <circle cx="164" cy="88" r="10" fill="#9aa6d6" />
      {/* corps */}
      <rect x="60" y="132" width="80" height="50" rx="22" fill="#c6d0f5" />
      <circle cx="100" cy="156" r="14" fill="#2fbfa9" />
      <path d="M100 145 L104 156 L100 167 L96 156 Z" fill="#fff" />
      {/* bras */}
      <path d={mood === 'cheer' ? 'M60 142 L36 112' : 'M60 146 L42 166'} stroke="#9aa6d6" strokeWidth="10" strokeLinecap="round" />
      <path d={mood === 'cheer' ? 'M140 142 L164 112' : 'M140 146 L158 166'} stroke="#9aa6d6" strokeWidth="10" strokeLinecap="round" />
    </g>
  );
}

function Kip({ mood }: { mood: Mood }) {
  return (
    <g>
      <ellipse cx="100" cy="184" rx="48" ry="7" fill="rgba(0,0,0,.15)" />
      {/* queue */}
      <path d="M140 160 C 176 160, 186 132, 172 120 C 180 140, 160 150, 136 146 Z" fill="#e8673c" />
      {/* ailes */}
      <path d={mood === 'cheer' ? 'M58 104 L20 60 L34 104 L18 98 L48 124 Z' : 'M58 110 L26 92 L36 118 L22 120 L50 132 Z'} fill="#ffb27a" />
      <path d={mood === 'cheer' ? 'M142 104 L180 60 L166 104 L182 98 L152 124 Z' : 'M142 110 L174 92 L164 118 L178 120 L150 132 Z'} fill="#ffb27a" />
      {/* corps */}
      <ellipse cx="100" cy="146" rx="46" ry="40" fill="#f2814f" />
      <ellipse cx="100" cy="154" rx="30" ry="28" fill="#ffe0b8" />
      {/* tête */}
      <circle cx="100" cy="86" r="48" fill="#f2814f" />
      <path d="M70 46 L62 22 L84 40 Z" fill="#ffd166" />
      <path d="M130 46 L138 22 L116 40 Z" fill="#ffd166" />
      {/* lunettes d'aviateur */}
      <rect x="54" y="52" width="92" height="14" rx="7" fill="#7a4a2b" />
      <circle cx="80" cy="58" r="11" fill="#9be7ff" stroke="#7a4a2b" strokeWidth="4" />
      <circle cx="120" cy="58" r="11" fill="#9be7ff" stroke="#7a4a2b" strokeWidth="4" />
      <Eyes mood={mood} cx1={82} cx2={118} cy={88} r={6} />
      <ellipse cx="100" cy="112" rx="20" ry="12" fill="#ffd0a8" />
      <circle cx="94" cy="110" r="2.5" fill="#7a3a1e" />
      <circle cx="106" cy="110" r="2.5" fill="#7a3a1e" />
      <Mouth mood={mood} x={100} y={118} />
    </g>
  );
}

export function Mascot({ id, mood = 'happy', size = 120, className, title }: Props) {
  const name = MASCOTS.find((m) => m.id === id)?.name ?? 'Mascotte';
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} className={className} role="img" aria-label={title ?? `${name}, ta mascotte`}>
      {id === 'pip' && <Pip mood={mood} />}
      {id === 'luma' && <Luma mood={mood} />}
      {id === 'orbi' && <Orbi mood={mood} />}
      {id === 'kip' && <Kip mood={mood} />}
    </svg>
  );
}
