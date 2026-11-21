/**
 * „Genau lesen" (Befund C2, Beleg im Ursprungs-Repository · Beleg im Ursprungs-Repository · Beleg im Ursprungs-Repository).
 * Gegen das Rechnen nach Schlüsselwörtern - drei Unterarten, abwechselnd:
 *
 *   a) Welche Zahl brauchst du nicht? - eine Geschichte mit einer
 *      überflüssigen Zahl.
 *   b) Kann man das ausrechnen? - manchmal fehlt die nötige Angabe.
 *   c) Welche Rechnung passt? - drei Rechnungen, genau eine passt; mit
 *      Fallen gegen das Wort „weniger"/„mehr" (die Falle rechnet, was das
 *      Wort suggeriert, nicht was der Satz sagt).
 *
 * Der Zahlenraum folgt der Stufe: 1-18 bis 20, 2-21 bis 100, 3-21 bis 1000,
 * 4-18 groß, aber im Kopf rechenbar (runde Zahlen in den Hunderten/
 * Tausendern statt wahllos bis zur Million).
 */
import { saetzeUmbrechen } from "@/lib/sprechen/ordnungszahl";
import { ganz, eines, gemischt, zahl, type Operation } from "../../aufgabe";
import { NochNichtGebaut } from "../nochNichtGebaut";
import type { Buchform } from "./typen";

const NAMEN = [
  "Amelie", "Noah", "Zoe", "Kaan", "Sofia", "Luca", "Amara", "Milan", "Greta", "Deniz",
  "Aylin", "Matteo", "Lina", "Samuel", "Yasmin", "Felix", "Nour", "Anton", "Priya", "Elias",
];

type Bereich = [number, number];

/* ------------------------------------------------------------------ */
/* a) Welche Zahl brauchst du nicht?                                    */
/* ------------------------------------------------------------------ */

interface VorlageA {
  /** `{a}`, `{b}`, `{c}`, `{n}` - eine der drei Zahlen ist überflüssig. */
  text: string;
  ueberfluessig: "a" | "b" | "c";
  bereich: { a: Bereich; b: Bereich; c: Bereich };
}

const A_STUFE1: VorlageA[] = [
  { text: "{n} ist {a} Jahre alt. {n} hat {b} Bonbons und isst {c}. Wie viele bleiben?",
    ueberfluessig: "a", bereich: { a: [5, 9], b: [6, 12], c: [1, 5] } },
  { text: "Im Bus sitzen {a} Kinder. Die Haltestelle hat Nummer {b}. {c} steigen aus. Wie viele bleiben?",
    ueberfluessig: "b", bereich: { a: [10, 18], b: [1, 20], c: [2, 6] } },
];

const A_STUFE2: VorlageA[] = [
  { text: "{n} wohnt in Haus Nummer {a}. {n} hat {b} Murmeln. Dazu kommen {c}. Wie viele sind es jetzt?",
    ueberfluessig: "a", bereich: { a: [1, 40], b: [20, 60], c: [10, 30] } },
  { text: "Der Zug fährt um {a} Uhr ab. An Bord sind {b} Personen. In {c} Wagen. Wie viele sitzen im Schnitt pro Wagen?",
    ueberfluessig: "a", bereich: { a: [6, 20], b: [40, 80], c: [2, 4] } },
];

const A_STUFE3: VorlageA[] = [
  { text: "{n} ist {a} cm groß. {n} kauft {b} Hefte zu {c} Euro. Wie viel kostet das?",
    ueberfluessig: "a", bereich: { a: [110, 170], b: [3, 9], c: [40, 90] } },
  { text: "Die Turnhalle hat {a} Fenster. {b} Kinder kommen. {c} gehen wieder. Wie viele bleiben?",
    ueberfluessig: "a", bereich: { a: [4, 30], b: [300, 900], c: [50, 250] } },
];

const A_STUFE4: VorlageA[] = [
  { text: "Das Dorf hat {a} Einwohner. Der Bus kostet {b} Euro. Er fährt {c} Mal im Jahr. Wie viel macht das im Jahr?",
    ueberfluessig: "a", bereich: { a: [800, 4000], b: [2, 8], c: [200, 900] } },
  { text: "{n} ist im Jahr {a} geboren. {n} spart {b} Euro im Monat. Das {c} Monate lang. Wie viel ist das?",
    ueberfluessig: "a", bereich: { a: [2010, 2020], b: [10, 40], c: [6, 18] } },
];

