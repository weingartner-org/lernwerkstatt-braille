/**
 * Plus - welches Paket der Stufe 6 welche Bauart benutzt.
 *
 * Dasselbe Muster wie `zuordnung-stufe4.ts`. Stufe 6 ist die inhaltsreichste
 * Stufe: drei Stränge nebeneinander - Teilbarkeit (6-01 bis 6-08), das
 * Bruchrechnen (6-09 bis 6-17, der Kern der Stufe) und negative Zahlen
 * (6-18, 6-19), dazu Prozent (6-20 bis 6-22) und zwei Pakete, die nur ihren
 * Kern haben, weil ihre Form (Strategiewahl, Sachaufgabe) noch nicht gebaut
 * ist (6-23, 6-24).
 *
 * ★ Fast alles kommt aus `kerne-zahlbereiche.ts` - dem fertigen
 * Werkzeugkasten. `kerne-stufe6.ts` liefert nur die vier Stücke, die dort
 * fehlten (siehe die Begründung dort).
 *
 * ★ In Stufe 6 rechnen negative Zahlen NUR mit Plus und Minus - Mal und
 * Geteilt mit negativen Zahlen kommen erst in Stufe 7 (Lehrplan). Darum wird
 * `ganzeZahlRechnung` hier ohne `operationen` aufgerufen - die Voreinstellung
 * ist genau Plus und Minus.
 *
 * ★ Stand 22.09.2026: Stufe 6 (24 Pakete) ist gebaut. Noch nicht eingehängt
 * in `zuordnung.ts`/`ZUORDNUNG` - das ist eine eigene Zusammenführung.
 */
import * as KZ from "./kerne-zahlbereiche";
import { strategieKern } from "./kerne-strategie";
import { sachKern } from "./sachaufgaben";
import * as K6 from "./kerne-stufe6";
import { eines } from "../aufgabe";
import type { Bauauftrag } from "./zuordnung";

export const ZUORDNUNG_STUFE6: Record<string, Bauauftrag> = {
  /* ---- Teilbarkeit (6-01 bis 6-08) ---- */
  "6-01": (r) => KZ.teilermenge(r, { min: 12, max: 100 }),
  "6-02": (r) => KZ.vielfachenmenge(r, { min: 2, max: 20, anzahlMax: 8 }),
  "6-03": (r) => KZ.teilbarkeitsregel(r, { regeln: [2, 5, 10], max: 1000 }),
  "6-04": (r) => KZ.teilbarkeitsregel(r, { regeln: [3, 4, 9, 25], max: 1000 }),
  "6-05": (r) => KZ.primfaktoren(r, { min: 12, max: 200 }),
  "6-06": (r) => KZ.ggtKgv(r, { anzahl: 2, max: 100, art: "ggt" }),
  "6-07": (r) => KZ.ggtKgv(r, { anzahl: 2, max: 50, art: "kgv" }),
  "6-08": (r) => KZ.ggtKgv(r, { anzahl: 3, max: 60, art: "beide" }),

  /* ---- Bruchrechnen (6-09 bis 6-17) ---- */
  "6-09": (r) => KZ.bruchRechnung(r, "plus", { nennerMax: 12, gleichnamig: true }),
  "6-10": (r) => KZ.bruchRechnung(r, "plus", { nennerMax: 12 }),
  "6-11": (r) => KZ.bruchRechnung(r, "minus", { nennerMax: 12, gleichnamig: true }),
  "6-12": (r) => KZ.bruchRechnung(r, "minus", { nennerMax: 12 }),
  "6-13": (r) => K6.bruchMalNatuerlich(r, { nennerMax: 12, faktorMax: 9 }),
  "6-14": (r) => KZ.bruchRechnung(r, "mal", { nennerMax: 12 }),
  "6-15": (r) => K6.bruchGeteiltNatuerlich(r, { nennerMax: 12, divisorMax: 9 }),
  "6-16": (r) => K6.bruchGeteiltKuerzbar(r, { nennerMax: 12 }),
  "6-17": (r) => K6.bruchVerbindung(r, { nennerMax: 8, nennerMaxAussen: 8 }),

  /* ---- Negative Zahlen (6-18, 6-19) ---- */
  "6-18": (r) =>
    r() < 0.5
      ? KZ.betragGegenzahl(r, { min: 1, max: 200 })
      : KZ.zahlenOrdnen(r, { anzahl: 4, min: 1, max: 200 }),
  // Drei Schwierigkeitsstufen nach Zahlenraum - der Stoffplan verlangt sie,
  // ohne die Grenzen festzulegen; 20/100/200 spannen den ganzen Bereich auf.
  "6-19": (r) => KZ.ganzeZahlRechnung(r, { min: 1, max: eines(r, [20, 100, 200] as const) }),

  /* ---- Prozent (6-20 bis 6-22) ---- */
  "6-20": (r) => KZ.prozentImKopf(r, { grundwertMax: 1000, teilbarkeit: r() < 0.5 ? 10 : 100 }),
  "6-21": (r) =>
    KZ.prozentRechnung(r, { gesucht: "prozentwert", grundwertMax: 5000, saetze: [5, 10, 20, 25, 50, 75] }),
  "6-22": (r) =>
    KZ.prozentRechnung(r, { gesucht: r() < 0.5 ? "grundwert" : "prozentsatz", grundwertMax: 5000 }),

  /* ---- 6-23 und 6-24: nur der Kern, die Form fehlt noch ---- */
  // "strategiewahl" und "fehler_finden" sind nicht gebaut - der Kern zeigt
  // trotzdem beide Wege, die sich lohnen: kürzen vor dem Rechnen, oder der
  // 10-Prozent-Weg im Kopf.
  "6-23": (r) => strategieKern("6-23", r, r() < 0.5 ? "strategiewahl" : "fehler_finden"),
  // "sach" ist nicht gebaut - der Kern liefert den Rechenkern einer
  // Aufteilung (Bruchanteil einer Menge) oder eines Rabatts (Prozentwert).
  "6-24": (r) => sachKern("6-24", r),
};
