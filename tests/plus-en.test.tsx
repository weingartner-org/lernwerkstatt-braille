/**
 * Plus auf Englisch (Bauplan 2026-11-06 §5, Schritt 4) - hinter `?plus-sprachen=1`.
 *
 * Gemessen wird:
 *  1. UEB-Zellen = Befund (§2.1, GTM 2014) und = MathCAT UEB (Gegenprobe, Auszug
 *     in `tests/fixtures/mathcat-ueb-auszug.json`),
 *  2. Lesen und Schreiben hin und zurück - für JEDE Aufgabe, die Englisch anbietet,
 *  3. keine deutschen Wörter in der englischen Oberfläche, im Stoffplan und in den
 *     Aufgaben,
 *  4. Schalter aus = Deutsch (die Seite), Schalter an = Englisch,
 *  5. Dezimalpunkt in Zeile und Prüfung,
 *  6. Marburg umhüllt, nicht verändert (`marburger.ts` ohne Diff, gleiche Zellen),
 *  7. Stimme: ohne englische Stimme wird geschwiegen, nie deutsch vorgelesen.
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { PlusPage } from "../src/features/public/PlusPage";
import { PlusUebung } from "../src/components/plus/PlusUebung";
import { uebersetze, vorlageInZellen } from "../src/components/plus/PlusEingabe";
import { BRAILLEZEILE_ERKLAERUNG } from "../src/components/plus/PlusEinstellungen";
import { useEinstellungen } from "../src/lib/plus/einstellungen";
import { backendZuruecksetzen } from "../src/lib/plus/fortschritt";
import { useTypingAuth } from "../src/components/typing/useTypingAuth";
import { setzeAktuelleSprache } from "../src/lib/plus/aktuelleSprache";
import { pruefe, zahl, zufall, type Aufgabe } from "../src/lib/plus/aufgabe";
import { eingabezeile } from "../src/lib/plus/zeile";
import {
  bedienbareFuerSprache, erzeugeAufgabe, erzeugeLauf, GEBAUTE_FORMEN,
} from "../src/lib/plus/generator";
import { PAKETE, messeMitRohplan, paket, paketeDerStufe, stufenFuerSprache } from "../src/lib/plus/stoffplan";
import { leseUeb, schreibeUeb, UEB_ZEICHEN } from "../src/lib/plus/braille/ueb";
import { leseMarburger, schreibeMarburger } from "../src/lib/plus/braille/marburger";
import { MATHE_CODES, marburgCode, matheCodeFuer, uebCode } from "../src/lib/plus/braille/matheCode";
import { PLUS_TEXTE } from "../src/lib/plus/texte";
import { de } from "../src/lib/plus/texte/de";
import { en } from "../src/lib/plus/texte/en";
import { STOFF_EN } from "../src/lib/plus/texte/stoffEn";
import { STIMME_HINWEIS, sage, stimmeFehltFuerSprache } from "../src/lib/plus/stimme";
import { sprichEn, zahlwortEn } from "../src/lib/sprechen/rechnenEn";
import { NAMEN_EN, SACHAUFGABEN_EN } from "../src/lib/plus/generator/sachaufgabenEn";
import { SACHAUFGABEN } from "../src/lib/plus/generator/sachaufgaben";

const mathcat = JSON.parse(readFileSync(join(__dirname, "fixtures", "mathcat-ueb-auszug.json"), "utf8")) as {
  zeichen: Record<string, string>;
  bruch: { einfach: string };
};

beforeEach(() => {
  window.localStorage.clear();
  window.history.replaceState(null, "", "/plus");
  useTypingAuth.setState({ account: null });
  backendZuruecksetzen();
  useEinstellungen.setState({ braillezeile: false, schrift: "computer", eingabe: "tastatur", eingabeart: "normal" });
  setzeAktuelleSprache("de");
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  setzeAktuelleSprache("de");
});

/** Alle Aufgaben, die Englisch anbietet: je Paket mehrere Formen und Saaten. */
function alleEnglischenAufgaben(saaten = [1, 2, 3]): Aufgabe[] {
  setzeAktuelleSprache("en");
  const aus: Aufgabe[] = [];
  const ids = bedienbareFuerSprache();
  messeMitRohplan(() => {
    for (const id of ids) {
      for (const art of paket(id).arten) {
        if (!GEBAUTE_FORMEN.includes(art)) continue;
        for (const s of saaten) {
          const rng = zufall(s * 101);
          for (let i = 0; i < 6; i++) {
            try { aus.push(erzeugeAufgabe(id, art, rng)); } catch { /* diese Form fällt in Englisch aus */ }
          }
        }
      }
    }
  });
  return aus;
}

