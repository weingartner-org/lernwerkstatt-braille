/**
 * ════════════════════════════════════════════════════════════════════════════
 * SPANISCH (es) - TEXT → BRAILLEZELLEN, NACH DER CBE B 2 (Signografía básica 2025)
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Gebaut nach dem Norm-Dokument (Tabelle: `zeichen.ts`), NICHT nach liblouis:
 * liblouis `es-g1` weicht bei Buchstaben nach Zahlen und bei Siglen mit Punkten
 * ab (`BEFUND-2026-11-07-PUNKTGENAU-ES-NORM.md`). Es gilt die Norm.
 *
 * Regeln (Seitenzahlen der Norm):
 *  - Großschreibung (7, S. 15): Punkte 4-6 vor dem Wort, dessen erster Buchstabe
 *    groß ist. Siglen (7.1, S. 15) bekommen ZWEI Zeichen 4-6 4-6 vor dem Wort
 *    (zweite der beiden erlaubten Schreibweisen; die erste - 4-6 vor jedem
 *    Buchstaben - wird nicht geschrieben). Ein Punkt hinter jedem Buchstaben der
 *    Sigle (O.N.U.) wird NICHT geschrieben (7.1, S. 16: der Punkt entfällt).
 *    Mischschreibung mitten im Wort (McDonald, iPhone) regelt die Norm nicht:
 *    der Großbuchstabe im Wort ergibt ein `unknown`-Zeichen, nichts wird geraten.
 *  - Zahlen (8.1, S. 17-18): Zahlzeichen 3-4-5-6 EINMAL vor der Kette, dann die
 *    Buchstaben a-j als Ziffern 1-0. Komma, Punkt oder Apostroph als Dezimaltrenner
 *    = Punkt 2 (S. 18); Punkt 3 trennt Dreiergruppen (501.439.678). Ein Punkt,
 *    hinter dem genau drei Ziffern stehen, gilt als Gruppentrenner (Annahme, siehe
 *    BEFUND: offene Frage 2).
 *  - Buchstabe a-j direkt nach einer Zahl (8.2, S. 19): Punkt 5 vor jedem dieser
 *    Buchstaben („Prefijo de latina minúscula"). Ein anderer Buchstabe direkt an
 *    einer Zahl ist in der Norm nicht geregelt: `unknown`.
 *  - Satzzeichen (6.1, 6.2, S. 13-14): ¿ ? = 2-6, ¡ ! = 2-3-5, Anführungszeichen
 *    « » " “ ” = 2-3-6 (alle gleich), Klammern 1-2-6 und 3-4-5, Bindestrich 3-6,
 *    Dialog-Strich — 3-6 3-6, Auslassungspunkte 3-3-3.
 *  - Rechenzeichen (12, S. 30): + 2-3-5, − 3-6, × 2-3-6, ÷ 2-5-6, = 2-3-5-6 -
 *    ohne Modifikator davor.
 *
 * Grenzen (bewusst, nicht geraten): Apostroph, Schrägstrich, Zeichen hinter Zahlen
 * (Ordinalzahlen 1.º, Brüche, Einheiten), Schreibung mit Hervorhebung (35 ... 35)
 * sind NICHT gebaut; sie ergeben `unknown`.
 */
import { BLANK, parseDots, type Cell } from "../../cell";
import type { Unit } from "../../engine";
import { ES_ALLE, ES_STEUER } from "./zeichen";

const ZELLEN: Map<string, Cell[]> = new Map(
  ES_ALLE.filter((z) => !/^[0-9]$/.test(z.zeichen)).map((z) => [z.zeichen, z.punkte.split(" ").map(parseDots)]),
);
/** Ziffern: der Buchstabe a-j, dessen Zelle sie schreibt (Norm 8.1). */
const ZIFFER_ZELLE: Map<string, Cell[]> = new Map(
  ES_ALLE.filter((z) => /^[0-9]$/.test(z.zeichen)).map((z) => [z.zeichen, z.punkte.split(" ").map(parseDots)]),
);
// Gleichwertige Druckzeichen (6.1: „ ” « » " alle 2-3-6; Striche)
const GLEICH: Record<string, string> = {
  '"': "«", "“": "«", "”": "»", "„": "«",
  "‐": "-", "‑": "-", "–": "-",
};

const MAJUSKEL = parseDots(ES_STEUER.majuskel.punkte);
const ZAHLZEICHEN = parseDots(ES_STEUER.zahl.punkte);
const LATINA = parseDots(ES_STEUER.latinaMinuscula.punkte);

const RE_BUCHSTABE = /\p{L}/u;
const RE_ZIFFER = /[0-9]/;
const RE_LEER = /\s/;
const RECHENZEICHEN = new Set(["+", "−", "×", "÷", "="]);
const ERSTE_REIHE = new Set([..."abcdefghij"]);

