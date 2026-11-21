/**
 * Wächter: Braillezeile mit 40 oder 80 Zeichen, und was die Lehrkraft dafür festlegt
 * (Johannes, 19.10.2026).
 *
 * „Umschalter von 40 auf 80 Zeichen Braillezeile - passe die Inhalte (Zeilenumbrüche)
 * klug der Eingabezeile an … bei der Eingabe möglichst selten ein Zeilenumbruch" und
 * „die neuen Einstellungen soll auch der Lehrer unter Meine Klassen / Plus einstellen können".
 */
import { afterEach, describe, expect, it } from "vitest";
import { vorlageInZellen } from "../src/components/plus/PlusEingabe";
import { useEinstellungen } from "../src/lib/plus/einstellungen";
import { erzeugeLauf } from "../src/lib/plus/generator";
import { PAKETE } from "../src/lib/plus/stoffplan";
import { brecheUm, platzJeLuecke } from "../src/lib/plus/umbruch";
import { eingabezeileBraille } from "../src/lib/plus/zeile";
import {
  braillevorgabe, heileBeschluss, mitKindBraille, mitKlasse,
} from "../src/lib/plus/beschluss";

const ALLE = PAKETE.flatMap((p) => erzeugeLauf(p.id, { anzahl: 12, saat: 4 }));
const einzeilige = ALLE.map((a) => ({ a, z: eingabezeileBraille(a)! })).filter(({ z }) => z && !z.mehrzeilig);

afterEach(() => {
  useEinstellungen.getState().setVorgabe({});
  useEinstellungen.getState().setEingabeart("normal");
  useEinstellungen.getState().setBreite(40);
  localStorage.clear();
});

function umbrueche(breite: number): number {
  let n = 0;
  for (const { a, z } of einzeilige) n += brecheUm(z.vorlage, a.loesung.length, breite).split("\n").length - 1;
  return n;
}

describe("80 Zeichen: die Umbrüche folgen der Breite", () => {
  it("★ keine Zeile über 80 - mit der Antwort, die das Kind voraussichtlich schreibt", () => {
    const zuLang: string[] = [];
    for (const { a, z } of einzeilige) {
      const platz = platzJeLuecke(a.loesung.length, z.vorlage.split("[]").length - 1);
      for (const zeile of brecheUm(z.vorlage, a.loesung.length, 80).split("\n")) {
        const breite = zeile.length + (zeile.split("[]").length - 1) * platz;
        if (breite > 80 && zeile.includes(" ")) zuLang.push(`${breite}: ${zeile}`);
      }
    }
    expect(zuLang).toEqual([]);
  });

  it("★ mit 80 gibt es deutlich weniger Umbrüche als mit 40", () => {
    const u40 = umbrueche(40);
    const u80 = umbrueche(80);
    expect(u40).toBeGreaterThan(0);
    expect(u80).toBeLessThan(u40 * 0.5);
  });

  it("die Länge bleibt gleich - die Schreibmarke gilt weiter", () => {
    for (const { a, z } of einzeilige) {
      expect(brecheUm(z.vorlage, a.loesung.length, 80).length).toBe(z.vorlage.length);
    }
  });

  it("★ in Zellen: Computerbraille hat mit 80 keine Zeile über 80 und mit 40 keine über 40", () => {
    for (const breite of [40, 80]) {
      for (const { a, z } of einzeilige) {
        const v = vorlageInZellen(z.vorlage, z.marke, "marburger", { umbrechen: true, erwartet: a.loesung.length, breite });
        for (const zeile of v!.zellen.split("\n")) {
          if (zeile.includes(" ")) expect(zeile.length, `${breite}: ${a.angabe}`).toBeLessThanOrEqual(breite);
        }
      }
    }
  });
});

describe("Die Breite im Speicher des Kindes", () => {
  it("steht auf 40, wird gemerkt und kennt nur 40 und 80", () => {
    expect(useEinstellungen.getState().breite).toBe(40);
    useEinstellungen.getState().setBreite(80);
    expect(useEinstellungen.getState().breite).toBe(80);
    expect(JSON.parse(localStorage.getItem("plus_einstellungen")!).breite).toBe(80);
  });
});

