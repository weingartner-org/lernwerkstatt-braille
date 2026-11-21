/**
 * Schriftliches Rechnen in Zeilen - der Weg, Schritt für Schritt.
 *
 * ★ KEINE SPALTEN. Das ist nicht Geschmack, sondern belegt: die Schwierigkeit
 * des schriftlichen Rechnens auf der Braillezeile liegt darin, den Schreibkopf
 * unter die richtige Spalte zu setzen und für jeden Stellenwert zurückzu-
 * springen. Die adaptierten Bücher rechnen deshalb in Zeilen.
 *
 * ★ Die Sprechwege stehen hier nicht frei formuliert da. Sie sind wörtlich aus
 * „Mathematik in linearer Darstellung" (eine Helferin, BBI, Februar 2010)
 * übernommen - dem Werk, aus dem auch die Schreibweise von Plus stammt:
 *
 *   Addition, S. 10:  „Jetzt addiere ich die Einer: 5 plus 8 ist 13, 3 an,
 *                      1 weiter"
 *   Subtraktion, S. 15: „Ich beginne mit den Einern. 8 und wie viel ist 14,
 *                      8 und 6 ist 14, 6 an, 1 weiter"
 *
 * Das Ergebnis wächst dabei von rechts nach links - Ziffer für Ziffer, wie es
 * auf der Zeile entsteht. Genau das macht den Weg nachvollziehbar.
 *
 * Die Division steht anders da, mit ausgeschriebenen Stellenwerten
 * („Plus - Didaktisch-methodische Struktur", Abschnitt 3.3):
 *
 *     474 /3 =[]
 *     4 H /3 =1 H Rest: 1 H
 *     17 Z /3 =5 Z Rest: 2 Z
 *     24 E /3 =8 E
 *
 * ★ Der Übertrag wird NICHT notiert, sondern im Kopf behalten - die App bietet
 * ihn als abrufbare Merkhilfe an, die man sich holen kann, ohne die Aufgabe zu
 * verlieren. Deshalb trägt jeder Schritt seinen Übertrag mit.
 */
import { rechnungMit, zahl, type Operation } from "./aufgabe";

/**
 * Die Stellenwerte, wie die Bücher sie abkürzen.
 *
 * ★ Bis zu den Hunderttausendern. Gemessen am 23.09.2026: hier endete die
 * Liste bei T, und Paket 4-05 (`313910 +2365`) sagte „Ich addiere die
 * Stelle 5". Die Division durch eine einstellige Zahl nahm bei fünf Stellen
 * sogar den falschen Namen.
 */
export const STELLEN = ["E", "Z", "H", "T", "ZT", "HT"] as const;

export interface Schritt {
  /** Was zu tun ist - wörtlich der Sprechweg. */
  satz: string;
  /** Wie die Zeile nach diesem Schritt aussieht. */
  zeile: string;
  /** Was im Kopf zu behalten ist. 0 heißt: nichts. */
  merke: number;
}

export interface Weg {
  /** Die Angabe, wie sie oben steht. */
  angabe: string;
  schritte: Schritt[];
  /** Das Ergebnis in der Schreibweise von Plus. */
  ergebnis: string;
  /** Weitere Schreibweisen, die auch gelten. */
  auchRichtig?: string[];
}

/** Die Ziffern einer Zahl von hinten - Einer zuerst. */
function ziffern(n: number, mindestens = 1): number[] {
  const s = String(Math.abs(Math.trunc(n))).split("").reverse().map(Number);
  while (s.length < mindestens) s.push(0);
  return s;
}

/** Der Name eines Stellenwerts in der Mehrzahl - „die Einer". */
function stellenname(i: number): string {
  return ["Einer", "Zehner", "Hunderter", "Tausender", "Zehntausender", "Hunderttausender"][i] ?? `Stelle ${i + 1}`;
}

