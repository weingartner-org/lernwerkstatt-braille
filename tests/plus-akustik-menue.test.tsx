/**
 * ★★ WÄCHTER: Das Akustik-Menü unter dem Lautsprecher (Johannes, 17.10.2026:
 * „unter dem runden Lautsprecher-Schalter ein Menü mit allen Akustik-
 * Einstellungen mit Schiebereglern und Erklärung beim Darüberfahren").
 *
 *  (a) Der Lautsprecher klappt das Menü auf (aria-expanded) - in Plus. Die
 *      anderen Apps behalten den reinen Schalter (aria-pressed).
 *  (b) Fünf Einstellungen: zwei Schalter, drei Regler. Jeder Regler sagt
 *      seinen Wert in Worten, jede Einstellung trägt ihre Erklärung.
 *  (c) Die Regler wirken: Tempo und Lautstärke landen in der Stimme, die
 *      Lautstärke der Töne im Ton - und bleiben auf dem Gerät gespeichert.
 *  (d) Escape schließt - und führt nach der Hausregel „Esc ⇒ Eingabefeld"
 *      (Johannes, 18.10.2026, Kürzel einheitlich) ins Feld; ohne Feld auf die
 *      Überschrift des Bereichs. Bis 18.10. stand der Fokus wieder am Lautsprecher.
 */
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PlusPage } from "../src/features/public/PlusPage";
import { AppKopfzeile } from "../src/components/AppKopfzeile";
import { backendZuruecksetzen } from "../src/lib/plus/fortschritt";
import { useTypingAuth } from "../src/components/typing/useTypingAuth";
import { sage, setzeStimmeLautstaerke, setzeStimmeTempo, stimmeLautstaerke, stimmeTempo } from "../src/lib/plus/stimme";
import { setzeTonLautstaerke, tonLautstaerke } from "../src/lib/plus/ton";
import { prozentText, tempoText } from "../src/components/plus/PlusAkustik";

beforeEach(() => {
  localStorage.clear();
  useTypingAuth.setState({ account: null });
  backendZuruecksetzen();
  setzeStimmeTempo(1);
  setzeStimmeLautstaerke(1);
  setzeTonLautstaerke(1);
});

const start = async () => {
  render(<MemoryRouter><PlusPage /></MemoryRouter>);
  await waitFor(() => screen.getByText("Willkommen bei Plus!"));
};
/** Der Name, den auch die Sprachausgabe hört: `aria-label` oder die Beschriftung. */
const nameVon = (el: Element) =>
  el.getAttribute("aria-label") ?? (el as HTMLInputElement).labels?.[0]?.textContent ?? el.textContent ?? "";
/** Vorlesen ist an - Tempo und Lautstärke der Stimme stehen dann in der Karte (Kartenform, 18.10.2026). */
const mitVorlesen = () => localStorage.setItem("plus_stimme", "an");
const lautsprecher = () => screen.getByRole("button", { name: "Klang und Vorlesen" });
const oeffne = () => {
  fireEvent.click(lautsprecher());
  return document.getElementById(lautsprecher().getAttribute("aria-controls")!) as HTMLElement;
};

describe("(a) Der Lautsprecher öffnet ein Menü", () => {
  it("in Plus: aria-expanded, kein aria-pressed", async () => {
    await start();
    expect(lautsprecher()).toHaveAttribute("aria-expanded", "false");
    expect(lautsprecher()).not.toHaveAttribute("aria-pressed");
    const menue = oeffne();
    expect(lautsprecher()).toHaveAttribute("aria-expanded", "true");
    expect(menue).toBeInTheDocument();
  });

  it("ohne Menü bleibt der Knopf der Schalter von vorher - so sehen ihn die anderen Apps", () => {
    const umschalten = vi.fn();
    render(
      <MemoryRouter>
        <AppKopfzeile titel="Probe" onHilfe={() => {}} onKurztasten={() => {}} onVorlesen={umschalten} vorlesenAn={false} />
      </MemoryRouter>,
    );
    const knopf = screen.getByRole("button", { name: /^Vorlesen \(Alt \+ V\)/ });
    expect(knopf).toHaveAttribute("aria-pressed", "false");
    expect(knopf).not.toHaveAttribute("aria-expanded");
    fireEvent.click(knopf);
    expect(umschalten).toHaveBeenCalledTimes(1);
  });
});

describe("(a2) Kartenform wie Tastenflow (Johannes, 18.10.2026)", () => {
  it("eine Karte je Bereich: Symbol, Name und Schalter in einer Zeile", async () => {
    await start();
    const menue = oeffne();
    const karten = [...menue.querySelectorAll("section")];
    expect(karten.map((k) => k.querySelector("h3")?.textContent)).toEqual(["Plus liest vor", "Töne"]);
    for (const k of karten) {
      expect(k.querySelector("svg[aria-hidden='true']"), "Symbol").not.toBeNull();
      expect(k.querySelector("[role=switch]"), "Schalter").not.toBeNull();
    }
    // Die Überschrift „Klang und Vorlesen" steht nur noch für Screenreader da.
    expect(within(menue).getByText("Klang und Vorlesen").className).toContain("sr-only");
  });
});

