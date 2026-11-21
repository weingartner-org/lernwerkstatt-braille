/**
 * ★★★ „EINE STUNDE SPERREN" IN PUNKTGENAU - DIE REINE LOGIK, NICHT DIE OBERFLÄCHE.
 *
 * Auftrag Johannes (Sept. 2026): Die Lehrkraft drückt einen Knopf, und die
 * nächste Unterrichtsstunde zählt nicht auf die Wochenaufgabe des Kindes.
 * Die gesperrte Zeit zählt überall SONST weiter - Übezeit-Uhr, Statistik,
 * Abzeichen. Nur die Wochenaufgabe klammert sie aus.
 *
 * ★★★ DIE ENTSCHEIDUNG, DIE SCHON GEFALLEN IST: Punktgenau benutzt DASSELBE
 * Feld wie Tastenflow (`tt_classes.gesperrteZeiten`) - siehe `sperre.ts`
 * Dateikopf. Dieser Wächter prüft darum:
 *  1. `laufendeSperre` - dieselbe Fundstelle wie im Reiter „Tastenflow".
 *  2. Die Texte am Knopf nennen IMMER BEIDE Programme.
 *  3. `wochenstand`/`etappenZwischen` (`wochenaufgabe.ts`) lassen gesperrte
 *     Ereignisse für alle drei Ziele (Minuten/Aufgaben/Etappen) heraus - und
 *     zwar RÜCKWIRKEND.
 */
import { describe, expect, it } from "vitest";
import {
  gesperrtBisKnopf,
  laufendeSperre,
  SPERRE_AUFGEHOBEN_STATUS,
  SPERRE_BEENDEN_TIPP,
  SPERREN_TIPP,
  stundeGesperrtStatus,
  uhrzeitAusMs,
  type GesperrteZeit,
} from "../src/lib/braille/sperre";
import {
  etappenZwischen,
  leereWochenaufgabe,
  wochengrenzen,
  wochenstand,
  type Wochenaufgabe,
} from "../src/lib/braille/wochenaufgabe";
import { emptyProgress, type BrailleProgress } from "../src/lib/braille/progress";
import type { TaskEvent } from "../src/lib/braille/account";

/** Mittwoch, 02.09.2026, 10:00 Ortszeit - mitten in einer Woche. */
const MITTWOCH = new Date(2026, 8, 2, 10, 0, 0, 0).getTime();

/** Eine Aufgabe zu einem Zeitpunkt, mit einer Dauer in Minuten. */
function aufgabe(ts: number, minuten = 1): TaskEvent {
  return {
    ts,
    level: "l1-reihe1",
    system: "basis",
    direction: "write",
    correct: true,
    ms: minuten * 60_000,
    cells: 3,
  };
}

describe("laufendeSperre - läuft GERADE eine Sperre?", () => {
  it("findet die laufende Sperre (abMs inklusive, bisMs exklusiv)", () => {
    const zeiten: GesperrteZeit[] = [{ abMs: MITTWOCH - 1000, bisMs: MITTWOCH + 1000 }];
    expect(laufendeSperre(zeiten, MITTWOCH)).toEqual(zeiten[0]);
    expect(laufendeSperre(zeiten, MITTWOCH + 1000)).toBeNull(); // bisMs exklusiv
    expect(laufendeSperre(zeiten, MITTWOCH - 1000)).toEqual(zeiten[0]); // abMs inklusiv
  });

  it("ohne passenden Zeitraum: null - auch bei leerer Liste", () => {
    expect(laufendeSperre([], MITTWOCH)).toBeNull();
    expect(
      laufendeSperre([{ abMs: MITTWOCH - 10_000, bisMs: MITTWOCH - 5000 }], MITTWOCH),
    ).toBeNull();
  });
});

