/**
 * ════════════════════════════════════════════════════════════════════════════
 * PORTUGIESISCH, PORTUGAL (pt) - DER LEHRGANG „GRAFIA BRAILLE" (Bauplan 2026-11-06 §4)
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Gebaut von `lehrgangBau.ts` (gemeinsam mit br; dort stehen Reihenfolge, Quellen und Regeln).
 * Wörter, Namen, Sätze und Texte: NUR aus den Portugal-Daten von Tastenflow (`typing/wordsPt.ts`, `corpusPt*.ts`,
 * `serienPt*.ts`), vorgefiltert von `scripts/pt-br-lehrgang-erzeugen.mts` nach `generated/pt-lehrgang.generated.json`.
 * Anrede: Kinder „tu", Lehrkraft Höflichkeitsform.
 */
import { ptBrLehrgang } from "./lehrgangBau";
import POOL from "./generated/pt-lehrgang.generated.json";

const L = ptBrLehrgang("pt", POOL);

/** Alle Etappen des portugiesischen (Portugal) Lehrgangs, in Reihenfolge. */
export const PT_ETAPPEN = L.etappen;
/** Die zugehörigen Levels (Aufgabenvorrat je Etappe). */
export const PT_LEVELS = L.levels;

export function ptLevelById(id: string) {
  return PT_LEVELS.find((l) => l.id === id);
}

/** Die Wortvorräte (für Tests und Werkzeuge). */
export const PT_POOL = L.pool;
