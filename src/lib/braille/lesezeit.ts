/**
 * ════════════════════════════════════════════════════════════════════════════
 * DIE LESEZEIT-RECHNUNG VON PUNKTGENAU (22.09.2026, Johannes)
 * ════════════════════════════════════════════════════════════════════════════
 *
 * WARUM: Bis zum 22.09.2026 (Abend) zählte die Übezeit die Ansage-/Lesepause
 * VOR einer Aufgabe grosszügig mit (die Pausentoleranz in `uebeUhr.ts`, 90.
 * Perzentil der eigenen Lücken zwischen zwei Aufgaben). Gemessen im Code
 * (`BrailleTrainer.tsx`, `voice.ts`): Lässt sich ein Kind die Aufgabe
 * VORLESEN, zieht `typingGapMs()` die Sprechzeit von `ms` ab - TASTET es die
 * Aufgabe auf der Braillezeile, bleibt diese Zeit voll in `ms` stehen UND
 * zählte zusätzlich als Pause vor der nächsten Aufgabe. Dieselbe Aufgabe
 * brachte demselben Kind je nach Lese-Art verschieden viel Übezeit ein - und
 * benachteiligte ausgerechnet die Arbeitsweise, die bei Braille die
 * eigentliche ist.
 *
 * Johannes' Entscheidung (wörtlich, 22.09.2026): „nur eine Zahl aber vorlesen
 * muss raus und er ließt nimm am 40 wörter pro min und lerne dann die
 * lesegeschw des schülers und rechne mit diesem parameter. und das für
 * überall".
 *
 * ════════════════════════════════════════════════════════════════════════════
 * DIE EINE RECHNUNG
 * ════════════════════════════════════════════════════════════════════════════
 * {@link uebezeitFuerEreignis} ist die EINE Stelle, die aus einer gelösten
 * Aufgabe die anzurechnende Übezeit macht - Uhr (`uebeUhr.ts`), Wochenaufgabe
 * (`wochenaufgabe.ts`), Kind-Statistik (`MeineStatistik.tsx`), Lehrkraft-
 * Tabelle und Spendenbanner (`PunktgenauReiter.tsx`/`PunktgenauPage.tsx`)
 * rufen NUR diese Funktion - keine Stelle rechnet ein zweites Mal selbst.
 *
 * Eine Lesezeit darf je Aufgabe GENAU EINMAL zählen:
 *  · Vorgelesen (`spokenMs` gesetzt, > 0): die echte Lesezeit ist bereits aus
 *    `ms` herausgerechnet (`typingGapMs`, `BrailleTrainer.tsx`) - die
 *    GERECHNETE Lesezeit (Zellen ÷ Lesetempo) kommt dazu.
 *  · Selbst gelesen (kein `spokenMs`): die echte Tastzeit steckt schon in
 *    `ms` - nichts wird addiert, sonst zählte sie doppelt. GENAU diese
 *    Ereignisse sind zugleich die Messung, aus der {@link naechstesLeseTempo}
 *    das persönliche Lesetempo lernt (siehe dort und `cpmAusEreignis`).
 *
 * ★ Geprüft (22.09.2026): `spokenMs` wird in `BrailleTrainer.tsx` an BEIDEN
 * Stellen (Schreiben: `completeWord`, ~Z.855; Lesen: `check`, ~Z.1442)
 * gleich gebildet - `spokenInTask = spokenMs() - spokenAtStartRef.current`,
 * gesetzt nur wenn `spokenInTask > 0`. Das ist die reale, gemessene
 * Sprechzeit der Web-Speech-Synthese (`voice.ts`, `spokenMs()`) seit Beginn
 * DIESER Aufgabe - unabhängig davon, ob Self-Voicing an oder aus ist (aus:
 * `spokenMs()` bewegt sich nie, das Feld bleibt immer leer). Der Unterscheider
 * ist darum zuverlässig.
 *
 * ════════════════════════════════════════════════════════════════════════════
 * AB WANN WELCHE RECHNUNG GALT
 * ════════════════════════════════════════════════════════════════════════════
 *  · Bis 22.09.2026 (Vormittag): nur die reine Bearbeitungszeit (`e.ms`), ganz
 *    ohne Pausen.
 *  · 22.09.2026 (Nachmittag, nie live gegangen): die GROSSZÜGIGE Zahl über
 *    die Pausentoleranz (`uebeUhr.ts`, `activeMs` an `TaskEvent`) -
 *    benachteiligte lesende gegenüber tastenden Kindern, siehe oben.
 *  · 22.09.2026 (Abend): keine Pausen mehr, aber eine GERECHNETE Lesezeit für
 *    vorgelesene Aufgaben, aus dem gelernten Lesetempo DIESES Kindes.
 *  · SEIT 22.09.2026 (Nacht) - DER DECKEL: die Rechnung vom Abend rechnete
 *    `ms` weiter ungeprüft mit ein, auch wenn ein Kind mittendrin ohne jeden
 *    Tastendruck wegblieb. Johannes, 21.09.2026 (über die Tastenuhr,
 *    `lib/tastenuhr.ts`, wörtlich): „wenn jemand mehrere Sekunden keine Taste
 *    drückt, zählt das nicht zur Übezeit - Programm geöffnet ist kein Üben.
 *    Überall so werten wie bei der Tastenflow-Übezeit." Dieser Satz galt am
 *    21.09. für die Tastenuhr selbst und wurde am 22.09. beim Bau der
 *    Lesezeit-Rechnung übersehen - zwei Anweisungen, an diesem Abend
 *    aneinander vorbeigebaut. Johannes' Entscheidung: beides zusammenführen.
 *    {@link uebezeitFuerEreignis} deckelt seither zusätzlich mit der echten
 *    Tastenzeit (`e.activeMs`, aus `mitTastenzeit`/`tastenuhr.ts`) plus der
 *    gerechneten Lesezeit - siehe dort für die Rechnung. ⚠️ Fehlt `activeMs`
 *    (nicht gemessen: Altstände, lokales Backend ohne angeschlossene Uhr,
 *    Tests), bleibt es bei der Rechnung vom Abend, UNGEDECKELT - „nichts
 *    gemessen" ist nicht dasselbe wie „null Tastenzeit gemessen".
 */
