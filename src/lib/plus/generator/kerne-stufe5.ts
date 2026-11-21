/**
 * Plus - zusätzliche Kerne für Stufe 5 (Dezimalzahlen und die Ordnung der
 * Rechenarten).
 *
 * Fast alles, was Stufe 5 braucht, steht schon in `kerne-zahlbereiche.ts`
 * (Brüche, Dezimalzahlen, Vorrangregeln) - siehe `zuordnung-stufe5.ts`. Hier
 * stehen nur die Bauarten, für die es dort kein passendes Werkzeug gibt: der
 * gemischte Zahlenstrahl (5-01), Schranken um eine Rechnung (5-02),
 * Rechengesetze, die wirklich vereinfachen (5-05), Dezimalzahlen lesen,
 * vergleichen und ihre Nachbarn nennen (5-06), Dezimalmal mit gedeckelter
 * Nachkommastellen-Summe (5-09), Bruchteile von Größen mit Einheit (5-16)
 * und die zwei Kerne, deren Form (Strategiewahl, Sachaufgabe) noch nicht
 * gebaut ist (5-18, 5-19).
 */
import { LUECKE, ZEICHEN, eines, ganz, rechnungMit, zahl, type Operation } from "../aufgabe";
import type { Kern, Zufall } from "./kerne";
import { dezimalOrdnen, vorrangRechnung, type DezimalOrdnenP, type VorrangRechnungP } from "./kerne-zahlbereiche";

/* ------------------------------------------------------------------ */
/* 5-03/5-04 Vorrangregeln - kein negatives Ergebnis                    */
/* ------------------------------------------------------------------ */

/**
 * `vorrangRechnung` würfelt Plus, Minus und Mal frei gemischt - bei „11 -6
 * *19" wird das Ergebnis negativ. Stufe 5 rechnet nur mit nicht-negativen
 * Zahlen (siehe Stoffplan-Leitidee), darum wird hier neu gewürfelt, bis das
 * Ergebnis passt.
 */
/** Erkennt ein eingebettetes negatives Ergebnis - „=" direkt gefolgt von „-". */
function hatNegativesErgebnis(kern: Kern): boolean {
  if (kern.sorte !== "direkt") return false;
  return kern.angabe.includes("=-") || Number(kern.loesung) < 0;
}

export function vorrangNatuerlich(rng: Zufall, p: VorrangRechnungP): Kern {
  let kern = vorrangRechnung(rng, p);
  for (let versuch = 0; versuch < 50 && hatNegativesErgebnis(kern); versuch++) {
    kern = vorrangRechnung(rng, p);
  }
  return kern;
}

/* ------------------------------------------------------------------ */
/* 5-01 Stellenwert und Zahlenstrahl                                    */
/* ------------------------------------------------------------------ */

export interface StellenwertMischP {
  ganzMax: number;
  nachkommaMax: number;
}

/** Zufällig eine natürliche Zahl oder eine Dezimalzahl - „gemischt einordnen". */
function zahlOderDezimal(rng: Zufall, p: StellenwertMischP): number {
  if (rng() < 0.5) return ganz(rng, 0, p.ganzMax);
  const ganzteil = ganz(rng, 0, Math.min(p.ganzMax, 999));
  const nachkomma = ganz(rng, 1, Math.max(1, p.nachkommaMax));
  const nachMax = 10 ** nachkomma - 1;
  const nach = Math.max(1, ganz(rng, 1, nachMax));
  return Number(`${ganzteil}.${String(nach).padStart(nachkomma, "0")}`);
}

/**
 * Zwei Zahlen vergleichen - natürliche Zahl oder Dezimalzahl, gemischt.
 * Drei Fassungen: das Vergleichszeichen als Lücke, eine Wahr-Falsch-
 * Behauptung darüber und die Rückfrage, welche Zahl größer ist.
 */
/**
 * Eine Zahl in der Nähe - sie unterscheidet sich in einer Stelle, nicht in der
 * Größenordnung.
 */
function nachbarZahl(a: number, rng: Zufall): number {
  const nachkomma = String(a).includes(".") ? String(a).split(".")[1].length : 0;
  const schritt = 10 ** -nachkomma;
  const weite = Math.max(1, Math.round(Math.abs(a) * 0.08 / schritt));
  const versatz = (ganz(rng, 1, weite) * (rng() < 0.5 ? -1 : 1)) * schritt;
  const b = Math.round((a + versatz) / schritt) * schritt;
  return Number(b.toFixed(nachkomma));
}

