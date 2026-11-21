/**
 * „Wie rechnest du das?" - die Strategiewahl für die Pakete 5-18, 6-23 und 7-19.
 *
 * ★ Warum diese beiden Pakete eigene Aufgaben brauchen: Die allgemeine Form
 * `strategiewahl` leitet den besten Weg aus ZWEI Zahlen und einem Zeichen ab -
 * „701 -698" verlangt Ergänzen, „734 -251" nicht. Hier geht es aber um Terme:
 * `13 *7 +13 *3` und `30 % von 250`. Aus denen lässt sich der Weg nicht mit
 * derselben Regel ableiten, und raten wäre schlimmer als gar keine Aufgabe -
 * das Kind lernte einen falschen Weg als den besten.
 *
 * Deshalb steht bei jedem Term, welcher Weg viel spart und welche beiden
 * Wege zwar gangbar, aber mühsam sind. Die Ablenker sind nie unsinnig: ein
 * Kind soll wählen, nicht ausschließen.
 *
 * Quelle der Wege: die Strategie-Spalte des Stoffplans zu 6-23 („Kürzen vor
 * dem Rechnen oder der 10-Prozent-Weg") und 7-19 („Herausheben oder
 * Umstellen").
 */
import { eines, gemischt, ganz, zahl, type Aufgabenart, type Operation } from "../aufgabe";
import type { Kern, Zufall } from "./kerne";

interface Wahl {
  /**
   * Die Rechenart. ★ Nicht pauschal „gemischt": daran hängt, was die
   * Vorlesefunktion sagt und welche Grenzen die Stufe prüft. Stufe 6 lässt in
   * gemischten Aufgaben nur Plus und Minus zu - ein Prozentweg ist „prozent",
   * ein gekürzter Bruch „bruch".
   */
  op: Operation;
  /** Der Term, wie er auf der Zeile steht. */
  angabe: (rng: Zufall) => { zeile: string; zahlen: number[] };
  /** Der Weg, der viel spart - er steht zuerst und ist die richtige Antwort. */
  spart: string;
  /** Zwei gangbare, aber mühsame Wege. */
  muehsam: [string, string];
}

/** Eine Dezimalzahl mit genau einer Nachkommastelle, `lo` bis `hi` Zehntel - nie ganz. */
const zehntel = (r: Zufall, lo: number, hi: number) => {
  let z = ganz(r, lo, hi);
  while (z % 10 === 0) z = ganz(r, lo, hi);
  return z / 10;
};

/**
 * 5-18: Herausheben und Umstellen - mit Dezimalzahlen.
 *
 * ★ Der Stoffplan: „Aufgaben, die sich durch Herausheben oder Umstellen stark
 * verkürzen" (Krauthausen). Bis 23.09.2026 kamen hier gewöhnliche Plus- und
 * Minusaufgaben mit den Wegen der Grundstufe - „Zum Zehner ergänzen" für
 * `122,59 -103,01`, und einmal „undefined". Jetzt dieselbe Bauart wie 7-19:
 * jede Aufgabe ist so gebaut, dass EIN Weg sie stark verkürzt.
 */
