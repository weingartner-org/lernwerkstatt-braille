/**
 * Tests für die Etappen-Pipeline (Basisschrift b1–b14 in Kniese-Reihenfolge).
 *
 * Prüft:
 * - ETAPPEN-Reihenfolge und Vollständigkeit (b1..b14 + b13a..b13e)
 * - Kniese-Wortpools: kumulative Buchstaben-Filter je Etappe
 * - Verwechsler-Trennung über die Etappenfolge (i↔e, d↔f, h↔j, r↔w)
 * - masteryGate-Konformität, getActiveEtappen-Filterung
 * - unitLevel-Logik, canAdvanceUnits, nextUnit
 * - ensureIntroducedForLevel (Migrations-Backfill)
 * - currentEtappe (erste nicht-abgeschlossene Etappe)
 * - b14-Durchreiche (b14.items(TEXTE_BASIS) === TEXTE_BASIS)
 */
import { describe, expect, it } from "vitest";
import {
  ETAPPEN,
  etappeById,
  etappenForLevel,
  etappenForSystem,
  defaultGate,
  unitLevel,
  canAdvanceUnits,
  nextUnit,
  currentEtappe,
  ensureIntroducedForLevel,
  PATIENCE_BRAILLE,
  MAX_WOBBLY,
  MIN_SAMPLES,
  TARGET_ACC,
  STRUGGLE_ACC,
  BRIDGE_ACC,
  BRIDGE_BASE_LEVELS,
  bridgeOpen,
  lifetimeAcc,
  isLevelUnlockedBraille,
  type UnitStat,
} from "@/lib/braille/etappen";
import { KFA_LESSONS } from "@/lib/braille/kurzschrift_content";

// Kurzschrift-Etappen: 48 KFA-Lektionen (kfa01..kfa48), Level-ids kurz-kfaNN.
const KFA_IDS = KFA_LESSONS.map((l) => l.id);
const KURZ_LEVEL_IDS = KFA_IDS.map((id) => `kurz-${id}`);
import { getActiveEtappen, defaultSetup } from "@/lib/braille/setup";
import { BASIS_NAMEN } from "@/lib/braille/vocab";
import { LEVELS, levelById } from "@/lib/braille/curriculum";
import { emptyProgress } from "@/lib/braille/progress";
import type { BrailleProgress } from "@/lib/braille/progress";
import { emptyMastery, recordAttempt } from "@/lib/braille/adaptive";
import type { LevelMastery } from "@/lib/braille/adaptive";
import { TEXTE_BASIS } from "@/lib/braille/texts";

// ---------------------------------------------------------------------------
// Hilfsfunktionen
// ---------------------------------------------------------------------------

function makeStats(hits: number, misses: number): UnitStat {
  return { hits, misses, recent: [] };
}

function masteredProgress(levelId: string): BrailleProgress {
  const p = emptyProgress();
  // 12+ korrekte Versuche im Fenster → isLevelMastered = true
  let m = emptyMastery();
  for (let i = 0; i < 15; i++) {
    m = recordAttempt(m, "a", true);
  }
  return { ...p, mastery: { [levelId]: m } };
}

// ---------------------------------------------------------------------------
// 1. Grundstruktur ETAPPEN
// ---------------------------------------------------------------------------

describe("ETAPPEN — Grundstruktur (Basisschrift b1–b14, Kniese)", () => {
  // additiv 23.09.2026: b-suchen ("Finde das Zeichen") NACH b3 - vorher kennt
  // das Kind zu wenige Zeichen, um Ablenker danebenzustellen.
  const BASE_IDS = [
    "b1", "b2", "b3", "b-suchen", "b4", "b5", "b6", "b7", "b8", "b9", "b10",
    "b11", "b12", "b13", "b13a", "b13b", "b13c", "b13d", "b13e", "b14",
  ];
  // additiv 23.09.2026: voll-grenz (Vorsicht, hier wird nicht gekuerzt)
  const VOLL_IDS = ["e11", "e12", "e13", "e14", "voll-grenz", "e15"];

  it("enthält die 20 Basisschrift-Etappen (b1..b14 + b13a..b13e + b-suchen) als Präfix", () => {
    const ids = ETAPPEN.map((e) => e.id);
    expect(ids.slice(0, BASE_IDS.length)).toEqual(BASE_IDS);
  });

  it("enthält die 6 Vollschrift-Etappen (e11..e15 + voll-grenz) nach den Basis-Etappen", () => {
    const ids = ETAPPEN.map((e) => e.id);
    expect(ids.slice(BASE_IDS.length, BASE_IDS.length + VOLL_IDS.length)).toEqual(VOLL_IDS);
  });

  it("Basisschrift-Etappen haben alle system === 'basis'", () => {
    for (const e of ETAPPEN.filter((e) => BASE_IDS.includes(e.id))) {
      expect(e.system, `${e.id}.system`).toBe("basis");
    }
  });

  it("Vollschrift-Etappen (e11..e15) haben alle system === 'voll'", () => {
    for (const e of ETAPPEN.filter((e) => VOLL_IDS.includes(e.id))) {
      expect(e.system, `${e.id}.system`).toBe("voll");
    }
  });

  it("jede levelId existiert in LEVELS (kein toter Anker)", () => {
    for (const e of ETAPPEN) {
      expect(
        levelById(e.levelId),
        `levelId '${e.levelId}' in '${e.id}' nicht in LEVELS`,
      ).toBeDefined();
    }
  });

  it("b13a–b13e docken alle an l6-zahlen", () => {
    const ext = ["b13a", "b13b", "b13c", "b13d", "b13e"];
    for (const id of ext) {
      expect(etappeById(id)?.levelId, id).toBe("l6-zahlen");
    }
  });

  it("b13a–b13e folgen direkt nach b13 (kein anderes Element dazwischen)", () => {
    const ids = ETAPPEN.map((e) => e.id);
    const i = ids.indexOf("b13");
    expect(ids[i + 1]).toBe("b13a");
    expect(ids[i + 5]).toBe("b13e");
    expect(ids[i + 6]).toBe("b14");
  });
});

