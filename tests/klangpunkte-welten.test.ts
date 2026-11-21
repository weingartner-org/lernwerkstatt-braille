/**
 * Klangpunkte als eigenständiges Programm (Herauslösung 08.07.2026):
 * Klangwelten-Registry, einmalige Fortschritts-Übernahme aus Punktgenau,
 * Programm-Katalog und die bereinigten Punktgenau-Bereiche.
 */
import { describe, expect, it } from "vitest";
import {
  KAPITEL,
  KLANG_WELTEN,
  kapitelById,
  kapitelIndex,
  weltByNr,
  weltOfKapitel,
} from "@/lib/klangpunkte/welten";
import { KLANG_ETAPPEN } from "@/lib/klangpunkte/etappen";
import {
  emptyKlangProgress,
  migrateFromBraille,
  totalStars,
} from "@/lib/klangpunkte/progress";
import { awardKlangBadges, earnedKlangBadges } from "@/lib/klangpunkte/badges";
import { emptyProgress } from "@/lib/braille/progress";
import { emptyMastery } from "@/lib/braille/adaptive";
import { ALL_PROGRAMS } from "@/lib/allPrograms";
import { AREAS } from "@/lib/braille/areas";

describe("Klangwelten-Registry", () => {
  it("jedes Kapitel liegt in GENAU einer Welt; nichts fehlt, nichts doppelt", () => {
    const flat = KLANG_WELTEN.flatMap((w) => w.etappen.map((e) => e.id));
    expect(new Set(flat).size).toBe(flat.length);
    expect([...flat].sort()).toEqual(KLANG_ETAPPEN.map((e) => e.id).sort());
    expect(KAPITEL.length).toBe(KLANG_ETAPPEN.length);
  });

  it("Welt-Nummern sind kanonisch (1–9) und die Kapitel liegen richtig", () => {
    expect(KLANG_WELTEN.map((w) => w.nr)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(weltOfKapitel("kp1")?.nr).toBe(1);
    // Stufe-3-Ausbau: Welt 1 gewinnt Hör-/Nachspiel-Kapitel
    expect(weltOfKapitel("kp-echo")?.nr).toBe(1);
    expect(weltOfKapitel("kp-melodie-memory")?.nr).toBe(1);
    expect(weltOfKapitel("kp8")?.nr).toBe(2);
    expect(weltOfKapitel("kp-haltebogen")?.nr).toBe(2);
    expect(weltOfKapitel("kp12")?.nr).toBe(3);
    expect(weltOfKapitel("kp-triolen")?.nr).toBe(3);
    // Welt 4 „Ausdruck" ist neu
    expect(weltOfKapitel("kp-bindebogen")?.nr).toBe(4);
    expect(weltOfKapitel("kp-verzierungen2")?.nr).toBe(4);
    expect(weltOfKapitel("kp-ausdruck-lied")?.nr).toBe(4);
    expect(weltOfKapitel("kp13")?.nr).toBe(5);
    expect(weltOfKapitel("kp-volten")?.nr).toBe(5);
    expect(weltOfKapitel("kp-formen")?.nr).toBe(5);
    // Stufe-4-Ausbau: Welt 6 Zusammenklang + Welt 7 Theorie-Spielplatz
    expect(weltOfKapitel("kp-intervalle1")?.nr).toBe(6);
    expect(weltOfKapitel("kp-inakkord")?.nr).toBe(6);
    expect(weltOfKapitel("kp-tonleitern")?.nr).toBe(7);
    expect(weltOfKapitel("kp-spielwiese")?.nr).toBe(7);
    expect(weltOfKapitel("kp-komponier")?.nr).toBe(7);
    // Stufe-5-Ausbau: Welt 8 Instrumentenkunde + Welt 9 Lieder-Bühne (Ausbau)
    expect(weltOfKapitel("kp-fingersatz")?.nr).toBe(8);
    expect(weltOfKapitel("kp-klavier")?.nr).toBe(8);
    expect(weltOfKapitel("kp-orchester")?.nr).toBe(8);
    expect(weltOfKapitel("kp14")?.nr).toBe(9);
    expect(weltOfKapitel("kp-lieder2")?.nr).toBe(9);
    expect(weltOfKapitel("kp-lesekonzert")?.nr).toBe(9);
    expect(weltOfKapitel("kp-liederquiz")?.nr).toBe(9);
  });

  it("Ur-Reihenfolge bleibt innerhalb der Welten erhalten (Didaktik-Einfrieren)", () => {
    // Welt 1 beginnt weiterhin mit dem eingefrorenen kp1, kp2
    expect(weltByNr(1)!.etappen.map((e) => e.id).slice(0, 2)).toEqual(["kp1", "kp2"]);
    expect(weltByNr(2)!.etappen.map((e) => e.id).slice(0, 6)).toEqual([
      "kp3",
      "kp4",
      "kp5",
      "kp6",
      "kp7",
      "kp8",
    ]);
    expect(weltByNr(3)!.etappen.map((e) => e.id).slice(0, 4)).toEqual([
      "kp9",
      "kp10",
      "kp11",
      "kp12",
    ]);
    // Welt 5 beginnt mit dem eingefrorenen kp13
    expect(weltByNr(5)!.etappen.map((e) => e.id)[0]).toBe("kp13");
    // Welt 4 in der Übergabe-Reihenfolge
    expect(weltByNr(4)!.etappen.map((e) => e.id)).toEqual([
      "kp-bindebogen",
      "kp-artikulation",
      "kp-dynamik",
      "kp-tempo",
      "kp-verzierungen1",
      "kp-verzierungen2",
      "kp-ausdruck-lied",
    ]);
  });

  it("kapitelById/kapitelIndex sind konsistent", () => {
    expect(kapitelById("kp14")?.title).toBe("Lieder-Werkstatt");
    expect(kapitelIndex(KAPITEL[0].id)).toBe(0);
    expect(kapitelIndex("gibt-es-nicht")).toBe(-1);
    expect(kapitelById("gibt-es-nicht")).toBeNull();
  });
});

describe("Fortschritts-Übernahme aus Punktgenau (einmalig, nur kp*)", () => {
  it("übernimmt kp*-Sterne und -Mastery, ignoriert Schrift-Etappen", () => {
    const braille = emptyProgress();
    braille.levels["kp3"] = { completed: true, bestStars: 3, attempts: 2 };
    braille.levels["b1"] = { completed: true, bestStars: 2, attempts: 1 };
    braille.mastery = { kp3: emptyMastery(), b1: emptyMastery() };
    const kp = migrateFromBraille(emptyKlangProgress(), braille);
    expect(kp.levels.kp3).toEqual({ completed: true, bestStars: 3, attempts: 2 });
    expect(kp.levels.b1).toBeUndefined();
    expect(kp.mastery?.kp3).toBeDefined();
    expect(kp.mastery?.b1).toBeUndefined();
    expect(kp.migratedFromBraille).toBe(true);
    expect(totalStars(kp)).toBe(3);
  });

  it("ist idempotent: nach der Übernahme ändert ein zweiter Lauf nichts mehr", () => {
    const braille = emptyProgress();
    braille.levels["kp3"] = { completed: true, bestStars: 3, attempts: 2 };
    const once = migrateFromBraille(emptyKlangProgress(), braille);
    braille.levels["kp5"] = { completed: true, bestStars: 1, attempts: 1 };
    const twice = migrateFromBraille(once, braille);
    expect(twice.levels.kp5).toBeUndefined();
    expect(twice).toEqual(once);
  });

  it("bestehende Klangpunkte-Stände gewinnen; lastPlace kommt aus area=noten", () => {
    const braille = emptyProgress();
    braille.levels["kp3"] = { completed: true, bestStars: 1, attempts: 9 };
    braille.lastPlace = { area: "noten", etappeId: "kp7", direction: "write" };
    const own = emptyKlangProgress();
    own.levels["kp3"] = { completed: true, bestStars: 3, attempts: 1 };
    const kp = migrateFromBraille(own, braille);
    expect(kp.levels.kp3.bestStars).toBe(3);
    expect(kp.lastPlace).toEqual({ kapitelId: "kp7" });
  });

  it("lastPlace aus Schrift-Bereichen wird NICHT übernommen; ohne Braille-Stand nur Flag", () => {
    const braille = emptyProgress();
    braille.lastPlace = { area: "basis", etappeId: "b3", direction: "write" };
    const kp = migrateFromBraille(emptyKlangProgress(), braille);
    expect(kp.lastPlace).toBeUndefined();
    const ohne = migrateFromBraille(emptyKlangProgress(), null);
    expect(ohne.migratedFromBraille).toBe(true);
    expect(Object.keys(ohne.levels)).toHaveLength(0);
  });

  it("auch kp-…-Kapitel (Stufe 2) würden übernommen, b*/e*-Etappen nie", () => {
    const braille = emptyProgress();
    braille.levels["kp-haltebogen"] = { completed: true, bestStars: 2, attempts: 1 };
    braille.levels["e11"] = { completed: true, bestStars: 3, attempts: 1 };
    const kp = migrateFromBraille(emptyKlangProgress(), braille);
    expect(kp.levels["kp-haltebogen"]).toBeDefined();
    expect(kp.levels["e11"]).toBeUndefined();
  });
});

describe("Abzeichen (Stufe 5, §12)", () => {
  it("Diktat-Zähler steigt, Diktat-Abzeichen wird nach 10 sauberen Diktaten fällig", () => {
    let p = emptyKlangProgress();
    let last: ReturnType<typeof awardKlangBadges> | null = null;
    for (let i = 0; i < 10; i++) {
      last = awardKlangBadges(p, { kind: "diktat" }, 1000 + i);
      p = last.progress;
    }
    expect(p.badgeTally?.diktate).toBe(10);
    expect(Object.keys(p.badges ?? {})).toContain("diktat-1");
    expect(last!.newly.some((b) => b.id === "diktat-1")).toBe(true);
    // Zweiter Lauf verdient dasselbe Abzeichen NICHT noch einmal.
    const again = awardKlangBadges(p, { kind: "diktat" }, 2000);
    expect(again.newly.some((b) => b.id === "diktat-1")).toBe(false);
  });

  it("verschiedene Lieder zählen einzeln, dasselbe Lied nicht doppelt", () => {
    let p = emptyKlangProgress();
    p = awardKlangBadges(p, { kind: "song", id: "haenschen" }, 1).progress;
    const dup = awardKlangBadges(p, { kind: "song", id: "haenschen" }, 2);
    expect(dup.progress.badgeTally?.songIds).toEqual(["haenschen"]);
    const zwei = awardKlangBadges(dup.progress, { kind: "song", id: "entchen" }, 3);
    expect(zwei.progress.badgeTally?.songIds.length).toBe(2);
    expect(Object.keys(p.badges ?? {})).toContain("lied-1"); // 1. Lied
  });

  it("Sterne- und Welten-Abzeichen leiten sich aus dem Spielstand ab", () => {
    const p = emptyKlangProgress();
    // Welt 5 „Formenbau" komplett meistern → ein Welten-Abzeichen + Sterne.
    for (const e of ["kp13", "kp-braillerepeats", "kp-volten", "kp-formen"]) {
      p.levels[e] = { completed: true, bestStars: 3, attempts: 12 };
    }
    const res = awardKlangBadges(p, { kind: "mastered" }, 1);
    const ids = Object.keys(res.progress.badges ?? {});
    expect(ids).toContain("welt-1"); // eine ganze Welt fertig
    expect(ids).toContain("stern-1"); // 12 Sterne ≥ 5, aber < 15
    expect(ids).not.toContain("stern-2");
    expect(ids).toContain("drei-1"); // 4 Kapitel mit 3 Sternen ≥ 1, aber < 5
    expect(ids).not.toContain("drei-2");
    expect(earnedKlangBadges(res.progress).length).toBeGreaterThan(0);
  });

  it("erstes gespeichertes Werk gibt das Geheim-Abzeichen", () => {
    const p = emptyKlangProgress();
    p.werke = [{ name: "Test", cells: [1], createdAt: 1 }];
    const res = awardKlangBadges(p, { kind: "werk" }, 1);
    expect(Object.keys(res.progress.badges ?? {})).toContain("erstes-werk");
  });
});

describe("Herauslösung aus Punktgenau", () => {
  it("Punktgenau hat wieder 5 Bereiche — ohne noten", () => {
    expect(AREAS.map((a) => a.key)).toEqual([
      "basis",
      "voll",
      "computer",
      "kurzschrift",
      "ueb",
    ]);
  });

  it("Klangpunkte steht im Programm-Katalog (/programme/klangpunkte, als Live-Stand freigegeben)", () => {
    const p = ALL_PROGRAMS.find((x) => x.key === "klangpunkte");
    // `draft: false` seit 21.09.2026: Der Code-Default folgt dem Live-Stand, sonst
    // zeigte die Lernwerkstatt bei einem Aussetzer des Netzes nur drei Programme.
    expect(p).toMatchObject({
      path: "/programme/klangpunkte",
      type: "lern",
      draft: false,
    });
  });
});
