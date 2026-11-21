/**
 * ════════════════════════════════════════════════════════════════════════════
 * SCHWEDISCH (sv) - TEXT → BRAILLEZELLEN, NACH „SVENSKA SKRIVREGLER FÖR PUNKTSKRIFT" (MTM 2009)
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Gebaut nach dem Norm-Dokument (Tabelle: `zeichen.ts`), NICHT nach liblouis. Die Abweichungen
 * stehen in `BEFUND-2026-11-07-PUNKTGENAU-SV-NORM.md`. Es gilt die Norm.
 *
 * Regeln (gedruckte Seitenzahlen der Norm):
 *  - Versaler (3.2, S. 30-32): Versaltecken (Punkt 6) vor der einen Versal. Ein Wort aus
 *    lauter Versalen (SAV, ISBN) bekommt zwei Versaltecken (6 6) davor; das Ende ist jedes
 *    Zeichen, das kein Buchstabe ist. Steht ein Bindestrich hinter einem solchen Wort und
 *    danach ein kleiner Buchstabe (ISBN-centralen), steht vor dem Strich das Avslutningstecken
 *    (Punkte 1-5-6; Beispiel S. 30). Gemischte Gruppen (kWh, JämO, oVbEGj): Versaltecken vor
 *    JEDER Versal (3.2.4, S. 32). Eine Folge von DREI ODER MEHR Versalen, auf die kleine
 *    Buchstaben folgen (IKEAs), schreibt die Norm an zwei Stellen verschieden (3.2.2: 6 6 ... 1-5-6;
 *    3.2.4: 6 vor jeder Versal) und sagt nicht, ab wann „lang" gilt: die kleinen Buchstaben
 *    danach ergeben `unknown`, nichts wird geraten (BEFUND, offene Frage).
 *  - Ziffern (5.1, S. 49): Siffertecken (3-4-5-6) EINMAL vor der Ziffernfolge, dann die Buchstaben
 *    a-j. In der Folge dürfen Komma (Punkt 2) und Punkt (Punkt 3) stehen; jedes andere Zeichen,
 *    auch das Leerzeichen, beendet sie (100 000 000 = drei Siffertecken). Kolon (279:50) beendet
 *    sie, das Siffertecken wird wiederholt (5.2, S. 49).
 *  - Gemener Buchstabe a-j direkt hinter einer Zahl (5.5, S. 55): Avslutningstecken (1-5-6)
 *    dazwischen (2a = 3456 12 156 1). Andere Buchstaben und Versaler brauchen nichts (3G-nätet).
 *  - Satzzeichen (2.1-2.3, S. 19-21): ” steht für alle doppelten Anführungszeichen (S. 19),
 *    ’ (Punkt 5) für Apostroph und inneres Zitat, Klammern 2-3-6 / 3-5-6, Bindestrich 3-6,
 *    Gedankenstrich (–) 3-6 3-6, Auslassungspunkte 3 3 3 (9.5, S. 74).
 *  - Rechenzeichen (6, S. 57-60): + 2-5-6, − 3-6, = 2-3-5-6, × 1-2-4-5-6 1-3-4-6, Schrägstrich 3-4
 *    als Teilungszeichen - ohne Modifikator davor.
 *
 * Grenzen (bewusst, nicht geraten): Zeichen, die die Norm nicht kennt (÷ · — « »), Buchstaben mit
 * Diakritikum außer à é è ü (das allgemeine Schreiben mit Punkt 4 davor steht in 4.1.2 und ist hier nicht gebaut),
 * Hervorhebungen, Romerska siffror, Zeichen hinter Zahlen wie § oder ° - sie ergeben `unknown`.
 */
import { BLANK, parseDots, type Cell } from "../../cell";
import type { Unit } from "../../engine";
import { SV_ALLE, SV_STEUER } from "./zeichen";

const zellen = (p: string): Cell[] => p.split(" ").map(parseDots);

const ZELLEN: Map<string, Cell[]> = new Map(
  SV_ALLE.filter((z) => !/^[0-9]$/.test(z.zeichen)).map((z) => [z.zeichen, zellen(z.punkte)]),
);
/** Ziffern: der Buchstabe a-j, dessen Zelle sie schreibt (Norm 5.1). */
const ZIFFER_ZELLE: Map<string, Cell[]> = new Map(
  SV_ALLE.filter((z) => /^[0-9]$/.test(z.zeichen)).map((z) => [z.zeichen, zellen(z.punkte)]),
);
// Gleichwertige Druckzeichen: ” steht für alle doppelten Anführungszeichen, ’ für Apostroph und Einfachzitat.
const GLEICH: Record<string, string> = {
  '"': "”", "“": "”", "„": "”", "»": "”", "«": "”",
  "'": "’", "‘": "’", "ʼ": "’",
  "‐": "-", "‑": "-",
};

const VERSAL = parseDots(SV_STEUER.versal.punkte);
const SIFFERTECKEN = parseDots(SV_STEUER.zahl.punkte);
const ABSCHLUSS = parseDots(SV_STEUER.abschluss.punkte);

const RE_BUCHSTABE = /\p{L}/u;
const RE_ZIFFER = /[0-9]/;
const RE_LEER = /\s/;
const RECHENZEICHEN = new Set(["+", "−", "×", "="]);
const ERSTE_REIHE = new Set([..."abcdefghij"]);

