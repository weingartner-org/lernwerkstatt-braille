import { describe, it, expect } from "vitest";
import {
  CAPS_LETTER,
  CAPS_WORD,
  CAPS_WORD_END,
  NUMSIGN,
  cellDots,
  cellToUnicode,
  cellsEqual,
  cellsToFontString,
  cellsToFontString6,
  parseDots,
  textToCells,
  transcribe,
  matchContraction,
  cellsToUnicode,
  hasGroupVoll,
} from "../src/lib/braille";

/** Hilfsfunktion: Punkt-Strings → Zellfolge, wie die Engine sie liefern soll. */
const seq = (...dotStrings: string[]) => dotStrings.map(parseDots);

describe("Zelle / Punkte", () => {
  it("parst liblouis-Punktnotation und zurück", () => {
    expect(cellDots(parseDots("1456"))).toEqual([1, 4, 5, 6]);
    expect(cellDots(parseDots("0"))).toEqual([]);
    expect(parseDots("245")).toBe(parseDots("245"));
  });

  it("rendert Zellen als Unicode-Braille (Bit-Konvention wie U+2800)", () => {
    expect(cellToUnicode(parseDots("1"))).toBe("⠁");
    expect(cellToUnicode(parseDots("12"))).toBe("⠃");
    expect(cellToUnicode(parseDots("123456"))).toBe("⠿");
    expect(cellToUnicode(0)).toBe("⠀");
  });

  it("vergleicht Zellfolgen", () => {
    expect(cellsEqual(seq("1", "12"), seq("1", "12"))).toBe(true);
    expect(cellsEqual(seq("1"), seq("1", "12"))).toBe(false);
  });
});

describe("Basisschrift: Buchstaben & Umlaute", () => {
  it("Grundalphabet", () => {
    expect(textToCells("abc")).toEqual(seq("1", "12", "14"));
    expect(textToCells("xyz")).toEqual(seq("1346", "13456", "1356"));
    expect(textToCells("w")).toEqual(seq("2456"));
  });

  it("Umlaute und ß", () => {
    expect(textToCells("äöüß")).toEqual(seq("345", "246", "1256", "2346"));
  });

  it("kündigt Großbuchstaben mit Punkten 4,6 an", () => {
    expect(textToCells("Haus")).toEqual(seq("46", "125", "1", "136", "234"));
    const u = transcribe("H");
    expect(u[0].cells).toEqual([CAPS_LETTER, parseDots("125")]);
    expect(u[0].kind).toBe("letter");
  });
});

describe("Basisschrift: Zahlen", () => {
  it("stellt das Zahlzeichen 3456 voran, Ziffern aus a–j", () => {
    expect(textToCells("1")).toEqual([NUMSIGN, parseDots("1")]);
    expect(textToCells("10")).toEqual(seq("3456", "1", "245")); // 1,0 → a,j
    expect(textToCells("2468")).toEqual(seq("3456", "12", "145", "124", "125"));
  });

  it("Dezimalkomma und Tausenderpunkt bleiben im Zahlenmodus", () => {
    expect(textToCells("3,14")).toEqual(seq("3456", "14", "2", "1", "145"));
    expect(textToCells("1.000")).toEqual(seq("3456", "1", "3", "245", "245", "245"));
  });
});

describe("Basisschrift: Satz- und Rechenzeichen", () => {
  it("Satzzeichen", () => {
    expect(textToCells(".")).toEqual(seq("3"));
    expect(textToCells(",")).toEqual(seq("2"));
    expect(textToCells("?")).toEqual(seq("26"));
    expect(textToCells("!")).toEqual(seq("235"));
    expect(textToCells("(a)")).toEqual(seq("236", "1", "356"));
  });

  it("Rechenzeichen: + − × =", () => {
    // 5 + 3 = 8  (jede Zahl mit eigenem Zahlzeichen, Operator als eigene Zelle)
    expect(textToCells("5+3=8")).toEqual(
      seq("3456", "15", "235", "3456", "14", "2356", "3456", "125"),
    );
    expect(textToCells("8−3")).toEqual(seq("3456", "125", "36", "3456", "14"));
    expect(textToCells("4×2")).toEqual(seq("3456", "145", "236", "3456", "12"));
  });
});

