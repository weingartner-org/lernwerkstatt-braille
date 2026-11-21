/**
 * Plus - die Kerne der Stufe 6, die im Werkzeugkasten fehlen.
 *
 * Die Stufe 6 lebt fast vollständig von `kerne-zahlbereiche.ts` - Teiler,
 * Vielfache, Primfaktoren, ggT/kgV, Bruchrechnung, negative Zahlen, Prozent
 * gibt es dort schon fertig. Diese Datei baut nur die vier Stücke dazu, die
 * dort fehlen:
 *
 * - Bruch mal/geteilt durch eine natürliche Zahl (6-13, 6-15): `bruchRechnung`
 *   verlangt für beide Seiten einen Nenner ab 2 - eine natürliche Zahl ist
 *   aber ein Bruch mit Nenner 1.
 * - Bruch geteilt durch Bruch mit garantiert kürzbarem Ergebnis (6-16): der
 *   Kehrwert-Weg soll sich zeigen, dazu muss das Ergebnis kürzbar sein - das
 *   liefert `bruchRechnung` nicht mit Absicht.
 * - Verbindung der Rechenarten mit Brüchen, zwei Operationen und einer
 *   Klammer (6-17): dafür gibt es noch keine Bauart.
 *
 * Dieselbe Schreibweise wie in `kerne-zahlbereiche.ts`: gekürzt, als
 * gemischte Zahl, wenn der Bruch unecht ist.
 */
import { ganz, eines } from "../aufgabe";
import type { Kern, Zufall } from "./kerne";
import { bruchRechnung, type BruchRechnungP } from "./kerne-zahlbereiche";

/** Größter gemeinsamer Teiler - dieselbe kleine Rechnung wie überall sonst. */
export function ggt(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    [a, b] = [b, a % b];
  }
  return a || 1;
}

/** (Zähler, Nenner) kürzen; der Nenner bleibt positiv. */
function kuerzeZN(z: number, n: number): [number, number] {
  if (n < 0) {
    z = -z;
    n = -n;
  }
  const g = ggt(z, n);
  return [z / g, n / g];
}

/** Bruch, ungekürzt - für die Angabe. Eine natürliche Zahl steht ohne Nenner. */
function bruchRoh(z: number, n: number): string {
  return n === 1 ? String(z) : `${z}/${n}`;
}

/** Bruch in der Schreibweise der Bücher: gekürzt, als gemischte Zahl wenn unecht. */
function bruchText(z: number, n: number): string {
  if (z === 0) return "0";
  const [zz, nn] = kuerzeZN(z, n);
  const vz = zz < 0 ? "-" : "";
  const az = Math.abs(zz);
  if (nn === 1) return `${vz}${az}`;
  if (az < nn) return `${vz}${az}/${nn}`;
  const ganzzahl = Math.floor(az / nn);
  const rest = az % nn;
  return rest === 0 ? `${vz}${ganzzahl}` : `${vz}${ganzzahl} ${rest}/${nn}`;
}

/* ================================================================== */
/* 6-13 Bruch mal natürliche Zahl                                       */
/* ================================================================== */

export interface BruchMalNatuerlichP {
  nennerMax: number;
  faktorMax: number;
}

/** Bruch mal natürliche Zahl: nur der Zähler wird vervielfacht. */
export function bruchMalNatuerlich(rng: Zufall, p: BruchMalNatuerlichP): Kern {
  const nennerMax = Math.max(4, p.nennerMax);
  const faktorMax = Math.max(2, p.faktorMax);
  const n = ganz(rng, 2, nennerMax);
  const z = ganz(rng, 1, n - 1);
  const c = ganz(rng, 2, faktorMax);
  const angabe = `${bruchRoh(z, n)} *${c} =`;
  return { sorte: "direkt", op: "bruch", angabe, loesung: bruchText(z * c, n), zahlen: [z, n, c] };
}

/* ================================================================== */
/* 6-15 Bruch geteilt durch natürliche Zahl                             */
/* ================================================================== */

export interface BruchGeteiltNatuerlichP {
  nennerMax: number;
  divisorMax: number;
}

