/**
 * Rätsel für Plus - der Bildschirm nach jeder dritten Runde, überspringbar.
 *
 * Johannes, 26.09.2026: „rundenbasiert … 8 Rechnungen und nach 3 Runden kommt
 * ein Rätsel, das man auch überspringen kann." Die Runden und den
 * Rätsel-Bildschirm baut der Haupt-Chat; diese Datei liefert nur den Inhalt -
 * einen Generator, der für jede Schulstufe 1-8 abwechslungsreiche, eindeutig
 * prüfbare Knobelaufgaben liefert. Belege für jede Rätselart stehen in
 * `BEFUND-2026-09-25-SCHULBUECHER-NEUE-FORMATE.md`, Teil B.
 *
 * ★ Jede Datei hier baut GENAU eine Rätselart:
 * - `detektiv.ts` - Zahlen-Detektiv (Steckbrief mit Hinweisen)
 * - `buchstaben.ts` - Buchstabenrätsel (gleiche Buchstaben, gleiche Zahl)
 * - `denkzahl.ts` - Ich denke mir eine Zahl (rückwärts lösen)
 * - `moeglichkeiten.ts` - Wie viele Möglichkeiten? (Kombinatorik)
 * - `zauberquadrat.ts` - Zauberquadrat (Zeilen, Spalten, Diagonalen)
 * - `logik.ts` - Logikrätsel (Reihenfolge, Sitzbank)
 * - `zahlentrick.ts` - Zahlentrick (immer dasselbe Ergebnis)
 * - `altersraetsel.ts` - Alters- und Resträtsel (zwei Angaben, eine Zahl)
 */
import type { Aufgabe } from "../aufgabe";
import { eines } from "../aufgabe";
import { zahlenDetektiv } from "./detektiv";
import { buchstabenraetsel } from "./buchstaben";
import { denkeEineZahl } from "./denkzahl";
import { wieVieleMoeglichkeiten } from "./moeglichkeiten";
import { zauberquadrat } from "./zauberquadrat";
import { logikraetsel } from "./logik";
import { zahlentrick } from "./zahlentrick";
import { altersUndRestraetsel } from "./altersraetsel";

export interface Raetselart { id: string; name: string; von: number; bis: number }

/** Für welche Schulstufen jede Rätselart gedacht ist - Belege siehe oben. */
export const RAETSELARTEN: Raetselart[] = [
  { id: "detektiv", name: "Zahlen-Detektiv", von: 1, bis: 8 },
  { id: "buchstaben", name: "Buchstabenrätsel", von: 2, bis: 8 },
  { id: "denkzahl", name: "Ich denke mir eine Zahl", von: 1, bis: 8 },
  { id: "moeglichkeiten", name: "Wie viele Möglichkeiten?", von: 1, bis: 8 },
  { id: "zauberquadrat", name: "Zauberquadrat", von: 2, bis: 8 },
  { id: "logik", name: "Logikrätsel", von: 3, bis: 8 },
  { id: "zahlentrick", name: "Zahlentrick", von: 3, bis: 8 },
  { id: "altersraetsel", name: "Alters- und Resträtsel", von: 4, bis: 8 },
];

/**
 * Ein Rätsel für diese Schulstufe.
 *
 * ★ Zur Abwechslung zwischen den Aufrufen: `raetselFuer` selbst hat kein
 * Gedächtnis - der Aufrufer (die Runden im Haupt-Chat) ruft es bei jedem
 * Rätsel-Bildschirm neu und unabhängig auf, ohne die zuletzt gewählte
 * Rätselart mitzugeben. Die einzig ehrliche Antwort darauf ist eine
 * GLEICHVERTEILTE Zufallswahl unter den für die Stufe möglichen Arten - so
 * kommt über viele Aufrufe hinweg jede Art vor, und keine Art wird
 * bevorzugt, die drei-in-Folge also nur noch ein Zufallsrisiko ist (bei
 * sechs bis acht Arten unter 3 %), keine eingebaute Schräglage.
 */
export function raetselFuer(stufe: number, rng: () => number, bekannt?: readonly string[]): Aufgabe {
  const moeglich = RAETSELARTEN.filter((a) => stufe >= a.von && stufe <= a.bis);
  const art = eines(rng, moeglich.length ? moeglich : RAETSELARTEN);
  switch (art.id) {
    case "detektiv": return zahlenDetektiv(stufe, rng, bekannt);
    case "buchstaben": return buchstabenraetsel(stufe, rng, bekannt);
    case "denkzahl": return denkeEineZahl(stufe, rng, bekannt);
    case "moeglichkeiten": return wieVieleMoeglichkeiten(stufe, rng, bekannt);
    case "zauberquadrat": return zauberquadrat(stufe, rng, bekannt);
    case "logik": return logikraetsel(stufe, rng, bekannt);
    case "zahlentrick": return zahlentrick(stufe, rng, bekannt);
    default: return altersUndRestraetsel(stufe, rng, bekannt);
  }
}
