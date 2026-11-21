/**
 * Die Lesezeit-Rechnung von Punktgenau (`lib/braille/lesezeit.ts`) -
 * Johannes 22.09.2026: „nur eine Zahl aber vorlesen muss raus und er ließt
 * nimm am 40 wörter pro min und lerne dann die lesegeschw des schülers und
 * rechne mit diesem parameter. und das für überall".
 *
 * Geprüft wird hier NUR die Rechnung selbst (Uhr/Wochenaufgabe/Statistik
 * benutzen sie über `uebeUhr.ts`/`wochenaufgabe.ts` - siehe deren eigene
 * Wächter). Wehrhaft (Auftrag): keine Aufgabe ohne Zeichen, keine Zeit 0,
 * kein NaN, keine unendliche Geschwindigkeit - je EIN Test je Fall.
 */
import { describe, it, expect } from "vitest";
import {
  LESE_START_CPM,
  LESE_START_WPM,
  LESE_TEMPO_MAX_CPM,
  LESE_TEMPO_MIN_CPM,
  ZEICHEN_JE_WORT,
  berechneLesezeitMs,
  cpmAusEreignis,
  leseTempoAus,
  naechstesLeseTempo,
  uebezeitFuerEreignis,
} from "../src/lib/braille/lesezeit";

describe("LESE_START_CPM - die Vorgabe (40 Wörter/Minute) in Zellen/Minute", () => {
  it("rechnet Wörter/Minute mit der benannten Annahme (5 Zeichen/Wort) in Zellen/Minute um", () => {
    expect(LESE_START_WPM).toBe(40);
    expect(ZEICHEN_JE_WORT).toBe(5);
    expect(LESE_START_CPM).toBe(200);
  });
});

describe("berechneLesezeitMs - wehrhaft", () => {
  it("rechnet Zellen ÷ Tempo in Millisekunden um", () => {
    expect(berechneLesezeitMs(200, 200)).toBeCloseTo(60_000, 5); // 1 Minute
    expect(berechneLesezeitMs(100, 200)).toBeCloseTo(30_000, 5);
  });

  it("keine Aufgabe ohne Zeichen: 0 Zellen ⇒ 0 ms", () => {
    expect(berechneLesezeitMs(0, 200)).toBe(0);
    expect(berechneLesezeitMs(-5, 200)).toBe(0);
  });

  it("kein NaN: NaN-Zellen oder NaN-Tempo ⇒ 0 ms, nie NaN", () => {
    expect(berechneLesezeitMs(Number.NaN, 200)).toBe(0);
    expect(berechneLesezeitMs(200, Number.NaN)).toBe(0);
  });

  it("keine unendliche Geschwindigkeit: ein Tempo von 0 oder Infinity ⇒ 0 ms, nie Infinity", () => {
    expect(berechneLesezeitMs(200, 0)).toBe(0);
    expect(berechneLesezeitMs(200, Number.POSITIVE_INFINITY)).toBe(0);
  });
});

describe("uebezeitFuerEreignis - DIE EINE Rechnung", () => {
  it("selbst gelesen (kein spokenMs): genau die ms-Zeit, die Lesezeit wird NICHT addiert", () => {
    expect(uebezeitFuerEreignis({ ms: 5000, cells: 200 }, LESE_START_CPM)).toBe(5000);
  });

  it("vorgelesen (spokenMs > 0): die gerechnete Lesezeit kommt zur ms-Zeit dazu", () => {
    // 200 Zellen bei 200 Zellen/Minute (Vorgabe) = 60 000 ms Lesezeit dazu.
    expect(
      uebezeitFuerEreignis({ ms: 5000, cells: 200, spokenMs: 1200 }, LESE_START_CPM),
    ).toBe(5000 + 60_000);
  });

  it("spokenMs === 0 zählt wie nicht gesetzt - keine Lesezeit wird addiert", () => {
    expect(uebezeitFuerEreignis({ ms: 5000, cells: 200, spokenMs: 0 }, LESE_START_CPM)).toBe(5000);
  });

  it("keine Zeit 0 / kaputte ms: eine negative oder NaN ms-Zeit zählt als 0", () => {
    expect(uebezeitFuerEreignis({ ms: -100, cells: 200 }, LESE_START_CPM)).toBe(0);
    expect(uebezeitFuerEreignis({ ms: Number.NaN, cells: 200 }, LESE_START_CPM)).toBe(0);
  });

  it("eine vorgelesene Aufgabe ohne Zeichen addiert keine Lesezeit (nichts zu lesen)", () => {
    expect(uebezeitFuerEreignis({ ms: 5000, cells: 0, spokenMs: 500 }, LESE_START_CPM)).toBe(5000);
  });
});

