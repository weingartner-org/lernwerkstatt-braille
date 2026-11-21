/**
 * ════════════════════════════════════════════════════════════════════════════
 * „EINE STUNDE SPERREN" - FÜR PUNKTGENAU, AM SELBEN ZEITRAUM WIE TASTENFLOW
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Johannes: die Lehrkraft drückt einen Knopf, und die nächste Unterrichtsstunde
 * zählt nicht auf die Wochenaufgabe des Kindes - was im Unterricht geübt wird,
 * soll nicht als häusliche Übezeit gutgeschrieben werden. Die gesperrte Zeit
 * zählt überall SONST weiter (Übezeit-Uhr, Statistik, Abzeichen); nur die
 * Wochenaufgabe klammert sie aus.
 *
 * ── ★★★ DIE ENTSCHEIDUNG, DIE SCHON GEFALLEN IST ───────────────────────────
 * Tastenflow speichert die Sperrzeiten im Feld `tt_classes.gesperrteZeiten`
 * (`lib/typing/wochenziel.ts`, Kopf-Kommentar „Eine Stunde sperren" - dort
 * auch, warum es ein ZEITRAUM an der Klasse ist und KEIN Bit am einzelnen
 * Ereignis: ein Gerät ohne Netz bekäme die Sperre sonst zu spät mit, und das
 * wäre ein Messfehler, keine Buchhaltung). Punktgenau und Tastenflow TEILEN
 * SICH `tt_classes` - eine gesperrte Unterrichtsstunde ist eine Tatsache über
 * die Zeit, nicht über das Programm: Ein Kind, das in dieser Stunde Punktgenau
 * statt Tastenflow übt, sitzt genauso im Unterricht.
 *
 * Punktgenau bekommt darum KEIN eigenes Feld - das wäre genau die Doppelung,
 * die einander nicht kennt ([[feedback_zwei_stellen_die_voneinander_nichts_wissen]]).
 * Stattdessen benutzt dieses Modul DIREKT `typingBackend()`
 * (`@/lib/typing/backend`) für das Schreiben (`stundeSperren`/`sperreAufheben`
 * wirken serverseitig auf genau denselben `tt_classes`-Datensatz, den auch
 * Tastenflow schreibt) und liest Typ + Prüf-Funktion aus `@/lib/typing/wochenziel`
 * - der Import geht anstandslos (derselbe Worktree, dieselbe App), ein
 * Nachbau wäre nur eine zweite, driftende Abschrift derselben Regel.
 *
 * Dieselben Reiter-Dateien tun das bereits für andere geteilte Klassen-Aktionen
 * (`typingBackend()` in `KlasseUndKinder.tsx`, `SchreibprobeKasten.tsx`,
 * `EigeneUebungKasten.tsx`) - dieses Modul folgt demselben, etablierten Weg,
 * nur gebündelt an einer Stelle für Punktgenau.
 *
 * ⚠️ `src/lib/typing/` wird hier NUR gelesen/importiert, nie verändert - siehe
 * Dateikopf-Auftrag. `src/lib/braille/backend.ts` (die Backend-Abstraktion
 * des Braille-Trainers) gehört NICHT zum Revier dieses Auftrags; ein neues
 * Feld dort hätte Interface UND beide Implementierungen angefasst. Der direkte
 * Weg über `typingBackend()` kommt ohne das aus.
 */
import {
  inGesperrterZeit,
  type GesperrteZeit,
} from "@/lib/typing/wochenziel";
import { typingBackend } from "@/lib/typing/backend";

export type { GesperrteZeit };
export { inGesperrterZeit };

/**
 * Läuft GERADE eine Sperre? (`abMs` inklusive, `bisMs` exklusive - dieselbe
 * Halboffen-Konvention wie {@link inGesperrterZeit}.) `null`, wenn keine der
 * Zeiträume `jetztMs` trifft. Reine Funktion - der genaue Zwilling der
 * Berechnung, die der Tastenflow-Reiter inline anstellt (`TastenflowReiter.tsx`,
 * `laufendeSperre`-`useMemo`), hier exportiert und damit ohne zweite Abschrift
 * für Punktgenau wiederverwendbar.
 */
export function laufendeSperre(
  gesperrt: readonly GesperrteZeit[],
  jetztMs: number = Date.now(),
): GesperrteZeit | null {
  return gesperrt.find((z) => z.abMs <= jetztMs && z.bisMs > jetztMs) ?? null;
}

