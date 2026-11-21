/**
 * Wächter für den Jahresweg - „Mein Training" geht immer weiter.
 */
import { describe, expect, it } from "vitest";
import { baustelle, neuerStand, standVon, type Stand } from "../src/lib/plus/coach";
import { jahresweg, trainingsStufe } from "../src/lib/plus/jahresweg";
import { paketeDerStufe } from "../src/lib/plus/stoffplan";

/** Ein Stand, in dem die genannten Pakete geschafft sind. */
function mitGeschafft(ids: string[]): Stand {
  const s = neuerStand(1);
  for (const id of ids) s.pakete[id] = { ...standVon(s, id), geschafft: true };
  return s;
}

describe("Der Jahresweg", () => {
  it("zählt die Etappen der Stufe und nennt die nächste", () => {
    const stand = mitGeschafft(["3-01", "3-02"]);
    const weg = jahresweg(stand, 3);
    expect(weg.gesamt).toBe(paketeDerStufe(3).length);
    expect(weg.geschafft).toBe(2);
    // Die Etappe ist genau die Baustelle des Coachs - keine zweite Rechnung.
    const id = baustelle(stand, 3)!;
    expect(weg.etappe?.id).toBe(id);
    expect(weg.etappe?.nr).toBe(paketeDerStufe(3).findIndex((p) => p.id === id) + 1);
  });

  it("hat keine Etappe mehr, wenn alles sitzt", () => {
    const alle = paketeDerStufe(2).map((p) => p.id);
    expect(jahresweg(mitGeschafft(alle), 2).etappe).toBeNull();
  });

  it("geht nach einer fertigen Stufe in die nächste", () => {
    const alle = paketeDerStufe(2).map((p) => p.id);
    expect(trainingsStufe(mitGeschafft(alle), 2, false)).toBe(3);
  });

  it("★ bleibt mit fester Stufe der Klasse in dieser Stufe", () => {
    const alle = paketeDerStufe(2).map((p) => p.id);
    expect(trainingsStufe(mitGeschafft(alle), 2, true)).toBe(2);
  });

  it("geht über die 8. Schulstufe nicht hinaus", () => {
    const alle = paketeDerStufe(8).map((p) => p.id);
    expect(trainingsStufe(mitGeschafft(alle), 8, false)).toBe(8);
  });
});
