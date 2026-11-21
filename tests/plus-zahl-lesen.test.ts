/**
 * Plus - wie Zahlen aus dem Feld gelesen werden (Durchsicht 29.09.2026).
 *
 * Gemessen wurde:
 *  - „€ 1,56" (Geld vorne) galt als falsch, „1,56 €" als richtig.
 *  - Fermi las mit `Number()` nach Wegputzen aller Zeichen: „ca. 1200" wurde 0,12.
 *  - Heiß-Kalt las mit `Number()`: das leere Feld war der Versuch „0", „0x1F4" war 500.
 *  - Das Schatzgitter las mit `Number()`: „=21" und „10 +11 =21" galten nicht.
 *  - Zielzahl kannte „×", „·" und das Minus vom Mac nicht.
 *  - Satztrenner brachen nach „bis zum 80." um, die Stimme sagte „achtzig.".
 *
 * ★★ Die Wächter decken die KLASSEN: Geld vorne über JEDE Geld-Aufgabe aller
 * Pakete, Fermi über JEDE Frage, kein `Number()` an einer Kinder-Eingabe in
 * den Spielen, kein eigener Satztrenner neben `saetzeUmbrechen`.
 *
 * ⚠️ Bewusst NICHT hier (liegt bei Johannes): „1.500" (Tausenderpunkt - der
 * eine andere App der Plattform  liest es genauso als 1,5), „7 Euro 80", Spannen und umgerechnete
 * Einheiten bei Fermi, und ob Fermi die Einheit prüft.
 */
import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { istRichtig, pruefe, zufall, type Aufgabe } from "../src/lib/plus/aufgabe";
import { zahlUndEinheit } from "../src/lib/plus/antwortformen";
import { erzeugeLauf } from "../src/lib/plus/generator";
import { FERMI, fermiKern, fermiPakete } from "../src/lib/plus/generator/fermi";
import { PAKETE } from "../src/lib/plus/stoffplan";
import { leseVersuch, zaehltAlsVersuch, neuesHeissKaltSpiel } from "../src/lib/plus/spiele/heisskalt";
import { pruefeZug } from "../src/lib/plus/spiele/zielzahl";
import { saetzeUmbrechen, ordnungszahlenSprechen } from "../src/lib/sprechen/ordnungszahl";
import { sprich } from "../src/lib/sprechen/rechnen";

const ALLE: Aufgabe[] = PAKETE.flatMap((p) =>
  [11, 22, 33].flatMap((saat) => erzeugeLauf(p.id, { anzahl: 12, saat })),
);

/* ══ A · Geld vorne ═══════════════════════════════════════════════════════ */

describe("A - das Geld darf vorne stehen", () => {
  const geld = ALLE.filter((a) => !a.bereich && !a.passt && zahlUndEinheit(a.loesung)?.einheit === "euro");

  it("die Suche findet Geld-Aufgaben (Prüfgröße)", () => {
    expect(geld.length).toBeGreaterThan(20);
  });

  it("★★ jede Geld-Aufgabe nimmt „€ x\" und „EUR x\" an", () => {
    const falsch: string[] = [];
    for (const a of geld) {
      const zahl = zahlUndEinheit(a.loesung)!.zahl;
      for (const e of [`€ ${zahl}`, `€${zahl}`, `EUR ${zahl}`]) {
        if (!istRichtig(e, a)) falsch.push(`${a.paket} „${a.angabe}" - „${e}"`);
      }
    }
    expect(falsch).toEqual([]);
  });

  it("Gegenprobe: ein falscher Betrag bleibt falsch, auch mit € vorne", () => {
    for (const a of geld.slice(0, 40)) {
      const zahl = zahlUndEinheit(a.loesung)!.zahl;
      const daneben = String(Number(zahl.replace(",", ".")) + 1).replace(".", ",");
      expect(istRichtig(`€ ${daneben}`, a), `${a.paket}: € ${daneben}`).toBe(false);
    }
  });

  it("Gegenprobe: nur Geld darf vorne stehen - „cm 5\" ist keine Antwort", () => {
    expect(zahlUndEinheit("cm 5")).toBeNull();
  });
});

/* ══ B · Fermi liest wie jede andere Antwort ══════════════════════════════ */

describe("B - Fermi", () => {
  /** Jede Fermi-Frage einmal als Aufgabe (der Zufall wählt die Frage). */
  function alleFermi(): Aufgabe[] {
    const raus = new Map<string, Aufgabe>();
    const rng = zufall(29);
    for (const id of fermiPakete()) {
      for (let i = 0; raus.size < Object.values(FERMI).flat().length && i < 400; i++) {
        const k = fermiKern(id, rng);
        if (k.sorte !== "direkt") continue;
        raus.set(k.angabe, { paket: id, art: "ergebnis", ...k } as unknown as Aufgabe);
      }
    }
    return [...raus.values()];
  }
  const fermi = alleFermi();

  it("jede Frage kommt vor (Prüfgröße)", () => {
    expect(fermi.length).toBe(Object.values(FERMI).flat().length);
  });

  it("★★ „ca.\", „etwa\", „≈\" vor einer Schätzung im Bereich gelten", () => {
    const falsch: string[] = [];
    for (const a of fermi) {
      const [von, bis] = a.bereich!;
      const mitte = String((von + bis) / 2).replace(".", ",");
      for (const e of [mitte, `ca. ${mitte}`, `etwa ${mitte}`, `≈ ${mitte}`, `ungefähr ${mitte}`]) {
        if (pruefe(e, a).stand !== "richtig") falsch.push(`„${a.angabe}" - „${e}"`);
      }
    }
    expect(falsch).toEqual([]);
  });

  it("★ Geld vorne gilt auch bei Fermi", () => {
    const geld = fermi.filter((a) => /euro/i.test(a.loesung));
    expect(geld.length).toBeGreaterThan(0);
    for (const a of geld) {
      const mitte = String((a.bereich![0] + a.bereich![1]) / 2).replace(".", ",");
      expect(istRichtig(`€ ${mitte}`, a), a.angabe).toBe(true);
    }
  });

  it("Gegenprobe: eine Größenordnung daneben bleibt falsch - auch mit „ca.\"", () => {
    for (const a of fermi) {
      const [von, bis] = a.bereich!;
      expect(istRichtig(`ca. ${String(von / 10).replace(".", ",")}`, a), a.angabe).toBe(false);
      expect(istRichtig(`ca. ${String(bis * 10).replace(".", ",")}`, a), a.angabe).toBe(false);
    }
  });
});

