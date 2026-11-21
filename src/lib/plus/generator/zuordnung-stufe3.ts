/**
 * Plus - welches Paket der Stufe 3 welche Bauart benutzt.
 *
 * Dieselbe Idee wie `zuordnung.ts` (Stufe 1 und 2), nur eine Ebene höher: der
 * Tausenderraum, das automatisierte Einmaleins, die ersten schriftlichen
 * Verfahren. `zuordnung.ts` selbst bleibt unverändert - ein Zusammenführen
 * aller Stufen in eine gemeinsame Tabelle ist ein eigener, späterer Schritt.
 */
import * as K from "./kerne";
import { fermiKern } from "./fermi";
import { sachKern } from "./sachaufgaben";
import * as K3 from "./kerne-stufe3";
import type { Bauauftrag } from "./zuordnung";

const EINMALEINS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;
const TEILER_1000 = [2, 4, 5, 8, 10, 20, 25, 40, 50, 100] as const;
const EINSTELLIG = [2, 3, 4, 5, 6, 7, 8, 9] as const;

export const ZUORDNUNG_STUFE3: Record<string, Bauauftrag> = {
  /* ---- Stufe 3: der Tausenderraum und die schriftlichen Verfahren ---- */
  "3-01": (r) => K3.zahlenreiheGross(r, { min: 100, max: 999 }),
  "3-02": (r) => K.schritte(r, { von: 0, bis: 1000, schritte: [25, 50, 100], glieder: 6 }),
  "3-03": (r) =>
    r() < 0.5
      ? K.ergaenzung(r, { ziel: "hunderter", min: 1, max: 899 })
      : K.ergaenzung(r, { ziel: 1000, min: 1, max: 999 }),
  "3-04": (r) => K3.teilenAufTausend(r, TEILER_1000),
  "3-05": (r) => K3.schriftlichPlus(r, { aMin: 100, aMax: 899, gesamtMax: 999 }),
  "3-06": (r) => K3.schriftlichMinus(r, { min: 100, max: 999 }),
  "3-07": (r) => K3.hilfsaufgabe(r),
  "3-08": (r) => K3.runden(r, { min: 11, max: 999 }),
  "3-09": (r) => K3.ueberschlagKern(r, { min: 100, max: 899 }),
  "3-10": (r) => K3.schriftlichPlus(r, { aMin: 100, aMax: 899, gesamtMax: 999 }),
  "3-11": (r) => K3.schriftlichMinus(r, { min: 100, max: 999 }),
  "3-12": (r) => K3.schriftlichMinus(r, { min: 100, max: 999 }),
  "3-13": (r) =>
    r() < 0.5
      ? K.summe(r, { min: 100, max: 899, summeMax: 999 })
      : K.differenz(r, { min: 100, max: 899 }),
  "3-14": (r) => K.produkt(r, { reihen: EINMALEINS, bMax: 10, tauschen: true }),
  "3-15": (r) => K3.zehnerEinmaleins(r),
  "3-16": (r) => K3.schriftlichMal(r, { aMin: 100, aMax: 999, bMin: 2, bMax: 9 }),
  "3-17": (r) => K3.divisionOhneRest(r, { divisoren: EINSTELLIG, aMin: 100, aMax: 999 }),
  "3-18": (r) => K3.divisionMitRest(r, { divisoren: EINSTELLIG, aMin: 100, aMax: 999 }),
  "3-19": (r) =>
    r() < 0.5
      ? K.verdoppeln(r, { min: 100, max: 500 })
      : K.halbieren(r, { min: 100, max: 1000 }),
  "3-20": (r) => K3.hilfsaufgabe(r),
  "3-21": (r) => (r() < 0.75 ? sachKern("3-21", r) : fermiKern("3-21", r)),
};

/** Pakete der Stufe 3, für die noch keine Bauart hinterlegt ist. */
export function fehlendeBauartenStufe3(alleIds: readonly string[]): string[] {
  return alleIds.filter((id) => id.startsWith("3-") && !ZUORDNUNG_STUFE3[id]);
}
