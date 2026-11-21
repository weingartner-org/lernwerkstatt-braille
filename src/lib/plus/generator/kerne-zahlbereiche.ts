/**
 * Plus - die Kerne für die Zahlbereiche der Sekundarstufe (Stufe 5 bis 8).
 *
 * Dieselbe Idee wie in `kerne.ts`: ein Kern ist die nackte Aufgabe, noch ohne
 * Form. Anders als in der Grundstufe tragen die meisten Kerne hier ihre
 * Angabe schon fertig (Sorte "direkt") - Brüche, Prozente, Potenzen, Wurzeln
 * und Terme lassen sich nicht als zwei bloße Zahlen mit einem Rechenzeichen
 * schreiben. Wo eine Rechnung mit zwei Zahlen vorliegt (Dezimalzahlen), wird
 * die Sorte "rechnung" benutzt - dafür gibt es die Formen aus `formen.ts`
 * bereits fertig (Ergebnis, Lücke, Probe, Folge, Kette, Mauer).
 *
 * ★ Ganze Zahlen (negative Zahlen) benutzen bewusst NICHT die Sorte
 * "rechnung": eine zweite Zahl mit eigenem Vorzeichen direkt hinter dem
 * Rechenzeichen ("5 +-3 =") liest sich als doppeltes Zeichen. Die adaptierten
 * Bücher setzen die zweite Zahl in diesem Fall in Klammer ("5 +(-3) ="), wie
 * es die Schreibweise auch für Klammern um Teilausdrücke vorsieht.
 */
import { LUECKE, eines, gemischt, ganz, zahl } from "../aufgabe";
import type { Kern, Zufall } from "./kerne";

/* ------------------------------------------------------------------ */
/* Kleine Helfer                                                        */
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

/** Erzeugt Kandidaten, bis einer passt - sonst der Ersatz. Wie in kerne.ts. */
function versuche<T>(erzeuge: () => T, passt: (kandidat: T) => boolean, ersatz: T): T {
  for (let v = 0; v < 200; v++) {
    const k = erzeuge();
    if (passt(k)) return k;
  }
  return ersatz;
}

/** Zwei Nenner, deren kgV im Rahmen bleibt - nicht 7 und 13. */
function ungleicheNenner(rng: Zufall, max: number): [number, number] {
  return versuche<[number, number]>(
    () => [ganz(rng, 2, max), ganz(rng, 2, max)],
    ([a, b]) => a !== b && kgV(a, b) <= max * 3,
    [2, 4],
  );
}

/** (Zähler, Nenner) kürzen; der Nenner bleibt positiv. */
function bruchKuerzeZN(z: number, n: number): [number, number] {
  if (n < 0) {
    z = -z;
    n = -n;
  }
  const g = ggT(z, n);
  return [z / g, n / g];
}

/** Bruch in der Schreibweise der Bücher: gekürzt, als gemischte Zahl wenn unecht. */
function bruchText(z: number, n: number): string {
  if (z === 0) return "0";
  const [zz, nn] = bruchKuerzeZN(z, n);
  const vz = zz < 0 ? "-" : "";
  const az = Math.abs(zz);
  if (nn === 1) return `${vz}${az}`;
  if (az < nn) return `${vz}${az}/${nn}`;
  const ganzzahl = Math.floor(az / nn);
  const rest = az % nn;
  return rest === 0 ? `${vz}${ganzzahl}` : `${vz}${ganzzahl} ${rest}/${nn}`;
}

/** Bruch, ungekürzt - für die Angabe. */
function bruchRoh(z: number, n: number): string {
  return n === 1 ? String(z) : `${z}/${n}`;
}

/** Zufällige Dezimalzahl mit fester Zahl an Nachkommastellen, ohne Fließkomma-Rauschen. */
function zufallsDezimal(rng: Zufall, ganzMax: number, nachkomma: number): number {
  const ganzteil = ganz(rng, 0, ganzMax);
  if (nachkomma === 0) return ganzteil;
  const nachMax = 10 ** nachkomma - 1;
  const nach = Math.max(1, ganz(rng, 1, nachMax));
  return Number(`${ganzteil}.${String(nach).padStart(nachkomma, "0")}`);
}

/** Rundet Fließkomma-Rauschen weg, ohne die Nachkommastellen zu verlieren. */
function glatt(n: number): number {
  return Math.round(n * 1e6) / 1e6;
}

/** Ein Term-Glied wie „+3x" oder „-x" - das erste Glied ohne führendes Plus. */
function termGlied(k: number, v: string, erstes: boolean): string {
  const az = Math.abs(k);
  const zahlteil = az === 1 ? "" : String(az);
  const kern = `${zahlteil}${v}`;
  if (erstes) return k < 0 ? `-${kern}` : kern;
  return k < 0 ? `-${kern}` : `+${kern}`;
}

function termGliedPotenz(k: number, v: string, potenz: number, erstes: boolean): string {
  const az = Math.abs(k);
  const zahlteil = az === 1 ? "" : String(az);
  const vt = potenz === 1 ? v : `${v}^${potenz}`;
  const kern = `${zahlteil}${vt}`;
  if (erstes) return k < 0 ? `-${kern}` : kern;
  return k < 0 ? `-${kern}` : `+${kern}`;
}

function termGliedKonst(k: number, erstes: boolean): string {
  if (erstes) return String(k);
  return k < 0 ? `-${Math.abs(k)}` : `+${k}`;
}

/** Lineares Glied a*x + b in der Schreibweise, z. B. "3x -2" oder "5". */
function binomText(a: number, b: number, v: string): string {
  if (a === 0) return String(b);
  const at = termGliedPotenz(a, v, 1, true);
  if (b === 0) return at;
  return `${at} ${b < 0 ? "-" + Math.abs(b) : "+" + b}`;
}

/** quadratisches Ergebnis a2*x^2 + a1*x + a0 in der Schreibweise. */
function termAusQuadr(v: string, a2: number, a1: number, a0: number): string {
  const teile: string[] = [];
  if (a2 !== 0) teile.push(termGliedPotenz(a2, v, 2, teile.length === 0));
  if (a1 !== 0) teile.push(termGliedPotenz(a1, v, 1, teile.length === 0));
  if (a0 !== 0) teile.push(termGliedKonst(a0, teile.length === 0));
  return teile.length ? teile.join(" ") : "0";
}

function zufKoeff(rng: Zufall, max: number): number {
  return ganz(rng, 1, max) * (rng() < 0.5 ? -1 : 1);
}

/* ================================================================== */
/* Brüche                                                                */
/* ================================================================== */

export type BruchOp = "plus" | "minus" | "mal" | "geteilt";

export interface BruchRechnungP {
  /** Größter erlaubte Nenner. */
  nennerMax: number;
  /** Nur bei plus/minus: gleiche Nenner erzwingen. Ohne Angabe: ungleichnamig. */
  gleichnamig?: boolean;
}

/**
 * Bruchrechnung: Addition/Subtraktion (gleich- oder ungleichnamig),
 * Multiplikation (vor dem Rechnen manchmal kürzbar) oder Division (über den
 * Kehrwert). Subtraktionen ergeben nie ein negatives Zwischenergebnis - dafür
 * gibt es die ganzen Zahlen.
 */
