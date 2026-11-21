/**
 * ════════════════════════════════════════════════════════════════════════════
 * DIE GEMEINSAME MESSART UND WERTUNG FÜR PUNKTGENAU
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Das Fundament für drei Zubauten, die noch kommen: Braille-Challenge,
 * Klassenmatch und eigene Übungen. Alle drei messen dieselbe Sache - wie gut
 * und wie schnell ein Kind einen Lauf geschrieben oder gelesen hat - und
 * sollen es auf dieselbe Art tun, statt drei eigene Rechenwege zu bauen, die
 * bei der nächsten Änderung auseinanderlaufen
 * ([[feedback_zwei_stellen_die_voneinander_nichts_wissen]]).
 *
 * Johannes: Die Lehrkraft wählt, ob geschrieben oder gelesen wird - beide
 * Arbeitsweisen müssen gemessen und gewertet werden.
 *
 * ── Die Zeitmessung folgt `eineMessart.ts` (Tastenflow) ─────────────────────
 * Ein Kind, das sich die Aufgabe ansagen lässt, darf dadurch nicht langsamer
 * erscheinen. Darum wird die Ansagezeit von der Arbeitszeit abgezogen, bevor
 * ein Tempo gerechnet wird - genau wie beim Tippen ({@link tempo}, gebaut auf
 * `schreibzeitNachUhr`/`tempoJeMinute`).
 *
 * ── Die Wertungsformel folgt `schreibprobeWertung.ts` ────────────────────────
 * Güte (Treffer gegen Treffer plus gewichtete Fehlgriffe) mal Wurzel des
 * gedeckelten Tempo-Anteils - „Genauigkeit schlägt Zeit", siehe dort für die
 * ausführliche Herleitung. Hier wird dieselbe Formel (`guete`, `tempoAnteil`)
 * WIEDERVERWENDET statt neu geschrieben, damit es nicht zwei Stellen gibt, die
 * voneinander nichts wissen.
 *
 * ⚠️⚠️⚠️ SCHREIBEN UND LESEN SIND NICHT VERGLEICHBAR - KEINE GEMEINSAME
 * RANGLISTE ÜBER BEIDE ARBEITSWEISEN.
 *
 * Schreiben zählt richtige ZELLEN je Minute (eine Akkord-Eingabe), Lesen
 * zählt richtige ZEICHEN je Minute (was das Kind aus einem Punktmuster
 * erkennt). Das ist nicht dieselbe Arbeit: Eine Kurzschrift-Zelle kann für
 * mehrere Zeichen stehen (z. B. eine Zelle für „sch"), und wer sie liest,
 * hat etwas anderes geleistet als wer sie schreibt. Ein Tempo-Vergleich
 * zwischen den beiden Arbeitsweisen wäre ein Messfehler, kein Befund - darum
 * bleibt in diesem Modul jede Wertung an ihre Arbeitsweise gebunden
 * ({@link LaufErgebnis.arbeitsweise}), und {@link rangprozent} ordnet
 * ausdrücklich nur innerhalb EINER Gruppe mit derselben Arbeitsweise ein.
 * Wächter: `tests/braille-wertung.test.ts`.
 *
 * ── Reine Funktionen ──────────────────────────────────────────────────────
 * Kein React, kein Backend-Zugriff, kein `localStorage` - ohne Browser
 * testbar, wie `session.ts` und die Tastenflow-Vorbilder.
 *
 * ── Keine Wertung über ein Kind ───────────────────────────────────────────
 * Die Wertung ist eine Zahl, kein Urteil. Dieses Modul enthält keinen Text,
 * der eine niedrige Zahl bedauert oder eine hohe lobt - das ist Sache der
 * Oberfläche, die diese Zahlen zeigt.
 */
import type { AreaKey } from "./areas";
import { schreibzeitNachUhr, tempoJeMinute } from "../typing/eineMessart";
import { guete, tempoAnteil } from "../typing/schreibprobeWertung";

/** Schreiben (Akkord-Eingabe, gemessen in Zellen) oder Lesen (Erkennen, gemessen in Zeichen). */
export type Arbeitsweise = "schreiben" | "lesen";

