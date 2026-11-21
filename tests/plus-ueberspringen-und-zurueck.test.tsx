/**
 * ★★ WÄCHTER (Johannes, 17.10.2026): „es braucht einen kleinen Schalter
 * Aufgabe überspringen, und wenn zweimal Umschalt gedrückt wird, muss die
 * Rechnung neu im Eingabefeld zurückgestellt werden, nicht nur neu vorgelesen".
 *
 *  (a) Umschalt zweimal stellt die Rechnung zurück ins Feld (seit 18.10.2026 der einzige Weg - Alt + Z sagt jetzt, wo man ist).
 *  (b) „Aufgabe überspringen" geht weiter, ohne zu werten: die Aufgabe zählt
 *      weder richtig noch falsch, die Runde wird über die übrigen gerechnet.
 *  (c) Ein Lauf ohne gewertete Aufgabe ändert den Stand des Coachs nicht -
 *      sonst setzte er die Serie guter Läufe zurück, gegen das Kind.
 */
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PlusUebung } from "../src/components/plus/PlusUebung";
import { erzeugeLauf } from "../src/lib/plus/generator";
import { vorlageInZellen } from "../src/components/plus/PlusEingabe";
import { eingabezeile } from "../src/lib/plus/zeile";
import { neuerStand, nachLauf } from "../src/lib/plus/coach";

const lauf = (paketId: string) => erzeugeLauf(paketId, { anzahl: 8, saat: 4 });
const feld = () => screen.getByLabelText("Deine Antwort") as HTMLTextAreaElement;
const zweimalUmschalt = () => {
  fireEvent.keyDown(feld(), { key: "Shift", code: "ShiftLeft" });
  fireEvent.keyDown(feld(), { key: "Shift", code: "ShiftLeft" });
};

describe("(a) Umschalt zweimal stellt die Rechnung zurück", () => {
  it("die gelöschte Rechnung steht wieder im Feld - und die Aufgabe wird gesagt", () => {
    const ansagen = vi.fn();
    // Die Rechnung steht nur mit Braillezeile im Feld (Johannes, 19.10.2026).
    render(<PlusUebung paketId="1-08" onZurueck={() => {}} saat={4} ansagen={ansagen} art="computer" />);
    const z = eingabezeile(lauf("1-08")[0])!;
    const vorlage = vorlageInZellen(z.vorlage, z.marke, "computer", { umbrechen: true, erwartet: lauf("1-08")[0].loesung.length })!.zellen;
    expect(feld().value).toBe(vorlage);
    fireEvent.change(feld(), { target: { value: "" } });
    expect(feld().value).toBe("");
    ansagen.mockClear();
    zweimalUmschalt();
    expect(feld().value).toBe(vorlage);
    expect(ansagen).toHaveBeenCalled();
  });

  it("auch eine verschriebene Rechnung kommt zurück, wie sie kam", () => {
    render(<PlusUebung paketId="1-08" onZurueck={() => {}} saat={4} art="computer" />);
    const vorlage = feld().value;
    fireEvent.change(feld(), { target: { value: "7 -" + vorlage } });
    zweimalUmschalt();
    expect(feld().value).toBe(vorlage);
  });

  it("der Knopf Aufgabe noch einmal ansagen tut dasselbe", () => {
    render(<PlusUebung paketId="1-08" onZurueck={() => {}} saat={4} vorlesen />);
    const vorlage = feld().value;
    fireEvent.change(feld(), { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: /Aufgabe noch einmal ansagen/ }));
    expect(feld().value).toBe(vorlage);
  });
});

describe("(b) Aufgabe überspringen", () => {
  it("steht als Schalter da, ist nicht gesperrt und geht zur nächsten Aufgabe", () => {
    const onAntwort = vi.fn();
    render(<PlusUebung paketId="1-08" onZurueck={() => {}} saat={4} onAntwort={onAntwort} />);
    const knopf = screen.getByRole("button", { name: "Aufgabe überspringen" });
    expect(knopf).toBeEnabled();
    fireEvent.click(knopf);
    expect(screen.getByText("Aufgabe 2 von 8")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Übersprungen.");
    expect(onAntwort).not.toHaveBeenCalled();
    // Der Fokus steht in der neuen Aufgabe.
    expect(document.activeElement).toBe(feld());
  });

  it("die Runde rechnet über die gewerteten Aufgaben", () => {
    const onFertig = vi.fn();
    const aufgaben = lauf("1-08");
    render(<PlusUebung paketId="1-08" onZurueck={() => {}} saat={4} onFertig={onFertig} />);
    fireEvent.click(screen.getByRole("button", { name: "Aufgabe überspringen" }));
    for (let i = 1; i < aufgaben.length; i++) {
      fireEvent.change(feld(), { target: { value: aufgaben[i].loesung } });
      fireEvent.click(screen.getByRole("button", { name: "Prüfen" }));
    }
    expect(onFertig).toHaveBeenCalledWith(7, 7);
    expect(screen.getByText(/7 von 7 richtig\. Eine Aufgabe übersprungen\./)).toBeInTheDocument();
  });

  it("nach einem Fehlversuch bleibt die Aufgabe gewertet - überspringen nimmt nichts zurück und fügt nichts hinzu", () => {
    const onFertig = vi.fn();
    const aufgaben = lauf("1-08");
    render(<PlusUebung paketId="1-08" onZurueck={() => {}} saat={4} onFertig={onFertig} />);
    fireEvent.change(feld(), { target: { value: "99999" } });
    fireEvent.click(screen.getByRole("button", { name: "Prüfen" }));
    fireEvent.click(screen.getByRole("button", { name: "Aufgabe überspringen" }));
    for (let i = 1; i < aufgaben.length; i++) {
      fireEvent.change(feld(), { target: { value: aufgaben[i].loesung } });
      fireEvent.click(screen.getByRole("button", { name: "Prüfen" }));
    }
    expect(onFertig).toHaveBeenCalledWith(7, 8);
  });

  it("nach der letzten Aufgabe kommt der Abschluss", () => {
    render(<PlusUebung paketId="1-08" onZurueck={() => {}} saat={4} />);
    for (let i = 0; i < 8; i++) fireEvent.click(screen.getByRole("button", { name: "Aufgabe überspringen" }));
    expect(screen.getByRole("heading", { name: "Geschafft" })).toBeInTheDocument();
  });
});

describe("(c) Ein Lauf ohne gewertete Aufgabe zählt nicht gegen das Kind", () => {
  it("nachLauf mit 0 von 0 lässt den Stand, wie er war", () => {
    const vorher = nachLauf(neuerStand(100), "1-08", 8, 8, 100);
    expect(vorher.pakete["1-08"].guteLaeufe).toBe(1);
    const nachher = nachLauf(vorher, "1-08", 0, 0, 101);
    expect(nachher).toBe(vorher);
  });
});
