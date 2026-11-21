/**
 * ════════════════════════════════════════════════════════════════════════════
 * DIE BRAILLE-CHALLENGE AUS DER SICHT DES KINDES - der ganze Ablauf.
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Vorbild `typing/SchreibprobeLauf.tsx`. Zeigt je Phase EINE Karte und sonst
 * nichts - die Frage "muss dieses Kind gerade eine Braille-Challenge
 * schreiben/lesen" beantwortet {@link useBrailleChallenge}, hier wird nur
 * dargestellt, was dort schon steht.
 *
 * ── Warum WritePanel/ReadPanel direkt, statt LevelRunner ────────────────────
 * `LevelRunner` trägt sein eigenes Meisterungs-Fenster in sich (die
 * "Geschafft!"-Karte käme mitten in einer Prüfung, auch wenn nichts davon
 * gespeichert wird - ein Kind sähe eine Feier für etwas, das gleich wieder
 * verschwindet). Eine Prüfung darf ausserdem KEINE Etappe freischalten
 * (dieselbe Regel wie beim Tastenflow-Vorbild: "eine Prüfung darf das Tor
 * zur nächsten Taste weder öffnen noch zuschlagen"). Darum treibt dieses
 * Bauteil die beiden untersten Eingabe-Bausteine (`WritePanel`/`ReadPanel`
 * aus `BrailleTrainer.tsx`) selbst an einer eigenen, NIE gespeicherten
 * Gewichtung (`pickWeighted`/`recordAttempt`, rein im Bildschirm-Speicher)
 * an - fortlaufend, bis die Prüfungszeit um ist.
 *
 * ── Der Aufgaben-Vorrat ──────────────────────────────────────────────────────
 * Alle Wörter der Etappen, die dieses Kind in diesem Bereich schon erreicht
 * hat (dieselbe Grenze wie `bekannteZeichenImBereich` in `eigeneUebung.ts`) -
 * eine Prüfung fragt, was schon eingeführt wurde, nicht, was noch fehlt.
 *
 * ── Richtige/falsche Zellen bzw. Zeichen ─────────────────────────────────────
 * `WritePanel`/`ReadPanel` melden je Wort nur EIN Ganzes (`correct`) plus
 * dessen Zellenzahl - keine feinere Aufschlüsselung erreicht diese Stelle
 * (die Panels gehören nicht zur Dateihoheit dieses Zubaus und wurden nicht
 * geändert). Diese Karte zählt darum: bei einem sauber geschriebenen/
 * gelesenen Wort dessen ganze Zellenzahl als RICHTIG, bei einem mit
 * mindestens einer Fehlzelle dessen ganze Zellenzahl als FALSCH. Das hält
 * das Tempo (richtige Zellen je Minute) ehrlich und straft längere falsche
 * Wörter stärker - eine Näherung, siehe Bericht.
 *
 * ── Barrierefreiheit - siehe `SchreibprobeLauf.tsx` für die Herleitung ─────
 * Während die Prüfung läuft, geht NICHTS Tickendes in eine Live-Region
 * (die Panels selbst dürfen ihre gewohnten Aufgaben-/Status-Ansagen weiter
 * machen - das ist der normale Ablauf jeder Aufgabe, keine "mitlaufende
 * Meldung"). Die Restzeit steht als gewöhnlicher, erreichbarer Text
 * (`role="timer"`, `tabIndex=0`, NICHT `aria-live`) - dasselbe Muster wie die
 * Übezeit-Uhr in `Punktgenau.tsx`. Auf Nachfrage (Alt + X) antwortet EINE
 * assertive Live-Region einmalig.
 */
import { altAnzeige } from "@/lib/altTaste";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BRAILLE_CHALLENGE_WORT,
  CHALLENGE_ANSAGE_BEI_SEKUNDEN,
  challengeDauerMs,
  challengeRestGesprochen,
  kannAbgeben,
  type ChallengePlan,
} from "@/lib/braille/challenge";
import type { LaufErgebnis } from "@/lib/braille/wertung";
import type { BrailleProgress } from "@/lib/braille/progress";
import { areaByKey, currentIndex, etappeItems, type Area } from "@/lib/braille/areas";
import {
  emptyMastery,
  ensureLouLoaded,
  pickWeighted,
  recordAttempt,
  solveUeb,
  toBraille,
  unicodeToCells,
  type Cell,
} from "@/lib/braille";
import { WritePanel, ReadPanel, type AnnounceCallback, type TrainerTaskEvent } from "./BrailleTrainer";
import { speakUi } from "@/lib/braille/voice";
import { useBraillePlay } from "@/lib/braille/play";
import { mmss } from "@/lib/typing/schreibprobe";
import { BrailleChallengeErgebnis } from "./BrailleChallengeErgebnis";
import type { BrailleChallengeStand } from "./useBrailleChallenge";

