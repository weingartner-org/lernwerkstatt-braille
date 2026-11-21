/**
 * ════════════════════════════════════════════════════════════════════════════
 * SCHWEDISCH (sv) - DIE ZEICHENTABELLE NACH DER NORM
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Quelle (maßgeblich): Punktskriftsnämnden (MTM) in Zusammenarbeit mit dem Språkrådet,
 * *Svenska skrivregler för punktskrift*, Andra upplagan, 2009 (Skriftserien Svensk
 * punktskrift). Gelesen als PDF von mtm.se (Ausgabe „Unicode-mönster för punktskrift",
 * Datei vom 30.05.2024, 0,9 MB); die Zeichenbilder der Tabellen stehen dort als
 * Unicode-Braillemuster im Text und wurden Zeichen für Zeichen in Punktnummern
 * umgerechnet. Seitenzahlen = die gedruckten Seiten der Norm (PDF-Seite + 2).
 * Gegenprobe: liblouis 3.39.0 `sv-g0` und *World Braille Usage* 2013, S. 203 -
 * Zeichen für Zeichen in `BEFUND-2026-11-07-PUNKTGENAU-SV-NORM.md`.
 * ⚠️ Bei Abweichung gilt die NORM, nicht liblouis (Auftrag Johannes 06.11.).
 *
 * Punkte in der Schreibweise "1245" = Punkte 1, 2, 4, 5. `seite` = gedruckte Seite der Norm.
 */

export interface SvZeichen {
  /** Das Zeichen des Drucks. */
  zeichen: string;
  /** Punkte der Zelle(n); mehrere Zellen durch Leerzeichen getrennt. */
  punkte: string;
  /** Name in der Norm (schwedisch). */
  name: string;
  /** Seite der Norm. */
  seite: number;
}

/** Kapitel 1.1 „Det svenska alfabetet i punktskrift" (S. 14): 26 Buchstaben mit w, dazu å, ä, ö. */
export const SV_BUCHSTABEN: readonly SvZeichen[] = [
  { zeichen: "a", punkte: "1", name: "a", seite: 14 },
  { zeichen: "b", punkte: "12", name: "be", seite: 14 },
  { zeichen: "c", punkte: "14", name: "se", seite: 14 },
  { zeichen: "d", punkte: "145", name: "de", seite: 14 },
  { zeichen: "e", punkte: "15", name: "e", seite: 14 },
  { zeichen: "f", punkte: "124", name: "eff", seite: 14 },
  { zeichen: "g", punkte: "1245", name: "ge", seite: 14 },
  { zeichen: "h", punkte: "125", name: "hå", seite: 14 },
  { zeichen: "i", punkte: "24", name: "i", seite: 14 },
  { zeichen: "j", punkte: "245", name: "ji", seite: 14 },
  { zeichen: "k", punkte: "13", name: "kå", seite: 14 },
  { zeichen: "l", punkte: "123", name: "ell", seite: 14 },
  { zeichen: "m", punkte: "134", name: "emm", seite: 14 },
  { zeichen: "n", punkte: "1345", name: "enn", seite: 14 },
  { zeichen: "o", punkte: "135", name: "o", seite: 14 },
  { zeichen: "p", punkte: "1234", name: "pe", seite: 14 },
  { zeichen: "q", punkte: "12345", name: "ku", seite: 14 },
  { zeichen: "r", punkte: "1235", name: "ärr", seite: 14 },
  { zeichen: "s", punkte: "234", name: "ess", seite: 14 },
  { zeichen: "t", punkte: "2345", name: "te", seite: 14 },
  { zeichen: "u", punkte: "136", name: "u", seite: 14 },
  { zeichen: "v", punkte: "1236", name: "ve", seite: 14 },
  { zeichen: "x", punkte: "1346", name: "ex", seite: 14 },
  { zeichen: "y", punkte: "13456", name: "y", seite: 14 },
  { zeichen: "z", punkte: "1356", name: "säta", seite: 14 },
  { zeichen: "w", punkte: "2456", name: "dubbel-ve", seite: 14 },
  { zeichen: "å", punkte: "16", name: "å", seite: 14 },
  { zeichen: "ä", punkte: "345", name: "ä", seite: 14 },
  { zeichen: "ö", punkte: "246", name: "ö", seite: 14 },
];

