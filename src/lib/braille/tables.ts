/**
 * Punktschrift-Tabellen für das deutsche Braille (6 Punkt: Basis-/Vollschrift).
 *
 * Quelle der Punktwerte: liblouis (de-chardefs6.cti, de-g0-core.uti,
 * de-g1-core.cti) — die Übersetzungs-Datenbasis aller Screenreader, die das
 * offizielle „System der deutschen Brailleschrift" (2015/2018) umsetzt.
 *
 * Computerbraille (8 Punkt) folgt in einem späteren Schritt (de-chardefs8.cti).
 */
import { Cell, parseDots } from "./cell";

export type BrailleSystem = "basis" | "voll" | "computer";

export const SYSTEM_LABELS: Record<BrailleSystem, string> = {
  basis: "Basisschrift",
  voll: "Vollschrift",
  computer: "Computerbraille",
};

export const SYSTEM_HINTS: Record<BrailleSystem, string> = {
  basis: "Buchstabe für Buchstabe, Großbuchstaben angekündigt.",
  voll: "Wie Basisschrift, aber mit Lautgruppen (au, eu, ei, ch, sch, st …).",
  computer: "8 Punkt: jedes Zeichen genau eine Zelle (Punkt 7/8).",
};

// ---- Steuerzeichen (6 Punkt) -------------------------------------------------
export const NUMSIGN = parseDots("3456"); // Zahlzeichen
export const CAPS_LETTER = parseDots("46"); // Ankündigung eines Großbuchstabens
export const CAPS_WORD = parseDots("45"); // Beginn Großbuchstabenfolge
export const CAPS_WORD_END = parseDots("6"); // Ende Großbuchstabenfolge

// ---- Buchstaben (6 Punkt) ----------------------------------------------------
const LETTERS_6_DOTS: Record<string, string> = {
  a: "1", b: "12", c: "14", d: "145", e: "15", f: "124", g: "1245", h: "125",
  i: "24", j: "245", k: "13", l: "123", m: "134", n: "1345", o: "135", p: "1234",
  q: "12345", r: "1235", s: "234", t: "2345", u: "136", v: "1236", w: "2456",
  x: "1346", y: "13456", z: "1356",
  ä: "345", ö: "246", ü: "1256", ß: "2346",
};

export const LETTERS_6: Record<string, Cell> = Object.fromEntries(
  Object.entries(LETTERS_6_DOTS).map(([k, v]) => [k, parseDots(v)]),
);

// ---- Ziffern: 1 = a … 9 = i, 0 = j (jeweils mit vorangestelltem Zahlzeichen) -
export const DIGIT_CELLS: Cell[] = [
  parseDots("245"), // 0 → j
  parseDots("1"), //   1 → a
  parseDots("12"), //  2 → b
  parseDots("14"), //  3 → c
  parseDots("145"), // 4 → d
  parseDots("15"), //  5 → e
  parseDots("124"), // 6 → f
  parseDots("1245"), //7 → g
  parseDots("125"), // 8 → h
  parseDots("24"), //  9 → i
];

// ---- Satz- und Rechenzeichen (6 Punkt) --------------------------------------
const SYMBOLS_6_DOTS: Record<string, string> = {
  // Satzzeichen
  ".": "3", ",": "2", ";": "23", ":": "25", "?": "26", "!": "235",
  "(": "236", ")": "356", "-": "36", "–": "36", "—": "36", "/": "256",
  "'": "6", "*": "35",
  // deutsche Anführungszeichen
  "„": "236", "“": "356", "”": "356", "«": "236", "»": "356",
  // Rechenzeichen (Grundrechenarten)
  "+": "235", "−": "36", "×": "236", "=": "2356", "<": "56", ">": "45",
};

export const SYMBOLS_6: Record<string, Cell> = Object.fromEntries(
  Object.entries(SYMBOLS_6_DOTS).map(([k, v]) => [k, parseDots(v)]),
);

/**
 * Mehrzellige 6-Punkt-Zeichen (Basisschrift). Muster EXAKT aus liblouis
 * übernommen (2026-07-09 gegen de-g0 verifiziert, keine eigene Erfindung):
 *  • % → ⠼⠚⠴ (Zahlzeichen · j · Punkte 3·5·6) — de-g0-Ausgabe für „%"
 *  • § → ⠬ (Punkte 3·4·6) — de-chardefs6.cti „sign \x00A7 346"
 * Gebraucht von den Zusatz-Etappen b13d (Prozent) und b13e (Paragraf).
 */
