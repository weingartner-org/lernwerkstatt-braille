/**
 * ════════════════════════════════════════════════════════════════════════════
 * DIE WOCHENAUFGABE IN PUNKTGENAU
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Johannes am 07.09.2026: *„Wochenaufgaben, wie in tastenflow"*.
 *
 * In Tastenflow ist eine Wochenaufgabe eine **Minutenzahl je Woche, ohne
 * Einheiten** (`lib/typing/wochenziel.ts`). Das lässt sich nicht abschreiben,
 * denn Punktgenau misst etwas anderes: Es gibt keine „Zeile", die man
 * abschließt, sondern Aufgaben, Übezeit und Etappen. Übernommen ist darum die
 * IDEE und die WOCHENGRENZE, nicht die Rechnung:
 *
 *   Tastenflow            Punktgenau
 *   ────────────────────  ────────────────────────────────────────────
 *   Minuten je Woche      Minuten Übezeit je Woche
 *   -                     Aufgaben je Woche
 *   -                     Etappen je Woche (neu gemeistert)
 *
 * ★★★ Alle drei (Minuten/Aufgaben/Etappen) sind EINZELN abschaltbar (0 = kein
 * Ziel). Eine Lehrkraft, die nur „drei Etappen diese Woche" will, trägt eine
 * 3 ein und lässt die anderen beiden auf 0. Erst wenn KEINE Zahl gesetzt ist,
 * gibt es gar keine Wochenaufgabe - dann ändert sich für das Kind nichts.
 *
 * ── ★★★★ DIE WOCHENGRENZE WIRD NICHT NACHGEBAUT ────────────────────────────
 * ★★★★★ AUFGERÄUMT (19.09.2026, Bauplan §„W · Wochenziel neu"): Bis zum
 * 18.09.2026 konnte eine Klasse ihre Wochengrenze im Reiter „Tastenflow"
 * selbst einstellen („Unterricht am Donnerstag bis 14:00"), und Punktgenau
 * las genau diesen Wert. Johannes hat das abgeschafft - „Punktgenau auch
 * Mo-So: ja", die Woche läuft für BEIDE Programme jetzt fest von Montag 08:00
 * bis zum nächsten Montag 08:00. Die Grenze kommt darum von
 * {@link import("@/lib/typing/wochenziel").WOCHENZIEL_GRENZE} - derselben
 * festen Konstante, die auch das Wochenziel von Tastenflow benutzt, nicht
 * mehr aus den Klassen-Einstellungen. Das ist nicht Bequemlichkeit, sondern
 * die einzige Möglichkeit, dass die zwei Programme derselben Klasse dieselbe
 * Woche meinen ([[feedback_zwei_stellen_die_voneinander_nichts_wissen]]).
 *
 * ── ⚠️ WIE WEIT DIE ZAHLEN ZURÜCKREICHEN ───────────────────────────────────
 * Gerechnet wird aus der Ereignisliste, und die hält je Konto die letzten
 * **1000** Aufgaben (`MAX_EVENTS` in account.ts / pbBackend.ts). Für eine
 * Woche reicht das mit großem Abstand; für „Schuljahr" oder „Gesamt" kann bei
 * einem sehr fleißigen Kind der Anfang fehlen. Deshalb meldet
 * {@link verlaufAmAnschlag}, wann die Liste voll ist - die Lehrkraft-Ansicht
 * schreibt es dann hin, statt eine zu kleine Zahl als vollständig auszugeben
 * ([[feedback_zusammenfassung_ist_kein_beleg]]).
 *
 * Tastenflow hat dasselbe Problem am 28.08.2026 mit einer gepackten
 * Ereignisliste gelöst (`lib/typing/eventPack.ts`, 6.500 statt 1000). Derselbe
 * Weg steht Punktgenau offen; er ist hier bewusst NICHT mitgebaut worden, weil
 * er das Speicherformat der Konten ändert und eine eigene Messung verdient.
 *
 * ── „Eine Stunde sperren" (22.09.2026, `lib/braille/sperre.ts`) ────────────
 * Die Lehrkraft kann eine Unterrichtsstunde sperren: Übung darin zählt überall
 * SONST weiter (Übezeit-Uhr, Statistik, Abzeichen), nur nicht für die
 * Wochenaufgabe. Der Zeitraum steht - GETEILT mit Tastenflow, siehe
 * `sperre.ts` Dateikopf - an der Klasse (`tt_classes.gesperrteZeiten`), NICHT
 * an einem Bit je Ereignis (derselbe Grund wie beim Wochenziel von Tastenflow:
 * ein Gerät ohne Netz bekäme ein Ereignis-Bit zu spät oder nie).
 *
 * Die Wirkung: Ereignisse (Aufgaben UND Etappen-Meister-Zeitpunkte) in einem
 * gesperrten Zeitraum fallen VOR der Wochen-Rechnung heraus, für alle drei
 * Ziele (Minuten/Aufgaben/Etappen) - {@link minutenAus} selbst ändert dafür
 * NICHTS an ihrer Bedeutung; gefiltert wird die Ereignisliste, die sie
 * bekommt. Das wirkt rückwirkend und übersteht ein Aufheben der Sperre
 * unverändert (dieselben zwei Eigenschaften wie beim Wochenziel-Vorbild,
 * `lib/typing/wochenziel.ts`).
 *
 * `gesperrt` ist überall ein optionaler, zuletzt stehender Parameter mit
 * Standard `[]` - bestehende Aufrufer rechnen dadurch unverändert weiter, bis
 * sie selbst auf die Sperrliste umgestellt werden. Seit 22.09.2026 reicht
 * `components/braille/Punktgenau.tsx` (die Kind-Seite) die Sperrliste der
 * eigenen Klasse ebenfalls durch (siehe dort, „STUNDE GESPERRT WIRKT AUCH
 * BEIM KIND").
 *
 * ── AB WANN WELCHE RECHNUNG GALT (`minutenAus`, 22.09.2026) ────────────────
 * · Bis 22.09.2026 (Vormittag): nur die strenge, reine Aufgabenzeit (`e.ms`),
 *   ganz ohne Pausen.
 * · 22.09.2026 (Nachmittag, nie live gegangen): die GROSSZÜGIGE Zeit über
 *   die Pausentoleranz der Übezeit-Uhr (`e.activeMs`) - verworfen, weil sie
 *   ein tastendes Kind gegenüber einem vorlesen lassenden benachteiligte
 *   (volle Begründung: `lesezeit.ts` Dateikopf).
 * · SEIT 22.09.2026 (Abend): {@link minutenAus} rechnet über
 *   {@link import("./lesezeit").uebezeitFuerEreignis} - keine Pause zählt
 *   mehr, aber eine vorgelesene Aufgabe bekommt ihre aus dem gelernten
 *   Lesetempo GERECHNETE Lesezeit dazu (`lesezeit.ts`). `cpm` ist dabei das
 *   gelernte Lesetempo DIESES Kindes (`leseTempoAus(progress)`) - jeder
 *   Aufruf hier reicht darum `p.leseTempoCpm` (bzw. den Vorgabewert) durch.
 *
 * ⚠️ Wer auf einen Sprung in den angezeigten Minuten trifft, der genau am
 * 22.09.2026 liegt: das ist eine der beiden Umstellungen, kein Fehler.
 */
