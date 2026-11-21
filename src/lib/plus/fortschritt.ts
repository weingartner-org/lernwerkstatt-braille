/**
 * Der Fortschritt von Plus - was ein Kind mitnimmt.
 *
 * Gespeichert wird der Stand des Coaches: was sitzt, was wackelt, wann etwas
 * wiederkommt. Ohne ihn vergisst Plus nach jedem Neuladen alles, und der
 * Coach hat nichts, worauf er sich stützt.
 *
 * ★ Üben geht ohne Konto. Dann liegt der Stand im Browser - er wandert nicht
 * mit, aber er ist da. Wer sich anmeldet, bekommt seine Zeile in `lw_progress`
 * mit `program: "plus"`; das ist dasselbe Modell wie bei Tastenflow,
 * Punktgenau, Klangpunkte und eine andere App der Plattform, und es braucht keinen Schema-Deploy.
 *
 * ⚠️ Was NICHT gespeichert wird: Zeiten je Aufgabe, Fehlerlisten mit
 * Zeitstempel, irgendetwas, das sich zu einem Leistungsprofil zusammensetzen
 * liesse. Der Coach braucht es nicht, und ein Kind trägt kein Etikett.
 */
import PocketBase, { LocalAuthStore } from "pocketbase";
import type { RecordModel } from "pocketbase";
import { backendUrl } from "@/lib/adressen";
import { neuesWochenziel, type Wochenziel } from "./abzeichen";
import { neuerStand, tagesnummer, type Stand } from "./coach";
import type { Vermutung } from "./fehler";

const PROGRAMM = "plus";

export interface PlusFortschritt {
  version: 1;
  /** Der Stand des Coaches. */
  stand: Stand;
  /** Gerechnete Aufgaben insgesamt - die Zahl, die ein Kind stolz macht. */
  gerechnet: number;
  richtige: number;
  /** Zuletzt gewählte Schulstufe - damit die Auswahl dort wieder aufgeht. */
  stufe: number | null;

  /* --- was die Abzeichen zählen --------------------------------------- */

  /** Tagesnummern, an denen gerechnet wurde. ★ Eine Menge, keine Serie. */
  tage: number[];
  /** Übungen ohne einen einzigen Fehler. */
  laeufeOhneFehler: number;
  /** Welche Brailleschriften schon benutzt wurden. */
  braille: string[];
  /** Aus welchen Schulstufen schon etwas gerechnet wurde. */
  stufen: number[];
  /** Besonderheiten für die geheimen Abzeichen - „palindrom" und Ähnliches. */
  besondere: string[];
  /** Gefundene Abzeichen. */
  abzeichen: string[];
  /**
   * Die Meldungs-Chronik. ★ Sie ist kein Beiwerk: Live-Meldungen kommen auf
   * der Braillezeile unzuverlässig an und verdrängen, was unter den Fingern
   * liegt. Wer eine Meldung verpasst, findet sie hier wieder.
   */
  chronik: { tag: number; text: string }[];
  wochenziel: Wochenziel;
  /**
   * Vermutungen über Denkfehler. ⚠️ Kein Etikett: jede hat ein Ablaufdatum
   * und fällt, sobald sie mehr als ein Drittel danebenliegt.
   */
  vermutungen: Vermutung[];
  /**
   * Bis zu welchem Zeitpunkt die Beschlüsse der Lehrkraft schon übernommen
   * sind (ihr Stempel, nicht die Uhr des Kindes) - damit jeder genau einmal
   * wirkt. Siehe `lib/plus/beschluss.ts`.
   */
  beschlussAngewandt: number;

  /* --- Runden und Rätsel (26.09.2026) ---------------------------------- */

  /**
   * Fertig gerechnete Runden, über alle Türen. Nach jeder dritten kommt ein
   * Rätsel (`RUNDEN_BIS_RAETSEL` in `coach.ts`). ★ Eine abgebrochene Runde
   * zählt nicht - sonst käme das Rätsel nach drei Mal „Übung beenden".
   */
  runden: number;
  /** Gelöste Rätsel - nur die Zahl, für die Statistik und die Sammlung. */
  raetselGeloest: number;
  /**
   * Die Angaben der zuletzt gelösten Rätsel, damit keines wiederkommt, solange
   * es andere gibt. Höchstens 60.
   */
  raetsel: string[];
  /**
   * Die Übungen für alle (von der Lehrkraft), die dieses Kind fertig
   * gerechnet hat - nur ihre Kennungen, höchstens 20. Die Lehrkraft liest
   * daraus „fertig", sonst nichts (`lehrerUebung.ts`).
   */
  fuerAlleFertig: string[];

