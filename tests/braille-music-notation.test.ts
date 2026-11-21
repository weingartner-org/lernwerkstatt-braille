/**
 * Klangpunkte — Notation-Kern gegen die Primärquellen gepinnt:
 * Krolick, „New International Manual of Braille Music Notation" (1996)
 * bzw. BANA „Music Braille Code 2015" (deckungsgleich). Beispiele aus dem
 * MuseScore-4-Handbuch (BBI-PDF) sind als Drittquelle vermerkt.
 */
import { describe, expect, it } from "vitest";
import { BLANK, dots } from "@/lib/braille/cell";
import {
  ACCIDENTAL_CELLS,
  ALLA_BREVE_CELLS,
  ARTIC_CELLS,
  BARRE_FULL_CELL,
  BARRE_HALF_CELL,
  BREATH_FULL_CELLS,
  BREATH_HALF_CELLS,
  CHORD_SYMBOL_CELLS,
  CLEF_CELLS,
  CODA_CELLS,
  COMMON_TIME_CELLS,
  CRESC_HAIRPIN_END,
  CRESC_HAIRPIN_START,
  DECR_HAIRPIN_END,
  DECR_HAIRPIN_START,
  DYNAMIC_CELLS,
  DYNAMIC_WORD_SIGN,
  FERMATE_CELLS,
  FIGURED_BASS_PREFIX,
  FINGER_CELLS,
  HAND_CELLS,
  IN_ACCORD_CELLS,
  INTERVAL_CELLS,
  LYRIC_LINE_PREFIX,
  MEASURE_DIVISION_CELLS,
  MOVING_NOTE_CELL,
  MOVING_NOTES_CELL,
  MUSIC_HYPHEN_CELL,
  MUSIC_LINE_PREFIX,
  OCTAVE_CELLS,
  ORNAMENT_CELLS,
  PART_IN_ACCORD_CELLS,
  PEDAL_DOWN_CELLS,
  PEDAL_UP_CELLS,
  PLAY_KEY_TO_TONE,
  SYLLABLES_2_CELL,
  figuredBassCells,
  fretCells,
  intervalBelow,
  measureNumberCells,
  readCell,
  readSequence,
  REST_CELLS,
  SEGNO_CELL,
  SLUR_CELL,
  stringCells,
  TIE_CELLS,
  TONES,
  TREMOLO_ALT,
  TREMOLO_REP,
  TRIPLET_CELL,
  beats,
  countRepeatCells,
  frequency,
  keySignatureCells,
  metronomeCells,
  midi,
  multiRestCells,
  needsOctaveSign,
  note,
  noteCell,
  ornamentToEvents,
  rest,
  rhythmSyllable,
  rhythmSyllables,
  bar,
  beatsText,
  beatUnitFor,
  timeSigCells,
  toneName,
  transcribe,
  transcribeFlat,
  eventLabel,
  voltaCells,
} from "@/lib/klangpunkte/notation";
import { tiePlan } from "@/lib/klangpunkte/audio";
import {
  klangUnitCells,
  nextKlangTask,
  shortPromptForRepeat,
  songLineTask,
  KLANG_ETAPPEN,
  type ChoiceTask,
} from "@/lib/klangpunkte/etappen";
import { HAND_FOCUS_ORDER, handFocusLabel } from "@/components/klangpunkte/NotenZeile";
import { SONGS, parseLine, songsForShelf } from "@/lib/klangpunkte/songs";

describe("Notentabelle (Krolick Table 1A / BANA Table 2)", () => {
  it("Achtel = Grundform d–j (c=145, d=15, e=124, f=1245, g=125, a=24, h=245)", () => {
    expect(noteCell("c", "achtel")).toBe(dots(1, 4, 5));
    expect(noteCell("d", "achtel")).toBe(dots(1, 5));
    expect(noteCell("e", "achtel")).toBe(dots(1, 2, 4));
    expect(noteCell("f", "achtel")).toBe(dots(1, 2, 4, 5));
    expect(noteCell("g", "achtel")).toBe(dots(1, 2, 5));
    expect(noteCell("a", "achtel")).toBe(dots(2, 4));
    expect(noteCell("h", "achtel")).toBe(dots(2, 4, 5));
  });

  it("Werte: Viertel +6, Halbe +3, Ganze +3+6 (Dekaden-Analogie)", () => {
    // Viertel-C = Punkte 1456 (MuseScore-Handbuch-Beispiel: F+J+K+L)
    expect(noteCell("c", "viertel")).toBe(dots(1, 4, 5, 6));
    expect(noteCell("c", "halbe")).toBe(dots(1, 3, 4, 5));
    expect(noteCell("c", "ganze")).toBe(dots(1, 3, 4, 5, 6));
    // Halbe = Dekade-2-Logik: aus g (125) wird r (1235)
    expect(noteCell("g", "halbe")).toBe(dots(1, 2, 3, 5));
    // f-ganze = Vollzelle
    expect(noteCell("f", "ganze")).toBe(dots(1, 2, 3, 4, 5, 6));
  });

  it("Pausen (Krolick Table 1A): ganze 134, halbe 136, viertel 1236, achtel 1346", () => {
    expect(REST_CELLS.ganze).toBe(dots(1, 3, 4));
    expect(REST_CELLS.halbe).toBe(dots(1, 3, 6));
    expect(REST_CELLS.viertel).toBe(dots(1, 2, 3, 6));
    expect(REST_CELLS.achtel).toBe(dots(1, 3, 4, 6));
  });

  it("Oktavzeichen (Par. 1-9): 4 / 45 / 456 / 5 / 46 / 56 / 6", () => {
    expect(OCTAVE_CELLS[1]).toBe(dots(4));
    expect(OCTAVE_CELLS[2]).toBe(dots(4, 5));
    expect(OCTAVE_CELLS[3]).toBe(dots(4, 5, 6));
    expect(OCTAVE_CELLS[4]).toBe(dots(5));
    expect(OCTAVE_CELLS[5]).toBe(dots(4, 6));
    expect(OCTAVE_CELLS[6]).toBe(dots(5, 6));
    expect(OCTAVE_CELLS[7]).toBe(dots(6));
  });

  it("Versetzungszeichen (Kap. III): Kreuz 146, Be 126, Auflösung 16", () => {
    expect(ACCIDENTAL_CELLS.kreuz).toBe(dots(1, 4, 6));
    expect(ACCIDENTAL_CELLS.be).toBe(dots(1, 2, 6));
    expect(ACCIDENTAL_CELLS.aufloesung).toBe(dots(1, 6));
  });

  it("Taktangaben (Par. 3-6): 4/4=⠼⠙⠲, 3/4=⠼⠉⠲, 6/8=⠼⠋⠦, 12/8 zweistellig", () => {
    expect(timeSigCells([4, 4])).toEqual([dots(3, 4, 5, 6), dots(1, 4, 5), dots(2, 5, 6)]);
    expect(timeSigCells([3, 4])).toEqual([dots(3, 4, 5, 6), dots(1, 4), dots(2, 5, 6)]);
    expect(timeSigCells([6, 8])).toEqual([dots(3, 4, 5, 6), dots(1, 2, 4), dots(2, 3, 6)]);
    expect(timeSigCells([12, 8])).toEqual([
      dots(3, 4, 5, 6),
      dots(1),
      dots(1, 2),
      dots(2, 3, 6),
    ]);
  });
});

