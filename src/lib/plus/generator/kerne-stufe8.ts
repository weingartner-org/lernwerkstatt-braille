/**
 * Plus - die Kerne der Stufe 8: reelle Zahlen, Bruchterme und der
 * Kopfrechen-Kanon.
 *
 * Dieselbe Idee wie in `kerne.ts` und `kerne-zahlbereiche.ts`: ein Kern ist
 * die nackte Aufgabe, noch ohne Form. Was `kerne-zahlbereiche.ts` schon
 * mitbringt (Quadratwurzel, Kubikwurzel, teilweises Wurzelziehen, Binome,
 * binomische Formeln, Zinseszins), wird hier NICHT nachgebaut - siehe
 * `zuordnung-stufe8.ts`. Hier stehen nur die Bauarten, die wirklich fehlten:
 * Zahlenmengen, Wurzelregeln, Näherungswerte, Bruchterme (kürzen, plus/minus,
 * mal/geteilt, Doppelbruch) und der Kopfrechen-Kanon (8-14 bis 8-20).
 *
 * ★ Der Kopfrechen-Kanon lebt vom Abstand zur glatten Zahl - deshalb bauen
 * 8-15 (Glatte Zahlen) und 8-16 (Kellner-Kniff) ihre Zahlen bewusst NAH an
 * einem Hunderter oder Tausender (höchstens 3 daneben). Ohne diese Nähe wäre
 * der Kniff kein Kniff, und das Paket würde etwas anderes üben als sein Name
 * verspricht.
 */
import { ganz, eines, zahl, LUECKE, type Operation } from "../aufgabe";
import type { Kern, Zufall } from "./kerne";

/* ------------------------------------------------------------------ */
/* Kleine Helfer - `kerne-zahlbereiche.ts` exportiert seine nicht.       */
/* ------------------------------------------------------------------ */

function ggT(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    [a, b] = [b, a % b];
  }
  return a || 1;
}

function kgV(a: number, b: number): number {
  return Math.abs(a * b) / ggT(a, b);
}

function istQuadratzahl(n: number): boolean {
  const w = Math.round(Math.sqrt(n));
  return w * w === n;
}

/* ================================================================== */
/* 8-01 Zahlenmengen N, Z, Q, I und R                                    */
/* ================================================================== */

export interface ZahlenmengeP {
  max: number;
}

const NICHT_QUADRATE = [2, 3, 5, 6, 7, 8, 10, 11, 12, 13, 14, 15, 17, 18, 19, 20] as const;

const MENGEN_NAMEN: Record<string, string> = {
  N: "natürliche", Z: "ganze", Q: "rationale", I: "irrationale", R: "reelle",
};

/**
 * Eine Zahl aus einer von vier Kategorien (natürlich, negativ, Bruch,
 * Wurzel aus einer Nicht-Quadratzahl) - dann die Frage, ob sie zu einer der
 * fünf Mengen gehört. Die Antwort steckt in der Kategorie selbst, damit der
 * Test sie unabhängig aus der Angabe herleiten kann.
 */
export function zahlenmenge(rng: Zufall, p: ZahlenmengeP): Kern {
  const max = Math.max(10, p.max);
  const kategorie = eines(rng, ["natuerlich", "negativ", "bruch", "irrational"] as const);
  let text: string;
  let inN: boolean, inZ: boolean, inQ: boolean, inI: boolean;

  if (kategorie === "natuerlich") {
    const n = ganz(rng, 1, max);
    text = String(n);
    inN = true; inZ = true; inQ = true; inI = false;
  } else if (kategorie === "negativ") {
    const n = ganz(rng, 1, max);
    text = String(-n);
    inN = false; inZ = true; inQ = true; inI = false;
  } else if (kategorie === "bruch") {
    const n = ganz(rng, 2, Math.max(3, Math.min(9, max)));
    const z = ganz(rng, 1, n - 1);
    text = `${z}/${n}`;
    inN = false; inZ = false; inQ = true; inI = false;
  } else {
    const w = eines(rng, NICHT_QUADRATE);
    text = `'w(${w})`;
    inN = false; inZ = false; inQ = false; inI = true;
  }

  const menge = eines(rng, ["N", "Z", "Q", "I", "R"] as const);
  const antwort = menge === "N" ? inN : menge === "Z" ? inZ : menge === "Q" ? inQ : menge === "I" ? inI : true;
  const angabe = `Ist ${text} eine ${MENGEN_NAMEN[menge]} Zahl?`;
  return { sorte: "direkt", op: "zahlen", angabe, loesung: antwort ? "ja" : "nein", zahlen: [] };
}

