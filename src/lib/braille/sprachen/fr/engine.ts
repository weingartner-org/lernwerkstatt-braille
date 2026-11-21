/**
 * ════════════════════════════════════════════════════════════════════════════
 * FRANZÖSISCH (fr) - TEXT → BRAILLEZELLEN, NACH DEM CBFU 2008 (braille intégral)
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Gebaut nach dem Norm-Dokument (Tabelle: `zeichen.ts`), NICHT nach liblouis:
 * liblouis `fr-bfu-comp6` weicht bei Großschreibung und Zahlen in einigen
 * Fällen ab (`BEFUND-2026-11-07-PUNKTGENAU-FR-NORM.md`). Es gilt die Norm.
 *
 * Regeln (alle „code braille de base", 1. Teil der Norm):
 *  - Großschreibung (1.1, S. 25-26): Punkte 4-6 stehen vor dem Wort, dessen
 *    Anfangsbuchstabe ODER dessen sämtliche Buchstaben groß sind. Bei
 *    gemischter Schreibung innerhalb eines Wortes steht 4-6 vor JEDEM
 *    Großbuchstaben (HCl, McDonald). Der Apostroph und der Bindestrich beenden
 *    das Wort (L'Europe: 4-6 l ' 4-6 e...). „Mehrfach-Majuskel" 4-6 4-6 gehört zu
 *    den „règles complémentaires" (2.1, S. 42) und wird NICHT geschrieben.
 *  - Zahlen (1.2, S. 27-28): nur die Antoine-Notation. Der mathematische
 *    Modifikator (Punkt 6) steht EINMAL am Anfang der Zeichenkette bis zum
 *    nächsten Leerzeichen; Trennzeichen darin behalten ihren Wert
 *    (Komma 2, Punkt 2-5-6, Doppelpunkt 2-5, Strich 3-6, Schrägstrich 3-4).
 *    Ein Rechenzeichen (+ − × ÷ =) allein zwischen Leerzeichen bekommt den
 *    Modifikator ebenfalls (Beispiel der Norm: „2 × 5 = 10").
 *  - Leerraum (1.3, S. 31): vor , ; : . ? ! … und vor ) » steht kein Leerraum,
 *    nach ( « ebenfalls keiner - ein Leerzeichen dort wird NICHT geschrieben.
 *  - Guillemets (1.4, S. 33): « » " “ ” sind alle Punkte 2-3-5-6.
 *  - Apostroph: auch ’ ist der Apostroph (Punkt 3), nicht das Anführungszeichen
 *    (liblouis schreibt ’ als 2-3-5-6: Abweichung).
 *
 * Grenzen (bewusst, nicht geraten): Buchstaben der vierten Reihe (â ê î ô û ë ï ü
 * œ w) innerhalb einer Zahlenkette würden wie Ziffern aussehen - dafür verlangt
 * die Norm den „indicateur de valeur de base" (1.7 b, S. 36). Der Lehrgang
 * mischt Zahlen und solche Buchstaben nie; die Engine wirft dort `unknown`.
 */
import { BLANK, parseDots, type Cell } from "../../cell";
import type { Unit } from "../../engine";
import { FR_ALLE, FR_STEUER } from "./zeichen";

const ZELLEN: Map<string, Cell[]> = new Map(
  FR_ALLE.map((z) => [z.zeichen, z.punkte.split(" ").map(parseDots)]),
);
// Gleichwertige Druckzeichen (Norm 1.4, S. 33; Apostroph; Striche)
const GLEICH: Record<string, string> = {
  '"': "«", "“": "«", "”": "»", "„": "«",
  "’": "'", "ʼ": "'", "‘": "'",
  "‐": "-", "‑": "-", "—": "–",
};

const MAJUSKEL = parseDots(FR_STEUER.majuskel.punkte);
const MODIFIKATOR = parseDots(FR_STEUER.mathModifikator.punkte);

const RE_BUCHSTABE = /\p{L}/u;
const RE_ZIFFER = /[0-9]/;
const RE_LEER = /\s/;
const RECHENZEICHEN = new Set(["+", "−", "×", "÷", "="]);
/** Buchstaben der vierten Reihe: sähen nach dem Modifikator wie Ziffern aus (Norm 1.7 b). */
const ZIFFERN_GLEICH = new Set(["â", "ê", "î", "ô", "û", "ë", "ï", "ü", "œ", "w"]);

function istGross(c: string): boolean {
  return RE_BUCHSTABE.test(c) && c !== c.toLowerCase();
}

/**
 * Leerraum, den die Norm nicht schreibt (1.3 a/b, S. 31): vor , ; : . ? ! ) »
 * und nach ( «. Gibt den Text OHNE diese Leerzeichen zurück.
 */
