import { useEffect, useMemo, useState } from 'react';
import { Navigate, useParams } from 'react-router';
import { useProfileCtx } from './ProfileLayout';
import { buildDailyMission, type MissionBlock } from '@/adaptive-engine/planner';
import { todayISO } from '@/adaptive-engine/mastery';
import { getRecord } from '@/adaptive-engine/planner';
import { openRegions } from '@/progression/regions';
import { getProfile, saveProfile, sessionsFor } from '@/storage/repo';
import { Loading } from '@/components/ui';
import { LEVEL_DEFAULTS } from '@/profiles/levelDefaults';
import { SessionRunner } from '../session/SessionRunner';

export default function MissionPage() {
  const { sessionId } = useParams();
  const { profile, level, records, refresh } = useProfileCtx();
  const [missions, setMissions] = useState<number | null>(null);
  const [frozen, setFrozen] = useState<MissionBlock[] | null>(null);

  useEffect(() => {
    void sessionsFor(profile.id).then((s) => setMissions(s.filter((x) => x.kind === 'mission').length));
  }, [profile.id]);

  const custom = sessionId ? profile.customSessions.find((c) => c.id === sessionId) : undefined;
  const blocks = useMemo(() => {
    if (missions === null) return null;
    if (custom) {
      return custom.skillIds.map((id): MissionBlock => {
        const rec = getRecord(records, profile.id, id);
        return { skillId: id, kind: rec.attempts === 0 ? 'new' : 'learn', withLesson: !rec.lessonSeen, alternativeFirst: false, count: LEVEL_DEFAULTS[level.id].blockSize };
      });
    }
    return buildDailyMission(level, profile, records, new Date(), todayISO(), openRegions(level, profile, missions));
    // La mission est figée au démarrage : elle ne change pas pendant qu'on la fait.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [missions, custom?.id]);

  useEffect(() => {
    if (blocks && !frozen) setFrozen(blocks);
  }, [blocks, frozen]);

  if (sessionId && !custom) return <Navigate to={`/p/${profile.id}`} replace />;
  if (!frozen) return <Loading label="Préparation de ta mission…" />;
  return (
    <SessionRunner
      profile={profile}
      blocks={frozen}
      kind={custom ? 'custom' : 'mission'}
      title={custom ? custom.title : 'Mission du jour'}
      onComplete={async () => {
        if (custom) {
          const p = await getProfile(profile.id);
          if (p) await saveProfile({ ...p, customSessions: p.customSessions.map((c) => (c.id === custom.id ? { ...c, done: true } : c)) });
        }
        await refresh();
      }}
    />
  );
}
