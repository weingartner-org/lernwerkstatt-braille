/**
 * Wächter für die Seite als Ganzes - die fünf Türen und ihr Zusammenspiel.
 *
 * Was die einzelnen Bereiche können, prüfen ihre eigenen Dateien. Hier steht,
 * was nur im Zusammenspiel auffällt.
 */
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import { PlusPage } from "../src/features/public/PlusPage";
import { backendZuruecksetzen } from "../src/lib/plus/fortschritt";
import { useTypingAuth } from "../src/components/typing/useTypingAuth";

beforeEach(() => {
  localStorage.clear();
  useTypingAuth.setState({ account: null });
  backendZuruecksetzen();
});

const seite = () => render(<MemoryRouter><PlusPage /></MemoryRouter>);

describe("Die Türen", () => {
  it("stehen auf der Startseite - Mein Training vorne, Meine Zahlen nicht mehr", async () => {
    seite();
    await waitFor(() => expect(screen.getByText("Willkommen bei Plus!")).toBeInTheDocument());
    expect(screen.getByRole("heading", { name: /Mein Training|Plus sucht/ })).toBeInTheDocument();
    for (const tuer of ["Los geht's", "Ich wähle", "Spiele", "Meine Sammlung"]) {
      expect(screen.getByRole("button", { name: new RegExp(tuer) }), tuer).toBeInTheDocument();
    }
    // ★ Die Statistik gehört ins Konto-Menü (Johannes 23.09.2026).
    expect(screen.queryByRole("button", { name: /Meine Zahlen|Meine Statistik/ })).toBeNull();
  });

  it("★ die Statistik steht im Konto-Menü - mit Namen in der Kopfzeile", async () => {
    useTypingAuth.setState({
      account: { id: "kind1", name: "Mia Muster", role: "schueler", classCode: "", selfManaged: true } as never,
    });
    seite();
    await waitFor(() => screen.getByText("Hallo Mia!"));
    fireEvent.click(screen.getByRole("button", { name: /Konto/ }));
    fireEvent.click(await screen.findByRole("button", { name: /Meine Statistik/ }));
    expect(screen.getByRole("heading", { name: "Meine Statistik" })).toBeInTheDocument();
  });

  it("führen hin und wieder zurück", async () => {
    seite();
    await waitFor(() => screen.getByText("Willkommen bei Plus!"));
    fireEvent.click(screen.getByRole("button", { name: /Meine Sammlung/ }));
    expect(screen.getByRole("heading", { name: "Meine Sammlung" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Zurück" }));
    expect(screen.getByText("Willkommen bei Plus!")).toBeInTheDocument();
  });

  it("★ hat immer höchstens eine Live-Region - auf jeder Tür", async () => {
    const { container } = seite();
    await waitFor(() => screen.getByText("Willkommen bei Plus!"));
    for (const tuer of ["Spiele", "Meine Sammlung"]) {
      fireEvent.click(screen.getByRole("button", { name: new RegExp(tuer) }));
      const regionen = container.querySelectorAll('[role="status"], [aria-live]');
      expect(regionen.length, tuer).toBeLessThanOrEqual(1);
      fireEvent.click(screen.getByRole("button", { name: "Zurück" }));
    }
  });

  it("★ auch in einem Spiel bleibt es bei einer", async () => {
    // Die Seite zeigte ihre Meldezeile weiter, während ein Spiel seine eigene
    // mitbrachte - zwei Blitzmeldungen auf einer Seite.
    const { container } = seite();
    await waitFor(() => screen.getByText("Willkommen bei Plus!"));
    fireEvent.click(screen.getByRole("button", { name: /Spiele/ }));
    for (const spiel of [
      "Zielzahl", "Heiß und kalt", "Turmbau", "Paare finden",
      "Schatzgitter", "Zahlenstrahl horchen", "Zug um Zug", "Die Staffel der Klasse",
    ]) {
      fireEvent.click(screen.getByRole("button", { name: new RegExp(spiel) }));
      expect(container.querySelectorAll('[role="status"], [aria-live]').length, spiel).toBe(1);
      fireEvent.click(screen.getByRole("button", { name: "Anderes Spiel" }));
    }
  });

  it("★ und in einer Übung auch", async () => {
    const { container } = seite();
    await waitFor(() => screen.getByText("Willkommen bei Plus!"));
    fireEvent.click(screen.getByRole("button", { name: /Ich wähle/ }));
    fireEvent.click(screen.getByRole("button", { name: /1\. Schulstufe/ }));
    fireEvent.click(screen.getByRole("button", { name: "Tauschaufgabe" }));
    expect(container.querySelectorAll('[role="status"], [aria-live]').length).toBe(1);
  });
});

describe("Die Übung", () => {
  it("lässt sich wählen und beenden", async () => {
    seite();
    await waitFor(() => screen.getByText("Willkommen bei Plus!"));
    fireEvent.click(screen.getByRole("button", { name: /Ich wähle/ }));
    fireEvent.click(screen.getByRole("button", { name: /1\. Schulstufe/ }));
    fireEvent.click(screen.getByRole("button", { name: "Tauschaufgabe" }));
    expect(screen.getByText("Aufgabe 1 von 8")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Übung beenden" }));
    expect(screen.getByText(/Schulstufe - welche Übung\?/)).toBeInTheDocument();
  });

  it("merkt sich, was gerechnet wurde", async () => {
    seite();
    await waitFor(() => screen.getByText("Willkommen bei Plus!"));
    fireEvent.click(screen.getByRole("button", { name: /Ich wähle/ }));
    fireEvent.click(screen.getByRole("button", { name: /1\. Schulstufe/ }));
    fireEvent.click(screen.getByRole("button", { name: "Tauschaufgabe" }));
    fireEvent.change(screen.getByLabelText("Deine Antwort"), { target: { value: "99999" } });
    fireEvent.click(screen.getByRole("button", { name: "Prüfen" }));
    await waitFor(() => {
      const roh = localStorage.getItem("plus:stand:anonym");
      expect(roh, "nichts gespeichert").toBeTruthy();
      expect(JSON.parse(roh!).gerechnet).toBe(1);
    }, { timeout: 4000 });
  });
});

describe("Die Einstellungen", () => {
  it("lassen die Rechnungen ausschreiben", async () => {
    seite();
    await waitFor(() => screen.getByText("Willkommen bei Plus!"));
    const zahnrad = screen.getByRole("button", { name: /Einstellungen/ });
    fireEvent.click(zahnrad);
    expect(screen.getByLabelText(/Rechnungen ausschreiben/)).toBeInTheDocument();
  });
});

describe("Die Kopfzeile und die Breite (Johannes, 17.10.2026)", () => {
  it("ein Strich trennt Sensorik vom Plus-Zeichen, der Titel steht mittig im übrigen Platz - die Seite ist so breit wie Tastenflow", async () => {
    seite();
    await waitFor(() => screen.getByText("Willkommen bei Plus!"));
    const titel = screen.getByRole("heading", { level: 1 });
    const mitte = titel.parentElement as HTMLElement;
    expect(mitte.className).toMatch(/justify-center/);
    // Der Strich steht direkt vor der Mitte - stumm für Sprachausgabe und Braillezeile.
    const strich = mitte.previousElementSibling as HTMLElement;
    expect(strich.hasAttribute("data-trennstrich")).toBe(true);
    expect(strich).toHaveAttribute("aria-hidden", "true");
    expect(titel.closest(".max-w-6xl")).not.toBeNull();
  });
});

describe("Mein Training geht immer weiter", () => {
  it("fragt nur beim ersten Mal nach der Stufe - danach geht es gleich los", async () => {
    seite();
    await waitFor(() => screen.getByText("Willkommen bei Plus!"));
    fireEvent.click(screen.getByRole("button", { name: /Los geht's/ }));
    fireEvent.click(screen.getByRole("button", { name: /3\. Schulstufe/ }));
    expect(screen.getByText("Aufgabe 1 von 8")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Übung beenden" }));

    // Zurück auf dem Start: die Karte nennt Stufe und Etappe.
    await waitFor(() => screen.getByText("Willkommen bei Plus!"));
    expect(screen.getByText(/Mein Training · 3\. Schulstufe/)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /^Etappe \d+: / })).toBeInTheDocument();
    expect(screen.getByText("0 von 21 Etappen geschafft.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Weiterrechnen/ }));
    expect(screen.queryByText(/welche Schulstufe/)).toBeNull();
    expect(screen.getByText("Aufgabe 1 von 8")).toBeInTheDocument();
  });
});
