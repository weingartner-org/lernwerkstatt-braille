/**
 * Adaptives Lernen für den Braille-Trainer — „weiter, wenn es sitzt".
 *
 * Anders als beim Tipptrainer „Tastenflow" (dort treibt das TEMPO die Stufen
 * 1–50) geht es beim Braille-Lernen um ZUVERLÄSSIGE ERKENNUNG, nicht um
 * Geschwindigkeit: Wer einen Buchstaben oft falsch hat, kann ihn noch nicht.
 * Darum entscheidet hier ausschließlich die TREFFSICHERHEIT — Tempo wird nie
 * zur Hürde (ausdrücklicher Wunsch von Johannes).
 *
 * Drei Bausteine, alle als reine, testbare Funktionen (kein React, kein Storage):
 *
 *  A) Mastery-Gate  — ein Level gilt erst als geschafft, wenn die letzten
 *     Eingaben zuverlässig sitzen (≥ {@link MASTERY_ACC}) UND nichts aus der
 *     jüngsten Übung mehr offen falsch ist — statt stur 100 Aufgaben.
 *  B) Gewichtung    — schwache Aufgaben (zuletzt falsch) kommen von selbst
 *     häufiger dran, gefestigte seltener (Vokabel-Trainer-Effekt).
 *  C) Anforderungs- — eine feine Stufe 1–10 je Schriftsystem, die sich nach der
 *     stufe           Treffsicherheit automatisch hebt/senkt und die
 *                     Hilfestellung steuert (viel Stütze unten, echte Erkennung
 *                     oben). Auch hier zählt NUR Genauigkeit, nie Tempo.
 *
 * Siehe [[project_braille_trainer]], [[feedback_data_transparency]].
 */

// ===========================================================================
// A) + B) Mastery-Gate und Gewichtung (pro Level)
// ===========================================================================

/** So viele der jüngsten Eingaben fließen in das Abschluss-Urteil ein. */
export const MASTERY_WINDOW = 16;
/** So viele Eingaben braucht es mindestens, bevor ein Level abgeschlossen werden kann. */
export const MASTERY_MIN_ATTEMPTS = 12;
/** Treffsicherheit im Fenster, ab der ein Level „sitzt" (0..1). */
export const MASTERY_ACC = 0.9;
/** Ab so vielen richtigen Eingaben in Folge gilt eine Aufgabe als gefestigt. */
export const SOLID_STREAK = 3;

/** Statistik je Aufgabe (Prompt-String) — Grundlage der Gewichtung. */
export interface ItemStat {
  /** Richtige Eingaben in Folge (0 = neu oder zuletzt falsch). */
  streak: number;
  /** Wie oft insgesamt gestellt. */
  seen: number;
  /** Wie oft insgesamt falsch. */
  wrong: number;
}

/** Eine einzelne Eingabe im gleitenden Fenster. */
export interface Attempt {
  prompt: string;
  correct: boolean;
}

/** Lern-Gedächtnis eines Levels (gleitendes Fenster + Aufgaben-Statistik). */
export interface LevelMastery {
  /** Die letzten bis zu {@link MASTERY_WINDOW} Eingaben (für das Gate). */
  window: Attempt[];
  /** Statistik je Aufgabe, auch über das Fenster hinaus (für die Gewichtung). */
  items: Record<string, ItemStat>;
}

export function emptyMastery(): LevelMastery {
  return { window: [], items: {} };
}

function mean(xs: readonly number[]): number {
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;
}

function clamp01(x: number): number {
  return Math.max(0, Math.min(1, x));
}

/**
 * Eine beendete Aufgabe verbuchen — liefert ein NEUES Mastery-Objekt (rein).
 * Aktualisiert das gleitende Fenster und die Aufgaben-Statistik.
 */
export function recordAttempt(
  m: LevelMastery,
  prompt: string,
  correct: boolean,
): LevelMastery {
  const window = [...m.window, { prompt, correct }].slice(-MASTERY_WINDOW);
  const prev = m.items[prompt] ?? { streak: 0, seen: 0, wrong: 0 };
  const items = {
    ...m.items,
    [prompt]: {
      streak: correct ? prev.streak + 1 : 0,
      seen: prev.seen + 1,
      wrong: prev.wrong + (correct ? 0 : 1),
    },
  };
  return { window, items };
}

