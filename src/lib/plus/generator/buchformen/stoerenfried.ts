/**
 * Päckchen mit Störenfried (A6 im Befund, Beleg im Ursprungs-Repository, Beleg im Ursprungs-Repository) - vier
 * oder fünf Zeilen, ALLE richtig gerechnet. Eine davon bricht das Muster,
 * das die anderen teilen. Gefragt ist die Nummer dieser Zeile.
 *
 * ★★★ Die Zahlen kommen aus `kern`/`nachschub` - derselben Bauart, die auch
 * die anderen Formen des Pakets bekommen. Nur so bleiben Malreihen auf das
 * Paket beschränkt (2-11, 3-14: nie über 10), „Immer 10"/„Immer 20" wirklich
 * immer 10/20, und der Zehnerübergang genau da, wo das Paket ihn verlangt
 * (2-07 nie, 2-09 immer) - `differenz`/`produkt`/`ergaenzung` in `kerne.ts`
 * sorgen dafür bereits vor. Eine selbst gewürfelte Zahl könnte all das
 * verletzen (gemessen: `5 *17` u. ä. lagen ausserhalb jeder Malreihe).
 *
 * Abgrenzung zu `fehler_finden`: dort ist eine Zeile FALSCH gerechnet, hier
 * sind alle Ergebnisse richtig - nur eines passt nicht zum Muster der
 * anderen. Das Muster ist je Rechenart eine geteilte Kennzahl:
 * - Plus: alle Zeilen mit derselben Summe, eine mit einer anderen.
 * - Minus: alle Zeilen mit demselben Abstand (a -b), eine mit einem anderen.
 * - Mal: alle Zeilen mit demselben Faktor (derselben Malreihe), eine ohne ihn.
 */
import { ganz, gemischt, rechnungMit, type Aufgabe, type Operation } from "../../aufgabe";
import { NochNichtGebaut } from "../nochNichtGebaut";
import type { BuchArgs } from "./typen";
import type { Kern } from "../kerne";

interface Zeile { a: number; b: number; erg: number }

/** Eine zweite Kennzahl, die sich von `wert` unterscheidet und in [min, max] bleibt. */
function andereKennzahl(wert: number, min: number, max: number): number | null {
  for (const off of [1, -1, 2, -2, 3, -3, 4, -4]) {
    const kandidat = wert + off;
    if (kandidat >= min && kandidat <= max && kandidat !== wert) return kandidat;
  }
  return null;
}

function zuZeile(k: Kern): Zeile | null {
  return k.sorte === "rechnung" ? { a: k.a, b: k.b, erg: k.ergebnis } : null;
}

/** Einen Vorrat echter Zeilen derselben Bauart ziehen. */
function ziehe(kern: Kern, nachschub: () => Kern, anzahl: number): Zeile[] {
  const vorrat: Zeile[] = [];
  const erste = zuZeile(kern);
  if (erste) vorrat.push(erste);
  for (let i = vorrat.length; i < anzahl; i++) {
    const z = zuZeile(nachschub());
    if (z) vorrat.push(z);
  }
  return vorrat;
}

/**
 * Plus: die Bauart der „Immer X"-Pakete liefert IMMER dieselbe Summe - sie
 * kann also keine Störenfried-Zeile selbst hergeben. Die Form baut sie
 * dicht neben der festen Summe, mit einer Ecke im selben kleinen Bereich.
 */
function reihePlus(kern: Kern, nachschub: () => Kern, rng: () => number, rows: number, cap: number): Zeile[] | null {
  const vorrat = ziehe(kern, nachschub, rows - 1);
  if (vorrat.length < rows - 1) return null;
  const summe = vorrat[0].erg;
  const summe2 = andereKennzahl(summe, 2, cap);
  if (summe2 === null) return null;
  const a2 = ganz(rng, 1, summe2 - 1);
  return [...vorrat, { a: a2, b: summe2 - a2, erg: summe2 }];
}

