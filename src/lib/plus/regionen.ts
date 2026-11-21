/**
 * ════════════════════════════════════════════════════════════════════════════
 * LAND / REGION FÜR SPANISCH UND FRANZÖSISCH (10.11.2026)
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Grundlage: `RECHERCHE-2026-11-10-PLUS-ES-LAENDER.md` (§0, §B, §C, §E) und
 * `RECHERCHE-2026-11-10-PLUS-FR-LAENDER.md` (§0, §B, §C, §E).
 *
 * ★ Eine Region ändert NUR, was die Recherchen belegen: Währung und Cent-Wort
 *   in den Rechengeschichten, ein paar Wörter (es), die Zahlwörter beim
 *   Vorlesen (fr: 70/80/90), die Stimme. NIE die Braille-Zellen: die sind je
 *   Sprache eine gemeinsame Norm (CMU 2024, NMB 2007; `mathFr.ts`, `cmuEs.ts`
 *   bleiben unberührt).
 * ★ Dieses Blatt ist rein (kein Speicher, kein React): die Wahl des Kindes
 *   liegt in `einstellungen.ts`, die wirksame Region liefert dort
 *   `aktuelleRegion()`.
 *
 * ★ NICHT gebaut (Fachperson nötig, offen in den Recherchen): Voseo,
 *   Geld-Braille (⠸⠑ ⠸⠏ ⠸⠎), Platzhalter ⠰, Divisionszeichen, Einheiten-Zellen,
 *   Schweizer Apostroph, Zinsrechnung, Stoffplan je Land verschieben,
 *   "punto" statt "coma" beim Vorlesen in Mexiko (keine Quelle).
 */
import type { BedienSprache } from "@/lib/bedienSprache";
import type { FranzZaehlweise } from "@/lib/typing/zahlwort";

/** Alle Regionen. `es` und `fr` sind die Vorgaben ihrer Sprache. */
export type PlusRegion = "es" | "latam" | "fr" | "be" | "ch-huitante" | "ch-quatre-vingts" | "ca";

/** Die Sprachen, die eine Region haben. */
export type RegionSprache = "es" | "fr";

export const REGIONEN: Readonly<Record<RegionSprache, readonly PlusRegion[]>> = {
  es: ["es", "latam"],
  fr: ["fr", "be", "ch-huitante", "ch-quatre-vingts", "ca"],
};

export function hatRegion(sprache: BedienSprache): sprache is RegionSprache {
  return sprache === "es" || sprache === "fr";
}

export function istRegionFuer(sprache: RegionSprache, wert: unknown): wert is PlusRegion {
  return REGIONEN[sprache].includes(wert as PlusRegion);
}

/* ------------------------------------------------------------------ */
/* Vorgabe aus der Browser-Sprache                                      */
/* ------------------------------------------------------------------ */

/**
 * Die Region, die ohne Wahl des Kindes gilt - aus der Liste der Browser-Sprachen
 * (die ERSTE Sprache der Plus-Sprache entscheidet, wie in Tastenflow).
 *
 * es:  `es-ES` und ein blosses `es` ⇒ `es`; JEDES andere Land (`es-MX`, `es-AR`,
 *      `es-CO`, `es-CL`, `es-PE`, `es-US`, `es-419` ...) ⇒ `latam`.
 * fr:  `fr-BE` ⇒ `be`, `fr-CA` ⇒ `ca`, `fr-CH` ⇒ `ch-huitante`, alles andere
 *      (`fr-FR`, `fr`, `fr-LU`, `fr-MC`, Afrika ...) ⇒ `fr`.
 *
 * ★ Warum `fr-CH` ⇒ `ch-huitante` und nicht `ch-quatre-vingts`: Die Sprache
 *   `fr-CH` sagt nichts über den Kanton (Recherche FR §B, §E.2 Nr. 1a). Septante
 *   und nonante gelten in der ganzen Romandie; nur die 80 unterscheidet sich:
 *   huitante in VD, VS, FR (zusammen die Mehrheit der Romands, grob 60 %),
 *   quatre-vingts in GE, NE, BE, JU. Ohne Wissen über den Kanton ist huitante
 *   der häufigere Fall - und es ist dieselbe Wahl wie bei Tastenflow (`fr-CH`
 *   setzt dort immer huitante), das Kind sieht also in beiden Apps dasselbe.
 *   ⚠️ Das ist nur die VORGABE: Das Feld "Land/Region" bietet beide Schweizer
 *   Einträge an, und die Wahl des Kindes geht vor. (Die Zahlen sind grob und
 *   stammen nicht aus einer gelesenen Quelle - Recherche: Wikipedia-Auszug.)
 */
export function vorgabeRegion(sprache: RegionSprache, sprachen: readonly string[] = browserSprachenLesen()): PlusRegion {
  for (const roh of sprachen) {
    const t = roh.trim().toLowerCase().replace("_", "-");
    if (sprache === "es" && /^es(?:-|$)/.test(t)) {
      return t === "es" || t === "es-es" || t.startsWith("es-es-") ? "es" : "latam";
    }
    if (sprache === "fr" && /^fr(?:-|$)/.test(t)) {
      if (t.startsWith("fr-be")) return "be";
      if (t.startsWith("fr-ca")) return "ca";
      if (t.startsWith("fr-ch")) return "ch-huitante";
      return "fr";
    }
  }
  return sprache === "es" ? "es" : "fr";
}

