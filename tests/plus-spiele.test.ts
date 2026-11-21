/**
 * Wächter für die Rechenspiele.
 *
 * ★ Die erste Frage an jedes Spiel ist nicht „macht es Spaß?", sondern:
 * kommt ein Kind mit Braillezeile gleichwertig durch? Deshalb prüfen diese
 * Fälle zuerst, was NICHT da ist: keine Uhr, keine Punkte für Tempo, keine
 * Farbe als einzige Auskunft, kein unlösbares Spiel.
 */
import { describe, expect, it } from "vitest";
import { zufall } from "../src/lib/plus/aufgabe";
import {
  gewonnen, nachZug, neuesZielzahlSpiel, pruefeZug,
} from "../src/lib/plus/spiele/zielzahl";
import {
  antwort, halbierungsVersuche, naehe, nachVersuch, neuesHeissKaltSpiel,
} from "../src/lib/plus/spiele/heisskalt";
import {
  SCHWEREN, STOCKWERKE, nachTurmzug, neuerTurm, turmFertig, turmSatz, turmaufgabe,
  type Schwere,
} from "../src/lib/plus/spiele/turmbau";
import {
  alleGefunden, bewege, lage, nachFund, neuesPaareSpiel, offenePaare, passen,
} from "../src/lib/plus/spiele/paare";
import {
  SEITE, feldVon, grabaufgabe, grabe, nachGrabung, neuesSchatzgitter,
} from "../src/lib/plus/spiele/schatzgitter";
import { anteil, lege, neuerStrahl, toleranz, wertAn } from "../src/lib/plus/spiele/zahlenstrahl";
import {
  duellFertig, duellSatz, duellaufgabe, nachDuellzug, neuesDuell,
} from "../src/lib/plus/spiele/zugumzug";

describe("Zielzahl", () => {
  it("★ ist immer lösbar - Plus rechnet den Weg selbst", () => {
    const rng = zufall(2026);
    for (let i = 0; i < 200; i++) {
      const spiel = neuesZielzahlSpiel(rng, 4);
      let offen = [...spiel.zahlen];
      for (const zeile of spiel.weg) {
        const gelesen = pruefeZug(zeile, offen);
        expect("zug" in gelesen, `${zeile} bei ${offen.join(", ")}`).toBe(true);
        if ("zug" in gelesen) offen = nachZug(offen, gelesen.zug);
      }
      expect(gewonnen(offen, spiel.ziel), spiel.weg.join(" | ")).toBe(true);
    }
  });

  it("gibt fünf Zahlen und ein Ziel, das nicht schon dasteht", () => {
    const rng = zufall(7);
    for (let i = 0; i < 100; i++) {
      const spiel = neuesZielzahlSpiel(rng, 4);
      expect(spiel.zahlen).toHaveLength(5);
      expect(spiel.zahlen).not.toContain(spiel.ziel);
      expect(spiel.ziel).toBeGreaterThan(1);
    }
  });

  it("liest einen Zug in der Schreibweise von Plus", () => {
    const gelesen = pruefeZug("3 *4 =12", [3, 4, 7, 9, 10]);
    expect("zug" in gelesen).toBe(true);
    if ("zug" in gelesen) {
      expect(gelesen.zug.ergebnis).toBe(12);
      expect(nachZug([3, 4, 7, 9, 10], gelesen.zug)).toEqual([7, 9, 10, 12]);
    }
  });

  it("★ sagt, WAS nicht stimmt - nicht nur, dass etwas nicht stimmt", () => {
    const form = pruefeZug("drei mal vier", [3, 4]);
    expect("fehler" in form && form.fehler.satz).toBe("Schreib es so: 3 *4 =12");

    const fehlt = pruefeZug("3 *7 =21", [3, 4, 9]);
    expect("fehler" in fehlt && fehlt.fehler.satz).toBe("Die 7 liegt nicht mehr da.");

    const falsch = pruefeZug("3 *4 =11", [3, 4]);
    expect("fehler" in falsch && falsch.fehler.art).toBe("rechnung");
  });

  it("lässt dieselbe Zahl nur so oft benutzen, wie sie daliegt", () => {
    const einmal = pruefeZug("4 +4 =8", [4, 9, 10, 2, 3]);
    expect("fehler" in einmal).toBe(true);
    const zweimal = pruefeZug("4 +4 =8", [4, 4, 10, 2, 3]);
    expect("zug" in zweimal).toBe(true);
  });

  it("kennt keine Uhr und keine Punkte", () => {
    const spiel = neuesZielzahlSpiel(zufall(1), 4);
    expect(Object.keys(spiel)).toEqual(["zahlen", "ziel", "weg"]);
  });
});