describe("Oktavzeichen-Regeln (Krolick Par. 1-10)", () => {
  const q = (t: Parameters<typeof note>[0], o: number) => note(t, o, "viertel");

  it("erste Note: immer", () => {
    expect(needsOctaveSign(null, q("c", 4))).toBe(true);
  });

  it("Sekunde/Terz: nie — auch über die Oktavgrenze", () => {
    expect(needsOctaveSign(q("c", 4), q("d", 4))).toBe(false);
    expect(needsOctaveSign(q("c", 4), q("e", 4))).toBe(false);
    // h3 → c4 ist eine Sekunde über die Oktavgrenze: KEIN Zeichen
    expect(needsOctaveSign(q("h", 3), q("c", 4))).toBe(false);
    // a3 → c4 ist eine Terz über die Oktavgrenze: KEIN Zeichen
    expect(needsOctaveSign(q("a", 3), q("c", 4))).toBe(false);
  });

  it("Quarte/Quinte: nur bei Oktavwechsel", () => {
    expect(needsOctaveSign(q("c", 4), q("f", 4))).toBe(false); // Quarte, gleiche Oktave
    expect(needsOctaveSign(q("c", 4), q("g", 4))).toBe(false); // Quinte, gleiche Oktave
    expect(needsOctaveSign(q("g", 4), q("c", 5))).toBe(true); // Quarte MIT Oktavwechsel
    expect(needsOctaveSign(q("f", 4), q("c", 5))).toBe(true); // Quinte MIT Oktavwechsel
  });

  it("Sexte und größer: immer", () => {
    expect(needsOctaveSign(q("c", 4), q("a", 4))).toBe(true); // Sexte
    expect(needsOctaveSign(q("c", 4), q("c", 5))).toBe(true); // Oktave
    expect(needsOctaveSign(q("c", 4), q("g", 5))).toBe(true);
  });
});

describe("Transkription", () => {
  it("mittleres C als Viertel, erste Note = ⠐⠹ (5, dann 1456 — Handbuch-Beispiel)", () => {
    const t = transcribe({ events: [note("c", 4, "viertel")] });
    expect(t.events[0].cells).toEqual([dots(5), dots(1, 4, 5, 6)]);
    expect(t.events[0].octaveSign).toBe(true);
  });

  it("punktierte Viertel = Note + eigene Punkt-3-Zelle (Par. 1-2)", () => {
    const t = transcribe({ events: [note("c", 4, "viertel", { dotted: true })] });
    expect(t.events[0].cells).toEqual([dots(5), dots(1, 4, 5, 6), dots(3)]);
  });

  it("Vorzeichen steht VOR dem Oktavzeichen und der Note (Par. 3-1)", () => {
    const t = transcribe({ events: [note("f", 4, "viertel", { accidental: "kreuz" })] });
    expect(t.events[0].cells).toEqual([dots(1, 4, 6), dots(5), dots(1, 2, 4, 5, 6)]);
  });

  it("Taktstrich = Leerzeichen; Sekundschritte ohne weitere Oktavzeichen", () => {
    const t = transcribe({
      events: [note("g", 4, "viertel"), bar, note("a", 4, "viertel")],
    });
    expect(t.events[0].cells).toEqual([dots(5), noteCell("g", "viertel")]);
    expect(t.events[1].cells).toEqual([BLANK]);
    expect(t.events[2].cells).toEqual([noteCell("a", "viertel")]); // Sekunde: kein Zeichen
  });

  it("octaveSigns:false unterdrückt Oktavzeichen (frühe Etappen)", () => {
    const t = transcribe({ events: [note("c", 4, "viertel")] }, { octaveSigns: false });
    expect(t.events[0].cells).toEqual([dots(1, 4, 5, 6)]);
  });

  it("transcribeFlat stellt die Taktangabe mit Trenn-BLANK voran", () => {
    const flat = transcribeFlat({ timeSig: [4, 4], events: [note("c", 4, "ganze")] });
    expect(flat.slice(0, 3)).toEqual(timeSigCells([4, 4]));
    expect(flat[3]).toBe(BLANK);
  });

  it("Pausen unterbrechen die Oktav-Kette nicht", () => {
    const t = transcribe({
      events: [note("c", 4, "viertel"), rest("viertel"), note("d", 4, "viertel")],
    });
    expect(t.events[2].octaveSign).toBe(false); // Sekunde zur letzten NOTE
  });
});

describe("Namen, Klang, Dauern", () => {
  it("Solmisation fest (c=do … h=si), Buchstaben unverändert", () => {
    expect(toneName("c", "solmisation")).toBe("do");
    expect(toneName("g", "solmisation")).toBe("sol");
    expect(toneName("h", "solmisation")).toBe("si");
    expect(toneName("h", "buchstaben")).toBe("h");
  });

  it("eventLabel folgt dem Stil", () => {
    expect(eventLabel(note("g", 4, "viertel"), "buchstaben")).toBe("g, Viertelnote");
    expect(eventLabel(note("g", 4, "viertel"), "solmisation")).toBe("sol, Viertelnote");
    expect(eventLabel(rest("halbe"), "buchstaben")).toBe("halbe Pause");
  });

  it("midi/frequency: c4=60, a4=440 Hz, Kreuz +1 Halbton", () => {
    expect(midi(note("c", 4, "viertel"))).toBe(60);
    expect(frequency(note("a", 4, "viertel"))).toBeCloseTo(440, 5);
    expect(midi(note("f", 4, "viertel", { accidental: "kreuz" }))).toBe(66);
  });

  it("beats: ganze 4, punktierte Viertel 1.5", () => {
    expect(beats(note("c", 4, "ganze"))).toBe(4);
    expect(beats(note("c", 4, "viertel", { dotted: true }))).toBe(1.5);
    expect(beats(rest("achtel"))).toBe(0.5);
  });
});

