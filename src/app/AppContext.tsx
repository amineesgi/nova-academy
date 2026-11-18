/** État global : profils, profil actif, compétences, activité en cours, notifications. */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { RecordMap } from '@/adaptive-engine/planner';
import { LEVELS } from '@/curriculum/registry';
import type { LevelDefinition } from '@/curriculum/types';
import type { Profile, ThemeId } from '@/profiles/types';
import { listProfiles, loadRecords, saveProfile } from '@/storage/repo';
import { requestPersistence } from '@/storage/db';

export interface Toast {
  id: number;
  text: string;
  tone?: 'info' | 'success' | 'reward';
}

interface AppState {
  ready: boolean;
  profiles: Profile[];
  reloadProfiles: () => Promise<Profile[]>;
  /** Activité en cours : le changement de profil demande alors une confirmation. */
  busy: boolean;
  setBusy: (b: boolean) => void;
  toasts: Toast[];
  notify: (text: string, tone?: Toast['tone']) => void;
}

const Ctx = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [busy, setBusy] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const reloadProfiles = useCallback(async () => {
    const list = await listProfiles();
    setProfiles(list);
    return list;
  }, []);

  useEffect(() => {
    void reloadProfiles().then(() => setReady(true));
    // L'application a démarré correctement : on autorise un futur rechargement automatique.
    setTimeout(() => {
      try {
        sessionStorage.removeItem('nova-chunk-reload');
      } catch {
        /* stockage indisponible */
      }
    }, 5000);
    void requestPersistence();
  }, [reloadProfiles]);

  const notify = useCallback((text: string, tone: Toast['tone'] = 'info') => {
    const id = nextId.current++;
    setToasts((t) => [...t, { id, text, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);

  // Avertit avant de quitter la page pendant une activité (les réponses déjà données restent sauvegardées).
  useEffect(() => {
    const h = (e: BeforeUnloadEvent) => {
      if (busy) e.preventDefault();
    };
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [busy]);

  const value = useMemo(() => ({ ready, profiles, reloadProfiles, busy, setBusy, toasts, notify }), [ready, profiles, reloadProfiles, busy, toasts, notify]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp hors AppProvider');
  return v;
}

/** Applique thème, taille du texte et animations réduites sur <html>. */
export function applyAppearance(theme: ThemeId | 'nova', textScale = 1, reducedMotion = false) {
  const root = document.documentElement;
  if (theme === 'nova') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', theme);
  root.style.setProperty('--text-scale', String(textScale));
  root.setAttribute('data-reduced-motion', String(reducedMotion));
}

/** Données d'un profil : profil, niveau, compétences (rechargées à la demande). */
export function useProfileData(profileId: string | undefined) {
  const { profiles, reloadProfiles } = useApp();
  const profile = profiles.find((p) => p.id === profileId);
  const level: LevelDefinition | undefined = profile ? LEVELS[profile.level] : undefined;
  const [records, setRecords] = useState<RecordMap>(new Map());
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    if (!profileId) return;
    setRecords(await loadRecords(profileId));
    await reloadProfiles();
    setLoaded(true);
  }, [profileId, reloadProfiles]);

  useEffect(() => {
    setLoaded(false);
    if (profileId) void loadRecords(profileId).then((r) => {
      setRecords(r);
      setLoaded(true);
    });
  }, [profileId]);

  useEffect(() => {
    if (profile) applyAppearance(profile.theme, profile.settings.textScale, profile.settings.reducedMotion);
  }, [profile]);

  const update = useCallback(
    async (patch: Partial<Profile>) => {
      if (!profile) return;
      await saveProfile({ ...profile, ...patch });
      await reloadProfiles();
    },
    [profile, reloadProfiles],
  );

  return { profile, level, records, loaded, refresh, update };
}
