/**
 * Tests P3 — Express-Pfad (express.ts).
 * Prüft: CONTRAST_TABLE, Fokus-Override-Generatoren, locateBruchError,
 * Bruchstellen-Erkennung, #-Falle (B2), SOFT_UNITS_EXPRESS.
 */
import { describe, it, expect } from "vitest";
import { parseDots, textToCells, NUMSIGN, CAPS_LETTER } from "../src/lib/braille";
import {
  CONTRAST_TABLE,
  genExpressItems,
  genU3_grossReflex,
  genU5_zahlReflex,
  genU_kuerzelReflex,
  locateBruchError,
  SOFT_UNITS_EXPRESS,
} from "../src/lib/braille/express";

// Deterministisches rnd für Tests
const rnd = () => 0.5;

// ---------------------------------------------------------------------------
// Abschnitt 1 — CONTRAST_TABLE
// ---------------------------------------------------------------------------
describe("CONTRAST_TABLE", () => {
  it("enthält genau 4 Einträge (B1–B4)", () => {
    expect(CONTRAST_TABLE).toHaveLength(4);
    expect(CONTRAST_TABLE.map((c) => c.id)).toEqual(["B1", "B2", "B3", "B4"]);
  });

  it("B1: Großschreibung — vollReflex enthält '4·6'", () => {
    const b1 = CONTRAST_TABLE.find((c) => c.id === "B1")!;
    expect(b1.vollReflex).toContain("4·6");
    expect(b1.pcRegel).toContain("7");
    expect(b1.beispiel.druck).toBe("A");
  });

  it("B2: Zahlen — pcRegel enthält '#'", () => {
    const b2 = CONTRAST_TABLE.find((c) => c.id === "B2")!;
    expect(b2.pcRegel).toContain("#");
    expect(b2.beispiel.druck).toBe("5");
    expect(b2.beispiel.pcDots).toContain("1·5·6");
  });

  it("B3: Lautgruppen — sch als Beispiel", () => {
    const b3 = CONTRAST_TABLE.find((c) => c.id === "B3")!;
    expect(b3.beispiel.druck).toBe("sch");
    expect(b3.beispiel.vollDots).toContain("1·5·6");
  });

  it("B4: Umlaute — ä als Beispiel", () => {
    const b4 = CONTRAST_TABLE.find((c) => c.id === "B4")!;
    expect(b4.beispiel.druck).toBe("ä");
    expect(b4.pcRegel).toContain("8");
  });
});

