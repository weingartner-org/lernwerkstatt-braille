/**
 * ★★★ WÄCHTER: Das Bild der Übung nach dem Entwurf „A2 neu" (Johannes, 16.10.2026).
 * ===========================================================================
 *
 *  (a) „Aufgabe noch einmal ansagen" steht NUR im Vorlesemodus (Alt + V). Umschalt
 *      zweimal geht immer - es bringt die Aufgabe auch auf die Braillezeile.
 *  (b) Alt + Plus macht die Angabe UND das Eingabefeld größer; Alt + Minus kleiner.
 *  (c) Beide Felder tragen die Schrift, die das Kind gewählt hat
 *      (`tt-uebungsschrift`) - das Programm selbst nicht.
 *  (d) Die Schrift gleicher Breite gibt es nur in Plus, nicht in Tastenflow; die
 *      Wiener Schulschriften (Primæ, MM Schuldruck) sind dieselben wie dort.
 *  (e) Richtig und falsch zeigt das Feld verschieden - mit Zeichen, nicht nur Farbe.
 *  (f) Die Rückmeldung steht in EINER Live-Region, direkt unter dem Feld.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, renderHook, screen } from "@testing-library/react";

vi.mock("../src/lib/typing/voice", async (importOriginal) => {
  const echt = await importOriginal<typeof import("../src/lib/typing/voice")>();
  return { ...echt, speakUi: vi.fn(), speakUiAlways: vi.fn(), speak: vi.fn() };
});

import { PlusUebung } from "../src/components/plus/PlusUebung";
import { usePlusTasten } from "../src/components/plus/usePlusTasten";
import { SchriftWahl } from "../src/components/typing/SchriftWahl";
import { useEinstellungen } from "../src/lib/plus/einstellungen";
import { PLUS_FLAECHE_KLASSE, usePlusFlaeche } from "../src/lib/plus/flaeche";
import {
  SCHRIFTEN,
  schriftWirksam,
  schriftenFuer,
  useSchriftart,
  useSchriftartAnwenden,
} from "../src/lib/typing/schriftart";

beforeEach(() => {
  useEinstellungen.getState().resetZoom();
  useEinstellungen.getState().setEingabeart("normal");
});

afterEach(() => {
  cleanup();
  useEinstellungen.getState().resetZoom();
  useEinstellungen.getState().setEingabeart("normal");
  useSchriftart.getState().setSchrift("atkinson");
  localStorage.clear();
  document.documentElement.removeAttribute("style");
  document.documentElement.classList.remove("tt-schreibschrift", PLUS_FLAECHE_KLASSE);
});

/** Das Paket mit Fragen („Ist 39 eine rationale Zahl?") - in der Mathematikschrift steht die Frage über dem Feld. */
const mitAngabe = () => {
  return render(<PlusUebung paketId="1-18" saat={4} onZurueck={() => {}} />);
};

describe("(a) Ansagen nur im Vorlesemodus", () => {
  it("★★★ mit Vorlesen steht der Knopf da, ohne Vorlesen nicht", () => {
    const { rerender } = render(<PlusUebung paketId="1-08" saat={4} vorlesen onZurueck={() => {}} />);
    expect(screen.getByRole("button", { name: "Aufgabe noch einmal ansagen" })).toBeInTheDocument();
    rerender(<PlusUebung paketId="1-08" saat={4} vorlesen={false} onZurueck={() => {}} />);
    expect(screen.queryByRole("button", { name: /noch einmal/ })).toBeNull();
  });

  it("★★ Umschalt zweimal geht auch ohne Vorlesemodus - der Hinweis dazu steht in der Tastenhilfe", () => {
    const ansagen = vi.fn();
    render(<PlusUebung paketId="1-08" saat={4} vorlesen={false} ansagen={ansagen} onZurueck={() => {}} />);
    ansagen.mockClear();
    const feld = screen.getByLabelText("Deine Antwort");
    fireEvent.keyDown(feld, { key: "Shift" });
    fireEvent.keyDown(feld, { key: "Shift" });
    expect(ansagen).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Umschalttaste zweimal: Aufgabe noch einmal - die Rechnung steht wieder im Feld")).toBeInTheDocument();
  });
});

