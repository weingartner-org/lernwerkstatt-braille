/**
 * ════════════════════════════════════════════════════════════════════════════
 * SPANISCH (es) - DIE ZEICHENTABELLE NACH DER NORM
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Quelle (maßgeblich): Comisión Braille Española (CBE) / ONCE, *Documento
 * técnico B 2: Signografía básica de las lenguas cooficiales españolas*,
 * Versión 4, mayo de 2025 (última actualización: 22 de enero de 2026). Gelesen
 * als PDF (once.es, 1,5 MB); Seitenzahlen = die der Norm (PDF-Seite = Druckseite).
 * Gegenprobe: liblouis 3.39.0 `es-g1` und *World Braille Usage* 2013, S. 201-202 -
 * Zeichen für Zeichen in `BEFUND-2026-11-07-PUNKTGENAU-ES-NORM.md`.
 * ⚠️ Bei Abweichung gilt die NORM, nicht liblouis (Auftrag Johannes 06.11.).
 *
 * Punkte in der Schreibweise "1245" = Punkte 1, 2, 4, 5. `seite` = Seite der Norm.
 * Die Norm gibt die Punkte als Zahlen an (Spalte „Puntos braille"); die Glyphen
 * der Tabellen im PDF sind in einer Sonderschrift und wurden NICHT als Quelle benutzt.
 */

export interface EsZeichen {
  /** Das Zeichen des Drucks. */
  zeichen: string;
  /** Punkte der Zelle(n); mehrere Zellen durch Leerzeichen getrennt. */
  punkte: string;
  /** Name in der Norm (spanisch). */
  name: string;
  /** Seite der Norm. */
  seite: number;
}

/** Kapitel 4 „Alfabeto braille español" (S. 11): 27 Buchstaben und 6 Akzent-/Trema-Buchstaben. */
export const ES_BUCHSTABEN: readonly EsZeichen[] = [
  { zeichen: "a", punkte: "1", name: "a", seite: 11 },
  { zeichen: "b", punkte: "12", name: "be", seite: 11 },
  { zeichen: "c", punkte: "14", name: "ce", seite: 11 },
  { zeichen: "d", punkte: "145", name: "de", seite: 11 },
  { zeichen: "e", punkte: "15", name: "e", seite: 11 },
  { zeichen: "f", punkte: "124", name: "efe", seite: 11 },
  { zeichen: "g", punkte: "1245", name: "ge", seite: 11 },
  { zeichen: "h", punkte: "125", name: "hache", seite: 11 },
  { zeichen: "i", punkte: "24", name: "i", seite: 11 },
  { zeichen: "j", punkte: "245", name: "jota", seite: 11 },
  { zeichen: "k", punkte: "13", name: "ka", seite: 11 },
  { zeichen: "l", punkte: "123", name: "ele", seite: 11 },
  { zeichen: "m", punkte: "134", name: "eme", seite: 11 },
  { zeichen: "n", punkte: "1345", name: "ene", seite: 11 },
  { zeichen: "ñ", punkte: "12456", name: "eñe", seite: 11 },
  { zeichen: "o", punkte: "135", name: "o", seite: 11 },
  { zeichen: "p", punkte: "1234", name: "pe", seite: 11 },
  { zeichen: "q", punkte: "12345", name: "cu", seite: 11 },
  { zeichen: "r", punkte: "1235", name: "erre", seite: 11 },
  { zeichen: "s", punkte: "234", name: "ese", seite: 11 },
  { zeichen: "t", punkte: "2345", name: "te", seite: 11 },
  { zeichen: "u", punkte: "136", name: "u", seite: 11 },
  { zeichen: "v", punkte: "1236", name: "uve", seite: 11 },
  { zeichen: "w", punkte: "2456", name: "uve doble", seite: 11 },
  { zeichen: "x", punkte: "1346", name: "equis", seite: 11 },
  { zeichen: "y", punkte: "13456", name: "ye", seite: 11 },
  { zeichen: "z", punkte: "1356", name: "zeta", seite: 11 },
  { zeichen: "á", punkte: "12356", name: "a con tilde", seite: 11 },
  { zeichen: "é", punkte: "2346", name: "e con tilde", seite: 11 },
  { zeichen: "í", punkte: "34", name: "i con tilde", seite: 11 },
  { zeichen: "ó", punkte: "346", name: "o con tilde", seite: 11 },
  { zeichen: "ú", punkte: "23456", name: "u con tilde", seite: 11 },
  { zeichen: "ü", punkte: "1256", name: "u con diéresis", seite: 11 },
];

/** Kapitel 6 (S. 13-14) und 12 (S. 30): Satzzeichen und Symbole, die der Lehrgang benutzt. */
export const ES_SATZZEICHEN: readonly EsZeichen[] = [
  { zeichen: ",", punkte: "2", name: "coma", seite: 13 },
  { zeichen: ";", punkte: "23", name: "punto y coma", seite: 13 },
  { zeichen: ":", punkte: "25", name: "dos puntos", seite: 13 },
  { zeichen: ".", punkte: "3", name: "punto", seite: 13 },
  { zeichen: "¿", punkte: "26", name: "abrir interrogación", seite: 13 },
  { zeichen: "?", punkte: "26", name: "cerrar interrogación", seite: 13 },
  { zeichen: "¡", punkte: "235", name: "abrir exclamación", seite: 13 },
  { zeichen: "!", punkte: "235", name: "cerrar exclamación", seite: 13 },
  { zeichen: "«", punkte: "236", name: "abrir comillas", seite: 13 },
  { zeichen: "»", punkte: "236", name: "cerrar comillas", seite: 13 },
  { zeichen: "(", punkte: "126", name: "abrir paréntesis", seite: 13 },
  { zeichen: ")", punkte: "345", name: "cerrar paréntesis", seite: 13 },
  { zeichen: "[", punkte: "12356", name: "abrir corchete", seite: 13 },
  { zeichen: "]", punkte: "23456", name: "cerrar corchete", seite: 13 },
  { zeichen: "-", punkte: "36", name: "guion", seite: 14 },
  { zeichen: "—", punkte: "36 36", name: "raya de diálogo", seite: 14 },
  { zeichen: "…", punkte: "3 3 3", name: "puntos suspensivos", seite: 13 },
  { zeichen: "*", punkte: "35", name: "asterisco", seite: 14 },
];

