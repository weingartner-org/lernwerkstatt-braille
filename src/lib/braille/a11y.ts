/**
 * Barrierefreiheit des Braille-Trainers: stufenlose Vergrößerung des Übungsbereichs.
 * Kontrastmodi sind plattformweit in src/lib/contrast.ts — der globale Schalter
 * in der Kopfzeile steuert sie für den Braille-Trainer mit.
 */
import { create } from "zustand";
import { ZOOM_LEVELS } from "@/lib/typing/a11y";

export { ZOOM_LEVELS };

const KEY = "braille-a11y";

interface BrailleA11yState {
  zoomIndex: number;
  zoom: number; // bequemer Multiplikator (= ZOOM_LEVELS[zoomIndex])
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
}

function read(): { zoomIndex: number } {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const d = JSON.parse(raw) as { zoomIndex?: number };
      const zoomIndex =
        typeof d.zoomIndex === "number" &&
        d.zoomIndex >= 0 &&
        d.zoomIndex < ZOOM_LEVELS.length
          ? d.zoomIndex
          : 0;
      return { zoomIndex };
    }
  } catch {
    /* ignore */
  }
  return { zoomIndex: 0 };
}

function persist(zoomIndex: number): void {
  try {
    localStorage.setItem(KEY, JSON.stringify({ zoomIndex }));
  } catch {
    /* ignore */
  }
}

export const useBrailleA11y = create<BrailleA11yState>((set, get) => {
  const init = read();
  return {
    zoomIndex: init.zoomIndex,
    zoom: ZOOM_LEVELS[init.zoomIndex],
    zoomIn: () => {
      const i = Math.min(get().zoomIndex + 1, ZOOM_LEVELS.length - 1);
      persist(i);
      set({ zoomIndex: i, zoom: ZOOM_LEVELS[i] });
    },
    zoomOut: () => {
      const i = Math.max(get().zoomIndex - 1, 0);
      persist(i);
      set({ zoomIndex: i, zoom: ZOOM_LEVELS[i] });
    },
    resetZoom: () => {
      persist(0);
      set({ zoomIndex: 0, zoom: ZOOM_LEVELS[0] });
    },
  };
});
