/**
 * BESCHLÜSSE DER LEHRKRAFT FÜR PLUS - und welche Schulstufe ein Kind rechnet.
 * ============================================================================
 *
 * > **Johannes, 23.09.2026:** „a) je Übung, bau es ein - aber ich möchte
 * > nicht, dass das Kind die Schulstufe frei wählen kann, wenn es Teil einer
 * > Klasse ist. Bestimmt die Schulstufe die Klasseneinstellung, wer selbst
 * > lernt, darf wählen."
 *
 * ★★★★ DER WEG IST DERSELBE WIE IN TASTENFLOW - und das ist die ganze Idee.
 *
 * Den Fortschritt eines Kindes darf nur das Kind selbst schreiben (Regel
 * `lw_progress.update`). Die Lehrkraft schreibt darum nicht in den
 * Fortschritt, sondern einen BESCHLUSS in das Konto des Kindes
 * (`tt_pupils.plusBeschluss`) - ein Feld, das umgekehrt nur sie schreiben
 * darf (`tt_pupils_field_guard`, LOCKED). Die App des Kindes übernimmt ihn
 * beim nächsten Öffnen, genau einmal je Beschluss. So macht es Tastenflow mit
 * dem Startpunkt (`startUnits` + `startUnitsAt`, `startpunktAnwenden`), und so
 * braucht es kein neues Schreibrecht auf die Lerndaten.
 *
 * ── Die Schulstufe ─────────────────────────────────────────────────────────
 *
 * Die Klasse trägt ihre Schulstufe schon (`tt_classes.schulstufe`, sie wächst
 * mit jedem Schuljahr von selbst mit - `aktuelleSchulstufe`). Plus liest sie
 * und legt nichts Eigenes daneben: Eine zweite Stufe „nur für Plus" in der
 * Klasse wäre die zweite Wahrheit, die beim nächsten Schuljahr nicht mitwächst.
 *
 * ⚠️ Drei Fälle, die die Klassenstufe allein nicht beantwortet:
 *  • **Keine Schulstufe eingetragen** → das Kind wählt selbst. Es gibt nichts,
 *    was bestimmen könnte; eine erfundene Stufe wäre schlimmer als die Wahl.
 *    Der Reiter sagt es der Lehrkraft.
 *  • **9. bis 13. Schulstufe, „Erwachsen"** → 8. Plus hört mit der 8. auf.
 *  • **Ein Kind rechnet anders als seine Klasse** (Förderbedarf in Mathematik,
 *    oder schon viel weiter) → die Lehrkraft setzt für DIESES Kind eine
 *    eigene Stufe (`stufe` im Beschluss). Ohne diese Ausnahme wäre die
 *    Klassenregel für genau die Kinder eine Mauer, für die ein inklusiver
 *    Unterricht gebaut ist. ⚠️ Diese Ausnahme hat Johannes nicht ausdrücklich
 *    bestellt (23.09.2026) - sie steht zur Entscheidung.
 */
import type { Einstufung } from "./coach";
import { ueberschreibe, type Stand } from "./coach";
import { STUFEN } from "./stoffplan";
import { heileFuerAlle, type UebungFuerAlle } from "./lehrerUebung";
import { WOCHENZIELE } from "./abzeichen";
import { BRAILLESCHRIFTEN, EINGABEWEGE, ZEILENBREITEN, type BrailleSchrift, type Eingabeweg, type Vorgabe, type Zeilenbreite } from "./einstellungen";

/** Die Schulstufen, die Plus hat. */
export const PLUS_STUFE_MIN = 1;
export const PLUS_STUFE_MAX = STUFEN.length;

/** Was die Lehrkraft für eine Übung beschließen kann. */
export type UebungsBeschluss = Extract<Einstufung, "sitzt" | "offen">;

/**
 * ★ Die Einstellungen der KLASSE (Johannes, 16.10.2026: „kaum etwas
 * einzustellen"). Sie stehen - wie die Übung für alle - bei JEDEM Kind der
 * Klasse im Beschluss, nicht in `tt_classes.settings` (fast voll). Gespeichert
 * wird nur, was vom Gewohnten ABWEICHT: ein leeres Objekt heißt „alles wie
 * immer", und eine spätere Standardänderung trifft keine Klasse, die nichts
 * eingestellt hat.
 *
 * Jede Einstellung nimmt dem Kind etwas ab oder lässt etwas weg - keine
 * schaltet etwas Neues gegen das Kind ein.
 */
