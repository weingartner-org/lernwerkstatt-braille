/**
 * ★★★★★ DIE ENTSCHEIDUNGEN VOM 16.10.2026 AUCH IN PLUS
 * (Johannes, zuerst im eine andere App der Plattform : „Antworten mit mehreren Ergebnissen dürfen
 * in einer Zeile sein, aber nur, wenn auch alle Werte überprüft werden"; dazu
 * „Einheit vergessen" ⇒ noch nicht richtig; ein Wert falsch ⇒ der Hinweis sagt
 * welcher. Für Plus: „all diese Entscheidungen auch in der App Plus").
 *
 * `aufzaehlungUrteil()` und `fehlendeEinheit()`; gemessen vorher: „Vorgänger 8,
 * Nachfolger 10" falsch, „9 -1 =8 und 9 +1 =10" verändert, „234" für „234 Euro"
 * richtig.
 */
import { describe, expect, it } from "vitest";
import { pruefe, type Aufgabe } from "@/lib/plus/aufgabe";

const aufgabe = (angabe: string, loesung: string, auchRichtig?: string[], mehr: Partial<Aufgabe> = {}): Aufgabe =>
  ({ paket: "1-01", art: "folge", op: "plus", angabe, loesung, auchRichtig, zahlen: [], ...mehr }) as Aufgabe;

describe("mehrere Werte in einer Zeile - jeder wird geprüft", () => {
  const nachbarn = aufgabe("Wie heißen die Nachbarn von 9?", "8 und 10", ["8, 10", "8 10"]);
  it.each([
    "8 und 10", "8, 10", "8 10", "10 und 8",
    "Vorgänger 8, Nachfolger 10", "Vorgänger: 8; Nachfolger: 10", "9 -1 =8 und 9 +1 =10",
  ])("richtig: „%s\"", (e) => {
    expect(pruefe(e, nachbarn).stand).toBe("richtig");
  });
  it.each([
    ["8", "8 stimmt, ein Wert fehlt noch"],
    ["8 und 11", "8 stimmt, 11 noch nicht"],
    ["9 -1 =7 und 9 +1 =10", "10 stimmt, 7 noch nicht"],
  ])("falsch mit Hinweis: „%s\" ⇒ %s", (e, hinweis) => {
    const u = pruefe(e, nachbarn);
    expect(u.stand).toBe("falsch");
    expect(u.hinweis).toBe(hinweis);
  });
  it("alles falsch: kein Hinweis, nur „noch nicht\"", () => {
    const u = pruefe("7 und 11", nachbarn);
    expect(u.stand).toBe("falsch");
    expect(u.hinweis).toBeUndefined();
  });
});

describe("Einheit vergessen ist noch nicht richtig", () => {
  const sach = aufgabe("Paul spart 6 Wochen lang je 17 Euro.\nDann kommen 132 Euro dazu.\nWie viel ist es?", "234 Euro", ["234"], { art: "sach" } as Partial<Aufgabe>);
  it.each(["234 Euro", "234 €", "6 *17 +132 =234 Euro"])("richtig: „%s\"", (e) => {
    expect(pruefe(e, sach).stand).toBe("richtig");
  });
  it.each(["234", "6 *17 +132 =234"])("„%s\" ⇒ Einheit fehlt", (e) => {
    const u = pruefe(e, sach);
    expect(u.stand).toBe("einheit");
    expect(u.hinweis).toBe("Einheit fehlt: Euro");
  });
  it("steht die Einheit schon hinter der Lücke, braucht es sie nicht", () => {
    expect(pruefe("82", aufgabe("1/5 von 410 g =[] g", "82 g")).stand).toBe("richtig");
  });
  it("beim Schätzen (Fermi) stört die fehlende Einheit nicht", () => {
    expect(pruefe("70", aufgabe("Ein Kind schläft 10 Stunden je Nacht.\nWie viele Stunden in einer Woche?", "70 h", undefined, { bereich: [60, 80] })).stand).toBe("richtig");
  });
});
