/**
 * Braille-Übungs-Bausteine - die geteilten Kern-Komponenten des Lernspiels:
 * LevelRunner/TextLevelRunner (Schreiben/Lesen von Wörtern und Fließtexten),
 * die Panels mit Akkord-Eingabe (f d s a · j k l ö), ProgressRing,
 * BrailleZoomBar (nur noch Klangpunkte - Punktgenau zeigt die Leiste seit
 * 20.09.2026 nicht mehr) und die eingebettete Einzel-Übung `BrailleExercise`
 * (Lektions-Widgets + Arbeitsheft-iframe `?level=…&bare=1`).
 *
 * Genutzt von „Punktgenau" (components/braille/Punktgenau.tsx), das die
 * Etappen-Didaktik darüberlegt. Der frühere eigenständige Voll-Trainer
 * (`BrailleTrainer`-Komponente, Level-Pulldown ohne Freischalt-Gate) wurde
 * am 02.07.2026 entfernt - er war nirgends mehr geroutet; die Arbeitsheft-
 * Einbettungen laufen unverändert über `BrailleExercise`.
 */
import { pg, pgTexte } from "@/lib/braille/sprachen/sprache";
import { altAnzeige } from "@/lib/altTaste";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type RefObject,
} from "react";
import {
  BLANK,
  BrailleProgress,
  BrailleSystem,
  Cell,
  DOT_KEY_LABEL,
  alleVorgerechnet,
  ensureLouLoaded,
  toBraille,
  unicodeToCells,
  Level,
  LevelMastery,
  STUFE_MAX,
  SystemStufe,
  buildLevelDeck,
  cellDots,
  cellToUnicode,
  dots as dotsToCell,
  dotsLabel,
  firstLevelOf,
  getLevelMastery,
  getSystemStufe,
  isLevelMastered,
  isSoundMuted,
  keyLabelsForCell,
  levelById,
  loadProgress,
  MASTERY_MIN_ATTEMPTS,
  masteryProgress,
  pickWeighted,
  playErrorSound,
  recordAttempt,
  recordStufe,
  saveProgress,
  setSoundMuted,
  solveUeb,
  stufeConfig,
  textToCellsMathe,
  UEB_CELLS,
  CHORD_NACHLAUF_MS,
  CHORD_FENSTER_MS,
} from "@/lib/braille";
import { ZOOM_LEVELS, useBrailleA11y } from "@/lib/braille/a11y";
import type { AnnouncePayload } from "@/lib/braille/announce";
import {
  announceCellHint,
  announceCorrect,
  announceLevelDone,
  announceNoNewChars,
  announcePaused,
  announceTask,
  announceTextDone,
  announceWrong,
} from "@/lib/braille/announce";
import { playCorrectTick, playLevelJingle, playWordDone } from "@/lib/braille/earcons";
import { Tipp } from "@/components/Tipp";
import { useBraillePlay } from "@/lib/braille/play";
import { baueSuchaufgabe, suchAntwortStimmt, type Suchaufgabe } from "@/lib/braille/suchaufgabe";
import { cancelSpeech, isSpeaking, speakSequence, speakUi, spokenMs, typingGapMs, useVoice } from "@/lib/braille/voice";
import { BrailleCell, BrailleCellRow, BrailleFontCell, BrailleFontText } from "./BrailleCell";
import { useBrailleChord } from "./useBrailleChord";
import { Schreibzeile } from "./Schreibzeile";
import { kurzschriftZeile, zeigerImText } from "@/lib/braille/schreibzeile";
import { kuerzungsZeichen } from "@/lib/braille/kurzschrift_content";

export type AnnounceCallback = (payload: AnnouncePayload) => void;

/** Schreibt in eine ARIA-Live-Region: erst leeren, dann verzögert füllen.
 *  Das Leer→Voll-Muster erzwingt eine Ansage auch bei wiederholtem identischem
 *  Text (z. B. Alt+W). requestAnimationFrame (~16 ms) ist manchen Screenreadern
 *  (NVDA/Windows) zu knapp für zwei getrennt erkannte Änderungen - ein kurzer
 *  setTimeout ist die robustere Variante (NVDA-Test 2026-07-01). */
function pushLive(set: (s: string) => void, text: string): void {
  set("");
  setTimeout(() => set(text), 50);
}

const norm = (s: string) => s.trim().replace(/\s+/g, " ").toLowerCase();
const AUTO_NEXT_MS = 650;

/**
 * Darf ein frisch gemountetes Übungs-Panel den Fokus an sich ziehen?
 * NUR wenn gerade niemand etwas bedient (Fokus auf body/nirgends) - sonst
 * reißt jeder Bereichs-/Richtungs-/Etappenwechsel (Panel-Remount!) den Fokus
 * mitten aus der Radiogruppe bzw. dem Etappen-Pulldown (NVDA-Befund 2026-07-02).
 * Nach dem Aufgaben-Weiterlauf ist das alte Panel weg → Fokus liegt auf body →
 * das neue Panel darf übernehmen.
 */
function mayStealFocus(): boolean {
  const ae = document.activeElement;
  return !ae || ae === document.body;
}

/** Gemeinsame Statusansagen für die liblouis-Ladephase (Kurzschrift/UEB):
 *  Beginn und Ende hörbar machen - der eingeblendete Banner allein entsteht
 *  als NEUES Element und wird von NVDA meist nicht angesagt. Die Beginn-
 *  Ansage kommt VERZÖGERT: sonst überschriebe sie die Bereichs-/Aufgaben-
 *  Ansage im selben Status-Kanal, und blitzschnelle Ladevorgänge (warmer
 *  Worker) brauchen gar keine Meldung. */
