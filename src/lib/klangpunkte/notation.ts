/**
 * Braille-Musiknotation — Punktmuster + Transkription für „Klangpunkte"
 * (eigenständiges Braille-Musik-Lernprogramm). Reine Daten/Logik, kein React,
 * kein Audio.
 *
 * Quellen (Regeln eigenständig nachimplementiert, keine Lehrbuch-Texte):
 *  - „New International Manual of Braille Music Notation" (Krolick 1996),
 *    deutsch: „Handbuch der Braille-Notenschrift" (SBS Zürich 1998),
 *    braille.ch/musik — Noten/Werte Par. 1-1, Punktierung Par. 1-2,
 *    Mehrtaktpausen Par. 1-7, Oktavzeichen Par. 1-8…1-10, Schlüssel Kap. II,
 *    Vorzeichen/Tonart/Takt Kap. III (Par. 3-4…3-8), Gruppierung/Triole
 *    Kap. IV (Par. 4-2), Haltebogen Kap. VI, Musik-Bindestrich Kap. IX.
 *  - BANA „Music Braille Code 2015" (Tables 2, 3, 5, 6, 7, 16) — deckungsgleich.
 *  - Gegenprobe der Schlüssel-/Sonderzeichen: music21 braille/lookup.py (BSD).
 * Kern-Merksatz (Dekaden-Analogie, Workshop E. Schmid/BBI): Tonhöhen c–h sind
 * die Braille-Buchstaben d–j; die Notenwerte entstehen mit denselben Punkten
 * 3/6, die auch die Alphabet-Reihen k–t und u–z bilden.
 */
import { BLANK, dotBit, dots, type Cell } from "../braille/cell";
import { TONNAMEN, type Tonnamen } from "./tonnamen";
import { klangSprache, klangTexte } from "./sprache";

// --- Töne, Werte, Grundtypen -------------------------------------------------

/** Deutsche Stammtöne (h = internationales b). */
export const TONES = ["c", "d", "e", "f", "g", "a", "h"] as const;
export type ToneName = (typeof TONES)[number];

/** Die vier Grundwerte des Lernpfads (kp5/kp6). */
export const VALUES = ["ganze", "halbe", "viertel", "achtel"] as const;
/** Sechzehntel kommen in den Liedern vor — in Braille bewusst DIESELBE Zelle
 *  wie die ganze Note (Wertmehrdeutigkeit, Krolick Par. 1-1 / Etappe kp12). */
export type NoteValue = (typeof VALUES)[number] | "sechzehntel";

export type Accidental = "kreuz" | "be" | "aufloesung";

/** Artikulation fürs KLINGEN (Stufe 3, Welt 4). staccato = kurz abgesetzt,
 *  tenuto = voll ausgehalten, akzent = betont angeschlagen. Die Braille-Zeichen
 *  setzen die Generatoren selbst (ARTIC_CELLS); dieses Feld steuert nur den Klang. */
export type Articulation = "staccato" | "tenuto" | "akzent";

/** Eine Note. Oktave in wissenschaftlicher Zählung: 4 = eingestrichen (c4 = mittleres C). */
export interface MusicNote {
  kind: "note";
  tone: ToneName;
  octave: number; // 1..7
  value: NoteValue;
  dotted?: boolean;
  accidental?: Accidental;
  /** Haltebogen ZUR NÄCHSTEN Note (gleiche Tonhöhe): klingt weiter, ohne neuen
   *  Anschlag. In Braille zwei Zellen NACH der Note (Krolick Kap. VI). */
  tie?: boolean;
  /** Triole: die Note dauert 2/3 ihres Werts (Krolick Kap. IV). Das
   *  Triolenzeichen ⠆ steht einmal VOR der Gruppe — das setzen die Aufgaben
   *  selbst, transcribe() kodiert nur die Dauer fürs Abspielen. */
  tuplet?: 3;
  /** Artikulation fürs Abspielen (nur Klang, Stufe 3). */
  artic?: Articulation;
}

export interface MusicRest {
  kind: "rest";
  value: NoteValue;
  dotted?: boolean;
}

/** Taktstrich — in Braille ein Leerzeichen (leere Zelle). */
export interface BarLine {
  kind: "bar";
}

export type MusicEvent = MusicNote | MusicRest | BarLine;

export interface Melody {
  /** Taktart als [Zähler, Nenner], z. B. [4, 4]. Ohne = keine Taktangabe. */
  timeSig?: [number, number];
  events: MusicEvent[];
  /** Dynamik-Verlauf über die ganze Melodie (linearer Gain, Stufe 3):
   *  für crescendo/decrescendo-Hörübungen. 1.0 = normal, 0.25 = leise. */
  dynamik?: { startGain: number; endGain: number };
  /** Tempo-Verlauf (Viertel-Sekunden, Stufe 3): für accelerando/ritardando. */
  tempoRamp?: { from: number; to: number };
}

export const note = (
  tone: ToneName,
  octave: number,
  value: NoteValue,
  extra: {
    dotted?: boolean;
    accidental?: Accidental;
    tie?: boolean;
    tuplet?: 3;
    artic?: Articulation;
  } = {},
): MusicNote => ({ kind: "note", tone, octave, value, ...extra });

export const rest = (value: NoteValue, dotted?: boolean): MusicRest => ({
  kind: "rest",
  value,
  ...(dotted ? { dotted } : {}),
});

export const bar: BarLine = { kind: "bar" };

// --- Punktmuster (Krolick Table 1A / BANA Table 2) ----------------------------

/** Tonhöhen-Punkte (obere 4 Punkte 1/2/4/5) — c–h = Braille-Buchstaben d–j. */
export const TONE_DOTS: Record<ToneName, number[]> = {
  c: [1, 4, 5],
  d: [1, 5],
  e: [1, 2, 4],
  f: [1, 2, 4, 5],
  g: [1, 2, 5],
  a: [2, 4],
  h: [2, 4, 5],
};

/** Wert-Zusatzpunkte (untere Punkte 3/6). Sechzehntel = wie ganze (Par. 1-1). */
export const VALUE_DOTS: Record<NoteValue, number[]> = {
  achtel: [],
  viertel: [6],
  halbe: [3],
  ganze: [3, 6],
  sechzehntel: [3, 6],
};

/** Pausen (Krolick Table 1A / BANA Table 5). Sechzehntel = wie ganze Pause. */
export const REST_CELLS: Record<NoteValue, Cell> = {
  ganze: dots(1, 3, 4),
  halbe: dots(1, 3, 6),
  viertel: dots(1, 2, 3, 6),
  achtel: dots(1, 3, 4, 6),
  sechzehntel: dots(1, 3, 4),
};

