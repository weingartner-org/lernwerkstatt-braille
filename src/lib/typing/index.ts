/*
 * Ersatzteil im Paket „Lernwerkstatt Braille": Die Plattform bündelt hier das ganze Modul eines
 * Zehnfinger-Trainers (Übungstexte, Lehrplan, Abzeichen ...). Das Paket enthält diese Programm-Teile
 * nicht. Es braucht nur die gemeinsame Konten- und Klassenschicht (Lehrkraft, Kind, Klasse) und
 * einige kleine Hilfen; sie werden hier einzeln ausgeführt statt gebündelt.
 */
export { typingBackend } from "./backend";
export {
  VORGABE_STUFE,
  langLabel,
  stufeLabel,
  uebungsSpracheImWeg,
  uebungsSprachenImWeg,
} from "./account";
export type { ClassTeacher, KindVerschoben, Lang, Result, Stufe, TypingAccount, TypingClass } from "./account";
export { BEZUGSTEMPO, FEHLER_GEWICHT, FEHLER_GEWICHT_FREI, MIND_ZEICHEN_WERTUNG } from "./schreibprobeWertung";
export { PRUEFUNG_WORT, PRUEFUNG_WORT_EN } from "./schreibprobe";
export { anredeFuer, skinForStufe } from "./skin";
export type { Anrede } from "./skin";
export { focusPracticeField } from "./focusField";
export { loadProgress } from "./progress";
export { listSelectableWeeks, weekLabelJeSprache } from "./goals";
export { ansageGewaehlt } from "./vorlesen";
export { useTypingA11y } from "./a11y";
