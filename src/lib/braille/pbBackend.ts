/**
 * PocketBase-Backend des Braille-Trainers — zentrale Server-Konten, damit sich
 * Schüler:innen von JEDEM Gerät anmelden können.
 *
 * GETEILTE Identität mit „Tastenflow" (dem Tipptrainer):
 *  • Eigener PocketBase-Client mit dem SELBEN authStore-Schlüssel `tt_pb_auth`
 *    wie Tastenflow → wer dort als Kind/Lehrkraft angemeldet ist, ist
 *    automatisch auch hier angemeldet (ein Login für beide Apps).
 *  • Authentifizierung gegen DIESELBEN Collections `tt_teachers`/`tt_pupils`,
 *    Klassen in `tt_classes`. Ein Kind/Lehrer existiert also nur EINMAL.
 *  • Nur die Lern-Daten sind getrennt: Braille-Fortschritt + Telemetrie liegen
 *    in EIGENEN Collections `br_progress`/`br_events` (Braille-Fortschritt ≠
 *    Tipp-Fortschritt). Die `tt_progress`/`tt_events` von Tastenflow bleiben
 *    unangetastet.
 *
 * Die Login-E-Mail der Kinder (`synthEmail`) wird aus Tastenflow importiert,
 * damit BEIDE Apps exakt dieselbe E-Mail bilden — sonst fände Braille ein in
 * Tastenflow angelegtes Kind nicht wieder.
 *
 * Collections/Regeln: siehe pocketbase/setup.mjs (adversarial getestet).
 * Siehe [[project_braille_trainer]], [[feedback_security_first]],
 * [[feedback_data_transparency]].
 */
import { changeOwnPasswordPb } from "@/lib/lernwerkstatt/passwort";
import PocketBase, { ClientResponseError, LocalAuthStore } from "pocketbase";
import type { RecordModel } from "pocketbase";
import {
  BrailleAccount,
  BrailleClass,
  BrailleClassSettings,
  Result,
  TaskEvent,
} from "./account";
import type { BrailleBackend } from "./backend";
import { einstellungenZusammenfuehren } from "./account";
import type { PunktgenauKindplan, PunktgenauKlassenplan } from "./account";
import { wochenaufgabeAusJson } from "./wochenaufgabe";
import { BrailleProgress, emptyProgress } from "./progress";
import { synthEmail, synthEmailVorG2Neun } from "@/lib/typing/pbBackend";
import { VORGABE_STUFE as TT_VORGABE_STUFE } from "@/lib/typing/account";
import { backendUrl } from "@/lib/adressen";
import type { SpendenBannerZielgruppe } from "@/lib/spendenbannerTexte";
import type { SpendenBannerZustand } from "@/lib/spendenbanner";
// ── Zubau 22.09.2026: Braille-Challenge, Klassenmatch, eigene Übungen ────────
// Nur BENUTZT, nicht geändert - die reine Logik bleibt bei
// `challenge.ts`/`klassenmatch.ts`/`eigeneUebung.ts`/`wertung.ts`.
import { challengePlanAusRoh, type ChallengePlan, type ChallengeErgebnis } from "./challenge";
import type { BrailleMatch, BrailleMatchStand, MatchStatus } from "./klassenmatch";
import { reiheMitNeuer, type EigeneUebungEintrag, type EigeneUebungFortschritt } from "./eigeneUebung";
import type { Arbeitsweise, LaufErgebnis } from "./wertung";
import type { AreaKey } from "./areas";
// GETEILTE Zeitmessung gegen die Server-Uhr - dieselbe Datei wie Tastenflows
// Klassenmatch (`serverUhr.ts`, dort ausführlich begründet): `startMs`/
// `endeMs` kommen vom Server, verglichen wird gegen `serverJetzt()`, nie
// gegen `Date.now()` des Geräts.
import { meldeServerZeit } from "@/lib/typing/serverUhr";
import { mitTastenzeit } from "../tastenuhr";

const MAX_EVENTS = 1000;
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // ohne I/O/0/1
const CLASS_CODE_RE = /^[A-Z0-9.-]{2,12}$/;

// Umbau Etappe 4c (2026-06-26) — Doppel-Schreiben auf das vereinheitlichte
// Lernwerkstatt-Modell. Kanonische Quelle ist `lw_progress`/`lw_events` (Feld
// `program="braille"`); die alten `br_progress`/`br_events` werden PARALLEL
// weitergeschrieben (Rückfallebene). Unterschied zum Tipp-Backend: die alten
// br_*-Tabellen haben KEIN classCode-Feld — nur die lw-Zeile bekommt den
// classCode (denormalisiert aus dem Kind-Profil) für den Co-Lehrkraft-Zugriff.
// Memory: project_lernwerkstatt_datenmodell.
const PROGRAM = "braille";

function genCode(): string {
  let c = "";
  for (let i = 0; i < 6; i++)
    c += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  return c;
}

function mapTeacher(rec: RecordModel): BrailleAccount {
  return {
    id: rec.id,
    role: "lehrkraft",
    name: rec.name as string,
    email: rec.email as string,
    // Spendenbanner (Nachbesserung 19.09.2026) - 0/fehlend = noch nie gezeigt.
    spendenAufrufAm: Number(rec.spendenAufrufAm) > 0 ? Number(rec.spendenAufrufAm) : 0,
    spendenAufrufMeilenstein:
      Number(rec.spendenAufrufMeilenstein) > 0 ? Number(rec.spendenAufrufMeilenstein) : 0,
    createdAt: (rec.createdAtMs as number) ?? 0,
  };
}

// Aus tt_pupils — die typing-spezifischen Felder (stufe/tempo/lang/goal*)
// interessieren den Braille-Trainer nicht und werden ignoriert.
function mapPupil(rec: RecordModel): BrailleAccount {
  return {
    id: rec.id,
    role: "schueler",
    name: rec.name as string,
    classCode: rec.classCode as string,
    selfManaged: !!rec.selfManaged,
    // Spendenbanner (Nachbesserung 19.09.2026) - nur bei `selfManaged` befüllt.
    spendenAufrufAm: Number(rec.spendenAufrufAm) > 0 ? Number(rec.spendenAufrufAm) : 0,
    spendenAufrufMeilenstein:
      Number(rec.spendenAufrufMeilenstein) > 0 ? Number(rec.spendenAufrufMeilenstein) : 0,
    createdAt: (rec.createdAtMs as number) ?? 0,
  };
}

function mapClass(rec: RecordModel): BrailleClass {
  return {
    code: rec.code as string,
    name: rec.name as string,
    teacherId: rec.teacherUid as string,
    createdAt: (rec.createdAtMs as number) ?? 0,
    settings: mapSettings(rec.settings),
  };
}

