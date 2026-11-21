/**
 * Wächter für die Fehlererkennung.
 *
 * ★ Der wichtigere Teil dieser Datei ist nicht, dass Plus Muster findet -
 * sondern dass es keine findet, wo keine sind. „Etwa die Hälfte aller Kinder
 * zeigt gar kein stabiles Muster." Ein Wächter, der nur das Finden prüft,
 * belohnt das Erfinden.
 */
import { describe, expect, it } from "vitest";
import type { Aufgabe } from "../src/lib/plus/aufgabe";
import {
  FEHLSCHLAG_GRENZE, MINDESTENS, SYSTEMATISCH_AB, VERFALL_TAGE,
  berechenbareMuster, ernstZuNehmen, haelt, nachAntwort, passendeMuster, schublade,
  vonLinksNachRechts, type Vermutung,
} from "../src/lib/plus/fehler";

/** Eine Aufgabe, wie der Generator sie baut. */
function auf(teil: Partial<Aufgabe> & { paket: string; angabe: string; loesung: string }): Aufgabe {
  return { art: "ergebnis", op: "minus", zahlen: [], ...teil };
}

describe("Was ein Muster vorhersagt", () => {
  it("★ erkennt die spaltenweise Unterschiedsbildung: 503 -8 ergibt 505", () => {
    // Das Beispiel steht wörtlich im Coach-Dokument.
    const a = auf({ paket: "3-11", angabe: "503 -8 =", loesung: "495", op: "minus", zahlen: [503, 8] });
    expect(passendeMuster(a, "505")).toContain("umkehrfehler");
    expect(passendeMuster(a, "495")).toHaveLength(0);
  });

  it("erkennt den vergessenen Übertrag - genau eine Zehnerpotenz zu klein", () => {
    const a = auf({ paket: "3-10", angabe: "348 +275 =", loesung: "623", op: "plus", zahlen: [348, 275] });
    expect(passendeMuster(a, "613")).toContain("uebertrag");
    expect(passendeMuster(a, "523")).toContain("uebertrag");
  });

  it("nimmt nur Muster, auf die das Paket achtet", () => {
    // Dasselbe Ergebnis, ein Paket, das dieses Muster nicht kennt: kein Fund.
    const a = auf({ paket: "1-08", angabe: "3 +4 =", loesung: "7", op: "plus", zahlen: [3, 4] });
    expect(passendeMuster(a, "6")).toHaveLength(0);
  });

  it("rechnet die Zeile auch stur von links nach rechts", () => {
    expect(vonLinksNachRechts("3 +4 *2 =")).toBe(14);   // richtig wären 11
    expect(vonLinksNachRechts("Wie heißt die Zahl?")).toBeNull();
  });

  it("kennt seine eigenen Grenzen", () => {
    // Zeitmuster und Verfahrensmischungen sind aus dem Ergebnis nicht lesbar.
    const berechenbar = berechenbareMuster();
    expect(berechenbar).not.toContain("zaehlendes_rechnen");
    expect(berechenbar).not.toContain("verfahren_vermischt");
  });
});