/**
 * Auswahl-Gewicht einer Aufgabe: zuletzt falsch → kommt am häufigsten, neu →
 * bevorzugt zeigen, gefestigt (≥ {@link SOLID_STREAK}) → normales Maß.
 */
export function itemWeight(stat: ItemStat | undefined): number {
  if (!stat || stat.seen === 0) return 2; // noch nie gestellt → zeigen
  if (stat.streak === 0) return 4; // zuletzt falsch → gezielt wiederholen
  if (stat.streak < SOLID_STREAK) return 2; // auf gutem Weg, noch nicht gefestigt
  return 1; // sitzt
}

export interface PickOptions {
  /** Aufgabe, die nicht direkt wiederholt werden soll (letzter Prompt). */
  avoid?: string;
  /**
   * Bias auf kurze Aufgaben, 0..1 (von der Anforderungsstufe): 1 = kurze stark
   * bevorzugt (Anfang), 0 = Länge egal.
   */
  shortBias?: number;
  /** Zufallsquelle (für Tests injizierbar). */
  rnd?: () => number;
}

/**
 * Nächste Aufgabe gewichtet ziehen: schwache Aufgaben häufiger (B), kurze je
 * nach Anforderungsstufe bevorzugt (C). Vermeidet den direkten Wiederholer.
 */
export function pickWeighted(
  pool: readonly string[],
  m: LevelMastery,
  opts: PickOptions = {},
): string {
  const { avoid, shortBias = 0, rnd = Math.random } = opts;
  const candidates = pool.length > 1 && avoid ? pool.filter((p) => p !== avoid) : [...pool];
  if (candidates.length === 0) return pool[0] ?? "";

  const avgLen = mean(candidates.map((c) => c.length)) || 1;
  const weights = candidates.map((c) => {
    let w = itemWeight(m.items[c]);
    if (shortBias > 0) {
      // kurze Aufgaben höher gewichten: bei Länge 0 → Faktor (1+shortBias),
      // bei doppelter Durchschnittslänge → Faktor (1−shortBias).
      const rel = clamp01((c.length - avgLen) / avgLen + 0.5); // 0 = kurz, 1 = lang
      w *= 1 + shortBias * (1 - 2 * rel);
    }
    return Math.max(0.05, w);
  });

  const total = weights.reduce((a, b) => a + b, 0);
  let r = rnd() * total;
  for (let i = 0; i < candidates.length; i++) {
    r -= weights[i];
    if (r <= 0) return candidates[i];
  }
  return candidates[candidates.length - 1];
}

/**
 * Ist ein Level gemeistert? Drei Bedingungen (A):
 *   1. genug Eingaben ({@link MASTERY_MIN_ATTEMPTS}),
 *   2. Treffsicherheit im Fenster ≥ {@link MASTERY_ACC},
 *   3. keine Aufgabe AUS DEM FENSTER ist aktuell noch offen falsch (streak 0) —
 *      die jüngsten Wackelkandidaten wurden also wieder richtig gemacht.
 * Tempo spielt bewusst keine Rolle.
 */
export function isLevelMastered(m: LevelMastery): boolean {
  const w = m.window;
  if (w.length < MASTERY_MIN_ATTEMPTS) return false;
  if (mean(w.map((a) => (a.correct ? 1 : 0))) < MASTERY_ACC) return false;
  for (const prompt of new Set(w.map((a) => a.prompt))) {
    const stat = m.items[prompt];
    if (stat && stat.seen > 0 && stat.streak === 0) return false; // noch wackelig
  }
  return true;
}

/**
 * Fortschritt zum Abschluss als 0..1 für die Anzeige (Ring). Füllt sich mit der
 * Zahl der Eingaben, gedeckelt durch die Treffsicherheit; voll erst bei echter
 * Meisterung (sonst höchstens 0,95, damit der letzte Wackler sichtbar bleibt).
 */
