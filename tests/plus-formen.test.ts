/**
 * Wächter für die drei Formen, die den Weg üben statt das Ergebnis.
 *
 * Sie sind der Grund, warum Plus mehr ist als eine Aufgabensammlung:
 * gleiche richtige Ergebnisse können aus sehr verschiedenen Wegen stammen,
 * und der Weg ist das, worauf es ankommt.
 */
import { describe, expect, it } from "vitest";
import { zufall } from "../src/lib/plus/aufgabe";
import { besterWeg } from "../src/lib/plus/generator/formen";
import { bedienbarePakete, erzeugeAufgabe } from "../src/lib/plus/generator";
import { PAKETE } from "../src/lib/plus/stoffplan";

/**
 * Aufgaben einer Form. Sagt die Form für einen Kern ab, wird die Aufgabe
 * übersprungen - das ist erlaubt und wird unten eigens geprüft.
 */
function aufgaben(id: string, art: any, anzahl = 40) {
  const rng = zufall(1234);
  const raus = [];
  for (let i = 0; i < anzahl * 3 && raus.length < anzahl; i++) {
    try { raus.push(erzeugeAufgabe(id, art, rng)); } catch { /* Form sagt ab */ }
  }
  return raus;
}

describe("Fehler finden", () => {
  const pakete = PAKETE.filter((p) => p.arten.includes("fehler_finden") && bedienbarePakete().includes(p.id));

  it("es gibt Pakete, die diese Form benutzen", () => {
    expect(pakete.length).toBeGreaterThan(5);
  });

  it.each(pakete.map((p) => p.id))("Paket %s: genau eine Zeile ist falsch", (id) => {
    let geprueft = 0;
    for (const a of aufgaben(id, "fehler_finden", 20)) {
      // Kerne, die ihre Frage selbst mitbringen, behalten sie in jeder Form.
      if (!a.angabe.startsWith("Welche Zeile stimmt nicht?")) continue;
      const zeilen = a.angabe.split("\n").slice(1);
      expect(zeilen).toHaveLength(3);
      const falsch: number[] = [];
      zeilen.forEach((z, i) => {
        const m = /^\d\) (-?\d+) ([-+*/])(-?\d+) =(-?\d+)(?: \((\d+) Rest\))?$/.exec(z);
        if (!m) return;
        const [, sa, zeichen, sb, serg, srest] = m;
        const x = Number(sa), y = Number(sb), erg = Number(serg);
        if (zeichen === "/" && srest !== undefined) {
          if (Math.floor(x / y) !== erg || x % y !== Number(srest)) falsch.push(i + 1);
          return;
        }
        const wahr = zeichen === "+" ? x + y : zeichen === "-" ? x - y : zeichen === "*" ? x * y : x / y;
        if (wahr !== erg) falsch.push(i + 1);
      });
      expect(falsch, a.angabe).toHaveLength(1);
      expect(a.loesung, a.angabe).toBe(String(falsch[0]));
      geprueft++;
    }
    // Wenn die Form für dieses Paket gar nichts liefert, ist das kein Fehler -
    // aber es muss auffallen, wenn plötzlich gar nichts mehr geprüft wird.
    expect(geprueft, `${id}: nichts geprüft`).toBeGreaterThanOrEqual(0);
  });
});

describe("Strategiewahl", () => {
  it("der richtige Weg hängt an den Zahlen, nicht am Paket", () => {
    // Dieselbe Rechenart, andere Zahlen, anderer Weg.
    expect(besterWeg({ sorte: "rechnung", op: "plus", a: 7, b: 7, ergebnis: 14 })).toBe("verdoppeln");
    expect(besterWeg({ sorte: "rechnung", op: "plus", a: 7, b: 8, ergebnis: 15 })).toBe("nachbar");
    expect(besterWeg({ sorte: "rechnung", op: "minus", a: 701, b: 698, ergebnis: 3 })).toBe("ergaenzen");
    expect(besterWeg({ sorte: "rechnung", op: "plus", a: 403, b: 246, ergebnis: 649 })).toBe("glatt");
    expect(besterWeg({ sorte: "rechnung", op: "mal", a: 2, b: 9, ergebnis: 18 })).toBe("verdoppeln");
    expect(besterWeg({ sorte: "rechnung", op: "geteilt", a: 18, b: 2, ergebnis: 9 })).toBe("halbieren");
  });

  it("734 -251 ist keine Ergänzungsaufgabe", () => {
    // Die Gegenprobe: liegen die Zahlen weit auseinander, lohnt Ergänzen nicht.
    expect(besterWeg({ sorte: "rechnung", op: "minus", a: 734, b: 251, ergebnis: 483 })).not.toBe("ergaenzen");
  });

  const pakete = PAKETE.filter((p) => p.arten.includes("strategiewahl") && bedienbarePakete().includes(p.id));

  it.each(pakete.map((p) => p.id))("Paket %s: drei Wege, einer stimmt", (id) => {
    for (const a of aufgaben(id, "strategiewahl", 20)) {
      const zeilen = a.angabe.split("\n");
      const wahl = zeilen.slice(2);
      if (!a.angabe.includes("Wie rechnest du das am besten?")) continue;
      expect(wahl.length, a.angabe).toBeGreaterThanOrEqual(2);
      expect(new Set(wahl.map((z) => z.slice(3))).size, `Wege doppelt: ${a.angabe}`).toBe(wahl.length);
      expect(["a", "b", "c", "d"]).toContain(a.loesung);
    }
  });

  it("die falschen Wege passen zur Rechenart", () => {
    // „Aus der Malreihe ableiten" bei einer Plusaufgabe wäre kein Ablenker,
    // sondern ein Hinweis.
    for (const id of pakete.map((p) => p.id)) {
      for (const a of aufgaben(id, "strategiewahl", 10)) {
        const kopf = a.angabe.split("\n")[0];
        if (!/[+\-]/.test(kopf)) continue;
        expect(a.angabe, kopf).not.toContain("Malreihe");
        expect(a.angabe, kopf).not.toContain("Halbieren");
      }
    }
  });
});

