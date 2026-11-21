/**
 * Der Jahresweg - „Mein Training" als Weg durch den Stoff einer Schulstufe.
 *
 * Johannes, 23.09.2026: „Mein Training, bei dem es immer weiter geht durch
 * den ganzen Jahresstoff". Die Etappen sind die Pakete der Stufe in der
 * Reihenfolge des Stoffplans. Welche gerade dran ist, weiß der Coach schon
 * (`baustelle`); hier wird es nur in Etappen gezählt.
 *
 * ★ Keine neue Wertung. „Geschafft" heißt hier genau das, was der Coach
 * „sitzt" nennt - dieselbe Funktion, nicht eine zweite, die auseinanderläuft.
 */
import { baustelle, sitzt, type Stand } from "./coach";
import { paket, paketeDerStufe, STUFEN } from "./stoffplan";

export interface Jahresweg {
  stufe: number;
  /** Etappen der Stufe - so viele Pakete, wie sie hat. */
  gesamt: number;
  /** Wie viele davon sitzen. */
  geschafft: number;
  /** Die Etappe, an der das Kind gerade ist - oder nichts, wenn alle sitzen. */
  etappe: { id: string; name: string; nr: number } | null;
}

export function jahresweg(stand: Stand, stufe: number): Jahresweg {
  const liste = paketeDerStufe(stufe);
  const id = baustelle(stand, stufe);
  return {
    stufe,
    gesamt: liste.length,
    geschafft: liste.filter((p) => sitzt(stand, p.id)).length,
    etappe: id ? { id, name: paket(id).name, nr: liste.findIndex((p) => p.id === id) + 1 } : null,
  };
}

/**
 * In welcher Stufe das Training weitergeht.
 *
 * Sitzt die ganze Stufe, geht es in die nächste - „immer weiter". Mit fester
 * Stufe (Kind einer Klasse) nie: dort bestimmt die Klasse die Stufe, und das
 * Training bleibt im Stoff der Klasse, auch wenn alles sitzt.
 */
export function trainingsStufe(stand: Stand, stufe: number, fest: boolean): number {
  if (fest) return stufe;
  let nr = stufe;
  const letzte = STUFEN[STUFEN.length - 1].nr;
  while (nr < letzte && baustelle(stand, nr) === null) nr += 1;
  return nr;
}
