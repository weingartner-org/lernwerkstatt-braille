/**
 * Tintenklecks (A7 im Befund, Beleg im Ursprungs-Repository) - eine Ziffer ist verschmiert:
 * `38 +[]6 =94` - welche war es?
 *
 * ★★★ Weil nur EINE Ziffer einer sonst vollständigen Rechnung fehlt, ist die
 * Gleichung linear in genau dieser einen Ziffer (Vorfaktor eine Zehnerpotenz,
 * nie null) - es gibt IMMER genau eine passende Ziffer 0-9, und das ist die
 * Ziffer, mit der die Zahl gebaut wurde. Eine falsche Ziffer weiter vorn in
 * derselben Zahl bliebe unverändert stehen; nur die verschmierte Stelle ist
 * die Unbekannte.
 *
 * ⚠️ Nie die führende Ziffer einer Zahl mit dem Wert 0 - das kommt von selbst
 * nie vor, weil jede gebaute Zahl schon ohne führende Null dasteht.
 */
import { ganz, rechnungMit, zahl, type Aufgabe } from "../../aufgabe";
import { NochNichtGebaut } from "../nochNichtGebaut";
import type { BuchArgs } from "./typen";

/** Ziffernstring mit einer LUECKE an der Stelle `index` (von links, 0-basiert). */
function geklecktes(n: number, index: number): { text: string; ziffer: string } {
  const ziffern = String(n).split("");
  const ziffer = ziffern[index];
  ziffern[index] = "[]";
  return { text: ziffern.join(""), ziffer };
}

export function klecks({ paket, art, rng, raum, op }: BuchArgs): Aufgabe {
  if (art !== "klecks" || (op !== "plus" && op !== "minus")) throw new NochNichtGebaut(paket, art);

  const hi = raum ? raum[1] : 1000;
  // ★ In der oberen Hälfte des Zahlenraums bleiben - dort haben die Zahlen
  // genug Stellen für ein Ziffernrätsel, auch bei kleineren Paketen.
  const min = Math.max(10, Math.floor(hi / 4));

  let a: number, b: number, erg: number;
  if (op === "plus") {
    a = ganz(rng, min, Math.max(min, hi - min));
    b = ganz(rng, min, Math.max(min, hi - a));
    erg = a + b;
  } else {
    a = ganz(rng, Math.min(hi, min * 2), hi);
    b = ganz(rng, min, Math.max(min, a - 1));
    erg = a - b;
  }

  // Welche der drei Zahlen bekommt den Klecks, und auf welcher Stelle?
  const teile: { name: "a" | "b" | "erg"; wert: number }[] = [
    { name: "a", wert: a }, { name: "b", wert: b }, { name: "erg", wert: erg },
  ];
  const ziel = teile[Math.floor(rng() * teile.length)];
  const stelle = Math.floor(rng() * String(ziel.wert).length);
  const { text, ziffer } = geklecktes(ziel.wert, stelle);

  const angabeA = ziel.name === "a" ? text : zahl(a);
  const angabeB = ziel.name === "b" ? text : zahl(b);
  const angabeErg = ziel.name === "erg" ? text : zahl(erg);
  const zeile = rechnungMit(angabeA, op, angabeB, angabeErg);

  return {
    paket, art, op,
    angabe: `Tintenklecks: Welche Ziffer fehlt?\n${zeile}`,
    loesung: ziffer,
    zahlen: [a, b, erg],
  };
}