/**
 * Das Ergebnis EINES Laufs - geteilt von Braille-Challenge, Klassenmatch und
 * eigenen Übungen.
 *
 * ⚠️ {@link richtig} und {@link falsch} zählen bei „schreiben" Zellen, bei
 * „lesen" Zeichen - welche der beiden Grössen gemeint ist, sagt
 * {@link arbeitsweise}. Diese Datenform trägt keinen eigenen Zeitpunkt
 * (`beginnMs`/`endeMs`) - das ist Sache der Stelle, die einen Lauf speichert
 * (wie `Probenergebnis` es für die Tippchallenge tut); hier zählt nur, wie
 * lange gearbeitet wurde.
 */
export interface LaufErgebnis {
  /** Geschrieben oder gelesen - siehe Kopfkommentar: nicht vergleichbar. */
  arbeitsweise: Arbeitsweise;
  /** Schriftbereich, in dem der Lauf stattfand. */
  bereich: AreaKey;
  /**
   * Der Zeitraum des Laufs (ms) - die reine Arbeitszeit auf der Uhr, vom
   * Beginn bis zum Ende, VOR jedem Abzug. {@link tempo} zieht davon die
   * Ansagezeit ab, wie `schreibzeitNachUhr` es fürs Tippen tut.
   */
  arbeitszeitMs: number;
  /**
   * Darin enthaltene Ansagezeit (ms) - die App spricht, das Kind wartet
   * (Vorlesen der Aufgabe, Zeilenansage o. Ä.). Wird nirgends bestraft.
   */
  ansageMs: number;
  /** Richtige Zellen (schreiben) bzw. richtige Zeichen (lesen). */
  richtig: number;
  /** Falsche Zellen (schreiben) bzw. falsche Zeichen (lesen). */
  falsch: number;
}

/**
 * Die reine Arbeitszeit nach Abzug der Ansagezeit (ms), nie negativ.
 *
 * Muster `eineMessart.ts` (`schreibzeitNachUhr`): Zuhören wird abgezogen,
 * Überlegen zählt voll. Punktgenau kennt (noch) keinen Zeilenwechsel-Abzug
 * wie Tippchallenge/Klassenmatch - fällt einer an, kann er hier ergänzt
 * werden, ohne dass {@link tempo} sich ändert.
 */
function reineArbeitszeitMs(ergebnis: LaufErgebnis): number {
  return schreibzeitNachUhr({
    uhrMs: ergebnis.arbeitszeitMs,
    zuhoerMs: ergebnis.ansageMs,
  });
}

/**
 * Tempo - Zellen bzw. Zeichen je Minute, NACH Abzug der Ansagezeit.
 *
 * Wehrhaft: Zeit 0, keine Ansagezeit über der Gesamtzeit, keine richtigen
 * Zellen/Zeichen - nichts davon liefert NaN, Unendlich oder eine negative
 * Zahl, sondern 0 ({@link tempoJeMinute} trägt die Wehrhaftigkeit).
 */
export function tempo(ergebnis: LaufErgebnis): number {
  const netMs = reineArbeitszeitMs(ergebnis);
  return tempoJeMinute(Math.max(0, ergebnis.richtig), netMs);
}

/** Treffsicherheit 0..1 - Anteil richtig an allem, was dran war. */
export function treffsicherheit(ergebnis: LaufErgebnis): number {
  const richtig = Math.max(0, ergebnis.richtig);
  const falsch = Math.max(0, ergebnis.falsch);
  const gesamt = richtig + falsch;
  if (!(gesamt > 0)) return 0;
  return richtig / gesamt;
}

/** Der Leistungswert eines Laufs - Güte, Tempo-Anteil und die Zahl 0..100. */
export interface Wertung {
  /** Güte 0..1 (Formel: `guete()` aus `schreibprobeWertung.ts`). */
  guete: number;
  /**
   * Tempo-Anteil 0..1, gedeckelt am Bezugstempo (Formel: `tempoAnteil()`).
   * ⚠️ NICHT dasselbe wie {@link tempo} (das rohe Zellen/Zeichen je Minute) -
   * dieser Anteil ist schon an `bezug` gemessen und bei 1 gedeckelt.
   */
  tempoAnteil: number;
  /** Der Leistungswert 0..100 - Güte mal Wurzel des Tempo-Anteils. */
  wert: number;
}

