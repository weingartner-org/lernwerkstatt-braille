/**
 * Sterne-Bewertung + adaptives Tempo-Ziel für den Braille-Trainer.
 *
 * Port aus lib/typing/stars.ts — OHNE level.ts-Import. Braille hat keine
 * numerische Tempo-Stufe 1–50; das Tempo-Ziel leitet sich aus der
 * Anforderungsstufe 1–10 (adaptive.ts: SystemStufe) und dem persönlichen
 * gleitenden Mittelwert (speedEma) ab.
 *
 * Stufe-1-Sonderfall: target = 0 → nur Treffsicherheit zählt. Das langsamste,
 * gründlichste Kind bekommt bei sauberer Arbeit immer 3 Sterne.
 * Tempo-Druck entsteht erst ab Stufe 2 — und dort relativ zum eigenen Tempo.
 */

export const STAR3 = 0.9;
export const STAR2 = 0.6;
export const ACC0 = 0.8;   // unter ACC0 → Treffsicherheits-Wertung 0
export const ACC1 = 0.98;  // ab ACC1 → Treffsicherheits-Wertung voll
export const EMA_ALPHA = 0.35;
export const CHALLENGE = 1.0;
export const SLOW_FLOOR_CPM = 20;  // Untergrenze Tempo-Ziel
export const FAST_CAP_MULT = 1.4;  // Deckel: persönl. Ziel max. 1,4× Stufen-Ziel

/**
 * Tempo-Ziel je Anforderungsstufe 1–10 (Zellen/Minute).
 * Stufe 1 = 0 → Tempo zählt nicht (nur Treffsicherheit).
 * Index 0 ist ungenutzt (Stufen sind 1-basiert).
 * Werte bewusst niedriger als bei Tastenflow — Braille-Erkennung ist
 * langsamer als Blind-Tippen von Buchstaben.
 */
export const STUFE_TARGET_CPM: readonly number[] = [
  0,   // [0] ungenutzt
  0,   // Stufe 1: Tempo zählt nicht
  12,  // Stufe 2
  16,  // Stufe 3 (STUFE_START)
  20,  // Stufe 4
  26,  // Stufe 5
  32,  // Stufe 6
  40,  // Stufe 7
  50,  // Stufe 8
  62,  // Stufe 9
  78,  // Stufe 10
];

function clamp01(x: number): number {
  return x < 0 ? 0 : x > 1 ? 1 : x;
}

/**
 * Tempo-Ziel (Zellen/Min) für die Sterne, abgeleitet aus Anforderungsstufe
 * (1–10) + persönlichem Tempo-EMA. Stufe ≤ 1 → 0 (Tempo zählt nicht).
 */
export function speedTargetCpm(stufe: number, speedEma: number | undefined): number {
  const s = Math.max(1, Math.min(10, Math.round(stufe || 1)));
  const stufeTarget = STUFE_TARGET_CPM[s] ?? 0;
  if (stufeTarget <= 0) return 0; // Stufe 1: Tempo zählt nicht
  if (!speedEma || speedEma <= 0) return stufeTarget; // noch keine Erfahrung
  let t = speedEma * CHALLENGE;
  t = Math.max(t, SLOW_FLOOR_CPM);
  t = Math.min(t, stufeTarget * FAST_CAP_MULT);
  return t;
}

/** Gleitendes Tempo-Mittel fortschreiben (nur saubere Runden füttern). */
export function updateSpeedEma(prev: number | undefined, cpm: number): number {
  if (!prev || prev <= 0) return cpm;
  return prev * (1 - EMA_ALPHA) + cpm * EMA_ALPHA;
}

/** Tempo-Wertung 0..1 (Rundentempo / Ziel). */
export function speedScore(cpm: number, target: number): number {
  return target > 0 ? clamp01(cpm / target) : 0;
}

/** Treffsicherheits-Wertung 0..1 (unter ACC0 = 0, ab ACC1 = voll). */
export function accuracyScore(acc: number): number {
  return clamp01((acc - ACC0) / (ACC1 - ACC0));
}

/**
 * Sterne 1–3 einer Runde.
 * target ≤ 0 → nur Treffsicherheit (Stufe-1-Sonderfall):
 *   ≥ 0.98 → 3 Sterne, ≥ 0.92 → 2 Sterne, sonst 1 Stern.
 * Kein Kind bekommt 0 Sterne — jede Runde wird belohnt.
 */
export function roundStars(acc: number, cpm: number, target: number): number {
  if (target <= 0) return acc >= 0.98 ? 3 : acc >= 0.92 ? 2 : 1;
  const combined = (accuracyScore(acc) + speedScore(cpm, target)) / 2;
  if (combined >= STAR3) return 3;
  if (combined >= STAR2) return 2;
  return 1;
}
