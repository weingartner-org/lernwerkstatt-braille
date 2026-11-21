/**
 * Alle Etappen sind für alle offen (Johannes 18.11.2026)
 *
 * „Wir wollen die Kapitel in allen Brailleschriftsystemen freischalten, jeder
 * soll sich das einstellen können, aber trotzdem wie bisher weiterarbeiten
 * können. Für alle, die schon üben, wird alles frei." Es gibt keine Sperre,
 * keine Klassen-Einstellung „Etappen frei wählbar" und keine Freigabe je
 * Kapitel mehr. Der Lernweg (Start bei der ersten ungemeisterten Etappe)
 * bleibt.
 */
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Punktgenau } from "../src/components/braille/Punktgenau";

const optionen = () => screen.getAllByRole("option") as HTMLOptionElement[];

describe("Punktgenau - keine Etappe ist gesperrt", () => {
  it("ohne Konto", () => {
    render(<Punktgenau ohneKlasse />);
    expect(optionen().some((o) => o.disabled || o.textContent?.includes("gesperrt"))).toBe(false);
  });

  it("Kind in einer Klasse, ohne jede Einstellung der Lehrkraft", () => {
    render(<Punktgenau accountId="k1" />);
    expect(optionen().some((o) => o.disabled || o.textContent?.includes("gesperrt"))).toBe(false);
  });

  it("jede Etappe lässt sich anwählen, der Weiter-Pfeil ist nicht gesperrt", () => {
    render(<Punktgenau accountId="k1" />);
    expect(screen.getByRole("button", { name: "Nächste Etappe" }).getAttribute("aria-disabled")).toBeNull();
  });
});
