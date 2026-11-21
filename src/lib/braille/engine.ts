/**
 * Braille-Engine: wandelt deutschen Text in eine Folge von Braillezellen
 * (Punkte-Logik) — die Quelle der Wahrheit für Anzeige und Eingabe-Prüfung.
 *
 * Unterstützt Basisschrift und Vollschrift (6 Punkt). Computerbraille (8 Punkt)
 * folgt separat.
 *
 * Das Ergebnis ist eine Liste von „Einheiten": jede Einheit kennt ihr
 * Original-Textstück UND die zugehörigen Zellen. So lässt sich später ganz
 * gezielt rückmelden („das H = Großbuchstaben-Ankündigung + h, 2 Zellen").
 */
import { BLANK, Cell, parseDots } from "./cell";
import {
  BrailleSystem,
  CAPS_LETTER,
  CAPS_WORD,
  CAPS_WORD_END,
  CHAR_TO_CELL_8,
  CONTRACTIONS_VOLL,
  DIGIT_CELLS,
  LETTERS_6,
  MATH_CHARS,
  MULTI_SYMBOLS_6,
  NUMSIGN,
  SYMBOLS_6,
} from "./tables";
import VOLL_AUSNAHMEN from "./generated/voll-ausnahmen.generated.json";
import { lehrSprache, type LehrSprache } from "./sprachen/aktuell";
import { SPRACH_TRANSCRIBE } from "./sprachen/engines";

export type UnitKind =
  | "letter"
  | "contraction"
  | "number"
  | "punct"
  | "math"
  | "space"
  | "unknown";

export interface Unit {
  /** Original-Textstück (z. B. "H", "sch", "12", " "). */
  text: string;
  /** Zugehörige Braillezellen (inkl. Steuerzeichen wie Zahl-/Großschreibz.). */
  cells: Cell[];
  kind: UnitKind;
}

export interface TranscribeOptions {
  system?: BrailleSystem;
  /**
   * Sprache der Schrift (Bauplan Sprachen-Apps 2026-11-06 §4). Fehlt sie, gilt
   * `lehrSprache()` - und die ist "de", solange der Probe-Schalter
   * `?punktgenau-sprachen=1` aus ist. Nur die Sprachen aus `sprachen/engines.ts` (fr es it) schreiben hier anders (Vollschrift
   * nach dem CBFU 2008, `sprachen/fr/engine.ts`); alles andere läuft wie bisher.
   */
  sprache?: LehrSprache;
  /**
   * Großschreibzeichen setzen? Default true.
   *
   * ★ Warum es diesen Schalter gibt (Johannes, 20.09.2026): Manche Kinder sind
   * am Anfang überfordert, wenn vor jedem großen Buchstaben noch eine eigene
   * Ankündigungszelle steht. Er fängt dann ohne sie an und schaltet sie später
   * dazu. Ist der Schalter aus, entfallen in Basis- und Vollschrift die drei
   * Steuerzellen (Punkte 4·6 für einen Großbuchstaben, 4·5 für eine Folge,
   * Punkt 6 für ihr Ende) - der Buchstabe selbst bleibt unverändert.
   *
   * Computerbraille ist nicht betroffen: dort steckt die Großschreibung im
   * Punkt 7 des Zeichens selbst, es gibt keine Ankündigungszelle.
   */
  grossschreibzeichen?: boolean;
}

const RE_DIGIT = /[0-9]/;
const RE_SPACE = /\s/;
const RE_LETTER = /[a-zäöüßA-ZÄÖÜ]/;
const RE_UPPER = /[A-ZÄÖÜ]/;

const COMMA_CELL = parseDots("2"); // Komma / Dezimalkomma in Zahlen
const DOT_CELL = parseDots("3"); // Punkt als Tausendertrenner in Zahlen

/**
 * ★ Stellen, an denen in der Vollschrift NICHT gekürzt werden darf, obwohl die
 * Buchstaben dastehen. Schlüssel = kleingeschriebenes Wort, Wert = Positionen
 * im Wort. GEMESSEN an liblouis de-g1, nicht selbst aufgestellt:
 * `npm run voll:ausnahmen` (scripts/voll-ausnahmen-erzeugen.mts).
 *
 * Warum (Befund 20.09.2026, Johannes): Die Vollschrift kürzt au, äu, eu, ei,
 * ie, ch, sch, st nur, wenn die Buchstaben lautlich bzw. als Wortbestandteil
 * zusammengehören. „Linie" ist Li-ni-e, also l·i·n·i·e - nicht l·i·n·ie.
 * „Geburtstag" ist Geburts|tag, „Haustür" Haus|tür - dort steht s·t, nicht st.
 * Umgekehrt ist „waschen" wasch|en und WIRD gekürzt; die frühere Pauschalsperre
 * für „schen" schrieb deshalb waschen, naschen, zwischen, frischen, klatschen
 * und rauschen falsch (alle acht gemessen am 20.09.).
 */
