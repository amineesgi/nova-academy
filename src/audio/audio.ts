/**
 * Audio : fichiers MP3 locaux (générés par scripts/generate-audio.ps1, embarqués et pré-cachés
 * pour le hors-ligne). La synthèse vocale du navigateur n'est qu'un secours.
 */
import { audioKey } from './keys';

export type Lang = 'en' | 'fr';

let current: HTMLAudioElement | null = null;
let manifest: Set<string> | null = null;
let manifestPromise: Promise<Set<string>> | null = null;

async function loadManifest(): Promise<Set<string>> {
  if (manifest) return manifest;
  manifestPromise ??= fetch(`${import.meta.env.BASE_URL}audio/manifest.json`)
    .then((r) => (r.ok ? r.json() : []))
    .then((list: string[]) => (manifest = new Set(list)))
    .catch(() => (manifest = new Set()));
  return manifestPromise;
}

export function stopAudio() {
  if (current) {
    current.pause();
    current = null;
  }
  if ('speechSynthesis' in globalThis) globalThis.speechSynthesis.cancel();
}

function speakFallback(text: string, lang: Lang, slow: boolean): boolean {
  if (!('speechSynthesis' in globalThis)) return false;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang === 'en' ? 'en-GB' : 'fr-FR';
  u.rate = slow ? 0.7 : 0.92;
  const voices = speechSynthesis.getVoices();
  const v = voices.find((x) => x.lang.toLowerCase().startsWith(lang));
  if (v) u.voice = v;
  speechSynthesis.speak(u);
  return true;
}

/**
 * Joue un texte. Renvoie la source utilisée : 'local' (fichier embarqué), 'tts' (synthèse
 * du navigateur) ou 'none' (aucune voix disponible : l'interface affiche alors le texte).
 */
export async function speak(text: string, lang: Lang, opts: { slow?: boolean } = {}): Promise<'local' | 'tts' | 'none'> {
  stopAudio();
  const key = audioKey(lang, text);
  const list = await loadManifest();
  if (list.has(key)) {
    const audio = new Audio(`${import.meta.env.BASE_URL}audio/${key}.mp3`);
    audio.playbackRate = opts.slow ? 0.75 : 1;
    // préserve la hauteur de voix quand on ralentit
    (audio as HTMLAudioElement & { preservesPitch?: boolean }).preservesPitch = true;
    current = audio;
    try {
      await audio.play();
      return 'local';
    } catch {
      /* lecture bloquée : on tente la synthèse */
    }
  }
  return speakFallback(text, lang, !!opts.slow) ? 'tts' : 'none';
}

/** Petits effets sonores synthétisés (aucun fichier) — désactivables dans les réglages. */
export function chime(kind: 'ok' | 'ko' | 'win') {
  try {
    const Ctx = (globalThis.AudioContext ?? (globalThis as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext) as typeof AudioContext | undefined;
    if (!Ctx) return;
    const ctx = new Ctx();
    const notes = kind === 'ok' ? [660, 880] : kind === 'win' ? [523, 659, 784, 1046] : [330, 262];
    notes.forEach((f, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = kind === 'ko' ? 'triangle' : 'sine';
      o.frequency.value = f;
      const t = ctx.currentTime + i * 0.11;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.12, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
      o.connect(g).connect(ctx.destination);
      o.start(t);
      o.stop(t + 0.25);
    });
    setTimeout(() => void ctx.close(), 1200);
  } catch {
    /* audio indisponible */
  }
}
