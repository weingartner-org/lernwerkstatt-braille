/**
 * Wächter für das schriftliche Rechnen in Zeilen.
 *
 * ★ Die Fälle sind die BEISPIELE AUS DEN QUELLEN, nicht ausgedachte:
 * „Mathematik in linearer Darstellung" (Stanetty, BBI 2010) für Addition und
 * Subtraktion, die didaktisch-methodische Struktur für die Division. Wo mein
 * Weg von dem im Buch abweicht, ist mein Weg falsch - nicht das Buch.
 */
import { describe, expect, it } from "vitest";
import {
  weg, wegAddition, wegDivision, wegLangeDivision, wegMultiplikation, wegSubtraktion,
  wegTeilprodukte, wegZehnerzahl, wegZerlegteDivision, wegZerlegung,
} from "../src/lib/plus/zeilenrechnen";

describe("Addition - Stanetty S. 10", () => {
  const w = wegAddition(348, 275);

  it("baut das Ergebnis von rechts nach links auf", () => {
    // So entsteht es auf der Zeile: erst die Einer, dann die Zehner.
    expect(w.schritte.map((s) => s.zeile)).toEqual([
      "348 +275 =3",
      "348 +275 =23",
      "348 +275 =623",
    ]);
    expect(w.ergebnis).toBe("623");
  });

  it("spricht den Weg so wie das Buch", () => {
    // „Jetzt addiere ich die Einer: 5 plus 8 ist 13, 3 an, 1 weiter"
    expect(w.schritte[0].satz).toBe("Ich addiere die Einer: 5 plus 8 ist 13, 3 an, 1 weiter");
    // „Ich addiere die Zehner: 1 plus 7 ist 8, 8 plus 4 ist 12, 2 an, 1 weiter"
    expect(w.schritte[1].satz).toBe("Ich addiere die Zehner: 1 von vorher und 7 ist 8, 8 plus 4 ist 12, 2 an, 1 weiter");
  });

  it("★ trägt den Übertrag mit - er wird nicht notiert, sondern behalten", () => {
    expect(w.schritte[0].merke).toBe(1);
    expect(w.schritte[2].merke).toBe(0);
  });

  it("kommt auch mit verschieden langen Zahlen zurecht", () => {
    const k = wegAddition(458, 98);
    expect(k.ergebnis).toBe("556");
    expect(k.schritte[k.schritte.length - 1].zeile).toBe("458 +98 =556");
  });

  it("hängt den letzten Übertrag an", () => {
    const k = wegAddition(95, 87);
    expect(k.ergebnis).toBe("182");
    expect(k.schritte[k.schritte.length - 1].zeile).toBe("95 +87 =182");
  });
});

describe("Subtraktion - Stanetty S. 15 und S. 16", () => {
  it("ergänzt, wie es in Österreich unterrichtet wird", () => {
    // „Ich beginne mit den Einern. 8 und wie viel ist 14, 8 und 6 ist 14,
    //  6 an, 1 weiter"
    const w = wegSubtraktion(14, 8, "ergaenzen");
    expect(w.schritte[0].satz).toBe(
      "Ich beginne mit den Einern. 8 und wie viel ist 14, 8 und 6 ist 14, 6 an, 1 weiter",
    );
    expect(w.ergebnis).toBe("6");
  });

  it("rechnet 48 -16 in zwei Schritten", () => {
    // „6 und wie viel ist 8. 6 und 2 ist 8. 2 an, 0 weiter"
    const w = wegSubtraktion(48, 16, "ergaenzen");
    expect(w.schritte[0].satz).toContain("6 und wie viel ist 8, 6 und 2 ist 8, 2 an, 0 weiter");
    expect(w.schritte[1].zeile).toBe("48 -16 =32");
    expect(w.ergebnis).toBe("32");
  });

  it("★ kann auch abziehen - und mischt die beiden Wege nie", () => {
    // Das Vermischen ist ein belegtes Fehlermuster. Der Weg gilt für die
    // ganze Aufgabe, nicht für eine Stelle.
    const w = wegSubtraktion(503, 8, "abziehen");
    expect(w.ergebnis).toBe("495");
    for (const s of w.schritte) {
      expect(s.satz, s.satz).not.toContain("und wie viel");
    }
    expect(w.schritte[0].satz).toContain("borge");
  });

  it("ergänzt bei derselben Aufgabe ohne zu borgen", () => {
    const w = wegSubtraktion(503, 8, "ergaenzen");
    expect(w.ergebnis).toBe("495");
    for (const s of w.schritte) expect(s.satz, s.satz).not.toContain("borge");
  });
});

