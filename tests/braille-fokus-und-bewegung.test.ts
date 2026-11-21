/**
 * ★★★ Punktgenau: Fokus, Kürzel und Bewegung - die Fehlerklassen vom 29.09.2026
 * ============================================================================
 * Eine Durchsicht fand vier Dinge; alle vier sind am Quelltext gemessen worden,
 * bevor etwas geändert wurde:
 *
 * 1. Die Antwortfelder trugen kein `data-kuerzel="an"` - beim Lesen waren alle
 *    Seiten-Kürzel tot (Alt + W, Z, P, V, 1-5 …), weil der Fokus dort IMMER
 *    in einem Feld steht. Verhalten am echten Bildschirm:
 *    `tests/punktgenau-kuerzel-und-ergebnis-am-fokus.test.tsx`.
 * 2. Nach dem Prüfen stand das Ergebnis nur in einer Statusfläche, nicht am
 *    Knopf, der den Fokus bekommt.
 * 3. Alt + Z scrollte mit `behavior: "smooth"` - trotz „weniger Bewegung".
 * 4. Die Fokusanzeige der Runden-Striche war 2 px, die der Übungskarten 4 px;
 *    Plattform-Standard sind 4,5 px (`index.css`).
 *
 * Jeder Block prüft die KLASSE über das ganze Punktgenau-Revier, nicht die
 * reparierte Zeile, und hat eine Gegenprobe gegen den alten Wortlaut.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  duenneFokusanzeige,
  fokusBreite,
  fokusNurRandfarbe,
  pruefe,
  quelldateien,
  weichesScrollen,
  zeige,
} from "./helfer/fokusUndBewegung";
import { gehoertDemFeld, istSchreibzeichen } from "@/lib/braille/kuerzelImFeld";

const WURZEL = join(__dirname, "..");
/** Das Revier laut `apps/punktgenau/CLAUDE.md`. */
const REVIER = quelldateien(WURZEL, [
  "src/components/braille",
  "src/lib/braille",
  "src/features/public/PunktgenauPage.tsx",
]);

describe("Klasse: weiches Scrollen per Skript übergeht „weniger Bewegung“", () => {
  it("kein `behavior: \"smooth\"` im Punktgenau-Revier", () => {
    expect(zeige(pruefe(WURZEL, REVIER, weichesScrollen))).toEqual([]);
  });
  it("Gegenprobe: die alte Zeile aus `Punktgenau.tsx` wird gefunden", () => {
    const alt = `    el.scrollIntoView({ block: "nearest", behavior: "smooth" });`;
    expect(weichesScrollen("alt.tsx", alt)).toHaveLength(1);
  });
});

describe("Klasse: Fokusanzeige dünner als 4,5 px", () => {
  it("keine Fokus-Klasse unter 4,5 px im Punktgenau-Revier", () => {
    expect(zeige(pruefe(WURZEL, REVIER, duenneFokusanzeige))).toEqual([]);
  });
  it("keine Fokusanzeige, die nur die Randfarbe wechselt", () => {
    expect(zeige(pruefe(WURZEL, REVIER, fokusNurRandfarbe))).toEqual([]);
  });
  it("Gegenprobe: die alten Klassen werden gefunden, die neuen nicht", () => {
    const alt =
      'className="rounded-lg px-1 outline-none focus-visible:shadow-focus focus-visible:ring-2 focus-visible:ring-accent"';
    expect(duenneFokusanzeige("alt.tsx", alt)).toHaveLength(1);
    expect(duenneFokusanzeige("alt.tsx", '<div className="card focus-within:ring-4">')).toHaveLength(1);
    expect(duenneFokusanzeige("alt.tsx", 'className="focus-visible:outline focus-visible:outline-2"')).toHaveLength(1);
    expect(duenneFokusanzeige("alt.tsx", 'className="focus-visible:ring"')).toHaveLength(1);
    expect(
      fokusNurRandfarbe("alt.tsx", 'className="border-2 border-dashed p-6 outline-none focus:border-accent"'),
    ).toHaveLength(1);
    // Die neuen Schreibweisen gelten als Standard.
    expect(fokusBreite("focus-visible:ring-[4.5px]")).toBe(4.5);
    expect(fokusBreite("focus:outline-[4.5px]")).toBe(4.5);
    expect(fokusBreite("focus-visible:ring-accent")).toBeNull();
    expect(fokusBreite("focus-visible:outline-offset-2")).toBeNull();
    expect(
      fokusNurRandfarbe(
        "neu.tsx",
        'className="outline-none focus:border-accent focus-visible:outline focus-visible:outline-[4.5px]"',
      ),
    ).toEqual([]);
  });
});

/**
 * Ein JSX-Anfangs-Tag ab `start` bis zu seinem `>` - über geschweifte Klammern,
 * Zeichenketten und `//`-Kommentare hinweg (in den Tags stehen Pfeilfunktionen
 * und Kommentare mit `>`).
 */
