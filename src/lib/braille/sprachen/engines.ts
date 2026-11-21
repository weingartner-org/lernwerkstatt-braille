/**
 * Welche Sprache schreibt ihre Vollschrift mit einem EIGENEN Norm-Baustein (Bauplan 2026-11-06 §4)?
 * `engine.ts` fragt hier; jede fertige Sprache trägt sich ein. Deutsch und UEB stehen nicht hier:
 * sie laufen wie bisher durch `engine.ts` und liblouis.
 */
import type { Unit } from "../engine";
import type { LehrSprache } from "./aktuell";
import { transcribeFr } from "./fr/engine";
import { transcribeEs } from "./es/engine";
import { transcribeIt } from "./it/engine";
import { transcribeSv } from "./sv/engine";
import { transcribeNl } from "./nl/engine";
import { transcribePt } from "./pt/engine";

export type SprachEngine = (text: string, opts: { grossschreibzeichen?: boolean }) => Unit[];

export const SPRACH_TRANSCRIBE: Partial<Record<LehrSprache, SprachEngine>> = {
  fr: transcribeFr,
  es: transcribeEs,
  it: transcribeIt,
  sv: transcribeSv,
  nl: transcribeNl,
  // Portugal und Brasilien: dieselbe Norm (Grafia Braille 2018), eine Engine
  pt: transcribePt,
  br: transcribePt,
};
