/**
 * Abzeichen (Badges) von „Klangpunkte" — das Motivations-System der Stufe 5.
 *
 * Vorbild ist der Tipptrainer (`lib/typing/badges.ts`): WENIGE FAMILIEN mit
 * Steigerungs-Stufen statt einer Badge-Flut, jede Familie mit klarem nächsten
 * Ziel; Geheim-Abzeichen als Überraschung. Kein Zeitdruck — alle Zähler laufen
 * nur aufwärts. Verdiente Abzeichen liegen im Spielstand (`progress.badges`:
 * id → Zeitstempel) und wandern damit automatisch mit (Server-Konto ODER
 * lokal); die Lebenszeit-Zähler (Diktate, Takte, Lese-Konzerte, Lieder) führt
 * `progress.badgeTally`. Beides additiv/optional.
 *
 * Reine, testbare Logik (kein React, kein Audio). Siehe
 * [[project_klangpunkte_eigenstaendig]] · Übergabe §12.
 */
import { KLANG_WELTEN } from "./welten";
import type { KlangBadgeTally, KlangProgress } from "./progress";
import { klangTexte } from "./sprache";
import type { KlangTexte } from "./texte";

const T = () => klangTexte().abzeichen;

// --- Definitionen -------------------------------------------------------------

export interface KlangBadgeDef {
  id: string;
  /** Emoji — rein dekorativ (aria-hidden); Screenreader hören den Namen. */
  emoji: string;
  /** Lustiger Anzeige-Name (auch gesprochen). */
  name: string;
  /** Beschreibung OHNE direkte Anrede (gilt für Du- und Sie-Profil). */
  description: string;
  /** Anzeige-Gruppe der Galerie. */
  group: string;
  /** Geheim: vor dem Verdienen nur „???". */
  secret?: boolean;
}

/** Schwellen der Steigerungs-Familien (gebündelt, leicht tunbar). */
export const STARS_TIERS = [5, 15, 30, 60] as const; // Sterne gesamt
export const THREE_TIERS = [1, 5, 15] as const; // 3-Sterne-Kapitel
export const WORLD_TIERS = [1, 3, 6, 9] as const; // fertig gemeisterte Welten
export const DIKTAT_TIERS = [10, 50] as const; // saubere Diktate
export const TAKT_TIERS = [10, 50] as const; // gültige Takte
export const LESE_TIERS = [10, 50] as const; // fehlerfreie Lese-Konzerte
export const LIEDER_TIERS = [1, 9, 18] as const; // durchgespielte Lieder

type BadgeRoh = { id: string; emoji: string; gruppe: keyof KlangTexte["abzeichen"]["gruppen"]; beschreibung: () => string; secret?: boolean };

