/**
 * „Aufgaben erfinden" mit Eigenschaft (Befund A9, Beleg im Ursprungs-Repository).
 *
 * ★★ Eine OFFENE Aufgabe: „Finde eine Plusaufgabe mit dem Ergebnis 12. Beide
 * Zahlen sind ungerade." Jede Zahlenkombination, die rechnerisch stimmt UND
 * die Eigenschaft erfüllt UND im Zahlenraum des Pakets liegt, gilt. Damit das
 * wirklich eine offene Aufgabe ist (und keine mit nur einer versteckten
 * Lösung), muss es MINDESTENS ZWEI solcher Kombinationen geben - das prüft
 * dieser Generator selbst nach, bevor er die Aufgabe ausgibt.
 *
 * Nur für Plus, Minus, Mal - genau die drei Rechenarten, die der Stoffplan
 * dieser Form zuweist (1-08, 1-09, 2-06, 2-07, 2-15, 3-14).
 */
import { LUECKE, ZEICHEN, eines, gemischt, zahl, type Operation } from "../../aufgabe";
import { NochNichtGebaut } from "../nochNichtGebaut";
import type { Buchform } from "./typen";

interface Bedingung {
  text: string;
  /** Prüft die erste und die zweite Zahl, so wie das Kind sie eingegeben hat. */
  test: (a: number, b: number) => boolean;
}

/** Runde Schwelle in der Nähe eines Anteils des Zahlenraums - nie krumm. */
function schwelle(anteil: number, max: number): number {
  const roh = Math.round((max * anteil) / 5) * 5;
  return Math.min(Math.max(roh, 5), max - 1);
}

/**
 * Die möglichen Eigenschaften - je Rechenart etwas andere, weil „beide
 * Zahlen gleich" bei Plus/Minus fast immer nur EINE Lösung hätte (dann wäre
 * es keine offene Aufgabe mehr) und deshalb hier gar nicht erst auftaucht.
 */
function bedingungen(op: Operation, max: number): Bedingung[] {
  const liste: Bedingung[] = [
    { text: "Beide Zahlen sind gerade.", test: (a, b) => a % 2 === 0 && b % 2 === 0 },
    { text: "Beide Zahlen sind ungerade.", test: (a, b) => a % 2 === 1 && b % 2 === 1 },
    { text: "Die beiden Zahlen sind verschieden.", test: (a, b) => a !== b },
    { text: "Keine Zahl ist 1.", test: (a, b) => a !== 1 && b !== 1 },
  ];
  // ★ „Größer/kleiner als" braucht einen Zahlenraum, der eine Zahl in der
  // Mitte hergibt - bei Mal bleiben die Faktoren ohnehin klein (bis 10), da
  // wäre die Schwelle fast immer dieselbe Zahl. Nur bei Plus und Minus.
  if (op !== "mal") {
    for (const anteil of [0.25, 0.5, 0.75] as const) {
      const s = schwelle(anteil, max);
      liste.push({ text: `Die erste Zahl ist größer als ${s}.`, test: (a) => a > s });
      liste.push({ text: `Die erste Zahl ist kleiner als ${s}.`, test: (a) => a < s });
    }
  }
  return liste;
}

/** Der Name der Rechenart im Satz: „Finde eine Plusaufgabe …" */
function artName(op: Operation): string {
  return op === "plus" ? "Plus" : op === "minus" ? "Minus" : "Mal";
}

/** Die Grenzen, in denen beide Zahlen liegen dürfen. */
function grenzen(op: Operation, raum: [number, number] | null): [number, number] {
  const min = Math.max(1, raum?.[0] ?? 1);
  const max = raum?.[1] ?? 1000;
  // ★ Beim Malnehmen sind die Faktoren die des kleinen Einmaleins - ein
  // Zahlenraum bis 100 ist das ERGEBNIS-Fenster, nicht das der Faktoren.
  return op === "mal" ? [1, Math.min(max, 10)] : [min, max];
}