export interface KlassenEinstellung {
  /** Aufgaben je Woche, vorgegeben. Fehlt = das Kind wählt sein Wochenziel selbst. */
  wochenziel?: number;
  /** Rätsel nach jeder N. Runde; `0` = nie. Fehlt = nach jeder dritten. */
  raetsel?: 0 | 5;
  /** `false` = keine Spiele. Fehlt = erlaubt. */
  spiele?: false;
  /** `false` = „Ich wähle" ist aus, es bleiben Mein Training und die Übung für alle. Fehlt = erlaubt. */
  freieWahl?: false;
  /** `false` = kein Rechenweg auf Knopfdruck (etwa in einer Kontrollstunde). Fehlt = erlaubt. */
  rechenweg?: false;
  /** Braillezeile für alle Kinder der Klasse: `true` = an. Fehlt = jedes Kind wählt selbst. */
  braillezeile?: true;
  /** Braille-Schrift für alle. Fehlt = jedes Kind wählt selbst. */
  schrift?: BrailleSchrift;
  /** Die Braillezeile hat 40 oder 80 Zeichen - für alle. Fehlt = jedes Kind wählt selbst. */
  breite?: Zeilenbreite;
  /** Wie die Kinder schreiben: Zahlen auf der Tastatur oder Braille greifen. Fehlt = jedes Kind wählt selbst. */
  eingabe?: Eingabeweg;
}

/**
 * ★ Die Braille-Einstellungen EINES Kindes (Johannes, 19.10.2026) - für das Kind mit
 * Blindheit in einer Klasse, in der die anderen ohne Braillezeile rechnen. Sie
 * gehen vor die der Klasse; `braillezeile: false` heißt „bei diesem Kind aus",
 * auch wenn die Klasse sie vorgibt. Fehlt ein Feld, gilt das der Klasse, dann die
 * eigene Wahl des Kindes.
 */
export interface KindBraille {
  braillezeile?: boolean;
  schrift?: BrailleSchrift;
  breite?: Zeilenbreite;
  eingabe?: Eingabeweg;
}

export interface PlusBeschluss {
  /**
   * Die Schulstufe DIESES Kindes in Plus, abweichend von der Klasse.
   * Fehlt oder `null` = wie die Klasse.
   */
  stufe?: number | null;
  /**
   * Einstufung je Übung von Hand. Fehlt ein Eintrag = wie der Coach sagt.
   * `am` macht aus dem Wert einen Beschluss - ohne ihn liesse sich nicht
   * sagen, ob das Kind ihn schon übernommen hat (wie `startUnitsAt`).
   */
  uebungen?: Record<string, { wert: UebungsBeschluss; am: number }>;
  /**
   * Die Übung für alle (28.09.2026) - dieselbe steht bei jedem Kind der
   * Klasse. Fehlt oder `null` = keine läuft. Regel: `lehrerUebung.ts`.
   * ★ Sie ist KEIN einmaliger Beschluss wie `uebungen`: Sie gilt, solange sie
   * dasteht, und das Kind merkt sich selbst, dass es sie fertig hat.
   */
  fuerAlle?: UebungFuerAlle | null;
  /** Die Einstellungen der Klasse - bei jedem Kind dieselben. Fehlt = alles wie immer. */
  klasse?: KlassenEinstellung;
  /** Braille-Einstellungen nur für dieses Kind; sie gehen vor die der Klasse. */
  braille?: KindBraille;
}

/** Was aus dem Konto kommt, ist roh - hier wird es verlässlich. */
export function heileBeschluss(roh: unknown): PlusBeschluss {
  if (!roh || typeof roh !== "object" || Array.isArray(roh)) return {};
  const o = roh as Record<string, unknown>;
  const aus: PlusBeschluss = {};
  const stufe = Number(o.stufe);
  if (o.stufe !== null && o.stufe !== undefined && Number.isInteger(stufe)
    && stufe >= PLUS_STUFE_MIN && stufe <= PLUS_STUFE_MAX) {
    aus.stufe = stufe;
  }
  if (o.uebungen && typeof o.uebungen === "object" && !Array.isArray(o.uebungen)) {
    const u: NonNullable<PlusBeschluss["uebungen"]> = {};
    for (const [id, e] of Object.entries(o.uebungen as Record<string, unknown>)) {
      const w = (e as { wert?: unknown } | null)?.wert;
      const am = Number((e as { am?: unknown } | null)?.am);
      if ((w === "sitzt" || w === "offen") && Number.isFinite(am) && am > 0) {
        u[id] = { wert: w, am };
      }
    }
    if (Object.keys(u).length) aus.uebungen = u;
  }
  const fuerAlle = heileFuerAlle(o.fuerAlle);
  if (fuerAlle) aus.fuerAlle = fuerAlle;
  const klasse = heileKlasse(o.klasse);
  if (Object.keys(klasse).length) aus.klasse = klasse;
  const braille = heileKindBraille(o.braille);
  if (Object.keys(braille).length) aus.braille = braille;
  return aus;
}