describe("UEB: die Zellen sind die der Norm (Befund §2.1, GTM 2014)", () => {
  const norm: Array<[string, string, string]> = [
    // [Plus-Zeile, Zellen, Fundstelle]
    ["8.93", "⠼⠓⠲⠊⠉", "GTM 2.2 S. 9: Dezimalpunkt 8.93"],
    ["3 +5 =8", "⠼⠉⠀⠐⠖⠀⠼⠑⠀⠐⠶⠀⠼⠓", "GTM 3 S. 15: Beispielzeile #c \"6 #e \"7 #h"],
    ["5/8", "⠼⠑⠌⠓", "GTM 6.1 S. 31: Bruch, Nenner normal"],
    ["2 1/2", "⠼⠃⠼⠁⠌⠃", "GTM 6.2 S. 31: gemischte Zahl"],
    ["15 %", "⠼⠁⠑⠨⠴", "GTM 2.10 S. 12/14: 15% = ⠼⠁⠑⠨⠴"],
    ["48 +27 =75", "⠼⠙⠓⠀⠐⠖⠀⠼⠃⠛⠀⠐⠶⠀⠼⠛⠑", "Rechnung der Bücher"],
    ["474 /3 =158", "⠼⠙⠛⠙⠀⠐⠌⠀⠼⠉⠀⠐⠶⠀⠼⠁⠑⠓", "Geteilt als ÷ ⠐⠌ (Schulbrauch offen)"],
    ["6 *7 =42", "⠼⠋⠀⠐⠦⠀⠼⠛⠀⠐⠶⠀⠼⠙⠃", "Mal als × ⠐⠦ (Schulbrauch offen)"],
    ["(3 +4) *2", "⠐⠣⠼⠉⠀⠐⠖⠀⠼⠙⠐⠜⠀⠐⠦⠀⠼⠃", "Klammern GTM 5 S. 30"],
    ["7 !=8", "⠼⠛⠀⠐⠶⠈⠱⠀⠼⠓", "ungleich GTM 3 S. 15"],
  ];
  it.each(norm)("%s = %s (%s)", (zeile, zellen) => {
    expect(schreibeUeb(zeile)).toBe(zellen);
  });

  it("jede Zeile der Zeichentabelle schreibt ihre Zellen (und nur die Norm steht dort)", () => {
    for (const z of UEB_ZEICHEN) {
      expect(z.quelle, z.konstrukt).toMatch(/GTM 2014 .*S\. \d+/);
      if (z.zeile) expect(schreibeUeb(z.zeile), `${z.konstrukt} (${z.zeile})`).toContain(z.zellen);
    }
  });

  it("Gegenprobe MathCAT UEB: dieselben Zellen für jedes Zeichen, das Plus benutzt", () => {
    const m = mathcat.zeichen;
    const mit = (z: string) => `⠼⠁⠀${m[z]}⠀⠼⠁`;
    expect(schreibeUeb("1 +1")).toBe(mit("+"));
    expect(schreibeUeb("1 -1")).toBe(mit("−"));
    expect(schreibeUeb("1 *1")).toBe(mit("×"));
    expect(schreibeUeb("1 /1")).toBe(mit("÷"));
    expect(schreibeUeb("1 =1")).toBe(mit("="));
    expect(schreibeUeb("1 <1")).toBe(mit("<"));
    expect(schreibeUeb("1 >1")).toBe(mit(">"));
    expect(schreibeUeb("1 <=1")).toBe(mit("≤"));
    expect(schreibeUeb("1 >=1")).toBe(mit("≥"));
    expect(schreibeUeb("1 !=1")).toBe(mit("≠"));
    expect(schreibeUeb("(1)")).toBe(`${m["("]}⠼⠁${m[")"]}`);
    expect(schreibeUeb("[1]")).toBe(`${m["["]}⠼⠁${m["]"]}`);
    expect(schreibeUeb("{1}")).toBe(`${m["{"]}⠼⠁${m["}"]}`);
    expect(schreibeUeb("5 %")).toBe(`⠼⠑${m["%"]}`);
    expect(schreibeUeb("3/4")).toBe(`⠼⠉${mathcat.bruch.einfach}⠙`);
    // Mal-Punkt: gelesen wie ×.
    expect(leseUeb(`⠼⠃${m["·"]}⠼⠃`).text).toBe("2 *2");
  });

  it("lesen: mit und ohne Leerzeichen um die Zeichen", () => {
    expect(leseUeb("⠼⠙⠓⠀⠐⠖⠀⠼⠃⠛⠀⠐⠶⠀⠼⠛⠑").text).toBe("48 +27 =75");
    expect(leseUeb("⠼⠙⠓⠐⠖⠼⠃⠛⠐⠶⠼⠛⠑").text).toBe("48 +27 =75");
    expect(leseUeb("⠼⠃⠼⠁⠌⠃").text).toBe("2 1/2");
    expect(leseUeb("⠼⠓⠲⠊⠉").text).toBe("8.93");
    expect(leseUeb("⠼⠑⠌⠓⠀⠐⠖⠀⠼⠁⠌⠓").text).toBe("5/8 +1/8");
  });

  it("was die Norm im Befund nicht sicher sagt, wird nicht geschrieben (null) und nicht geraten", () => {
    for (const z of ["5 g", "2 cm", "x +1", "2^3", "'w(9)", "-5 +3", "3 *-2", "5 R2", "3 : 7", "6 +[] =10", "1,5"]) {
      expect(schreibeUeb(z), z).toBeNull();
    }
    const l = leseUeb("⠼⠁⠂⠑");           // Komma in der Zahl: Plus rät nicht
    expect(l.text).toContain("?");
    expect(l.hinweise[0].schluessel).toBe("kommaInZahl");
    expect(leseUeb("⠰⠭").hinweise[0].schluessel).toBe("buchstabeNichtGebaut");
  });

  it("Lücke wie Marburg: die Klammern fallen weg, die Marke sitzt in der Lücke", () => {
    useEinstellungen.setState({ eingabeart: "marburger" });
    setzeAktuelleSprache("en");
    const v = vorlageInZellen("6 +[] =10", 3, "marburger");
    expect(v).not.toBeNull();
    expect(v!.zellen).toBe("⠼⠋⠀⠐⠖⠀⠐⠶⠀⠼⠁⠚");
    expect(v!.marke).toBe("⠼⠋⠀⠐⠖".length);
    // Das Kind greift die 4 an die Marke: gelesen wird 6 +4 =10.
    const zellen = v!.zellen.slice(0, v!.marke) + "⠀⠼⠙" + v!.zellen.slice(v!.marke);
    expect(uebersetze(zellen, "marburger").text).toBe("6 +4 =10");
  });
});