/* ================================================================== */
/* 8-05 Rechenregeln für Wurzeln                                        */
/* ================================================================== */

export interface WurzelRegelP {
  zahlMax: number;
}

/**
 * Produkt und Quotient unter der Wurzel dürfen auseinandergezogen werden,
 * die Summe NICHT - das ist der klassische Fehler, den dieses Paket prüft.
 * Produkt und Quotient kommen mal richtig, mal mit einer falschen Zahl
 * (Summe statt Produkt/Quotient); die Summen-Behauptung ist immer falsch.
 */
export function wurzelregel(rng: Zufall, p: WurzelRegelP): Kern {
  const max = Math.max(4, p.zahlMax);
  const art = eines(rng, ["produkt", "quotient", "summe"] as const);

  if (art === "summe") {
    const a = ganz(rng, 1, max);
    const b = ganz(rng, 1, max);
    const angabe = `'w(${a}) +'w(${b}) ='w(${a + b}) - stimmt das?`;
    return { sorte: "direkt", op: "wurzel", angabe, loesung: "nein", zahlen: [] };
  }

  const stimmt = rng() < 0.5;
  if (art === "produkt") {
    const a = ganz(rng, 2, max);
    const b = ganz(rng, 2, max);
    const richtig = a * b;
    let falsch = a + b;
    if (falsch === richtig) falsch = richtig + 1;
    const gezeigt = stimmt ? richtig : falsch;
    const angabe = `'w(${a}) *'w(${b}) ='w(${gezeigt}) - stimmt das?`;
    return { sorte: "direkt", op: "wurzel", angabe, loesung: stimmt ? "ja" : "nein", zahlen: [] };
  }

  // Quotient: b teilt a, damit die Wurzel glatt aufgeht.
  const b = ganz(rng, 2, Math.max(2, Math.floor(max / 2)));
  const k = ganz(rng, 2, Math.max(2, Math.floor(max / b)));
  const a = b * k;
  const richtig = k;
  let falsch = a + b;
  if (falsch === richtig) falsch = richtig + 1;
  const gezeigt = stimmt ? richtig : falsch;
  const angabe = `'w(${a}) /'w(${b}) ='w(${gezeigt}) - stimmt das?`;
  return { sorte: "direkt", op: "wurzel", angabe, loesung: stimmt ? "ja" : "nein", zahlen: [] };
}

/* ================================================================== */
/* 8-06 Rechnen mit Näherungswerten                                     */
/* ================================================================== */

export interface NaeherungswertP {
  radikandMax: number;
}

/**
 * ★★★★★ RUNDEN HEISST: EINE ZAHL RUNDEN, DIE SCHON DASTEHT.
 *
 * ⚠️⚠️ Bis zum 23.09.2026 stand hier `'w(57) rund auf zwei Nachkommastellen`.
 * Um das zu runden, muss man die Wurzel erst auf drei Stellen ausrechnen -
 * mit dem Rechner. Johannes am 23.09.: „Wir wollen keine rechnungen für den
 * taschenrechner … in der 8. Klasse macht man das mit dem Rechner."
 *
 * ★★★ Der Stoffplan verlangt für 8-06 „Ergebnisse auf eine geforderte
 * Stellenzahl runden" - und genau das ist im Kopf zu machen, sobald die Zahl
 * dasteht: `3,847 rund auf eine Nachkommastelle = 3,8`. Die zweite Fassung
 * schätzt eine Wurzel zwischen zwei ganzen Zahlen ein; auch das ist ein
 * Näherungswert, und auch den findet man im Kopf (49 und 64 kennt man).
 */
