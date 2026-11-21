/**
 * ★★★ Jedes Zeichen wird vorgelesen (Johannes 07.10.2026: „die sonderzeichen
 * werden gar nicht angesagt, das geht überhaupt nicht, jedes zeichen muss bei
 * vorlesen kommen").
 */
import { describe, expect, it } from "vitest";
import { mitZeichenNamen } from "@/lib/braille/zeichenSprechen";
import { announceTask, announceWrong } from "@/lib/braille/announce";
import { LEVELS } from "@/lib/braille/curriculum";
import * as TEXTE from "@/lib/braille/texts";

describe("mitZeichenNamen", () => {
  it("Satzzeichen beim Namen", () => {
    expect(mitZeichenNamen("Toll!")).toBe("Toll Ausrufezeichen");
    expect(mitZeichenNamen("Hund, Katze.")).toBe("Hund Komma Katze Punkt");
    expect(mitZeichenNamen("E-Mail")).toBe("E Bindestrich Mail");
    expect(mitZeichenNamen("„Ja“")).toBe("Anführungszeichen unten Ja Anführungszeichen oben");
  });
  it("Computerbraille und Sonderzeichen", () => {
    expect(mitZeichenNamen("info@post.at")).toBe("info at-Zeichen post Punkt at");
    expect(mitZeichenNamen("5 €")).toBe("5 Euro");
    expect(mitZeichenNamen("[a]")).toBe("eckige Klammer auf a eckige Klammer zu");
  });
  it("Englisch (UEB)", () => {
    expect(mitZeichenNamen("Wow!", "en")).toBe("Wow exclamation mark");
  });
  it("Wörter ohne Zeichen bleiben gleich", () => {
    expect(mitZeichenNamen("Hund")).toBe("Hund");
    expect(mitZeichenNamen("über 12 Äpfel")).toBe("über 12 Äpfel");
  });
});

describe("Ansagen", () => {
  it("Schreib-Aufgabe: Braillezeile bekommt den Text, die Stimme die Namen", () => {
    const a = announceTask("Toll!", "write");
    expect(a.text).toBe("Toll!");
    expect(a.spoken).toBe("Toll Ausrufezeichen");
  });
  it("Lese-Fehler nennt das Wort mit allen Zeichen", () => {
    const a = announceWrong({ direction: "read", prompt: "Ja?" });
    expect(a.spoken).toBe("Ja Fragezeichen");
  });
});

describe("★ Wächter: jedes Zeichen in den Aufgaben hat einen Namen", () => {
  it("kein Satz- oder Sonderzeichen bleibt stumm", () => {
    const texte: string[] = [];
    const sammle = (v: unknown) => {
      if (typeof v === "string") texte.push(v);
      else if (Array.isArray(v)) v.forEach(sammle);
    };
    for (const l of LEVELS) sammle(l.items);
    for (const t of Object.values(TEXTE)) sammle(t);
    const stumm = new Set<string>();
    for (const t of texte)
      for (const z of t)
        if (!/[\p{L}\p{N}\s]/u.test(z) && mitZeichenNamen(z) === z) stumm.add(z);
    expect([...stumm]).toEqual([]);
  });
});
