/**
 * Tests: Level-id-Migration (migrateIds.ts)
 * Prüft Idempotenz, Kollisionsregel und dass leere ID_RENAMES
 * die Eingabe unverändert zurückgibt.
 */
import { describe, expect, it } from "vitest";
import { migrateProgressIds, migrateEventIds, ID_RENAMES } from "@/lib/braille/migrateIds";
import type { BrailleProgress } from "@/lib/braille/progress";
import type { TaskEvent } from "@/lib/braille/account";
import type { LevelRecord } from "@/lib/braille/progress";

function emptyProg(): BrailleProgress {
  return { xp: 0, levels: {}, mastery: {}, stufen: {}, introduced: {}, speedEma: {} };
}

function levelRec(attempts: number = 0): LevelRecord {
  return { completed: false, bestStars: 0, attempts };
}

describe("ID_RENAMES", () => {
  it("ist standardmäßig leer (keine Migration aktiv)", () => {
    expect(Object.keys(ID_RENAMES)).toHaveLength(0);
  });
});

describe("migrateProgressIds (leere Tabelle)", () => {
  it("gibt denselben Progress zurück, wenn ID_RENAMES leer ist", () => {
    const p = emptyProg();
    p.levels["l1-reihe1"] = levelRec(5);
    const result = migrateProgressIds(p);
    expect(result).toBe(p); // Referenz-Identität bei leerer Tabelle
  });

  it("lässt alle 21 eingefrorenen Level-ids unberührt", () => {
    const frozenIds = [
      "l1-reihe1", "l2-reihe2", "l3-reihe3", "l4-woerter", "l5-saetze",
      "l6-zahlen", "l7-satzzeichen", "l8-rechnen", "basis-texte",
      "voll-ei-ie", "voll-au-eu-aeu", "voll-ch-sch-st", "voll-woerter",
      "voll-saetze", "voll-texte", "comp-buchstaben", "comp-gross",
      "comp-zahlen", "comp-sonderzeichen", "comp-texte-jugend",
      "comp-texte-erwachsene",
    ];
    const p = emptyProg();
    for (const id of frozenIds) p.levels[id] = levelRec(10);
    const result = migrateProgressIds(p);
    for (const id of frozenIds) {
      expect(result.levels[id]).toBeDefined();
    }
  });
});

describe("migrateEventIds (leere Tabelle)", () => {
  const base: TaskEvent = {
    ts: 1000,
    level: "l1-reihe1",
    system: "basis",
    direction: "write",
    correct: true,
    ms: 1000,
    cells: 1,
  };

  it("gibt bei leerer Tabelle dasselbe Array zurück", () => {
    const ev = [base];
    const result = migrateEventIds(ev);
    expect(result).toBe(ev);
  });

  it("Alt-Events ohne typed/unit/spokenMs laufen durch ohne Throw", () => {
    const events: TaskEvent[] = [
      base,
      { ...base, level: "voll-ei-ie", correct: false },
      { ...base, level: "comp-zahlen" },
    ];
    expect(() => migrateEventIds(events)).not.toThrow();
    const result = migrateEventIds(events);
    expect(result[0].level).toBe("l1-reihe1");
  });
});

describe("Progress-Roundtrip mit emptyProgress", () => {
  it("introduced und speedEma defaulten auf {}", () => {
    const p = emptyProg();
    expect(p.introduced).toEqual({});
    expect(p.speedEma).toEqual({});
  });

  it("migrateProgressIds(emptyProg()) bleibt stabil", () => {
    const p = emptyProg();
    const result = migrateProgressIds(p);
    expect(result.introduced).toEqual({});
    expect(result.speedEma).toEqual({});
    expect(result.levels).toEqual({});
  });
});
