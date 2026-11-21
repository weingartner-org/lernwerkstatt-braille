/**
 * Wächter für die Marburger Mathematikschrift.
 *
 * Jeder Fall hier ist ein Beispiel AUS dem Regelwerk, mit seiner Fundstelle.
 * Nichts ist ausgedacht: wo das Regelwerk schweigt, schweigt auch der Test -
 * ein Kind, das auf der Braillezeile rechnet, hat keine zweite Quelle.
 *
 * Quelle: „Das System der Mathematikschrift in der Deutschen Brailleschrift",
 * BSKDL 2015. Die Zeilenangaben sind die der Arbeitsdatei; die ausführliche
 * Herleitung steht in „Marburger Mathematikschrift - Spezifikation.md".
 */
import { describe, expect, it } from "vitest";
import { leseMarburger, marburgerZuText, schreibeMarburger } from "../src/lib/plus/braille/marburger";

const lies = (b: string) => marburgerZuText(b);

describe("Zahlen - das Zahlzeichen ist ein Modus", () => {
  it.each([
    ["⠼⠉", "3", "Bsp. 2.1.1 B01, Z. 1130"],
    ["⠼⠃⠙⠑", "245", "Bsp. 2.1.1 B02, Z. 1135"],
    ["⠼⠃⠂⠉⠙", "2,34", "Kap. 2.1.3, Z. 1244"],
    ["⠼⠙⠑⠂⠊⠓", "45,98", "Z. 1249 - der Punkt der Vorlage wird zum Komma"],
  ])("%s ist %s (%s)", (braille, text) => {
    expect(lies(braille)).toBe(text);
  });

  it("schreibt lange Zahlen ohne Trennung - Plus kennt keine Tausenderpunkte", () => {
    // `⠄` zwischen Ziffern ist das Gliederungszeichen (Kap. 2.1.5, Z. 1342).
    expect(lies("⠼⠁⠄⠉⠃⠙⠄⠉⠙⠃")).toBe("1324342");
    expect(lies("⠼⠁⠄⠚⠚⠚")).toBe("1000");
  });

  it("liest ohne Zahlzeichen Buchstaben - das ist der ganze Unterschied", () => {
    expect(lies("⠼⠁⠚")).toBe("10");
    expect(lies("⠁⠚")).toBe("aj");
  });

  it("lässt das Leerzeichen den Zahlmodus beenden", () => {
    // `⠼⠁⠀⠚` ist eine Eins, ein Leerzeichen und der Buchstabe j.
    expect(lies("⠼⠁⠀⠚")).toBe("1 j");
  });

  it("braucht nach Ziffern eine Ankündigung für den Buchstaben", () => {
    // Bsp. 3.2 B01, Z. 1577: `10a` braucht `⠠`, `10k` nicht.
    expect(lies("⠼⠁⠚⠠⠁")).toBe("10a");
    expect(lies("⠼⠁⠚⠅")).toBe("10k");
  });

  it("schreibt nach einem einsamen Zahlzeichen am Ende nichts", () => {
    // Kap. 2.1.6, Anmerkung zu B07, Z. 1432: das `⠼` nach dem
    // Gleichheitszeichen ist die Leerstelle für das Ergebnis.
    expect(lies("⠼⠃⠀⠖⠼⠉⠀⠶⠼")).toBe("2 +3 =");
  });
});