/** Bruch geteilt durch natürliche Zahl: der Nenner wird vervielfacht. */
export function bruchGeteiltNatuerlich(rng: Zufall, p: BruchGeteiltNatuerlichP): Kern {
  const nennerMax = Math.max(4, p.nennerMax);
  const divisorMax = Math.max(2, p.divisorMax);
  const n = ganz(rng, 2, nennerMax);
  const z = ganz(rng, 1, n - 1);
  const c = ganz(rng, 2, divisorMax);
  const angabe = `${bruchRoh(z, n)} /${c} =`;
  return { sorte: "direkt", op: "bruch", angabe, loesung: bruchText(z, n * c), zahlen: [z, n, c] };
}

/* ================================================================== */
/* 6-16 Bruch geteilt durch Bruch, Ergebnis garantiert kürzbar          */
/* ================================================================== */

/**
 * Wie `bruchRechnung(rng, "geteilt", p)`, aber es wird so lange neu
 * gewürfelt, bis das Ergebnis vor dem Kürzen einen gemeinsamen Teiler hat -
 * sonst zeigt sich der Kehrwert-Weg nicht als Vorteil.
 */
export function bruchGeteiltKuerzbar(rng: Zufall, p: BruchRechnungP): Kern {
  for (let versuch = 0; versuch < 200; versuch++) {
    const k = bruchRechnung(rng, "geteilt", p);
    if (k.sorte === "direkt") {
      const [za, na, zb, nb] = k.zahlen;
      if (ggt(za * nb, na * zb) > 1) return k;
    }
  }
  return bruchRechnung(rng, "geteilt", p);
}

/* ================================================================== */
/* 6-17 Verbindung der Rechenarten mit Brüchen                          */
/* ================================================================== */

export interface BruchVerbindungP {
  /** Nenner der beiden Brüche in der Klammer - dieselbe Zahl, gleichnamig. */
  nennerMax: number;
  /** Nenner des dritten Bruchs, außerhalb der Klammer. */
  nennerMaxAussen: number;
}

/**
 * (Bruch +/-Bruch) *Bruch - zwei Operationen, eine Klammer. Die beiden
 * Brüche in der Klammer sind gleichnamig, damit die Addition/Subtraktion
 * für sich allein schon aus 6-09/6-11 bekannt ist und die neue Schwierigkeit
 * allein der Vorrang und die Klammer sind. Eine Subtraktion ergibt nie ein
 * negatives Zwischenergebnis - wie überall in dieser Stufe.
 */
export function bruchVerbindung(rng: Zufall, p: BruchVerbindungP): Kern {
  // ★ Beim Minus nie zweimal derselbe Bruch: `(3/5 -3/5) *4/7` ist immer 0,
  // und die Multiplikation daneben fragt nichts mehr ab. Gemessen am
  // 23.09.2026 - vier von sechs Aufgaben eines Laufs. Dafür braucht das
  // Minus mindestens Drittel: bei Halben gibt es nur 1/2.
  const op1 = eines(rng, ["+", "-"] as const);
  const d = ganz(rng, op1 === "-" ? 3 : 2, Math.max(3, p.nennerMax));
  let za = ganz(rng, 1, d - 1);
  let zb = ganz(rng, 1, d - 1);
  if (op1 === "-") {
    while (za === zb) zb = ganz(rng, 1, d - 1);
    if (za < zb) [za, zb] = [zb, za];
  }
  const zwischenZ = op1 === "+" ? za + zb : za - zb;
  const [zwZ, zwN] = kuerzeZN(zwischenZ, d);

  const nc = ganz(rng, 2, Math.max(2, p.nennerMaxAussen));
  const zc = ganz(rng, 1, nc - 1);

  const ergZ = zwZ * zc;
  const ergN = zwN * nc;
  const angabe = `(${bruchRoh(za, d)} ${op1}${bruchRoh(zb, d)}) *${bruchRoh(zc, nc)} =`;
  return {
    sorte: "direkt", op: "bruch", angabe, loesung: bruchText(ergZ, ergN),
    zahlen: [za, zb, d, zc, nc],
  };
}
