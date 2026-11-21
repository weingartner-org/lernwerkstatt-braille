/**
 * Übezeit-Uhr von „Punktgenau" - die laufende, HEUTE geübte Zeit oben in der
 * Kopfleiste.
 *
 * ════════════════════════════════════════════════════════════════════════════
 * WAS DIESE UHR ZÄHLT (SEIT 22.09.2026, Nacht - siehe „AB WANN" unten)
 * ════════════════════════════════════════════════════════════════════════════
 * Die Uhr zeigt die Summe der Übezeit HEUTIGER Aufgaben, GENAU nach der einen
 * Rechnung in `lesezeit.ts` (`uebezeitFuerEreignis`) - keine Pause zählt mehr
 * mit, eine vorgelesene Aufgabe bekommt ihre gerechnete Lesezeit dazu, und das
 * Ganze ist seit der Nacht zusätzlich mit der echten Tastenzeit gedeckelt
 * (siehe dort für die volle Begründung). Damit sie nicht nur bei jeder
 * abgegebenen Aufgabe SPRINGT, sondern sichtbar WÄHREND einer laufenden
 * Aufgabe mitläuft, führt sie zusätzlich einen provisorischen Posten: die
 * Wanduhrzeit seit Beginn der gerade offenen Aufgabe ({@link beginneAufgabe}).
 * Dieser Posten ist reine Anzeige - er wird nirgends gespeichert.
 *
 * ── Der provisorische Posten kennt den Deckel NICHT ─────────────────────────
 * Während eine Aufgabe offen ist, steht `activeMs` dieser Aufgabe noch nicht
 * fest - es entsteht erst mit dem Ereignis am Ende ({@link verbucheUebezeit}
 * bekommt die schon FERTIG gerechnete, gedeckelte Zeit). Der provisorische
 * Posten läuft darum einfach mit der Wanduhr mit, UNGEDECKELT - wie vor dem
 * Deckel. Lässt sich ein Kind eine Aufgabe vorlesen und geht dann für Minuten
 * weg, zeigt die Anzeige darum WÄHREND dieser Aufgabe kurzzeitig deutlich zu
 * viel (siehe `lesezeit.ts` Beispiel: 187,6 s statt später angerechneter 7,6 s).
 *
 * ── Bei der Abgabe: nie zurücklaufen ────────────────────────────────────────
 * Mit {@link verbucheUebezeit} ersetzt die ECHTE, gedeckelte Zeit den
 * provisorischen Posten - und die kann, siehe oben, SEHR VIEL kleiner sein als
 * das, was gerade eben noch stand. Johannes' Vorgabe zu dieser Umstellung:
 * eine Uhr, die rückwärts läuft, ist schlimmer als eine, die kurz zu viel
 * zeigt. {@link uebezeitMs} hält die Anzeige darum an der höchsten Zahl fest,
 * die sie HEUTE schon gezeigt hat ({@link uebezeitMs}, der interne
 * „Anzeige-Boden") - eine Abgabe kann die Zahl nie sinken lassen, nur eine
 * neue Mitternacht. Holt die echte, gedeckelte Summe der NÄCHSTEN Aufgaben
 * diesen Boden ein oder überschreitet ihn, zeigt die Uhr wieder genau die
 * echte Zahl - sie „schwenkt ein", ohne je einen Rücksprung zu zeigen.
 * ⚠️ Das betrifft NUR diese eine tickende Kopfleisten-Anzeige. Wochenaufgabe,
 * Statistik und Lehrkraft-Tabelle rechnen unverändert direkt aus den
 * gespeicherten Ereignissen ({@link heutigeUebezeitMs}/`minutenAus`) - sie
 * sehen nie den Anzeige-Boden und zeigen darum immer die ehrliche, gedeckelte
 * Zahl, auch während diese Kopfleisten-Uhr noch am Boden festhält.
 *
 * ════════════════════════════════════════════════════════════════════════════
 * ★★★★★ AB WANN WELCHE RECHNUNG GALT
 * ════════════════════════════════════════════════════════════════════════════
 * · Bis 22.09.2026 (Vormittag): reine Bearbeitungszeit je Aufgabe, ohne
 *   jede Pause.
 * · 22.09.2026 (Nachmittag, nie live gegangen): DIESE Uhr hielt nach jedem
 *   Übungs-Ereignis noch eine aus den eigenen Aufgaben-Lücken gerechnete
 *   Pausentoleranz lang weiter (90. Perzentil, 5-60 s) - „Ansage-/Lesepause
 *   ist keine Pause, sondern die vollständigste Übezeit". Das benachteiligte
 *   aber gerade das Kind, das die Aufgabe auf der Braillezeile TASTET statt
 *   sie sich VORLESEN zu lassen: Beim Vorlesen zog `typingGapMs()` die
 *   Sprechzeit ab, UND die Wartezeit zählte danach nochmal als Pause vor der
 *   nächsten Aufgabe; beim Tasten blieb sie einfach in der Bearbeitungszeit
 *   stehen. Johannes hat diese Rechnung darum am selben Abend verworfen.
 * · 22.09.2026 (Abend): keine Pausentoleranz mehr - die Rechnung stand
 *   komplett in `lesezeit.ts` (`uebezeitFuerEreignis`), diese Datei war nur
 *   noch die laufende Uhr DARÜBER. Bei dieser Fassung korrigierte sich die
 *   Anzeige bei JEDER Abgabe unverzüglich auf die echte Zahl, auch abwärts.
 * · SEIT 22.09.2026 (Nacht, diese Fassung): {@link uebezeitFuerEreignis}
 *   deckelt zusätzlich mit der echten Tastenzeit - dieselbe Anweisung, die am
 *   21.09. schon die Tastenuhr selbst begründet hat. Damit können echte
 *   Korrekturen bei der Abgabe sehr gross ausfallen; eine Anzeige, die dabei
 *   sichtbar zurückläuft, wäre schlimmer als eine, die kurz zu viel zeigt
 *   (Johannes) - seither hält die Anzeige den „Anzeige-Boden" (siehe oben).
 *
 * `primeUebeUhr()` setzt die Uhr beim Laden auf die heute schon gespeicherte
 * Zeit auf (aus den Ereignissen gerechnet, siehe {@link heutigeUebezeitMs}) -
 * und hebt den Stand dabei höchstens AN, nie ab.
 */