/** `settings`-JSON defensiv lesen (fehlend/kaputt → undefined = Standard). */
function mapSettings(raw: unknown): BrailleClassSettings | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const s = raw as Record<string, unknown>;
  const zahlOderNull = (v: unknown): number | null =>
    typeof v === "number" && Number.isFinite(v) ? v : null;
  return {
    extendedNumbers: s.extendedNumbers === true,
    expressComputer: s.expressComputer === true,
    // Default AN (fehlend/nicht false = Großschreibzeichen gesetzt) - siehe
    // `BrailleClassSettings.grossschreibzeichen`.
    grossschreibzeichen: s.grossschreibzeichen !== false,
    // ★ NEU 07.09.2026 - die Wochenaufgabe.
    punktgenau: klassenplanAusJson(s.punktgenau),
    // ⚠️ Gehört Tastenflow, wird hier nur GELESEN (siehe BrailleClassSettings):
    //    die Wochengrenze der Klasse gilt für beide Programme.
    unterrichtstag: zahlOderNull(s.unterrichtstag),
    unterrichtstagAbMs: zahlOderNull(s.unterrichtstagAbMs),
    unterrichtsende: zahlOderNull(s.unterrichtsende),
  };
}

/** Den Punktgenau-Plan aus fremdem JSON lesen - jeder Wert wird geprüft. */
function klassenplanAusJson(raw: unknown): PunktgenauKlassenplan | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const r = raw as Record<string, unknown>;
  const kinderRoh = r.kinder;
  const kinder: Record<string, PunktgenauKindplan> = {};
  if (kinderRoh && typeof kinderRoh === "object") {
    for (const [id, wert] of Object.entries(kinderRoh as Record<string, unknown>)) {
      if (!wert || typeof wert !== "object") continue;
      const k = wert as Record<string, unknown>;
      const plan: PunktgenauKindplan = {
        wochenaufgabe: wochenaufgabeAusJson(k.wochenaufgabe),
      };
      if (plan.wochenaufgabe) kinder[id] = plan;
    }
  }
  // ★ Zubau 22.09.2026: Challenge-Plan wehrhaft lesen - `challengePlanAusRoh`
  // (aus `challenge.ts`, ungeändert benutzt) verwirft jeden kaputten Wert.
  const challenge = challengePlanAusRoh(r.challenge) ?? undefined;
  const plan: PunktgenauKlassenplan = {
    wochenaufgabe: wochenaufgabeAusJson(r.wochenaufgabe),
    ...(Object.keys(kinder).length ? { kinder } : {}),
    ...(challenge ? { challenge } : {}),
    ...(r.klassenmatchAus === true ? { klassenmatchAus: true } : {}),
  };
  return plan;
}

function fail(error: string): Result<never> {
  return { ok: false, error };
}

// ── Zubau 22.09.2026: Braille-Challenge, Klassenmatch, eigene Übungen ───────

/** Eine Zahl vom Server - alles andere ist 0. Nie negativ (Muster `typing/pbBackend.ts`). */
function zahlAus(x: unknown): number {
  return typeof x === "number" && Number.isFinite(x) && x > 0 ? x : 0;
}

/**
 * Der Satz, den PocketBase zu einem Fehler mitschickt - der Hook formuliert
 * ihn für Kinder (Muster `typing/pbBackend.ts`, dort nicht exportiert, darum
 * hier noch einmal). Fehlt er, bleibt ein leerer Text; der Aufrufer setzt
 * dann seinen eigenen Satz.
 */
function serverMeldung(err: unknown): string {
  const e = err as { response?: { message?: unknown }; data?: { message?: unknown }; message?: unknown } | null;
  const aus = e?.response?.message ?? e?.data?.message ?? "";
  if (typeof aus === "string" && aus.trim() && !/^Something went wrong/i.test(aus)) return aus.trim();
  return "";
}

function mapChallengeErgebnis(rec: RecordModel): ChallengeErgebnis {
  const arbeitsweise: Arbeitsweise = rec.arbeitsweise === "lesen" ? "lesen" : "schreiben";
  const bereich = String(rec.bereich ?? "") as AreaKey;
  const lauf: LaufErgebnis = {
    arbeitsweise,
    bereich,
    arbeitszeitMs: zahlAus(rec.arbeitszeitMs),
    ansageMs: zahlAus(rec.ansageMs),
    richtig: zahlAus(rec.richtig),
    falsch: zahlAus(rec.falsch),
  };
  return {
    probeId: String(rec.probeId ?? ""),
    pupilUid: String(rec.pupilUid ?? ""),
    teacherUid: String(rec.teacherUid ?? ""),
    classCode: String(rec.classCode ?? ""),
    arbeitsweise,
    bereich,
    lauf,
    eingereichtMs: zahlAus(rec.eingereichtMs),
  };
}

/**
 * Eine Match-Zeile vom Server. Wehrhaft wie beim Tastenflow-Vorbild: ein
 * unbekannter Zustand gilt als `abgebrochen` - ein Match, dessen Zustand
 * niemand versteht, darf kein Kind vom Üben abhalten.
 */
function mapMatch(rec: RecordModel): BrailleMatch {
  const status = rec.status as string;
  return {
    id: rec.id,
    classCode: String(rec.classCode ?? ""),
    hostUid: String(rec.hostUid ?? ""),
    hostName: String(rec.hostName ?? ""),
    arbeitsweise: rec.arbeitsweise === "lesen" ? "lesen" : "schreiben",
    bereich: String(rec.bereich ?? "") as AreaKey,
    status:
      status === "einladung" || status === "countdown" || status === "laeuft" || status === "fertig"
        ? status
        : "abgebrochen",
    startMs: zahlAus(rec.startMs),
    endeMs: zahlAus(rec.endeMs),
    dauerMin: zahlAus(rec.dauerMin),
    createdMs: zahlAus(rec.createdMs),
  };
}

/**
 * Eine Stand-Zeile vom Server. `arbeitsweise`/`bereich` trägt die Zeile
 * selbst nicht (siehe `setup.mjs`, `br_match_stand`) - sie kommen vom Match,
 * das alle Kinder darin teilen, und werden darum übergeben statt gelesen.
 */
function mapMatchStand(rec: RecordModel, arbeitsweise: Arbeitsweise, bereich: AreaKey): BrailleMatchStand {
  const status = rec.status as string;
  return {
    id: rec.id,
    matchId: String(rec.matchId ?? ""),
    classCode: String(rec.classCode ?? ""),
    pupilUid: String(rec.pupilUid ?? ""),
    name: String(rec.name ?? ""),
    // ★ 02.10.2026: `eingeladen`/`abgelehnt` bleiben, was sie sind - bis dahin
    // wurde JEDER unbekannte Wert zu „dabei", und eine Einladung, über die noch
    // nicht entschieden ist, hätte als Teilnahme gezählt.
    status:
      status === "schreibt" || status === "fertig" || status === "eingeladen" || status === "abgelehnt"
        ? status
        : "dabei",
    lauf: {
      arbeitsweise,
      bereich,
      arbeitszeitMs: zahlAus(rec.arbeitszeitMs),
      ansageMs: zahlAus(rec.ansageMs),
      richtig: zahlAus(rec.richtig),
      falsch: zahlAus(rec.falsch),
    },
    updatedMs: zahlAus(rec.updatedMs),
  };
}

function mapEigeneUebungEintrag(rec: RecordModel): EigeneUebungEintrag {
  return {
    textId: rec.id,
    dateiname: String(rec.dateiname ?? ""),
    arbeitsweise: rec.arbeitsweise === "lesen" ? "lesen" : "schreiben",
    bereich: String(rec.bereich ?? "") as AreaKey,
    gestartetAm: zahlAus(rec.gestartetMs),
    von: String(rec.teacherUid ?? ""),
  };
}