/* ------------------------------------------------------------------ */
/* b) Kann man das ausrechnen?                                          */
/* ------------------------------------------------------------------ */

interface VorlageB {
  text: string;
  moeglich: boolean;
  bereich: { a: Bereich; b: Bereich };
}

const B_STUFE1: VorlageB[] = [
  { text: "{n} hat {a} Stifte. {n} bekommt {b} dazu. Wie viele hat {n} jetzt?",
    moeglich: true, bereich: { a: [3, 10], b: [2, 8] } },
  { text: "{n} hat {a} Äpfel. Wie viele hat die Schwester?",
    moeglich: false, bereich: { a: [3, 12], b: [1, 1] } },
  { text: "Im Körbchen liegen {a} Eier. {b} zerbrechen. Wie viele bleiben ganz?",
    moeglich: true, bereich: { a: [6, 12], b: [1, 4] } },
  { text: "{n} malt {a} Bilder. Wie viele malt die Freundin von {n}?",
    moeglich: false, bereich: { a: [2, 8], b: [1, 1] } },
];

const B_STUFE2: VorlageB[] = [
  { text: "{n} hat {a} Euro. {n} kauft ein Heft um {b} Euro. Wie viel bleibt?",
    moeglich: true, bereich: { a: [20, 60], b: [4, 15] } },
  { text: "Der Bus hat {a} Plätze. Wie alt ist die Fahrerin?",
    moeglich: false, bereich: { a: [30, 60], b: [1, 1] } },
  { text: "In der Klasse sind {a} Kinder. {b} sind krank. Wie viele sind da?",
    moeglich: true, bereich: { a: [18, 28], b: [2, 6] } },
  { text: "{n} liest ein Buch mit {a} Seiten. Wie spannend ist es?",
    moeglich: false, bereich: { a: [40, 95], b: [1, 1] } },
];

const B_STUFE3: VorlageB[] = [
  { text: "Ein Bus hat {a} Sitze. Es sind {b} Reisende an Bord. Wie viele Plätze sind frei?",
    moeglich: true, bereich: { a: [200, 600], b: [80, 190] } },
  { text: "Der Zug hat {a} Waggons. Wie alt ist der Zugführer?",
    moeglich: false, bereich: { a: [4, 12], b: [1, 1] } },
  { text: "{n} hat {a} Euro gespart. {n} gibt {b} Euro aus. Wie viel bleibt?",
    moeglich: true, bereich: { a: [300, 900], b: [90, 280] } },
  { text: "Das Schiff wiegt {a} Tonnen. Wie schnell fährt es?",
    moeglich: false, bereich: { a: [200, 900], b: [1, 1] } },
];

const B_STUFE4: VorlageB[] = [
  { text: "Die Fabrik baut {a} Räder am Tag. Wie viele sind das in {b} Tagen?",
    moeglich: true, bereich: { a: [200, 900], b: [10, 40] } },
  { text: "Die Stadt hat {a} Einwohner. Wie viele davon haben ein Fahrrad?",
    moeglich: false, bereich: { a: [5000, 90000], b: [1, 1] } },
  { text: "Ein Saal fasst {a} Menschen. {b} Plätze sind besetzt. Wie viele sind frei?",
    moeglich: true, bereich: { a: [2000, 9000], b: [500, 1900] } },
  { text: "Der Fluss ist {a} km lang. Wie kalt ist das Wasser?",
    moeglich: false, bereich: { a: [50, 900], b: [1, 1] } },
];

/* ------------------------------------------------------------------ */
/* c) Welche Rechnung passt?                                            */
/* ------------------------------------------------------------------ */

interface VorlageC {
  text: string;
  bereichA: Bereich;
  bereichB: Bereich;
  /** Muss verschiedene Werte liefern als die beiden Fallen - sonst wäre die Rechnung mehrdeutig. */
  richtig: (a: number, b: number) => string;
  fallen: ((a: number, b: number) => string)[];
}