/** Oktavzeichen 1.–7. Oktave (Krolick Par. 1-9 / BANA Table 3). */
export const OCTAVE_CELLS: Record<number, Cell> = {
  1: dots(4),
  2: dots(4, 5),
  3: dots(4, 5, 6),
  4: dots(5),
  5: dots(4, 6),
  6: dots(5, 6),
  7: dots(6),
};

/** Versetzungszeichen (Krolick Kap. III / BANA Table 6). */
export const ACCIDENTAL_CELLS: Record<Accidental, Cell> = {
  kreuz: dots(1, 4, 6),
  be: dots(1, 2, 6),
  aufloesung: dots(1, 6),
};

/** Verlängerungspunkt (eigene Zelle direkt nach der Note, Krolick Par. 1-2). */
export const DOT3_CELL: Cell = dots(3);

/** Zahlzeichen (für Taktangaben). */
export const NUMBER_SIGN: Cell = dots(3, 4, 5, 6);

/** Oberzahlen 1–9, 0 (Braille-Ziffern a–j). */
const UPPER_DIGIT: Record<number, Cell> = {
  1: dots(1), 2: dots(1, 2), 3: dots(1, 4), 4: dots(1, 4, 5), 5: dots(1, 5),
  6: dots(1, 2, 4), 7: dots(1, 2, 4, 5), 8: dots(1, 2, 5), 9: dots(2, 4), 0: dots(2, 4, 5),
};

/** Unterzahlen (abgesenkte Ziffern für den Takt-Nenner, Krolick Par. 3-6). */
const LOWER_DIGIT: Record<number, Cell> = {
  1: dots(2), 2: dots(2, 3), 3: dots(2, 5), 4: dots(2, 5, 6), 5: dots(2, 6),
  6: dots(2, 3, 5), 7: dots(2, 3, 5, 6), 8: dots(2, 3, 6), 9: dots(3, 5), 0: dots(3, 5, 6),
};

/** Wiederholung/Form (Krolick Kap. IX / BANA Tables 17–20). */
export const SIMILE_CELL: Cell = dots(2, 3, 5, 6); // Braille-Taktwiederholung
export const REPEAT_START: Cell[] = [dots(1, 2, 6), dots(2, 3, 5, 6)]; // ⠣⠶
export const REPEAT_END: Cell[] = [dots(1, 2, 6), dots(2, 3)]; // ⠣⠆
export const FINAL_BAR: Cell[] = [dots(1, 2, 6), dots(1, 3)]; // ⠣⠅ Schlussstrich
export const SECTION_BAR: Cell[] = [dots(1, 2, 6), dots(1, 3), dots(3)]; // ⠣⠅⠄

/** Haltebogen ⠈⠉ — zwei Zellen NACH der Note (Krolick Kap. VI / BANA Table 13). */
export const TIE_CELLS: Cell[] = [dots(4), dots(1, 4)];

/** Triolenzeichen ⠆ — einmal VOR der Dreiergruppe (Krolick Kap. IV / BANA Table 16). */
export const TRIPLET_CELL: Cell = dots(2, 3);

/** Musik-Bindestrich ⠐ — der Takt geht auf der nächsten Zeile weiter (Kap. IX). */
export const MUSIC_HYPHEN_CELL: Cell = dots(5);

/** Sonder-Taktangaben (Par. 3-6): C = ⠨⠉ (4/4), alla breve = ⠸⠉ (2/2). */
export const COMMON_TIME_CELLS: Cell[] = [dots(4, 6), dots(1, 4)];
export const ALLA_BREVE_CELLS: Cell[] = [dots(4, 5, 6), dots(1, 4)];

/** Schlüsselzeichen (Krolick Kap. II — in Braille NUR informativ: die Lage
 *  bestimmen die Oktavzeichen). Präfix 345 + Art + Abschluss 123. */
export type ClefName = "violin" | "bass" | "alt";
export const CLEF_CELLS: Record<ClefName, Cell[]> = {
  violin: [dots(3, 4, 5), dots(3, 4), dots(1, 2, 3)], // ⠜⠌⠇ G-Schlüssel
  bass: [dots(3, 4, 5), dots(3, 4, 5, 6), dots(1, 2, 3)], // ⠜⠼⠇ F-Schlüssel
  alt: [dots(3, 4, 5), dots(3, 4, 6), dots(1, 2, 3)], // ⠜⠬⠇ C-Schlüssel
};
export const CLEF_LABELS: Record<ClefName, string> = lebendig(
  ["violin", "bass", "alt"] as const,
  (k) => klangTexte().musik.schluessel[k],
);

/** Oberzahl-Zellen einer (auch mehrstelligen) Zahl — für Tonart/Mehrtaktpause. */
export function upperDigitCells(n: number): Cell[] {
  return String(n)
    .split("")
    .map((ch) => UPPER_DIGIT[Number(ch)]);
}

/**
 * Tonartvorzeichnung (Par. 3-4): 1–3 Vorzeichen einfach wiederholt,
 * ab 4 mit Zahlzeichen (⠼⠙⠩ = 4 Kreuze).
 */
export function keySignatureCells(count: number, acc: "kreuz" | "be"): Cell[] {
  const a = ACCIDENTAL_CELLS[acc];
  if (count <= 3) return Array.from({ length: count }, () => a);
  return [NUMBER_SIGN, ...upperDigitCells(count), a];
}

/**
 * Mehrtaktpause (Par. 1-7): 2–3 Leertakte = ganze Pause je Takt hintereinander;
 * ab 4 Takten Zahl + ganze Pause (⠼⠙⠍ = 4 Takte Pause).
 */
export function multiRestCells(measures: number): Cell[] {
  if (measures <= 3) return Array.from({ length: measures }, () => REST_CELLS.ganze);
  return [NUMBER_SIGN, ...upperDigitCells(measures), REST_CELLS.ganze];
}

/** Note → Zelle (Tonhöhe + Wert). */
export function noteCell(tone: ToneName, value: NoteValue): Cell {
  return dots(...TONE_DOTS[tone], ...VALUE_DOTS[value]);
}

