/**
 * ════════════════════════════════════════════════════════════════════════════
 * DIE REIHE DER „EIGENEN ÜBUNGEN" EINER BRAILLE-KLASSE.
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Vorbild `../typing/eigeneUebungReihe.ts` - das Grundmuster kommt von dort:
 * eine REIHE (nicht ein einzelner Zeiger), älteste zuerst, „Eigene Übung
 * starten" hängt AN, statt zu ersetzen. Wer Punktgenau Tage später öffnet,
 * bekommt alle noch laufenden Übungen der Reihe nach; ein Kind, das später in
 * die Klasse kommt, ebenso. „Fertig" steht je Kind UND je Text, am KONTO, nicht
 * am Gerät - auf einem Klassenrechner sitzen mehrere Kinder.
 *
 * **Bewusste Doppelung, kein gemeinsames Bauteil**: Braille braucht zusätzlich
 * eine Arbeitsweise (schreiben/lesen) und einen Schriftbereich je Übung, und
 * vor allem die Zeichen-Prüfung unten, die es bei Tastenflow nicht gibt (dort
 * ist jedes Zeichen auf der Tastatur ohnehin gelernt, sobald es die Umschalt-
 * taste einmal gibt - bei Braille ist ein Zeichen erst dann bekannt, wenn
 * seine Zelle unterrichtet wurde). ★★★ Eine Änderung an der REIHEN-LOGIK
 * (anhängen, Obergrenze, Aufräumregel) gehört darum an BEIDE Stellen - hier
 * UND in `typing/eigeneUebungReihe.ts`
 * ([[feedback_zwei_stellen_die_voneinander_nichts_wissen]]).
 *
 * Nur reine Funktionen: kein React, kein Backend, kein `localStorage`.
 */
import type { Arbeitsweise } from "./wertung";
import type { AreaKey, Area } from "./areas";
import { currentIndex, etappeItems } from "./areas";
import type { BrailleProgress } from "./progress";

// ── Die Reihe ────────────────────────────────────────────────────────────────

/** So viele Übungen hält die Reihe höchstens (Muster `EIGENE_UEBUNGEN_HOECHSTENS`). */
export const EIGENE_UEBUNGEN_HOECHSTENS = 20;

/** Dateinamen werden für die Reihe gekürzt - der volle Name steht an der Textzeile selbst. */
const DATEINAME_HOECHSTENS = 120;

/**
 * Ein Eintrag der Reihe - älteste zuerst. Entspricht EINER Zeile in
 * `br_eigene_texte` (die Zeilen SIND die Reihe, siehe `setup.mjs`): ein neuer
 * Upload legt eine neue Zeile an, „Beenden" setzt `aktiv` auf `false`, statt
 * die Zeile zu löschen - Aufräumen entscheidet {@link reiheMitNeuer} unten,
 * nicht ein Löschbefehl von Hand.
 */
export interface EigeneUebungEintrag {
  /** Id der Zeile in `br_eigene_texte` - der Text selbst liegt dort. */
  textId: string;
  /** Für die Anzeige, ohne eigene Abfrage der Textzeile. */
  dateiname: string;
  arbeitsweise: Arbeitsweise;
  bereich: AreaKey;
  /** Wann gestartet (ms). */
  gestartetAm: number;
  /** Kennung der Lehrkraft, die gestartet hat. */
  von: string;
}

/**
 * Die Reihe aus dem rohen Serverwert lesen - wehrhaft: Ein kaputter Eintrag
 * fällt weg, er setzt keinem Kind eine falsche Übung vor. Eine doppelte
 * `textId` zählt nur einmal (die frühere Stelle gilt). Muster
 * `eigeneUebungenAusRoh()`.
 */
