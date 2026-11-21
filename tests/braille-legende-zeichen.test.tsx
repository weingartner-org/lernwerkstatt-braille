/**
 * Befund 22.09.2026 (Johannes, an einem Bildschirmfoto): die Zeichen-Kästchen
 * einer Etappe zeigten Unsinn. Ursache: `Legend` in `BrailleTrainer.tsx`
 * zerlegte `level.legend` - den SATZ für die Überschrift, z. B.
 * „ei = ⠩ (1-4-6) · ie = ⠬ (3-4-6)" - Leerzeichen-für-Leerzeichen. Aus dem
 * einen Satz wurden neun Kästchen: „ei" (richtig), „=" (sinnlos), das
 * Braille-Zeichen selbst (Platzhalter-Strich, die Engine kennt Buchstaben,
 * keine Braille-Zeichen), „(1-4-6)" (sieben bedeutungslose Zellen), „·" …
 *
 * Die Behebung trennt die zwei Zwecke: `legend` bleibt unverändert der Satz
 * für die Überschrift; ein neues, optionales `zeichen?: string[]` trägt die
 * reinen Lernzeichen für die Kästchen. Fehlt es, gilt die alte Zerlegung von
 * `legend` weiter - die Mehrzahl der Etappen (z. B. „l a i m") ist davon
 * nicht betroffen.
 *
 * Geprüft wird hier:
 *  1. `etappeToLevel` reicht `zeichen` nur weiter, wenn die eigene Etappe
 *     (nicht der Wortpool-Fallback) eine Legende trägt.
 *  2. Die Kästchen einer reparierten Etappe (E11 „ei & ie") zeigen GENAU die
 *     zwei Lautgruppen - kein „=", kein Braille-Zeichen, keine Punktnummer
 *     als eigenes Kästchen.
 *  3. Die sr-only-Auskunft je Kästchen (Zeichen + Punktnummern + echtes
 *     Braillezeichen) bleibt erhalten.
 *  4. Die Punktnummern verschwinden NUR aus den Kästchen - die Überschrift
 *     (`level.legend`) und der Einführungstext (`level.intro`) zeigen sie
 *     weiter.
 *  5. Eine ungerührte Etappe (E-Basis „l a i m") zerlegt weiterhin wie
 *     bisher - kein `zeichen`-Feld nötig, keine Regression.
 */
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { Punktgenau } from "@/components/braille/Punktgenau";
import { ETAPPEN } from "@/lib/braille/etappen";
import { etappeToLevel, type AreaKey } from "@/lib/braille/areas";
import { textToCellsMathe } from "@/lib/braille/marburgerMathe";
import { emptyProgress } from "@/lib/braille/progress";
import type { BrailleProgress } from "@/lib/braille/progress";

afterEach(cleanup);

function findEtappe(id: string) {
  const et = ETAPPEN.find((e) => e.id === id);
  if (!et) throw new Error(`Etappe ${id} nicht gefunden`);
  return et;
}

/** Springt per `lastPlace` direkt zu einer Etappe - `ohneKlasse` hebt das
 *  Freischalt-Gate auf, sonst wäre jede spätere Etappe gesperrt. */
function zeigeEtappe(area: AreaKey, etappeId: string) {
  const progress: BrailleProgress = {
    ...emptyProgress(),
    lastPlace: { area, etappeId, direction: "write" },
  };
  render(<Punktgenau ohneKlasse loadFn={() => progress} />);
}

describe("etappeToLevel - zeichen nur mit der eigenen Legende", () => {
  it("E11 (repariert) reicht ihr eigenes zeichen-Feld durch", () => {
    const level = etappeToLevel(findEtappe("e11"));
    expect(level.zeichen).toEqual(["ei", "ie"]);
    // Die Überschrift bleibt der volle Satz mit Punktnummern.
    expect(level.legend).toBe("ei = ⠩ (1-4-6) · ie = ⠬ (3-4-6)");
  });

  it("b1 (unberührt) hat kein zeichen-Feld - Legend zerlegt weiterhin legend selbst", () => {
    const level = etappeToLevel(findEtappe("b1"));
    expect(level.zeichen).toBeUndefined();
    expect(level.legend).toBe("l a i m");
  });
});

