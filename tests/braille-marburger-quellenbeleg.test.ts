/**
 * WÄCHTER für die Marburger Mathematikschrift (Zahlenbrüche, b13c) -
 * Zubau 22.09.2026 (Johannes, siehe
 * `Claude/Projects/Lernplattform/Programme/PLUS/Marburger Mathematikschrift
 * - Spezifikation.md`).
 *
 * ★★★ Ersatz für die liblouis-Gegenprobe, die es hier NICHT geben kann
 * (liblouis führt die Marburger Tabelle nicht mehr im Browser-Paket - siehe
 * Kopf von `marburgerMathe.ts`): JEDE Zelle im Quelltext trägt ihren
 * Quellenverweis als Kommentar. Dieser Wächter prüft das STRUKTURELL (liest
 * den Quelltext, nicht nur das Ergebnis) - eine Zelle ohne "Z."-Beleg fällt
 * auf, auch wenn sie zufällig den richtigen Punktwert hat.
 *
 * Zusätzlich: die tatsächlich erzeugten Zellen für alle sechs b13c-Items
 * gegen die in der Spezifikation belegten Beispiele (Kap. 9.1), die
 * Trennung von der Textschrift-Engine (`textToCells` bleibt unverändert),
 * und die strukturelle Begründung für den 7/10-Fallstrick (F5): Standard-
 * und gesenkte Ziffern-Punktbilder sind disjunkt, „7,0…" kann also nicht
 * entstehen, obwohl ⠂ dieselbe Zelle wie das Dezimalkomma ist.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { parseDots, cellsEqual, type Cell } from "../src/lib/braille/cell";
import { DIGIT_CELLS, NUMSIGN } from "../src/lib/braille/tables";
import { textToCells } from "../src/lib/braille/engine";
import {
  GESENKT_DIGIT_CELLS,
  GESENKT_DIGIT_DOTS,
  istZahlenbruch,
  textToCellsMathe,
  zahlenbruchZellen,
} from "../src/lib/braille/marburgerMathe";
import { ETAPPEN } from "../src/lib/braille/etappen";

const lies = (pfad: string): string => readFileSync(resolve(process.cwd(), pfad), "utf8");

const B13C_ITEMS = ["1/2", "3/4", "1/4", "2/3", "5/8", "7/10"];

describe("Quellenbeleg: jede gesenkte Ziffer trägt ihren Verweis", () => {
  const quelltext = lies("src/lib/braille/marburgerMathe.ts");

  it("die Datei erklärt ausdrücklich, warum es KEINE liblouis-Gegenprobe gibt", () => {
    expect(quelltext).toMatch(/KEINE LIBLOUIS-GEGENPROBE/);
    expect(quelltext).toMatch(/liblouisutdml/);
  });

  it("jede der zehn Ziffern-Zeilen im GESENKT_DIGIT_DOTS-Array nennt die Ziffer und eine Zeilennummer (Z. …)", () => {
    const block = quelltext.match(
      /GESENKT_DIGIT_DOTS: readonly string\[\] = \[([\s\S]*?)\n\];/,
    );
    expect(block, "GESENKT_DIGIT_DOTS-Array nicht gefunden").not.toBeNull();
    // Nur die zehn Datenzeilen (beginnen mit einem gequoteten Ziffernstring),
    // nicht die mehrzeiligen Fortsetzungskommentare darunter.
    const datenzeilen = block![1]
      .split("\n")
      .filter((z) => /^\s*"[0-9]+",/.test(z));
    expect(datenzeilen).toHaveLength(10);
    for (const zeile of datenzeilen) {
      expect(zeile, zeile).toMatch(/Ziffer \d/);
      expect(zeile, zeile).toMatch(/Z\. \d/);
    }
  });

  it("GESENKT_DIGIT_DOTS hat genau zehn Einträge, Reihenfolge Ziffer 0…9", () => {
    expect(GESENKT_DIGIT_DOTS).toHaveLength(10);
    expect(GESENKT_DIGIT_CELLS).toHaveLength(10);
  });
});

describe("Gesenkte Ziffern: Punktbilder gegen die Spezifikation (Kap. 2.1.2)", () => {
  it("stimmen mit der Tabelle „Die gesenkte Schreibweise“ (Kap. 2.1.2) überein", () => {
    const erwartet = ["356", "2", "23", "25", "256", "26", "235", "2356", "236", "35"];
    expect(GESENKT_DIGIT_DOTS).toEqual(erwartet);
  });

  it("★ F5/F11: Standard- und gesenkte Punktbilder sind PAARWEISE disjunkt (kein Digit teilt sich ein Bild)", () => {
    // Das ist die strukturelle Begründung, warum "⠂" nach dem Zahlzeichen im
    // Bruch-Nenner nicht wirklich mit einer STANDARD-Ziffer verwechselt
    // werden kann, obwohl ⠂ dieselbe Zelle wie das Dezimalkomma ist (siehe
    // 7/10-Test unten und die Warnung in marburgerMathe.ts).
    const standard = new Set(DIGIT_CELLS);
    for (const g of GESENKT_DIGIT_CELLS) {
      expect(standard.has(g), `gesenkte Zelle ${g} kollidiert mit einer Standardziffer`).toBe(
        false,
      );
    }
  });
});

describe("Zahlenbrüche: erzeugte Zellen gegen die Spezifikation (Kap. 9.1)", () => {
  const zellen = (dotsList: string[]): Cell[] => dotsList.map((d) => parseDots(d));

  it.each([
    ["1/2", ["3456", "1", "23"]], // ⠼⠁⠆ - Beispiel 9.1 B01, Z. 3927
    ["3/4", ["3456", "14", "256"]], // ⠼⠉⠲ - Teil von Beispiel 9.1 B03, Z. 3946
    ["1/4", ["3456", "1", "256"]],
    ["2/3", ["3456", "12", "25"]],
    ["5/8", ["3456", "15", "236"]],
    ["7/10", ["3456", "1245", "2", "356"]], // ⠼⠛⠂⠴ - siehe F5-Warnung
  ])("%s → korrekte Marburger-Zellen (Zähler Standard, Nenner gesenkt)", (item, dots) => {
    const soll = zellen(dots);
    const ist = zahlenbruchZellen(item);
    expect(ist, item).not.toBeNull();
    expect(cellsEqual(ist!, soll), `${item}: ${ist} != ${soll}`).toBe(true);
  });

  it("alle sechs b13c-Items sind Zahlenbrüche (Zähler/Nenner beide positive Ganzzahlen)", () => {
    for (const item of B13C_ITEMS) expect(istZahlenbruch(item), item).toBe(true);
  });

  it("KEIN Schrägstrich/Divisionszeichen (⠲) in den erzeugten Zellen - genau ein Zahlzeichen, dann Zähler- und Nennerziffern", () => {
    for (const item of B13C_ITEMS) {
      const cells = zahlenbruchZellen(item)!;
      const [zaehler, nenner] = item.split("/");
      expect(cells).toHaveLength(1 + zaehler.length + nenner.length);
      expect(cells[0]).toBe(NUMSIGN);
    }
  });

  it("7/10: strukturell eindeutig trotz ⠂ = Dezimalkomma-Zelle (F5) - ⠴ (gesenkt-0) ist KEINE gültige Standardziffer", () => {
    const gesenkt0 = parseDots(GESENKT_DIGIT_DOTS[0]); // "356"
    expect(DIGIT_CELLS.includes(gesenkt0)).toBe(false);
    // Die Standard-0 ist ⠚ (Punkte 2-4-5), NICHT ⠴ (Punkte 3-5-6) - ein
    // Leser, der nach dem vermeintlichen Komma eine Standard-0 erwartet,
    // kann sie an dieser Zelle nicht finden.
    expect(DIGIT_CELLS[0]).not.toEqual(gesenkt0);
  });
});

describe("Additiv: die Textschrift-Engine (`textToCells`) bleibt UNVERÄNDERT", () => {
  it("textToCells(\"1/2\") liefert weiterhin die alte, mechanische (falsche) Übersetzung - dieses Modul ändert engine.ts NICHT", () => {
    // Das ist der gemessene Fehler von vorher: "/" über die Zeichentabelle
    // (Punkte 2-5-6 = die abgeschaffte Divisionszeichen-Zelle / gesenkte 4)
    // und für den Nenner ein ZWEITES Zahlzeichen statt gesenkter Ziffern.
    const alt = textToCells("1/2", { system: "basis" });
    const neu = textToCellsMathe("1/2", { system: "basis" });
    expect(cellsEqual(alt, neu)).toBe(false);
    expect(cellsEqual(alt, [NUMSIGN, DIGIT_CELLS[1], parseDots("256"), NUMSIGN, DIGIT_CELLS[2]])).toBe(
      true,
    );
  });

  it("textToCellsMathe fällt für Computerbraille auf textToCells zurück (Marburger ist 6-Punkt)", () => {
    const comp = textToCellsMathe("1/2", { system: "computer" });
    expect(cellsEqual(comp, textToCells("1/2", { system: "computer" }))).toBe(true);
  });

  it("textToCellsMathe fällt für alles, was KEIN Zahlenbruch ist, unverändert auf textToCells zurück", () => {
    for (const text of ["Haus", "12", "a/b", "4/2=2", "1.1.2026"]) {
      expect(
        cellsEqual(
          textToCellsMathe(text, { system: "basis" }),
          textToCells(text, { system: "basis" }),
        ),
        text,
      ).toBe(true);
    }
  });
});

describe("Verdrahtung: b13c benutzt die Marburger-Form, nicht die Textschrift-Engine", () => {
  it("BrailleTrainer.tsx ruft an den Stellen, die einen Prompt in Zellen verwandeln, textToCellsMathe auf", () => {
    const quelltext = lies("src/components/braille/BrailleTrainer.tsx");
    expect(quelltext).toMatch(/textToCellsMathe\(t, \{ system, grossschreibzeichen \}\)/);
    expect(quelltext).toMatch(
      /solve \? null : textToCellsMathe\(prompt, \{ system, grossschreibzeichen \}\)/,
    );
  });

  it("die Etappe b13c hat die sechs erwarteten Items und einen Legenden-Beispielbruch statt eines bloßen Schrägstrichs", () => {
    const b13c = ETAPPEN.find((e) => e.id === "b13c");
    expect(b13c).toBeDefined();
    expect(b13c!.items([])).toEqual(B13C_ITEMS);
    expect(b13c!.legend).not.toBe("/");
    for (const token of (b13c!.legend ?? "").split(/\s+/).filter(Boolean)) {
      expect(istZahlenbruch(token), token).toBe(true);
    }
  });

  it("der Erklärtext behauptet nicht mehr, Brüche würden MIT einem Schrägstrich geschrieben", () => {
    // "Schrägstrich" darf als Kontrast vorkommen ("OHNE Schrägstrich"), aber
    // nicht mehr als Anleitung ("MIT einem Schrägstrich") - genau das war der
    // gemessene Fehler (introDu sagte vorher "Brüche schreibst du mit einem
    // Schrägstrich").
    const b13c = ETAPPEN.find((e) => e.id === "b13c")!;
    expect(b13c.introDu ?? "").not.toMatch(/mit einem Schrägstrich/);
    expect(b13c.introSie ?? "").not.toMatch(/mit Schrägstrich/);
  });
});
