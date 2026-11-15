/**
 * Déblocage des régions de la carte : les régions des matières principales (français,
 * mathématiques, anglais) sont ouvertes dès le départ ; les autres s'ouvrent une à une
 * après chaque mission accomplie. L'adulte peut tout ouvrir (exploration libre).
 */
import type { LevelDefinition, Region } from '@/curriculum/types';
import type { Profile } from '@/profiles/types';

const CORE = new Set(['francais', 'maths', 'anglais']);

export function regionUnlockRank(level: LevelDefinition, region: Region): number {
  const extra = level.regions.filter((r) => !r.subjects.some((s) => CORE.has(s)));
  const i = extra.findIndex((r) => r.id === region.id);
  return i === -1 ? 0 : i + 1;
}

export function openRegions(level: LevelDefinition, profile: Profile, missionsDone: number): Set<string> {
  return new Set(level.regions.filter((r) => profile.plan.freeExplore || regionUnlockRank(level, r) <= missionsDone).map((r) => r.id));
}

export function unlockHint(level: LevelDefinition, region: Region, missionsDone: number): string {
  const need = regionUnlockRank(level, region) - missionsDone;
  return need <= 0 ? '' : `encore ${need} mission${need > 1 ? 's' : ''} du jour pour l’ouvrir`;
}