const BADGE_ROH: BadgeRoh[] = [
  // Familie „Sterne" — Sterne über alle Kapitel.
  { id: "stern-1", emoji: "⭐", gruppe: "sterne", beschreibung: () => T().sterneGesammelt(STARS_TIERS[0]) },
  { id: "stern-2", emoji: "🌟", gruppe: "sterne", beschreibung: () => T().sterneGesammelt(STARS_TIERS[1]) },
  { id: "stern-3", emoji: "✨", gruppe: "sterne", beschreibung: () => T().sterneGesammelt(STARS_TIERS[2]) },
  { id: "stern-4", emoji: "🌌", gruppe: "sterne", beschreibung: () => T().sterneGesammelt(STARS_TIERS[3]) },
  // Familie „Bestnote" — Kapitel mit vollen 3 Sternen.
  { id: "drei-1", emoji: "🥉", gruppe: "bestnote", beschreibung: () => T().ersterVolltreffer },
  { id: "drei-2", emoji: "🥈", gruppe: "bestnote", beschreibung: () => T().volltreffer(THREE_TIERS[1]) },
  { id: "drei-3", emoji: "🥇", gruppe: "bestnote", beschreibung: () => T().volltreffer(THREE_TIERS[2]) },
  // Familie „Klangwelten" — ganze Welten abgeschlossen.
  { id: "welt-1", emoji: "🗺️", gruppe: "klangwelten", beschreibung: () => T().welt1 },
  { id: "welt-2", emoji: "🧭", gruppe: "klangwelten", beschreibung: () => T().welt2 },
  { id: "welt-3", emoji: "⛰️", gruppe: "klangwelten", beschreibung: () => T().welt3 },
  { id: "welt-4", emoji: "🏔️", gruppe: "klangwelten", beschreibung: () => T().welt4 },
  // Familie „Diktat" — saubere Diktate.
  { id: "diktat-1", emoji: "✍️", gruppe: "diktat", beschreibung: () => T().diktate(DIKTAT_TIERS[0]) },
  { id: "diktat-2", emoji: "🕵️", gruppe: "diktat", beschreibung: () => T().diktate(DIKTAT_TIERS[1]) },
  // Familie „Baumeister" — gültig gebaute Takte.
  { id: "takt-1", emoji: "🧱", gruppe: "baumeister", beschreibung: () => T().takte(TAKT_TIERS[0]) },
  { id: "takt-2", emoji: "🏗️", gruppe: "baumeister", beschreibung: () => T().takte(TAKT_TIERS[1]) },
  // Familie „Lese-Konzert" — fehlerfrei aus dem Gedächtnis gespielt.
  { id: "lese-1", emoji: "📖", gruppe: "lese", beschreibung: () => T().zeilen(LESE_TIERS[0]) },
  { id: "lese-2", emoji: "🎹", gruppe: "lese", beschreibung: () => T().zeilen(LESE_TIERS[1]) },
  // Familie „Lieder-Bühne" — verschiedene Lieder ganz durchgespielt.
  { id: "lied-1", emoji: "🎵", gruppe: "lieder", beschreibung: () => T().lied1 },
  { id: "lied-2", emoji: "🎶", gruppe: "lieder", beschreibung: () => T().lieder(LIEDER_TIERS[1]) },
  { id: "lied-3", emoji: "🎤", gruppe: "lieder", beschreibung: () => T().lieder(LIEDER_TIERS[2]) },
  // Geheim-Abzeichen (vor dem Verdienen nur „???").
  { id: "erstes-werk", emoji: "🎼", gruppe: "geheim", secret: true, beschreibung: () => T().erstesWerk },
  { id: "voller-schrank", emoji: "🗄️", gruppe: "geheim", secret: true, beschreibung: () => T().vollerSchrank },
  { id: "alles-gemeistert", emoji: "👑", gruppe: "geheim", secret: true, beschreibung: () => T().alleKapitel },
];

/** Name, Beschreibung und Gruppe werden erst beim Lesen aus der aktuellen Sprache geholt. */
export const KLANG_BADGES: KlangBadgeDef[] = BADGE_ROH.map((r) => {
  const def = { id: r.id, emoji: r.emoji } as KlangBadgeDef;
  Object.defineProperty(def, "name", {
    enumerable: true,
    get: () => T().namen[r.id as keyof KlangTexte["abzeichen"]["namen"]],
  });
  Object.defineProperty(def, "description", { enumerable: true, get: r.beschreibung });
  Object.defineProperty(def, "group", { enumerable: true, get: () => T().gruppen[r.gruppe] });
  if (r.secret) def.secret = true;
  return def;
});

const BY_ID = new Map(KLANG_BADGES.map((b) => [b.id, b]));

export function klangBadgeById(id: string): KlangBadgeDef | undefined {
  return BY_ID.get(id);
}

// --- Auswertung ---------------------------------------------------------------

export function emptyKlangTally(): KlangBadgeTally {
  return { diktate: 0, takte: 0, lesekonzerte: 0, songIds: [] };
}

/** Ein Ereignis, das Abzeichen auslösen kann. */
export type KlangBadgeEvent =
  | { kind: "mastered" } // ein Kapitel gemeistert (nur neu auswerten)
  | { kind: "werk" } // ein Werk gespeichert (nur neu auswerten)
  | { kind: "diktat" } // ein sauberes Diktat
  | { kind: "takt" } // ein gültiger Takt
  | { kind: "lesekonzert" } // ein fehlerfreies Lese-Konzert
  | { kind: "song"; id: string }; // ein Lied ganz durchgespielt

function tierIds(prefixIds: readonly string[], tiers: readonly number[], value: number): string[] {
  const out: string[] = [];
  for (let i = 0; i < tiers.length; i++) if (value >= tiers[i]) out.push(prefixIds[i]);
  return out;
}

