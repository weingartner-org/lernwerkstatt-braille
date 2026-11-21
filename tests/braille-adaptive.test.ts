import { describe, it, expect } from "vitest";
import {
  MASTERY_ACC,
  MASTERY_MIN_ATTEMPTS,
  SOLID_STREAK,
  STUFE_MAX,
  STUFE_MIN,
  STUFE_MIN_AT,
  STUFE_START,
  emptyMastery,
  emptyStufe,
  isLevelMastered,
  itemWeight,
  masteryProgress,
  pickWeighted,
  recordAttempt,
  recordStufe,
  stufeConfig,
  type LevelMastery,
  type SystemStufe,
} from "../src/lib/braille/adaptive";

// Kleiner deterministischer Zufall (mulberry32) — reproduzierbare Ziehungen.
function rngFrom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Viele Eingaben hintereinander verbuchen (alle für denselben oder je eigenen Prompt). */
function play(
  m: LevelMastery,
  results: ReadonlyArray<[string, boolean]>,
): LevelMastery {
  return results.reduce((acc, [p, ok]) => recordAttempt(acc, p, ok), m);
}

describe("recordAttempt — Fenster & Aufgaben-Statistik", () => {
  it("zählt streak, seen und wrong korrekt", () => {
    let m = emptyMastery();
    m = recordAttempt(m, "a", true);
    m = recordAttempt(m, "a", true);
    m = recordAttempt(m, "a", false);
    expect(m.items["a"]).toEqual({ streak: 0, seen: 3, wrong: 1 });
    m = recordAttempt(m, "a", true);
    expect(m.items["a"]).toEqual({ streak: 1, seen: 4, wrong: 1 });
  });

  it("hält das Fenster auf höchstens MASTERY_WINDOW Einträgen", () => {
    let m = emptyMastery();
    for (let i = 0; i < 40; i++) m = recordAttempt(m, "x", true);
    expect(m.window.length).toBeLessThanOrEqual(16);
    // items akkumulieren über das Fenster hinaus
    expect(m.items["x"].seen).toBe(40);
  });

  it("ist rein (verändert das Eingabe-Objekt nicht)", () => {
    const m0 = emptyMastery();
    recordAttempt(m0, "a", true);
    expect(m0.window).toHaveLength(0);
    expect(m0.items).toEqual({});
  });
});

describe("itemWeight — schwache Aufgaben kommen öfter (B)", () => {
  it("neu > gefestigt, zuletzt-falsch am höchsten", () => {
    expect(itemWeight(undefined)).toBe(2); // noch nie gestellt
    expect(itemWeight({ streak: 0, seen: 3, wrong: 2 })).toBe(4); // zuletzt falsch
    expect(itemWeight({ streak: 1, seen: 2, wrong: 0 })).toBe(2); // auf dem Weg
    expect(itemWeight({ streak: SOLID_STREAK, seen: 5, wrong: 0 })).toBe(1); // sitzt
  });
});

describe("pickWeighted — Gewichtung & Vermeidung", () => {
  it("vermeidet den direkten Wiederholer", () => {
    const m = emptyMastery();
    const pool = ["a", "b", "c"];
    for (let i = 0; i < 50; i++) {
      const pick = pickWeighted(pool, m, { avoid: "b", rnd: rngFrom(i) });
      expect(pick).not.toBe("b");
    }
  });

  it("zieht zuletzt-falsche Aufgaben deutlich häufiger als gefestigte", () => {
    // „a" zuletzt falsch (Gewicht 4), „b" gefestigt (Gewicht 1)
    let m = emptyMastery();
    m = play(m, [
      ["b", true],
      ["b", true],
      ["b", true],
      ["a", false],
    ]);
    const rnd = rngFrom(123);
    let aCount = 0;
    const N = 4000;
    for (let i = 0; i < N; i++) {
      if (pickWeighted(["a", "b"], m, { rnd }) === "a") aCount++;
    }
    // Erwartung ~80 % (4 von 5); großzügige Schranken gegen Flakiness.
    expect(aCount / N).toBeGreaterThan(0.7);
    expect(aCount / N).toBeLessThan(0.9);
  });

  it("shortBias bevorzugt kurze Aufgaben", () => {
    const m = emptyMastery();
    const pool = ["a", "ananas", "x", "elefanten"];
    const rnd = rngFrom(7);
    let shortCount = 0;
    const N = 3000;
    for (let i = 0; i < N; i++) {
      const pick = pickWeighted(pool, m, { shortBias: 1, rnd });
      if (pick.length <= 1) shortCount++;
    }
    // ohne Bias wären es ~50 % der Ziehungen; mit vollem Bias deutlich mehr.
    expect(shortCount / N).toBeGreaterThan(0.6);
  });
});

