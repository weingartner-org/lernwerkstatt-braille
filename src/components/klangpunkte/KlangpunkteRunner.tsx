/**
 * Übungs-Runner des Bereichs „Klangpunkte" (Braille-Musiknotation).
 *
 * Drei Aufgabenformen aus lib/klangpunkte/etappen.ts:
 *  • choice — Hör-/Erkennungsfragen mit Antwortknöpfen (auch Ziffern 1–4),
 *  • write  — Zellenfolgen per 6-Tasten-Akkord (f d s / j k l), Leertaste =
 *             Taktstrich; erst richtig, dann weiter (wie im WritePanel),
 *  • tap    — Rhythmus mit der Leertaste nachklopfen.
 * kp14 (Lieder-Werkstatt) wählt Lied + Zeile und erzeugt daraus write-Aufgaben.
 *
 * Mastery/XP laufen über dasselbe Fenster wie die anderen Bereiche
 * (recordAttempt/isLevelMastered); die Stufe wird bewusst NICHT angefasst
 * (Musik hat keine adaptive Stütz-Stufe). A11y wie im Trainer: Ansagen über
 * onAnnounce (Live-Region + Vorlesen), role="application" am Akkord-Feld,
 * Fokus nur stehlen, wenn niemand die Kopfzeile bedient.
 */
import { useEffect, useRef, useState } from "react";
import {
  BLANK,
  cellToUnicode,
  dotsLabel,
  isLevelMastered,
  keyLabelsForCell,
  MASTERY_MIN_ATTEMPTS,
  masteryProgress,
  recordAttempt,
  type Cell,
  type LevelMastery,
} from "@/lib/braille";
import { announceCellHint, announcePaused } from "@/lib/braille/announce";
import { useBraillePlay } from "@/lib/braille/play";
import { altAnzeige } from "@/lib/altTaste";
import { playErrorSound } from "@/lib/braille/sound";
import { playCorrectTick, playLevelJingle, playWordDone } from "@/lib/braille/earcons";
import { sprich, sprichDannSpiele } from "@/lib/klangpunkte/sprechen";
import { useKlangTexte } from "@/lib/klangpunkte/sprache";
import {
  INSTRUMENT_LABELS,
  INSTRUMENTS,
  playBordun,
  playChord,
  playMelody,
  playTone,
  preloadInstrument,
  stopPlayback,
} from "@/lib/klangpunkte/audio";
import { useMusicSettings } from "@/lib/klangpunkte/store";
import { useTouchBedienung } from "@/lib/klangpunkte/touch";
import {
  nextKlangTask,
  shortPromptForRepeat,
  songLineTask,
  type BuildTask,
  type ChoiceTask,
  type KlangTask,
  type PlayTask,
} from "@/lib/klangpunkte/etappen";
import {
  beatsText,
  beatUnitFor,
  midi,
  note,
  OCTAVE_LABELS,
  PLAY_KEYS,
  PLAY_KEY_TO_TONE,
  readCell,
  readSequence,
  REST_LABELS,
  toneName,
  VALUE_LABELS,
  type Melody,
  type NameStyle,
  type MusicNote,
  type ToneName,
} from "@/lib/klangpunkte/notation";
import type { Werk } from "@/lib/klangpunkte/progress";
import type { KlangBadgeEvent } from "@/lib/klangpunkte/badges";
import { songsForShelf, type Song } from "@/lib/klangpunkte/songs";
import type { Etappe } from "@/lib/braille/etappen";
import {
  GrandStaff,
  HAND_FOCUS_ORDER,
  NotenZeile,
  handFocusLabel,
  type HandFocus,
} from "./NotenZeile";
import { BrailleCell } from "@/components/braille/BrailleCell";
import { useBrailleChord } from "@/components/braille/useBrailleChord";
import { KlangpunkteTouchEingabe } from "./KlangpunkteTouchEingabe";
import type { AnnounceCallback, RingInfo, TaskOutcome } from "@/components/braille/BrailleTrainer";

/** Die ersten drei Tonnamen einer Schreibweise ("do, re, mi" / "c, d, e"; je Sprache). */
const tonListe = (style: NameStyle): string =>
  (["c", "d", "e"] as ToneName[]).map((x) => toneName(x, style)).join(", ");

/** Die sieben Stammtöne als Buchstaben ("c d e f g a h"; je Sprache). */
const stammtoene = (): string =>
  (["c", "d", "e", "f", "g", "a", "h"] as ToneName[]).map((x) => toneName(x, "buchstaben")).join(" ");

/** Fokus nur stehlen, wenn gerade niemand ein Bedienelement nutzt. */
function mayStealFocus(): boolean {
  const el = document.activeElement;
  return !el || el === document.body;
}

// Klangbeispiele erklingen NACH dem Vorlesen der Aufgabe (nicht mehr nach festem
// Vorlauf): bei aktivem Self-Voicing (unsere speechSynthesis) exakt im Anschluss
// an die Ansage (onend-gekoppelt, siehe speakThenPlay). Ist Self-Voicing AUS,
// liest u. U. ein externer Screenreader (JAWS/NVDA/VoiceOver) die aria-live-Region
// vor — dessen Sprech-Status ist aus dem Browser GRUNDSÄTZLICH nicht abfragbar
// (kein Rückkanal von der Plattform-A11y-API zur Seite; bewusst aus Datenschutz-
// gründen). Darum dann eine feste Standard-Wartezeit von 1 s, damit der Screen-
// reader mit dem Vorlesen beginnen kann (Wunsch Johannes, 12.07.).
const AUTOPLAY_SILENT_GAP_MS = 1000;

export interface KlangpunkteRunnerProps {
  etappe: Etappe;
  initialMastery: LevelMastery;
  onResult: (r: TaskOutcome) => void;
  onNext: (() => void) | null;
  nextTitle?: string;
  onProgress: (r: RingInfo) => void;
  onAnnounce: AnnounceCallback;
  /** Gespeicherte Werke (kp-komponier) + Speicher-Callback (§4.5). */
  werke?: Werk[];
  onSaveWerk?: (w: Werk) => void;
  /** Abzeichen-Ereignis melden (Stufe 5, §12) — die Shell verbucht + jubelt. */
  onBadge?: (event: KlangBadgeEvent) => void;
  /** Tages-Mix (§11.4): statt eines Kapitels ziehen die Aufgaben quer durch
   *  gemeisterte Kapitel. `pick` liefert die nächste Aufgabe (oder null = leer).
   *  Im Mix wird NICHT gewertet/gespeichert und es gibt kein „gemeistert"-Gate. */
  mix?: { pick: () => KlangTask | null };
  /** Im Mix: je Aufgabe melden, ob sie richtig war (für die Bilanz der Shell). */
  onMix?: (correct: boolean) => void;
  /** Bester Sterne-Stand dieses Kapitels (fürs Wiederöffnen: die Geschafft-
   *  Karte zeigt sonst fälschlich „0 von 3 Sternen"). */
  bestStarsSoFar?: number;
  /** Kapitel ohne Sterne-Wertung (Spielwiese/Komponier): Ansagen und Karte
   *  sprechen dann nie von Sternen. */
  noStars?: boolean;
}