import type { TaskEvent } from "./account";
import type { BrailleProgress } from "./progress";
import { isoWeekKey } from "@/lib/typing/goals";
import { wochenStartFuerTag } from "@/lib/typing/wochenrhythmus";
import { WOCHENZIEL_GRENZE } from "@/lib/typing/wochenziel";
import { inGesperrterZeit, type GesperrteZeit } from "./sperre";
import { LESE_START_CPM, leseTempoAus, uebezeitFuerEreignis } from "./lesezeit";

/** So viele Aufgaben hebt ein Konto auf - siehe Dateikopf. */
export const VERLAUF_LAENGE = 1000;

const WOCHE_MS = 7 * 86_400_000;

/**
 * Was die Lehrkraft je Woche aufgibt. Jede Zahl ist für sich abschaltbar
 * (0 = kein Ziel); alle drei auf 0 heißt „keine Wochenaufgabe".
 */
export interface Wochenaufgabe {
  /** Übezeit in Minuten je Woche. */
  minuten: number;
  /** Aufgaben je Woche. */
  aufgaben: number;
  /** In dieser Woche neu gemeisterte Etappen. */
  etappen: number;
  /**
   * Ziel-Kalenderwochen („2026-W37"). Leer = jede Woche. Dieselben Schlüssel
   * und dasselbe Auswahlfeld wie in Tastenflow (`WeekMultiSelect`).
   */
  wochen?: string[];
  /**
   * Verpasste Wochen müssen nachgeholt werden. Ohne das Häkchen ist eine
   * vergangene Woche vorbei - was nicht geschafft wurde, ist nicht offen.
   */
  nachholen?: boolean;
}

