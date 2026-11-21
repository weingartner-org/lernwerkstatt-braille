/**
 * Das Spiel „Schatzgitter": das Ergebnis nennt das Feld.
 *
 * Plus stellt eine Rechnung. Das Ergebnis ist zweistellig und sagt, wo
 * gegraben wird: die Zehnerziffer ist die Spalte, die Einerziffer die Zeile.
 * 32 heißt Spalte 3, Zeile 2. Geübt werden Koordinaten und das Einmaleins.
 *
 * ★ Erst die Rechnung, dann das Feld - nie beides gleichzeitig. Räumliche
 * Zusatzaufgaben stören das taktile Arbeitsgedächtnis stärker als Kopfrechnen
 * selbst; deshalb steht die Rechnung still da, bis das Kind sie gelöst hat,
 * und erst dann bewegt sich etwas im Gitter.
 *
 * ★ Die Rückmeldung ist ein Abstand in Feldern, kein Tempo und keine Punkte.
 */
import { ganz, zahl } from "../aufgabe";

export const SEITE = 5;

export interface Feld {
  spalte: number;
  zeile: number;
}

export interface Schatzgitter {
  schatz: Feld;
  /** Wo schon gegraben wurde. */
  gegraben: Feld[];
}

export interface Grabaufgabe {
  angabe: string;
  /** Das Ergebnis - es nennt das Feld. */
  loesung: string;
  feld: Feld;
}

export function neuesSchatzgitter(rng: () => number): Schatzgitter {
  return { schatz: { spalte: ganz(rng, 1, SEITE), zeile: ganz(rng, 1, SEITE) }, gegraben: [] };
}

/** Aus einer Zahl ein Feld: die Zehnerziffer ist die Spalte, die Einer die Zeile. */
export function feldVon(wert: number): Feld | null {
  const spalte = Math.floor(wert / 10);
  const zeile = wert % 10;
  if (spalte < 1 || spalte > SEITE || zeile < 1 || zeile > SEITE) return null;
  return { spalte, zeile };
}

/** Ein Feld in Worten - so steht es da und so wird es gesagt. */
export function feldName(f: Feld): string {
  return `Spalte ${f.spalte}, Zeile ${f.zeile}`;
}

/**
 * Eine Grabaufgabe bauen: eine Rechnung, deren Ergebnis ein Feld nennt.
 *
 * Die Rechnung passt zur Schulstufe; das Ergebnis liegt immer im Gitter, sonst
 * wäre die Aufgabe eine Falle.
 */
export function grabaufgabe(rng: () => number, stufe = 3): Grabaufgabe {
  for (let versuch = 0; versuch < 400; versuch++) {
    const spalte = ganz(rng, 1, SEITE);
    const zeile = ganz(rng, 1, SEITE);
    const wert = spalte * 10 + zeile;

    if (stufe <= 2) {
      const b = ganz(rng, 2, wert - 1);
      return { angabe: `${zahl(wert - b)} +${zahl(b)} =`, loesung: zahl(wert), feld: { spalte, zeile } };
    }
    // Ab der dritten Stufe das Einmaleins, wo es aufgeht - sonst Plus.
    const teiler = [2, 3, 4, 5, 6, 7, 8, 9].filter((t) => wert % t === 0 && wert / t <= 20);
    if (teiler.length) {
      const t = teiler[Math.floor(rng() * teiler.length)];
      return { angabe: `${zahl(t)} *${zahl(wert / t)} =`, loesung: zahl(wert), feld: { spalte, zeile } };
    }
    const b = ganz(rng, 2, wert - 1);
    return { angabe: `${zahl(wert - b)} +${zahl(b)} =`, loesung: zahl(wert), feld: { spalte, zeile } };
  }
  return { angabe: "10 +11 =", loesung: "21", feld: { spalte: 2, zeile: 1 } };
}

/** Der Abstand in Feldern - wie weit man noch gehen müsste. */
export function abstand(a: Feld, b: Feld): number {
  return Math.abs(a.spalte - b.spalte) + Math.abs(a.zeile - b.zeile);
}

export interface Grabung {
  satz: string;
  gefunden: boolean;
}

/**
 * Graben - und die Rückmeldung dazu.
 *
 * ★ Sie sagt die Richtung, nicht nur „kalt": ein Kind mit Braillezeile kann
 * das Gitter nicht überblicken, und „weiter rechts" ist eine Auskunft, aus der
 * sich etwas machen lässt.
 */
export function grabe(spiel: Schatzgitter, feld: Feld): Grabung {
  if (feld.spalte === spiel.schatz.spalte && feld.zeile === spiel.schatz.zeile) {
    return { satz: `Gefunden! Der Schatz lag auf ${feldName(feld)}.`, gefunden: true };
  }
  const teile: string[] = [];
  if (spiel.schatz.spalte > feld.spalte) teile.push("weiter rechts");
  if (spiel.schatz.spalte < feld.spalte) teile.push("weiter links");
  if (spiel.schatz.zeile > feld.zeile) teile.push("weiter unten");
  if (spiel.schatz.zeile < feld.zeile) teile.push("weiter oben");
  const d = abstand(feld, spiel.schatz);
  const wie = d === 1 ? "Ganz nah" : d <= 2 ? "Nah" : "Noch weit";
  return { satz: `Nichts auf ${feldName(feld)}. ${wie} - ${teile.join(" und ")}.`, gefunden: false };
}

export function nachGrabung(spiel: Schatzgitter, feld: Feld): Schatzgitter {
  return { ...spiel, gegraben: [...spiel.gegraben, feld] };
}
