/**
 * Wächter für die Oberfläche der Staffel.
 *
 * Die Staffel ist das einzige Spiel, das eine Klasse zusammen spielt - und
 * damit das einzige, bei dem ein Kind etwas über andere Kinder erfahren
 * könnte. Der letzte Abschnitt prüft, dass es nichts erfährt.
 */
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PlusStaffel } from "../src/components/plus/PlusStaffel";
import { tafelZuruecksetzen } from "../src/lib/plus/staffelTafel";
import { etappeFuer, staffelFuer } from "../src/lib/plus/staffel";

const WOCHE = "2026-39";
const KLASSE = "allein";     // ohne Anmeldung ist die Klasse das eigene Gerät

function zeige(stufe = 3, ansagen = vi.fn()) {
  const sicht = render(
    <PlusStaffel
      stufe={stufe}
      woche={WOCHE}
      ansagen={ansagen}
      art="normal"
      onArt={() => {}}
      onZurueck={() => {}}
    />,
  );
  return { ...sicht, ansagen };
}

beforeEach(() => {
  localStorage.clear();
  tafelZuruecksetzen();
});

describe("Die Staffel steht da", () => {
  it("sagt, wie weit die Klasse ist", async () => {
    const s = staffelFuer(KLASSE, WOCHE);
    zeige();
    expect(await screen.findByText(`0 von ${s.anzahl} Etappen sind gelaufen.`)).toBeInTheDocument();
  });

  it("zeigt das Wort zugedeckt - ein Unterstrich je Buchstabe", async () => {
    const s = staffelFuer(KLASSE, WOCHE);
    zeige();
    const zugedeckt = Array(s.wort.length).fill("_").join(" ");
    expect(await screen.findByText(zugedeckt)).toBeInTheDocument();
  });

  it("verrät das Wort nicht, bevor es aufgedeckt ist", async () => {
    const s = staffelFuer(KLASSE, WOCHE);
    const { container } = zeige();
    await screen.findByText(/Etappen sind gelaufen/);
    expect(container.textContent ?? "").not.toContain(s.wort);
  });

  it("stellt die erste Etappe in der Stufe des Kindes", async () => {
    const e = etappeFuer(KLASSE, WOCHE, 1, 3)!;
    zeige(3);
    expect(await screen.findByText(e.aufgabe.angabe)).toBeInTheDocument();
    expect(screen.getByText("Deine Etappe: Nummer 1")).toBeInTheDocument();
  });

  it("★★ ein anderes Kind derselben Klasse bekommt dieselbe Etappe, andere Rechnung", async () => {
    const klein = etappeFuer(KLASSE, WOCHE, 1, 2)!;
    const gross = etappeFuer(KLASSE, WOCHE, 1, 7)!;
    expect(klein.nr).toBe(gross.nr);
    expect(klein.aufgabe.angabe).not.toBe(gross.aufgabe.angabe);
  });
});

describe("Eine Etappe laufen", () => {
  it("★★★ bringt die Klasse weiter und deckt einen Buchstaben auf", async () => {
    const s = staffelFuer(KLASSE, WOCHE);
    const e1 = etappeFuer(KLASSE, WOCHE, 1, 3)!;
    const e2 = etappeFuer(KLASSE, WOCHE, 2, 3)!;
    zeige(3);
    await screen.findByText(e1.aufgabe.angabe);

    fireEvent.change(screen.getByLabelText("Deine Antwort"), { target: { value: e1.aufgabe.loesung } });
    fireEvent.click(screen.getByRole("button", { name: "Etappe laufen" }));
    await waitFor(() => expect(screen.getByText(`1 von ${s.anzahl} Etappen sind gelaufen.`)).toBeInTheDocument());

    // Etappe 2 deckt den ersten Buchstaben auf (jede zweite tut es).
    await screen.findByText(e2.aufgabe.angabe);
    fireEvent.change(screen.getByLabelText("Deine Antwort"), { target: { value: e2.aufgabe.loesung } });
    fireEvent.click(screen.getByRole("button", { name: "Etappe laufen" }));
    await waitFor(() => {
      const gezeigt = screen.getByText(/^[A-Z_]( [A-Z_])*$/).textContent ?? "";
      expect(gezeigt.replace(/[ _]/g, "").length).toBe(1);
    });
  });

  it("eine falsche Antwort bringt die Klasse nicht weiter - und schimpft nicht", async () => {
    const s = staffelFuer(KLASSE, WOCHE);
    const { ansagen } = zeige(3);
    await screen.findByText("Deine Etappe: Nummer 1");
    fireEvent.change(screen.getByLabelText("Deine Antwort"), { target: { value: "999999" } });
    fireEvent.click(screen.getByRole("button", { name: "Etappe laufen" }));
    expect(screen.getByText(`0 von ${s.anzahl} Etappen sind gelaufen.`)).toBeInTheDocument();
    const satz = ansagen.mock.calls.at(-1)?.[0] ?? "";
    expect(satz).toBe("Noch nicht. Schau die Zahlen noch einmal an.");
    expect(satz).not.toMatch(/falsch|leider|Fehler/i);
  });
});

describe("Das Wort raten", () => {
  it("★★★ wer es errät, hat es für die ganze Klasse erraten", async () => {
    const s = staffelFuer(KLASSE, WOCHE);
    zeige(3);
    await screen.findByText(/Etappen sind gelaufen/);
    fireEvent.change(screen.getByLabelText(/Du kennst das Wort schon/), { target: { value: s.wort.toLowerCase() } });
    fireEvent.click(screen.getByRole("button", { name: "Wort raten" }));
    await waitFor(() => expect(screen.getByText(/Geschafft/)).toBeInTheDocument());
    // ★ Und dann steht das Wort ganz da - nicht halb verdeckt neben dem Satz,
    // der es schon nennt.
    expect(screen.getByText("Das Wort war:")).toBeInTheDocument();
    expect(screen.getByText(s.wort.split("").join(" "))).toBeInTheDocument();
  });

  it("falsch geraten kostet nichts - man darf wieder", async () => {
    zeige(3);
    await screen.findByText(/Etappen sind gelaufen/);
    fireEvent.change(screen.getByLabelText(/Du kennst das Wort schon/), { target: { value: "quatsch" } });
    fireEvent.click(screen.getByRole("button", { name: "Wort raten" }));
    expect(screen.getByText(/sooft du willst/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Wort raten" })).toBeEnabled();
  });
});

describe("★★★★★ Was die Tafel der Klasse NICHT zeigt", () => {
  it("keinen Namen, keine Reihung, keine Zeit", async () => {
    const { container } = zeige(3);
    await screen.findByText(/Etappen sind gelaufen/);
    const text = container.textContent ?? "";
    expect(text).not.toMatch(/Platz \d|Rangliste|Sieger|Beste|Sekunde|Minute|Uhr/i);
    // Kein Satz über ein anderes Kind.
    expect(text).not.toMatch(/hat .* Etappen gelaufen|von [A-Z][a-z]+/);
  });

  it("kein Bedienteil ist abgeschaltet", async () => {
    const { container } = zeige(3);
    await screen.findByText(/Etappen sind gelaufen/);
    expect(container.querySelectorAll("[disabled]")).toHaveLength(0);
  });

  it("die Überschrift bekommt den Fokus", async () => {
    zeige(3);
    await waitFor(() => expect(document.activeElement).toBe(screen.getByRole("heading", { level: 2 })));
  });
});
