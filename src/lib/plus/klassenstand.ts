/**
 * DER STAND EINER KLASSE IN PLUS - die Zahlen hinter dem Reiter „Plus"
 * in „Meine Klasse".
 * ============================================================================
 *
 * ★★★★★ DIE OBERGRENZE: DIE LEHRKRAFT SIEHT GENAU DAS, WAS DAS KIND ÜBER SICH
 * SELBST SIEHT - NICHT MEHR.
 *
 * Das ist keine Floskel, sondern der Grund, warum diese Datei existiert. Die
 * Kinder-Seite „Meine Zahlen" (`components/plus/PlusStatistik.tsx`) rechnete
 * ihre Zahlen bis zum 23.09.2026 selbst aus. Hätte der Reiter der Lehrkraft
 * daneben eine zweite Rechnung bekommen, wären es zwei Stellen, die
 * voneinander nichts wissen - die teuerste Fehlerklasse in diesem Projekt
 * ([[feedback_zwei_stellen_die_voneinander_nichts_wissen]]). Beim nächsten
 * Umbau hätte die Lehrkraft etwas anderes gesehen als das Kind, und niemand
 * hätte es gemerkt. Seitdem rechnet BEIDE Seiten dieselbe Funktion hier.
 *
 * ⚠️ WAS HIER MIT ABSICHT FEHLT:
 *
 *  • **Die Vermutungen über Denkfehler** (`PlusFortschritt.vermutungen`). Sie
 *    sind ein Arbeitszettel des Coaches mit Ablaufdatum, kein Befund - und
 *    das Kind sieht sie selbst nicht. In einer Tabelle vor der Lehrkraft
 *    würden sie zum Etikett ([[feedback_nie_gegen_das_kind]]).
 *  • **Jede Zeit.** Plus misst keine Dauer, also gibt es auch nichts
 *    anzuzeigen - weder Minuten noch Tempo.
 *  • **Jede Reihung.** Die Tabelle steht nach Namen, nie nach Leistung. Wer
 *    eine Klasse nach „gerechnet" sortiert, hat eine Rangliste gebaut.
 *
 * Gelesen wird ausschliesslich - die Lehrkraft schreibt hier nichts.
 * ⚠️ Die Server-Regel `lw_progress.update` lässt ohnehin nur das Kind selbst
 * in seine Zeile schreiben; `coach.ueberschreibe()` (eine Einstufung von Hand
 * setzen) ist darum aus diesem Reiter NICHT erreichbar. Das ginge erst mit
 * einer geänderten Regel - und das ist eine Entscheidung von Johannes, keine
 * Nebenwirkung eines Reiters.
 */
import { einstufung, uebersicht, type Einstufung, type Stand } from "./coach";
import type { PlusFortschritt } from "./fortschritt";
import { PAKETE, STUFEN } from "./stoffplan";

/** Wie viele Übungen es überhaupt gibt - nie eine abgeschriebene Zahl. */
export const UEBUNGEN_GESAMT = PAKETE.length;

/** Eine Schulstufe im Überblick. */
export interface StufenZeile {
  nr: number;
  /** Wie viele Übungen diese Stufe hat. */
  gesamt: number;
  /** Wie viele davon schon angefasst wurden. */
  angefasst: number;
  /** Wie viele davon sitzen. */
  sitzt: number;
}

/**
 * Der Stand je Schulstufe - die EINE Rechnung für „Meine Zahlen" (Kind) und
 * den Reiter „Plus" (Lehrkraft). Alle acht Stufen, ungefiltert; wer nur die
 * angefassten zeigen will, filtert selbst auf `angefasst > 0`.
 */
export function stufenZeilen(stand: Stand): StufenZeile[] {
  const geuebt = new Set(Object.keys(stand.pakete));
  return STUFEN.map((s) => {
    const ids = s.pakete.map((p) => p.id);
    const angefasst = ids.filter((id) => geuebt.has(id));
    return {
      nr: s.nr,
      gesamt: ids.length,
      angefasst: angefasst.length,
      sitzt: angefasst.filter((id) => einstufung(stand, id) === "sitzt").length,
    };
  });
}

/**
 * Der Satz über EINE Schulstufe - wörtlich derselbe in „Meine Zahlen" (Kind)
 * und im Reiter „Plus" (Lehrkraft).
 *
 * ★ Der Singular ist kein Schönheitsfehler: „1 von 12 sitzen schon" war in
 * eine andere App der Plattform der häufigste Fall und wurde jedem Kind so vorgelesen (IG-E18,
 * Wächter `tests/computer-schnellcheck.test.ts`). Derselbe Satz, dieselbe
 * Lehre.
 */
export function stufenSatz(z: StufenZeile): string {
  const sitzt = z.sitzt === 1 ? "sitzt" : "sitzen";
  return `${z.nr}. Schulstufe: ${z.angefasst} von ${z.gesamt} Übungen angefangen, ${z.sitzt} ${sitzt} schon.`;
}