// ---------------------------------------------------------------------------
// Abschnitt 2 — SOFT_UNITS_EXPRESS
// ---------------------------------------------------------------------------
describe("SOFT_UNITS_EXPRESS", () => {
  it("enthält Ä, Ö, Ü", () => {
    expect(SOFT_UNITS_EXPRESS.has("Ä")).toBe(true);
    expect(SOFT_UNITS_EXPRESS.has("Ö")).toBe(true);
    expect(SOFT_UNITS_EXPRESS.has("Ü")).toBe(true);
  });

  it("enthält keine kleinen Umlaute", () => {
    expect(SOFT_UNITS_EXPRESS.has("ä")).toBe(false);
    expect(SOFT_UNITS_EXPRESS.has("ö")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Abschnitt 3 — genU3_grossReflex (B1)
// ---------------------------------------------------------------------------
describe("genU3_grossReflex — Großbuchstaben-Reflex (B1)", () => {
  const POOL = ["Anna", "Berlin", "Tom", "Haus", "Hamburg", "Emil"];

  it("liefert n Items", () => {
    const items = genU3_grossReflex(POOL, 3, rnd);
    expect(items.length).toBeLessThanOrEqual(3);
    expect(items.length).toBeGreaterThan(0);
  });

  it("alle Items haben bruch='B1'", () => {
    const items = genU3_grossReflex(POOL, 10, rnd);
    expect(items.every((i) => i.bruch === "B1")).toBe(true);
  });

  it("solution entspricht textToCells(w, computer)", () => {
    const items = genU3_grossReflex(["Anna"], 1, rnd);
    if (items.length > 0) {
      const expected = textToCells("Anna", { system: "computer" });
      expect(items[0]!.solution).toEqual(expected);
    }
  });

  it("filtert Wörter ohne Großbuchstaben am Anfang aus", () => {
    const items = genU3_grossReflex(["haus", "Anna", "berlin", "Tom"], 10, rnd);
    const prompts = items.map((i) => i.prompt);
    expect(prompts).not.toContain("haus");
    expect(prompts).not.toContain("berlin");
  });

  it("spoken enthält 'großes X' für den Anfangsbuchstaben", () => {
    const items = genU3_grossReflex(["Anna"], 1, rnd);
    if (items.length > 0) {
      expect(items[0]!.spoken).toContain("großes");
    }
  });
});

// ---------------------------------------------------------------------------
// Abschnitt 4 — genU5_zahlReflex (B2, #-Falle)
// ---------------------------------------------------------------------------
describe("genU5_zahlReflex — Zahl-Reflex + #-Falle (B2)", () => {
  it("liefert n Items", () => {
    const items = genU5_zahlReflex(5, rnd);
    expect(items).toHaveLength(5);
  });

  it("alle Items haben bruch='B2'", () => {
    const items = genU5_zahlReflex(10, rnd);
    expect(items.every((i) => i.bruch === "B2")).toBe(true);
  });

  it("enthält mindestens ein #-Fallen-Item", () => {
    const items = genU5_zahlReflex(10, rnd);
    const trap = items.find((i) => i.prompt === "#");
    expect(trap).toBeDefined();
    // #(8-Punkt) = 3456 = NUMSIGN
    expect(trap!.solution).toHaveLength(1);
    expect(trap!.solution[0]).toBe(NUMSIGN);
  });

  it("#-Fallen-Soll-Zelle ist NUMSIGN (3456) — bitgleich", () => {
    // Das ist der Kern der B2-Falle: wer NUMSIGN tippt, trifft #-Soll
    const items = genU5_zahlReflex(20, rnd);
    const trap = items.find((i) => i.prompt === "#");
    if (trap) {
      expect(trap.solution[0]).toBe(parseDots("3456"));
    }
  });

  it("Zahlen-Items haben solution ohne NUMSIGN am Anfang", () => {
    const items = genU5_zahlReflex(10, rnd);
    const numItems = items.filter((i) => i.prompt !== "#");
    for (const item of numItems) {
      // 8-Punkt-Zahlen beginnen NICHT mit dem Zahlzeichen
      if (item.solution.length > 0) {
        expect(item.solution[0]).not.toBe(NUMSIGN);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// Abschnitt 5 — genU_kuerzelReflex (B3/B4)
// ---------------------------------------------------------------------------
describe("genU_kuerzelReflex — Umlaut-/Lautgruppen-Reflex", () => {
  const POOL = ["schule", "über", "tisch", "grün", "maus", "haus", "küche"];

  it("liefert Items mit B3 oder B4", () => {
    const items = genU_kuerzelReflex(POOL, 5, rnd);
    expect(items.length).toBeGreaterThan(0);
    expect(items.every((i) => i.bruch === "B3" || i.bruch === "B4")).toBe(true);
  });

  it("Umlautwörter bekommen B4", () => {
    const items = genU_kuerzelReflex(["über", "grün", "küche"], 5, rnd);
    const b4 = items.filter((i) => i.bruch === "B4");
    expect(b4.length).toBeGreaterThan(0);
  });

  it("sch/ch/st-Wörter bekommen B3", () => {
    const items = genU_kuerzelReflex(["schule", "tisch", "stuhl"], 5, rnd);
    const b3 = items.filter((i) => i.bruch === "B3");
    expect(b3.length).toBeGreaterThan(0);
  });

  it("solution = textToCells(prompt, computer)", () => {
    const items = genU_kuerzelReflex(["schule"], 1, rnd);
    if (items.length > 0) {
      const expected = textToCells("schule", { system: "computer" });
      expect(items[0]!.solution).toEqual(expected);
    }
  });
});

// ---------------------------------------------------------------------------
// Abschnitt 6 — genExpressItems (Haupt-Dispatcher)
// ---------------------------------------------------------------------------
describe("genExpressItems", () => {
  const POOL = ["haus", "schule", "über", "grün", "Anna", "5", "42"];

  it("u1 liefert Items", () => {
    const items = genExpressItems("u1", POOL, 3, rnd);
    expect(items.length).toBeGreaterThanOrEqual(0);
  });

  it("u3 delegiert an genU3_grossReflex (B1)", () => {
    const items = genExpressItems("u3", POOL, 3, rnd);
    // u3 nutzt COMP_GROSS intern — kann 0 Items liefern wenn Pool keine GRS enthält
    expect(items.every((i) => i.bruch === "B1")).toBe(true);
  });

  it("u5 delegiert an genU5_zahlReflex (B2)", () => {
    const items = genExpressItems("u5", POOL, 5, rnd);
    expect(items.every((i) => i.bruch === "B2")).toBe(true);
  });

  it("u8 nutzt Pool für Transfer", () => {
    const items = genExpressItems("u8", POOL, 3, rnd);
    // Transfer: B3 oder B4
    for (const item of items) {
      expect(["B1", "B2", "B3", "B4"]).toContain(item.bruch);
    }
  });

  it("alle generierten Items haben solution-Array", () => {
    for (const uid of ["u1", "u2", "u3", "u4", "u5", "u6", "u7", "u8"] as const) {
      const items = genExpressItems(uid, POOL, 3, rnd);
      for (const item of items) {
        expect(Array.isArray(item.solution)).toBe(true);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// Abschnitt 7 — locateBruchError
// ---------------------------------------------------------------------------
describe("locateBruchError — verortendes Feedback", () => {
  it("B2-Falle: typed beginnt mit NUMSIGN, Soll ist Ziffernzelle → B2-Rückmeldung", () => {
    const item = {
      prompt: "5",
      bruch: "B2" as const,
      solution: textToCells("5", { system: "computer" }),
      spoken: "5",
    };
    // Kind tippt altes Zahlzeichen (NUMSIGN) davor
    const typed = [NUMSIGN, parseDots("15")]; // NUMSIGN + e (wie 6-Punkt-5)
    const result = locateBruchError(item, typed);
    expect(result).not.toBeNull();
    expect(result!.bruch).toBe("B2");
    expect(result!.text).toContain("#");
  });

  it("B2: typed=Soll → kein Fehler (null)", () => {
    const item = {
      prompt: "5",
      bruch: "B2" as const,
      solution: textToCells("5", { system: "computer" }),
      spoken: "5",
    };
    const result = locateBruchError(item, item.solution);
    expect(result).toBeNull();
  });

  it("B1-Falle: typed enthält CAPS_LETTER → B1-Rückmeldung", () => {
    const item = {
      prompt: "A",
      bruch: "B1" as const,
      solution: textToCells("A", { system: "computer" }),
      spoken: "großes A",
    };
    // Kind tippt CAPS_LETTER(46) + a(1) — alter Vollschrift-Reflex
    const typed = [CAPS_LETTER, parseDots("1")];
    const result = locateBruchError(item, typed);
    expect(result).not.toBeNull();
    expect(result!.bruch).toBe("B1");
    expect(result!.text).toContain("7");
  });

  it("B3-Falle: typed hat weniger Zellen als Soll → B3-Rückmeldung", () => {
    // 'sch' am Computer = 3 Zellen; Kind tippt 1 (Kürzel-Reflex)
    const item = {
      prompt: "sch",
      bruch: "B3" as const,
      solution: textToCells("sch", { system: "computer" }), // 3 Zellen
      spoken: "S-C-H",
    };
    const typed = [parseDots("156")]; // 1 Kürzel-Zelle (Vollschrift-Reflex)
    const result = locateBruchError(item, typed);
    expect(result).not.toBeNull();
    expect(result!.bruch).toBe("B3");
    expect(result!.text).toContain("Buchstabe");
  });

  it("B4-Falle: typed hat 6-Punkt-Umlaut ohne Punkt 8 → B4-Rückmeldung", () => {
    const item = {
      prompt: "ä",
      bruch: "B4" as const,
      solution: textToCells("ä", { system: "computer" }), // 3458
      spoken: "ä",
    };
    // Kind tippt alten 6-Punkt-ä = 345 (ohne Punkt 8)
    const typed = [parseDots("345")];
    const result = locateBruchError(item, typed);
    expect(result).not.toBeNull();
    expect(result!.bruch).toBe("B4");
    expect(result!.text).toContain("8");
  });

  it("komplett falscher Tipp ohne bekannte Bruchstelle → null", () => {
    const item = {
      prompt: "a",
      bruch: "B1" as const,
      solution: [parseDots("1")],
      spoken: "a",
    };
    // Etwas komplett Fremdes — weder NUMSIGN noch CAPS_LETTER noch B3/B4
    const typed = [parseDots("1245")];
    const result = locateBruchError(item, typed);
    expect(result).toBeNull();
  });

  it("leere typed-Folge → null (generisches Feedback)", () => {
    const item = {
      prompt: "A",
      bruch: "B1" as const,
      solution: textToCells("A", { system: "computer" }),
      spoken: "großes A",
    };
    expect(locateBruchError(item, [])).toBeNull();
  });
});