/**
 * Derselbe Name nach „mit den" - „mit den Einern".
 *
 * ★ Kein Zierrat: der Sprechweg wird vorgelesen. „Ich beginne mit den Einer"
 * klingt falsch, und ein Kind, das nur zuhört, hat keine zweite Quelle. Im
 * Buch steht „mit den Einern" (Stanetty S. 15).
 */
function stellennameDativ(i: number): string {
  return `${stellenname(i)}n`;
}

/* ------------------------------------------------------------------ */
/* Addition                                                             */
/* ------------------------------------------------------------------ */

/**
 * Der Weg der schriftlichen Addition.
 *
 * Wörtlich nach Stanetty S. 10: je Stellenwert die beiden Ziffern, dann
 * „<Ziffer> an, <Übertrag> weiter". Der untere Summand wird zuerst genannt -
 * so, wie man es beim schriftlichen Rechnen von unten nach oben liest.
 */
export function wegAddition(a: number, b: number): Weg {
  const stellen = Math.max(String(a).length, String(b).length);
  const za = ziffern(a, stellen);
  const zb = ziffern(b, stellen);
  const schritte: Schritt[] = [];
  let merke = 0;
  let ergebnis = "";

  for (let i = 0; i < stellen; i++) {
    const summe = za[i] + zb[i] + merke;
    const an = summe % 10;
    const weiter = Math.floor(summe / 10);
    const teile = merke > 0
      ? `${merke} von vorher und ${zb[i]} ist ${merke + zb[i]}, ${merke + zb[i]} plus ${za[i]} ist ${summe}`
      : `${zb[i]} plus ${za[i]} ist ${summe}`;
    ergebnis = String(an) + ergebnis;
    schritte.push({
      satz: `Ich addiere die ${stellenname(i)}: ${teile}, ${an} an, ${weiter} weiter`,
      zeile: rechnungMit(a, "plus", b, ergebnis),
      merke: weiter,
    });
    merke = weiter;
  }
  if (merke > 0) {
    ergebnis = String(merke) + ergebnis;
    schritte.push({
      satz: `Der Übertrag kommt noch dazu: ${merke} an`,
      zeile: rechnungMit(a, "plus", b, ergebnis),
      merke: 0,
    });
  }
  return { angabe: `${zahl(a)} +${zahl(b)} =`, schritte, ergebnis: String(a + b) };
}

/* ------------------------------------------------------------------ */
/* Subtraktion - beide Wege                                             */
/* ------------------------------------------------------------------ */

export type Subtraktionsweg = "ergaenzen" | "abziehen";

/**
 * Der Weg der schriftlichen Subtraktion.
 *
 * ★ Beide Verfahren, und innerhalb einer Aufgabe nie gemischt: das Vermischen
 * ist ein belegtes Fehlermuster. Voreingestellt ist das Ergänzen (Österreich);
 * das Abziehen wird in der Literatur zum Rechnen mit Braillezeile empfohlen,
 * weil der Übertrag gleich zu Beginn der neuen Stelle verrechnet wird.
 *
 * Ergänzen, wörtlich nach Stanetty S. 15: „8 und wie viel ist 14, 8 und 6 ist
 * 14, 6 an, 1 weiter".
 */
