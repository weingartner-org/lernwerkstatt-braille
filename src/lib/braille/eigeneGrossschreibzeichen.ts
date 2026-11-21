/**
 * Großschreibzeichen-Einstellung für alle, die zu KEINER Klasse gehören
 * (`ohneKlasse` in `Punktgenau.tsx`: nicht angemeldet, selbstlernendes Konto,
 * Lehrkraft, Studierende). Wer in einer Klasse ist, bekommt die Einstellung
 * von der Lehrkraft (`BrailleClassSettings.grossschreibzeichen` in
 * `account.ts`) - für den gilt dieser Speicher nicht.
 *
 * Eigenes Modul statt Erweiterung von `a11y.ts`: dort geht es um die STUFEN-
 * LOSE VERGRÖSSERUNG des Übungsbereichs (Barrierefreiheit), hier um eine
 * didaktische Einstellung des Lerninhalts selbst (ob die Engine vor großen
 * Buchstaben eine Ankündigungszelle setzt) - zwei Zustände ohne Bezug
 * zueinander, die nur zufällig in derselben App wohnen.
 *
 * Gleiches Muster wie `a11y.ts`: zustand-Store + defensiv gelesenes
 * localStorage (try/catch, fehlender/kaputter Wert ⇒ Standard). Standard ist
 * AN (Großschreibzeichen werden gesetzt) - genau wie der Standard der
 * Klassen-Einstellung -, damit sich für niemanden etwas ändert, der nichts
 * einstellt.
 */
import { create } from "zustand";

const KEY = "braille-grossschreibzeichen-eigen";

interface EigeneGrossschreibzeichenState {
  grossschreibzeichen: boolean;
  toggleGrossschreibzeichen: () => void;
}

function read(): boolean {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw !== null) {
      const d = JSON.parse(raw) as { grossschreibzeichen?: boolean };
      if (typeof d.grossschreibzeichen === "boolean") return d.grossschreibzeichen;
    }
  } catch {
    /* ignore */
  }
  return true;
}

function persist(value: boolean): void {
  try {
    localStorage.setItem(KEY, JSON.stringify({ grossschreibzeichen: value }));
  } catch {
    /* ignore */
  }
}

export const useEigeneGrossschreibzeichen = create<EigeneGrossschreibzeichenState>(
  (set, get) => ({
    grossschreibzeichen: read(),
    toggleGrossschreibzeichen: () => {
      const next = !get().grossschreibzeichen;
      persist(next);
      set({ grossschreibzeichen: next });
    },
  }),
);
