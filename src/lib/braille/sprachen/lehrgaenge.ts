/**
 * Der eigene Bereich (Lehrgang) je Sprache von Punktgenau (Bauplan 2026-11-06 §4).
 * `areas.ts` und `Punktgenau.tsx` fragen hier; jede fertige Sprache trägt sich ein.
 * Deutsch hat keinen Eintrag: es behält seine fünf Bereiche.
 */
import type { Level } from "../curriculum";
import type { Etappe } from "../etappen";
import type { LehrSprache } from "./aktuell";
import { FR_ETAPPEN, FR_LEVELS } from "./fr/lehrgang";
import { ES_ETAPPEN, ES_LEVELS } from "./es/lehrgang";
import { IT_ETAPPEN, IT_LEVELS } from "./it/lehrgang";
import { SV_ETAPPEN, SV_LEVELS } from "./sv/lehrgang";
import { NL_ETAPPEN, NL_LEVELS } from "./nl/lehrgang";
import { PT_ETAPPEN, PT_LEVELS } from "./pt/lehrgang";
import { BR_ETAPPEN, BR_LEVELS } from "./br/lehrgang";

export type SprachAreaKey = "fr-voll" | "es-voll" | "it-voll" | "sv-voll" | "nl-voll" | "pt-voll" | "br-voll";

export interface SprachBereich {
  key: SprachAreaKey;
  /** Name der Schriftart aus der Norm der Sprache. */
  label: string;
  blurb: string;
  etappen: Etappe[];
  levels: Level[];
}

export const SPRACH_BEREICHE: Partial<Record<LehrSprache, SprachBereich>> = {
  fr: {
    key: "fr-voll",
    label: "Braille intégral",
    blurb: "Chaque lettre, sans abréviation - code braille français uniformisé (CBFU 2008).",
    etappen: FR_ETAPPEN,
    levels: FR_LEVELS,
  },
  es: {
    key: "es-voll",
    label: "Signografía básica",
    blurb: "Cada letra, sin abreviaturas - signografía básica de la Comisión Braille Española (CBE B 2, 2025).",
    etappen: ES_ETAPPEN,
    levels: ES_LEVELS,
  },
  it: {
    key: "it-voll",
    label: "Codice braille a sei punti",
    blurb: "Ogni lettera, senza abbreviazioni - Codice Braille Italiano a sei punti (Biblioteca Italiana per i Ciechi, 2022).",
    etappen: IT_ETAPPEN,
    levels: IT_LEVELS,
  },
  sv: {
    key: "sv-voll",
    label: "Svensk punktskrift",
    blurb: "Varje bokstav, utan förkortningar - Svenska skrivregler för punktskrift (Punktskriftsnämnden/MTM, 2009).",
    etappen: SV_ETAPPEN,
    levels: SV_LEVELS,
  },
  nl: {
    key: "nl-voll",
    label: "Braillestandaard",
    blurb: "Elke letter, zonder afkortingen - Braillestandaard voor algemeen gebruik in het Nederlandse taalgebied (Braille Autoriteit, 2019).",
    etappen: NL_ETAPPEN,
    levels: NL_LEVELS,
  },
  pt: {
    key: "pt-voll",
    label: "Grafia Braille",
    blurb: "Cada letra, sem abreviaturas - Grafia Braille para a Língua Portuguesa (3.ª edição, 2018), a norma de Portugal e do Brasil.",
    etappen: PT_ETAPPEN,
    levels: PT_LEVELS,
  },
  br: {
    key: "br-voll",
    label: "Grafia Braille",
    blurb: "Cada letra, sem abreviaturas - Grafia Braille para a Língua Portuguesa (3ª edição, 2018), a norma do Brasil e de Portugal.",
    etappen: BR_ETAPPEN,
    levels: BR_LEVELS,
  },
};

/** Das Level einer Etappe aus irgendeinem Sprach-Lehrgang (Ids sind je Sprache eindeutig: fr-, es-, it-). */
export function sprachLevelById(id: string): Level | undefined {
  for (const b of Object.values(SPRACH_BEREICHE)) {
    const l = b?.levels.find((x) => x.id === id);
    if (l) return l;
  }
  return undefined;
}