export function ohneNormfremdenLeerraum(text: string): string {
  return text
    .replace(/[   ]+([,;:.?!…)»”])/g, "$1")
    .replace(/([(«“])[   ]+/g, "$1");
}

/** Text → Einheiten (wie `transcribe` im deutschen Engine-Modul). */
export function transcribeFr(text: string, opts: { grossschreibzeichen?: boolean } = {}): Unit[] {
  const mitMajuskel = opts.grossschreibzeichen !== false;
  const chars = [...ohneNormfremdenLeerraum(text).normalize("NFC")].map((c) => GLEICH[c] ?? c);
  const units: Unit[] = [];
  let i = 0;
  let zahl = false; // Modifikator gilt bis zum nächsten Leerzeichen

  // Tokens (zwischen Leerzeichen), um allein stehende Rechenzeichen zu erkennen.
  const tokenAb = (start: number): string => {
    let e = start;
    while (e < chars.length && !RE_LEER.test(chars[e])) e++;
    return chars.slice(start, e).join("");
  };

  const vorigesToken = (start: number): string => {
    let e = start - 1; // das Leerzeichen vor dem Token
    while (e > 0 && RE_LEER.test(chars[e - 1])) e--;
    let b = e;
    while (b > 0 && !RE_LEER.test(chars[b - 1])) b--;
    return chars.slice(b, e).join("");
  };

  while (i < chars.length) {
    const c = chars[i];

    if (RE_LEER.test(c)) {
      zahl = false;
      units.push({ text: c, cells: [BLANK], kind: "space" });
      i++;
      continue;
    }

    // Beginn eines Tokens: Zahl oder Rechenzeichen allein → Modifikator
    const tokenStart = i === 0 || RE_LEER.test(chars[i - 1]);
    if (tokenStart && !zahl) {
      const tok = tokenAb(i);
      const hatZiffer = RE_ZIFFER.test(tok);
      // Ein allein stehender Strich ist nur dann „moins", wenn ein Nachbar-Token eine
      // Ziffer hat („5 - 3 = 2"); sonst ist er ein Gedankenstrich (1.3 c, S. 31).
      const nurRechenzeichen =
        tok.length === 1 &&
        (RECHENZEICHEN.has(tok) || (tok === "-" && (RE_ZIFFER.test(vorigesToken(i)) || RE_ZIFFER.test(tokenAb(i + 2)))));
      if (hatZiffer || nurRechenzeichen) {
        // Der Modifikator steht unmittelbar vor dem ersten Zeichen, das er betrifft:
        // bei „(3" oder „a2" also vor der Ziffer, nicht vor dem Token. Hier: am
        // Tokenanfang nur, wenn das erste Zeichen selbst Ziffer/Rechenzeichen ist.
        if (RE_ZIFFER.test(c) || nurRechenzeichen) {
          units.push({ text: "", cells: [MODIFIKATOR], kind: "number" });
          zahl = true;
        }
      }
    }
    if (!zahl && RE_ZIFFER.test(c)) {
      units.push({ text: "", cells: [MODIFIKATOR], kind: "number" });
      zahl = true;
    }

    // Ziffer
    if (RE_ZIFFER.test(c)) {
      units.push({ text: c, cells: ZELLEN.get(c)!, kind: "number" });
      i++;
      continue;
    }

    // Buchstabe (mit Großschreibung nach 1.1)
    if (RE_BUCHSTABE.test(c)) {
      let j = i;
      while (j < chars.length && RE_BUCHSTABE.test(chars[j])) j++;
      const wort = chars.slice(i, j);
      const grossAnzahl = wort.filter(istGross).length;
      const alleGross = grossAnzahl === wort.length;
      const nurErsteGross = istGross(wort[0]) && grossAnzahl === 1;
      for (let k = 0; k < wort.length; k++) {
        const w = wort[k];
        const klein = w.toLowerCase();
        if (mitMajuskel && istGross(w)) {
          // Wort ganz groß oder nur Anfang groß: ein Zeichen vor dem Wort;
          // gemischt: vor jedem Großbuchstaben.
          const einmalVorWort = alleGross || nurErsteGross;
          if (!einmalVorWort || k === 0) units.push({ text: "", cells: [MAJUSKEL], kind: "punct" });
        }
        if (zahl && ZIFFERN_GLEICH.has(klein)) {
          units.push({ text: w, cells: [], kind: "unknown" });
          continue;
        }
        const cells = ZELLEN.get(klein);
        units.push(cells ? { text: w, cells, kind: "letter" } : { text: w, cells: [], kind: "unknown" });
      }
      i = j;
      continue;
    }

    // Rechenzeichen / Satzzeichen / Symbole
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
export function textToCellsFr(text: string, opts: { grossschreibzeichen?: boolean } = {}): Cell[] {
  return transcribeFr(text, opts).flatMap((u) => u.cells);
}
