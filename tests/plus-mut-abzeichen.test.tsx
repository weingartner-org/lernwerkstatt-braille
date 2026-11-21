/**
 * Wächter für die Mut-Abzeichen (16.10.2026): Durchgehalten, Hilfe genutzt,
 * Knobelei gelöst.
 *
 * ★ Hilfe holen ist ein Abzeichen, kein Makel. Wichtig ist deshalb auch, was
 * NICHT gezählt wird: keine Zahl der Fehler, nur „kam vor".
 */
import { act, fireEvent, render, renderHook, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { usePlusFortschritt } from "../src/components/plus/usePlusFortschritt";
import { PlusUebung } from "../src/components/plus/PlusUebung";
import { ABZEICHEN, abzeichen, leererZaehlstand, verdient } from "../src/lib/plus/abzeichen";
import { backendZuruecksetzen } from "../src/lib/plus/fortschritt";
import { erzeugeLauf } from "../src/lib/plus/generator";
import { PAKETE } from "../src/lib/plus/stoffplan";

const mit = (z: Partial<ReturnType<typeof leererZaehlstand>>) => verdient({ ...leererZaehlstand(), ...z });

beforeEach(() => {
  localStorage.clear();
  backendZuruecksetzen();
});

describe("Die drei Abzeichen", () => {
  it("gibt es, mit Bild und einfacher Bedingung", () => {
    const mut = ABZEICHEN.filter((a) => a.familie === "mut");
    expect(mut.map((a) => a.name)).toEqual(["Durchgehalten", "Hilfe genutzt", "Knobelei gelöst"]);
    for (const a of mut) {
      expect(a.geheim).toBeUndefined();
      expect(a.bedingung.length).toBeLessThan(45);
    }
  });

  it("★ kommen aus Besonderheiten, nicht aus einer Zahl von Fehlern", () => {
    expect(mit({})).not.toContain("plus-kletterer");
    expect(mit({ besondere: ["durchgehalten"] })).toContain("plus-kletterer");
    expect(mit({ besondere: ["hilfe"] })).toContain("plus-rettungsring");
    expect(mit({ raetsel: 1 })).toContain("plus-detektiv");
    expect(mit({ raetsel: 0 })).not.toContain("plus-detektiv");
  });

  it("★ sind für alle Altersstufen gleich - kein Lob, kein Kindername", () => {
    for (const id of ["plus-kletterer", "plus-rettungsring", "plus-detektiv"]) {
      const a = abzeichen(id)!;
      expect(`${a.name} ${a.bedingung}`).not.toMatch(/toll|super|klug|prima|bravo|brav|klein/i);
    }
  });
});

describe("In der Übung", () => {
  it("★ meldet „durchgehalten“, wenn nach einem Fehler richtig gelöst wird", () => {
    const art = vi.fn();
    render(<PlusUebung paketId="1-08" saat={4} onZurueck={() => {}} onBesonderes={art} />);
    const a = erzeugeLauf("1-08", { anzahl: 8, saat: 4 })[0];
    const feld = screen.getByLabelText("Deine Antwort");
    fireEvent.change(feld, { target: { value: "99999" } });
    fireEvent.click(screen.getByRole("button", { name: "Prüfen" }));
    expect(art).not.toHaveBeenCalled();
    fireEvent.change(feld, { target: { value: a.loesung } });
    fireEvent.click(screen.getByRole("button", { name: "Prüfen" }));
    expect(art).toHaveBeenCalledWith("durchgehalten");
    expect(art).not.toHaveBeenCalledWith("hilfe");
  });

  it("★ meldet nichts, wenn gleich beim ersten Mal richtig", () => {
    const art = vi.fn();
    render(<PlusUebung paketId="1-08" saat={4} onZurueck={() => {}} onBesonderes={art} />);
    const a = erzeugeLauf("1-08", { anzahl: 8, saat: 4 })[0];
    fireEvent.change(screen.getByLabelText("Deine Antwort"), { target: { value: a.loesung } });
    fireEvent.click(screen.getByRole("button", { name: "Prüfen" }));
    expect(art).not.toHaveBeenCalled();
  });

  it("meldet „hilfe“, wenn mit dem Rechenweg richtig gelöst wird", () => {
    const mitWeg = PAKETE.find((p) => erzeugeLauf(p.id, { anzahl: 8, saat: 4 })[0]?.weg?.length);
    if (!mitWeg) return; // Kein Paket mit Rechenweg: nichts zu prüfen.
    const art = vi.fn();
    render(<PlusUebung paketId={mitWeg.id} saat={4} onZurueck={() => {}} onBesonderes={art} />);
    fireEvent.click(screen.getByRole("button", { name: "Zeig mir den Rechenweg" }));
    const a = erzeugeLauf(mitWeg.id, { anzahl: 8, saat: 4 })[0];
    fireEvent.change(screen.getByLabelText("Deine Antwort"), { target: { value: a.loesung } });
    fireEvent.click(screen.getByRole("button", { name: "Prüfen" }));
    expect(art).toHaveBeenCalledWith("hilfe");
  });
});

describe("Im Fortschritt", () => {
  it("★ merkt die Besonderheit einmal, und das Abzeichen kommt am Ende der Runde", async () => {
    const { result } = renderHook(() => usePlusFortschritt());
    await act(async () => { await Promise.resolve(); });
    act(() => { result.current.merkeBesonderes("durchgehalten"); result.current.merkeBesonderes("durchgehalten"); });
    expect(result.current.fortschritt.besondere.filter((b) => b === "durchgehalten")).toHaveLength(1);
    expect(result.current.fortschritt.abzeichen).not.toContain("plus-kletterer");
    act(() => result.current.merkeLauf("1-08", 8, 8));
    expect(result.current.fortschritt.abzeichen).toContain("plus-kletterer");
    expect(result.current.neue).toContain("plus-kletterer");
  });

  it("★ „Knobelei gelöst“ kommt sofort mit dem gelösten Rätsel", async () => {
    const { result } = renderHook(() => usePlusFortschritt());
    await act(async () => { await Promise.resolve(); });
    act(() => result.current.merkeRaetsel("Angabe", false));
    expect(result.current.fortschritt.abzeichen).not.toContain("plus-detektiv");
    act(() => result.current.merkeRaetsel("Angabe", true));
    expect(result.current.fortschritt.abzeichen).toContain("plus-detektiv");
    expect(result.current.neue).toContain("plus-detektiv");
  });

  it("merkt sich den ersten und den letzten Lauf je Paket", async () => {
    const { result } = renderHook(() => usePlusFortschritt());
    await act(async () => { await Promise.resolve(); });
    act(() => result.current.merkeLauf("1-08", 3, 8));
    act(() => result.current.merkeLauf("1-08", 8, 8));
    const v = result.current.fortschritt.verlauf["1-08"];
    expect(v.erst.richtige).toBe(3);
    expect(v.jetzt.richtige).toBe(8);
  });
});