import type { BrailleProgress } from "./progress";

/** Was eine Übezeit-Rechnung von einer gelösten Aufgabe braucht - absichtlich
 *  ein schmaler, struktureller Typ (kein Import von `TaskEvent`/
 *  `TrainerTaskEvent`): beide erfüllen ihn ohnehin, und diese Datei bleibt
 *  frei von einem Kreisimport in Richtung `account.ts`/`BrailleTrainer.tsx`. */
export interface LesezeitEreignis {
  ms: number;
  cells: number;
  spokenMs?: number;
  /**
   * Schreib- oder Lese-Aufgabe (`TaskEvent.direction`). Nur Lese-Aufgaben
   * taugen als Messung des Lesetempos - siehe {@link cpmAusEreignis}.
   * Fehlt das Feld (Altstand), wird NICHT gelernt: lieber der Startwert als
   * eine Zahl aus unbekannter Quelle.
   */
  direction?: "write" | "read";
  /**
   * TASTENZEIT seit dem letzten Ereignis (ms) - dasselbe Feld wie
   * `TaskEvent.activeMs` (`account.ts`), gerechnet von der Tastenuhr
   * (`lib/tastenuhr.ts`, `mitTastenzeit`): nur Zeit kurz nach einem echten
   * Anschlag, KEINE Bearbeitungszeit. Der Deckel in {@link uebezeitFuerEreignis}
   * benutzt dieses Feld - `undefined` heisst „nicht gemessen" und wird darum
   * NICHT als 0 behandelt (siehe dort).
   */
  activeMs?: number;
}

/**
 * Annahme (KEINE Messung!) - übliche Daumenregel der Lese-/Schreibpraxis: so
 * viele Zeichen hat ein „Wort" im Mittel. Dient nur der Umrechnung von
 * Wörtern/Minute (Johannes' Vorgabe, „40 Wörter pro Minute") in Zellen/Minute
 * (die Einheit dieser Rechnung, weil `TaskEvent.cells` Zellen zählt). Wer
 * diese Zahl ändert, ändert das Lese-STARTTEMPO aller Kinder ohne eigene
 * Messung - eine bewusste Entscheidung, kein Voreinstellungs-Detail.
 */
export const ZEICHEN_JE_WORT = 5;

/** Vorgabe-Lesetempo (Johannes, 22.09.2026): 40 Wörter/Minute, bis die App
 *  das persönliche Tempo dieses Kindes gelernt hat. */
export const LESE_START_WPM = 40;

/** {@link LESE_START_WPM} in Zellen/Minute umgerechnet - der Startwert von
 *  {@link naechstesLeseTempo}/{@link uebezeitFuerEreignis}. */
export const LESE_START_CPM = LESE_START_WPM * ZEICHEN_JE_WORT; // 200

