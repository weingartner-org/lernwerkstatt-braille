/**
 * Die gemeinsame Messart und Wertung für Punktgenau (`wertung.ts`) - das
 * Fundament für Braille-Challenge, Klassenmatch und eigene Übungen.
 *
 * Geprüft wird: Tempo nach Abzug der Ansagezeit (Muster `eineMessart.ts`),
 * die Wertungsformel (Muster `schreibprobeWertung.ts`), die Wehrhaftigkeit
 * gegen Unsinn (nie NaN, nie unendlich, nie negativ) - und vor allem, dass
 * Schreiben und Lesen NIE zusammen in einer Rangliste landen.
 */
import { describe, it, expect } from "vitest";
import {
  tempo,
  treffsicherheit,
  wertung,
  rangprozent,
  bestesInGruppe,
  type LaufErgebnis,
  type GruppenWert,
} from "../src/lib/braille/wertung";

function lauf(partial: Partial<LaufErgebnis> = {}): LaufErgebnis {
  return {
    arbeitsweise: "schreiben",
    bereich: "basis",
    arbeitszeitMs: 60_000,
    ansageMs: 0,
    richtig: 30,
    falsch: 0,
    ...partial,
  };
}

describe("tempo", () => {
  it("rechnet Zellen je Minute nach Abzug der Ansagezeit", () => {
    // 20 richtige Zellen in 60 s, davon 10 s Ansage → 50 s reine Arbeitszeit
    // → 20 / 50000 * 60000 = 24 Zellen/Min.
    const e = lauf({ arbeitszeitMs: 60_000, ansageMs: 10_000, richtig: 20 });
    expect(tempo(e)).toBeCloseTo(24, 5);
  });

  it("zaehlt Lesen in Zeichen je Minute, mit derselben Formel", () => {
    const e = lauf({ arbeitsweise: "lesen", arbeitszeitMs: 30_000, ansageMs: 0, richtig: 15 });
    expect(tempo(e)).toBeCloseTo(30, 5);
  });

  it("wehrhaft: Zeit 0 ergibt 0, nie NaN oder unendlich", () => {
    const e = lauf({ arbeitszeitMs: 0, ansageMs: 0, richtig: 10 });
    const t = tempo(e);
    expect(t).toBe(0);
    expect(Number.isFinite(t)).toBe(true);
  });

  it("wehrhaft: keine richtigen Zeichen ergibt 0", () => {
    const e = lauf({ richtig: 0 });
    expect(tempo(e)).toBe(0);
  });

  it("wehrhaft: Ansagezeit groesser als Gesamtzeit ergibt 0, nie negativ", () => {
    const e = lauf({ arbeitszeitMs: 5_000, ansageMs: 20_000, richtig: 10 });
    const t = tempo(e);
    expect(t).toBe(0);
    expect(t).toBeGreaterThanOrEqual(0);
    expect(Number.isFinite(t)).toBe(true);
  });

  it("wehrhaft: negative Rohwerte richten kein Unheil an", () => {
    const e = lauf({ arbeitszeitMs: -100, ansageMs: -50, richtig: -5 });
    const t = tempo(e);
    expect(t).toBe(0);
    expect(Number.isFinite(t)).toBe(true);
    expect(t).toBeGreaterThanOrEqual(0);
  });
});

describe("treffsicherheit", () => {
  it("rechnet richtig gegen richtig plus falsch", () => {
    const e = lauf({ richtig: 18, falsch: 2 });
    expect(treffsicherheit(e)).toBeCloseTo(0.9, 5);
  });

  it("wehrhaft: weder richtig noch falsch ergibt 0, nicht NaN", () => {
    const e = lauf({ richtig: 0, falsch: 0 });
    const q = treffsicherheit(e);
    expect(q).toBe(0);
    expect(Number.isFinite(q)).toBe(true);
  });

  it("wehrhaft: negative Werte richten kein Unheil an", () => {
    const e = lauf({ richtig: -3, falsch: -1 });
    const q = treffsicherheit(e);
    expect(q).toBe(0);
    expect(Number.isFinite(q)).toBe(true);
    expect(q).toBeGreaterThanOrEqual(0);
  });

  it("liegt immer zwischen 0 und 1", () => {
    const e = lauf({ richtig: 7, falsch: 0 });
    const q = treffsicherheit(e);
    expect(q).toBeLessThanOrEqual(1);
    expect(q).toBeGreaterThanOrEqual(0);
  });
});

