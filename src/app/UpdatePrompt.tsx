/**
 * Mise à jour de l'application (PWA) : quand une nouvelle version est déployée, on propose
 * de l'installer — jamais pendant une activité en cours. Les données (IndexedDB) ne sont pas
 * touchées par la mise à jour ; les migrations de schéma sont gérées par Dexie.
 */
import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useApp } from './AppContext';

export function UpdatePrompt() {
  const { busy, notify } = useApp();
  const [update, setUpdate] = useState<null | ((reload?: boolean) => Promise<void>)>(null);

  useEffect(() => {
    if (import.meta.env.DEV || !('serviceWorker' in navigator)) return;
    let cancelled = false;
    void import('virtual:pwa-register').then(({ registerSW }) => {
      if (cancelled) return;
      const updateSW = registerSW({
        immediate: true,
        onNeedRefresh: () => setUpdate(() => updateSW),
        onOfflineReady: () => notify('Nova Academy est prête à fonctionner sans Internet sur cet ordinateur.', 'success'),
        onRegisteredSW: (_url, reg) => {
          // Vérifie régulièrement s'il existe une nouvelle version publiée.
          if (reg) setInterval(() => void reg.update().catch(() => undefined), 60 * 60 * 1000);
        },
      });
    });
    return () => {
      cancelled = true;
    };
  }, [notify]);

  if (!update || busy) return null;
  return (
    <div className="toasts" style={{ left: 16, right: 'auto' }}>
      <div className="toast" role="alert" style={{ alignItems: 'center' }}>
        <RefreshCw size={20} />
        <span style={{ flex: 1 }}>Une nouvelle version est disponible. Ta progression est conservée.</span>
        <button className="btn btn-sm btn-primary" onClick={() => void update(true)}>
          Mettre à jour
        </button>
      </div>
    </div>
  );
}
