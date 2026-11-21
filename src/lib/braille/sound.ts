/**
 * Kurzer Fehlerton für den Braille-Trainer — per Web Audio erzeugt, ohne
 * Audiodatei. Bei jeder falsch getippten Zelle erklingt ein dezenter, tiefer
 * Ton als zusätzliche Rückmeldung zur roten Färbung.
 *
 * Stummschaltbar (in localStorage gemerkt), denn in einer ruhigen Klasse kann
 * der Ton stören. Die rote Markierung bleibt davon unberührt — der Ton ist nur
 * eine Beigabe, keine alleinige Fehler-Rückmeldung (Barrierefreiheit).
 */

import { create } from "zustand";
import { keepAudioAlive } from "@/lib/audioUnlock";

const MUTE_KEY = "braille-sound-muted";
const LAUT_KEY = "braille-sound-laut";

let muted = readMuted();
let laut = readLaut();
let ctx: AudioContext | null = null;

function readLaut(): number {
  try {
    const roh = localStorage.getItem(LAUT_KEY);
    const n = roh === null ? NaN : Number(roh);
    return Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : 1;
  } catch {
    return 1;
  }
}

/**
 * ★ EIN Zustand für „Töne an/aus" und ihre Lautstärke (17.10.2026). Bis dahin
 * merkten sich Punktgenau und Klangpunkte „an/aus" je in einem eigenen
 * `useState` - ein Menü in der Kopfzeile hätte daneben eine zweite Wahrheit
 * gehabt. Jetzt lesen alle Stellen hier; `setSoundMuted` hält ihn aktuell.
 */
export const useBrailleTon = create<{ muted: boolean; laut: number }>(() => ({ muted, laut }));

function readMuted(): boolean {
  try {
    return localStorage.getItem(MUTE_KEY) === "1";
  } catch {
    return false;
  }
}

export function isSoundMuted(): boolean {
  return muted;
}

/** Lautstärke der Töne, 0 bis 1. 1 ist die bisherige Lautstärke; 0 heißt kein Ton. */
export function tonLautstaerke(): number {
  return laut;
}

export function setTonLautstaerke(value: number): void {
  laut = Math.min(1, Math.max(0, value));
  useBrailleTon.setState({ laut });
  try {
    localStorage.setItem(LAUT_KEY, String(laut));
  } catch {
    /* localStorage nicht verfügbar — egal */
  }
}

/** Der Gipfel eines Tons bei der gewählten Lautstärke - nie 0, das kann `exponentialRamp` nicht. */
export function tonGipfel(voll: number): number {
  return Math.max(0.0002, voll * laut);
}

export function setSoundMuted(value: boolean): void {
  muted = value;
  useBrailleTon.setState({ muted });
  try {
    localStorage.setItem(MUTE_KEY, value ? "1" : "0");
  } catch {
    /* localStorage nicht verfügbar — egal */
  }
}

function audioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    const AC =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AC) return null;
    if (!ctx) ctx = new AC();
    keepAudioAlive(ctx); // iOS: Gesten-Entsperrung + Lautlos-Schalter-Trick
    return ctx;
  } catch {
    return null;
  }
}

/**
 * Kurzer, tiefer Fehlerton (leicht absteigend → klingt nach „uh-oh").
 * Tut nichts, wenn stummgeschaltet oder kein Audio verfügbar ist.
 */
export function playErrorSound(): void {
  if (muted || laut <= 0) return;
  const ac = audioContext();
  if (!ac) return;
  try {
    // Der erste Ton nach dem Laden braucht ggf. ein resume() (Autoplay-Politik);
    // die Tasten-Eingabe davor zählt als Nutzergeste.
    if (ac.state === "suspended") void ac.resume();
    const now = ac.currentTime;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(196, now);
    osc.frequency.exponentialRampToValueAtTime(147, now + 0.18);
    // Sanftes Ein-/Ausblenden gegen Knackser — deutlich hörbar.
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(tonGipfel(0.22), now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
    osc.connect(gain).connect(ac.destination);
    osc.start(now);
    osc.stop(now + 0.24);
  } catch {
    /* Audio fehlgeschlagen — unkritisch */
  }
}
