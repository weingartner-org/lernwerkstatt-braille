/**
 * Prüft die Übungstexte der „Texte"-Level: Jeder Text muss vom jeweiligen
 * Braille-System vollständig transkribierbar sein (keine unbekannten Zeichen),
 * es darf keine Duplikate/leeren Texte geben, und die Wortzahl muss grob zum
 * Schwierigkeitsgrad passen.
 */
import { describe, expect, it } from "vitest";
import { transcribe, type BrailleSystem } from "@/lib/braille";
import {
  TEXTE_BASIS,
  TEXTE_COMPUTER_ERWACHSENE,
  TEXTE_COMPUTER_JUGEND,
  TEXTE_KURZ,
  TEXTE_VOLL,
} from "@/lib/braille/texts";

const groups: {
  name: string;
  system: BrailleSystem;
  texts: string[];
  min: number;
  max: number;
}[] = [
  { name: "Basis", system: "basis", texts: TEXTE_BASIS, min: 14, max: 32 },
  { name: "Voll", system: "voll", texts: TEXTE_VOLL, min: 38, max: 64 },
  {
    name: "Computer-Jugend",
    system: "computer",
    texts: TEXTE_COMPUTER_JUGEND,
    min: 70,
    max: 135,
  },
  {
    name: "Computer-Erwachsene",
    system: "computer",
    texts: TEXTE_COMPUTER_ERWACHSENE,
    min: 60,
    max: 140,
  },
  // Kurzschrift-Abschlusstexte: Anzeige läuft zur Laufzeit über de-g2, die
  // Zeichen-Transkribierbarkeit wird hier aber gegen die Vollschrift geprüft
  // (gleicher 6-Punkt-Zeichenvorrat). Sachtexte rund 90–110 Wörter.
  { name: "Kurzschrift", system: "voll", texts: TEXTE_KURZ, min: 90, max: 114 },
];

describe("Übungstexte (Texte-Level)", () => {
  for (const g of groups) {
    describe(g.name, () => {
      it("hat mindestens 40 Texte", () => {
        expect(g.texts.length).toBeGreaterThanOrEqual(40);
      });

      it("keine leeren Texte, keine Duplikate", () => {
        for (const t of g.texts) expect(t.trim().length).toBeGreaterThan(0);
        const unique = new Set(g.texts.map((t) => t.trim()));
        expect(unique.size).toBe(g.texts.length);
      });

      it("alle Zeichen sind transkribierbar (keine unbekannten)", () => {
        for (const t of g.texts) {
          const unknown = transcribe(t, { system: g.system })
            .filter((u) => u.kind === "unknown")
            .map((u) => u.text);
          expect(
            unknown,
            `Unbekannte Zeichen in: "${t}" → ${JSON.stringify(unknown)}`,
          ).toEqual([]);
        }
      });

      it("Wortzahl liegt im erwarteten Bereich", () => {
        for (const t of g.texts) {
          const words = t.trim().split(/\s+/).filter(Boolean).length;
          expect(
            words,
            `Wortzahl ${words} bei: "${t.slice(0, 48)}…"`,
          ).toBeGreaterThanOrEqual(g.min);
          expect(words).toBeLessThanOrEqual(g.max);
        }
      });

      it("nutzt echte deutsche Umlaute (keine ae/oe/ue-Ersatzschreibung)", () => {
        const withUmlaut = g.texts.filter((t) => /[äöüÄÖÜß]/.test(t)).length;
        expect(
          withUmlaut / Math.max(1, g.texts.length),
          `Nur ${withUmlaut}/${g.texts.length} Texte enthalten Umlaute/ß — deutet auf Ersatzschreibung (ae/oe/ue oder fehlende Umlaute) hin`,
        ).toBeGreaterThanOrEqual(0.7);
      });
    });
  }
});
