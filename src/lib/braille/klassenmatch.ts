/**
 * ════════════════════════════════════════════════════════════════════════════
 * DAS BRAILLE-KLASSENMATCH - Zustände, Zeiten und das Rechenwerk.
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Vorbild `../typing/klassenmatch.ts` (Tastenflow) - Zustandsmaschine, Rangliste
 * und der feste Braillezeilen-Vorspann kommen von dort. **Bewusste Doppelung,
 * keine gemeinsame Collection**: Die Datenform ist anders (Arbeitsweise
 * schreiben/lesen, Schriftbereich statt Tastaturniveau, Zellen/Zeichen statt
 * Anschläge), und ein Wettkampf zwischen einem Tastenflow-Kind und einem
 * Punktgenau-Kind gibt es nicht. Vor allem aber ist Tastenflows Klassenmatch
 * LIVE UND IN BENUTZUNG - es anzufassen, um Platz für Braille zu schaffen,
 * wäre das grössere Risiko. ★★★ Eine Änderung am SPIELABLAUF (Zustände,
 * Fristen, Rangliste, „nichts wird gespeichert") gehört darum an BEIDE
 * Stellen - hier UND in `typing/klassenmatch.ts`
 * ([[feedback_zwei_stellen_die_voneinander_nichts_wissen]]).
 *
 * Nur reine Funktionen: kein React, kein Backend, keine Anzeige. Rangfolge,
 * Kugel-Position und Braille-Vorspann sind Stellen, an denen sich ein Fehler
 * nicht als Absturz zeigt, sondern als falsche Zahl vor einem Kind - sie
 * gehören darum in einen Wächter (`tests/braille-klassenmatch.test.ts`).
 */
import { wertung, type Arbeitsweise, type LaufErgebnis } from "./wertung";
import { BRAILLE_BEZUGSTEMPO } from "./challenge";
import type { AreaKey } from "./areas";
// Zeitformatierung wiederverwendet statt neu geschrieben (dieselbe Bauart wie
// `typing/klassenmatch.ts`, das ebenfalls `mmss` von dort holt).
import { mmss } from "../typing/schreibprobe";

// ── Zeiten und Grenzen ──────────────────────────────────────────────────────

/**
 * Wie lange ein Match dauert (Minuten) - fest, wie im Vorbild: ein Spiel mit
 * einer Regel, die jedes Kind der Klasse kennt, ohne sie nachzulesen.
 */
export const MATCH_DAUER_MIN = 5;

/** Dieselbe Dauer in ms - damit niemand zweimal mal 60000 rechnet. */
export const MATCH_DAUER_MS = MATCH_DAUER_MIN * 60_000;

/**
 * Der Countdown zwischen „Starten" und dem ersten Anschlag (ms) - zehn
 * Sekunden, bei allen gleichzeitig (Muster `MATCH_COUNTDOWN_MS`).
 */
export const MATCH_COUNTDOWN_MS = 10_000;

/**
 * So lange darf eine Einladung offen stehen, der niemand beigetreten ist
 * (ms). Wert wie im Vorbild (`MATCH_EINLADUNG_FRIST_MS`, dort begründet mit
 * Johannes' Auftrag: eine unbeantwortete Einladung soll verschwinden, nicht
 * im Hintergrund weiterlaufen).
 */
export const MATCH_EINLADUNG_FRIST_MS = 30_000;

/**
 * So lange nach dem Ende bleiben Match- und Stand-Zeilen stehen, dann räumt
 * der Server sie auf (Muster `MATCH_AUFRAEUM_MS`) - sie sind Spielstand,
 * keine Statistik.
 */
export const MATCH_AUFRAEUM_MS = 60 * 60_000;

/** Bei welcher Restzeit angesagt wird (Sekunden, absteigend) - nie öfter. */
export const MATCH_ANSAGE_BEI_SEKUNDEN: readonly number[] = [60, 10];

// ── Zustände und ihre erlaubten Übergänge ───────────────────────────────────

/** Wo ein Match am Server steht. */
export type MatchStatus = "einladung" | "countdown" | "laeuft" | "fertig" | "abgebrochen";

/**
 * ★★★ DIE ERLAUBTEN ÜBERGÄNGE - Einladung → Countdown → läuft → fertig, mit
 * „abgebrochen" als Ausweg aus jedem noch offenen Zustand. Ein einmal
 * beendetes Match (fertig/abgebrochen) hat keine Folgezustände mehr.
 */