export function wegSubtraktion(a: number, b: number, verfahren: Subtraktionsweg = "ergaenzen"): Weg {
  const stellen = Math.max(String(a).length, String(b).length);
  const za = ziffern(a, stellen);
  const zb = ziffern(b, stellen);
  const schritte: Schritt[] = [];
  let merke = 0;
  let ergebnis = "";

  for (let i = 0; i < stellen; i++) {
    const abzug = zb[i] + merke;
    const oben = za[i];
    const an = ((oben - abzug) % 10 + 10) % 10;
    const weiter = oben - abzug < 0 ? 1 : 0;
    const zielzahl = oben - abzug < 0 ? oben + 10 : oben;

    const satz = verfahren === "ergaenzen"
      ? (merke > 0
          ? `Ich rechne mit den ${stellennameDativ(i)}. ${merke} von vorher und ${zb[i]} ist ${abzug}, ${abzug} und wie viel ist ${zielzahl}, ${abzug} und ${an} ist ${zielzahl}, ${an} an, ${weiter} weiter`
          : `Ich beginne mit den ${stellennameDativ(i)}. ${abzug} und wie viel ist ${zielzahl}, ${abzug} und ${an} ist ${zielzahl}, ${an} an, ${weiter} weiter`)
      : (weiter === 1
          ? `Ich rechne mit den ${stellennameDativ(i)}. ${oben} minus ${abzug} geht nicht, ich borge mir einen ${stellenname(i + 1).replace(/er$/, "er")}: ${zielzahl} minus ${abzug} ist ${an}, ${an} an, 1 weiter`
          : `Ich rechne mit den ${stellennameDativ(i)}. ${oben} minus ${abzug} ist ${an}, ${an} an, 0 weiter`);

    ergebnis = String(an) + ergebnis;
    schritte.push({ satz, zeile: rechnungMit(a, "minus", b, ergebnis.replace(/^0+(?=\d)/, "")), merke: weiter });
    merke = weiter;
  }

  return { angabe: `${zahl(a)} -${zahl(b)} =`, schritte, ergebnis: String(a - b) };
}

/* ------------------------------------------------------------------ */
/* Multiplikation mit einer einstelligen Zahl                           */
/* ------------------------------------------------------------------ */

/** Der Weg der schriftlichen Multiplikation - Stellenwert für Stellenwert. */
export function wegMultiplikation(a: number, b: number): Weg {
  const za = ziffern(a);
  const schritte: Schritt[] = [];
  let merke = 0;
  let ergebnis = "";

  for (let i = 0; i < za.length; i++) {
    const produkt = za[i] * b + merke;
    const an = produkt % 10;
    const weiter = Math.floor(produkt / 10);
    // ★ Wortlaut nach Stanetty S. 29: der MULTIPLIKATOR steht vorn („4 mal 6
    // ist 24"), und der Übertrag heißt „von vorhin".
    const teile = merke > 0
      ? `${b} mal ${za[i]} ist ${za[i] * b} und ${merke} von vorhin ist ${produkt}`
      : `${b} mal ${za[i]} ist ${produkt}`;
    ergebnis = String(an) + ergebnis;
    schritte.push({
      satz: `Ich multipliziere ${b} mit den ${stellennameDativ(i)}. ${teile}, ${an} an, ${weiter} weiter`,
      zeile: rechnungMit(a, "mal", b, ergebnis),
      merke: weiter,
    });
    merke = weiter;
  }
  if (merke > 0) {
    ergebnis = String(merke) + ergebnis;
    schritte.push({
      satz: `Der Übertrag kommt noch dazu: ${merke} an`,
      zeile: rechnungMit(a, "mal", b, ergebnis),
      merke: 0,
    });
  }
  return { angabe: `${zahl(a)} *${zahl(b)} =`, schritte, ergebnis: String(a * b) };
}

/* ------------------------------------------------------------------ */
/* Division durch eine einstellige Zahl                                 */
/* ------------------------------------------------------------------ */

/**
 * Der Weg der schriftlichen Division - mit ausgeschriebenen Stellenwerten.
 *
 * Die Zeilen sehen aus wie im Buch:
 *
 *     474 /3 =[]
 *     4 H /3 =1 H Rest: 1 H
 *     17 Z /3 =5 Z Rest: 2 Z
 *     24 E /3 =8 E
 *
 * ★ Die Zwischenergebnisse stehen NEBEN der Aufgabe, nicht darunter - so
 * verlangt es die Literatur zum Rechnen mit Braillezeile.
 */
