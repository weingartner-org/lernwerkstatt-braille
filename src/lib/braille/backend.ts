/**
 * Backend-Abstraktion für die Konten des Braille-Trainers.
 *
 * Zwei Implementierungen hinter EINER (asynchronen) Schnittstelle:
 *  • LocalBrailleBackend  — localStorage, nur in diesem Browser (Dev/Tests/„ohne
 *    Konto"-Geräte). Wickelt die bestehenden synchronen Funktionen aus
 *    `account.ts` in Promises.
 *  • PocketBaseBrailleBackend — zentrale Server-Datenbank, damit sich
 *    Schüler:innen von JEDEM Gerät anmelden können (siehe pbBackend.ts).
 *
 * GETEILTE Identität mit „Tastenflow" (dem Tipptrainer): im PocketBase-Modus
 * authentifiziert sich der Braille-Trainer gegen DIESELBEN Konten — wer dort ein
 * Konto hat, kann auch hier üben. Nur die Lern-Daten sind getrennt. Siehe
 * [[project_braille_trainer]], [[feedback_security_first]].
 *
 * Auswahl über `VITE_BACKEND` (wie das LMS): "pocketbase" → Server, sonst lokal.
 * Die Sitzung (wer ist angemeldet) verwaltet das Backend selbst: lokal über
 * einen localStorage-Schlüssel, bei PocketBase über dessen eigenen, vom LMS
 * getrennten authStore.
 */
import {
  BrailleAccount,
  BrailleClass,
  BrailleClassSettings,
  Result,
  TaskEvent,
  addPupil as localAddPupil,
  createClass as localCreateClass,
  getAccount as localGetAccount,
  getClassSettings as localGetClassSettings,
  getEvents as localGetEvents,
  getProgress as localGetProgress,
  listClasses as localListClasses,
  listPupils as localListPupils,
  loginPupil as localLoginPupil,
  loginTeacher as localLoginTeacher,
  recordEvent as localRecordEvent,
  registerTeacher as localRegisterTeacher,
  saveAccountProgress as localSaveProgress,
  updateClassSettings as localUpdateClassSettings,
  changeOwnPasswordLocal,
  getSpendenbannerZustand as localGetSpendenbannerZustand,
  setSpendenbannerZustand as localSetSpendenbannerZustand,
  setGespendetAm as localSetGespendetAm,
  // ── Zubau 22.09.2026: Braille-Challenge, Klassenmatch, eigene Übungen ─────
  setChallengePlan as localSetChallengePlan,
  setKlassenmatchAus as localSetKlassenmatchAus,
  meldeChallengeErgebnis as localMeldeChallengeErgebnis,
  holeChallengeErgebnis as localHoleChallengeErgebnis,
  listeChallengeErgebnisse as localListeChallengeErgebnisse,
  listeChallengeVerlaufKlasse as localListeChallengeVerlaufKlasse,
  listeChallengeVerlaufKind as localListeChallengeVerlaufKind,
  erstelleMatch as localErstelleMatch,
  listeMatches as localListeMatches,
  aktualisiereMatchStatus as localAktualisiereMatchStatus,
  schreibeMatchStand as localSchreibeMatchStand,
  listeMatchStaende as localListeMatchStaende,
  beobachteMatchesLocal,
  beobachteMatchStaendeLocal,
  listeEigeneUebungen as localListeEigeneUebungen,
  starteEigeneUebung as localStarteEigeneUebung,
  beendeEigeneUebung as localBeendeEigeneUebung,
  leseEigenenText as localLeseEigenenText,
  markiereEigeneUebungFertig as localMarkiereEigeneUebungFertig,
  leseEigeneUebungFortschritt as localLeseEigeneUebungFortschritt,
  leseEigeneUebungFortschritteDerKlasse as localLeseEigeneUebungFortschritteDerKlasse,
} from "./account";
import type { ChallengePlan, ChallengeErgebnis } from "./challenge";
import type { BrailleMatch, BrailleMatchStand, MatchStatus } from "./klassenmatch";
import type { EigeneUebungEintrag, EigeneUebungFortschritt } from "./eigeneUebung";
import type { Arbeitsweise } from "./wertung";
import type { AreaKey } from "./areas";
import { PocketBaseBrailleBackend } from "./pbBackend";
import { BrailleProgress } from "./progress";
import type { SpendenBannerZielgruppe } from "@/lib/spendenbannerTexte";
import type { SpendenBannerZustand } from "@/lib/spendenbanner";

