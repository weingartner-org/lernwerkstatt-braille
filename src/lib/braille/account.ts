/**
 * Konten für den Braille-Trainer — eigenes, getrenntes System NUR für dieses
 * Programm (nicht die LMS-Konten). Lehrkraft: E-Mail + Passwort. Schüler:innen:
 * von der Lehrkraft angelegt, Login per Klassencode + Name + Passwort.
 *
 * Diese Datei ist die LOKALE Umsetzung (ein Browser, zum Testen des ganzen
 * Ablaufs ohne Server). Das Interface ist bewusst schlank, damit später
 * PocketBase (geräteübergreifend, sichere Auth) dahinter geschoben werden kann.
 *
 * SICHERHEIT: Das lokale Passwort ist nur ein Test-Platzhalter (nicht
 * umkehrbarer Hash, im eigenen Browser). Die echte, sichere Authentifizierung
 * übernimmt später PocketBase. Siehe [[feedback_security_first]].
 */
import { BrailleProgress, emptyProgress } from "./progress";
import type { Wochenaufgabe } from "./wochenaufgabe";
import type { SpendenBannerZustand } from "@/lib/spendenbanner";
// ── Zubau 22.09.2026: Braille-Challenge, Klassenmatch, eigene Übungen ────────
// Nur BENUTZT, nicht geändert (Dateihoheit siehe Bericht) - die reine Logik
// bleibt bei `challenge.ts`/`klassenmatch.ts`/`eigeneUebung.ts`/`wertung.ts`.
import type { ChallengePlan, ChallengeErgebnis } from "./challenge";
import {
  MATCH_DAUER_MIN,
  MATCH_COUNTDOWN_MS,
  erlaubterUebergang,
  matchSperre,
  type BrailleMatch,
  type BrailleMatchStand,
  type MatchStatus,
} from "./klassenmatch";
import { reiheMitNeuer, type EigeneUebungEintrag, type EigeneUebungFortschritt } from "./eigeneUebung";
import type { Arbeitsweise } from "./wertung";
import type { AreaKey } from "./areas";

export type BrailleRole = "lehrkraft" | "schueler";

export interface BrailleAccount {
  id: string;
  role: BrailleRole;
  name: string;
  email?: string; // Lehrkraft
  classCode?: string; // Schüler:in
  /**
   * SELBSTLERNEND: Das Konto hat sich selbst angelegt - echte E-Mail-Adresse,
   * keine Klasse, keine Lehrkraft (`selfManaged` in `tt_pupils`; es ist
   * DASSELBE Konto wie in Tastenflow, [[project_lernwerkstatt_unified]]).
   *
   * Punktgenau und Klangpunkte brauchen es für die Kopfzeile: Sie entscheidet
   * daran, ob „Melden" im Konto-Menü steht (Johannes 02.09.2026, siehe
   * `KopfKonto` in `AppKopfzeile.tsx`).
   */
  selfManaged?: boolean;
  /**
   * ★★★ Spendenbanner (Nachbesserung 19.09.2026, `lib/spendenbanner.ts`):
   * wann zuletzt der Spendenbanner gezeigt wurde (ms) und bis zu welchem
   * 5-Stunden-Meilenstein - DASSELBE Konto/Feld wie in Tastenflow und »Im
   * Griff« (`tt_teachers`/`tt_pupils`, [[project_lernwerkstatt_unified]]),
   * appübergreifend EIN Zustand. 0/fehlend = noch nie gezeigt.
   */
  spendenAufrufAm?: number;
  spendenAufrufMeilenstein?: number;
  /**
   * ★★★★★ Eine BESTÄTIGTE Spende (19.09.2026, `lib/spendeBestaetigt.ts`) -
   * dasselbe Feld `gespendetAm` wie in Tastenflow. Gesetzt ⇒ kein
   * Spendenbanner mehr, in keinem Programm. 0/fehlend = nie.
   */
  gespendetAm?: number;
  createdAt: number;
}

/**
 * Lern-Einstellungen einer Klasse — stellt die LEHRKRAFT ein (Punktgenau).
 * Alle default aus/false; fehlende Felder = Standard-Lernweg.
 */
export interface BrailleClassSettings {
  /** Erweiterte Zahlen (röm./Datum/Bruch/%/§) als Zusatz-Etappen nach den Zahlen. */
  extendedNumbers?: boolean;
  /** Computer-Strang als Express-Umstieg u1–u8 (für sichere Vollschrift-Kinder). */
  expressComputer?: boolean;
  /**
   * Großschreibzeichen in Basis- und Vollschrift setzen? Fehlt das Feld
   * (Standard) oder steht es auf `true`, werden sie gesetzt - für bestehende
   * Klassen ändert sich also nichts. Auf `false` gestellt, entfallen die drei
   * Steuerzellen (siehe `TranscribeOptions.grossschreibzeichen` in
   * `engine.ts`); der Buchstabe selbst bleibt. Computerbraille ist nicht
   * betroffen (Großschreibung dort über Punkt 7 im Zeichen selbst).
   *
   * Begründung (Johannes, 20.09.2026): manche Kinder sind am Anfang von der
   * eigenen Ankündigungszelle vor jedem großen Buchstaben überfordert - er
   * fängt dann ohne sie an und schaltet sie später dazu.
   */
  grossschreibzeichen?: boolean;
  /**
   * ★★★ NEU (07.09.2026): die Wochenaufgabe - für die ganze
   * Klasse und, wo nötig, je Kind. Liegt in einem EIGENEN Unterobjekt, weil
   * `tt_classes.settings` ein gemeinsamer JSON-Topf ist: Tastenflow schreibt
   * dort `unterrichtstag`, `unterrichtstagAbMs` und `unterrichtsende` hinein
   * (siehe unten). Ein flacher Schlüssel „wochenaufgabe" wäre nicht falsch,
   * aber beim nächsten Programm, das auch eine hat, mehrdeutig.
   */
  punktgenau?: PunktgenauKlassenplan;
  /**
   * ⚠️⚠️ DIESE DREI GEHÖREN TASTENFLOW - hier wird nur GELESEN.
   *
   * Sie stehen im selben JSON-Feld `tt_classes.settings` und beschreiben die
   * Unterrichtsstunde der Klasse (`lib/typing/wochenrhythmus.ts`). Punktgenau
   * braucht sie, damit seine Wochenaufgabe an DERSELBEN Wochengrenze endet wie
   * die von Tastenflow - eine Klasse, zwei Programme, eine Woche.
   *
   * Eingestellt werden sie im Reiter „Tastenflow", und nur dort. Wer sie hier
   * schriebe, hätte eine zweite Stelle für dieselbe Wahrheit
   * ([[feedback_zwei_stellen_die_voneinander_nichts_wissen]]).
   */
  unterrichtstag?: number | null;
  unterrichtstagAbMs?: number | null;
  unterrichtsende?: number | null;
}

