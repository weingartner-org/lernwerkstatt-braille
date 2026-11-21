/**
 * Gemeinsame Typen für die liblouis Worker-Brücke.
 * Kein Logik-Code — nur Typen.
 *
 * Lizenz: Die C-Kernbibliothek (LGPL). Emscripten-Glue (MIT/NCSA).
 * GPL-3.0-JS-Wrapper (liblouis-js Easy-API) wird NIE importiert.
 */

/** Eindeutige, gepinnte Tabellen-Kennungen. Aufrufer übergibt nur diese Union;
 *  Worker mappt sie via Whitelist auf MEMFS-Pfade (Pfad-Sanitizing, §3.4). */
export type LouTable =
  | "de-g0"      // Basisschrift-Referenz (Produktion: Eigenbau engine.ts)
  | "de-g1"      // Vollschrift P2
  | "de-g2"      // Kurzschrift P4
  | "de-comp8"   // Computerbraille 8-Punkt P3
  | "en-ueb-g1"  // EN UEB unkontrahiert P5
  | "en-ueb-g2"  // EN UEB kontrahiert P5
  // ── Welle 1 der Sprachen-Apps (Bauplan 2026-11-06 §4): liblouis 3.39.0,
  //    getrennt von den 3.38-Tabellen oben (Worker: /tables39/). Gegenprobe,
  //    nicht Vorlage - gebaut wird nach dem Norm-Dokument der Sprache.
  | "fr-bfu-comp6"  // Französisch, 6 Punkt, ohne Kürzungen (CBFU 2008)
  | "es-g1"         // Spanisch, unkontrahiert
  | "it-it-comp6"   // Italienisch, 6 Punkt
  | "sv-g0"         // Schwedisch, Vollschrift ohne Kürzungen
  | "nl-NL-g0"      // Niederländisch, ohne Kürzungen
  | "pt-pt-g1";     // Portugiesisch (gilt auch für Brasilien), unkontrahiert

/** Vollständige Liste der gebündelten Tabellen-Kennungen (Build-Skript + Spike). */
export const LOU_TABLES: readonly LouTable[] = [
  "de-g0", "de-g1", "de-g2", "de-comp8", "en-ueb-g1", "en-ueb-g2",
  "fr-bfu-comp6", "es-g1", "it-it-comp6", "sv-g0", "nl-NL-g0", "pt-pt-g1",
] as const;

/** Worker-Requests (Main → Worker). `id` korreliert mit der Antwort. */
export type LouRequest =
  | { id: number; kind: "init" }
  | { id: number; kind: "translate"; text: string; table: LouTable }
  | { id: number; kind: "version" };

/** Worker-Responses (Worker → Main). */
export type LouResponse =
  | { id: number; kind: "ready"; version: string }   // Antwort auf init
  | { id: number; kind: "translated"; braille: string } // Unicode U+2800-Block
  | { id: number; kind: "version"; version: string }
  | { id: number; kind: "error"; message: string };
