/**
 * Wächter für `lib/braille/voice.ts` (gemeinsam Punktgenau/Klangpunkte), Erweiterung 06.11.2026:
 * de/en wie bisher; jede andere Sprache mit ihrer Stimme - ohne Stimme wird NICHT deutsch vorgelesen,
 * wartende Abläufe laufen weiter.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { speakUiAlways, speakUiThen, speakThenPlay, useVoice } from "@/lib/braille/voice";

const gesprochen: { text: string; lang: string; stimme?: string }[] = [];
let stimmen: SpeechSynthesisVoice[] = [];
const v = (name: string, lang: string) => ({ name, lang, voiceURI: name, default: false, localService: true }) as SpeechSynthesisVoice;

beforeEach(() => {
  gesprochen.length = 0;
  stimmen = [v("Katja", "de-DE"), v("Hortense", "fr-FR")];
  class U {
    text: string; lang = ""; voice: SpeechSynthesisVoice | null = null; rate = 1; volume = 1;
    onend: (() => void) | null = null; onerror: (() => void) | null = null;
    constructor(t: string) { this.text = t; }
  }
  vi.stubGlobal("SpeechSynthesisUtterance", U);
  vi.stubGlobal("speechSynthesis", {
    paused: false, resume() {}, cancel() {}, getVoices: () => stimmen,
    speak: (u: U) => { gesprochen.push({ text: u.text, lang: u.lang, stimme: u.voice?.name }); u.onend?.(); },
  });
  Object.defineProperty(window, "speechSynthesis", { value: globalThis.speechSynthesis, configurable: true });
  useVoice.setState({ enabled: true });
});

describe("voice.ts mit weiteren Sprachen", () => {
  it("Deutsch wie bisher: deutsche Stimme", () => {
    speakUiAlways("Richtig", "de");
    expect(gesprochen[0]).toMatchObject({ text: "Richtig", stimme: "Katja" });
  });
  it("Französisch mit französischer Stimme", () => {
    speakUiAlways("Correct", "fr");
    expect(gesprochen[0]).toMatchObject({ lang: "fr-FR", stimme: "Hortense" });
  });
  it("ohne Stimme der Sprache: nichts gesprochen, keine deutsche Stimme", () => {
    speakUiAlways("Correcto", "es");
    expect(gesprochen).toHaveLength(0);
  });
  it("speakUiThen ohne Stimme ruft trotzdem weiter", () => {
    const weiter = vi.fn();
    speakUiThen("Correcto", weiter, "es");
    expect(weiter).toHaveBeenCalledTimes(1);
    expect(gesprochen).toHaveLength(0);
  });
  it("speakThenPlay ohne Stimme spielt nach der Pause an", () => {
    vi.useFakeTimers();
    const bereit = vi.fn();
    speakThenPlay("Ascolta", bereit, { silentGapMs: 500 }, "it");
    expect(bereit).not.toHaveBeenCalled();
    vi.advanceTimersByTime(600);
    expect(bereit).toHaveBeenCalledTimes(1);
    expect(gesprochen).toHaveLength(0);
    vi.useRealTimers();
  });
});
