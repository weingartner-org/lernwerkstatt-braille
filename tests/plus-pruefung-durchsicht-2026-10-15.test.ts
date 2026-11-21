/**
 * ★★★★★ DIE REGELN AUS DER MATHECOACH-DURCHSICHT VOM 15.10.2026 - in Plus.
 * ============================================================================
 *
 * Johannes, 15.10.2026: „Erkenne Muster um neue Regeln für die Prüfung zu
 * erstellen! Baue diese regeln in den eine andere App der Plattform  ein und auch in die App Plus."
 *
 * Gemessen über ALLE erzeugten Aufgaben aller 161 Pakete (je drei Läufe), vor
 * dem Umbau:
 * - `wahr` für `ja`: 0 von 222 richtig · `falsch` für `nein`: 185 von 282
 * - `22724 m²` für `22724 m^2`: 0 von 10 richtig
 * - `22724 m` (Länge) für eine Fläche: 10 von 10 RICHTIG - ein Häkchen für
 *   die halbe Antwort
 * - `2 *3 =6 22 Euro` (Rechnung, Ergebnis, Antwort): 0 von 174 richtig
 *
 * Die Rundungsregel des eine andere App der Plattform  („runde noch") gilt hier nicht: Plus stellt
 * keine Rechnung mit Rundungsvorgabe - wo Plus „runde" sagt, IST das Runden
 * die Aufgabe.
 */
import { describe, expect, it } from "vitest";
import { pruefe, type Aufgabe } from "../src/lib/plus/aufgabe";
import { antwortNachRechnung, rechneEinfach, wahrheitswert } from "../src/lib/plus/antwortformen";
import { erzeugeLauf } from "../src/lib/plus/generator";
import { PAKETE } from "../src/lib/plus/stoffplan";
import { eingabezeile } from "../src/lib/plus/zeile";

const ALLE: Aufgabe[] = PAKETE.flatMap((p) => [11, 22, 33].flatMap((saat) => erzeugeLauf(p.id, { anzahl: 12, saat })));

/** So steht die Antwort im Feld - in der Rechnung, wo das Feld eine trägt. */
function imFeld(a: Aufgabe, antwort: string): string {
  const z = eingabezeile(a);
  if (!z) return antwort;
  return z.vorlage.includes("[]") ? z.vorlage.replace("[]", antwort) : `${z.vorlage}${antwort}`;
}
const offen = (a: Aufgabe) => !a.passt && !a.bereich;

describe("1) ja ist wahr, nein ist falsch", () => {
  const ja = ALLE.filter((a) => offen(a) && a.loesung === "ja");
  const nein = ALLE.filter((a) => offen(a) && a.loesung === "nein");
  it("es gibt genug Ja-Nein-Aufgaben zum Messen", () => {
    expect(ja.length).toBeGreaterThan(50);
    expect(nein.length).toBeGreaterThan(50);
  });
  it.each(["wahr", "stimmt", "Richtig", "Ja, das stimmt"])("„%s“ für ja ist überall richtig", (w) => {
    for (const a of ja) expect(pruefe(imFeld(a, w), a).stand, `${a.paket} ${a.angabe}`).toBe("richtig");
  });
  it.each(["falsch", "stimmt nicht", "Nein"])("„%s“ für nein ist überall richtig", (w) => {
    for (const a of nein) expect(pruefe(imFeld(a, w), a).stand, `${a.paket} ${a.angabe}`).toBe("richtig");
  });
  it("Gegenprobe: das Gegenteil bleibt falsch", () => {
    for (const a of ja) expect(pruefe(imFeld(a, "falsch"), a).stand).toBe("falsch");
    for (const a of nein) expect(pruefe(imFeld(a, "wahr"), a).stand).toBe("falsch");
  });
  it("wahrheitswert kennt nur ja und nein", () => {
    expect(wahrheitswert("Wahr.")).toBe(true);
    expect(wahrheitswert("stimmt nicht")).toBe(false);
    expect(wahrheitswert("vielleicht")).toBeNull();
  });
});

describe("2) Fläche und Rauminhalt", () => {
  const flaechen = ALLE.filter((a) => offen(a) && /^\d+(?:,\d+)? [a-z]+\^[23]$/.test(a.loesung));
  it("es gibt Aufgaben mit m^2 oder m^3", () => expect(flaechen.length).toBeGreaterThan(3));
  it("„m²“, „m2“ und „m^2“ sind dieselbe Einheit", () => {
    for (const a of flaechen) {
      const [zahl, einheit] = a.loesung.split(" ");
      const basis = einheit.replace(/\^[23]$/, "");
      const hoch = einheit.endsWith("2") ? "²" : "³";
      for (const e of [`${zahl} ${basis}${hoch}`, `${zahl} ${basis}${einheit.slice(-1)}`, `${zahl}${einheit}`]) {
        expect(pruefe(imFeld(a, e), a).stand, `${a.angabe} - ${e}`).toBe("richtig");
      }
      // ★ 16.10.2026 (Johannes): die blosse Zahl ist „Einheit fehlt", nicht richtig.
      expect(pruefe(imFeld(a, zahl), a).stand, `${a.angabe} - ${zahl}`).toBe("einheit");
    }
  });
  it("Gegenprobe: die Länge statt der Fläche ist NICHT richtig, sondern ein Einheiten-Hinweis", () => {
    for (const a of flaechen) {
      const [zahl, einheit] = a.loesung.split(" ");
      expect(pruefe(imFeld(a, `${zahl} ${einheit.replace(/\^[23]$/, "")}`), a).stand, a.angabe).toBe("einheit");
    }
  });
});

describe("3) Rechnung, Ergebnis, dann die Antwort ohne „=“", () => {
  const sach = ALLE.filter(
    (a) => offen(a) && !eingabezeile(a) && /^\d+(?:,\d+)?(?: [a-zA-Z€%]+)?$/.test(a.loesung),
  );
  it("es gibt genug freie Antwortfelder", () => expect(sach.length).toBeGreaterThan(50));
  it("„2 *3 =6 <Antwort>“ ist richtig", () => {
    for (const a of sach) expect(pruefe(`2 *3 =6 ${a.loesung}`, a).stand, a.angabe).toBe("richtig");
  });
  it("Gegenprobe: stimmt die Rechnung davor nicht, zählt die zweite Zahl nicht", () => {
    for (const a of sach) expect(pruefe(`2 *3 =7 ${a.loesung}`, a).stand, a.angabe).not.toBe("richtig");
  });
  it("Bausteine", () => {
    expect(rechneEinfach("2,6 *0,9")).toBeCloseTo(2.34);
    expect(rechneEinfach("(12 +3) :5")).toBe(3);
    expect(rechneEinfach("2 *x")).toBeNull();
    expect(antwortNachRechnung("2,6 *0,9 =2,34 17,66 €")).toBe("17,66 €");
    expect(antwortNachRechnung("150 125")).toBeNull();
  });
});
