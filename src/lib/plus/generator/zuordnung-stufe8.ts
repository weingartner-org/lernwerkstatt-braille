/**
 * Plus - welches Paket der Stufe 8 welche Bauart benutzt.
 *
 * Dasselbe Muster wie `zuordnung-stufe4.ts`: eine Zeile je Paket. Wo eine
 * der 36 Bauarten aus `kerne-zahlbereiche.ts` schon passt (Quadratwurzel,
 * Kubikwurzel, teilweises Wurzelziehen, Binome, binomische Formeln,
 * Zinseszins), wird sie direkt benutzt; die übrigen - Zahlenmengen,
 * Wurzelregeln, Näherungswerte, Bruchterme und der Kopfrechen-Kanon -
 * kommen aus `kerne-stufe8.ts`.
 *
 * ★ Stand 22.09.2026: Stufe 8 (20 Pakete, "Reelle Zahlen, Bruchterme und
 * der Kopfrechen-Kanon") ist gebaut. Für 8-17 bis 8-20 ist bisher nur der
 * Kern da - die Formen (ueberschlag, strategiewahl, sach, fermi, umwandeln)
 * fehlen noch in `formen.ts`, genau wie bei 4-17/4-18.
 */
import { eines } from "../aufgabe";
import { fermiKern } from "./fermi";
import { sachKern } from "./sachaufgaben";
import * as KZ from "./kerne-zahlbereiche";
import * as K8 from "./kerne-stufe8";
import type { Bauauftrag } from "./zuordnung";

export const ZUORDNUNG_STUFE8: Record<string, Bauauftrag> = {
  /* ---- 8-01 Zahlenmengen N, Z, Q, I und R ---- */
  "8-01": (r) => K8.zahlenmenge(r, { max: 60 }),

  /* ---- 8-02 Quadratwurzel ---- */
  "8-02": (r) => KZ.quadratwurzel(r, { radikandMax: 625, naeherung: true }),

  /* ---- 8-03 Kubikwurzel ---- */
  "8-03": (r) => KZ.kubikwurzel(r, { radikandMax: 1000 }),

  /* ---- 8-04 Teilweises Wurzelziehen ---- */
  "8-04": (r) => KZ.teilweisesWurzelziehen(r, { radikandMax: 200 }),

  /* ---- 8-05 Rechenregeln für Wurzeln ---- */
  "8-05": (r) => K8.wurzelregel(r, { zahlMax: 20 }),

  /* ---- 8-06 Rechnen mit Näherungswerten ---- */
  "8-06": (r) => K8.naeherungswert(r, { radikandMax: 200 }),

  /* ---- 8-07 Terme multiplizieren ---- */
  "8-07": (r) => KZ.binom(r, { koeffMax: 9, variablen: ["x", "y", "a"] }),

  /* ---- 8-08 Binomische Formeln ---- */
  "8-08": (r) => KZ.binomischeFormel(r, { koeffMax: 9, variable: eines(r, ["x", "y", "a"] as const) }),

  /* ---- 8-09 Bruchterme kürzen ---- */
  "8-09": (r) => K8.bruchtermKuerzen(r, { koeffMax: 12, variablen: ["a", "b", "x"] }),

  /* ---- 8-10 Bruchterme addieren und subtrahieren ---- */
  "8-10": (r) => K8.bruchtermAddSub(r, eines(r, ["plus", "minus"] as const), { kMax: 9, nMax: 9, variablen: ["a", "b", "x"] }),

  /* ---- 8-11 Bruchterme multiplizieren und dividieren ---- */
  "8-11": (r) => K8.bruchtermMalDiv(r, eines(r, ["mal", "geteilt"] as const), { koeffMax: 9, kMax: 9, variablen: ["a", "b", "x"] }),

  /* ---- 8-12 Doppelbrüche vereinfachen ---- */
  "8-12": (r) => K8.doppelbruch(r, { max: 12 }),

  /* ---- 8-13 Zinseszins ---- */
  "8-13": (r) => KZ.zinseszins(r, { kapitalMax: 20000, satzMax: 8, jahreMax: 10 }),

  /* ---- 8-14 Kopfrechnen mit großen Zahlen ---- */
  "8-14": (r) => K8.kopfrechnenGross(r, { max: 1000000 }),

  /* ---- 8-15 Glatte Zahlen ---- */
  "8-15": (r) => K8.glatteZahlen(r, { max: 100000 }),

  /* ---- 8-16 Der Kellner-Kniff ---- */
  "8-16": (r) => K8.kellnerKniff(r, { max: 100000 }),

  /* ---- 8-17 Geldbeträge überschlagen ---- */
  // Weder "ueberschlag" noch "strategiewahl" noch "sach" ist heute gebaut -
  // der Kern wartet auf seine Form.
  "8-17": (r) => K8.geldUeberschlag(r, { anzahlMin: 3, anzahlMax: 5, euroMax: 30 }),

  /* ---- 8-18 Größen schätzen und umrechnen ---- */
  // Weder "umwandeln" noch "fermi" ist heute gebaut - der Kern wartet auf
  // seine Form.
  "8-18": (r) => K8.groesseUmrechnen(r, { wertMax: 5000 }),

  /* ---- 8-19 Wie rechnest du das? ---- */
  // Weder "strategiewahl" noch "fehler_finden" ist heute gebaut - der Kern
  // wartet auf seine Form.
  "8-19": (r) => K8.strategieKandidat(r, { max: 100000 }),

  /* ---- 8-20 Sachaufgaben Stufe 8 ---- */
  // Weder "sach" noch "fermi" ist heute gebaut - der Kern wartet auf seine
  // Form.
  "8-20": (r) => (r() < 0.75 ? sachKern("8-20", r) : fermiKern("8-20", r)),
};