/** Kapitel 1.1 (S. 14) und 4.1.1 (S. 39): die vier Buchstaben mit diakritischem Zeichen, die ein EIGENES Zeichen haben. */
export const SV_DIAKRITISCH: readonly SvZeichen[] = [
  { zeichen: "à", punkte: "12356", name: "a med grav accent", seite: 39 },
  { zeichen: "é", punkte: "123456", name: "e med akut accent", seite: 39 },
  { zeichen: "è", punkte: "2346", name: "e med grav accent", seite: 39 },
  { zeichen: "ü", punkte: "1256", name: "tyskt y, u med trema", seite: 39 },
];

/** Kapitel 2 (S. 19-24) und 9.5 (S. 74-75): Satzzeichen und Symbole. */
export const SV_SATZZEICHEN: readonly SvZeichen[] = [
  { zeichen: ".", punkte: "3", name: "punkt", seite: 19 },
  { zeichen: ",", punkte: "2", name: "komma", seite: 19 },
  { zeichen: "?", punkte: "26", name: "frågetecken", seite: 19 },
  { zeichen: "!", punkte: "235", name: "utropstecken", seite: 19 },
  { zeichen: ":", punkte: "25", name: "kolon", seite: 19 },
  { zeichen: ";", punkte: "23", name: "semikolon", seite: 19 },
  { zeichen: "/", punkte: "34", name: "snedstreck", seite: 19 },
  { zeichen: "”", punkte: "56", name: "citattecken, anföringstecken", seite: 19 },
  { zeichen: "’", punkte: "5", name: "apostrof, inre citat", seite: 19 },
  { zeichen: "-", punkte: "36", name: "bindestreck", seite: 20 },
  { zeichen: "–", punkte: "36 36", name: "tankstreck, replikstreck", seite: 20 },
  { zeichen: "(", punkte: "236", name: "rund parentes (öppnande)", seite: 21 },
  { zeichen: ")", punkte: "356", name: "rund parentes (slutande)", seite: 21 },
  { zeichen: "[", punkte: "12356", name: "hakparentes (öppnande)", seite: 21 },
  { zeichen: "]", punkte: "23456", name: "hakparentes (slutande)", seite: 21 },
  { zeichen: "*", punkte: "35", name: "asterisk, stjärna", seite: 24 },
  { zeichen: "§", punkte: "346", name: "paragraftecken", seite: 24 },
  { zeichen: "&", punkte: "12346", name: "et-tecken", seite: 24 },
  { zeichen: "{", punkte: "6 12356", name: "klammerparentes (öppnande)", seite: 21 },
  { zeichen: "}", punkte: "6 23456", name: "klammerparentes (slutande)", seite: 21 },
  { zeichen: "†", punkte: "45 256", name: "kors", seite: 24 },
  { zeichen: "#", punkte: "45 3456", name: "nummertecken, fyrkant", seite: 24 },
  { zeichen: "@", punkte: "45 12356", name: "snabel-a", seite: 24 },
  { zeichen: "\\", punkte: "45 34", name: "omvänt snedstreck, bakstreck", seite: 24 },
  { zeichen: "_", punkte: "45 36", name: "understreck", seite: 24 },
  { zeichen: "|", punkte: "456", name: "lodstreck", seite: 24 },
  { zeichen: "~", punkte: "45 25", name: "utelämnat huvudord, fristående tilde", seite: 24 },
  { zeichen: "¢", punkte: "45 14", name: "centtecken", seite: 25 },
  { zeichen: "$", punkte: "45 234", name: "dollartecken", seite: 25 },
  { zeichen: "€", punkte: "45 15", name: "eurotecken", seite: 25 },
  { zeichen: "£", punkte: "45 123", name: "pundtecken", seite: 25 },
  { zeichen: "¥", punkte: "45 13456", name: "yentecken", seite: 25 },
  { zeichen: "…", punkte: "3 3 3", name: "tre punkter", seite: 74 },
];

