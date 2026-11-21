/**
 * ════════════════════════════════════════════════════════════════════════════
 * DIE BRAILLE-CHALLENGE - eine Prüfung für eine ganze Klasse.
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Vorbild `../typing/schreibprobe.ts` (dort „Tippchallenge" genannt) - Plan,
 * Einstiegsfenster, Phasen und die Regel „eine Abgabe je Kind und Runde"
 * kommen von dort. **Bewusste Doppelung, keine Wiederverwendung des Bauteils**:
 * Braille misst Zellen (schreiben) bzw. Zeichen (lesen) statt Anschläge, kennt
 * einen Schriftbereich statt ein Tastaturniveau, und Tastenflows Tippchallenge
 * ist live und in Benutzung - sie anzufassen wäre das grössere Risiko
 * ([[feedback_zwei_stellen_die_voneinander_nichts_wissen]]). ★★★ Eine
 * Änderung am ABLAUF (Phasen, Fristen, „eine Abgabe je Runde") gehört darum
 * an BEIDE Stellen - hier UND in `typing/schreibprobe.ts`.
 *
 * Nur reine Funktionen: kein React, kein Backend-Zugriff, kein `localStorage`.
 * Die Wertung selbst kommt NICHT von hier, sondern aus `./wertung.ts`
 * (`wertung()`, `LaufErgebnis`) - das ist das Fundament, auf dem dieser Zubau
 * steht, siehe dort.
 */
import { wertung, type Arbeitsweise, type LaufErgebnis, type Wertung } from "./wertung";
import type { AreaKey } from "./areas";

// ── Das eine Wort ───────────────────────────────────────────────────────────

/**
 * Wie die Sache heisst - für Kinder, Lehrkräfte und die Braillezeile.
 *
 * ⚠️ NUR HIER ÄNDERN (Muster `PRUEFUNG_WORT` in `typing/schreibprobe.ts`) -
 * wer das Wort an einer zweiten Stelle hinschreibt, baut die Fehlerklasse
 * ein, an der die Tippchallenge schon mehrfach hing
 * ([[feedback_zwei_stellen_die_voneinander_nichts_wissen]]).
 */
export const BRAILLE_CHALLENGE_WORT = "Braille-Challenge";
export const BRAILLE_CHALLENGE_WORT_MEHRZAHL = "Braille-Challenges";

// ── Der Bezugswert für die Wertung (Schritt 1 des Auftrags) ─────────────────

/**
 * ★★★ DER BEZUGSWERT FÜR `wertung()` - EINE benannte Konstante, geteilt von
 * `challenge.ts` UND `klassenmatch.ts` (dort importiert, nicht noch einmal
 * hingeschrieben - [[feedback_zwei_stellen_die_voneinander_nichts_wissen]]).
 *
 * 78 - das höchste Tempo-Ziel, das Punktgenau schon kennt
 * (`STUFE_TARGET_CPM[10]` in `stars.ts`, bewusst niedriger als beim
 * Tastschreiben, weil Braille-Erkennung langsamer ist als Tippen). Anders als
 * beim Tippen (`BEZUGSTEMPO = 240` in `schreibprobeWertung.ts`, aus Intersteno
 * hergeleitet) gibt es für Zellen-/Zeichen-je-Minute in Braille noch KEINE
 * eigens recherchierte Bezugsgrösse - das ist der beste vorhandene Wert und
 * bewusst leicht zu ändern, sobald es eine bessere Grundlage gibt.
 */
export const BRAILLE_BEZUGSTEMPO = 78;

// ── Zeiten und Grenzen ──────────────────────────────────────────────────────

/**
 * So lange nach dem Startzeitpunkt kann ein Kind noch einsteigen (Minuten).
 * Wert wie im Vorbild (`EINSTIEGSFENSTER_MIN`, `typing/schreibprobe.ts`).
 */
export const CHALLENGE_EINSTIEGSFENSTER_MIN = 10;

/** Kürzeste einstellbare Prüfungszeit (Minuten). */
export const CHALLENGE_DAUER_MIN_KLEINST = 1;

/**
 * Längste einstellbare Prüfungszeit (Minuten). Kleiner als beim Tippen (60),
 * weil ein Braille-Lauf lange vor 60 Minuten ermüdet - eine Lehrkraft, die mehr
 * braucht, plant zwei Runden.
 */
export const CHALLENGE_DAUER_MIN_GROESST = 30;

/** Vorgabe beim Anlegen einer neuen Braille-Challenge (Minuten). */
export const CHALLENGE_DAUER_VORGABE = 10;

/**
 * ★ Bei welcher Restzeit angesagt wird (Sekunden, absteigend) - NIE öfter.
 *
 * Schritt 4 des Auftrags: keine tickende Meldung während des Arbeitens, sie
 * verdrängt die Braillezeile rund vier Sekunden
 * ([[reference_live_region_ist_braille_blitzmeldung]]). {@link
 * challengeRestGesprochen} liefert nur bei GENAU diesen drei Restzeiten
 * überhaupt einen Satz (sonst `null`) - eine Oberfläche, die diese Liste
 * benutzt, kann die Regel darum gar nicht falsch umsetzen.
 */