describe("★ Division - die Zeilen mit H, Z und E", () => {
  it("baut das Beispiel aus der didaktisch-methodischen Struktur nach", () => {
    const w = wegDivision(474, 3);
    expect(w.schritte.map((s) => s.zeile)).toEqual([
      "4 H /3 =1 H Rest: 1 H",
      "17 Z /3 =5 Z Rest: 2 Z",
      "24 E /3 =8 E",
    ]);
    expect(w.ergebnis).toBe("158");
  });

  it("★ nennt den Rest in der Schreibweise der App", () => {
    // Überall sonst schreibt Plus `158 (1 Rest)`. Wer hier anders schreibt,
    // wertet ein richtig rechnendes Kind falsch.
    const w = wegDivision(475, 3);
    expect(w.ergebnis).toBe("158 (1 Rest)");
    expect(w.auchRichtig).toContain("158 Rest 1");
    // ★★★ Der Quotient ALLEIN ist die halbe Antwort (25.09.2026). Bis dahin
    // stand „158" hier - ein Häkchen für ein Kind, das den Rest vergisst.
    expect(w.auchRichtig).not.toContain("158");
  });

  it("schreibt die Stellenwerte aus - das ist der ganze Sinn", () => {
    const w = wegDivision(6396, 4);
    expect(w.schritte[0].zeile).toContain(" T /4 =");
    expect(w.schritte[1].zeile).toContain(" H /4 =");
    expect(w.schritte[3].zeile).toContain(" E /4 =");
  });
});

describe("Multiplikation - Stanetty S. 28 und S. 29", () => {
  it("rechnet zweistellig mal einstellig Stelle für Stelle", () => {
    // „Ich multipliziere 4 zuerst mit den Einern. 4 mal 6 ist 24. 4 an,
    //  2 weiter" - der Multiplikator steht vorn.
    const w = wegMultiplikation(16, 4);
    expect(w.ergebnis).toBe("64");
    expect(w.schritte[0].satz).toBe("Ich multipliziere 4 mit den Einern. 4 mal 6 ist 24, 4 an, 2 weiter");
    expect(w.schritte[1].satz).toContain("4 mal 1 ist 4 und 2 von vorhin ist 6");
    expect(w.schritte[0].zeile).toBe("16 *4 =4");
  });

  it("★ zerlegt einstellig mal zweistellig - so steht es im Buch", () => {
    // `4 *16 =4 *10 +4 *6 =40 +24 =64`
    const w = wegZerlegung(4, 16)!;
    expect(w.schritte.map((s) => s.zeile)).toEqual([
      "4 *16 =4 *10 +4 *6 =",
      "4 *16 =4 *10 +4 *6 =40 +24 =",
      "4 *16 =4 *10 +4 *6 =40 +24 =64",
    ]);
    expect(w.ergebnis).toBe("64");
    expect(w.schritte[0].satz).toBe("16 ist 10 und 6. Ich rechne zuerst 4 mal 10, dann 4 mal 6");
  });

  it("zerlegt nicht, wo es nichts zu zerlegen gibt", () => {
    expect(wegZerlegung(4, 20)).toBeNull();   // keine Einer
    expect(wegZerlegung(14, 16)).toBeNull();  // vorn nicht einstellig
  });

  it("nimmt je nach Stellung den Weg des Buches", () => {
    expect(weg(4, "mal", 16)?.schritte[0].zeile).toBe("4 *16 =4 *10 +4 *6 =");
    expect(weg(16, "mal", 4)?.schritte[0].zeile).toBe("16 *4 =4");
  });
});

