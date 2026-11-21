/**
 * Wächter: Das Feld trägt die Rechnung - und die Schreibmarke sitzt in der Lücke.
 *
 * Johannes, 25.09.2026: „Rechnungen, bei denen etwas auszufüllen ist, sollen
 * gleich in der Eingabezeile stehen, und der Cursor soll im Eingabefeld
 * stehen, z. B. `6 +[] =10`." Und beim schriftlichen Rechnen „muss es mit der
 * Entertaste mehrzeilig werden".
 */
import { usePlusTasten } from "../src/components/plus/usePlusTasten";
import { useEinstellungen } from "../src/lib/plus/einstellungen";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PlusEingabe, uebersetze, vorlageInZellen, type Eingabeart } from "../src/components/plus/PlusEingabe";
import { PlusUebung } from "../src/components/plus/PlusUebung";
import { erzeugeLauf } from "../src/lib/plus/generator";
import { eingabezeile, eingabezeileBraille } from "../src/lib/plus/zeile";

// Diese Wächter prüfen das Greifen: Seit 19.10.2026 ist „Wie du schreibst" ein eigener Schalter (Standard: Tastatur).
beforeEach(() => { useEinstellungen.setState({ eingabe: "braille" }); });
afterEach(() => { useEinstellungen.setState({ eingabe: "tastatur" }); });

/** Der erste Lauf eines Pakets, dessen erste Aufgabe die gesuchte Form hat. */
function saatMit(paketId: string, passt: (a: ReturnType<typeof erzeugeLauf>[number]) => boolean): number {
  const saat = [...Array(300).keys()].find((s) => passt(erzeugeLauf(paketId, { anzahl: 8, saat: s })[0]));
  if (saat === undefined) throw new Error(`Kein Lauf in ${paketId}`);
  return saat;
}

describe("Die Lücke", () => {
  const saat = saatMit("1-04", (a) => a.angabe.includes("[]") && !a.angabe.includes("\n"));
  const erste = erzeugeLauf("1-04", { anzahl: 8, saat })[0];

  it("★ ohne Braillezeile steht die Zeile oben und das Feld ist leer (Johannes, 19.10.2026)", () => {
    render(<PlusUebung paketId="1-04" onZurueck={() => {}} saat={saat} />);
    const feld = screen.getByLabelText("Deine Antwort") as HTMLTextAreaElement;
    expect(feld.value).toBe("");
    expect(document.getElementById("plus-aufgabe")).toHaveTextContent(erste.angabe);
  });

  it("mit Braillezeile steht die Zeile im Feld, die Schreibmarke zwischen den Klammern", async () => {
    render(<PlusUebung paketId="1-04" onZurueck={() => {}} saat={saat} art="computer" />);
    const feld = screen.getByLabelText("Deine Antwort") as HTMLTextAreaElement;
    const v = vorlageInZellen(eingabezeile(erste)!.vorlage, eingabezeile(erste)!.marke, "computer", { umbrechen: true, erwartet: erste.loesung.length })!;
    expect(feld.value).toBe(v.zellen);
    expect(uebersetze(feld.value, "computer").text.replace(/\n/g, " ")).toBe(eingabezeile(erste)!.vorlage);
    expect(document.activeElement).toBe(feld);
    await waitFor(() => expect(feld.selectionStart).toBe(v.marke));
    expect(feld.selectionEnd).toBe(v.marke);
  });

  it("Eingabetaste auf der unberührten Zeile: noch nichts - kein Versuch", () => {
    const ansagen = vi.fn();
    const onAntwort = vi.fn();
    render(<PlusUebung paketId="1-04" onZurueck={() => {}} saat={saat} ansagen={ansagen} onAntwort={onAntwort} />);
    fireEvent.keyDown(screen.getByLabelText("Deine Antwort"), { key: "Enter" });
    expect(ansagen).toHaveBeenCalledWith("Da steht noch nichts.");
    expect(onAntwort).not.toHaveBeenCalled();
  });

  it("die gefüllte Lücke ist die Antwort - und dem Coach geht nur sie zu", () => {
    const onAntwort = vi.fn();
    render(<PlusUebung paketId="1-04" onZurueck={() => {}} saat={saat} onAntwort={onAntwort} />);
    const feld = screen.getByLabelText("Deine Antwort");
    fireEvent.change(feld, { target: { value: erste.angabe.replace("[]", `[${erste.loesung}]`) } });
    fireEvent.keyDown(feld, { key: "Enter" });
    expect(screen.getByRole("status")).toHaveTextContent("Richtig.");
    expect(onAntwort).toHaveBeenCalledWith(expect.objectContaining({ richtig: true, eingabe: erste.loesung }));
  });

  it("die nächste Aufgabe schreibt ihre Zeile neu hin", () => {
    const zweite = erzeugeLauf("1-04", { anzahl: 8, saat })[1];
    render(<PlusUebung paketId="1-04" onZurueck={() => {}} saat={saat} art="computer" />);
    const feld = screen.getByLabelText("Deine Antwort") as HTMLTextAreaElement;
    fireEvent.change(feld, { target: { value: erste.loesung } });
    // Mit Braillezeile prüft Alt + P (die Eingabetaste gehört dem Griff).
    fireEvent.keyDown(feld, { key: "π", code: "KeyP", altKey: true });
    fireEvent.keyDown(feld, { key: "π", code: "KeyP", altKey: true });   // Weiter
    expect(screen.getByText("Aufgabe 2 von 8")).toBeInTheDocument();
    const z2 = eingabezeileBraille(zweite)!;
    expect(feld.value).toBe(vorlageInZellen(z2.vorlage, z2.marke, "computer", { umbrechen: !z2.mehrzeilig, erwartet: zweite.loesung.length })!.zellen);
  });
});