const MATCH_UEBERGAENGE: Readonly<Record<MatchStatus, readonly MatchStatus[]>> = {
  einladung: ["countdown", "abgebrochen"],
  countdown: ["laeuft", "abgebrochen"],
  laeuft: ["fertig", "abgebrochen"],
  fertig: [],
  abgebrochen: [],
};

/** Darf ein Match von `von` nach `nach` wechseln? */
export function erlaubterUebergang(von: MatchStatus, nach: MatchStatus): boolean {
  return MATCH_UEBERGAENGE[von]?.includes(nach) ?? false;
}

/**
 * Wo ein Kind IN einem Match steht.
 *
 * ★★★ SEIT 02.10.2026 ZWEI ZUSTÄNDE MEHR (Vorbild `typing/klassenmatch.ts`,
 * Klasse CSS6: Kinder starteten, bevor alle sich entschieden hatten; Johannes
 * für Punktgenau: „ja, mach Punktgenau genauso"), und beide heissen NICHT
 * „dabei":
 *  • `eingeladen` - das Einladungsfenster ist auf dem Gerät dieses Kindes
 *    aufgegangen, es hat sich noch nicht entschieden.
 *  • `abgelehnt` - es hat „Jetzt nicht" gesagt (oder lädt selbst ein).
 * Nur so weiss die Gastgeberin, bei WEM die Einladung angekommen ist.
 *
 * ⚠️⚠️ Eine `eingeladen`- oder `abgelehnt`-Zeile ist KEINE Teilnahme - nicht in
 * der Rangliste, nicht in „3 dabei", nicht bei „Starten", nicht im Verlauf des
 * Servers (`br_match.pb.js`). Wer Stand-Zeilen liest, fragt {@link nimmtTeil}.
 */
export type MatchStandStatus = "eingeladen" | "abgelehnt" | "dabei" | "schreibt" | "fertig";

/**
 * Nimmt diese Zeile am Match teil (dabei, schreibt oder fertig)? Eine
 * Einladung, über die noch nicht entschieden ist, und eine Absage nicht.
 */
export function nimmtTeil(stand: Pick<BrailleMatchStand, "status">): boolean {
  return stand.status === "dabei" || stand.status === "schreibt" || stand.status === "fertig";
}

/** Wartet dieses Kind im Match oder schreibt/liest es gerade (`dabei`/`schreibt`)? */
export function wartetOderSpielt(stand: Pick<BrailleMatchStand, "status">): boolean {
  return stand.status === "dabei" || stand.status === "schreibt";
}

/**
 * ★★★ WIE VIELE HABEN SICH NOCH NICHT ENTSCHIEDEN? (02.10.2026)
 *
 * Gezählt werden die Zeilen auf `eingeladen` - Kinder, bei denen das
 * Einladungsfenster aufgegangen ist und die weder „Bin dabei" noch „Jetzt
 * nicht" gesagt haben. Wer Punktgenau gar nicht offen hat, schreibt keine
 * Zeile und zählt darum nicht mit. Die Gastgeberin selbst zählt nie.
 */
export function unentschiedenZahl(
  staende: readonly Pick<BrailleMatchStand, "status" | "pupilUid">[],
  hostUid: string,
): number {
  return staende.filter((s) => s.status === "eingeladen" && s.pupilUid !== hostUid).length;
}

// ── Die Daten ───────────────────────────────────────────────────────────────

/** Eine Zeile aus `br_matches`. */
export interface BrailleMatch {
  id: string;
  classCode: string;
  hostUid: string;
  hostName: string;
  arbeitsweise: Arbeitsweise;
  bereich: AreaKey;
  status: MatchStatus;
  /** Wann geschrieben/gelesen wird - vom Server gesetzt beim Übergang nach `countdown`. */
  startMs: number;
  /** `startMs + MATCH_DAUER_MS`, ebenfalls vom Server. */
  endeMs: number;
  dauerMin: number;
  createdMs: number;
}

/** Eine Zeile aus `br_match_stand` - ein Kind in einem Match. */
export interface BrailleMatchStand {
  id: string;
  matchId: string;
  classCode: string;
  pupilUid: string;
  name: string;
  status: MatchStandStatus;
  /** Die gemessene Leistung dieses Kindes - Fundament aus `wertung.ts`. */
  lauf: LaufErgebnis;
  updatedMs: number;
}

