/**
 * Die Plus-Texte in der Schreibweise einer Region (10.11.2026).
 *
 * ★ Heute ändert nur Spanisch/Latinoamérica Wörter: "Braille de ordenador" wird
 *   "Braille de computadora" (Recherche ES §E.2 Nr. 2). Alle anderen Regionen und
 *   die Vorgaben geben DENSELBEN Satz Texte zurück (gleiches Objekt - nichts wird
 *   kopiert, nichts ändert sich).
 * ★ Die Texte sind Zeichenketten, Listen, Objekte und kleine Funktionen, die
 *   Zeichenketten liefern; alles wird einmal je Region umgeschrieben und gemerkt.
 */
import { regionaleWoerter, type PlusRegion } from "../regionen";
import type { PlusTexte } from "./typ";

/** Je Textsatz einmal umgeschrieben (heute gibt es nur eine Region, die Wörter ändert). */
const gemerkt = new WeakMap<PlusTexte, PlusTexte>();

function umschreiben(wert: unknown, region: PlusRegion): unknown {
  if (typeof wert === "string") return regionaleWoerter(wert, region);
  if (typeof wert === "function") {
    const f = wert as (...a: unknown[]) => unknown;
    return (...a: unknown[]) => umschreiben(f(...a), region);
  }
  if (Array.isArray(wert)) return wert.map((w) => umschreiben(w, region));
  if (wert && typeof wert === "object") {
    return Object.fromEntries(Object.entries(wert).map(([k, w]) => [k, umschreiben(w, region)]));
  }
  return wert;
}

export function regionaleTexte(texte: PlusTexte, region: PlusRegion | null): PlusTexte {
  if (region !== "latam") return texte;
  let aus = gemerkt.get(texte);
  if (!aus) {
    aus = umschreiben(texte, region) as PlusTexte;
    gemerkt.set(texte, aus);
  }
  return aus;
}
