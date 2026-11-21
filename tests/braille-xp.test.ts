import { describe, expect, it } from "vitest";
import { roundXp, XP_BASE, XP_PER_CORRECT, XP_STAR_BONUS, XP_UNLOCK_BONUS } from "@/lib/braille/xp";

describe("roundXp — jede Runde belohnt, nie unter XP_BASE", () => {
  it("schwächste Runde (0 richtig, 1 Stern, kein Unlock) ≥ XP_BASE", () => {
    const result = roundXp({ correct: 0, stars: 1, unlocked: false });
    expect(result).toBeGreaterThanOrEqual(XP_BASE);
    // Konkret: Math.max(5, 5 + 0*1 + 1*4 + 0) = max(5, 9) = 9
    expect(result).toBe(9);
  });

  it("starke Runde: 10 richtig, 3 Sterne, Unlock", () => {
    const result = roundXp({ correct: 10, stars: 3, unlocked: true });
    expect(result).toBe(XP_BASE + 10 * XP_PER_CORRECT + 3 * XP_STAR_BONUS + XP_UNLOCK_BONUS);
    expect(result).toBe(5 + 10 + 12 + 15); // = 42
  });

  it("2 Sterne kein Unlock: 5 + korrekt*1 + 2*4", () => {
    const result = roundXp({ correct: 5, stars: 2, unlocked: false });
    expect(result).toBe(5 + 5 + 8); // = 18
  });

  it("Unlock-Bonus addiert sich immer", () => {
    const ohne = roundXp({ correct: 3, stars: 2, unlocked: false });
    const mit = roundXp({ correct: 3, stars: 2, unlocked: true });
    expect(mit - ohne).toBe(XP_UNLOCK_BONUS);
  });

  it("negative correct-Werte werden auf 0 gesetzt (kein Abzug)", () => {
    const result = roundXp({ correct: -5, stars: 1, unlocked: false });
    expect(result).toBeGreaterThanOrEqual(XP_BASE);
  });

  it("Sterne unter 1 werden auf 1 geklammert", () => {
    const result1 = roundXp({ correct: 0, stars: 0, unlocked: false });
    const result2 = roundXp({ correct: 0, stars: 1, unlocked: false });
    expect(result1).toBe(result2);
  });

  it("Sterne über 3 werden auf 3 geklammert", () => {
    const result3 = roundXp({ correct: 0, stars: 3, unlocked: false });
    const result4 = roundXp({ correct: 0, stars: 4, unlocked: false });
    expect(result3).toBe(result4);
  });

  it("ist monoton: mehr korrekte Zellen → mehr XP", () => {
    const less = roundXp({ correct: 2, stars: 2, unlocked: false });
    const more = roundXp({ correct: 8, stars: 2, unlocked: false });
    expect(more).toBeGreaterThan(less);
  });

  it("ist niemals negativ", () => {
    const cases = [
      { correct: 0, stars: 1, unlocked: false },
      { correct: 0, stars: 0, unlocked: false },
      { correct: -100, stars: 0, unlocked: false },
    ];
    for (const c of cases) {
      expect(roundXp(c)).toBeGreaterThan(0);
    }
  });
});
