/**
 * ★★ WÄCHTER: Die Einstellungen von Plus sind ein eigenes FENSTER (Johannes,
 * 17.10.2026: „wie bei Tastenflow, nicht den Inhalt nach unten schieben").
 *
 * Bis dahin klappten sie über der Übung auf und schoben das Eingabefeld unter
 * den Bildschirmrand - gemessen y = 1117 bei 900 px Fensterhöhe. Johannes las
 * das als „das Eingabefeld verschwindet". Geprüft wird hier:
 *  (a) das Fenster ist ein Dialog, die Übung bleibt dahinter stehen,
 *  (b) jede Einstellung ist ein Auswahlmenü mit SICHTBARER Erklärung, die am
 *      Menü hängt (`aria-describedby`), nichts ist gesperrt,
 *  (c) jeder Weg hinaus führt zurück ins Eingabefeld (R1-R6),
 *  (d) Alt + O, Alt + H und Alt + V greifen - auch mitten im Feld.
 *
 * Die Stores selbst prüfen `lib/plus/einstellungen.ts` und ihre Tests.
 */
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import { PlusPage } from "../src/features/public/PlusPage";
import { backendZuruecksetzen } from "../src/lib/plus/fortschritt";
import { useTypingAuth } from "../src/components/typing/useTypingAuth";
import { useEinstellungen } from "../src/lib/plus/einstellungen";
import { useDeviceZeichenabstand } from "../src/lib/typing/zeichenabstand";

beforeEach(() => {
  localStorage.clear();
  useTypingAuth.setState({ account: null });
  backendZuruecksetzen();
  useEinstellungen.setState({ eingabeart: "normal", zoomIndex: 0, zoom: 1 });
});

const seite = () => render(<MemoryRouter><PlusPage /></MemoryRouter>);

const start = async () => {
  seite();
  await waitFor(() => screen.getByText("Willkommen bei Plus!"));
};