describe("Die Texte am Knopf nennen IMMER beide Programme", () => {
  it("★★★ Sperr-Tipp, Beenden-Tipp und Status - nie nur Punktgenau allein", () => {
    for (const text of [SPERREN_TIPP, SPERRE_BEENDEN_TIPP, SPERRE_AUFGEHOBEN_STATUS]) {
      expect(text).toMatch(/Tastenflow/);
      expect(text).toMatch(/Punktgenau/);
    }
    expect(stundeGesperrtStatus(MITTWOCH)).toMatch(/Tastenflow/);
    expect(stundeGesperrtStatus(MITTWOCH)).toMatch(/Punktgenau/);
  });

  it("spricht über die Unterrichtsstunde, nie über ein Kind", () => {
    // [[feedback_nie_gegen_das_kind]]: kein Wort wie "Kind"/"Schüler" im Text.
    for (const text of [SPERREN_TIPP, SPERRE_BEENDEN_TIPP]) {
      expect(text).not.toMatch(/Kind|Schüler/);
    }
  });

  it("gesperrtBisKnopf zeigt die Uhrzeit, nur mit Bindestrich", () => {
    const bisMs = new Date(2026, 8, 2, 14, 5, 0).getTime();
    expect(gesperrtBisKnopf(bisMs)).toBe(`Gesperrt bis ${uhrzeitAusMs(bisMs)} - aufheben`);
    for (const text of [SPERREN_TIPP, SPERRE_BEENDEN_TIPP, gesperrtBisKnopf(bisMs)]) {
      // Als Kürzel, damit die Datei die verbotenen Zeichen nicht selbst
      // enthält - sonst fällt sie über ihre eigene Regel.
      expect(text).not.toMatch(/[\u2013\u2014]/);
    }
  });
});

