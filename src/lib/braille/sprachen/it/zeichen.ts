/**
 * ════════════════════════════════════════════════════════════════════════════
 * ITALIENISCH (it) - DIE ZEICHENTABELLE NACH DER NORM
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Quelle (maßgeblich): Biblioteca Italiana per i Ciechi „Regina Margherita" ONLUS,
 * *Codice Braille Italiano* (Authority Italiana del Braille), Ausgabe 2022
 * (bibliotecaciechi.it/wp-content/uploads/2022/03/Codice_Braille.pdf, 72 Seiten), Teil
 * „a sei punti". Seitenzahlen = die der Norm (PDF-Seite = Druckseite).
 * ⚠️ Die Zellen stehen im PDF nur als Glyphen der Sonderschrift „BrailleAOE" (die Spalte
 * daneben ist ein Textkode, KEINE Punktzahl). Sie wurden deshalb aus den Glyph-Bildern
 * der PDF-Seiten abgelesen (Punkt für Punkt, Seite für Seite, danach gegen liblouis und WBU
 * gelegt) - nicht aus dem Text-Layer. Details: BEFUND-2026-11-07-PUNKTGENAU-IT-NORM.md.
 * Gegenprobe: liblouis 3.39.0 `it-it-comp6` und *World Braille Usage* 2013, S. 190.
 * ⚠️ Bei Abweichung gilt die NORM, nicht liblouis und nicht die WBU (Auftrag Johannes 06.11.).
 *
 * Punkte in der Schreibweise "1245" = Punkte 1, 2, 4, 5. `seite` = Seite der Norm.
 */

export interface ItZeichen {
  /** Das Zeichen des Drucks. */
  zeichen: string;
  /** Punkte der Zelle(n); mehrere Zellen durch Leerzeichen getrennt. */
  punkte: string;
  /** Name in der Norm (italienisch) und Nummer des Absatzes. */
  name: string;
  /** Seite der Norm. */
  seite: number;
}

/** „Alfabeto" (S. 7) und Simboli non matematici 3) und 6) (S. 7): 26 Buchstaben und die Akzentbuchstaben des Lehrgangs. */
export const IT_BUCHSTABEN: readonly ItZeichen[] = [
  { zeichen: "a", punkte: "1", name: "a", seite: 7 },
  { zeichen: "b", punkte: "12", name: "bi", seite: 7 },
  { zeichen: "c", punkte: "14", name: "ci", seite: 7 },
  { zeichen: "d", punkte: "145", name: "di", seite: 7 },
  { zeichen: "e", punkte: "15", name: "e", seite: 7 },
  { zeichen: "f", punkte: "124", name: "effe", seite: 7 },
  { zeichen: "g", punkte: "1245", name: "gi", seite: 7 },
  { zeichen: "h", punkte: "125", name: "acca", seite: 7 },
  { zeichen: "i", punkte: "24", name: "i", seite: 7 },
  { zeichen: "j", punkte: "245", name: "i lunga", seite: 7 },
  { zeichen: "k", punkte: "13", name: "cappa", seite: 7 },
  { zeichen: "l", punkte: "123", name: "elle", seite: 7 },
  { zeichen: "m", punkte: "134", name: "emme", seite: 7 },
  { zeichen: "n", punkte: "1345", name: "enne", seite: 7 },
  { zeichen: "o", punkte: "135", name: "o", seite: 7 },
  { zeichen: "p", punkte: "1234", name: "pi", seite: 7 },
  { zeichen: "q", punkte: "12345", name: "cu", seite: 7 },
  { zeichen: "r", punkte: "1235", name: "erre", seite: 7 },
  { zeichen: "s", punkte: "234", name: "esse", seite: 7 },
  { zeichen: "t", punkte: "2345", name: "ti", seite: 7 },
  { zeichen: "u", punkte: "136", name: "u", seite: 7 },
  { zeichen: "v", punkte: "1236", name: "vi", seite: 7 },
  { zeichen: "w", punkte: "2456", name: "doppia vu", seite: 7 },
  { zeichen: "x", punkte: "1346", name: "ics", seite: 7 },
  { zeichen: "y", punkte: "13456", name: "ipsilon", seite: 7 },
  { zeichen: "z", punkte: "1356", name: "zeta", seite: 7 },
  { zeichen: "à", punkte: "12356", name: "a con accento grave", seite: 7 },
  { zeichen: "è", punkte: "2346", name: "e con accento grave", seite: 7 },
  { zeichen: "é", punkte: "123456", name: "e con accento acuto", seite: 7 },
  { zeichen: "ì", punkte: "34", name: "i con accento grave", seite: 7 },
  { zeichen: "ò", punkte: "346", name: "o con accento grave", seite: 7 },
  { zeichen: "ù", punkte: "23456", name: "u con accento grave", seite: 7 },
];

