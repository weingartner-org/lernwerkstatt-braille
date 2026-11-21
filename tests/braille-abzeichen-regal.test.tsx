/**
 * Abzeichen-Regal „Punktgenau" (AbzeichenRegal.tsx): verdiente Medaillen mit
 * Namensschild, die drei nächsten Ziele, die aufklappbare Voll-Liste je
 * Familie (Geheime bis zum Verdienen nur „???"), Medaillen bleiben rein
 * dekorativ (aria-hidden), und der Ansage-Satz je Medaille bleibt unter
 * 120 Zeichen (Braillezeile).
 */
import { describe, it, expect, afterEach } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { AbzeichenRegal, medaillenSatz } from "../src/components/braille/AbzeichenRegal";
import { ABZEICHEN } from "../src/lib/braille/abzeichen";
import { emptyProgress, type BrailleProgress } from "../src/lib/braille/progress";
import { AREAS } from "../src/lib/braille/areas";

afterEach(cleanup);

function progressMitAbzeichen(ids: string[]): BrailleProgress {
  const p = emptyProgress();
  return { ...p, abzeichen: Object.fromEntries(ids.map((id) => [id, 1758000000000])) };
}

describe("AbzeichenRegal - Medaillen-Regal", () => {
  it("zeigt verdiente Abzeichen als Medaillen (SVG, aria-hidden) mit Namensschild", () => {
    render(<AbzeichenRegal progress={progressMitAbzeichen(["etappe-1", "etappe-5"])} areas={AREAS} />);
    expect(screen.getByText("Erste Schritte")).toBeTruthy();
    expect(screen.getByText("Kleiner Sprössling")).toBeTruthy();
    const list = screen.getByRole("list", { name: "Verdiente Abzeichen" });
    const svgs = list.querySelectorAll("svg");
    expect(svgs.length).toBe(2);
    for (const svg of svgs) expect(svg.getAttribute("aria-hidden")).toBe("true");
  });

  it("ohne verdiente Abzeichen erscheint ein einladender, nicht wertender Hinweis", () => {
    render(<AbzeichenRegal progress={emptyProgress()} areas={AREAS} />);
    expect(screen.getByText(/Noch keine Abzeichen/)).toBeTruthy();
  });

  it("nennt bis zu drei nächste Ziele", () => {
    render(<AbzeichenRegal progress={emptyProgress()} areas={AREAS} />);
    const ziele = screen.getByRole("list", { name: "Nächste Ziele" });
    expect(ziele.querySelectorAll("[role='listitem']").length).toBe(3);
  });

  it(String.raw`klappt auf: alle Familien erscheinen, Geheime bleiben bis zum Verdienen „???"`, () => {
    render(<AbzeichenRegal progress={emptyProgress()} areas={AREAS} />);
    const knopf = screen.getByRole("button", { name: /Alle Abzeichen anzeigen/ });
    expect(knopf.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(knopf);
    expect(knopf.getAttribute("aria-expanded")).toBe("true");
    // Jede Definition erscheint einmal in der Vollliste (+ evtl. in den Zielen).
    expect(document.querySelectorAll("[data-abzeichen-regal] svg").length).toBeGreaterThanOrEqual(
      ABZEICHEN.length,
    );
    expect(screen.queryByText("Nachteule")).toBeNull();
    const geheimCount = ABZEICHEN.filter((b) => b.secret).length;
    expect(screen.getAllByText("???").length).toBe(geheimCount);
  });

  it("ein verdientes Geheim-Abzeichen zeigt seinen echten Namen", () => {
    render(<AbzeichenRegal progress={progressMitAbzeichen(["geheim-nachteule"])} areas={AREAS} />);
    // Schon in der Vitrine der verdienten Abzeichen (oben, ohne aufzuklappen).
    const vitrine = screen.getByRole("list", { name: "Verdiente Abzeichen" });
    expect(vitrine.textContent).toContain("Nachteule");
    fireEvent.click(screen.getByRole("button", { name: /Alle Abzeichen anzeigen/ }));
    // Und auch in der aufgeklappten Vollliste steht der echte Name, nicht „???".
    expect(screen.getAllByText("Nachteule").length).toBeGreaterThanOrEqual(2);
  });

  it("Fokus-Ziel: der Aufklapp-Knopf bleibt nach dem Betätigen selbst im Fokus", () => {
    render(<AbzeichenRegal progress={emptyProgress()} areas={AREAS} />);
    const knopf = screen.getByRole("button", { name: /Alle Abzeichen anzeigen/ });
    knopf.focus();
    fireEvent.click(knopf);
    expect(document.activeElement).toBe(knopf);
  });

  it(String.raw`zeigt einen Familien-Zähler je aufgeklappter Gruppe („X von Y")`, () => {
    render(<AbzeichenRegal progress={progressMitAbzeichen(["etappe-1"])} areas={AREAS} />);
    fireEvent.click(screen.getByRole("button", { name: /Alle Abzeichen anzeigen/ }));
    expect(screen.getByText(/Etappenpfad/).textContent).toMatch(/1 von 5/);
  });
});

describe("Die Medaille als Satz (Sprachausgabe)", () => {
  it("jeder Ansage-Satz bleibt unter 120 Zeichen (Braillezeile)", () => {
    for (const b of ABZEICHEN) {
      expect(medaillenSatz(b, false).length, b.id).toBeLessThan(120);
      if (b.secret) expect(medaillenSatz(b, true).length, b.id).toBeLessThan(120);
    }
  });

  it("ein verborgenes Geheim-Abzeichen verrät weder Metall noch Motiv", () => {
    const geheim = ABZEICHEN.find((b) => b.secret)!;
    expect(medaillenSatz(geheim, true)).toBe("Graue Medaille mit grauem Band und einem Fragezeichen.");
  });

  it("ein verdientes Abzeichen nennt Metall, Band und Motiv", () => {
    const b = ABZEICHEN.find((x) => x.id === "etappe-1")!;
    const satz = medaillenSatz(b, false);
    expect(satz).toMatch(/Medaille/);
    expect(satz).toContain(b.bildbeschreibung);
  });
});