// --- Ausdruckszeichen Stufe 3 (Welt 4 „Ausdruck" + Welt 5 „Formenbau") --------
// Doppelt verifiziert (Krolick × music21 × braille.ch), §3 der Vollausbau-
// Übergabe. Die Positionsregeln stehen im Kommentar; GESETZT werden die Zeichen
// von den Generatoren in etappen.ts (Bogen-Verdopplung endet an der VORLETZTEN
// Note; Fermate NACH der Note, nie verdoppeln; übrige Artikulation VOR der Note).

/** Bindebogen (Legato) ⠉ — Punkte 1, 4; steht NACH jeder Note außer der letzten.
 *  Über 4 Noten: doppelt nach der ERSTEN, einfach nach der VORLETZTEN (§6-3a). */
export const SLUR_CELL: Cell = dots(1, 4);
/** Phrasenbogen in Klammerform (nur erkennen): auf 56-12, zu 45-23 (§6-3b). */
export const SLUR_BRACKET_OPEN: Cell[] = [dots(5, 6), dots(1, 2)];
export const SLUR_BRACKET_CLOSE: Cell[] = [dots(4, 5), dots(2, 3)];

/** Artikulation (§10) — VOR der Note (nur die Fermate steht danach). */
export const ARTIC_CELLS: Record<
  "staccato" | "staccatissimo" | "portato" | "tenuto" | "akzent" | "marcato",
  Cell[]
> = {
  staccato: [dots(2, 3, 6)],
  staccatissimo: [dots(6), dots(2, 3, 6)],
  portato: [dots(5), dots(2, 3, 6)],
  tenuto: [dots(4, 5, 6), dots(2, 3, 6)],
  akzent: [dots(4, 6), dots(2, 3, 6)],
  marcato: [dots(5, 6), dots(2, 3, 6)],
};
export type ArticSign = keyof typeof ARTIC_CELLS;
/** Fermate ⠣⠇ — NACH der Note, wird NIE verdoppelt (§10-13). */
export const FERMATE_CELLS: Cell[] = [dots(1, 2, 6), dots(1, 2, 3)];

export const ARTIC_LABELS: Record<ArticSign, string> = lebendig(
  ["staccato", "staccatissimo", "portato", "tenuto", "akzent", "marcato"] as const,
  (k) => klangTexte().musik.artikulation[k],
);

/** Dynamik-Wortzeichen ⠜ — Punkte 3, 4, 5; steht vor jedem Vortragswort (§10-2). */
export const DYNAMIC_WORD_SIGN: Cell = dots(3, 4, 5);
const DYN_LETTER: Record<"p" | "f" | "m", Cell> = {
  p: dots(1, 2, 3, 4),
  f: dots(1, 2, 4),
  m: dots(1, 3, 4),
};
/** Dynamik-Kürzel (Wortzeichen + Literarbuchstaben), z. B. mf = 345-134-124. */
export const DYNAMIC_CELLS: Record<"p" | "f" | "mf" | "pp" | "ff", Cell[]> = {
  p: [DYNAMIC_WORD_SIGN, DYN_LETTER.p],
  f: [DYNAMIC_WORD_SIGN, DYN_LETTER.f],
  mf: [DYNAMIC_WORD_SIGN, DYN_LETTER.m, DYN_LETTER.f],
  pp: [DYNAMIC_WORD_SIGN, DYN_LETTER.p, DYN_LETTER.p],
  ff: [DYNAMIC_WORD_SIGN, DYN_LETTER.f, DYN_LETTER.f],
};
export const DYNAMIC_LABELS: Record<"p" | "f" | "mf" | "pp" | "ff", string> = lebendig(
  ["p", "f", "mf", "pp", "ff"] as const,
  (k) => klangTexte().musik.dynamik[k],
);

/** Crescendo-/Decrescendo-Gabeln (§10-5/6): Beginn VOR, Ende NACH der Note. */
export const CRESC_HAIRPIN_START: Cell[] = [DYNAMIC_WORD_SIGN, dots(1, 4)]; // 345-14
export const CRESC_HAIRPIN_END: Cell[] = [DYNAMIC_WORD_SIGN, dots(2, 5)]; // 345-25
export const DECR_HAIRPIN_START: Cell[] = [DYNAMIC_WORD_SIGN, dots(1, 4, 5)]; // 345-145
export const DECR_HAIRPIN_END: Cell[] = [DYNAMIC_WORD_SIGN, dots(2, 5, 6)]; // 345-256

/** Metronom-Gleichzeichen (Punkte 2,3,5,6) im Metronom-Kontext (§14-17). */
export const METRONOME_EQUALS: Cell = dots(2, 3, 5, 6);
/** Metronomangabe „Viertel = bpm": Viertelnote, =, Zahlzeichen, obere Ziffern. */
export function metronomeCells(bpm: number): Cell[] {
  return [noteCell("c", "viertel"), METRONOME_EQUALS, NUMBER_SIGN, ...upperDigitCells(bpm)];
}

/** Verzierungen (§11) — VOR der Note; Tremolo NACH/ZWISCHEN (§7). */
export const ORNAMENT_CELLS: Record<
  | "vorschlag"
  | "vorschlag-lang"
  | "triller"
  | "doppelschlag"
  | "doppelschlag-ueber"
  | "pralltriller"
  | "pralltriller-lang"
  | "mordent"
  | "mordent-lang",
  Cell[]
> = {
  vorschlag: [dots(2, 6)],
  "vorschlag-lang": [dots(5), dots(2, 6)],
  triller: [dots(2, 3, 5)],
  doppelschlag: [dots(2, 5, 6)],
  "doppelschlag-ueber": [dots(6), dots(2, 5, 6)],
  pralltriller: [dots(5), dots(2, 3, 5)],
  "pralltriller-lang": [dots(5, 6), dots(2, 3, 5)],
  mordent: [dots(5), dots(2, 3, 5), dots(1, 2, 3)],
  "mordent-lang": [dots(5, 6), dots(2, 3, 5), dots(1, 2, 3)],
};
export type OrnamentSign = keyof typeof ORNAMENT_CELLS;
export const ORNAMENT_LABELS: Record<OrnamentSign, string> = lebendig(
  [
    "vorschlag", "vorschlag-lang", "triller", "doppelschlag", "doppelschlag-ueber",
    "pralltriller", "pralltriller-lang", "mordent", "mordent-lang",
  ] as const,
  (k) => klangTexte().musik.verzierung[k],
);