export function wegDivision(a: number, b: number): Weg {
  const stellen = String(Math.trunc(a)).split("").map(Number);
  const namen = [...STELLEN].reverse().slice(STELLEN.length - stellen.length);
  const schritte: Schritt[] = [];
  let rest = 0;

  for (let i = 0; i < stellen.length; i++) {
    const wert = rest * 10 + stellen[i];
    const teil = Math.floor(wert / b);
    const neuerRest = wert % b;
    const name = namen[i] ?? "E";
    const zeile = neuerRest > 0
      ? `${wert} ${name} /${b} =${teil} ${name} Rest: ${neuerRest} ${name}`
      : `${wert} ${name} /${b} =${teil} ${name}`;
    schritte.push({
      satz: neuerRest > 0
        ? `${wert} ${stellenname(namen.length - 1 - i)} durch ${b} ist ${teil}, Rest ${neuerRest}`
        : `${wert} ${stellenname(namen.length - 1 - i)} durch ${b} ist ${teil}`,
      zeile,
      merke: neuerRest,
    });
    rest = neuerRest;
  }

  const ergebnis = Math.floor(a / b);
  // ★ Die Schreibweise des Rests ist die der ganzen App: `158 (1 Rest)`.
  // Gemessen am 23.09.2026: hier stand `158 Rest 1`, und ein Kind, das die
  // übliche Form tippt, wäre falsch gewertet worden.
  return {
    angabe: `${zahl(a)} /${zahl(b)} =`,
    schritte,
    ergebnis: rest > 0 ? `${ergebnis} (${rest} Rest)` : String(ergebnis),
    // ⚠️ Der Quotient ALLEIN gilt nicht (25.09.2026). Hier stand er bis heute
    // unter `auchRichtig` - ein Häkchen für die halbe Antwort. Wer den Rest
    // vergisst, hört jetzt „der Rest fehlt noch" (`pruefe`, Stand `rest`).
    // Die Schreibweisen des Rests (`158 Rest 1`, `158 R 1`) liest `restForm`.
    auchRichtig: rest > 0 ? [`${ergebnis} Rest ${rest}`] : undefined,
  };
}

/**
 * Der zweite Weg der Multiplikation: den zweistelligen Faktor zerlegen.
 *
 * Wörtlich nach Stanetty S. 28: `4 *16 =4 *10 +4 *6 =40 +24 =64`. Dieser Weg
 * steht dort für „einstellig mal zweistellig" - die Zerlegung macht sichtbar,
 * warum das Ergebnis stimmt, und sie ist auf der Zeile gut zu lesen.
 */
export function wegZerlegung(a: number, b: number): Weg | null {
  if (!Number.isInteger(a) || !Number.isInteger(b)) return null;
  if (a < 2 || a > 9) return null;          // der einstellige Faktor steht vorn
  if (b < 10 || b > 99) return null;
  const zehner = Math.floor(b / 10) * 10;
  const einer = b % 10;
  if (einer === 0) return null;             // ohne Einer ist nichts zu zerlegen

  const zeile1 = `${a} *${b} =${a} *${zehner} +${a} *${einer} =`;
  const zeile2 = `${zeile1}${a * zehner} +${a * einer} =`;
  const zeile3 = `${zeile2}${a * b}`;
  return {
    angabe: `${zahl(a)} *${zahl(b)} =`,
    schritte: [
      { satz: `${b} ist ${zehner} und ${einer}. Ich rechne zuerst ${a} mal ${zehner}, dann ${a} mal ${einer}`, zeile: zeile1, merke: 0 },
      { satz: `${a} mal ${zehner} ist ${a * zehner} und ${a} mal ${einer} ist ${a * einer}`, zeile: zeile2, merke: 0 },
      { satz: `Ich zähle ${a * zehner} und ${a * einer} zusammen`, zeile: zeile3, merke: 0 },
    ],
    ergebnis: String(a * b),
  };
}

/**
 * Mal einer Zehnerzahl - der dritte dokumentierte Weg.
 *
 * Wörtlich nach Stanetty S. 32: `645 *20 =645 *2 *10 =1290 *10 =12900`. Die
 * Zerlegung in „mal die Einerziffer, dann mal zehn" ist auf der Zeile kurz und
 * macht den Stellenwert sichtbar.
 */
