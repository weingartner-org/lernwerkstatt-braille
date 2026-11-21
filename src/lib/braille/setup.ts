/**
 * Lehrkraft-Setup-Modell für den Braille-Trainer (Bauvertrag §4).
 * P1: E8-Sammelschalter „erweiterte Zahlen".
 * P3: Express-Pfad expressPath (Lehrkraft/Eltern-Setup — kein Kind-Radio).
 * P5: UEB Grade 2 Welten (optional/Bonus, default aus).
 */
import type { BrailleSystem } from "./tables";
import type { Etappe } from "./etappen";
import { etappenForSystem, UEB_ETAPPEN } from "./etappen";

export interface BrailleSetup {
  /** EIN Sammelschalter „erweiterte Zahlen" (röm./Datum/Brüche/%/§). Default aus. */
  extendedNumbers: boolean;
  /**
   * Express-Vorbelegung: Vollschrift-Könner direkt auf U1–U8 statt E16–E20b.
   * Lehrkraft-/Eltern-Setting — das Kind sieht nur „Los geht's", kein Radio.
   * Default false. Optional für Rückwärtskompatibilität (Altstände ohne Feld).
   */
  expressPath?: false | "vs-pcbrl";
  /** Adaptive Einstiegs-Anspruchsstufe (1–10). Optional. */
  startStufe?: number;
  /**
   * UEB Grade 2 Welten sichtbar machen (P5, optional/Bonus).
   * Default false — die gesamte UEB-Welt ist unsichtbar bis zur Freigabe.
   */
  uebEnabled?: boolean;
  /**
   * Phase X — „Braillezeile koppeln": Lehrkraft/Eltern-Schalter, nie eine
   * Kind-Entscheidung. Default false. Schaltet nur den Koppeln-/taktil-Lese-
   * Pfad frei; ohne Browser-Unterstützung degradiert er auf den Audio-Pfad
   * (siehe display.ts `brailleDisplayCapability`). Optional (Altstände = false).
   */
  brailleDisplay?: boolean;
}

export function defaultSetup(): BrailleSetup {
  return {
    extendedNumbers: false,
    expressPath: false,
    uebEnabled: false,
    brailleDisplay: false,
  };
}

/** Erweiterte Zahlen (röm./Datum/Bruch/%/§) — geordnete Zusatz-Etappen nach b13. */
export const EXTENDED_NUMBER_IDS = ["b13a", "b13b", "b13c", "b13d", "b13e"];
const EXTENDED_IDS = new Set(EXTENDED_NUMBER_IDS);

/** Regulärer Computerbraille-Strang. */
const REGULAR_COMP_IDS = ["e16", "e17", "e18", "e19", "e20", "e20b"];

/** Express-Etappen (Vollschrift→PC-Strang für Könner). */
export const EXPRESS_IDS = ["u1", "u2", "u3", "u4", "u5", "u6", "u7", "u8"];

/**
 * Aktive Etappen nach Setup gefiltert.
 * Wenn `extendedNumbers` aus ist, werden e8a–e8e ausgeblendet.
 * Für system:"computer": wählt regulären (e16–e20b) oder Express-Pfad (u1–u8).
 * Das Kind sieht nur „neue Aufgaben", keine Struktur-UI.
 */
export function getActiveEtappen(system: BrailleSystem, setup: BrailleSetup): Etappe[] {
  const all = etappenForSystem(system);
  if (system !== "computer") {
    return all.filter((e) => setup.extendedNumbers || !EXTENDED_IDS.has(e.id));
  }
  // Computer: regulärer Pfad ODER Express, nie beide gleichzeitig
  const allowedIds = new Set(
    setup.expressPath === "vs-pcbrl" ? EXPRESS_IDS : REGULAR_COMP_IDS,
  );
  return all.filter((e) => allowedIds.has(e.id));
}

/**
 * Liefert die Etappen-ID-Sequenz für den Computer-Strang je nach Setup.
 * Für Basis/Voll ist die Sequenz immer voll (keine Setup-Weiche).
 */
export function etappenSequence(setup: BrailleSetup): string[] {
  return setup.expressPath === "vs-pcbrl" ? [...EXPRESS_IDS] : [...REGULAR_COMP_IDS];
}

/**
 * Aktive UEB-Etappen nach Setup (optional/Bonus).
 * Gibt alle UEB-Lektionen (L4–L22) zurück, wenn `uebEnabled` gesetzt ist, sonst [].
 */
export function getActiveUebEtappen(setup: BrailleSetup): Etappe[] {
  return setup.uebEnabled ? [...UEB_ETAPPEN] : [];
}
