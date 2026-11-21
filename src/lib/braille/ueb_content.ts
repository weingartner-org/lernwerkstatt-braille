/**
 * UEB-Lehrgang (Englisch Grade 2), Lektionen 4–22 (Kurzschrift-Kern).
 *
 * REINE DATEN — keine Logik, kein React.
 *
 * WAS Faktum ist (übernommen + zitiert):
 *  – Reihenfolge & Kürzungsinventar je Lektion nach
 *    „Unified English Braille: Australian Training Manual 2013"
 *    (Howse/Riessen/Holloway, Round Table on Information Access, CC BY-NC-ND 3.0),
 *    Lektionen 4–22 — der Lehrgang, auf dem UEB Online (uebonline.org) aufbaut.
 *    Kürzungsdefinitionen: „The Rules of Unified English Braille", ICEB.
 * WAS EIGENFORMULIERT ist (Lizenz):
 *  – alle Einführungstexte (introDu englisch „you", introSie deutsch „Sie");
 *    KEIN Satz aus Manual/UEB Online. Übungsmaterial (ueb_material.ts) stammt aus
 *    dem projekteigenen englischen Korpus, je Item via liblouis en-ueb-g2 geprüft.
 *
 * Die Punktmuster kommen NIE aus dieser Datei: Anzeige-Zellen aus
 * generated/ueb-cells.generated.json (build-time aus en-ueb-g2 extrahiert),
 * Lösungen zur Laufzeit aus liblouis en-ueb-g2 (solveUeb).
 *
 * `key` ist STABIL (geht in TaskEvent.unit/typed ein).
 */
import invRaw from "./generated/ueb-inventory.generated.json";
import cellsRaw from "./generated/ueb-cells.generated.json";

export type UebKind =
  | "alphaWordsign"   // Buchstabe allein = Wort (L4)
  | "strongWordsign"  // and/for/of/the/with allein (L5)
  | "strongGroupsign" // starke Gruppenkürzung im Wort (L6–9)
  | "groupWordsign"   // starke Gruppenkürzung, die allein ein Wort ist (child, out, still)
  | "lowerGroupsign"  // untere Gruppenkürzung (L10–12)
  | "lowerWordsign"   // untere Wortkürzung (L13)
  | "initialDot5" | "initialDot45" | "initialDot456" // Anfangskürzungen (L15–19)
  | "finalGroupsign"  // Schlusskürzung (L20–22)
  | "shortform";      // Shortform (L10–17)

export interface UebUnit {
  /** Stabiler Telemetrie-Schlüssel. */
  key: string;
  /** Zeichenkette im Wort (Gruppenkürzung) bzw. das ganze Wort (Wort-/Shortform). */
  form: string;
  /** Anzeige-Klartext. */
  print: string;
  /** Ausgeschriebene Bedeutung (Wort). */
  meaning: string;
  kind: UebKind;
  /** Gilt nur allein stehend (Wordsign)? */
  standalone: boolean;
}

export interface UebLesson {
  /** Stabile Etappen-id "ueb-l04".."ueb-l22". */
  id: string;
  /** Lektionsnummer im Manual (4..22). */
  nr: number;
  module: 1 | 2;
  /** Manual-Titel (Faktum). */
  title: string;
  units: UebUnit[];
  /** Kind-Ansprache „you" — eigener Merksatz. */
  introDu: string;
  /** Lehrkraft-Ansprache „Sie". */
  introSie: string;
}

/** Anzeige-Zellen je Form (build-time aus en-ueb-g2). */
export const UEB_CELLS: Record<string, string> = cellsRaw as Record<string, string>;

/** Sprechbares Label fürs Kind / ARIA (englisch). */
export function uebSpoken(u: UebUnit): string {
  switch (u.kind) {
    case "alphaWordsign":
    case "strongWordsign":
    case "lowerWordsign":
    case "groupWordsign":
    case "shortform":
    case "initialDot5":
    case "initialDot45":
    case "initialDot456":
      return `the sign for ${u.meaning}`;
    case "strongGroupsign":
    case "lowerGroupsign":
      return `the letter team ${u.form.split("").join("-").toUpperCase()}`;
    case "finalGroupsign":
      return `the ending ${u.form.toUpperCase()}`;
    default:
      return u.print;
  }
}