const WAHLEN_5: Wahl[] = [
  {
    op: "mal",
    angabe: (r) => {
      const f = zehntel(r, 11, 99); const a = ganz(r, 2, 8);
      return { zeile: `${zahl(f)} *${a} +${zahl(f)} *${10 - a} =`, zahlen: [f, a, 10 - a] };
    },
    spart: "Den gleichen Faktor herausheben",
    muehsam: ["Beide Teile einzeln rechnen", "Von links nach rechts"],
  },
  {
    op: "mal",
    angabe: (r) => {
      const a = zehntel(r, 11, 89); const f = ganz(r, 3, 9);
      return { zeile: `${zahl(a)} *${f} +${zahl(10 - a)} *${f} =`, zahlen: [a, f, 10 - a] };
    },
    spart: "Den gleichen Faktor herausheben",
    muehsam: ["Beide Teile einzeln rechnen", "Von links nach rechts"],
  },
  {
    op: "mal",
    angabe: (r) => {
      const f = zehntel(r, 11, 99); const c = ganz(r, 1, 7);
      return { zeile: `${zahl(f)} *${10 + c} -${zahl(f)} *${c} =`, zahlen: [f, 10 + c, c] };
    },
    spart: "Den gleichen Faktor herausheben",
    muehsam: ["Beide Teile einzeln rechnen", "Von links nach rechts"],
  },
  {
    op: "plus",
    angabe: (r) => {
      const a = zehntel(r, 11, 89); const b = ganz(r, 101, 999) / 100;
      return { zeile: `${zahl(a)} +${zahl(b)} +${zahl(10 - a)} =`, zahlen: [a, b, 10 - a] };
    },
    spart: "Die beiden zu 10 zusammenfassen",
    muehsam: ["Der Reihe nach", "Die größten zuerst"],
  },
  {
    op: "plus",
    angabe: (r) => {
      const a = eines(r, [0.25, 0.4, 0.75, 0.6, 0.3, 0.8] as const); const b = zehntel(r, 11, 99);
      return { zeile: `${zahl(a)} +${zahl(b)} +${zahl(1 - a)} =`, zahlen: [a, b, 1 - a] };
    },
    spart: "Die beiden zu 1 zusammenfassen",
    muehsam: ["Der Reihe nach", "Die größten zuerst"],
  },
  {
    op: "mal",
    angabe: (r) => {
      const m = zehntel(r, 11, 99);
      return { zeile: `2,5 *${zahl(m)} *4 =`, zahlen: [2.5, m, 4] };
    },
    spart: "2,5 mal 4 zuerst",
    muehsam: ["Der Reihe nach", "Den mittleren Faktor zerlegen"],
  },
];

/** 6-23: Kürzen vor dem Rechnen und der 10-Prozent-Weg. */
const WAHLEN_6: Wahl[] = [
  {
    op: "prozent",
    angabe: (r) => { const g = ganz(r, 12, 90) * 10; return { zeile: `30 % von ${g} =`, zahlen: [g, 30] }; },
    spart: "Zehn Prozent nehmen, dann mal 3",
    muehsam: ["Durch 100, dann mal 30", "Der Reihe nach rechnen"],
  },
  {
    op: "prozent",
    angabe: (r) => { const g = ganz(r, 10, 80) * 4; return { zeile: `25 % von ${g} =`, zahlen: [g, 25] }; },
    spart: "Vierteln",
    muehsam: ["Zehn Prozent, dann mal 2,5", "Durch 100, dann mal 25"],
  },
  {
    op: "prozent",
    angabe: (r) => { const g = ganz(r, 20, 200) * 2; return { zeile: `50 % von ${g} =`, zahlen: [g, 50] }; },
    spart: "Halbieren",
    muehsam: ["Zehn Prozent, dann mal 5", "Durch 100, dann mal 50"],
  },
  {
    op: "prozent",
    angabe: (r) => { const g = ganz(r, 10, 60) * 10; return { zeile: `20 % von ${g} =`, zahlen: [g, 20] }; },
    spart: "Zehn Prozent nehmen, dann verdoppeln",
    muehsam: ["Durch 5 teilen", "Durch 100, dann mal 20"],
  },
  {
    op: "bruch",
    angabe: (r) => { const n = ganz(r, 2, 9); return { zeile: `${n * 6}/${n * 8} =`, zahlen: [n * 6, n * 8] }; },
    spart: "Zuerst kürzen",
    muehsam: ["Als Dezimalzahl rechnen", "Zähler und Nenner einzeln teilen"],
  },
  {
    op: "bruch",
    angabe: (r) => { const n = ganz(r, 3, 12); return { zeile: `${n * 4}/${n * 10} *5 =`, zahlen: [n * 4, n * 10, 5] }; },
    spart: "Zuerst kürzen, dann malnehmen",
    muehsam: ["Zuerst malnehmen, dann kürzen", "Alles ausrechnen"],
  },
];

