/**
 * Tests P3 — Computerbraille E16–E20 + Struktur-Checks.
 * Prüft: 8-Punkt-Transkription, uneinheitliche Große-Umlaut-Karten,
 * Etappen-Struktur E16–E20b + U1–U8, SOFT_UNITS.
 */
import { describe, it, expect } from "vitest";
import {
  parseDots,
  textToCells,
  NUMSIGN,
  CAPS_LETTER,
  CHAR_TO_CELL_8,
} from "../src/lib/braille";
import {
  etappeById,
  etappenForSystem,
  etappenForLevel,
  SOFT_UNITS,
  PATIENCE_BRAILLE,
} from "../src/lib/braille/etappen";
import { MASTERY_ACC, MASTERY_MIN_ATTEMPTS } from "../src/lib/braille/adaptive";
import {
  defaultSetup,
  getActiveEtappen,
  etappenSequence,
} from "../src/lib/braille/setup";
import { emptyProgress, loadProgress } from "../src/lib/braille/progress";

// ---------------------------------------------------------------------------
// Abschnitt 1 — 8-Punkt-Transkription (engine.ts/transcribeComputer)
// ---------------------------------------------------------------------------
describe("Computerbraille: 8-Punkt-Transkription", () => {
  it("Grundbuchstaben = identisch zur 6-Punkt-Basiszelle", () => {
    // a=1, b=12, z=1356
    expect(textToCells("a", { system: "computer" })).toEqual([parseDots("1")]);
    expect(textToCells("b", { system: "computer" })).toEqual([parseDots("12")]);
    expect(textToCells("z", { system: "computer" })).toEqual([parseDots("1356")]);
  });

  it("Großbuchstaben = Grundzelle | Punkt 7 in EINER Zelle (B1)", () => {
    // A = 1+7, kein separates Ankündigungszeichen
    expect(textToCells("A", { system: "computer" })).toEqual([parseDots("17")]);
    expect(textToCells("Z", { system: "computer" })).toEqual([parseDots("13567")]);
    expect(textToCells("M", { system: "computer" })).toEqual([parseDots("1347")]);
    // NICHT: CAPS_LETTER(46) + a → das wäre 2 Zellen (Vollschrift/Basisschrift)
    const aCells = textToCells("A", { system: "computer" });
    expect(aCells).toHaveLength(1);
    expect(aCells[0]).not.toBe(CAPS_LETTER);
  });

  it("Ziffern ohne Zahlzeichen — eine Zelle je Ziffer (B2)", () => {
    // 5 = 156 (eine Zelle), NICHT NUMSIGN + e(15) (zwei Zellen)
    expect(textToCells("5", { system: "computer" })).toEqual([parseDots("156")]);
    expect(textToCells("1", { system: "computer" })).toEqual([parseDots("16")]);
    expect(textToCells("0", { system: "computer" })).toEqual([parseDots("346")]);
    expect(textToCells("9", { system: "computer" })).toEqual([parseDots("246")]);
    // Keine Zahlzeichen-Zelle!
    const cells5 = textToCells("5", { system: "computer" });
    expect(cells5).toHaveLength(1);
    expect(cells5[0]).not.toBe(NUMSIGN);
  });

  it("6-Punkt-Engine erzeugt für '5' ZWEI Zellen (NUMSIGN + e)", () => {
    // Zum Vergleich: der Bruch B2 klar sichtbar
    const cells6 = textToCells("5", { system: "basis" });
    expect(cells6).toHaveLength(2);
    expect(cells6[0]).toBe(NUMSIGN);
  });

  it("Kleine Umlaute mit Punkt 8 (B4)", () => {
    // ä = 3458 (6-Punkt-ä 345 + Punkt 8)
    expect(textToCells("ä", { system: "computer" })).toEqual([parseDots("3458")]);
    expect(textToCells("ö", { system: "computer" })).toEqual([parseDots("2468")]);
    expect(textToCells("ü", { system: "computer" })).toEqual([parseDots("12568")]);
    expect(textToCells("ß", { system: "computer" })).toEqual([parseDots("34568")]);
  });

  it("6-Punkt-Engine: ä = 345 (ohne Punkt 8) — Bruch B4 sichtbar", () => {
    const cells6 = textToCells("ä", { system: "basis" });
    expect(cells6).toEqual([parseDots("345")]);
    // 8-Punkt-Variante hat Punkt 8 zusätzlich
    const cells8 = textToCells("ä", { system: "computer" });
    expect(cells8[0]).not.toBe(cells6[0]);
  });

  it("Sonderzeichen mit festen Zellen", () => {
    expect(textToCells("@", { system: "computer" })).toEqual([parseDots("3457")]);
    expect(textToCells("#", { system: "computer" })).toEqual([parseDots("3456")]);
    expect(textToCells("&", { system: "computer" })).toEqual([parseDots("12346")]);
    expect(textToCells("%", { system: "computer" })).toEqual([parseDots("123456")]);
  });

  it("#(3456) und NUMSIGN(3456) sind bitgleich — die B2-Kernfalle", () => {
    const hashCell = textToCells("#", { system: "computer" })[0]!;
    expect(hashCell).toBe(NUMSIGN);
  });

  it("Groß-Umlaute Ä/Ö/Ü sind eingetragen (uneinheitlich, aber vorhanden)", () => {
    expect(CHAR_TO_CELL_8["Ä"]).toBe(parseDots("567"));
    expect(CHAR_TO_CELL_8["Ö"]).toBe(parseDots("358"));
    expect(CHAR_TO_CELL_8["Ü"]).toBe(parseDots("2368"));
    // Transkription liefert eine Zelle (nicht undefined)
    expect(textToCells("Ä", { system: "computer" })).toHaveLength(1);
    expect(textToCells("Ö", { system: "computer" })).toHaveLength(1);
    expect(textToCells("Ü", { system: "computer" })).toHaveLength(1);
  });

  it("keine Kürzungen: sch = 3 Zellen im Computerbraille (B3)", () => {
    const cells = textToCells("sch", { system: "computer" });
    // s=234, c=14, h=125 — drei einzelne Zellen
    expect(cells).toHaveLength(3);
    expect(cells).toEqual([parseDots("234"), parseDots("14"), parseDots("125")]);
  });

  it("Vollschrift: sch = 1 Zelle (Lautgruppe) — Bruch B3 klar", () => {
    const cells = textToCells("sch", { system: "voll" });
    expect(cells).toHaveLength(1);
    expect(cells[0]).toBe(parseDots("156"));
  });

  it("Leerzeichen erzeugt Leerzelle", () => {
    const cells = textToCells("a b", { system: "computer" });
    expect(cells).toHaveLength(3);
    expect(cells[1]).toBe(0); // BLANK
  });

  it("mehrstellige Wörter Zelle für Zelle", () => {
    const cells = textToCells("AB", { system: "computer" });
    expect(cells).toHaveLength(2);
    expect(cells[0]).toBe(parseDots("17")); // A
    expect(cells[1]).toBe(parseDots("127")); // B
  });
});

