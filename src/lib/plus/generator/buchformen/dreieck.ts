/**
 * Rechendreieck (A1 im Befund) - drei Ecken, drei Seiten. Jede Seite ist die
 * Summe der beiden Ecken, die sie verbindet. Gegeben sind alle drei Seiten und
 * EINE Ecke; die anderen zwei sind gesucht.
 *
 * ★ Nur die Addition - so stehen die Belege (Beleg im Ursprungs-Repository, Beleg im Ursprungs-Repository, Beleg im Ursprungs-Repository).
 * Ein Minus- oder Mal-Paket bekäme mit dieser Form nichts Sinnvolles; es soll
 * eine andere Form nehmen.
 */
import { LUECKE, ganz, zahl, type Aufgabe } from "../../aufgabe";
import { NochNichtGebaut } from "../nochNichtGebaut";
import type { BuchArgs } from "./typen";

const ECKEN = ["A", "B", "C"] as const;
type Ecke = (typeof ECKEN)[number];

export function dreieck({ paket, art, rng, raum, op }: BuchArgs): Aufgabe {
  if (art !== "dreieck" || op !== "plus") throw new NochNichtGebaut(paket, art);

  // ★ Die Summen (Seiten) bleiben im Zahlenraum - für Stufe 1 ist das schon
  // die geforderte Grenze von 10 bzw. 20 (1-08: raum bis 10, 1-13: bis 20).
  const cap = raum ? raum[1] : 20;
  const maxEcke = Math.max(1, Math.floor(cap / 2));
  const werte: Record<Ecke, number> = {
    A: ganz(rng, 1, maxEcke),
    B: ganz(rng, 1, maxEcke),
    C: ganz(rng, 1, maxEcke),
  };
  const seiten: Record<string, number> = {
    AB: werte.A + werte.B,
    BC: werte.B + werte.C,
    CA: werte.C + werte.A,
  };

  const gegeben = ECKEN[Math.floor(rng() * 3)];
  const gesucht = ECKEN.filter((e) => e !== gegeben);
  const eckeText = (e: Ecke) => (e === gegeben ? zahl(werte[e]) : LUECKE);

  const angabe =
    `Rechendreieck: Finde ${gesucht[0]} und ${gesucht[1]}.\n` +
    `A +B =${zahl(seiten.AB)}\n` +
    `B +C =${zahl(seiten.BC)}\n` +
    `C +A =${zahl(seiten.CA)}\n` +
    `A =${eckeText("A")} B =${eckeText("B")} C =${eckeText("C")}`;

  const w0 = werte[gesucht[0]];
  const w1 = werte[gesucht[1]];
  return {
    paket, art, op: "plus", angabe,
    loesung: `${zahl(w0)} und ${zahl(w1)}`,
    auchRichtig: [`${zahl(w0)}, ${zahl(w1)}`, `${zahl(w0)} ${zahl(w1)}`],
    zahlen: [werte.A, werte.B, werte.C, seiten.AB, seiten.BC, seiten.CA],
  };
}
