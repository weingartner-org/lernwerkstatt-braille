/**
 * Braille-Trainer — globaler Spielzustand (Pause, Wiederholen, Tasten-Sprung).
 * Winziger zustand-Store: verbindet die globalen Alt+P/Alt+W/Alt+M-Shortcuts
 * der BrailleTrainerPage mit dem aktiven Runner, ohne Prop-Drilling.
 */
import { create } from "zustand";

/**
 * ★★★ „Escape schliesst alles" - das Ereignis, das die Fenster hoeren, die
 * NICHT der Seite gehoeren (Zeichenliste, Verwechslungs-Tafel).
 *
 * Punktgenau folgt damit derselben Regel wie Tastenflow (dort `tippen-esc`,
 * seit 14.08.2026): Escape schliesst jedes offene Fenster, und der Fokus steht
 * danach IMMER im Uebungsfeld. Der Fokus-Ruf selbst laeuft ueber
 * {@link PlayState.requestFocusInput} - dieses Ereignis schliesst nur zu.
 *
 * ⚠️ Ein Ereignis und kein weiterer Zaehler im Speicher: Wer ein Fenster
 * schliesst, aendert seinen EIGENEN Zustand; ein globaler Zaehler dafuer
 * muesste in jeder Komponente wieder auf „schon erledigt" geprueft werden.
 */
export const PUNKTGENAU_ESC = "punktgenau-esc";

interface PlayState {
  paused: boolean;
  togglePause: () => void;
  repeatNonce: number;
  requestRepeat: () => void;
  /** Alt+M: Fokus zu „Meine Tasten" (neue Zeichen/Kürzungen dieser Etappe) springen. */
  focusKeysNonce: number;
  requestFocusKeys: () => void;
  /** Alt+L: Zeichenliste (alle Zeichen/Kürzungen des Bereichs) öffnen/schließen. */
  charsNonce: number;
  requestChars: () => void;
  /** Steht die Zeichenliste gerade offen? (Für den Dialog-Guard der Seite.) */
  charsOpen: boolean;
  setCharsOpen: (open: boolean) => void;
  /**
   * Alt+O: Einstellungen (Schriftsystem, Sounds, Fehler-Tipp, Vorlesen)
   * öffnen/schließen — dasselbe Nonce-Muster wie die Zeichenliste (Charge
   * „SCHLANK", 20.09.2026). Das Zahnrad sitzt in der Kopfzeile (`PunktgenauPage`),
   * der Zustand aber in `Punktgenau.tsx` — dieser Speicher verbindet beide,
   * ohne dass der Zustand zweimal geführt wird.
   */
  settingsNonce: number;
  requestSettings: () => void;
  /** Stehen die Einstellungen gerade offen? (Für den Dialog-Guard der Seite.) */
  settingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;
  /** Alt+Z: Runden-Anzeige ansagen + fokussieren (wie „Zeile X von Y" in Tastenflow). Esc springt danach zurück ins Eingabefeld. */
  roundNonce: number;
  requestRound: () => void;
  /** Alt+E: Fokus zurück ins Übungs-/Eingabefeld der aktuellen Aufgabe. */
  focusInputNonce: number;
  requestFocusInput: () => void;
  /** Alt+U: Fokus ins Kapitel-Auswahlfeld (Etappe) — dann mit ↑ ↓ blättern (bis 30.08.2026 Alt+K). */
  focusEtappeNonce: number;
  requestFocusEtappe: () => void;
  /** Alt+1…5: Bereich (Schriftsystem) direkt wählen. */
  areaRequest: { key: string; nonce: number } | null;
  requestArea: (key: string) => void;
  /** Alt+S: bei zweizeiligen Aufgaben (Klavier) den Hand-Fokus umschalten —
   *  beide Hände · nur rechte · nur linke (Klangpunkte). */
  handSwitchNonce: number;
  requestHandSwitch: () => void;
}

export const useBraillePlay = create<PlayState>((set) => ({
  paused: false,
  togglePause: () => set((s) => ({ paused: !s.paused })),
  repeatNonce: 0,
  requestRepeat: () => set((s) => ({ repeatNonce: s.repeatNonce + 1 })),
  focusKeysNonce: 0,
  requestFocusKeys: () => set((s) => ({ focusKeysNonce: s.focusKeysNonce + 1 })),
  charsNonce: 0,
  requestChars: () => set((s) => ({ charsNonce: s.charsNonce + 1 })),
  charsOpen: false,
  setCharsOpen: (open) => set({ charsOpen: open }),
  settingsNonce: 0,
  requestSettings: () => set((s) => ({ settingsNonce: s.settingsNonce + 1 })),
  settingsOpen: false,
  setSettingsOpen: (open) => set({ settingsOpen: open }),
  roundNonce: 0,
  requestRound: () => set((s) => ({ roundNonce: s.roundNonce + 1 })),
  focusInputNonce: 0,
  requestFocusInput: () => set((s) => ({ focusInputNonce: s.focusInputNonce + 1 })),
  focusEtappeNonce: 0,
  requestFocusEtappe: () => set((s) => ({ focusEtappeNonce: s.focusEtappeNonce + 1 })),
  areaRequest: null,
  requestArea: (key) =>
    set((s) => ({ areaRequest: { key, nonce: (s.areaRequest?.nonce ?? 0) + 1 } })),
  handSwitchNonce: 0,
  requestHandSwitch: () => set((s) => ({ handSwitchNonce: s.handSwitchNonce + 1 })),
}));
