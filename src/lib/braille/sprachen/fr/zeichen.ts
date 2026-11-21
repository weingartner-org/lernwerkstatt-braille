/**
 * ════════════════════════════════════════════════════════════════════════════
 * FRANZÖSISCH (fr) - DIE ZEICHENTABELLE NACH DER NORM
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Quelle (maßgeblich): CEBF, *Code braille français uniformisé pour la
 * transcription des textes imprimés* (CBFU), 2e édition, septembre 2008.
 * Gelesen als PDF-Text (AVH/Pharmabraille-Kopie, Seitenzahlen = die der Norm).
 * Gegenprobe: liblouis 3.39.0 `fr-bfu-comp6` und *World Braille Usage* 2013,
 * S. 180-181 - Zeichen für Zeichen in `BEFUND-2026-11-07-PUNKTGENAU-FR-NORM.md`.
 * ⚠️ Bei Abweichung gilt die NORM, nicht liblouis (Auftrag Johannes 06.11.).
 *
 * Punkte in der Schreibweise "1245" = Punkte 1, 2, 4, 5.
 * `seite` = Seite der Norm, auf der das Zeichen steht.
 */

export interface FrZeichen {
  /** Das Zeichen des Drucks. */
  zeichen: string;
  /** Punkte der Zelle(n); mehrere Zellen durch Leerzeichen getrennt. */
  punkte: string;
  /** Name in der Norm (französisch). */
  name: string;
  /** Seite der Norm. */
  seite: number;
}

/** Tableau 1 (S. 15-17): die Buchstaben. */
export const FR_BUCHSTABEN: readonly FrZeichen[] = [
  { zeichen: "a", punkte: "1", name: "lettre a", seite: 15 },
  { zeichen: "b", punkte: "12", name: "lettre b", seite: 15 },
  { zeichen: "c", punkte: "14", name: "lettre c", seite: 15 },
  { zeichen: "d", punkte: "145", name: "lettre d", seite: 15 },
  { zeichen: "e", punkte: "15", name: "lettre e", seite: 15 },
  { zeichen: "f", punkte: "124", name: "lettre f", seite: 15 },
  { zeichen: "g", punkte: "1245", name: "lettre g", seite: 15 },
  { zeichen: "h", punkte: "125", name: "lettre h", seite: 15 },
  { zeichen: "i", punkte: "24", name: "lettre i", seite: 15 },
  { zeichen: "j", punkte: "245", name: "lettre j", seite: 15 },
  { zeichen: "k", punkte: "13", name: "lettre k", seite: 15 },
  { zeichen: "l", punkte: "123", name: "lettre l", seite: 15 },
  { zeichen: "m", punkte: "134", name: "lettre m", seite: 16 },
  { zeichen: "n", punkte: "1345", name: "lettre n", seite: 16 },
  { zeichen: "o", punkte: "135", name: "lettre o", seite: 16 },
  { zeichen: "p", punkte: "1234", name: "lettre p", seite: 16 },
  { zeichen: "q", punkte: "12345", name: "lettre q", seite: 16 },
  { zeichen: "r", punkte: "1235", name: "lettre r", seite: 16 },
  { zeichen: "s", punkte: "234", name: "lettre s", seite: 16 },
  { zeichen: "t", punkte: "2345", name: "lettre t", seite: 16 },
  { zeichen: "u", punkte: "136", name: "lettre u", seite: 16 },
  { zeichen: "v", punkte: "1236", name: "lettre v", seite: 16 },
  { zeichen: "x", punkte: "1346", name: "lettre x", seite: 16 },
  { zeichen: "y", punkte: "13456", name: "lettre y", seite: 16 },
  { zeichen: "z", punkte: "1356", name: "lettre z", seite: 16 },
  { zeichen: "ç", punkte: "12346", name: "c cédille", seite: 16 },
  { zeichen: "é", punkte: "123456", name: "e accent aigu", seite: 16 },
  { zeichen: "à", punkte: "12356", name: "a accent grave", seite: 16 },
  { zeichen: "è", punkte: "2346", name: "e accent grave", seite: 16 },
  { zeichen: "ù", punkte: "23456", name: "u accent grave", seite: 16 },
  { zeichen: "â", punkte: "16", name: "a accent circonflexe", seite: 16 },
  { zeichen: "ê", punkte: "126", name: "e accent circonflexe", seite: 16 },
  { zeichen: "î", punkte: "146", name: "i accent circonflexe", seite: 16 },
  { zeichen: "ô", punkte: "1456", name: "o accent circonflexe", seite: 16 },
  { zeichen: "û", punkte: "156", name: "u accent circonflexe", seite: 16 },
  { zeichen: "ë", punkte: "1246", name: "e tréma", seite: 16 },
  { zeichen: "ï", punkte: "12456", name: "i tréma", seite: 17 },
  { zeichen: "ü", punkte: "1256", name: "u tréma", seite: 17 },
  { zeichen: "œ", punkte: "246", name: "oe ligaturé", seite: 17 },
  { zeichen: "w", punkte: "2456", name: "lettre w", seite: 17 },
];