import type { TaskEvent } from "./account";
import { uebezeitFuerEreignis } from "./lesezeit";

/** Übezeit abgeschlossener Aufgaben (heute), inklusive der beim Laden
 *  aufgesetzten Basis ({@link primeUebeUhr}). */
let committedMs = 0;
/** Beginn der gerade offenen Aufgabe (ms), oder `null`, wenn gerade keine
 *  läuft - der provisorische Posten fürs Mitlaufen (siehe Dateikopf). */
let laufendStart: number | null = null;
/** Lokale Mitternacht (ms) des Tages, zu dem der aktuelle Stand gehört (-1 = noch keiner). */
let dayStart = -1;
/** Konto, für das die Uhr gerade läuft (Kontowechsel am selben Gerät = Reset). */
let ownerKey: string | null = null;
/**
 * Höchste Zahl, die {@link uebezeitMs} HEUTE schon zurückgegeben hat - der
 * „Anzeige-Boden" (siehe Dateikopf „Bei der Abgabe: nie zurücklaufen"). Wird
 * bei jedem Aufruf von {@link uebezeitMs} höchstens ANGEHOBEN, nie gesenkt;
 * eine neue Mitternacht ({@link rolloverIfNewDay}) oder ein Kontowechsel
 * ({@link resetUebeUhr}) setzt ihn zurück.
 */
let anzeigeBoden = 0;