describe("Rechenzeichen - Leerzeichen davor, keines danach", () => {
  it.each([
    ["⠼⠓⠀⠖⠼⠛⠀⠶⠼⠛⠀⠖⠼⠓", "8 +7 =7 +8", "Bsp. 5 B01, Z. 2699"],
    ["⠼⠁⠚⠀⠒⠼⠙⠀⠶⠼⠃⠂⠑", "10 /4 =2,5", "Bsp. 5 B07, Z. 2741"],
    ["⠼⠓⠄⠣⠤⠼⠛⠜⠀⠶⠤⠼⠑⠋", "8 *(-7) =-56", "Bsp. 5 B06, Z. 2734"],
  ])("%s wird zu %s (%s)", (braille, text) => {
    expect(lies(braille)).toBe(text);
  });

  it("setzt das Leerzeichen vor den Malpunkt, auch wenn es fehlt", () => {
    // Kap. 5, Z. 2676: „Das Leerzeichen vor dem Malpunkt wird oft weggelassen."
    // Beide Schreibweisen aus Bsp. 5 B03, Z. 2709-2713, ergeben dasselbe.
    expect(lies("⠼⠋⠉⠄⠼⠑⠀⠶⠼⠉⠁⠑")).toBe("63 *5 =315");
    expect(lies("⠼⠋⠉⠀⠄⠼⠑⠀⠶⠼⠉⠁⠑")).toBe("63 *5 =315");
  });

  it("hält Malpunkt und Gliederungspunkt auseinander", () => {
    // F4: `⠄` vor einem Zahlzeichen ist Mal, `⠄` zwischen Ziffern ist Gliederung.
    expect(lies("⠼⠉⠄⠼⠑")).toBe("3 *5");
    expect(lies("⠼⠉⠄⠑")).toBe("35");
  });

  it.each([
    ["⠼⠑⠀⠔⠶⠼⠉", "5 !=3"],
    ["⠼⠑⠀⠕⠶⠼⠉", "5 >=3"],
    ["⠼⠉⠀⠪⠶⠼⠑", "3 <=5"],
    ["⠼⠑⠀⠕⠂⠼⠉", "5 >3"],
    ["⠼⠉⠀⠪⠄⠼⠑", "3 <5"],
  ])("vergleicht: %s ist %s", (braille, text) => {
    expect(lies(braille)).toBe(text);
  });
});

describe("Brüche", () => {
  it.each([
    ["⠼⠁⠆", "1/2", "Bsp. 9.1 B01, Z. 3927"],
    ["⠼⠃⠛⠒⠖", "27/36", "Bsp. 9.1 B02, Z. 3939"],
    ["⠼⠉⠲⠀⠤⠼⠁⠒", "3/4 -1/3", "Bsp. 9.1 B03, Z. 3946"],
    ["⠁⠳⠃", "a/b", "Bsp. 9.2 B01, Z. 4010"],
    ["⠁⠳⠼⠃", "a/2", "Bsp. 9.2 B02, Z. 4021"],
    ["⠼⠁⠳⠭⠌⠒", "1/x^3", "Bsp. 9.2 B03, Z. 4028"],
  ])("%s ist %s (%s)", (braille, text) => {
    expect(lies(braille)).toBe(text);
  });

  it("rechnet die ganze Bruchzeile aus Bsp. 9.1 B03 durch", () => {
    expect(lies("⠼⠉⠲⠀⠤⠼⠁⠒⠀⠶⠼⠊⠂⠆⠀⠤⠼⠙⠂⠆⠀⠶⠼⠑⠂⠆"))
      .toBe("3/4 -1/3 =9/12 -4/12 =5/12");
  });

  it("★ liest die gemischte Zahl mit ihren ZWEI Zahlzeichen", () => {
    // F13, Bsp. 9.1 B06, Z. 3971. Wer das zweite `⠼` überliest, bekommt 41/4.
    expect(lies("⠼⠙⠼⠁⠲")).toBe("4 1/4");
    expect(lies("⠼⠁⠼⠉⠲⠀⠖⠼⠃⠼⠁⠒")).toBe("1 3/4 +2 1/3");
  });

  it("macht aus Bruchanfang und Bruchende Klammern", () => {
    expect(lies("⠆⠤⠁⠳⠃⠰")).toBe("(-a/b)");          // Bsp. 9.3 B01, Z. 4098
    expect(lies("⠆⠼⠁⠚⠳⠤⠼⠃⠰")).toBe("(10/-2)");      // Bsp. 9.1 B04, Z. 3954
  });

  it("schliesst mit dem Sammelzeichen alle offenen Brüche", () => {
    expect(lies("⠆⠆⠼⠁⠳⠥⠿⠰")).toBe("((1/u))");        // Kap. 9.4, Z. 4180
  });

  it("★ trennt Dezimalkomma und gesenkte Eins durch einen Blick nach vorn", () => {
    // F5: `⠼⠊⠂⠆` ist 9/12, `⠼⠃⠂⠉⠙` ist 2,34 - dasselbe `⠂`.
    expect(lies("⠼⠊⠂⠆")).toBe("9/12");
    expect(lies("⠼⠃⠂⠉⠙")).toBe("2,34");
  });

  it("meldet den fehlenden Zahlzeichen nach dem Bruchstrich, statt still zu bessern", () => {
    // F12, Kap. 9.3 Hinweis Z. 4085. `⠁⠳⠆` ist regelwidrig geschrieben.
    const l = leseMarburger("⠁⠳⠆");
    expect(l.text).toBe("a/2");
    expect(l.hinweise[0].text).toContain("Zahlzeichen");
  });

  it("lässt den Zusammenhaltepunkt den Bruchanfang erzwingen", () => {
    // F2, Bsp. 9.3 B06, Z. 4156: ohne `⠈` wäre `⠭⠆` ein x mit Nenner 2.
    expect(lies("⠭⠈⠆⠭⠀⠖⠼⠁⠀⠳⠀⠭⠌⠆⠀⠤⠼⠁⠰")).toBe("x(x +1 / x^2 -1)");
  });
});

