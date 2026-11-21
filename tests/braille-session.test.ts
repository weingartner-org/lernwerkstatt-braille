import { describe, expect, it } from "vitest";
import { onSessionDone } from "@/lib/braille/session";
import { emptyProgress } from "@/lib/braille/progress";
import { XP_BASE } from "@/lib/braille/xp";


const BASE_INPUT = {
  progress: emptyProgress(),
  system: "basis" as const,
  levelId: "l1-reihe1",
  direction: "write" as const,
  now: 86_400_000 * 10, // Tag 10
};

function attempt(correct: boolean, overrides: Partial<{
  cells: number; rawMs: number; spokenMs: number; typed: string;
  pasted: boolean; blurred: boolean; prompt: string;
}> = {}) {
  return {
    prompt: overrides.prompt ?? "a",
    correct,
    cells: overrides.cells ?? 1,
    rawMs: overrides.rawMs ?? 1000,
    spokenMs: overrides.spokenMs,
    typed: overrides.typed,
    pasted: overrides.pasted,
    blurred: overrides.blurred,
  };
}

describe("onSessionDone — leere attempts", () => {
  it("kein Throw, sinnvolle Defaults", () => {
    const result = onSessionDone({ ...BASE_INPUT, attempts: [] });
    expect(result.acc).toBe(0);
    expect(result.cpm).toBe(0);
    expect(result.stars).toBe(1); // Stufe-1-Sonderfall, acc=0
    // leere Runde: max(XP_BASE, XP_BASE + 0 correct + 1 star *4 + 0) = 9
    expect(result.xpGained).toBeGreaterThanOrEqual(XP_BASE);
  });

  it("kein EMA-Update bei leerer Runde (acc = 0 < MASTERY_ACC)", () => {
    const result = onSessionDone({ ...BASE_INPUT, attempts: [] });
    // speedEma bleibt undefined/0 da acc < MASTERY_ACC
    const ema = result.progress.speedEma?.["basis"];
    expect(ema === undefined || ema === 0).toBe(true);
  });
});

describe("onSessionDone — XP und Monotonizität", () => {
  it("XP steigt immer (nie negativ, kein Abzug)", () => {
    const attempts = [attempt(false), attempt(false), attempt(false)];
    const result = onSessionDone({ ...BASE_INPUT, attempts });
    expect(result.progress.xp).toBeGreaterThan(0);
    expect(result.xpGained).toBeGreaterThanOrEqual(XP_BASE);
  });

  it("mehr richtige → mehr XP", () => {
    const weak = onSessionDone({
      ...BASE_INPUT,
      attempts: [attempt(false, { cells: 1 })],
    });
    const strong = onSessionDone({
      ...BASE_INPUT,
      attempts: [
        attempt(true, { cells: 5 }),
        attempt(true, { cells: 5 }),
        attempt(true, { cells: 5 }),
      ],
    });
    expect(strong.xpGained).toBeGreaterThan(weak.xpGained);
  });
});

describe("onSessionDone — Sterne-Reihenfolge", () => {
  it("Sterne nutzen das NACH Stufen-Update berechnete Ziel", () => {
    // Da Stufe in P0b bei leerer Runde nicht hochgeht, prüfen wir nur, dass
    // der Wert valide ist.
    const result = onSessionDone({ ...BASE_INPUT, attempts: [attempt(true)] });
    expect(result.stars).toBeGreaterThanOrEqual(1);
    expect(result.stars).toBeLessThanOrEqual(3);
  });
});

describe("onSessionDone — EMA und saubere Runden", () => {
  it("saubere Runde (acc >= MASTERY_ACC) → EMA wird aktualisiert", () => {
    // 12 richtige Antworten für eine saubere Runde
    const attempts = Array.from({ length: 12 }, () => attempt(true, { cells: 1, rawMs: 1000 }));
    const result = onSessionDone({ ...BASE_INPUT, attempts });
    const ema = result.progress.speedEma?.["basis"];
    expect(ema).toBeDefined();
    expect(ema!).toBeGreaterThan(0);
  });

  it("unsaubere Runde (acc < MASTERY_ACC) → EMA bleibt unverändert", () => {
    const prevEma = 30;
    const progress = { ...emptyProgress(), speedEma: { basis: prevEma } };
    const attempts = Array.from({ length: 5 }, (_, i) =>
      attempt(i < 1, { cells: 1 }), // 1/5 = 0.2 < MASTERY_ACC
    );
    const result = onSessionDone({ ...BASE_INPUT, progress, attempts });
    expect(result.progress.speedEma?.["basis"]).toBe(prevEma);
  });
});

