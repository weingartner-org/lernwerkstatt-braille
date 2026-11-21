/**
 * ★★★ ALT + PLUS WIRKT AUCH IM LESEN (07.09.2026).
 *
 * Johannes: *„zoom funktioniert im Lesen Modus nicht, kein Alt ++"*.
 *
 * Gemessen war: Der Zoom-Speicher und das Kürzel waren in Ordnung - die
 * Anzeige zählte sichtbar auf „200 %“ hoch. Nur EIN Panel las die Zahl je aus,
 * das Schreib-Panel. Im Lese-Modus blieben die Braillezellen bei fest
 * verdrahteten 40 Pixeln und das Antwortfeld in Grundgröße.
 *
 * ⚠️ WARUM DAS MEHR IST ALS EIN SCHÖNHEITSFEHLER: Beim SCHREIBEN drückt ein
 * Kind Punkt-Tasten - es muss nichts genau erkennen. Beim LESEN muss es die
 * sechs Punkte mit den Augen ABLESEN. Die Vergrößerung fehlte also genau dort,
 * wo ein Kind mit Sehbeeinträchtigung sie braucht.
 *
 * Dieser Wächter misst die Zellgröße am gezeichneten SVG und nicht am
 * Speicher: Ein Zoom-Wert, den niemand ausliest, ist genau der Fehler, der
 * hier behoben wurde ([[feedback_gruener_waechter_beweist_was]]).
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { act, cleanup, render } from "@testing-library/react";
import { BrailleExercise } from "../src/components/braille/BrailleTrainer";
import { useBrailleA11y, ZOOM_LEVELS } from "../src/lib/braille/a11y";
import { emptyProgress } from "../src/lib/braille/progress";

afterEach(cleanup);
beforeEach(() => {
  act(() => useBrailleA11y.getState().resetZoom());
});

/**
 * Die Höhe der ersten gezeichneten Braillezelle IM ÜBUNGSBEREICH.
 *
 * ⚠️ Nicht `document.querySelector("svg")`: Auf der Seite stehen auch andere
 * SVG (Zeichen, Ringe). Gemessen wird im Übungsbereich - beim Lesen in der
 * Angabe (`data-angabe`), beim Schreiben im Eingabefeld (`data-feld`).
 * `BrailleCell` setzt `height` in Pixeln; die Breite folgt dem Seitenverhältnis.
 */
function ersteZellgroesse(): number {
  // Beim Lesen stehen die Zellen in der Angabe, beim Schreiben im Eingabefeld -
  // gesucht wird in beiden, genommen die erste gefundene Zelle.
  const bereiche = [
    ...document.querySelectorAll("[data-angabe]"),
    ...document.querySelectorAll('[data-schreibflaeche]'),
  ];
  if (bereiche.length === 0) throw new Error("Kein Übungsbereich gefunden.");
  const svg = bereiche.map((b) => b.querySelector("svg")).find(Boolean);
  if (!svg) throw new Error("Keine Braillezelle gezeichnet.");
  const h = svg.getAttribute("height");
  const zahl = Number(String(h).replace(/[^0-9.]/g, ""));
  if (!Number.isFinite(zahl) || zahl === 0)
    throw new Error(`Zellgröße nicht lesbar: ${String(h)}`);
  return zahl;
}

function zeige(direction: "write" | "read") {
  render(
    <BrailleExercise
      levelId="l1-reihe1"
      direction={direction}
      loadFn={() => emptyProgress()}
      saveFn={() => {}}
    />,
  );
}

describe("Größe (Alt + / −) im Übungsbereich", () => {
  it("★★★★ wirkt im LESEN - der Fehler, um den es ging", () => {
    zeige("read");
    const grund = ersteZellgroesse();

    act(() => useBrailleA11y.getState().zoomIn());

    expect(ersteZellgroesse()).toBeGreaterThan(grund);
  });

  it("wirkt weiterhin im SCHREIBEN (nichts ist dabei kaputtgegangen)", () => {
    zeige("write");
    const grund = ersteZellgroesse();

    act(() => useBrailleA11y.getState().zoomIn());

    expect(ersteZellgroesse()).toBeGreaterThan(grund);
  });

  it("★★ bei 100 % sieht das Lese-Panel aus wie vorher: 40 Pixel", () => {
    // Die Grundwerte waren vorher fest verdrahtet. Der gemeinsame Haken darf
    // sie NICHT verändern - eine App, die nach einer Behebung anders aussieht
    // als vorher, hat eine unbestellte Änderung mitbekommen.
    zeige("read");
    expect(ersteZellgroesse()).toBe(40);
  });

  it("★★ das Antwortfeld wächst mit - sonst kann das Kind seine eigene Lösung nicht lesen", () => {
    zeige("read");
    const feld = document.querySelector<HTMLInputElement>('[data-feld="antwort"]');
    expect(feld).not.toBeNull();
    const vorher = feld!.style.fontSize;

    act(() => {
      useBrailleA11y.getState().zoomIn();
      useBrailleA11y.getState().zoomIn();
    });

    expect(feld!.style.fontSize).not.toBe(vorher);
    expect(parseFloat(feld!.style.fontSize)).toBeGreaterThan(1);
  });

  it("★★ das Feld ist gedeckelt - bei voller Vergrößerung passt noch eine Zeile hinein", () => {
    // Die Zellen dürfen umbrechen, ein Eingabefeld nicht: Mit 8-facher Schrift
    // bekäme es kein einziges Wort mehr auf den Schirm.
    zeige("read");
    act(() => {
      for (let i = 0; i < ZOOM_LEVELS.length; i += 1)
        useBrailleA11y.getState().zoomIn();
    });
    const feld = document.querySelector<HTMLInputElement>('[data-feld="antwort"]');
    expect(parseFloat(feld!.style.fontSize)).toBeLessThanOrEqual(3);
    // Die Zellen selbst sind dabei sehr wohl mitgewachsen.
    expect(ersteZellgroesse()).toBeGreaterThan(40);
  });
});
