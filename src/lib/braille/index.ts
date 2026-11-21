/**
 * Braille-Modul für das Lernprogramm „Brailleschrift lernen am PC".
 * Engine in Punkte-Logik (Quelle der Wahrheit) + Anzeige-/Eingabe-Helfer.
 */
export * from "./cell";
export * from "./tables";
export * from "./engine";
// Marburger Mathematikschrift (Zahlenbrüche) - additiv neben der Textschrift-Engine
export * from "./marburgerMathe";
export * from "./render";
export * from "./chord";
export * from "./curriculum";
export * from "./adaptive";
export * from "./progress";
export * from "./account";
export * from "./sound";
// P0a
export * from "./announce";
export * from "./play";
// P0b
export * from "./stars";
export * from "./xp";
export * from "./earcons";
export * from "./voice";
export * from "./treasure";
export * from "./streak";
export * from "./session";
// P1a
export * from "./confuse";
export * from "./migrateIds";
// P1b
export * from "./etappen";
export * from "./setup";
// P2
export * from "./liblouis";
// P3
export * from "./express";
// P3.5
export * from "./liblouis.types";
// P4 — Kurzschrift: 48 KFA-Lektionen (Umbau 03.07.2026)
export * from "./kurzschrift_content";
export * from "./kurzschrift_material";
// UEB Grade 2 (Englisch): offizieller Lehrgang L4–L22 (Australian Training Manual)
export * from "./ueb_content";
export * from "./ueb_material";
// Lehrkraft-Steuerung (07.09.2026): Wochenaufgabe
export * from "./wochenaufgabe";
// Phase X (Braillezeile-Kopplung — Spike: Logik + Transport)
export * from "./display";
export * from "./display.transport";