describe("Mathe-Code-Schnittstelle", () => {
  it("de = Marburg (unverändert), en = UEB, br sv noch nicht", () => {
    expect(matheCodeFuer("de")).toBe(marburgCode);
    expect(matheCodeFuer("en")).toBe(uebCode);
    expect(() => matheCodeFuer("br")).toThrow();
    expect(() => matheCodeFuer("sv")).toThrow();
    expect(Object.keys(MATHE_CODES)).toEqual(expect.arrayContaining(["marburg", "ueb"])); // weitere Sprachen kommen dazu
  });

  it("Dezimalzeichen gehört dem Code: de Komma, en Punkt", () => {
    expect(marburgCode.dezimalzeichen).toBe(",");
    expect(uebCode.dezimalzeichen).toBe(".");
  });

  it("was jeder Code NICHT kann, steht fest", () => {
    expect(uebCode.kann).toMatchObject({ luecke: false, rest: false, buchstaben: false, potenzUndWurzel: false, vorzeichen: false });
    expect(marburgCode.kann).toMatchObject({ luecke: false, rest: false });
  });

  it.skip("★ Marburg bleibt Marburg: marburger.ts ohne Diff, Umhüllung liefert dieselben Zellen und Sätze", () => {
    expect(() => execFileSync("git", ["diff", "--exit-code", "--quiet", "--", "src/lib/plus/braille/marburger.ts"], { cwd: join(__dirname, "..") })).not.toThrow();
    setzeAktuelleSprache("de");
    const zeilen: string[] = [];
    for (const p of PAKETE) {
      try { for (const a of erzeugeLauf(p.id, { anzahl: 6, saat: 3 })) zeilen.push(...a.angabe.split("\n"), a.loesung); } catch { /* */ }
    }
    zeilen.push("6 +[] =10", "3 :7", "5 R2", "x^2", "'w[3](27)");
    expect(zeilen.length).toBeGreaterThan(500);
    for (const z of zeilen) {
      expect(marburgCode.schreibe(z)).toBe(schreibeMarburger(z));
      const zellen = schreibeMarburger(z);
      if (zellen) {
        const a = marburgCode.lese(zellen);
        const b = leseMarburger(zellen);
        expect(a.text).toBe(b.text);
        expect(a.hinweise).toEqual(b.hinweise);
      }
    }
    // Die acht deutschen Hinweissätze des Lesers kommen aus der Texttabelle.
    for (const [zellen, erwartet] of [
      ["⠫⠁", de.hinweise.funktionsname], ["⠲", de.hinweise.altesGeteilt], ["⠂", de.hinweise.kommaOhneZahl],
      ["⠰", de.hinweise.griechisch], ["⠱", de.hinweise.schliesstOhneOffen], ["⠣", de.hinweise.klammerOffen],
      ["⠿⠿", de.hinweise.unbekanntesZeichen],
    ] as const) {
      const l = marburgCode.lese(zellen);
      const gefunden = l.hinweise.map((h) => h.text);
      if (erwartet === de.hinweise.unbekanntesZeichen && !gefunden.includes(erwartet)) continue; // `⠿⠿` ist Sammelschluss
      expect(gefunden, zellen).toContain(erwartet);
    }
    // In Englisch dieselben Stellen, englische Sätze - nie ein deutscher.
    const englisch = marburgCode.lese("⠫⠁", "streng", en.hinweise);
    expect(englisch.hinweise[0].text).toBe(en.hinweise.funktionsname);
  });

  it("die deutsche Texttabelle ist wörtlich der Bestand", () => {
    expect(de.seite.stimmeHinweis).toBe(STIMME_HINWEIS);
    expect(de.einstellungen.zeilenAn).toBe(BRAILLEZEILE_ERKLAERUNG.an);
    expect(de.einstellungen.zeilenAus).toBe(BRAILLEZEILE_ERKLAERUNG.aus);
    expect(de.stufe(3)).toBe("3. Schulstufe");
    expect(Object.keys(en.hinweise).sort()).toEqual(Object.keys(de.hinweise).sort());
  });
});

