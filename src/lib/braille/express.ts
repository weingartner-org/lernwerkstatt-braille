/**
 * Express-Pfad Vollschrift→Computerbraille U1–U8 (Bauvertrag §II.6 Teil B).
 *
 * Kernidee: Die vier Bruchstellen zwischen Voll- und Computerbraille als
 * Kontrast-Modul — gezielt provozierende Übungsaufgaben (Fokus-Override).
 * Reine Daten-/Logikschicht: kein React, kein Storage, kein ARIA.
 *
 * Sprache: Kind-Du / Studi-Sie gemäß Bauvertrag §6.
 */
import type { Cell } from "./cell";
import { textToCells } from "./engine";
import { CAPS_LETTER, NUMSIGN, LETTERS_6 } from "./tables";
import { COMP_GROSS } from "./vocab";

// ---------------------------------------------------------------------------
// Soft-Units: große Umlaute Ä/Ö/Ü gelten als „uneinheitlich" —
// Fehler darauf zählen NICHT ins Mastery-Gate (s. etappen.ts SOFT_UNITS).
// ---------------------------------------------------------------------------

/** Zeichen, die im 8-Punkt-System nicht voll genormt sind.
 *  Fehler darauf lösen keinen harten Malus aus. */
export const SOFT_UNITS_EXPRESS: ReadonlySet<string> = new Set(["Ä", "Ö", "Ü"]);

// ---------------------------------------------------------------------------
// B — Die vier Bruchstellen (CONTRAST_TABLE)
// ---------------------------------------------------------------------------

export interface BruchKontrast {
  id: "B1" | "B2" | "B3" | "B4";
  /** Kurztitel für die Lehrkraft-Ansicht (Sie). */
  label: string;
  /** Was der Vollschrift-Reflex auslöst (Kind, Du). */
  vollReflex: string;
  /** Richtige Regel im Computerbraille (Kind, Du). */
  pcRegel: string;
  /** Konkretes Beispiel mit Punktangaben. */
  beispiel: { druck: string; vollDots: string; pcDots: string };
}

export const CONTRAST_TABLE: BruchKontrast[] = [
  {
    id: "B1",
    label: "Großschreibung",
    vollReflex:
      "Früher kam ein Ankündigungszeichen (Punkte 4·6) VOR den Buchstaben.",
    pcRegel:
      "Am PC: Punkt 7 IN derselben Zelle. Kein Zeichen davor.",
    beispiel: { druck: "A", vollDots: "4·6 dann 1", pcDots: "1·7" },
  },
  {
    id: "B2",
    label: "Zahlen",
    vollReflex:
      "Früher kam das Zahlzeichen (Punkte 3·4·5·6) vor die Zahl.",
    pcRegel:
      "Am PC hat jede Ziffer eine eigene Taste. Kein Zahlzeichen. Achtung: 3·4·5·6 ist am PC das Zeichen #.",
    beispiel: {
      druck: "5",
      vollDots: "3·4·5·6 dann 1·5",
      pcDots: "1·5·6",
    },
  },
  {
    id: "B3",
    label: "Lautgruppen",
    vollReflex: "Früher war sch eine einzige Zelle (Punkte 1·5·6).",
    pcRegel:
      "Am PC gibt es keine Kürzel. sch ist s, c, h — drei Zellen.",
    beispiel: {
      druck: "sch",
      vollDots: "1·5·6",
      pcDots: "2·3·4  1·4  1·2·5",
    },
  },
  {
    id: "B4",
    label: "Umlaute",
    vollReflex: "Früher war ä Punkte 3·4·5.",
    pcRegel: "Am PC bekommt ä zusätzlich Punkt 8: 3·4·5·8.",
    beispiel: { druck: "ä", vollDots: "3·4·5", pcDots: "3·4·5·8" },
  },
];

// ---------------------------------------------------------------------------
// Express-Übungsaufgabe
// ---------------------------------------------------------------------------

export interface ExpressItem {
  /** Druckschrift-Aufgabe, z. B. "A", "5", "Schal", "über@web.de". */
  prompt: string;
  /** Welcher Bruch hier provoziert wird. */
  bruch: "B1" | "B2" | "B3" | "B4";
  /** Soll-Zellen in 8-Punkt (aus transcribeComputer). */
  solution: Cell[];
  /** Sprechbarer Anker fürs Kind (ARIA). */
  spoken: string;
}

