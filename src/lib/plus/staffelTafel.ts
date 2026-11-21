/**
 * Die TAFEL der Staffel - der einzige Ort, an dem eine Klasse etwas teilt.
 * ============================================================================
 *
 * ★★★★★ WAS HIER STEHT, GEHÖRT KEINEM KIND.
 *
 * Eine Zeile trägt: Klassencode, Woche, die Nummer der gelaufenen Etappe.
 * Keine Kennung, keinen Namen, kein Ergebnis, keine Uhrzeit, an der man
 * jemanden wiedererkennen könnte. Darum dürfen alle Kinder der Klasse sie
 * lesen - es gibt nichts zu lesen, was einem Kind gehört.
 *
 * ⚠️⚠️ DARAN IST DIE STAFFEL IM SEPTEMBER GESCHEITERT: `lw_events` ist EINE
 * Zeile je Kind, und ein Kind darf die Zeilen der anderen nicht lesen. Wer
 * ein gemeinsames Ziel aus den Zeilen der Kinder zusammenrechnen will,
 * braucht genau das Recht, das ein Kind nicht haben darf. Die Lösung ist
 * nicht mehr Recht, sondern weniger Inhalt.
 *
 * ★★★★ NUR ANLEGEN, NIE ÄNDERN, NIE LÖSCHEN.
 *
 * Jede gelaufene Etappe ist eine EIGENE neue Zeile. Damit kann kein Kind die
 * Arbeit der Klasse verstellen oder wegnehmen - es gibt gar keinen Weg dazu,
 * auch nicht mit einem verbogenen Aufruf. Das ist billiger und sicherer als
 * ein Server-Hook, der eine gemeinsame Zeile zusammenführen müsste.
 * Ein Schlüssel über (Klasse, Woche, Nummer, Art) sorgt dafür, dass dieselbe
 * Etappe nur einmal zählt; zwei Kinder gleichzeitig sind kein Streit, sondern
 * ein abgewiesenes zweites Anlegen.
 */
import PocketBase, { LocalAuthStore } from "pocketbase";
import { backendUrl } from "@/lib/adressen";

const SAMMLUNG = "plus_staffel";

/** Der Stand der Klasse - mehr weiß niemand. */
export interface Tafel {
  /** Die Nummern der gelaufenen Etappen. */
  gelaufen: number[];
  /** Hat jemand das Wort erraten? */
  wortGeraten: boolean;
}

export const LEERE_TAFEL: Tafel = { gelaufen: [], wortGeraten: false };

export interface StaffelTafel {
  /** Ohne Klasse gibt es keine Staffel - dann sagt es die Oberfläche. */
  klasse: string | null;
  lies(woche: string): Promise<Tafel>;
  /** Eine Etappe eintragen. Gibt den neuen Stand zurück. */
  trageEin(woche: string, nr: number): Promise<Tafel>;
  /** Das Wort ist erraten. */
  trageWortEin(woche: string): Promise<Tafel>;
}

/**
 * Ohne Server: die Tafel liegt im Browser.
 *
 * ★ Das ist keine Notlösung für den Notfall, sondern der Normalfall beim
 * Ausprobieren und bei einem Kind ohne Konto. Die Staffel heißt dann trotzdem
 * „Staffel der Klasse" - sie ist bloß eine Klasse aus einem Kind, und die
 * Oberfläche sagt das in einem Satz.
 */
class LokaleTafel implements StaffelTafel {
  readonly klasse = "allein";
  private schluessel(woche: string) { return `plus.staffel.${woche}`; }

  async lies(woche: string): Promise<Tafel> {
    try {
      const roh = localStorage.getItem(this.schluessel(woche));
      if (!roh) return { ...LEERE_TAFEL };
      const t = JSON.parse(roh) as Partial<Tafel>;
      return {
        gelaufen: Array.isArray(t.gelaufen) ? t.gelaufen.filter((n) => typeof n === "number") : [],
        wortGeraten: t.wortGeraten === true,
      };
    } catch {
      return { ...LEERE_TAFEL };
    }
  }

  private async schreib(woche: string, t: Tafel): Promise<Tafel> {
    try { localStorage.setItem(this.schluessel(woche), JSON.stringify(t)); } catch { /* egal */ }
    return t;
  }

  async trageEin(woche: string, nr: number): Promise<Tafel> {
    const t = await this.lies(woche);
    if (!t.gelaufen.includes(nr)) t.gelaufen = [...t.gelaufen, nr].sort((a, b) => a - b);
    return this.schreib(woche, t);
  }

  async trageWortEin(woche: string): Promise<Tafel> {
    const t = await this.lies(woche);
    return this.schreib(woche, { ...t, wortGeraten: true });
  }
}

