/**
 * React-Hook für die Akkord-Eingabe (Perkins-Stil). Liefert Event-Handler für
 * ein fokussierbares Element sowie die gerade gedrückten Punkte (Live-Anzeige).
 * Eine Zelle wird committet, sobald alle Punkt-Tasten losgelassen wurden.
 *
 * Reine Logik (Tests) in lib/braille/chord.ts.
 */
import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Cell, KEY_TO_DOT, dots as dotsToCell } from "@/lib/braille";

export interface UseBrailleChordOptions {
  eightDot?: boolean;
  enabled?: boolean;
  /** Eine Zelle fertig (alle Tasten losgelassen). */
  onCommit?: (cell: Cell) => void;
  /** Leertaste — z. B. Wortzwischenraum. */
  onSpace?: () => void;
  /** Rücktaste — letzte Zelle löschen. */
  onBackspace?: () => void;
  /** Eingabetaste — Eingabe prüfen. */
  onEnter?: () => void;
  /**
   * Nachfrist in ms: Sind alle Tasten los, wartet die Zelle so lange auf eine
   * weitere Punkt-Taste, die noch dazugehört. 0 (Vorgabe) = sofort fertig.
   */
  nachlaufMs?: number;
  /**
   * Anschlag-Fenster in ms: Eine Punkt-Taste, die später als das nach der
   * ersten Taste der Zelle kommt, schließt die Zelle ab und beginnt eine neue.
   * 0 (Vorgabe) = ohne Grenze.
   */
  fensterMs?: number;
}

export function useBrailleChord(opts: UseBrailleChordOptions) {
  const ref = useRef(opts);
  ref.current = opts;

  const [pendingDots, setPendingDots] = useState<number[]>([]);
  const down = useRef<Set<string>>(new Set());
  const acc = useRef<Set<number>>(new Set());
  const nachlauf = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** Zeitpunkt der ersten Taste der Zelle, die gerade entsteht. */
  const beginn = useRef<number | null>(null);

  const stopNachlauf = () => {
    if (nachlauf.current !== null) clearTimeout(nachlauf.current);
    nachlauf.current = null;
  };

  /** Die wartende Zelle jetzt abschließen (falls eine wartet). */
  /** Die gesammelten Punkte jetzt als Zelle abschließen - `auchGehalten`:
   *  auch wenn noch Tasten unten sind (Anschlag-Fenster überschritten). */
  const flush = useCallback((auchGehalten = false) => {
    stopNachlauf();
    if ((!auchGehalten && down.current.size > 0) || acc.current.size === 0) return;
    beginn.current = null;
    const cell = dotsToCell(...acc.current);
    acc.current.clear();
    setPendingDots([]);
    if (ref.current.enabled !== false) ref.current.onCommit?.(cell);
  }, []);

  const reset = useCallback(() => {
    stopNachlauf();
    beginn.current = null;
    down.current.clear();
    acc.current.clear();
    setPendingDots([]);
  }, []);

  useEffect(() => stopNachlauf, []);

  const onKeyDown = useCallback((e: KeyboardEvent) => {
    const o = ref.current;
    if (o.enabled === false) return;
    // Modifier-Kombis (Alt+…, Strg+F, Cmd+…) sind Kürzel, keine Punkt-Eingabe —
    // sonst frisst das Feld z. B. Alt+Z als Punkt und wertet eine Fehl-Zelle.
    // NUR beim Drücken guarden: das Loslassen muss immer verarbeitet werden,
    // damit keine Taste „hängen" bleibt, wenn Alt mitten im Akkord dazukommt.
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    const { code } = e;

    // Eine Nicht-Punkt-Taste schließt eine noch wartende Zelle zuerst ab,
    // damit Leertaste/Rücktaste in der richtigen Reihenfolge wirken.
    if (KEY_TO_DOT[code] === undefined) flush();

    if (code === "Space") {
      e.preventDefault();
      o.onSpace?.();
      return;
    }
    if (code === "Backspace") {
      e.preventDefault();
      o.onBackspace?.();
      return;
    }
    if (code === "Enter") {
      e.preventDefault();
      o.onEnter?.();
      return;
    }

    const dot: number | undefined = KEY_TO_DOT[code];
    if (dot === undefined) return;
    if (!o.eightDot && (dot === 7 || dot === 8)) return;
    e.preventDefault();
    if (e.repeat) return;
    const jetzt = Date.now();
    const fenster = o.fensterMs ?? 0;
    if (fenster > 0 && beginn.current !== null && jetzt - beginn.current > fenster) {
      // Zu spät für diese Zelle: sie ist fertig, diese Taste beginnt die nächste.
      flush(true);
    } else stopNachlauf(); // kommt in der Nachfrist: gehört zur selben Zelle
    if (beginn.current === null) beginn.current = jetzt;
    down.current.add(code);
    acc.current.add(dot);
    setPendingDots([...acc.current].sort((a, b) => a - b));
  }, [flush]);

  const onKeyUp = useCallback((e: KeyboardEvent) => {
    const o = ref.current;
    const dot: number | undefined = KEY_TO_DOT[e.code];
    if (dot === undefined) return;
    if (!o.eightDot && (dot === 7 || dot === 8)) return;
    // Loslassen IMMER verarbeiten — auch wenn das Feld inzwischen gesperrt ist
    // (Pause/Aufgabe fertig): sonst bleiben Taste UND gesammelte Punkte hängen
    // und mischen sich nach dem Weitermachen als „Geister-Punkte" in die
    // nächste Zelle (Befund 2026-07-09). Bei gesperrtem Feld wird die Zelle
    // aber NICHT committet, nur der Zustand aufgeräumt.
    e.preventDefault();
    down.current.delete(e.code);
    if (down.current.size === 0 && acc.current.size > 0) {
      const ms = o.nachlaufMs ?? 0;
      if (ms > 0 && o.enabled !== false) {
        stopNachlauf();
        nachlauf.current = setTimeout(() => flush(), ms);
      } else flush();
    }
  }, [flush]);

  // Fokus weg: eine wartende Zelle zählt noch, danach ist alles leer.
  const onBlur = useCallback(() => {
    flush();
    reset();
  }, [flush, reset]);

  return { pendingDots, onKeyDown, onKeyUp, onBlur, reset };
}