export function stellenwertMischVergleich(rng: Zufall, p: StellenwertMischP): Kern {
  const a = zahlOderDezimal(rng, p);
  // ★ Die zweite Zahl liegt in der NÄHE der ersten. Gemessen am 23.09.2026
  // kam „Größer: 772,6 oder 592165?" heraus - das ist kein Vergleich, das ist
  // ein Blick auf die Länge. Wer Dezimalzahlen vergleichen übt, braucht zwei
  // Zahlen, bei denen es auf die Stelle ankommt.
  let b = nachbarZahl(a, rng);
  for (let versuch = 0; versuch < 20 && b === a; versuch++) b = nachbarZahl(a, rng);

  const zeichen = a > b ? ">" : a < b ? "<" : "=";
  const behauptetRichtig = rng() < 0.5;
  const falsche = (["<", ">", "="] as const).filter((z) => z !== zeichen);
  const behauptet = behauptetRichtig ? zeichen : eines(rng, falsche);
  const groesserText = zeichen === "=" ? "gleich groß" : zeichen === ">" ? zahl(a) : zahl(b);

  return {
    sorte: "direkt", op: "zahlen",
    angabe: `${zahl(a)} ${LUECKE} ${zahl(b)}`,
    loesung: zeichen,
    zahlen: [a, b],
    varianten: [
      {
        angabe: `${zahl(a)} ${behauptet} ${zahl(b)} - stimmt das?`,
        loesung: behauptetRichtig ? "ja" : "nein",
        auchRichtig: behauptetRichtig ? ["stimmt", "richtig"] : ["stimmt nicht", "falsch"],
      },
      {
        angabe: `Größer: ${zahl(a)} oder ${zahl(b)}?`,
        loesung: groesserText,
        auchRichtig: zeichen === "=" ? ["gleich", "gleich gross"] : undefined,
      },
    ],
  };
}

/* ------------------------------------------------------------------ */
/* 5-02 Runden und Schranken                                            */
/* ------------------------------------------------------------------ */

export interface SchrankenRechnungP {
  min: number;
  max: number;
}

/** Zehnerstufe der führenden Stelle - 4738 -> 1000, 58 -> 10. */
function stufeFuerSchranke(n: number): number {
  const digits = String(Math.max(1, Math.floor(Math.abs(n)))).length;
  const exp = Math.max(1, Math.min(5, digits - 1));
  return 10 ** exp;
}

/** Auf die führende Stelle runden - für den Schätzwert. */
function rundeFuehrend(n: number): number {
  const digits = String(Math.max(1, Math.floor(Math.abs(n)))).length;
  const stufe = digits <= 1 ? 1 : 10 ** (digits - 1);
  return Math.round(n / stufe) * stufe;
}

/**
 * Was bei „Schätze:" auch gilt.
 *
 * ★ Gemessen am 23.09.2026: nur die ganze Zeile `4000 +1000 =5000` galt. Ein
 * Kind, das `5000` schrieb - die Schätzung, nach der gefragt war -, bekam
 * „Noch nicht". Und wer eine Stelle genauer rundete (`4100 +1000 =5100`),
 * hat nicht falsch geschätzt, sondern besser. Beides gilt jetzt.
 */
function schaetzungenAuchRichtig(
  a: number, b: number, op: "plus" | "minus", ga: number, gb: number, geschaetzt: number,
): string[] {
  const genauer = (n: number) => {
    const digits = String(Math.max(1, Math.floor(Math.abs(n)))).length;
    const stufe = digits <= 2 ? 1 : 10 ** (digits - 2);
    return Math.round(n / stufe) * stufe;
  };
  const ha = genauer(a), hb = genauer(b);
  const hGeschaetzt = op === "plus" ? ha + hb : ha - hb;
  const raus = [zahl(geschaetzt), rechnungMit(ha, op, hb, hGeschaetzt), zahl(hGeschaetzt)];
  return [...new Set(raus)].filter((t) => t !== rechnungMit(ga, op, gb, geschaetzt));
}

/**
 * Zu einer Plus- oder Minusaufgabe werden Schranken (untere und obere,
 * jeweils eine glatte Zehnerstufe) und ein Schätzwert verlangt. ★ Die
 * Schranken sind so gewählt, dass das echte Ergebnis nie genau auf der
 * Schranke liegt - sonst wäre „stimmt das?" keine klare Frage.
 */