/** 7-19: Herausheben und Umstellen. */
const WAHLEN_7: Wahl[] = [
  {
    op: "mal",
    angabe: (r) => { const f = ganz(r, 7, 19); const a = ganz(r, 2, 8); return { zeile: `${f} *${a} +${f} *${10 - a} =`, zahlen: [f, a, 10 - a] }; },
    spart: "Den gleichen Faktor herausheben",
    muehsam: ["Beide Teile einzeln rechnen", "Von links nach rechts"],
  },
  {
    op: "mal",
    angabe: (r) => { const m = ganz(r, 11, 29); return { zeile: `25 *${m} *4 =`, zahlen: [25, m, 4] }; },
    spart: "25 mal 4 zuerst",
    muehsam: ["Der Reihe nach", "Den mittleren Faktor zerlegen"],
  },
  {
    op: "mal",
    angabe: (r) => { const m = ganz(r, 3, 9); return { zeile: `98 *${m} =`, zahlen: [98, m] }; },
    spart: "Auf 100 gehen und wieder abziehen",
    muehsam: ["Stellenweise malnehmen", "Schriftlich rechnen"],
  },
  {
    op: "mal",
    angabe: (r) => { const a = ganz(r, 12, 40); const b = ganz(r, 3, 9); return { zeile: `${a} *${b} -${a} *${b - 1} =`, zahlen: [a, b, b - 1] }; },
    spart: "Den gleichen Faktor herausheben",
    muehsam: ["Beide Teile einzeln rechnen", "Von links nach rechts"],
  },
  {
    op: "plus",
    angabe: (r) => { const a = ganz(r, 6, 24); return { zeile: `${a} +${a} +${a} +${a} =`, zahlen: [a] }; },
    spart: "Mal 4 rechnen",
    muehsam: ["Der Reihe nach zusammenzählen", "Zweimal verdoppeln"],
  },
  {
    op: "plus",
    angabe: (r) => { const a = ganz(r, 20, 90); const b = ganz(r, 11, 49); return { zeile: `${a} +${b} +${100 - a} =`, zahlen: [a, b, 100 - a] }; },
    spart: "Die beiden zu 100 zusammenfassen",
    muehsam: ["Der Reihe nach", "Die größten zuerst"],
  },
];

const WAHLEN: Record<string, Wahl[]> = { "5-18": WAHLEN_5, "6-23": WAHLEN_6, "7-19": WAHLEN_7 };

/** Für Wächter: für welche Pakete gibt es eigene Wege? */
export function strategiePakete(): string[] {
  return Object.keys(WAHLEN);
}

/**
 * Eine Strategiewahl bauen - oder eine Fehlersuche, denn beide Formen stellen
 * dieselbe Frage von zwei Seiten.
 *
 * Der Aufbau ist genau der der allgemeinen Form: Term, Frage, drei Wege mit
 * a), b), c). So klingt es in der Vorlesefunktion gleich, und die Antwort ist
 * überall derselbe Buchstabe.
 */
export function strategieKern(
  paketId: string, rng: Zufall, art: Aufgabenart = "strategiewahl",
): Extract<Kern, { sorte: "direkt" }> {
  const vorrat = WAHLEN[paketId];
  if (!vorrat?.length) throw new Error(`Für ${paketId} gibt es keine Wege.`);
  const w = eines(rng, vorrat);
  const { zeile, zahlen } = w.angabe(rng);

  if (art === "fehler_finden") {
    // Dieselbe Sache von der anderen Seite: EIN Weg passt nicht.
    const falsch = eines(rng, w.muehsam);
    const reihe = gemischt(rng, [
      { text: w.spart, passt: true },
      { text: falsch, passt: true },
      { text: "Die Zahlen vertauschen, dann minus", passt: false },
    ]);
    const marken = ["a", "b", "c"];
    const zeilen = reihe.map((e, i) => `${marken[i]}) ${e.text}`);
    return {
      sorte: "direkt",
      eigeneArt: "fehler_finden",
      op: w.op,
      angabe: `${zeile}\nWelcher Weg passt hier nicht?\n${zeilen.join("\n")}`,
      loesung: marken[reihe.findIndex((e) => !e.passt)],
      zahlen,
    };
  }

  const reihe = gemischt(rng, [
    { text: w.spart, richtig: true },
    { text: w.muehsam[0], richtig: false },
    { text: w.muehsam[1], richtig: false },
  ]);
  const marken = ["a", "b", "c"];
  const zeilen = reihe.map((e, i) => `${marken[i]}) ${e.text}`);
  return {
    sorte: "direkt",
    eigeneArt: "strategiewahl",
    op: w.op,
    angabe: `${zeile}\nWie rechnest du das am besten?\n${zeilen.join("\n")}`,
    loesung: marken[reihe.findIndex((e) => e.richtig)],
    auchRichtig: [w.spart],
    zahlen,
  };
}
