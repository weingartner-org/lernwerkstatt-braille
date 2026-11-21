/**
 * KFA-Etappen: die 48 Kurzschrift-Lektionen docken korrekt in die Etappen-/
 * Curriculum-Pipeline ein und ziehen ihr geprüftes Material.
 */
import { describe, it, expect } from "vitest";
import { KURZ_ETAPPEN } from "../src/lib/braille/etappen";
import { KFA_LESSONS } from "../src/lib/braille/kurzschrift_content";
import { kfaItems, kfaWords, kfaSentences } from "../src/lib/braille/kurzschrift_material";
import { LEVELS } from "../src/lib/braille/curriculum";

describe("KURZ_ETAPPEN — Struktur", () => {
  it("genau 48 Etappen kfa01..kfa48, in Reihenfolge", () => {
    expect(KURZ_ETAPPEN.map((e) => e.id)).toEqual(KFA_LESSONS.map((l) => l.id));
  });

  it("jede dockt an ihr eigenes kurz-Level an (system 'voll')", () => {
    for (const e of KURZ_ETAPPEN) {
      expect(e.levelId).toBe(`kurz-${e.id}`);
      expect(e.system).toBe("voll");
    }
  });

  it("introducedUnits jeder Etappe = ALLE Einheiten (auch L48-Anzeigezeichen)", () => {
    // Seit 09.07.2026 inkl. kind "zeichen" (keys "zx-…"): die Zeichenliste
    // zeigt sie über KFA_ZEICHEN_DOTS — vorher fehlte Lektion 48 dort komplett.
    for (const l of KFA_LESSONS) {
      const e = KURZ_ETAPPEN.find((x) => x.id === l.id)!;
      const expected = l.units.map((u) => u.key);
      expect(e.introducedUnits.map((u) => u.key), l.id).toEqual(expected);
    }
  });

  it("Legende zeigt die Druckschrift-Formen der Lektion", () => {
    for (const l of KFA_LESSONS) {
      const e = KURZ_ETAPPEN.find((x) => x.id === l.id)!;
      expect(e.legend).toBe(l.units.map((u) => u.print).join(" · "));
    }
  });
});

describe("KURZ_ETAPPEN — Aufgaben-Vorrat", () => {
  it("items(x) === geprüftes Lektions-Material (Wörter + Sätze)", () => {
    for (const l of KFA_LESSONS) {
      const e = KURZ_ETAPPEN.find((x) => x.id === l.id)!;
      const items = e.items([]);
      expect(items, l.id).toEqual(kfaItems(l.id));
      expect(items).toEqual([...kfaWords(l.id), ...kfaSentences(l.id)]);
    }
  });

  it("jede Lektion hat mindestens 6 Übungssätze", () => {
    for (const l of KFA_LESSONS) {
      expect(kfaSentences(l.id).length, l.id).toBeGreaterThanOrEqual(6);
    }
  });

  it("Übungswörter überall außer Namen/Sonderzeichen (L1/47/48 dürfen 0 haben)", () => {
    for (const l of KFA_LESSONS) {
      if ([1, 47, 48].includes(l.nr)) continue;
      expect(kfaWords(l.id).length, l.id).toBeGreaterThanOrEqual(6);
    }
  });

  it("kfaItems akzeptiert auch die Level-id-Form (kurz-kfaNN)", () => {
    expect(kfaItems("kurz-kfa01")).toEqual(kfaItems("kfa01"));
  });
});

describe("KURZ_ETAPPEN — Curriculum-Level", () => {
  it("48 kurz-kfa*-Level, contractions, system voll, mit intro + items", () => {
    const kurz = LEVELS.filter((l) => /^kurz-kfa\d\d$/.test(l.id));
    expect(kurz).toHaveLength(48);
    for (const lv of kurz) {
      expect(lv.kind).toBe("contractions");
      expect(lv.system).toBe("voll");
      expect(lv.intro.length).toBeGreaterThan(20);
      expect(lv.items.length).toBeGreaterThan(0);
    }
  });
});
