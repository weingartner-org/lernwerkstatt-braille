/**
 * „Kann das stimmen?" (Befund C3, Beleg im Ursprungs-Repository · Beleg im Ursprungs-Repository) - ein Satz über
 * eine Größe aus dem Alltag, Antwort ja oder nein. Passt zu den Größen-
 * Paketen (3-21, 4-15).
 *
 * ★ Die falsche Fassung entsteht NIE knapp daneben - sonst wäre es Raten,
 * nicht Größenvorstellung. Zwei Wege, beide klar falsch:
 * - die richtige Zahl mit einer falschen (benachbarten) Einheit,
 * - dieselbe Einheit mit einer Zahl, die um mindestens das Zehnfache daneben
 *   liegt.
 *
 * Österreichische Einheiten sind erlaubt: „dag" (Dekagramm) ist im
 * Sprech-Wörterbuch (`rechnen.ts`) schon vertreten.
 */
import { ganz, eines, zahl } from "../../aufgabe";
import type { Buchform } from "./typen";

interface Ding {
  satz: (wert: string, einheit: string) => string;
  einheit: string;
  bereich: [number, number];
  /** Eine benachbarte, aber klar falsche Einheit - selbe Zahl, anderer Maßstab. */
  nachbar?: string;
}

const DINGE: Ding[] = [
  // Länge
  { satz: (w, e) => `Ein Radiergummi ist ${w} ${e} lang.`, einheit: "cm", bereich: [3, 8], nachbar: "m" },
  { satz: (w, e) => `Ein Bleistift ist ${w} ${e} lang.`, einheit: "cm", bereich: [10, 20], nachbar: "m" },
  { satz: (w, e) => `Eine Zimmertür ist ${w} ${e} hoch.`, einheit: "m", bereich: [2, 3], nachbar: "cm" },
  { satz: (w, e) => `Ein Fingernagel ist ${w} ${e} breit.`, einheit: "mm", bereich: [5, 15], nachbar: "m" },
  { satz: (w, e) => `Ein Fußballfeld ist ${w} ${e} lang.`, einheit: "m", bereich: [90, 120], nachbar: "cm" },
  { satz: (w, e) => `Ein Kirchturm ist ${w} ${e} hoch.`, einheit: "m", bereich: [20, 60], nachbar: "cm" },
  { satz: (w, e) => `Ein Auto ist ${w} ${e} lang.`, einheit: "m", bereich: [3, 5], nachbar: "cm" },
  { satz: (w, e) => `Eine Straße ist ${w} ${e} breit.`, einheit: "m", bereich: [4, 10], nachbar: "cm" },
  { satz: (w, e) => `Ein Wanderweg ist ${w} ${e} lang.`, einheit: "km", bereich: [2, 15], nachbar: "m" },
  { satz: (w, e) => `Ein Zimmer ist ${w} ${e} lang.`, einheit: "m", bereich: [3, 8], nachbar: "cm" },
  { satz: (w, e) => `Ein Lineal ist ${w} ${e} lang.`, einheit: "cm", bereich: [15, 30], nachbar: "m" },
  // Gewicht
  { satz: (w, e) => `Ein Apfel wiegt ${w} ${e}.`, einheit: "g", bereich: [100, 200], nachbar: "kg" },
  { satz: (w, e) => `Ein Radiergummi wiegt ${w} ${e}.`, einheit: "g", bereich: [10, 30], nachbar: "kg" },
  { satz: (w, e) => `Ein Pferd wiegt ${w} ${e}.`, einheit: "kg", bereich: [400, 600], nachbar: "g" },
  { satz: (w, e) => `Ein Auto wiegt ${w} ${e}.`, einheit: "kg", bereich: [1000, 2000], nachbar: "g" },
  { satz: (w, e) => `Ein Brief wiegt ${w} ${e}.`, einheit: "g", bereich: [5, 20], nachbar: "kg" },
  { satz: (w, e) => `Eine Schultasche wiegt ${w} ${e}.`, einheit: "kg", bereich: [3, 8], nachbar: "g" },
  { satz: (w, e) => `Ein Sack Kartoffeln wiegt ${w} ${e}.`, einheit: "kg", bereich: [5, 25], nachbar: "g" },
  { satz: (w, e) => `Ein Elefant wiegt ${w} ${e}.`, einheit: "t", bereich: [2, 6], nachbar: "kg" },
  { satz: (w, e) => `Ein Packerl Zucker wiegt ${w} ${e}.`, einheit: "dag", bereich: [40, 100], nachbar: "kg" },
  { satz: (w, e) => `Ein Ei wiegt ${w} ${e}.`, einheit: "dag", bereich: [5, 8], nachbar: "kg" },
  { satz: (w, e) => `Eine Wassermelone wiegt ${w} ${e}.`, einheit: "kg", bereich: [2, 6], nachbar: "g" },
  // Zeit
  { satz: (w, e) => `Zähneputzen dauert ${w} ${e}.`, einheit: "min", bereich: [2, 5], nachbar: "h" },
  { satz: (w, e) => `Eine Schulstunde dauert ${w} ${e}.`, einheit: "min", bereich: [45, 50], nachbar: "h" },
  { satz: (w, e) => `Ein Film dauert ${w} ${e}.`, einheit: "h", bereich: [1, 2], nachbar: "min" },
  { satz: (w, e) => `Eine Ampel ist ${w} ${e} rot.`, einheit: "s", bereich: [20, 90], nachbar: "min" },
  { satz: (w, e) => `Eine Nacht schlafen dauert ${w} ${e}.`, einheit: "h", bereich: [8, 10], nachbar: "min" },
  { satz: (w, e) => `Eine Zugfahrt dauert ${w} ${e}.`, einheit: "h", bereich: [1, 5], nachbar: "min" },
  { satz: (w, e) => `Nudeln kochen dauert ${w} ${e}.`, einheit: "min", bereich: [8, 12], nachbar: "h" },
  // Hohlmaß
  { satz: (w, e) => `Ein Glas fasst ${w} ${e}.`, einheit: "ml", bereich: [200, 300], nachbar: "l" },
  { satz: (w, e) => `Eine Badewanne fasst ${w} ${e}.`, einheit: "l", bereich: [100, 200], nachbar: "ml" },
  { satz: (w, e) => `Ein Suppenlöffel fasst ${w} ${e}.`, einheit: "ml", bereich: [10, 20], nachbar: "l" },
  { satz: (w, e) => `Eine Trinkflasche fasst ${w} ${e}.`, einheit: "ml", bereich: [500, 1000], nachbar: "l" },
  { satz: (w, e) => `Ein Eimer fasst ${w} ${e}.`, einheit: "l", bereich: [5, 15], nachbar: "ml" },
  { satz: (w, e) => `Eine Regentonne fasst ${w} ${e}.`, einheit: "l", bereich: [50, 200], nachbar: "ml" },
];

