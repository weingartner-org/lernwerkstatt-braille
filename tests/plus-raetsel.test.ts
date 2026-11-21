/**
 * Wächter für die Rätsel (nach jeder dritten Runde, überspringbar).
 *
 * ★ Wie überall in Plus: nicht dem Generator glauben, sondern die Angabe
 * lesen und die Eindeutigkeit selbst nachrechnen - wo möglich per Brute
 * Force über den ganzen Suchraum, nicht nur an der einen erzeugten Zahl.
 */
import { describe, expect, it } from "vitest";
import { istRichtig, zufall } from "../src/lib/plus/aufgabe";
import { sprich } from "../src/lib/sprechen/rechnen";
import { RAETSELARTEN, raetselFuer } from "../src/lib/plus/raetsel";
import { zahlenDetektiv } from "../src/lib/plus/raetsel/detektiv";
import { buchstabenraetsel } from "../src/lib/plus/raetsel/buchstaben";
import { denkeEineZahl } from "../src/lib/plus/raetsel/denkzahl";
import { wieVieleMoeglichkeiten } from "../src/lib/plus/raetsel/moeglichkeiten";
import { zauberquadrat } from "../src/lib/plus/raetsel/zauberquadrat";
import { logikraetsel } from "../src/lib/plus/raetsel/logik";
import { zahlentrick, simuliereZahlentrick } from "../src/lib/plus/raetsel/zahlentrick";
import { altersUndRestraetsel } from "../src/lib/plus/raetsel/altersraetsel";

const STUFEN = [1, 2, 3, 4, 5, 6, 7, 8];
const SAATEN = 500;

/** Der Richtwert aus BAU-GEMEINSAM.md - großzügig verdoppelt, damit der Test warnt, nicht sperrt. */
function wortGrenze(stufe: number): number {
  const richtwert = stufe <= 2 ? 6 : stufe <= 4 ? 10 : stufe <= 6 ? 12 : 15;
  return richtwert * 2 + 6;
}

function woerter(zeile: string): number {
  return zeile.trim().split(/\s+/).filter(Boolean).length;
}

/* ------------------------------------------------------------------ */
/* Die allgemeine Sweep-Prüfung: 500 Saaten je Stufe                    */
/* ------------------------------------------------------------------ */

describe.each(STUFEN)("Rätsel Stufe %i - 500 Saaten", (stufe) => {
  const gefundeneTitel = new Set<string>();
  const moeglicheArten = RAETSELARTEN.filter((a) => stufe >= a.von && stufe <= a.bis);

  it(`liefert ${SAATEN} gültige, richtig prüfbare Rätsel ohne U+2212 und ohne ×`, () => {
    expect(moeglicheArten.length).toBeGreaterThan(0);
    for (let saat = 1; saat <= SAATEN; saat++) {
      const rng = zufall(saat * 97 + stufe * 100003);
      const a = raetselFuer(stufe, rng);

      expect(a.art).toBe("knobel");
      expect(a.paket).toBe(`raetsel-${stufe}`);
      expect(a.angabe.length).toBeGreaterThan(0);
      expect(a.angabe).not.toContain("−");
      expect(a.angabe).not.toContain("×");
      expect(a.tipp ?? "").not.toContain("×");
      expect(a.erklaerung ?? "").not.toContain("×");
      expect(a.loesung.length).toBeGreaterThan(0);
      expect(a.titel).toBeTruthy();
      expect(moeglicheArten.some((art) => art.name === a.titel)).toBe(true);
      gefundeneTitel.add(a.titel!);

      // Rückmeldung 26.09.2026: „1 Jahre", „bleiben 1", „fehlen 1" -
      // Einzahl/Mehrzahl muss stimmen.
      expect(a.angabe).not.toMatch(/\b1 (Jahre|Kinder)\b/);
      expect(a.angabe).not.toMatch(/\bbleiben 1\b/);
      expect(a.angabe).not.toMatch(/\bfehlen 1\b/);

      // Stufe 1 hat noch kein Einmaleins - weder als Zeichen noch als Wort -
      // und jede Zahl im Rätsel bleibt unter 20.
      if (stufe === 1) {
        expect(a.angabe).not.toMatch(/[*/]/);
        expect(a.angabe).not.toMatch(/\bmal\b/);
        expect(a.angabe).not.toMatch(/\bteile\b/i);
        // ★ Auch Tipp und Erklärung - „Gelöst! 3 *2 =6." stand in Stufe 1
        // (Vorschau, 26.09.2026).
        for (const text of [a.tipp ?? "", a.erklaerung ?? ""]) {
          expect(text, text).not.toMatch(/[*/]/);
          expect(text, text).not.toMatch(/\bmal\b/);
        }
        for (const zahlText of a.angabe.match(/-?\d+/g) ?? []) {
          expect(Math.abs(Number(zahlText))).toBeLessThanOrEqual(20);
        }
      }

      // Die eigene Lösung muss als richtig gelten.
      expect(istRichtig(a.loesung, a)).toBe(true);

      for (const zeile of a.angabe.split("\n")) {
        if (!zeile.trim()) continue;
        const gesagt = sprich(zeile);
        expect(gesagt).not.toMatch(/undefined/);
        expect(gesagt).not.toMatch(/\bNaN\b/);
        expect(gesagt.length).toBeGreaterThan(0);
        // Richtwert Satzlänge - großzügig, warnt nur bei echten Ausreißern.
        expect(woerter(zeile)).toBeLessThanOrEqual(wortGrenze(stufe));
      }
      if (a.tipp) expect(woerter(a.tipp)).toBeLessThanOrEqual(wortGrenze(stufe));
    }
    // Jede für diese Stufe mögliche Rätselart ist tatsächlich vorgekommen.
    for (const art of moeglicheArten) {
      expect(gefundeneTitel.has(art.name)).toBe(true);
    }
  });
});

