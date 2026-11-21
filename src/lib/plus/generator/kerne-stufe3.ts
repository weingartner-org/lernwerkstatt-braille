/**
 * Plus - zusätzliche Kerne für Stufe 3 (Tausenderraum, schriftliche Verfahren).
 *
 * Ergänzt `kerne.ts` um das, was der Tausenderraum neu braucht: Runden,
 * Überschlag, 1000 teilen, die schriftlichen Verfahren mit echter
 * Übertrags-/Ausleihzählung über mehrere Stellen, die Hilfsaufgabe (eine
 * Zahl dicht an einer glatten Zahl) und das Zehner-Einmaleins.
 *
 * `kerne.ts` selbst bleibt unverändert - das Zusammenführen mit den anderen
 * Stufen in eine gemeinsame Datei ist ein eigener, späterer Schritt.
 */
import { ganz, eines, rechnungMit, zahl, ZEICHEN } from "../aufgabe";
import type { Kern, Zufall } from "./kerne";

/* ------------------------------------------------------------------ */
/* Runden                                                               */
/* ------------------------------------------------------------------ */

export type Rundungsstelle = "zehner" | "hunderter";

/** Auf die genannte Stelle runden - ab der Fünf wird aufgerundet. */
function rundeAuf(z: number, stufe: number): number {
  return Math.floor(z / stufe + 0.5) * stufe;
}

export interface RundenP { min: number; max: number; stellen?: readonly Rundungsstelle[] }

/** Eine Zahl auf Zehner oder Hunderter runden. */
export function runden(rng: Zufall, p: RundenP): Kern {
  const stelle = eines(rng, p.stellen ?? (["zehner", "hunderter"] as const));
  const stufe = stelle === "zehner" ? 10 : 100;
  const z = ganz(rng, p.min, p.max);
  const wort = stelle === "zehner" ? "Zehner" : "Hunderter";
  return {
    sorte: "direkt", op: "zahlen",
    angabe: `Runde ${z} auf ${wort}.`,
    loesung: String(rundeAuf(z, stufe)),
    zahlen: [z],
  };
}

/* ------------------------------------------------------------------ */
/* Überschlag                                                           */
/* ------------------------------------------------------------------ */

export interface UeberschlagP { min: number; max: number }

/**
 * Eine Plus- oder Minusaufgabe, zu der zuerst der Überschlag gefragt ist.
 * Die Lösung ist die vollständige gerundete Rechnung, z. B. „500 -100 =400".
 */
export function ueberschlagKern(rng: Zufall, p: UeberschlagP): Kern {
  const op = eines(rng, ["plus", "minus"] as const);
  let a = 0, b = 0, ga = 0, gb = 0;
  // ★ Kein Überschlag, der 0 ergibt: `834 -767` wurde zu `800 -800 =0` - das
  // schätzt nichts (gemessen 23.09.2026).
  for (let v = 0; v < 100; v++) {
    a = ganz(rng, p.min, p.max);
    b = ganz(rng, p.min, p.max);
    if (op === "minus" && b > a) [a, b] = [b, a];
    ga = rundeAuf(a, 100);
    gb = rundeAuf(b, 100);
    // Und die Summe bleibt im Zahlenraum 1000 - auch die geschätzte.
    if (op === "plus" ? a + b <= 1000 && ga + gb <= 1000 : ga !== gb) break;
  }
  const ergebnis = op === "plus" ? ga + gb : ga - gb;
  // ★ Die Schätzung allein gilt, und die auf Zehner genauere auch. Gemessen am
  // 23.09.2026: nur die ganze Zeile `600 -200 =400` galt, `400` nicht.
  const za = rundeAuf(a, 10), zb = rundeAuf(b, 10);
  const zehner = op === "plus" ? za + zb : za - zb;
  const auch = [String(ergebnis), rechnungMit(za, op, zb, zehner), String(zehner)];
  return {
    sorte: "direkt", op,
    angabe: `Überschlage: ${zahl(a)} ${ZEICHEN[op]}${zahl(b)}`,
    loesung: rechnungMit(ga, op, gb, ergebnis),
    auchRichtig: [...new Set(auch)],
    zahlen: [a, b],
  };
}

