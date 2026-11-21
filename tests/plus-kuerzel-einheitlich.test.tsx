/**
 * ★★ WÄCHTER: Die Tastenkürzel von Plus - einheitlich mit den anderen
 * Lern-Apps (Johannes, 18.10.2026, nach dem Vergleich der Kürzel aller
 * Lern-Apps).
 *
 *  (a) Alt + W sagt die Aufgabe noch einmal, Alt + Z sagt, wo man ist (nach
 *      dem Aufdruck - Alt + Y wirkt nicht), Alt + E bringt ins Feld.
 *  (b) Esc führt zurück ins Eingabefeld.
 *  (c) Hinter einem offenen Fenster (Hilfe) wechselt Alt + B die Übung nicht.
 *  (d) Die Liste kommt aus der gemeinsamen Quelle und schreibt am Mac „Wahl".
 */
import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PlusPage } from "../src/features/public/PlusPage";
import { PlusUebung } from "../src/components/plus/PlusUebung";
import { backendZuruecksetzen } from "../src/lib/plus/fortschritt";
import { useTypingAuth } from "../src/components/typing/useTypingAuth";
import { useEinstellungen } from "../src/lib/plus/einstellungen";
import { UNIVERSAL_SHORTCUTS } from "../src/lib/shortcuts";

const plattformVorher = Object.getOwnPropertyDescriptor(Navigator.prototype, "platform");
function alsMac(mac: boolean) {
  Object.defineProperty(navigator, "platform", { configurable: true, get: () => (mac ? "MacIntel" : "Win32") });
}
beforeEach(() => {
  localStorage.clear();
  useTypingAuth.setState({ account: null });
  backendZuruecksetzen();
  useEinstellungen.setState({ eingabeart: "normal", zoomIndex: 0, zoom: 1 });
});
afterEach(() => {
  cleanup();
  delete (navigator as unknown as { platform?: string }).platform;
  if (plattformVorher) Object.defineProperty(Navigator.prototype, "platform", plattformVorher);
});

const takt = () => act(() => new Promise((r) => setTimeout(r, 10)));
const alt = (code: string, key = "x", ziel: Element | Window = window) =>
  fireEvent.keyDown(ziel, { code, key, altKey: true });

describe("(a) Alt + W, Alt + Z, Alt + E", () => {
  it("Alt + W sagt die Aufgabe noch einmal", () => {
    const ansagen = vi.fn();
    render(<PlusUebung paketId="1-08" onZurueck={() => {}} saat={4} ansagen={ansagen} />);
    ansagen.mockClear();
    alt("KeyW", "∑");
    expect(ansagen).toHaveBeenCalledTimes(1);
  });

  it("Alt + Z sagt, wo man ist - und holt die Rechnung NICHT zurück", async () => {
    const ansagen = vi.fn();
    render(<PlusUebung paketId="1-08" onZurueck={() => {}} saat={4} ansagen={ansagen} />);
    const feld = screen.getByLabelText("Deine Antwort") as HTMLTextAreaElement;
    fireEvent.change(feld, { target: { value: "" } });
    ansagen.mockClear();
    fireEvent.keyDown(feld, { code: "KeyY", key: "z", altKey: true }); // deutsche Tastatur, Z gedrückt
    expect(ansagen).toHaveBeenCalledWith("Aufgabe 1 von 8.");
    expect(feld.value).toBe("");
  });

  it("Alt + Y wirkt nicht mit", () => {
    const ansagen = vi.fn();
    render(<PlusUebung paketId="1-08" onZurueck={() => {}} saat={4} ansagen={ansagen} />);
    ansagen.mockClear();
    fireEvent.keyDown(window, { code: "KeyZ", key: "y", altKey: true }); // deutsche Tastatur, Y gedrückt
    expect(ansagen).not.toHaveBeenCalled();
  });

  it("Alt + E bringt ins Eingabefeld", async () => {
    render(<MemoryRouter><PlusPage /></MemoryRouter>);
    await waitFor(() => screen.getByText("Willkommen bei Plus!"));
    fireEvent.click(screen.getByRole("button", { name: /Los geht's/ }));
    fireEvent.click(screen.getByRole("button", { name: /3\. Schulstufe/ }));
    const feld = await screen.findByLabelText("Deine Antwort");
    (document.activeElement as HTMLElement | null)?.blur();
    screen.getByRole("button", { name: /Übung beenden/ }).focus();
    alt("KeyE", "€");
    expect(document.activeElement).toBe(feld);
  });
});

describe("(b) Esc führt ins Eingabefeld", () => {
  it("von einem Knopf der Übung zurück ins Feld", async () => {
    render(<MemoryRouter><PlusPage /></MemoryRouter>);
    await waitFor(() => screen.getByText("Willkommen bei Plus!"));
    fireEvent.click(screen.getByRole("button", { name: /Los geht's/ }));
    fireEvent.click(screen.getByRole("button", { name: /3\. Schulstufe/ }));
    const feld = await screen.findByLabelText("Deine Antwort");
    const knopf = screen.getByRole("button", { name: /Übung beenden/ });
    knopf.focus();
    fireEvent.keyDown(knopf, { key: "Escape" });
    await takt();
    expect(document.activeElement).toBe(feld);
  });
});

describe("(c) Hinter einem offenen Fenster wechselt Alt + B nichts", () => {
  it("die Hilfe ist offen ⇒ die Eingabeart bleibt", async () => {
    render(<MemoryRouter><PlusPage /></MemoryRouter>);
    await waitFor(() => screen.getByText("Willkommen bei Plus!"));
    fireEvent.click(screen.getByRole("button", { name: /^Hilfe/ }));
    expect(screen.getByRole("dialog", { name: "Plus - Hilfe" })).toBeInTheDocument();
    alt("KeyB", "∫", document.activeElement ?? window);
    expect(useEinstellungen.getState().eingabeart).toBe("normal");
  });
});

describe("(d) Die Liste - gemeinsame Quelle, am Mac „Wahl\"", () => {
  const liste = async () => {
    render(<MemoryRouter><PlusPage /></MemoryRouter>);
    await waitFor(() => screen.getByText("Willkommen bei Plus!"));
    fireEvent.click(screen.getByRole("button", { name: /Tastenkürzel/ }));
    return screen.getAllByRole("list").find((l) => l.textContent?.includes("Eingabeart wechseln")) as HTMLElement;
  };

  it("nennt alles, was überall gilt, dazu Alt + W, Alt + Z, Alt + E, Alt + G - und kein Alt + 8", async () => {
    alsMac(false);
    const l = await liste();
    for (const [k] of UNIVERSAL_SHORTCUTS) expect(l.textContent, k).toContain(k);
    for (const k of ["Alt + W", "Alt + Z", "Alt + E", "Alt + G", "Alt + S", "Strg + Enter"]) expect(l.textContent, k).toContain(k);
    expect(l.textContent).not.toContain("Alt + 8");
    expect(within(l).getByText(/Wahltaste/)).toBeInTheDocument();
  });

  it("am Mac steht „Wahl\" statt „Alt\"", async () => {
    alsMac(true);
    const l = await liste();
    expect(l.textContent).toContain("Wahl + W");
    expect(l.textContent).not.toMatch(/\bAlt \+/);
  });
});
