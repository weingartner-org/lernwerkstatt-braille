/**
 * Plus - die Kerne der Stufe 7, die in `kerne-zahlbereiche.ts` noch fehlen.
 *
 * Stufe 7: „jetzt wird das Rechnen allgemein" - rationale Zahlen mit allen
 * vier Rechenarten, Potenzen, Terme, Gleichungen, Verhältnisse, Prozent mit
 * Zu- und Abnahme. Für die meisten Pakete reicht der Werkzeugkasten aus
 * `kerne-zahlbereiche.ts` (siehe `zuordnung-stufe7.ts`) - hier steht nur,
 * was dort wirklich fehlt: Potenzen von Brüchen/Dezimalzahlen, eine Vorrang-
 * Aufgabe, die Potenz UND Vorzeichen wirklich entscheiden lässt, das
 * Umformen von Gleichungen, und die Änderung um einen Prozentsatz.
 */
import { ganz, eines } from "../aufgabe";
import type { Kern, Zufall } from "./kerne";

function ggT(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    [a, b] = [b, a % b];
  }
  return a || 1;
}

/* ================================================================== */
/* Potenzen von Dezimalzahlen und Brüchen (7-08)                        */
/* ================================================================== */

export interface PotenzBruchDezimalP {
  /** Höchster Exponent, mindestens 2. */
  exponentMax?: number;
}

/**
 * Eine einstellige Dezimalzahl (0,1 bis 0,9) oder ein echter Bruch, jeweils
 * hoch 2 oder 3. Beide Zweige rechnen mit ganzen Zählern, damit kein
 * Fließkomma-Rauschen entsteht - „0,3^2 =0,09", nie „0,0899999...".
 */
export function potenzBruchDezimal(rng: Zufall, p: PotenzBruchDezimalP = {}): Kern {
  const exponentMax = Math.max(2, p.exponentMax ?? 3);
  const exponent = ganz(rng, 2, exponentMax);
  const art = eines(rng, ["dezimal", "bruch"] as const);

  if (art === "dezimal") {
    const z = ganz(rng, 1, 9);
    const wertRoh = Math.pow(z, exponent);
    const loesung = `0,${String(wertRoh).padStart(exponent, "0")}`;
    return { sorte: "direkt", op: "potenz", angabe: `0,${z}^${exponent} =`, loesung, zahlen: [z, exponent] };
  }

  const n = ganz(rng, 2, 5);
  let zTop = ganz(rng, 1, n - 1);
  for (let v = 0; v < 20 && ggT(zTop, n) !== 1; v++) zTop = ganz(rng, 1, n - 1);
  const zaehler = Math.pow(zTop, exponent);
  const nenner = Math.pow(n, exponent);
  return {
    sorte: "direkt", op: "potenz", angabe: `(${zTop}/${n})^${exponent} =`,
    loesung: `${zaehler}/${nenner}`, zahlen: [zTop, n, exponent],
  };
}

/* ================================================================== */
/* Vorrangregeln mit Potenzen (7-11)                                    */
/* ================================================================== */

export interface VorrangMitPotenzP {
  zahlMax: number;
  /** Basis der Potenz, mindestens 2. */
  basisMax?: number;
}

/**
 * Drei Zahlen, ein Mal-Zeichen, ein Plus-oder-Minus, eine Potenz - so
 * angeordnet, dass „Klammer, Potenz, Punkt, Strich" das Ergebnis wirklich
 * ändert: von links nach rechts gerechnet käme etwas anderes heraus, weil
 * einmal die Potenz und einmal das Mal-Zeichen vor dem Strich-Zeichen liegt.
 * Die Stelle des Mal-Zeichens (vorne oder hinten) wechselt.
 */
export function vorrangMitPotenz(rng: Zufall, p: VorrangMitPotenzP): Kern {
  const zahlMax = Math.max(2, p.zahlMax);
  const basisMax = Math.max(2, p.basisMax ?? 9);
  const exponent = eines(rng, [2, 3] as const);
  const a = ganz(rng, 1, zahlMax);
  const b = ganz(rng, 1, zahlMax);
  const c = ganz(rng, 2, basisMax);
  const addSub = eines(rng, ["+", "-"] as const);
  const malVorne = rng() < 0.5;
  const potenzWert = Math.pow(c, exponent);

  if (malVorne) {
    const wert = addSub === "+" ? a * b + potenzWert : a * b - potenzWert;
    const angabe = `${a} *${b} ${addSub}${c}^${exponent} =`;
    return { sorte: "direkt", op: "term", angabe, loesung: String(wert), zahlen: [a, b, c, exponent] };
  }
  const wert = addSub === "+" ? a + b * potenzWert : a - b * potenzWert;
  const angabe = `${a} ${addSub}${b} *${c}^${exponent} =`;
  return { sorte: "direkt", op: "term", angabe, loesung: String(wert), zahlen: [a, b, c, exponent] };
}