/** Eine Wochenaufgabe ohne Ziel - der Standard. */
export function leereWochenaufgabe(): Wochenaufgabe {
  return { minuten: 0, aufgaben: 0, etappen: 0 };
}

/**
 * Steht überhaupt eine Wochenaufgabe? Eine Aufgabe ohne einzige Zahl ist
 * keine - dann bleibt beim Kind alles, wie es war.
 */
export function hatWochenaufgabe(w: Wochenaufgabe | null | undefined): boolean {
  return !!w && (w.minuten > 0 || w.aufgaben > 0 || w.etappen > 0);
}

/**
 * Aus fremdem JSON eine Wochenaufgabe lesen - defensiv. Der Inhalt kommt vom
 * Server und wird nie blind geglaubt: Ein kaputter Wert darf einem Kind keine
 * Aufgabe erfinden, die niemand gestellt hat.
 */
export function wochenaufgabeAusJson(raw: unknown): Wochenaufgabe | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const r = raw as Record<string, unknown>;
  const zahl = (v: unknown, max: number): number =>
    typeof v === "number" && Number.isFinite(v) && v > 0
      ? Math.min(Math.round(v), max)
      : 0;
  const wochen = Array.isArray(r.wochen)
    ? r.wochen.filter((w): w is string => typeof w === "string")
    : undefined;
  return {
    minuten: zahl(r.minuten, 600),
    aufgaben: zahl(r.aufgaben, 2000),
    etappen: zahl(r.etappen, 60),
    ...(wochen && wochen.length ? { wochen } : {}),
    ...(r.nachholen === true ? { nachholen: true } : {}),
  };
}

/**
 * Anfang und Ende der Woche, in der `jetztMs` liegt (Ende einschließlich) -
 * feste Grenze {@link WOCHENZIEL_GRENZE} (Montag 08:00), dieselbe wie beim
 * Wochenziel von Tastenflow.
 */
export function wochengrenzen(
  jetztMs: number,
  wochenVersatz = 0,
): { vonMs: number; bisMs: number } {
  const start = wochenStartFuerTag(jetztMs + wochenVersatz * WOCHE_MS, WOCHENZIEL_GRENZE);
  return { vonMs: start, bisMs: start + WOCHE_MS - 1 };
}

/** Die Ereignisse zwischen zwei Zeitpunkten (beide einschließlich). */
export function ereignisseZwischen(
  ev: readonly TaskEvent[],
  g: { vonMs: number; bisMs: number } | null,
): TaskEvent[] {
  if (!g) return [...ev];
  return ev.filter((e) => e.ts >= g.vonMs && e.ts <= g.bisMs);
}

/**
 * Ist die Ereignisliste voll? Dann reicht „Gesamt" nur so weit zurück, wie die
 * letzten {@link VERLAUF_LAENGE} Aufgaben - siehe Dateikopf.
 */
export function verlaufAmAnschlag(ev: readonly TaskEvent[]): boolean {
  return ev.length >= VERLAUF_LAENGE;
}