describe("Der Weg zur Rechenart", () => {
  it.each([
    ["plus", 48, 27, "75"],
    ["minus", 48, 27, "21"],
    ["mal", 48, 7, "336"],
    ["mal", 4, 16, "64"],
    ["geteilt", 474, 3, "158"],
    ["mal", 645, 20, "12900"],
  ] as const)("%s: %s und %s ergibt %s", (op, a, b, erg) => {
    expect(weg(a, op, b)?.ergebnis).toBe(erg);
  });

  it("gibt nichts zurück, wo Plus keinen Weg kennt", () => {
    // Ein Minus ins Negative und eine Division durch eine dreistellige Zahl
    // haben in den Büchern keinen Zeilenweg. Lieber nichts als ein erfundener.
    // (Durch eine ZWEIstellige Zahl steht er seit 23.09. bei Stanetty S. 48.)
    expect(weg(8, "minus", 48)).toBeNull();
    expect(weg(4740, "geteilt", 123)).toBeNull();
    expect(weg(3, "bruch", 4)).toBeNull();
    expect(weg(19.5, "geteilt", 3)).toBeNull();
  });
});

describe("Jeder Weg führt zum Ergebnis - über viele Zahlen gemessen", () => {
  it("Addition, Subtraktion, Multiplikation und Division stimmen", () => {
    for (let a = 12; a < 900; a += 7) {
      for (const b of [3, 8, 27, 156]) {
        expect(wegAddition(a, b).ergebnis, `${a} +${b}`).toBe(String(a + b));
        if (a >= b) expect(wegSubtraktion(a, b, "ergaenzen").ergebnis, `${a} -${b}`).toBe(String(a - b));
        if (a >= b) expect(wegSubtraktion(a, b, "abziehen").ergebnis, `${a} -${b} abziehen`).toBe(String(a - b));
      }
      for (const b of [2, 3, 7, 9]) {
        expect(wegMultiplikation(a, b).ergebnis, `${a} *${b}`).toBe(String(a * b));
        const d = wegDivision(a, b);
        const soll = a % b === 0 ? String(a / b) : `${Math.floor(a / b)} (${a % b} Rest)`;
        expect(d.ergebnis, `${a} /${b}`).toBe(soll);
      }
    }
  });

  it("jede Zeile bleibt unter 40 Zeichen", () => {
    for (let a = 100; a < 999; a += 37) {
      for (const b of [3, 7, 128]) {
        for (const s of [...wegAddition(a, b).schritte, ...wegSubtraktion(a, Math.min(b, a), "ergaenzen").schritte]) {
          expect(s.zeile.length, s.zeile).toBeLessThanOrEqual(40);
        }
      }
    }
  });
});

describe("Mal einer Zehnerzahl - Stanetty S. 32", () => {
  it("zerlegt in: mal die Einerziffer, dann mal zehn", () => {
    const w = wegZehnerzahl(645, 20)!;
    expect(w.schritte.map((s) => s.zeile)).toEqual([
      "645 *20 =645 *2 *10 =",
      "645 *20 =645 *2 *10 =1290 *10 =",
      "645 *20 =645 *2 *10 =1290 *10 =12900",
    ]);
    expect(w.ergebnis).toBe("12900");
  });

  it("nimmt diesen Weg, wo er passt", () => {
    expect(weg(645, "mal", 20)?.ergebnis).toBe("12900");
    expect(wegZehnerzahl(645, 23)).toBeNull();
  });
});