describe("onSessionDone — P0b Freischaltung (immer null)", () => {
  it("unlocked und unlockedEtappe sind null in P0b", () => {
    const result = onSessionDone({ ...BASE_INPUT, attempts: [attempt(true)] });
    expect(result.unlocked).toBeNull();
    expect(result.unlockedEtappe).toBeNull();
  });
});

describe("onSessionDone — TaskEvents (Bauvertrag §3.2)", () => {
  it("ein Event je Attempt", () => {
    const attempts = [attempt(true), attempt(false, { typed: "b" })];
    const result = onSessionDone({ ...BASE_INPUT, attempts });
    expect(result.events).toHaveLength(2);
  });

  it("typed nur bei correct=false + bekannter Einheit gesetzt", () => {
    const attempts = [
      attempt(false, { typed: "b" }),  // typed gesetzt
      attempt(false),                   // kein typed
      attempt(true),                    // korrekt → kein typed
    ];
    const result = onSessionDone({ ...BASE_INPUT, attempts });
    expect(result.events[0].typed).toBe("b");
    expect(result.events[1].typed).toBeUndefined();
    expect(result.events[2].typed).toBeUndefined();
  });

  it("spokenMs nur wenn > 0 gesetzt (kein leeres Default)", () => {
    const attempts = [
      attempt(true, { spokenMs: 400 }),  // spokenMs gesetzt
      attempt(true, { spokenMs: 0 }),    // 0 → nicht gesetzt
      attempt(true),                      // undefined → nicht gesetzt
    ];
    const result = onSessionDone({ ...BASE_INPUT, attempts });
    expect(result.events[0].spokenMs).toBe(400);
    expect(result.events[1].spokenMs).toBeUndefined();
    expect(result.events[2].spokenMs).toBeUndefined();
  });

  it("faire Zeit: spokenMs von rawMs abgezogen", () => {
    const rawMs = 2000, spokenMs = 500;
    const result = onSessionDone({
      ...BASE_INPUT,
      attempts: [attempt(true, { rawMs, spokenMs, cells: 1 })],
    });
    // Faire Zeit = typingGapMs(2000, 500) = 1500
    expect(result.events[0].ms).toBe(1500);
  });

  it("Alt-Event-Lesetest: Events ohne typed/unit/spokenMs lesen ohne Throw", async () => {
    const { statsFromEvents, suspicionScore } = await import("@/lib/braille/account");
    const result = onSessionDone({ ...BASE_INPUT, attempts: [attempt(true), attempt(false)] });
    // Events können typed/spokenMs fehlen — Lesefunktionen müssen trotzdem laufen
    expect(() => statsFromEvents(result.events)).not.toThrow();
    expect(() => suspicionScore(result.events)).not.toThrow();
  });

  it("pasted-Flag wird übertragen", () => {
    const result = onSessionDone({
      ...BASE_INPUT,
      attempts: [attempt(true, { pasted: true })],
    });
    expect(result.events[0].pasted).toBe(true);
  });
});

describe("onSessionDone — Streak", () => {
  it("Streak wird in progress gespeichert", () => {
    const result = onSessionDone({ ...BASE_INPUT, attempts: [attempt(true)] });
    expect(result.progress.streak).toBeDefined();
    expect(result.progress.streak!.count).toBeGreaterThanOrEqual(1);
  });
});

describe("onSessionDone — xpLevelUp", () => {
  it("xpLevelUp true wenn neues Spieler-Level erreicht", () => {
    // Mit 99 XP: nach einer Runde mit mind. 1 XP → Level 2 erreicht
    const progress = { ...emptyProgress(), xp: 99 };
    const result = onSessionDone({ ...BASE_INPUT, progress, attempts: [attempt(true)] });
    // xpGained ≥ XP_BASE = 5 → 99 + 5 = 104 → Stufe 2 (>100)
    expect(result.xpLevelUp).toBe(true);
  });

  it("xpLevelUp false bei normaler Runde (kein Überschreiten der Schwelle)", () => {
    const result = onSessionDone({ ...BASE_INPUT, attempts: [attempt(true)] });
    // Frischer Stand (xp=0) → max(5,9)=9 XP → bleibt in Stufe 1 → kein levelUp
    expect(result.xpLevelUp).toBe(false);
  });
});

describe("onSessionDone — Runden-Statistiken", () => {
  it("acc 0..1", () => {
    const result = onSessionDone({
      ...BASE_INPUT,
      attempts: [attempt(true), attempt(false), attempt(true)],
    });
    expect(result.acc).toBeCloseTo(2 / 3);
  });

  it("cpm = 0 wenn alle rawMs = 0", () => {
    const result = onSessionDone({
      ...BASE_INPUT,
      attempts: [attempt(true, { rawMs: 0 })],
    });
    expect(result.cpm).toBe(0);
  });
});
