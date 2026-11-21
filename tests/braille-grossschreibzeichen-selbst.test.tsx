/**
 * ★ Großschreibzeichen selbst einstellen - für alle OHNE Klasse (20.09.2026,
 * Auftrag Johannes: „Nimm die Großumschaltung auch in die Einstellungen der
 * Schüler. Wer nicht angemeldet ist oder selbst übt, darf immer alles selbst
 * einstellen. Schüler einer Klasse werden von den Lehrkräften eingestellt.")
 *
 * Bis dahin gab es den Schalter NUR als Klassen-Einstellung
 * (`PunktgenauReiter.tsx`, siehe `tests/braille-grossschreibzeichen.test.tsx`)
 * - wer zu keiner Klasse gehört (nicht angemeldet, selbstlernendes Konto,
 * Lehrkraft, Studierende - `ohneKlasse` in `Punktgenau.tsx`), kam gar nicht
 * daran. Jetzt bekommt diese Gruppe eine eigene, im Browser gespeicherte
 * Einstellung (`eigeneGrossschreibzeichen.ts`), sichtbar im Einstellungs-
 * Fenster (Alt + O) als Schalter; ein Kind in einer Klasse sieht dort
 * stattdessen nur den Hinweis, wer einstellt - die Klassen-Einstellung der
 * Lehrkraft gilt für dieses Kind unverändert weiter.
 *
 * Geprüft wird die END-ZU-END-Wirkung, nicht nur der Schalter selbst: die
 * Etappe „Große Anfangsbuchstaben — Namen" (b4, Basisschrift) zeigt Wörter mit
 * genau einem großen Anfangsbuchstaben - die Braille-Vorlage im Lese-Modus
 * listet jede Zelle einzeln auf („Braille-Vorlage, Zelle für Zelle"); die
 * Groß-Ankündigung selbst trägt die Punkte 4 und 6 (`dotsLabel` →
 * „Punkte 4, 6"). Fehlt sie, hat die Engine wirklich abgeschaltet.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Punktgenau } from "@/components/braille/Punktgenau";
import { useBraillePlay } from "@/lib/braille/play";

const KEY = "braille-grossschreibzeichen-eigen";

function frischerZustand() {
  act(() =>
    useBraillePlay.setState({
      focusInputNonce: 0,
      charsOpen: false,
      charsNonce: 0,
      settingsOpen: false,
      settingsNonce: 0,
      paused: false,
    }),
  );
}

beforeEach(() => {
  localStorage.removeItem(KEY);
  frischerZustand();
});

afterEach(() => {
  cleanup();
  localStorage.removeItem(KEY);
});

const NAMEN_ETAPPE = /Große Anfangsbuchstaben/;
const ANKUENDIGUNG = "Punkte 4, 6"; // dotsLabel(CAPS_LETTER) — Punkte 4 und 6

/** Springt zur Namen-Etappe (b4) im Lese-Modus - jedes Wort dort trägt genau
 *  EINEN großen Anfangsbuchstaben, welches also erscheint, ist gleich. */
async function zurNamenEtappeLesen() {
  fireEvent.click(screen.getByRole("radio", { name: "Lesen" }));
  const auswahl = screen.getByRole("combobox", { name: /Kapitel \(Etappe\)/ });
  await userEvent.selectOptions(auswahl, within(auswahl).getByRole("option", { name: NAMEN_ETAPPE }));
}

function vorlagenzellen(): string[] {
  const liste = screen.getByRole("list", { name: "Braille-Vorlage, Zelle für Zelle" });
  return within(liste)
    .getAllByRole("listitem")
    .map((li) => li.textContent ?? "");
}

function oeffneEinstellungen() {
  act(() => useBraillePlay.getState().requestSettings());
}

