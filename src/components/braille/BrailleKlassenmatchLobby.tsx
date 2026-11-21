/**
 * ★★★ DAS WARTEFENSTER - "wer ist dabei" und der Countdown.
 *
 * Vorbild `typing/KlassenmatchLobby.tsx`. Zwei Zustände: **Einladung** (beim
 * Gastgeber "Starten"/"Absagen", bei allen anderen "Doch nicht") und
 * **Countdown** (bei ALLEN dieselben zehn Sekunden, aus `match.startMs`).
 *
 * ── Hier darf die Live-Region benutzt werden, und nur hier ─────────────────
 * In diesem Fenster wird nicht geschrieben/gelesen - es gibt nichts zu lesen
 * ausser dieser einen Zeile. `aria-live="polite"`, höchstens EINE Ansage je
 * Beitritt (die Sekunden des Countdowns stehen NICHT darin - die werden
 * gesprochen, nicht gemeldet).
 */
import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  MATCH_ALLE_ENTSCHIEDEN,
  dabeiNamen,
  dabeiSatz,
  countdownAnsage,
  unentschiedenSatz,
  type BrailleMatch,
  type BrailleMatchStand,
} from "@/lib/braille/klassenmatch";
import { useBraillePlay } from "@/lib/braille/play";
import { speakUi } from "@/lib/braille/voice";

