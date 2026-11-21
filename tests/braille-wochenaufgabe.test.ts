/**
 * Die Wochenaufgabe von Punktgenau - die Rechnung, nicht die Oberfläche.
 *
 * Auftrag Johannes 07.09.2026: *„Wochenaufgaben, wie in tastenflow“*.
 *
 * Geprüft werden die Zusagen, die man einem Kind gegenüber einhalten muss:
 *   · Ohne gesetzte Zahl gibt es KEINE Aufgabe (und damit auch keinen Vorwurf).
 *   · Die Wochengrenze ist fest Montag 08:00 (`WOCHENZIEL_GRENZE`) - dieselbe
 *     wie beim Wochenziel von Tastenflow (19.09.2026, „Punktgenau auch
 *     Mo-So: ja").
 *   · Nachzuholen entsteht nie in der laufenden Woche
 *     ([[feedback_nie_gegen_das_kind]]).
 *   · Etappen zählen nur, wenn ihr Meister-Zeitpunkt bekannt ist - lieber
 *     keine Zahl als eine erfundene ([[feedback_zusammenfassung_ist_kein_beleg]]).
 */
import { describe, expect, it } from "vitest";
import {
  hatWochenaufgabe,
  leereWochenaufgabe,
  minutenAus,
  wochenaufgabeAusJson,
  wochenaufgabeSatz,
  wochengrenzen,
  wochenstand,
  wochenstandSatz,
  type Wochenaufgabe,
} from "../src/lib/braille/wochenaufgabe";
import { emptyProgress, type BrailleProgress } from "../src/lib/braille/progress";
import type { TaskEvent } from "../src/lib/braille/account";
import { LESE_START_CPM } from "../src/lib/braille/lesezeit";

const TAG = 86_400_000;

/** Eine Aufgabe zu einem Zeitpunkt, mit einer Dauer in Minuten. */
function aufgabe(ts: number, minuten = 1, correct = true): TaskEvent {
  return {
    ts,
    level: "l1-reihe1",
    system: "basis",
    direction: "write",
    correct,
    ms: minuten * 60_000,
    cells: 3,
  };
}

/** Mittwoch, 02.09.2026, 10:00 Ortszeit - mitten in einer Woche. */
const MITTWOCH = new Date(2026, 8, 2, 10, 0, 0, 0).getTime();

describe("Wochenaufgabe - wann überhaupt eine gestellt ist", () => {
  it("drei Nullen sind KEINE Aufgabe", () => {
    expect(hatWochenaufgabe(leereWochenaufgabe())).toBe(false);
    expect(hatWochenaufgabe(undefined)).toBe(false);
    expect(hatWochenaufgabe(null)).toBe(false);
  });

  it("eine einzige Zahl genügt - die anderen bleiben abgeschaltet", () => {
    expect(hatWochenaufgabe({ minuten: 0, aufgaben: 0, etappen: 3 })).toBe(true);
    expect(wochenaufgabeSatz({ minuten: 0, aufgaben: 0, etappen: 3 })).toBe(
      "Diese Woche: 3 Etappen schaffen.",
    );
    expect(wochenaufgabeSatz({ minuten: 0, aufgaben: 1, etappen: 0 })).toBe(
      "Diese Woche: 1 Aufgabe.",
    );
    expect(wochenaufgabeSatz({ minuten: 20, aufgaben: 30, etappen: 2 })).toBe(
      "Diese Woche: 20 Minuten üben, 30 Aufgaben und 2 Etappen schaffen.",
    );
  });

  it("liest fremdes JSON defensiv - Unsinn wird zu 0, nicht zu einer Aufgabe", () => {
    const w = wochenaufgabeAusJson({
      minuten: "zwanzig",
      aufgaben: -5,
      etappen: 999_999,
      wochen: ["2026-W37", 42],
      nachholen: "ja",
    });
    expect(w).toEqual({ minuten: 0, aufgaben: 0, etappen: 60, wochen: ["2026-W37"] });
    expect(wochenaufgabeAusJson(null)).toBeUndefined();
    expect(wochenaufgabeAusJson("kaputt")).toBeUndefined();
  });
});

describe("Wochengrenze - fest Montag 08:00, wie bei Tastenflow (WOCHENZIEL_GRENZE)", () => {
  it("die Woche beginnt am Montag um 08:00, nicht um Mitternacht", () => {
    const g = wochengrenzen(MITTWOCH);
    const start = new Date(g.vonMs);
    expect(start.getDay()).toBe(1); // Montag
    expect(start.getHours()).toBe(8);
    expect(start.getMinutes()).toBe(0);
    expect(g.bisMs - g.vonMs).toBe(7 * TAG - 1);
  });

  it("★★★ kein Unterrichtstag mehr einstellbar - die Grenze ist überall dieselbe", () => {
    // Bis zum 18.09.2026 liess sich die Wochengrenze im Reiter „Tastenflow“
    // verschieben („Unterricht am Donnerstag“). Johannes hat das abgeschafft
    // - Punktgenau nimmt seither IMMER `WOCHENZIEL_GRENZE`, unabhängig von den
    // Klassen-Einstellungen (die Funktion nimmt gar keinen Rhythmus mehr
    // entgegen).
    const montag1 = wochengrenzen(MITTWOCH);
    const montag2 = wochengrenzen(MITTWOCH + TAG); // Donnerstag derselben Woche
    expect(montag1.vonMs).toBe(montag2.vonMs);
  });

  it("wochenVersatz blättert in ganzen Wochen", () => {
    const jetzt = wochengrenzen(MITTWOCH);
    const vorher = wochengrenzen(MITTWOCH, -1);
    expect(jetzt.vonMs - vorher.vonMs).toBe(7 * TAG);
  });
});

