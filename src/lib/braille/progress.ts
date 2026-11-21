/**
 * Spielstand des Braille-Trainers — vorerst lokal im Browser (localStorage).
 * Struktur ist bewusst backend-freundlich: später synchronisiert ein Konto den
 * Stand und die Lehrkraft sieht die Statistik (Phase 2).
 */
import type { BrailleSystem } from "./tables";
import { emptyMastery, emptyStufe } from "./adaptive";
import type { LevelMastery, SystemStufe } from "./adaptive";
import { emptyStreak } from "./streak";
import type { StreakState } from "./streak";
// Nur Type-Import - kein Runtime-Kreisimport (etappen→progress→setup→etappen)
import type { BrailleSetup } from "./setup";
// Nur Type-Import - kein Runtime-Kreisimport (abzeichen→progress→abzeichen):
// `abzeichen.ts` importiert `playerLevel` u. a. zur Laufzeit AUS dieser Datei;
// der Import hier bleibt beim Typ, damit daraus kein echter Rundlauf wird.
import type { AbzeichenZaehler } from "./abzeichen";
import type { AreaKey } from "./areas";

export interface LevelRecord {
  completed: boolean;
  bestStars: number; // 0..3
  attempts: number;
}

export interface BrailleProgress {
  xp: number;
  levels: Record<string, LevelRecord>;
  /**
   * Adaptives Lern-Gedächtnis je Level (Mastery-Gate + Aufgaben-Gewichtung).
   * Optional, damit alte Spielstände ohne dieses Feld weiter laden. Siehe
   * [[project_braille_trainer]].
   */
  mastery?: Record<string, LevelMastery>;
  /**
   * Adaptive Anforderungsstufe (1–10) je Übungs-BEREICH. Historische Keys sind
   * die Schriftsysteme ("basis"/"voll"/"computer"); seit 2026-07-09 speichert
   * Punktgenau je Bereichs-Schlüssel — zusätzlich "kurzschrift"/"ueb", damit
   * Kurzschrift und UEB nicht mehr die Vollschrift-Stufe teilen (die Hilfe
   * verspricht eine eigene Stufe je Bereich). Altstände laden unverändert:
   * basis/voll/computer heißen als Bereich gleich.
   */
  stufen?: Partial<Record<string, SystemStufe>>;
  /**
   * NEU (P0b): Freigeschaltete EtappenUnit.keys je Level-id (Etappen-Pipeline).
   * Befüllt ab P1; in P0b immer {}. Additiv, nie required.
   */
  introduced?: Record<string, string[]>;
  /**
   * NEU (P0b): Persönliches Tempo-EMA je Schriftsystem (für stars.ts).
   * Additiv, nie required — Altstände ohne dieses Feld laden weiter.
   */
  speedEma?: Partial<Record<BrailleSystem, number>>;
  /**
   * NEU (P0b): Tagesstreak mit Vergebung (streak.ts).
   * Additiv, nie required.
   */
  streak?: StreakState;
  /**
   * NEU (P3): Lehrkraft-Setup (Express-Pfad, Einstiegs-Stufe).
   * Additiv, nie required — Altstände ohne dieses Feld laden mit defaultSetup() weiter.
   */
  setup?: BrailleSetup;
  /**
   * NEU (Resume): zuletzt geübte Stelle — Bereich, Etappe (per id, nicht
   * Index — Etappenreihen können sich je Klassen-Einstellung ändern, siehe
   * areas.ts/buildAreas) und Übungsrichtung. Additiv, nie required — Altstände
   * ohne dieses Feld starten wie bisher bei currentIndex()/"basis"/"write".
   */
  lastPlace?: {
    area: AreaKey;
    etappeId: string;
    direction: "write" | "read";
  };
  /**
   * ★★★ NEU (07.09.2026, Wochenaufgabe): WANN eine Etappe zum ersten Mal
   * gemeistert wurde - Level-id → Zeitstempel.
   *
   * Ohne diese Zahl lässt sich die Frage „wie viele Etappen hat das Kind DIESE
   * WOCHE geschafft" nicht beantworten: `levels[id].completed` sagt nur DASS,
   * nicht WANN, und die Ereignisliste kennt den Augenblick der Meisterung
   * nicht (sie zählt Aufgaben, nicht Etappen).
   *
   * ⚠️ NUR beim ERSTEN Mal geschrieben. Wer eine gemeisterte Etappe
   * wiederholt, verschiebt das Datum nicht - sonst wanderte eine im September
   * geschaffte Etappe im Dezember in die Dezember-Woche und stünde einem Kind
   * zweimal zugute.
   *
   * Additiv, nie required: Altstände ohne dieses Feld laden weiter, und ihre
   * schon gemeisterten Etappen zählen dann für KEINE Woche - lieber keine Zahl
   * als eine erfundene ([[feedback_zusammenfassung_ist_kein_beleg]]).
   */
  gemeistertAm?: Record<string, number>;
  /**
   * NEU (Abzeichen, 22.09.2026): verdiente Abzeichen - id → Verdien-Zeitpunkt.
   * Additiv, nie required. Siehe [[src/lib/braille/abzeichen]].
   */
  abzeichen?: Record<string, number>;
  /**
   * NEU (Abzeichen, 22.09.2026): Lebenszeit-Zähler für die Abzeichen-Familien,
   * die sich nicht allein aus `levels`/`gemeistertAm`/`streak` ablesen lassen
   * (Trefferserien, fehlerfreie Meisterungen, aktive Tage/Wochen, die
   * Geheim-Merker). Additiv, nie required.
   */
  abzeichenZaehler?: AbzeichenZaehler;
  /**
   * NEU (22.09.2026, Lesezeit-Rechnung): das gelernte Lesetempo dieses
   * Kindes in Zellen/Minute - gleitender Mittelwert, dieselbe Bauart wie
   * `speedEma` oben (`stars.ts`). Additiv, nie required: Altstände ohne
   * dieses Feld starten beim Vorgabewert `LESE_START_CPM`
   * ([[src/lib/braille/lesezeit]]). Siehe dort für die volle Begründung.
   */
  leseTempoCpm?: number;
}