const AUSNAHMEN: Record<string, number[]> = VOLL_AUSNAHMEN.ausnahmen;

/**
 * Längste Lautgruppe ab Position 0 von `window` (de-g1, längste zuerst).
 * `window` = bis zu 5 Zeichen ab i, lowercase. Rein mechanisch - wo das falsch
 * wäre, greift die gemessene Sperrliste AUSNAHMEN (siehe `sperrstellen`).
 */
export function matchContraction(window: string): { seq: string; cell: Cell } | null {
  for (const c of CONTRACTIONS_VOLL) {
    if (window.startsWith(c.seq)) return c;
  }
  return null;
}

/**
 * Absolute Positionen im Text, an denen keine Lautgruppe gekürzt werden darf.
 * Dazu wird der Text in Buchstaben-Wörter zerlegt und jedes Wort in AUSNAHMEN
 * nachgeschlagen; die Wort-Positionen werden auf den Text umgerechnet.
 */
export function sperrstellen(chars: string[]): Set<number> {
  const gesperrt = new Set<number>();
  let start = -1;
  let wort = "";
  const abschliessen = () => {
    if (start >= 0) {
      const stellen = AUSNAHMEN[wort.toLowerCase()];
      if (stellen) for (const n of stellen) gesperrt.add(start + n);
    }
    start = -1;
    wort = "";
  };
  for (let i = 0; i < chars.length; i++) {
    if (RE_LETTER.test(chars[i])) {
      if (start < 0) start = i;
      wort += chars[i];
    } else {
      abschliessen();
    }
  }
  abschliessen();
  return gesperrt;
}

/**
 * Prüft ob `seq` (eine Lautgruppe wie "ei", "sch") im Wort vorkommt.
 * Für den items()-Filter der Voll-Etappen.
 */
export function hasGroupVoll(word: string, seq: string): boolean {
  return word.toLowerCase().includes(seq);
}

/**
 * Länge der zusammenhängenden Großbuchstaben-Folge ab Position i.
 * Für CAPS_WORD-Erkennung: run >= 2 → einmal CAPS_WORD statt je CAPS_LETTER.
 */
export function capsRunLength(chars: string[], i: number): number {
  let n = 0;
  while (i + n < chars.length && RE_UPPER.test(chars[i + n])) n++;
  return n;
}

/** Zellfolge → Braille-Unicode-String (U+2800-Block). Für liblouis-Vergleich. */
export function cellsToUnicode(cells: Cell[]): string {
  return cells.map((c) => String.fromCodePoint(0x2800 + (c & 0xff))).join("");
}

/**
 * Text → Einheiten. Jede Einheit trägt Text und Zellen.
 * (Computerbraille wird hier noch wie Basisschrift behandelt — 8 Punkt folgt.)
 */
