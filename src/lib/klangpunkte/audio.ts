/**
 * Klangerzeugung für „Klangpunkte" — Web Audio mit ECHTEN Instrument-Samples.
 *
 * Vier Instrumente (Klavier, Gitarre, Saxophon, Querflöte) klingen über echte,
 * aufgenommene Einzeltöne aus nbrosowsky/tonejs-instruments (CC-BY 3.0, echte
 * Instrumente aus Public-Domain-Quellen wie der University of Iowa) — s.
 * LICENSES.md. Die Sample-Bänke liegen als JSON unter public/sounds/klangpunkte/
 * (MIDI 36–96, dünner belegte Ränder werden per playbackRate interpoliert) und
 * werden erst beim Spielen geladen; einzelne Töne werden bei Bedarf dekodiert und im LRU-Cache
 * gehalten. Fehlt ein Sample (noch nicht geladen / offline / Decode-Fehler),
 * greift automatisch die alte Synthesizer-Stimme — es bleibt also IMMER
 * spielbar, nur eben schöner, sobald die Samples da sind.
 *
 * Die Töne sind INHALT (wie die Sprachausgabe), kein Feedback-Beep — sie
 * laufen darum absichtlich NICHT über den „Sounds"-Schalter (sound.ts muted).
 */
import { keepAudioAlive, primeOnGesture } from "@/lib/audioUnlock";
import { klangTexte } from "./sprache";
import { beats, frequency, midi, type Melody, type MusicNote, type MusicRest } from "./notation";

export const INSTRUMENTS = ["klavier", "gitarre", "sax", "floete"] as const;
export type Instrument = (typeof INSTRUMENTS)[number];

/** Die Namen der Instrumente - erst beim Lesen aus der Sprache der App geholt. */
export const INSTRUMENT_LABELS: Record<Instrument, string> = (() => {
  const o = {} as Record<Instrument, string>;
  for (const k of INSTRUMENTS) {
    Object.defineProperty(o, k, { enumerable: true, get: () => klangTexte().instrumente[k] });
  }
  return o;
})();

let ctx: AudioContext | null = null;

function audioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    const AC =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    if (!ctx) ctx = new AC();
    // iPad-Fix: resume() aus einem setTimeout lehnt Safari ab — die Gesten-
    // Entsperrung in audioUnlock übernimmt das (plus Lautlos-Schalter-Trick).
    keepAudioAlive(ctx);
    return ctx;
  } catch {
    return null;
  }
}

// Den Context schon bei der ERSTEN Nutzergeste (z. B. Kapitelwahl-Klick) anlegen
// und wecken — sonst bliebe der automatische Melodie-Start einer Hör-Aufgabe (er
// kommt aus einem Timer, nicht aus einem Klick) von der Autoplay-Politik stumm
// geschaltet, bis man einmal „Anhören" drückt. Die Fabrik gibt den gecachten
// Context zurück (idempotent).
primeOnGesture(() => audioContext());

// --- Master-Bus: Lautheit anheben + weich begrenzen ----------------------------
//
// ALLE Klänge laufen über einen gemeinsamen Ausgang: Drive → Limiter → SoftClip →
// Boxen. Die pro Ton angeglichenen Samples sind bewusst leise ausgesteuert (viel
// Headroom, Melodie-Peak ~0,1) — ohne Anhebung wären die Instrumente DEUTLICH
// leiser als die Vorlese-Stimme (speechSynthesis läuft mit voller Lautstärke und
// geht nicht durch Web Audio, lässt sich hier also nicht mitregeln). Der Master
// hebt darum kräftig an (`MASTER_DRIVE`) und fängt die entstehenden Spitzen
// sauber ab: ein sanfter Kompressor als Limiter, dahinter der WaveShaper-SoftClip
// als Brickwall. Das bringt eine Melodie von ~−35 auf ~−20 dBFS RMS (Sprach-
// Niveau) und bleibt clip-frei bis hin zu Akkorden + Akzenten (im
// OfflineAudioContext mit den echten Samples gemessen: Peak ≤ 0,45).
const MASTER_DRIVE = 3.5;

/** Weiche Begrenzerkurve: bis |x|<KNEE linear, darüber tanh-Knie gegen 1.0. */
function softClipCurve(): Float32Array<ArrayBuffer> {
  const n = 2048;
  const knee = 0.9;
  const range = 1 - knee;
  const curve = new Float32Array(new ArrayBuffer(n * Float32Array.BYTES_PER_ELEMENT));
  for (let i = 0; i < n; i++) {
    const x = (i / (n - 1)) * 2 - 1; // -1 … 1
    const a = Math.abs(x);
    const y = a <= knee ? a : knee + range * Math.tanh((a - knee) / range);
    curve[i] = Math.sign(x) * y;
  }
  return curve;
}

