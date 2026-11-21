/**
 * Plus - Wächter für den Aufgabengenerator (Baustufe 1).
 *
 * Der Test rechnet NICHT mit den Zahlen, die der Generator mitliefert. Er
 * liest die Angabe so, wie ein Kind sie liest, rechnet selbst nach und
 * vergleicht mit der Lösung. Sonst prüfte er nur, ob der Generator mit sich
 * selbst einig ist.
 */
import { describe, expect, it } from "vitest";
import { istRichtig, normal, pruefe, zufall, type Aufgabe } from "../src/lib/plus/aufgabe";
import { PAKETE, paket, STUFEN } from "../src/lib/plus/stoffplan";
import {
  bedienbarePakete, erzeugeAufgabe, erzeugeLauf, fehlendeBauarten, GEBAUTE_FORMEN, ZUORDNUNG,
} from "../src/lib/plus/generator";

/* ------------------------------------------------------------------ */
/* Ein unabhängiger Leser für die Schreibweise                          */
/* ------------------------------------------------------------------ */

const ZAHL = String.raw`-?\d+(?:,\d+)?`;

function alsZahl(s: string): number {
  return Number(s.replace(",", "."));
}

/** Liest `48 +27 =` oder `48 +27 =75` und rechnet selbst nach. */
function nachrechnen(angabe: string): { erwartet: number; a: number; b: number; zeichen: string } | null {
  const m = new RegExp(`^(${ZAHL}) ([-+*/])(${ZAHL}) =(${ZAHL})?$`).exec(angabe.trim());
  if (!m) return null;
  const a = alsZahl(m[1]);
  const b = alsZahl(m[3]);
  const zeichen = m[2];
  const erwartet = zeichen === "+" ? a + b : zeichen === "-" ? a - b : zeichen === "*" ? a * b : a / b;
  return { erwartet, a, b, zeichen };
}

function alleAufgaben(paketId: string, proArt = 40): Aufgabe[] {
  const p = paket(paketId);
  const arten = p.arten.filter((a) => GEBAUTE_FORMEN.includes(a));
  const rng = zufall(4711);
  const raus: Aufgabe[] = [];
  for (const art of arten) for (let i = 0; i < proArt; i++) raus.push(erzeugeAufgabe(paketId, art, rng));
  return raus;
}

/* ------------------------------------------------------------------ */

describe("Stoffplan", () => {
  it("hat 161 Pakete in acht Stufen", () => {
    expect(STUFEN).toHaveLength(8);
    expect(PAKETE).toHaveLength(161);
  });

  it("jede Voraussetzung gibt es, keine zeigt auf eine spätere Stufe", () => {
    const stufeVon = new Map(PAKETE.map((p) => [p.id, Number(p.id.split("-")[0])]));
    for (const p of PAKETE) {
      for (const v of p.braucht) {
        expect(stufeVon.has(v), `${p.id} braucht ${v}`).toBe(true);
        expect(stufeVon.get(v)!, `${p.id} braucht ${v}`).toBeLessThanOrEqual(stufeVon.get(p.id)!);
      }
    }
  });

  it("jedes Paket hat mindestens eine Aufgabenart", () => {
    for (const p of PAKETE) expect(p.arten.length, p.id).toBeGreaterThan(0);
  });
});