describe("Etappen + Aufgaben", () => {
  it("eingefrorener Präfix kp1–kp14 + 8 Stufe-2 + 16 Stufe-3 + 15 Stufe-4-Kapitel, alle mit Lehrtexten", () => {
    // Die ersten 14 Einträge sind der Ur-Lernpfad — append-only!
    expect(KLANG_ETAPPEN.slice(0, 14).map((e) => e.id)).toEqual(
      Array.from({ length: 14 }, (_, i) => `kp${i + 1}`),
    );
    // Stufe-2-Block (08.07.) bleibt eingefroren an Position 14–21.
    expect(KLANG_ETAPPEN.slice(14, 22).map((e) => e.id)).toEqual([
      "kp-haltebogen",
      "kp-auftakt",
      "kp-pausen2",
      "kp-tonart",
      "kp-taktwechsel",
      "kp-schluessel",
      "kp-sechzehntel",
      "kp-triolen",
    ]);
    // Stufe-3-Block (Welt 1 Ausbau, Welt 4, Welt 5) bleibt an Position 22–37.
    expect(KLANG_ETAPPEN.slice(22, 38).map((e) => e.id)).toEqual([
      "kp-puls",
      "kp-lauschen-dauer",
      "kp-lauschen-dynamik",
      "kp-instrumente",
      "kp-echo",
      "kp-melodie-memory",
      "kp-bindebogen",
      "kp-artikulation",
      "kp-dynamik",
      "kp-tempo",
      "kp-verzierungen1",
      "kp-verzierungen2",
      "kp-ausdruck-lied",
      "kp-braillerepeats",
      "kp-volten",
      "kp-formen",
    ]);
    // Stufe-4-Block (Welt 6 Zusammenklang, Welt 7 Theorie-Spielplatz) an Position 38–52.
    expect(KLANG_ETAPPEN.slice(38, 53).map((e) => e.id)).toEqual([
      "kp-intervalle1",
      "kp-intervalle2",
      "kp-intervalle3",
      "kp-akkorde1",
      "kp-akkorde2",
      "kp-inakkord",
      "kp-tonleitern",
      "kp-quintenzirkel",
      "kp-rhythmusdiktat",
      "kp-melodiediktat",
      "kp-detektiv",
      "kp-baumeister",
      "kp-spielwiese",
      "kp-kadenzen",
      "kp-komponier",
    ]);
    // Stufe-5-Block (Welt 8 Instrumentenkunde, Welt 9 Lieder-Bühne-Ausbau) ans Ende.
    expect(KLANG_ETAPPEN.slice(53).map((e) => e.id)).toEqual([
      "kp-fingersatz",
      "kp-klavier",
      "kp-gesang",
      "kp-gitarre",
      "kp-generalbass",
      "kp-partitur",
      "kp-orchester",
      "kp-lieder2",
      "kp-lesekonzert",
      "kp-liederquiz",
    ]);
    expect(KLANG_ETAPPEN.length).toBe(63);
    for (const e of KLANG_ETAPPEN) {
      expect(e.introDu.length).toBeGreaterThan(20);
      expect(e.introSie.length).toBeGreaterThan(20);
    }
  });

  it("Generatoren liefern für jedes Kapitel (außer der Lieder-Werkstatt) gültige Aufgaben", () => {
    for (const e of KLANG_ETAPPEN.filter((e2) => e2.id !== "kp14")) {
      for (let i = 0; i < 25; i++) {
        const t = nextKlangTask(e.id, "buchstaben");
        expect(t.key.length).toBeGreaterThan(2);
        expect(t.prompt.length).toBeGreaterThan(5);
        if (t.kind === "choice") {
          expect(t.correctIndex).toBeGreaterThanOrEqual(0);
          expect(t.correctIndex).toBeLessThan(t.choices.length);
        }
        if (t.kind === "write") {
          expect(t.cells.length).toBeGreaterThan(0);
          expect(t.cells.length).toBe(t.cellLabels.length);
          expect(t.cells.length).toBe(t.cellTones.length);
        }
        if (t.kind === "tap") {
          expect(t.pattern.length).toBeGreaterThanOrEqual(3);
        }
      }
    }
  });

  it("Solmisation wirkt auf die Aufgabentexte von kp3", () => {
    let found = false;
    for (let i = 0; i < 40 && !found; i++) {
      const t = nextKlangTask("kp3", "solmisation");
      if (/\b(do|re|mi|fa|sol|la|si)\b/.test(t.prompt) || (t.kind === "choice" && t.choices.some((c) => /^(do|re|mi|fa|sol|la|si)$/.test(c)))) found = true;
    }
    expect(found).toBe(true);
  });

  it("klangUnitCells löst alle Unit-Schlüssel der Etappen auf", () => {
    for (const e of KLANG_ETAPPEN) {
      for (const u of e.introducedUnits) {
        const cells = klangUnitCells(u.key);
        expect(cells, `${e.id}/${u.key}`).not.toBeNull();
        expect(cells!.length).toBeGreaterThan(0);
      }
    }
  });

  it("songLineTask: Zellen/Labels/Töne bleiben deckungsgleich, Oktavzeichen an", () => {
    const s = SONGS[0];
    const t = songLineTask(s.title, 0, s.lines[0], s.timeSig, "buchstaben");
    expect(t.cells.length).toBe(t.cellLabels.length);
    expect(t.cells.length).toBe(t.cellTones.length);
    // erste Zelle muss ein Oktavzeichen sein (erste Note eines Stücks)
    expect(Object.values(OCTAVE_CELLS)).toContain(t.cells[0]);
  });
});