const STARS_IDS = ["stern-1", "stern-2", "stern-3", "stern-4"] as const;
const THREE_IDS = ["drei-1", "drei-2", "drei-3"] as const;
const WORLD_IDS = ["welt-1", "welt-2", "welt-3", "welt-4"] as const;
const DIKTAT_IDS = ["diktat-1", "diktat-2"] as const;
const TAKT_IDS = ["takt-1", "takt-2"] as const;
const LESE_IDS = ["lese-1", "lese-2"] as const;
const LIEDER_IDS = ["lied-1", "lied-2", "lied-3"] as const;

/** Gesamt-Sterne, 3-Sterne-Kapitel, fertige Welten aus dem Spielstand ableiten. */
export function starTotals(p: KlangProgress): {
  stars: number;
  threeStar: number;
  worldsComplete: number;
  chaptersComplete: number;
} {
  const levels = p.levels ?? {};
  let stars = 0;
  let threeStar = 0;
  let chaptersComplete = 0;
  for (const rec of Object.values(levels)) {
    stars += rec.bestStars ?? 0;
    if ((rec.bestStars ?? 0) >= 3) threeStar += 1;
    if (rec.completed) chaptersComplete += 1;
  }
  const worldsComplete = KLANG_WELTEN.filter(
    (w) => w.etappen.length > 0 && w.etappen.every((e) => levels[e.id]?.completed),
  ).length;
  const total = KLANG_WELTEN.reduce((s, w) => s + w.etappen.length, 0);
  return { stars, threeStar, worldsComplete, chaptersComplete: chaptersComplete === total ? total : chaptersComplete };
}

/**
 * Ein Ereignis verbuchen: Zähler fortschreiben, neu verdiente Abzeichen ermitteln
 * und in den Spielstand schreiben. Gibt den neuen Spielstand und die NEU
 * verdienten Abzeichen (in Definitions-Reihenfolge) zurück. Rein + testbar;
 * `now` kommt vom Aufrufer.
 */
export function awardKlangBadges(
  p: KlangProgress,
  event: KlangBadgeEvent,
  now: number,
): { progress: KlangProgress; newly: KlangBadgeDef[] } {
  // 1) Zähler fortschreiben.
  const t: KlangBadgeTally = p.badgeTally
    ? { ...p.badgeTally, songIds: [...p.badgeTally.songIds] }
    : emptyKlangTally();
  if (event.kind === "diktat") t.diktate += 1;
  else if (event.kind === "takt") t.takte += 1;
  else if (event.kind === "lesekonzert") t.lesekonzerte += 1;
  else if (event.kind === "song" && !t.songIds.includes(event.id)) t.songIds.push(event.id);

  // 2) Verdiente Abzeichen zusammentragen.
  const totals = starTotals(p);
  const werkeCount = p.werke?.length ?? 0;
  const total = KLANG_WELTEN.reduce((s, w) => s + w.etappen.length, 0);
  const earned = new Set<string>([
    ...tierIds(STARS_IDS, STARS_TIERS, totals.stars),
    ...tierIds(THREE_IDS, THREE_TIERS, totals.threeStar),
    ...tierIds(WORLD_IDS, WORLD_TIERS, totals.worldsComplete),
    ...tierIds(DIKTAT_IDS, DIKTAT_TIERS, t.diktate),
    ...tierIds(TAKT_IDS, TAKT_TIERS, t.takte),
    ...tierIds(LESE_IDS, LESE_TIERS, t.lesekonzerte),
    ...tierIds(LIEDER_IDS, LIEDER_TIERS, t.songIds.length),
  ]);
  if (werkeCount >= 1) earned.add("erstes-werk");
  if (werkeCount >= 5) earned.add("voller-schrank");
  if (totals.chaptersComplete >= total) earned.add("alles-gemeistert");

  // 3) Neu = verdient, aber noch nicht im Spielstand. In Definitions-Reihenfolge.
  const have = p.badges ?? {};
  const newly = KLANG_BADGES.filter((b) => earned.has(b.id) && !(b.id in have));
  const badges = newly.length
    ? { ...have, ...Object.fromEntries(newly.map((b) => [b.id, now])) }
    : have;
  return { progress: { ...p, badges, badgeTally: t }, newly };
}

/** Verdiente Abzeichen (Definitions-Reihenfolge) mit Verdien-Zeitpunkt. */
export function earnedKlangBadges(p: KlangProgress): Array<{ def: KlangBadgeDef; ts: number }> {
  const have = p.badges ?? {};
  return KLANG_BADGES.filter((b) => b.id in have).map((b) => ({ def: b, ts: have[b.id] }));
}