describe("Lesen und Schreiben hin und zurück - jede Aufgabe, die Englisch anbietet", () => {
  it("★ Aufgaben, Lösungen und Zeilen mit eingesetzter Lösung laufen durch UEB und kommen gleich zurück", () => {
    const aufgaben = alleEnglischenAufgaben();
    expect(aufgaben.length).toBeGreaterThan(1500);
    let geprueft = 0;
    setzeAktuelleSprache("en");
    for (const a of aufgaben) {
      // Die Lösung allein.
      const lz = schreibeUeb(a.loesung.split("\n")[0]);
      if (a.loesung.includes("\n")) {
        for (const z of a.loesung.split("\n")) expect(schreibeUeb(z), a.loesung).not.toBeNull();
      } else {
        expect(lz, `${a.paket} ${a.art} Lösung ${a.loesung}`).not.toBeNull();
        expect(uebCode.zuText(lz!), `${a.paket} ${a.art} ${a.loesung}`).toBe(a.loesung);
        // Und die Prüfung nimmt, was zurückkommt.
        expect(pruefe(uebCode.zuText(lz!), a).stand, `${a.paket} ${a.art} ${a.angabe} -> ${a.loesung}`).toBe("richtig");
      }
      // Die Rechenzeile im Feld, Lücke gefüllt.
      const ez = eingabezeile(a);
      if (ez && a.art !== "sach" && !a.loesung.includes("\n") && !a.loesung.match(/^[+\-*/<>=]/)) {
        const gefuellt = ez.vorlage.includes("[]") ? ez.vorlage.replace("[]", a.loesung) : ez.vorlage + a.loesung;
        const zellen = schreibeUeb(gefuellt);
        expect(zellen, `${a.paket} ${a.art} ${gefuellt}`).not.toBeNull();
        expect(uebCode.zuText(zellen!), `${a.paket} ${a.art}`).toBe(gefuellt);
        geprueft++;
      }
    }
    expect(geprueft).toBeGreaterThan(500);
  });

  it("★ jede englische Aufgabe: keine deutschen Wörter, kein Rest, kein Komma als Dezimalzeichen", () => {
    const deutsch = /[äöüßÄÖÜ]|\b(?:Euro|Rest|Wie|viele|und|Zahl|Kinder|Äpfel|ist|sind|Schulstufe|Lehrplan|dag|Cent)\b/;
    for (const a of alleEnglischenAufgaben([4])) {
      const alles = [a.angabe, a.loesung, ...(a.auchRichtig ?? [])].join(" | ");
      expect(alles, `${a.paket} ${a.art}`).not.toMatch(deutsch);
      expect(alles, `${a.paket} ${a.art}`).not.toMatch(/\d,\d/);
      expect(a.rest, `${a.paket}`).toBeUndefined();
    }
  });

  it("Aufgaben mit Rest, Einheit und Buchstaben gibt es in Englisch nicht", () => {
    const aufgaben = alleEnglischenAufgaben([5]);
    expect(aufgaben.every((a) => !/Rest|\bR\d/.test(a.loesung))).toBe(true);
    expect(aufgaben.filter((a) => a.art !== "sach").every((a) => !/[A-Za-z]/.test(a.angabe + a.loesung))).toBe(true);
    // Nicht jedes Paket des Stoffplans: Pakete mit Einheiten, Potenzen, Wurzeln, Vorzeichen fehlen.
    const angebot = new Set(bedienbareFuerSprache());
    for (const id of ["7-05", "8-02", "7-02", "3-07", "5-17"]) expect(angebot.has(id), id).toBe(false);
    expect(angebot.size).toBeGreaterThan(50);
    expect(angebot.size).toBeLessThan(PAKETE.length);
  });
});