let pbEine: PocketBase | null = null;
function pbTafel(): PocketBase {
  if (!pbEine) {
    pbEine = new PocketBase(backendUrl(), new LocalAuthStore("tt_pb_auth"));
    pbEine.autoCancellation(false);
  }
  return pbEine;
}

/**
 * Die Tafel EINER Klasse vom Server - die EINE Abfrage.
 *
 * ★ Sie steht hier und nicht in der Klasse, weil sie zwei Leser hat: das Kind,
 * das seine eigene Klasse spielt, und seit 23.09.2026 die Lehrkraft, die im
 * Reiter „Plus" die Staffel einer AUSGEWÄHLTEN Klasse ansieht. Zwei Abfragen
 * für dieselbe Frage würden beim nächsten Umbau auseinanderlaufen
 * ([[feedback_zwei_stellen_die_voneinander_nichts_wissen]]).
 */
async function vomServer(pb: PocketBase, klasse: string, woche: string): Promise<Tafel> {
  const zeilen = await pb.collection(SAMMLUNG).getFullList({
    filter: pb.filter("classCode={:k} && woche={:w}", { k: klasse, w: woche }),
    // ⚠️ Nur die Spalten, die gebraucht werden - `data` steht leer und
    // soll auch leer bleiben.
    fields: "etappe,art",
  });
  return {
    gelaufen: [...new Set(zeilen.filter((z) => z.art === "etappe").map((z) => Number(z.etappe)))]
      .filter((n) => Number.isFinite(n)).sort((a, b) => a - b),
    wortGeraten: zeilen.some((z) => z.art === "wort"),
  };
}

/**
 * Die Tafel einer FREMDEN Klasse lesen - für die Lehrkraft in „Meine Klasse".
 *
 * ⚠️ Rein lesend, und die Klasse kommt von aussen: In „Meine Klasse" wählt die
 * Lehrkraft die Klasse oben aus; ihr eigenes Konto trägt keinen Klassencode,
 * über den sich die Staffel finden liesse. Wer welche Klasse lesen darf,
 * entscheidet die Server-Regel auf `plus_staffel` - nicht diese Funktion.
 *
 * `null` heisst: Die Abfrage am Server ging nicht durch.
 */
export async function liesTafelFuer(klasse: string, woche: string): Promise<Tafel | null> {
  const server = (import.meta.env.VITE_BACKEND ?? "mock") === "pocketbase" && typeof window !== "undefined";
  // Ohne Server liegt die Tafel in DIESEM Browser - wie beim Kind selbst.
  if (!server) return new LokaleTafel().lies(woche);
  if (!klasse) return null;
  try {
    return await vomServer(pbTafel(), klasse, woche);
  } catch {
    return null;
  }
}

class ServerTafel implements StaffelTafel {
  private pb: PocketBase;
  private lokal = new LokaleTafel();
  readonly klasse: string | null;

  constructor() {
    this.pb = pbTafel();
    const code = this.pb.authStore.record?.classCode;
    this.klasse = typeof code === "string" && code ? code : null;
  }

  async lies(woche: string): Promise<Tafel> {
    if (!this.klasse) return this.lokal.lies(woche);
    try {
      return await vomServer(this.pb, this.klasse, woche);
    } catch {
      // Kein Netz: lieber die eigene Sicht als gar keine Staffel.
      return this.lokal.lies(woche);
    }
  }

  private async lege(woche: string, art: "etappe" | "wort", etappe: number): Promise<Tafel> {
    if (!this.klasse) return art === "wort" ? this.lokal.trageWortEin(woche) : this.lokal.trageEin(woche, etappe);
    try {
      await this.pb.collection(SAMMLUNG).create({
        classCode: this.klasse, woche, art, etappe, createdAtMs: Date.now(),
      });
    } catch {
      /**
       * ⚠️ Ein Fehler heisst hier fast immer: Jemand war schneller, und der
       * Schlüssel über (Klasse, Woche, Nummer, Art) hat das zweite Anlegen
       * abgewiesen. Das ist der Normalfall in einer Klasse, die gemeinsam
       * arbeitet - kein Grund für eine Meldung. Gelesen wird gleich darauf
       * ohnehin der echte Stand.
       */
    }
    return this.lies(woche);
  }

  trageEin(woche: string, nr: number) { return this.lege(woche, "etappe", nr); }
  trageWortEin(woche: string) { return this.lege(woche, "wort", 0); }
}

let eine: StaffelTafel | null = null;

export function staffelTafel(): StaffelTafel {
  if (eine) return eine;
  const server = (import.meta.env.VITE_BACKEND ?? "mock") === "pocketbase" && typeof window !== "undefined";
  eine = server ? new ServerTafel() : new LokaleTafel();
  return eine;
}

/** Nur für Tests. */
export function tafelZuruecksetzen(): void {
  eine = null;
  pbEine = null;
}
