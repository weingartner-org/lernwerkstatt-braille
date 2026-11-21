/**
 * ════════════════════════════════════════════════════════════════════════════
 * DIE SPRACHE VON PLUS (Bauplan 2026-11-06 §5, Probe-Schalter `?plus-sprachen=1`)
 * ════════════════════════════════════════════════════════════════════════════
 *
 * ★ HINTER DEM PROBE-SCHALTER, Vorgabe AUS (Not-Aus `=0`). Ohne Schalter: alles
 *   deutsch, Byte für Byte (Wächter `tests/plus-deutsch-unveraendert.test.tsx`),
 *   kein Sprachwähler, kein eigenes `lang`.
 * ★ Eigener Kontext (`lib/appSprache.tsx`) mit eigener Merkstelle `plus-sprache`:
 *   Weder Sims noch Klangpunkte noch Tastenflow stellen sich mit um.
 * ★ Der Wähler bietet nur FERTIGE Sprachen an (`PLUS_SPRACHEN_FERTIG`). Eine
 *   neue Sprache braucht: `texte/<sprache>.ts`, einen Mathe-Code
 *   (`braille/matheCode.ts`), Zahlwörter und Rechensprache (`sprechen/`),
 *   Sachaufgaben (`generator/sachaufgabenEn.ts` als Muster), eine Stoffplan-
 *   Übersetzung - dann hier eintragen.
 */
import type { BedienSprache } from "@/lib/bedienSprache";
import { appSpracheBauen } from "@/lib/appSprache";
import { plusSprache, setzeAktuelleSprache } from "./aktuelleSprache";
import { PLUS_TEXTE, type PlusTexte } from "./texte";
import { aktuelleRegion, useEinstellungen } from "./einstellungen";
import { useEffect } from "react";
import { sprachKennung } from "@/lib/sprechen/stimmeFuer";
import { STIMM_KENNUNG, hatRegion, vorgabeRegion, type PlusRegion } from "./regionen";
import { regionaleTexte } from "./texte/regional";

export const PLUS_SPRACHEN_SCHALTER = "plus-sprachen";
export const PLUS_SPRACHE_MERKER = "plus-sprache";

/** Fertige Sprachen. Schritt 4/5: de, en, es. es br sv folgen (je eigener Mathe-Code). */
export const PLUS_SPRACHEN_FERTIG: readonly BedienSprache[] = ["de", "en", "es", "fr"];

/** Die Texte der aktuellen Sprache; fehlt sie, gelten die englischen - nie die deutschen. */
export function plusTexte(): PlusTexte {
  const s = plusSprache();
  const texte = PLUS_TEXTE[s] ?? (PLUS_TEXTE.en as PlusTexte);
  // ★ Region (10.11.2026): nur Spanisch/Latinoamérica ändert Wörter ("ordenador" ⇒ "computadora").
  return s === "es" ? regionaleTexte(texte, aktuelleRegion()) : texte;
}

export function plusTexteFuer(s: BedienSprache): PlusTexte {
  return PLUS_TEXTE[s] ?? (PLUS_TEXTE.en as PlusTexte);
}

const PLUS = appSpracheBauen({
  schalter: PLUS_SPRACHEN_SCHALTER,
  merker: PLUS_SPRACHE_MERKER,
  sprachen: PLUS_SPRACHEN_FERTIG,
  beiSprache: setzeAktuelleSprache,
});

export const plusSprachenAn = PLUS.schalterAn;
export const PlusSpracheProvider = PLUS.Provider;
export const PlusSprachWaehler = PLUS.Waehler;
export const usePlusSpracheWert = PLUS.useWert;
export const usePlusSprache = PLUS.useSprache;

/** Für React-Bauteile: die Texte der Sprache und Neuzeichnen beim Umschalten. */
export function usePlusTexte(): PlusTexte {
  usePlusSprache();
  return plusTexte();
}

/**
 * ★ Testerin, 10.11.2026 (JAWS): „Sprache auf der Seite ist auf Englisch geschaltet, Ein- und Ausgabe
 * werden von Jaws aber Deutsch gelesen." - Das `lang` der Plus-Sprache als BCP-47-Kennung, MIT
 * Land/Region (`es-MX`, `fr-CH`, `fr-BE` ...), gleich wie die Stimme (`STIMM_KENNUNG`).
 */
export function plusLangKennung(sprache: BedienSprache, region: PlusRegion | null): string {
  if (region && hatRegion(sprache)) return STIMM_KENNUNG[region];
  return sprachKennung(sprache, "plus");
}

/**
 * Das `lang` für Elemente mit Sprachinhalt (Eingabefeld, Live-Regionen) - `undefined` ohne
 * Sprachen-Schalter (`?plus-sprachen=0`): dann bleibt die Seite Byte für Byte wie bisher.
 * Zeichnet neu, wenn Sprache oder Region wechseln.
 */
export function usePlusLang(): string | undefined {
  const { an, sprache } = usePlusSpracheWert();
  const gewaehlt = useEinstellungen((s) => (hatRegion(sprache) ? s.region[sprache] : undefined));
  if (!an) return undefined;
  const region = hatRegion(sprache) ? (gewaehlt ?? vorgabeRegion(sprache)) : null;
  return plusLangKennung(sprache, region);
}

/**
 * ★ `<html lang>` folgt der Plus-Sprache, solange Plus offen ist. JAWS liest Eingabefelder und
 * Live-Regionen in der Sprache des DOKUMENTS - das `lang` am Rahmen der App genügte nicht.
 * Beim Verlassen kommt der alte Wert zurück (die übrige Plattform, SPA ohne Neuladen).
 */
export function usePlusDokumentSprache(): string | undefined {
  const lang = usePlusLang();
  useEffect(() => {
    if (!lang) return;
    const html = document.documentElement;
    const vorher = html.getAttribute("lang");
    html.setAttribute("lang", lang);
    return () => {
      if (vorher === null) html.removeAttribute("lang");
      else html.setAttribute("lang", vorher);
    };
  }, [lang]);
  return lang;
}