export function wegZehnerzahl(a: number, b: number): Weg | null {
  if (!Number.isInteger(a) || !Number.isInteger(b)) return null;
  if (b < 20 || b > 90 || b % 10 !== 0) return null;
  const einer = b / 10;
  const zwischen = a * einer;
  const zeile1 = `${zahl(a)} *${zahl(b)} =${zahl(a)} *${einer} *10 =`;
  const zeile2 = `${zeile1}${zahl(zwischen)} *10 =`;
  const zeile3 = `${zeile2}${zahl(a * b)}`;
  return {
    angabe: `${zahl(a)} *${zahl(b)} =`,
    schritte: [
      { satz: `${b} ist ${einer} mal 10. Ich rechne zuerst mal ${einer}, dann mal 10`, zeile: zeile1, merke: 0 },
      { satz: `${zahl(a)} mal ${einer} ist ${zahl(zwischen)}`, zeile: zeile2, merke: 0 },
      { satz: `${zahl(zwischen)} mal 10 ist ${zahl(a * b)} - eine Null dazu`, zeile: zeile3, merke: 0 },
    ],
    ergebnis: String(a * b),
  };
}

/**
 * Geteilt durch eine zweistellige Zahl - der Divisor wird zerlegt.
 *
 * Wörtlich nach Stanetty S. 42: `140 /20 =140 /2 /10 =70 /10 =7`. Der
 * zweistellige Divisor wird in zwei Faktoren zerlegt, und es wird zweimal
 * hintereinander geteilt. Das Buch lässt ausdrücklich mehrere Zerlegungen zu
 * („Rechne auf vier Arten"); Plus nimmt die, die aufgeht.
 *
 * ★ Beide Zwischenergebnisse müssen ganze Zahlen sein. Sonst ist es kein Weg,
 * sondern eine Sackgasse - und ein Kind, das ihr folgt, macht nichts falsch
 * und kommt trotzdem nicht an.
 */
export function wegZerlegteDivision(a: number, b: number): Weg | null {
  if (!Number.isInteger(a) || !Number.isInteger(b)) return null;
  if (b < 10 || b > 99 || a % b !== 0) return null;

  for (let p = 2; p <= 9; p++) {
    if (b % p !== 0) continue;
    const q = b / p;
    if (q > 10 || a % p !== 0) continue;
    const zwischen = a / p;
    if (zwischen % q !== 0) continue;

    const zeile1 = `${zahl(a)} /${zahl(b)} =${zahl(a)} /${p} /${q} =`;
    const zeile2 = `${zeile1}${zahl(zwischen)} /${q} =`;
    const zeile3 = `${zeile2}${zahl(a / b)}`;
    return {
      angabe: `${zahl(a)} /${zahl(b)} =`,
      schritte: [
        { satz: `${b} ist ${p} mal ${q}. Ich teile zuerst durch ${p}, dann durch ${q}`, zeile: zeile1, merke: 0 },
        { satz: `${zahl(a)} durch ${p} ist ${zahl(zwischen)}`, zeile: zeile2, merke: 0 },
        { satz: `${zahl(zwischen)} durch ${q} ist ${zahl(a / b)}`, zeile: zeile3, merke: 0 },
      ],
      ergebnis: String(a / b),
    };
  }
  return null;
}

/**
 * Mal 10 - ein Schritt. Wörtlich nach Stanetty S. 32: `645 *10 =6450`.
 */
export function wegMalZehn(a: number): Weg | null {
  if (!Number.isInteger(a) || a < 1) return null;
  return {
    angabe: `${zahl(a)} *10 =`,
    schritte: [
      { satz: `${zahl(a)} mal 10 ist ${zahl(a * 10)} - eine Null dazu`, zeile: `${zahl(a)} *10 =${zahl(a * 10)}`, merke: 0 },
    ],
    ergebnis: String(a * 10),
  };
}