export interface BrailleBackend {
  /** Bezeichnet die Art (für Diagnose/Tests). */
  readonly kind: "local" | "pocketbase";

  // Sitzung
  /** Aktuell angemeldetes Konto (synchron aus der gespeicherten Sitzung). */
  currentAccount(): BrailleAccount | null;
  logout(): void;

  // Lehrkraft
  registerTeacher(
    name: string,
    email: string,
    password: string,
  ): Promise<Result<BrailleAccount>>;
  loginTeacher(email: string, password: string): Promise<Result<BrailleAccount>>;
  /**
   * Eigenes Passwort ändern (Kind ODER Lehrkraft). Seit 10.08.2026 hat jede App
   * den Punkt „Passwort ändern" im Konto-Menü — nicht mehr versteckt in einer
   * Statistik ([[feedback_platform_parity]]).
   */
  changeOwnPassword(oldPassword: string, newPassword: string): Promise<Result<true>>;
  /** „Passwort vergessen": Reset-Link per E-Mail an die Lehrkraft anstoßen. */
  requestTeacherPasswordReset(email: string): Promise<Result<true>>;
  /** Reset-Token aus der Mail einlösen und neues Lehrkraft-Passwort setzen. */
  confirmTeacherPasswordReset(token: string, newPassword: string): Promise<Result<true>>;

  // Klassen
  createClass(
    teacherId: string,
    name: string,
    code?: string,
  ): Promise<Result<BrailleClass>>;
  listClasses(teacherId: string): Promise<BrailleClass[]>;
  /** Lern-Einstellungen der Klasse setzen (Lehrkraft). */
  updateClassSettings(
    teacherId: string,
    classCode: string,
    settings: BrailleClassSettings,
  ): Promise<Result<BrailleClass>>;
  /** Lern-Einstellungen der eigenen Klasse lesen (Kind; null = Standard). */
  getClassSettings(classCode: string): Promise<BrailleClassSettings | null>;

  // Schüler:innen
  addPupil(
    classCode: string,
    name: string,
    password: string,
  ): Promise<Result<BrailleAccount>>;
  loginPupil(
    classCode: string,
    name: string,
    password: string,
  ): Promise<Result<BrailleAccount>>;
  /**
   * SELBSTLERNENDE (09.08.2026): eigenes Konto ohne Klasse und ohne Lehrkraft,
   * Anmeldung über die echte E-Mail-Adresse. Dieselben Konten wie in
   * Tastenflow/eine andere App der Plattform — die Lernwerkstatt teilt sich die Identität
   * ([[project_lernwerkstatt_unified]]).
   */
  registerPupilSelf(
    name: string,
    email: string,
    password: string,
  ): Promise<Result<BrailleAccount>>;
  loginPupilSelf(email: string, password: string): Promise<Result<BrailleAccount>>;
  listPupils(classCode: string): Promise<BrailleAccount[]>;

  // Fortschritt + Telemetrie
  getProgress(accountId: string): Promise<BrailleProgress>;
  saveProgress(accountId: string, progress: BrailleProgress): Promise<void>;
  recordEvent(accountId: string, event: TaskEvent): Promise<void>;
  getEvents(accountId: string): Promise<TaskEvent[]>;

  /**
   * ★★★ Spendenbanner (Nachbesserung 19.09.2026, `lib/spendenbanner.ts`):
   * Zustand EINES Kontos lesen/schreiben - dasselbe Konto/Feld wie in
   * Tastenflow und eine andere App der Plattform ([[project_lernwerkstatt_unified]]),
   * `accountId` ist immer das Konto, das den Banner gerade selbst sieht.
   */
  getSpendenbannerZustand(
    accountId: string,
    zielgruppe: SpendenBannerZielgruppe,
  ): Promise<SpendenBannerZustand | null>;
  /** `false`, wenn das Schreiben scheiterte (offline) - dann bleibt nur `localStorage`. */
  setSpendenbannerZustand(
    accountId: string,
    zielgruppe: SpendenBannerZielgruppe,
    meilensteinH: number,
    zuletztGezeigtMs: number,
  ): Promise<boolean>;
  /**
   * ★★★★★ Eine BESTÄTIGTE Spende am EIGENEN Konto merken (19.09.2026,
   * `lib/spendeBestaetigt.ts`): Feld `gespendetAm` (ms) an `tt_teachers`
   * („lehrkraft") bzw. `tt_pupils` („selbstlernend"). Danach liefert
   * `getSpendenbannerZustand` `gespendetMs`, und der Banner kommt nie wieder.
   * Nur das Datum - kein Betrag, keine Zahlungsdaten. `false`, wenn das
   * Schreiben scheiterte (abgemeldet, offline); dann bleibt der Merker am Gerät.
   */
  setGespendetAm(
    accountId: string,
    zielgruppe: SpendenBannerZielgruppe,
    gespendetMs: number,
  ): Promise<boolean>;

