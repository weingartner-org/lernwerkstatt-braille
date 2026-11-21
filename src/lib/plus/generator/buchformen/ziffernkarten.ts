/**
 * Ziffernkarten (A8 im Befund, Beleg im Ursprungs-Repository, Knobel 2120) - Karten ohne Null, mit
 * lauter verschiedenen Ziffern. Vier Fragen dazu, eine wird gestellt:
 * - die größte Zahl (Ziffern fallend)
 * - die kleinste Zahl (Ziffern steigend - nie eine führende Null, weil keine
 *   Karte eine Null trägt)
 * - die Zahl am nächsten an einer runden Zahl - nur wenn GENAU eine Zahl den
 *   kleinsten Abstand hat
 * - wie viele Zahlen sich legen lassen (jede Karte genau einmal: n!)
 */
import { eines, gemischt, zahl, type Aufgabe } from "../../aufgabe";
import { NochNichtGebaut } from "../nochNichtGebaut";
import type { BuchArgs } from "./typen";

const ZIFFERN = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

function fakultaet(n: number): number {
  let f = 1;
  for (let i = 2; i <= n; i++) f *= i;
  return f;
}

/** Alle Zahlen, die sich aus den Karten legen lassen (jede Karte genau einmal). */
function allePermutationen(karten: number[]): number[] {
  if (karten.length === 1) return [karten[0]];
  const ergebnis: number[] = [];
  for (let i = 0; i < karten.length; i++) {
    const rest = karten.slice(0, i).concat(karten.slice(i + 1));
    for (const p of allePermutationen(rest)) ergebnis.push(karten[i] * 10 ** rest.length + p);
  }
  return ergebnis;
}

/** Eine runde Zahl, der genau EINE Legung am nächsten liegt - sonst `null`. */
function naechsteRunde(rng: () => number, karten: number[], perms: number[]): { ziel: number; antwort: number } | null {
  const stufe = 10 ** (karten.length - 1);
  const kleinste = Math.min(...perms), groesste = Math.max(...perms);
  const kandidaten: number[] = [];
  for (let z = stufe; z <= groesste + stufe; z += stufe) if (z >= kleinste - stufe) kandidaten.push(z);
  for (const ziel of gemischt(rng, kandidaten)) {
    const sortiert = [...perms].sort((x, y) => Math.abs(x - ziel) - Math.abs(y - ziel));
    if (Math.abs(sortiert[0] - ziel) < Math.abs(sortiert[1] - ziel)) return { ziel, antwort: sortiert[0] };
  }
  return null;
}

export function ziffernkarten({ paket, art, rng, stufe }: BuchArgs): Aufgabe {
  if (art !== "ziffernkarten") throw new NochNichtGebaut(paket, art);

  const anzahl = paket === "2-01" ? 2 : paket === "3-01" ? 3 : (rng() < 0.5 ? 4 : 5);
  const karten = gemischt(rng, ZIFFERN).slice(0, anzahl);
  const perms = allePermutationen(karten);

  const groesste = Math.max(...perms);
  const kleinste = Math.min(...perms);
  const rund = naechsteRunde(rng, karten, perms);

  const arten: ("groesste" | "kleinste" | "rund" | "wieviele")[] = ["groesste", "kleinste", "wieviele"];
  if (rund) arten.push("rund");
  const art2 = eines(rng, arten);

  const kopf = `Ziffernkarten: ${karten.join(", ")}`;
  if (art2 === "groesste") {
    return { paket, art, op: "zahlen", angabe: `${kopf}\nGrößte Zahl =[]`, loesung: zahl(groesste), zahlen: karten };
  }
  if (art2 === "kleinste") {
    return { paket, art, op: "zahlen", angabe: `${kopf}\nKleinste Zahl =[]`, loesung: zahl(kleinste), zahlen: karten };
  }
  if (art2 === "rund" && rund) {
    // ★ Frage und Antwortzeile getrennt - „Zahl am nächsten an 40 =[]" liest
    // sich als Rechnung, ist aber eine Frage. Stufe 2 bekommt die kürzere Frage.
    // ★ Zeilenlänge im Blick: bei 4-01 (fünf Karten) kann `ziel` sechsstellig
    // sein - „liegt" fiel weg, damit die Zeile sicher unter 40 Zeichen bleibt.
    const frage = stufe <= 2
      ? `Zahl am nächsten an ${zahl(rund.ziel)}?`
      : `Welche Zahl ist am nächsten an ${zahl(rund.ziel)}?`;
    return {
      paket, art, op: "zahlen",
      angabe: `${kopf}\n${frage}\nDie Zahl =[]`,
      loesung: zahl(rund.antwort), zahlen: karten,
    };
  }
  return {
    paket, art, op: "zahlen",
    angabe: `${kopf}\nWie viele Zahlen kannst du legen?\nAnzahl =[]`,
    loesung: zahl(fakultaet(anzahl)), zahlen: karten,
  };
}