describe("Vollschrift: Lautgruppen", () => {
  it("ersetzt au, eu, ei, ie, ch, sch, st, äu durch eine Zelle", () => {
    expect(textToCells("auch", { system: "voll" })).toEqual(seq("16", "1456"));
    expect(textToCells("euch", { system: "voll" })).toEqual(seq("126", "1456"));
    expect(textToCells("schön", { system: "voll" })).toEqual(
      seq("156", "246", "1345"),
    );
    expect(textToCells("ist", { system: "voll" })).toEqual(seq("24", "23456"));
    expect(textToCells("die", { system: "voll" })).toEqual(seq("145", "346"));
    expect(textToCells("Bäume", { system: "voll" })).toEqual(
      seq("46", "12", "34", "134", "15"),
    );
  });

  it("greift längste Gruppe zuerst (sch vor ch)", () => {
    const u = transcribe("Schule", { system: "voll" });
    expect(u[0].text).toBe("Sch");
    expect(u[0].cells).toEqual([CAPS_LETTER, parseDots("156")]);
  });

  it("Basisschrift bleibt davon unberührt", () => {
    expect(textToCells("auch", { system: "basis" })).toEqual(
      seq("1", "136", "14", "125"),
    );
  });
});

describe("Render-Brücke (HBS-Eurobraille-Anzeige)", () => {
  it("bildet Zellen auf Anzeige-Zeichen ab", () => {
    expect(cellsToFontString6(textToCells("abc"))).toBe("abc");
    expect(cellsToFontString6([NUMSIGN])).toBe("#");
    // „12" = Zahlzeichen + a + b  →  #ab in der HBS-Schrift
    expect(cellsToFontString6(textToCells("12"))).toBe("#ab");
    // „Haus" = Großschreibz.(46→$) + haus
    expect(cellsToFontString6(textToCells("Haus"))).toBe("$haus");
  });

  it("leere Zelle wird zum Leerzeichen", () => {
    expect(cellsToFontString6(textToCells("a b"))).toBe("a b");
  });
});

describe("Computerbraille (8 Punkt)", () => {
  const comp = (t: string) => textToCells(t, { system: "computer" });

  it("jedes Zeichen genau eine Zelle, Großbuchstabe = + Punkt 7", () => {
    expect(comp("a")).toEqual(seq("1"));
    expect(comp("A")).toEqual(seq("17"));
    expect(comp("Haus")).toEqual(seq("1257", "1", "136", "234"));
  });

  it("Ziffern ohne Zahlzeichen (Punkte + 6)", () => {
    expect(comp("1")).toEqual(seq("16"));
    expect(comp("12")).toEqual(seq("16", "126"));
    expect(comp("5+3")).toEqual(seq("156", "235", "146"));
  });

  it("Umlaute mit Punkt 8", () => {
    expect(comp("ä")).toEqual(seq("3458"));
    expect(comp("ü")).toEqual(seq("12568"));
  });

  it("Render in der HBS-8-Punkt-Schrift", () => {
    expect(cellsToFontString(comp("A"), true)).toBe("A");
    expect(cellsToFontString(comp("1"), true)).toBe("1");
    expect(cellsToFontString(comp("ab"), true)).toBe("ab");
  });
});

describe("Robustheit", () => {
  it("unbekannte Zeichen erzeugen keine Zelle, brechen aber nicht ab", () => {
    const u = transcribe("a😀b");
    expect(u.map((x) => x.kind)).toEqual(["letter", "unknown", "letter"]);
    expect(textToCells("a😀b")).toEqual(seq("1", "12"));
  });
});

// ---------------------------------------------------------------------------
// P2 — Lautgruppen und ihre Grenzen
//
// ★ Umbau 20.09.2026 (Johannes fand „Linie" mit ie-Kürzung): Die Vollschrift
// kürzt eine Lautgruppe nur, wenn die Buchstaben lautlich bzw. als
// Wortbestandteil zusammengehören. Wo das nicht gilt, steht die Stelle in
// src/lib/braille/generated/voll-ausnahmen.generated.json — GEMESSEN an
// liblouis de-g1, nicht von Hand aufgestellt (npm run voll:ausnahmen).
// `matchContraction` selbst ist seitdem rein mechanisch (längster Treffer).
//
// Die frühere Pauschalsperre für „schen" war falsch: sie machte aus waschen,
// naschen, zwischen, frischen, klatschen und rauschen w·a·s·c·h·e·n statt
// w·a·sch·e·n (alle acht am 20.09. gegen liblouis gemessen).
// ---------------------------------------------------------------------------

describe("matchContraction — längster Treffer, rein mechanisch", () => {
  it("sch-Kürzung", () => {
    const m = matchContraction("schön");
    expect(m?.seq).toBe("sch");
    expect(m?.cell).toBe(parseDots("156"));
  });

  it("sch VOR ch (Längste-zuerst-Regel)", () => {
    const m = matchContraction("schule");
    expect(m?.seq).toBe("sch");
  });

  it("ch", () => {
    expect(matchContraction("chen")?.seq).toBe("ch");
  });

  it("au", () => {
    expect(matchContraction("auch")?.seq).toBe("au");
  });

  it("äu", () => {
    expect(matchContraction("äusch")?.seq).toBe("äu");
  });

  it("null für Sequenz ohne Lautgruppe", () => {
    expect(matchContraction("abcde")).toBeNull();
  });
});