const C_STUFE1: VorlageC[] = [
  { text: "Tim hat {b} weniger als Ben. Tim hat {a}. Wie viele hat Ben?",
    bereichA: [3, 12], bereichB: [1, 6],
    richtig: (a, b) => `${a} +${b}`, fallen: [(a, b) => `${a} -${b}`, (a, b) => `${b} -${a}`] },
  { text: "{n} hat {b} mehr Sticker als Ida. {n} hat {a}. Wie viele hat Ida?",
    bereichA: [8, 18], bereichB: [1, 6],
    richtig: (a, b) => `${a} -${b}`, fallen: [(a, b) => `${a} +${b}`, (a, b) => `${b} -${a}`] },
];

const C_STUFE2: VorlageC[] = [
  { text: "Lea hat {b} weniger Karten als Mia. Lea hat {a}. Wie viele hat Mia?",
    bereichA: [15, 60], bereichB: [4, 20],
    richtig: (a, b) => `${a} +${b}`, fallen: [(a, b) => `${a} -${b}`, (a, b) => `${b} -${a}`] },
  { text: "{n} verteilt {a} Kekse auf {b} Teller. Wie viele kommen auf einen Teller?",
    bereichA: [12, 60], bereichB: [2, 6],
    richtig: (a, b) => `${a} /${b}`, fallen: [(a, b) => `${a} *${b}`, (a, b) => `${b} -${a}`] },
];

const C_STUFE3: VorlageC[] = [
  { text: "Der Bus hat {a} Leute. Der Zug hat {b} weniger. Wie viele sind im Zug?",
    bereichA: [200, 900], bereichB: [40, 190],
    richtig: (a, b) => `${a} -${b}`, fallen: [(a, b) => `${a} +${b}`, (a, b) => `${b} -${a}`] },
  { text: "{n} packt {b} Eier in jede Schachtel. Es gibt {a} Schachteln. Wie viele Eier sind das?",
    bereichA: [3, 9], bereichB: [30, 90],
    richtig: (a, b) => `${a} *${b}`, fallen: [(a, b) => `${a} +${b}`, (a, b) => `${a} -${b}`] },
];

const C_STUFE4: VorlageC[] = [
  { text: "Das Dorf hatte {a} Einwohner. Die Stadt hat {b} weniger. Wie viele hat die Stadt?",
    bereichA: [3000, 9000], bereichB: [200, 900],
    richtig: (a, b) => `${a} -${b}`, fallen: [(a, b) => `${a} +${b}`, (a, b) => `${b} -${a}`] },
  { text: "Ein Werk baut {b} Räder am Tag. Wie viele sind das in {a} Tagen?",
    bereichA: [10, 40], bereichB: [200, 900],
    richtig: (a, b) => `${a} *${b}`, fallen: [(a, b) => `${a} +${b}`, (a, b) => `${a} -${b}`] },
];

/* ------------------------------------------------------------------ */

function nachStufe<T>(stufe: number, s1: T[], s2: T[], s3: T[], s4: T[]): T[] {
  if (stufe <= 1) return s1;
  if (stufe === 2) return s2;
  if (stufe === 3) return s3;
  return s4;
}

/** Der Wert einer einfachen Rechnung `a +b`/`a -b`/`a *b`/`a /b` - für den Eindeutigkeitstest. */
/** ★ Exportiert für den Test: der Wert einer Rechnung, um die Eindeutigkeit unabhängig nachzuprüfen. */
export function wertVon(rechnung: string): number {
  const treffer = /^(-?\d+) ([+\-*/])(-?\d+)$/.exec(rechnung);
  if (!treffer) return NaN;
  const [, x, z, y] = treffer;
  const a = Number(x), b = Number(y);
  return z === "+" ? a + b : z === "-" ? a - b : z === "*" ? a * b : a / b;
}