let masterNode: GainNode | null = null;
let masterCtx: AudioContext | null = null;

/*
 * ★ Die Lautstärke der Musik, 0 bis 1 (Akustik-Menü unter dem Lautsprecher,
 * Johannes 17.10.2026). Sie sitzt VOR dem Begrenzer: 1 ist die bisherige
 * Lautheit, weniger macht alle Instrumente gleichmässig leiser, ohne dass der
 * Begrenzer anders arbeitet. Lauter als bisher geht es nicht - der Ausgang ist
 * schon auf Sprach-Niveau angehoben (siehe oben). Gilt auf diesem Gerät.
 */
const MUSIK_LAUT_KEY = "klangpunkte-musik-laut";
let musikLaut = (() => {
  try {
    const roh = localStorage.getItem(MUSIK_LAUT_KEY);
    const n = roh === null ? NaN : Number(roh);
    return Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : 1;
  } catch {
    return 1;
  }
})();

export function musikLautstaerke(): number {
  return musikLaut;
}

export function setzeMusikLautstaerke(wert: number): void {
  musikLaut = Math.min(1, Math.max(0, wert));
  try { localStorage.setItem(MUSIK_LAUT_KEY, String(musikLaut)); } catch { /* egal */ }
  // Greift auch mitten in einer Melodie oder einem Halteton.
  if (masterNode) masterNode.gain.value = MASTER_DRIVE * musikLaut;
}

/** Gemeinsamer Eingang für alle Klänge (idempotent pro Context). */
function masterBus(ac: AudioContext): AudioNode {
  if (masterNode && masterCtx === ac) return masterNode;
  const drive = ac.createGain();
  drive.gain.value = MASTER_DRIVE * musikLaut;
  const limiter = ac.createDynamicsCompressor();
  limiter.threshold.value = -8; // ab hier sanft bremsen …
  limiter.knee.value = 6;
  limiter.ratio.value = 8;
  limiter.attack.value = 0.003; // Transienten (Anschlag) kommen noch durch
  limiter.release.value = 0.18;
  const shaper = ac.createWaveShaper();
  shaper.curve = softClipCurve();
  shaper.oversample = "4x"; // … alles Restliche fängt der Brickwall-SoftClip
  drive.connect(limiter).connect(shaper).connect(ac.destination);
  masterNode = drive;
  masterCtx = ac;
  return drive;
}

/** Tempo: Dauer eines Viertels in Sekunden. */
const QUARTER_S = 0.55;
/** Kleine Lücke zwischen Tönen, damit Repetitionen hörbar bleiben. */
const GAP_S = 0.045;

// --- Instrumenten-Stimmen ------------------------------------------------------

/**
 * Gitarre: Karplus-Strong (gezupfte Saite) — kurzes Rauschen läuft durch eine
 * gefilterte Verzögerungsschleife; klingt natürlich perkussiv-saitig.
 */
function pluckBuffer(ac: AudioContext, freq: number, seconds: number): AudioBuffer {
  const rate = ac.sampleRate;
  const len = Math.max(1, Math.floor(rate * seconds));
  const buf = ac.createBuffer(1, len, rate);
  const data = buf.getChannelData(0);
  const period = Math.max(2, Math.round(rate / freq));
  const ring = new Float32Array(period);
  for (let i = 0; i < period; i++) ring[i] = Math.random() * 2 - 1;
  let idx = 0;
  for (let i = 0; i < len; i++) {
    const cur = ring[idx];
    const next = ring[(idx + 1) % period];
    data[i] = cur;
    ring[idx] = (cur + next) * 0.498; // leichte Dämpfung = Ausklingen
    idx = (idx + 1) % period;
  }
  return buf;
}

interface Voice {
  /** Startet den Ton; gibt die Stop-Funktion (harter Abbruch) zurück. */
  start: (ac: AudioContext, dest: AudioNode, freq: number, t0: number, dur: number) => void;
}

function osc(
  ac: AudioContext,
  type: OscillatorType,
  freq: number,
  t0: number,
  t1: number,
): OscillatorNode {
  const o = ac.createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(freq, t0);
  o.start(t0);
  o.stop(t1 + 0.05);
  return o;
}