describe("Schreibweise", () => {
  it("vergleicht Antworten großzügig, aber nicht falsch", () => {
    const a: Aufgabe = { paket: "x", art: "ergebnis", op: "plus", angabe: "1 +1 =", loesung: "0,5", zahlen: [] };
    expect(istRichtig("0,5", a)).toBe(true);
    expect(istRichtig("0.5", a)).toBe(true);
    expect(istRichtig("0,50", a)).toBe(true);
    expect(istRichtig(" 0,5 ", a)).toBe(true);
    expect(istRichtig(",5", a)).toBe(true);
    expect(istRichtig("5", a)).toBe(false);
    expect(istRichtig("-0,5", a)).toBe(false);
  });

  it("lässt Doppelpunkt und Schrägstrich gleich gelten", () => {
    // Auf der Braillezeile gibt es für beides nur ein Zeichen. Wer `3 : 7`
    // greift, bekommt `3 /7` zurück - und hat trotzdem richtig gerechnet.
    const a: Aufgabe = { paket: "x", art: "ergebnis", op: "geteilt", angabe: "Verhältnis?", loesung: "3 : 7", zahlen: [] };
    expect(istRichtig("3 : 7", a)).toBe(true);
    expect(istRichtig("3/7", a)).toBe(true);
    expect(istRichtig("3 /7", a)).toBe(true);
    expect(istRichtig("7 : 3", a)).toBe(false);
  });

  it("kürzt führende Nullen, behält das Vorzeichen", () => {
    expect(normal("007")).toBe("7");
    expect(normal("-05")).toBe("-5");
    expect(normal("0")).toBe("0");
  });
});

describe("Generator", () => {
  const gebaut = Object.keys(ZUORDNUNG);

  it("bedient heute Stufe 1 und 2", () => {
    expect(gebaut.sort()).toEqual(PAKETE.filter((p) => p.id.startsWith("1-") || p.id.startsWith("2-")).map((p) => p.id).sort());
  });

  it("was nicht spielbar ist, liefert nachweislich nichts", () => {
    // Gemessen, nicht geschlossen: für jedes wartende Paket wird jede Form
    // wirklich versucht. Ein Paket kann eine gebaute Form nennen, ohne dass
    // sie mit seinem Kern zurechtkommt - eine Bruchaufgabe gibt ihre zwei
    // Zahlen nicht her, und eine Strategiewahl daraus wäre geraten.
    const spielbar = new Set(bedienbarePakete());
    const rng = zufall(5);
    for (const p of PAKETE.filter((q) => !spielbar.has(q.id))) {
      for (const art of p.arten) {
        if (!GEBAUTE_FORMEN.includes(art)) continue;
        expect(() => erzeugeAufgabe(p.id, art, rng), `${p.id} ${art} hätte liefern müssen`).toThrow();
      }
    }
    expect(spielbar.size).toBeGreaterThan(140);
  });

  it("kein Paket des Stoffplans ist ohne Bauart", () => {
    // Stand 22.09.2026: alle acht Stufen sind gebaut. Wer ein Paket in den
    // Stoffplan schreibt, ohne eine Bauart zu hinterlegen, lässt diesen Test
    // rot werden - das ist der Sinn.
    expect(fehlendeBauarten(PAKETE.map((p) => p.id))).toEqual([]);
  });

  it.each(gebaut)("Paket %s: jede Lösung stimmt", (id) => {
    for (const a of alleAufgaben(id)) {
      const gelesen = nachrechnen(a.angabe);
      if (!gelesen) continue; // Formen ohne reine Rechnung prüfen die Tests unten
      if (a.art === "ergebnis") {
        const erwartet = a.rest !== undefined ? `${gelesen.erwartet - (gelesen.erwartet % 1)}` : String(gelesen.erwartet);
        if (a.rest === undefined) expect(normal(a.loesung), a.angabe).toBe(normal(erwartet));
      }
    }
  });

  it.each(gebaut)("Paket %s: Lücken lassen sich wieder schließen", (id) => {
    for (const a of alleAufgaben(id)) {
      // Nur einzeilige Rechnungen mit genau einer Lücke lassen sich so prüfen.
      if (a.art !== "luecke_zahl") continue;
      if (a.angabe.includes("\n")) continue;
      if (a.angabe.split("[]").length !== 2) continue;
      if (!/^-?\d/.test(a.angabe)) continue;
      const gefuellt = a.angabe.replace("[]", a.loesung);
      const gelesen = nachrechnen(gefuellt);
      expect(gelesen, `${a.angabe} -> ${gefuellt}`).not.toBeNull();
      const erg = alsZahl(/=(-?\d+(?:,\d+)?)/.exec(gefuellt)![1]);
      expect(gelesen!.erwartet, gefuellt).toBeCloseTo(erg, 6);
    }
  });

  it.each(bedienbarePakete())("Paket %s: ein Lauf ist voll und wiederholt sich nie direkt", (id) => {
    const lauf = erzeugeLauf(id, { anzahl: 12, saat: 99 });
    expect(lauf.length, id).toBe(12);
    for (let i = 1; i < lauf.length; i++) {
      expect(lauf[i].angabe, `${id}: zweimal hintereinander`).not.toBe(lauf[i - 1].angabe);
    }
    // Auch ein kleines Paket bringt Abwechslung: mindestens sechs verschiedene.
    expect(new Set(lauf.map((a) => a.angabe)).size, id).toBeGreaterThanOrEqual(6);
  });

  it("liefert bei gleicher Saat denselben Lauf", () => {
    const a = erzeugeLauf("2-15", { anzahl: 10, saat: 7 });
    const b = erzeugeLauf("2-15", { anzahl: 10, saat: 7 });
    const c = erzeugeLauf("2-15", { anzahl: 10, saat: 8 });
    expect(a.map((x) => x.angabe)).toEqual(b.map((x) => x.angabe));
    expect(a.map((x) => x.angabe)).not.toEqual(c.map((x) => x.angabe));
  });
});

