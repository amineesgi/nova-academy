import { useEffect, useRef, useState } from 'react';
import { Download, HardDrive, Upload } from 'lucide-react';
import { useApp } from '@/app/AppContext';
import { LEVELS, inventory } from '@/curriculum/registry';
import { SUBJECT_LABELS, type SubjectId } from '@/curriculum/types';
import { ConfirmModal } from '@/components/ui';
import { BackupError, backupFileName, exportBackup, parseBackupText, restoreBackup, type BackupData } from '@/storage/backup';
import { setMeta, getMeta } from '@/storage/repo';

function download(name: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function ParentBackup() {
  const { profiles, reloadProfiles, notify } = useApp();
  const [pending, setPending] = useState<BackupData | null>(null);
  const [mode, setMode] = useState<'merge' | 'replace'>('merge');
  const [error, setError] = useState('');
  const [storage, setStorage] = useState<{ usage?: number; quota?: number; persisted?: boolean }>({});
  const [lastExport, setLastExport] = useState<string | undefined>();
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    void (async () => {
      const est = navigator.storage?.estimate ? await navigator.storage.estimate() : {};
      const persisted = navigator.storage?.persisted ? await navigator.storage.persisted() : undefined;
      setStorage({ usage: est.usage, quota: est.quota, persisted });
      setLastExport(await getMeta<string>('lastExport'));
    })();
  }, []);

  const doExport = async (ids?: string[]) => {
    const file = await exportBackup(undefined, ids);
    download(backupFileName(), JSON.stringify(file, null, 1));
    const now = new Date().toISOString();
    await setMeta('lastExport', now);
    setLastExport(now);
    notify('Sauvegarde exportée dans vos téléchargements.', 'success');
  };

  const onFile = async (f: File | undefined) => {
    setError('');
    if (!f) return;
    if (f.size > 30 * 1024 * 1024) return setError('Fichier trop volumineux pour être une sauvegarde Nova Academy.');
    try {
      setPending(parseBackupText(await f.text()));
    } catch (e) {
      setError(e instanceof BackupError ? e.message : 'Fichier illisible.');
    }
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className="stack" style={{ gap: 20 }}>
      <h1 style={{ margin: 0 }}>Sauvegardes et transfert</h1>
      <section className="card stack">
        <h2 className="row" style={{ margin: 0 }}>
          <Download /> Exporter
        </h2>
        <p className="muted" style={{ margin: 0 }}>
          Crée un fichier .json avec les profils et toute la progression. Utilisez-le pour garder une copie de sécurité ou pour continuer sur un autre ordinateur.
          {lastExport && ` Dernier export : ${new Date(lastExport).toLocaleString('fr-FR')}.`}
        </p>
        <div className="row">
          <button className="btn btn-primary" onClick={() => void doExport()} disabled={profiles.length === 0}>
            <Download size={18} /> Exporter tous les profils
          </button>
          {profiles.map((p) => (
            <button key={p.id} className="btn btn-ghost" onClick={() => void doExport([p.id])}>
              Exporter {p.name} seulement
            </button>
          ))}
        </div>
      </section>

      <section className="card stack">
        <h2 className="row" style={{ margin: 0 }}>
          <Upload /> Importer
        </h2>
        <p className="muted" style={{ margin: 0 }}>
          Le fichier est vérifié avant toute modification. Les sauvegardes d’anciennes versions sont converties automatiquement.
        </p>
        <label className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
          <Upload size={18} /> Choisir un fichier de sauvegarde
          <input ref={fileRef} type="file" accept="application/json,.json" className="sr-only" onChange={(e) => void onFile(e.target.files?.[0])} />
        </label>
        {error && (
          <p className="feedback feedback-ko" role="alert" style={{ margin: 0 }}>
            {error}
          </p>
        )}
      </section>

      <section className="card stack">
        <h2 className="row" style={{ margin: 0 }}>
          <HardDrive /> Stockage sur cet ordinateur
        </h2>
        <ul style={{ margin: 0 }}>
          <li>Espace utilisé : {storage.usage !== undefined ? `${(storage.usage / 1024 / 1024).toFixed(1)} Mo` : 'inconnu'}{storage.quota ? ` sur ${(storage.quota / 1024 / 1024 / 1024).toFixed(1)} Go disponibles` : ''}.</li>
          <li>Stockage protégé contre l’effacement automatique : {storage.persisted === undefined ? 'inconnu' : storage.persisted ? 'oui' : 'non (le navigateur peut effacer les données en cas de manque de place)'}.</li>
          <li>Effacer les « données de navigation » ou utiliser la navigation privée supprime la progression : exportez régulièrement.</li>
        </ul>
      </section>

      <section className="card stack">
        <h2 style={{ margin: 0 }}>Contenus disponibles</h2>
        {Object.values(LEVELS).map((lvl) => {
          const inv = inventory(lvl);
          return (
            <div key={lvl.id}>
              <strong>
                {lvl.label} : {inv.skills} compétences, {inv.authored} exercices rédigés + {inv.variants} variantes générées et vérifiées.
              </strong>
              <div className="row" style={{ gap: 6, marginTop: 6 }}>
                {[...inv.bySubject].map(([s, v]) => (
                  <span key={s} className="pill" style={{ fontSize: 'var(--fs-xs)' }}>
                    {SUBJECT_LABELS[s as SubjectId]} : {v.authored + v.variants}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </section>

      {pending && (
        <ConfirmModal
          title="Importer cette sauvegarde ?"
          confirmLabel="Importer"
          danger={mode === 'replace'}
          text={
            <div className="stack">
              <p style={{ margin: 0 }}>
                Profils trouvés : {pending.profiles.map((p) => `${p.name} (${p.level.toUpperCase()})`).join(', ')} — {pending.attempts.length} réponses enregistrées.
              </p>
              <label className="switch">
                <input type="radio" name="mode" checked={mode === 'merge'} onChange={() => setMode('merge')} /> Remplacer seulement ces profils (les autres profils de cet ordinateur sont gardés)
              </label>
              <label className="switch">
                <input type="radio" name="mode" checked={mode === 'replace'} onChange={() => setMode('replace')} /> Tout remplacer (efface tous les profils actuels de cet ordinateur)
              </label>
              <p className="kbd-hint" style={{ margin: 0 }}>Les données actuelles des profils concernés seront écrasées.</p>
            </div>
          }
          onCancel={() => setPending(null)}
          onConfirm={async () => {
            try {
              await restoreBackup(pending, mode);
              await reloadProfiles();
              notify('Sauvegarde importée avec succès.', 'success');
            } catch {
              setError('L’import a échoué : aucune donnée n’a été modifiée.');
            }
            setPending(null);
          }}
        />
      )}
    </div>
  );
}
