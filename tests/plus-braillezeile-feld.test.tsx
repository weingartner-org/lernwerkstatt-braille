/**
 * Wächter: „Arbeiten mit Braillezeile" (Johannes, 19.10.2026).
 *
 * „Immer wenn ‚Arbeiten mit Braillezeile' an ist, muss jede Rechnung (auch
 * Textbeispiele) in dem Eingabefeld sein. Das Eingabefeld kann mehrzeilig sein
 * und hat immer 40 Zeichen Breite … du wählst die Zeilenumbrüche so klug, dass
 * die Kinder auch beim Rechnen so wenig Zeilensprünge wie möglich haben.
 * Wenn ‚Arbeiten mit Braillezeile' aus ist, kommt die Rechnung oben und das
 * Eingabefeld ist leer."
 *
 * Gemessen wird über ALLE Pakete, nicht an ausgedachten Beispielen.
 */
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { PlusUebung } from "../src/components/plus/PlusUebung";
import { uebersetze, vorlageInZellen } from "../src/components/plus/PlusEingabe";
import { useEinstellungen } from "../src/lib/plus/einstellungen";
import { erzeugeLauf } from "../src/lib/plus/generator";
import { PAKETE } from "../src/lib/plus/stoffplan";
import { FELDBREITE, brecheUm, platzJeLuecke } from "../src/lib/plus/umbruch";
import { zeichenZuBraille } from "../src/lib/plus/braille/computerbraille";
import { istRichtig } from "../src/lib/plus/aufgabe";
import { eingabezeileBraille, antwortAus } from "../src/lib/plus/zeile";

const ALLE = PAKETE.flatMap((p) => [4, 9].flatMap((saat) => erzeugeLauf(p.id, { anzahl: 12, saat })));

afterEach(() => {
  cleanup();
  useEinstellungen.getState().setEingabeart("normal");
  localStorage.clear();
});

describe("Jede Aufgabe hat mit Braillezeile eine Zeile im Feld", () => {
  it("auch Textaufgaben, Zahlenmauern und alles mit mehr als zwei Zeilen", () => {
    for (const a of ALLE) {
      const z = eingabezeileBraille(a);
      expect(z, a.angabe).not.toBeNull();
      expect(z!.vorlage, a.angabe).toContain("[]");
      expect(z!.vorlage.slice(z!.marke - 1, z!.marke + 1), a.angabe).toBe("[]");
    }
  });

  it("★ in beiden Schriften steht die Zeile da - nie leer", () => {
    for (const art of ["computer", "marburger"] as const) {
      for (const a of ALLE) {
        const z = eingabezeileBraille(a)!;
        if (z.mehrzeilig) continue;
        const v = vorlageInZellen(z.vorlage, z.marke, art, { umbrechen: true, erwartet: a.loesung.length });
        expect(v, `${art}: ${a.angabe}`).not.toBeNull();
        expect(v!.zellen.length, `${art}: ${a.angabe}`).toBeGreaterThan(0);
      }
    }
  });
});

describe("Das Feld ist nie breiter als 40 Zeichen", () => {
  it("★ keine Zeile über 40 - mit der Antwort, die das Kind voraussichtlich schreibt", () => {
    const zuLang: string[] = [];
    for (const a of ALLE) {
      const z = eingabezeileBraille(a)!;
      if (z.mehrzeilig) continue;
      const luecken = z.vorlage.split("[]").length - 1;
      const platz = platzJeLuecke(a.loesung.length, luecken);
      const text = brecheUm(z.vorlage, a.loesung.length);
      for (const zeile of text.split("\n")) {
        const breite = zeile.length + (zeile.split("[]").length - 1) * platz;
        const wort = !zeile.includes(" ");
        // Ein einzelnes Wort, das für sich zu lang ist, bleibt ganz (nie ein Wort teilen).
        if (breite > FELDBREITE && !wort) zuLang.push(`${breite}: ${zeile}`);
      }
    }
    expect(zuLang).toEqual([]);
  });

  it("★ in Zellen: Computerbraille und 6-Punkt haben keine Zeile über 40", () => {
    const zuLang: string[] = [];
    for (const art of ["computer", "marburger"] as const) {
      for (const a of ALLE) {
        const z = eingabezeileBraille(a)!;
        if (z.mehrzeilig) continue;
        const v = vorlageInZellen(z.vorlage, z.marke, art, { umbrechen: true, erwartet: a.loesung.length })!;
        for (const zeile of v.zellen.split("\n")) {
          if (zeile.length > FELDBREITE && zeile.includes(" ") || (zeile.length > FELDBREITE && /[⠀]/.test(zeile))) {
            zuLang.push(`${art} ${zeile.length}: ${zeile}`);
          }
        }
      }
    }
    expect(zuLang).toEqual([]);
  });

  it("Länge und Marke bleiben: aus Leerzeichen werden nur Umbrüche", () => {
    for (const a of ALLE.slice(0, 400)) {
      const z = eingabezeileBraille(a)!;
      const t = brecheUm(z.vorlage, a.loesung.length);
      expect(t.length).toBe(z.vorlage.length);
      expect(t.replace(/\n/g, " ")).toBe(z.vorlage.replace(/\n/g, " "));
    }
  });

  it("★ so wenige Zeilen wie möglich: kurze Rechnungen bleiben EINE Zeile", () => {
    expect(brecheUm("48 +27 =[]", 2)).toBe("48 +27 =[]");
    expect(brecheUm("6 +[] =10", 1)).toBe("6 +[] =10");
  });

  it("★ der Umbruch rechnet die Antwort mit: die Lücke rutscht, bevor sie überläuft", () => {
    const t = brecheUm("Wie viele Äpfel sind es zusammen? []", 6);
    expect(t.split("\n").length).toBeGreaterThan(1);
    for (const z of t.split("\n")) expect(z.length + (z.includes("[]") ? platzJeLuecke(6, 1) : 0)).toBeLessThanOrEqual(FELDBREITE);
  });
});