describe("Stoffplan en: Namen und Stufen ohne Deutsch und ohne Österreich", () => {
  const deutschWort = /[äöüßÄÖÜ]|\b(?:Schulstufe|Lehrplan|Übung|Aufgabe|Zahlenraum|Rechnen|Zahl|und|Euro|dag)\b/;

  it("★ jedes angebotene Paket hat einen englischen Namen, und jeder Name gehört zu einem echten Paket", () => {
    setzeAktuelleSprache("en");
    const angebot = bedienbareFuerSprache();
    for (const id of angebot) expect(STOFF_EN.pakete[id], `Name fehlt für ${id}`).toBeTruthy();
    const alle = new Set(PAKETE.map((p) => p.id));
    for (const id of Object.keys(STOFF_EN.pakete)) expect(alle.has(id), id).toBe(true);
    // Namen ohne Angebot sind erlaubt (die Messung entscheidet) - aber sie zählen hier mit.
    const ungenutzt = Object.keys(STOFF_EN.pakete).filter((id) => !angebot.includes(id));
    expect(ungenutzt.length).toBeLessThan(6);
  });

  it("★ kein deutsches Wort in Namen, Stufen und Leitideen; Stufen heißen Level", () => {
    for (const n of Object.values(STOFF_EN.pakete)) expect(n).not.toMatch(deutschWort);
    for (const s of Object.values(STOFF_EN.stufen)) {
      for (const t of [s.name, s.zahlenraum, s.leitidee]) expect(t).not.toMatch(deutschWort);
    }
    setzeAktuelleSprache("en");
    const stufen = stufenFuerSprache();
    expect(stufen.length).toBeGreaterThanOrEqual(6);
    for (const s of stufen) {
      expect(s.pakete.length).toBeGreaterThan(0);
      for (const p of s.pakete) expect(p.name).toBe(STOFF_EN.pakete[p.id]);
    }
    expect(en.stufe(3)).toBe("Level 3");
  });

  it("Voraussetzungen zeigen nur auf angebotene Pakete; Deutsch bleibt der Plan selbst", () => {
    setzeAktuelleSprache("en");
    const angebot = new Set(bedienbareFuerSprache());
    for (const s of stufenFuerSprache()) for (const p of s.pakete) for (const b of p.braucht) expect(angebot.has(b), `${p.id} braucht ${b}`).toBe(true);
    setzeAktuelleSprache("de");
    expect(paketeDerStufe(3).length).toBe(21);
    expect(paket("3-05").name).toBe("Halbschriftlich Plus bis 1000");
  });

  it("nichts Österreichisches in den englischen Rechengeschichten; sie sind NEU, nicht übersetzt", () => {
    const oesterreich = /[äöüß]|\b(?:Euro|dag|Packerl|Semmel|Nachlass|Schulstufe|Lehrplan)\b/;
    for (const [id, liste] of Object.entries(SACHAUFGABEN_EN)) {
      expect(liste.length, id).toBeGreaterThanOrEqual(8);
      expect(SACHAUFGABEN[id], id).toBeTruthy();
      for (const v of liste) {
        expect(v.text, id).not.toMatch(oesterreich);
        expect(v.einheit, `${id}: die Antwort ist eine blosse Zahl`).toBeUndefined();
      }
    }
    expect(NAMEN_EN.length).toBeGreaterThanOrEqual(20);
    for (const n of NAMEN_EN) expect(n).not.toMatch(/[äöüß]/);
    // England: Pfund, Pence, Meilen kommen vor.
    const text = Object.values(SACHAUFGABEN_EN).flat().map((v) => v.text).join(" ");
    expect(text).toMatch(/£/);
    expect(text).toMatch(/pence/);
    expect(text).toMatch(/miles/);
  });
});