export function naeherungswert(rng: Zufall, p: NaeherungswertP): Kern {
  const max = Math.max(10, p.radikandMax);
  /**
   * ⚠️ GERUNDET WIRD AUF EINE STELLE ODER AUF GANZE ZAHLEN, nie auf zwei.
   *
   * Auf zwei Stellen zu runden hiesse, eine Zahl mit DREI Nachkommastellen
   * hinzuschreiben - und `75,608` ist auf der Braillezeile von einer Zahl mit
   * Tausenderpunkt nicht zu unterscheiden. Plus schreibt keine
   * Tausendertrennung, und ein Wächter hält das fest; er hat genau das hier
   * gefangen.
   */
  const aufGanze = rng() < 0.5;
  const stellen = 2;
  const ganzerTeil = ganz(rng, 1, 99);
  const schwanz = ganz(rng, 1, 99);
  const wert = ganzerTeil + schwanz / 100;
  const nachkomma = aufGanze ? 0 : 1;
  const faktor = 10 ** nachkomma;
  const gerundet = Math.round(wert * faktor + Number.EPSILON) / faktor;
  const stellenText = aufGanze ? "ganze Zahlen" : "eine Nachkommastelle";
  let radikand = ganz(rng, 2, max);
  for (let v = 0; v < 200 && istQuadratzahl(radikand); v++) radikand = ganz(rng, 2, max);
  const untere = Math.floor(Math.sqrt(radikand));
  return {
    sorte: "direkt", op: "zahlen",
    angabe: `${zahl(wert, stellen)} rund auf ${stellenText} =`,
    loesung: zahl(gerundet, nachkomma),
    auchRichtig: [zahl(gerundet)],
    zahlen: [],
    varianten: [{
      angabe: `Zwischen welchen Zahlen liegt 'w(${radikand})?`,
      loesung: `${untere} und ${untere + 1}`,
      auchRichtig: [`${untere}, ${untere + 1}`, `${untere} ${untere + 1}`],
    }],
  };
}

/* ================================================================== */
/* 8-09 Bruchterme kürzen                                               */
/* ================================================================== */

export interface BruchtermKuerzenP {
  koeffMax: number;
  variablen: readonly string[];
}

/** Zähler und Nenner tragen denselben Variablenfaktor - er kürzt sich weg. */
export function bruchtermKuerzen(rng: Zufall, p: BruchtermKuerzenP): Kern {
  const v = eines(rng, p.variablen);
  const c1 = ganz(rng, 2, Math.max(3, p.koeffMax));
  let c2 = ganz(rng, 2, Math.max(3, p.koeffMax));
  if (c2 === c1) c2 = c1 === p.koeffMax ? c1 - 1 : c1 + 1;
  const g = ggT(c1, c2);
  const zGek = c1 / g;
  const nGek = c2 / g;
  const angabe = `${c1}${v}/${c2}${v} =`;
  const loesung = nGek === 1 ? String(zGek) : `${zGek}/${nGek}`;
  return { sorte: "direkt", op: "term", angabe, loesung, zahlen: [] };
}

/* ================================================================== */
/* 8-10 Bruchterme addieren und subtrahieren                            */
/* ================================================================== */

export type BruchtermAddSubOp = "plus" | "minus";

export interface BruchtermAddSubP {
  kMax: number;
  nMax: number;
  variablen: readonly string[];
}

/** Gleichnamig machen über das kgV der Nenner, dann Zähler verrechnen. */
export function bruchtermAddSub(rng: Zufall, op: BruchtermAddSubOp, p: BruchtermAddSubP): Kern {
  const v = eines(rng, p.variablen);
  for (let versuch = 0; versuch < 50; versuch++) {
    let k1 = ganz(rng, 2, Math.max(3, p.kMax));
    let k2 = ganz(rng, 2, Math.max(3, p.kMax));
    if (k1 === k2) continue;
    let n1 = ganz(rng, 1, Math.max(2, p.nMax));
    let n2 = ganz(rng, 1, Math.max(2, p.nMax));
    const L = kgV(k1, k2);
    let auf1 = n1 * (L / k1);
    let auf2 = n2 * (L / k2);
    if (op === "minus" && auf1 < auf2) {
      [n1, k1, auf1, n2, k2, auf2] = [n2, k2, auf2, n1, k1, auf1];
    }
    const ergRaw = op === "plus" ? auf1 + auf2 : auf1 - auf2;
    if (ergRaw === 0) continue;
    const g = ggT(Math.abs(ergRaw), L);
    const ergZ = ergRaw / g;
    const ergN = L / g;
    const zeichen = op === "plus" ? "+" : "-";
    const angabe = `${n1}/${k1}${v} ${zeichen}${n2}/${k2}${v} =`;
    const loesung = ergN === 1 ? `${ergZ}${v}` : `${ergZ}/${ergN}${v}`;
    return { sorte: "direkt", op: "term", angabe, loesung, zahlen: [] };
  }
  // Ersatz - in der Praxis nie gebraucht (50 Versuche reichen immer).
  return { sorte: "direkt", op: "term", angabe: `1/2${v} +1/3${v} =`, loesung: `5/6${v}`, zahlen: [] };
}

