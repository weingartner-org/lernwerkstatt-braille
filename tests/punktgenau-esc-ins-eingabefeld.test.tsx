/**
 * ★★★★★ ESCAPE HOLT IMMER DAS ÜBUNGSFELD (07.09.2026).
 *
 * Johannes: *„esc muss eingabefeld fokusieren immer und überall"*.
 *
 * Was vorher war - drei Lücken auf einmal:
 *   1. Escape schloss NUR Hilfe und Tastenkürzel. Zeichenliste,
 *      Passwort-Fenster, Anmeldung und Verwechslungs-Tafel blieben offen.
 *   2. Es setzte NIRGENDS ein Fokus-Ziel. Wer die Hilfe schloss, stand auf dem
 *      Hilfe-Knopf der Kopfzeile und musste sich zurück ins Übungsfeld tabben.
 *   3. War nichts offen, tat Escape gar nichts - obwohl man es genau dann am
 *      dringendsten braucht.
 *
 * Dieselbe Regel gilt in Tastenflow seit dem 14.08.2026.
 *
 * ⚠️ Warum dieser Wächter die SEITE lädt und nicht nur den Speicher abfragt:
 * Der Weg besteht aus drei Teilen, die einzeln funktionieren können und
 * zusammen trotzdem nicht - die Taste, das Schließen der Fenster und das
 * Fokus-Ziel. Ein Test, der nur den Zähler prüft, wäre grün geblieben, obwohl
 * das Kind auf `<body>` steht ([[feedback_gruener_waechter_beweist_was]]).
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { PunktgenauPage } from "@/features/public/PunktgenauPage";
import { PUNKTGENAU_ESC, useBraillePlay } from "@/lib/braille/play";
import { FOCUS_FIELD_EVENT } from "@/lib/typing/focusField";

afterEach(cleanup);
beforeEach(() => {
  act(() =>
    useBraillePlay.setState({ focusInputNonce: 0, charsOpen: false, paused: false }),
  );
});

function zeigeSeite() {
  render(
    <MemoryRouter initialEntries={["/programme/punktgenau"]}>
      <PunktgenauPage />
    </MemoryRouter>,
  );
}

/** Escape auf dem Dokument - so, wie die Seite es hört. */
function escape() {
  fireEvent.keyDown(document, { key: "Escape" });
}

describe("Escape in Punktgenau", () => {
  it("★★★★ holt das Übungsfeld, auch wenn gar nichts offen war", async () => {
    zeigeSeite();
    const vorher = useBraillePlay.getState().focusInputNonce;

    act(() => escape());

    expect(useBraillePlay.getState().focusInputNonce).toBeGreaterThan(vorher);
    // Und das Feld hat den Ruf auch wirklich eingelöst.
    await waitFor(() =>
      expect(document.activeElement?.getAttribute("data-feld")).toBeTruthy(),
    );
  });

  it("★★★ schließt die Hilfe UND setzt danach ein Fokus-Ziel", async () => {
    zeigeSeite();
    act(() => {
      fireEvent.keyDown(document, { code: "KeyH", altKey: true });
    });
    expect(screen.getByRole("dialog")).toBeTruthy();
    const vorher = useBraillePlay.getState().focusInputNonce;

    // Das Fenster ist ein `Modal` - es fängt Escape in der Abfangphase ab und
    // ruft sein `onClose`. Genau das muss hierher zurückführen.
    act(() => escape());

    expect(screen.queryByRole("dialog")).toBeNull();
    expect(useBraillePlay.getState().focusInputNonce).toBeGreaterThan(vorher);
    await waitFor(() =>
      expect(document.activeElement?.getAttribute("data-feld")).toBeTruthy(),
    );
  });

  it("★★★ schließt auch die Zeichenliste (Alt + L) - sie gehört nicht der Seite", async () => {
    zeigeSeite();
    act(() => {
      fireEvent.keyDown(document, { code: "KeyL", altKey: true });
    });
    await waitFor(() => expect(useBraillePlay.getState().charsOpen).toBe(true));

    act(() => escape());

    await waitFor(() => expect(useBraillePlay.getState().charsOpen).toBe(false));
  });

  it("★★ das gemeinsame Fokus-Ereignis von `Modal` landet im Übungsfeld", () => {
    // `Modal.tsx` gehört allen fünf Programmen und ruft `focusPracticeField()`,
    // wenn der Öffner nicht mehr im Baum steht. Bis zum 07.09.2026 hörte in
    // Punktgenau niemand darauf - der Fokus fiel dann auf `<body>`.
    zeigeSeite();
    const vorher = useBraillePlay.getState().focusInputNonce;

    act(() => {
      window.dispatchEvent(new Event(FOCUS_FIELD_EVENT));
    });

    expect(useBraillePlay.getState().focusInputNonce).toBeGreaterThan(vorher);
  });

  it("das Escape-Ereignis der Seite trägt den vereinbarten Namen", () => {
    // Der Name steht in `lib/braille/play.ts` und wird von mehreren Stellen
    // gehört. Ein Tippfehler bliebe sonst still.
    expect(PUNKTGENAU_ESC).toBe("punktgenau-esc");
  });
});