/** Tremolo-Repetition (NACH der Note): 8tel 45-12, 16tel 45-123, 32stel 45-2. */
export const TREMOLO_REP: Record<"rep8" | "rep16" | "rep32", Cell[]> = {
  rep8: [dots(4, 5), dots(1, 2)],
  rep16: [dots(4, 5), dots(1, 2, 3)],
  rep32: [dots(4, 5), dots(2)],
};
/** Tremolo-Brechung (ZWISCHEN Noten, nie verdoppeln): 46-12 / 46-123 / 46-2. */
export const TREMOLO_ALT: Record<"alt8" | "alt16" | "alt32", Cell[]> = {
  alt8: [dots(4, 6), dots(1, 2)],
  alt16: [dots(4, 6), dots(1, 2, 3)],
  alt32: [dots(4, 6), dots(2)],
};

/** Volta (Haus 1/2) — Zahlzeichen 3456 + UNTERE Ziffer (§9-6/8). */
export function voltaCells(n: 1 | 2): Cell[] {
  return [NUMBER_SIGN, LOWER_DIGIT[n]];
}
/** Druck-Segno ⠬ (346) / Coda 346-123 (§9-9) — je mit Leerfeld drumrum. */
export const SEGNO_CELL: Cell = dots(3, 4, 6);
export const CODA_CELLS: Cell[] = [dots(3, 4, 6), dots(1, 2, 3)];
/** Braille-Segno 346-1, Ende 16 (Kür, §9-47/49). */
export const BRAILLE_SEGNO: Cell[] = [dots(3, 4, 6), dots(1)];
export const BRAILLE_END: Cell = dots(1, 6);
/** Zähl-Wiederholung „×N": Simile 2356, Zahlzeichen 3456, obere Ziffer (§9-36). */
export function countRepeatCells(n: number): Cell[] {
  return [SIMILE_CELL, NUMBER_SIGN, ...upperDigitCells(n)];
}

// --- Mehrstimmigkeit (Welt 6 „Zusammenklang", §3-F, Stufe 4) -------------------
// Doppelt verifiziert (Krolick Kap. V, Tab. 5A × music21). Intervallzeichen
// stehen NACH der geschriebenen Note; die Leserichtung folgt dem „Kölner
// Schlüssel" (Krolick §5-1): Oberstimme = OBERSTE Note notiert, Intervalle
// ABWÄRTS gezählt.

/** Intervallzeichen 2.–8. (Sekunde … Oktave), Tab. 5A. */
export const INTERVAL_CELLS: Record<2 | 3 | 4 | 5 | 6 | 7 | 8, Cell> = {
  2: dots(3, 4), // Sekunde
  3: dots(3, 4, 6), // Terz
  4: dots(3, 4, 5, 6), // Quarte
  5: dots(3, 5), // Quinte
  6: dots(3, 5, 6), // Sexte
  7: dots(2, 5), // Septime
  8: dots(3, 6), // Oktave
};
export type IntervalNumber = keyof typeof INTERVAL_CELLS;
export const INTERVAL_LABELS: Record<IntervalNumber, string> = lebendig(
  [2, 3, 4, 5, 6, 7, 8] as const,
  (k) => klangTexte().musik.intervall[k],
);

/** Ganztakt-In-Accord ⠣⠜ (126-345): trennt zwei Stimmen im selben Takt (§5-11).
 *  Nach dem Zeichen beginnt die zweite Stimme wieder mit Oktavzeichen (§5-12). */
export const IN_ACCORD_CELLS: Cell[] = [dots(1, 2, 6), dots(3, 4, 5)];
/** Teiltakt-In-Accord 5-2 (§5-17) / Taktteilung 46-13 (§5-18) — Kür. */
export const PART_IN_ACCORD_CELLS: Cell[] = [dots(5), dots(2)];
export const MEASURE_DIVISION_CELLS: Cell[] = [dots(4, 6), dots(1, 3)];
/** Moving notes: ein weiteres Intervall 6, mehrere 56 (§5-23/25) — Kür. */
export const MOVING_NOTE_CELL: Cell = dots(6);
export const MOVING_NOTES_CELL: Cell = dots(5, 6);

// --- Instrumentenkunde (Welt 8, §3-G/H/I/J, Stufe 5) ---------------------------
// Doppelt verifiziert (Krolick Kap. VIII/XV/XVI/XVII/XII/XIV, Tab. 15A/17A-C
// × music21 × braille.ch), §3 der Vollausbau-Übergabe. Positionsregeln im
// Kommentar; GESETZT werden die Zeichen von den Generatoren in etappen.ts.

/** Fingersatz 1.–5. Finger (Tab. 15) — steht NACH der Note (vor einem Haltebogen). */
export const FINGER_CELLS: Record<1 | 2 | 3 | 4 | 5, Cell> = {
  1: dots(1),
  2: dots(1, 2),
  3: dots(1, 2, 3),
  4: dots(2),
  5: dots(1, 3),
};
export const FINGER_LABELS: Record<1 | 2 | 3 | 4 | 5, string> = lebendig(
  [1, 2, 3, 4, 5] as const,
  (k) => klangTexte().musik.finger[k],
);

/** Hand-Zeichen (Tab. 15A): rechte Hand 46-345, linke Hand 456-345. Punkt 3
 *  danach bei Folgezeichen mit Punkt 1/2/3; die Folgenote braucht ein Oktavzeichen. */
export const HAND_CELLS: Record<"r" | "l", Cell[]> = {
  r: [dots(4, 6), dots(3, 4, 5)],
  l: [dots(4, 5, 6), dots(3, 4, 5)],
};
export const HAND_LABELS: Record<"r" | "l", string> = lebendig(
  ["r", "l"] as const,
  (k) => klangTexte().musik.hand[k],
);

/** Klavierpedal (§15-17/18): nieder 126-14 (VOR der Note), auf 16-14 (NACH der Note). */
export const PEDAL_DOWN_CELLS: Cell[] = [dots(1, 2, 6), dots(1, 4)];
export const PEDAL_UP_CELLS: Cell[] = [dots(1, 6), dots(1, 4)];

/** Gesang (Kap. XVI): Silben-Bindebogen = 14 (wie SLUR_CELL). */
export const SYLLABLE_SLUR_CELL: Cell = dots(1, 4);
/** Atemzeichen halb 345-2, voll 6-34 (§16-11). */
export const BREATH_HALF_CELLS: Cell[] = [dots(3, 4, 5), dots(2)];
export const BREATH_FULL_CELLS: Cell[] = [dots(6), dots(3, 4)];
/** 2 / 3 Silben auf einer Note (§16-8): 12 / 123, nach der Note. */
export const SYLLABLES_2_CELL: Cell = dots(1, 2);
export const SYLLABLES_3_CELL: Cell = dots(1, 2, 3);
/** Zeilen-Präfixe (§16-2…4): Textzeile 56-23, Musikzeile 6-3. */
export const LYRIC_LINE_PREFIX: Cell[] = [dots(5, 6), dots(2, 3)];
export const MUSIC_LINE_PREFIX: Cell[] = [dots(6), dots(3)];