/* ================================================================== */
/* 8-11 Bruchterme multiplizieren und dividieren                        */
/* ================================================================== */

export type BruchtermMalDivOp = "mal" | "geteilt";

export interface BruchtermMalDivP {
  koeffMax: number;
  kMax: number;
  variablen: readonly string[];
}

/**
 * (a*v)/k1 mal k2/v, oder (a*v)/k1 durch v/k2 - beides läuft über den
 * Kehrwert auf dieselbe Formel hinaus: die Variable kürzt sich weg.
 */
export function bruchtermMalDiv(rng: Zufall, op: BruchtermMalDivOp, p: BruchtermMalDivP): Kern {
  const v = eines(rng, p.variablen);
  const a = ganz(rng, 1, Math.max(2, p.koeffMax));
  const k1 = ganz(rng, 2, Math.max(3, p.kMax));
  const k2 = ganz(rng, 2, Math.max(3, p.kMax));
  const zeichen = op === "mal" ? "*" : "/";
  const zweiterBruch = op === "mal" ? `${k2}/${v}` : `${v}/${k2}`;
  const angabe = `(${a}${v})/${k1} ${zeichen}(${zweiterBruch}) =`;
  const ergRaw = a * k2;
  const g = ggT(ergRaw, k1);
  const ergZ = ergRaw / g;
  const ergN = k1 / g;
  const loesung = ergN === 1 ? String(ergZ) : `${ergZ}/${ergN}`;
  return { sorte: "direkt", op: "term", angabe, loesung, zahlen: [] };
}

/* ================================================================== */
/* 8-12 Doppelbrüche vereinfachen                                       */
/* ================================================================== */

export interface DoppelbruchP {
  max: number;
}

/** (a/b)/(c/d) - der Hauptbruchstrich zuerst: durch den zweiten Bruch teilen. */
export function doppelbruch(rng: Zufall, p: DoppelbruchP): Kern {
  const max = Math.max(3, p.max);
  // ★ Kein Bruch, der 1 ist: `(7/7)/(8/8)` fragt nichts ab. Gemessen am
  // 23.09.2026 beim Mitlesen.
  const a = ganz(rng, 1, max);
  let b = ganz(rng, 2, max);
  while (b === a) b = ganz(rng, 2, max);
  const c = ganz(rng, 1, max);
  let d = ganz(rng, 2, max);
  while (d === c) d = ganz(rng, 2, max);
  const zaehlerRaw = a * d;
  const nennerRaw = b * c;
  const g = ggT(zaehlerRaw, nennerRaw);
  const ergZ = zaehlerRaw / g;
  const ergN = nennerRaw / g;
  const angabe = `(${a}/${b})/(${c}/${d}) =`;
  const loesung = ergN === 1 ? String(ergZ) : `${ergZ}/${ergN}`;
  return { sorte: "direkt", op: "term", angabe, loesung, zahlen: [] };
}

/* ================================================================== */
/* 8-14 Kopfrechnen mit großen Zahlen: Nullen anhängen und kürzen       */
/* ================================================================== */

export interface KopfrechnenGrossP {
  max: number;
}

/** Runde Zahlen: Nullen weglassen, rechnen, Nullen wieder anhängen. */
export function kopfrechnenGross(rng: Zufall, p: KopfrechnenGrossP): Kern {
  const max = Math.max(1000, p.max);
  const art = eines(rng, ["plusminus", "geteilt"] as const);

  if (art === "geteilt") {
    const kd = eines(rng, [1, 2] as const);
    const dd = ganz(rng, 2, 9);
    const divisor = dd * 10 ** kd;
    const quotient = ganz(rng, 2, 99);
    const dividend = divisor * quotient;
    return { sorte: "rechnung", op: "geteilt", a: dividend, b: divisor, ergebnis: quotient };
  }

  const kMax = Math.max(2, Math.min(4, Math.floor(Math.log10(max / 98))));
  const k = ganz(rng, 2, kMax);
  const da = ganz(rng, 2, 98);
  const db = ganz(rng, 2, 98);
  const a = da * 10 ** k;
  const b = db * 10 ** k;
  // ★ Die Summe bleibt im Zahlenraum (gemessen 23.09.2026: `290000 +980000`
  // bei einer Million). Passt sie nicht, wird es eine Minusaufgabe.
  const op = a + b > max ? "minus" : eines(rng, ["plus", "minus"] as const);
  if (op === "minus" && b > a) return { sorte: "rechnung", op: "minus", a: b, b: a, ergebnis: b - a };
  const ergebnis = op === "plus" ? a + b : a - b;
  return { sorte: "rechnung", op, a, b, ergebnis };
}