/** Weitere Buchstaben des Teils „a sei punti" (S. 7-8): in der Engine, nicht im Lehrgang. */
export const IT_BUCHSTABEN_WEITERE: readonly ItZeichen[] = [
  { zeichen: "â", punkte: "16", name: "a con accento circonflesso", seite: 7 },
  { zeichen: "ê", punkte: "126", name: "e con accento circonflesso", seite: 7 },
  { zeichen: "î", punkte: "146", name: "i con accento circonflesso", seite: 7 },
  { zeichen: "ô", punkte: "1456", name: "o con accento circonflesso", seite: 7 },
  { zeichen: "û", punkte: "156", name: "u con accento circonflesso", seite: 7 },
  { zeichen: "ä", punkte: "345", name: "a con dieresi", seite: 7 },
  { zeichen: "ë", punkte: "1246", name: "e con dieresi", seite: 7 },
  { zeichen: "ï", punkte: "12456", name: "i con dieresi", seite: 7 },
  { zeichen: "ö", punkte: "246", name: "o con dieresi", seite: 7 },
  { zeichen: "ü", punkte: "1256", name: "u con dieresi", seite: 7 },
  { zeichen: "ñ", punkte: "12456", name: "n con tilde", seite: 8 },
  { zeichen: "ç", punkte: "12346", name: "c con cediglia", seite: 8 },
];

/** Simboli non matematici 14)-30) (S. 8-10): Satzzeichen und Symbole. */
export const IT_SATZZEICHEN: readonly ItZeichen[] = [
  { zeichen: ",", punkte: "2", name: "virgola (14)", seite: 8 },
  { zeichen: ".", punkte: "256", name: "punto fermo (15)", seite: 8 },
  { zeichen: "…", punkte: "3 3 3", name: "punto di sospensione (16)", seite: 9 },
  { zeichen: ";", punkte: "23", name: "punto e virgola (17)", seite: 9 },
  { zeichen: ":", punkte: "25", name: "due punti (18)", seite: 9 },
  { zeichen: "?", punkte: "26", name: "punto interrogativo (19)", seite: 9 },
  { zeichen: "!", punkte: "235", name: "punto esclamativo (20)", seite: 9 },
  { zeichen: "-", punkte: "36", name: "trattino (21)", seite: 9 },
  { zeichen: "«", punkte: "236", name: "virgolette aperte (22)", seite: 9 },
  { zeichen: "»", punkte: "356", name: "virgolette chiuse (22)", seite: 9 },
  { zeichen: "'", punkte: "3", name: "apostrofo (23)", seite: 9 },
  { zeichen: "(", punkte: "2356", name: "parentesi letteraria tonda, aperta e chiusa (24)", seite: 9 },
  { zeichen: ")", punkte: "2356", name: "parentesi letteraria tonda, aperta e chiusa (24)", seite: 9 },
  { zeichen: "[", punkte: "12356", name: "parentesi letteraria quadra aperta (25)", seite: 9 },
  { zeichen: "]", punkte: "23456", name: "parentesi letteraria quadra chiusa (25)", seite: 9 },
  { zeichen: "{", punkte: "12346", name: "parentesi letteraria graffa aperta (26)", seite: 9 },
  { zeichen: "}", punkte: "13456", name: "parentesi letteraria graffa chiusa (26)", seite: 9 },
  { zeichen: "*", punkte: "35", name: "asterisco (27)", seite: 10 },
  { zeichen: "/", punkte: "34", name: "barra (30)", seite: 10 },
];

/** Simboli matematici 121) (S. 21): Ziffern = Zahlzeichen (3-4-5-6) vor den Buchstaben a-j; 1=a ... 0=j. */
export const IT_ZIFFERN: readonly ItZeichen[] = [
  { zeichen: "1", punkte: "1", name: "uno (a)", seite: 21 },
  { zeichen: "2", punkte: "12", name: "due (b)", seite: 21 },
  { zeichen: "3", punkte: "14", name: "tre (c)", seite: 21 },
  { zeichen: "4", punkte: "145", name: "quattro (d)", seite: 21 },
  { zeichen: "5", punkte: "15", name: "cinque (e)", seite: 21 },
  { zeichen: "6", punkte: "124", name: "sei (f)", seite: 21 },
  { zeichen: "7", punkte: "1245", name: "sette (g)", seite: 21 },
  { zeichen: "8", punkte: "125", name: "otto (h)", seite: 21 },
  { zeichen: "9", punkte: "24", name: "nove (i)", seite: 21 },
  { zeichen: "0", punkte: "245", name: "zero (j)", seite: 21 },
];