  /* --- Ich gegen früher (16.10.2026) ------------------------------------ */

  /**
   * Je Paket der erste und der letzte fertige Lauf - Tag, richtige, gesamt.
   * Daraus entsteht „Ich gegen früher" in der Statistik (`rueckblick.ts`).
   * ★ Nur zwei Punkte je Paket, keine Liste: Das genügt für den Vergleich mit
   * sich selbst und ergibt kein Leistungsprofil. Nur das Kind sieht es.
   */
  verlauf: Record<string, Verlauf>;

  /* --- Was die Lehrkraft sehen darf (Johannes, 16.10.2026) ------------- */

  /**
   * Je Tag: gerechnete Aufgaben und richtige - `[gerechnet, richtig]`, der
   * Schlüssel ist die Tagesnummer. Höchstens 400 Tage (ein Schuljahr plus
   * Reserve). ★ Zahlen je TAG, nie je Aufgabe und nie mit Uhrzeit: Daraus
   * entstehen „zuletzt gerechnet", die Wochensäulen und der Vergleich mit der
   * Woche davor - aber kein Tempo und keine Zeit.
   */
  taeglich: Record<string, [number, number]>;
  /** Je Rechenart `[gerechnet, richtig]`, seit es mitgeschrieben wird. */
  jeArt: Record<string, [number, number]>;
  /** Je Übung `[gerechnet, richtig]`, seit es mitgeschrieben wird. */
  jePaket: Record<string, [number, number]>;
}

/** So viele Tage hält `taeglich` fest - ein Schuljahr plus Reserve. */
export const TAEGLICH_TAGE = 400;

export interface LaufErgebnis { tag: number; richtige: number; gesamt: number }
export interface Verlauf { erst: LaufErgebnis; jetzt: LaufErgebnis }

export function leererFortschritt(): PlusFortschritt {
  return {
    version: 1, stand: neuerStand(tagesnummer()), gerechnet: 0, richtige: 0, stufe: null,
    tage: [], laeufeOhneFehler: 0, braille: [], stufen: [], besondere: [],
    abzeichen: [], chronik: [], wochenziel: neuesWochenziel(), vermutungen: [],
    beschlussAngewandt: 0, runden: 0, raetselGeloest: 0, raetsel: [], fuerAlleFertig: [], verlauf: {},
    taeglich: {}, jeArt: {}, jePaket: {},
  };
}

/** Was aus dem Speicher kommt, ist alt oder halb - hier wird es wieder ganz. */
export function heile(roh: unknown): PlusFortschritt {
  const leer = leererFortschritt();
  if (!roh || typeof roh !== "object") return leer;
  const o = roh as Partial<PlusFortschritt>;
  const stand = o.stand && typeof o.stand === "object"
    ? { ...leer.stand, ...o.stand, pakete: { ...(o.stand.pakete ?? {}) } }
    : leer.stand;
  const liste = (x: unknown): string[] => (Array.isArray(x) ? x.filter((e) => typeof e === "string") : []);
  const zahlen = (x: unknown): number[] => (Array.isArray(x) ? x.filter((e) => typeof e === "number") : []);
  return {
    version: 1,
    stand,
    gerechnet: Number.isFinite(o.gerechnet) ? Number(o.gerechnet) : 0,
    richtige: Number.isFinite(o.richtige) ? Number(o.richtige) : 0,
    stufe: typeof o.stufe === "number" ? o.stufe : null,
    tage: zahlen(o.tage),
    laeufeOhneFehler: Number.isFinite(o.laeufeOhneFehler) ? Number(o.laeufeOhneFehler) : 0,
    braille: liste(o.braille),
    stufen: zahlen(o.stufen),
    besondere: liste(o.besondere),
    abzeichen: liste(o.abzeichen),
    chronik: Array.isArray(o.chronik)
      ? o.chronik.filter((e): e is { tag: number; text: string } =>
          !!e && typeof e === "object" && typeof (e as { text?: unknown }).text === "string")
      : [],
    wochenziel: o.wochenziel && typeof o.wochenziel === "object" && typeof o.wochenziel.ziel === "number"
      ? { woche: String(o.wochenziel.woche ?? ""), ziel: o.wochenziel.ziel, geschafft: Number(o.wochenziel.geschafft) || 0 }
      : leer.wochenziel,
    vermutungen: Array.isArray(o.vermutungen)
      ? o.vermutungen.filter((v): v is Vermutung =>
          !!v && typeof v === "object" && typeof (v as Vermutung).muster === "string")
      : [],
    beschlussAngewandt: Number.isFinite(o.beschlussAngewandt) ? Number(o.beschlussAngewandt) : 0,
    runden: Number.isFinite(o.runden) ? Math.max(0, Number(o.runden)) : 0,
    raetselGeloest: Number.isFinite(o.raetselGeloest) ? Math.max(0, Number(o.raetselGeloest)) : 0,
    raetsel: liste(o.raetsel).slice(-60),
    fuerAlleFertig: liste(o.fuerAlleFertig).slice(-20),
    verlauf: heileVerlauf(o.verlauf),
    taeglich: heileZaehler(o.taeglich, TAEGLICH_TAGE),
    jeArt: heileZaehler(o.jeArt, 40),
    jePaket: heileZaehler(o.jePaket, 400),
  };
}