function istGross(c: string): boolean {
  return RE_BUCHSTABE.test(c) && c !== c.toLowerCase();
}

/** Text → Einheiten (wie `transcribe` im deutschen Engine-Modul). */
export function transcribeSv(text: string, opts: { grossschreibzeichen?: boolean } = {}): Unit[] {
  const mitVersal = opts.grossschreibzeichen !== false;
  const chars = [...text.normalize("NFC")].map((c) => GLEICH[c] ?? c);
  const units: Unit[] = [];
  let i = 0;
  let zahl = false; // Siffertecken steht schon; gilt bis zum Ende der Ziffernfolge

  while (i < chars.length) {
    const c = chars[i];

    if (RE_LEER.test(c)) {
      zahl = false;
      units.push({ text: c, cells: [BLANK], kind: "space" });
      i++;
      continue;
    }

    // Ziffer: Siffertecken einmal je Folge, dann der Buchstabe a-j
    if (RE_ZIFFER.test(c)) {
      if (!zahl) {
        units.push({ text: "", cells: [SIFFERTECKEN], kind: "number" });
        zahl = true;
      }
      units.push({ text: c, cells: ZIFFER_ZELLE.get(c)!, kind: "number" });
      i++;
      continue;
    }

    // Komma und Punkt bleiben in der Ziffernfolge (5.1, S. 49): zwischen Ziffern
    if (zahl && (c === "," || c === ".") && i + 1 < chars.length && RE_ZIFFER.test(chars[i + 1])) {
      units.push({ text: c, cells: ZELLEN.get(c)!, kind: "number" });
      i++;
      continue;
    }

    // Buchstaben: eine zusammenhängende Gruppe
    if (RE_BUCHSTABE.test(c)) {
      let j = i;
      while (j < chars.length && RE_BUCHSTABE.test(chars[j])) j++;
      const wort = chars.slice(i, j);
      const grossAnzahl = wort.filter(istGross).length;
      const alleGross = grossAnzahl === wort.length;
      const wortVersal = alleGross && wort.length >= 2;

      // Längste Folge hintereinander stehender Versalen in einer gemischten Gruppe
      let laengsteFolge = 0;
      let lauf = 0;
      for (const w of wort) {
        lauf = istGross(w) ? lauf + 1 : 0;
        laengsteFolge = Math.max(laengsteFolge, lauf);
      }
      const folgeUngeklaert = !alleGross && laengsteFolge >= 3;

      let k0 = 0;
      // 5.5: kleiner Buchstabe a-j direkt hinter einer Zahl braucht das Avslutningstecken davor
      if (zahl && !istGross(wort[0]) && ERSTE_REIHE.has(wort[0])) {
        units.push({ text: "", cells: [ABSCHLUSS], kind: "punct" });
      }
      zahl = false;

      if (wortVersal) {
        if (mitVersal) {
          units.push({ text: "", cells: [VERSAL], kind: "punct" });
          units.push({ text: "", cells: [VERSAL], kind: "punct" });
        }
        // Bindestrich + kleiner Buchstabe dahinter: Avslutningstecken vor dem Strich (Beispiel S. 30)
        for (; k0 < wort.length; k0++) {
          const w = wort[k0];
          const cells = ZELLEN.get(w.toLowerCase());
          units.push(cells ? { text: w, cells, kind: "letter" } : { text: w, cells: [], kind: "unknown" });
        }
        if (chars[j] === "-" && j + 1 < chars.length && RE_BUCHSTABE.test(chars[j + 1]) && !istGross(chars[j + 1])) {
          units.push({ text: "", cells: [ABSCHLUSS], kind: "punct" });
        }
        i = j;
        continue;
      }

      let naechsteKleinUnbekannt = false;
      for (let k = 0; k < wort.length; k++) {
        const w = wort[k];
        const klein = w.toLowerCase();
        const gross = istGross(w);
        if (folgeUngeklaert && !gross) {
          // erst ab der Folge von drei Versalen: die kleinen Buchstaben DAHINTER sind ungeklärt
          if (naechsteKleinUnbekannt) {
            units.push({ text: w, cells: [], kind: "unknown" });
            continue;
          }
        }
        if (gross && mitVersal) units.push({ text: "", cells: [VERSAL], kind: "punct" });
        if (folgeUngeklaert && gross) {
          let l = 0;
          for (let m = k; m >= 0 && istGross(wort[m]); m--) l++;
          const naechsterKlein = k + 1 < wort.length && !istGross(wort[k + 1]);
          if (l >= 3 && naechsterKlein) naechsteKleinUnbekannt = true;
        }
        const cells = ZELLEN.get(klein);
        units.push(cells ? { text: w, cells, kind: "letter" } : { text: w, cells: [], kind: "unknown" });
      }
      i = j;
      continue;
    }

    // Satzzeichen, Rechenzeichen, Symbole beenden eine Ziffernfolge
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
export function textToCellsSv(text: string, opts: { grossschreibzeichen?: boolean } = {}): Cell[] {
  return transcribeSv(text, opts).flatMap((u) => u.cells);
}
