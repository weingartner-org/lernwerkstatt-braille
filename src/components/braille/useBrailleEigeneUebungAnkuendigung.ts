/**
 * ★★★ DAS ANKÜNDIGUNGSFENSTER "EIGENE ÜBUNG" - WANN ES STEHT.
 *
 * Vorbild `lib/typing/useEigeneUebungAnkuendigung.ts` (fast unverändert
 * übernommen - die Regeln sind programmunabhängig):
 *
 *  1. Sobald dieses Kind eine Übung vor sich hat, kommt das Fenster.
 *  2. Läuft gerade eine Braille-Challenge oder ein Klassenmatch, WARTET das
 *     Fenster, bis das vorbei ist - das übergibt der Aufrufer als `gesperrt`.
 *  3. Jede Übung der Reihe hat ihr eigenes Fenster - bestätigt wird einmal
 *     je Übung und je Kind, am Konto.
 */
import { useState } from "react";

export interface BrailleEigeneUebungAnkuendigungAuftrag {
  dran: boolean;
  zeiger: { textId: string } | null;
  /** Läuft gerade etwas, das vorgeht (Braille-Challenge, Klassenmatch)? */
  gesperrt: boolean;
  angekuendigt: boolean;
  merkeBestaetigt: () => void;
}

export interface BrailleEigeneUebungAnkuendigungStand {
  zeigen: boolean;
  bestaetigen: () => void;
}

export function useBrailleEigeneUebungAnkuendigung({
  dran,
  zeiger,
  gesperrt,
  angekuendigt,
  merkeBestaetigt,
}: BrailleEigeneUebungAnkuendigungAuftrag): BrailleEigeneUebungAnkuendigungStand {
  const textId = zeiger?.textId ?? null;
  const [bestaetigtFuer, setBestaetigtFuer] = useState<string | null>(null);

  return {
    zeigen: dran && !!textId && !gesperrt && !angekuendigt && bestaetigtFuer !== textId,
    bestaetigen: () => {
      if (!textId) return;
      setBestaetigtFuer(textId);
      merkeBestaetigt();
    },
  };
}
