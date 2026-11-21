/*
 * Ersatzteil im Paket „Lernwerkstatt Braille": Die Probetexte der Tippchallenge eines
 * Zehnfinger-Trainers gehören nicht zum Paket (rund 20 MB Text). Ohne Bank bietet die Schreibprobe
 * keine eigenen Texte an; die Lernwerkstatt braucht sie nicht.
 */
import type { ProbenNiveau } from "../schreibprobe";
import type { Lernweg } from "../lernweg";

/** Was ein Gerüst-Weg für die Tippchallenge liefert. */
export interface GeruestBank {
  texte: Readonly<Partial<Record<ProbenNiveau, () => Promise<{ text: string }[]>>>>;
  woerter: (() => Promise<Partial<Record<ProbenNiveau, readonly string[]>>>) | null;
}

export function geruestBank(_lernweg: Lernweg): GeruestBank | null {
  return null;
}
