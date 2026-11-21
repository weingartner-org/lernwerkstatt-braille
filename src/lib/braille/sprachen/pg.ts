/**
 * Der Text an einer Stelle, ohne React (Bauplan 2026-11-06 §4): Deutsch kommt aus dem
 * Code, jede andere Sprache aus `texte/<sprache>.ts`. Aus `sprache.ts` ausgelagert, damit
 * reine Module (`announce.ts`, `cell.ts`) keine React-Abhängigkeit bekommen.
 * Gelesen wird die Sprache aus `aktuell.ts` (der Provider in `sprache.ts` setzt sie).
 */
import type { BedienSprache } from "@/lib/bedienSprache";
import { lehrSprache } from "./aktuell";
import { PG_TEXTE, type PgTexte } from "../texte";

/** Die Texte der aktuellen Sprache - `null` für Deutsch (die stehen im Code). */
export function pgTexte(): PgTexte | null {
  const s = lehrSprache();
  return s === "de" ? null : (PG_TEXTE[s] ?? null);
}

/** Die Texte einer bestimmten Sprache (für Tests und Werkzeuge). */
export function pgTexteFuer(s: BedienSprache): PgTexte | null {
  return s === "de" ? null : (PG_TEXTE[s] ?? null);
}

/**
 * Der Text an einer Stelle: Deutsch (`de`) oder, in einer anderen Sprache, der
 * Text aus `texte/<sprache>.ts`. Fehlt dort die Stelle, bleibt der deutsche
 * stehen (der Wächter `tests/punktgenau-fr.test.tsx` fängt das für fr ab).
 */
export function pg<T>(de: T, fremd?: (t: PgTexte) => T | undefined): T {
  const t = pgTexte();
  if (!t || !fremd) return de;
  return fremd(t) ?? de;
}