describe("Legend-Kästchen: E11 »Lautgruppen ei & ie« (Vollschrift)", () => {
  it("zeigt genau zwei Kästchen - ei und ie, kein „=“, kein Punktnummern-Kästchen", () => {
    zeigeEtappe("voll", "e11");
    const list = screen.getByRole("list", { name: /Meine Tasten/ });
    const boxen = list.querySelectorAll("li");
    expect(boxen).toHaveLength(2);
    expect(boxen[0]).toHaveTextContent("ei");
    expect(boxen[1]).toHaveTextContent("ie");
    // Explizit: keine der zwei Kästchen enthält das Gleichheitszeichen oder
    // eine Punktnummer-Klammer aus der Satz-Legende.
    for (const box of Array.from(boxen)) {
      expect(box.textContent).not.toContain("=");
      expect(box.textContent).not.toContain("(1-4-6)");
      expect(box.textContent).not.toContain("(3-4-6)");
    }
  });

  it("die sr-only-Auskunft je Kästchen bleibt: Zeichen, Punktnummern UND echtes Braillezeichen", () => {
    zeigeEtappe("voll", "e11");
    const list = screen.getByRole("list", { name: /Meine Tasten/ });
    const boxen = Array.from(list.querySelectorAll("li"));
    // "ei" = Punkte 1, 4, 6 (CONTRACTIONS_VOLL in tables.ts)
    expect(boxen[0].textContent).toContain("ei: Punkte 1, 4, 6");
    expect(boxen[0].textContent).toMatch(/[⠀-⣿]/); // echtes Braillezeichen (U+2800-Block)
    // "ie" = Punkte 3, 4, 6
    expect(boxen[1].textContent).toContain("ie: Punkte 3, 4, 6");
    expect(boxen[1].textContent).toMatch(/[⠀-⣿]/);
  });

  it("die Punktnummern verschwinden nur aus den Kästchen - Überschrift zeigt sie weiter", () => {
    zeigeEtappe("voll", "e11");
    // Die <summary> trägt weiterhin den vollen Satz mit den Punktnummern.
    expect(
      screen.getByText("ei = ⠩ (1-4-6) · ie = ⠬ (3-4-6)"),
    ).toBeInTheDocument();
  });
});

describe("Legend-Kästchen: E17 »Großbuchstaben mit Punkt 7« (Computerbraille)", () => {
  it("zeigt genau drei Kästchen - A, B, M -, keine Punktnummer als eigenes Kästchen", () => {
    zeigeEtappe("computer", "e17");
    const list = screen.getByRole("list", { name: /Meine Tasten/ });
    const boxen = list.querySelectorAll("li");
    expect(boxen).toHaveLength(3);
    expect(boxen[0]).toHaveTextContent("A");
    expect(boxen[1]).toHaveTextContent("B");
    expect(boxen[2]).toHaveTextContent("M");
    for (const box of Array.from(boxen)) {
      expect(box.textContent).not.toContain("=");
      expect(box.textContent).not.toContain("1·7");
    }
  });

  it("der Einführungstext (introDu/level.intro) nennt die Punktnummern weiter", () => {
    zeigeEtappe("computer", "e17");
    // introDu von E17 - unverändert, weil dieser Bau introDu/intro gar nicht
    // anfasst - nennt „Punkt 7" und „Punkt 1 und 7" wörtlich im Fließtext.
    expect(
      screen.getByText(
        "Ein großer Buchstabe ist der kleine plus einen Punkt unten links — Punkt 7, deine A-Taste. Kein extra Zeichen davor wie früher. Großes A ist Punkt 1 und 7 in derselben Zelle.",
      ),
    ).toBeInTheDocument();
  });

  it("die Überschrift zeigt weiter den vollen Satz mit Punktnummern", () => {
    zeigeEtappe("computer", "e17");
    // getByText normalisiert Leerraum - die Quelle hat bewusst doppelte
    // Leerzeichen ums „·" (Lesbarkeit im Quelltext), darum hier per Regex.
    expect(
      screen.getByText(/A = 1·7\s*·\s*B = 1·2·7\s*·\s*M = 1·3·4·7/),
    ).toBeInTheDocument();
  });
});

