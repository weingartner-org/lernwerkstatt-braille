/**
 * ★★ WÄCHTER: Das Akustik-Menü von Klangpunkte (Johannes, 17.10.2026: „bau
 * auch so einen Schalter ein").
 *
 *  (a) Der Lautsprecher klappt ein Menü auf - das der Braille-Apps
 *      (Vorlesen, Tempo, Stimme, Töne …), aber OHNE Fehler-Tipp: den bietet
 *      Klangpunkte nicht an.
 *  (b) Dazu die Musik: Instrument (derselbe Speicher wie im Aufgabenkopf) und
 *      Lautstärke der Musik (wirkt auf den Master der Instrumente, gespeichert).
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { KlangpunktePage } from "@/features/public/KlangpunktePage";
import { musikLautstaerke, setzeMusikLautstaerke } from "@/lib/klangpunkte/audio";
import { useMusicSettings } from "@/lib/klangpunkte/store";
import { useVoice } from "@/lib/braille/voice";

beforeEach(() => {
  localStorage.clear();
  useVoice.setState({ enabled: false });
  setzeMusikLautstaerke(1);
  useMusicSettings.getState().setInstrument("klavier");
});
afterEach(cleanup);

const seite = () =>
  render(
    <MemoryRouter initialEntries={["/programme/klangpunkte"]}>
      <KlangpunktePage />
    </MemoryRouter>,
  );
/** Der Name, den auch die Sprachausgabe hört: `aria-label` oder die Beschriftung. */
const nameVon = (el: Element) =>
  el.getAttribute("aria-label") ?? (el as HTMLInputElement).labels?.[0]?.textContent ?? el.textContent ?? "";
const lautsprecher = () => screen.getByRole("button", { name: "Klang und Vorlesen" });
const oeffne = () => {
  fireEvent.click(lautsprecher());
  return document.getElementById(lautsprecher().getAttribute("aria-controls")!) as HTMLElement;
};

describe("(a) Das Menü der Braille-Apps", () => {
  it("klappt auf, mit Vorlesen und Tönen - ohne Fehler-Tipp", () => {
    seite();
    expect(lautsprecher()).toHaveAttribute("aria-expanded", "false");
    const menue = oeffne();
    expect(within(menue).getAllByRole("switch").map(nameVon)).toEqual(["Vorlesen", "Töne"]);
  });
});

describe("(b) Die Musik", () => {
  it("vier Regler: Tempo, Stimme, Töne, Musik - und zwei Auswahlen", () => {
    // Tempo, Lautstärke der Stimme und Stimme erscheinen bei eingeschaltetem Vorlesen (Kartenform, 18.10.2026).
    useVoice.setState({ enabled: true });
    seite();
    const menue = oeffne();
    expect((within(menue).getAllByRole("slider") as HTMLInputElement[]).map(nameVon)).toEqual([
      "Sprechtempo", "Lautstärke der Stimme", "Lautstärke der Töne", "Lautstärke der Musik",
    ]);
    expect(within(menue).getAllByRole("combobox").map(nameVon)).toEqual([
      "Stimme", "Instrument",
    ]);
  });

  it("die Lautstärke der Musik wird gesetzt und gespeichert", () => {
    seite();
    const musik = within(oeffne()).getByRole("slider", { name: "Lautstärke der Musik" });
    fireEvent.change(musik, { target: { value: "0.4" } });
    expect(musikLautstaerke()).toBeCloseTo(0.4);
    expect(localStorage.getItem("klangpunkte-musik-laut")).toBe("0.4");
    expect(musik).toHaveAttribute("aria-valuetext", "40 Prozent");
  });

  it("das Instrument ist derselbe Speicher wie im Aufgabenkopf", () => {
    seite();
    const wahl = within(oeffne()).getByRole("combobox", { name: "Instrument" });
    fireEvent.change(wahl, { target: { value: "sax" } });
    expect(useMusicSettings.getState().instrument).toBe("sax");
  });
});
