/**
 * „Klangpunkte" — Etappen + Aufgaben-Generatoren (reine Daten/Logik).
 *
 * Lernpfad = Konsens-Progression aus vier belegten Lehrgängen (siehe
 * KONZEPT-Notenschrift-Punktgenau-2026-07-02.md §3): De Garmo (Werte VOR
 * Vorzeichen VOR Oktavzeichen), Taesch (erst hören/klopfen, Audiation),
 * Krolick (Wertmehrdeutigkeit explizit), RNIB (Symbol→Klang, kurze Einheiten),
 * Workshop Schmid/Hofer BBI (Dekaden-Analogie, „Hänschen klein").
 *
 * Die Etappen sind normale `Etappe`-Objekte (Bereichs-UI, Gates, Zeichenliste
 * laufen unverändert); die AUFGABEN kommen aber nicht aus Wortpools, sondern
 * aus den Generatoren hier — der KlangpunkteRunner fragt `nextKlangTask()`.
 */
import { altAnzeige } from "../altTaste";
import { BLANK, type Cell } from "../braille/cell";
import type { Etappe } from "../braille/etappen";
import { MASTERY_ACC, MASTERY_MIN_ATTEMPTS } from "../braille/adaptive";
import {
  ACCIDENTAL_CELLS,
  ACCIDENTAL_LABELS,
  ALLA_BREVE_CELLS,
  ARTIC_CELLS,
  BARRE_FULL_CELL,
  BARRE_HALF_CELL,
  BREATH_FULL_CELLS,
  BREATH_HALF_CELLS,
  CHORD_SYMBOL_CELLS,
  CLEF_CELLS,
  CLEF_LABELS,
  CODA_CELLS,
  COMMON_TIME_CELLS,
  CRESC_HAIRPIN_END,
  CRESC_HAIRPIN_START,
  DECR_HAIRPIN_START,
  DOT3_CELL,
  DYNAMIC_CELLS,
  DYNAMIC_LABELS,
  FERMATE_CELLS,
  FIGURED_BASS_PREFIX,
  FINAL_BAR,
  FINGER_CELLS,
  FINGER_LABELS,
  HAND_CELLS,
  IN_ACCORD_CELLS,
  INTERVAL_CELLS,
  INTERVAL_LABELS,
  LYRIC_LINE_PREFIX,
  MEASURE_DIVISION_CELLS,
  MOVING_NOTE_CELL,
  MUSIC_HYPHEN_CELL,
  OCTAVE_CELLS,
  OCTAVE_LABELS,
  ORNAMENT_CELLS,
  ORNAMENT_LABELS,
  PART_IN_ACCORD_CELLS,
  PEDAL_DOWN_CELLS,
  PEDAL_UP_CELLS,
  SYLLABLE_SLUR_CELL,
  SYLLABLES_2_CELL,
  REPEAT_END,
  REPEAT_START,
  REST_CELLS,
  REST_LABELS,
  SEGNO_CELL,
  SIMILE_CELL,
  SLUR_BRACKET_OPEN,
  SLUR_CELL,
  TIE_CELLS,
  TONES,
  TREMOLO_ALT,
  TREMOLO_REP,
  TRIPLET_CELL,
  VALUE_LABELS,
  bar,
  beats,
  countRepeatCells,
  diatonicIndex,
  eventLabel,
  figuredBassCells,
  fretCells,
  keySignatureCells,
  measureNumberCells,
  metronomeCells,
  multiRestCells,
  intervalBelow,
  needsOctaveSign,
  note,
  noteCell,
  ornamentToEvents,
  rest,
  stringCells,
  timeSigCells,
  standardNameStyle,
  toneName,
  transcribe,
  transcribeFlat,
  voltaCells,
  type ClefName,
  type Melody,
  type IntervalNumber,
  type MusicEvent,
  type MusicNote,
  type NameStyle,
  type NoteValue,
  type OrnamentSign,
  type ToneName,
} from "./notation";
import {
  INSTRUMENT_LABELS,
  INSTRUMENTS,
  type Instrument,
} from "./audio";
import { aktuelleSongs } from "./songs";
import { klangTexte } from "./sprache";

// --- Aufgaben-Modell -----------------------------------------------------------

export interface ChoiceTask {
  kind: "choice";
  /** Stabiler Schlüssel für die Mastery-Statistik. */
  key: string;
  /** Sichtbarer + angesagter Aufgabentext. */
  prompt: string;
  /** Hörbar (Start + Wiederholen). */
  melody?: Melody;
  /** Sichtbare Notenzeile (null = bewusst keine — reine Hör-Aufgabe). */
  staff?: Melody | null;
  /** Zweite Notenzeile (linke Hand, Bassschlüssel): ist sie gesetzt, zeigt der
   *  Runner die zweizeilige Klavier-Ansicht (GrandStaff). `staff` = rechte Hand
   *  (Violin), `staff2` = linke Hand (Bass). Alt+Q schaltet den Hand-Fokus. */
  staff2?: Melody | null;
  /** Braille im Notenbild zeigen? (vor kp10: ohne Oktavzeichen erzeugt). */
  staffBraille?: boolean;
  /** Oktavzeichen im Notenbild-Braille (erst ab kp10). */
  octaveSigns?: boolean;
  /** Zusätzliche Braille-Zellen unterm Aufgabentext (z. B. kp12). */
  showCells?: Cell[];
  /** Erzwungenes Instrument für die Wiedergabe (kp-instrumente); sonst Einstellung. */
  instrument?: Instrument;
  /** Zweite Melodie, direkt nach der ersten gespielt (Vergleichs-Hören). */
  melody2?: Melody;
  /** Instrument der zweiten Melodie. */
  instrument2?: Instrument;
  /** Akkord (mehrere Töne GLEICHZEITIG, §4.7) — Intervalle/Dreiklänge. Wird
   *  STATT `melody` gespielt, wenn gesetzt; `chord2` folgt zum Vergleich. */
  chord?: MusicNote[];
  chord2?: MusicNote[];
  /** Viertel-Dauer in Sekunden (Tempo-Hörübungen, kp-tempo). */
  quarterSeconds?: number;
  choices: string[];
  correctIndex: number;
  /** Erklärung nach falscher Antwort (Live-Region + Vorlesen). */
  explain?: string;
}

export interface WriteTask {
  kind: "write";
  key: string;
  prompt: string;
  melody?: Melody;
  staff?: Melody | null;
  staffBraille?: boolean;
  /** Oktavzeichen im Notenbild-Braille (erst ab kp10). */
  octaveSigns?: boolean;
  /** Erwartete Zellenfolge; BLANK = Leertaste (Taktstrich). */
  cells: Cell[];
  /** Sprech-Label je erwarteter Zelle (für Fehler-Ansagen). */
  cellLabels: string[];
  /** Ton je Zelle (klingt bei richtiger Eingabe); null = kein Ton. */
  cellTones: (MusicNote | null)[];
  /** Diktat (§4.3): kein Notenbild, dafür ein prominenter „Nochmal anhören"-Knopf
   *  (unbegrenzt, ohne Malus) und leere Soll-Kästchen. */
  dictation?: boolean;
  explain?: string;
}

/**
 * Takt-Baumeister (build-Engine, §4.4): das Kind baut mit den Akkordtasten einen
 * Takt aus freien Noten-/Pausenzellen; Enter = „Takt fertig". Gültig, wenn die
 * Werte-Summe genau der Taktart entspricht (Mehrdeutigkeit nach kp12-Leselogik).
 */
export interface BuildTask {
  kind: "build";
  key: string;
  prompt: string;
  timeSig: [number, number];
  /** Zusatzbedingungen (im Fehlertext benannt). */
  constraints?: { minNotes?: number; mustInclude?: "dot" | "rest" };
  explain?: string;
}

/**
 * Komponier-Werkstatt (sandbox-Engine, §4.5): freies Schreiben beliebiger Länge,
 * Knöpfe Anhören · Löschen · Speichern; bis zu 5 Werke im Spielstand. Kein
 * Sterne-Gate — Häkchen ab dem ersten gespeicherten Werk (§12).
 */
export interface SandboxTask {
  kind: "sandbox";
  key: string;
  prompt: string;
  explain?: string;
}

export interface TapTask {
  kind: "tap";
  key: string;
  prompt: string;
  melody: Melody;
  /** Erwartetes Klopfmuster (kurz = Achtel, lang = Viertel/mehr). */
  pattern: ("kurz" | "lang")[];
  /** Puls-Modus (kp-puls): nicht das Muster, sondern die Gleichmäßigkeit zählt. */
  pulse?: boolean;
}

/**
 * Nachspiel-Aufgabe (play-Engine, Stufe 3): App spielt die Melodie vor, das Kind
 * spielt sie auf der Klaviatur (D F G H J K L) nach. Gewertet wird NUR die
 * Tonfolge (Tonhöhen in Reihenfolge), der Rhythmus ist frei. Im memory-Modus
 * wächst die Folge mit jeder geschafften Runde (Melodie-Memory, §12).
 */
export interface PlayTask {
  kind: "play";
  key: string;
  prompt: string;
  /** Soll-Tonfolge (im memory-Modus vom Runner selbst aufgebaut). */
  melody: Melody;
  /** Erzwungenes Instrument (sonst Einstellung). */
  instrument?: Instrument;
  /** Melodie-Memory: wächst mit jeder geschafften Runde. */
  memory?: boolean;
  /** Startlänge im memory-Modus. */
  startLen?: number;
  /** Tonvorrat im memory-Modus (Pentatonik). */
  pool?: ToneName[];
  /** Freies Spiel ohne Soll (Klang-Spielwiese §7.7): jeder Ton klingt, kein
   *  Fehler möglich; Häkchen ab `targetTaps` gespielten Tönen. */
  free?: boolean;
  /** Quint-Bordun (c+g) läuft im Hintergrund (Orff, §4.7). */
  bordun?: boolean;
  /** Ziel-Tonzahl im free-Modus (Häkchen). */
  targetTaps?: number;
  /** Lese-Konzert (§9.3): erst diese Braille-Zellen ZEIGEN (kein Vorspielen),
   *  das Kind liest sie, blendet sie mit „Fertig gelesen" aus und spielt dann
   *  AUS DEM GEDÄCHTNIS nach. Danach spielt die App die Soll-Fassung zur Kontrolle. */
  readFirst?: Cell[];
  explain?: string;
}

export type KlangTask =
  | ChoiceTask
  | WriteTask
  | TapTask
  | PlayTask
  | BuildTask
  | SandboxTask;

// --- kleine Zufalls-Helfer -------------------------------------------------------

