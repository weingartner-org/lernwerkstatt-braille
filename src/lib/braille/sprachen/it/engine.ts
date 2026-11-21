/**
 * ════════════════════════════════════════════════════════════════════════════
 * ITALIENISCH (it) - TEXT → BRAILLEZELLEN, NACH DEM CODICE BRAILLE ITALIANO (BIC 2022)
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Gebaut nach dem Norm-Dokument (Tabelle: `zeichen.ts`), NICHT nach liblouis:
 * liblouis `it-it-comp6` weicht bei « “ ” ’ × ÷, bei Großbuchstaben mit Akzent (À É)
 * und bei Buchstaben nach Zahlen ab (`BEFUND-2026-11-07-PUNKTGENAU-IT-NORM.md`).
 * Es gilt die Norm.
 *
 * Regeln (Absätze und Seiten der Norm, Teil „a sei punti"):
 *  - Großschreibung (1), S. 7): Punkte 4-6 vor JEDEM Großbuchstaben. Ein Wort, das ganz
 *    aus Großbuchstaben besteht (mindestens zwei), bekommt stattdessen zwei Zeichen 4-6 4-6
 *    vor dem Wort (2), S. 7). Der Apostroph beendet das Wort (L'amico: 4-6 l ' a ...).
 *  - Zahlen (121), S. 21; 132)-133), S. 22): Zahlzeichen 3-4-5-6 EINMAL vor der Kette, dann die
 *    Buchstaben a-j als Ziffern 1-0. Komma oder Punkt als Dezimaltrenner = Komma 2; der Tausender-
 *    trenner ist der Apostroph 3 („13.570,408" = #13'570,408). Ein Punkt, hinter dem genau drei
 *    Ziffern stehen, gilt als Tausendertrenner (Annahme, BEFUND: offene Frage 2).
 *    Ein Buchstabe direkt an einer Zahl ist in der Norm nicht geregelt: `unknown`.
 *  - Anführungszeichen (22), S. 9): « " “ öffnen 2-3-6, » " ” schließen 3-5-6. Das gerade " wird
 *    nach seiner Stellung entschieden: am Anfang, nach Leerzeichen oder nach ( [ « öffnet es.
 *  - Auslassungspunkte (16), S. 9): drei Punkte oder … sind 3-3-3 (der Punkt „fermo" ist 2-5-6).
 *  - Klammern (24)-26), S. 9): rund ( ) beide 2-3-5-6; eckig 1-2-3-5-6 / 2-3-4-5-6.
 *  - Rechenzeichen (135)-142), S. 22-23): + 2-3-5, − 3-6, × 2-3-6, = 2-3-5-6 - ohne Modifikator.
 *
 * Grenzen (bewusst, nicht geraten): ÷, ein Strich ––, die Abkürzungspunkte (a.C.), Hervorhebung,
 * Ordinalzahlen sind NICHT gebaut und ergeben `unknown`.
 */
import { BLANK, parseDots, type Cell } from "../../cell";
import type { Unit } from "../../engine";
import { IT_ALLE, IT_STEUER } from "./zeichen";

const ZELLEN: Map<string, Cell[]> = new Map(
  IT_ALLE.filter((z) => !/^[0-9]$/.test(z.zeichen)).map((z) => [z.zeichen, z.punkte.split(" ").map(parseDots)]),
);
const ZIFFER_ZELLE: Map<string, Cell[]> = new Map(
  IT_ALLE.filter((z) => /^[0-9]$/.test(z.zeichen)).map((z) => [z.zeichen, z.punkte.split(" ").map(parseDots)]),
);
// Gleichwertige Druckzeichen. Das gerade " wird unten nach seiner Stellung zu « oder ».
const GLEICH: Record<string, string> = {
  "“": "«", "”": "»", "„": "«",
  "’": "'", "‘": "'", "ʼ": "'",
  "‐": "-", "‑": "-",
};

const MAJUSKEL = parseDots(IT_STEUER.majuskel.punkte);
const ZAHLZEICHEN = parseDots(IT_STEUER.zahl.punkte);
const AUSLASSUNG = [parseDots("3"), parseDots("3"), parseDots("3")];

const RE_BUCHSTABE = /\p{L}/u;
const RE_ZIFFER = /[0-9]/;
const RE_LEER = /\s/;
const RECHENZEICHEN = new Set(["+", "−", "×", "="]);

