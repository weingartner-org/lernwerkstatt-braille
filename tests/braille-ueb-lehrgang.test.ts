/**
 * UEB-Lehrgang (Englisch Grade 2) — Struktur, Etappen, Material.
 * Der offizielle 31-Lektionen-Weg (Australian Training Manual), Kern L4–L22
 * als 19 Etappen. Ersetzt die alten 6 „Welten".
 */
import { describe, it, expect } from "vitest";
import {
  UEB_LESSONS, UEB_CELLS, uebFormsUpTo, uebLesson, uebLessonById, uebSpoken,
} from "@/lib/braille/ueb_content";
import { uebWords, uebSentences, uebItems } from "@/lib/braille/ueb_material";
import { UEB_ETAPPEN } from "@/lib/braille/etappen";
import { areaByKey } from "@/lib/braille/areas";

describe("UEB_LESSONS (Inhalt)", () => {
  it("19 Lektionen L4–L22, lückenlos, korrekte Module", () => {
    expect(UEB_LESSONS).toHaveLength(19);
    expect(UEB_LESSONS.map((l) => l.nr)).toEqual(
      Array.from({ length: 19 }, (_, i) => i + 4),
    );
    for (const l of UEB_LESSONS)
      expect(l.module).toBe(l.nr <= 14 ? 1 : 2);
  });

  it("jede Lektion: Einheiten + eigene Einführungstexte (du/Sie) vorhanden", () => {
    for (const l of UEB_LESSONS) {
      expect(l.units.length).toBeGreaterThan(0);
      expect(l.introDu.length).toBeGreaterThan(10);
      expect(l.introSie.length).toBeGreaterThan(10);
      for (const u of l.units) {
        expect(u.form.length).toBeGreaterThan(0);
        expect(uebSpoken(u).length).toBeGreaterThan(0);
      }
    }
  });

  it("Kern-Kürzungen sind vorhanden (Vollständigkeit ggü. alten 6 Welten)", () => {
    const forms = uebFormsUpTo(22);
    for (const f of ["ar", "ing", "and", "for", "of", "the", "with",
                     "tion", "ness", "ful", "ity", "about", "friend", "day", "world"])
      expect(forms.has(f)).toBe(true);
  });

  it("uebFormsUpTo wächst monoton (Progression)", () => {
    expect(uebFormsUpTo(4).size).toBeLessThan(uebFormsUpTo(22).size);
    for (const f of uebFormsUpTo(4)) expect(uebFormsUpTo(22).has(f)).toBe(true);
  });

  it("jede Kürzungs-Form hat eine Zelle im Braille-Bereich", () => {
    for (const l of UEB_LESSONS)
      for (const u of l.units) {
        const cell = UEB_CELLS[u.form.toLowerCase()];
        expect(cell, `${u.form}`).toBeTruthy();
        for (const ch of cell)
          expect(ch.codePointAt(0)).toBeGreaterThanOrEqual(0x2800);
      }
  });

  it("Lookups uebLesson / uebLessonById", () => {
    expect(uebLesson(7)?.title).toContain("ch");
    expect(uebLessonById("ueb-l20")?.nr).toBe(20);
  });
});

describe("UEB_ETAPPEN (Navigation)", () => {
  it("20 Etappen: Brücke ueb-l00 + ueb-l04..ueb-l22, lang='en'", () => {
    expect(UEB_ETAPPEN).toHaveLength(20);
    expect(UEB_ETAPPEN.map((e) => e.id)).toEqual([
      "ueb-l00",
      ...UEB_LESSONS.map((l) => `ueb-l${String(l.nr).padStart(2, "0")}`),
    ]);
    for (const e of UEB_ETAPPEN) {
      expect(e.lang).toBe("en");
      expect(e.system).toBe("voll");
      expect(e.levelId).toBe(e.id);
      expect(e.introducedUnits.length).toBeGreaterThan(0);
      expect(e.masteryGate.minAcc).toBeGreaterThan(0);
    }
  });

  it("Brücken-Etappe ueb-l00 lehrt Groß-/Zahlzeichen + Satzzeichen", () => {
    const bridge = UEB_ETAPPEN[0];
    expect(bridge.id).toBe("ueb-l00");
    expect(bridge.introducedUnits.map((u) => u.key)).toEqual(["A", "1", ".", ",", "?", "!"]);
  });

  it("introducedUnits.key ist die lösbare Form (key===form) — Lektions-Etappen", () => {
    for (const e of UEB_ETAPPEN) {
      const lesson = uebLessonById(e.id);
      if (!lesson) continue; // Brücke ueb-l00 ist keine Kürzungs-Lektion
      expect(e.introducedUnits.map((u) => u.key)).toEqual(lesson.units.map((u) => u.form));
    }
  });

  it("jede Etappe hat geprüftes Übungsmaterial (≥1 Wort)", () => {
    for (const e of UEB_ETAPPEN) {
      expect(e.items([]).length).toBeGreaterThan(0);
      expect(uebWords(e.id).length).toBeGreaterThan(0);
      expect(uebItems(e.id)).toEqual([...uebWords(e.id), ...uebSentences(e.id)]);
    }
  });
});

describe("Bereich ueb", () => {
  it("nutzt Brücke + die 19 Lehrgangs-Etappen (20)", () => {
    const area = areaByKey("ueb");
    expect(area.etappen).toHaveLength(20);
    expect(area.etappen.map((e) => e.id)).toEqual(UEB_ETAPPEN.map((e) => e.id));
  });
});
