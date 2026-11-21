/**
 * ════════════════════════════════════════════════════════════════════════════
 * DAS KLASSENMATCH, WÄHREND ES LÄUFT - Vorbild `typing/KlassenmatchLauf.tsx`.
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Zwei Unterschiede zur Braille-Challenge, beide aus dem Auftrag:
 *
 *  1. **Jedes Kind übt auf SEINEM eigenen Stand.** Der Text/die Wörter kommen
 *     aus der Etappe, die DIESES Kind im gewählten Bereich gerade erreicht
 *     hat (`currentIndex`/`etappeToLevel`, genau wie beim gewöhnlichen Üben)
 *     - nicht aus einem festen Prüfungstext.
 *  2. **Es zählt wie eine gewöhnliche Übungsrunde.** Anders als die
 *     Challenge nutzt dieses Bauteil darum den vollen `LevelRunner`/
 *     `TextLevelRunner` (mit Meisterungs-Fenster, Etappen-Freischaltung, XP)
 *     - ein Match kann also, genau wie im Tastenflow-Vorbild, eine neue
 *     Etappe freischalten. Die Persistenz übernimmt `onErgebnis`/
 *     `onTextFertig` (von `Punktgenau.tsx` hereingereicht - dort lebt der
 *     Spielstand).
 *
 * ── Der Vorspann auf der Braillezeile ───────────────────────────────────────
 * `matchZeitstand(platz, restMs)` aus `klassenmatch.ts` ist gebaut, um VOR
 * einer Textzeile zu stehen (Tastenflow-Vorbild) - Braille hat keine
 * vergleichbare, durchgehend fokussierte Zeile (Akkord-Eingabe statt
 * Tippen). Diese Karte zeigt den fertigen Achtzeller darum als GEWÖHNLICHEN,
 * ERREICHBAREN Text (`role="timer"`, `tabIndex=0`, KEIN `aria-live`) -
 * dasselbe Muster wie die Übezeit-Uhr in `Punktgenau.tsx`. Siehe Bericht.
 *
 * ── Während des Schreibens/Lesens geht nichts Tickendes in eine Live-Region ──
 * Kein Platzwechsel, kein Countdown, keine Kugel, keine Uhr - die normalen
 * Aufgaben-Ansagen von `LevelRunner`/`TextLevelRunner` bleiben (das ist der
 * gewöhnliche Ablauf jeder Aufgabe). Vier Wege bleiben: fühlen (Vorspann),
 * sehen (Minutenanzeige/"Platz x von y", beide `aria-hidden`), hören (zwei
 * Ansagen, `MATCH_ANSAGE_BEI_SEKUNDEN`), fragen (Alt + X).
 */
import { altAnzeige } from "@/lib/altTaste";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Modal } from "@/components/Modal";
import type { BrailleAccount } from "@/lib/braille/account";
import type { BrailleProgress } from "@/lib/braille/progress";
import { areaByKey, currentIndex, etappeToLevel, type Area, type AreaKey } from "@/lib/braille/areas";
import {
  MATCH_ANSAGE_BEI_SEKUNDEN,
  matchRestGesprochen,
  matchPlatzliste,
  matchZeitstand,
  rangliste,
  type BrailleMatch,
  type BrailleMatchStand,
} from "@/lib/braille/klassenmatch";
import type { LaufErgebnis } from "@/lib/braille/wertung";
import { LevelRunner, TextLevelRunner, type AnnounceCallback, type TaskOutcome, type TrainerTaskEvent } from "./BrailleTrainer";
import { BrailleKlassenmatchLobby } from "./BrailleKlassenmatchLobby";
import { BrailleKlassenmatchRanking } from "./BrailleKlassenmatchRanking";
import { BrailleKlassenmatchErgebnis } from "./BrailleKlassenmatchErgebnis";
import { getLevelMastery, getSystemStufe } from "@/lib/braille";
import { speakUi } from "@/lib/braille/voice";
import { useBraillePlay } from "@/lib/braille/play";
import type { BrailleKlassenmatchStand } from "./useBrailleKlassenmatch";

/** Alt + X - "wie steht es gerade?" (dieselbe Taste wie in der Braille-Challenge). */
const STAND_TASTE = "KeyX";
const STAND_KUERZEL = "Alt + X";
/**
 * Alt + P - „wer ist auf welchem Platz?" (Johannes 13.11.2026, wie Tastenflow).
 * ⚠️ Sonst heißt Alt + P in Punktgenau „Pause" (PunktgenauPage.tsx, am
 * `document`). Im laufenden Match gibt es keine Pause - die Match-Uhr liefe
 * weiter. Darum hört dieser Horcher in der EINFANGPHASE am `window` und hält
 * die Taste an, bevor die Seite sie bekommt.
 */