/* ================================================================== */
/* 8-15 Glatte Zahlen: auf die glatte Zahl runden und ausgleichen       */
/* ================================================================== */

export interface GlatteZahlenP {
  max: number;
}

/** Eine der beiden Zahlen liegt höchstens 3 von einem Hunderter/Tausender weg. */
export function glatteZahlen(rng: Zufall, p: GlatteZahlenP): Kern {
  const max = Math.max(200, p.max);
  const stufe = eines(rng, [100, 1000] as const);
  const vielfache = Math.max(1, Math.floor(max / stufe));
  const glatt = stufe * ganz(rng, 1, vielfache);
  const versatz = ganz(rng, 1, 3) * eines(rng, [1, -1] as const);
  let a = glatt + versatz;
  if (a < 1) a = glatt + Math.abs(versatz);
  if (a > max) a = glatt - Math.abs(versatz);

  const bMax = Math.max(20, Math.floor(max / 3));
  const b = ganz(rng, 10, bMax);
  // ★ Die Summe bleibt im Zahlenraum. Gemessen am 23.09.2026: `94098 +32947`
  // im Zahlenraum bis 100000. Passt sie nicht, wird es eine Minusaufgabe.
  const op = a + b > max ? "minus" : eines(rng, ["plus", "minus"] as const);
  if (op === "minus" && b > a) return { sorte: "rechnung", op: "minus", a: b, b: a, ergebnis: b - a };
  const ergebnis = op === "plus" ? a + b : a - b;
  return { sorte: "rechnung", op, a, b, ergebnis };
}

/* ================================================================== */
/* 8-16 Der Kellner-Kniff: über die Zehnerbrücke ergänzen               */
/* ================================================================== */

export interface KellnerKniffP {
  max: number;
}

/** Der Subtrahend liegt knapp unter einem Hunderter/Tausender - ergänzen
 * ist klar kürzer als schriftlich abziehen. */
export function kellnerKniff(rng: Zufall, p: KellnerKniffP): Kern {
  const max = Math.max(200, p.max);
  const stufe = eines(rng, [100, 1000] as const);
  const vielfache = Math.max(1, Math.floor(max / stufe));
  const glatt = stufe * ganz(rng, 1, vielfache);
  const versatz = ganz(rng, 1, 3);
  const b = Math.max(1, glatt - versatz);
  // ★ Auch der Minuend bleibt im Zahlenraum (gemessen 23.09.2026: `113319
  // -95997` im Zahlenraum bis 100000).
  const zusatz = ganz(rng, 10, Math.max(10, Math.min(Math.floor(max / 4), max - b)));
  const a = Math.min(b + zusatz, max);
  return { sorte: "rechnung", op: "minus", a, b, ergebnis: a - b };
}

/* ================================================================== */
/* 8-17 Geldbeträge überschlagen                                        */
/* ================================================================== */

export interface GeldUeberschlagP {
  anzahlMin: number;
  anzahlMax: number;
  euroMax: number;
}

