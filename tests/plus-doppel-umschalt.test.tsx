/**
 * Wächter für den Doppel-Umschalt-Griff in der Übung.
 *
 * Zweimal Umschalt schnell hintereinander sagt die Angabe noch einmal und
 * bringt sie auf die Braillezeile - auch aus dem Eingabefeld heraus.
 */
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PlusUebung } from "../src/components/plus/PlusUebung";

describe("★ Doppel-Umschalt sagt die Angabe noch einmal", () => {
  it("zweimal Umschalt sagt an und bringt die Aufgabe in die Live-Region", async () => {
    const ansagen = vi.fn();
    render(<PlusUebung paketId="1-08" onZurueck={() => {}} saat={4} ansagen={ansagen} />);
    ansagen.mockClear();
    fireEvent.keyDown(window, { key: "Shift" });
    fireEvent.keyDown(window, { key: "Shift" });
    expect(ansagen).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Aufgabe:"));
  });

  it("gilt auch aus dem Eingabefeld heraus", async () => {
    const ansagen = vi.fn();
    render(<PlusUebung paketId="1-08" onZurueck={() => {}} saat={4} ansagen={ansagen} />);
    ansagen.mockClear();
    const feld = screen.getByLabelText("Deine Antwort");
    fireEvent.keyDown(feld, { key: "Shift" });
    fireEvent.keyDown(feld, { key: "Shift" });
    expect(ansagen).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Aufgabe:"));
  });

  it("ein einzelnes Umschalt tut nichts", () => {
    const ansagen = vi.fn();
    render(<PlusUebung paketId="1-08" onZurueck={() => {}} saat={4} ansagen={ansagen} />);
    ansagen.mockClear();
    fireEvent.keyDown(window, { key: "Shift" });
    expect(ansagen).not.toHaveBeenCalled();
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
  });
});
