/**
 * Übezeit-Uhr von Punktgenau (`lib/braille/uebeUhr.ts`) - die Rechnung, nicht
 * die Oberfläche (siehe `tests/braille-uebeuhr-anzeige.test.tsx` dafür).
 *
 * ★★★★★ SEIT 22.09.2026 (Abend): keine Pausentoleranz mehr - die Uhr ist die
 * Summe der über `lib/braille/lesezeit.ts` (`uebezeitFuerEreignis`)
 * gerechneten Übezeit HEUTIGER Aufgaben, plus ein provisorischer Posten für
 * die gerade OFFENE Aufgabe (siehe `uebeUhr.ts` Dateikopf für die volle
 * Geschichte, inklusive der verworfenen Zwischenstufe vom selben Nachmittag).
 *   · `beginneAufgabe()` startet den provisorischen Posten - die Uhr tickt
 *     ab da mit der Wanduhr mit, DAMIT SIE NICHT NUR BEI JEDER ABGABE SPRINGT.
 *   · `verbucheUebezeit(ms)` verbucht die gerechnete Zeit einer fertigen
 *     Aufgabe endgültig und beendet den provisorischen Posten.
 *   · SEIT 22.09.2026 (Nacht, Deckel in `lesezeit.ts`): eine Abgabe kann sehr
 *     viel kleiner sein als der provisorische Posten - die Anzeige läuft dann
 *     NICHT zurück, sondern hält den bisherigen Höchststand des Tages, bis
 *     echte weitere Übezeit ihn wieder einholt.
 *   · Mitternacht setzt die Uhr (und den Höchststand) auf null.
 *   · `primeUebeUhr` hebt den Stand beim Laden nur AN, nie ab, und setzt bei
 *     Kontowechsel zurück.
 */
import { describe, it, expect, beforeEach } from "vitest";
import {
  beginneAufgabe,
  formatUebezeit,
  formatUebezeitAngesagt,
  heutigeUebezeitMs,
  primeUebeUhr,
  resetUebeUhr,
  uebezeitMs,
  verbucheUebezeit,
} from "../src/lib/braille/uebeUhr";
import { LESE_START_CPM } from "../src/lib/braille/lesezeit";
import type { TaskEvent } from "../src/lib/braille/account";

describe("formatUebezeit", () => {
  it("formatiert M:SS und ab einer Stunde H:MM:SS", () => {
    expect(formatUebezeit(0)).toBe("0:00");
    expect(formatUebezeit(9_000)).toBe("0:09");
    expect(formatUebezeit(65_000)).toBe("1:05");
    expect(formatUebezeit(3_661_000)).toBe("1:01:01");
  });
});

describe("formatUebezeitAngesagt", () => {
  it("nennt Sekunden/Minuten/Stunden in passendem Singular/Plural", () => {
    expect(formatUebezeitAngesagt(0)).toBe("0 Sekunden");
    expect(formatUebezeitAngesagt(1_000)).toBe("1 Sekunde");
    expect(formatUebezeitAngesagt(60_000)).toBe("1 Minute");
    expect(formatUebezeitAngesagt(200_000)).toBe("3 Minuten 20 Sekunden");
    expect(formatUebezeitAngesagt(3_900_000)).toBe("1 Stunde 5 Minuten");
  });
});

describe("Übezeit-Uhr - läuft während einer offenen Aufgabe mit, verbucht bei Abgabe die genaue Zeit", () => {
  beforeEach(() => resetUebeUhr());

  it("tickt mit der Wanduhr mit, solange eine Aufgabe offen ist", () => {
    beginneAufgabe(0);
    expect(uebezeitMs(0)).toBe(0);
    expect(uebezeitMs(1500)).toBe(1500);
    expect(uebezeitMs(4000)).toBe(4000);
  });

  /**
   * ★★★★★ SEIT 22.09.2026 (Nacht, Deckel in `lesezeit.ts`): eine Abgabe kann
   * SEHR VIEL kleiner sein als der provisorische Posten (Kind lässt sich
   * vorlesen, geht Minuten weg). Die Anzeige läuft darum NICHT mehr zurück -
   * sie hält den bisherigen Höchststand, bis echte weitere Übezeit ihn wieder
   * einholt (siehe `uebeUhr.ts` Dateikopf „Bei der Abgabe: nie zurücklaufen").
   */
  it("eine gedeckelte Abgabe senkt die Anzeige NICHT - sie hält den Höchststand", () => {
    beginneAufgabe(0);
    expect(uebezeitMs(9000)).toBe(9000); // provisorisch, während die Aufgabe offen ist
    verbucheUebezeit(1200, 9000); // die Aufgabe war tatsächlich nur 1,2 s wert (Deckel)
    expect(uebezeitMs(9000)).toBe(9000); // hält den Höchststand - läuft NICHT zurück
  });

  it("holt die echte Summe späterer Aufgaben den Höchststand ein, zeigt die Uhr wieder genau sie", () => {
    beginneAufgabe(0);
    expect(uebezeitMs(9000)).toBe(9000); // Höchststand: 9000
    verbucheUebezeit(1200, 9000); // echt: 1200 - Anzeige hält bei 9000
    beginneAufgabe(9000);
    verbucheUebezeit(10_000, 19_000); // echt: 1200 + 10_000 = 11_200 - über dem Höchststand
    expect(uebezeitMs(19_000)).toBe(11_200); // schwenkt auf die echte Zahl ein
  });

  it("bleibt zwischen zwei Aufgaben stehen - kein provisorischer Posten ohne beginneAufgabe()", () => {
    verbucheUebezeit(1000, 0);
    expect(uebezeitMs(500)).toBe(1000);
    expect(uebezeitMs(60_000)).toBe(1000); // keine Pausentoleranz mehr, aber auch kein Verlust
  });

  it("mehrere abgeschlossene Aufgaben summieren sich", () => {
    beginneAufgabe(0);
    verbucheUebezeit(1000, 1000);
    beginneAufgabe(1000);
    verbucheUebezeit(2000, 3500);
    expect(uebezeitMs(3500)).toBe(3000);
  });

  it("eine negative/kaputte verbuchte Zeit zählt als 0, nie NaN, nie negativ", () => {
    verbucheUebezeit(-500, 0);
    expect(uebezeitMs(0)).toBe(0);
    verbucheUebezeit(Number.NaN, 0);
    expect(uebezeitMs(0)).toBe(0);
  });

  it("stellt sich um 0:00 Uhr (Mitternacht) auf null", () => {
    const lateNight = new Date(2026, 0, 1, 23, 59, 50).getTime();
    verbucheUebezeit(4000, lateNight);
    expect(uebezeitMs(lateNight + 1)).toBe(4000);
    const nextDay = new Date(2026, 0, 2, 0, 0, 5).getTime();
    expect(uebezeitMs(nextDay)).toBe(0);
    beginneAufgabe(nextDay);
    expect(uebezeitMs(nextDay + 1000)).toBe(1000);
  });
});

