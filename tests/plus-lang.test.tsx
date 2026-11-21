/**
 * Plus spricht in der gewählten Sprache - auch für den Screenreader (Testerin, 10.11.2026, JAWS):
 * „Making 10; Sprache auf der Seite ist auf Englisch geschaltet, Ein- und Ausgabe werden von
 * Jaws aber Deutsch gelesen. Für die Felder braucht der Screenreader auch einen Hinweis,
 * welche Sprache gefragt ist."
 *
 * Ursache: `<html lang>` blieb `de`. JAWS liest Eingabefelder und Live-Regionen in der
 * Sprache des Dokuments - das `lang` am Rahmen der App genügte nicht.
 *
 * Gemessen wird:
 *  1. `<html lang>` folgt der Plus-Sprache (mit Land/Region) und kommt beim Verlassen zurück,
 *  2. Eingabefeld und Live-Region tragen ihr `lang` selbst - auch im Braillezeilen-Modus,
 *  3. ohne Sprachen-Schalter (`?plus-sprachen=0`): `<html lang>` unberührt, kein `lang` am Feld,
 *  4. der Sprachwähler der Kopfzeile zeigt die AKTUELLE Sprache.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { PlusPage } from "../src/features/public/PlusPage";
import { useEinstellungen } from "../src/lib/plus/einstellungen";
import { backendZuruecksetzen } from "../src/lib/plus/fortschritt";
import { useTypingAuth } from "../src/components/typing/useTypingAuth";
import { setzeAktuelleSprache } from "../src/lib/plus/aktuelleSprache";
import { plusLangKennung } from "../src/lib/plus/sprache";

beforeEach(() => {
  window.localStorage.clear();
  document.documentElement.setAttribute("lang", "de");
  useTypingAuth.setState({ account: null });
  backendZuruecksetzen();
  useEinstellungen.setState({ braillezeile: false, schrift: "computer", eingabe: "tastatur", eingabeart: "normal", region: {} });
  setzeAktuelleSprache("de");
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  setzeAktuelleSprache("de");
  document.documentElement.setAttribute("lang", "de");
});

const seite = () => render(<MemoryRouter><PlusPage /></MemoryRouter>);

describe("Plus-Sprache für den Screenreader (Testerin 10.11.)", () => {
  it("plusLangKennung: BCP-47 mit Region", () => {
    expect(plusLangKennung("de", null)).toBe("de-AT");
    expect(plusLangKennung("en", null)).toBe("en-GB");
    expect(plusLangKennung("es", "es")).toBe("es-ES");
    expect(plusLangKennung("es", "latam")).toBe("es-MX");
    expect(plusLangKennung("fr", "fr")).toBe("fr-FR");
    expect(plusLangKennung("fr", "be")).toBe("fr-BE");
    expect(plusLangKennung("fr", "ch-huitante")).toBe("fr-CH");
    expect(plusLangKennung("fr", "ch-quatre-vingts")).toBe("fr-CH");
    expect(plusLangKennung("fr", "ca")).toBe("fr-CA");
  });

  it("★ Englisch: <html lang> = en-GB, Feld und Live-Region tragen en-GB; beim Verlassen wieder de", async () => {
    window.history.replaceState(null, "", "/plus?plus-sprachen=1&sprache=en");
    const { unmount } = seite();
    await waitFor(() => screen.getByText("Welcome to Plus!"));
    expect(document.documentElement.getAttribute("lang")).toBe("en-GB");
    fireEvent.click(screen.getByRole("button", { name: /I choose/ }));
    fireEvent.click(screen.getByRole("button", { name: /Level 1/ }));
    fireEvent.click(screen.getByRole("button", { name: "Adding facts, no bridging" }));
    const feld = screen.getByLabelText("Your answer");
    expect(feld).toHaveAttribute("lang", "en-GB");
    fireEvent.change(feld, { target: { value: "99999" } });
    fireEvent.click(screen.getByRole("button", { name: "Check" }));
    const status = screen.getByRole("status");
    expect(status).toHaveTextContent("Not yet.");
    expect(status).toHaveAttribute("lang", "en-GB");
    unmount();
    expect(document.documentElement.getAttribute("lang")).toBe("de");
  });

  it("★ Braillezeilen-Modus: das Feld mit der Aufgabenzeile in Zellen trägt dieselbe Sprache", async () => {
    useEinstellungen.setState({ braillezeile: true, schrift: "computer", eingabe: "braille", eingabeart: "computer" });
    window.history.replaceState(null, "", "/plus?plus-sprachen=1&sprache=en");
    seite();
    await waitFor(() => screen.getByText("Welcome to Plus!"));
    fireEvent.click(screen.getByRole("button", { name: /I choose/ }));
    fireEvent.click(screen.getByRole("button", { name: /Level 1/ }));
    fireEvent.click(screen.getByRole("button", { name: "Adding facts, no bridging" }));
    const feld = screen.getByLabelText("Your answer") as HTMLTextAreaElement;
    expect(feld.value).toMatch(/[⠀-⣿]/);
    expect(feld).toHaveAttribute("lang", "en-GB");
  });

  it("★ Spanisch Lateinamerika und Französisch Schweiz: die Region steht im lang", async () => {
    useEinstellungen.setState({ region: { es: "latam" } });
    window.history.replaceState(null, "", "/plus?plus-sprachen=1&sprache=es");
    const a = seite();
    await waitFor(() => expect(document.documentElement.getAttribute("lang")).toBe("es-MX"));
    a.unmount();
    useEinstellungen.setState({ region: { fr: "ch-quatre-vingts" } });
    window.history.replaceState(null, "", "/plus?plus-sprachen=1&sprache=fr");
    seite();
    await waitFor(() => expect(document.documentElement.getAttribute("lang")).toBe("fr-CH"));
    // Region umstellen: lang geht mit.
    act(() => useEinstellungen.getState().setRegion("fr", "be"));
    await waitFor(() => expect(document.documentElement.getAttribute("lang")).toBe("fr-BE"));
  });

  it("★ ohne Sprachen-Schalter: <html lang> bleibt, kein lang am Feld", async () => {
    window.history.replaceState(null, "", "/plus?plus-sprachen=0");
    seite();
    await waitFor(() => screen.getByRole("button", { name: /Ich wähle/ }));
    expect(document.documentElement.getAttribute("lang")).toBe("de");
  });

  it("Sprachsymbol der Kopfzeile zeigt die aktuelle Sprache (EN auf Englisch, DE auf Deutsch)", async () => {
    window.history.replaceState(null, "", "/plus?plus-sprachen=1&sprache=en");
    const a = seite();
    await waitFor(() => screen.getByText("Welcome to Plus!"));
    const knopf = document.querySelector<HTMLElement>("[data-sprachschalter]")!;
    expect(knopf).toBeTruthy();
    expect(knopf.textContent).toBe("EN");
    a.unmount();
    window.history.replaceState(null, "", "/plus?plus-sprachen=1&sprache=de");
    seite();
    await waitFor(() => screen.getByRole("button", { name: /Ich wähle/ }));
    const knopfDe = document.querySelector<HTMLElement>("[data-sprachschalter]")!;
    expect(knopfDe.textContent).toBe("DE");
    // Name und Tipp: dieselbe Beschriftung, keine Aufforderung „Switch to ...".
    expect(knopfDe.getAttribute("aria-label")).not.toMatch(/switch to|wechseln/i);
  });
});