export function schrankenRechnung(rng: Zufall, p: SchrankenRechnungP): Kern {
  const op = eines(rng, ["plus", "minus"] as const);
  let a = 0, b = 0, ergebnis = 0, stufe = 10, untere = 0, obere = 0, ga = 0, gb = 0, geschaetzt = 0;

  for (let versuch = 0; versuch < 200; versuch++) {
    a = ganz(rng, p.min, p.max);
    b = ganz(rng, p.min, p.max);
    if (op === "minus" && b > a) [a, b] = [b, a];
    ergebnis = op === "plus" ? a + b : a - b;
    stufe = stufeFuerSchranke(ergebnis);
    if (ergebnis % stufe === 0) continue;
    untere = Math.floor(ergebnis / stufe) * stufe;
    obere = untere + stufe;
    ga = rundeFuehrend(a);
    gb = rundeFuehrend(b);
    geschaetzt = op === "plus" ? ga + gb : ga - gb;
    if (op === "minus" && geschaetzt < 0) continue;
    break;
  }

  const zeichen = ZEICHEN[op];
  const stimmt = rng() < 0.5;
  const nachUnten = rng() < 0.5;
  const uUnten = stimmt ? untere : Math.max(0, nachUnten ? untere - stufe : untere + stufe);
  const uOben = stimmt ? obere : uUnten + stufe;

  return {
    sorte: "direkt", op: "gemischt",
    angabe: `${zahl(a)} ${zeichen}${zahl(b)} =\nzwischen ${zahl(uUnten)} und ${zahl(uOben)} - stimmt das?`,
    loesung: stimmt ? "ja" : "nein",
    auchRichtig: stimmt ? ["stimmt", "richtig"] : ["stimmt nicht", "falsch"],
    zahlen: [a, b],
    varianten: [
      {
        angabe: `Schätze: ${zahl(a)} ${zeichen}${zahl(b)} =`,
        loesung: rechnungMit(ga, op, gb, geschaetzt),
        auchRichtig: schaetzungenAuchRichtig(a, b, op, ga, gb, geschaetzt),
      },
    ],
  };
}

/* ------------------------------------------------------------------ */
/* 5-05 Rechengesetze nutzen                                            */
/* ------------------------------------------------------------------ */

export interface RechengesetzP {
  zahlMax: number;
  cMax: number;
}

/**
 * Zwei Sorten, beide so gebaut, dass Umstellen wirklich lohnt: Herausheben
 * (derselbe Faktor auf beiden Seiten von Plus - Verteilungsgesetz) oder ein
 * Partner, der zusammen mit dem dritten Summanden glatt auf eine Zehner-
 * oder Hunderterstufe geht (Verbindungsgesetz).
 */
export function rechengesetz(rng: Zufall, p: RechengesetzP): Kern {
  const art = eines(rng, ["distributiv", "assoziativ"] as const);

  if (art === "distributiv") {
    const c = ganz(rng, 2, Math.max(2, p.cMax));
    const a = ganz(rng, 2, p.zahlMax);
    const b = ganz(rng, 2, p.zahlMax);
    const ergebnis = (a + b) * c;
    return {
      sorte: "direkt", op: "gemischt",
      angabe: `${a} *${c} +${b} *${c} =`,
      loesung: zahl(ergebnis),
      zahlen: [a, b, c],
    };
  }

  const stufe = eines(rng, [10, 100] as const);
  const partner = ganz(rng, 1, stufe - 1);
  const rest = stufe - partner;
  const x = ganz(rng, 1, p.zahlMax);
  const ergebnis = x + partner + rest;
  return {
    sorte: "direkt", op: "gemischt",
    angabe: `${x} +${partner} +${rest} =`,
    loesung: zahl(ergebnis),
    zahlen: [x, partner, rest],
  };
}

/* ------------------------------------------------------------------ */
/* 5-06 Dezimalzahlen lesen und ordnen                                   */
/* ------------------------------------------------------------------ */

export interface DezimalLesenOrdnenP {
  anzahl: number;
  nachkommaMax: number;
  ganzMax: number;
}

/**
 * Ein Zahlenpaar für den Vergleich - meistens bewusst mit der Falle „mehr
 * Nachkommastellen wirkt größer": 0,7 gegen 0,65 (0,7 ist größer, obwohl es
 * weniger Ziffern zeigt).
 */
function vergleichsPaarMitFalle(rng: Zufall, ganzMax: number): { a: number; b: number } {
  const ganzteil = ganz(rng, 0, ganzMax);
  const zehntel = ganz(rng, 2, 9);
  let hundertstel = ganz(rng, 1, zehntel * 10 - 1);
  if (hundertstel % 10 === 0) hundertstel += 1; // bleibt echt zweistellig
  return {
    a: Number(`${ganzteil}.${zehntel}`),
    b: Number(`${ganzteil}.${String(hundertstel).padStart(2, "0")}`),
  };
}