describe("Regression: unberührte Legenden bleiben wie bisher", () => {
  it("E-Basis b1 »l a i m« zerlegt weiterhin über legend.split(\" \") - vier Kästchen", () => {
    zeigeEtappe("basis", "b1");
    const list = screen.getByRole("list", { name: /Meine Tasten/ });
    const boxen = list.querySelectorAll("li");
    expect(boxen).toHaveLength(4);
    expect(boxen[0]).toHaveTextContent("l");
    expect(boxen[1]).toHaveTextContent("a");
    expect(boxen[2]).toHaveTextContent("i");
    expect(boxen[3]).toHaveTextContent("m");
  });
});

/**
 * ════════════════════════════════════════════════════════════════════════════
 * ★★★ DER STRUKTUR-WÄCHTER - jedes Kästchen JEDER Etappe, nicht nur die
 * reparierten drei
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Die Prüfungen oben halten die Etappen fest, an denen der Befund vom
 * 22.09.2026 gemessen wurde (e11, e17, b1). Das ist genau die Art grüner
 * Wächter, die für den Rest nichts beweist
 * ([[feedback_gruener_waechter_beweist_was]]): er prüft die drei Stellen, die
 * schon repariert sind, und schweigt über die übrigen 37.
 *
 * Dieser Block geht deshalb ÜBER ALLE Etappen, die in `Legend` landen - also
 * alles ausser Kurzschrift und UEB, die über `KurzLegend` laufen und ihre
 * Legende am „·" teilen. Er baut die Kästchen-Wortmarken genauso, wie `Legend`
 * sie baut, und verlangt von jeder einzelnen, dass sie ein Lernzeichen ist.
 *
 * ★ WAS ER BEIM ERSTEN LAUF GEFUNDEN HAT (22.09.2026, nach dem Deploy):
 * `b-satzzeichen2` und `voll-satzzeichen2` trugen als Legende
 * `: ; ' ( ) „ "` - mit dem GERADEN Schreibmaschinen-Anführungszeichen als
 * siebtem Zeichen. Die 6-Punkt-Engine kennt nur die typografischen Zeichen
 * („ = Punkte 2·3·6, “ = Punkte 3·5·6); für U+0022 gab sie null Zellen
 * zurück, und das siebte Kästchen zeigte den Platzhalter-Strich - genau das
 * Bild, das Johannes am Bildschirmfoto gezeigt hatte, nur eine Etappe weiter.
 * Die Übungssätze selbst waren immer richtig („Mama ruft: „Komm schnell
 * her!“"), es war allein die Legende. Korrigiert auf “; die schliessende
 * Ansage fehlte ausserdem in `introducedUnits` und ist nachgetragen.
 */