describe("Wochenaufgabe - gesperrte Zeit fällt vor der Rechnung heraus", () => {
  const ziel: Wochenaufgabe = { minuten: 20, aufgaben: 10, etappen: 1 };

  it("★★★ Minuten UND Aufgaben aus einer gesperrten Stunde zählen nicht", () => {
    const gesperrt: GesperrteZeit[] = [
      { abMs: MITTWOCH - 30 * 60_000, bisMs: MITTWOCH - 10 * 60_000 },
    ];
    const ev = [
      aufgabe(MITTWOCH - 20 * 60_000, 5), // WÄHREND der Sperre
      aufgabe(MITTWOCH - 5 * 60_000, 3), // danach, zählt normal
    ];
    const ohneSperre = wochenstand(ziel, ev, emptyProgress(), MITTWOCH);
    const mitSperre = wochenstand(ziel, ev, emptyProgress(), MITTWOCH, 0, gesperrt);
    expect(ohneSperre.aufgabenGeschafft).toBe(2);
    expect(Math.round(ohneSperre.minutenGeschafft)).toBe(8);
    expect(mitSperre.aufgabenGeschafft).toBe(1);
    expect(Math.round(mitSperre.minutenGeschafft)).toBe(3);
  });

  it("★★★ eine WÄHREND der Sperre gemeisterte Etappe zählt nicht fürs Ziel", () => {
    const gesperrt: GesperrteZeit[] = [
      { abMs: MITTWOCH - 30 * 60_000, bisMs: MITTWOCH - 10 * 60_000 },
    ];
    const p: BrailleProgress = {
      ...emptyProgress(),
      gemeistertAm: { "l1-reihe1": MITTWOCH - 20 * 60_000 }, // WÄHREND der Sperre
    };
    expect(etappenZwischen(p, null, gesperrt)).toEqual([]);
    expect(etappenZwischen(p, null)).toEqual(["l1-reihe1"]); // ohne Sperre: zählt
    const s = wochenstand(ziel, [], p, MITTWOCH, 0, gesperrt);
    expect(s.etappenGeschafft).toBe(0);
  });

  it("wirkt RÜCKWIRKEND - auch für Ereignisse, die VOR dem Setzen der Sperre geschrieben wurden", () => {
    // Die Sperre wird "jetzt" gesetzt, das Ereignis liegt VOR diesem
    // Zeitpunkt, aber INNERHALB des gesperrten Zeitraums.
    const gesperrtAbMs = MITTWOCH - 40 * 60_000;
    const gesperrtBisMs = MITTWOCH - 10 * 60_000; // "jetzt" der Sperrung, in der Vergangenheit
    const ev = [aufgabe(MITTWOCH - 35 * 60_000, 10)]; // schon geschrieben, bevor gesperrt wurde
    const gesperrt: GesperrteZeit[] = [{ abMs: gesperrtAbMs, bisMs: gesperrtBisMs }];
    const s = wochenstand(ziel, ev, emptyProgress(), MITTWOCH, 0, gesperrt);
    expect(s.aufgabenGeschafft).toBe(0);
    expect(s.minutenGeschafft).toBe(0);
  });

  it("übersteht ein Aufheben der Sperre - die Vergangenheit bleibt gesperrt", () => {
    // `sperreAufheben` (lib/typing/account.ts) setzt nur `bisMs` auf "jetzt"
    // zurück; der Zeitraum bis dahin bleibt stehen. Hier dieselbe Form
    // nachgebaut: ein Zeitraum, der schon vorzeitig beendet wurde.
    const gesperrt: GesperrteZeit[] = [
      { abMs: MITTWOCH - 30 * 60_000, bisMs: MITTWOCH - 20 * 60_000 },
    ];
    const ev = [aufgabe(MITTWOCH - 25 * 60_000, 7)]; // liegt IM (verkürzten) Zeitraum
    const s = wochenstand(ziel, ev, emptyProgress(), MITTWOCH, 0, gesperrt);
    expect(s.aufgabenGeschafft).toBe(0);
  });

  it("minutenAus() selbst ändert seine Bedeutung nicht - ungefiltert zählt es wie vorher", () => {
    const gesperrt: GesperrteZeit[] = [{ abMs: MITTWOCH - 100_000, bisMs: MITTWOCH }];
    const ev = [aufgabe(MITTWOCH - 50_000, 4)];
    // Ohne `gesperrt` an `wochenstand` übergeben zu bekommen, ändert sich für
    // bestehende Aufrufer (Standardwert `[]`) nichts.
    const s = wochenstand(ziel, ev, emptyProgress(), MITTWOCH);
    expect(Math.round(s.minutenGeschafft)).toBe(4);
    // Und dasselbe Ereignis fällt heraus, sobald derselbe Zeitraum als
    // `gesperrt` übergeben wird - der Unterschied liegt an der gefilterten
    // Liste, nicht an `minutenAus`.
    const gesperrterStand = wochenstand(ziel, ev, emptyProgress(), MITTWOCH, 0, gesperrt);
    expect(gesperrterStand.minutenGeschafft).toBe(0);
  });

  it("Nachholen (Rückstand) zählt eine gesperrte Vorwoche ebenfalls nicht mit", () => {
    // ★ Nur die Vorwoche UND die laufende Woche sind Ziel-Kalenderwochen
    // (`wochen`) - sonst wäre jede der übrigen zehn geprüften Vergangenheits-
    // wochen (`RUECKSTAND_WOCHEN`) ebenfalls ungeübt und läge mit im
    // Rückstand (dieselbe Falle wie in `tests/braille-wochenaufgabe.test.ts`,
    // „eine vollständig geübte Vorwoche hinterlässt nichts Offenes").
    const vorigeGrenzen = wochengrenzen(MITTWOCH, -1);
    const nachholZiel: Wochenaufgabe = {
      minuten: 0,
      aufgaben: 10,
      etappen: 0,
      nachholen: true,
      wochen: [isoWocheVon(vorigeGrenzen.vonMs), isoWocheVon(MITTWOCH)],
    };
    const gesperrt: GesperrteZeit[] = [
      { abMs: vorigeGrenzen.vonMs - 30 * 60_000, bisMs: vorigeGrenzen.vonMs + 30 * 60_000 },
    ];
    // Zehn Aufgaben in der Vorwoche, alle WÄHREND der Sperre - ohne Sperre
    // wäre die Vorwoche voll erfüllt (kein Rückstand), mit Sperre bleibt sie
    // offen wie eine ungeübte Woche.
    const ev = Array.from({ length: 10 }, (_, i) =>
      aufgabe(vorigeGrenzen.vonMs + i * 60_000),
    );
    const ohneSperre = wochenstand(nachholZiel, ev, emptyProgress(), MITTWOCH);
    const mitSperre = wochenstand(nachholZiel, ev, emptyProgress(), MITTWOCH, 0, gesperrt);
    expect(ohneSperre.offenAufgaben).toBe(0);
    expect(mitSperre.offenAufgaben).toBe(10);
  });

  it("kein Ziel gesetzt: `wochenstand` bleibt still, mit oder ohne Sperre", () => {
    const gesperrt: GesperrteZeit[] = [{ abMs: MITTWOCH - 1000, bisMs: MITTWOCH + 1000 }];
    const s = wochenstand(leereWochenaufgabe(), [aufgabe(MITTWOCH)], emptyProgress(), MITTWOCH, 0, gesperrt);
    expect(s.aktiv).toBe(false);
  });
});

/** ISO-Wochenschlüssel - dieselbe Rechnung wie im Auswahlfeld der Lehrkraft
 *  (Vorbild: `tests/braille-wochenaufgabe.test.ts`). */
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