const pick = <T,>(xs: readonly T[]): T => xs[Math.floor(Math.random() * xs.length)];
const shuffle = <T,>(xs: readonly T[]): T[] => {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/** Texte dieses Bereichs (Sprache wird erst beim Aufruf gelesen). */
const tA = () => klangTexte().aufgabenA;

/** Melodie ohne Taktstriche aus Noten bauen. */
const mel = (events: MusicEvent[], timeSig?: [number, number]): Melody =>
  timeSig ? { timeSig, events } : { events };

/** Ein Write-Task für EINE Zelle (Note in Grundform, ohne Oktavzeichen). */
function writeNoteTask(
  tone: ToneName,
  value: NoteValue,
  style: NameStyle,
  extraPrompt = "",
): WriteTask {
  const n = note(tone, 4, value);
  return {
    kind: "write",
    key: `w:${tone}:${value}`,
    prompt: `${tA().hilfe.schreibNote(toneName(tone, style), VALUE_LABELS[value])}${extraPrompt}`,
    melody: mel([n]),
    staff: mel([n]),
    staffBraille: false,
    cells: [noteCell(tone, value)],
    cellLabels: [eventLabel(n, style)],
    cellTones: [n],
  };
}

/** Choice-Task „Welche Note ist das?" (Notenzeile MIT Braille, ohne Oktavzeichen). */
function nameNoteTask(pool: readonly ToneName[], value: NoteValue, style: NameStyle): ChoiceTask {
  const tone = pick(pool);
  const wrong = shuffle(pool.filter((t) => t !== tone)).slice(0, 3);
  const choices = shuffle([tone, ...wrong]);
  const n = note(tone, 4, value);
  return {
    kind: "choice",
    key: `n:${tone}:${value}`,
    prompt: tA().hilfe.welcheNote,
    melody: mel([n]),
    staff: mel([n]),
    staffBraille: true,
    choices: choices.map((t) => toneName(t, style)),
    correctIndex: choices.indexOf(tone),
    explain: tA().hilfe.dasWar(toneName(tone, style), VALUE_LABELS[value]),
  };
}

/** Zufalls-Melodie in Schritten/kleinen Sprüngen (klingt nach Musik, nicht Würfel). */
function randomMotif(len: number, value: NoteValue, pool: readonly ToneName[]): MusicNote[] {
  let idx = Math.floor(Math.random() * pool.length);
  const out: MusicNote[] = [];
  for (let i = 0; i < len; i++) {
    out.push(note(pool[idx], 4, value));
    const step = pick([-2, -1, -1, 1, 1, 2]);
    idx = Math.max(0, Math.min(pool.length - 1, idx + step));
  }
  return out;
}

/** Write-Task für eine kurze Melodie (ohne Oktavzeichen — vor kp10). */
function writeMotifTask(
  notes: MusicNote[],
  style: NameStyle,
  keyPrefix: string,
  prompt: string,
): WriteTask {
  return {
    kind: "write",
    key: `${keyPrefix}:${notes.map((n) => n.tone + n.value[0]).join("")}`,
    prompt,
    melody: mel(notes),
    staff: mel(notes),
    staffBraille: true,
    cells: notes.map((n) => noteCell(n.tone, n.value)),
    cellLabels: notes.map((n) => eventLabel(n, style)),
    cellTones: notes,
  };
}

// --- Generatoren je Etappe --------------------------------------------------------

const EARLY_TONES: ToneName[] = ["c", "d", "e", "f", "g"];

function kp1Task(): ChoiceTask {
  const r = Math.random();
  if (r < 0.6) {
    // Zwei ODER drei Töne — welcher war der höchste? (Länge variiert bewusst,
    // Johannes 03.07.: bei „was ist höher" auch 3 Töne, 1., 2. oder 3.)
    const count = Math.random() < 0.5 ? 2 : 3;
    const pool = TONES;
    // count verschiedene Tonhöhen mit klarem Abstand (≥ Terz) gierig aufnehmen —
    // sonst liegen zwei fast gleich hohe Töne nebeneinander und man rät. Auf 7
    // Tönen findet das immer genug (max. unabhängige Menge = 4).
    const idxs: number[] = [];
    for (const p of shuffle([...pool.keys()])) {
      if (idxs.every((i) => Math.abs(i - p) >= 2)) idxs.push(p);
      if (idxs.length === count) break;
    }
    const notes = idxs.map((i) => note(pool[i], 4, "viertel"));
    const highest = idxs.indexOf(Math.max(...idxs));
    const ordinals = tA().kp1.ordinale;
    return {
      kind: "choice",
      key: `hoeher:${count}`,
      prompt:
        count === 2 ? tA().kp1.zweiHoeher : tA().kp1.dreiHoechster,
      melody: mel(notes),
      staff: null,
      choices: ordinals.slice(0, count),
      correctIndex: highest,
      explain: tA().kp1.hoechsterErklaer(highest),
    };
  }
  // Kleine Tonleiter — Länge variieren (4–7 Töne), rauf oder runter.
  const up = Math.random() < 0.5;
  const len = 4 + Math.floor(Math.random() * 4); // 4–7 Töne
  const scale = TONES.slice(0, len);
  const run = (up ? scale : [...scale].reverse()).map((t) => note(t, 4, "achtel"));
  return {
    kind: "choice",
    key: `leiter:${up ? "rauf" : "runter"}:${len}`,
    prompt: tA().kp1.leiter,
    melody: mel(run),
    staff: null,
    choices: tA().kp1.leiterWahl,
    correctIndex: up ? 0 : 1,
    explain: up ? tA().kp1.leiterRauf : tA().kp1.leiterRunter,
  };
}

function kp2Task(): TapTask {
  const len = 3 + Math.floor(Math.random() * 4); // 3–6 Schläge (auch längere)
  const pattern: ("kurz" | "lang")[] = [];
  for (let i = 0; i < len; i++) pattern.push(Math.random() < 0.5 ? "kurz" : "lang");
  // Der Runner erkennt kurz/lang RELATIV (kleinster Abstand = „kurz") — ein
  // Muster, dessen erste len−1 Schläge alle „lang" sind, wäre darum nie richtig
  // klopfbar (die Aufgabe bliebe endlos stehen). Mindestens ein „kurz" sichern;
  // „alle kurz" bleibt erlaubt (gleichmäßig schnell klopfen wertet richtig).
  if (!pattern.slice(0, -1).includes("kurz"))
    pattern[Math.floor(Math.random() * (len - 1))] = "kurz";
  const notes = pattern.map(() => note("g", 4, "viertel"));
  pattern.forEach((p, i) => {
    notes[i] = note("g", 4, p === "kurz" ? "achtel" : "viertel");
  });
  return {
    kind: "tap",
    key: `tap:${pattern.map((p) => p[0]).join("")}`,
    prompt: tA().kp2.prompt(len),
    melody: mel(notes),
    pattern,
  };
}

function kp3Task(style: NameStyle): KlangTask {
  const pool = TONES;
  if (Math.random() < 0.5) return writeNoteTask(pick(pool), "achtel", style, tA().kp3.grundform);
  return nameNoteTask(pool, "achtel", style);
}

function kp4Task(style: NameStyle): WriteTask {
  const notes = randomMotif(3 + Math.floor(Math.random() * 3), "achtel", EARLY_TONES);
  return writeMotifTask(notes, style, "melodie", tA().kp4.prompt);
}

function kp5Task(style: NameStyle): KlangTask {
  const r = Math.random();
  if (r < 0.4) return writeNoteTask(pick(TONES), "viertel", style, tA().kp5.viertelHinweis);
  if (r < 0.7) {
    const notes = randomMotif(3, "viertel", EARLY_TONES);
    return writeMotifTask(notes, style, "melodie4", tA().kp5.melodie);
  }
  // Achtel oder Viertel? (die Zelle fühlen)
  const tone = pick(TONES);
  const value: NoteValue = pick(["achtel", "viertel"]);
  const n = note(tone, 4, value);
  return {
    kind: "choice",
    key: `wert24:${tone}:${value}`,
    prompt: tA().kp5.frage,
    melody: mel([n]),
    staff: mel([n]),
    staffBraille: true,
    choices: tA().kp5.wahl,
    correctIndex: value === "achtel" ? 0 : 1,
    explain:
      value === "achtel"
        ? tA().kp5.erklaerAchtel
        : tA().kp5.erklaerViertel,
  };
}

function kp6Task(style: NameStyle): KlangTask {
  const r = Math.random();
  if (r < 0.5) {
    const value: NoteValue = pick(["halbe", "ganze"]);
    return writeNoteTask(
      pick(TONES),
      value,
      style,
      value === "halbe"
        ? tA().kp6.halbeHinweis
        : tA().kp6.ganzeHinweis,
    );
  }
  const tone = pick(TONES);
  const value: NoteValue = pick(["achtel", "viertel", "halbe", "ganze"]);
  const n = note(tone, 4, value);
  const order: NoteValue[] = ["achtel", "viertel", "halbe", "ganze"];
  return {
    kind: "choice",
    key: `wert4:${tone}:${value}`,
    prompt: tA().kp6.frage,
    melody: mel([n]),
    staff: mel([n]),
    staffBraille: true,
    choices: order.map((v) => VALUE_LABELS[v]),
    correctIndex: order.indexOf(value),
    explain: tA().kp6.erklaer(VALUE_LABELS[value]),
  };
}

const SIGS: [number, number][] = [
  [4, 4],
  [3, 4],
  [2, 4],
  [6, 8],
];

function kp7Task(style: NameStyle): KlangTask {
  const r = Math.random();
  if (r < 0.35) {
    const value: NoteValue = pick(["ganze", "halbe", "viertel", "achtel"]);
    return {
      kind: "write",
      key: `pause:${value}`,
      prompt: tA().kp7.schreibPause(REST_LABELS[value]),
      staff: mel([rest(value)]),
      staffBraille: true,
      cells: [REST_CELLS[value]],
      cellLabels: [REST_LABELS[value]],
      cellTones: [null],
    };
  }
  if (r < 0.65) {
    const sig = pick(SIGS);
    return {
      kind: "choice",
      key: `takt:${sig[0]}/${sig[1]}`,
      prompt: tA().kp7.taktart,
      staff: mel([], sig),
      staffBraille: false,
      showCells: timeSigCells(sig),
      choices: SIGS.map(([a, b]) => `${a}/${b}`),
      correctIndex: SIGS.findIndex(([a, b]) => a === sig[0] && b === sig[1]),
      explain: tA().kp7.taktartErklaer(sig[0], sig[1]),
    };
  }
  // Zwei Mini-Takte mit Taktstrich (Leertaste!)
  const t1 = pick(EARLY_TONES);
  const t2 = pick(EARLY_TONES);
  const n1 = note(t1, 4, "halbe");
  const n2 = note(t2, 4, "halbe");
  return {
    kind: "write",
    key: `taktstrich:${t1}${t2}`,
    prompt: tA().kp7.taktstrich(toneName(t1, style), toneName(t2, style)),
    melody: mel([n1, bar, n2]),
    staff: mel([n1, bar, n2], [2, 4]),
    staffBraille: true,
    cells: [noteCell(t1, "halbe"), BLANK, noteCell(t2, "halbe")],
    cellLabels: [eventLabel(n1, style), tA().gemeinsam.taktstrichZelle, eventLabel(n2, style)],
    cellTones: [n1, null, n2],
    explain: tA().kp7.taktstrichErklaer,
  };
}

function kp8Task(style: NameStyle): WriteTask {
  const tone = pick(TONES);
  const value: NoteValue = pick(["viertel", "halbe"]);
  const n = note(tone, 4, value, { dotted: true });
  return {
    kind: "write",
    key: `punkt:${tone}:${value}`,
    prompt: tA().kp8.prompt(toneName(tone, style), VALUE_LABELS[value]),
    melody: mel([n]),
    staff: mel([n]),
    staffBraille: true,
    cells: [noteCell(tone, value), DOT3_CELL],
    cellLabels: [eventLabel(note(tone, 4, value), style), tA().kp8.punktZelle],
    cellTones: [n, null],
  };
}

function kp9Task(style: NameStyle): WriteTask {
  const tone = pick(TONES);
  const acc = pick(["kreuz", "be", "aufloesung"] as const);
  const n = note(tone, 4, "viertel", { accidental: acc });
  return {
    kind: "write",
    key: `vz:${acc}:${tone}`,
    prompt: tA().kp9.prompt(ACCIDENTAL_LABELS[acc], toneName(tone, style)),
    melody: mel([n]),
    staff: mel([n]),
    staffBraille: true,
    cells: [ACCIDENTAL_CELLS[acc], noteCell(tone, "viertel")],
    cellLabels: [ACCIDENTAL_LABELS[acc], eventLabel(note(tone, 4, "viertel"), style)],
    cellTones: [null, n],
  };
}

function kp10Task(style: NameStyle): KlangTask {
  if (Math.random() < 0.4) {
    // Hören: tief / mittel / hoch
    const oct = pick([3, 4, 5]);
    const motif = randomMotif(3, "viertel", EARLY_TONES).map((n) => ({ ...n, octave: oct }));
    return {
      kind: "choice",
      key: `oktave-hoeren:${oct}`,
      prompt: tA().kp10.lage,
      melody: mel(motif),
      staff: null,
      choices: tA().kp10.lageWahl,
      correctIndex: oct - 3,
      explain: tA().kp10.lageErklaer(OCTAVE_LABELS[oct]),
    };
  }
  const tone = pick(TONES);
  const oct = pick([3, 4, 5]);
  const n = note(tone, oct, "viertel");
  return {
    kind: "write",
    key: `oktave:${oct}:${tone}`,
    prompt: tA().kp10.schreib(toneName(tone, style), OCTAVE_LABELS[oct]),
    melody: mel([n]),
    staff: mel([n]),
    staffBraille: true,
    octaveSigns: true,
    cells: [OCTAVE_CELLS[oct], noteCell(tone, "viertel")],
    cellLabels: [tA().kp10.zeichenZelle(OCTAVE_LABELS[oct]), eventLabel(n, style)],
    cellTones: [null, n],
  };
}

function kp11Task(style: NameStyle): KlangTask {
  // Zwei Noten — braucht die zweite ein Oktavzeichen? (Regeln Krolick Par. 1-10)
  const t1 = pick(TONES);
  const o1 = pick([3, 4, 5]);
  const t2 = pick(TONES);
  const o2 = pick([o1, o1, Math.random() < 0.5 ? o1 - 1 : o1 + 1]);
  const n1 = note(t1, o1, "viertel");
  const n2 = note(t2, Math.max(2, Math.min(6, o2)), "viertel");
  const needed = needsOctaveSign(n1, n2);
  const diff = Math.abs(
    (n2.octave * 7 + TONES.indexOf(n2.tone)) - (n1.octave * 7 + TONES.indexOf(n1.tone)),
  );
  const interval =
    diff === 0 ? tA().kp11.gleich : diff <= 2 ? tA().kp11.sekundeTerz : diff <= 4 ? tA().kp11.quarteQuinte : tA().kp11.sexteMehr;
  const rule =
    diff <= 2
      ? tA().kp11.regelKlein
      : diff <= 4
        ? tA().kp11.regelMittel
        : tA().kp11.regelGross;
  return {
    kind: "choice",
    key: `regel:${diff <= 2 ? "klein" : diff <= 4 ? "mittel" : "gross"}:${n1.octave === n2.octave ? "gleich" : "wechsel"}`,
    prompt: tA().kp11.prompt(toneName(t1, style), OCTAVE_LABELS[n1.octave], toneName(t2, style), OCTAVE_LABELS[n2.octave]),
    melody: mel([n1, n2]),
    staff: mel([n1, n2]),
    staffBraille: false,
    choices: tA().kp11.wahl,
    correctIndex: needed ? 0 : 1,
    explain: tA().kp11.erklaer(interval, rule),
  };
}

function kp12Task(): ChoiceTask {
  const tone = pick(TONES);
  const big = Math.random() < 0.5;
  const cell = noteCell(tone, "ganze"); // dieselbe Zelle: ganze ODER 16tel
  if (big) {
    return {
      kind: "choice",
      key: `mehrdeutig:ganz:${tone}`,
      prompt:
        tA().kp12.grossPrompt,
      showCells: [...timeSigCells([4, 4]), BLANK, cell],
      staff: null,
      choices: tA().kp12.grossWahl,
      correctIndex: 0,
      explain: tA().kp12.grossErklaer,
    };
  }
  return {
    kind: "choice",
    key: `mehrdeutig:16:${tone}`,
    prompt:
      tA().kp12.kleinPrompt,
    showCells: [...timeSigCells([2, 4]), BLANK, ...Array(8).fill(cell) as Cell[]],
    staff: null,
    choices: tA().kp12.kleinWahl,
    correctIndex: 1,
    explain: tA().kp12.kleinErklaer,
  };
}

function kp13Task(): KlangTask {
  const variants: (() => KlangTask)[] = [
    () => ({
      kind: "write",
      key: "form:simile",
      prompt: tA().kp13.similePrompt,
      cells: [SIMILE_CELL],
      cellLabels: [tA().kp13.simileZelle],
      cellTones: [null],
      staff: null,
      explain: tA().kp13.simileErklaer,
    }),
    () => ({
      kind: "write",
      key: "form:rep-start",
      prompt: tA().kp13.startPrompt,
      cells: REPEAT_START,
      cellLabels: tA().kp13.startZellen,
      cellTones: [null, null],
      staff: null,
    }),
    () => ({
      kind: "write",
      key: "form:rep-end",
      prompt: tA().kp13.endePrompt,
      cells: REPEAT_END,
      cellLabels: tA().kp13.endeZellen,
      cellTones: [null, null],
      staff: null,
    }),
    () => {
      const which = pick(["schluss", "anfang", "ende"] as const);
      const cells =
        which === "schluss" ? FINAL_BAR : which === "anfang" ? REPEAT_START : REPEAT_END;
      const labels = {
        schluss: tA().kp13.schluss,
        anfang: tA().kp13.anfang,
        ende: tA().kp13.ende,
      };
      const order = ["schluss", "anfang", "ende"] as const;
      return {
        kind: "choice",
        key: `form:erkennen:${which}`,
        prompt: tA().kp13.erkennenPrompt,
        showCells: cells,
        staff: null,
        choices: order.map((k) => labels[k]),
        correctIndex: order.indexOf(which),
        explain: tA().kp13.erkannt(labels[which]),
      } satisfies ChoiceTask;
    },
  ];
  return pick(variants)();
}

// --- Stufe-2-Generatoren (08.07.2026) — Haltebogen bis Triole ---------------------

/** Schlagzahl lesbar machen („1,5" statt „1.5"). */
const fmtBeats = (b: number): string => tA().gemeinsam.schlagzahl(b);

function kpHaltebogenTask(style: NameStyle): KlangTask {
  const r = Math.random();
  const tone = pick(TONES);
  if (r < 0.4) {
    // Hören zuerst: gebunden (EIN langer Ton) oder getrennt (zwei Anschläge)?
    const tied = Math.random() < 0.5;
    const n1 = note(tone, 4, "halbe", tied ? { tie: true } : {});
    const n2 = note(tone, 4, "halbe");
    return {
      kind: "choice",
      key: `tie-hoeren:${tied ? "ja" : "nein"}`,
      prompt: tA().haltebogen.hoerenPrompt,
      melody: mel([n1, n2]),
      staff: null,
      choices: tA().haltebogen.hoerenWahl,
      correctIndex: tied ? 0 : 1,
      explain: tied
        ? tA().haltebogen.hoerenGebunden
        : tA().haltebogen.hoerenGetrennt,
    };
  }
  const plain = note(tone, 4, "halbe");
  const n1 = note(tone, 4, "halbe", { tie: true });
  const n2 = note(tone, 4, "halbe");
  if (r < 0.7) {
    // Schreiben: Note, Haltebogen (2 Zellen), gleiche Note.
    return {
      kind: "write",
      key: `tie:${tone}`,
      prompt: tA().haltebogen.schreibPrompt(toneName(tone, style)),
      melody: mel([n1, n2]),
      staff: mel([n1, n2]),
      staffBraille: true,
      cells: [noteCell(tone, "halbe"), TIE_CELLS[0], TIE_CELLS[1], noteCell(tone, "halbe")],
      cellLabels: [
        eventLabel(plain, style),
        tA().haltebogen.zelle1,
        tA().haltebogen.zelle2,
        tA().haltebogen.klingtWeiter(eventLabel(plain, style)),
      ],
      cellTones: [plain, null, null, null],
      explain: tA().haltebogen.schreibErklaer,
    };
  }
  // Schreiben: Bindung über den Taktstrich (2/4).
  return {
    kind: "write",
    key: `tie-takt:${tone}`,
    prompt: tA().haltebogen.taktPrompt(toneName(tone, style)),
    melody: mel([n1, bar, n2], [2, 4]),
    staff: mel([n1, bar, n2], [2, 4]),
    staffBraille: true,
    cells: [noteCell(tone, "halbe"), TIE_CELLS[0], TIE_CELLS[1], BLANK, noteCell(tone, "halbe")],
    cellLabels: [
      eventLabel(plain, style),
      tA().haltebogen.zelle1,
      tA().haltebogen.zelle2,
      tA().gemeinsam.taktstrichZelle,
      tA().haltebogen.klingtWeiter(eventLabel(plain, style)),
    ],
    cellTones: [plain, null, null, null, null],
    explain: tA().haltebogen.taktErklaer,
  };
}

function kpAuftaktTask(style: NameStyle): KlangTask {
  const r = Math.random();
  if (r < 0.4) {
    // Taktrechnung mit den Ohren + am Notenbild: Geht der Takt auf?
    const sig = pick(SIGS.slice(0, 3)); // 4/4, 3/4, 2/4
    const target = sig[0] * (4 / sig[1]);
    const full = Math.random() < 0.5;
    const want = full ? target : Math.max(0.5, target - pick([0.5, 1, 1, 2].filter((x) => x < target)));
    const opts: [NoteValue, number][] = [
      ["halbe", 2],
      ["viertel", 1],
      ["achtel", 0.5],
    ];
    const notes: MusicNote[] = [];
    let sum = 0;
    while (sum < want - 1e-9) {
      const fit = opts.filter(([, b]) => b <= want - sum + 1e-9);
      const chosen = pick(fit);
      notes.push(note(pick(EARLY_TONES), 4, chosen[0]));
      sum += chosen[1];
    }
    return {
      kind: "choice",
      key: `auftakt-voll:${sig[0]}${sig[1]}:${full ? "voll" : "teil"}:${notes.length}`,
      prompt: tA().auftakt.vollPrompt(sig[0], sig[1]),
      melody: mel(notes, sig),
      staff: mel(notes, sig),
      staffBraille: true,
      choices: tA().auftakt.vollWahl,
      correctIndex: full ? 0 : 1,
      explain: full
        ? tA().auftakt.vollJa(fmtBeats(target))
        : tA().auftakt.vollNein(fmtBeats(sum), fmtBeats(target)),
    };
  }
  if (r < 0.6) {
    // Musik-Bindestrich schreiben.
    return {
      kind: "write",
      key: "hyphen",
      prompt: tA().auftakt.bindestrichPrompt,
      staff: null,
      cells: [MUSIC_HYPHEN_CELL],
      cellLabels: [tA().auftakt.bindestrichZelle],
      cellTones: [null],
      explain: tA().auftakt.bindestrichErklaer,
    };
  }
  // Auftakt schreiben: Auftakt-Viertel, Taktstrich, voller 3/4-Takt.
  const t0 = pick(EARLY_TONES);
  const up = note(t0, 4, "viertel");
  const trio = randomMotif(3, "viertel", EARLY_TONES);
  return {
    kind: "write",
    key: `auftakt:${t0}${trio.map((n) => n.tone).join("")}`,
    prompt: tA().auftakt.schreibPrompt(toneName(t0, style)),
    melody: mel([up, bar, ...trio], [3, 4]),
    staff: mel([up, bar, ...trio], [3, 4]),
    staffBraille: true,
    cells: [noteCell(t0, "viertel"), BLANK, ...trio.map((n) => noteCell(n.tone, "viertel"))],
    cellLabels: [
      tA().auftakt.auftaktZelle(eventLabel(up, style)),
      tA().gemeinsam.taktstrichZelle,
      ...trio.map((n) => eventLabel(n, style)),
    ],
    cellTones: [up, null, ...trio],
    explain: tA().auftakt.schreibErklaer,
  };
}

function kpPausen2Task(): KlangTask {
  const r = Math.random();
  if (r < 0.3) {
    const n = 4 + Math.floor(Math.random() * 5); // 4–8
    const cells = multiRestCells(n);
    return {
      kind: "write",
      key: `mrest:${n}`,
      prompt: tA().pausen2.vielePrompt(n),
      staff: null,
      cells,
      cellLabels: [
        tA().pausen2.zahlzeichenZelle,
        tA().pausen2.zahlZelle(n),
        tA().pausen2.ganzePauseZelle,
      ],
      cellTones: cells.map(() => null),
      explain: tA().pausen2.vieleErklaer,
    };
  }
  if (r < 0.55) {
    const n = 2 + Math.floor(Math.random() * 2); // 2–3
    const cells = multiRestCells(n);
    return {
      kind: "write",
      key: `mrest-klein:${n}`,
      prompt: tA().pausen2.kleinPrompt(n),
      staff: null,
      cells,
      cellLabels: cells.map((_, i) => tA().pausen2.kleinZelle(i + 1)),
      cellTones: cells.map(() => null),
      explain: tA().pausen2.kleinErklaer,
    };
  }
  if (r < 0.8) {
    const n = pick([3, 4, 5, 6, 7, 8]);
    const wrong = shuffle([2, 3, 4, 5, 6, 7, 8, 9].filter((x) => x !== n)).slice(0, 3);
    const choices = [n, ...wrong].sort((a, b) => a - b);
    return {
      kind: "choice",
      key: `mrest-lesen:${n}`,
      prompt: tA().pausen2.lesenPrompt,
      showCells: multiRestCells(n),
      staff: null,
      choices: choices.map((c) => tA().pausen2.takte(c)),
      correctIndex: choices.indexOf(n),
      explain:
        n <= 3
          ? tA().pausen2.lesenKlein(n)
          : tA().pausen2.lesenGross(n),
    };
  }
  // Hören: Wo ist der stille Takt?
  const pos = pick(["Anfang", "Mitte", "Ende"] as const);
  const motifA = randomMotif(4, "viertel", EARLY_TONES);
  const motifB = randomMotif(4, "viertel", EARLY_TONES);
  const silence: MusicEvent[] = [rest("ganze")];
  const events: MusicEvent[] =
    pos === "Anfang"
      ? [...silence, bar, ...motifA, bar, ...motifB]
      : pos === "Mitte"
        ? [...motifA, bar, ...silence, bar, ...motifB]
        : [...motifA, bar, ...motifB, bar, ...silence];
  return {
    kind: "choice",
    key: `stille:${pos}`,
    prompt: tA().pausen2.stillePrompt,
    melody: mel(events),
    staff: null,
    choices: tA().pausen2.stilleWahl,
    correctIndex: pos === "Anfang" ? 0 : pos === "Mitte" ? 1 : 2,
    explain: tA().pausen2.stilleErklaer(pos === "Anfang" ? 0 : pos === "Mitte" ? 1 : 2),
  };
}

/** Dur-Tonarten je Vorzeichenzahl (für Erklärtexte — Quintenzirkel-Vorgeschmack). */
const KEY_NAMES: Record<"kreuz" | "be", string[]> = {
  get kreuz() {
    return tA().tonart.keyNames.kreuz;
  },
  get be() {
    return tA().tonart.keyNames.be;
  },
};

function kpTonartTask(): KlangTask {
  const r = Math.random();
  const acc = pick(["kreuz", "be"] as const);
  const accName = acc === "kreuz" ? tA().tonart.kreuz : tA().tonart.be;
  const accPlural = acc === "kreuz" ? tA().tonart.kreuze : tA().tonart.bes;
  if (r < 0.35) {
    const n = 1 + Math.floor(Math.random() * 4); // 1–4
    return {
      kind: "choice",
      key: `tonart-lesen:${acc}:${n}`,
      prompt: tA().tonart.lesenPrompt(accPlural),
      showCells: keySignatureCells(n, acc),
      staff: null,
      choices: ["1", "2", "3", "4"].map((c) => `${c} ${c === "1" ? accName : accPlural}`),
      correctIndex: n - 1,
      explain: tA().tonart.lesenErklaer(n, n === 1 ? accName : accPlural, KEY_NAMES[acc][n - 1], n >= 4),
    };
  }
  if (r < 0.65) {
    const n = 1 + Math.floor(Math.random() * 4);
    const cells = keySignatureCells(n, acc);
    return {
      kind: "write",
      key: `tonart:${acc}:${n}`,
      prompt:
        n <= 3
          ? tA().tonart.schreibKlein(n, n === 1 ? accName : accPlural, accName)
          : tA().tonart.schreibGross(n, accPlural, accName),
      staff: null,
      cells,
      cellLabels:
        n <= 3
          ? cells.map((_, i) => tA().tonart.zeichenZelle(accName, i + 1, acc === "kreuz" ? "1, 4, 6" : "1, 2, 6"))
          : [tA().tonart.zahlzeichenZelle, tA().tonart.zahlZelle(n), tA().tonart.dasZeichen(accName)],
      cellTones: cells.map(() => null),
      explain: tA().tonart.istVorzeichnung(KEY_NAMES[acc][n - 1]),
    };
  }
  if (r < 0.85) {
    // Der Stück-Kopf: Vorzeichnung + Taktangabe zusammen (Par. 3-5).
    const n = 1 + Math.floor(Math.random() * 3);
    const sig = pick(SIGS);
    const cells = [...keySignatureCells(n, acc), ...timeSigCells(sig)];
    return {
      kind: "write",
      key: `kopf:${acc}:${n}:${sig[0]}${sig[1]}`,
      prompt: tA().tonart.kopfPrompt(n, n === 1 ? accName : accPlural, sig[0], sig[1]),
      staff: null,
      cells,
      cellLabels: [
        ...Array.from({ length: n }, (_, i) => tA().tonart.kopfZelle(accName, i + 1)),
        tA().gemeinsam.zahlzeichen,
        tA().gemeinsam.obereZahl(sig[0]),
        tA().gemeinsam.tiefeZahl(sig[1]),
      ],
      cellTones: cells.map(() => null),
      explain: tA().tonart.kopfErklaer,
    };
  }
  return {
    kind: "choice",
    key: "tonart-regel",
    prompt: tA().tonart.regelPrompt,
    staff: null,
    choices: tA().tonart.regelWahl,
    correctIndex: 0,
    explain: tA().tonart.regelErklaer,
  };
}

function kpTaktwechselTask(): KlangTask {
  const r = Math.random();
  if (r < 0.3) {
    const isC = Math.random() < 0.5;
    return {
      kind: "choice",
      key: `sondertakt:${isC ? "c" : "ab"}`,
      prompt: tA().taktwechsel.sonderPrompt,
      showCells: isC ? COMMON_TIME_CELLS : ALLA_BREVE_CELLS,
      staff: null,
      choices: tA().taktwechsel.sonderWahl,
      correctIndex: isC ? 0 : 1,
      explain: isC
        ? tA().taktwechsel.sonderErklaerC
        : tA().taktwechsel.sonderErklaerAb,
    };
  }
  if (r < 0.55) {
    const isC = Math.random() < 0.5;
    return {
      kind: "write",
      key: `sondertakt-schreiben:${isC ? "c" : "ab"}`,
      prompt: isC
        ? tA().taktwechsel.sonderSchreibenC
        : tA().taktwechsel.sonderSchreibenAb,
      staff: null,
      cells: isC ? COMMON_TIME_CELLS : ALLA_BREVE_CELLS,
      cellLabels: [
        isC ? tA().taktwechsel.vorzeichenC : tA().taktwechsel.vorzeichenAb,
        tA().taktwechsel.dasC,
      ],
      cellTones: [null, null],
    };
  }
  if (r < 0.8) {
    const from = pick(SIGS);
    let to = pick(SIGS);
    for (let i = 0; i < 6 && to === from; i++) to = pick(SIGS);
    const noteCells = [noteCell("c", "viertel"), noteCell("e", "viertel")];
    return {
      kind: "choice",
      key: `wechsel:${from[0]}${from[1]}-${to[0]}${to[1]}`,
      prompt: tA().taktwechsel.wechselPrompt,
      showCells: [...timeSigCells(from), BLANK, ...noteCells, BLANK, ...timeSigCells(to)],
      staff: null,
      choices: tA().taktwechsel.wechselWahl(to[0], to[1]),
      correctIndex: 0,
      explain: tA().taktwechsel.wechselErklaer(to[0], to[1]),
    };
  }
  const to = pick(SIGS);
  return {
    kind: "write",
    key: `wechsel-schreiben:${to[0]}${to[1]}`,
    prompt: tA().taktwechsel.wechselSchreiben(to[0], to[1]),
    staff: null,
    cells: [BLANK, ...timeSigCells(to)],
    cellLabels: [
      tA().gemeinsam.taktstrichZelle,
      tA().gemeinsam.zahlzeichen,
      tA().gemeinsam.obereZahl(to[0]),
      tA().gemeinsam.tiefeZahl(to[1]),
    ],
    cellTones: [null, null, null, null],
  };
}

const CLEFS: ClefName[] = ["violin", "bass", "alt"];

function kpSchluesselTask(): KlangTask {
  const r = Math.random();
  if (r < 0.4) {
    const clef = pick(CLEFS);
    return {
      kind: "choice",
      key: `clef-lesen:${clef}`,
      prompt: tA().schluessel.lesenPrompt,
      showCells: CLEF_CELLS[clef],
      staff: null,
      choices: CLEFS.map((c) => CLEF_LABELS[c]),
      correctIndex: CLEFS.indexOf(clef),
      explain: tA().schluessel.lesenErklaer(CLEF_LABELS[clef]),
    };
  }
  if (r < 0.7) {
    const clef = pick(["violin", "bass"] as const);
    const mid = clef === "violin" ? tA().schluessel.mitteViolin : tA().schluessel.mitteBass;
    return {
      kind: "write",
      key: `clef:${clef}`,
      prompt: tA().schluessel.schreibPrompt(CLEF_LABELS[clef], mid),
      staff: null,
      cells: CLEF_CELLS[clef],
      cellLabels: [
        tA().schluessel.ankuendigung,
        clef === "violin" ? tA().schluessel.gZeichen : tA().schluessel.fZeichen,
        tA().schluessel.abschluss,
      ],
      cellTones: [null, null, null],
    };
  }
  return {
    kind: "choice",
    key: "clef-wissen",
    prompt: tA().schluessel.wissenPrompt,
    staff: null,
    choices: tA().schluessel.wissenWahl,
    correctIndex: 0,
    explain: tA().schluessel.wissenErklaer,
  };
}

function kpSechzehntelTask(style: NameStyle): KlangTask {
  const r = Math.random();
  if (r < 0.3) {
    const fast = Math.random() < 0.5;
    const run = randomMotif(6, fast ? "sechzehntel" : "achtel", TONES);
    return {
      kind: "choice",
      key: `sz-hoeren:${fast ? "16" : "8"}`,
      prompt: tA().sechzehntel.hoerenPrompt,
      melody: mel(run),
      staff: null,
      choices: tA().sechzehntel.hoerenWahl,
      correctIndex: fast ? 1 : 0,
      explain: fast
        ? tA().sechzehntel.hoerenSchnell
        : tA().sechzehntel.hoerenLangsam,
    };
  }
  if (r < 0.65) {
    // Gruppierungsregel (Par. 4-2): nur die ERSTE Note trägt die Wert-Punkte.
    const run = randomMotif(4, "sechzehntel", EARLY_TONES);
    return {
      kind: "write",
      key: `gruppe:${run.map((n) => n.tone).join("")}`,
      prompt: tA().sechzehntel.gruppePrompt,
      melody: mel(run),
      staff: mel(run),
      staffBraille: false,
      cells: [noteCell(run[0].tone, "sechzehntel"), ...run.slice(1).map((n) => noteCell(n.tone, "achtel"))],
      cellLabels: [
        tA().sechzehntel.ersteZelle(toneName(run[0].tone, style)),
        ...run.slice(1).map((n) => tA().sechzehntel.andereZelle(toneName(n.tone, style))),
      ],
      cellTones: [...run],
      explain: tA().sechzehntel.gruppeErklaer,
    };
  }
  if (r < 0.85) {
    return {
      kind: "choice",
      key: "gruppe-regel",
      prompt: tA().sechzehntel.regelPrompt,
      staff: null,
      choices: tA().sechzehntel.regelWahl,
      correctIndex: 0,
      explain: tA().sechzehntel.regelErklaer,
    };
  }
  const tone = pick(TONES);
  const n = note(tone, 4, "sechzehntel");
  return {
    kind: "write",
    key: `sz:${tone}`,
    prompt: tA().sechzehntel.einzelnPrompt(toneName(tone, style)),
    melody: mel([n]),
    staff: mel([n]),
    staffBraille: true,
    cells: [noteCell(tone, "sechzehntel")],
    cellLabels: [eventLabel(n, style)],
    cellTones: [n],
  };
}

function kpTriolenTask(style: NameStyle): KlangTask {
  const r = Math.random();
  if (r < 0.4) {
    // Hören: Zwei Achtel oder Triole auf demselben Schlag? Referenz-Schläge
    // davor und danach machen den Puls hörbar.
    const triole = Math.random() < 0.5;
    const base = pick(EARLY_TONES);
    const beat = triole
      ? randomMotif(3, "achtel", EARLY_TONES).map((n) => ({ ...n, tuplet: 3 as const }))
      : randomMotif(2, "achtel", EARLY_TONES);
    const events: MusicEvent[] = [note(base, 4, "viertel"), ...beat, note(base, 4, "viertel")];
    return {
      kind: "choice",
      key: `triole-hoeren:${triole ? "3" : "2"}`,
      prompt: tA().triolen.hoerenPrompt,
      melody: mel(events),
      staff: null,
      choices: tA().triolen.hoerenWahl,
      correctIndex: triole ? 1 : 0,
      explain: triole
        ? tA().triolen.hoerenTriole
        : tA().triolen.hoerenZwei,
    };
  }
  if (r < 0.75) {
    const run = randomMotif(3, "achtel", EARLY_TONES).map((n) => ({ ...n, tuplet: 3 as const }));
    return {
      kind: "write",
      key: `triole:${run.map((n) => n.tone).join("")}`,
      prompt: tA().triolen.schreibPrompt,
      melody: mel(run),
      staff: mel(run),
      staffBraille: false,
      cells: [TRIPLET_CELL, ...run.map((n) => noteCell(n.tone, "achtel"))],
      cellLabels: [
        tA().triolen.triolenZeichen,
        ...run.map((n) => tA().triolen.achtelZelle(toneName(n.tone, style))),
      ],
      cellTones: [null, ...run],
      explain: tA().triolen.schreibErklaer,
    };
  }
  const run = randomMotif(3, "achtel", EARLY_TONES);
  return {
    kind: "choice",
    key: "triole-lesen",
    prompt: tA().triolen.lesenPrompt,
    showCells: [TRIPLET_CELL, ...run.map((n) => noteCell(n.tone, "achtel"))],
    staff: null,
    choices: tA().triolen.lesenWahl,
    correctIndex: 0,
    explain: tA().triolen.lesenErklaer,
  };
}

// ==================================================================================
// Stufe-3-Generatoren (08.07.2026) — Welt 1 (Ausbau), Welt 4, Welt 5.
// Vollausbau-Übergabe §5–§7; play/echo-Engine §4. Kodály-Tonraum: g–e zuerst,
// dann +a, dann Pentatonik c-d-e-g-a (f/h spät). Fertigkeitstreppe je Kapitel.
// ==================================================================================

/** Pentatonik-Tonraum (Kodály, feste do=c-Solmisation) — f/h bewusst spät. */
const PENTA: ToneName[] = ["c", "d", "e", "g", "a"];

// --- Welt 1 „Ohrenspitzer" — Ausbau (§5) ----------------------------------------

function kpPulsTask(): KlangTask {
  const r = Math.random();
  if (r < 0.34) {
    const sig = pick([[2, 4], [3, 4]] as [number, number][]);
    const beatsN = 8;
    const notes: MusicNote[] = [];
    for (let i = 0; i < beatsN; i++)
      notes.push(note(pick(PENTA), 4, "viertel", i % sig[0] === 0 ? { artic: "akzent" } : {}));
    return {
      kind: "tap",
      key: `puls:${sig[0]}`,
      prompt: tA().puls.klopfPrompt(beatsN),
      melody: mel(notes, sig),
      pattern: Array(beatsN).fill("lang"),
      pulse: true,
    };
  }
  if (r < 0.67) {
    const drei = Math.random() < 0.5;
    const sig: [number, number] = drei ? [3, 4] : [2, 4];
    const notes: MusicNote[] = [];
    for (let b = 0; b < 3; b++)
      for (let i = 0; i < sig[0]; i++)
        notes.push(note(pick(PENTA), 4, "viertel", i === 0 ? { artic: "akzent" } : {}));
    return {
      kind: "choice",
      key: `puls-metrum:${drei ? 3 : 2}`,
      prompt: tA().puls.metrumPrompt,
      melody: mel(notes, sig),
      staff: null,
      choices: tA().puls.metrumWahl,
      correctIndex: drei ? 1 : 0,
      explain: drei
        ? tA().puls.metrumDrei
        : tA().puls.metrumZwei,
    };
  }
  const gap = pick([2, 3, 4]);
  const notes: MusicNote[] = [];
  for (let b = 0; b < 3; b++)
    for (let i = 0; i < gap; i++)
      notes.push(note(pick(PENTA), 4, "viertel", i === 0 ? { artic: "akzent" } : {}));
  return {
    kind: "choice",
    key: `puls-abstand:${gap}`,
    prompt: tA().puls.abstandPrompt,
    melody: mel(notes, [gap, 4]),
    staff: null,
    choices: tA().puls.abstandWahl,
    correctIndex: gap - 2,
    explain: tA().puls.abstandErklaer(gap),
  };
}

function kpLauschenDauerTask(): ChoiceTask {
  const r = Math.random();
  const base = pick(PENTA);
  if (r < 0.4) {
    const erster = Math.random() < 0.5;
    return {
      kind: "choice",
      key: `dauer-vergleich:${erster ? "1" : "2"}`,
      prompt: tA().dauer.vergleichPrompt,
      melody: mel([note(base, 4, erster ? "halbe" : "viertel"), note(base, 4, erster ? "viertel" : "halbe")]),
      staff: null,
      choices: tA().dauer.vergleichWahl,
      correctIndex: erster ? 0 : 1,
      explain: erster
        ? tA().dauer.vergleichErster
        : tA().dauer.vergleichZweiter,
    };
  }
  if (r < 0.7) {
    const val = pick(["viertel", "halbe", "ganze"] as NoteValue[]);
    const zahl = val === "viertel" ? 1 : val === "halbe" ? 2 : 4;
    return {
      kind: "choice",
      key: `dauer-schlaege:${val}`,
      prompt: tA().dauer.schlaegePrompt,
      melody: mel([note("g", 4, "viertel"), note("g", 4, "viertel"), note(base, 4, val)]),
      staff: null,
      choices: tA().dauer.schlaegeWahl,
      correctIndex: val === "viertel" ? 0 : val === "halbe" ? 1 : 2,
      explain: tA().dauer.schlaegeErklaer(VALUE_LABELS[val], zahl),
    };
  }
  const gleich = Math.random() < 0.5;
  return {
    kind: "choice",
    key: `dauer-paar:${gleich ? "gleich" : "doppelt"}`,
    prompt: tA().dauer.paarPrompt,
    melody: mel([note(base, 4, "viertel"), note(base, 4, gleich ? "viertel" : "halbe")]),
    staff: null,
    choices: tA().dauer.paarWahl,
    correctIndex: gleich ? 0 : 1,
    explain: gleich ? tA().dauer.paarGleich : tA().dauer.paarDoppelt,
  };
}

function kpLauschenDynamikTask(): ChoiceTask {
  const r = Math.random();
  if (r < 0.4) {
    const laut = Math.random() < 0.5;
    const m = mel(randomMotif(4, "viertel", PENTA));
    m.dynamik = laut ? { startGain: 1, endGain: 1 } : { startGain: 0.25, endGain: 0.25 };
    return {
      kind: "choice",
      key: `hoer-dyn:${laut ? "f" : "p"}`,
      prompt: tA().dynamik.lautPrompt,
      melody: m,
      staff: null,
      choices: tA().dynamik.lautWahl,
      correctIndex: laut ? 0 : 1,
      explain: laut ? tA().dynamik.lautErklaer : tA().dynamik.leiseErklaer,
    };
  }
  if (r < 0.7) {
    const cresc = Math.random() < 0.5;
    const m = mel(randomMotif(5, "viertel", PENTA));
    m.dynamik = cresc ? { startGain: 0.2, endGain: 1 } : { startGain: 1, endGain: 0.2 };
    return {
      kind: "choice",
      key: `hoer-rampe:${cresc ? "cr" : "decr"}`,
      prompt: tA().dynamik.rampePrompt,
      melody: m,
      staff: null,
      choices: tA().dynamik.rampeWahl,
      correctIndex: cresc ? 0 : 1,
      explain: cresc ? tA().dynamik.cresc : tA().dynamik.decresc,
    };
  }
  const pos = pick(["Anfang", "Mitte", "Ende"] as const);
  const idx = pos === "Anfang" ? 0 : pos === "Mitte" ? 2 : 4;
  const notes = randomMotif(5, "viertel", PENTA).map((n, i) => (i === idx ? { ...n, artic: "akzent" as const } : n));
  return {
    kind: "choice",
    key: `hoer-akzent:${pos}`,
    prompt: tA().dynamik.akzentPrompt,
    melody: mel(notes),
    staff: null,
    choices: tA().dynamik.akzentWahl,
    correctIndex: pos === "Anfang" ? 0 : pos === "Mitte" ? 1 : 2,
    explain: tA().dynamik.akzentErklaer(pos === "Anfang" ? 0 : pos === "Mitte" ? 1 : 2),
  };
}

function kpInstrumenteTask(): ChoiceTask {
  const merk: Record<Instrument, string> = tA().inst.merk;
  const r = Math.random();
  if (r < 0.5) {
    const inst = pick(INSTRUMENTS);
    const opts = shuffle([...INSTRUMENTS]);
    return {
      kind: "choice",
      key: `inst-hoeren:${inst}`,
      prompt: tA().inst.hoerenPrompt,
      melody: mel(randomMotif(4, "viertel", PENTA)),
      instrument: inst,
      staff: null,
      choices: opts.map((i) => INSTRUMENT_LABELS[i]),
      correctIndex: opts.indexOf(inst),
      explain: merk[inst],
    };
  }
  if (r < 0.8) {
    const same = Math.random() < 0.5;
    const iA = pick(INSTRUMENTS);
    const iB = same ? iA : pick(INSTRUMENTS.filter((x) => x !== iA));
    return {
      kind: "choice",
      key: `inst-vergleich:${same ? "gleich" : "verschieden"}`,
      prompt: tA().inst.vergleichPrompt,
      melody: mel(randomMotif(3, "viertel", PENTA)),
      instrument: iA,
      melody2: mel(randomMotif(3, "viertel", PENTA)),
      instrument2: iB,
      staff: null,
      choices: tA().inst.vergleichWahl,
      correctIndex: same ? 0 : 1,
      explain: same ? tA().inst.vergleichGleich : tA().inst.vergleichErklaer(INSTRUMENT_LABELS[iA], INSTRUMENT_LABELS[iB]),
    };
  }
  const iA = pick(INSTRUMENTS);
  const iB = pick(INSTRUMENTS.filter((x) => x !== iA));
  const opts = shuffle([iA, iB]);
  return {
    kind: "choice",
    key: `inst-zuerst:${iA}`,
    prompt: tA().inst.zuerstPrompt,
    melody: mel(randomMotif(3, "viertel", PENTA)),
    instrument: iA,
    melody2: mel(randomMotif(3, "viertel", PENTA)),
    instrument2: iB,
    staff: null,
    choices: opts.map((i) => INSTRUMENT_LABELS[i]),
    correctIndex: opts.indexOf(iA),
    explain: tA().inst.zuerstErklaer(INSTRUMENT_LABELS[iA]),
  };
}

function kpEchoTask(): PlayTask {
  const band = pick(["A", "A", "B", "B", "C"] as const);
  const pool: ToneName[] = band === "A" ? ["g", "e"] : band === "B" ? ["g", "e", "a"] : PENTA;
  const len = band === "A" ? (Math.random() < 0.5 ? 2 : 3) : band === "B" ? 3 + Math.floor(Math.random() * 2) : 3 + Math.floor(Math.random() * 3);
  const notes = Array.from({ length: len }, () => note(pick(pool), 4, "viertel"));
  return {
    kind: "play",
    key: `echo:${band}:${len}`,
    prompt: tA().echo.prompt(len),
    melody: mel(notes),
    explain: tA().echo.erklaer,
  };
}

function kpMelodieMemoryTask(): PlayTask {
  return {
    kind: "play",
    key: "memory:run",
    memory: true,
    startLen: 2,
    pool: PENTA,
    prompt: tA().memory.prompt,
    melody: mel([]),
  };
}

// --- Welt 4 „Ausdruck" (§6) -----------------------------------------------------

function kpBindebogenTask(style: NameStyle, rhythm: boolean): KlangTask {
  const tx = klangTexte().aufgabenB;
  const tb = tx.bindebogen;
  const lbl = (ev: MusicEvent) => eventLabel(ev, style, rhythm);
  const r = Math.random();
  const base = pick(PENTA);
  if (r < 0.3) {
    const legato = Math.random() < 0.5;
    const artic = legato ? ("tenuto" as const) : ("staccato" as const);
    return {
      kind: "choice",
      key: `legato-hoeren:${legato ? "geb" : "getr"}`,
      prompt: tb.hoerenPrompt,
      melody: mel(randomMotif(3, "viertel", PENTA).map((n) => ({ ...n, artic }))),
      staff: null,
      choices: tb.hoerenChoices,
      correctIndex: legato ? 0 : 1,
      explain: legato ? tb.hoerenExplainGebunden : tb.hoerenExplainGetrennt,
    };
  }
  if (r < 0.55) {
    const halte = Math.random() < 0.5;
    if (halte) {
      return {
        kind: "choice",
        key: "bogen-welcher:halte",
        prompt: tb.welcherHaltePrompt,
        melody: mel([note(base, 4, "halbe", { tie: true }), note(base, 4, "halbe")]),
        showCells: [noteCell(base, "halbe"), ...TIE_CELLS, noteCell(base, "halbe")],
        staff: null,
        choices: tb.welcherChoices,
        correctIndex: 0,
        explain: tb.welcherExplainHalte,
      };
    }
    const t2 = pick(PENTA.filter((x) => x !== base));
    return {
      kind: "choice",
      key: "bogen-welcher:binde",
      prompt: tb.welcherBindePrompt,
      melody: mel([note(base, 4, "viertel", { artic: "tenuto" }), note(t2, 4, "viertel", { artic: "tenuto" })]),
      showCells: [noteCell(base, "viertel"), SLUR_CELL, noteCell(t2, "viertel")],
      staff: null,
      choices: tb.welcherChoices,
      correctIndex: 1,
      explain: tb.welcherExplainBinde,
    };
  }
  if (r < 0.8) {
    const m = randomMotif(3, "viertel", PENTA);
    return {
      kind: "write",
      key: `binde-schreiben:${m.map((n) => n.tone).join("")}`,
      prompt: tb.schreibenPrompt,
      melody: mel(m.map((n) => ({ ...n, artic: "tenuto" as const }))),
      staff: mel(m),
      staffBraille: true,
      octaveSigns: false,
      cells: [noteCell(m[0].tone, "viertel"), SLUR_CELL, noteCell(m[1].tone, "viertel"), SLUR_CELL, noteCell(m[2].tone, "viertel")],
      cellLabels: [lbl(m[0]), tb.bindebogenLabel, lbl(m[1]), tb.bindebogenLabel, tb.letzteFrei(lbl(m[2]))],
      cellTones: [m[0], null, m[1], null, m[2]],
      explain: tb.schreibenExplain,
    };
  }
  const m = randomMotif(5, "viertel", PENTA);
  return {
    kind: "write",
    key: `binde-verdopplung:${m.map((n) => n.tone).join("")}`,
    prompt: tb.verdopplungPrompt,
    melody: mel(m.map((n) => ({ ...n, artic: "tenuto" as const }))),
    staff: mel(m),
    staffBraille: true,
    octaveSigns: false,
    cells: [
      noteCell(m[0].tone, "viertel"), SLUR_CELL, SLUR_CELL,
      noteCell(m[1].tone, "viertel"), noteCell(m[2].tone, "viertel"), noteCell(m[3].tone, "viertel"),
      SLUR_CELL, noteCell(m[4].tone, "viertel"),
    ],
    cellLabels: [
      lbl(m[0]),
      tb.verdopplungErste,
      tb.verdopplungZweite,
      lbl(m[1]), lbl(m[2]), lbl(m[3]),
      tb.verdopplungVorletzte,
      tb.letzteFrei(lbl(m[4])),
    ],
    cellTones: [m[0], null, null, m[1], m[2], m[3], null, m[4]],
    explain: tb.verdopplungExplain,
  };
}

const ARTIC_MAIN = ["staccato", "tenuto", "akzent"] as const;

function kpArtikulationTask(style: NameStyle, rhythm: boolean): KlangTask {
  const tx = klangTexte().aufgabenB;
  const ta = tx.artikulation;
  const lbl = (ev: MusicEvent) => eventLabel(ev, style, rhythm);
  const r = Math.random();
  if (r < 0.32) {
    const a = pick(ARTIC_MAIN);
    return {
      kind: "choice",
      key: `artic-hoeren:${a}`,
      prompt: ta.hoerenPrompt,
      melody: mel(randomMotif(3, "viertel", PENTA).map((n) => ({ ...n, artic: a }))),
      staff: null,
      choices: ta.hoerenChoices,
      correctIndex: a === "staccato" ? 0 : a === "tenuto" ? 1 : 2,
      explain: a === "staccato" ? ta.hoerenExplainStaccato : a === "tenuto" ? ta.hoerenExplainTenuto : ta.hoerenExplainAkzent,
    };
  }
  if (r < 0.5) {
    const fermate = Math.random() < 0.5;
    return {
      kind: "choice",
      key: `artic-position:${fermate ? "fermate" : "artic"}`,
      prompt: fermate ? ta.positionPromptFermate : ta.positionPromptArtic,
      staff: null,
      choices: [tx.gemeinsam.vorDerNote, tx.gemeinsam.nachDerNote],
      correctIndex: fermate ? 1 : 0,
      explain: fermate ? ta.positionExplainFermate : ta.positionExplainArtic,
    };
  }
  if (r < 0.68) {
    const four = Math.random() < 0.35;
    const m = randomMotif(four ? 4 : 3, "viertel", PENTA);
    const cells: Cell[] = [];
    const labels: string[] = [];
    const tones: (MusicNote | null)[] = [];
    const stacc = ARTIC_CELLS.staccato[0];
    if (four) {
      cells.push(stacc, stacc, noteCell(m[0].tone, "viertel"));
      labels.push(ta.staccatoDoppeltErste, ta.staccatoDoppeltZweite, lbl(m[0]));
      tones.push(null, null, m[0]);
      for (let i = 1; i < 3; i++) {
        cells.push(noteCell(m[i].tone, "viertel"));
        labels.push(lbl(m[i]));
        tones.push(m[i]);
      }
      cells.push(stacc, noteCell(m[3].tone, "viertel"));
      labels.push(ta.staccatoEinfachLetzte, lbl(m[3]));
      tones.push(null, m[3]);
    } else {
      for (const n of m) {
        cells.push(stacc, noteCell(n.tone, "viertel"));
        labels.push(ta.staccato, lbl(n));
        tones.push(null, n);
      }
    }
    return {
      kind: "write",
      key: `artic-staccato:${four ? 4 : 3}:${m.map((n) => n.tone).join("")}`,
      prompt: four
        ? ta.staccatoVierPrompt
        : ta.staccatoDreiPrompt,
      melody: mel(m.map((n) => ({ ...n, artic: "staccato" as const }))),
      staff: mel(m),
      staffBraille: true,
      octaveSigns: false,
      cells,
      cellLabels: labels,
      cellTones: tones,
      explain: four ? ta.staccatoVierExplain : ta.staccatoDreiExplain,
    };
  }
  if (r < 0.84) {
    const m = randomMotif(3, "viertel", PENTA);
    const vals: NoteValue[] = ["viertel", "viertel", "halbe"];
    const cells: Cell[] = [];
    const labels: string[] = [];
    const tones: (MusicNote | null)[] = [];
    m.forEach((n, i) => {
      const nn = note(n.tone, 4, vals[i]);
      cells.push(noteCell(n.tone, vals[i]));
      labels.push(lbl(nn));
      tones.push(nn);
    });
    cells.push(...FERMATE_CELLS);
    labels.push(ta.fermateErste, ta.fermateZweite);
    tones.push(null, null);
    return {
      kind: "write",
      key: `artic-fermate:${m.map((n) => n.tone).join("")}`,
      prompt: ta.fermatePrompt,
      melody: mel(m.map((n, i) => note(n.tone, 4, vals[i]))),
      staff: mel(m.map((n, i) => note(n.tone, 4, vals[i]))),
      staffBraille: true,
      octaveSigns: false,
      cells,
      cellLabels: labels,
      cellTones: tones,
      explain: ta.fermateExplain,
    };
  }
  const signs = [
    { key: "staccato", cells: ARTIC_CELLS.staccato, label: ta.zeichenStaccato },
    { key: "tenuto", cells: ARTIC_CELLS.tenuto, label: ta.zeichenTenuto },
    { key: "akzent", cells: ARTIC_CELLS.akzent, label: ta.zeichenAkzent },
    { key: "fermate", cells: FERMATE_CELLS, label: ta.zeichenFermate },
  ];
  const target = pick(signs);
  const opts = shuffle(signs);
  return {
    kind: "choice",
    key: `artic-erkennen:${target.key}`,
    prompt: ta.erkennenPrompt,
    showCells: target.cells,
    staff: null,
    choices: opts.map((s) => s.label),
    correctIndex: opts.indexOf(target),
    explain: ta.erkennenExplain(target.label),
  };
}

function kpDynamikTask(style: NameStyle, rhythm: boolean): KlangTask {
  const tx = klangTexte().aufgabenB;
  const td = tx.dynamik;
  const lbl = (ev: MusicEvent) => eventLabel(ev, style, rhythm);
  const r = Math.random();
  if (r < 0.25) {
    const laut = Math.random() < 0.5;
    const m = mel(randomMotif(4, "viertel", PENTA));
    m.dynamik = laut ? { startGain: 1, endGain: 1 } : { startGain: 0.25, endGain: 0.25 };
    return {
      kind: "choice",
      key: `dynb-laut:${laut ? "f" : "p"}`,
      prompt: td.lautPrompt,
      melody: m,
      staff: null,
      choices: td.lautChoices,
      correctIndex: laut ? 0 : 1,
      explain: laut ? td.lautExplainLaut : td.lautExplainLeise,
    };
  }
  if (r < 0.45) {
    const cresc = Math.random() < 0.5;
    const m = mel(randomMotif(5, "viertel", PENTA));
    m.dynamik = cresc ? { startGain: 0.2, endGain: 1 } : { startGain: 1, endGain: 0.2 };
    return {
      kind: "choice",
      key: `dynb-rampe:${cresc ? "cr" : "decr"}`,
      prompt: td.rampePrompt,
      melody: m,
      staff: null,
      choices: td.rampeChoices,
      correctIndex: cresc ? 0 : 1,
      explain: cresc ? td.rampeExplainCresc : td.rampeExplainDecr,
    };
  }
  if (r < 0.62) {
    const tone = pick(PENTA);
    const sym = pick(["f", "p"] as const);
    const nn = note(tone, 4, "viertel");
    return {
      kind: "write",
      key: `dyn-schreiben:${sym}:${tone}`,
      prompt: td.schreibenPrompt(sym, toneName(tone, style)),
      melody: mel([nn]),
      staff: mel([nn]),
      staffBraille: true,
      octaveSigns: false,
      cells: [...DYNAMIC_CELLS[sym], noteCell(tone, "viertel")],
      cellLabels: [td.wortzeichen, sym === "f" ? td.buchstabeF : td.buchstabeP, lbl(nn)],
      cellTones: [null, null, nn],
      explain: td.schreibenExplain,
    };
  }
  if (r < 0.8) {
    const m = randomMotif(3, "viertel", PENTA);
    const dm = mel(m);
    dm.dynamik = { startGain: 0.25, endGain: 1 };
    const cells: Cell[] = [...CRESC_HAIRPIN_START];
    const labels: string[] = [td.gabelAnfang, td.gabelAnfangZweite];
    const tones: (MusicNote | null)[] = [null, null];
    m.forEach((n) => {
      cells.push(noteCell(n.tone, "viertel"));
      labels.push(lbl(n));
      tones.push(n);
    });
    cells.push(...CRESC_HAIRPIN_END);
    labels.push(td.gabelEnde, td.gabelEndeZweite);
    tones.push(null, null);
    return {
      kind: "write",
      key: `dyn-gabel:${m.map((n) => n.tone).join("")}`,
      prompt: td.gabelPrompt,
      melody: dm,
      staff: mel(m),
      staffBraille: true,
      octaveSigns: false,
      cells,
      cellLabels: labels,
      cellTones: tones,
      explain: td.gabelExplain,
    };
  }
  const syms = ["p", "f", "mf", "pp"] as const;
  const target = pick(syms);
  const opts = shuffle([...syms]);
  return {
    kind: "choice",
    key: `dyn-erkennen:${target}`,
    prompt: td.erkennenPrompt,
    showCells: DYNAMIC_CELLS[target],
    staff: null,
    choices: opts.map((s) => DYNAMIC_LABELS[s]),
    correctIndex: opts.indexOf(target),
    explain: td.erkennenExplain(DYNAMIC_LABELS[target]),
  };
}

function kpTempoTask(): KlangTask {
  const tx = klangTexte().aufgabenB;
  const tt = tx.tempo;
  const r = Math.random();
  if (r < 0.3) {
    const speeds = [
      { q: 1.1, label: tt.largo, k: "largo" },
      { q: 0.55, label: tt.andante, k: "andante" },
      { q: 0.3, label: tt.presto, k: "presto" },
    ];
    const idx = Math.floor(Math.random() * 3);
    return {
      kind: "choice",
      key: `tempo-hoeren:${speeds[idx].k}`,
      prompt: tt.hoerenPrompt,
      melody: mel(randomMotif(5, "viertel", PENTA)),
      quarterSeconds: speeds[idx].q,
      staff: null,
      choices: speeds.map((s) => s.label),
      correctIndex: idx,
      explain: tt.hoerenExplain(speeds[idx].label),
    };
  }
  if (r < 0.5) {
    const accel = Math.random() < 0.5;
    const m = mel(randomMotif(6, "viertel", PENTA));
    m.tempoRamp = accel ? { from: 0.9, to: 0.35 } : { from: 0.35, to: 0.9 };
    return {
      kind: "choice",
      key: `tempo-rampe:${accel ? "acc" : "rit"}`,
      prompt: tt.rampePrompt,
      melody: m,
      staff: null,
      choices: tt.rampeChoices,
      correctIndex: accel ? 0 : 1,
      explain: accel ? tt.rampeExplainAcc : tt.rampeExplainRit,
    };
  }
  if (r < 0.7) {
    const q = pick(tt.wissen);
    const opts = shuffle([q.correct, ...q.wrong]);
    return {
      kind: "choice",
      key: "tempo-wissen:Was bedeutet „",
      prompt: q.frage,
      staff: null,
      choices: opts,
      correctIndex: opts.indexOf(q.correct),
      explain: tt.wissenExplain(q.correct),
    };
  }
  if (r < 0.85) {
    const bpm = pick([60, 72, 90, 120]);
    const cells = metronomeCells(bpm);
    return {
      kind: "write",
      key: `metronom-schreiben:${bpm}`,
      prompt: tt.metronomSchreibenPrompt(bpm),
      staff: null,
      cells,
      cellLabels: [
        tt.metronomBezug,
        tt.metronomGleich,
        tt.zahlzeichen,
        ...String(bpm).split("").map((d) => tt.ziffer(d)),
      ],
      cellTones: cells.map(() => null),
      explain: tt.metronomSchreibenExplain(bpm),
    };
  }
  const bpm = pick([60, 90, 120]);
  const choices = [60, 90, 120].map((c) => tt.metronomWahl(c));
  return {
    kind: "choice",
    key: `metronom-lesen:${bpm}`,
    prompt: tt.metronomLesenPrompt,
    showCells: metronomeCells(bpm),
    staff: null,
    choices,
    correctIndex: [60, 90, 120].indexOf(bpm),
    explain: tt.metronomLesenExplain(bpm),
  };
}

function kpVerzierungen1Task(style: NameStyle, rhythm: boolean): KlangTask {
  const tx = klangTexte().aufgabenB;
  const tv = tx.verzierungen;
  const lbl = (ev: MusicEvent) => eventLabel(ev, style, rhythm);
  const r = Math.random();
  const base = note(pick(PENTA), 4, "halbe");
  if (r < 0.3) {
    const verziert = Math.random() < 0.5;
    const orn: OrnamentSign = pick(["vorschlag", "triller"]);
    return {
      kind: "choice",
      key: `orn-obpur:${verziert ? "v" : "p"}`,
      prompt: tv.obPurPrompt,
      melody: mel(verziert ? ornamentToEvents(base, orn) : [base]),
      staff: null,
      choices: tv.obPurChoices,
      correctIndex: verziert ? 0 : 1,
      explain: verziert ? tv.obPurExplainVerziert : tv.obPurExplainPur,
    };
  }
  if (r < 0.55) {
    const triller = Math.random() < 0.5;
    const orn: OrnamentSign = triller ? "triller" : "vorschlag";
    return {
      kind: "choice",
      key: `orn-welche:${orn}`,
      prompt: tv.welchePrompt,
      melody: mel(ornamentToEvents(base, orn)),
      staff: null,
      choices: tv.welcheChoices,
      correctIndex: triller ? 1 : 0,
      explain: triller ? tv.welcheExplainTriller : tv.welcheExplainVorschlag,
    };
  }
  if (r < 0.8) {
    const orn: OrnamentSign = pick(["vorschlag", "vorschlag-lang", "triller"]);
    const nn = note(base.tone, 4, "viertel");
    return {
      kind: "write",
      key: `orn-schreiben:${orn}:${base.tone}`,
      prompt: tv.schreibenPrompt(ORNAMENT_LABELS[orn], toneName(base.tone, style)),
      melody: mel(ornamentToEvents(nn, orn)),
      staff: mel([nn]),
      staffBraille: true,
      octaveSigns: false,
      cells: [...ORNAMENT_CELLS[orn], noteCell(base.tone, "viertel")],
      cellLabels: [...ORNAMENT_CELLS[orn].map((_, i) => (ORNAMENT_CELLS[orn].length > 1 ? tv.zelleN(ORNAMENT_LABELS[orn], i + 1) : tv.zeichenEinzel(ORNAMENT_LABELS[orn]))), lbl(nn)],
      cellTones: [...ORNAMENT_CELLS[orn].map(() => null), nn],
      explain: tv.schreibenExplain,
    };
  }
  const orns: OrnamentSign[] = ["vorschlag", "vorschlag-lang", "triller"];
  const target = pick(orns);
  const opts = shuffle(orns);
  return {
    kind: "choice",
    key: `orn-erkennen:${target}`,
    prompt: tv.erkennenPrompt,
    showCells: ORNAMENT_CELLS[target],
    staff: null,
    choices: opts.map((o) => ORNAMENT_LABELS[o]),
    correctIndex: opts.indexOf(target),
    explain: tv.erkennenExplain(ORNAMENT_LABELS[target]),
  };
}

function kpVerzierungen2Task(style: NameStyle, rhythm: boolean): KlangTask {
  const tx = klangTexte().aufgabenB;
  const tv = tx.verzierungen;
  const lbl = (ev: MusicEvent) => eventLabel(ev, style, rhythm);
  const r = Math.random();
  const base = note(pick(PENTA), 4, "viertel");
  if (r < 0.35) {
    const orn: OrnamentSign = pick(["doppelschlag", "pralltriller", "mordent"]);
    const labels: Record<string, string> = {
      doppelschlag: tv.hoerenDoppelschlag,
      pralltriller: tv.hoerenPralltriller,
      mordent: tv.hoerenMordent,
    };
    const opts = shuffle(["doppelschlag", "pralltriller", "mordent"]);
    return {
      kind: "choice",
      key: `orn2-hoeren:${orn}`,
      prompt: tv.hoerenPrompt,
      melody: mel(ornamentToEvents(base, orn)),
      staff: null,
      choices: opts.map((o) => labels[o]),
      correctIndex: opts.indexOf(orn),
      explain: tv.erkennenExplain(ORNAMENT_LABELS[orn]),
    };
  }
  if (r < 0.6) {
    const orn: OrnamentSign = pick(["doppelschlag", "pralltriller", "mordent"]);
    return {
      kind: "write",
      key: `orn2-schreiben:${orn}:${base.tone}`,
      prompt: tv.zierSchreibenPrompt(ORNAMENT_LABELS[orn], toneName(base.tone, style)),
      melody: mel(ornamentToEvents(base, orn)),
      staff: mel([base]),
      staffBraille: true,
      octaveSigns: false,
      cells: [...ORNAMENT_CELLS[orn], noteCell(base.tone, "viertel")],
      cellLabels: [...ORNAMENT_CELLS[orn].map((_, i) => tv.zelleN(ORNAMENT_LABELS[orn], i + 1)), lbl(base)],
      cellTones: [...ORNAMENT_CELLS[orn].map(() => null), base],
      explain: tv.zierSchreibenExplain,
    };
  }
  if (r < 0.8) {
    const kind3 = pick(["rep8", "rep16"] as const);
    return {
      kind: "write",
      key: `trem-rep:${kind3}:${base.tone}`,
      prompt: tv.tremoloPrompt(kind3 === "rep8", toneName(base.tone, style)),
      melody: mel([note(base.tone, 4, "achtel"), note(base.tone, 4, "achtel"), note(base.tone, 4, "achtel"), note(base.tone, 4, "achtel")]),
      staff: mel([base]),
      staffBraille: true,
      octaveSigns: false,
      cells: [noteCell(base.tone, "viertel"), ...TREMOLO_REP[kind3]],
      cellLabels: [lbl(base), tv.tremoloErste, tv.tremoloZweite],
      cellTones: [base, null, null],
      explain: tv.tremoloExplain,
    };
  }
  const which = pick(["vor", "nach", "zwischen"] as const);
  return {
    kind: "choice",
    key: `orn2-position:${which}`,
    prompt: which === "vor" ? tv.positionPromptVor : which === "nach" ? tv.positionPromptNach : tv.positionPromptZwischen,
    staff: null,
    choices: tv.positionChoices,
    correctIndex: which === "vor" ? 0 : which === "nach" ? 1 : 2,
    explain: which === "vor" ? tv.positionExplainVor : which === "nach" ? tv.positionExplainNach : tv.positionExplainZwischen,
  };
}

function kpAusdruckLiedTask(style: NameStyle, rhythm: boolean): KlangTask {
  const tx = klangTexte().aufgabenB;
  const tl = tx.ausdruckLied;
  const lbl = (ev: MusicEvent) => eventLabel(ev, style, rhythm);
  const song = pick(aktuelleSongs());
  const opening = song.lines[0].filter((e) => e.kind === "note").slice(0, 4) as MusicNote[];
  const r = Math.random();
  if (r < 0.4) {
    const legato = Math.random() < 0.5;
    const artic = legato ? ("tenuto" as const) : ("staccato" as const);
    return {
      kind: "choice",
      key: `lied-artic:${song.id}:${legato ? "geb" : "kurz"}`,
      prompt: tl.artikPrompt(song.title),
      melody: mel(opening.map((n) => ({ ...n, artic }))),
      staff: null,
      choices: tl.artikChoices,
      correctIndex: legato ? 0 : 1,
      explain: legato ? tl.artikExplainLegato : tl.artikExplainStaccato,
    };
  }
  if (r < 0.7) {
    const extra = pick(["dynamik", "staccato", "fermate"] as const);
    const dazuChoices = tl.dazuChoices;
    if (extra === "dynamik") {
      const m = mel(opening);
      m.dynamik = { startGain: 0.25, endGain: 1 };
      return { kind: "choice", key: `lied-dazu:dyn:${song.id}`, prompt: tl.dazuDynPrompt(song.title), melody: m, staff: null, choices: dazuChoices, correctIndex: 0, explain: tl.dazuDynExplain };
    }
    if (extra === "staccato") {
      return { kind: "choice", key: `lied-dazu:stac:${song.id}`, prompt: tl.dazuPrompt(song.title), melody: mel(opening.map((n) => ({ ...n, artic: "staccato" as const }))), staff: null, choices: dazuChoices, correctIndex: 1, explain: tl.dazuStaccatoExplain };
    }
    const held = opening.map((n, i) => (i === opening.length - 1 ? note(n.tone, n.octave, "halbe") : n));
    return { kind: "choice", key: `lied-dazu:ferm:${song.id}`, prompt: tl.dazuPrompt(song.title), melody: mel(held), staff: null, choices: dazuChoices, correctIndex: 2, explain: tl.dazuFermateExplain };
  }
  const sym = pick(["f", "p", "mf"] as const);
  const t = transcribe({ events: opening }, { octaveSigns: true });
  const noteCells: Cell[] = [];
  const noteLabels: string[] = [];
  const noteTones: (MusicNote | null)[] = [];
  for (const e of t.events) {
    e.cells.forEach((c, ci) => {
      noteCells.push(c);
      if (ci === e.coreIndex) {
        noteLabels.push(lbl(e.event));
        noteTones.push(e.event.kind === "note" ? e.event : null);
      } else if (e.octaveSign && ci === e.coreIndex - 1) {
        noteLabels.push(e.event.kind === "note" ? tx.gemeinsam.oktavzeichenDer(OCTAVE_LABELS[e.event.octave]) : tx.gemeinsam.oktavzeichen);
        noteTones.push(null);
      } else {
        noteLabels.push(tx.gemeinsam.zusatzzelle);
        noteTones.push(null);
      }
    });
  }
  const symLabels = sym === "mf" ? [tx.gemeinsam.dasM, tx.gemeinsam.dasF] : [sym === "f" ? tx.gemeinsam.dasF : tx.gemeinsam.dasP];
  return {
    kind: "write",
    key: `lied-dyn-schreiben:${sym}:${song.id}`,
    prompt: tl.schreibenPrompt(song.title, sym),
    melody: mel(opening),
    staff: mel(opening),
    staffBraille: true,
    octaveSigns: true,
    cells: [...DYNAMIC_CELLS[sym], ...noteCells],
    cellLabels: [tx.dynamik.wortzeichen, ...symLabels, ...noteLabels],
    cellTones: [...DYNAMIC_CELLS[sym].map(() => null), ...noteTones],
    explain: tl.schreibenExplain,
  };
}

// --- Welt 5 „Formenbau" (§7) ----------------------------------------------------

function kpBrailleRepeatsTask(style: NameStyle, rhythm: boolean): KlangTask {
  const tx = klangTexte().aufgabenB;
  const tw = tx.wiederholungen;
  const lbl = (ev: MusicEvent) => eventLabel(ev, style, rhythm);
  const r = Math.random();
  const barNotes = randomMotif(2, "viertel", PENTA);
  if (r < 0.35) {
    const times = pick([2, 3, 4]);
    const cells: Cell[] = [...barNotes.map((n) => noteCell(n.tone, "viertel"))];
    for (let i = 1; i < times; i++) cells.push(BLANK, SIMILE_CELL);
    const evs: MusicEvent[] = [];
    for (let i = 0; i < times; i++) {
      if (i) evs.push(bar);
      evs.push(...barNotes);
    }
    return {
      kind: "choice",
      key: `sim-lesen:${times}`,
      prompt: tw.lesenPrompt,
      melody: mel(evs, [2, 4]),
      showCells: cells,
      staff: null,
      choices: tw.lesenChoices,
      correctIndex: times - 2,
      explain: tw.lesenExplain(times),
    };
  }
  if (r < 0.6) {
    const cells: Cell[] = [...barNotes.map((n) => noteCell(n.tone, "viertel")), BLANK, ...countRepeatCells(2)];
    return {
      kind: "write",
      key: `sim-count:${barNotes.map((n) => n.tone).join("")}`,
      prompt: tw.countPrompt,
      melody: mel([...barNotes, bar, ...barNotes, bar, ...barNotes], [2, 4]),
      staff: mel(barNotes, [2, 4]),
      staffBraille: true,
      octaveSigns: false,
      cells,
      cellLabels: [...barNotes.map((n) => lbl(n)), tx.gemeinsam.taktstrich, tw.countSimile, tw.countZahlzeichen, tw.countZwei],
      cellTones: [...barNotes, null, null, null, null],
      explain: tw.countExplain,
    };
  }
  if (r < 0.8) {
    const erlaubt = Math.random() < 0.5;
    return {
      kind: "choice",
      key: `sim-regel:${erlaubt ? "ja" : "nein"}`,
      prompt: erlaubt ? tw.regelPromptErlaubt : tw.regelPromptNein,
      staff: null,
      choices: tw.regelChoices,
      correctIndex: erlaubt ? 0 : 1,
      explain: erlaubt ? tw.regelExplainErlaubt : tw.regelExplainNein,
    };
  }
  return {
    kind: "choice",
    key: "sim-beste",
    prompt: tw.bestePrompt,
    staff: null,
    choices: tw.besteChoices,
    correctIndex: 0,
    explain: tw.besteExplain,
  };
}

function kpVoltenTask(): KlangTask {
  const tx = klangTexte().aufgabenB;
  const to = tx.volten;
  const r = Math.random();
  if (r < 0.35) {
    const dacapo = Math.random() < 0.5;
    const A = randomMotif(2, "viertel", PENTA);
    const B = randomMotif(2, "viertel", PENTA);
    if (dacapo) {
      return {
        kind: "choice",
        key: "volten-order:dacapo",
        prompt: to.dacapoPrompt,
        melody: mel([...A, bar, ...B, bar, ...A]),
        showCells: [...A.map((n) => noteCell(n.tone, "viertel")), BLANK, ...B.map((n) => noteCell(n.tone, "viertel"))],
        staff: null,
        choices: to.reihenfolgeChoices,
        correctIndex: 1,
        explain: to.dacapoExplain,
      };
    }
    const e1 = pick(PENTA);
    const e2 = pick(PENTA);
    return {
      kind: "choice",
      key: "volten-order:volta",
      prompt: to.voltaPrompt,
      melody: mel([...A, note(e1, 4, "viertel"), bar, ...A, note(e2, 4, "viertel")]),
      showCells: [...REPEAT_START, ...A.map((n) => noteCell(n.tone, "viertel")), ...voltaCells(1), noteCell(e1, "viertel"), ...REPEAT_END, ...voltaCells(2), noteCell(e2, "viertel")],
      staff: null,
      choices: to.reihenfolgeChoices,
      correctIndex: 0,
      explain: to.voltaExplain,
    };
  }
  if (r < 0.6) {
    const n = pick([1, 2] as const);
    return {
      kind: "write",
      key: `volta-schreiben:${n}`,
      prompt: to.schreibenPrompt(n),
      staff: null,
      cells: voltaCells(n),
      cellLabels: [to.zahlzeichen, to.tiefeZiffer(n)],
      cellTones: [null, null],
      explain: to.schreibenExplain(n),
    };
  }
  if (r < 0.8) {
    const isSegno = Math.random() < 0.5;
    return {
      kind: "choice",
      key: `segno-coda:${isSegno ? "segno" : "coda"}`,
      prompt: to.segnoCodaPrompt,
      showCells: isSegno ? [SEGNO_CELL] : CODA_CELLS,
      staff: null,
      choices: to.segnoCodaChoices,
      correctIndex: isSegno ? 0 : 1,
      explain: isSegno ? to.segnoExplain : to.codaExplain,
    };
  }
  return {
    kind: "choice",
    key: "dc-wissen",
    prompt: to.dcWissenPrompt,
    staff: null,
    choices: to.dcWissenChoices,
    correctIndex: 0,
    explain: to.dcWissenExplain,
  };
}

function kpFormenTask(): KlangTask {
  const tx = klangTexte().aufgabenB;
  const tf = tx.formen;
  const r = Math.random();
  const A = randomMotif(3, "viertel", PENTA);
  const B = randomMotif(3, "viertel", PENTA);
  const C = randomMotif(3, "viertel", PENTA);
  if (r < 0.3) {
    const wieder = Math.random() < 0.5;
    return {
      kind: "choice",
      key: `form-aba:${wieder ? "aba" : "abc"}`,
      prompt: tf.abaPrompt,
      melody: mel(wieder ? [...A, bar, ...B, bar, ...A] : [...A, bar, ...B, bar, ...C]),
      staff: null,
      choices: tf.abaChoices,
      correctIndex: wieder ? 0 : 1,
      explain: wieder ? tf.abaExplainWieder : tf.abaExplainNein,
    };
  }
  if (r < 0.55) {
    return {
      kind: "choice",
      key: "form-rondo",
      prompt: tf.rondoPrompt,
      melody: mel([...A, bar, ...B, bar, ...A, bar, ...C, bar, ...A]),
      staff: null,
      choices: tf.rondoChoices,
      correctIndex: 1,
      explain: tf.rondoExplain,
    };
  }
  if (r < 0.8) {
    const rhythmChange = Math.random() < 0.5;
    const A2 = rhythmChange
      ? A.map((n, i) => (i === 1 ? note(n.tone, 4, "achtel") : n))
      : A.map((n, i) => (i === 1 ? note(pick(PENTA.filter((x) => x !== n.tone)), 4, "viertel") : n));
    return {
      kind: "choice",
      key: `form-change:${rhythmChange ? "rhythm" : "tonhoehe"}`,
      prompt: tf.changePrompt,
      melody: mel([...A, bar, ...A2]),
      staff: null,
      choices: tf.changeChoices,
      correctIndex: rhythmChange ? 1 : 0,
      explain: rhythmChange ? tf.changeExplainRhythmus : tf.changeExplainTonhoehe,
    };
  }
  const variation = Math.random() < 0.5;
  const A2 = variation ? A.map((n, i) => (i === 2 ? note(pick(PENTA), 4, "achtel") : n)) : [...A];
  return {
    kind: "choice",
    key: `form-variation:${variation ? "var" : "gleich"}`,
    prompt: tf.variationPrompt,
    melody: mel([...A, bar, ...A2]),
    staff: null,
    choices: tf.variationChoices,
    correctIndex: variation ? 1 : 0,
    explain: variation ? tf.variationExplainVar : tf.variationExplainGleich,
  };
}

// --- Stufe 4 — gemeinsame Helfer ------------------------------------------------

/** Intervallnamen mitten im Satz (Sprache der aktuellen Texte). */
const INTERVAL_NAME: Record<number, string> = {
  get 1() { return klangTexte().aufgabenB.intervallName[1]; },
  get 2() { return klangTexte().aufgabenB.intervallName[2]; },
  get 3() { return klangTexte().aufgabenB.intervallName[3]; },
  get 4() { return klangTexte().aufgabenB.intervallName[4]; },
  get 5() { return klangTexte().aufgabenB.intervallName[5]; },
  get 6() { return klangTexte().aufgabenB.intervallName[6]; },
  get 7() { return klangTexte().aufgabenB.intervallName[7]; },
  get 8() { return klangTexte().aufgabenB.intervallName[8]; },
};

/** Die Note `steps` diatonische Stufen ÜBER `low` (0 = gleicher Ton). */
function noteUp(low: MusicNote, steps: number): MusicNote {
  const idx = diatonicIndex(low.tone, low.octave) + steps;
  return note(TONES[((idx % 7) + 7) % 7], Math.floor(idx / 7), low.value);
}

/** Dur-Dreiklang (Grundstellung) auf Wurzeln mit großer Terz (c/f/g). Moll =
 *  die Terz per Be erniedrigt, vermindert = zusätzlich die Quinte. */
function triad(root: MusicNote, quality: "dur" | "moll" | "vermindert" = "dur"): MusicNote[] {
  const third = noteUp(root, 2);
  const fifth = noteUp(root, 4);
  const t = quality === "dur" ? third : { ...third, accidental: "be" as const };
  const f = quality === "vermindert" ? { ...fifth, accidental: "be" as const } : fifth;
  return [root, t, f];
}

/** Events → cells/labels/tones (mit Oktavzeichen) — für Diktate (§4.3). */
function eventsToWrite(
  events: MusicEvent[],
  style: NameStyle,
  rhythm: boolean,
): Pick<WriteTask, "cells" | "cellLabels" | "cellTones"> {
  const tg = klangTexte().aufgabenB.gemeinsam;
  const t = transcribe({ events });
  const cells: Cell[] = [];
  const cellLabels: string[] = [];
  const cellTones: (MusicNote | null)[] = [];
  for (const e of t.events) {
    e.cells.forEach((c, ci) => {
      cells.push(c);
      if (e.event.kind === "bar") {
        cellLabels.push(tg.taktstrich);
        cellTones.push(null);
      } else if (ci === e.coreIndex) {
        cellLabels.push(eventLabel(e.event, style, rhythm));
        cellTones.push(e.event.kind === "note" ? e.event : null);
      } else if (e.octaveSign && ci === e.coreIndex - 1) {
        cellLabels.push(
          e.event.kind === "note"
            ? tg.oktavzeichenDer(OCTAVE_LABELS[e.event.octave])
            : tg.oktavzeichen,
        );
        cellTones.push(null);
      } else if (ci > e.coreIndex) {
        cellLabels.push(tg.verlaengerungspunkt);
        cellTones.push(null);
      } else {
        cellLabels.push(tg.vorzeichen);
        cellTones.push(null);
      }
    });
  }
  return { cells, cellLabels, cellTones };
}

// --- Welt 6 „Zusammenklang" (§8) ------------------------------------------------

const CHORD_ROOTS: ToneName[] = ["c", "f", "g"];

function kpIntervalle1Task(): ChoiceTask {
  const ti = klangTexte().aufgabenB.intervalle;
  // Stufung: A Prim/Quinte/Oktave · B +Terzen · C +Quarte/Sexte.
  const band = pick(["A", "A", "B", "B", "C"] as const);
  const numbers =
    band === "A" ? [1, 5, 8] : band === "B" ? [1, 5, 8, 3] : [1, 3, 4, 5, 6, 8];
  const n = pick(numbers);
  const low = note(pick(["c", "d", "e", "g"] as ToneName[]), 4, "halbe");
  const high = noteUp(low, n - 1);
  const together = band === "C" || Math.random() < 0.4;
  const options = shuffle(numbers).slice(0, Math.min(4, numbers.length));
  if (!options.includes(n)) options[0] = n;
  const choices = shuffle(options);
  const merk =
    n === 3 ? ti.merkTerz :
    n === 4 ? ti.merkQuarte :
    n === 8 ? ti.merkOktave : "";
  return {
    kind: "choice",
    key: `int1:${band}:${n}:${together ? "g" : "n"}`,
    prompt: together
      ? ti.gleichzeitigPrompt
      : ti.nacheinanderPrompt,
    ...(together ? { chord: [low, high] } : { melody: mel([low, high]) }),
    staff: null,
    choices: choices.map((x) => ti.wahlMitStufen(klangTexte().aufgabenB.intervallWahl[x], x)),
    correctIndex: choices.indexOf(n),
    explain: ti.erklaerung(INTERVAL_NAME[n], n, merk),
  };
}

function kpIntervalle2Task(style: NameStyle): KlangTask {
  const tx = klangTexte().aufgabenB;
  const ti = tx.intervalle;
  const r = Math.random();
  const num = pick([2, 3, 4, 5, 6, 8] as IntervalNumber[]);
  const top = note(pick(["g", "a", "f"] as ToneName[]), 4, "halbe");
  const low = intervalBelow(top, num);
  if (r < 0.45) {
    // write: oberste Note + Intervallzeichen abwärts (Diskant-Regel §5-1)
    return {
      kind: "write",
      key: `int2-schreiben:${top.tone}:${num}`,
      prompt: ti.schreibenPrompt(toneName(top.tone, style), INTERVAL_NAME[num]),
      staff: null,
      melody: mel([low, top]),
      cells: [OCTAVE_CELLS[top.octave], noteCell(top.tone, "halbe"), INTERVAL_CELLS[num]],
      cellLabels: [
        tx.gemeinsam.oktavzeichenDer(OCTAVE_LABELS[top.octave]),
        eventLabel(top, style),
        ti.intervallzeichenAbwaerts(INTERVAL_LABELS[num]),
      ],
      cellTones: [null, top, low],
      explain: ti.schreibenExplain(toneName(top.tone, style), INTERVAL_NAME[num], toneName(low.tone, style)),
    };
  }
  if (r < 0.8) {
    // lesen + hören: Braille zeigen, Zweiklang spielen, Intervall benennen
    const opts = shuffle([2, 3, 4, 5, 6, 8] as IntervalNumber[]).filter((x) => x !== num).slice(0, 3);
    const choices = shuffle([num, ...opts]);
    return {
      kind: "choice",
      key: `int2-lesen:${top.tone}:${num}`,
      prompt: ti.lesenPrompt,
      chord: [low, top],
      showCells: [OCTAVE_CELLS[top.octave], noteCell(top.tone, "halbe"), INTERVAL_CELLS[num]],
      staff: null,
      choices: choices.map((x) => tx.intervallWahl[x]),
      correctIndex: choices.indexOf(num),
      explain: ti.lesenExplain(INTERVAL_NAME[num]),
    };
  }
  return {
    kind: "choice",
    key: "int2-regel",
    prompt: ti.regelPrompt,
    staff: null,
    choices: ti.regelChoices,
    correctIndex: 0,
    explain: ti.regelExplain,
  };
}

function kpIntervalle3Task(): ChoiceTask {
  const tx = klangTexte().aufgabenB;
  const ti = tx.intervalle;
  const r = Math.random();
  if (r < 0.5) {
    const num = pick([2, 7, 5] as const); // Sekunde, Septime (Reibung) vs. Quinte
    const up = Math.random() < 0.5;
    const low = note(pick(["c", "d", "e"] as ToneName[]), 4, "halbe");
    const a = up ? low : noteUp(low, num - 1);
    const b = up ? noteUp(low, num - 1) : low;
    const opts = shuffle([2, 5, 7] as number[]);
    return {
      kind: "choice",
      key: `int3-hoeren:${num}:${up ? "auf" : "ab"}`,
      prompt: ti.hoerenPrompt(up),
      melody: mel([a, b]),
      staff: null,
      choices: opts.map((x) => tx.intervallWahl[x]),
      correctIndex: opts.indexOf(num),
      explain: ti.hoerenExplain(INTERVAL_NAME[num]),
    };
  }
  const num = pick([2, 3, 4, 6, 7] as const);
  const low = note("c", 4, "halbe");
  const bigger = num > 5;
  return {
    kind: "choice",
    key: `int3-schaetzen:${num}`,
    prompt: ti.schaetzenPrompt,
    chord: [low, noteUp(low, num - 1)],
    staff: null,
    choices: ti.schaetzenChoices,
    correctIndex: bigger ? 1 : 0,
    explain: ti.schaetzenExplain(INTERVAL_NAME[num], bigger),
  };
}

function kpAkkorde1Task(): ChoiceTask {
  const tk = klangTexte().aufgabenB.akkorde;
  const r = Math.random();
  const root = note(pick(CHORD_ROOTS), 4, "halbe");
  if (r < 0.5) {
    const moll = Math.random() < 0.5;
    return {
      kind: "choice",
      key: `akk1-durmoll:${root.tone}:${moll ? "m" : "d"}`,
      prompt: tk.durMollPrompt,
      chord: triad(root, moll ? "moll" : "dur"),
      staff: null,
      choices: tk.durMollChoices,
      correctIndex: moll ? 1 : 0,
      explain: moll ? tk.durMollExplainMoll : tk.durMollExplainDur,
    };
  }
  if (r < 0.8) {
    const gebrochen = Math.random() < 0.5;
    const notes = triad(root, Math.random() < 0.5 ? "moll" : "dur");
    return {
      kind: "choice",
      key: `akk1-brechung:${gebrochen ? "b" : "g"}`,
      prompt: tk.brechungPrompt,
      ...(gebrochen ? { melody: mel(notes) } : { chord: notes }),
      staff: null,
      choices: tk.brechungChoices,
      correctIndex: gebrochen ? 0 : 1,
      explain: gebrochen ? tk.brechungExplainGebrochen : tk.brechungExplainAkkord,
    };
  }
  const vermindert = Math.random() < 0.5;
  return {
    kind: "choice",
    key: `akk1-vermindert:${vermindert ? "v" : "m"}`,
    prompt: tk.verminderterPrompt,
    chord: triad(root, vermindert ? "vermindert" : "moll"),
    staff: null,
    choices: tk.verminderterChoices,
    correctIndex: vermindert ? 1 : 0,
    explain: vermindert ? tk.verminderterExplainVermindert : tk.verminderterExplainMoll,
  };
}

function kpAkkorde2Task(style: NameStyle): KlangTask {
  const tx = klangTexte().aufgabenB;
  const tk = tx.akkorde;
  const r = Math.random();
  const root = note(pick(CHORD_ROOTS), 4, "halbe");
  const [c1, c2, top] = triad(root); // Grundton, Terz, Quinte
  if (r < 0.55) {
    // write: oberste Note (Quinte) + Terz-Zeichen + Quint-Zeichen abwärts
    return {
      kind: "write",
      key: `akk2-schreiben:${root.tone}`,
      prompt: tk.schreibenPrompt(toneName(root.tone, style), toneName(top.tone, style)),
      staff: null,
      melody: mel([c1, c2, top]),
      cells: [OCTAVE_CELLS[top.octave], noteCell(top.tone, "halbe"), INTERVAL_CELLS[3], INTERVAL_CELLS[5]],
      cellLabels: [
        tx.gemeinsam.oktavzeichenDer(OCTAVE_LABELS[top.octave]),
        eventLabel(top, style),
        tk.terzDarunter(INTERVAL_LABELS[3], toneName(c2.tone, style)),
        tk.quinteDarunter(INTERVAL_LABELS[5], toneName(c1.tone, style)),
      ],
      cellTones: [null, top, c2, c1],
      explain: tk.schreibenExplain(toneName(top.tone, style), toneName(c2.tone, style), toneName(c1.tone, style)),
    };
  }
  if (r < 0.85) {
    const moll = Math.random() < 0.5;
    return {
      kind: "choice",
      key: `akk2-lesen:${root.tone}:${moll ? "m" : "d"}`,
      prompt: tk.lesenPrompt,
      chord: triad(root, moll ? "moll" : "dur"),
      showCells: [OCTAVE_CELLS[top.octave], noteCell(top.tone, "halbe"), INTERVAL_CELLS[3], INTERVAL_CELLS[5]],
      staff: null,
      choices: tk.lesenChoices,
      correctIndex: moll ? 1 : 0,
      explain: moll ? tk.lesenExplainMoll : tk.lesenExplainDur,
    };
  }
  const okt = noteUp(root, 7);
  return {
    kind: "write",
    key: `akk2-oktav:${root.tone}`,
    prompt: tk.oktavPrompt(toneName(top.tone, style)),
    staff: null,
    melody: mel([root, okt]),
    cells: [OCTAVE_CELLS[top.octave], noteCell(top.tone, "halbe"), INTERVAL_CELLS[8]],
    cellLabels: [
      tx.gemeinsam.oktavzeichenDer(OCTAVE_LABELS[top.octave]),
      eventLabel(top, style),
      tk.oktaveDarunter(INTERVAL_LABELS[8]),
    ],
    cellTones: [null, top, root],
    explain: tk.oktavExplain,
  };
}

function kpInAkkordTask(style: NameStyle): KlangTask {
  const tx = klangTexte().aufgabenB;
  const tn = tx.inAccord;
  const r = Math.random();
  const ober = note(pick(["g", "a", "h"] as ToneName[]), 4, "halbe");
  const unter = intervalBelow(ober, 3);
  if (r < 0.35) {
    const obenOben = Math.random() < 0.5;
    return {
      kind: "choice",
      key: `inacc-hoeren:${obenOben ? "o" : "u"}`,
      prompt: tn.hoerenPrompt,
      melody: mel([ober, unter, bar, unter, ober]),
      chord2: [unter, ober],
      staff: null,
      choices: tn.hoerenChoices,
      correctIndex: 0,
      explain: tn.hoerenExplain,
    };
  }
  if (r < 0.7) {
    return {
      kind: "choice",
      key: "inacc-lesen",
      prompt: tn.lesenPrompt,
      chord: [unter, ober],
      showCells: [OCTAVE_CELLS[ober.octave], noteCell(ober.tone, "halbe"), ...IN_ACCORD_CELLS, OCTAVE_CELLS[unter.octave], noteCell(unter.tone, "halbe")],
      staff: null,
      choices: tn.lesenChoices,
      correctIndex: 1,
      explain: tn.lesenExplain,
    };
  }
  return {
    kind: "write",
    key: `inacc-schreiben:${ober.tone}`,
    prompt: tn.schreibenPrompt(toneName(ober.tone, style), toneName(unter.tone, style)),
    staff: null,
    melody: mel([ober, unter]),
    cells: [OCTAVE_CELLS[ober.octave], noteCell(ober.tone, "halbe"), ...IN_ACCORD_CELLS, OCTAVE_CELLS[unter.octave], noteCell(unter.tone, "halbe")],
    cellLabels: [
      tx.gemeinsam.oktavzeichenDer(OCTAVE_LABELS[ober.octave]),
      eventLabel(ober, style),
      tn.zeichenErste,
      tn.zeichenZweite,
      tx.gemeinsam.oktavzeichenDer(OCTAVE_LABELS[unter.octave]),
      eventLabel(unter, style),
    ],
    cellTones: [null, ober, null, null, null, unter],
    explain: tn.schreibenExplain,
  };
}

// --- Welt 7 „Theorie-Spielplatz" (§9) -------------------------------------------

const MAJOR_STEPS = [0, 2, 4, 5, 7, 9, 11, 12]; // Dur-Halbtöne
const MINOR_STEPS = [0, 2, 3, 5, 7, 8, 10, 12]; // natürliches Moll

/** Eine Tonleiter (do=c) als klingende Achtel — über Halbton-Muster + Vorzeichen. */
function scaleMelody(steps: number[]): Melody {
  // Auf C aufgebaut; wo ein Halbton vom Dur abweicht, setzt readCell kein Zeichen
  // — wir kodieren die Erniedrigung mit Be, damit es hörbar Moll wird.
  const events: MusicNote[] = steps.map((semi, i) => {
    const majorSemi = MAJOR_STEPS[i];
    const base = noteUp(note("c", 4, "achtel"), i); // diatonische Stufe
    if (semi === majorSemi - 1) return { ...base, accidental: "be" as const };
    return base;
  });
  return mel(events);
}

function kpTonleiternTask(style: NameStyle): KlangTask {
  const t = klangTexte().aufgabenC;
  const r = Math.random();
  if (r < 0.25) {
    return {
      kind: "play",
      key: "tonleiter-play",
      prompt: t.tonleitern.spielNach,
      melody: mel(["c", "d", "e", "f", "g", "a", "h"].map((t) => note(t as ToneName, 4, "achtel")).concat(note("c", 5, "achtel"))),
      explain: t.tonleitern.spielNachErkl,
    };
  }
  if (r < 0.55) {
    const moll = Math.random() < 0.5;
    return {
      kind: "choice",
      key: `tonleiter-durmoll:${moll ? "m" : "d"}`,
      prompt: t.tonleitern.durMollFrage,
      melody: scaleMelody(moll ? MINOR_STEPS : MAJOR_STEPS),
      staff: null,
      choices: t.tonleitern.durMollWahl,
      correctIndex: moll ? 1 : 0,
      explain: moll ? t.tonleitern.durMollErklMoll : t.tonleitern.durMollErklDur,
    };
  }
  if (r < 0.8) {
    const wrong = 2 + Math.floor(Math.random() * 5); // Stufe 3–7
    const events = MAJOR_STEPS.map((_, i) => note(noteUp(note("c", 4, "achtel"), i).tone, noteUp(note("c", 4, "achtel"), i).octave, "achtel"));
    events[wrong] = { ...events[wrong], accidental: "kreuz" };
    return {
      kind: "choice",
      key: `tonleiter-fehler:${wrong}`,
      prompt: t.tonleitern.fehlerFrage,
      melody: mel(events),
      staff: null,
      choices: t.tonleitern.fehlerWahl,
      correctIndex: wrong - 2,
      explain: t.tonleitern.fehlerErkl(wrong + 1),
    };
  }
  // write: G-Dur-Tonleiter mit Kreuz vor dem f
  const notes: MusicNote[] = ["g", "a", "h", "c", "d", "e", "f"].map((t, i) =>
    note(t as ToneName, i < 3 ? 4 : 5, "achtel", t === "f" ? { accidental: "kreuz" } : {}),
  );
  const w = eventsToWrite(notes, style, false);
  return {
    kind: "write",
    key: "tonleiter-gdur",
    prompt: t.tonleitern.schreibe,
    staff: null,
    ...w,
    explain: t.tonleitern.schreibeErkl,
  };
}

function kpQuintenzirkelTask(): ChoiceTask {
  const t = klangTexte().aufgabenC;
  const r = Math.random();
  const acc = pick(["kreuz", "be"] as const);
  const n = 1 + Math.floor(Math.random() * 4);
  const name = KEY_NAMES[acc][n - 1];
  const accName = t.quintenzirkel.vz[acc].ein;
  const accPlural = t.quintenzirkel.vz[acc].mehr;
  if (r < 0.35) {
    const opts = shuffle([1, 2, 3, 4]);
    return {
      kind: "choice",
      key: `qz-anzahl:${acc}:${n}`,
      prompt: t.quintenzirkel.anzahlFrage(name, accPlural),
      staff: null,
      choices: opts.map((x) => `${x}`),
      correctIndex: opts.indexOf(n),
      explain: t.quintenzirkel.anzahlErkl(name, n, n === 1 ? accName : accPlural),
    };
  }
  if (r < 0.7) {
    const wrong = shuffle(KEY_NAMES[acc].filter((x) => x !== name)).slice(0, 3);
    const choices = shuffle([name, ...wrong]);
    return {
      kind: "choice",
      key: `qz-name:${acc}:${n}`,
      prompt: t.quintenzirkel.nameFrage(n, n === 1 ? accName : accPlural),
      staff: null,
      choices,
      correctIndex: choices.indexOf(name),
      explain: t.quintenzirkel.nameErkl(n, n === 1 ? accName : accPlural, name),
    };
  }
  const wrong = shuffle(KEY_NAMES[acc].filter((x) => x !== name)).slice(0, 3);
  const choices = shuffle([name, ...wrong]);
  return {
    kind: "choice",
    key: `qz-lesen:${acc}:${n}`,
    prompt: t.quintenzirkel.lesenFrage,
    showCells: keySignatureCells(n, acc),
    staff: null,
    choices,
    correctIndex: choices.indexOf(name),
    explain: t.quintenzirkel.lesenErkl(name),
  };
}

function kpRhythmusdiktatTask(style: NameStyle, rhythm: boolean): KlangTask {
  const t = klangTexte().aufgabenC;
  const band = pick(["A", "A", "B", "B", "C"] as const);
  // Ein 4/4-Takt auf konstanter Tonhöhe g; Werte je Stufe.
  const values: NoteValue[] =
    band === "A" ? ["viertel", "halbe"] : band === "B" ? ["viertel", "halbe", "achtel"] : ["viertel", "halbe", "achtel"];
  const events: MusicNote[] = [];
  let beatsLeft = 4;
  while (beatsLeft > 0.001) {
    const choicesV = values.filter((v) => beats(note("g", 4, v)) <= beatsLeft + 1e-9);
    const v = pick(choicesV.length ? choicesV : (["viertel"] as NoteValue[]));
    events.push(note("g", 4, v));
    beatsLeft -= beats(note("g", 4, v));
  }
  // UMKEHRUNG (vom Blatt klopfen): Rhythmus in Braille zeigen → mit Leertaste
  // klopfen. NUR wenn eine Achtel dabei ist: die Klopf-Wertung unterscheidet
  // kurz/lang relativ — ein Takt nur aus Vierteln/Halben (Band A) wäre als
  // „alles lang" nie richtig klopfbar (unlösbare Endlos-Aufgabe).
  if (Math.random() < 0.3 && events.some((e) => beats(e) <= 0.5)) {
    return {
      kind: "tap",
      key: `rdiktat-blatt:${events.map((e) => e.value[0]).join("")}`,
      prompt: t.rhythmusdiktat.blattFrage,
      melody: mel(events, [4, 4]),
      pattern: [...events.map((e) => (beats(e) <= 0.5 ? "kurz" : "lang") as "kurz" | "lang"), "lang"],
    };
  }
  const w = eventsToWrite(events, style, rhythm);
  return {
    kind: "write",
    key: `rdiktat:${band}:${events.map((e) => e.value[0]).join("")}`,
    prompt: t.rhythmusdiktat.diktatFrage(rhythm),
    staff: null,
    dictation: true,
    melody: mel(events, [4, 4]),
    ...w,
    explain: t.rhythmusdiktat.diktatErkl,
  };
}

function kpMelodiediktatTask(style: NameStyle): WriteTask {
  const t = klangTexte().aufgabenC;
  const band = pick(["A", "A", "B", "B", "C", "D"] as const);
  const start = note(pick(["g", "e", "a"] as ToneName[]), 4, "viertel");
  const len = band === "A" ? 3 : band === "B" ? 4 : 5;
  const events: MusicNote[] = [start];
  for (let i = 1; i < len; i++) {
    const step = band === "A" || band === "B" ? pick([1, -1]) : pick([-2, -1, 1, 2]);
    events.push(noteUp(events[i - 1], step));
  }
  const w = eventsToWrite(events, style, false);
  return {
    kind: "write",
    key: `mdiktat:${band}:${events.map((e) => e.tone).join("")}`,
    prompt: t.melodiediktat.frage(toneName(start.tone, style), len),
    staff: null,
    dictation: true,
    melody: mel(events),
    ...w,
    explain: t.melodiediktat.erkl,
  };
}

function kpDetektivTask(): ChoiceTask {
  const t = klangTexte().aufgabenC;
  const notes = randomMotif(4 + Math.floor(Math.random() * 2), "viertel", PENTA);
  const altIndex = Math.random() < 0.25 ? -1 : Math.floor(Math.random() * notes.length);
  const played = notes.map((n, i) =>
    i === altIndex ? noteUp(n, pick([2, -2])) : n,
  );
  const choices = [...notes.map((_, i) => t.detektiv.note(i + 1)), t.detektiv.allesRichtig];
  return {
    kind: "choice",
    key: `detektiv:${altIndex}`,
    prompt: t.detektiv.frage,
    melody: mel(played),
    showCells: transcribeFlat({ events: notes }),
    staff: null,
    staffBraille: true,
    choices,
    correctIndex: altIndex === -1 ? notes.length : altIndex,
    explain: altIndex === -1 ? t.detektiv.erklRichtig : t.detektiv.erklAnders(altIndex + 1),
  };
}

function kpBaumeisterTask(): BuildTask {
  const t = klangTexte().aufgabenC;
  const r = Math.random();
  if (r < 0.4) {
    return {
      kind: "build",
      key: "build-34",
      prompt: t.baumeister.dreiViertel,
      timeSig: [3, 4],
    };
  }
  if (r < 0.75) {
    const withRest = Math.random() < 0.5;
    return {
      kind: "build",
      key: `build-44-${withRest ? "pause" : "noten"}`,
      prompt: withRest
        ? t.baumeister.mitPause
        : t.baumeister.mitNoten,
      timeSig: [4, 4],
      constraints: withRest ? { mustInclude: "rest" } : { minNotes: 3 },
    };
  }
  return {
    kind: "build",
    key: "build-68",
    prompt: t.baumeister.sechsAchtel,
    timeSig: [6, 8],
  };
}

function kpSpielwieseTask(): PlayTask {
  return {
    kind: "play",
    key: "spielwiese",
    free: true,
    bordun: true,
    targetTaps: 30,
    prompt: klangTexte().aufgabenC.spielwiese.frage,
    melody: mel([]),
  };
}

function kpKadenzenTask(): ChoiceTask {
  const t = klangTexte().aufgabenC;
  const r = Math.random();
  const I = triad(note("c", 4, "halbe"));
  const IV = triad(note("f", 4, "halbe"));
  const V = triad(note("g", 4, "halbe"));
  if (r < 0.4) {
    const offen = Math.random() < 0.5;
    return {
      kind: "choice",
      key: `kadenz-schluss:${offen ? "offen" : "zu"}`,
      prompt: t.kadenzen.schlussFrage,
      chord: offen ? I : V,
      chord2: offen ? V : I,
      staff: null,
      choices: t.kadenzen.schlussWahl,
      correctIndex: offen ? 1 : 0,
      explain: offen ? t.kadenzen.schlussErklOffen : t.kadenzen.schlussErklZu,
    };
  }
  if (r < 0.75) {
    const plagal = Math.random() < 0.5;
    return {
      kind: "choice",
      key: `kadenz-art:${plagal ? "plagal" : "auth"}`,
      prompt: t.kadenzen.artFrage,
      chord: plagal ? IV : V,
      chord2: I,
      staff: null,
      choices: t.kadenzen.artWahl,
      correctIndex: plagal ? 1 : 0,
      explain: plagal ? t.kadenzen.artErklPlagal : t.kadenzen.artErklAuth,
    };
  }
  const which = pick([
    { c: I, n: t.kadenzen.funktionErkl[0], i: 0 },
    { c: IV, n: t.kadenzen.funktionErkl[1], i: 1 },
    { c: V, n: t.kadenzen.funktionErkl[2], i: 2 },
  ] as const);
  const choices = t.kadenzen.funktionWahl;
  return {
    kind: "choice",
    key: `kadenz-stufe:${which.i}`,
    prompt: t.kadenzen.funktionFrage,
    chord: which.c,
    staff: null,
    choices,
    correctIndex: which.i,
    explain: which.n,
  };
}

function kpKomponierTask(): SandboxTask {
  return {
    kind: "sandbox",
    key: "komponier",
    prompt: klangTexte().aufgabenC.komponier.frage,
  };
}

// --- Welt 8 „Instrumentenkunde" (§10, Stufe 5) ----------------------------------

const FINGERS = [1, 2, 3, 4, 5] as const;

function kpFingersatzTask(style: NameStyle): KlangTask {
  const t = klangTexte().aufgabenC;
  const r = Math.random();
  const tone = pick(PENTA);
  const finger = pick(FINGERS);
  if (r < 0.45) {
    const opts = shuffle([...FINGERS]);
    return {
      kind: "choice",
      key: `finger-lesen:${finger}`,
      prompt: t.fingersatz.lesenFrage,
      melody: mel([note(tone, 4, "viertel")]),
      showCells: [noteCell(tone, "viertel"), FINGER_CELLS[finger]],
      staff: null,
      choices: opts.map((f) => FINGER_LABELS[f]),
      correctIndex: opts.indexOf(finger),
      explain: t.fingersatz.lesenErkl(FINGER_LABELS[finger]),
    };
  }
  if (r < 0.8) {
    const nn = note(tone, 4, "viertel");
    return {
      kind: "write",
      key: `finger-schreiben:${tone}:${finger}`,
      prompt: t.fingersatz.schreibenFrage(toneName(tone, style), FINGER_LABELS[finger]),
      melody: mel([nn]),
      staff: mel([nn]),
      staffBraille: true,
      cells: [noteCell(tone, "viertel"), FINGER_CELLS[finger]],
      cellLabels: [eventLabel(nn, style), t.fingersatz.fingerZelle(FINGER_LABELS[finger])],
      cellTones: [nn, null],
      explain: t.fingersatz.schreibenErkl(FINGER_LABELS[finger]),
    };
  }
  return {
    kind: "choice",
    key: "finger-position",
    prompt: t.fingersatz.positionFrage,
    staff: null,
    choices: t.fingersatz.positionWahl,
    correctIndex: 0,
    explain: t.fingersatz.positionErkl,
  };
}

function kpKlavierTask(style: NameStyle): KlangTask {
  const t = klangTexte().aufgabenC;
  const r = Math.random();
  if (r < 0.3) {
    // Zweizeilige Klavier-Ansicht (GrandStaff): rechte Hand (Melodie, oben,
    // Violinschlüssel) + linke Hand (Begleitung, unten, Bassschlüssel). Die Frage
    // ist aus dem Notenbild lesbar; Alt+Q isoliert eine Hand (groß + einzeln hören).
    const rhLen = pick([3, 4] as const);
    const rh = mel(randomMotif(rhLen, "viertel", ["e", "f", "g", "a", "h"] as ToneName[]));
    const lhLen = pick([2, 3] as const);
    const lhValue: NoteValue = lhLen === 2 ? "halbe" : "viertel";
    const lh = mel(
      Array.from({ length: lhLen }, () => note(pick(["c", "e", "g"] as ToneName[]), 3, lhValue)),
    );
    const options = [2, 3, 4];
    return {
      kind: "choice",
      key: `klavier-zwei:${lhLen}`,
      prompt:
        // Am Mac „Wahl + Q" (18.10.2026).
        altAnzeige(t.klavier.zweiFrage),
      staff: rh,
      staff2: lh,
      melody: rh,
      melody2: lh,
      choices: options.map((n) => t.klavier.zweiWahl(n)),
      correctIndex: options.indexOf(lhLen),
      explain:
        altAnzeige(t.klavier.zweiErkl),
    };
  }
  if (r < 0.5) {
    const links = Math.random() < 0.5;
    const tone = pick(["c", "e", "g"] as ToneName[]);
    const oct = links ? 3 : 4;
    return {
      kind: "choice",
      key: `klavier-hand:${links ? "l" : "r"}`,
      prompt: t.klavier.handFrage,
      showCells: [...(links ? HAND_CELLS.l : HAND_CELLS.r), OCTAVE_CELLS[oct], noteCell(tone, "viertel")],
      staff: null,
      choices: t.klavier.handWahl,
      correctIndex: links ? 1 : 0,
      explain: links
        ? t.klavier.handErklLinks
        : t.klavier.handErklRechts,
    };
  }
  if (r < 0.7) {
    // RH-Melodie (höher) und LH-Begleitung (tiefer) nacheinander; welche war die Melodie?
    const rhFirst = Math.random() < 0.5;
    const rh = mel(randomMotif(4, "viertel", ["e", "g", "a"] as ToneName[]));
    const lhNotes = [note("c", 3, "halbe"), note("g", 3, "halbe")];
    const lh = mel(lhNotes);
    return {
      kind: "choice",
      key: `klavier-melodie:${rhFirst ? "rh1" : "lh1"}`,
      prompt: t.klavier.melodieFrage,
      melody: rhFirst ? rh : lh,
      melody2: rhFirst ? lh : rh,
      staff: null,
      choices: t.klavier.melodieWahl,
      correctIndex: rhFirst ? 0 : 1,
      explain: t.klavier.melodieErkl,
    };
  }
  if (r < 0.86) {
    const tone = pick(["c", "e", "g"] as ToneName[]);
    const nn = note(tone, 4, "viertel");
    return {
      kind: "write",
      key: `klavier-rh:${tone}`,
      prompt: t.klavier.rechteHandFrage(toneName(tone, style)),
      staff: null,
      melody: mel([nn]),
      cells: [...HAND_CELLS.r, OCTAVE_CELLS[4], noteCell(tone, "viertel")],
      cellLabels: [
        t.klavier.rechteHandZellen[0],
        t.klavier.rechteHandZellen[1],
        t.zellen.oktavzeichenDer(OCTAVE_LABELS[4]),
        eventLabel(nn, style),
      ],
      cellTones: [null, null, null, nn],
      explain: t.klavier.rechteHandErkl,
    };
  }
  const nieder = Math.random() < 0.5;
  return {
    kind: "choice",
    key: `klavier-pedal:${nieder ? "ab" : "auf"}`,
    prompt: t.klavier.pedalFrage,
    showCells: nieder ? PEDAL_DOWN_CELLS : PEDAL_UP_CELLS,
    staff: null,
    choices: t.klavier.pedalWahl,
    correctIndex: nieder ? 0 : 1,
    explain: nieder
      ? t.klavier.pedalErklNieder
      : t.klavier.pedalErklAuf,
  };
}

function kpGesangTask(style: NameStyle): KlangTask {
  const t = klangTexte().aufgabenC;
  const r = Math.random();
  if (r < 0.35) {
    // Melisma: eine Silbe bekommt mehrere Töne — wie viele?
    const n = pick([2, 3]);
    const start = note(pick(["e", "g", "a"] as ToneName[]), 4, "achtel");
    const events = [start, ...Array.from({ length: n - 1 }, (_, i) => noteUp(start, i + 1 <= 1 ? 1 : -1))];
    return {
      kind: "choice",
      key: `gesang-melisma:${n}`,
      prompt: t.gesang.melismaFrage,
      melody: mel(events),
      staff: null,
      choices: t.gesang.melismaWahl,
      correctIndex: n - 1,
      explain: t.gesang.melismaErkl(n),
    };
  }
  if (r < 0.65) {
    const a = note(pick(["e", "g"] as ToneName[]), 4, "viertel");
    const b = noteUp(a, 1);
    return {
      kind: "write",
      key: `gesang-silbenbogen:${a.tone}`,
      prompt: t.gesang.bogenFrage,
      staff: null,
      melody: mel([{ ...a, artic: "tenuto" }, { ...b, artic: "tenuto" }]),
      cells: [OCTAVE_CELLS[4], noteCell(a.tone, "viertel"), SYLLABLE_SLUR_CELL, noteCell(b.tone, "viertel")],
      cellLabels: [
        t.zellen.oktavzeichenDer(OCTAVE_LABELS[4]),
        eventLabel(a, style),
        t.gesang.bogenZelle,
        eventLabel(b, style),
      ],
      cellTones: [null, a, null, b],
      explain: t.gesang.bogenErkl,
    };
  }
  if (r < 0.85) {
    const notes = randomMotif(3, "viertel", ["e", "g", "a"] as ToneName[]);
    return {
      kind: "choice",
      key: "gesang-atem",
      prompt: t.gesang.atemFrage,
      showCells: [
        OCTAVE_CELLS[4],
        noteCell(notes[0].tone, "viertel"),
        ...BREATH_HALF_CELLS,
        noteCell(notes[1].tone, "viertel"),
        noteCell(notes[2].tone, "viertel"),
      ],
      staff: null,
      choices: t.gesang.atemWahl,
      correctIndex: 0,
      explain: t.gesang.atemErkl,
    };
  }
  return {
    kind: "choice",
    key: "gesang-zeilen",
    prompt: t.gesang.zeilenFrage,
    showCells: LYRIC_LINE_PREFIX,
    staff: null,
    choices: t.gesang.zeilenWahl,
    correctIndex: 0,
    explain: t.gesang.zeilenErkl,
  };
}

function kpGitarreTask(style: NameStyle): KlangTask {
  const t = klangTexte().aufgabenC;
  const r = Math.random();
  if (r < 0.35) {
    const saite = pick([1, 2, 3, 4, 5, 6]);
    const opts = shuffle([1, 2, 3, 4, 5, 6]).slice(0, 4);
    if (!opts.includes(saite)) opts[0] = saite;
    const choices = shuffle(opts);
    return {
      kind: "choice",
      key: `gitarre-saite:${saite}`,
      prompt: t.gitarre.saiteFrage,
      showCells: stringCells(saite),
      staff: null,
      choices: choices.map((s) => t.gitarre.saiteWahl(s)),
      correctIndex: choices.indexOf(saite),
      explain: t.gitarre.saiteErkl(saite),
    };
  }
  if (r < 0.65) {
    const saite = pick([3, 4, 5]);
    const tone = pick(["c", "e", "g"] as ToneName[]);
    const nn = note(tone, 4, "viertel");
    return {
      kind: "write",
      key: `gitarre-schreiben:${saite}:${tone}`,
      prompt: t.gitarre.schreibenFrage(saite, toneName(tone, style)),
      staff: null,
      melody: mel([nn]),
      cells: [...stringCells(saite), noteCell(tone, "viertel")],
      cellLabels: [
        t.gitarre.saitenzeichenZelle,
        t.gitarre.ziffernZelle(saite),
        eventLabel(nn, style),
      ],
      cellTones: [null, null, nn],
      explain: t.gitarre.schreibenErkl,
    };
  }
  // Akkordsymbol hören + zuordnen (international: Dur / Moll / Septakkord).
  const which = pick([
    { k: "dur", label: t.gitarre.akkordSorten.dur, notes: triad(note("c", 4, "halbe"), "dur"), sym: null },
    { k: "moll", label: t.gitarre.akkordSorten.moll, notes: triad(note("c", 4, "halbe"), "moll"), sym: null },
    { k: "sept", label: t.gitarre.akkordSorten.sept, notes: [...triad(note("c", 4, "halbe"), "dur"), note("h", 4, "halbe", { accidental: "be" })], sym: CHORD_SYMBOL_CELLS.sept },
  ] as const);
  const opts = shuffle([t.gitarre.akkordSorten.dur, t.gitarre.akkordSorten.moll, t.gitarre.akkordSorten.sept]);
  return {
    kind: "choice",
    key: `gitarre-akkordsym:${which.k}`,
    prompt: t.gitarre.akkordFrage,
    melody: mel(which.notes as MusicNote[]),
    staff: null,
    choices: opts,
    correctIndex: opts.indexOf(which.label),
    explain: t.gitarre.akkordErkl(which.label),
  };
}

function kpGeneralbassTask(style: NameStyle): KlangTask {
  const t = klangTexte().aufgabenC;
  const r = Math.random();
  const bass = note("c", 4, "halbe");
  if (r < 0.4) {
    const sext = Math.random() < 0.5;
    // 6/3 (Sextakkord: Terz + Sexte über dem Bass) vs. 5/3 (Grundakkord).
    const aussetzung = sext ? [bass, noteUp(bass, 2), noteUp(bass, 5)] : [bass, noteUp(bass, 2), noteUp(bass, 4)];
    return {
      kind: "choice",
      key: `gb-aussetzung:${sext ? "6" : "5"}`,
      prompt: t.generalbass.aussetzungFrage,
      chord: aussetzung,
      showCells: [OCTAVE_CELLS[4], noteCell("c", "halbe"), ...figuredBassCells([sext ? 6 : 5])],
      staff: null,
      choices: t.generalbass.aussetzungWahl,
      correctIndex: sext ? 0 : 1,
      explain: sext ? t.generalbass.aussetzungErklSext : t.generalbass.aussetzungErklQuint,
    };
  }
  if (r < 0.7) {
    const stufe = pick([
      { c: triad(note("c", 4, "halbe")), n: t.generalbass.stufeErkl[0], i: 0 },
      { c: triad(note("f", 4, "halbe")), n: t.generalbass.stufeErkl[1], i: 1 },
      { c: triad(note("g", 4, "halbe")), n: t.generalbass.stufeErkl[2], i: 2 },
    ] as const);
    return {
      kind: "choice",
      key: `gb-stufe:${stufe.i}`,
      prompt: t.generalbass.stufeFrage,
      chord: stufe.c,
      staff: null,
      choices: t.generalbass.stufeWahl,
      correctIndex: stufe.i,
      explain: stufe.n,
    };
  }
  return {
    kind: "write",
    key: "gb-schreiben",
    prompt: t.generalbass.schreibenFrage,
    staff: null,
    melody: mel([bass]),
    cells: [OCTAVE_CELLS[4], noteCell("c", "halbe"), ...figuredBassCells([6])],
    cellLabels: [
      t.zellen.oktavzeichenDer(OCTAVE_LABELS[4]),
      eventLabel(bass, style),
      t.generalbass.zahlzeichenZelle,
      t.generalbass.ziffer6Zelle,
    ],
    cellTones: [null, bass, null, null],
    explain: t.generalbass.schreibenErkl,
  };
}

function kpPartiturTask(): ChoiceTask {
  const t = klangTexte().aufgabenC;
  const q = pick([
    {
      key: "auftakt",
      prompt: t.partitur.auftakt.frage,
      choices: t.partitur.auftakt.wahl,
      correct: 0,
      explain: t.partitur.auftakt.erkl,
      showCells: measureNumberCells(0),
    },
    {
      key: "taktzahl",
      prompt: t.partitur.taktzahl.frage,
      choices: t.partitur.taktzahl.wahl,
      correct: 0,
      explain: t.partitur.taktzahl.erkl,
      showCells: measureNumberCells(16),
    },
    {
      key: "format",
      prompt: t.partitur.format.frage,
      choices: t.partitur.format.wahl,
      correct: 0,
      explain: t.partitur.format.erkl,
      showCells: undefined,
    },
    {
      key: "quellen",
      prompt: t.partitur.quellen.frage,
      choices: t.partitur.quellen.wahl,
      correct: 0,
      explain: t.partitur.quellen.erkl,
      showCells: undefined,
    },
  ] as const);
  return {
    kind: "choice",
    key: `partitur:${q.key}`,
    prompt: q.prompt,
    ...(q.showCells ? { showCells: [...q.showCells] } : {}),
    staff: null,
    choices: [...q.choices],
    correctIndex: q.correct,
    explain: q.explain,
  };
}

/** Die Familie je Instrument (Text erst beim Lesen, damit die Sprache gilt). */
const FAMILY_INSTRUMENT: { inst: Instrument; saiten: boolean; readonly family: string }[] = [
  { inst: "klavier", saiten: true, get family() { return klangTexte().aufgabenC.orchester.familieKlavier; } },
  { inst: "gitarre", saiten: true, get family() { return klangTexte().aufgabenC.orchester.familieGitarre; } },
  { inst: "sax", saiten: false, get family() { return klangTexte().aufgabenC.orchester.familieBlas; } },
  { inst: "floete", saiten: false, get family() { return klangTexte().aufgabenC.orchester.familieBlas; } },
];

function kpOrchesterTask(): ChoiceTask {
  const t = klangTexte().aufgabenC;
  const r = Math.random();
  if (r < 0.55) {
    const target = pick(FAMILY_INSTRUMENT);
    const notes = randomMotif(3, "viertel", PENTA);
    return {
      kind: "choice",
      key: `orch-hoeren:${target.inst}`,
      prompt: t.orchester.hoerenFrage,
      melody: mel(notes),
      instrument: target.inst,
      staff: null,
      choices: t.orchester.hoerenWahl,
      correctIndex: target.saiten ? 0 : 1,
      explain: t.orchester.hoerenErkl(INSTRUMENT_LABELS[target.inst], target.family),
    };
  }
  const q = pick(t.orchester.fragen);
  const opts = shuffle([q.richtig, ...q.falsch]);
  return {
    kind: "choice",
    key: "orch-familie:Zu welcher F", // wie bisher: die ersten 12 Zeichen der deutschen Frage
    prompt: q.frage,
    staff: null,
    choices: opts,
    correctIndex: opts.indexOf(q.richtig),
    explain: t.orchester.familieErkl(q.richtig),
  };
}

// --- Welt 9 „Lieder-Bühne" — Ausbau (§11, Stufe 5) ------------------------------

const ausdruckSongs = () => aktuelleSongs().filter((s) => s.shelf === "ausdruck");
const buehneSongs = () => aktuelleSongs().filter((s) => s.shelf !== "ausdruck");

function kpLieder2Task(style: NameStyle, rhythm: boolean): KlangTask {
  const t = klangTexte().aufgabenC;
  const song = pick(ausdruckSongs());
  const lineIdx = Math.floor(Math.random() * song.lines.length);
  const line = song.lines[lineIdx];
  const r = Math.random();
  if (r < 0.4) {
    // Ausdrucks-Diktat: trocken vs. mit Ausdruck — was kam dazu?
    const opening = line.filter((e) => e.kind === "note").slice(0, 4) as MusicNote[];
    const extra = pick(["dynamik", "staccato", "legato"] as const);
    const dazu = t.lieder2.dazuWahl;
    if (extra === "dynamik") {
      const m = mel(opening);
      m.dynamik = { startGain: 0.25, endGain: 1 };
      return { kind: "choice", key: `lieder2-dazu:dyn:${song.id}`, prompt: t.lieder2.dazuDynamikFrage(song.title), melody: mel(opening), melody2: m, staff: null, choices: dazu, correctIndex: 0, explain: t.lieder2.dazuDynamikErkl };
    }
    if (extra === "staccato") {
      return { kind: "choice", key: `lieder2-dazu:stac:${song.id}`, prompt: t.lieder2.dazuStaccatoFrage(song.title), melody: mel(opening), melody2: mel(opening.map((n) => ({ ...n, artic: "staccato" as const }))), staff: null, choices: dazu, correctIndex: 1, explain: t.lieder2.dazuStaccatoErkl };
    }
    return { kind: "choice", key: `lieder2-dazu:leg:${song.id}`, prompt: t.lieder2.dazuLegatoFrage(song.title), melody: mel(opening), melody2: mel(opening.map((n) => ({ ...n, artic: "tenuto" as const }))), staff: null, choices: dazu, correctIndex: 2, explain: t.lieder2.dazuLegatoErkl };
  }
  if (r < 0.65) {
    const opening = line.filter((e) => e.kind === "note").slice(0, 4) as MusicNote[];
    const legato = Math.random() < 0.5;
    return {
      kind: "choice",
      key: `lieder2-artic:${song.id}:${legato ? "leg" : "stac"}`,
      prompt: t.lieder2.articFrage(song.title),
      melody: mel(opening.map((n) => ({ ...n, artic: legato ? ("tenuto" as const) : ("staccato" as const) }))),
      staff: null,
      choices: t.lieder2.articWahl,
      correctIndex: legato ? 0 : 1,
      explain: legato ? t.lieder2.articErklLegato : t.lieder2.articErklStaccato,
    };
  }
  // Zeile schreiben (lesen → schreiben), MIT Oktavzeichen — wie in der Werkstatt.
  return songLineTask(song.title, lineIdx, line, song.timeSig, style, rhythm);
}

function kpLesekonzertTask(): PlayTask {
  // A = 2–3 Töne gleicher Wert · B = 4–5 Töne · C = + gemischte Werte.
  const band = pick(["A", "A", "B", "B", "C"] as const);
  const len = band === "A" ? 2 + Math.floor(Math.random() * 2) : band === "B" ? 4 + Math.floor(Math.random() * 2) : 4 + Math.floor(Math.random() * 2);
  const events: MusicNote[] = [];
  let cur = note(pick(["c", "e", "g"] as ToneName[]), 4, "viertel");
  for (let i = 0; i < len; i++) {
    const value: NoteValue = band === "C" ? pick(["viertel", "halbe", "achtel"] as NoteValue[]) : "viertel";
    events.push(note(cur.tone, cur.octave, value));
    cur = noteUp(cur, pick([-2, -1, 1, 2]));
  }
  return {
    kind: "play",
    key: `lesekonzert:${band}:${events.map((e) => e.tone).join("")}`,
    prompt: klangTexte().aufgabenC.lesekonzert.frage,
    melody: mel(events),
    readFirst: transcribeFlat({ events }),
    explain: klangTexte().aufgabenC.lesekonzert.erkl,
  };
}

function kpLiederquizTask(): ChoiceTask {
  const t = klangTexte().aufgabenC;
  const song = pick(buehneSongs());
  const opening = song.lines[0];
  const wrong = shuffle(buehneSongs().filter((s) => s.id !== song.id)).slice(0, 3);
  const choices = shuffle([song, ...wrong]).map((s) => s.title);
  const hoeren = Math.random() < 0.5;
  if (hoeren) {
    return {
      kind: "choice",
      key: `quiz-hoeren:${song.id}`,
      prompt: t.liederquiz.hoerenFrage,
      melody: { events: opening, ...(song.timeSig ? { timeSig: song.timeSig } : {}) },
      staff: null,
      choices,
      correctIndex: choices.indexOf(song.title),
      explain: t.liederquiz.hoerenErkl(song.title),
    };
  }
  return {
    kind: "choice",
    key: `quiz-lesen:${song.id}`,
    prompt: t.liederquiz.lesenFrage,
    showCells: transcribeFlat({ events: opening, ...(song.timeSig ? { timeSig: song.timeSig } : {}) }, { octaveSigns: true }),
    staff: null,
    choices,
    correctIndex: choices.indexOf(song.title),
    explain: t.liederquiz.lesenErkl(song.title),
  };
}

/**
 * Wiederholte Anleitungen kürzen (Johannes 10.07.2026): kommt innerhalb einer
 * Kapitel-Runde exakt dieselbe Anleitung noch einmal („Eine kleine Tonleiter.
 * Geht sie rauf oder runter?"), spricht die App nur noch die eigentliche Frage
 * („Geht sie rauf oder runter?"). Gekürzt wird NUR die Ansage — der sichtbare
 * Aufgabentext bleibt vollständig, und Alt+W wiederholt immer die volle Fassung.
 *
 * Gibt null zurück, wenn es nichts sicher zu kürzen gibt. Gekürzt wird nur bei
 * Frage-Prompts (…?), und die Schnittstelle muss hinter einem echten Wort
 * liegen (nicht hinter „3." o. Ä.), damit Ordnungszahlen im Fragesatz nie
 * zerschnitten werden.
 */
export function shortPromptForRepeat(prompt: string): string | null {
  const p = prompt.trim();
  if (!p.endsWith("?")) return null;
  // Letzte sichere Satzgrenze: Wort (≥2 Buchstaben) + „." oder „!" + Leerraum,
  // gefolgt von einem Großbuchstaben.
  const re = /[A-Za-zÄÖÜäöüß]{2,}[.!]\s+(?=[A-ZÄÖÜ])/g;
  let cut = -1;
  let m: RegExpExecArray | null;
  while ((m = re.exec(p))) cut = m.index + m[0].length;
  if (cut <= 0) return null;
  const rest = p.slice(cut).trim();
  return rest.length >= 5 ? rest : null;
}

/** Aufgabe für alle Kapitel außer der Lieder-Werkstatt ziehen (kp14 macht der
 *  Runner über songLineTask). */
export function nextKlangTask(etappeId: string, style: NameStyle, rhythm = false): KlangTask {
  switch (etappeId) {
    case "kp1": return kp1Task();
    case "kp2": return kp2Task();
    case "kp3": return kp3Task(style);
    case "kp4": return kp4Task(style);
    case "kp5": return kp5Task(style);
    case "kp6": return kp6Task(style);
    case "kp7": return kp7Task(style);
    case "kp8": return kp8Task(style);
    case "kp9": return kp9Task(style);
    case "kp10": return kp10Task(style);
    case "kp11": return kp11Task(style);
    case "kp12": return kp12Task();
    case "kp-haltebogen": return kpHaltebogenTask(style);
    case "kp-auftakt": return kpAuftaktTask(style);
    case "kp-pausen2": return kpPausen2Task();
    case "kp-tonart": return kpTonartTask();
    case "kp-taktwechsel": return kpTaktwechselTask();
    case "kp-schluessel": return kpSchluesselTask();
    case "kp-sechzehntel": return kpSechzehntelTask(style);
    case "kp-triolen": return kpTriolenTask(style);
    // Stufe 3 — Welt 1 (Ausbau)
    case "kp-puls": return kpPulsTask();
    case "kp-lauschen-dauer": return kpLauschenDauerTask();
    case "kp-lauschen-dynamik": return kpLauschenDynamikTask();
    case "kp-instrumente": return kpInstrumenteTask();
    case "kp-echo": return kpEchoTask();
    case "kp-melodie-memory": return kpMelodieMemoryTask();
    // Stufe 3 — Welt 4 (Ausdruck)
    case "kp-bindebogen": return kpBindebogenTask(style, rhythm);
    case "kp-artikulation": return kpArtikulationTask(style, rhythm);
    case "kp-dynamik": return kpDynamikTask(style, rhythm);
    case "kp-tempo": return kpTempoTask();
    case "kp-verzierungen1": return kpVerzierungen1Task(style, rhythm);
    case "kp-verzierungen2": return kpVerzierungen2Task(style, rhythm);
    case "kp-ausdruck-lied": return kpAusdruckLiedTask(style, rhythm);
    // Stufe 3 — Welt 5 (Formenbau)
    case "kp-braillerepeats": return kpBrailleRepeatsTask(style, rhythm);
    case "kp-volten": return kpVoltenTask();
    case "kp-formen": return kpFormenTask();
    // Stufe 4 — Welt 6 (Zusammenklang)
    case "kp-intervalle1": return kpIntervalle1Task();
    case "kp-intervalle2": return kpIntervalle2Task(style);
    case "kp-intervalle3": return kpIntervalle3Task();
    case "kp-akkorde1": return kpAkkorde1Task();
    case "kp-akkorde2": return kpAkkorde2Task(style);
    case "kp-inakkord": return kpInAkkordTask(style);
    // Stufe 4 — Welt 7 (Theorie-Spielplatz)
    case "kp-tonleitern": return kpTonleiternTask(style);
    case "kp-quintenzirkel": return kpQuintenzirkelTask();
    case "kp-rhythmusdiktat": return kpRhythmusdiktatTask(style, rhythm);
    case "kp-melodiediktat": return kpMelodiediktatTask(style);
    case "kp-detektiv": return kpDetektivTask();
    case "kp-baumeister": return kpBaumeisterTask();
    case "kp-spielwiese": return kpSpielwieseTask();
    case "kp-kadenzen": return kpKadenzenTask();
    case "kp-komponier": return kpKomponierTask();
    // Stufe 5 — Welt 8 (Instrumentenkunde)
    case "kp-fingersatz": return kpFingersatzTask(style);
    case "kp-klavier": return kpKlavierTask(style);
    case "kp-gesang": return kpGesangTask(style);
    case "kp-gitarre": return kpGitarreTask(style);
    case "kp-generalbass": return kpGeneralbassTask(style);
    case "kp-partitur": return kpPartiturTask();
    case "kp-orchester": return kpOrchesterTask();
    // Stufe 5 — Welt 9 (Lieder-Bühne, Ausbau)
    case "kp-lieder2": return kpLieder2Task(style, rhythm);
    case "kp-lesekonzert": return kpLesekonzertTask();
    case "kp-liederquiz": return kpLiederquizTask();
    default: return kp13Task();
  }
}

/** Lied-Zeile → Write-Task (MIT Oktavzeichen — ab hier können sie es). */
export function songLineTask(
  title: string,
  lineIndex: number,
  events: MusicEvent[],
  timeSig: [number, number] | undefined,
  style: NameStyle,
  rhythm = false,
): WriteTask {
  // Geschrieben wird nur die Zeile selbst (ohne Taktangabe-Präfix — die steht
  // im Notenbild); transcribe liefert das Präfix ohnehin getrennt.
  const tx = klangTexte().aufgabenC;
  const t = transcribe({ events });
  const cells: Cell[] = [];
  const cellLabels: string[] = [];
  const cellTones: (MusicNote | null)[] = [];
  for (const e of t.events) {
    e.cells.forEach((c, ci) => {
      cells.push(c);
      if (e.event.kind === "bar") {
        cellLabels.push(tx.zellen.taktstrich);
        cellTones.push(null);
      } else if (ci === e.coreIndex) {
        cellLabels.push(eventLabel(e.event, style, rhythm));
        cellTones.push(e.event.kind === "note" ? e.event : null);
      } else if (e.octaveSign && ci === e.coreIndex - 1) {
        cellLabels.push(
          e.event.kind === "note"
            ? tx.zellen.oktavzeichenDer(OCTAVE_LABELS[e.event.octave])
            : tx.zellen.oktavzeichen,
        );
        cellTones.push(null);
      } else if (ci > e.coreIndex) {
        cellLabels.push(tx.zellen.verlaengerungspunkt);
        cellTones.push(null);
      } else {
        cellLabels.push(tx.zellen.vorzeichen);
        cellTones.push(null);
      }
    });
  }
  return {
    kind: "write",
    key: `song:${title}:${lineIndex}`,
    prompt: tx.liedZeile.frage(title, lineIndex + 1),
    melody: { events, ...(timeSig ? { timeSig } : {}) },
    staff: { events, ...(timeSig ? { timeSig } : {}) },
    staffBraille: true,
    octaveSigns: true,
    cells,
    cellLabels,
    cellTones,
  };
}

// --- Zeichenliste-Auflösung (Alt+L / „Meine Tasten") ------------------------------

/** Unit-Schlüssel („n:c:viertel", „r:ganze", „oct:4", „acc:kreuz", „dot",
 *  „sig:4/4", „sim", „rep-start", „rep-end", „final", „tie", „tri", „hyphen",
 *  „mrest:4", „key:2:kreuz", „csig", „acsig", „clef:violin") → Zellen. */
export function klangUnitCells(key: string): Cell[] | null {
  const [kind, a, b] = key.split(":");
  switch (kind) {
    case "n":
      return [noteCell(a as ToneName, b as NoteValue)];
    case "r":
      return [REST_CELLS[a as NoteValue]];
    case "oct":
      return [OCTAVE_CELLS[Number(a)]];
    case "acc":
      return [ACCIDENTAL_CELLS[a as keyof typeof ACCIDENTAL_CELLS]];
    case "dot":
      return [DOT3_CELL];
    case "sig": {
      const [top, bottom] = a.split("/").map(Number);
      return timeSigCells([top, bottom]);
    }
    case "sim":
      return [SIMILE_CELL];
    case "rep-start":
      return REPEAT_START;
    case "rep-end":
      return REPEAT_END;
    case "final":
      return FINAL_BAR;
    case "tie":
      return TIE_CELLS;
    case "tri":
      return [TRIPLET_CELL];
    case "hyphen":
      return [MUSIC_HYPHEN_CELL];
    case "mrest":
      return multiRestCells(Number(a));
    case "key":
      return keySignatureCells(Number(a), b as "kreuz" | "be");
    case "csig":
      return COMMON_TIME_CELLS;
    case "acsig":
      return ALLA_BREVE_CELLS;
    case "clef":
      return CLEF_CELLS[a as ClefName] ?? null;
    // --- Stufe-3-Zeichen (Welt 4/5) ---
    case "slur":
      return [SLUR_CELL];
    case "slur-bracket":
      return SLUR_BRACKET_OPEN;
    case "art":
      return ARTIC_CELLS[a as keyof typeof ARTIC_CELLS] ?? null;
    case "fermate":
      return FERMATE_CELLS;
    case "dyn":
      if (a === "cr") return CRESC_HAIRPIN_START;
      if (a === "decr") return DECR_HAIRPIN_START;
      return DYNAMIC_CELLS[a as keyof typeof DYNAMIC_CELLS] ?? null;
    case "metronom":
      return metronomeCells(90);
    case "orn":
      return ORNAMENT_CELLS[a as OrnamentSign] ?? null;
    case "trem":
      if (a === "alt8") return TREMOLO_ALT.alt8;
      return TREMOLO_REP[a as keyof typeof TREMOLO_REP] ?? null;
    case "volta":
      return voltaCells(Number(a) as 1 | 2);
    case "segno":
      return [SEGNO_CELL];
    case "coda":
      return CODA_CELLS;
    case "count-rep":
      return countRepeatCells(2);
    // --- Stufe-4-Zeichen (Welt 6 „Zusammenklang") ---
    case "int": {
      const c = INTERVAL_CELLS[Number(a) as IntervalNumber];
      return c ? [c] : null;
    }
    case "inacc":
      return IN_ACCORD_CELLS;
    case "inacc-teil":
      return a === "teilung" ? MEASURE_DIVISION_CELLS : PART_IN_ACCORD_CELLS;
    case "moving":
      return [MOVING_NOTE_CELL];
    // --- Stufe-5-Zeichen (Welt 8 „Instrumentenkunde") ---
    case "finger": {
      const n = Number(a) as 1 | 2 | 3 | 4 | 5;
      return FINGER_CELLS[n] ? [FINGER_CELLS[n]] : null;
    }
    case "hand":
      return HAND_CELLS[a as "r" | "l"] ?? null;
    case "pedal":
      return a === "auf" ? PEDAL_UP_CELLS : PEDAL_DOWN_CELLS;
    case "vocal":
      if (a === "atem-halb") return BREATH_HALF_CELLS;
      if (a === "atem-voll") return BREATH_FULL_CELLS;
      if (a === "silben2") return [SYLLABLES_2_CELL];
      return [SYLLABLE_SLUR_CELL];
    case "string":
      return stringCells(Number(a));
    case "fret":
      return fretCells(Number(a) as IntervalNumber | 7);
    case "barre":
      return [a === "halb" ? BARRE_HALF_CELL : BARRE_FULL_CELL];
    case "chordsym":
      return CHORD_SYMBOL_CELLS[a as keyof typeof CHORD_SYMBOL_CELLS] ?? null;
    case "gb":
      return FIGURED_BASS_PREFIX;
    case "taktnr":
      return measureNumberCells(Number(a));
    default:
      return null;
  }
}

// --- Die 14 Etappen ------------------------------------------------------------------

const GATE = { minAcc: MASTERY_ACC, minAttempts: MASTERY_MIN_ATTEMPTS, patience: 0 };

/** Texte eines Kapitels in der aktuellen Sprache (erst beim Lesen geholt). */
type KapitelText = { titel: string; introDu: string; introSie: string; einheiten: Record<string, string> };
const kapitelText = (id: string): KapitelText =>
  (klangTexte().kapitel.kap as unknown as Record<string, KapitelText>)[id];

/** Gesprochene Beschriftung einer Einheit: Ton-und-Wert-Einheiten (`n:c:achtel`) aus Ton- und Wertnamen, sonst aus den Kapiteltexten. */
function einheitText(id: string, key: string): string {
  const m = /^n:([a-z]):([a-z]+)$/.exec(key);
  if (m) {
    const k = klangTexte().kapitel;
    return k.noteSatz(toneName(m[1] as ToneName, standardNameStyle()), k.noteWert[m[2] as NoteValue]);
  }
  return kapitelText(id).einheiten[key];
}

/**
 * Kompakter Etappen-Bauer (levelId = eigene id - es gibt kein Wortpool-Level).
 * Titel, Einführungen und Einheiten-Beschriftungen sind `get`-Eigenschaften: Sie
 * fragen erst beim Lesen die aktuelle Sprache (KLANG_ETAPPEN ist eine Module-Konstante).
 */
function kp(id: string, unitKeys: string[]): Etappe {
  return {
    id,
    levelId: id,
    system: "basis",
    get title() {
      return kapitelText(id).titel;
    },
    get introducedUnits() {
      return unitKeys.map((key) => ({
        key,
        get spoken() {
          return einheitText(id, key);
        },
      }));
    },
    get introDu() {
      return kapitelText(id).introDu;
    },
    get introSie() {
      return kapitelText(id).introSie;
    },
    legend: "",
    items: () => [],
    masteryGate: GATE,
  };
}

const noteKeys = (value: NoteValue) => TONES.map((t) => `n:${t}:${value}`);

/* Die Reihenfolge der Einträge ist der Lernpfad-Bestand: kp1-kp14 sind der
 * eingefrorene Ur-Lernpfad (Tests pinnen den Präfix); neue Kapitel IMMER ans
 * Array-Ende. Die didaktische REIHENFOLGE regeln die Klangwelten (welten.ts).
 * Die Texte jedes Kapitels stehen in texte/<sprache>/kapitel.ts. */
export const KLANG_ETAPPEN: Etappe[] = [
  kp("kp1", []),
  kp("kp2", []),
  kp("kp3", [...noteKeys("achtel")]),
  kp("kp4", []),
  kp("kp5", [...noteKeys("viertel")]),
  kp("kp6", [...noteKeys("halbe"), ...noteKeys("ganze")]),
  kp("kp7", ["r:ganze", "r:halbe", "r:viertel", "r:achtel", "sig:4/4", "sig:3/4"]),
  kp("kp8", ["dot"]),
  kp("kp9", ["acc:kreuz", "acc:be", "acc:aufloesung"]),
  kp("kp10", ["oct:3", "oct:4", "oct:5"]),
  kp("kp11", []),
  kp("kp12", []),
  kp("kp13", ["sim", "rep-start", "rep-end", "final"]),
  kp("kp14", []),
  kp("kp-haltebogen", ["tie"]),
  kp("kp-auftakt", ["hyphen"]),
  kp("kp-pausen2", ["mrest:4"]),
  kp("kp-tonart", ["key:2:kreuz", "key:2:be", "key:4:kreuz"]),
  kp("kp-taktwechsel", ["csig", "acsig"]),
  kp("kp-schluessel", ["clef:violin", "clef:bass", "clef:alt"]),
  kp("kp-sechzehntel", [...noteKeys("sechzehntel")]),
  kp("kp-triolen", ["tri"]),
  kp("kp-puls", []),
  kp("kp-lauschen-dauer", []),
  kp("kp-lauschen-dynamik", []),
  kp("kp-instrumente", []),
  kp("kp-echo", []),
  kp("kp-melodie-memory", []),
  kp("kp-bindebogen", ["slur", "slur-bracket"]),
  kp("kp-artikulation", ["art:staccato", "art:tenuto", "art:akzent", "fermate"]),
  kp("kp-dynamik", ["dyn:p", "dyn:f", "dyn:mf", "dyn:pp", "dyn:ff", "dyn:cr", "dyn:decr"]),
  kp("kp-tempo", ["metronom"]),
  kp("kp-verzierungen1", ["orn:vorschlag", "orn:vorschlag-lang", "orn:triller"]),
  kp("kp-verzierungen2", ["orn:doppelschlag", "orn:pralltriller", "orn:mordent", "trem:rep8", "trem:alt8"]),
  kp("kp-ausdruck-lied", []),
  kp("kp-braillerepeats", ["count-rep"]),
  kp("kp-volten", ["volta:1", "volta:2", "segno", "coda"]),
  kp("kp-formen", []),
  kp("kp-intervalle1", []),
  kp("kp-intervalle2", ["int:2", "int:3", "int:4", "int:5", "int:6", "int:7", "int:8"]),
  kp("kp-intervalle3", []),
  kp("kp-akkorde1", []),
  kp("kp-akkorde2", []),
  kp("kp-inakkord", ["inacc", "inacc-teil"]),
  kp("kp-tonleitern", []),
  kp("kp-quintenzirkel", []),
  kp("kp-rhythmusdiktat", []),
  kp("kp-melodiediktat", []),
  kp("kp-detektiv", []),
  kp("kp-baumeister", []),
  kp("kp-spielwiese", []),
  kp("kp-kadenzen", []),
  kp("kp-komponier", []),
  kp("kp-fingersatz", ["finger:1", "finger:2", "finger:3", "finger:4", "finger:5"]),
  kp("kp-klavier", ["hand:r", "hand:l", "pedal:ab", "pedal:auf"]),
  kp("kp-gesang", ["vocal:silbenbogen", "vocal:atem-halb", "vocal:atem-voll", "vocal:silben2"]),
  kp("kp-gitarre", ["string:3", "fret:5", "fret:7", "barre:voll", "chordsym:sept"]),
  kp("kp-generalbass", ["gb"]),
  kp("kp-partitur", ["taktnr:1"]),
  kp("kp-orchester", []),
  kp("kp-lieder2", []),
  kp("kp-lesekonzert", []),
  kp("kp-liederquiz", []),
];

export const KLANG_ETAPPEN_IDS = KLANG_ETAPPEN.map((e) => e.id);