describe("Wochenstand - was ein Kind geschafft hat", () => {
  const ziel: Wochenaufgabe = { minuten: 20, aufgaben: 10, etappen: 1 };

  it("zählt nur, was in DIESER Woche liegt", () => {
    const ev = [
      aufgabe(MITTWOCH - 60_000, 2), // diese Woche
      aufgabe(MITTWOCH - 2 * 60_000, 3), // diese Woche
      aufgabe(MITTWOCH - 20 * TAG, 30), // längst vorbei
    ];
    const s = wochenstand(ziel, ev, emptyProgress(), MITTWOCH);
    expect(s.aktiv).toBe(true);
    expect(s.aufgabenGeschafft).toBe(2);
    expect(Math.round(s.minutenGeschafft)).toBe(5);
    expect(s.erfuellt).toBe(false);
  });

  it("★★★ Etappen zählen über ihren Meister-Zeitpunkt", () => {
    const p: BrailleProgress = {
      ...emptyProgress(),
      gemeistertAm: {
        "l1-reihe1": MITTWOCH - 2 * TAG, // diese Woche
        "l1-reihe2": MITTWOCH - 30 * TAG, // im Vormonat
      },
    };
    const s = wochenstand(ziel, [], p, MITTWOCH);
    expect(s.etappenGeschafft).toBe(1);
  });

  it("★★★ ein Altstand ohne Meister-Zeitpunkte zählt für keine Woche", () => {
    // Lieber keine Zahl als eine erfundene: Wer vor dem 07.09.2026 geübt hat,
    // bekommt seine alten Etappen NICHT rückwirkend in diese Woche gebucht.
    const p: BrailleProgress = {
      ...emptyProgress(),
      levels: { "l1-reihe1": { completed: true, bestStars: 3, attempts: 9 } },
      gemeistertAm: undefined,
    };
    expect(wochenstand(ziel, [], p, MITTWOCH).etappenGeschafft).toBe(0);
  });

  it("erfüllt ist erst, wenn ALLE gesetzten Zahlen erreicht sind", () => {
    const p: BrailleProgress = {
      ...emptyProgress(),
      gemeistertAm: { "l1-reihe1": MITTWOCH - TAG },
    };
    const ev = Array.from({ length: 10 }, (_, i) =>
      aufgabe(MITTWOCH - (i + 1) * 60_000, 2),
    );
    const s = wochenstand(ziel, ev, p, MITTWOCH);
    expect(s.aufgabenGeschafft).toBe(10);
    expect(Math.round(s.minutenGeschafft)).toBe(20);
    expect(s.etappenGeschafft).toBe(1);
    expect(s.erfuellt).toBe(true);
    expect(wochenstandSatz(s)).toMatch(/^Wochenaufgabe geschafft/);
  });

  it("ohne Aufgabe ist der Stand still - kein Soll, kein Vorwurf", () => {
    const s = wochenstand(leereWochenaufgabe(), [aufgabe(MITTWOCH - 1000)], emptyProgress(), MITTWOCH);
    expect(s.aktiv).toBe(false);
    expect(s.erfuellt).toBe(false);
    expect(wochenstandSatz(s)).toBe("Diese Woche steht keine Wochenaufgabe an.");
  });

  it("außerhalb der Ziel-Kalenderwochen gilt sie nicht", () => {
    const nurEineWoche: Wochenaufgabe = { ...ziel, wochen: ["2020-W01"] };
    expect(
      wochenstand(nurEineWoche, [], emptyProgress(), MITTWOCH).aktiv,
    ).toBe(false);
  });
});

