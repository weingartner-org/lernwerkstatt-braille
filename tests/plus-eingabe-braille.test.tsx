/**
 * Wächter für das Eingabefeld von Plus.
 *
 * Die Frage, die hier beantwortet wird: Kommt das, was ein Kind greift, als
 * Rechenzeile an - und kann es dabei jederzeit die Eingabeart wechseln, ohne
 * dass ihm etwas unbemerkt verloren geht?
 */
import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { usePlusTasten } from "../src/components/plus/usePlusTasten";
import { useEinstellungen } from "../src/lib/plus/einstellungen";
import { EINGABEART_NAME, PlusEingabe, naechsteArt, uebersetze, type Eingabeart } from "../src/components/plus/PlusEingabe";

// Diese Wächter prüfen das Greifen: Seit 19.10.2026 ist „Wie du schreibst" ein eigener Schalter (Standard: Tastatur).
beforeEach(() => { useEinstellungen.setState({ eingabe: "braille" }); });
afterEach(() => { useEinstellungen.setState({ eingabe: "tastatur" }); });

/** Ein Griff: alle Tasten nieder, dann alle hoch - so schreibt die Maschine. */
function griff(feld: HTMLElement, ...tasten: string[]) {
  for (const code of tasten) fireEvent.keyDown(feld, { code });
  for (const code of tasten) fireEvent.keyUp(feld, { code });
}

const F = "KeyF", D = "KeyD", S = "KeyS", J = "KeyJ", K = "KeyK", L = "KeyL", A = "KeyA", OE = "Semicolon";

function Pruefstand({ start = "normal" as Eingabeart, onPruefen = () => {}, ansagen = () => {} }) {
  const [wert, setWert] = useState("");
  // Alt + B wirkt seit 12.10.2026 seitenweit über den Store (usePlusTasten).
  const art = useEinstellungen((s) => s.eingabeart);
  const setArt = useEinstellungen((s) => s.setEingabeart);
  useState(() => { useEinstellungen.setState({ eingabeart: start }); });
  usePlusTasten();
  return (
    <>
      <PlusEingabe wert={wert} onWert={setWert} art={art} onArt={setArt} onPruefen={onPruefen} ansagen={ansagen} />
      <output data-testid="wert">{wert}</output>
    </>
  );
}

describe("Die Eingabeart wechselt mit Alt + B", () => {
  it("geht der Reihe nach und kommt wieder am Anfang an", () => {
    expect(naechsteArt("normal")).toBe("computer");
    expect(naechsteArt("computer")).toBe("marburger");
    expect(naechsteArt("marburger")).toBe("normal");
  });

  it("sagt die neue Art an - sonst merkt es niemand", () => {
    const ansagen = vi.fn();
    render(<Pruefstand ansagen={ansagen} />);
    fireEvent.keyDown(screen.getByLabelText("Deine Antwort"), { code: "KeyB", altKey: true });
    expect(ansagen).toHaveBeenCalledWith(expect.stringContaining(EINGABEART_NAME.computer));
  });

  it("leert das Feld beim Wechsel und sagt auch das", () => {
    // Zellen und Ziffern lassen sich nicht ineinander überführen. Ein Feld,
    // das beim Wechsel heimlich etwas behält, wäre schlimmer als ein leeres.
    const ansagen = vi.fn();
    render(<Pruefstand ansagen={ansagen} />);
    const feld = screen.getByLabelText("Deine Antwort");
    fireEvent.change(feld, { target: { value: "48" } });
    expect(screen.getByTestId("wert")).toHaveTextContent("48");
    fireEvent.keyDown(feld, { code: "KeyB", altKey: true });
    expect(screen.getByTestId("wert")).toBeEmptyDOMElement();
    expect(ansagen).toHaveBeenCalledWith(expect.stringContaining("leer"));
  });
});

describe("Computerbraille", () => {
  it("schreibt 48 - Punkt für Punkt nachgerechnet", () => {
    // 4 = Punkte 1-4-5-6 (f j k l), 8 = Punkte 1-2-5-6 (f d k l)
    render(<Pruefstand start="computer" />);
    const feld = screen.getByLabelText("Deine Antwort");
    griff(feld, F, J, K, L);
    griff(feld, F, D, K, L);
    expect(screen.getByTestId("wert")).toHaveTextContent("48");
  });

  it("zeigt im Feld die Zellen und darunter, was Plus daraus liest", () => {
    render(<Pruefstand start="computer" />);
    const feld = screen.getByLabelText("Deine Antwort") as HTMLInputElement;
    griff(feld, F, J, K, L);
    expect(feld.value).toBe("⠹");              // die Zelle, nicht die Ziffer
    expect(screen.getByText(/So lese ich das/)).toHaveTextContent("4");
  });

  it("kennt Punkt 7 und 8 - die gibt es nur hier", () => {
    render(<Pruefstand start="computer" />);
    const feld = screen.getByLabelText("Deine Antwort");
    griff(feld, F, A);                          // 1-7 = grosses A
    expect(screen.getByTestId("wert")).toHaveTextContent("A");
    griff(feld, S, J, K, OE);                   // 3-4-5-8 = ä
    expect(screen.getByTestId("wert")).toHaveTextContent("Aä");
  });
});

