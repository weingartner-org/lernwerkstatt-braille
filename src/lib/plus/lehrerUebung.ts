/**
 * DIE ÜBUNG FÜR ALLE - die Lehrkraft wählt, alle Kinder rechnen dasselbe.
 * ============================================================================
 *
 * > **Johannes, 28.09.2026:** „lehrerübung wäre fein dass ich sagen kann aus
 * > den vorgegebenen bereichen starten alle die selbe übung so wie die eigene
 * > übung bei tastenflow"
 *
 * ★★★ DIESELBEN AUFGABEN FÜR ALLE - ohne eine einzige Aufgabe zu speichern.
 * Gespeichert werden nur die Übungen (Paket-Kennungen), die Anzahl und eine
 * SAAT. Aus derselben Saat erzeugt `erzeugeFolge` auf jedem Gerät dieselbe
 * Folge - dieselbe Idee wie die Staffel der Klasse (`staffel.ts`). Darum
 * steht die Saat fest im Auftrag und wird nie auf dem Gerät gewürfelt.
 *
 * ★★★ WO SIE STEHT: im Beschluss jedes Kindes (`tt_pupils.plusBeschluss`,
 * Schlüssel `fuerAlle`), NICHT an der Klasse.
 *  • `tt_classes.settings` ist fast voll (2.000 Byte; am 24.09. schon 2.145
 *    gemessen, siehe `setClassSchreibprobe`). Ein Plus-Eintrag dort könnte die
 *    Tippchallenge von Tastenflow am Speichern hindern.
 *  • `tt_classes.eigeneUebungen` gehört Tastenflow; jeder Tastenflow-Start
 *    schreibt die Reihe neu.
 *  • Ein neues Feld an der Klasse bräuchte »Update LMS (komplett)«.
 * `plusBeschluss` dagegen ist live, gehört Plus, fasst 20.000 Byte, und nur
 * die Lehrkraft darf es schreiben (`tt_pupils_field_guard`). Das Kind sieht
 * eine Änderung nach etwa einer Sekunde (`kontoBeobachten`).
 * ⚠️ Der Preis: Ein Kind, das NACH dem Start in die Klasse kommt, hat die
 * Übung nicht. Die Lehrkraft startet sie dann neu.
 *
 * ★ FERTIG merkt sich das Kind in seinem eigenen Fortschritt
 * (`fuerAlleFertig`), nie die Lehrkraft - wie `customTextProgress` in
 * Tastenflow. Die Lehrkraft liest nur „fertig: ja/nein", kein Ergebnis.
 */
import { zufall } from "./aufgabe";
import { paket, stufeVon } from "./stoffplan";

/** Wie viele Aufgaben die Lehrkraft wählen kann - eine Runde ist 8. */
export const FUER_ALLE_ANZAHLEN = [8, 16, 24] as const;
/** Höchstens so viele Übungen in einer Übung für alle. */
export const FUER_ALLE_MAX_PAKETE = 6;

export interface UebungFuerAlle {
  /** Kennung dieses Starts - ein neuer Start ist eine neue Übung. */
  id: string;
  /** Die gewählten Übungen (Paket-Kennungen wie „3-04"), in der Reihenfolge der Wahl. */
  pakete: string[];
  anzahl: number;
  /** Aus ihr entsteht auf jedem Gerät dieselbe Folge. */
  saat: number;
  /** Wann gestartet (Stempel der Lehrkraft). */
  am: number;
}

function gibtEs(id: string): boolean {
  try {
    paket(id);
    return true;
  } catch {
    return false;
  }
}

/** Was aus dem Konto kommt, ist roh - hier wird es verlässlich. `null` = keine. */
export function heileFuerAlle(roh: unknown): UebungFuerAlle | null {
  if (!roh || typeof roh !== "object" || Array.isArray(roh)) return null;
  const o = roh as Record<string, unknown>;
  const pakete = Array.isArray(o.pakete)
    ? [...new Set(o.pakete.filter((p): p is string => typeof p === "string" && gibtEs(p)))].slice(0, FUER_ALLE_MAX_PAKETE)
    : [];
  const anzahl = Number(o.anzahl);
  const saat = Number(o.saat);
  const am = Number(o.am);
  if (typeof o.id !== "string" || !o.id || pakete.length === 0) return null;
  if (!(FUER_ALLE_ANZAHLEN as readonly number[]).includes(anzahl)) return null;
  if (!Number.isInteger(saat) || !Number.isFinite(am) || am <= 0) return null;
  return { id: o.id, pakete, anzahl, saat, am };
}

/** Eine neue Übung für alle - Kennung und Saat entstehen EINMAL, bei der Lehrkraft. */
export function neueUebungFuerAlle(
  pakete: readonly string[],
  anzahl: number,
  jetztMs: number = Date.now(),
  wuerfel: () => number = Math.random,
): UebungFuerAlle {
  const saat = Math.floor(wuerfel() * 1e9);
  return {
    id: `fa${jetztMs.toString(36)}${saat.toString(36)}`,
    pakete: [...new Set(pakete)].slice(0, FUER_ALLE_MAX_PAKETE),
    anzahl,
    saat,
    am: jetztMs,
  };
}

/**
 * Der Plan: welche Übung an welcher Stelle drankommt. Jede gewählte Übung
 * gleich oft (so gut es aufgeht), gemischt - aus der Saat, also überall gleich.
 * `PlusUebung` bekommt denselben Plan UND dieselbe Saat und erzeugt daraus
 * dieselben Aufgaben.
 */
export function planFuerAlle(u: UebungFuerAlle): string[] {
  const plan = Array.from({ length: u.anzahl }, (_, i) => u.pakete[i % u.pakete.length]);
  const rng = zufall(u.saat ^ 0x5f3759df);
  for (let i = plan.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [plan[i], plan[j]] = [plan[j], plan[i]];
  }
  return plan;
}

/** Die Übungen in Worten - „Einmaleins mit 2, 5 und 10 · Zehnerübergang". */
export function namenFuerAlle(u: Pick<UebungFuerAlle, "pakete">): string {
  return u.pakete.map((id) => paket(id).name).join(" · ");
}

/** Die Schulstufe(n) der Übung in Worten - „3. Schulstufe" oder „3. und 4. Schulstufe". */
export function stufenFuerAlle(u: Pick<UebungFuerAlle, "pakete">): string {
  const stufen = [...new Set(u.pakete.map(stufeVon))].sort((a, b) => a - b);
  if (stufen.length === 1) return `${stufen[0]}. Schulstufe`;
  return `${stufen.slice(0, -1).map((s) => `${s}.`).join(", ")} und ${stufen[stufen.length - 1]}. Schulstufe`;
}