/** Tableau 1 (S. 17) und Absätze 1.2 f, 1.3, 1.4 (S. 29-33): Satzzeichen und Symbole. */
export const FR_SATZZEICHEN: readonly FrZeichen[] = [
  { zeichen: ",", punkte: "2", name: "virgule", seite: 17 },
  { zeichen: ";", punkte: "23", name: "point-virgule", seite: 17 },
  { zeichen: ":", punkte: "25", name: "deux-points", seite: 17 },
  { zeichen: ".", punkte: "256", name: "point", seite: 17 },
  { zeichen: "?", punkte: "26", name: "point d'interrogation", seite: 17 },
  { zeichen: "!", punkte: "235", name: "point d'exclamation", seite: 17 },
  { zeichen: "«", punkte: "2356", name: "guillemet ouvrant (1.4, S. 33: auch \" und “)", seite: 17 },
  { zeichen: "»", punkte: "2356", name: "guillemet fermant (1.4, S. 33: auch \" und ”)", seite: 17 },
  { zeichen: "(", punkte: "236", name: "parenthèse ouvrante", seite: 17 },
  { zeichen: ")", punkte: "356", name: "parenthèse fermante", seite: 17 },
  { zeichen: "'", punkte: "3", name: "apostrophe", seite: 17 },
  { zeichen: "-", punkte: "36", name: "trait d'union", seite: 17 },
  { zeichen: "/", punkte: "34", name: "barre oblique (1.2 f, S. 29)", seite: 17 },
  { zeichen: "@", punkte: "345", name: "arobas", seite: 17 },
  { zeichen: "…", punkte: "256 256 256", name: "points de suspension (Tableau 3)", seite: 21 },
  { zeichen: "–", punkte: "36 36", name: "tiret (Tableau 3)", seite: 21 },
];

/** Tableau 2 (S. 19): Antoine-Ziffern; gelten NUR nach dem mathematischen Modifikator (Punkt 6). */
export const FR_ZIFFERN: readonly FrZeichen[] = [
  { zeichen: "1", punkte: "16", name: "un", seite: 19 },
  { zeichen: "2", punkte: "126", name: "deux", seite: 19 },
  { zeichen: "3", punkte: "146", name: "trois", seite: 19 },
  { zeichen: "4", punkte: "1456", name: "quatre", seite: 19 },
  { zeichen: "5", punkte: "156", name: "cinq", seite: 19 },
  { zeichen: "6", punkte: "1246", name: "six", seite: 19 },
  { zeichen: "7", punkte: "12456", name: "sept", seite: 19 },
  { zeichen: "8", punkte: "1256", name: "huit", seite: 19 },
  { zeichen: "9", punkte: "246", name: "neuf", seite: 19 },
  { zeichen: "0", punkte: "3456", name: "zéro", seite: 19 },
];

/** Tableau 2 (S. 19): Grundrechenzeichen (ebenfalls nur nach dem Modifikator). */
export const FR_RECHENZEICHEN: readonly FrZeichen[] = [
  { zeichen: "+", punkte: "235", name: "plus", seite: 19 },
  { zeichen: "−", punkte: "36", name: "moins", seite: 19 },
  { zeichen: "×", punkte: "35", name: "multiplié par", seite: 19 },
  { zeichen: "÷", punkte: "25", name: "divisé par", seite: 19 },
  { zeichen: "=", punkte: "2356", name: "égale", seite: 19 },
];

