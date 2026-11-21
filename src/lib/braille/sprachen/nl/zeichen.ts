/**
 * ════════════════════════════════════════════════════════════════════════════
 * NIEDERLÄNDISCH (nl) - DIE ZEICHENTABELLE NACH DER NORM
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Quelle (maßgeblich): Braille Autoriteit, *Braillestandaard voor algemeen gebruik in het Nederlandse
 * taalgebied*, **versie 2019** (veröffentlicht 24. April 2020; Nachfolger der zespunts Braillestandaard 2017).
 * Gelesen als PDF von braille-autoriteit.org (0,24 MB); die Zeichenbilder der Tabellen stehen dort als
 * Unicode-Braillemuster im Text und wurden Zeichen für Zeichen in Punktnummern umgerechnet. Seitenzahlen =
 * die Seiten der Norm (PDF-Seite = gedruckte Seite).
 * Gegenprobe: liblouis 3.39.0 `nl-NL-g0` (steht auf Version 2017.1, liblouis-Issue #952) und
 * *World Braille Usage* 2013, S. 174 (nach der Braillestandaard 2005) - Zeichen für Zeichen in
 * `BEFUND-2026-11-07-PUNKTGENAU-NL-NORM.md`.
 * ⚠️ Bei Abweichung gilt die NORM (2019), nicht liblouis (Auftrag Johannes 06.11.).
 *
 * Punkte in der Schreibweise "1245" = Punkte 1, 2, 4, 5. `seite` = Seite der Norm.
 */

export interface NlZeichen {
  /** Das Zeichen des Drucks. */
  zeichen: string;
  /** Punkte der Zelle(n); mehrere Zellen durch Leerzeichen getrennt. */
  punkte: string;
  /** Name in der Norm (niederländisch). */
  name: string;
  /** Seite der Norm. */
  seite: number;
}

/** Kapitel 1 „Nederlandse brailletabel" (S. 8-10): die 26 Buchstaben (w steht als 1.40 hinter ö). */
export const NL_BUCHSTABEN: readonly NlZeichen[] = [
  { zeichen: "a", punkte: "1", name: "a", seite: 8 },
  { zeichen: "b", punkte: "12", name: "be", seite: 8 },
  { zeichen: "c", punkte: "14", name: "ce", seite: 8 },
  { zeichen: "d", punkte: "145", name: "de", seite: 8 },
  { zeichen: "e", punkte: "15", name: "e", seite: 8 },
  { zeichen: "f", punkte: "124", name: "ef", seite: 8 },
  { zeichen: "g", punkte: "1245", name: "ge", seite: 8 },
  { zeichen: "h", punkte: "125", name: "ha", seite: 8 },
  { zeichen: "i", punkte: "24", name: "ie", seite: 8 },
  { zeichen: "j", punkte: "245", name: "je", seite: 8 },
  { zeichen: "k", punkte: "13", name: "ka", seite: 8 },
  { zeichen: "l", punkte: "123", name: "el", seite: 8 },
  { zeichen: "m", punkte: "134", name: "em", seite: 8 },
  { zeichen: "n", punkte: "1345", name: "en", seite: 8 },
  { zeichen: "o", punkte: "135", name: "o", seite: 9 },
  { zeichen: "p", punkte: "1234", name: "pe", seite: 9 },
  { zeichen: "q", punkte: "12345", name: "kuu", seite: 9 },
  { zeichen: "r", punkte: "1235", name: "er", seite: 9 },
  { zeichen: "s", punkte: "234", name: "es", seite: 9 },
  { zeichen: "t", punkte: "2345", name: "te", seite: 9 },
  { zeichen: "u", punkte: "136", name: "uu", seite: 9 },
  { zeichen: "v", punkte: "1236", name: "ve", seite: 9 },
  { zeichen: "w", punkte: "2456", name: "we", seite: 10 },
  { zeichen: "x", punkte: "1346", name: "iks", seite: 9 },
  { zeichen: "y", punkte: "13456", name: "ij", seite: 9 },
  { zeichen: "z", punkte: "1356", name: "zet", seite: 9 },
];

/**
 * Kapitel 1 (S. 9-10) und 2.6 (S. 16): Buchstaben mit Akzent oder Trema. Einige teilen sich ein Zeichen
 * (à und á = 12356, ù und ú = 23456, í = 34 wie der Schrägstrich): die Norm erlaubt das ausdrücklich,
 * der Lehrgang benutzt nur é ë ï.
 */
