/**
 * Pin-Tests des Punktgenau-Tiefentests vom 09.07.2026 — jede Gruppe pinnt
 * einen dort bewiesenen Fund gegen Rückfall:
 *  F1 „Erweiterte Zahlen" stellten Zufallszahlen statt römischer Zahlen & Co.
 *  F2 Express-Etappe u2 hatte einen leeren Aufgaben-Pool (tote Etappe).
 *  F3 Text-Etappen konnten nie „sitzen" → e20b war für immer gesperrt.
 *  F4 %/§ hatten keine 6-Punkt-Zellen (jetzt liblouis-belegt, MULTI_SYMBOLS_6).
 *  F5 Ansage „Jetzt frei" log bei freier Etappenwahl (jetzt „Als Nächstes").
 */
import { describe, expect, it } from "vitest";
import { buildAreas, etappeToLevel, isEtappeDone, isUnlocked } from "../src/lib/braille/areas";
import { emptyProgress } from "../src/lib/braille/progress";
import { MULTI_SYMBOLS_6 } from "../src/lib/braille/tables";
import { textToCells } from "../src/lib/braille/engine";
import { cellDots } from "../src/lib/braille/cell";
import { announceLevelDone } from "../src/lib/braille/announce";

const byId = (id: string, opts?: Parameters<typeof buildAreas>[0]) => {
  for (const a of buildAreas(opts)) {
    const et = a.etappen.find((e) => e.id === id);
    if (et) return { area: a, et };
  }
  throw new Error(`Etappe ${id} nicht gefunden`);
};

describe("F1 — Zusatz-Etappen b13a–e nutzen ihre EIGENEN Aufgaben", () => {
  it("b13a–e docken als kind 'words' an (kindOverride statt Generator)", () => {
    for (const id of ["b13a", "b13b", "b13c", "b13d", "b13e"]) {
      const { et } = byId(id, { extendedNumbers: true });
      const level = etappeToLevel(et);
      expect(level.kind, id).toBe("words");
      expect(level.items.length, id).toBeGreaterThan(0);
    }
  });

  it("b13a übt römische Zahlen (nicht Zufallszahlen)", () => {
    const { et } = byId("b13a", { extendedNumbers: true });
    expect(etappeToLevel(et).items).toContain("IV");
  });

  it("b13 (Zahlen) bleibt beim Generator-Level (kind 'numbers')", () => {
    const { et } = byId("b13");
    expect(etappeToLevel(et).kind).toBe("numbers");
  });

  it("Rechnen-Etappen bleiben kind 'math' (id-Weiche im Deck-Generator)", () => {
    for (const id of ["b-rechnen-plus", "b-rechnen-minus", "b-rechnen-mal"]) {
      const { et } = byId(id);
      expect(etappeToLevel(et).kind, id).toBe("math");
    }
  });
});

describe("F2 — Express-Etappe u2 hat wieder Aufgaben", () => {
  it("u2-Pool ist nicht leer und besteht aus Umlaut-Wörtern", () => {
    const { et } = byId("u2", { expressComputer: true });
    const items = etappeToLevel(et).items;
    expect(items.length).toBeGreaterThan(0);
    for (const w of items) expect(w, w).toMatch(/[äöüß]/i);
  });
});

describe("F3 — Text-Etappen schließen über completed ab (Gate-Sackgasse)", () => {
  it("e20 gilt mit completed-Flag als gemeistert → e20b ist frei", () => {
    const computer = buildAreas().find((a) => a.key === "computer")!;
    const idxE20b = computer.etappen.findIndex((e) => e.id === "e20b");
    const e20 = computer.etappen.find((e) => e.id === "e20")!;

    const p = emptyProgress();
    expect(isEtappeDone(e20, p)).toBe(false);
    expect(isUnlocked(computer, idxE20b, p)).toBe(false);

    p.levels["e20"] = { completed: true, bestStars: 0, attempts: 1 };
    expect(isEtappeDone(e20, p)).toBe(true);
    expect(isUnlocked(computer, idxE20b, p)).toBe(true);
  });
});

describe("F4 — % und § haben liblouis-belegte 6-Punkt-Zellen", () => {
  it("% = ⠼⠚⠴ (Zahlzeichen · j · 3-5-6), § = Punkte 3-4-6", () => {
    expect(MULTI_SYMBOLS_6["%"].map((c) => cellDots(c))).toEqual([
      [3, 4, 5, 6],
      [2, 4, 5],
      [3, 5, 6],
    ]);
    expect(MULTI_SYMBOLS_6["§"].map((c) => cellDots(c))).toEqual([[3, 4, 6]]);
  });

  it("textToCells transkribiert '50%' und '§1' vollständig (kein stummes Auslassen)", () => {
    // 50% = Zahlzeichen · e · j · [Prozent: Zahlzeichen · j · 3-5-6]
    expect(textToCells("50%", { system: "basis" }).map((c) => cellDots(c))).toEqual([
      [3, 4, 5, 6],
      [1, 5],
      [2, 4, 5],
      [3, 4, 5, 6],
      [2, 4, 5],
      [3, 5, 6],
    ]);
    // §1 = § · Zahlzeichen · a
    expect(textToCells("§1", { system: "basis" }).map((c) => cellDots(c))).toEqual([
      [3, 4, 6],
      [3, 4, 5, 6],
      [1],
    ]);
  });
});

describe("F5 — Meister-Ansage verspricht keine falsche Freischaltung", () => {
  it("sagt „Als Nächstes:“ statt „Jetzt frei:“ (stimmt auch bei freier Wahl)", () => {
    const a = announceLevelDone(3, undefined, "Zahlen mit dem Zahlzeichen");
    expect(a.text).toContain("Als Nächstes: Zahlen mit dem Zahlzeichen.");
    expect(a.text).not.toContain("Jetzt frei");
  });
});