describe("Die Zahlen passen zur Strategie", () => {
  function rechnungen(id: string) {
    return alleAufgaben(id, 60).filter((a) => a.art === "ergebnis").map((a) => ({ a, g: nachrechnen(a.angabe)! })).filter((x) => x.g);
  }

  it("1-08 Einspluseins bleibt unter zehn", () => {
    for (const { g } of rechnungen("1-08")) expect(g.a + g.b).toBeLessThanOrEqual(10);
  });

  it("1-13 hat immer einen Zehnerübergang", () => {
    for (const { g, a } of rechnungen("1-13")) expect((g.a % 10) + (g.b % 10), a.angabe).toBeGreaterThan(9);
  });

  it("1-14 geht immer über den Zehner zurück", () => {
    for (const { g, a } of rechnungen("1-14")) {
      expect(g.a % 10, a.angabe).toBeLessThan(g.b % 10);
      expect(g.erwartet).toBeGreaterThanOrEqual(0);
    }
  });

  it("1-05 Kraft der Fünf: beide Zahlen zwischen fünf und neun", () => {
    for (const { g } of rechnungen("1-05")) {
      expect(g.a).toBeGreaterThanOrEqual(5);
      expect(g.b).toBeGreaterThanOrEqual(5);
      expect(Math.max(g.a, g.b)).toBeLessThanOrEqual(9);
    }
  });

  it("2-06 hat nie einen Übergang, 2-08 immer", () => {
    for (const { g } of rechnungen("2-06")) expect((g.a % 10) + (g.b % 10)).toBeLessThanOrEqual(9);
    for (const { g } of rechnungen("2-08")) expect((g.a % 10) + (g.b % 10)).toBeGreaterThan(9);
  });

  it("Zahlenfolgen bleiben im Zahlenraum", () => {
    const grenzen: Record<string, number> = { "1-02": 20, "2-02": 100 };
    for (const [id, bis] of Object.entries(grenzen)) {
      for (const a of alleAufgaben(id, 60)) {
        for (const z of a.zahlen) {
          expect(z, `${id}: ${a.angabe}`).toBeGreaterThanOrEqual(0);
          expect(z, `${id}: ${a.angabe}`).toBeLessThanOrEqual(bis);
        }
      }
    }
  });

  it("ein Päckchen aus Divisionen geht in jeder Zeile auf", () => {
    for (const id of Object.keys(ZUORDNUNG)) {
      const laeufe = [1, 2, 3, 4, 5, 6].flatMap((saat) => erzeugeLauf(id, { anzahl: 12, saat }));
      for (const a of laeufe) {
        if (a.art !== "folge" || !a.angabe.includes("/")) continue;
        for (const zeile of a.angabe.split("\n")) {
          const m = /^(\d+) \/(\d+) =(\d+)?$/.exec(zeile);
          if (!m) continue;
          expect(Number(m[1]) % Number(m[2]), `${id}: ${zeile}`).toBe(0);
        }
      }
    }
  });

  it("2-12 sind Quadratzahlen", () => {
    for (const { g } of rechnungen("2-12")) expect(g.a).toBe(g.b);
  });

  it("2-16 Einsdurcheins geht ohne Rest auf", () => {
    for (const { g } of rechnungen("2-16")) expect(g.a % g.b).toBe(0);
  });

  it("2-17 hat immer einen Rest", () => {
    for (const a of alleAufgaben("2-17", 60)) {
      if (a.art !== "ergebnis") continue;
      expect(a.rest, a.angabe).toBeGreaterThan(0);
      expect(a.loesung, a.angabe).toMatch(/\(\d+ Rest\)/);
    }
  });

  it("eine Probe mit ja zeigt wirklich das richtige Ergebnis - auch den Rest", async () => {
    // ★ Über ALLE Stufen: eine Probe, die „ja" sagt und daneben liegt, lehrt
    // ein Kind, seiner eigenen Rechnung zu misstrauen.
    const { bedienbarePakete, erzeugeLauf } = await import("../src/lib/plus/generator");
    for (const id of bedienbarePakete()) {
      for (const a of erzeugeLauf(id, { anzahl: 8, saat: 31 })) {
        if (a.art !== "wahr_falsch" && a.art !== "probe") continue;
        const m = /^(-?\d+) ([-+*/])(-?\d+) =(\d+)(?: \((\d+) Rest\))? - stimmt das\?$/.exec(a.angabe);
        if (!m) continue;
        const [, sa, z, sb, serg, srest] = m;
        const x = Number(sa), y = Number(sb), erg = Number(serg);
        const wahr = z === "+" ? x + y === erg
          : z === "-" ? x - y === erg
          : z === "*" ? x * y === erg
          : Math.floor(x / y) === erg && (srest === undefined ? x % y === 0 : x % y === Number(srest));
        expect(wahr ? "ja" : "nein", `${id}: ${a.angabe}`).toBe(a.loesung);
      }
    }
  });

  it("nie eine Minusaufgabe mit negativem Ergebnis in Stufe 1 und 2", () => {
    for (const id of Object.keys(ZUORDNUNG)) {
      for (const { g, a } of rechnungen(id)) {
        if (g.zeichen === "-") expect(g.erwartet, `${id}: ${a.angabe}`).toBeGreaterThanOrEqual(0);
      }
    }
  });
});