function browserSprachenLesen(): readonly string[] {
  try {
    const n = window.navigator;
    if (n.languages && n.languages.length) return n.languages;
    return n.language ? [n.language] : [];
  } catch {
    return [];
  }
}

/* ------------------------------------------------------------------ */
/* Texte der Rechengeschichten                                          */
/* ------------------------------------------------------------------ */

/** Ein Wort samt Grossschreibung am Anfang ersetzen. */
function wort(alt: string, neu: string): [RegExp, (m: string) => string] {
  return [
    new RegExp(`(?<![\\p{L}'])${alt}(?![\\p{L}])`, "giu"),
    (m) => (m[0] === m[0].toUpperCase() ? neu[0].toUpperCase() + neu.slice(1) : neu),
  ];
}

/**
 * ★ Die fünf Wörter der Recherche ES §E.2 Nr. 2 - für ganz Lateinamerika EINE
 *   Wahl (die häufigste): coche ⇒ carro (MX, CO, PE; in AR und CL sagt man
 *   "auto"), móvil ⇒ celular, zumo ⇒ jugo, patatas ⇒ papas, ordenador ⇒
 *   computadora (CO, CL: "computador"). Dass LatAm anders sagt, ist
 *   Allgemeinwissen, in der Recherche nicht aus einer Quelle belegt.
 */
const LATAM_WOERTER: Array<[RegExp, (m: string) => string]> = [
  wort("coches", "carros"), wort("coche", "carro"),
  wort("móviles", "celulares"), wort("móvil", "celular"),
  wort("zumos", "jugos"), wort("zumo", "jugo"),
  wort("patatas", "papas"), wort("patata", "papa"),
  wort("ordenadores", "computadoras"), wort("ordenador", "computadora"),
];

/** Währung und Cent-Wort, Recherche ES §E.2 Nr. 1: euros/céntimos ⇒ pesos/centavos. */
const LATAM_GELD: Array<[RegExp, (m: string) => string]> = [
  wort("euros", "pesos"), wort("euro", "peso"), wort("céntimos", "centavos"), wort("céntimo", "centavo"),
];

/**
 * Französisch (Recherche FR §B, §E.2 Rang 2): CH ⇒ francs und centimes
 * (Rappen heissen auf Französisch "centimes"); CA ⇒ dollars und cents.
 * Geschrieben als WORT, nicht als Zeichen: Für Währungszeichen im Braille hat
 * die Norm keine geprüfte Zelle (Geld-Braille bleibt offen), und die Antwort
 * ist ohnehin eine blosse Zahl.
 */
function franzGeld(waehrung: string, cent: string | null): Array<[RegExp | string, string | ((m: string) => string)]> {
  const liste: Array<[RegExp | string, string | ((m: string) => string)]> = [
    [/d'euros/g, `de ${waehrung}s`],
    [/\s€/g, ` ${waehrung}s`],
    wort("euros", `${waehrung}s`),
    wort("euro", waehrung),
  ];
  if (cent) liste.push(wort("centimes", `${cent}s`), wort("centime", cent));
  return liste;
}

const FR_GELD_CH = franzGeld("franc", null);
const FR_GELD_CA = franzGeld("dollar", "cent");

/** Der Text einer Rechengeschichte in der Schreibweise der Region. Vorgaben (es, fr, be) ändern nichts. */
export function regionalerText(text: string, region: PlusRegion | null): string {
  let regeln: Array<[RegExp | string, string | ((m: string) => string)]> = [];
  if (region === "latam") regeln = [...LATAM_GELD, ...LATAM_WOERTER];
  else if (region === "ch-huitante" || region === "ch-quatre-vingts") regeln = FR_GELD_CH;
  else if (region === "ca") regeln = FR_GELD_CA;
  let s = text;
  for (const [muster, ersatz] of regeln) s = s.replace(muster as RegExp, ersatz as (m: string) => string);
  return s;
}

/** Nur die Wörter (ohne Geld) - für die Oberflächen-Texte, z. B. "Braille de ordenador". */
export function regionaleWoerter(text: string, region: PlusRegion | null): string {
  if (region !== "latam") return text;
  let s = text;
  for (const [muster, ersatz] of LATAM_WOERTER) s = s.replace(muster, ersatz);
  return s;
}

/* ------------------------------------------------------------------ */
/* Zahlwörter, Geld und Stimme beim Vorlesen                            */
/* ------------------------------------------------------------------ */

/** Wie 70, 80 und 90 gesprochen werden (`zahlwortFr`). */
export function zaehlweiseFuer(region: PlusRegion | null): FranzZaehlweise {
  switch (region) {
    case "be": return "fr-BE";
    case "ch-huitante": return "fr-CH";
    case "ch-quatre-vingts": return "fr-CH-quatre-vingts";
    case "ca": return "fr-CA";
    default: return "fr-FR";
  }
}

/** Die Währung, die beim Vorlesen ausgesprochen wird (französisch). */
export type FranzGeldart = "euro" | "franc" | "dollar";

/** Die BCP-47-Kennung der Stimme je Region (Rückfall: irgendeine Stimme der Sprache, `stimmeFuer`). */
export const STIMM_KENNUNG: Readonly<Record<PlusRegion, string>> = {
  es: "es-ES",
  latam: "es-MX",
  fr: "fr-FR",
  be: "fr-BE",
  "ch-huitante": "fr-CH",
  "ch-quatre-vingts": "fr-CH",
  ca: "fr-CA",
};