/** Gitarre (Tab. 17A): Saiten 1–7 = Saitenzeichen 146 + eine der sieben Ziffern.
 *  Vor der Note; danach KEIN Oktavzeichen. */
export const STRING_SIGN: Cell = dots(1, 4, 6);
const STRING_DIGIT: Cell[] = [
  dots(1), // 1. Saite
  dots(1, 2), // 2.
  dots(1, 2, 3), // 3.
  dots(2), // 4.
  dots(1, 3), // 5.
  dots(2, 3), // 6.
  dots(3), // 7.
];
export function stringCells(n: number): Cell[] {
  return [STRING_SIGN, STRING_DIGIT[n - 1]];
}
/**
 * Lage/Bund 2.–6. und 8. (Tab. 17B): Lagenzeichen 345 + Intervallzeichen der
 * Zahl; die Folgenote bekommt MIT Oktavzeichen. Die 7. Lage ist der Sonderfall
 * 6-345-25 (Extra-Punkt 6, weil 345-25 sonst die Crescendo-Gabel-Ende wäre).
 */
export const POSITION_SIGN: Cell = dots(3, 4, 5);
export function fretCells(n: IntervalNumber | 7): Cell[] {
  if (n === 7) return [dots(6), POSITION_SIGN, INTERVAL_CELLS[7]];
  return [POSITION_SIGN, INTERVAL_CELLS[n]];
}
/** Barré voll 456 / halb 45 (Tab. 17C) — vor dem Bundzeichen. */
export const BARRE_FULL_CELL: Cell = dots(4, 5, 6);
export const BARRE_HALF_CELL: Cell = dots(4, 5);
/** Internationale Akkordsymbol-Zeichen (Tab. 12A): Kreis (dim) 256, halb-
 *  vermindert 256-3, Dreieck (maj7) 356, kursive 7 (Dominantsept) 46-3456-1245.
 *  Groß-/Kleinschreib-Zeichen für „C7"/„Am" sind national verschieden (§12-3). */
export const CHORD_SYMBOL_CELLS: Record<"dim" | "halbdim" | "maj7" | "sept", Cell[]> = {
  dim: [dots(2, 5, 6)],
  halbdim: [dots(2, 5, 6), dots(3)],
  maj7: [dots(3, 5, 6)],
  sept: [dots(4, 6), dots(3, 4, 5, 6), dots(1, 2, 4, 5)],
};
export const CHORD_SYMBOL_LABELS: Record<"dim" | "halbdim" | "maj7" | "sept", string> = lebendig(
  ["dim", "halbdim", "maj7", "sept"] as const,
  (k) => klangTexte().musik.akkord[k],
);

/** Generalbass (§12-15…27): Part-Präfix 56-345; Ziffern = Zahlzeichen 3456
 *  (= NUMBER_SIGN) + UNTERE Ziffern; die unterste Druck-Ziffer steht zuerst. */
export const FIGURED_BASS_PREFIX: Cell[] = [dots(5, 6), dots(3, 4, 5)];
/** Untere-Ziffern-Zellen einer Zahl (Takt-Nenner, Generalbass). */
export function lowerDigitCells(n: number): Cell[] {
  return String(n)
    .split("")
    .map((ch) => LOWER_DIGIT[Number(ch)]);
}
/** Bezifferung (unterste Druck-Ziffer zuerst übergeben): Zahlzeichen + untere Ziffern. */
export function figuredBassCells(digitsBottomFirst: number[]): Cell[] {
  return [NUMBER_SIGN, ...digitsBottomFirst.map((d) => LOWER_DIGIT[d])];
}

/** Taktzahl als Marginalzahl (§14-10…13): NUR obere Ziffern, OHNE Zahlzeichen.
 *  Der Auftakt zählt als Takt 0. */
export function measureNumberCells(n: number): Cell[] {
  return upperDigitCells(n);
}

/**
 * Die Note, die `number` diatonische Intervall-Stufen UNTER `top` liegt
 * (Diskant-Leserichtung: Terz unter g = e, Quinte unter g = c). Versetzungs-
 * zeichen der Oberstimme werden nicht übernommen (Zweiklang-Grundform).
 */
export function intervalBelow(top: MusicNote, number: IntervalNumber): MusicNote {
  const idx = diatonicIndex(top.tone, top.octave) - (number - 1);
  const octave = Math.floor(idx / 7);
  const tone = TONES[((idx % 7) + 7) % 7];
  return { kind: "note", tone, octave, value: top.value };
}

// --- Verzierungs-Klang (reine Funktion; die Melodie selbst bleibt einfach) -----

/** Nachbarton eine diatonische Stufe höher (dir 1) / tiefer (−1). */
export function neighborNote(n: MusicNote, dir: 1 | -1): MusicNote {
  let idx = TONES.indexOf(n.tone) + dir;
  let octave = n.octave;
  if (idx > 6) {
    idx = 0;
    octave += 1;
  } else if (idx < 0) {
    idx = 6;
    octave -= 1;
  }
  return { kind: "note", tone: TONES[idx], octave, value: n.value };
}

/** Eine verzierte Note in ihre klingenden Einzeltöne auflösen (Stufe 3, §4.7). */
export function ornamentToEvents(n: MusicNote, orn: OrnamentSign): MusicNote[] {
  const s = (m: MusicNote): MusicNote => ({ kind: "note", tone: m.tone, octave: m.octave, value: "sechzehntel" });
  const up = neighborNote(n, 1);
  const down = neighborNote(n, -1);
  const main: MusicNote = { kind: "note", tone: n.tone, octave: n.octave, value: n.value };
  switch (orn) {
    case "vorschlag":
      return [s(up), main];
    case "vorschlag-lang":
      return [{ kind: "note", tone: up.tone, octave: up.octave, value: "achtel" }, main];
    case "triller":
      return [s(n), s(up), s(n), s(up), s(n), s(up)];
    case "doppelschlag":
    case "doppelschlag-ueber":
      return [s(up), s(n), s(down), main];
    case "pralltriller":
    case "pralltriller-lang":
      return [s(n), s(up), main];
    case "mordent":
    case "mordent-lang":
      return [s(n), s(down), main];
  }
}