describe("Heiß und kalt", () => {
  it("sagt größer oder kleiner und wie nah - in Worten", () => {
    const spiel = { von: 1, bis: 100, zahl: 42, versuche: [] };
    expect(antwort(spiel, 20).satz).toBe("Größer. Du bist noch weit.");
    expect(antwort(spiel, 45).satz).toBe("Kleiner. Du bist nah.");
    expect(antwort(spiel, 43).satz).toBe("Kleiner. Du bist ganz nah.");
    expect(antwort(spiel, 42).satz).toBe("Getroffen! 1 Versuch.");
  });

  it("★ misst die Nähe am Zahlenraum, nicht an festen Zahlen", () => {
    // Sechs daneben: bei 1 bis 20 ist das weit weg, bei 1 bis 10 000 ganz nah.
    expect(naehe({ von: 1, bis: 20, zahl: 10, versuche: [] }, 16)).toBe("noch weit");
    expect(naehe({ von: 1, bis: 10000, zahl: 5000, versuche: [] }, 5006)).toBe("ganz nah");
    expect(naehe({ von: 1, bis: 10000, zahl: 5000, versuche: [] }, 5300)).toBe("nah");
  });

  it("zählt die Versuche, ohne sie zu werten", () => {
    let spiel = neuesHeissKaltSpiel(zufall(3), 2);
    spiel = nachVersuch(spiel, 50);
    spiel = nachVersuch(spiel, 25);
    expect(spiel.versuche).toEqual([50, 25]);
    expect(antwort(spiel, spiel.zahl).satz).toContain("3 Versuche");
  });

  it("weist Zahlen ausserhalb des Raums freundlich ab", () => {
    const spiel = { von: 1, bis: 100, zahl: 42, versuche: [] };
    expect(antwort(spiel, 500).satz).toBe("Die Zahl liegt zwischen 1 und 100.");
    expect(antwort(spiel, NaN).satz).toBe("Schreib eine Zahl.");
  });

  it("★ kennt die Lehre des Spiels: mit dem Halbieren sind es sieben", () => {
    expect(halbierungsVersuche({ von: 1, bis: 100, zahl: 1, versuche: [] })).toBe(7);
    expect(halbierungsVersuche({ von: 1, bis: 1000, zahl: 1, versuche: [] })).toBe(10);
  });

  it("lässt sich mit dem Halbieren immer gewinnen", () => {
    const rng = zufall(11);
    for (let i = 0; i < 100; i++) {
      const spiel = neuesHeissKaltSpiel(rng, 3);
      let von = spiel.von, bis = spiel.bis, versuche = 0;
      while (von <= bis) {
        const mitte = Math.floor((von + bis) / 2);
        versuche++;
        if (mitte === spiel.zahl) break;
        if (mitte < spiel.zahl) von = mitte + 1; else bis = mitte - 1;
      }
      expect(versuche).toBeLessThanOrEqual(halbierungsVersuche(spiel));
    }
  });
});