/* ------------------------------------------------------------------ */
/* 1000 teilen                                                          */
/* ------------------------------------------------------------------ */

/** 1000 geteilt durch eine runde Zahl - geht immer glatt auf. */
export function teilenAufTausend(rng: Zufall, divisoren: readonly number[]): Kern {
  const d = eines(rng, divisoren);
  return { sorte: "rechnung", op: "geteilt", a: 1000, b: d, ergebnis: 1000 / d };
}

/* ------------------------------------------------------------------ */
/* Schriftliche Verfahren mit echter Übertrags-/Ausleihzählung          */
/* ------------------------------------------------------------------ */

/** Wie oft trägt die schriftliche Addition über? */
export function uebertraegePlus(a: number, b: number): number {
  let carry = 0, count = 0, x = a, y = b;
  while (x > 0 || y > 0) {
    const s = (x % 10) + (y % 10) + carry;
    carry = s >= 10 ? 1 : 0;
    if (carry) count++;
    x = Math.floor(x / 10);
    y = Math.floor(y / 10);
  }
  return count;
}

/** Wie oft muss die schriftliche Subtraktion entbündeln (ausleihen)? */
export function uebertraegeMinus(a: number, b: number): number {
  let leih = 0, count = 0, x = a, y = b;
  while (x > 0 || y > 0) {
    const xd = (x % 10) - leih;
    const yd = y % 10;
    if (xd < yd) { count++; leih = 1; } else { leih = 0; }
    x = Math.floor(x / 10);
    y = Math.floor(y / 10);
  }
  return count;
}

/** Zehnerstelle einer Zahl auf 0 setzen - die kritische Stelle beim Übertrag. */
function zehnerAufNull(z: number): number {
  return Math.floor(z / 100) * 100 + (z % 10);
}

export interface SchriftlichPlusP { aMin: number; aMax: number; gesamtMax: number }

/**
 * Zwei dreistellige Summanden, deren Summe im Zahlenraum bleibt. Mit rund
 * 60 % Wahrscheinlichkeit mindestens ein Übertrag, mit rund 25 % eine Null
 * an der Zehnerstelle - genug, damit ein Lauf von dreißig, vierzig Aufgaben
 * beides zuverlässig zeigt.
 */
export function schriftlichPlus(rng: Zufall, p: SchriftlichPlusP): Kern {
  const willUebertrag = rng() < 0.6;
  const willNull = rng() < 0.25;
  for (let versuch = 0; versuch < 300; versuch++) {
    const a0 = ganz(rng, p.aMin, p.aMax);
    const bMax = Math.min(p.aMax, p.gesamtMax - a0);
    if (bMax < p.aMin) continue;
    let a = a0;
    let b = ganz(rng, p.aMin, bMax);
    if (willNull) {
      if (rng() < 0.5) a = zehnerAufNull(a); else b = zehnerAufNull(b);
      if (a + b > p.gesamtMax) continue;
    }
    const uebertraege = uebertraegePlus(a, b);
    if (willUebertrag ? uebertraege >= 1 : uebertraege === 0) {
      return { sorte: "rechnung", op: "plus", a, b, ergebnis: a + b };
    }
  }
  const a = ganz(rng, p.aMin, p.aMax);
  const b = ganz(rng, p.aMin, Math.max(p.aMin, Math.min(p.aMax, p.gesamtMax - a)));
  return { sorte: "rechnung", op: "plus", a, b, ergebnis: a + b };
}

export interface SchriftlichMinusP { min: number; max: number }

