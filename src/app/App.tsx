import { Component, lazy, Suspense, useEffect, type ComponentType, type ReactNode } from 'react';
import { HashRouter, Navigate, Route, Routes, useLocation } from 'react-router';
import { AppProvider, applyAppearance, useApp } from './AppContext';
import { Loading, ToastHost } from '@/components/ui';
import { UpdatePrompt } from './UpdatePrompt';
import { Welcome } from './screens/Welcome';
import { CreateProfile } from './screens/CreateProfile';
import { ProfileLayout } from './screens/ProfileLayout';
import { Home } from './screens/Home';

/**
 * Chargement différé robuste : si une nouvelle version a été publiée pendant l'utilisation,
 * les anciens fichiers n'existent plus. On recharge alors la page une fois (sur la nouvelle
 * version) au lieu d'afficher un écran blanc. Les données (IndexedDB) ne sont pas touchées.
 */
function lazyWithReload<T extends ComponentType<object>>(load: () => Promise<{ default: T }>) {
  return lazy(() =>
    load().catch((err: unknown) => {
      let reloaded = false;
      try {
        reloaded = sessionStorage.getItem('nova-chunk-reload') === '1';
        if (!reloaded) sessionStorage.setItem('nova-chunk-reload', '1');
      } catch {
        /* stockage indisponible */
      }
      if (!reloaded) {
        window.location.reload();
        return new Promise<{ default: T }>(() => undefined);
      }
      throw err;
    }),
  );
}

class LoadErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <main className="page">
        <div className="container card stack" style={{ maxWidth: 560, marginTop: 48 }} role="alert">
          <h1 style={{ margin: 0 }}>Oups, un écran n’a pas pu s’ouvrir</h1>
          <p style={{ margin: 0 }}>Une nouvelle version de Nova Academy a peut-être été installée. Ta progression est bien enregistrée.</p>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            Recharger
          </button>
        </div>
      </main>
    );
  }
}

// Chargement différé des écrans plus lourds
const SkillPage = lazyWithReload(() => import('./screens/SkillPage'));
const MissionPage = lazyWithReload(() => import('./screens/MissionPage'));
const Diagnostic = lazyWithReload(() => import('./screens/Diagnostic'));
const RewardsPage = lazyWithReload(() => import('./screens/RewardsPage'));
const SettingsPage = lazyWithReload(() => import('./screens/SettingsPage'));
const GamesHub = lazyWithReload(() => import('@/games/GamesHub'));
const GamePage = lazyWithReload(() => import('@/games/GamePage'));
const ParentArea = lazyWithReload(() => import('@/parent-dashboard/ParentArea'));
const HelpPage = lazyWithReload(() => import('./screens/HelpPage'));

function NeutralTheme() {
  const loc = useLocation();
  useEffect(() => {
    if (!loc.pathname.startsWith('/p/')) applyAppearance('nova', 1, false);
  }, [loc.pathname]);
  return null;
}

function Shell() {
  const { ready } = useApp();
  if (!ready) return <Loading label="Ouverture de Nova Academy…" />;
  return (
    <div className="app-shell">
      <a href="#main" className="skip-link">
        Aller au contenu
      </a>
      <NeutralTheme />
      <LoadErrorBoundary>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/nouveau/:level" element={<CreateProfile />} />
          <Route path="/aide" element={<HelpPage />} />
          <Route path="/parent/*" element={<ParentArea />} />
          <Route path="/p/:profileId" element={<ProfileLayout />}>
            <Route index element={<Home />} />
            <Route path="competence/:skillId" element={<SkillPage />} />
            <Route path="mission" element={<MissionPage />} />
            <Route path="seance/:sessionId" element={<MissionPage />} />
            <Route path="diagnostic" element={<Diagnostic />} />
            <Route path="jeux" element={<GamesHub />} />
            <Route path="jeux/:gameId" element={<GamePage />} />
            <Route path="tresors" element={<RewardsPage />} />
            <Route path="reglages" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      </LoadErrorBoundary>
      <ToastHost />
      <UpdatePrompt />
    </div>
  );
}

export function App() {
  return (
    <AppProvider>
      <HashRouter>
        <Shell />
      </HashRouter>
    </AppProvider>
  );
}
