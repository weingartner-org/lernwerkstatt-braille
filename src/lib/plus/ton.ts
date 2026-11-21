/**
 * Der Ton von Plus - ein kurzer Klang, der etwas bedeutet.
 *
 * ★ Belegt ist: bedeutungstragende Klänge (Earcons) wirken besser als bloße
 * Geräusche. Jeder Ton in Plus steht deshalb für etwas - richtig, fertig,
 * Abzeichen, Stufe geschafft, und im Zahlenstrahl die Höhe einer Zahl.
 *
 * ★ Und jeder lässt sich abschalten. In einer ruhigen Klasse stört er, und er
 * ist nie die einzige Rückmeldung: was der Ton sagt, steht auch da.
 */
import { keepAudioAlive } from "@/lib/audioUnlock";

const SCHLUESSEL = "plus_ton";

let stumm = lies();
let ctx: AudioContext | null = null;

function lies(): boolean {
  try { return localStorage.getItem(SCHLUESSEL) === "aus"; } catch { return false; }
}

export function tonIstStumm(): boolean {
  return stumm;
}

export function setzeTonStumm(wert: boolean): void {
  stumm = wert;
  try { localStorage.setItem(SCHLUESSEL, wert ? "aus" : "an"); } catch { /* egal */ }
}

/*
 * ★ Die Lautstärke der Töne, 0 bis 1 (Johannes, 17.10.2026: Schieberegler im
 * Akustik-Menü). 1 ist die bisherige Lautstärke - lauter wird es nicht, ein
 * Ton soll nie erschrecken. 0 heißt: kein Ton, auch wenn „Töne" an ist.
 */
const SCHLUESSEL_LAUT = "plus_ton_laut";
let laut = liesLaut();

function liesLaut(): number {
  try {
    const roh = localStorage.getItem(SCHLUESSEL_LAUT);
    const n = roh === null ? NaN : Number(roh);
    return Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : 1;
  } catch {
    return 1;
  }
}

export function tonLautstaerke(): number {
  return laut;
}

export function setzeTonLautstaerke(wert: number): void {
  laut = Math.min(1, Math.max(0, wert));
  try { localStorage.setItem(SCHLUESSEL_LAUT, String(laut)); } catch { /* egal */ }
}

/** Der Gipfel eines Tons bei der gewählten Lautstärke - nie 0, das kann `exponentialRamp` nicht. */
function gipfel(voll: number): number {
  return Math.max(0.0002, voll * laut);
}

function kontext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    const AC = window.AudioContext
      ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    if (!ctx) ctx = new AC();
    keepAudioAlive(ctx);
    return ctx;
  } catch {
    return null;
  }
}

/**
 * Ein Ton zu einer Stelle auf dem Zahlenstrahl.
 *
 * @param anteil 0 ist ganz links, 1 ist ganz rechts.
 *
 * Die Tonhöhe steigt von 220 auf 880 Hertz - zwei Oktaven, die ein Kind
 * sicher unterscheidet, und niemand piepst.
 */
export function tonFuerStelle(anteil: number): void {
  if (stumm || laut <= 0) return;
  const ac = kontext();
  if (!ac) return;
  try {
    if (ac.state === "suspended") void ac.resume();
    const jetzt = ac.currentTime;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = "sine";
    const klar = Math.min(1, Math.max(0, anteil));
    osc.frequency.setValueAtTime(220 * 2 ** (2 * klar), jetzt);
    gain.gain.setValueAtTime(0.0001, jetzt);
    gain.gain.exponentialRampToValueAtTime(gipfel(0.12), jetzt + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, jetzt + 0.3);
    osc.connect(gain).connect(ac.destination);
    osc.start(jetzt);
    osc.stop(jetzt + 0.32);
  } catch {
    /* Kein Ton ist besser als ein Absturz. */
  }
}

/**
 * „Richtig" - zwei kurze, steigende Töne (Johannes, 28.09.2026: „Sound wenn
 * richtig gerechnet"). Dieselben wie im eine andere App der Plattform  (`lib/mathecoach/pruefton.ts`):
 * G5, dann D6, rund 0,2 s, leise. Ein Nebenbei, keine Fanfare.
 *
 * ★ Nur zusammen mit dem Wort: wer ihn ruft, sagt und zeigt „Richtig." auch.
 * „Fast richtig" (Schreibfehler) bekommt keinen Ton - richtig ist es nicht.
 */
export function spieleRichtigTon(): void {
  if (stumm || laut <= 0) return;
  const ac = kontext();
  if (!ac) return;
  try {
    if (ac.state === "suspended") void ac.resume();
    for (const [freq, beginn, laenge] of [[784, 0, 0.11], [1175, 0.09, 0.14]]) {
      const t0 = ac.currentTime + beginn;
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, t0);
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(gipfel(0.08), t0 + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + laenge);
      osc.connect(gain).connect(ac.destination);
      osc.start(t0);
      osc.stop(t0 + laenge + 0.02);
    }
  } catch {
    /* Kein Ton ist besser als ein Absturz - das Wort steht ohnehin da. */
  }
}
