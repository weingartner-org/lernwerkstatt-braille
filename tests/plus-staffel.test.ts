/**
 * Wächter für die Staffel der Klasse.
 *
 * Die beiden Sätze, die hier verteidigt werden:
 *  1. Jede Etappe kommt in der Stufe des Kindes, das sie läuft - sonst steht
 *     die Staffel am schwächsten Glied still.
 *  2. Die Klasse teilt eine Zahl, sonst nichts.
 */
import { describe, expect, it } from "vitest";
import {
  ETAPPEN_JE_KIND_AM_TAG, WOERTER, etappeFuer, geschafft, offeneEtappe,
  sichtbaresWort, staffelFuer, stand, wortStimmt,
} from "../src/lib/plus/staffel";
import { istRichtig } from "../src/lib/plus/aufgabe";

describe("Die Staffel einer Woche", () => {
  it("dieselbe Klasse bekommt in derselben Woche dieselbe Staffel", () => {
    const a = staffelFuer("3MS", "2026-KW39");
    const b = staffelFuer("3MS", "2026-KW39");
    expect(b).toEqual(a);
  });

  it("nächste Woche ein anderes Wort - und die Nachbarklasse auch", () => {
    const meine = staffelFuer("3MS", "2026-KW39");
    const naechste = new Set([40, 41, 42, 43, 44].map((w) => staffelFuer("3MS", `2026-KW${w}`).wort));
    const andere = new Set(["2MS", "4MS", "1A", "2B"].map((k) => staffelFuer(k, "2026-KW39").wort));
    expect(naechste.size).toBeGreaterThan(1);
    expect(andere.size).toBeGreaterThan(1);
    expect([...naechste, ...andere].filter((w) => w === meine.wort).length).toBeLessThan(4);
  });

  it("das Wort steht in der Liste, und die Liste hat keine Umlaute", () => {
    expect(WOERTER).toContain(staffelFuer("3MS", "2026-KW39").wort);
    for (const w of WOERTER) expect(w, w).toMatch(/^[A-Z]+$/);
  });

  it("jeder Buchstabe fliegt genau einmal auf", () => {
    for (const klasse of ["3MS", "2B", "xyz"]) {
      const s = staffelFuer(klasse, "2026-KW39");
      const stellen = s.reihenfolge.filter((x) => x >= 0).sort((a, b) => a - b);
      expect(stellen).toEqual(s.wort.split("").map((_, i) => i));
    }
  });
});

describe("Das Wort deckt sich auf", () => {
  const s = staffelFuer("3MS", "2026-KW39");

  it("am Anfang ist alles zu", () => {
    expect(sichtbaresWort(s, [])).toBe("_".repeat(s.wort.length));
  });

  it("am Ende steht das Wort", () => {
    const alle = Array.from({ length: s.anzahl }, (_, i) => i + 1);
    expect(sichtbaresWort(s, alle)).toBe(s.wort);
  });

  it("★ die Buchstaben kommen kreuz und quer, nicht von vorn", () => {
    // Sonst wäre es kein Rätsel, sondern ein Fortschrittsbalken.
    const halb = Array.from({ length: Math.ceil(s.anzahl / 2) }, (_, i) => i + 1);
    const gezeigt = sichtbaresWort(s, halb);
    const vorn = s.wort.slice(0, gezeigt.replace(/_/g, "").length) + "_".repeat(0);
    expect(gezeigt.startsWith(vorn)).toBe(false);
  });

  it("★★ wer das Wort errät, hat es für die ganze Klasse erraten", () => {
    expect(wortStimmt(s, s.wort.toLowerCase())).toBe(true);
    expect(wortStimmt(s, ` ${s.wort} `)).toBe(true);
    expect(wortStimmt(s, "irgendwas")).toBe(false);
    expect(geschafft(s, [1], true)).toBe(true);
    expect(geschafft(s, [1], false)).toBe(false);
  });
});

describe("Die offene Etappe", () => {
  const s = staffelFuer("3MS", "2026-KW39");

  it("ist die kleinste freie Nummer", () => {
    expect(offeneEtappe(s, [])).toBe(1);
    expect(offeneEtappe(s, [1, 2, 3])).toBe(4);
    expect(offeneEtappe(s, [1, 3])).toBe(2);
  });

  it("ist keine mehr, wenn alle gelaufen sind", () => {
    expect(offeneEtappe(s, Array.from({ length: s.anzahl }, (_, i) => i + 1))).toBeNull();
  });
});

describe("★★★★★ Jede Etappe kommt in der Stufe des Kindes", () => {
  it("dasselbe Kind bekommt auf derselben Etappe immer dieselbe Rechnung", () => {
    const a = etappeFuer("3MS", "2026-KW39", 4, 3);
    const b = etappeFuer("3MS", "2026-KW39", 4, 3);
    expect(a?.aufgabe.angabe).toBe(b?.aufgabe.angabe);
  });

  it("zwei Kinder verschiedener Stufen bekommen verschiedene Rechnungen", () => {
    const klein = etappeFuer("3MS", "2026-KW39", 4, 1);
    const gross = etappeFuer("3MS", "2026-KW39", 4, 7);
    expect(klein?.aufgabe.paket.startsWith("1-")).toBe(true);
    expect(gross?.aufgabe.paket.startsWith("7-")).toBe(true);
  });

  it("jede Stufe von 1 bis 8 kann jede Etappe laufen - niemand steht vor einer Mauer", () => {
    const s = staffelFuer("3MS", "2026-KW39");
    for (let stufe = 1; stufe <= 8; stufe++) {
      for (let nr = 1; nr <= s.anzahl; nr++) {
        const e = etappeFuer("3MS", "2026-KW39", nr, stufe);
        expect(e, `Stufe ${stufe}, Etappe ${nr}`).not.toBeNull();
        expect(e!.aufgabe.loesung, `Stufe ${stufe}, Etappe ${nr}`).toBeTruthy();
      }
    }
  });

  it("★ eine Etappe ist EINE Zeile - keine Rechengeschichte", () => {
    for (let stufe = 1; stufe <= 8; stufe++) {
      for (let nr = 1; nr <= 6; nr++) {
        const e = etappeFuer("3MS", "2026-KW39", nr, stufe)!;
        expect(e.aufgabe.art, `${stufe}/${nr}: ${e.aufgabe.angabe}`).not.toBe("sach");
        expect(e.aufgabe.art, `${stufe}/${nr}`).not.toBe("fermi");
      }
    }
  });

  it("die eigene Lösung stimmt - über alle Stufen und Etappen", () => {
    const s = staffelFuer("2B", "2026-KW40");
    for (let stufe = 1; stufe <= 8; stufe++) {
      for (let nr = 1; nr <= s.anzahl; nr++) {
        const e = etappeFuer("2B", "2026-KW40", nr, stufe)!;
        expect(istRichtig(e.aufgabe.loesung, e.aufgabe), e.aufgabe.angabe).toBe(true);
      }
    }
  });
});

describe("Der Satz über der Staffel", () => {
  const s = staffelFuer("3MS", "2026-KW39");

  it("sagt etwas über die Klasse, nie über ein Kind", () => {
    const text = stand(s, [1, 2, 3], false);
    expect(text).toContain(`3 von ${s.anzahl}`);
    expect(text).not.toMatch(/du|dein|Kind|Name/i);
  });

  it("am Ende steht das Wort da", () => {
    expect(stand(s, [], true)).toContain(s.wort);
  });

  it("ein Kind läuft nicht die ganze Staffel allein an einem Tag", () => {
    expect(ETAPPEN_JE_KIND_AM_TAG).toBeLessThan(s.anzahl);
  });
});
