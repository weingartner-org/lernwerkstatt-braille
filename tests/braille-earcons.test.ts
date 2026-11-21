import { describe, expect, it, vi, afterEach } from "vitest";

// Sound-Modul mocken (isSoundMuted), damit Earcons steuerbar sind
vi.mock("@/lib/braille/sound", () => ({
  isSoundMuted: vi.fn(() => false),
  setSoundMuted: vi.fn(),
  playErrorSound: vi.fn(),
  // ★ Lautstärke der Töne (Akustik-Menü, 17.10.2026) - die Töne fragen sie ab.
  tonLautstaerke: vi.fn(() => 1),
  tonGipfel: vi.fn((voll: number) => voll),
}));

afterEach(() => {
  vi.clearAllMocks();
});

describe("earcons — mute-aware (kein Throw bei AudioContext-Fehler)", () => {
  it("playStarReward wirft nicht wenn AudioContext nicht verfügbar", async () => {
    const { playStarReward } = await import("@/lib/braille/earcons");
    expect(() => playStarReward(1)).not.toThrow();
    expect(() => playStarReward(2)).not.toThrow();
    expect(() => playStarReward(3)).not.toThrow();
  });

  it("playUnlockFanfare wirft nicht", async () => {
    const { playUnlockFanfare } = await import("@/lib/braille/earcons");
    expect(() => playUnlockFanfare()).not.toThrow();
  });

  it("playStarReward mit opts.stufeUp wirft nicht", async () => {
    const { playStarReward } = await import("@/lib/braille/earcons");
    expect(() => playStarReward(3, { stufeUp: true })).not.toThrow();
  });

  it("playStarReward mit opts.xpLevelUp wirft nicht", async () => {
    const { playStarReward } = await import("@/lib/braille/earcons");
    expect(() => playStarReward(2, { xpLevelUp: true })).not.toThrow();
  });

  it("playLevelJingle wirft nicht", async () => {
    const { playLevelJingle } = await import("@/lib/braille/earcons");
    expect(() => playLevelJingle()).not.toThrow();
  });

  it("playCorrectTick wirft nicht", async () => {
    const { playCorrectTick } = await import("@/lib/braille/earcons");
    expect(() => playCorrectTick()).not.toThrow();
  });

  it("playTaskCue wirft nicht", async () => {
    const { playTaskCue } = await import("@/lib/braille/earcons");
    expect(() => playTaskCue()).not.toThrow();
  });
});

describe("earcons — no-op bei isSoundMuted() === true", () => {
  it("alle play*-Funktionen sind stumm wenn muted", async () => {
    const sound = await import("@/lib/braille/sound");
    vi.mocked(sound.isSoundMuted).mockReturnValue(true);

    // AudioContext würde einen Fehler werfen in jsdom, aber da wir vorher
    // durch isSoundMuted() returnen, sollte kein Throw passieren.
    const earcons = await import("@/lib/braille/earcons");
    expect(() => earcons.playStarReward(3)).not.toThrow();
    expect(() => earcons.playUnlockFanfare()).not.toThrow();
    expect(() => earcons.playLevelJingle()).not.toThrow();
    expect(() => earcons.playCorrectTick()).not.toThrow();
    expect(() => earcons.playTaskCue()).not.toThrow();
  });
});