/**
 * ★★★★★ DER DECKEL (22.09.2026, Nacht) - Johannes 21.09.2026, wörtlich (über
 * die Tastenuhr, für die er „überall so werten" wollte): „wenn jemand mehrere
 * Sekunden keine Taste drückt, zählt das nicht zur Übezeit - Programm
 * geöffnet ist kein Üben." Die Probe aus dem Auftrag: 12 Zellen, Starttempo
 * 200 Zellen/Minute (`LESE_START_CPM`) ⇒ gerechnete Lesezeit L = 3,6 s.
 * Ein Test je Fall.
 */
describe("uebezeitFuerEreignis - DER DECKEL (activeMs + gerechnete Lesezeit)", () => {
  const CELLS = 12; // L = 12 / 200 * 60_000 ms = 3600 ms = 3,6 s
  const L_MS = 3600;

  it("vorgelesen, zügig getippt: ms und activeMs nah beieinander - der Deckel greift nicht sichtbar", () => {
    // roh = 4000 + 3600 = 7600; deckel = 4000 + 3600 = 7600
    expect(
      uebezeitFuerEreignis(
        { ms: 4000, cells: CELLS, spokenMs: 500, activeMs: 4000 },
        LESE_START_CPM,
      ),
    ).toBe(7600);
  });

  it("vorgelesen, 3 Minuten weg: der Deckel kappt die Leerlaufzeit auf die echte Tastenzeit + Lesezeit", () => {
    // roh = 184_000 + 3600 = 187_600; deckel = 4000 + 3600 = 7600 ⇒ NICHT 187_600
    expect(
      uebezeitFuerEreignis(
        { ms: 184_000, cells: CELLS, spokenMs: 500, activeMs: 4000 },
        LESE_START_CPM,
      ),
    ).toBe(7600);
  });

  it("selbst getastet, zügig: der Deckel addiert die gerechnete Lesezeit trotzdem (stilles Ertasten)", () => {
    // roh = 9000 (kein spokenMs, keine Lesezeit in roh); deckel = 4000 + 3600 = 7600
    expect(
      uebezeitFuerEreignis({ ms: 9000, cells: CELLS, activeMs: 4000 }, LESE_START_CPM),
    ).toBe(7600);
  });

  it("selbst getastet, 3 Minuten weg: derselbe Deckel wie beim zügigen Fall", () => {
    // roh = 189_000; deckel = 4000 + 3600 = 7600 ⇒ NICHT 189_000
    expect(
      uebezeitFuerEreignis({ ms: 189_000, cells: CELLS, activeMs: 4000 }, LESE_START_CPM),
    ).toBe(7600);
  });

  it("ohne activeMs (nicht gemessen): KEIN Deckel - genau die Rechnung von vorher, ungedeckelt", () => {
    // „Nichts gemessen" ist nicht dasselbe wie „null Tastenzeit gemessen":
    // roh bleibt unverändert stehen, obwohl er weit über jedem plausiblen Deckel läge.
    expect(
      uebezeitFuerEreignis({ ms: 184_000, cells: CELLS, spokenMs: 500 }, LESE_START_CPM),
    ).toBe(184_000 + L_MS);
  });
});