/** Ein gewöhnliches Vergleichspaar - unabhängig gewürfelt, ohne die Falle. */
function vergleichsPaarGewoehnlich(rng: Zufall, nachkommaMax: number, ganzMax: number): { a: number; b: number } {
  const ganzteil = ganz(rng, 0, ganzMax);
  const nachkomma = ganz(rng, 1, Math.max(1, nachkommaMax));
  const nachMax = 10 ** nachkomma - 1;
  const nachA = Math.max(1, ganz(rng, 1, nachMax));
  let nachB = Math.max(1, ganz(rng, 1, nachMax));
  for (let versuch = 0; versuch < 20 && nachB === nachA; versuch++) nachB = Math.max(1, ganz(rng, 1, nachMax));
  return {
    a: Number(`${ganzteil}.${String(nachA).padStart(nachkomma, "0")}`),
    b: Number(`${ganzteil}.${String(nachB).padStart(nachkomma, "0")}`),
  };
}

/** Die beiden Nachbarn einer Dezimalzahl an derselben Stelle (Zehntel/Hundertstel). */
function nachbarnFassung(rng: Zufall, ganzMax: number): { angabe: string; loesung: string } {
  const stelle = eines(rng, ["Zehntel", "Hundertstel"] as const);
  const schritt = stelle === "Zehntel" ? 0.1 : 0.01;
  const ganzteil = ganz(rng, 0, ganzMax);
  const ziffer = ganz(rng, 1, 9);
  const z = Math.round((ganzteil + ziffer * schritt) * 100) / 100;
  const unten = Math.round((z - schritt) * 100) / 100;
  const oben = Math.round((z + schritt) * 100) / 100;
  return {
    angabe: `Welche ${stelle} liegen neben ${zahl(z)}?`,
    loesung: `${zahl(unten)} und ${zahl(oben)}`,
  };
}

/**
 * Drei Fassungen derselben Sache: die Menge der Größe nach ordnen (aus
 * `dezimalOrdnen`), zwei Zahlen vergleichen - mit der belegten Falle „mehr
 * Nachkommastellen wirkt größer" - und die Nachbarn einer Dezimalzahl an
 * derselben Stelle nennen.
 */
export function dezimalLesenOrdnen(rng: Zufall, p: DezimalLesenOrdnenP): Kern {
  const ordnenKern = dezimalOrdnen(rng, { anzahl: p.anzahl, nachkommaMax: p.nachkommaMax, ganzMax: p.ganzMax } as DezimalOrdnenP);
  if (ordnenKern.sorte !== "direkt") throw new Error("dezimalOrdnen liefert immer einen direkten Kern");

  const { a: va, b: vb } = rng() < 0.65
    ? vergleichsPaarMitFalle(rng, p.ganzMax)
    : vergleichsPaarGewoehnlich(rng, p.nachkommaMax, p.ganzMax);
  const vergleichZeichen = va > vb ? ">" : va < vb ? "<" : "=";
  const vergleichLoesung = vergleichZeichen === "=" ? "gleich groß" : vergleichZeichen === ">" ? zahl(va) : zahl(vb);

  const nachbar = nachbarnFassung(rng, p.ganzMax);

  return {
    sorte: "direkt", op: "zahlen",
    angabe: ordnenKern.angabe,
    loesung: ordnenKern.loesung,
    zahlen: ordnenKern.zahlen,
    varianten: [
      {
        angabe: `Was ist größer: ${zahl(va)} oder ${zahl(vb)}?`,
        loesung: vergleichLoesung,
        auchRichtig: vergleichZeichen === "=" ? ["gleich", "gleich gross"] : undefined,
      },
      {
        angabe: nachbar.angabe,
        loesung: nachbar.loesung,
        auchRichtig: [nachbar.loesung.replace(" und ", ", ")],
      },
    ],
  };
}

/* ------------------------------------------------------------------ */
/* 5-09 Mal mit Dezimalzahlen - Nachkommastellen insgesamt gedeckelt    */
/* ------------------------------------------------------------------ */

export interface MalDezimalBegrenztP {
  ganzMax: number;
}

function dezimalMitStellen(rng: Zufall, ganzMax: number, nachkomma: number): number {
  const ganzteil = ganz(rng, 0, ganzMax);
  if (nachkomma === 0) return ganzteil;
  const nachMax = 10 ** nachkomma - 1;
  const nach = Math.max(1, ganz(rng, 1, nachMax));
  return Number(`${ganzteil}.${String(nach).padStart(nachkomma, "0")}`);
}