/**
 * Wo ein Match aus Sicht der UHR steht - nicht dasselbe wie {@link
 * MatchStatus}. Wie im Vorbild: Die Zeit läuft am Server nicht von selbst,
 * jeder Client rechnet die Phase aus `startMs`/`endeMs` - und weil alle
 * dieselben zwei Zahlen haben, kommen alle im selben Augenblick heraus.
 */
export type MatchPhase = "keine" | "einladung" | "countdown" | "laeuft" | "fertig";

export function matchPhaseVon(match: BrailleMatch | null | undefined, jetztMs: number): MatchPhase {
  if (!match) return "keine";
  if (match.status === "fertig" || match.status === "abgebrochen") return "fertig";
  if (match.status === "einladung") return "einladung";
  if (!(match.startMs > 0)) return "einladung";
  if (jetztMs < match.startMs) return "countdown";
  const ende = match.endeMs > 0 ? match.endeMs : match.startMs + MATCH_DAUER_MS;
  return jetztMs < ende ? "laeuft" : "fertig";
}

/** Ein Match, das noch jemanden binden kann (Einladung, Countdown oder Lauf). */
export function matchOffen(match: BrailleMatch, jetztMs: number): boolean {
  const p = matchPhaseVon(match, jetztMs);
  return p === "einladung" || p === "countdown" || p === "laeuft";
}

/** Die offenen Matches einer Klasse, jüngstes zuerst. */
export function offeneMatches(matches: readonly BrailleMatch[], jetztMs: number): BrailleMatch[] {
  return matches.filter((m) => matchOffen(m, jetztMs)).sort((a, b) => b.createdMs - a.createdMs);
}

// ── Kind lädt Kind ein ───────────────────────────────────────────────────────

/**
 * Wer steckt gerade in einem offenen Match und ist darum für eine weitere
 * Einladung nicht erreichbar? Gebunden ist, wer in einem offenen Match eine
 * Stand-Zeile auf `dabei`/`schreibt` hat, und der Gastgeber jedes offenen
 * Matches. `fertig` bindet NICHT - wer früher fertig ist, darf sofort wieder
 * eingeladen werden (Muster `gebundeneKinder`).
 */
export function gebundeneKinder(
  matches: readonly BrailleMatch[],
  staende: readonly Pick<BrailleMatchStand, "matchId" | "pupilUid" | "status">[],
  jetztMs: number,
): Set<string> {
  const offen = new Set(offeneMatches(matches, jetztMs).map((m) => m.id));
  const raus = new Set<string>();
  for (const m of matches) if (offen.has(m.id)) raus.add(m.hostUid);
  for (const s of staende) {
    if (!offen.has(s.matchId)) continue;
    if (s.status === "dabei" || s.status === "schreibt") raus.add(s.pupilUid);
  }
  return raus;
}

// ── Ein Kind, ein Match (02.10.2026) ────────────────────────────────────────

/**
 * ★★★★★ DIE SÄTZE DER SPERRE „EIN KIND, EIN MATCH" - wortgleich im Hook
 * (`br_match_lib.pb.js`, `BR_SPERRE_*`; der Wächter
 * `braille-klassenmatch-ein-kind-ein-match` vergleicht) und wortgleich mit
 * Tastenflow (`typing/klassenmatch.ts`), damit ein Kind, das beide Programme
 * kennt, dieselbe Auskunft liest.
 *
 * Klasse CSS6, 02.10.2026 (Tastenflow): ein Kind legte zwei Matches im Abstand
 * von 13 Sekunden an, drei Kinder steckten in zwei Matches zugleich. Johannes:
 * mehrere Matches je Klasse bleiben erlaubt - aber EIN Kind steckt in
 * höchstens EINEM offenen Match.
 */
export const MATCH_SPERRE_GASTGEBER =
  "Du hast schon ein Klassenmatch ausgeschrieben, das noch offen ist. Ein zweites geht erst, wenn es vorbei ist.";
export const MATCH_SPERRE_DABEI =
  "Du bist schon in einem anderen Klassenmatch dabei. Ein zweites geht erst, wenn es vorbei ist.";

