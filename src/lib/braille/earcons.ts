/**
 * Belohnungs-Earcons für den Braille-Trainer — per Web Audio erzeugt, mit
 * optionalem MP3-Fallback aus public/sounds/.
 *
 * Port aus lib/typing/sound.ts. Heißt bewusst earcons.ts (nicht sound.ts),
 * weil lib/braille/sound.ts (playErrorSound) bereits existiert und koexistiert.
 * Dateinamen mit Präfix „braille-", damit sie nicht mit Tastenflow-Sounds
 * kollidieren — die Braille-Belohnung darf akustisch anders klingen.
 *
 * Mute-Status: geteilt mit sound.ts (Key „braille-sound-muted") via Import.
 * Ein Schalter für alle Braille-Töne.
 *
 * ARIA-Kopplung: earcons.ts löst KEINEN ARIA-Text aus. Jeder play*-Aufruf
 * muss vom Aufrufer (onSessionDone / BrailleTrainerPage) im selben Tick mit
 * einem announce()-Aufruf aus announce.ts begleitet werden.
 * (Bauvertrag: kein Earcon ohne Text-Äquivalent.)
 */
import { keepAudioAlive } from "@/lib/audioUnlock";
import { isSoundMuted, tonGipfel, tonLautstaerke } from "./sound";

// --- Audio-Context (eigener, modul-lokaler Context) -------------------------

let ctx: AudioContext | null = null;

function audioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    const AC =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    if (!ctx) ctx = new AC();
    keepAudioAlive(ctx); // iOS: Gesten-Entsperrung + Lautlos-Schalter-Trick
    return ctx;
  } catch {
    return null;
  }
}

// --- Einzelton + Melodie-Hilfsfunktionen (1:1 aus typing/sound.ts) ----------

function tone(
  freqStart: number,
  freqEnd: number,
  dur: number,
  peak: number,
  type: OscillatorType = "sine",
): void {
  // ★ Lautstärke der Töne (Akustik-Menü, 17.10.2026) - bei 0 gar kein Ton.
  if (tonLautstaerke() <= 0) return;
  const ac = audioContext();
  if (!ac) return;
  try {
    if (ac.state === "suspended") void ac.resume();
    const now = ac.currentTime;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freqStart, now);
    if (freqEnd !== freqStart)
      osc.frequency.exponentialRampToValueAtTime(freqEnd, now + dur);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(tonGipfel(peak), now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    osc.connect(gain).connect(ac.destination);
    osc.start(now);
    osc.stop(now + dur + 0.02);
  } catch {
    /* Audio fehlgeschlagen — unkritisch */
  }
}

function melody(
  seq: Array<[number, number, number, number?]>,
  type: OscillatorType = "triangle",
): void {
  for (const [freq, startMs, dur, peak] of seq) {
    if (startMs <= 0) tone(freq, freq, dur, peak ?? 0.06, type);
    else setTimeout(() => tone(freq, freq, dur, peak ?? 0.06, type), startMs);
  }
}

// --- MP3-Datei-Hilfsfunktionen (mit Präfix „braille-") ----------------------

const fileEls: Record<string, HTMLAudioElement | null> = {};
const fileOk: Record<string, boolean | undefined> = {};

/**
 * ★★ Die Braille-Klangdateien, die es in `public/sounds/` WIRKLICH gibt
 * (27.09.2026): KEINE.
 *
 * Bis dahin wurden `braille-star3`, `braille-stufe`, `braille-levelup` und
 * `braille-unlock` beim Laden des Moduls angefragt - auch im Tastenflow-Bündel.
 * Keine davon hat je existiert (kein Commit hat sie angelegt); der Server
 * antwortete mit `index.html` (200, 32 kB, `text/html`), der Browser meldete
 * `error`, und es spielte die erzeugte Fanfare. Hörbar ändert sich darum
 * nichts - in Punktgenau, Klangpunkte und Tastenflow nicht -, es entfallen nur
 * vier nutzlose Anfragen (`BEFUND-2026-09-27-DATENVERBRAUCH-UND-NETZABBRUCH.md`
 * §1).
 *
 * Wer eine Datei `public/sounds/braille-….mp3` anlegt, trägt ihren Namen hier
 * ein; der Wächter `tests/tastenflow-toene-vorhanden.test.ts` prüft, dass jede
 * genannte Datei existiert.
 */