describe("cpmAusEreignis - die Messung, aus der das Lesetempo gelernt wird", () => {
  it("selbst gelesen: Zellen ÷ Minuten aus ms/cells", () => {
    // 100 Zellen in 30 000 ms = 200 Zellen/Minute.
    expect(cpmAusEreignis({ direction: "read", ms: 30_000, cells: 100 })).toBeCloseTo(200, 5);
  });

  it("★★★ eine SCHREIB-Aufgabe ist KEINE Lese-Messung (22.09.2026)", () => {
    // Punkte setzen dauert ein Vielfaches des Lesens. Wer aus einer
    // Schreib-Aufgabe ein „Lesetempo" ableitet, lernt eine systematisch zu
    // kleine Zahl - und rechnet danach allen vorgelesenen Aufgaben zu wenig
    // Zeit an.
    expect(cpmAusEreignis({ direction: "write", ms: 30_000, cells: 100 })).toBeNull();
  });

  it("ohne Richtung (Altstand) wird NICHT gelernt - lieber der Startwert", () => {
    expect(cpmAusEreignis({ ms: 30_000, cells: 100 })).toBeNull();
  });

  it("vorgelesen (spokenMs > 0): KEINE Messung (null) - das ist keine Lese-Zeitnahme", () => {
    expect(cpmAusEreignis({ direction: "read", ms: 30_000, cells: 100, spokenMs: 500 })).toBeNull();
  });

  it("keine Aufgabe ohne Zeichen: 0 oder negative Zellen ⇒ null", () => {
    expect(cpmAusEreignis({ direction: "read", ms: 30_000, cells: 0 })).toBeNull();
    expect(cpmAusEreignis({ direction: "read", ms: 30_000, cells: -3 })).toBeNull();
  });

  it("keine Zeit 0: eine ms-Zeit von 0 (oder negativ) ⇒ null, keine Division durch 0", () => {
    expect(cpmAusEreignis({ direction: "read", ms: 0, cells: 100 })).toBeNull();
    expect(cpmAusEreignis({ direction: "read", ms: -10, cells: 100 })).toBeNull();
  });

  it("kein NaN: eine kaputte ms-/Zellen-Zahl ⇒ null, nie NaN", () => {
    expect(cpmAusEreignis({ direction: "read", ms: Number.NaN, cells: 100 })).toBeNull();
    expect(cpmAusEreignis({ direction: "read", ms: 30_000, cells: Number.NaN })).toBeNull();
  });
});

describe("naechstesLeseTempo - gleitender Mittelwert, dieselbe Bauart wie updateSpeedEma (stars.ts)", () => {
  it("die erste Messung setzt das Tempo direkt (kein Vorwert)", () => {
    expect(naechstesLeseTempo(undefined, 300)).toBe(300);
    expect(naechstesLeseTempo(0, 300)).toBe(300);
  });

  it("weitere Messungen blenden gleitend ein (EMA), springen nicht auf den neuen Wert", () => {
    const t1 = naechstesLeseTempo(200, 400);
    expect(t1).toBeGreaterThan(200);
    expect(t1).toBeLessThan(400);
  });

  it("keine unendliche Geschwindigkeit: das Ergebnis bleibt zwischen den Grenzen gedeckelt", () => {
    expect(naechstesLeseTempo(undefined, 100_000)).toBe(LESE_TEMPO_MAX_CPM);
    expect(naechstesLeseTempo(undefined, 0.001)).toBe(LESE_TEMPO_MIN_CPM);
  });
});

describe("leseTempoAus - das aktuelle Lesetempo aus dem Spielstand", () => {
  it("ohne gelerntes Tempo gilt der Vorgabewert", () => {
    expect(leseTempoAus({})).toBe(LESE_START_CPM);
    expect(leseTempoAus({ leseTempoCpm: undefined })).toBe(LESE_START_CPM);
  });

  it("mit gelerntem Tempo gilt dieses", () => {
    expect(leseTempoAus({ leseTempoCpm: 350 })).toBe(350);
  });

  it("ein kaputter Wert (0 oder negativ) fällt auf den Vorgabewert zurück", () => {
    expect(leseTempoAus({ leseTempoCpm: 0 })).toBe(LESE_START_CPM);
    expect(leseTempoAus({ leseTempoCpm: -50 })).toBe(LESE_START_CPM);
  });
});
