/**
 * ★★★★★ Text-Ansichten: HBS-Schrift statt gezeichnetem Punktraster + Runden-
 * Striche über statt neben dem Text (Johannes 22.09.2026, Bildschirmfoto
 * „Texte in Kurzschrift").
 *
 * Zwei Änderungen, NUR in den Text-Ansichten (`TextPanel` = Text schreiben,
 * `TextReadPanel` = Text lesen) - die Einzel-Aufgaben-Ansichten
 * (`WritePanel`/`ReadPanel`) sind unverändert und bleiben SVG-Punktraster
 * mit den Strichen daneben (siehe `tests/braille-aufgabenkasten.test.tsx`).
 *
 *  1. `RoundTicks` (`#pl-round-ticks`) steht jetzt in einer EIGENEN Zeile
 *     ÜBER dem Text (`[data-angabe]`), nicht mehr in derselben Zeile daneben
 *     - Johannes wörtlich: „bei texten sollen die striche rechts über, nicht
 *     neben den texten stehen".
 *  2. Der Braille-Text wird mit der HBS-Schrift gesetzt (`.font-braille-6`/
 *     `.font-braille-8`, siehe `lib/braille/render.ts`) statt als SVG-
 *     Punktraster (`BrailleCell`).
 *
 * ★★★★★ DER WICHTIGSTE TEST DIESES AUFTRAGS: die HBS-Schrift bildet
 * Braillezellen als LATEINISCHE Zeichen ab (kein Unicode-Braille) - eine
 * Sprachausgabe läse also Kauderwelsch, läse sie den Font-Text vor. Die
 * Fläche mit der Schrift ist darum IMMER `aria-hidden`, und dieselbe
 * Auskunft, die vorher an jeder sichtbaren `BrailleCell` als aria-label hing
 * (`dotsLabel`, „Punkte 1, 2, 4"), steht daneben als sr-only-Text/-Liste -
 * das wird hier Zelle für Zelle nachgezählt, nicht nur behauptet.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { TextPanel, TextReadPanel } from "@/components/braille/BrailleTrainer";
import { BLANK, CHORD_NACHLAUF_MS, cellDots, dotsLabel, textToCells, type Cell } from "@/lib/braille";
import { useBrailleA11y } from "@/lib/braille/a11y";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});
beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  act(() => useBrailleA11y.getState().resetZoom());
});

const DOT_KEY: Record<number, string> = {
  1: "KeyF",
  2: "KeyD",
  3: "KeyS",
  4: "KeyJ",
  5: "KeyK",
  6: "KeyL",
};

function tippeZelle(el: HTMLElement, cell: Cell) {
  if (cell === BLANK) {
    fireEvent.keyDown(el, { code: "Space" });
    fireEvent.keyUp(el, { code: "Space" });
    return;
  }
  const codes = cellDots(cell).map((d) => DOT_KEY[d]);
  for (const code of codes) fireEvent.keyDown(el, { code });
  for (const code of codes) fireEvent.keyUp(el, { code });
  // Die Zelle wartet die Nachfrist ab (nicht ganz gleichzeitige Tasten).
  act(() => {
    vi.advanceTimersByTime(CHORD_NACHLAUF_MS);
  });
}

const TEXT = "am see";
const TEXT_CELLS = textToCells(TEXT, { system: "basis", grossschreibzeichen: true });

const ROUND = { done: 1, total: 3, label: "Runde: 1 von 3" };

describe("TextPanel (Text schreiben)", () => {
  function schreibfeld(): HTMLElement {
    return screen.getByRole("textbox", { name: "Text in Braille schreiben" });
  }

  it("★★★★★ die geschriebenen Zellen sind aria-hidden HBS-Schrift, dieselbe Auskunft steht als sr-only-Liste daneben", () => {
    render(
      <TextPanel
        text={TEXT}
        system="basis"
        eightDot={false}
        onRepeat={() => {}}
        onNext={null}
        round={ROUND}
      />,
    );
    // Die ersten drei Zellen von "am see" tippen ("am ").
    act(() => {
      for (const c of TEXT_CELLS.slice(0, 3)) tippeZelle(schreibfeld(), c);
    });

    const feld = document.querySelector('[data-schreibflaeche]')!;
    // Kein SVG-Punktraster mehr für die GESCHRIEBENEN Zellen - HBS-Schrift.
    const fontZellen = feld.querySelectorAll(".font-braille-6");
    expect(fontZellen.length).toBeGreaterThan(0);
    fontZellen.forEach((z) => expect(z).toHaveAttribute("aria-hidden", "true"));

    // Dieselbe Auskunft wie vorher (aria-label je Zelle) steht jetzt als
    // sr-only-Liste daneben - Zelle für Zelle, in derselben Reihenfolge.
    const liste = screen.getByRole("list", { name: "Geschriebene Zellen, Zelle für Zelle" });
    const eintraege = liste.querySelectorAll("li");
    const erwartet = TEXT_CELLS.slice(0, 3).filter((c) => c !== BLANK).map(dotsLabel);
    expect(Array.from(eintraege).map((li) => li.textContent)).toEqual(erwartet);
  });

  it("wächst mit Alt + / − (Zoom) - wie vorher die SVG-Zellgröße", () => {
    render(
      <TextPanel
        text={TEXT}
        system="basis"
        eightDot={false}
        onRepeat={() => {}}
        onNext={null}
      />,
    );
    act(() => {
      tippeZelle(schreibfeld(), TEXT_CELLS[0]);
    });
    const zelleVorher = document.querySelector('[data-schreibflaeche] .font-braille-6') as HTMLElement;
    const groesseVorher = parseFloat(zelleVorher.style.fontSize);
    expect(groesseVorher).toBeGreaterThan(0);

    act(() => {
      useBrailleA11y.getState().zoomIn();
      useBrailleA11y.getState().zoomIn();
    });

    const zelleNachher = document.querySelector('[data-schreibflaeche] .font-braille-6') as HTMLElement;
    expect(parseFloat(zelleNachher.style.fontSize)).toBeGreaterThan(groesseVorher);
  });

  it("★★★★ die Runden-Striche stehen ÜBER dem Text, nicht mehr in derselben Zeile daneben", () => {
    render(
      <TextPanel
        text={TEXT}
        system="basis"
        eightDot={false}
        onRepeat={() => {}}
        onNext={null}
        round={ROUND}
      />,
    );
    const ticks = document.getElementById("pl-round-ticks")!;
    const angabe = document.querySelector("[data-angabe]")!;
    expect(ticks).not.toBeNull();
    // Die Striche kommen im Dokument VOR der Textvorlage (darüber), nicht in
    // derselben Zeile daneben.
    expect(ticks.compareDocumentPosition(angabe) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    // Und stehen nicht mehr in derselben Elternzeile wie die Textvorlage.
    expect(ticks.parentElement).not.toBe(angabe.parentElement);
  });
});

describe("TextReadPanel (Text lesen)", () => {
  it("★★★★★ die Braille-Vorlage ist aria-hidden HBS-Schrift, dieselbe Auskunft (Zelle für Zelle + Braillezeichen) bleibt erhalten", () => {
    render(
      <TextReadPanel
        text={TEXT}
        system="basis"
        eightDot={false}
        onRepeat={() => {}}
        onNext={null}
      />,
    );
    const angabe = document.querySelector("[data-angabe]")!;
    // Kein SVG-Punktraster mehr - HBS-Schrift, aria-hidden.
    expect(angabe.querySelector("svg")).toBeNull();
    const fontFeld = angabe.querySelector(".font-braille-6")!;
    expect(fontFeld).not.toBeNull();
    expect(fontFeld.closest('[aria-hidden="true"]')).not.toBeNull();

    // Dieselbe Auskunft wie vorher: die navigierbare Zelle-für-Zelle-Liste
    // (dotsLabel) ist unverändert vorhanden.
    const liste = screen.getByRole("list", { name: "Braille-Vorlage, Zelle für Zelle" });
    const erwartet = TEXT_CELLS.filter((c) => c !== BLANK).map(dotsLabel);
    expect(Array.from(liste.querySelectorAll("li")).map((li) => li.textContent)).toEqual(erwartet);
  });

  it("wächst mit Alt + / − (Zoom)", () => {
    render(
      <TextReadPanel
        text={TEXT}
        system="basis"
        eightDot={false}
        onRepeat={() => {}}
        onNext={null}
      />,
    );
    const vorher = document.querySelector('[data-angabe] .font-braille-6') as HTMLElement;
    const groesseVorher = parseFloat(vorher.style.fontSize);
    expect(groesseVorher).toBeGreaterThan(0);

    act(() => {
      useBrailleA11y.getState().zoomIn();
      useBrailleA11y.getState().zoomIn();
    });

    const nachher = document.querySelector('[data-angabe] .font-braille-6') as HTMLElement;
    expect(parseFloat(nachher.style.fontSize)).toBeGreaterThan(groesseVorher);
  });

  it("★★★★ die Runden-Striche stehen ÜBER der Braille-Vorlage, nicht mehr in derselben Zeile daneben", () => {
    render(
      <TextReadPanel
        text={TEXT}
        system="basis"
        eightDot={false}
        onRepeat={() => {}}
        onNext={null}
        round={ROUND}
      />,
    );
    const ticks = document.getElementById("pl-round-ticks")!;
    const angabe = document.querySelector("[data-angabe]")!;
    expect(ticks).not.toBeNull();
    expect(ticks.compareDocumentPosition(angabe) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(ticks.parentElement).not.toBe(angabe.parentElement);
  });
});
