/**
 * „So rechnen Kinder" - mehrere richtige Wege vergleichen (Befund C1, Beleg im Ursprungs-Repository
 * 3983). Drei Kinder rechnen dieselbe Aufgabe richtig, aber verschieden.
 * Gefragt wird, welches Kind auf eine genannte Art rechnet.
 *
 * ★ Nur für Plus (2-18, 3-05) und Minus (2-19, 3-06) - genau die Pakete, die
 * der Stoffplan dieser Form zuweist. Die Wege heißen so, wie Plus sie sonst
 * schon nennt (`strategiewahl`, `zeilenrechnen.ts`):
 * - Plus: „Stellen extra", „schrittweise", „Hilfsaufgabe"
 * - Minus: „schrittweise", „ergänzen", „Hilfsaufgabe"
 *
 * ★★ Die Hilfsaufgabe braucht eine Zahl nahe an einem Zehner oder Hunderter -
 * sonst wäre sie eine erfundene Umständlichkeit statt einer Strategie. Passt
 * keine Zahl, bekommt die Aufgabe nur zwei Kinder und die Frage fragt nie
 * nach der Hilfsaufgabe.
 */
import { zahl } from "../../aufgabe";
import { NochNichtGebaut } from "../nochNichtGebaut";
import type { Buchform } from "./typen";

const NAMEN = [
  "Amelie", "Noah", "Zoe", "Kaan", "Sofia", "Luca", "Amara", "Milan", "Greta", "Deniz",
  "Aylin", "Matteo", "Lina", "Samuel", "Yasmin", "Felix", "Nour", "Anton", "Priya", "Elias",
];

export type Art = "stellen" | "schrittweise" | "ergaenzen" | "hilfsaufgabe";

/** ★ Exportiert für den Test: die Frage je Art, um im Wächter unabhängig nachzurechnen. */
export const FRAGE: Record<Art, string> = {
  stellen: "Wer rechnet mit Stellen extra?",
  schrittweise: "Wer rechnet schrittweise?",
  ergaenzen: "Wer rechnet durch Ergänzen?",
  hilfsaufgabe: "Wer rechnet mit einer Hilfsaufgabe?",
};

/** Die Stellenwerte einer Zahl bis 999, ohne die, die null sind. */
function teileZahl(n: number): [number, number, number] {
  return [Math.floor(n / 100) * 100, Math.floor((n % 100) / 10) * 10, n % 10];
}

/**
 * ★ Die vier Wegfunktionen sind exportiert, damit der Wächter (Test) dieselben
 * Bausteine benutzen kann, um unabhängig nachzurechnen, welches Kind welchen
 * Weg zeigt - statt den Text danach zu erraten.
 */
/** „Stellen extra" - nur beim Plus: jede Stelle für sich, dann zusammenzählen. */
export function wegStellenExtra(a: number, b: number, ergebnis: number): string[] | null {
  const ta = teileZahl(a);
  const tb = teileZahl(b);
  const zeilen: string[] = [];
  const werte: number[] = [];
  for (let i = 0; i < 3; i++) {
    if (ta[i] === 0 && tb[i] === 0) continue;
    const w = ta[i] + tb[i];
    zeilen.push(`${zahl(ta[i])} +${zahl(tb[i])} =${zahl(w)}`);
    werte.push(w);
  }
  if (werte.length < 2) return null; // ★ Weniger als zwei Stellen zu je zwei Zahlen ist keine echte Zerlegung.
  // ★★ NIE `werte.map(zahl)` - `Array.map` reicht den Index als zweites
  // Argument durch, und das IST bei `zahl()` die Nachkommastellen-Zahl. Aus
  // `10` würde so `10,0`. Gemessen beim Bauen dieser Form, mit Test.
  zeilen.push(`${werte.map((w) => zahl(w)).join(" +")} =${zahl(ergebnis)}`);
  return zeilen;
}

/** „Schrittweise" - die zweite Zahl in ihren Stellen dazuzählen oder abziehen. */
export function wegSchrittweise(a: number, b: number, ergebnis: number, op: "plus" | "minus"): string[] {
  const teile = teileZahl(b).filter((t) => t !== 0);
  const zeilen: string[] = [];
  let stand = a;
  for (const t of teile) {
    const naechster = op === "plus" ? stand + t : stand - t;
    zeilen.push(`${zahl(stand)} ${op === "plus" ? "+" : "-"}${zahl(t)} =${zahl(naechster)}`);
    stand = naechster;
  }
  // ★ Geht b restlos in einem Schritt auf (z. B. b ist schon ein Zehner),
  // fehlt der zweite Beleg - dann steht das Ergebnis schon in der einen
  // Zeile, und `stand` ist bereits `ergebnis`.
  if (stand !== ergebnis) return [];
  // ★ Ein Weg aus EINER Zeile ist kein Weg: `38 -20 =18` steht schon in der
  // Angabe. Gemessen am 26.09.2026 im Probelauf (2-19).
  if (zeilen.length < 2) return [];
  return zeilen;
}