/** Was die Lehrkraft für EIN Kind abweichend von der Klasse festlegt. */
export interface PunktgenauKindplan {
  wochenaufgabe?: Wochenaufgabe;
}

/**
 * Der Punktgenau-Plan einer Klasse: was je Woche zu tun ist und welche
 * Etappen offen sind - für alle, und je Kind abweichend.
 *
 * ★ Warum die Kinder-Abweichungen an der KLASSE hängen und nicht am Konto:
 * `tt_pupils` ist die gemeinsame Konten-Tabelle aller Programme; ein neues
 * Feld dort erzwingt eine Server-Schema-Änderung und damit die Deploy-Art
 * »Update LMS (komplett)«. `tt_classes.settings` ist ein JSON-Feld, das es
 * seit dem 02.07.2026 gibt - derselbe Weg, den Tastenflow am 01.09.2026 für
 * seinen Wochenrhythmus gewählt hat.
 */
export interface PunktgenauKlassenplan {
  /** Gilt für alle Kinder der Klasse, solange nichts Eigenes eingetragen ist. */
  wochenaufgabe?: Wochenaufgabe;
  /** Abweichungen je Kind - Schlüssel ist die Konto-id. */
  kinder?: Record<string, PunktgenauKindplan>;
  /**
   * ★★★ NEU (22.09.2026 Zubau): die aktuell geplante/laufende
   * Braille-Challenge - Form aus `challenge.ts` (`ChallengePlan`). `undefined`
   * = keine Challenge geplant.
   */
  challenge?: ChallengePlan;
  /**
   * ★ NEU (22.09.2026 Zubau): Das Klassenmatch für diese Klasse abgeschaltet?
   * Siehe `klassenmatch.ts` (`klassenmatchErlaubt`). Eigenes Feld je Programm
   * - NICHT dasselbe wie `tt_classes.klassenmatchAus` (das gehört Tastenflow).
   */
  klassenmatchAus?: boolean;
}

export interface BrailleClass {
  code: string; // Beitritts-Code
  name: string;
  teacherId: string;
  createdAt: number;
  settings?: BrailleClassSettings;
}

/** Telemetrie je Aufgabe — Grundlage für Statistik + Eigenständigkeits-Check. */
export interface TaskEvent {
  ts: number;
  level: string;
  system: string;
  direction: "write" | "read";
  correct: boolean;
  ms: number; // Bearbeitungszeit (fair, ggf. Vorlesezeit abgezogen)
  /**
   * TASTENZEIT seit dem letzten Ereignis (ms) - dasselbe Feld wie bei Tastenflow,
   * gerechnet von der Tastenuhr (`lib/tastenuhr.ts`): nur Zeit kurz nach einem
   * Anschlag. `ms` oben ist die Bearbeitungszeit der Aufgabe MIT Nachdenken und
   * Pausen - „Programm offen", kein Üben. Fehlt bei allen Ereignissen vor dem
   * 21.09.2026 und wenn keine Seite die Uhr angeschlossen hatte.
   */
  activeMs?: number;
  cells: number; // Länge der Aufgabe in Zellen
  pasted?: boolean; // Einfügen erkannt
  blurred?: boolean; // Fokus/Fenster gewechselt
  /** Aus der Antwortzeit abgezogene Vorlese-/Ansagezeit (ms). Doku-Feld. */
  spokenMs?: number;
  /** Die tatsächlich getippte Einheit bei Fehler (Verwechsler-Tracking). */
  typed?: string;
  /** Soll-Einheit an dieser Stelle (für Verwechsler-Matrix). */
  unit?: string;
}

/** Eine Zeile aus `br_eigene_texte` - lokale Fassung (Zeilen liegen direkt am Datensatz). */
interface EigeneTexteZeileLocal {
  id: string;
  classCode: string;
  teacherUid: string;
  dateiname: string;
  arbeitsweise: Arbeitsweise;
  bereich: AreaKey;
  aktiv: boolean;
  gestartetMs: number;
  zeilen: string[];
}

interface StoreData {
  accounts: Record<string, BrailleAccount>;
  classes: Record<string, BrailleClass>; // key = code
  secrets: Record<string, string>; // accountId → Hash (nur lokal/Test)
  progress: Record<string, BrailleProgress>;
  events: Record<string, TaskEvent[]>;
  // ── Zubau 22.09.2026 ───────────────────────────────────────────────────────
  /** `br_challenges` - Schlüssel `${probeId}::${pupilUid}` (= der eindeutige Index am Server). */
  challenges: Record<string, ChallengeErgebnis>;
  /** `br_matches`. */
  matches: Record<string, BrailleMatch>;
  /** `br_match_stand` - Schlüssel `${matchId}::${pupilUid}` (= der eindeutige Index am Server). */
  matchStand: Record<string, BrailleMatchStand>;
  /** `br_eigene_texte` - die Zeilen SIND die Reihe (siehe `eigeneUebung.ts`). */
  eigeneTexte: Record<string, EigeneTexteZeileLocal>;
  /** „Fertig" je Kind (Schlüssel) und Text - am Konto, nicht am Gerät. */
  eigeneUebungFertig: Record<string, Record<string, boolean>>;
}

const KEY = "braille-trainer:store:v1";
const MAX_EVENTS = 1000;