export function bruchRechnung(rng: Zufall, op: BruchOp, p: BruchRechnungP): Kern {
  const nennerMax = Math.max(4, p.nennerMax);

  if (op === "plus" || op === "minus") {
    let na: number, nb: number;
    if (p.gleichnamig) {
      na = nb = ganz(rng, 2, nennerMax);
    } else {
      [na, nb] = ungleicheNenner(rng, nennerMax);
    }
    let za = ganz(rng, 1, na - 1);
    let zb = ganz(rng, 1, nb - 1);
    const gemeinsam = kgV(na, nb);
    let zaAuf = za * (gemeinsam / na);
    let zbAuf = zb * (gemeinsam / nb);
    if (op === "minus" && zaAuf < zbAuf) {
      [za, zb] = [zb, za];
      [na, nb] = [nb, na];
      [zaAuf, zbAuf] = [zbAuf, zaAuf];
    }
    const zErg = op === "plus" ? zaAuf + zbAuf : zaAuf - zbAuf;
    const zeichen = op === "plus" ? "+" : "-";
    const angabe = `${bruchRoh(za, na)} ${zeichen}${bruchRoh(zb, nb)} =`;
    return { sorte: "direkt", op: "bruch", angabe, loesung: bruchText(zErg, gemeinsam), zahlen: [za, na, zb, nb] };
  }

  if (op === "mal") {
    const willKuerzbar = rng() < 0.5;
    const g = versuche(
      () => {
        const na = ganz(rng, 2, nennerMax);
        const nb = ganz(rng, 2, nennerMax);
        return { na, nb, za: ganz(rng, 1, na - 1), zb: ganz(rng, 1, nb - 1) };
      },
      (k) => (ggT(k.za, k.nb) > 1 || ggT(k.zb, k.na) > 1) === willKuerzbar,
      { na: 2, nb: 3, za: 1, zb: 1 },
    );
    const angabe = `${bruchRoh(g.za, g.na)} *${bruchRoh(g.zb, g.nb)} =`;
    return { sorte: "direkt", op: "bruch", angabe, loesung: bruchText(g.za * g.zb, g.na * g.nb), zahlen: [g.za, g.na, g.zb, g.nb] };
  }

  // geteilt: über den Kehrwert
  const na = ganz(rng, 2, nennerMax);
  const nb = ganz(rng, 2, nennerMax);
  const za = ganz(rng, 1, na - 1);
  const zb = ganz(rng, 1, nb - 1);
  const angabe = `${bruchRoh(za, na)} /${bruchRoh(zb, nb)} =`;
  return { sorte: "direkt", op: "bruch", angabe, loesung: bruchText(za * nb, na * zb), zahlen: [za, na, zb, nb] };
}

export interface BruchKuerzenP {
  nennerMax: number;
  /** Faktor, mit dem der gekürzte Bruch aufgebläht wird. */
  faktorMax?: number;
}

export function bruchKuerzen(rng: Zufall, p: BruchKuerzenP): Kern {
  const nennerMax = Math.max(4, p.nennerMax);
  const faktorMax = Math.max(2, p.faktorMax ?? 6);
  const nGek = ganz(rng, 2, nennerMax);
  const zGekRoh = ganz(rng, 1, nGek - 1);
  const [zk, nk] = bruchKuerzeZN(zGekRoh, nGek);
  const f = ganz(rng, 2, faktorMax);
  const angabe = `${bruchRoh(zk * f, nk * f)} =`;
  // ★ Hier IST die Schreibweise die Aufgabe: `12/30 =` heißt „kürze". Ohne
  // diese Marke wäre `12/30` - die zurückgeschriebene Angabe - eine richtige
  // Antwort, denn der Wert stimmt ja.
  return { sorte: "direkt", op: "bruch", angabe, loesung: bruchText(zk, nk), zahlen: [zk, nk, f], formZaehlt: true };
}

export interface BruchErweiternP {
  nennerMax: number;
  zielNennerMax: number;
}

export function bruchErweitern(rng: Zufall, p: BruchErweiternP): Kern {
  const na = ganz(rng, 2, p.nennerMax);
  const za = ganz(rng, 1, na - 1);
  const fMax = Math.max(2, Math.floor(p.zielNennerMax / na));
  const f = ganz(rng, 2, fMax);
  const nb = na * f;
  const zb = za * f;
  // ★ `[]/56`, nicht `[] /56`: vor dem Bruchstrich steht kein Abstand, vor
  // dem Geteilt-Zeichen einer. So unterscheidet die Zeile Bruch und Division
  // (Stanetty S. 35). Gemessen am 23.09.2026 beim Mitlesen von 5-14.
  const angabe = `${bruchRoh(za, na)} =${LUECKE}/${nb}`;
  return { sorte: "direkt", op: "bruch", angabe, loesung: String(zb), zahlen: [za, na, f] };
}

export interface BruchVergleichenP {
  nennerMax: number;
}

export function bruchVergleichen(rng: Zufall, p: BruchVergleichenP): Kern {
  const [na, nb] = ungleicheNenner(rng, Math.max(4, p.nennerMax));
  const za = ganz(rng, 1, na - 1);
  const zb = ganz(rng, 1, nb - 1);
  const g = kgV(na, nb);
  const va = za * (g / na);
  const vb = zb * (g / nb);
  const zeichen = va > vb ? ">" : va < vb ? "<" : "=";
  const angabe = `${bruchRoh(za, na)} ${LUECKE} ${bruchRoh(zb, nb)}`;
  return { sorte: "direkt", op: "bruch", angabe, loesung: zeichen, zahlen: [za, na, zb, nb] };
}

export interface BruchArtP {
  nennerMax: number;
}

/** Ist ein Bruch echt, unecht oder gemischt? */
export function bruchArt(rng: Zufall, p: BruchArtP): Kern {
  const art = eines(rng, ["echt", "unecht", "gemischt"] as const);
  const n = ganz(rng, 2, Math.max(4, p.nennerMax));
  let angabe: string;
  if (art === "echt") {
    angabe = bruchRoh(ganz(rng, 1, n - 1), n);
  } else if (art === "unecht") {
    angabe = bruchRoh(ganz(rng, n + 1, n * 3), n);
  } else {
    const ganzzahl = ganz(rng, 1, 3);
    const rest = ganz(rng, 1, n - 1);
    angabe = `${ganzzahl} ${rest}/${n}`;
  }
  return { sorte: "direkt", op: "bruch", angabe: `${angabe}: echt, unecht oder gemischt?`, loesung: art, zahlen: [n] };
}

export interface AnteilVonMengeP {
  nennerMax: number;
  mengeMax: number;
}

export function anteilVonMenge(rng: Zufall, p: AnteilVonMengeP): Kern {
  const n = ganz(rng, 2, Math.max(4, p.nennerMax));
  const z = ganz(rng, 1, n - 1);
  const vielfache = Math.max(1, Math.floor(p.mengeMax / n));
  const menge = n * ganz(rng, 1, vielfache);
  const ergebnis = (menge / n) * z;
  const angabe = `${bruchRoh(z, n)} von ${menge} =`;
  return { sorte: "direkt", op: "bruch", angabe, loesung: String(ergebnis), zahlen: [z, n, menge] };
}

/* ================================================================== */
/* Dezimalzahlen                                                        */
/* ================================================================== */

export type DezOp = "plus" | "minus" | "mal" | "geteilt";

export interface DezimalRechnungP {
  /** Höchste Zahl der Nachkommastellen, die vorkommt. */
  nachkommaMax: number;
  /** Größte ganze Zahl vor dem Komma. */
  ganzMax: number;
  /** Bei plus/minus: unterschiedliche Nachkommastellen in derselben Aufgabe erzwingen. */
  unterschiedlich?: boolean;
  /** Nur bei geteilt: Nachkommastellen des Divisors. Ohne Angabe: natürliche Zahl. */
  divisorNachkomma?: number;
}

/** Alle vier Rechenarten mit Dezimalzahlen. Nutzt die Sorte "rechnung" - die
 * Formen aus formen.ts (Ergebnis, Lücke, Probe, Folge ...) funktionieren
 * damit ohne weiteres Zutun. */
