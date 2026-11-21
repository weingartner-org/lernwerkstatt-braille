/**
 * ★ Johannes, 26.09.2026: „Rechendreiecke seltener". Höchstens eines je Runde -
 * in „Ich wähle" (ein Paket) wie im Training (ein Plan aus Paketen).
 */
import { describe, expect, it } from "vitest";
import { zufall } from "../src/lib/plus/aufgabe";
import { RUNDE } from "../src/lib/plus/coach";
import { erzeugeFolge, erzeugeLauf, SELTENE_FORMEN } from "../src/lib/plus/generator";
import { PAKETE } from "../src/lib/plus/stoffplan";

const mitDreieck = PAKETE.filter((p) => p.arten.includes("dreieck")).map((p) => p.id);

describe("Seltene Formen", () => {
  it("das Rechendreieck ist eine", () => {
    expect(SELTENE_FORMEN).toContain("dreieck");
    expect(mitDreieck.length).toBeGreaterThan(0);
  });

  it.each(mitDreieck)("%s: höchstens ein Rechendreieck je Runde, und im Mittel selten", (id) => {
    let gesamt = 0;
    for (let saat = 1; saat <= 300; saat++) {
      const lauf = erzeugeLauf(id, { anzahl: RUNDE, saat });
      expect(lauf).toHaveLength(RUNDE);
      const n = lauf.filter((a) => a.art === "dreieck").length;
      expect(n, `Saat ${saat}`).toBeLessThanOrEqual(1);
      gesamt += n;
    }
    // Vorher kam es in etwa jeder sechsten Aufgabe - jetzt in weniger als jeder zehnten.
    expect(gesamt / (300 * RUNDE)).toBeLessThan(0.1);
  });

  it("im Training: höchstens eines je Runde, auch wenn der Plan nur aus einem Paket besteht", () => {
    for (const id of mitDreieck) {
      for (let saat = 1; saat <= 200; saat++) {
        const folge = erzeugeFolge(Array(RUNDE).fill(id), zufall(saat));
        expect(folge.filter((a) => a.art === "dreieck").length, `${id} Saat ${saat}`).toBeLessThanOrEqual(1);
      }
    }
  });
});
