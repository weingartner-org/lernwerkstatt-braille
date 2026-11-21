/**
 * Wächter: In der Mathematikschrift steht die Rechnung im Feld.
 *
 * Johannes, 19.10.2026: „wenn die Brailleeingabe aktiviert ist, steht die
 * Rechnung nicht mehr in der Eingabezeile - das ist bei Braillearbeitern am
 * wichtigsten." Ursache: seit 13.10. steht immer `[]` in der Vorlage, und die
 * Mathematikschrift lehnte jede Zeile mit `[]` ab - das Feld blieb leer.
 */
import { describe, expect, it } from "vitest";
import { vorlageInZellen, uebersetze } from "../src/components/plus/PlusEingabe";
import { erzeugeLauf } from "../src/lib/plus/generator";
import { PAKETE } from "../src/lib/plus/stoffplan";
import { istRichtig } from "../src/lib/plus/aufgabe";
import { eingabezeile } from "../src/lib/plus/zeile";

const ALLE = PAKETE.flatMap((p) => erzeugeLauf(p.id, { anzahl: 12, saat: 11 }));

describe("Mathematikschrift: Rechnung im Feld", () => {
  it("6 +[] =10 steht da, die Marke sitzt in der Lücke", () => {
    const v = vorlageInZellen("6 +[] =10", 4, "marburger");
    expect(v).not.toBeNull();
    expect(uebersetze(v!.zellen, "marburger").text).toBe("6 + =10");
    expect(uebersetze(v!.zellen.slice(0, v!.marke), "marburger").text).toBe("6 +");
  });

  it("jede Rechenzeile ohne Wörter steht im Feld, die Lösung darin ist richtig", () => {
    let imFeld = 0, gesamt = 0;
    for (const a of ALLE) {
      const z = eingabezeile(a);
      if (!z) continue;
      gesamt++;
      const v = vorlageInZellen(z.vorlage, z.marke, "marburger");
      if (!v) continue;
      imFeld++;
      const text = uebersetze(v.zellen, "marburger").text;
      const vorne = uebersetze(v.zellen.slice(0, v.marke), "marburger").text;
      expect(text.startsWith(vorne)).toBe(true);
      // Die Lösung an die Marke schreiben, wie das Kind es täte.
      const mit = vorne + a.loesung + text.slice(vorne.length);
      if (!z.vorlage.includes("[]") || z.vorlage.split("[]").length > 2) continue;
      if (a.bereich) continue;
      expect(istRichtig(mit, a), `${a.angabe} | ${mit}`).toBe(true);
    }
    expect(imFeld / gesamt).toBeGreaterThan(0.5);
  });
});