describe("Potenzen und Indizes", () => {
  it.each([
    ["⠭⠌⠆", "x^2", "Bsp. 10.1 B01, Z. 4321"],
    ["⠭⠌⠆⠀⠖⠭⠌⠝", "x^2 +x^n", "Bsp. 10.1 B01, Z. 4321"],
    ["⠁⠌⠆⠃⠌⠒⠉", "a^2b^3c", "Bsp. 10.3.3 B01, Z. 4732"],
    ["⠁⠌⠆⠃⠌⠒⠉⠌⠲", "a^2b^3c^4", "Bsp. 10.1 B02, Z. 4327"],
    ["⠭⠌⠴", "x^0", "Bsp. 10.3.3 B04, Z. 4757"],
    ["⠍⠉⠌⠆", "mc^2", "Bsp. 1.1.2 B02, Z. 722"],
  ])("%s ist %s (%s)", (braille, text) => {
    expect(lies(braille)).toBe(text);
  });

  it("★ wartet nicht auf das Schlusszeichen - die gesenkte Zahl endet von selbst", () => {
    // F6, Kap. 10.1, Z. 4287. Buchstaben enden dagegen nicht von selbst.
    expect(lies("⠁⠌⠭⠱⠃⠌⠽⠱⠉⠌⠵")).toBe("a^xb^yc^z");  // Bsp. 10.1 B03, Z. 4333
  });

  it("nimmt das Minus mit in den Exponenten", () => {
    // Kap. 10.3.3, Z. 4717; Bsp. 10.3.3 B04, Z. 4757. Der Generator schreibt
    // die negative Hochzahl ohne Klammer (`10^-6`) - das ist der Maßstab.
    expect(lies("⠭⠌⠤⠂")).toBe("x^-1");
    expect(lies("⠼⠁⠚⠌⠤⠖")).toBe("10^-6");
  });

  it("schreibt Indizes mit dem Unterstrich", () => {
    expect(lies("⠁⠡⠂⠂⠁⠡⠆⠆")).toBe("a_11a_22");       // Bsp. 10.3.3 B02, Z. 4744
    expect(lies("⠋⠡⠝⠱⠣⠭⠜")).toBe("f_n(x)");          // Bsp. 10.3.1 B02, Z. 4475
  });

  it("verschachtelt mit dem Verstärkungszeichen", () => {
    // Bsp. 10.2 B02, Z. 4401: `n^(2^3) = n^8`.
    expect(lies("⠝⠨⠌⠆⠌⠒⠨⠱⠀⠶⠝⠌⠦")).toBe("n^(2^3) =n^8");
  });
});