// --- Rhythmussprache (Kodály-Option, Stufe 3 — §4.6) ---------------------------

/** Silbe je Notenwert (Kodály, auf do=c-Programm übertragen). */
export const RHYTHM_SYLLABLE: Record<NoteValue, string> = lebendig(
  ["ganze", "halbe", "viertel", "achtel", "sechzehntel"] as const,
  (k) => klangTexte().musik.rhythmus[k],
);

/** Silbe eines EINZELNEN Werts (für „Viertelnote — ta"). */
export function rhythmSyllable(value: NoteValue, dotted?: boolean): string {
  return dotted ? `${RHYTHM_SYLLABLE[value]}${klangTexte().musik.rhythmus.punktiertSuffix}` : RHYTHM_SYLLABLE[value];
}

/**
 * Silbenkette einer Ereignisfolge: Achtelpaare werden zu „ti-ti", Sechzehntel-
 * Vierergruppen zu „tika-tika" zusammengezogen, Pausen zu „sch" (reine Funktion,
 * per Test gepinnt). Taktstriche werden übersprungen.
 */
export function rhythmSyllables(events: readonly MusicEvent[]): string {
  const seq = events.filter((e) => e.kind !== "bar") as (MusicNote | MusicRest)[];
  const out: string[] = [];
  let i = 0;
  while (i < seq.length) {
    const ev = seq[i];
    if (ev.kind === "rest") {
      out.push(klangTexte().musik.pausenSilbe);
      i += 1;
      continue;
    }
    if (ev.value === "achtel" && !ev.dotted) {
      const nxt = seq[i + 1];
      if (nxt && nxt.kind === "note" && nxt.value === "achtel" && !nxt.dotted) {
        out.push(klangTexte().musik.rhythmus.achtelPaar);
        i += 2;
        continue;
      }
    }
    if (ev.value === "sechzehntel") {
      const four =
        seq[i + 1]?.value === "sechzehntel" &&
        seq[i + 2]?.value === "sechzehntel" &&
        seq[i + 3]?.value === "sechzehntel";
      if (four) {
        out.push(klangTexte().musik.rhythmus.sechzehntelVier);
        i += 4;
        continue;
      }
    }
    out.push(rhythmSyllable(ev.value, ev.dotted));
    i += 1;
  }
  return out.join(" ");
}

// --- Nachspiel-Klaviatur (play-Engine, Stufe 3 — §4.1) -------------------------

/** Weiße Tasten D F G H J K L = c d e f g a h (bewusst NICHT die Braille-
 *  Akkordtasten — anderes Mindset: Instrument, nicht Schrift). Pfeil rauf/runter
 *  wechselt die Oktave. Start = eingestrichen (Oktave 4). */
export const PLAY_KEY_TO_TONE: Record<string, ToneName> = {
  KeyD: "c",
  KeyF: "d",
  KeyG: "e",
  KeyH: "f",
  KeyJ: "g",
  KeyK: "a",
  KeyL: "h",
};
/** Reihenfolge + Beschriftung der Nachspiel-Klaviatur (für die Tasten-Anzeige). */
export const PLAY_KEYS: { code: string; label: string; tone: ToneName }[] = [
  { code: "KeyD", label: "D", tone: "c" },
  { code: "KeyF", label: "F", tone: "d" },
  { code: "KeyG", label: "G", tone: "e" },
  { code: "KeyH", label: "H", tone: "f" },
  { code: "KeyJ", label: "J", tone: "g" },
  { code: "KeyK", label: "K", tone: "a" },
  { code: "KeyL", label: "L", tone: "h" },
];

/** Taktangabe → Zellen (Zahlzeichen + Oberzahl(en) + Unterzahl). */
export function timeSigCells(sig: [number, number]): Cell[] {
  const [top, bottom] = sig;
  const tops = String(top).split("").map((ch) => UPPER_DIGIT[Number(ch)]);
  return [NUMBER_SIGN, ...tops, LOWER_DIGIT[bottom % 10]];
}

// --- Oktavzeichen-Regeln (Krolick Par. 1-10) ----------------------------------

/** Diatonischer Index (c1 = 7) — für Intervall- und Staff-Rechnung. */
export function diatonicIndex(tone: ToneName, octave: number): number {
  return octave * 7 + TONES.indexOf(tone);
}

/**
 * Braucht `cur` nach `prev` ein Oktavzeichen?
 *  - erste Note (prev = null): immer;
 *  - Sekunde/Terz (auch Prim): nie, selbst bei Oktavwechsel;
 *  - Quarte/Quinte: nur bei Oktavwechsel;
 *  - Sexte und größer: immer.
 * (Versetzungszeichen ändern die Regel nicht — sie zählt diatonisch.)
 */
export function needsOctaveSign(prev: MusicNote | null, cur: MusicNote): boolean {
  if (!prev) return true;
  const diff = Math.abs(
    diatonicIndex(cur.tone, cur.octave) - diatonicIndex(prev.tone, prev.octave),
  );
  if (diff <= 2) return false; // Prim/Sekunde/Terz
  if (diff <= 4) return prev.octave !== cur.octave; // Quarte/Quinte
  return true; // Sexte+
}

// --- Transkription Melodie → Zellen -------------------------------------------

/** Zellen EINES Events samt Aufschlüsselung (fürs Hervorheben/Erklären). */
export interface EventCells {
  event: MusicEvent;
  /** Alle Zellen des Events in Schreibreihenfolge. */
  cells: Cell[];
  /** Index der eigentlichen Noten-/Pausenzelle innerhalb `cells`. */
  coreIndex: number;
  /** Hat das Event ein Oktavzeichen bekommen? */
  octaveSign: boolean;
}

export interface TranscribeOpts {
  /** Oktavzeichen setzen (Standard an). Aus = für die frühen Etappen, in denen
   *  die Kinder die Oktavzeichen noch nicht kennen (kp3–kp9). */
  octaveSigns?: boolean;
}

/**
 * Melodie → Zellen je Event, mit Oktavzeichen nach Regelwerk. Vorangestellt
 * wird (wenn vorhanden) die Taktangabe; nach ihr gilt die Folgenote wieder
 * als „erste" (Oktavzeichen-Pflicht, Krolick Par. 3-7). Taktstrich = BLANK.
 */