/* ------------------------------------------------------------------ */
/* Zahlen-Detektiv - Eindeutigkeit per Durchsuchen des Bereichs          */
/* ------------------------------------------------------------------ */

function quersumme(n: number): number {
  return String(Math.abs(n)).split("").reduce((s, z) => s + Number(z), 0);
}
function istPrim(n: number): boolean {
  if (n < 2) return false;
  for (let i = 2; i * i <= n; i++) if (n % i === 0) return false;
  return true;
}
function istQuadratzahl(n: number): boolean {
  const w = Math.round(Math.sqrt(n));
  return w * w === n;
}

/** Eine Hinweiszeile des Zahlen-Detektivs unabhängig nachgebaut - keine Zeile wird geglaubt. */
function hinweisAlsTest(zeile: string): ((x: number) => boolean) | null {
  let m: RegExpMatchArray | null;
  if (zeile === "Ich bin gerade.") return (x) => x % 2 === 0;
  if (zeile === "Ich bin ungerade.") return (x) => x % 2 !== 0;
  if ((m = /^Ich bin größer als (-?\d+) und kleiner als (-?\d+)\.$/.exec(zeile))) {
    const [a, b] = [Number(m[1]), Number(m[2])];
    return (x) => x > a && x < b;
  }
  // Die einseitige Grenze des Nachtrags (Haupt-Chat, 26.09.2026).
  if ((m = /^Ich bin kleiner als (-?\d+)\.$/.exec(zeile))) {
    const g = Number(m[1]);
    return (x) => x < g;
  }
  if ((m = /^Ich bin größer als (-?\d+)\.$/.exec(zeile))) {
    const g = Number(m[1]);
    return (x) => x > g;
  }
  if ((m = /^Ich bin durch (\d+) teilbar\.$/.exec(zeile))) {
    const d = Number(m[1]);
    return (x) => x % d === 0;
  }
  if ((m = /^Teile ich durch (\d+), bleibt (\d+) Rest\.$/.exec(zeile))) {
    const [d, r] = [Number(m[1]), Number(m[2])];
    return (x) => x % d === r;
  }
  if ((m = /^Meine Quersumme ist (\d+)\.$/.exec(zeile))) {
    const s = Number(m[1]);
    return (x) => quersumme(x) === s;
  }
  if ((m = /^Ich bin ein Teiler von (\d+)\.$/.exec(zeile))) {
    const d = Number(m[1]);
    return (x) => x > 0 && d % x === 0;
  }
  if ((m = /^Ich bin ein Vielfaches von (\d+)\.$/.exec(zeile))) {
    const d = Number(m[1]);
    return (x) => x % d === 0;
  }
  if (zeile === "Ich bin eine Quadratzahl.") return istQuadratzahl;
  if (zeile === "Ich bin eine Primzahl.") return istPrim;
  return null;
}

