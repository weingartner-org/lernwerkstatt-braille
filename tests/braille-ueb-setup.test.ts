/**
 * UEB — Setup: uebEnabled-Schalter (offizieller Lehrgang L4–L22).
 * Prüft: default=false, getActiveUebEtappen filtert korrekt, bestehende
 * getActiveEtappen-Logik bleibt unberührt.
 */
import { describe, it, expect } from "vitest";
import { defaultSetup, getActiveUebEtappen, getActiveEtappen } from "@/lib/braille/setup";
import { UEB_ETAPPEN } from "@/lib/braille/etappen";

describe("defaultSetup", () => {
  it("uebEnabled default = false", () => {
    expect(defaultSetup().uebEnabled).toBe(false);
  });
  it("extendedNumbers und expressPath bleiben unberührt", () => {
    const s = defaultSetup();
    expect(s.extendedNumbers).toBe(false);
    expect(s.expressPath).toBe(false);
  });
});

describe("getActiveUebEtappen", () => {
  it("uebEnabled=false → leeres Array", () => {
    expect(getActiveUebEtappen(defaultSetup())).toHaveLength(0);
  });
  it("uebEnabled=true → Brücke + alle 19 Lektionen (20)", () => {
    const et = getActiveUebEtappen({ ...defaultSetup(), uebEnabled: true });
    expect(et).toHaveLength(20);
    expect(et.map((e) => e.id)).toEqual(UEB_ETAPPEN.map((e) => e.id));
  });
  it("uebEnabled fehlt (undefined) → leeres Array", () => {
    expect(getActiveUebEtappen({ extendedNumbers: false })).toHaveLength(0);
  });
  it("Rückgabe ist Kopie (kein Mutieren von UEB_ETAPPEN)", () => {
    const et = getActiveUebEtappen({ ...defaultSetup(), uebEnabled: true });
    et.length = 0;
    expect(getActiveUebEtappen({ ...defaultSetup(), uebEnabled: true })).toHaveLength(20);
  });
  it("alle Etappen haben lang='en'", () => {
    for (const e of getActiveUebEtappen({ ...defaultSetup(), uebEnabled: true }))
      expect(e.lang).toBe("en");
  });
});

describe("getActiveEtappen (bestehende Logik unberührt)", () => {
  for (const sys of ["basis", "voll", "computer"] as const) {
    it(`system=${sys}: keine UEB-Etappen enthalten`, () => {
      const et = getActiveEtappen(sys, defaultSetup());
      expect(et.filter((e) => e.id.startsWith("ueb-"))).toHaveLength(0);
    });
  }
});