// ---------------------------------------------------------------------------
// Interne Helfer
// ---------------------------------------------------------------------------

function pickN<T>(arr: readonly T[], n: number, rnd: () => number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, Math.min(n, copy.length));
}

// ---------------------------------------------------------------------------
// Spezialisierte Generatoren
// ---------------------------------------------------------------------------

/**
 * U3: Großbuchstaben-Reflex.
 * Zieht aus COMP_GROSS, bevorzugt kurze Wörter (B1 deutlich sichtbar).
 */
export function genU3_grossReflex(
  pool: readonly string[],
  n: number,
  rnd: () => number = Math.random,
): ExpressItem[] {
  const candidates = pool
    .filter((w) => /^[A-Z]/.test(w) && !/[äöüßÄÖÜ]/.test(w))
    .sort((a, b) => a.length - b.length);
  return pickN(candidates, n, rnd).map((w) => ({
    prompt: w,
    bruch: "B1" as const,
    solution: textToCells(w, { system: "computer" }),
    spoken: `großes ${w[0]}`,
  }));
}

/**
 * U5: Zahl-Reflex.
 * 60 % reine Zahlen, 40 % #-Fallen-Items (prompt="#").
 */
export function genU5_zahlReflex(
  n: number,
  rnd: () => number = Math.random,
): ExpressItem[] {
  const NUMBERS = ["5", "42", "2026", "100", "7", "0", "3", "8", "12", "99"];
  const numCount = Math.max(1, Math.ceil(n * 0.6));
  const trapCount = n - numCount;

  const numItems: ExpressItem[] = pickN(NUMBERS, numCount, rnd).map((w) => ({
    prompt: w,
    bruch: "B2" as const,
    solution: textToCells(w, { system: "computer" }),
    spoken: w,
  }));

  const trapItems: ExpressItem[] = Array.from({ length: trapCount }, () => ({
    prompt: "#",
    bruch: "B2" as const,
    solution: textToCells("#", { system: "computer" }),
    spoken: "Raute",
  }));

  return [...numItems, ...trapItems];
}

/**
 * U2/U7: Umlaut-Reflex (B4) oder Lautgruppen-Reflex (B3).
 * Zieht Wörter mit /[äöüß]/ (B4) oder /sch|ch|st/ (B3) aus dem Pool.
 */
export function genU_kuerzelReflex(
  pool: readonly string[],
  n: number,
  rnd: () => number = Math.random,
): ExpressItem[] {
  const umlautWords = pool.filter((w) => /[äöüß]/.test(w.toLowerCase()));
  const kuerzelWords = pool.filter((w) =>
    /sch|ch|st/.test(w.toLowerCase()),
  );
  const combined = [...new Set([...umlautWords, ...kuerzelWords])];

  return pickN(combined, n, rnd).map((w) => {
    const hasUmlaut = /[äöüß]/.test(w.toLowerCase());
    const bruch: ExpressItem["bruch"] = hasUmlaut ? "B4" : "B3";
    return {
      prompt: w,
      bruch,
      solution: textToCells(w, { system: "computer" }),
      spoken: w,
    };
  });
}

// ---------------------------------------------------------------------------
// Haupt-Generator
// ---------------------------------------------------------------------------

/**
 * Erzeugt n Override-Items für eine U-Etappe.
 * Pickt gezielt an der jeweiligen Bruchstelle.
 */
