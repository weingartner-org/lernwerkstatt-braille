/**
 * Schatzkiste / Zeichen-Memory — kindgerechtes Spaced Repetition.
 *
 * Verkleidet die bestehende Schwäche-Erkennung (adaptive.ts: ItemStat +
 * itemWeight) als sammelbares Memory-Deck. Kein eigener SRS-Algorithmus
 * (SM-2/FSRS) — der Leitner-Effekt steckt bereits in itemWeight/pickWeighted.
 * „Schatzkiste" ist Bild + Datenfluss, nicht Algorithmus.
 *
 * Defensiver Umgang mit Verwechslern (P0b-Constraint): Da TaskEvent.typed
 * erst in P1a vollständig verdrahtet wird, können confusions[] leer sein.
 * buildDeck funktioniert dann nur mit schwachen Einheiten (reason:"schwach").
 * Die volle Verwechsler-Verdrahtung kommt in P1a (notiert in _FORTSCHRITT.md).
 *
 * Reine, testbare Funktionen — kein React, kein DOM.
 */
import type { LevelMastery } from "./adaptive";
import { itemWeight, SOLID_STREAK } from "./adaptive";

/** Eine Memory-Karte = eine Einheit, die ins Übungs-Deck gezogen wird. */
export interface TreasureCard {
  /** EtappenUnit.key / Buchstabe — stabil, geht in Telemetrie ein. */
  key: string;
  /** Herkunfts-Level (für pickWeighted-Pool im Aufgabenfluss). */
  levelId: string;
  /** Warum diese Karte im Deck ist. */
  reason: "schwach" | "verwechselt";
  /** Verwechslungs-Partner (nur bei reason="verwechselt"). */
  confusedWith?: string;
  /** Gewicht 1–4: aus itemWeight oder Verwechsler-Häufigkeit. */
  weight: number;
}

export interface TreasureDeck {
  cards: TreasureCard[];
  /** Karten, die heute bereits „eingesammelt" (gemeistert) wurden. */
  collectedToday: number;
}

/**
 * Baut das Deck aus:
 *  a) Schwachen Einheiten je freigeschaltetem Level (itemWeight ≥ 2).
 *  b) Verwechsler-Paaren aus der confuse-Matrix (count ≥ 2).
 *
 * Defensiv: confusions kann leer sein (P0b; volle Verdrahtung in P1a).
 * Dubletten (gleicher key+levelId) werden zusammengeführt, höheres Gewicht
 * gewinnt, "verwechselt" schlägt "schwach".
 */
export function buildDeck(
  mastery: Record<string, LevelMastery>,
  confusions: ReadonlyArray<{ expected: string; typed: string; count: number; levelId: string }>,
  introducedByLevel: Record<string, string[]>,
): TreasureDeck {
  // Schlüssel für Dubletten: "levelId::key"
  const seen = new Map<string, TreasureCard>();

  function upsert(card: TreasureCard): void {
    const k = `${card.levelId}::${card.key}`;
    const existing = seen.get(k);
    if (!existing) { seen.set(k, card); return; }
    // Höheres Gewicht gewinnt; "verwechselt" schlägt "schwach"
    const higherWeight = card.weight > existing.weight ? card : existing;
    const betterReason = (card.reason === "verwechselt" || existing.reason === "verwechselt")
      ? "verwechselt"
      : "schwach";
    seen.set(k, {
      ...higherWeight,
      reason: betterReason,
      confusedWith: betterReason === "verwechselt"
        ? (card.confusedWith ?? existing.confusedWith)
        : undefined,
    });
  }

  // a) Schwache Einheiten (itemWeight >= 2)
  for (const [levelId, keys] of Object.entries(introducedByLevel)) {
    const m = mastery[levelId];
    for (const key of keys) {
      const stat = m?.items[key];
      const w = itemWeight(stat);
      if (w >= 2) {
        upsert({ key, levelId, reason: "schwach", weight: w });
      }
    }
  }

  // b) Verwechsler (defensiv — kann in P0b leer sein)
  for (const { expected, typed, count, levelId } of confusions) {
    if (count < 2) continue;
    const w = Math.min(4, count);
    upsert({ key: expected, levelId, reason: "verwechselt", confusedWith: typed, weight: w });
  }

  return { cards: [...seen.values()], collectedToday: 0 };
}

/**
 * Nächste Karte gewichtet ziehen (vermeidet direkten Wiederholer).
 * Gibt null zurück, wenn das Deck leer ist.
 */
export function pickCard(
  deck: TreasureDeck,
  avoid?: string,
  rnd: () => number = Math.random,
): TreasureCard | null {
  const cards = deck.cards;
  if (cards.length === 0) return null;
  const pool = cards.length > 1 && avoid ? cards.filter((c) => c.key !== avoid) : cards;
  if (pool.length === 0) return cards[0];

  const total = pool.reduce((s, c) => s + c.weight, 0);
  let r = rnd() * total;
  for (const card of pool) {
    r -= card.weight;
    if (r <= 0) return card;
  }
  return pool[pool.length - 1];
}

/**
 * Karte als „eingesammelt" markieren, wenn die zugehörige Einheit jetzt sitzt
 * (streak ≥ SOLID_STREAK in der zugehörigen LevelMastery) → aus Deck entfernen
 * und collectedToday incrementieren.
 */
export function collectIfMastered(
  deck: TreasureDeck,
  key: string,
  mastery: Record<string, LevelMastery>,
): TreasureDeck {
  const card = deck.cards.find((c) => c.key === key);
  if (!card) return deck;

  const m = mastery[card.levelId];
  const stat = m?.items[key];
  if (!stat || stat.streak < SOLID_STREAK) return deck;

  return {
    cards: deck.cards.filter((c) => !(c.key === key && c.levelId === card.levelId)),
    collectedToday: deck.collectedToday + 1,
  };
}
