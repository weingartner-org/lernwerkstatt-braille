/**
 * Die Texte von Klangpunkte je Sprache. Neue Sprache (fr, es, it ...):
 *  1. `texte/<sprache>.ts` anlegen: `export const fr: KlangTexte = { ... }` mit denselben
 *     Bereichen wie `de.ts` (am besten je Bereich eine Datei `texte/<sprache>/<bereich>.ts`),
 *  2. hier eintragen, 3. in `../sprache.ts` die Sprache in `KLANG_SPRACHEN_FERTIG` aufnehmen.
 * Fehlt eine Sprache hier, fällt sie auf Englisch zurück - nie auf Deutsch.
 */
import type { BedienSprache } from "@/lib/bedienSprache";
import { de } from "./de";
import { en } from "./en";
import { fr } from "./fr";
import { es } from "./es";
import { it } from "./it";
import { pt } from "./pt";
import { br } from "./br";
import { nl } from "./nl";
import { sv } from "./sv";
import { pl } from "./pl";
import { cs } from "./cs";
import { hu } from "./hu";

export type KlangTexte = typeof de;

export const KLANG_TEXTE: Readonly<{ de: KlangTexte; en: KlangTexte } & Partial<Record<BedienSprache, KlangTexte>>> = {
  de,
  en,
  fr,
  es,
  it,
  pt,
  br,
  nl,
  sv,
  pl,
  cs,
  hu,
};