describe("Schriftlich rechnen - die Eingabetaste macht eine neue Zeile", () => {
  const saat = saatMit("4-09", (a) => !!eingabezeile(a)?.mehrzeilig);
  const erste = erzeugeLauf("4-09", { anzahl: 8, saat })[0];

  it("die Rechnung steht da, die Eingabetaste prüft NICHT", () => {
    const ansagen = vi.fn();
    render(<PlusUebung paketId="4-09" onZurueck={() => {}} saat={saat} ansagen={ansagen} art="computer" />);
    const feld = screen.getByLabelText("Deine Antwort") as HTMLTextAreaElement;
    expect(uebersetze(feld.value, "computer").text).toBe(eingabezeile(erste)!.vorlage);
    expect(feld.rows).toBeGreaterThan(1);
    ansagen.mockClear();
    fireEvent.keyDown(feld, { key: "Enter" });
    expect(ansagen).not.toHaveBeenCalled();
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
    expect(screen.getByText(/Alt \+ P prüft/)).toBeInTheDocument();
  });

  it("Alt + P prüft - mit dem Rechenweg darunter und dem Ergebnis am Ende", () => {
    render(<PlusUebung paketId="4-09" onZurueck={() => {}} saat={saat} />);
    const feld = screen.getByLabelText("Deine Antwort");
    const zeilen = [erste.angabe, ...(erste.weg ?? []).map((s) => s.zeile), erste.angabe + erste.loesung];
    fireEvent.change(feld, { target: { value: zeilen.join("\n") } });
    fireEvent.keyDown(feld, { code: "KeyP", key: "π", altKey: true });
    expect(screen.getByRole("status")).toHaveTextContent("Richtig.");
  });

  it("Strg + Eingabetaste prüft auch", () => {
    render(<PlusUebung paketId="4-09" onZurueck={() => {}} saat={saat} />);
    const feld = screen.getByLabelText("Deine Antwort");
    fireEvent.change(feld, { target: { value: erste.angabe + erste.loesung } });
    fireEvent.keyDown(feld, { key: "Enter", ctrlKey: true });
    expect(screen.getByRole("status")).toHaveTextContent("Richtig.");
  });
});

describe("Die Rückmeldung sagt zuerst, was stimmt", () => {
  it("Rest vergessen: richtig gerechnet - der Rest fehlt noch", () => {
    const saat = saatMit("2-17", (a) => a.art === "ergebnis" && a.loesung.includes("Rest"));
    const erste = erzeugeLauf("2-17", { anzahl: 8, saat })[0];
    render(<PlusUebung paketId="2-17" onZurueck={() => {}} saat={saat} />);
    const feld = screen.getByLabelText("Deine Antwort");
    fireEvent.change(feld, { target: { value: erste.angabe + erste.loesung.split(" ")[0] } });
    fireEvent.keyDown(feld, { key: "Enter" });
    expect(screen.getByRole("status")).toHaveTextContent("Richtig gerechnet - der Rest fehlt noch.");
    fireEvent.change(feld, { target: { value: erste.angabe + erste.loesung.replace(/ \((\d+) Rest\)/, " R $1") } });
    fireEvent.keyDown(feld, { key: "Enter" });
    expect(screen.getByRole("status")).toHaveTextContent("Richtig.");
  });

  it("vorne verändert: kein „Noch nicht“, und nicht gezählt", () => {
    const saat = saatMit("1-04", (a) => a.angabe.startsWith("6 +[]"));
    const onAntwort = vi.fn();
    render(<PlusUebung paketId="1-04" onZurueck={() => {}} saat={saat} onAntwort={onAntwort} />);
    const feld = screen.getByLabelText("Deine Antwort");
    fireEvent.change(feld, { target: { value: "5 +[5] =10" } });
    fireEvent.keyDown(feld, { key: "Enter" });
    expect(screen.getByRole("status")).toHaveTextContent("Vorne hat sich die Rechnung verändert.");
    expect(screen.getByRole("status").textContent).not.toMatch(/Noch nicht/);
    expect(onAntwort).not.toHaveBeenCalled();
  });
});