export const MULTI_SYMBOLS_6: Record<string, Cell[]> = {
  "%": [parseDots("3456"), parseDots("245"), parseDots("356")],
  "§": [parseDots("346")],
};

/** Zeichen, die als Rechenzeichen gelten (nur für die Rückmeldung/Statistik). */
export const MATH_CHARS = new Set(["+", "−", "×", "=", "<", ">"]);

// ---- Vollschrift-Lautgruppen (de-g1-core.cti), längste zuerst ----------------
export const CONTRACTIONS_VOLL: { seq: string; cell: Cell }[] = [
  { seq: "sch", cell: parseDots("156") },
  { seq: "st", cell: parseDots("23456") },
  { seq: "au", cell: parseDots("16") },
  { seq: "äu", cell: parseDots("34") },
  { seq: "eu", cell: parseDots("126") },
  { seq: "ei", cell: parseDots("146") },
  { seq: "ie", cell: parseDots("346") },
  { seq: "ch", cell: parseDots("1456") },
].sort((a, b) => b.seq.length - a.seq.length);

// ---- Computerbraille (8 Punkt) ----------------------------------------------
// Jedes Zeichen ist genau EINE Zelle — kein Zahl-, kein Großschreibzeichen.
// Grundbuchstaben wie 6 Punkt; Großbuchstaben + Punkt 7; Ziffern = Punkte + 6;
// Umlaute + Punkt 8. Quelle: liblouis de-chardefs8.cti (Eurobraille, 8 Punkt).
const DOT7 = parseDots("7");

export const CHAR_TO_CELL_8: Record<string, Cell> = { " ": 0 };
for (const ch of "abcdefghijklmnopqrstuvwxyz") {
  CHAR_TO_CELL_8[ch] = LETTERS_6[ch]; // Grundzelle
  CHAR_TO_CELL_8[ch.toUpperCase()] = LETTERS_6[ch] | DOT7; // Großbuchstabe + Punkt 7
}
Object.assign(CHAR_TO_CELL_8, {
  "0": parseDots("346"), "1": parseDots("16"), "2": parseDots("126"),
  "3": parseDots("146"), "4": parseDots("1456"), "5": parseDots("156"),
  "6": parseDots("1246"), "7": parseDots("12456"), "8": parseDots("1256"),
  "9": parseDots("246"),
  "ä": parseDots("3458"), "ö": parseDots("2468"), "ü": parseDots("12568"),
  "ß": parseDots("34568"), "Ä": parseDots("567"), "Ö": parseDots("358"),
  "Ü": parseDots("2368"),
  "!": parseDots("5"), '"': parseDots("4"), "#": parseDots("3456"),
  $: parseDots("46"), "%": parseDots("123456"), "&": parseDots("12346"),
  "'": parseDots("6"), "(": parseDots("236"), ")": parseDots("356"),
  "*": parseDots("35"), "+": parseDots("235"), ",": parseDots("2"),
  "-": parseDots("36"), "−": parseDots("36"), ".": parseDots("3"),
  "/": parseDots("256"), ":": parseDots("25"), ";": parseDots("23"),
  "<": parseDots("56"), "=": parseDots("2356"), ">": parseDots("45"),
  "?": parseDots("26"), "@": parseDots("3457"), "×": parseDots("2348"),
  // Technische Sonderzeichen (8-Punkt-Eurobraille). Quelle: liblouis
  // de-chardefs8.cti (SBS, EUROBRAILLE) — Klammern, Code- und Schriftzeichen
  // für E-Mail/Passwörter/Code, die in 6 Punkt nicht existieren.
  "[": parseDots("123567"), "]": parseDots("234567"),
  "{": parseDots("12356"), "}": parseDots("23456"),
  "\\": parseDots("347"), "|": parseDots("34"),
  "^": parseDots("23467"), "_": parseDots("4567"),
  "`": parseDots("345"), "~": parseDots("2346"),
  "§": parseDots("357"), "°": parseDots("4568"),
  // Euro: nie offiziell genormt; gängige Eurobraille-Variante Punkte 4·5·7 (braille.ch).
  "€": parseDots("457"),
});