describe("Turmbau", () => {
  it("★ lässt nichts einstürzen - falsch kostet kein Stockwerk", () => {
    // Verlustangst ist der Mechanismus der großen Lern-Apps. Plus benutzt ihn
    // nicht: eine falsche Antwort baut nichts, sie nimmt aber auch nichts weg.
    let turm = neuerTurm(10);
    turm = nachTurmzug(turm, "schwer", true);
    expect(turm.hoehe).toBe(3);
    turm = nachTurmzug(turm, "schwer", false);
    expect(turm.hoehe).toBe(3);
    expect(turm.zuege).toBe(2);
  });

  it("baut höher, wo es schwerer war", () => {
    expect(STOCKWERKE.leicht).toBe(1);
    expect(STOCKWERKE.mittel).toBe(2);
    expect(STOCKWERKE.schwer).toBe(3);
  });

  it("endet nach zehn Zügen", () => {
    let turm = neuerTurm(10);
    for (let i = 0; i < 9; i++) turm = nachTurmzug(turm, "leicht", true);
    expect(turmFertig(turm)).toBe(false);
    turm = nachTurmzug(turm, "leicht", true);
    expect(turmFertig(turm)).toBe(true);
  });

  it("★ sagt am Ende etwas über den TURM, nie über das Kind", () => {
    const satz = turmSatz({ hoehe: 12, zuege: 10, gesamt: 10 });
    expect(satz).toBe("Dein Turm hat 12 Stockwerke. Mehr als 30 gehen nicht.");
    expect(satz).not.toMatch(/du hättest|leider|besser|nur/i);
  });

  it("gibt zu jeder Schwere eine lösbare Aufgabe", () => {
    const rng = zufall(9);
    for (const stufe of [1, 2, 4, 6, 8]) {
      for (const schwere of SCHWEREN) {
        for (let i = 0; i < 30; i++) {
          const a = turmaufgabe(rng, stufe, schwere);
          expect(a.angabe, `${stufe} ${schwere}`).toMatch(/^\d+ [+\-*/]\d+ =$/);
          const wert = Number(a.loesung);
          expect(Number.isFinite(wert), a.angabe).toBe(true);
          expect(wert, a.angabe).toBeGreaterThanOrEqual(0);
        }
      }
    }
  });

  it("macht schwere Aufgaben wirklich schwerer", () => {
    const rng = zufall(4);
    const spanne = (schwere: Schwere) => {
      let summe = 0;
      for (let i = 0; i < 50; i++) summe += Number(turmaufgabe(rng, 4, schwere).loesung);
      return summe / 50;
    };
    expect(spanne("schwer")).toBeGreaterThan(spanne("leicht"));
  });
});

describe("Paare finden", () => {
  it("baut acht Paare mit lauter verschiedenen Ergebnissen", () => {
    // Zwei Karten mit derselben Zahl wären nicht zu unterscheiden.
    const spiel = neuesPaareSpiel(zufall(5), 3);
    expect(spiel.karten).toHaveLength(16);
    expect(spiel.paare).toBe(8);
    const ergebnisse = spiel.karten.filter((k) => k.art === "ergebnis").map((k) => k.text);
    expect(new Set(ergebnisse).size).toBe(8);
  });

  it("legt zu jeder Aufgabe genau ein Ergebnis", () => {
    const spiel = neuesPaareSpiel(zufall(6), 3);
    for (let p = 0; p < spiel.paare; p++) {
      const beide = spiel.karten.filter((k) => k.paar === p);
      expect(beide, `Paar ${p}`).toHaveLength(2);
      const aufgabe = beide.find((k) => k.art === "aufgabe")!;
      const ergebnis = beide.find((k) => k.art === "ergebnis")!;
      const [a, b] = (aufgabe.text.match(/\d+/g) ?? []).map(Number);
      expect(Number(ergebnis.text), aufgabe.text).toBe(a * b);
    }
  });

  it("★ sagt die Lage in Worten - ein Gitter, das man nur sieht, ist keines", () => {
    expect(lage(0)).toBe("Zeile 1, Spalte 1");
    expect(lage(6)).toBe("Zeile 2, Spalte 3");
    expect(lage(15)).toBe("Zeile 4, Spalte 4");
  });

  it("bleibt mit den Pfeiltasten im Gitter", () => {
    expect(bewege(0, "hoch")).toBe(0);
    expect(bewege(0, "links")).toBe(0);
    expect(bewege(0, "rechts")).toBe(1);
    expect(bewege(0, "runter")).toBe(4);
    expect(bewege(15, "runter")).toBe(15);
    expect(bewege(15, "rechts")).toBe(15);
  });

  it("erkennt ein Paar und zählt die übrigen", () => {
    let spiel = neuesPaareSpiel(zufall(7), 3);
    const a = spiel.karten.findIndex((k) => k.paar === 0);
    const b = spiel.karten.findIndex((k, i) => k.paar === 0 && i !== a);
    expect(passen(spiel, a, b)).toBe(true);
    expect(passen(spiel, a, a)).toBe(false);
    spiel = nachFund(spiel, a, b);
    expect(offenePaare(spiel)).toBe(7);
    expect(alleGefunden(spiel)).toBe(false);
  });
});

