/**
 * Malkreuz (A5 im Befund, Beleg im Ursprungs-Repository) - eine Malaufgabe in Stellen zerlegt, als
 * Tabelle zeilenweise (siehe `feedback_grafik_werkzeuge_blindenpaedagogik`:
 * eine Tabelle in Zeilen mit `|`, wie die Zahlenmauer).
 *
 * ⚠️ Braucht Umbau für Braille (Befund 25.09.2026) - die Kopfzeile der
 * Tabelle beginnt mit einem alleinstehenden `*`, das `sprich` nicht als
 * Rechenzeichen erkennt (davor steht kein Operand). Das ist gemeldet, nicht
 * selbst behoben - siehe Schlussantwort.
 *
 * - 3-16 (einstelliger Multiplikator): eine dreistellige Zahl mal einer
 *   einzelnen Ziffer, drei Teilprodukte plus Ergebnis (4 Lücken).
 * - 4-07 (zweistelliger Multiplikator): zwei zweistellige Zahlen, ein
 *   2x2-Kreuz plus Ergebnis (5 Lücken) - immer zweistellig mal zweistellig,
 *   unabhängig vom großen Zahlenraum des Pakets.
 */
import { LUECKE, ganz, zahl, type Aufgabe } from "../../aufgabe";
import { NochNichtGebaut } from "../nochNichtGebaut";
import type { BuchArgs } from "./typen";

function einstelligerMultiplikator(paket: string, art: BuchArgs["art"], rng: () => number, raum: [number, number] | null): Aufgabe {
  const zMax = Math.min(999, raum ? raum[1] : 999);
  const z = ganz(rng, 100, Math.max(100, zMax));
  const m = ganz(rng, 2, 9);
  const hunderter = Math.floor(z / 100) * 100;
  const zehner = Math.floor((z % 100) / 10) * 10;
  const einer = z % 10;
  const p1 = hunderter * m, p2 = zehner * m, p3 = einer * m;
  const summe = z * m;

  const angabe =
    `Malkreuz: ${zahl(z)} *${m}\n` +
    `* | ${zahl(hunderter)} | ${zahl(zehner)} | ${zahl(einer)}\n` +
    `${m} | ${LUECKE} | ${LUECKE} | ${LUECKE}\n` +
    `${zahl(z)} *${m} =${LUECKE}`;
  const werte = [p1, p2, p3, summe];
  return {
    paket, art, op: "mal", angabe,
    loesung: werte.map((w) => zahl(w)).join(" und "),
    auchRichtig: [werte.map((w) => zahl(w)).join(", "), werte.map((w) => zahl(w)).join(" ")],
    zahlen: [z, m, hunderter, zehner, einer, p1, p2, p3, summe],
  };
}

function zweistelligerMultiplikator(paket: string, art: BuchArgs["art"], rng: () => number): Aufgabe {
  const a = ganz(rng, 10, 99);
  const b = ganz(rng, 10, 99);
  const zehnerA = Math.floor(a / 10) * 10, einerA = a % 10;
  const zehnerB = Math.floor(b / 10) * 10, einerB = b % 10;
  const r1 = zehnerA * zehnerB, r2 = einerA * zehnerB;
  const r3 = zehnerA * einerB, r4 = einerA * einerB;
  const summe = a * b;

  const angabe =
    `Malkreuz: ${zahl(a)} *${b}\n` +
    `* | ${zahl(zehnerA)} | ${zahl(einerA)}\n` +
    `${zahl(zehnerB)} | ${LUECKE} | ${LUECKE}\n` +
    `${zahl(einerB)} | ${LUECKE} | ${LUECKE}\n` +
    `${zahl(a)} *${b} =${LUECKE}`;
  const werte = [r1, r2, r3, r4, summe];
  return {
    paket, art, op: "mal", angabe,
    loesung: werte.map((w) => zahl(w)).join(" und "),
    auchRichtig: [werte.map((w) => zahl(w)).join(", "), werte.map((w) => zahl(w)).join(" ")],
    zahlen: [a, b, zehnerA, einerA, zehnerB, einerB, r1, r2, r3, r4, summe],
  };
}

export function malkreuz({ paket, art, rng, raum, op }: BuchArgs): Aufgabe {
  if (art !== "malkreuz" || op !== "mal") throw new NochNichtGebaut(paket, art);
  if (paket === "4-07") return zweistelligerMultiplikator(paket, art, rng);
  return einstelligerMultiplikator(paket, art, rng, raum);
}
