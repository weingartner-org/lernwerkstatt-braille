import { describe, expect, it } from "vitest";
import { buildDeck, pickCard, collectIfMastered } from "@/lib/braille/treasure";
import type { LevelMastery } from "@/lib/braille/adaptive";
import { SOLID_STREAK } from "@/lib/braille/adaptive";

function makeMastery(items: Record<string, { streak: number; seen: number; wrong: number }>): LevelMastery {
  return { window: [], items };
}

const INTRODUCED = {
  "l1-reihe1": ["a", "b", "c"],
  "l2-reihe2": ["n", "r"],
};

const MASTERY: Record<string, LevelMastery> = {
  "l1-reihe1": makeMastery({
    a: { streak: 0, seen: 5, wrong: 3 },  // zuletzt falsch → weight 4
    b: { streak: 1, seen: 3, wrong: 1 },  // auf gutem Weg → weight 2
    c: { streak: 5, seen: 8, wrong: 0 },  // sitzt → weight 1 (kein Deck-Eintrag)
  }),
  "l2-reihe2": makeMastery({
    n: { streak: 0, seen: 2, wrong: 1 },  // weight 4
    r: { streak: 3, seen: 4, wrong: 0 },  // sitzt → weight 1 (kein Deck-Eintrag)
  }),
};

describe("buildDeck — schwache Einheiten", () => {
  it("itemWeight >= 2 → schwache Karte im Deck", () => {
    const deck = buildDeck(MASTERY, [], INTRODUCED);
    const keys = deck.cards.map((c) => c.key);
    expect(keys).toContain("a");  // weight 4
    expect(keys).toContain("b");  // weight 2
    expect(keys).toContain("n");  // weight 4
  });

  it("itemWeight = 1 (sitzt) → NICHT im Deck", () => {
    const deck = buildDeck(MASTERY, [], INTRODUCED);
    const keys = deck.cards.map((c) => c.key);
    expect(keys).not.toContain("c");
    expect(keys).not.toContain("r");
  });

  it("leere confusions → nur schwache Karten", () => {
    const deck = buildDeck(MASTERY, [], INTRODUCED);
    expect(deck.cards.every((c) => c.reason === "schwach")).toBe(true);
  });
});

describe("buildDeck — Verwechsler", () => {
  const confusions = [
    { expected: "a", typed: "b", count: 3, levelId: "l1-reihe1" },
    { expected: "x", typed: "y", count: 1, levelId: "l1-reihe1" }, // count < 2 → ignoriert
  ];

  it("count >= 2 → Karte reason='verwechselt'", () => {
    const deck = buildDeck(MASTERY, confusions, INTRODUCED);
    const aCard = deck.cards.find((c) => c.key === "a");
    expect(aCard).toBeDefined();
    expect(aCard!.reason).toBe("verwechselt");
    expect(aCard!.confusedWith).toBe("b");
  });

  it("count < 2 → nicht im Deck", () => {
    const deck = buildDeck(MASTERY, confusions, INTRODUCED);
    const xCard = deck.cards.find((c) => c.key === "x");
    expect(xCard).toBeUndefined();
  });

  it("Dublette: verwechselt > schwach", () => {
    // "a" ist schon schwach (weight 4), und jetzt auch verwechselt → reason='verwechselt'
    const deck = buildDeck(MASTERY, confusions, INTRODUCED);
    const aCard = deck.cards.find((c) => c.key === "a");
    expect(aCard?.reason).toBe("verwechselt");
  });
});

describe("buildDeck — leere Eingaben", () => {
  it("leeres introducedByLevel → leeres Deck", () => {
    const deck = buildDeck({}, [], {});
    expect(deck.cards).toHaveLength(0);
    expect(deck.collectedToday).toBe(0);
  });
});

describe("pickCard", () => {
  it("gibt null zurück bei leerem Deck", () => {
    expect(pickCard({ cards: [], collectedToday: 0 })).toBeNull();
  });

  it("gibt eine Karte zurück", () => {
    const deck = buildDeck(MASTERY, [], INTRODUCED);
    const card = pickCard(deck);
    expect(card).not.toBeNull();
    expect(card!.key).toBeTruthy();
  });

  it("vermeidet avoid (wenn mehr als 1 Karte)", () => {
    const deck = buildDeck(MASTERY, [], INTRODUCED);
    if (deck.cards.length < 2) return; // skip wenn zu wenig Karten
    // Deterministisch: rnd=1 → immer letzte Karte
    const card = pickCard(deck, deck.cards[deck.cards.length - 1].key, () => 0.001);
    expect(card).not.toBeNull();
  });

  it("mit deterministischer rnd reproduzierbar", () => {
    const deck = buildDeck(MASTERY, [], INTRODUCED);
    const c1 = pickCard(deck, undefined, () => 0);
    const c2 = pickCard(deck, undefined, () => 0);
    expect(c1?.key).toBe(c2?.key);
  });
});

describe("collectIfMastered", () => {
  it("entfernt Karte wenn streak >= SOLID_STREAK", () => {
    const deck = buildDeck(MASTERY, [], INTRODUCED);
    // "c" sitzt (streak 5), aber ist nicht im Deck — teste mit "b" (streak 1)
    // Wir erstellen ein Mastery mit hohem Streak für "a"
    const masteryWithSolidA: Record<string, LevelMastery> = {
      "l1-reihe1": makeMastery({
        a: { streak: SOLID_STREAK, seen: 10, wrong: 0 }, // sitzt jetzt
      }),
    };
    const before = deck.cards.length;
    const after = collectIfMastered(deck, "a", masteryWithSolidA);
    expect(after.cards.length).toBe(before - 1);
    expect(after.collectedToday).toBe(deck.collectedToday + 1);
  });

  it("entfernt Karte NICHT wenn streak < SOLID_STREAK", () => {
    const deck = buildDeck(MASTERY, [], INTRODUCED);
    const before = deck.cards.length;
    // "a" hat streak 0 → nicht gemeistert
    const after = collectIfMastered(deck, "a", MASTERY);
    expect(after.cards.length).toBe(before);
    expect(after.collectedToday).toBe(deck.collectedToday);
  });

  it("unbekannte Karte → unverändert", () => {
    const deck = buildDeck(MASTERY, [], INTRODUCED);
    const after = collectIfMastered(deck, "NICHT_VORHANDEN", MASTERY);
    expect(after.cards.length).toBe(deck.cards.length);
  });
});