export const VORHANDENE_BRAILLE_TOENE: readonly string[] = [];

function ensureLoaded(name: string): void {
  if (typeof Audio === "undefined" || name in fileEls) return;
  if (!VORHANDENE_BRAILLE_TOENE.includes(name)) return; // Datei gibt es nicht - nichts anfragen
  try {
    const a = new Audio(`${import.meta.env.BASE_URL}sounds/${name}.mp3`);
    a.preload = "auto";
    a.addEventListener("canplaythrough", () => (fileOk[name] = true), { once: true });
    a.addEventListener("error", () => (fileOk[name] = false), { once: true });
    fileEls[name] = a;
  } catch {
    fileEls[name] = null;
  }
}

function playFile(name: string, volume: number): boolean {
  if (typeof Audio === "undefined") return false;
  ensureLoaded(name);
  if (fileOk[name] !== true) return false;
  const a = fileEls[name];
  if (!a) return false;
  try {
    a.volume = Math.max(0, Math.min(1, volume * tonLautstaerke()));
    a.currentTime = 0;
    void a.play().catch(() => { /* blockiert — Fanfare läuft bereits */ });
    return true;
  } catch {
    return false;
  }
}

// Beim Laden des Moduls die vorhandenen Braille-Sounds vorladen (nur Laden,
// kein Abspielen — erlaubt ohne Nutzer-Geste). Präfix „braille-" verhindert
// Kollision mit Tastenflow-Sounds (star3.mp3, levelup.mp3).
for (const name of VORHANDENE_BRAILLE_TOENE) ensureLoaded(name);

// --- Öffentliche Earcon-Funktionen ------------------------------------------

/**
 * Kurzer Bestätigungs-Tick nach richtiger Antwort.
 * Dezent, damit er die Folgeaufgabe nicht überdeckt.
 */
export function playCorrectTick(): void {
  if (isSoundMuted()) return;
  tone(880, 880, 0.05, 0.11, "sine");
}

/**
 * Wort/Zeile fertig (alle Zellen richtig) — kurzer aufsteigender Doppelton,
 * deutlich hörbar und klar anders als der Einzel-Tick je Zelle.
 */
export function playWordDone(): void {
  if (isSoundMuted()) return;
  tone(784, 784, 0.07, 0.13, "triangle");
  setTimeout(() => tone(1175, 1175, 0.1, 0.13, "triangle"), 70);
}

/**
 * Dezenter Cue beim Erscheinen einer neuen Aufgabe.
 * Sehr leise — soll aufmerksam machen, nicht stören.
 */
export function playTaskCue(): void {
  if (isSoundMuted()) return;
  tone(660, 660, 0.06, 0.05, "sine");
}

/**
 * Abgestufte Sterne-Belohnung + optionaler Jingle bei Anforderungsstufen-
 * aufstieg oder XP-Übungsstufen-Aufstieg.
 *
 * Priorität, wenn mehrere zugleich:
 *   stufeUp (seltenst, größtes Ereignis) > xpLevelUp > Sternzahl.
 *
 * ARIA (Bauvertrag): Kein Earcon ohne Text. Der Aufrufer (BrailleTrainerPage /
 * onSessionDone) ruft im selben Tick announce() aus announce.ts auf.
 *
 * opts.stufeUp → Anforderungsstufe (adaptive, nur Lehrkraft sichtbar) gestiegen.
 * opts.xpLevelUp → Übungsstufe (Kind sichtbar, XP-Ring) gestiegen.
 */