/**
 * Übezeit in Minuten aus einer Ereignisliste - DIE EINE Rechnung
 * ({@link import("./lesezeit").uebezeitFuerEreignis}, siehe Dateikopf „AB
 * WANN WELCHE RECHNUNG GALT"). `cpm` ist das gelernte Lesetempo des Kindes,
 * dem diese Ereignisse gehören ({@link import("./lesezeit").leseTempoAus});
 * ohne Angabe gilt der Vorgabewert ({@link LESE_START_CPM}) - für Aufrufer
 * ohne Zugriff auf den Spielstand, nie als bewusste Wahl.
 */
export function minutenAus(
  ev: readonly TaskEvent[],
  cpm: number = LESE_START_CPM,
): number {
  return ev.reduce((s, e) => s + uebezeitFuerEreignis(e, cpm), 0) / 60_000;
}

/**
 * Wann welche Etappe zum ersten Mal gemeistert wurde. Fehlt der Eintrag (alte
 * Spielstände, in denen noch nichts mitgeschrieben wurde), zählt die Etappe
 * für keine Woche - lieber keine Zahl als eine erfundene.
 *
 * `gesperrt` (Standard: keine) sind die Sperr-Zeiträume der Klasse (siehe
 * Dateikopf „Eine Stunde sperren") - eine Etappe, die WÄHREND einer gesperrten
 * Stunde gemeistert wurde, zählt nicht für die Wochenaufgabe (zählt aber
 * unverändert im Fortschritt selbst, dort steht nur der Zeitpunkt).
 */
export function etappenZwischen(
  p: BrailleProgress,
  g: { vonMs: number; bisMs: number } | null,
  gesperrt: readonly GesperrteZeit[] = [],
): string[] {
  const am = p.gemeistertAm ?? {};
  return Object.keys(am).filter((id) => {
    const ts = am[id];
    if (typeof ts !== "number" || ts <= 0) return false;
    if (inGesperrterZeit(ts, gesperrt)) return false;
    return !g || (ts >= g.vonMs && ts <= g.bisMs);
  });
}

/** Der Stand EINER Woche gegen die Wochenaufgabe. */
export interface Wochenstand {
  /** Gilt in dieser Woche überhaupt eine Aufgabe? (Ziel-KW + gesetzte Zahlen) */
  aktiv: boolean;
  /** Grenzen der betrachteten Woche. */
  vonMs: number;
  bisMs: number;
  /** ISO-Schlüssel der Woche („2026-W37"). */
  woche: string;
  minutenGeschafft: number;
  aufgabenGeschafft: number;
  etappenGeschafft: number;
  /** Das Soll dieser Woche - inklusive Nachhol-Soll (siehe `nachholen`). */
  sollMinuten: number;
  sollAufgaben: number;
  sollEtappen: number;
  /** Aus früheren Wochen offen geblieben (nur mit `nachholen`). */
  offenMinuten: number;
  offenAufgaben: number;
  offenEtappen: number;
  /** Alles Gesetzte erreicht? */
  erfuellt: boolean;
}

/** Gilt die Wochenaufgabe in dieser Kalenderwoche? */
function wocheIstZielwoche(w: Wochenaufgabe, wocheKey: string): boolean {
  if (!w.wochen || w.wochen.length === 0) return true; // leer = jede Woche
  return w.wochen.includes(wocheKey);
}

/**
 * Der Stand der laufenden (oder einer zurückliegenden) Woche.
 *
 * ★★ NIE ZUM NACHTEIL: Das Nachhol-Soll zählt nur Wochen, die WIRKLICH
 * Ziel-Wochen waren und die schon vorbei sind. Die laufende Woche kann nie
 * „verpasst" sein, solange sie läuft - sonst stünde ein Kind am Montag schon
 * im Rückstand ([[feedback_nie_gegen_das_kind]]).
 *
 * `gesperrt` (Standard: keine) sind die Sperr-Zeiträume der Klasse - siehe
 * Dateikopf „Eine Stunde sperren". Ereignisse darin werden VOR der
 * Wochen-Rechnung entfernt (Aufgaben/Minuten) bzw. gar nicht erst gezählt
 * (Etappen, über {@link etappenZwischen}); {@link minutenAus} selbst bleibt
 * unverändert - sie sieht die gesperrten Ereignisse nie.
 */
