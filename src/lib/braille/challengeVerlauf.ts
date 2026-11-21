/**
 * ════════════════════════════════════════════════════════════════════════════
 * DER VERLAUF MEHRERER BRAILLE-CHALLENGES (22.09.2026)
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Vorbild `../typing/schreibprobenUebersicht.ts`: Bis hierher gab es nur
 * `listeChallengeErgebnisse(classCode, probeId)` - die Abgaben EINER Runde.
 * Weder die Lehrkraft noch ein Kind konnten sehen, wie sich eine Klasse oder
 * ein Kind über MEHRERE Runden entwickelt hat. `backend.ts` liefert seit
 * diesem Zubau `listeChallengeVerlaufKlasse`/`listeChallengeVerlaufKind` -
 * ALLE Abgaben, über alle Runden hinweg. Dieses Modul rechnet daraus, ohne
 * React, ohne Backend-Zugriff: reine Funktionen wie das Vorbild und wie
 * `challenge.ts`/`wertung.ts`, auf denen es aufbaut.
 *
 * ⚠️⚠️⚠️ SCHREIBEN UND LESEN WERDEN NIE GEGENEINANDER VERGLICHEN.
 *
 * `wertung.ts` warnt ausdrücklich: Eine Kurzschrift-Zelle kann für mehrere
 * Zeichen stehen, und Schreiben (Zellen/Min) gegen Lesen (Zeichen/Min) zu
 * stellen wäre ein Messfehler, kein Befund. Jede Funktion hier, die zwei
 * Runden vergleicht, sucht die VORIGE Runde DERSELBEN Arbeitsweise - eine
 * Runde „lesen" wird nie gegen eine Runde „schreiben" gehalten, ganz gleich
 * wie viele andersartige Runden dazwischenliegen. Wächter:
 * `tests/braille-challenge-verlauf.test.ts`.
 *
 * ── Die Totzone kommt vom Vorbild, nicht neu erfunden ───────────────────────
 * Der Leistungswert (0..100) ist dieselbe Art Zahl wie der „Score" beim
 * Tippen ({@link import("../typing/veraenderung").Groesse} `"score"`) - eine
 * aus Güte und Tempo zusammengesetzte Punktzahl. Für die Frage „ist das eine
 * Entwicklung oder nur Messrauschen" wird darum dieselbe Totzone (2 Punkte,
 * `TOTZONE.score` in `../typing/veraenderung.ts`) wiederverwendet statt einer
 * zweiten, erfundenen Schwelle ([[feedback_zwei_stellen_die_voneinander_nichts_wissen]]).
 *
 * ── Keine Wertung über ein Kind oder eine Klasse ────────────────────────────
 * Wie beim Vorbild: Dieses Modul liefert Zahlen und Richtungen, keine Sätze,
 * die eine sinkende Zahl bedauern oder eine steigende loben. Die Oberfläche,
 * die diese Werte zeigt (`Veraenderungspfeil`), setzt das um -
 * `feedback_nie_gegen_das_kind`.
 */
import type { AreaKey } from "./areas";
import { challengeWertung, type ChallengeErgebnis } from "./challenge";
import type { Arbeitsweise } from "./wertung";
import { veraenderung as berechneVeraenderung, type Veraenderung } from "../typing/veraenderung";

/**
 * Alle Abgaben EINER Runde (= eines `probeId`), zu einer Zeile gebündelt.
 *
 * `begonnenMs` ist kein Feld aus `ChallengePlan` (der Plan selbst ist nach
 * dem Ende der Runde nicht mehr aufzufinden - er wird beim nächsten Start
 * bzw. bei „Absagen" überschrieben, siehe `BrailleChallengeKasten.tsx`).
 * Verlässlich bleibt nur, WANN Kinder abgegeben haben - das früheste
 * `eingereichtMs` der Runde ist der beste verfügbare Anhaltspunkt für „wann
 * diese Runde stattfand".
 */
export interface ChallengeRunde {
  probeId: string;
  arbeitsweise: Arbeitsweise;
  bereich: AreaKey;
  /** Früheste Abgabe dieser Runde (ms) - als Datum der Runde verwendet. */
  begonnenMs: number;
  ergebnisse: readonly ChallengeErgebnis[];
}

/**
 * Die Ergebnisse EINER Klasse (oder eines Kindes) zu RUNDEN gebündelt -
 * jüngste zuerst. Ein leerer Eingang liefert eine leere Liste, keinen Fehler.
 *
 * ⚠️ Nur Runden MIT mindestens einer Abgabe erscheinen hier - eine Runde ohne
 * jede Abgabe hinterlässt keine Zeile in `br_challenges` und ist damit für
 * dieses Modul unsichtbar. Das ist gewollt: eine leere Runde hat nichts zu
 * zeigen (Muster `SchreibprobenListe.tsx`: „ohne Ergebnis gibt die Komponente
 * `null` zurück").
 */