/** Siehe `EigeneUebungFortschritt` (`eigeneUebung.ts`) - ein kaputter Eintrag fällt weg. */
function eigeneUebungFertigAusRoh(raw: unknown): EigeneUebungFortschritt {
  if (!raw || typeof raw !== "object") return {};
  const out: Record<string, { fertig: boolean }> = {};
  for (const [textId, wert] of Object.entries(raw as Record<string, unknown>)) {
    if (wert && typeof wert === "object" && (wert as Record<string, unknown>).fertig === true) {
      out[textId] = { fertig: true };
    }
  }
  return out;
}

export class PocketBaseBrailleBackend implements BrailleBackend {
  readonly kind = "pocketbase" as const;
  private pb: PocketBase;

  constructor() {
    const url = backendUrl();
    // GETEILTER authStore-Schlüssel mit Tastenflow → ein Login für beide
    // Apps. Weiterhin getrennt von der LMS-Sitzung.
    this.pb = new PocketBase(url, new LocalAuthStore("tt_pb_auth"));
    this.pb.autoCancellation(false);
  }

  // --- Sitzung ---------------------------------------------------------------
  currentAccount(): BrailleAccount | null {
    const rec = this.pb.authStore.record as RecordModel | null;
    if (!rec || !this.pb.authStore.isValid) return null;
    if (rec.collectionName === "tt_teachers") return mapTeacher(rec);
    if (rec.collectionName === "tt_pupils") return mapPupil(rec);
    return null;
  }

  logout(): void {
    this.pb.authStore.clear();
  }

  // --- Lehrkraft -------------------------------------------------------------
  async registerTeacher(name: string, email: string, password: string) {
    const mail = email.trim().toLowerCase();
    if (!name.trim()) return fail("Bitte einen Namen angeben.");
    if (!mail.includes("@")) return fail("Bitte eine gültige E-Mail angeben.");
    if (password.length < 6)
      return fail("Das Passwort braucht mindestens 6 Zeichen.");
    try {
      await this.pb.collection("tt_teachers").create({
        name: name.trim(),
        email: mail,
        password,
        passwordConfirm: password,
        createdAtMs: Date.now(),
      });
      const auth = await this.pb
        .collection("tt_teachers")
        .authWithPassword(mail, password);
      return { ok: true as const, value: mapTeacher(auth.record) };
    } catch (e) {
      if (e instanceof ClientResponseError && e.status === 400)
        return fail("Für diese E-Mail gibt es schon ein Konto.");
      return fail(
        "Konto konnte nicht erstellt werden. Ist der Server erreichbar?",
      );
    }
  }

  async loginTeacher(email: string, password: string) {
    try {
      const auth = await this.pb
        .collection("tt_teachers")
        .authWithPassword(email.trim().toLowerCase(), password);
      return { ok: true as const, value: mapTeacher(auth.record) };
    } catch {
      return fail("E-Mail oder Passwort stimmt nicht.");
    }
  }

  // „Passwort vergessen" — identisch zum Tipp-Backend (dieselbe tt_teachers-
  // Tabelle). Antwort verrät nicht, ob die Adresse existiert.
  async requestTeacherPasswordReset(email: string) {
    try {
      await this.pb.collection("tt_teachers").requestPasswordReset(email.trim().toLowerCase());
    } catch {
      // bewusst verschluckt
    }
    return { ok: true as const, value: true as const };
  }

  async confirmTeacherPasswordReset(token: string, newPassword: string) {
    if (newPassword.length < 6) return fail("Das Passwort braucht mindestens 6 Zeichen.");
    try {
      await this.pb
        .collection("tt_teachers")
        .confirmPasswordReset(token, newPassword, newPassword);
      return { ok: true as const, value: true as const };
    } catch (e) {
      if (e instanceof ClientResponseError && e.status === 400)
        return fail("Der Link ist ungültig oder abgelaufen. Bitte fordere einen neuen an.");
      return fail("Das Passwort konnte nicht gesetzt werden. Ist der Server erreichbar?");
    }
  }

  // --- Klassen ---------------------------------------------------------------
  async createClass(teacherId: string, name: string, code?: string) {
    if (!name.trim()) return fail("Bitte einen Klassennamen angeben.");
    const wish = (code ?? "").trim().toUpperCase();
    if (wish && !CLASS_CODE_RE.test(wish))
      return fail(
        "Der Code darf 2–12 Zeichen haben: Buchstaben, Ziffern, Punkt oder Bindestrich.",
      );
    // gewünschter Code: einmal versuchen; automatischer Code: mehrfach (Kollision).
    const tries = wish ? 1 : 8;
    for (let i = 0; i < tries; i++) {
      const finalCode = wish || genCode();
      try {
        const rec = await this.pb.collection("tt_classes").create({
          code: finalCode,
          name: name.trim(),
          teacherUid: teacherId,
          weeklyReport: false,
          createdAtMs: Date.now(),
          data: {},
        });
        return { ok: true as const, value: mapClass(rec) };
      } catch (e) {
        const dup = e instanceof ClientResponseError && e.status === 400;
        if (wish && dup)
          return fail("Diesen Code gibt es schon — bitte einen anderen wählen.");
        if (!dup)
          return fail(
            "Klasse konnte nicht angelegt werden. Ist der Server erreichbar?",
          );
        // sonst: automatischer Code kollidiert → nächster Versuch
      }
    }
    return fail("Es konnte kein freier Code erzeugt werden. Bitte erneut versuchen.");
  }

  async listClasses(teacherId: string) {
    const list = await this.pb.collection("tt_classes").getFullList({
      filter: this.pb.filter("teacherUid={:t}", { t: teacherId }),
      sort: "createdAtMs",
    });
    return list.map(mapClass);
  }

  async updateClassSettings(
    _teacherId: string,
    classCode: string,
    settings: BrailleClassSettings,
  ) {
    // Berechtigung erzwingen die Server-Regeln (Eigentümerin/Co-Lehrkraft
    // der Klasse) — nicht der Client-Parameter.
    try {
      const rec = await this.pb
        .collection("tt_classes")
        .getFirstListItem(this.pb.filter("code={:c}", { c: classCode }));
      /**
       * ★★★★★ Hier stand bis zum 07.09.2026 `update(rec.id, { settings })` -
       * das JSON-Feld wurde durch genau die drei Punktgenau-Schalter ERSETZT
       * und nahm dabei den Unterrichtstag der Klasse mit, den Tastenflow im
       * selben Feld ablegt. Die volle Begründung steht an
       * `einstellungenZusammenfuehren` (account.ts) - dort, wo die eine
       * Umsetzung wohnt.
       */
      const neu = einstellungenZusammenfuehren(
        rec.settings as Record<string, unknown> | null,
        settings,
      );
      const upd = await this.pb
        .collection("tt_classes")
        .update(rec.id, { settings: neu });
      return { ok: true as const, value: mapClass(upd) };
    } catch {
      return fail("Einstellungen konnten nicht gespeichert werden. Ist der Server erreichbar?");
    }
  }

