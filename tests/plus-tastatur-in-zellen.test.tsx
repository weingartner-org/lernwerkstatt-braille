/**
 * Wächter: Mit Braillezeile Zahlen auf der Tastatur tippen - die Ausgabe bleibt in der Braille-Schrift
 * (Johannes, 19.10.2026: „wer mit der Braillezeile arbeitet, muss nicht Braille eingeben … bei der
 * Ausgabe wäre wichtig, dass wenn 6-Punkte eingestellt ist, auch die Ausgabe auf 6 Punkte ist").
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { PlusEingabe, type Eingabeart } from "../src/components/plus/PlusEingabe";
import { useEinstellungen } from "../src/lib/plus/einstellungen";

function Feld({ art, vorlage = "" }: { art: Eingabeart; vorlage?: string }) {
  const [wert, setWert] = useState("");
  return (
    <>
      <PlusEingabe wert={wert} onWert={setWert} art={art} onArt={() => {}} onPruefen={() => {}} vorlage={vorlage} marke={vorlage.length} neuBei={vorlage} />
      <output data-testid="wert">{wert}</output>
    </>
  );
}

const tippe = (feld: HTMLElement, text: string) => {
  for (const c of text) fireEvent.keyDown(feld, { key: c, code: /\d/.test(c) ? `Digit${c}` : "KeyX" });
};

beforeEach(() => useEinstellungen.setState({ eingabe: "tastatur" }));
afterEach(cleanup);

describe("Zahlen tippen, Zellen sehen", () => {
  it("★★★ 6-Punkt: aus 48 werden Zahlzeichen + zwei Zellen, das Zahlzeichen nur einmal - gelesen wird 48", () => {
    render(<Feld art="marburger" />);
    const feld = screen.getByLabelText("Deine Antwort") as HTMLTextAreaElement;
    tippe(feld, "48");
    expect(feld.value).toBe("⠼⠙⠓");
    expect(screen.getByTestId("wert")).toHaveTextContent("48");
  });

  it("★★ 8-Punkt: Computerbraille, Zeichen für Zeichen", () => {
    render(<Feld art="computer" />);
    const feld = screen.getByLabelText("Deine Antwort") as HTMLTextAreaElement;
    tippe(feld, "48");
    expect(feld.value).toBe("⠹⠳");
    expect(screen.getByTestId("wert")).toHaveTextContent("48");
  });

  it("★★ die Rücktaste löscht eine Zelle, das Leerzeichen schreibt die leere Zelle", () => {
    render(<Feld art="marburger" />);
    const feld = screen.getByLabelText("Deine Antwort") as HTMLTextAreaElement;
    tippe(feld, "12");
    fireEvent.keyDown(feld, { key: "Backspace", code: "Backspace" });
    expect(feld.value).toBe("⠼⠁");
    fireEvent.keyDown(feld, { key: " ", code: "Space" });
    expect(feld.value).toBe("⠼⠁⠀");
  });

  it("★★★ mit der Rechnung im Feld landen getippte Zahlen in der Lücke", () => {
    render(<Feld art="marburger" vorlage="6 +[] =10" />);
    const feld = screen.getByLabelText("Deine Antwort") as HTMLTextAreaElement;
    feld.setSelectionRange(5, 5);
    const vorher = feld.value;
    tippe(feld, "4");
    expect(feld.value).not.toBe(vorher);
    expect(feld.value).toContain("⠙");
  });

  it("Gegenprobe: mit „Braille greifen“ schreibt eine Zifferntaste nichts", () => {
    useEinstellungen.setState({ eingabe: "braille" });
    render(<Feld art="marburger" />);
    const feld = screen.getByLabelText("Deine Antwort") as HTMLTextAreaElement;
    tippe(feld, "48");
    expect(feld.value).toBe("");
  });
});