describe("Die Zeile bleibt lesbar", () => {
  it("keine Angabe ist länger als 40 Zeichen je Zeile - über ALLE Stufen", async () => {
    // 40 Zellen ist die übliche Breite einer Braillezeile. Was länger ist,
    // muss gescrollt werden - mitten in der Rechnung.
    //
    // ★ Bis zum 23.09.2026 sah dieser Wächter nur die Stufen 1 und 2. Jetzt
    // geht er über jedes bedienbare Paket - und über die Lösungen dazu, denn
    // auch sie stehen auf der Zeile.
    const { bedienbarePakete, erzeugeLauf } = await import("../src/lib/plus/generator");
    let geprueft = 0;
    for (const id of bedienbarePakete()) {
      for (const a of erzeugeLauf(id, { anzahl: 6, saat: 99 })) {
        for (const zeile of a.angabe.split("\n")) {
          expect(zeile.length, `${id}: ${zeile}`).toBeLessThanOrEqual(40);
        }
        for (const zeile of String(a.loesung).split("\n")) {
          expect(zeile.length, `${id} (Lösung): ${zeile}`).toBeLessThanOrEqual(40);
        }
        geprueft++;
      }
    }
    expect(geprueft, `nur ${geprueft} Aufgaben geprüft`).toBeGreaterThan(900);
  });

  it("benutzt den gewöhnlichen Bindestrich, nie das typografische Minus", async () => {
    // ★ Über ALLE Stufen: an dieser Regel hängt mehr als die Optik. NVDA
    // meldet U+002D, das typografische Minus U+2212 nicht - und der
    // Marburger Übersetzer liest nur den Bindestrich.
    const { bedienbarePakete, erzeugeLauf } = await import("../src/lib/plus/generator");
    for (const id of bedienbarePakete()) {
      for (const a of erzeugeLauf(id, { anzahl: 6, saat: 13 })) {
        expect(a.angabe, id).not.toContain("−");
        expect(String(a.loesung), `${id} (Lösung)`).not.toContain("−");
        expect(a.loesung, id).not.toContain("−");
      }
    }
  });

  it("schreibt Dezimalzahlen mit Komma, nie mit Punkt", async () => {
    // ★ Über ALLE Stufen - ab Stufe 5 gibt es überhaupt erst Kommazahlen.
    const { bedienbarePakete, erzeugeLauf } = await import("../src/lib/plus/generator");
    for (const id of bedienbarePakete()) {
      for (const a of erzeugeLauf(id, { anzahl: 6, saat: 21 })) {
        expect(a.angabe, id).not.toMatch(/\d\.\d/);
        expect(String(a.loesung), `${id} (Lösung)`).not.toMatch(/\d\.\d/);
      }
    }
  });
});