export function masteryProgress(m: LevelMastery): number {
  if (m.window.length === 0) return 0;
  if (isLevelMastered(m)) return 1;
  const recent = m.window.slice(-MASTERY_WINDOW);
  const attemptPart = clamp01(m.window.length / MASTERY_MIN_ATTEMPTS);
  const accPart = clamp01(mean(recent.map((a) => (a.correct ? 1 : 0))) / MASTERY_ACC);
  return Math.min(0.95, Math.min(attemptPart, accPart));
}

// ===========================================================================
// C) Anforderungsstufe (Hilfestellung) je Schriftsystem
// ===========================================================================

export const STUFE_MIN = 1;
export const STUFE_MAX = 10;
/** Einstieg für neue Lernende: noch viel Stütze, aber nicht ganz unten. */
export const STUFE_START = 3;
/** So viele jüngste Eingaben betrachtet die Stufen-Anpassung. */
export const STUFE_WINDOW = 8;
/** Erst nach so vielen Eingaben auf einer Stufe wird sie überhaupt angepasst. */
export const STUFE_MIN_AT = 4;
/** Treffsicherheit, ab der es eine Stufe hinaufgeht. */
export const STUFE_UP_ACC = 0.9;
/** Unter dieser Treffsicherheit geht es eine Stufe hinunter. */
export const STUFE_DOWN_ACC = 0.7;
/** Unter dieser Treffsicherheit zurück auf die unterste, voll gestützte Stufe. */
export const STUFE_RESET_ACC = 0.5;

/** Adaptive Anforderungsstufe eines Schriftsystems + ihr Beobachtungsfenster. */
export interface SystemStufe {
  stufe: number; // 1..10
  /** Eingaben auf der AKTUELLEN Stufe (wird bei jedem Wechsel geleert). */
  window: boolean[];
}

export function emptyStufe(): SystemStufe {
  return { stufe: STUFE_START, window: [] };
}

function clampStufe(n: number): number {
  if (!Number.isFinite(n)) return STUFE_START;
  return Math.max(STUFE_MIN, Math.min(STUFE_MAX, Math.round(n)));
}

/**
 * Eine Eingabe verbuchen und die Anforderungsstufe ggf. anpassen (rein). Nach
 * jedem Wechsel beginnt das Fenster von vorn — das ist die Abklingzeit gegen
 * Hin-und-Her-Springen (Hysterese).
 */
export function recordStufe(s: SystemStufe, correct: boolean): SystemStufe {
  const stufe = clampStufe(s.stufe);
  const window = [...s.window, correct].slice(-STUFE_WINDOW);
  if (window.length < STUFE_MIN_AT) return { stufe, window };

  const acc = mean(window.map((c) => (c ? 1 : 0)));
  let next = stufe;
  if (acc < STUFE_RESET_ACC) next = STUFE_MIN;
  else if (acc < STUFE_DOWN_ACC) next = stufe - 1;
  else if (acc >= STUFE_UP_ACC) next = stufe + 1;
  next = clampStufe(next);

  // Stufe gewechselt → Fenster leeren (neue Stufe sammelt frische Belege).
  return next === stufe ? { stufe, window } : { stufe: next, window: [] };
}

/** Was eine Anforderungsstufe an Hilfestellung zeigt. */
export interface StufeConfig {
  /** „Neue Zeichen"-Legende offen anzeigen (untere Stufen). */
  showLegend: boolean;
  /** Den Umschalt-Lösungshinweis prominent bewerben (untere/mittlere Stufen). */
  prominentHint: boolean;
  /** Bias auf kurze Aufgaben (0..1) — unten kurze Wörter/Buchstaben zuerst. */
  shortBias: number;
}

/** Hilfestellung zu einer Anforderungsstufe (1 = volle Stütze … 10 = nackt). */
export function stufeConfig(stufe: number): StufeConfig {
  const s = clampStufe(stufe);
  return {
    showLegend: s <= 4,
    prominentHint: s <= 6,
    shortBias: clamp01((6 - s) / 5), // Stufe 1 → 1,0; Stufe 6 → 0; höher → 0
  };
}

/** Kurze Anzeige einer Anforderungsstufe (z. B. „Stufe 4"). */
export function stufeLabel(stufe: number): string {
  return `Stufe ${clampStufe(stufe)}`;
}