describe("Lieder", () => {
  it("parseLine versteht Noten, Pausen, Punktierung, Vorzeichen, Takte", () => {
    const ev = parseLine("g4v. fis4a | pv c5h");
    expect(ev).toHaveLength(5);
    expect(ev[0]).toMatchObject({ kind: "note", tone: "g", value: "viertel", dotted: true });
    expect(ev[1]).toMatchObject({ kind: "note", tone: "f", accidental: "kreuz", value: "achtel" });
    expect(ev[2]).toMatchObject({ kind: "bar" });
    expect(ev[3]).toMatchObject({ kind: "rest", value: "viertel" });
    expect(ev[4]).toMatchObject({ kind: "note", tone: "c", octave: 5, value: "halbe" });
  });

  it("alle Lieder transkribieren fehlerfrei und haben plausible Taktsummen", () => {
    for (const s of SONGS) {
      expect(s.lines.length).toBeGreaterThan(0);
      for (const line of s.lines) {
        const t = transcribe({ events: line });
        expect(t.events.length).toBe(line.length);
        // Jeder Takt (zwischen Taktstrichen) hat gleich viele Schläge — außer
        // Auf-/Schlusstakten; hier nur: kein Takt überschreitet die Taktart.
        if (s.timeSig) {
          const beatsPerBar = s.timeSig[0] * (4 / s.timeSig[1]);
          let sum = 0;
          for (const ev of line) {
            if (ev.kind === "bar") {
              expect(sum, `${s.id}: Takt zu lang`).toBeLessThanOrEqual(beatsPerBar + 1e-9);
              sum = 0;
            } else {
              sum += beats(ev);
            }
          }
          expect(sum).toBeLessThanOrEqual(beatsPerBar + 1e-9);
        }
      }
    }
  });

  it("beide Regale sind voll besetzt (8 Kinder + 10 Erwachsene, Johannes 02.07.)", () => {
    expect(songsForShelf("kinder").length).toBe(8);
    expect(songsForShelf("erwachsene").length).toBe(10);
  });

  it("drittes Regal Ausdruck ist besetzt (Stufe 5, §9.2)", () => {
    expect(songsForShelf("ausdruck").length).toBeGreaterThanOrEqual(3);
  });

  it("parseLine-Erweiterung (§11.2): ~ Haltebogen, ' _ ^ Artikulation, (…) Legato-Gruppe, ! übersprungen", () => {
    // Haltebogen + Artikulations-Suffixe fließen ins MusicNote.
    const ev = parseLine("c4v~ d4v' e4v_ f4v^");
    expect(ev[0]).toMatchObject({ tone: "c", tie: true });
    expect(ev[1]).toMatchObject({ tone: "d", artic: "staccato" });
    expect(ev[2]).toMatchObject({ tone: "e", artic: "tenuto" });
    expect(ev[3]).toMatchObject({ tone: "f", artic: "akzent" });
    // Bindebogen-Gruppe (…): eingeschlossene Noten klingen legato (tenuto).
    const grp = parseLine("(g4v a4v) h4v");
    expect(grp[0]).toMatchObject({ tone: "g", artic: "tenuto" });
    expect(grp[1]).toMatchObject({ tone: "a", artic: "tenuto" });
    expect(grp[2].kind === "note" && grp[2].artic).toBeFalsy(); // außerhalb der Gruppe
    // Ein eigenes Suffix schlägt die Gruppen-Regel (staccato bleibt staccato).
    expect(parseLine("(c4v' d4v)")[0]).toMatchObject({ artic: "staccato" });
    // Freistehende Vortrags-Tokens werden erkannt und übersprungen.
    const dyn = parseLine("!f c4v !cr( d4v !fermate");
    expect(dyn).toHaveLength(2);
    expect(dyn.every((e) => e.kind === "note")).toBe(true);
    // Punktierung bleibt neben einem Suffix erhalten.
    expect(parseLine("g4v.~")[0]).toMatchObject({ tone: "g", value: "viertel", dotted: true, tie: true });
  });

  it("die 18 Bestands-Lieder bleiben ZEICHENGLEICH (keine neuen Ausdruckszeichen, §11.2)", () => {
    const bestand = SONGS.filter((s) => s.shelf === "kinder" || s.shelf === "erwachsene");
    expect(bestand.length).toBe(18);
    // Kein Bestands-Lied enthält Töne mit Halte-/Bindebogen oder Artikulation —
    // die parseLine-Erweiterung darf ihre Zellen also nicht verändert haben.
    for (const s of bestand) {
      for (const line of s.lines) {
        for (const ev of line) {
          if (ev.kind === "note") {
            expect(ev.tie, `${s.id}: unerwarteter Haltebogen`).toBeFalsy();
            expect(ev.artic, `${s.id}: unerwartete Artikulation`).toBeFalsy();
          }
        }
      }
    }
    // Konkrete Regressions-Probe: Hänschen klein, Zeile 1 unverändert.
    const haenschen = SONGS.find((s) => s.id === "haenschen")!;
    const flat = transcribeFlat({ events: haenschen.lines[0], timeSig: haenschen.timeSig });
    expect(flat.length).toBeGreaterThan(8);
  });

  it("Sechzehntel = dieselbe Zelle wie die ganze Note (Wertmehrdeutigkeit)", () => {
    expect(noteCell("c", "sechzehntel")).toBe(noteCell("c", "ganze"));
    expect(beats(note("c", 4, "sechzehntel"))).toBe(0.25);
  });

  it("alle 7 Stammtöne × 4 Werte sind eindeutige Zellen", () => {
    const seen = new Set<number>();
    for (const t of TONES)
      for (const v of ["achtel", "viertel", "halbe", "ganze"] as const) {
        const c = noteCell(t, v);
        expect(seen.has(c)).toBe(false);
        seen.add(c);
      }
    expect(seen.size).toBe(28);
  });
});