describe("Geteilt durch eine zweistellige Zahl - Stanetty S. 42", () => {
  it("zerlegt den Divisor und teilt zweimal", () => {
    // `140 /20 =140 /2 /10 =70 /10 =7`
    const w = wegZerlegteDivision(140, 20)!;
    expect(w.schritte.map((s) => s.zeile)).toEqual([
      "140 /20 =140 /2 /10 =",
      "140 /20 =140 /2 /10 =70 /10 =",
      "140 /20 =140 /2 /10 =70 /10 =7",
    ]);
    expect(w.ergebnis).toBe("7");
    expect(w.schritte[0].satz).toBe("20 ist 2 mal 10. Ich teile zuerst durch 2, dann durch 10");
  });

  it("rechnet auch 330 durch 30", () => {
    expect(wegZerlegteDivision(330, 30)?.ergebnis).toBe("11");
  });

  it("★ sagt ab, wo ein Zwischenergebnis krumm würde", () => {
    // Ein Weg, dem ein Kind folgt und trotzdem nicht ankommt, ist keiner.
    expect(wegZerlegteDivision(140, 21)).toBeNull();   // geht nicht auf
    expect(wegZerlegteDivision(140, 7)).toBeNull();    // einstellig, anderer Weg
  });

  it("wird vom Weg-Finder genommen", () => {
    expect(weg(140, "geteilt", 20)?.ergebnis).toBe("7");
    expect(weg(4500, "geteilt", 90)?.ergebnis).toBe("50");
  });

  it("jedes Zwischenergebnis ist eine ganze Zahl", () => {
    for (let b = 10; b <= 99; b++) {
      for (const vielfaches of [3, 7, 12]) {
        const w = wegZerlegteDivision(b * vielfaches, b);
        if (!w) continue;
        for (const s of w.schritte) {
          expect(s.zeile, s.zeile).not.toMatch(/[,.]\d/);
        }
      }
    }
  });
});

describe("Stellenwerte über die Tausender hinaus", () => {
  it("★ nennt die Zehntausender beim Namen, nicht „Stelle 5\"", () => {
    // Gemessen am 23.09.2026 an Paket 4-05: `313910 +2365`.
    const saetze = wegAddition(313910, 2365).schritte.map((s) => s.satz).join(" ");
    expect(saetze).toContain("Zehntausender");
    expect(saetze).toContain("Hunderttausender");
    expect(saetze).not.toMatch(/Stelle \d/);
  });

  it("★ die Division durch eine einstellige Zahl nennt fünf Stellen richtig", () => {
    const w = wegDivision(47412, 3);
    expect(w.schritte[0].zeile).toBe("4 ZT /3 =1 ZT Rest: 1 ZT");
    expect(w.schritte.at(-1)!.zeile).toBe("12 E /3 =4 E");
    expect(w.ergebnis).toBe("15804");
  });
});

describe("Mal einer zweistelligen Zahl - Stanetty S. 33", () => {
  it("zerlegt in Zehner und Einer und zählt die Teilprodukte zusammen", () => {
    // Das Buch: `645 *21 =645 *20 +645 *1 =12900 +00645 =13545`.
    const w = wegTeilprodukte(645, 21)!;
    expect(w.schritte.map((s) => s.zeile)).toEqual([
      "645 *21 =645 *20 +645 *1 =",
      "645 *21 =12900 +645 =",
      "645 *21 =12900 +645 =13545",
    ]);
    expect(w.ergebnis).toBe("13545");
  });

  it("rechnet das zweite Beispiel des Buchs: 645 *28 =12900 +5160 =18060", () => {
    expect(wegTeilprodukte(645, 28)!.schritte.at(-1)!.zeile).toBe("645 *28 =12900 +5160 =18060");
  });

  it("überlässt Zehnerzahlen und einstellige Faktoren den anderen Wegen", () => {
    expect(wegTeilprodukte(645, 20)).toBeNull();
    expect(wegTeilprodukte(645, 7)).toBeNull();
    expect(wegTeilprodukte(6, 45)).toBeNull();
    expect(weg(645, "mal", 20)?.schritte[0].zeile).toBe("645 *20 =645 *2 *10 =");
  });

  it("mal 10 ist ein Schritt: 645 *10 =6450 (S. 32)", () => {
    expect(weg(645, "mal", 10)?.schritte.map((s) => s.zeile)).toEqual(["645 *10 =6450"]);
  });

  it("wird vom Weg-Finder genommen - Paket 4-07, vierstellig mal zweistellig", () => {
    expect(weg(4890, "mal", 57)?.ergebnis).toBe("278730");
  });

  it("★ keine Zeile über 40 Zeichen, auch bei 9999 *99", () => {
    for (const a of [1000, 4890, 9999]) {
      for (const b of [11, 57, 99]) {
        for (const s of wegTeilprodukte(a, b)!.schritte) {
          expect(s.zeile.length, s.zeile).toBeLessThanOrEqual(40);
        }
        expect(wegTeilprodukte(a, b)!.ergebnis).toBe(String(a * b));
      }
    }
  });
});

