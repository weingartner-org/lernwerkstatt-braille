/**
 * Plus - der Stoffplan als Datei.
 *
 * `stoffplan.json` ist die einzige Quelle: daraus entsteht das Word-Dokument
 * „Plus - Stoffplan" für Johannes UND die Daten, mit denen die App arbeitet.
 * Wer hier etwas ändert, ändert beides.
 *
 * 161 Pakete in acht Stufen. Jedes Paket weiß, welche Strategie es übt, in
 * welchen Formen es abgefragt wird, auf welche Fehlermuster es achtet und
 * welche Pakete vor ihm sitzen müssen.
 */
import daten from "./stoffplan.json";
import type { Aufgabenart, Operation } from "./aufgabe";
import { plusSprache } from "./aktuelleSprache";
import { PLUS_TEXTE } from "./texte";

export type PaketArt = "fakten" | "strategie" | "schriftlich" | "zahlbegriff" | "groessen" | "sach";

export interface Paket {
  /** Stabiler Schlüssel, z. B. "3-11". Ändert sich nie. */
  id: string;
  name: string;
  art: PaketArt;
  op: Operation;
  /** Zahlenraum in Worten, für Menschen. */
  zr: string;
  /** Die geübte Strategie - sie bestimmt, welche Zahlen taugen. */
  strat: string;
  /** Die Regel für den Generator, in Worten. */
  gen: string;
  /** Fehlermuster, auf die dieses Paket achtet. */
  fehler: string[];
  /** Woher die fachliche Festlegung stammt. */
  quelle: string;
  /** Das entsprechende Paket der Excel-Mappe, wenn es eines gibt. */
  alt: string | null;
  /** Aufgabenarten; die erste ist die Leitform. */
  arten: Aufgabenart[];
  /** Pakete, die vorher sitzen müssen. */
  braucht: string[];
}

export interface Stufe {
  nr: number;
  name: string;
  zahlenraum: string;
  leitidee: string;
  pakete: Paket[];
}

export interface Fehlermuster {
  name: string;
  erkennung: string;
  antwort: string;
}

interface Plan {
  version: string;
  stand: string;
  app: string;
  aufstiegsregeln: Record<PaketArt, string>;
  fehlermuster: Record<string, Fehlermuster>;
  aufgabenarten: Record<string, string>;
  stufen: Stufe[];
}

export const STOFFPLAN = daten as unknown as Plan;

export const STUFEN: Stufe[] = STOFFPLAN.stufen;

/** Alle Pakete, flach, in Planreihenfolge. */
export const PAKETE: Paket[] = STUFEN.flatMap((s) => s.pakete);

const nachId = new Map(PAKETE.map((p) => [p.id, p]));

/*
 * ★★ Der Stoffplan in anderen Sprachen (Bauplan 2026-11-06 §5 Nr. 4).
 *
 * `stoffplan.json` bleibt die einzige Quelle für Inhalte und Stufen - deutsch,
 * mit österreichischen Namen. Für eine andere Sprache gilt:
 *  - nur die Pakete, deren Aufgaben in dieser Sprache entstehen UND im Mathe-Code
 *    der Sprache geschrieben werden können (`erlaubePakete`, gemessen im
 *    Generator - nicht behauptet),
 *  - die Namen der Stufen und Pakete aus `texte/<sprache>.ts` (`stoff`); ein Paket
 *    ohne Namen in dieser Sprache wird nicht angeboten - nie ein deutscher Name,
 *  - Voraussetzungen (`braucht`) nur auf angebotene Pakete.
 * Deutsch bleibt Byte für Byte der Plan selbst.
 */
let erlaubnis: ((id: string) => boolean) | null = null;
let misst = false;

/**
 * Während der Generator misst, welche Pakete eine Sprache kann, sieht er den
 * rohen Plan - sonst fragte die Messung sich selbst.
 */
export function messeMitRohplan<T>(fn: () => T): T {
  const vorher = misst;
  misst = true;
  try { return fn(); } finally { misst = vorher; }
}

/** Der Generator meldet sich hier an (er kennt die Messung, der Stoffplan nicht). */
export function setzePaketErlaubnis(fn: ((id: string) => boolean) | null): void {
  erlaubnis = fn;
}

function stoffTexte() {
  return PLUS_TEXTE[plusSprache()]?.stoff;
}

function erlaubt(id: string): boolean {
  return !!stoffTexte()?.pakete[id] && (erlaubnis ? erlaubnis(id) : false);
}

function inSprache(p: Paket): Paket {
  const st = stoffTexte();
  if (!st) return p;
  return { ...p, name: st.pakete[p.id] ?? p.name, braucht: p.braucht.filter(erlaubt) };
}

/** Die Stufen in der aktuellen Sprache - für de der Plan selbst, sonst nur, was angeboten wird. */
export function stufenFuerSprache(): Stufe[] {
  if (plusSprache() === "de") return STUFEN;
  const st = stoffTexte();
  if (!st) return [];
  return STUFEN.flatMap((s) => {
    const pakete = s.pakete.filter((p) => erlaubt(p.id)).map(inSprache);
    const t = st.stufen[s.nr];
    return pakete.length && t ? [{ ...s, name: t.name, zahlenraum: t.zahlenraum, leitidee: t.leitidee, pakete }] : [];
  });
}

export function paket(id: string): Paket {
  const p = nachId.get(id);
  if (!p) throw new Error(`Paket ${id} steht nicht im Stoffplan`);
  return plusSprache() === "de" || misst ? p : inSprache(p);
}

export function paketeDerStufe(nr: number): Paket[] {
  const s = STUFEN.find((x) => x.nr === nr);
  if (!s) throw new Error(`Stufe ${nr} gibt es nicht`);
  return plusSprache() === "de" || misst ? s.pakete : s.pakete.filter((p) => erlaubt(p.id)).map(inSprache);
}

/** Zu welcher Stufe gehört ein Paket? */
export function stufeVon(id: string): number {
  return Number(id.split("-")[0]);
}