/** Der Stand EINES Kindes, so wie ihn die Lehrkraft sehen darf. */
export interface KindStand {
  id: string;
  name: string;
  /**
   * Hat das Kind in Plus schon gerechnet? ★ Der Unterschied zu „0 Aufgaben"
   * ist wichtig: Ein Kind ohne Zeile hat die App noch nicht geöffnet, ein Kind
   * mit 0 Aufgaben war schon da. Vor der Lehrkraft steht sonst dieselbe Null
   * für zwei ganz verschiedene Sachen.
   */
  begonnen: boolean;
  gerechnet: number;
  richtige: number;
  /** Zuletzt gewählte Schulstufe - wo das Kind gerade arbeitet. */
  stufe: number | null;
  /** Verschiedene Übungen, die angefasst wurden. */
  angefasst: number;
  /** Davon: sitzt. */
  sitzt: number;
  /** An wie vielen Tagen gerechnet wurde (eine Menge, keine Serie). */
  tage: number;
  /** Übungen ohne einen einzigen Fehler. */
  laeufeOhneFehler: number;
  abzeichen: number;
  /** Je Schulstufe - nur die angefassten. */
  jeStufe: StufenZeile[];
}

export function kindStand(
  kind: { id: string; name: string },
  f: PlusFortschritt | null,
): KindStand {
  if (!f) {
    return {
      id: kind.id, name: kind.name, begonnen: false, gerechnet: 0, richtige: 0,
      stufe: null, angefasst: 0, sitzt: 0, tage: 0, laeufeOhneFehler: 0,
      abzeichen: 0, jeStufe: [],
    };
  }
  const zeilen = stufenZeilen(f.stand);
  return {
    id: kind.id,
    name: kind.name,
    begonnen: true,
    gerechnet: f.gerechnet,
    richtige: f.richtige,
    stufe: f.stufe,
    angefasst: Object.keys(f.stand.pakete).length,
    sitzt: zeilen.reduce((s, z) => s + z.sitzt, 0),
    tage: f.tage.length,
    laeufeOhneFehler: f.laeufeOhneFehler,
    abzeichen: f.abzeichen.length,
    jeStufe: zeilen.filter((z) => z.angefasst > 0),
  };
}

/**
 * Ein Satz über die ganze Klasse - für die Lehrkraft, die wissen will, ob sich
 * das Öffnen lohnt.
 *
 * ★ Er nennt KEINE Kinder und keine Reihung, nur eine Summe. „3 von 18 Kindern
 * haben in Plus schon gerechnet" ist eine Auskunft über die Klasse; „Anna
 * hat am wenigsten gerechnet" wäre eine über ein Kind.
 */
export function klassenSatz(staende: readonly KindStand[]): string {
  if (staende.length === 0) return "In dieser Klasse ist noch kein Kind angelegt.";
  const begonnen = staende.filter((k) => k.begonnen).length;
  const aufgaben = staende.reduce((s, k) => s + k.gerechnet, 0);
  const summe = `${aufgaben} ${aufgaben === 1 ? "Aufgabe" : "Aufgaben"}`;
  /*
   * ★ Eine Klasse aus EINEM Kind ist kein Randfall (Einzelintegration). Dort
   * hiess es im ersten Entwurf „1 von 1 Kind rechnen mit Plus" und „Noch kein
   * Kind von 1 Kind" - gefunden vom Wächter, beim ersten Lauf.
   */
  if (staende.length === 1) {
    return begonnen === 0
      ? "Das Kind hat Plus noch nicht geöffnet."
      : `Das Kind rechnet mit Plus, bisher ${summe}.`;
  }
  if (begonnen === 0) return `Noch keines der ${staende.length} Kinder hat Plus geöffnet.`;
  const verb = begonnen === 1 ? "rechnet" : "rechnen";
  return `${begonnen} von ${staende.length} Kindern ${verb} mit Plus, zusammen ${summe}.`;
}

/**
 * Die Wörter für den Stand einer Übung, so wie die LEHRKRAFT sie liest.
 *
 * ★ Sie entsprechen Wort für Wort denen, die das Kind in „Meine Sammlung"
 * liest („Kann ich" · „Fast" · „Noch nicht dran", `PlusSammlung.tsx`) - nur
 * nicht in der Ich-Form. Keine Note, kein Prozentwert.
 */
export const WIE_LEHRKRAFT: Record<Einstufung, string> = {
  sitzt: "sitzt",
  wackelt: "fast",
  offen: "noch nicht dran",
};

/**
 * Die Übungen einer Schulstufe mit ihrem Stand - dieselbe Übersicht, die das
 * Kind in „Meine Sammlung" sieht (`coach.uebersicht`). Ohne Fortschritt steht
 * jede Übung auf „noch nicht dran".
 */
export function uebungenDerStufe(
  f: PlusFortschritt | null,
  stufe: number,
): { id: string; name: string; wie: Einstufung }[] {
  const stand = f?.stand ?? { koennen: {}, pakete: {}, tag: 0, heuteJePaket: {}, zuletzt: null };
  return uebersicht(stand, stufe);
}