export function playStarReward(
  stars: number,
  opts?: { stufeUp?: boolean; xpLevelUp?: boolean },
): void {
  if (isSoundMuted()) return;

  if (opts?.stufeUp) {
    // Anforderungsstufen-Jingle: triumphierender, klar anderer Klang.
    if (playFile("braille-stufe", 0.8)) return;
    melody([
      [784, 0, 0.12, 0.07],
      [1047, 110, 0.12, 0.07],
      [1319, 220, 0.12, 0.07],
      [1568, 330, 0.32, 0.08],
      [1319, 470, 0.1, 0.05],
      [1568, 560, 0.36, 0.08],
    ]);
    return;
  }

  if (opts?.xpLevelUp) {
    // Übungsstufen-Aufstieg (XP-Ring): eigener, freudiger Klang.
    if (playFile("braille-levelup", 0.8)) return;
    melody([
      [523, 0, 0.12, 0.065],
      [659, 100, 0.12, 0.065],
      [784, 200, 0.12, 0.065],
      [1047, 300, 0.14, 0.07],
      [1319, 430, 0.28, 0.075],
    ]);
    return;
  }

  if (stars >= 3) {
    if (playFile("braille-star3", 0.7)) return;
    melody([
      [523, 0, 0.12, 0.06],
      [659, 100, 0.12, 0.06],
      [784, 200, 0.12, 0.06],
      [1047, 300, 0.3, 0.075],
    ]);
    return;
  }

  if (stars === 2) {
    melody([
      [523, 0, 0.12, 0.06],
      [659, 100, 0.12, 0.06],
      [784, 200, 0.2, 0.065],
    ]);
    return;
  }

  // 1 Stern: kurze, ermutigende Geste — JEDES Kind wird belohnt.
  melody([
    [523, 0, 0.12, 0.055],
    [659, 110, 0.18, 0.06],
  ]);
}

/**
 * Großer Freischaltungs-Jingle für Level-/Etappen-Abschluss.
 * Wird in BrailleTrainer bei levelMastered gespielt (E7).
 * Intern ruft playStarReward mit Stufen-Klang (stufeUp-Zweig).
 */
export function playLevelJingle(): void {
  if (isSoundMuted()) return;
  melody([
    [523, 0, 0.12, 0.06],
    [659, 110, 0.12, 0.06],
    [784, 220, 0.12, 0.06],
    [1047, 330, 0.16, 0.075],
    [1319, 470, 0.1, 0.06],
    [1568, 580, 0.08, 0.06],
    [1047, 680, 0.1, 0.055],
    [1568, 780, 0.38, 0.08],
  ]);
}

/**
 * Große Freischaltungs-Fanfare — der WICHTIGSTE Hebel für blinde Kinder.
 * Länger und festlicher als jeder andere Klang. Spielt, wenn eine neue
 * Etappe oder ein neues Zeichen freigeschaltet wird (unlocked !== null).
 *
 * MP3 braille-unlock.mp3 ersetzt die generierte Fanfare, wenn vorhanden.
 * ARIA: Aufrufer gibt parallel assertive Live-Text aus announce.ts.
 */
export function playUnlockFanfare(): void {
  if (isSoundMuted()) return;
  if (playFile("braille-unlock", 0.85)) return;
  melody([
    // aufsteigender, voller Lauf
    [523, 0, 0.12, 0.07],
    [659, 110, 0.12, 0.07],
    [784, 220, 0.12, 0.07],
    [1047, 330, 0.16, 0.08],
    // kleiner Glitzer-Triller
    [1319, 500, 0.08, 0.06],
    [1568, 580, 0.08, 0.06],
    [1319, 660, 0.08, 0.05],
    // triumphaler Schluss
    [1047, 760, 0.1, 0.06],
    [1568, 860, 0.42, 0.09],
  ]);
}