function emptyStore(): StoreData {
  return {
    accounts: {},
    classes: {},
    secrets: {},
    progress: {},
    events: {},
    challenges: {},
    matches: {},
    matchStand: {},
    eigeneTexte: {},
    eigeneUebungFertig: {},
  };
}

function load(): StoreData {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptyStore();
    return { ...emptyStore(), ...(JSON.parse(raw) as Partial<StoreData>) };
  } catch {
    return emptyStore();
  }
}

function save(data: StoreData): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* localStorage nicht verfügbar */
  }
}

/** Nicht umkehrbarer Hash (NUR lokaler Test-Platzhalter, kein echter Schutz). */
function hashSecret(pw: string): string {
  let h = 5381;
  for (let i = 0; i < pw.length; i++) h = ((h << 5) + h + pw.charCodeAt(i)) >>> 0;
  return "h" + h.toString(36);
}

let counter = 0;
function genId(prefix: string): string {
  counter += 1;
  return `${prefix}_${Date.now().toString(36)}_${counter}`;
}

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // ohne I/O/0/1
function genClassCode(taken: Record<string, unknown>): string {
  for (let tries = 0; tries < 50; tries++) {
    let c = "";
    for (let i = 0; i < 6; i++)
      c += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
    if (!taken[c]) return c;
  }
  return "K" + Date.now().toString(36).toUpperCase();
}

export type Result<T> = { ok: true; value: T } | { ok: false; error: string };

/**
 * Eigenes Passwort ändern (LOKALER Speicher). Auf dem Server erledigt das die
 * geteilte PocketBase-Sitzung (`lib/lernwerkstatt/passwort.ts`) — hier zählt
 * nur der Testbetrieb ohne Server. Mindestlänge nach Rolle: Lehrkraft 6, Kind 4.
 */
export function changeOwnPasswordLocal(
  accountId: string,
  oldPassword: string,
  newPassword: string,
): Result<true> {
  const data = load();
  const acc = data.accounts[accountId];
  if (!acc) return { ok: false, error: "Bitte zuerst anmelden." };
  const min = acc.role === "lehrkraft" ? 6 : 4;
  if (newPassword.length < min)
    return { ok: false, error: `Das neue Passwort braucht mindestens ${min} Zeichen.` };
  if (data.secrets[accountId] !== hashSecret(oldPassword))
    return { ok: false, error: "Das aktuelle Passwort stimmt nicht." };
  data.secrets[accountId] = hashSecret(newPassword);
  save(data);
  return { ok: true, value: true };
}

// --- Lehrkraft ---------------------------------------------------------------
export function registerTeacher(
  name: string,
  email: string,
  password: string,
): Result<BrailleAccount> {
  const data = load();
  const mail = email.trim().toLowerCase();
  if (!name.trim()) return { ok: false, error: "Bitte einen Namen angeben." };
  if (!mail.includes("@")) return { ok: false, error: "Bitte eine gültige E-Mail angeben." };
  if (password.length < 6)
    return { ok: false, error: "Das Passwort braucht mindestens 6 Zeichen." };
  if (Object.values(data.accounts).some((a) => a.role === "lehrkraft" && a.email === mail))
    return { ok: false, error: "Für diese E-Mail gibt es schon ein Konto." };
  const acc: BrailleAccount = {
    id: genId("le"),
    role: "lehrkraft",
    name: name.trim(),
    email: mail,
    createdAt: Date.now(),
  };
  data.accounts[acc.id] = acc;
  data.secrets[acc.id] = hashSecret(password);
  save(data);
  return { ok: true, value: acc };
}

export function loginTeacher(email: string, password: string): Result<BrailleAccount> {
  const data = load();
  const mail = email.trim().toLowerCase();
  const acc = Object.values(data.accounts).find(
    (a) => a.role === "lehrkraft" && a.email === mail,
  );
  if (!acc || data.secrets[acc.id] !== hashSecret(password))
    return { ok: false, error: "E-Mail oder Passwort stimmt nicht." };
  return { ok: true, value: acc };
}

// --- Klassen -----------------------------------------------------------------
// Erlaubter Wunsch-Code: 2–12 Zeichen, Buchstaben/Ziffern/Punkt/Bindestrich
// (z. B. „3.MS"). Wird groß geschrieben gespeichert — die Schüler-Anmeldung
// vergleicht ebenfalls in Großbuchstaben.
const CLASS_CODE_RE = /^[A-Z0-9.-]{2,12}$/;

export function createClass(
  teacherId: string,
  name: string,
  code?: string,
): Result<BrailleClass> {
  const data = load();
  if (!name.trim()) return { ok: false, error: "Bitte einen Klassennamen angeben." };

  let finalCode: string;
  const wish = (code ?? "").trim().toUpperCase();
  if (wish) {
    if (!CLASS_CODE_RE.test(wish))
      return {
        ok: false,
        error:
          "Der Code darf 2–12 Zeichen haben: Buchstaben, Ziffern, Punkt oder Bindestrich.",
      };
    if (data.classes[wish])
      return { ok: false, error: "Diesen Code gibt es schon — bitte einen anderen wählen." };
    finalCode = wish;
  } else {
    finalCode = genClassCode(data.classes);
  }

  const cls: BrailleClass = {
    code: finalCode,
    name: name.trim(),
    teacherId,
    createdAt: Date.now(),
  };
  data.classes[cls.code] = cls;
  save(data);
  return { ok: true, value: cls };
}

export function listClasses(teacherId: string): BrailleClass[] {
  return Object.values(load().classes)
    .filter((c) => c.teacherId === teacherId)
    .sort((a, b) => a.createdAt - b.createdAt);
}

