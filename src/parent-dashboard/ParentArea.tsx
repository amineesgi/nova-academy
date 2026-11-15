/**
 * Espace parent. Protection simple par code à 4 chiffres (haché localement) :
 * c'est une barrière pour les enfants, PAS une sécurité forte (les données sont
 * dans le navigateur et restent techniquement accessibles).
 */
import { useEffect, useState } from 'react';
import { Link, NavLink, Route, Routes } from 'react-router';
import { ArrowLeft, DatabaseBackup, LayoutDashboard, LogOut, ShieldCheck } from 'lucide-react';
import { getMeta, setMeta } from '@/storage/repo';
import { Loading } from '@/components/ui';
import { ParentOverview } from './ParentOverview';
import { ParentProfile } from './ParentProfile';
import { ParentBackup } from './ParentBackup';

interface PinRecord {
  salt: string;
  hash: string;
}

async function hashPin(pin: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(`${salt}:${pin}`);
  if (crypto?.subtle) {
    const buf = await crypto.subtle.digest('SHA-256', data);
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  let h = 0;
  for (const b of data) h = (h * 31 + b) >>> 0;
  return String(h);
}

let unlockedThisVisit = false;

export function PinGate({ onOk }: { onOk: () => void }) {
  const [stored, setStored] = useState<PinRecord | null | undefined>(undefined);
  const [pin, setPin] = useState('');
  const [pin2, setPin2] = useState('');
  const [error, setError] = useState('');
  useEffect(() => {
    void getMeta<PinRecord>('parentPin').then((v) => setStored(v ?? null));
  }, []);
  if (stored === undefined) return <Loading />;
  const creating = stored === null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!/^\d{4}$/.test(pin)) return setError('Le code doit contenir 4 chiffres.');
    if (creating) {
      if (pin !== pin2) return setError('Les deux codes ne sont pas identiques.');
      const salt = Math.random().toString(36).slice(2, 10);
      await setMeta('parentPin', { salt, hash: await hashPin(pin, salt) });
      onOk();
    } else if ((await hashPin(pin, stored.salt)) === stored.hash) onOk();
    else {
      setError('Code incorrect.');
      setPin('');
    }
  };

  return (
    <main id="main" className="page">
      <div className="container" style={{ maxWidth: 520 }}>
        <Link to="/" className="btn btn-ghost btn-sm" style={{ marginBottom: 16 }}>
          <ArrowLeft size={18} /> Accueil
        </Link>
        <form className="card stack" onSubmit={(e) => void submit(e)}>
          <h1 className="row" style={{ margin: 0 }}>
            <ShieldCheck /> Espace parent
          </h1>
          <p className="muted" style={{ margin: 0 }}>
            {creating ? 'Choisissez un code à 4 chiffres pour réserver cet espace aux adultes. Il s’agit d’une simple barrière, pas d’une sécurité forte.' : 'Saisissez le code parent.'}
          </p>
          <div className="field">
            <label htmlFor="pin">Code (4 chiffres)</label>
            <input id="pin" className="input" type="password" inputMode="numeric" maxLength={4} autoComplete="off" autoFocus value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} />
          </div>
          {creating && (
            <div className="field">
              <label htmlFor="pin2">Confirmez le code</label>
              <input id="pin2" className="input" type="password" inputMode="numeric" maxLength={4} autoComplete="off" value={pin2} onChange={(e) => setPin2(e.target.value.replace(/\D/g, ''))} />
            </div>
          )}
          {error && (
            <p className="feedback feedback-ko" role="alert" style={{ margin: 0 }}>
              {error}
            </p>
          )}
          <button className="btn btn-primary btn-lg" type="submit">
            {creating ? 'Créer le code et entrer' : 'Entrer'}
          </button>
          {!creating && <p className="kbd-hint" style={{ margin: 0 }}>Code oublié ? Il peut être réinitialisé en effaçant les données du site dans le navigateur (attention : cela efface aussi la progression — exportez d’abord une sauvegarde depuis un autre accès si possible).</p>}
        </form>
      </div>
    </main>
  );
}

export async function changePin(pin: string) {
  const salt = Math.random().toString(36).slice(2, 10);
  await setMeta('parentPin', { salt, hash: await hashPin(pin, salt) });
}

export default function ParentArea() {
  const [ok, setOk] = useState(unlockedThisVisit);
  if (!ok)
    return (
      <PinGate
        onOk={() => {
          unlockedThisVisit = true;
          setOk(true);
        }}
      />
    );
  return (
    <>
      <header className="topbar">
        <div className="container topbar-inner">
          <Link to="/" className="brand">
            <ShieldCheck /> Espace parent
          </Link>
          <nav className="nav" aria-label="Espace parent" style={{ marginLeft: 'auto' }}>
            <NavLink to="/parent" end>
              <LayoutDashboard size={18} />
              <span>Tableau de bord</span>
            </NavLink>
            <NavLink to="/parent/sauvegardes">
              <DatabaseBackup size={18} />
              <span>Sauvegardes</span>
            </NavLink>
          </nav>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => {
              unlockedThisVisit = false;
              setOk(false);
            }}
          >
            <LogOut size={18} /> Verrouiller
          </button>
        </div>
      </header>
      <main id="main" className="page">
        <div className="container">
          <Routes>
            <Route index element={<ParentOverview />} />
            <Route path="profil/:profileId/*" element={<ParentProfile />} />
            <Route path="sauvegardes" element={<ParentBackup />} />
          </Routes>
        </div>
      </main>
    </>
  );
}