describe("Wurzeln", () => {
  it.each([
    ["⠩⠼⠁", "'w(1)", "Bsp. 10.4 B01, Z. 4792"],
    ["⠩⠼⠃⠆", "'w(2/2)", "Bsp. 10.4 B01, Z. 4792"],
    ["⠩⠁⠈⠖⠃", "'w(a +b)", "Bsp. 10.4 B02, Z. 4798"],
    ["⠨⠩⠭⠌⠆⠨⠱⠀⠶⠭", "'w(x^2) =x", "Bsp. 10.2 B01, Z. 4388"],
  ])("%s ist %s (%s)", (braille, text) => {
    expect(lies(braille)).toBe(text);
  });

  it("★ unterscheidet verstärkte und einfache Wurzel - das sind zwei Terme", () => {
    // F7, Bsp. 10.2 B03, Z. 4411, mit ausdrücklicher Anmerkung im Regelwerk:
    // „Die erste Wurzel schliesst den Exponenten n mit ein, die zweite nicht."
    expect(lies("⠨⠩⠭⠌⠝⠨⠱")).toBe("'w(x^n)");
    expect(lies("⠩⠭⠌⠝")).toBe("'w(x)^n");
  });

  it("liest den Wurzelexponenten als vorderen oberen Index", () => {
    // Kap. 10.4, Z. 4783; Bsp. 10.4 B04, Z. 4811.
    expect(lies("⠌⠲⠩⠼⠃")).toBe("'w[4](2)");
    expect(lies("⠌⠒⠩⠼⠃⠛")).toBe("'w[3](27)");
  });

  it("baut die vierfach verschachtelte Wurzel aus Bsp. 10.2 B04", () => {
    // Z. 4418: vierte Wurzel aus b mal dritte Wurzel aus b² mal Wurzel aus b.
    expect(lies("⠌⠲⠨⠩⠃⠄⠌⠒⠐⠩⠃⠌⠆⠄⠩⠃⠿⠱")).toBe("'w[4](b *'w[3](b^2 *'w(b)))");
  });
});

describe("Einheiten und Prozent", () => {
  it.each([
    ["⠼⠃⠚⠸⠼⠚⠴", "20 %", "Bsp. 4.2 B01, Z. 2209"],
    ["⠼⠑⠁⠸⠅⠍", "51 km", "Bsp. 4.2 B01, Z. 2209"],
    ["⠼⠁⠃⠚⠸⠈⠴", "120 °", "Bsp. 4.3 B01, Z. 2235"],
  ])("%s ist %s (%s)", (braille, text) => {
    expect(lies(braille)).toBe(text);
  });

  it("hängt die Einheit an den Wert, schreibt sie aber mit Abstand", () => {
    // Bsp. 4.1 B01, Z. 2185. In Braille klebt sie am Wert, in der Zeile nicht.
    expect(lies("⠼⠚⠂⠉⠸⠇⠀⠶⠼⠉⠚⠚⠸⠍⠇")).toBe("0,3 l =300 ml");
  });

  it("★ liest das Zahlzeichen im Prozentzeichen NICHT als Zahlzeichen", () => {
    // F18: `⠸⠼⠚⠴` ist ein Zeichen aus vier Zellen, keine Null mit Kuller.
    const l = leseMarburger("⠼⠑⠚⠸⠼⠚⠴");
    expect(l.text).toBe("50 %");
    expect(l.hinweise).toHaveLength(0);
  });
});

