/**
 * Plus - welches Paket welche Bauart benutzt.
 *
 * Der Stoffplan beschreibt den Generator in Worten („a von 4 bis 9, b von 3
 * bis 9, Summe zwischen 11 und 18"), damit Johannes ihn prüfen kann. Hier
 * steht dieselbe Regel als Zahl.
 *
 * ★ Stand 22.09.2026: Stufe 1 und 2 sind gebaut (39 Pakete). Die Stufen 3 bis 8
 * folgen nach demselben Muster - ein Paket, eine Zeile. Der Test
 * `tests/plus-generator.test.ts` zählt, was noch fehlt, damit keine Lücke
 * stillschweigend bleibt.
 */
import * as K from "./kerne";
import { sachKern } from "./sachaufgaben";
import type { Kern, Zufall } from "./kerne";

export interface Bauauftrag {
  /** Baut einen Kern - die nackte Rechnung. */
  (rng: Zufall): Kern;
}

const EINMALEINS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

export const ZUORDNUNG: Record<string, Bauauftrag> = {
  /* ---- Stufe 1: der Zwanzigerraum ---- */
  "1-01": (r) => K.zahlenreihe(r, { min: 1, max: 20 }),
  "1-02": (r) => K.schritte(r, { von: 0, bis: 20, schritte: [2, 5, 10], glieder: 5 }),
  "1-03": (r) => K.zerlegung(r, { max: 10 }),
  "1-04": (r) => K.ergaenzung(r, { ziel: 10, min: 1, max: 9 }),
  "1-05": (r) => K.kraftDerFuenf(r),
  "1-06": (r) => K.verdoppeln(r, { min: 1, max: 10 }),
  "1-07": (r) => K.halbieren(r, { min: 2, max: 20 }),
  "1-08": (r) => K.summe(r, { min: 1, max: 9, summeMax: 10 }),
  "1-09": (r) => K.differenz(r, { min: 1, max: 10 }),
  "1-10": (r) => K.paar(r, { sorte: "tausch", min: 2, max: 9 }),
  "1-11": (r) => K.paar(r, { sorte: "umkehr", min: 2, max: 9 }),
  "1-12": (r) => K.paar(r, { sorte: "nachbar", min: 2, max: 9 }),
  "1-13": (r) => K.summe(r, { min: 3, max: 9, uebergang: true }),
  "1-14": (r) => K.differenz(r, { min: 0, max: 0, aMin: 11, aMax: 18, bMin: 3, bMax: 9, uebergang: true }),
  "1-15": (r) => K.paar(r, { sorte: "verdoppeln1", min: 3, max: 9 }),
  "1-16": (r) => K.ergaenzung(r, { ziel: 20, min: 1, max: 19 }),
  "1-17": (r) => K.summe(r, { min: 3, max: 9, uebergang: true }),
  "1-18": (r) => sachKern("1-18", r),

  /* ---- Stufe 2: der Hunderterraum ---- */
  "2-01": (r) => K.zahlenreihe(r, { min: 1, max: 100, frage: ["vorgaenger", "nachfolger", "nachbarn", "nachbarzehner"] }),
  "2-02": (r) => K.schritte(r, { von: 0, bis: 100, schritte: [2, 3, 5, 10, 25], glieder: 6 }),
  "2-03": (r) => K.stellenZerlegung(r, { min: 11, max: 99 }),
  "2-04": (r) => K.ergaenzung(r, { ziel: "zehner", min: 11, max: 99 }),
  "2-05": (r) => K.ergaenzung(r, { ziel: 100, min: 1, max: 99 }),
  "2-06": (r) => K.summe(r, { min: 0, max: 0, aMin: 21, aMax: 79, bMin: 11, bMax: 19, uebergang: false }),
  "2-07": (r) => K.differenz(r, { min: 0, max: 0, aMin: 25, aMax: 99, bMin: 11, bMax: 24, uebergang: false }),
  "2-08": (r) => K.summe(r, { min: 0, max: 0, aMin: 21, aMax: 79, bMin: 11, bMax: 19, uebergang: true }),
  "2-09": (r) => K.differenz(r, { min: 0, max: 0, aMin: 25, aMax: 99, bMin: 11, bMax: 24, uebergang: true }),
  "2-10": (r) => K.verdoppelnHalbieren(r, { min: 11, max: 50 }),
  "2-11": (r) => K.produkt(r, { reihen: [1, 2, 5, 10], bMax: 10 }),
  "2-12": (r) => K.quadratzahl(r, { max: 10 }),
  "2-13": (r) => K.produkt(r, { reihen: [4, 6, 8], bMax: 10 }),
  "2-14": (r) => K.produkt(r, { reihen: [3, 7, 9], bMax: 10 }),
  "2-15": (r) => K.produkt(r, { reihen: EINMALEINS, bMax: 10, tauschen: true }),
  "2-16": (r) => K.quotient(r, { divisoren: [2, 3, 4, 5, 6, 7, 8, 9, 10], maxFaktor: 10 }),
  "2-17": (r) => K.quotient(r, { divisoren: [2, 3, 4, 5], maxFaktor: 4, rest: true, aMin: 5, aMax: 20 }),
  "2-18": (r) => K.summe(r, { min: 0, max: 0, aMin: 21, aMax: 79, bMin: 11, bMax: 19 }),
  "2-19": (r) => K.differenz(r, { min: 0, max: 0, aMin: 25, aMax: 99, bMin: 11, bMax: 24 }),
  "2-20": (r) => K.summe(r, { min: 0, max: 0, aMin: 21, aMax: 79, bMin: 11, bMax: 19, uebergang: true }),
  "2-21": (r) => sachKern("2-21", r),
};

/** Pakete, für die noch keine Bauart hinterlegt ist. */
export function fehlendeBauarten(alleIds: readonly string[]): string[] {
  return alleIds.filter((id) => !ZUORDNUNG[id]);
}
