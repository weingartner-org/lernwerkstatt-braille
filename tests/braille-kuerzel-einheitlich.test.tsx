/**
 * WÄCHTER: Die Tastenkürzel von Punktgenau sind die der anderen Lern-Apps
 * (18.10.2026).
 * ===========================================================================
 * Johannes: „die Tastenkürzel sollen möglichst einheitlich bei allen Lern-Apps
 * sein". Dazu kamen in Punktgenau:
 *
 *   · Alt + 0 - normale Größe (gab es nur in Plus).
 *   · Alt + G - zur nächsten Überschrift (wie Tastenflow, eine andere App der Plattform ).
 *   · Umschalt zweimal - die Aufgabe noch einmal, derselbe Weg wie Alt + W.
 *     Umschalt GEHALTEN zeigt weiter die Tasten der Zelle.
 *   · Alt + Z nach dem AUFGEDRUCKTEN Buchstaben - Alt + Y wirkt nicht mehr mit.
 *   · Alt + S: Kind ⇒ Statistik (die Seite), Lehrkraft ⇒ „Meine Klassen" (die
 *     Kopfzeile) - die Seite darf die Taste dann NICHT verschlucken.
 *   · Die Liste nennt Alt + 0 und Melden und schreibt am Mac „Wahl".
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";

import { PunktgenauPage } from "@/features/public/PunktgenauPage";
import { useBrailleAuth } from "@/components/braille/useBrailleAuth";
import { useBraillePlay } from "@/lib/braille/play";
import { useBrailleA11y } from "@/lib/braille/a11y";
import { registerTeacher } from "@/lib/braille";
import type { BrailleAccount } from "@/lib/braille/account";
import { meineKlasseHref } from "@/lib/adressen";

function setzeNavigator(feld: "platform" | "language", wert: string) {
  Object.defineProperty(navigator, feld, { value: wert, configurable: true });
}

// Die Testumgebung stellt `navigator.language` auf Deutsch (`tests/setup.ts`) -
// was ein Test hier umstellt, kommt danach genau so zurück.
const NAV_FELDER = ["platform", "language"] as const;
let navVorher: (PropertyDescriptor | undefined)[] = [];

beforeEach(() => {
  navVorher = NAV_FELDER.map((f) => Object.getOwnPropertyDescriptor(navigator, f));
  localStorage.clear();
  useBrailleAuth.setState({ account: null });
  useBrailleA11y.getState().resetZoom();
});

afterEach(() => {
  cleanup();
  NAV_FELDER.forEach((f, i) => {
    const d = navVorher[i];
    if (d) Object.defineProperty(navigator, f, d);
    else delete (navigator as unknown as Record<string, unknown>)[f];
  });
});

function Ort() {
  return <div data-testid="ort">{useLocation().pathname}</div>;
}

function zeigeSeite() {
  render(
    <MemoryRouter initialEntries={["/programme/punktgenau"]}>
      <PunktgenauPage />
      <Ort />
    </MemoryRouter>,
  );
}

const alt = (code: string, key: string, ziel: Document | Element = document) =>
  fireEvent.keyDown(ziel, { code, key, altKey: true });

const umschalt = (ziel: Document | Element = document, repeat = false) =>
  fireEvent.keyDown(ziel, { key: "Shift", code: "ShiftLeft", shiftKey: true, repeat });

const wiederholt = () => useBraillePlay.getState().repeatNonce;
const runde = () => useBraillePlay.getState().roundNonce;

describe("Punktgenau - Kürzel wie in den anderen Lern-Apps", () => {
  it("★★★ Alt + 0 stellt die normale Größe wieder her - auch am Mac (Wahl + 0 ergibt „º“)", () => {
    zeigeSeite();
    alt("BracketRight", "+");
    alt("BracketRight", "+");
    expect(useBrailleA11y.getState().zoomIndex).toBe(2);
    alt("Digit0", "0");
    expect(useBrailleA11y.getState().zoomIndex).toBe(0);

    alt("BracketRight", "+");
    expect(useBrailleA11y.getState().zoomIndex).toBe(1);
    alt("Digit0", "º");
    expect(useBrailleA11y.getState().zoomIndex).toBe(0);
  });

  it("★★★ Alt + G springt zur nächsten Überschrift und meldet sie", async () => {
    zeigeSeite();
    alt("KeyG", "g");
    const ziel = document.activeElement as HTMLElement;
    expect(ziel.tagName).toMatch(/^H[1-6]$/);
    await waitFor(() =>
      expect(screen.getAllByRole("status").some((s) => /Überschrift:/.test(s.textContent ?? ""))).toBe(true),
    );
  });

  it("★★★ Umschalt zweimal sagt die Aufgabe noch einmal an - derselbe Weg wie Alt + W", () => {
    zeigeSeite();
    const vorher = wiederholt();
    umschalt();
    expect(wiederholt()).toBe(vorher); // ein Druck allein: noch nichts
    umschalt();
    expect(wiederholt()).toBe(vorher + 1);

    alt("KeyW", "w");
    expect(wiederholt()).toBe(vorher + 2);
  });

  it("★★ Umschalt gehalten oder mit einer Taste dazwischen ist KEIN Doppeldruck", () => {
    zeigeSeite();
    const vorher = wiederholt();
    umschalt();
    umschalt(document, true); // gehalten: die Taste wiederholt sich
    umschalt(document, true);
    expect(wiederholt()).toBe(vorher);
    fireEvent.keyDown(document.body, { key: "j", code: "KeyJ" }); // Neuanfang

    umschalt(document.body);
    fireEvent.keyDown(document.body, { key: "a", code: "KeyA" });
    umschalt(document.body);
    expect(wiederholt()).toBe(vorher);
  });

  it("★★ Umschalt zweimal wirkt nicht in fremden Feldern, wohl aber im Antwortfeld", () => {
    zeigeSeite();
    const fremd = document.createElement("input");
    const antwort = document.createElement("input");
    antwort.dataset.kuerzel = "an";
    document.body.append(fremd, antwort);
    try {
      const vorher = wiederholt();
      umschalt(fremd);
      umschalt(fremd);
      expect(wiederholt()).toBe(vorher);
      umschalt(antwort);
      umschalt(antwort);
      expect(wiederholt()).toBe(vorher + 1);
    } finally {
      fremd.remove();
      antwort.remove();
    }
  });

  it("★★★ Alt + Z sagt die Runde an - Alt + Y wirkt nicht mehr mit (QWERTY, QWERTZ, Mac)", () => {
    zeigeSeite();
    const vorher = runde();
    // Windows, deutsche Tastatur: die Z-Taste liegt auf `KeyY`, e.key ist „z".
    alt("KeyY", "z");
    expect(runde()).toBe(vorher + 1);
    // Dieselbe Tastatur, die Y-Taste (`KeyZ`, e.key „y") - tut nichts mehr.
    alt("KeyZ", "y");
    expect(runde()).toBe(vorher + 1);

    // Mac, deutsche Tastatur: e.key ist ein Sonderzeichen, es zählt die Belegung.
    setzeNavigator("language", "de-DE");
    alt("KeyY", "Ω"); // die Z-Taste
    expect(runde()).toBe(vorher + 2);
    alt("KeyZ", "¥"); // die Y-Taste
    expect(runde()).toBe(vorher + 2);

    // Mac mit englischer Sprache ⇒ US-Lage: dort liegt das Z auf `KeyZ`.
    setzeNavigator("language", "en-US");
    alt("KeyZ", "Ω");
    expect(runde()).toBe(vorher + 3);
    alt("KeyY", "¥");
    expect(runde()).toBe(vorher + 3);
  });

  it("★★★ Alt + S: Die Seite verschluckt die Taste einer Lehrkraft nicht - die Kopfzeile führt nach „Meine Klassen“", async () => {
    const t = registerTeacher("Frau Huber", "huber-pg-kuerzel@example.org", "geheim123");
    if (!t.ok) throw new Error(t.error);
    useBrailleAuth.setState({ account: t.value });

    // Vor dem Rendern angemeldet - läuft damit VOR dem Horcher der Kopfzeile
    // (ebenfalls am `window`) und sieht, was die Seite (`document`) getan hat.
    let vonDerSeiteVerschluckt: boolean | null = null;
    const horcher = (e: KeyboardEvent) => {
      if (e.code === "KeyS" && e.altKey) vonDerSeiteVerschluckt = e.defaultPrevented;
    };
    window.addEventListener("keydown", horcher);
    try {
      zeigeSeite();
      alt("KeyS", "s");
      expect(vonDerSeiteVerschluckt).toBe(false);
      const ziel = meineKlasseHref("braille");
      if (!/^https?:/.test(ziel)) {
        await waitFor(() => expect(screen.getByTestId("ort").textContent).toBe(ziel.split("?")[0]));
      }
    } finally {
      window.removeEventListener("keydown", horcher);
    }
  });

  it("★★ Alt + S: Ein Kind bekommt weiter seine Statistik", async () => {
    const kind: BrailleAccount = {
      id: "pg-kuerzel-kind",
      role: "schueler",
      name: "Lea",
      selfManaged: true,
      email: "pg-kuerzel-kind@example.org",
      createdAt: 1,
    };
    useBrailleAuth.setState({ account: kind });
    zeigeSeite();
    alt("KeyS", "s");
    expect(await screen.findByRole("dialog", { name: "Meine Statistik" })).toBeTruthy();
  });

  it("★★★ Die Kürzel-Liste nennt Alt + 0, Melden, Alt + G und Umschalt zweimal", async () => {
    zeigeSeite();
    alt("KeyT", "t");
    const liste = await screen.findByRole("dialog", { name: "Tastenkürzel" });
    const text = liste.textContent ?? "";
    for (const k of ["Alt + 0", "Alt + Umschalt + P", "Alt + G"]) {
      expect(text, `fehlt: ${k}`).toContain(k);
    }
    // Der Name heißt seit 18.10.2026 „Umschalt zweimal" (vorher „Umschalt  Umschalt").
    expect(text).toMatch(/Umschalt zweimal- Kurz hintereinander/);
    expect(text).toMatch(/Fehler melden/);
    expect(text).toMatch(/auf dem Mac: Wahltaste/); // Windows: die Fußnote bleibt
  });

  it("★★★ Am Mac steht in der Kürzel-Liste „Wahl“ statt „Alt“", async () => {
    setzeNavigator("platform", "MacIntel");
    zeigeSeite();
    alt("KeyT", "†"); // Wahl + T am Mac
    const liste = await screen.findByRole("dialog", { name: "Tastenkürzel" });
    const text = liste.textContent ?? "";
    expect(text).toContain("Wahl + 0");
    expect(text).toContain("Wahl + Umschalt + P");
    expect(text).toContain("Wahl + G");
    expect(text, "am Mac darf kein „Alt“ in der Liste stehen").not.toMatch(/\bAlt\b/);
  });
});
