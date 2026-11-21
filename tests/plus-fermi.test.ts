/**
 * Wächter für die Fermi-Aufgaben.
 *
 * ★ Eine Fermi-Aufgabe hat keine eine richtige Antwort, sondern eine
 * Größenordnung. Wer 8000 Schritte sagt, hat recht, und wer 9000 sagt, auch.
 * Falsch ist 80 und falsch ist 800 000. Ein Wächter, der hier auf die Ziffer
 * prüft, hätte den Sinn der Aufgabe verfehlt.
 */
import { describe, expect, it } from "vitest";
import { istRichtig, zufall } from "../src/lib/plus/aufgabe";
import { FERMI, fermiKern, fermiPakete } from "../src/lib/plus/generator/fermi";
import { erzeugeAufgabe, erzeugeLauf } from "../src/lib/plus/generator";
import { paket } from "../src/lib/plus/stoffplan";

describe("Die Fragen", () => {
  it.each(fermiPakete())("%s: jede Frage passt auf die Braillezeile", (id) => {
    const rng = zufall(3);
    for (let i = 0; i < 60; i++) {
      const k = fermiKern(id, rng);
      if (k.sorte !== "direkt") continue;
      for (const zeile of k.angabe.split("\n")) {
        expect(zeile.length, `${id}: „${zeile}"`).toBeLessThanOrEqual(40);
      }
      expect(k.angabe.trimEnd(), id).toMatch(/\?$/);
    }
  });

  it("★ nennt die Annahme in der Aufgabe - sonst wäre es Raten", () => {
    // „Ein Schritt ist 60 cm lang. Wie viele Schritte brauchst du für 100 m?"
    // Erst die Annahme macht aus dem Schätzen eine Rechnung.
    for (const id of fermiPakete()) {
      for (const f of FERMI[id]) {
        const saetze = f.text.split(/(?<=[.?!]) +/);
        expect(saetze.length, f.text).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it("hat einen großzügigen Bereich - nie auf zehn Prozent genau", () => {
    for (const id of fermiPakete()) {
      for (const f of FERMI[id]) {
        const [von, bis] = f.bereich;
        expect(bis, f.text).toBeGreaterThan(von);
        expect((bis - von) / ((von + bis) / 2), f.text).toBeGreaterThan(0.05);
      }
    }
  });

  it("gibt eine Musterantwort in der Mitte des Bereichs", () => {
    const rng = zufall(5);
    for (const id of fermiPakete()) {
      for (let i = 0; i < 40; i++) {
        const k = fermiKern(id, rng);
        if (k.sorte !== "direkt") continue;
        const wert = Number(k.loesung.replace(/[^0-9,.-]/g, "").replace(",", "."));
        expect(wert, k.angabe).toBeGreaterThanOrEqual(k.bereich![0]);
        expect(wert, k.angabe).toBeLessThanOrEqual(k.bereich![1]);
      }
    }
  });
});

describe("★ Die Antwort ist ein Bereich, keine Zahl", () => {
  const aufgabe = erzeugeAufgabe("4-18", "fermi", zufall(7));

  it("nimmt alles im Bereich an", () => {
    const [von, bis] = aufgabe.bereich!;
    expect(istRichtig(String(von), aufgabe)).toBe(true);
    expect(istRichtig(String(bis), aufgabe)).toBe(true);
    expect(istRichtig(String(Math.round((von + bis) / 2)), aufgabe)).toBe(true);
  });

  it("weist ab, was um Größenordnungen danebenliegt", () => {
    const [von, bis] = aufgabe.bereich!;
    expect(istRichtig(String(von / 10), aufgabe)).toBe(false);
    expect(istRichtig(String(bis * 10), aufgabe)).toBe(false);
  });

  it("stört sich nicht an der Einheit", () => {
    const [von, bis] = aufgabe.bereich!;
    expect(istRichtig(`${Math.round((von + bis) / 2)} km`, aufgabe)).toBe(true);
  });
});

describe("Die Pakete", () => {
  it.each(fermiPakete())("%s nennt Fermi im Stoffplan", (id) => {
    expect(paket(id).arten).toContain("fermi");
  });

  it.each(fermiPakete())("%s liefert einen Lauf mit beiden Formen", (id) => {
    const lauf = erzeugeLauf(id, { anzahl: 12, saat: 4 });
    expect(lauf).toHaveLength(12);
    const arten = new Set(lauf.map((a) => a.art));
    expect(arten.size, `${id}: nur ${[...arten].join(", ")}`).toBeGreaterThan(1);
  });
});

describe("★ Jede Aufgabenart des Stoffplans ist gebaut", () => {
  it("die Liste der gebauten Formen deckt den Stoffplan", async () => {
    const { GEBAUTE_FORMEN } = await import("../src/lib/plus/generator");
    const { STOFFPLAN } = await import("../src/lib/plus/stoffplan");
    const genannt = Object.keys(STOFFPLAN.aufgabenarten);
    const fehlt = genannt.filter((a) => !GEBAUTE_FORMEN.includes(a as never));
    expect(fehlt, `Noch nicht gebaut: ${fehlt.join(", ")}`).toEqual([]);
  });

  it("und jede gebaute Form steht auch im Stoffplan", async () => {
    const { GEBAUTE_FORMEN } = await import("../src/lib/plus/generator");
    const { STOFFPLAN } = await import("../src/lib/plus/stoffplan");
    const genannt = Object.keys(STOFFPLAN.aufgabenarten);
    for (const form of GEBAUTE_FORMEN) {
      expect(genannt, `${form} kennt der Stoffplan nicht`).toContain(form);
    }
  });
});