/* ================================================================== */
/* Gleichungen umformen (7-15)                                          */
/* ================================================================== */

export interface GleichungP {
  koeffMax: number;
  /** Ohne Angabe: einschrittig und zweischrittig gemischt. */
  zweischrittig?: boolean;
}

/**
 * Äquivalenzumformung mit ganzzahliger Lösung. Einschrittig: „x +5 =12"
 * oder „3x =12". Zweischrittig: „3x +5 =20". Die Zahlen sind so gebaut,
 * dass die Division immer aufgeht.
 */
export function gleichungLoesen(rng: Zufall, p: GleichungP): Kern {
  const koeffMax = Math.max(2, p.koeffMax);
  const zweischrittig = p.zweischrittig ?? rng() < 0.5;
  const spanne = Math.max(2, Math.floor(koeffMax / 2));

  if (!zweischrittig) {
    const art = eines(rng, ["additiv", "multiplikativ"] as const);
    if (art === "additiv") {
      const x = ganz(rng, -koeffMax, koeffMax);
      let b = ganz(rng, -koeffMax, koeffMax);
      if (b === 0) b = 1;
      const c = x + b;
      const bText = b < 0 ? `-${Math.abs(b)}` : `+${b}`;
      return { sorte: "direkt", op: "term", angabe: `x ${bText} =${c}`, loesung: String(x), zahlen: [x, b, c] };
    }
    const a = ganz(rng, 2, koeffMax);
    const x = ganz(rng, -spanne, spanne);
    const c = a * x;
    return { sorte: "direkt", op: "term", angabe: `${a}x =${c}`, loesung: String(x), zahlen: [a, x, c] };
  }

  const a = ganz(rng, 2, koeffMax);
  const x = ganz(rng, -spanne, spanne);
  let b = ganz(rng, -koeffMax, koeffMax);
  if (b === 0) b = 1;
  const c = a * x + b;
  const bText = b < 0 ? `-${Math.abs(b)}` : `+${b}`;
  return { sorte: "direkt", op: "term", angabe: `${a}x ${bText} =${c}`, loesung: String(x), zahlen: [a, x, b, c] };
}

/* ================================================================== */
/* Prozent: Zu- und Abnahme (7-17)                                      */
/* ================================================================== */

export interface ProzentAenderungP {
  /** Höchster Grundwert. Wird auf ein Vielfaches von 20 gerundet. */
  grundwertMax: number;
  /** Prozentsätze, die vorkommen - laut Auftrag zwischen 5 und 50. */
  saetze?: readonly number[];
}

const AENDERUNGS_SAETZE = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50] as const;

/**
 * Ein Grundwert nimmt um einen Prozentsatz zu oder ab - der Änderungsfaktor
 * dahinter steckt in einer zweiten Fassung: „Zunahme um 15 %" ist derselbe
 * Wert wie „Faktor 115 %". Grundwert (Vielfaches von 20) und Prozentsatz
 * (Vielfaches von 5) sind so gewählt, dass die Änderung immer ganzzahlig ist.
 */
export function prozentAenderung(rng: Zufall, p: ProzentAenderungP): Kern {
  const saetze = p.saetze ?? AENDERUNGS_SAETZE;
  const satz = eines(rng, saetze);
  const grundwert = 20 * ganz(rng, 1, Math.max(1, Math.floor(p.grundwertMax / 20)));
  const richtung = eines(rng, ["zunahme", "abnahme"] as const);
  const differenz = (grundwert * satz) / 100;
  const neuerWert = richtung === "zunahme" ? grundwert + differenz : grundwert - differenz;
  const wort = richtung === "zunahme" ? "erhöht" : "verringert";
  const angabe = `${grundwert} um ${satz} % ${wort} =`;
  const faktor = richtung === "zunahme" ? 100 + satz : 100 - satz;
  const wortGross = richtung === "zunahme" ? "Zunahme" : "Abnahme";
  return {
    sorte: "direkt", op: "prozent", angabe, loesung: String(neuerWert),
    varianten: [{ angabe: `${wortGross} um ${satz} %: Faktor in % =`, loesung: `${faktor} %` }],
    zahlen: [grundwert, satz, neuerWert],
  };
}
