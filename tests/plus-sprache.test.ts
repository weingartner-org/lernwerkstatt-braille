/**
 * Der Sprach-Wächter.
 *
 * ★ Das Coach-Dokument verlangt ihn wörtlich: „Ein Wächter misst alle Texte
 * der App und meldet Ausreißer. Er warnt, er sperrt nicht - die
 * Verständlichkeit entscheidet."
 *
 * Genau so ist er gebaut: Er misst jeden Satz, den ein Kind liest oder hört,
 * schreibt die längsten in die Ausgabe - und fällt erst, wenn ein Satz so lang
 * ist, dass er auch mit dem besten Willen keine kurze Sprache mehr ist.
 *
 * Die Richtwerte aus dem Coach-Dokument:
 *   Stufe 1 und 2   ein Satz um  6 Wörter
 *   Stufe 3 und 4   um 10 Wörter
 *   Stufe 5 und 6   um 12 Wörter
 *   Stufe 7 und 8   um 15 Wörter, selten mehr als zwei Sätze
 *
 * ★ „Sei mit den Wörtern nicht so starr - wenn es drei Wörter mehr braucht, um
 * verständlicher zu werden, ist das kein Problem" (Johannes, 22.09.2026).
 * Deshalb ist die harte Grenze weit: 20 Wörter. Was darunter liegt, wird
 * gemeldet, nicht gesperrt.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ABZEICHEN } from "../src/lib/plus/abzeichen";
import { FERMI } from "../src/lib/plus/generator/fermi";
import { SACHAUFGABEN } from "../src/lib/plus/generator/sachaufgaben";

const WURZEL = join(import.meta.dirname ?? ".", "..");

/** Die harte Grenze. Darüber ist es kein kurzer Satz mehr, egal für wen. */
const GRENZE = 20;

/** Die Richtwerte je Schulstufe - sie werden gemeldet, nicht erzwungen. */
const RICHTWERT: Record<number, number> = { 1: 6, 2: 6, 3: 10, 4: 10, 5: 12, 6: 12, 7: 15, 8: 15 };

function saetze(text: string): string[] {
  return text.split(/(?<=[.?!])\s+/).map((s) => s.trim()).filter(Boolean);
}

function woerter(satz: string): number {
  return satz.replace(/\{[abcn]\}/g, "0").trim().split(/\s+/).length;
}

describe("Die Aufgabentexte", () => {
  it("★ hält die Richtwerte je Schulstufe - und meldet, wo nicht", () => {
    const ausreisser: string[] = [];
    for (const [id, liste] of Object.entries(SACHAUFGABEN)) {
      const stufe = Number(id.split("-")[0]);
      for (const vorlage of liste) {
        for (const satz of saetze(vorlage.text)) {
          const n = woerter(satz);
          if (n > RICHTWERT[stufe]) ausreisser.push(`${id} (${n} Wörter): ${satz}`);
          expect(n, `${id}: ${satz}`).toBeLessThanOrEqual(GRENZE);
        }
      }
    }
    // Der Wächter warnt - er sperrt nicht.
    if (ausreisser.length) console.log("Über dem Richtwert:\n" + ausreisser.join("\n"));
  });

  it("die Fermi-Fragen ebenso", () => {
    for (const [id, liste] of Object.entries(FERMI)) {
      for (const f of liste) {
        for (const satz of saetze(f.text)) {
          expect(woerter(satz), `${id}: ${satz}`).toBeLessThanOrEqual(GRENZE);
        }
      }
    }
  });
});

describe("Die Abzeichen", () => {
  it("sagen in einem kurzen Satz, wofür es sie gibt", () => {
    for (const a of ABZEICHEN) {
      expect(woerter(a.bedingung), a.id).toBeLessThanOrEqual(12);
      expect(saetze(a.bedingung).length, a.id).toBe(1);
    }
  });
});

describe("★ Jeder Satz, den die Oberfläche sagt", () => {
  /** Alle Quelldateien von Plus - dort stehen die Sätze der Oberfläche. */
  function quellen(ordner: string, gesammelt: string[] = []): string[] {
    for (const eintrag of readdirSync(ordner, { withFileTypes: true })) {
      const pfad = join(ordner, eintrag.name);
      if (eintrag.isDirectory()) quellen(pfad, gesammelt);
      else if (/\.tsx?$/.test(eintrag.name)) gesammelt.push(pfad);
    }
    return gesammelt;
  }

  it("bleibt unter der harten Grenze", () => {
    const dateien = [
      ...quellen(join(WURZEL, "src/lib/plus")),
      ...quellen(join(WURZEL, "src/components/plus")),
    ];
    const lang: string[] = [];
    for (const datei of dateien) {
      const text = readFileSync(datei, "utf8")
        // Kommentare zählen nicht - sie liest kein Kind.
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/^\s*\/\/.*$/gm, "");
      // Deutsche Sätze in Zeichenketten: sie enden mit Punkt, Frage- oder
      // Rufzeichen und fangen gross an.
      for (const treffer of text.matchAll(/["`']([A-ZÄÖÜ][^"`'\n]{12,}?[.?!])["`']/g)) {
        if (/\$\{|<|\/|=>/.test(treffer[1])) continue;   // Code, kein Satz
        // Gemessen wird je SATZ, nicht je Zeichenkette: eine Vorlage mit vier
        // kurzen Sätzen ist kurze Sprache, auch wenn sie zusammen lang ist.
        for (const satz of saetze(treffer[1])) {
          const n = woerter(satz);
          if (n > GRENZE) lang.push(`${datei.replace(WURZEL, "")} (${n} Wörter): ${satz}`);
        }
      }
    }
    expect(lang, `Zu lange Sätze:\n${lang.join("\n")}`).toEqual([]);
  });
});
