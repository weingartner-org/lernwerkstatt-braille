/**
 * Render-Brücke: Braillezelle → Zeichen für die HBS-Schrift.
 *
 * Die HBS-Schriften bilden lateinische Zeichen als Punktbilder ab (kein
 * Unicode-Braille-Block). Welches Zeichen welches Punktbild ergibt, legt die
 * „Eurobraille"-Anzeige-Tabelle fest (liblouis de-eurobrl6.dis) — der im
 * deutschsprachigen Raum verbreitete 6-Punkt-Zeichensatz. Sie deckt alle 63
 * Punktmuster ab, also lässt sich jede Zelle der Engine in der HBS-Schrift
 * anzeigen.
 *
 * Hinweis: Die Punkte-Logik der Engine ist die Quelle der Wahrheit. Diese
 * Brücke dient nur der Optik; das SVG-Punktraster (BrailleCell) rendert
 * dieselben Zellen exakt und font-unabhängig.
 */
import { Cell, cellToUnicode, parseDots } from "./cell";
import { CHAR_TO_CELL_8 } from "./tables";

// Zeichen → Punkte (aus de-eurobrl6.dis). Wird zu Zelle → Zeichen invertiert.
const EUROBRAILLE_6: Record<string, string> = {
  a: "1", b: "12", c: "14", d: "145", e: "15", f: "124", g: "1245", h: "125",
  i: "24", j: "245", k: "13", l: "123", m: "134", n: "1345", o: "135", p: "1234",
  q: "12345", r: "1235", s: "234", t: "2345", u: "136", v: "1236", w: "2456",
  x: "1346", y: "13456", z: "1356",
  "&": "12346", "%": "123456", "{": "12356", "~": "2346", "}": "23456",
  "1": "16", "2": "126", "3": "146", "4": "1456", "5": "156", "6": "1246",
  "7": "12456", "8": "1256", "9": "246", "0": "346",
  ",": "2", ";": "23", ":": "25", "/": "256", "?": "26", "+": "235", "=": "2356",
  "(": "236", "*": "35", ")": "356", ".": "3", "-": "36", "|": "34", "`": "345",
  "#": "3456", '"': "4", "!": "5", ">": "45", $: "46", _: "456", "<": "56",
  "'": "6",
};

const CELL_TO_CHAR_6 = new Map<Cell, string>([[0, " "]]);
for (const [char, dots] of Object.entries(EUROBRAILLE_6)) {
  CELL_TO_CHAR_6.set(parseDots(dots), char);
}

/** Zelle → ein Zeichen für die HBS-6-Punkt-Schrift (Rückfall: Unicode-Braille). */
export function cellToFontChar6(cell: Cell): string {
  return CELL_TO_CHAR_6.get(cell) ?? cellToUnicode(cell);
}

/** Zellfolge → Zeichenkette für ein <span class="font-braille-6">. */
export function cellsToFontString6(cells: readonly Cell[]): string {
  let out = "";
  for (const c of cells) out += cellToFontChar6(c);
  return out;
}

// Computerbraille (8 Punkt): Zelle → Zeichen für die HBS-8-Punkt-Schrift,
// invertiert aus CHAR_TO_CELL_8 (Eurobraille). Buchstaben gewinnen bei
// Mehrfachbelegung (werden zuerst eingetragen).
const CELL_TO_CHAR_8 = new Map<Cell, string>();
for (const [char, cell] of Object.entries(CHAR_TO_CELL_8)) {
  if (!CELL_TO_CHAR_8.has(cell)) CELL_TO_CHAR_8.set(cell, char);
}

export function cellToFontChar8(cell: Cell): string {
  return CELL_TO_CHAR_8.get(cell) ?? cellToUnicode(cell);
}

export function cellsToFontString8(cells: readonly Cell[]): string {
  let out = "";
  for (const c of cells) out += cellToFontChar8(c);
  return out;
}

/** Zellfolge → HBS-Font-Zeichen, je nach System (6 oder 8 Punkt). */
export function cellsToFontString(cells: readonly Cell[], eightDot: boolean): string {
  return eightDot ? cellsToFontString8(cells) : cellsToFontString6(cells);
}