  async getClassSettings(classCode: string) {
    // Kind-Sicht: die Server-Regel erlaubt genau die EIGENE Klasse
    // (classCode des Kind-Kontos = code). Fehler → Standard-Lernweg.
    try {
      const rec = await this.pb
        .collection("tt_classes")
        .getFirstListItem(this.pb.filter("code={:c}", { c: classCode }));
      return mapSettings(rec.settings) ?? null;
    } catch {
      return null;
    }
  }

  // --- Schüler:innen ---------------------------------------------------------
  async addPupil(classCode: string, name: string, password: string) {
    if (!name.trim()) return fail("Bitte einen Namen angeben.");
    if (password.length < 4)
      return fail("Das Passwort braucht mindestens 4 Zeichen.");
    const teacherUid = this.pb.authStore.record?.id;
    if (!teacherUid) return fail("Bitte zuerst als Lehrkraft anmelden.");
    try {
      // GETEILTES Kind: landet in tt_pupils und funktioniert damit auch in
      // Tastenflow. Die typing-Pflichtfelder bekommen sinnvolle Startwerte,
      // damit das Kind dort sauber erscheint (Stufe/Tempo/Ziele = Standard).
      const rec = await this.pb.collection("tt_pupils").create({
        name: name.trim(),
        classCode,
        teacherUid,
        // Vorgabe-Stufe von Tastenflow (S1, 15.08.2026: teens statt b).
        stufe: TT_VORGABE_STUFE,
        lang: "de",
        tempo: "normal",
        startUnits: 0,
        goalMinutes: 0,
        goalUnits: 0,
        createdAtMs: Date.now(),
        email: synthEmail(classCode, name),
        password,
        passwordConfirm: password,
      });
      return { ok: true as const, value: mapPupil(rec) };
    } catch (e) {
      if (e instanceof ClientResponseError && e.status === 400)
        return fail("Diesen Namen gibt es in der Klasse schon.");
      return fail("Schüler:in konnte nicht angelegt werden.");
    }
  }

  async loginPupil(classCode: string, name: string, password: string) {
    try {
      // ★ G2-NEUN (25.10.2026): zuerst die heutige Adresse, dann - nur wenn sie anders lautet - die von vor
      // G2-NEUN (kyrillische, griechische, ungarische ő ű … Namen, die vor der neuen Umschrift angelegt wurden).
      const neu = synthEmail(classCode, name);
      const alt = synthEmailVorG2Neun(classCode, name);
      const auth = await this.pb
        .collection("tt_pupils")
        .authWithPassword(neu, password)
        .catch((fehler: unknown) => {
          if (alt === neu) throw fehler;
          return this.pb.collection("tt_pupils").authWithPassword(alt, password);
        });
      await this.ensureRows(auth.record);
      return { ok: true as const, value: mapPupil(auth.record) };
    } catch {
      return fail("Klassencode, Name oder Passwort stimmt nicht.");
    }
  }

  /**
   * SELBSTLERNENDE: eigenes Konto anlegen (ohne Klasse, ohne Lehrkraft).
   * Erzeugt denselben `tt_pupils`-Datensatz wie Tastenflow — ein Konto für alle
   * vier Programme. Server-Prüfung: `tt_pupils_selfsignup`.
   */
  async registerPupilSelf(name: string, email: string, password: string) {
    const sauber = name.trim();
    const adresse = email.trim().toLowerCase();
    if (!sauber) return fail("Bitte gib deinen Namen an.");
    if (!adresse.includes("@")) return fail("Bitte gib eine gültige E-Mail-Adresse an.");
    if (password.length < 8) return fail("Das Passwort braucht mindestens 8 Zeichen.");
    try {
      await this.pb.collection("tt_pupils").create({
        email: adresse,
        emailVisibility: false,
        password,
        passwordConfirm: password,
        name: sauber,
        selfManaged: true,
        classCode: "",
        teacherUid: "",
        createdAtMs: Date.now(),
      });
    } catch (e) {
      const msg = String((e as { message?: string })?.message ?? "");
      if (/validation|email/i.test(msg)) {
        return fail(
          "Mit dieser E-Mail-Adresse gibt es schon ein Konto. Melde dich an oder nimm eine andere Adresse.",
        );
      }
      return fail("Das Konto konnte nicht angelegt werden.");
    }
    return this.loginPupilSelf(adresse, password);
  }

  /** SELBSTLERNENDE: Anmeldung mit der echten E-Mail-Adresse. */
  async loginPupilSelf(email: string, password: string) {
    try {
      const auth = await this.pb
        .collection("tt_pupils")
        .authWithPassword(email.trim().toLowerCase(), password);
      await this.ensureRows(auth.record);
      return { ok: true as const, value: mapPupil(auth.record) };
    } catch {
      return fail("E-Mail-Adresse oder Passwort stimmt nicht.");
    }
  }

  async listPupils(classCode: string) {
    const list = await this.pb.collection("tt_pupils").getFullList({
      filter: this.pb.filter("classCode={:c}", { c: classCode }),
      sort: "name",
    });
    return list.map(mapPupil);
  }

  // --- Fortschritt + Telemetrie ---------------------------------------------
  // Lesen: bevorzugt aus lw_progress (kanonisch), sonst aus der Alt-Tabelle
  // (Kind zwischen 4b und 4c angelegt → lw-Zeile evtl. noch nicht da).
  async getProgress(accountId: string): Promise<BrailleProgress> {
    const rec =
      (await this.findLwRow("lw_progress", accountId)) ??
      (await this.findOwnedRow("br_progress", accountId));
    if (rec?.data) return { ...emptyProgress(), ...(rec.data as object) };
    return emptyProgress();
  }

  async saveProgress(accountId: string, progress: BrailleProgress) {
    const classCode = (this.pb.authStore.record?.classCode as string) ?? "";
    const teacherUid = (this.pb.authStore.record?.teacherUid as string) ?? "";
    const now = Date.now();
    // Umbau Etappe 4d-Schritt2 (2026-06-26): nur noch kanonisch lw_progress.
    // br_progress bleibt als (eingefrorene) Sicherungs-Kopie liegen.
    //
    // ★★★ ZUSAMMENFÜHREN, NICHT ERSETZEN (Zubau 22.09.2026): `data` trägt seit
    // dem Zubau zusätzlich `eigeneUebungFertig` (siehe `meldeEigeneUebungFertig`
    // unten) - ein blindes Ersetzen durch nur die `BrailleProgress`-Felder
    // würde diese Marke beim nächsten ganz gewöhnlichen Speichern des
    // Lernstands löschen. Dieselbe Zeile wird ohnehin gleich gelesen
    // (`upsertLw` bräuchte sie sonst noch einmal) - darum wird sie hier
    // vorab geholt und weitergereicht, statt sie zweimal abzufragen.
    const bestehend = await this.findLwRow("lw_progress", accountId);
    const data = { ...((bestehend?.data as object | undefined) ?? {}), ...progress };
    await this.upsertLw("lw_progress", accountId, data, classCode, teacherUid, now, bestehend);
  }