describe("Schatzgitter", () => {
  it("★ stellt nur Aufgaben, deren Ergebnis ein Feld nennt", () => {
    // Eine Rechnung, deren Ergebnis ausserhalb des Gitters liegt, wäre eine
    // Falle: das Kind rechnet richtig und kann trotzdem nicht graben.
    const rng = zufall(8);
    for (let i = 0; i < 300; i++) {
      const a = grabaufgabe(rng, 3);
      const feld = feldVon(Number(a.loesung));
      expect(feld, a.angabe).not.toBeNull();
      expect(feld).toEqual(a.feld);
      expect(a.feld.spalte).toBeGreaterThanOrEqual(1);
      expect(a.feld.spalte).toBeLessThanOrEqual(SEITE);
    }
  });

  it("liest das Feld aus der Zahl - Zehner ist die Spalte", () => {
    expect(feldVon(32)).toEqual({ spalte: 3, zeile: 2 });
    expect(feldVon(55)).toEqual({ spalte: 5, zeile: 5 });
    expect(feldVon(6)).toBeNull();     // keine Spalte
    expect(feldVon(78)).toBeNull();    // ausserhalb des Gitters
  });

  it("★ sagt die Richtung, nicht nur kalt", () => {
    // Ein Kind mit Braillezeile kann das Gitter nicht überblicken. „Weiter
    // rechts" ist eine Auskunft, aus der sich etwas machen lässt.
    const spiel = { schatz: { spalte: 4, zeile: 2 }, gegraben: [] };
    expect(grabe(spiel, { spalte: 2, zeile: 3 }).satz)
      .toBe("Nichts auf Spalte 2, Zeile 3. Noch weit - weiter rechts und weiter oben.");
    expect(grabe(spiel, { spalte: 4, zeile: 3 }).satz)
      .toBe("Nichts auf Spalte 4, Zeile 3. Ganz nah - weiter oben.");
    expect(grabe(spiel, { spalte: 4, zeile: 2 }).gefunden).toBe(true);
  });

  it("merkt sich, wo schon gegraben wurde", () => {
    let spiel = neuesSchatzgitter(zufall(2));
    spiel = nachGrabung(spiel, { spalte: 1, zeile: 1 });
    expect(spiel.gegraben).toEqual([{ spalte: 1, zeile: 1 }]);
  });

  it("kennt keine Uhr und keine Punkte", () => {
    const spiel = neuesSchatzgitter(zufall(2));
    expect(Object.keys(spiel)).toEqual(["schatz", "gegraben"]);
  });
});

describe("Zahlenstrahl horchen", () => {
  it("legt den Strahl passend zur Schulstufe", () => {
    const rng = zufall(3);
    expect(neuerStrahl(rng, 2).bis).toBe(20);
    expect(neuerStrahl(rng, 4).bis).toBe(100);
    const hoch = neuerStrahl(rng, 6);
    expect(hoch.bis).toBe(1);
    expect(hoch.text).toMatch(/^(0,\d|\d\/\d+)$/);
  });

  it("★ hat die gesuchte Zahl immer auf dem Strahl", () => {
    // Eine Zahl, die zwischen zwei Schritten liegt, wäre nicht abzulegen.
    const rng = zufall(12);
    for (const stufe of [1, 3, 5, 7]) {
      for (let i = 0; i < 100; i++) {
        const s = neuerStrahl(rng, stufe);
        const treffer = Array.from({ length: s.schritte + 1 }, (_, k) => wertAn(s, k))
          .some((w) => Math.abs(w - s.gesucht) <= toleranz(s));
        expect(treffer, `${s.text} auf ${s.von}..${s.bis}`).toBe(true);
      }
    }
  });

  it("rechnet die Stelle in einen Wert um", () => {
    const s = { von: 0, bis: 1, schritte: 10, gesucht: 0.7, text: "0,7" };
    expect(wertAn(s, 0)).toBe(0);
    expect(wertAn(s, 7)).toBeCloseTo(0.7, 10);
    expect(wertAn(s, 10)).toBe(1);
  });

  it("★ gibt die Tonhöhe als Anteil - der Ton ist nie die einzige Auskunft", () => {
    const s = { von: 0, bis: 100, schritte: 20, gesucht: 50, text: "50" };
    expect(anteil(s, 0)).toBe(0);
    expect(anteil(s, 10)).toBe(0.5);
    expect(anteil(s, 20)).toBe(1);
  });

  it("sagt beim Ablegen die Richtung", () => {
    const s = { von: 0, bis: 1, schritte: 10, gesucht: 0.7, text: "0,7" };
    expect(lege(s, 7).getroffen).toBe(true);
    expect(lege(s, 3).satz).toBe("Noch nicht. 0,7 liegt weiter rechts.");
    expect(lege(s, 9).satz).toBe("Noch nicht. 0,7 liegt weiter links.");
  });
});