export function dezimalRechnung(rng: Zufall, op: DezOp, p: DezimalRechnungP): Kern {
  const nachkommaMax = Math.max(1, p.nachkommaMax);
  let na = ganz(rng, 1, nachkommaMax);
  let nb = ganz(rng, 1, nachkommaMax);
  if ((op === "plus" || op === "minus") && p.unterschiedlich && nachkommaMax > 1) {
    na = ganz(rng, 1, nachkommaMax);
    nb = na === nachkommaMax ? na - 1 : na + 1;
  }
  let a = zufallsDezimal(rng, p.ganzMax, na);
  let b = zufallsDezimal(rng, p.ganzMax, nb);

  if (op === "geteilt") {
    // Der Dividend wird zum Divisor passend gebaut, damit die Division ohne
    // Rest aufgeht. Ohne `divisorNachkomma` ist der Divisor eine natürliche
    // Zahl (Paket 5-10); mit ihm trägt auch er Nachkommastellen (5-11).
    const nkDivisor = p.divisorNachkomma ?? 0;
    b = nkDivisor > 0
      ? zufallsDezimal(rng, Math.max(1, Math.min(9, p.ganzMax)), nkDivisor) || 1
      : ganz(rng, 1, Math.max(2, Math.min(9, p.ganzMax)));
    const quotient = zufallsDezimal(rng, p.ganzMax, na) || 1;
    a = glatt(b * quotient);
  }
  if (op === "minus" && a < b) [a, b] = [b, a];

  const ergebnis = glatt(op === "plus" ? a + b : op === "minus" ? a - b : op === "mal" ? a * b : a / b);
  return { sorte: "rechnung", op, a, b, ergebnis };
}

export interface KommaVerschiebenP {
  /** Erlaubte Zehnerstufen, z. B. [10, 100, 1000]. */
  stufen: readonly number[];
  nachkommaMax: number;
  ganzMax: number;
}

export function kommaVerschieben(rng: Zufall, p: KommaVerschiebenP): Kern {
  const stufe = eines(rng, p.stufen);
  const richtung = eines(rng, ["mal", "durch"] as const);
  const nachkomma = Math.max(1, ganz(rng, 1, Math.max(1, p.nachkommaMax)));
  const wert = zufallsDezimal(rng, p.ganzMax, nachkomma);
  const erg = glatt(richtung === "mal" ? wert * stufe : wert / stufe);
  const angabe = `${zahl(wert)} ${richtung === "mal" ? "*" : "/"}${stufe} =`;
  return { sorte: "direkt", op: "zahlen", angabe, loesung: zahl(erg), zahlen: [wert, stufe] };
}

export interface DezimalRundenP {
  stellen: readonly ("einer" | "zehntel" | "hundertstel")[];
  nachkommaMax: number;
  ganzMax: number;
}

export function dezimalRunden(rng: Zufall, p: DezimalRundenP): Kern {
  const stelle = eines(rng, p.stellen);
  const nachkomma = Math.max(2, p.nachkommaMax);
  const wert = zufallsDezimal(rng, p.ganzMax, nachkomma);
  const faktor = stelle === "einer" ? 1 : stelle === "zehntel" ? 10 : 100;
  const gerundet = Math.round(wert * faktor) / faktor;
  const stellenText = stelle === "einer" ? "den Einer" : stelle === "zehntel" ? "das Zehntel" : "das Hundertstel";
  const angabe = `${zahl(wert)} auf ${stellenText} runden =`;
  const nkErg = stelle === "einer" ? undefined : stelle === "zehntel" ? 1 : 2;
  return { sorte: "direkt", op: "zahlen", angabe, loesung: zahl(gerundet, nkErg), zahlen: [wert] };
}

export interface DezimalOrdnenP {
  anzahl: number;
  nachkommaMax: number;
  ganzMax: number;
}

const ORDNEN_PRAEFIX = "Der Größe nach ordnen: ";

export function dezimalOrdnen(rng: Zufall, p: DezimalOrdnenP): Kern {
  const ziel = Math.max(3, p.anzahl);
  const gesehen = new Set<number>();
  const menge: number[] = [];
  for (let v = 0; v < 200 && menge.length < ziel; v++) {
    const nk = ganz(rng, 0, Math.max(1, p.nachkommaMax));
    const w = zufallsDezimal(rng, p.ganzMax, nk);
    if (gesehen.has(w)) continue;
    const probe = [...menge, w].map((z) => zahl(z)).join("; ");
    // ★ Die Braillezeile fasst 40 Zeichen - lieber weniger Zahlen als eine
    // abgeschnittene Zeile.
    if (`${ORDNEN_PRAEFIX}${probe}`.length > 40) continue;
    gesehen.add(w);
    menge.push(w);
  }
  const sortiert = [...menge].sort((a, b) => a - b);
  const angabe = `${ORDNEN_PRAEFIX}${gemischt(rng, menge).map((z) => zahl(z)).join("; ")}`;
  return { sorte: "direkt", op: "zahlen", angabe, loesung: sortiert.map((z) => zahl(z)).join("; "), zahlen: menge };
}

/* ================================================================== */
/* Teilbarkeit                                                          */
/* ================================================================== */

function teilerVon(n: number): number[] {
  const t: number[] = [];
  for (let i = 1; i <= n; i++) if (n % i === 0) t.push(i);
  return t;
}

export interface TeilermengeP {
  min: number;
  max: number;
}

export function teilermenge(rng: Zufall, p: TeilermengeP): Kern {
  // ★ Manche Zahlen (72, 96 ...) haben so viele Teiler, dass die Menge über
  // die Braillezeile hinausragt - dann wird neu gewürfelt.
  const n = versuche(
    () => ganz(rng, p.min, p.max),
    (kand) => `T(${kand}) =`.length + `{${teilerVon(kand).join("; ")}}`.length <= 39,
    Math.max(2, p.min),
  );
  const t = teilerVon(n);
  return { sorte: "direkt", eigeneArt: "menge", op: "zahlen", angabe: `T(${n}) =`, loesung: `{${t.join("; ")}}`, zahlen: [n] };
}

export interface VielfachenmengeP {
  min: number;
  max: number;
  /** Wie viele Vielfache höchstens angezeigt werden. */
  anzahlMax?: number;
}

export function vielfachenmenge(rng: Zufall, p: VielfachenmengeP): Kern {
  const anzahlMax = Math.max(3, p.anzahlMax ?? 8);
  const n = ganz(rng, p.min, p.max);
  // ★ Die Schranke wächst mit n, nicht mit einer festen oberen Zahl - sonst
  // hat eine kleine Zahl wie 3 plötzlich 30 Vielfache in der Menge.
  const anzahl = versuche(
    () => ganz(rng, 3, anzahlMax),
    (kand) => `V(${n}) bis ${n * kand} =`.length <= 40
      && `{${Array.from({ length: kand }, (_, i) => n * (i + 1)).join("; ")}}`.length <= 40,
    3,
  );
  const schranke = n * anzahl;
  const v = Array.from({ length: anzahl }, (_, i) => n * (i + 1));
  return {
    sorte: "direkt", eigeneArt: "menge", op: "zahlen", angabe: `V(${n}) bis ${schranke} =`, loesung: `{${v.join("; ")}}`, zahlen: [n, schranke],
  };
}

export interface TeilbarkeitsregelP {
  regeln: readonly number[];
  max: number;
}

function teilbarkeitsBegruendung(d: number, n: number): string {
  const es = String(n);
  const letzte = Number(es[es.length - 1]);
  const quer = es.split("").reduce((s, z) => s + Number(z), 0);
  if (d === 2) return `letzte Ziffer ${letzte} ist gerade`;
  if (d === 5) return "letzte Ziffer ist 0 oder 5";
  if (d === 10) return "letzte Ziffer ist 0";
  if (d === 4) return "letzte zwei Ziffern durch 4 teilbar";
  if (d === 25) return "letzte zwei Ziffern durch 25 teilbar";
  return `Quersumme ${quer} durch ${d} teilbar`;
}

