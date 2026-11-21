/**
 * Wächter für „Wie rechnest du das?" (6-23 und 7-19).
 *
 * ★ Der Kern der Sache: die richtige Antwort muss am TERM hängen. Eine
 * Strategiewahl, bei der immer derselbe Buchstabe stimmt oder bei der ein
 * Ablenker offensichtlich unsinnig ist, übt das Ausschließen - nicht das
 * Rechnen.
 */
import { describe, expect, it } from "vitest";
import { zufall } from "../src/lib/plus/aufgabe";
import { strategieKern, strategiePakete } from "../src/lib/plus/generator/kerne-strategie";
import { bedienbarePakete, erzeugeLauf } from "../src/lib/plus/generator";
import { PAKETE, paket } from "../src/lib/plus/stoffplan";

const arten = ["strategiewahl", "fehler_finden"] as const;

function viele(id: string, art: (typeof arten)[number], wie = 120) {
  const rng = zufall(42);
  return Array.from({ length: wie }, () => strategieKern(id, rng, art));
}

describe("Die Aufgabe ist eine Wahl, keine Formsache", () => {
  it.each(strategiePakete())("%s: drei Wege, einer davon der beste", (id) => {
    for (const k of viele(id, "strategiewahl", 40)) {
      if (k.sorte !== "direkt") throw new Error("kein direkter Kern");
      const zeilen = k.angabe.split("\n");
      expect(zeilen[1]).toBe("Wie rechnest du das am besten?");
      expect(zeilen.slice(2)).toHaveLength(3);
      expect(zeilen.slice(2).map((z) => z.slice(0, 2))).toEqual(["a)", "b)", "c)"]);
      expect(["a", "b", "c"]).toContain(k.loesung);
    }
  });

  it.each(strategiePakete())("%s: der richtige Buchstabe wandert", (id) => {
    // Wäre es immer „a", hätte das Kind die Aufgabe nach drei Runden durch,
    // ohne je einen Weg angesehen zu haben.
    const buchstaben = new Set(viele(id, "strategiewahl", 60).map((k) => k.sorte === "direkt" ? k.loesung : ""));
    expect(buchstaben.size, id).toBeGreaterThan(1);
  });

  it.each(strategiePakete())("%s: die Fehlersuche fragt von der anderen Seite", (id) => {
    for (const k of viele(id, "fehler_finden", 30)) {
      if (k.sorte !== "direkt") throw new Error("kein direkter Kern");
      expect(k.angabe.split("\n")[1]).toBe("Welcher Weg passt hier nicht?");
      expect(["a", "b", "c"]).toContain(k.loesung);
    }
  });

  it.each(strategiePakete())("%s: jede Zeile passt auf die Braillezeile", (id) => {
    for (const art of arten) {
      for (const k of viele(id, art, 30)) {
        for (const zeile of k.angabe.split("\n")) {
          expect(zeile.length, `${id}: „${zeile}"`).toBeLessThanOrEqual(40);
        }
      }
    }
  });

  it.each(strategiePakete())("%s: kein Ablenker ist offensichtlich unsinnig", (id) => {
    // Jeder genannte Weg muss ein Weg sein - „Die Zahlen malnehmen statt
    // zusammenzählen" wäre keine Wahl, sondern ein Witz. Ausnahme ist die
    // Fehlersuche: dort MUSS genau einer nicht passen.
    for (const k of viele(id, "strategiewahl", 30)) {
      if (k.sorte !== "direkt") continue;
      for (const zeile of k.angabe.split("\n").slice(2)) {
        expect(zeile.length, zeile).toBeGreaterThan(6);
        expect(zeile, zeile).not.toMatch(/vertauschen, dann minus/);
      }
    }
  });

  it.each(strategiePakete())("%s: der Term wechselt", (id) => {
    const terme = new Set(viele(id, "strategiewahl", 60).map((k) => k.sorte === "direkt" ? k.angabe.split("\n")[0] : ""));
    expect(terme.size, id).toBeGreaterThan(10);
  });
});

describe("Die Pakete sind angeschlossen", () => {
  it.each(strategiePakete())("%s liefert einen vollen Lauf", (id) => {
    expect(erzeugeLauf(id, { anzahl: 12, saat: 6 })).toHaveLength(12);
  });

  it.each(strategiePakete())("%s nennt im Stoffplan genau diese beiden Formen", (id) => {
    expect(paket(id).arten).toEqual(["strategiewahl", "fehler_finden"]);
  });
});

describe("★ Der Stoffplan ist vollständig bedienbar", () => {
  it("jedes der 161 Pakete baut eine Aufgabe - gemessen, nicht behauptet", () => {
    const gut = bedienbarePakete();
    const fehlt = PAKETE.map((p) => p.id).filter((id) => !gut.includes(id));
    expect(fehlt, `Noch nicht spielbar: ${fehlt.join(", ")}`).toEqual([]);
    expect(gut).toHaveLength(PAKETE.length);
  });
});