  async recordEvent(accountId: string, event: TaskEvent) {
    const classCode = (this.pb.authStore.record?.classCode as string) ?? "";
    const teacherUid = (this.pb.authStore.record?.teacherUid as string) ?? "";
    const now = Date.now();
    // Kanonische Liste lesen (lw, sonst Alt), anhängen, kappen — dann dieselbe
    // Liste in BEIDE Tabellen schreiben (so bleiben sie identisch).
    const canonical =
      (await this.findLwRow("lw_events", accountId)) ??
      (await this.findOwnedRow("br_events", accountId));
    const list: TaskEvent[] = canonical?.data?.events ?? [];
    // ★ Tastenzeit seit dem letzten Ereignis (21.09.2026, Regel: Programm offen
    // ist kein Üben) - siehe `lib/tastenuhr.ts`.
    list.push(mitTastenzeit(event));
    if (list.length > MAX_EVENTS) list.splice(0, list.length - MAX_EVENTS);
    // Umbau 4d-Schritt2: nur noch lw_events (br_events = eingefrorene Sicherung).
    await this.upsertLw("lw_events", accountId, { events: list }, classCode, teacherUid, now);
  }

  /** Passwort des angemeldeten Kontos ändern — geteilte Umsetzung (10.08.2026). */
  async changeOwnPassword(oldPassword: string, newPassword: string) {
    return changeOwnPasswordPb(this.pb, oldPassword, newPassword);
  }

  async getEvents(accountId: string): Promise<TaskEvent[]> {
    const rec =
      (await this.findLwRow("lw_events", accountId)) ??
      (await this.findOwnedRow("br_events", accountId));
    return (rec?.data?.events as TaskEvent[]) ?? [];
  }

  /**
   * ★★★ Spendenbanner (Nachbesserung 19.09.2026, `lib/spendenbanner.ts`):
   * `zielgruppe` wählt die Collection - „lehrkraft" ⇒ `tt_teachers`,
   * „selbstlernend" ⇒ `tt_pupils` (DASSELBE Konto wie in Tastenflow,
   * [[project_lernwerkstatt_unified]]). `accountId` ist immer das eigene
   * Konto - bei `tt_pupils` verlangt dessen updateRule beim Selbst-Update die
   * unveränderte `teacherUid` mit ({@link selfPupilFields}, wie in
   * `lib/typing/pbBackend.ts`).
   */
  async getSpendenbannerZustand(
    accountId: string,
    zielgruppe: SpendenBannerZielgruppe,
  ): Promise<SpendenBannerZustand | null> {
    try {
      const collection = zielgruppe === "lehrkraft" ? "tt_teachers" : "tt_pupils";
      const rec = await this.pb.collection(collection).getOne(accountId, {
        fields: "spendenAufrufAm,spendenAufrufMeilenstein,gespendetAm",
      });
      const meilensteinH = Number(rec.spendenAufrufMeilenstein) || 0;
      // ★ 19.09.2026: Eine bestätigte Spende zählt auch dann, wenn der Banner
      // selbst noch nie gezeigt wurde. ⚠️ Vor »Update LMS (komplett)« fehlt
      // das Feld am Server - PocketBase liefert es dann nicht mit (0), und es
      // gilt der Merker am Gerät.
      const gespendetMs = Number(rec.gespendetAm) > 0 ? Number(rec.gespendetAm) : 0;
      if (meilensteinH <= 0 && !gespendetMs) return null;
      return {
        meilensteinH,
        zuletztGezeigtMs: Number(rec.spendenAufrufAm) || 0,
        ...(gespendetMs ? { gespendetMs } : {}),
      };
    } catch {
      return null;
    }
  }