// ---------------------------------------------------------------------------
// 2. masteryGate-Konformität
// ---------------------------------------------------------------------------

describe("masteryGate — Konformität mit defaultGate", () => {
  it("alle Basis-Etappen (b1..b14, b13a..b13e) haben defaultGate() (minAcc=0.9, minAttempts=12, patience=16)", () => {
    const dg = defaultGate();
    for (const e of etappenForSystem("basis")) {
      expect(e.masteryGate.minAcc, `${e.id}.minAcc`).toBe(dg.minAcc);
      expect(e.masteryGate.minAttempts, `${e.id}.minAttempts`).toBe(dg.minAttempts);
      expect(e.masteryGate.patience, `${e.id}.patience`).toBe(dg.patience);
    }
  });

  it("e14.masteryGate.patience === 0 (Mischetappe: kein Gedulds-Kurzschluss)", () => {
    expect(etappeById("e14")!.masteryGate.patience).toBe(0);
  });

  it("e15.masteryGate.minAttempts === 6 (Lesetext: weniger Versuche nötig)", () => {
    expect(etappeById("e15")!.masteryGate.minAttempts).toBe(6);
  });

  it("e15.masteryGate.patience === 0", () => {
    expect(etappeById("e15")!.masteryGate.patience).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// 3. Ball-Garantie (R1)
// ---------------------------------------------------------------------------

describe("b1 — erste echte Wörter (Kniese l,a,i,m)", () => {
  it("b1.items liefert nur Wörter mit Buchstaben ⊆ {l,a,i,m}", () => {
    const b1 = etappeById("b1")!;
    const allowed = new Set(["l", "a", "i", "m"]);
    const result = b1.items([]);
    expect(result.length).toBeGreaterThan(0);
    for (const w of result) {
      for (const ch of w.toLowerCase()) {
        expect(allowed.has(ch), `'${ch}' in '${w}' nicht in {l,a,i,m}`).toBe(true);
      }
    }
  });

  it("b1 enthält echte Wörter (mama, lama), nicht nur Einzelbuchstaben", () => {
    const result = etappeById("b1")!.items([]).map((w) => w.toLowerCase());
    expect(result).toContain("mama");
    expect(result).toContain("lama");
  });

  it("b1 zieht aus BASIS_KNIESE, ignoriert den angedockten Level-Pool", () => {
    const b1 = etappeById("b1")!;
    // Das Argument wird ignoriert → gleiches Ergebnis, egal welcher Pool kommt.
    expect(b1.items([])).toEqual(b1.items(["völlig", "fremd"]));
  });
});

// ---------------------------------------------------------------------------
// 4. Kumulative Buchstaben-Filter (Kniese-Reihenfolge)
// ---------------------------------------------------------------------------

describe("Basis-Buchstaben-Filter (Kniese, kumulativ)", () => {
  // Kumulative erlaubte Mengen je Etappe (Spiegel der SET_B* in etappen.ts).
  const CUM: Record<string, string> = {
    b1: "laim",
    b2: "laimsuo",
    b3: "laimsuodne", // Kniese-10
    b5: "laimsuodnerth",
    b6: "laimsuodnerthgbk",
    b7: "laimsuodnerthgbkwfz",
    b8: "laimsuodnerthgbkwfzpvj",
    b9: "laimsuodnerthgbkwfzpvjcqxy", // alle 26
    b10: "laimsuodnerthgbkwfzpvjcqxyäöüß",
  };
  for (const [id, letters] of Object.entries(CUM)) {
    it(`${id}.items ⊆ {${letters}} und nicht leer`, () => {
      const allowed = new Set([...letters]);
      const result = etappeById(id)!.items([]);
      expect(result.length, id).toBeGreaterThan(0);
      for (const w of result) {
        for (const ch of w.toLowerCase()) {
          expect(allowed.has(ch), `'${ch}' in '${w}' (${id}) nicht erlaubt`).toBe(true);
        }
      }
    });
  }

  it("die Etappen sind kumulativ aufsteigend (b1 ⊆ b2 ⊆ b3)", () => {
    const set = (id: string) =>
      new Set(etappeById(id)!.items([]).map((w) => w.toLowerCase()));
    const b1 = set("b1"), b2 = set("b2"), b3 = set("b3");
    for (const w of b1) expect(b2.has(w), `b2 fehlt ${w}`).toBe(true);
    for (const w of b2) expect(b3.has(w), `b3 fehlt ${w}`).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 5. b10 — Umlaut-/ß-Filter
// ---------------------------------------------------------------------------

describe("b10 — Umlaut-/ß-Filter", () => {
  it("b10.items enthält ausschließlich Wörter mit mindestens einem Umlaut/ß", () => {
    const result = etappeById("b10")!.items([]);
    expect(result.length).toBeGreaterThan(0);
    for (const w of result) {
      expect(/[äöüß]/.test(w.toLowerCase()), `'${w}' ohne Umlaut/ß`).toBe(true);
    }
  });

  it("b10.items bleibt innerhalb a–z + Umlaute/ß", () => {
    const allowed = new Set([..."abcdefghijklmnopqrstuvwxyzäöüß"]);
    for (const w of etappeById("b10")!.items([])) {
      for (const ch of w.toLowerCase()) {
        expect(allowed.has(ch), `'${ch}' in '${w}' nicht erlaubt`).toBe(true);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// 5b. Verwechsler-Trennung über die Etappenfolge (Lang/Kniese)
// ---------------------------------------------------------------------------

describe("Verwechsler-Trennung über die Etappenfolge", () => {
  // In welcher Etappe wird ein Buchstabe neu eingeführt?
  const stageOf = (letter: string): string | undefined =>
    etappenForSystem("basis").find((e) =>
      e.introducedUnits.some((u) => u.key === letter),
    )?.id;

  for (const [a, b] of [["i", "e"], ["d", "f"], ["h", "j"], ["r", "w"]] as [string, string][]) {
    it(`${a} und ${b} werden in verschiedenen Etappen eingeführt`, () => {
      const sa = stageOf(a);
      const sb = stageOf(b);
      expect(sa, `${a} ohne Etappe`).toBeDefined();
      expect(sb, `${b} ohne Etappe`).toBeDefined();
      expect(sa).not.toBe(sb);
    });
  }

  it("r (b5) wird vor w (b7) eingeführt", () => {
    expect(stageOf("r")).toBe("b5");
    expect(stageOf("w")).toBe("b7");
  });
});

// ---------------------------------------------------------------------------
// 6. b11, b4, b14 — Spezial-Items
// ---------------------------------------------------------------------------

describe("b11 — Festigung (Durchreiche)", () => {
  it("b11.items gibt alle Items unverändert zurück", () => {
    const b11 = etappeById("b11")!;
    const items = ["Haus", "Maus", "Baum"];
    expect(b11.items(items)).toEqual(items);
  });
});

describe("b4 — Großschreibung über Eigennamen", () => {
  it("b4.items liefert die Namensliste (BASIS_NAMEN)", () => {
    expect(etappeById("b4")!.items([])).toEqual(BASIS_NAMEN);
  });

  it("jeder Name beginnt mit einem Großbuchstaben", () => {
    for (const w of etappeById("b4")!.items([])) {
      expect(/^[A-ZÄÖÜ]/.test(w), w).toBe(true);
    }
  });

  it("die Namen nutzen nur die zehn Kniese-Buchstaben", () => {
    const allowed = new Set([..."laimsuodne"]);
    for (const w of etappeById("b4")!.items([])) {
      for (const ch of w.toLowerCase()) {
        expect(allowed.has(ch), `'${ch}' in '${w}' nicht in Kniese-10`).toBe(true);
      }
    }
  });
});

describe("b14 — Text-Durchreiche", () => {
  it("b14.items(TEXTE_BASIS) gibt exakt TEXTE_BASIS zurück (Referenz)", () => {
    const b14 = etappeById("b14")!;
    expect(b14.items(TEXTE_BASIS)).toBe(TEXTE_BASIS);
  });
});

// ---------------------------------------------------------------------------
// 7. getActiveEtappen (Setup-Filter)
// ---------------------------------------------------------------------------

describe("getActiveEtappen — Setup-Filter", () => {
  it("defaultSetup(): b13 ist enthalten, b13a..b13e sind NICHT enthalten", () => {
    const ids = getActiveEtappen("basis", defaultSetup()).map((e) => e.id);
    expect(ids).toContain("b13");
    expect(ids).not.toContain("b13a");
    expect(ids).not.toContain("b13b");
    expect(ids).not.toContain("b13c");
    expect(ids).not.toContain("b13d");
    expect(ids).not.toContain("b13e");
  });

  it("extendedNumbers:true enthält alle fünf b13a..b13e", () => {
    const ids = getActiveEtappen("basis", { extendedNumbers: true, expressPath: false }).map((e) => e.id);
    expect(ids).toContain("b13a");
    expect(ids).toContain("b13b");
    expect(ids).toContain("b13c");
    expect(ids).toContain("b13d");
    expect(ids).toContain("b13e");
  });

  it("defaultSetup enthält b1..b14 + Satzzeichen + Rechnen (ohne b13a..b13e) = 18 Etappen", () => {
    // additiv: + b-satzzeichen2, b-rechnen-plus/-minus/-mal
    expect(getActiveEtappen("basis", defaultSetup())).toHaveLength(19); // + b-suchen
  });

  it("extendedNumbers:true enthält 23 Etappen (18 + b13a..b13e)", () => {
    expect(getActiveEtappen("basis", { extendedNumbers: true, expressPath: false })).toHaveLength(24); // + b-suchen
  });
});

// ---------------------------------------------------------------------------
// 8. unitLevel-Logik
// ---------------------------------------------------------------------------

describe("unitLevel", () => {
  it("undefined → 'neu'", () => {
    expect(unitLevel(undefined)).toBe("neu");
  });

  it(`n < MIN_SAMPLES (${MIN_SAMPLES}) → 'neu'`, () => {
    expect(unitLevel(makeStats(3, 1))).toBe("neu"); // n=4 < 5
  });

  it(`n >= PATIENCE_BRAILLE (${PATIENCE_BRAILLE}) und acc >= TARGET_ACC (${TARGET_ACC}) → 'sitzt' (Geduldsregel, tempo-frei)`, () => {
    // n=16, acc=15/16≈0.9375 ≥ 0.9 → sitzt via Patience-Pfad
    expect(unitLevel(makeStats(15, 1))).toBe("sitzt");
  });

  it(`acc >= TARGET_ACC (${TARGET_ACC}) aber n < PATIENCE_BRAILLE → 'sitzt' (Genauigkeits-Pfad)`, () => {
    // n=10, acc=9/10=0.9 → sitzt
    expect(unitLevel(makeStats(9, 1))).toBe("sitzt");
  });

  it(`acc < STRUGGLE_ACC (${STRUGGLE_ACC}) → 'hakt'`, () => {
    // n=10, acc=4/10=0.4 < 0.8 → hakt
    expect(unitLevel(makeStats(4, 6))).toBe("hakt");
  });

  it(`STRUGGLE_ACC <= acc < TARGET_ACC → 'wackelig'`, () => {
    // n=10, acc=8/10=0.8 (nicht < 0.8, nicht >= 0.9)
    expect(unitLevel(makeStats(8, 2))).toBe("wackelig");
  });

  it("acc exakt 0.8 ist 'wackelig', nicht 'hakt'", () => {
    expect(unitLevel(makeStats(8, 2))).toBe("wackelig"); // 0.8 ist nicht < 0.8
  });
});

// ---------------------------------------------------------------------------
// 9. canAdvanceUnits
// ---------------------------------------------------------------------------

describe("canAdvanceUnits", () => {
  it("alle sitzt → kann voranschreiten", () => {
    const stats = { a: makeStats(10, 0), b: makeStats(10, 0) };
    expect(canAdvanceUnits(["a", "b"], stats)).toBe(true);
  });

  it("ein 'hakt' blockiert immer", () => {
    const stats = {
      a: makeStats(9, 1),  // sitzt
      b: makeStats(4, 6),  // hakt
    };
    expect(canAdvanceUnits(["a", "b"], stats)).toBe(false);
  });

  it(`genau MAX_WOBBLY (${MAX_WOBBLY}) wackelig → erlaubt`, () => {
    const stats: Record<string, UnitStat> = {};
    for (let i = 0; i < MAX_WOBBLY; i++) {
      stats[String(i)] = makeStats(8, 2); // wackelig
    }
    expect(canAdvanceUnits(Object.keys(stats), stats)).toBe(true);
  });

  it(`MAX_WOBBLY + 1 wackelig → blockiert`, () => {
    const stats: Record<string, UnitStat> = {};
    for (let i = 0; i <= MAX_WOBBLY; i++) {
      stats[String(i)] = makeStats(8, 2); // wackelig
    }
    expect(canAdvanceUnits(Object.keys(stats), stats)).toBe(false);
  });

  it("'neu' zählt als nicht-sitzt (wackelig-Zähler)", () => {
    // 3 neue Einheiten (noch keine Stats) → 3 "neu" → ≤ MAX_WOBBLY → erlaubt
    expect(canAdvanceUnits(["x", "y", "z"], {})).toBe(true);
  });

  it("leere introduced → kann immer voranschreiten", () => {
    expect(canAdvanceUnits([], {})).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 10. nextUnit
// ---------------------------------------------------------------------------

describe("nextUnit", () => {
  it("gibt die erste noch nicht eingeführte Einheit zurück", () => {
    const b1 = etappeById("b1")!;
    // "l" und "a" sind eingeführt → "i" kommt als nächste
    expect(nextUnit(b1, ["l", "a"])).toBe("i");
  });

  it("gibt null zurück, wenn alle Einheiten eingeführt sind", () => {
    const b1 = etappeById("b1")!;
    expect(nextUnit(b1, ["l", "a", "i", "m"])).toBeNull();
  });

  it("gibt die erste Einheit zurück, wenn noch nichts eingeführt ist", () => {
    const b1 = etappeById("b1")!;
    expect(nextUnit(b1, [])).toBe("l");
  });

  it("Etappen ohne introducedUnits (b11, b14) liefern immer null", () => {
    expect(nextUnit(etappeById("b11")!, [])).toBeNull();
    expect(nextUnit(etappeById("b14")!, [])).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// 11. ensureIntroducedForLevel (Migrations-Backfill, Bauvertrag §6.1)
// ---------------------------------------------------------------------------

describe("ensureIntroducedForLevel — Migrations-Backfill", () => {
  it("frischer Stand (kein completed) → leeres Array (Pipeline beginnt bei Einheit 1)", () => {
    const p = emptyProgress();
    expect(ensureIntroducedForLevel("l1-reihe1", p)).toEqual([]);
  });

  it("Altstand mit completed:true → alle Einheiten aus b1+b2+b3 (Kniese-10)", () => {
    const p: BrailleProgress = {
      ...emptyProgress(),
      levels: { "l1-reihe1": { completed: true, bestStars: 3, attempts: 50 } },
    };
    const result = ensureIntroducedForLevel("l1-reihe1", p);
    // b1: l,a,i,m · b2: s,u,o · b3: d,n,e
    const expected = ["l", "a", "i", "m", "s", "u", "o", "d", "n", "e"];
    for (const key of expected) {
      expect(result, `'${key}' fehlt in ensureIntroducedForLevel`).toContain(key);
    }
    expect(result).toHaveLength(expected.length);
  });

  it("bereits vorhandene introduced werden unverändert zurückgegeben", () => {
    const p: BrailleProgress = {
      ...emptyProgress(),
      introduced: { "l1-reihe1": ["l", "a"] },
    };
    expect(ensureIntroducedForLevel("l1-reihe1", p)).toEqual(["l", "a"]);
  });

  it("Altstand mit completed:true für l2-reihe2 → alle b5+b6-Einheiten", () => {
    const p: BrailleProgress = {
      ...emptyProgress(),
      levels: { "l2-reihe2": { completed: true, bestStars: 2, attempts: 30 } },
    };
    const result = ensureIntroducedForLevel("l2-reihe2", p);
    const units = [
      ...etappeById("b5")!.introducedUnits.map((u) => u.key),
      ...etappeById("b6")!.introducedUnits.map((u) => u.key),
    ];
    for (const key of units) {
      expect(result).toContain(key);
    }
  });
});

// ---------------------------------------------------------------------------
// 12. currentEtappe
// ---------------------------------------------------------------------------

describe("currentEtappe", () => {
  it("leerer Fortschritt → erste Etappe (b1)", () => {
    const et = currentEtappe("basis", emptyProgress());
    expect(et?.id).toBe("b1");
  });

  it("b1 gemeistert (alle Units + Level) → b2 ist aktuell", () => {
    const p: BrailleProgress = {
      ...masteredProgress("l1-reihe1"),
      introduced: { "l1-reihe1": ["l", "a", "i", "m"] }, // b1 vollständig
    };
    const et = currentEtappe("basis", p);
    expect(et?.id).toBe("b2");
  });

  it("mit getActiveEtappen (defaultSetup): nach b13 kommt b14, nicht b13a", () => {
    // Simuliere: b1..b13 alle gemeistert + alle units introduced
    // ★ "basis-suchen" gehoert dazu (additiv 23.09.2026): Die Suchaufgabe steht
    // im Lehrgang nach b3 und hat KEINE eigenen Einheiten - sie gilt allein
    // ueber ihre Runde als erledigt. Ohne sie bliebe currentEtappe dort stehen.
    const levelIds = ["l1-reihe1", "l2-reihe2", "l3-reihe3", "basis-suchen", "l4-woerter", "l7-satzzeichen", "l6-zahlen"];
    const p = emptyProgress();

    // Alle (Nicht-Text-)Level mastern — basis-texte bleibt bewusst offen
    for (const levelId of levelIds) {
      let m = emptyMastery();
      for (let i = 0; i < 15; i++) m = recordAttempt(m, "x", true);
      p.mastery = { ...(p.mastery ?? {}), [levelId]: m };
    }

    // Alle Einheiten von b1..b13 als introduced markieren (b14 = Text, b13a–e = aus)
    const active = getActiveEtappen("basis", defaultSetup());
    // ★ Über die NAMEN auswählen, nicht über Positionen: Diese Zeile hiess
    // `active.slice(0, 13)` und stimmte nur, solange niemand eine Etappe
    // dazwischenschob. Am 23.09. kam „b-suchen" nach b3, und der Wächter
    // mass ab da b1..b12 ([[feedback_waechter_benennt_sein_pruefstueck]]).
    const BIS_B13 = ["b1","b2","b3","b4","b5","b6","b7","b8","b9","b10","b11","b12","b13"];
    const b1to13 = active.filter((e) => BIS_B13.includes(e.id));
    expect(b1to13).toHaveLength(BIS_B13.length);

    p.introduced = {};
    for (const et of b1to13) {
      const existing = p.introduced[et.levelId] ?? [];
      p.introduced[et.levelId] = [...existing, ...et.introducedUnits.map((u) => u.key)];
    }

    const et = currentEtappe("basis", p, active);
    expect(et?.id).toBe("b14");
  });

  it("komplett gemeistert → undefined (System abgeschlossen)", () => {
    // Sehr vereinfachter Test: alle etappen in einer leeren Liste → undefined
    const et = currentEtappe("basis", emptyProgress(), []);
    expect(et).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// 13. etappenForLevel / etappenForSystem
// ---------------------------------------------------------------------------

describe("etappenForLevel / etappenForSystem", () => {
  it("etappenForLevel('l1-reihe1') liefert b1, b2, b3", () => {
    const ids = etappenForLevel("l1-reihe1").map((e) => e.id);
    expect(ids).toEqual(["b1", "b2", "b3"]);
  });

  it("etappenForLevel('l3-reihe3') liefert b7, b8, b9, b10", () => {
    const ids = etappenForLevel("l3-reihe3").map((e) => e.id);
    expect(ids).toEqual(["b7", "b8", "b9", "b10"]);
  });

  it("etappenForLevel('l4-woerter') liefert b4 und b11", () => {
    const ids = etappenForLevel("l4-woerter").map((e) => e.id);
    expect(ids).toEqual(["b4", "b11"]);
  });

  it("etappenForLevel('l6-zahlen') liefert b13 + B13_EXTENDED", () => {
    const ids = etappenForLevel("l6-zahlen").map((e) => e.id);
    expect(ids).toContain("b13");
    expect(ids).toContain("b13a");
    expect(ids).toContain("b13e");
  });

  it("etappenForSystem('basis') gibt alle 23 Basisschrift-Etappen zurück", () => {
    // additiv: 14 (b1..b14) + 5 (b13a..b13e) + b-satzzeichen2 + 3 Rechnen
    expect(etappenForSystem("basis")).toHaveLength(24); // + b-suchen
  });

  it("etappenForSystem('voll') gibt Vollschrift e11–e15 + 48 KFA-Lektionen + Satzzeichen + Texte", () => {
    const ids = etappenForSystem("voll").map((e) => e.id);
    // Vollschrift, dann die 48 Kurzschrift-Lektionen (system "voll"), dann die
    // additiv angehängte Satzzeichen-Wiederholung und zuletzt die Kurzschrift-Texte.
    expect(ids).toEqual([
      "e11", "e12", "e13", "e14", "voll-grenz", "e15",
      ...KFA_IDS,
      "voll-satzzeichen2", "kurz-texte",
    ]);
  });

  it("etappenForSystem('computer') gibt E16–E20b + U1–U8 zurück (P3 implementiert)", () => {
    const comp = etappenForSystem("computer");
    // 6 reguläre (e16..e20b) + 8 Express (u1..u8) + 4 Sonderzeichen-Welten = 18
    expect(comp).toHaveLength(18);
    const ids = comp.map((e) => e.id);
    for (const id of ["e16", "e17", "e18", "e19", "e20", "e20b"]) {
      expect(ids).toContain(id);
    }
    for (const id of ["u1", "u2", "u3", "u4", "u5", "u6", "u7", "u8"]) {
      expect(ids).toContain(id);
    }
  });
});

// ---------------------------------------------------------------------------
// 14. LEVELS-Reihenfolge unverändert (Migrationsregel)
// ---------------------------------------------------------------------------

describe("Level-ids unverändert (Bauvertrag §6.1)", () => {
  it("alle 21 eingefrorenen Level-ids sind stabil (als Präfix); kurz-* und ueb-* nur angehängt", () => {
    const frozen = [
      "l1-reihe1", "l2-reihe2", "l3-reihe3", "l4-woerter", "l5-saetze",
      "l6-zahlen", "l7-satzzeichen", "l8-rechnen",
      "voll-ei-ie", "voll-au-eu-aeu", "voll-ch-sch-st", "voll-woerter",
      "voll-saetze", "comp-buchstaben", "comp-gross",
      "comp-zahlen", "comp-sonderzeichen", "basis-texte",
      "voll-texte", "comp-texte-jugend", "comp-texte-erwachsene",
    ];
    const actual = LEVELS.map((l) => l.id);
    // Die 21 eingefrorenen ids bleiben unverändert die ersten 21 (kein Umsortieren).
    expect(actual.slice(0, 21)).toEqual(frozen);
    // P4 hängt die 48 KFA-Lektionen (kurz-kfa01..kfa48) + kurz-texte an.
    // Der UEB-Lehrgang (Englisch) läuft NICHT mehr über curriculum-Levels,
    // sondern als eigene Etappen-Reihe UEB_ETAPPEN (etappen.ts) — daher keine
    // „ueb-*"-Levels mehr in LEVELS.
    expect(actual).toEqual([
      ...frozen,
      // Striche (additiv, 22.09.2026): 4 Etappen NACH den 48 KFA-Lektionen,
      // VOR "kurz-texte" (Begründung: kurzschrift_content.ts, Kopfkommentar
      // STRICHE_LESSONS).
      ...KURZ_LEVEL_IDS, "kurz-striche01", "kurz-striche02", "kurz-striche03", "kurz-striche04",
      // Grenzfälle (additiv, 23.09.2026): 4 Etappen NACH den Strichen, VOR
      // "kurz-texte" (Quelle: Johannes' Liste „Wörter und Ausnahmen").
      "kurz-grenz01", "kurz-grenz02", "kurz-grenz03", "kurz-grenz04",
      "kurz-texte",
      // additiv ans Listenende angehängt (die ersten 21 bleiben eingefroren)
      // Vollschrift-Grenzfaelle (additiv, 23.09.2026) - steht im Lehrgang
      // zwischen e14 und den Satzzeichen, in dieser Liste aber HINTEN: die
      // ersten 21 ids sind eingefroren, die Reihenfolge kommt aus areas.ts.
      // Suchaufgabe der Basisschrift (additiv, 23.09.2026) - im Lehrgang nach
      // b3, in dieser Liste hinten (die ersten 21 ids sind eingefroren).
      "basis-suchen",
      "voll-grenz",
      "l-basis-satzzeichen2", "voll-satzzeichen2",
      "l-comp-satz", "l-comp-code", "l-comp-netz", "l-comp-sym",
    ]);
  });
});

// ---------------------------------------------------------------------------
// 15. P2 — Vollschrift E11–E15
// ---------------------------------------------------------------------------

describe("P2 — Voll-Etappen Struktur", () => {
  it("etappenForLevel('voll-ei-ie') liefert genau [e11]", () => {
    const ids = etappenForLevel("voll-ei-ie").map((e) => e.id);
    expect(ids).toEqual(["e11"]);
  });

  it("etappenForLevel('voll-au-eu-aeu') liefert genau [e12]", () => {
    expect(etappenForLevel("voll-au-eu-aeu").map((e) => e.id)).toEqual(["e12"]);
  });

  it("etappenForLevel('voll-ch-sch-st') liefert genau [e13]", () => {
    expect(etappenForLevel("voll-ch-sch-st").map((e) => e.id)).toEqual(["e13"]);
  });

  it("e13.introducedUnits: sch zuerst, dann ch, dann st", () => {
    const keys = etappeById("e13")!.introducedUnits.map((u) => u.key);
    expect(keys).toEqual(["sch", "ch", "st"]);
  });

  it("e11 und e12 haben defaultGate() (minAcc=0.9, minAttempts=12, patience=16)", () => {
    const dg = defaultGate();
    for (const id of ["e11", "e12"]) {
      const e = etappeById(id)!;
      expect(e.masteryGate).toEqual(dg);
    }
  });

  it("e14.masteryGate.patience === 0 und minAcc/minAttempts bleiben Standard", () => {
    const e14 = etappeById("e14")!;
    expect(e14.masteryGate.patience).toBe(0);
    expect(e14.masteryGate.minAcc).toBe(0.9);
    expect(e14.masteryGate.minAttempts).toBe(12);
  });

  it("e15.masteryGate: minAttempts=6, patience=0, minAcc=0.9", () => {
    const e15 = etappeById("e15")!;
    expect(e15.masteryGate.minAttempts).toBe(6);
    expect(e15.masteryGate.patience).toBe(0);
    expect(e15.masteryGate.minAcc).toBe(0.9);
  });

  it("alle Voll-Etappen haben system === 'voll'", () => {
    for (const e of etappenForSystem("voll")) {
      expect(e.system).toBe("voll");
    }
  });

  it("alle Voll-Level-Ids existieren in LEVELS (kein toter Anker)", () => {
    for (const e of etappenForSystem("voll")) {
      expect(levelById(e.levelId), `${e.id}.levelId='${e.levelId}' fehlt`).toBeDefined();
    }
  });
});

describe("P2 — Voll-Etappen Items-Filter", () => {
  it("e11.items filtert Wörter ohne 'ei' und 'ie' heraus", () => {
    const e11 = etappeById("e11")!;
    // "Haus" hat weder ei noch ie
    expect(e11.items(["mein", "Haus", "die"])).toEqual(["mein", "die"]);
  });

  it("e11.items lässt Wörter mit 'ei' durch", () => {
    const e11 = etappeById("e11")!;
    const result = e11.items(["klein", "Stein", "grün"]);
    expect(result).toContain("klein");
    expect(result).toContain("Stein");
    expect(result).not.toContain("grün");
  });

  it("e12.items filtert auf au/eu/äu", () => {
    const e12 = etappeById("e12")!;
    const result = e12.items(["Haus", "heute", "Bäume", "klein"]);
    expect(result).toContain("Haus");
    expect(result).toContain("heute");
    expect(result).toContain("Bäume");
    expect(result).not.toContain("klein");
  });

  it("e13.items filtert auf sch/ch/st", () => {
    const e13 = etappeById("e13")!;
    const result = e13.items(["Schule", "ich", "ist", "Maus"]);
    expect(result).toContain("Schule");
    expect(result).toContain("ich");
    expect(result).toContain("ist");
    expect(result).not.toContain("Maus");
  });

  it("e14.items gibt alle Items unverändert zurück (Mischetappe)", () => {
    const e14 = etappeById("e14")!;
    const items = ["Geschichte", "Liebe", "Freund"];
    expect(e14.items(items)).toEqual(items);
  });
});

// ---------------------------------------------------------------------------
// 16. P2 — Brücke Basis→Voll
// ---------------------------------------------------------------------------

/** Hilfsfunktion: einen LevelMastery mit n Versuchen (correct) anlegen */
function makeFullMastery(n: number): LevelMastery {
  let m = emptyMastery();
  for (let i = 0; i < n; i++) m = recordAttempt(m, "x", true);
  return m;
}

/** Hilfsfunktion: einen LevelMastery mit n Versuchen (teils falsch) */
function makeMasteryAcc(n: number, acc: number): LevelMastery {
  let m = emptyMastery();
  const correct = Math.round(n * acc);
  for (let i = 0; i < n; i++) m = recordAttempt(m, "x", i < correct);
  return m;
}

describe("lifetimeAcc", () => {
  it("undefined → 0", () => {
    expect(lifetimeAcc(undefined)).toBe(0);
  });

  it("leere Mastery → 0", () => {
    expect(lifetimeAcc(emptyMastery())).toBe(0);
  });

  it("12 korrekte Versuche → acc = 1.0", () => {
    expect(lifetimeAcc(makeFullMastery(12))).toBe(1);
  });

  it("seen < 12 → 0 (zu wenig Belege für Brücken-Urteil)", () => {
    expect(lifetimeAcc(makeFullMastery(11))).toBe(0);
  });

  it("12 Versuche, alle falsch → acc = 0", () => {
    let m = emptyMastery();
    for (let i = 0; i < 12; i++) m = recordAttempt(m, "x", false);
    expect(lifetimeAcc(m)).toBe(0);
  });

  it("16 Versuche mit 12 korrekten → acc = 0.75", () => {
    expect(lifetimeAcc(makeMasteryAcc(16, 0.75))).toBeCloseTo(0.75);
  });
});

describe("bridgeOpen", () => {
  it("undefined → false (kein Spring ohne Daten)", () => {
    expect(bridgeOpen(undefined)).toBe(false);
  });

  it("leeres Mastery-Objekt {} → false", () => {
    expect(bridgeOpen({})).toBe(false);
  });

  it("nur l1 gemeistert, l2/l3 fehlen → false", () => {
    expect(bridgeOpen({ "l1-reihe1": makeFullMastery(12) })).toBe(false);
  });

  it("l1/l2/l3 je 11 Versuche (< 12) → false (zu wenig Belege)", () => {
    const mastery = {
      "l1-reihe1": makeFullMastery(11),
      "l2-reihe2": makeFullMastery(11),
      "l3-reihe3": makeFullMastery(11),
    };
    expect(bridgeOpen(mastery)).toBe(false);
  });

  it("l1/l2/l3 je 12 korrekte Versuche (acc=1.0 ≥ BRIDGE_ACC 0.75) → true", () => {
    const mastery = {
      "l1-reihe1": makeFullMastery(12),
      "l2-reihe2": makeFullMastery(12),
      "l3-reihe3": makeFullMastery(12),
    };
    expect(bridgeOpen(mastery)).toBe(true);
  });

  it("l1/l2/l3 je 16 Versuche mit acc=0.75 → true (genau BRIDGE_ACC)", () => {
    const mastery = {
      "l1-reihe1": makeMasteryAcc(16, 0.75),
      "l2-reihe2": makeMasteryAcc(16, 0.75),
      "l3-reihe3": makeMasteryAcc(16, 0.75),
    };
    expect(bridgeOpen(mastery)).toBe(true);
  });

  it("l3 acc < BRIDGE_ACC (0.70) → false", () => {
    const mastery = {
      "l1-reihe1": makeFullMastery(12),
      "l2-reihe2": makeFullMastery(12),
      "l3-reihe3": makeMasteryAcc(20, 0.70),
    };
    expect(bridgeOpen(mastery)).toBe(false);
  });

  it("BRIDGE_ACC ist 0.75", () => {
    expect(BRIDGE_ACC).toBe(0.75);
  });

  it("BRIDGE_BASE_LEVELS enthält l1, l2, l3 (eingefrorene ids)", () => {
    expect(BRIDGE_BASE_LEVELS).toEqual(["l1-reihe1", "l2-reihe2", "l3-reihe3"]);
  });
});

describe("isLevelUnlockedBraille", () => {
  const vollLevelIds = [
    "voll-ei-ie", "voll-au-eu-aeu", "voll-ch-sch-st",
    "voll-woerter", "voll-saetze", "voll-texte",
  ];

  it("voll-ei-ie öffnet über Brücke (l1/l2/l3 gemeistert), auch ohne Basis-Kette fertig", () => {
    const mastery = {
      "l1-reihe1": makeFullMastery(12),
      "l2-reihe2": makeFullMastery(12),
      "l3-reihe3": makeFullMastery(12),
    };
    const p = { ...emptyProgress(), mastery };
    expect(isLevelUnlockedBraille(p, vollLevelIds, "voll-ei-ie")).toBe(true);
  });

  it("voll-ei-ie bleibt gesperrt ohne Brücke (leerer Progress)", () => {
    expect(
      isLevelUnlockedBraille(emptyProgress(), vollLevelIds, "voll-ei-ie"),
    ).toBe(false);
  });

  it("voll-au-eu-aeu delegiert an isLevelUnlocked (Standardkette)", () => {
    // Ohne voll-ei-ie completed → false
    const p = emptyProgress();
    expect(
      isLevelUnlockedBraille(p, vollLevelIds, "voll-au-eu-aeu"),
    ).toBe(false);
  });

  it("voll-au-eu-aeu öffnet wenn voll-ei-ie completed (Standardregel)", () => {
    const p = {
      ...emptyProgress(),
      levels: { "voll-ei-ie": { completed: true, bestStars: 3, attempts: 20 } },
    };
    expect(
      isLevelUnlockedBraille(p, vollLevelIds, "voll-au-eu-aeu"),
    ).toBe(true);
  });

  it("Basis-Level-Anfragen werden unverändert delegiert", () => {
    const basisIds = ["l1-reihe1", "l2-reihe2", "l3-reihe3"];
    // l1 ist immer offen (erstes Level)
    expect(isLevelUnlockedBraille(emptyProgress(), basisIds, "l1-reihe1")).toBe(true);
    // l2 ohne l1-completed → false
    expect(isLevelUnlockedBraille(emptyProgress(), basisIds, "l2-reihe2")).toBe(false);
  });
});