describe("Buchstaben", () => {
  it.each([
    ["⠘⠁⠃⠉⠠⠙", "ABCd", "Bsp. 3.2 B03, Z. 1592"],
    ["⠨⠁⠃⠨⠉⠙", "AbCd", "Bsp. 3.2 B04, Z. 1597"],
    ["⠭", "x", "Bsp. 5 B02, Z. 2704"],
  ])("%s ist %s (%s)", (braille, text) => {
    expect(lies(braille)).toBe(text);
  });

  it("schützt den Kleinbuchstaben hinter dem Bruchende", () => {
    // F3, Bsp. 3.2 B06, Z. 1610: das `⠠` verhindert die Lesart „griechisch".
    expect(lies("⠆⠼⠁⠀⠖⠝⠀⠳⠀⠼⠑⠰⠠⠭")).toBe("(1 +n / 5)x");
  });
});

describe("Die Ränder", () => {
  it("verwirft die Schriftwechselzeichen, statt sie anzumeckern", () => {
    // Kap. 1.1.2, Bsp. B02, Z. 722. Im Rechenfeld ist der Modus ohnehin gesetzt.
    const l = leseMarburger("⠐⠂⠑⠀⠶⠍⠉⠌⠆⠠⠄");
    expect(l.text).toBe("e =mc^2");
    expect(l.hinweise).toHaveLength(0);
  });

  it("liest den Strich im Geldbetrag nicht als Minus", () => {
    // F20, Kap. 2.1.3, Z. 1233 und Bsp. B03-B04, Z. 1254-1259.
    expect(lies("⠼⠁⠚⠚⠂⠤")).toBe("100,-");
    expect(lies("⠼⠤⠂⠑⠚")).toBe("-,50");
  });

  it("meldet das gestrichene Divisionszeichen, liest es aber", () => {
    // Kap. 5, Hinweis Z. 2694. Altes Buch, neues Regelwerk.
    const l = leseMarburger("⠼⠓⠀⠲⠼⠃");
    expect(l.text).toBe("8 /2");
    expect(l.hinweise[0].text).toContain("Geteiltzeichen");
  });

  it("verschluckt kein unbekanntes Zeichen", () => {
    const l = leseMarburger("⠼⠉⠀⠿⠀⠼⠑");
    expect(l.text).toContain("?");
    expect(l.hinweise).toHaveLength(1);
  });

  it("gibt bei leerer Eingabe nichts zurück", () => {
    expect(leseMarburger("")).toEqual({ text: "", hinweise: [] });
  });
});

describe("Der Lesemodus fürs Rechenblatt", () => {
  // Anhang A1, Z. 5812: in Rechenaufstellungen darf das Zahlzeichen fehlen,
  // damit es nicht in den Ziffernspalten steht.
  it("liest Ziffern auch ohne Zahlzeichen", () => {
    expect(marburgerZuText("⠙⠓", "rechenblatt")).toBe("48");
    expect(marburgerZuText("⠙⠓", "streng")).toBe("dh");
  });

  it("hält den Zahlmodus über das Leerzeichen hinweg", () => {
    // Die Übertragszeile aus Bsp. A1.1 B01, Z. 5871, steht ohne Zahlzeichen.
    expect(marburgerZuText("⠁⠀⠁", "rechenblatt")).toBe("1 1");
  });
});

