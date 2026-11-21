/**
 * ★★★ Punktgenau am echten Bildschirm: Kürzel aus dem Antwortfeld, Ergebnis am Fokus
 * ============================================================================
 * Gemessen am 29.09.2026, bevor etwas geändert wurde:
 *
 * 1. Beim Lesen steht der Fokus IMMER im Antwortfeld - und die Kürzel-Wache
 *    der Seite schaltete in jedem Feld jedes Alt-Kürzel ab. Alt + P, Alt + W,
 *    Alt + Z, Alt + 1 bis 5 … taten dort nichts, obwohl Hilfe und Kurztasten-
 *    liste sie versprechen.
 * 2. Nach einer falschen Antwort springt der Fokus auf „Nochmal" - und dessen
 *    Name war nur „Nochmal". Die Lösung stand in einer Statusfläche, die die
 *    Braillezeile ein paar Sekunden verdrängt und dann weg ist.
 *
 * Die Probe lädt die ECHTE SEITE und geht den Weg des Kindes (wie
 * `punktgenau-stand-auf-der-zeile.test.tsx`). Die Quelltext-Klassen stehen in
 * `braille-fokus-und-bewegung.test.ts`.
 */
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { PunktgenauPage } from "@/features/public/PunktgenauPage";

afterEach(cleanup);

function zeigeSeite() {
  render(
    <MemoryRouter initialEntries={["/programme/punktgenau"]}>
      <PunktgenauPage />
    </MemoryRouter>,
  );
}

async function leseAufgabe(): Promise<{ wort: string; feld: HTMLInputElement }> {
  const lesen = Array.from(document.querySelectorAll("button")).find(
    (b) => b.textContent?.trim() === "Lesen",
  );
  if (!lesen) throw new Error("kein Schalter „Lesen“");
  fireEvent.click(lesen);
  return await waitFor(
    () => {
      const karte = document.querySelector('[data-aufgabe^="lesen-"]');
      const feld = document.querySelector("#read-answer") as HTMLInputElement | null;
      if (!karte || !feld) throw new Error("noch keine Leseaufgabe");
      const wort = karte.getAttribute("data-aufgabe")!.slice("lesen-".length);
      if (!wort) throw new Error("kein Wort");
      return { wort, feld };
    },
    { timeout: 8000 },
  );
}

/** Ein Alt-Druck am Element; zurück kommt, ob die Seite ihn für sich genommen hat. */
function altDruck(ziel: Element, code: string, key: string): boolean {
  const ev = new KeyboardEvent("keydown", { code, key, altKey: true, bubbles: true, cancelable: true });
  ziel.dispatchEvent(ev);
  return ev.defaultPrevented;
}

const pausiert = () => /Pause - Alt\+P zum Weitermachen/.test(document.body.textContent ?? "");

describe("★★★ Punktgenau: die Kürzel gelten auch im Antwortfeld", () => {
  it("Alt + P aus dem Lese-Feld pausiert - und ein zweites Alt + P macht weiter", async () => {
    zeigeSeite();
    const { feld } = await leseAufgabe();
    feld.focus();
    expect(pausiert()).toBe(false);

    expect(altDruck(feld, "KeyP", "p")).toBe(true); // Windows: Alt + P meldet „p"
    await waitFor(() => expect(pausiert()).toBe(true));
    // Am Mac meldet Wahl + P „π" - das braucht niemand, es bleibt ein Kürzel.
    expect(altDruck(feld, "KeyP", "π")).toBe(true);
    await waitFor(() => expect(pausiert()).toBe(false));
  }, 15000);

  it("Gegenprobe: dasselbe Feld OHNE Freigabe (wie vor dem 29.09.) lässt Alt + P liegen", async () => {
    zeigeSeite();
    const { feld } = await leseAufgabe();
    feld.focus();
    feld.removeAttribute("data-kuerzel");
    expect(altDruck(feld, "KeyP", "p")).toBe(false);
    expect(pausiert()).toBe(false);
  }, 15000);

  it("am Mac bleibt „@“ (Wahl + L) Schreiben - die Zeichenliste geht nicht auf", async () => {
    zeigeSeite();
    const { feld } = await leseAufgabe();
    feld.focus();
    const dialogeVorher = document.querySelectorAll('[role="dialog"]').length;
    expect(altDruck(feld, "KeyL", "@")).toBe(false);
    expect(document.querySelectorAll('[role="dialog"]').length).toBe(dialogeVorher);
    expect(document.activeElement).toBe(feld);
  }, 15000);
});

describe("★★★ Punktgenau: nach einer falschen Antwort steht die Lösung am Fokus", () => {
  it("Fokus auf „Nochmal“, und sein Name beginnt mit „Richtig wäre: <Wort>.“", async () => {
    zeigeSeite();
    const { wort, feld } = await leseAufgabe();
    fireEvent.focus(feld);
    fireEvent.change(feld, { target: { value: "qqq" } });
    fireEvent.submit(feld.closest("form")!);

    await waitFor(() => expect(document.activeElement?.textContent?.trim()).toBe("Nochmal"));
    const knopf = document.activeElement as HTMLButtonElement;
    const name = knopf.getAttribute("aria-label") ?? "";
    expect(name.startsWith(`Richtig wäre: ${wort}.`)).toBe(true);
    // WCAG 2.5.3: das sichtbare Wort steckt im Namen.
    expect(name).toContain("Nochmal");
  }, 15000);
});
