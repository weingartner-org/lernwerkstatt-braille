/**
 * ════════════════════════════════════════════════════════════════════════════
 * DIE SPRACHE VON PUNKTGENAU (Bauplan 2026-11-06 §4)
 * ════════════════════════════════════════════════════════════════════════════
 *
 * ★ HINTER DEM PROBE-SCHALTER `?punktgenau-sprachen=1` (Not-Aus `=0`), Vorgabe
 *   AUS. Ohne Schalter: alles deutsch, Byte für Byte (Wächter
 *   `tests/punktgenau-deutsch-unveraendert.test.tsx`), kein Sprachwähler.
 * ★ Eigener Kontext (`lib/appSprache.tsx`) mit eigener Merkstelle
 *   `punktgenau-sprache` - nach dem Muster von `klangpunkte/sprache.ts`.
 * ★ Deutsch ist NICHT ausgelagert: die deutschen Texte stehen weiter im Code.
 *   Nur die anderen Sprachen liegen unter `texte/` (`texte/<sprache>.ts`).
 *   Wer einen Text übersetzt, schreibt an der Stelle
 *   `pg("deutscher Text", (t) => t.bereich.schluessel)` - ist die Sprache
 *   deutsch, kommt der eingesetzte deutsche Text zurück, sonst der der Sprache.
 *   (Das ist der Grund, warum der Wächter das deutsche HTML Byte für Byte
 *   gleich sieht.)
 * ★ Code ausserhalb von React (`engine.ts`, `announce.ts`) liest die Sprache
 *   über `lehrSprache()` (`aktuell.ts`); der Provider setzt sie, bevor die
 *   Kinder zeichnen.
 * ★ Der Wähler bietet nur Sprachen an, die FERTIG sind (`PG_SPRACHEN_FERTIG`).
 *   Fehlt in `texte/index.ts` die Sprache, gibt `pg()` den deutschen Text zurück -
 *   darum darf eine Sprache erst in `PG_SPRACHEN_FERTIG`, wenn ihre Texte stehen.
 */
import type { BedienSprache } from "@/lib/bedienSprache";
import { appSpracheBauen } from "@/lib/appSprache";
import { setzeLehrSprache, type LehrSprache } from "./aktuell";

export const PG_SPRACHEN_SCHALTER = "punktgenau-sprachen";
export const PG_SPRACHE_MERKER = "punktgenau-sprache";

/** Fertige Sprachen der Oberfläche. Welle 1: fr (Teil B), es, it, pt, br; sv nl folgen je Sprache. */
export const PG_SPRACHEN_FERTIG: readonly BedienSprache[] = ["de", "fr", "es", "it", "sv", "nl", "pt", "br"];

/** Vom Provider gerufen (auch mit `de` bei ausgeschaltetem Schalter). */
function beiSprache(s: BedienSprache): void {
  setzeLehrSprache(s as LehrSprache);
}

export { pg, pgTexte, pgTexteFuer } from "./pg";

const PG = appSpracheBauen({
  schalter: PG_SPRACHEN_SCHALTER,
  merker: PG_SPRACHE_MERKER,
  sprachen: PG_SPRACHEN_FERTIG,
  beiSprache,
});

export const pgSprachenAn = PG.schalterAn;
export const PgSpracheProvider = PG.Provider;
export const PgSprachWaehler = PG.Waehler;
export const usePgSpracheWert = PG.useWert;
/** Für React-Bauteile: die Sprache und Neuzeichnen beim Umschalten. */
export const usePgSprache = PG.useSprache;