/** Die Einstellungen der Klasse aus rohen Daten - Unbekanntes fällt weg. */
export function heileKlasse(roh: unknown): KlassenEinstellung {
  if (!roh || typeof roh !== "object" || Array.isArray(roh)) return {};
  const o = roh as Record<string, unknown>;
  const k: KlassenEinstellung = {};
  const ziel = Number(o.wochenziel);
  if ((WOCHENZIELE as readonly number[]).includes(ziel)) k.wochenziel = ziel;
  if (o.raetsel === 0 || o.raetsel === 5) k.raetsel = o.raetsel;
  if (o.spiele === false) k.spiele = false;
  if (o.freieWahl === false) k.freieWahl = false;
  if (o.rechenweg === false) k.rechenweg = false;
  if (o.braillezeile === true) k.braillezeile = true;
  if (BRAILLESCHRIFTEN.includes(o.schrift as BrailleSchrift)) k.schrift = o.schrift as BrailleSchrift;
  if ((ZEILENBREITEN as readonly unknown[]).includes(o.breite)) k.breite = o.breite as Zeilenbreite;
  if (EINGABEWEGE.includes(o.eingabe as Eingabeweg)) k.eingabe = o.eingabe as Eingabeweg;
  return k;
}

/** Die Braille-Einstellungen eines Kindes aus rohen Daten - Unbekanntes fällt weg. */
export function heileKindBraille(roh: unknown): KindBraille {
  if (!roh || typeof roh !== "object" || Array.isArray(roh)) return {};
  const o = roh as Record<string, unknown>;
  const b: KindBraille = {};
  if (typeof o.braillezeile === "boolean") b.braillezeile = o.braillezeile;
  if (BRAILLESCHRIFTEN.includes(o.schrift as BrailleSchrift)) b.schrift = o.schrift as BrailleSchrift;
  if ((ZEILENBREITEN as readonly unknown[]).includes(o.breite)) b.breite = o.breite as Zeilenbreite;
  if (EINGABEWEGE.includes(o.eingabe as Eingabeweg)) b.eingabe = o.eingabe as Eingabeweg;
  return b;
}

/** Die Braille-Einstellungen eines Kindes setzen - leere Werte fallen weg (= wie die Klasse). */
export function mitKindBraille(b: PlusBeschluss, k: KindBraille): PlusBeschluss {
  const aus: PlusBeschluss = { ...b };
  const sauber = heileKindBraille(k);
  if (Object.keys(sauber).length === 0) delete aus.braille;
  else aus.braille = sauber;
  return aus;
}

/**
 * ★ Was die Lehrkraft für die Braillezeile eines Kindes festlegt: das Kind vor der
 * Klasse, Feld für Feld. Was in keinem von beiden steht, wählt das Kind selbst.
 * Wer in keiner Klasse ist, bekommt nie eine Vorgabe (`inKlasse`).
 */
export function braillevorgabe(inKlasse: boolean, beschluss: PlusBeschluss | null | undefined): Vorgabe {
  if (!inKlasse) return {};
  const k = beschluss?.klasse;
  const c = beschluss?.braille;
  const v: Vorgabe = {};
  const zeile = c?.braillezeile ?? (k?.braillezeile ? true : undefined);
  const schrift = c?.schrift ?? k?.schrift;
  const breite = c?.breite ?? k?.breite;
  if (zeile !== undefined) v.braillezeile = zeile;
  if (schrift !== undefined) v.schrift = schrift;
  if (breite !== undefined) v.breite = breite;
  const eingabe = c?.eingabe ?? k?.eingabe;
  if (eingabe !== undefined) v.eingabe = eingabe;
  return v;
}

/** Die Einstellungen der Klasse setzen - leere Werte fallen weg (= wie immer). */
export function mitKlasse(b: PlusBeschluss, k: KlassenEinstellung): PlusBeschluss {
  const aus: PlusBeschluss = { ...b };
  const sauber = heileKlasse(k);
  if (Object.keys(sauber).length === 0) delete aus.klasse;
  else aus.klasse = sauber;
  return aus;
}

