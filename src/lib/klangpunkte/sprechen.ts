/**
 * Sprachausgabe von Klangpunkte in der Sprache der App (Bauplan §1b).
 *
 * `lib/braille/voice.ts` gehört Punktgenau und Klangpunkte gemeinsam und wird
 * hier nicht angefasst. Seine Funktionen nehmen eine Sprache (`"de" | "en"`,
 * Vorgabe `"de"`); diese drei Hüllen reichen die Sprache von Klangpunkte durch.
 * Ohne Probe-Schalter ist sie `de` - dann ruft jede Hülle genau das, was vorher
 * `speakUi(text)` rief.
 *
 * ★ Seit 06.11.2026 nimmt `voice.ts` jede Sprache: `de`/`en` wie bisher, alle anderen
 *   über `stimmeFuer()` - ohne Stimme der Sprache wird nicht vorgelesen (nie deutsch).
 *   `br` geht als `br` hinein (pt-BR, nie pt-PT).
 */
import { speakUi, speakUiAlways, speakUiThen, speakThenPlay } from "@/lib/braille/voice";
import { klangSprache } from "./sprache";

type VoiceLang = Parameters<typeof speakUi>[1];

/** Zweibuchstabige Sprache für `voice.ts` (`br` spricht Portugiesisch). */
export function sprechSprache(): VoiceLang {
  const s = klangSprache();
  return s;
}

export const sprich = (text: string): void => speakUi(text, sprechSprache());
export const sprichImmer = (text: string): void => speakUiAlways(text, sprechSprache());
export const sprichDann = (text: string, danach: () => void): void => speakUiThen(text, danach, sprechSprache());
export const sprichDannSpiele = (
  text: string,
  bereit: () => void,
  opts?: { silentGapMs?: number; maxWaitMs?: number },
): (() => void) => speakThenPlay(text, bereit, opts, sprechSprache());
