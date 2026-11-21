import { describe, expect, it } from "vitest";
import {
  roundStars,
  speedTargetCpm,
  updateSpeedEma,
  speedScore,
  accuracyScore,
  STUFE_TARGET_CPM,
  EMA_ALPHA,
  SLOW_FLOOR_CPM,

} from "@/lib/braille/stars";

describe("roundStars — Stufe-1-Sonderfall (target ≤ 0)", () => {
  it("perfekte Treffsicherheit → 3 Sterne, egal wie langsam", () => {
    expect(roundStars(1.0, 0, 0)).toBe(3);
    expect(roundStars(0.98, 0, 0)).toBe(3);
  });

  it("gute Treffsicherheit → 2 Sterne", () => {
    expect(roundStars(0.95, 0, 0)).toBe(2);
    expect(roundStars(0.92, 0, 0)).toBe(2);
  });

  it("schwächere Treffsicherheit → 1 Stern (nie 0)", () => {
    expect(roundStars(0.8, 0, 0)).toBe(1);
    expect(roundStars(0.0, 0, 0)).toBe(1);
  });

  it("Stufe 1 ignoriert Tempo — auch speedEma 200 ändert nichts", () => {
    expect(roundStars(1.0, 200, 0)).toBe(3);
    expect(roundStars(0.5, 200, 0)).toBe(1);
  });
});

describe("roundStars — mit Tempo-Ziel (Stufe ≥ 2)", () => {
  it("perfekt + Ziel erreicht → 3 Sterne", () => {
    expect(roundStars(0.98, 32, 32)).toBe(3);
  });

  it("schlechte Acc, egal wie schnell → 1 Stern", () => {
    expect(roundStars(0.8, 0, 16)).toBe(1);
  });
});

describe("speedTargetCpm", () => {
  it("Stufe 1 → 0 (Tempo zählt nicht)", () => {
    expect(speedTargetCpm(1, undefined)).toBe(0);
    expect(speedTargetCpm(1, 200)).toBe(0);
  });

  it("ohne speedEma → reines Stufen-Ziel", () => {
    expect(speedTargetCpm(3, undefined)).toBe(STUFE_TARGET_CPM[3]);
    expect(speedTargetCpm(5, undefined)).toBe(STUFE_TARGET_CPM[5]);
  });

  it("FAST_CAP_MULT-Deckel greift für sehr schnelle Kinder", () => {
    // speedEma=100, Stufe 3 → Stufen-Ziel 16, Deckel = 16 * 1.4 = 22.4
    const result = speedTargetCpm(3, 100);
    expect(result).toBeCloseTo(22.4);
  });

  it("SLOW_FLOOR_CPM-Untergrenze greift für langsame Kinder", () => {
    // speedEma=10, Stufe 5 → min(10, 20) = 20 (Untergrenze)
    const result = speedTargetCpm(5, 10);
    expect(result).toBeCloseTo(SLOW_FLOOR_CPM);
  });

  it("normaler Fall: speedEma zwischen Floor und Cap", () => {
    // speedEma=25, Stufe 5 → target=25 (zwischen 20 und 26*1.4=36.4)
    const result = speedTargetCpm(5, 25);
    expect(result).toBeCloseTo(25);
  });

  it("Stufe 10 → höchstes Ziel", () => {
    expect(speedTargetCpm(10, undefined)).toBe(STUFE_TARGET_CPM[10]);
    expect(speedTargetCpm(10, undefined)).toBeGreaterThan(0);
  });
});

describe("updateSpeedEma", () => {
  it("erster Wert → cpm direkt übernehmen", () => {
    expect(updateSpeedEma(undefined, 30)).toBe(30);
    expect(updateSpeedEma(0, 30)).toBe(30);
  });

  it("EMA-Formel: prev*(1-alpha) + cpm*alpha", () => {
    const result = updateSpeedEma(20, 40);
    expect(result).toBeCloseTo(20 * (1 - EMA_ALPHA) + 40 * EMA_ALPHA);
  });

  it("EMA konvergiert: viele gleiche Werte → bleibt stabil", () => {
    let ema: number | undefined;
    for (let i = 0; i < 20; i++) ema = updateSpeedEma(ema, 30);
    expect(ema!).toBeCloseTo(30, 1);
  });
});

describe("speedScore", () => {
  it("target ≤ 0 → immer 0", () => {
    expect(speedScore(100, 0)).toBe(0);
  });

  it("cpm = target → 1", () => {
    expect(speedScore(30, 30)).toBe(1);
  });

  it("cpm > target → geklammert auf 1", () => {
    expect(speedScore(60, 30)).toBe(1);
  });

  it("cpm = 0 → 0", () => {
    expect(speedScore(0, 30)).toBe(0);
  });
});

describe("accuracyScore", () => {
  it("unter ACC0 → 0", () => {
    expect(accuracyScore(0.7)).toBe(0);
    expect(accuracyScore(0.0)).toBe(0);
  });

  it("ab ACC1 → 1", () => {
    expect(accuracyScore(0.98)).toBe(1);
    expect(accuracyScore(1.0)).toBe(1);
  });

  it("zwischen ACC0 und ACC1 → linear 0..1", () => {
    const result = accuracyScore(0.89); // = (0.89 - 0.8) / (0.98 - 0.8)
    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThan(1);
  });
});

describe("STUFE_TARGET_CPM", () => {
  it("Index 0 ungenutzt, Stufe 1 = 0, geometrisch steigend bis Stufe 10", () => {
    expect(STUFE_TARGET_CPM[0]).toBe(0);
    expect(STUFE_TARGET_CPM[1]).toBe(0);
    expect(STUFE_TARGET_CPM[10]).toBeGreaterThan(STUFE_TARGET_CPM[9]);
  });

  it("hat genau 11 Einträge (Index 0–10)", () => {
    expect(STUFE_TARGET_CPM.length).toBe(11);
  });
});
