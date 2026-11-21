/**
 * Eine Braillezelle als Bitmaske: Bit 0 = Punkt 1 … Bit 7 = Punkt 8.
 *
 * Gleiche Bit-Reihenfolge wie der Unicode-Braille-Block (U+2800 + Maske) —
 * dadurch ist eine Zelle eindeutig, vergleichbar und ohne Font darstellbar.
 * Die Engine rechnet ausschließlich in dieser Punkte-Logik (Quelle der
 * Wahrheit); die HBS-Schrift bzw. das SVG-Punktraster sind nur die Anzeige.
 *
 * Punktlage in der Zelle:
 *   1 4
 *   2 5
 *   3 6
 *   7 8   (nur Computerbraille / 8 Punkt)
 */

import { lehrSprache, type LehrSprache } from "./sprachen/aktuell";

export type Cell = number; // 0..255

export const BLANK: Cell = 0;

/** Punktnummer (1..8) → Bitwert. */
export function dotBit(dot: number): number {
  return 1 << (dot - 1);
}

/** Punktnummern (z. B. 1, 2, 4) → Zelle. */
export function dots(...nums: number[]): Cell {
  let c = 0;
  for (const n of nums) c |= dotBit(n);
  return c;
}

/**
 * liblouis-Punktnotation in eine Zelle wandeln: "1456" → Punkte 1,4,5,6.
 * "0" oder "" bedeutet leere Zelle (Leerzeichen).
 */
export function parseDots(s: string): Cell {
  if (s === "0" || s === "") return 0;
  let c = 0;
  for (const ch of s) {
    const n = ch.charCodeAt(0) - 48; // '1'..'8'
    if (n >= 1 && n <= 8) c |= dotBit(n);
  }
  return c;
}

/** Zelle → aufsteigende Punktnummern (für SVG-Raster und Vorlesen). */
export function cellDots(cell: Cell): number[] {
  const out: number[] = [];
  for (let d = 1; d <= 8; d++) if (cell & dotBit(d)) out.push(d);
  return out;
}

export function hasDot(cell: Cell, dot: number): boolean {
  return (cell & dotBit(dot)) !== 0;
}

export function isBlank(cell: Cell): boolean {
  return cell === 0;
}

/** Zelle als Unicode-Braille-Zeichen — Debug, Tests und Anzeige-Rückfall. */
export function cellToUnicode(cell: Cell): string {
  return String.fromCodePoint(0x2800 + (cell & 0xff));
}

/**
 * Unicode-Braille-String (U+2800-Block) → Zellfolge. Umkehrung von
 * `cellsToUnicode`/`cellToUnicode`. Für liblouis-Ausgaben (P4 Kurzschrift):
 * der Worker liefert Braille als U+2800-Zeichen, der Trainer vergleicht in
 * Zellen. Zeichen außerhalb des Braille-Blocks werden als Leerzelle gelesen.
 */
export function unicodeToCells(brl: string): Cell[] {
  const out: Cell[] = [];
  for (const ch of brl) {
    const cp = ch.codePointAt(0) ?? 0x2800;
    out.push(cp >= 0x2800 && cp <= 0x28ff ? cp - 0x2800 : 0);
  }
  return out;
}

/** Wörter für „leere Zelle", „Punkt", „Punkte" je Lehrsprache (Deutsch steht im Code). */
const DOT_WORTE: Partial<Record<LehrSprache, { leer: string; punkt: string; punkte: string }>> = {
  fr: { leer: "cellule vide", punkt: "point", punkte: "points" },
  es: { leer: "celda vacía", punkt: "punto", punkte: "puntos" },
  it: { leer: "cella vuota", punkt: "punto", punkte: "punti" },
  sv: { leer: "tom cell", punkt: "punkt", punkte: "punkter" },
  nl: { leer: "lege cel", punkt: "punt", punkte: "punten" },
  pt: { leer: "célula vazia", punkt: "ponto", punkte: "pontos" },
  br: { leer: "célula vazia", punkt: "ponto", punkte: "pontos" },
};

/** Punkte einer Zelle sprechbar machen: "Punkte 1, 2, 4" — für Screenreader. */
export function dotsLabel(cell: Cell): string {
  const ds = cellDots(cell);
  // Sprachen-Apps (Bauplan 2026-11-06 §4): jede Lehrsprache sagt es in ihren Worten.
  const w = DOT_WORTE[lehrSprache()];
  if (w) {
    if (ds.length === 0) return w.leer;
    return (ds.length === 1 ? w.punkt : w.punkte) + " " + ds.join(", ");
  }
  if (ds.length === 0) return "leere Zelle";
  return (ds.length === 1 ? "Punkt " : "Punkte ") + ds.join(", ");
}

/** Lage eines Punkts in der Zelle, sprechbar — fürs verortende Fehler-Feedback
 *  („Es fehlt Punkt 1 — oben links."). */