/**
 * ★★★★★ EINSTELLUNGEN ZUSAMMENFÜHREN, NICHT ÜBERSCHREIBEN (Befund 07.09.2026).
 *
 * `tt_classes.settings` ist EIN JSON-Topf für die ganze Klasse - und mehrere
 * Programme legen etwas hinein. Tastenflow schreibt seit dem 01.09.2026 den
 * Unterrichtstag dorthin (`unterrichtstag`, `unterrichtstagAbMs`,
 * `unterrichtsende`) und verschiebt damit die Wochengrenze der Klasse.
 *
 * Bis heute ersetzte Punktgenau beim Speichern den GANZEN Topf durch seine
 * drei Schalter. Ein Häkchen im Punktgenau-Reiter löschte damit den
 * Unterrichtstag der Klasse - Tastenflows Wochenaufgabe fiel still auf „Montag
 * bis Sonntag" zurück, und niemand hätte den Zusammenhang gesehen.
 *
 * Diese Funktion ist die EINE Stelle, an der das Zusammenführen passiert; der
 * lokale und der Server-Weg rufen beide sie. Zwei Abschriften wären genau die
 * Doppelung, die einander nicht kennt
 * ([[feedback_zwei_stellen_die_voneinander_nichts_wissen]]).
 *
 * ⚠️ `undefined` LÖSCHT NICHT: Ein Schlüssel, der im Änderungswunsch gar nicht
 * vorkommt, bleibt so stehen, wie er war. Sonst hieße „speichere den
 * Wochenplan" nebenbei „lösche alles, was du nicht mitgeschickt hast".
 */
export function einstellungenZusammenfuehren(
  alt: Record<string, unknown> | BrailleClassSettings | null | undefined,
  teil: Partial<BrailleClassSettings>,
): Record<string, unknown> {
  const neu: Record<string, unknown> = { ...((alt ?? {}) as Record<string, unknown>) };
  for (const [k, v] of Object.entries(teil)) {
    if (v !== undefined) neu[k] = v;
  }
  return neu;
}

/** Lern-Einstellungen einer Klasse setzen (nur die eigene Lehrkraft). */
export function updateClassSettings(
  teacherId: string,
  classCode: string,
  settings: BrailleClassSettings,
): Result<BrailleClass> {
  const data = load();
  const cls = data.classes[classCode];
  if (!cls) return { ok: false, error: "Diese Klasse gibt es nicht." };
  if (cls.teacherId !== teacherId)
    return { ok: false, error: "Nur die eigene Lehrkraft darf das ändern." };
  // ★★★ Siehe `einstellungenZusammenfuehren` - dieselbe Regel wie am Server.
  cls.settings = einstellungenZusammenfuehren(
    cls.settings,
    settings,
  ) as BrailleClassSettings;
  save(data);
  return { ok: true, value: cls };
}

/** Lern-Einstellungen der eigenen Klasse lesen (Kind-Sicht). */
export function getClassSettings(classCode: string): BrailleClassSettings | null {
  const cls = load().classes[classCode];
  if (!cls) return null;
  return cls.settings ?? null;
}

// --- Schüler:innen -----------------------------------------------------------
export function addPupil(
  classCode: string,
  name: string,
  password: string,
): Result<BrailleAccount> {
  const data = load();
  const cls = data.classes[classCode];
  if (!cls) return { ok: false, error: "Diese Klasse gibt es nicht." };
  if (!name.trim()) return { ok: false, error: "Bitte einen Namen angeben." };
  if (password.length < 4)
    return { ok: false, error: "Das Passwort braucht mindestens 4 Zeichen." };
  const exists = Object.values(data.accounts).some(
    (a) => a.role === "schueler" && a.classCode === classCode && a.name === name.trim(),
  );
  if (exists) return { ok: false, error: "Diesen Namen gibt es in der Klasse schon." };
  const acc: BrailleAccount = {
    id: genId("sc"),
    role: "schueler",
    name: name.trim(),
    classCode,
    createdAt: Date.now(),
  };
  data.accounts[acc.id] = acc;
  data.secrets[acc.id] = hashSecret(password);
  save(data);
  return { ok: true, value: acc };
}

export function loginPupil(
  classCode: string,
  name: string,
  password: string,
): Result<BrailleAccount> {
  const data = load();
  const acc = Object.values(data.accounts).find(
    (a) =>
      a.role === "schueler" &&
      a.classCode === classCode.trim().toUpperCase() &&
      a.name.toLowerCase() === name.trim().toLowerCase(),
  );
  if (!acc || data.secrets[acc.id] !== hashSecret(password))
    return { ok: false, error: "Klassencode, Name oder Passwort stimmt nicht." };
  return { ok: true, value: acc };
}

export function listPupils(classCode: string): BrailleAccount[] {
  return Object.values(load().accounts)
    .filter((a) => a.role === "schueler" && a.classCode === classCode)
    .sort((a, b) => a.name.localeCompare(b.name, "de"));
}

export function getAccount(id: string): BrailleAccount | null {
  return load().accounts[id] ?? null;
}

/**
 * Spendenbanner-Zustand EINES Kontos lesen (Nachbesserung 19.09.2026) - das
 * lokale/Mock-Gegenstück zu `tt_teachers`/`tt_pupils.spendenAufrufAm`/
 * `spendenAufrufMeilenstein` am echten Server. `null`, solange der Banner
 * noch nie gezeigt wurde oder das Konto nicht existiert.
 */
export function getSpendenbannerZustand(accountId: string): SpendenBannerZustand | null {
  const acc = load().accounts[accountId];
  if (!acc) return null;
  const gespendetMs = (acc.gespendetAm ?? 0) > 0 ? acc.gespendetAm : undefined;
  // ★ 19.09.2026: Eine bestätigte Spende zählt auch dann, wenn der Banner
  // selbst noch nie gezeigt wurde.
  if (!acc.spendenAufrufMeilenstein && !gespendetMs) return null;
  return {
    meilensteinH: acc.spendenAufrufMeilenstein ?? 0,
    zuletztGezeigtMs: acc.spendenAufrufAm ?? 0,
    ...(gespendetMs ? { gespendetMs } : {}),
  };
}

/** Spendenbanner-Zustand EINES Kontos schreiben - siehe {@link getSpendenbannerZustand}. */
export function setSpendenbannerZustand(
  accountId: string,
  meilensteinH: number,
  zuletztGezeigtMs: number,
): BrailleAccount | null {
  const data = load();
  const acc = data.accounts[accountId];
  if (!acc) return null;
  acc.spendenAufrufMeilenstein = meilensteinH;
  acc.spendenAufrufAm = zuletztGezeigtMs;
  data.accounts[accountId] = acc;
  save(data);
  return acc;
}