function plusEins(z: Record<string, [number, number]>, schluessel: string, richtig: boolean): Record<string, [number, number]> {
  const [g, r] = z[schluessel] ?? [0, 0];
  return { ...z, [schluessel]: [g + 1, r + (richtig ? 1 : 0)] };
}

/**
 * Eine Antwort in die Zähler für die Lehrkraft eintragen: je Tag, je Rechenart,
 * je Übung. ★ Reine Zahlen - keine Aufgabe, keine Eingabe, keine Uhrzeit.
 */
export function zaehleAntwortFuerLehrkraft(
  f: Pick<PlusFortschritt, "taeglich" | "jeArt" | "jePaket">,
  tag: number,
  paketId: string,
  op: string | undefined,
  richtig: boolean,
): Pick<PlusFortschritt, "taeglich" | "jeArt" | "jePaket"> {
  let taeglich = plusEins(f.taeglich, String(tag), richtig);
  const tage = Object.keys(taeglich);
  if (tage.length > TAEGLICH_TAGE) {
    taeglich = heileZaehler(taeglich, TAEGLICH_TAGE);
  }
  return {
    taeglich,
    jeArt: op ? plusEins(f.jeArt, op, richtig) : f.jeArt,
    jePaket: plusEins(f.jePaket, paketId, richtig),
  };
}

/** `{ schlüssel: [gerechnet, richtig] }` - nur saubere Paare, die jüngsten `max`. */
function heileZaehler(roh: unknown, max: number): Record<string, [number, number]> {
  if (!roh || typeof roh !== "object" || Array.isArray(roh)) return {};
  const paare: [string, [number, number]][] = [];
  for (const [k, v] of Object.entries(roh as Record<string, unknown>)) {
    if (!Array.isArray(v)) continue;
    const g = Number(v[0]);
    const r = Number(v[1]);
    if (Number.isFinite(g) && Number.isFinite(r) && g >= 0 && r >= 0 && r <= g) paare.push([k, [g, r]]);
  }
  // Tagesnummern sind Zahlen: die größten (jüngsten) bleiben.
  paare.sort((a, b) => Number(a[0]) - Number(b[0]) || a[0].localeCompare(b[0]));
  return Object.fromEntries(paare.slice(-max));
}

function heileVerlauf(roh: unknown): Record<string, Verlauf> {
  if (!roh || typeof roh !== "object") return {};
  const ergebnis = (x: unknown): LaufErgebnis | null => {
    if (!x || typeof x !== "object") return null;
    const e = x as Partial<LaufErgebnis>;
    return Number.isFinite(e.tag) && Number.isFinite(e.richtige) && Number.isFinite(e.gesamt) && Number(e.gesamt) > 0
      ? { tag: Number(e.tag), richtige: Number(e.richtige), gesamt: Number(e.gesamt) }
      : null;
  };
  const aus: Record<string, Verlauf> = {};
  for (const [id, v] of Object.entries(roh as Record<string, unknown>)) {
    const o = v as { erst?: unknown; jetzt?: unknown } | null;
    const erst = ergebnis(o?.erst);
    const jetzt = ergebnis(o?.jetzt);
    if (erst && jetzt) aus[id] = { erst, jetzt };
  }
  return aus;
}

export interface PlusBackend {
  readonly art: "lokal" | "pocketbase";
  lies(kontoId: string): Promise<PlusFortschritt>;
  schreib(kontoId: string, f: PlusFortschritt): Promise<void>;
}

/** Wo der Stand eines Kontos im Browser liegt - EIN Schlüssel für alle Leser. */
function lokalerSchluessel(kontoId: string): string {
  return `plus:stand:${kontoId || "anonym"}`;
}