  async setSpendenbannerZustand(
    accountId: string,
    zielgruppe: SpendenBannerZielgruppe,
    meilensteinH: number,
    zuletztGezeigtMs: number,
  ): Promise<boolean> {
    try {
      const collection = zielgruppe === "lehrkraft" ? "tt_teachers" : "tt_pupils";
      await this.pb.collection(collection).update(accountId, {
        spendenAufrufAm: zuletztGezeigtMs,
        spendenAufrufMeilenstein: meilensteinH,
        ...(collection === "tt_pupils" ? this.selfPupilFields(accountId) : {}),
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * ★★★★★ Bestätigte Spende (19.09.2026, `lib/spendeBestaetigt.ts`) - dasselbe
   * Feld `gespendetAm` am selben Konto wie in Tastenflow; bei `tt_pupils` mit
   * der unveränderten `teacherUid` wie oben.
   */
  async setGespendetAm(
    accountId: string,
    zielgruppe: SpendenBannerZielgruppe,
    gespendetMs: number,
  ): Promise<boolean> {
    try {
      const collection = zielgruppe === "lehrkraft" ? "tt_teachers" : "tt_pupils";
      await this.pb.collection(collection).update(accountId, {
        gespendetAm: gespendetMs,
        ...(collection === "tt_pupils" ? this.selfPupilFields(accountId) : {}),
      });
      return true;
    } catch {
      return false;
    }
  }

  // ══════════════════════════════════════════════════════════════════════
  // ZUBAU 22.09.2026: BRAILLE-CHALLENGE, KLASSENMATCH, EIGENE ÜBUNGEN
  // ══════════════════════════════════════════════════════════════════════

  // --- Der Punktgenau-Plan der Klasse (Challenge + Klassenmatch-Häkchen) ---
  /**
   * ★★★ Siehe `einstellungenZusammenfuehren` (`account.ts`) - ZWEI Ebenen
   * zusammenführen: `settings.punktgenau` selbst ist ein Schlüssel darin
   * (Tastenflow-Nachbarn im selben Topf bleiben stehen), UND innerhalb von
   * `punktgenau` bleiben `wochenaufgabe`/`kinder` stehen, wenn hier nur
   * `challenge` oder `klassenmatchAus` gesetzt wird.
   */
  private async schreibePunktgenauPlan(
    classCode: string,
    teil: Partial<PunktgenauKlassenplan>,
  ): Promise<Result<true>> {
    try {
      const rec = await this.pb
        .collection("tt_classes")
        .getFirstListItem(this.pb.filter("code={:c}", { c: classCode }));
      const altSettings = (rec.settings ?? {}) as Record<string, unknown>;
      const altPunktgenauRoh = altSettings.punktgenau;
      const altPunktgenau =
        altPunktgenauRoh && typeof altPunktgenauRoh === "object"
          ? (altPunktgenauRoh as Record<string, unknown>)
          : {};
      const neuerPunktgenau = { ...altPunktgenau, ...teil };
      const neu = einstellungenZusammenfuehren(altSettings, { punktgenau: neuerPunktgenau as PunktgenauKlassenplan });
      await this.pb.collection("tt_classes").update(rec.id, { settings: neu });
      return { ok: true as const, value: true as const };
    } catch {
      return fail("Konnte nicht gespeichert werden. Ist der Server erreichbar?");
    }
  }

  async setChallengePlan(_teacherId: string, classCode: string, plan: ChallengePlan | null) {
    return this.schreibePunktgenauPlan(classCode, { challenge: plan ?? undefined });
  }

  async setKlassenmatchAus(_teacherId: string, classCode: string, aus: boolean) {
    return this.schreibePunktgenauPlan(classCode, { klassenmatchAus: aus });
  }

  // --- Braille-Challenge: EINE Abgabe je Kind und Runde ---------------------
  /**
   * ★★★ Zweimal abgeben ist unmöglich - der eindeutige Index am Server über
   * (`pupilUid`, `probeId`) weist den zweiten Versuch mit einem 400 ab
   * (siehe `setup.mjs`, `idx_br_ch_pupil_probe`); die `update`-Regel ist
   * zusätzlich `null` (kein Nachbessern einer Abgabe). Hier wird daraus ein
   * Satz fürs Kind, kein technischer Fehlercode.
   */
  async meldeChallengeErgebnis(ergebnis: ChallengeErgebnis) {
    try {
      await this.pb.collection("br_challenges").create({
        pupilUid: ergebnis.pupilUid,
        teacherUid: ergebnis.teacherUid,
        classCode: ergebnis.classCode,
        probeId: ergebnis.probeId,
        arbeitsweise: ergebnis.arbeitsweise,
        bereich: ergebnis.bereich,
        beginnMs: Math.max(0, ergebnis.eingereichtMs - ergebnis.lauf.arbeitszeitMs),
        eingereichtMs: ergebnis.eingereichtMs,
        arbeitszeitMs: ergebnis.lauf.arbeitszeitMs,
        ansageMs: ergebnis.lauf.ansageMs,
        richtig: ergebnis.lauf.richtig,
        falsch: ergebnis.lauf.falsch,
      });
      return { ok: true as const, value: true as const };
    } catch (e) {
      if (e instanceof ClientResponseError && e.status === 400)
        return fail("Diese Braille-Challenge hast du schon abgegeben.");
      return fail("Die Abgabe konnte nicht gespeichert werden. Ist der Server erreichbar?");
    }
  }

  async holeChallengeErgebnis(pupilUid: string, probeId: string) {
    try {
      const rec = await this.pb
        .collection("br_challenges")
        .getFirstListItem(this.pb.filter("pupilUid={:p} && probeId={:r}", { p: pupilUid, r: probeId }));
      return mapChallengeErgebnis(rec);
    } catch {
      return null;
    }
  }

  async listeChallengeErgebnisse(classCode: string, probeId: string) {
    try {
      const recs = await this.pb.collection("br_challenges").getFullList({
        filter: this.pb.filter("classCode={:c} && probeId={:r}", { c: classCode, r: probeId }),
      });
      return recs.map(mapChallengeErgebnis);
    } catch {
      return [];
    }
  }

  /**
   * ★ Zubau 22.09.2026: DER VERLAUF - alle Abgaben einer Klasse, über ALLE
   * Runden. Dieselbe Sichtregel wie `listeChallengeErgebnisse` (`ttClassStaff`/
   * `ttOwnerTeacher` am Datensatz, `setup.mjs`) - hier fehlt nur der
   * `probeId`-Filter. Kein Netz/abgewiesen: leer melden, nicht abstürzen
   * (Muster `typing/pbBackend.ts`, `leseKlassenProben`).
   */
  async listeChallengeVerlaufKlasse(classCode: string) {
    try {
      const recs = await this.pb.collection("br_challenges").getFullList({
        filter: this.pb.filter("classCode={:c}", { c: classCode }),
        sort: "-eingereichtMs",
      });
      return recs.map(mapChallengeErgebnis);
    } catch {
      return [];
    }
  }

  /**
   * ★ Zubau 22.09.2026: DER VERLAUF - alle Abgaben EINES Kindes, über ALLE
   * Runden und Klassen. Die Sichtregel (`ttSelfPupil("pupilUid")`) lässt ein
   * Kind nur die eigenen Zeilen sehen, unabhängig vom Filter hier - siehe
   * Bericht: für eine künftige eigene Statistik, ausserhalb der Dateihoheit
   * dieses Zubaus.
   */
  async listeChallengeVerlaufKind(pupilUid: string) {
    try {
      const recs = await this.pb.collection("br_challenges").getFullList({
        filter: this.pb.filter("pupilUid={:p}", { p: pupilUid }),
        sort: "-eingereichtMs",
      });
      return recs.map(mapChallengeErgebnis);
    } catch {
      return [];
    }
  }

  // --- Klassenmatch -----------------------------------------------------------
  private matchStandIds = new Map<string, string>();

  /** Wie `listeMatches`: ein Netzfehler geht als Fehler nach oben, nie als leere Liste. */
  async listeMatches(classCode: string): Promise<BrailleMatch[]> {
    const recs = await this.pb.collection("br_matches").getFullList({
      filter: this.pb.filter("classCode={:c}", { c: classCode }),
    });
    return recs.map(mapMatch);
  }

  /**
   * Ein Match ausschreiben. Mitgeschickt wird nur, was die createRule
   * verlangt - `status`, `hostName`, `dauerMin`, `startMs`/`endeMs` und
   * `createdMs` setzt der Hook (`br_match.pb.js`) am Server neu.
   */
  async erstelleMatch(account: BrailleAccount, arbeitsweise: Arbeitsweise, bereich: AreaKey) {
    if (!account.classCode) return null;
    try {
      const rec = await this.pb.collection("br_matches").create({
        classCode: account.classCode,
        hostUid: account.id,
        hostName: account.name,
        arbeitsweise,
        bereich,
        status: "einladung",
        startMs: 0,
        endeMs: 0,
        dauerMin: 0,
        createdMs: 0,
      });
      return mapMatch(rec);
    } catch (err) {
      // ★★★★★ NICHT VERSCHLUCKEN (Muster `typing/pbBackend.ts`, dort am
      // 11.09.2026 gemessen): der Hook weist z. B. ab, wo die Lehrkraft das
      // Klassenmatch abgeschaltet hat - genau diesen Satz soll das Kind lesen.
      throw new Error(serverMeldung(err) || "Das Klassenmatch konnte nicht ausgeschrieben werden.");
    }
  }

  async aktualisiereMatch(matchId: string, status: MatchStatus) {
    try {
      const rec = await this.pb.collection("br_matches").update(matchId, { status });
      return mapMatch(rec);
    } catch {
      return null;
    }
  }

  beobachteMatches(classCode: string, beiAenderung: (match: BrailleMatch) => void) {
    return this.beobachte("br_matches", this.pb.filter("classCode={:c}", { c: classCode }), (rec) => {
      if (rec.classCode === classCode) beiAenderung(mapMatch(rec));
    });
  }

  /** Wie `listeMatches`: ein Netzfehler geht als Fehler nach oben. */
  async listeMatchStaende(matchId: string, arbeitsweise: Arbeitsweise, bereich: AreaKey) {
    const recs = await this.pb.collection("br_match_stand").getFullList({
      filter: this.pb.filter("matchId={:m}", { m: matchId }),
    });
    return recs.map((rec) => mapMatchStand(rec, arbeitsweise, bereich));
  }

  /**
   * Die eigene Stand-Zeile schreiben. Erst ändern, sonst anlegen - der
   * eindeutige Index (`matchId`, `pupilUid`) lässt keine zweite Zeile zu.
   * Jede Antwort ist zugleich ein Zeitabgleich (`meldeServerZeit`, Muster
   * `typing/pbBackend.ts`/`serverUhr.ts`) - dieselbe geteilte Datei.
   */
  async schreibeMatchStand(
    account: BrailleAccount,
    matchId: string,
    arbeitsweise: Arbeitsweise,
    bereich: AreaKey,
    werte: Pick<BrailleMatchStand, "status" | "lauf">,
    optionen?: { fehlerMelden?: boolean },
  ) {
    if (!account.classCode) return null;
    /*
      ★★★ Der Satz des Servers, falls er abgewiesen hat (02.10.2026, „Ein Kind,
      ein Match"). ⚠️ PocketBases eigene Sammelsätze („Failed to create
      record.") zählen NICHT - die kommen auch, wenn nur der eindeutige Index
      greift, weil die Zeile schon steht (dann geht es unten weiter).
    */
    let grund = "";
    const merke = (err: unknown) => {
      const satz = serverMeldung(err);
      if (satz && !/^Failed to /i.test(satz)) grund = satz;
    };
    const rumpf = {
      matchId,
      classCode: account.classCode,
      pupilUid: account.id,
      name: account.name,
      status: werte.status,
      arbeitszeitMs: werte.lauf.arbeitszeitMs,
      ansageMs: werte.lauf.ansageMs,
      richtig: werte.lauf.richtig,
      falsch: werte.lauf.falsch,
      updatedMs: Date.now(),
    };
    const mitZeitabgleich = async (tun: () => Promise<RecordModel>) => {
      const t0 = Date.now();
      const rec = await tun();
      meldeServerZeit((rec as { updated?: unknown }).updated, t0);
      return rec;
    };
    const id = this.matchStandIds.get(matchId);
    if (id) {
      try {
        return mapMatchStand(
          await mitZeitabgleich(() => this.pb.collection("br_match_stand").update(id, rumpf)),
          arbeitsweise,
          bereich,
        );
      } catch (err) {
        merke(err);
        this.matchStandIds.delete(matchId);
      }
    }
    try {
      const rec = await mitZeitabgleich(() => this.pb.collection("br_match_stand").create(rumpf));
      this.matchStandIds.set(matchId, rec.id);
      return mapMatchStand(rec, arbeitsweise, bereich);
    } catch (err) {
      merke(err);
      try {
        const rec = await this.pb
          .collection("br_match_stand")
          .getFirstListItem(
            this.pb.filter("matchId={:m} && pupilUid={:p}", { m: matchId, p: account.id }),
          );
        this.matchStandIds.set(matchId, rec.id);
        return mapMatchStand(
          await mitZeitabgleich(() => this.pb.collection("br_match_stand").update(rec.id, rumpf)),
          arbeitsweise,
          bereich,
        );
      } catch (err) {
        merke(err);
        if (optionen?.fehlerMelden) throw new Error(grund);
        return null;
      }
    }
  }

  beobachteMatchStaende(
    matchId: string,
    arbeitsweise: Arbeitsweise,
    bereich: AreaKey,
    beiAenderung: (stand: BrailleMatchStand) => void,
  ) {
    return this.beobachte("br_match_stand", this.pb.filter("matchId={:m}", { m: matchId }), (rec) => {
      if (rec.matchId === matchId) beiAenderung(mapMatchStand(rec, arbeitsweise, bereich));
    });
  }

  // --- Eigene Übungen: die Reihe der Klasse (Zeilen SIND die Reihe) ---------
  async listeEigeneUebungen(classCode: string): Promise<EigeneUebungEintrag[]> {
    const recs = await this.pb.collection("br_eigene_texte").getFullList({
      filter: this.pb.filter("classCode={:c} && aktiv=true", { c: classCode }),
      sort: "gestartetMs",
    });
    return recs.map(mapEigeneUebungEintrag);
  }

  /**
   * Eine neue Übung anlegen und an die Reihe HÄNGEN. `reiheMitNeuer` (aus
   * `eigeneUebung.ts`, ungeändert benutzt) entscheidet, ob dadurch eine
   * ältere herausfällt; diese Funktion setzt die herausgefallenen Zeilen
   * danach auf `aktiv = false` (die Zeilen SELBST sind die Reihe - anders
   * als bei Tastenflows `tt_eigene_texte`/`eigeneUebungReihe`, wo die Reihe
   * ein separates Array am Klassen-Datensatz ist).
   */
  async starteEigeneUebung(
    classCode: string,
    teacherId: string,
    eintrag: { dateiname: string; arbeitsweise: Arbeitsweise; bereich: AreaKey; zeilen: string[] },
    vonAllenFertig: readonly string[] = [],
  ): Promise<EigeneUebungEintrag[] | null> {
    try {
      const bisherige = await this.listeEigeneUebungen(classCode);
      const rec = await this.pb.collection("br_eigene_texte").create({
        classCode,
        // ★ Die ANGEMELDETE Lehrkraft, nicht zwingend die Eigentümerin der
        // Klasse - dieselbe Begründung wie `speichereEigenenText` (Muster
        // `typing/pbBackend.ts`, Z1-Befund 19.09.2026): die createRule
        // verlangt `@request.auth.id = @request.body.teacherUid`.
        teacherUid: (this.pb.authStore.record?.id as string | undefined) ?? teacherId,
        dateiname: eintrag.dateiname,
        arbeitsweise: eintrag.arbeitsweise,
        bereich: eintrag.bereich,
        aktiv: true,
        gestartetMs: Date.now(),
        data: { zeilen: eintrag.zeilen },
      });
      const neu = mapEigeneUebungEintrag(rec);
      const reihe = reiheMitNeuer(bisherige, neu, vonAllenFertig);
      const bleibtDrin = new Set(reihe.map((e) => e.textId));
      for (const alt of bisherige) {
        if (!bleibtDrin.has(alt.textId)) {
          try {
            await this.pb.collection("br_eigene_texte").update(alt.textId, { aktiv: false });
          } catch {
            // Eine einzelne Zeile, die sich nicht abschalten lässt, darf die
            // neue Übung nicht verhindern - sie bleibt bis zum nächsten Mal liegen.
          }
        }
      }
      return reihe;
    } catch {
      return null;
    }
  }

  async beendeEigeneUebung(_classCode: string, textId: string): Promise<EigeneUebungEintrag[] | null> {
    try {
      await this.pb.collection("br_eigene_texte").update(textId, { aktiv: false });
      return await this.listeEigeneUebungen(_classCode);
    } catch {
      return null;
    }
  }

  async leseEigenenText(textId: string): Promise<{ dateiname: string; zeilen: string[] } | null> {
    try {
      const rec = await this.pb.collection("br_eigene_texte").getOne(textId);
      const data = (rec.data ?? {}) as { zeilen?: unknown };
      if (!Array.isArray(data.zeilen)) return null;
      return { dateiname: String(rec.dateiname ?? ""), zeilen: data.zeilen as string[] };
    } catch {
      return null;
    }
  }

  /**
   * ★★★ „Fertig" je Kind UND je Text, AM KONTO (Muster `eigeneUebung.ts`,
   * Kopfkommentar zu `EigeneUebungFortschritt`): `br_eigene_texte` lässt nur
   * die LEHRKRAFT schreiben (`ttClassStaff`, siehe `setup.mjs`), ein Kind
   * kann dort also nichts festhalten. Die einzige Stelle, an der ein Kind
   * SEINE EIGENE Zeile schreiben darf, ist seine eigene `lw_progress`-Zeile
   * (`LW_UPDATE` erlaubt genau das) - darum liegt die Marke dort, in
   * `data.eigeneUebungFertig`, GEZIELT zusammengeführt wie in `saveProgress`
   * oben (nie das ganze Feld ersetzt).
   */
  async meldeEigeneUebungFertig(accountId: string, textId: string): Promise<boolean> {
    try {
      const classCode = (this.pb.authStore.record?.classCode as string) ?? "";
      const teacherUid = (this.pb.authStore.record?.teacherUid as string) ?? "";
      const bestehend = await this.findLwRow("lw_progress", accountId);
      const data = { ...((bestehend?.data as Record<string, unknown> | undefined) ?? {}) };
      const fertig = { ...((data.eigeneUebungFertig as Record<string, unknown> | undefined) ?? {}) };
      fertig[textId] = { fertig: true, ms: Date.now() };
      data.eigeneUebungFertig = fertig;
      await this.upsertLw("lw_progress", accountId, data, classCode, teacherUid, Date.now(), bestehend);
      return true;
    } catch {
      return false;
    }
  }

  async leseEigeneUebungFortschritt(accountId: string): Promise<EigeneUebungFortschritt> {
    const rec = await this.findLwRow("lw_progress", accountId);
    const data = (rec?.data ?? {}) as { eigeneUebungFertig?: unknown };
    return eigeneUebungFertigAusRoh(data.eigeneUebungFertig);
  }

  async leseEigeneUebungFortschritteDerKlasse(classCode: string): Promise<EigeneUebungFortschritt[]> {
    try {
      const recs = await this.pb.collection("lw_progress").getFullList({
        filter: this.pb.filter("classCode={:c} && program={:p}", { c: classCode, p: PROGRAM }),
      });
      return recs.map((r) =>
        eigeneUebungFertigAusRoh((r.data as { eigeneUebungFertig?: unknown } | undefined)?.eigeneUebungFertig),
      );
    } catch {
      return [];
    }
  }

  /**
   * Die unveränderte `teacherUid`, wenn ein Kind (bzw. selbstlernendes Konto)
   * SEINEN EIGENEN Datensatz schreibt - die updateRule von `tt_pupils` verlangt
   * sie. Sonst leer. Dasselbe wie `selfPupilFields` in `lib/typing/pbBackend.ts`.
   */
  private selfPupilFields(accountId: string): Record<string, unknown> {
    const rec = this.pb.authStore.record as RecordModel | null;
    if (rec && rec.collectionName === "tt_pupils" && rec.id === accountId)
      return { teacherUid: rec.teacherUid };
    return {};
  }

  // --- Realtime (Zubau 22.09.2026, Muster `typing/pbBackend.ts`) -------------
  /**
   * Eine Sammlung beobachten - die EINE Stelle für `subscribe`. Der Filter
   * wird mitgeschickt (weniger Ereignisse im Netz) und im Rückruf trotzdem
   * noch einmal geprüft: Was durchkommt, entscheidet am Server die listRule,
   * nicht der Filter. Scheitert die Verbindung, passiert nichts - die
   * Nachfrage im Takt bleibt das Netz.
   */
  private beobachte(
    sammlung: string,
    filter: string,
    nimm: (rec: RecordModel) => void,
  ): () => void {
    let beendet = false;
    let abmelden: (() => Promise<void>) | null = null;
    this.pb
      .collection(sammlung)
      .subscribe(
        "*",
        (ev) => {
          if (!beendet && ev.action !== "delete") nimm(ev.record);
        },
        { filter },
      )
      .then((aus) => {
        if (beendet) void aus().catch(() => {});
        else abmelden = aus;
      })
      .catch(() => {
        /* keine Verbindung: die Nachfrage im Takt bleibt */
      });
    return () => {
      beendet = true;
      if (abmelden) void abmelden().catch(() => {});
    };
  }

  // --- Helpers ---------------------------------------------------------------
  private async findOwnedRow(
    collection: string,
    pupilUid: string,
  ): Promise<RecordModel | null> {
    try {
      return await this.pb
        .collection(collection)
        .getFirstListItem(this.pb.filter("pupilUid={:p}", { p: pupilUid }));
    } catch {
      return null;
    }
  }

  // lw_*-Zeile dieses Kindes für DIESES Programm (unique je (pupilUid, program)).
  private async findLwRow(
    collection: string,
    pupilUid: string,
  ): Promise<RecordModel | null> {
    try {
      return await this.pb
        .collection(collection)
        .getFirstListItem(
          this.pb.filter("pupilUid={:p} && program={:prog}", {
            p: pupilUid,
            prog: PROGRAM,
          }),
        );
    } catch {
      return null;
    }
  }

  // Upsert in die kanonische lw_*-Tabelle (mit program + classCode).
  //
  // `vorgefunden`: die Zeile, wenn der Aufrufer sie ohnehin schon gelesen hat
  // (Zubau 22.09.2026, `saveProgress`/`meldeEigeneUebungFertig`) - erspart die
  // sonst doppelte Abfrage. `undefined` (Vorgabe) heisst „noch nicht
  // nachgesehen", `null` heisst „nachgesehen, es gibt sie nicht".
  private async upsertLw(
    collection: string,
    pupilUid: string,
    data: object,
    classCode: string,
    teacherUid: string,
    now: number,
    vorgefunden?: RecordModel | null,
  ) {
    const existing = vorgefunden !== undefined ? vorgefunden : await this.findLwRow(collection, pupilUid);
    if (existing) {
      await this.pb
        .collection(collection)
        .update(existing.id, { data, classCode, updatedAtMs: now });
    } else {
      await this.pb.collection(collection).create({
        pupilUid,
        program: PROGRAM,
        teacherUid,
        classCode,
        data,
        updatedAtMs: now,
      });
    }
  }

  /**
   * Beim ersten Login: Fortschritt- + Telemetrie-Zeile in BEIDEN Modellen
   * anlegen (Doppel-Schreiben, Umbau 4c). Übergang wie im Tipp-Backend:
   * existiert die Alt-Zeile schon, wird deren Inhalt in die fehlende lw-Zeile
   * übernommen — nie mit Leerdaten überschrieben.
   */
  private async ensureRows(pupil: RecordModel) {
    const teacherUid = (pupil.teacherUid as string) ?? "";
    const classCode = (pupil.classCode as string) ?? "";
    const now = Date.now();

    // Umbau 4d-Schritt2: nur noch die lw-Zeile anlegen. Eine evtl. vorhandene
    // Alt-Zeile (Sicherungs-Kopie) dient nur als Seed-Quelle.
    const lwProg = await this.findLwRow("lw_progress", pupil.id);
    if (!lwProg) {
      const oldProg = await this.findOwnedRow("br_progress", pupil.id);
      const seed = (oldProg?.data as object) ?? emptyProgress();
      await this.upsertLw("lw_progress", pupil.id, seed, classCode, teacherUid, now);
    }

    const lwEv = await this.findLwRow("lw_events", pupil.id);
    if (!lwEv) {
      const oldEv = await this.findOwnedRow("br_events", pupil.id);
      const seed = (oldEv?.data as object) ?? { events: [] };
      await this.upsertLw("lw_events", pupil.id, seed, classCode, teacherUid, now);
    }
  }
}