describe("(b) Alt + Plus: Angabe UND Eingabefeld werden größer", () => {
  function Harness() {
    usePlusTasten();
    return <PlusUebung paketId="1-18" saat={4} onZurueck={() => {}} />;
  }

  it("★★★ Alt + Plus vergrößert beide, Alt + Minus verkleinert beide, Alt + 0 stellt zurück", () => {
    render(<Harness />);
    const angabe = document.getElementById("plus-aufgabe") as HTMLElement;
    const feld = screen.getByLabelText("Deine Antwort") as HTMLTextAreaElement;
    expect(angabe).not.toBeNull();
    const groesse = (el: HTMLElement) => parseFloat(el.style.fontSize);
    const a0 = groesse(angabe);
    const f0 = groesse(feld);

    // Deutsche Tastatur: das Plus liegt auf `BracketRight`; am Mac macht Alt daraus ein „±".
    fireEvent.keyDown(window, { key: "+", code: "BracketRight", altKey: true });
    fireEvent.keyDown(window, { key: "±", code: "BracketRight", altKey: true });
    expect(groesse(angabe)).toBeGreaterThan(a0);
    expect(groesse(feld)).toBeGreaterThan(f0);

    fireEvent.keyDown(window, { key: "-", code: "Slash", altKey: true });
    fireEvent.keyDown(window, { key: "-", code: "Slash", altKey: true });
    expect(groesse(angabe)).toBe(a0);
    expect(groesse(feld)).toBe(f0);

    fireEvent.keyDown(window, { key: "+", code: "BracketRight", altKey: true });
    fireEvent.keyDown(window, { key: "0", code: "Digit0", altKey: true });
    expect(groesse(angabe)).toBe(a0);
    expect(groesse(feld)).toBe(f0);
  });

  it("★★ die Beschriftung „Deine Antwort“ wächst mit", () => {
    render(<Harness />);
    const label = screen.getByText("Deine Antwort") as HTMLElement;
    const vorher = parseFloat(label.style.fontSize);
    fireEvent.keyDown(window, { key: "+", code: "BracketRight", altKey: true });
    expect(parseFloat(label.style.fontSize)).toBeGreaterThan(vorher);
  });
});

describe("(c) Die gewählte Schrift gilt für Angabe und Feld - nicht für das Programm", () => {
  it("★★★ beide tragen `tt-uebungsschrift`, die Überschrift nicht", () => {
    mitAngabe();
    const angabe = document.getElementById("plus-aufgabe") as HTMLElement;
    const feld = screen.getByLabelText("Deine Antwort") as HTMLElement;
    expect(angabe.classList.contains("tt-uebungsschrift")).toBe(true);
    expect(feld.classList.contains("tt-uebungsschrift")).toBe(true);
    expect(screen.getByRole("heading", { level: 2 }).classList.contains("tt-uebungsschrift")).toBe(false);
  });

  it("★★ die Wahl in den Einstellungen setzt die Schrift an <html> - wie in Tastenflow", () => {
    renderHook(() => useSchriftartAnwenden(true));
    act(() => useSchriftart.getState().setSchrift("mm-schuldruck"));
    expect(document.documentElement.style.getPropertyValue("--tt-uebungsschrift")).toContain("MM Schuldruck");
    act(() => useSchriftart.getState().setSchrift("mono"));
    expect(document.documentElement.style.getPropertyValue("--tt-uebungsschrift")).toContain("Atkinson Mono");
  });
});

describe("(d) Die Schriftliste von Plus", () => {
  it("★★★ Plus bietet Atkinson (Vorgabe), Atkinson Mono, die Wiener Schulschriften und die übrigen", () => {
    render(<SchriftWahl mitMono name="Schrift" hinweis="Hinweis" />);
    fireEvent.click(screen.getByRole("button", { name: /Schrift/ }));
    const namen = screen.getAllByRole("checkbox").map((c) => (c as HTMLInputElement).value);
    expect(namen).toEqual(schriftenFuer(true).map((s) => s.id));
    for (const id of ["atkinson", "mono", "primae-druck", "primae-schreib", "mm-schuldruck", "andika", "lexend", "luciole", "opendyslexic", "inclusive"]) {
      expect(namen, id).toContain(id);
    }
    expect(namen[0]).toBe("atkinson");
    expect(screen.getByRole("checkbox", { name: /Atkinson Hyperlegible \(empfohlen\)/ })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: /Atkinson Hyperlegible Mono/ })).toBeInTheDocument();
  });

  it("★★ Tastenflow zeigt die Schrift gleicher Breite NICHT - und wendet sie auch nicht an", () => {
    expect(schriftenFuer(false).some((s) => s.id === "mono")).toBe(false);
    expect(schriftWirksam("mono", false)).toBe("atkinson");
    expect(schriftWirksam("mono", true)).toBe("mono");
    expect(schriftWirksam("primae-druck", false)).toBe("primae-druck");
    renderHook(() => useSchriftartAnwenden());
    act(() => useSchriftart.getState().setSchrift("mono"));
    expect(document.documentElement.style.getPropertyValue("--tt-uebungsschrift")).toBe("");
  });

  it("★ die Schrift gleicher Breite hat ihre @font-face und ein Eintrag im Nachweis", async () => {
    const { readFileSync } = await import("node:fs");
    const { resolve } = await import("node:path");
    const css = readFileSync(resolve(__dirname, "../src/index.css"), "utf8");
    expect(css).toContain('font-family: "Tastenflow Atkinson Mono"');
    expect(SCHRIFTEN.find((s) => s.id === "mono")!.nurPlus).toBe(true);
  });
});

