/**
 * Wächter für die Rechengeschichten.
 *
 * Eine Sachaufgabe ist für ein Kind mit Blindheit der Ort, an dem die üblichen
 * Schulbücher aussteigen: dort stehen Bilder. Hier steht Text - und der muss
 * auf eine Braillezeile passen, ohne dass mitten im Satz geblättert wird.
 */
import { describe, expect, it } from "vitest";
import { zufall } from "../src/lib/plus/aufgabe";
import { SACHAUFGABEN, sachKern, sachPakete } from "../src/lib/plus/generator/sachaufgaben";
import { erzeugeLauf } from "../src/lib/plus/generator";
import { paket } from "../src/lib/plus/stoffplan";

/** Viele Geschichten aus einem Paket - der Zufall darf nichts Krummes bauen. */
function viele(id: string, wie = 200) {
  const rng = zufall(2026);
  return Array.from({ length: wie }, () => sachKern(id, rng));
}

describe("Jede Geschichte passt auf die Zeile", () => {
  it.each(sachPakete())("%s: keine Zeile über 40 Zeichen", (id) => {
    for (const k of viele(id)) {
      for (const zeile of k.angabe.split("\n")) {
        expect(zeile.length, `${id}: „${zeile}"`).toBeLessThanOrEqual(40);
      }
    }
  });

  it.each(sachPakete())("%s: jeder Satz steht auf seiner eigenen Zeile", (id) => {
    for (const k of viele(id, 50)) {
      for (const zeile of k.angabe.split("\n")) {
        // Innerhalb einer Zeile darf kein Satz enden und ein neuer anfangen.
        expect(zeile, id).not.toMatch(/[.?!] +\S/);
      }
    }
  });

  it.each(sachPakete())("%s: endet mit einer Frage", (id) => {
    for (const k of viele(id, 50)) expect(k.angabe.trimEnd(), id).toMatch(/\?$/);
  });
});

describe("Jede Geschichte geht auf", () => {
  it.each(sachPakete())("%s: die Lösung ist eine Zahl und keine negative", (id) => {
    for (const k of viele(id)) {
      const wert = Number(k.loesung.replace(/[^0-9,-]/g, "").replace(",", "."));
      expect(Number.isFinite(wert), `${id}: ${k.loesung}`).toBe(true);
      expect(wert, `${id}: ${k.angabe} -> ${k.loesung}`).toBeGreaterThanOrEqual(0);
    }
  });

  it("1-18 bleibt im Zwanzigerraum", () => {
    for (const k of viele("1-18")) {
      for (const z of k.zahlen) expect(z, k.angabe).toBeLessThanOrEqual(20);
      expect(Number(k.loesung.replace(/[^0-9]/g, "")), k.angabe).toBeLessThanOrEqual(20);
    }
  });

  it("2-21 bleibt im Hunderterraum", () => {
    for (const k of viele("2-21")) {
      expect(Number(k.loesung.replace(/[^0-9]/g, "")), k.angabe).toBeLessThanOrEqual(100);
    }
  });

  it("lässt die Einheit weg gelten - gerechnet ist gerechnet", () => {
    const mitEinheit = viele("1-18", 300).find((k) => k.sorte === "direkt" && k.auchRichtig?.length);
    expect(mitEinheit).toBeTruthy();
    if (mitEinheit?.sorte === "direkt") {
      expect(mitEinheit.auchRichtig?.[0]).toBe(mitEinheit.loesung.replace(/ \D+$/, ""));
    }
  });
});

describe("Die Geschichten wiederholen sich nicht", () => {
  it.each(sachPakete())("%s: ein Lauf bringt verschiedene Texte", (id) => {
    const lauf = erzeugeLauf(id, { anzahl: 12, saat: 3 });
    expect(lauf.length).toBeGreaterThan(8);
    // Die Excel-Mappe war „total einfallslos, ohne Abwechslung". Plus nicht.
    expect(new Set(lauf.map((a) => a.angabe)).size).toBeGreaterThan(6);
  });

  it("hat für jedes Sach-Paket genug Vorlagen", () => {
    for (const id of sachPakete()) {
      expect(SACHAUFGABEN[id].length, id).toBeGreaterThanOrEqual(8);
    }
  });
});

describe("Die Pakete sind jetzt spielbar", () => {
  it.each(sachPakete())("%s steht als Sachaufgaben-Paket im Stoffplan", (id) => {
    expect(paket(id).art).toBe("sach");
    expect(paket(id).arten).toContain("sach");
  });

  it.each(sachPakete())("%s liefert einen vollen Lauf", (id) => {
    expect(erzeugeLauf(id, { anzahl: 12, saat: 9 })).toHaveLength(12);
  });
});
