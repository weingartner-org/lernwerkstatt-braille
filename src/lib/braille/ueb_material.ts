/**
 * UEB-Übungsmaterial der Lektionen 4–22 (Kurzschrift-Kern).
 *
 * REINE DATEN — lädt das build-time generierte, geprüfte Material
 * (generated/ueb-material.generated.json). Jedes Wort und jeder Satz ist per
 * liblouis en-ueb-g2 verifiziert: Er braucht AUSSCHLIESSLICH Kürzungen aus
 * Lektionen ≤ N (UEB-Grundprinzip — keine fehlerhaft gekürzten Wörter).
 * Erzeugt von scripts/ueb/ueb-gen-material.mjs; nie von Hand ändern.
 *
 * Quelle des Rohmaterials: projekteigener englischer Korpus
 * (src/lib/typing/corpusEn.ts). Braille-Zellen kommen zur Laufzeit aus
 * liblouis en-ueb-g2, nie aus dieser Datei.
 */
import raw from "./generated/ueb-material.generated.json";

interface LessonMaterial {
  words: string[];
  sentences: string[];
}

const MATERIAL = (raw as { lessons: Record<string, LessonMaterial> }).lessons;

/** key aus Etappen-/Level-id: "ueb-l07" → "l07". */
function normId(lessonId: string): string {
  const m = lessonId.match(/l\d{2}$/);
  return m ? m[0] : lessonId;
}

export function uebWords(lessonId: string): string[] {
  return MATERIAL[normId(lessonId)]?.words ?? [];
}
export function uebSentences(lessonId: string): string[] {
  return MATERIAL[normId(lessonId)]?.sentences ?? [];
}
/** Wörter zuerst (niedrige Stufe), dann Sätze (höhere Stufe). */
export function uebItems(lessonId: string): string[] {
  const m = MATERIAL[normId(lessonId)];
  return m ? [...m.words, ...m.sentences] : [];
}