/** Alt + X - "wie viel Zeit bleibt noch?" (dieselbe Taste/Bedeutung wie im Tastenflow-Vorbild). */
const RESTZEIT_TASTE = "KeyX";
const RESTZEIT_KUERZEL = "Alt + X";

/**
 * Der abgesetzte Rahmen - dieselbe Markierung wie im Vorbild (gestrichelt,
 * doppelt stark: `border-style` übersteht den Kontrastmodus, anders als
 * jede Farbe alleine).
 */
function Markierung({ children }: { children: React.ReactNode }) {
  return <div className="rounded-3xl border-2 border-dashed border-warning p-3 sm:p-4">{children}</div>;
}

/** Die laufende Messung - treibt WritePanel/ReadPanel selbst an, siehe Dateikopf. */
function ChallengeMessung({
  plan,
  area,
  progress,
  grossschreibzeichen,
  onAufgabe,
  onAnnounce,
}: {
  plan: ChallengePlan;
  area: Area;
  progress: BrailleProgress;
  grossschreibzeichen: boolean;
  /** correct + Zellenzahl + Bearbeitungszeit je fertiger Aufgabe. */
  onAufgabe: (correct: boolean, cells: number, ms: number, spokenMs: number | undefined) => void;
  onAnnounce: AnnounceCallback;
}) {
  const eightDot = area.system === "computer";
  const isKurz = area.key === "kurzschrift";
  const isUeb = area.key === "ueb";

  useEffect(() => {
    if (isKurz || isUeb) void ensureLouLoaded().catch(() => undefined);
  }, [isKurz, isUeb]);

  const solveKurz = useCallback(async (p: string): Promise<Cell[] | null> => {
    try {
      return unicodeToCells(await toBraille(p, "de-g2"));
    } catch {
      return null;
    }
  }, []);
  const solveUebTarget = useCallback(async (p: string): Promise<Cell[] | null> => {
    const brl = await solveUeb(p);
    return brl == null ? null : unicodeToCells(brl);
  }, []);
  const solve = isKurz ? solveKurz : isUeb ? solveUebTarget : undefined;

  // Der Wortschatz: alle Wörter der bisher erreichten Etappen dieses
  // Bereichs (siehe Dateikopf) - EINMAL berechnet je Bereich/Fortschritt.
  const pool = useMemo(() => {
    const grenze = currentIndex(area, progress);
    const woerter = new Set<string>();
    for (let i = 0; i <= grenze; i++) {
      for (const w of etappeItems(area.etappen[i])) woerter.add(w);
    }
    return woerter.size > 0 ? [...woerter] : [area.etappen[0]?.title ?? ""];
  }, [area, progress]);

  // Rein lokale, NIE gespeicherte Gewichtung - eine Prüfung darf den
  // Lernstand des Kindes nicht verändern (Dateikopf).
  const masteryRef = useRef(emptyMastery());
  const [runde, setRunde] = useState(0);
  const [prompt, setPrompt] = useState(() => pickWeighted(pool, masteryRef.current));

  const weiter = (correct: boolean) => {
    masteryRef.current = recordAttempt(masteryRef.current, prompt, correct);
    setPrompt(pickWeighted(pool, masteryRef.current, { avoid: prompt }));
    setRunde((r) => r + 1);
  };

  const onTask = (correct: boolean, meta: { ms: number; cells: number; spokenMs?: number }) => {
    onAufgabe(correct, meta.cells, meta.ms, meta.spokenMs);
  };

  return plan.arbeitsweise === "schreiben" ? (
    <WritePanel
      key={runde}
      prompt={prompt}
      system={area.system}
      eightDot={eightDot}
      solve={solve}
      address="du"
      grossschreibzeichen={grossschreibzeichen}
      onDone={weiter}
      onTask={onTask}
      onAnnounce={onAnnounce}
    />
  ) : (
    <ReadPanel
      key={runde}
      prompt={prompt}
      system={area.system}
      eightDot={eightDot}
      solve={solve}
      address="du"
      grossschreibzeichen={grossschreibzeichen}
      onDone={weiter}
      onTask={onTask}
      onAnnounce={onAnnounce}
    />
  );
}

