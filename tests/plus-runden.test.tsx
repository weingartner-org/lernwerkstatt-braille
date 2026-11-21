/**
 * Wächter für die Runden und das Rätsel (26.09.2026).
 *
 * Johannes: „rundenbasiert aufbauen, 8 Rechnungen und nach 3 Runden kommt ein
 * Rätsel, das man auch überspringen kann". Geprüft wird, was ein Kind erlebt:
 * acht Aufgaben, dann - jede dritte Runde - ein Rätsel mit einem Knopf zum
 * Überspringen, der von Anfang an dasteht.
 */
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PlusUebung } from "../src/components/plus/PlusUebung";
import { PlusPage } from "../src/features/public/PlusPage";
import type { Aufgabe } from "../src/lib/plus/aufgabe";
import { RUNDE, RUNDEN_BIS_RAETSEL, stelleLauf, neuerStand } from "../src/lib/plus/coach";
import { backendZuruecksetzen, heile } from "../src/lib/plus/fortschritt";
import { erzeugeLauf } from "../src/lib/plus/generator";
import { useTypingAuth } from "../src/components/typing/useTypingAuth";

const RAETSEL: Aufgabe = {
  paket: "raetsel-1", art: "knobel", op: "plus", titel: "Zahlen-Detektiv",
  angabe: "Ich bin größer als 12 und kleiner als 15.\nIch bin gerade.\nDie Zahl =[]",
  loesung: "14", zahlen: [14],
  tipp: "Welche Zahlen liegen dazwischen?",
  erklaerung: "13 und 14 liegen dazwischen. Nur 14 ist gerade.",
};

const lauf = () => erzeugeLauf("1-08", { anzahl: RUNDE, saat: 4 });

/** Eine ganze Runde richtig rechnen. */
function rechneRunde() {
  for (const a of lauf()) {
    fireEvent.change(screen.getByLabelText("Deine Antwort"), { target: { value: a.loesung } });
    fireEvent.click(screen.getByRole("button", { name: "Prüfen" }));
  }
}

describe("Eine Runde hat acht Aufgaben", () => {
  it("in „Ich wähle“ wie im Training", () => {
    expect(RUNDE).toBe(8);
    expect(RUNDEN_BIS_RAETSEL).toBe(3);
    expect(lauf()).toHaveLength(8);
    expect(stelleLauf(neuerStand(), { stufe: 2, anzahl: RUNDE, rng: () => 0.3 }).pakete.length).toBeLessThanOrEqual(8);
  });

  it("sagt am Ende, wie weit das Rätsel ist", () => {
    render(<PlusUebung paketId="1-08" saat={4} onZurueck={() => {}} rundenBisRaetsel={2} />);
    rechneRunde();
    expect(screen.getByText("Geschafft")).toBeInTheDocument();
    expect(screen.getByText("Noch 2 Runden bis zum Rätsel.")).toBeInTheDocument();
  });

  it("★ der Fokus geht am Ende auf den ersten Knopf, nicht auf body", async () => {
    render(<PlusUebung paketId="1-08" saat={4} onZurueck={() => {}} onNaechsteRunde={() => {}} />);
    rechneRunde();
    await waitFor(() => expect(document.activeElement).toBe(screen.getByRole("button", { name: "Weiter - nächste Runde" })));
  });
});

