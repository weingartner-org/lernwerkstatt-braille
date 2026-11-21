/**
 * Übezeit-Uhr in der Kopfleiste von Punktgenau (22.09.2026, Auftrag Johannes:
 * „oben eine mitlaufende Uhr mit der heutigen Übezeit - so wie in Tastenflow,
 * und zwar immer, nicht nur wenn eine Wochenaufgabe gesetzt ist").
 *
 * Geprüft wird die OBERFLÄCHE (die Rechnung dahinter steht in
 * `tests/braille-uebeuhr.test.ts`):
 *   · Die Uhr steht IMMER in der Kopfleiste, auch ohne jede Wochenaufgabe.
 *   · `role="timer"`, aber KEINE `aria-live`-Region - eine tickende Zahl
 *     würde die Braillezeile alle paar Sekunden verdrängen
 *     ([[reference_live_region_ist_braille_blitzmeldung]]).
 *   · Sie ist trotzdem per Tastenweg erreichbar (tabIndex) und trägt einen
 *     Hinweis, der erklärt, was sie zeigt.
 *   · Sie zeigt die beim Laden aufgesetzte („geprimte") Übezeit.
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { Punktgenau } from "../src/components/braille/Punktgenau";
import { primeUebeUhr, resetUebeUhr } from "../src/lib/braille/uebeUhr";

afterEach(cleanup);
beforeEach(() => resetUebeUhr());

/** Die Kopfleisten-Karte (wie in `tests/braille-kopfleiste.test.tsx`). */
function kopfleiste(): HTMLElement {
  const el = document.querySelector("[data-kopfleiste]");
  if (!el) throw new Error("Keine Kopfleiste ([data-kopfleiste]) im Dokument.");
  return el as HTMLElement;
}

function uebeUhrElement(): HTMLElement {
  const el = kopfleiste().querySelector('[role="timer"]');
  if (!el) throw new Error('Keine Übezeit-Uhr ([role="timer"]) in der Kopfleiste.');
  return el as HTMLElement;
}

/** Findet den Hinweistext, den `element` über `aria-describedby` trägt. */
function hinweisVon(element: Element): string {
  const id = element.getAttribute("aria-describedby");
  expect(id, `${element.tagName} hat kein aria-describedby`).toBeTruthy();
  const hinweis = document.getElementById(id!);
  expect(hinweis, `kein Element mit id="${id}"`).toBeTruthy();
  return hinweis!.textContent ?? "";
}

describe("Übezeit-Uhr - immer sichtbar in der Kopfleiste", () => {
  it("steht in der Kopfleiste, OHNE dass eine Wochenaufgabe gesetzt ist", () => {
    render(<Punktgenau ohneKlasse />);
    // Ohne Konto/Klasse gibt es keine Wochenaufgabe - die Uhr steht trotzdem da.
    const uhr = uebeUhrElement();
    expect(uhr.getAttribute("role")).toBe("timer");
  });

  it("trägt KEINE aria-live-Region - die tickende Zahl bleibt aria-hidden", () => {
    render(<Punktgenau ohneKlasse />);
    const uhr = uebeUhrElement();
    expect(uhr.getAttribute("aria-live")).toBeNull();
    expect(uhr.getAttribute("role")).not.toBe("status");
    // Die sichtbaren Ziffern selbst sind aria-hidden - der aria-label am
    // Container trägt die Ansage, nicht ein Live-Update der Ziffern.
    const ziffern = uhr.querySelector("span[aria-hidden='true']");
    expect(ziffern).toBeTruthy();
  });

  it("ist per Tastenweg erreichbar (tabIndex) und trägt einen erklärenden Hinweis", () => {
    render(<Punktgenau ohneKlasse />);
    const uhr = uebeUhrElement();
    expect(uhr.getAttribute("tabindex")).toBe("0");
    expect(hinweisVon(uhr)).toMatch(/geübt/);
  });

  it("zeigt die beim Laden aufgesetzte, geprimte Übezeit als aria-label", () => {
    primeUebeUhr("anon", 125_000, Date.now()); // 2:05, wie ein Neuladen am selben Tag
    render(<Punktgenau ohneKlasse />);
    const uhr = uebeUhrElement();
    expect(uhr.getAttribute("aria-label")).toMatch(/Heute geübt: 2:05/);
  });
});
