/**
 * „Sprich die Rechnung" in der Sprache von Plus: deutsch über `sprechen/rechnen.ts`
 * (unverändert), englisch über `sprechen/rechnenEn.ts`, französisch über `rechnenFr.ts`. Ohne Probe-Schalter immer deutsch.
 */
import { sprich, type SprechEinstellung } from "@/lib/sprechen/rechnen";
import { sprichEn } from "@/lib/sprechen/rechnenEn";
import { sprichEs } from "@/lib/sprechen/rechnenEs";
import { sprichFr } from "@/lib/sprechen/rechnenFr";
import type { BedienSprache } from "@/lib/bedienSprache";
import { plusSprache } from "./aktuelleSprache";
import { aktuelleRegion } from "./einstellungen";
import { zaehlweiseFuer } from "./regionen";

export function sprichPlus(zeile: string, e: SprechEinstellung = {}): string {
  const je: Partial<Record<BedienSprache, (z: string) => string>> = {
    en: sprichEn,
    es: sprichEs,
    // ★ Region (10.11.2026): wie 70, 80 und 90 gesprochen werden - septante, huitante, nonante ...
    fr: (z) => sprichFr(z, { zaehlweise: zaehlweiseFuer(aktuelleRegion()) }),
  };
  return (je[plusSprache()] ?? ((z: string) => sprich(z, e)))(zeile);
}