describe("Geteilt durch eine zweistellige Zahl ohne Zerlegung - Stanetty S. 48 bis 51", () => {
  it("schreibt die Zeilen wie im Buch: 34789 /56", () => {
    // Das Buch, S. 51: `347 89 /56 =6(H) nr: 347 -336 =11` usw.
    const w = wegLangeDivision(34789, 56)!;
    expect(w.schritte.map((s) => s.zeile)).toEqual([
      "347 89 /56 =6 (H) nr: 347 -336 =11",
      "118 9 /56 =2 (Z) nr: 118 -112 =6",
      "69 /56 =1 (E) nr: 69 -56 =13",
      "34789 /56 =621 (13 Rest)",
    ]);
    expect(w.ergebnis).toBe("621 (13 Rest)");
    expect(w.auchRichtig).toContain("621 Rest 13");
  });

  it("rechnet das Buchbeispiel 6478 /41 =158 ohne Rest", () => {
    const w = wegLangeDivision(6478, 41)!;
    expect(w.schritte[0].zeile).toBe("64 78 /41 =1 (H) nr: 64 -41 =23");
    expect(w.ergebnis).toBe("158");
    expect(w.schritte.at(-1)!.satz).toBe("Es bleibt kein Rest");
  });

  it("spricht wie das Buch, S. 49: 921 /21", () => {
    const w = wegLangeDivision(921, 21)!;
    expect(w.schritte[0].satz).toBe(
      "92 geteilt durch 21 ist 4, das werden meine Zehner. 4 mal 21 ist 84, 84 und wie viel ist 92, 84 und 8 ist 92",
    );
    expect(w.schritte[1].satz).toMatch(/^Die nächste Stelle ist 1, es ergibt sich die Zahl 81\. 81 geteilt durch 21 ist 3/);
    expect(w.schritte.at(-1)!.satz).toBe("18 ist mein Rest");
    expect(w.ergebnis).toBe("43 (18 Rest)");
  });

  it("★ die Null im Ergebnis bekommt ihre eigene Zeile", () => {
    // 128 /12 =10 (8 Rest) - das Buchbeispiel S. 48.
    const w = wegLangeDivision(128, 12)!;
    expect(w.schritte[1].zeile).toBe("8 /12 =0 (E) nr: 8 -0 =8");
    expect(w.ergebnis).toBe("10 (8 Rest)");
  });

  it("stimmt für viele Zahlen, und keine Zeile ist über 40 Zeichen", () => {
    for (let a = 1000; a <= 79999; a += 997) {
      for (const b of [11, 14, 37, 56, 99]) {
        const w = wegLangeDivision(a, b)!;
        const soll = a % b === 0 ? String(a / b) : `${Math.floor(a / b)} (${a % b} Rest)`;
        expect(w.ergebnis, `${a} /${b}`).toBe(soll);
        const ziffern = w.schritte.slice(0, -1).map((s) => s.zeile.match(/=(\d) \(/)![1]).join("");
        expect(Number(ziffern), `${a} /${b}`).toBe(Math.floor(a / b));
        for (const s of w.schritte) expect(s.zeile.length, s.zeile).toBeLessThanOrEqual(40);
      }
    }
  });

  it("wird vom Weg-Finder genommen, wo die Zerlegung nicht aufgeht", () => {
    expect(weg(37045, "geteilt", 14)?.ergebnis).toBe("2646 (1 Rest)");
    expect(weg(140, "geteilt", 20)?.schritte[0].zeile).toBe("140 /20 =140 /2 /10 =");
  });
});
