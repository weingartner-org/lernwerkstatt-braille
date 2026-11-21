/**
 * ★★★ Klangpunkte: Fokus, Bewegung und das Ergebnis der Mehrfachwahl
 * ============================================================================
 * Durchsicht 29.09.2026, jeder Befund vorher am Quelltext gemessen:
 *
 * 1. `behavior: "smooth"` beim Sprung zur Runden-Anzeige - trotz „weniger
 *    Bewegung".
 * 2. Fokusanzeige 2 px (Kapitel-Liste, Werk-Liste, Klassen-Matrix) und an den
 *    fünf Spielflächen `outline-none` mit nur einem Randfarben-Wechsel.
 *    Plattform-Standard sind 4,5 px (`index.css`).
 * 3. Nach der Wahl stand das Ergebnis nur in der Live-Region - am Knopf mit
 *    dem Fokus stand weiter „2. tiefer".
 *
 * Die Quelltext-Proben prüfen die KLASSE über das ganze Klangpunkte-Revier
 * und haben eine Gegenprobe gegen den alten Wortlaut. Die Mehrfachwahl wird
 * am echten Bauteil durchgespielt.
 */
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import {
  duenneFokusanzeige,
  fokusNurRandfarbe,
  pruefe,
  quelldateien,
  weichesScrollen,
  zeige,
} from "./helfer/fokusUndBewegung";

vi.mock("@/lib/typing/sound", () => ({
  playBadgeSound: vi.fn(),
  playUnlockFanfare: vi.fn(),
}));

import { KlangpunkteRunner } from "@/components/klangpunkte/KlangpunkteRunner";
import { KLANG_ETAPPEN } from "@/lib/klangpunkte/etappen";
import { emptyMastery } from "@/lib/braille/adaptive";

afterEach(cleanup);

const WURZEL = join(__dirname, "..");
/** Das Revier laut `apps/klangpunkte/CLAUDE.md`. */
const REVIER = quelldateien(WURZEL, [
  "src/components/klangpunkte",
  "src/lib/klangpunkte",
  "src/features/public/KlangpunktePage.tsx",
]);

describe("Klassen im Quelltext", () => {
  it("kein `behavior: \"smooth\"` im Klangpunkte-Revier", () => {
    expect(zeige(pruefe(WURZEL, REVIER, weichesScrollen))).toEqual([]);
  });
  it("keine Fokus-Klasse unter 4,5 px", () => {
    expect(zeige(pruefe(WURZEL, REVIER, duenneFokusanzeige))).toEqual([]);
  });
  it("keine Fokusanzeige, die nur die Randfarbe wechselt", () => {
    expect(zeige(pruefe(WURZEL, REVIER, fokusNurRandfarbe))).toEqual([]);
  });
  it("Gegenprobe: die alten Zeilen werden gefunden", () => {
    expect(weichesScrollen("alt", `el.scrollIntoView({ block: "nearest", behavior: "smooth" });`)).toHaveLength(1);
    expect(
      duenneFokusanzeige("alt", 'className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"'),
    ).toHaveLength(1);
    expect(duenneFokusanzeige("alt", 'className="outline-none focus-visible:ring-2 focus-visible:ring-accent"')).toHaveLength(1);
    expect(
      fokusNurRandfarbe("alt", 'className="rounded-xl border-2 border-dashed border-hairline p-4 outline-none focus:border-accent"'),
    ).toHaveLength(1);
  });
});

/** Die erste Etappe mit Mehrfachwahl („Hoch oder tief?"). */
function zeigeWahl(ansagen: string[]) {
  render(
    <KlangpunkteRunner
      etappe={KLANG_ETAPPEN[0]}
      initialMastery={emptyMastery()}
      onResult={() => {}}
      onNext={null}
      onProgress={() => {}}
      onAnnounce={(a) => ansagen.push(a.text)}
    />,
  );
  return screen.getByRole("group", { name: /^Antworten/ });
}

describe("★★★ Mehrfachwahl: das Ergebnis steht am Fokus", () => {
  it("vor der Wahl tragen die Knöpfe nur ihren sichtbaren Text", () => {
    const gruppe = zeigeWahl([]);
    const knoepfe = Array.from(gruppe.querySelectorAll("button"));
    expect(knoepfe.length).toBeGreaterThanOrEqual(2);
    for (const k of knoepfe) expect(k.getAttribute("aria-label")).toBeNull();
    expect(gruppe.getAttribute("aria-label")).toBe("Antworten (auch Zifferntasten 1 bis 4)");
  });

  it("nach dem Drücken beginnt der Name des gedrückten Knopfs mit dem Ergebnis - demselben Satz wie die Ansage", async () => {
    const ansagen: string[] = [];
    const gruppe = zeigeWahl(ansagen);
    const knopf = gruppe.querySelector("button")!;
    const sichtbar = knopf.textContent!.trim();
    knopf.focus();
    fireEvent.click(knopf);
    // Gleich nach dem Drücken lesen - nach 0,65 bzw. 1,2 s kommt die nächste Aufgabe.
    const ergebnis = ansagen.at(-1)!;
    await waitFor(() => expect(knopf.getAttribute("aria-label")).toBeTruthy());
    // „Richtig!", die Erklärung der Aufgabe („Der zweite Ton war der
    // höchste.") oder „Richtig wäre: …" - nie ein Wort gegen das Kind.
    expect(ergebnis.length).toBeGreaterThan(0);
    expect(ergebnis).not.toMatch(/falsch/i);
    expect(knopf.getAttribute("aria-label")).toBe(`${ergebnis} ${sichtbar}`);
    expect(document.activeElement).toBe(knopf);
  });

  it("nach einer Zifferntaste steht der Fokus auf der Gruppe - dann trägt SIE das Ergebnis", async () => {
    const ansagen: string[] = [];
    const gruppe = zeigeWahl(ansagen);
    gruppe.focus();
    fireEvent.keyDown(gruppe, { key: "2", code: "Digit2" });
    const ergebnis = ansagen.at(-1)!;
    await waitFor(() => expect(gruppe.getAttribute("aria-label")).not.toBe("Antworten (auch Zifferntasten 1 bis 4)"));
    expect(gruppe.getAttribute("aria-label")).toBe(`${ergebnis} Antworten (auch Zifferntasten 1 bis 4)`);
  });
});
