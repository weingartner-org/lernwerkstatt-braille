/**
 * Das Spiel „Zahlenstrahl horchen": Wohin gehört 0,7?
 *
 * Ein Ton steigt, je weiter rechts die Zahl liegt. Das Kind geht mit den
 * Pfeiltasten am Strahl entlang, hört bei jedem Schritt die Höhe und legt die
 * gesuchte Zahl ab.
 *
 * ★ Der Ton ist eine Hilfe, nie die einzige Auskunft: an jeder Stelle steht
 * und wird gesagt, welche Zahl dort liegt. Ein Kind ohne Gehör für Tonhöhen
 * spielt genauso.
 *
 * Geübt werden Dezimalzahlen, Brüche und das Runden (didaktisch-methodische
 * Struktur, Abschnitt 11).
 */
import { ganz, zahl } from "../aufgabe";

export interface Strahl {
  von: number;
  bis: number;
  /** Wie viele Schritte der Strahl hat. */
  schritte: number;
  /** Die gesuchte Zahl. */
  gesucht: number;
  /** Wie sie dasteht - „0,7" oder „3/4". */
  text: string;
}

/** Wie nah man liegen muss: ein halber Schritt. */
export function toleranz(s: Strahl): number {
  return (s.bis - s.von) / s.schritte / 2;
}

/** Der Wert an einer Stelle. */
export function wertAn(s: Strahl, stelle: number): number {
  const roh = s.von + ((s.bis - s.von) * stelle) / s.schritte;
  // Auf die Schrittweite runden, damit keine krummen Zahlen entstehen.
  const genauigkeit = (s.bis - s.von) / s.schritte;
  return Math.round(roh / genauigkeit) * genauigkeit;
}

/** Der Anteil einer Stelle - 0 ganz links, 1 ganz rechts. Für die Tonhöhe. */
export function anteil(s: Strahl, stelle: number): number {
  return stelle / s.schritte;
}

/**
 * Einen Strahl bauen - passend zur Schulstufe.
 *
 * Stufe 1 bis 4 gehen über ganze Zahlen, ab Stufe 5 kommen Dezimalzahlen und
 * Brüche dazu: dort steht der Zahlenstrahl im Lehrplan.
 */
export function neuerStrahl(rng: () => number, stufe = 3): Strahl {
  if (stufe <= 2) {
    const bis = 20;
    const gesucht = ganz(rng, 1, bis - 1);
    return { von: 0, bis, schritte: bis, gesucht, text: zahl(gesucht) };
  }
  if (stufe <= 4) {
    const bis = 100;
    const gesucht = ganz(rng, 1, 19) * 5;
    return { von: 0, bis, schritte: 20, gesucht, text: zahl(gesucht) };
  }
  // Dezimalzahlen und Brüche zwischen 0 und 1.
  const alsBruch = rng() < 0.4;
  if (alsBruch) {
    const nenner = [2, 4, 5, 10][Math.floor(rng() * 4)];
    const zaehler = ganz(rng, 1, nenner - 1);
    return { von: 0, bis: 1, schritte: 10, gesucht: zaehler / nenner, text: `${zaehler}/${nenner}` };
  }
  const zehntel = ganz(rng, 1, 9);
  return { von: 0, bis: 1, schritte: 10, gesucht: zehntel / 10, text: zahl(zehntel / 10) };
}

export interface Ablage {
  satz: string;
  getroffen: boolean;
}

/** Die Zahl ablegen - und die Rückmeldung dazu. */
export function lege(s: Strahl, stelle: number): Ablage {
  const wert = wertAn(s, stelle);
  const abstand = Math.abs(wert - s.gesucht);
  if (abstand <= toleranz(s)) {
    return { satz: `Richtig. ${s.text} liegt bei ${zahl(wert)}.`, getroffen: true };
  }
  const richtung = wert < s.gesucht ? "weiter rechts" : "weiter links";
  return { satz: `Noch nicht. ${s.text} liegt ${richtung}.`, getroffen: false };
}