function bauA(paket: string, stufe: number, rng: () => number) {
  const vorrat = nachStufe(stufe, A_STUFE1, A_STUFE2, A_STUFE3, A_STUFE4);
  for (let versuch = 0; versuch < 100; versuch++) {
    const v = eines(rng, vorrat);
    const a = ganz(rng, v.bereich.a[0], v.bereich.a[1]);
    const b = ganz(rng, v.bereich.b[0], v.bereich.b[1]);
    const c = ganz(rng, v.bereich.c[0], v.bereich.c[1]);
    if (a === b || b === c || a === c) continue; // Alle Zahlen verschieden.
    const name = eines(rng, NAMEN);
    const werte = { a, b, c };
    const angabe = saetzeUmbrechen(
      v.text
        .replace(/\{a\}/g, zahl(a)).replace(/\{b\}/g, zahl(b)).replace(/\{c\}/g, zahl(c))
        .replace(/\{n\}/g, name),
    );
    return {
      paket, art: "lesen" as const, op: "zahlen" as const, angabe,
      loesung: zahl(werte[v.ueberfluessig]),
      zahlen: [a, b, c],
    };
  }
  throw new NochNichtGebaut(paket, "lesen");
}

function bauB(paket: string, stufe: number, rng: () => number) {
  const vorrat = nachStufe(stufe, B_STUFE1, B_STUFE2, B_STUFE3, B_STUFE4);
  const v = eines(rng, vorrat);
  const a = ganz(rng, v.bereich.a[0], v.bereich.a[1]);
  const b = ganz(rng, v.bereich.b[0], v.bereich.b[1]);
  const name = eines(rng, NAMEN);
  const angabe = saetzeUmbrechen(
    v.text.replace(/\{a\}/g, zahl(a)).replace(/\{b\}/g, zahl(b)).replace(/\{n\}/g, name),
  ) + "\nKann man das ausrechnen?";
  return {
    paket, art: "lesen" as const, op: "zahlen" as const, angabe,
    loesung: v.moeglich ? "ja" : "nein",
    auchRichtig: v.moeglich ? ["stimmt", "richtig"] : ["stimmt nicht", "falsch", "geht nicht"],
    zahlen: [a, b],
  };
}

const OP_FUER_ZEICHEN = { "+": "plus", "-": "minus", "*": "mal", "/": "geteilt" } as const;

function bauC(paket: string, stufe: number, rng: () => number) {
  const vorrat = nachStufe(stufe, C_STUFE1, C_STUFE2, C_STUFE3, C_STUFE4);
  for (let versuch = 0; versuch < 100; versuch++) {
    const v = eines(rng, vorrat);
    const a = ganz(rng, v.bereichA[0], v.bereichA[1]);
    const b = ganz(rng, v.bereichB[0], v.bereichB[1]);
    if (v.richtig(a, b).includes("/") && a % b !== 0) continue; // Division muss aufgehen.
    const optionen = [v.richtig(a, b), ...v.fallen.map((f) => f(a, b))];
    const werte = optionen.map(wertVon);
    // ★ Eindeutigkeit: der Wert der richtigen Rechnung darf bei keiner Falle
    // zufällig noch einmal vorkommen - sonst passten zwei Buchstaben.
    if (werte.filter((w) => w === werte[0]).length > 1) continue;
    if (werte.some((w) => Number.isNaN(w))) continue;

    const name = eines(rng, NAMEN);
    const geschichte = saetzeUmbrechen(
      v.text.replace(/\{a\}/g, zahl(a)).replace(/\{b\}/g, zahl(b)).replace(/\{n\}/g, name),
    );
    const reihenfolge = gemischt(rng, [0, 1, 2]);
    const buchstaben = ["a", "b", "c"] as const;
    const zeilen = reihenfolge.map((i, pos) => `${buchstaben[pos]}) ${optionen[i]}`);
    const richtigeStelle = reihenfolge.indexOf(0);
    const angabe = `${geschichte}\n${zeilen.join("\n")}\nWelche Rechnung passt?`;
    const zeichen = /[+\-*/]/.exec(optionen[0])?.[0] as keyof typeof OP_FUER_ZEICHEN | undefined;
    const op: Operation = zeichen ? OP_FUER_ZEICHEN[zeichen] : "zahlen";
    return {
      paket, art: "lesen" as const, op,
      angabe,
      loesung: buchstaben[richtigeStelle],
      auchRichtig: [optionen[0]],
      zahlen: [a, b],
    };
  }
  throw new NochNichtGebaut(paket, "lesen");
}

export const lesen: Buchform = ({ paket, rng, stufe }) => {
  const unterart = eines(rng, ["a", "b", "c"] as const);
  if (unterart === "a") return bauA(paket, stufe, rng);
  if (unterart === "b") return bauB(paket, stufe, rng);
  return bauC(paket, stufe, rng);
};