/** Teilbarkeit durch 2, 3, 4, 5, 9, 10 oder 25 - als Ja/Nein mit Begründung. */
export function teilbarkeitsregel(rng: Zufall, p: TeilbarkeitsregelP): Kern {
  const d = eines(rng, p.regeln);
  const n = ganz(rng, 10, p.max);
  const teilbar = n % d === 0;
  const begruendung = teilbarkeitsBegruendung(d, n);
  return {
    sorte: "direkt", op: "zahlen", angabe: `Ist ${n} durch ${d} teilbar?`,
    loesung: teilbar ? "ja" : "nein",
    auchRichtig: [teilbar ? `ja, ${begruendung}` : `nein, ${begruendung}`],
    zahlen: [n, d],
  };
}

function primfaktorenVon(n: number): number[] {
  const f: number[] = [];
  let rest = n;
  for (let t = 2; t * t <= rest; t++) {
    while (rest % t === 0) {
      f.push(t);
      rest /= t;
    }
  }
  if (rest > 1) f.push(rest);
  return f;
}

export interface PrimfaktorenP {
  min: number;
  max: number;
}

export function primfaktoren(rng: Zufall, p: PrimfaktorenP): Kern {
  const n = ganz(rng, Math.max(4, p.min), p.max);
  const f = primfaktorenVon(n);
  return { sorte: "direkt", op: "zahlen", angabe: `${n} in Primfaktoren zerlegen =`, loesung: f.join(" *"), zahlen: [n] };
}

export interface GgtKgvP {
  anzahl: 2 | 3;
  max: number;
  art?: "ggt" | "kgv" | "beide";
}

/** Der Zahlenraum der Pakete 6-06 bis 6-08 laut Stoffplan. */
const GGT_KGV_ZAHLENRAUM = 200;

/**
 * ggT oder kgV von zwei oder drei Zahlen.
 *
 * ★ Die Zahlen werden GEBAUT, nicht gewürfelt. Gemessen am 23.09.2026: aus
 * gewürfelten Zahlen kam in jeder zweiten Aufgabe ein ggT von 1 - und bei
 * drei Zahlen `kgV(32; 33; 37) =39072`, weit über dem Zahlenraum 200 des
 * Stoffplans. Das eine fragt nichts ab, das andere ist kein Kopfrechnen.
 *
 *   · ggT: ein gemeinsamer Teiler g, mal Faktoren ohne gemeinsamen Teiler.
 *     Nur selten (etwa jede zehnte Aufgabe) ist g = 1 - auch das muss man
 *     erkennen können.
 *   · kgV: so lange neu, bis das kgV im Zahlenraum bleibt.
 *   · Nie zweimal dieselbe Zahl: `kgV(27; 27)` ist keine Frage.
 */
function ggtKgvZahlen(rng: Zufall, anzahl: number, max: number, art: "ggt" | "kgv"): number[] {
  for (let versuch = 0; versuch < 500; versuch++) {
    let zahlen: number[];
    if (art === "ggt") {
      const g = rng() < 0.1 ? 1 : ganz(rng, 2, Math.max(2, Math.floor(max / 3)));
      const fMax = Math.floor(max / g);
      if (fMax < anzahl + 1) continue;
      const faktoren = Array.from({ length: anzahl }, () => ganz(rng, 1, fMax));
      if (faktoren.reduce((a, b) => ggT(a, b)) !== 1) continue;
      zahlen = faktoren.map((f) => f * g);
      if (zahlen.some((z) => z < 2)) continue;
    } else {
      zahlen = Array.from({ length: anzahl }, () => ganz(rng, 2, max));
      if (zahlen.reduce((a, b) => kgV(a, b)) > GGT_KGV_ZAHLENRAUM) continue;
    }
    if (new Set(zahlen).size !== zahlen.length) continue;
    return zahlen;
  }
  return anzahl === 2 ? [12, 18] : [6, 10, 15];
}

export function ggtKgv(rng: Zufall, p: GgtKgvP): Kern {
  const art = !p.art || p.art === "beide" ? eines(rng, ["ggt", "kgv"] as const) : p.art;
  const zahlen = ggtKgvZahlen(rng, p.anzahl, p.max, art);
  const g = zahlen.reduce((a, b) => ggT(a, b));
  const k = zahlen.reduce((a, b) => kgV(a, b));
  const angabe = `${art === "ggt" ? "ggT" : "kgV"}(${zahlen.join("; ")}) =`;
  return { sorte: "direkt", op: "zahlen", angabe, loesung: String(art === "ggt" ? g : k), zahlen };
}

/* ================================================================== */
/* Prozent                                                               */
/* ================================================================== */

export type ProzentGesucht = "prozentwert" | "grundwert" | "prozentsatz";

export interface ProzentRechnungP {
  gesucht: ProzentGesucht;
  grundwertMax: number;
  saetze?: readonly number[];
}

export function prozentRechnung(rng: Zufall, p: ProzentRechnungP): Kern {
  const saetze = p.saetze ?? [5, 10, 15, 20, 25, 30, 40, 50, 75];
  const satz = eines(rng, saetze);
  const grundwert = ganz(rng, 1, Math.max(1, Math.floor(p.grundwertMax / 100))) * 100;
  const wert = Math.round((grundwert * satz) / 100);
  let angabe: string;
  let loesung: string;
  if (p.gesucht === "prozentwert") {
    angabe = `${satz} % von ${grundwert} =`;
    loesung = String(wert);
  } else if (p.gesucht === "grundwert") {
    // ★ Kein „=" hinter der Lücke: die Lücke IST die Stelle der Antwort.
    // Mit „=" sagte die Stimme „... von Lücke ist" - und nichts danach
    // (gemessen 23.09.2026). Sonst steht nirgends in Plus `[] =` am Ende.
    angabe = `${wert} sind ${satz} % von ${LUECKE}`;
    loesung = String(grundwert);
  } else {
    angabe = `${wert} von ${grundwert} sind wie viel %?`;
    loesung = `${satz} %`;
  }
  return { sorte: "direkt", op: "prozent", angabe, loesung, zahlen: [grundwert, satz, wert] };
}

export interface ProzentImKopfP {
  grundwertMax: number;
  teilbarkeit: 10 | 100;
}

export function prozentImKopf(rng: Zufall, p: ProzentImKopfP): Kern {
  const vielfache = Math.max(1, Math.floor(p.grundwertMax / p.teilbarkeit));
  const grundwert = p.teilbarkeit * ganz(rng, 1, vielfache);
  const satz = p.teilbarkeit === 100 ? eines(rng, [1, 2, 5, 10, 20, 25, 50] as const) : eines(rng, [10, 20, 25, 50] as const);
  const wert = (grundwert * satz) / 100;
  return { sorte: "direkt", op: "prozent", angabe: `${satz} % von ${grundwert} =`, loesung: zahl(wert), zahlen: [grundwert, satz] };
}

export interface ZinsenP {
  kapitalMax: number;
  satzMax: number;
  jahre?: number;
}

export function zinsen(rng: Zufall, p: ZinsenP): Kern {
  const kapital = ganz(rng, 1, Math.max(1, Math.floor(p.kapitalMax / 100))) * 100;
  const satz = ganz(rng, 1, p.satzMax);
  const jahre = p.jahre ?? 1;
  const z = Math.round(((kapital * satz) / 100) * jahre * 100) / 100;
  const jahrText = jahre === 1 ? "1 Jahr" : `${jahre} Jahre`;
  const angabe = `${kapital} zu ${satz} % Zinsen für ${jahrText} =`;
  return { sorte: "direkt", op: "prozent", angabe, loesung: zahl(z), zahlen: [kapital, satz, jahre] };
}

export interface ZinseszinsP {
  kapitalMax: number;
  satzMax: number;
  jahreMax: number;
}

