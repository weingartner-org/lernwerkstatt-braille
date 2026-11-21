/**
 * P4 — Smoke: id-Stabilität, Freischalt-Gating, Alt-Event-Lesetest, lazy API.
 * (Bauvertrag §6.4 Smoke-Tests 1–3, Spec II.8 §6.5–§6.6.)
 */
import { describe, it, expect } from "vitest";
import { LEVELS, levelById, levelsForSystem } from "../src/lib/braille/curriculum";
import { isLevelUnlocked, emptyProgress } from "../src/lib/braille/progress";
import {
  statsFromEvents,
  suspicionScore,
  type TaskEvent,
} from "../src/lib/braille/account";
import { confusionFromEvents } from "../src/lib/braille/confuse";
import {
  ensureLouLoaded,
  toBraille,
  explainBack,
} from "../src/lib/braille/liblouis";

describe("P4 Smoke — id-Stabilität (additiv)", () => {
  it("kurz-kfa01..kfa48 kommen nach Voll/Computer-Levels und vor UEB (P5)", () => {
    const ids = LEVELS.map((l) => l.id);
    const firstKurz = ids.findIndex((id) => id === "kurz-kfa01");
    const lastKurz  = ids.findIndex((id) => id === "kurz-kfa48");
    // 48 aufeinanderfolgende kurz-kfa*-Level
    expect(lastKurz - firstKurz).toBe(47);
    const expected = Array.from({ length: 48 }, (_, i) => `kurz-kfa${String(i + 1).padStart(2, "0")}`);
    expect(ids.slice(firstKurz, lastKurz + 1)).toEqual(expected);
    // Bestehende Anker-ids unverändert auffindbar
    for (const id of ["l1-reihe1", "voll-texte", "comp-texte-erwachsene"]) {
      expect(levelById(id), id).toBeDefined();
    }
  });
});

describe("P4 Smoke — Freischalt-Gating (Kurzschrift erst nach Vollschrift)", () => {
  const vollIds = levelsForSystem("voll").map((l) => l.id);

  it("kurz-kfa01 ist gesperrt, solange voll-texte nicht abgeschlossen ist", () => {
    const p = emptyProgress();
    expect(isLevelUnlocked(p, vollIds, "kurz-kfa01")).toBe(false);
  });

  it("kurz-kfa01 öffnet, sobald voll-texte abgeschlossen ist", () => {
    const p = emptyProgress();
    p.levels["voll-texte"] = { completed: true, bestStars: 3, attempts: 5 };
    expect(isLevelUnlocked(p, vollIds, "kurz-kfa01")).toBe(true);
  });

  it("kurz-kfa02 bleibt zu, bis kurz-kfa01 abgeschlossen ist", () => {
    const p = emptyProgress();
    p.levels["voll-texte"] = { completed: true, bestStars: 3, attempts: 5 };
    expect(isLevelUnlocked(p, vollIds, "kurz-kfa02")).toBe(false);
    p.levels["kurz-kfa01"] = { completed: true, bestStars: 3, attempts: 5 };
    expect(isLevelUnlocked(p, vollIds, "kurz-kfa02")).toBe(true);
  });
});

describe("P4 Smoke — Alt-Event-Lesetest (kein Throw, Abwärtskompatibilität)", () => {
  // Events OHNE typed/unit/spokenMs (Altstand) + neue Kurzschrift-Events.
  const events: TaskEvent[] = [
    { ts: 1, level: "voll-texte", system: "voll", direction: "write", correct: true, ms: 800, cells: 4 },
    { ts: 2, level: "kurz-kfa01", system: "voll", direction: "write", correct: true, ms: 600, cells: 1 },
    { ts: 3, level: "kurz-kfa01", system: "voll", direction: "write", correct: false, ms: 900, cells: 1, unit: "und", typed: "un" },
    { ts: 4, level: "kurz-kfa01", system: "voll", direction: "write", correct: false, ms: 700, cells: 1, unit: "die", typed: "der" },
  ];

  it("statsFromEvents/suspicionScore werfen nicht und liefern plausible Werte", () => {
    expect(() => statsFromEvents(events)).not.toThrow();
    const s = statsFromEvents(events);
    expect(s.tasks).toBe(4);
    expect(s.correct).toBe(2);
    expect(() => suspicionScore(events)).not.toThrow();
  });

  it("confusionFromEvents aggregiert Kurzschrift-Verwechsler (und→un, die→der)", () => {
    const m = confusionFromEvents(events);
    const und = m.rows.find((r) => r.expected === "und");
    expect(und?.confusedWith[0].typed).toBe("un");
    expect(m.rows.find((r) => r.expected === "die")?.confusedWith[0].typed).toBe("der");
  });

  it("Events ohne unit werden ignoriert (kein Throw)", () => {
    const old: TaskEvent[] = [
      { ts: 1, level: "l1-reihe1", system: "basis", direction: "write", correct: true, ms: 500, cells: 1 },
    ];
    expect(() => confusionFromEvents(old)).not.toThrow();
    expect(confusionFromEvents(old).totalErrors).toBe(0);
  });
});

describe("P4 Smoke — lazy liblouis-API exportiert", () => {
  it("ensureLouLoaded, toBraille, explainBack sind Funktionen", () => {
    expect(typeof ensureLouLoaded).toBe("function");
    expect(typeof toBraille).toBe("function");
    expect(typeof explainBack).toBe("function");
  });

  it("explainBack reicht den Soll-Text durch (Feedback, nie Gate)", async () => {
    expect(await explainBack("⠥", "de-g2")).toBe("⠥");
  });
});