export function BrailleChallengeLauf({
  challenge,
  areas,
  progress,
  grossschreibzeichen,
  onTask,
  onAnnounce,
}: {
  challenge: BrailleChallengeStand;
  areas: Area[];
  progress: BrailleProgress;
  grossschreibzeichen: boolean;
  /** Praxiszeit-Buchung wie bei jeder gewöhnlichen Aufgabe (Übezeit-Uhr, Wochenziel). */
  onTask: (e: TrainerTaskEvent) => void;
  onAnnounce: AnnounceCallback;
}) {
  const { plan, phase, restMs, einstiegBisMs, jetztMs, beginne, melde, gibAb, ergebnis, schliesseErgebnis } =
    challenge;
  const area = plan ? areas.find((a) => a.key === plan.bereich) ?? areaByKey(plan.bereich) : null;

  const [nachfrage, setNachfrage] = useState("");
  const pendel = useRef(false);
  const angesagt = useRef(new Set<number>());
  const ergebnisKasten = useRef<HTMLDivElement>(null);
  const fokusGesetzt = useRef(false);

  const summe = useRef({ richtig: 0, falsch: 0, ansageMs: 0 });
  const fertig = useRef(false);

  const antworte = useCallback((satz: string) => {
    pendel.current = !pendel.current;
    setNachfrage(pendel.current ? satz : `${satz} `);
    speakUi(satz);
  }, []);

  // Ansagen bei fünf Minuten/einer Minute/zehn Sekunden - nie öfter.
  useEffect(() => {
    if (phase !== "laeuft" || !plan) return;
    const restSek = Math.round(restMs / 1000);
    for (const schwelle of CHALLENGE_ANSAGE_BEI_SEKUNDEN) {
      if (angesagt.current.has(schwelle) || restSek > schwelle) continue;
      angesagt.current.add(schwelle);
      if (schwelle * 1000 >= challengeDauerMs(plan)) continue;
      speakUi(challengeRestGesprochen(restMs));
    }
  }, [phase, restMs, plan]);

  // Alt + X - Restzeit auf Nachfrage.
  useEffect(() => {
    if (phase !== "laeuft") return;
    const onKey = (e: KeyboardEvent) => {
      if (!e.altKey || e.ctrlKey || e.metaKey) return;
      if (e.code !== RESTZEIT_TASTE) return;
      e.preventDefault();
      antworte(challengeRestGesprochen(restMs));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, restMs, antworte]);

  const gibAbJetzt = useCallback(
    (grundZeitAbgelaufen: boolean) => {
      if (!plan || fertig.current) return;
      if (!grundZeitAbgelaufen && !kannAbgeben(plan, challenge.stand, jetztMs)) return;
      fertig.current = true;
      const lauf: LaufErgebnis = {
        arbeitsweise: plan.arbeitsweise,
        bereich: plan.bereich,
        arbeitszeitMs: challengeDauerMs(plan) - (grundZeitAbgelaufen ? 0 : restMs),
        ansageMs: summe.current.ansageMs,
        richtig: summe.current.richtig,
        falsch: summe.current.falsch,
      };
      void gibAb(lauf);
    },
    [plan, challenge.stand, jetztMs, restMs, gibAb],
  );

  // Zeit um -> automatisch abgeben.
  useEffect(() => {
    if (phase !== "laeuft" || fertig.current) return;
    if (restMs > 0) return;
    gibAbJetzt(true);
  }, [phase, restMs, gibAbJetzt]);

  // Fokus auf die Ergebnis-Ueberschrift, sobald sie steht (R1-R6).
  useEffect(() => {
    if (!ergebnis || fokusGesetzt.current) return;
    const titel = ergebnisKasten.current?.querySelector<HTMLElement>("[data-challenge-titel]");
    if (!titel) return;
    fokusGesetzt.current = true;
    titel.focus();
  }, [ergebnis, phase]);

  const weiterUeben = useCallback(() => {
    schliesseErgebnis();
    useBraillePlay.getState().requestFocusInput();
  }, [schliesseErgebnis]);
  useEffect(() => {
    if (phase !== "abgegeben") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") weiterUeben();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, weiterUeben]);

  const nachfrageBereich = (
    <div className="sr-only" role="status" aria-live="assertive">
      {nachfrage}
    </div>
  );

  if (!plan || !area) return null;

  // "verpasst"/"keine" zeigen bewusst nichts - siehe `challenge.ts` Kopf und
  // [[feedback_nie_gegen_das_kind]]: kein Vorhalt an ein Kind, das das
  // Zeitfenster verpasst hat.
  if (phase === "keine" || phase === "verpasst") return null;

  if (phase === "abgegeben") {
    return (
      <div ref={ergebnisKasten}>
        {nachfrageBereich}
        {ergebnis ? (
          <BrailleChallengeErgebnis ergebnis={ergebnis} onWeiter={weiterUeben} />
        ) : (
          <div className="card mx-auto w-full max-w-prose p-5">
            <h2
              data-challenge-titel
              tabIndex={-1}
              className="m-0 text-xl font-semibold text-ink outline-none"
            >
              Deine {BRAILLE_CHALLENGE_WORT} ist abgegeben.
            </h2>
            <p className="mb-0 mt-2 text-ink-soft">
              Deine Zahlen stehen in deiner Statistik. Du kannst weiterüben.
            </p>
            <div className="mt-6">
              <button type="button" className="btn-primary" onClick={weiterUeben}>
                Weiter üben
              </button>
              <p className="mb-0 mt-2 text-sm text-ink-muted">Escape bringt dich auch zurück zum Üben.</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  const dauerSatz = `${plan.dauerMin} ${plan.dauerMin === 1 ? "Minute" : "Minuten"}`;

  if (phase === "offen") {
    return (
      <>
        {nachfrageBereich}
        <Markierung>
          <div className="card mx-auto w-full max-w-prose p-5 sm:p-6">
            <p className="m-0 rounded-xl bg-warning-soft px-3 py-1 text-center text-xl font-bold tracking-wide text-ink">
              {BRAILLE_CHALLENGE_WORT}
            </p>
            <p className="mt-4 text-lg text-ink">Die Zeit läuft ab deinem ersten Zeichen.</p>
            <dl className="m-0 mt-2">
              <div className="flex flex-wrap gap-x-2 py-1">
                <dt className="m-0 text-ink-soft">Dauer:</dt>
                <dd className="m-0 font-medium text-ink">{dauerSatz}</dd>
              </div>
              <div className="flex flex-wrap gap-x-2 py-1">
                <dt className="m-0 text-ink-soft">Arbeitsweise:</dt>
                <dd className="m-0 font-medium text-ink">
                  {plan.arbeitsweise === "schreiben" ? "Schreiben" : "Lesen"}
                </dd>
              </div>
              <div className="flex flex-wrap gap-x-2 py-1">
                <dt className="m-0 text-ink-soft">Schriftbereich:</dt>
                <dd className="m-0 font-medium text-ink">{area.label}</dd>
              </div>
              <div className="flex flex-wrap gap-x-2 py-1">
                {/* Nicht in einer Live-Region: Diese Uhr zählt das
                    Einstiegsfenster herunter, nicht die Prüfungszeit - sie
                    darf gelesen werden, bevor irgendetwas läuft. */}
                <dt className="m-0 text-ink-soft">Zum Beginnen hast du noch:</dt>
                <dd className="m-0 font-medium tabular-nums text-ink">{mmss(einstiegBisMs - jetztMs)}</dd>
              </div>
            </dl>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button type="button" className="btn-primary" onClick={beginne}>
                Beginnen
              </button>
              <button type="button" className="btn-secondary btn-umriss" onClick={melde}>
                Ich schreibe nicht mit
              </button>
            </div>
          </div>
        </Markierung>
      </>
    );
  }

  // phase === "laeuft"
  return (
    <>
      {nachfrageBereich}
      <Markierung>
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 rounded-2xl bg-warning-soft px-4 py-2">
          <p className="m-0 text-lg font-bold tracking-wide text-ink">{BRAILLE_CHALLENGE_WORT}</p>
          {/* Restzeit - erreichbar (Tab), NICHT `aria-live`: siehe Dateikopf. */}
          <div role="timer" tabIndex={0} className="m-0 text-lg font-semibold tabular-nums text-ink">
            {mmss(restMs)}
          </div>
          <p className="m-0 text-sm text-ink-muted">
            {altAnzeige(RESTZEIT_KUERZEL)} sagt dir, wie viel Zeit noch bleibt.
          </p>
          {kannAbgeben(plan, challenge.stand, jetztMs) && (
            <button
              type="button"
              className="btn-secondary btn-toggle text-sm"
              onClick={() => gibAbJetzt(false)}
            >
              Fertig - abgeben
            </button>
          )}
        </div>
        <ChallengeMessung
          plan={plan}
          area={area}
          progress={progress}
          grossschreibzeichen={grossschreibzeichen}
          onAnnounce={onAnnounce}
          onAufgabe={(correct, cells, ms, spokenMs) => {
            if (correct) summe.current.richtig += cells;
            else summe.current.falsch += cells;
            if (spokenMs) summe.current.ansageMs += spokenMs;
            onTask({
              level: `challenge:${plan.bereich}`,
              system: area.system,
              direction: plan.arbeitsweise === "schreiben" ? "write" : "read",
              correct,
              ms,
              cells,
              pasted: false,
              blurred: false,
              spokenMs,
            });
          }}
        />
      </Markierung>
    </>
  );
}
