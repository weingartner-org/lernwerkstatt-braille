/**
 * Wächter für die Mechanik der Brailleeingabe.
 *
 * Diese Datei prüft nur, dass aus Punkten Zeichen werden und zurück. Was ein
 * Zeichen bedeutet, prüfen die Tabellen-Tests; den Griff auf der Tastatur
 * prüft `braille-chord.test.ts` - die Mechanik gehört Punktgenau, Plus
 * benutzt sie mit.
 */
import { describe, expect, it } from "vitest";
import {
  BRAILLE_LEER, punkteText, punkteZuZeichen, textZuPunkte, zeichenZuPunkte,
} from "../src/lib/plus/braille/punkte";

describe("Punkte und Zeichen", () => {
  it.each([
    [[1], "⠁"], [[1, 2], "⠃"], [[1, 4], "⠉"], [[1, 2, 4], "⠋"],
    [[3, 4, 5, 6], "⠼"], [[2, 3, 5], "⠖"], [[3, 6], "⠤"], [[2, 3, 5, 6], "⠶"],
  ])("Punkte %s ergeben %s", (punkte, zeichen) => {
    expect(punkteZuZeichen(punkte as number[])).toBe(zeichen);
  });

  it("das leere Zeichen hat keine Punkte", () => {
    expect(BRAILLE_LEER).toBe("⠀");
    expect(zeichenZuPunkte(BRAILLE_LEER)).toEqual([]);
  });

  it("der Weg zurück führt zu denselben Punkten", () => {
    for (let bits = 0; bits < 256; bits++) {
      const zeichen = String.fromCodePoint(0x2800 + bits);
      expect(punkteZuZeichen(zeichenZuPunkte(zeichen))).toBe(zeichen);
    }
  });

  it("kennt die Punktschreibweise der Regelwerke", () => {
    expect(punkteText([3, 4, 5, 6])).toBe("3-4-5-6");
    expect(punkteText([])).toBe("leer");
    expect(textZuPunkte("3-4-5-6")).toEqual([3, 4, 5, 6]);
    expect(textZuPunkte("leer")).toEqual([]);
  });

  it("weist unmögliche Punkte ab", () => {
    expect(() => punkteZuZeichen([9])).toThrow();
    expect(() => textZuPunkte("2-9")).toThrow();
  });
});
