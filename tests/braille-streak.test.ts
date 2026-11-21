import { describe, expect, it } from "vitest";
import { recordStreak, emptyStreak, DAY_MS, STREAK_FORGIVE_DAYS } from "@/lib/braille/streak";

const DAY = DAY_MS;

describe("recordStreak — erster Eintrag", () => {
  it("erster Eintrag → count 1, lastDay gesetzt", () => {
    const s = recordStreak(emptyStreak(), DAY * 100);
    expect(s.count).toBe(1);
    expect(s.lastDay).toBe(100);
    expect(s.bestCount).toBe(1);
  });
});

describe("recordStreak — gleicher Tag", () => {
  it("gleicher Tag nochmal → unverändert (kein Doppelzählen)", () => {
    const s1 = recordStreak(emptyStreak(), DAY * 5);
    const s2 = recordStreak(s1, DAY * 5 + 3600);
    expect(s2.count).toBe(s1.count);
    expect(s2.lastDay).toBe(s1.lastDay);
  });
});

describe("recordStreak — normale Progression", () => {
  it("gap 1 Tag (gestern geübt) → count + 1", () => {
    const s1 = recordStreak(emptyStreak(), DAY * 10);
    const s2 = recordStreak(s1, DAY * 11);
    expect(s2.count).toBe(2);
    expect(s2.lastDay).toBe(11);
  });

  it("3 Tage hintereinander → count 3", () => {
    let s = emptyStreak();
    s = recordStreak(s, DAY * 1);
    s = recordStreak(s, DAY * 2);
    s = recordStreak(s, DAY * 3);
    expect(s.count).toBe(3);
  });
});

describe("recordStreak — Gnadentag (gap = 1 + STREAK_FORGIVE_DAYS)", () => {
  it("gap 2 Tage → Serie hält (Gnadentag)", () => {
    const s1 = recordStreak(emptyStreak(), DAY * 10);
    const s2 = recordStreak(s1, DAY * 12); // gap = 2
    expect(s2.count).toBe(2); // Serie zählt weiter
  });

  it("gap 3 Tage → Serie reißt → count = 1", () => {
    const s1 = recordStreak(emptyStreak(), DAY * 10);
    s1.count = 5; // Streak-Stand
    const s2 = recordStreak(s1, DAY * 13); // gap = 3
    expect(s2.count).toBe(1); // Neustart
  });
});

describe("recordStreak — bestCount", () => {
  it("bestCount wächst monoton, wird nie kleiner", () => {
    let s = emptyStreak();
    s = recordStreak(s, DAY * 1);
    s = recordStreak(s, DAY * 2);
    s = recordStreak(s, DAY * 3);
    const best3 = s.bestCount;
    // Serie reißen lassen
    s = recordStreak(s, DAY * 10); // gap > 1+FORGIVE → count=1
    expect(s.bestCount).toBeGreaterThanOrEqual(best3);
  });

  it("bestCount steigt bei neuem Rekord", () => {
    let s = emptyStreak();
    for (let d = 1; d <= 7; d++) s = recordStreak(s, DAY * d);
    expect(s.bestCount).toBe(7);
  });
});

describe("recordStreak — STREAK_FORGIVE_DAYS", () => {
  it(`Konstante ist ${STREAK_FORGIVE_DAYS}`, () => {
    expect(STREAK_FORGIVE_DAYS).toBe(1);
  });
});