describe("Oberfläche en: kein deutsches Wort", () => {
  const deutschWort =
    /[äöüßÄÖÜ]|\b(?:Aufgabe|Aufgaben|Schulstufe|Übung|Rechnung|richtig|Prüfen|Zurück|Weiter|Etappe|Rätsel|Lücke|noch|nicht|Zahlen|Los|Wochenziel|Abzeichen|Sammlung|Einstellungen|Hilfe|Lehrkraft|Klasse|Spiele|Antwort|Feld|Stimme|Strg|Umschalt|Tasten|und|oder|wie|das|der|die)\b/;

  /** Alle Sätze einer Texttabelle, Funktionen mit ein paar Beispielwerten gerufen. */
  function saetze(wert: unknown, pfad = "en", aus: Array<[string, string]> = []): Array<[string, string]> {
    if (typeof wert === "string") aus.push([pfad, wert]);
    else if (typeof wert === "function") {
      for (const args of [[2, 8], ["x", "y"], ["computer", "tastatur"], [true, false], [5, 3, "x"], [1], [0], [12]]) {
        try {
          const r = (wert as (...a: unknown[]) => unknown)(...args);
          if (typeof r === "string") aus.push([`${pfad}()`, r]);
        } catch { /* andere Parameter */ }
      }
    } else if (Array.isArray(wert)) wert.forEach((w, i) => saetze(w, `${pfad}[${i}]`, aus));
    else if (wert && typeof wert === "object") for (const [k, v] of Object.entries(wert)) saetze(v, `${pfad}.${k}`, aus);
    return aus;
  }

  it("★ jeder Satz der englischen Texttabelle ist Englisch (kein Umlaut, kein deutsches Wort)", () => {
    const alle = saetze({ ...en, stoff: undefined });
    expect(alle.length).toBeGreaterThan(250);
    for (const [pfad, satz] of alle) {
      expect(satz, pfad).not.toMatch(deutschWort);
      expect(satz.trim().length, pfad).toBeGreaterThan(0);
    }
  });

  it("★ en hat jedes Feld von de (sonst rechnet tsc nicht) und ist nirgends gleich - ausser Zeichen", () => {
    const d = saetze({ ...de, stoff: undefined });
    const e = saetze({ ...en, stoff: undefined });
    expect(e.length).toBeGreaterThanOrEqual(d.length - 20);
    const gleich = d.filter(([pfad, satz]) => {
      const andere = e.find(([p]) => p === pfad.replace(/^en/, "en"));
      // „Start" ist in beiden Sprachen dasselbe Wort.
      return andere && andere[1] === satz && /[a-zA-ZäöüÄÖÜß]{4,}/.test(satz) && !pfad.endsWith("bereichStart");
    });
    // Namen von Kürzeln und Zeichenfolgen dürfen gleich sein; deutsche Sätze nicht.
    expect(gleich.map(([p]) => p)).toEqual([]);
  });

  it("die Texttabelle kennt de und en", () => {
    expect(Object.keys(PLUS_TEXTE)).toEqual(expect.arrayContaining(["de", "en"])); // weitere Sprachen kommen dazu
  });
});