function useLoadingAnnounce(
  loading: boolean,
  /** Übersetzung ausgeblieben (siehe `useAsyncBrailleTarget`) - dann NICHT
   *  „Bereit." ansagen, sondern `failedText` (einmal je Fehlschlag). */
  failed: boolean,
  failedText: string,
  onAnnounce: RefObject<AnnounceCallback | undefined>,
): void {
  const announced = useRef(false);
  useEffect(() => {
    if (loading) {
      const t = window.setTimeout(() => {
        announced.current = true;
        onAnnounce.current?.({
          channel: "status",
          text: "Übersetzung wird vorbereitet — einen Moment.",
        });
      }, 700);
      return () => window.clearTimeout(t);
    }
    if (announced.current) {
      announced.current = false;
      if (!failed) onAnnounce.current?.({ channel: "status", text: "Bereit." });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  // Fehlschlag EIGENS ansagen - dasselbe Argument wie beim Laden oben: ein
  // frisch eingeblendetes role="status"-Element allein kommt bei NVDA meist
  // nicht an (Kommentar oben). Einmal je Fehlschlag, erneut nach jedem Klick
  // auf „Noch einmal versuchen", das wieder scheitert.
  const failAnnounced = useRef(false);
  useEffect(() => {
    if (failed && !failAnnounced.current) {
      failAnnounced.current = true;
      onAnnounce.current?.({ channel: "status", text: failedText });
    }
    if (!failed) failAnnounced.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [failed]);
}

// ---------------------------------------------------------------------------
// Fortschritts-Ring: Zahl in der Mitte, der Ring rundherum füllt sich (Rang/Stufe)
// ---------------------------------------------------------------------------
export interface RingInfo {
  number: number;
  value: number; // 0 … 1
  caption: string;
  ariaLabel: string;
  /** Runden-Anzeige („wie lange geht die Übung noch") als Striche - in JEDEM
   *  Bereich gleich, auch bei Klangpunkte. Ist immer gesetzt. */
  round: RoundInfo;
}

export interface RoundInfo {
  /** Erledigte Aufgaben (bzw. Texte) dieser Runde - so viele Striche sind voll. */
  done: number;
  /** Länge der Runde = Anzahl der Striche. */
  total: number;
  /** Etappe schon gemeistert → alle Striche voll. */
  mastered?: boolean;
  /** „mindestens" (Mastery-Runden: total ist die Mindestzahl) statt exakt (Texte). */
  approx?: boolean;
  /** Gesprochene Beschreibung für Alt+Z („Runde: 5 von mindestens 12 …"). */
  label: string;
}

/**
 * Runden-Anzeige als Striche - wie bei „Tastenflow", damit man auf einen
 * Blick sieht (und per Alt+Z hört), wie lange die Übung noch geht. Fokussierbar:
 * Alt+Z springt hierher und liest {@link RoundInfo.label}; Esc geht zurück ins
 * Eingabefeld. In allen Bereichen gleich (auch Klangpunkte).
 *
 * @param zahlUnten NUR Punktgenaus Aufgaben-Kasten (20.09.2026 abends):
 *   Johannes wollte die Zahl „12/12" UNTER statt LINKS neben den Strichen,
 *   „damit der Bereich für den Text größer wird". Default = false, also das
 *   BISHERIGE Aussehen ([Zahl + Striche] über [Runde]) - `Klangpunkte`
 *   importiert `RoundTicks` unverändert und setzt die Prop nirgends, sieht
 *   also exakt wie zuvor aus. Bei `zahlUnten` bleibt der Block trotzdem bei
 *   ZWEI Zeilen: oben nur die Striche, darunter eine Zeile mit Zahl UND dem
 *   Wort „Runde" zusammen (statt der Zahl darüber und „Runde" in einer
 *   dritten Zeile) - er wird also nicht höher. `id`, `aria-label` und das
 *   Esc-Verhalten sind in beiden Varianten dasselbe Element.
 */
export function RoundTicks({
  round,
  zahlUnten = false,
}: {
  round: RoundInfo;
  zahlUnten?: boolean;
}) {
  const filled = round.mastered ? round.total : Math.min(round.done, round.total);
  const shown = round.mastered ? round.total : round.done;
  const zahl = (
    <span aria-hidden="true" className="text-sm font-semibold text-ink">
      {shown}
      <span className="text-ink-muted">/{round.total}</span>
    </span>
  );
  const striche = (
    <span aria-hidden="true" className="tt-ticks">
      {Array.from({ length: round.total }, (_, i) => (
        <span key={i} className={"tt-tick" + (i < filled ? " tt-tick--on" : "")} />
      ))}
    </span>
  );
  const focusProps = {
    id: "pl-round-ticks",
    role: "img" as const,
    tabIndex: -1,
    "aria-label": round.label,
    // ★ KEIN `title` bei `zahlUnten` (Punktgenau, 20.09.2026): Der Browser
    // zeigt es erst nach rund einer Sekunde, winzig und in seiner eigenen
    // Farbe, und eine Sprachausgabe liest es unzuverlaessig. Punktgenau
    // erklaert seine Felder darum mit `Tipp` - gross, sofort, und AUCH bei
    // Tastatur-Fokus. Klangpunkte (ohne `zahlUnten`) behaelt das `title`.
    ...(zahlUnten ? {} : { title: round.label }),
    onKeyDown: (e: ReactKeyboardEvent) => {
      // Esc: zurück ins Eingabefeld der Aufgabe (wie Alt+E).
      if (e.key === "Escape") {
        e.preventDefault();
        useBraillePlay.getState().requestFocusInput();
      }
    },
  };

  if (zahlUnten) {
    // ★ Zeile 2 bleibt bei der 10-px-Schrift der bisherigen „Runde"-Zeile
    // (nicht bei `zahl`s text-sm, das wäre ~20 statt ~12 px hoch) - sonst
    // wüchse der Block trotz nur zwei Zeilen um die Differenz.
    return (
      <Tipp text={round.label} ausrichtung="rechts">
        {(tippId) => (
      <div className="flex shrink-0 flex-col items-center gap-0.5">
        <div
          {...focusProps}
          aria-describedby={tippId}
          className="flex flex-col items-center gap-0.5 rounded-lg px-1 outline-none focus-visible:shadow-focus focus-visible:ring-[4.5px] focus-visible:ring-accent"
        >
          {striche}
          <span
            aria-hidden="true"
            className="flex items-center gap-1 text-[10px] font-medium text-ink-muted"
          >
            <span className="font-semibold text-ink">
              {shown}/{round.total}
            </span>
            <span className="uppercase tracking-wide">{pg("Runde", (t) => t.trainer.rundeWort)}</span>
          </span>
        </div>
      </div>
        )}
      </Tipp>
    );
  }

  return (
    <div className="flex shrink-0 flex-col items-center gap-0.5">
      <div
        {...focusProps}
        className="flex items-center gap-1.5 rounded-lg px-1 outline-none focus-visible:shadow-focus focus-visible:ring-[4.5px] focus-visible:ring-accent"
      >
        {zahl}
        {striche}
      </div>
      <span
        aria-hidden="true"
        className="text-[10px] font-medium uppercase tracking-wide text-ink-muted"
      >
        Runde
      </span>
    </div>
  );
}

export function ProgressRing({
  value,
  number,
  caption,
  ariaLabel,
  size = 46,
  ohneTitle = false,
  describedBy,
  tabIndex,
}: {
  value: number;
  number: number;
  caption: string;
  ariaLabel: string;
  size?: number;
  /**
   * ★ NUR Punktgenau setzt das (20.09.2026, Bauart §Mouse-over): der native
   * `title` ist für die Tastatur taub und erscheint erst nach rund einer
   * Sekunde - Punktgenau ersetzt ihn durch `Tipp` (`aria-describedby`, s.
   * `describedBy`). Klangpunkte setzt diese Prop NICHT - Default `false`
   * heisst: `title` bleibt dort, wie es heute ist.
   */
  ohneTitle?: boolean;
  /** Id des zugehörigen `Tipp`-Hinweises (nur Punktgenau; ohne Angabe kein `aria-describedby`). */
  describedBy?: string;
  /** Macht den Ring per Tastatur fokussierbar, damit der `Tipp` auch ohne Maus erscheint (nur Punktgenau). */
  tabIndex?: number;
}) {
  const stroke = 4;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(1, value || 0));
  return (
    <div
      className="flex shrink-0 flex-col items-center gap-0.5"
      role="img"
      aria-label={ariaLabel}
      title={ohneTitle ? undefined : ariaLabel}
      aria-describedby={describedBy}
      tabIndex={tabIndex}
    >
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="rgb(var(--c-hairline))"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="rgb(var(--c-accent))"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={circ * (1 - v)}
            className="transition-all duration-500"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-base font-bold text-ink">
          {number}
        </span>
      </div>
      <span className="text-[10px] font-medium uppercase tracking-wide text-ink-muted">
        {caption}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tasten-Erklärung
// ---------------------------------------------------------------------------
function KeyLegend({ eightDot }: { eightDot: boolean }) {
  const tf = pgTexte();
  if (tf) {
    return (
      <p className="text-center text-sm text-ink-muted">
        {tf.trainer.tasten} <kbd>f</kbd>=1 <kbd>d</kbd>=2 <kbd>s</kbd>=3
        {eightDot && (
          <>
            {" "}
            <kbd>a</kbd>=7
          </>
        )}{" "}
        · <kbd>j</kbd>=4 <kbd>k</kbd>=5 <kbd>l</kbd>=6
        {eightDot && (
          <>
            {" "}
            <kbd>ö</kbd>=8
          </>
        )}{" "}
        - {tf.trainer.tastenRegel} <kbd>{tf.trainer.leertaste}</kbd> = {tf.trainer.leertasteBedeutung},{" "}
        <kbd>⌫</kbd> = {tf.trainer.loeschen}.
      </p>
    );
  }
  return (
    <p className="text-center text-sm text-ink-muted">
      Tasten: <kbd>f</kbd>=1 <kbd>d</kbd>=2 <kbd>s</kbd>=3
      {eightDot && (
        <>
          {" "}
          <kbd>a</kbd>=7
        </>
      )}{" "}
      · <kbd>j</kbd>=4 <kbd>k</kbd>=5 <kbd>l</kbd>=6
      {eightDot && (
        <>
          {" "}
          <kbd>ö</kbd>=8
        </>
      )}{" "}
      — gleichzeitig drücken, dann loslassen. Sitzt die Zelle, geht es von selbst
      weiter. <kbd>Leertaste</kbd> = Lücke zwischen Wörtern, <kbd>⌫</kbd> = letzte
      Zelle löschen.
    </p>
  );
}

// ---------------------------------------------------------------------------
// Eine Zellfolge anzeigen: Leerzeichen-Zellen erscheinen als schmale Lücke
// (nicht als leeres Kästchen), optional je Zelle eingefärbt (richtig/falsch).
// ---------------------------------------------------------------------------
function CellSequence({
  cells,
  eightDot,
  size,
  states,
  className,
  srBraille,
  asFont,
}: {
  cells: readonly Cell[];
  eightDot: boolean;
  size?: number;
  states?: ReadonlyArray<"neutral" | "correct" | "wrong" | "pending">;
  className?: string;
  /**
   * Lese-/Lösungs-Anzeige: gibt die Zellen zusätzlich als ECHTE Braillezeichen
   * (Unicode-Braille, U+2800-Block) in einem sr-only-Text aus - eine
   * Braillezeile zeigt damit die tatsächlichen Zellen (⠃⠁ …) zum Ertasten,
   * statt nur die gesprochene Beschreibung „Punkte 1, 2, 4" pro Zelle. Die
   * sichtbaren SVG-Zellen sind dann für Screenreader ausgeblendet, damit die
   * Zeile nicht doppelt (Beschreibung + Zeichen) liest. Leerzellen werden zum
   * Wort-Zwischenraum.
   */
  srBraille?: boolean;
  /** Zellen als HBS-Schriftzeichen statt SVG-Punktraster setzen (nur die
   *  Text-Ansichten, Johannes 22.09.2026) - siehe `BrailleFontText`. Braucht
   *  `srBraille`, sonst fehlt die Auskunft für die Sprachausgabe. */
  asFont?: boolean;
}) {
  const visual = asFont ? (
    <div className={className} aria-hidden={srBraille ? "true" : undefined}>
      <BrailleFontText cells={cells} eightDot={eightDot} size={size} />
    </div>
  ) : (
    <div
      className={"flex flex-wrap items-end gap-1 " + (className ?? "")}
      aria-hidden={srBraille ? "true" : undefined}
    >
      {cells.map((c, i) =>
        c === BLANK ? (
          <span key={i} className="w-4" aria-hidden="true" />
        ) : (
          <BrailleCell
            key={i}
            cell={c}
            eightDot={eightDot}
            size={size}
            state={states?.[i] ?? "neutral"}
          />
        ),
      )}
      {cells.length === 0 && <span className="text-ink-muted">—</span>}
    </div>
  );
  if (!srBraille) return visual;
  const brailleText = cells
    .map((c) => (c === BLANK ? " " : cellToUnicode(c)))
    .join("");
  return (
    <>
      {visual}
      <span className="sr-only">{brailleText}</span>
    </>
  );
}

// ---------------------------------------------------------------------------
// Legende: neue Zeichen als Druckschrift → Braille
// ---------------------------------------------------------------------------
function Legend({
  chars,
  zeichen,
  system,
  eightDot,
  listRef,
  grossschreibzeichen = true,
}: {
  chars: string;
  /** Reine Lernzeichen für die Kästchen, wenn `chars` ein SATZ ist (z. B.
   *  „ei = ⠩ (1-4-6) · ie = ⠬ (3-4-6)") und nicht Zeichen-für-Zeichen bzw.
   *  wortweise zerlegt werden darf. Fehlt es, gilt die alte Zerlegung von
   *  `chars` weiter (Befund 22.09.2026: Punktnummern und „=" landeten sonst
   *  als eigene, sinnlose Kästchen). */
  zeichen?: string[];
  system: BrailleSystem;
  eightDot: boolean;
  /** „Meine Tasten": Alt+M springt hierhin, danach listet Pfeil-ab Zeichen für Zeichen auf. */
  listRef?: RefObject<HTMLUListElement>;
  /** Klassen-Einstellung „Großschreibzeichen" (Basis/Voll) - Standard an. */
  grossschreibzeichen?: boolean;
}) {
  const tokens = zeichen ?? (chars.includes(" ") ? chars.split(" ") : [...chars]);
  return (
    <ul
      ref={listRef}
      tabIndex={-1}
      aria-label={pg("Meine Tasten: neue Zeichen dieser Etappe", (t) => t.trainer.meineTasten)}
      className="m-0 flex list-none flex-wrap gap-3 p-0 outline-none"
    >
      {tokens.map((t, i) => {
        // Zahlenbrüche (b13c, z. B. "1/2") laufen über die Marburger
        // Mathematikschrift, nicht über die Textschrift-Engine - siehe
        // marburgerMathe.ts. Für jedes andere Zeichen ein No-op (Fallback).
        const cells = textToCellsMathe(t, { system, grossschreibzeichen });
        const label = `${t}: ${cells.map(dotsLabel).join(", ")}`;
        return (
          <li
            key={i}
            className="rounded-xl border border-hairline bg-surface-sunken px-3 py-2"
          >
            <div aria-hidden="true" className="flex flex-col items-center gap-1">
              <span className="text-3xl font-bold text-ink">{t}</span>
              <BrailleCellRow cells={cells} eightDot={eightDot} size={30} />
            </div>
            {/* Als echter Text statt aria-label (robuster über Screenreader
                hinweg) + echtes Braillezeichen für die Zeile zum Ertasten. */}
            <span className="sr-only">
              {label} {cells.map(cellToUnicode).join("")}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

// Kürzungs-Legende: jede Kürzung mit ihrem ECHTEN Braillezeichen (async via
// liblouis, Tabelle über `solve` bestimmt - de-g2 für dt. Kurzschrift,
// en-ueb-g2 für UEB) - die Eigenbau-Engine würde hier die Vollschrift-Zellen
// zeigen, nicht die Kürzung. Wird nur im ausgeklappten Zustand gerendert.
function KurzLegend({
  units,
  eightDot,
  solve,
  glossFor,
  listRef,
}: {
  units: string[];
  eightDot: boolean;
  solve: (text: string) => Promise<string | null>;
  /** Bedeutung je Einheit, sichtbar UND per aria-label angezeigt (z. B. „b" → „but") -
   *  nötig, wo der Kürzungs-Schlüssel selbst nicht das Wort ist (UEB Welt 1). */
  glossFor?: (unit: string) => string | undefined;
  /** „Meine Tasten": Alt+M springt hierhin, danach listet Pfeil-ab Kürzung für Kürzung auf. */
  listRef?: RefObject<HTMLUListElement>;
}) {
  const [cells, setCells] = useState<Record<string, Cell[]>>({});
  useEffect(() => {
    let alive = true;
    // Kein Vorladen des Workers mehr (20.09.2026) - siehe BrailleZeichenliste:
    // `solve` (toBraille) nimmt zuerst die vorgerechnete Tabelle.
    void (async () => {
        const out: Record<string, Cell[]> = {};
        for (const u of units) {
          // Beschreibende Mehrwort-Einträge (KFA-Lektion 48: Ankündigungszeichen)
          // sind keine übersetzbaren Kürzungen → nur als Text zeigen.
          if (u.includes(" ")) continue;
          try {
            const brl = await solve(u);
            if (brl != null) out[u] = unicodeToCells(brl);
          } catch {
            /* einzelne Kürzung nicht übersetzbar → überspringen */
          }
        }
        if (alive) setCells(out);
    })().catch(() => { /* liblouis nicht da → nur Text */ });
    return () => {
      alive = false;
    };
  }, [units.join("·"), solve]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <ul
      ref={listRef}
      tabIndex={-1}
      aria-label="Meine Tasten: Kürzungen dieser Welt"
      className="m-0 flex list-none flex-wrap gap-3 p-0 outline-none"
    >
      {units.map((u) => {
        const gloss = glossFor?.(u);
        const label = [
          gloss ? `${u}, bedeutet ${gloss}` : u,
          cells[u] ? cells[u].map(dotsLabel).join(", ") : null,
        ]
          .filter(Boolean)
          .join(": ");
        return (
          <li
            key={u}
            className="rounded-xl border border-hairline bg-surface-sunken px-3 py-2"
          >
            <div aria-hidden="true" className="flex flex-col items-center gap-1">
              <span className="text-2xl font-bold text-ink">{u}</span>
              {gloss && <span className="text-xs text-ink-muted">= {gloss}</span>}
              {cells[u] ? (
                <BrailleCellRow cells={cells[u]} eightDot={eightDot} size={28} />
              ) : (
                <span className="text-xs text-ink-muted">…</span>
              )}
            </div>
            {/* Echter Text + tastbares Braillezeichen (siehe Legend). */}
            <span className="sr-only">
              {label}
              {cells[u] ? ` ${cells[u].map(cellToUnicode).join("")}` : ""}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

// ---------------------------------------------------------------------------
// Die Größe des Übungsbereichs (Alt + / −)
// ---------------------------------------------------------------------------
/**
 * ★★★ EINE GRÖSSE FÜR ALLE VIER ÜBUNGS-PANELS (07.09.2026).
 *
 * Johannes: *„zoom funktioniert im Lesen Modus nicht, kein Alt ++"*.
 *
 * Gemessen: Der Zoom-Speicher (`useBrailleA11y`) und das Kürzel Alt + Plus
 * waren in Ordnung - die Anzeige zählte sichtbar auf „200 %" hoch. Nur EIN
 * Panel las die Zahl je aus: `WritePanel`. `ReadPanel`, `TextPanel` und
 * `TextReadPanel` zeichneten ihre Zellen mit fest verdrahteten 40 bzw. 28 und
 * 32 Pixeln. Wer las statt zu schreiben, drückte also eine Taste, hörte den
 * Knopf hochzählen und sah nichts - ausgerechnet dort, wo ein Kind mit
 * Sehbeeinträchtigung die Punkte mit den Augen ABLESEN muss.
 *
 * Der Faktor steht darum ab jetzt an EINER Stelle. Wer ein fünftes Panel baut,
 * ruft diesen Haken auf und hat die Vergrößerung, ohne sie zu kennen
 * ([[feedback_zwei_stellen_die_voneinander_nichts_wissen]]).
 *
 * ⚠️ Skaliert wird die SCHRIFT-/Zellgröße, nicht per CSS-`zoom`: So bleibt die
 * volle Breite erhalten und die Zellen brechen um, statt aus dem Bild zu
 * laufen. Der Browser-Zoom (Strg/Cmd + Plus) bleibt davon unberührt.
 *
 * ⚠️ Bei 100 % muss JEDES Panel genau so aussehen wie vorher - darum bekommt
 * der Haken die bisherigen Grundwerte übergeben statt eigene zu erfinden. Ein
 * Panel, das plötzlich größer startet, wäre eine unbestellte Änderung.
 *
 * @param grundgroesse Zellgröße bei 100 % - die Panels sind verschieden dicht
 *   gesetzt (Einzelwort 40, ganzer Text 28, Lesevorlage 32).
 * @param grundschrift Schriftgröße des Aufgabentexts bei 100 %, in rem
 *   (Einzelwort 1,8 seit der Verkleinerung vom 20.09.2026 abends - vorher
 *   2,4, Johannes: „Die Vorlagezeichen sind unnötig hoch"; ganzer Text
 *   1,125 = die bisherige Klasse `text-lg`).
 */
function useUebungsGroesse(grundgroesse = 40, grundschrift = 1.8) {
  const zoom = useBrailleA11y((s) => s.zoom);
  return {
    zoom,
    /** Kantenlänge einer Braillezelle in Pixeln. */
    cellSize: Math.round(grundgroesse * zoom),
    /** Aufgaben-/Vorlagentext (Druckschrift). */
    promptStyle: {
      fontSize: `${(grundschrift * zoom).toFixed(2)}rem`,
      lineHeight: 1.1,
    },
    /** Antwortfeld und seine Beschriftung - 1 rem bei 100 %, höchstens 3 rem.
     *  Gedeckelt, weil ein Eingabefeld mit 8-facher Schrift keine Zeile mehr
     *  auf den Bildschirm bekommt; die Zellen dürfen umbrechen, ein Feld nicht. */
    feldStyle: { fontSize: `${Math.min(3, zoom).toFixed(2)}rem` },
  };
}

// ---------------------------------------------------------------------------
// Schreiben: Text → Braille (Akkord-Tastatur)
// ---------------------------------------------------------------------------
const EMPTY_CELLS: Cell[] = [];

/**
 * ★★★ KEIN STILLER RÜCKFALL AUF DIE EIGENBAU-ENGINE (Befund 20.09.2026).
 *
 * `solve` liefert die Kurzschrift-/UEB-Soll-Zellen via liblouis, nur für die
 * Level `kurz-*`/`ueb-*` gesetzt. Beide tragen `system: "voll"`. Bis heute
 * fiel ein `null`/ein geworfener Fehler auf `textToCells(prompt, { system,
 * grossschreibzeichen })` zurück - die Eigenbau-Engine kennt aber gar keine
 * Kürzungen und hätte VOLLSCHRIFT geliefert. Gemessen über 294 Kurzschrift-
 * Aufgaben aus 49 Level: 294 von 294 wären falsch gewesen, und zwar STILL -
 * ein Kind, das die richtige (kurze) Lösung tippt, wäre als falsch gewertet
 * worden. Jetzt: `failed=true`, `target`/`cells` bleiben leer, keine Aufgabe
 * entsteht. Die Eingabe-Guards (`idx >= target.length`) greifen dann von
 * selbst, weil die Länge 0 ist.
 */
function useAsyncBrailleTarget(
  solve: ((prompt: string) => Promise<Cell[] | null>) | undefined,
  prompt: string,
  system: BrailleSystem,
  grossschreibzeichen: boolean,
  /** Zähler von „Noch einmal versuchen" - jede Änderung stößt `solve` erneut an. */
  retryNonce: number,
): { target: Cell[]; loading: boolean; failed: boolean } {
  // Synchrones Ziel (Basis/Voll/Computer) ODER asynchrones de-g2/UEB-Ziel (Kurzschrift).
  // Zahlenbrüche (b13c) laufen über die Marburger Mathematikschrift statt über
  // die Textschrift-Engine - siehe marburgerMathe.ts (additiv, kein Eingriff
  // in `textToCells`/`engine.ts` selbst).
  const syncTarget = useMemo(
    () => (solve ? null : textToCellsMathe(prompt, { system, grossschreibzeichen })),
    [solve, prompt, system, grossschreibzeichen],
  );
  const [asyncTarget, setAsyncTarget] = useState<Cell[] | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (!solve) return;
    let alive = true;
    setAsyncTarget(null);
    setFailed(false);
    void solve(prompt)
      .then((c) => {
        if (!alive) return;
        if (c) setAsyncTarget(c);
        else setFailed(true); // kein Rückfall — siehe Dok. oben
      })
      .catch(() => {
        if (alive) setFailed(true); // kein Rückfall — siehe Dok. oben
      });
    return () => {
      alive = false;
    };
    // retryNonce erzwingt den erneuten Aufruf über „Noch einmal versuchen",
    // ohne dass sich prompt/system geändert haben müssten.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [solve, prompt, system, grossschreibzeichen, retryNonce]);
  const loading = solve != null && asyncTarget == null && !failed;
  const target = (solve ? asyncTarget : syncTarget) ?? EMPTY_CELLS;
  return { target, loading, failed };
}

/** Ansage + Banner-Text, wenn die Übersetzung ausbleibt - EINE Quelle für
 *  beide (siehe [[feedback_zwei_stellen_die_voneinander_nichts_wissen]]).
 *  Macht KEINE Aussage über das Kind: die Übersetzung fehlt, nicht die
 *  Eingabe. Nennt einen echten Ausweg (der Knopf im Banner). */
function uebersetzungFehltText(address: "du" | "sie", label: string): string {
  return address === "du"
    ? `Die ${label} wird gerade geladen. Wenn es nicht weitergeht, drücke „Noch einmal versuchen".`
    : `Die Übersetzung für ${label} ist gerade nicht verfügbar. Versuchen Sie es noch einmal.`;
}

/**
 * Banner statt Aufgabe, wenn die Übersetzung ausbleibt. `onRetry` stößt
 * `solve` erneut an; das Panel führt den Fokus danach selbst zur Eingabezeile
 * (siehe Aufrufer - gleiches Muster wie Alt+E/`focusInputNonce`).
 */
function UebersetzungFehlt({
  address,
  label,
  onRetry,
}: {
  address: "du" | "sie";
  label: string;
  onRetry: () => void;
}) {
  return (
    <div
      role="status"
      className="space-y-3 rounded-xl border border-warning/50 bg-warning-soft p-3 text-center text-sm font-medium text-ink"
    >
      <p className="m-0">{uebersetzungFehltText(address, label)}</p>
      <button type="button" className="btn-primary" onClick={onRetry}>
        Noch einmal versuchen
      </button>
    </div>
  );
}

/** Getrennt exportiert für den Wächter der „Übersetzung fehlt"-Meldung im
 *  Test (`tests/braille-kurzschrift-kein-rueckfall.test.tsx`) - normal
 *  benutzt wird das Panel nur über `LevelRunner`. */
export function WritePanel({
  prompt,
  system,
  eightDot,
  solve,
  address = "sie",
  grossschreibzeichen = true,
  uebersetzungLabel = "Kurzschrift",
  round,
  onDone,
  onTask,
  onAnnounce,
}: {
  prompt: string;
  system: BrailleSystem;
  eightDot: boolean;
  /** Anrede der Rahmentexte: „du" (Punktgenau/Kinder) oder „sie" (LMS-Embeds). */
  address?: "du" | "sie";
  /**
   * Optionaler asynchroner Soll-Löser (Kurzschrift: Text → de-g2-Braille via
   * liblouis). Wenn gesetzt, kommt das Ziel aus `solve(prompt)` statt aus der
   * synchronen Eigenbau-Engine `textToCells`. Liefert `solve` `null` oder
   * wirft es → KEIN Rückfall auf `textToCells` mehr (Befund 20.09.2026, siehe
   * `useAsyncBrailleTarget`): das Panel zeigt statt der Aufgabe eine Meldung.
   *
   * ⚠️ `solve` ist nur für Kurzschrift/UEB gesetzt (siehe LevelRunner) - dort
   * gibt es die Klassen-Einstellung „Großschreibzeichen" nicht (sie gilt nur
   * für Basis/Voll), die liblouis-Lösung wird also NIE anstelle einer
   * Basis-/Vollschrift-Zielzelle genommen, bei der `grossschreibzeichen`
   * unterdrückt werden müsste.
   */
  solve?: (prompt: string) => Promise<Cell[] | null>;
  /** Klassen-Einstellung „Großschreibzeichen" (Basis/Voll) - Standard an. */
  grossschreibzeichen?: boolean;
  /** Name der Übersetzung für die Fehlschlag-Meldung („Kurzschrift" oder
   *  „UEB (Englisch)") - nur relevant, wenn `solve` gesetzt ist. */
  uebersetzungLabel?: string;
  /**
   * Runden-Anzeige (Striche, Alt+Z) - vom Runner durchgereicht (Charge „Ein
   * Kasten" 20.09.2026 Abend). Ohne Wert (eingebettete Einzelübung
   * `BrailleExercise`) wird NICHTS gezeichnet - kein leerer Platzhalter, kein
   * verrutschtes Layout.
   */
  round?: RoundInfo;
  onDone: (correct: boolean) => void;
  onTask?: (correct: boolean, meta: TaskMeta) => void;
  onAnnounce?: AnnounceCallback;
}) {
  const [retryNonce, setRetryNonce] = useState(0);
  const { target, loading, failed } = useAsyncBrailleTarget(
    solve,
    prompt,
    system,
    grossschreibzeichen,
    retryNonce,
  );
  const [entered, setEntered] = useState<Cell[]>([]);
  const [result, setResult] = useState<null | "correct">(null);
  const [hint, setHint] = useState(false); // „Umschalt" gedrückt → Lösung der aktuellen Zelle
  // Nach einer falschen Zelle: das richtige Braillezeichen an der aktuellen
  // Stelle einblenden (Reveal), bis es richtig getippt ist.
  const [reveal, setReveal] = useState(false);
  const wrongCountRef = useRef(0); // Fehler in DIESEM Wort (entscheidet „sauber gemeistert")
  const firstWrong = useRef<{ typed?: Cell; target?: Cell } | null>(null);
  const cleanRef = useRef(true); // Wort ohne Fehler abgeschlossen?
  const areaRef = useRef<HTMLTextAreaElement>(null);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;
  const onTaskRef = useRef(onTask);
  onTaskRef.current = onTask;
  const onAnnounceRef = useRef(onAnnounce);
  onAnnounceRef.current = onAnnounce;
  const startRef = useRef(Date.now());
  const spokenAtStartRef = useRef(0);
  const lenRef = useRef(0); // synchroner Zähler gesetzter Zellen (für Sofort-Ton)
  const pasted = useRef(false);
  const blurred = useRef(false);

  const paused = useBraillePlay((s) => s.paused);
  const repeatNonce = useBraillePlay((s) => s.repeatNonce);
  const focusInputNonce = useBraillePlay((s) => s.focusInputNonce);
  const helpId = useId();
  // ★ Aufforderung („Schreib in Braille:") steht seit dem Umbau ÜBER dem
  // Kasten (Johannes 20.09.2026 Abend: „soll nicht im Rahmen stehen, sondern
  // schlank darüber") - `data-angabe` bleibt am Aufgabenwort IM Kasten,
  // daran hängt die Lesestelle (§6.2). Damit eine Sprachausgabe die beiden
  // trotzdem als EINE Einheit vorliest, beschreibt die Aufforderung das Wort
  // per `aria-describedby` (nicht `aria-labelledby`/eigener Name: das würde
  // bei jedem Fokus auf dem Kasten erneut vorgelesen - Beschreibung kommt
  // nur einmal, siehe `helpId` direkt darüber im selben Muster).
  const promptLabelId = useId();

  // Größe (Alt + / −) - siehe `useUebungsGroesse`.
  const { cellSize, promptStyle } = useUebungsGroesse(40);

  // Das Wort ist fertig (letzte Zelle saß) → abschließen. Kein Enter nötig.
  // „sauber" = keine einzige Fehl-Zelle; nur dann zählt das Wort als gemeistert
  // (sonst kommt es gleich noch einmal - ehrliche Gewichtung wie bei Tastenflow).
  const completeWord = () => {
    if (result) return;
    const rawMs = Date.now() - startRef.current;
    const spokenInTask = spokenMs() - spokenAtStartRef.current;
    const fairMs = typingGapMs(rawMs, spokenInTask, isSpeaking());
    const clean = wrongCountRef.current === 0;
    cleanRef.current = clean;

    setResult("correct");
    onTaskRef.current?.(clean, {
      ms: fairMs,
      cells: target.length,
      pasted: pasted.current,
      blurred: blurred.current,
      spokenMs: spokenInTask > 0 ? spokenInTask : undefined,
      typed: firstWrong.current?.typed !== undefined ? dotsLabel(firstWrong.current.typed) : undefined,
    });
    // Kein „Richtig" sagen - der Wort-fertig-Ton ist das Urteil. AUSSER die
    // Sounds sind stummgeschaltet (ruhige Klasse): dann wäre Erfolg auf gar
    // keinem Kanal hörbar → einmal kurz „Richtig." ansagen.
    if (isSoundMuted()) onAnnounceRef.current?.(announceCorrect());
    playWordDone();
  };

  useEffect(() => {
    // Fokus nur übernehmen, wenn niemand gerade Kopfzeilen-Schalter bedient
    // (Remount bei Bereichs-/Etappenwechsel darf den Fokus nicht klauen).
    if (mayStealFocus()) areaRef.current?.focus({ preventScroll: true });
    spokenAtStartRef.current = spokenMs();
    const onBlur = () => {
      blurred.current = true;
    };
    window.addEventListener("blur", onBlur);
    return () => window.removeEventListener("blur", onBlur);
  }, []);

  // Fokus zurückbringen wenn Alt+W (Wiederholen) ausgelöst wird
  useEffect(() => {
    if (repeatNonce > 0 && result === null) {
      areaRef.current?.focus({ preventScroll: true });
    }
  }, [repeatNonce, result]);

  // Alt+E - Fokus explizit ins Eingabefeld holen (ausdrücklicher Wunsch,
  // daher OHNE mayStealFocus-Bedingung).
  useEffect(() => {
    if (focusInputNonce > 0) areaRef.current?.focus({ preventScroll: true });
  }, [focusInputNonce]);

  // „Noch einmal versuchen" (siehe UebersetzungFehlt-Banner unten) - gleiches
  // Muster wie Alt+E: der Knopf hat sein eigenes Fokus-Ziel, die Eingabezeile.
  useEffect(() => {
    if (retryNonce > 0) areaRef.current?.focus({ preventScroll: true });
  }, [retryNonce]);

  useLoadingAnnounce(loading, failed, uebersetzungFehltText(address, uebersetzungLabel), onAnnounceRef);

  // Fokus zurückbringen wenn Pause aufgehoben wird (nur bei der ECHTEN
  // Flanke pausiert→weiter - beim Mount würde der Effekt sonst den
  // Anti-Fokus-Klau von oben aushebeln).
  const wasPausedRef = useRef(paused);
  useEffect(() => {
    const was = wasPausedRef.current;
    wasPausedRef.current = paused;
    if (was && !paused && result === null) {
      areaRef.current?.focus({ preventScroll: true });
    }
  }, [paused, result]);

  useEffect(() => {
    if (result === "correct") {
      const t = setTimeout(() => onDoneRef.current(cleanRef.current), AUTO_NEXT_MS);
      return () => clearTimeout(t);
    }
  }, [result]);

  // Eine fertig getippte Zelle prüfen. RICHTIG → kurzer Ton, vorrücken; ist es
  // die letzte Zelle, schließt das Wort automatisch ab (kein Enter). FALSCH →
  // Fehlerton, das richtige Zeichen einblenden und NICHT vorrücken (erst richtig,
  // dann weiter). So baut sich sauberes Muster auf.
  const commitCell = (c: Cell, expectSpace: boolean) => {
    const idx = lenRef.current;
    if (idx >= target.length) return;
    const tcell = target[idx];
    const ok = expectSpace ? tcell === BLANK : c === tcell;
    if (!ok) {
      playErrorSound();
      wrongCountRef.current += 1;
      if (!firstWrong.current) firstWrong.current = { typed: expectSpace ? undefined : c, target: tcell };
      setReveal(true);
      onAnnounceRef.current?.(
        announceWrong({
          direction: "write",
          prompt,
          typedCell: expectSpace ? undefined : c,
          targetCell: tcell,
          // Fehler-Tipp („Es fehlt Punkt 1 - oben links.") - abschaltbar.
          verbose: useVoice.getState().verbalizeErrors,
        }),
      );
      return;
    }
    // Richtig getippt → eine evtl. noch laufende Punkte-Ansage sofort abbrechen.
    cancelSpeech();
    playCorrectTick();
    setReveal(false);
    lenRef.current = idx + 1;
    setEntered((e) => [...e, tcell]);
    if (lenRef.current >= target.length) completeWord();
  };

  const chord = useBrailleChord({
    eightDot,
    nachlaufMs: CHORD_NACHLAUF_MS,
    fensterMs: CHORD_FENSTER_MS,
    enabled: result === null && !paused && !loading && !failed,
    onCommit: (c) => commitCell(c, false),
    onSpace: () => commitCell(BLANK, true),
    onBackspace: () => {
      if (lenRef.current === 0) return;
      lenRef.current -= 1;
      setReveal(false);
      setEntered((e) => e.slice(0, -1));
    },
    // Enter ist nicht mehr nötig (Wort schließt automatisch ab) - als sanfter
    // Fallback prüft es höchstens die letzte fehlende Zelle nicht; daher No-op.
    onEnter: () => {},
  });

  // Umschalt-Taste (gedrückt halten) blendet die Lösung der aktuellen Zelle ein.
  const onAreaKeyDown = (e: ReactKeyboardEvent) => {
    if (e.key === "Shift") {
      setHint(true);
      // E9: aktuelle Zelle als Punkte ansagen
      if (result === null) {
        const idx = entered.length;
        const currTarget = idx < target.length ? target[idx] : undefined;
        if (currTarget !== undefined && currTarget !== BLANK) {
          onAnnounceRef.current?.(announceCellHint(currTarget, keyLabelsForCell(currTarget)));
        } else if (currTarget === BLANK) {
          // Sichtbar steht hier „Leertaste (Lücke)" - hörbar bisher nichts.
          onAnnounceRef.current?.({
            channel: "status",
            text: pg("Aktuelle Stelle: Leertaste — die Lücke zwischen Wörtern.", (t) => t.trainer.aktuelleStelleLeer),
          });
        }
      }
    }
    chord.onKeyDown(e);
  };
  const onAreaKeyUp = (e: ReactKeyboardEvent) => {
    if (e.key === "Shift") setHint(false);
    chord.onKeyUp(e);
  };
  const onAreaBlur = () => {
    setHint(false);
    chord.onBlur();
  };

  const currentIdx = entered.length;
  // Zeiger der Schreibzeile: Kurzschrift (`solve`) nur wortweise - ihre
  // Übersetzung kommt vom Server, ein Wortanfang lässt sich nicht nachrechnen.
  // Kurzschrift (`solve`): hinter dem Wort, das dran ist, je Zelle der
  // gekürzten Form ein Punkt 7 - geschriebene Zellen ersetzen ihn
  // (Johannes 07.10.2026, siehe `kurzschriftZeile`).
  const schreibzeile = useMemo(
    () =>
      solve
        ? kurzschriftZeile(prompt, target, entered)
        : {
            wert: prompt,
            zeiger: zeigerImText(prompt, target, entered.length, (w) =>
              textToCellsMathe(w, { system, grossschreibzeichen }),
            ),
          },
    [prompt, target, entered, solve, system, grossschreibzeichen],
  );
  const currentTarget =
    currentIdx < target.length ? target[currentIdx] : undefined;

  return (
    /* ★★★ Die Kennzeichen der gemeinsamen Bauart (§13): `data-aufgabe` an der
       Aufgabe, `data-angabe` an der Angabe, `data-feld` am Antwort-Element.
       Wer sie setzt, bekommt Lesestelle (§6.2) und Fokus-Wächter (§3) ohne
       eine weitere Zeile Code. */
    <div className="space-y-2" data-aufgabe={`schreiben-${prompt}`}>
      {/* ★★★ EIN KASTEN (Charge 20.09.2026 Abend, Vorbild `TypingSession.tsx`
          um `tt-ticks`/`zeilenTitel`): Angabe und Feld standen bis hierhin in
          ZWEI getrennten Karten übereinander - Johannes' Screenshot zeigte
          Tastenflow als ruhigeres Vorbild, EIN gerahmter Kasten mit einer
          Kopfzeile und einer Trennlinie zur Tippzeile darunter.
          `data-feld` bleibt am selben Element wie vorher - Fokus-Wächter (§3)
          sieht keinen Unterschied. Der gestrichelte Rahmen der Zellenzeile
          wird zur inneren Trennlinie (`border-t`): ein gestrichelter UND ein
          durchgezogener Rand nebeneinander in einem Kasten sah unruhiger aus
          als eine Linie.

          ★★ ZWEITE KORREKTUR (noch am selben Abend): Die Aufforderung
          „Schreib in Braille:" gehört NICHT in den Rahmen - Tastenflows
          Kopfzeile zeigt dort ja auch nur die Angabe selbst („f, linker
          Zeigefinger"), keine Aufforderung. Sie steht jetzt schlank DARÜBER
          (kleine, gedämpfte Schrift, keine eigene Karte). `data-angabe`
          wandert mit an das Aufgabenwort IM Kasten - daran hängt die
          Lesestelle (§6.2), die einen sichtbaren Anker braucht, keinen davor
          stehenden Text. Damit die beiden weiter als EINE Einheit vorgelesen
          werden, beschreibt die Aufforderung das Wort über
          `aria-describedby={promptLabelId}` (Begründung an `promptLabelId}` oben). */}
      <p id={promptLabelId} className="m-0 text-center text-sm text-ink-muted">
        {pg(address === "du" ? "Schreib in Braille:" : "Schreiben Sie in Braille:", (t) => t.trainer.schreibPrompt(address))}
      </p>
      <div className="card rounded-2xl focus-within:ring-[4.5px] focus-within:ring-accent">
        {/* Kopfzeile: das Aufgabenwort ÜBER DER VOLLEN KASTENBREITE zentriert -
            auf derselben Achse wie die Zellen im Eingabebereich darunter
            (Johannes 20.09.2026 abends: „nicht auf derselben Achse"). Ursache
            war `justify-between` mit `flex-1 text-center` am Wort: das
            zentrierte nur in der RESTbreite neben den Strichen. Die Striche
            kommen jetzt aus dem Zentrierungs-Fluss - `relative` am Rahmen,
            `absolute` an den Strichen - und das Wort zentriert sich über die
            ganze Breite, so wie die Zellen. Bei 320 px ist neben einem Wort UND
            bis zu 40 Strichen (Text-Etappen) kein Platz nebeneinander: ab da
            rutschen die Striche unter das Wort in die zweite Zeile (`sm:`),
            statt es zu überlagern - gemessen im Browser bei 320 px. */}
        <div className="relative px-4 py-3">
          <p
            className="m-0 text-center font-bold tracking-wide text-ink"
            style={promptStyle}
            data-angabe
            aria-describedby={promptLabelId}
          >
            {prompt}
          </p>
          {/* Nur mit echten Runden-Daten gezeichnet (Prop-Doku oben) - sonst
              kein leerer Platz in der Kopfzeile. */}
          {round && (
            <div className="mt-2 flex justify-center sm:absolute sm:right-3 sm:top-1/2 sm:mt-0 sm:-translate-y-1/2 sm:justify-end">
              <RoundTicks round={round} zahlUnten />
            </div>
          )}
        </div>

        {loading && (
          <div
            role="status"
            className="mx-4 mb-3 rounded-xl border border-accent/40 bg-accent-soft p-3 text-center text-sm font-medium text-ink"
          >
            Übersetzung wird vorbereitet …
          </div>
        )}

        {failed && (
          <div className="mx-4 mb-3">
            <UebersetzungFehlt
              address={address}
              label={uebersetzungLabel}
              onRetry={() => setRetryNonce((n) => n + 1)}
            />
          </div>
        )}

        {paused && (
          <div
            role="status"
            className="mx-4 mb-3 rounded-xl border border-accent/40 bg-accent-soft p-3 text-center text-sm font-medium text-ink"
          >
            {pg("Pause - Alt+P zum Weitermachen", (t) => t.trainer.pause)}
          </div>
        )}
        {/* Anleitung als BESCHREIBUNG statt als Name: die Braillezeile zeigt beim
            Fokus sonst bei jeder Aufgabe die komplette Anleitung (7+ Zeilen-
            Weiterschaltungen), bevor der Inhalt kommt. Als aria-describedby wird
            sie einmal gesprochen, flutet aber nicht dauerhaft die Zeile. */}
        <p id={helpId} className="sr-only">
          {pgTexte() ? (
            pgTexte()!.trainer.schreibHilfe
          ) : (
            <>
              Punkt-Tasten f d s und j k l gleichzeitig drücken und loslassen ergibt
              eine Zelle. Sitzt die Zelle, geht es von selbst weiter. Leertaste für
              die Lücke, Rücktaste löscht. Umschalt gedrückt halten sagt die nächste
              Zelle an.
            </>
          )}
        </p>
        <div
          data-schreibflaeche
          // Leerfläche über/unter den Zellen gekürzt (Johannes 20.09.2026
          // abends): oben deutlich (py-5 → pt-3, 20 px → 12 px), unten etwas
          // (py-5 → pb-4, 20 px → 16 px).
          className="relative border-t border-hairline px-4 pb-4 pt-3 outline-none"
        >
          {/* ★★★ Das Feld trägt die Aufgabe als Text - so steht sie auf der
              Braillezeile, der Zeiger an der Stelle, die dran ist (07.10.2026,
              siehe `Schreibzeile`). Vorher ein `div role="application"`
              (NVDA-Test 2026-07-01: die Punkt-Tasten müssen roh ankommen) -
              ein Textfeld leistet das genauso. */}
          <Schreibzeile
            ref={areaRef}
            text={schreibzeile.wert}
            zeiger={schreibzeile.zeiger}
            tabIndex={result === null ? 0 : -1}
            label={pg("Braille-Eingabefeld", (t) => t.trainer.eingabefeld)}
            feld="braillezellen"
            describedBy={helpId}
            onKeyDown={onAreaKeyDown}
            onKeyUp={onAreaKeyUp}
            onBlur={onAreaBlur}
            onPaste={() => {
              pasted.current = true;
            }}
          />
          {/* Zellenabstand enger (gap-2 → gap-1.5, 8 px → 6 px) - Johannes'
              vierte Feinheit 20.09.2026 abends. */}
          <div className="flex flex-wrap items-end justify-center gap-1.5">
          {/* So viele Plätze wie die Aufgabe lang ist: getippte Zellen sofort
              grün/rot, die aktuelle Live-Zelle, der Rest leer. Leerzeichen
              erscheinen als schmale Lücke; ist die Lücke gerade dran, zeigt ein
              „␣" an, dass hier die Leertaste gedrückt wird. */}
          {target.map((tcell, i) => {
            const isEntered = i < entered.length;
            const isCurrent = result === null && i === entered.length;

            // Gesetztes Leerzeichen oder zukünftige Lücke → nur ein Abstand.
            if (isEntered && entered[i] === BLANK) {
              return <span key={i} className="w-4" aria-hidden="true" />;
            }
            if (!isEntered && !isCurrent && tcell === BLANK) {
              return <span key={i} className="w-4" aria-hidden="true" />;
            }
            // Aktuelle Position, an der eine Lücke erwartet wird → „␣"-Hinweis.
            if (isCurrent && tcell === BLANK) {
              return (
                <div
                  key={i}
                  className="flex h-10 items-center rounded-lg bg-accent-soft px-3 text-lg text-ink-muted ring-1 ring-accent/50"
                  aria-label={pg("aktuelle Stelle: Leertaste drücken", (t) => t.trainer.aktuelleStelleAria)}
                >
                  ␣
                </div>
              );
            }

            // Reveal: nach einer falschen Zelle das RICHTIGE Zeichen an der
            // aktuellen Stelle zeigen (zum Nachtasten), bis es sitzt.
            const showReveal = isCurrent && reveal && tcell !== BLANK;
            const value = isEntered
              ? entered[i]
              : showReveal
                ? tcell
                : isCurrent
                  ? dotsToCell(...chord.pendingDots)
                  : 0;
            // Eingetragene Zellen sind immer korrekt (falsche werden abgewiesen).
            const state = isEntered
              ? "correct"
              : isCurrent
                ? "pending"
                : "neutral";
            return (
              <div
                key={i}
                /* ★ „Hier bist du" gehört ins DOM (09.09.2026): Fläche und
                   `ring-*` sind im Windows-Kontrastmodus beide weg (das eine
                   wird Canvas, das andere ist ein `box-shadow`) - dann sehen
                   alle Zellen gleich aus. `index.css` hängt an dieses Attribut
                   im Kontrastmodus einen Umriss. */
                data-zelle={showReveal ? "hinweis" : isCurrent ? "aktuell" : undefined}
                className={
                  "rounded-lg p-1 transition-colors " +
                  (showReveal
                    ? "bg-warning-soft ring-1 ring-warning/60"
                    : isCurrent
                      ? "bg-accent-soft ring-1 ring-accent/50"
                      : "")
                }
              >
                <BrailleCell
                  cell={value}
                  eightDot={eightDot}
                  size={cellSize}
                  state={state}
                  highlightDots={(hint || showReveal) && isCurrent ? cellDots(tcell) : undefined}
                  label={
                    showReveal
                      ? pg(`richtiges Zeichen: ${dotsLabel(tcell)} — nachtasten`, (t) => t.trainer.richtigesZeichenLabel(dotsLabel(tcell)))
                      : isCurrent
                        ? pg("aktuelle Zelle", (t) => t.trainer.aktuelleZelle)
                        : undefined
                  }
                />
              </div>
            );
          })}
          </div>
        </div>
      </div>

      <KeyLegend eightDot={eightDot} />

      {/* Hilfe: „Umschalt" gedrückt halten blendet die Tasten der aktuellen Zelle ein */}
      {result === null &&
        (hint && currentTarget !== undefined ? (
          <div
            role="status"
            className="rounded-xl border border-accent/40 bg-accent-soft p-3 text-center text-sm text-ink"
          >
            {pgTexte() ? (
              <span className="font-semibold">{pgTexte()!.trainer.aktuelleZelleKopf(currentIdx + 1, target.length)}</span>
            ) : (
              <>
                <span className="font-semibold">Aktuelle Zelle</span> ({currentIdx + 1}{" "}
                von {target.length}):
              </>
            )}{" "}
            {currentTarget === BLANK ? (
              <>
                <kbd>{pg("Leertaste", (t) => t.trainer.leertaste)}</kbd> {pg("(Lücke)", (t) => t.trainer.lueckeKlammer)}
              </>
            ) : (
              <>
                {cellDots(currentTarget).map((d, k) => (
                  <span key={d}>
                    {k > 0 ? " + " : ""}
                    <kbd>{DOT_KEY_LABEL[d]}</kbd>
                  </span>
                ))}{" "}
                <span className="text-ink-muted">· {dotsLabel(currentTarget)}</span>
              </>
            )}
          </div>
        ) : reveal && currentTarget !== undefined ? (
          <p
            role="status"
            className="rounded-xl border border-warning/50 bg-warning-soft p-2 text-center text-sm text-ink"
          >
            <span aria-hidden="true">↑ </span>{pg("Das ist das richtige Zeichen — tippe es nach.", (t) => t.trainer.richtigesZeichen)}
            {/* Für Braillezeile/Nachlesen: die Lösung auch als Punkte + echtes
                Zeichen (die Blitz-Ansage von vorhin ist längst verflogen). */}
            {currentTarget !== BLANK && (
              <span className="sr-only">
                {" "}
                {dotsLabel(currentTarget)} {cellToUnicode(currentTarget)}
              </span>
            )}
          </p>
        ) : null)}

      {result === "correct" && (
        <p
          role="status"
          className="rounded-xl border border-success/40 bg-success-soft p-3 text-center font-medium text-ink"
        >
          <span aria-hidden="true">✓ </span>
          {pg(cleanRef.current ? "Geschafft! Weiter …" : "Weiter …", (t) => (cleanRef.current ? t.trainer.geschafftWeiter : t.trainer.weiter))}
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Lesen: Braille → Text
// ---------------------------------------------------------------------------
/** Getrennt exportiert - siehe `WritePanel` oben (gleicher Test-Grund). */
export function ReadPanel({
  prompt,
  system,
  eightDot,
  solve,
  lang,
  address = "sie",
  grossschreibzeichen = true,
  uebersetzungLabel = "Kurzschrift",
  round,
  onDone,
  onTask,
  onAnnounce,
}: {
  prompt: string;
  system: BrailleSystem;
  eightDot: boolean;
  /** Anrede der Rahmentexte: „du" (Punktgenau/Kinder) oder „sie" (LMS-Embeds). */
  address?: "du" | "sie";
  /** Optionaler async de-g2-Löser (Kurzschrift) - liefert die ANZEIGE-Zellen.
   *  Geprüft wird weiterhin der getippte Klartext gegen prompt (keine Rückübersetzung).
   *  Nur für Kurzschrift/UEB gesetzt - dort gibt es die Einstellung „Großschreibzeichen" nicht.
   *  Liefert `solve` `null` oder wirft es → KEIN Rückfall auf `textToCells`
   *  mehr (Befund 20.09.2026, siehe `useAsyncBrailleTarget`). */
  solve?: (prompt: string) => Promise<Cell[] | null>;
  /** Inhaltssprache des Lösungsworts (UEB = "en") - für die Falsch-Ansage. */
  lang?: "de" | "en";
  /** Klassen-Einstellung „Großschreibzeichen" (Basis/Voll) - Standard an. */
  grossschreibzeichen?: boolean;
  /** Name der Übersetzung für die Fehlschlag-Meldung („Kurzschrift" oder
   *  „UEB (Englisch)") - nur relevant, wenn `solve` gesetzt ist. */
  uebersetzungLabel?: string;
  /** Runden-Anzeige (Striche, Alt+Z) - siehe `WritePanel`. Ohne Wert wird
   *  nichts gezeichnet. */
  round?: RoundInfo;
  onDone: (correct: boolean) => void;
  onTask?: (correct: boolean, meta: TaskMeta) => void;
  onAnnounce?: AnnounceCallback;
}) {
  const [retryNonce, setRetryNonce] = useState(0);
  const { target: cells, loading, failed } = useAsyncBrailleTarget(
    solve,
    prompt,
    system,
    grossschreibzeichen,
    retryNonce,
  );
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<null | "correct" | "wrong">(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const weiterRef = useRef<HTMLButtonElement>(null);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;
  const onTaskRef = useRef(onTask);
  onTaskRef.current = onTask;
  const onAnnounceRef = useRef(onAnnounce);
  onAnnounceRef.current = onAnnounce;
  const startRef = useRef(Date.now());
  const spokenAtStartRef = useRef(0);
  const pasted = useRef(false);
  const blurred = useRef(false);
  const focusedRef = useRef(false);

  const paused = useBraillePlay((s) => s.paused);
  const repeatNonce = useBraillePlay((s) => s.repeatNonce);
  const focusInputNonce = useBraillePlay((s) => s.focusInputNonce);
  // ★ Aufforderung über dem Kasten, `data-angabe` an der Braille-Vorlage
  // selbst - siehe die ausführliche Begründung am `WritePanel`.
  const promptLabelId = useId();

  // Größe (Alt + / −) - dieselbe Quelle wie beim Schreiben.
  const { cellSize, feldStyle } = useUebungsGroesse(40);

  useLoadingAnnounce(loading, failed, uebersetzungFehltText(address, uebersetzungLabel), onAnnounceRef);

  // Anweisung + Zellen als EINE Sprech-Sequenz. Der Runner sagt Lese-Aufgaben
  // bewusst NUR in die Live-Region an (voice:false) - spräche er per speakUi,
  // würde dessen cancel() genau diese Warteschlange abwürgen, bevor sie
  // startet (Kind-Effekte laufen vor Eltern-Effekten; Befund 2026-07-02).
  const speakCells = useCallback(() => {
    if (!useVoice.getState().enabled) return;
    const labels = cells.filter((c) => c !== BLANK).map(dotsLabel);
    if (labels.length) speakSequence([pg("Lies und tippe das Wort.", (t) => t.trainer.lesenAufgabe), ...labels]);
  }, [cells]);

  useEffect(() => {
    // Kurzschrift löst `cells` erst async auf - der Effekt läuft dann ein
    // zweites Mal (leer → aufgelöst). Fokus nur EINMAL pro Aufgabe setzen -
    // aber erst, wenn das Feld nicht mehr disabled ist (ein disabled Feld
    // schluckt focus() wortlos; das Loch ließ bei Kurzschrift/UEB den Fokus
    // nach jeder Aufgabe auf <body> fallen - Befund 2026-07-02). Und nur,
    // wenn niemand gerade die Kopfzeile bedient (mayStealFocus).
    if (!focusedRef.current && !loading) {
      if (mayStealFocus()) inputRef.current?.focus({ preventScroll: true });
      focusedRef.current = true;
    }
    spokenAtStartRef.current = spokenMs();
    // Bei Self-Voicing AN: Anweisung + Zellen ansagen (Audio-Kanal für blinde Kinder)
    speakCells();
    const onBlur = () => {
      blurred.current = true;
    };
    window.addEventListener("blur", onBlur);
    return () => window.removeEventListener("blur", onBlur);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cells]);

  // Alt+W - Zellfolge erneut ansagen + Fokus zurück ins Antwortfeld.
  const prevRepeatRef = useRef(0);
  useEffect(() => {
    if (repeatNonce === 0 || repeatNonce === prevRepeatRef.current) return;
    prevRepeatRef.current = repeatNonce;
    if (result === null) {
      speakCells();
      if (!paused) inputRef.current?.focus({ preventScroll: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repeatNonce]);

  // Alt+E - Fokus explizit ins Antwortfeld.
  useEffect(() => {
    if (focusInputNonce > 0 && !loading && !paused && !failed) {
      inputRef.current?.focus({ preventScroll: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusInputNonce]);

  // „Noch einmal versuchen" (siehe UebersetzungFehlt-Banner unten) - gleiches
  // Muster wie Alt+E: der Knopf hat sein eigenes Fokus-Ziel, das Antwortfeld.
  useEffect(() => {
    if (retryNonce > 0) inputRef.current?.focus({ preventScroll: true });
  }, [retryNonce]);

  // Nach der Pause zurück ins Feld (nur bei der Flanke pausiert→weiter).
  const wasPausedRef = useRef(paused);
  useEffect(() => {
    const was = wasPausedRef.current;
    wasPausedRef.current = paused;
    if (was && !paused && result === null) {
      inputRef.current?.focus({ preventScroll: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused]);

  useEffect(() => {
    if (result === "correct") {
      const t = setTimeout(() => onDoneRef.current(true), AUTO_NEXT_MS);
      return () => clearTimeout(t);
    }
    if (result === "wrong") weiterRef.current?.focus({ preventScroll: true });
  }, [result]);

  const check = () => {
    if (loading || failed || result || !answer.trim() || paused) return;
    const ok = norm(answer) === norm(prompt);

    // Faire Zeitverrechnung
    const rawMs = Date.now() - startRef.current;
    const spokenInTask = spokenMs() - spokenAtStartRef.current;
    const fairMs = typingGapMs(rawMs, spokenInTask, isSpeaking());

    if (!ok) playErrorSound();
    setResult(ok ? "correct" : "wrong");
    onTaskRef.current?.(ok, {
      ms: fairMs,
      cells: cells.length,
      pasted: pasted.current,
      blurred: blurred.current,
      spokenMs: spokenInTask > 0 ? spokenInTask : undefined,
    });

    // Kein „Richtig"/„Falsch" - Sound genügt. Bei Falsch nur das richtige Wort.
    if (ok) {
      cancelSpeech();
      // Bei stummen Sounds wäre Erfolg sonst auf keinem Kanal hörbar.
      if (isSoundMuted()) onAnnounceRef.current?.(announceCorrect(lang));
      playCorrectTick();
    } else {
      onAnnounceRef.current?.(announceWrong({ direction: "read", prompt, lang }));
    }
  };

  /**
   * ★ EINE Quelle für die Frage - sie steht in der sichtbaren Beschriftung und,
   * nach dem Prüfen, im Namen des Feldes. Zwei Stellen mit demselben Satz gehen
   * irgendwann auseinander
   * ([[feedback_zwei_stellen_die_voneinander_nichts_wissen]]).
   */
  const frageText =
    pg(
      address === "du"
        ? "Was steht hier? Tipp es in Druckschrift:"
        : "Was steht hier? Tippen Sie es in Druckschrift:",
      (t) => t.trainer.frage(address),
    );

  return (
    /* ★★★ Die Kennzeichen der gemeinsamen Bauart (§13): `data-aufgabe` an der
       Aufgabe, `data-angabe` an der Angabe, `data-feld` am Antwort-Element.
       Wer sie setzt, bekommt Lesestelle (§6.2) und Fokus-Wächter (§3) ohne
       eine weitere Zeile Code. */
    <div className="space-y-3" data-aufgabe={`lesen-${prompt}`}>
      {/* ★★★ EIN KASTEN (Charge 20.09.2026 Abend) — siehe die ausführliche
          Begründung am `WritePanel`. Angabe (Braille-Vorlage) und Feld
          (Antwort) waren zwei Karten übereinander, jetzt eine mit
          Trennlinie; `data-feld` bleibt am selben Element.

          ★★ ZWEITE KORREKTUR (siehe WritePanel): Die Aufforderung „Lies die
          Brailleschrift:" steht schlank ÜBER dem Kasten, `data-angabe`
          wandert an die Braille-Vorlage selbst - IM Kasten, denn sie ist
          „das, worum es geht". `aria-describedby` hält die Aufforderung als
          Beschreibung an der Vorlage fest, damit beide weiter als eine
          Einheit vorgelesen werden. */}
      <p id={promptLabelId} className="m-0 text-center text-sm text-ink-muted">
        {pg(address === "du" ? "Lies die Brailleschrift:" : "Lesen Sie die Brailleschrift:", (t) => t.trainer.liesPrompt(address))}
      </p>
      <div className="card rounded-2xl focus-within:ring-[4.5px] focus-within:ring-accent">
        {/* Kopfzeile: links die Braille-Vorlage, rechts die Runden-Striche -
            siehe WritePanel (Vorbild `TypingSession.tsx`, `flex-wrap`-
            Begründung ebenso dort). */}
        <div className="flex flex-wrap items-start justify-between gap-3 px-4 pb-3 pt-4">
          <div className="min-w-0 flex-1" data-angabe aria-describedby={promptLabelId}>
            <div className="flex justify-center">
              {loading ? (
                <span className="text-sm text-ink-muted">Übersetzung wird geladen …</span>
              ) : failed ? (
                <span className="text-sm text-ink-muted">Keine Vorlage — siehe Meldung unten.</span>
              ) : (
                <CellSequence
                  cells={cells}
                  eightDot={eightDot}
                  size={cellSize}
                  className="justify-center"
                  srBraille
                />
              )}
            </div>
            {/* Navigierbare Punkte-Liste für SR-Navigation (zellweise hören) */}
            <ol role="list" aria-label={pg("Braille-Vorlage, Zelle für Zelle", (t) => t.trainer.vorlageAria)} className="sr-only">
              {cells.filter((c) => c !== BLANK).map((c, i) => (
                <li key={i}>{dotsLabel(c)}</li>
              ))}
            </ol>
            <p className="sr-only">
              {pgTexte() ? (
                pgTexte()!.trainer.vorlageHinweis(altAnzeige(pgTexte()!.trainer.altW))
              ) : (
                <>
                  Die Braille-Vorlage steht direkt über dem Eingabefeld - lies sie
                  Zelle für Zelle. {altAnzeige("Alt und W")} sagt sie erneut an.
                </>
              )}
            </p>
          </div>
          {round && (
            <div className="min-w-0 max-w-full">
              <RoundTicks round={round} zahlUnten />
            </div>
          )}
        </div>

        {failed && (
          <div className="mx-4 mb-3">
            <UebersetzungFehlt
              address={address}
              label={uebersetzungLabel}
              onRetry={() => setRetryNonce((n) => n + 1)}
            />
          </div>
        )}

        {paused && (
          <div
            role="status"
            className="mx-4 mb-3 rounded-xl border border-accent/40 bg-accent-soft p-3 text-center text-sm font-medium text-ink"
          >
            {pg("Pause - Alt+P zum Weitermachen", (t) => t.trainer.pause)}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            // ★★★ Der Riegel, der `disabled` ersetzt (Bauart §3): Der
            // Prüfen-Knopf bleibt bedienbar und behält den Fokus - er tut nur
            // nichts, solange nichts dasteht oder schon geprüft wird.
            if (!answer.trim() || loading || failed || result !== null || paused) return;
            check();
          }}
          className="border-t border-hairline px-4 py-4"
        >
          <label className="field-label text-center" htmlFor="read-answer" style={feldStyle}>
            {frageText}
          </label>
          <div className="flex flex-wrap gap-2">
            <input
            id="read-answer"
            ref={inputRef}
            data-feld="antwort"
            // ★ Die Seiten-Kürzel (Alt + W, Z, P, V, 1-5 …) gelten auch hier -
            //   beim Lesen steht der Fokus IMMER in diesem Feld (29.09.2026,
            //   `lib/braille/kuerzelImFeld.ts`).
            data-kuerzel="an"
            type="text"
            /**
             * ★★★★★ DAS ERGEBNIS GEHÖRT AUF DIE ZEILE, AUF DER GELESEN WIRD
             * (§16, nachgezogen am 09.09.2026 aus dem eine andere App der Plattform ).
             *
             * > **Johannes, 09.09.2026:** „soll gleich auf der zeile stehen
             * > richtig oder probiers nochmal"
             *
             * ⚠️⚠️ Nach einer RICHTIGEN Antwort bleibt der Schreibzeiger hier
             * stehen (`readOnly` statt `disabled`, siehe unten) - und die
             * Braillezeile zeigt dann den NAMEN dieses Feldes, seine Art und
             * seinen Inhalt. Der Satz „Richtig gelesen!" steht in einer
             * `role="status"`-Fläche darunter: Er verdrängt die Zeile vier
             * Sekunden lang und ist danach weg
             * ([[reference_live_region_ist_braille_blitzmeldung]]). Wer in
             * diesem Augenblick nachliest, wo er steht, fand bisher nur seine
             * eigene Antwort.
             *
             * ⇒ Der Stand steht jetzt VORNE im Namen: Auf 40 Zellen ist der
             * Anfang das Einzige, was ohne Blättern zu sehen ist.
             * ⚠️ Der sichtbare Text der Beschriftung bleibt vollständig darin
             * enthalten (WCAG 2.5.3) - er wird nur vorne ergänzt.
             * ⚠️ Ohne Stand KEIN `aria-label`: Dann gilt die `<label>`-Zeile,
             * und es gibt nur eine Wahrheit.
             */
            aria-label={result === "correct" ? pg(`Richtig gelesen. ${frageText}`, (t) => t.trainer.richtigGelesenAria(frageText)) : undefined}
            className="field-input flex-1 text-center"
            // ★ Die Antwort wächst mit (Alt + / −): Wer die Punkte nur
            //   vergrößert lesen kann, kann seine eigene Antwort in
            //   Grundgröße genauso wenig kontrollieren.
            style={feldStyle}
            value={answer}
            // ★★★ `readOnly` UND `aria-disabled`, NIE `disabled` (Bauart §3).
            // Hier sass die alte Klage der Schueler im Code: Wer seine Antwort
            // eingetippt hatte und pruefen liess, dem wurde das Feld unter den
            // Fingern ausgeschaltet - der Fokus fiel auf `<body>`, und das ist
            // fuer eine Sprachausgabe der Dokumentenanfang.
            // `readOnly` verhindert das Aendern genauso zuverlaessig, nimmt den
            // Fokus aber nicht weg: Der Schreibzeiger bleibt stehen, und die
            // Braillezeile zeigt weiter, was das Kind geschrieben hat.
            readOnly={result !== null || loading || failed || paused}
            aria-disabled={result !== null || loading || failed || paused || undefined}
            onChange={(e) => {
              setAnswer(e.target.value);
            }}
            onPaste={() => {
              pasted.current = true;
            }}
            placeholder={pg(address === "du" ? "Deine Lösung …" : "Ihre Lösung …", (t) => t.trainer.loesung(address))}
            autoComplete="off"
          />
          {/* ★★★ Senden-Knoepfe nie `disabled` (Bauart §14). Der Riegel steht
              im `onSubmit` des Formulars. */}
          {result === null && (
            <button
              type="submit"
              className={
                "btn-primary" + (!answer.trim() || loading || failed ? " opacity-40" : "")
              }
              aria-disabled={!answer.trim() || loading || failed || undefined}
            >
              {pg("Prüfen", (t) => t.trainer.pruefen)}
            </button>
          )}
          </div>
        </form>
      </div>

      {result === "correct" ? (
        <p
          role="status"
          className="rounded-xl border border-success/40 bg-success-soft p-3 text-center font-medium text-ink"
        >
          <span aria-hidden="true">✓ </span>{pg("Richtig gelesen! Weiter …", (t) => t.trainer.richtigGelesen)}
        </p>
      ) : result === "wrong" ? (
        <div
          role="status"
          className="rounded-xl border border-hairline bg-surface-sunken p-3 text-ink"
        >
          <p className="m-0">
            <span aria-hidden="true">→ </span>{pg("Richtig wäre:", (t) => t.trainer.richtigWaere)} <strong>{prompt}</strong>
          </p>
          <div className="mt-3 flex justify-end">
            <button
              ref={weiterRef}
              type="button"
              className="btn-primary"
              /* ★★★ Das Ergebnis steht am FOKUS, nicht nur in der Statusfläche
                 (29.09.2026). Nach einer falschen Antwort springt der Fokus
                 hierher - und die Braillezeile zeigte nur „Nochmal Schalter".
                 „Richtig wäre: …" stand in `role="status"` darüber: Es
                 verdrängt die Zeile ein paar Sekunden und ist dann weg
                 ([[reference_live_region_ist_braille_blitzmeldung]]). Wie am
                 Antwortfeld steht der Stand VORNE im Namen; das sichtbare
                 „Nochmal" bleibt darin (WCAG 2.5.3). */
              aria-label={pg(`Richtig wäre: ${prompt}. Nochmal`, (t) => t.trainer.richtigWaereAria(prompt))}
              onClick={() => onDone(false)}
            >
              {pg("Nochmal", (t) => t.trainer.nochmal)}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Suchaufgabe: „wo steht es?" und „wie oft?" (23.09.2026)
// ---------------------------------------------------------------------------
/**
 * ★★★ EINE LESE-AUFGABE MIT ANDERER FRAGE - nicht „was steht da", sondern „wo
 * steht es". Deshalb steht hier kein neues `direction`; die Rechnung dazu liegt
 * in `lib/braille/suchaufgabe.ts` (Begründung im dortigen Kopf).
 *
 * ★★ DIE ZIFFERNLISTE IST HIER DER LEHRINHALT, nicht Beiwerk. Ein Kind, das
 * zählt, braucht die Nummer AN der Zelle - deshalb steht sie in jedem
 * sr-only-Eintrag ausgeschrieben („3. Punkte 1, 4, 5") statt sich auf die
 * Nummerierung der Sprachausgabe zu verlassen. Welche Sprachausgabe die
 * Listenposition ansagt und welche nicht, lässt sich aus dem Browser nicht
 * abfragen ([[reference_screenreader_nicht_abfragbar]]) - also sagen wir es
 * selbst.
 *
 * ⚠️ Kein „Richtig"/„Falsch" in eine Live-Region, solange gearbeitet wird -
 * sie verdrängt die Braillezeile vier Sekunden lang. Gleiches Muster wie
 * `ReadPanel`: Ton genügt, der Stand steht vorne im Namen des Feldes.
 */
export function SuchPanel({
  aufgabe,
  eightDot,
  address = "sie",
  round,
  onDone,
  onTask,
  onAnnounce,
}: {
  aufgabe: Suchaufgabe;
  eightDot: boolean;
  address?: "du" | "sie";
  round?: RoundInfo;
  onDone: (correct: boolean) => void;
  onTask?: (correct: boolean, meta: TaskMeta) => void;
  onAnnounce?: AnnounceCallback;
}) {
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<null | "correct" | "wrong">(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const weiterRef = useRef<HTMLButtonElement>(null);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;
  const onTaskRef = useRef(onTask);
  onTaskRef.current = onTask;
  const onAnnounceRef = useRef(onAnnounce);
  onAnnounceRef.current = onAnnounce;
  const startRef = useRef(Date.now());
  const spokenAtStartRef = useRef(0);
  const blurred = useRef(false);
  const focusedRef = useRef(false);

  const paused = useBraillePlay((s) => s.paused);
  const repeatNonce = useBraillePlay((s) => s.repeatNonce);
  const focusInputNonce = useBraillePlay((s) => s.focusInputNonce);
  const promptLabelId = useId();
  const { cellSize, feldStyle } = useUebungsGroesse(40);

  /** Die Zellen der ganzen Reihe, flach - für die Anzeige. */
  const zellen = useMemo(
    () => aufgabe.reihe.map((e) => e.cells),
    [aufgabe],
  );

  /** Anweisung + Reihe als EINE Sprech-Folge (Selbstansage). */
  const speakReihe = useCallback(() => {
    if (!useVoice.getState().enabled) return;
    const teile = aufgabe.reihe.map(
      (e, i) => `${i + 1}. ${e.cells.filter((c) => c !== BLANK).map(dotsLabel).join(", ")}`,
    );
    speakSequence([aufgabe.frage, ...teile]);
  }, [aufgabe]);

  useEffect(() => {
    if (!focusedRef.current) {
      if (mayStealFocus()) inputRef.current?.focus({ preventScroll: true });
      focusedRef.current = true;
    }
    spokenAtStartRef.current = spokenMs();
    speakReihe();
    const onBlur = () => {
      blurred.current = true;
    };
    window.addEventListener("blur", onBlur);
    return () => window.removeEventListener("blur", onBlur);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aufgabe]);

  // Alt+W - Reihe erneut ansagen, Fokus zurück ins Feld.
  const prevRepeatRef = useRef(0);
  useEffect(() => {
    if (repeatNonce === 0 || repeatNonce === prevRepeatRef.current) return;
    prevRepeatRef.current = repeatNonce;
    if (result === null) {
      speakReihe();
      if (!paused) inputRef.current?.focus({ preventScroll: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repeatNonce]);

  // Alt+E - Fokus ins Antwortfeld.
  useEffect(() => {
    if (focusInputNonce > 0 && !paused) inputRef.current?.focus({ preventScroll: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusInputNonce]);

  // Nach der Pause zurück ins Feld (nur an der Flanke).
  const wasPausedRef = useRef(paused);
  useEffect(() => {
    const was = wasPausedRef.current;
    wasPausedRef.current = paused;
    if (was && !paused && result === null) inputRef.current?.focus({ preventScroll: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused]);

  useEffect(() => {
    if (result === "correct") {
      const t = setTimeout(() => onDoneRef.current(true), AUTO_NEXT_MS);
      return () => clearTimeout(t);
    }
    if (result === "wrong") weiterRef.current?.focus({ preventScroll: true });
  }, [result]);

  /** Der Satz, der die richtige Lösung nennt - EINE Quelle für Anzeige und Ansage. */
  const loesungsSatz =
    aufgabe.art === "position"
      ? `${aufgabe.ziel.print} steht an Stelle ${aufgabe.loesung}.`
      : `${aufgabe.ziel.print} steht ${aufgabe.loesung} mal in der Reihe.`;

  const check = () => {
    if (result || !answer.trim() || paused) return;
    const ok = suchAntwortStimmt(aufgabe, answer);

    const rawMs = Date.now() - startRef.current;
    const spokenInTask = spokenMs() - spokenAtStartRef.current;
    const fairMs = typingGapMs(rawMs, spokenInTask, isSpeaking());

    if (!ok) playErrorSound();
    setResult(ok ? "correct" : "wrong");
    onTaskRef.current?.(ok, {
      ms: fairMs,
      cells: zellen.flat().length,
      pasted: false,
      blurred: blurred.current,
      spokenMs: spokenInTask > 0 ? spokenInTask : undefined,
      typed: answer.trim(),
    });

    if (ok) {
      cancelSpeech();
      if (isSoundMuted()) onAnnounceRef.current?.(announceCorrect());
      playCorrectTick();
    } else {
      onAnnounceRef.current?.(announceWrong({ direction: "read", prompt: loesungsSatz }));
    }
  };

  return (
    <div className="space-y-3" data-aufgabe={`suchen-${aufgabe.art}-${aufgabe.ziel.print}`}>
      <p id={promptLabelId} className="m-0 text-center text-sm text-ink-muted">
        {address === "du"
          ? "Taste die Reihe ab und zähle mit:"
          : "Tasten Sie die Reihe ab und zählen Sie mit:"}
      </p>
      <div className="card rounded-2xl focus-within:ring-[4.5px] focus-within:ring-accent">
        <div className="flex flex-wrap items-start justify-between gap-3 px-4 pb-3 pt-4">
          <div className="min-w-0 flex-1" data-angabe aria-describedby={promptLabelId}>
            {/* Sichtbar: die Reihe mit der Platznummer UNTER jeder Zelle. Wer
                zählt, soll nicht mitzählen müssen. Für die Sprachausgabe steht
                dieselbe Auskunft in der Liste darunter. */}
            <div aria-hidden="true" className="flex flex-wrap justify-center gap-3">
              {aufgabe.reihe.map((e, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <BrailleCellRow cells={e.cells} eightDot={eightDot} size={cellSize} />
                  <span className="text-xs tabular-nums text-ink-muted">{i + 1}</span>
                </div>
              ))}
            </div>
            <ol className="sr-only">
              {aufgabe.reihe.map((e, i) => (
                <li key={i}>
                  {i + 1}. {e.cells.filter((c) => c !== BLANK).map(dotsLabel).join(", ")}
                </li>
              ))}
            </ol>
            <p className="sr-only">
              Die Reihe steht direkt über dem Eingabefeld, jede Zelle mit ihrer
              Platznummer. {altAnzeige("Alt und W")} sagt sie erneut an.
            </p>
          </div>
          {round && (
            <div className="min-w-0 max-w-full">
              <RoundTicks round={round} zahlUnten />
            </div>
          )}
        </div>

        {paused && (
          <div
            role="status"
            className="mx-4 mb-3 rounded-xl border border-accent/40 bg-accent-soft p-3 text-center text-sm font-medium text-ink"
          >
            {pg("Pause - Alt+P zum Weitermachen", (t) => t.trainer.pause)}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!answer.trim() || result !== null || paused) return;
            check();
          }}
          className="border-t border-hairline px-4 py-4"
        >
          <label className="field-label text-center" htmlFor="such-answer" style={feldStyle}>
            {aufgabe.frage}
          </label>
          <div className="flex flex-wrap gap-2">
            <input
              id="such-answer"
              ref={inputRef}
              data-feld="antwort"
              data-kuerzel="an"
              type="text"
              inputMode="numeric"
              /* Stand VORNE im Namen - siehe ReadPanel: Auf 40 Zellen ist der
                 Anfang das Einzige, was ohne Blättern zu sehen ist. Der
                 sichtbare Text der Beschriftung bleibt darin enthalten
                 (WCAG 2.5.3). */
              aria-label={result === "correct" ? `Richtig. ${aufgabe.frage}` : undefined}
              className="field-input flex-1 text-center"
              style={feldStyle}
              value={answer}
              /* `readOnly`, NIE `disabled` (Bauart §3) - sonst fiele der Fokus
                 nach dem Prüfen auf <body>, und das ist für eine Sprachausgabe
                 der Dokumentenanfang. */
              readOnly={result !== null || paused}
              aria-disabled={result !== null || paused || undefined}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder={address === "du" ? "Deine Zahl …" : "Ihre Zahl …"}
              autoComplete="off"
            />
            {result === null && (
              <button
                type="submit"
                className={"btn-primary" + (!answer.trim() ? " opacity-40" : "")}
                aria-disabled={!answer.trim() || undefined}
              >
                {pg("Prüfen", (t) => t.trainer.pruefen)}
              </button>
            )}
          </div>
        </form>
      </div>

      {result === "correct" ? (
        <p
          role="status"
          className="rounded-xl border border-success/40 bg-success-soft p-3 text-center font-medium text-ink"
        >
          <span aria-hidden="true">✓ </span>Richtig gezählt! Weiter …
        </p>
      ) : result === "wrong" ? (
        <div
          role="status"
          className="rounded-xl border border-hairline bg-surface-sunken p-3 text-ink"
        >
          <p className="m-0">
            <span aria-hidden="true">→ </span>
            {loesungsSatz}
          </p>
          <div className="mt-3 flex justify-end">
            <button
              ref={weiterRef}
              type="button"
              className="btn-primary"
              /* Das Ergebnis am Fokus - siehe ReadPanel. */
              aria-label={`${loesungsSatz} Nochmal`}
              onClick={() => onDone(false)}
            >
              Nochmal
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Ein Level durchspielen
// ---------------------------------------------------------------------------
type TaskMeta = {
  ms: number;
  cells: number;
  pasted: boolean;
  blurred: boolean;
  spokenMs?: number;
  typed?: string;
};

/** Ergebnis EINER Aufgabe, das der LevelRunner zum Speichern nach oben meldet. */
export interface TaskOutcome {
  correct: boolean;
  mastery: LevelMastery;
  stufe: SystemStufe;
  /** Hat genau diese Aufgabe das Level erstmals gemeistert? */
  masteredNow: boolean;
  /** Sterne fürs Level (nur bei masteredNow gesetzt). */
  stars: number;
}

export function LevelRunner({
  level,
  system,
  direction,
  initialMastery,
  initialStufe,
  initialBestStars = 0,
  address = "sie",
  grossschreibzeichen = true,
  onResult,
  onNext,
  nextTitle,
  onProgress,
  onTask,
  onAnnounce,
  showRound = false,
}: {
  level: Level;
  system: BrailleSystem;
  direction: "write" | "read";
  initialMastery: LevelMastery;
  initialStufe: SystemStufe;
  /** Gespeicherter Sterne-Bestwert des Levels - beim Wiederöffnen einer schon
   *  gemeisterten Etappe zeigt die Geschafft-Ansicht sonst 0 Sterne. */
  initialBestStars?: number;
  /** Anrede der Panel-Rahmentexte: „du" (Kinder-App Punktgenau) oder „sie"
   *  (LMS-Arbeitsheft-Embeds für Studierende). */
  address?: "du" | "sie";
  /**
   * Klassen-Einstellung „Großschreibzeichen" (nur Basis/Voll, Standard an) -
   * siehe `BrailleClassSettings.grossschreibzeichen` in `lib/braille/account.ts`.
   */
  grossschreibzeichen?: boolean;
  onResult: (r: TaskOutcome) => void;
  onNext: (() => void) | null;
  /** Titel des nächsten Levels/der nächsten Etappe - wird bei Meisterung mit
   *  angesagt, damit die Freischaltung auch HÖRBAR ist (nicht nur als Toast). */
  nextTitle?: string;
  onProgress: (r: RingInfo) => void;
  onTask?: (e: TrainerTaskEvent) => void;
  onAnnounce?: AnnounceCallback;
  /**
   * Zeigt die Runden-Striche im Aufgaben-Kasten (Alt+Z) - Standard AUS.
   *
   * ★ Warum ein Schalter und nicht immer an: Derselbe `LevelRunner` läuft
   * auch in der eingebetteten Einzelübung `BrailleExercise`
   * (Lektions-Baustein, mehrere können gleichzeitig auf einer Seite stehen).
   * Dort gab es die Runden-Striche noch nie (nur den Ring oben) - ein
   * globaler Schalter in `useBraillePlay` hätte mehrere gleichzeitige Übungen
   * durcheinandergebracht, jede mit ihrer eigenen Runde. Nur Punktgenau
   * selbst setzt diesen Schalter.
   */
  showRound?: boolean;
}) {
  const eightDot = system === "computer";
  // Kurzschrift-Lektionen (kurz-kfa01..kfa48): Soll-Lösung kommt aus liblouis de-g2
  // (async), nicht aus der Eigenbau-Engine. Lesen UND Schreiben: im Lese-Modus
  // zeigt das ReadPanel die de-g2-Anzeige (via solveKurzTarget) und prüft den
  // getippten Klartext gegen den prompt - keine Rückübersetzung nötig.
  const isKurz = level.id.startsWith("kurz-");
  // UEB-Lektionen (ueb-l04..ueb-l22): gleiches Muster wie Kurzschrift, nur mit
  // der englischen Kontraktions-Tabelle (en-ueb-g2). Wort-/Satz-Übungen, kein
  // eigener Text-Modus - deshalb nur hier in LevelRunner verdrahtet. Die
  // Legende-/Einheiten-Schlüssel sind bereits die lösbare FORM (key===form, z. B.
  // „but", „ch", „tion") - solveUeb liefert direkt die korrekte Zelle, ohne
  // Sonderfall für alphabetische Wortkürzungen.
  const isUeb = level.id.startsWith("ueb-");
  const dir: "write" | "read" = direction;

  // Lazy: liblouis-WASM erst beim Betreten einer Kurzschrift-/UEB-Welt laden -
  // und seit 20.09.2026 nur noch, wenn dieses Level etwas enthält, das NICHT
  // schon vorgerechnet ist (generated/kurz-cells.generated.json). Für die
  // Lektionen des Lehrgangs bleibt das Nachlade-Paket damit ungeladen: 408 KB,
  // die kein Kind mehr herunterlädt, und eine Fehlerquelle weniger.
  // Schlägt das Vorladen fehl, greift trotzdem noch der eigentliche
  // `solve`-Aufruf je Aufgabe unten - schlägt AUCH der fehl, zeigt das Panel
  // die „Übersetzung fehlt"-Meldung (kein stiller Rückfall mehr, 20.09.2026).
  const brauchtWorker =
    (isKurz && !alleVorgerechnet(level.items, "de-g2")) ||
    (isUeb && !alleVorgerechnet(level.items, "en-ueb-g2"));
  useEffect(() => {
    if (brauchtWorker) void ensureLouLoaded().catch(() => { /* siehe solve-Aufruf im Panel */ });
  }, [brauchtWorker]);

  // de-g2-Soll-Löser (Text → Braille-Zellen). Stabil je Level (useCallback).
  const solveKurzTarget = useCallback(
    async (p: string): Promise<Cell[] | null> => {
      try {
        return unicodeToCells(await toBraille(p, "de-g2"));
      } catch {
        return null; // löst im Panel die „Übersetzung fehlt"-Meldung aus, kein Rückfall
      }
    },
    [],
  );

  // en-ueb-g2-Soll-Löser, analog solveKurzTarget. solveUeb() liefert bereits
  // null statt zu werfen - das Panel zeigt dann die „Übersetzung fehlt"-
  // Meldung, kein Rückfall auf die Eigenbau-Engine mehr.
  const solveUebTarget = useCallback(
    async (p: string): Promise<Cell[] | null> => {
      const brl = await solveUeb(p);
      return brl == null ? null : unicodeToCells(brl);
    },
    [],
  );

  const reportTask = (correct: boolean, meta: TaskMeta) =>
    onTask?.({ level: level.id, system, direction: dir, correct, ...meta });

  const paused = useBraillePlay((s) => s.paused);
  const repeatNonce = useBraillePlay((s) => s.repeatNonce);
  const focusKeysNonce = useBraillePlay((s) => s.focusKeysNonce);
  const onAnnounceRef = useRef(onAnnounce);
  onAnnounceRef.current = onAnnounce;

  // Aufgaben-Vorrat: Zahlen/Rechnen frisch erzeugen, sonst der Wortschatz des
  // Levels - beides wird adaptiv GEWICHTET bedient (schwache Aufgaben öfter).
  const pool = useMemo(
    () =>
      level.kind === "numbers" || level.kind === "math"
        ? buildLevelDeck(level)
        : level.items,
    [level],
  );

  // Lern-Gedächtnis + Anforderungsstufe leben während der Sitzung lokal in Refs
  // (damit schnelle Folgeeingaben nicht auf veralteten Stand zugreifen) und
  // werden nach jeder Aufgabe nach oben in den Spielstand persistiert.
  const masteryRef = useRef<LevelMastery>(initialMastery);
  const stufeRef = useRef<SystemStufe>(initialStufe);
  const [stufeNum, setStufeNum] = useState(initialStufe.stufe);
  // Schon beim Betreten gemeistert → direkt die Geschafft-Ansicht (mit
  // gespeicherten Sternen), statt die Etappe wie neu zu behandeln. everMastered
  // stellt sicher, dass masteredNow (+30 XP, Jingle, Toast) je Etappe nur EINMAL
  // gemeldet wird - vorher gab jedes Wieder-Betreten bzw. jede Aufgabe nach
  // „Weiter üben" erneut den Meister-Bonus, und die Geschafft-Ansicht kam nach
  // jeder einzelnen Aufgabe zurück (XP-Farm-Befund 2026-07-09).
  const [mastered, setMastered] = useState(() => isLevelMastered(initialMastery));
  const everMasteredRef = useRef(isLevelMastered(initialMastery));
  const [lastStars, setLastStars] = useState(0);
  const [round, setRound] = useState(0); // erzwingt Remount des Eingabe-Panels

  const pickFor = (m: LevelMastery, s: SystemStufe, avoid?: string) =>
    pickWeighted(pool, m, { shortBias: stufeConfig(s.stufe).shortBias, avoid });

  const [prompt, setPrompt] = useState<string>(() =>
    pickFor(initialMastery, initialStufe),
  );

  const nextLevelRef = useRef<HTMLButtonElement>(null);
  const weiterRef = useRef<HTMLButtonElement>(null);

  // Nach Meisterung den Fokus auf „Weiter" legen, damit Enter sofort weitermacht.
  // Nur wenn niemand gerade die Kopfzeile bedient (mayStealFocus): beim Mount
  // einer BEREITS gemeisterten Etappe darf der Etappen-/Bereichswechsel den
  // Fokus nicht aus dem Pulldown reißen; bei echter Meisterung ist das alte
  // Panel weg, der Fokus liegt auf body → Übernahme erlaubt.
  useEffect(() => {
    if (mastered && mayStealFocus())
      (nextLevelRef.current ?? weiterRef.current)?.focus({ preventScroll: true });
  }, [mastered]);

  // Runden-Info (Striche + Alt+Z) - EINMAL berechnet für zwei Ziele: der Ring
  // im Kopf bekommt sie unverändert über `onProgress`; das Eingabe-Panel
  // bekommt SIE SELBST als Prop (`showRound`), seit die Striche in den
  // Aufgaben-Kasten gewandert sind (unten rechts) statt in der Kopf-Karte zu
  // stehen. Ein Prop bis zum Panel ist der kürzeste Weg zum fertigen Wert -
  // der globale Play-Store (`useBraillePlay`) wäre hier falsch (siehe die
  // Begründung an `showRound` oben): EIN Speicher für die ganze Seite passt
  // nicht zu mehreren gleichzeitig eingebetteten Übungen mit je eigener Runde.
  /**
   * ★ Die Suchaufgabe zum aktuellen Zeichen. Nur für Level, die `suche` setzen;
   * sonst bleibt sie `null` und der Aufgabenlauf ist unverändert.
   *
   * Die Auswahl (der Ablenker-Vorrat) sind ALLE Zeichen dieses Levels - also
   * genau das, was das Kind an dieser Stelle schon kennt.
   *
   * ★★★ DIE AUFGABE MUSS STEHEN BLEIBEN, SOLANGE DAS KIND AN IHR ARBEITET.
   * Erster Entwurf (23.09., im Browser gefunden, nicht im Test): Die Abhängig-
   * keiten enthielten `level.items` und `stufeNum`. `level.items` ist bei jedem
   * Rendern ein NEUES Feld - `etappeToLevel` baut das Level frisch -, also
   * wurde bei jedem Rendern eine neue Reihe gewürfelt. Das Kind liest eine
   * Reihe, tippt die Stelle, und geprüft wird gegen eine andere. Der Schlüssel
   * des Bedienfeldes (`such-${prompt}-${round}`) bleibt dabei gleich, das Feld
   * behält also die getippte Zahl - die Aufgabe wechselt lautlos darunter.
   * ⇒ Abhängig ist jetzt der INHALT (`itemsKey`), nicht die Identität, und die
   * Stufe wird über eine Ref gelesen: Sie ändert sich nach jeder Antwort, darf
   * aber die laufende Aufgabe nicht neu würfeln.
   */
  const itemsKey = level.items.join("\u0001");
  const stufeRefFuerSuche = useRef(stufeNum);
  stufeRefFuerSuche.current = stufeNum;
  const suchaufgabe = useMemo(() => {
    if (!level.suche) return null;
    const auswahl = level.items
      .filter((x) => x.trim().length > 0)
      .map((print) => ({ print, cells: textToCellsMathe(print, { system, grossschreibzeichen }) }));
    const ziel = auswahl.find((e) => e.print === prompt) ?? auswahl[0];
    if (!ziel || auswahl.length < 2) return null;
    const s = stufeRefFuerSuche.current;
    const stufe: 1 | 2 | 3 = s >= 5 ? 3 : s >= 3 ? 2 : 1;
    try {
      return baueSuchaufgabe({ auswahl, ziel, art: level.suche, stufe, laenge: 6 + stufe * 2 });
    } catch {
      // Zu wenig Ablenker (etwa ein Level mit einem einzigen Zeichen) - dann
      // lieber die gewohnte Lese-Aufgabe als ein kaputter Bildschirm.
      return null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level.suche, itemsKey, prompt, round, system, grossschreibzeichen]);

  const roundAttempts = masteryRef.current.window.length;
  const roundDone = Math.min(roundAttempts, MASTERY_MIN_ATTEMPTS);
  const roundLeft = Math.max(0, MASTERY_MIN_ATTEMPTS - roundAttempts);
  const roundInfo: RoundInfo = {
    done: roundDone,
    total: MASTERY_MIN_ATTEMPTS,
    mastered,
    approx: true,
    label: pg(
      mastered
        ? "Runde geschafft — die Etappe sitzt."
        : `Runde: ${roundDone} von mindestens ${MASTERY_MIN_ATTEMPTS} Aufgaben geschafft` +
            (roundLeft > 0 ? `, noch mindestens ${roundLeft}.` : ", gleich sitzt die Etappe."),
      (t) => t.trainer.runde(mastered, roundDone, MASTERY_MIN_ATTEMPTS, roundLeft),
    ),
  };

  // Anforderungsstufe + Mastery-Fortschritt nach oben an den Ring im Kopf melden.
  const onProgressRef = useRef(onProgress);
  onProgressRef.current = onProgress;
  useEffect(() => {
    const p = mastered ? 1 : masteryProgress(masteryRef.current);
    onProgressRef.current({
      number: stufeNum,
      value: p,
      caption: pg("Stufe", (t) => t.leiste.stufe),
      // Kurz halten (Braillezeile!) - die volle Erklärung steht in der Hilfe.
      ariaLabel: pg(
        `Stufe ${stufeNum} von ${STUFE_MAX} — passt sich deiner Sicherheit an. Etappe zu ${Math.round(
          p * 100,
        )} Prozent gemeistert.`,
        (t) => t.trainer.stufeAria(stufeNum, STUFE_MAX, Math.round(p * 100)),
      ),
      round: roundInfo,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- roundInfo wird
    // aus denselben Werten (stufeNum/round/mastered) neu berechnet, die schon
    // in den Deps stehen; sie extra aufzunehmen würde nur denselben Effekt
    // ein zweites Mal auslösen.
  }, [stufeNum, round, mastered]);

  // Inhaltssprache: UEB-Aufgabenwörter sind Englisch → richtige Stimme +
  // lang-Attribut der Live-Region (sonst nuschelt die deutsche Synthese).
  const taskLang = isUeb ? ("en" as const) : undefined;

  // E1 - neue Aufgabe ansagen (beim Mount + bei jedem Aufgabenwechsel).
  // Lesen: nur Live-Region (voice steckt im Payload auf false) - die
  // Sprech-Sequenz „Anweisung + Zellen" übernimmt das ReadPanel selbst.
  useEffect(() => {
    if (!mastered) onAnnounceRef.current?.(announceTask(prompt, dir, taskLang));
  }, [prompt, round]); // eslint-disable-line react-hooks/exhaustive-deps

  // E7 - Level gemeistert (inkl. hörbarer Freischaltung des nächsten Levels).
  // Nur auf der ECHTEN Flanke ungemeistert→gemeistert: beim bloßen Wieder-
  // Betreten einer gemeisterten Etappe (mastered startet true) wäre Jingle +
  // „Geschafft!"-Ansage falsch.
  const prevMasteredRef = useRef(mastered);
  useEffect(() => {
    const was = prevMasteredRef.current;
    prevMasteredRef.current = mastered;
    if (mastered && !was) {
      onAnnounceRef.current?.(
        announceLevelDone(lastStars, undefined, onNext ? nextTitle : undefined),
      );
      playLevelJingle();
    }
  }, [mastered]); // eslint-disable-line react-hooks/exhaustive-deps

  // E10 - Pause an/aus
  const prevPausedRef = useRef(false);
  useEffect(() => {
    if (paused === prevPausedRef.current) return;
    prevPausedRef.current = paused;
    if (paused) {
      onAnnounceRef.current?.(announcePaused());
    } else {
      // Wiedereinstieg: aktuelle Aufgabe neu ansagen
      onAnnounceRef.current?.(announceTask(prompt, dir, taskLang));
    }
  }, [paused]); // eslint-disable-line react-hooks/exhaustive-deps

  // E11 - Alt+W: aktuelle Aufgabe wiederholen. Auf der Geschafft-Ansicht gibt
  // es keine „aktuelle Aufgabe" mehr - dort das Ergebnis wiederholen statt
  // der veralteten letzten Aufgabe.
  const prevRepeatRef = useRef(0);
  useEffect(() => {
    if (repeatNonce === 0 || repeatNonce === prevRepeatRef.current) return;
    prevRepeatRef.current = repeatNonce;
    if (mastered) {
      onAnnounceRef.current?.(
        announceLevelDone(lastStars || initialBestStars, undefined, onNext ? nextTitle : undefined),
      );
      return;
    }
    onAnnounceRef.current?.(announceTask(prompt, dir, taskLang));
  }, [repeatNonce]); // eslint-disable-line react-hooks/exhaustive-deps

  // E12 - Alt+M: Fokus zu „Meine Tasten" springen (neue Zeichen/Kürzungen
  // dieser Etappe). Ohne Legende (Wiederholungs-/Misch-Etappe) oder solange
  // die Geschafft-Ansicht steht ist der Ref leer → dann nur ansagen statt
  // stumm zu bleiben.
  const legendListRef = useRef<HTMLUListElement>(null);
  const legendDetailsRef = useRef<HTMLDetailsElement>(null);
  const prevFocusKeysRef = useRef(0);
  useEffect(() => {
    if (focusKeysNonce === 0 || focusKeysNonce === prevFocusKeysRef.current) return;
    prevFocusKeysRef.current = focusKeysNonce;
    if (legendListRef.current) {
      // Zugeklappter Kasten: erst öffnen, sonst ist focus() ein stummer No-op.
      if (legendDetailsRef.current && !legendDetailsRef.current.open) {
        legendDetailsRef.current.open = true;
      }
      legendListRef.current.focus();
      legendListRef.current.scrollIntoView({ block: "center" });
      // Fürs Self-Voicing (ohne Screenreader wäre der Sprung sonst stumm):
      // kurz sagen, was hier steht.
      if (level.legend) speakUi(pg(`Meine Tasten: ${level.legend}`, (t) => `${t.trainer.meineTastenKurz} ${level.legend}`));
    } else {
      onAnnounceRef.current?.(announceNoNewChars());
    }
  }, [focusKeysNonce]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sterne fürs Level aus der Treffsicherheit im Schluss-Fenster (Tempo zählt nie).
  const starsFromMastery = (m: LevelMastery): number => {
    const w = m.window;
    if (!w.length) return 1;
    const acc = w.filter((a) => a.correct).length / w.length;
    return acc >= 0.97 ? 3 : acc >= 0.92 ? 2 : 1;
  };

  const handleDone = (wasCorrect: boolean) => {
    const m1 = recordAttempt(masteryRef.current, prompt, wasCorrect);
    const s1 = recordStufe(stufeRef.current, wasCorrect);
    masteryRef.current = m1;
    stufeRef.current = s1;
    setStufeNum(s1.stufe);

    // masteredNow höchstens EINMAL je Etappe (everMastered): Nach „Weiter üben"
    // bzw. beim Wieder-Betreten bleibt das Mastery-Fenster gemeistert - ohne
    // die Sperre käme nach jeder einzelnen Aufgabe erneut der Geschafft-Screen
    // samt +30-XP-Bonus (XP-Farm-Befund 2026-07-09).
    const masteredNow = !everMasteredRef.current && isLevelMastered(m1);
    const stars = masteredNow ? starsFromMastery(m1) : 0;
    onResult({ correct: wasCorrect, mastery: m1, stufe: s1, masteredNow, stars });

    if (masteredNow) {
      everMasteredRef.current = true;
      setLastStars(stars);
      setMastered(true);
      return;
    }
    // Bei richtig die nächste (andere) Aufgabe ziehen; bei falsch dieselbe sofort
    // noch einmal - sofortige Korrektur, und die Gewichtung bringt schwache
    // Aufgaben ohnehin bald wieder. Beide Versuche zählen ehrlich ins Fenster.
    if (wasCorrect) setPrompt(pickFor(m1, s1, prompt));
    setRound((r) => r + 1);
  };

  // ---- Level gemeistert („weiter, wenn es sitzt") ----
  if (mastered) {
    // Beim Wieder-Betreten einer gemeisterten Etappe ist lastStars 0 - dann
    // zählt der gespeicherte Bestwert (sonst stünde hier „0 von 3 Sternen",
    // vgl. Klangpunkte-Befund F1).
    const shownStars = lastStars || initialBestStars;
    return (
      <div className="card space-y-4 p-6 text-center">
        <p className="m-0 text-5xl" aria-hidden="true">
          🎉
        </p>
        <h3 className="m-0 text-xl font-semibold text-ink">{pg("Geschafft - das sitzt!", (t) => t.trainer.geschafft)}</h3>
        {/* aria-label auf <p> wird im Browse-Modus oft ignoriert — die rohen
            ★-Zeichen kämen auf die Braillezeile. Sichtbares verstecken,
            Klartext als sr-only-Text (liest sich als EINE Zeile). */}
        {shownStars > 0 && (
          <p className="m-0 text-3xl">
            <span aria-hidden="true">
              <span className="text-warning">{"★".repeat(shownStars)}</span>
              <span className="text-ink-muted">{"☆".repeat(Math.max(0, 3 - shownStars))}</span>
            </span>
            <span className="sr-only">{pg(`${shownStars} von 3 Sternen`, (t) => t.trainer.sterne(shownStars))}</span>
          </p>
        )}
        <p className="m-0 text-ink-soft">
          {pgTexte() ? (
            <>
              {pgTexte()!.trainer.zuverlaessig(level.title)}{" "}
              {onNext ? pgTexte()!.trainer.naechsteFrei : pgTexte()!.trainer.weiterUeben}
            </>
          ) : (
            <>
              {level.title}: zuverlässig erkannt.{" "}
              {onNext ? "Das nächste Level ist jetzt frei." : "Du kannst weiter üben."}
            </>
          )}
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <button
            ref={weiterRef}
            type="button"
            className="btn-secondary"
            // ★ Das Ergebnis am FOKUS (29.09.2026): Der Fokus springt auf
            // „Nächstes Level" - oder, wenn es keins gibt, hierher. Die
            // Überschrift darüber liest nur, wer zurückblättert.
            aria-label={onNext ? undefined : pg("Geschafft, das sitzt. Weiter üben", (t) => t.trainer.geschafftAria1)}
            onClick={() => {
              setMastered(false);
              setPrompt(pickFor(masteryRef.current, stufeRef.current, prompt));
              setRound((r) => r + 1);
            }}
          >
            {pg("Weiter üben", (t) => t.trainer.weiterUebenKnopf)}
          </button>
          {onNext && (
            <button
              ref={nextLevelRef}
              type="button"
              className="btn-primary"
              aria-label={pg("Geschafft, das sitzt. Nächstes Level", (t) => t.trainer.geschafftAria2)}
              onClick={onNext}
            >
              {pg("Nächstes Level →", (t) => t.trainer.naechstesLevel)}
            </button>
          )}
        </div>
      </div>
    );
  }

  // ---- Spielen ----
  // Die „Neue Zeichen"-Box zeigt sich, sobald das LEVEL neue Zeichen einführt
  // (level.legend nicht leer) - unabhängig von der Anforderungsstufe. Die Stufe
  // ist system-weit und wächst mit der Übung, sie sagt aber nichts darüber aus,
  // ob DIESES Level hier neue Zeichen einführt; sie an die Stufe zu koppeln
  // hätte neue Buchstaben in späteren Etappen versteckt, sobald man in
  // FRÜHEREN Etappen schon geübt war (Johannes-Feedback 2026-07-01).
  return (
    <div className="space-y-4">
      {level.legend && (
        <details
          ref={legendDetailsRef}
          className="blatt-karte rounded-xl border border-accent/30 bg-accent-soft p-3"
          open
        >
          {/* Eingeklappt zeigt die Zusammenfassung die Kürzungen/Zeichen als
              Text; ausgeklappt kommen die echten Braillezeichen dazu. */}
          <summary className="cursor-pointer text-sm font-semibold text-ink">
            {isKurz || isUeb ? "Diese Kürzungen üben wir hier" : pg("Neue Zeichen in diesem Level", (t) => t.trainer.neueZeichen)}{pg(":", (t) => t.trainer.doppelpunkt)}{" "}
            <span className="font-normal text-ink-soft">{level.legend}</span>
          </summary>
          <p className="mb-3 mt-2 text-sm text-ink-soft">{level.intro}</p>
          {isKurz ? (
            <KurzLegend
              units={level.legend.split(/\s*·\s*/).filter(Boolean)}
              eightDot={eightDot}
              // Zeichen der Kürzung aus der Regel - allein übersetzt gäbe
              // liblouis bei Lautgruppen Vollschrift („ll" ⠇⠇ statt ⠟).
              solve={(u) => {
                const z = kuerzungsZeichen(u);
                return z ? Promise.resolve(z) : toBraille(u, "de-g2").catch(() => null);
              }}
              listRef={legendListRef}
            />
          ) : isUeb ? (
            <KurzLegend
              units={level.legend.split(/\s*·\s*/).filter(Boolean)}
              eightDot={eightDot}
              // Gruppenkürzungen (ch, tion …) greifen nur im Wort - isoliert gäbe
              // solveUeb die Buchstaben. Vorab-Zelle aus UEB_CELLS nehmen; nur
              // Brücken-Zeichen (A, 1, …) fallen auf solveUeb zurück.
              solve={(u) => {
                const pre = UEB_CELLS[u.toLowerCase()];
                return pre ? Promise.resolve(pre) : solveUeb(u);
              }}
              listRef={legendListRef}
            />
          ) : (
            <Legend
              chars={level.legend}
              zeichen={level.zeichen}
              system={system}
              eightDot={eightDot}
              listRef={legendListRef}
              grossschreibzeichen={grossschreibzeichen}
            />
          )}
        </details>
      )}

      {/* ★ KEIN umschliessender `.card` mehr hier (Charge 20.09.2026 Abend):
          WritePanel/ReadPanel bringen seit dem Umbau „Ein Kasten" ihren
          eigenen Rahmen mit (Vorbild `TypingSession`, die genauso ohne
          Karten-Wrapper aufgerufen wird) - ein zweiter Rahmen darum hätte
          zwei ineinandergeschachtelte Kästen ergeben. */}
      {level.suche && suchaufgabe && dir === "read" ? (
        /* ★ SUCHAUFGABE statt Lese-Aufgabe. Sie bleibt in der Lese-Richtung -
           das Kind liest ja, es beantwortet nur eine andere Frage. Die Reihe
           wird aus den Zeichen gebaut, die dieses Level übt; die Stufe steuert,
           wie nah die Ablenker am Ziel liegen (Punktabstand). */
        <SuchPanel
          key={`such-${prompt}-${round}`}
          aufgabe={suchaufgabe!}
          eightDot={eightDot}
          address={address}
          round={showRound ? roundInfo : undefined}
          onDone={handleDone}
          onTask={reportTask}
          onAnnounce={onAnnounce}
        />
      ) : dir === "write" ? (
        <WritePanel
          key={`${prompt}-${round}`}
          prompt={prompt}
          system={system}
          eightDot={eightDot}
          solve={isKurz ? solveKurzTarget : isUeb ? solveUebTarget : undefined}
          address={address}
          grossschreibzeichen={grossschreibzeichen}
          // Name der Übersetzung für die Fehlschlag-Meldung - siehe isKurz/isUeb oben.
          uebersetzungLabel={isUeb ? "UEB (Englisch)" : "Kurzschrift"}
          round={showRound ? roundInfo : undefined}
          onDone={handleDone}
          onTask={reportTask}
          onAnnounce={onAnnounce}
        />
      ) : (
        <ReadPanel
          key={`${prompt}-${round}`}
          prompt={prompt}
          system={system}
          eightDot={eightDot}
          solve={isKurz ? solveKurzTarget : isUeb ? solveUebTarget : undefined}
          lang={taskLang}
          address={address}
          grossschreibzeichen={grossschreibzeichen}
          uebersetzungLabel={isUeb ? "UEB (Englisch)" : "Kurzschrift"}
          round={showRound ? roundInfo : undefined}
          onDone={handleDone}
          onTask={reportTask}
          onAnnounce={onAnnounce}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Texte: ganzen Fließtext am Stück schreiben (Wort-Zähler, Timer, Fehlerbilanz)
// ---------------------------------------------------------------------------
function fmtTime(ms: number): string {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ★ exportiert (nur für Tests, siehe tests/braille-vorlesezeit-textlevel.test.tsx)
// - genau wie WritePanel/ReadPanel bereits exportiert sind, war TextPanel
// bisher von aussen gar nicht direkt renderbar.
export function TextPanel({
  text,
  system,
  eightDot,
  solve,
  address = "sie",
  grossschreibzeichen = true,
  onRepeat,
  onNext,
  onTask,
  onComplete,
  onAnnounce,
  round,
}: {
  text: string;
  system: BrailleSystem;
  eightDot: boolean;
  /** Anrede der Rahmentexte: „du" (Punktgenau/Kinder) oder „sie" (LMS-Embeds). */
  address?: "du" | "sie";
  /** Optionaler async de-g2-Löser (Kurzschrift) - liefert die SOLL-Zellen des
   *  ganzen Textes (gekürzt). Ohne solve: synchrone Eigenbau-Engine. Nur für
   *  Kurzschrift gesetzt - dort gibt es die Einstellung „Großschreibzeichen" nicht.
   *  Liefert `solve` `null` oder wirft es → KEIN Rückfall auf `textToCells`
   *  mehr (Befund 20.09.2026, siehe `useAsyncBrailleTarget`). */
  solve?: (prompt: string) => Promise<Cell[] | null>;
  /** Klassen-Einstellung „Großschreibzeichen" (Basis/Voll) - Standard an. */
  grossschreibzeichen?: boolean;
  onRepeat: () => void;
  onNext: (() => void) | null;
  onTask?: (correct: boolean, meta: TaskMeta) => void;
  /** Text vollständig geschrieben - die Etappe zählt damit als gemacht
   *  (Freischaltung der nächsten; Text-Etappen haben kein Mastery-Fenster). */
  onComplete?: () => void;
  onAnnounce?: AnnounceCallback;
  /** Runden-Anzeige (Striche, Alt+Z) - siehe `WritePanel`. Ohne Wert wird
   *  nichts gezeichnet. */
  round?: RoundInfo;
}) {
  const [retryNonce, setRetryNonce] = useState(0);
  const { target, loading, failed } = useAsyncBrailleTarget(
    solve,
    text,
    system,
    grossschreibzeichen,
    retryNonce,
  );
  const words = useMemo(() => text.trim().split(/\s+/).filter(Boolean), [text]);
  const [entered, setEntered] = useState<Cell[]>([]);
  const [mistakes, setMistakes] = useState(0); // jeder Fehler zählt, auch korrigierte
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const areaRef = useRef<HTMLTextAreaElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const repeatRef = useRef<HTMLButtonElement>(null);
  const startRef = useRef<number | null>(null); // erst bei der ersten Eingabe gesetzt
  // ★ Faire Zeitverrechnung (22.09.2026, siehe WritePanel/ReadPanel und
  // lib/braille/lesezeit.ts): anders als dort startet die Uhr hier NICHT beim
  // Mount, sondern erst bei der ersten Eingabe (`begin()`) - die Vorlesezeit
  // VOR dem ersten Tastendruck zaehlt hier also ohnehin schon nicht mit. Die
  // Basis fuer `spokenAtStartRef` muss darum GENAU dort gesetzt werden, wo
  // `startRef` gesetzt wird (in `begin()`), sonst waeren die beiden Fenster
  // verschieden lang und `typingGapMs` zoege zu viel ab.
  const spokenAtStartRef = useRef(0);
  const lenRef = useRef(0); // synchrone Zahl gesetzter Zellen (für die Fehlerprüfung)
  const onTaskRef = useRef(onTask);
  onTaskRef.current = onTask;

  const isComplete = entered.length >= target.length;

  const paused = useBraillePlay((s) => s.paused);
  const repeatNonce = useBraillePlay((s) => s.repeatNonce);
  const focusInputNonce = useBraillePlay((s) => s.focusInputNonce);
  const helpId = useId();

  // Größe (Alt + / −) - der ganze Text ist dichter gesetzt als ein Einzelwort:
  // Zellen 28 statt 40, Vorlage 1,125 rem (die bisherige Klasse `text-lg`)
  // statt 2,4. Der Faktor ist derselbe.
  const { cellSize, promptStyle } = useUebungsGroesse(28, 1.125);

  useEffect(() => {
    if (mayStealFocus()) areaRef.current?.focus({ preventScroll: true });
  }, []);

  // Alt+W / Alt+E / Pause-Ende - Fokus zurück ins Schreibfeld.
  useEffect(() => {
    if (repeatNonce > 0 && !done) areaRef.current?.focus({ preventScroll: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repeatNonce]);
  useEffect(() => {
    if (focusInputNonce > 0 && !done) areaRef.current?.focus({ preventScroll: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusInputNonce]);
  // „Noch einmal versuchen" (siehe UebersetzungFehlt-Banner unten) - gleiches
  // Muster wie Alt+E: der Knopf hat sein eigenes Fokus-Ziel, die Eingabezeile.
  useEffect(() => {
    if (retryNonce > 0) areaRef.current?.focus({ preventScroll: true });
  }, [retryNonce]);
  const wasPausedRef = useRef(paused);
  useEffect(() => {
    const was = wasPausedRef.current;
    wasPausedRef.current = paused;
    if (was && !paused && !done) areaRef.current?.focus({ preventScroll: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused]);

  // Timer läuft erst ab der ersten Eingabe (und bis der Text fertig ist).
  useEffect(() => {
    if (!started || done) return;
    const t = setInterval(() => {
      if (startRef.current !== null) setElapsed(Date.now() - startRef.current);
    }, 250);
    return () => clearInterval(t);
  }, [started, done]);

  // Nach Abschluss den Fokus auf „Nächster Text", damit Enter weiterführt -
  // beim letzten Text der Etappe gibt es ihn nicht, dann „Gleichen Text
  // nochmal" (29.09.2026: vorher blieb der Fokus im Schreibfeld stehen, und
  // das Ergebnis stand nur in der Statusfläche).
  useEffect(() => {
    if (done) (nextRef.current ?? repeatRef.current)?.focus({ preventScroll: true });
  }, [done]);
  /** ★ Das Ergebnis am FOKUS: vorne im Namen des Knopfs, der den Fokus bekommt
   *  (siehe `ReadPanel`, „Nochmal"). Derselbe Wortlaut wie sichtbar. */
  const ergebnisSatz = pg(
    `Text geschafft. ${mistakes === 0 ? "Fehlerfrei" : `${mistakes} Fehler`}.`,
    (t) => t.trainer.textErgebnisSatz(mistakes),
  );

  const onAnnounceRef = useRef(onAnnounce);
  onAnnounceRef.current = onAnnounce;

  useLoadingAnnounce(loading, failed, uebersetzungFehltText(address, "Kurzschrift"), onAnnounceRef);

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Abschluss, sobald alle Zellen geschrieben sind
  useEffect(() => {
    if (done || target.length === 0 || entered.length < target.length) return;
    const ms = startRef.current !== null ? Date.now() - startRef.current : 0;
    setElapsed(ms);
    setDone(true);
    // Faire Zeitverrechnung (22.09.2026) - dieselbe Rechnung wie WritePanel/
    // ReadPanel: Vorlesezeit seit `begin()` raus, `spokenMs` ans Ereignis, die
    // GERECHNETE Lesezeit für den ganzen Text macht `uebezeitFuerEreignis`
    // (lib/braille/lesezeit.ts) daraus - nicht hier.
    const spokenInTask = spokenMs() - spokenAtStartRef.current;
    const fairMs = typingGapMs(ms, spokenInTask, isSpeaking());
    onTaskRef.current?.(mistakes === 0, {
      ms: fairMs,
      cells: target.length,
      pasted: false,
      blurred: false,
      spokenMs: spokenInTask > 0 ? spokenInTask : undefined,
    });
    onCompleteRef.current?.();
    // E8 - Text fertig ansagen
    onAnnounceRef.current?.(announceTextDone(mistakes));
  }, [entered, target, done, mistakes]); // eslint-disable-line react-hooks/exhaustive-deps

  // Startet Timer + Zähler bei der ersten Eingabe. `spokenAtStartRef` wird
  // GENAU hier mitgesetzt, nicht beim Mount - siehe Begründung an der
  // Deklaration von `spokenAtStartRef` oben.
  const begin = () => {
    if (startRef.current === null) {
      startRef.current = Date.now();
      spokenAtStartRef.current = spokenMs();
      setStarted(true);
    }
  };

  const chord = useBrailleChord({
    eightDot,
    nachlaufMs: CHORD_NACHLAUF_MS,
    fensterMs: CHORD_FENSTER_MS,
    enabled: !done && !isComplete && !loading && !failed && !paused,
    // Korrigieren erlaubt (⌫). Eine falsch gesetzte Zelle wird sofort rot,
    // zählt als Fehler (auch wenn danach korrigiert) und gibt einen kurzen Ton.
    onCommit: (c) => {
      const idx = lenRef.current;
      if (idx >= target.length) return;
      begin();
      if (c !== target[idx]) {
        setMistakes((m) => m + 1);
        playErrorSound();
        // Wie im Wort-Modus: die richtigen Punkte hörbar machen - sehende
        // Kinder sehen die rote Zelle, blinde hörten bisher nur den Ton.
        onAnnounceRef.current?.(
          announceWrong({
            direction: "write",
            prompt: text,
            typedCell: c,
            targetCell: target[idx],
            verbose: useVoice.getState().verbalizeErrors,
          }),
        );
      }
      lenRef.current = idx + 1;
      setEntered((e) => [...e, c]);
    },
    // Leertaste setzt das Wort-Leerzeichen - aber NUR wo auch eines hingehört,
    // damit ein doppeltes Leerzeichen nichts verschiebt.
    onSpace: () => {
      const idx = lenRef.current;
      if (idx >= target.length || target[idx] !== BLANK) return;
      begin();
      lenRef.current = idx + 1;
      setEntered((e) => [...e, BLANK]);
    },
    onBackspace: () => {
      if (lenRef.current === 0) return;
      lenRef.current -= 1;
      setEntered((e) => e.slice(0, -1));
    },
    onEnter: () => {},
  });

  // Umschalt gedrückt halten: Lösung der aktuellen Zelle zeigen + ansagen -
  // dasselbe Versprechen wie im Wort-Modus (Kürzel-Liste „⇧ Umschalt"); die
  // Text-Etappen konnten es bisher nicht (Befund 2026-07-09).
  const [hint, setHint] = useState(false);
  const hintTarget = !done && !isComplete ? target[entered.length] : undefined;
  const onAreaKeyDown = (e: ReactKeyboardEvent) => {
    if (e.key === "Shift") {
      setHint(true);
      if (!done && hintTarget !== undefined) {
        if (hintTarget === BLANK) {
          onAnnounceRef.current?.({
            channel: "status",
            text: pg("Aktuelle Stelle: Leertaste — die Lücke zwischen Wörtern.", (t) => t.trainer.aktuelleStelleLeer),
          });
        } else {
          onAnnounceRef.current?.(announceCellHint(hintTarget, keyLabelsForCell(hintTarget)));
        }
      }
    }
    chord.onKeyDown(e);
  };
  const onAreaKeyUp = (e: ReactKeyboardEvent) => {
    if (e.key === "Shift") setHint(false);
    chord.onKeyUp(e);
  };
  const onAreaBlur = () => {
    setHint(false);
    chord.onBlur();
  };

  // Aktuelles Wort = Anzahl der bereits gesetzten Wort-Lücken + 1.
  const wordPos = entered.filter((c) => c === BLANK).length;
  // Zeiger der Schreibzeile - siehe WritePanel.
  // Kurzschrift (`solve`): hinter dem Wort, das dran ist, je Zelle der
  // gekürzten Form ein Punkt 7 - geschriebene Zellen ersetzen ihn
  // (Johannes 07.10.2026, siehe `kurzschriftZeile`).
  const schreibzeile = useMemo(
    () =>
      solve
        ? kurzschriftZeile(text, target, entered)
        : {
            wert: text,
            zeiger: zeigerImText(text, target, entered.length, (w) =>
              textToCellsMathe(w, { system, grossschreibzeichen }),
            ),
          },
    [text, target, entered, solve, system, grossschreibzeichen],
  );
  const currentWord = Math.min(wordPos + 1, words.length);

  return (
    /* ★★★ Die Kennzeichen der gemeinsamen Bauart (§13): `data-aufgabe` an der
       Aufgabe, `data-angabe` an der Angabe, `data-feld` am Antwort-Element.
       Wer sie setzt, bekommt Lesestelle (§6.2) und Fokus-Wächter (§3) ohne
       eine weitere Zeile Code. */
    <div className="space-y-4" data-aufgabe={`text-schreiben-wort-${currentWord}`}>
      {/* ★★★ EIN KASTEN (Charge 20.09.2026 Abend) — siehe die ausführliche
          Begründung am `WritePanel`. TextPanel hatte ZWEI Karten UND einen
          Wort-/Timer-Streifen, keine echte Angabe-Karte mit `data-angabe`
          (anders als die drei übrigen Panels) - `data-angabe` wandert hier
          ganz neu an die naheliegendste Stelle: die Drucktext-Vorlage, denn
          SIE ist die Aufgabe, an der das Kind gerade schreibt. Der Wort-/
          Timer-Streifen wird die Kopfzeile des Kastens (wie der Finger-Hinweis
          in Tastenflow), die Vorlage + das Eingabefeld sind der Inhalt darunter. */}
      <div className="card rounded-2xl focus-within:ring-[4.5px] focus-within:ring-accent">
        {/* Wort-Zähler + Timer (Korrektur Johannes 20.09.2026 Abend: Kopfzeile
            statt unten rechts im Eingabebereich - wie bei WritePanel/
            ReadPanel, Vorbild `TypingSession.tsx`). `flex-wrap` - Begründung
            siehe WritePanel: bei 320 px reisst eine starre einzeilige
            Kopfzeile. */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline px-4 py-2">
          <span className="text-sm font-medium text-ink-soft">
            {pg(`Wort ${currentWord} von ${words.length}`, (t) => t.trainer.textWort(currentWord, words.length))}
          </span>
          <span className="shrink-0 text-sm tabular-nums text-ink-soft">
            <span aria-hidden="true">⏱ </span>
            {fmtTime(elapsed)}
          </span>
        </div>

        {/* Runden-Striche ÜBER dem Text, in voller Breite (Johannes
            22.09.2026: „bei texten sollen die striche rechts über, nicht
            neben den texten stehen") - vorher standen sie in derselben Zeile
            wie der Timer und nahmen dort schon bei 320 px Breite weg, die der
            Text braucht. Eigene Zeile, rechtsbündig (die Striche bleiben
            "rechts", nur jetzt darüber statt daneben). */}
        {round && (
          <div className="flex justify-end border-b border-hairline px-4 py-2">
            <RoundTicks round={round} zahlUnten />
          </div>
        )}

        {/* Drucktext-Vorlage, das aktuelle Wort hervorgehoben.
            ★ Wächst mit Alt + / − — bis 07.09.2026 stand sie fest auf `text-lg`. */}
        <div className="p-4 pb-0">
          <p
            className="m-0 rounded-xl bg-surface-sunken p-4 leading-relaxed"
            style={promptStyle}
            data-angabe
          >
            {words.map((w, i) => (
              <span
                key={i}
                className={
                  !done && i === wordPos
                    ? "rounded bg-accent-soft px-1 font-semibold text-ink"
                    : "text-ink-soft"
                }
              >
                {w}{" "}
              </span>
            ))}
          </p>
        </div>

        {failed && (
          <div className="mx-4 mt-3">
            <UebersetzungFehlt
              address={address}
              label="Kurzschrift"
              onRetry={() => setRetryNonce((n) => n + 1)}
            />
          </div>
        )}

        {paused && (
          <div
            role="status"
            className="mx-4 mt-3 rounded-xl border border-accent/40 bg-accent-soft p-3 text-center text-sm font-medium text-ink"
          >
            {pg("Pause - Alt+P zum Weitermachen", (t) => t.trainer.pause)}
          </div>
        )}

        {/* Braille-Eingabe (fortlaufend, Korrektur per ⌫) */}
        {/* Anleitung als Beschreibung, nicht als Name — hält die Braillezeile
            frei (siehe WritePanel). */}
        <p id={helpId} className="sr-only">
          {pgTexte() ? (
            pgTexte()!.trainer.textHilfe
          ) : (
            <>
              Punkt-Tasten gleichzeitig drücken und loslassen; an Wortgrenzen die
              Leertaste. Mit der Rücktaste lässt sich korrigieren — ein Fehler wird
              trotzdem gezählt.
            </>
          )}
        </p>
        <div
          data-schreibflaeche
          className="relative mt-3 border-t border-hairline px-3 py-4 outline-none"
        >
          {/* ★★★ Der ganze Text steht auf der Braillezeile, der Zeiger an der
              Stelle, die dran ist - siehe WritePanel und `Schreibzeile`. */}
          <Schreibzeile
            ref={areaRef}
            text={schreibzeile.wert}
            zeiger={schreibzeile.zeiger}
            tabIndex={done ? -1 : 0}
            label={pg("Text in Braille schreiben", (t) => t.trainer.textSchreiben)}
            feld="braillezellen"
            describedBy={helpId}
            onKeyDown={onAreaKeyDown}
            onKeyUp={onAreaKeyUp}
            onBlur={onAreaBlur}
          />
          <div className="flex flex-wrap items-end gap-1">
            {/* Geschriebene Zellen als HBS-Schriftzeichen statt gezeichnetem
                Punktraster (Johannes 22.09.2026, siehe `BrailleFontCell") -
                IMMER aria-hidden, die Auskunft für die Sprachausgabe steht
                in der sr-only-Liste gleich darunter (dieselbe Auskunft, die
                vorher an jeder einzelnen `BrailleCell` als aria-label hing). */}
            {entered.map((c, i) =>
              c === BLANK ? (
                // getipptes Wort-Leerzeichen → schmale Lücke statt leerem Kästchen
                <span key={i} className="w-4" aria-hidden="true" />
              ) : (
                <BrailleFontCell
                  key={i}
                  cell={c}
                  eightDot={eightDot}
                  size={cellSize}
                  state={c === target[i] ? "correct" : "wrong"}
                />
              ),
            )}
            {!done &&
              !isComplete &&
              (target[entered.length] === BLANK ? (
                // an einer Wortgrenze: „␣" zeigt, dass jetzt die Leertaste kommt
                <div
                  className="flex h-9 items-center rounded-md bg-accent-soft px-2 text-base text-ink-muted ring-1 ring-accent/50"
                  aria-label={pg("aktuelle Stelle: Leertaste drücken", (t) => t.trainer.aktuelleStelleAria)}
                >
                  ␣
                </div>
              ) : (
                <div className="rounded-md bg-accent-soft p-0.5 ring-1 ring-accent/50">
                  <BrailleCell
                    cell={dotsToCell(...chord.pendingDots)}
                    eightDot={eightDot}
                    size={cellSize}
                    state="pending"
                    label={pg("aktuelle Zelle", (t) => t.trainer.aktuelleZelle)}
                  />
                </div>
              ))}
            {loading ? (
              <span className="text-sm text-ink-muted">Übersetzung wird geladen …</span>
            ) : failed ? (
              <span className="text-sm text-ink-muted">Keine Aufgabe — siehe Meldung oben.</span>
            ) : (
              entered.length === 0 &&
              chord.pendingDots.length === 0 && (
                <span className="text-sm text-ink-muted">
                  {pg("Hier tippen … Punkt-Tasten gleichzeitig drücken, dann loslassen.", (t) => t.trainer.hierTippen)}
                </span>
              )
            )}
          </div>
          {/* Navigierbare Punkte-Liste für SR - dieselbe Auskunft, die vorher
              an jeder sichtbaren `BrailleCell` als aria-label hing (siehe
              TextReadPanel, gleiches Muster). Leerzellen (Wortgrenzen) werden
              ausgelassen, wie schon vorher: sie waren nie ein eigener
              role="img"-Eintrag, sondern eine reine aria-hidden-Lücke. */}
          <ol role="list" aria-label={pg("Geschriebene Zellen, Zelle für Zelle", (t) => t.trainer.geschriebeneZellen)} className="sr-only">
            {entered.filter((c) => c !== BLANK).map((c, i) => (
              <li key={i}>{dotsLabel(c)}</li>
            ))}
          </ol>
        </div>
      </div>

      <KeyLegend eightDot={eightDot} />

      {/* Hilfe: „Umschalt" gedrückt halten zeigt die Tasten der aktuellen Zelle
          (wie im Wort-Modus — gleiche Zusage in der Kürzel-Liste). */}
      {!done && hint && hintTarget !== undefined && (
        <div
          role="status"
          className="rounded-xl border border-accent/40 bg-accent-soft p-3 text-center text-sm text-ink"
        >
          {pgTexte() ? (
            <span className="font-semibold">{pgTexte()!.trainer.aktuelleZelleKopf(entered.length + 1, target.length)}</span>
          ) : (
            <>
              <span className="font-semibold">Aktuelle Zelle</span> (
              {entered.length + 1} von {target.length}):
            </>
          )}{" "}
          {hintTarget === BLANK ? (
            <>
              <kbd>{pg("Leertaste", (t) => t.trainer.leertaste)}</kbd> {pg("(Lücke)", (t) => t.trainer.lueckeKlammer)}
            </>
          ) : (
            <>
              {cellDots(hintTarget).map((d, k) => (
                <span key={d}>
                  {k > 0 ? " + " : ""}
                  <kbd>{DOT_KEY_LABEL[d]}</kbd>
                </span>
              ))}{" "}
              <span className="text-ink-muted">· {dotsLabel(hintTarget)}</span>
            </>
          )}
        </div>
      )}

      {/* Auswertung am Ende */}
      {done && (
        <div
          role="status"
          className="space-y-3 rounded-xl border border-success/40 bg-success-soft p-4 text-center"
        >
          <p className="m-0 text-lg font-semibold text-ink">
            <span aria-hidden="true">🎉 </span>{pg("Text geschafft!", (t) => t.trainer.textGeschafft)}
          </p>
          <p className="m-0 text-ink-soft">
            {pgTexte() ? (
              pgTexte()!.trainer.textErgebnis(mistakes, fmtTime(elapsed), target.length)
            ) : (
              <>
                {mistakes === 0 ? "Fehlerfrei" : `${mistakes} Fehler`} · Zeit{" "}
                {fmtTime(elapsed)} · {target.length} Zeichen
              </>
            )}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <button
              ref={repeatRef}
              type="button"
              className="btn-secondary btn-toggle"
              // Ohne „Nächster Text" (letzter Text der Etappe) ist DIESER
              // Knopf das Fokusziel - dann trägt er das Ergebnis.
              aria-label={onNext ? undefined : `${ergebnisSatz} ${pg("Gleichen Text nochmal", (t) => t.trainer.gleichenText)}`}
              onClick={onRepeat}
            >
              {pg("Gleichen Text nochmal", (t) => t.trainer.gleichenText)}
            </button>
            {onNext && (
              <button
                ref={nextRef}
                type="button"
                className="btn-primary btn-toggle"
                aria-label={`${ergebnisSatz} ${pg("Nächster Text", (t) => t.trainer.naechsterTextOhnePfeil)}`}
                onClick={onNext}
              >
                {pg("Nächster Text →", (t) => t.trainer.naechsterText)}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Texte lesen: den ganzen Braille-Text am Stück in Druckschrift eintippen
// ---------------------------------------------------------------------------
// ★ exportiert (nur für Tests, siehe tests/braille-vorlesezeit-textlevel.test.tsx)
export function TextReadPanel({
  text,
  system,
  eightDot,
  solve,
  grossschreibzeichen = true,
  onRepeat,
  onNext,
  onTask,
  onComplete,
  onAnnounce,
  address = "sie",
  round,
}: {
  text: string;
  system: BrailleSystem;
  eightDot: boolean;
  /** Optionaler async de-g2-Löser (Kurzschrift) - liefert die ANZEIGE-Zellen
   *  des ganzen Textes. Geprüft wird weiterhin der getippte Klartext gegen den
   *  Soll-Text (keine Rückübersetzung). Nur für Kurzschrift gesetzt - dort
   *  gibt es die Einstellung „Großschreibzeichen" nicht. Liefert `solve`
   *  `null` oder wirft es → KEIN Rückfall auf `textToCells` mehr (Befund
   *  20.09.2026, siehe `useAsyncBrailleTarget`). */
  solve?: (prompt: string) => Promise<Cell[] | null>;
  /** Klassen-Einstellung „Großschreibzeichen" (Basis/Voll) - Standard an. */
  grossschreibzeichen?: boolean;
  onRepeat: () => void;
  onNext: (() => void) | null;
  onTask?: (correct: boolean, meta: TaskMeta) => void;
  /** Text vollständig RICHTIG gelesen - die Etappe zählt damit als gemacht.
   *  (Beim Lesen nur bei fehlerfreier Lösung: „Prüfen" geht auch früh.) */
  onComplete?: () => void;
  onAnnounce?: AnnounceCallback;
  /** Anrede der Rahmentexte: „du" (Punktgenau/Kinder) oder „sie" (LMS-Embeds). */
  address?: "du" | "sie";
  /** Runden-Anzeige (Striche, Alt+Z) - siehe `WritePanel`. Ohne Wert wird
   *  nichts gezeichnet. */
  round?: RoundInfo;
}) {
  const [retryNonce, setRetryNonce] = useState(0);
  const { target: cells, loading, failed } = useAsyncBrailleTarget(
    solve,
    text,
    system,
    grossschreibzeichen,
    retryNonce,
  );
  const solWords = useMemo(
    () => text.trim().split(/\s+/).filter(Boolean),
    [text],
  );
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<null | { got: string[]; correct: number }>(
    null,
  );
  const taRef = useRef<HTMLTextAreaElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const repeatRef = useRef<HTMLButtonElement>(null);
  const onTaskRef = useRef(onTask);
  onTaskRef.current = onTask;
  const onAnnounceRef = useRef(onAnnounce);
  onAnnounceRef.current = onAnnounce;
  const startRef = useRef(Date.now());
  // ★ Faire Zeitverrechnung (22.09.2026, siehe WritePanel/ReadPanel und
  // lib/braille/lesezeit.ts) - hier startet die Uhr wie dort schon beim
  // Mount, darum wird die Basis auch im selben Mount-Effekt gesetzt (unten,
  // vor `speakCells()`).
  const spokenAtStartRef = useRef(0);
  const pasted = useRef(false);
  const focusedRef = useRef(false);

  const paused = useBraillePlay((s) => s.paused);
  const repeatNonce = useBraillePlay((s) => s.repeatNonce);
  const focusInputNonce = useBraillePlay((s) => s.focusInputNonce);
  // ★ Aufforderung über dem Kasten, `data-angabe` an der Braille-Vorlage
  // selbst - siehe die ausführliche Begründung am `WritePanel`.
  const promptLabelId = useId();

  // Groesse (Alt + / -) - Lesevorlage eines ganzen Textes: Zellen 32 bei 100 %.
  const { cellSize, feldStyle } = useUebungsGroesse(32);

  useLoadingAnnounce(loading, failed, uebersetzungFehltText(address, "Kurzschrift"), onAnnounceRef);

  // Anweisung + Zellen als EINE Sequenz (siehe ReadPanel: der Runner sagt
  // Lese-Aufgaben nur in die Live-Region an, das Panel spricht selbst).
  const speakCells = useCallback(() => {
    if (!useVoice.getState().enabled) return;
    const labels = cells.filter((c) => c !== BLANK).map(dotsLabel);
    if (labels.length) speakSequence([pg("Lies den Text und tippe ihn ab.", (t) => t.trainer.textLesenAufgabe), ...labels]);
  }, [cells]);

  useEffect(() => {
    // Siehe ReadPanel weiter oben: bei Kurzschrift läuft dieser Effekt ein
    // zweites Mal (leer → async aufgelöst) - Fokus nur einmal pro Aufgabe,
    // und erst wenn das Feld nicht mehr disabled ist (sonst No-op-Fokus und
    // der Fokus strandet auf body - Befund 2026-07-02).
    if (!focusedRef.current && !loading) {
      if (mayStealFocus()) taRef.current?.focus({ preventScroll: true });
      focusedRef.current = true;
    }
    spokenAtStartRef.current = spokenMs();
    // Bei Self-Voicing AN: Anweisung + Zellen beim Mount ansagen
    speakCells();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cells]);
  useEffect(() => {
    // Beim letzten Text gibt es kein „Nächster Text" - dann „Gleichen Text
    // nochmal" (siehe TextPanel).
    if (result) (nextRef.current ?? repeatRef.current)?.focus({ preventScroll: true });
  }, [result]);

  // Alt+W - Zellfolge erneut ansagen; Alt+E - Fokus ins Antwortfeld.
  const prevRepeatRef = useRef(0);
  useEffect(() => {
    if (repeatNonce === 0 || repeatNonce === prevRepeatRef.current) return;
    prevRepeatRef.current = repeatNonce;
    if (!result) {
      speakCells();
      if (!paused) taRef.current?.focus({ preventScroll: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repeatNonce]);
  useEffect(() => {
    if (focusInputNonce > 0 && !loading && !failed && !paused && !result) {
      taRef.current?.focus({ preventScroll: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusInputNonce]);
  // „Noch einmal versuchen" (siehe UebersetzungFehlt-Banner unten) - gleiches
  // Muster wie Alt+E: der Knopf hat sein eigenes Fokus-Ziel, das Antwortfeld.
  useEffect(() => {
    if (retryNonce > 0) taRef.current?.focus({ preventScroll: true });
  }, [retryNonce]);
  const wasPausedRef = useRef(paused);
  useEffect(() => {
    const was = wasPausedRef.current;
    wasPausedRef.current = paused;
    if (was && !paused && !result && focusedRef.current) {
      taRef.current?.focus({ preventScroll: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused]);

  const wordMatch = (got: string | undefined, sol: string) =>
    got !== undefined && norm(got) === norm(sol);

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const check = () => {
    if (loading || failed || result || !answer.trim() || paused) return;
    const got = answer.trim().split(/\s+/).filter(Boolean);
    let correct = 0;
    for (let i = 0; i < solWords.length; i++) {
      if (wordMatch(got[i], solWords[i])) correct++;
    }
    const allOk = correct === solWords.length && got.length === solWords.length;
    if (!allOk) playErrorSound();
    setResult({ got, correct });
    // Auch ZU VIELE Wörter sind Fehler - sonst sagte die Ansage „Fehlerfrei",
    // während die Anzeige „(zu viel)" markiert (Befund 2026-07-09).
    const mistakes = solWords.length - correct + Math.max(0, got.length - solWords.length);
    // Faire Zeitverrechnung (22.09.2026) - dieselbe Rechnung wie ReadPanel:
    // Vorlesezeit seit Mount raus, `spokenMs` ans Ereignis, die GERECHNETE
    // Lesezeit für den ganzen Text macht `uebezeitFuerEreignis`
    // (lib/braille/lesezeit.ts) daraus - nicht hier.
    const rawMs = Date.now() - startRef.current;
    const spokenInTask = spokenMs() - spokenAtStartRef.current;
    const fairMs = typingGapMs(rawMs, spokenInTask, isSpeaking());
    onTaskRef.current?.(allOk, {
      ms: fairMs,
      cells: cells.length,
      pasted: pasted.current,
      blurred: false,
      spokenMs: spokenInTask > 0 ? spokenInTask : undefined,
    });
    if (allOk) onCompleteRef.current?.();
    // E8 - Text fertig ansagen
    onAnnounceRef.current?.(announceTextDone(mistakes));
  };

  const allOk =
    result !== null &&
    result.correct === solWords.length &&
    result.got.length === solWords.length;
  /** ★ Das Ergebnis am FOKUS (siehe TextPanel) - derselbe Wortlaut wie sichtbar. */
  const ergebnisSatz = !result
    ? ""
    : allOk
      ? pg("Alles richtig gelesen.", (t) => t.trainer.allesRichtigSatz)
      : pg(`${result.correct} von ${solWords.length} Wörtern richtig.`, (t) => t.trainer.wortSatz(result.correct, solWords.length));

  return (
    /* ★★★ Die Kennzeichen der gemeinsamen Bauart (§13): `data-aufgabe` an der
       Aufgabe, `data-angabe` an der Angabe, `data-feld` am Antwort-Element.
       Wer sie setzt, bekommt Lesestelle (§6.2) und Fokus-Wächter (§3) ohne
       eine weitere Zeile Code. */
    <div className="space-y-4" data-aufgabe="text-lesen">
      {/* ★★★ EIN KASTEN (Charge 20.09.2026 Abend) — siehe die ausführliche
          Begründung am `WritePanel`. Zweite Korrektur (Aufforderung über dem
          Kasten, `data-angabe` an der Vorlage, `aria-describedby`) ebenso -
          siehe WritePanel/ReadPanel. */}
      <p id={promptLabelId} className="m-0 text-sm text-ink-muted">
        {pg(
          address === "du"
            ? "Lies den ganzen Text und tipp ihn in Druckschrift:"
            : "Lesen Sie den ganzen Text und tippen Sie ihn in Druckschrift:",
          (t) => t.trainer.textLiesPrompt(address),
        )}
      </p>
      <div className="card rounded-2xl focus-within:ring-[4.5px] focus-within:ring-accent">
        {/* Runden-Striche ÜBER der Braille-Vorlage, in voller Breite
            (Johannes 22.09.2026: „bei texten sollen die striche rechts über,
            nicht neben den texten stehen") - vorher stand die Strichreihe
            RECHTS NEBEN der Textfläche und nahm ihr bei langen Texten
            Breite weg. Eigene Zeile, rechtsbündig (die Striche bleiben
            "rechts", nur jetzt darüber statt daneben). */}
        {round && (
          <div className="flex justify-end border-b border-hairline px-4 pt-4">
            <RoundTicks round={round} zahlUnten />
          </div>
        )}
        {/* Braille-Vorlage zum Lesen (Wort-Lücken als Abstand). */}
        <div className="p-4" data-angabe aria-describedby={promptLabelId}>
          {loading ? (
            <span className="text-sm text-ink-muted">Übersetzung wird geladen …</span>
          ) : failed ? (
            <span className="text-sm text-ink-muted">Keine Vorlage — siehe Meldung unten.</span>
          ) : (
            <CellSequence cells={cells} eightDot={eightDot} size={cellSize} srBraille asFont />
          )}
          {/* Navigierbare Punkte-Liste für SR */}
          <ol role="list" aria-label={pg("Braille-Vorlage, Zelle für Zelle", (t) => t.trainer.vorlageAria)} className="sr-only">
            {cells.filter((c) => c !== BLANK).map((c, i) => (
              <li key={i}>{dotsLabel(c)}</li>
            ))}
          </ol>
          <p className="sr-only">
            {pgTexte() ? (
              pgTexte()!.trainer.vorlageHinweis(altAnzeige(pgTexte()!.trainer.altW))
            ) : (
              <>
                Die Braille-Vorlage steht direkt über dem Eingabefeld - lies sie
                Zelle für Zelle. {altAnzeige("Alt und W")} sagt sie erneut an.
              </>
            )}
          </p>
        </div>

        {failed && (
          <div className="mx-4 mb-3">
            <UebersetzungFehlt
              address={address}
              label="Kurzschrift"
              onRetry={() => setRetryNonce((n) => n + 1)}
            />
          </div>
        )}

        {paused && (
          <div
            role="status"
            className="mx-4 mb-3 rounded-xl border border-accent/40 bg-accent-soft p-3 text-center text-sm font-medium text-ink"
          >
            {pg("Pause - Alt+P zum Weitermachen", (t) => t.trainer.pause)}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            // ★★★ Der Riegel, der `disabled` ersetzt (Bauart §3): Der
            // Prüfen-Knopf bleibt bedienbar und behält den Fokus - er tut nur
            // nichts, solange nichts dasteht oder schon geprüft wird.
            if (!answer.trim() || loading || failed || result !== null || paused) return;
            check();
          }}
          className="space-y-2 border-t border-hairline p-4"
        >
          <label className="field-label" htmlFor="text-read-answer" style={feldStyle}>
            {pg(address === "du" ? "Deine Lösung (ganzer Text):" : "Ihre Lösung (ganzer Text):", (t) => t.trainer.textLoesung(address))}
          </label>
          <textarea
            id="text-read-answer"
            ref={taRef}
            data-feld="antwort"
            data-kuerzel="an"
            className="field-input min-h-[6rem] w-full"
            // ★ Die eigene Antwort wächst mit (Alt + / −) - siehe ReadPanel.
            style={feldStyle}
            value={answer}
            // ★★★ `readOnly` UND `aria-disabled`, NIE `disabled` (Bauart §3).
            // Hier sass die alte Klage der Schueler im Code: Wer seine Antwort
            // eingetippt hatte und pruefen liess, dem wurde das Feld unter den
            // Fingern ausgeschaltet - der Fokus fiel auf `<body>`, und das ist
            // fuer eine Sprachausgabe der Dokumentenanfang.
            // `readOnly` verhindert das Aendern genauso zuverlaessig, nimmt den
            // Fokus aber nicht weg: Der Schreibzeiger bleibt stehen, und die
            // Braillezeile zeigt weiter, was das Kind geschrieben hat.
            readOnly={result !== null || loading || failed || paused}
            aria-disabled={result !== null || loading || failed || paused || undefined}
            onChange={(e) => {
              setAnswer(e.target.value);
            }}
            onPaste={() => {
              pasted.current = true;
            }}
            placeholder={pg("Hier den gelesenen Text eintippen …", (t) => t.trainer.textPlatzhalter)}
            autoComplete="off"
          />
          {result === null && (
            <div className="flex justify-end">
              <button
                type="submit"
                className={
                  "btn-primary" + (!answer.trim() || loading || failed ? " opacity-40" : "")
                }
                aria-disabled={!answer.trim() || loading || failed || undefined}
              >
                {pg("Prüfen", (t) => t.trainer.pruefen)}
              </button>
            </div>
          )}
        </form>
      </div>

      {result && (
        <div
          role="status"
          className={
            "space-y-3 rounded-xl border p-4 " +
            (allOk
              ? "border-success/40 bg-success-soft"
              : "border-hairline bg-surface-sunken")
          }
        >
          <p className="m-0 text-center font-semibold text-ink">
            {allOk ? (
              <>
                <span aria-hidden="true">🎉 </span>{pg("Alles richtig gelesen!", (t) => t.trainer.allesRichtig)}
              </>
            ) : (
              <>
                {pgTexte() ? pgTexte()!.trainer.wortSatzKurz(result.correct, solWords.length) : (<>{result.correct} von {solWords.length} Wörtern richtig</>)}
              </>
            )}
          </p>

          {!allOk && (
            <>
              <div>
                <p className="m-0 mb-1 text-sm text-ink-muted">Richtig wäre:</p>
                <p className="m-0 leading-relaxed text-ink">{text}</p>
              </div>
              <div>
                <p className="m-0 mb-1 text-sm text-ink-muted">
                  {address === "du" ? "Deine Eingabe:" : "Ihre Eingabe:"}
                </p>
                <p className="m-0 leading-relaxed">
                  {solWords.map((w, i) => {
                    const ok = wordMatch(result.got[i], w);
                    return (
                      <span
                        key={i}
                        className={ok ? "text-success" : "font-semibold text-danger"}
                      >
                        {/* Falsch ist sichtbar nur Farbe — hörbar/tastbar
                            braucht es das Wort dazu. */}
                        {!ok && <span className="sr-only">falsch: </span>}
                        {result.got[i] ?? "—"}{" "}
                      </span>
                    );
                  })}
                  {result.got.length > solWords.length && (
                    <span className="text-danger">
                      {result.got.slice(solWords.length).join(" ")} (zu viel)
                    </span>
                  )}
                </p>
              </div>
            </>
          )}

          <div className="flex flex-wrap justify-center gap-2">
            <button
              ref={repeatRef}
              type="button"
              className="btn-secondary btn-toggle"
              // Ohne „Nächster Text" (letzter Text der Etappe) ist DIESER
              // Knopf das Fokusziel - dann trägt er das Ergebnis.
              aria-label={onNext ? undefined : `${ergebnisSatz} ${pg("Gleichen Text nochmal", (t) => t.trainer.gleichenText)}`}
              onClick={onRepeat}
            >
              {pg("Gleichen Text nochmal", (t) => t.trainer.gleichenText)}
            </button>
            {onNext && (
              <button
                ref={nextRef}
                type="button"
                className="btn-primary btn-toggle"
                aria-label={`${ergebnisSatz} ${pg("Nächster Text", (t) => t.trainer.naechsterTextOhnePfeil)}`}
                onClick={onNext}
              >
                {pg("Nächster Text →", (t) => t.trainer.naechsterText)}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function TextLevelRunner({
  level,
  system,
  direction,
  address = "sie",
  grossschreibzeichen = true,
  onProgress,
  onTask,
  onComplete,
  onAnnounce,
  showRound = false,
}: {
  level: Level;
  system: BrailleSystem;
  direction: "write" | "read";
  /** Anrede der Panel-Rahmentexte (siehe LevelRunner). */
  address?: "du" | "sie";
  /**
   * Klassen-Einstellung „Großschreibzeichen" (nur Basis/Voll, Standard an) -
   * siehe `BrailleClassSettings.grossschreibzeichen` in `lib/braille/account.ts`.
   */
  grossschreibzeichen?: boolean;
  onProgress: (r: RingInfo) => void;
  onTask?: (e: TrainerTaskEvent) => void;
  /** Ein Text wurde vollständig geschrieben bzw. fehlerfrei gelesen - die
   *  Etappe zählt als gemacht (Text-Etappen haben kein Mastery-Fenster). */
  onComplete?: () => void;
  onAnnounce?: AnnounceCallback;
  /** Zeigt die Runden-Striche im Aufgaben-Kasten (Alt+Z) - siehe `LevelRunner`. */
  showRound?: boolean;
}) {
  const eightDot = system === "computer";
  // Kurzschrift-Texte (id „kurz-texte"): Anzeige + Soll kommen async aus liblouis
  // de-g2 (gekürzt) - wie im LevelRunner. Gilt für Lesen UND Schreiben.
  const isKurz = level.id.startsWith("kurz-");
  // Nur vorladen, wenn dieses Level etwas Freies enthält - siehe LevelRunner.
  const brauchtWorker = isKurz && !alleVorgerechnet(level.items, "de-g2");
  useEffect(() => {
    if (brauchtWorker) void ensureLouLoaded().catch(() => { /* siehe solve-Aufruf im Panel */ });
  }, [brauchtWorker]);

  // E12 - Alt+M: Fließtext-Etappen führen keine neuen Zeichen ein (kein
  // „Meine Tasten"-Kasten hier) → nur ansagen statt stumm zu bleiben.
  const focusKeysNonce = useBraillePlay((s) => s.focusKeysNonce);
  const onAnnounceRef = useRef(onAnnounce);
  onAnnounceRef.current = onAnnounce;
  const prevFocusKeysRef = useRef(0);
  useEffect(() => {
    if (focusKeysNonce === 0 || focusKeysNonce === prevFocusKeysRef.current) return;
    prevFocusKeysRef.current = focusKeysNonce;
    onAnnounceRef.current?.(announceNoNewChars());
  }, [focusKeysNonce]); // eslint-disable-line react-hooks/exhaustive-deps
  const solveKurzTarget = useCallback(
    async (p: string): Promise<Cell[] | null> => {
      try {
        return unicodeToCells(await toBraille(p, "de-g2"));
      } catch {
        return null; // löst im Panel die „Übersetzung fehlt"-Meldung aus, kein Rückfall
      }
    },
    [],
  );
  const texts = level.items;
  const [ti, setTi] = useState(0);
  const [retry, setRetry] = useState(0);

  const text = texts[ti] ?? texts[0] ?? "";
  const hasNext = ti < texts.length - 1;

  const paused = useBraillePlay((s) => s.paused);
  const repeatNonce = useBraillePlay((s) => s.repeatNonce);

  // Aufgaben-Ansage für Text-Etappen. Schreiben: der ganze Text ist die
  // Aufgabe (beide Kanäle). Lesen: nur Live-Region - die Sprech-Sequenz
  // (Anweisung + Zellen) übernimmt das TextReadPanel selbst (voice:false,
  // sonst würgt speakUi dessen Warteschlange ab).
  const announceTextTask = useCallback(() => {
    onAnnounceRef.current?.(
      direction === "read"
        ? { channel: "task", text: pg("Lies den Text und tippe ihn ab.", (t) => t.trainer.textLesenAufgabe), voice: false }
        : announceTask(text, "write"),
    );
  }, [direction, text]);

  // E1 - beim Mount, bei jedem Textwechsel und beim „Gleichen Text nochmal".
  // Text-Etappen hatten bisher GAR KEINE Aufgaben-Ansage (Befund 2026-07-02).
  useEffect(() => {
    announceTextTask();
  }, [announceTextTask, retry]);

  // E10 - Pause an/aus (wie im LevelRunner; die Panels sperren die Eingabe).
  const prevPausedRef = useRef(false);
  useEffect(() => {
    if (paused === prevPausedRef.current) return;
    prevPausedRef.current = paused;
    if (paused) onAnnounceRef.current?.(announcePaused());
    else announceTextTask();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused]);

  // E11 - Alt+W: Aufgabe erneut ansagen (Lesen: das Panel spricht die Zellen).
  const prevRepeatRef = useRef(0);
  useEffect(() => {
    if (repeatNonce === 0 || repeatNonce === prevRepeatRef.current) return;
    prevRepeatRef.current = repeatNonce;
    announceTextTask();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repeatNonce]);

  // Runden-Info (ein Strich je Text dieser Etappe) - EINMAL berechnet, wie im
  // LevelRunner: der Ring im Kopf bekommt sie über `onProgress`, das Panel
  // bekommt sie selbst als Prop (`showRound`).
  const textRoundInfo: RoundInfo = {
    done: ti,
    total: texts.length,
    approx: false,
    label: pg(`Text ${ti + 1} von ${texts.length}.`, (t) => `${t.trainer.textNr(ti + 1, texts.length)}.`),
  };

  // Text-Fortschritt an den Ring im Kopf melden.
  const onProgressRef = useRef(onProgress);
  onProgressRef.current = onProgress;
  useEffect(() => {
    onProgressRef.current({
      number: ti + 1,
      value: texts.length ? ti / texts.length : 0,
      caption: pg("Text", (t) => t.trainer.textKopf),
      ariaLabel: pg(`Text ${ti + 1} von ${texts.length}`, (t) => t.trainer.textNr(ti + 1, texts.length)),
      // Runde = die Texte dieser Etappe (ein Strich je Text). done = fertige Texte.
      round: textRoundInfo,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- textRoundInfo
    // wird aus denselben Werten (ti/texts.length) neu berechnet.
  }, [ti, texts.length]);

  const onRepeat = () => setRetry((r) => r + 1);
  const onNext = hasNext
    ? () => {
        setTi((t) => t + 1);
        setRetry(0);
      }
    : null;
  const reportTask = (correct: boolean, meta: TaskMeta) =>
    onTask?.({ level: level.id, system, direction, correct, ...meta });

  return (
    <div className="space-y-4">
      {/* ★ KEIN umschliessender `.card` mehr - siehe LevelRunner. */}
      {direction === "read" ? (
        <TextReadPanel
          key={`r-${ti}-${retry}`}
          text={text}
          system={system}
          eightDot={eightDot}
          solve={isKurz ? solveKurzTarget : undefined}
          grossschreibzeichen={grossschreibzeichen}
          address={address}
          round={showRound ? textRoundInfo : undefined}
          onRepeat={onRepeat}
          onNext={onNext}
          onTask={reportTask}
          onComplete={onComplete}
          onAnnounce={onAnnounce}
        />
      ) : (
        <TextPanel
          key={`w-${ti}-${retry}`}
          text={text}
          system={system}
          eightDot={eightDot}
          solve={isKurz ? solveKurzTarget : undefined}
          grossschreibzeichen={grossschreibzeichen}
          address={address}
          round={showRound ? textRoundInfo : undefined}
          onRepeat={onRepeat}
          onNext={onNext}
          onTask={reportTask}
          onComplete={onComplete}
          onAnnounce={onAnnounce}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Trainer (Orchestrierung)
// ---------------------------------------------------------------------------
const SYSTEM_CHOICES: { key: BrailleSystem; label: string }[] = [
  { key: "basis", label: "Basisschrift" },
  { key: "voll", label: "Vollschrift" },
  { key: "computer", label: "Computer" },
];

/** Telemetrie-Ereignis je gelöster Aufgabe (für Konto-Statistik + KI-Erkennung). */
export interface TrainerTaskEvent {
  level: string;
  system: BrailleSystem;
  direction: "write" | "read";
  correct: boolean;
  ms: number;
  cells: number;
  pasted: boolean;
  blurred: boolean;
  spokenMs?: number;
  typed?: string;
  /**
   * TASTENZEIT seit dem letzten Ereignis (ms) - dasselbe Feld wie
   * `TaskEvent.activeMs` (`lib/braille/account.ts`). NICHT von diesem
   * Trainer selbst gesetzt: `Punktgenau.tsx` (`meldeAufgabe`) hängt es über
   * `mitTastenzeit` (`lib/tastenuhr.ts`) an, BEVOR die Übezeit-Rechnung
   * (`lesezeit.ts`) und `onTask` es sehen - siehe dort für die Begründung
   * (dieselbe Zahl in der laufenden Uhr wie später in der Statistik).
   */
  activeMs?: number;
}

// ---------------------------------------------------------------------------
// Lupe: schlanke Leiste direkt ÜBER dem Übungsbereich. Vergrößert nur diesen
// (CSS-zoom), der bestehende Browser-Zoom bleibt davon unberührt.
//
// ⚠️ Punktgenau zeigt diese Leiste seit 20.09.2026 NICHT mehr (Johannes) - dort
// bleibt nur das Tastenkürzel Alt + / Alt − (PunktgenauPage.tsx). Klangpunkte
// benutzt sie weiter; ob sie auch dort verschwindet, ist nicht entschieden.
// ---------------------------------------------------------------------------
export function BrailleZoomBar() {
  const zoom = useBrailleA11y((s) => s.zoom);
  const zoomIndex = useBrailleA11y((s) => s.zoomIndex);
  const zoomIn = useBrailleA11y((s) => s.zoomIn);
  const zoomOut = useBrailleA11y((s) => s.zoomOut);
  const resetZoom = useBrailleA11y((s) => s.resetZoom);
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
      <span className="text-sm font-medium text-ink-soft">
        <span aria-hidden="true">🔍 </span>Größe
      </span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          className="btn-secondary btn-toggle"
          onClick={zoomOut}
          // ★★★ `aria-disabled`, nie `disabled` (Bauart §3). Gerade hier ist
          // die Falle nah: Wer sich an die kleinste Stufe heruntertippt, steht
          // mit dem Fokus auf genau diesem Knopf - und faellt im selben
          // Augenblick an den Dokumentenanfang. `zoomOut` begrenzt selbst
          // (`Math.max(... , 0)`), es ist also nichts zu verriegeln.
          aria-disabled={zoomIndex === 0 || undefined}
          aria-label="Kleiner anzeigen"
        >
          <span aria-hidden="true">−</span>
        </button>
        <span
          className="min-w-[3.25rem] text-center text-sm font-semibold tabular-nums text-ink"
          aria-live="polite"
        >
          {Math.round(zoom * 100)} %
        </span>
        <button
          type="button"
          className="btn-secondary btn-toggle"
          onClick={zoomIn}
          // ★★★ Wie beim Minus-Knopf: `zoomIn` begrenzt selbst.
          aria-disabled={zoomIndex === ZOOM_LEVELS.length - 1 || undefined}
          aria-label="Größer anzeigen"
        >
          <span aria-hidden="true">+</span>
        </button>
        {zoomIndex > 0 && (
          <button type="button" className="btn-ghost btn-toggle" onClick={resetZoom}>
            Zurücksetzen
          </button>
        )}
      </div>
      <span className="text-xs text-ink-muted">vergrößert nur den Übungsbereich</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Einzelne, eingebettete Übung - EIN festes Level, schlanker Kopf (Stufen-/
// Text-Ring + Titel + Ton, optional Schreiben/Lesen). Kein System-Wechsel und
// kein Level-Pulldown. Für Lektionen (`@@WIDGET:braille:level=…@@`) und für
// Arbeitshefte (iframe `/programme/braille?level=…&bare=1`). Nutzt dieselben
// Runner wie der volle Trainer und teilt sich denselben localStorage-Spielstand.
// ---------------------------------------------------------------------------
export function BrailleExercise({
  levelId,
  direction: initialDirection = "write",
  allowDirectionToggle = false,
  loadFn = loadProgress,
  saveFn = saveProgress,
  onTask,
}: {
  levelId: string;
  direction?: "write" | "read";
  allowDirectionToggle?: boolean;
  loadFn?: () => BrailleProgress;
  saveFn?: (p: BrailleProgress) => void;
  onTask?: (e: TrainerTaskEvent) => void;
}) {
  const level = levelById(levelId) ?? firstLevelOf("basis");
  const system = level.system;
  const [direction, setDirection] = useState<"write" | "read">(initialDirection);
  const [progress, setProgress] = useState<BrailleProgress>(() => loadFn());
  const [ring, setRing] = useState<RingInfo | null>(null);
  const [toast, setToast] = useState("");
  const [muted, setMuted] = useState<boolean>(() => isSoundMuted());
  const dirBtnRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // ARIA-Live-Regionen (auch im Embed-Modus nötig - Kern-A11y läuft dort)
  const [taskMsg, setTaskMsg] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [alertMsg, setAlertMsg] = useState("");
  const [liveLang, setLiveLang] = useState<string>("de");
  const announce: AnnounceCallback = ({ channel, text, brailleText, lang, voice, spoken }) => {
    const liveText = brailleText ? `${text} ${brailleText}` : text;
    if (channel === "task") pushLive(setTaskMsg, liveText);
    else if (channel === "status") pushLive(setStatusMsg, liveText);
    else pushLive(setAlertMsg, liveText);
    setLiveLang(lang ?? "de");
    if (voice !== false) speakUi(spoken ?? text, lang);
  };

  const persist = (p: BrailleProgress) => {
    setProgress(p);
    saveFn(p);
  };
  const applyResult = (r: TaskOutcome) => {
    const prev = progress.levels[level.id];
    persist({
      // ...progress ist Pflicht: der Embed teilt sich den Spielstand mit dem
      // Haupttrainer - ohne Spread löschte jede Embed-Aufgabe dessen übrige
      // Felder (lastPlace/Resume, setup, streak …; Befund 2026-07-09).
      ...progress,
      xp: progress.xp + (r.correct ? 2 : 0) + (r.masteredNow ? 30 : 0),
      levels: r.masteredNow
        ? {
            ...progress.levels,
            [level.id]: {
              completed: true,
              bestStars: Math.max(prev?.bestStars ?? 0, r.stars),
              attempts: (prev?.attempts ?? 0) + 1,
            },
          }
        : progress.levels,
      mastery: { ...(progress.mastery ?? {}), [level.id]: r.mastery },
      stufen: { ...(progress.stufen ?? {}), [system]: r.stufe },
    });
    if (r.masteredNow) setToast(`Geschafft! +30 XP`);
  };

  return (
    <div className="not-prose space-y-4">
      {/* Feste ARIA-Live-Regionen — auch im Embed-Modus immer gemountet */}
      <div id="braille-live-task" lang={liveLang} aria-live="assertive" aria-atomic="true" className="sr-only">{taskMsg}</div>
      <div id="braille-live-status" lang={liveLang} role="status" aria-live="polite" aria-atomic="true" className="sr-only">{statusMsg}</div>
      <div id="braille-live-alert" lang={liveLang} role="alert" aria-live="assertive" aria-atomic="true" className="sr-only">{alertMsg}</div>

      <div className="flex flex-wrap items-center gap-3">
        {ring && (
          <ProgressRing
            value={ring.value}
            number={ring.number}
            caption={ring.caption}
            ariaLabel={ring.ariaLabel}
          />
        )}
        <div>
          <p className="m-0 text-sm font-semibold text-ink">{level.title}</p>
          <p className="m-0 text-xs text-ink-muted">
            {SYSTEM_CHOICES.find((s) => s.key === system)?.label}
            {" · "}
            {direction === "read" ? "Lesen" : "Schreiben"}
          </p>
        </div>

        {allowDirectionToggle && (
          <div
            role="radiogroup"
            aria-label="Übungsrichtung"
            className="flex items-center gap-1 sm:ml-auto"
            // ARIA-Radiogroup-Muster: EIN Tab-Stopp, Pfeiltasten wechseln
            // (wie in Punktgenau - auch im Arbeitsheft-Embed).
            onKeyDown={(e) => {
              if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
              e.preventDefault();
              const next = direction === "write" ? "read" : "write";
              setDirection(next);
              dirBtnRefs.current[next]?.focus();
            }}
          >
            <button
              ref={(el) => {
                dirBtnRefs.current.write = el;
              }}
              type="button"
              role="radio"
              aria-checked={direction === "write"}
              tabIndex={direction === "write" ? 0 : -1}
              onClick={() => setDirection("write")}
              className={(direction === "write" ? "btn-primary" : "btn-secondary") + " btn-toggle"}
            >
              Schreiben
            </button>
            <button
              ref={(el) => {
                dirBtnRefs.current.read = el;
              }}
              type="button"
              role="radio"
              aria-checked={direction === "read"}
              tabIndex={direction === "read" ? 0 : -1}
              onClick={() => setDirection("read")}
              className={(direction === "read" ? "btn-primary" : "btn-secondary") + " btn-toggle"}
            >
              Lesen
            </button>
          </div>
        )}

        <button
          type="button"
          aria-pressed={!muted}
          onClick={() => {
            const next = !muted;
            setMuted(next);
            setSoundMuted(next);
          }}
          className={"btn-secondary btn-toggle" + (allowDirectionToggle ? "" : " sm:ml-auto")}
          title={muted ? "Fehlerton ist aus — klicken zum Einschalten" : "Fehlerton ist an — klicken zum Ausschalten"}
        >
          <span aria-hidden="true">{muted ? "🔇" : "🔊"}</span>
          <span className="sr-only">Fehlerton {muted ? "einschalten" : "ausschalten"}</span>
        </button>
      </div>

      {/* Bei Leveln MIT Legende zeigt der LevelRunner den intro bereits in der
          „Neue Zeichen"-Box — hier nur sonst, um Doppelung zu vermeiden. */}
      {!level.legend && (
        <p className="m-0 text-sm text-ink-muted">{level.intro}</p>
      )}

      {toast && (
        <p
          role="status"
          className="rounded-xl border border-success/40 bg-success-soft p-3 text-center text-sm font-medium text-ink"
        >
          {toast}
        </p>
      )}

      {level.kind === "text" ? (
        <TextLevelRunner
          key={level.id + system + direction}
          level={level}
          system={system}
          direction={direction}
          onProgress={setRing}
          onTask={onTask}
          onAnnounce={announce}
        />
      ) : (
        <LevelRunner
          key={level.id + direction + system}
          level={level}
          system={system}
          direction={direction}
          initialMastery={getLevelMastery(progress, level.id)}
          initialStufe={getSystemStufe(progress, system)}
          onResult={applyResult}
          onNext={null}
          onProgress={setRing}
          onTask={onTask}
          onAnnounce={announce}
        />
      )}
    </div>
  );
}