describe("Nachholen - nie zum Nachteil", () => {
  const ziel: Wochenaufgabe = {
    minuten: 0,
    aufgaben: 10,
    etappen: 0,
    nachholen: true,
  };

  it("★★★★ die LAUFENDE Woche erzeugt keinen Rückstand", () => {
    // Sonst stünde ein Kind am Montagmorgen schon im Minus - für etwas, das
    // es noch gar nicht versäumt haben kann.
    const s = wochenstand(ziel, [], emptyProgress(), MITTWOCH);
    // Zwei vergangene Wochen ohne Übung ergeben 20 offene Aufgaben; die
    // laufende ist NICHT darunter (sonst wären es 30).
    expect(s.offenAufgaben % 10).toBe(0);
    expect(s.sollAufgaben).toBe(10 + s.offenAufgaben);
  });

  it("eine vollständig geübte Vorwoche hinterlässt nichts Offenes", () => {
    // Genau eine Zielwoche (die vorige) - dort wurde das Soll erfüllt.
    const vorigeWoche = wochengrenzen(MITTWOCH, -1);
    const nurVorwoche: Wochenaufgabe = {
      ...ziel,
      wochen: [
        // Ziel-KW der Vorwoche UND der laufenden Woche.
        isoWocheVon(vorigeWoche.vonMs),
        isoWocheVon(MITTWOCH),
      ],
    };
    const ev = Array.from({ length: 10 }, (_, i) =>
      aufgabe(vorigeWoche.vonMs + (i + 1) * 60_000),
    );
    const s = wochenstand(nurVorwoche, ev, emptyProgress(), MITTWOCH);
    expect(s.offenAufgaben).toBe(0);
    expect(s.sollAufgaben).toBe(10);
  });
});

describe("Übezeit", () => {
  it("ist die Summe der Aufgabenzeiten, nicht der Abstand zwischen ihnen", () => {
    // Zwei Aufgaben zu je einer Minute, eine Stunde auseinander: 2 Minuten.
    const ev = [aufgabe(MITTWOCH - 3_600_000, 1), aufgabe(MITTWOCH, 1)];
    expect(minutenAus(ev)).toBeCloseTo(2, 5);
  });

  it("negative oder fehlende Zeiten zählen als null", () => {
    const kaputt = { ...aufgabe(MITTWOCH), ms: -5000 };
    expect(minutenAus([kaputt])).toBe(0);
  });

  /**
   * ★★★★★ SEIT 22.09.2026 ABEND („nur eine Zahl aber vorlesen muss raus" -
   * Johannes' Entscheidung, siehe Dateikopf „AB WANN WELCHE RECHNUNG GALT"):
   * keine Pause zählt mehr mit, aber eine VORGELESENE Aufgabe (`spokenMs`
   * gesetzt) bekommt ihre aus dem Lesetempo GERECHNETE Lesezeit zur
   * Bearbeitungszeit dazu - eine SELBST gelesene Aufgabe (kein `spokenMs`)
   * bleibt unverändert bei `ms`, weil die echte Tastzeit dort schon
   * mitzählt (siehe `lib/braille/lesezeit.ts`).
   */
  describe("vorgelesen vs. selbst gelesen (22.09.2026 Abend) - je Aufgabe genau eine Lesezeit", () => {
    it("selbst gelesen (kein spokenMs): zählt nur die ms-Zeit, unabhängig vom Lesetempo", () => {
      const ev = aufgabe(MITTWOCH, 2); // 2 Minuten, kein spokenMs
      expect(minutenAus([ev], LESE_START_CPM)).toBeCloseTo(2, 5);
      expect(minutenAus([ev], LESE_START_CPM * 4)).toBeCloseTo(2, 5); // Tempo ändert nichts
    });

    it("vorgelesen (spokenMs gesetzt): die gerechnete Lesezeit kommt zur ms-Zeit dazu", () => {
      // 1 Minute Bearbeitung, 200 Zellen bei 200 Zellen/Minute (LESE_START_CPM)
      // Lesezeit = genau 1 Minute dazu → 2 Minuten insgesamt.
      const ev: TaskEvent = { ...aufgabe(MITTWOCH, 1), cells: 200, spokenMs: 3000 };
      expect(minutenAus([ev], LESE_START_CPM)).toBeCloseTo(2, 5);
    });

    it("ein schnelleres gelerntes Lesetempo senkt nur die gerechnete Lesezeit vorgelesener Aufgaben", () => {
      const vorgelesen: TaskEvent = { ...aufgabe(MITTWOCH, 1), cells: 200, spokenMs: 3000 };
      const langsam = minutenAus([vorgelesen], 100); // 200 Zellen / 100 cpm = 2 min Lesezeit
      const schnell = minutenAus([vorgelesen], 400); // 200 Zellen / 400 cpm = 0,5 min Lesezeit
      expect(langsam).toBeGreaterThan(schnell);
    });

    it("ein Sprung ist erwartet: dieselbe Aufgabe zählt vorgelesen mehr als selbst gelesen", () => {
      const selbstGelesen = aufgabe(MITTWOCH, 2);
      const vorgelesen: TaskEvent = { ...selbstGelesen, cells: 200, spokenMs: 3000 };
      expect(minutenAus([vorgelesen], LESE_START_CPM)).toBeGreaterThan(
        minutenAus([selbstGelesen], LESE_START_CPM),
      );
    });
  });
});

/** ISO-Wochenschlüssel - dieselbe Rechnung wie im Auswahlfeld der Lehrkraft. */
function isoWocheVon(ts: number): string {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  const nr =
    1 +
    Math.round(
      ((d.getTime() - week1.getTime()) / 86_400_000 - 3 + ((week1.getDay() + 6) % 7)) / 7,
    );
  return `${d.getFullYear()}-W${String(nr).padStart(2, "0")}`;
}