describe("★ Eine Menge hat keine Reihenfolge", () => {
  const menge: Aufgabe = {
    paket: "6-01", art: "menge", op: "zahlen",
    angabe: "T(12) =", loesung: "{1; 2; 3; 4; 6; 12}", zahlen: [12],
  };

  it("nimmt dieselben Zahlen in anderer Reihenfolge an", () => {
    expect(istRichtig("{1; 2; 3; 4; 6; 12}", menge)).toBe(true);
    expect(istRichtig("{12; 6; 4; 3; 2; 1}", menge)).toBe(true);
    expect(istRichtig("{2;1;3;12;4;6}", menge)).toBe(true);
  });

  it("weist eine falsche Menge ab", () => {
    expect(istRichtig("{1; 2; 3; 4; 6}", menge)).toBe(false);
    expect(istRichtig("{1; 2; 3; 4; 6; 12; 24}", menge)).toBe(false);
    expect(istRichtig("{1; 2; 3; 5; 6; 12}", menge)).toBe(false);
  });

  it("★ eine ZAHLENREIHE bleibt der Reihe nach - sie steht ohne Klammern da", () => {
    const reihe: Aufgabe = {
      paket: "7-01", art: "ergebnis", op: "zahlen",
      angabe: "Der Größe nach ordnen: 3; -5; 2", loesung: "-5; 2; 3", zahlen: [],
    };
    expect(istRichtig("-5; 2; 3", reihe)).toBe(true);
    expect(istRichtig("3; 2; -5", reihe)).toBe(false);
  });
});

