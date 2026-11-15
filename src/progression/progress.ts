/** Progression : agrégation des statistiques et attribution des récompenses. */
import { computeState, todayISO, type SkillState } from '@/adaptive-engine/mastery';
import { getSkill } from '@/curriculum/registry';
import type { Profile } from '@/profiles/types';
import { levelFromXp, newBadges, unlockedCosmetics, type BadgeStats } from '@/rewards/rewards';
import { db, type NovaDB } from '@/storage/db';

export async function badgeStats(profileId: string, d: NovaDB = db): Promise<BadgeStats> {
  const [attempts, sessions, records, profile] = await Promise.all([
    d.attempts.where('profileId').equals(profileId).toArray(),
    d.sessions.where('profileId').equals(profileId).toArray(),
    d.skillRecords.where('profileId').equals(profileId).toArray(),
    d.profiles.get(profileId),
  ]);
  const consolidated: SkillState[] = ['consolidate', 'mastered'];
  const subjects = new Set(attempts.map((a) => getSkill(a.skillId)?.subject).filter(Boolean));
  return {
    answered: attempts.length,
    correct: attempts.filter((a) => a.correct).length,
    comebacks: attempts.filter((a) => a.correct && a.tries > 1).length,
    missions: sessions.filter((s) => s.kind === 'mission').length,
    activeDays: profile?.activeDays.length ?? 0,
    mastered: records.filter((r) => consolidated.includes(computeState(r))).length,
    subjectsTried: subjects.size,
    lessons: records.filter((r) => r.lessonSeen).length,
    games: sessions.filter((s) => s.kind === 'game').length,
    chests: profile?.rewards.chests ?? 0,
    listened: attempts.filter((a) => a.correct && a.type === 'listen').length,
  };
}

export interface RewardDelta {
  xp?: number;
  stars?: number;
  chests?: number;
}

export interface RewardResult {
  profile: Profile;
  newBadges: string[];
  newCosmetics: string[];
  levelUp: boolean;
}

/** Ajoute XP/étoiles, puis débloque badges et objets (déterministe, jamais aléatoire). */
export async function grantRewards(profileId: string, delta: RewardDelta, d: NovaDB = db): Promise<RewardResult | null> {
  const p = await d.profiles.get(profileId);
  if (!p) return null;
  const before = unlockedCosmetics(p.rewards);
  const lvlBefore = levelFromXp(p.rewards.xp).level;
  const rewards = {
    ...p.rewards,
    xp: p.rewards.xp + (delta.xp ?? 0),
    stars: p.rewards.stars + (delta.stars ?? 0),
    chests: p.rewards.chests + (delta.chests ?? 0),
  };
  const stats = await badgeStats(profileId, d);
  stats.chests = rewards.chests;
  const badges = newBadges(rewards, stats, todayISO());
  rewards.badges = [...rewards.badges, ...badges];
  const after = unlockedCosmetics(rewards);
  rewards.cosmetics = after;
  const profile = { ...p, rewards };
  await d.profiles.put(profile);
  return {
    profile,
    newBadges: badges.map((b) => b.id),
    newCosmetics: after.filter((c) => !before.includes(c)),
    levelUp: levelFromXp(rewards.xp).level > lvlBefore,
  };
}
