import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SortierTabelle, type Spalte } from "@/components/statistik/SortierTabelle";
import { Balken, Bildrahmen, Kennzahl, Verlauf } from "@/components/statistik/Diagramme";

/**
 * Johannes: *„Ich möchte tabellen die ich sortieren kann"* und *„ich möchte
 * diagramme zur veranschaulichung"*.
 *
 * Geprüft wird hier, was man am Bildschirm nicht sieht und was deshalb still
 * kaputtgeht: dass nach ZAHLEN sortiert wird und nicht nach Text, dass die
 * Sortierrichtung auch ANGESAGT wird (`aria-sort`), und dass zu jedem Bild
 * eine echte Tabelle gehört. Ein Diagramm ohne sie wäre für die Menschen, für
 * die diese Plattform gebaut ist, eine leere Fläche.
 */

type Zeile = { id: string; name: string; kinder: number; minuten: number };

const ZEILEN: Zeile[] = [
  { id: "a", name: "Ötztaler", kinder: 9, minuten: 1284 },
  { id: "b", name: "Bauer", kinder: 12, minuten: 90 },
  { id: "c", name: "Zach", kinder: 2, minuten: 842 },
];

const SPALTEN: Spalte<Zeile>[] = [
  { schluessel: "name", titel: "Name", wert: (z) => z.name },
  { schluessel: "kinder", titel: "Kinder", wert: (z) => z.kinder, zahl: true },
  { schluessel: "minuten", titel: "Übezeit", wert: (z) => z.minuten, zahl: true },
];

function namen(): string[] {
  const zeilen = screen.getAllByRole("row").slice(1); // Kopfzeile weg
  return zeilen.map((r) => within(r).getAllByRole("cell")[0].textContent ?? "");
}

describe("Sortierbare Tabelle", () => {
  it("sortiert beim Öffnen nach der vorgegebenen Spalte, grösster Wert oben", () => {
    render(
      <SortierTabelle
        beschriftung="Testtabelle"
        spalten={SPALTEN}
        zeilen={ZEILEN}
        schluesselVon={(z) => z.id}
        standardSpalte="kinder"
      />,
    );
    expect(namen()).toEqual(["Bauer", "Ötztaler", "Zach"]);
  });

  it("sortiert Zahlen als ZAHLEN, nicht als Text", async () => {
    // ⚠️ Der klassische Fehler: als Text käme „1284" vor „842" und „90"
    // vor „842". Genau das prüft dieser Test.
    render(
      <SortierTabelle
        beschriftung="Testtabelle"
        spalten={SPALTEN}
        zeilen={ZEILEN}
        schluesselVon={(z) => z.id}
        standardSpalte="kinder"
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: /Übezeit/ }));
    expect(namen()).toEqual(["Ötztaler", "Zach", "Bauer"]); // 1284, 842, 90
  });

  it("dreht die Richtung beim zweiten Klick um", async () => {
    render(
      <SortierTabelle
        beschriftung="Testtabelle"
        spalten={SPALTEN}
        zeilen={ZEILEN}
        schluesselVon={(z) => z.id}
        standardSpalte="kinder"
      />,
    );
    const kopf = screen.getByRole("button", { name: /Kinder/ });
    await userEvent.click(kopf);
    expect(namen()).toEqual(["Zach", "Ötztaler", "Bauer"]);
  });

  it("sagt die Sortierung an - aria-sort steht an genau EINER Spalte", async () => {
    render(
      <SortierTabelle
        beschriftung="Testtabelle"
        spalten={SPALTEN}
        zeilen={ZEILEN}
        schluesselVon={(z) => z.id}
        standardSpalte="kinder"
      />,
    );
    const koepfe = screen.getAllByRole("columnheader");
    const mitSort = koepfe.filter((k) => k.getAttribute("aria-sort"));
    expect(mitSort).toHaveLength(1);
    expect(mitSort[0]).toHaveAttribute("aria-sort", "descending");

    await userEvent.click(screen.getByRole("button", { name: /Name/ }));
    const nachher = screen
      .getAllByRole("columnheader")
      .filter((k) => k.getAttribute("aria-sort"));
    expect(nachher).toHaveLength(1);
    expect(nachher[0].textContent).toContain("Name");
  });

  it("sortiert Umlaute nach deutscher Ordnung (Ö zwischen O und P, nicht ans Ende)", async () => {
    render(
      <SortierTabelle
        beschriftung="Testtabelle"
        spalten={SPALTEN}
        zeilen={ZEILEN}
        schluesselVon={(z) => z.id}
        standardSpalte="kinder"
      />,
    );
    const kopf = screen.getByRole("button", { name: /Name/ });
    await userEvent.click(kopf); // absteigend: Z, Ö, B
    await userEvent.click(kopf); // aufsteigend: B, Ö, Z
    expect(namen()).toEqual(["Bauer", "Ötztaler", "Zach"]);
  });

  it("jede Tabelle hat eine Beschriftung für die Sprachausgabe", () => {
    const { container } = render(
      <SortierTabelle
        beschriftung="Lehrkräfte mit Anmeldename"
        spalten={SPALTEN}
        zeilen={ZEILEN}
        schluesselVon={(z) => z.id}
        standardSpalte="kinder"
      />,
    );
    expect(container.querySelector("caption")?.textContent).toBe(
      "Lehrkräfte mit Anmeldename",
    );
  });

  it("sagt es, wenn nichts da ist - statt eine leere Tabelle zu zeigen", () => {
    render(
      <SortierTabelle
        beschriftung="Leer"
        spalten={SPALTEN}
        zeilen={[]}
        schluesselVon={(z) => z.id}
        standardSpalte="kinder"
        leerText="Es gibt noch keine Lehrkraft-Konten."
      />,
    );
    expect(screen.getByText("Es gibt noch keine Lehrkraft-Konten.")).toBeTruthy();
  });
});

