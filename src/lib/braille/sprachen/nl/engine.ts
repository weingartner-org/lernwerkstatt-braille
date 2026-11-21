/**
 * ════════════════════════════════════════════════════════════════════════════
 * NIEDERLÄNDISCH (nl) - TEXT → BRAILLEZELLEN, NACH DER BRAILLESTANDAARD 2019 (Braille Autoriteit)
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Gebaut nach dem Norm-Dokument (Tabelle: `zeichen.ts`), NICHT nach liblouis: `nl-NL-g0` steht auf der Fassung 2017
 * (liblouis-Issue #952). Die Abweichungen stehen in `BEFUND-2026-11-07-PUNKTGENAU-NL-NORM.md`. Es gilt die Norm 2019.
 *
 * Regeln (Seitenzahlen der Norm):
 *  - Hoofdletters (2.11, S. 20-22): Hoofdletterteken (4-6) direkt vor JEDER einzelnen Hoofdletter, auch mitten im
 *    Wort (MacLean). Zwei oder mehr aufeinanderfolgende Hoofdletters bekommen EINMAL das permanente
 *    Hoofdletterteken (4-5) davor (AMSTERDAM). Es wird aufgehoben durch Leerzeichen, Cijferteken und Koppelteken
 *    (BTW-tarieven, ZUID-HOLLAND, SN2233) und durch das Herstelteken (6); NICHT aufgehoben durch Punkt (E.T.A.) und
 *    Weglatingsteken (PAGINA'S). Folgen kleine Buchstaben im selben Wort, steht das Herstelteken (6) davor
 *    (abCDef, SMS'je). Eine Passage von mehr als drei Wörtern in Hoofdletters hat eine eigene Regel (4-5 4-5 vorn, 4-5 am
 *    Ende, S. 22) und ist NICHT gebaut: `unknown`.
 *  - IJ (IJsselmeer): die Norm sagt nichts zu IJ am Wortanfang - nicht gebaut (`unknown`), nichts geraten.
 *  - Cijfers (3.1, S. 30-31): Cijferteken (3-4-5-6) EINMAL vor der Ziffernfolge, dann die Buchstaben a-j. In der Folge
 *    bleiben Komma (Dezimaltrenner, Punkt 2) und Punkt (Tausendertrenner, 256); Leerzeichen und jedes andere Zeichen
 *    beenden sie (1940-1945 = zwei Cijfertekens). Ein Hoofdletterteken beendet sie ebenfalls (3A).
 *  - Buchstabe a-j direkt hinter einer Zahl (3.1, S. 31; 2.10, S. 19): Herstelteken (6) davor (1a, 15de). Andere Buchstaben
 *    brauchen nichts (8ste).
 *  - Leestekens (2.14, S. 25): . = 256, ? = 26, ! = 235, : = 25, ; = 23, "..." = 2356 (öffnend wie schließend, alle
 *    zwei- und mehrfachen Anführungszeichen des Drucks), ' = 3 (Apostroph und einfaches Anführungszeichen), Klammern
 *    236 / 356, Liggend streepje (Bindestrich, Gedankenstrich, Minus) = 36, drei Punkte = 256 256 256.
 *  - Rekentekens (3.2, S. 31-32): + = 235, − = 36, = = 2356, × = 236 - ohne Modifikator, mit Leerzeichen davor und dahinter.
 *
 * Grenzen (bewusst, nicht geraten): Zeichen ohne klare Zuordnung ohne Kontext (÷ - die Norm kennt den Doppelpunkt 2-5-6
 * als Deelteken, aber „:" heißt auch Doppelpunkt; & # © € % § @), Buchstaben ohne Zeile in der Tabelle, Drukwijzigingsteken
 * (Kursiv), Alfabetwisselingsteken: sie ergeben `unknown`.
 */
import { BLANK, parseDots, type Cell } from "../../cell";
import type { Unit } from "../../engine";
import { NL_ALLE, NL_STEUER } from "./zeichen";

const zellen = (p: string): Cell[] => p.split(" ").map(parseDots);

const ZELLEN: Map<string, Cell[]> = new Map(
  NL_ALLE.filter((z) => !/^[0-9]$/.test(z.zeichen)).map((z) => [z.zeichen, zellen(z.punkte)]),
);
/** Ziffern: der Buchstabe a-j, dessen Zelle sie schreibt (Norm 3.1). */
const ZIFFER_ZELLE: Map<string, Cell[]> = new Map(
  NL_ALLE.filter((z) => /^[0-9]$/.test(z.zeichen)).map((z) => [z.zeichen, zellen(z.punkte)]),
);
// Gleichwertige Druckzeichen: alle doppelten Anführungszeichen 2356, Apostroph und einfache 3, alle Striche 36.
const GLEICH: Record<string, string> = {
  "“": '"', "”": '"', "„": '"', "«": '"', "»": '"',
  "‘": "'", "’": "'", "ʼ": "'",
  "‐": "-", "‑": "-", "—": "–",
};

const HOOFDLETTER = parseDots(NL_STEUER.hoofdletter.punkte);
const PERMANENT = parseDots(NL_STEUER.permanent.punkte);
const HERSTEL = parseDots(NL_STEUER.herstel.punkte);
const CIJFERTEKEN = parseDots(NL_STEUER.zahl.punkte);

