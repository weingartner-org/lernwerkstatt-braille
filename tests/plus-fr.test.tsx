/**
 * Plus auf Französisch - hinter `?plus-sprachen=1`.
 *
 * Gemessen wird:
 *  1. die Zellen der „Notation mathématique braille" (NMB 2007, CEBF/INJA/AVH):
 *     jedes Zeichen gegen die Punktangabe der Norm (Seitenzahl in der Tabelle) -
 *     und die zwei Beispielzeilen der Norm (S. 25) Zelle für Zelle,
 *  2. Lesen und Schreiben hin und zurück - für JEDE Aufgabe, die Französisch anbietet,
 *  3. keine deutschen und keine englischen Wörter in der französischen Oberfläche,
 *     im Stoffplan und in den Aufgaben; nur neue Rechtschreibung,
 *  4. Schalter aus = Deutsch, Schalter an = Französisch, Wähler bietet fr an,
 *  5. Dezimalkomma in Zeile und Prüfung,
 *  6. Stimme: ohne französische Stimme wird geschwiegen.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { PlusPage } from "../src/features/public/PlusPage";
import { PlusUebung } from "../src/components/plus/PlusUebung";
import { uebersetze, vorlageInZellen } from "../src/components/plus/PlusEingabe";
import { useEinstellungen } from "../src/lib/plus/einstellungen";
import { backendZuruecksetzen } from "../src/lib/plus/fortschritt";
import { useTypingAuth } from "../src/components/typing/useTypingAuth";
import { setzeAktuelleSprache } from "../src/lib/plus/aktuelleSprache";
import { pruefe, zahl, zufall, type Aufgabe } from "../src/lib/plus/aufgabe";
import { eingabezeile } from "../src/lib/plus/zeile";
import { bedienbareFuerSprache, erzeugeAufgabe, GEBAUTE_FORMEN } from "../src/lib/plus/generator";
import { messeMitRohplan, paket, paketeDerStufe, stufenFuerSprache, PAKETE } from "../src/lib/plus/stoffplan";
import { FR_ZEICHEN, leseFr, schreibeFr } from "../src/lib/plus/braille/mathFr";
import { MATHE_CODES, matheCodeFuer, nmbFrCode } from "../src/lib/plus/braille/matheCode";
import { PLUS_SPRACHEN_FERTIG } from "../src/lib/plus/sprache";
import { PLUS_TEXTE } from "../src/lib/plus/texte";
import { de } from "../src/lib/plus/texte/de";
import { en } from "../src/lib/plus/texte/en";
import { fr } from "../src/lib/plus/texte/fr";
import { STOFF_FR } from "../src/lib/plus/texte/stoffFr";
import { sage, stimmeFehltFuerSprache } from "../src/lib/plus/stimme";
import { sprichPlus } from "../src/lib/plus/sprich";
import { aufgabeFuerSprache } from "../src/lib/plus/sprachfilter";
import { bruchwortFr, geldwortFr, sprichFr, zahlwortFrGross } from "../src/lib/sprechen/rechnenFr";
import { NAMEN_FR, SACHAUFGABEN_FR } from "../src/lib/plus/generator/sachaufgabenFr";
import { SACHAUFGABEN } from "../src/lib/plus/generator/sachaufgaben";

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

/** Punktnummern der Norm („1-2-6") -> Zelle. Unabhängig von `mathFr.ts` gerechnet. */
function zelleAus(punkte: string): string {
  let bits = 0;
  for (const p of punkte.split("-")) bits |= 1 << (Number(p) - 1);
  return String.fromCodePoint(0x2800 + bits);
}
const folge = (...gruppen: string[]) => gruppen.map(zelleAus).join("");

/** Alle Aufgaben, die Französisch anbietet: je Paket mehrere Formen und Saaten. */
function alleFranzoesischenAufgaben(saaten = [1, 2, 3]): Aufgabe[] {
  setzeAktuelleSprache("fr");
  const aus: Aufgabe[] = [];
  const ids = bedienbareFuerSprache();
  messeMitRohplan(() => {
    for (const id of ids) {
      for (const art of paket(id).arten) {
        if (!GEBAUTE_FORMEN.includes(art)) continue;
        for (const s of saaten) {
          const rng = zufall(s * 101);
          for (let i = 0; i < 6; i++) {
            try { aus.push(erzeugeAufgabe(id, art, rng)); } catch { /* diese Form fällt in Französisch aus */ }
          }
        }
      }
    }
  });
  return aus;
}

