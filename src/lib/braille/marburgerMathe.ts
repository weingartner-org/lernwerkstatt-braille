/**
 * Marburger Mathematikschrift (6 Punkt) - additive Zusatz-Tabelle NUR für
 * Zahlenbrüche aus positiven ganzen Zahlen (b13c „Brüche").
 *
 * ★ WARUM EIN EIGENES MODUL, NICHT DIE TEXTSCHRIFT-ENGINE (`engine.ts`):
 * Schulbücher werden am PC mit Computerbraille (8 Punkt) gelesen, aber ein
 * Kind mit Blindheit in der Volksschule liest mathematische Zeichen auf
 * Papier in der 6-Punkt Marburger Mathematikschrift (Johannes, 22.09.2026) -
 * das ist eine EIGENE Schrift mit eigenen Regeln, keine Rechenzeichen-
 * Erweiterung der Textschrift. `engine.ts` übersetzt Textschrift und bleibt
 * dafür unverändert (Basis-/Vollschrift, Datum, römische Zahlen, Prozent, § -
 * siehe die übrigen b13-Etappen). Diese Datei tritt NUR für Zahlenbrüche
 * daneben.
 *
 * Quelle: „Das System der Mathematikschrift in der Deutschen Brailleschrift",
 * BSKDL, Beschlüsse vom 30.11.2013 in Basel, 1. Auflage 2015 - hier
 * zusammengefasst in
 * `Claude/Projects/Lernplattform/Programme/PLUS/Marburger Mathematikschrift - Spezifikation.md`.
 * Alle Zeilenangaben (Z. …) in den Kommentaren dieser Datei beziehen sich auf
 * die Kapitel-/Zeilenzählung DIESER Spezifikation (die wiederum auf die
 * BSKDL-Arbeitsdatei `braille-math.txt` verweist).
 *
 * ★★★ KEINE LIBLOUIS-GEGENPROBE (bewusst, kein Versehen):
 * Das sonst plattformweite Prinzip „jede Zelle gegen liblouis prüfen"
 * (`braille-voll-gegen-liblouis.test.ts`, `liblouis.ts`) geht hier nicht -
 * liblouis führt die Marburger Mathematikschrift-Tabelle seit ihrer
 * Verschiebung nach liblouisutdml NICHT mehr im Browser-Paket (de-g0/de-g1
 * decken nur Textschrift ab). ERSATZ: jede Zelle unten trägt ihren
 * Quellenverweis als Kommentar, und `tests/braille-marburger-quellenbeleg.test.ts`
 * prüft, dass keine Zelle ohne Beleg dasteht - Nachvollziehbarkeit statt
 * Maschine.
 */
import { Cell, parseDots } from "./cell";
import { DIGIT_CELLS, NUMSIGN, BrailleSystem } from "./tables";
import { textToCells, TranscribeOptions } from "./engine";

/**
 * Gesenkte Ziffern (Kap. 2.1.2, Z. 1148-1212 der Spezifikation) - dieselben
 * Punktbilder wie die Standardziffern (Kap. 2.1.1, `DIGIT_CELLS` in
 * `tables.ts`), eine Punktreihe tiefer. Gebraucht für den Nenner eines
 * Zahlenbruchs aus positiven ganzen Zahlen (Kap. 9.1, Z. 3908-3913) sowie -
 * hier NICHT gebraucht, aber derselbe Ursprung - für Exponenten/Indizes.
 *
 * Reihenfolge wie `DIGIT_CELLS`: Index 0 = Ziffer 0 … Index 9 = Ziffer 9.
 */
// Quellenverweise, EXAKT wie in der Spezifikation gegeben - keine erfundene
// Zeilengenauigkeit. Alle zehn Ziffern stehen in der Tabelle Kap. 2.1.2,
// Z. 1148-1212 ("Die gesenkte Schreibweise"). Für fünf Ziffern nennt die
// Spezifikation an ANDERER Stelle zusätzlich eine genaue Einzelzeile - die
// steht dann zusätzlich beim jeweiligen Eintrag: Ziffer 1 → Fallstrick F5,
// Z. 1149 · Ziffer 3 → F11, Z. 1151 · Ziffer 4 → F11, Z. 1152 · Ziffer 6 →
// F11, Z. 1154 · Ziffer 7 → F10, Z. 1160.
export const GESENKT_DIGIT_DOTS: readonly string[] = [
  "356", // Ziffer 0 - Kap. 2.1.2, Z. 1148-1212
  "2", //   Ziffer 1 - Kap. 2.1.2, Z. 1149 (F5, Z. 983-999) - ACHTUNG: dieselbe
  //        Zelle wie das Dezimalkomma (Kap. 2.1.3, Z. 1215). Siehe Warnung
  //        unten bei `zahlenbruchZellen` (Fall „Nenner beginnt mit 1").
  "23", //  Ziffer 2 - Kap. 2.1.2, Z. 1148-1212
  "25", //  Ziffer 3 - Kap. 2.1.2, Z. 1151 (F11, Z. 1056-1064)
  "256", // Ziffer 4 - Kap. 2.1.2, Z. 1152 (F11, Z. 1056-1064) - ACHTUNG:
  //        dieselbe Zelle wie das FRÜHERE, gestrichene Divisionszeichen
  //        (Kap. 5, Hinweis Z. 2694 - „aus dem Zeichenbestand gestrichen").
  //        Hier immer korrekt als gesenkte 4 gelesen, nie als „/".
  "26", //  Ziffer 5 - Kap. 2.1.2, Z. 1148-1212
  "235", // Ziffer 6 - Kap. 2.1.2, Z. 1154 (F11, Z. 1056-1064)
  "2356", // Ziffer 7 - Kap. 2.1.2, Z. 1160 (F10, Z. 1044-1054)
  "236", // Ziffer 8 - Kap. 2.1.2, Z. 1148-1212
  "35", //  Ziffer 9 - Kap. 2.1.2, Z. 1148-1212
];