/**
 * ★★★★★ ZINSESZINS IM KOPF HEISST: DEN ÄNDERUNGSFAKTOR HINSCHREIBEN.
 *
 * ⚠️ Bis zum 23.09.2026 stand hier der ENDWERT: `12600 zu 1 % Zinseszins,
 * 6 Jahre = 13375,15`. Das ist `12600 *1,01^6` - eine reine Rechneraufgabe,
 * und Plus heisst „Rechnen im Kopf und auf der Zeile". Johannes: „Wir wollen
 * keine rechnungen für den taschenrechner."
 *
 * ★★★ Der Stoffplan nennt als Strategie „Änderungsfaktor hoch Laufzeit" -
 * und genau DAS ist der Lerngegenstand. Den Faktor zu kennen (3 % ⇒ 1,03)
 * und die Rechnung hinzuschreiben (`12600 *1,03^4`) ist die Leistung; das
 * Ausrechnen macht in der Schule der Rechner.
 */
export function zinseszins(rng: Zufall, p: ZinseszinsP): Kern {
  const kapital = ganz(rng, 1, Math.max(1, Math.floor(p.kapitalMax / 100))) * 100;
  const satz = ganz(rng, 1, p.satzMax);
  const jahre = ganz(rng, 2, Math.max(2, p.jahreMax));
  const faktor = zahl(1 + satz / 100, 2);
  const rechnung = `${kapital} *${faktor}^${jahre}`;
  return {
    sorte: "direkt", op: "prozent",
    // ⚠️ Jede ZEILE höchstens 40 Zeichen - so breit ist die Braillezeile. Die
    // Ansage steht deshalb auf einer zweiten Zeile, nicht hinter dem Punkt.
    angabe: `${kapital} zu ${satz} % Zinseszins, ${jahre} Jahre.\nSchreib die Rechnung.`,
    loesung: rechnung,
    auchRichtig: [`${faktor}^${jahre} *${kapital}`, `${kapital} *${faktor}^${jahre} =`],
    zahlen: [kapital, satz, jahre],
    varianten: [
      {
        angabe: `Welcher Faktor gehört zu ${satz} %?`,
        loesung: faktor,
        auchRichtig: [zahl(1 + satz / 100)],
      },
      {
        angabe: `${kapital} zu ${satz} % Zinseszins, ${jahre} Jahre.\nWie oft nimmst du mit ${faktor} mal?`,
        loesung: String(jahre),
      },
    ],
  };
}

/* ================================================================== */
/* Negative Zahlen                                                      */
/* ================================================================== */

export type GanzOp = "plus" | "minus" | "mal" | "geteilt";

export interface GanzeZahlRechnungP {
  min: number;
  max: number;
  /** Welche Rechenarten vorkommen. Ohne Angabe: nur plus und minus. */
  operationen?: readonly GanzOp[];
}

/**
 * Rechnen mit ganzen Zahlen. Die zweite Zahl steht in Klammer, sobald sie
 * negativ ist - „5 +(-3) =", nie „5 +-3 =".
 */
export function ganzeZahlRechnung(rng: Zufall, p: GanzeZahlRechnungP): Kern {
  const ops = p.operationen ?? (["plus", "minus"] as const);
  const op = eines(rng, ops);
  let a: number, b: number, erg: number;

  if (op === "geteilt") {
    const divisor = ganz(rng, 1, Math.max(2, p.max));
    const quotient = ganz(rng, 1, Math.max(2, p.max));
    b = rng() < 0.5 ? divisor : -divisor;
    const q = rng() < 0.5 ? quotient : -quotient;
    a = b * q;
    erg = q;
  } else if (op === "mal") {
    const fa = ganz(rng, 1, p.max);
    const fb = ganz(rng, 1, p.max);
    a = rng() < 0.5 ? fa : -fa;
    b = rng() < 0.5 ? fb : -fb;
    erg = a * b;
  } else {
    // ★ Auch das Ergebnis bleibt im Zahlenraum. Gemessen am 23.09.2026 in
    // 6-19 (Stoffplan: -200 bis 200): `105 -(-182) =287`.
    do {
      a = ganz(rng, p.min, p.max) * (rng() < 0.5 ? 1 : -1);
      b = ganz(rng, p.min, p.max) * (rng() < 0.5 ? 1 : -1);
      erg = op === "plus" ? a + b : a - b;
    } while (Math.abs(erg) > p.max);
  }

  const zeichen = op === "plus" ? "+" : op === "minus" ? "-" : op === "mal" ? "*" : "/";
  const rechts = b < 0 ? `(${b})` : String(b);
  const angabe = `${a} ${zeichen}${rechts} =`;
  return { sorte: "direkt", op: "gemischt", angabe, loesung: String(erg), zahlen: [a, b] };
}

export interface BetragGegenzahlP {
  min: number;
  max: number;
}

export function betragGegenzahl(rng: Zufall, p: BetragGegenzahlP): Kern {
  const frage = eines(rng, ["betrag", "gegenzahl"] as const);
  const n = ganz(rng, p.min, p.max) * (rng() < 0.5 ? 1 : -1);
  if (frage === "betrag") {
    return { sorte: "direkt", op: "gemischt", angabe: `|${n}| =`, loesung: String(Math.abs(n)), zahlen: [n] };
  }
  return { sorte: "direkt", op: "gemischt", angabe: `Gegenzahl von ${n} =`, loesung: String(-n), zahlen: [n] };
}

export interface ZahlenOrdnenP {
  anzahl: number;
  min: number;
  max: number;
}

export function zahlenOrdnen(rng: Zufall, p: ZahlenOrdnenP): Kern {
  const ziel = Math.max(3, p.anzahl);
  const gesehen = new Set<number>();
  const zahlen: number[] = [];
  for (let v = 0; v < 200 && zahlen.length < ziel; v++) {
    const kandidat = ganz(rng, p.min, p.max) * (rng() < 0.5 ? 1 : -1);
    if (gesehen.has(kandidat)) continue;
    const probe = [...zahlen, kandidat].join("; ");
    if (`${ORDNEN_PRAEFIX}${probe}`.length > 40) continue;
    gesehen.add(kandidat);
    zahlen.push(kandidat);
  }
  const sortiert = [...zahlen].sort((a, b) => a - b);
  const angabe = `${ORDNEN_PRAEFIX}${gemischt(rng, zahlen).join("; ")}`;
  return { sorte: "direkt", op: "gemischt", angabe, loesung: sortiert.join("; "), zahlen };
}

/* ================================================================== */
/* Potenzen und Wurzeln                                                 */
/* ================================================================== */

export interface PotenzP {
  basisMin: number;
  basisMax: number;
  exponentMin: number;
  exponentMax: number;
  negativErlaubt?: boolean;
}

export function potenz(rng: Zufall, p: PotenzP): Kern {
  let basis = ganz(rng, p.basisMin, p.basisMax);
  if (p.negativErlaubt && rng() < 0.5) basis = -basis;
  const exponent = ganz(rng, p.exponentMin, p.exponentMax);
  const erg = Math.pow(basis, exponent);
  const basisText = basis < 0 ? `(${basis})` : String(basis);
  return { sorte: "direkt", op: "potenz", angabe: `${basisText}^${exponent} =`, loesung: String(erg), zahlen: [basis, exponent] };
}

export type PotenzRegelArt = "produkt" | "quotient" | "potenzVonPotenz";

export interface PotenzRegelP {
  basisMin: number;
  basisMax: number;
  exponentMax: number;
  arten?: readonly PotenzRegelArt[];
}

