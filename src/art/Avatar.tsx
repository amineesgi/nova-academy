/** Avatar personnalisable, entièrement en SVG. */
import type { AvatarConfig } from '@/profiles/types';

export const SKINS = ['#f9d7c0', '#f1c3a0', '#dca27d', '#b97a52', '#8d5a3b', '#5e3b26'];
export const HAIR_COLORS = ['#2b1d16', '#5a3824', '#a0612f', '#e1b25b', '#c9472f', '#6d5bd0'];
export const OUTFITS = ['#ef6f8e', '#ffb347', '#4cb782', '#3d8fe0', '#8a6ee8', '#2fbfa9'];
export const BACKGROUNDS = [
  ['#ffe3b3', '#ffb8c6'],
  ['#c9f2dd', '#8fd9b6'],
  ['#cfe3ff', '#9ec2ff'],
  ['#1f2a5a', '#3a4a94'],
  ['#ffd6a5', '#ff9f6e'],
  ['#e5dcff', '#b9a6ff'],
  ['#ffd1e8', '#a8c8ff'],
  ['#0f0c2e', '#3b2a7a'],
  ['#ff9a9e', '#fad0c4'],
];
export const HAIR_STYLES = ['Court', 'Long', 'Bouclé', 'Queue-de-cheval', 'Chignons'];

export const ACCESSORIES: { id: string; label: string }[] = [
  { id: 'acc-lunettes', label: 'Lunettes rondes' },
  { id: 'acc-casquette', label: 'Casquette' },
  { id: 'acc-couronne', label: 'Couronne de fleurs' },
  { id: 'acc-casque', label: 'Casque d’explorateur' },
  { id: 'acc-etoile', label: 'Barrette étoile' },
  { id: 'acc-echarpe', label: 'Écharpe' },
  { id: 'acc-cape', label: 'Cape de savant' },
  { id: 'acc-headset', label: 'Casque audio' },
];

function Hair({ style, color, back }: { style: number; color: string; back: boolean }) {
  if (back) {
    if (style === 1) return <path d="M48 70 C 40 120, 46 160, 56 176 L144 176 C 154 160, 160 120, 152 70 Z" fill={color} />;
    if (style === 3) return <path d="M140 70 C 172 86, 172 140, 150 160 C 160 130, 156 100, 140 90 Z" fill={color} />;
    if (style === 2) return <circle cx="100" cy="82" r="62" fill={color} />;
    return null;
  }
  switch (style) {
    case 0:
      return <path d="M52 84 C 50 46, 80 30, 104 32 C 132 32, 152 50, 148 84 C 136 66, 118 58, 100 60 C 82 60, 64 66, 52 84 Z" fill={color} />;
    case 1:
      return <path d="M50 92 C 46 50, 76 30, 100 30 C 128 30, 156 50, 150 92 C 140 70, 120 56, 100 58 C 80 58, 62 70, 50 92 Z" fill={color} />;
    case 2:
      return (
        <g fill={color}>
          {[54, 70, 88, 106, 124, 142].map((x, i) => (
            <circle key={x} cx={x} cy={i % 2 ? 48 : 60} r="16" />
          ))}
          <circle cx="100" cy="40" r="18" />
        </g>
      );
    case 3:
      return (
        <g fill={color}>
          <path d="M52 86 C 50 48, 80 30, 104 32 C 132 32, 152 50, 148 86 C 136 64, 116 58, 100 58 C 82 58, 64 66, 52 86 Z" />
          <circle cx="146" cy="70" r="9" fill="#ffcf5c" />
        </g>
      );
    default:
      return (
        <g fill={color}>
          <path d="M52 86 C 50 48, 80 32, 104 32 C 132 32, 152 50, 148 86 C 136 64, 116 58, 100 58 C 82 58, 64 66, 52 86 Z" />
          <circle cx="60" cy="40" r="17" />
          <circle cx="140" cy="40" r="17" />
        </g>
      );
  }
}