export const DOT_POSITION: Record<number, string> = {
  1: "oben links",
  2: "Mitte links",
  3: "unten links",
  4: "oben rechts",
  5: "Mitte rechts",
  6: "unten rechts",
  7: "ganz unten links",
  8: "ganz unten rechts",
};

/** Dasselbe in den Lehrsprachen der Sprachen-Apps. */
const DOT_POSITION_JE_SPRACHE: Partial<Record<LehrSprache, Record<number, string>>> = {
  fr: {
    1: "en haut à gauche", 2: "au milieu à gauche", 3: "en bas à gauche",
    4: "en haut à droite", 5: "au milieu à droite", 6: "en bas à droite",
    7: "tout en bas à gauche", 8: "tout en bas à droite",
  },
  es: {
    1: "arriba a la izquierda", 2: "en el centro a la izquierda", 3: "abajo a la izquierda",
    4: "arriba a la derecha", 5: "en el centro a la derecha", 6: "abajo a la derecha",
    7: "muy abajo a la izquierda", 8: "muy abajo a la derecha",
  },
  it: {
    1: "in alto a sinistra", 2: "al centro a sinistra", 3: "in basso a sinistra",
    4: "in alto a destra", 5: "al centro a destra", 6: "in basso a destra",
    7: "più in basso a sinistra", 8: "più in basso a destra",
  },
  sv: {
    1: "uppe till vänster", 2: "i mitten till vänster", 3: "nere till vänster",
    4: "uppe till höger", 5: "i mitten till höger", 6: "nere till höger",
    7: "längst ned till vänster", 8: "längst ned till höger",
  },
  nl: {
    1: "linksboven", 2: "linksmidden", 3: "linksonder",
    4: "rechtsboven", 5: "rechtsmidden", 6: "rechtsonder",
    7: "helemaal linksonder", 8: "helemaal rechtsonder",
  },
  pt: {
    1: "em cima à esquerda", 2: "ao meio à esquerda", 3: "em baixo à esquerda",
    4: "em cima à direita", 5: "ao meio à direita", 6: "em baixo à direita",
    7: "mesmo em baixo à esquerda", 8: "mesmo em baixo à direita",
  },
  br: {
    1: "em cima à esquerda", 2: "no meio à esquerda", 3: "embaixo à esquerda",
    4: "em cima à direita", 5: "no meio à direita", 6: "embaixo à direita",
    7: "bem embaixo à esquerda", 8: "bem embaixo à direita",
  },
};

/** Lage eines Punkts, in der Sprache der App (Deutsch: `DOT_POSITION`). */
export function dotPosition(dot: number): string {
  return (DOT_POSITION_JE_SPRACHE[lehrSprache()] ?? DOT_POSITION)[dot];
}

/** Unterschied zweier Zellen: welche Punkte fehlen/sind zu viel (gegenüber Soll). */
export function cellDiff(
  target: Cell,
  typed: Cell,
): { missing: number[]; extra: number[] } {
  return {
    missing: cellDots(target).filter((d) => !hasDot(typed, d)),
    extra: cellDots(typed).filter((d) => !hasDot(target, d)),
  };
}

export function cellsEqual(a: readonly Cell[], b: readonly Cell[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

/* --------------------------------------------------------------------------
 * Akkord-Tastatur (Perkins-Stil): mehrere Tasten gleichzeitig = eine Zelle.
 * Zuordnung per KeyboardEvent.code (layout-unabhängig; ö liegt auf "Semicolon"
 * der deutschen QWERTZ-Tastatur).
 *
 *   f = Punkt 1     j = Punkt 4
 *   d = Punkt 2     k = Punkt 5
 *   s = Punkt 3     l = Punkt 6
 *   a = Punkt 7     ö = Punkt 8   (nur 8 Punkt / Computerbraille)
 * ------------------------------------------------------------------------ */
export const KEY_TO_DOT: Record<string, number> = {
  KeyF: 1,
  KeyD: 2,
  KeyS: 3,
  KeyA: 7,
  KeyJ: 4,
  KeyK: 5,
  KeyL: 6,
  Semicolon: 8,
};

/** Anzeige-Beschriftung je Punkt (für die Tasten-Legende). */
export const DOT_KEY_LABEL: Record<number, string> = {
  1: "f",
  2: "d",
  3: "s",
  7: "a",
  4: "j",
  5: "k",
  6: "l",
  8: "ö",
};

/** Welche Punkte (und damit Tasten) sind im jeweiligen System aktiv? */
export function activeDots(eightDot: boolean): number[] {
  return eightDot ? [1, 2, 3, 4, 5, 6, 7, 8] : [1, 2, 3, 4, 5, 6];
}

/** Tastenbeschriftungen der Punkte einer Zelle — für announceCellHint (E9). */
export function keyLabelsForCell(cell: Cell): string[] {
  return cellDots(cell)
    .filter((d) => DOT_KEY_LABEL[d] !== undefined)
    .map((d) => DOT_KEY_LABEL[d]);
}