/** „Ergänzen" - nur beim Minus: von b aus über die Zehner bis a hochzählen. */
export function wegErgaenzen(a: number, b: number, ergebnis: number): string[] | null {
  const naechsterZehner = Math.min(Math.ceil((b + 1) / 10) * 10, a);
  const ersterSchritt = naechsterZehner - b;
  const zweiterSchritt = a - naechsterZehner;
  // ★ NUR EIN Sprung zum nächsten Zehner, dann EIN Sprung direkt zu `a` -
  // gleich wie weit das ist. Zehner für Zehner hochzuzählen (frühere
  // Fassung) ergab bei einer großen Differenz zehn Zeilen und sprengte die
  // Braillezeile (40 Zeichen, siehe `plus-generator.test.ts`) - und ist auch
  // nicht, wie „Ergänzen" unterrichtet wird: der zweite Sprung geht in einem
  // Schritt zum Ziel.
  //
  // ★ Liegt `b` schon auf einem Zehner, oder ist der nächste Zehner schon
  // `a`, bräuchte es nur EINEN Sprung - der endet dann bei `a`, nicht beim
  // Ergebnis, und zeigt nichts vom „Über den Zehner zählen". Dann lieber gar
  // keinen Weg zurückgeben, als eine Zeile, die nicht zum Ergebnis führt (das
  // hätte den Vergleich der drei Kinder inkonsistent gemacht).
  if (ersterSchritt === 0 || zweiterSchritt === 0) return null;
  return [
    `${zahl(b)} +${zahl(ersterSchritt)} =${zahl(naechsterZehner)}`,
    `${zahl(naechsterZehner)} +${zahl(zweiterSchritt)} =${zahl(a)}`,
    `${zahl(ersterSchritt)} +${zahl(zweiterSchritt)} =${zahl(ergebnis)}`,
  ];
}

interface Rundung { seite: "a" | "b"; rund: number; diff: number }

/** Liegt eine der beiden Zahlen nah an einem Zehner oder Hunderter? */
function naeheZuRund(n: number): { rund: number; diff: number } | null {
  const untenZ = Math.floor(n / 10) * 10;
  const obenZ = untenZ + 10;
  const naeherZ = n - untenZ <= obenZ - n ? { rund: untenZ, diff: n - untenZ } : { rund: obenZ, diff: obenZ - n };
  let beste = naeherZ;
  if (n >= 100) {
    const untenH = Math.floor(n / 100) * 100;
    const obenH = untenH + 100;
    const naeherH = n - untenH <= obenH - n ? { rund: untenH, diff: n - untenH } : { rund: obenH, diff: obenH - n };
    if (naeherH.diff < beste.diff) beste = naeherH;
  }
  return beste.diff > 0 && beste.diff <= 3 ? beste : null;
}

function waehleKandidat(a: number, b: number): Rundung | null {
  const na = naeheZuRund(a);
  const nb = naeheZuRund(b);
  if (!na && !nb) return null;
  const seite: "a" | "b" = !nb || (!!na && na.diff <= nb.diff) ? "a" : "b";
  const info = (seite === "a" ? na : nb)!;
  return { seite, rund: info.rund, diff: info.diff };
}

/** „Hilfsaufgabe" - eine der Zahlen auf den nächsten Zehner/Hunderter runden, dann zurückkorrigieren. */
export function wegHilfsaufgabe(a: number, b: number, ergebnis: number, op: "plus" | "minus"): string[] | null {
  const kandidat = waehleKandidat(a, b);
  if (!kandidat) return null;
  const { seite, rund, diff } = kandidat;
  // ★★ Die zweite Zahl ABRUNDEN ist keine Hilfsaufgabe, sondern der
  // schrittweise Weg: `47 +11` über `47 +10 =57`, `57 +1 =58` ist Zeile für
  // Zeile dasselbe. Zwei Kinder rechneten gleich, und die Frage „Wer rechnet
  // mit einer Hilfsaufgabe?" hatte zwei Antworten (Probelauf 26.09.2026).
  // Die Hilfsaufgabe rundet die zweite Zahl AUF und rechnet zurück
  // (`47 +19` über `47 +20 =67`, `67 -1 =66`).
  if (seite === "b" && rund < b) return null;
  const aa = seite === "a" ? rund : a;
  const bb = seite === "b" ? rund : b;
  const zwischen = op === "plus" ? aa + bb : aa - bb;
  // ★ Ob nach dem Runden wieder ADDIERT oder SUBTRAHIERT werden muss, hängt
  // davon ab, welche Zahl wuchs und welche Rechenart es ist - vier Fälle, die
  // sich leicht falsch merken lassen. Statt sie herzuleiten, wird hier gegen
  // `ergebnis` geprüft: genau eine der beiden Korrekturen trifft.
  const plusZurueck = zwischen + diff === ergebnis;
  const minusZurueck = zwischen - diff === ergebnis;
  if (!plusZurueck && !minusZurueck) return null; // ★ Sicherheitsnetz, nie beobachtet, aber billig zu haben.
  const zeichen = plusZurueck ? "+" : "-";
  const korrigiert = plusZurueck ? zwischen + diff : zwischen - diff;
  return [
    `${zahl(aa)} ${op === "plus" ? "+" : "-"}${zahl(bb)} =${zahl(zwischen)}`,
    `${zahl(zwischen)} ${zeichen}${zahl(diff)} =${zahl(korrigiert)}`,
  ];
}

