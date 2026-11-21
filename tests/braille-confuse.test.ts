/**
 * Tests: Verwechslungs-Matrix (confuse.ts)
 * Abwärtskompatibilität mit Alt-Events ohne typed/unit/spokenMs.
 */
import { describe, expect, it } from "vitest";
import {
  confusionFromEvents,
  mnemonicFor,
  topConfusions,
} from "@/lib/braille/confuse";
import type { TaskEvent } from "@/lib/braille/account";

// Minimal gültiges TaskEvent ohne optionale Felder (Alt-Event-Simulation)
function altEvent(overrides: Partial<TaskEvent> = {}): TaskEvent {
  return {
    ts: 1_000_000,
    level: "l1-reihe1",
    system: "basis",
    direction: "write",
    correct: true,
    ms: 1500,
    cells: 1,
    ...overrides,
  };
}

describe("confusionFromEvents", () => {
  it("leere Liste → leere Matrix, kein Throw", () => {
    const result = confusionFromEvents([]);
    expect(result.rows).toEqual([]);
    expect(result.totalErrors).toBe(0);
  });

  it("Events ohne unit → leere Matrix (kein Throw, Bauvertrag §3.3)", () => {
    const events: TaskEvent[] = [
      altEvent({ correct: false, typed: "d" }), // kein unit gesetzt
      altEvent({ correct: true }),
    ];
    const result = confusionFromEvents(events);
    expect(result.rows).toEqual([]);
    expect(result.totalErrors).toBe(0);
  });

  it("Alt-Events (ohne typed/unit/spokenMs) durch Matrix → kein Throw", () => {
    const events: TaskEvent[] = [
      altEvent(),
      altEvent({ correct: false }),
      altEvent({ ms: 500, cells: 2 }),
    ];
    // Darf nicht werfen
    expect(() => confusionFromEvents(events)).not.toThrow();
    const result = confusionFromEvents(events);
    expect(result.rows).toEqual([]);
    expect(result.totalErrors).toBe(0);
  });

  it("Korrekt-Event mit unit erhöht seen, erzeugt KEINEN Verwechsler", () => {
    const events: TaskEvent[] = [
      altEvent({ unit: "a", correct: true }),
      altEvent({ unit: "a", correct: true }),
    ];
    const result = confusionFromEvents(events);
    expect(result.rows).toEqual([]);
    expect(result.totalErrors).toBe(0);
  });

  it("typed === unit wird ignoriert (kein echter Verwechsler)", () => {
    const events: TaskEvent[] = [
      altEvent({ unit: "a", correct: false, typed: "a" }),
    ];
    const result = confusionFromEvents(events);
    expect(result.rows).toEqual([]);
  });

  it("Verwechsler d→f wird korrekt gezählt", () => {
    const events: TaskEvent[] = [
      altEvent({ unit: "d", correct: false, typed: "f" }),
      altEvent({ unit: "d", correct: false, typed: "f" }),
      altEvent({ unit: "d", correct: true }),
    ];
    const result = confusionFromEvents(events);
    expect(result.rows).toHaveLength(1);
    const row = result.rows[0];
    expect(row.expected).toBe("d");
    expect(row.total).toBe(2);
    expect(row.seen).toBe(3); // 2 falsch + 1 richtig
    expect(row.errorRate).toBeCloseTo(2 / 3);
    expect(row.confusedWith[0]).toEqual({ expected: "d", typed: "f", count: 2 });
    expect(result.totalErrors).toBe(2);
  });

  it("mehrere Verwechslungen je Einheit — absteigend nach count", () => {
    const events: TaskEvent[] = [
      altEvent({ unit: "e", correct: false, typed: "i" }),
      altEvent({ unit: "e", correct: false, typed: "i" }),
      altEvent({ unit: "e", correct: false, typed: "a" }),
    ];
    const result = confusionFromEvents(events);
    const row = result.rows[0];
    expect(row.confusedWith[0].typed).toBe("i"); // häufigster zuerst
    expect(row.confusedWith[1].typed).toBe("a");
  });

  it("rows absteigend nach total sortiert", () => {
    const events: TaskEvent[] = [
      altEvent({ unit: "a", correct: false, typed: "b" }),
      altEvent({ unit: "d", correct: false, typed: "f" }),
      altEvent({ unit: "d", correct: false, typed: "f" }),
    ];
    const result = confusionFromEvents(events);
    expect(result.rows[0].expected).toBe("d");
    expect(result.rows[1].expected).toBe("a");
  });

  it("gemischter Schwung mit und ohne unit (Realwelt-Mix)", () => {
    const events: TaskEvent[] = [
      altEvent({ unit: "r", correct: false, typed: "w" }),
      altEvent(), // kein unit (Alt-Event)
      altEvent({ correct: false }), // kein unit, kein typed
      altEvent({ unit: "r", correct: true }), // richtig → nur seen
    ];
    const result = confusionFromEvents(events);
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].expected).toBe("r");
    expect(result.rows[0].seen).toBe(2);
    expect(result.rows[0].total).toBe(1);
  });

  it("errorRate sinkt, wenn mehr korrekte Events dazukommen", () => {
    const withError: TaskEvent[] = [
      altEvent({ unit: "m", correct: false, typed: "u" }),
      altEvent({ unit: "m", correct: true }),
    ];
    const withMore: TaskEvent[] = [
      ...withError,
      altEvent({ unit: "m", correct: true }),
      altEvent({ unit: "m", correct: true }),
    ];
    const r1 = confusionFromEvents(withError).rows[0].errorRate;
    const r2 = confusionFromEvents(withMore).rows[0].errorRate;
    expect(r2).toBeLessThan(r1);
  });
});

describe("topConfusions", () => {
  it("leere Liste → leere topConfusions", () => {
    expect(topConfusions([], 5)).toEqual([]);
  });

  it("gibt max N Paare zurück, absteigend nach count", () => {
    const events: TaskEvent[] = [
      altEvent({ unit: "d", correct: false, typed: "f" }),
      altEvent({ unit: "d", correct: false, typed: "f" }),
      altEvent({ unit: "e", correct: false, typed: "i" }),
    ];
    const top = topConfusions(events, 1);
    expect(top).toHaveLength(1);
    expect(top[0].typed).toBe("f");
  });
});

describe("mnemonicFor", () => {
  it("symmetrisch: (d,f) und (f,d) liefern denselben Text", () => {
    expect(mnemonicFor("d", "f")).toBe(mnemonicFor("f", "d"));
  });

  it("unbekanntes Paar → undefined", () => {
    expect(mnemonicFor("x", "y")).toBeUndefined();
  });

  it("alle sechs MNEMONICS-Paare nachschlagbar", () => {
    const pairs: [string, string][] = [
      ["d", "f"],
      ["e", "i"],
      ["r", "w"],
      ["m", "u"],
      ["h", "j"],
      ["n", "z"],
    ];
    for (const [a, b] of pairs) {
      expect(mnemonicFor(a, b)).toBeTruthy();
      expect(mnemonicFor(b, a)).toBeTruthy();
    }
  });
});