/**
 * Mal einer zweistelligen Zahl - in Teilprodukte zerlegt.
 *
 * Wörtlich nach Stanetty S. 33: `645 *21 =645 *20 +645 *1 =12900 +00645
 * =13545`, und nach der Übungsphase `645 *28 =12900 +05160 =18060`. Der
 * zweite Faktor wird in Zehner und Einer zerlegt; die beiden Teilprodukte
 * werden addiert.
 *
 * ★ Die Zeile wird nicht immer länger, sondern verkürzt sich nach dem ersten
 * Schritt auf die Teilprodukte - wie im Buch („Die Einzelschritte werden nicht
 * mehr aufgeschrieben"). Sonst wäre `4890 *57` über 50 Zeichen lang, und die
 * Braillezeile hat 40.
 *
 * ★ Die Nullen vor dem zweiten Teilprodukt (`00645`) lässt Plus weg. Das Buch
 * zeigt beide Formen (S. 34: `9000 +1350 +225`), und das Kind tippt ohnehin
 * nur das Ergebnis.
 */
export function wegTeilprodukte(a: number, b: number): Weg | null {
  if (!Number.isInteger(a) || !Number.isInteger(b)) return null;
  if (a < 10 || b < 11 || b > 99 || b % 10 === 0) return null;
  const zehner = Math.floor(b / 10) * 10;
  const einer = b % 10;
  const p1 = a * zehner;
  const p2 = a * einer;
  const vorn = `${zahl(a)} *${zahl(b)} =`;
  return {
    angabe: vorn,
    schritte: [
      { satz: `${b} ist ${zehner} und ${einer}. Ich rechne ${zahl(a)} mal ${zehner} und ${zahl(a)} mal ${einer}`, zeile: `${vorn}${zahl(a)} *${zehner} +${zahl(a)} *${einer} =`, merke: 0 },
      { satz: `${zahl(a)} mal ${zehner} ist ${zahl(p1)}. ${zahl(a)} mal ${einer} ist ${zahl(p2)}`, zeile: `${vorn}${zahl(p1)} +${zahl(p2)} =`, merke: 0 },
      { satz: `Ich zähle ${zahl(p1)} und ${zahl(p2)} zusammen`, zeile: `${vorn}${zahl(p1)} +${zahl(p2)} =${zahl(a * b)}`, merke: 0 },
    ],
    ergebnis: String(a * b),
  };
}

/**
 * Geteilt durch eine zweistellige Zahl - ohne Zerlegung, Stelle für Stelle.
 *
 * Die Zeilen nach Stanetty S. 51, der Form mit der „geringsten Anstrengung":
 * Stellenwert bei jedem Teilergebnis, die Nebenrechnung in derselben Zeile.
 *
 *     34789 /56 =...
 *     347 89 /56 =6 (H) nr: 347 -336 =11
 *     118 9 /56 =2 (Z) nr: 118 -112 =6
 *     69 /56 =1 (E) nr: 69 -56 =13
 *     34789 /56 =621 (13 Rest)
 *
 * Der Sprechweg nach S. 49: „92 geteilt durch 21 ist 4, das werden meine
 * Zehner, 4 mal 21 ist 84, 84 und wie viel ist 92 ... die nächste Stelle ist
 * 1, es ergibt sich die Zahl 81".
 *
 * ★ Auch die Null im Ergebnis bekommt ihre eigene Zeile. Die vergessene Null
 * ist das Fehlermuster dieses Pakets (`null_fehler`) - wer sie überspringt,
 * zeigt dem Kind genau die Stelle nicht, an der es danebengreift.
 */