describe("P2 — Vollschrift: wo NICHT gekürzt wird (gemessen an liblouis de-g1)", () => {
  /** Zellen eines Wortes ohne die Großschreib-Ankündigung. */
  const zellen = (wort: string) =>
    transcribe(wort, { system: "voll" }).flatMap((x) => x.cells);

  it("Linie: l·i·n·i·e — keine ie-Kürzung über die Silbengrenze", () => {
    expect(zellen("Linie")).not.toContain(parseDots("346")); // kein ie
  });

  it("Familie, Ferien, Studie: ebenfalls ohne ie-Kürzung", () => {
    for (const wort of ["Familie", "Ferien", "Studie"]) {
      expect(zellen(wort)).not.toContain(parseDots("346"));
    }
  });

  it("Liebe, Biene, Knie: ie wird gekürzt (langes i)", () => {
    for (const wort of ["Liebe", "Biene", "Knie"]) {
      expect(zellen(wort)).toContain(parseDots("346"));
    }
  });

  it("Geburtstag, Haustür, Dienstag: kein st über die Wortbestandteilsgrenze", () => {
    for (const wort of ["Geburtstag", "Haustür", "Dienstag"]) {
      expect(zellen(wort)).not.toContain(parseDots("23456")); // kein st
    }
  });

  it("Stern, Fenster, Liste: st wird gekürzt", () => {
    for (const wort of ["Stern", "Fenster", "Liste"]) {
      expect(zellen(wort)).toContain(parseDots("23456"));
    }
  });

  it("Museum, Jubiläum: kein eu/äu über die Silbengrenze", () => {
    expect(zellen("Museum")).not.toContain(parseDots("126")); // kein eu
    expect(zellen("Jubiläum")).not.toContain(parseDots("34")); // kein äu
  });

  it("Häuschen, Mäuschen, bisschen: äu bleibt, sch wird NICHT gekürzt, ch schon", () => {
    for (const wort of ["Häuschen", "Mäuschen"]) {
      const c = zellen(wort);
      expect(c).toContain(parseDots("34")); // äu
      expect(c).not.toContain(parseDots("156")); // kein sch
      expect(c).toContain(parseDots("1456")); // ch schon
    }
    const b = zellen("bisschen");
    expect(b).not.toContain(parseDots("156"));
    expect(b).toContain(parseDots("1456"));
  });

  it("waschen, naschen, zwischen, frischen: sch WIRD gekürzt", () => {
    for (const wort of ["waschen", "naschen", "zwischen", "frischen"]) {
      expect(zellen(wort)).toContain(parseDots("156"));
    }
  });
});

describe("P2 — Vollschrift-Transkription", () => {
  it("Geschichte: sch UND ch — g,e,sch,i,ch,t,e", () => {
    const u = transcribe("Geschichte", { system: "voll" });
    const cells = u.flatMap((x) => x.cells);
    expect(cells).toContain(parseDots("156")); // sch ✓
    expect(cells).toContain(parseDots("1456")); // ch ✓
  });

  it("Tischchen: sch (Tisch) UND ch (chen) — beide kontrahieren", () => {
    const u = transcribe("Tischchen", { system: "voll" });
    const cells = u.flatMap((x) => x.cells);
    expect(cells).toContain(parseDots("156")); // sch (Tisch)
    expect(cells).toContain(parseDots("1456")); // ch (chen)
  });

  it("Bestands-Tests bleiben grün: auch, euch, schön, ist, die, Bäume", () => {
    expect(textToCells("auch", { system: "voll" })).toEqual(seq("16", "1456"));
    expect(textToCells("euch", { system: "voll" })).toEqual(seq("126", "1456"));
    expect(textToCells("schön", { system: "voll" })).toEqual(seq("156", "246", "1345"));
    expect(textToCells("ist", { system: "voll" })).toEqual(seq("24", "23456"));
    expect(textToCells("die", { system: "voll" })).toEqual(seq("145", "346"));
    expect(textToCells("Bäume", { system: "voll" })).toEqual(seq("46", "12", "34", "134", "15"));
  });
});

// ---------------------------------------------------------------------------
// P2 — CAPS_WORD (Großbuchstabenfolge ≥ 2)
// ---------------------------------------------------------------------------

