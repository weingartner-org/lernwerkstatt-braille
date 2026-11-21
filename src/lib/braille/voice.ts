/**
 * Sprachausgabe (Self-Voicing) des Braille-Trainers über die Web-Speech-API.
 *
 * Port von lib/typing/voice.ts — auf den Braille-Trainer zugeschnitten:
 * - Key: 'braille-voice' (getrennt von 'tippen-voice')
 * - Keine Lese-Granularität (readLetters/readWords/readSentences) — Braille
 *   hat eigene Ansage-Logik via announce.ts
 * - Self-Voicing default AUS (Konflikt mit NVDA/JAWS/VoiceOver)
 * - Kern: speak / speakUi / speakSequence / spokenMs / isSpeaking / typingGapMs
 * - P0b: brailleSpoken, errorFeedback, speakError; verbalizeErrors-Flag
 */
import type { Lang } from "@/lib/typing/account";
import { stimmeFuer } from "@/lib/sprechen/stimmeFuer";
import { lehrSprache } from "./sprachen/aktuell";
import { create } from "zustand";
import { useEffect, useState } from "react";
import { installStummTaste } from "@/lib/stummTaste";

/** Ohne passende Stimme: das Sprach-Kennzeichen der Äußerung (nur Englisch weicht von Deutsch ab). */
const NOTFALL_SPRACH_TAG: Record<string, string> = { en: "en-US" };

export const BRAILLE_VOICE_KEY = "braille-voice";
const SPEAK_POLL_MS = 120;

interface VoiceSettings {
  enabled: boolean;
  rate: number;
  /**
   * ★ Sprechlautstärke 0,1 bis 1 (Akustik-Menü unter dem Lautsprecher,
   * 17.10.2026). 1 = so laut, wie das Gerät es hergibt - die Web-Speech-API
   * kann nicht lauter als das Gerät; der Regler macht die Stimme nur leiser.
   */
  volume: number;
  voiceURI: string;
  /** Spricht Fehler-Feedback via Self-Voicing (nur wenn enabled). Default true. */
  verbalizeErrors: boolean;
  setEnabled: (v: boolean) => void;
  setRate: (r: number) => void;
  setVolume: (v: number) => void;
  setVoiceURI: (uri: string) => void;
  setVerbalizeErrors: (v: boolean) => void;
}

interface VoiceStored {
  enabled: boolean;
  rate: number;
  volume: number;
  voiceURI: string;
  verbalizeErrors: boolean;
}

/** Sprechlautstärke in [0,1; 1]; leer, NaN oder Text wird zur vollen Lautstärke. */
/**
 * ★ 06.11.2026 (Bauplan Sprachen-Apps §1b, gemeinsamer Teil Punktgenau/Klangpunkte):
 * Die Sprech-Funktionen nehmen ausser `"de"`/`"en"` jetzt jede Sprache von Tastenflow.
 * Für `de` und `en` bleibt der Weg Zeichen für Zeichen der alte. Jede andere Sprache
 * wählt ihre Stimme über `stimmeFuer()`; gibt es keine, wird NICHT vorgelesen (nie
 * eine deutsche Stimme für fremden Text) - wartende Abläufe laufen trotzdem weiter.
 */
export type VoiceLang = Lang;
function istAlterWeg(lang: VoiceLang): lang is "de" | "en" {
  return lang === "de" || lang === "en";
}

export function sprechLautstaerkeBegrenzen(v: unknown): number {
  if (typeof v !== "number" || !Number.isFinite(v)) return 1;
  return Math.max(0.1, Math.min(1, v));
}

function read(): VoiceStored {
  const def: VoiceStored = { enabled: false, rate: 1, volume: 1, voiceURI: "", verbalizeErrors: true };
  try {
    const raw = localStorage.getItem(BRAILLE_VOICE_KEY);
    if (raw) {
      const d = JSON.parse(raw) as Partial<VoiceStored>;
      return {
        enabled: !!d.enabled,
        rate: typeof d.rate === "number" ? d.rate : 1,
        volume: sprechLautstaerkeBegrenzen(d.volume),
        voiceURI: typeof d.voiceURI === "string" ? d.voiceURI : "",
        verbalizeErrors: d.verbalizeErrors !== false, // default true
      };
    }
  } catch {
    /* ignore */
  }
  return def;
}