describe("Diagramme", () => {
  it("zu jedem Bild gehört eine echte Tabelle und ein Satz in Worten", () => {
    const { container } = render(
      <Bildrahmen
        titel="Wiederkehr"
        aussage="378 Geräte waren einmal da."
        tabelle={
          <table>
            <caption>Geräte nach Besuchstagen</caption>
            <tbody>
              <tr>
                <td>1 Tag</td>
                <td>378</td>
              </tr>
            </tbody>
          </table>
        }
      >
        <Balken einheit="Geräte" werte={[{ label: "1 Tag", wert: 378 }]} />
      </Bildrahmen>,
    );
    // Der Satz in Worten steht sichtbar unter dem Bild.
    expect(container.querySelector("figcaption")?.textContent).toContain("378 Geräte");
    // Und dieselben Zahlen stehen als Tabelle da - `sr-only`, nicht `hidden`:
    // was `display:none` trägt, liest auch eine Sprachausgabe nicht.
    const tabelle = container.querySelector("table");
    expect(tabelle).toBeTruthy();
    expect(tabelle?.closest(".sr-only")).toBeTruthy();
    expect(container.querySelector('table[hidden]')).toBeNull();
  });

  it("das SVG des Verlaufs ist für die Sprachausgabe ausgeblendet", () => {
    const { container } = render(<Verlauf werte={[1, 5, 3, 8]} />);
    const svg = container.querySelector("svg");
    expect(svg).toBeTruthy();
    // Sonst liest eine Sprachausgabe eine Folge von Koordinaten vor.
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });

  it("der Verlauf sagt es, wenn ein einzelner Tag noch keine Kurve ergibt", () => {
    render(<Verlauf werte={[4]} />);
    expect(screen.getByText(/zu wenige Tage/)).toBeTruthy();
  });

  it("jede Kennzahl nennt ihre Herkunft", () => {
    // ★★★ Die wichtigste Regel der Seite: Dieselbe Frage hat je nach Quelle
    // eine andere Antwort. Eine Kachel ohne diese Zeile ist eine Zahl ohne
    // Bedeutung.
    render(<Kennzahl label="Verschiedene Menschen" wert={1284} herkunft="Prüfsummen" />);
    expect(screen.getByText("Prüfsummen")).toBeTruthy();
    /*
      ⚠️⚠️ Die Tausender-Trennung von `de-AT` ist ein GESCHÜTZTES LEERZEICHEN
      (U+00A0), kein Punkt: 1284 wird zu „1<nbsp>284". Das ist die CLDR-Norm
      für Österreich, und die ganze App macht es an 36 Stellen so - hier
      auszuscheren wäre schlimmer als die Überraschung.
      Wissenswert bleibt es trotzdem: Am 07.09.2026 hat genau dieses Zeichen im
      eine andere App der Plattform  eine Zahl zerrissen („39 000 galt als NULL"), weil sie
      irgendwo wieder EINGELESEN wurde. Hier wird nur angezeigt, nie geparst -
      wer das ändert, muss das Zeichen mitdenken.
    */
    expect(
      // Whitespace-unabhängig geprüft: testing-library normalisiert das
      // geschützte Leerzeichen, ein wörtlicher Vergleich schlüge deshalb fehl.
      screen.getByText((t) => t.replace(/\s/g, "") === "1284"),
    ).toBeTruthy();
  });
});
