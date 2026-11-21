/**
 * Zahlenhaus (A2 im Befund, Beleg im Ursprungs-Repository) - alle Zerlegungen einer Zahl der
 * Reihe nach, mit Lücken im zweiten Summanden.
 *
 * ★ Die Zahl selbst liefert der Kern - er ist bei 1-03, 1-04 und 1-16 immer
 * eine Zerlegung oder Ergänzung, deren Ergebnis genau diese Hauszahl ist
 * (`kerne.ts`: `zerlegung`, `ergaenzung`). Die erste Zeile bleibt Beispiel;
 * danach fehlen die zweiten Summanden.
 *
 * ★★ Johannes, 26.09.2026: „Zahlenhaus der 2 / 2 =1 +[]" ist zu dünn - eine
 * einzige Zerlegung übt nichts. `1-03` würfelt die Hauszahl frei von 2 bis
 * 10 (`zerlegung`); erst ab 4 bleiben genug Zerlegungen für mindestens zwei
 * Lücken. Reicht die erste Hauszahl nicht, holt die Form über `nachschub`
 * eine neue.
 */
import { LUECKE, ganz, zahl, type Aufgabe } from "../../aufgabe";
import { NochNichtGebaut } from "../nochNichtGebaut";
import type { BuchArgs } from "./typen";
import type { Kern } from "../kerne";

const MINDESTENS = 4;

export function zahlenhaus({ paket, art, kern, rng, nachschub }: BuchArgs): Aufgabe {
  if (art !== "zahlenhaus") throw new NochNichtGebaut(paket, art);

  let gewaehlt: Kern = kern;
  for (let versuch = 0; versuch < 40; versuch++) {
    if (gewaehlt.sorte === "rechnung" && gewaehlt.op === "plus" && gewaehlt.ergebnis >= MINDESTENS) break;
    gewaehlt = nachschub();
  }
  if (gewaehlt.sorte !== "rechnung" || gewaehlt.op !== "plus" || gewaehlt.ergebnis < MINDESTENS) {
    throw new NochNichtGebaut(paket, art);
  }

  const n = gewaehlt.ergebnis;
  const zerlegungen = n - 1; // Erster Summand von 1 bis n-1.

  const gewuenscht = rng() < 0.5 ? 3 : 4;
  const rows = Math.min(gewuenscht, zerlegungen);
  const maxStart = zerlegungen - rows + 1;
  const start = ganz(rng, 1, Math.max(1, maxStart));

  // ★ n >= 4 und damit zerlegungen >= 3 sind oben erzwungen - rows ist immer
  // mindestens 3, die erste Zeile bleibt also immer das vorgerechnete
  // Beispiel, und mindestens zwei Zeilen danach tragen die Lücke.
  const zeilen: string[] = [];
  const luecken: number[] = [];
  for (let i = 0; i < rows; i++) {
    const erster = start + i;
    const zweiter = n - erster;
    if (i === 0) {
      zeilen.push(`${zahl(n)} =${zahl(erster)} +${zahl(zweiter)}`);
    } else {
      zeilen.push(`${zahl(n)} =${zahl(erster)} +${LUECKE}`);
      luecken.push(zweiter);
    }
  }

  const angabe = `Zahlenhaus der ${zahl(n)}\n${zeilen.join("\n")}`;
  const loesung = luecken.map((w) => zahl(w)).join(" und ");
  const auchRichtig = luecken.length > 1
    ? [luecken.map((w) => zahl(w)).join(", "), luecken.map((w) => zahl(w)).join(" ")]
    : undefined;
  return { paket, art, op: "plus", angabe, loesung, auchRichtig, zahlen: [n, start, rows] };
}