export function transcribe(text: string, opts: TranscribeOptions = {}): Unit[] {
  const system = opts.system ?? "basis";
  if (system === "computer") return transcribeComputer(text);
  const sprachEngine = SPRACH_TRANSCRIBE[opts.sprache ?? lehrSprache()];
  if (sprachEngine && system === "voll") {
    return sprachEngine(text, { grossschreibzeichen: opts.grossschreibzeichen });
  }
  const voll = system === "voll";
  const mitCaps = opts.grossschreibzeichen !== false;
  const chars = [...text];
  const gesperrt = voll ? sperrstellen(chars) : null;
  const units: Unit[] = [];
  let i = 0;
  let inCapsWord = false;

  while (i < chars.length) {
    const ch = chars[i];

    // CAPS_WORD-Ende: erste nicht-großgeschriebene Stelle nach Versalfolge
    if (mitCaps && inCapsWord && !RE_UPPER.test(ch)) {
      inCapsWord = false;
      // Wort-interne Grenze (z. B. USBstick): CAPS_WORD_END vor dem Kleinbuchstaben
      if (RE_LETTER.test(ch)) {
        units.push({ text: "", cells: [CAPS_WORD_END], kind: "punct" });
      }
      // Kein continue — ch wird unten normal verarbeitet
    }

    // Leerzeichen / Zeilenumbruch
    if (RE_SPACE.test(ch)) {
      units.push({ text: ch, cells: [BLANK], kind: "space" });
      i++;
      continue;
    }

    // Zahl: Zahlzeichen + Ziffern; interne ,/. zwischen Ziffern bleiben drin
    if (RE_DIGIT.test(ch)) {
      let num = "";
      let j = i;
      while (j < chars.length) {
        const c = chars[j];
        if (RE_DIGIT.test(c)) {
          num += c;
          j++;
          continue;
        }
        if (
          (c === "," || c === ".") &&
          j + 1 < chars.length &&
          RE_DIGIT.test(chars[j + 1])
        ) {
          num += c;
          j++;
          continue;
        }
        break;
      }
      const cells: Cell[] = [NUMSIGN];
      for (const d of num) {
        if (d === ",") cells.push(COMMA_CELL);
        else if (d === ".") cells.push(DOT_CELL);
        else cells.push(DIGIT_CELLS[Number(d)]);
      }
      units.push({ text: num, cells, kind: "number" });
      i = j;
      continue;
    }

    // Buchstabe (inkl. Umlaute), ggf. mit Großschreib-Ankündigung + Lautgruppe
    if (RE_LETTER.test(ch)) {
      const isUpper = RE_UPPER.test(ch);
      const cells: Cell[] = [];

      if (mitCaps && isUpper && !inCapsWord) {
        const run = capsRunLength(chars, i);
        if (run >= 2) {
          cells.push(CAPS_WORD);
          inCapsWord = true;
        } else {
          cells.push(CAPS_LETTER);
        }
      }
      // isUpper && inCapsWord → kein Caps-Push (Folge läuft schon)

      // Vollschrift: längste Lautgruppe - außer diese Stelle ist gesperrt
      let matched: { seq: string; cell: Cell } | null = null;
      if (voll && !gesperrt!.has(i)) {
        matched = matchContraction(chars.slice(i, i + 5).join("").toLowerCase());
      }

      if (matched) {
        cells.push(matched.cell);
        const len = matched.seq.length;
        units.push({
          text: chars.slice(i, i + len).join(""),
          cells,
          kind: "contraction",
        });
        i += len;
        continue;
      }

      const lower = ch.toLowerCase();
      if (Object.hasOwn(LETTERS_6, lower)) {
        cells.push(LETTERS_6[lower]);
        units.push({ text: ch, cells, kind: "letter" });
      } else {
        units.push({ text: ch, cells: [], kind: "unknown" });
      }
      i++;
      continue;
    }

    // Mehrzellige Zeichen (% dreizellig, § — Muster aus liblouis de-g0)
    if (Object.hasOwn(MULTI_SYMBOLS_6, ch)) {
      units.push({ text: ch, cells: [...MULTI_SYMBOLS_6[ch]], kind: "punct" });
      i++;
      continue;
    }

    // Satz- oder Rechenzeichen
    if (Object.hasOwn(SYMBOLS_6, ch)) {
      units.push({
        text: ch,
        cells: [SYMBOLS_6[ch]],
        kind: MATH_CHARS.has(ch) ? "math" : "punct",
      });
      i++;
      continue;
    }

    // Unbekanntes Zeichen — keine Zelle, aber sichtbar als Einheit
    units.push({ text: ch, cells: [], kind: "unknown" });
    i++;
  }

  return units;
}

/** Computerbraille (8 Punkt): jedes Zeichen genau eine Zelle, ohne Steuerzeichen. */
function transcribeComputer(text: string): Unit[] {
  const units: Unit[] = [];
  for (const ch of [...text]) {
    if (RE_SPACE.test(ch)) {
      units.push({ text: ch, cells: [BLANK], kind: "space" });
    } else if (Object.hasOwn(CHAR_TO_CELL_8, ch)) {
      const kind: UnitKind = /[0-9]/.test(ch)
        ? "number"
        : RE_LETTER.test(ch)
          ? "letter"
          : MATH_CHARS.has(ch)
            ? "math"
            : "punct";
      units.push({ text: ch, cells: [CHAR_TO_CELL_8[ch]], kind });
    } else {
      units.push({ text: ch, cells: [], kind: "unknown" });
    }
  }
  return units;
}

/** Text → flache Zellfolge. */
export function textToCells(text: string, opts: TranscribeOptions = {}): Cell[] {
  return transcribe(text, opts).flatMap((u) => u.cells);
}

/** Wie viele Zellen ergibt dieser Text? (für Fortschritt/Statistik) */
export function cellCount(text: string, opts: TranscribeOptions = {}): number {
  return textToCells(text, opts).length;
}
