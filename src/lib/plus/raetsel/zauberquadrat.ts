/**
 * Zauberquadrat - jede Zeile, Spalte und beide Diagonalen ergeben dieselbe Summe.
 *
 * Beleg: BEFUND …, B7 (Knobel 444, Beleg im Ursprungs-Repository). Ausgangspunkt ist das
 * Lo-Shu-Quadrat, das älteste bekannte 3×3-Zauberquadrat:
 *
 *     4 9 2
 *     3 5 7
 *     8 1 6
 *
 * ★★★ Drehen, Spiegeln, eine Zahl dazuzählen und (ab Stufe 4) mit einer Zahl
 * malnehmen verändern NIE die magische Eigenschaft: Drehen und Spiegeln sind
 * nur eine andere Anordnung derselben drei Zeilen/Spalten/Diagonalen, und
 * jede Zeile/Spalte/Diagonale hat genau drei Felder - eine Zahl dazuzählen
 * erhöht jede Summe also um das Dreifache, egal welche Zeile. Die
 * Eindeutigkeit der Lücken ist deshalb keine Annahme, sondern folgt aus der
 * Bauart: die fehlenden Felder liegen so, dass keine Zeile und keine Spalte
 * zwei Lücken zugleich trägt - jede Lücke lässt sich also direkt aus ihrer
 * (vollständigen) Zeile oder Spalte ausrechnen.
 */
import type { Aufgabe } from "../aufgabe";
import { ganz, eines } from "../aufgabe";
import { ohneWiederholung, mehrereLuecken } from "./hilfen";

const LO_SHU: readonly (readonly number[])[] = [
  [4, 9, 2],
  [3, 5, 7],
  [8, 1, 6],
];

function drehen(m: readonly (readonly number[])[]): number[][] {
  return [
    [m[2][0], m[1][0], m[0][0]],
    [m[2][1], m[1][1], m[0][1]],
    [m[2][2], m[1][2], m[0][2]],
  ];
}

function spiegeln(m: readonly (readonly number[])[]): number[][] {
  return m.map((zeile) => [...zeile].reverse());
}

export function zauberquadrat(stufe: number, rng: () => number, bekannt?: readonly string[]): Aufgabe {
  return ohneWiederholung(bekannt, () => {
    let m: number[][] = LO_SHU.map((z) => [...z]);
    const drehungen = ganz(rng, 0, 3);
    for (let i = 0; i < drehungen; i++) m = drehen(m);
    if (rng() < 0.5) m = spiegeln(m);

    const faktor = stufe >= 4 ? eines(rng, [1, 1, 2, 3]) : 1;
    const summand = ganz(rng, 0, stufe <= 3 ? 10 : 30);
    m = m.map((zeile) => zeile.map((feld) => feld * faktor + summand));
    const summe = m[0][0] + m[0][1] + m[0][2];

    // Fehlende Felder: 1-3 Stück, nie zwei in derselben Zeile oder Spalte -
    // so folgt jede Lücke direkt aus ihrer (sonst vollständigen) Zeile/Spalte.
    const anzahlLuecken = stufe <= 2 ? 1 : stufe <= 4 ? 2 : ganz(rng, 2, 3);
    const zeilen = [0, 1, 2].sort(() => rng() - 0.5).slice(0, anzahlLuecken);
    const spalten = [0, 1, 2].sort(() => rng() - 0.5).slice(0, anzahlLuecken);
    // ★ In Lesereihenfolge (Zeile für Zeile, links nach rechts) sortiert - so
    // tippt das Kind der Reihe nach, wie es die Zeile vor sich sieht.
    const luecken = zeilen.map((z, i) => [z, spalten[i]] as const)
      .sort((a, b) => a[0] - b[0] || a[1] - b[1]);

    const werte = luecken.map(([z, s]) => m[z][s]);
    const zeilenText = m.map((zeile, z) =>
      zeile.map((feld, s) => (luecken.some(([lz, ls]) => lz === z && ls === s) ? "[]" : String(feld))).join(" | "),
    );
    const angabe = [`Jede Zeile, Spalte und Diagonale ergibt ${summe}.`, ...zeilenText].join("\n");
    const { loesung, auchRichtig } = mehrereLuecken(werte);
    const tipp = stufe <= 2
      ? "Zähl die Zeile bis zur Zahl dazu."
      : "Jede Zeile, Spalte und Diagonale ergibt dieselbe Summe.";

    return {
      paket: `raetsel-${stufe}`, art: "knobel", op: "plus", titel: "Zauberquadrat",
      angabe, loesung, auchRichtig, zahlen: [summe, ...werte],
      tipp,
      erklaerung: `Die Summe ist überall ${summe}. Jede Lücke folgt aus ihrer Zeile oder Spalte.`,
    };
  });
}