/** Lokale Mitternacht (00:00) des Tages, in dem `now` liegt. */
function localDayStart(now: number): number {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** Neuer Kalendertag seit dem letzten Stand? Dann die Uhr auf null stellen. */
function rolloverIfNewDay(now: number): void {
  const ds = localDayStart(now);
  if (dayStart < 0) {
    dayStart = ds;
  } else if (ds !== dayStart) {
    committedMs = 0;
    laufendStart = null;
    anzeigeBoden = 0; // neuer Tag, neue Uhr - der gestrige Boden gilt nicht mehr
    dayStart = ds;
  }
}

/**
 * Eine neue Aufgabe beginnt - startet den provisorischen „läuft gerade"-
 * Posten (siehe Dateikopf). Bei JEDER neu angesagten Aufgabe aufrufen
 * (`Punktgenau.tsx`, `announce` mit `channel: "task"`).
 */
export function beginneAufgabe(now: number = Date.now()): void {
  rolloverIfNewDay(now);
  laufendStart = now;
}

/**
 * Eine Aufgabe ist fertig: `ms` (aus {@link uebezeitFuerEreignis} gerechnet)
 * wird endgültig verbucht, der provisorische Posten der offenen Aufgabe
 * endet damit (die nächste `beginneAufgabe()` startet einen neuen). Wehrhaft:
 * eine negative/kaputte Zeit zählt als 0.
 */
export function verbucheUebezeit(ms: number, now: number = Date.now()): void {
  rolloverIfNewDay(now);
  committedMs += Number.isFinite(ms) && ms > 0 ? ms : 0;
  laufendStart = null;
}

/**
 * Aktuelle, heute geübte Zeit (ms) - abgeschlossene Aufgaben plus, sofern
 * gerade eine offen ist, der provisorische Posten seit ihrem Beginn -
 * ANGEHOBEN auf den „Anzeige-Boden" (Dateikopf „Bei der Abgabe: nie
 * zurücklaufen"): Eine gedeckelte Abgabe, die kleiner ist als das, was gerade
 * eben schon stand, senkt die Anzeige NICHT - erst wenn die echte Summe den
 * bisherigen Höchststand von heute wieder einholt oder übersteigt, zeigt die
 * Uhr wieder genau diese echte Zahl.
 */
export function uebezeitMs(now: number = Date.now()): number {
  rolloverIfNewDay(now);
  const laufend = laufendStart !== null ? Math.max(0, now - laufendStart) : 0;
  const echt = committedMs + laufend;
  anzeigeBoden = Math.max(anzeigeBoden, echt);
  return anzeigeBoden;
}

/** Setzt die Uhr zurück (neue Lernsession/Kontowechsel). */
export function resetUebeUhr(): void {
  committedMs = 0;
  laufendStart = null;
  dayStart = -1;
  anzeigeBoden = 0;
  ownerKey = null;
}

/**
 * Setzt die Uhr beim Laden auf die heute schon gespeicherte Zeit auf -
 * {@link heutigeUebezeitMs} rechnet sie aus den gespeicherten Ereignissen.
 * `owner` ist das Konto (bzw. "anon"): Meldet sich am selben Gerät ein
 * anderes Kind an, wird die Uhr komplett zurückgesetzt. Beim selben Konto hebt
 * der Aufruf den Stand höchstens AN (nie absenken).
 */
export function primeUebeUhr(owner: string, baseMs: number, now: number = Date.now()): void {
  if (ownerKey !== null && ownerKey !== owner) resetUebeUhr();
  ownerKey = owner;
  rolloverIfNewDay(now);
  const cur = uebezeitMs(now);
  if (baseMs > cur) committedMs += baseMs - cur;
}

/**
 * Die heute schon gespeicherte Übezeit aus der Ereignisliste, auf den
 * heutigen Tag eingeschränkt - Grundlage für {@link primeUebeUhr}. Rechnet
 * jedes Ereignis über {@link uebezeitFuerEreignis} (`lesezeit.ts`) - DIESELBE
 * Rechnung wie `minutenAus()` in `wochenaufgabe.ts`, nur auf heute begrenzt.
 * `cpm` ist das aktuelle Lesetempo dieses Kindes (`leseTempoAus`/`progress.ts`).
 */
export function heutigeUebezeitMs(
  events: readonly TaskEvent[] | null | undefined,
  cpm: number,
  now: number = Date.now(),
): number {
  const heute = localDayStart(now);
  let sum = 0;
  for (const e of events ?? []) {
    if (e.ts <= 0 || localDayStart(e.ts) !== heute) continue;
    sum += uebezeitFuerEreignis(e, cpm);
  }
  return sum;
}

/** Übezeit als Uhr-Text: „M:SS" oder ab einer Stunde „H:MM:SS". */
export function formatUebezeit(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

/**
 * Übezeit ausgeschrieben - für die Ansage auf der Braillezeile und beim
 * Vorlesen, z. B. „3 Minuten 20 Sekunden" oder „1 Stunde 5 Minuten". Nur
 * Deutsch: Punktgenau hat (anders als Tastenflow) keine zweisprachige
 * Bedienung.
 */
export function formatUebezeitAngesagt(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const parts: string[] = [];
  if (h > 0) parts.push(`${h} ${h === 1 ? "Stunde" : "Stunden"}`);
  if (m > 0) parts.push(`${m} ${m === 1 ? "Minute" : "Minuten"}`);
  if (h === 0 && (s > 0 || parts.length === 0))
    parts.push(`${s} ${s === 1 ? "Sekunde" : "Sekunden"}`);
  return parts.join(" ");
}