/** Gleitender Mittelwert - dieselbe Bauart wie `EMA_ALPHA`/`updateSpeedEma`
 *  in `stars.ts` (Johannes: „übernimm diese Bauart, erfinde keine zweite"). */
export const LESE_EMA_ALPHA = 0.35;

/**
 * Untergrenze fürs gelernte Lesetempo - eine sehr kurze, fast augenblicklich
 * gelöste Aufgabe (wenige ms Restzeit nach dem Runden) darf das gelernte
 * Tempo nicht gegen unendlich schiessen lassen (wehrhaft: keine unendliche
 * Geschwindigkeit).
 */
export const LESE_TEMPO_MIN_CPM = 20;

/**
 * Obergrenze fürs gelernte Lesetempo - eine liegen gelassene und dann in
 * einer Sekunde nachgetragene Aufgabe darf das gelernte Tempo nicht auf einen
 * unrealistischen Wert hochreissen.
 */
export const LESE_TEMPO_MAX_CPM = 1200;

/**
 * Gerechnete Lesezeit (ms) für `cells` Zellen bei `cpm` Zellen/Minute.
 * Wehrhaft: keine Zeichen → 0 ms; kein gültiges Tempo → 0 ms. Nie NaN, nie
 * negativ, nie unendlich.
 */
export function berechneLesezeitMs(cells: number, cpm: number): number {
  if (!Number.isFinite(cells) || cells <= 0) return 0;
  if (!Number.isFinite(cpm) || cpm <= 0) return 0;
  return (cells / cpm) * 60_000;
}

/**
 * Die EINE Übezeit-Rechnung (ms) für eine gelöste Aufgabe - siehe Dateikopf.
 * `cpm` ist das aktuelle Lesetempo dieses Kindes ({@link LESE_START_CPM},
 * solange noch nichts gelernt ist). Wehrhaft: eine negative/kaputte `ms`
 * zählt als 0, nie negativ.
 *
 * ★★★★★ DER DECKEL (seit 22.09.2026, Nacht - siehe Dateikopf):
 *
 *     L      = gerechnete Lesezeit (Zellen ÷ gelerntes Lesetempo)
 *     roh    = ms + (vorgelesen ? L : 0)         // die Rechnung vom Abend
 *     deckel = activeMs + L                      // was sich erklären lässt
 *     angerechnet = min(roh, deckel)
 *
 * `deckel` addiert `L` IMMER, auch bei selbst getasteter Aufgabe: Wer die
 * Zeichen auf der Braillezeile ertastet, ohne dabei eine Taste zu drücken,
 * erzeugt keinen Tastenanschlag - `activeMs` allein würde ausgerechnet das
 * stille Ertasten der Zeichen nicht als Übezeit zählen. `L` deckt diesen
 * Anteil bei JEDER Aufgabe ab, unabhängig davon, ob vorgelesen wurde.
 *
 * Fehlt `activeMs` (nicht gemessen - Altstand, lokales Backend ohne
 * angeschlossene Tastenuhr, Tests ohne `mitTastenzeit`), gibt es KEINEN
 * Deckel: `roh` zählt unverändert. „Nichts gemessen" ist nicht dasselbe wie
 * „null gemessen" - sonst würde ausgerechnet das Fehlen der Messung jede
 * bestehende Aufgabe auf ihre Lesezeit zusammenstreichen.
 */
export function uebezeitFuerEreignis(e: LesezeitEreignis, cpm: number): number {
  const basis = Number.isFinite(e.ms) && e.ms > 0 ? e.ms : 0;
  const vorgelesen = typeof e.spokenMs === "number" && e.spokenMs > 0;
  const gerechneteLesezeit = berechneLesezeitMs(e.cells, cpm);
  const roh = basis + (vorgelesen ? gerechneteLesezeit : 0);
  if (typeof e.activeMs !== "number" || !Number.isFinite(e.activeMs)) {
    return roh; // nicht gemessen: ungedeckelt, siehe oben
  }
  const activeMs = e.activeMs > 0 ? e.activeMs : 0;
  const deckel = activeMs + gerechneteLesezeit;
  return Math.min(roh, deckel);
}