describe("Das Rätsel nach der Runde", () => {
  it("kommt nach der letzten Aufgabe - mit Überspringen von Anfang an", () => {
    render(<PlusUebung paketId="1-08" saat={4} onZurueck={() => {}} raetsel={RAETSEL} />);
    rechneRunde();
    expect(screen.getByText("8 von 8 richtig. Jetzt kommt ein Rätsel.")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Rätsel: Zahlen-Detektiv" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Überspringen" })).toBeInTheDocument();
    // Die Lösung gibt es erst nach zwei Versuchen.
    expect(screen.queryByRole("button", { name: "Lösung zeigen" })).toBeNull();
    // Ohne Braillezeile steht die Zeile oben und das Feld ist leer (Johannes, 19.10.2026).
    expect(screen.getByLabelText("Deine Antwort")).toHaveValue("");
  });

  it("überspringen führt zum Abschluss und wird gemeldet", () => {
    const ende = vi.fn();
    render(<PlusUebung paketId="1-08" saat={4} onZurueck={() => {}} raetsel={RAETSEL} onRaetselEnde={ende} />);
    rechneRunde();
    fireEvent.click(screen.getByRole("button", { name: "Überspringen" }));
    expect(ende).toHaveBeenCalledWith("uebersprungen", RAETSEL);
    expect(screen.getByText("Geschafft")).toBeInTheDocument();
  });

  it("gelöst: die Erklärung kommt, der Fokus geht auf Weiter", async () => {
    const ende = vi.fn();
    render(<PlusUebung paketId="1-08" saat={4} onZurueck={() => {}} raetsel={RAETSEL} onRaetselEnde={ende} />);
    rechneRunde();
    fireEvent.change(screen.getByLabelText("Deine Antwort"), { target: { value: "Die Zahl =14" } });
    fireEvent.click(screen.getByRole("button", { name: "Prüfen" }));
    expect(screen.getByRole("status")).toHaveTextContent("Gelöst! 13 und 14 liegen dazwischen. Nur 14 ist gerade.");
    const weiter = screen.getByRole("button", { name: "Weiter" });
    await waitFor(() => expect(document.activeElement).toBe(weiter));
    fireEvent.click(weiter);
    expect(ende).toHaveBeenCalledWith("geloest", RAETSEL);
    expect(screen.getByText("Geschafft")).toBeInTheDocument();
  });

  it("zwei Versuche, dann gibt es die Lösung - und der Tipp nur auf Knopfdruck", () => {
    const ende = vi.fn();
    render(<PlusUebung paketId="1-08" saat={4} onZurueck={() => {}} raetsel={RAETSEL} onRaetselEnde={ende} />);
    rechneRunde();
    expect(screen.queryByText(/^Tipp:/)).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Tipp" }));
    expect(screen.getByText("Tipp: Welche Zahlen liegen dazwischen?")).toBeInTheDocument();
    for (let i = 0; i < 2; i++) {
      fireEvent.change(screen.getByLabelText("Deine Antwort"), { target: { value: "13" } });
      fireEvent.click(screen.getByRole("button", { name: "Prüfen" }));
    }
    expect(screen.getByRole("status")).toHaveTextContent("Noch nicht");
    fireEvent.click(screen.getByRole("button", { name: "Lösung zeigen" }));
    expect(screen.getByRole("status")).toHaveTextContent("Die Lösung ist 14.");
    fireEvent.click(screen.getByRole("button", { name: "Weiter" }));
    expect(ende).toHaveBeenCalledWith("aufgeloest", RAETSEL);
  });

  it("★ hat genau eine Live-Region", () => {
    const { container } = render(<PlusUebung paketId="1-08" saat={4} onZurueck={() => {}} raetsel={RAETSEL} />);
    rechneRunde();
    expect(container.querySelectorAll('[role="status"], [aria-live]').length).toBe(1);
  });
});

describe("Auf der Seite: jede dritte Runde", () => {
  beforeEach(() => {
    localStorage.clear();
    useTypingAuth.setState({ account: null });
    backendZuruecksetzen();
  });

  /** Eine Runde durchgehen, ohne die Aufgaben zu kennen: zweimal daneben, dann auflösen. */
  function rundeDurch() {
    for (let i = 0; i < RUNDE; i++) {
      for (let v = 0; v < 2; v++) {
        fireEvent.change(screen.getByLabelText("Deine Antwort"), { target: { value: "99999" } });
        fireEvent.click(screen.getByRole("button", { name: "Prüfen" }));
      }
      fireEvent.click(screen.getByRole("button", { name: "Ich komme nicht weiter" }));
      fireEvent.click(screen.getByRole("button", { name: "Weiter" }));
    }
  }

  async function oeffneTauschaufgabe() {
    render(<MemoryRouter><PlusPage /></MemoryRouter>);
    await waitFor(() => screen.getByText("Willkommen bei Plus!"));
    fireEvent.click(screen.getByRole("button", { name: /Ich wähle/ }));
    fireEvent.click(screen.getByRole("button", { name: /1\. Schulstufe/ }));
    fireEvent.click(screen.getByRole("button", { name: "Tauschaufgabe" }));
  }

  it("nach zwei fertigen Runden bringt die dritte ein Rätsel", async () => {
    localStorage.setItem("plus:stand:anonym", JSON.stringify({ runden: 2 }));
    await oeffneTauschaufgabe();
    rundeDurch();
    expect(screen.getByRole("heading", { name: /^Rätsel: / })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Überspringen" }));
    expect(screen.getByText("Geschafft")).toBeInTheDocument();
    await waitFor(() => expect(heile(JSON.parse(localStorage.getItem("plus:stand:anonym")!)).runden).toBe(3));
  });

  it("die Runde davor bringt keines - und „Weiter“ beginnt eine neue Runde", async () => {
    localStorage.setItem("plus:stand:anonym", JSON.stringify({ runden: 0 }));
    await oeffneTauschaufgabe();
    rundeDurch();
    expect(screen.queryByRole("heading", { name: /^Rätsel: / })).toBeNull();
    expect(screen.getByText("Geschafft")).toBeInTheDocument();
    await waitFor(() => screen.getByText("Noch 2 Runden bis zum Rätsel."));
    fireEvent.click(screen.getByRole("button", { name: "Weiter - nächste Runde" }));
    expect(screen.getByText("Aufgabe 1 von 8")).toBeInTheDocument();
  });
});