describe("Marburger Mathematikschrift", () => {
  it("braucht das Zahlzeichen - und schreibt es nicht mit", () => {
    render(<Pruefstand start="marburger" />);
    const feld = screen.getByLabelText("Deine Antwort");
    griff(feld, S, J, K, L);                    // 3-4-5-6 = Zahlzeichen
    expect(screen.getByTestId("wert")).toBeEmptyDOMElement();
    griff(feld, F, J, K);                       // 1-4-5 = Ziffer 4
    griff(feld, F, D, K);                       // 1-2-5 = Ziffer 8
    expect(screen.getByTestId("wert")).toHaveTextContent("48");
  });

  it("liest ohne Zahlzeichen Buchstaben - genau wie das Regelwerk es sagt", () => {
    render(<Pruefstand start="marburger" />);
    const feld = screen.getByLabelText("Deine Antwort");
    griff(feld, F, J, K);                       // 1-4-5 ohne Zahlzeichen = d
    expect(screen.getByTestId("wert")).toHaveTextContent("d");
  });

  it("kennt Punkt 7 nicht - die 6-Punkt-Schrift hat ihn nicht", () => {
    render(<Pruefstand start="marburger" />);
    const feld = screen.getByLabelText("Deine Antwort") as HTMLInputElement;
    griff(feld, F, A);                          // Punkt 7 zählt nicht mit
    expect(feld.value).toBe("⠁");
  });

  it("zeigt den Hinweis, wenn etwas regelwidrig geschrieben ist", () => {
    render(<Pruefstand start="marburger" />);
    const feld = screen.getByLabelText("Deine Antwort");
    griff(feld, F);                             // a
    griff(feld, F, D, K, L);                    // 1-2-5-6 = Bruchstrich
    griff(feld, D, S);                          // 2-3 = gesenkte 2 ohne Zahlzeichen
    expect(screen.getByText(/Zahlzeichen/)).toBeInTheDocument();
  });
});

describe("Die Tasten, die kein Punkt sind", () => {
  it("löscht mit der Rücktaste eine Zelle", () => {
    render(<Pruefstand start="computer" />);
    const feld = screen.getByLabelText("Deine Antwort") as HTMLInputElement;
    griff(feld, F, J, K, L);
    griff(feld, F, D, K, L);
    fireEvent.keyDown(feld, { code: "Backspace" });
    expect(screen.getByTestId("wert")).toHaveTextContent("4");
  });

  it("sagt Bescheid, wenn im leeren Feld gelöscht wird", () => {
    const ansagen = vi.fn();
    render(<Pruefstand start="computer" ansagen={ansagen} />);
    fireEvent.keyDown(screen.getByLabelText("Deine Antwort"), { code: "Backspace" });
    expect(ansagen).toHaveBeenCalledWith("Das Feld ist leer.");
  });

  it("prüft mit der Eingabetaste - in jeder Eingabeart", () => {
    for (const start of ["normal", "computer", "marburger"] as Eingabeart[]) {
      const onPruefen = vi.fn();
      const { unmount } = render(<Pruefstand start={start} onPruefen={onPruefen} />);
      const feld = screen.getByLabelText("Deine Antwort");
      fireEvent.keyDown(feld, start === "normal" ? { key: "Enter" } : { code: "Enter" });
      expect(onPruefen, start).toHaveBeenCalled();
      unmount();
    }
  });
});

describe("Die Übersetzung steht auch allein zur Verfügung", () => {
  it.each([
    ["⠼⠙⠓⠀⠖⠼⠃⠛⠀⠶", "marburger", "48 +27 ="],
    ["⠹⠳", "computer", "48"],
    // Dieselben zwei Zellen heissen in den beiden Schriften Verschiedenes:
    // in Computerbraille haben die Ziffern eigene Muster.
    ["⠙⠓", "computer", "dh"],
  ] as [string, Eingabeart, string][])("%s in %s ist %s", (zellen, art, text) => {
    expect(uebersetze(zellen, art).text).toBe(text);
  });
});
