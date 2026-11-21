/**
 * ★★ WÄCHTER: Das Akustik-Menü unter dem Lautsprecher - Punktgenau und der
 * gemeinsame Klang-Motor von Punktgenau und Klangpunkte (Johannes, 17.10.2026:
 * „schau die anderen Apps der Lernwerkstatt an … bau sie und bau auch so einen
 * Schalter ein").
 *
 *  (a) In Punktgenau klappt der Lautsprecher ein Menü auf.
 *  (b) Drin: Vorlesen, Sprechtempo, Lautstärke der Stimme, Stimme,
 *      Fehler-Tipp, Töne, Lautstärke der Töne - jedes mit Erklärung.
 *  (c) Die Lautstärke der Stimme landet an JEDER Ansage (`u.volume`),
 *      die Lautstärke der Töne im Ton - und beides bleibt gespeichert.
 *  (d) „Töne an/aus" ist EIN Zustand: Menü und Einstellungsfenster sehen
 *      dasselbe (vorher hielt jede Seite ihren eigenen `useState`).
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { PunktgenauPage } from "@/features/public/PunktgenauPage";
import { speak, sprechLautstaerkeBegrenzen, useVoice } from "@/lib/braille/voice";
import { isSoundMuted, setSoundMuted, setTonLautstaerke, tonGipfel, tonLautstaerke, useBrailleTon } from "@/lib/braille/sound";

beforeEach(() => {
  localStorage.clear();
  setSoundMuted(false);
  setTonLautstaerke(1);
  useVoice.setState({ enabled: false, rate: 1, volume: 1, voiceURI: "", verbalizeErrors: true });
});
afterEach(cleanup);

const seite = () =>
  render(
    <MemoryRouter initialEntries={["/programme/punktgenau"]}>
      <PunktgenauPage />
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

describe("(a) Punktgenau: der Lautsprecher öffnet ein Menü", () => {
  it("aria-expanded statt aria-pressed", () => {
    seite();
    expect(lautsprecher()).toHaveAttribute("aria-expanded", "false");
    expect(lautsprecher()).not.toHaveAttribute("aria-pressed");
    expect(oeffne()).toBeInTheDocument();
  });
});

describe("(b) Alle Akustik-Einstellungen, jede mit Erklärung", () => {
  it("drei Schalter, drei Regler, eine Auswahl - nichts gesperrt", () => {
    // Tempo, Lautstärke der Stimme und Stimme erscheinen bei eingeschaltetem Vorlesen (Kartenform, 18.10.2026).
    useVoice.setState({ enabled: true });
    seite();
    const menue = oeffne();
    expect(within(menue).getAllByRole("switch").map(nameVon)).toEqual(["Vorlesen", "Fehler-Tipp", "Töne"]);
    const regler = within(menue).getAllByRole("slider") as HTMLInputElement[];
    expect(regler.map(nameVon)).toEqual(["Sprechtempo", "Lautstärke der Stimme", "Lautstärke der Töne"]);
    const stimme = within(menue).getByRole("combobox", { name: "Stimme" });
    for (const el of [...within(menue).getAllByRole("switch"), ...regler, stimme]) {
      expect(el).toBeEnabled();
      const id = el.getAttribute("aria-describedby");
      expect(document.getElementById(id ?? "")?.textContent?.length ?? 0, nameVon(el)).toBeGreaterThan(20);
    }
  });

  it("der Schalter Vorlesen geht denselben Weg wie Alt + V", () => {
    seite();
    const vorlesen = within(oeffne()).getByRole("switch", { name: "Vorlesen" });
    fireEvent.click(vorlesen);
    expect(useVoice.getState().enabled).toBe(true);
    expect(vorlesen).toHaveAttribute("aria-checked", "true");
  });
});

describe("(c) Die Lautstärken wirken und bleiben gespeichert", () => {
  it("Regler setzen Tempo, Stimm- und Tonlautstärke", () => {
    useVoice.setState({ enabled: true });
    seite();
    const [tempo, stimme, toene] = within(oeffne()).getAllByRole("slider");
    fireEvent.change(tempo, { target: { value: "1.4" } });
    fireEvent.change(stimme, { target: { value: "0.5" } });
    fireEvent.change(toene, { target: { value: "0.3" } });
    expect(useVoice.getState().rate).toBeCloseTo(1.4);
    expect(useVoice.getState().volume).toBeCloseTo(0.5);
    expect(tonLautstaerke()).toBeCloseTo(0.3);
    expect(JSON.parse(localStorage.getItem("braille-voice")!).volume).toBeCloseTo(0.5);
    expect(localStorage.getItem("braille-sound-laut")).toBe("0.3");
    expect(tonGipfel(0.2)).toBeCloseTo(0.06);
  });

  it("jede Ansage trägt die gewählte Lautstärke", () => {
    const gesprochen: { volume: number }[] = [];
    const vorher = (window as { speechSynthesis?: unknown }).speechSynthesis;
    class Satz { text: string; rate = 1; volume = 1; lang = ""; voice: unknown = null; onend: unknown; onerror: unknown; onstart: unknown; constructor(t: string) { this.text = t; } }
    Object.assign(window, {
      speechSynthesis: { cancel: () => {}, speak: (u: { volume: number }) => gesprochen.push(u), getVoices: () => [], paused: false, resume: () => {}, speaking: false, pending: false, addEventListener: () => {}, removeEventListener: () => {} },
      SpeechSynthesisUtterance: Satz,
    });
    try {
      useVoice.setState({ enabled: true, volume: 0.4 });
      speak("Probe");
      expect(gesprochen.at(-1)?.volume).toBeCloseTo(0.4);
    } finally {
      Object.assign(window, { speechSynthesis: vorher });
    }
  });

  it("Grenzen: Stimme nie unter 10 Prozent, kaputte Werte werden voll", () => {
    expect(sprechLautstaerkeBegrenzen(0)).toBe(0.1);
    expect(sprechLautstaerkeBegrenzen("laut")).toBe(1);
    setTonLautstaerke(7);
    expect(tonLautstaerke()).toBe(1);
  });
});

describe("(d) Töne an/aus ist EIN Zustand", () => {
  it("das Menü schaltet den gemeinsamen Speicher", () => {
    seite();
    const toene = within(oeffne()).getByRole("switch", { name: "Töne" });
    expect(toene).toHaveAttribute("aria-checked", "true");
    fireEvent.click(toene);
    expect(isSoundMuted()).toBe(true);
    expect(useBrailleTon.getState().muted).toBe(true);
    expect(toene).toHaveAttribute("aria-checked", "false");
    expect(localStorage.getItem("braille-sound-muted")).toBe("1");
  });
});