/** Steuerzeichen (Tableau 1, S. 18, und Absätze 1.1, 1.2, 2.1). */
export const FR_STEUER = {
  /** Indicateur de majuscule simple - 1.1, S. 25 (Tableau 1, S. 18). */
  majuskel: { punkte: "46", seite: 18 },
  /** Indicateur de majuscules multiples - nur „règles complémentaires" 2.1, S. 42-43: NICHT im Lehrgang. */
  majuskelMehrfach: { punkte: "46 46", seite: 42 },
  /** Modificateur mathématique, vor Antoine-Ziffern und Rechenzeichen - 1.2, S. 27 (Tableau 2, S. 19). */
  mathModifikator: { punkte: "6", seite: 18 },
  /** Modificateur numérique für Louis-Braille-Ziffern - Tableau 2a, S. 20: im Lehrgang NICHT benutzt (1.2 a: nur Antoine). */
  zahlzeichenLouisBraille: { punkte: "3456", seite: 17 },
} as const;

/** Tableau 2a (S. 20): Louis-Braille-Ziffern - nur für Musik und mehrsprachige Anzeigen; der Lehrgang lehrt sie nicht. */
export const FR_ZIFFERN_LOUIS_BRAILLE: readonly FrZeichen[] = [
  { zeichen: "1", punkte: "1", name: "un", seite: 20 },
  { zeichen: "2", punkte: "12", name: "deux", seite: 20 },
  { zeichen: "3", punkte: "14", name: "trois", seite: 20 },
  { zeichen: "4", punkte: "145", name: "quatre", seite: 20 },
  { zeichen: "5", punkte: "15", name: "cinq", seite: 20 },
  { zeichen: "6", punkte: "124", name: "six", seite: 20 },
  { zeichen: "7", punkte: "1245", name: "sept", seite: 20 },
  { zeichen: "8", punkte: "125", name: "huit", seite: 20 },
  { zeichen: "9", punkte: "24", name: "neuf", seite: 20 },
  { zeichen: "0", punkte: "245", name: "zéro", seite: 20 },
];

/** Alle Zeichen der Norm, die der Lehrgang benutzt, mit ihren Zellen. */
export const FR_ALLE: readonly FrZeichen[] = [
  ...FR_BUCHSTABEN,
  ...FR_SATZZEICHEN,
  ...FR_ZIFFERN,
  ...FR_RECHENZEICHEN,
];

/**
 * ★ World Braille Usage 2013, „French", S. 180-181 - die zweite Quelle der
 * Gegenprobe. Nur das, was dort steht: Buchstaben (S. 180), Satzzeichen,
 * Majuskel und Antoine-Ziffern (S. 181). Punkte als "1245"; Zellfolge durch
 * Leerzeichen. Nicht enthalten ist dort: `@`, `…`, `–`, `÷`, `×`, `=`, `+`.
 */
/** Die Buchstaben-Tabelle der WBU (S. 180), von dort abgeschrieben - unabhängig von `FR_BUCHSTABEN`. */
const WBU_BUCHSTABEN_TEXT =
  "a1 b12 c14 d145 e15 f124 g1245 h125 i24 j245 k13 l123 m134 n1345 o135 p1234 q12345 r1235 s234 t2345 " +
  "u136 v1236 x1346 y13456 z1356 ç12346 é123456 à12356 è2346 ù23456 â16 ê126 î146 ô1456 û156 ë1246 " +
  "ï12456 ü1256 œ246 w2456";

export const FR_WBU: Readonly<Record<string, { punkte: string; seite: number }>> = {
  ...Object.fromEntries(
    WBU_BUCHSTABEN_TEXT.split(" ").map((e) => [e[0], { punkte: e.slice(1), seite: 180 }]),
  ),
  ",": { punkte: "2", seite: 181 },
  ";": { punkte: "23", seite: 181 },
  ":": { punkte: "25", seite: 181 },
  ".": { punkte: "256", seite: 181 },
  "?": { punkte: "26", seite: 181 },
  "!": { punkte: "235", seite: 181 },
  "'": { punkte: "3", seite: 181 },
  "«": { punkte: "2356", seite: 181 },
  "»": { punkte: "2356", seite: 181 },
  "(": { punkte: "236", seite: 181 },
  ")": { punkte: "356", seite: 181 },
  "-": { punkte: "36", seite: 181 },
  "/": { punkte: "34", seite: 181 },
  "1": { punkte: "6 16", seite: 181 },
  "2": { punkte: "6 126", seite: 181 },
  "3": { punkte: "6 146", seite: 181 },
  "4": { punkte: "6 1456", seite: 181 },
  "5": { punkte: "6 156", seite: 181 },
  "6": { punkte: "6 1246", seite: 181 },
  "7": { punkte: "6 12456", seite: 181 },
  "8": { punkte: "6 1256", seite: 181 },
  "9": { punkte: "6 246", seite: 181 },
  "0": { punkte: "6 3456", seite: 181 },
};