export function wegLangeDivision(a: number, b: number): Weg | null {
  if (!Number.isInteger(a) || !Number.isInteger(b)) return null;
  if (b < 10 || b > 99 || a < b) return null;
  const ziffernA = String(a);
  // Der erste Teil: so viele Ziffern, bis b hineinpasst.
  let n = 1;
  while (Number(ziffernA.slice(0, n)) < b) n++;
  const stellenImErgebnis = ziffernA.length - n + 1;
  if (stellenImErgebnis > STELLEN.length) return null;

  const schritte: Schritt[] = [];
  let teil = Number(ziffernA.slice(0, n));
  let ergebnis = "";
  for (let i = 0; i < stellenImErgebnis; i++) {
    const stelle = stellenImErgebnis - 1 - i;
    const q = Math.floor(teil / b);
    const p = q * b;
    const r = teil - p;
    const danach = ziffernA.slice(n + i);
    const vorn = danach ? `${teil} ${danach}` : `${teil}`;
    const anfang = i === 0
      ? ""
      : `Die nächste Stelle ist ${ziffernA[n + i - 1]}, es ergibt sich die Zahl ${teil}. `;
    ergebnis += String(q);
    schritte.push({
      satz: `${anfang}${teil} geteilt durch ${b} ist ${q}, das werden meine ${stellenname(stelle)}. `
        + `${q} mal ${b} ist ${p}, ${p} und wie viel ist ${teil}, ${p} und ${r} ist ${teil}`,
      zeile: `${vorn} /${b} =${q} (${STELLEN[stelle]}) nr: ${teil} -${p} =${r}`,
      merke: r,
    });
    teil = danach ? r * 10 + Number(danach[0]) : r;
  }

  const q = Math.floor(a / b);
  const rest = a % b;
  schritte.push({
    satz: rest > 0 ? `${rest} ist mein Rest` : "Es bleibt kein Rest",
    zeile: rest > 0 ? `${zahl(a)} /${b} =${zahl(q)} (${rest} Rest)` : `${zahl(a)} /${b} =${zahl(q)}`,
    merke: 0,
  });
  return {
    angabe: `${zahl(a)} /${zahl(b)} =`,
    schritte,
    ergebnis: rest > 0 ? `${q} (${rest} Rest)` : String(q),
    auchRichtig: rest > 0 ? [`${q} Rest ${rest}`] : undefined,
  };
}

/** Der passende Weg zur Rechenart. `null`, wo Plus keinen Weg kennt. */
export function weg(a: number, op: Operation, b: number, verfahren: Subtraktionsweg = "ergaenzen"): Weg | null {
  // ★ Nur ganze Zahlen. Das Rechnen mit Kommastellen in Zeilen steht in keiner
  // der Quellen, und ein erfundener Weg wäre schlimmer als keiner: gemessen am
  // 23.09.2026 kam bei „196,471 -147,93" eine Zeile heraus, die weder stimmte
  // noch zu lesen war.
  if (!Number.isInteger(a) || !Number.isInteger(b)) return null;
  if (a < 0 || b < 0) return null;
  if (op === "plus") return wegAddition(a, b);
  if (op === "minus") return a >= b ? wegSubtraktion(a, b, verfahren) : null;
  // Einstellig mal zweistellig: das Buch zerlegt (S. 28). Zweistellig mal
  // einstellig: das Buch rechnet Stelle für Stelle (S. 29).
  if (op === "mal" && b >= 20 && b <= 90 && b % 10 === 0) return wegZehnerzahl(a, b);
  if (op === "mal" && b === 10 && a >= 10) return wegMalZehn(a);
  if (op === "mal" && a >= 2 && a <= 9 && b >= 10 && b <= 99) return wegZerlegung(a, b) ?? wegMultiplikation(b, a);
  if (op === "mal" && b >= 0 && b <= 9) return wegMultiplikation(a, b);
  // Mehrstellig mal zweistellig: Teilprodukte (S. 33).
  if (op === "mal" && a >= 10 && b >= 11 && b <= 99) return wegTeilprodukte(a, b);
  if (op === "geteilt" && b >= 2 && b <= 9) return wegDivision(a, b);
  // Zweistelliger Divisor: zerlegen und zweimal teilen (Stanetty S. 42), wo
  // das aufgeht - sonst Stelle für Stelle (S. 48 bis 51).
  if (op === "geteilt" && b >= 10 && b <= 99) return wegZerlegteDivision(a, b) ?? wegLangeDivision(a, b);
  return null;
}
