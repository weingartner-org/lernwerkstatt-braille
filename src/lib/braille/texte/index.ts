/**
 * Die Texte der Oberfläche von Punktgenau je Sprache (ohne Deutsch - das steht im Code).
 *
 * Neue Sprache (es, it, sv, nl, pt, br):
 *  1. `texte/<sprache>.ts` anlegen: `export const es: PgTexte = { ... }` mit denselben
 *     Bereichen wie `fr.ts` (das ist die Vorlage; bei viel Text lieber ein Ordner
 *     `texte/<sprache>/<bereich>.ts` mit eigener `index.ts`),
 *  2. hier eintragen,
 *  3. in `../sprachen/sprache.ts` die Sprache in `PG_SPRACHEN_FERTIG` aufnehmen,
 *  4. in `../sprachen/register.ts` `fertig: true` setzen.
 * Jede Stelle, die `pg("deutsch", (t) => t.…)` benutzt, bekommt dann die neue Sprache.
 */
import type { BedienSprache } from "@/lib/bedienSprache";
import { fr } from "./fr";
import { es } from "./es";
import { it } from "./it";
import { sv } from "./sv";
import { nl } from "./nl";
import { pt } from "./pt";
import { br } from "./br";

export type PgTexte = typeof fr;

export const PG_TEXTE: Readonly<Partial<Record<BedienSprache, PgTexte>>> = {
  fr,
  es,
  it,
  sv,
  nl,
  pt,
  br,
};