export const CHALLENGE_ANSAGE_BEI_SEKUNDEN: readonly number[] = [300, 60, 10];

// ── Der Plan (was die Lehrkraft einstellt) ──────────────────────────────────

export interface ChallengePlan {
  /** Eindeutig je Runde - Schlüssel für die Ergebnisse (= `probeId`). */
  id: string;
  arbeitsweise: Arbeitsweise;
  bereich: AreaKey;
  /** Startzeitpunkt (ms seit 1970). Ab hier zählt das Einstiegsfenster. */
  startMs: number;
  /** Prüfungszeit je Kind in Minuten - ab dessen erstem Anschlag. */
  dauerMin: number;
  /** Wann die Lehrkraft sie angelegt hat (nur für die Anzeige). */
  angelegtMs: number;
}

/**
 * Den Plan wehrhaft aus einem rohen Wert lesen - Muster
 * `planAusEinstellungen()` in `typing/schreibprobe.ts`. Ein kaputter Wert darf
 * keinem Kind eine Challenge vor die Nase setzen; im Zweifel `null`.
 *
 * ⚠️ Anders als beim Vorbild nimmt diese Funktion nicht die ganzen
 * Klassen-Einstellungen entgegen, sondern schon den ENTPACKTEN Braille-Anteil
 * (z. B. `settings.punktgenau.challenge`). Wo genau dieser Anteil in
 * `tt_classes.settings` liegt, entscheidet die Verdrahtung
 * (`wochenaufgabe.ts` besitzt den gemeinsamen Topf `settings.punktgenau` und
 * bleibt darum unangetastet, siehe Bericht) - diese Funktion kennt nur die
 * Form des Braille-Anteils selbst.
 */
export function challengePlanAusRoh(roh: unknown): ChallengePlan | null {
  if (!roh || typeof roh !== "object") return null;
  const p = roh as Record<string, unknown>;

  const id = typeof p.id === "string" ? p.id.trim() : "";
  if (!id) return null;

  const arbeitsweise = p.arbeitsweise === "schreiben" || p.arbeitsweise === "lesen" ? p.arbeitsweise : null;
  if (!arbeitsweise) return null;

  const bereich = typeof p.bereich === "string" && p.bereich ? (p.bereich as AreaKey) : null;
  if (!bereich) return null;

  const startMs = zahl(p.startMs);
  if (!(startMs > 0)) return null;

  const dauerMin = Math.round(zahl(p.dauerMin));
  if (!(dauerMin >= CHALLENGE_DAUER_MIN_KLEINST) || dauerMin > CHALLENGE_DAUER_MIN_GROESST) return null;

  const angelegtMs = zahl(p.angelegtMs) || startMs;

  return { id, arbeitsweise, bereich, startMs, dauerMin, angelegtMs };
}

function zahl(x: unknown): number {
  const n = typeof x === "number" ? x : Number(x);
  return Number.isFinite(n) ? n : 0;
}

// ── Der Stand EINES Kindes ───────────────────────────────────────────────────

export interface ChallengeKindStand {
  /** Wann dieses Kind den ersten Anschlag gemacht hat (0 = noch nicht). */
  beginnMs: number;
  /** Hat es die Runde schon abgegeben? */
  abgegeben: boolean;
  /** Hat es „ich schreibe nicht mit" gewählt? */
  abgemeldet: boolean;
}

export const CHALLENGE_LEERER_STAND: ChallengeKindStand = {
  beginnMs: 0,
  abgegeben: false,
  abgemeldet: false,
};

/** Ende des Einstiegsfensters (ms). */
export function challengeEinstiegBisMs(plan: ChallengePlan): number {
  return plan.startMs + CHALLENGE_EINSTIEGSFENSTER_MIN * 60_000;
}

/** Wie lange dieses Kind schreiben/lesen darf (ms) - feste Prüfungszeit, kein Zuschlag. */
export function challengeDauerMs(plan: ChallengePlan): number {
  return plan.dauerMin * 60_000;
}

/**
 * ★ Derselbe Uhren-Spielraum wie im Vorbild (`UHR_SPIELRAUM_MS`): Ein Start,
 * der bis zu fünf Minuten in der Zukunft liegt, gilt schon als „jetzt" - das
 * fängt eine leicht falsch gehende Schuluhr ab, ohne ein Kind warten zu lassen.
 */
export const CHALLENGE_UHR_SPIELRAUM_MS = 5 * 60_000;

/**
 * In welchem Zustand ist die Braille-Challenge für DIESES Kind? Muster
 * `phaseVon()` in `typing/schreibprobe.ts`: hängt an Plan, Uhr UND dem, was
 * dieses Kind schon getan hat - nie allein aus dem Plan ablesbar.
 */