describe("Zahlen-Detektiv - Eindeutigkeit", () => {
  it.each(STUFEN)("Stufe %i: über 60 Saaten passt genau eine Zahl im Bereich 1..3000", (stufe) => {
    for (let saat = 1; saat <= 60; saat++) {
      const a = zahlenDetektiv(stufe, zufall(saat * 31 + stufe));
      const zeilen = a.angabe.split("\n");
      const hinweisZeilen = zeilen.slice(0, -2);
      const hinweise = hinweisZeilen.map((z) => {
        const test = hinweisAlsTest(z);
        expect(test, `unbekannte Hinweiszeile: "${z}"`).not.toBeNull();
        return test!;
      });
      let treffer = 0;
      for (let x = 1; x <= 3000; x++) {
        if (hinweise.every((h) => h(x))) treffer++;
      }
      expect(treffer).toBe(1);
      expect(a.loesung).toBe(String(Number(a.loesung)));

      // Rückmeldung 26.09.2026: ein einziger Bereichs-Hinweis allein ist kein
      // Rätsel - es braucht mindestens zwei Hinweise, und der erste Hinweis
      // (das Zahlenfenster) darf für sich allein noch NICHT eindeutig sein.
      expect(hinweise.length).toBeGreaterThanOrEqual(2);
      let treffserFenster = 0;
      for (let x = 1; x <= 3000; x++) if (hinweise[0](x)) treffserFenster++;
      expect(treffserFenster).toBeGreaterThan(1);
    }
  });

  it("bekannt wird beachtet - dieselbe Angabe kommt nicht sofort wieder", () => {
    const seed = 4242;
    const erste = zahlenDetektiv(7, zufall(seed));
    const zweite = zahlenDetektiv(7, zufall(seed), [erste.angabe]);
    expect(zweite.angabe).not.toBe(erste.angabe);
  });

  it("eine falsche Zahl gilt als falsch", () => {
    const a = zahlenDetektiv(5, zufall(9));
    const falsch = String(Number(a.loesung) + 1000);
    expect(istRichtig(falsch, a)).toBe(false);
  });
});

/* ------------------------------------------------------------------ */
/* Buchstabenrätsel - Eindeutigkeit per Nachlösen                       */
/* ------------------------------------------------------------------ */

describe("Buchstabenrätsel - Eindeutigkeit", () => {
  it.each(STUFEN.filter((s) => s >= 2))("Stufe %i: über 60 Saaten hat das Gleichungssystem genau eine Lösung", (stufe) => {
    for (let saat = 1; saat <= 60; saat++) {
      const a = buchstabenraetsel(stufe, zufall(saat * 53 + stufe));
      const angabe = a.angabe;
      let einfachA: RegExpMatchArray | null;
      let system: RegExpMatchArray | null;
      let kette: RegExpMatchArray | null;
      if ((einfachA = /^A \+A =(\d+)/.exec(angabe))) {
        const c = Number(einfachA[1]);
        const treffer = [];
        for (let x = -200; x <= 200; x++) if (2 * x === c) treffer.push(x);
        expect(treffer).toEqual([Number(a.loesung)]);
      } else if ((system = /A -B =(-?\d+)/.exec(angabe))) {
        const s = Number(/A \+B =(-?\d+)/.exec(angabe)![1]);
        const d = Number(system[1]);
        const treffer: [number, number][] = [];
        for (let x = -300; x <= 300; x++) {
          const y = s - x;
          if (x - y === d) treffer.push([x, y]);
        }
        expect(treffer.length).toBe(1);
        expect(`${treffer[0][0]} und ${treffer[0][1]}`).toBe(a.loesung);
      } else if ((kette = /C \+A =(\d+)/.exec(angabe))) {
        const r = Number(kette[1]);
        const treffer = [];
        for (let x = 1; x <= 500; x++) if (x * x * x + x === r) treffer.push(x);
        expect(treffer.length).toBe(1);
      } else {
        const k1 = /^(\d+) \+A =(\d+)/.exec(angabe);
        const k2 = /^A \+(\d+) =(\d+)/.exec(angabe);
        expect(k1 ?? k2).not.toBeNull();
        const [k, r] = k1 ? [Number(k1[1]), Number(k1[2])] : [Number(k2![1]), Number(k2![2])];
        expect(r - k).toBe(Number(a.loesung));
      }
    }
  });

  it("eine falsche Antwort gilt als falsch", () => {
    const a = buchstabenraetsel(2, zufall(3));
    expect(istRichtig(String(Number(a.loesung) + 1), a)).toBe(false);
  });
});

/* ------------------------------------------------------------------ */
/* Zauberquadrat - jede Lücke folgt direkt aus ihrer Zeile oder Spalte   */
/* ------------------------------------------------------------------ */

