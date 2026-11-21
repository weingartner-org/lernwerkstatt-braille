/**
 * Wächter für den Ton bei „richtig" (Johannes, 28.09.2026: „Sound wenn richtig
 * gerechnet").
 *
 * Geprüft wird: der Ton kommt bei richtig - und nur dann, nie ohne das Wort.
 * Und der Schalter „Töne" hält ihn still.
 */
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/lib/plus/ton", async (echt) => ({
  ...(await echt<typeof import("../src/lib/plus/ton")>()),
  spieleRichtigTon: vi.fn(),
}));

import { PlusUebung } from "../src/components/plus/PlusUebung";
import { erzeugeLauf } from "../src/lib/plus/generator";
import { spieleRichtigTon } from "../src/lib/plus/ton";

const lauf = (paketId: string) => erzeugeLauf(paketId, { anzahl: 8, saat: 4 });

afterEach(() => vi.mocked(spieleRichtigTon).mockClear());

describe("Der Ton bei richtig", () => {
  it("klingt bei einer richtigen Antwort - zusammen mit dem Wort", () => {
    const aufgaben = lauf("1-08");
    render(<PlusUebung paketId="1-08" onZurueck={() => {}} saat={4} />);
    fireEvent.change(screen.getByLabelText("Deine Antwort"), { target: { value: aufgaben[0].loesung } });
    fireEvent.click(screen.getByRole("button", { name: "Prüfen" }));
    expect(spieleRichtigTon).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("status")).toHaveTextContent("Richtig.");
  });

  it('schweigt bei „Noch nicht" und bei einem leeren Feld', () => {
    render(<PlusUebung paketId="1-08" onZurueck={() => {}} saat={4} />);
    fireEvent.click(screen.getByRole("button", { name: "Prüfen" }));
    fireEvent.change(screen.getByLabelText("Deine Antwort"), { target: { value: "99999" } });
    fireEvent.click(screen.getByRole("button", { name: "Prüfen" }));
    expect(spieleRichtigTon).not.toHaveBeenCalled();
  });
});

describe("Der Schalter", () => {
  it('„Töne" aus hält den Ton still', async () => {
    const echt = await vi.importActual<typeof import("../src/lib/plus/ton")>("../src/lib/plus/ton");
    const AC = vi.fn();
    vi.stubGlobal("AudioContext", AC);
    echt.setzeTonStumm(true);
    echt.spieleRichtigTon();
    expect(AC).not.toHaveBeenCalled();
    echt.setzeTonStumm(false);
    vi.unstubAllGlobals();
  });
});