describe("Zug um Zug", () => {
  it("★ lässt immer genau eines dran sein - nacheinander, nicht gleichzeitig", () => {
    // Wer gleichzeitig spielt, spielt auf Zeit. Und wer auf Zeit spielt,
    // benachteiligt jedes Kind, dessen Sprachausgabe erst vorlesen muss.
    let spiel = neuesDuell(["Mira", "Tom"], 3);
    expect(spiel.dran).toBe(0);
    spiel = nachDuellzug(spiel, true);
    expect(spiel.dran).toBe(1);
    spiel = nachDuellzug(spiel, false);
    expect(spiel.dran).toBe(0);
  });

  it("zählt Punkte nur für richtige Antworten - nie für Tempo", () => {
    let spiel = neuesDuell(["Mira", "Tom"], 3);
    spiel = nachDuellzug(spiel, true);
    spiel = nachDuellzug(spiel, false);
    expect(spiel.punkte).toEqual([1, 0]);
  });

  it("endet nach den vereinbarten Runden", () => {
    let spiel = neuesDuell(["Mira", "Tom"], 2);
    for (let i = 0; i < 3; i++) spiel = nachDuellzug(spiel, true);
    expect(duellFertig(spiel)).toBe(false);
    spiel = nachDuellzug(spiel, true);
    expect(duellFertig(spiel)).toBe(true);
  });

  it("★ nennt am Ende beide Namen - und Gleichstand ist ein Ergebnis", () => {
    expect(duellSatz({ namen: ["Mira", "Tom"], dran: 0, punkte: [3, 2], runden: 5, zuege: 10 }))
      .toBe("3 zu 2 für Mira.");
    expect(duellSatz({ namen: ["Mira", "Tom"], dran: 0, punkte: [2, 3], runden: 5, zuege: 10 }))
      .toBe("3 zu 2 für Tom.");
    expect(duellSatz({ namen: ["Mira", "Tom"], dran: 0, punkte: [2, 2], runden: 5, zuege: 10 }))
      .toBe("2 zu 2. Gleichstand.");
  });

  it("★ gibt beiden in derselben Runde dieselbe Rechenart", () => {
    // Sonst wäre das Duell keines.
    const rng = zufall(14);
    for (let runde = 0; runde < 8; runde++) {
      const eins = duellaufgabe(rng, 4, runde);
      const zwei = duellaufgabe(rng, 4, runde);
      expect(zwei.op, `Runde ${runde}`).toBe(eins.op);
    }
  });

  it("wechselt die Rechenart von Runde zu Runde", () => {
    const rng = zufall(15);
    const arten = [0, 1, 2, 3].map((r) => duellaufgabe(rng, 4, r).op);
    expect(new Set(arten).size).toBe(4);
  });

  it("stellt nur Aufgaben, die aufgehen", () => {
    const rng = zufall(16);
    for (let r = 0; r < 60; r++) {
      const a = duellaufgabe(rng, 4, r);
      const [x, y] = (a.angabe.match(/\d+/g) ?? []).map(Number);
      const soll = a.op === "plus" ? x + y : a.op === "minus" ? x - y : a.op === "mal" ? x * y : x / y;
      expect(Number(a.loesung), a.angabe).toBe(soll);
      expect(Number(a.loesung), a.angabe).toBeGreaterThanOrEqual(0);
    }
  });
});