describe("Was jede erzeugte Aufgabe braucht", () => {
  it("liest die Schreibweise von Plus zurück, Zeichen für Zeichen", () => {
    // Die Probe aufs Ganze: die vier Grundrechnungsarten in der Form, in der
    // der Generator sie baut.
    expect(lies("⠼⠙⠓⠀⠖⠼⠃⠛⠀⠶⠼⠛⠑")).toBe("48 +27 =75");
    expect(lies("⠼⠁⠃⠀⠤⠼⠑⠀⠶⠼⠛")).toBe("12 -5 =7");
    expect(lies("⠼⠛⠄⠼⠓⠀⠶⠼⠑⠋")).toBe("7 *8 =56");
    expect(lies("⠼⠑⠋⠀⠒⠼⠓⠀⠶⠼⠛")).toBe("56 /8 =7");
  });

  it("bleibt ohne Hinweise, wo richtig geschrieben wurde", () => {
    for (const b of ["⠼⠙⠓⠀⠖⠼⠃⠛⠀⠶⠼⠛⠑", "⠼⠉⠲", "⠭⠌⠆", "⠩⠼⠊", "⠼⠃⠚⠸⠼⠚⠴"]) {
      expect(leseMarburger(b).hinweise, b).toHaveLength(0);
    }
  });
});

describe("★ Die Gegenprobe über alle Pakete", () => {
  /**
   * Der eigentliche Wächter. Jede Rechenzeile, die der Generator baut, wird in
   * Marburger Braille geschrieben und wieder gelesen. Kommt nicht dasselbe
   * heraus, bekäme ein Kind, das richtig tippt, eine falsche Rückmeldung.
   *
   * ★ Gemessen, nicht behauptet: die Zahl der schreibbaren Zeilen steht im
   * Test. Was der Schreiber ablehnt, lehnt er sichtbar ab - Wörter,
   * Platzhalter `[]` (für die gibt es laut Kap. 15.1 keine Norm),
   * Spaltentrenner und Aufzählungen mit Strichpunkt.
   */
  it("schreibt jede Rechenzeile und liest sie unverändert zurück", async () => {
    const { bedienbarePakete, erzeugeLauf } = await import("../src/lib/plus/generator");
    const zeilen = new Set<string>();
    for (const id of bedienbarePakete()) {
      for (const a of erzeugeLauf(id, { anzahl: 8, saat: 7 })) {
        for (const zeile of a.angabe.split("\n")) zeilen.add(zeile);
        if (a.loesung) for (const zeile of String(a.loesung).split("\n")) zeilen.add(zeile);
      }
    }

    let geprueft = 0;
    for (const zeile of zeilen) {
      const braille = schreibeMarburger(zeile);
      if (braille === null) continue;
      const lesung = leseMarburger(braille);
      expect(lesung.text, `${zeile} -> ${braille}`).toBe(zeile);
      expect(lesung.hinweise, zeile).toHaveLength(0);
      geprueft++;
    }
    expect(geprueft).toBeGreaterThan(1200);
  });

  it("★★★ die Wurzel der Bücher geht hin und zurück", () => {
    // Johannes, 23.09.2026, aus der Zeichenerklärung:
    // „'w()  Quadratwurzel aus ( ); 'w[n]()  n-te Wurzel aus ( )".
    // Dasselbe schreibt der eine andere App der Plattform  (§5). Das gerade Apostroph ist
    // U+0027 - auf der Braillezeile Punkt 6.
    for (const zeile of ["'w(9) =3", "'w[3](27) =3", "'w[4](16) =2", "2 *'w(3)", "'w(x^2) =x"]) {
      const braille = schreibeMarburger(zeile);
      expect(braille, zeile).not.toBeNull();
      expect(leseMarburger(braille!).text, `${zeile} -> ${braille}`).toBe(zeile);
    }
  });

  it("lehnt ab, was das Regelwerk nicht hergibt - und nur das", () => {
    expect(schreibeMarburger("6 +[] =10")).toBeNull();   // Kap. 15.1: keine Norm
    expect(schreibeMarburger("5000 | 5000")).toBeNull(); // Spalten sind Layout
    expect(schreibeMarburger("Welche Zahl kommt vor 3?")).toBeNull();
    expect(schreibeMarburger("3 : 7")).toBeNull();       // `⠒` heißt schon „durch"
    expect(schreibeMarburger("48 +27 =75")).toBe("⠼⠙⠓⠀⠖⠼⠃⠛⠀⠶⠼⠛⠑");
  });
});