function Accessory({ id }: { id: string | null }) {
  switch (id) {
    case 'acc-lunettes':
      return (
        <g fill="none" stroke="#2b2340" strokeWidth="4">
          <circle cx="80" cy="96" r="14" />
          <circle cx="120" cy="96" r="14" />
          <path d="M94 96 h12" />
        </g>
      );
    case 'acc-casquette':
      return (
        <g>
          <path d="M52 72 C 56 40, 144 40, 148 72 Z" fill="#e2463a" />
          <path d="M100 70 C 130 66, 160 70, 172 78 C 150 82, 124 80, 100 76 Z" fill="#b8322a" />
        </g>
      );
    case 'acc-couronne':
      return (
        <g>
          {[58, 78, 100, 122, 142].map((x, i) => (
            <circle key={x} cx={x} cy={i % 2 ? 50 : 56} r="9" fill={['#ff8fab', '#ffd166', '#9be7a0', '#ffd166', '#ff8fab'][i]} />
          ))}
        </g>
      );
    case 'acc-casque':
      return (
        <g>
          <path d="M46 76 C 50 30, 150 30, 154 76 Z" fill="#d9c08a" />
          <rect x="40" y="70" width="120" height="10" rx="5" fill="#b49a62" />
          <rect x="54" y="62" width="92" height="6" fill="#7a5b2e" />
        </g>
      );
    case 'acc-etoile':
      return <path d="M146 56 l5 10 11 2 -8 8 2 11 -10 -5 -10 5 2 -11 -8 -8 11 -2 Z" fill="#ffcf3f" stroke="#e0a800" strokeWidth="2" />;
    case 'acc-echarpe':
      return (
        <g>
          <path d="M62 150 C 80 162, 120 162, 138 150 L140 166 C 120 176, 80 176, 60 166 Z" fill="#3d8fe0" />
          <rect x="118" y="160" width="16" height="30" rx="5" fill="#2f74c0" />
        </g>
      );
    case 'acc-cape':
      return <path d="M50 160 L30 200 L170 200 L150 160 Z" fill="#6d4ad1" opacity=".9" />;
    case 'acc-headset':
      return (
        <g>
          <path d="M48 96 C 44 40, 156 40, 152 96" stroke="#30344a" strokeWidth="8" fill="none" />
          <rect x="38" y="88" width="18" height="28" rx="8" fill="#2fbfa9" />
          <rect x="144" y="88" width="18" height="28" rx="8" fill="#2fbfa9" />
        </g>
      );
    default:
      return null;
  }
}

export function Avatar({ config, size = 96, title = 'Avatar' }: { config: AvatarConfig; size?: number; title?: string }) {
  const bg = BACKGROUNDS[config.background % BACKGROUNDS.length] ?? BACKGROUNDS[0]!;
  const skin = SKINS[config.skin % SKINS.length];
  const hair = HAIR_COLORS[config.hairColor % HAIR_COLORS.length] ?? '#2b1d16';
  const outfit = OUTFITS[config.outfit % OUTFITS.length];
  const gid = `av-${config.background}`;
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} role="img" aria-label={title}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={bg[0]} />
          <stop offset="1" stopColor={bg[1]} />
        </linearGradient>
        <clipPath id="av-clip">
          <circle cx="100" cy="100" r="100" />
        </clipPath>
      </defs>
      <g clipPath="url(#av-clip)">
        <rect width="200" height="200" fill={`url(#${gid})`} />
        {config.accessory === 'acc-cape' && <Accessory id="acc-cape" />}
        <Hair style={config.hair % HAIR_STYLES.length} color={hair} back />
        {/* corps */}
        <path d="M40 200 C 44 160, 70 148, 100 148 C 130 148, 156 160, 160 200 Z" fill={outfit} />
        <path d="M86 148 L100 166 L114 148 Z" fill="#fff" opacity=".85" />
        <rect x="88" y="128" width="24" height="24" rx="10" fill={skin} />
        {/* tête */}
        <ellipse cx="100" cy="96" rx="48" ry="52" fill={skin} />
        <ellipse cx="52" cy="100" rx="8" ry="11" fill={skin} />
        <ellipse cx="148" cy="100" rx="8" ry="11" fill={skin} />
        <Hair style={config.hair % HAIR_STYLES.length} color={hair} back={false} />
        {/* visage */}
        <circle cx="80" cy="98" r="6" fill="#2b2340" />
        <circle cx="120" cy="98" r="6" fill="#2b2340" />
        <circle cx="82" cy="96" r="2" fill="#fff" />
        <circle cx="122" cy="96" r="2" fill="#fff" />
        <path d="M86 120 Q100 132 114 120" stroke="#2b2340" strokeWidth="4" fill="none" strokeLinecap="round" />
        <circle cx="68" cy="114" r="7" fill="#ff8fa3" opacity=".35" />
        <circle cx="132" cy="114" r="7" fill="#ff8fa3" opacity=".35" />
        {config.accessory !== 'acc-cape' && <Accessory id={config.accessory} />}
      </g>
    </svg>
  );
}
