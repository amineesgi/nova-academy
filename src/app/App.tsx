import { lazy, Suspense, useEffect } from 'react';
import { HashRouter, Navigate, Route, Routes, useLocation } from 'react-router';
import { AppProvider, applyAppearance, useApp } from './AppContext';
import { Loading, ToastHost } from '@/components/ui';
import { UpdatePrompt } from './UpdatePrompt';
import { Welcome } from './screens/Welcome';
import { CreateProfile } from './screens/CreateProfile';
import { ProfileLayout } from './screens/ProfileLayout';
import { Home } from './screens/Home';

// Chargement différé des écrans plus lourds
const SkillPage = lazy(() => import('./screens/SkillPage'));
const MissionPage = lazy(() => import('./screens/MissionPage'));
const Diagnostic = lazy(() => import('./screens/Diagnostic'));
const RewardsPage = lazy(() => import('./screens/RewardsPage'));
const SettingsPage = lazy(() => import('./screens/SettingsPage'));
const GamesHub = lazy(() => import('@/games/GamesHub'));
const GamePage = lazy(() => import('@/games/GamePage'));
const ParentArea = lazy(() => import('@/parent-dashboard/ParentArea'));
const HelpPage = lazy(() => import('./screens/HelpPage'));

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
