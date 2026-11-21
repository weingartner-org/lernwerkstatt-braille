/**
 * ════════════════════════════════════════════════════════════════════════════
 * ★★★★★ STRG MACHT STILL - auch in Punktgenau und Klangpunkte
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Johannes, 04.09.2026: erst *„egal an welcher Stelle gelesen wird, mit Strg
 * muss es sofort leise werden"*, dann *„mach das auch für die anderen Apps."*
 *
 * Beide Programme sprechen über `lib/braille/voice.ts`. Geprüft wird hier, dass
 * DIESER Motor den Stumm-Zuhörer wirklich anhängt - die Regel selbst
 * (`lib/stummTaste.ts`) hat ihren eigenen Wächter.
 *
 * ⚠️ Warum je Motor ein eigener Fall und nicht einer für alle drei: Lägen alle
 *    drei Motoren in EINEM Test, würde ein einziger Strg-Druck alle drei
 *    Zuhörer auslösen - und ein Zähler, der auf 1 steht, bewiese nicht, WELCHER
 *    davon reagiert hat. Ein vergessener Motor bliebe unsichtbar
 *    ([[feedback_gruener_waechter_beweist_was]]).
 */
import { describe, it, expect, beforeEach, vi } from "vitest";

class FakeUtterance {
  text: string;
  rate = 1;
  pitch = 1;
  volume = 1;
  lang = "";
  voice: SpeechSynthesisVoice | null = null;
  onend: (() => void) | null = null;
  onerror: (() => void) | null = null;
  constructor(text: string) {
    this.text = text;
  }
  addEventListener(): void {}
  removeEventListener(): void {}
}

let cancelCalls = 0;
const gesprochen: string[] = [];

const fakeSynth = {
  speaking: false,
  pending: false,
  paused: false,
  getVoices: () => [] as SpeechSynthesisVoice[],
  speak(u: FakeUtterance) {
    if (u.volume === 0) return; // die lautlose Freischalt-Ansage (primeSpeech)
    gesprochen.push(u.text);
    fakeSynth.speaking = true;
  },
  cancel() {
    cancelCalls += 1;
    fakeSynth.speaking = false;
    fakeSynth.pending = false;
  },
  resume() {},
  pause() {},
  addEventListener() {},
  removeEventListener() {},
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const w = window as any;
w.speechSynthesis = fakeSynth;
w.SpeechSynthesisUtterance = FakeUtterance;

// Erst NACH der Attrappe laden — der Motor hängt sich beim Laden ans Dokument.
const { speak, useVoice } = await import("../src/lib/braille/voice");

/** Eine Taste, so wie der Browser sie meldet. */
function taste(init: KeyboardEventInit): void {
  document.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, ...init }));
}

beforeEach(() => {
  vi.useFakeTimers();
  useVoice.setState({ enabled: true });
  gesprochen.length = 0;
  cancelCalls = 0;
  fakeSynth.speaking = false;
});

/** Zustand: es wird gerade vorgelesen. */
function esSpricht(): void {
  speak("ein langer Satz, der gerade vorgelesen wird");
  vi.advanceTimersByTime(400);
  expect(gesprochen.length).toBeGreaterThan(0);
  cancelCalls = 0;
}

describe("Punktgenau / Klangpunkte: Strg macht still", () => {
  it("★ Strg bricht die laufende Ansage ab", () => {
    esSpricht();
    taste({ key: "Control", ctrlKey: true });
    expect(cancelCalls).toBe(1);
    expect(fakeSynth.speaking).toBe(false);
  });

  it("★★★★★ GEGENPROBE AltGr: Strg + Alt ist AltGr und macht NICHT still", () => {
    esSpricht();
    taste({ key: "@", ctrlKey: true, altKey: true });
    expect(cancelCalls).toBe(0);
    expect(fakeSynth.speaking).toBe(true);
  });

  it("eine gewöhnliche Taste macht über diesen Weg nichts still", () => {
    esSpricht();
    taste({ key: "f" });
    taste({ key: "Shift", shiftKey: true });
    expect(cancelCalls).toBe(0);
  });

  it("★ Strg schaltet das Vorlesen nicht AB", () => {
    esSpricht();
    taste({ key: "Control", ctrlKey: true });
    expect(useVoice.getState().enabled).toBe(true);
  });
});