export function eigeneUebungenAusRoh(roh: unknown): EigeneUebungEintrag[] {
  if (!Array.isArray(roh)) return [];
  const gesehen = new Set<string>();
  const reihe: EigeneUebungEintrag[] = [];
  for (const e of roh) {
    if (!e || typeof e !== "object") continue;
    const p = e as Record<string, unknown>;
    const textId = typeof p.textId === "string" ? p.textId.trim() : "";
    if (!textId || gesehen.has(textId)) continue;
    const arbeitsweise = p.arbeitsweise === "schreiben" || p.arbeitsweise === "lesen" ? p.arbeitsweise : null;
    const bereich = typeof p.bereich === "string" && p.bereich ? (p.bereich as AreaKey) : null;
    if (!arbeitsweise || !bereich) continue;
    gesehen.add(textId);
    const amRoh = typeof p.gestartetAm === "number" ? p.gestartetAm : Number(p.gestartetAm);
    reihe.push({
      textId,
      dateiname: typeof p.dateiname === "string" ? p.dateiname : "",
      arbeitsweise,
      bereich,
      gestartetAm: Number.isFinite(amRoh) ? amRoh : 0,
      von: typeof p.von === "string" ? p.von : "",
    });
  }
  return reihe;
}

/**
 * Eine neue Übung HINTEN anhängen. Wird die Reihe dadurch länger als
 * {@link EIGENE_UEBUNGEN_HOECHSTENS}, fällt zuerst die älteste, die schon
 * ALLE Kinder fertig haben (`vonAllenFertig`), sonst die älteste überhaupt -
 * nie die gerade angehängte. Dieselbe `textId` noch einmal ändert nichts
 * (Muster `reiheMitNeuer()`).
 */
export function reiheMitNeuer(
  reihe: readonly EigeneUebungEintrag[],
  neu: EigeneUebungEintrag,
  vonAllenFertig: readonly string[] = [],
): EigeneUebungEintrag[] {
  if (reihe.some((e) => e.textId === neu.textId)) return [...reihe];
  const eintrag = { ...neu, dateiname: neu.dateiname.slice(0, DATEINAME_HOECHSTENS) };
  const ergebnis = [...reihe, eintrag];
  const fertig = new Set(vonAllenFertig);
  while (ergebnis.length > EIGENE_UEBUNGEN_HOECHSTENS) {
    const i = ergebnis.findIndex((e, j) => j < ergebnis.length - 1 && fertig.has(e.textId));
    ergebnis.splice(i >= 0 ? i : 0, 1);
  }
  return ergebnis;
}

/** Eine Übung aus der Reihe nehmen („Beenden" - am Server: Zeile auf `aktiv = false`). */
export function reiheOhne(reihe: readonly EigeneUebungEintrag[], textId: string): EigeneUebungEintrag[] {
  return reihe.filter((e) => e.textId !== textId);
}

// ── „Fertig" - je Kind UND je Text, am Konto ────────────────────────────────

/**
 * Der Fertig-Stand eines Kindes - Form absichtlich EIGENSTÄNDIG und nicht an
 * `BrailleProgress` gebunden: Wo dieser Stand am Server abgelegt wird (z. B.
 * im ohnehin vorhandenen `data`-Feld von `br_progress`), entscheidet die
 * Verdrahtung. `progress.ts` selbst bleibt unangetastet (nicht in der
 * Dateihoheit dieses Baus) - siehe Bericht.
 */
export type EigeneUebungFortschritt = Readonly<Record<string, { fertig: boolean }>> | null | undefined;

/** Hat DIESES Kind diesen Text einmal ganz geschrieben/gelesen? */
export function hatFertig(fortschritt: EigeneUebungFortschritt, textId: string): boolean {
  return fortschritt?.[textId]?.fertig === true;
}

/** Die Übung, an der DIESES Kind jetzt arbeitet: die älteste der Reihe, die es noch nicht fertig hat. */
export function naechsteOffeneUebung(
  reihe: readonly EigeneUebungEintrag[],
  fortschritt: EigeneUebungFortschritt,
): EigeneUebungEintrag | null {
  return reihe.find((e) => !hatFertig(fortschritt, e.textId)) ?? null;
}

/** „n von m Kindern fertig" - aus Fortschritten, die die Lehrkraft-Seite ohnehin schon geladen hat. */
export function fertigeKinder(
  textId: string,
  fortschritte: readonly EigeneUebungFortschritt[],
): { fertig: number; gesamt: number } {
  return {
    fertig: fortschritte.filter((f) => hatFertig(f, textId)).length,
    gesamt: fortschritte.length,
  };
}