describe("Zauberquadrat - Eindeutigkeit", () => {
  it.each(STUFEN.filter((s) => s >= 2))("Stufe %i: über 60 Saaten folgt jede Lücke aus genau einer Zeile/Spalte", (stufe) => {
    for (let saat = 1; saat <= 60; saat++) {
      const a = zauberquadrat(stufe, zufall(saat * 71 + stufe));
      const zeilen = a.angabe.split("\n");
      const summe = Number(/ergibt (-?\d+)\.$/.exec(zeilen[0])![1]);
      const gitter = zeilen.slice(1).map((z) => z.split(" | ").map((zelle) => (zelle === "[]" ? null : Number(zelle))));

      // Höchstens eine Lücke je Zeile.
      for (const zeile of gitter) expect(zeile.filter((z) => z === null).length).toBeLessThanOrEqual(1);
      // Höchstens eine Lücke je Spalte.
      for (let s = 0; s < 3; s++) {
        expect(gitter.filter((zeile) => zeile[s] === null).length).toBeLessThanOrEqual(1);
      }
      // Jede Zeilensumme (Lücke eingesetzt) ergibt die genannte Summe.
      const geloest = gitter.map((zeile) => {
        const fehlt = zeile.indexOf(null);
        if (fehlt < 0) return zeile as number[];
        const rest = summe - zeile.reduce((s: number, z) => (z === null ? s : s + z), 0);
        const kopie = zeile.slice();
        kopie[fehlt] = rest;
        return kopie as number[];
      });
      for (const zeile of geloest) expect(zeile[0] + zeile[1] + zeile[2]).toBe(summe);

      const luecken: number[] = [];
      gitter.forEach((zeile, z) => zeile.forEach((zelle, s) => { if (zelle === null) luecken.push(geloest[z][s]); }));
      expect(a.loesung).toBe(luecken.map(String).join(" und "));
    }
  });
});

/* ------------------------------------------------------------------ */
/* Logikrätsel - Eindeutigkeit per Brute Force über alle Anordnungen    */
/* ------------------------------------------------------------------ */

function alleAnordnungenTest<T>(liste: readonly T[]): T[][] {
  if (liste.length <= 1) return [liste.slice()];
  const ergebnis: T[][] = [];
  for (let i = 0; i < liste.length; i++) {
    const rest = liste.slice(0, i).concat(liste.slice(i + 1));
    for (const folge of alleAnordnungenTest(rest)) ergebnis.push([liste[i], ...folge]);
  }
  return ergebnis;
}

describe("Logikrätsel - Eindeutigkeit per Brute Force", () => {
  it.each(STUFEN.filter((s) => s >= 3))("Stufe %i: über 60 Saaten legt nur eine Anordnung die Antwort fest", (stufe) => {
    for (let saat = 1; saat <= 60; saat++) {
      const a = logikraetsel(stufe, zufall(saat * 43 + stufe));
      const zeilen = a.angabe.split("\n");
      const namen = new Set<string>();
      const kettenPaare: [string, string][] = [];
      const nebenPaare: [string, string][] = [];
      for (const z of zeilen) {
        let m: RegExpMatchArray | null;
        if ((m = /^(\w+) ist \S+ als (\w+)\.$/.exec(z))) {
          kettenPaare.push([m[1], m[2]]);
          namen.add(m[1]); namen.add(m[2]);
        } else if ((m = /^(\w+) sitzt neben (\w+)\.$/.exec(z))) {
          nebenPaare.push([m[1], m[2]]);
          namen.add(m[1]); namen.add(m[2]);
        }
      }
      expect(namen.size).toBeGreaterThanOrEqual(3);
      const liste = [...namen];
      const passende = alleAnordnungenTest(liste).filter((ordnung) => {
        const pos = (n: string) => ordnung.indexOf(n);
        const kette = kettenPaare.every(([x, y]) => pos(x) === pos(y) - 1);
        const neben = nebenPaare.every(([x, y]) => Math.abs(pos(x) - pos(y)) === 1);
        return kette && neben;
      });
      expect(passende.length).toBeGreaterThan(0);
      // Auch wenn mehrere Anordnungen passen (Sitzbank: links/rechts offen),
      // sind sie sich über die gefragte Antwort einig.
      if (/Wer sitzt in der Mitte/.test(a.angabe)) {
        const mitten = new Set(passende.map((o) => o[1]));
        expect(mitten.size).toBe(1);
        expect([...mitten][0]).toBe(a.loesung);
      } else {
        expect(passende.length).toBe(1);
        expect(passende[0]).toContain(a.loesung);
      }
    }
  });

  it("ein anderer Name aus dem Rätsel ist eine falsche Antwort", () => {
    const a = logikraetsel(5, zufall(11));
    const namen = [...a.angabe.matchAll(/\b([A-ZÄÖÜ][a-zäöüß]+)\b/g)].map((m) => m[1])
      .filter((n) => !["Wer", "Drei", "Kinder"].includes(n));
    const anderer = namen.find((n) => n !== a.loesung);
    expect(anderer).toBeTruthy();
    expect(istRichtig(anderer!, a)).toBe(false);
  });
});

