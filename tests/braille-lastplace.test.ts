/**
 * Resume: BrailleProgress.lastPlace (Bereich + Etappe + Richtung) rundet
 * über loadProgress()/saveProgress() sauber, Altstände ohne das Feld laden
 * unverändert weiter (additiv, siehe progress.ts).
 */
import { describe, expect, it } from "vitest";
import { loadProgress, saveProgress, emptyProgress } from "@/lib/braille/progress";
import type { BrailleProgress } from "@/lib/braille/progress";

const STORAGE_KEY = "braille-trainer:v1";

describe("BrailleProgress.lastPlace — Resume", () => {
  it("Roundtrip: speichern und laden liefert dieselbe Stelle", () => {
    const p: BrailleProgress = {
      ...emptyProgress(),
      lastPlace: { area: "voll", etappeId: "e13", direction: "read" },
    };
    saveProgress(p);
    const loaded = loadProgress();
    expect(loaded.lastPlace).toEqual({ area: "voll", etappeId: "e13", direction: "read" });
  });

  it("Altstand ohne lastPlace lädt fehlerfrei, Feld bleibt undefined", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ xp: 10, levels: {} }));
    const loaded = loadProgress();
    expect(loaded.lastPlace).toBeUndefined();
    expect(loaded.xp).toBe(10);
  });

  it("kein localStorage-Eintrag → emptyProgress ohne lastPlace", () => {
    const loaded = loadProgress();
    expect(loaded.lastPlace).toBeUndefined();
  });
});