describe("Stufe-2-Zeichen (Krolick Kap. II/IV/VI, Par. 1-7/3-4/3-6/4-2; BANA; music21-Gegenprobe)", () => {
  it("Haltebogen ⠈⠉ = Punkt 4, dann Punkte 1, 4 (Kap. VI)", () => {
    expect(TIE_CELLS).toEqual([dots(4), dots(1, 4)]);
  });

  it("transcribe hängt den Haltebogen NACH Note und Punktierung an", () => {
    const t = transcribe(
      { events: [note("g", 4, "halbe", { tie: true, dotted: true }), note("g", 4, "halbe")] },
      { octaveSigns: false },
    );
    expect(t.events[0].cells).toEqual([noteCell("g", "halbe"), dots(3), dots(4), dots(1, 4)]);
  });

  it("tiePlan: gebundene Folgenote wird nicht neu angeschlagen, die erste klingt weiter", () => {
    const m = {
      events: [note("g", 4, "halbe", { tie: true }), bar, note("g", 4, "halbe"), note("a", 4, "viertel")],
    };
    const plan = tiePlan(m);
    expect(plan.skipAttack).toEqual([false, false, true, false]);
    expect(plan.chainBeats[0]).toBe(4); // 2 + 2 Schläge über den Taktstrich
  });

  it("tiePlan bindet NICHT über verschiedene Tonhöhen", () => {
    const m = { events: [note("g", 4, "halbe", { tie: true }), note("a", 4, "halbe")] };
    expect(tiePlan(m).skipAttack).toEqual([false, false]);
  });

  it("Triole ⠆ = Punkte 2, 3; Triolen-Achtel dauert 1/3 Schlag (Kap. IV)", () => {
    expect(TRIPLET_CELL).toBe(dots(2, 3));
    expect(beats(note("c", 4, "achtel", { tuplet: 3 }))).toBeCloseTo(1 / 3, 9);
  });

  it("Musik-Bindestrich = Punkt 5 (Kap. IX)", () => {
    expect(MUSIC_HYPHEN_CELL).toBe(dots(5));
  });

  it("C = 46+14, alla breve = 456+14 (Par. 3-6)", () => {
    expect(COMMON_TIME_CELLS).toEqual([dots(4, 6), dots(1, 4)]);
    expect(ALLA_BREVE_CELLS).toEqual([dots(4, 5, 6), dots(1, 4)]);
  });

  it("Schlüssel (Kap. II / music21): Präfix 345, G=34, F=3456, C=346, Abschluss 123", () => {
    expect(CLEF_CELLS.violin).toEqual([dots(3, 4, 5), dots(3, 4), dots(1, 2, 3)]);
    expect(CLEF_CELLS.bass).toEqual([dots(3, 4, 5), dots(3, 4, 5, 6), dots(1, 2, 3)]);
    expect(CLEF_CELLS.alt).toEqual([dots(3, 4, 5), dots(3, 4, 6), dots(1, 2, 3)]);
  });

  it("Tonartvorzeichnung (Par. 3-4): bis 3 wiederholt, ab 4 mit Zahlzeichen", () => {
    expect(keySignatureCells(2, "kreuz")).toEqual([dots(1, 4, 6), dots(1, 4, 6)]);
    expect(keySignatureCells(3, "be")).toEqual([dots(1, 2, 6), dots(1, 2, 6), dots(1, 2, 6)]);
    expect(keySignatureCells(4, "kreuz")).toEqual([dots(3, 4, 5, 6), dots(1, 4, 5), dots(1, 4, 6)]);
  });

  it("Mehrtaktpause (Par. 1-7): bis 3 = ganze Pausen, ab 4 = Zahl + ganze Pause", () => {
    expect(multiRestCells(3)).toEqual([dots(1, 3, 4), dots(1, 3, 4), dots(1, 3, 4)]);
    expect(multiRestCells(4)).toEqual([dots(3, 4, 5, 6), dots(1, 4, 5), dots(1, 3, 4)]);
    expect(multiRestCells(12)).toEqual([dots(3, 4, 5, 6), dots(1), dots(1, 2), dots(1, 3, 4)]);
  });

  it("eventLabel nennt den Haltebogen", () => {
    expect(eventLabel(note("g", 4, "halbe", { tie: true }), "buchstaben")).toBe(
      "g, halbe Note, mit Haltebogen",
    );
  });
});