/* ------------------------------------------------------------------ */
/* Zahlentrick - geht für jede Zahl auf                                  */
/* ------------------------------------------------------------------ */

describe("Zahlentrick - gilt für jede Zahl", () => {
  it.each(STUFEN.filter((s) => s >= 3))("Stufe %i: über 40 Saaten, je 60 Zahlen von -20 bis 60", (stufe) => {
    for (let saat = 1; saat <= 40; saat++) {
      const a = zahlentrick(stufe, zufall(saat * 61 + stufe));
      const soll = Number(a.loesung);
      for (let x = -20; x <= 60; x++) {
        expect(simuliereZahlentrick(a.angabe, x)).toBe(soll);
      }
    }
  });
});

/* ------------------------------------------------------------------ */
/* Ich denke mir eine Zahl - rückwärts nachrechnen                      */
/* ------------------------------------------------------------------ */

describe("Ich denke mir eine Zahl", () => {
  it.each(STUFEN)("Stufe %i: die Schritte vorwärts angewandt treffen das genannte Zwischenergebnis", (stufe) => {
    for (let saat = 1; saat <= 40; saat++) {
      const a = denkeEineZahl(stufe, zufall(saat * 19 + stufe));
      const start = Number(a.loesung);
      const zeilen = a.angabe.split("\n");
      const ziel = Number(/^Jetzt habe ich (\d+)\.$/.exec(zeilen[zeilen.length - 3])![1]);
      let wert = start;
      for (const z of zeilen.slice(1, -3)) {
        let m: RegExpMatchArray | null;
        if (z === "Verdopple deine Zahl.") wert *= 2;
        else if (z === "Halbiere deine Zahl.") wert /= 2;
        else if ((m = /^Ich rechne plus (\d+)\.$/.exec(z))) wert += Number(m[1]);
        else if ((m = /^Ich rechne minus (\d+)\.$/.exec(z))) wert -= Number(m[1]);
        else if ((m = /^Dann rechne ich mal (\d+)\.$/.exec(z))) wert *= Number(m[1]);
        else if ((m = /^Ich teile durch (\d+)\.$/.exec(z))) wert /= Number(m[1]);
        else throw new Error(`unbekannte Schritt-Zeile: "${z}"`);
      }
      expect(wert).toBe(ziel);
      if (stufe === 1) {
        for (const zahlText of a.angabe.match(/-?\d+/g) ?? []) {
          expect(Math.abs(Number(zahlText))).toBeLessThanOrEqual(20);
        }
        expect(a.angabe).not.toMatch(/[*/]|\bmal\b|\bteile\b/i);
      }
    }
  });

  it("eine falsche Zahl gilt als falsch", () => {
    const a = denkeEineZahl(4, zufall(5));
    expect(istRichtig(String(Number(a.loesung) + 1), a)).toBe(false);
  });
});

/* ------------------------------------------------------------------ */
/* Wie viele Möglichkeiten? und Alters-/Resträtsel: richtig/falsch       */
/* ------------------------------------------------------------------ */

describe("Wie viele Möglichkeiten? und Alters-/Resträtsel", () => {
  it.each(STUFEN)("Möglichkeiten Stufe %i: 40 Saaten, richtig, falsche Zahl falsch", (stufe) => {
    for (let saat = 1; saat <= 40; saat++) {
      const a = wieVieleMoeglichkeiten(stufe, zufall(saat * 29 + stufe));
      expect(istRichtig(a.loesung, a)).toBe(true);
      expect(istRichtig(String(Number(a.loesung) + 1), a)).toBe(false);
    }
  });

  it.each(STUFEN.filter((s) => s >= 4))("Alters-/Resträtsel Stufe %i: 40 Saaten, richtig, falsche Zahl falsch", (stufe) => {
    for (let saat = 1; saat <= 40; saat++) {
      const a = altersUndRestraetsel(stufe, zufall(saat * 37 + stufe));
      expect(istRichtig(a.loesung, a)).toBe(true);
      expect(istRichtig(String(Number(a.loesung) + 1), a)).toBe(false);
    }
  });
});