/**
 * Simboli matematici 135)-142) (S. 22-23): Grundrechenzeichen, die der Lehrgang benutzt. Kein Modifikator davor.
 * `÷` fehlt mit Absicht: Absatz 140 „Diviso" nennt als Druckzeichen nur `:` und `/` (beide 2-5-6); der Doppelpunkt
 * hat als Satzzeichen 2-5 - offene Frage im Befund, `÷` wird nicht geschrieben.
 */
export const IT_RECHENZEICHEN: readonly ItZeichen[] = [
  { zeichen: "+", punkte: "235", name: "più (135)", seite: 22 },
  { zeichen: "−", punkte: "36", name: "meno (136)", seite: 22 },
  { zeichen: "×", punkte: "236", name: "per (139)", seite: 23 },
  { zeichen: "=", punkte: "2356", name: "uguale (142)", seite: 23 },
];

/** Steuerzeichen (Simboli non matematici 1)-2), S. 7; 121), S. 21). */
export const IT_STEUER = {
  /** Maiuscole - 1), S. 7: Punkte 4-6 vor jedem Großbuchstaben. */
  majuskel: { punkte: "46", seite: 7 },
  /** Parola tutta maiuscola - 2), S. 7: zwei Zeichen 4-6 vor dem ganzen Wort. */
  majuskelWort: { punkte: "46 46", seite: 7 },
  /** Segnanumero - 121), S. 21: Punkte 3-4-5-6 vor den Buchstaben a-j. */
  zahl: { punkte: "3456", seite: 21 },
} as const;

/** Alle Zeichen der Norm, die der Lehrgang benutzt, mit ihren Zellen. */
export const IT_ALLE: readonly ItZeichen[] = [
  ...IT_BUCHSTABEN,
  ...IT_BUCHSTABEN_WEITERE,
  ...IT_SATZZEICHEN,
  ...IT_ZIFFERN,
  ...IT_RECHENZEICHEN,
];

/**
 * ★ World Braille Usage 2013, „Italian", S. 190 (PDF-Seite 206) - die zweite Quelle der Gegenprobe.
 * Nur das, was dort steht. Punkte als "1245"; Zellfolge durch Leerzeichen. `abweichungNorm` = die WBU
 * schreibt es anders als die Norm 2022 (Befund: die WBU nennt Punkt = 3 und Klammern 26/35).
 */
const WBU_TEXT =
  "a1 b12 c14 d145 e15 f124 g1245 h125 i24 j245 k13 l123 m134 n1345 o135 p1234 q12345 r1235 s234 t2345 " +
  "u136 v1236 w2456 x1346 y13456 z1356 ç12346 é123456 à12356 è2346 ù23456 â16 ê126 î146 ô1456 û156 ë1246 " +
  "ï12456 ö246 ü1256 ò346 ì34";

export const IT_WBU: Readonly<Record<string, { punkte: string; seite: number; abweichungNorm?: boolean }>> = {
  ...Object.fromEntries(
    WBU_TEXT.split(" ").map((e) => [[...e][0], { punkte: e.slice([...e][0].length), seite: 190 }]),
  ),
  ",": { punkte: "2", seite: 190 },
  ";": { punkte: "23", seite: 190 },
  ":": { punkte: "25", seite: 190 },
  // WBU: „period, full stop (3)" - die Norm: punto fermo = 2-5-6, die 3 ist der Punkt der Abkürzung/Sperrung (16)
  ".": { punkte: "3", seite: 190, abweichungNorm: true },
  "?": { punkte: "26", seite: 190 },
  "!": { punkte: "235", seite: 190 },
  "'": { punkte: "3", seite: 190 },
  "«": { punkte: "236", seite: 190 },
  "»": { punkte: "356", seite: 190 },
  // WBU: „parentheses (26, 35)" und „brackets (2356, 2356)" - die Norm: runde Klammer 2-3-5-6 (24)
  "(": { punkte: "26", seite: 190, abweichungNorm: true },
  ")": { punkte: "35", seite: 190, abweichungNorm: true },
  "-": { punkte: "36", seite: 190 },
  "*": { punkte: "35", seite: 190 },
};
