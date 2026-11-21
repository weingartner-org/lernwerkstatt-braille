/**
 * Braille-Bildschirmeingabe (VoiceOver) → Zellen. Reine Logik.
 *
 * Der letzte Test ist eine MESSUNG, kein Urteil: Er sagt, welche Notenzeichen
 * über Text erreichbar sind und welche nicht. Diese Liste gehört in die
 * Übergabe - sie entscheidet, ob die Bildschirmeingabe für Noten reicht.
 */
import { describe, expect, it } from "vitest";
import { BLANK, dots } from "@/lib/braille/cell";
import { bsiErreichbareMuster, bsiZuZellen, BSI_ANFANG } from "@/lib/klangpunkte/bsi";
import {
  ACCIDENTAL_CELLS,
  NUMBER_SIGN,
  OCTAVE_CELLS,
  REST_CELLS,
  TONES,
  VALUES,
  noteCell,
} from "@/lib/klangpunkte/notation";

describe("bsiZuZellen", () => {
  it("Buchstaben werden zu ihrer Zelle", () => {
    expect(bsiZuZellen("d").cells).toEqual([dots(1, 4, 5)]);
    expect(bsiZuZellen("z").cells).toEqual([dots(1, 3, 5, 6)]);
  });

  it("Leerzeichen ist der Taktstrich (BLANK)", () => {
    expect(bsiZuZellen(" ").cells).toEqual([BLANK]);
  });

  it("eine Lautgruppe (ch) ist EINE Zelle, zwei einzelne Buchstaben sind zwei", () => {
    expect(bsiZuZellen("ch").cells).toEqual([dots(1, 4, 5, 6)]);
    expect(bsiZuZellen("c").cells.length).toBe(1);
    expect(bsiZuZellen("c").cells).not.toEqual(bsiZuZellen("ch").cells);
  });

  it("einheiten: mehrere Zeichen in EINEM Ereignis bleiben trotzdem einzeln zählbar", () => {
    // Befund 21.09.2026: Wenn zwei Buchstaben in einem einzigen Ereignis
    // ankommen (z. B. "dd"), muss eine Rücktaste, die nur EIN Zeichen aus dem
    // Text nimmt, auch nur EINE der beiden Zellen rückgängig machen - nicht
    // beide. Das setzt voraus, dass jede Einheit ihre eigene Textlänge trägt.
    const r = bsiZuZellen("dd");
    expect(r.einheiten).toEqual([
      { text: "d", cells: [dots(1, 4, 5)] },
      { text: "d", cells: [dots(1, 4, 5)] },
    ]);
  });

  it("einheiten: ein Grossbuchstabe ist EINE Einheit mit zwei Zellen", () => {
    const r = bsiZuZellen("A");
    expect(r.einheiten).toEqual([{ text: "A", cells: [dots(4, 6), dots(1)] }]);
  });

  it("einheiten: eine Lautgruppe ist EINE Einheit über mehrere Zeichen", () => {
    const r = bsiZuZellen("ch");
    expect(r.einheiten).toEqual([{ text: "ch", cells: [dots(1, 4, 5, 6)] }]);
  });

  it("ein Grossbuchstabe bringt das Grossschreibzeichen mit", () => {
    expect(bsiZuZellen("A").cells).toEqual([dots(4, 6), dots(1)]);
  });

  it("eine Ziffer bringt das Zahlzeichen mit, die nächste nicht mehr", () => {
    const eins = bsiZuZellen("1");
    expect(eins.cells).toEqual([NUMBER_SIGN, dots(1)]);
    const zwei = bsiZuZellen("2", eins.kontext);
    expect(zwei.cells).toEqual([dots(1, 2)]);
    const buchstabe = bsiZuZellen("a", zwei.kontext);
    expect(buchstabe.kontext.zifferLaeuft).toBe(false);
  });

  it("Braille-Unicode kommt unverändert an (Tabelle liefert Punktmuster)", () => {
    expect(bsiZuZellen("⠙").cells).toEqual([dots(1, 4, 5)]);
  });

  it("Unbekanntes wird gemeldet, nicht still verschluckt", () => {
    const r = bsiZuZellen("€", BSI_ANFANG);
    expect(r.cells).toEqual([]);
    expect(r.unbekannt).toEqual(["€"]);
  });
});

describe("Messung: welche Notenzeichen sind über Text erreichbar?", () => {
  const erreichbar = bsiErreichbareMuster();
  const alsPunkte = (c: number) =>
    [1, 2, 3, 4, 5, 6].filter((p) => c & (1 << (p - 1))).join("");

  it("meldet die Lücken (Ausgabe für die Übergabe)", () => {
    const luecken: string[] = [];
    for (const ton of TONES)
      for (const wert of VALUES) {
        const c = noteCell(ton, wert);
        if (!erreichbar.has(c)) luecken.push(`Note ${ton} ${wert}: ${alsPunkte(c)}`);
      }
    for (const [okt, c] of Object.entries(OCTAVE_CELLS))
      if (!erreichbar.has(c)) luecken.push(`Oktavzeichen ${okt}: ${alsPunkte(c)}`);
    for (const [name, c] of Object.entries(ACCIDENTAL_CELLS))
      if (!erreichbar.has(c)) luecken.push(`Vorzeichen ${name}: ${alsPunkte(c)}`);
    for (const [wert, c] of Object.entries(REST_CELLS))
      if (!erreichbar.has(c)) luecken.push(`Pause ${wert}: ${alsPunkte(c)}`);
    // eslint-disable-next-line no-console
    console.log("BSI-LÜCKEN (nicht über Text erreichbar):\n" + luecken.join("\n"));
    // Stand 21.09.2026 (gegen liblouis de-chardefs6.cti): Für diese Muster hat die
    // deutsche Tabelle KEINEN Buchstaben und kein ASCII-Zeichen, nur das
    // Braille-Unicode-Zeichen selbst. Sie kommen also nur an, wenn VoiceOver
    // das Muster als U+28xx liefert - das ist am Gerät zu messen. Ändert sich
    // diese Liste, muss die Übergabe mit.
    expect(luecken).toEqual([
      "Note e viertel: 1246",
      "Note f viertel: 12456",
      "Oktavzeichen 1: 4",
      "Oktavzeichen 3: 456",
      "Oktavzeichen 4: 5",
    ]);
  });
});