export function transcribe(
  melody: Melody,
  opts: TranscribeOpts = {},
): { prefix: Cell[]; events: EventCells[] } {
  const withOctaves = opts.octaveSigns !== false;
  const prefix = melody.timeSig ? timeSigCells(melody.timeSig) : [];
  const events: EventCells[] = [];
  let prev: MusicNote | null = null;
  for (const ev of melody.events) {
    if (ev.kind === "bar") {
      events.push({ event: ev, cells: [BLANK], coreIndex: 0, octaveSign: false });
      continue; // normaler Taktstrich unterbricht die Oktav-Kette NICHT
    }
    if (ev.kind === "rest") {
      const cells = [REST_CELLS[ev.value], ...(ev.dotted ? [DOT3_CELL] : [])];
      events.push({ event: ev, cells, coreIndex: 0, octaveSign: false });
      continue; // Pausen unterbrechen die Oktav-Kette nicht (Regel zählt Noten)
    }
    const oct = withOctaves && needsOctaveSign(prev, ev);
    const cells: Cell[] = [];
    if (ev.accidental) cells.push(ACCIDENTAL_CELLS[ev.accidental]);
    if (oct) cells.push(OCTAVE_CELLS[ev.octave]);
    const coreIndex = cells.length;
    cells.push(noteCell(ev.tone, ev.value));
    if (ev.dotted) cells.push(DOT3_CELL);
    // Haltebogen: die zwei Bogen-Zellen stehen NACH der Note (und nach dem
    // Verlängerungspunkt), Krolick Kap. VI.
    if (ev.tie) cells.push(...TIE_CELLS);
    events.push({ event: ev, cells, coreIndex, octaveSign: oct });
    prev = ev;
  }
  return { prefix, events };
}

/** Nur die flache Zellenfolge (Live-Region/Braillezeile). */
export function transcribeFlat(melody: Melody, opts: TranscribeOpts = {}): Cell[] {
  const t = transcribe(melody, opts);
  return [...t.prefix, ...(t.prefix.length ? [BLANK] : []), ...t.events.flatMap((e) => e.cells)];
}

// --- Namen + Ansagen -----------------------------------------------------------
//
// ★ Sprachen (Schritt 2, Klangpunkte): Die WORTE kommen aus `tonnamen.ts` (Töne,
//   Vorzeichen, Notenwerte, Pausen) und `texte/<sprache>/musik.ts` (Beschriftung
//   der Zeichen). Die Tabellen unten sind LEBENDIG: jeder Eintrag liest die
//   Sprache erst beim Zugriff (`klangSprache()`), darum ändert sich in Deutsch
//   nichts und `VALUE_LABELS[v]` bleibt überall so benutzbar wie bisher.

export type NameStyle = "buchstaben" | "solmisation";

/** Die Tonnamen der aktuellen Sprache (fehlt eine, gelten die englischen). */
function tonnamen(): Tonnamen {
  return (TONNAMEN as Partial<Record<string, Tonnamen>>)[klangSprache()] ?? TONNAMEN.en;
}

/** Eine Tabelle, deren Einträge erst beim Lesen aus der aktuellen Sprache geholt werden. */
function lebendig<K extends string | number, V>(keys: readonly K[], holen: (k: K) => V): Record<K, V> {
  const o = {} as Record<K, V>;
  for (const k of keys) Object.defineProperty(o, k, { enumerable: true, get: () => holen(k) });
  return o;
}

/** Feste Solmisation (c = do) - beweglich wäre mit dem absoluten
 *  Braille-Zeichensystem unvereinbar (die Zeichen kodieren Stammtöne). Die
 *  Namen je Sprache stehen in `tonnamen.ts`. */
export function toneName(tone: ToneName, style: NameStyle): string {
  const t = tonnamen();
  return style === "solmisation" ? t.solmisation[tone] : t.buchstaben[tone];
}

/** Die Schreibweise, mit der Kinder der aktuellen Sprache zuerst beginnen. */
export function standardNameStyle(): NameStyle {
  return tonnamen().standardStil;
}

export const VALUE_LABELS: Record<NoteValue, string> = lebendig(
  ["ganze", "halbe", "viertel", "achtel", "sechzehntel"] as const,
  (v) => tonnamen().noten[v],
);

/**
 * Zähl-Einheit des Takt-Baumeisters, kindgerecht: Achteltakte (…/8) zählen in
 * Achteln (6/8 = „6 Achtel-Schläge", ohne Brüche), alle anderen in Vierteln.
 * `factor` rechnet Viertel-Beats in die Zähl-Einheit um.
 */
export function beatUnitFor(sig: [number, number]): {
  factor: number;
  one: string;
  many: string;
} {
  const e = klangTexte().musik.schlagEinheit;
  return sig[1] === 8 ? { factor: 2, ...e.achtel } : { factor: 1, ...e.sonst };
}

/**
 * Schlagzahl als gesprochener Text - nie „0.5" mit englischem Punkt in der
 * deutschen Ansage: Deutsch: ganze Zahlen pur, x,5 als „ein halber/anderthalb/
 * zweieinhalb ...", andere Brüche mit Dezimal-KOMMA. Je Sprache in
 * `texte/<sprache>/musik.ts`.
 */
export function beatsText(n: number): string {
  return klangTexte().musik.schlaege(n);
}

export const REST_LABELS: Record<NoteValue, string> = lebendig(
  ["ganze", "halbe", "viertel", "achtel", "sechzehntel"] as const,
  (v) => tonnamen().pausen[v],
);

export const ACCIDENTAL_LABELS: Record<Accidental, string> = lebendig(
  ["kreuz", "be", "aufloesung"] as const,
  (a) => tonnamen().vorzeichen[a],
);

/** Oktav-Sprechnamen (je Sprache; Deutsch: die deutsche Benennung). */
export const OCTAVE_LABELS: Record<number, string> = lebendig(
  [1, 2, 3, 4, 5, 6, 7] as const,
  (o) => klangTexte().musik.oktaven[o],
);

/** Sprechbarer Name eines Events, z. B. „g, Viertelnote" / „sol, Viertelnote".
 *  Mit rhythm=true wird die Rhythmus-Silbe hinter den Wertnamen gehängt
 *  („g, Viertelnote — ta"), sonst bleibt die Ansage unverändert (§4.6). */