/** Minus und Mal: aus einem Vorrat echter Zeilen die häufigste Kennzahl suchen. */
function ausVorrat(
  vorrat: Zeile[], rows: number, kennzahlen: (z: Zeile) => number[],
): { zeilen: Zeile[]; kennzahl: number } | null {
  const eimer = new Map<number, Zeile[]>();
  for (const z of vorrat) {
    for (const k of new Set(kennzahlen(z))) {
      const liste = eimer.get(k);
      if (liste) liste.push(z); else eimer.set(k, [z]);
    }
  }
  let bester: [number, Zeile[]] | null = null;
  for (const eintrag of eimer) if (!bester || eintrag[1].length > bester[1].length) bester = eintrag;
  if (!bester || bester[1].length < rows - 1) return null;
  const [kennzahl, kandidaten] = bester;
  const majoritaet = kandidaten.slice(0, rows - 1);
  const stoer = vorrat.find((z) => !kennzahlen(z).includes(kennzahl));
  if (!stoer) return null;
  return { zeilen: [...majoritaet, stoer], kennzahl };
}

function reiheMinus(kern: Kern, nachschub: () => Kern, rows: number): Zeile[] | null {
  const vorrat = ziehe(kern, nachschub, 500);
  return ausVorrat(vorrat, rows, (z) => [z.a - z.b])?.zeilen ?? null;
}

function reiheMal(kern: Kern, nachschub: () => Kern, rows: number): Zeile[] | null {
  const vorrat = ziehe(kern, nachschub, 500);
  // ★ Beide Faktoren zählen als Kennzahl - `produkt()` vertauscht sie
  // manchmal (`tauschen: true`), die Malreihe steht nicht immer an derselben
  // Stelle.
  const treffer = ausVorrat(vorrat, rows, (z) => [z.a, z.b]);
  if (!treffer) return null;
  // Die geteilte Kennzahl in der Mehrheit immer nach vorn - „3 *4, 3 *5 …".
  const { zeilen, kennzahl } = treffer;
  return zeilen.map((z, i) => (i < zeilen.length - 1 && z.b === kennzahl ? { a: z.b, b: z.a, erg: z.erg } : z));
}

export function stoerenfried({ paket, art, rng, raum, op, kern, nachschub }: BuchArgs): Aufgabe {
  if (art !== "stoerenfried") throw new NochNichtGebaut(paket, art);
  const cap = raum ? raum[1] : 20;
  const rows = rng() < 0.5 ? 4 : 5;

  let zeilen: Zeile[] | null = null;
  if (op === "plus") zeilen = reihePlus(kern, nachschub, rng, rows, cap);
  else if (op === "minus") zeilen = reiheMinus(kern, nachschub, rows);
  else if (op === "mal") zeilen = reiheMal(kern, nachschub, rows);
  if (!zeilen) throw new NochNichtGebaut(paket, art);

  // ★ Die letzte Zeile ist der Störenfried - vor dem Mischen merken.
  const stoerIndexVorMischen = zeilen.length - 1;
  const markiert = zeilen.map((z, i) => ({ z, stoer: i === stoerIndexVorMischen }));
  const gemischtE = gemischt(rng, markiert);
  const nummer = gemischtE.findIndex((e) => e.stoer) + 1;

  const zeilenText = gemischtE.map((e, i) => `${i + 1}) ${rechnungMit(e.z.a, op as Operation, e.z.b, e.z.erg)}`);
  // ★ Kurz halten (Zeilenlänge, `plus-generator.test.ts`) - „Alle Zeilen
  // stimmen. Welche passt nicht ins Muster?" war mit 51 Zeichen zu lang.
  // ★ Zwei kurze Zeilen statt einer knappen: „Alle stimmen. Welche passt
  // nicht?" sagte nicht, WORAN sie nicht passt - und „stimmen" muss dastehen,
  // sonst sucht das Kind einen Rechenfehler wie bei `fehler_finden`.
  const angabe = `Alle Zeilen stimmen.\nWelche passt nicht dazu?\n${zeilenText.join("\n")}`;
  return {
    paket, art, op, angabe, loesung: String(nummer),
    zahlen: gemischtE.flatMap((e) => [e.z.a, e.z.b, e.z.erg]),
  };
}
