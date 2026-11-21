/**
 * ════════════════════════════════════════════════════════════════════════════
 * PORTUGIESISCH, BRASILIEN (br) - DER LEHRGANG „GRAFIA BRAILLE" (Bauplan 2026-11-06 §4)
 * ════════════════════════════════════════════════════════════════════════════
 *
 * `br` ist Portugiesisch (Brasilien), nie Bretonisch. Gebaut von `../pt/lehrgangBau.ts` (gemeinsam mit pt; Zeichen und
 * Engine sind dieselben, weil die Norm für beide Länder eine ist). GETRENNT: Wortvorrat und Texte nur aus den
 * Brasilien-Daten von Tastenflow (`typing/wordsBr.ts`, `corpusBr*.ts`, `serienBr*.ts`), vorgefiltert von
 * `scripts/pt-br-lehrgang-erzeugen.mts` nach `generated/br-lehrgang.generated.json`. Anrede: Kinder „você".
 */
import { ptBrLehrgang } from "../pt/lehrgangBau";
import POOL from "./generated/br-lehrgang.generated.json";

const L = ptBrLehrgang("br", POOL);

/** Alle Etappen des brasilianischen Lehrgangs, in Reihenfolge. */
export const BR_ETAPPEN = L.etappen;
/** Die zugehörigen Levels (Aufgabenvorrat je Etappe). */
export const BR_LEVELS = L.levels;

export function brLevelById(id: string) {
  return BR_LEVELS.find((l) => l.id === id);
}

/** Die Wortvorräte (für Tests und Werkzeuge). */
export const BR_POOL = L.pool;
