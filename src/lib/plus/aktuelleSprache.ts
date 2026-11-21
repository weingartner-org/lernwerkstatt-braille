/**
 * Die Sprache, in der Plus gerade rechnet - ein Blatt ohne Abhängigkeiten.
 *
 * ★ Warum nicht nur ein React-Kontext: Die Aufgaben entstehen ausserhalb von
 *   React (Generator, Prüfung, Vorlesen). Der Sprach-Provider (`sprache.ts`)
 *   setzt sie, bevor die Kinder zeichnen - wie bei Klangpunkte
 *   (`klangpunkte/sprache.ts`). Ohne Probe-Schalter `?plus-sprachen=1` ist sie
 *   immer `de`, und dann ändert sich nirgends etwas.
 * ★ Wer sie liest, fragt `plusSprache()`; Tests setzen sie mit
 *   `setzeAktuelleSprache` und stellen sie danach auf `de` zurück.
 */
import type { BedienSprache } from "@/lib/bedienSprache";
import { MATHE_CODES } from "./braille/matheCode";

let aktuell: BedienSprache = "de";

export function setzeAktuelleSprache(s: BedienSprache): void {
  aktuell = s;
}

export function plusSprache(): BedienSprache {
  return aktuell;
}

/** Das Dezimalzeichen der Plus-Zeile in der aktuellen Sprache (aus dem Mathe-Code). */
export function dezimalzeichen(): "," | "." {
  const je: Partial<Record<BedienSprache, "," | ".">> = { en: MATHE_CODES.ueb?.dezimalzeichen ?? ".", fr: MATHE_CODES["nmb-fr"]?.dezimalzeichen ?? ",", es: MATHE_CODES["cmu-es"]?.dezimalzeichen ?? "," };
  return je[aktuell] ?? ",";
}
