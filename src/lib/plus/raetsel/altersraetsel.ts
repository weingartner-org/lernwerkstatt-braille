/**
 * Alters- und Resträtsel - zwei Angaben, eine gesuchte Zahl.
 *
 * Beleg: BEFUND …, Vorschlag Johannes - „Mia ist 3 Jahre älter als Tom.
 * Zusammen sind sie 17. Wie alt ist Mia?" und die Nuss-Verteilung mit Rest.
 *
 * - Alter: Differenz UND Summe gegeben - daraus folgen beide Alter eindeutig
 *   (das doppelte Alter der/des Älteren ist Summe plus Differenz).
 * - Verteilen: zwei Arten, an `n` Kinder zu verteilen - einmal fehlt etwas,
 *   einmal bleibt etwas übrig. Aus der Differenz der beiden Verteil-Mengen und
 *   der Summe aus Fehlbetrag und Rest folgt die Kinderzahl.
 */
import type { Aufgabe } from "../aufgabe";
import { ganz, gemischt, eines } from "../aufgabe";
import { ohneWiederholung, NAMEN } from "./hilfen";

function altersraetsel(rng: () => number, stufe: number) {
  const [name1, name2] = gemischt(rng, NAMEN).slice(0, 2);
  const jungOben = stufe <= 6 ? 12 : 40;
  const juenger = ganz(rng, 3, jungOben);
  const diff = ganz(rng, 1, stufe <= 6 ? 8 : 15);
  const aelter = juenger + diff;
  const summe = juenger + aelter;
  const diffJahre = diff === 1 ? "Jahr" : "Jahre";
  const tipp = stufe <= 4
    ? "Zähl Summe und Unterschied zusammen - das ist doppelt viel."
    : "Zähl Summe und Unterschied zusammen - das ist das doppelte Alter des Älteren.";
  return {
    angabe: `${name1} ist ${diff} ${diffJahre} älter als ${name2}.\nZusammen sind sie ${summe} Jahre alt.\nWie alt ist ${name1}?\n${name1} ist [] Jahre alt.`,
    loesung: String(aelter), zahlen: [diff, summe, aelter, juenger],
    tipp,
    erklaerung: `(${summe} +${diff}) /2 =${aelter} Jahre.`,
  };
}

function verteilraetsel(rng: () => number, stufe: number) {
  const kinder = ganz(rng, 3, stufe <= 6 ? 8 : 14);
  const b = ganz(rng, 2, 6); // wenig - dabei bleibt etwas übrig
  const rest = ganz(rng, 1, kinder - 1);
  const vorrat = b * kinder + rest;
  const mehrProKind = ganz(rng, 1, 4);
  const a = b + mehrProKind; // viel - dabei fehlt etwas
  const fehl = a * kinder - vorrat;
  const ding = eines(rng, ["Nüsse", "Bonbons", "Perlen", "Sticker"]);
  const fehltVerb = fehl === 1 ? "fehlt" : "fehlen";
  const bleibtVerb = rest === 1 ? "bleibt" : "bleiben";
  return {
    angabe: `Gibt Oma jedem Kind ${a} ${ding}, ${fehltVerb} ${fehl}.\nGibt sie jedem Kind ${b} ${ding}, ${bleibtVerb} ${rest} übrig.\nWie viele Kinder sind es?\nEs sind [] Kinder.`,
    loesung: String(kinder), zahlen: [a, fehl, b, rest, kinder],
    tipp: "Der Unterschied je Kind mal Kinderzahl ergibt fehlend plus übrig.",
    erklaerung: `${fehl} +${rest} =${fehl + rest}, geteilt durch ${a - b} ergibt ${kinder} Kinder.`,
  };
}

export function altersUndRestraetsel(stufe: number, rng: () => number, bekannt?: readonly string[]): Aufgabe {
  return ohneWiederholung(bekannt, () => {
    const teil = rng() < 0.5 ? altersraetsel(rng, stufe) : verteilraetsel(rng, stufe);
    return {
      paket: `raetsel-${stufe}`, art: "knobel", op: "gemischt", titel: "Alters- und Resträtsel",
      ...teil,
    } satisfies Aufgabe;
  });
}