/**
 * ★★★★★ STECKT DIESES KIND SCHON IN EINEM ANDEREN OFFENEN MATCH? Leer heisst
 * nein, sonst der Satz, mit dem abgewiesen wird.
 *
 * Gebunden ist, wer in einem offenen Match (Einladung, Countdown, Lauf - nicht
 * abgelaufen) Gastgeber ist oder auf `dabei`/`schreibt` steht. ⚠️ Ein
 * Gastgeber, dessen EIGENE Zeile auf `fertig` steht, hat sein Match
 * mittendrin verlassen - die anderen spielen weiter, er ist frei.
 *
 * Das ist die Regel des SERVERS (`brEinKindEinMatch` in `br_match_lib.pb.js`,
 * dort noch einmal in JavaScript, weil ein Hook kein TypeScript sieht); der
 * lokale Speicher (`account.ts`) prüft mit dieser Funktion, damit der Weg ohne
 * Server derselbe ist.
 */
export function matchSperre(
  kindUid: string,
  matches: readonly BrailleMatch[],
  staende: readonly Pick<BrailleMatchStand, "matchId" | "pupilUid" | "status">[],
  jetztMs: number,
  ausserMatchId = "",
): string {
  const offen = new Map(
    matches.filter((m) => m.id !== ausserMatchId && matchOffen(m, jetztMs)).map((m) => [m.id, m]),
  );
  for (const m of offen.values()) {
    if (m.hostUid !== kindUid) continue;
    const eigene = staende.find((s) => s.matchId === m.id && s.pupilUid === kindUid);
    if (eigene?.status === "fertig") continue;
    return MATCH_SPERRE_GASTGEBER;
  }
  for (const s of staende) {
    if (s.pupilUid !== kindUid || !offen.has(s.matchId)) continue;
    if (wartetOderSpielt(s)) return MATCH_SPERRE_DABEI;
  }
  return "";
}

/** Darf dieses Kind gerade zu einem Match eingeladen werden? */
export function einladbar(
  pupilUid: string,
  matches: readonly BrailleMatch[],
  staende: readonly Pick<BrailleMatchStand, "matchId" | "pupilUid" | "status">[],
  jetztMs: number,
): boolean {
  return !gebundeneKinder(matches, staende, jetztMs).has(pupilUid);
}

/**
 * ★ Die Lehrkraft kann das Klassenmatch für ihre Klasse abschalten. Die
 * konkrete Ablage dieses Häkchens (voraussichtlich `settings.punktgenau`,
 * derselbe geteilte Topf wie Wochenaufgabe/Etappen-Freigabe) entscheidet die
 * Verdrahtung - `wochenaufgabe.ts` besitzt diesen Topf und bleibt darum
 * unangetastet (siehe Bericht). Diese Funktion kennt nur die Form.
 */
export interface KlassenmatchEinstellung {
  klassenmatchAus?: boolean;
}

export function klassenmatchErlaubt(einstellung: KlassenmatchEinstellung | null | undefined): boolean {
  return einstellung?.klassenmatchAus !== true;
}

// ── Die Rangliste ────────────────────────────────────────────────────────────

/**
 * Der Leistungswert EINES Standes - IMMER gerechnet, nie aus dem Datensatz
 * gelesen (Muster `matchWert`/„Im Datensatz steht zwar ein wert ... aber hier
 * rechnet jedes Gerät ALLE Stände selbst, aus denselben Zahlen").
 */
export function matchWert(stand: Pick<BrailleMatchStand, "lauf">): number {
  return wertung(stand.lauf, BRAILLE_BEZUGSTEMPO).wert;
}

export interface RanglistenEintrag {
  stand: BrailleMatchStand;
  /** 1, 2, 3 … - Platz 1 ist der beste. */
  platz: number;
  wert: number;
}

/**
 * Alt + P - die ganze Platzliste: „1. Mia, 2. Ben, 3. Lea." (Johannes
 * 13.11.2026, wie in Tastenflow nach Topraks Wunsch). Alt + X nennt nur die Zeit.
 */
export function matchPlatzliste(liste: readonly RanglistenEintrag[]): string {
  return liste.map((e) => `${e.platz}. ${e.stand.name}`).join(", ") + ".";
}

/**
 * ⚠️⚠️⚠️ NUR EINE ARBEITSWEISE. Die Rangliste vergleicht ausdrücklich nur
 * Stände MIT DERSELBEN {@link Arbeitsweise} (siehe Kopfkommentar `wertung.ts`)
 * - ein Match ist selbst schon auf eine Arbeitsweise festgelegt
 * ({@link BrailleMatch.arbeitsweise}), diese Funktion setzt die Regel aber
 * zusätzlich durch, falls doch einmal eine fremde Zeile hereinrutscht.
 *
 * Bester Wert zuerst, bei Gleichstand mehr richtige Zellen/Zeichen zuerst,
 * dann der Name - damit die Liste bei zwei Nullen nicht nach Netzweg springt.
 */