export function BrailleKlassenmatchLobby({
  match,
  staende,
  binGastgeber,
  imCountdown,
  restMs,
  kannStarten,
  unentschieden = 0,
  onStarten,
  onAbbrechen,
}: {
  match: BrailleMatch;
  staende: readonly BrailleMatchStand[];
  binGastgeber: boolean;
  imCountdown: boolean;
  restMs: number;
  kannStarten: boolean;
  /**
   * ★★★ Wie viele Kinder haben die Einladung bekommen und sich noch nicht
   * entschieden (02.10.2026)? Steht hier mehr als null, fragt „Starten" erst
   * nach. Ohne Angabe 0 - dann startet „Starten" sofort wie bisher.
   */
  unentschieden?: number;
  onStarten: () => void;
  onAbbrechen: () => void;
}) {
  const titelRef = useRef<HTMLHeadingElement>(null);
  const namen = dabeiNamen(staende, match.hostUid);
  const satz = dabeiSatz(namen);
  const [meldung, setMeldung] = useState("");
  const gesagt = useRef("");
  const countdownGesagt = useRef(new Set<number>());
  const [hinweis, setHinweis] = useState("");
  /*
    ★★★★ DIE RÜCKFRAGE VOR DEM START (02.10.2026, nachgezogen aus Tastenflow
    `KlassenmatchLobby.tsx`; Johannes: *„3 Kinder haben noch nicht entschieden!
    Trotzdem starten."*). KEINE Wartezeit - nur diese eine Frage, und nur,
    wenn wirklich jemand überlegt. Die Zahl lebt mit, solange die Frage steht.
    Fokus auf „Warten" (wer schnell Enter drückt, startet nicht aus Versehen),
    Escape heisst „Warten".
  */
  const [frageOffen, setFrageOffen] = useState(false);
  const frageId = useId();
  const wartenRef = useRef<HTMLButtonElement>(null);
  const startenRef = useRef<HTMLButtonElement>(null);
  const frageSatz = unentschieden > 0 ? unentschiedenSatz(unentschieden) : MATCH_ALLE_ENTSCHIEDEN;
  useEffect(() => {
    if (frageOffen) wartenRef.current?.focus();
  }, [frageOffen]);
  const warten = useCallback(() => {
    setFrageOffen(false);
    // Fokusziel: „Starten" - dort war das Kind, und dort geht es weiter.
    window.setTimeout(() => startenRef.current?.focus(), 0);
  }, []);

  useEffect(() => {
    titelRef.current?.focus();
  }, []);

  // Escape führt aus der Einladung heraus - NICHT im Countdown (siehe
  // `BrailleKlassenmatchLauf`, das dort die Rückfrage übernimmt).
  useEffect(() => {
    if (imCountdown) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        // ★ Steht die Rückfrage, heisst Escape „Warten" - nicht „Absagen".
        if (frageOffen) {
          warten();
          return;
        }
        onAbbrechen();
        useBraillePlay.getState().requestFocusInput();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [imCountdown, onAbbrechen, frageOffen, warten]);

  useEffect(() => {
    if (gesagt.current === satz) return;
    gesagt.current = satz;
    setMeldung(satz);
  }, [satz]);

  useEffect(() => {
    if (!imCountdown) return;
    const sek = Math.max(0, Math.round(restMs / 1000));
    if (countdownGesagt.current.has(sek)) return;
    countdownGesagt.current.add(sek);
    const text = countdownAnsage(sek);
    if (text) speakUi(text);
  }, [imCountdown, restMs]);

  const sekunden = Math.max(0, Math.ceil(restMs / 1000));
  const dauerSatz = `${match.dauerMin} ${match.dauerMin === 1 ? "Minute" : "Minuten"}`;
  const arbeitsweiseSatz = match.arbeitsweise === "schreiben" ? "Schreiben" : "Lesen";

  return (
    <div className="card mx-auto w-full max-w-prose p-5 sm:p-6">
      <div className="sr-only" role="status" aria-live="polite">
        {meldung}
      </div>
      <h2 ref={titelRef} tabIndex={-1} className="m-0 text-xl font-semibold text-ink outline-none">
        <span aria-hidden="true">⚔️ </span>
        Klassenmatch
      </h2>
      <p className="mb-0 mt-1 text-ink-soft">
        {binGastgeber ? "Du hast eingeladen." : `${match.hostName} hat eingeladen.`} {dauerSatz},{" "}
        {arbeitsweiseSatz.toLowerCase()}, jede und jeder auf dem eigenen Stand.
      </p>

      <p className="mb-0 mt-4 text-lg font-semibold text-ink">{satz}</p>

      {imCountdown ? (
        <>
          <p className="mb-0 mt-4 text-xl font-semibold text-ink">
            Es geht los in {sekunden} {sekunden === 1 ? "Sekunde" : "Sekunden"}.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button type="button" className="btn-secondary btn-umriss" onClick={onAbbrechen}>
              Verlassen
            </button>
          </div>
        </>
      ) : frageOffen && binGastgeber ? (
        /*
          ★ Die Rückfrage steht AN DER STELLE der Knöpfe - eine Gruppe,
          beschriftet mit der Frage selbst: Wer mit dem Fokus hineinkommt,
          hört sie, und auf der Braillezeile steht sie neben dem Knopf. Keine
          Live-Region - gesprochen wird sie einmal beim Öffnen (`speakUi`).
        */
        <div className="mt-5" role="group" aria-labelledby={frageId} data-match-startfrage>
          <p id={frageId} className="m-0 text-lg font-semibold text-ink">
            {frageSatz}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                setFrageOffen(false);
                onStarten();
              }}
            >
              {unentschieden > 0 ? "Trotzdem starten" : "Starten"}
            </button>
            <button type="button" ref={wartenRef} className="btn-secondary btn-umriss" onClick={warten}>
              Warten
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-5 flex flex-wrap items-center gap-3">
          {binGastgeber && (
            <button
              type="button"
              ref={startenRef}
              className="btn-primary"
              aria-disabled={!kannStarten || undefined}
              onClick={() => {
                if (!kannStarten) {
                  const text = "Warte, bis mindestens ein Kind dabei ist.";
                  setHinweis(text);
                  speakUi(text);
                  return;
                }
                if (unentschieden > 0) {
                  setHinweis("");
                  setFrageOffen(true);
                  speakUi(unentschiedenSatz(unentschieden));
                  return;
                }
                onStarten();
              }}
            >
              Starten
            </button>
          )}
          <button
            type="button"
            className="btn-secondary btn-umriss"
            onClick={() => {
              onAbbrechen();
              useBraillePlay.getState().requestFocusInput();
            }}
          >
            {binGastgeber ? "Absagen" : "Doch nicht"}
          </button>
        </div>
      )}

      {hinweis && !imCountdown ? <p className="mb-0 mt-2 text-sm text-ink-soft">{hinweis}</p> : null}
      {!imCountdown && binGastgeber && !kannStarten ? (
        <p className="mb-0 mt-2 text-sm text-ink-muted">„Starten" geht, sobald jemand dabei ist.</p>
      ) : null}
    </div>
  );
}