const PLATZLISTE_TASTE = "KeyP";

export function BrailleKlassenmatchLauf({
  match,
  klassenmatch,
  account,
  areas,
  progress,
  grossschreibzeichen,
  onErgebnis,
  onTextFertig,
  onTask,
  onAnnounce,
  onWeiter,
}: {
  match: BrailleMatch;
  klassenmatch: BrailleKlassenmatchStand;
  account: BrailleAccount;
  areas: Area[];
  progress: BrailleProgress;
  grossschreibzeichen: boolean;
  /** Ein Aufgaben-Ergebnis verbuchen (Etappe/Wort) - dieselbe Persistenz wie beim gewöhnlichen Üben. */
  onErgebnis: (areaKey: AreaKey, levelId: string, r: TaskOutcome) => void;
  /** Ein Text vollständig geschrieben/gelesen (Text-Etappen ohne Meisterungs-Fenster). */
  onTextFertig: (areaKey: AreaKey, levelId: string) => void;
  onTask: (e: TrainerTaskEvent) => void;
  onAnnounce: AnnounceCallback;
  /** "Weiter üben" nach dem Ergebnis. */
  onWeiter: () => void;
}) {
  const { staende, binGastgeber, standMelden, fertigMelden, mittendrinVerlassen } = klassenmatch;
  const area = areas.find((a) => a.key === match.bereich) ?? areaByKey(match.bereich);
  const etappeIndex = currentIndex(area, progress);
  const etappe = area.etappen[etappeIndex];
  const level = etappe ? etappeToLevel(etappe) : null;

  const [jetztMs, setJetztMs] = useState(() => Date.now());
  useEffect(() => {
    const t = window.setInterval(() => setJetztMs(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);

  const dauerMs = match.endeMs > 0 && match.startMs > 0 ? match.endeMs - match.startMs : 5 * 60_000;
  const verstrichenMs = match.startMs > 0 ? Math.max(0, jetztMs - match.startMs) : 0;
  const restMs = match.endeMs > 0 ? Math.max(0, match.endeMs - jetztMs) : dauerMs;

  const summe = useRef({ richtig: 0, falsch: 0 });
  const [eigenerLauf, setEigenerLauf] = useState<LaufErgebnis>({
    arbeitsweise: match.arbeitsweise,
    bereich: match.bereich,
    arbeitszeitMs: 0,
    ansageMs: 0,
    richtig: 0,
    falsch: 0,
  });

  const staendeMitEigenem = useMemo(() => {
    const eigen: BrailleMatchStand = {
      id: "eigen",
      matchId: match.id,
      classCode: account.classCode ?? "",
      pupilUid: account.id,
      name: account.name,
      status: "schreibt",
      lauf: eigenerLauf,
      updatedMs: jetztMs,
    };
    return [...staende.filter((s) => s.pupilUid !== account.id), eigen];
  }, [staende, eigenerLauf, account, match.id, jetztMs]);

  const liste = rangliste(staendeMitEigenem, match.arbeitsweise);
  const meinEintrag = liste.find((e) => e.stand.pupilUid === account.id);
  const meinPlatz = meinEintrag?.platz ?? liste.length;

  const [nachfrage, setNachfrage] = useState("");
  const pendel = useRef(false);
  const angesagt = useRef(new Set<number>());
  const antworte = useCallback((satz: string) => {
    pendel.current = !pendel.current;
    setNachfrage(pendel.current ? satz : `${satz} `);
    speakUi(satz);
  }, []);

  useEffect(() => {
    const restSek = Math.round(restMs / 1000);
    for (const schwelle of MATCH_ANSAGE_BEI_SEKUNDEN) {
      if (angesagt.current.has(schwelle) || restSek > schwelle) continue;
      angesagt.current.add(schwelle);
      speakUi(matchRestGesprochen(restMs));
    }
  }, [restMs]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!e.altKey || e.ctrlKey || e.metaKey) return;
      if (e.code !== STAND_TASTE) return;
      e.preventDefault();
      antworte(matchRestGesprochen(restMs));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [restMs, antworte]);

  const listeRef = useRef(liste);
  listeRef.current = liste;
  const laeuftNoch = restMs > 0;
  useEffect(() => {
    if (!laeuftNoch) return;
    const onKey = (e: KeyboardEvent) => {
      if (!e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      if (e.code !== PLATZLISTE_TASTE) return;
      e.preventDefault();
      e.stopPropagation();
      antworte(matchPlatzliste(listeRef.current));
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [laeuftNoch, antworte]);

  // ── Verlassen mitten im Durchgang - Rückfrage, kein sofortiges Ende ────────
  const [frageOffen, setFrageOffen] = useState(false);
  const weiterschreibenRef = useRef<HTMLButtonElement>(null);
  const fertigRef = useRef(false);

  const frageOeffnen = useCallback(() => {
    if (fertigRef.current) return;
    setFrageOffen(true);
    speakUi("Willst du das Klassenmatch wirklich verlassen? Die anderen schreiben weiter.");
  }, []);
  const weiterschreiben = useCallback(() => {
    setFrageOffen(false);
    useBraillePlay.getState().requestFocusInput();
  }, []);
  const verlassenBestaetigt = useCallback(() => {
    setFrageOffen(false);
    fertigRef.current = true;
    mittendrinVerlassen(eigenerLauf);
    speakUi("Du hast das Klassenmatch verlassen.");
    useBraillePlay.getState().requestFocusInput();
  }, [mittendrinVerlassen, eigenerLauf]);

  // ⚠️ NICHT während "einladung": Dort zeigt dieses Bauteil die Lobby ohne
  // Countdown, und die hat ihr EIGENES Escape (ohne Rückfrage, siehe
  // `BrailleKlassenmatchLobby.tsx`) - zwei Escape-Hörer auf `window`
  // feuerten sonst beide bei derselben Taste.
  useEffect(() => {
    if (frageOffen || fertigRef.current || match.status === "einladung") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      frageOeffnen();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [frageOffen, frageOeffnen, match.status]);

  const verlassenFrage = frageOffen ? (
    <Modal title="Klassenmatch verlassen?" onClose={weiterschreiben} initialFocus={weiterschreibenRef}>
      <div className="space-y-3">
        <p className="m-0 text-ink">
          Willst du das Klassenmatch wirklich verlassen? Die anderen schreiben weiter.
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <button type="button" ref={weiterschreibenRef} className="btn-primary" onClick={weiterschreiben}>
            Weiterschreiben
          </button>
          <button type="button" className="btn-secondary btn-umriss" onClick={verlassenBestaetigt}>
            Verlassen
          </button>
        </div>
        <p className="m-0 text-sm text-ink-muted">Escape bringt dich zurück in die Zeile.</p>
      </div>
    </Modal>
  ) : null;

  // ── Zeit um -> als "fertig" melden ──────────────────────────────────────
  useEffect(() => {
    if (fertigRef.current || restMs > 0) return;
    fertigRef.current = true;
    fertigMelden(eigenerLauf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restMs]);

  const nachfrageBereich = (
    <div className="sr-only" role="status" aria-live="assertive">
      {nachfrage}
    </div>
  );

  // ── Einladung: der Gastgeber wartet, wer dabei ist - "Starten" geht ihm,
  //    allen anderen "Doch nicht" ────────────────────────────────────────
  if (match.status === "einladung") {
    return (
      <>
        <BrailleKlassenmatchLobby
          match={match}
          staende={staende}
          binGastgeber={binGastgeber}
          imCountdown={false}
          restMs={0}
          kannStarten={klassenmatch.kannStarten}
          unentschieden={klassenmatch.unentschieden}
          onStarten={klassenmatch.starten}
          onAbbrechen={binGastgeber ? klassenmatch.absagen : klassenmatch.aussteigen}
        />
      </>
    );
  }

  // ── Countdown: bei ALLEN dieselben zehn Sekunden, aus `match.startMs` ────
  // ★★★★ 02.10.2026: NUR die Uhr entscheidet, nicht `status`. Bis dahin stand
  // hier zusätzlich `match.status === "countdown" ||` - aber auf „laeuft" setzt
  // den Zustand niemand (weder der Gastgeber noch der Cron, der ein
  // „countdown"-Match am Ende direkt schliesst, siehe `br_match.pb.js`). Die
  // Kinder sassen darum bis zum Ende im Wartefenster „Es geht los …", und
  // das Match fing nie an. Gefunden beim Nachstellen der Platzierungsliste
  // (`braille-klassenmatch-ein-kind-ein-match.test.tsx`). Dieselbe Regel wie
  // `matchPhaseVon` in `klassenmatch.ts` und wie in Tastenflow.
  if (match.startMs === 0 || jetztMs < match.startMs) {
    return (
      <>
        <BrailleKlassenmatchLobby
          match={match}
          staende={staende}
          binGastgeber={binGastgeber}
          imCountdown
          restMs={Math.max(0, match.startMs - jetztMs)}
          kannStarten={false}
          onStarten={() => {}}
          onAbbrechen={frageOeffnen}
        />
        {verlassenFrage}
      </>
    );
  }

  if (fertigRef.current || match.status === "fertig" || match.status === "abgebrochen" || restMs <= 0) {
    return (
      <>
        {nachfrageBereich}
        <BrailleKlassenmatchErgebnis liste={liste} eigeneUid={account.id} onWeiter={onWeiter} />
      </>
    );
  }

  if (!level || !etappe) {
    return (
      <div className="card mx-auto w-full max-w-prose p-5">
        <p className="m-0 text-ink-soft">Gleich geht es los …</p>
        {verlassenFrage}
      </div>
    );
  }

  const kopf = (
    <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 rounded-2xl bg-surface-sunken px-4 py-2">
      <p className="m-0 text-lg font-bold tracking-wide text-ink">
        <span aria-hidden="true">⚔️ </span>
        Klassenmatch
      </p>
      {/* Der Vorspann - erreichbar, NICHT `aria-live`. Siehe Dateikopf. */}
      <div role="timer" tabIndex={0} className="m-0 font-mono text-lg font-semibold tabular-nums text-ink">
        {matchZeitstand(meinPlatz, restMs)}
      </div>
      <p aria-hidden className="m-0 text-lg font-semibold text-ink">
        Platz {meinPlatz} von {liste.length}
      </p>
      <p className="m-0 text-sm text-ink-muted">{altAnzeige(STAND_KUERZEL)} sagt dir, wie es steht, {altAnzeige("Alt + P")} alle Plätze. Escape: Match verlassen.</p>
      <button type="button" className="btn-secondary btn-toggle text-sm" onClick={frageOeffnen}>
        Verlassen
      </button>
      {verlassenFrage}
    </div>
  );

  // `LevelRunner`/`TextLevelRunner` melden hier schon das fertige
  // `TrainerTaskEvent` (sie bauen es selbst aus Level/System/Richtung) - kein
  // eigenes Umpacken nötig, nur zusätzlich mitzählen und den Match-Stand
  // fortschreiben.
  const onTaskKombiniert = (e: TrainerTaskEvent) => {
    if (e.correct) summe.current.richtig += e.cells;
    else summe.current.falsch += e.cells;
    const neu: LaufErgebnis = {
      ...eigenerLauf,
      arbeitszeitMs: verstrichenMs,
      richtig: summe.current.richtig,
      falsch: summe.current.falsch,
    };
    setEigenerLauf(neu);
    standMelden(neu, "schreibt");
    onTask(e);
  };

  return (
    <>
      {nachfrageBereich}
      {kopf}
      {level.kind === "text" ? (
        <TextLevelRunner
          key={level.id + match.arbeitsweise}
          level={level}
          system={area.system}
          direction={match.arbeitsweise === "schreiben" ? "write" : "read"}
          address="du"
          grossschreibzeichen={grossschreibzeichen}
          onProgress={() => {}}
          onTask={onTaskKombiniert}
          onComplete={() => onTextFertig(area.key, level.id)}
          onAnnounce={onAnnounce}
        />
      ) : (
        <LevelRunner
          key={level.id + match.arbeitsweise}
          level={level}
          system={area.system}
          direction={match.arbeitsweise === "schreiben" ? "write" : "read"}
          initialMastery={getLevelMastery(progress, level.id)}
          initialStufe={getSystemStufe(progress, area.key)}
          address="du"
          grossschreibzeichen={grossschreibzeichen}
          onResult={(r) => onErgebnis(area.key, level.id, r)}
          onNext={null}
          onProgress={() => {}}
          onTask={onTaskKombiniert}
          onAnnounce={onAnnounce}
        />
      )}
      <BrailleKlassenmatchRanking
        liste={liste}
        eigeneUid={account.id}
        verstrichenMs={verstrichenMs}
        dauerMs={dauerMs}
      />
    </>
  );
}