export const NL_DIAKRITISCH: readonly NlZeichen[] = [
  { zeichen: "é", punkte: "123456", name: "e accent aigu", seite: 9 },
  { zeichen: "è", punkte: "2346", name: "e accent grave", seite: 9 },
  { zeichen: "ë", punkte: "1246", name: "e trema", seite: 10 },
  { zeichen: "ï", punkte: "12456", name: "i trema", seite: 10 },
  { zeichen: "ü", punkte: "1256", name: "u trema", seite: 10 },
  { zeichen: "ö", punkte: "246", name: "o trema", seite: 10 },
  { zeichen: "ä", punkte: "345", name: "a trema", seite: 10 },
  { zeichen: "ç", punkte: "12346", name: "c cedille", seite: 9 },
  { zeichen: "à", punkte: "12356", name: "a accent grave", seite: 9 },
  { zeichen: "â", punkte: "16", name: "a accent circumflex", seite: 9 },
  { zeichen: "ê", punkte: "126", name: "e accent circumflex", seite: 9 },
  { zeichen: "î", punkte: "146", name: "i accent circumflex", seite: 9 },
  { zeichen: "ô", punkte: "1456", name: "o accent circumflex", seite: 9 },
  { zeichen: "û", punkte: "156", name: "u accent circumflex", seite: 9 },
  { zeichen: "ù", punkte: "23456", name: "u accent grave", seite: 9 },
  { zeichen: "á", punkte: "12356", name: "a accent aigu", seite: 16 },
  { zeichen: "í", punkte: "34", name: "i accent aigu", seite: 16 },
  { zeichen: "ó", punkte: "346", name: "o accent aigu", seite: 16 },
  { zeichen: "ú", punkte: "23456", name: "u accent aigu", seite: 16 },
];

/** Kapitel 2 (S. 12-27): Satz- und andere Zeichen, die der Lehrgang benutzt oder die die Engine kennt. */
export const NL_SATZZEICHEN: readonly NlZeichen[] = [
  { zeichen: ",", punkte: "2", name: "komma", seite: 25 },
  { zeichen: ";", punkte: "23", name: "puntkomma", seite: 25 },
  { zeichen: ":", punkte: "25", name: "dubbele punt", seite: 25 },
  { zeichen: ".", punkte: "256", name: "punt", seite: 27 },
  { zeichen: "?", punkte: "26", name: "vraagteken", seite: 25 },
  { zeichen: "!", punkte: "235", name: "uitroepteken", seite: 25 },
  { zeichen: '"', punkte: "2356", name: "dubbel aanhalingsteken openen/sluiten", seite: 12 },
  { zeichen: "'", punkte: "3", name: "apostrof, enkel aanhalingsteken", seite: 12 },
  { zeichen: "(", punkte: "236", name: "rond haakje openen", seite: 18 },
  { zeichen: ")", punkte: "356", name: "rond haakje sluiten", seite: 18 },
  { zeichen: "[", punkte: "12356", name: "vierkant haakje openen", seite: 18 },
  { zeichen: "]", punkte: "23456", name: "vierkant haakje sluiten", seite: 18 },
  { zeichen: "{", punkte: "5 12356", name: "accolade openen", seite: 18 },
  { zeichen: "}", punkte: "5 23456", name: "accolade sluiten", seite: 18 },
  { zeichen: "-", punkte: "36", name: "liggend streepje", seite: 26 },
  { zeichen: "–", punkte: "36", name: "gedachtestreepje (liggend streepje)", seite: 26 },
  { zeichen: "/", punkte: "34", name: "slash", seite: 25 },
  { zeichen: "*", punkte: "35", name: "sterretje", seite: 15 },
  { zeichen: "…", punkte: "256 256 256", name: "drie punten", seite: 27 },
];

/** Kapitel 3.1 (S. 30): Ziffern = Cijferteken (3-4-5-6) vor den ersten zehn Buchstaben; a=1 ... j=0. */
export const NL_ZIFFERN: readonly NlZeichen[] = [
  { zeichen: "1", punkte: "1", name: "een (a)", seite: 11 },
  { zeichen: "2", punkte: "12", name: "twee (b)", seite: 11 },
  { zeichen: "3", punkte: "14", name: "drie (c)", seite: 11 },
  { zeichen: "4", punkte: "145", name: "vier (d)", seite: 11 },
  { zeichen: "5", punkte: "15", name: "vijf (e)", seite: 11 },
  { zeichen: "6", punkte: "124", name: "zes (f)", seite: 11 },
  { zeichen: "7", punkte: "1245", name: "zeven (g)", seite: 11 },
  { zeichen: "8", punkte: "125", name: "acht (h)", seite: 11 },
  { zeichen: "9", punkte: "24", name: "negen (i)", seite: 11 },
  { zeichen: "0", punkte: "245", name: "nul (j)", seite: 11 },
];