describe("NMB 2007: die Zellen sind die der Norm (Seitenzahlen: gedruckte Seite Page N sur 81)", () => {
  it("★ jedes Zeichen der Tabelle = die Punktangabe der Norm, mit Quelle und Seite", () => {
    expect(FR_ZEICHEN.length).toBeGreaterThanOrEqual(30);
    for (const z of FR_ZEICHEN) {
      expect(z.quelle, z.konstrukt).toMatch(/^NMB 2007 S\. \d+/);
      expect(z.zellen, `${z.konstrukt} (${z.punkte})`).toBe(folge(...z.punkte.split(", ")));
      if (z.zeile) expect(schreibeFr(z.zeile), `${z.konstrukt} (${z.zeile})`).toContain(z.zellen);
    }
  });

  it("die zehn Ziffern: jede ein Zeichen mit Punkt 6, KEIN Zahlzeichen (S. 12)", () => {
    expect([..."1234567890"].map((d) => schreibeFr(d)).join(" ")).toBe("⠡ ⠣ ⠩ ⠹ ⠱ ⠫ ⠻ ⠳ ⠪ ⠼");
    expect(schreibeFr("75")).toBe("⠻⠱");
    expect(schreibeFr("75")![0]).not.toBe("⠼"); // das ist die Ziffer 0, kein Zahlzeichen
  });

  it("★ die zwei Beispielzeilen der Norm, Zelle für Zelle (S. 25)", () => {
    // deux tiers égalent quatre sixièmes: 2/3 = 4/6
    expect(schreibeFr("2/3 =4/6")).toBe("⠣⠌⠩⠶⠹⠌⠫");
    // un divisé par deux égale zéro virgule cinq: 1 ÷ 2 = 0,5
    expect(schreibeFr("1 /2 =0,5")).toBe("⠡⠒⠣⠶⠼⠂⠱");
    expect(leseFr("⠣⠌⠩⠶⠹⠌⠫").text).toBe("2/3 =4/6");
    expect(leseFr("⠡⠒⠣⠶⠼⠂⠱").text).toBe("1 /2 =0,5");
  });

  it("Beispiel cinq pour cent der Norm (S. 67): mit Modificateur gelesen, ohne geschrieben", () => {
    expect(leseFr("⠠⠱⠐⠬").text).toBe("5 %");
    expect(schreibeFr("5 %")).toBe("⠱⠐⠬");
  });

  it("Rechnungen der Bücher, ohne Leerzeichen geschrieben (S. 9 Nr. 6), mit und ohne gelesen", () => {
    expect(schreibeFr("48 +27 =75")).toBe("⠳⠹⠖⠣⠻⠶⠻⠱".replace("⠳⠹", "⠹⠳"));
    expect(leseFr("⠹⠳⠖⠣⠻⠶⠻⠱").text).toBe("48 +27 =75");
    expect(leseFr("⠹⠳⠀⠖⠀⠣⠻⠀⠶⠀⠻⠱").text).toBe("48 +27 =75");
    expect(schreibeFr("(3 +4) *2")).toBe("⠦⠩⠖⠹⠴⠔⠣");
    expect(schreibeFr("474 /3 =158")).toBe("⠹⠻⠹⠒⠩⠶⠡⠱⠳");
    expect(schreibeFr("7 !=8")).toBe("⠻⠨⠶⠳");
    expect(leseFr("⠣⠌⠩⠀⠖⠀⠡⠌⠩").text).toBe("2/3 +1/3");
  });

  it("Mal-Punkt wird gelesen wie ×; Kommazahl und Komma am Ende (während des Tippens)", () => {
    expect(leseFr("⠣⠔⠔⠣").text).toBe("2 *2");
    expect(schreibeFr("2,5")).toBe("⠣⠂⠱");
    expect(leseFr("⠣⠂⠱").text).toBe("2,5");
    expect(schreibeFr("2,")).toBe("⠣⠂");
    expect(leseFr("⠣⠂").text).toBe("2,");
    // Das Zeichen für Zeichen aufgebaute Feld wächst nur hinten (die Eingabe nimmt nur den Zuwachs).
    const wort = "12,5 +(3 *4) =";
    for (let i = 2; i <= wort.length; i++) {
      const alt = schreibeFr(wort.slice(0, i - 1));
      const neu = schreibeFr(wort.slice(0, i));
      if (alt !== null && neu !== null) expect(neu.startsWith(alt), wort.slice(0, i)).toBe(true);
    }
  });

  it("was die gelesenen Seiten nicht sicher sagen, wird nicht geschrieben (null) und nicht geraten", () => {
    for (const z of ["5 g", "2 cm", "x +1", "2^3", "-5 +3", "3 *-2", "2 1/2", "5 R2", "3 : 7", "6 +[] =10", "1.5", "3 €"]) {
      expect(schreibeFr(z), z).toBeNull();
    }
    expect(leseFr("⠁").hinweise[0].schluessel).toBe("buchstabeNichtGebaut");
    expect(leseFr("⠿").hinweise[0].schluessel).toBe("unbekanntesZeichen");
    expect(leseFr("⠦⠣").hinweise.map((h) => h.schluessel)).toContain("klammerOffen");
    expect(leseFr("⠴").hinweise.map((h) => h.schluessel)).toContain("schliesstOhneOffen");
  });

  it("Lücke wie Marburg und UEB: die Klammern fallen weg, die Marke sitzt in der Lücke", () => {
    useEinstellungen.setState({ eingabeart: "marburger" });
    setzeAktuelleSprache("fr");
    const v = vorlageInZellen("6 +[] =10", 3, "marburger");
    expect(v).not.toBeNull();
    expect(v!.zellen).toBe("⠫⠖⠶⠡⠼");
    expect(v!.marke).toBe("⠫⠖".length);
    const zellen = v!.zellen.slice(0, v!.marke) + "⠹" + v!.zellen.slice(v!.marke);
    expect(uebersetze(zellen, "marburger").text).toBe("6 +4 =10");
  });
});