/** Ohne Konto - und als Rückfall, wenn kein Server eingerichtet ist. */
class LokalesBackend implements PlusBackend {
  readonly art = "lokal" as const;

  private schluessel(kontoId: string) {
    return lokalerSchluessel(kontoId);
  }

  async lies(kontoId: string): Promise<PlusFortschritt> {
    try {
      const roh = localStorage.getItem(this.schluessel(kontoId));
      return roh ? heile(JSON.parse(roh)) : leererFortschritt();
    } catch {
      return leererFortschritt();
    }
  }

  async schreib(kontoId: string, f: PlusFortschritt): Promise<void> {
    try {
      localStorage.setItem(this.schluessel(kontoId), JSON.stringify(f));
    } catch {
      /* Privates Fenster oder gesperrter Speicher - dann eben nur diese Sitzung. */
    }
  }
}

/**
 * EINE PocketBase-Verbindung für alles, was Plus liest und schreibt - der
 * Fortschritt eines Kindes und (für die Lehrkraft) der Stand einer Klasse.
 * Derselbe authStore-Schlüssel wie die Geschwister-Apps: ein Konto für alles.
 */
let pbEine: PocketBase | null = null;
function pbPlus(): PocketBase {
  if (!pbEine) {
    pbEine = new PocketBase(backendUrl(), new LocalAuthStore("tt_pb_auth"));
    pbEine.autoCancellation(false);
  }
  return pbEine;
}

/** Läuft Plus gegen einen Server, oder liegt alles im Browser? */
function amServer(): boolean {
  return (import.meta.env.VITE_BACKEND ?? "mock") === "pocketbase" && typeof window !== "undefined";
}

class ServerBackend implements PlusBackend {
  readonly art = "pocketbase" as const;
  private pb: PocketBase;
  /**
   * ★ Der Rückfall, und warum er da sein muss: Wer ohne Konto übt, hat keine
   * Zeile auf dem Server - ein Schreibversuch ginge ins Leere, und der Stand
   * wäre beim nächsten Neuladen weg, ohne dass es jemand merkt. Gemessen am
   * 22.09.2026 im Browser: localStorage blieb leer, die Übung lief scheinbar
   * normal weiter. Dasselbe gilt für Lehrkraft-Konten, die laut Server-Regel
   * keine Kind-Zeile anlegen dürfen.
   */
  private lokal = new LokalesBackend();

  constructor() {
    this.pb = pbPlus();
  }

  private async zeile(kontoId: string): Promise<RecordModel | null> {
    try {
      return await this.pb.collection("lw_progress").getFirstListItem(
        this.pb.filter("pupilUid={:p} && program={:prog}", { p: kontoId, prog: PROGRAMM }),
      );
    } catch {
      return null;
    }
  }

  async lies(kontoId: string): Promise<PlusFortschritt> {
    if (!kontoId) return this.lokal.lies("");
    const rec = await this.zeile(kontoId);
    if (rec?.data) return heile(rec.data);
    // Keine Zeile auf dem Server: vielleicht wurde in dieser Sitzung lokal
    // geübt, weil das Schreiben nicht durchging.
    return this.lokal.lies(kontoId);
  }

  async schreib(kontoId: string, f: PlusFortschritt): Promise<void> {
    if (!kontoId) { await this.lokal.schreib("", f); return; }
    const classCode = (this.pb.authStore.record?.classCode as string) ?? "";
    const teacherUid = (this.pb.authStore.record?.teacherUid as string) ?? "";
    try {
      const da = await this.zeile(kontoId);
      if (da) {
        await this.pb.collection("lw_progress").update(da.id, {
          data: f, classCode, updatedAtMs: Date.now(),
        });
      } else {
        await this.pb.collection("lw_progress").create({
          pupilUid: kontoId, program: PROGRAMM, teacherUid, classCode,
          data: f, updatedAtMs: Date.now(),
        });
      }
    } catch {
      // Lehrkraft-Konten dürfen laut Server-Regel keine Kind-Zeile anlegen,
      // und ein Netzaussetzer kann jeden treffen. Beides darf den Stand nicht
      // kosten - er geht in den Browser.
      await this.lokal.schreib(kontoId, f);
    }
  }
}

let einer: PlusBackend | null = null;

export function plusBackend(): PlusBackend {
  if (einer) return einer;
  einer = amServer() ? new ServerBackend() : new LokalesBackend();
  return einer;
}

