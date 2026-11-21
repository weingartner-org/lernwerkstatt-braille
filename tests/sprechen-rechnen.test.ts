/**
 * Wächter für das Rechen-Wörterbuch.
 *
 * Jede Zeile der Tabellen in „Plus - Die Vorlesefunktion" ist hier ein Fall.
 * Was hier nicht steht, spricht Plus nicht aus - und was hier steht, muss
 * stimmen: ein Kind, das nur zuhört, hat keine zweite Quelle.
 */
import { describe, expect, it } from "vitest";
import { bruchwort, dezimalwort, geldwort, zahlwort } from "../src/lib/sprechen/zahlwort";
import { sprich } from "../src/lib/sprechen/rechnen";

describe("Zahlwort", () => {
  it.each([
    [0, "null"], [1, "eins"], [7, "sieben"], [12, "zwölf"], [16, "sechzehn"],
    [21, "einundzwanzig"], [48, "achtundvierzig"], [90, "neunzig"],
    [100, "einhundert"], [101, "einhunderteins"], [375, "dreihundertfünfundsiebzig"],
    [1000, "eintausend"], [2026, "zweitausendsechsundzwanzig"],
    [1_000_000, "eine Million"], [2_500_000, "zwei Millionen fünfhunderttausend"],
  ])("%s heißt %s", (n, wort) => {
    expect(zahlwort(n as number)).toBe(wort);
  });

  it("nennt negative Zahlen mit minus", () => {
    expect(zahlwort(-5)).toBe("minus fünf");
  });

  it("liest nach dem Komma Ziffer für Ziffer", () => {
    // „null Komma fünfundsiebzig" wäre mehrdeutig - 0,75 und 0,075 klängen fast gleich.
    expect(dezimalwort(0.75)).toBe("null Komma sieben fünf");
    expect(dezimalwort(1.5)).toBe("eins Komma fünf");
    expect(dezimalwort(12.05)).toBe("zwölf Komma null fünf");
  });

  it("spricht Geld als Euro und Cent", () => {
    expect(geldwort(3.5)).toBe("drei Euro fünfzig");
    expect(geldwort(13.9)).toBe("dreizehn Euro neunzig");
    expect(geldwort(7)).toBe("sieben Euro");
  });

  it("gibt Brüchen ihren Namen", () => {
    expect(bruchwort(3, 4)).toBe("drei Viertel");
    expect(bruchwort(1, 2)).toBe("ein Halbes");
    expect(bruchwort(1, 8)).toBe("ein Achtel");
    expect(bruchwort(7, 4)).toBe("sieben Viertel");
    // Über zwanzig gibt es keine gebräuchliche Form.
    expect(bruchwort(3, 23)).toBe("drei durch dreiundzwanzig");
  });
});

describe("Rechenzeichen - was der Screenreader verschluckt", () => {
  it.each([
    ["48 +27 =", "achtundvierzig plus siebenundzwanzig ist"],
    ["12 -5 =", "zwölf minus fünf ist"],
    ["7 *8 =", "sieben mal acht ist"],
    ["56 /8 =", "sechsundfünfzig durch acht ist"],
    ["48 +27 =75", "achtundvierzig plus siebenundzwanzig ist fünfundsiebzig"],
  ])("%s wird zu: %s", (zeile, satz) => {
    expect(sprich(zeile)).toBe(satz);
  });

  it("sagt die Lücke an", () => {
    expect(sprich("700 +[] =1000")).toBe("siebenhundert plus Lücke ist eintausend");
  });

  it("nennt Klammern - NVDA liest sie gar nicht", () => {
    expect(sprich("(3 +4) *2 =")).toBe("in Klammer drei plus vier Klammer zu mal zwei ist");
  });

  it("spricht den Trennstrich nicht", () => {
    expect(sprich("----")).toBe("");
  });

  it("macht aus dem Spaltentrenner eine Pause", () => {
    expect(sprich("5000 | 5000")).toBe("fünftausend, fünftausend");
  });

  it("sagt bei Gleichungen ist gleich", () => {
    expect(sprich("2 *x =10", { istGleich: true })).toContain("ist gleich");
  });
});

describe("Brüche, Potenzen, Wurzeln", () => {
  it.each([
    ["3/4", "drei Viertel"],
    ["1 3/4", "eins und drei Viertel"],
    ["3/4 +1/8 =", "drei Viertel plus ein Achtel ist"],
    ["2^3", "zwei hoch drei"],
    ["5^2 =25", "fünf hoch zwei ist fünfundzwanzig"],
    ["'w(9) =3", "Wurzel aus neun ist drei"],
    ["'w[3](27) =3", "Kubikwurzel aus siebenundzwanzig ist drei"],
    ["cm^2", "Quadratzentimeter"],
  ])("%s wird zu: %s", (zeile, satz) => {
    expect(sprich(zeile)).toBe(satz);
  });

  it("hält Division und Bruch auseinander", () => {
    // Beim Rechnen steht ein Leerzeichen vor dem Schrägstrich, beim Bruch nicht.
    expect(sprich("474 /3 =")).toContain("durch");
    expect(sprich("3/4 =")).toContain("Viertel");
  });
});