/**
 * EINE Zahl aus Güte und Tempo, nach dem Muster von `schreibprobeWertung.ts`
 * (`werte()`): Güte `richtig / (richtig + 5 × falsch)` mal Wurzel des
 * gedeckelten Tempo-Anteils - „Genauigkeit schlägt Zeit".
 *
 * ⚠️ `bezug` (das Tempo, an dem 100 % Tempo-Anteil anliegen) ist ein
 * PFLICHTPARAMETER und bewusst ohne Vorgabewert: Anders als beim Tippen
 * (`BEZUGSTEMPO = 240`, aus Intersteno hergeleitet) gibt es für
 * Zellen-je-Minute beim Schreiben und Zeichen-je-Minute beim Lesen noch
 * KEINE recherchierte Bezugsgrösse. Jeder Zubau (Braille-Challenge,
 * Klassenmatch, eigene Übungen) muss seinen eigenen, zur Arbeitsweise
 * passenden Wert übergeben - siehe Bericht des bauenden Agenten.
 */
export function wertung(ergebnis: LaufErgebnis, bezug: number): Wertung {
  const g = guete(ergebnis.richtig, ergebnis.falsch);
  const v = tempoAnteil(tempo(ergebnis), bezug);
  return {
    guete: g,
    tempoAnteil: v,
    wert: Math.round(100 * g * v * 10) / 10,
  };
}

/** Ein Leistungswert mit der Arbeitsweise, die ihn erzeugt hat - die Eingabe für {@link rangprozent}. */
export interface GruppenWert {
  arbeitsweise: Arbeitsweise;
  wert: number;
}

/**
 * Der beste Wert einer Gruppe - NUR innerhalb derselben Arbeitsweise.
 *
 * Das ist die Stelle, die die Warnung im Kopfkommentar durchsetzt: Einträge
 * einer anderen Arbeitsweise werden beim Filtern schlicht übergangen, egal
 * wie hoch ihr Wert ist.
 */
export function bestesInGruppe(
  gruppe: readonly GruppenWert[],
  arbeitsweise: Arbeitsweise,
): number {
  let best = 0;
  for (const e of gruppe) {
    if (e.arbeitsweise !== arbeitsweise) continue;
    if (e.wert > best) best = e.wert;
  }
  return best;
}

/**
 * Der Rang in Prozent, gemessen am besten Wert EINER Gruppe MIT DERSELBEN
 * ARBEITSWEISE (Muster `rangProzent()` aus `schreibprobeWertung.ts`).
 *
 * `null`, wenn es in dieser Arbeitsweise keinen Vergleich gibt (niemand
 * gewertet, oder der beste Wert ist 0). Ein Rang von 100 heisst „bestes
 * Ergebnis dieser Gruppe in dieser Arbeitsweise", nicht „fehlerfrei".
 *
 * ⚠️ `gruppe` darf ruhig BEIDE Arbeitsweisen gemischt enthalten (z. B. eine
 * ganze Klasse, die teils schreibt, teils liest) - {@link bestesInGruppe}
 * filtert selbst auf `arbeitsweise`. Wer stattdessen schon vorher gefiltert
 * hat, verliert dadurch nichts.
 */
export function rangprozent(
  wert: number,
  gruppe: readonly GruppenWert[],
  arbeitsweise: Arbeitsweise,
): number | null {
  const bester = bestesInGruppe(gruppe, arbeitsweise);
  if (!(bester > 0)) return null;
  return Math.round((100 * Math.max(0, wert)) / bester * 10) / 10;
}

/* ════════════════════════════════════════════════════════════════════════════
 * BESCHRIFTUNGEN ZUR ARBEITSWEISE
 * ════════════════════════════════════════════════════════════════════════════
 * Hier, weil `Arbeitsweise` hier definiert ist. Sie standen bis zum 22.09.2026
 * doppelt - je einmal in `BrailleChallengeKasten.tsx` (Lehrkraft) und in
 * `MeineStatistik.tsx` (Kind). Zwei Stellen, die dasselbe Wort bestimmen,
 * laufen irgendwann auseinander, und dann heisst dieselbe Sache bei der
 * Lehrkraft anders als beim Kind.
 */

/** „Schreiben" oder „Lesen", ausgeschrieben. */
export function arbeitsweiseLabel(a: Arbeitsweise): string {
  return a === "lesen" ? "Lesen" : "Schreiben";
}

/**
 * Die Einheit, in der bei dieser Arbeitsweise gezaehlt wird: beim Schreiben
 * setzt ein Kind ZELLEN, beim Lesen erkennt es ZEICHEN.
 */
export function einheitLabel(a: Arbeitsweise): string {
  return a === "lesen" ? "Zeichen" : "Zellen";
}

/** Eine Nachkommastelle, mit Komma - so werden Zahlen im Haus geschrieben. */
export function eineStelle(n: number): string {
  return n.toFixed(1).replace(".", ",");
}
