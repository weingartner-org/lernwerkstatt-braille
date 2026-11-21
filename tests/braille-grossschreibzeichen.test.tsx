/**
 * ★ Schalter „Großschreibzeichen" (20.09.2026, Auftrag Johannes).
 *
 * Manche Kinder sind am Anfang überfordert, wenn vor jedem großen Buchstaben
 * eine eigene Ankündigungszelle steht (4·6). Die Engine kann die drei
 * Steuerzellen (4·6 Großbuchstabe, 4·5 Großbuchstabenfolge, 6 Ende der Folge)
 * auf Wunsch weglassen (`TranscribeOptions.grossschreibzeichen`), OHNE den
 * Buchstaben selbst zu ändern. Computerbraille ist nicht betroffen - dort
 * steckt die Großschreibung im Punkt 7 des Zeichens selbst.
 *
 * Geprüft wird hier NUR die Verdrahtung (Klassen-Einstellung → Engine → UI) -
 * die Engine selbst ist eingefroren und wurde hier nicht angefasst.
 */
import { oeffneLeiste } from "./klassenleiste-helfer";
import { describe, it, expect } from "vitest";
import { afterEach, beforeEach, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import {
  CAPS_LETTER,
  CAPS_WORD,
  CAPS_WORD_END,
  parseDots,
  transcribe,
} from "../src/lib/braille";
import { PunktgenauReiter } from "@/components/lernwerkstatt/klasse/PunktgenauReiter";
import { brailleBackend } from "@/lib/braille/backend";
import type { BrailleAccount, BrailleClass } from "@/lib/braille";
import { emptyProgress } from "@/lib/braille/progress";

/** Alle Zellen aller Einheiten in einer flachen Liste - einfacher zu prüfen. */
const alleZellen = (text: string, opts: Parameters<typeof transcribe>[1]) =>
  transcribe(text, opts).flatMap((u) => u.cells);

describe("Engine: Großschreibzeichen abschaltbar (Basis/Voll)", () => {
  it("Basisschrift: ohne Schalter keine 4·6-Ankündigung, mit/ohne Angabe schon", () => {
    const ohne = alleZellen("Haus", { system: "basis", grossschreibzeichen: false });
    expect(ohne).not.toContain(CAPS_LETTER);

    const mitExplizit = alleZellen("Haus", { system: "basis", grossschreibzeichen: true });
    expect(mitExplizit).toContain(CAPS_LETTER);

    const mitStandard = alleZellen("Haus", { system: "basis" });
    expect(mitStandard).toContain(CAPS_LETTER);
  });

  it("Vollschrift: dasselbe wie in der Basisschrift", () => {
    const ohne = alleZellen("Haus", { system: "voll", grossschreibzeichen: false });
    expect(ohne).not.toContain(CAPS_LETTER);

    const mit = alleZellen("Haus", { system: "voll" });
    expect(mit).toContain(CAPS_LETTER);
  });

  it("Großbuchstabenfolge (USBstick): weder 4·5 noch die Ende-Zelle 6, wenn abgeschaltet", () => {
    // „USBstick" hat eine wortinterne Grenze (Groß→klein) - nur dort setzt die
    // Engine überhaupt eine Ende-Zelle (Wortende allein reicht nicht).
    const ohneBasis = alleZellen("USBstick", { system: "basis", grossschreibzeichen: false });
    expect(ohneBasis).not.toContain(CAPS_WORD);
    expect(ohneBasis).not.toContain(CAPS_WORD_END);

    const mitBasis = alleZellen("USBstick", { system: "basis" });
    expect(mitBasis).toContain(CAPS_WORD);
    expect(mitBasis).toContain(CAPS_WORD_END);

    const ohneVoll = alleZellen("USBstick", { system: "voll", grossschreibzeichen: false });
    expect(ohneVoll).not.toContain(CAPS_WORD);
    expect(ohneVoll).not.toContain(CAPS_WORD_END);

    const mitVoll = alleZellen("USBstick", { system: "voll" });
    expect(mitVoll).toContain(CAPS_WORD);
    expect(mitVoll).toContain(CAPS_WORD_END);
  });

  it("die Buchstaben selbst bleiben gleich - nur die Steuerzellen entfallen", () => {
    const mit = transcribe("Haus", { system: "basis" });
    const ohne = transcribe("Haus", { system: "basis", grossschreibzeichen: false });
    // „H" hat mit Schalter zwei Zellen (Ankündigung + h), ohne nur eine.
    expect(mit[0].cells).toEqual([CAPS_LETTER, parseDots("125")]);
    expect(ohne[0].cells).toEqual([parseDots("125")]);
    // Der Rest des Wortes ist unverändert.
    expect(ohne.slice(1).map((u) => u.text)).toEqual(mit.slice(1).map((u) => u.text));
  });
});

describe("Engine: Computerbraille bleibt unverändert", () => {
  it("dieselben Zellen mit und ohne Schalter, Groß-Punkt 7 bleibt im Zeichen selbst", () => {
    const mit = alleZellen("Haus USB", { system: "computer", grossschreibzeichen: true });
    const ohne = alleZellen("Haus USB", { system: "computer", grossschreibzeichen: false });
    expect(ohne).toEqual(mit);
    // Keine der drei Basis-/Vollschrift-Steuerzellen taucht in Computerbraille auf.
    expect(mit).not.toContain(CAPS_LETTER);
    expect(mit).not.toContain(CAPS_WORD);
    expect(mit).not.toContain(CAPS_WORD_END);
  });
});

// ---------------------------------------------------------------------------
// UI: der Schalter im Lehrkraft-Reiter „Punktgenau"
// ---------------------------------------------------------------------------

const KINDER: BrailleAccount[] = [
  { id: "k1", role: "schueler", name: "Mia", classCode: "3B", createdAt: 0 },
];

const KLASSE: BrailleClass = {
  code: "3B",
  name: "3B",
  teacherId: "t1",
  createdAt: 0,
};

let gespeichert: Record<string, unknown> | null = null;

beforeEach(() => {
  gespeichert = null;
  const b = brailleBackend();
  vi.spyOn(b, "getClassSettings").mockResolvedValue({});
  vi.spyOn(b, "getProgress").mockResolvedValue(emptyProgress());
  vi.spyOn(b, "getEvents").mockResolvedValue([]);
  vi.spyOn(b, "updateClassSettings").mockImplementation(async (_t, _c, s) => {
    gespeichert = s as Record<string, unknown>;
    return { ok: true as const, value: KLASSE };
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("Lehrkraft-Reiter: Schalter „Großschreibzeichen“", () => {
  it("ist da, per Tastatur erreichbar und trägt ein zugängliches Label", () => {
    render(<PunktgenauReiter classCode="3B" teacherId="t1" pupils={KINDER} />);
    oeffneLeiste("Einstellungen der Klasse");

    const schalter = screen.getByRole("checkbox", { name: /Großschreibzeichen/ });
    expect(schalter).toBeTruthy();
    // Bauart-Pflicht: nie `disabled` (R1-R6, Fokus-Ziel bleibt erhalten).
    expect(schalter.hasAttribute("disabled")).toBe(false);
    // Ein Checkbox-Input ist ohne weiteres Zutun per Tab erreichbar -
    // sicherstellen, dass kein negativer tabIndex das verhindert.
    expect(schalter.getAttribute("tabindex")).not.toBe("-1");
    // Default (keine Klassen-Einstellung gespeichert) = Großschreibzeichen AN.
    expect((schalter as HTMLInputElement).checked).toBe(true);
  });

  it("lässt sich abschalten und speichert genau dieses Feld", async () => {
    render(<PunktgenauReiter classCode="3B" teacherId="t1" pupils={KINDER} />);
    oeffneLeiste("Einstellungen der Klasse");
    const schalter = screen.getByRole("checkbox", { name: /Großschreibzeichen/ });

    await act(async () => {
      fireEvent.click(schalter);
    });

    await waitFor(() => expect(gespeichert).not.toBeNull());
    expect(gespeichert).toEqual({ grossschreibzeichen: false });
    expect((schalter as HTMLInputElement).checked).toBe(false);
  });
});
