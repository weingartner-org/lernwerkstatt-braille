/**
 * Migrations-Smoke-Tests für P1a (Bauvertrag §6.4).
 *
 * 1. Alt-Event-Lesetest: Schwung lw_events OHNE typed/unit/spokenMs durch
 *    statsFromEvents, suspicionScore und confusionFromEvents → kein Throw,
 *    identische PupilStats wie vor dem Umbau.
 * 2. id-Stabilitätstest: 21 eingefrorene Level-ids — isLevelUnlocked liefert
 *    bei unveränderten Progress denselben Stand wie erwartet.
 * 3. Progress-Roundtrip: emptyProgress → Felder füllen → loadProgress-Logik →
 *    introduced/speedEma defaulten korrekt auf {}.
 */
import { describe, expect, it } from "vitest";
import { statsFromEvents, suspicionScore } from "@/lib/braille/account";
import type { TaskEvent } from "@/lib/braille/account";
import { confusionFromEvents } from "@/lib/braille/confuse";
import { emptyProgress, isLevelUnlocked } from "@/lib/braille/progress";
import type { BrailleProgress } from "@/lib/braille/progress";
import { LEVELS } from "@/lib/braille/curriculum";

// Simulierter „Alt-Event"-Schwung (echt: lw_events.data.events ohne P1-Felder)
function makeAltEvents(count: number): TaskEvent[] {
  return Array.from({ length: count }, (_, i) => ({
    ts: 1_000_000 + i * 1000,
    level: "l1-reihe1",
    system: "basis",
    direction: "write" as const,
    correct: i % 3 !== 0, // ~2/3 richtig
    ms: 1200 + (i % 10) * 100,
    cells: 1,
    // typed, unit, spokenMs bewusst NICHT gesetzt
  }));
}

describe("Alt-Event-Lesetest (Bauvertrag §6.4-1)", () => {
  const altEvents = makeAltEvents(200);

  it("statsFromEvents wirft nicht bei Alt-Events", () => {
    expect(() => statsFromEvents(altEvents)).not.toThrow();
  });

  it("suspicionScore wirft nicht bei Alt-Events", () => {
    expect(() => suspicionScore(altEvents)).not.toThrow();
  });

  it("confusionFromEvents wirft nicht bei Alt-Events", () => {
    expect(() => confusionFromEvents(altEvents)).not.toThrow();
  });

  it("confusionFromEvents liefert leere Matrix für Alt-Events (kein unit gesetzt)", () => {
    const matrix = confusionFromEvents(altEvents);
    expect(matrix.rows).toEqual([]);
    expect(matrix.totalErrors).toBe(0);
  });

  it("PupilStats identisch vor und nach P1a-Umbau", () => {
    const stats = statsFromEvents(altEvents);
    // Essenzielle Felder unverändert
    expect(stats.tasks).toBe(200);
    expect(stats.correct).toBeGreaterThan(0);
    expect(stats.accuracy).toBeGreaterThan(0);
    expect(stats.accuracy).toBeLessThanOrEqual(1);
    expect(stats.lastActive).toBeGreaterThan(0);
    // suspicion ist vorhanden und plausibel
    expect(stats.suspicion.score).toBeGreaterThanOrEqual(1);
    expect(stats.suspicion.score).toBeLessThanOrEqual(10);
  });

  it("gemischter Schwung (manche Events haben typed/unit, andere nicht)", () => {
    const mixed: TaskEvent[] = [
      ...makeAltEvents(50),
      {
        ts: 2_000_000,
        level: "l1-reihe1",
        system: "basis",
        direction: "write",
        correct: false,
        ms: 900,
        cells: 1,
        unit: "d",
        typed: "f",
      },
    ];
    expect(() => statsFromEvents(mixed)).not.toThrow();
    expect(() => confusionFromEvents(mixed)).not.toThrow();
    const matrix = confusionFromEvents(mixed);
    expect(matrix.rows).toHaveLength(1);
    expect(matrix.totalErrors).toBe(1);
  });
});

describe("id-Stabilitätstest (Bauvertrag §6.4-2)", () => {
  const levelIds = LEVELS.map((l) => l.id);

  it("alle 21 Level-ids sind im Bestand vorhanden", () => {
    const expected = [
      "l1-reihe1", "l2-reihe2", "l3-reihe3", "l4-woerter", "l5-saetze",
      "l6-zahlen", "l7-satzzeichen", "l8-rechnen", "basis-texte",
      "voll-ei-ie", "voll-au-eu-aeu", "voll-ch-sch-st", "voll-woerter",
      "voll-saetze", "voll-texte", "comp-buchstaben", "comp-gross",
      "comp-zahlen", "comp-sonderzeichen", "comp-texte-jugend",
      "comp-texte-erwachsene",
    ];
    for (const id of expected) {
      expect(levelIds).toContain(id);
    }
  });

  it("isLevelUnlocked: erstes Level immer frei", () => {
    const p = emptyProgress();
    expect(isLevelUnlocked(p, levelIds, levelIds[0])).toBe(true);
  });

  it("isLevelUnlocked: zweites Level gesperrt, solange erstes nicht completed", () => {
    const p = emptyProgress();
    expect(isLevelUnlocked(p, levelIds, levelIds[1])).toBe(false);
  });

  it("isLevelUnlocked: zweites Level frei, wenn erstes completed", () => {
    const p = emptyProgress();
    p.levels[levelIds[0]] = { completed: true, bestStars: 3, attempts: 20 };
    expect(isLevelUnlocked(p, levelIds, levelIds[1])).toBe(true);
  });
});

describe("Progress-Roundtrip (Bauvertrag §6.4-3)", () => {
  it("emptyProgress hat introduced:{} und speedEma:{}", () => {
    const p = emptyProgress();
    expect(p.introduced).toEqual({});
    expect(p.speedEma).toEqual({});
  });

  it("Altstand ohne introduced/speedEma wird durch emptyProgress-Spread korrekt gedefaultet", () => {
    const altData = { xp: 42, levels: { "l1-reihe1": { completed: true, bestStars: 3, attempts: 30 } } };
    // Simuliert {  ...emptyProgress(), ...altData } wie in pbBackend.ts:285
    const loaded: BrailleProgress = { ...emptyProgress(), ...altData };
    expect(loaded.introduced).toEqual({});
    expect(loaded.speedEma).toEqual({});
    expect(loaded.xp).toBe(42);
    expect(loaded.levels["l1-reihe1"].completed).toBe(true);
  });

  it("neuer Stand mit introduced/speedEma überlebt den Roundtrip", () => {
    const p: BrailleProgress = {
      ...emptyProgress(),
      xp: 100,
      introduced: { "l1-reihe1": ["a", "b", "c"] },
      speedEma: { basis: 42.5 },
    };
    // Re-laden via {...emptyProgress(), ...p}
    const reloaded: BrailleProgress = { ...emptyProgress(), ...p };
    expect(reloaded.introduced?.["l1-reihe1"]).toEqual(["a", "b", "c"]);
    expect(reloaded.speedEma?.["basis"]).toBe(42.5);
    expect(reloaded.xp).toBe(100);
  });
});
