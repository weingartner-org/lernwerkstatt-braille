/**
 * ════════════════════════════════════════════════════════════════════════════
 * PORTUGIESISCH (pt Portugal und br Brasilien) - DIE ZEICHENTABELLE NACH DER NORM
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Quelle (maßgeblich, für BEIDE Länder die eine Norm): *Grafia Braille para a Língua
 * Portuguesa*, 3ª edição, Brasília 2018 (MEC/SECADI, erarbeitet mit der Comissão de Braille
 * de Portugal; PDF vom IBC, gov.br/ibc). Seitenzahlen = die der Norm (PDF-Seite = Druckseite).
 * Die Textebene des PDF ist die ASCII-Braille-Schrift (`a` = 1, `(` = 12356, `$` = 1246 ...);
 * sie wurde in Punkte umgesetzt und gegen die Punktzahlen geprüft, die die Norm selbst im
 * Fließtext nennt (ã 345, õ 246, ú 23456, # 3456, ; 56, ,8 = 6 236 ...).
 * Gegenprobe: liblouis 3.39.0 `pt-pt-g1` und *World Braille Usage* 2013 (S. 197-198) -
 * Zeichen für Zeichen in `BEFUND-2026-11-07-PUNKTGENAU-PT-BR-NORM.md`.
 * ⚠️ Bei Abweichung gilt die NORM, nicht liblouis (Auftrag Johannes 06.11.).
 *
 * Punkte in der Schreibweise "1245" = Punkte 1, 2, 4, 5. `seite` = Seite der Norm.
 */

export interface PtZeichen {
  /** Das Zeichen des Drucks. */
  zeichen: string;
  /** Punkte der Zelle(n); mehrere Zellen durch Leerzeichen getrennt. */
  punkte: string;
  /** Name in der Norm (portugiesisch). */
  name: string;
  /** Seite der Norm. */
  seite: number;
}

/** § 8, 1 und 2 (S. 23): 26 Buchstaben und 12 Buchstaben mit Diakritikum. */
export const PT_BUCHSTABEN: readonly PtZeichen[] = [
  { zeichen: "a", punkte: "1", name: "a", seite: 23 },
  { zeichen: "b", punkte: "12", name: "bê", seite: 23 },
  { zeichen: "c", punkte: "14", name: "cê", seite: 23 },
  { zeichen: "d", punkte: "145", name: "dê", seite: 23 },
  { zeichen: "e", punkte: "15", name: "e", seite: 23 },
  { zeichen: "f", punkte: "124", name: "efe", seite: 23 },
  { zeichen: "g", punkte: "1245", name: "gê", seite: 23 },
  { zeichen: "h", punkte: "125", name: "agá", seite: 23 },
  { zeichen: "i", punkte: "24", name: "i", seite: 23 },
  { zeichen: "j", punkte: "245", name: "jota", seite: 23 },
  { zeichen: "k", punkte: "13", name: "capa", seite: 23 },
  { zeichen: "l", punkte: "123", name: "ele", seite: 23 },
  { zeichen: "m", punkte: "134", name: "eme", seite: 23 },
  { zeichen: "n", punkte: "1345", name: "ene", seite: 23 },
  { zeichen: "o", punkte: "135", name: "o", seite: 23 },
  { zeichen: "p", punkte: "1234", name: "pê", seite: 23 },
  { zeichen: "q", punkte: "12345", name: "quê", seite: 23 },
  { zeichen: "r", punkte: "1235", name: "erre", seite: 23 },
  { zeichen: "s", punkte: "234", name: "esse", seite: 23 },
  { zeichen: "t", punkte: "2345", name: "tê", seite: 23 },
  { zeichen: "u", punkte: "136", name: "u", seite: 23 },
  { zeichen: "v", punkte: "1236", name: "vê", seite: 23 },
  { zeichen: "w", punkte: "2456", name: "dáblio", seite: 23 },
  { zeichen: "x", punkte: "1346", name: "xis", seite: 23 },
  { zeichen: "y", punkte: "13456", name: "ípsilon", seite: 23 },
  { zeichen: "z", punkte: "1356", name: "zê", seite: 23 },
  { zeichen: "à", punkte: "1246", name: "a com acento grave", seite: 23 },
  { zeichen: "á", punkte: "12356", name: "a com acento agudo", seite: 23 },
  { zeichen: "â", punkte: "16", name: "a com acento circunflexo", seite: 23 },
  { zeichen: "ã", punkte: "345", name: "a com til", seite: 23 },
  { zeichen: "ç", punkte: "12346", name: "cê cedilha", seite: 23 },
  { zeichen: "é", punkte: "123456", name: "e com acento agudo", seite: 23 },
  { zeichen: "ê", punkte: "126", name: "e com acento circunflexo", seite: 23 },
  { zeichen: "í", punkte: "34", name: "i com acento agudo", seite: 23 },
  { zeichen: "ó", punkte: "346", name: "o com acento agudo", seite: 23 },
  { zeichen: "ô", punkte: "1456", name: "o com acento circunflexo", seite: 23 },
  { zeichen: "õ", punkte: "246", name: "o com til", seite: 23 },
  { zeichen: "ú", punkte: "23456", name: "u com acento agudo", seite: 23 },
];

