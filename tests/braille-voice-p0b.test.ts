import { describe, expect, it } from "vitest";
import { DOT_POSITION, cellDiff, dots } from "@/lib/braille/cell";
import { announceWrong } from "@/lib/braille/announce";

/**
 * Fehler-Tipp (verortendes Fehler-Feedback) — seit 02.07. in announce.ts
 * (announceWrong mit verbose-Option) statt der alten, nie angeschlossenen
 * voice.ts-Vorbereitung (errorFeedback/speakError/brailleSpoken, entfernt).
 * Bewusst NUR Punkte, keine Buchstaben-Namen (Didaktik-Entscheid Iteration 3).
 */

// f = Punkte 1,2,4 | d = Punkte 1,4,5
const CELL_F = dots(1, 2, 4);
const CELL_D = dots(1, 4, 5);

describe("cellDiff — Punkt-Differenz zweier Zellen", () => {
  it("f vs d: Punkt 2 fehlt, Punkt 5 ist zu viel", () => {
    expect(cellDiff(CELL_F, CELL_D)).toEqual({ missing: [2], extra: [5] });
  });

  it("identische Zellen: kein Unterschied", () => {
    expect(cellDiff(CELL_F, CELL_F)).toEqual({ missing: [], extra: [] });
  });

  it("Extremwerte werfen nicht", () => {
    expect(() => cellDiff(0, 255)).not.toThrow();
    expect(cellDiff(0, 255)).toEqual({
      missing: [],
      extra: [1, 2, 3, 4, 5, 6, 7, 8],
    });
  });
});

describe("DOT_POSITION — sprechbare Punkt-Lagen", () => {
  it("kennt alle acht Punkte", () => {
    for (let d = 1; d <= 8; d++) expect(DOT_POSITION[d]).toBeTruthy();
    expect(DOT_POSITION[1]).toBe("oben links");
    expect(DOT_POSITION[6]).toBe("unten rechts");
    expect(DOT_POSITION[8]).toBe("ganz unten rechts");
  });
});

describe("announceWrong verbose — Fehler-Tipp", () => {
  it("ohne verbose: nur die Soll-Punkte (bisheriges Verhalten)", () => {
    const p = announceWrong({
      direction: "write",
      prompt: "im",
      typedCell: CELL_D,
      targetCell: CELL_F,
    });
    expect(p.text).toBe("Punkte 1, 2, 4");
    expect(p.brailleText).toBeTruthy();
  });

  it("genau ein fehlender Punkt → mit Lage", () => {
    // Ziel 1,2 — getippt 1 → Punkt 2 fehlt (Mitte links)
    const p = announceWrong({
      direction: "write",
      prompt: "b",
      typedCell: dots(1),
      targetCell: dots(1, 2),
      verbose: true,
    });
    expect(p.text).toBe("Punkte 1, 2. Es fehlt Punkt 2 — Mitte links.");
  });

  it("genau ein Punkt zu viel → mit Lage", () => {
    const p = announceWrong({
      direction: "write",
      prompt: "a",
      typedCell: dots(1, 4),
      targetCell: dots(1),
      verbose: true,
    });
    expect(p.text).toBe("Punkt 1. Punkt 4 — oben rechts — ist zu viel.");
  });

  it("gemischt (f vs d): beide Unterschiede, ohne Lage-Angaben", () => {
    const p = announceWrong({
      direction: "write",
      prompt: "f",
      typedCell: CELL_D,
      targetCell: CELL_F,
      verbose: true,
    });
    expect(p.text).toBe(
      "Punkte 1, 2, 4. Es fehlt Punkt 2 und Punkt 5 ist zu viel.",
    );
  });

  it("mehrere fehlende Punkte → Nummern-Liste", () => {
    const p = announceWrong({
      direction: "write",
      prompt: "x",
      typedCell: dots(1),
      targetCell: dots(1, 3, 4, 6),
      verbose: true,
    });
    expect(p.text).toBe("Punkte 1, 3, 4, 6. Es fehlen die Punkte 3, 4, 6.");
  });

  it("verbose ohne typedCell (Leertaste erwartet o. Ä.) → kein Tipp, kein Throw", () => {
    const p = announceWrong({
      direction: "write",
      prompt: "a b",
      targetCell: dots(1),
      verbose: true,
    });
    expect(p.text).toBe("Punkt 1");
  });
});
