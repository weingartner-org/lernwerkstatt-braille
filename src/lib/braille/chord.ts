/**
 * Akkord-Eingabe (Perkins-Stil): Mehrere Punkt-Tasten werden gleichzeitig
 * gedrückt; sobald ALLE wieder losgelassen sind, ist eine Zelle fertig.
 *
 * Diese Datei enthält die reine, testbare Logik (ohne React). Der React-Hook
 * `useBrailleChord` setzt dieselbe down/acc-Mechanik für echte Tastatur-Events
 * ein.
 */
import { Cell, KEY_TO_DOT, dots as dotsToCell } from "./cell";

/** `t` = Zeitpunkt in ms (nur für die Nachfrist nötig). */
export type ChordEvent = { type: "down" | "up"; code: string; t?: number };

/**
 * Nachfrist (ms) für Punktgenau: Sind alle Tasten los, wartet die Zelle noch so
 * lange. Kommt in dieser Zeit eine Punkt-Taste dazu, gehört sie zur SELBEN
 * Zelle. So zählt auch ein Akkord, dessen Tasten nicht ganz gleichzeitig
 * gedrückt wurden (Johannes 07.10.2026: „sei ein bisschen milder").
 */
export const CHORD_NACHLAUF_MS = 120;

/**
 * Anschlag-Fenster (ms) für Punktgenau: Alle Tasten EINER Zelle müssen
 * innerhalb dieser Zeit nach der ersten gedrückt sein. Eine spätere Taste
 * beginnt eine neue Zelle - wer die Tasten gemächlich nacheinander drückt und
 * festhält, bekommt keine richtige Zelle mehr (Johannes 07.10.2026: „jetzt
 * kann man die tasten einfach hintereinander runterdrücken und sie werden als
 * richtig gewertet, egal wieviel zeit dazwischen ist").
 */
export const CHORD_FENSTER_MS = 200;

/** Gehört dieser KeyboardEvent.code zur Akkord-Eingabe (im aktuellen System)? */
export function isDotKey(code: string, eightDot: boolean): boolean {
  const dot: number | undefined = KEY_TO_DOT[code];
  if (dot === undefined) return false;
  if (!eightDot && (dot === 7 || dot === 8)) return false; // a/ö nur 8 Punkt
  return true;
}

/**
 * Reine Akkord-Logik: eine Folge von Tasten-Events → die committeten Zellen.
 * Eine Zelle wird committet, wenn alle gedrückten Punkt-Tasten losgelassen
 * wurden (auch bei rollendem Loslassen). Grundlage für die Unit-Tests.
 */
export function chordCells(
  events: readonly ChordEvent[],
  eightDot = false,
  nachlaufMs = 0,
  /** 0 = ohne Grenze (Klangpunkte, Plus). */
  fensterMs = 0,
): Cell[] {
  const down = new Set<string>();
  const acc = new Set<number>();
  const out: Cell[] = [];
  /** Zeitpunkt, an dem zuletzt alle Tasten los waren (Zelle wartet). */
  let losSeit: number | null = null;
  /** Erste Taste der Zelle, die gerade entsteht. */
  let beginn: number | null = null;
  const flush = () => {
    if (acc.size > 0) out.push(dotsToCell(...acc));
    acc.clear();
    losSeit = null;
    beginn = null;
  };
  for (const ev of events) {
    if (!isDotKey(ev.code, eightDot)) continue;
    const dot = KEY_TO_DOT[ev.code];
    if (ev.type === "down") {
      const t = ev.t ?? 0;
      if (losSeit !== null && t - losSeit > nachlaufMs) flush();
      else if (fensterMs > 0 && beginn !== null && t - beginn > fensterMs) flush();
      losSeit = null;
      if (beginn === null) beginn = t;
      down.add(ev.code);
      acc.add(dot);
    } else {
      down.delete(ev.code);
      if (down.size === 0 && acc.size > 0) {
        if (nachlaufMs > 0) losSeit = ev.t ?? 0;
        else flush();
      }
    }
  }
  flush();
  return out;
}