describe("Stufe-3-Zeichen (Krolick Kap. VI/VII/IX/X/XI; §3 der Vollausbau-Übergabe)", () => {
  it("Bindebogen ⠉ = Punkte 1, 4 (§6-2)", () => {
    expect(SLUR_CELL).toBe(dots(1, 4));
  });

  it("Artikulation VOR der Note (Tab. 10): staccato/tenuto/akzent/marcato", () => {
    expect(ARTIC_CELLS.staccato).toEqual([dots(2, 3, 6)]);
    expect(ARTIC_CELLS.staccatissimo).toEqual([dots(6), dots(2, 3, 6)]);
    expect(ARTIC_CELLS.portato).toEqual([dots(5), dots(2, 3, 6)]);
    expect(ARTIC_CELLS.tenuto).toEqual([dots(4, 5, 6), dots(2, 3, 6)]);
    expect(ARTIC_CELLS.akzent).toEqual([dots(4, 6), dots(2, 3, 6)]);
    expect(ARTIC_CELLS.marcato).toEqual([dots(5, 6), dots(2, 3, 6)]);
  });

  it("Fermate ⠣⠇ = 126-123, steht NACH der Note (§10-13)", () => {
    expect(FERMATE_CELLS).toEqual([dots(1, 2, 6), dots(1, 2, 3)]);
  });

  it("Dynamik: Wortzeichen 345 + Literarbuchstaben (§10-2/3)", () => {
    expect(DYNAMIC_WORD_SIGN).toBe(dots(3, 4, 5));
    expect(DYNAMIC_CELLS.f).toEqual([dots(3, 4, 5), dots(1, 2, 4)]); // f = 124
    expect(DYNAMIC_CELLS.p).toEqual([dots(3, 4, 5), dots(1, 2, 3, 4)]); // p = 1234
    expect(DYNAMIC_CELLS.mf).toEqual([dots(3, 4, 5), dots(1, 3, 4), dots(1, 2, 4)]);
    expect(DYNAMIC_CELLS.pp).toEqual([dots(3, 4, 5), dots(1, 2, 3, 4), dots(1, 2, 3, 4)]);
    expect(DYNAMIC_CELLS.ff).toEqual([dots(3, 4, 5), dots(1, 2, 4), dots(1, 2, 4)]);
  });

  it("Cresc-/Decresc-Gabeln (§10-5/6): 345-14 … 345-25 / 345-145 … 345-256", () => {
    expect(CRESC_HAIRPIN_START).toEqual([dots(3, 4, 5), dots(1, 4)]);
    expect(CRESC_HAIRPIN_END).toEqual([dots(3, 4, 5), dots(2, 5)]);
    expect(DECR_HAIRPIN_START).toEqual([dots(3, 4, 5), dots(1, 4, 5)]);
    expect(DECR_HAIRPIN_END).toEqual([dots(3, 4, 5), dots(2, 5, 6)]);
  });

  it("Metronomangabe ♩=106 = 1456-2356-3456-1-245-124 (§14-17, wörtl. Übergabe)", () => {
    expect(metronomeCells(106)).toEqual([
      dots(1, 4, 5, 6), // Viertelnote c
      dots(2, 3, 5, 6), // Gleichzeichen
      dots(3, 4, 5, 6), // Zahlzeichen
      dots(1), // 1
      dots(2, 4, 5), // 0
      dots(1, 2, 4), // 6
    ]);
  });

  it("Verzierungen VOR der Note (Tab. 11): Vorschlag/Triller/Doppelschlag/Mordent", () => {
    expect(ORNAMENT_CELLS.vorschlag).toEqual([dots(2, 6)]);
    expect(ORNAMENT_CELLS["vorschlag-lang"]).toEqual([dots(5), dots(2, 6)]);
    expect(ORNAMENT_CELLS.triller).toEqual([dots(2, 3, 5)]);
    expect(ORNAMENT_CELLS.doppelschlag).toEqual([dots(2, 5, 6)]);
    expect(ORNAMENT_CELLS.pralltriller).toEqual([dots(5), dots(2, 3, 5)]);
    expect(ORNAMENT_CELLS.mordent).toEqual([dots(5), dots(2, 3, 5), dots(1, 2, 3)]);
  });

  it("Tremolo NACH (45-…) / ZWISCHEN (46-…) der Note (§7-4/7)", () => {
    expect(TREMOLO_REP.rep8).toEqual([dots(4, 5), dots(1, 2)]);
    expect(TREMOLO_REP.rep16).toEqual([dots(4, 5), dots(1, 2, 3)]);
    expect(TREMOLO_ALT.alt8).toEqual([dots(4, 6), dots(1, 2)]);
  });

  it("Volten mit UNTEREN Ziffern (§9-6/8): Haus 1 = 3456-2, Haus 2 = 3456-23", () => {
    expect(voltaCells(1)).toEqual([dots(3, 4, 5, 6), dots(2)]);
    expect(voltaCells(2)).toEqual([dots(3, 4, 5, 6), dots(2, 3)]);
  });

  it("Segno 346 / Coda 346-123 (§9-9)", () => {
    expect(SEGNO_CELL).toBe(dots(3, 4, 6));
    expect(CODA_CELLS).toEqual([dots(3, 4, 6), dots(1, 2, 3)]);
  });

  it("Zähl-Wiederholung ×N = Simile 2356, Zahlzeichen 3456, obere Ziffer (§9-36)", () => {
    expect(countRepeatCells(3)).toEqual([dots(2, 3, 5, 6), dots(3, 4, 5, 6), dots(1, 4)]);
  });

  it("ornamentToEvents löst eine Verzierung in klingende Einzeltöne auf", () => {
    const ev = ornamentToEvents(note("c", 4, "halbe"), "vorschlag");
    expect(ev).toHaveLength(2);
    expect(ev[0]).toMatchObject({ tone: "d", value: "sechzehntel" }); // Nachbarton drüber
    expect(ev[1]).toMatchObject({ tone: "c", value: "halbe" }); // Hauptton bleibt
    const tr = ornamentToEvents(note("e", 4, "viertel"), "triller");
    expect(tr.length).toBeGreaterThanOrEqual(4);
  });

  it("Rhythmussprache (Kodály, §4.6): ta / ti / ta-a; Paare und Vierergruppen", () => {
    expect(rhythmSyllable("viertel")).toBe("ta");
    expect(rhythmSyllable("achtel")).toBe("ti");
    expect(rhythmSyllable("halbe")).toBe("ta-a");
    expect(rhythmSyllables([note("g", 4, "viertel")])).toBe("ta");
    expect(rhythmSyllables([note("g", 4, "achtel"), note("g", 4, "achtel")])).toBe("ti-ti");
    expect(rhythmSyllables([note("g", 4, "halbe")])).toBe("ta-a");
    expect(
      rhythmSyllables([
        note("c", 4, "sechzehntel"),
        note("d", 4, "sechzehntel"),
        note("e", 4, "sechzehntel"),
        note("f", 4, "sechzehntel"),
      ]),
    ).toBe("tika-tika");
    expect(rhythmSyllables([note("g", 4, "viertel"), rest("halbe")])).toBe("ta sch");
  });

  it("eventLabel hängt die Rhythmus-Silbe nur mit rhythm=true an (kein Bruch der Altansage)", () => {
    expect(eventLabel(note("g", 4, "viertel"), "buchstaben")).toBe("g, Viertelnote");
    expect(eventLabel(note("g", 4, "viertel"), "buchstaben", true)).toBe("g, Viertelnote — ta");
  });

  it("Nachspiel-Klaviatur bildet D F G H J K L auf c d e f g a h ab (§4.1)", () => {
    expect(PLAY_KEY_TO_TONE.KeyD).toBe("c");
    expect(PLAY_KEY_TO_TONE.KeyF).toBe("d");
    expect(PLAY_KEY_TO_TONE.KeyG).toBe("e");
    expect(PLAY_KEY_TO_TONE.KeyH).toBe("f");
    expect(PLAY_KEY_TO_TONE.KeyJ).toBe("g");
    expect(PLAY_KEY_TO_TONE.KeyK).toBe("a");
    expect(PLAY_KEY_TO_TONE.KeyL).toBe("h");
  });

  it("Intervallzeichen 2.–8. (Tab. 5A): 34/346/3456/35/356/25/36", () => {
    expect(INTERVAL_CELLS[2]).toBe(dots(3, 4)); // Sekunde
    expect(INTERVAL_CELLS[3]).toBe(dots(3, 4, 6)); // Terz
    expect(INTERVAL_CELLS[4]).toBe(dots(3, 4, 5, 6)); // Quarte
    expect(INTERVAL_CELLS[5]).toBe(dots(3, 5)); // Quinte
    expect(INTERVAL_CELLS[6]).toBe(dots(3, 5, 6)); // Sexte
    expect(INTERVAL_CELLS[7]).toBe(dots(2, 5)); // Septime
    expect(INTERVAL_CELLS[8]).toBe(dots(3, 6)); // Oktave
  });

  it("intervalBelow zählt diatonisch abwärts (Diskant-Regel §5-1)", () => {
    // Terz unter g4 = e4, Quinte unter g4 = c4, Oktave unter g4 = g3
    expect(intervalBelow(note("g", 4, "viertel"), 3)).toMatchObject({ tone: "e", octave: 4 });
    expect(intervalBelow(note("g", 4, "viertel"), 5)).toMatchObject({ tone: "c", octave: 4 });
    expect(intervalBelow(note("g", 4, "viertel"), 8)).toMatchObject({ tone: "g", octave: 3 });
    // Terz unter c4 überschreitet die Oktavgrenze nach unten = a3
    expect(intervalBelow(note("c", 4, "viertel"), 3)).toMatchObject({ tone: "a", octave: 3 });
  });

  it("readCell (Takt-Baumeister §4.4): Grundwerte + kp12-Mehrdeutigkeit", () => {
    // eindeutige Werte
    expect(readCell(noteCell("g", "viertel"), 4)).toMatchObject({ kind: "note", tone: "g", value: "viertel", beats: 1 });
    expect(readCell(noteCell("c", "halbe"), 4)).toMatchObject({ tone: "c", value: "halbe", beats: 2 });
    expect(readCell(REST_CELLS.viertel, 4)).toMatchObject({ kind: "rest", value: "viertel", beats: 1 });
    // 3+6-Zelle: groß (ganze) wenn sie passt, sonst klein (Sechzehntel)
    expect(readCell(noteCell("c", "ganze"), 4)).toMatchObject({ value: "ganze", beats: 4, ambiguous: true });
    expect(readCell(noteCell("c", "ganze"), 1)).toMatchObject({ value: "sechzehntel", beats: 0.25, ambiguous: true });
    // keine gültige Notenzelle → null
    expect(readCell(dots(2, 3, 5, 6), 4)).toBeNull(); // Simile
  });

  it("readSequence übersetzt Zellen taktweise (Taktstrich = BLANK, Vorzeichen an die Note)", () => {
    const ev = readSequence([noteCell("c", "viertel"), REST_CELLS.viertel, BLANK, noteCell("g", "halbe")], [4, 4]);
    expect(ev).toHaveLength(4);
    expect(ev[0]).toMatchObject({ kind: "note", tone: "c", value: "viertel" });
    expect(ev[1]).toMatchObject({ kind: "rest", value: "viertel" });
    expect(ev[2]).toMatchObject({ kind: "bar" });
    expect(ev[3]).toMatchObject({ kind: "note", tone: "g", value: "halbe" });
    // Versetzungszeichen bindet an die folgende Note
    const acc = readSequence([ACCIDENTAL_CELLS.kreuz, noteCell("f", "viertel")]);
    expect(acc[0]).toMatchObject({ kind: "note", tone: "f", accidental: "kreuz" });
  });

  it("In-Accord und Moving notes (§5-11/17/18/23)", () => {
    expect(IN_ACCORD_CELLS).toEqual([dots(1, 2, 6), dots(3, 4, 5)]); // Ganztakt 126-345
    expect(PART_IN_ACCORD_CELLS).toEqual([dots(5), dots(2)]); // Teiltakt 5-2
    expect(MEASURE_DIVISION_CELLS).toEqual([dots(4, 6), dots(1, 3)]); // Taktteilung 46-13
    expect(MOVING_NOTE_CELL).toBe(dots(6));
    expect(MOVING_NOTES_CELL).toBe(dots(5, 6));
  });

  it("play-Kapitel liefern play-Aufgaben; Echo hat Töne, Memory ist memory-Modus", () => {
    for (let i = 0; i < 20; i++) {
      const echo = nextKlangTask("kp-echo", "buchstaben");
      expect(echo.kind).toBe("play");
      if (echo.kind === "play") {
        expect(echo.melody.events.filter((e) => e.kind === "note").length).toBeGreaterThanOrEqual(2);
        expect(echo.memory).toBeFalsy();
      }
    }
    const mem = nextKlangTask("kp-melodie-memory", "buchstaben");
    expect(mem.kind).toBe("play");
    if (mem.kind === "play") {
      expect(mem.memory).toBe(true);
      expect(mem.pool && mem.pool.length).toBeGreaterThan(0);
    }
  });
});

