/**
 * Die Formen aus den neuen Schulbüchern - gemeinsame Typen.
 *
 * ★ Quelle für jede Form: `BEFUND-2026-09-25-SCHULBUECHER-NEUE-FORMATE.md`
 * im App-Ordner, mit Buch und Zeile. Johannes am 26.09.2026: „bau ein was du
 * gefunden hast".
 *
 * Anders als die sechzehn alten Formen brauchen diese oft mehr als EINEN Kern:
 * ein Rechendreieck hat drei Zahlen, ein Zahlenhaus eine ganze Zerlegung. Sie
 * bekommen deshalb den Zahlenraum des Pakets und seine Rechenart mit und
 * bauen sich ihre Zahlen selbst, wo der Kern nicht reicht.
 */
import type { Aufgabe, Aufgabenart, Operation } from "../../aufgabe";
import type { Kern, Zufall } from "../kerne";

export interface BuchArgs {
  paket: string;
  art: Aufgabenart;
  /** Der Kern, den die Bauart des Pakets geliefert hat. */
  kern: Kern;
  rng: Zufall;
  /** Noch ein Kern derselben Bauart. */
  nachschub: () => Kern;
  /** Der Zahlenraum des Pakets, `null` wenn er nicht als Zahlen dasteht. */
  raum: [number, number] | null;
  /** Die Rechenart des Pakets aus dem Stoffplan. */
  op: Operation;
  /** Die Schulstufe des Pakets (aus der Id: „3-05" ist Stufe 3). */
  stufe: number;
}

/**
 * Eine Buchform. Wirft `NochNichtGebaut`, wenn sie mit diesem Paket nichts
 * anfangen kann - dann nimmt der Lauf eine andere Form.
 */
export type Buchform = (args: BuchArgs) => Aufgabe;