/**
 * ★★★★★ Eine BESTÄTIGTE Spende am Konto merken (19.09.2026) - das
 * lokale/Mock-Gegenstück zu `tt_teachers`/`tt_pupils.gespendetAm`. Danach
 * liefert {@link getSpendenbannerZustand} `gespendetMs`, und der Banner kommt
 * nie wieder (`spendenBannerFaellig`).
 */
export function setGespendetAm(accountId: string, gespendetMs: number): BrailleAccount | null {
  const data = load();
  const acc = data.accounts[accountId];
  if (!acc) return null;
  acc.gespendetAm = gespendetMs;
  data.accounts[accountId] = acc;
  save(data);
  return acc;
}

// --- Klassencode auf dem Gerät merken ----------------------------------------
// Der Klassencode ist für alle Schüler:innen einer Klasse gleich. Damit ihn
// niemand neu eintippen muss, merkt sich der Browser den zuletzt benutzten Code;
// beim nächsten Anmelden reicht dann Name + Passwort. (Nur der Code, NICHT Name
// oder Passwort — auf einem geteilten Klassenrechner soll jede:r selbst anmelden.)
const LAST_CODE_KEY = "braille-trainer:lastClassCode";

export function rememberClassCode(code: string): void {
  try {
    localStorage.setItem(LAST_CODE_KEY, code.trim().toUpperCase());
  } catch {
    /* localStorage nicht verfügbar */
  }
}

export function getRememberedClassCode(): string {
  try {
    return localStorage.getItem(LAST_CODE_KEY) ?? "";
  } catch {
    return "";
  }
}

export function forgetClassCode(): void {
  try {
    localStorage.removeItem(LAST_CODE_KEY);
  } catch {
    /* localStorage nicht verfügbar */
  }
}

// --- Fortschritt + Telemetrie ------------------------------------------------
export function getProgress(accountId: string): BrailleProgress {
  return load().progress[accountId] ?? emptyProgress();
}

export function saveAccountProgress(accountId: string, progress: BrailleProgress): void {
  const data = load();
  data.progress[accountId] = progress;
  save(data);
}

export function recordEvent(accountId: string, event: TaskEvent): void {
  const data = load();
  const list = data.events[accountId] ?? [];
  list.push(event);
  if (list.length > MAX_EVENTS) list.splice(0, list.length - MAX_EVENTS);
  data.events[accountId] = list;
  save(data);
}

export function getEvents(accountId: string): TaskEvent[] {
  return load().events[accountId] ?? [];
}

// --- Statistik + Eigenständigkeits-Check (KI-Erkennung) ----------------------
export interface PupilStats {
  tasks: number;
  correct: number;
  accuracy: number; // 0..1
  avgMs: number;
  lastActive: number | null;
  suspicion: { score: number; reasons: string[] }; // 1..10
}

/** Statistik aus einer (bereits geladenen) Ereignisliste — reine Funktion, damit
 *  sie sowohl der lokale (synchrone) als auch der Server-Pfad (async geladen)
 *  nutzen kann. */
export function statsFromEvents(ev: readonly TaskEvent[]): PupilStats {
  const tasks = ev.length;
  const correct = ev.filter((e) => e.correct).length;
  const accuracy = tasks ? correct / tasks : 0;
  const avgMs = tasks ? ev.reduce((s, e) => s + e.ms, 0) / tasks : 0;
  const lastActive = tasks ? Math.max(...ev.map((e) => e.ts)) : null;
  return { tasks, correct, accuracy, avgMs, lastActive, suspicion: suspicionScore(ev) };
}

export function pupilStats(accountId: string): PupilStats {
  return statsFromEvents(getEvents(accountId));
}

/**
 * Eigenständigkeits-/KI-Verdacht 1–10 aus Signalen. Hoch = auffällig.
 * Beobachtbar: Einfügen, Fokuswechsel, unplausibel schnelle korrekte Eingaben,
 * makellose Trefferquote bei sehr hohem Tempo (kein Lernverlauf).
 */
export function suspicionScore(events: readonly TaskEvent[]): {
  score: number;
  reasons: string[];
} {
  if (events.length < 5) return { score: 1, reasons: ["Noch zu wenige Daten."] };
  const reasons: string[] = [];
  let score = 1;

  const pastes = events.filter((e) => e.pasted).length;
  if (pastes > 0) {
    score += Math.min(4, pastes);
    reasons.push(`${pastes}× Einfügen (Paste) erkannt.`);
  }

  const blurs = events.filter((e) => e.blurred).length;
  const blurRate = blurs / events.length;
  if (blurRate > 0.2) {
    score += 2;
    reasons.push(`Häufiger Fokus-/Fensterwechsel (${Math.round(blurRate * 100)} %).`);
  }

  // unplausibel schnell: korrekt in < 250 ms pro Zelle
  const fast = events.filter((e) => e.correct && e.ms / Math.max(1, e.cells) < 250).length;
  const fastRate = fast / events.length;
  if (fastRate > 0.3) {
    score += 3;
    reasons.push(`Sehr viele unplausibel schnelle Treffer (${Math.round(fastRate * 100)} %).`);
  }

  const acc = events.filter((e) => e.correct).length / events.length;
  if (acc > 0.97 && fastRate > 0.2) {
    score += 1;
    reasons.push("Makellose Trefferquote bei hohem Tempo — kein Lernverlauf.");
  }

  if (reasons.length === 0) reasons.push("Unauffällig.");
  return { score: Math.max(1, Math.min(10, score)), reasons };
}

// ════════════════════════════════════════════════════════════════════════════
// ZUBAU 22.09.2026: BRAILLE-CHALLENGE, KLASSENMATCH, EIGENE ÜBUNGEN
// ════════════════════════════════════════════════════════════════════════════
// LOKALE Fassung - das Gegenstück zu `pbBackend.ts`. Beide benutzen dieselbe
// reine Logik aus `challenge.ts`/`klassenmatch.ts`/`eigeneUebung.ts` und
// müssen darum dasselbe tun (Wächter: `tests/braille-backend-wettkampf.test.ts`).

