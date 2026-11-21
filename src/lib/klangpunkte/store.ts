/**
 * Einstellungen des Bereichs „Klangpunkte": Instrument + Notennamen-Stil
 * (Buchstaben c–h oder feste Solmisation do–si). In localStorage gemerkt.
 * Die Ansage beim Umschalten macht der Aufrufer (speakUi-Muster vom 02.07.).
 */
import { create } from "zustand";
import type { Instrument } from "./audio";
import type { NameStyle } from "./notation";

const KEY = "braille-klangpunkte";

interface MusicSettings {
  instrument: Instrument;
  nameStyle: NameStyle;
  /** Rhythmussprache (ta/ti-ti) zusätzlich zu den Wertnamen ansagen (§4.6). */
  rhythmSilben: boolean;
  setInstrument: (i: Instrument) => void;
  setNameStyle: (s: NameStyle) => void;
  setRhythmSilben: (v: boolean) => void;
}

interface Stored {
  instrument: Instrument;
  nameStyle: NameStyle;
  rhythmSilben: boolean;
}

function read(): Stored {
  const def: Stored = { instrument: "klavier", nameStyle: "buchstaben", rhythmSilben: false };
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const d = JSON.parse(raw) as Partial<Stored>;
      return {
        instrument: (["klavier", "gitarre", "sax", "floete"] as const).includes(
          d.instrument as Instrument,
        )
          ? (d.instrument as Instrument)
          : def.instrument,
        nameStyle: d.nameStyle === "solmisation" ? "solmisation" : "buchstaben",
        rhythmSilben: d.rhythmSilben === true,
      };
    }
  } catch {
    /* ignore */
  }
  return def;
}

function persist(s: Stored): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

export const useMusicSettings = create<MusicSettings>((set, get) => ({
  ...read(),
  setInstrument: (instrument) => {
    persist({ instrument, nameStyle: get().nameStyle, rhythmSilben: get().rhythmSilben });
    set({ instrument });
  },
  setNameStyle: (nameStyle) => {
    persist({ instrument: get().instrument, nameStyle, rhythmSilben: get().rhythmSilben });
    set({ nameStyle });
  },
  setRhythmSilben: (rhythmSilben) => {
    persist({ instrument: get().instrument, nameStyle: get().nameStyle, rhythmSilben });
    set({ rhythmSilben });
  },
}));
