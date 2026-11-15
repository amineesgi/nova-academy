/** Composants d'interface communs du design system. */
import { useEffect, useRef, type ReactNode } from 'react';
import { BookOpen, Calculator, Globe2, Landmark, Languages, Leaf, Map as MapIcon, Microscope, Palette, Scale, Star, X } from 'lucide-react';
import type { SubjectId } from '@/curriculum/types';
import { useApp } from '@/app/AppContext';

export function Modal({ title, children, onClose, labelledBy = 'modal-title' }: { title: string; children: ReactNode; onClose?: () => void; labelledBy?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    const first = ref.current?.querySelector<HTMLElement>('button, [href], input, select, textarea');
    first?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) onClose();
      if (e.key === 'Tab' && ref.current) {
        const f = [...ref.current.querySelectorAll<HTMLElement>('button, [href], input, select, textarea')].filter((x) => !x.hasAttribute('disabled'));
        if (f.length === 0) return;
        const a = f[0]!;
        const z = f[f.length - 1]!;
        if (e.shiftKey && document.activeElement === a) {
          e.preventDefault();
          z.focus();
        } else if (!e.shiftKey && document.activeElement === z) {
          e.preventDefault();
          a.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      prev?.focus?.();
    };
  }, [onClose]);
  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby={labelledBy} ref={ref}>
        <div className="row" style={{ alignItems: 'flex-start' }}>
          <h2 id={labelledBy} style={{ flex: 1 }}>
            {title}
          </h2>
          {onClose && (
            <button className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Fermer">
              <X size={20} />
            </button>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}

export function ConfirmModal({ title, text, confirmLabel, danger, onConfirm, onCancel }: { title: string; text: ReactNode; confirmLabel: string; danger?: boolean; onConfirm: () => void; onCancel: () => void }) {
  return (
    <Modal title={title} onClose={onCancel}>
      <div className="stack">
        <div>{text}</div>
        <div className="row" style={{ justifyContent: 'flex-end' }}>
          <button className="btn btn-ghost" onClick={onCancel}>
            Annuler
          </button>
          <button className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export function ToastHost() {
  const { toasts } = useApp();
  return (
    <div className="toasts" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className="toast" style={t.tone === 'reward' ? { borderColor: 'var(--accent)' } : t.tone === 'success' ? { borderColor: 'var(--success)' } : undefined}>
          {t.tone === 'reward' ? <Star size={20} color="var(--accent)" fill="var(--accent)" /> : null}
          <span>{t.text}</span>
        </div>
      ))}
    </div>
  );
}

export function ProgressBar({ value, max = 1, label }: { value: number; max?: number; label: string }) {
  const pct = Math.max(0, Math.min(100, (value / Math.max(max, 1e-9)) * 100));
  return (
    <div className="progress" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct)}>
      <span style={{ width: `${pct}%` }} />
    </div>
  );
}

export function Stars({ count, max = 3, size = 26 }: { count: number; max?: number; size?: number }) {
  return (
    <span className="row" style={{ gap: 4 }} aria-label={`${count} étoile${count > 1 ? 's' : ''} sur ${max}`}>
      {Array.from({ length: max }, (_, i) => (
        <Star key={i} size={size} className={i < count ? 'anim-pop' : ''} style={{ animationDelay: `${i * 160}ms` }} color={i < count ? '#e8a400' : 'var(--line)'} fill={i < count ? '#ffc93c' : 'transparent'} />
      ))}
    </span>
  );
}

const SUBJECT_ICON: Record<SubjectId, typeof BookOpen> = {
  francais: BookOpen,
  maths: Calculator,
  anglais: Languages,
  qlm: Leaf,
  histoire: Landmark,
  geographie: MapIcon,
  sciences: Microscope,
  emc: Scale,
  arts: Palette,
};

export const SUBJECT_COLORS: Record<SubjectId, string> = {
  francais: '#e0703c',
  maths: '#2e9fd8',
  anglais: '#3bb37f',
  qlm: '#8c6ad1',
  histoire: '#b0782f',
  geographie: '#2fa3a0',
  sciences: '#7a62e0',
  emc: '#d9a73a',
  arts: '#d65a8c',
};

export function SubjectBadge({ subject, size = 44 }: { subject: SubjectId; size?: number }) {
  const Icon = SUBJECT_ICON[subject] ?? Globe2;
  return (
    <span aria-hidden="true" style={{ display: 'inline-grid', placeItems: 'center', width: size, height: size, borderRadius: size * 0.32, background: SUBJECT_COLORS[subject], color: '#fff', boxShadow: `0 4px 0 color-mix(in srgb, ${SUBJECT_COLORS[subject]} 70%, #000)`, flex: 'none' }}>
      <Icon size={size * 0.55} strokeWidth={2.4} />
    </span>
  );
}

export function Confetti({ count = 70 }: { count?: number }) {
  const colors = ['#ffc93c', '#ff6b8b', '#4fd6c8', '#7c6cff', '#3bb37f', '#ff9f43'];
  return (
    <div className="confetti" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <i
          key={i}
          style={{
            left: `${(i * 37) % 100}%`,
            background: colors[i % colors.length],
            animationDelay: `${(i % 14) * 70}ms`,
            ['--dx' as string]: `${((i * 53) % 120) - 60}px`,
          }}
        />
      ))}
    </div>
  );
}

export function Loading({ label = 'Chargement…' }: { label?: string }) {
  return (
    <div className="stack center" style={{ alignItems: 'center', padding: 48 }} role="status">
      <div className="spinner" />
      <span className="muted">{label}</span>
    </div>
  );
}