describe("Computerbraille mit Vorlage", () => {
  function Pruefstand({ vorlage, marke }: { vorlage: string; marke: number }) {
    const [wert, setWert] = useState("");
    const [art, setArt] = useState<Eingabeart>("computer");
    return (
      <>
        <PlusEingabe wert={wert} onWert={setWert} art={art} onArt={setArt} onPruefen={() => {}}
          vorlage={vorlage} marke={marke} neuBei={vorlage} />
        <output data-testid="wert">{wert}</output>
      </>
    );
  }

  it("die Zeile steht in Zellen da, und ein Griff landet IN der Lücke", async () => {
    render(<Pruefstand vorlage="6 +[] =10" marke={4} />);
    const feld = screen.getByLabelText("Deine Antwort") as HTMLTextAreaElement;
    expect(screen.getByTestId("wert")).toHaveTextContent("6 +[] =10");
    await waitFor(() => expect(feld.selectionStart).toBe(4));
    // 4 = Punkte 1-4-5-6 (f j k l)
    for (const code of ["KeyF", "KeyJ", "KeyK", "KeyL"]) fireEvent.keyDown(feld, { code });
    for (const code of ["KeyF", "KeyJ", "KeyK", "KeyL"]) fireEvent.keyUp(feld, { code });
    expect(screen.getByTestId("wert")).toHaveTextContent("6 +[4] =10");
  });

  it("Alt + B zurück zu den Zahlen: die Rechnung steht wieder da", () => {
    useEinstellungen.setState({ eingabeart: "normal" });
    const ansagen = vi.fn();
    function Mit() {
      const [wert, setWert] = useState("");
      const art = useEinstellungen((s) => s.eingabeart);
      const setArt = useEinstellungen((s) => s.setEingabeart);
      usePlusTasten();
      return <PlusEingabe wert={wert} onWert={setWert} art={art} onArt={setArt} onPruefen={() => {}}
        vorlage="48 +27 =" neuBei="a" ansagen={ansagen} />;
    }
    render(<Mit />);
    const feld = screen.getByLabelText("Deine Antwort") as HTMLTextAreaElement;
    fireEvent.change(feld, { target: { value: "48 +27 =7" } });
    fireEvent.keyDown(feld, { code: "KeyB", altKey: true });
    expect(ansagen).toHaveBeenCalledWith("Computerbraille. Die Rechnung steht wieder da.");
    // Zeichen für Zeichen in Zellen - so viele Zellen wie Zeichen.
    expect(feld.value).toMatch(/^[⠀-⣿]+$/);
    expect(feld.value.length).toBe("48 +27 =".length);
  });

  // ★ Seit 18.10.2026 Umschalt zweimal statt Alt + Z (Johannes: Alt + Z heißt in allen
  //   Lern-Apps „wo bin ich"; „mach rückgängig").
  it("★ Umschalt zweimal holt die gelöschte Rechnung zurück - auch in Braille; Alt + Z nicht mehr", async () => {
    const ansagen = vi.fn();
    function Mit({ start }: { start: Eingabeart }) {
      const [wert, setWert] = useState("");
      const [art, setArt] = useState<Eingabeart>(start);
      return (
        <>
          <PlusEingabe wert={wert} onWert={setWert} art={art} onArt={setArt} onPruefen={() => {}}
            vorlage="6 +[] =10" marke={4} neuBei="a" ansagen={ansagen} />
          <output data-testid="wert">{wert}</output>
        </>
      );
    }
    const { unmount } = render(<Mit start="normal" />);
    const feld = screen.getByLabelText("Deine Antwort") as HTMLTextAreaElement;
    fireEvent.change(feld, { target: { value: "" } });
    fireEvent.keyDown(feld, { code: "KeyZ", key: "Ω", altKey: true });
    expect(feld.value).toBe("");
    fireEvent.keyDown(feld, { key: "Shift", code: "ShiftLeft" });
    fireEvent.keyDown(feld, { key: "Shift", code: "ShiftLeft" });
    expect(feld.value).toBe("6 +[] =10");
    expect(ansagen).toHaveBeenCalledWith("Die Rechnung steht wieder da.");
    await waitFor(() => expect(feld.selectionStart).toBe(4));
    unmount();

    render(<Mit start="computer" />);
    const zellen = screen.getByLabelText("Deine Antwort") as HTMLTextAreaElement;
    fireEvent.change(zellen, { target: { value: "" } });
    expect(screen.getByTestId("wert")).toBeEmptyDOMElement();
    fireEvent.keyDown(zellen, { key: "Shift", code: "ShiftLeft" });
    fireEvent.keyDown(zellen, { key: "Shift", code: "ShiftLeft" });
    expect(screen.getByTestId("wert")).toHaveTextContent("6 +[] =10");
  });
});
