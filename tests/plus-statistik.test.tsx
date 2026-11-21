/**
 * Wächter für „Meine Zahlen".
 *
 * ★ Was hier NICHT stehen darf, ist die Hälfte der Prüfung: keine Zeit, keine
 * Note, kein Vergleich mit anderen. Ranglisten senken bei schwach platzierten
 * Kindern nachweislich die Beteiligung - und eine Zeit, die nie gemessen wird,
 * kann auch nicht gegen ein Kind verwendet werden.
 */
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PlusStatistik, anteilInWorten } from "../src/components/plus/PlusStatistik";
import { nachAntwort, nachLauf, neuerStand } from "../src/lib/plus/coach";
import { leererFortschritt, type PlusFortschritt } from "../src/lib/plus/fortschritt";

function standMitArbeit(): PlusFortschritt {
  let stand = neuerStand(100);
  for (let i = 0; i < 6; i++) stand = nachAntwort(stand, { paketId: "1-08", richtig: true, tag: 100 });
  for (let i = 0; i < 3; i++) stand = nachAntwort(stand, { paketId: "3-10", richtig: i > 0, tag: 101 });
  stand = nachLauf(nachLauf(stand, "1-08", 10, 10, 100), "1-08", 10, 10, 100);
  return {
    ...leererFortschritt(),
    stand,
    gerechnet: 9,
    richtige: 8,
    laeufeOhneFehler: 2,
    tage: [100, 101],
    abzeichen: ["plus-nilpferd"],
  };
}

describe("Meine Zahlen", () => {
  it("zeigt die eigenen Zahlen", () => {
    render(<PlusStatistik fortschritt={standMitArbeit()} onZurueck={() => {}} />);
    expect(screen.getByText("Gerechnet: 9 Aufgaben")).toBeInTheDocument();
    expect(screen.getByText("Richtig: 8 von 9 (89 Prozent)")).toBeInTheDocument();
    expect(screen.getByText("Tage, an denen du gerechnet hast: 2")).toBeInTheDocument();
    expect(screen.getByText("Verschiedene Übungen: 2 von 161")).toBeInTheDocument();
  });

  it("gliedert nach Schulstufen - und nur, wo etwas passiert ist", () => {
    render(<PlusStatistik fortschritt={standMitArbeit()} onZurueck={() => {}} />);
    expect(screen.getByText(/1\. Schulstufe: 1 von \d+ Übungen angefangen/)).toBeInTheDocument();
    expect(screen.getByText(/3\. Schulstufe: 1 von \d+ Übungen angefangen/)).toBeInTheDocument();
    expect(screen.queryByText(/7\. Schulstufe/)).toBeNull();
  });

  it("★ kennt keine Zeit, keine Note und keinen Vergleich", () => {
    const { container } = render(<PlusStatistik fortschritt={standMitArbeit()} onZurueck={() => {}} />);
    const text = container.textContent ?? "";
    expect(text).not.toMatch(/Minute|Sekunde|Dauer|Zeit|Tempo/i);
    expect(text).not.toMatch(/Note|Platz \d|Rangliste|Durchschnitt der Klasse|besser als/i);
  });

  it("★ zeigt nichts, was nur das Auge liest", () => {
    // Kein Balken, kein Diagramm, keine Farbe als einzige Auskunft.
    const { container } = render(<PlusStatistik fortschritt={standMitArbeit()} onZurueck={() => {}} />);
    expect(container.querySelectorAll("svg, canvas, progress, meter")).toHaveLength(0);
  });

  it("sagt freundlich Bescheid, solange nichts da ist", () => {
    render(<PlusStatistik fortschritt={leererFortschritt()} onZurueck={() => {}} />);
    expect(screen.getByText("Hier stehen deine Zahlen, sobald du gerechnet hast.")).toBeInTheDocument();
  });
});

describe("Der Anteil in Worten", () => {
  it.each([
    [8, 9, "8 von 9 (89 Prozent)"],
    [0, 0, "noch nichts"],
    [5, 5, "5 von 5 (100 Prozent)"],
  ])("%s von %s heißt: %s", (teil, ganz, erwartet) => {
    expect(anteilInWorten(teil, ganz)).toBe(erwartet);
  });
});