function envGain(
  ac: AudioContext,
  t0: number,
  attack: number,
  peak: number,
  sustain: number,
  tEnd: number,
  release: number,
): GainNode {
  const g = ac.createGain();
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0001), t0 + attack);
  g.gain.exponentialRampToValueAtTime(Math.max(sustain, 0.0001), t0 + attack + 0.08);
  g.gain.setValueAtTime(Math.max(sustain, 0.0001), Math.max(tEnd - release, t0 + attack + 0.09));
  g.gain.exponentialRampToValueAtTime(0.0001, tEnd + 0.04);
  return g;
}

const SYNTH_VOICES: Record<Instrument, Voice> = {
  klavier: {
    start(ac, dest, freq, t0, dur) {
      // Zwei Teiltöne mit schnellem Anschlag und exponentiellem Ausklingen.
      const tEnd = t0 + dur;
      const g = ac.createGain();
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(0.5, t0 + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + Math.max(dur * 1.4, 0.5));
      const o1 = osc(ac, "triangle", freq, t0, tEnd);
      const o2 = osc(ac, "sine", freq * 2, t0, tEnd);
      const g2 = ac.createGain();
      g2.gain.value = 0.25;
      o1.connect(g);
      o2.connect(g2).connect(g);
      g.connect(dest);
    },
  },
  gitarre: {
    start(ac, dest, freq, t0, dur) {
      const src = ac.createBufferSource();
      src.buffer = pluckBuffer(ac, freq, Math.max(dur * 1.3, 0.7));
      const g = ac.createGain();
      g.gain.setValueAtTime(0.55, t0);
      src.connect(g).connect(dest);
      src.start(t0);
    },
  },
  sax: {
    start(ac, dest, freq, t0, dur) {
      // Sägezahn + Tiefpass + Vibrato = rohrblatt-artig, getragen.
      const tEnd = t0 + dur;
      const o = osc(ac, "sawtooth", freq, t0, tEnd);
      const lp = ac.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = Math.min(freq * 4, 2400);
      lp.Q.value = 2.5;
      const vib = osc(ac, "sine", 5.5, t0, tEnd);
      const vibGain = ac.createGain();
      vibGain.gain.value = freq * 0.006;
      vib.connect(vibGain).connect(o.frequency);
      const g = envGain(ac, t0, 0.06, 0.34, 0.26, tEnd, 0.1);
      o.connect(lp).connect(g).connect(dest);
    },
  },
  floete: {
    start(ac, dest, freq, t0, dur) {
      // Sinus + Hauch von Oktav-Teilton, weicher Ansatz = Flöte.
      const tEnd = t0 + dur;
      const o1 = osc(ac, "sine", freq, t0, tEnd);
      const o2 = osc(ac, "sine", freq * 2, t0, tEnd);
      const g2 = ac.createGain();
      g2.gain.value = 0.12;
      const g = envGain(ac, t0, 0.045, 0.4, 0.32, tEnd, 0.07);
      o1.connect(g);
      o2.connect(g2).connect(g);
      g.connect(dest);
    },
  },
};

// --- Echte Instrument-Samples (10.07.2026) -----------------------------------------
//
// Bank = Map MIDI-Nummer → base64-MP3 (aus public/sounds/klangpunkte/*.json).
// Dekodierte Einzeltöne wandern in einen LRU-Cache; startVoice greift synchron
// darauf zu (die play*-Funktionen warten vorher asynchron das Nötige ab).

const SAMPLE_URL_BASE = `${import.meta.env.BASE_URL}sounds/klangpunkte/`;
/** Samples länger als das braucht kein Ton bei uns — spart Dekodier-Speicher. */
const MAX_SAMPLE_S = 3.2;
/** Höchstzahl gleichzeitig dekodiert gehaltener Einzeltöne (LRU). */
const MAX_DECODED = 96;

// --- Lautstärke-Angleichung (10.07.2026) ---------------------------------------
//
// Die MusyngKite-Samples sind PEAK-, nicht LOUDNESS-normalisiert: getragene
// Instrumente (Sax/Flöte) klangen dadurch bis zu ~22 dB lauter als perkussive
// (Klavier), und tiefe Töne lauter als hohe. Ein Skript (scripts/klangpunkte-
// normalize.mjs) misst darum die integrierte Lautheit (EBU R128) JEDES Einzeltons
// und legt in gains.json einen Faktor je Ton ab, der ALLE Töne aller Instrumente
// auf denselben empfundenen Pegel bringt. startVoice multipliziert damit.
//
// Bis die Tabelle geladen ist (die ersten Millisekunden), greift eine grobe
// Instrument-Näherung, damit auch der allererste Anschlag schon halbwegs im Lot
// ist — danach zählen die exakten Pro-Ton-Werte.
type GainTable = Partial<Record<Instrument, Record<number, number>>>;
let sampleGains: GainTable | null = null;
let sampleGainsPromise: Promise<GainTable | null> | null = null;
// Grobe Mittelwerte je Instrument (aus gains.json) — die echten tonejs-Samples
// (Klavier/Sax/Querflöte) sind laut aufgenommen und müssen abgesenkt werden, die
// MusyngKite-Gitarre angehoben. Nur wirksam, bis die Tabelle geladen ist.
const SAMPLE_GAIN_FALLBACK: Record<Instrument, number> = {
  klavier: 0.3,
  gitarre: 1.6,
  sax: 0.12,
  floete: 0.12,
};

