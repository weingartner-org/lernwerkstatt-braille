/**
 * Spielstand von „Klangpunkte" (eigenständiges Programm seit 08.07.2026).
 *
 * Eigener Speicher (localStorage `klangpunkte:v1` bzw. Server-Zeile
 * lw_progress/program="klangpunkte") — GETRENNT vom Punktgenau-Spielstand.
 * Die Sterne/Mastery der 14 Ur-Kapitel kp1–kp14, die vor der Herauslösung im
 * Punktgenau-Spielstand lagen, werden EINMALIG übernommen (migrateFromBraille):
 * niemand verliert Sterne. XP starten bewusst frisch — die Punktgenau-XP sind
 * über alle Schrift-Bereiche gemischt und lassen sich nicht sauber zuordnen.
 */
import { emptyMastery, type LevelMastery } from "../braille/adaptive";
import {
  loadProgress as loadBrailleProgress,
  type BrailleProgress,
  type LevelRecord,
} from "../braille/progress";

export { playerLevel } from "../braille/progress";

export interface KlangProgress {
  xp: number;
  /** Je Kapitel-id: gemeistert + beste Sterne (0–3) + Versuche. */
  levels: Record<string, LevelRecord>;
  /** Mastery-Fenster je Kapitel-id (kp1 … kp-triolen). */
  mastery?: Record<string, LevelMastery>;
  /** Resume: zuletzt geübtes Kapitel. */
  lastPlace?: { kapitelId: string };
  /** Einmalige kp*-Übernahme aus dem Punktgenau-Spielstand erledigt. */
  migratedFromBraille?: boolean;
  /** Komponier-Werkstatt (kp-komponier, §4.5): bis zu 5 gespeicherte Werke.
   *  Zellen als Zahlen (Bitmasken); beim Abspielen mit readSequence übersetzt. */
  werke?: Werk[];
  /** Abzeichen (Stufe 5, §12): id → Verdien-Zeitstempel. */
  badges?: Record<string, number>;
  /** Lebenszeit-Zähler für Abzeichen (Diktate, Takte, Lese-Konzerte, Lieder). */
  badgeTally?: KlangBadgeTally;
}

/** Lebenszeit-Zähler der Abzeichen (additiv, optional; Altstände starten leer). */
export interface KlangBadgeTally {
  /** Saubere (fehlerfreie) Diktate. */
  diktate: number;
  /** Gültig gebaute Takte (Takt-Baumeister). */
  takte: number;
  /** Fehlerfrei nachgespielte Lese-Konzert-Zeilen. */
  lesekonzerte: number;
  /** Ids der bis zum Ende durchgespielten Bühnen-Lieder (verschiedene Lieder). */
  songIds: string[];
}

export interface Werk {
  name: string;
  cells: number[];
  createdAt: number;
}

/** Bis zu 5 Werke; das älteste fällt heraus, wenn ein sechstes kommt. */
export const MAX_WERKE = 5;

const STORAGE_KEY = "klangpunkte:v1";

export function emptyKlangProgress(): KlangProgress {
  return { xp: 0, levels: {}, mastery: {} };
}

export function loadKlangProgress(): KlangProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyKlangProgress();
    const data = JSON.parse(raw) as Partial<KlangProgress>;
    return {
      xp: typeof data.xp === "number" ? data.xp : 0,
      levels: data.levels ?? {},
      mastery: data.mastery ?? {},
      lastPlace: data.lastPlace,
      migratedFromBraille: data.migratedFromBraille === true,
      werke: Array.isArray(data.werke) ? data.werke.slice(0, MAX_WERKE) : undefined,
      badges: data.badges ?? undefined,
      badgeTally: data.badgeTally ?? undefined,
    };
  } catch {
    return emptyKlangProgress();
  }
}

export function saveKlangProgress(p: KlangProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch {
    /* localStorage nicht verfügbar — Spielstand bleibt nur in dieser Sitzung */
  }
}

export function getKapitelMastery(p: KlangProgress, kapitelId: string): LevelMastery {
  return p.mastery?.[kapitelId] ?? emptyMastery();
}

export function totalStars(p: KlangProgress): number {
  return Object.values(p.levels).reduce((s, r) => s + (r.bestStars ?? 0), 0);
}

/** Klangpunkte-Kapitel-ids: kp1 … kp14 sowie alle kp-…-Kapitel. */
const KP_ID = /^kp(\d+|-)/;

/**
 * Einmalige Übernahme der Klangpunkte-Stände aus dem Punktgenau-Spielstand
 * (dort lag der Bereich bis 08.07.2026). Pur und idempotent: kopiert nur
 * kp*-Einträge, füllt nur Lücken (vorhandene Klangpunkte-Stände gewinnen),
 * und setzt danach das Erledigt-Flag — auch wenn kein Braille-Stand da ist.
 */
export function migrateFromBraille(
  kp: KlangProgress,
  braille: BrailleProgress | null,
): KlangProgress {
  if (kp.migratedFromBraille) return kp;
  if (!braille) return { ...kp, migratedFromBraille: true };
  const levels = { ...kp.levels };
  for (const [id, rec] of Object.entries(braille.levels)) {
    if (KP_ID.test(id) && !levels[id]) levels[id] = { ...rec };
  }
  const mastery = { ...(kp.mastery ?? {}) };
  for (const [id, m] of Object.entries(braille.mastery ?? {})) {
    if (KP_ID.test(id) && !mastery[id]) mastery[id] = m;
  }
  const lastPlace =
    kp.lastPlace ??
    (braille.lastPlace?.area === "noten"
      ? { kapitelId: braille.lastPlace.etappeId }
      : undefined);
  return { ...kp, levels, mastery, lastPlace, migratedFromBraille: true };
}

/** Anonymer Lade-Weg inkl. einmaliger Übernahme (und Sofort-Speichern). */
export function loadKlangProgressMigrated(): KlangProgress {
  const kp = loadKlangProgress();
  if (kp.migratedFromBraille) return kp;
  const migrated = migrateFromBraille(kp, safeBrailleProgress());
  saveKlangProgress(migrated);
  return migrated;
}

function safeBrailleProgress(): BrailleProgress | null {
  try {
    return loadBrailleProgress();
  } catch {
    return null;
  }
}
