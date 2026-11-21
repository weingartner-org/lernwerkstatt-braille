/**
 * Plus - welches Paket der Stufe 5 welche Bauart benutzt.
 *
 * Dasselbe Muster wie `zuordnung-stufe4.ts`. Anders als dort steckt der
 * Werkzeugkasten für Stufe 5 zum größten Teil schon in
 * `kerne-zahlbereiche.ts` (Brüche, Dezimalzahlen, Vorrangregeln) - nur
 * sechs Pakete brauchen eine eigene Bauart aus `kerne-stufe5.ts`.
 *
 * ★ Stufe 5 rechnet NICHT mit Brüchen (nur Stufe 6 tut das) - darum kommt
 * hier nirgends `bruchRechnung` vor, nur `bruchArt`, `bruchKuerzen`,
 * `bruchErweitern`, `bruchVergleichen` und `anteilVonMenge` (darstellen und
 * vergleichen, nicht berechnen).
 *
 * ★ 5-17 „Überschlag als Kontrolle" braucht keinen eigenen Kern: sein
 * Wortlaut im Stoffplan („vorgegebenes Ergebnis prüfen, auch bewusst
 * falsche") ist genau das, was die Form „probe" schon kann. Es bekommt nur
 * alle vier Rechenarten gemischt, weil sein `op` im Stoffplan „gemischt"
 * ist (5-08 bis 5-11 sind je eine einzelne Rechenart).
 *
 * ★ Stand 22.09.2026: Stufe 5 (19 Pakete) ist gebaut. Noch nicht eingehängt
 * in `zuordnung.ts`/`ZUORDNUNG` - das ist eine eigene Zusammenführung.
 */
import { eines } from "../aufgabe";
import { fermiKern } from "./fermi";
import { strategieKern } from "./kerne-strategie";
import { sachKern } from "./sachaufgaben";
import * as K5 from "./kerne-stufe5";
import * as KZ from "./kerne-zahlbereiche";
import type { Bauauftrag } from "./zuordnung";