function persist(s: VoiceStored): void {
  try {
    localStorage.setItem(BRAILLE_VOICE_KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

export const useVoice = create<VoiceSettings>((set, get) => {
  const init = read();
  const snapshot = (): VoiceStored => {
    const s = get();
    return { enabled: s.enabled, rate: s.rate, volume: s.volume, voiceURI: s.voiceURI, verbalizeErrors: s.verbalizeErrors };
  };
  return {
    ...init,
    setEnabled: (v) => {
      if (v) {
        persist({ ...snapshot(), enabled: true });
        set({ enabled: true });
        primeSpeech();
      } else {
        persist({ ...snapshot(), enabled: false });
        cancelSpeech();
        stopKeepAlive();
        set({ enabled: false });
      }
    },
    setRate: (r) => {
      const rate = Math.max(0.6, Math.min(2, r));
      persist({ ...snapshot(), rate });
      set({ rate });
    },
    setVolume: (v) => {
      const volume = sprechLautstaerkeBegrenzen(v);
      persist({ ...snapshot(), volume });
      set({ volume });
    },
    setVoiceURI: (uri) => {
      persist({ ...snapshot(), voiceURI: uri });
      cancelSpeech();
      set({ voiceURI: uri });
    },
    setVerbalizeErrors: (v) => {
      persist({ ...snapshot(), verbalizeErrors: v });
      set({ verbalizeErrors: v });
    },
  };
});

function synth(): SpeechSynthesis | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  return window.speechSynthesis;
}

export function availableVoices(): SpeechSynthesisVoice[] {
  const s = synth();
  return s ? s.getVoices() : [];
}

const PREFERRED_VOICE_NAMES = [
  "Samantha", "Alex", "Daniel", "Karen", "Moira", "Tessa", "Rishi", "Aaron", "Nicky",
  "Zira", "David", "Mark", "Hazel", "George", "Susan",
  "Google US English", "Google UK English",
];

const NOVELTY_VOICE =
  /^(albert|bad news|bahh|bells|boing|bubbles|cellos|deranged|good news|hysterical|jester|junior|organ|pipe organ|superstar|trinoids|whisper|wobble|zarvox|monster|fl(ü|ue)stern|glocken|orgel|seifenblasen|spa(ß|ss)vogel|gute neuigkeiten|schlechte neuigkeiten)/i;

export function firstVoiceURIForLang(langPrefix: string): string | null {
  const p = langPrefix.toLowerCase().slice(0, 2);
  const matches = availableVoices().filter((vc) => vc.lang.toLowerCase().slice(0, 2) === p);
  if (!matches.length) return null;
  for (const want of PREFERRED_VOICE_NAMES) {
    const hit = matches.find((v) => v.name.toLowerCase().includes(want.toLowerCase()));
    if (hit) return hit.voiceURI;
  }
  const normal = matches.filter((v) => !NOVELTY_VOICE.test(v.name.trim()));
  return ((normal.find((v) => v.default) ?? normal[0]) ?? matches[0]).voiceURI;
}

function resolveVoice(s: SpeechSynthesis): SpeechSynthesisVoice | null {
  const voices = s.getVoices();
  if (!voices.length) return null;
  const uri = useVoice.getState().voiceURI;
  if (uri) {
    const chosen = voices.find((v) => v.voiceURI === uri);
    if (chosen) return chosen;
  }
  return (
    voices.find((v) => v.lang.toLowerCase().startsWith("de")) ??
    voices.find((v) => v.default) ??
    voices[0] ??
    null
  );
}

export function useAvailableVoices(): SpeechSynthesisVoice[] {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>(() => availableVoices());
  useEffect(() => {
    const s = synth();
    if (!s) return;
    const update = () => setVoices(s.getVoices());
    update();
    s.addEventListener("voiceschanged", update);
    return () => s.removeEventListener("voiceschanged", update);
  }, []);
  return voices;
}

// --- Sprechzeit-Messung (faire Zeitverrechnung) ---

let spokenMsAccum = 0;
let speakTickAt: number | null = null;
let speakTicker: ReturnType<typeof setInterval> | null = null;

function speakTick(): void {
  const s = synth();
  const now = Date.now();
  if (s && s.speaking) {
    if (speakTickAt !== null) spokenMsAccum += now - speakTickAt;
    speakTickAt = now;
  } else {
    stopSpeakTicker();
  }
}

function startSpeakTicker(): void {
  if (speakTicker !== null) return;
  speakTickAt = null;
  speakTicker = setInterval(speakTick, SPEAK_POLL_MS);
}

function stopSpeakTicker(): void {
  if (speakTicker !== null) {
    clearInterval(speakTicker);
    speakTicker = null;
  }
  speakTickAt = null;
}

/**
 * Gesamte bisher hörbar gesprochene Zeit (ms).
 * Die DIFFERENZ zweier Aufrufe ist die Sprechzeit dazwischen.
 */
export function spokenMs(): number {
  const s = synth();
  if (s && s.speaking && speakTickAt !== null) {
    return spokenMsAccum + (Date.now() - speakTickAt);
  }
  return spokenMsAccum;
}

export function isSpeaking(): boolean {
  const s = synth();
  return !!(s && s.speaking);
}

/**
 * Faire Tipp-Zeit: zieht gesprochene Wartezeit ab, wenn nicht parallel getippt.
 * Pure Funktion — testbar ohne DOM.
 */
export function typingGapMs(rawDeltaMs: number, spokenInGapMs: number, speakingNow = false): number {
  if (speakingNow) return Math.max(0, rawDeltaMs);
  return Math.max(0, rawDeltaMs - Math.max(0, spokenInGapMs));
}

// --- Freischaltung + Keep-Alive ---

let primed = false;
let keepAlive: ReturnType<typeof setInterval> | null = null;

function startKeepAlive(): void {
  if (keepAlive !== null) return;
  keepAlive = setInterval(() => {
    const s = synth();
    if (!s) return;
    try {
      if (s.speaking) {
        s.pause();
        s.resume();
      }
    } catch {
      /* ignore */
    }
  }, 10000);
}

function stopKeepAlive(): void {
  if (keepAlive !== null) {
    clearInterval(keepAlive);
    keepAlive = null;
  }
}

/** Freischalten — MUSS aus einer echten Nutzer-Geste heraus aufgerufen werden. */
export function primeSpeech(): void {
  const s = synth();
  if (!s) return;
  startKeepAlive();
  try {
    if (s.paused) s.resume();
    resolveVoice(s);
    if (!primed) {
      const u = new SpeechSynthesisUtterance(" ");
      u.volume = 0;
      u.rate = 1;
      s.speak(u);
      primed = true;
    }
  } catch {
    /* ignore */
  }
}

export function cancelSpeech(): void {
  const s = synth();
  try {
    s?.cancel();
  } catch {
    /* ignore */
  }
}

/*
 * ★★★★★ STRG MACHT SOFORT STILL - auch in Punktgenau und Klangpunkte
 * (Johannes, 04.09.2026: „mach das auch für die anderen Apps").
 *
 * Die Geste jedes Screenreaders, und sie gehört an den MOTOR: Beide Programme
 * sprechen über diese Datei. Die Regel - AltGr-Ausnahme, gehaltene Taste,
 * Capture - steht einmal für alle drei Motoren in `lib/stummTaste.ts`.
 */
installStummTaste(cancelSpeech);

/** Spricht den Text — nur wenn Self-Voicing aktiv ist. Bricht Laufendes ab. */
export function speak(text: string): void {
  const { enabled, rate } = useVoice.getState();
  if (!enabled || !text) return;
  const s = synth();
  if (!s) return;
  try {
    if (s.paused) s.resume();
    s.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = rate;
    u.volume = useVoice.getState().volume;
    // Sprachen-Apps: in einer anderen Lehrsprache (fr ...) die Stimme dieser Sprache; gibt es
    // keine, bleibt es still (nie deutsch). Deutsch: unverändert.
    const sp = lehrSprache();
    const fremd = !istAlterWeg(sp) ? stimmeFuer(sp, s.getVoices()) : null;
    if (!istAlterWeg(sp) && !fremd) return;
    const v = fremd ?? resolveVoice(s);
    if (v) { u.voice = v; u.lang = v.lang; } else { u.lang = "de-DE"; }
    s.speak(u);
    startSpeakTicker();
  } catch {
    /* Sprachausgabe nicht verfügbar */
  }
}

/**
 * Spricht mehrere Teile NACHEINANDER (Warteschlange) — anders als speak(),
 * das Laufendes abbricht. Für Braille-Zell-Sequenzen auf Mount.
 */
export function speakSequence(parts: readonly string[]): void {
  const { enabled, rate } = useVoice.getState();
  if (!enabled) return;
  const texts = parts.filter((t) => t && t.trim().length > 0);
  if (!texts.length) return;
  const s = synth();
  if (!s) return;
  try {
    if (s.paused) s.resume();
    s.cancel();
    const sp = lehrSprache();
    const fremd = !istAlterWeg(sp) ? stimmeFuer(sp, s.getVoices()) : null;
    if (!istAlterWeg(sp) && !fremd) return; // keine Stimme der Sprache: lieber still als deutsch
    const v = fremd ?? resolveVoice(s);
    for (const t of texts) {
      const u = new SpeechSynthesisUtterance(t);
      u.rate = rate;
      u.volume = useVoice.getState().volume;
      if (v) { u.voice = v; u.lang = v.lang; } else { u.lang = "de-DE"; }
      s.speak(u);
    }
    startSpeakTicker();
  } catch {
    /* Sprachausgabe nicht verfügbar */
  }
}

/**
 * Spricht UI-Text mit einer zur INHALTSSPRACHE passenden System-Stimme —
 * Standard Deutsch (Richtig/Falsch, Level-Ansagen); UEB-Inhalte übergeben
 * lang="en", damit englische Wörter nicht mit deutscher Stimme genuschelt
 * werden. Nur wenn Self-Voicing aktiv.
 */
export function speakUi(text: string, lang: VoiceLang = lehrSprache()): void {
  if (!useVoice.getState().enabled) return;
  speakUiAlways(text, lang);
}

/**
 * Wie speakUi, aber OHNE An/Aus-Prüfung — einzig für die Abschalt-Ansage
 * („Vorlesen aus."): sie muss noch hörbar sein, obwohl der Schalter in dem
 * Moment schon aus ist. Für alles andere speakUi verwenden.
 */
export function speakUiAlways(text: string, lang: VoiceLang = lehrSprache()): void {
  const { rate } = useVoice.getState();
  if (!text) return;
  const s = synth();
  if (!s) return;
  try {
    if (s.paused) s.resume();
    s.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = rate;
    u.volume = useVoice.getState().volume;
    const voices = s.getVoices();
    if (!istAlterWeg(lang)) {
      const fremd = stimmeFuer(lang, voices);
      if (!fremd) return; // keine Stimme der Sprache: lieber still als deutsch
      u.voice = fremd;
      u.lang = fremd.lang;
      s.speak(u);
      startSpeakTicker();
      return;
    }
    const langAll = voices.filter((v) => v.lang.toLowerCase().startsWith(lang));
    let v: SpeechSynthesisVoice | null = null;
    if (langAll.length) {
      for (const want of PREFERRED_VOICE_NAMES) {
        const hit = langAll.find((dv) => dv.name.toLowerCase().includes(want.toLowerCase()));
        if (hit) { v = hit; break; }
      }
      if (!v) {
        const normal = langAll.filter((dv) => !NOVELTY_VOICE.test(dv.name.trim()));
        v = (normal.find((dv) => dv.default) ?? normal[0] ?? langAll[0]) ?? null;
      }
    }
    if (v) { u.voice = v; u.lang = v.lang; } else { u.lang = NOTFALL_SPRACH_TAG[lang] ?? "de-DE"; }
    s.speak(u);
    startSpeakTicker();
  } catch {
    /* Sprachausgabe nicht verfügbar */
  }
}

/**
 * speakUi + Callback, sobald die Ansage zu Ende (oder Sprachausgabe nicht
 * verfügbar/aus) ist. Für Zustands-Ansagen, auf die eine weitere Ansage folgt
 * („Vorlesen an." → Aufgabe wiederholen): jeder direkte Folge-speak würde die
 * Zustands-Ansage per cancel() abwürgen. Ein Fallback-Timer stellt sicher,
 * dass der Callback auch läuft, wenn die Web-Speech-API keine Events liefert.
 */
export function speakUiThen(text: string, onDone: () => void, lang: VoiceLang = lehrSprache()): void {
  const { enabled, rate } = useVoice.getState();
  const s = synth();
  if (!enabled || !text || !s) {
    onDone();
    return;
  }
  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    onDone();
  };
  try {
    if (s.paused) s.resume();
    s.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = rate;
    u.volume = useVoice.getState().volume;
    if (!istAlterWeg(lang)) {
      const fremd = stimmeFuer(lang, s.getVoices());
      if (!fremd) {
        finish(); // keine Stimme der Sprache: nicht deutsch vorlesen, gleich weiter
        return;
      }
      u.voice = fremd;
      u.lang = fremd.lang;
    } else {
      const v = resolveVoice(s);
      if (v) { u.voice = v; u.lang = v.lang; } else { u.lang = NOTFALL_SPRACH_TAG[lang] ?? "de-DE"; }
    }
    u.onend = finish;
    u.onerror = finish;
    s.speak(u);
    startSpeakTicker();
    // Fallback: kurze Ansagen dauern auch bei langsamstem Tempo < 3 s.
    setTimeout(finish, 3000);
  } catch {
    finish();
  }
}

/**
 * Grobe Schätzung der Sprechdauer (ms) — NUR als Sicherheitsnetz für den
 * Fallback-Timer von speakThenPlay, falls die Web-Speech-API kein onend liefert.
 * ~11 Zeichen/Sekunde bei Tempo 1, skaliert mit rate, Mindestwert + Puffer,
 * damit der Ton die Ansage niemals abschneidet. Pure Funktion (testbar).
 */
export function estimateSpeechMs(text: string, rate = 1): number {
  const r = Math.max(0.6, Math.min(2, rate || 1));
  const raw = (text.length / 11) * 1000; // ~11 Zeichen/s bei Tempo 1
  return Math.max(4000, Math.round(raw / r) + 1200);
}

/**
 * „Erst vorlesen, DANN anspielen." Verbindet eine Ansage mit dem automatischen
 * Klangbeispiel — mit zwei klar getrennten Fällen (Wunsch Johannes, 12.07.):
 *
 *   1. Vorlesen AN  → `onReady` läuft, sobald die Ansage ausgesprochen ist
 *      (onend/onerror der Utterance). Kein fester Vorlauf mehr, der bei kurzen
 *      Ansagen zu lang und bei langen zu knapp war.
 *   2. Vorlesen AUS → `onReady` läuft nach `silentGapMs`. Ein externer
 *      Screenreader (JAWS/NVDA/VoiceOver), der dann u. U. die aria-live-Region
 *      liest, ist aus dem Browser NICHT abfragbar (weder ob er läuft noch wann er
 *      fertig gesprochen hat — es gibt keinen Rückkanal) → feste Standard-
 *      Wartezeit statt Kopplung.
 *
 * Spricht `text` SELBST (nur so ist der onend-Zeitpunkt bekannt) — der Aufrufer
 * darf die Ansage daher nicht zusätzlich über speakUi sprechen, sondern füllt
 * die Live-Region mit `voice:false`. Ein aus der Textlänge geschätzter
 * Fallback-Timer greift, falls kein Ende-Event kommt.
 *
 * Rückgabe: Abbruch-Funktion für den useEffect-Cleanup — verhindert, dass das
 * Klangbeispiel einer bereits verlassenen Aufgabe noch erklingt. Sie bricht die
 * laufende Sprachausgabe NICHT ab (die nächste Ansage ruft ohnehin cancel()).
 */
export function speakThenPlay(
  text: string,
  onReady: () => void,
  opts: { silentGapMs?: number; maxWaitMs?: number } = {},
  lang: VoiceLang = lehrSprache(),
): () => void {
  const silentGap = Math.max(0, opts.silentGapMs ?? 1000);
  const { enabled, rate } = useVoice.getState();
  const s = synth();
  let done = false;
  let timer: ReturnType<typeof setTimeout> | null = null;
  const clearTimer = () => {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  };
  const finish = () => {
    if (done) return;
    done = true;
    clearTimer();
    onReady();
  };
  const cancel = () => {
    done = true;
    clearTimer();
  };
  // Fall 2: Vorlesen aus / keine Sprachausgabe → nach kurzer Pause anspielen.
  if (!enabled || !text || !s) {
    timer = setTimeout(finish, silentGap);
    return cancel;
  }
  // Fall 1: Vorlesen an → sprechen, danach anspielen (onend/onerror).
  try {
    if (s.paused) s.resume();
    s.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = rate;
    u.volume = useVoice.getState().volume;
    if (!istAlterWeg(lang)) {
      const fremd = stimmeFuer(lang, s.getVoices());
      if (!fremd) {
        timer = setTimeout(finish, silentGap); // keine Stimme der Sprache: still, wie „Vorlesen aus"
        return cancel;
      }
      u.voice = fremd;
      u.lang = fremd.lang;
    } else {
      const v = resolveVoice(s);
      if (v) { u.voice = v; u.lang = v.lang; } else { u.lang = NOTFALL_SPRACH_TAG[lang] ?? "de-DE"; }
    }
    u.onend = finish;
    u.onerror = finish;
    s.speak(u);
    startSpeakTicker();
    timer = setTimeout(finish, opts.maxWaitMs ?? estimateSpeechMs(text, rate));
  } catch {
    timer = setTimeout(finish, silentGap);
  }
  return cancel;
}

// Hinweis: Das verortende Fehler-Feedback lebt seit 02.07. in announce.ts
// (announceWrong mit verbose-Option, Punkt-Lagen aus cell.ts DOT_POSITION) —
// so erreicht es Screenreader UND Self-Voicing über EINEN Weg. Die früheren
// Vorbereitungen errorFeedback/speakError/brailleSpoken hier wurden ersetzt
// und entfernt; der Schalter `verbalizeErrors` (oben im Store) steuert es.