export function KlangpunkteRunner({
  etappe,
  initialMastery,
  onResult,
  onNext,
  nextTitle,
  onProgress,
  onAnnounce,
  werke = [],
  onSaveWerk,
  onBadge,
  mix,
  onMix,
  bestStarsSoFar = 0,
  noStars = false,
}: KlangpunkteRunnerProps) {
  const tx = useKlangTexte().runner;
  const instrument = useMusicSettings((s) => s.instrument);
  const setInstrument = useMusicSettings((s) => s.setInstrument);
  const nameStyle = useMusicSettings((s) => s.nameStyle);
  const setNameStyle = useMusicSettings((s) => s.setNameStyle);
  const rhythmSilben = useMusicSettings((s) => s.rhythmSilben);
  const setRhythmSilben = useMusicSettings((s) => s.setRhythmSilben);

  // Sample-Bank des gewählten Instruments schon mal laden (Netz + Decode),
  // damit gleich die erste Melodie mit echten Klängen spielt.
  useEffect(() => {
    preloadInstrument(instrument);
  }, [instrument]);

  const paused = useBraillePlay((s) => s.paused);
  const repeatNonce = useBraillePlay((s) => s.repeatNonce);
  const focusInputNonce = useBraillePlay((s) => s.focusInputNonce);
  const focusKeysNonce = useBraillePlay((s) => s.focusKeysNonce);
  const handSwitchNonce = useBraillePlay((s) => s.handSwitchNonce);

  const isSongEtappe = etappe.id === "kp14";
  const [songPick, setSongPick] = useState<Song | null>(null);
  const [lineIdx, setLineIdx] = useState(0);

  const masteryRef = useRef<LevelMastery>(initialMastery);
  const [mastered, setMastered] = useState(() => isLevelMastered(initialMastery));
  // Einmal gemeistert → masteredNow (+XP-Bonus, Geschafft-Wechsel) nie wieder
  // melden: Nach „Weiter üben" bleibt das Mastery-Fenster voll — ohne die
  // Sperre käme nach jeder weiteren Aufgabe erneut die Geschafft-Ansicht samt
  // Bonus (Schwester-Befund aus Punktgenau, 2026-07-09).
  const everMasteredRef = useRef(isLevelMastered(initialMastery));
  const [lastStars, setLastStars] = useState(0);
  // Tages-Mix-Modus (§11.4): Aufgaben quer durch gemeisterte Kapitel, ohne
  // Wertung/Gate. Über Refs zugänglich in Effekten/Callbacks.
  const mixRef = useRef(mix);
  mixRef.current = mix;
  const onMixRef = useRef(onMix);
  onMixRef.current = onMix;

  const [task, setTask] = useState<KlangTask | null>(null);
  const lastKeyRef = useRef("");
  const [round, setRound] = useState(0); // erzwingt neue Aufgabe
  // In dieser Kapitel-Runde bereits VOLL angesagte Anleitungen: dieselbe
  // Anleitung wird beim nächsten Mal nur noch als Kurzfrage gesprochen
  // („Eine kleine Tonleiter. Geht sie rauf oder runter?" → „Geht sie rauf
  // oder runter?"). Der sichtbare Text und Alt+W bleiben vollständig.
  const announcedPromptsRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    announcedPromptsRef.current.clear();
  }, [etappe.id]);

  // write-Zustand
  const [pos, setPos] = useState(0);
  const wrongRef = useRef(false);
  const [wrongFlash, setWrongFlash] = useState<Cell | null>(null);
  // Umschalt gedrückt halten blendet die Lösung der aktuellen Zelle ein und
  // sagt ihre Tasten an — wie in den Schrift-Bereichen (Johannes 03.07.).
  const [hint, setHint] = useState(false);
  // choice-Zustand
  const [answered, setAnswered] = useState<number | null>(null);
  // tap-Zustand
  const tapTimes = useRef<number[]>([]);
  const [tapCount, setTapCount] = useState(0);

  // play-Zustand (Nachspiel-Klaviatur): Soll-Tonfolge, wie weit nachgespielt,
  // aktuelle Oktave. memory* trägt das Melodie-Memory (wachsende Folge, §12).
  const playTargetRef = useRef<MusicNote[]>([]);
  const playIdxRef = useRef(0);
  const [playIdx, setPlayIdx] = useState(0);
  const playOctaveRef = useRef(4);
  const [playOctave, setPlayOctave] = useState(4);
  const memorySeqRef = useRef<MusicNote[]>([]);
  const memoryBestRef = useRef(0);
  const [memoryLen, setMemoryLen] = useState(0);
  // free-Play (Klang-Spielwiese §7.7): Bordun + Ton-Zähler bis zum Häkchen.
  const freeTapsRef = useRef(0);
  const [freeTaps, setFreeTaps] = useState(0);
  const stopBordunRef = useRef<(() => void) | null>(null);
  // „Erst vorlesen, dann anspielen": höchstens ein Klangbeispiel ist gleichzeitig
  // scharf. armAutoplay entschärft ein vorheriges, bevor es ein neues an die
  // Aufgaben-Ansage koppelt (speakThenPlay); disarmAutoplay bricht es beim
  // Aufgabenwechsel/Unmount ab, damit der Ton einer verlassenen Aufgabe schweigt.
  const autoplayRef = useRef<(() => void) | null>(null);
  const disarmAutoplay = () => {
    autoplayRef.current?.();
    autoplayRef.current = null;
  };
  const armAutoplay = (text: string, play: () => void) => {
    autoplayRef.current?.();
    autoplayRef.current = sprichDannSpiele(
      text,
      () => {
        autoplayRef.current = null;
        play();
      },
      { silentGapMs: AUTOPLAY_SILENT_GAP_MS },
    );
  };
  useEffect(
    () => () => {
      autoplayRef.current?.();
      autoplayRef.current = null;
    },
    [],
  );
  // Lese-Konzert (§9.3): Lesephase — Zellen sichtbar, Klaviatur gesperrt, kein
  // Vorspielen. „Fertig gelesen" beendet sie und blendet die Zellen aus.
  const [reading, setReading] = useState(false);
  const readingRef = useRef(false);

  // build-Zustand (Takt-Baumeister §4.4): eingegebene Zellen + Schlagsumme.
  const [buildCells, setBuildCells] = useState<Cell[]>([]);
  const buildCellsRef = useRef<Cell[]>([]);
  // sandbox-Zustand (Komponier-Werkstatt §4.5).
  const [sandCells, setSandCells] = useState<Cell[]>([]);
  const sandCellsRef = useRef<Cell[]>([]);
  const [werkName, setWerkName] = useState("");

  const [highlight, setHighlight] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  // Zweizeilige Klavier-Ansicht (staff2): welche Hand klingt gerade (für die
  // Hervorhebung) und welche Hand ist im Fokus (Alt+Q - beide · rechts · links).
  const [playingHand, setPlayingHand] = useState<"rh" | "lh" | null>(null);
  const [handFocus, setHandFocus] = useState<HandFocus>("both");
  const handFocusRef = useRef<HandFocus>("both");
  handFocusRef.current = handFocus;

  const areaRef = useRef<HTMLDivElement>(null);
  // Handy/Tablet ohne Tastatur: Knöpfe für VoiceOver-Wischen, Punkt-Knöpfe und
  // Bildschirm-Braille. Die Tastatur bleibt unverändert (siehe lib/klangpunkte/touch.ts).
  const touch = useTouchBedienung();

  // --- Aufgabe ziehen ------------------------------------------------------------
  useEffect(() => {
    if (mastered) return;
    if (!mixRef.current && isSongEtappe && !songPick) {
      setTask(null);
      return;
    }
    let t: KlangTask;
    if (mixRef.current) {
      // Tages-Mix: nächste Aufgabe aus einem gemeisterten Kapitel ziehen.
      const p = mixRef.current.pick();
      if (!p) {
        setTask(null);
        return;
      }
      t = p;
      for (let i = 0; i < 4 && t.key === lastKeyRef.current; i++) {
        const p2 = mixRef.current.pick();
        if (p2) t = p2;
      }
    } else if (isSongEtappe && songPick) {
      t = songLineTask(
        songPick.title,
        lineIdx,
        songPick.lines[lineIdx],
        songPick.timeSig,
        nameStyle,
        rhythmSilben,
      );
    } else {
      t = nextKlangTask(etappe.id, nameStyle, rhythmSilben);
      // dieselbe Aufgabe nicht zweimal direkt hintereinander
      for (let i = 0; i < 4 && t.key === lastKeyRef.current; i++)
        t = nextKlangTask(etappe.id, nameStyle, rhythmSilben);
    }
    lastKeyRef.current = t.key;
    // Wechselt die Aufgabe das Instrument (kp-instrumente), dessen Samples
    // schon mal anwärmen — playMelody wartet sonst hörbar auf das Netz.
    if ("instrument" in t && t.instrument) preloadInstrument(t.instrument);
    setTask(t);
    setPos(0);
    wrongRef.current = false;
    setWrongFlash(null);
    setHint(false);
    setAnswered(null);
    tapTimes.current = [];
    setTapCount(0);
    playIdxRef.current = 0;
    setPlayIdx(0);
    playOctaveRef.current = 4;
    setPlayOctave(4);
    freeTapsRef.current = 0;
    setFreeTaps(0);
    buildCellsRef.current = [];
    setBuildCells([]);
    sandCellsRef.current = [];
    setSandCells([]);
    stopBordunRef.current?.();
    stopBordunRef.current = null;
    readingRef.current = false;
    setReading(false);
    handFocusRef.current = "both";
    setHandFocus("both");
    setPlayingHand(null);
    // Aufgabe ansagen — und das Klangbeispiel DANACH: bei aktivem Vorlesen direkt
    // im Anschluss an die Ansage, bei stummem Vorlesen nach kurzer Pause
    // (armAutoplay → speakThenPlay). Dazu füllt onAnnounce bei gekoppeltem Ton nur
    // die Live-Region (voice:false) — gesprochen wird über speakThenPlay, damit
    // dessen Ende den Ton auslöst. Wiederholte Anleitung? Dann nur noch die
    // Kurzfrage sprechen (10.07.).
    disarmAutoplay();
    const shortAnnounce = announcedPromptsRef.current.has(t.prompt)
      ? shortPromptForRepeat(t.prompt)
      : null;
    announcedPromptsRef.current.add(t.prompt);
    const promptText = shortAnnounce ?? t.prompt;
    if (t.kind === "play") {
      setupPlayRound(t);
      // Lese-Konzert: erst lesen (kein Vorspielen), dann aus dem Gedächtnis spielen.
      if (t.readFirst) {
        readingRef.current = true;
        setReading(true);
        const brailleText = t.readFirst.map((c) => cellToUnicode(c)).join("");
        onAnnounce({ channel: "task", text: promptText, voice: false });
        armAutoplay(promptText, () =>
          onAnnounce({ channel: "status", text: tx.aufgabe.liesBrailleZeile, brailleText }),
        );
        return () => stopPlayback();
      }
      if (t.bordun && !paused) stopBordunRef.current = playBordun(note("c", 3, "ganze"));
      if (t.free) {
        onAnnounce({ channel: "task", text: promptText });
        return () => stopBordunRef.current?.();
      }
      onAnnounce({ channel: "task", text: promptText, voice: false });
      armAutoplay(promptText, () => replayTarget(t.instrument));
      return () => stopPlayback();
    }
    if (t.kind === "build" || t.kind === "sandbox") {
      onAnnounce({ channel: "task", text: promptText });
      return () => stopPlayback();
    }
    const hasSound = (t.kind === "choice" && t.chord) || ("melody" in t && t.melody);
    if (hasSound) {
      onAnnounce({ channel: "task", text: promptText, voice: false });
      armAutoplay(promptText, () => startPlayback(t));
      return () => stopPlayback();
    }
    onAnnounce({ channel: "task", text: promptText });
    return () => stopPlayback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [etappe.id, round, songPick, lineIdx, mastered]);

  // Fokus auf die Übungsfläche (nur wenn frei) — pro Aufgabe einmal.
  useEffect(() => {
    if (task && mayStealFocus()) areaRef.current?.focus({ preventScroll: true });
  }, [task]);

  const startPlayback = (t: KlangTask | null) => {
    if (!t || paused) return;
    if (t.kind === "play") {
      replayTarget(t.instrument);
      return;
    }
    // Akkord (gleichzeitig, §4.7): Intervalle/Dreiklänge — chord2 folgt zum Vergleich.
    if (t.kind === "choice" && t.chord) {
      const inst = t.instrument ?? instrument;
      playChord(t.chord, inst);
      if (t.chord2) window.setTimeout(() => playChord(t.chord2!, inst), 1300);
      return;
    }
    if (!("melody" in t) || !t.melody) return;
    const inst = t.kind === "choice" && t.instrument ? t.instrument : instrument;
    const q = t.kind === "choice" ? t.quarterSeconds : undefined;
    // Zweizeilig (staff2): erste Melodie = rechte Hand, zweite = linke Hand — je
    // klingende Hand hervorheben. Sonst wie gehabt (Vergleichs-Hören klärt nur die
    // erste Zeile hervor).
    const grand = t.kind === "choice" && !!t.staff2;
    setPlaying(true);
    setPlayingHand(grand ? "rh" : null);
    playMelody(t.melody, {
      instrument: inst,
      quarterSeconds: q,
      onEvent: (i) => setHighlight(i),
      onDone: () => {
        // Vergleichs-Hören / linke Hand: zweite Melodie direkt anschließen.
        const m2 = t.kind === "choice" ? t.melody2 : undefined;
        if (m2) {
          const inst2 = (t.kind === "choice" && t.instrument2) || instrument;
          setPlayingHand(grand ? "lh" : null);
          setHighlight(null);
          window.setTimeout(() => {
            playMelody(m2, {
              instrument: inst2,
              onEvent: (i) => (grand ? setHighlight(i) : setHighlight(null)),
              onDone: () => {
                setHighlight(null);
                setPlayingHand(null);
                setPlaying(false);
              },
            });
          }, 350);
        } else {
          setHighlight(null);
          setPlayingHand(null);
          setPlaying(false);
        }
      },
    });
  };

  // Eine einzelne Hand (RH/LH) allein anspielen - für den Hand-Fokus (Alt+Q).
  const playHand = (m: Melody, hand: "rh" | "lh") => {
    if (paused) return;
    stopPlayback();
    setPlaying(true);
    setPlayingHand(hand);
    playMelody(m, {
      instrument,
      onEvent: (i) => setHighlight(i),
      onDone: () => {
        setHighlight(null);
        setPlayingHand(null);
        setPlaying(false);
      },
    });
  };

  /** Alt+Q: Hand-Fokus umschalten (beide · rechts · links) und die Hand anspielen. */
  const cycleHandFocus = () => {
    const t = task;
    const isGrand = !!t && t.kind === "choice" && !!t.staff && !!t.staff2;
    if (!isGrand) {
      onAnnounce({
        channel: "status",
        text: tx.aufgabe.handNurKlavier,
      });
      return;
    }
    const order = HAND_FOCUS_ORDER;
    const next = order[(order.indexOf(handFocusRef.current) + 1) % order.length];
    handFocusRef.current = next;
    setHandFocus(next);
    onAnnounce({ channel: "status", text: `${handFocusLabel(next)}.` });
    const tc = t as ChoiceTask;
    if (next === "rh" && tc.melody) playHand(tc.melody, "rh");
    else if (next === "lh" && tc.melody2) playHand(tc.melody2, "lh");
    else startPlayback(t);
  };

  // --- play: Nachspiel-Klaviatur (D F G H J K L, Pfeil = Oktave) --------------------
  const pickTone = (pool?: ToneName[]): ToneName => {
    const p = pool && pool.length ? pool : (["c", "d", "e", "g", "a"] as ToneName[]);
    return p[Math.floor(Math.random() * p.length)];
  };

  /** Eine Nachspiel-Runde vorbereiten: Soll-Tonfolge setzen, Index/Oktave reset. */
  const setupPlayRound = (t: PlayTask) => {
    if (t.memory) {
      if (memorySeqRef.current.length === 0)
        memorySeqRef.current = Array.from({ length: t.startLen ?? 2 }, () =>
          note(pickTone(t.pool), 4, "viertel"),
        );
      playTargetRef.current = memorySeqRef.current;
      setMemoryLen(memorySeqRef.current.length);
    } else {
      playTargetRef.current = t.melody.events.filter((e) => e.kind === "note") as MusicNote[];
    }
    playIdxRef.current = 0;
    setPlayIdx(0);
    playOctaveRef.current = 4;
    setPlayOctave(4);
  };

  /** Die aktuelle Soll-Tonfolge (erneut) vorspielen. */
  const replayTarget = (inst?: string) => {
    if (paused) return;
    const seq = playTargetRef.current;
    if (!seq.length) return;
    setPlaying(true);
    playMelody(
      { events: seq },
      {
        instrument: (inst as typeof instrument) || instrument,
        onEvent: (i) => setHighlight(i),
        onDone: () => {
          setHighlight(null);
          setPlaying(false);
        },
      },
    );
  };

  /** Eine Taste der Nachspiel-Klaviatur gedrückt: Ton klingt sofort, dann prüfen. */
  const PENTA_TONES: ToneName[] = ["c", "d", "e", "g", "a"];
  /** Lese-Konzert: „Fertig gelesen" — Zellen ausblenden, aus dem Gedächtnis spielen. */
  const finishReading = () => {
    if (!readingRef.current) return;
    readingRef.current = false;
    setReading(false);
    onAnnounce({
      channel: "status",
      text: tx.spielen.nachLesen,
    });
    if (mayStealFocus()) areaRef.current?.focus({ preventScroll: true });
  };

  const onPlayNote = (tone: ToneName) => {
    if (!task || task.kind !== "play" || paused || mastered || answered !== null) return;
    if (readingRef.current) return; // Lese-Konzert: erst lesen, dann spielen
    // Spielwiese: nur Pentatonik-Töne klingen (kein falscher Ton über dem Bordun).
    if (task.free && !PENTA_TONES.includes(tone)) return;
    const played = note(tone, playOctaveRef.current, "viertel");
    playTone(played, task.instrument ?? instrument, 0.5); // eigene Eingabe hörbar (Regel 9)
    // Klang-Spielwiese: kein Soll, kein falscher Ton — nur zählen bis zum Häkchen.
    if (task.free) {
      freeTapsRef.current += 1;
      setFreeTaps(freeTapsRef.current);
      const target = task.targetTaps ?? 30;
      if (freeTapsRef.current === target) {
        onAnnounce({
          channel: "status",
          text: tx.spielen.freiGeschafft(target),
        });
        setAnswered(-1);
        stopBordunRef.current?.();
        stopBordunRef.current = null;
        // Erst die Ansage wirken lassen, DANN werten — die „Geschafft"-Ansage
        // des finishTask würde sie sonst im selben Tick überschreiben.
        const key = task.key;
        window.setTimeout(() => finishTask(true, key, { stars: 0, masteredOverride: true }), 1400);
      }
      return;
    }
    const target = playTargetRef.current;
    const cur = target[playIdxRef.current];
    if (cur && midi(played) === midi(cur)) {
      playIdxRef.current += 1;
      setPlayIdx(playIdxRef.current);
      if (playIdxRef.current >= target.length) onPlayRoundSuccess();
    } else {
      wrongRef.current = true;
      playErrorSound();
      onAnnounce({
        channel: "alert",
        text: tx.spielen.falscherTon(
          toneName(played.tone, nameStyle),
          cur ? toneName(cur.tone, nameStyle) : tx.spielen.nichtsMehr,
        ),
      });
      if (task.memory) {
        endMemoryRun();
      } else {
        playIdxRef.current = 0;
        setPlayIdx(0);
        window.setTimeout(() => replayTarget(task.instrument), 900);
      }
    }
  };

  const changePlayOctave = (delta: number) => {
    if (!task || task.kind !== "play" || paused || mastered) return;
    const next = Math.max(3, Math.min(6, playOctaveRef.current + delta));
    if (next === playOctaveRef.current) return;
    playOctaveRef.current = next;
    setPlayOctave(next);
    sprich(`${OCTAVE_LABELS[next]}.`);
  };

  const onPlayRoundSuccess = () => {
    if (!task || task.kind !== "play") return;
    playWordDone();
    if (task.memory) {
      memoryBestRef.current = Math.max(memoryBestRef.current, memorySeqRef.current.length);
      onAnnounce({
        channel: "status",
        text: tx.spielen.memoryWeiter(memorySeqRef.current.length),
      });
      memorySeqRef.current = [...memorySeqRef.current, note(pickTone(task.pool), 4, "viertel")];
      setMemoryLen(memorySeqRef.current.length);
      playTargetRef.current = memorySeqRef.current;
      playIdxRef.current = 0;
      setPlayIdx(0);
      playOctaveRef.current = 4;
      setPlayOctave(4);
      window.setTimeout(() => replayTarget(task.instrument), 900);
    } else {
      const clean = !wrongRef.current;
      // Lese-Konzert: Soll-Fassung zur Kontrolle anspielen; sauber = Abzeichen.
      if (task.readFirst) {
        window.setTimeout(() => replayTarget(task.instrument), 700);
        if (clean) onBadge?.({ kind: "lesekonzert" });
      }
      onAnnounce({ channel: "status", text: clean ? tx.spielen.genauRichtig : tx.spielen.fertig });
      setAnswered(-1);
      handleDone(clean, task.key);
    }
  };

  /** Ein Memory-Lauf endet (falscher Ton): Bestlänge werten, Sterne über die Länge. */
  const endMemoryRun = () => {
    if (!task || task.kind !== "play") return;
    setAnswered(-1);
    const best = memoryBestRef.current;
    const stars = best >= 8 ? 3 : best >= 6 ? 2 : best >= 4 ? 1 : 0;
    onAnnounce({
      channel: "status",
      text: tx.spielen.memoryEnde(best),
    });
    replayTarget(task.instrument);
    window.setTimeout(() => {
      const willMaster = best >= 4 && masteryRef.current.window.length + 1 >= MASTERY_MIN_ATTEMPTS;
      memorySeqRef.current = [];
      finishTask(true, task.key, { stars, masteredOverride: willMaster });
    }, 1600);
  };

  // „Geschafft"-Ansage: sternlose Kapitel (Spielwiese/Komponier) ohne
  // Sterne-Zahl — „0 von 3 Sternen" klänge nach Misserfolg. Und „Als Nächstes"
  // statt „Jetzt frei": in Klangpunkte ist nie etwas verschlossen.
  const masteredText = (stars: number): string =>
    (noStars || stars <= 0 ? tx.geschafft.geschafft : tx.geschafft.mitSternen(stars)) +
    (nextTitle ? tx.geschafft.alsNaechstesAnsage(nextTitle) : "");

  // Alt+W — Aufgabe erneut ansagen + anspielen; auf „Geschafft" das Ergebnis.
  const prevRepeatRef = useRef(0);
  useEffect(() => {
    if (repeatNonce === 0 || repeatNonce === prevRepeatRef.current) return;
    prevRepeatRef.current = repeatNonce;
    if (mastered) {
      disarmAutoplay();
      onAnnounce({
        channel: "status",
        text: masteredText(lastStars || bestStarsSoFar),
      });
      return;
    }
    if (task) {
      // Bei fokussierter Hand nur diese wiederholen (Alt+Q), sonst alles.
      const tc = task.kind === "choice" ? (task as ChoiceTask) : null;
      const focus = handFocusRef.current;
      const play =
        tc?.staff2 && focus === "rh" && tc.melody
          ? () => playHand(tc.melody!, "rh")
          : tc?.staff2 && focus === "lh" && tc.melody2
            ? () => playHand(tc.melody2!, "lh")
            : () => startPlayback(task);
      // Ansage in die Live-Region (voice:false) — gesprochen + danach angespielt
      // über armAutoplay, so folgt der Ton exakt auf das Vorlesen.
      onAnnounce({ channel: "task", text: task.prompt, voice: false });
      armAutoplay(task.prompt, play);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repeatNonce]);

  // Alt+Q - Hand-Fokus umschalten (nur zweizeilige Klavier-Aufgaben).
  // ★ 18.10.2026 von Alt + S hierher: Alt + S ist jetzt überall „Meine Statistik".
  const prevHandSwitchRef = useRef(0);
  useEffect(() => {
    if (handSwitchNonce === 0 || handSwitchNonce === prevHandSwitchRef.current) return;
    prevHandSwitchRef.current = handSwitchNonce;
    if (!paused && !mastered) cycleHandFocus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handSwitchNonce]);

  // Alt+E — Fokus in die Übungsfläche.
  useEffect(() => {
    if (focusInputNonce > 0 && !paused) areaRef.current?.focus({ preventScroll: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusInputNonce]);

  // Alt+M — Klangpunkte hat keine „Meine Tasten"-Legende; auf die
  // Zeichenliste verweisen statt stumm zu bleiben.
  const prevKeysRef = useRef(0);
  useEffect(() => {
    if (focusKeysNonce === 0 || focusKeysNonce === prevKeysRef.current) return;
    prevKeysRef.current = focusKeysNonce;
    onAnnounce({
      channel: "status",
      // Am Mac „Wahl und L" (18.10.2026).
      text: altAnzeige(tx.aufgabe.zeichenlisteHinweis),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusKeysNonce]);

  // Pause stoppt die Wiedergabe — und wird ANGESAGT (wie in Punktgenau):
  // ohne Rückmeldung wirkt die stummgeschaltete App für ein blindes Kind tot.
  const prevPausedRef = useRef(false);
  useEffect(() => {
    if (paused === prevPausedRef.current) return;
    prevPausedRef.current = paused;
    if (paused) {
      stopPlayback();
      setPlaying(false);
      setHighlight(null);
      onAnnounce(announcePaused());
    } else if (task && !mastered) {
      onAnnounce({ channel: "task", text: tx.aufgabe.weiter(task.prompt) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused]);

  // --- Ergebnis verbuchen -----------------------------------------------------------
  const starsFromMastery = (m: LevelMastery): number => {
    const w = m.window;
    if (!w.length) return 1;
    const acc = w.filter((a) => a.correct).length / w.length;
    return acc >= 0.97 ? 3 : acc >= 0.92 ? 2 : 1;
  };

  // Kern von „Ergebnis verbuchen" — OHNE eigene Verzögerung. commitCell ruft
  // das für die letzte Zelle eines write-Tasks erst NACH der Grün-Pause auf
  // (s. u.), damit der „Geschafft"-Wechsel die letzte Zelle nicht verschluckt.
  const finishTask = (
    wasCorrect: boolean,
    promptKey: string,
    opts?: { stars?: number; masteredOverride?: boolean },
  ) => {
    // Tages-Mix: nicht werten, nicht speichern, kein „gemeistert" — nur die
    // Bilanz melden und die nächste Aufgabe ziehen.
    if (mixRef.current) {
      onMixRef.current?.(wasCorrect);
      setRound((r) => r + 1);
      return;
    }
    const m1 = recordAttempt(masteryRef.current, promptKey, wasCorrect);
    masteryRef.current = m1;
    const masteredNow =
      !everMasteredRef.current && (opts?.masteredOverride ?? isLevelMastered(m1));
    const stars = masteredNow ? (opts?.stars ?? starsFromMastery(m1)) : 0;
    onResult({
      correct: wasCorrect,
      mastery: m1,
      // Musik hat keine adaptive Stufe — der Aufrufer ignoriert dieses Feld.
      stufe: { stufe: 5, window: [] },
      masteredNow,
      stars,
    });
    if (masteredNow) {
      everMasteredRef.current = true;
      setLastStars(stars);
      setMastered(true);
      playLevelJingle();
      onAnnounce({ channel: "status", text: masteredText(stars) });
      return;
    }
    setRound((r) => r + 1);
  };

  // Choice/Tap: sofort werten — die nächste Frage kommt trotzdem erst nach
  // einer kurzen Lesepause (das Feedback bleibt bis dahin sichtbar).
  const handleDone = (wasCorrect: boolean, promptKey: string) => {
    window.setTimeout(() => finishTask(wasCorrect, promptKey), wasCorrect ? 650 : 1200);
  };

  // --- write: Akkord-Eingabe ----------------------------------------------------------
  const commitCell = (cell: Cell) => {
    if (!task || task.kind !== "write" || paused || answered !== null) return;
    const expect = task.cells[pos];
    if (cell === expect) {
      setWrongFlash(null);
      const tone = task.cellTones[pos];
      if (tone) playTone(tone, instrument);
      else playCorrectTick();
      const nextPos = pos + 1;
      setPos(nextPos); // auch die letzte Zelle rückt vor → zeigt sie grün statt leer
      if (nextPos >= task.cells.length) {
        playWordDone();
        onAnnounce({ channel: "status", text: wrongRef.current ? tx.schreiben.fertig : tx.schreiben.genauRichtig });
        setAnswered(-1); // Eingabe schließen (Zelle bleibt sichtbar grün)
        const wasClean = !wrongRef.current;
        // Letzte Zelle erst kurz grün stehen lassen (wie AUTO_NEXT_MS in den
        // Schrift-Bereichen), DANN erst werten/weiterschalten — sonst würde
        // ein sofortiger „Geschafft"-Wechsel die grüne Zelle nie zeigen.
        // Sauberes Diktat = Abzeichen-Ereignis (§12).
        if (task.dictation && wasClean) onBadge?.({ kind: "diktat" });
        window.setTimeout(
          () => {
            finishTask(wasClean, task.key);
            // Lieder-Werkstatt: zur nächsten Zeile bzw. zurück zur Auswahl.
            if (isSongEtappe && songPick) {
              if (lineIdx + 1 < songPick.lines.length) {
                window.setTimeout(() => setLineIdx(lineIdx + 1), 700);
              } else {
                onAnnounce({ channel: "status", text: tx.aufgabe.songGanzGeschafft(songPick.title) });
                onBadge?.({ kind: "song", id: songPick.id });
                setSongPick(null);
                setLineIdx(0);
              }
            }
          },
          wasClean ? 650 : 1200,
        );
      }
    } else {
      wrongRef.current = true;
      playErrorSound();
      setWrongFlash(expect);
      const label = task.cellLabels[pos];
      onAnnounce({
        channel: "alert",
        text:
          expect === BLANK
            ? `${label}.`
            : `${label}: ${dotsLabel(expect)}.`,
        brailleText: expect === BLANK ? undefined : cellToUnicode(expect),
      });
    }
  };

  // Umschalt-Taste (gedrückt halten): Lösung der aktuellen Zelle einblenden und
  // ihre Tasten ansagen — dieselbe Hilfe wie in den Schrift-Bereichen.
  const showHint = () => {
    if (!task || task.kind !== "write" || paused || answered !== null || mastered) return;
    setHint(true);
    const expect = task.cells[pos];
    if (expect === undefined) return;
    if (expect === BLANK) {
      onAnnounce({ channel: "status", text: tx.schreiben.aktuelleStelleLeertaste });
    } else {
      onAnnounce(announceCellHint(expect, keyLabelsForCell(expect)));
    }
  };

  // --- build: Takt-Baumeister (§4.4) --------------------------------------------
  const beatsPerBar = (sig: [number, number]) => sig[0] * (4 / sig[1]);
  const buildSum = () => {
    const t = task as BuildTask;
    const cap = beatsPerBar(t.timeSig);
    let sum = 0;
    for (const c of buildCellsRef.current) {
      const r = readCell(c, cap - sum);
      if (r) sum += r.beats;
    }
    return sum;
  };

  /** Schlagsumme kindgerecht ansagen: Achteltakte zählen in Achteln (keine
   *  „0.5"-Brüche), sonst in Vierteln; halbe Schläge als Wort („anderthalb").
   *  singular bis einschließlich 1 („ein halber Schlag", „1 Schlag"). */
  const buildBeats = (beats: number) => {
    const u = beatUnitFor((task as BuildTask).timeSig);
    const inUnits = beats * u.factor;
    const singular = inUnits <= 1 + 1e-9;
    return {
      count: beatsText(inUnits),
      singular,
      /** Nominativ: „… fehlen noch 2 Schläge" */
      nom: singular ? u.one : tx.takt.nominativ(u.many),
      /** Dativ: „Zusammen 2 von 3 Schlägen" */
      dat: singular ? u.one : u.many,
    };
  };

  const commitBuildCell = (cell: Cell) => {
    if (!task || task.kind !== "build" || paused || answered !== null || mastered) return;
    const cap = beatsPerBar(task.timeSig);
    const sum = buildSum();
    const r = readCell(cell, cap - sum);
    if (!r) {
      playErrorSound();
      onAnnounce({ channel: "alert", text: tx.takt.keineZelle });
      return;
    }
    buildCellsRef.current = [...buildCellsRef.current, cell];
    setBuildCells(buildCellsRef.current);
    if (r.kind === "note") playTone(note(r.tone!, 4, r.value), instrument, 0.5);
    else playCorrectTick();
    const label =
      r.kind === "note"
        ? `${toneName(r.tone!, "buchstaben")}, ${VALUE_LABELS[r.value]}`
        : `${tx.takt.pauseAus(VALUE_LABELS[r.value], REST_LABELS[r.value])}`;
    const ambi = r.ambiguous ? tx.takt.alsGelesen(VALUE_LABELS[r.value]) : "";
    const capB = buildBeats(cap);
    onAnnounce({
      channel: "status",
      text: tx.takt.zusammen(label, ambi, buildBeats(buildSum()).count, capB.count, capB.dat),
    });
  };

  const backspaceBuild = () => {
    if (!task || task.kind !== "build" || !buildCellsRef.current.length) return;
    buildCellsRef.current = buildCellsRef.current.slice(0, -1);
    setBuildCells(buildCellsRef.current);
    const b = buildBeats(buildSum());
    onAnnounce({ channel: "status", text: tx.takt.letzteGeloescht(b.count, b.nom) });
  };

  const finishBuild = () => {
    if (!task || task.kind !== "build" || paused || answered !== null || mastered) return;
    const cap = beatsPerBar(task.timeSig);
    const sum = buildSum();
    const events = readSequence(buildCellsRef.current, task.timeSig);
    const notesN = events.filter((e) => e.kind === "note").length;
    const hasRest = events.some((e) => e.kind === "rest");
    const hasDot = false; // Punktierung ist in der Grundeingabe (noch) nicht vorgesehen
    if (Math.abs(sum - cap) > 1e-9) {
      wrongRef.current = true;
      playErrorSound();
      const diff = cap - sum;
      const b = buildBeats(Math.abs(diff));
      onAnnounce({
        channel: "alert",
        text:
          diff > 0
            ? tx.takt.fehlen(b.singular, b.count, b.nom)
            : tx.takt.zuViel(b.singular, b.count, b.nom),
      });
      return;
    }
    const c = task.constraints;
    if (c?.minNotes && notesN < c.minNotes) {
      wrongRef.current = true;
      playErrorSound();
      onAnnounce({ channel: "alert", text: tx.takt.mindestensNoten(c.minNotes) });
      return;
    }
    if (c?.mustInclude === "rest" && !hasRest) {
      wrongRef.current = true;
      playErrorSound();
      onAnnounce({ channel: "alert", text: tx.takt.mindestensPause });
      return;
    }
    void hasDot;
    // Gültig: das eigene Werk hören, dann werten. Gültiger Takt = Abzeichen (§12).
    playWordDone();
    onBadge?.({ kind: "takt" });
    onAnnounce({ channel: "status", text: wrongRef.current ? tx.takt.voll : tx.takt.vollSauber });
    playMelody({ timeSig: task.timeSig, events }, { instrument });
    setAnswered(-1);
    const wasClean = !wrongRef.current;
    window.setTimeout(() => finishTask(wasClean, task.key), 1400);
  };

  // --- sandbox: Komponier-Werkstatt (§4.5) --------------------------------------
  const commitSandCell = (cell: Cell) => {
    if (!task || task.kind !== "sandbox" || paused || mastered) return;
    sandCellsRef.current = [...sandCellsRef.current, cell];
    setSandCells(sandCellsRef.current);
    if (cell === BLANK) {
      playCorrectTick();
      return;
    }
    const r = readCell(cell, Infinity);
    if (r?.kind === "note") playTone(note(r.tone!, 4, r.value), instrument, 0.5);
    else playCorrectTick();
  };
  const backspaceSand = () => {
    if (!sandCellsRef.current.length) return;
    sandCellsRef.current = sandCellsRef.current.slice(0, -1);
    setSandCells(sandCellsRef.current);
  };
  const playSandbox = () => {
    const events = readSequence(sandCellsRef.current);
    if (!events.length) {
      onAnnounce({ channel: "status", text: tx.werkstatt.nochNichtsGeschrieben });
      return;
    }
    setPlaying(true);
    playMelody({ events }, { instrument, onEvent: (i) => setHighlight(i), onDone: () => { setHighlight(null); setPlaying(false); } });
  };
  const clearSandbox = () => {
    stopPlayback();
    sandCellsRef.current = [];
    setSandCells([]);
    onAnnounce({ channel: "status", text: tx.werkstatt.geleert });
  };
  const saveWerk = () => {
    if (!task || task.kind !== "sandbox") return;
    // ★★★ Der Riegel, der `disabled` am Knopf ersetzt (Bauart §3). Und er sagt,
    // WARUM nichts passiert - ein Knopf, der stumm nichts tut, ist schlimmer
    // als einer, der ausgeschaltet ist.
    if (werke.length >= 5) {
      onAnnounce({
        channel: "status",
        text: tx.werkstatt.schonFuenf,
      });
      return;
    }
    if (!sandCellsRef.current.length) {
      onAnnounce({ channel: "status", text: tx.werkstatt.nochNichtsSpeichern });
      return;
    }
    const name = werkName.trim() || tx.werkstatt.meinWerk(werke.length + 1);
    const firstEver = werke.length === 0;
    onSaveWerk?.({ name, cells: [...sandCellsRef.current], createdAt: Date.now() });
    onAnnounce({
      channel: "status",
      text: tx.werkstatt.gespeichert(name, Math.min(werke.length + 1, 5)),
    });
    setWerkName("");
    if (firstEver) {
      setAnswered(-1);
      finishTask(true, task.key, { stars: 0, masteredOverride: true });
    }
  };

  const chord = useBrailleChord({
    enabled:
      !!task &&
      (task.kind === "write" || task.kind === "build" || task.kind === "sandbox") &&
      !paused &&
      answered === null &&
      !mastered,
    onCommit: (cell) =>
      task?.kind === "build"
        ? commitBuildCell(cell)
        : task?.kind === "sandbox"
          ? commitSandCell(cell)
          : commitCell(cell),
    onSpace: () =>
      task?.kind === "build"
        ? commitBuildCell(BLANK)
        : task?.kind === "sandbox"
          ? commitSandCell(BLANK)
          : commitCell(BLANK),
  });

  // --- tap: Rhythmus klopfen ------------------------------------------------------------
  const onTapKey = (e: React.KeyboardEvent) => {
    if (!task || task.kind !== "tap" || paused || mastered) return;
    if (e.code !== "Space") return;
    e.preventDefault();
    if (e.repeat) return;
    registerTap();
  };
  // Ein Schlag - von der Leertaste oder vom Klopf-Knopf (Handy).
  const registerTap = () => {
    if (!task || task.kind !== "tap" || paused || mastered) return;
    const now = performance.now();
    // Lange Denkpause = neuer Anlauf.
    if (tapTimes.current.length && now - tapTimes.current[tapTimes.current.length - 1] > 2500) {
      tapTimes.current = [];
    }
    tapTimes.current.push(now);
    setTapCount(tapTimes.current.length);
    playTone({ kind: "note", tone: "g", octave: 4, value: "achtel" }, instrument, 0.15);
    if (tapTimes.current.length === task.pattern.length) {
      const gaps: number[] = [];
      for (let i = 1; i < tapTimes.current.length; i++)
        gaps.push(tapTimes.current[i] - tapTimes.current[i - 1]);
      let ok: boolean;
      let failText: string;
      if (task.pulse) {
        // Puls-Modus: nicht das Muster zählt, sondern die Gleichmäßigkeit —
        // mittlere Abweichung unter 22 % des Schlagabstands über ≥ 6 Schläge.
        const avg = gaps.reduce((a, b) => a + b, 0) / gaps.length;
        const dev = gaps.reduce((a, g) => a + Math.abs(g - avg), 0) / gaps.length;
        ok = gaps.length >= 6 && avg > 0 && dev / avg < 0.22;
        failText = tx.tap.puls;
      } else {
        const min = Math.min(...gaps);
        const tapped = gaps.map((g) => (g < min * 1.5 ? "kurz" : "lang"));
        // Der letzte Schlag hat keine messbare Länge — verglichen wird das Muster
        // ZWISCHEN den Schlägen (pattern ohne letztes Element).
        const wanted = task.pattern.slice(0, -1);
        ok = tapped.length === wanted.length && tapped.every((v, i) => v === wanted[i]);
        failText = tx.tap.fast(
          task.pattern.map((p) => (p === "kurz" ? tx.tap.kurz : tx.tap.lang)).join(", "),
        );
      }
      tapTimes.current = [];
      setTapCount(0);
      if (ok) {
        playWordDone();
        onAnnounce({ channel: "status", text: task.pulse ? tx.tap.genauImPuls : tx.tap.genauImTakt });
        setAnswered(-1);
        handleDone(true, task.key);
      } else {
        playErrorSound();
        onAnnounce({ channel: "alert", text: failText });
        wrongRef.current = true;
        window.setTimeout(() => startPlayback(task), 900);
      }
    }
  };

  // --- choice ------------------------------------------------------------------------------
  /** Der Satz zum Ergebnis - EINE Quelle für die Ansage und den Namen am Fokus. */
  const choiceErgebnis = (t: ChoiceTask, idx: number) =>
    idx === t.correctIndex
      ? tx.wahl.richtig
      : (t.explain ?? tx.wahl.richtigWaere(t.choices[t.correctIndex]));
  const answer = (idx: number) => {
    if (!task || task.kind !== "choice" || answered !== null || paused || mastered) return;
    setAnswered(idx);
    const ok = idx === task.correctIndex;
    if (ok) {
      playCorrectTick();
      onAnnounce({ channel: "status", text: choiceErgebnis(task, idx) });
    } else {
      playErrorSound();
      onAnnounce({ channel: "alert", text: choiceErgebnis(task, idx) });
    }
    handleDone(ok, task.key);
  };

  const onChoiceKey = (e: React.KeyboardEvent) => {
    if (!task || task.kind !== "choice") return;
    const n = Number(e.key);
    if (n >= 1 && n <= task.choices.length) {
      e.preventDefault();
      answer(n - 1);
    }
  };

  // --- Umschalter (Instrument / Notennamen) — mit Sprach-Ansage -----------------------------
  const changeInstrument = (v: string) => {
    const inst = INSTRUMENTS.find((i) => i === v) ?? "klavier";
    setInstrument(inst);
    sprich(`${INSTRUMENT_LABELS[inst]}.`);
    // Klangprobe der neuen Stimme
    window.setTimeout(
      () => playTone({ kind: "note", tone: "c", octave: 4, value: "viertel" }, inst, 0.6),
      350,
    );
  };

  const toggleNames = () => {
    const next = nameStyle === "buchstaben" ? "solmisation" : "buchstaben";
    setNameStyle(next);
    const [a, b, c] = (["c", "d", "e"] as ToneName[]).map((x) =>
      toneName(x, next === "solmisation" ? "solmisation" : "buchstaben"),
    );
    sprich(tx.kopf.namenAn(a, b, c));
  };

  const toggleRhythm = () => {
    const next = !rhythmSilben;
    setRhythmSilben(next);
    sprich(next ? tx.kopf.rhythmusAn : tx.kopf.rhythmusAus);
  };

  // Fortschritts-Ring im Kopf (statt der Stufe der Schrift-Bereiche).
  const onProgressRef = useRef(onProgress);
  onProgressRef.current = onProgress;
  useEffect(() => {
    const p = mastered ? 1 : masteryProgress(masteryRef.current);
    const n = Math.min(masteryRef.current.window.length, MASTERY_MIN_ATTEMPTS);
    const left = Math.max(0, MASTERY_MIN_ATTEMPTS - masteryRef.current.window.length);
    onProgressRef.current({
      number: n,
      value: p,
      caption: tx.fortschritt.caption,
      ariaLabel: tx.fortschritt.aria(n, MASTERY_MIN_ATTEMPTS, Math.round(p * 100)),
      round: {
        done: n,
        total: MASTERY_MIN_ATTEMPTS,
        mastered,
        approx: true,
        label: mastered
          ? tx.fortschritt.rundeGeschafft
          : tx.fortschritt.runde(n, MASTERY_MIN_ATTEMPTS, left),
      },
    });
  }, [round, mastered]);

  // --- Anzeige-Hilfen ------------------------------------------------------------------------
  // staff:null heißt BEWUSST keine Notenzeile (reine Hör-Aufgabe) — nur ein
  // fehlendes staff-Feld fällt auf die Melodie zurück.
  const hasStaffKinds = !!task && (task.kind === "choice" || task.kind === "write");
  const staffTask = hasStaffKinds
    ? (task as { staff?: Melody | null; melody?: Melody })
    : null;
  const staff = !staffTask
    ? null
    : staffTask.staff !== undefined
      ? (staffTask.staff ?? null)
      : (staffTask.melody ?? null);
  const showStaffBraille =
    hasStaffKinds && (task as { staffBraille?: boolean }).staffBraille !== false;
  const showCells = hasStaffKinds
    ? ((task as { showCells?: Cell[] }).showCells ?? null)
    : null;
  // Zweizeilige Klavier-Ansicht: linke Hand (Bassschlüssel). Nur wenn BEIDE
  // Zeilen da sind, zeigt der Runner den GrandStaff statt einer Zeile.
  const staff2 = hasStaffKinds
    ? ((task as { staff2?: Melody | null }).staff2 ?? null)
    : null;
  const isGrand = !!staff && !!staff2;

  // --- Geschafft-Ansicht ------------------------------------------------------------------------
  if (mastered) {
    // Beim Wiederöffnen eines gemeisterten Kapitels ist lastStars 0 — dann
    // zählt der gespeicherte Bestwert. Sternlose Kapitel (Spielwiese/
    // Komponier) sprechen nie von Sternen. „Weiter üben" lässt jedes Kapitel
    // erneut üben (Sterne können nur wachsen) — wie in Punktgenau.
    const shownStars = lastStars || bestStarsSoFar;
    return (
      <div className="card space-y-4 p-6 text-center">
        <p className="text-lg font-semibold text-ink">
          <span aria-hidden="true">🎵 </span>
          {noStars || shownStars <= 0 ? tx.geschafft.geschafft : tx.geschafft.mitSternen(shownStars)}
        </p>
        {nextTitle && <p className="text-sm text-ink-muted">{tx.geschafft.alsNaechstesKarte(nextTitle)}</p>}
        <div className="flex flex-wrap justify-center gap-2">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              setMastered(false);
              setRound((r) => r + 1);
            }}
          >
            {tx.geschafft.weiterUeben}
          </button>
          {onNext && (
            <button type="button" className="btn-primary" onClick={onNext}>
              {tx.geschafft.weiter} <span aria-hidden="true">→</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // --- Lieder-Auswahl (kp14) ----------------------------------------------------------------------
  if (isSongEtappe && !songPick) {
    return (
      <div className="card space-y-5 p-5">
        <p className="text-sm text-ink-muted">{etappe.introDu}</p>
        {(["kinder", "erwachsene"] as const).map((shelf) => (
          <fieldset key={shelf} className="space-y-2">
            <legend className="text-sm font-semibold text-ink">
              {shelf === "kinder" ? tx.lieder.kinder : tx.lieder.erwachsene}
            </legend>
            <div className="flex flex-wrap gap-2">
              {songsForShelf(shelf).map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className="btn-secondary btn-toggle"
                  title={s.origin}
                  onClick={() => {
                    setSongPick(s);
                    setLineIdx(0);
                    sprich(`${s.title}.`);
                  }}
                >
                  {s.title}
                </button>
              ))}
            </div>
          </fieldset>
        ))}
      </div>
    );
  }

  if (!task) return null;

  const songProgress =
    isSongEtappe && songPick ? tx.aufgabe.songZeile(lineIdx + 1, songPick.lines.length) : "";

  return (
    /* ★★★ Die Kennzeichen der gemeinsamen Bauart (§13): `data-aufgabe` an der
       Aufgabe, `data-angabe` an der Angabe, `data-feld` am Antwort-Element.
       Wer sie setzt, bekommt Lesestelle (§6.2) und Fokus-Wächter (§3) ohne
       eine weitere Zeile Code.
       ★ Der Schlüssel ist die Aufgabe selbst: Sie wechselt bei jedem Schritt,
       und genau beim Wechsel kann der Fokus verloren gehen. */
    <div className="card space-y-4 p-5" data-aufgabe={`aufgabe-${task.kind}-${task.prompt}`}>
      {/* Kopf: Lehrtext + Werkzeuge */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="max-w-prose text-sm text-ink-muted">{etappe.introDu}</p>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="btn-secondary btn-toggle"
            onClick={() => (playing ? (stopPlayback(), setPlaying(false), setHighlight(null)) : startPlayback(task))}
            aria-keyshortcuts="Alt+W"
            title={altAnzeige(tx.kopf.anhoerenTitel)}
          >
            <span aria-hidden="true">{playing ? "⏹" : "▶"}</span> {playing ? tx.kopf.stopp : tx.kopf.anhoeren}
          </button>
          <select
            aria-label={tx.kopf.instrument}
            className="rounded-lg border border-hairline bg-surface-raised px-2 py-1.5 text-sm text-ink"
            value={instrument}
            onChange={(e) => changeInstrument(e.target.value)}
          >
            {INSTRUMENTS.map((i) => (
              <option key={i} value={i}>
                {INSTRUMENT_LABELS[i]}
              </option>
            ))}
          </select>
          <button
            type="button"
            className={(nameStyle === "solmisation" ? "btn-primary" : "btn-secondary") + " btn-toggle"}
            aria-pressed={nameStyle === "solmisation"}
            onClick={toggleNames}
            title={tx.kopf.namenTitel(tonListe("solmisation"), tonListe("buchstaben"))}
          >
            {tx.kopf.namenKnopf}
          </button>
          <button
            type="button"
            className={(rhythmSilben ? "btn-primary" : "btn-secondary") + " btn-toggle"}
            aria-pressed={rhythmSilben}
            onClick={toggleRhythm}
            title={tx.kopf.rhythmusTitel}
          >
            {tx.kopf.rhythmusKnopf}
          </button>
          {isSongEtappe && songPick && (
            <button
              type="button"
              className="btn-ghost btn-toggle"
              onClick={() => {
                stopPlayback();
                setSongPick(null);
                sprich(tx.kopf.zurueckLiedauswahl);
              }}
            >
              {tx.kopf.anderesLied}
            </button>
          )}
        </div>
      </div>

      {/* Aufgabe */}
      {/* ★ `data-angabe` (§13): der Anker der Lesestelle. Er bleibt
          `aria-hidden` - angesagt wird die Aufgabe über die Live-Region. */}
      <p className="text-base font-medium text-ink" aria-hidden="true" data-angabe>
        {task.prompt}
        <span className="text-ink-muted">{songProgress}</span>
      </p>

      {/* Notenzeile (dekorativ-parallel; Ansagen laufen über die Live-Region).
          Bei zwei Zeilen (Klavier) der GrandStaff mit Hand-Fokus (Alt+Q). */}
      {isGrand && staff && staff2 ? (
        <div className="rounded-xl border border-hairline bg-surface-raised p-3">
          <GrandStaff
            right={staff}
            left={staff2}
            highlightRight={playingHand === "rh" ? highlight : null}
            highlightLeft={playingHand === "lh" ? highlight : null}
            showBraille={showStaffBraille}
            octaveSigns={(task as { octaveSigns?: boolean }).octaveSigns === true}
            focus={handFocus}
          />
          <p className="mt-2 text-center text-xs text-ink-muted" aria-hidden="true">
            <kbd className="rounded border border-hairline px-1">{altAnzeige("Alt + Q")}</kbd>
            {tx.hand.hinweis(handFocus)}
          </p>
        </div>
      ) : staff ? (
        <div className="rounded-xl border border-hairline bg-surface-raised p-3">
          <NotenZeile
            melody={staff}
            highlightIndex={highlight}
            showBraille={showStaffBraille}
            octaveSigns={(task as { octaveSigns?: boolean }).octaveSigns === true}
          />
        </div>
      ) : null}

      {/* Zusatz-Zellen (z. B. Wertmehrdeutigkeit, Formzeichen) */}
      {showCells && (
        <div className="flex flex-wrap items-center gap-1" aria-hidden="true">
          {showCells.map((c, i) =>
            c === BLANK ? (
              <span key={i} className="w-3" />
            ) : (
              <BrailleCell key={i} cell={c} size={56} />
            ),
          )}
        </div>
      )}

      {/* Antwort-Bereich */}
      {task.kind === "choice" && (
        <div
          role="group"
          /* ★★★ Das Ergebnis steht am FOKUS, nicht nur in der Live-Region
             (29.09.2026). Nach der Wahl bleibt der Fokus auf dem gedrückten
             Knopf - oder, nach einer Zifferntaste, auf dieser Gruppe. Die
             Ansage verdrängt die Braillezeile nur kurz
             ([[reference_live_region_ist_braille_blitzmeldung]]); der Name am
             Fokus steht, bis die nächste Aufgabe kommt. Vorne, damit es auf 40
             Zellen ohne Blättern zu sehen ist; der sichtbare Text bleibt darin
             (WCAG 2.5.3). */
          aria-label={
            answered !== null && answered >= 0
              ? `${choiceErgebnis(task, answered)} ${tx.wahl.antworten}`
              : tx.wahl.antworten
          }
          data-feld="antworten"
          className="flex flex-wrap gap-2"
          onKeyDown={onChoiceKey}
          ref={areaRef}
          tabIndex={-1}
        >
          {task.choices.map((c, i) => (
            <button
              key={i}
              type="button"
              // ★★★ `aria-disabled`, nie `disabled` (Bauart §3). Hier war die
              // Falle besonders nah: Nach der Antwort wurden ALLE Knoepfe
              // ausgeschaltet - auch der, den das Kind gerade gedrueckt hatte
              // und auf dem sein Fokus stand. Er fiel auf `<body>`, und das ist
              // fuer eine Sprachausgabe der Dokumentenanfang.
              // `answer()` verriegelt selbst (`answered !== null` steht dort
              // schon in der ersten Zeile).
              aria-disabled={answered !== null || undefined}
              aria-label={answered === i ? `${choiceErgebnis(task, i)} ${i + 1}. ${c}` : undefined}
              onClick={() => answer(i)}
              className={
                (answered !== null && i === task.correctIndex
                  ? "btn-primary"
                  : answered === i
                    ? "btn-secondary opacity-60"
                    : "btn-secondary") + " btn-toggle"
              }
            >
              {i + 1}. {c}
            </button>
          ))}
        </div>
      )}

      {task.kind === "tap" && (
        <div
          ref={areaRef}
          role="application"
          aria-label={tx.tap.aria(tapCount)}
          data-feld="klopfen"
          tabIndex={0}
          onKeyDown={onTapKey}
          // ★ 29.09.2026: KEIN `outline-none` mehr (hier und an den vier
          // Spielflächen unten). Der Fokus war nur ein Wechsel der Randfarbe -
          // im Windows-Kontrastmodus sieht jeder Rand gleich aus, und sonst
          // blieb ein 2-px-Farbwechsel. Jetzt gilt der Plattform-Umriss aus
          // `index.css` (4,5 px, greift über `tabIndex`); die Randfarbe bleibt
          // als zweites Zeichen. Wächter: tests/klangpunkte-fokus-und-bewegung.test.ts.
          className="rounded-xl border-2 border-dashed border-hairline p-6 text-center focus:border-accent"
        >
          <p className="text-sm text-ink-muted" aria-hidden="true">
            {tx.tap.vor}<strong>{tx.tap.stark}</strong>{tx.tap.nach(tapCount, task.pattern.length)}
          </p>
          <button
            type="button"
            className="btn-primary btn-toggle mt-3"
            onClick={registerTap}
          >
            {tx.tap.knopf(tapCount, task.pattern.length)}
          </button>
        </div>
      )}

      {task.kind === "play" && (
        <div
          ref={areaRef}
          role="application"
          aria-label={
            reading
              ? tx.spielen.ariaLesen
              : tx.spielen.ariaKlaviatur(stammtoene()) +
                (task.free
                  ? tx.spielen.ariaFrei(freeTaps, task.targetTaps ?? 30)
                  : task.memory
                    ? tx.spielen.ariaMemory(memoryLen)
                    : tx.spielen.ariaTon(Math.min(playIdx + 1, playTargetRef.current.length), playTargetRef.current.length))
          }
          data-feld="spielen"
          tabIndex={0}
          onKeyDown={(e) => {
            if (reading) {
              if (e.key === "Enter") {
                e.preventDefault();
                finishReading();
              }
              return;
            }
            if (e.code === "ArrowUp") {
              e.preventDefault();
              changePlayOctave(1);
              return;
            }
            if (e.code === "ArrowDown") {
              e.preventDefault();
              changePlayOctave(-1);
              return;
            }
            const tone = PLAY_KEY_TO_TONE[e.code];
            if (tone) {
              e.preventDefault();
              if (!e.repeat) onPlayNote(tone);
            }
          }}
          className="space-y-3 rounded-xl border-2 border-dashed border-hairline p-4 focus:border-accent"
        >
          {reading && task.readFirst ? (
            <div className="space-y-3">
              <p className="text-sm text-ink-muted" aria-hidden="true">
                {tx.spielen.lesenVor}<strong>{tx.spielen.lesenStark}</strong>{tx.spielen.lesenMitte}
                <kbd className="rounded border border-hairline px-1">⏎ Enter</kbd>{tx.spielen.lesenNach}
              </p>
              <div className="flex flex-wrap items-center gap-1" aria-hidden="true">
                {task.readFirst.map((c, i) =>
                  c === BLANK ? (
                    <span key={i} className="inline-block h-9 w-4" />
                  ) : (
                    <BrailleCell key={i} cell={c} size={56} />
                  ),
                )}
              </div>
              <button type="button" className="btn-primary" onClick={finishReading}>
                {tx.spielen.fertigGelesen} <span aria-hidden="true">→</span>
              </button>
            </div>
          ) : (
          <>
          <p className="text-sm text-ink-muted" aria-hidden="true">
            {task.free ? (
              <>
                {tx.spielen.freiVor}<span className="font-mono">D F G J K</span>
                {tx.spielen.freiNach(freeTaps, task.targetTaps ?? 30)}
              </>
            ) : (
              <>
                {tx.spielen.nachspielenVor}<span className="font-mono">D F G H J K L</span>
                {tx.spielen.nachspielenMitte}
                {task.memory
                  ? tx.spielen.laenge(memoryLen)
                  : tx.spielen.tonVon(Math.min(playIdx + 1, playTargetRef.current.length), playTargetRef.current.length)}{" "}
                · <kbd className="rounded border border-hairline px-1">↑ ↓</kbd>{tx.spielen.oktaveNach(OCTAVE_LABELS[playOctave])}
              </>
            )}
          </p>
          {/* Maus-Hilfsflächen: ohne Tastatur (touch) aria-hidden AUS und
              fokussierbar — sonst kommt VoiceOver per Wischen nie an die
              Töne. Mit Tastatur bleiben sie versteckt: die Bedienung läuft
              dort über den Übungsbereich (D F G H J K L, Pfeile), ein
              zweiter Tab-Stop auf denselben Tönen wäre nur Ballast. */}
          <div className="flex flex-wrap gap-1.5" aria-hidden={touch ? undefined : true}>
            {(task.free ? PLAY_KEYS.filter((k) => PENTA_TONES.includes(k.tone)) : PLAY_KEYS).map((k) => (
              <button
                key={k.code}
                type="button"
                tabIndex={touch ? 0 : -1}
                onClick={() => onPlayNote(k.tone)}
                className="flex min-w-[3rem] flex-col items-center rounded-lg border border-hairline bg-surface-raised px-3 py-2 hover:bg-surface-sunken focus-visible:outline focus-visible:outline-[4.5px] focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <span className="font-mono text-sm font-semibold text-ink">{k.label}</span>
                <span className="text-xs text-ink-muted">{toneName(k.tone, nameStyle)}</span>
              </button>
            ))}
          </div>
          <div className="flex gap-1.5" aria-hidden={touch ? undefined : true}>
            <button type="button" tabIndex={touch ? 0 : -1} className="btn-secondary btn-toggle" onClick={() => changePlayOctave(1)}>
              {tx.spielen.oktaveRauf}
            </button>
            <button type="button" tabIndex={touch ? 0 : -1} className="btn-secondary btn-toggle" onClick={() => changePlayOctave(-1)}>
              {tx.spielen.oktaveRunter}
            </button>
          </div>
          </>
          )}
        </div>
      )}

      {task.kind === "write" && (
        <div
          ref={areaRef}
          role="application"
          aria-label={tx.schreiben.aria(Math.min(pos + 1, task.cells.length), task.cells.length)}
          aria-keyshortcuts="Shift"
          data-feld="notenschreiben"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Shift") showHint();
            chord.onKeyDown(e);
          }}
          onKeyUp={(e) => {
            if (e.key === "Shift") setHint(false);
            chord.onKeyUp(e);
          }}
          onBlur={() => {
            setHint(false);
            chord.onBlur();
          }}
          className="space-y-3 rounded-xl border-2 border-dashed border-hairline p-4 focus:border-accent"
        >
          {task.dictation && (
            <button
              type="button"
              className="btn-primary"
              onClick={() => startPlayback(task)}
            >
              <span aria-hidden="true">🔊</span> {tx.schreiben.nochmalAnhoeren}
            </button>
          )}
          <p className="text-sm text-ink-muted" aria-hidden="true">
            {task.dictation
              ? tx.schreiben.diktat
              : null}
            {!task.dictation && (
              <>
                {tx.schreiben.vor}<span className="font-mono">f d s · j k l</span>{tx.schreiben.mitte(Math.min(pos + 1, task.cells.length), task.cells.length)}<kbd className="rounded border border-hairline px-1">{tx.schreiben.umschalt}</kbd>{tx.schreiben.nach}
              </>
            )}
          </p>
          <div className="flex flex-wrap items-center gap-1.5" aria-hidden="true">
            {task.cells.map((c, i) => {
              // Aktuelle Zelle: bei Fehler das erwartete Zeichen (rot), bei
              // gedrückter Umschalt-Taste die Lösung (Hinweis), sonst leer.
              const revealHint = hint && i === pos && wrongFlash === null;
              if (c === BLANK) {
                return (
                  <span
                    key={i}
                    /* ★ Fläche UND Randfarbe sind hier der einzige Unterschied,
                       die Randdicke bleibt gleich - im Kontrastmodus ist „schon
                       geschrieben" von „noch offen" nicht zu trennen. Über
                       dieses Attribut gibt `index.css` dort der Dicke die
                       Auskunft. */
                    data-takt={i < pos ? "fertig" : revealHint ? "hinweis" : "offen"}
                    className={
                      "inline-block h-10 w-5 rounded border " +
                      (i < pos
                        ? "border-success bg-success-soft"
                        : revealHint
                          ? "border-accent bg-accent-soft"
                          : "border-hairline")
                    }
                    title={tx.schreiben.taktstrichTitel}
                  />
                );
              }
              return (
                <BrailleCell
                  key={i}
                  cell={
                    i < pos
                      ? c
                      : i === pos && wrongFlash !== null
                        ? wrongFlash
                        : revealHint
                          ? c
                          : 0
                  }
                  size={64}
                  state={i < pos ? "correct" : i === pos && wrongFlash !== null ? "wrong" : "neutral"}
                  showEmpty
                />
              );
            })}
          </div>
          {chord.pendingDots.length > 0 && (
            <p className="text-xs text-ink-muted" aria-hidden="true">
              {tx.schreiben.gedrueckt(chord.pendingDots.join(", "))}
            </p>
          )}
          {touch && (
            <KlangpunkteTouchEingabe
              aufgabe={task.key}
              onZelle={commitCell}
              onAnnounce={onAnnounce}
            />
          )}
        </div>
      )}

      {task.kind === "build" && (
        <div
          ref={areaRef}
          role="application"
          aria-label={tx.takt.aria(buildCells.length)}
          aria-keyshortcuts="Enter Backspace"
          data-feld="takt"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              finishBuild();
              return;
            }
            if (e.key === "Backspace") {
              e.preventDefault();
              backspaceBuild();
              return;
            }
            chord.onKeyDown(e);
          }}
          onKeyUp={(e) => chord.onKeyUp(e)}
          onBlur={() => chord.onBlur()}
          className="space-y-3 rounded-xl border-2 border-dashed border-hairline p-4 focus:border-accent"
        >
          <p className="text-sm text-ink-muted" aria-hidden="true">
            {tx.takt.vor}<span className="font-mono">f d s · j k l</span>{tx.takt.mitte}
            <kbd className="rounded border border-hairline px-1">⌫</kbd>{tx.takt.loescht}
            <kbd className="rounded border border-hairline px-1">⏎ Enter</kbd>{tx.takt.pruefen(task.timeSig[0], task.timeSig[1])}
          </p>
          <div className="flex flex-wrap items-center gap-1.5" aria-hidden="true">
            {buildCells.length === 0 ? (
              <span className="text-sm text-ink-muted">{tx.takt.nochLeer}</span>
            ) : (
              buildCells.map((c, i) => <BrailleCell key={i} cell={c} size={56} />)
            )}
          </div>
          <div className="flex gap-1.5" aria-hidden="true">
            <button type="button" tabIndex={-1} className="btn-primary btn-toggle" onClick={finishBuild}>
              {tx.takt.taktPruefen}
            </button>
            <button type="button" tabIndex={-1} className="btn-secondary btn-toggle" onClick={backspaceBuild}>
              {tx.takt.loeschen}
            </button>
          </div>
          {touch && (
            <KlangpunkteTouchEingabe
              aufgabe={task.key}
              onZelle={commitBuildCell}
              onLoeschen={backspaceBuild}
              onPruefen={finishBuild}
              onAnnounce={onAnnounce}
              taktstrichText={tx.takt.pause}
            />
          )}
        </div>
      )}

      {task.kind === "sandbox" && (
        <div
          ref={areaRef}
          role="application"
          aria-label={tx.werkstatt.aria(sandCells.length, werke.length)}
          data-feld="werkstatt"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Backspace") {
              e.preventDefault();
              backspaceSand();
              return;
            }
            chord.onKeyDown(e);
          }}
          onKeyUp={(e) => chord.onKeyUp(e)}
          onBlur={() => chord.onBlur()}
          className="space-y-3 rounded-xl border-2 border-dashed border-hairline p-4 focus:border-accent"
        >
          <p className="text-sm text-ink-muted" aria-hidden="true">
            {tx.werkstatt.vor}<span className="font-mono">f d s · j k l</span>{tx.werkstatt.mitte}
            <kbd className="rounded border border-hairline px-1">⌫</kbd>{tx.werkstatt.nach}
          </p>
          <div className="flex flex-wrap items-center gap-1.5" aria-hidden="true">
            {sandCells.length === 0 ? (
              <span className="text-sm text-ink-muted">{tx.werkstatt.leeresBlatt}</span>
            ) : (
              sandCells.map((c, i) =>
                c === BLANK ? (
                  <span key={i} className="inline-block h-9 w-4 rounded border border-hairline" />
                ) : (
                  <BrailleCell key={i} cell={c} state={highlight === i ? "pending" : "neutral"} size={52} />
                ),
              )
            )}
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <button type="button" className="btn-secondary btn-toggle" onClick={playSandbox}>
              <span aria-hidden="true">▶</span> {tx.werkstatt.anhoeren}
            </button>
            <button type="button" className="btn-secondary btn-toggle" onClick={clearSandbox}>
              {tx.werkstatt.loeschen}
            </button>
            <input
              type="text"
              value={werkName}
              onChange={(e) => setWerkName(e.target.value)}
              placeholder={tx.werkstatt.nameFuerWerk}
              aria-label={tx.werkstatt.nameFuerWerk}
              className="rounded-lg border border-hairline bg-surface-raised px-2 py-1.5 text-sm text-ink"
              maxLength={40}
            />
            <button
              type="button"
              className="btn-primary btn-toggle"
              onClick={saveWerk}
              // ★★★ `aria-disabled`, nie `disabled` (Bauart §3).
              aria-disabled={werke.length >= 5 || undefined}
            >
              <span aria-hidden="true">💾</span> {tx.werkstatt.speichern}
            </button>
          </div>
          {touch && (
            <KlangpunkteTouchEingabe
              aufgabe={task.key}
              onZelle={commitSandCell}
              onLoeschen={backspaceSand}
              onAnnounce={onAnnounce}
            />
          )}
          {werke.length > 0 && (
            <p className="text-xs text-ink-muted">
              {tx.werkstatt.gespeicherteListe(werke.map((w) => w.name).join(" · "), werke.length)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