/** In eine Übung gehen - dort steht das Eingabefeld. */
const inDieUebung = async () => {
  await start();
  fireEvent.click(screen.getByRole("button", { name: /Los geht's/ }));
  fireEvent.click(screen.getByRole("button", { name: /3\. Schulstufe/ }));
  await waitFor(() => screen.getByText("Aufgabe 1 von 8"));
  return document.getElementById("plus-eingabe") as HTMLTextAreaElement;
};

const oeffne = () => {
  fireEvent.click(screen.getByRole("button", { name: /^Einstellungen/ }));
  return screen.getByRole("dialog", { name: "Einstellungen" });
};

/** Ein Takt für den Fokussprung nach dem Schließen (`setTimeout(0)`). */
const takt = () => act(() => new Promise((r) => setTimeout(r, 10)));

const altTaste = (code: string, ziel: Element = document.activeElement ?? document.body) =>
  fireEvent.keyDown(ziel, { key: code.replace("Key", "").toLowerCase(), code, altKey: true });

describe("(a) Ein eigenes Fenster", () => {
  it("geht als Dialog auf - die Übung mit dem Eingabefeld bleibt dahinter stehen", async () => {
    const feld = await inDieUebung();
    const fenster = oeffne();
    expect(fenster).toHaveAttribute("aria-modal", "true");
    expect(document.getElementById("plus-eingabe")).toBe(feld);
    expect(fenster.contains(feld)).toBe(false);
  });

  it("das Zahnrad meldet ein Fenster, kein Aufklappen", async () => {
    await start();
    const zahnrad = screen.getByRole("button", { name: /^Einstellungen/ });
    expect(zahnrad).toHaveAttribute("aria-haspopup", "dialog");
    expect(zahnrad).not.toHaveAttribute("aria-expanded");
  });

  it("der Fokus steht beim Öffnen auf dem Schalter „Arbeiten mit Braillezeile“", async () => {
    await inDieUebung();
    const fenster = oeffne();
    expect(document.activeElement).toBe(within(fenster).getByRole("switch", { name: "Arbeiten mit Braillezeile" }));
  });
});

describe("(b) Auswahlmenüs mit Erklärung auf der Seite", () => {
  const MENUES = ["Rechnungen ausschreiben", "Textgröße", "Zeichenabstand"];

  it("jedes Menü trägt eine sichtbare Erklärung, und keines ist gesperrt", async () => {
    await start();
    const fenster = oeffne();
    for (const name of MENUES) {
      const menue = within(fenster).getByRole("combobox", { name });
      expect(menue, name).toBeEnabled();
      const id = menue.getAttribute("aria-describedby") ?? "";
      const erklaerung = document.getElementById(id);
      expect(erklaerung, name).not.toBeNull();
      expect(erklaerung!.className, name).not.toMatch(/sr-only/);
      expect(erklaerung!.textContent!.length, name).toBeGreaterThan(20);
    }
  });

  it("★ der Schalter „Arbeiten mit Braillezeile“ ist ein Schalter mit Erklärung, nie gesperrt", async () => {
    await start();
    const fenster = oeffne();
    const schalter = within(fenster).getByRole("switch", { name: "Arbeiten mit Braillezeile" });
    expect(schalter).toBeEnabled();
    expect(schalter).toHaveAttribute("aria-checked", "false");
    const erklaerung = document.getElementById(schalter.getAttribute("aria-describedby")!)!;
    expect(erklaerung.textContent).toMatch(/Eingabefeld ist leer/);
  });

  it("die drei Gruppen haben Namen", async () => {
    await start();
    const fenster = oeffne();
    for (const name of ["Eingabe", "Anzeige", "Klang und Vorlesen"]) {
      expect(within(fenster).getByRole("group", { name }), name).toBeInTheDocument();
    }
  });

  it("★ die Braille-Schrift kommt erst, wenn die Braillezeile an ist - und die Erklärung wechselt mit der Wahl", async () => {
    await start();
    const fenster = oeffne();
    expect(within(fenster).queryByRole("combobox", { name: "Braille-Schrift" })).toBeNull();
    const schalter = within(fenster).getByRole("switch", { name: "Arbeiten mit Braillezeile" });
    fireEvent.click(schalter);
    expect(schalter).toHaveAttribute("aria-checked", "true");
    expect(useEinstellungen.getState().braillezeile).toBe(true);
    expect(useEinstellungen.getState().eingabeart).toBe("computer");
    expect(document.getElementById(schalter.getAttribute("aria-describedby")!)!.textContent).toMatch(/wenig springst/);
    // ★ 40 oder 80 Zeichen: eigenes Menü mit eigener Erklärung (Johannes, 19.10.2026).
    const breite = within(fenster).getByRole("combobox", { name: "Braillezeile mit 40 oder 80 Zeichen" });
    expect(document.getElementById(breite.getAttribute("aria-describedby")!)!.textContent).toMatch(/höchstens 40 Zeichen/);
    fireEvent.change(breite, { target: { value: "80" } });
    expect(useEinstellungen.getState().breite).toBe(80);
    expect(document.getElementById(breite.getAttribute("aria-describedby")!)!.textContent).toMatch(/höchstens 80 Zeichen/);
    fireEvent.change(breite, { target: { value: "40" } });
    const menue = within(fenster).getByRole("combobox", { name: "Braille-Schrift" });
    expect(menue).toBeEnabled();
    const erklaerung = () => document.getElementById(menue.getAttribute("aria-describedby")!)!.textContent!;
    // ★ Johannes, 22.10.2026: Es gibt keine eigene Wahl „Wie du schreibst" mehr. Wer die Schrift
    // (6 oder 8 Punkte) wählt, greift automatisch in ihr.
    expect(within(fenster).queryByRole("combobox", { name: "Wie du schreibst" })).toBeNull();
    expect(useEinstellungen.getState().eingabe).toBe("braille");
    expect(erklaerung()).toMatch(/Computerbraille/);
    expect(erklaerung()).toMatch(/Punkt 7 und 8/);
    fireEvent.change(menue, { target: { value: "marburger" } });
    expect(useEinstellungen.getState().eingabeart).toBe("marburger");
    expect(useEinstellungen.getState().eingabe).toBe("braille");
    expect(erklaerung()).toMatch(/sechs Punkten/);
    fireEvent.click(schalter);
    expect(useEinstellungen.getState().eingabeart).toBe("normal");
    expect(useEinstellungen.getState().eingabe).toBe("tastatur");
    // Die gewählte Schrift bleibt gemerkt, wenn die Braillezeile wieder an geht.
    expect(useEinstellungen.getState().schrift).toBe("marburger");
  });

  it("Textgröße und Zeichenabstand setzen ihre Stores", async () => {
    await start();
    const fenster = oeffne();
    fireEvent.change(within(fenster).getByRole("combobox", { name: "Textgröße" }), { target: { value: "3" } });
    expect(useEinstellungen.getState().zoomIndex).toBe(3);
    fireEvent.change(within(fenster).getByRole("combobox", { name: "Zeichenabstand" }), { target: { value: "2" } });
    expect(useDeviceZeichenabstand.getState().faktor).toBe(2);
    useDeviceZeichenabstand.getState().setFaktor(1);
  });

  it("nennt den Weg zu Farben und Kontrast", async () => {
    await start();
    const fenster = oeffne();
    expect(within(fenster).getByText(/Farben und Kontrast/)).toHaveTextContent(/Alt \+ K/);
  });
});

describe("(c) Jeder Weg hinaus führt ins Eingabefeld", () => {
  it("Escape", async () => {
    const feld = await inDieUebung();
    oeffne();
    fireEvent.keyDown(document.activeElement!, { key: "Escape" });
    await takt();
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).toBe(feld);
  });

  it("der Knopf Zurück zum Rechnen", async () => {
    const feld = await inDieUebung();
    const fenster = oeffne();
    fireEvent.click(within(fenster).getByRole("button", { name: "Zurück zum Rechnen" }));
    await takt();
    expect(document.activeElement).toBe(feld);
  });

  it("Alt + O aus dem Menü heraus", async () => {
    const feld = await inDieUebung();
    oeffne();
    altTaste("KeyO");
    await takt();
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).toBe(feld);
  });
});

describe("(d) Die Alt-Kürzel der Kürzelliste greifen - auch im Feld", () => {
  it("Alt + O öffnet aus dem Eingabefeld, ohne etwas ins Feld zu schreiben", async () => {
    const feld = await inDieUebung();
    feld.focus();
    const vorher = feld.value;
    const ereignis = altTaste("KeyO", feld);
    expect(ereignis).toBe(false); // preventDefault: am Mac schriebe die Wahltaste sonst ein ø
    expect(screen.getByRole("dialog", { name: "Einstellungen" })).toBeInTheDocument();
    expect(feld.value).toBe(vorher);
  });

  it("Alt + H öffnet und schließt die Hilfe", async () => {
    const feld = await inDieUebung();
    feld.focus();
    altTaste("KeyH", feld);
    expect(screen.getByRole("dialog", { name: "Plus - Hilfe" })).toBeInTheDocument();
    altTaste("KeyH");
    await takt();
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).toBe(feld);
  });

  it("Alt + V schaltet das Vorlesen um", async () => {
    const feld = await inDieUebung();
    feld.focus();
    expect(localStorage.getItem("plus_stimme")).not.toBe("an");
    altTaste("KeyV", feld);
    expect(localStorage.getItem("plus_stimme")).toBe("an");
  });

  it("★ Ton und Vorlesen stehen NUR im Menü unter dem Lautsprecher (Johannes, 17.10.2026)", async () => {
    await start();
    const fenster = oeffne();
    expect(within(fenster).queryByRole("combobox", { name: "Plus liest vor" })).toBeNull();
    expect(within(fenster).queryByRole("combobox", { name: "Töne" })).toBeNull();
    expect(within(fenster).getByRole("group", { name: "Klang und Vorlesen" })).toHaveTextContent(/Menü unter dem Lautsprecher/);
  });

  it("das Rechenfeld lässt die Kürzel der Kopfzeile durch (`data-kuerzel`)", async () => {
    const feld = await inDieUebung();
    expect(feld.dataset.kuerzel).toBe("an");
  });
});
