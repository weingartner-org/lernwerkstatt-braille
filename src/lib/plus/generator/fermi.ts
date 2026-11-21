/**
 * Fermi-Aufgaben: schätzen und begründen.
 *
 * ★ Eine Fermi-Aufgabe hat keine eine richtige Antwort, sondern eine
 * Größenordnung. „Wie viele Schritte gehst du an einem Tag?" - wer 8000 sagt,
 * hat recht, und wer 9000 sagt, auch. Falsch ist 80 und falsch ist 800 000.
 *
 * ★ Damit das prüfbar bleibt und nicht zum Raten wird, steht die Annahme in
 * der Aufgabe: „Nimm an, ein Schritt ist 60 cm lang." Dann ist die Schätzung
 * eine Rechnung mit einer selbst gewählten Zahl - und genau das ist der
 * Lerngegenstand.
 *
 * ★ Der Bereich ist großzügig. Eine Fermi-Aufgabe, die auf 10 Prozent genau
 * sein will, hat ihren Sinn verfehlt.
 */
import { saetzeUmbrechen } from "@/lib/sprechen/ordnungszahl";
import { type Operation } from "../aufgabe";
import type { Kern } from "./kerne";

export interface FermiFrage {
  /** Die Frage, Satz für Satz - jede Zeile unter 40 Zeichen. */
  text: string;
  /** Der Bereich, in dem eine Antwort als gut gilt. */
  bereich: [number, number];
  /** Was man dafür annimmt - es steht in der Aufgabe. */
  einheit?: string;
  op: Operation;
}

const STUFE3: FermiFrage[] = [
  { text: "Ein Schritt ist 60 cm lang. Wie viele Schritte sind 100 m?", bereich: [150, 180], op: "geteilt" },
  // ★ Beide Fragen bleiben im Zahlenraum 1000. Gemessen am 23.09.2026: hier
  // stand „ein Buch mit 100?" (das Wort „Seiten" fehlte, Ergebnis 3000) und
  // der Herzschlag eines Tages (über 100000). Der steht jetzt in Stufe 4.
  { text: "Eine Seite hat 30 Zeilen. Wie viele Zeilen haben 20 Seiten?", bereich: [500, 700], op: "mal" },
  { text: "Ein Kind schläft 10 Stunden je Nacht. Wie viele Stunden in einer Woche?", bereich: [60, 80], einheit: "h", op: "mal" },
  { text: "Ein Apfel wiegt 150 g. Wie viele Äpfel sind ein Kilo?", bereich: [6, 8], op: "geteilt" },
  { text: "Eine Klasse hat 20 Kinder. Wie viele Finger sind das?", bereich: [180, 220], op: "mal" },
  { text: "Du liest 4 Seiten in 10 Minuten. Wie viele in einer Stunde?", bereich: [20, 28], op: "mal" },
];

const STUFE4: FermiFrage[] = [
  { text: "Eine Badewanne fasst 150 Liter. Wie viele Flaschen zu 1 Liter sind das?", bereich: [140, 160], op: "geteilt" },
  { text: "Ein Auto fährt 50 km je Stunde. Wie weit kommt es an einem Tag?", bereich: [1000, 1400], einheit: "km", op: "mal" },
  { text: "Ein Schulheft hat 40 Blätter. Wie viele Blätter sind in 25 Heften?", bereich: [900, 1100], op: "mal" },
  { text: "300 Kinder trinken je 3 Becher am Tag. Wie viele Becher sind das?", bereich: [800, 1000], op: "mal" },
  { text: "52 Wochen zu 25 Stunden Schule. Wie viele Stunden sind das?", bereich: [1200, 1400], einheit: "h", op: "mal" },
  { text: "Ein Regentropfen wiegt 0,05 g. Wie viele sind ein Kilo?", bereich: [18000, 22000], op: "geteilt" },
  { text: "Dein Herz schlägt 4500 Mal je Stunde. Wie oft an einem Tag?", bereich: [90000, 120000], op: "mal" },
];

const STUFE5: FermiFrage[] = [
  { text: "Ein Blatt ist 0,1 mm dick. Wie hoch sind 500 Blatt?", bereich: [45, 55], einheit: "mm", op: "mal" },
  { text: "Du gehst 5 km in der Stunde. Wie lange brauchst du für 12 km?", bereich: [2, 3], einheit: "h", op: "geteilt" },
  { text: "Eine Semmel kostet 0,60 Euro. Was kosten 25 Stück?", bereich: [14, 16], einheit: "Euro", op: "mal" },
  { text: "Das Zimmer ist 4 m mal 3 m groß. Wie viele Fliesen zu 25 cm brauchst du?", bereich: [180, 220], op: "geteilt" },
  { text: "Ein Kind wächst 6 cm im Jahr. Wie viel in 10 Jahren?", bereich: [55, 65], einheit: "cm", op: "mal" },
  { text: "12 Stück kosten 3 Euro. Was kostet ein Stück?", bereich: [0.2, 0.3], einheit: "Euro", op: "geteilt" },
];

const STUFE8: FermiFrage[] = [
  { text: "2 Millionen Menschen trinken je 2 Liter. Wie viele Liter sind das?", bereich: [3500000, 4500000], einheit: "l", op: "mal" },
  { text: "Ein Handy hält 2 Jahre. Wie viele Handys sind es in 80 Jahren?", bereich: [30, 40], op: "geteilt" },
  { text: "Ein Baum nimmt 20 kg CO2 im Jahr auf. Wie viele für 5 Tonnen?", bereich: [220, 280], op: "geteilt" },
  { text: "Du schläfst 8 Stunden am Tag. Wie viele Jahre sind das bis 60?", bereich: [18, 22], einheit: "Jahre", op: "mal" },
  { text: "Eine Suchanfrage braucht 0,3 g CO2. Wie viel bei 1000 Anfragen?", bereich: [280, 320], einheit: "g", op: "mal" },
  { text: "Ein Hahn tropft jede Sekunde 0,05 ml. Wie viele Liter im Jahr?", bereich: [1400, 1700], einheit: "l", op: "mal" },
];

export const FERMI: Record<string, FermiFrage[]> = {
  "3-21": STUFE3,
  "4-18": STUFE4,
  "5-19": STUFE5,
  "8-20": STUFE8,
};

/** Für Wächter: zu welchen Paketen gibt es Fermi-Fragen? */
export function fermiPakete(): string[] {
  return Object.keys(FERMI);
}

/**
 * Eine Fermi-Aufgabe bauen.
 *
 * Die Aufgabe trägt ihren Bereich mit - die Antwortprüfung vergleicht keine
 * Zeichenkette, sondern sieht nach, ob die Zahl darin liegt.
 */
export function fermiKern(paketId: string, rng: () => number): Kern {
  const vorrat = FERMI[paketId];
  if (!vorrat?.length) throw new Error(`Für ${paketId} gibt es keine Fermi-Fragen.`);
  const f = vorrat[Math.floor(rng() * vorrat.length)];
  const mitte = (f.bereich[0] + f.bereich[1]) / 2;
  const rund = mitte >= 100 ? Math.round(mitte / 10) * 10 : Math.round(mitte * 100) / 100;

  return {
    sorte: "direkt",
    eigeneArt: "fermi",
    op: f.op,
    angabe: saetzeUmbrechen(f.text),
    // Die Mitte ist die Musterantwort; gelten tut der ganze Bereich.
    loesung: f.einheit ? `${String(rund).replace(".", ",")} ${f.einheit}` : String(rund).replace(".", ","),
    bereich: f.bereich,
    zahlen: [],
  };
}