export function wochenstand(
  aufgabe: Wochenaufgabe | null | undefined,
  ev: readonly TaskEvent[],
  p: BrailleProgress,
  jetztMs: number,
  wochenVersatz = 0,
  gesperrt: readonly GesperrteZeit[] = [],
): Wochenstand {
  const g = wochengrenzen(jetztMs, wochenVersatz);
  const woche = isoWeekKey(g.vonMs);
  // ★★★ Die Sperre wirkt VOR jeder Wochen-Rechnung auf die Ereignisliste -
  // nicht in `minutenAus()` selbst (deren Bedeutung bleibt unangetastet).
  const evOhneSperre = gesperrt.length
    ? ev.filter((e) => !inGesperrterZeit(e.ts, gesperrt))
    : ev;
  const imZeitraum = ereignisseZwischen(evOhneSperre, g);
  const minutenGeschafft = minutenAus(imZeitraum, leseTempoAus(p));
  const aufgabenGeschafft = imZeitraum.length;
  const etappenGeschafft = etappenZwischen(p, g, gesperrt).length;

  const leer: Wochenstand = {
    aktiv: false,
    vonMs: g.vonMs,
    bisMs: g.bisMs,
    woche,
    minutenGeschafft,
    aufgabenGeschafft,
    etappenGeschafft,
    sollMinuten: 0,
    sollAufgaben: 0,
    sollEtappen: 0,
    offenMinuten: 0,
    offenAufgaben: 0,
    offenEtappen: 0,
    erfuellt: false,
  };
  if (!hatWochenaufgabe(aufgabe) || !aufgabe) return leer;
  if (!wocheIstZielwoche(aufgabe, woche)) return leer;

  const offen = aufgabe.nachholen
    ? rueckstand(aufgabe, evOhneSperre, p, jetztMs, g.vonMs, gesperrt)
    : { minuten: 0, aufgaben: 0, etappen: 0 };

  const sollMinuten = aufgabe.minuten > 0 ? aufgabe.minuten + offen.minuten : 0;
  const sollAufgaben = aufgabe.aufgaben > 0 ? aufgabe.aufgaben + offen.aufgaben : 0;
  const sollEtappen = aufgabe.etappen > 0 ? aufgabe.etappen + offen.etappen : 0;

  return {
    ...leer,
    aktiv: true,
    sollMinuten,
    sollAufgaben,
    sollEtappen,
    offenMinuten: offen.minuten,
    offenAufgaben: offen.aufgaben,
    offenEtappen: offen.etappen,
    erfuellt:
      minutenGeschafft + 1e-9 >= sollMinuten &&
      aufgabenGeschafft >= sollAufgaben &&
      etappenGeschafft >= sollEtappen,
  };
}

/**
 * Wie viel aus VERGANGENEN Ziel-Wochen offen geblieben ist (nur mit
 * `nachholen`). Gezählt werden höchstens die letzten {@link RUECKSTAND_WOCHEN}
 * Wochen: Weiter zurück reicht die Ereignisliste ohnehin selten, und ein
 * Rückstand, der ein halbes Jahr alt ist, hilft niemandem beim Üben.
 *
 * `ev` kommt von {@link wochenstand} bereits OHNE die Ereignisse gesperrter
 * Zeiträume (siehe dort) - Minuten/Aufgaben brauchen `gesperrt` hier darum
 * nicht noch einmal; nur {@link etappenZwischen} bekommt es gereicht, weil
 * Etappen-Meister-Zeitpunkte nicht aus `ev` stammen.
 */
export const RUECKSTAND_WOCHEN = 12;