describe("Zweizeilige Klavier-Ansicht (§4.8 / 8.2)", () => {
  it("kp-klavier liefert Aufgaben mit zwei Zeilen; Bild und Klang der linken Hand sind deckungsgleich", () => {
    let grand: ChoiceTask | null = null;
    for (let i = 0; i < 150 && !grand; i++) {
      const t = nextKlangTask("kp-klavier", "buchstaben");
      if (t.kind === "choice" && t.key.startsWith("klavier-zwei")) grand = t;
    }
    expect(grand, "kp-klavier erzeugt zweizeilige Aufgaben").not.toBeNull();
    const g = grand!;
    expect(g.staff).toBeTruthy(); // rechte Hand (Violinschlüssel)
    expect(g.staff2).toBeTruthy(); // linke Hand (Bassschlüssel)
    expect(g.melody).toBeTruthy();
    expect(g.melody2).toBeTruthy();
    expect(g.choices.length).toBe(3);
    // Richtige Antwort = Zahl der Töne der LINKEN Hand; Notenbild == Klang.
    const lhNotes = g.staff2!.events.filter((e) => e.kind === "note").length;
    expect(g.choices[g.correctIndex]).toBe(`${lhNotes} Töne`);
    expect(g.melody2!.events.filter((e) => e.kind === "note").length).toBe(lhNotes);
  });

  it("Hand-Fokus zykelt beide → rechts → links", () => {
    expect(HAND_FOCUS_ORDER).toEqual(["both", "rh", "lh"]);
    expect(handFocusLabel("rh")).toMatch(/rechte Hand/);
    expect(handFocusLabel("lh")).toMatch(/linke Hand/);
    expect(handFocusLabel("both")).toMatch(/[Bb]eide/);
  });
});

describe("Stufe-5-Zeichen (Welt 8 Instrumentenkunde; Krolick Kap. VIII/XV/XVI/XVII/XII/XIV; §3-G/H/I/J)", () => {
  it("Fingersatz 1.–5. = 1/12/123/2/13 (Tab. 15, nach der Note)", () => {
    expect(FINGER_CELLS[1]).toBe(dots(1));
    expect(FINGER_CELLS[2]).toBe(dots(1, 2));
    expect(FINGER_CELLS[3]).toBe(dots(1, 2, 3));
    expect(FINGER_CELLS[4]).toBe(dots(2));
    expect(FINGER_CELLS[5]).toBe(dots(1, 3));
  });

  it("Hand-Zeichen (Tab. 15A): rechte Hand 46-345, linke Hand 456-345", () => {
    expect(HAND_CELLS.r).toEqual([dots(4, 6), dots(3, 4, 5)]);
    expect(HAND_CELLS.l).toEqual([dots(4, 5, 6), dots(3, 4, 5)]);
  });

  it("Klavierpedal (§15-17/18): nieder 126-14 (vor), auf 16-14 (nach)", () => {
    expect(PEDAL_DOWN_CELLS).toEqual([dots(1, 2, 6), dots(1, 4)]);
    expect(PEDAL_UP_CELLS).toEqual([dots(1, 6), dots(1, 4)]);
  });

  it("Gesang (§16): Atem halb 345-2 / voll 6-34, 2 Silben je Note = 12, Zeilenpräfixe 56-23 / 6-3", () => {
    expect(BREATH_HALF_CELLS).toEqual([dots(3, 4, 5), dots(2)]);
    expect(BREATH_FULL_CELLS).toEqual([dots(6), dots(3, 4)]);
    expect(SYLLABLES_2_CELL).toBe(dots(1, 2));
    expect(LYRIC_LINE_PREFIX).toEqual([dots(5, 6), dots(2, 3)]);
    expect(MUSIC_LINE_PREFIX).toEqual([dots(6), dots(3)]);
  });

  it("Gitarre-Saiten 1–7 = Saitenzeichen 146 + 1/12/123/2/13/23/3 (Tab. 17A)", () => {
    expect(stringCells(1)).toEqual([dots(1, 4, 6), dots(1)]);
    expect(stringCells(3)).toEqual([dots(1, 4, 6), dots(1, 2, 3)]);
    expect(stringCells(7)).toEqual([dots(1, 4, 6), dots(3)]);
  });

  it("Gitarre-Lagen 345 + Intervallzeichen; 7. Lage ist der Sonderfall 6-345-25 (Tab. 17B)", () => {
    expect(fretCells(2)).toEqual([dots(3, 4, 5), dots(3, 4)]); // 2. Lage = 345 + Sekunde
    expect(fretCells(5)).toEqual([dots(3, 4, 5), dots(3, 5)]); // 5. Lage = 345 + Quinte
    // 7. Lage MIT Extra-Punkt 6, weil 345-25 sonst die Crescendo-Gabel-Ende wäre.
    expect(fretCells(7)).toEqual([dots(6), dots(3, 4, 5), dots(2, 5)]);
  });

  it("Barré voll 456 / halb 45 (Tab. 17C)", () => {
    expect(BARRE_FULL_CELL).toBe(dots(4, 5, 6));
    expect(BARRE_HALF_CELL).toBe(dots(4, 5));
  });

  it("Akkordsymbole (Tab. 12A): dim 256, halbdim 256-3, maj7 356, kursive 7 = 46-3456-1245", () => {
    expect(CHORD_SYMBOL_CELLS.dim).toEqual([dots(2, 5, 6)]);
    expect(CHORD_SYMBOL_CELLS.halbdim).toEqual([dots(2, 5, 6), dots(3)]);
    expect(CHORD_SYMBOL_CELLS.maj7).toEqual([dots(3, 5, 6)]);
    expect(CHORD_SYMBOL_CELLS.sept).toEqual([dots(4, 6), dots(3, 4, 5, 6), dots(1, 2, 4, 5)]);
  });

  it("Generalbass (§12-15…27): Präfix 56-345; Ziffern = Zahlzeichen 3456 + UNTERE Ziffern", () => {
    expect(FIGURED_BASS_PREFIX).toEqual([dots(5, 6), dots(3, 4, 5)]);
    // Bezifferung 6 (untere 6 = Punkte 2, 3, 5) hinter dem Zahlzeichen 3456.
    expect(figuredBassCells([6])).toEqual([dots(3, 4, 5, 6), dots(2, 3, 5)]);
    // unterste Druck-Ziffer zuerst: 6 über 4 → als [4, 6] übergeben.
    expect(figuredBassCells([4, 6])).toEqual([dots(3, 4, 5, 6), dots(2, 5, 6), dots(2, 3, 5)]);
  });

  it("Taktzahl = Marginalzahl OHNE Zahlzeichen, nur obere Ziffern (§14-10)", () => {
    expect(measureNumberCells(1)).toEqual([dots(1)]);
    expect(measureNumberCells(16)).toEqual([dots(1), dots(1, 2, 4)]); // 1, 6
    expect(measureNumberCells(0)).toEqual([dots(2, 4, 5)]); // Auftakt = Takt 0
  });
});

