/**
 * Klangwelten — die thematische Gruppierung der Klangpunkte-Kapitel.
 *
 * Das KLANG_ETAPPEN-Array bleibt eine flache, append-only Liste (die ersten 14
 * Einträge kp1–kp14 sind der eingefrorene Ur-Lernpfad); die didaktische
 * REIHENFOLGE und Gruppierung lebt HIER — wie BASIS_IDS & Co. in
 * lib/braille/areas.ts. Kapitel sind IMMER frei wählbar (kein Freischalt-Gate,
 * Johannes 03.07.); die Welten-Reihenfolge ist die Empfehlung.
 *
 * Die Nummern sind kanonisch aus dem Gesamtkonzept (KONZEPT-Klangpunkte-
 * Eigenstaendig-2026-07-08.md §5): 1 Ohrenspitzer · 2 Notenwerkstatt ·
 * 3 Kreuz & Lage · 4 Ausdruck · 5 Formenbau · 6 Zusammenklang ·
 * 7 Theorie-Spielplatz · 8 Instrumentenkunde · 9 Lieder-Bühne.
 * Alle neun Welten sind gebaut (Stufe 5, 08.07.2026): Klangpunkte ist fachlich
 * vollständig — 63 Kapitel in 9 Klangwelten.
 */
import type { Etappe } from "../braille/etappen";
import { KLANG_ETAPPEN } from "./etappen";
import { klangTexte } from "./sprache";

export interface Klangwelt {
  /** Kanonische Welt-Nummer 1–9 (auch Alt+1…9). */
  nr: number;
  key: string;
  title: string;
  /** Ein-Satz-Charakter der Welt (Kapitelwahl + Ansagen). */
  blurb: string;
  /** Kapitel in didaktischer Reihenfolge. */
  etappen: Etappe[];
}

function byId(ids: string[]): Etappe[] {
  return ids
    .map((id) => KLANG_ETAPPEN.find((e) => e.id === id))
    .filter((e): e is Etappe => Boolean(e));
}

export const KLANG_WELTEN: Klangwelt[] = [
  {
    nr: 1,
    key: "ohren",
    get title() {
      return klangTexte().welten.ohren.title;
    },
    get blurb() {
      return klangTexte().welten.ohren.blurb;
    },
    etappen: byId([
      "kp1",
      "kp2",
      "kp-puls",
      "kp-lauschen-dauer",
      "kp-lauschen-dynamik",
      "kp-instrumente",
      "kp-echo",
      "kp-melodie-memory",
    ]),
  },
  {
    nr: 2,
    key: "werkstatt",
    get title() {
      return klangTexte().welten.werkstatt.title;
    },
    get blurb() {
      return klangTexte().welten.werkstatt.blurb;
    },
    etappen: byId([
      "kp3",
      "kp4",
      "kp5",
      "kp6",
      "kp7",
      "kp8",
      "kp-haltebogen",
      "kp-auftakt",
      "kp-pausen2",
    ]),
  },
  {
    nr: 3,
    key: "lage",
    get title() {
      return klangTexte().welten.lage.title;
    },
    get blurb() {
      return klangTexte().welten.lage.blurb;
    },
    etappen: byId([
      "kp9",
      "kp10",
      "kp11",
      "kp12",
      "kp-tonart",
      "kp-taktwechsel",
      "kp-schluessel",
      "kp-sechzehntel",
      "kp-triolen",
    ]),
  },
  {
    nr: 4,
    key: "ausdruck",
    get title() {
      return klangTexte().welten.ausdruck.title;
    },
    get blurb() {
      return klangTexte().welten.ausdruck.blurb;
    },
    etappen: byId([
      "kp-bindebogen",
      "kp-artikulation",
      "kp-dynamik",
      "kp-tempo",
      "kp-verzierungen1",
      "kp-verzierungen2",
      "kp-ausdruck-lied",
    ]),
  },
  {
    nr: 5,
    key: "form",
    get title() {
      return klangTexte().welten.form.title;
    },
    get blurb() {
      return klangTexte().welten.form.blurb;
    },
    etappen: byId(["kp13", "kp-braillerepeats", "kp-volten", "kp-formen"]),
  },
  {
    nr: 6,
    key: "zusammenklang",
    get title() {
      return klangTexte().welten.zusammenklang.title;
    },
    get blurb() {
      return klangTexte().welten.zusammenklang.blurb;
    },
    etappen: byId([
      "kp-intervalle1",
      "kp-intervalle2",
      "kp-intervalle3",
      "kp-akkorde1",
      "kp-akkorde2",
      "kp-inakkord",
    ]),
  },
  {
    nr: 7,
    key: "spielplatz",
    get title() {
      return klangTexte().welten.spielplatz.title;
    },
    get blurb() {
      return klangTexte().welten.spielplatz.blurb;
    },
    etappen: byId([
      "kp-tonleitern",
      "kp-quintenzirkel",
      "kp-rhythmusdiktat",
      "kp-melodiediktat",
      "kp-detektiv",
      "kp-baumeister",
      "kp-spielwiese",
      "kp-kadenzen",
      "kp-komponier",
    ]),
  },
  {
    nr: 8,
    key: "instrumente",
    get title() {
      return klangTexte().welten.instrumente.title;
    },
    get blurb() {
      return klangTexte().welten.instrumente.blurb;
    },
    etappen: byId([
      "kp-fingersatz",
      "kp-klavier",
      "kp-gesang",
      "kp-gitarre",
      "kp-generalbass",
      "kp-partitur",
      "kp-orchester",
    ]),
  },
  {
    nr: 9,
    key: "buehne",
    get title() {
      return klangTexte().welten.buehne.title;
    },
    get blurb() {
      return klangTexte().welten.buehne.blurb;
    },
    etappen: byId(["kp14", "kp-lieder2", "kp-lesekonzert", "kp-liederquiz"]),
  },
];

/** Alle Kapitel in Welten-Reihenfolge (die „Lern-Landkarte" der App). */
export const KAPITEL: Etappe[] = KLANG_WELTEN.flatMap((w) => w.etappen);

export function kapitelById(id: string): Etappe | null {
  return KAPITEL.find((e) => e.id === id) ?? null;
}

/** Flacher Index eines Kapitels in der Welten-Reihenfolge (−1 = unbekannt). */
export function kapitelIndex(id: string): number {
  return KAPITEL.findIndex((e) => e.id === id);
}

export function weltOfKapitel(id: string): Klangwelt | null {
  return KLANG_WELTEN.find((w) => w.etappen.some((e) => e.id === id)) ?? null;
}

export function weltByNr(nr: number): Klangwelt | null {
  return KLANG_WELTEN.find((w) => w.nr === nr) ?? null;
}
