/**
 * ★★ WÄCHTER: Die Kürzel von Klangpunkte im gemeinsamen Muster aller Lern-Apps
 * (Johannes, 18.10.2026: „die Tastenkürzel sollen möglichst einheitlich bei
 * allen Lern-Apps sein").
 *
 *  (a) Alt + 0 - normale Größe.
 *  (b) Alt + G - zur nächsten Überschrift (der Fokus steht danach dort).
 *  (c) Umschalt zweimal - die Aufgabe noch einmal, derselbe Weg wie Alt + W.
 *  (d) Esc führt ins Übungsfeld - aus Hilfe, Kürzel-Liste, dem Farb-Menü der
 *      Kopfzeile und auch dann, wenn nichts offen ist.
 *  (e) Alt + Z sagt die Runde an - Alt + Y wirkt nicht mehr mit.
 *  (f) Alt + Q schaltet die Hand am Klavier; Alt + S tut das nicht mehr.
 *  (g) Die Liste nennt Alt + 0, das Melden, Alt + G, Alt + Q, Umschalt zweimal
 *      und Esc - Alt + S nur für Lehrkräfte.
 *  (h) Am Mac steht „Wahl" statt „Alt", ohne Fußnote.
 *
 * Gemessen wird am Play-Speicher: Jede Taste zählt dort einen Zähler hoch, den
 * der Runner einlöst. So prüft der Wächter, WAS die Seite anfordert, und hängt
 * nicht an der Aufgabe, die das Zufallsprogramm gerade zieht.
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { KlangpunktePage } from "@/features/public/KlangpunktePage";
import { useBraillePlay } from "@/lib/braille/play";
import { useBrailleA11y } from "@/lib/braille/a11y";
import { useVoice } from "@/lib/braille/voice";

const plattformVorher = Object.getOwnPropertyDescriptor(window.navigator, "platform");

beforeEach(() => {
  localStorage.clear();
  useVoice.setState({ enabled: false });
  useBrailleA11y.getState().resetZoom();
});
afterEach(() => {
  cleanup();
  if (plattformVorher) Object.defineProperty(window.navigator, "platform", plattformVorher);
  else delete (window.navigator as { platform?: string }).platform;
});

const seite = () =>
  render(
    <MemoryRouter initialEntries={["/programme/klangpunkte"]}>
      <KlangpunktePage />
    </MemoryRouter>,
  );
const alt = (key: string, code: string, ziel: Element = document.body) =>
  fireEvent.keyDown(ziel, { key, code, altKey: true });
const stand = () => useBraillePlay.getState();
const dialog = () => screen.queryByRole("dialog");

describe("(a) Alt + 0 - normale Größe", () => {
  it("setzt die Vergrößerung zurück (auch mit dem Zeichen, das die Wahltaste liefert)", () => {
    seite();
    alt("+", "BracketRight");
    alt("+", "BracketRight");
    expect(useBrailleA11y.getState().zoomIndex).toBe(2);
    alt("º", "Digit0");
    expect(useBrailleA11y.getState().zoomIndex).toBe(0);
  });
});

describe("(b) Alt + G - zur nächsten Überschrift", () => {
  it("setzt den Fokus auf eine Überschrift", () => {
    seite();
    alt("g", "KeyG");
    expect(document.activeElement?.tagName).toMatch(/^H[1-6]$/);
  });
});

describe("(c) Umschalt zweimal - die Aufgabe noch einmal", () => {
  it("zweimal kurz hintereinander fordert die Wiederholung an - wie Alt + W", () => {
    seite();
    const vorher = stand().repeatNonce;
    fireEvent.keyDown(document.body, { key: "Shift", code: "ShiftLeft", shiftKey: true });
    expect(stand().repeatNonce).toBe(vorher);
    fireEvent.keyDown(document.body, { key: "Shift", code: "ShiftLeft", shiftKey: true });
    expect(stand().repeatNonce).toBe(vorher + 1);
    alt("w", "KeyW");
    expect(stand().repeatNonce).toBe(vorher + 2);
  });

  it("eine andere Taste dazwischen löscht den ersten Druck", () => {
    seite();
    const vorher = stand().repeatNonce;
    fireEvent.keyDown(document.body, { key: "Shift", code: "ShiftLeft", shiftKey: true });
    fireEvent.keyDown(document.body, { key: "a", code: "KeyA" });
    fireEvent.keyDown(document.body, { key: "Shift", code: "ShiftLeft", shiftKey: true });
    expect(stand().repeatNonce).toBe(vorher);
  });

  it("nicht in einem Namensfeld - dort ist Umschalt für Großbuchstaben", () => {
    seite();
    const feld = document.createElement("input");
    document.body.appendChild(feld);
    const vorher = stand().repeatNonce;
    fireEvent.keyDown(feld, { key: "Shift", code: "ShiftLeft", shiftKey: true });
    fireEvent.keyDown(feld, { key: "Shift", code: "ShiftLeft", shiftKey: true });
    expect(stand().repeatNonce).toBe(vorher);
    feld.remove();
  });
});

describe("(d) Esc führt ins Übungsfeld", () => {
  it("aus der Hilfe: schließt sie und fordert das Übungsfeld an", () => {
    seite();
    alt("h", "KeyH");
    expect(dialog()).not.toBeNull();
    const vorher = stand().focusInputNonce;
    fireEvent.keyDown(document.activeElement ?? document.body, { key: "Escape", code: "Escape" });
    expect(dialog()).toBeNull();
    expect(stand().focusInputNonce).toBe(vorher + 1);
  });

  it("aus der Kürzel-Liste ebenso", () => {
    seite();
    alt("t", "KeyT");
    expect(dialog()).not.toBeNull();
    const vorher = stand().focusInputNonce;
    fireEvent.keyDown(document.activeElement ?? document.body, { key: "Escape", code: "Escape" });
    expect(dialog()).toBeNull();
    expect(stand().focusInputNonce).toBe(vorher + 1);
  });

  it("auch wenn nichts offen ist", () => {
    seite();
    const vorher = stand().focusInputNonce;
    fireEvent.keyDown(document.body, { key: "Escape", code: "Escape" });
    expect(stand().focusInputNonce).toBe(vorher + 1);
  });

  it("aus dem Farb-Menü der Kopfzeile (`escAfterClose`)", () => {
    seite();
    alt("k", "KeyK");
    const knopf = document.querySelector<HTMLElement>('[aria-keyshortcuts="Alt+K"][aria-expanded="true"]');
    expect(knopf, "Farb-Menü offen").not.toBeNull();
    const vorher = stand().focusInputNonce;
    fireEvent.keyDown(document.activeElement ?? document.body, { key: "Escape", code: "Escape" });
    expect(knopf).toHaveAttribute("aria-expanded", "false");
    // genau einmal: Das Menü fängt Esc ab, die Seite läuft nicht ein zweites Mal
    expect(stand().focusInputNonce).toBe(vorher + 1);
  });
});

describe("(e) Alt + Z - Runde ansagen, ohne Alt + Y", () => {
  it("Alt + Z wirkt", () => {
    seite();
    const vorher = stand().roundNonce;
    alt("z", "KeyZ");
    expect(stand().roundNonce).toBe(vorher + 1);
  });

  it("Alt + Y wirkt nicht mehr - weder auf der US- noch auf der deutschen Lage", () => {
    seite();
    const vorher = stand().roundNonce;
    alt("y", "KeyY"); // US-Tastatur
    alt("y", "KeyZ"); // deutsche Tastatur: das Y liegt, wo die US-Tastatur das Z hat
    expect(stand().roundNonce).toBe(vorher);
  });

  it("die deutsche Z-Taste (Code `KeyY`) wirkt - es zählt der Aufdruck", () => {
    seite();
    const vorher = stand().roundNonce;
    alt("z", "KeyY");
    expect(stand().roundNonce).toBe(vorher + 1);
  });
});

describe("(f) Hand am Klavier: Alt + Q statt Alt + S", () => {
  it("Alt + Q schaltet die Hand", () => {
    seite();
    const vorher = stand().handSwitchNonce;
    alt("q", "KeyQ");
    expect(stand().handSwitchNonce).toBe(vorher + 1);
  });

  it("Alt + S schaltet die Hand nicht mehr", () => {
    seite();
    const vorher = stand().handSwitchNonce;
    alt("ß", "KeyS");
    expect(stand().handSwitchNonce).toBe(vorher);
  });
});

describe("(g) Die Kürzel-Liste", () => {
  it("nennt Alt + 0, das Melden, Alt + G, Alt + Q, Umschalt zweimal und Esc", () => {
    seite();
    alt("t", "KeyT");
    const liste = within(dialog()!);
    const tasten = liste.getAllByText((_, el) => el?.tagName === "KBD").map((k) => k.textContent);
    expect(tasten).toEqual(
      expect.arrayContaining(["Alt + 0", "Alt + Umschalt + P", "Alt + G", "Alt + Q", "Umschalt zweimal", "Esc", "Alt + Z"]),
    );
    expect(tasten).not.toContain("Alt + S");
    expect(dialog()!.textContent).toMatch(/Fehler melden/);
    expect(dialog()!.textContent).toMatch(/auf dem Mac: Wahltaste/);
  });

  it("die Quelle nennt Alt + 0 und Alt + Umschalt + P wörtlich (für `kuerzel-universell`)", () => {
    const text = readFileSync(resolve(__dirname, "../src/lib/klangpunkte/texte/de/seite.ts"), "utf8");
    expect(text).toContain('"Alt + 0"');
    expect(text).toContain('"Alt + Umschalt + P"');
  });
});

describe("(h) Am Mac heißt die Taste Wahl", () => {
  it("die Liste schreibt „Wahl + …“ und braucht keine Fußnote", () => {
    Object.defineProperty(window.navigator, "platform", { value: "MacIntel", configurable: true });
    seite();
    alt("†", "KeyT");
    const tasten = within(dialog()!)
      .getAllByText((_, el) => el?.tagName === "KBD")
      .map((k) => k.textContent);
    expect(tasten).toEqual(expect.arrayContaining(["Wahl + 0", "Wahl + Q", "Wahl + G", "Wahl + Umschalt + P"]));
    expect(tasten.filter((t) => /\bAlt\b/.test(t ?? ""))).toEqual([]);
    expect(dialog()!.textContent).not.toMatch(/auf dem Mac: Wahltaste/);
  });
});