function tagAb(quelle: string, start: number): string {
  let tiefe = 0;
  let zk: string | null = null;
  for (let i = start + 1; i < quelle.length; i++) {
    const c = quelle[i];
    if (zk) {
      if (c === "\\") i++;
      else if (c === zk) zk = null;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") zk = c;
    else if (c === "/" && quelle[i + 1] === "/" && tiefe === 0) i = quelle.indexOf("\n", i);
    else if (c === "/" && quelle[i + 1] === "*") i = quelle.indexOf("*/", i) + 1;
    else if (c === "{") tiefe++;
    else if (c === "}") tiefe--;
    else if (c === ">" && tiefe === 0) return quelle.slice(start, i + 1);
  }
  throw new Error("Tag ohne Ende");
}

function tagsIn(quelle: string, name: string): string[] {
  const aus: string[] = [];
  const re = new RegExp(`<${name}\\b`, "g");
  let m: RegExpExecArray | null;
  while ((m = re.exec(quelle))) aus.push(tagAb(quelle, m.index));
  return aus;
}

describe("Klasse: Antwortfeld ohne Kürzel-Freigabe", () => {
  const felder = REVIER.filter((d) => d.endsWith(".tsx")).flatMap((d) => {
    const q = readFileSync(join(WURZEL, d), "utf8");
    return [...tagsIn(q, "input"), ...tagsIn(q, "textarea")]
      .filter((t) => t.includes('data-feld="antwort"'))
      .map((t) => ({ datei: d, tag: t }));
  });

  it("es gibt Antwortfelder (sonst prüft der Block nichts)", () => {
    expect(felder.length).toBeGreaterThanOrEqual(3);
  });

  it('jedes Antwortfeld trägt data-kuerzel="an"', () => {
    const ohne = felder
      .filter((f) => !f.tag.includes('data-kuerzel="an"'))
      .map((f) => `${f.datei}: ${f.tag.match(/id="[^"]+"/)?.[0] ?? f.tag.slice(0, 60)}`);
    expect(ohne).toEqual([]);
  });

  it("die Anmeldefelder tragen es NICHT - dort gilt der Schutz aus dem NVDA-Test vom 01.07.", () => {
    const q = readFileSync(join(WURZEL, "src/components/braille/BrailleAuth.tsx"), "utf8");
    const mit = tagsIn(q, "input").filter((t) => t.includes("data-kuerzel"));
    expect(mit).toEqual([]);
  });
});

describe("Zeichen, die am Mac mit der Wahltaste kommen, gehören dem Feld", () => {
  it("was die Aufgaben verlangen, bleibt Schreiben", () => {
    // Gemessen an den Aufgaben: Computerbraille (@ [ ] | ~ €), Satzzeichen
    // in Vollschrift/Kurzschrift („ “ « » ‚ §), deutsche Mac-Tastatur.
    for (const z of ["@", "[", "]", "|", "~", "€", "„", "“", "”", "«", "»", "‚", "‘", "§", "…", "¡", "¶", "¢"]) {
      expect(istSchreibzeichen(z), z).toBe(true);
    }
  });
  it("was niemand für eine Braille-Aufgabe tippt, bleibt Kürzel", () => {
    // Wahl + W, Z, M, P, V, O, H am deutschen Mac - und Windows (Buchstabe/Ziffer).
    for (const z of ["∑", "Ω", "µ", "π", "√", "ø", "ª", "w", "P", "5", "Dead", "Unidentified"]) {
      expect(istSchreibzeichen(z), z).toBe(false);
    }
  });
  it("ohne Freigabe gehört JEDER Alt-Druck dem Feld, außerhalb eines Feldes keiner", () => {
    const ohne = document.createElement("input");
    const mit = document.createElement("input");
    mit.dataset.kuerzel = "an";
    const knopf = document.createElement("button");
    expect(gehoertDemFeld({ key: "p", target: ohne })).toBe(true);
    expect(gehoertDemFeld({ key: "p", target: mit })).toBe(false);
    expect(gehoertDemFeld({ key: "@", target: mit })).toBe(true);
    expect(gehoertDemFeld({ key: "@", target: knopf })).toBe(false);
    // `document` als Ziel hat kein `dataset` - darf nicht werfen.
    expect(gehoertDemFeld({ key: "p", target: document })).toBe(false);
  });
});

describe("Klasse: Ergebnis nur in der Statusfläche, nicht am Fokus", () => {
  /**
   * Jeder Knopf, auf den `BrailleTrainer` nach einem Ergebnis den Fokus legt,
   * trägt den Stand im Namen. Die Fokus-Ziele sind die Refs, die in einem
   * Ergebnis-Effekt `.focus(` bekommen.
   */
  const q = readFileSync(join(WURZEL, "src/components/braille/BrailleTrainer.tsx"), "utf8");
  const ZIELE = ["weiterRef", "nextRef", "nextLevelRef", "repeatRef"];

  it("die Fokus-Ziele nach einem Ergebnis sind genau diese Refs", () => {
    // Findet ein neuer Effekt ein neues Ziel, muss es hier eingetragen und
    // sein Knopf beschriftet werden.
    const effekte = [...q.matchAll(/if \((?:result|done|mastered)[^)]*\)\s*\(?([\w.? ]+?)\)?\??\.focus\(/g)].map(
      (m) => m[1],
    );
    expect(effekte.length).toBeGreaterThan(0);
    for (const e of effekte) {
      const refs = e.match(/\w+Ref/g) ?? [];
      for (const r of refs) expect(ZIELE, `neues Fokusziel ${r}`).toContain(r);
    }
  });

  it("jeder Knopf mit einem dieser Refs trägt ein aria-label mit dem Stand", () => {
    const knoepfe = tagsIn(q, "button").filter((t) => ZIELE.some((r) => t.includes(`ref={${r}}`)));
    expect(knoepfe.length).toBeGreaterThanOrEqual(7);
    const ohne = knoepfe.filter((t) => !/aria-label=/.test(t)).map((t) => t.slice(0, 80));
    expect(ohne).toEqual([]);
  });
});