describe("★★★ Struktur: JEDES Legend-Kästchen ist ein echtes Lernzeichen", () => {
  /** Alle Etappen, deren Legende in `Legend` gerendert wird (nicht KurzLegend). */
  const legendEtappen = ETAPPEN.map(etappeToLevel).filter(
    (l) =>
      !!l.legend && !l.id.startsWith("kurz-") && !l.id.startsWith("ueb-"),
  );

  /** Führt die Etappe dieses Zeichen laut eigener `introducedUnits` ein? */
  function lehrt(id: string, zeichen: string): boolean {
    const et = ETAPPEN.find((e) => e.id === id);
    return !!et?.introducedUnits.some((u) => u.key === zeichen);
  }

  /** Die Wortmarken, die `Legend` aus einem Level macht - dieselbe Zeile. */
  function kaestchen(l: (typeof legendEtappen)[number]): string[] {
    const chars = l.legend as string;
    return l.zeichen ?? (chars.includes(" ") ? chars.split(" ") : [...chars]);
  }

  it("es gibt überhaupt welche zu prüfen (sonst misst dieser Wächter nichts)", () => {
    expect(legendEtappen.length).toBeGreaterThan(30);
  });

  it("★ kein Kästchen bleibt leer - jedes ergibt mindestens eine Zelle", () => {
    const leer: string[] = [];
    for (const l of legendEtappen) {
      for (const t of kaestchen(l)) {
        const cells = textToCellsMathe(t, {
          system: l.system,
          grossschreibzeichen: true,
        });
        // Null Zellen ⇒ BrailleCell zeigt seinen Platzhalter-Strich. Ein Kind
        // mit Blindheit bekommt dort gar nichts vorgelesen ausser dem Zeichen
        // selbst, ohne Punkte.
        if (cells.length === 0) leer.push(`${l.id}: ${JSON.stringify(t)}`);
      }
    }
    expect(leer, "Kästchen ohne Zelle (Platzhalter-Strich)").toEqual([]);
  });

  it("★ kein Kästchen ist ein Trennzeichen aus dem Legenden-Satz", () => {
    const schrott: string[] = [];
    for (const l of legendEtappen) {
      for (const t of kaestchen(l)) {
        // „=" und „·" trennen im Satz Zeichen von Punktnummern bzw. Einträge
        // voneinander - als eigenes Kästchen sind sie sinnlos.
        //
        // ⚠️ Ein Zeichen ist nicht an sich Trennzeichen: `b-rechnen-plus` lehrt
        // das Gleichzeichen wirklich („+ ="), und `e-comp-satz` den
        // Bindestrich. Entschieden wird das an `introducedUnits` - der Liste
        // dessen, was die Etappe laut eigener Angabe einführt und ansagt. Steht
        // das Zeichen dort, ist es Lernstoff; steht es nicht dort, ist es aus
        // einem Satz herausgefallen.
        if ((t === "=" || t === "·") && !lehrt(l.id, t)) {
          schrott.push(`${l.id}: ${t}`);
        }
      }
    }
    expect(schrott, "Trennzeichen als eigenes Kästchen").toEqual([]);
  });

  it("★ kein Kästchen enthält ein Braillezeichen aus der Legende", () => {
    // Die Legenden zeigen im Satz das fertige Braillezeichen (⠩, ⠨ …). Landet
    // es in einem Kästchen, wird es an die Engine gereicht, die Buchstaben
    // kennt und keine Braillezeichen - wieder ein Platzhalter-Strich.
    const drin: string[] = [];
    for (const l of legendEtappen) {
      for (const t of kaestchen(l)) {
        if (/[\u2800-\u28FF]/.test(t)) drin.push(`${l.id}: ${JSON.stringify(t)}`);
      }
    }
    expect(drin, "Braillezeichen als Kästchen-Beschriftung").toEqual([]);
  });

  it("★ kein Kästchen ist eine Punktnummern-Angabe", () => {
    // „(1-4-6)", „1·7", „1-2-3-4-6" - die Prosa-Schreibweise der Punkte. Eine
    // EINZELNE Ziffer bleibt erlaubt: b13 lehrt die Ziffern 1 bis 0.
    const punkte: string[] = [];
    for (const l of legendEtappen) {
      for (const t of kaestchen(l)) {
        if (/^\(?\d(?:[-·]\d)+\)?$/.test(t)) punkte.push(`${l.id}: ${t}`);
      }
    }
    expect(punkte, "Punktnummer als eigenes Kästchen").toEqual([]);
  });
});

describe("Die beiden Satzzeichen-Etappen nach der Korrektur", () => {
  it("b-satzzeichen2 zeigt sieben Kästchen, das letzte ist das schliessende Anführungszeichen", () => {
    zeigeEtappe("basis", "b-satzzeichen2");
    const list = screen.getByRole("list", { name: /Meine Tasten/ });
    const boxen = Array.from(list.querySelectorAll("li"));
    expect(boxen).toHaveLength(7);
    expect(boxen[5].textContent).toContain("„: Punkte 2, 3, 6");
    expect(boxen[6].textContent).toContain("“: Punkte 3, 5, 6");
    // Der Platzhalter-Strich des leeren Kästchens darf nirgends mehr stehen.
    for (const box of boxen) expect(box.textContent).not.toMatch(/^\s*-\s*$/);
  });

  it("die Ansage kennt beide Anführungszeichen", () => {
    const et = findEtappe("b-satzzeichen2");
    const keys = et.introducedUnits.map((u) => u.key);
    expect(keys).toContain("„");
    expect(keys).toContain("“");
    expect(keys).not.toContain('"');
  });
});