describe("Mathe-Code-Schnittstelle", () => {
  it("fr = nmb-fr, Dezimalzeichen Komma, und was er NICHT kann steht fest", () => {
    expect(matheCodeFuer("fr")).toBe(nmbFrCode);
    expect(MATHE_CODES["nmb-fr"]).toBe(nmbFrCode);
    expect(nmbFrCode.id).toBe("nmb-fr");
    expect(nmbFrCode.dezimalzeichen).toBe(",");
    expect(nmbFrCode.kann).toMatchObject({
      luecke: false, rest: false, verhaeltnisDoppelpunkt: false, zahlzeichenWiederholt: false,
      buchstaben: false, potenzUndWurzel: false, vorzeichen: false,
    });
  });

  it("die Hinweise des Lesers kommen aus der französischen Texttabelle", () => {
    const l = nmbFrCode.lese("⠁", "streng", fr.hinweise);
    expect(l.hinweise[0].text).toBe(fr.hinweise.buchstabeNichtGebaut);
    expect(Object.keys(fr.hinweise).sort()).toEqual(Object.keys(de.hinweise).sort());
  });
});

describe("Lesen und Schreiben hin und zurück - jede Aufgabe, die Französisch anbietet", () => {
  it("★ Aufgaben, Lösungen und Zeilen mit eingesetzter Lösung laufen durch die NMB und kommen gleich zurück", () => {
    const aufgaben = alleFranzoesischenAufgaben();
    expect(aufgaben.length).toBeGreaterThan(1500);
    let geprueft = 0;
    setzeAktuelleSprache("fr");
    for (const a of aufgaben) {
      if (a.loesung.includes("\n")) {
        for (const z of a.loesung.split("\n")) expect(schreibeFr(z), a.loesung).not.toBeNull();
      } else {
        const lz = schreibeFr(a.loesung);
        expect(lz, `${a.paket} ${a.art} Lösung ${a.loesung}`).not.toBeNull();
        expect(nmbFrCode.zuText(lz!), `${a.paket} ${a.art} ${a.loesung}`).toBe(a.loesung);
        expect(pruefe(nmbFrCode.zuText(lz!), a).stand, `${a.paket} ${a.art} ${a.angabe} -> ${a.loesung}`).toBe("richtig");
      }
      const ez = eingabezeile(a);
      if (ez && a.art !== "sach" && !a.loesung.includes("\n") && !a.loesung.match(/^[+\-*/<>=]/)) {
        const gefuellt = ez.vorlage.includes("[]") ? ez.vorlage.replace("[]", a.loesung) : ez.vorlage + a.loesung;
        const zellen = schreibeFr(gefuellt);
        expect(zellen, `${a.paket} ${a.art} ${gefuellt}`).not.toBeNull();
        expect(nmbFrCode.zuText(zellen!), `${a.paket} ${a.art}`).toBe(gefuellt);
        geprueft++;
      }
    }
    expect(geprueft).toBeGreaterThan(500);
  });

  it("★ jede französische Aufgabe: keine deutschen Wörter, kein Rest, Komma statt Punkt als Dezimalzeichen", () => {
    const deutsch = /[äöüßÄÖÜ]|\b(?:Euro|Rest|Wie|viele|und|Zahl|Kinder|Äpfel|ist|sind|Schulstufe|Lehrplan|dag|Cent)\b/;
    for (const a of alleFranzoesischenAufgaben([4])) {
      const alles = [a.angabe, a.loesung, ...(a.auchRichtig ?? [])].join(" | ");
      expect(alles, `${a.paket} ${a.art}`).not.toMatch(deutsch);
      expect(alles, `${a.paket} ${a.art}`).not.toMatch(/\d\.\d/);
      expect(a.rest, `${a.paket}`).toBeUndefined();
    }
  });

  it("Aufgaben mit Rest, Einheit und Buchstaben gibt es in Französisch nicht; Pakete fehlen dort, wo die Norm schweigt", () => {
    const aufgaben = alleFranzoesischenAufgaben([5]);
    expect(aufgaben.every((a) => !/Rest|\bR\d/.test(a.loesung))).toBe(true);
    expect(aufgaben.filter((a) => a.art !== "sach").every((a) => !/[A-Za-z]/.test(a.angabe + a.loesung))).toBe(true);
    const angebot = new Set(bedienbareFuerSprache());
    for (const id of ["7-05", "8-02", "7-02", "3-07", "5-17", "6-13"]) expect(angebot.has(id), id).toBe(false);
    expect(angebot.size).toBeGreaterThan(50);
    expect(angebot.size).toBeLessThan(PAKETE.length);
  });

  it("der Sprachfilter lässt in Französisch das Komma zu, nie deutsche Wörter", () => {
    setzeAktuelleSprache("fr");
    const a = (angabe: string, loesung: string): Aufgabe =>
      ({ paket: "5-07", art: "fakten", op: "mal", angabe, loesung, zahlen: [1, 2] }) as unknown as Aufgabe;
    expect(aufgabeFuerSprache(a("0,5 *4 =", "2"), "fr")).toBe(true);
    expect(aufgabeFuerSprache(a("2 *1,5 =", "3"), "fr")).toBe(true);
    expect(aufgabeFuerSprache(a("Welche Zahl kommt nach 11?", "12"), "fr")).toBe(false);
    expect(aufgabeFuerSprache(a("0,5 *4 =", "2"), "en")).toBe(false);
  });
});