const STORAGE_KEY = "braille-trainer:v1";
const XP_PER_PLAYER_LEVEL = 100;

/** Default-Setup (inline, kein Kreisimport). */
const DEFAULT_SETUP: BrailleSetup = { extendedNumbers: false, expressPath: false };

export function emptyProgress(): BrailleProgress {
  return {
    xp: 0,
    levels: {},
    mastery: {},
    stufen: {},
    introduced: {},
    speedEma: {},
    streak: emptyStreak(),
    setup: { ...DEFAULT_SETUP },
    gemeistertAm: {},
    abzeichen: {},
  };
}

export function loadProgress(): BrailleProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyProgress();
    const data = JSON.parse(raw) as Partial<BrailleProgress>;
    return {
      xp: typeof data.xp === "number" ? data.xp : 0,
      levels: data.levels ?? {},
      mastery: data.mastery ?? {},
      stufen: data.stufen ?? {},
      // P0b-Felder: sicher defaulten, damit Altstände ohne sie laden.
      introduced: data.introduced ?? {},
      speedEma: data.speedEma ?? {},
      streak: data.streak ?? emptyStreak(),
      // P3-Feld: Merge — Altstände ohne setup bekommen den Default.
      setup: data.setup ? { ...DEFAULT_SETUP, ...data.setup } : { ...DEFAULT_SETUP },
      lastPlace: data.lastPlace,
      gemeistertAm: data.gemeistertAm ?? {},
      abzeichen: data.abzeichen ?? {},
      abzeichenZaehler: data.abzeichenZaehler,
      // Wehrhaft: ein kaputter/negativer Wert (fremd editierter Speicher)
      // fällt auf „nichts gelernt" zurück, nie auf NaN/negativ.
      leseTempoCpm:
        typeof data.leseTempoCpm === "number" &&
        Number.isFinite(data.leseTempoCpm) &&
        data.leseTempoCpm > 0
          ? data.leseTempoCpm
          : undefined,
    };
  } catch {
    return emptyProgress();
  }
}

/** Lern-Gedächtnis eines Levels (mit Default für alte/leere Spielstände). */
export function getLevelMastery(p: BrailleProgress, levelId: string): LevelMastery {
  return p.mastery?.[levelId] ?? emptyMastery();
}

/** Adaptive Anforderungsstufe eines Bereichs/Schriftsystems (mit Default). */
export function getSystemStufe(p: BrailleProgress, key: BrailleSystem | string): SystemStufe {
  return p.stufen?.[key] ?? emptyStufe();
}

export function saveProgress(p: BrailleProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch {
    /* localStorage nicht verfügbar — Spielstand bleibt nur in dieser Sitzung */
  }
}

/** Spieler-Stufe + Fortschritt zur nächsten Stufe aus der Gesamt-XP. */
export function playerLevel(xp: number): {
  level: number;
  into: number;
  need: number;
} {
  const level = Math.floor(xp / XP_PER_PLAYER_LEVEL) + 1;
  const into = xp % XP_PER_PLAYER_LEVEL;
  return { level, into, need: XP_PER_PLAYER_LEVEL };
}

/** Ist ein Level freigeschaltet? Das erste immer, sonst wenn das vorige fertig ist. */
export function isLevelUnlocked(
  p: BrailleProgress,
  levelIds: readonly string[],
  id: string,
): boolean {
  const idx = levelIds.indexOf(id);
  if (idx <= 0) return true;
  const prev = levelIds[idx - 1];
  return p.levels[prev]?.completed === true;
}