function istGross(c: string): boolean {
  return RE_BUCHSTABE.test(c) && c !== c.toLowerCase();
}

/** Text → Einheiten (wie `transcribe` im deutschen Engine-Modul). */
export function transcribeEs(text: string, opts: { grossschreibzeichen?: boolean } = {}): Unit[] {
  const mitMajuskel = opts.grossschreibzeichen !== false;
  const chars = [...text.normalize("NFC")].map((c) => GLEICH[c] ?? c);
  const units: Unit[] = [];
  let i = 0;
  let zahl = false; // Zahlzeichen steht schon; gilt bis zum Ende der Zahlenkette

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

    // Ziffer: Zahlzeichen einmal, dann der Buchstabe a-j
    if (RE_ZIFFER.test(c)) {
      if (!zahl) {
        units.push({ text: "", cells: [ZAHLZEICHEN], kind: "number" });
        zahl = true;
      }
      units.push({ text: c, cells: ZIFFER_ZELLE.get(c)!, kind: "number" });
      i++;
      continue;
    }

    // Trenner mitten in einer Zahl: , . (und ' - hier nicht gebaut) zwischen Ziffern
    if (zahl && (c === "," || c === ".") && i + 1 < chars.length && RE_ZIFFER.test(chars[i + 1])) {
      // Punkt vor genau drei Ziffern = Gruppentrenner (Punkt 3), sonst Dezimaltrenner (Punkt 2).
      const gruppe = c === "." && ziffernAb(i + 1) === 3;
      units.push({ text: c, cells: [parseDots(gruppe ? "3" : "2")], kind: "number" });
      i++;
      continue;
    }

    // Sigle mit Punkten (O.N.U.): 4-6 vor jedem Buchstaben, die Punkte entfallen (7.1, S. 16)
    if (!zahl && istGross(c)) {
      const m = /^(?:\p{Lu}\.){2,}/u.exec(chars.slice(i).join(""));
      if (m) {
        for (const b of [...m[0]].filter((x) => x !== ".")) {
          if (mitMajuskel) units.push({ text: "", cells: [MAJUSKEL], kind: "punct" });
          units.push({ text: b, cells: ZELLEN.get(b.toLowerCase())!, kind: "letter" });
        }
        i += [...m[0]].length;
        continue;
      }
    }

    // Buchstabe
    if (RE_BUCHSTABE.test(c)) {
      let j = i;
      while (j < chars.length && RE_BUCHSTABE.test(chars[j])) j++;
      const wort = chars.slice(i, j);
      if (zahl) {
        // 8.2: a-j direkt nach der Zahl bekommt Punkt 5; jeder andere Buchstabe ist nicht geregelt.
        for (const w of wort) {
          const klein = w.toLowerCase();
          if (!istGross(w) && ERSTE_REIHE.has(klein)) {
            units.push({ text: "", cells: [LATINA], kind: "punct" });
            units.push({ text: w, cells: ZELLEN.get(klein)!, kind: "letter" });
          } else {
            units.push({ text: w, cells: [], kind: "unknown" });
          }
        }
        i = j;
        continue;
      }
      const grossAnzahl = wort.filter(istGross).length;
      const alleGross = grossAnzahl === wort.length;
      const sigla = alleGross && wort.length >= 2;
      const nurErsteGross = grossAnzahl === 1 && istGross(wort[0]);
      for (let k = 0; k < wort.length; k++) {
        const w = wort[k];
        const klein = w.toLowerCase();
        if (istGross(w) && mitMajuskel) {
          if (k === 0 && sigla) {
            units.push({ text: "", cells: [MAJUSKEL], kind: "punct" });
            units.push({ text: "", cells: [MAJUSKEL], kind: "punct" });
          } else if (k === 0 && (nurErsteGross || alleGross)) {
            units.push({ text: "", cells: [MAJUSKEL], kind: "punct" });
          } else if (!sigla) {
            // Großbuchstabe mitten im Wort (McDonald): die Norm regelt es nicht.
            units.push({ text: w, cells: [], kind: "unknown" });
            continue;
          }
        }
        const cells = ZELLEN.get(klein);
        units.push(cells ? { text: w, cells, kind: "letter" } : { text: w, cells: [], kind: "unknown" });
      }
      i = j;
      continue;
    }

    // Satzzeichen, Rechenzeichen, Symbole beenden eine Zahlenkette
    zahl = false;
    const z = ZELLEN.get(c);
    if (z) {
      const kind: Unit["kind"] = RECHENZEICHEN.has(c) ? "math" : "punct";
      units.push({ text: c, cells: z, kind });
    } else {
      units.push({ text: c, cells: [], kind: "unknown" });
    }
    i++;
  }
  return units;
}

/** Text → flache Zellfolge. */
export function textToCellsEs(text: string, opts: { grossschreibzeichen?: boolean } = {}): Cell[] {
  return transcribeEs(text, opts).flatMap((u) => u.cells);
}