  // ══════════════════════════════════════════════════════════════════════
  // ZUBAU 22.09.2026: BRAILLE-CHALLENGE, KLASSENMATCH, EIGENE ÜBUNGEN
  // ══════════════════════════════════════════════════════════════════════
  // Reine Verdrahtung - die Logik (Zustände, Fristen, Wertung) liegt
  // unverändert in `challenge.ts`/`klassenmatch.ts`/`eigeneUebung.ts`/
  // `wertung.ts`. Lokale und Server-Fassung müssen dasselbe tun (Wächter:
  // `tests/braille-backend-wettkampf.test.ts`).

  // --- Braille-Challenge -------------------------------------------------
  /** Challenge-Plan der Klasse setzen (Lehrkraft) - `null` beendet die Runde. */
  setChallengePlan(
    teacherId: string,
    classCode: string,
    plan: ChallengePlan | null,
  ): Promise<Result<true>>;
  /**
   * Die eigene Abgabe schreiben - EINMAL je Kind und Runde. Zweimal abgeben
   * ist unmöglich: `getClassSettings`/der eindeutige Index am Server weisen
   * einen zweiten Versuch ab (siehe `setup.mjs`, `br_challenges`).
   */
  meldeChallengeErgebnis(ergebnis: ChallengeErgebnis): Promise<Result<true>>;
  /** Hat DIESES Kind DIESE Runde schon abgegeben? `null`, wenn nicht. */
  holeChallengeErgebnis(pupilUid: string, probeId: string): Promise<ChallengeErgebnis | null>;
  /** Alle Abgaben einer Runde (Lehrkraft-Übersicht). */
  listeChallengeErgebnisse(classCode: string, probeId: string): Promise<ChallengeErgebnis[]>;
  /**
   * ★ Zubau 22.09.2026: DER VERLAUF - alle Abgaben einer Klasse, über ALLE
   * Runden hinweg (nicht nur ein `probeId`), jüngste zuerst. Fundament der
   * Runden-Übersicht in `BrailleChallengeKasten.tsx`
   * (`src/lib/braille/challengeVerlauf.ts`, `challengeRunden`).
   */
  listeChallengeVerlaufKlasse(classCode: string): Promise<ChallengeErgebnis[]>;
  /**
   * ★ Zubau 22.09.2026: DER VERLAUF - alle Abgaben EINES Kindes, über ALLE
   * Runden und Klassen, jüngste zuerst. Für eine künftige eigene Statistik
   * des Kindes.
   */
  listeChallengeVerlaufKind(pupilUid: string): Promise<ChallengeErgebnis[]>;