/**
 * Eine falsche Fassung: entweder die richtige Zahl mit der Nachbar-Einheit,
 * oder dieselbe Einheit mit einer Zahl, die weit danebenliegt.
 *
 * ★ Bei der Größenordnung wird nur VERVIELFACHT, nie geteilt - ein Teilen
 * kleiner Bereichszahlen (etwa „2 bis 6") landet sonst bei „1" oder „0", und
 * das ist knapp daneben, kein „völlig falsch".
 */
function falscherWert(ding: Ding, echterWert: number, rng: () => number): { wert: number; einheit: string } {
  const mitFalscherEinheit = ding.nachbar && rng() < 0.5;
  if (mitFalscherEinheit) return { wert: echterWert, einheit: ding.nachbar! };

  const faktor = eines(rng, [10, 100] as const);
  return { wert: echterWert * faktor, einheit: ding.einheit };
}

export const stimmtDas: Buchform = ({ paket, rng }) => {
  const ding = eines(rng, DINGE);
  const wahr = rng() < 0.5;
  const echterWert = ganz(rng, ding.bereich[0], ding.bereich[1]);
  const { wert, einheit } = wahr ? { wert: echterWert, einheit: ding.einheit } : falscherWert(ding, echterWert, rng);

  return {
    paket,
    art: "stimmt_das",
    op: "zahlen",
    // ★ Eigene Zeile für die Frage - der Satz allein kann mit einer
    // verzehnfachten Zahl schon knapp an die 40 Zeichen der Braillezeile
    // gehen (siehe `plus-generator.test.ts`).
    angabe: `${ding.satz(zahl(wert), einheit)}\nKann das stimmen?`,
    loesung: wahr ? "ja" : "nein",
    auchRichtig: wahr ? ["stimmt", "richtig"] : ["stimmt nicht", "falsch"],
    zahlen: [wert],
  };
};
