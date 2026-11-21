/**
 * Die Sprache, in der Punktgenau GERADE lehrt (Bauplan 2026-11-06 §4).
 *
 * Eine winzige Merkstelle ohne Abhängigkeiten, damit tiefe Module
 * (`engine.ts`, `announce.ts`) die Sprache lesen können, ohne React oder
 * Provider zu kennen - dasselbe Muster wie `klangSprache()` in Klangpunkte.
 * Gesetzt wird sie vom Provider (`sprache.ts`); ohne Probe-Schalter und
 * ausserhalb des Providers ist sie IMMER "de", dann läuft jeder Pfad wie bisher.
 */
export type LehrSprache = "de" | "en" | "fr" | "es" | "it" | "sv" | "nl" | "pt" | "br";

let aktuell: LehrSprache = "de";

export function setzeLehrSprache(s: LehrSprache): void {
  aktuell = s;
}

/** Die Sprache, die gerade gilt ("de", solange der Probe-Schalter aus ist). */
export function lehrSprache(): LehrSprache {
  return aktuell;
}