/** Kapitel 8.1 (S. 17): Ziffern = Zahlzeichen (3-4-5-6) vor den ersten zehn Buchstaben; a=1 ... j=0. */
export const ES_ZIFFERN: readonly EsZeichen[] = [
  { zeichen: "1", punkte: "1", name: "uno (a)", seite: 17 },
  { zeichen: "2", punkte: "12", name: "dos (b)", seite: 17 },
  { zeichen: "3", punkte: "14", name: "tres (c)", seite: 17 },
  { zeichen: "4", punkte: "145", name: "cuatro (d)", seite: 17 },
  { zeichen: "5", punkte: "15", name: "cinco (e)", seite: 17 },
  { zeichen: "6", punkte: "124", name: "seis (f)", seite: 17 },
  { zeichen: "7", punkte: "1245", name: "siete (g)", seite: 17 },
  { zeichen: "8", punkte: "125", name: "ocho (h)", seite: 17 },
  { zeichen: "9", punkte: "24", name: "nueve (i)", seite: 17 },
  { zeichen: "0", punkte: "245", name: "cero (j)", seite: 17 },
];

/** Kapitel 12 (S. 30): Grundrechenzeichen. Kein Modifikator davor (anders als im Französischen). */
export const ES_RECHENZEICHEN: readonly EsZeichen[] = [
  { zeichen: "+", punkte: "235", name: "signo de suma", seite: 30 },
  { zeichen: "−", punkte: "36", name: "signo de resta", seite: 30 },
  { zeichen: "×", punkte: "236", name: "signo de multiplicar (aspa)", seite: 30 },
  { zeichen: "÷", punkte: "256", name: "signo de dividir (barra inclinada o trazo horizontal)", seite: 30 },
  { zeichen: "=", punkte: "2356", name: "signo de igualdad", seite: 30 },
];

/** Steuerzeichen (Kapitel 7, 8). */
export const ES_STEUER = {
  /** Signo de mayúscula - 7, S. 15: Punkte 4-6 vor der Majuskel / vor dem Wort. */
  majuskel: { punkte: "46", seite: 15 },
  /** Siglen: zwei Zeichen vor der ersten Letter - 7.1 (2), S. 15. */
  majuskelSigla: { punkte: "46 46", seite: 15 },
  /** Signo de número - 8.1, S. 17: Punkte 3-4-5-6 vor den ersten zehn Buchstaben. */
  zahl: { punkte: "3456", seite: 17 },
  /** Prefijo de latina minúscula - 8.2, S. 19: Punkt 5 zwischen Zahl und Buchstabe a-j. */
  latinaMinuscula: { punkte: "5", seite: 19 },
} as const;

/** Alle Zeichen der Norm, die der Lehrgang benutzt, mit ihren Zellen. */
export const ES_ALLE: readonly EsZeichen[] = [
  ...ES_BUCHSTABEN,
  ...ES_SATZZEICHEN,
  ...ES_ZIFFERN,
  ...ES_RECHENZEICHEN,
];

/**
 * ★ World Braille Usage 2013, „Spanish", S. 201-202 (PDF-Seiten 217-218) - die zweite Quelle der
 * Gegenprobe. Nur das, was dort steht (Buchstaben, Satzzeichen, Majuskel, Zahlzeichen;
 * NICHT: `+ − × ÷ =`). Punkte als "1245"; Zellfolge durch Leerzeichen.
 */
const WBU_TEXT =
  "a1 b12 c14 d145 e15 f124 g1245 h125 i24 j245 k13 l123 m134 n1345 ñ12456 o135 p1234 q12345 r1235 s234 " +
  "t2345 u136 v1236 w2456 x1346 y13456 z1356 á12356 é2346 í34 ó346 ú23456 ü1256";

export const ES_WBU: Readonly<Record<string, { punkte: string; seite: number }>> = {
  ...Object.fromEntries(
    WBU_TEXT.split(" ").map((e) => [[...e][0], { punkte: e.slice([...e][0].length), seite: 201 }]),
  ),
  ",": { punkte: "2", seite: 201 },
  ";": { punkte: "23", seite: 201 },
  ":": { punkte: "25", seite: 201 },
  ".": { punkte: "3", seite: 201 },
  "¿": { punkte: "26", seite: 201 },
  "?": { punkte: "26", seite: 201 },
  "¡": { punkte: "235", seite: 201 },
  "!": { punkte: "235", seite: 201 },
  "“": { punkte: "236", seite: 201 },
  "”": { punkte: "236", seite: 201 },
  "«": { punkte: "236", seite: 201 },
  "»": { punkte: "236", seite: 201 },
  "(": { punkte: "126", seite: 201 },
  ")": { punkte: "345", seite: 201 },
  "*": { punkte: "35", seite: 201 },
  "…": { punkte: "3 3 3", seite: 201 },
  "-": { punkte: "36", seite: 201 },
  "—": { punkte: "36 36", seite: 201 },
  "[": { punkte: "12356", seite: 202 },
  "]": { punkte: "23456", seite: 202 },
};
