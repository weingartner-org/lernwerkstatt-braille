/**
 * Ich denke mir eine Zahl - rückwärts lösen.
 *
 * Beleg: BEFUND …, B4 - `[] +12 =[] *4 =100` (Knobel 1808).
 *
 * ★ Der Trick, der die Eindeutigkeit schenkt: die Schritte werden VORWÄRTS aus
 * der gedachten Zahl gebaut (die kennt der Generator ja), nie rückwärts
 * geraten. „Geteilt durch" kommt nur vor, wenn die Zwischenzahl an dieser
 * Stelle wirklich glatt aufgeht - das ist dann automatisch so, weil aus einer
 * ganzen Zahl herausgeteilt wird, die vorher durch denselben Teiler mal
 * genommen wurde.
 *
 * ★★★ Stufe 1 hat noch kein Einmaleins (Rückmeldung Johannes/Haupt-Chat,
 * 26.09.2026) - dort gibt es nur Plus, Minus und, in Worten, „Verdopple" /
 * „Halbiere". Und JEDE Zahl bleibt dort unter 20, nicht nur die gedachte -
 * auch die Zwischenschritte. Ab Stufe 2 ist das kleine Einmaleins erlaubt,
 * und der Zahlenraum wächst auf 100.
 */
import type { Aufgabe } from "../aufgabe";
import { ganz, eines } from "../aufgabe";
import { ohneWiederholung } from "./hilfen";

interface Schritt { text: string; neu: number }

/** Stufe 1: nur Plus, Minus, Verdoppeln, Halbieren - alles bleibt unter 20. */
function schrittStufe1(rng: () => number, wert: number): Schritt {
  const moeglich: Array<() => Schritt> = [];
  const restPlus = 19 - wert;
  if (restPlus >= 2) {
    moeglich.push(() => {
      const n = ganz(rng, 2, Math.min(restPlus, 9));
      return { text: `Ich rechne plus ${n}.`, neu: wert + n };
    });
  }
  const maxMinus = Math.min(wert - 1, 9);
  if (maxMinus >= 2) {
    moeglich.push(() => {
      const n = ganz(rng, 2, maxMinus);
      return { text: `Ich rechne minus ${n}.`, neu: wert - n };
    });
  }
  if (wert * 2 <= 19) moeglich.push(() => ({ text: "Verdopple deine Zahl.", neu: wert * 2 }));
  if (wert % 2 === 0 && wert / 2 >= 1) moeglich.push(() => ({ text: "Halbiere deine Zahl.", neu: wert / 2 }));
  // ★ Ganz am Rand (Zahl 1 oder 2) bleibt fast nichts übrig - dann sicher nach unten.
  if (!moeglich.length) return { text: "Ich rechne minus 1.", neu: Math.max(1, wert - 1) };
  return eines(rng, moeglich)();
}

/** Stufe 2: kleines Einmaleins erlaubt, Zahlenraum bis 100. */
function schrittStufe2(rng: () => number, wert: number): Schritt {
  const moeglich: Array<() => Schritt> = [];
  const restPlus = 100 - wert;
  if (restPlus >= 2) {
    moeglich.push(() => {
      const n = ganz(rng, 2, Math.min(restPlus, 20));
      return { text: `Ich rechne plus ${n}.`, neu: wert + n };
    });
  }
  const maxMinus = Math.min(wert - 1, 20);
  if (maxMinus >= 2) {
    moeglich.push(() => {
      const n = ganz(rng, 2, maxMinus);
      return { text: `Ich rechne minus ${n}.`, neu: wert - n };
    });
  }
  const malN = eines(rng, [2, 3, 4, 5, 6, 7, 8, 9, 10]);
  if (wert * malN <= 100) moeglich.push(() => ({ text: `Dann rechne ich mal ${malN}.`, neu: wert * malN }));
  const teilbar = [2, 3, 4, 5, 6, 7, 8, 9, 10].filter((d) => wert % d === 0 && wert / d >= 1);
  if (teilbar.length) {
    const d = eines(rng, teilbar);
    moeglich.push(() => ({ text: `Ich teile durch ${d}.`, neu: wert / d }));
  }
  if (!moeglich.length) return { text: "Ich rechne minus 1.", neu: Math.max(1, wert - 1) };
  return eines(rng, moeglich)();
}

/** Stufe 3-8: wie bisher - Malnehmen und Teilen mit wachsendem Zahlenraum. */
function schrittAbStufe3(rng: () => number, wert: number, stufe: number): Schritt {
  const grenze = stufe <= 4 ? 20 : 50;
  const moeglich: Array<() => Schritt> = [
    () => { const n = ganz(rng, 2, grenze); return { text: `Ich rechne plus ${n}.`, neu: wert + n }; },
  ];
  const maxMinus = Math.min(wert - 1, grenze);
  if (maxMinus >= 2) {
    moeglich.push(() => { const n = ganz(rng, 2, maxMinus); return { text: `Ich rechne minus ${n}.`, neu: wert - n }; });
  }
  const malN = eines(rng, [2, 3, 4, 5]);
  if (wert * malN <= (stufe <= 4 ? 400 : 2000)) {
    moeglich.push(() => ({ text: `Dann rechne ich mal ${malN}.`, neu: wert * malN }));
  }
  const teilbar = [2, 3, 4, 5, 6, 8, 10].filter((d) => wert % d === 0 && wert / d >= 1);
  if (teilbar.length) {
    const d = eines(rng, teilbar);
    moeglich.push(() => ({ text: `Ich teile durch ${d}.`, neu: wert / d }));
  }
  return eines(rng, moeglich)();
}

function naechsterSchritt(rng: () => number, wert: number, stufe: number): Schritt {
  if (stufe <= 1) return schrittStufe1(rng, wert);
  if (stufe === 2) return schrittStufe2(rng, wert);
  return schrittAbStufe3(rng, wert, stufe);
}

export function denkeEineZahl(stufe: number, rng: () => number, bekannt?: readonly string[]): Aufgabe {
  return ohneWiederholung(bekannt, () => {
    const obereGrenze = stufe <= 1 ? 15 : stufe === 2 ? 20 : stufe <= 4 ? 30 : stufe <= 6 ? 50 : 100;
    const start = ganz(rng, 1, obereGrenze);
    const anzahlSchritte = stufe <= 2 ? 1 : stufe <= 4 ? 2 : 3;
    const zeilen: string[] = [];
    let wert = start;
    for (let i = 0; i < anzahlSchritte; i++) {
      const s = naechsterSchritt(rng, wert, stufe);
      zeilen.push(s.text);
      wert = s.neu;
    }
    const angabe = [
      "Ich denke mir eine Zahl.",
      ...zeilen,
      `Jetzt habe ich ${wert}.`,
      "Welche Zahl habe ich zuerst gedacht?",
      "Meine Zahl =[]",
    ].join("\n");
    const tipp = stufe <= 2
      ? "Rechne rückwärts: mach das Gegenteil."
      : "Geh die Schritte rückwärts durch und mach das Gegenteil.";
    return {
      paket: `raetsel-${stufe}`, art: "knobel", op: "gemischt", titel: "Ich denke mir eine Zahl",
      angabe, loesung: String(start), zahlen: [start, wert],
      tipp,
      erklaerung: `Rückwärts gerechnet kommst du von ${wert} auf ${start}.`,
    };
  });
}
