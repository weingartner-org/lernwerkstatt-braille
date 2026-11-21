/**
 * Wächter für die Abzeichen von Plus.
 *
 * ★ Die Hälfte dieser Datei prüft, was es NICHT gibt. „Belohnung ist der Teil,
 * bei dem man am leichtesten Schaden anrichtet" - die Verbote aus Abschnitt 10
 * der didaktisch-methodischen Struktur sind hier Fälle, nicht Kommentare.
 */
import { describe, expect, it } from "vitest";
import {
  ABZEICHEN, WOCHENZIELE, abzeichen, kalenderwoche, leererZaehlstand, meldung,
  neueAbzeichen, neuesWochenziel, verdient, wochenstand, zaehleWoche, type Familie,
} from "../src/lib/plus/abzeichen";

describe("Die Familien", () => {
  // Das Dokument kennt sechs. Die siebente, „Mut“, kam am 16.10.2026 auf
  // Wunsch von Johannes dazu (Entwurf „Plus - Motivation“); weitere nicht ohne
  // neuen Beschluss.
  it("hat die sechs des Dokuments und dazu „Mut“ - und keine achte", () => {
    const familien = new Set(ABZEICHEN.map((a) => a.familie));
    expect([...familien].sort()).toEqual(
      ["geheimnis", "menge", "miteinander", "mut", "tage", "treffsicherheit", "vielfalt"] as Familie[],
    );
  });

  it("hat sechs geheime - der unbedenklichste Typ", () => {
    // „Die Untergrabung der eigenen Motivation trifft vor allem ERWARTETE
    // Belohnungen." Deshalb sind es genau sechs.
    expect(ABZEICHEN.filter((a) => a.geheim)).toHaveLength(6);
  });

  it("gibt jeder Familie Stufen statt Einzelstücke", () => {
    for (const f of ["menge", "treffsicherheit", "vielfalt", "tage"] as Familie[]) {
      expect(ABZEICHEN.filter((a) => a.familie === f).length, f).toBeGreaterThanOrEqual(3);
    }
  });

  it("vergibt jede Kennung und jedes Motiv nur einmal", () => {
    expect(new Set(ABZEICHEN.map((a) => a.id)).size).toBe(ABZEICHEN.length);
    expect(new Set(ABZEICHEN.map((a) => a.emoji)).size).toBe(ABZEICHEN.length);
  });

  it("beschreibt jedes Motiv in Worten - für ein Kind, das es nicht sieht", () => {
    for (const a of ABZEICHEN) {
      expect(a.bildbeschreibung.length, a.id).toBeGreaterThan(3);
      expect(a.bildbeschreibung.length, a.id).toBeLessThan(60);
      expect(a.bedingung.length, a.id).toBeLessThan(80);
    }
  });
});

describe("★ Was es NICHT gibt", () => {
  const worte = (a: { name: string; bedingung: string }) => `${a.name} ${a.bedingung}`.toLowerCase();

  it("kein Abzeichen für Tempo", () => {
    // Zeitdruck erzeugt Rechenangst und benachteiligt ein Kind mit
    // Screenreader ein zweites Mal - die Vorlesezeit läuft mit.
    for (const a of ABZEICHEN) {
      expect(worte(a), a.id).not.toMatch(/schnell|sekunde|minute|tempo|zeit|rasch|blitz/);
    }
  });

  it("kein Abzeichen fürs Nicht-Aussetzen - Tage zählen nur aufwärts", () => {
    for (const a of ABZEICHEN) {
      expect(worte(a), a.id).not.toMatch(/hintereinander|in folge|serie|täglich|jeden tag|ohne pause/);
    }
    // Der Beleg: fünfzig Tage INSGESAMT, nicht fünfzig am Stück.
    const z = { ...leererZaehlstand(), tage: 50 };
    expect(verdient(z)).toContain("plus-tanne");
  });
});

describe("Wann es ein Abzeichen gibt", () => {
  it("zählt die Menge in Stufen", () => {
    expect(verdient({ ...leererZaehlstand(), gerechnet: 49 })).toEqual([]);
    expect(verdient({ ...leererZaehlstand(), gerechnet: 50 })).toEqual(["plus-nilpferd"]);
    expect(verdient({ ...leererZaehlstand(), gerechnet: 2500 })).toHaveLength(5);
  });

  it("meldet nur, was neu ist", () => {
    const z = { ...leererZaehlstand(), gerechnet: 200 };
    expect(neueAbzeichen(z, [])).toEqual(["plus-nilpferd", "plus-eisbaer"]);
    expect(neueAbzeichen(z, ["plus-nilpferd"])).toEqual(["plus-eisbaer"]);
    expect(neueAbzeichen(z, ["plus-nilpferd", "plus-eisbaer"])).toEqual([]);
  });

  it("findet die Geheimnisse an ihren Besonderheiten", () => {
    expect(verdient({ ...leererZaehlstand(), besondere: ["palindrom"] })).toContain("plus-zauberstab");
    expect(verdient({ ...leererZaehlstand(), braille: ["computer"] })).toContain("plus-wuerfel");
    expect(verdient({ ...leererZaehlstand(), braille: ["computer", "marburger"] })).toContain("plus-trampeltier");
    expect(verdient({ ...leererZaehlstand(), stufen: 8 })).toContain("plus-drache");
    expect(verdient({ ...leererZaehlstand(), pauseTage: 14 })).toContain("plus-bahnhof");
  });

  it("sagt kurz Bescheid", () => {
    expect(meldung("plus-nilpferd")).toBe("Neues Abzeichen: Nilpferd.");
    expect(meldung("gibt-es-nicht")).toBe("");
    for (const a of ABZEICHEN) expect(meldung(a.id).length, a.id).toBeLessThan(45);
  });

  it("kennt jedes Abzeichen auch einzeln", () => {
    expect(abzeichen("plus-nilpferd")?.familie).toBe("menge");
    expect(abzeichen("gibt-es-nicht")).toBeUndefined();
  });
});

describe("Das Wochenziel", () => {
  it("wird vom Kind gewählt, nicht vorgegeben", () => {
    expect(WOCHENZIELE.length).toBeGreaterThan(2);
    expect(neuesWochenziel(20).ziel).toBe(20);
    expect(neuesWochenziel(200).ziel).toBe(200);
  });

  it("zählt Aufgaben und fängt in der neuen Woche bei null an", () => {
    const montag = new Date("2026-09-21T10:00:00Z");
    const naechsterMontag = new Date("2026-09-28T10:00:00Z");
    let w = neuesWochenziel(20, montag);
    w = zaehleWoche(w, montag);
    w = zaehleWoche(w, montag);
    expect(w.geschafft).toBe(2);
    w = zaehleWoche(w, naechsterMontag);
    expect(w.geschafft).toBe(1);
    expect(w.woche).not.toBe(kalenderwoche(montag));
  });

  it("sagt den Stand in einem kurzen Satz", () => {
    const w = { woche: "2026-39", ziel: 20, geschafft: 5 };
    expect(wochenstand(w)).toBe("Diese Woche: 5 von 20 Aufgaben.");
    expect(wochenstand({ ...w, geschafft: 20 })).toContain("geschafft");
    expect(wochenstand(w).length).toBeLessThan(45);
  });

  it("rechnet die Kalenderwoche nach ISO - Montag ist der erste Tag", () => {
    expect(kalenderwoche(new Date("2026-01-01T12:00:00Z"))).toBe("2026-01");
    expect(kalenderwoche(new Date("2026-09-22T12:00:00Z"))).toBe("2026-39");
  });
});