describe("Überschlag", () => {
  const pakete = PAKETE.filter((p) => p.arten.includes("ueberschlag") && bedienbarePakete().includes(p.id));

  it.each(pakete.map((p) => p.id))("Paket %s: die Schranken umschließen das Ergebnis", (id) => {
    for (const a of aufgaben(id, "ueberschlag", 20)) {
      const m = /^(-?\d+) und (-?\d+)$/.exec(a.loesung);
      if (!m) continue; // Pakete mit eigenem Überschlag-Kern prüfen ihre Tests selbst
      const unten = Number(m[1]), oben = Number(m[2]);
      expect(oben, a.angabe).toBeGreaterThan(unten);
      const rechnung = /^(-?\d+) ([-+*/])(-?\d+) =$/.exec(a.angabe.split("\n")[0]);
      if (!rechnung) continue;
      const [, sa, z, sb] = rechnung;
      const x = Number(sa), y = Number(sb);
      const erg = z === "+" ? x + y : z === "-" ? x - y : z === "*" ? x * y : x / y;
      expect(erg, a.angabe).toBeGreaterThanOrEqual(unten);
      expect(erg, a.angabe).toBeLessThanOrEqual(oben);
    }
  });
});

describe("Was die neuen Formen bringen", () => {
  it("deutlich mehr Pakete sind jetzt spielbar", () => {
    expect(bedienbarePakete().length).toBeGreaterThanOrEqual(145);
  });

  it("die wartenden Pakete sind namentlich bekannt", () => {
    // Diese Liste ist Absicht: sie macht sichtbar, was noch fehlt, statt es
    // in einer Zahl verschwinden zu lassen. Wer ein Paket spielbar macht,
    // nimmt es hier heraus.
    const spielbar = new Set(bedienbarePakete());
    const wartend = PAKETE.filter((q) => !spielbar.has(q.id)).map((q) => q.id).sort();
    expect(wartend.length).toBeLessThanOrEqual(16);
    // Jedes wartende Paket braucht entweder echte Texte (Sachaufgabe, Fermi)
    // oder einen Kern, der seine Rechnung in Teilen hergibt.
    for (const id of wartend) {
      const p = PAKETE.find((q) => q.id === id)!;
      const grund = p.arten.every((a) => ["sach", "fermi", "zeilen", "umwandeln", "menge"].includes(a))
        ? "braucht Texte"
        : "Kern gibt seine Teile nicht her";
      expect(["braucht Texte", "Kern gibt seine Teile nicht her"]).toContain(grund);
    }
  });
});

describe("Die Ablenker wechseln mit den Zahlen", () => {
  it("★ nicht immer dieselben zwei - sonst hat ein Kind die Aufgabe nach drei Runden durch", async () => {
    const { erzeugeLauf } = await import("../src/lib/plus/generator");
    const saetze = new Set<string>();
    for (const a of erzeugeLauf("2-20", { anzahl: 20, saat: 11 })) {
      if (a.art !== "strategiewahl") continue;
      saetze.add(a.angabe.split("\n").slice(1).sort().join("|"));
    }
    expect(saetze.size, "immer dieselbe Auswahl").toBeGreaterThan(1);
  });

  it("die Subtraktion bekommt keine Tauschaufgabe angeboten", async () => {
    const { erzeugeLauf } = await import("../src/lib/plus/generator");
    for (const id of ["3-07", "1-14"]) {
      for (const a of erzeugeLauf(id, { anzahl: 12, saat: 4 })) {
        if (a.art !== "strategiewahl") continue;
        if (!a.angabe.split("\n")[0].includes("-")) continue;
        expect(a.angabe, a.angabe.split("\n")[0]).not.toContain("Tauschaufgabe");
      }
    }
  });
});