describe("(e) Richtig und falsch am Feld - Zeichen, nicht nur Farbe", () => {
  it("★★★ falsch: gestrichelt, warm, Zeichen „noch einmal“ und der Satz „Noch nicht“", () => {
    render(<PlusUebung paketId="1-08" saat={4} onZurueck={() => {}} />);
    const feld = screen.getByLabelText("Deine Antwort") as HTMLTextAreaElement;
    fireEvent.change(feld, { target: { value: "99999" } });
    fireEvent.click(screen.getByRole("button", { name: "Prüfen" }));
    expect(feld.dataset.ton).toBe("falsch");
    expect(feld.className).toMatch(/border-dashed/);
    expect(feld.className).toMatch(/plus-fx-falsch/);
    expect(feld.parentElement!.querySelector("svg")).not.toBeNull();
    expect(screen.getByRole("status")).toHaveTextContent("Noch nicht");
    // Kein Rot, kein Kreuz, kein Wort „falsch“.
    expect(feld.className).not.toMatch(/danger|red/);
    expect(screen.getByRole("status").textContent).not.toMatch(/falsch|leider|Fehler|✗|✕/i);
  });

  it("★★ ändert das Kind die Antwort, ist das Feld wieder gewöhnlich", () => {
    render(<PlusUebung paketId="1-08" saat={4} onZurueck={() => {}} />);
    const feld = screen.getByLabelText("Deine Antwort") as HTMLTextAreaElement;
    fireEvent.change(feld, { target: { value: "99999" } });
    fireEvent.click(screen.getByRole("button", { name: "Prüfen" }));
    expect(feld.dataset.ton).toBe("falsch");
    fireEvent.change(feld, { target: { value: "99998" } });
    expect(feld.dataset.ton).toBe("offen");
  });

  it("★★ die Bewegung ist gekürzt, wenn das System „weniger Bewegung“ will (eine Regel für alle Animationen)", async () => {
    const { readFileSync } = await import("node:fs");
    const { resolve } = await import("node:path");
    const css = readFileSync(resolve(__dirname, "../src/index.css"), "utf8");
    expect(css).toMatch(/prefers-reduced-motion: reduce[\s\S]*animation-duration: 0\.001ms !important/);
    expect(css).toContain("@keyframes plus-halo");
    expect(css).toContain("@keyframes plus-nudge");
  });
});

describe("(f) Eine Live-Region, direkt unter dem Feld", () => {
  it("★★★ genau EIN role=status in der Übung, und es folgt auf das Feld", () => {
    render(<PlusUebung paketId="1-08" saat={4} onZurueck={() => {}} />);
    const regionen = document.querySelectorAll('[role="status"]');
    expect(regionen).toHaveLength(1);
    const feld = screen.getByLabelText("Deine Antwort");
    // Auf das Feld (samt Zeichen-Hülle) folgt gleich die Region.
    expect(feld.parentElement!.nextElementSibling).toBe(regionen[0]);
  });
});

describe("Das Grün von Plus", () => {
  it("★★ die Klasse steht an <html>, solange Plus offen ist - danach nicht mehr", () => {
    const { unmount } = renderHook(() => usePlusFlaeche());
    expect(document.documentElement.classList.contains(PLUS_FLAECHE_KLASSE)).toBe(true);
    unmount();
    expect(document.documentElement.classList.contains(PLUS_FLAECHE_KLASSE)).toBe(false);
  });

  it("★★ die Kontrastmodi bleiben unberührt: die Grünwerte gelten nur ohne eigene Palette", async () => {
    const { readFileSync } = await import("node:fs");
    const { resolve } = await import("node:path");
    const css = readFileSync(resolve(__dirname, "../src/index.css"), "utf8");
    const regeln = css.match(/:root(?:\.dark)?\.plus-flaeche:not\([^{]*\{/g) ?? [];
    // 2 Paletten (Hell, Dunkel) + 5 Regeln Rechenbereich je Aufgabenart + 3 Regeln Licht (21.10.2026)
    expect(regeln).toHaveLength(10);
    for (const r of regeln) for (const m of ["sw", "ws", "sg", "gs", "gb"]) expect(r).toContain(`data-theme="${m}"`);
  });
});