function rueckstand(
  aufgabe: Wochenaufgabe,
  ev: readonly TaskEvent[],
  p: BrailleProgress,
  jetztMs: number,
  aktuelleWocheVonMs: number,
  gesperrt: readonly GesperrteZeit[] = [],
): { minuten: number; aufgaben: number; etappen: number } {
  let minuten = 0;
  let aufgaben = 0;
  let etappen = 0;
  for (let i = 1; i <= RUECKSTAND_WOCHEN; i += 1) {
    const g = wochengrenzen(jetztMs, -i);
    // Sicherheitsnetz gegen Rundungs-/Zeitumstellungs-Kanten: Nur wirklich
    // abgeschlossene Wochen zählen als verpassbar.
    if (g.bisMs >= aktuelleWocheVonMs) continue;
    const woche = isoWeekKey(g.vonMs);
    if (!wocheIstZielwoche(aufgabe, woche)) continue;
    const imZeitraum = ereignisseZwischen(ev, g);
    if (aufgabe.minuten > 0)
      minuten += Math.max(0, aufgabe.minuten - minutenAus(imZeitraum, leseTempoAus(p)));
    if (aufgabe.aufgaben > 0)
      aufgaben += Math.max(0, aufgabe.aufgaben - imZeitraum.length);
    if (aufgabe.etappen > 0)
      etappen += Math.max(0, aufgabe.etappen - etappenZwischen(p, g, gesperrt).length);
  }
  return { minuten: Math.round(minuten), aufgaben, etappen };
}

/**
 * Die Wochenaufgabe in EINEM Satz - für die Lehrkraft-Tabelle, für das Kind
 * und für die Sprachausgabe. Genau EINE Formulierung, damit „drei Etappen"
 * nicht an einer Stelle „3 Etappen" und an der anderen „drei Kapitel" heißt.
 *
 * @param anrede „du" für das Kind, „sie" für die Lehrkraft-Ansicht.
 */
export function wochenaufgabeSatz(
  w: Wochenaufgabe | null | undefined,
  anrede: "du" | "sie" = "du",
): string {
  if (!hatWochenaufgabe(w) || !w) return "Keine Wochenaufgabe.";
  const teile: string[] = [];
  if (w.minuten > 0) teile.push(`${w.minuten} Minuten üben`);
  if (w.aufgaben > 0)
    teile.push(`${w.aufgaben} ${w.aufgaben === 1 ? "Aufgabe" : "Aufgaben"}`);
  if (w.etappen > 0)
    teile.push(`${w.etappen} ${w.etappen === 1 ? "Etappe" : "Etappen"} schaffen`);
  const liste =
    teile.length === 1
      ? teile[0]
      : `${teile.slice(0, -1).join(", ")} und ${teile[teile.length - 1]}`;
  const wo =
    w.wochen && w.wochen.length > 0
      ? ` (nur in ${w.wochen.length} ${w.wochen.length === 1 ? "gewählten Kalenderwoche" : "gewählten Kalenderwochen"})`
      : "";
  return anrede === "du"
    ? `Diese Woche: ${liste}.${wo}`
    : `Je Woche: ${liste}.${wo}`;
}

/** Der Stand in EINEM Satz - dieselbe Regel wie {@link wochenaufgabeSatz}. */
export function wochenstandSatz(
  s: Wochenstand,
  anrede: "du" | "sie" = "du",
): string {
  if (!s.aktiv) return "Diese Woche steht keine Wochenaufgabe an.";
  const teile: string[] = [];
  if (s.sollMinuten > 0)
    teile.push(`${Math.round(s.minutenGeschafft)} von ${s.sollMinuten} Minuten`);
  if (s.sollAufgaben > 0)
    teile.push(`${s.aufgabenGeschafft} von ${s.sollAufgaben} Aufgaben`);
  if (s.sollEtappen > 0)
    teile.push(`${s.etappenGeschafft} von ${s.sollEtappen} Etappen`);
  const liste = teile.join(" · ");
  if (s.erfuellt)
    return anrede === "du"
      ? `Wochenaufgabe geschafft: ${liste}.`
      : `Wochenaufgabe erfüllt: ${liste}.`;
  const nachhol =
    s.offenMinuten + s.offenAufgaben + s.offenEtappen > 0
      ? " Darin enthalten ist Nachzuholendes aus früheren Wochen."
      : "";
  return anrede === "du"
    ? `Deine Wochenaufgabe: ${liste}.${nachhol}`
    : `Stand der Wochenaufgabe: ${liste}.${nachhol}`;
}