describe("wertung", () => {
  it("rechnet Guete mal Wurzel des gedeckelten Tempo-Anteils", () => {
    // 30 richtige Zellen, 0 Fehler, 60 s ohne Ansage → Tempo 30/Min.
    // Bezug 60 → Tempo-Anteil = Wurzel(30/60) = Wurzel(0.5).
    const e = lauf({ richtig: 30, falsch: 0, arbeitszeitMs: 60_000 });
    const w = wertung(e, 60);
    expect(w.guete).toBeCloseTo(1, 5);
    expect(w.tempoAnteil).toBeCloseTo(Math.sqrt(0.5), 5);
    expect(w.wert).toBeCloseTo(100 * 1 * Math.sqrt(0.5), 1);
  });

  it("straft Fehler ueber die Guete, nie negativ", () => {
    const sauber = wertung(lauf({ richtig: 20, falsch: 0 }), 40);
    const fehlerhaft = wertung(lauf({ richtig: 20, falsch: 4 }), 40);
    expect(fehlerhaft.wert).toBeLessThan(sauber.wert);
    expect(fehlerhaft.wert).toBeGreaterThanOrEqual(0);
  });

  it("deckelt den Tempo-Anteil bei 1, auch weit ueber dem Bezug", () => {
    // 1000 richtige Zellen in 10 s = 6000 Zellen/Min, weit ueber dem
    // Bezugstempo 10 - der TEMPO-ANTEIL deckelt trotzdem bei 1.
    const e = lauf({ richtig: 1000, falsch: 0, arbeitszeitMs: 10_000 });
    const w = wertung(e, 10);
    expect(tempo(e)).toBeCloseTo(6000, 1);
    expect(w.tempoAnteil).toBeCloseTo(1, 5);
    expect(w.wert).toBeCloseTo(100, 1);
  });

  it("wehrhaft: nichts geschrieben/gelesen ergibt Wert 0, nicht NaN", () => {
    const e = lauf({ richtig: 0, falsch: 0, arbeitszeitMs: 0, ansageMs: 0 });
    const w = wertung(e, 60);
    expect(w.wert).toBe(0);
    expect(Number.isFinite(w.wert)).toBe(true);
    expect(w.wert).toBeGreaterThanOrEqual(0);
  });

  it("wehrhaft: Bezugstempo 0 ergibt Wert 0, keine Division durch 0", () => {
    const e = lauf({ richtig: 20, falsch: 0 });
    const w = wertung(e, 0);
    expect(w.wert).toBe(0);
    expect(Number.isFinite(w.wert)).toBe(true);
  });

  it("wehrhaft: Ansagezeit groesser als Gesamtzeit bleibt gutartig", () => {
    const e = lauf({ arbeitszeitMs: 1_000, ansageMs: 50_000, richtig: 5, falsch: 1 });
    const w = wertung(e, 60);
    expect(w.wert).toBe(0);
    expect(Number.isFinite(w.wert)).toBe(true);
    expect(w.wert).toBeGreaterThanOrEqual(0);
  });

  it("bleibt immer im Bereich 0 bis 100", () => {
    const e = lauf({ richtig: 500, falsch: 0, arbeitszeitMs: 1_000 });
    const w = wertung(e, 1);
    expect(w.wert).toBeLessThanOrEqual(100);
    expect(w.wert).toBeGreaterThanOrEqual(0);
  });
});

describe("rangprozent - nie eine gemeinsame Rangliste ueber beide Arbeitsweisen", () => {
  const gruppe: GruppenWert[] = [
    { arbeitsweise: "schreiben", wert: 80 },
    { arbeitsweise: "schreiben", wert: 40 },
    { arbeitsweise: "lesen", wert: 95 },
    { arbeitsweise: "lesen", wert: 10 },
  ];

  it("bestesInGruppe ignoriert die andere Arbeitsweise", () => {
    expect(bestesInGruppe(gruppe, "schreiben")).toBe(80);
    expect(bestesInGruppe(gruppe, "lesen")).toBe(95);
  });

  it("rangprozent ordnet nur innerhalb derselben Arbeitsweise ein", () => {
    // 40 von 80 (schreiben) → 50 %, unabhaengig vom viel hoeheren Lesewert 95.
    expect(rangprozent(40, gruppe, "schreiben")).toBeCloseTo(50, 5);
    // 10 von 95 (lesen) → rund 10.5 %, unabhaengig vom Schreibwert 80.
    expect(rangprozent(10, gruppe, "lesen")).toBeCloseTo((100 * 10) / 95, 1);
  });

  it("das beste Ergebnis der eigenen Arbeitsweise steht bei 100", () => {
    expect(rangprozent(80, gruppe, "schreiben")).toBe(100);
    expect(rangprozent(95, gruppe, "lesen")).toBe(100);
  });

  it("wehrhaft: leere Gruppe ergibt null, nicht NaN", () => {
    expect(rangprozent(50, [], "schreiben")).toBeNull();
  });

  it("wehrhaft: nur die andere Arbeitsweise in der Gruppe ergibt null", () => {
    const nurLesen: GruppenWert[] = [{ arbeitsweise: "lesen", wert: 70 }];
    expect(rangprozent(50, nurLesen, "schreiben")).toBeNull();
  });

  it("wehrhaft: bester Wert 0 ergibt null, keine Division durch 0", () => {
    const alleNull: GruppenWert[] = [
      { arbeitsweise: "schreiben", wert: 0 },
      { arbeitsweise: "schreiben", wert: 0 },
    ];
    expect(rangprozent(0, alleNull, "schreiben")).toBeNull();
  });

  it("wehrhaft: negativer Wert wird nicht negativ ausgegeben", () => {
    const r = rangprozent(-20, gruppe, "schreiben");
    expect(r).not.toBeNull();
    expect(r as number).toBeGreaterThanOrEqual(0);
    expect(Number.isFinite(r as number)).toBe(true);
  });
});