/**
 * Zwei Faktoren mit Nachkommastellen, deren Summe (nicht jeder für sich)
 * höchstens drei ist - „bis drei Nachkommastellen insgesamt" aus dem
 * Stoffplan. `dezimalRechnung` würfelt beide Seiten unabhängig und kann das
 * nicht zusichern, darum dieser eigene, kleine Kern.
 */
export function malDezimalBegrenzt(rng: Zufall, p: MalDezimalBegrenztP): Kern {
  const gesamt = eines(rng, [2, 3] as const);
  const na = ganz(rng, 1, gesamt - 1);
  const nb = gesamt - na;
  const a = dezimalMitStellen(rng, p.ganzMax, na);
  const b = dezimalMitStellen(rng, p.ganzMax, nb);
  const ergebnis = Math.round(a * b * 1e6) / 1e6;
  return { sorte: "rechnung", op: "mal", a, b, ergebnis };
}

/* ------------------------------------------------------------------ */
/* 5-16 Anteile und Bruchteile von Größen                               */
/* ------------------------------------------------------------------ */

export interface AnteilVonGroesseP {
  nennerMax: number;
  mengeMax: number;
}

/** Einheiten, die im Kopf rechenbar bleiben - keine Umrechnung nötig. */
const EINHEITEN_ANTEIL = ["kg", "g", "m", "cm", "min", "EUR"] as const;

/**
 * `anteilVonMenge` aus dem Werkzeugkasten liefert nur eine nackte Zahl - der
 * Stoffplan verlangt aber „3/4 von 20 kg", nicht „3/4 von 20". Dieselbe
 * Rechnung (die Größe ist immer durch den Nenner teilbar), mit Einheit in
 * der Angabe und im Ergebnis.
 */
export function anteilVonGroesse(rng: Zufall, p: AnteilVonGroesseP): Kern {
  const einheit = eines(rng, EINHEITEN_ANTEIL);
  const n = ganz(rng, 2, Math.max(4, p.nennerMax));
  const z = ganz(rng, 1, n - 1);
  const vielfache = Math.max(1, Math.floor(p.mengeMax / n));
  const menge = n * ganz(rng, 1, vielfache);
  const ergebnis = (menge / n) * z;
  return {
    sorte: "direkt", op: "bruch",
    angabe: `${z}/${n} von ${zahl(menge)} ${einheit} =${LUECKE} ${einheit}`,
    loesung: zahl(ergebnis),
    zahlen: [z, n, menge],
  };
}

/* ------------------------------------------------------------------ */
/* 5-19 Sachaufgaben mit Größen - der Kern wartet auf seine Form         */
/* ------------------------------------------------------------------ */

export interface SachaufgabeGroessenP {
  stueckMax: number;
  mengeMax: number;
  zusatzMax: number;
}

interface EinheitSach { kurz: string; woertlich: string }

const EINHEITEN_SACH: readonly EinheitSach[] = [
  { kurz: "EUR", woertlich: "Stück" },
  { kurz: "kg", woertlich: "Pakete" },
  { kurz: "m", woertlich: "Rollen" },
];

/**
 * Mehrschrittig: Stückpreis mal Menge, dazu ein fixer Zuschlag - Preise,
 * Massen oder Längen mit Einheit. Die Form „sach"/„fermi" gibt es noch
 * nicht (siehe 4-18); dieser Kern liefert schon die richtige Rechnung.
 */
export function sachaufgabeGroessen(rng: Zufall, p: SachaufgabeGroessenP): Kern {
  const einheit = eines(rng, EINHEITEN_SACH);
  const stueckGanz = ganz(rng, 1, p.stueckMax);
  const stueckNach = ganz(rng, 0, 99);
  const stueckpreis = Math.round((stueckGanz + stueckNach / 100) * 100) / 100;
  const menge = ganz(rng, 2, p.mengeMax);
  const zusatzGanz = ganz(rng, 0, p.zusatzMax);
  const zusatzNach = ganz(rng, 0, 99);
  const zusatz = Math.round((zusatzGanz + zusatzNach / 100) * 100) / 100;
  const gesamt = Math.round((stueckpreis * menge + zusatz) * 100) / 100;
  const op: Operation = "gemischt";
  return {
    sorte: "direkt", op,
    angabe: `${menge} ${einheit.woertlich} zu ${zahl(stueckpreis)} ${einheit.kurz}, dazu ${zahl(zusatz)} ${einheit.kurz}: Gesamt?`,
    loesung: zahl(gesamt),
    zahlen: [stueckpreis, menge, zusatz, gesamt],
  };
}