function istGross(c: string): boolean {
  return RE_BUCHSTABE.test(c) && c !== c.toLowerCase();
}

/** Text → Einheiten (wie `transcribe` im deutschen Engine-Modul). */
export function transcribeIt(text: string, opts: { grossschreibzeichen?: boolean } = {}): Unit[] {
  const mitMajuskel = opts.grossschreibzeichen !== false;
  const chars = [...text.normalize("NFC")].map((c) => GLEICH[c] ?? c);
  const units: Unit[] = [];
  let i = 0;
  let zahl = false;

  const ziffernAb = (start: number): number => {
    let e = start;
    while (e < chars.length && RE_ZIFFER.test(chars[e])) e++;
    return e - start;
  };

  while (i < chars.length) {
    const c = chars[i];

    if (RE_LEER.test(c)) {
      zahl = false;
      units.push({ text: c, cells: [BLANK], kind: "space" });
      i++;
      continue;
    }

    if (RE_ZIFFER.test(c)) {
      if (!zahl) {
        units.push({ text: "", cells: [ZAHLZEICHEN], kind: "number" });
        zahl = true;
      }
      units.push({ text: c, cells: ZIFFER_ZELLE.get(c)!, kind: "number" });
      i++;
      continue;
    }

    // Trenner mitten in einer Zahl: , → 2 · . vor genau drei Ziffern → Tausender (3), sonst Dezimal (2)
    if (zahl && (c === "," || c === ".") && i + 1 < chars.length && RE_ZIFFER.test(chars[i + 1])) {
      const tausender = c === "." && ziffernAb(i + 1) === 3;
      units.push({ text: c, cells: [parseDots(tausender ? "3" : "2")], kind: "number" });
      i++;
      continue;
    }

    if (RE_BUCHSTABE.test(c)) {
      let j = i;
      while (j < chars.length && RE_BUCHSTABE.test(chars[j])) j++;
      const wort = chars.slice(i, j);
      if (zahl) {
        // Buchstabe direkt an einer Zahl: nicht geregelt.
        for (const w of wort) units.push({ text: w, cells: [], kind: "unknown" });
        i = j;
        continue;
      }
      const grossAnzahl = wort.filter(istGross).length;
      const ganzGross = grossAnzahl === wort.length && wort.length >= 2;
      for (let k = 0; k < wort.length; k++) {
        const w = wort[k];
        const klein = w.toLowerCase();
        if (istGross(w) && mitMajuskel) {
          if (ganzGross) {
            if (k === 0) {
              units.push({ text: "", cells: [MAJUSKEL], kind: "punct" });
              units.push({ text: "", cells: [MAJUSKEL], kind: "punct" });
            }
          } else {
            units.push({ text: "", cells: [MAJUSKEL], kind: "punct" });
          }
        }
        const cells = ZELLEN.get(klein);
        units.push(cells ? { text: w, cells, kind: "letter" } : { text: w, cells: [], kind: "unknown" });
      }
      i = j;
      continue;
    }

    zahl = false;

    // Auslassungspunkte: ... oder … = 3-3-3
    if (c === "…" || (c === "." && chars[i + 1] === "." && chars[i + 2] === "." && chars[i + 3] !== ".")) {
      units.push({ text: c === "…" ? c : "...", cells: AUSLASSUNG, kind: "punct" });
      i += c === "…" ? 1 : 3;
      continue;
    }

    // Gerades Anführungszeichen: öffnend am Anfang, nach Leerzeichen oder nach ( [ « - sonst schließend
    let zeichen = c;
    if (c === '"') {
      const davor = i === 0 ? " " : chars[i - 1];
      zeichen = RE_LEER.test(davor) || "([«{".includes(davor) ? "«" : "»";
    }
    const z = ZELLEN.get(zeichen);
    if (z) {
      units.push({ text: c, cells: z, kind: RECHENZEICHEN.has(c) ? "math" : "punct" });
    } else {
      units.push({ text: c, cells: [], kind: "unknown" });
    }
    i++;
  }
  return units;
}

/** Text → flache Zellfolge. */
export function textToCellsIt(text: string, opts: { grossschreibzeichen?: boolean } = {}): Cell[] {
  return transcribeIt(text, opts).flatMap((u) => u.cells);
}