describe("Die Vorgabe der Lehrkraft geht vor die Wahl des Kindes", () => {
  it("★ überdeckt die Wahl, ändert sie nicht, und fällt sie weg, gilt die Wahl wieder", () => {
    const s = useEinstellungen.getState();
    s.setBreite(80);
    s.setVorgabe({ braillezeile: true, schrift: "marburger", breite: 40 });
    let n = useEinstellungen.getState();
    expect([n.braillezeile, n.schrift, n.breite, n.eingabeart]).toEqual([true, "marburger", 40, "marburger"]);
    // Das Kind kann es nicht ändern - weder in den Einstellungen noch mit Alt + B.
    n.setBreite(80); n.setBraillezeile(false); n.setSchrift("computer"); n.naechsteEingabeart();
    n = useEinstellungen.getState();
    expect([n.braillezeile, n.schrift, n.breite]).toEqual([true, "marburger", 40]);
    // Die Vorgabe landet nie im Gerätespeicher.
    expect(JSON.parse(localStorage.getItem("plus_einstellungen")!).breite).toBe(80);
    n.setVorgabe({});
    n = useEinstellungen.getState();
    expect([n.braillezeile, n.breite, n.eingabeart]).toEqual([false, 80, "normal"]);
  });

  it("★ Eingabe folgt der Braillezeile (Johannes, 22.10.2026): ohne Braillezeile Tastatur, mit ihr greift das Kind - in jeder Schrift", () => {
    const s = () => useEinstellungen.getState();
    expect(s().eingabe).toBe("tastatur");
    s().setBraillezeile(true);
    expect(s().eingabe).toBe("braille");
    s().setSchrift("marburger");
    expect(s().eingabe).toBe("braille");
    s().setSchrift("computer");
    expect(s().eingabe).toBe("braille");
    s().setBraillezeile(false);
    expect(s().eingabe).toBe("tastatur");
  });

  it("★ nur die Lehrkraft kann es anders festlegen - und fällt die Vorgabe weg, folgt es wieder der Braillezeile", () => {
    const s = () => useEinstellungen.getState();
    s().setBraillezeile(true);
    s().setVorgabe({ eingabe: "tastatur" });
    expect(s().eingabe).toBe("tastatur");
    s().setVorgabe({});
    expect(s().eingabe).toBe("braille");
    s().setBraillezeile(false);
    s().setVorgabe({ eingabe: "braille" });
    expect(s().eingabe).toBe("braille");
  });

  it("★ die Schrift (6/8 Punkte) gilt für die Ausgabe, auch wenn die Lehrkraft Tastatur vorgibt", () => {
    const s = useEinstellungen.getState();
    s.setVorgabe({ eingabe: "tastatur" });
    s.setBraillezeile(true);
    s.setSchrift("marburger");
    expect(useEinstellungen.getState().eingabeart).toBe("marburger");
    expect(useEinstellungen.getState().eingabe).toBe("tastatur");
  });

  it("was die Lehrkraft offen lässt, wählt das Kind selbst", () => {
    useEinstellungen.getState().setVorgabe({ breite: 80 });
    useEinstellungen.getState().setBraillezeile(true);
    const n = useEinstellungen.getState();
    expect([n.braillezeile, n.breite]).toEqual([true, 80]);
  });
});

describe("Der Beschluss: Klasse und einzelnes Kind", () => {
  it("★ das Kind geht vor die Klasse, Feld für Feld", () => {
    const b = mitKindBraille(
      mitKlasse({}, { braillezeile: true, schrift: "computer", breite: 40 }),
      { breite: 80, braillezeile: false },
    );
    expect(braillevorgabe(true, heileBeschluss(b))).toEqual({ braillezeile: false, schrift: "computer", breite: 80 });
  });

  it("ohne Klasse (Selbstlerner) nie eine Vorgabe", () => {
    expect(braillevorgabe(false, heileBeschluss(mitKlasse({}, { braillezeile: true, breite: 80 })))).toEqual({});
  });

  it("leere Wahl = nichts gespeichert; Unbekanntes fällt weg", () => {
    expect(mitKindBraille({ braille: { breite: 80 } }, {}).braille).toBeUndefined();
    expect(mitKlasse({}, { breite: 80 }).klasse).toEqual({ breite: 80 });
    const roh = heileBeschluss({ klasse: { breite: 60, schrift: "x", braillezeile: false }, braille: { breite: "80" } });
    expect(roh.klasse).toBeUndefined();
    expect(roh.braille).toBeUndefined();
  });
});