// ---------------------------------------------------------------------------
// Abschnitt 2 — SOFT_UNITS (Große Umlaute, nicht hart bewertet)
// ---------------------------------------------------------------------------
describe("SOFT_UNITS — uneinheitliche große Umlaute", () => {
  it("enthält genau Ä, Ö, Ü", () => {
    expect(SOFT_UNITS.has("Ä")).toBe(true);
    expect(SOFT_UNITS.has("Ö")).toBe(true);
    expect(SOFT_UNITS.has("Ü")).toBe(true);
    expect(SOFT_UNITS.size).toBe(3);
  });

  it("enthält KEINE kleinen Umlaute oder ß", () => {
    expect(SOFT_UNITS.has("ä")).toBe(false);
    expect(SOFT_UNITS.has("ö")).toBe(false);
    expect(SOFT_UNITS.has("ü")).toBe(false);
    expect(SOFT_UNITS.has("ß")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Abschnitt 3 — Etappen-Struktur E16–E20b
// ---------------------------------------------------------------------------
describe("Etappen E16–E20b (regulärer Computer-Strang)", () => {
  const ids = ["e16", "e17", "e18", "e19", "e20", "e20b"];

  it("alle sechs Etappen vorhanden", () => {
    for (const id of ids) {
      expect(etappeById(id), `Etappe ${id} fehlt`).toBeDefined();
    }
  });

  it("alle haben system:'computer'", () => {
    for (const id of ids) {
      expect(etappeById(id)?.system).toBe("computer");
    }
  });

  it("E16 dockt an comp-buchstaben, hat 26 Grundbuchstaben", () => {
    const e16 = etappeById("e16")!;
    expect(e16.levelId).toBe("comp-buchstaben");
    expect(e16.introducedUnits).toHaveLength(26);
    expect(e16.introducedUnits[0].key).toBe("a");
    expect(e16.introducedUnits[25].key).toBe("z");
  });

  it("E16 masteryGate hat patience=PATIENCE_BRAILLE (Brücke)", () => {
    const e16 = etappeById("e16")!;
    expect(e16.masteryGate.patience).toBe(PATIENCE_BRAILLE);
    expect(e16.masteryGate.minAcc).toBe(MASTERY_ACC);
    expect(e16.masteryGate.minAttempts).toBe(MASTERY_MIN_ATTEMPTS);
  });

  it("E16 items-Filter schließt Umlautwörter aus", () => {
    const items = ["haus", "über", "grün", "wasser", "schön"];
    const filtered = etappeById("e16")!.items(items);
    expect(filtered).toContain("haus");
    expect(filtered).toContain("wasser");
    expect(filtered).not.toContain("über");
    expect(filtered).not.toContain("grün");
    expect(filtered).not.toContain("schön");
  });

  it("E17 hat 26 Großbuchstaben A–Z", () => {
    const e17 = etappeById("e17")!;
    expect(e17.levelId).toBe("comp-gross");
    expect(e17.introducedUnits).toHaveLength(26);
    expect(e17.introducedUnits.every((u) => /^[A-Z]$/.test(u.key))).toBe(true);
  });

  it("E17 spoken-Labels: 'großes A', 'großes Z'", () => {
    const e17 = etappeById("e17")!;
    expect(e17.introducedUnits[0].spoken).toBe("großes A");
    expect(e17.introducedUnits[25].spoken).toBe("großes Z");
  });

  it("E18 dockt an comp-zahlen, hat Ziffern 0–9", () => {
    const e18 = etappeById("e18")!;
    expect(e18.levelId).toBe("comp-zahlen");
    expect(e18.introducedUnits).toHaveLength(10);
    const keys = e18.introducedUnits.map((u) => u.key);
    for (const d of "0123456789") {
      expect(keys).toContain(d);
    }
  });

  it("E19 dockt an comp-sonderzeichen, enthält no-kuerzel", () => {
    const e19 = etappeById("e19")!;
    expect(e19.levelId).toBe("comp-sonderzeichen");
    const keys = e19.introducedUnits.map((u) => u.key);
    expect(keys).toContain("ä");
    expect(keys).toContain("ö");
    expect(keys).toContain("no-kuerzel");
    expect(keys).toContain("@");
    expect(keys).toContain("#");
  });

  it("E20 hat minAttempts=1 (Text-Etappe)", () => {
    const e20 = etappeById("e20")!;
    expect(e20.levelId).toBe("comp-texte-jugend");
    expect(e20.masteryGate.minAttempts).toBe(1);
    expect(e20.introducedUnits).toHaveLength(0);
  });

  it("E20b dockt an comp-texte-erwachsene, minAttempts=1", () => {
    const e20b = etappeById("e20b")!;
    expect(e20b.levelId).toBe("comp-texte-erwachsene");
    expect(e20b.masteryGate.minAttempts).toBe(1);
  });

  it("etappenForSystem('computer') enthält E16–E20b und U1–U8", () => {
    const comp = etappenForSystem("computer").map((e) => e.id);
    for (const id of ids) expect(comp).toContain(id);
    for (const uid of ["u1", "u2", "u3", "u4", "u5", "u6", "u7", "u8"]) {
      expect(comp).toContain(uid);
    }
  });

  it("etappenForLevel gibt E16 für comp-buchstaben", () => {
    const levEtappen = etappenForLevel("comp-buchstaben").map((e) => e.id);
    expect(levEtappen).toContain("e16");
    expect(levEtappen).toContain("u1");
  });
});

// ---------------------------------------------------------------------------
// Abschnitt 4 — Etappen-Struktur U1–U8 (Express-Pfad)
// ---------------------------------------------------------------------------
describe("Express-Pfad U1–U8", () => {
  const uids = ["u1", "u2", "u3", "u4", "u5", "u6", "u7", "u8"];

  it("alle acht U-Etappen vorhanden", () => {
    for (const id of uids) {
      expect(etappeById(id), `Etappe ${id} fehlt`).toBeDefined();
    }
  });

  it("alle haben system:'computer'", () => {
    for (const id of uids) {
      expect(etappeById(id)?.system).toBe("computer");
    }
  });

  it("U1 hat masteryGate.minAttempts=0 (sofort frei)", () => {
    const u1 = etappeById("u1")!;
    expect(u1.masteryGate.minAttempts).toBe(0);
    expect(u1.introducedUnits).toHaveLength(0);
  });

  it("U2 hat Bruchstellen-Umlaute ä/ö/ü/ß als introducedUnits", () => {
    const u2 = etappeById("u2")!;
    const keys = u2.introducedUnits.map((u) => u.key);
    expect(keys).toContain("ä");
    expect(keys).toContain("ö");
    expect(keys).toContain("ü");
    expect(keys).toContain("ß");
  });

  it("U3 hat alle 26 Großbuchstaben A–Z (häufige zuerst A,B,M,S,T)", () => {
    const u3 = etappeById("u3")!;
    expect(u3.levelId).toBe("comp-gross");
    expect(u3.introducedUnits).toHaveLength(26);
    // Häufige zuerst
    expect(u3.introducedUnits[0].key).toBe("A");
    expect(u3.introducedUnits[1].key).toBe("B");
  });

  it("U5 hat Ziffern 0–9 als introducedUnits", () => {
    const u5 = etappeById("u5")!;
    expect(u5.levelId).toBe("comp-zahlen");
    const keys = u5.introducedUnits.map((u) => u.key);
    for (const d of "0123456789") expect(keys).toContain(d);
  });

  it("U8 hat minAttempts=1 (Text-Transfer)", () => {
    const u8 = etappeById("u8")!;
    expect(u8.levelId).toBe("comp-texte-jugend");
    expect(u8.masteryGate.minAttempts).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// Abschnitt 5 — Setup: expressPath + etappenSequence
// ---------------------------------------------------------------------------
describe("BrailleSetup + etappenSequence", () => {
  it("defaultSetup liefert expressPath:false", () => {
    const s = defaultSetup();
    expect(s.expressPath).toBe(false);
    expect(s.extendedNumbers).toBe(false);
  });

  it("etappenSequence false → e16…e20b", () => {
    const seq = etappenSequence(defaultSetup());
    expect(seq).toEqual(["e16", "e17", "e18", "e19", "e20", "e20b"]);
  });

  it("etappenSequence 'vs-pcbrl' → u1…u8", () => {
    const seq = etappenSequence({ ...defaultSetup(), expressPath: "vs-pcbrl" });
    expect(seq).toEqual(["u1", "u2", "u3", "u4", "u5", "u6", "u7", "u8"]);
  });

  it("getActiveEtappen mit expressPath:false → nur E-Etappen (e16–e20b)", () => {
    const active = getActiveEtappen("computer", defaultSetup()).map((e) => e.id);
    expect(active).toContain("e16");
    expect(active).toContain("e20b");
    expect(active).not.toContain("u1");
    expect(active).not.toContain("u8");
  });

  it("getActiveEtappen mit expressPath:'vs-pcbrl' → nur U-Etappen (u1–u8)", () => {
    const setup = { ...defaultSetup(), expressPath: "vs-pcbrl" as const };
    const active = getActiveEtappen("computer", setup).map((e) => e.id);
    expect(active).toContain("u1");
    expect(active).toContain("u8");
    expect(active).not.toContain("e16");
    expect(active).not.toContain("e20");
  });

  it("getActiveEtappen für 'basis' ist unabhängig von expressPath", () => {
    const setup = { ...defaultSetup(), expressPath: "vs-pcbrl" as const };
    const active = getActiveEtappen("basis", setup).map((e) => e.id);
    expect(active).toContain("b1");
    expect(active).toContain("b14");
  });
});

// ---------------------------------------------------------------------------
// Abschnitt 6 — Progress: setup-Feld additiv
// ---------------------------------------------------------------------------
describe("BrailleProgress: setup-Feld (P3)", () => {
  it("emptyProgress liefert setup mit expressPath:false", () => {
    const p = emptyProgress();
    expect(p.setup?.expressPath).toBe(false);
    expect(p.setup?.extendedNumbers).toBe(false);
  });

  it("loadProgress ohne localStorage liefert emptyProgress mit setup", () => {
    // im Test-Kontext ist localStorage nicht verfügbar → fällt auf emptyProgress
    const p = loadProgress();
    expect(p.setup).toBeDefined();
  });
});
