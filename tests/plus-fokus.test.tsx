/**
 * Wächter für die Fokus-Führung.
 *
 * ★ Gemessen am 23.09.2026 im Browser: nach jedem Türwechsel stand der Fokus
 * auf `body`. Wer mit Screenreader liest, verliert damit seine Stelle und muss
 * die Seite von oben neu durchgehen - der Knopf, den man gedrückt hat, ist ja
 * weg, und der Fokus fällt mit ihm.
 *
 * Jeder Bereich nimmt deshalb seine Überschrift in den Fokus. Die Übung ist
 * die Ausnahme: dort ist das Eingabefeld das Ziel, weil dort gerechnet wird.
 */
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PlusStart } from "../src/components/plus/PlusStart";
import { PlusStufenwahl } from "../src/components/plus/PlusStufenwahl";
import { PlusWahl } from "../src/components/plus/PlusWahl";
import { PlusSammlung } from "../src/components/plus/PlusSammlung";
import { PlusStatistik } from "../src/components/plus/PlusStatistik";
import { PlusSpiele } from "../src/components/plus/PlusSpiele";
import { PlusUebung } from "../src/components/plus/PlusUebung";
import { neuesWochenziel } from "../src/lib/plus/abzeichen";
import { neuerStand } from "../src/lib/plus/coach";
import { leererFortschritt } from "../src/lib/plus/fortschritt";

const leer = () => {};

describe("Jeder Bereich fängt den Fokus", () => {
  it("die Startseite", () => {
    render(
      <PlusStart angemeldet={false} gerechnet={0} weg={null} gefunden={[]} wochenziel={neuesWochenziel(50)}
        onWahl={leer} onTraining={leer} onSammlung={leer} onSpiele={leer} />,
    );
    expect(document.activeElement).toBe(screen.getByRole("heading", { name: "Willkommen bei Plus!" }));
  });

  it("die Stufenwahl", () => {
    render(<PlusWahl stufe={null} onStufe={leer} onPaket={leer} />);
    expect(document.activeElement).toBe(screen.getByRole("heading", { name: "Welche Schulstufe?" }));
  });

  it("die Übungswahl", () => {
    render(<PlusWahl stufe={2} onStufe={leer} onPaket={leer} />);
    expect((document.activeElement as HTMLElement).tagName).toBe("H2");
  });

  it("Mein Training", () => {
    render(<PlusStufenwahl titel="Mein Training - welche Schulstufe?" onStufe={leer} onZurueck={leer} />);
    expect(document.activeElement).toBe(
      screen.getByRole("heading", { name: "Mein Training - welche Schulstufe?" }),
    );
  });

  it("die Sammlung", () => {
    render(
      <PlusSammlung stand={neuerStand(1)} stufe={1} gefunden={[]} wochenziel={neuesWochenziel(50)}
        chronik={[]} onWochenziel={leer} onZurueck={leer} />,
    );
    expect(document.activeElement).toBe(screen.getByRole("heading", { name: "Meine Sammlung" }));
  });

  it("die Statistik", () => {
    render(<PlusStatistik fortschritt={leererFortschritt()} onZurueck={leer} />);
    expect(document.activeElement).toBe(screen.getByRole("heading", { name: "Meine Statistik" }));
  });

  it("die Spielauswahl", () => {
    render(<PlusSpiele stufe={3} saat={1} onZurueck={leer} />);
    expect(document.activeElement).toBe(screen.getByRole("heading", { name: "Spiele" }));
  });

  it("★ die Übung nimmt das Eingabefeld - dort wird gerechnet", () => {
    render(<PlusUebung paketId="1-08" onZurueck={leer} saat={4} />);
    expect(document.activeElement).toBe(screen.getByLabelText("Deine Antwort"));
  });
});

describe("Die Überschrift bleibt aus dem Tabulator-Weg", () => {
  it("sie ist fokussierbar für das Programm, nicht für die Tabulatortaste", () => {
    render(<PlusStatistik fortschritt={leererFortschritt()} onZurueck={leer} />);
    expect(screen.getByRole("heading", { name: "Meine Statistik" })).toHaveAttribute("tabindex", "-1");
  });
});

describe("Auch jedes Spiel fängt den Fokus", () => {
  it.each([
    ["Zielzahl"], ["Heiß und kalt"], ["Turmbau"], ["Paare finden"],
    ["Schatzgitter"], ["Zahlenstrahl horchen"], ["Zug um Zug"],
  ])("%s", async (titel) => {
    const { fireEvent } = await import("@testing-library/react");
    render(<PlusSpiele stufe={3} saat={1} onZurueck={leer} />);
    fireEvent.click(screen.getByRole("button", { name: new RegExp(titel) }));
    expect((document.activeElement as HTMLElement).tagName, titel).toBe("H2");
    expect(document.activeElement?.textContent, titel).toBe(titel);
  });
});
