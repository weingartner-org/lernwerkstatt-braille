/**
 * onSessionDone — Runden-Orchestrator des Braille-Trainers.
 *
 * Reine, testbare Funktion: nimmt Roh-Messdaten entgegen, verbuchst ALLE
 * Schichten in der korrekten Reihenfolge und liefert ein Ergebnis-Objekt.
 * Keine React-/Audio-/ARIA-Seiteneffekte — die UI (BrailleTrainerPage)
 * setzt die Earcons + ARIA-Live danach um.
 *
 * Verbindliche Reihenfolge (Bauvertrag §7):
 *  1. Faire Zeit + Rundenkennzahlen
 *  2. Mastery verbuchen
 *  3. Anforderungsstufe verbuchen
 *  4. EMA fortschreiben (nur saubere Runden)
 *  5. Sterne berechnen
 *  6. Freischaltung (Etappen-Pipeline; Fallback auf Level-Granularität in P0b)
 *  7. XP
 *  8. Streak
 *  9. TaskEvents bauen (additiv, Bauvertrag §3.2)
 *
 * P0b-Hinweis zu Schritt 6: etappen.ts (Freischalt-Pipeline) entsteht erst
 * in P1. Bis dahin gilt levelMastered als grober Freischaltungsindikator;
 * unlocked/unlockedEtappe bleiben null (keine Fanfare). Die volle Verdrahtung
 * erfolgt in P1 (_FORTSCHRITT.md).
 */
import type { BrailleSystem } from "./tables";
import type { TaskEvent } from "./account";
import type { BrailleProgress } from "./progress";
import { getLevelMastery, getSystemStufe } from "./progress";
import { playerLevel } from "./progress";
import {
  recordAttempt, recordStufe, isLevelMastered,
} from "./adaptive";
import { speedTargetCpm, updateSpeedEma, roundStars } from "./stars";
import { roundXp } from "./xp";
import { recordStreak, emptyStreak } from "./streak";
import { typingGapMs } from "./voice";
import { MASTERY_ACC } from "./adaptive";

export interface SessionAttempt {
  prompt: string;
  correct: boolean;
  cells: number;
  rawMs: number;
  spokenMs?: number;
  typed?: string;
  pasted?: boolean;
  blurred?: boolean;
}

export interface SessionInput {
  progress: BrailleProgress;
  system: BrailleSystem;
  /** Gespieltes Level (eingefrorene id). */
  levelId: string;
  /** Richtung der Session — write oder read. */
  direction: "write" | "read";
  /** Alle Aufgaben der Runde in Reihenfolge. */
  attempts: ReadonlyArray<SessionAttempt>;
  /** Date.now()-Wert zum Zeitpunkt des Rundenabschlusses. */
  now: number;
}

export interface SessionResult {
  /** Neuer Stand (zu speichern). */
  progress: BrailleProgress;
  /** Additive TaskEvents (zu recordEvent je Event). */
  events: TaskEvent[];
  /** Sterne 1..3 dieser Runde. */
  stars: number;
  /** Treffsicherheit der Runde 0..1. */
  acc: number;
  /** Faire Zellen/Min der Runde. */
  cpm: number;
  xpGained: number;
  /** Übungsstufe (XP-Ring) in dieser Runde gestiegen? */
  xpLevelUp: boolean;
  /** Anforderungsstufe (adaptive, nur Lehrkraft) in dieser Runde gestiegen? */
  stufeUp: boolean;
  /**
   * Neu freigeschaltete EtappenUnit.key oder null.
   * In P0b immer null (etappen.ts fehlt noch; volle Verdrahtung in P1).
   */
  unlocked: string | null;
  /**
   * Neu abgeschlossene/geöffnete Etappe-id oder null.
   * In P0b immer null.
   */
  unlockedEtappe: string | null;
  /** Level in dieser Runde gemeistert (Level-Granularität)? */
  levelMastered: boolean;
}

/**
 * Runden-Ergebnis berechnen. Reine Funktion, testbar ohne DOM.
 * Verbindliche Reihenfolge: faire Zeit → Mastery → Stufe → EMA →
 * Sterne → Freischaltung → XP → Streak → Events.
 */