describe("(b) Fünf Einstellungen mit Erklärung", () => {
  it("zwei Schalter und drei Regler, keiner gesperrt, jeder mit Erklärung", async () => {
    mitVorlesen();
    await start();
    const menue = oeffne();
    const schalter = within(menue).getAllByRole("switch");
    expect(schalter.map(nameVon)).toEqual(["Plus liest vor", "Töne"]);
    const regler = within(menue).getAllByRole("slider");
    expect(regler.map(nameVon)).toEqual([
      "Sprechtempo", "Lautstärke der Stimme", "Lautstärke der Töne",
    ]);
    for (const el of [...schalter, ...regler]) {
      expect(el).toBeEnabled();
      const id = el.getAttribute("aria-describedby");
      expect(id, nameVon(el)).toBeTruthy();
      expect(document.getElementById(id!)?.textContent?.length ?? 0).toBeGreaterThan(20);
    }
  });

  it("die Regler sagen ihren Wert in Worten", async () => {
    mitVorlesen();
    await start();
    const [tempo, laut] = within(oeffne()).getAllByRole("slider");
    expect(tempo).toHaveAttribute("aria-valuetext", "1,0-fach, normal");
    expect(laut).toHaveAttribute("aria-valuetext", "100 Prozent");
    expect(tempoText(1.3)).toBe("1,3-fach");
    expect(prozentText(0.4)).toBe("40 Prozent");
  });

  it("der Schalter Vorlesen ist derselbe Zustand wie Alt + V", async () => {
    await start();
    const menue = oeffne();
    const vorlesen = within(menue).getByRole("switch", { name: "Plus liest vor" });
    expect(vorlesen).toHaveAttribute("aria-checked", "false");
    fireEvent.click(vorlesen);
    expect(vorlesen).toHaveAttribute("aria-checked", "true");
    expect(localStorage.getItem("plus_stimme")).toBe("an");
  });
});

describe("(c) Die Regler wirken und bleiben gespeichert", () => {
  it("Tempo und Lautstärke kommen in der Stimme an, die Lautstärke der Töne im Ton", async () => {
    mitVorlesen();
    await start();
    const [tempo, stimmLaut, tonLaut] = within(oeffne()).getAllByRole("slider");
    fireEvent.change(tempo, { target: { value: "1.3" } });
    fireEvent.change(stimmLaut, { target: { value: "0.5" } });
    fireEvent.change(tonLaut, { target: { value: "0.2" } });
    expect(stimmeTempo()).toBeCloseTo(1.3);
    expect(stimmeLautstaerke()).toBeCloseTo(0.5);
    expect(tonLautstaerke()).toBeCloseTo(0.2);
    expect(localStorage.getItem("plus_stimme_tempo")).toBe("1.3");
    expect(localStorage.getItem("plus_ton_laut")).toBe("0.2");
  });

  it("die Stimme spricht mit dem gewählten Tempo und der gewählten Lautstärke", () => {
    const gesprochen: SpeechSynthesisUtterance[] = [];
    const vorher = (window as { speechSynthesis?: unknown }).speechSynthesis;
    class Satz { text: string; rate = 1; volume = 1; lang = ""; constructor(t: string) { this.text = t; } }
    Object.assign(window, {
      speechSynthesis: { cancel: () => {}, speak: (u: SpeechSynthesisUtterance) => gesprochen.push(u) },
      SpeechSynthesisUtterance: Satz,
    });
    try {
      setzeStimmeTempo(1.4);
      setzeStimmeLautstaerke(0.6);
      sage("Probe");
      expect(gesprochen[0].rate).toBeCloseTo(1.4);
      expect(gesprochen[0].volume).toBeCloseTo(0.6);
    } finally {
      Object.assign(window, { speechSynthesis: vorher });
    }
  });

  it("Werte ausserhalb der Grenzen werden eingefangen", () => {
    setzeStimmeTempo(9);
    expect(stimmeTempo()).toBe(1.6);
    setzeTonLautstaerke(-1);
    expect(tonLautstaerke()).toBe(0);
  });
});

describe("(d) Escape schließt das Menü", () => {
  it("ohne Eingabefeld (Startseite) steht der Fokus auf der Überschrift", async () => {
    await start();
    const menue = oeffne();
    await waitFor(() => expect(menue.contains(document.activeElement)).toBe(true));
    fireEvent.keyDown(document.activeElement!, { key: "Escape" });
    expect(lautsprecher()).toHaveAttribute("aria-expanded", "false");
    await waitFor(() => expect(document.activeElement?.tagName).toMatch(/^H[12]$/));
  });

  it("in der Übung steht der Fokus wieder im Eingabefeld", async () => {
    await start();
    fireEvent.click(screen.getByRole("button", { name: /Los geht's/ }));
    fireEvent.click(screen.getByRole("button", { name: /3\. Schulstufe/ }));
    const feld = await screen.findByLabelText("Deine Antwort");
    const menue = oeffne();
    await waitFor(() => expect(menue.contains(document.activeElement)).toBe(true));
    fireEvent.keyDown(document.activeElement!, { key: "Escape" });
    await waitFor(() => expect(document.activeElement).toBe(feld));
    expect(lautsprecher()).toHaveAttribute("aria-expanded", "false");
  });
});