describe("Das schriftliche Rechnen", () => {
  it("schreibt die Stellenwert-Kürzel aus", () => {
    expect(sprich("17 Z /3 =5 Z Rest: 2 Z")).toBe(
      "siebzehn Zehner durch drei ist fünf Zehner Rest: zwei Zehner",
    );
  });

  it("schreibt die Nebenrechnung aus", () => {
    expect(sprich("nr: 12 -12 =0")).toBe("Nebenrechnung: zwölf minus zwölf ist null");
  });

  it("verbindet mehrere Zeilen mit einem Punkt - das ist die Pause", () => {
    const satz = sprich("4 H /3 =1 H\n17 Z /3 =5 Z");
    expect(satz).toContain(". ");
    expect(satz.startsWith("vier Hunderter")).toBe(true);
  });
});

describe("Zahlen, Größen, Mengen", () => {
  it.each([
    ["0,75", "null Komma sieben fünf"],
    ["-5", "minus fünf"],
    ["25 %", "fünfundzwanzig Prozent"],
    ["1 t 45 kg", "eine Tonne fünfundvierzig Kilogramm"],
    ["3,50 EUR", "drei Euro fünfzig"],
    ["T(26)", "Teilermenge von sechsundzwanzig"],
    ["ggT", "größter gemeinsamer Teiler"],
  ])("%s wird zu: %s", (zeile, satz) => {
    expect(sprich(zeile)).toBe(satz);
  });

  it("unterscheidet Vorzeichen und Rechenzeichen", () => {
    expect(sprich("5 +(-3) =")).toBe("fünf plus in Klammer minus drei Klammer zu ist");
  });

  it("setzt die Einzahl, wo sie hingehört", () => {
    expect(sprich("1 min")).toBe("eine Minute");
    expect(sprich("5 min")).toBe("fünf Minuten");
  });
});

describe("Nichts bleibt ungesprochen", () => {
  const zeichen = ["+", "-", "*", "/", "=", "[]", "(", ")", "^", "%", "|"];

  it("kein Rechenzeichen bleibt als Zeichen stehen", () => {
    for (const z of zeichen) {
      const satz = sprich(`4 ${z}2 =6`);
      expect(satz, `${z} blieb stehen`).not.toContain(z);
    }
  });

  it("keine Ziffer bleibt als Ziffer stehen", () => {
    expect(sprich("128 /12 =10")).not.toMatch(/\d/);
  });
});

/**
 * Der eigentliche Wächter: jede Aufgabe, die der Generator baut, muss sich
 * sprechen lassen. Keine Schreibweise darf stumm bleiben - ein Kind, das nur
 * zuhört, hat keine zweite Quelle.
 */
describe("Jede erzeugte Aufgabe lässt sich sprechen", () => {
  const stumm = ["+", "*", "/", "^", "=", "[]", "(", ")", "|", "%", "−"];

  /**
   * ★ ALLE acht Stufen, nicht nur die ersten vier. Bis zum 23.09.2026 sah
   * dieser Wächter nur bis Stufe 4 - und genau die Fehler der oberen Stufen
   * („zweia", „zehn x/vier x") fielen deshalb erst beim lauten Mitlesen auf.
   */
  it("keine Angabe lässt ein Zeichen oder eine Ziffer stehen", async () => {
    const { bedienbarePakete, erzeugeLauf } = await import("../src/lib/plus/generator");

    let geprueft = 0;
    for (const id of bedienbarePakete()) {
      for (const a of erzeugeLauf(id, { anzahl: 6, saat: 2026 })) {
        const satz = sprich(a.angabe);
        for (const z of stumm) {
          expect(satz, `${id} ${a.art}: "${a.angabe}" -> "${satz}"`).not.toContain(z);
        }
        expect(satz, `${id} ${a.art}: "${a.angabe}" -> "${satz}"`).not.toMatch(/\d/);
        expect(satz.length, `${id} ${a.art}: leer`).toBeGreaterThan(0);
        geprueft++;
      }
    }
    // Die Zahl steht hier, damit auffällt, wenn der Wächter plötzlich weniger
    // sieht - etwa weil ein Paket stillschweigend aussteigt.
    expect(geprueft, `nur ${geprueft} Aufgaben geprüft`).toBeGreaterThan(900);
  });

  it("auch keine Lösung - sie wird bei der Auflösung gesprochen", async () => {
    const { bedienbarePakete, erzeugeLauf } = await import("../src/lib/plus/generator");
    for (const id of bedienbarePakete()) {
      for (const a of erzeugeLauf(id, { anzahl: 3, saat: 7 })) {
        const satz = sprich(a.loesung);
        expect(satz, `${id}: "${a.loesung}" -> "${satz}"`).not.toMatch(/\d/);
      }
    }
  });
});

