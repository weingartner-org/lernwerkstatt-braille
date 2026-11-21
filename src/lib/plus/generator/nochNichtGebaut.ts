import type { Aufgabenart } from "../aufgabe";

/**
 * Eine Form, die es für dieses Paket (noch) nicht gibt. Mit Namen - ein Test
 * zählt diese Stellen, damit keine stillschweigend offen bleibt.
 *
 * ★ Eigene Datei, damit `formen.ts` und `buchformen/` sie beide benutzen
 * können, ohne sich gegenseitig zu laden.
 */
export class NochNichtGebaut extends Error {
  constructor(public readonly paket: string, public readonly art: Aufgabenart) {
    super(`Form "${art}" für Paket ${paket} ist noch nicht gebaut.`);
    this.name = "NochNichtGebaut";
  }
}