export const GESENKT_DIGIT_CELLS: Cell[] = GESENKT_DIGIT_DOTS.map((d) => parseDots(d));

/**
 * Erkennt einen einfachen Zahlenbruch: positive ganze Zahl / positive ganze
 * Zahl, ohne Vorzeichen, ohne Leerzeichen, ohne Dezimalstelle - genau die
 * Druckschrift-Form, die b13c als Item verwendet ("1/2", "7/10", …).
 *
 * Für alles andere (Buchstaben, negative Zahlen, Leerzeichen im Zähler/
 * Nenner) gilt nach Kap. 9.2/9.3 die Bruchstrich- bzw. ausführliche
 * Schreibweise - die deckt dieses Modul bewusst NICHT ab (b13c braucht sie
 * nicht; siehe Bericht).
 */
const RE_ZAHLENBRUCH = /^([1-9][0-9]*)\/([1-9][0-9]*)$/;

export function istZahlenbruch(text: string): boolean {
  return RE_ZAHLENBRUCH.test(text);
}

/**
 * Zahlenbruch (Zähler/Nenner beide positive Ganzzahlen) in Marburger-Zellen:
 * Zähler in Standardschreibweise MIT einem Zahlzeichen, Nenner unmittelbar
 * angeschlossen in gesenkter Schreibweise OHNE eigenes Zahlzeichen und OHNE
 * Leerzeichen (Kap. 9.1, Z. 3909-3913 wörtlich - siehe Modul-Kopf).
 *
 * Belege (Spezifikation Kap. 9.1):
 *  - 1/2  → ⠼⠁⠆        (Beispiel 9.1 B01, Z. 3927)
 *  - 27/36 → ⠼⠃⠛⠒⠖     (Beispiel 9.1 B02, Z. 3939)
 *  - 9/12 → ⠼⠊⠂⠆       (Teil von Beispiel 9.1 B03, Z. 3946 - Nenner 12
 *    beginnt mit der gesenkten 1 UND belegt damit, dass die Spezifikation
 *    genau diesen Fall - Nenner startet mit ⠂ - selbst als korrekt verwendet)
 *
 * ⚠️ DER 7/10-FALL (siehe Bericht an Johannes): Für „7/10" ergibt sich
 * ⠼⠛⠂⠴ (Zahlzeichen · 7 · gesenkt-1 · gesenkt-0). Das ⠂ nach dem Zahlzeichen
 * ist DIESELBE Zelle wie das Dezimalkomma (Kap. 2.1.3, Z. 1215, F5 Z. 983-999).
 * Strukturell bleibt es trotzdem eindeutig: nach einem Komma stehen laut
 * Zahlzeichen-Modus (F1, Z. 923-925) STANDARD-Ziffern weiter, und `⠴`
 * (Punkte 3-5-6) ist in der Standardschreibweise KEINE gültige Ziffer (die
 * Standard-0 ist ⠚, Punkte 2-4-5) - „7,0…" kann also nicht entstehen. Die
 * Spezifikation selbst verwendet einen strukturell identischen Fall (Nenner
 * 12 in Beispiel 9.1 B03) ohne Schutzzeichen. GLEICHWOHL nennt Abschnitt 1.4
 * der Spezifikation (Dezimalbrüche, Kap. 2.1.3) als vereinfachende Regel
 * „für die App" ausdrücklich: „⠂ ist nach ⠼ immer Komma und nie die gesenkte
 * 1" - das ist KEIN Zitat aus dem BSKDL-Regelwerk selbst, sondern eine
 * eigene Vereinfachung der Spezifikation, und sie steht in Spannung zum
 * Bruch-Beispiel. Diese Spannung ist NICHT still aufgelöst worden, siehe
 * Bericht.
 *
 * Gibt `null` zurück, wenn `text` kein einfacher Zahlenbruch ist.
 */
export function zahlenbruchZellen(text: string): Cell[] | null {
  const m = RE_ZAHLENBRUCH.exec(text);
  if (!m) return null;
  const [, zaehler, nenner] = m;
  const cells: Cell[] = [NUMSIGN];
  for (const ch of zaehler) cells.push(DIGIT_CELLS[Number(ch)]);
  for (const ch of nenner) cells.push(GESENKT_DIGIT_CELLS[Number(ch)]);
  return cells;
}

/**
 * Wie `textToCells` (engine.ts) - aber Zahlenbrüche (siehe oben) gehen über
 * die Marburger Mathematikschrift statt über die Textschrift-Engine. Nur für
 * Basis-/Vollschrift (Kap. 2.1 nennt die gesenkte Schreibweise ausdrücklich
 * als 6-Punkt-Konzept); Computerbraille hat keine gesenkte Schreibweise und
 * bleibt unverändert bei `textToCells`.
 *
 * Additiv im Sinn der Aufgabe: `engine.ts`/`textToCells` selbst bleiben
 * unangetastet, jeder andere Aufrufer verhält sich exakt wie zuvor. Nur die
 * beiden Stellen, die einen b13c-Prompt in Zellen verwandeln
 * (`BrailleTrainer.tsx`: Legende + Schreiben/Lesen-Ziel), rufen diese
 * Funktion statt `textToCells` auf.
 */
export function textToCellsMathe(text: string, opts: TranscribeOptions = {}): Cell[] {
  const system: BrailleSystem = opts.system ?? "basis";
  if (system !== "computer") {
    const bruch = zahlenbruchZellen(text);
    if (bruch) return bruch;
  }
  return textToCells(text, opts);
}
