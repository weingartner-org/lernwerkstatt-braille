/**
 * Computerbraille (8 Punkte, Eurobraille) - Zeichen und Punktmuster.
 *
 * Quelle: die liblouis-Tabelle `de-de-comp8.ctb` - das ist die Tabelle, die
 * NVDA tatsaechlich zur Ausgabe auf der Braillezeile benutzt -, unabhaengig
 * bestaetigt durch die Tabellen auf fakoo.de. Nichts hier ist geraten; wo die
 * beiden Quellen sich nicht deckten, steht es im Kommentar.
 *
 * ★ Der Unterschied zur 6-Punkt-Schrift, an dem alles haengt: in
 * Computerbraille haben die Ziffern EIGENE Punktmuster. Es gibt kein
 * Zahlzeichen. In der Vollschrift teilen sich Ziffern und die Buchstaben a
 * bis j dieselben Muster, und erst ein vorangestelltes Zahlzeichen entscheidet.
 * Deshalb ist Computerbraille die einfachere der beiden Eingaben: ein Zeichen,
 * eine Bedeutung, kein Zustand.
 *
 * ★ Stolperstein: Grossbuchstaben entstehen durch Punkt 7 am selben Zeichen -
 * aber NICHT bei den Umlauten. Ä, Ö und Ü haben eigene, unabhaengige Muster.
 * Wer „ä plus Punkt 7" rechnet, bekommt etwas anderes als Ä.
 */
import { punkteZuZeichen, textZuPunkte, zeichenZuPunkte } from "./punkte";

/** Zeichen und ihre Punkte, wie sie in `de-de-comp8.ctb` stehen. */
const TABELLE: Record<string, string> = {
  // Ziffern - eigene Muster, kein Zahlzeichen
  "0": "3-4-6", "1": "1-6", "2": "1-2-6", "3": "1-4-6", "4": "1-4-5-6",
  "5": "1-5-6", "6": "1-2-4-6", "7": "1-2-4-5-6", "8": "1-2-5-6", "9": "2-4-6",

  // Rechen- und Satzzeichen
  " ": "leer",
  "+": "2-3-5", "-": "3-6", "*": "3-5", "/": "2-5-6", "=": "2-3-5-6",
  "(": "2-3-6", ")": "3-5-6", "[": "1-2-3-5-6-7", "]": "2-3-4-5-6-7",
  "{": "1-2-3-5-6", "}": "2-3-4-5-6",
  ",": "2", ".": "3", "^": "2-3-4-6-7", "%": "1-2-3-4-5-6",
  "<": "5-6", ">": "4-5", ":": "2-5", ";": "2-3",
  // ★ Aus der Tabelle von Punktgenau (`CHAR_TO_CELL_8`) und `de-de-comp8.ctb` - beide gleich.
  // Ohne sie blieb die Zeile jeder Frage („Welche Zahl kommt nach 11?") leer.
  "?": "2-6", "'": "6", "|": "3-4", "!": "5", '"': "4", "#": "3-4-5-6", "\\": "3-4-7",

  // Kleinbuchstaben
  a: "1", b: "1-2", c: "1-4", d: "1-4-5", e: "1-5", f: "1-2-4", g: "1-2-4-5",
  h: "1-2-5", i: "2-4", j: "2-4-5", k: "1-3", l: "1-2-3", m: "1-3-4",
  n: "1-3-4-5", o: "1-3-5", p: "1-2-3-4", q: "1-2-3-4-5", r: "1-2-3-5",
  s: "2-3-4", t: "2-3-4-5", u: "1-3-6", v: "1-2-3-6", w: "2-4-5-6",
  x: "1-3-4-6", y: "1-3-4-5-6", z: "1-3-5-6",

  // Umlaute und scharfes s
  "ä": "3-4-5-8", "ö": "2-4-6-8", "ü": "1-2-5-6-8", "ß": "3-4-5-6-8",

  // Grossbuchstaben: Punkt 7 dazu ...
  A: "1-7", B: "1-2-7", C: "1-4-7", D: "1-4-5-7", E: "1-5-7", F: "1-2-4-7",
  G: "1-2-4-5-7", H: "1-2-5-7", I: "2-4-7", J: "2-4-5-7", K: "1-3-7",
  L: "1-2-3-7", M: "1-3-4-7", N: "1-3-4-5-7", O: "1-3-5-7", P: "1-2-3-4-7",
  Q: "1-2-3-4-5-7", R: "1-2-3-5-7", S: "2-3-4-7", T: "2-3-4-5-7", U: "1-3-6-7",
  V: "1-2-3-6-7", W: "2-4-5-6-7", X: "1-3-4-6-7", Y: "1-3-4-5-6-7", Z: "1-3-5-6-7",

  // ... aber nicht bei den Umlauten: eigene Muster.
  "Ä": "5-6-7", "Ö": "3-5-8", "Ü": "2-3-6-8",
};

const ZU_BRAILLE = new Map<string, string>();
const ZU_TEXT = new Map<string, string>();

for (const [zeichen, punkte] of Object.entries(TABELLE)) {
  const braille = punkteZuZeichen(textZuPunkte(punkte));
  ZU_BRAILLE.set(zeichen, braille);
  // Beim Rückweg gewinnt der erste Eintrag - die Tabelle ist eindeutig,
  // aber ein späterer Zusatz soll eine bestehende Zuordnung nicht überschreiben.
  if (!ZU_TEXT.has(braille)) ZU_TEXT.set(braille, zeichen);
}

/** Ein Zeichen in sein Computerbraille-Muster. `null`, wenn es keines gibt. */
export function zeichenZuBraille(zeichen: string): string | null {
  return ZU_BRAILLE.get(zeichen) ?? null;
}

/** Ein Braillezeichen in seinen Buchstaben. `null`, wenn die Tabelle es nicht kennt. */
export function brailleZuZeichen(braille: string): string | null {
  return ZU_TEXT.get(braille) ?? null;
}

/**
 * Eine ganze Eingabe uebersetzen. Unbekannte Zeichen werden nicht
 * stillschweigend verschluckt - sie kommen als Fragezeichen zurueck, damit
 * das Kind merkt, dass etwas nicht angekommen ist.
 */
export function brailleZuText(eingabe: string): string {
  return [...eingabe].map((b) => brailleZuZeichen(b) ?? "?").join("");
}

/** Der Weg hin - fuer die Anzeige „so sieht deine Eingabe in Braille aus". */
export function textZuBraille(text: string): string {
  return [...text].map((z) => zeichenZuBraille(z) ?? "").join("");
}

/** Welche Zeichen kennt die Tabelle? Fuer Waechter und Hilfetexte. */
export function bekannteZeichen(): string[] {
  return [...ZU_BRAILLE.keys()];
}

/** Die Punkte eines Zeichens, in der Schreibweise der Regelwerke. */
export function punkteVon(zeichen: string): string | null {
  return TABELLE[zeichen] ?? null;
}

/** Hat dieses Braillezeichen einen Punkt 7 oder 8? Dann ist es kein 6-Punkt-Zeichen. */
export function brauchtAchtPunkte(braille: string): boolean {
  return zeichenZuPunkte(braille).some((p) => p >= 7);
}