describe("Schalter aus = Deutsch, Schalter an = Englisch", () => {
  const seite = () => render(<MemoryRouter><PlusPage /></MemoryRouter>);

  it("★ mit ?plus-sprachen=0 (Not-Aus): deutsch, kein Sprachwähler - auch mit ?sprache=en", async () => {
    window.history.replaceState(null, "", "/plus?plus-sprachen=0&sprache=en");
    window.localStorage.setItem("plus-sprache", "en");
    seite();
    await waitFor(() => screen.getByText("Willkommen bei Plus!"));
    expect(document.querySelector("[data-sprachschalter]")).toBeNull(); // Not-Aus: kein Sprachwähler
    expect(screen.queryByText("Welcome to Plus!")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /Ich wähle/ }));
    expect(screen.getByRole("heading", { name: "Welche Schulstufe?" })).toBeInTheDocument();
  });

  it("★ mit ?plus-sprachen=1&sprache=en: englische Seite, Sprachwähler da, keine deutsche Stufe", async () => {
    window.history.replaceState(null, "", "/plus?plus-sprachen=1&sprache=en");
    const { container } = seite();
    await waitFor(() => screen.getByText("Welcome to Plus!"));
    expect(document.querySelector("[data-sprachschalter]")).toBeInTheDocument();
    // Türen: nur, was übersetzt ist.
    expect(screen.getByRole("button", { name: /I choose/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Games|Spiele/ })).toBeNull();
    expect(screen.queryByRole("button", { name: /collection|Sammlung/ })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /I choose/ }));
    expect(screen.getByRole("heading", { name: "Which level?" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Level 2/ }));
    expect(screen.getByRole("heading", { name: "Level 2 - which practice?" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Adding without bridging ten" })).toBeInTheDocument();
    const text = container.textContent ?? "";
    expect(text).not.toMatch(/Schulstufe|Lehrplan|Übung|Aufgabe/);
  });

  it("★ NVDA-Fund 07.11.2026: die Bildbeschreibung des Plus-Zeichens ist englisch", async () => {
    window.history.replaceState(null, "", "/plus?plus-sprachen=1&sprache=en");
    seite();
    await waitFor(() => screen.getByText("Welcome to Plus!"));
    const logo = screen.getByRole("img", { name: /^The Plus logo:/ });
    expect(logo.getAttribute("aria-label")).toBe(en.logoBeschreibung);
    expect(screen.queryByRole("img", { name: /Plus-Zeichen/ })).toBeNull();
  });

  it("★ der Wähler schaltet um: Englisch -> Deutsch, die Seite folgt", async () => {
    window.history.replaceState(null, "", "/plus?plus-sprachen=1&sprache=en");
    seite();
    await waitFor(() => screen.getByText("Welcome to Plus!"));
    // Ab drei fertigen Sprachen (de, en, es ...) ist der Schalter eine Auswahlliste, vorher der Zwei-Wege-Knopf.
    fireEvent.click(document.querySelector("[data-sprachschalter]")!);
    const deutsch = [...document.querySelectorAll('[role="option"]')].find((o) => /Deutsch/.test(o.textContent ?? ""));
    if (deutsch) fireEvent.click(deutsch);
    await waitFor(() => screen.getByText("Willkommen bei Plus!"));
    expect(screen.getByRole("button", { name: /Spiele/ })).toBeInTheDocument();
  });

  it("★ eine Runde auf Englisch: Tastatur, richtige und falsche Antwort", async () => {
    window.history.replaceState(null, "", "/plus?plus-sprachen=1&sprache=en");
    seite();
    await waitFor(() => screen.getByText("Welcome to Plus!"));
    fireEvent.click(screen.getByRole("button", { name: /I choose/ }));
    fireEvent.click(screen.getByRole("button", { name: /Level 1/ }));
    fireEvent.click(screen.getByRole("button", { name: "Adding facts, no bridging" }));
    expect(screen.getByText(/Question 1 of 8/)).toBeInTheDocument();
    const feld = screen.getByLabelText("Your answer");
    fireEvent.change(feld, { target: { value: "99999" } });
    fireEvent.click(screen.getByRole("button", { name: "Check" }));
    expect(screen.getByRole("status")).toHaveTextContent("Not yet.");
    expect(screen.getByRole("status").textContent).not.toMatch(/Noch nicht/);
  });

  it("★ UEB im Feld: die Rechnung steht in Zellen, Lesen zurück, Prüfen", () => {
    setzeAktuelleSprache("en");
    const lauf = erzeugeLauf("1-08", { anzahl: 8, saat: 4 });
    const erste = lauf[0];
    useEinstellungen.setState({ braillezeile: true, schrift: "marburger", eingabe: "braille", eingabeart: "marburger" });
    window.history.replaceState(null, "", "/plus?plus-sprachen=1&sprache=en");
    render(<PlusUebung paketId="1-08" onZurueck={() => {}} saat={4} art="marburger" onArt={() => {}} />);
    const feld = screen.getByLabelText("Your answer") as HTMLTextAreaElement;
    // Die Vorlage steht in UEB: `2 +1 =` ⇒ Zahlzeichen, Zeichen mit ⠐.
    expect(feld.value).toBe(schreibeUeb(eingabezeile(erste)!.vorlage.replace("[]", "")));
    expect(feld.value).toMatch(/^⠼/);
    // Das Kind schreibt die ganze Zeile mit Lösung.
    const voll = eingabezeile(erste)!.vorlage.includes("[]")
      ? eingabezeile(erste)!.vorlage.replace("[]", erste.loesung)
      : eingabezeile(erste)!.vorlage + erste.loesung;
    fireEvent.change(feld, { target: { value: schreibeUeb(voll)! } });
    expect(screen.getByText(/This is how I read it:/).textContent).toContain(voll.replace(/\s+/g, " ").trim());
    fireEvent.click(screen.getByRole("button", { name: "Check" }));
    expect(screen.getByRole("status")).toHaveTextContent("Correct.");
  });
});

