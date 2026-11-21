/**
 * ★★★ KEIN STILLER RÜCKFALL AUF DIE EIGENBAU-ENGINE (Befund 20.09.2026).
 *
 * `WritePanel`/`ReadPanel`/`TextPanel`/`TextReadPanel` holen die Kurzschrift-/
 * UEB-Soll-Lösung asynchron über `solve` (liblouis). Beide betroffenen Level-
 * Familien tragen `system: "voll"`. Bis heute fiel ein `null`/ein geworfener
 * Fehler von `solve` auf `textToCells(prompt, { system: "voll", ... })`
 * zurück — die Eigenbau-Engine kennt aber keine Kürzungen und hätte
 * VOLLSCHRIFT statt Kurzschrift gezeigt. Gemessen über 294 Kurzschrift-
 * Aufgaben aus 49 Level: 294 von 294 wären falsch gewesen, und zwar STILL.
 *
 * Dieser Wächter prüft die neue Bauart direkt am `ReadPanel` (repräsentativ
 * für alle vier Stellen, die denselben Haken `useAsyncBrailleTarget`
 * benutzen): Fehlschlag ⇒ keine Aufgabe, eine Meldung mit echtem Ausweg,
 * nichts wird gewertet. Erfolg ⇒ unverändertes Verhalten.
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { ReadPanel } from "../src/components/braille/BrailleTrainer";
import { BLANK, dotsLabel, parseDots, textToCells, type Cell } from "../src/lib/braille";

afterEach(cleanup);

/** Die sr-only Punkte-Liste der Braille-Vorlage — leer, solange keine
 *  Aufgabe steht (Laden/Fehlschlag), gefüllt sobald eine echte Lösung da ist. */
function vorlagenListe(): HTMLElement {
  return screen.getByRole("list", { name: /Braille-Vorlage/i });
}

