import { describe, it, expect } from "vitest";
import { CHORD_FENSTER_MS, CHORD_NACHLAUF_MS, chordCells, isDotKey, parseDots, type ChordEvent } from "../src/lib/braille";

const down = (code: string): ChordEvent => ({ type: "down", code });
const up = (code: string): ChordEvent => ({ type: "up", code });

describe("Akkord-Eingabe", () => {
  it("erkennt die Punkt-Tasten je System", () => {
    expect(isDotKey("KeyF", false)).toBe(true); // Punkt 1
    expect(isDotKey("Semicolon", false)).toBe(false); // ö = Punkt 8, nur 8-Punkt
    expect(isDotKey("Semicolon", true)).toBe(true);
    expect(isDotKey("KeyA", false)).toBe(false); // a = Punkt 7
    expect(isDotKey("KeyG", false)).toBe(false); // keine Punkt-Taste
  });

  it("eine gleichzeitig gedrückte Tastengruppe = eine Zelle (Buchstabe f)", () => {
    // f = Punkte 1,2,4 = Tasten f + d + j
    const cells = chordCells([
      down("KeyF"), down("KeyD"), down("KeyJ"),
      up("KeyF"), up("KeyD"), up("KeyJ"),
    ]);
    expect(cells).toEqual([parseDots("124")]);
  });

  it("committet erst, wenn ALLE Tasten los sind (rollendes Loslassen)", () => {
    // a = Punkt 1 = nur f
    const cells = chordCells([down("KeyF"), down("KeyJ"), up("KeyF"), up("KeyJ")]);
    expect(cells).toEqual([parseDots("14")]); // f(1)+j(4) → c
  });

  it("mehrere Zellen nacheinander", () => {
    const cells = chordCells([
      down("KeyF"), up("KeyF"), // a
      down("KeyF"), down("KeyD"), up("KeyD"), up("KeyF"), // b (1,2)
    ]);
    expect(cells).toEqual([parseDots("1"), parseDots("12")]);
  });

  it("8-Punkt: a und ö liefern Punkt 7 und 8", () => {
    const cells = chordCells(
      [down("KeyF"), down("KeyA"), down("Semicolon"), up("KeyF"), up("KeyA"), up("Semicolon")],
      true,
    );
    expect(cells).toEqual([parseDots("178")]);
  });

  it("ignoriert Punkt 7/8 im 6-Punkt-Modus", () => {
    const cells = chordCells([down("KeyF"), down("KeyA"), up("KeyF"), up("KeyA")], false);
    expect(cells).toEqual([parseDots("1")]); // a-Taste (Punkt 7) ignoriert
  });
});

describe("Akkord-Eingabe mit Nachfrist (nicht ganz gleichzeitig)", () => {
  const d = (code: string, t: number): ChordEvent => ({ type: "down", code, t });
  const u = (code: string, t: number): ChordEvent => ({ type: "up", code, t });

  it("ohne Nachfrist: f los, dann d = zwei Zellen (so war es vorher)", () => {
    const cells = chordCells([d("KeyF", 0), u("KeyF", 50), d("KeyD", 80), u("KeyD", 150)]);
    expect(cells).toEqual([parseDots("1"), parseDots("2")]);
  });

  it("mit Nachfrist: d kommt knapp nach dem Loslassen von f = EINE Zelle", () => {
    const cells = chordCells(
      [d("KeyF", 0), u("KeyF", 50), d("KeyD", 80), u("KeyD", 150)],
      false,
      CHORD_NACHLAUF_MS,
    );
    expect(cells).toEqual([parseDots("12")]);
  });

  it("mit Nachfrist: eine echte Pause trennt weiterhin zwei Zellen", () => {
    const cells = chordCells(
      [d("KeyF", 0), u("KeyF", 50), d("KeyD", 400), u("KeyD", 450)],
      false,
      CHORD_NACHLAUF_MS,
    );
    expect(cells).toEqual([parseDots("1"), parseDots("2")]);
  });
});

describe("Anschlag-Fenster (nicht zu gemächlich nacheinander)", () => {
  const d = (code: string, t: number): ChordEvent => ({ type: "down", code, t });
  const u = (code: string, t: number): ChordEvent => ({ type: "up", code, t });

  it("knapp nacheinander gedrückt und gehalten = EINE Zelle", () => {
    const cells = chordCells(
      [d("KeyF", 0), d("KeyD", 90), u("KeyF", 200), u("KeyD", 210)],
      false, CHORD_NACHLAUF_MS, CHORD_FENSTER_MS,
    );
    expect(cells).toEqual([parseDots("12")]);
  });

  it("f gehalten, d erst eine halbe Sekunde später = zwei Zellen (keine richtige)", () => {
    const cells = chordCells(
      [d("KeyF", 0), d("KeyD", 500), u("KeyF", 600), u("KeyD", 610)],
      false, CHORD_NACHLAUF_MS, CHORD_FENSTER_MS,
    );
    expect(cells).toEqual([parseDots("1"), parseDots("2")]);
  });

  it("ohne Fenster (Klangpunkte, Plus) bleibt es eine Zelle", () => {
    const cells = chordCells([d("KeyF", 0), d("KeyD", 500), u("KeyF", 600), u("KeyD", 610)]);
    expect(cells).toEqual([parseDots("12")]);
  });
});