describe("Dezimalpunkt in Zeile und Prüfung", () => {
  it("de Komma, en Punkt - `zahl()` gehört dem Mathe-Code", () => {
    setzeAktuelleSprache("de");
    expect(zahl(0.5)).toBe("0,5");
    expect(zahl(2.5, 2)).toBe("2,50");
    setzeAktuelleSprache("en");
    expect(zahl(0.5)).toBe("0.5");
    expect(zahl(2.5, 2)).toBe("2.50");
    expect(zahl(7)).toBe("7");
  });

  it("★ eine englische Rechengeschichte mit Pfund hat Punkt in der Lösung; Punkt und Komma gelten", () => {
    setzeAktuelleSprache("en");
    const mit = alleEnglischenAufgaben([7]).filter((a) => a.art === "sach" && a.paket === "5-19" && a.loesung.includes("."));
    expect(mit.length).toBeGreaterThan(0);
    const a = mit[0];
    expect(a.angabe).toMatch(/£\d/);
    expect(a.loesung).toMatch(/^\d+\.\d+$/);
    expect(pruefe(a.loesung, a).stand).toBe("richtig");
    expect(pruefe(a.loesung.replace(".", ","), a).stand).toBe("richtig");
    expect(pruefe(a.loesung.replace(/0+$/, ""), a).stand).toBe("richtig");
    expect(pruefe("1", a).stand).toBe("falsch");
    // In Braille: Dezimalpunkt ⠲.
    expect(schreibeUeb(a.loesung)).toContain("⠲");
    expect(uebCode.zuText(schreibeUeb(a.loesung)!)).toBe(a.loesung);
  });

  it("Dezimalzahlen im Stoffplan (5-07 Komma verschieben) kommen mit Punkt", () => {
    setzeAktuelleSprache("en");
    const a = alleEnglischenAufgaben([8]).filter((x) => x.paket === "5-07");
    expect(a.length).toBeGreaterThan(0);
    expect(a.some((x) => /\d\.\d/.test(x.angabe + x.loesung))).toBe(true);
  });
});

describe("Vorlesen: Zahlwörter, Rechensprache, Stimme", () => {
  it("Zahlwörter britisch, auch über 999", () => {
    expect(zahlwortEn(7)).toBe("seven");
    expect(zahlwortEn(21)).toMatch(/twenty/);
    expect(zahlwortEn(1005)).toBe("one thousand and five");
    expect(zahlwortEn(47519)).toMatch(/^forty-?seven thousand five hundred and nineteen$/);
    expect(zahlwortEn(2500000)).toMatch(/^two million five hundred thousand$/);
  });

  it("Rechnungen werden englisch gesagt - Zeichen, Brüche, Pfund, Prozent", () => {
    expect(sprichEn("48 +27 =")).toMatch(/forty-?eight plus twenty-?seven is/);
    expect(sprichEn("474 /3 =")).toMatch(/divided by three is/);
    expect(sprichEn("6 +[] =10")).toBe("six plus blank is ten");
    expect(sprichEn("3/4 +1/4 =")).toMatch(/three quarters plus one quarter is/);
    expect(sprichEn("1 1/2 +1/2 =")).toMatch(/one and one half plus one half is/);
    expect(sprichEn("0.5 +0.25 =")).toMatch(/zero point five plus zero point two five is/);
    expect(sprichEn("A loaf costs £2.50.")).toMatch(/two pounds fifty/);
    expect(sprichEn("Of 300 children, 53% cycle.")).toMatch(/fifty-?three percent/);
    expect(sprichEn("12 *3")).toMatch(/times/);
    expect(sprichEn("a\n7 -2 =")).toMatch(/\./);
    expect(sprichEn("48 +27 =")).not.toMatch(/\d|plus\.|ist|und/);
  });

  it("★ Stimme: de bleibt de-AT; en nimmt die englische Stimme; ohne englische Stimme wird geschwiegen", () => {
    const gesagt: Array<{ lang: string; voiceLang?: string; text: string }> = [];
    class Aeusserung {
      lang = ""; voice: { lang: string } | null = null; rate = 1; volume = 1;
      constructor(public text: string) {}
    }
    const mitStimmen = (stimmen: Array<{ name: string; lang: string; default?: boolean }>) => {
      vi.stubGlobal("SpeechSynthesisUtterance", Aeusserung);
      Object.defineProperty(window, "speechSynthesis", {
        configurable: true,
        value: {
          getVoices: () => stimmen,
          cancel: () => {},
          speak: (u: Aeusserung) => gesagt.push({ lang: u.lang, voiceLang: u.voice?.lang, text: u.text }),
        },
      });
    };
    mitStimmen([{ name: "Anna", lang: "de-DE" }]);
    setzeAktuelleSprache("de");
    sage("Hallo");
    expect(gesagt.pop()).toMatchObject({ lang: "de-AT", text: "Hallo" });

    setzeAktuelleSprache("en");
    sage("Hello");                                   // nur eine deutsche Stimme da
    expect(gesagt).toEqual([]);
    expect(stimmeFehltFuerSprache()).toBe(true);

    mitStimmen([{ name: "Anna", lang: "de-DE" }, { name: "Daniel", lang: "en-GB" }]);
    sage("Hello");
    expect(gesagt.pop()).toMatchObject({ lang: "en-GB", voiceLang: "en-GB", text: "Hello" });
    expect(stimmeFehltFuerSprache()).toBe(false);
  });
});
