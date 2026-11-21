import { describe, it, expect } from "vitest";
import {
  LEVELS,
  STUFEN_PRO_LEVEL,
  ZEILEN_PRO_STUFE,
  buildLevelDeck,
  textToCells,
  transcribe,
} from "../src/lib/braille";

// Kurzschrift-Level (48 KFA-Lektionen) und UEB-Level (P5) sind KEINE klassischen
// Vorrat-Decks: Ihre Anzeige-/Soll-Zellen kommen zur Laufzeit aus liblouis
// (de-g2 bzw. en-ueb-g2), nicht aus der Eigenbau-Engine. Beide Stränge aus den
// Deck-/Vorrat-Strukturtests herausgenommen (eigene Suite: braille-kfa-*).
const isKurzOrUeb = (id: string) => id.startsWith("kurz-") || id.startsWith("ueb-");
const NON_TEXT = LEVELS.filter((l) => l.kind !== "text" && !isKurzOrUeb(l.id));
const GENERATED = new Set(["numbers", "math"]);
const POOL_LEVELS = NON_TEXT.filter((l) => !GENERATED.has(l.kind));
const ZEILEN_PRO_LEVEL = STUFEN_PRO_LEVEL * ZEILEN_PRO_STUFE;
const level = (id: string) => LEVELS.find((l) => l.id === id)!;

describe("Level-Stapel (buildLevelDeck)", () => {
  it("10 Stufen × 10 Zeilen", () => {
    expect(STUFEN_PRO_LEVEL).toBe(10);
    expect(ZEILEN_PRO_STUFE).toBe(10);
  });

  it("liefert genau 100 nicht-leere Aufgaben je Level", () => {
    for (const lv of NON_TEXT) {
      const deck = buildLevelDeck(lv);
      expect(deck, lv.id).toHaveLength(ZEILEN_PRO_LEVEL);
      expect(deck.every((s) => typeof s === "string" && s.length > 0)).toBe(true);
    }
  });

  it("KEINE Wiederholung innerhalb einer Stufe (jedes 10er-Fenster eindeutig)", () => {
    for (const lv of NON_TEXT) {
      for (let attempt = 0; attempt < 3; attempt++) {
        const deck = buildLevelDeck(lv);
        for (let s = 0; s < STUFEN_PRO_LEVEL; s++) {
          const stufe = deck.slice(s * ZEILEN_PRO_STUFE, (s + 1) * ZEILEN_PRO_STUFE);
          expect(new Set(stufe).size, `${lv.id} Stufe ${s + 1}`).toBe(
            ZEILEN_PRO_STUFE,
          );
        }
      }
    }
  });

  it("nur transkribierbare Aufgaben (keine unbekannten Zeichen)", () => {
    for (const lv of NON_TEXT) {
      for (const item of buildLevelDeck(lv)) {
        const unknown = transcribe(item, { system: lv.system }).filter(
          (u) => u.kind === "unknown",
        );
        expect(unknown, `„${item}" in ${lv.id}`).toHaveLength(0);
        expect(textToCells(item, { system: lv.system }).length).toBeGreaterThan(0);
      }
    }
  });
});