export function onSessionDone(input: SessionInput): SessionResult {
  const { progress, system, levelId, direction, attempts, now } = input;

  // --- 1. Faire Zeit + Rundenkennzahlen ------------------------------------
  const fairMsArr = attempts.map((a) =>
    typingGapMs(a.rawMs, a.spokenMs ?? 0, false),
  );
  const totalFairMs = fairMsArr.reduce((s, x) => s + x, 0);
  const totalAttempts = attempts.length;
  const correctCount = attempts.filter((a) => a.correct).length;
  const correctCells = attempts
    .filter((a) => a.correct)
    .reduce((s, a) => s + a.cells, 0);

  const acc = totalAttempts > 0 ? correctCount / totalAttempts : 0;
  // Keine Division durch 0; cpm ist faire Zellen/Min
  const cpm = totalFairMs > 0 ? (correctCells / totalFairMs) * 60_000 : 0;

  // --- 2. Mastery verbuchen ------------------------------------------------
  let mastery = getLevelMastery(progress, levelId);
  for (const a of attempts) {
    mastery = recordAttempt(mastery, a.prompt, a.correct);
  }
  const levelMastered = isLevelMastered(mastery);

  // --- 3. Anforderungsstufe verbuchen --------------------------------------
  const oldStufe = getSystemStufe(progress, system);
  let stufe = { ...oldStufe };
  for (const a of attempts) {
    stufe = recordStufe(stufe, a.correct);
  }
  const stufeUp = stufe.stufe > oldStufe.stufe;

  // --- 4. EMA fortschreiben (nur saubere Runden) ---------------------------
  const oldSpeedEma = progress.speedEma?.[system];
  const newSpeedEma = acc >= MASTERY_ACC
    ? updateSpeedEma(oldSpeedEma, cpm)
    : oldSpeedEma; // unsaubere Runde → EMA unangetastet

  // --- 5. Sterne berechnen (NACH Stufen-/EMA-Update) ----------------------
  const target = speedTargetCpm(stufe.stufe, newSpeedEma);
  const stars = roundStars(acc, cpm, target);

  // --- 6. Freischaltung (Etappen-Pipeline) ---------------------------------
  // P0b-Fallback: etappen.ts fehlt noch.
  // In P1 wird hier über etappenForLevel() die Freischalt-Pipeline laufen.
  const unlocked: string | null = null;
  const unlockedEtappe: string | null = null;
  const introducedNew = progress.introduced ?? {};

  // --- 7. XP ---------------------------------------------------------------
  const oldXp = progress.xp;
  const xpGained = roundXp({ correct: correctCells, stars, unlocked: unlocked !== null });
  const newXp = oldXp + xpGained;
  const xpLevelUp = playerLevel(newXp).level > playerLevel(oldXp).level;

  // --- 8. Streak -----------------------------------------------------------
  const oldStreak = progress.streak ?? emptyStreak();
  const newStreak = recordStreak(oldStreak, now);

  // --- Neuen BrailleProgress zusammenbauen (additiv, keine Pflichtfelder) --
  const newProgress: BrailleProgress = {
    ...progress,
    xp: newXp,
    mastery: { ...progress.mastery, [levelId]: mastery },
    stufen: { ...progress.stufen, [system]: stufe },
    speedEma: { ...progress.speedEma, [system]: newSpeedEma },
    introduced: introducedNew,
    streak: newStreak,
    levels: {
      ...progress.levels,
      [levelId]: {
        completed: levelMastered || (progress.levels[levelId]?.completed ?? false),
        bestStars: Math.max(stars, progress.levels[levelId]?.bestStars ?? 0),
        attempts: (progress.levels[levelId]?.attempts ?? 0) + totalAttempts,
      },
    },
  };

  // --- 9. TaskEvents (additiv, Bauvertrag §3.2) ----------------------------
  const events: TaskEvent[] = attempts.map((a, i) => {
    const fairMs = fairMsArr[i];
    const ev: TaskEvent = {
      ts: now + i,
      level: levelId,
      system,
      direction,
      correct: a.correct,
      ms: fairMs,
      cells: a.cells,
    };
    if (a.pasted) ev.pasted = true;
    if (a.blurred) ev.blurred = true;
    // spokenMs nur schreiben wenn > 0 (kein leeres Default — Telemetrie-Deckel)
    if ((a.spokenMs ?? 0) > 0) ev.spokenMs = a.spokenMs;
    // typed nur bei Fehler und bekannter getippter Einheit
    if (!a.correct && a.typed) ev.typed = a.typed;
    return ev;
  });

  return {
    progress: newProgress,
    events,
    stars,
    acc,
    cpm,
    xpGained,
    xpLevelUp,
    stufeUp,
    unlocked,
    unlockedEtappe,
    levelMastered,
  };
}