/** Uhrzeit „14:05" - lokale Zeit, immer zweistellig. */
export function uhrzeitAusMs(ms: number): string {
  return new Date(ms).toLocaleTimeString("de-AT", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── Texte am Knopf - IMMER mit der programmübergreifenden Wirkung ─────────
//
// ★★★ Pflicht aus dem Auftrag: „Das muss an der Bedienoberfläche dranstehen,
// damit keine Lehrkraft überrascht wird". Jeder Text hier nennt darum BEIDE
// Programme; der Knopf-Text selbst bleibt kurz (wie bei Tastenflow), die
// Erklärung steht im Tipp/Status daneben. Die Sätze sprechen über die
// Unterrichtsstunde, nie über ein Kind ([[feedback_nie_gegen_das_kind]]).

export const STUNDE_SPERREN_KNOPF = "Stunde sperren";

export const SPERREN_TIPP =
  "Sperrt die Wochenaufgabe für 60 Minuten - für die ganze Klasse, in Tastenflow und Punktgenau gemeinsam. Geübt wird trotzdem - Übezeit, Statistik und Abzeichen zählen weiter, nur die Wochenaufgabe nicht.";

export const SPERRE_BEENDEN_TIPP =
  "Beendet die Sperre sofort - ab dann zählt geübte Zeit in Tastenflow und Punktgenau wieder für die Wochenaufgabe.";

export function gesperrtBisKnopf(bisMs: number): string {
  return `Gesperrt bis ${uhrzeitAusMs(bisMs)} - aufheben`;
}

export function stundeGesperrtStatus(bisMs: number): string {
  return `Stunde gesperrt bis ${uhrzeitAusMs(bisMs)} - für Tastenflow und Punktgenau.`;
}

export const SPERRE_AUFGEHOBEN_STATUS =
  "Sperre aufgehoben - für Tastenflow und Punktgenau.";

export const STUNDE_NICHT_GESPERRT_STATUS =
  "Die Stunde konnte nicht gesperrt werden.";

export const SPERRE_NICHT_AUFGEHOBEN_STATUS =
  "Die Sperre konnte nicht aufgehoben werden.";

/**
 * Die gesperrten Zeiten EINER Klasse lesen - über `typingBackend().getClass`,
 * denselben Weg wie `useGesperrteZeitenStand` (`lib/typing/useGesperrteZeiten.ts`)
 * ihn für die Kind-Seite von Tastenflow nimmt. Leere Liste bei jedem Fehler
 * (kein Netz, keine Klasse) - ein Ladefehler darf nie „gesperrt" vortäuschen,
 * wo keine Sperre steht, siehe {@link BrailleGesperrteZeitenStand}.
 */
export interface BrailleGesperrteZeitenStand {
  zeiten: readonly GesperrteZeit[];
  geladen: boolean;
}

/**
 * ★★★ Wie im Vorbild (`useGesperrteZeitenStand`): eine leere Antwort, die noch
 * nicht geladen hat, darf nirgends als „ungesperrt festgeschrieben" landen.
 * Anders als das Vorbild ist dies KEIN React-Hook (Punktgenaus Lehrkraft-Reiter
 * ruft es aus einem `useEffect` heraus auf) - die Bedeutung ist dieselbe: erst
 * nach einer echten Antwort (Erfolg ODER Fehlschlag) ist `geladen: true`.
 */
export async function holeGesperrteZeitenStand(
  classCode: string | undefined | null,
): Promise<BrailleGesperrteZeitenStand> {
  if (!classCode) return { zeiten: [], geladen: true };
  try {
    const cls = await typingBackend().getClass(classCode);
    return { zeiten: cls?.gesperrteZeiten ?? [], geladen: true };
  } catch {
    return { zeiten: [], geladen: false };
  }
}

/**
 * Eine Stunde sperren - schreibt `tt_classes.gesperrteZeiten` über
 * `typingBackend()` (siehe Dateikopf). Läuft schon eine Sperre (von hier oder
 * von Tastenflow gestartet), bleibt die Klasse unverändert - das prüft schon
 * `stundeSperren()` selbst serverseitig; hier nur die Weiterleitung.
 */
export async function klasseStundeSperren(classCode: string) {
  return typingBackend().stundeSperren(classCode);
}

/** Eine laufende Sperre vorzeitig beenden - siehe {@link klasseStundeSperren}. */
export async function klasseSperreAufheben(classCode: string) {
  return typingBackend().sperreAufheben(classCode);
}