/**
 * Nach der wievielten Runde ein Rätsel kommt - `null` heißt: nie.
 * Standard: nach jeder dritten (`RUNDEN_BIS_RAETSEL` in `coach.ts`).
 */
export function raetselNach(k: KlassenEinstellung | undefined, standard: number): number | null {
  if (k?.raetsel === 0) return null;
  return k?.raetsel ?? standard;
}

/**
 * Die Plus-Stufe zur Schulstufe einer Klasse. `null` = keine eingetragen.
 * Über der 8. (auch „Erwachsen", gespeichert als 100) gilt die 8.
 */
export function plusStufeAusKlasse(schulstufe: number | null): number | null {
  if (schulstufe === null || !Number.isFinite(schulstufe)) return null;
  return Math.max(PLUS_STUFE_MIN, Math.min(PLUS_STUFE_MAX, Math.round(schulstufe)));
}

/**
 * ★★★ Welche Schulstufe ein Kind in Plus rechnet - oder `null`: Es wählt selbst.
 *
 * @param inKlasse   gehört das Konto einer Klasse an? (Selbstlernende: nein)
 * @param klassenStufe die HEUTIGE Schulstufe der Klasse (`aktuelleSchulstufe`)
 * @param beschluss  der Beschluss der Lehrkraft für dieses Kind
 */
export function festeStufe(
  inKlasse: boolean,
  klassenStufe: number | null,
  beschluss: PlusBeschluss | null | undefined,
): number | null {
  if (!inKlasse) return null;
  const eigene = beschluss?.stufe;
  if (typeof eigene === "number") return eigene;
  return plusStufeAusKlasse(klassenStufe);
}

/**
 * Die Beschlüsse übernehmen, die das Kind noch nicht übernommen hat.
 *
 * ★ Genau einmal je Beschluss: `angewandt` ist der jüngste Zeitpunkt, der
 * schon übernommen ist. Verglichen werden nur Stempel der Lehrkraft
 * untereinander - nie mit der Uhr des Kindes, die falsch gehen kann.
 *
 * ★ „Wie der Coach sagt" (Eintrag entfernt) nimmt nichts zurück. Was einmal
 * übernommen ist, gehört zum Lernstand; ab da entscheidet wieder der Coach.
 * Tastenflow hält es mit dem Startpunkt genauso.
 */
export function wendeBeschluesseAn(
  stand: Stand,
  angewandt: number,
  beschluss: PlusBeschluss | null | undefined,
): { stand: Stand; angewandt: number; neu: number } {
  let s = stand;
  let bis = angewandt;
  let neu = 0;
  const eintraege = Object.entries(beschluss?.uebungen ?? {})
    .filter(([, e]) => e.am > angewandt)
    .sort((a, b) => a[1].am - b[1].am);
  for (const [id, e] of eintraege) {
    if (!STUFEN.some((st) => st.pakete.some((p) => p.id === id))) continue;
    s = ueberschreibe(s, id, e.wert);
    bis = Math.max(bis, e.am);
    neu += 1;
  }
  return { stand: s, angewandt: bis, neu };
}

/** Einen Beschluss für eine Übung setzen - `null` heisst „wie der Coach sagt". */
export function mitUebung(
  b: PlusBeschluss,
  id: string,
  wert: UebungsBeschluss | null,
  jetztMs: number = Date.now(),
): PlusBeschluss {
  const uebungen = { ...(b.uebungen ?? {}) };
  if (wert === null) delete uebungen[id];
  else uebungen[id] = { wert, am: jetztMs };
  const aus: PlusBeschluss = { ...b, uebungen };
  if (Object.keys(uebungen).length === 0) delete aus.uebungen;
  return aus;
}

/** Die eigene Stufe eines Kindes setzen - `null` heisst „wie die Klasse". */
export function mitStufe(b: PlusBeschluss, stufe: number | null): PlusBeschluss {
  const aus: PlusBeschluss = { ...b };
  if (stufe === null) delete aus.stufe;
  else aus.stufe = stufe;
  return aus;
}

/** Die Übung für alle setzen - `null` beendet sie. Stufe und Einstufungen bleiben. */
export function mitFuerAlle(b: PlusBeschluss, u: UebungFuerAlle | null): PlusBeschluss {
  const aus: PlusBeschluss = { ...b };
  if (u === null) delete aus.fuerAlle;
  else aus.fuerAlle = u;
  return aus;
}