/** Alle (a, b), die rechnerisch stimmen und in den Grenzen liegen. */
function alleLoesungen(op: Operation, ergebnis: number, grenze: [number, number]): [number, number][] {
  const [min, max] = grenze;
  const liste: [number, number][] = [];
  if (op === "plus") {
    for (let a = min; a <= max; a++) {
      const b = ergebnis - a;
      if (b >= min && b <= max) liste.push([a, b]);
    }
  } else if (op === "minus") {
    for (let b = min; b <= max; b++) {
      const a = b + ergebnis;
      if (a >= min && a <= max) liste.push([a, b]);
    }
  } else {
    for (let a = min; a <= max; a++) {
      if (ergebnis % a !== 0) continue;
      const b = ergebnis / a;
      if (b >= min && b <= max) liste.push([a, b]);
    }
  }
  return liste;
}

/**
 * Was im Feld steht, in zwei Zahlen zerlegen - „5 und 7", „5, 7", „5 7".
 * ★ Ein Komma OHNE Leerzeichen danach ist eine Kommazahl, kein Trenner - so
 * schreibt der Rest der App Listen immer mit „, " (siehe `kette`/`mauer`).
 * Bleibt nach dem Zerlegen nicht GENAU eine Zahl je Seite übrig, ist die
 * Antwort kein Zahlenpaar und gilt nicht.
 */
function zweiZahlen(antwort: string): [number, number] | null {
  const bereinigt = antwort
    .replace(/\bund\b/gi, " ")
    .replace(/,\s+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
  if (!bereinigt) return null;
  const teile = bereinigt.split(" ");
  if (teile.length !== 2) return null;
  if (!/^-?\d+$/.test(teile[0]) || !/^-?\d+$/.test(teile[1])) return null;
  return [Number(teile[0]), Number(teile[1])];
}

export const erfinden: Buchform = ({ paket, op, kern, rng, nachschub, raum }) => {
  if (op !== "plus" && op !== "minus" && op !== "mal") throw new NochNichtGebaut(paket, "erfinden");
  const grenze = grenzen(op, raum);

  for (let versuch = 0; versuch < 200; versuch++) {
    const k = versuch === 0 ? kern : nachschub();
    if (k.sorte !== "rechnung" || k.op !== op) continue;
    const ergebnis = k.ergebnis;
    const alle = alleLoesungen(op, ergebnis, grenze);
    if (alle.length < 2) continue;

    const kandidaten = gemischt(rng, bedingungen(op, grenze[1]));
    for (const b of kandidaten) {
      const treffer = alle.filter(([a, bb]) => b.test(a, bb));
      if (treffer.length < 2) continue;

      const beispiel = eines(rng, treffer);
      // ★ „Mit dem Ergebnis N" bliebe hier oft über 40 Zeichen (Braillezeile,
      // siehe `plus-generator.test.ts`) - die Zeile mit der Lücke zeigt die
      // Zahl ohnehin (`[] +[] =12`), das Wort dafür ist nicht nötig.
      const angabe = [
        `Finde eine ${artName(op)}aufgabe.`,
        b.text,
        `${LUECKE} ${ZEICHEN[op]}${LUECKE} =${zahl(ergebnis)}`,
      ].join("\n");

      return {
        paket,
        art: "erfinden",
        op,
        angabe,
        loesung: `${zahl(beispiel[0])} und ${zahl(beispiel[1])}`,
        zahlen: [ergebnis],
        passt: (antwort: string) => {
          const paar = zweiZahlen(antwort);
          if (!paar) return false;
          const [a, bb] = paar;
          if (a < grenze[0] || a > grenze[1] || bb < grenze[0] || bb > grenze[1]) return false;
          const rechnungStimmt = op === "plus" ? a + bb === ergebnis : op === "minus" ? a - bb === ergebnis : a * bb === ergebnis;
          if (!rechnungStimmt) return false;
          return b.test(a, bb);
        },
      };
    }
  }
  throw new NochNichtGebaut(paket, "erfinden");
};