function ensureGains(): Promise<GainTable | null> {
  if (sampleGains) return Promise.resolve(sampleGains);
  if (!sampleGainsPromise) {
    sampleGainsPromise = (async () => {
      try {
        const res = await fetch(`${SAMPLE_URL_BASE}gains.json`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        sampleGains = (await res.json()) as GainTable;
        return sampleGains;
      } catch {
        sampleGainsPromise = null; // nächster Aufruf darf neu versuchen
        return null;
      }
    })();
  }
  return sampleGainsPromise;
}

/** Angleich-Faktor für ein konkret abgespieltes Sample (Instrument + MIDI). */
function sampleGain(instrument: Instrument, sampleMidi: number): number {
  const exact = sampleGains?.[instrument]?.[sampleMidi];
  return exact ?? SAMPLE_GAIN_FALLBACK[instrument];
}

const banks = new Map<Instrument, Map<number, string>>();
const bankKeys = new Map<Instrument, number[]>(); // sortierte MIDI-Nummern
const bankPromises = new Map<Instrument, Promise<Map<number, string> | null>>();
const noteBuffers = new Map<string, AudioBuffer>(); // "inst:midi" → dekodiert (LRU)
const notePromises = new Map<string, Promise<void>>();

/** Sample-Bank eines Instruments laden (einmalig; bei Fehlschlag später neuer Versuch). */
function ensureBank(instrument: Instrument): Promise<Map<number, string> | null> {
  const have = banks.get(instrument);
  if (have) return Promise.resolve(have);
  let p = bankPromises.get(instrument);
  if (!p) {
    p = (async () => {
      try {
        const res = await fetch(`${SAMPLE_URL_BASE}${instrument}.json`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as Record<string, string>;
        const bank = new Map<number, string>();
        for (const [k, v] of Object.entries(data)) bank.set(Number(k), v);
        banks.set(instrument, bank);
        bankKeys.set(
          instrument,
          [...bank.keys()].sort((a, b) => a - b),
        );
        return bank;
      } catch {
        // offline o. Ä. — Synth-Fallback; der nächste Aufruf darf es neu versuchen.
        bankPromises.delete(instrument);
        return null;
      }
    })();
    bankPromises.set(instrument, p);
  }
  return p;
}

/**
 * Sample-Bank im Hintergrund laden UND dekodieren — z. B. beim Betreten eines
 * Kapitels. Weil die Wiedergabe jetzt synchron plant (iOS-Geste, s. playMelody),
 * werden die Stützstellen hier schon vorab dekodiert, damit der ERSTE Anschlag
 * das echte Sample warm vorfindet statt die Synth-Notlösung. Alles best effort;
 * gelingt es nicht rechtzeitig, klingt es eben zuerst per Synth (nie stumm).
 */
export function preloadInstrument(instrument: Instrument): void {
  void ensureGains(); // Angleich-Tabelle früh holen (winzig, s. gains.json)
  void (async () => {
    const bank = await ensureBank(instrument);
    if (!bank) return;
    await Promise.all([...bank.keys()].map((sm) => decodeNote(instrument, sm)));
  })();
}

/** Nächstgelegenes vorhandenes Sample zu einer MIDI-Nummer (null = Bank fehlt). */
function nearestSampleMidi(instrument: Instrument, target: number): number | null {
  const keys = bankKeys.get(instrument);
  if (!keys?.length) return null;
  let best = keys[0];
  for (const k of keys) if (Math.abs(k - target) < Math.abs(best - target)) best = k;
  return best;
}

/** Lange Samples auf MAX_SAMPLE_S kürzen — die Hüllkurve blendet ohnehin aus. */
function trimBuffer(ac: AudioContext, buf: AudioBuffer): AudioBuffer {
  if (buf.duration <= MAX_SAMPLE_S) return buf;
  const len = Math.floor(MAX_SAMPLE_S * buf.sampleRate);
  const out = ac.createBuffer(buf.numberOfChannels, len, buf.sampleRate);
  for (let ch = 0; ch < buf.numberOfChannels; ch++)
    out.getChannelData(ch).set(buf.getChannelData(ch).subarray(0, len));
  return out;
}

function rememberBuffer(key: string, buf: AudioBuffer): void {
  noteBuffers.delete(key); // Re-Insert = ans LRU-Ende
  noteBuffers.set(key, buf);
  while (noteBuffers.size > MAX_DECODED) {
    const oldest = noteBuffers.keys().next().value;
    if (oldest === undefined) break;
    noteBuffers.delete(oldest);
  }
}

/** Einen Einzelton der Bank dekodieren (idempotent, parallelfest). */
function decodeNote(instrument: Instrument, sampleMidi: number): Promise<void> {
  const key = `${instrument}:${sampleMidi}`;
  if (noteBuffers.has(key)) return Promise.resolve();
  let p = notePromises.get(key);
  if (!p) {
    p = (async () => {
      const b64 = banks.get(instrument)?.get(sampleMidi);
      const ac = audioContext();
      if (!b64 || !ac) return;
      try {
        const raw = atob(b64);
        const bytes = new Uint8Array(raw.length);
        for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
        const buf = await ac.decodeAudioData(bytes.buffer);
        rememberBuffer(key, trimBuffer(ac, buf));
      } catch {
        /* Sample defekt/nicht dekodierbar → Synth-Fallback übernimmt */
      }
    })().finally(() => notePromises.delete(key));
    notePromises.set(key, p);
  }
  return p;
}

/** Alle für eine Tonliste nötigen Samples laden+dekodieren (best effort). */
async function ensureNotes(instrument: Instrument, midis: number[]): Promise<void> {
  if (!midis.length) return;
  void ensureGains();
  const bank = await ensureBank(instrument);
  if (!bank) return;
  const wanted = new Set<number>();
  for (const m of midis) {
    const sm = nearestSampleMidi(instrument, m);
    if (sm !== null) wanted.add(sm);
  }
  await Promise.all([...wanted].map((sm) => decodeNote(instrument, sm)));
}

/** MIDI-Nummern aller Noten einer Melodie (für das Vor-Dekodieren). */
function melodyMidis(melody: Melody): number[] {
  const out: number[] = [];
  for (const ev of melody.events) if (ev.kind === "note") out.push(midi(ev));
  return out;
}

/**
 * Einen Ton starten: echtes Sample, wenn dekodiert vorliegt — sonst die
 * Synthesizer-Stimme. Beim Sample steckt der Anschlag im Material selbst;
 * wir blenden nur am Ende kurz aus (gegen Knackser und für Staccato).
 */
function startVoice(
  ac: AudioContext,
  dest: AudioNode,
  instrument: Instrument,
  freq: number,
  t0: number,
  dur: number,
): void {
  const targetMidi = Math.round(69 + 12 * Math.log2(freq / 440));
  const sm = nearestSampleMidi(instrument, targetMidi);
  const buf = sm === null ? undefined : noteBuffers.get(`${instrument}:${sm}`);
  if (sm === null || !buf) {
    SYNTH_VOICES[instrument].start(ac, dest, freq, t0, dur);
    return;
  }
  rememberBuffer(`${instrument}:${sm}`, buf); // LRU auffrischen
  const src = ac.createBufferSource();
  src.buffer = buf;
  src.playbackRate.value = freq / (440 * Math.pow(2, (sm - 69) / 12));
  const g = ac.createGain();
  const vol = sampleGain(instrument, sm); // Pro-Ton-Angleichung (s. gains.json)
  const atk = 0.004; // winziger Anstieg gegen Start-Knackser; Sample-Attack bleibt
  const rel = 0.12;
  const holdEnd = t0 + Math.max(dur - 0.01, atk + 0.01);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.linearRampToValueAtTime(vol, t0 + atk);
  g.gain.setValueAtTime(vol, holdEnd);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur + rel);
  src.connect(g).connect(dest);
  src.start(t0);
  src.stop(t0 + dur + rel + 0.05);
}

// --- Abspielen -------------------------------------------------------------------

let playToken = 0;
const timers: number[] = [];

/** Läuft gerade eine Wiedergabe? (grob — bis der letzte geplante Ton startet) */
let playingUntil = 0;

/**
 * Lauf-Gains der aktiven Wiedergaben (playMelody/playChord). Web Audio plant
 * alle Töne einer Melodie SOFORT auf der Audio-Uhr — Timer zu löschen reicht
 * darum nicht: stopPlayback muss den Klang selbst ausblenden, sonst spielt
 * eine gestoppte Liedzeile hörbar zu Ende (Stopp-Knopf, Alt+P, Kapitelwechsel).
 * Der Bordun (playBordun) hat bewusst eine EIGENE Stop-Funktion und bleibt
 * von stopPlayback unberührt (Spielwiese: Wiederholen stoppt den Bordun nicht).
 */
const activeRunGains: { g: GainNode; ac: AudioContext }[] = [];

function registerRunGain(ac: AudioContext, g: GainNode): void {
  activeRunGains.push({ g, ac });
  // Nicht wachsen lassen: alte Läufe sind längst verklungen oder gestoppt.
  while (activeRunGains.length > 8) {
    const old = activeRunGains.shift();
    try {
      old?.g.disconnect();
    } catch {
      /* schon getrennt */
    }
  }
}

export function isPlaying(): boolean {
  return typeof performance !== "undefined" && performance.now() < playingUntil;
}

/** Laufende Wiedergabe abbrechen — geplante Töne verwerfen UND stummblenden. */
export function stopPlayback(): void {
  playToken++;
  for (const t of timers) window.clearTimeout(t);
  timers.length = 0;
  playingUntil = 0;
  for (const { g, ac } of activeRunGains.splice(0)) {
    try {
      const now = ac.currentTime;
      g.gain.cancelScheduledValues(now);
      g.gain.setValueAtTime(Math.max(g.gain.value, 0.0001), now);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
      window.setTimeout(() => {
        try {
          g.disconnect();
        } catch {
          /* schon getrennt */
        }
      }, 250);
    } catch {
      /* Audio nicht verfügbar — nichts zu stoppen */
    }
  }
}

/** Einen einzelnen Ton anspielen (z. B. beim Tippen einer Note). */
export function playTone(n: MusicNote, instrument: Instrument, seconds = 0.5): void {
  const ac = audioContext();
  if (!ac) return;
  // SOFORT und synchron in der Nutzergeste starten (iOS-kritisch, s. playMelody):
  // startVoice nimmt das echte Sample, falls dekodiert, sonst die Synth-Stimme.
  try {
    startVoice(ac, masterBus(ac), instrument, frequency(n), ac.currentTime + 0.01, seconds);
  } catch {
    /* Audio nicht verfügbar — unkritisch */
  }
  // Sample im Hintergrund nachladen, damit der nächste Anschlag echt klingt.
  void ensureNotes(instrument, [midi(n)]);
}

export interface PlayMelodyOpts {
  instrument: Instrument;
  /** Viertel-Dauer in Sekunden (Standard 0.55). */
  quarterSeconds?: number;
  /** Wird beim KLINGEN jedes Note/Pause-Events gerufen (Index in melody.events). */
  onEvent?: (index: number) => void;
  onDone?: () => void;
}

/**
 * Haltebogen auswerten: welche Noten werden NICHT neu angeschlagen (weil eine
 * gebundene Vorgänger-Note weiterklingt), und wie lang klingt ein Anschlag
 * inklusive aller angebundenen Folgenoten? Gebunden wird nur die DIREKT
 * folgende Note gleicher Tonhöhe (Taktstriche dazwischen sind erlaubt).
 */
export function tiePlan(melody: Melody): { skipAttack: boolean[]; chainBeats: number[] } {
  const evs = melody.events;
  const skipAttack = evs.map(() => false);
  const chainBeats = evs.map((ev) => (ev.kind === "bar" ? 0 : beats(ev)));
  for (let i = 0; i < evs.length; i++) {
    const ev = evs[i];
    if (ev.kind !== "note" || !ev.tie) continue;
    let j = i + 1;
    while (j < evs.length && evs[j].kind === "bar") j++;
    const nxt = evs[j];
    if (nxt && nxt.kind === "note" && midi(nxt) === midi(ev)) skipAttack[j] = true;
  }
  // Klingdauer eines Anschlags = eigene Dauer + alle direkt angebundenen
  // Folgenoten (von hinten aufsummiert, damit Ketten funktionieren).
  for (let i = evs.length - 1; i >= 0; i--) {
    const ev = evs[i];
    if (ev.kind !== "note" || !ev.tie) continue;
    let j = i + 1;
    while (j < evs.length && evs[j].kind === "bar") j++;
    if (j < evs.length && skipAttack[j]) chainBeats[i] += chainBeats[j];
  }
  return { skipAttack, chainBeats };
}

/**
 * Melodie abspielen. Bricht eine laufende Wiedergabe ab. Die onEvent/onDone-
 * Callbacks laufen über setTimeout (UI-Highlight), die Töne selbst über die
 * präzise Web-Audio-Uhr. Haltebögen: gebundene Folgenoten werden nicht neu
 * angeschlagen — die erste Note klingt über die ganze Bindung weiter.
 *
 * Stufe-3-Erweiterungen (additiv, alte Aufrufe unverändert):
 *  • note.artic — staccato (45 % der Dauer), tenuto (voll, ohne Gap),
 *    akzent (Anschlag ×1.6);
 *  • melody.dynamik — linearer Gain-Verlauf über die ganze Melodie (cresc/decr);
 *  • melody.tempoRamp — Viertel-Dauer läuft von „from" nach „to" (accel/rit).
 */
export function playMelody(melody: Melody, opts: PlayMelodyOpts): void {
  const ac = audioContext();
  stopPlayback();
  const token = playToken;
  const qBase = opts.quarterSeconds ?? QUARTER_S;
  if (!ac) {
    opts.onDone?.();
    return;
  }
  const { skipAttack, chainBeats } = tiePlan(melody);

  // Dynamik-Rampe: ein Master-Gain vor dem Ziel, linear von start nach end.
  const totalBeats = melody.events.reduce(
    (s, ev) => s + (ev.kind === "bar" ? 0 : beats(ev)),
    0,
  );

  // WICHTIG (iOS/iPadOS): Die Töne SOFORT und synchron planen — der erste Ton
  // eines Laufs muss noch INNERHALB der Nutzergeste starten, sonst schaltet
  // Safari die Audio-Ausgabe nicht scharf und ALLES bleibt stumm (Fehlerbild
  // „Vorlesen ja, Töne nein"). Darum NICHT auf das Sample-Laden warten:
  // startVoice nimmt das echte Sample, falls es schon dekodiert vorliegt, sonst
  // die Synth-Stimme — so klingt es immer sofort (Sofort-Sicherheitsnetz), und
  // die Bank wird nur im Hintergrund vorgewärmt (schön ab der nächsten Runde).
  void ensureNotes(opts.instrument, melodyMidis(melody));

  const acStart = ac.currentTime;
  // Lauf-Gain: alle Töne dieses Laufs hängen daran — stopPlayback blendet ihn
  // aus und macht den Abbruch damit wirklich hörbar (s. registerRunGain).
  const runGain = ac.createGain();
  runGain.gain.value = 1;
  runGain.connect(masterBus(ac));
  registerRunGain(ac, runGain);
  let dest: AudioNode = runGain;
  if (melody.dynamik) {
    const g = ac.createGain();
    g.gain.setValueAtTime(Math.max(melody.dynamik.startGain, 0.0001), acStart);
    // Enddauer grob = totalBeats × mittlere Viertel-Dauer.
    const midQ = melody.tempoRamp
      ? (melody.tempoRamp.from + melody.tempoRamp.to) / 2
      : qBase;
    g.gain.linearRampToValueAtTime(
      Math.max(melody.dynamik.endGain, 0.0001),
      acStart + totalBeats * midQ + 0.1,
    );
    g.connect(runGain);
    dest = g;
  }

  /** Viertel-Dauer an der Stelle „beatsSoFar" (Tempo-Rampe oder konstant). */
  const qAt = (beatsSoFar: number): number => {
    if (!melody.tempoRamp || totalBeats <= 0) return qBase;
    const frac = Math.min(1, beatsSoFar / totalBeats);
    return melody.tempoRamp.from + (melody.tempoRamp.to - melody.tempoRamp.from) * frac;
  };

  let beatsSoFar = 0;
  let t = acStart + 0.06;
  for (let i = 0; i < melody.events.length; i++) {
    const ev = melody.events[i];
    if (ev.kind === "bar") continue;
    const q = qAt(beatsSoFar);
    const dur = beats(ev as MusicNote | MusicRest) * q;
    const wallDelay = (t - acStart) * 1000;
    timers.push(
      window.setTimeout(() => {
        if (token === playToken) opts.onEvent?.(i);
      }, wallDelay),
    );
    if (ev.kind === "note" && !skipAttack[i]) {
      let soundDur = chainBeats[i] * q;
      if (ev.artic === "staccato") soundDur = Math.max(beats(ev) * q * 0.45, 0.08);
      else if (ev.artic === "tenuto") soundDur = Math.max(soundDur - 0.005, 0.12);
      else soundDur = Math.max(soundDur - GAP_S, 0.12);
      let noteDest = dest;
      if (ev.artic === "akzent") {
        const ag = ac.createGain();
        ag.gain.value = 1.6;
        ag.connect(dest);
        noteDest = ag;
      }
      try {
        startVoice(ac, noteDest, opts.instrument, frequency(ev), t, soundDur);
      } catch {
        /* Audio nicht verfügbar */
      }
    }
    beatsSoFar += beats(ev as MusicNote | MusicRest);
    t += dur;
  }
  const totalMs = (t - acStart) * 1000;
  playingUntil = performance.now() + totalMs;
  timers.push(
    window.setTimeout(() => {
      if (token === playToken) opts.onDone?.();
    }, totalMs + 60),
  );
}

/** Gesamtdauer einer Melodie in Millisekunden (fürs faire Zeit-Handling). */
export function melodyMs(melody: Melody, quarterSeconds = QUARTER_S): number {
  let beatsTotal = 0;
  for (const ev of melody.events) {
    if (ev.kind !== "bar") beatsTotal += beats(ev);
  }
  return beatsTotal * quarterSeconds * 1000;
}

// --- Mehrstimmigkeit (Stufe 4 — Welt 6/7) --------------------------------------

/**
 * Einen Akkord (mehrere Töne GLEICHZEITIG) anspielen — für Intervall-/Akkord-
 * Hörübungen (§4.7). Alle Stimmen starten zur selben Zeit; die Gesamtlautstärke
 * wird bei vielen Tönen etwas gesenkt, damit kein Übersteuern entsteht.
 * Bricht laufende Melodie-Wiedergaben NICHT ab (Bordun darf weiterlaufen).
 */
export function playChord(notes: MusicNote[], instrument: Instrument, seconds = 1.1): void {
  const ac = audioContext();
  if (!ac || !notes.length) return;
  // SOFORT und synchron in der Nutzergeste klingen (iOS-kritisch, s. playMelody);
  // Samples nur im Hintergrund vorwärmen, sonst bliebe der Akkord auf dem iPad stumm.
  void ensureNotes(instrument, notes.map((n) => midi(n)));
  const g = ac.createGain();
  g.gain.value = notes.length >= 3 ? 0.68 : 0.82;
  g.connect(masterBus(ac));
  registerRunGain(ac, g); // Stopp/Pause/Kapitelwechsel blendet auch Akkorde aus
  const t0 = ac.currentTime + 0.02;
  for (const n of notes) {
    try {
      startVoice(ac, g, instrument, frequency(n), t0, seconds);
    } catch {
      /* Audio nicht verfügbar */
    }
  }
  playingUntil = performance.now() + seconds * 1000;
}

/**
 * Endlos-Bordun (leise Quinte root + Quinte darüber) für die Orff-Spielwiese
 * (§4.7/§9): läuft im Hintergrund, bis die zurückgegebene Stop-Funktion gerufen
 * wird. Eigener GainNode, damit playMelody/playTone davon unberührt bleiben.
 */
export function playBordun(root: MusicNote): () => void {
  const ac = audioContext();
  if (!ac) return () => {};
  const g = ac.createGain();
  g.gain.value = 0.16;
  g.connect(masterBus(ac));
  const fifthUp: MusicNote = { kind: "note", tone: "g", octave: root.octave, value: "ganze" };
  const t0 = ac.currentTime + 0.02;
  // Zwei lange, sich überlappend erneuernde Töne = „endlos" ohne Klick.
  const oscs: OscillatorNode[] = [];
  for (const freq of [frequency(root), frequency(fifthUp)]) {
    const o = ac.createOscillator();
    o.type = "sine";
    o.frequency.value = freq;
    const og = ac.createGain();
    og.gain.value = 0.5;
    o.connect(og).connect(g);
    o.start(t0);
    oscs.push(o);
    // leiser Oktav-Oberton für etwas Körper
    const o2 = ac.createOscillator();
    o2.type = "sine";
    o2.frequency.value = freq * 2;
    const og2 = ac.createGain();
    og2.gain.value = 0.12;
    o2.connect(og2).connect(g);
    o2.start(t0);
    oscs.push(o2);
  }
  let stopped = false;
  return () => {
    if (stopped) return;
    stopped = true;
    try {
      g.gain.setValueAtTime(g.gain.value, ac.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.12);
      for (const o of oscs) o.stop(ac.currentTime + 0.15);
    } catch {
      /* egal */
    }
  };
}
