/** Générateur pseudo-aléatoire déterministe (mulberry32) : même graine => même exercice. */
export class Rng {
  private s: number;
  constructor(seed: number) {
    this.s = (seed * 2654435761) >>> 0 || 1;
  }
  next(): number {
    let t = (this.s = (this.s + 0x6d2b79f5) >>> 0);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  /** Entier dans [min, max] inclus. */
  int(min: number, max: number): number {
    return min + Math.floor(this.next() * (max - min + 1));
  }
  pick<T>(arr: readonly T[]): T {
    if (arr.length === 0) throw new Error('pick: tableau vide');
    return arr[Math.floor(this.next() * arr.length)] as T;
  }
  shuffle<T>(arr: readonly T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      [a[i], a[j]] = [a[j] as T, a[i] as T];
    }
    return a;
  }
}

/** Mélange non déterministe pour l'affichage. */
export function shuffle<T>(arr: readonly T[]): T[] {
  return new Rng(Math.floor(Math.random() * 1e9)).shuffle(arr);
}

/** Formatage français des nombres (espaces fines pour les milliers, virgule décimale). */
export function fr(n: number, maxDecimals = 3): string {
  return n.toLocaleString('fr-FR', { maximumFractionDigits: maxDecimals }).replace(/ /g, ' ');
}