/**
 * Kapitel 3.2 (S. 31-32): die Grundrechenzeichen, in Textbraille mit Leerzeichen davor und dahinter.
 * Das Zeichen ÷ kennt die Norm nicht (Deelteken = ":" 2-5-6 oder "/" 3-4); es steht deshalb NICHT hier.
 */
export const NL_RECHENZEICHEN: readonly NlZeichen[] = [
  { zeichen: "+", punkte: "235", name: "plusteken", seite: 31 },
  { zeichen: "−", punkte: "36", name: "minteken", seite: 31 },
  { zeichen: "=", punkte: "2356", name: "isgelijkteken", seite: 31 },
  { zeichen: "×", punkte: "236", name: "maalteken", seite: 31 },
];

/** Steuerzeichen (Kapitel 2.10, 2.11, 3.1). */
export const NL_STEUER = {
  /** Hoofdletterteken - 2.11, S. 20: Punkte 4-6 vor EINER Hoofdletter. */
  hoofdletter: { punkte: "46", seite: 20 },
  /** Permanent hoofdletterteken - 2.11, S. 20: Punkte 4-5 vor zwei oder mehr aufeinanderfolgenden Hoofdletters. */
  permanent: { punkte: "45", seite: 20 },
  /** Herstelteken / sleutelteken eerste betekenis - 2.10, S. 19: Punkt 6. */
  herstel: { punkte: "6", seite: 19 },
  /** Cijferteken - 3.1, S. 30: Punkte 3-4-5-6 vor dem ersten Cijfer. */
  zahl: { punkte: "3456", seite: 30 },
} as const;

/** Alle Zeichen der Norm, die der Lehrgang oder die Engine benutzt, mit ihren Zellen. */
export const NL_ALLE: readonly NlZeichen[] = [
  ...NL_BUCHSTABEN,
  ...NL_DIAKRITISCH,
  ...NL_SATZZEICHEN,
  ...NL_ZIFFERN,
  ...NL_RECHENZEICHEN,
];

/**
 * ★ World Braille Usage 2013, „Dutch", S. 174 (PDF-Seite 190; Quelle der Seite: Braillestandaard 2005) - die zweite
 * Quelle der Gegenprobe. Die Spalten der Seite sind im Text versetzt; die 18 Satzzeichen sind aus der Reihenfolge den
 * 18 Zellen zugeordnet. Die WBU kennt noch nicht á í ó ú (erst 2019) und nennt 345 (ä) nicht.
 */
const WBU_TEXT =
  "a1 b12 c14 d145 e15 f124 g1245 h125 i24 j245 k13 l123 m134 n1345 o135 p1234 q12345 r1235 s234 " +
  "t2345 u136 v1236 x1346 y13456 z1356 w2456 é123456 à12356 è2346 ù23456 ç12346 â16 ê126 î146 ô1456 û156 " +
  "ë1246 ï12456 ü1256 ö246";

export const NL_WBU: Readonly<Record<string, { punkte: string; seite: number }>> = {
  ...Object.fromEntries(
    WBU_TEXT.split(" ").map((e) => [[...e][0], { punkte: e.slice([...e][0].length), seite: 174 }]),
  ),
  ",": { punkte: "2", seite: 174 },
  ";": { punkte: "23", seite: 174 },
  ":": { punkte: "25", seite: 174 },
  ".": { punkte: "256", seite: 174 },
  "?": { punkte: "26", seite: 174 },
  "!": { punkte: "235", seite: 174 },
  "'": { punkte: "3", seite: 174 },
  '"': { punkte: "2356", seite: 174 },
  "(": { punkte: "236", seite: 174 },
  ")": { punkte: "356", seite: 174 },
  "[": { punkte: "12356", seite: 174 },
  "]": { punkte: "23456", seite: 174 },
  "…": { punkte: "256 256 256", seite: 174 },
  "-": { punkte: "36", seite: 174 },
  "/": { punkte: "34", seite: 174 },
  "*": { punkte: "35", seite: 174 },
};