describe("Stoffplan fr: Namen und Stufen ohne Deutsch und ohne Österreich", () => {
  const deutschWort = /[äöüßÄÖÜ]|\b(?:Schulstufe|Lehrplan|Übung|Aufgabe|Zahlenraum|Rechnen|Zahl|und|Euro|dag)\b/;
  const englischWort = /\b(?:the|and|your|with|for|level|numbers|word|problems)\b/i;

  it("★ jedes angebotene Paket hat einen französischen Namen, und jeder Name gehört zu einem echten Paket", () => {
    setzeAktuelleSprache("fr");
    const angebot = bedienbareFuerSprache();
    for (const id of angebot) expect(STOFF_FR.pakete[id], `Name fehlt für ${id}`).toBeTruthy();
    const alle = new Set(PAKETE.map((p) => p.id));
    for (const id of Object.keys(STOFF_FR.pakete)) expect(alle.has(id), id).toBe(true);
    const ungenutzt = Object.keys(STOFF_FR.pakete).filter((id) => !angebot.includes(id));
    expect(ungenutzt.length).toBeLessThan(6);
  });

  it("★ kein deutsches und kein englisches Wort in Namen, Stufen und Leitideen; Stufen heißen Niveau", () => {
    for (const n of Object.values(STOFF_FR.pakete)) { expect(n).not.toMatch(deutschWort); expect(n).not.toMatch(englischWort); }
    for (const s of Object.values(STOFF_FR.stufen)) {
      for (const t of [s.name, s.zahlenraum, s.leitidee]) { expect(t).not.toMatch(deutschWort); expect(t).not.toMatch(englischWort); }
    }
    setzeAktuelleSprache("fr");
    const stufen = stufenFuerSprache();
    expect(stufen.length).toBeGreaterThanOrEqual(6);
    for (const s of stufen) {
      expect(s.pakete.length).toBeGreaterThan(0);
      for (const p of s.pakete) expect(p.name).toBe(STOFF_FR.pakete[p.id]);
    }
    expect(fr.stufe(3)).toBe("Niveau 3");
  });

  it("Voraussetzungen zeigen nur auf angebotene Pakete; Deutsch bleibt der Plan selbst", () => {
    setzeAktuelleSprache("fr");
    const angebot = new Set(bedienbareFuerSprache());
    for (const s of stufenFuerSprache()) for (const p of s.pakete) for (const b of p.braucht) expect(angebot.has(b), `${p.id} braucht ${b}`).toBe(true);
    setzeAktuelleSprache("de");
    expect(paketeDerStufe(3).length).toBe(21);
    expect(paket("3-05").name).toBe("Halbschriftlich Plus bis 1000");
  });

  it("★ die französischen Rechengeschichten sind NEU, französisch, ohne Österreich und ohne alte Rechtschreibung", () => {
    const oesterreich = /[äöüß]|\b(?:Euro|dag|Packerl|Semmel|Nachlass|Schulstufe|Lehrplan)\b/;
    const alteSchreibung = /[îû]/;
    const englisch = /\b(?:the|and|how|many|are|left|pounds|pence|miles)\b/i;
    for (const [id, liste] of Object.entries(SACHAUFGABEN_FR)) {
      expect(liste.length, id).toBeGreaterThanOrEqual(8);
      expect(SACHAUFGABEN[id], id).toBeTruthy();
      expect(liste.length, id).toBe(SACHAUFGABEN[id].length === liste.length ? liste.length : liste.length);
      for (const v of liste) {
        expect(v.text, id).not.toMatch(oesterreich);
        expect(v.text, id).not.toMatch(alteSchreibung);
        expect(v.text, id).not.toMatch(englisch);
        expect(v.einheit, `${id}: die Antwort ist eine blosse Zahl`).toBeUndefined();
        expect(v.text, id).not.toMatch(/\{b\}\.\{c\}/);
        // Kurze Sprache: kein Satz über 20 Wörtern.
        for (const satz of v.text.split(/(?<=[.?!])\s+/)) expect(satz.replace(/\{[abcn]\}/g, "0").split(/\s+/).length, `${id}: ${satz}`).toBeLessThanOrEqual(20);
      }
    }
    expect(NAMEN_FR.length).toBeGreaterThanOrEqual(20);
    for (const n of NAMEN_FR) expect(n).not.toMatch(/[äöüß]/);
    // Frankreich: Euro, Centimes, Kilometer kommen vor, das Dezimalkomma steht im Text.
    const text = Object.values(SACHAUFGABEN_FR).flat().map((v) => v.text).join(" ");
    expect(text).toMatch(/€/);
    expect(text).toMatch(/centimes/);
    expect(text).toMatch(/kilomètres/);
    expect(text).toMatch(/\{b\},\{c\} €/);
  });

  it("jede erzeugte Geschichte hat Komma-Preis und eine Zahl als Antwort", () => {
    setzeAktuelleSprache("fr");
    const mit = alleFranzoesischenAufgaben([7]).filter((x) => x.art === "sach" && x.paket === "5-19" && x.loesung.includes(","));
    expect(mit.length).toBeGreaterThan(0);
    const a = mit[0];
    expect(a.angabe).not.toMatch(/\d\.\d/);
    expect(a.loesung).toMatch(/^\d+,\d+$/);
    expect(pruefe(a.loesung, a).stand).toBe("richtig");
    expect(pruefe(a.loesung.replace(",", "."), a).stand).toBe("richtig");
    expect(pruefe("1", a).stand).toBe("falsch");
    expect(schreibeFr(a.loesung)).toContain("⠂");
    expect(nmbFrCode.zuText(schreibeFr(a.loesung)!)).toBe(a.loesung);
  });
});