let wettkampfCounter = 0;
function genWettkampfId(prefix: string): string {
  wettkampfCounter += 1;
  return `${prefix}${Date.now().toString(36)}${wettkampfCounter}`;
}

// ── Der Punktgenau-Plan der Klasse (Challenge + Klassenmatch-Häkchen) ───────

function punktgenauPlanVon(cls: BrailleClass): PunktgenauKlassenplan {
  return cls.settings?.punktgenau ?? {};
}

/**
 * ★★★ Ein Teil des Punktgenau-Plans schreiben, OHNE den Rest zu verlieren -
 * zwei Ebenen zusammenführen: `settings.punktgenau` selbst ist ein Schlüssel
 * in `einstellungenZusammenfuehren` (Tastenflow-Nachbarn bleiben stehen), UND
 * innerhalb von `punktgenau` bleiben `wochenaufgabe`/`kinder` stehen, wenn nur
 * `challenge` oder `klassenmatchAus` gesetzt wird.
 */
function schreibePunktgenauPlan(
  teacherId: string,
  classCode: string,
  teil: Partial<PunktgenauKlassenplan>,
): Result<BrailleClass> {
  const data = load();
  const cls = data.classes[classCode];
  if (!cls) return { ok: false, error: "Diese Klasse gibt es nicht." };
  if (cls.teacherId !== teacherId)
    return { ok: false, error: "Nur die eigene Lehrkraft darf das ändern." };
  const neuerPlan: PunktgenauKlassenplan = { ...punktgenauPlanVon(cls), ...teil };
  cls.settings = einstellungenZusammenfuehren(cls.settings, {
    punktgenau: neuerPlan,
  }) as BrailleClassSettings;
  save(data);
  return { ok: true, value: cls };
}

/** Challenge-Plan der Klasse setzen (Lehrkraft) - `null` beendet die Runde wieder. */
export function setChallengePlan(
  teacherId: string,
  classCode: string,
  plan: ChallengePlan | null,
): Result<true> {
  const r = schreibePunktgenauPlan(teacherId, classCode, { challenge: plan ?? undefined });
  return r.ok ? { ok: true, value: true } : r;
}

/** Klassenmatch für diese Klasse an-/abschalten (Lehrkraft). */
export function setKlassenmatchAus(
  teacherId: string,
  classCode: string,
  aus: boolean,
): Result<true> {
  const r = schreibePunktgenauPlan(teacherId, classCode, { klassenmatchAus: aus });
  return r.ok ? { ok: true, value: true } : r;
}

/** Ist das Klassenmatch für diese Klasse gerade erlaubt? Unlesbare Klasse ⇒ erlaubt (fail-open, Muster Server-Hook). */
export function istKlassenmatchErlaubt(classCode: string): boolean {
  const cls = load().classes[classCode];
  return cls?.settings?.punktgenau?.klassenmatchAus !== true;
}

// ── Braille-Challenge: EINE Abgabe je Kind und Runde ────────────────────────

/**
 * ★★★ Zweimal abgeben ist unmöglich - derselbe Riegel wie am Server (der
 * eindeutige Index über `pupilUid`+`probeId`, siehe `setup.mjs`): Der
 * Schlüssel dieses Eintrags IST diese Kombination, ein zweiter Versuch findet
 * darum immer den ersten und wird abgewiesen.
 */
export function meldeChallengeErgebnis(ergebnis: ChallengeErgebnis): Result<true> {
  const data = load();
  const key = `${ergebnis.probeId}::${ergebnis.pupilUid}`;
  if (data.challenges[key]) {
    return { ok: false, error: "Diese Braille-Challenge hast du schon abgegeben." };
  }
  data.challenges[key] = ergebnis;
  save(data);
  return { ok: true, value: true };
}

/** Hat DIESES Kind DIESE Runde schon abgegeben? `null`, wenn nicht. */
export function holeChallengeErgebnis(pupilUid: string, probeId: string): ChallengeErgebnis | null {
  return load().challenges[`${probeId}::${pupilUid}`] ?? null;
}

/** Alle Abgaben einer Runde (Lehrkraft-Übersicht). */
export function listeChallengeErgebnisse(classCode: string, probeId: string): ChallengeErgebnis[] {
  return Object.values(load().challenges).filter(
    (e) => e.classCode === classCode && e.probeId === probeId,
  );
}

/**
 * ★ Zubau 22.09.2026: DER VERLAUF - alle Abgaben einer Klasse, über ALLE
 * Runden hinweg (nicht nur ein `probeId`), jüngste zuerst. Fundament für
 * `challengeVerlauf.ts` (`challengeRunden`), das daraus die Runden-Übersicht
 * mit ihrer Entwicklung baut - siehe Bericht des bauenden Agenten.
 */
export function listeChallengeVerlaufKlasse(classCode: string): ChallengeErgebnis[] {
  return Object.values(load().challenges)
    .filter((e) => e.classCode === classCode)
    .sort((a, b) => b.eingereichtMs - a.eingereichtMs);
}

/**
 * ★ Zubau 22.09.2026: DER VERLAUF - alle Abgaben EINES Kindes, über ALLE
 * Runden UND alle Klassen hinweg, jüngste zuerst. Für eine künftige eigene
 * Statistik des Kindes (`src/components/braille/**`, ausserhalb der
 * Dateihoheit dieses Zubaus - siehe Bericht).
 */
export function listeChallengeVerlaufKind(pupilUid: string): ChallengeErgebnis[] {
  return Object.values(load().challenges)
    .filter((e) => e.pupilUid === pupilUid)
    .sort((a, b) => b.eingereichtMs - a.eingereichtMs);
}

// ── Klassenmatch: anlegen, beitreten, fortschreiben, absagen ───────────────

