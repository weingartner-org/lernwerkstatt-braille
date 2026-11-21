/**
 * Das Spiel „Heiß und kalt": eine versteckte Zahl erraten.
 *
 * Nach jedem Versuch kommt „größer" oder „kleiner" und dazu, wie nah man ist.
 * Geübt wird das Halbieren und die Größenvorstellung: wer die Mitte nimmt,
 * kommt mit sieben Versuchen bis 100 immer an - und genau das soll ein Kind
 * dabei merken.
 *
 * ★ Kein Tempo, keine Versuchsgrenze als Strafe. Die Zahl der Versuche steht
 * da, weil sie die Lehre ist („mit dem Halbieren waren es fünf"), nicht als
 * Note.
 *
 * ★ Die Nähe steht in WORTEN, nicht als Balken und nicht in Farbe. Auf der
 * Braillezeile kommt Farbe nicht an.
 */
import { ganz, wert } from "../aufgabe";

export interface HeissKalt {
  von: number;
  bis: number;
  /** Die versteckte Zahl. Sie steht im Spielstand - nicht in der Anzeige. */
  zahl: number;
  versuche: number[];
}

export function neuesHeissKaltSpiel(rng: () => number, stufe = 3): HeissKalt {
  const bis = stufe <= 1 ? 20 : stufe <= 2 ? 100 : stufe <= 4 ? 1000 : 10000;
  return { von: 1, bis, zahl: ganz(rng, 1, bis), versuche: [] };
}

export type Naehe = "getroffen" | "ganz nah" | "nah" | "noch weit";

/**
 * Wie nah ist der Versuch?
 *
 * Die Grenzen hängen am Zahlenraum, nicht an festen Zahlen - „nah" heißt bei
 * 1 bis 20 etwas anderes als bei 1 bis 10 000.
 */
export function naehe(spiel: HeissKalt, versuch: number): Naehe {
  const abstand = Math.abs(versuch - spiel.zahl);
  if (abstand === 0) return "getroffen";
  const spanne = spiel.bis - spiel.von + 1;
  if (abstand <= Math.max(1, Math.round(spanne * 0.02))) return "ganz nah";
  if (abstand <= Math.max(3, Math.round(spanne * 0.1))) return "nah";
  return "noch weit";
}

export interface Rueckmeldung {
  satz: string;
  getroffen: boolean;
}

/** Einen Versuch beantworten - ein Satz, kurz, ohne Wertung. */
export function antwort(spiel: HeissKalt, versuch: number): Rueckmeldung {
  if (!Number.isFinite(versuch)) return { satz: "Schreib eine Zahl.", getroffen: false };
  if (versuch < spiel.von || versuch > spiel.bis) {
    return { satz: `Die Zahl liegt zwischen ${spiel.von} und ${spiel.bis}.`, getroffen: false };
  }
  const wie = naehe(spiel, versuch);
  if (wie === "getroffen") {
    const anzahl = spiel.versuche.length + 1;
    return { satz: `Getroffen! ${anzahl} ${anzahl === 1 ? "Versuch" : "Versuche"}.`, getroffen: true };
  }
  const richtung = versuch < spiel.zahl ? "Größer" : "Kleiner";
  return { satz: `${richtung}. Du bist ${wie}.`, getroffen: false };
}

/**
 * ★ Was das Kind getippt hat, als Zahl - oder `null` (Durchsicht 29.09.2026).
 *
 * Vorher las die Seite mit `Number()`: Ein leeres Feld war 0 und zählte als
 * Versuch („Die Zahl liegt zwischen 1 und 1000." - und ein Versuch weg),
 * „0x1F4" war 500, „1e2" war 100. Jetzt liest derselbe Zahlleser wie jede
 * Plus-Antwort (`wert`); was keine Zahl ist, zählt nicht.
 */
export function leseVersuch(eingabe: string): number | null {
  return eingabe.trim() ? wert(eingabe) : null;
}

/** Zählt dieser Versuch? Nur eine Zahl im Spielbereich - daneben ist kein Raten. */
export function zaehltAlsVersuch(spiel: HeissKalt, versuch: number | null): versuch is number {
  return versuch !== null && versuch >= spiel.von && versuch <= spiel.bis;
}

/** Den Versuch in den Spielstand aufnehmen. */
export function nachVersuch(spiel: HeissKalt, versuch: number): HeissKalt {
  return { ...spiel, versuche: [...spiel.versuche, versuch] };
}

/**
 * Wie viele Versuche braucht man mit dem Halbieren höchstens?
 *
 * Das ist die Lehre des Spiels, und sie lässt sich ausrechnen: bei 1 bis 100
 * sind es sieben. Plus sagt es dem Kind, wenn es geraten hat - nicht vorher.
 */
export function halbierungsVersuche(spiel: HeissKalt): number {
  return Math.ceil(Math.log2(spiel.bis - spiel.von + 1));
}