// --- Einführungstexte (EIGENFORMULIERT) --------------------------------------
type Intro = { du: string; sie: string };
const INTRO: Record<number, Intro> = {
  4: { du: "Some letters, standing all on their own, mean a whole word! b means but, c means can, k means knowledge. One little cell — a whole word.",
       sie: "Alphabetische Wortkürzungen: 23 Einzelbuchstaben stehen ALLEIN für ein ganzes Wort (b=but, k=knowledge). Nur allein stehend, nie im Wort." },
  5: { du: "Five busy little words get their very own sign: and, for, of, the, with. Each is just one cell.",
       sie: "Starke Wortkürzungen and/for/of/the/with — je eine Zelle, allein stehend. Stark bedeutet: Punkte oben und unten, links und rechts." },
  6: { du: "The same five signs also hide inside longer words: h+and makes hand, mo+the+r makes mother. Same sign, now a building block.",
       sie: "Dieselben fünf Zeichen als Gruppenkürzung IM Wort (hand, mother). Gleiche Zelle, jetzt als Wortbaustein." },
  7: { du: "Letter teams! ch, gh, sh, th, wh each shrink to one cell. And standing alone: ch means child, sh means shall, th means this, wh means which.",
       sie: "Starke Gruppenkürzungen ch/gh/sh/th/wh (je eine Zelle) und die zugehörigen Wortkürzungen child/shall/this/which (allein stehend)." },
  8: { du: "More teams to spot inside words: ed, er, ou, ow. And standing alone, ou means out.",
       sie: "Gruppenkürzungen ed/er/ou/ow; ou allein stehend = out." },
  9: { du: "Three more teams: st, ar, ing. The ing team never starts a word. On its own, st means still.",
       sie: "Gruppenkürzungen st/ar/ing (ing nie am Wortanfang); st allein stehend = still." },
  10: { du: "Some signs sit low in the cell: be, con, dis at the start of a word. And busy words get a short spelling — about becomes just a-b.",
        sie: "Untere Gruppen-/Präfixkürzungen be/con/dis (Wortanfang) plus erste Shortforms (about→ab). Untere Zeichen nutzen nur die unteren Punkte." },
  11: { du: "Hiding in the middle of words: ea, bb, cc, ff, gg. They only appear inside a word, never at the very start or end.",
        sie: "Untere Gruppenkürzungen ea/bb/cc/ff/gg — nur wortintern (Regel für untere Zeichen: sie brauchen Nachbarn)." },
  12: { du: "Two more lower signs: en and in. The lower-sign rule says they always need a letter to lean on.",
        sie: "Untere Gruppenkürzungen en/in; die Regel für untere Zeichen (Nachbarschaft) wird hier zentral." },
  13: { du: "Standing all alone, the lower signs turn into words: be, his, was, were, enough, in.",
        sie: "Untere Wortkürzungen be/his/was/were/enough/in (allein stehend) plus weitere Shortforms (because→bec …)." },
  14: { du: "A whole handful of short spellings: friend becomes fr, good becomes gd, great becomes grt. Short and handy!",
        sie: "Zusammenfassung untere Zeichen; weitere Shortforms (friend→fr, good→gd, great→grt …)." },
  15: { du: "Put a little dot in front of a letter and it becomes a word: day, ever, father, here, know, lord, mother.",
        sie: "Anfangskürzungen mit Punkt 5 vor den Buchstaben D–M (day, ever, father, here, know, lord, mother)." },
  16: { du: "More of these front-dot words: name, one, part, question, right, some, time, under.",
        sie: "Anfangskürzungen mit Punkt 5 vor N–U (name, one, part, question, right, some, time, under)." },
  17: { du: "The last front-dot words even team up with letter teams: where, through, there, character.",
        sie: "Restliche Punkt-5-Anfangskürzungen (work, young, there, character, through, where, ought)." },
  18: { du: "A different front sign makes these words: upon, word, these, those, whose.",
        sie: "Anfangskürzungen mit Punkt 4-5 (upon, word, these, those, whose)." },
  19: { du: "One more front sign gives strong words: cannot, had, many, spirit, world, their.",
        sie: "Anfangskürzungen mit Punkt 4-5-6 (cannot, had, many, spirit, world, their)." },
  20: { du: "Word endings get their own signs now: -tion, -ness, -less, -sion, -ance, -ence. Two cells, and lots of space saved.",
        sie: "Schlusskürzungen ance/ence/sion/tion/less/ness (zweizellig, Punkt 46/56 + Buchstabe)." },
  21: { du: "More endings to collect: -ound, -ong, -ount, -ment.",
        sie: "Schlusskürzungen ound/ong/ount/ment." },
  22: { du: "The very last endings: -ful and -ity. Now you know the whole set!",
        sie: "Schlusskürzungen ful/ity — damit sind die Schlusszeichen komplett." },
};

interface RawLesson { n: number; module: 1 | 2; title: string; units: Omit<UebUnit, never>[]; }

/** Die 19 UEB-Etappen (ueb-l04..ueb-l22), aus Inventar + Einführungstexten. */
export const UEB_LESSONS: UebLesson[] = (invRaw as RawLesson[]).map((L) => ({
  id: `ueb-l${String(L.n).padStart(2, "0")}`,
  nr: L.n,
  module: L.module,
  title: L.title,
  units: L.units as UebUnit[],
  introDu: INTRO[L.n]?.du ?? "",
  introSie: INTRO[L.n]?.sie ?? "",
}));

export function uebLesson(nr: number): UebLesson | undefined {
  return UEB_LESSONS.find((l) => l.nr === nr);
}
export function uebLessonById(id: string): UebLesson | undefined {
  return UEB_LESSONS.find((l) => l.id === id);
}
/** Alle Kürzungs-Formen bis einschließlich Lektion nr (Progressions-Invariante). */
export function uebFormsUpTo(nr: number): Set<string> {
  const s = new Set<string>();
  for (const l of UEB_LESSONS) if (l.nr <= nr) for (const u of l.units) s.add(u.form.toLowerCase());
  return s;
}
export function uebUnitByKey(key: string): (UebUnit & { lessonNr: number }) | undefined {
  for (const l of UEB_LESSONS) for (const u of l.units) if (u.key === key) return { ...u, lessonNr: l.nr };
  return undefined;
}