// ⚠️ Bis 16.10.2026 hiess dieser Block „Die Einheit darf fehlen" („40" für
// „40 %" war richtig). Johannes, 16.10.2026: Einheit vergessen ist noch nicht
// richtig - „Richtig gerechnet - Einheit fehlt" (`fehlendeEinheit()`).
describe("★ Die Einheit gehört dazu - steht sie schon da, darf sie fehlen", () => {
  it("wer gerechnet hat, hört „richtig gerechnet - Einheit fehlt\"", () => {
    const prozent: Aufgabe = {
      paket: "6-22", art: "ergebnis", op: "prozent",
      angabe: "440 von 1100 sind wie viel %?", loesung: "40 %", zahlen: [440, 1100],
    };
    expect(istRichtig("40 %", prozent)).toBe(true);
    expect(istRichtig("40", prozent)).toBe(false);
    expect(pruefe("40", prozent)).toMatchObject({ stand: "einheit", hinweis: "Einheit fehlt: %" });
    expect(istRichtig("40%", prozent)).toBe(true);
    expect(istRichtig("41", prozent)).toBe(false);
  });

  it("und eine mitgeschriebene Einheit stört nicht - wenn es die richtige ist", () => {
    const gramm: Aufgabe = {
      paket: "5-16", art: "ergebnis", op: "bruch", angabe: "1/5 von 410 g =[] g", loesung: "82", zahlen: [1, 5, 410],
    };
    expect(istRichtig("82 g", gramm)).toBe(true);
    expect(istRichtig("82", gramm)).toBe(true);
  });

  it("★★★ eine FALSCHE Einheit ist nicht richtig (eine andere App der Plattform , Johannes 04.09.2026)", () => {
    // „25 cm sind ja nicht dasselbe wie 25 m." Bis 25.09.2026 galt hier jede
    // Einheit: `12 kg` war die richtige Antwort auf `5 +7 =`.
    const blank: Aufgabe = {
      paket: "x", art: "ergebnis", op: "plus", angabe: "5 +7 =", loesung: "12", zahlen: [5, 7],
    };
    expect(istRichtig("12 kg", blank)).toBe(false);
    expect(pruefe("12 kg", blank).stand).toBe("einheit");
    const saft: Aufgabe = {
      paket: "6-24", art: "sach", op: "bruch", angabe: "12 l Saft sind da.\nPaul trinkt 4 Achtel davon.\nWie viel bleibt?",
      loesung: "6 l", auchRichtig: ["6"], zahlen: [12],
    };
    expect(istRichtig("6 Liter", saft)).toBe(true);
    expect(istRichtig("6 kg", saft)).toBe(false);
    expect(pruefe("6 kg", saft).stand).toBe("einheit");
    // Ein Wort, das keine Einheit ist, bleibt Beiwerk.
    const kinder: Aufgabe = {
      paket: "6-24", art: "sach", op: "prozent", angabe: "Von 200 Kindern fahren 59 % mit dem Rad.\nWie viele Kinder sind das?",
      loesung: "118", zahlen: [200, 59],
    };
    expect(istRichtig("118 Kinder", kinder)).toBe(true);
  });

  it("lässt zusammengesetzte Größen in Ruhe", () => {
    // „1 t 45 kg" ist keine Zahl mit Einheit, sondern zwei Angaben.
    const groesse: Aufgabe = {
      paket: "x", art: "umwandeln", op: "gemischt",
      angabe: "1045 kg = [] t [] kg", loesung: "1 t 45 kg", zahlen: [],
    };
    expect(istRichtig("1 t 45 kg", groesse)).toBe(true);
    expect(istRichtig("1045", groesse)).toBe(false);
  });

  it("die Menge geht auch ohne geschweifte Klammern", () => {
    const menge: Aufgabe = {
      paket: "6-01", art: "menge", op: "zahlen",
      angabe: "T(12) =", loesung: "{1; 2; 3; 4; 6; 12}", zahlen: [12],
    };
    expect(istRichtig("1; 2; 3; 4; 6; 12", menge)).toBe(true);
  });
});