export function genExpressItems(
  uId: "u1" | "u2" | "u3" | "u4" | "u5" | "u6" | "u7" | "u8",
  pool: readonly string[],
  n: number,
  rnd: () => number = Math.random,
): ExpressItem[] {
  switch (uId) {
    case "u1":
      // Kontrast-Tour: kein Override, einfache Buchstaben-Einführung
      return pickN(
        pool.filter((w) => /^[a-z]+$/.test(w) && w.length <= 4),
        n,
        rnd,
      ).map((w) => ({
        prompt: w,
        bruch: "B1" as const,
        solution: textToCells(w, { system: "computer" }),
        spoken: w,
      }));
    case "u2":
      return pickN(
        pool.filter((w) => /[äöüß]/.test(w.toLowerCase())),
        n,
        rnd,
      ).map((w) => ({
        prompt: w,
        bruch: "B4" as const,
        solution: textToCells(w, { system: "computer" }),
        spoken: w,
      }));
    case "u3":
      return genU3_grossReflex(COMP_GROSS, n, rnd);
    case "u4":
      // Groß/Klein-Wechsel im selben Wort
      return pickN(
        COMP_GROSS.filter((w) => /[a-z]/.test(w) && /[A-Z]/.test(w)),
        n,
        rnd,
      ).map((w) => ({
        prompt: w,
        bruch: "B1" as const,
        solution: textToCells(w, { system: "computer" }),
        spoken: w,
      }));
    case "u5":
      return genU5_zahlReflex(n, rnd);
    case "u6": {
      const INTP = ["!", '"', "?", ";", ":", "(", ")"];
      const ipItems = INTP.flatMap((c) => {
        const sol = textToCells(c, { system: "computer" });
        return sol.length > 0 ? [{ prompt: c, bruch: "B3" as const, solution: sol, spoken: c }] : [];
      });
      return pickN(ipItems, n, rnd);
    }
    case "u7": {
      const SONZ = ["@", "#", "&", "%", "/", "<", ">", "=", "+", "*", "-"];
      const szItems = SONZ.flatMap((c) => {
        const sol = textToCells(c, { system: "computer" });
        return sol.length > 0 ? [{ prompt: c, bruch: "B3" as const, solution: sol, spoken: c }] : [];
      });
      return pickN(szItems, n, rnd);
    }
    case "u8":
      // Transfer: alle vier Brüche gemischt, aus vollem Pool
      return genU_kuerzelReflex(pool, n, rnd);
    default:
      return [];
  }
}

// ---------------------------------------------------------------------------
// Verortendes Fehler-Feedback
// ---------------------------------------------------------------------------

// 6-Punkt-Umlaut-Zellen (was ein Vollschrift-Reflex liefern würde)
const SIX_PT_UMLAUTS: ReadonlySet<Cell> = new Set([
  LETTERS_6["ä"]!,
  LETTERS_6["ö"]!,
  LETTERS_6["ü"]!,
  LETTERS_6["ß"]!,
]);

/**
 * Verortet den Fehler an der Bruchstelle.
 * Liefert null, wenn der Fehler nicht zu einem der vier Brüche passt
 * (dann generisches Feedback verwenden).
 */
export function locateBruchError(
  item: ExpressItem,
  typed: readonly Cell[],
): { bruch: BruchKontrast["id"]; text: string } | null {
  const { solution } = item;

  // B2: getippte Folge beginnt mit NUMSIGN (= alter NUMSIGN / 8-Punkt-#)
  if (
    typed.length > 0 &&
    typed[0] === NUMSIGN &&
    solution.length > 0 &&
    typed[0] !== solution[0]
  ) {
    return {
      bruch: "B2",
      text:
        "Am PC kein Zahlzeichen — die Ziffer hat eine eigene Taste. 3·4·5·6 ist am PC das Zeichen #.",
    };
  }

  // B1: getippte Folge enthält CAPS_LETTER (6-Punkt-Großansage), Soll hat Grundzelle+Punkt7
  if (typed.includes(CAPS_LETTER)) {
    const buchIdx = typed.indexOf(CAPS_LETTER);
    const nextCell = typed[buchIdx + 1];
    // Versuche den Buchstaben-Namen zu finden
    const buchName =
      nextCell !== undefined
        ? (Object.entries(LETTERS_6).find(([, c]) => c === nextCell)?.[0]?.toUpperCase() ??
          item.prompt[0] ??
          "?")
        : (item.prompt[0] ?? "?");
    return {
      bruch: "B1",
      text: `Am PC keine Großansage davor — großes ${buchName} ist der kleine Buchstabe plus Punkt 7 (deine A-Taste).`,
    };
  }

  // B3: getippte Folge hat weniger Zellen als Soll (Kürzel statt Einzelzeichen)
  if (typed.length < solution.length && solution.length >= 2) {
    return {
      bruch: "B3",
      text: `Am PC keine Kürzel — "${item.prompt}" schreibst du Buchstabe für Buchstabe.`,
    };
  }

  // B4: getippte Umlautzelle ohne Punkt 8 (6-Punkt-Form)
  if (typed.some((c) => SIX_PT_UMLAUTS.has(c))) {
    return {
      bruch: "B4",
      text: "Am PC bekommt der Umlaut zusätzlich Punkt 8 — deine ö-Taste.",
    };
  }

  return null;
}