describe("isLevelMastered — Gate (A)", () => {
  it("verlangt genug Eingaben", () => {
    let m = emptyMastery();
    for (let i = 0; i < MASTERY_MIN_ATTEMPTS - 1; i++) m = recordAttempt(m, "w" + i, true);
    expect(isLevelMastered(m)).toBe(false);
  });

  it("ist erfüllt bei genug Eingaben, hoher Treffsicherheit und keinem offenen Wackler", () => {
    let m = emptyMastery();
    for (let i = 0; i < MASTERY_MIN_ATTEMPTS + 2; i++) m = recordAttempt(m, "w" + i, true);
    expect(isLevelMastered(m)).toBe(true);
    expect(masteryProgress(m)).toBe(1);
  });

  it("scheitert unter der Treffsicherheitsschwelle", () => {
    // abwechselnd richtig/falsch ⇒ 50 % < 90 %
    let m = emptyMastery();
    for (let i = 0; i < 16; i++) m = recordAttempt(m, "w" + i, i % 2 === 0);
    expect(mean16(m)).toBeLessThan(MASTERY_ACC);
    expect(isLevelMastered(m)).toBe(false);
  });

  it("scheitert, solange eine Aufgabe aus dem Fenster noch offen falsch ist", () => {
    // 12 verschiedene richtig, dann EIN frischer Patzer auf „zz" (bleibt streak 0)
    let m = emptyMastery();
    for (let i = 0; i < 14; i++) m = recordAttempt(m, "w" + i, true);
    m = recordAttempt(m, "zz", false);
    expect(isLevelMastered(m)).toBe(false);
    // wird „zz" wieder richtig gemacht, ist das Level gemeistert
    m = recordAttempt(m, "zz", true);
    expect(isLevelMastered(m)).toBe(true);
  });
});

function mean16(m: LevelMastery): number {
  const w = m.window.slice(-16);
  return w.reduce((a, x) => a + (x.correct ? 1 : 0), 0) / w.length;
}

describe("recordStufe — Anforderungsstufe adaptiert nach Genauigkeit (C)", () => {
  it("startet bei STUFE_START und ändert sich erst nach STUFE_MIN_AT Eingaben", () => {
    let s: SystemStufe = emptyStufe();
    expect(s.stufe).toBe(STUFE_START);
    for (let i = 0; i < STUFE_MIN_AT - 1; i++) s = recordStufe(s, true);
    expect(s.stufe).toBe(STUFE_START); // noch nicht genug Belege
  });

  it("steigt bei durchweg richtigen Eingaben", () => {
    let s: SystemStufe = emptyStufe();
    for (let i = 0; i < STUFE_MIN_AT; i++) s = recordStufe(s, true);
    expect(s.stufe).toBe(STUFE_START + 1);
    expect(s.window).toHaveLength(0); // Fenster nach Wechsel geleert
  });

  it("sinkt bei schwacher Genauigkeit", () => {
    let s: SystemStufe = emptyStufe();
    // 1 von 4 richtig ⇒ 25 % < DOWN, aber > RESET? 25 % < 50 % ⇒ Reset
    for (let i = 0; i < STUFE_MIN_AT; i++) s = recordStufe(s, i === 0);
    expect(s.stufe).toBe(STUFE_MIN);
  });

  it("geht um genau eine Stufe runter im mittleren Bereich", () => {
    // Stufe erst hochziehen, dann 2 von 4 (50 %) → DOWN-Bereich (≥RESET, <DOWN)
    let s: SystemStufe = { stufe: 6, window: [] };
    s = recordStufe(s, true);
    s = recordStufe(s, true);
    s = recordStufe(s, false);
    s = recordStufe(s, false); // 50 % → −1
    expect(s.stufe).toBe(5);
  });

  it("bleibt in den Grenzen 1..10", () => {
    let s: SystemStufe = { stufe: STUFE_MAX, window: [] };
    for (let i = 0; i < 40; i++) s = recordStufe(s, true);
    expect(s.stufe).toBe(STUFE_MAX);
    s = { stufe: STUFE_MIN, window: [] };
    for (let i = 0; i < 40; i++) s = recordStufe(s, false);
    expect(s.stufe).toBe(STUFE_MIN);
  });
});

describe("stufeConfig — Hilfestellung je Stufe", () => {
  it("zeigt unten viel Stütze, oben nichts", () => {
    expect(stufeConfig(1)).toEqual({ showLegend: true, prominentHint: true, shortBias: 1 });
    const mid = stufeConfig(5);
    expect(mid.showLegend).toBe(false);
    expect(mid.prominentHint).toBe(true);
    expect(mid.shortBias).toBeCloseTo(0.2); // sanfte Abnahme, erst Stufe 6 ganz aus
    expect(stufeConfig(6).shortBias).toBe(0);
    const top = stufeConfig(10);
    expect(top.showLegend).toBe(false);
    expect(top.prominentHint).toBe(false);
    expect(top.shortBias).toBe(0);
  });
});
