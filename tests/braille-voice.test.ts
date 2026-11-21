import { afterEach, describe, expect, it, vi } from "vitest";
import { estimateSpeechMs, speakThenPlay, typingGapMs, useVoice } from "@/lib/braille/voice";

afterEach(() => {
  // Reset store zwischen Tests
  useVoice.setState({ enabled: false });
});

describe("typingGapMs (pure)", () => {
  it("zieht spokenInGap ab, nie negativ", () => {
    expect(typingGapMs(1000, 400)).toBe(600);
    expect(typingGapMs(200, 500)).toBe(0); // nie negativ
  });

  it("speakingNow=true → volle rawDeltaMs (parallel getippt)", () => {
    expect(typingGapMs(1000, 400, true)).toBe(1000);
  });

  it("speakingNow=false und kein spoken → rawDeltaMs unverändert", () => {
    expect(typingGapMs(500, 0)).toBe(500);
  });

  it("negative rawDeltaMs → 0", () => {
    expect(typingGapMs(-100, 0)).toBe(0);
  });
});

describe("useVoice", () => {
  it("default enabled === false", () => {
    expect(useVoice.getState().enabled).toBe(false);
  });

  it("setEnabled(true) setzt Flag (primeSpeech in jsdom no-op via try/catch)", () => {
    // speechSynthesis existiert in jsdom nicht → primeSpeech fängt intern den Fehler
    useVoice.getState().setEnabled(true);
    expect(useVoice.getState().enabled).toBe(true);
    // aufräumen
    useVoice.getState().setEnabled(false);
    expect(useVoice.getState().enabled).toBe(false);
  });

  it("setRate klemmt auf [0.6, 2]", () => {
    useVoice.getState().setRate(0.1);
    expect(useVoice.getState().rate).toBe(0.6);
    useVoice.getState().setRate(5);
    expect(useVoice.getState().rate).toBe(2);
    useVoice.getState().setRate(1.2);
    expect(useVoice.getState().rate).toBeCloseTo(1.2);
  });
});

describe("estimateSpeechMs (Fallback-Schätzung, pure)", () => {
  it("Mindestwert 4000 ms bei leerem/kurzem Text", () => {
    expect(estimateSpeechMs("", 1)).toBe(4000);
    expect(estimateSpeechMs("kurz", 1)).toBe(4000);
  });

  it("wächst mit der Textlänge über den Mindestwert", () => {
    expect(estimateSpeechMs("x".repeat(200), 1)).toBeGreaterThan(4000);
  });

  it("schnelleres Tempo → kürzer; rate wird auf [0.6, 2] geklemmt", () => {
    const t = "x".repeat(300);
    expect(estimateSpeechMs(t, 2)).toBeLessThan(estimateSpeechMs(t, 1));
    // rate 5 wird auf 2 geklemmt → identisch zu rate 2
    expect(estimateSpeechMs(t, 5)).toBe(estimateSpeechMs(t, 2));
  });
});

describe("speakThenPlay (ohne Self-Voicing → feste Standard-Wartezeit)", () => {
  // In jsdom fehlt speechSynthesis → immer der stumme Fall (Vorlesen aus).
  it("ruft onReady erst nach silentGapMs", () => {
    vi.useFakeTimers();
    try {
      const play = vi.fn();
      speakThenPlay("Aufgabe", play, { silentGapMs: 300 });
      expect(play).not.toHaveBeenCalled();
      vi.advanceTimersByTime(299);
      expect(play).not.toHaveBeenCalled();
      vi.advanceTimersByTime(1);
      expect(play).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });

  it("Standard-Wartezeit ohne silentGapMs = 1 s (Screenreader nicht abfragbar)", () => {
    vi.useFakeTimers();
    try {
      const play = vi.fn();
      speakThenPlay("Aufgabe", play);
      vi.advanceTimersByTime(999);
      expect(play).not.toHaveBeenCalled();
      vi.advanceTimersByTime(1);
      expect(play).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });

  it("Abbruch-Funktion verhindert onReady (verlassene Aufgabe)", () => {
    vi.useFakeTimers();
    try {
      const play = vi.fn();
      const cancel = speakThenPlay("Aufgabe", play, { silentGapMs: 300 });
      cancel();
      vi.advanceTimersByTime(1000);
      expect(play).not.toHaveBeenCalled();
      // erneuter Abbruch ist harmlos (idempotent)
      expect(() => cancel()).not.toThrow();
    } finally {
      vi.useRealTimers();
    }
  });
});