  // --- Klassenmatch --------------------------------------------------------
  /** Klassenmatch für diese Klasse an-/abschalten (Lehrkraft, F8-Muster). */
  setKlassenmatchAus(teacherId: string, classCode: string, aus: boolean): Promise<Result<true>>;
  /**
   * Alle Matches einer Klasse (auch abgelaufene - die Phase rechnet der
   * Aufrufer). ⚠️ Wie am Vorbild: ein Netzfehler geht als Fehler nach oben,
   * nie als leere Liste - sonst verliert ein Kind mitten im Lauf sein Match.
   */
  listeMatches(classCode: string): Promise<BrailleMatch[]>;
  /** Ein Match ausschreiben. Name, Zeiten und Zustand setzt der Server. */
  erstelleMatch(
    account: BrailleAccount,
    arbeitsweise: Arbeitsweise,
    bereich: AreaKey,
  ): Promise<BrailleMatch | null>;
  /** Zustand ändern (starten/absagen) - nur erlaubte Übergänge (`erlaubterUebergang`). */
  aktualisiereMatch(matchId: string, status: MatchStatus): Promise<BrailleMatch | null>;
  /** Die Matches der eigenen Klasse beobachten (Realtime). */
  beobachteMatches(classCode: string, beiAenderung: (match: BrailleMatch) => void): () => void;
  /**
   * Alle Stand-Zeilen EINES Matches. `arbeitsweise`/`bereich` kommen vom
   * Match selbst (die Stand-Zeile trägt sie nicht - alle Kinder eines
   * Matches teilen sich dieselbe Arbeitsweise/denselben Bereich).
   */
  listeMatchStaende(
    matchId: string,
    arbeitsweise: Arbeitsweise,
    bereich: AreaKey,
  ): Promise<BrailleMatchStand[]>;
  /** Die eigene Stand-Zeile schreiben (beitreten oder fortschreiben). */
  schreibeMatchStand(
    account: BrailleAccount,
    matchId: string,
    arbeitsweise: Arbeitsweise,
    bereich: AreaKey,
    werte: Pick<BrailleMatchStand, "status" | "lauf">,
    /*
      ★★★ `fehlerMelden` (02.10.2026, „Ein Kind, ein Match", Muster
      `typing/backend.ts`): Ohne die Angabe meldet ein Fehlschlag wie bisher
      `null` (ein verlorener Takt hält keinen Lauf an). MIT ihr WIRFT der
      Aufruf, sobald der SERVER mit einem eigenen Satz abgewiesen hat
      (`Error.message` = dieser Satz, leer bei Netzfehlern) - beim Beitreten
      soll das Kind lesen, warum es nicht ging, statt still in einem
      Wartefenster zu sitzen, in dem es gar nicht steht.
    */
    optionen?: { fehlerMelden?: boolean },
  ): Promise<BrailleMatchStand | null>;
  /** Die Stand-Zeilen eines Matches beobachten (Realtime). */
  beobachteMatchStaende(
    matchId: string,
    arbeitsweise: Arbeitsweise,
    bereich: AreaKey,
    beiAenderung: (stand: BrailleMatchStand) => void,
  ): () => void;

  // --- Eigene Übungen --------------------------------------------------------
  /** Die aktuelle Reihe der Klasse (älteste zuerst - die Zeilen SIND die Reihe). */
  listeEigeneUebungen(classCode: string): Promise<EigeneUebungEintrag[]>;
  /** Eine neue Übung anlegen und an die Reihe HÄNGEN (nie ersetzen). */
  starteEigeneUebung(
    classCode: string,
    teacherId: string,
    eintrag: { dateiname: string; arbeitsweise: Arbeitsweise; bereich: AreaKey; zeilen: string[] },
    vonAllenFertig?: readonly string[],
  ): Promise<EigeneUebungEintrag[] | null>;
  /** Eine Übung aus der Reihe nehmen ("Beenden"). */
  beendeEigeneUebung(classCode: string, textId: string): Promise<EigeneUebungEintrag[] | null>;
  /** Den Inhalt einer Übung lesen (Zeilen). */
  leseEigenenText(textId: string): Promise<{ dateiname: string; zeilen: string[] } | null>;
  /** „Fertig" für DIESES Kind UND DIESEN Text festhalten - am Konto. */
  meldeEigeneUebungFertig(accountId: string, textId: string): Promise<boolean>;
  /** Der Fertig-Stand EINES Kindes über alle Texte. */
  leseEigeneUebungFortschritt(accountId: string): Promise<EigeneUebungFortschritt>;
  /** Der Fertig-Stand ALLER Kinder einer Klasse (Lehrkraft-Übersicht). */
  leseEigeneUebungFortschritteDerKlasse(classCode: string): Promise<EigeneUebungFortschritt[]>;
}

// --- Lokales Backend (localStorage, ein Browser) -----------------------------
const CURRENT_KEY = "braille-trainer:current";

class LocalBrailleBackend implements BrailleBackend {
  readonly kind = "local" as const;

  private setCurrent(id: string | null) {
    try {
      if (id) localStorage.setItem(CURRENT_KEY, id);
      else localStorage.removeItem(CURRENT_KEY);
    } catch {
      /* ignore */
    }
  }

  currentAccount(): BrailleAccount | null {
    try {
      const id = localStorage.getItem(CURRENT_KEY);
      return id ? localGetAccount(id) : null;
    } catch {
      return null;
    }
  }

  logout(): void {
    this.setCurrent(null);
  }

  async registerTeacher(name: string, email: string, password: string) {
    const r = localRegisterTeacher(name, email, password);
    if (r.ok) this.setCurrent(r.value.id);
    return r;
  }

