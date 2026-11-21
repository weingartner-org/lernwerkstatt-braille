/**
 * Buchformen, Gruppe B - das Register dieser Gruppe. Siehe `index.ts`.
 */
import type { Aufgabenart } from "../../aufgabe";
import type { Buchform } from "./typen";
import { erfinden } from "./erfinden";
import { wege } from "./wege";
import { lesen } from "./lesen";
import { stimmtDas } from "./stimmtDas";

export const FORMEN_B: Partial<Record<Aufgabenart, Buchform>> = {
  erfinden, wege, lesen, stimmt_das: stimmtDas,
};