/**
 * Das gemessene Lesetempo (Zellen/Minute) EINER selbst gelesenen Aufgabe -
 * oder `null`, wenn sich daraus nichts Verlässliches lernen lässt (wehrhaft:
 * keine Aufgabe ohne Zeichen, keine Zeit 0, kein NaN, keine unendliche
 * Geschwindigkeit; eine VORGELESENE Aufgabe ist ohnehin keine Lese-Messung -
 * siehe Dateikopf).
 *
 * ★★★★★ ENTSCHEIDUNG (22.09.2026, Nacht): KEIN Deckel hier, bewusst.
 *
 * Dieselbe Aufgabe (Kind lässt eine Aufgabe liegen und kommt Minuten später
 * zurück) verfälscht im Prinzip auch diese Messung - `ms` enthielte dann
 * Leerlauf, und das gelernte Tempo würde zu langsam. Trotzdem bleibt `ms` hier
 * OHNE Deckel über `activeMs`, aus einem Grund, der den Deckel selbst betrifft:
 *
 * `activeMs` zählt NUR Tastenanschläge (`lib/tastenuhr.ts`). Eine selbst
 * gelesene Aufgabe (KEIN `spokenMs`, `direction: "read"`) ist aber genau die
 * Aufgabe, bei der das Kind die Zeichen auf der Braillezeile ERTASTET, bevor
 * es überhaupt reagiert - stiller Vorgang, kein Tastenanschlag. `activeMs`
 * deckt bei dieser Aufgabenart darum fast nichts vom eigentlichen Lesen ab,
 * sondern höchstens den kurzen Moment der abschliessenden Eingabe. Ein Deckel
 * über `activeMs` würde das gelernte Tempo hier nicht vor Leerlauf schützen,
 * sondern es systematisch NACH OBEN verzerren - in genau die Richtung, die
 * {@link LESE_TEMPO_MAX_CPM} zwar abfängt, aber nur als grobe Notbremse, nicht
 * als richtige Zahl.
 *
 * Der gleitende Mittelwert ({@link naechstesLeseTempo}, EMA) dämpft einen
 * einzelnen liegen gelassenen Ausreisser ohnehin über viele Messungen hinweg,
 * und {@link LESE_TEMPO_MIN_CPM} verhindert, dass eine einzelne sehr lange
 * `ms`-Zeit das Tempo auf nahe null zieht. Das ist der schwächere Schutz -
 * aber ein Deckel, der auf ein Signal baut, das die gemessene Tätigkeit gar
 * nicht erfasst, wäre kein Schutz, sondern eine neue, falsche Verzerrung.
 */
export function cpmAusEreignis(e: LesezeitEreignis): number | null {
  if (typeof e.spokenMs === "number" && e.spokenMs > 0) return null; // vorgelesen: keine Messung
  // ★★★ NUR Lese-Aufgaben (22.09.2026, abends bemerkt). Bei einer SCHREIB-
  // Aufgabe steckt in `ms` das Schreiben mit drin - und Punkte setzen dauert
  // ein Vielfaches des Lesens. Wer daraus ein „Lesetempo" ableitet, lernt
  // systematisch eine viel zu kleine Zahl und rechnet danach allen
  // vorgelesenen Aufgaben zu wenig Zeit an. Eine Aufgabe ohne Richtung
  // (Altstand) zaehlt ebenfalls nicht: lieber der Startwert als eine Zahl,
  // von der niemand weiss, was sie misst.
  if (e.direction !== "read") return null;
  if (!Number.isFinite(e.cells) || e.cells <= 0) return null;
  if (!Number.isFinite(e.ms) || e.ms <= 0) return null;
  const cpm = (e.cells / e.ms) * 60_000;
  if (!Number.isFinite(cpm) || cpm <= 0) return null;
  return cpm;
}

/**
 * Nächstes gelerntes Lesetempo - GENAU dieselbe Bauart wie `updateSpeedEma`
 * in `stars.ts` (gleitender Mittelwert, erste Messung setzt direkt, keine
 * zweite Formel). `cpm` kommt aus {@link cpmAusEreignis}. Das Ergebnis bleibt
 * zwischen {@link LESE_TEMPO_MIN_CPM} und {@link LESE_TEMPO_MAX_CPM} gedeckelt.
 */
export function naechstesLeseTempo(prev: number | undefined, cpm: number): number {
  const roh = !prev || prev <= 0 ? cpm : prev * (1 - LESE_EMA_ALPHA) + cpm * LESE_EMA_ALPHA;
  return Math.min(LESE_TEMPO_MAX_CPM, Math.max(LESE_TEMPO_MIN_CPM, roh));
}

/** Das aktuelle Lesetempo dieses Kindes aus dem Spielstand - der Startwert,
 *  solange noch nichts gelernt ist (additiv, siehe `progress.ts`). */
export function leseTempoAus(p: Pick<BrailleProgress, "leseTempoCpm">): number {
  return p.leseTempoCpm && p.leseTempoCpm > 0 ? p.leseTempoCpm : LESE_START_CPM;
}