describe("Wortschatz der Vorrat-Level", () => {
  /**
   * ★ Warum SUCH-Level eine andere Zahl brauchen (additiv 23.09.2026):
   * Bei einem gewöhnlichen Vorrat-Level ist `items` der Vorrat an AUFGABEN -
   * zu wenige, und das Kind sieht dieselbe Aufgabe zu früh wieder. Bei einem
   * Such-Level sind `items` die gesuchten ZEICHEN; die Aufgabe selbst ist die
   * Reihe drumherum, und die wird bei jedem Mal neu gebaut. Zehn Zeichen
   * ergeben dort beliebig viele verschiedene Aufgaben.
   *
   * ⚠️ Die Ausnahme darf den Wächter nicht schwächen: Ein Such-Level braucht
   * dafür GENUG ZEICHEN, um Ablenker danebenzustellen, und die Stufen teilen
   * den Vorrat in Drittel - unter sechs Zeichen bliebe von der Steigerung
   * nichts übrig. Deshalb hier eine eigene, begründete Untergrenze statt
   * eines Freibriefs.
   */
  const MIN_SUCHE = 6;

  it("genug Auswahl (≥ 30) und keine Duplikate", () => {
    for (const lv of POOL_LEVELS) {
      if (lv.suche) continue; // eigene Prüfung unten
      expect(lv.items.length, lv.id).toBeGreaterThanOrEqual(30);
      expect(new Set(lv.items).size, `${lv.id} hat Duplikate`).toBe(
        lv.items.length,
      );
    }
  });

  it("★ Such-Level: genug Zeichen für Ablenker, keine Duplikate", () => {
    const suchLevel = POOL_LEVELS.filter((lv) => lv.suche);
    expect(suchLevel.length, "kein einziges Such-Level - dann misst diese Prüfung nichts")
      .toBeGreaterThan(0);
    for (const lv of suchLevel) {
      expect(lv.items.length, `${lv.id}: zu wenige Zeichen für Ablenker`)
        .toBeGreaterThanOrEqual(MIN_SUCHE);
      expect(new Set(lv.items).size, `${lv.id} hat Duplikate`).toBe(lv.items.length);
    }
  });

  it("Zeichenvorrat je Level eingehalten", () => {
    const charset: Record<string, RegExp> = {
      "l1-reihe1": /^[a-j]+$/,
      "l2-reihe2": /^[a-t]+$/,
      "l3-reihe3": /^[A-Za-zäöüÄÖÜß]+$/,
      "l4-woerter": /^[A-Za-zäöüÄÖÜß]+$/,
      "comp-buchstaben": /^[a-zäöüß]+$/,
    };
    for (const [id, re] of Object.entries(charset)) {
      for (const w of level(id).items) {
        expect(re.test(w), `${id}: „${w}"`).toBe(true);
      }
    }
  });

  it("Lautgruppen-Level enthalten ihre Gruppe", () => {
    const groups: Record<string, string[]> = {
      "voll-ei-ie": ["ei", "ie"],
      "voll-au-eu-aeu": ["au", "eu", "äu"],
      "voll-ch-sch-st": ["ch", "sch", "st"],
    };
    for (const [id, subs] of Object.entries(groups)) {
      for (const w of level(id).items) {
        const has = subs.some((x) => w.toLowerCase().includes(x));
        expect(has, `${id}: „${w}"`).toBe(true);
      }
    }
  });

  it("Sätze beginnen groß und enden mit Satzzeichen", () => {
    for (const id of ["l5-saetze", "voll-saetze"]) {
      for (const s of level(id).items) {
        expect(/^[A-ZÄÖÜ].*[.!?]$/.test(s), `${id}: „${s}"`).toBe(true);
      }
    }
  });

  it("Großbuchstaben-Level: jedes Wort hat einen Großbuchstaben", () => {
    for (const w of level("comp-gross").items) {
      expect(/[A-ZÄÖÜ]/.test(w), w).toBe(true);
    }
  });
});

describe("Zahlen & Rechnungen werden frisch erzeugt", () => {
  it("Zahlen-Level: Ganzzahl oder Dezimalzahl mit Komma", () => {
    for (const n of buildLevelDeck(LEVELS.find((l) => l.kind === "numbers")!)) {
      expect(n, n).toMatch(/^\d+(,\d+)?$/);
    }
  });

  // ★★★ Marburger Mathematikschrift, Kap. 5, Z. 2639-2641: Leerzeichen nur
  // VOR dem Operations-/Relationszeichen, keines danach - "3 +4 =7", nicht
  // "3 + 4 = 7" (Johannes, 22.09.2026, gemessener Fehler).
  it("Rechen-Level: a op b = c mit korrektem Ergebnis, Leerzeichen nur vor dem Zeichen", () => {
    for (const calc of buildLevelDeck(LEVELS.find((l) => l.kind === "math")!)) {
      const m = calc.match(/^(\d+) ([+−×])(\d+) =(\d+)$/);
      expect(m, `„${calc}"`).not.toBeNull();
      const [, a, op, b, c] = m!;
      const expected = op === "+" ? +a + +b : op === "−" ? +a - +b : +a * +b;
      expect(Number(c)).toBe(expected);
      expect(Number(c)).toBeGreaterThanOrEqual(0);
    }
  });
});
