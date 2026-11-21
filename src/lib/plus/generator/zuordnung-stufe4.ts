/**
 * Plus - welches Paket der Stufe 4 welche Bauart benutzt.
 *
 * Dasselbe Muster wie `zuordnung.ts`: eine Zeile je Paket. Wo eine der
 * vierzehn Bauarten aus `kerne.ts` passt, wird sie benutzt (4-03, 4-05);
 * die übrigen kommen aus `kerne-stufe4.ts`.
 *
 * ★ Stand 22.09.2026: Stufe 4 (18 Pakete, "Der große Zahlenraum") ist
 * gebaut. Noch nicht eingehängt in `zuordnung.ts`/`ZUORDNUNG` - das ist
 * eine eigene Zusammenführung, keine dieser Datei.
 */
import * as K from "./kerne";
import { fermiKern } from "./fermi";
import { sachKern } from "./sachaufgaben";
import * as K4 from "./kerne-stufe4";
import type { Bauauftrag } from "./zuordnung";

const EINMALEINS20BIS90 = [20, 30, 40, 50, 60, 70, 80, 90] as const;

export const ZUORDNUNG_STUFE4: Record<string, Bauauftrag> = {
  /* ---- 4-01 Stellenwert bis zur Million ---- */
  "4-01": (r) => K4.stellenwertGross(r, { min: 1000, max: 999999 }),

  /* ---- 4-02 Runden im großen Zahlenraum ---- */
  "4-02": (r) => K4.runden(r, { min: 1000, max: 999999 }),

  /* ---- 4-03 Ergänzen bis eine Million ---- */
  "4-03": (r) => K4.ergaenzenGross(r, { min: 1, max: 999999 }),

  /* ---- 4-04 Stufenzahlen mal und geteilt ---- */
  "4-04": (r) => K4.stufenzahlReihe(r, { basisMin: 2, basisMax: 900 }),

  /* ---- 4-05 Schriftlich Plus im großen Zahlenraum ---- */
  // Nur die Form "probe" ist heute gebaut - "zeilen" (das eigentliche
  // schriftliche Verfahren mit zwei bis vier Summanden) kommt später.
  "4-05": (r) => K.summe(r, { min: 0, max: 0, aMin: 1000, aMax: 500000, bMin: 1000, bMax: 499999, summeMax: 999999 }),

  /* ---- 4-06 Schriftlich Minus im großen Zahlenraum ---- */
  // Nullen im Minuenden sind Pflicht - belegtes Fehlermuster.
  "4-06": (r) => K4.differenzMitNull(r, { min: 100000, max: 999999 }),

  /* ---- 4-07 Schriftlich Mal, zweistelliger Multiplikator ---- */
  "4-07": (r) => K4.malGross(r, { aMin: 1000, aMax: 9999, bMin: 10, bMax: 99 }),

  /* ---- 4-08 Division durch eine Zehnerzahl ---- */
  "4-08": (r) => K4.teilenDurchZehnerzahl(r, { divisoren: EINMALEINS20BIS90, aMin: 1000, aMax: 9999 }),

  /* ---- 4-09 Division durch eine zweistellige Zahl ---- */
  "4-09": (r) => K4.teilenZweistellig(r, { divisorMin: 11, divisorMax: 99, dividendMin: 1000, dividendMax: 79999 }),

  /* ---- 4-10 Überschlag bei Mal und Geteilt ---- */
  // Nur "wahr_falsch" ist heute gebaut - der eigentliche Überschlag
  // (Stellenzahl schätzen, dann runden) kommt mit der Form "ueberschlag".
  "4-10": (r) => K4.grosseRechnung(r, { aMin: 100, aMax: 999, bMin: 10, bMax: 99 }),

  /* ---- 4-11 Probe bei Mal und Geteilt ---- */
  "4-11": (r) => K4.teilenZweistellig(r, { divisorMin: 11, divisorMax: 50, dividendMin: 100, dividendMax: 9999 }),

  /* ---- 4-12 Stellen-Einmaleins ---- */
  "4-12": (r) => K4.stellenEinmaleins(r, { einerMin: 2, einerMax: 9 }),

  /* ---- 4-13 Brüche anschaulich: Halbe, Viertel, Achtel ---- */
  "4-13": (r) => K4.bruchteilAnschaulich(r, { modus: "anschaulich", nenner: [2, 4, 8] }),

  /* ---- 4-14 Bruchteile von Größen ---- */
  // Nur "ergebnis" ist heute gebaut - die Sachaufgabe drumherum ("sach")
  // kommt später.
  "4-14": (r) => K4.bruchteilAnschaulich(r, { modus: "groesse", nenner: [2, 4, 8] }),

  /* ---- 4-15 Größen umwandeln ---- */
  // Nur "wahr_falsch" ist heute gebaut - "umwandeln" (die Lücke direkt
  // ausfüllen) kommt später; der Kern liefert dieselbe Angabe schon jetzt.
  "4-15": (r) => K4.groesseUmwandeln(r),

  /* ---- 4-16 Direkte Proportionalität ---- */
  // Nur "kette" ist heute gebaut - "sach" (der Text drumherum) kommt
  // später.
  "4-16": (r) => K4.proportional(r, { einheiten: [2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 25, 50], anzahlMax: 12 }),

  /* ---- 4-17 Wie rechnest du das? ---- */
  // Weder "strategiewahl" noch "fehler_finden" sind gebaut - der Kern
  // wartet auf seine Form.
  "4-17": (r) => K4.rechenstrategieKandidat(r, { min: 200, max: 400000 }),

  /* ---- 4-18 Sachaufgaben im großen Zahlenraum ---- */
  // Weder "sach" noch "fermi" sind gebaut - der Kern wartet auf seine Form.
  "4-18": (r) => (r() < 0.75 ? sachKern("4-18", r) : fermiKern("4-18", r)),
};
