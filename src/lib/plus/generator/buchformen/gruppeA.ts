/**
 * Buchformen, Gruppe A - das Register dieser Gruppe. Siehe `index.ts`.
 */
import type { Aufgabenart } from "../../aufgabe";
import type { Buchform } from "./typen";
import { dreieck } from "./dreieck";
import { zahlenhaus } from "./zahlenhaus";
import { zahlenkette } from "./zahlenkette";
import { malkreuz } from "./malkreuz";
import { stoerenfried } from "./stoerenfried";
import { klecks } from "./klecks";
import { ziffernkarten } from "./ziffernkarten";

export const FORMEN_A: Partial<Record<Aufgabenart, Buchform>> = {
  dreieck, zahlenhaus, zahlenkette, malkreuz, stoerenfried, klecks, ziffernkarten,
};