/** Drei bis fünf Preise mit Cent-Beträgen, auf ganze Euro überschlagen. */
export function geldUeberschlag(rng: Zufall, p: GeldUeberschlagP): Kern {
  const ziel = ganz(rng, Math.max(3, p.anzahlMin), Math.max(3, p.anzahlMax));
  const preise: number[] = [];
  for (let i = 0; i < ziel; i++) {
    const euro = ganz(rng, 1, Math.max(2, p.euroMax));
    const cent = ganz(rng, 0, 99);
    const preis = Math.round((euro + cent / 100) * 100) / 100;
    const probe = [...preise, preis].map((x) => zahl(x, 2)).join("; ");
    if (probe.length > 34) break;
    preise.push(preis);
  }
  if (preise.length < 3) preise.push(1.5, 2.5, 3.5);
  const zeile = preise.map((x) => zahl(x, 2)).join("; ");
  const ueberschlag = preise.reduce((s, x) => s + Math.round(x), 0);
  // ★ Die Frage in Worten - „rund =" sagte einem Kind nicht, was gefragt ist.
  const angabe = `${zeile}\nUngefähr wie viel Euro zusammen?`;
  // ★ Ein Überschlag hat keine einzige richtige Zahl. Es gilt alles zwischen
  // „jeder Preis abgerundet" und „jeder Preis aufgerundet" - darin liegen die
  // genaue Summe und jede vernünftige Rundung. Gemessen am 23.09.2026: nur
  // die Summe der gerundeten Preise galt.
  const unten = preise.reduce((s, x) => s + Math.floor(x), 0);
  const oben = preise.reduce((s, x) => s + Math.ceil(x), 0);
  return {
    sorte: "direkt", eigeneArt: "ueberschlag", op: "gemischt", angabe, loesung: String(ueberschlag),
    bereich: [unten, oben], zahlen: [],
  };
}

/* ================================================================== */
/* 8-18 Größen schätzen und umrechnen                                   */
/* ================================================================== */

export interface GroesseUmrechnenP {
  wertMax: number;
}

const GROESSEN_EINHEITEN = [
  { klein: "g", gross: "kg", faktor: 1000 },
  { klein: "ml", gross: "l", faktor: 1000 },
  { klein: "cm", gross: "m", faktor: 100 },
  { klein: "m", gross: "km", faktor: 1000 },
] as const;

/** Eine Größe in die Nachbareinheit umrechnen - in beide Richtungen. */
export function groesseUmrechnen(rng: Zufall, p: GroesseUmrechnenP): Kern {
  const wertMax = Math.max(20, p.wertMax);
  const e = eines(rng, GROESSEN_EINHEITEN);
  const richtung = eines(rng, ["hoch", "runter"] as const);

  if (richtung === "hoch") {
    const kleinWert = ganz(rng, 1, wertMax);
    const grossWert = kleinWert / e.faktor;
    const angabe = `${kleinWert} ${e.klein} = ${LUECKE} ${e.gross}`;
    return { sorte: "direkt", eigeneArt: "umwandeln", op: "gemischt", angabe, loesung: zahl(grossWert), zahlen: [] };
  }

  const grossMax = Math.max(2, Math.floor(wertMax / e.faktor));
  const grossWert = ganz(rng, 1, grossMax);
  const kleinWert = grossWert * e.faktor;
  const angabe = `${grossWert} ${e.gross} = ${LUECKE} ${e.klein}`;
  return { sorte: "direkt", eigeneArt: "umwandeln", op: "gemischt", angabe, loesung: zahl(kleinWert), zahlen: [] };
}

/* ================================================================== */
/* 8-19 Wie rechnest du das? - Strategie wählen                        */
/* ================================================================== */

export interface StrategieKandidatP {
  max: number;
}

/** Ein Kandidat aus 8-14, 8-15 oder 8-16 - noch ohne Form (Strategiewahl). */
export function strategieKandidat(rng: Zufall, p: StrategieKandidatP): Kern {
  const wahl = ganz(rng, 1, 3);
  if (wahl === 1) return kopfrechnenGross(rng, { max: p.max });
  if (wahl === 2) return glatteZahlen(rng, { max: p.max });
  return kellnerKniff(rng, { max: p.max });
}

/* ================================================================== */
/* 8-20 Sachaufgaben Stufe 8                                            */
/* ================================================================== */

export interface SachaufgabeP {
  anzahlWerte: number;
  wertMax: number;
}

/** Mehrere Beträge, die Summe gefragt - noch ohne Form (sach/fermi). */
export function sachaufgabe(rng: Zufall, p: SachaufgabeP): Kern {
  const anzahl = Math.max(3, p.anzahlWerte);
  const werte = Array.from({ length: anzahl }, () => ganz(rng, 1, Math.max(10, p.wertMax)));
  const summe = werte.reduce((s, w) => s + w, 0);
  const angabe = `${werte.join(" + ")} =`;
  return { sorte: "direkt", op: "gemischt", angabe, loesung: String(summe), zahlen: werte };
}

export type { Operation };