/** Minuend minus Subtrahend, beide dreistellig, mit derselben Streuung wie oben. */
export function schriftlichMinus(rng: Zufall, p: SchriftlichMinusP): Kern {
  const willUebertrag = rng() < 0.6;
  const willNull = rng() < 0.25;
  for (let versuch = 0; versuch < 300; versuch++) {
    let a = ganz(rng, p.min, p.max);
    const b = ganz(rng, p.min, a);
    if (b < p.min) continue;
    if (willNull) {
      a = zehnerAufNull(a);
      if (a < b) continue;
    }
    const uebertraege = uebertraegeMinus(a, b);
    if (willUebertrag ? uebertraege >= 1 : uebertraege === 0) {
      return { sorte: "rechnung", op: "minus", a, b, ergebnis: a - b };
    }
  }
  const a = ganz(rng, p.min, p.max);
  const b = ganz(rng, p.min, a);
  return { sorte: "rechnung", op: "minus", a, b, ergebnis: a - b };
}

/* ------------------------------------------------------------------ */
/* Vereinfachen und Hilfsaufgabe                                        */
/* ------------------------------------------------------------------ */

/**
 * Eine Zahl liegt dicht an einer glatten Hunderterzahl - „701 -698" statt
 * „734 -251". Bei Minus liegen beide Zahlen dicht am selben Hunderter, bei
 * Plus mindestens eine - und die Summe bleibt unter 1000.
 */
export function hilfsaufgabe(rng: Zufall): Kern {
  const op = eines(rng, ["plus", "minus"] as const);
  if (op === "minus") {
    const g = ganz(rng, 3, 9) * 100;
    const a = g + ganz(rng, 1, 3);
    const b = g - ganz(rng, 1, 3);
    return { sorte: "rechnung", op: "minus", a, b, ergebnis: a - b };
  }
  const g = ganz(rng, 2, 6) * 100;
  const nah = rng() < 0.5 ? g + ganz(rng, 1, 3) : g - ganz(rng, 1, 3);
  const rest = ganz(rng, 10, Math.min(390, 990 - nah));
  return { sorte: "rechnung", op: "plus", a: nah, b: rest, ergebnis: nah + rest };
}

/* ------------------------------------------------------------------ */
/* Division im Tausenderraum                                            */
/* ------------------------------------------------------------------ */

export interface DivisionP { divisoren: readonly number[]; aMin: number; aMax: number }

/** Dreistellig durch einstellig, geht immer glatt auf. */
export function divisionOhneRest(rng: Zufall, p: DivisionP): Kern {
  for (let versuch = 0; versuch < 200; versuch++) {
    const d = eines(rng, p.divisoren);
    const fMin = Math.ceil(p.aMin / d);
    const fMax = Math.floor(p.aMax / d);
    if (fMax < fMin) continue;
    const f = ganz(rng, fMin, fMax);
    return { sorte: "rechnung", op: "geteilt", a: d * f, b: d, ergebnis: f };
  }
  throw new Error("divisionOhneRest: keine passenden Zahlen gefunden");
}

/** Dreistellig durch einstellig, der Rest ist nie null. */
export function divisionMitRest(rng: Zufall, p: DivisionP): Kern {
  for (let versuch = 0; versuch < 200; versuch++) {
    const d = eines(rng, p.divisoren);
    const fMin = Math.ceil(p.aMin / d);
    const fMax = Math.floor(p.aMax / d);
    if (fMax < fMin) continue;
    const f = ganz(rng, fMin, fMax);
    const rest = ganz(rng, 1, d - 1);
    const a = d * f + rest;
    if (a < p.aMin || a > p.aMax) continue;
    return { sorte: "rechnung", op: "geteilt", a, b: d, ergebnis: f, rest };
  }
  throw new Error("divisionMitRest: keine passenden Zahlen gefunden");
}

/* ------------------------------------------------------------------ */
/* Zehner-Einmaleins                                                    */
/* ------------------------------------------------------------------ */

