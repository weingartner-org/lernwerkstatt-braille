/**
 * ★★★ TON UND VORLESEN HABEN EINE TÜR - das Menü unter dem Lautsprecher.
 *
 * Geschichte dieses Wächters:
 *  - 30.08.2026: Johannes, nachdem gemessen war, dass zwei Vorlese-Knöpfe
 *    gleichzeitig auf dem Schirm standen: „nimm den doppelten schalter raus,
 *    tempo und stimme bleiben". Damals blieben Tempo und Stimme in der
 *    Werkzeugzeile (`VoiceControls`).
 *  - 17.10.2026: Johannes: „Ton- und Vorlese-Einstellungen nur noch im Menü
 *    unter dem Lautsprecher, aus Einstellungsfenstern und der
 *    Klangpunkte-Leiste raus." `VoiceControls` ist damit entfallen.
 *
 * Was gleich bleibt: EINE Stelle je Einstellung, kein Doppel. Was sich
 * geändert hat: diese Stelle ist jetzt das Menü - und Tempo und Stimme sind
 * dort GEBLIEBEN (Johannes' „tempo und stimme bleiben" gilt weiter).
 *
 * Geprüft:
 *  1. Im Punktgenau-Einstellungsfenster gibt es keinen Ton- oder
 *     Vorlese-Schalter mehr, nur den Wegweiser.
 *  2. In der Klangpunkte-Leiste gibt es keinen „Sounds"-Knopf und keine
 *     Tempo- oder Stimmenwahl mehr.
 *  3. Tempo und Stimme stehen im Menü - in beiden Apps.
 */
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { useVoice } from "../src/lib/braille/voice";
import { PunktgenauEinstellungen } from "../src/components/braille/PunktgenauEinstellungen";
import { PunktgenauPage } from "../src/features/public/PunktgenauPage";
import { KlangpunktePage } from "../src/features/public/KlangpunktePage";

afterEach(() => {
  cleanup();
  useVoice.setState({ enabled: false });
});

const lautsprecher = () => screen.getByRole("button", { name: "Klang und Vorlesen" });
const menue = () => {
  fireEvent.click(lautsprecher());
  return document.getElementById(lautsprecher().getAttribute("aria-controls")!) as HTMLElement;
};

describe("Ton und Vorlesen - eine Tür, und die ist das Menü", () => {
  it("1. das Einstellungsfenster von Punktgenau hat keine Ton- und Vorlese-Schalter mehr, nur den Wegweiser", () => {
    render(
      <PunktgenauEinstellungen
        onClose={() => {}}
        grossschreibzeichen
        ohneKlasse
        onToggleGrossschreibzeichen={() => {}}
      />,
    );
    const fenster = screen.getByRole("dialog");
    expect(within(fenster).queryByRole("button", { name: /Sounds|Fehler-Tipp|Vorlesen/ })).toBeNull();
    expect(within(fenster).queryByRole("combobox")).toBeNull();
    expect(fenster).toHaveTextContent(/Menü unter dem Lautsprecher/);
    // Das Großschreibzeichen ist keine Ton-Einstellung - es bleibt.
    expect(within(fenster).getByRole("button", { name: /Großschreibzeichen/ })).toBeInTheDocument();
  });

  it("2. die Klangpunkte-Leiste hat keinen Sounds-Knopf und keine Tempo- oder Stimmenwahl", () => {
    render(
      <MemoryRouter initialEntries={["/programme/klangpunkte"]}>
        <KlangpunktePage />
      </MemoryRouter>,
    );
    expect(screen.queryByRole("button", { name: /Sounds/ })).toBeNull();
    expect(screen.queryByRole("combobox", { name: /Sprechtempo|Stimme der Sprachausgabe/ })).toBeNull();
  });

  it("3. Tempo und Stimme sind geblieben - im Menü, in Punktgenau und Klangpunkte", () => {
    for (const [pfad, Seite] of [
      ["/programme/punktgenau", PunktgenauPage],
      ["/programme/klangpunkte", KlangpunktePage],
    ] as const) {
      render(
        <MemoryRouter initialEntries={[pfad]}>
          <Seite />
        </MemoryRouter>,
      );
      const m = menue();
      // Tempo und Stimme stehen in der Karte „Vorlesen", sobald es an ist (Kartenform, 18.10.2026).
      if (within(m).getByRole("switch", { name: "Vorlesen" }).getAttribute("aria-checked") !== "true") {
        fireEvent.click(within(m).getByRole("switch", { name: "Vorlesen" }));
      }
      expect(within(m).getByRole("slider", { name: "Sprechtempo" }), pfad).toBeInTheDocument();
      expect(within(m).getByRole("combobox", { name: "Stimme" }), pfad).toBeInTheDocument();
      cleanup();
    }
  });
});