describe("P2 — CAPS_WORD: Großbuchstabenfolge", () => {
  it("Einzelner Großbuchstabe → CAPS_LETTER (unverändert)", () => {
    const u = transcribe("H");
    expect(u[0].cells).toEqual([CAPS_LETTER, parseDots("125")]);
  });

  it("'Haus' → CAPS_LETTER + h + au + s (Einzelbuchstabe, Voll-Lautgruppe)", () => {
    expect(textToCells("Haus", { system: "voll" })).toEqual(
      seq("46", "125", "16", "234"),
    );
  });

  it("'USB' (3 Großbuchstaben) → CAPS_WORD + u + s + b", () => {
    expect(textToCells("USB")).toEqual([
      CAPS_WORD,
      parseDots("136"), // u
      parseDots("234"), // s
      parseDots("12"),  // b
    ]);
  });

  it("'ABC' (3 Großbuchstaben) → CAPS_WORD + a + b + c", () => {
    expect(textToCells("ABC")).toEqual([
      CAPS_WORD,
      parseDots("1"),   // a
      parseDots("12"),  // b
      parseDots("14"),  // c
    ]);
  });

  it("'AB' (2 Großbuchstaben) → CAPS_WORD (Grenzfall)", () => {
    const cells = textToCells("AB");
    expect(cells[0]).toBe(CAPS_WORD);
    expect(cells).not.toContain(CAPS_LETTER);
  });

  it("'USBstick' → CAPS_WORD, u, s, b, CAPS_WORD_END, s, t, i, c, k", () => {
    const units = transcribe("USBstick");
    const allCells = units.flatMap((u) => u.cells);
    expect(allCells[0]).toBe(CAPS_WORD);
    expect(allCells).toContain(CAPS_WORD_END);
    // CAPS_WORD_END kommt nach 'B', vor 's'
    const endIdx = allCells.indexOf(CAPS_WORD_END);
    expect(endIdx).toBeGreaterThan(0);
  });

  it("CAPS_WORD vor Leerzeichen beendet OHNE CAPS_WORD_END", () => {
    const units = transcribe("USB test");
    const allCells = units.flatMap((u) => u.cells);
    expect(allCells[0]).toBe(CAPS_WORD);
    // Kein CAPS_WORD_END vor dem Leerzeichen
    expect(allCells).not.toContain(CAPS_WORD_END);
  });
});

// ---------------------------------------------------------------------------
// P2 — hasGroupVoll
// ---------------------------------------------------------------------------

describe("hasGroupVoll", () => {
  it("'mein' enthält 'ei'", () => {
    expect(hasGroupVoll("mein", "ei")).toBe(true);
  });

  it("'die' enthält 'ie'", () => {
    expect(hasGroupVoll("die", "ie")).toBe(true);
  });

  it("'Haus' enthält 'au'", () => {
    expect(hasGroupVoll("Haus", "au")).toBe(true);
  });

  it("'Bäume' enthält 'äu'", () => {
    expect(hasGroupVoll("Bäume", "äu")).toBe(true);
  });

  it("'ich' enthält 'ch'", () => {
    expect(hasGroupVoll("ich", "ch")).toBe(true);
  });

  it("'Schule' enthält 'sch'", () => {
    expect(hasGroupVoll("Schule", "sch")).toBe(true);
  });

  it("'ist' enthält 'st'", () => {
    expect(hasGroupVoll("ist", "st")).toBe(true);
  });

  it("'Maus' enthält kein 'ei'", () => {
    expect(hasGroupVoll("Maus", "ei")).toBe(false);
  });

  it("Großschreibung wird ignoriert ('Ei' enthält 'ei')", () => {
    expect(hasGroupVoll("Ei", "ei")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// P2 — cellsToUnicode
// ---------------------------------------------------------------------------

describe("cellsToUnicode", () => {
  it("leere Zellfolge → leerer String", () => {
    expect(cellsToUnicode([])).toBe("");
  });

  it("parseDots('1') → U+2801 (⠁)", () => {
    expect(cellsToUnicode([parseDots("1")])).toBe("⠁");
  });

  it("parseDots('0') → U+2800 (⠀, Leerbraille)", () => {
    expect(cellsToUnicode([parseDots("0")])).toBe("⠀");
  });

  it("abc → drei Unicode-Braillezeichen", () => {
    const result = cellsToUnicode(textToCells("abc"));
    expect(result).toHaveLength(3);
    expect(result[0]).toBe(cellToUnicode(parseDots("1")));
  });

  it("cellsToUnicode(textToCells(t)) liefert ausschließlich U+2800-Block-Zeichen", () => {
    const result = cellsToUnicode(textToCells("Hallo"));
    for (const ch of result) {
      const cp = ch.codePointAt(0)!;
      expect(cp).toBeGreaterThanOrEqual(0x2800);
      expect(cp).toBeLessThanOrEqual(0x28ff);
    }
  });
});