describe("Die Bremsen", () => {
  const heute = 100;
  const v = (teil: Partial<Vermutung>): Vermutung =>
    ({ muster: "umkehrfehler", treffer: 0, fehlschlaege: 0, tage: [], zuletzt: heute, ...teil });

  it("★ steuert nie auf eine einzelne falsche Antwort hin um", () => {
    expect(schublade(v({ treffer: 1, tage: [heute] }))).toBe("fluechtigkeit");
    expect(ernstZuNehmen([v({ treffer: 1, tage: [heute] })], heute)).toBeNull();
  });

  it("nennt es erst ein Muster, wenn es über mehrere Läufe kam", () => {
    expect(SYSTEMATISCH_AB).toBe(3);
    expect(schublade(v({ treffer: 3, tage: [heute] }))).toBe("unklar");        // alles an einem Tag
    expect(schublade(v({ treffer: 3, tage: [heute - 1, heute] }))).toBe("systematisch");
  });

  it("★ lässt eine Vermutung fallen, die mehr als ein Drittel danebenliegt", () => {
    expect(FEHLSCHLAG_GRENZE).toBeCloseTo(1 / 3);
    expect(haelt(v({ treffer: 3, fehlschlaege: 1 }), heute)).toBe(true);
    expect(haelt(v({ treffer: 2, fehlschlaege: 2 }), heute)).toBe(false);
  });

  it("bewertet erst ab genug Beobachtungen - eine falsche Vorhersage ist nichts", () => {
    expect(MINDESTENS).toBe(4);
    expect(haelt(v({ treffer: 0, fehlschlaege: 1 }), heute)).toBe(true);
  });

  it("★ lässt einen Hinweis verfallen, der sich wochenlang nicht bestätigt", () => {
    expect(VERFALL_TAGE).toBe(21);
    const alt = v({ treffer: 5, tage: [1, 2], zuletzt: 1 });
    expect(haelt(alt, 1 + VERFALL_TAGE)).toBe(true);
    expect(haelt(alt, 1 + VERFALL_TAGE + 1)).toBe(false);
  });
});

describe("Ein Kind, das nur Flüchtigkeitsfehler macht", () => {
  const aufgaben = [
    auf({ paket: "3-11", angabe: "503 -8 =", loesung: "495", op: "minus", zahlen: [503, 8] }),
    auf({ paket: "3-11", angabe: "412 -7 =", loesung: "405", op: "minus", zahlen: [412, 7] }),
    auf({ paket: "3-11", angabe: "621 -9 =", loesung: "612", op: "minus", zahlen: [621, 9] }),
    auf({ paket: "3-11", angabe: "530 -6 =", loesung: "524", op: "minus", zahlen: [530, 6] }),
  ];

  it("★ bekommt kein Etikett - Plus tut nichts Besonderes", () => {
    let vermutungen: Vermutung[] = [];
    // Drei richtig, eine daneben - aber nicht nach einem Muster.
    vermutungen = nachAntwort(vermutungen, aufgaben[0], "495", true, 100);
    vermutungen = nachAntwort(vermutungen, aufgaben[1], "405", true, 100);
    vermutungen = nachAntwort(vermutungen, aufgaben[2], "611", false, 101);
    vermutungen = nachAntwort(vermutungen, aufgaben[3], "524", true, 101);
    expect(ernstZuNehmen(vermutungen, 101)).toBeNull();
  });

  it("★ verliert die Vermutung wieder, wenn das Kind richtig rechnet", () => {
    // Die Gegenprobe: ohne sie lebte jede Vermutung ewig.
    let vermutungen = nachAntwort([], aufgaben[0], "505", false, 100);
    expect(vermutungen[0].treffer).toBe(1);
    for (let i = 1; i < 4; i++) {
      vermutungen = nachAntwort(vermutungen, aufgaben[i], aufgaben[i].loesung, true, 100 + i);
    }
    expect(vermutungen.find((v) => v.muster === "umkehrfehler")).toBeUndefined();
  });
});

describe("Ein Kind, das immer dasselbe falsch macht", () => {
  it("wird erkannt - über mehrere Tage, nicht in einem Lauf", () => {
    const paare: [string, string][] = [
      ["503 -8 =", "505"], ["412 -7 =", "415"], ["621 -9 =", "628"], ["530 -6 =", "536"],
    ];
    const loesungen = ["495", "405", "612", "524"];
    let vermutungen: Vermutung[] = [];
    paare.forEach(([angabe, antwort], i) => {
      const zahlen = angabe.match(/\d+/g)!.map(Number);
      const a = auf({ paket: "3-11", angabe, loesung: loesungen[i], op: "minus", zahlen });
      vermutungen = nachAntwort(vermutungen, a, antwort, false, 100 + i);
    });
    const ernst = ernstZuNehmen(vermutungen, 103);
    expect(ernst?.muster).toBe("umkehrfehler");
    expect(schublade(ernst!)).toBe("systematisch");
  });
});