export const ZUORDNUNG_STUFE5: Record<string, Bauauftrag> = {
  /* ---- 5-01 Stellenwert und Zahlenstrahl ---- */
  "5-01": (r) => K5.stellenwertMischVergleich(r, { ganzMax: 1000000, nachkommaMax: 3 }),

  /* ---- 5-02 Runden und Schranken ---- */
  "5-02": (r) => K5.schrankenRechnung(r, { min: 50, max: 4999 }),

  /* ---- 5-03 Vorrangregeln ohne Klammern ---- */
  // drei bis vier Glieder, wie der Stoffplan sagt; zahlMax klein genug,
  // dass auch drei Multiplikationen in Folge im Zahlenraum bis 10000 bleiben.
  // `vorrangNatuerlich` würfelt neu, falls Minus vor einem Mal-Glied ein
  // negatives Ergebnis ergäbe - Stufe 5 rechnet nicht mit negativen Zahlen.
  "5-03": (r) => K5.vorrangNatuerlich(r, { glieder: r() < 0.5 ? 3 : 4, zahlMax: 15 }),

  /* ---- 5-04 Vorrangregeln mit Klammern ---- */
  // Aufgabenpaare mit denselben Zahlen - `paar: true` erzeugt beide Zeilen.
  "5-04": (r) => K5.vorrangNatuerlich(r, { glieder: 3, zahlMax: 20, paar: true }),

  /* ---- 5-05 Rechengesetze nutzen ---- */
  "5-05": (r) => K5.rechengesetz(r, { zahlMax: 60, cMax: 12 }),

  /* ---- 5-06 Dezimalzahlen lesen und ordnen ---- */
  // Drei Fassungen: ordnen, vergleichen (mit der Falle „mehr Nachkomma-
  // stellen wirkt größer") und Nachbarzahlen an derselben Stelle.
  "5-06": (r) => K5.dezimalLesenOrdnen(r, { anzahl: 3, nachkommaMax: 3, ganzMax: 50 }),

  /* ---- 5-07 Komma verschieben ---- */
  "5-07": (r) => KZ.kommaVerschieben(r, { stufen: [10, 100, 1000], nachkommaMax: 3, ganzMax: 90 }),

  /* ---- 5-08 Plus und Minus mit Dezimalzahlen ---- */
  // `unterschiedlich: true` ist Pflicht - unterschiedlich viele Nachkomma-
  // stellen sind das belegte Fehlermuster, das dieses Paket übt.
  "5-08": (r) => KZ.dezimalRechnung(r, r() < 0.5 ? "plus" : "minus", { nachkommaMax: 3, ganzMax: 200, unterschiedlich: true }),

  /* ---- 5-09 Mal mit Dezimalzahlen ---- */
  "5-09": (r) => K5.malDezimalBegrenzt(r, { ganzMax: 20 }),

  /* ---- 5-10 Geteilt mit Dezimalzahlen ---- */
  // Ohne `divisorNachkomma`: der Divisor bleibt eine natürliche Zahl.
  "5-10": (r) => KZ.dezimalRechnung(r, "geteilt", { nachkommaMax: 2, ganzMax: 80 }),

  /* ---- 5-11 Geteilt durch eine Dezimalzahl ---- */
  "5-11": (r) => KZ.dezimalRechnung(r, "geteilt", { nachkommaMax: 2, ganzMax: 50, divisorNachkomma: eines(r, [1, 2] as const) }),

  /* ---- 5-12 Runden von Dezimalzahlen ---- */
  "5-12": (r) => KZ.dezimalRunden(r, { stellen: ["einer", "zehntel", "hundertstel"], nachkommaMax: 3, ganzMax: 90 }),

  /* ---- 5-13 Arten von Brüchen ---- */
  "5-13": (r) => KZ.bruchArt(r, { nennerMax: 20 }),

  /* ---- 5-14 Erweitern und Kürzen ---- */
  // Beide Richtungen gemischt - dasselbe Paket, zwei Bauarten.
  "5-14": (r) => (r() < 0.5
    ? KZ.bruchKuerzen(r, { nennerMax: 24, faktorMax: 6 })
    : KZ.bruchErweitern(r, { nennerMax: 24, zielNennerMax: 96 })),

  /* ---- 5-15 Brüche ordnen und vergleichen ---- */
  "5-15": (r) => KZ.bruchVergleichen(r, { nennerMax: 24 }),

  /* ---- 5-16 Anteile und Bruchteile von Größen ---- */
  // `anteilVonMenge` liefert nur eine nackte Zahl - der Stoffplan verlangt
  // eine echte Größe ("3/4 von 20 kg"), darum der eigene Kern.
  "5-16": (r) => K5.anteilVonGroesse(r, { nennerMax: 20, mengeMax: 480 }),

  /* ---- 5-17 Überschlag als Kontrolle ---- */
  "5-17": (r) => KZ.dezimalRechnung(r, eines(r, ["plus", "minus", "mal", "geteilt"] as const), { nachkommaMax: 2, ganzMax: 150, unterschiedlich: true }),

  /* ---- 5-18 Wie rechnest du das? ---- */
  // Weder "strategiewahl" noch "fehler_finden" sind gebaut - der Kern
  // wartet auf seine Form.
  // ★ Eigene Wege wie 7-19: Herausheben und Umstellen mit Dezimalzahlen.
  "5-18": (r) => strategieKern("5-18", r, r() < 0.5 ? "strategiewahl" : "fehler_finden"),

  /* ---- 5-19 Sachaufgaben mit Größen ---- */
  // Weder "sach" noch "fermi" sind gebaut - der Kern wartet auf seine Form.
  "5-19": (r) => (r() < 0.75 ? sachKern("5-19", r) : fermiKern("5-19", r)),
};