/** Kapitel 1.2 / 5.1 (S. 15, 49): Ziffern = Siffertecken (3-4-5-6) vor den ersten zehn Buchstaben; a=1 ... j=0. */
export const SV_ZIFFERN: readonly SvZeichen[] = [
  { zeichen: "1", punkte: "1", name: "ett (a)", seite: 49 },
  { zeichen: "2", punkte: "12", name: "två (b)", seite: 49 },
  { zeichen: "3", punkte: "14", name: "tre (c)", seite: 49 },
  { zeichen: "4", punkte: "145", name: "fyra (d)", seite: 49 },
  { zeichen: "5", punkte: "15", name: "fem (e)", seite: 49 },
  { zeichen: "6", punkte: "124", name: "sex (f)", seite: 49 },
  { zeichen: "7", punkte: "1245", name: "sju (g)", seite: 49 },
  { zeichen: "8", punkte: "125", name: "åtta (h)", seite: 49 },
  { zeichen: "9", punkte: "24", name: "nio (i)", seite: 49 },
  { zeichen: "0", punkte: "245", name: "noll (j)", seite: 49 },
];

/** Kapitel 6 (S. 57-60): Rechenzeichen. Teilen = Schrägstrich 3-4 (siehe Satzzeichen); ein Zeichen ÷ kennt die Norm nicht. */
export const SV_RECHENZEICHEN: readonly SvZeichen[] = [
  { zeichen: "+", punkte: "256", name: "additionstecken, plus", seite: 57 },
  { zeichen: "−", punkte: "36", name: "subtraktionstecken, minus", seite: 57 },
  { zeichen: "=", punkte: "2356", name: "likhetstecken", seite: 58 },
  { zeichen: "×", punkte: "12456 1346", name: "multiplikationstecken (kryss)", seite: 58 },
];

/** Steuerzeichen (Kapitel 3, 5). */
export const SV_STEUER = {
  /** Versaltecken - 3.2.1, S. 30: Punkt 6 vor der Versal. */
  versal: { punkte: "6", seite: 30 },
  /** Flera versaler i följd - 3.2.2, S. 30: zwei Versaltecken vor dem Wort aus lauter Versalen. */
  versalWort: { punkte: "6 6", seite: 30 },
  /** Avslutningstecken - 3.3.1, S. 33: Punkte 1-5-6. */
  abschluss: { punkte: "156", seite: 33 },
  /** Siffertecken - 5.1, S. 49: Punkte 3-4-5-6 vor der ersten Ziffer einer Ziffernfolge. */
  zahl: { punkte: "3456", seite: 49 },
} as const;

/** Alle Zeichen der Norm, die der Lehrgang oder die Engine benutzt, mit ihren Zellen. */
export const SV_ALLE: readonly SvZeichen[] = [
  ...SV_BUCHSTABEN,
  ...SV_DIAKRITISCH,
  ...SV_SATZZEICHEN,
  ...SV_ZIFFERN,
  ...SV_RECHENZEICHEN,
];

/**
 * ★ World Braille Usage 2013, „Swedish", S. 203 (PDF-Seite 219) - die zweite Quelle der Gegenprobe.
 * Die Spalten der Seite sind im Text versetzt; die Zuordnung der 18 Satzzeichen zu ihren 18 Zellen ist
 * aus der Reihenfolge gelesen. Punkte als "1245"; Zellfolge durch Leerzeichen.
 */
const WBU_TEXT =
  "a1 b12 c14 d145 e15 f124 g1245 h125 i24 j245 k13 l123 m134 n1345 o135 p1234 q12345 r1235 s234 " +
  "t2345 u136 v1236 x1346 y13456 z1356 w2456 å16 ä345 ö246 à12356 é123456 è2346 ü1256";

export const SV_WBU: Readonly<Record<string, { punkte: string; seite: number }>> = {
  ...Object.fromEntries(
    WBU_TEXT.split(" ").map((e) => [[...e][0], { punkte: e.slice([...e][0].length), seite: 203 }]),
  ),
  ",": { punkte: "2", seite: 203 },
  ";": { punkte: "23", seite: 203 },
  ":": { punkte: "25", seite: 203 },
  ".": { punkte: "3", seite: 203 },
  "?": { punkte: "26", seite: 203 },
  "!": { punkte: "235", seite: 203 },
  "’": { punkte: "5", seite: 203 },
  "”": { punkte: "56", seite: 203 },
  "(": { punkte: "236", seite: 203 },
  ")": { punkte: "356", seite: 203 },
  "[": { punkte: "12356", seite: 203 },
  "]": { punkte: "23456", seite: 203 },
  "…": { punkte: "3 3 3", seite: 203 },
  "-": { punkte: "36", seite: 203 },
  "/": { punkte: "34", seite: 203 },
  "*": { punkte: "35", seite: 203 },
};