export function potenzRegel(rng: Zufall, p: PotenzRegelP): Kern {
  const k = potenzRegelRoh(rng, p);
  if (k.sorte !== "direkt") return k;
  // ★ Der ausgerechnete Wert gilt auch: wer `6^6 /6^3` bis 216 rechnet, hat
  // nicht falsch gerechnet, sondern weiter. Gemessen am 23.09.2026.
  const m = /^(\d+)\^(\d+)$/.exec(k.loesung);
  const wert = m ? Number(m[1]) ** Number(m[2]) : NaN;
  return wert <= 1e7 ? { ...k, auchRichtig: [String(wert)] } : k;
}

function potenzRegelRoh(rng: Zufall, p: PotenzRegelP): Kern {
  const art = eines(rng, p.arten ?? (["produkt", "quotient", "potenzVonPotenz"] as const));
  const basis = ganz(rng, p.basisMin, p.basisMax);
  if (art === "produkt") {
    const e1 = ganz(rng, 1, p.exponentMax);
    const e2 = ganz(rng, 1, p.exponentMax);
    return {
      sorte: "direkt", op: "potenz", angabe: `${basis}^${e1} *${basis}^${e2} =`,
      loesung: `${basis}^${e1 + e2}`, zahlen: [basis, e1, e2],
    };
  }
  if (art === "quotient") {
    const e2 = ganz(rng, 1, Math.max(1, p.exponentMax - 1));
    const e1 = ganz(rng, e2 + 1, p.exponentMax + e2);
    return {
      sorte: "direkt", op: "potenz", angabe: `${basis}^${e1} /${basis}^${e2} =`,
      loesung: `${basis}^${e1 - e2}`, zahlen: [basis, e1, e2],
    };
  }
  // ★ Ab Hochzahl 2: `(9^1)^1` fragt keine Regel ab (gemessen 23.09.2026).
  const e1 = ganz(rng, 2, Math.max(2, p.exponentMax));
  const e2 = ganz(rng, 2, Math.max(2, p.exponentMax));
  return {
    sorte: "direkt", op: "potenz", angabe: `(${basis}^${e1})^${e2} =`,
    loesung: `${basis}^${e1 * e2}`, zahlen: [basis, e1, e2],
  };
}

export interface ZehnerpotenzP {
  exponentMin: number;
  exponentMax: number;
  richtung?: "beide" | "gross" | "klein";
}

export function zehnerpotenz(rng: Zufall, p: ZehnerpotenzP): Kern {
  const richtung = p.richtung ?? "beide";
  const gross = richtung === "gross" ? true : richtung === "klein" ? false : rng() < 0.5;
  const exponent = ganz(rng, p.exponentMin, p.exponentMax) * (gross ? 1 : -1);
  const wert = Math.pow(10, exponent);
  const loesung = exponent >= 0 ? String(wert) : zahl(wert, Math.abs(exponent));
  return { sorte: "direkt", op: "potenz", angabe: `10^${exponent} =`, loesung, zahlen: [exponent] };
}

export interface QuadratwurzelP {
  radikandMax: number;
  /** Auch Näherungswerte, nicht nur ganzzahlige Wurzeln. */
  naeherung?: boolean;
}

export function quadratwurzel(rng: Zufall, p: QuadratwurzelP): Kern {
  if (!p.naeherung || rng() < 0.5) {
    const wurzel = ganz(rng, 2, Math.max(2, Math.floor(Math.sqrt(p.radikandMax))));
    const radikand = wurzel * wurzel;
    return { sorte: "direkt", op: "wurzel", angabe: `'w(${radikand}) =`, loesung: String(wurzel), zahlen: [radikand] };
  }
  /**
   * ★★★★★ NÄHERUNG HEISST GANZE ZAHL, NICHT ZWEI NACHKOMMASTELLEN.
   *
   * > **Johannes, 23.09.2026**, vor einer Aufgabe `'w(140) rund auf zwei
   * > Nachkommastellen`: „das ist nicht sinnvoll … um das auf zwei
   * > nachkommastellen zu runden muss man die wurzel auf 3 stellen berechnen,
   * > in der 8. Klasse macht man das mit dem Rechner … was man hier sagen
   * > kann, runde auf ganze zahlen, dann ist es im kopf lösbar und sinnvoll!"
   *
   * Plus heisst „Rechnen im Kopf und auf der Zeile". Eine Aufgabe, die man in
   * einen Rechner tippt, gehört nicht hierher - sie übt das Tippen.
   *
   * ★★★ Auf ganze Zahlen zu runden ist dagegen echtes Kopfrechnen: Zwischen
   * welchen Quadratzahlen liegt der Radikand, und welcher ist er näher?
   * 140 liegt zwischen 121 und 144 und ist der 144 viel näher ⇒ 12.
   *
   * ⚠️ DAMIT DAS AUFGEHT, MUSS DIE ENTSCHEIDUNG KLAR SEIN. Ein Radikand dicht
   * an der Mitte zwischen zwei Quadratzahlen (`'w(132)`: 132,25 ist die Mitte)
   * wäre im Kopf nicht zu entscheiden - solche werden übersprungen.
   */
  let radikand = ganz(rng, 2, p.radikandMax);
  for (let v = 0; v < 200 && !imKopfEntscheidbar(radikand); v++) radikand = ganz(rng, 2, p.radikandMax);
  const untere = Math.floor(Math.sqrt(radikand));
  const naeherung = Math.round(Math.sqrt(radikand));
  return {
    sorte: "direkt", op: "wurzel", angabe: `'w(${radikand}) rund auf ganze Zahlen =`,
    loesung: String(naeherung), zahlen: [radikand],
    varianten: [{
      // ⚠️ 40 Zeichen sind die Braillezeile. „Zwischen welchen GANZEN Zahlen"
      // wären 45 - das Wort „ganzen" muss weg, und die Frage bleibt klar.
      angabe: `Zwischen welchen Zahlen liegt 'w(${radikand})?`,
      loesung: `${untere} und ${untere + 1}`,
      auchRichtig: [`${untere}, ${untere + 1}`, `${untere} ${untere + 1}`],
    }],
  };
}

/**
 * Lässt sich die gerundete Wurzel im Kopf entscheiden?
 *
 * Nein, wenn der Radikand fast genau in der Mitte zwischen zwei Quadratzahlen
 * liegt - dort müsste man rechnen, statt zu vergleichen. Drei Einheiten
 * Abstand genügen: `'w(132)` fällt weg (Mitte 132,25), `'w(140)` bleibt.
 */
function imKopfEntscheidbar(radikand: number): boolean {
  if (istQuadratzahlZ(radikand)) return false;
  const untere = Math.floor(Math.sqrt(radikand));
  const mitte = (untere + 0.5) ** 2;
  return Math.abs(radikand - mitte) >= 3;
}

function istQuadratzahlZ(n: number): boolean {
  const w = Math.round(Math.sqrt(n));
  return w * w === n;
}

export interface KubikwurzelP {
  radikandMax: number;
}

export function kubikwurzel(rng: Zufall, p: KubikwurzelP): Kern {
  const wurzel = ganz(rng, 2, Math.max(2, Math.round(Math.cbrt(p.radikandMax))));
  const radikand = wurzel * wurzel * wurzel;
  return { sorte: "direkt", op: "wurzel", angabe: `'w[3](${radikand}) =`, loesung: String(wurzel), zahlen: [radikand] };
}

export interface TeilweisesWurzelziehenP {
  radikandMax: number;
}