  async loginTeacher(email: string, password: string) {
    const r = localLoginTeacher(email, password);
    if (r.ok) this.setCurrent(r.value.id);
    return r;
  }

  // Lokaler Modus: kein E-Mail-Versand (vgl. Tipp-Backend).
  async requestTeacherPasswordReset(_email: string): Promise<Result<true>> {
    return { ok: true as const, value: true };
  }
  async confirmTeacherPasswordReset(): Promise<Result<true>> {
    return { ok: false as const, error: "Das Zurücksetzen funktioniert nur mit einem Server-Konto." };
  }

  async createClass(teacherId: string, name: string, code?: string) {
    return localCreateClass(teacherId, name, code);
  }
  async listClasses(teacherId: string) {
    return localListClasses(teacherId);
  }
  async updateClassSettings(
    teacherId: string,
    classCode: string,
    settings: BrailleClassSettings,
  ) {
    return localUpdateClassSettings(teacherId, classCode, settings);
  }
  async getClassSettings(classCode: string) {
    return localGetClassSettings(classCode);
  }

  async addPupil(classCode: string, name: string, password: string) {
    return localAddPupil(classCode, name, password);
  }
  async loginPupil(classCode: string, name: string, password: string) {
    const r = localLoginPupil(classCode, name, password);
    if (r.ok) this.setCurrent(r.value.id);
    return r;
  }
  /** Ohne Server kein E-Mail-Konto — ehrlich absagen (siehe Tastenflow). */
  async registerPupilSelf(): Promise<Result<BrailleAccount>> {
    return { ok: false, error: "Ein eigenes Konto braucht eine Verbindung zum Server." };
  }
  async loginPupilSelf(): Promise<Result<BrailleAccount>> {
    return { ok: false, error: "Ein eigenes Konto braucht eine Verbindung zum Server." };
  }
  async listPupils(classCode: string) {
    return localListPupils(classCode);
  }

  async getProgress(accountId: string) {
    return localGetProgress(accountId);
  }
  async changeOwnPassword(oldPassword: string, newPassword: string) {
    const me = this.currentAccount();
    if (!me) return { ok: false as const, error: "Bitte zuerst anmelden." };
    return changeOwnPasswordLocal(me.id, oldPassword, newPassword);
  }
  async saveProgress(accountId: string, progress: BrailleProgress) {
    localSaveProgress(accountId, progress);
  }
  async recordEvent(accountId: string, event: TaskEvent) {
    localRecordEvent(accountId, event);
  }
  async getEvents(accountId: string) {
    return localGetEvents(accountId);
  }

  // `zielgruppe` betrifft nur die PocketBase-Fassung (Wahl der Collection) -
  // im lokalen Mock liegen Lehrkräfte und Kinder in DERSELBEN Kontentabelle.
  async getSpendenbannerZustand(accountId: string) {
    return localGetSpendenbannerZustand(accountId);
  }
  async setSpendenbannerZustand(
    accountId: string,
    _zielgruppe: SpendenBannerZielgruppe,
    meilensteinH: number,
    zuletztGezeigtMs: number,
  ) {
    return localSetSpendenbannerZustand(accountId, meilensteinH, zuletztGezeigtMs) != null;
  }
  async setGespendetAm(accountId: string, _zielgruppe: SpendenBannerZielgruppe, gespendetMs: number) {
    return localSetGespendetAm(accountId, gespendetMs) != null;
  }

  // ── Zubau 22.09.2026: Braille-Challenge, Klassenmatch, eigene Übungen ─────
  async setChallengePlan(teacherId: string, classCode: string, plan: ChallengePlan | null) {
    return localSetChallengePlan(teacherId, classCode, plan);
  }
  async meldeChallengeErgebnis(ergebnis: ChallengeErgebnis) {
    return localMeldeChallengeErgebnis(ergebnis);
  }
  async holeChallengeErgebnis(pupilUid: string, probeId: string) {
    return localHoleChallengeErgebnis(pupilUid, probeId);
  }
  async listeChallengeErgebnisse(classCode: string, probeId: string) {
    return localListeChallengeErgebnisse(classCode, probeId);
  }
  async listeChallengeVerlaufKlasse(classCode: string) {
    return localListeChallengeVerlaufKlasse(classCode);
  }
  async listeChallengeVerlaufKind(pupilUid: string) {
    return localListeChallengeVerlaufKind(pupilUid);
  }