/**
 * § 8, 3 (S. 24) und § 33-39 (S. 47-57): Satzzeichen. Klammern und eckige Klammern haben zwei Formen:
 * die ZUSAMMENGESETZTE (126 3 ... 6 345; Standard, § 37.2, S. 53) und die EINFACHE (126 ... 345; nur bei
 * Zahlen, § 37.1, S. 50-52). Die Tabelle hier führt die zusammengesetzte Form; die einfache steht in `PT_KLAMMER_EINFACH`.
 */
export const PT_SATZZEICHEN: readonly PtZeichen[] = [
  { zeichen: ",", punkte: "2", name: "vírgula", seite: 24 },
  { zeichen: ";", punkte: "23", name: "ponto e vírgula", seite: 24 },
  { zeichen: ":", punkte: "25", name: "dois-pontos", seite: 24 },
  { zeichen: ".", punkte: "3", name: "ponto", seite: 24 },
  { zeichen: "?", punkte: "26", name: "ponto de interrogação", seite: 24 },
  { zeichen: "!", punkte: "235", name: "ponto de exclamação", seite: 24 },
  { zeichen: "…", punkte: "3 3 3", name: "reticências", seite: 24 },
  { zeichen: "-", punkte: "36", name: "hífen", seite: 24 },
  { zeichen: "–", punkte: "36 36", name: "travessão", seite: 24 },
  { zeichen: "—", punkte: "36 36", name: "travessão", seite: 24 },
  { zeichen: "*", punkte: "35", name: "asterisco", seite: 24 },
  { zeichen: "(", punkte: "126 3", name: "abre parênteses", seite: 24 },
  { zeichen: ")", punkte: "6 345", name: "fecha parênteses", seite: 24 },
  { zeichen: "[", punkte: "12356 3", name: "abre colchetes", seite: 24 },
  { zeichen: "]", punkte: "6 23456", name: "fecha colchetes", seite: 24 },
  { zeichen: "“", punkte: "236", name: "abre aspas", seite: 24 },
  { zeichen: "”", punkte: "236", name: "fecha aspas", seite: 24 },
  { zeichen: '"', punkte: "236", name: "aspas", seite: 24 },
  { zeichen: "‘", punkte: "6 236", name: "abre aspas simples", seite: 24 },
  { zeichen: "’", punkte: "6 236", name: "fecha aspas simples", seite: 24 },
  { zeichen: "«", punkte: "56 236", name: "abre aspas angulares", seite: 24 },
  { zeichen: "»", punkte: "56 236", name: "fecha aspas angulares", seite: 24 },
  { zeichen: "/", punkte: "6 2", name: "barra", seite: 60 },
];

/** § 37.1 (S. 50-52): die einfachen Formen, nur zusammen mit Zahlen. */
export const PT_KLAMMER_EINFACH: Readonly<Record<string, { punkte: string; seite: number }>> = {
  "(": { punkte: "126", seite: 50 },
  ")": { punkte: "345", seite: 50 },
  "[": { punkte: "12356", seite: 50 },
  "]": { punkte: "23456", seite: 50 },
};

/** § 35 (S. 48): der Apostroph ist Punkt 3, wie der Punkt. */
export const PT_APOSTROPH = { punkte: "3", seite: 48 } as const;

/** § 12 (S. 29): Ziffern = Zahlzeichen (3-4-5-6) vor den ersten zehn Buchstaben; a=1 ... j=0. */
export const PT_ZIFFERN: readonly PtZeichen[] = [
  { zeichen: "1", punkte: "1", name: "um (a)", seite: 29 },
  { zeichen: "2", punkte: "12", name: "dois (b)", seite: 29 },
  { zeichen: "3", punkte: "14", name: "três (c)", seite: 29 },
  { zeichen: "4", punkte: "145", name: "quatro (d)", seite: 29 },
  { zeichen: "5", punkte: "15", name: "cinco (e)", seite: 29 },
  { zeichen: "6", punkte: "124", name: "seis (f)", seite: 29 },
  { zeichen: "7", punkte: "1245", name: "sete (g)", seite: 29 },
  { zeichen: "8", punkte: "125", name: "oito (h)", seite: 29 },
  { zeichen: "9", punkte: "24", name: "nove (i)", seite: 29 },
  { zeichen: "0", punkte: "245", name: "zero (j)", seite: 29 },
];