/**
 * Einstellig mal Zehnerzahl (10 bis 90) - und, umgekehrt, wieder geteilt.
 * Die Form „folge" in `formen.ts` lässt bei einer Division den Dividenden
 * um den Divisor wandern (720 /90, 810 /90, 900 /90 statt 813 /90) - damit
 * geht jede Zeile glatt auf, in jeder Form.
 */
export function zehnerEinmaleins(rng: Zufall): Kern {
  const a = ganz(rng, 2, 9);
  const b = ganz(rng, 1, 9) * 10;
  const produkt = a * b;
  if (rng() < 0.5) return { sorte: "rechnung", op: "mal", a, b, ergebnis: produkt, variiere: "a" };
  return { sorte: "rechnung", op: "geteilt", a: produkt, b, ergebnis: a };
}

/* ------------------------------------------------------------------ */
/* Schriftlich Mal                                                      */
/* ------------------------------------------------------------------ */

export interface SchriftlichMalP { aMin: number; aMax: number; bMin: number; bMax: number }

/** Mehrstellig mal einstellig. */
export function schriftlichMal(rng: Zufall, p: SchriftlichMalP): Kern {
  const a = ganz(rng, p.aMin, p.aMax);
  const b = ganz(rng, p.bMin, p.bMax);
  return { sorte: "rechnung", op: "mal", a, b, ergebnis: a * b, variiere: "a" };
}

/* ------------------------------------------------------------------ */
/* Nachbarzahlen bis 1000                                                */
/* ------------------------------------------------------------------ */

export type ZahlenreiheFrage = "vorgaenger" | "nachfolger" | "nachbarn" | "nachbarzehner" | "nachbarhunderter";
export interface ZahlenreiheGrossP { min: number; max: number; frage?: readonly ZahlenreiheFrage[] }

/** Wie `zahlenreihe` in `kerne.ts`, zusätzlich mit der Frage nach den Nachbarhundertern. */
export function zahlenreiheGross(rng: Zufall, p: ZahlenreiheGrossP): Kern {
  const frage = eines(
    rng,
    p.frage ?? (["vorgaenger", "nachfolger", "nachbarn", "nachbarzehner", "nachbarhunderter"] as const),
  );
  const z = ganz(rng, p.min + 1, p.max - 1);
  if (frage === "vorgaenger")
    return { sorte: "direkt", op: "zahlen", angabe: `Welche Zahl kommt vor ${z}?`, loesung: String(z - 1), zahlen: [z] };
  if (frage === "nachfolger")
    return { sorte: "direkt", op: "zahlen", angabe: `Welche Zahl kommt nach ${z}?`, loesung: String(z + 1), zahlen: [z] };
  if (frage === "nachbarzehner") {
    const unten = Math.floor(z / 10) * 10;
    return {
      sorte: "direkt", op: "zahlen",
      angabe: `Zwischen welchen Zehnern liegt ${z}?`,
      loesung: `${unten} und ${unten + 10}`,
      auchRichtig: [`${unten}, ${unten + 10}`, `${unten} ${unten + 10}`],
      zahlen: [z],
    };
  }
  if (frage === "nachbarhunderter") {
    const unten = Math.floor(z / 100) * 100;
    return {
      sorte: "direkt", op: "zahlen",
      angabe: `Zwischen welchen Hundertern liegt ${z}?`,
      loesung: `${unten} und ${unten + 100}`,
      auchRichtig: [`${unten}, ${unten + 100}`, `${unten} ${unten + 100}`],
      zahlen: [z],
    };
  }
  return {
    sorte: "direkt", op: "zahlen",
    angabe: `Wie heißen die Nachbarn von ${z}?`,
    loesung: `${z - 1} und ${z + 1}`,
    auchRichtig: [`${z - 1}, ${z + 1}`, `${z - 1} ${z + 1}`],
    zahlen: [z],
  };
}
