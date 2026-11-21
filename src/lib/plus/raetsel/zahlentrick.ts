/**
 * Zahlentrick - was auch immer du dir denkst, es kommt dasselbe heraus.
 *
 * Beleg: BEFUND …, B8 - „+76, Hunderter streichen …" (Beleg im Ursprungs-Repository, Beleg im Ursprungs-Repository).
 *
 * ★★★ Das MUSS für JEDE Zahl aufgehen, nicht nur für hübsche Beispiele - hier
 * steckt die Rechnung deshalb symbolisch in `(vervielfachen, dazuzählen)`:
 * die gedachte Zahl wird zuerst mit einem Faktor vervielfacht (verdoppeln
 * oder verdreifachen), dann kommen nur GANZE, durch denselben Faktor teilbare
 * Zahlen dazu, und am Ende wird durch denselben Faktor wieder geteilt. Der
 * Faktor der gedachten Zahl ist danach wieder genau 1 - zieht man die gedachte
 * Zahl ab, bleibt der Faktor 0, und übrig bleibt nur, was dazugezählt wurde.
 * Das gilt unabhängig davon, welche Zahl man sich am Anfang gedacht hat.
 *
 * `simuliereZahlentrick` liest die erzeugten Zeilen zurück und rechnet sie für
 * eine beliebige Zahl nach - so beweist der Test es an vielen Zahlen, statt es
 * nur zu behaupten.
 */
import type { Aufgabe } from "../aufgabe";
import { ganz, eines } from "../aufgabe";
import { ohneWiederholung } from "./hilfen";

interface Trick { schritte: string[]; ergebnis: number }

function bauTrick(rng: () => number, stufe: number): Trick {
  const schritte: string[] = [];
  const skalierung = eines(rng, [2, 3]);
  let konst = 0;
  // ★★ Rückmeldung 26.09.2026: „plus 3, plus 7, minus deine Zahl" ist zu
  // durchsichtig - IMMER mindestens ein Verdoppeln/Verdreifachen (oder
  // Halbieren/Teilen als Gegenstück), sonst ist es kein Trick, nur eine
  // offensichtliche Rückrechnung.
  schritte.push(skalierung === 2 ? "Verdopple deine Zahl." : "Verdreifache deine Zahl.");
  const anzahlAdditiv = stufe <= 4 ? 1 : 2;
  for (let i = 0; i < anzahlAdditiv; i++) {
    const roh = ganz(rng, 1, stufe <= 4 ? 8 : 15);
    const n = roh * skalierung;
    konst += n;
    schritte.push(`Rechne plus ${n}.`);
  }
  konst = konst / skalierung;
  schritte.push(skalierung === 2 ? "Halbiere das Ergebnis." : `Teile durch ${skalierung}.`);
  schritte.push("Rechne minus deine Zahl.");
  return { schritte, ergebnis: konst };
}

/** Die Zeilen für eine gegebene Zahl `x` nachrechnen - für den Test mit vielen Zahlen. */
export function simuliereZahlentrick(angabe: string, x: number): number {
  let wert = x;
  for (const roh of angabe.split("\n")) {
    const zeile = roh.trim();
    let treffer: RegExpExecArray | null;
    if (zeile === "Verdopple deine Zahl.") wert *= 2;
    else if (zeile === "Verdreifache deine Zahl.") wert *= 3;
    else if (zeile === "Halbiere das Ergebnis.") wert /= 2;
    else if (zeile === "Rechne minus deine Zahl.") wert -= x;
    else if ((treffer = /^Teile durch (\d+)\.$/.exec(zeile))) wert /= Number(treffer[1]);
    else if ((treffer = /^Rechne plus (\d+)\.$/.exec(zeile))) wert += Number(treffer[1]);
    else if ((treffer = /^Rechne minus (\d+)\.$/.exec(zeile))) wert -= Number(treffer[1]);
  }
  return wert;
}

export function zahlentrick(stufe: number, rng: () => number, bekannt?: readonly string[]): Aufgabe {
  return ohneWiederholung(bekannt, () => {
    const { schritte, ergebnis } = bauTrick(rng, stufe);
    const angabe = ["Denk dir eine Zahl.", ...schritte, "Was kommt heraus?", "Ergebnis =[]"].join("\n");
    const tipp = stufe <= 4
      ? "Probier es mit einer eigenen Zahl aus."
      : stufe <= 6
        ? "Probier zwei eigene Zahlen aus - es bleibt gleich."
        : "Probier es mit mehreren eigenen Zahlen aus - das Ergebnis bleibt immer gleich.";
    return {
      paket: `raetsel-${stufe}`, art: "knobel", op: "gemischt", titel: "Zahlentrick",
      angabe, loesung: String(ergebnis), zahlen: [ergebnis],
      tipp,
      erklaerung: `Deine gedachte Zahl hebt sich am Ende weg - übrig bleibt immer ${ergebnis}.`,
    };
  });
}