/** § 8, 4 (S. 25) und § 22 (S. 36): Grundrechenzeichen, ohne Zwischenraum zwischen den Zahlen. */
export const PT_RECHENZEICHEN: readonly PtZeichen[] = [
  { zeichen: "+", punkte: "235", name: "sinal de adição (mais)", seite: 25 },
  { zeichen: "−", punkte: "36", name: "sinal de subtração (menos)", seite: 25 },
  { zeichen: "×", punkte: "236", name: "sinal de multiplicação (vezes)", seite: 25 },
  { zeichen: "÷", punkte: "256", name: "sinal de divisão (dividido por)", seite: 25 },
  { zeichen: "=", punkte: "2356", name: "sinal de igualdade (é igual a)", seite: 25 },
];

/** Steuerzeichen. */
export const PT_STEUER = {
  /** § 10 (S. 27): Punkt 4-6 vor JEDEM Großbuchstaben. */
  maiuscula: { punkte: "46", seite: 27 },
  /** § 10.1 und § 11 (S. 27-28): 4-6 4-6 vor einem Wort oder einer Sigle ganz aus Großbuchstaben. */
  maiusculaPalavra: { punkte: "46 46", seite: 27 },
  /** § 12 (S. 29): Zahlzeichen 3-4-5-6, nur vor der ersten Ziffer einer Zahl. */
  zahl: { punkte: "3456", seite: 29 },
  /** § 16 c (S. 31): Punkt 5 („sinal de letra latina minúscula") zwischen Zahl und Buchstabe a-j. */
  latinaMinuscula: { punkte: "5", seite: 31 },
  /** § 13 (S. 29): Dezimalkomma = Punkt 2. */
  dezimal: { punkte: "2", seite: 29 },
  /** § 14 (S. 30): Trennpunkt der Klassen = Punkt 3. */
  klassenPunkt: { punkte: "3", seite: 30 },
} as const;

/** Alle Zeichen der Norm, die der Lehrgang benutzt, mit ihren Zellen. */
export const PT_ALLE: readonly PtZeichen[] = [
  ...PT_BUCHSTABEN,
  ...PT_SATZZEICHEN,
  ...PT_ZIFFERN,
  ...PT_RECHENZEICHEN,
];

/**
 * ★ World Braille Usage 2013, „Portuguese", S. 197-198 (PDF-Seiten 213-214) - die zweite Quelle der
 * Gegenprobe (für Brasilien und Portugal dieselbe Tafel; Länderseiten: Portugal S. 115, Brasilien PDF-Seite 33).
 * Nur das, was dort steht. Punkte als "1245"; Zellfolge durch Leerzeichen. Die WBU nennt zusätzlich ü 1256
 * (die Norm 2018 kennt ü im portugiesischen Alphabet nicht, § 8 - siehe Befund) und führt «» als 6 236,
 * ‘’ als 56 236 - das ist das Gegenteil der Norm 2018 (§ 38, S. 54).
 */
export const PT_WBU: Readonly<Record<string, { punkte: string; seite: number }>> = {
  ...Object.fromEntries(
    (
      "a1 b12 c14 ç12346 d145 e15 f124 g1245 h125 i24 j245 k13 l123 m134 n1345 o135 p1234 q12345 r1235 s234 " +
      "t2345 u136 v1236 w2456 x1346 y13456 z1356 á12356 é123456 í34 ó346 ú23456 à1246 â16 ê126 ô1456 ã345 õ246 ü1256"
    )
      .split(" ")
      .map((e) => [[...e][0], { punkte: e.slice([...e][0].length), seite: 197 }]),
  ),
  ",": { punkte: "2", seite: 198 },
  ";": { punkte: "23", seite: 198 },
  ":": { punkte: "25", seite: 198 },
  ".": { punkte: "3", seite: 198 },
  "?": { punkte: "26", seite: 198 },
  "!": { punkte: "235", seite: 198 },
  "“": { punkte: "236", seite: 198 },
  "”": { punkte: "236", seite: 198 },
  "…": { punkte: "3 3 3", seite: 198 },
  "-": { punkte: "36", seite: 198 },
  "—": { punkte: "36 36", seite: 198 },
  "*": { punkte: "35", seite: 198 },
  "/": { punkte: "6 2", seite: 198 },
};

/** WBU 2013, S. 198, die der Norm 2018 WIDERSPRECHEN (die Norm gilt): « » und ‘ ’ sind dort vertauscht. */
export const PT_WBU_ABWEICHEND: Readonly<Record<string, { wbu: string; norm: string }>> = {
  "«": { wbu: "6 236", norm: "56 236" },
  "»": { wbu: "6 236", norm: "56 236" },
  "‘": { wbu: "56 236", norm: "6 236" },
  "’": { wbu: "56 236", norm: "6 236" },
};