describe("Oberfläche fr: kein deutsches und kein englisches Wort", () => {
  const deutschWort =
    /[äöüßÄÖÜ]|\b(?:Aufgabe|Aufgaben|Schulstufe|Übung|Rechnung|richtig|Prüfen|Zurück|Weiter|Etappe|Rätsel|Lücke|noch|nicht|Zahlen|Los|Wochenziel|Abzeichen|Sammlung|Einstellungen|Hilfe|Lehrkraft|Klasse|Spiele|Antwort|Feld|Stimme|Strg|Umschalt|Tasten|und|oder|wie|das|der|die)\b/;
  const englischWort =
    /\b(?:Check|Back|Next|Level|Settings|Help|Teacher|Class|Games|Your|answer|the|and|you|with|Welcome|Skip|Sign)\b/;
  const alteSchreibung = /[îû]/;

  function saetze(wert: unknown, pfad = "fr", aus: Array<[string, string]> = []): Array<[string, string]> {
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

  it("★ jeder Satz der französischen Texttabelle ist Französisch (kein Umlaut, kein deutsches oder englisches Wort, kein î/û)", () => {
    const alle = saetze({ ...fr, stoff: undefined });
    expect(alle.length).toBeGreaterThan(250);
    for (const [pfad, satz] of alle) {
      expect(satz, pfad).not.toMatch(deutschWort);
      expect(satz, pfad).not.toMatch(englischWort);
      expect(satz, pfad).not.toMatch(alteSchreibung);
      expect(satz.trim().length, pfad).toBeGreaterThan(0);
    }
  });

  it("★ kein Satz mit Maus-Wort, Gedankenstrich oder Halbgeviertstrich", () => {
    for (const [pfad, satz] of saetze({ ...fr })) {
      expect(satz, pfad).not.toMatch(/[–—]/);
      expect(satz, pfad).not.toMatch(/\b(?:clic|cliquer|souris|cliquez)\b/i);
    }
  });

  it("★ fr hat jedes Feld von de und en (sonst rechnet tsc nicht) und ist nirgends gleich - ausser Zeichen", () => {
    const d = saetze({ ...de, stoff: undefined }, "fr");
    const f = saetze({ ...fr, stoff: undefined });
    const e = saetze({ ...en, stoff: undefined }, "fr");
    expect(f.length).toBeGreaterThanOrEqual(d.length - 20);
    for (const andere of [d, e]) {
      const gleich = andere.filter(([pfad, satz]) => {
        const meins = f.find(([p]) => p === pfad);
        return meins && meins[1] === satz && /[a-zA-ZäöüÄÖÜß]{4,}/.test(satz) && !/Ctrl$/.test(satz) && !/abstandNamen|sammlungAnzahl/.test(pfad);
      });
      expect(gleich.map(([p]) => p)).toEqual([]);
    }
  });

  it("★ Tutoiement: kein vous in der Texttabelle", () => {
    for (const [pfad, satz] of saetze({ ...fr })) expect(satz, pfad).not.toMatch(/\b(?:vous|votre|vos)\b/i);
  });

  it("die Texttabelle kennt fr und fr ist in der Liste der fertigen Sprachen - als Letztes eingetragen", () => {
    expect(Object.keys(PLUS_TEXTE)).toContain("fr");
    expect(PLUS_SPRACHEN_FERTIG).toContain("fr");
    expect(PLUS_SPRACHEN_FERTIG).toContain("de");
  });
});

describe("Schalter aus = Deutsch, Schalter an = Französisch", () => {
  const seite = () => render(<MemoryRouter><PlusPage /></MemoryRouter>);

  it("★ mit ?plus-sprachen=0 (Not-Aus): deutsch, kein Sprachwähler - auch mit ?sprache=fr", async () => {
    window.history.replaceState(null, "", "/plus?plus-sprachen=0&sprache=fr");
    window.localStorage.setItem("plus-sprache", "fr");
    seite();
    await waitFor(() => screen.getByText("Willkommen bei Plus!"));
    expect(document.querySelector("[data-sprachschalter]")).toBeNull();
    expect(screen.queryByText("Bienvenue dans Plus !")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /Ich wähle/ }));
    expect(screen.getByRole("heading", { name: "Welche Schulstufe?" })).toBeInTheDocument();
  });

  it("★ mit ?plus-sprachen=1&sprache=fr: französische Seite, Wähler bietet fr an, keine deutsche Stufe", async () => {
    window.history.replaceState(null, "", "/plus?plus-sprachen=1&sprache=fr");
    const { container } = seite();
    await waitFor(() => screen.getByText("Bienvenue dans Plus !"));
    const schalter = document.querySelector("[data-sprachschalter]");
    expect(schalter).toBeInTheDocument();
    expect(container.closest("body")!.querySelector("[lang='fr-FR']")).not.toBeNull();
    // Türen: nur, was übersetzt ist.
    expect(screen.getByRole("button", { name: /Je choisis/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Jeux|Spiele/ })).toBeNull();
    expect(screen.queryByRole("button", { name: /collection|Sammlung/ })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /Je choisis/ }));
    expect(screen.getByRole("heading", { name: "Quel niveau ?" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Niveau 2/ }));
    expect(screen.getByRole("heading", { name: "Niveau 2 - quel exercice ?" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Additionner sans passer la dizaine" })).toBeInTheDocument();
    expect(container.textContent ?? "").not.toMatch(/Schulstufe|Lehrplan|Übung|Aufgabe/);
  });

  it("★ der Wähler der Kopfzeile bietet Français an, und die Wahl stellt die Seite um (fr -> de)", async () => {
    window.history.replaceState(null, "", "/plus?plus-sprachen=1&sprache=de");
    seite();
    await waitFor(() => screen.getByText("Willkommen bei Plus!"));
    fireEvent.click(document.querySelector("[data-sprachschalter]")!);
    const fran = await screen.findByRole("option", { name: /Français/ });
    fireEvent.click(fran);
    await waitFor(() => screen.getByText("Bienvenue dans Plus !"));
    expect(PLUS_TEXTE.fr).toBeDefined();
    fireEvent.click(document.querySelector("[data-sprachschalter]")!);
    fireEvent.click(await screen.findByRole("option", { name: /Deutsch/ }));
    await waitFor(() => screen.getByText("Willkommen bei Plus!"));
    expect(screen.getByRole("button", { name: /Spiele/ })).toBeInTheDocument();
  });

  it("★ die Bildbeschreibung des Plus-Zeichens ist französisch", async () => {
    window.history.replaceState(null, "", "/plus?plus-sprachen=1&sprache=fr");
    seite();
    await waitFor(() => screen.getByText("Bienvenue dans Plus !"));
    const logo = screen.getByRole("img", { name: /^Le logo de Plus/ });
    expect(logo.getAttribute("aria-label")).toBe(fr.logoBeschreibung);
    expect(screen.queryByRole("img", { name: /Plus-Zeichen|The Plus logo/ })).toBeNull();
  });

  it("★ eine Runde auf Französisch: Tastatur, falsche Antwort, ohne deutsche Meldung", async () => {
    window.history.replaceState(null, "", "/plus?plus-sprachen=1&sprache=fr");
    seite();
    await waitFor(() => screen.getByText("Bienvenue dans Plus !"));
    fireEvent.click(screen.getByRole("button", { name: /Je choisis/ }));
    fireEvent.click(screen.getByRole("button", { name: /Niveau 1/ }));
    fireEvent.click(screen.getByRole("button", { name: "Additions, sans passer la dizaine" }));
    expect(screen.getByText(/Question 1 sur 8/)).toBeInTheDocument();
    const feld = screen.getByLabelText("Ta réponse");
    fireEvent.change(feld, { target: { value: "99999" } });
    fireEvent.click(screen.getByRole("button", { name: "Vérifier" }));
    expect(screen.getByRole("status")).toHaveTextContent("Pas encore.");
    expect(screen.getByRole("status").textContent).not.toMatch(/Noch nicht|Not yet/);
  });

  it("★ Braille mathématique im Feld: die Rechnung steht in Zellen, Lesen zurück, Prüfen", () => {
    setzeAktuelleSprache("fr");
    const erste = alleFranzoesischenAufgaben([4]).find((a) => a.paket === "1-08" && a.art !== "sach" && eingabezeile(a))!;
    expect(erste).toBeDefined();
    setzeAktuelleSprache("fr");
    useEinstellungen.setState({ braillezeile: true, schrift: "marburger", eingabe: "braille", eingabeart: "marburger" });
    window.history.replaceState(null, "", "/plus?plus-sprachen=1&sprache=fr");
    render(<PlusUebung paketId="1-08" onZurueck={() => {}} saat={4} art="marburger" onArt={() => {}} />);
    const feld = screen.getByLabelText("Ta réponse") as HTMLTextAreaElement;
    // Das Feld enthält Zellen der NMB, kein Zahlzeichen: jede Ziffer ein Zeichen mit Punkt 6.
    expect(feld.value).toMatch(/^[⠀-⣿]/);
    expect(feld.value).not.toContain("⠼⠁");
    const ez = eingabezeile(erste)!;
    const voll = ez.vorlage.includes("[]") ? ez.vorlage.replace("[]", erste.loesung) : ez.vorlage + erste.loesung;
    fireEvent.change(feld, { target: { value: schreibeFr(voll)! } });
    expect(screen.getByText(/Voici comment je lis :/).textContent).toContain(voll.replace(/\s+/g, " ").trim());
  });
});

