import { describe, it, expect } from "vitest";
import { ZOOM_LEVELS } from "../src/lib/braille/a11y";

// Kontrastmodi sind plattformweit in src/lib/contrast.ts verwaltet;
// der Braille-Trainer nutzt den globalen Schalter in der Kopfzeile.

describe("Zoomstufen", () => {
  it("starten bei 1 und steigen monoton", () => {
    expect(ZOOM_LEVELS[0]).toBe(1);
    for (let i = 1; i < ZOOM_LEVELS.length; i++) {
      expect(ZOOM_LEVELS[i]).toBeGreaterThan(ZOOM_LEVELS[i - 1]);
    }
  });
});
