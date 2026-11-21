/**
 * Alle Plus-Texte nach Sprache. Eine Sprache kommt dazu, wenn ihre Datei
 * (`texte/<sprache>.ts`, Typ `PlusTexte`) FERTIG ist - dann in
 * `PLUS_SPRACHEN_FERTIG` (`lib/plus/sprache.ts`) eintragen.
 */
import type { BedienSprache } from "@/lib/bedienSprache";
import { de } from "./de";
import { en } from "./en";
import { es } from "./es";
import { fr } from "./fr";
import type { PlusTexte } from "./typ";

export type { PlusTexte } from "./typ";
export const PLUS_TEXTE: Partial<Record<BedienSprache, PlusTexte>> = { de, en, es, fr };