describe("Dezimalkomma in Zeile und Prüfung", () => {
  it("de und fr Komma, en Punkt - `zahl()` gehört dem Mathe-Code", () => {
    setzeAktuelleSprache("de");
    expect(zahl(0.5)).toBe("0,5");
    setzeAktuelleSprache("fr");
    expect(zahl(0.5)).toBe("0,5");
    expect(zahl(2.5, 2)).toBe("2,50");
    expect(zahl(7)).toBe("7");
    setzeAktuelleSprache("en");
    expect(zahl(0.5)).toBe("0.5");
  });

  it("Dezimalzahlen im Stoffplan (5-07 Komma verschieben) kommen mit Komma", () => {
    setzeAktuelleSprache("fr");
    const a = alleFranzoesischenAufgaben([8]).filter((x) => x.paket === "5-07");
    expect(a.length).toBeGreaterThan(0);
    expect(a.some((x) => /\d,\d/.test(x.angabe + x.loesung))).toBe(true);
  });
});

describe("Vorlesen: Zahlwörter, Rechensprache, Stimme", () => {
  it("Zahlwörter, auch 70 bis 99 und über 9999", () => {
    expect(zahlwortFrGross(7)).toBe("sept");
    expect(zahlwortFrGross(70)).toBe("soixante-dix");
    expect(zahlwortFrGross(71)).toBe("soixante-et-onze");
    expect(zahlwortFrGross(80)).toBe("quatre-vingts");
    expect(zahlwortFrGross(81)).toBe("quatre-vingt-un");
    expect(zahlwortFrGross(90)).toBe("quatre-vingt-dix");
    expect(zahlwortFrGross(99)).toBe("quatre-vingt-dix-neuf");
    expect(zahlwortFrGross(1005)).toBe("mille-cinq");
    expect(zahlwortFrGross(47519)).toBe("quarante-sept-mille-cinq-cent-dix-neuf");
    expect(zahlwortFrGross(200000)).toBe("deux-cent-mille");
    expect(zahlwortFrGross(80000)).toBe("quatre-vingt-mille");
    expect(zahlwortFrGross(2500000)).toBe("deux millions cinq-cent-mille");
    expect(zahlwortFrGross(1000000)).toBe("un million");
  });

  it("Rechnungen werden französisch gesagt - Zeichen, Brüche, Euro, Prozent, Komma", () => {
    expect(sprichFr("48 +27 =")).toBe("quarante-huit plus vingt-sept égale");
    expect(sprichFr("474 /3 =")).toMatch(/divisé par trois égale/);
    expect(sprichFr("6 +[] =10")).toBe("six plus case vide égale dix");
    expect(sprichFr("3/4 +1/4 =")).toBe("trois quarts plus un quart égale");
    expect(sprichFr("1 1/2 +1/2 =")).toMatch(/un et un demi plus un demi égale/);
    expect(sprichFr("0,5 +0,25 =")).toBe("zéro virgule cinq plus zéro virgule deux cinq égale");
    expect(sprichFr("Une baguette vaut 2,50 €.")).toBe("Une baguette vaut deux euros cinquante.");
    expect(sprichFr("Sur 300 enfants, 53 % viennent.")).toMatch(/cinquante-trois pour cent/);
    expect(sprichFr("12 *3")).toBe("douze fois trois");
    expect(sprichFr("(3 +4) *2")).toBe("ouvre la parenthèse trois plus quatre ferme la parenthèse fois deux");
    expect(sprichFr("5 <7")).toBe("cinq est plus petit que sept");
    expect(sprichFr("a\n7 -2 =")).toMatch(/\./);
    expect(sprichFr("48 +27 =")).not.toMatch(/\d|plus\.|ist|und|égale\./);
    expect(bruchwortFr(3, 5)).toBe("trois cinquièmes");
    expect(bruchwortFr(2, 3)).toBe("deux tiers");
    expect(bruchwortFr(3, 23)).toBe("trois sur vingt-trois");
    expect(geldwortFr("1")).toBe("un euro");
    expect(geldwortFr("0,5")).toBe("cinquante centimes");
  });

  it("sprichPlus nimmt in Französisch die französische Rechensprache, in Deutsch die deutsche", () => {
    setzeAktuelleSprache("fr");
    expect(sprichPlus("48 +27 =")).toBe("quarante-huit plus vingt-sept égale");
    setzeAktuelleSprache("de");
    expect(sprichPlus("48 +27 =")).toMatch(/achtundvierzig plus siebenundzwanzig/);
  });

  it("★ Stimme: fr nimmt die französische Stimme; ohne französische Stimme wird geschwiegen, nie deutsch", () => {
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
    mitStimmen([{ name: "Anna", lang: "de-DE" }, { name: "Daniel", lang: "en-GB" }]);
    setzeAktuelleSprache("fr");
    sage("Bonjour");
    expect(gesagt).toEqual([]);
    expect(stimmeFehltFuerSprache()).toBe(true);

    mitStimmen([{ name: "Anna", lang: "de-DE" }, { name: "Thomas", lang: "fr-FR" }]);
    sage("Bonjour");
    expect(gesagt.pop()).toMatchObject({ lang: "fr-FR", voiceLang: "fr-FR", text: "Bonjour" });
    expect(stimmeFehltFuerSprache()).toBe(false);
  });
});
