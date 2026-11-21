/**
 * Zahlenkette (A3 im Befund, Beleg im Ursprungs-Repository) - jede Zahl ist die Summe der
 * zwei davor (wie die Fibonacci-Folge, nur mit eigenem Start).
 *
 * Zwei Varianten:
 * - Die ersten zwei Zahlen stehen da, die letzten zwei fehlen
 *   (`2, 3, 5, [], []`).
 * - EINE Zahl fehlt mittendrin (`3, [], 7, 10, 17`) - lösbar, weil die Zahl
 *   danach die Lücke und ihren Vorgänger addiert: die Lücke ist also die Zahl
 *   danach MINUS die Zahl davor.
 */
import { LUECKE, ganz, zahl, type Aufgabe } from "../../aufgabe";
import { NochNichtGebaut } from "../nochNichtGebaut";
import type { BuchArgs } from "./typen";

const LAENGE = 5;

/** Eine Fibonacci-artige Folge, die ganz im Zahlenraum bleibt. */
function reihe(rng: () => number, max: number): number[] | null {
  const startMax = Math.max(1, Math.floor(max / 8));
  for (let versuch = 0; versuch < 300; versuch++) {
    const folge = [ganz(rng, 1, startMax), ganz(rng, 1, startMax)];
    let passt = true;
    for (let i = 2; i < LAENGE; i++) {
      const naechste = folge[i - 1] + folge[i - 2];
      if (naechste > max) { passt = false; break; }
      folge.push(naechste);
    }
    if (passt) return folge;
  }
  return null;
}

export function zahlenkette({ paket, art, rng, raum, stufe }: BuchArgs): Aufgabe {
  if (art !== "zahlenkette") throw new NochNichtGebaut(paket, art);
  const max = raum ? raum[1] : 100;
  const folge = reihe(rng, max);
  if (!folge) throw new NochNichtGebaut(paket, art);

  // ★ Kurz halten (Zeilenlänge, `plus-generator.test.ts`) - die ausgeschriebene
  // Fassung war mit 52 Zeichen zu lang.
  const kopf = stufe <= 2
    ? "Jede Zahl: die zwei davor zusammen."
    : "Zahlenkette: Summe der zwei davor.";

  const hinten = rng() < 0.5;
  let zeile: string[];
  let loesung: string;
  let auchRichtig: string[] | undefined;
  if (hinten) {
    zeile = folge.map((n, i) => (i >= LAENGE - 2 ? LUECKE : zahl(n)));
    const w0 = folge[LAENGE - 2];
    const w1 = folge[LAENGE - 1];
    loesung = `${zahl(w0)} und ${zahl(w1)}`;
    auchRichtig = [`${zahl(w0)}, ${zahl(w1)}`, `${zahl(w0)} ${zahl(w1)}`];
  } else {
    // ★ Nur eine Mitten-Lücke, die noch VOR und NACH sich eine Zahl hat -
    // sonst gäbe es keine zwei Nachbarn, aus denen sie sich ergibt.
    const g = ganz(rng, 1, LAENGE - 2);
    zeile = folge.map((n, i) => (i === g ? LUECKE : zahl(n)));
    loesung = zahl(folge[g]);
  }

  const angabe = `${kopf}\n${zeile.join(", ")}`;
  return { paket, art, op: "plus", angabe, loesung, auchRichtig, zahlen: folge };
}
