/**
 * Die Formen aus den neuen Schulbüchern (26.09.2026) - hier laufen sie zusammen.
 *
 * Jede Form liegt in einer eigenen Datei. `formen.ts` fragt hier nach, bevor es
 * seine alten sechzehn Formen durchgeht.
 */
import type { Aufgabenart } from "../../aufgabe";
import type { Buchform } from "./typen";
import { FORMEN_A } from "./gruppeA";
import { FORMEN_B } from "./gruppeB";

export type { BuchArgs, Buchform } from "./typen";

/** Die gebauten Buchformen. Was hier fehlt, gilt als nicht gebaut. */
export const BUCHFORMEN: Partial<Record<Aufgabenart, Buchform>> = {
  ...FORMEN_A,
  ...FORMEN_B,
};
