/**
 * Wächter für das Prüfen von Termen.
 *
 * ★ Gemessen am 23.09.2026 beim Mitlesen von Stufe 7: Terme wurden nur als
 * Text verglichen. `10x +14y` statt `14y +10x` war „Noch nicht" - und in 7-14
 * war das zusammengefasste `6y -36x` falsch, weil die Lösung `36y -30y -36x`
 * hieß. Ein Kind, das besser gerechnet hat als die Lösung, verlor.
 *
 * Zwei Dinge gelten zugleich:
 *   · Gleichwertig heißt: an jeder Stelle derselbe Wert.
 *   · Die FORM bleibt Aufgabe. Wer die Angabe abschreibt, hat nichts gerechnet -
 *     beim Zusammenfassen nicht und beim Herausheben auch nicht.
 */
import { describe, expect, it } from "vitest";
import { istRichtig, type Aufgabe } from "../src/lib/plus/aufgabe";
import { bedienbarePakete, erzeugeLauf } from "../src/lib/plus/generator";

const term = (paket: string, angabe: string, loesung: string): Aufgabe =>
  ({ paket, art: "ergebnis", op: "term", angabe, loesung, zahlen: [] });

describe("Zusammenfassen (7-12, 7-13)", () => {
  const a = term("7-12", "6y +8y +5x +5x =", "14y +10x");

  it("die Reihenfolge der Glieder ist frei", () => {
    expect(istRichtig("14y +10x", a)).toBe(true);
    expect(istRichtig("10x +14y", a)).toBe(true);
    expect(istRichtig("10x+14y", a)).toBe(true);
  });

  it("★ die abgeschriebene Angabe gilt nicht - sie hat mehr Glieder", () => {
    expect(istRichtig("6y +8y +5x +5x", a)).toBe(false);
    expect(istRichtig("14y +5x +5x", a)).toBe(false);
  });

  it("falsch bleibt falsch", () => {
    expect(istRichtig("14y +11x", a)).toBe(false);
    expect(istRichtig("14x +10y", a)).toBe(false);
    expect(istRichtig("24xy", a)).toBe(false);
  });

  it("ein Glied mit Koeffizient 1 und ein negatives Vorzeichen vorn", () => {
    const b = term("7-12", "8y -x +5y =", "13y -x");
    expect(istRichtig("-x +13y", b)).toBe(true);
    expect(istRichtig("-1x +13y", b)).toBe(true);
  });

  it("Minus vor der Klammer: die Klammer darf nicht stehen bleiben", () => {
    const c = term("7-13", "8y -(-4x -8y) =", "16y +4x");
    expect(istRichtig("4x +16y", c)).toBe(true);
    expect(istRichtig("8y -(-4x -8y)", c)).toBe(false);
  });
});

describe("Ausmultiplizieren und Herausheben (7-14)", () => {
  it("★ zusammengefasst ist besser, nicht falsch", () => {
    const a = term("7-14", "6 *(6y -5y -6x) =", "36y -30y -36x");
    expect(istRichtig("36y -30y -36x", a)).toBe(true);
    expect(istRichtig("6y -36x", a)).toBe(true);
    expect(istRichtig("-36x +6y", a)).toBe(true);
    // Die Klammer abschreiben ist nicht ausmultiplizieren.
    expect(istRichtig("6 *(6y -5y -6x)", a)).toBe(false);
    expect(istRichtig("6 *(y -6x)", a)).toBe(false);
  });

  it("★ herausheben: der ganze Faktor, in jeder Schreibweise", () => {
    const b = term("7-14", "48y -8x +16x =", "8 *(6y -x +2x)");
    expect(istRichtig("8 *(6y -x +2x)", b)).toBe(true);
    expect(istRichtig("8 *(6y +x)", b)).toBe(true);
    expect(istRichtig("8(6y +x)", b)).toBe(true);
    expect(istRichtig("8 *(x +6y)", b)).toBe(true);
    // Nur ein Teil des Faktors ist nicht herausgehoben.
    expect(istRichtig("2 *(24y +4x)", b)).toBe(false);
    // Die Angabe abschreiben auch nicht.
    expect(istRichtig("48y -8x +16x", b)).toBe(false);
    expect(istRichtig("48y +8x", b)).toBe(false);
  });
});

describe("Stufe 8 (8-07, 8-08, 8-10)", () => {
  it("Klammern auflösen: Reihenfolge frei", () => {
    const a = term("8-07", "(6x +7) *(-2x +2) =", "-12x^2 -2x +14");
    expect(istRichtig("14 -2x -12x^2", a)).toBe(true);
    expect(istRichtig("(6x +7) *(-2x +2)", a)).toBe(false);
  });

  it("die binomische Formel rückwärts: die Klammer ist die Aufgabe", () => {
    const a = term("8-08", "25a^2 +10a +1 =", "(5a +1)^2");
    expect(istRichtig("(5a +1)^2", a)).toBe(true);
    expect(istRichtig("(1 +5a)^2", a)).toBe(true);
    expect(istRichtig("25a^2 +10a +1", a)).toBe(false);
  });

  it("Brüche als Koeffizient: 11/10a", () => {
    const a = term("8-10", "5/2a -7/5a =", "11/10a");
    expect(istRichtig("11/10a", a)).toBe(true);
    expect(istRichtig("1,1a", a)).toBe(true);
    expect(istRichtig("11/10 a", a)).toBe(true);
    expect(istRichtig("10/11a", a)).toBe(false);
  });
});

describe("★ Jede erzeugte Termaufgabe nimmt ihre eigene Lösung an - und die Angabe nicht", () => {
  it("über alle Termpakete", () => {
    let gesehen = 0;
    for (const id of bedienbarePakete()) {
      for (const a of [1, 2, 3, 4].flatMap((saat) => erzeugeLauf(id, { anzahl: 12, saat }))) {
        if (a.op !== "term") continue;
        gesehen++;
        expect(istRichtig(a.loesung, a), `${id}: ${a.angabe} => ${a.loesung}`).toBe(true);
        const zeile = a.angabe.split("\n")[0].replace(/ =$/, "");
        if (!/=/.test(zeile)) {
          expect(istRichtig(zeile, a), `${id}: Angabe abgeschrieben: ${zeile}`).toBe(false);
        }
      }
    }
    expect(gesehen).toBeGreaterThan(20);
  });
});