describe("primeUebeUhr - Uhr beim Laden aufsetzen", () => {
  beforeEach(() => resetUebeUhr());

  it("setzt die Uhr nach einem Neuladen auf die gespeicherte Basiszeit", () => {
    primeUebeUhr("kind-1", 600_000, 1000);
    expect(uebezeitMs(1000)).toBe(600_000);
    beginneAufgabe(1000);
    verbucheUebezeit(2000, 3000);
    expect(uebezeitMs(3000)).toBe(602_000);
  });

  it("senkt die laufende Uhr nie ab", () => {
    verbucheUebezeit(50_000, 0);
    primeUebeUhr("kind-1", 3000, 0); // Speicherstand ist KLEINER als die Uhr
    expect(uebezeitMs(0)).toBe(50_000); // unverändert
  });

  it("setzt die Uhr bei Kontowechsel am selben Gerät zurück", () => {
    primeUebeUhr("kind-1", 300_000, 1000);
    expect(uebezeitMs(1000)).toBe(300_000);
    primeUebeUhr("kind-2", 60_000, 2000); // Geschwisterkind meldet sich an
    expect(uebezeitMs(2000)).toBe(60_000);
  });
});

describe("heutigeUebezeitMs - heute gerechnete Übezeit aus den Ereignissen", () => {
  const tag = (h: number, min = 0) => new Date(2026, 8, 22, h, min).getTime();
  const aufgabe = (ts: number, ms: number, extra?: Partial<TaskEvent>): TaskEvent => ({
    ts,
    level: "l1-reihe1",
    system: "basis",
    direction: "write",
    correct: true,
    ms,
    cells: 2,
    ...extra,
  });

  it("summiert nur die heutigen Aufgabenzeiten (dieselbe Rechnung wie minutenAus)", () => {
    const gestern = new Date(2026, 8, 21, 18).getTime();
    const events: TaskEvent[] = [
      aufgabe(gestern, 120_000),
      aufgabe(tag(8), 60_000),
      aufgabe(tag(9, 30), 30_000),
    ];
    expect(heutigeUebezeitMs(events, LESE_START_CPM, tag(11))).toBe(90_000);
  });

  it("ohne Ereignisse null, nicht undefiniert", () => {
    expect(heutigeUebezeitMs(undefined, LESE_START_CPM, tag(11))).toBe(0);
    expect(heutigeUebezeitMs([], LESE_START_CPM, tag(11))).toBe(0);
  });

  /**
   * ★★★★★ SEIT 22.09.2026 Abend: je Ereignis zählt `uebezeitFuerEreignis`
   * (`lesezeit.ts`) - vorgelesen (spokenMs gesetzt) bekommt die gerechnete
   * Lesezeit dazu, selbst gelesen (kein spokenMs) bleibt bei `ms`.
   */
  describe("vorgelesen vs. selbst gelesen - je Aufgabe genau eine Lesezeit", () => {
    it("vorgelesen: ms plus die aus dem Lesetempo gerechnete Lesezeit", () => {
      // 200 Zellen bei 200 Zellen/Minute (LESE_START_CPM) = 1 Minute Lesezeit.
      const events = [aufgabe(tag(9), 10_000, { cells: 200, spokenMs: 3000 })];
      expect(heutigeUebezeitMs(events, LESE_START_CPM, tag(11))).toBe(10_000 + 60_000);
    });

    it("selbst gelesen (kein spokenMs): zählt nur die ms-Zeit", () => {
      const events = [aufgabe(tag(9), 10_000)];
      expect(heutigeUebezeitMs(events, LESE_START_CPM, tag(11))).toBe(10_000);
    });

    it("gemischter Schwung: jedes Ereignis rechnet für sich", () => {
      const events = [
        aufgabe(tag(8), 60_000, { cells: 200, spokenMs: 3000 }), // + 60_000 Lesezeit
        aufgabe(tag(9), 30_000), // selbst gelesen, unverändert
      ];
      expect(heutigeUebezeitMs(events, LESE_START_CPM, tag(11))).toBe(
        60_000 + 60_000 + 30_000,
      );
    });
  });
});