export function rangliste(
  staende: readonly BrailleMatchStand[],
  arbeitsweise: Arbeitsweise,
): RanglistenEintrag[] {
  // ★ 02.10.2026: Wer nur eingeladen ist oder abgesagt hat, steht NICHT in der
  // Liste ({@link nimmtTeil}) - sonst stünde dort ein Kind mit null Zellen,
  // das nie mitgespielt hat.
  const passend = staende.filter((s) => nimmtTeil(s) && s.lauf.arbeitsweise === arbeitsweise);
  const mitWert = passend.map((stand) => ({ stand, wert: matchWert(stand) }));
  mitWert.sort((a, b) => {
    if (b.wert !== a.wert) return b.wert - a.wert;
    if (b.stand.lauf.richtig !== a.stand.lauf.richtig) return b.stand.lauf.richtig - a.stand.lauf.richtig;
    return a.stand.name.localeCompare(b.stand.name, "de");
  });
  return mitWert.map((e, i) => ({ ...e, platz: i + 1 }));
}

/**
 * Wo die Kugeln stehen (Muster `kugelPositionen`): Die erste Kugel kommt
 * genau nach {@link MATCH_DAUER_MS} rechts an, alle anderen im Verhältnis
 * ihres Werts zum besten. Rückgabe: Anteil 0 bis 1 der Strichbreite, in der
 * Reihenfolge der übergebenen Rangliste.
 */
export function kugelPositionen(
  liste: readonly RanglistenEintrag[],
  verstrichenMs: number,
  dauerMs: number = MATCH_DAUER_MS,
): number[] {
  const anteilZeit = dauerMs > 0 ? Math.min(1, Math.max(0, verstrichenMs / dauerMs)) : 0;
  const bester = liste.length ? liste[0].wert : 0;
  if (!(bester > 0)) return liste.map(() => 0);
  return liste.map((e) => anteilZeit * Math.min(1, Math.max(0, e.wert) / bester));
}

// ── Die Braillezeile ─────────────────────────────────────────────────────────

/**
 * ★★★ DER VORSPANN AUF DER ZEILE - feste Zellenzahl, immer (Muster
 * `matchZeitstand`/`MATCH_VORSPANN_BREITE` in `typing/klassenmatch.ts`):
 * `P2 3:45 ` - Platz, Leerzeichen, Restzeit, Leerzeichen, auf acht Zellen
 * aufgefüllt oder abgeschnitten.
 *
 * ⚠️ Die feste Breite ist nicht Kosmetik: Wandert sie, wandert der ganze Text
 * unter den lesenden Fingern um eine Stelle - genau die Falle, die dieser
 * Vorspann verhindert.
 */
export const MATCH_VORSPANN_BREITE = 8;

export function matchZeitstand(platz: number, restMs: number): string {
  const p = Math.min(99, Math.max(1, Math.round(platz || 1)));
  const roh = `P${p} ${mmss(restMs)}`;
  return roh.length >= MATCH_VORSPANN_BREITE
    ? roh.slice(0, MATCH_VORSPANN_BREITE)
    : roh + " ".repeat(MATCH_VORSPANN_BREITE - roh.length);
}

// ── Was gesagt wird ─────────────────────────────────────────────────────────

/** „Sarah lädt dich zu einem Klassenmatch ein." */
export function einladungSatz(hostName: string): string {
  return `${hostName} lädt dich zu einem Klassenmatch ein.`;
}

/**
 * „Noch niemand dabei …" - Johannes' Hinweis übernommen (Vorbild F-Auftrag):
 * sagt, WO die Einladung gerade ist, statt nur „niemand".
 */
export const MATCH_NIEMAND_DABEI =
  "Noch niemand dabei - die Einladung ist bei allen aus deiner Klasse, die Punktgenau gerade offen haben.";

/**
 * „3 dabei: Tester, Sebastian, Tester" - die NEUESTEN gleich neben der Zahl
 * (Muster `dabeiSatz`): Wer links auf der Zeile steht, liest die Zahl und
 * gleich danach das Neueste.
 */
export function dabeiSatz(namenNeuesteZuerst: readonly string[]): string {
  if (!namenNeuesteZuerst.length) return MATCH_NIEMAND_DABEI;
  return `${namenNeuesteZuerst.length} dabei: ${namenNeuesteZuerst.join(", ")}`;
}

