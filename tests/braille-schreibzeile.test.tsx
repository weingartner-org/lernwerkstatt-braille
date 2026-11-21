/**
 * ★★★ Die Aufgabe steht auf der Braillezeile (Johannes 07.10.2026: „in
 * punktgenau steht nicht auf der zeile was geschrieben werden soll, das ist
 * aber wichtig, mach es so wie in tastenflow").
 *
 * Das Schreibfeld ist ein Textfeld, dessen Wert die Aufgabe ist; der Zeiger
 * steht an der Stelle, die dran ist.
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { TextPanel, WritePanel } from "@/components/braille/BrailleTrainer";
import {
  BLANK,
  CHORD_NACHLAUF_MS,
  cellDots,
  textToCells,
  type Cell,
} from "@/lib/braille";
import { PUNKT_7, kurzschriftZeile, zeigerImText } from "@/lib/braille/schreibzeile";
import { cellToUnicode, parseDots } from "@/lib/braille";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

const DOT_KEY: Record<number, string> = { 1: "KeyF", 2: "KeyD", 3: "KeyS", 4: "KeyJ", 5: "KeyK", 6: "KeyL" };

function tippeZelle(el: HTMLElement, cell: Cell) {
  if (cell === BLANK) {
    fireEvent.keyDown(el, { code: "Space" });
    fireEvent.keyUp(el, { code: "Space" });
    return;
  }
  const codes = cellDots(cell).map((d) => DOT_KEY[d]);
  for (const code of codes) fireEvent.keyDown(el, { code });
  for (const code of codes) fireEvent.keyUp(el, { code });
  act(() => {
    vi.advanceTimersByTime(CHORD_NACHLAUF_MS);
  });
}

describe("zeigerImText", () => {
  const basis = (w: string) => textToCells(w, { system: "basis", grossschreibzeichen: true });

  it("Großbuchstabe: der Zeiger bleibt auf dem H, bis beide Zellen stehen", () => {
    const ziel = basis("Hund");
    expect(zeigerImText("Hund", ziel, 0, basis)).toBe(0);
    expect(zeigerImText("Hund", ziel, 1, basis)).toBe(0); // nur das Großschreibzeichen
    expect(zeigerImText("Hund", ziel, 2, basis)).toBe(1); // H fertig
    expect(zeigerImText("Hund", ziel, 3, basis)).toBe(2);
  });

  it("Wortgrenzen: nach der Lücke steht der Zeiger am nächsten Wort", () => {
    const ziel = basis("am see");
    const lücke = ziel.indexOf(BLANK);
    expect(zeigerImText("am see", ziel, lücke + 1, basis)).toBe(3);
  });

  it("ohne Übersetzung (Kurzschrift): am Wortanfang", () => {
    const ziel = basis("am see");
    expect(zeigerImText("am see", ziel, 1)).toBe(0);
    expect(zeigerImText("am see", ziel, ziel.indexOf(BLANK) + 2)).toBe(3);
  });
});

describe("Schreibfeld trägt die Aufgabe", () => {
  it("Wort schreiben: der Wert ist das Wort, der Zeiger rückt mit", () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    render(<WritePanel prompt="Hund" system="basis" eightDot={false} onDone={() => {}} />);
    const feld = screen.getByRole("textbox", { name: "Braille-Eingabefeld" }) as HTMLTextAreaElement;
    expect(feld.tagName).toBe("TEXTAREA");
    expect(feld.value).toBe("Hund");
    feld.focus();
    expect(feld.selectionStart).toBe(0);
    const ziel = textToCells("Hund", { system: "basis", grossschreibzeichen: true });
    tippeZelle(feld, ziel[0]);
    tippeZelle(feld, ziel[1]);
    expect(feld.selectionStart).toBe(1);
    expect(feld.value).toBe("Hund"); // getippt wird nie hinein
  });

  it("Text schreiben: der ganze Text steht im Feld", () => {
    render(
      <TextPanel
        text="am see"
        system="basis"
        eightDot={false}
        onRepeat={() => {}}
        onNext={null}
      />,
    );
    const feld = screen.getByRole("textbox", { name: "Text in Braille schreiben" }) as HTMLTextAreaElement;
    expect(feld.value).toBe("am see");
    expect(feld.dataset.kuerzel).toBe("an");
  });
});

describe("Kurzschrift: Punkt 7 zeigt, wie viele Zellen die gekürzte Form hat", () => {
  // Kunstziel: „Haus" = 3 Zellen, „und" = 1 Zelle.
  const h = parseDots("125");
  const au = parseDots("16");
  const s = parseDots("234");
  const und = parseDots("12346");
  const ziel = [h, au, s, BLANK, und];

  it("Wort: Wort, drei Leerzeichen, Punkt 7 je Zelle, Zeiger auf der ersten", () => {
    const z = kurzschriftZeile("Haus", [h, au, s], []);
    expect(z.wert).toBe(`Haus   ${PUNKT_7.repeat(3)}`);
    expect(z.zeiger).toBe(7);
  });

  it("geschriebene Zellen ersetzen den Punkt 7, der Zeiger rückt", () => {
    const z = kurzschriftZeile("Haus", [h, au, s], [h]);
    expect(z.wert).toBe(`Haus   ${cellToUnicode(h)}${PUNKT_7}${PUNKT_7}`);
    expect(z.zeiger).toBe(8);
  });

  it("Text: die Gruppe steht hinter dem Wort, das dran ist", () => {
    expect(kurzschriftZeile("Haus und", ziel, []).wert).toBe(`Haus   ${PUNKT_7.repeat(3)}   und`);
    const z = kurzschriftZeile("Haus und", ziel, [h, au, s, BLANK]);
    expect(z.wert).toBe(`Haus und   ${PUNKT_7}`);
    expect(z.zeiger).toBe("Haus und   ".length);
  });

  it("am Panel: Kurzschrift-Wort zeigt die Punkt-7-Zellen im Feld", async () => {
    render(
      <WritePanel
        prompt="Haus"
        system="voll"
        eightDot={false}
        solve={async () => [h, au, s]}
        onDone={() => {}}
      />,
    );
    const feld = (await screen.findByRole("textbox", { name: "Braille-Eingabefeld" })) as HTMLTextAreaElement;
    await vi.waitFor(() => expect(feld.value).toBe(`Haus   ${PUNKT_7.repeat(3)}`));
  });
});