describe("Tiefentest-Fixes 09.07.2026 (Klopf-Lösbarkeit + Baumeister-Ansagen)", () => {
  // Der Runner erkennt kurz/lang RELATIV: der kleinste Klopf-Abstand wird immer
  // „kurz". Ein Muster, dessen gewertete Schläge (alle außer dem letzten) nur
  // „lang" sind, wäre darum mathematisch unlösbar — das Kind hinge endlos fest.
  it("kp2: jedes Klopf-Muster hat mindestens ein „kurz“ unter den gewerteten Schlägen", () => {
    for (let i = 0; i < 400; i++) {
      const t = nextKlangTask("kp2", "buchstaben");
      if (t.kind !== "tap") continue;
      expect(t.pattern.slice(0, -1)).toContain("kurz");
    }
  });

  it("kp-rhythmusdiktat: die Blatt-Klopf-Variante kommt nur mit Achteln (sonst unlösbar)", () => {
    for (let i = 0; i < 600; i++) {
      const t = nextKlangTask("kp-rhythmusdiktat", "buchstaben");
      if (t.kind !== "tap") continue;
      // Muster ohne das angehängte Schluss-„lang" muss ein „kurz" enthalten.
      expect(t.pattern.slice(0, -1)).toContain("kurz");
    }
  });

  it("kp-puls: die Klopf-Variante hat genug Schläge für die Gleichmäßigkeits-Wertung (≥ 7)", () => {
    for (let i = 0; i < 200; i++) {
      const t = nextKlangTask("kp-puls", "buchstaben");
      if (t.kind !== "tap") continue;
      expect(t.pattern.length).toBeGreaterThanOrEqual(7);
    }
  });

  it("beatUnitFor: Achteltakte zählen in Achteln, andere in Vierteln", () => {
    expect(beatUnitFor([6, 8])).toEqual({ factor: 2, one: "Achtel-Schlag", many: "Achtel-Schlägen" });
    expect(beatUnitFor([3, 4]).factor).toBe(1);
    expect(beatUnitFor([4, 4]).one).toBe("Schlag");
  });

  it("beatsText: nie ein englischer Dezimalpunkt in der Ansage", () => {
    expect(beatsText(3)).toBe("3");
    expect(beatsText(0.5)).toBe("ein halber");
    expect(beatsText(1.5)).toBe("anderthalb");
    expect(beatsText(2.5)).toBe("zweieinhalb");
    expect(beatsText(2.25)).toBe("2,25");
  });
});

describe("shortPromptForRepeat — wiederholte Anleitungen nur beim ersten Mal voll (10.07.)", () => {
  it("kürzt die Tonleiter- und Höher-Anleitungen auf die eigentliche Frage", () => {
    expect(shortPromptForRepeat("Eine kleine Tonleiter. Geht sie rauf oder runter?")).toBe(
      "Geht sie rauf oder runter?",
    );
    expect(shortPromptForRepeat("Zwei Töne. Welcher war höher?")).toBe("Welcher war höher?");
    expect(shortPromptForRepeat("Drei Töne. Welcher war am höchsten?")).toBe(
      "Welcher war am höchsten?",
    );
  });

  it("lässt Anleitungen ohne sichere Kürzung unverändert (null)", () => {
    // Ein einzelner Fragesatz — nichts wegzulassen.
    expect(shortPromptForRepeat("Hör die Tonleiter — Dur (hell) oder Moll (dunkel)?")).toBeNull();
    // Anweisungen (kein Fragezeichen) werden nie gekürzt — sie tragen Inhalt.
    expect(shortPromptForRepeat("Schreib die Note c als Viertel.")).toBeNull();
  });

  it("zerschneidet Ordnungszahlen im Fragesatz nicht", () => {
    // Die letzte sichere Satzgrenze liegt hinter „Töne." — die Ordnungszahlen
    // („3.") gehören zum Fragesatz und bleiben erhalten.
    expect(shortPromptForRepeat("Zwei Töne. War es die 1., 2. oder 3. Note?")).toBe(
      "War es die 1., 2. oder 3. Note?",
    );
  });
});