describe("Großschreibzeichen ohne Klasse - eigene, gespeicherte Einstellung", () => {
  it("Standard ohne jede Einstellung: Großschreibzeichen AN", async () => {
    render(<Punktgenau ohneKlasse />);
    await zurNamenEtappeLesen();
    expect(vorlagenzellen().some((z) => z.includes(ANKUENDIGUNG))).toBe(true);

    oeffneEinstellungen();
    const schalter = screen.getByRole("button", { name: /Großschreibzeichen (an|aus)/ });
    expect(schalter.textContent).toBe("Großschreibzeichen an");
  });

  it("Schalter ist da, erreichbar, und Umschalten ändert die Zellen der Aufgabe", async () => {
    render(<Punktgenau ohneKlasse />);
    await zurNamenEtappeLesen();

    oeffneEinstellungen();
    const schalter = screen.getByRole("button", { name: /Großschreibzeichen (an|aus)/ });
    // Bauart-Pflicht: nie `disabled`, jeder Schalter bleibt per Tastatur erreichbar.
    expect(schalter.hasAttribute("disabled")).toBe(false);
    expect(schalter.getAttribute("tabindex")).not.toBe("-1");
    expect(schalter.getAttribute("aria-pressed")).toBe("true");

    // AN: die Ankündigungszelle (Punkte 4·6) steht vor dem großen Buchstaben.
    expect(vorlagenzellen().some((z) => z.includes(ANKUENDIGUNG))).toBe(true);

    fireEvent.click(schalter);
    expect(schalter.textContent).toBe("Großschreibzeichen aus");
    // AUS: die Zelle fehlt - der Buchstabe selbst bleibt (die übrigen Zellen
    // der Vorlage sind unverändert, nur eine weniger).
    expect(vorlagenzellen().some((z) => z.includes(ANKUENDIGUNG))).toBe(false);

    fireEvent.click(schalter);
    expect(schalter.textContent).toBe("Großschreibzeichen an");
    expect(vorlagenzellen().some((z) => z.includes(ANKUENDIGUNG))).toBe(true);
  });

  it("überlebt einen Neuaufbau der Komponente (localStorage)", async () => {
    render(<Punktgenau ohneKlasse />);
    oeffneEinstellungen();
    fireEvent.click(screen.getByRole("button", { name: /Großschreibzeichen (an|aus)/ }));
    expect(localStorage.getItem(KEY)).toBe(JSON.stringify({ grossschreibzeichen: false }));

    // Neuaufbau der Komponente (Seitenwechsel/Reload) - derselbe Speicher.
    // Der Spiel-Zustand (Alt+O-Zähler) wird dabei frisch, wie bei einem
    // echten Seitenwechsel - sonst öffnete/schlösse ein Rest-Zähler aus dem
    // vorigen Aufbau die Einstellungen hier ungewollt gleich wieder zu.
    cleanup();
    frischerZustand();
    render(<Punktgenau ohneKlasse />);
    oeffneEinstellungen();
    expect(screen.getByRole("button", { name: /Großschreibzeichen (an|aus)/ }).textContent).toBe(
      "Großschreibzeichen aus",
    );

    // Die scharfe Probe: ein GANZ FRISCHES Modul (eigener Speicher-Zugriff,
    // kein wiederverwendeter zustand-Store) liest denselben Wert aus
    // localStorage - genau das behauptet „überlebt einen Neuaufbau".
    vi.resetModules();
    const frisch = await import("@/lib/braille/eigeneGrossschreibzeichen");
    expect(frisch.useEigeneGrossschreibzeichen.getState().grossschreibzeichen).toBe(false);
  });
});

describe("Großschreibzeichen für ein Kind in einer Klasse", () => {
  it("kein Schalter, sondern der Hinweis-Satz - die Klassen-Einstellung gilt weiter (grossschreibzeichen: false)", async () => {
    render(
      <Punktgenau
        accountId="k1"
        // freeChoice nur, um die Namen-Etappe ohne Meistern der vorigen
        // erreichen zu können - eigenständig schon in
        // tests/braille-etappen-freie-wahl.test.tsx geprüft.
        classSettings={{ grossschreibzeichen: false }}
      />,
    );
    await zurNamenEtappeLesen();

    // Kein Schalter für das Kind.
    expect(screen.queryByRole("button", { name: /Großschreibzeichen/ })).toBeNull();

    oeffneEinstellungen();
    expect(screen.queryByRole("button", { name: /Großschreibzeichen/ })).toBeNull();
    expect(
      screen.getByText(/Das stellt deine Lehrkraft für die Klasse ein\./),
    ).toBeTruthy();
    expect(screen.getByText(/gerade aus\./)).toBeTruthy();

    // Die Klassen-Einstellung wirkt tatsächlich: keine Ankündigungszelle.
    expect(vorlagenzellen().some((z) => z.includes(ANKUENDIGUNG))).toBe(false);
  });
});
