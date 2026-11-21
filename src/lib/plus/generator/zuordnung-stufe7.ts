/**
 * Plus - welches Paket der Stufe 7 welche Bauart benutzt.
 *
 * Dasselbe Muster wie `zuordnung-stufe4.ts`. Stufe 7 („jetzt wird das
 * Rechnen allgemein") braucht fast nur den Werkzeugkasten aus
 * `kerne-zahlbereiche.ts` - nur für Gleichungen, die Vorrang-Aufgabe mit
 * Potenz und die Prozent-Änderung kommt eigener Bau aus `kerne-stufe7.ts`.
 *
 * ★ Stand 22.09.2026: Stufe 7 (20 Pakete) ist gebaut. Noch nicht eingehängt
 * in `zuordnung.ts`/`ZUORDNUNG` - das ist eine eigene Zusammenführung, keine
 * dieser Datei.
 */
import * as K from "./kerne-zahlbereiche";
import { strategieKern } from "./kerne-strategie";
import { sachKern } from "./sachaufgaben";
import * as K7 from "./kerne-stufe7";
import type { Bauauftrag } from "./zuordnung";

export const ZUORDNUNG_STUFE7: Record<string, Bauauftrag> = {
  /* ---- Rationale Zahlen (7-01 bis 7-04) ---- */
  // 7-01: Ordnen UND Betrag/Gegenzahl - sonst zeigt das Paket immer
  // dieselbe Fragestellung.
  "7-01": (r) => (r() < 0.5
    ? K.zahlenOrdnen(r, { anzahl: 5, min: 1, max: 40 })
    : K.betragGegenzahl(r, { min: 1, max: 40 })),
  // ★ Ab hier kommen Mal und Geteilt mit negativen Zahlen dazu - in Stufe 6
  // gab es nur Plus und Minus. Beide Vorzeichen je Zahl, unabhängig
  // voneinander gewürfelt, decken alle vier Kombinationen ab.
  "7-02": (r) => K.ganzeZahlRechnung(r, { min: 1, max: 12, operationen: ["mal"] }),
  "7-03": (r) => K.ganzeZahlRechnung(r, { min: 1, max: 12, operationen: ["geteilt"] }),
  "7-04": (r) => K.ganzeZahlRechnung(r, { min: 1, max: 12, operationen: ["plus", "minus", "mal", "geteilt"] }),

  /* ---- Potenzen (7-05 bis 7-11) ---- */
  "7-05": (r) => K.potenz(r, { basisMin: 2, basisMax: 9, exponentMin: 2, exponentMax: 4 }),
  "7-06": (r) => K.potenz(r, { basisMin: 2, basisMax: 12, exponentMin: 2, exponentMax: 3 }),
  // ★ Gerade UND ungerade Exponenten müssen vorkommen - daran hängt die
  // Vorzeichenregel bei negativer Basis.
  "7-07": (r) => K.potenz(r, { basisMin: 2, basisMax: 9, exponentMin: 2, exponentMax: 5, negativErlaubt: true }),
  "7-08": (r) => K7.potenzBruchDezimal(r, { exponentMax: 3 }),
  "7-09": (r) => K.potenzRegel(r, { basisMin: 2, basisMax: 9, exponentMax: 5 }),
  "7-10": (r) => K.zehnerpotenz(r, { exponentMin: 1, exponentMax: 6, richtung: "beide" }),
  "7-11": (r) => K7.vorrangMitPotenz(r, { zahlMax: 9, basisMax: 9 }),

  /* ---- Terme (7-12 bis 7-14) ---- */
  "7-12": (r) => K.termZusammenfassen(r, { variablen: ["x", "y"], gliederMax: 4, koeffMax: 9 }),
  // 7-13: fängt mit zwei Klammergliedern an (ein Vorzeichenwechsel), manche
  // Aufgaben steigern auf drei.
  "7-13": (r) => K.klammerAufloesen(r, { gliederMax: r() < 0.5 ? 2 : 3, koeffMax: 9, variablen: ["x", "y"] }),
  "7-14": (r) => K.ausmultiplizieren(r, { koeffMax: 9, gliederMax: 3, variablen: ["x", "y"], richtung: "beide" }),

  /* ---- Gleichungen (7-15) ---- */
  "7-15": (r) => K7.gleichungLoesen(r, { koeffMax: 9 }),

  /* ---- Verhältnisse (7-16) ---- */
  "7-16": (r) => (r() < 0.5 ? K.verhaeltnisKuerzen(r, { max: 180 }) : K.massstab(r, { mMax: 5000 })),

  /* ---- Prozent und Zinsen (7-17, 7-18) ---- */
  "7-17": (r) => K7.prozentAenderung(r, { grundwertMax: 1000 }),
  "7-18": (r) => K.zinsen(r, { kapitalMax: 5000, satzMax: 8 }),

  /* ---- 7-19 Strategiewahl, 7-20 Sachaufgaben ---- */
  // Weder "strategiewahl"/"fehler_finden" (7-19) noch "sach" (7-20) sind
  // gebaut - die Kerne warten auf ihre Form, wie schon in Stufe 4.
  "7-19": (r) => strategieKern("7-19", r, r() < 0.5 ? "strategiewahl" : "fehler_finden"),
  "7-20": (r) => sachKern("7-20", r),
};