describe("★ Kein Programmwort im Text", () => {
  it("in keinem Paket steht „undefined\", „NaN\" oder „null\"", () => {
    // Gemessen am 23.09.2026 beim lauten Mitlesen von Stufe 5: Paket 5-18
    // bot „c) undefined" als Rechenweg an. Die Lösung stimmte trotzdem -
    // deshalb sah es kein Wächter, der nur nachrechnet.
    const fehler: string[] = [];
    for (const id of bedienbarePakete()) {
      const laeufe = [1, 2, 3, 4, 5, 6].flatMap((saat) => erzeugeLauf(id, { anzahl: 12, saat }));
      for (const a of laeufe) {
        const texte = [a.angabe, a.loesung, ...(a.auchRichtig ?? []), ...(a.weg ?? []).flatMap((s) => [s.satz, s.zeile])];
        for (const t of texte) {
          if (/\bundefined\b|\bNaN\b|\bnull\b|\[object/.test(t)) fehler.push(`${id}: ${t.replace(/\n/g, " ⏎ ")}`);
        }
      }
    }
    expect(fehler.slice(0, 10)).toEqual([]);
  });
});

describe("★ Hinter der Lücke steht kein „=\"", () => {
  it("in keinem Paket endet eine Zeile auf `[] =`", () => {
    // Die Lücke ist die Stelle der Antwort. Gemessen am 23.09.2026 in 6-22:
    // „3225 sind 75 % von [] =" - gesprochen „... von Lücke ist".
    const fehler: string[] = [];
    for (const id of bedienbarePakete()) {
      for (const a of [1, 2, 3].flatMap((saat) => erzeugeLauf(id, { anzahl: 12, saat }))) {
        for (const zeile of a.angabe.split("\n")) if (/\[\] =$/.test(zeile)) fehler.push(`${id}: ${zeile}`);
      }
    }
    expect(fehler.slice(0, 5)).toEqual([]);
  });
});

describe("★ Die Kette bleibt im Zahlenraum ihres Pakets", () => {
  it("kein Minus unter null und nicht über die Grenze", () => {
    // Gemessen am 23.09.2026 beim Mitlesen: `703 -511 =[] -198 =[]` ergab
    // -6 in Stufe 3, `30 -16 =[] -17 =[]` ergab -3 in Stufe 2 - negative
    // Zahlen kommen erst in Stufe 6. Und `504 +328 =[] +281 =[]` ergab 1113
    // im Zahlenraum bis 1000.
    const fehler: string[] = [];
    for (const p of PAKETE) {
      if (!p.arten.includes("kette")) continue;
      const m = /^(-?\d+)(?:-| bis )(-?\d+)$/.exec(p.zr);
      if (!m) continue;
      const [lo, hi] = [Number(m[1]), Number(m[2])];
      const rng = zufall(2309);
      for (let i = 0; i < 60; i++) {
        const a = erzeugeAufgabe(p.id, "kette", rng);
        for (const w of a.loesung.split(" und ").map((x) => Number(x.replace(",", ".")))) {
          if (w < lo || w > hi) fehler.push(`${p.id} (${p.zr}): ${a.angabe} => ${a.loesung}`);
        }
      }
    }
    expect(fehler.slice(0, 6)).toEqual([]);
  });
});

describe("★ Jede Zahl bleibt im Zahlenraum ihres Pakets", () => {
  it("in der Angabe und in der Lösung - über alle Pakete", () => {
    // Gemessen am 23.09.2026: die Zahlenmauer in 1-03 („bis 10") endete bei
    // 19, die Folge in 1-06 lief bis 12 +12 =24, 3-05 baute eine Mauer mit
    // 1747. Ein Kind der 1. Stufe kennt die 24 noch nicht.
    // Ausgenommen: die FALSCHE Zeile bei „Welche Zeile stimmt nicht?" - sie
    // ist absichtlich daneben (`3 +8 =21`, Ziffern vertauscht).
    const fehler: string[] = [];
    const ok = new Set(bedienbarePakete());
    for (const p of PAKETE) {
      if (!ok.has(p.id)) continue;
      const m = /^(-?\d+)(?:-| bis )(-?\d+)$/.exec(p.zr);
      if (!m) continue;
      const [lo, hi] = [Number(m[1]), Number(m[2])];
      for (const saat of [1, 2, 3, 4, 5]) {
        for (const a of erzeugeLauf(p.id, { anzahl: 12, saat })) {
          if (/^Welche Zeile stimmt nicht\?/.test(a.angabe)) continue;
          const text = `${a.angabe}\n${a.loesung}`;
          for (const t of text.matchAll(/(?:(?<=^|[(=]|; )(-))?(?<![\d,])(\d+(?:,\d+)?)/gm)) {
            const w = Number(((t[1] ?? "") + t[2]).replace(",", "."));
            if (w < lo || w > hi) { fehler.push(`${p.id} (${p.zr}): ${a.angabe.replace(/\n/g, " ⏎ ")} => ${a.loesung}`); break; }
          }
        }
      }
    }
    expect(fehler.slice(0, 12)).toEqual([]);
  });
});