/** Ein Match ausschreiben - nur ein Kind einer Klasse, und nur wenn erlaubt (F8). */
export function erstelleMatch(
  account: BrailleAccount,
  arbeitsweise: Arbeitsweise,
  bereich: AreaKey,
): Result<BrailleMatch> {
  if (account.role !== "schueler" || !account.classCode)
    return { ok: false, error: "Ein Klassenmatch kann nur ein Kind einer Klasse ausschreiben." };
  if (!istKlassenmatchErlaubt(account.classCode))
    return {
      ok: false,
      error: "Eure Lehrkraft hat das Klassenmatch für diese Klasse ausgeschaltet.",
    };
  const data = load();
  /*
    ★★★★★ EIN KIND, EIN MATCH (02.10.2026) - dieselbe Regel wie der Hook am
    Server (`brEinKindEinMatch` in `br_match_lib.pb.js`), mit demselben Satz.
  */
  const sperre = matchSperre(
    account.id,
    Object.values(data.matches).filter((m) => m.classCode === account.classCode),
    Object.values(data.matchStand).filter((st) => st.classCode === account.classCode),
    Date.now(),
  );
  if (sperre) return { ok: false, error: sperre };
  const match: BrailleMatch = {
    id: genWettkampfId("bm_"),
    classCode: account.classCode,
    hostUid: account.id,
    hostName: account.name,
    arbeitsweise,
    bereich,
    status: "einladung",
    startMs: 0,
    endeMs: 0,
    dauerMin: MATCH_DAUER_MIN,
    createdMs: Date.now(),
  };
  data.matches[match.id] = match;
  save(data);
  meldeMatchAenderung();
  return { ok: true, value: match };
}

export function listeMatches(classCode: string): BrailleMatch[] {
  return Object.values(load().matches).filter((m) => m.classCode === classCode);
}

/**
 * Zustand ändern (starten/absagen/fertig) - nur erlaubte Übergänge
 * (`erlaubterUebergang`, aus `klassenmatch.ts`, ungeändert benutzt). Beim
 * Übergang nach „countdown" setzt DIESE Funktion (der „Server") Start- und
 * Endzeitpunkt - genau wie am echten Server (`br_match.pb.js`), damit alle
 * Geräte von derselben Zahl rechnen.
 */
export function aktualisiereMatchStatus(matchId: string, nachher: MatchStatus): Result<BrailleMatch> {
  const data = load();
  const m = data.matches[matchId];
  if (!m) return { ok: false, error: "Dieses Klassenmatch gibt es nicht (mehr)." };
  if (nachher !== m.status && !erlaubterUebergang(m.status, nachher))
    return { ok: false, error: "Dieses Klassenmatch lässt sich so nicht ändern." };
  if (nachher === "countdown" && m.status === "einladung") {
    const dauerMin = m.dauerMin > 0 ? m.dauerMin : MATCH_DAUER_MIN;
    const start = Date.now() + MATCH_COUNTDOWN_MS;
    m.startMs = start;
    m.endeMs = start + dauerMin * 60_000;
    m.dauerMin = dauerMin;
  }
  m.status = nachher;
  data.matches[matchId] = m;
  save(data);
  meldeMatchAenderung();
  return { ok: true, value: m };
}

/** Die eigene Stand-Zeile schreiben (beitreten oder fortschreiben). */
export function schreibeMatchStand(
  account: BrailleAccount,
  matchId: string,
  werte: Pick<BrailleMatchStand, "status" | "lauf">,
): Result<BrailleMatchStand> {
  if (!account.classCode)
    return { ok: false, error: "Nur ein Kind einer Klasse kann an einem Klassenmatch teilnehmen." };
  const data = load();
  const match = data.matches[matchId];
  if (!match) return { ok: false, error: "Dieses Klassenmatch gibt es nicht (mehr)." };
  if (match.classCode !== account.classCode)
    return { ok: false, error: "Dieses Klassenmatch gehört zu einer anderen Klasse." };
  if (match.status === "fertig" || match.status === "abgebrochen")
    return { ok: false, error: "Dieses Klassenmatch ist schon vorbei." };
  const key = `${matchId}::${account.id}`;
  const bestehend = data.matchStand[key];
  /*
    ★★★★★ EIN KIND, EIN MATCH (02.10.2026): Wer NEU auf `dabei`/`schreibt`
    geht, darf in keinem ANDEREN offenen Match stecken - wie am Server
    (`brStandSperre` in `br_match_lib.pb.js`). Fortschreiben derselben
    Teilnahme kostet keine Prüfung; `eingeladen`/`abgelehnt` gehen immer.
  */
  const neuDabei = werte.status === "dabei" || werte.status === "schreibt";
  const warDabei = bestehend?.status === "dabei" || bestehend?.status === "schreibt";
  if (neuDabei && !warDabei) {
    const sperre = matchSperre(
      account.id,
      Object.values(data.matches).filter((m) => m.classCode === account.classCode),
      Object.values(data.matchStand).filter((st) => st.classCode === account.classCode),
      Date.now(),
      matchId,
    );
    if (sperre) return { ok: false, error: sperre };
  }
  const stand: BrailleMatchStand = {
    id: bestehend?.id ?? genWettkampfId("bs_"),
    matchId,
    classCode: account.classCode,
    pupilUid: account.id,
    name: account.name,
    status: werte.status,
    lauf: werte.lauf,
    updatedMs: Date.now(),
  };
  data.matchStand[key] = stand;
  save(data);
  meldeStandAenderung(matchId);
  return { ok: true, value: stand };
}

export function listeMatchStaende(matchId: string): BrailleMatchStand[] {
  return Object.values(load().matchStand).filter((s) => s.matchId === matchId);
}

// ── Echtzeit (lokal: ein einfacher Horcher, kein Netz) ──────────────────────
// Kein echtes Netz, darum auch kein „Netzaussetzer" - `listeMatches`/
// `listeMatchStaende` melden hier nie einen Fehler. Der Horcher meldet sich
// bei jeder lokalen Änderung UND bei `storage` (anderer Tab).

const matchHorcher = new Set<() => void>();
const standHorcher = new Map<string, Set<() => void>>();

function meldeMatchAenderung(): void {
  for (const h of matchHorcher) h();
}
function meldeStandAenderung(matchId: string): void {
  for (const h of standHorcher.get(matchId) ?? []) h();
}

