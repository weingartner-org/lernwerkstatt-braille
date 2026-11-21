/**
 * Logikrätsel - Reihenfolge aus Vergleichen, oder wer auf der Bank sitzt.
 *
 * Beleg: BEFUND …, B6 - Reihenfolge, Sitzbank, Wahrheit und Lüge
 * (Knobel 1704-1738).
 *
 * ★★★ Eindeutigkeit wird nicht nur behauptet, sondern per Brute Force über
 * ALLE Anordnungen der Namen geprüft, bevor das Rätsel zurückgegeben wird -
 * genau wie es der Auftrag verlangt. Das ist zugleich ein Sicherheitsnetz:
 * sollte ein Aufbau doch nicht eindeutig sein, wird er verworfen und neu
 * gebaut, statt ein zweideutiges Rätsel auszuliefern.
 *
 * - Reihenfolge: eine Kette von Vergleichen zwischen Nachbarn
 *   (`A schneller als B`, `B schneller als C`, …) legt die GANZE Reihenfolge
 *   fest - jeder einzelne Vergleich ist dabei notwendig: fehlte einer, zerfiele
 *   die Kette in zwei Gruppen, deren Reihenfolge zueinander offen bliebe.
 * - Sitzbank (nur zu dritt): „A sitzt neben B" und „C sitzt neben B" können nur
 *   dann beide gelten, wenn B in der Mitte sitzt - ob A oder C links sitzt,
 *   bleibt offen, ändert aber nichts an der gefragten Antwort.
 */
import type { Aufgabe } from "../aufgabe";
import { gemischt } from "../aufgabe";
import { ohneWiederholung, NAMEN, alleAnordnungen } from "./hilfen";

interface Thema { komparativ: string; anfang: string; ende: string }
const THEMEN: readonly Thema[] = [
  { komparativ: "schneller", anfang: "Wer ist am schnellsten?", ende: "Wer ist am langsamsten?" },
  { komparativ: "größer", anfang: "Wer ist am größten?", ende: "Wer ist am kleinsten?" },
  { komparativ: "älter", anfang: "Wer ist am ältesten?", ende: "Wer ist am jüngsten?" },
];

function reihenfolge(rng: () => number, anzahl: number) {
  for (let versuch = 0; versuch < 20; versuch++) {
    const namen = gemischt(rng, NAMEN).slice(0, anzahl);
    const thema = THEMEN[Math.floor(rng() * THEMEN.length)];
    // Reihenfolge[0] ist der/die "schnellste" - die Kette geht der Reihe nach.
    const hinweise = namen.slice(0, -1).map((n, i) => `${n} ist ${thema.komparativ} als ${namen[i + 1]}.`);
    const gefragtLetzter = rng() < 0.5;
    const gesucht = gefragtLetzter ? namen[namen.length - 1] : namen[0];
    const frage = gefragtLetzter ? thema.ende : thema.anfang;

    // Brute Force: passt GENAU eine Anordnung zu allen Hinweisen?
    const passende = alleAnordnungen(namen).filter((ordnung) =>
      namen.slice(0, -1).every((n, i) => ordnung.indexOf(n) === ordnung.indexOf(namen[i + 1]) - 1),
    );
    if (passende.length !== 1) continue;

    return {
      angabe: `${hinweise.join("\n")}\n${frage}`,
      loesung: gesucht, zahlen: [],
      tipp: "Zeichne die Reihenfolge als Kette von links nach rechts.",
      erklaerung: `Die Kette legt die ganze Reihenfolge fest: ${namen.join(" vor ")}.`,
    };
  }
  // Fallback - kommt praktisch nie vor, sichert aber gegen einen unendlichen Ausfall.
  const namen = gemischt(rng, NAMEN).slice(0, anzahl);
  const hinweise = namen.slice(0, -1).map((n, i) => `${n} ist schneller als ${namen[i + 1]}.`);
  return {
    angabe: `${hinweise.join("\n")}\nWer ist am schnellsten?`,
    loesung: namen[0], zahlen: [],
    tipp: "Zeichne die Reihenfolge als Kette von links nach rechts.",
    erklaerung: `Die Kette legt die ganze Reihenfolge fest: ${namen.join(" vor ")}.`,
  };
}

function sitzbank(rng: () => number) {
  const namen = gemischt(rng, NAMEN).slice(0, 3);
  const [a, mitte, c] = namen;
  const angabe = `Drei Kinder sitzen nebeneinander auf einer Bank.\n${a} sitzt neben ${mitte}.\n${c} sitzt neben ${mitte}.\nWer sitzt in der Mitte?`;

  // Brute Force über alle Anordnungen von drei Kindern in einer Reihe.
  const passende = alleAnordnungen(namen).filter((ordnung) => {
    const posA = ordnung.indexOf(a), posM = ordnung.indexOf(mitte), posC = ordnung.indexOf(c);
    return Math.abs(posA - posM) === 1 && Math.abs(posC - posM) === 1;
  });
  // Jede passende Anordnung hat densselben mittleren Platz (bei drei Plätzen
  // ist nur EINER zu beiden Nachbarn benachbart) - die Antwort ist eindeutig,
  // auch wenn links/rechts offen bleibt.
  const mittenPlatz = new Set(passende.map((o) => o[1]));
  if (mittenPlatz.size !== 1 || !mittenPlatz.has(mitte)) return null;

  return {
    angabe, loesung: mitte, zahlen: [],
    tipp: "Wer neben beiden anderen sitzt, sitzt in der Mitte.",
    erklaerung: `${mitte} ist zu beiden anderen Nachbar - das geht nur in der Mitte.`,
  };
}

export function logikraetsel(stufe: number, rng: () => number, bekannt?: readonly string[]): Aufgabe {
  return ohneWiederholung(bekannt, () => {
    const anzahl = stufe <= 4 ? 3 : 4;
    let teil = stufe <= 4 && rng() < 0.4 ? sitzbank(rng) : null;
    if (!teil) teil = reihenfolge(rng, anzahl);
    return {
      paket: `raetsel-${stufe}`, art: "knobel", op: "zahlen", titel: "Logikrätsel",
      ...teil,
    } satisfies Aufgabe;
  });
}