export function eventLabel(ev: MusicEvent, style: NameStyle, rhythm = false): string {
  const m = klangTexte().musik;
  if (ev.kind === "bar") return m.taktstrich;
  if (ev.kind === "rest")
    return (
      REST_LABELS[ev.value] +
      (ev.dotted ? `, ${m.punktiert}` : "") +
      (rhythm ? ` — ${m.pausenSilbe}` : "")
    );
  const syl = rhythm ? ` — ${rhythmSyllable(ev.value, ev.dotted)}` : "";
  const ton = ev.accidental
    ? m.tonMitVorzeichen(ACCIDENTAL_LABELS[ev.accidental], toneName(ev.tone, style))
    : toneName(ev.tone, style);
  return `${ton}, ${VALUE_LABELS[ev.value]}${ev.dotted ? `, ${m.punktiert}` : ""}${ev.tie ? `, ${m.mitHaltebogen}` : ""}${syl}`;
}

// --- Takt-Baumeister / Komponier-Werkstatt: Zellen zurücklesen (Stufe 4) -------
// Eine eingegebene Zelle in ihren Noten-/Pausenwert zurückübersetzen — mit der
// echten Braille-Leselogik aus kp12: eine Zelle mit den unteren Punkten 3+6 ist
// mehrdeutig (ganze ODER Sechzehntel). Sie wird als GROSSER Wert gelesen, solange
// er in den Rest des Takts passt, sonst als kleiner (§4.4).

export interface CellReading {
  kind: "note" | "rest";
  value: NoteValue;
  tone?: ToneName;
  /** Dauer in Schlägen (nach der Leseregel). */
  beats: number;
  /** War die Zelle mehrdeutig (untere Punkte 3+6)? */
  ambiguous: boolean;
}

/** Grundwert (ohne Mehrdeutigkeits-Auflösung) aus den unteren Punkten 3/6. */
function valueFromLower(has3: boolean, has6: boolean): NoteValue {
  if (has3 && has6) return "ganze"; // = sechzehntel (mehrdeutig)
  if (has3) return "halbe";
  if (has6) return "viertel";
  return "achtel";
}

/**
 * Eine Zelle als Note oder Pause zurücklesen (null = keine gültige Grund-Noten-/
 * Pausenzelle). `remainingBeats` steuert die Auflösung der 3+6-Mehrdeutigkeit.
 */
export function readCell(cell: Cell, remainingBeats: number): CellReading | null {
  // Pausen zuerst (fester Zeichensatz). Ganze/Sechzehntel teilen sich 134.
  if (cell === REST_CELLS.halbe) return { kind: "rest", value: "halbe", beats: 2, ambiguous: false };
  if (cell === REST_CELLS.viertel) return { kind: "rest", value: "viertel", beats: 1, ambiguous: false };
  if (cell === REST_CELLS.achtel) return { kind: "rest", value: "achtel", beats: 0.5, ambiguous: false };
  if (cell === REST_CELLS.ganze) {
    const big = 4 <= remainingBeats + 1e-9;
    return { kind: "rest", value: big ? "ganze" : "sechzehntel", beats: big ? 4 : 0.25, ambiguous: true };
  }
  // Note: obere Punkte 1/2/4/5 = Tonhöhe, untere 3/6 = Wert.
  const upper = cell & (dotBit(1) | dotBit(2) | dotBit(4) | dotBit(5));
  let tone: ToneName | undefined;
  for (const t of TONES) if (noteCell(t, "achtel") === upper) tone = t;
  if (!tone) return null;
  const has3 = (cell & dotBit(3)) !== 0;
  const has6 = (cell & dotBit(6)) !== 0;
  const base = valueFromLower(has3, has6);
  if (base === "ganze") {
    const big = 4 <= remainingBeats + 1e-9;
    return { kind: "note", tone, value: big ? "ganze" : "sechzehntel", beats: big ? 4 : 0.25, ambiguous: true };
  }
  return { kind: "note", tone, value: base, beats: beats(note(tone, 4, base)), ambiguous: false };
}

/**
 * Eingegebene Zellen (Baumeister/Komponier) in klingende Events übersetzen:
 * BLANK = Taktstrich, Versetzungszeichen an die nächste Note, sonst readCell
 * (Grund-Note mit fester Oktave 4). Ungültige Zellen werden übersprungen.
 * Die 3+6-Mehrdeutigkeit wird pro Takt aufgelöst (Rest des laufenden Takts).
 */
export function readSequence(cells: Cell[], timeSig?: [number, number]): MusicEvent[] {
  const cap = timeSig ? timeSig[0] * (4 / timeSig[1]) : Infinity;
  const out: MusicEvent[] = [];
  let barBeats = 0;
  let pendingAcc: Accidental | undefined;
  for (const c of cells) {
    if (c === BLANK) {
      out.push(bar);
      barBeats = 0;
      pendingAcc = undefined;
      continue;
    }
    const accEntry = (Object.entries(ACCIDENTAL_CELLS) as [Accidental, Cell][]).find(
      ([, v]) => v === c,
    );
    if (accEntry) {
      pendingAcc = accEntry[0];
      continue;
    }
    const r = readCell(c, cap - barBeats);
    if (!r) continue;
    if (r.kind === "rest") {
      out.push(rest(r.value));
    } else {
      out.push(note(r.tone!, 4, r.value, pendingAcc ? { accidental: pendingAcc } : {}));
      pendingAcc = undefined;
    }
    barBeats += r.beats;
    if (cap !== Infinity && barBeats >= cap - 1e-9) barBeats = 0;
  }
  return out;
}

// --- Klang (für audio.ts) -------------------------------------------------------

/** Halbtöne innerhalb der Oktave (c = 0). */
const SEMITONE: Record<ToneName, number> = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, h: 11 };

/** MIDI-Nummer (c4 = 60); Versetzungszeichen ±1. */
export function midi(n: MusicNote): number {
  const shift = n.accidental === "kreuz" ? 1 : n.accidental === "be" ? -1 : 0;
  return (n.octave + 1) * 12 + SEMITONE[n.tone] + shift;
}

export function frequency(n: MusicNote): number {
  return 440 * Math.pow(2, (midi(n) - 69) / 12);
}

/** Dauer in Schlägen (Viertel = 1). Triolen-Noten dauern 2/3 ihres Werts. */
export function beats(ev: MusicNote | MusicRest): number {
  const base = { ganze: 4, halbe: 2, viertel: 1, achtel: 0.5, sechzehntel: 0.25 }[ev.value];
  const dotted = ev.dotted ? base * 1.5 : base;
  return ev.kind === "note" && ev.tuplet === 3 ? (dotted * 2) / 3 : dotted;
}
