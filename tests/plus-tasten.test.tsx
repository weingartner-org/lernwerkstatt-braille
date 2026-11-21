/**
 * Wächter für die seitenweiten Kürzel von Plus (`usePlusTasten`).
 *
 * ★ Erkannt wird die Taste (`code`), nicht das Zeichen: am Mac macht Alt aus
 * dem b ein „∫". Darum schicken die Tests `code` und `key` getrennt.
 */
import { fireEvent, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { usePlusTasten } from "../src/components/plus/usePlusTasten";
import { useEinstellungen } from "../src/lib/plus/einstellungen";

beforeEach(() => {
  localStorage.clear();
  useEinstellungen.setState({ eingabeart: "normal", zoomIndex: 0, zoom: 1 });
});

describe("Alt + B und Alt + 8 wechseln die Eingabeart", () => {
  it("Alt + B geht normal → computer → marburger → normal", () => {
    renderHook(() => usePlusTasten());
    const eingabeart = () => useEinstellungen.getState().eingabeart;

    fireEvent.keyDown(window, { altKey: true, code: "KeyB", key: "∫" });
    expect(eingabeart()).toBe("computer");
    fireEvent.keyDown(window, { altKey: true, code: "KeyB", key: "∫" });
    expect(eingabeart()).toBe("marburger");
    fireEvent.keyDown(window, { altKey: true, code: "KeyB", key: "∫" });
    expect(eingabeart()).toBe("normal");
  });

  // ★ 18.10.2026 (Johannes): Alt + 8 ist gestrichen - doppelt zu Alt + B, und in
  //   Tastenflow heißt Alt + 8 „Klang der Melodie vor".
  it("Alt + 8 wechselt NICHT mehr", () => {
    renderHook(() => usePlusTasten());
    fireEvent.keyDown(window, { altKey: true, code: "Digit8", key: "•" });
    expect(useEinstellungen.getState().eingabeart).toBe("normal");
  });

  it("Alt + B sagt nichts an - das macht das Eingabefeld", () => {
    const ansagen = vi.fn();
    renderHook(() => usePlusTasten(ansagen));
    fireEvent.keyDown(window, { altKey: true, code: "KeyB", key: "∫" });
    expect(ansagen).not.toHaveBeenCalled();
  });
});

describe("Alt + Plus, Alt + Minus, Alt + 0 ändern die Textgröße", () => {
  it("Alt + Minus auf der deutschen Tastatur (Taste Slash, Mac: Halbgeviertstrich)", () => {
    useEinstellungen.setState({ zoomIndex: 3, zoom: 2 });
    renderHook(() => usePlusTasten());
    fireEvent.keyDown(window, { altKey: true, code: "Slash", key: "-" });
    expect(useEinstellungen.getState().zoomIndex).toBe(2);
    fireEvent.keyDown(window, { altKey: true, code: "Slash", key: "–" });
    expect(useEinstellungen.getState().zoomIndex).toBe(1);
  });

  it("Alt + Plus erhöht die Stufe und sagt 125 Prozent an", () => {
    const ansagen = vi.fn();
    renderHook(() => usePlusTasten(ansagen));
    fireEvent.keyDown(window, { altKey: true, code: "Equal", key: "+", shiftKey: true });
    expect(useEinstellungen.getState().zoomIndex).toBe(1);
    expect(ansagen).toHaveBeenCalledWith("Textgröße 125 Prozent");
  });

  it("Alt + Minus senkt die Stufe, nie unter 0", () => {
    const ansagen = vi.fn();
    useEinstellungen.setState({ zoomIndex: 2, zoom: 1.5 });
    renderHook(() => usePlusTasten(ansagen));

    fireEvent.keyDown(window, { altKey: true, code: "Minus", key: "-" });
    expect(useEinstellungen.getState().zoomIndex).toBe(1);
    expect(ansagen).toHaveBeenLastCalledWith("Textgröße 125 Prozent");

    fireEvent.keyDown(window, { altKey: true, code: "Minus", key: "-" });
    fireEvent.keyDown(window, { altKey: true, code: "Minus", key: "-" });
    expect(useEinstellungen.getState().zoomIndex).toBe(0);
    expect(ansagen).toHaveBeenLastCalledWith("Textgröße 100 Prozent");
  });

  it("Alt + 0 setzt die Textgröße zurück", () => {
    const ansagen = vi.fn();
    useEinstellungen.setState({ zoomIndex: 4, zoom: 2.5 });
    renderHook(() => usePlusTasten(ansagen));
    fireEvent.keyDown(window, { altKey: true, code: "Digit0", key: "º" });
    expect(useEinstellungen.getState().zoomIndex).toBe(0);
    expect(ansagen).toHaveBeenCalledWith("Textgröße 100 Prozent");
  });

  it("Alt + Plus auf dem Ziffernblock zählt auch", () => {
    renderHook(() => usePlusTasten());
    fireEvent.keyDown(window, { altKey: true, code: "NumpadAdd", key: "+" });
    expect(useEinstellungen.getState().zoomIndex).toBe(1);
  });
});

describe("Ohne Alt passiert nichts", () => {
  it("B, 8, Plus und Minus allein wirken nicht", () => {
    const ansagen = vi.fn();
    renderHook(() => usePlusTasten(ansagen));
    fireEvent.keyDown(window, { code: "KeyB", key: "b" });
    fireEvent.keyDown(window, { code: "Digit8", key: "8" });
    fireEvent.keyDown(window, { code: "Equal", key: "+" });
    fireEvent.keyDown(window, { code: "Minus", key: "-" });
    expect(useEinstellungen.getState().eingabeart).toBe("normal");
    expect(useEinstellungen.getState().zoomIndex).toBe(0);
    expect(ansagen).not.toHaveBeenCalled();
  });

  it("mit Strg dazu gehört das Kürzel jemand anderem", () => {
    renderHook(() => usePlusTasten());
    fireEvent.keyDown(window, { altKey: true, ctrlKey: true, code: "KeyB", key: "∫" });
    expect(useEinstellungen.getState().eingabeart).toBe("normal");
  });
});

describe("Aufräumen", () => {
  it("nach dem Unmount reagiert der Listener nicht mehr", () => {
    const { unmount } = renderHook(() => usePlusTasten());
    unmount();
    fireEvent.keyDown(window, { altKey: true, code: "KeyB", key: "∫" });
    expect(useEinstellungen.getState().eingabeart).toBe("normal");
  });
});