/* ══ C · Kein `Number()` an einer Kinder-Eingabe in den Spielen ═══════════ */

describe("C - die Spiele lesen Zahlen wie jede Plus-Antwort", () => {
  function quellen(dir: string, raus: string[] = []): string[] {
    for (const name of readdirSync(dir)) {
      const p = join(dir, name);
      if (statSync(p).isDirectory()) quellen(p, raus);
      else if (/\.tsx?$/.test(name)) raus.push(p);
    }
    return raus;
  }

  it("★★ nirgends `Number(eingabe…)` in Plus-Seiten und -Spielen", () => {
    const funde = [...quellen("src/components/plus"), ...quellen("src/lib/plus/spiele")].flatMap((p) =>
      readFileSync(p, "utf-8")
        .split("\n")
        .map((z, i) => ({ z, i }))
        .filter(({ z }) => /Number\([^)]*\beingabe\b/.test(z) && !/^\s*(\*|\/\/)/.test(z))
        .map(({ i }) => `${p}:${i + 1}`),
    );
    expect(funde).toEqual([]);
  });

  it("★ Heiß-Kalt: ein leeres Feld ist kein Versuch, „0x1F4\" keine Zahl", () => {
    const spiel = neuesHeissKaltSpiel(zufall(1), 3);
    for (const e of ["", "   ", "0x1F4", "1e2", "abc"]) {
      expect(leseVersuch(e), JSON.stringify(e)).toBeNull();
      expect(zaehltAlsVersuch(spiel, leseVersuch(e))).toBe(false);
    }
    expect(leseVersuch("50")).toBe(50);
    expect(zaehltAlsVersuch(spiel, spiel.von)).toBe(true);
    // Gegenprobe: außerhalb des Bereichs ist kein Raten.
    expect(zaehltAlsVersuch(spiel, spiel.bis + 1)).toBe(false);
  });

  it("★ Zielzahl: Malkreuz, Malpunkt und das Minus vom Mac", () => {
    for (const z of ["3 × 4 = 12", "3 · 4 = 12", "3 *4 =12"]) {
      expect(pruefeZug(z, [3, 4, 5]), z).toHaveProperty("zug");
    }
    expect(pruefeZug("5 – 1 =4", [5, 1]), "5 – 1 =4").toHaveProperty("zug");
    // Gegenprobe: eine falsche Rechnung bleibt ein Fehler.
    expect(pruefeZug("3 × 4 = 13", [3, 4])).toHaveProperty("fehler");
  });
});

/* ══ D · Ordnungszahlen: ein Satztrenner, eine Stimme ═════════════════════ */

describe("D - Ordnungszahlen", () => {
  it("★★ kein eigener Satztrenner neben `saetzeUmbrechen`", () => {
    const funde: string[] = [];
    for (const wurzel of ["src/lib/plus", "src/components/plus"]) {
      const gehe = (dir: string) => {
        for (const name of readdirSync(dir)) {
          const p = join(dir, name);
          if (statSync(p).isDirectory()) gehe(p);
          else if (/\.tsx?$/.test(name) && readFileSync(p, "utf-8").includes("(?<=[.?!]) +/g")) funde.push(p);
        }
      };
      gehe(wurzel);
    }
    expect(funde).toEqual([]);
  });

  it("★★ keine Angabe aller Pakete bricht nach einer Ordnungszahl um", () => {
    const nachArtikel = /\b(?:der|die|das|dem|den|des|zum|zur|am|im|vom|beim|ins|ans) \d+\.$/i;
    const funde = ALLE.flatMap((a) =>
      a.angabe.split("\n").filter((z) => nachArtikel.test(z.trim())).map((z) => `${a.paket}: „${z}"`),
    );
    expect(funde).toEqual([]);
  });

  it("★ die Stimme sagt die Ordnungszahl", () => {
    expect(sprich(saetzeUmbrechen("Ein Handy hält 2 Jahre. Wie viele bis zum 80. Jahr?"))).toBe(
      "Ein Handy hält zwei Jahre. Wie viele bis zum achtzigsten Jahr?",
    );
    expect(ordnungszahlenSprechen("Der 3. Platz")).toBe("Der dritte Platz");
    expect(ordnungszahlenSprechen("in der 8. Klasse")).toBe("in der achten Klasse");
    expect(ordnungszahlenSprechen("am 1. Tag")).toBe("am ersten Tag");
  });

  it("Gegenprobe: eine Grundzahl am Satzende bleibt Grundzahl und bricht um", () => {
    const t = "Zusammen sind sie 17. Wie alt ist Mia?";
    expect(saetzeUmbrechen(t)).toBe("Zusammen sind sie 17.\nWie alt ist Mia?");
    expect(sprich(saetzeUmbrechen(t))).toBe("Zusammen sind sie siebzehn. Wie alt ist Mia?");
  });
});