export function teilweisesWurzelziehen(rng: Zufall, p: TeilweisesWurzelziehenP): Kern {
  const quadratFaktor = eines(rng, [4, 9, 16, 25] as const);
  // ★ Der Rest ist quadratfrei. Gemessen am 23.09.2026: `'w(200) =5 *'w(8)`
  // und sogar `'w(144) =4 *'w(9)` - beides nicht fertig gerechnet, und ein
  // Kind mit der richtigen Antwort `10 *'w(2)` oder `12` bekam „Noch nicht".
  const quadratfrei = (n: number) => [4, 9, 25, 49, 121, 169].every((q) => n % q !== 0);
  const restMax = Math.max(2, Math.floor(p.radikandMax / quadratFaktor));
  let rest = ganz(rng, 2, restMax);
  for (let v = 0; v < 100 && !quadratfrei(rest); v++) rest = ganz(rng, 2, restMax);
  if (!quadratfrei(rest)) rest = 2;
  const radikand = quadratFaktor * rest;
  const vorFaktor = Math.round(Math.sqrt(quadratFaktor));
  return {
    sorte: "direkt", op: "wurzel", angabe: `'w(${radikand}) =`, loesung: `${vorFaktor} *'w(${rest})`,
    auchRichtig: [`${vorFaktor}'w(${rest})`],
    zahlen: [radikand, quadratFaktor, rest],
  };
}

/* ================================================================== */
/* Terme und Vorrang                                                    */
/* ================================================================== */

function anwenden(a: number, op: string, b: number): number {
  return op === "+" ? a + b : op === "-" ? a - b : op === "*" ? a * b : a / b;
}

/** Wertet zahlen[0] ops[0] zahlen[1] ops[1] ... aus - Punkt vor Strich, mit
 * optionaler Klammer um die ersten (klammerBis + 1) Zahlen. */
function bewerte(zahlen: number[], ops: string[], klammerBis?: number): number {
  const z = zahlen.slice();
  const o = ops.slice();
  if (klammerBis !== undefined && klammerBis > 0) {
    let acc = z[0];
    for (let i = 0; i < klammerBis; i++) acc = anwenden(acc, o[i], z[i + 1]);
    z.splice(0, klammerBis + 1, acc);
    o.splice(0, klammerBis);
  }
  for (let i = 0; i < o.length; ) {
    if (o[i] === "*" || o[i] === "/") {
      z[i] = anwenden(z[i], o[i], z[i + 1]);
      z.splice(i + 1, 1);
      o.splice(i, 1);
    } else i++;
  }
  let erg = z[0];
  for (let i = 0; i < o.length; i++) erg = anwenden(erg, o[i], z[i + 1]);
  return erg;
}

const VORRANG_OPS = ["+", "-", "*"] as const;

function vorrangGlieder(rng: Zufall, glieder: number, zahlMax: number, mitPotenzen: boolean) {
  const n = Math.max(3, glieder);
  const zahlen = Array.from({ length: n }, () => ganz(rng, 1, Math.max(2, zahlMax)));
  if (mitPotenzen) zahlen[n - 1] = (zahlen[n - 1] % 9) + 2;
  const ops = Array.from({ length: n - 1 }, () => eines(rng, VORRANG_OPS));
  return { zahlen, ops };
}

function vorrangZeile(zahlen: number[], ops: string[], potenzLetztes: boolean, klammerBis?: number): string {
  const zt = zahlen.map((z, i) => (potenzLetztes && i === zahlen.length - 1 ? `${z}^2` : String(z)));
  if (klammerBis === undefined || klammerBis === 0) {
    let s = zt[0];
    for (let i = 0; i < ops.length; i++) s += ` ${ops[i]}${zt[i + 1]}`;
    return `${s} =`;
  }
  let klammer = `(${zt[0]}`;
  for (let i = 0; i < klammerBis; i++) klammer += ` ${ops[i]}${zt[i + 1]}`;
  klammer += ")";
  let s = klammer;
  for (let i = klammerBis; i < ops.length; i++) s += ` ${ops[i]}${zt[i + 1]}`;
  return `${s} =`;
}

function vorrangWert(zahlen: number[], ops: string[], potenzLetztes: boolean, klammerBis?: number): number {
  const z = zahlen.map((zi, i) => (potenzLetztes && i === zahlen.length - 1 ? zi * zi : zi));
  return bewerte(z, ops, klammerBis);
}

export interface VorrangRechnungP {
  /** Anzahl der Zahlen, mindestens 3. */
  glieder: number;
  mitKlammern?: boolean;
  mitPotenzen?: boolean;
  zahlMax: number;
  /** Dieselben Zahlen einmal ohne, einmal mit Klammer um die Vorrangregel zu zeigen. */
  paar?: boolean;
}

export function vorrangRechnung(rng: Zufall, p: VorrangRechnungP): Kern {
  const { zahlen, ops } = vorrangGlieder(rng, p.glieder, p.zahlMax, !!p.mitPotenzen);
  const potenz = !!p.mitPotenzen;
  const kb = ops.length > 1 ? 1 : undefined;

  if (p.paar) {
    const angabeOhne = vorrangZeile(zahlen, ops, potenz);
    const wertOhne = vorrangWert(zahlen, ops, potenz);
    const angabeMit = vorrangZeile(zahlen, ops, potenz, kb);
    const wertMit = vorrangWert(zahlen, ops, potenz, kb);
    const angabe = `${angabeOhne}${wertOhne}\n${angabeMit}`;
    return { sorte: "direkt", op: "term", angabe, loesung: String(wertMit), zahlen };
  }

  const klammerBis = p.mitKlammern ? kb : undefined;
  const angabe = vorrangZeile(zahlen, ops, potenz, klammerBis);
  const erg = vorrangWert(zahlen, ops, potenz, klammerBis);
  return { sorte: "direkt", op: "term", angabe, loesung: String(erg), zahlen };
}

export interface TermZusammenfassenP {
  variablen: readonly string[];
  gliederMax: number;
  koeffMax: number;
}

export function termZusammenfassen(rng: Zufall, p: TermZusammenfassenP): Kern {
  const anzahl = ganz(rng, 3, Math.max(3, p.gliederMax));
  const summen = new Map<string, number>();
  const glieder: string[] = [];
  for (let i = 0; i < anzahl; i++) {
    const v = eines(rng, p.variablen);
    let k = ganz(rng, 1, p.koeffMax) * (i > 0 && rng() < 0.5 ? -1 : 1);
    if (k === 0) k = 1;
    summen.set(v, (summen.get(v) ?? 0) + k);
    glieder.push(termGlied(k, v, i === 0));
  }
  const angabe = `${glieder.join(" ")} =`;
  const loesung = [...summen.entries()].filter(([, k]) => k !== 0)
    .map(([v, k], i) => termGlied(k, v, i === 0)).join(" ") || "0";
  return { sorte: "direkt", op: "term", angabe, loesung, zahlen: [] };
}

function spalteGlied(glied: string): [number, string] {
  const m = /^(-?\d*)([a-z])$/.exec(glied)!;
  const zahlteil = m[1];
  const k = zahlteil === "" ? 1 : zahlteil === "-" ? -1 : Number(zahlteil);
  return [k, m[2]];
}

export interface KlammerAufloesenP {
  /** Glieder in der Klammer, 2 oder 3. */
  gliederMax: number;
  koeffMax: number;
  variablen: readonly string[];
}

/** Minus vor der Klammer: „5x -(2x -3) =" - alle Klammerglieder kippen. */
export function klammerAufloesen(rng: Zufall, p: KlammerAufloesenP): Kern {
  const anzahl = Math.max(2, Math.min(3, p.gliederMax));
  const vorKlammer = termGlied(ganz(rng, 1, p.koeffMax), eines(rng, p.variablen), true);
  const innen: { k: number; v: string }[] = [];
  for (let i = 0; i < anzahl; i++) {
    let k = ganz(rng, 1, p.koeffMax) * (rng() < 0.5 ? -1 : 1);
    if (k === 0) k = 1;
    innen.push({ k, v: eines(rng, p.variablen) });
  }
  const klammerText = innen.map((g, i) => termGlied(g.k, g.v, i === 0)).join(" ");
  const angabe = `${vorKlammer} -(${klammerText}) =`;

  const summen = new Map<string, number>();
  const [vk, vv] = spalteGlied(vorKlammer);
  summen.set(vv, vk);
  for (const g of innen) summen.set(g.v, (summen.get(g.v) ?? 0) - g.k);
  const loesung = [...summen.entries()].filter(([, k]) => k !== 0)
    .map(([v, k], i) => termGlied(k, v, i === 0)).join(" ") || "0";
  return { sorte: "direkt", op: "term", angabe, loesung, zahlen: [] };
}

