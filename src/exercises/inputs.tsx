/**
 * Zones de réponse pour chaque type d'exercice. Chacune produit une `Response`
 * (ou null tant que la réponse est incomplète). Toutes sont utilisables à la souris,
 * au clavier et au toucher ; le glisser-déposer a toujours une alternative par clic.
 */
import { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Volume2, Snail, X } from 'lucide-react';
import type { Exercise } from '@/curriculum/types';
import { speak } from '@/audio/audio';
import { computeColumn, parseNumber, type Response } from './check';
import { GeoMap } from './GeoMap';
import { PictureCard, VisualView } from './Visuals';
import { shuffle } from '@/utils/rng';

export interface InputProps<T extends Exercise['type']> {
  ex: Extract<Exercise, { type: T }>;
  onChange: (r: Response | null) => void;
  locked: boolean;
  /** Après correction : afficher la solution. */
  reveal: boolean;
  /** Réponse précédemment choisie (pour marquer juste/faux). */
  value: Response | null;
}

const KEYS = ['A', 'B', 'C', 'D', 'E', 'F'];

export function ChoiceInput({ ex, onChange, locked, reveal, value }: InputProps<'mcq' | 'listen'>) {
  const selected = value?.kind === 'choice' ? value.index : -1;
  useEffect(() => {
    if (locked) return;
    const h = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return;
      const i = ['1', '2', '3', '4', '5', '6'].indexOf(e.key);
      const j = ['a', 'b', 'c', 'd', 'e', 'f'].indexOf(e.key.toLowerCase());
      const k = i >= 0 ? i : j;
      if (k >= 0 && k < ex.choices.length) onChange({ kind: 'choice', index: k });
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [ex, locked, onChange]);
  const visuals = ex.choiceVisuals;
  return (
    <div className="choices" role="group" aria-label="Choix de réponses">
      {ex.choices.map((c, i) => {
        const cls = reveal ? (i === ex.answer ? 'is-correct' : i === selected ? 'is-wrong' : '') : '';
        const v = visuals?.[i];
        return (
          <button key={i} type="button" className={`choice ${v ? 'choice-visual' : ''} ${cls}`} aria-pressed={selected === i} disabled={locked} onClick={() => onChange({ kind: 'choice', index: i })}>
            {!v && <span className="key">{KEYS[i]}</span>}
            {v && <VisualView v={v} />}
            <span>{c}</span>
          </button>
        );
      })}
    </div>
  );
}

export function TrueFalseInput({ ex, onChange, locked, reveal, value }: InputProps<'truefalse'>) {
  const sel = value?.kind === 'bool' ? value.value : null;
  return (
    <div className="choices" style={{ gridTemplateColumns: '1fr 1fr' }}>
      {[true, false].map((b) => (
        <button
          key={String(b)}
          type="button"
          className={`choice ${reveal ? (b === ex.answer ? 'is-correct' : b === sel ? 'is-wrong' : '') : ''}`}
          aria-pressed={sel === b}
          disabled={locked}
          onClick={() => onChange({ kind: 'bool', value: b })}
          style={{ justifyContent: 'center', fontSize: 'var(--fs-l)' }}
        >
          {b ? 'Vrai' : 'Faux'}
        </button>
      ))}
    </div>
  );
}

export function NumberInput({ ex, onChange, locked }: InputProps<'numeric'>) {
  const [raw, setRaw] = useState('');
  useEffect(() => setRaw(''), [ex.id]);
  return (
    <div className="row">
      <label className="sr-only" htmlFor={`n-${ex.id}`}>
        Ta réponse
      </label>
      <input
        id={`n-${ex.id}`}
        className="input"
        style={{ maxWidth: 260, textAlign: 'center', fontSize: 'var(--fs-xl)' }}
        inputMode="decimal"
        autoComplete="off"
        autoFocus
        disabled={locked}
        value={raw}
        placeholder="?"
        onChange={(e) => {
          setRaw(e.target.value);
          const n = parseNumber(e.target.value);
          onChange(e.target.value.trim() ? { kind: 'number', value: n } : null);
        }}
      />
      {ex.unit && <strong style={{ fontSize: 'var(--fs-l)' }}>{ex.unit}</strong>}
      {ex.decimals && <span className="kbd-hint">Utilise une virgule : 3,5</span>}
    </div>
  );
}

const SPECIAL = ['é', 'è', 'ê', 'à', 'â', 'ç', 'ù', 'û', 'î', 'ô', 'ë', 'ï', '’'];

export function TextInput({ ex, onChange, locked }: InputProps<'text' | 'dictation'>) {
  const [raw, setRaw] = useState('');
  useEffect(() => setRaw(''), [ex.id]);
  const isEnglish = ex.type === 'text' && ex.strictAccents === false;
  const set = (v: string) => {
    setRaw(v);
    onChange(v.trim() ? { kind: 'text', value: v } : null);
  };
  return (
    <div className="stack">
      {ex.type === 'dictation' && <ListenButtons text={ex.say} lang="fr" />}
      <label className="sr-only" htmlFor={`t-${ex.id}`}>
        Ta réponse écrite
      </label>
      {ex.type === 'dictation' ? (
        <textarea id={`t-${ex.id}`} className="input" rows={2} spellCheck={false} autoComplete="off" disabled={locked} value={raw} onChange={(e) => set(e.target.value)} placeholder="Écris la phrase ici…" style={{ resize: 'vertical' }} />
      ) : (
        <input id={`t-${ex.id}`} className="input" spellCheck={false} autoComplete="off" autoCapitalize="off" autoFocus disabled={locked} value={raw} onChange={(e) => set(e.target.value)} placeholder={ex.type === 'text' ? ex.placeholder ?? 'Écris ta réponse…' : ''} />
      )}
      {!isEnglish && (
        <div className="row" style={{ gap: 6 }} aria-label="Lettres accentuées">
          {SPECIAL.map((c) => (
            <button key={c} type="button" className="btn btn-sm btn-ghost" disabled={locked} onClick={() => set(raw + c)} aria-label={`Ajouter ${c}`}>
              {c}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function ListenButtons({ text, lang }: { text: string; lang: 'en' | 'fr' }) {
  const [status, setStatus] = useState<'idle' | 'none'>('idle');
  const play = async (slow: boolean) => {
    const r = await speak(text, lang, { slow });
    setStatus(r === 'none' ? 'none' : 'idle');
  };
  useEffect(() => {
    void play(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);
  return (
    <div className="row">
      <button type="button" className="btn btn-primary btn-lg pulse" onClick={() => void play(false)}>
        <Volume2 /> Écouter
      </button>
      <button type="button" className="btn btn-ghost" onClick={() => void play(true)}>
        <Snail size={20} /> Plus lentement
      </button>
      {status === 'none' && (
        <p className="feedback feedback-info" style={{ margin: 0 }}>
          Le son n’est pas disponible sur cet appareil. Texte : « {text} »
        </p>
      )}
    </div>
  );
}

export function MatchInput({ ex, onChange, locked, reveal }: InputProps<'match'>) {
  const lefts = useMemo(() => ex.pairs.map((p) => p[0]), [ex]);
  const rights = useMemo(() => shuffle(ex.pairs.map((p) => p[1])), [ex]);
  const [pairs, setPairs] = useState<Record<string, string>>({});
  const [pick, setPick] = useState<string | null>(null);
  useEffect(() => {
    setPairs({});
    setPick(null);
  }, [ex.id]);
  const palette = ['#7c6cff', '#f08a5d', '#2fbfa9', '#e0b43c', '#d65a8c', '#3d8fe0'];
  const colorOf = (left: string) => palette[lefts.indexOf(left) % palette.length];
  const choose = (right: string) => {
    if (!pick || locked) return;
    const next = Object.fromEntries(Object.entries(pairs).filter(([l, r]) => l !== pick && r !== right));
    next[pick] = right;
    setPairs(next);
    setPick(null);
    onChange(Object.keys(next).length === lefts.length ? { kind: 'pairs', value: next } : null);
  };
  const correctOf = Object.fromEntries(ex.pairs);
  return (
    <div className="grid-2" style={{ alignItems: 'start' }}>
      <div className="stack" role="group" aria-label="Colonne de gauche : choisis un élément">
        {lefts.map((l) => (
          <button key={l} type="button" className={`choice ${pick === l ? 'is-selected' : ''}`} aria-pressed={pick === l} disabled={locked} onClick={() => setPick(l)} style={pairs[l] ? { borderColor: colorOf(l), boxShadow: `inset 6px 0 0 ${colorOf(l)}` } : pick === l ? { borderColor: 'var(--accent)' } : undefined}>
            {l}
            {pairs[l] && <span className="muted" style={{ marginLeft: 'auto' }}>→ {pairs[l]}</span>}
            {reveal && <span style={{ marginLeft: 8 }}>{pairs[l] === correctOf[l] ? '✔' : `✘ ${correctOf[l]}`}</span>}
          </button>
        ))}
      </div>
      <div className="stack" role="group" aria-label="Colonne de droite : associe">
        {rights.map((r) => {
          const owner = Object.entries(pairs).find(([, v]) => v === r)?.[0];
          return (
            <button key={r} type="button" className="choice" disabled={locked || !pick} onClick={() => choose(r)} style={owner ? { borderColor: colorOf(owner), boxShadow: `inset -6px 0 0 ${colorOf(owner)}` } : undefined}>
              {r}
            </button>
          );
        })}
        <span className="kbd-hint">Clique d’abord à gauche, puis sur sa paire à droite.</span>
      </div>
    </div>
  );
}

export function OrderInput({ ex, onChange, locked, reveal }: InputProps<'order'>) {
  const initial = useMemo(() => {
    let s = shuffle(ex.items);
    let guard = 0;
    while (s.every((v, i) => v === ex.items[i]) && guard++ < 10) s = shuffle(ex.items);
    return s;
  }, [ex]);
  const [pool, setPool] = useState<string[]>(initial);
  const [line, setLine] = useState<string[]>([]);
  const [drag, setDrag] = useState<{ from: 'pool' | 'line'; idx: number } | null>(null);
  const [over, setOver] = useState(false);
  useEffect(() => {
    setPool(initial);
    setLine([]);
  }, [initial]);
  const emit = (l: string[], p: string[]) => onChange(p.length === 0 ? { kind: 'sequence', value: l } : null);
  const toLine = (i: number) => {
    if (locked) return;
    const item = pool[i]!;
    const l = [...line, item];
    const p = pool.filter((_, k) => k !== i);
    setLine(l);
    setPool(p);
    emit(l, p);
  };
  const toPool = (i: number) => {
    if (locked) return;
    const item = line[i]!;
    const l = line.filter((_, k) => k !== i);
    const p = [...pool, item];
    setLine(l);
    setPool(p);
    emit(l, p);
  };
  const move = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= line.length || locked) return;
    const l = [...line];
    [l[i], l[j]] = [l[j]!, l[i]!];
    setLine(l);
    emit(l, pool);
  };
  const dropOnLine = (at: number | null) => {
    if (!drag || locked) return;
    if (drag.from === 'pool') {
      const item = pool[drag.idx]!;
      const p = pool.filter((_, k) => k !== drag.idx);
      const l = [...line];
      l.splice(at ?? l.length, 0, item);
      setLine(l);
      setPool(p);
      emit(l, p);
    } else {
      const l = [...line];
      const [item] = l.splice(drag.idx, 1);
      l.splice(at ?? l.length, 0, item!);
      setLine(l);
      emit(l, pool);
    }
    setDrag(null);
    setOver(false);
  };
  const vertical = ex.mode !== 'sentence' && ex.mode !== 'number';
  const hint = ex.mode === 'timeline' ? 'Du plus ancien (en haut) au plus récent (en bas).' : ex.mode === 'number' ? 'Du plus petit au plus grand.' : ex.mode === 'sentence' ? 'Clique sur les mots dans l’ordre.' : 'Dans l’ordre, du premier au dernier.';
  return (
    <div className="stack">
      <div
        className={`dropzone ${over ? 'is-over' : ''}`}
        style={vertical ? { flexDirection: 'column', alignItems: 'stretch' } : undefined}
        aria-label="Ta réponse, dans l’ordre"
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={() => dropOnLine(null)}
      >
        {line.length === 0 && <span className="muted">{hint}</span>}
        {line.map((t, i) => (
          <span
            key={t}
            className="token"
            draggable={!locked}
            onDragStart={() => setDrag({ from: 'line', idx: i })}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.stopPropagation();
              dropOnLine(i);
            }}
            style={reveal ? { borderColor: ex.items[i] === t ? 'var(--success)' : 'var(--danger)' } : undefined}
          >
            {vertical && <strong className="muted">{i + 1}.</strong>}
            <span style={{ flex: 1 }}>{t}</span>
            {!locked && vertical && (
              <>
                <button type="button" className="btn btn-sm btn-ghost btn-icon" aria-label={`Monter ${t}`} onClick={() => move(i, -1)}>
                  <ArrowUp size={16} />
                </button>
                <button type="button" className="btn btn-sm btn-ghost btn-icon" aria-label={`Descendre ${t}`} onClick={() => move(i, 1)}>
                  <ArrowDown size={16} />
                </button>
              </>
            )}
            {!locked && (
              <button type="button" className="btn btn-sm btn-ghost btn-icon" aria-label={`Retirer ${t}`} onClick={() => toPool(i)}>
                <X size={16} />
              </button>
            )}
          </span>
        ))}
      </div>
      <div className="row" role="group" aria-label="Éléments à placer">
        {pool.map((t, i) => (
          <button key={t} type="button" className="token" draggable={!locked} onDragStart={() => setDrag({ from: 'pool', idx: i })} disabled={locked} onClick={() => toLine(i)}>
            {t}
          </button>
        ))}
      </div>
      {reveal && <div className="feedback feedback-info">Ordre attendu : {ex.mode === 'sentence' ? ex.items.join(' ') : ex.items.join(' → ')}</div>}
    </div>
  );
}

export function CategorizeInput({ ex, onChange, locked, reveal }: InputProps<'categorize'>) {
  const order = useMemo(() => shuffle(ex.items.map((i) => i.label)), [ex]);
  const [place, setPlace] = useState<Record<string, number>>({});
  const [pick, setPick] = useState<string | null>(null);
  const [overCat, setOverCat] = useState<number | null>(null);
  useEffect(() => {
    setPlace({});
    setPick(null);
  }, [ex.id]);
  const put = (label: string, cat: number) => {
    if (locked) return;
    const next = { ...place, [label]: cat };
    setPlace(next);
    setPick(null);
    onChange(Object.keys(next).length === ex.items.length ? { kind: 'buckets', value: next } : null);
  };
  const remove = (label: string) => {
    if (locked) return;
    const next = { ...place };
    delete next[label];
    setPlace(next);
    onChange(null);
  };
  const truth = Object.fromEntries(ex.items.map((i) => [i.label, i.cat]));
  const unplaced = order.filter((l) => place[l] === undefined);
  return (
    <div className="stack">
      <div className="row" role="group" aria-label="Éléments à ranger">
        {unplaced.map((l) => (
          <button key={l} type="button" className={`token ${pick === l ? 'is-selected' : ''}`} draggable={!locked} onDragStart={() => setPick(l)} aria-pressed={pick === l} disabled={locked} onClick={() => setPick(pick === l ? null : l)}>
            {l}
          </button>
        ))}
        {unplaced.length === 0 && !locked && <span className="muted">Tout est rangé : vérifie puis valide.</span>}
      </div>
      <div className="grid-3">
        {ex.categories.map((c, ci) => (
          <div
            key={c}
            className={`dropzone ${overCat === ci ? 'is-over' : ''}`}
            style={{ flexDirection: 'column', alignItems: 'stretch', minHeight: 140 }}
            onDragOver={(e) => {
              e.preventDefault();
              setOverCat(ci);
            }}
            onDragLeave={() => setOverCat(null)}
            onDrop={() => {
              if (pick) put(pick, ci);
              setOverCat(null);
            }}
          >
            <button type="button" className="btn btn-sm" disabled={locked || !pick} onClick={() => pick && put(pick, ci)} style={{ alignSelf: 'stretch' }}>
              {c}
            </button>
            {Object.entries(place)
              .filter(([, v]) => v === ci)
              .map(([l]) => (
                <span key={l} className="token" style={reveal ? { borderColor: truth[l] === ci ? 'var(--success)' : 'var(--danger)' } : undefined}>
                  <span style={{ flex: 1 }}>{l}</span>
                  {reveal && truth[l] !== ci && <small className="muted">→ {ex.categories[truth[l] ?? 0]}</small>}
                  {!locked && (
                    <button type="button" className="btn btn-sm btn-ghost btn-icon" aria-label={`Retirer ${l}`} onClick={() => remove(l)}>
                      <X size={14} />
                    </button>
                  )}
                </span>
              ))}
          </div>
        ))}
      </div>
      <span className="kbd-hint">Choisis un élément puis clique sur le titre de sa catégorie (ou fais-le glisser).</span>
    </div>
  );
}

/** Opération posée interactive : saisie chiffre par chiffre, de droite à gauche, retenues facultatives. */
export function ColumnInput({ ex, onChange, locked, reveal }: InputProps<'column'>) {
  const result = computeColumn(ex.op, ex.a, ex.b);
  const width = Math.max(String(ex.a).length, String(ex.b).length + 1, String(result).length);
  const [digits, setDigits] = useState<string[]>(Array(width).fill(''));
  const [carries, setCarries] = useState<string[]>(Array(width).fill(''));
  const partialLines = ex.op === '×' && ex.b >= 10 ? String(ex.b).length : 0;
  const [partials, setPartials] = useState<string[][]>(Array.from({ length: partialLines }, () => Array(width).fill('')));
  useEffect(() => {
    setDigits(Array(width).fill(''));
    setCarries(Array(width).fill(''));
    setPartials(Array.from({ length: partialLines }, () => Array(width).fill('')));
  }, [ex.id, width, partialLines]);
  const pad = (n: number) => String(n).padStart(width, ' ').split('');
  const cell = { width: 46, height: 52, textAlign: 'center' as const, fontFamily: 'var(--font-mono)', fontSize: 28, fontWeight: 800, padding: 0 };
  const focusCell = (prefix: string, i: number) => document.getElementById(`${prefix}-${ex.id}-${i}`)?.focus();
  const setDigit = (i: number, v: string) => {
    const d = v.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[i] = d;
    setDigits(next);
    const s = next.join('').trim();
    onChange(s ? { kind: 'number', value: Number(next.map((x) => x || '0').join('')) } : null);
    if (d && i > 0) focusCell('r', i - 1);
  };
  return (
    <div className="stack" style={{ alignItems: 'flex-start' }}>
      <div className="card-flat" style={{ display: 'inline-block', fontFamily: 'var(--font-mono)' }} role="group" aria-label={`Opération posée : ${ex.a} ${ex.op} ${ex.b}`}>
        <div className="row" style={{ gap: 4, flexWrap: 'nowrap' }} aria-label="Retenues (facultatif)">
          <span style={{ width: 30 }} />
          {carries.map((c, i) => (
            <input key={i} aria-label={`Retenue colonne ${width - i}`} className="input" style={{ ...cell, height: 30, fontSize: 16, width: 46, minHeight: 0, color: 'var(--danger)' }} value={c} disabled={locked} inputMode="numeric" onChange={(e) => setCarries(carries.map((x, k) => (k === i ? e.target.value.replace(/\D/g, '').slice(-1) : x)))} />
          ))}
        </div>
        {[pad(ex.a), pad(ex.b)].map((row, r) => (
          <div key={r} className="row" style={{ gap: 4, flexWrap: 'nowrap' }}>
            <span style={{ width: 30, fontSize: 28, fontWeight: 900 }}>{r === 1 ? ex.op : ''}</span>
            {row.map((d, i) => (
              <span key={i} style={{ ...cell, display: 'inline-grid', placeItems: 'center' }}>
                {d}
              </span>
            ))}
          </div>
        ))}
        <div style={{ borderTop: '4px solid var(--ink)', margin: '4px 0 8px 34px' }} />
        {partials.map((line, li) => (
          <div key={li} className="row" style={{ gap: 4, flexWrap: 'nowrap', marginBottom: 4 }}>
            <span style={{ width: 30, fontSize: 14 }} className="muted">
              {li === 0 ? 'brouillon' : ''}
            </span>
            {line.map((c, i) => (
              <input key={i} aria-label={`Ligne intermédiaire ${li + 1}, colonne ${width - i}`} className="input" style={{ ...cell, fontSize: 20, height: 40, minHeight: 0 }} value={c} disabled={locked} inputMode="numeric" onChange={(e) => setPartials(partials.map((l, a) => (a === li ? l.map((x, b) => (b === i ? e.target.value.replace(/\D/g, '').slice(-1) : x)) : l)))} />
            ))}
          </div>
        ))}
        {partialLines > 0 && <div style={{ borderTop: '2px dashed var(--ink-soft)', margin: '4px 0 8px 34px' }} />}
        <div className="row" style={{ gap: 4, flexWrap: 'nowrap' }}>
          <span style={{ width: 30, fontSize: 28, fontWeight: 900 }}>=</span>
          {digits.map((d, i) => (
            <input
              key={i}
              id={`r-${ex.id}-${i}`}
              aria-label={`Résultat, chiffre de la colonne ${width - i} (en partant de la droite)`}
              className="input"
              style={{ ...cell, minHeight: 0 }}
              inputMode="numeric"
              autoComplete="off"
              autoFocus={i === width - 1}
              value={d}
              disabled={locked}
              onChange={(e) => setDigit(i, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Backspace' && !digits[i] && i < width - 1) focusCell('r', i + 1);
                if (e.key === 'ArrowLeft' && i > 0) focusCell('r', i - 1);
                if (e.key === 'ArrowRight' && i < width - 1) focusCell('r', i + 1);
              }}
            />
          ))}
        </div>
      </div>
      <span className="kbd-hint">Commence par la case de droite (les unités). Les retenues et le brouillon ne sont pas notés.</span>
      {reveal && <div className="feedback feedback-info">Résultat : {result.toLocaleString('fr-FR')}</div>}
    </div>
  );
}

export function FractionBuildInput({ ex, onChange, locked, reveal }: InputProps<'fraction-build'>) {
  const [on, setOn] = useState<boolean[]>(Array(ex.den).fill(false));
  useEffect(() => setOn(Array(ex.den).fill(false)), [ex.id, ex.den]);
  const toggle = (i: number) => {
    if (locked) return;
    const n = on.map((v, k) => (k === i ? !v : v));
    setOn(n);
    onChange({ kind: 'number', value: n.filter(Boolean).length });
  };
  const count = on.filter(Boolean).length;
  return (
    <div className="stack">
      <div role="group" aria-label={`Bande partagée en ${ex.den} parts`} style={{ display: 'grid', gridTemplateColumns: `repeat(${ex.den}, 1fr)`, maxWidth: 560, border: '3px solid var(--ink)', borderRadius: 12, overflow: 'hidden' }}>
        {on.map((v, i) => (
          <button key={i} type="button" aria-pressed={v} aria-label={`Part ${i + 1}`} disabled={locked} onClick={() => toggle(i)} style={{ height: 72, border: 0, borderRight: i < ex.den - 1 ? '2px solid var(--ink)' : 0, background: v ? 'var(--accent)' : 'var(--surface)', cursor: 'pointer' }} />
        ))}
      </div>
      <strong>
        Parts coloriées : {count} / {ex.den}
      </strong>
      {reveal && <div className="feedback feedback-info">Il fallait colorier {ex.num} parts sur {ex.den}.</div>}
    </div>
  );
}

export function MapInput({ ex, onChange, locked, reveal, value }: InputProps<'map'>) {
  const sel = value?.kind === 'id' ? value.value : null;
  return <GeoMap mapId={ex.mapId} selected={sel} reveal={reveal ? ex.target : null} disabled={locked} onPick={(n) => onChange({ kind: 'id', value: n })} />;
}

export function SpotInput({ ex, onChange, locked, reveal, value }: InputProps<'spot'>) {
  const sel = value?.kind === 'choice' ? value.index : -1;
  return (
    <div className="stack">
      <div className="row" style={{ gap: 8, fontSize: 'var(--fs-l)' }} role="group" aria-label="Mots de la phrase">
        {ex.words.map((w, i) => (
          <button key={i} type="button" className={`token ${sel === i ? 'is-selected' : ''}`} aria-pressed={sel === i} disabled={locked} onClick={() => onChange({ kind: 'choice', index: i })} style={reveal && i === ex.wrong ? { borderColor: 'var(--success)', background: 'var(--success-bg)' } : undefined}>
            {w}
          </button>
        ))}
      </div>
      {reveal && (
        <div className="feedback feedback-info">
          Le mot fautif était « {ex.words[ex.wrong]} » : il fallait écrire « {ex.correction} ».
        </div>
      )}
    </div>
  );
}

export function ListenInput(props: InputProps<'listen'>) {
  return (
    <div className="stack">
      <ListenButtons text={props.ex.say} lang={props.ex.skillId.includes('-en-') ? 'en' : 'fr'} />
      <ChoiceInput {...props} />
    </div>
  );
}

export { PictureCard };