  async setKlassenmatchAus(teacherId: string, classCode: string, aus: boolean) {
    return localSetKlassenmatchAus(teacherId, classCode, aus);
  }
  async listeMatches(classCode: string) {
    return localListeMatches(classCode);
  }
  async erstelleMatch(account: BrailleAccount, arbeitsweise: Arbeitsweise, bereich: AreaKey) {
    const r = localErstelleMatch(account, arbeitsweise, bereich);
    // ★★★★★ NICHT VERSCHLUCKEN - dieselbe Stelle wie `PocketBaseBrailleBackend.
    // erstelleMatch` (Muster `typing/pbBackend.ts`, 11.09.2026): „Eure
    // Lehrkraft hat das Klassenmatch ausgeschaltet" soll das Kind lesen, ob
    // lokal oder am Server. Beide Fassungen müssen dasselbe tun.
    if (!r.ok) throw new Error(r.error);
    return r.value;
  }
  async aktualisiereMatch(matchId: string, status: MatchStatus) {
    const r = localAktualisiereMatchStatus(matchId, status);
    return r.ok ? r.value : null;
  }
  beobachteMatches(classCode: string, beiAenderung: (match: BrailleMatch) => void) {
    return beobachteMatchesLocal(classCode, beiAenderung);
  }
  async listeMatchStaende(matchId: string, _arbeitsweise: Arbeitsweise, _bereich: AreaKey) {
    return localListeMatchStaende(matchId);
  }
  async schreibeMatchStand(
    account: BrailleAccount,
    matchId: string,
    _arbeitsweise: Arbeitsweise,
    _bereich: AreaKey,
    werte: Pick<BrailleMatchStand, "status" | "lauf">,
    optionen?: { fehlerMelden?: boolean },
  ) {
    const r = localSchreibeMatchStand(account, matchId, werte);
    if (r.ok) return r.value;
    // Wie am Server (`pbBackend.ts`): ohne `fehlerMelden` ein stilles `null`.
    if (optionen?.fehlerMelden) throw new Error(r.error);
    return null;
  }
  beobachteMatchStaende(
    matchId: string,
    _arbeitsweise: Arbeitsweise,
    _bereich: AreaKey,
    beiAenderung: (stand: BrailleMatchStand) => void,
  ) {
    return beobachteMatchStaendeLocal(matchId, beiAenderung);
  }

  async listeEigeneUebungen(classCode: string) {
    return localListeEigeneUebungen(classCode);
  }
  async starteEigeneUebung(
    classCode: string,
    teacherId: string,
    eintrag: { dateiname: string; arbeitsweise: Arbeitsweise; bereich: AreaKey; zeilen: string[] },
    vonAllenFertig: readonly string[] = [],
  ) {
    const r = localStarteEigeneUebung(classCode, teacherId, eintrag, vonAllenFertig);
    return r.ok ? r.value : null;
  }
  async beendeEigeneUebung(classCode: string, textId: string) {
    const r = localBeendeEigeneUebung(classCode, textId);
    return r.ok ? r.value : null;
  }
  async leseEigenenText(textId: string) {
    return localLeseEigenenText(textId);
  }
  async meldeEigeneUebungFertig(accountId: string, textId: string) {
    return localMarkiereEigeneUebungFertig(accountId, textId);
  }
  async leseEigeneUebungFortschritt(accountId: string) {
    return localLeseEigeneUebungFortschritt(accountId);
  }
  async leseEigeneUebungFortschritteDerKlasse(classCode: string) {
    return localLeseEigeneUebungFortschritteDerKlasse(classCode);
  }
}

// --- Auswahl (Singleton) -----------------------------------------------------
let instance: BrailleBackend | null = null;

export function brailleBackend(): BrailleBackend {
  if (instance) return instance;
  const usePb =
    (import.meta.env.VITE_BACKEND ?? "mock") === "pocketbase" &&
    typeof window !== "undefined";
  if (usePb) {
    // Synchroner Konstruktor — der PB-Client ist sofort verfügbar; Aufrufe sind
    // asynchron. (Geteilter authStore in pbBackend.ts, getrennt vom LMS.)
    instance = new PocketBaseBrailleBackend();
  } else {
    instance = new LocalBrailleBackend();
  }
  return instance;
}

/** Test-Hilfe: Singleton zurücksetzen. */
export function _resetBrailleBackend() {
  instance = null;
}
