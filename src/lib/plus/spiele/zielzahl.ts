/**
 * Das Spiel „Zielzahl": aus fünf Zahlen eine Zielzahl bauen.
 *
 * Jeder Zug ist eine Zeile in der Schreibweise von Plus - `3 *4 =12`. Die
 * beiden benutzten Zahlen sind danach weg, das Ergebnis liegt dafür da. Wer
 * die Zielzahl erreicht, hat gewonnen; wer nicht mehr weiterkommt, gibt auf
 * und sieht einen Weg.
 *
 * ★ Kein Tempo. Es gibt keine Uhr, keine Punkte für schnelle Züge und keine
 * Rangliste. Zeitdruck erzeugt belegt Rechenangst und benachteiligt ein Kind
 * mit Screenreader ein zweites Mal, weil die Vorlesezeit mitläuft.
 *
 * ★ Es gibt immer einen Weg. Die Zielzahl entsteht, indem Plus selbst rechnet -
 * ein Spiel, das unlösbar sein kann, ist kein Spiel, sondern ein Ärgernis.
 *
 * Geübt werden Vorrangregeln, Zerlegen und der Überschlag (didaktisch-
 * methodische Struktur, Abschnitt 11).
 */
import { ganz, normal, zahl, type Operation } from "../aufgabe";
import { zeichenGlaetten } from "../antwortformen";

export interface Zielzahl {
  /** Die Zahlen, die dem Kind vorliegen. */
  zahlen: number[];
  ziel: number;
  /** Ein Weg, der zum Ziel führt - nur zum Nachsehen, nicht zum Vorzeigen. */
  weg: string[];
}

const ZEICHEN: Record<string, Operation> = { "+": "plus", "-": "minus", "*": "mal", "/": "geteilt" };

/**
 * Ein Spiel bauen.
 *
 * @param stufe Schulstufe - sie bestimmt, wie groß die Zahlen werden.
 */
export function neuesZielzahlSpiel(rng: () => number, stufe = 4): Zielzahl {
  const gross = stufe <= 2 ? 10 : stufe <= 4 ? 25 : 50;
  const zuege = stufe <= 2 ? 2 : stufe <= 4 ? 3 : 4;

  for (let versuch = 0; versuch < 60; versuch++) {
    const vorrat = Array.from({ length: 5 }, () => ganz(rng, 1, gross));
    const offen = [...vorrat];
    const weg: string[] = [];
    let gut = true;

    for (let i = 0; i < zuege && offen.length > 1; i++) {
      const ia = Math.floor(rng() * offen.length);
      let ib = Math.floor(rng() * offen.length);
      if (ib === ia) ib = (ib + 1) % offen.length;
      const a = offen[ia], b = offen[ib];
      const moeglich: [string, number][] = [
        ["+", a + b],
        ["-", a - b],
        ["*", a * b],
      ];
      if (b !== 0 && a % b === 0) moeglich.push(["/", a / b]);
      const brauchbar = moeglich.filter(([, e]) => e > 0 && e <= gross * gross);
      if (!brauchbar.length) { gut = false; break; }
      const [z, ergebnis] = brauchbar[Math.floor(rng() * brauchbar.length)];
      weg.push(`${zahl(a)} ${z}${zahl(b)} =${zahl(ergebnis)}`);
      const rest = offen.filter((_, k) => k !== ia && k !== ib);
      offen.length = 0;
      offen.push(...rest, ergebnis);
    }

    const ziel = offen[offen.length - 1];
    // Zu einfach ist auch nichts: die Zielzahl darf nicht schon dastehen.
    if (gut && weg.length >= 2 && !vorrat.includes(ziel) && ziel > 1) {
      return { zahlen: vorrat, ziel, weg };
    }
  }
  // Rückfall - er kommt praktisch nie vor, aber er ist spielbar.
  return { zahlen: [2, 3, 4, 5, 10], ziel: 23, weg: ["4 *5 =20", "20 +3 =23"] };
}

export interface Zug {
  /** Die Zeile, wie das Kind sie geschrieben hat. */
  zeile: string;
  a: number;
  op: string;
  b: number;
  ergebnis: number;
}

export type ZugFehler =
  | { art: "form"; satz: string }
  | { art: "zahl"; satz: string }
  | { art: "rechnung"; satz: string };

/**
 * Einen Zug lesen und prüfen.
 *
 * ★ Die Rückmeldung sagt, WAS nicht stimmt - nicht nur, dass etwas nicht
 * stimmt. „Die 7 liegt nicht mehr da" ist eine Auskunft, „Falsch" ist keine.
 */
export function pruefeZug(zeile: string, offen: readonly number[]): { zug: Zug } | { fehler: ZugFehler } {
  // ★ Erst glätten wie jede Plus-Antwort (Durchsicht 29.09.2026): „3 × 4 = 12",
  // „3 · 4 = 12" und das Minus vom Mac „3 – 1 =2" sind dieselbe Rechnung.
  // Der Punkt als Dezimalzeichen gilt wie in `normal` (Ziffernblock).
  const m = /^\s*(-?\d+(?:[.,]\d+)?)\s*([+\-*/])\s*(-?\d+(?:[.,]\d+)?)\s*=\s*(-?\d+(?:[.,]\d+)?)\s*$/.exec(
    zeichenGlaetten(zeile),
  );
  if (!m) {
    return { fehler: { art: "form", satz: "Schreib es so: 3 *4 =12" } };
  }
  const alsZahl = (s: string) => Number(s.replace(",", "."));
  const a = alsZahl(m[1]), b = alsZahl(m[3]), ergebnis = alsZahl(m[4]);
  const op = m[2];

  const vorrat = [...offen];
  for (const wert of [a, b]) {
    const i = vorrat.indexOf(wert);
    if (i < 0) return { fehler: { art: "zahl", satz: `Die ${zahl(wert)} liegt nicht mehr da.` } };
    vorrat.splice(i, 1);
  }

  const soll = op === "+" ? a + b : op === "-" ? a - b : op === "*" ? a * b : b === 0 ? NaN : a / b;
  if (!Number.isFinite(soll) || normal(zahl(soll)) !== normal(zahl(ergebnis))) {
    return { fehler: { art: "rechnung", satz: "Rechne das noch einmal nach." } };
  }

  return { zug: { zeile: `${zahl(a)} ${op}${zahl(b)} =${zahl(ergebnis)}`, a, op, b, ergebnis } };
}

/** Die Zahlen nach einem Zug: die beiden benutzten weg, das Ergebnis dazu. */
export function nachZug(offen: readonly number[], zug: Zug): number[] {
  const rest = [...offen];
  rest.splice(rest.indexOf(zug.a), 1);
  rest.splice(rest.indexOf(zug.b), 1);
  return [...rest, zug.ergebnis];
}

/** Ist das Ziel erreicht? */
export function gewonnen(offen: readonly number[], ziel: number): boolean {
  return offen.includes(ziel);
}

/** Welche Rechenart steckt in dem Zeichen? Für die Vorlesefunktion. */
export function artVon(op: string): Operation {
  return ZEICHEN[op] ?? "gemischt";
}
