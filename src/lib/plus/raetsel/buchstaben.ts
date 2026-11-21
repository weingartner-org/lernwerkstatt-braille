/**
 * Buchstabenrätsel - gleiche Buchstaben sind gleiche Zahlen.
 *
 * Beleg: BEFUND …, B1 - `36 +A =84` / `A +B =100` (Beleg im Ursprungs-Repository, Knobel 273, 404).
 * ★ Schon in Plus-Schreibweise (Nebenbefund des BEFUNDs): `36 +A =84`.
 *
 * - Stufe 2: EINE Unbekannte, eine Zeile (`A +A =10`).
 * - Stufe 3-4: EINE bekannte Zahl und eine Unbekannte, ODER ein Zweiersystem
 *   (Summe UND Differenz - erst beides zusammen legt A und B fest).
 * - Stufe 5-8: eine Kette mit drei Unbekannten und Malnehmen
 *   (`A *A =B`, `A *B =C`, `C +A =R`) - R wächst wie A³+A, das ist streng
 *   steigend, also gibt es unter den ganzen Zahlen nur EIN passendes A.
 */
import type { Aufgabe } from "../aufgabe";
import { ganz } from "../aufgabe";
import { ohneWiederholung, mehrereLuecken } from "./hilfen";

function stufe2(rng: () => number) {
  const a = ganz(rng, 1, 9);
  const c = 2 * a;
  return {
    angabe: `A +A =${c}\nA =[]`,
    loesung: String(a),
    zahlen: [a, c],
    tipp: "Welche Zahl, zweimal genommen, ergibt die Summe?",
    erklaerung: `A +A =${c} heißt 2 *A =${c}, also A =${a}.`,
  };
}

function stufe3bis4(rng: () => number) {
  if (rng() < 0.5) {
    // Eine bekannte Zahl, eine Unbekannte.
    const k = ganz(rng, 12, 60);
    const a = ganz(rng, 10, 60);
    const r = k + a;
    const linksZuerst = rng() < 0.5;
    const angabe = linksZuerst ? `${k} +A =${r}\nA =[]` : `A +${k} =${r}\nA =[]`;
    return {
      angabe, loesung: String(a), zahlen: [k, a, r],
      tipp: `Was fehlt auf ${k} bis ${r}?`,
      erklaerung: `${r} -${k} =${a}, also A =${a}.`,
    };
  }
  // Zweiersystem: Summe UND Differenz - beides zusammen legt A und B fest.
  const b = ganz(rng, 10, 40);
  const d = ganz(rng, 5, 30);
  const a = b + d;
  const s = a + b;
  const { loesung, auchRichtig } = mehrereLuecken([a, b]);
  return {
    angabe: `A +B =${s}\nA -B =${d}\nA =[] B =[]`,
    loesung, auchRichtig, zahlen: [a, b, s, d],
    tipp: "Zähl Summe und Differenz zusammen - das ist A doppelt.",
    erklaerung: `A =(${s} +${d}) /2 =${a}, B =${s} -A =${b}.`,
  };
}

function stufe5bis8(rng: () => number, stufe: number) {
  const a = ganz(rng, 2, stufe <= 6 ? 7 : 12);
  const b = a * a;
  const c = a * b;
  const r = c + a;
  const { loesung, auchRichtig } = mehrereLuecken([a, b, c]);
  return {
    angabe: `A *A =B\nA *B =C\nC +A =${r}\nA =[] B =[] C =[]`,
    loesung, auchRichtig, zahlen: [a, b, c, r],
    tipp: "Probier kleine Zahlen für A, bis alles zusammenpasst.",
    erklaerung: `A =${a}: B =${b}, C =${c}, und ${c} +${a} =${r}.`,
  };
}

export function buchstabenraetsel(stufe: number, rng: () => number, bekannt?: readonly string[]): Aufgabe {
  return ohneWiederholung(bekannt, () => {
    const teil = stufe <= 2 ? stufe2(rng) : stufe <= 4 ? stufe3bis4(rng) : stufe5bis8(rng, stufe);
    return {
      paket: `raetsel-${stufe}`, art: "knobel", op: "gemischt", titel: "Buchstabenrätsel",
      ...teil,
    } satisfies Aufgabe;
  });
}