describe("Zwei Funde vom Mitlesen der 4. Stufe (23.09.2026)", () => {
  it("★ spricht auch die Ziffernmarke der Fehlersuche", () => {
    // Aus „1) 5 *2 =10" wurde „eins Klammer zu fünf mal zwei ist zehn".
    const satz = sprich("Welche Zeile stimmt nicht?\n1) 5 *2 =10\n2) 3 *3 =8");
    expect(satz).not.toContain("Klammer");
    expect(satz).toContain("eins: fünf mal zwei ist zehn");
  });

  it("★ spricht die Einheit hinter der Lücke mit", () => {
    // „[] min" wurde zu „Lücke min" - das Kürzel blieb stehen.
    expect(sprich("1/4 von 24 min =[] min")).toBe("ein Viertel von vierundzwanzig Minuten ist Lücke Minuten");
  });

  it("lässt die Lücke ohne Einheit in Ruhe", () => {
    expect(sprich("700 +[] =1000")).toBe("siebenhundert plus Lücke ist eintausend");
  });
});

describe("★ Kein Kürzel bleibt im gesprochenen Satz stehen", () => {
  /**
   * Der Wächter, der die Funde dieser Nacht künftig selbst findet: Er sucht
   * in JEDEM gesprochenen Satz nach Maß-Kürzeln und nach einer „Klammer zu"
   * ohne öffnende. Beides sind Zeichen, die stehen geblieben sind.
   */
  const KUERZEL = ["t", "kg", "dag", "g", "km", "m", "dm", "cm", "mm", "l", "ml",
    "h", "min", "s", "EUR", "nr", "H", "Z", "T", "ggT", "kgV"];

  it("über alle bedienbaren Pakete", async () => {
    const { bedienbarePakete, erzeugeLauf } = await import("../src/lib/plus/generator");
    for (const id of bedienbarePakete()) {
      for (const a of erzeugeLauf(id, { anzahl: 4, saat: 555 })) {
        const satz = sprich(a.angabe);
        for (const k of KUERZEL) {
          expect(satz, `${id}: „${a.angabe}" -> „${satz}" (Kürzel ${k})`)
            .not.toMatch(new RegExp(`(^|\\s)${k}(\\s|$|[.,?!])`));
        }
        if (/Klammer zu/.test(satz)) {
          expect(satz, `${id}: Klammer zu ohne öffnende`).toMatch(/in Klammer/);
        }
        // ★ Ein Komma oder Doppelpunkt ohne Abstand ist ein stehen
        // gebliebenes Zeichen, keine Pause: „null,sechs", „eins:zweihundert".
        // Gemessen am 23.09.2026 in 7-08 und 7-16.
        expect(satz, `${id}: „${a.angabe}" -> „${satz}"`).not.toMatch(/[^\s\d][,:][^\s\d]/);
        expect(satz, `${id}: „${a.angabe}" -> „${satz}" (Ziffer)`).not.toMatch(/\d/);
        // ★ Ein Minus direkt vor einem Buchstaben: „-a" blieb stehen (8-07).
        expect(satz, `${id}: „${a.angabe}" -> „${satz}" (Minus)`).not.toMatch(/(^|\s)-\S/);
      }
    }
  });
});

describe("★ Stufe 7 mitgelesen - 23.09.2026", () => {
  it("eine Dezimalzahl als Basis: 0,6^2", () => {
    expect(sprich("0,6^2 =")).toBe("null Komma sechs hoch zwei ist");
  });

  it("das Verhältnis heißt „zu\"", () => {
    expect(sprich("1 : 200")).toBe("eins zu zweihundert");
    expect(sprich("1:200; Bild 30 cm")).toBe("eins zu zweihundert; Bild dreißig Zentimeter");
    expect(sprich("133 : 21 kürzen =")).toBe("einhundertdreiunddreißig zu einundzwanzig kürzen ist");
  });

  it("„ein Jahr\" und „ein Prozent\", nicht „eins Jahr\"", () => {
    expect(sprich("2600 zu 5 % Zinsen für 1 Jahr =")).toBe("zweitausendsechshundert zu fünf Prozent Zinsen für ein Jahr ist");
    expect(sprich("3700 zu 1 % Zinsen")).toBe("dreitausendsiebenhundert zu ein Prozent Zinsen");
    // Die Eins als Zahl bleibt eins.
    expect(sprich("8 *1 =")).toBe("acht mal eins ist");
  });

  it("die Doppelpunkte, die Pausen sind, bleiben Pausen", () => {
    expect(sprich("Rest: 1 H")).toBe("Rest: eins Hunderter");
  });
});

describe("★ Stufe 8 mitgelesen - 23.09.2026", () => {
  it("das Minus vor einem Buchstaben wird gesprochen", () => {
    expect(sprich("(-a -6) *(-6a -7) =")).toBe(
      "in Klammer minus a minus sechs Klammer zu mal in Klammer minus sechs a minus sieben Klammer zu ist");
    expect(sprich("-x *(-4x +3) =")).toBe("minus x mal in Klammer minus vier x plus drei Klammer zu ist");
  });

  it("der Gedankenstrich vor „stimmt das?\" bleibt eine Pause", () => {
    expect(sprich("'w(18) /'w(3) ='w(6) - stimmt das?")).toBe(
      "Wurzel aus achtzehn durch Wurzel aus drei ist Wurzel aus sechs - stimmt das?");
  });
});