/** Die Namen der Beigetretenen, die NEUESTEN zuerst - der Gastgeber steht nicht darin. */
export function dabeiNamen(staende: readonly BrailleMatchStand[], hostUid: string): string[] {
  return staende
    // ★ 02.10.2026: nur wer WARTET (`dabei`/`schreibt`) - `eingeladen`/
    // `abgelehnt` sind keine Teilnahme, `fertig` heisst „Doch nicht".
    .filter((s) => s.pupilUid !== hostUid && wartetOderSpielt(s))
    .slice()
    .sort((a, b) => b.updatedMs - a.updatedMs)
    .map((s) => s.name);
}

/**
 * ★★★ DIE RÜCKFRAGE VOR DEM START (02.10.2026, Johannes: *„3 Kinder haben noch
 * nicht entschieden! Trotzdem starten."*) - wortgleich mit Tastenflow.
 */
export function unentschiedenSatz(anzahl: number): string {
  return anzahl === 1
    ? "1 Kind hat sich noch nicht entschieden. Trotzdem starten?"
    : `${anzahl} Kinder haben sich noch nicht entschieden. Trotzdem starten?`;
}

/** Steht die Rückfrage noch, während sich das letzte Kind entscheidet. */
export const MATCH_ALLE_ENTSCHIEDEN = "Jetzt haben sich alle entschieden. Starten?";

/**
 * ★★★ „Arne lädt gerade ein. Mitmachen oder selbst einladen?" (02.10.2026) -
 * die Antwort auf „Klassenmatch", solange eine fremde Einladung offen steht.
 */
export function wahlSatz(hostName: string): string {
  return `${hostName.trim() || "Ein anderes Kind"} lädt gerade ein. Mitmachen oder selbst einladen?`;
}

/** „Platz 2 von 6" - der eigene Rang über dem Feld. */
export function platzSatz(platz: number, anzahl: number): string {
  return `Platz ${platz} von ${anzahl}`;
}

/**
 * „Noch 1 Minute." / „Noch 10 Sekunden." - NUR bei den Restzeiten aus
 * {@link MATCH_ANSAGE_BEI_SEKUNDEN} aufrufen (keine tickende Meldung).
 */
export function matchRestGesprochen(restMs: number): string {
  const sek = Math.max(0, Math.round(restMs / 1000));
  if (sek >= 60) {
    const min = Math.round(sek / 60);
    return min === 1 ? "Noch 1 Minute." : `Noch ${min} Minuten.`;
  }
  return `Noch ${sek} Sekunden.`;
}

/**
 * Der Countdown - nur die letzte Sekunde jeder Zahl, ab 3, nicht ab 10 (Muster
 * `countdownAnsage`): Zehn Zahlen hintereinander sind auf einer Braillezeile
 * zehn Blitzmeldungen.
 */
export function countdownAnsage(restSek: number): string | null {
  if (restSek === 3) return "3";
  if (restSek === 2) return "2";
  if (restSek === 1) return "1";
  if (restSek === 0) return "Los!";
  return null;
}

// ── Was NICHT gespeichert wird ───────────────────────────────────────────────

/**
 * ★★★★★ NUR DIE TEILNAHME BLEIBT (14.11.2026, Johannes: „Ich möchte schon
 * wissen, wie viele Matches gespielt wurden, für die Statistik, und welcher
 * Schüler wie viele Matches spielt, aber nicht, wer gewonnen hat."):
 *
 * `br_matches`/`br_match_stand` sind Spielstand und werden eine Stunde nach
 * dem Ende gelöscht ({@link MATCH_AUFRAEUM_MS}) - kein Kind und keine
 * Lehrkraft liest sie danach noch. Dauerhaft bleibt je Kind und Match nur
 * diese Zeile (`br_match_verlauf`): DASS es mitgespielt hat - kein Platz, keine
 * Ergebnisse, keine Arbeitsweise. Für NIEMANDEN über die Schnittstelle lesbar
 * (weder Kind noch Lehrkraft - siehe `setup.mjs`); sie wird mit dem Kind
 * gelöscht (`tt_pupils_loeschen.pb.js`). Geschrieben vom Aufräum-Cron in
 * `br_match.pb.js` - dieser Typ beschreibt die Spalten.
 */
export interface MatchVerlaufZeile {
  matchId: string;
  classCode: string;
  pupilUid: string;
  /** Zahl der Kinder, die mitgespielt haben. */
  anzahl: number;
  startMs: number;
  endeMs: number;
  createdMs: number;
}
