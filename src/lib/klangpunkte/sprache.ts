/**
 * ════════════════════════════════════════════════════════════════════════════
 * DIE SPRACHE VON KLANGPUNKTE (Bauplan 2026-11-06 §3)
 * ════════════════════════════════════════════════════════════════════════════
 *
 * ★ HINTER DEM PROBE-SCHALTER `?klangpunkte-sprachen=1` (Not-Aus `=0`), Vorgabe
 *   AUS. Ohne Schalter: alles deutsch, Byte für Byte (Wächter
 *   `tests/klangpunkte-deutsch-unveraendert.test.tsx`), kein Sprachwähler.
 * ★ Eigener Kontext (`lib/appSprache.tsx`) mit eigener Merkstelle
 *   `klangpunkte-sprache`: Weder Sims noch Tastenflow stellen sich mit um.
 * ★ Die Texte stehen unter `texte/`. Code ausserhalb von React (die Aufgaben-
 *   Erzeuger in `etappen.ts`, `notation.ts`) liest die Sprache über
 *   `klangTexte()` / `klangSprache()` - der Provider setzt sie, bevor die Kinder
 *   zeichnen. React-Bauteile rufen `useKlangTexte()` (das abonniert den
 *   Kontext, damit sie beim Umschalten neu zeichnen).
 * ★ Der Wähler bietet nur Sprachen an, die FERTIG sind (`KLANG_SPRACHEN_FERTIG`).
 */
import type { BedienSprache } from "@/lib/bedienSprache";
import { appSpracheBauen } from "@/lib/appSprache";
import { KLANG_TEXTE, type KlangTexte } from "./texte";

export const KLANG_SPRACHEN_SCHALTER = "klangpunkte-sprachen";
export const KLANG_SPRACHE_MERKER = "klangpunkte-sprache";

/** Fertige Sprachen. Schritt 2, Teil 1: de und en. fr es it folgen (Teil 2). */
export const KLANG_SPRACHEN_FERTIG: readonly BedienSprache[] = ["de", "en", "fr", "es", "it", "pt", "br", "nl", "sv", "pl", "cs", "hu"];

let aktuell: BedienSprache = "de";

/** Vom Provider gerufen (auch mit `de` bei ausgeschaltetem Schalter). */
export function setzeKlangSprache(s: BedienSprache): void {
  aktuell = s;
}

/** Die Sprache, die gerade gilt (ausserhalb des Providers: `de`). */
export function klangSprache(): BedienSprache {
  return aktuell;
}

/** Die Texte der aktuellen Sprache; fehlt sie, gelten die englischen - nie die deutschen. */
export function klangTexte(): KlangTexte {
  return KLANG_TEXTE[aktuell] ?? KLANG_TEXTE.en;
}

/** Die Texte einer bestimmten Sprache (für Tests und Werkzeuge). */
export function klangTexteFuer(s: BedienSprache): KlangTexte {
  return KLANG_TEXTE[s] ?? KLANG_TEXTE.en;
}

const KLANG = appSpracheBauen({
  schalter: KLANG_SPRACHEN_SCHALTER,
  merker: KLANG_SPRACHE_MERKER,
  sprachen: KLANG_SPRACHEN_FERTIG,
  beiSprache: setzeKlangSprache,
});

export const klangSprachenAn = KLANG.schalterAn;
export const KlangSpracheProvider = KLANG.Provider;
export const KlangSprachWaehler = KLANG.Waehler;
export const useKlangSpracheWert = KLANG.useWert;
export const useKlangSprache = KLANG.useSprache;

/** Für React-Bauteile: die Texte der Sprache und Neuzeichnen beim Umschalten. */
export function useKlangTexte(): KlangTexte {
  useKlangSprache();
  return klangTexte();
}
