/**
 * Wächter für „Ich gegen früher" (16.10.2026).
 *
 * Nur mit sich selbst, nur was besser geworden ist, nie ein Rückschritt.
 */
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PlusStatistik } from "../src/components/plus/PlusStatistik";
import { neuerStand, standVon } from "../src/lib/plus/coach";
import { heile, leererFortschritt, type Verlauf } from "../src/lib/plus/fortschritt";
import { rueckblick, vorWie } from "../src/lib/plus/rueckblick";

const lauf = (tag: number, richtige: number, gesamt = 8) => ({ tag, richtige, gesamt });
const verlauf = (a: [number, number], b: [number, number]): Verlauf => ({
  erst: lauf(a[0], a[1]), jetzt: lauf(b[0], b[1]),
});

describe("vorWie", () => {
  it("Tage, Wochen, Monate", () => {
    expect(vorWie(5)).toBe("Vor 5 Tagen");
    expect(vorWie(14)).toBe("Vor 2 Wochen");
    expect(vorWie(21)).toBe("Vor 3 Wochen");
    expect(vorWie(90)).toBe("Vor 3 Monaten");
  });
});

describe("Der Rückblick", () => {
  const stand = neuerStand(100);
  stand.pakete["3-14"] = { ...standVon(stand, "3-14"), geschafft: true };

  it("★ zeigt, was jetzt sitzt, mit dem früheren und dem letzten Lauf", () => {
    const r = rueckblick({ "3-14": verlauf([100, 3], [114, 8]) }, stand, 114);
    expect(r.sitztJetzt).toHaveLength(1);
    expect(r.sitztJetzt[0].satz).toBe("Vor 2 Wochen: 3 von 8 richtig. Letzter Lauf: 8 von 8 richtig.");
    expect(r.wirdBesser).toHaveLength(0);
  });

  it("was besser, aber noch nicht gesichert ist, steht unter „wird besser“", () => {
    const r = rueckblick({ "3-05": verlauf([100, 2], [114, 5]) }, stand, 114);
    expect(r.wirdBesser).toHaveLength(1);
    expect(r.sitztJetzt).toHaveLength(0);
  });

  it("★ ein Rückschritt kommt nirgends vor", () => {
    const r = rueckblick({
      "3-05": verlauf([100, 7], [114, 4]),
      "3-06": verlauf([100, 5], [114, 5]),
    }, stand, 114);
    expect(r.sitztJetzt).toHaveLength(0);
    expect(r.wirdBesser).toHaveLength(0);
  });

  it("★ „Früher“ heißt mindestens drei Tage her", () => {
    expect(rueckblick({ "3-05": verlauf([100, 2], [101, 8]) }, stand, 101).wirdBesser).toHaveLength(0);
    expect(rueckblick({ "3-05": verlauf([100, 2], [103, 8]) }, stand, 103).wirdBesser).toHaveLength(1);
  });

  it("ein Paket, das es nicht mehr gibt, bringt nichts durcheinander", () => {
    expect(() => rueckblick({ "9-99": verlauf([1, 1], [9, 8]) }, stand, 20)).not.toThrow();
  });

  it("höchstens drei je Gruppe, der größte Sprung zuerst", () => {
    const v: Record<string, Verlauf> = {};
    ["3-01", "3-02", "3-03", "3-04", "3-05"].forEach((id, i) => { v[id] = verlauf([100, 1 + i % 2], [120, 8]); });
    const r = rueckblick(v, stand, 120);
    expect(r.wirdBesser.length).toBeLessThanOrEqual(3);
  });
});

describe("Gespeichert wird nur das Nötige", () => {
  it("heile() wirft kaputte Einträge weg und behält ganze", () => {
    const f = heile({
      verlauf: {
        "3-14": verlauf([100, 3], [114, 8]),
        "3-05": { erst: { tag: 1 }, jetzt: null },
        "3-06": "unsinn",
      },
    });
    expect(Object.keys(f.verlauf)).toEqual(["3-14"]);
    expect(heile(undefined).verlauf).toEqual({});
  });
});

describe("Die Statistik", () => {
  it("sagt ohne Verlauf, was zu tun ist - ohne etwas vorzuwerfen", () => {
    render(<PlusStatistik fortschritt={leererFortschritt()} onZurueck={() => {}} />);
    expect(screen.getByRole("heading", { name: "Ich gegen früher" })).toBeInTheDocument();
    expect(screen.getByText("Hier siehst du nur dich selbst.")).toBeInTheDocument();
    expect(screen.getByText(/Dann siehst du hier, was besser geworden ist/)).toBeInTheDocument();
  });
});