/** Die `textId`s, die schon JEDES Kind fertig hat (für {@link reiheMitNeuer}). */
export function vonAllenFertig(
  reihe: readonly EigeneUebungEintrag[],
  fortschritte: readonly EigeneUebungFortschritt[] | undefined,
): string[] {
  if (!fortschritte || fortschritte.length === 0) return [];
  return reihe.filter((e) => fortschritte.every((f) => hatFertig(f, e.textId))).map((e) => e.textId);
}

/** Der kurze Stand neben dem Schalter „Eigene Übung" - EINE Rechnung für Kasten und Zeile. */
export function eigeneUebungKurzstand(reihe: readonly EigeneUebungEintrag[]): string {
  if (reihe.length === 0) return "nicht zugewiesen";
  if (reihe.length === 1) return `zugewiesen: ${reihe[0].dateiname}`;
  return `${reihe.length} zugewiesen, der Reihe nach`;
}

// ── Die Prüffunktion: passt der Text zum Schriftbereich des Kindes? ─────────

/**
 * ★★★ ZUSÄTZLICH ZU TASTENFLOW NÖTIG (Auftrag, Schritt 3): welche Zeichen hat
 * dieses Kind in diesem Schriftbereich schon gesehen?
 *
 * Gebaut aus den Etappen, die das Kind schon ERREICHT hat - bis einschliesslich
 * der aktuellen (die es noch nicht gemeistert hat, aber schon eingeführt
 * bekam, {@link currentIndex}). Etappen dahinter sind noch nicht dran und
 * zählen nicht als „gesehen". Gross-/Kleinschreibung ist dabei egal - dieselbe
 * Regel wie `zeichenVorrat()` in `typing/schreibprobe.ts`: eine gelernte
 * Zelle deckt Klein- UND Grossform.
 */
export function bekannteZeichenImBereich(area: Area, progress: BrailleProgress): Set<string> {
  const bekannt = new Set<string>([" "]);
  const grenze = Math.min(currentIndex(area, progress), area.etappen.length - 1);
  for (let i = 0; i <= grenze; i++) {
    for (const wort of etappeItems(area.etappen[i])) {
      for (const zeichen of wort) bekannt.add(zeichen.toLowerCase());
    }
  }
  return bekannt;
}

/**
 * Die Zeichen aus `text`, die NICHT in `bekannt` vorkommen - einmal je
 * Zeichen, in der Reihenfolge des ersten Auftretens. Zeilenumbrüche zählen
 * nie mit.
 */
export function unbekannteZeichen(text: string, bekannt: ReadonlySet<string>): string[] {
  const gefunden: string[] = [];
  const gesehen = new Set<string>();
  for (const zeichen of text) {
    if (zeichen === "\n" || zeichen === "\r" || gesehen.has(zeichen)) continue;
    gesehen.add(zeichen);
    if (!bekannt.has(zeichen.toLowerCase())) gefunden.push(zeichen);
  }
  return gefunden;
}

export interface SchriftbereichPruefung {
  /** `true`, wenn JEDES Zeichen des Textes im Schriftbereich des Kindes vorkommt. */
  passt: boolean;
  /** Die Zeichen, die es noch nie gesehen hat - leer, wenn `passt` gilt. */
  unbekannt: string[];
}

/**
 * Die ganze Prüfung auf einmal: Passt dieser Text zum Schriftbereich DIESES
 * Kindes? Ein Text mit Zeichen, die das Kind noch nie gesehen hat, ist keine
 * Übung, sondern eine Sackgasse (Auftrag, wörtlich) - was eine Oberfläche mit
 * dem Befund macht (warnen, ablehnen, Zeichen vorher üben lassen), entscheidet
 * ein späterer Bau.
 */
export function textPasstZuSchriftbereich(
  text: string,
  area: Area,
  progress: BrailleProgress,
): SchriftbereichPruefung {
  const unbekannt = unbekannteZeichen(text, bekannteZeichenImBereich(area, progress));
  return { passt: unbekannt.length === 0, unbekannt };
}