describe("Die Lösung im Feld wird richtig gelesen", () => {
  it("★ Lösung in der Lücke ⇒ richtig, auch bei Textaufgaben und mit Umbrüchen", () => {
    const falsch: string[] = [];
    for (const a of ALLE) {
      if (a.bereich || a.passt) continue;
      const z = eingabezeileBraille(a)!;
      if (z.mehrzeilig || z.vorlage.split("[]").length > 2) continue;
      const mit = brecheUm(z.vorlage, a.loesung.length).replace("[]", `[${a.loesung}]`).replace(/\n+/g, " ");
      const urteil = antwortAus(mit, a, z);
      if (urteil.stand !== "antwort" || !istRichtig(urteil.antwort, a)) falsch.push(`${a.angabe} | ${mit} | ${urteil.stand} ${urteil.antwort}`);
    }
    expect(falsch.slice(0, 10)).toEqual([]);
  });
});

describe("Die Übung", () => {
  const eingabe = () => screen.getByLabelText("Deine Antwort") as HTMLTextAreaElement;

  it("★ ohne Braillezeile: die Aufgabe steht oben, das Feld ist leer", () => {
    render(<PlusUebung paketId="1-18" saat={4} onZurueck={() => {}} />);
    expect(document.getElementById("plus-aufgabe")).not.toBeNull();
    expect(eingabe().value).toBe("");
  });

  it("★ mit Braillezeile: die ganze Aufgabe steht im Feld, oben steht nichts", () => {
    render(<PlusUebung paketId="1-18" saat={4} art="computer" onZurueck={() => {}} />);
    expect(document.getElementById("plus-aufgabe")).toBeNull();
    const text = uebersetze(eingabe().value, "computer").text.replace(/\n+/g, " ");
    expect(text.length).toBeGreaterThan(15);
    expect(text).toContain("[]");
    // 40 Zeichen Breite: das Feld ist ein Textfeld mit Umbruch.
    expect(eingabe().getAttribute("wrap")).toBe("soft");
    expect(eingabe().style.width).toContain("40ch");
  });

  it("★ mit Braillezeile: die richtige Antwort in der Lücke wird als richtig gewertet", () => {
    render(<PlusUebung paketId="1-18" saat={4} art="computer" onZurueck={() => {}} />);
    const feld = eingabe();
    const aufgabe = erzeugeLauf("1-18", { anzahl: 8, saat: 4 })[0];
    const zell = (t: string) => [...t].map((c) => zeichenZuBraille(c) ?? c).join("");
    // Seit die Tabelle auch `?` kennt, steht die ganze Aufgabe in Zellen da - auch die Klammern.
    fireEvent.change(feld, { target: { value: feld.value.replace(zell("[]"), zell(`[${aufgabe.loesung}]`)) } });
    fireEvent.keyDown(feld, { key: "p", code: "KeyP", altKey: true });
    expect(screen.getAllByText(/Richtig/).length).toBeGreaterThan(0);
  });
});

describe("Computerbraille kennt die Zeichen der Aufgaben", () => {
  it("★ `?` `'` `|` stehen als Zellen da (Muster wie in Punktgenau und de-de-comp8.ctb)", () => {
    expect(zeichenZuBraille("?")).toBe("⠢");
    expect(zeichenZuBraille("'")).toBe("⠠");
    expect(zeichenZuBraille("|")).toBe("⠌");
  });

  it("★ keine Aufgabe bleibt in Computerbraille als Text stehen", () => {
    const text: string[] = [];
    for (const a of ALLE) {
      const z = eingabezeileBraille(a)!;
      if (z.mehrzeilig) continue;
      const v = vorlageInZellen(z.vorlage, z.marke, "computer", { umbrechen: true, erwartet: a.loesung.length })!;
      if (/[^⠀-⣿\n]/.test(v.zellen)) text.push(z.vorlage);
    }
    expect(text.slice(0, 5)).toEqual([]);
  });
});

describe("Die Einstellung", () => {
  it("Schalter und Schrift ergeben die Eingabeart - ohne Braillezeile tippt das Kind Zahlen", () => {
    const s = useEinstellungen.getState();
    s.setBraillezeile(false);
    s.setSchrift("marburger");
    expect(useEinstellungen.getState().eingabeart).toBe("normal");
    s.setBraillezeile(true);
    expect(useEinstellungen.getState().eingabeart).toBe("marburger");
  });

  it("Alt + B geht weiter: Zahlen ⇒ Computerbraille ⇒ 6-Punkt ⇒ Zahlen", () => {
    const s = useEinstellungen.getState();
    s.setEingabeart("normal");
    expect(s.naechsteEingabeart()).toBe("computer");
    expect(useEinstellungen.getState().braillezeile).toBe(true);
    expect(useEinstellungen.getState().naechsteEingabeart()).toBe("marburger");
    expect(useEinstellungen.getState().naechsteEingabeart()).toBe("normal");
    expect(useEinstellungen.getState().braillezeile).toBe(false);
  });
});
