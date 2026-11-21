/**
 * Land/Region in Plus (10.11.2026) - Spanisch und Französisch.
 *
 * Grundlage: RECHERCHE-2026-11-10-PLUS-ES-LAENDER.md und ...-FR-LAENDER.md.
 * Gemessen wird:
 *  1. die Vorgabe aus der Browser-Sprache (navigator.languages) - und warum fr-CH huitante ist,
 *  2. die gespeicherte Wahl geht vor der Vorgabe; alte Stände ohne das Feld laufen weiter,
 *  3. Währung, Cent-Wort und die fünf Wörter in den Rechengeschichten je Region,
 *  4. Zahlwörter beim Vorlesen: 70, 80, 90 je Region (septante, huitante, nonante ...),
 *  5. die Stimme: es-ES/es-MX, fr-FR/fr-BE/fr-CH/fr-CA, mit Rückfall auf irgendeine Stimme der Sprache,
 *  6. das Feld "Land/Region" - nur in es und fr, Menü mit Erklärung, nie gesperrt,
 *  7. Spanisch: ein Tausenderpunkt wird nicht stillschweigend nur als Dezimalzahl gelesen,
 *  8. de und en bleiben, wie sie sind (kein Feld, keine Region).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { PlusPage } from "../src/features/public/PlusPage";
import { PlusEinstellungen } from "../src/components/plus/PlusEinstellungen";
import { aktuelleRegion, useEinstellungen } from "../src/lib/plus/einstellungen";
import { backendZuruecksetzen } from "../src/lib/plus/fortschritt";
import { useTypingAuth } from "../src/components/typing/useTypingAuth";
import { setzeAktuelleSprache } from "../src/lib/plus/aktuelleSprache";
import { pruefe, zufall, type Aufgabe } from "../src/lib/plus/aufgabe";
import { REGIONEN, regionalerText, vorgabeRegion, zaehlweiseFuer, type PlusRegion } from "../src/lib/plus/regionen";
import { sprichPlus } from "../src/lib/plus/sprich";
import { sage, stimmeFehltFuerSprache } from "../src/lib/plus/stimme";
import { plusTexte } from "../src/lib/plus/sprache";
import { sachKern, SACHAUFGABEN } from "../src/lib/plus/generator/sachaufgaben";
import { SACHAUFGABEN_ES } from "../src/lib/plus/generator/sachaufgabenEs";
import { SACHAUFGABEN_FR } from "../src/lib/plus/generator/sachaufgabenFr";
import { zahlwortFr } from "../src/lib/typing/zahlwort";
import { zahlwortFrGross } from "../src/lib/sprechen/rechnenFr";
import { de } from "../src/lib/plus/texte/de";
import { en } from "../src/lib/plus/texte/en";
import { es } from "../src/lib/plus/texte/es";
import { fr } from "../src/lib/plus/texte/fr";

function browserSprachen(liste: string[] | null) {
  if (liste === null) delete (window.navigator as unknown as Record<string, unknown>).languages;
  else Object.defineProperty(window.navigator, "languages", { configurable: true, value: liste });
}

beforeEach(() => {
  window.localStorage.clear();
  window.history.replaceState(null, "", "/plus");
  useTypingAuth.setState({ account: null });
  backendZuruecksetzen();
  useEinstellungen.setState({ braillezeile: false, schrift: "computer", eingabe: "tastatur", eingabeart: "normal", region: {} });
  browserSprachen(["de-AT", "de"]);
  setzeAktuelleSprache("de");
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  browserSprachen(null);
  setzeAktuelleSprache("de");
});

const waehle = (sprache: "es" | "fr", region: PlusRegion) => {
  setzeAktuelleSprache(sprache);
  useEinstellungen.getState().setRegion(sprache, region);
};

describe("1. Die Vorgabe aus der Browser-Sprache", () => {
  const es: Array<[string[], PlusRegion]> = [
    [["es-ES"], "es"], [["es"], "es"], [["es-ES", "en"], "es"],
    [["es-MX"], "latam"], [["es-AR"], "latam"], [["es-CO"], "latam"], [["es-CL"], "latam"],
    [["es-PE"], "latam"], [["es-419"], "latam"], [["es-US"], "latam"], [["en-US", "es-MX"], "latam"],
    [["de-AT"], "es"], [[], "es"],
  ];
  it.each(es)("es: %j => %s", (liste, soll) => {
    expect(vorgabeRegion("es", liste)).toBe(soll);
  });

  const fr: Array<[string[], PlusRegion]> = [
    [["fr-FR"], "fr"], [["fr"], "fr"], [["fr-BE"], "be"], [["fr-CA"], "ca"], [["fr_CA"], "ca"],
    [["fr-CH"], "ch-huitante"], [["fr-LU"], "fr"], [["fr-MC"], "fr"], [["en", "fr-BE"], "be"],
    [["de-AT"], "fr"], [[], "fr"],
  ];
  it.each(fr)("fr: %j => %s", (liste, soll) => {
    expect(vorgabeRegion("fr", liste)).toBe(soll);
  });

  it("★ fr-CH ist huitante (mehrheitlich VD, VS, FR; wie Tastenflow) - die Begründung steht im Code", () => {
    expect(zaehlweiseFuer(vorgabeRegion("fr", ["fr-CH"]))).toBe("fr-CH");
    expect(zahlwortFr(80, zaehlweiseFuer(vorgabeRegion("fr", ["fr-CH"])))).toBe("huitante");
  });

  it("★ die Vorgabe kommt aus navigator.languages, wenn nichts gewählt ist", () => {
    browserSprachen(["es-MX", "es"]);
    setzeAktuelleSprache("es");
    expect(aktuelleRegion()).toBe("latam");
    browserSprachen(["fr-BE"]);
    setzeAktuelleSprache("fr");
    expect(aktuelleRegion()).toBe("be");
  });

  it("de und en haben keine Region", () => {
    browserSprachen(["es-MX", "fr-BE"]);
    setzeAktuelleSprache("de");
    expect(aktuelleRegion()).toBeNull();
    setzeAktuelleSprache("en");
    expect(aktuelleRegion()).toBeNull();
  });
});

describe("2. Die Wahl des Kindes geht vor - und alte Stände laufen weiter", () => {
  it("★ die gespeicherte Wahl schlägt die Vorgabe", () => {
    browserSprachen(["es-MX"]);
    waehle("es", "es");
    expect(aktuelleRegion()).toBe("es");
    browserSprachen(["fr-CA"]);
    waehle("fr", "ch-quatre-vingts");
    expect(aktuelleRegion()).toBe("ch-quatre-vingts");
  });

  it("die Wahl gilt je Sprache und steht im Speicher des Geräts", () => {
    waehle("es", "latam");
    waehle("fr", "be");
    const gespeichert = JSON.parse(window.localStorage.getItem("plus_einstellungen")!);
    expect(gespeichert.region).toEqual({ es: "latam", fr: "be" });
    setzeAktuelleSprache("es");
    expect(aktuelleRegion()).toBe("latam");
  });

  it("eine Region einer anderen Sprache wird nicht angenommen", () => {
    setzeAktuelleSprache("es");
    useEinstellungen.getState().setRegion("es", "be");
    expect(useEinstellungen.getState().region.es).toBeUndefined();
  });

  it("★ Migration: ein alter Stand ohne das Feld gilt weiter, die Region ist die Vorgabe - und wird nicht umgeschrieben", async () => {
    window.localStorage.setItem("plus_einstellungen", JSON.stringify({ braillezeile: true, schrift: "marburger", breite: 80, zoomIndex: 2 }));
    vi.resetModules();
    const frisch = await import("../src/lib/plus/einstellungen");
    const sprache = await import("../src/lib/plus/aktuelleSprache");
    const s = frisch.useEinstellungen.getState();
    expect(s.braillezeile).toBe(true);
    expect(s.schrift).toBe("marburger");
    expect(s.breite).toBe(80);
    expect(s.region).toEqual({});
    browserSprachen(["es-AR"]);
    sprache.setzeAktuelleSprache("es");
    expect(frisch.aktuelleRegion()).toBe("latam");
    // Eine andere Einstellung ändern: das Feld `region` kommt nicht ungefragt in den Speicher.
    frisch.useEinstellungen.getState().setBreite(40);
    expect(JSON.parse(window.localStorage.getItem("plus_einstellungen")!)).not.toHaveProperty("region");
  });

  it("★ Migration: ein kaputtes Feld wird geheilt (nur gültige Regionen je Sprache)", async () => {
    window.localStorage.setItem("plus_einstellungen", JSON.stringify({ region: { es: "mars", fr: "be", de: "x" } }));
    vi.resetModules();
    const frisch = await import("../src/lib/plus/einstellungen");
    expect(frisch.useEinstellungen.getState().region).toEqual({ fr: "be" });
  });
});

describe("3. Währung, Cent-Wort und Wörter in den Rechengeschichten", () => {
  const ALLE_ES = Object.values(SACHAUFGABEN_ES).flat().map((v) => v.text);
  const ALLE_FR = Object.values(SACHAUFGABEN_FR).flat().map((v) => v.text);

  it("★ es (Spanien): nichts ändert sich - Byte für Byte", () => {
    for (const t of ALLE_ES) expect(regionalerText(t, "es")).toBe(t);
    for (const t of ALLE_FR) {
      expect(regionalerText(t, "fr")).toBe(t);
      expect(regionalerText(t, "be")).toBe(t);
    }
    expect(regionalerText("Un coche cuesta 5 euros.", null)).toBe("Un coche cuesta 5 euros.");
  });

  it("★ latam: pesos und centavos, carro, celular, jugo, papas - in JEDER Vorlage", () => {
    const aus = ALLE_ES.map((t) => regionalerText(t, "latam")).join("\n");
    expect(aus).not.toMatch(/euro|céntimo|coche|móvil|zumo|patata|ordenador/i);
    expect(aus).toContain("pesos");
    expect(aus).toContain("centavos");
    expect(aus).toContain("carro");
    expect(aus).toContain("celular");
    expect(aus).toContain("jugo");
    expect(aus).toContain("papas");
    // Nur diese Wörter ändern sich: sonst ist der Text gleich.
    const gleich = ALLE_ES.filter((t) => !/euro|céntimo|coche|móvil|zumo|patata|ordenador/i.test(t));
    expect(gleich.length).toBeGreaterThan(10);
    for (const t of gleich) expect(regionalerText(t, "latam")).toBe(t);
  });

  it("latam: Einzelfälle (Einzahl, Grossschreibung, Zahl bleibt)", () => {
    expect(regionalerText("Un euro y 50 céntimos. Coche rojo, dos coches.", "latam"))
      .toBe("Un peso y 50 centavos. Carro rojo, dos carros.");
    expect(regionalerText("Una bolsa de patatas pesa {b},{c} kilos.", "latam")).toBe("Una bolsa de papas pesa {b},{c} kilos.");
  });

  it("★ ch (beide Einträge): francs und centimes - kein Euro, kein €, 'd'euros' wird 'de francs'", () => {
    for (const region of ["ch-huitante", "ch-quatre-vingts"] as const) {
      const aus = ALLE_FR.map((t) => regionalerText(t, region)).join("\n");
      expect(aus, region).not.toMatch(/€|euro/i);
      expect(aus, region).toContain("francs");
      expect(aus, region).toContain("Combien de francs");
      expect(aus, region).toContain("centimes");
    }
    expect(regionalerText("Une baguette vaut {b},{c} €. Combien d'euros en tout ?", "ch-huitante"))
      .toBe("Une baguette vaut {b},{c} francs. Combien de francs en tout ?");
  });

  it("★ ca (Québec): dollars und cents - kein Euro, kein €, kein centime", () => {
    const aus = ALLE_FR.map((t) => regionalerText(t, "ca")).join("\n");
    expect(aus).not.toMatch(/€|euro|centime/i);
    expect(aus).toContain("dollars");
    expect(aus).toContain("cents");
    expect(regionalerText("{n} a {a} centimes. Combien de centimes ?", "ca")).toBe("{n} a {a} cents. Combien de cents ?");
  });

  it("★ der Generator benutzt die Region: eine fertige Geschichte (Stufe 5, viele Saaten)", () => {
    const geld = (sprache: "es" | "fr", region: PlusRegion, paket: string) => {
      waehle(sprache, region);
      const texte: string[] = [];
      for (let s = 1; s <= 80; s++) texte.push(sachKern(paket, zufall(s * 17)).angabe);
      return texte.join("\n");
    };
    const latam = geld("es", "latam", "5-19");
    expect(latam).not.toMatch(/euro|céntimo|coche|móvil|zumo|patata/i);
    expect(latam).toMatch(/pesos/);
    const ch = geld("fr", "ch-huitante", "5-19");
    expect(ch).not.toMatch(/€|euro/);
    expect(ch).toMatch(/francs/);
    const ca = geld("fr", "ca", "5-19");
    expect(ca).not.toMatch(/€|euro/);
    expect(ca).toMatch(/dollars/);
    const franz = geld("fr", "fr", "5-19");
    expect(franz).toMatch(/€/);
  });

  it("jede deutsche Vorlage bleibt unverändert (de kennt keine Region)", () => {
    setzeAktuelleSprache("de");
    useEinstellungen.setState({ region: { es: "latam", fr: "ca" } });
    const a = sachKern("5-19", zufall(5)).angabe;
    useEinstellungen.setState({ region: {} });
    expect(sachKern("5-19", zufall(5)).angabe).toBe(a);
    expect(Object.keys(SACHAUFGABEN).length).toBeGreaterThan(5);
  });

  it("★ Latinoamérica: auch die Oberflächen-Texte sagen 'computadora', nicht 'ordenador'; Spanien bleibt", () => {
    setzeAktuelleSprache("es");
    expect(JSON.stringify(plusTexte())).toContain("Braille de ordenador");
    expect(plusTexte()).toBe(es);                                  // dasselbe Objekt, nichts kopiert
    waehle("es", "latam");
    const t = plusTexte();
    expect(t.einstellungen.schriftNamen.computer).toBe("Braille de computadora (8 puntos)");
    expect(JSON.stringify(t)).not.toMatch(/ordenador/i);
    expect(t.einstellungen.schriftErkl("computer", "tastatur")).toMatch(/braille de computadora/);
  });
});

describe("4. Zahlwörter beim Vorlesen", () => {
  const sag = (region: PlusRegion) => { waehle("fr", region); return sprichPlus("70 +80 +90 ="); };

  it("★ 70 / 80 / 90 je Region", () => {
    expect(sag("fr")).toBe("soixante-dix plus quatre-vingts plus quatre-vingt-dix égale");
    expect(sag("ca")).toBe("soixante-dix plus quatre-vingts plus quatre-vingt-dix égale");
    expect(sag("be")).toBe("septante plus quatre-vingts plus nonante égale");
    expect(sag("ch-huitante")).toBe("septante plus huitante plus nonante égale");
    expect(sag("ch-quatre-vingts")).toBe("septante plus quatre-vingts plus nonante égale");
  });

  it("huitante gilt NUR in ch-huitante, nonante in be und ch, soixante-dix in fr und ca", () => {
    const aus = (r: PlusRegion) => sag(r);
    expect(aus("ch-huitante")).toMatch(/huitante/);
    for (const r of ["fr", "be", "ch-quatre-vingts", "ca"] as const) expect(aus(r), r).not.toMatch(/huitante/);
    for (const r of ["be", "ch-huitante", "ch-quatre-vingts"] as const) { expect(aus(r), r).toMatch(/nonante/); expect(aus(r), r).toMatch(/septante/); }
    for (const r of ["fr", "ca"] as const) { expect(aus(r), r).toMatch(/soixante-dix/); expect(aus(r), r).not.toMatch(/septante|nonante/); }
  });

  it("die ganze Zahl: 71, 81, 91, 99 und die Tausender", () => {
    waehle("fr", "ch-quatre-vingts");
    expect(sprichPlus("71 81 91 99")).toBe("septante-et-un quatre-vingt-un nonante-et-un nonante-neuf");
    expect(sprichPlus("80000 +85")).toBe("quatre-vingt-mille plus quatre-vingt-cinq");
    waehle("fr", "ch-huitante");
    expect(sprichPlus("80000 +85")).toBe("huitante-mille plus huitante-cinq");
    expect(sprichPlus("0,75 +3/4")).toBe("zéro virgule sept cinq plus trois quarts");
    waehle("fr", "be");
    expect(sprichPlus("1/70")).toBe("un sur septante");
    expect(sprichPlus("90 %")).toBe("nonante pour cent");
  });

  it("★ Tastenflow bleibt Byte-gleich: fr-FR, fr-BE, fr-CH, fr-CA wie zuvor; fr-CH ist weiter immer huitante", () => {
    expect(zahlwortFr(80, "fr-CH")).toBe("huitante");
    expect(zahlwortFr(88, "fr-CH")).toBe("huitante-huit");
    expect(zahlwortFr(70, "fr-FR")).toBe("soixante-dix");
    expect(zahlwortFr(97, "fr-CA")).toBe("quatre-vingt-dix-sept");
    expect(zahlwortFr(81, "fr-BE")).toBe("quatre-vingt-un");
    expect(zahlwortFr(99, "fr-BE")).toBe("nonante-neuf");
    // die neue Zählweise ist BE-gleich in allen Zahlen
    for (let n = 0; n < 10000; n += 1) expect(zahlwortFr(n, "fr-CH-quatre-vingts"), String(n)).toBe(zahlwortFr(n, "fr-BE"));
    expect(zahlwortFrGross(80000)).toBe("quatre-vingt-mille");
  });

  it("Geld als Wort wird gesprochen: francs, dollars, pesos", () => {
    waehle("fr", "ch-huitante");
    expect(sprichPlus("Un livre vaut 2,50 francs.")).toBe("Un livre vaut deux francs cinquante.");
    expect(sprichPlus("Il a 80 francs.")).toBe("Il a huitante francs.");
    waehle("fr", "ca");
    expect(sprichPlus("Un livre vaut 2,50 dollars.")).toBe("Un livre vaut deux dollars cinquante.");
    waehle("fr", "fr");
    expect(sprichPlus("Un livre vaut 2,50 €.")).toBe("Un livre vaut deux euros cinquante.");
    setzeAktuelleSprache("es");
    expect(sprichPlus("Un libro cuesta 2,50 pesos.")).toBe("Un libro cuesta dos pesos con cincuenta.");
    expect(sprichPlus("Un libro cuesta 2,50 euros.")).toBe("Un libro cuesta dos euros con cincuenta.");
  });
});

describe("5. Die Stimme", () => {
  const gesagt: Array<{ lang: string; text: string }> = [];
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
        speak: (u: Aeusserung) => gesagt.push({ lang: u.voice?.lang ?? u.lang, text: u.text }),
      },
    });
  };
  const ALLE = [
    { name: "Anna", lang: "de-DE" },
    { name: "Mónica", lang: "es-ES" }, { name: "Paulina", lang: "es-MX" },
    { name: "Amélie", lang: "fr-FR" }, { name: "Sophie", lang: "fr-BE" },
    { name: "Léa", lang: "fr-CH" }, { name: "Chantal", lang: "fr-CA" },
  ];
  beforeEach(() => { gesagt.length = 0; });

  it.each([
    ["es", "es", "es-ES"], ["es", "latam", "es-MX"],
    ["fr", "fr", "fr-FR"], ["fr", "be", "fr-BE"], ["fr", "ch-huitante", "fr-CH"],
    ["fr", "ch-quatre-vingts", "fr-CH"], ["fr", "ca", "fr-CA"],
  ] as const)("%s / %s => %s", (sprache, region, kennung) => {
    mitStimmen(ALLE);
    waehle(sprache, region);
    sage("Hola");
    expect(gesagt.pop()).toMatchObject({ lang: kennung });
  });

  it("★ Rückfall: fehlt die Stimme des Landes, gilt irgendeine Stimme der Sprache - nie eine fremde", () => {
    mitStimmen([{ name: "Anna", lang: "de-DE" }, { name: "Mónica", lang: "es-ES" }, { name: "Amélie", lang: "fr-FR" }]);
    waehle("es", "latam");
    sage("Hola");
    expect(gesagt.pop()).toMatchObject({ lang: "es-ES" });
    expect(stimmeFehltFuerSprache()).toBe(false);
    waehle("fr", "ca");
    sage("Salut");
    expect(gesagt.pop()).toMatchObject({ lang: "fr-FR" });
    mitStimmen([{ name: "Anna", lang: "de-DE" }]);
    sage("Salut");
    expect(gesagt).toEqual([]);
    expect(stimmeFehltFuerSprache()).toBe(true);
  });

  it("de bleibt de-AT", () => {
    mitStimmen(ALLE);
    setzeAktuelleSprache("de");
    sage("Hallo");
    expect(gesagt.pop()).toMatchObject({ lang: "de-AT" });
  });
});

describe("6. Das Feld Land/Region", () => {
  const basis = {
    braillezeile: false, onBraillezeile: () => {}, schrift: "computer" as const, onSchrift: () => {},
    breite: 40 as const, onBreite: () => {}, eingabe: "tastatur" as const, zoomIndex: 0, onZoomIndex: () => {},
    zeichenabstand: 1 as never, onZeichenabstand: () => {}, ausschreiben: false, onAusschreiben: () => {},
  };

  it("★ es: zwei Einträge, Menü mit sichtbarer Erklärung, nie gesperrt, Wahl wird gemeldet", () => {
    setzeAktuelleSprache("es");
    const onRegion = vi.fn();
    render(<PlusEinstellungen {...basis} region="es" onRegion={onRegion} />);
    const menue = screen.getByRole("combobox", { name: "País o región" });
    expect(menue).toBeEnabled();
    expect(menue).toHaveAttribute("data-kuerzel", "an");
    expect(document.getElementById(menue.getAttribute("aria-describedby")!)!.textContent).toBe(es.einstellungen.regionErkl);
    expect(within(menue).getAllByRole("option").map((o) => o.textContent)).toEqual([
      es.einstellungen.regionNamen.es, es.einstellungen.regionNamen.latam,
    ]);
    expect((menue as HTMLSelectElement).value).toBe("es");
    fireEvent.change(menue, { target: { value: "latam" } });
    expect(onRegion).toHaveBeenCalledWith("latam");
  });

  it("★ fr: fünf Einträge; die zwei Schweizer Einträge sind klar beschriftet", () => {
    setzeAktuelleSprache("fr");
    const onRegion = vi.fn();
    render(<PlusEinstellungen {...basis} region="ch-huitante" onRegion={onRegion} />);
    const menue = screen.getByRole("combobox", { name: "Pays ou région" }) as HTMLSelectElement;
    expect(menue).toBeEnabled();
    const optionen = within(menue).getAllByRole("option");
    expect(optionen.map((o) => (o as HTMLOptionElement).value)).toEqual([...REGIONEN.fr]);
    const namen = optionen.map((o) => o.textContent ?? "");
    expect(namen.filter((n) => /Suisse/.test(n))).toHaveLength(2);
    expect(namen.find((n) => /huitante/.test(n))).toMatch(/Vaud, Valais, Fribourg/);
    expect(namen.find((n) => /Genève/.test(n))).toMatch(/quatre-vingts/);
    expect(menue.value).toBe("ch-huitante");
    fireEvent.change(menue, { target: { value: "ch-quatre-vingts" } });
    expect(onRegion).toHaveBeenCalledWith("ch-quatre-vingts");
  });

  it("★ de und en: das Feld steht nicht da - auch wenn jemand eine Region mitgibt", () => {
    for (const sprache of ["de", "en"] as const) {
      setzeAktuelleSprache(sprache);
      const { container, unmount } = render(<PlusEinstellungen {...basis} region="latam" onRegion={() => {}} />);
      expect(screen.queryByRole("combobox", { name: /^(Land|Country)$/ }), sprache).toBeNull();
      expect(container.textContent, sprache).not.toMatch(/Lateinamerika|Latin America|pesos/);
      unmount();
    }
  });

  it("ohne Region (Probe-Schalter aus) kein Feld", () => {
    setzeAktuelleSprache("es");
    render(<PlusEinstellungen {...basis} />);
    expect(screen.queryByRole("combobox", { name: "País o región" })).toBeNull();
  });

  it("de und en tragen die Texte (der Typ bleibt vollständig)", () => {
    for (const t of [de, en, es, fr]) {
      expect(t.einstellungen.region.length).toBeGreaterThan(2);
      expect(t.einstellungen.regionErkl.length).toBeGreaterThan(20);
      for (const r of [...REGIONEN.es, ...REGIONEN.fr]) expect(t.einstellungen.regionNamen[r].length, r).toBeGreaterThan(3);
    }
  });

  it("★ in der Seite: das Fenster Ajustes zeigt das Feld, die Wahl bleibt im Speicher", async () => {
    window.history.replaceState(null, "", "/plus?plus-sprachen=1&sprache=es");
    browserSprachen(["es-ES"]);
    render(<MemoryRouter><PlusPage /></MemoryRouter>);
    await waitFor(() => screen.getByText("¡Te damos la bienvenida a Plus!"));
    fireEvent.click(screen.getByRole("button", { name: /^Configuración/ }));
    const fenster = screen.getByRole("dialog", { name: "Ajustes" });
    const menue = within(fenster).getByRole("combobox", { name: "País o región" }) as HTMLSelectElement;
    expect(menue.value).toBe("es");
    fireEvent.change(menue, { target: { value: "latam" } });
    expect((within(fenster).getByRole("combobox", { name: "País o región" }) as HTMLSelectElement).value).toBe("latam");
    expect(JSON.parse(window.localStorage.getItem("plus_einstellungen")!).region).toEqual({ es: "latam" });
    expect(aktuelleRegion()).toBe("latam");
  });

  it("★ in der Seite, deutsch: kein Feld", async () => {
    render(<MemoryRouter><PlusPage /></MemoryRouter>);
    await waitFor(() => screen.getByText("Willkommen bei Plus!"));
    fireEvent.click(screen.getByRole("button", { name: /^Einstellungen/ }));
    const fenster = screen.getByRole("dialog", { name: "Einstellungen" });
    expect(within(fenster).queryByRole("combobox", { name: "Land" })).toBeNull();
    expect(within(fenster).queryByText(/Lateinamerika|Spanien/)).toBeNull();
  });
});

describe("7. Spanisch: der Tausenderpunkt", () => {
  const aufgabe = (loesung: string): Aufgabe => ({
    paket: "4-01", art: "normal", op: "plus", angabe: "500 +750 =", loesung, zahlen: [500, 750],
  } as unknown as Aufgabe);

  it("★ es: 1.250 gilt als 1250 UND bleibt 1,25 - beide Lesarten sind richtig, wenn eine trifft", () => {
    setzeAktuelleSprache("es");
    expect(pruefe("1.250", aufgabe("1250")).stand).toBe("richtig");        // Chile, Kolumbien, Argentinien
    expect(pruefe("12.500", aufgabe("12500")).stand).toBe("richtig");
    expect(pruefe("1.250", aufgabe("1,25")).stand).toBe("richtig");        // Mexiko: eins Komma zwei fünf
    expect(pruefe("1.250", aufgabe("1300")).stand).toBe("falsch");
    expect(pruefe("1.234.567", aufgabe("1234567")).stand).toBe("richtig");
  });

  it("es: Dezimalpunkt und -komma wie bisher; keine Lesart für 0.125, 1.25 und 12.3456", () => {
    setzeAktuelleSprache("es");
    expect(pruefe("0.125", aufgabe("0,125")).stand).toBe("richtig");
    expect(pruefe("0.125", aufgabe("125")).stand).toBe("falsch");
    expect(pruefe("1.25", aufgabe("1,25")).stand).toBe("richtig");
    expect(pruefe("1.25", aufgabe("125")).stand).toBe("falsch");
    expect(pruefe("1,250", aufgabe("1250")).stand).toBe("falsch");
  });

  it("★ de, en, fr: unverändert (kein Tausenderpunkt-Lesart)", () => {
    for (const sprache of ["de", "en", "fr"] as const) {
      setzeAktuelleSprache(sprache);
      expect(pruefe("1.250", aufgabe("1250")).stand, sprache).toBe("falsch");
      expect(pruefe("1.250", aufgabe("1,25")).stand, sprache).toBe("richtig");
    }
  });
});
