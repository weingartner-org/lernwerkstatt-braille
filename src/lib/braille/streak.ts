/**
 * Tagesstreak mit Vergebung für den Braille-Trainer.
 *
 * Tageszähler „X Tage hintereinander geübt" mit EINEM Gnadentag: ein
 * verpasster Tag bricht die Serie NICHT. Erst bei 2+ Tagen Lücke reißt sie.
 *
 * Reine, testbare Funktion ohne Seiteneffekte.
 */

/** So viele Tage Lücke werden vergeben (ein Gnadentag). */
export const STREAK_FORGIVE_DAYS = 1;
/** Millisekunden pro Tag (für Tagesnummer-Berechnung). */
export const DAY_MS = 86_400_000;

export interface StreakState {
  /** Aktuelle Serie in Tagen. */
  count: number;
  /** Letzter Übungstag als Tagesnummer (floor(ts/DAY_MS)). */
  lastDay: number;
  /** Längste je erreichte Serie (monoton wachsend). */
  bestCount: number;
}

export function emptyStreak(): StreakState {
  return { count: 0, lastDay: -1, bestCount: 0 };
}

/**
 * Übung an Zeitstempel `ts` verbuchen. Vergebung: bis zu STREAK_FORGIVE_DAYS
 * Lücke zwischen lastDay und heute hält die Serie aufrecht.
 * gap === 1 = gestern geübt (normal); gap === 2 = Gnadentag (hält);
 * gap ≥ 3 = Serie reißt → count = 1 (Neustart).
 * Reine Funktion — kein Seiteneffekt.
 */
export function recordStreak(s: StreakState, ts: number): StreakState {
  const today = Math.floor(ts / DAY_MS);
  if (s.lastDay < 0) {
    // Erster Eintrag überhaupt
    return { count: 1, lastDay: today, bestCount: Math.max(1, s.bestCount) };
  }
  const gap = today - s.lastDay;
  if (gap <= 0) return s; // Schon heute gezählt — nichts tun

  let count: number;
  if (gap <= 1 + STREAK_FORGIVE_DAYS) {
    count = s.count + 1; // Normal weiterlaufen (inkl. Gnadentag bei gap===2)
  } else {
    count = 1; // Serie gerissen → Neustart
  }
  return { count, lastDay: today, bestCount: Math.max(s.bestCount, count) };
}