describe("Kurzschrift: kein stiller Rückfall auf die Eigenbau-Engine", () => {
  it("solve liefert null ⇒ keine Aufgabe aus der Eigenbau-Engine, sondern die Meldung", async () => {
    const solve = vi.fn(async () => null);
    const onTask = vi.fn();
    render(
      <ReadPanel
        prompt="das"
        system="voll"
        eightDot={false}
        solve={solve}
        onDone={() => {}}
        onTask={onTask}
      />,
    );

    await waitFor(() => expect(solve).toHaveBeenCalledTimes(1));
    await screen.findByText(/ist gerade nicht verfügbar/i);

    // Keine Zellen gerendert — insbesondere nicht die VOLLSCHRIFT-Zellen, auf
    // die der alte Rückfall zurückgefallen wäre.
    expect(within(vorlagenListe()).queryAllByRole("listitem")).toHaveLength(0);
    const vollschriftZellen = textToCells("das", { system: "voll", grossschreibzeichen: true })
      .filter((c) => c !== BLANK);
    expect(vollschriftZellen.length).toBeGreaterThan(0); // die Falle hätte wirklich gegriffen
    for (const c of vollschriftZellen) {
      expect(screen.queryByText(dotsLabel(c))).not.toBeInTheDocument();
    }

    expect(onTask).not.toHaveBeenCalled();
  });

  it("solve wirft ⇒ dasselbe (keine Aufgabe, keine Vollschrift-Zellen)", async () => {
    const solve = vi.fn(async () => {
      throw new Error("liblouis-Worker kaputt");
    });
    const onTask = vi.fn();
    render(
      <ReadPanel
        prompt="sich"
        system="voll"
        eightDot={false}
        solve={solve}
        onDone={() => {}}
        onTask={onTask}
      />,
    );

    await waitFor(() => expect(solve).toHaveBeenCalledTimes(1));
    await screen.findByText(/ist gerade nicht verfügbar/i);
    expect(within(vorlagenListe()).queryAllByRole("listitem")).toHaveLength(0);
    const vollschriftZellen = textToCells("sich", { system: "voll", grossschreibzeichen: true })
      .filter((c) => c !== BLANK);
    for (const c of vollschriftZellen) {
      expect(screen.queryByText(dotsLabel(c))).not.toBeInTheDocument();
    }
    expect(onTask).not.toHaveBeenCalled();
  });

  it("Schalter „Noch einmal versuchen“ ist erreichbar und stößt solve erneut an", async () => {
    const solve = vi.fn(async () => null);
    render(
      <ReadPanel prompt="das" system="voll" eightDot={false} solve={solve} onDone={() => {}} />,
    );

    await waitFor(() => expect(solve).toHaveBeenCalledTimes(1));
    const retryBtn = await screen.findByRole("button", { name: /noch einmal versuchen/i });

    // Erreichbar: nicht `disabled`, kein negativer tabindex (Bauart §3/§14).
    expect(retryBtn).not.toBeDisabled();
    expect(retryBtn).not.toHaveAttribute("aria-disabled", "true");
    expect(retryBtn.tabIndex).toBeGreaterThanOrEqual(0);

    fireEvent.click(retryBtn);
    await waitFor(() => expect(solve).toHaveBeenCalledTimes(2));
    // Nach dem Klick bekommt die Eingabezeile den Fokus (Fokus-Ziel des Knopfs).
    await waitFor(() => expect(document.activeElement).toHaveAttribute("id", "read-answer"));
  });

  it("im Fehlerzustand wird onTask NICHT gerufen, auch wenn das Feld befüllt und abgeschickt wird", async () => {
    const solve = vi.fn(async () => null);
    const onTask = vi.fn();
    render(
      <ReadPanel
        prompt="das"
        system="voll"
        eightDot={false}
        solve={solve}
        onDone={() => {}}
        onTask={onTask}
      />,
    );
    await screen.findByText(/ist gerade nicht verfügbar/i);

    const input = screen.getByLabelText(/Was steht hier/i) as HTMLInputElement;
    // `readOnly` verhindert echtes Tippen nicht auf DOM-Ebene — der Guard muss
    // also im Code stehen, nicht nur in der Bedienung. `fireEvent.change`
    // umgeht die Simulation „echter" Nutzereingabe bewusst, um genau DAS zu prüfen.
    fireEvent.change(input, { target: { value: "das" } });
    const form = input.closest("form")!;
    fireEvent.submit(form);

    expect(onTask).not.toHaveBeenCalled();
    // Weiterhin die Fehlschlag-Meldung, kein Prüfergebnis.
    expect(screen.queryByText(/Richtig gelesen/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Richtig wäre/i)).not.toBeInTheDocument();
  });

  it("Regressionsschutz: solve liefert eine Lösung ⇒ Aufgabe erscheint und wird normal gewertet", async () => {
    const cells: Cell[] = [parseDots("1"), parseDots("12")]; // a, b — beliebige echte Zellen
    const solve = vi.fn(async () => cells);
    const onTask = vi.fn();
    render(
      <ReadPanel
        prompt="ab"
        system="voll"
        eightDot={false}
        solve={solve}
        onDone={() => {}}
        onTask={onTask}
      />,
    );

    await waitFor(() => expect(solve).toHaveBeenCalledTimes(1));
    // Keine Fehlschlag-Meldung.
    expect(screen.queryByText(/ist gerade nicht verfügbar/i)).not.toBeInTheDocument();
    // Die gelieferten Zellen stehen in der Vorlage.
    await waitFor(() =>
      expect(within(vorlagenListe()).getAllByRole("listitem")).toHaveLength(cells.length),
    );

    const input = screen.getByLabelText(/Was steht hier/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "ab" } });
    const form = input.closest("form")!;
    fireEvent.submit(form);

    expect(onTask).toHaveBeenCalledTimes(1);
    expect(onTask.mock.calls[0][0]).toBe(true); // richtig gelöst
    await screen.findByText(/Richtig gelesen/i);
  });
});