export const wege: Buchform = ({ paket, op, kern: kernEin, rng, nachschub }) => {
  if (op !== "plus" && op !== "minus") throw new NochNichtGebaut(paket, "wege");

  for (let versuch = 0; versuch < 30; versuch++) {
    const kern = versuch === 0 ? kernEin : nachschub();
    if (kern.sorte !== "rechnung" || kern.op !== op) continue;
    const { a, b, ergebnis } = kern;
    if (a === b) continue; // ★ Gleiche Zahlen machen jeden der drei Wege trivial - keine echte Wahl.

    const pfade: { art: Art; zeilen: string[] }[] = [];
    if (op === "plus") {
      const stellen = wegStellenExtra(a, b, ergebnis);
      if (stellen) pfade.push({ art: "stellen", zeilen: stellen });
      const schritt = wegSchrittweise(a, b, ergebnis, "plus");
      if (schritt.length) pfade.push({ art: "schrittweise", zeilen: schritt });
    } else {
      const schritt = wegSchrittweise(a, b, ergebnis, "minus");
      if (schritt.length) pfade.push({ art: "schrittweise", zeilen: schritt });
      const ergaenzt = wegErgaenzen(a, b, ergebnis);
      if (ergaenzt) pfade.push({ art: "ergaenzen", zeilen: ergaenzt });
    }
    const hilfe = wegHilfsaufgabe(a, b, ergebnis, op);
    if (hilfe) pfade.push({ art: "hilfsaufgabe", zeilen: hilfe });

    // ★ Sicherheitsnetz: nie zwei Kinder mit demselben Weg - sonst hat die
    // Frage zwei richtige Antworten.
    const gesehen = new Set<string>();
    for (let i = pfade.length - 1; i >= 0; i--) {
      const schluessel = pfade[i].zeilen.join("\n");
      if (gesehen.has(schluessel)) pfade.splice(i, 1);
      else gesehen.add(schluessel);
    }
    if (pfade.length < 2) continue;

    const namen = mische(rng, NAMEN).slice(0, pfade.length);
    const reihenfolge = mische(rng, pfade.map((_, i) => i));
    const gefragt = Math.floor(rng() * pfade.length);
    const zielArt = pfade[gefragt].art;

    // ★★★ Jeder Rechenschritt in einer EIGENEN Zeile - nie mit ", " aneinandergereiht.
    // Ein Kind mit drei Stellenwert-Schritten sprengte sonst die Braillezeile
    // (40 Zeichen, siehe `plus-generator.test.ts`): „Amelie: 700 +100 =800,
    // 10 +50 =60, 6 +3 =9, 800 +60 +9 =869" allein sind schon 59 Zeichen.
    const kinderZeilen = reihenfolge.flatMap((i) => {
      const [erste, ...rest] = pfade[i].zeilen;
      return [`${namen[i]}: ${erste}`, ...rest];
    });
    const kinderwort = pfade.length === 3 ? "Drei Kinder" : "Zwei Kinder";
    const angabe = [
      `${zahl(a)} ${op === "plus" ? "+" : "-"}${zahl(b)} =${zahl(ergebnis)}.`,
      `${kinderwort} rechnen richtig.`,
      ...kinderZeilen,
      FRAGE[zielArt],
    ].join("\n");

    return {
      paket,
      art: "wege",
      op,
      angabe,
      loesung: namen[gefragt],
      zahlen: [a, b],
    };
  }
  throw new NochNichtGebaut(paket, "wege");
};

/** Liste mischen (Fisher-Yates), ohne das Original zu verändern. */
function mische<T>(rng: () => number, liste: readonly T[]): T[] {
  const arr = liste.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
