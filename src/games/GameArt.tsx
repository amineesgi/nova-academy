/** Vignettes SVG originales des mini-jeux. */
import type { GameId } from './catalog';

export function GameArt({ id, size = 110 }: { id: GameId; size?: number }) {
  const common = { width: size, height: size, viewBox: '0 0 100 100', 'aria-hidden': true } as const;
  switch (id) {
    case 'course':
      return (
        <svg {...common}>
          <path d="M10 80 Q50 50 90 80" stroke="#fff" strokeWidth="6" fill="none" strokeDasharray="8 6" />
          <circle cx="30" cy="62" r="10" fill="#ffd166" />
          <rect x="70" y="40" width="4" height="34" fill="#fff" />
          <path d="M74 40 h16 l-4 6 4 6 h-16 Z" fill="#ff6b8b" />
          <text x="22" y="32" fontSize="20" fontWeight="900" fill="#fff">7×8</text>
        </svg>
      );
    case 'detective':
      return (
        <svg {...common}>
          <circle cx="42" cy="42" r="22" fill="#fff3" stroke="#fff" strokeWidth="6" />
          <path d="M58 58 L82 82" stroke="#fff" strokeWidth="9" strokeLinecap="round" />
          <text x="30" y="49" fontSize="18" fontWeight="900" fill="#fff">abc</text>
        </svg>
      );
    case 'english':
      return (
        <svg {...common}>
          <rect x="14" y="22" width="32" height="44" rx="6" fill="#fff" />
          <rect x="54" y="30" width="32" height="44" rx="6" fill="#ffd166" transform="rotate(10 70 52)" />
          <text x="19" y="50" fontSize="14" fontWeight="900" fill="#3bb37f">cat</text>
          <path d="M64 50 l6 -6 l6 6 v10 h-12 Z" fill="#3bb37f" transform="rotate(10 70 52)" />
        </svg>
      );
    case 'phrases':
      return (
        <svg {...common}>
          <rect x="18" y="30" width="64" height="40" rx="8" fill="#fff" />
          <circle cx="34" cy="50" r="8" fill="#d65a8c" />
          <circle cx="66" cy="50" r="8" fill="#ffd166" />
          <rect x="10" y="78" width="22" height="10" rx="4" fill="#fff" />
          <rect x="38" y="78" width="22" height="10" rx="4" fill="#fff" />
          <rect x="66" y="78" width="22" height="10" rx="4" fill="#fff" />
        </svg>
      );
    case 'temps':
      return (
        <svg {...common}>
          <line x1="8" y1="60" x2="92" y2="60" stroke="#fff" strokeWidth="5" />
          {[20, 45, 70].map((x) => (
            <circle key={x} cx={x} cy="60" r="7" fill="#ffd166" />
          ))}
          <path d="M40 20 h20 l-8 14 l8 14 h-20 l8 -14 Z" fill="#fff" />
        </svg>
      );
    case 'labo':
      return (
        <svg {...common}>
          <path d="M40 14 h20 v20 l18 40 a6 6 0 0 1 -5 8 h-46 a6 6 0 0 1 -5 -8 l18 -40 Z" fill="#fff" />
          <path d="M30 60 h40 l7 14 a4 4 0 0 1 -4 6 h-46 a4 4 0 0 1 -4 -6 Z" fill="#4fd6c8" />
          <circle cx="44" cy="68" r="3" fill="#fff" />
        </svg>
      );
    case 'fractions':
      return (
        <svg {...common}>
          <circle cx="50" cy="50" r="34" fill="#fff" />
          <path d="M50 50 L50 16 A34 34 0 0 1 84 50 Z" fill="#ff6b8b" />
          <path d="M50 50 L84 50 A34 34 0 0 1 50 84 Z" fill="#ffd166" />
          <line x1="50" y1="16" x2="50" y2="84" stroke="#d9a73a" strokeWidth="2" />
          <line x1="16" y1="50" x2="84" y2="50" stroke="#d9a73a" strokeWidth="2" />
        </svg>
      );
    case 'coffre':
      return (
        <svg {...common}>
          <rect x="18" y="44" width="64" height="36" rx="6" fill="#a0612f" />
          <path d="M18 44 a32 20 0 0 1 64 0 Z" fill="#c07a3c" />
          <rect x="44" y="50" width="12" height="14" rx="3" fill="#ffd166" />
          <path d="M30 26 l3 -8 3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 Z" fill="#fff" />
        </svg>
      );
  }
}