export function challengeRunden(ergebnisse: readonly ChallengeErgebnis[]): ChallengeRunde[] {
  const nach = new Map<string, ChallengeErgebnis[]>();
  for (const e of ergebnisse) {
    const liste = nach.get(e.probeId);
    if (liste) liste.push(e);
    else nach.set(e.probeId, [e]);
  }
  const runden: ChallengeRunde[] = [...nach.entries()].map(([probeId, liste]) => ({
    probeId,
    // Arbeitsweise/Bereich gehören zur RUNDE, nicht zum einzelnen Kind - alle
    // Abgaben eines `probeId` teilen sie sich (derselbe Plan der Lehrkraft).
    arbeitsweise: liste[0].arbeitsweise,
    bereich: liste[0].bereich,
    begonnenMs: Math.min(...liste.map((e) => e.eingereichtMs)),
    ergebnisse: liste,
  }));
  return runden.sort((a, b) => b.begonnenMs - a.begonnenMs);
}

/**
 * Der Leistungswert-Schnitt einer Runde, ganzzahlig gerundet - `null` ohne
 * Abgabe (kommt in der Praxis nicht vor, siehe {@link challengeRunden}, ist
 * aber wehrhaft für den Fall einer leeren Liste von Hand).
 */
export function rundenSchnitt(runde: Pick<ChallengeRunde, "ergebnisse">): number | null {
  if (runde.ergebnisse.length === 0) return null;
  const werte = runde.ergebnisse.map((e) => challengeWertung(e).wert);
  return Math.round((werte.reduce((s, x) => s + x, 0) / werte.length) * 10) / 10;
}

/**
 * Die Veränderung zweier Leistungswerte - EINE Stelle, die die Totzone des
 * Vorbilds benutzt ({@link import("../typing/veraenderung").veraenderung}
 * mit `"score"`). `null`, wenn einer der beiden Werte fehlt (keine vorige
 * Runde, oder eine leere Runde ohne Abgabe).
 *
 * ⚠️ Diese Funktion selbst prüft NICHT, ob beide Werte zur selben
 * Arbeitsweise gehören - das ist Sache der Aufrufer hier im Modul
 * ({@link rundenVeraenderung}, {@link kindVeraenderung}), die die vorige
 * Runde/Abgabe immer erst nach der Arbeitsweise filtern. Wer diese Funktion
 * mit zwei Werten unterschiedlicher Arbeitsweise aufruft, hat den Fehler also
 * schon VOR diesem Aufruf gemacht.
 */
export function leistungswertVeraenderung(
  jetzt: number | null,
  vorher: number | null,
): Veraenderung | null {
  return berechneVeraenderung(jetzt, vorher, "score");
}

/**
 * Die Veränderung des Rundenschnitts gegenüber der VORIGEN Runde DERSELBEN
 * Arbeitsweise (Klassen-Sicht - für die Verlaufsübersicht der Lehrkraft).
 *
 * `runden` muss jüngste-zuerst sortiert sein (das Ergebnis von
 * {@link challengeRunden} ist es). Gibt es die gesuchte Runde nicht oder
 * keine vorige Runde derselben Arbeitsweise, `null`.
 */
export function rundenVeraenderung(
  runden: readonly ChallengeRunde[],
  probeId: string,
): Veraenderung | null {
  const index = runden.findIndex((r) => r.probeId === probeId);
  if (index < 0) return null;
  const ziel = runden[index];
  // `runden` ist jüngste zuerst - die VORIGE Runde derselben Arbeitsweise
  // liegt darum weiter HINTEN in der Liste (Muster `SchreibprobenListe.tsx`:
  // `liste.slice(i + 1).find(...)`).
  const vorige = runden.slice(index + 1).find((r) => r.arbeitsweise === ziel.arbeitsweise);
  if (!vorige) return null;
  return leistungswertVeraenderung(rundenSchnitt(ziel), rundenSchnitt(vorige));
}

/**
 * Die Veränderung EINES Kindes gegenüber seiner letzten Abgabe DERSELBEN
 * Arbeitsweise (Kind-Sicht - für eine künftige eigene Statistik, siehe
 * Bericht: Diese Datei baut nur das Fundament, die Anzeige beim Kind selbst
 * liegt in `src/components/braille/**`, ausserhalb der Dateihoheit dieses
 * Zubaus).
 *
 * `ergebnisseDesKindes` muss nicht sortiert sein - die Funktion sucht selbst
 * die jüngste frühere Abgabe (vor `ergebnis.eingereichtMs`) derselben
 * Arbeitsweise. `null`, wenn es keine gibt (erste Runde dieser Arbeitsweise).
 */
export function kindVeraenderung(
  ergebnisseDesKindes: readonly ChallengeErgebnis[],
  ergebnis: ChallengeErgebnis,
): Veraenderung | null {
  const vorherige = ergebnisseDesKindes
    .filter(
      (e) =>
        e.arbeitsweise === ergebnis.arbeitsweise &&
        e.probeId !== ergebnis.probeId &&
        e.eingereichtMs < ergebnis.eingereichtMs,
    )
    .sort((a, b) => b.eingereichtMs - a.eingereichtMs)[0];
  if (!vorherige) return null;
  return leistungswertVeraenderung(
    challengeWertung(ergebnis).wert,
    challengeWertung(vorherige).wert,
  );
}
