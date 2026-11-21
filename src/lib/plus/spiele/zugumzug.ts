/**
 * Das Spiel „Zug um Zug": ein Duell an EINEM Gerät.
 *
 * ★ Nacheinander, nicht gleichzeitig - so steht es in der Struktur, und das
 * ist kein Detail: Wer gleichzeitig spielt, spielt auf Zeit, und wer auf Zeit
 * spielt, benachteiligt jedes Kind, dessen Sprachausgabe erst vorlesen muss.
 * Hier ist immer genau eines dran, und es hat so lange, wie es braucht.
 *
 * ★ Beide bekommen gleich schwere Aufgaben. Das Duell wäre sonst keines.
 * Plus baut dazu die Aufgaben paarweise: dieselbe Rechenart, derselbe
 * Zahlenraum, nur andere Zahlen.
 *
 * ★ Kein Tempo, keine Uhr. Am Ende steht „3 zu 2" - und Gleichstand ist ein
 * Ergebnis, kein Makel.
 */
import { ganz, zahl, type Operation } from "../aufgabe";

export interface Duellaufgabe {
  angabe: string;
  loesung: string;
  op: Operation;
}

export interface ZugUmZug {
  /** Die Namen, wie die Kinder sie eingegeben haben. */
  namen: [string, string];
  /** Wer ist dran - 0 oder 1. */
  dran: 0 | 1;
  punkte: [number, number];
  /** Wie viele Runden gespielt werden (je Kind eine Aufgabe pro Runde). */
  runden: number;
  /** Wie viele Züge schon gemacht sind. */
  zuege: number;
}

export function neuesDuell(namen: [string, string] = ["Kind 1", "Kind 2"], runden = 5): ZugUmZug {
  return { namen, dran: 0, punkte: [0, 0], runden, zuege: 0 };
}

/**
 * Eine Aufgabe für den nächsten Zug.
 *
 * Die Rechenart wechselt reihum, damit niemand nur seine starke Seite
 * bekommt - und beide Kinder bekommen in derselben Runde dieselbe Art.
 */
export function duellaufgabe(rng: () => number, stufe: number, runde: number): Duellaufgabe {
  const arten: Operation[] = ["plus", "minus", "mal", "geteilt"];
  const op = arten[runde % arten.length];
  const gross = stufe <= 2 ? 20 : stufe <= 4 ? 100 : 1000;

  if (op === "plus") {
    const a = ganz(rng, 2, gross), b = ganz(rng, 2, Math.max(2, Math.floor(gross / 2)));
    return { angabe: `${zahl(a)} +${zahl(b)} =`, loesung: zahl(a + b), op };
  }
  if (op === "minus") {
    const a = ganz(rng, 10, gross), b = ganz(rng, 2, Math.max(3, a - 1));
    return { angabe: `${zahl(a)} -${zahl(b)} =`, loesung: zahl(a - b), op };
  }
  if (op === "mal") {
    const a = ganz(rng, 2, stufe <= 2 ? 5 : 12), b = ganz(rng, 2, stufe <= 2 ? 5 : 12);
    return { angabe: `${zahl(a)} *${zahl(b)} =`, loesung: zahl(a * b), op };
  }
  const b = ganz(rng, 2, stufe <= 2 ? 5 : 9);
  const ergebnis = ganz(rng, 2, stufe <= 2 ? 5 : 12);
  return { angabe: `${zahl(b * ergebnis)} /${zahl(b)} =`, loesung: zahl(ergebnis), op };
}

/** Einen Zug verbuchen und das Gerät weitergeben. */
export function nachDuellzug(spiel: ZugUmZug, richtig: boolean): ZugUmZug {
  const punkte: [number, number] = [...spiel.punkte] as [number, number];
  if (richtig) punkte[spiel.dran] += 1;
  return {
    ...spiel,
    punkte,
    dran: spiel.dran === 0 ? 1 : 0,
    zuege: spiel.zuege + 1,
  };
}

export function duellFertig(spiel: ZugUmZug): boolean {
  return spiel.zuege >= spiel.runden * 2;
}

/**
 * Wie es ausgegangen ist - ohne Sieger-Pathos und ohne Trostpflaster.
 *
 * ★ Gleichstand ist ein Ergebnis, kein Makel. Und der Satz nennt beide Namen,
 * nicht nur den vorn.
 */
export function duellSatz(spiel: ZugUmZug): string {
  const [a, b] = spiel.punkte;
  const [na, nb] = spiel.namen;
  if (a === b) return `${a} zu ${b}. Gleichstand.`;
  return a > b ? `${a} zu ${b} für ${na}.` : `${b} zu ${a} für ${nb}.`;
}