const RE_BUCHSTABE = /\p{L}/u;
const RE_ZIFFER = /[0-9]/;
const RE_LEER = /\s/;
const RECHENZEICHEN = new Set(["+", "−", "×", "="]);
const ERSTE_REIHE = new Set([..."abcdefghij"]);

const istBuchstabe = (c: string | undefined): boolean => c !== undefined && RE_BUCHSTABE.test(c);
const istGross = (c: string | undefined): boolean => istBuchstabe(c) && c !== c!.toLowerCase();

/** Text → Einheiten (wie `transcribe` im deutschen Engine-Modul). */
export function transcribeNl(text: string, opts: { grossschreibzeichen?: boolean } = {}): Unit[] {
  const mitGross = opts.grossschreibzeichen !== false;
  const chars = [...text.normalize("NFC")].map((c) => GLEICH[c] ?? c);
  const units: Unit[] = [];

  // Passagen von mehr als drei Wörtern in Hoofdletters (S. 22): nicht gebaut
  const lange = new Array<boolean>(chars.length).fill(false);
  {
    const s = chars.join("");
    const re = /(?:\p{Lu}{2,}[ ]+){3,}\p{Lu}{2,}/gu;
    let m: RegExpExecArray | null;
    // Zeichenpositionen in Codepoints (`chars` zählt Codepoints, `s` UTF-16)
    while ((m = re.exec(s))) {
      const von = [...s.slice(0, m.index)].length;
      const bis = von + [...m[0]].length;
      for (let k = von; k < bis; k++) lange[k] = true;
    }
  }

  let i = 0;
  let zahl = false; // Cijferteken steht schon; gilt bis zum Ende der Ziffernfolge
  let permanent = false; // Permanent hoofdletterteken ist in Kraft

  while (i < chars.length) {
    const c = chars[i];

    if (RE_LEER.test(c)) {
      zahl = false;
      permanent = false;
      units.push({ text: c, cells: [BLANK], kind: "space" });
      i++;
      continue;
    }

    // Ziffer: Cijferteken einmal je Folge, dann der Buchstabe a-j
    if (RE_ZIFFER.test(c)) {
      if (!zahl) {
        units.push({ text: "", cells: [CIJFERTEKEN], kind: "number" });
        zahl = true;
      }
      permanent = false;
      units.push({ text: c, cells: ZIFFER_ZELLE.get(c)!, kind: "number" });
      i++;
      continue;
    }

    // Komma und Punkt bleiben in der Ziffernfolge (3.1, S. 30): zwischen Ziffern
    if (zahl && (c === "," || c === ".") && i + 1 < chars.length && RE_ZIFFER.test(chars[i + 1])) {
      units.push({ text: c, cells: ZELLEN.get(c)!, kind: "number" });
      i++;
      continue;
    }

    if (istBuchstabe(c)) {
      // IJ am Wortanfang (IJsselmeer) und Passagen in Hoofdletters: nicht geregelt bzw. nicht gebaut
      if (lange[i]) {
        units.push({ text: c, cells: [], kind: "unknown" });
        i++;
        continue;
      }
      if (istGross(c) && c === "I" && chars[i + 1] === "J" && !permanent && istBuchstabe(chars[i + 2]) && !istGross(chars[i + 2])) {
        units.push({ text: c, cells: [], kind: "unknown" });
        i++;
        continue;
      }
      const gross = istGross(c);
      const klein = c.toLowerCase();
      if (zahl) {
        // 2.10, S. 19: ein kleiner Buchstabe a-j direkt hinter der Zahl braucht das Herstelteken
        if (!gross && ERSTE_REIHE.has(c)) units.push({ text: "", cells: [HERSTEL], kind: "punct" });
        zahl = false;
      }
      if (gross) {
        if (!permanent && mitGross) {
          const naechsteGross = istGross(chars[i + 1]);
          // Abkürzung mit Punkten (E.T.A.): das permanente Zeichen bleibt über die Punkte hinweg stehen
          const abkuerzung = chars[i + 1] === "." && istGross(chars[i + 2]);
          if (naechsteGross || abkuerzung) {
            units.push({ text: "", cells: [PERMANENT], kind: "punct" });
            permanent = true;
          } else {
            units.push({ text: "", cells: [HOOFDLETTER], kind: "punct" });
          }
        }
      } else if (permanent) {
        // kleiner Buchstabe nach Hoofdletters im selben Wort: Herstelteken (abCDef, SMS'je)
        units.push({ text: "", cells: [HERSTEL], kind: "punct" });
        permanent = false;
      }
      const cells = ZELLEN.get(klein);
      units.push(cells ? { text: c, cells, kind: "letter" } : { text: c, cells: [], kind: "unknown" });
      i++;
      continue;
    }

    // Satzzeichen, Rechenzeichen, Symbole beenden eine Ziffernfolge; Punkt und Apostroph lassen das permanente Zeichen stehen
    zahl = false;
    if (c !== "." && c !== "'") permanent = false;
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
export function textToCellsNl(text: string, opts: { grossschreibzeichen?: boolean } = {}): Cell[] {
  return transcribeNl(text, opts).flatMap((u) => u.cells);
}