export function beobachteMatchesLocal(
  classCode: string,
  beiAenderung: (match: BrailleMatch) => void,
): () => void {
  const lauf = () => {
    for (const m of listeMatches(classCode)) beiAenderung(m);
  };
  matchHorcher.add(lauf);
  lauf();
  const aufStorage = (e: StorageEvent) => {
    if (e.key === KEY) lauf();
  };
  if (typeof window !== "undefined") window.addEventListener("storage", aufStorage);
  return () => {
    matchHorcher.delete(lauf);
    if (typeof window !== "undefined") window.removeEventListener("storage", aufStorage);
  };
}

export function beobachteMatchStaendeLocal(
  matchId: string,
  beiAenderung: (stand: BrailleMatchStand) => void,
): () => void {
  const lauf = () => {
    for (const s of listeMatchStaende(matchId)) beiAenderung(s);
  };
  const menge = standHorcher.get(matchId) ?? new Set<() => void>();
  menge.add(lauf);
  standHorcher.set(matchId, menge);
  lauf();
  const aufStorage = (e: StorageEvent) => {
    if (e.key === KEY) lauf();
  };
  if (typeof window !== "undefined") window.addEventListener("storage", aufStorage);
  return () => {
    menge.delete(lauf);
    if (typeof window !== "undefined") window.removeEventListener("storage", aufStorage);
  };
}

// ── Eigene Übungen: die Reihe der Klasse (Zeilen SIND die Reihe) ───────────

function eintragVonZeile(z: EigeneTexteZeileLocal): EigeneUebungEintrag {
  return {
    textId: z.id,
    dateiname: z.dateiname,
    arbeitsweise: z.arbeitsweise,
    bereich: z.bereich,
    gestartetAm: z.gestartetMs,
    von: z.teacherUid,
  };
}

function eigeneUebungenAusStore(data: StoreData, classCode: string): EigeneUebungEintrag[] {
  return Object.values(data.eigeneTexte)
    .filter((z) => z.classCode === classCode && z.aktiv)
    .sort((a, b) => a.gestartetMs - b.gestartetMs)
    .map(eintragVonZeile);
}

export function listeEigeneUebungen(classCode: string): EigeneUebungEintrag[] {
  return eigeneUebungenAusStore(load(), classCode);
}

/**
 * Eine neue Übung anlegen und an die Reihe HÄNGEN. `reiheMitNeuer` (aus
 * `eigeneUebung.ts`, ungeändert benutzt) entscheidet, ob dadurch eine ältere
 * herausfällt (nur unter den `vonAllenFertig`, sonst die älteste überhaupt) -
 * diese Funktion setzt die herausgefallenen Zeilen danach auf `aktiv = false`.
 */
export function starteEigeneUebung(
  classCode: string,
  teacherId: string,
  eintrag: { dateiname: string; arbeitsweise: Arbeitsweise; bereich: AreaKey; zeilen: string[] },
  vonAllenFertig: readonly string[] = [],
): Result<EigeneUebungEintrag[]> {
  const data = load();
  const cls = data.classes[classCode];
  if (!cls) return { ok: false, error: "Diese Klasse gibt es nicht." };
  const bisherige = eigeneUebungenAusStore(data, classCode);
  const id = genWettkampfId("bt_");
  const zeile: EigeneTexteZeileLocal = {
    id,
    classCode,
    teacherUid: teacherId,
    dateiname: eintrag.dateiname,
    arbeitsweise: eintrag.arbeitsweise,
    bereich: eintrag.bereich,
    aktiv: true,
    gestartetMs: Date.now(),
    zeilen: eintrag.zeilen,
  };
  data.eigeneTexte[id] = zeile;
  const neu = eintragVonZeile(zeile);
  const reihe = reiheMitNeuer(bisherige, neu, vonAllenFertig);
  const bleibtDrin = new Set(reihe.map((e) => e.textId));
  for (const alt of bisherige) {
    if (!bleibtDrin.has(alt.textId)) {
      const row = data.eigeneTexte[alt.textId];
      if (row) row.aktiv = false;
    }
  }
  save(data);
  return { ok: true, value: reihe };
}

/** Eine Übung aus der Reihe nehmen ("Beenden" - Zeile bleibt liegen, nur `aktiv = false`). */
export function beendeEigeneUebung(classCode: string, textId: string): Result<EigeneUebungEintrag[]> {
  const data = load();
  const row = data.eigeneTexte[textId];
  if (!row || row.classCode !== classCode)
    return { ok: false, error: "Diese Übung gibt es in dieser Klasse nicht." };
  row.aktiv = false;
  save(data);
  return { ok: true, value: eigeneUebungenAusStore(data, classCode) };
}

export function leseEigenenText(textId: string): { dateiname: string; zeilen: string[] } | null {
  const row = load().eigeneTexte[textId];
  return row ? { dateiname: row.dateiname, zeilen: row.zeilen } : null;
}

// ── „Fertig" - je Kind UND je Text, am Konto ────────────────────────────────

/** Dieses Kind hat diesen Text einmal ganz geschrieben/gelesen. */
export function markiereEigeneUebungFertig(accountId: string, textId: string): boolean {
  const data = load();
  if (!data.eigeneTexte[textId]) return false;
  const je = (data.eigeneUebungFertig[accountId] ??= {});
  je[textId] = true;
  save(data);
  return true;
}

function fortschrittAusStore(data: StoreData, accountId: string): EigeneUebungFortschritt {
  const je = data.eigeneUebungFertig[accountId];
  if (!je) return {};
  const out: Record<string, { fertig: boolean }> = {};
  for (const [textId, fertig] of Object.entries(je)) if (fertig) out[textId] = { fertig: true };
  return out;
}

/** Der Fertig-Stand EINES Kindes über alle Texte. */
export function leseEigeneUebungFortschritt(accountId: string): EigeneUebungFortschritt {
  return fortschrittAusStore(load(), accountId);
}

/** Der Fertig-Stand ALLER Kinder einer Klasse (Lehrkraft-Übersicht: „n von m fertig"). */
export function leseEigeneUebungFortschritteDerKlasse(classCode: string): EigeneUebungFortschritt[] {
  const data = load();
  const kinder = Object.values(data.accounts).filter(
    (a) => a.role === "schueler" && a.classCode === classCode,
  );
  return kinder.map((k) => fortschrittAusStore(data, k.id));
}
