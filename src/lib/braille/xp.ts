/**
 * Positive XP-Formel für den Braille-Trainer — jede Runde belohnt, nie Abzug.
 *
 * Port der Idee aus lib/typing/progress.ts (XP_PER_PLAYER_LEVEL = 100).
 * In einer eigenen Datei, damit progress.ts (Persistenz) und die Belohnungs-
 * Schicht entkoppelt bleiben.
 *
 * Der XP-Ring (Übungsstufe) kann damit nie sinken — selbst eine schwache Runde
 * bringt mindestens XP_BASE XP. Das hält Kinder motiviert, auch wenn es
 * gerade hakt.
 */

/** XP je Übungsstufe (Ring); identisch zum Bestand in progress.ts. */
export const XP_PER_PLAYER_LEVEL = 100;
/** Mindest-XP jeder Runde — jede Runde belohnt, nie 0. */
export const XP_BASE = 5;
/** XP je richtiger Zelle (Einzelbuchstabe / Zelle). */
export const XP_PER_CORRECT = 1;
/** XP je Stern (1–3) zusätzlich zum Base. */
export const XP_STAR_BONUS = 4;
/** Einmaliger Bonus, wenn in der Runde eine neue Einheit freigeschaltet wurde. */
export const XP_UNLOCK_BONUS = 15;

export interface RoundOutcome {
  /** Richtige Zellen der Runde. */
  correct: number;
  /** Sterne 1..3. */
  stars: number;
  /** Wurde eine Einheit freigeschaltet? */
  unlocked: boolean;
}

/**
 * XP-Gewinn einer Runde. Garantiert ≥ XP_BASE (jede Runde belohnt, nie 0).
 * Kein Abzug — auch 1 Stern bei 0 richtigen bringt mindestens XP_BASE + 1×4 = 9.
 */
export function roundXp(o: RoundOutcome): number {
  const base = XP_BASE;
  const perf = Math.max(0, o.correct) * XP_PER_CORRECT;
  const star = Math.max(1, Math.min(3, o.stars)) * XP_STAR_BONUS;
  const unlock = o.unlocked ? XP_UNLOCK_BONUS : 0;
  return Math.max(XP_BASE, base + perf + star + unlock);
}