/** Nur für Tests: den Speicher wieder freigeben. */
export function backendZuruecksetzen(): void {
  einer = null;
  pbEine = null;
}

/**
 * Die Plus-Zeilen einer ganzen KLASSE - für den Reiter „Plus" in
 * „Meine Klasse" (23.09.2026).
 *
 * ★ EINE Anfrage für alle Kinder, nicht eine je Kind. Eine Klasse mit 20
 * Kindern wären sonst 20 Rundreisen zum Server, und die Lehrkraft sähe ihre
 * Tabelle in einem schlechten Schulnetz Zeile für Zeile entstehen.
 *
 * ★★★ Gefiltert wird über `pupilUid`, nicht über den Klassencode. Der Code
 * steht zwar in jeder Zeile, aber er ist eine KOPIE aus dem Konto des Kindes
 * zum Zeitpunkt des Schreibens: Wechselt ein Kind die Klasse, steht in seiner
 * alten Zeile noch die alte Klasse, und die Lehrkraft fände das Kind nicht
 * wieder, das in ihrer Liste vor ihr steht. Die Kinder-Liste kommt ohnehin
 * aus `tt_pupils` - sie ist die genauere Frage.
 *
 * ⚠️ Wer was sehen darf, entscheidet AUSSCHLIESSLICH die Server-Regel
 * (`lw_progress.list`: das Kind selbst, die eigene Lehrkraft, das Personal
 * der Klasse). Hier wird nichts geprüft, was dort nicht ohnehin erzwungen
 * wird ([[feedback_security_first]]) - eine Zeile, die die Lehrkraft nicht
 * lesen darf, kommt schlicht nicht zurück und fehlt dann in der Tabelle.
 *
 * Kinder ohne Zeile fehlen im Ergebnis. Das ist Absicht: Der Reiter
 * unterscheidet „noch nicht geöffnet" von „0 Aufgaben gerechnet".
 */
export async function liesKlasse(
  kontoIds: readonly string[],
): Promise<Record<string, PlusFortschritt>> {
  const ids = [...new Set(kontoIds.filter(Boolean))];
  if (ids.length === 0) return {};
  if (!amServer()) {
    /*
     * Ohne Server liegt alles in DIESEM Browser - wie bei den Geschwister-Apps
     * im Mock-Betrieb. Gelesen wird nur, was wirklich da ist: Ein Kind ohne
     * gespeicherten Stand fehlt im Ergebnis, genau wie am Server.
     */
    const gefunden: Record<string, PlusFortschritt> = {};
    for (const id of ids) {
      try {
        const roh = localStorage.getItem(lokalerSchluessel(id));
        if (roh) gefunden[id] = heile(JSON.parse(roh));
      } catch {
        /* gesperrter Speicher: dieses Kind bleibt ohne Stand */
      }
    }
    return gefunden;
  }
  const pb = pbPlus();
  const gefunden: Record<string, PlusFortschritt> = {};
  // In Häppchen, damit der Filter einer grossen Schulklasse nicht zu lang wird.
  for (let i = 0; i < ids.length; i += 40) {
    const teil = ids.slice(i, i + 40);
    const oder = teil.map((_, n) => `pupilUid={:p${n}}`).join(" || ");
    const werte: Record<string, string> = { prog: PROGRAMM };
    teil.forEach((id, n) => { werte[`p${n}`] = id; });
    try {
      const zeilen = await pb.collection("lw_progress").getFullList({
        filter: pb.filter(`program={:prog} && (${oder})`, werte),
        fields: "pupilUid,data",
      });
      for (const z of zeilen) {
        const uid = String(z.pupilUid ?? "");
        if (uid && z.data) gefunden[uid] = heile(z.data);
      }
    } catch {
      /* Kein Netz oder keine Berechtigung: Diese Kinder bleiben ohne Zeile. */
    }
  }
  return gefunden;
}

/**
 * Wer ist gerade angemeldet?
 *
 * Die Anmeldung gehört der Lernwerkstatt: alle Apps teilen sich den
 * authStore-Schlüssel `tt_pb_auth`. Plus liest nur mit - es meldet niemanden
 * an und niemanden ab. Ohne Konto kommt "" zurück, und dann liegt der Stand
 * im Browser.
 */
export function aktuellesKonto(): string {
  try {
    const roh = localStorage.getItem("tt_pb_auth");
    if (!roh) return "";
    const o = JSON.parse(roh) as { record?: { id?: string }; model?: { id?: string } };
    return String(o?.record?.id ?? o?.model?.id ?? "");
  } catch {
    return "";
  }
}