export interface AusmultiplizierenP {
  koeffMax: number;
  gliederMax: number;
  variablen: readonly string[];
  richtung?: "hin" | "zurueck" | "beide";
}

/** Faktor mal Klammer - und die Umkehrung, das Herausheben. */
export function ausmultiplizieren(rng: Zufall, p: AusmultiplizierenP): Kern {
  const richtung = p.richtung ?? "beide";
  const rueckwaerts = richtung === "zurueck" ? true : richtung === "hin" ? false : rng() < 0.5;
  const faktor = ganz(rng, 2, p.koeffMax);
  const anzahl = Math.max(2, Math.min(3, p.gliederMax));
  let glieder: { k: number; v: string }[] = [];
  // ★ Die Glieder in der Klammer haben keinen gemeinsamen Teiler mehr. Sonst
  // wäre beim Herausheben nicht der ganze Faktor draussen: aus `20x +40x
  // +10y` wurde `5 *(4x +8x +2y)`, und das richtige `10 *(2x +4x +y)` galt
  // als falsch. Gemessen am 23.09.2026.
  for (let versuch = 0; versuch < 100; versuch++) {
    glieder = [];
    for (let i = 0; i < anzahl; i++) {
      let k = ganz(rng, 1, p.koeffMax) * (rng() < 0.5 ? -1 : 1);
      if (k === 0) k = 1;
      glieder.push({ k, v: eines(rng, p.variablen) });
    }
    if (glieder.map((g) => g.k).reduce((x, y) => ggT(x, y)) === 1) break;
  }
  if (rueckwaerts) {
    for (const g of glieder) g.k *= faktor;
    const ausmultipliziert = glieder.map((g, i) => termGlied(g.k, g.v, i === 0)).join(" ");
    const geheftet = glieder.map((g, i) => termGlied(g.k / faktor, g.v, i === 0)).join(" ");
    return { sorte: "direkt", op: "term", angabe: `${ausmultipliziert} =`, loesung: `${faktor} *(${geheftet})`, zahlen: [] };
  }
  const klammerText = glieder.map((g, i) => termGlied(g.k, g.v, i === 0)).join(" ");
  const ergebnisText = glieder.map((g, i) => termGlied(g.k * faktor, g.v, i === 0)).join(" ");
  return { sorte: "direkt", op: "term", angabe: `${faktor} *(${klammerText}) =`, loesung: ergebnisText, zahlen: [] };
}

export interface BinomP {
  koeffMax: number;
  variablen: readonly string[];
}

/** Binom mal Monom, oder Binom mal Binom - eine Variable je Aufgabe. */
export function binom(rng: Zufall, p: BinomP): Kern {
  const v = eines(rng, p.variablen);
  const art = eines(rng, ["monom", "binom"] as const);
  const a1 = zufKoeff(rng, p.koeffMax);
  const b1 = zufKoeff(rng, p.koeffMax);
  if (art === "monom") {
    const c = zufKoeff(rng, p.koeffMax) || 1;
    const angabe = `${termGliedPotenz(c, v, 1, true)} *(${binomText(a1, b1, v)}) =`;
    return { sorte: "direkt", op: "term", angabe, loesung: termAusQuadr(v, c * a1, c * b1, 0), zahlen: [] };
  }
  const a2 = zufKoeff(rng, p.koeffMax);
  const b2 = zufKoeff(rng, p.koeffMax);
  const angabe = `(${binomText(a1, b1, v)}) *(${binomText(a2, b2, v)}) =`;
  const loesung = termAusQuadr(v, a1 * a2, a1 * b2 + a2 * b1, b1 * b2);
  return { sorte: "direkt", op: "term", angabe, loesung, zahlen: [] };
}

export interface BinomischeFormelP {
  koeffMax: number;
  variable: string;
  formel?: "plus" | "minus" | "differenz" | "alle";
}

/** Die drei binomischen Formeln, in beide Richtungen: anwenden und wiedererkennen. */
export function binomischeFormel(rng: Zufall, p: BinomischeFormelP): Kern {
  const v = p.variable;
  const arten = p.formel && p.formel !== "alle" ? [p.formel] : (["plus", "minus", "differenz"] as const);
  const art = eines(rng, arten);
  const a = ganz(rng, 1, p.koeffMax);
  const b = ganz(rng, 1, p.koeffMax);
  const anwendenRichtung = rng() < 0.5;

  if (art === "differenz") {
    const angabe = anwendenRichtung
      ? `(${binomText(a, b, v)}) *(${binomText(a, -b, v)}) =`
      : `${termAusQuadr(v, a * a, 0, -(b * b))} =`;
    const loesung = anwendenRichtung
      ? termAusQuadr(v, a * a, 0, -(b * b))
      : `(${binomText(a, b, v)}) *(${binomText(a, -b, v)})`;
    return { sorte: "direkt", op: "term", angabe, loesung, zahlen: [a, b] };
  }
  const vzB = art === "plus" ? b : -b;
  const angabe = anwendenRichtung
    ? `(${binomText(a, vzB, v)})^2 =`
    : `${termAusQuadr(v, a * a, 2 * a * vzB, b * b)} =`;
  const loesung = anwendenRichtung
    ? termAusQuadr(v, a * a, 2 * a * vzB, b * b)
    : `(${binomText(a, vzB, v)})^2`;
  return { sorte: "direkt", op: "term", angabe, loesung, zahlen: [a, b] };
}

/* ================================================================== */
/* Größen und Verhältnisse                                              */
/* ================================================================== */

export interface VerhaeltnisKuerzenP {
  max: number;
}

export function verhaeltnisKuerzen(rng: Zufall, p: VerhaeltnisKuerzenP): Kern {
  const g = ganz(rng, 2, 12);
  const a0 = ganz(rng, 1, Math.max(1, Math.floor(p.max / g)));
  const b0 = ganz(rng, 1, Math.max(1, Math.floor(p.max / g)));
  const a = a0 * g;
  const b = b0 * g;
  const [ak, bk] = bruchKuerzeZN(a, b);
  return { sorte: "direkt", op: "zahlen", angabe: `${a} : ${b} kürzen =`, loesung: `${ak} : ${bk}`, zahlen: [a, b] };
}

export interface MassstabP {
  mMax: number;
}

const MASSSTAEBE = [10, 20, 25, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 25000, 50000] as const;

export function massstab(rng: Zufall, p: MassstabP): Kern {
  const auswahl = MASSSTAEBE.filter((x) => x <= p.mMax);
  const m = eines(rng, auswahl.length ? auswahl : [10]);
  const gefragt = eines(rng, ["bild", "wirklich"] as const);
  // ★ Das Bild bleibt klein genug, dass „wirklich" nicht siebenstellig wird -
  // und die Zeile die Braillezeile nicht sprengt.
  const bildCmMax = Math.max(1, Math.min(50, Math.floor(30000 / m)));
  const bildCm = ganz(rng, 1, bildCmMax);
  const wirklichCm = bildCm * m;
  if (gefragt === "bild") {
    return {
      sorte: "direkt", op: "zahlen", angabe: `1 : ${m}; wirklich ${wirklichCm} cm; Bild =`,
      loesung: `${bildCm} cm`, zahlen: [m, wirklichCm],
    };
  }
  return {
    sorte: "direkt", op: "zahlen", angabe: `1 : ${m}; Bild ${bildCm} cm; wirklich =`,
    loesung: `${wirklichCm} cm`, zahlen: [m, bildCm],
  };
}