export type ChallengePhase =
  /** Keine Braille-Challenge geplant (der Normalfall). */
  | "keine"
  /** Das Einstiegsfenster läuft - dieses Kind darf jetzt beginnen. */
  | "offen"
  /** Dieses Kind hat begonnen, seine Zeit läuft. */
  | "laeuft"
  /** Dieses Kind ist fertig (abgegeben oder Zeit abgelaufen). */
  | "abgegeben"
  /** Das Einstiegsfenster ist zu, dieses Kind hat nie begonnen. */
  | "verpasst";

export function challengePhaseVon(
  plan: ChallengePlan | null,
  stand: ChallengeKindStand,
  jetztMs: number,
): ChallengePhase {
  if (!plan) return "keine";
  if (stand.abgegeben) return "abgegeben";
  if (stand.abgemeldet) return "keine";
  if (stand.beginnMs > 0) {
    const restMs = challengeRestMs(plan, stand, jetztMs);
    return restMs > 0 ? "laeuft" : "abgegeben";
  }
  if (jetztMs < plan.startMs - CHALLENGE_UHR_SPIELRAUM_MS) return "keine";
  if (jetztMs <= challengeEinstiegBisMs(plan)) return "offen";
  return "verpasst";
}

/** Wie viel Zeit bleibt diesem Kind noch (ms, nie negativ)? Reine Wanduhr. */
export function challengeRestMs(plan: ChallengePlan, stand: ChallengeKindStand, jetztMs: number): number {
  const gesamt = challengeDauerMs(plan);
  if (stand.beginnMs <= 0) return gesamt;
  return Math.max(0, gesamt - (jetztMs - stand.beginnMs));
}

/** Darf dieses Kind JETZT abgeben? Nur während die Runde für es läuft. */
export function kannAbgeben(plan: ChallengePlan | null, stand: ChallengeKindStand, jetztMs: number): boolean {
  return challengePhaseVon(plan, stand, jetztMs) === "laeuft";
}

// ── Das Ergebnis (dauerhaft, EINE Abgabe je Kind und Runde) ─────────────────

/**
 * ★★★ EIN Ergebnis, dauerhaft gespeichert - anders als Klassenmatch (siehe
 * `klassenmatch.ts`): Eine Braille-Challenge ist eine Prüfung, keine
 * Spielrunde. „Zweimal abgeben ist unmöglich" wird DOPPELT durchgesetzt:
 * {@link kannAbgeben} lässt die Oberfläche gar nicht erst ein zweites Mal
 * abgeben, und die Collection `br_challenges` trägt zusätzlich einen
 * eindeutigen Index über (pupilUid, probeId) - der zweite Riegel greift auch,
 * wenn der erste je umgangen würde (Muster `tt_schreibproben`, `setup.mjs`).
 */
export interface ChallengeErgebnis {
  /** = `plan.id` - die Runde, zu der dieses Ergebnis gehört. */
  probeId: string;
  pupilUid: string;
  teacherUid: string;
  classCode: string;
  arbeitsweise: Arbeitsweise;
  bereich: AreaKey;
  /** Die gemessene Leistung dieses Laufs - Fundament aus `wertung.ts`. */
  lauf: LaufErgebnis;
  /** Wann abgegeben wurde (ms). */
  eingereichtMs: number;
}

/** Der Leistungswert eines Ergebnisses - IMMER gerechnet, nie aus dem Datensatz gelesen. */
export function challengeWertung(ergebnis: Pick<ChallengeErgebnis, "lauf">): Wertung {
  return wertung(ergebnis.lauf, BRAILLE_BEZUGSTEMPO);
}

/** Eine neue Runden-Kennung. Muster `neueProbenId()` in `typing/schreibprobe.ts`. */
export function neueChallengeId(jetztMs: number = Date.now()): string {
  const zufall = Math.random().toString(36).slice(2, 8);
  return `bc${jetztMs.toString(36)}${zufall}`;
}

// ── Was gesagt wird ─────────────────────────────────────────────────────────

/**
 * „Noch 5 Minuten." / „Noch 1 Minute." / „Noch 10 Sekunden." / „Die Zeit ist
 * um." - NUR bei den Restzeiten aus {@link CHALLENGE_ANSAGE_BEI_SEKUNDEN} bzw.
 * bei 0 aufrufen (siehe dort - das ist die ganze Absicherung gegen eine
 * tickende Meldung). Kein Wort gegen ein Kind: reine Zeitansage, keine
 * Wertung des bisherigen Standes.
 */
export function challengeRestGesprochen(ms: number): string {
  const s = Math.max(0, Math.round(ms / 1000));
  if (s <= 0) return "Die Zeit ist um.";
  if (s < 60) return `Noch ${s} Sekunden.`;
  const min = Math.round(s / 60);
  return min === 1 ? "Noch 1 Minute." : `Noch ${min} Minuten.`;
}
