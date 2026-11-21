/**
 * Plus - Wächter für den Aufgabengenerator, Stufe 3 (Tausenderraum und
 * schriftliche Verfahren).
 *
 * Wie `plus-generator.test.ts`: der Test rechnet nicht mit den Zahlen, die
 * der Generator mitliefert, sondern liest die Angabe so, wie ein Kind sie
 * liest, und rechnet selbst nach.
 *
 * Die Bauart der 21 Pakete lebt noch in eigenen Dateien
 * (`kerne-stufe3.ts`, `zuordnung-stufe3.ts`) - das Zusammenführen mit
 * `generator/index.ts` ist ein eigener, späterer Schritt. Darum wird hier
 * direkt gegen `ZUORDNUNG_STUFE3` getestet, nicht gegen `erzeugeAufgabe`.
 */
import { describe, expect, it } from "vitest";
import { istRichtig, normal, zufall, type Aufgabe } from "../src/lib/plus/aufgabe";
import { PAKETE, paket } from "../src/lib/plus/stoffplan";
import { formeAufgabe, RECHNENDE_FORMEN, NochNichtGebaut } from "../src/lib/plus/generator/formen";
import type { Kern, Zufall } from "../src/lib/plus/generator/kerne";
import { ZUORDNUNG_STUFE3, fehlendeBauartenStufe3 } from "../src/lib/plus/generator/zuordnung-stufe3";

/* ------------------------------------------------------------------ */
/* Werkzeug: Bauart direkt aufrufen, ohne den Umweg über eine Form      */
/* ------------------------------------------------------------------ */

const PAKET_IDS = Object.keys(ZUORDNUNG_STUFE3).sort();

function erzeugeAufgabeStufe3(paketId: string, art: Aufgabe["art"], rng: Zufall): Aufgabe {
  const bauart = ZUORDNUNG_STUFE3[paketId];
  if (!bauart) throw new NochNichtGebaut(paketId, art);
  const kern = bauart(rng);
  return formeAufgabe({ paket: paketId, art, kern, rng, nachschub: () => bauart(rng) });
}

/** N Kerne desselben Pakets, roh - für die Bedingungen, die nur der Kern kennt. */
function kerneVon(paketId: string, n: number, saat = 2024): Kern[] {
  const bauart = ZUORDNUNG_STUFE3[paketId];
  const rng = zufall(saat);
  const raus: Kern[] = [];
  for (let i = 0; i < n; i++) raus.push(bauart(rng));
  return raus;
}

function alleAufgabenStufe3(paketId: string, proArt = 30): Aufgabe[] {
  const p = paket(paketId);
  const arten = p.arten.filter((a) => RECHNENDE_FORMEN.includes(a));
  const rng = zufall(4711);
  const raus: Aufgabe[] = [];
  for (const art of arten) for (let i = 0; i < proArt; i++) raus.push(erzeugeAufgabeStufe3(paketId, art, rng));
  return raus;
}

/* ------------------------------------------------------------------ */
/* Ein unabhängiger Leser für die Schreibweise                          */
/* ------------------------------------------------------------------ */

const ZAHL = String.raw`-?\d+(?:,\d+)?`;

function alsZahl(s: string): number {
  return Number(s.replace(",", "."));
}

function rechneOp(op: string, x: number, y: number): number {
  return op === "+" ? x + y : op === "-" ? x - y : op === "*" ? x * y : x / y;
}

/** Liest `48 +27 =` oder `48 +27 =75` und rechnet selbst nach. */
function nachrechnen(angabe: string): { erwartet: number; a: number; b: number; zeichen: string } | null {
  const m = new RegExp(`^(${ZAHL}) ([-+*/])(${ZAHL}) =(${ZAHL})?$`).exec(angabe.trim());
  if (!m) return null;
  const a = alsZahl(m[1]);
  const b = alsZahl(m[3]);
  const zeichen = m[2];
  return { erwartet: rechneOp(zeichen, a, b), a, b, zeichen };
}

/**
 * Prüft EINE Aufgabe gegen ihre eigene Angabe - unabhängig davon, welche Form
 * eigentlich angefragt war. Nötig, weil ein „direkter" Kern (Runden, Nachbar-
 * zahlen, Überschlag) seine Angabe immer selbst mitbringt, ganz gleich, was
 * `art` gerade verlangt hat - dieselbe Eigenheit wie bei Stufe 1 und 2.
 */
function pruefeAufgabe(a: Aufgabe): void {
  const angabe = a.angabe;

  // Runden
  let m = /^Runde (-?\d+) auf (Zehner|Hunderter)\.$/.exec(angabe);
  if (m) {
    const z = Number(m[1]);
    const stufe = m[2] === "Zehner" ? 10 : 100;
    const erwartet = Math.floor(z / stufe + 0.5) * stufe;
    expect(a.loesung, angabe).toBe(String(erwartet));
    return;
  }

  // Überschlag
  m = /^Überschlage: (-?\d+) ([-+*])(-?\d+)$/.exec(angabe);
  if (m) {
    const x = Number(m[1]), op = m[2], y = Number(m[3]);
    const runde100 = (z: number) => Math.floor(z / 100 + 0.5) * 100;
    const gx = runde100(x), gy = runde100(y);
    const erg = op === "+" ? gx + gy : gx - gy;
    expect(a.loesung, angabe).toBe(`${gx} ${op}${gy} =${erg}`);
    return;
  }

  // Nachbarzahlen bis 1000
  m = /^Welche Zahl kommt vor (-?\d+)\?$/.exec(angabe);
  if (m) { expect(a.loesung, angabe).toBe(String(Number(m[1]) - 1)); return; }
  m = /^Welche Zahl kommt nach (-?\d+)\?$/.exec(angabe);
  if (m) { expect(a.loesung, angabe).toBe(String(Number(m[1]) + 1)); return; }
  m = /^Zwischen welchen Zehnern liegt (-?\d+)\?$/.exec(angabe);
  if (m) { const z = Number(m[1]); const u = Math.floor(z / 10) * 10; expect(normal(a.loesung), angabe).toBe(normal(`${u} und ${u + 10}`)); return; }
  m = /^Zwischen welchen Hundertern liegt (-?\d+)\?$/.exec(angabe);
  if (m) { const z = Number(m[1]); const u = Math.floor(z / 100) * 100; expect(normal(a.loesung), angabe).toBe(normal(`${u} und ${u + 100}`)); return; }
  m = /^Wie heißen die Nachbarn von (-?\d+)\?$/.exec(angabe);
  if (m) { const z = Number(m[1]); expect(normal(a.loesung), angabe).toBe(normal(`${z - 1} und ${z + 1}`)); return; }

  // Probe / Wahr-Falsch
  m = /^(-?\d+) ([-+*/])(-?\d+) =(-?\d+)(?: \((\d+) Rest\))? - stimmt das\?$/.exec(angabe);
  if (m) {
    const x = Number(m[1]), z = m[2], y = Number(m[3]), erg = Number(m[4]);
    const rest = m[5] !== undefined ? Number(m[5]) : undefined;
    const wahr = z === "+" ? x + y === erg
      : z === "-" ? x - y === erg
      : z === "*" ? x * y === erg
      : Math.floor(x / y) === erg && (rest === undefined ? x % y === 0 : x % y === rest);
    expect(a.loesung, angabe).toBe(wahr ? "ja" : "nein");
    return;
  }

  // Kette: "487 +134 =[] +50 =[]"
  m = /^(-?\d+) ([-+*/])(-?\d+) =\[\] ([-+*/])(-?\d+) =\[\]$/.exec(angabe);
  if (m) {
    const x = Number(m[1]), z1 = m[2], y = Number(m[3]), z2 = m[4], y2 = Number(m[5]);
    const zwischen = rechneOp(z1, x, y);
    const ende = rechneOp(z2, zwischen, y2);
    expect(normal(a.loesung), angabe).toBe(normal(`${zwischen} und ${ende}`));
    return;
  }

  // Mauer: "[]\nM1 | []\nU1 | U2 | U3"
  if (angabe.includes("|")) {
    const [, mitte, unten] = angabe.split("\n");
    const mm = /^(-?\d+) \| \[\]$/.exec(mitte ?? "");
    const um = /^(-?\d+) \| (-?\d+) \| (-?\d+)$/.exec(unten ?? "");
    expect(mm, angabe).not.toBeNull();
    expect(um, angabe).not.toBeNull();
    const m1 = Number(mm![1]);
    const [u1, u2, u3] = [Number(um![1]), Number(um![2]), Number(um![3])];
    expect(m1, angabe).toBe(u1 + u2);
    const m2 = u2 + u3;
    expect(normal(a.loesung), angabe).toBe(normal(`${m1 + m2} und ${m2}`));
    return;
  }

  // Folge, operatives Päckchen: mehrzeilig, letzte Zeile ohne Ergebnis
  if (angabe.includes("\n")) {
    const zeilen = angabe.split("\n");
    const g = nachrechnen(zeilen[zeilen.length - 1]);
    expect(g, angabe).not.toBeNull();
    expect(normal(a.loesung), angabe).toBe(normal(String(g!.erwartet)));
    return;
  }

  // Folge, Zahlenreihe mit Lücke: "125, 150, [], 200, 225, 250"
  if (angabe.includes(",") && angabe.includes("[]")) {
    const teile = angabe.split(", ");
    const wegIdx = teile.indexOf("[]");
    expect(wegIdx, angabe).toBeGreaterThanOrEqual(0);
    const zahlen = teile.map((t, i) => (i === wegIdx ? null : alsZahl(t)));
    let schritt: number | null = null;
    for (let i = 1; i < zahlen.length; i++) {
      if (zahlen[i] !== null && zahlen[i - 1] !== null) { schritt = zahlen[i]! - zahlen[i - 1]!; break; }
    }
    expect(schritt, angabe).not.toBeNull();
    const ankerIdx = zahlen.findIndex((z) => z !== null);
    const erwartet = zahlen[ankerIdx]! + schritt! * (wegIdx - ankerIdx);
    expect(alsZahl(a.loesung), angabe).toBe(erwartet);
    return;
  }

  // Lücke in der Zahl: "[] +134 =621" oder "487 +[] =621", auch mit Rest
  m = /^(-?\d+|\[\]) ([-+*/])(-?\d+|\[\]) =(-?\d+(?:,\d+)?)(?: \(\d+ Rest\))?$/.exec(angabe);
  if (m) {
    const [, links, op, rechts, ergStr] = m;
    const linksFehlt = links === "[]";
    const bekannt = linksFehlt ? alsZahl(rechts) : alsZahl(links);
    const erg = alsZahl(ergStr);
    const geloest = alsZahl(a.loesung);
    const ergNeu = linksFehlt ? rechneOp(op, geloest, bekannt) : rechneOp(op, bekannt, geloest);
    expect(ergNeu, angabe).toBeCloseTo(erg, 6);
    return;
  }

  // Ergebnisaufgabe: "487 +134 =", auch mit Rest
  const g = nachrechnen(angabe);
  expect(g, `unbekanntes Format: ${angabe}`).not.toBeNull();
  if (a.rest !== undefined) {
    const quotient = Math.floor(g!.a / g!.b);
    const rest = g!.a % g!.b;
    expect(a.rest, angabe).toBe(rest);
    expect(a.loesung, angabe).toBe(`${quotient} (${rest} Rest)`);
  } else {
    expect(normal(a.loesung), angabe).toBe(normal(String(g!.erwartet)));
  }
}

/* ------------------------------------------------------------------ */

describe("Stufe 3 - Zuordnung", () => {
  it("bedient alle 21 Pakete der Stufe 3", () => {
    const erwartet = PAKETE.filter((p) => p.id.startsWith("3-")).map((p) => p.id).sort();
    expect(PAKET_IDS).toEqual(erwartet);
    expect(PAKET_IDS).toHaveLength(21);
  });

  it("keine Bauart der Stufe 3 fehlt mehr", () => {
    expect(fehlendeBauartenStufe3(PAKETE.map((p) => p.id))).toEqual([]);
  });
});

describe("Jedes Paket liefert Aufgaben, ohne zu werfen", () => {
  it.each(PAKET_IDS)("Paket %s: der Kern baut, ohne zu werfen", (id) => {
    const rng = zufall(13);
    expect(() => { for (let i = 0; i < 60; i++) ZUORDNUNG_STUFE3[id](rng); }).not.toThrow();
  });

  it.each(PAKET_IDS)("Paket %s: jede gebaute Form liefert eine Aufgabe", (id) => {
    const p = paket(id);
    const arten = p.arten.filter((a) => RECHNENDE_FORMEN.includes(a));
    const rng = zufall(13);
    for (const art of arten) {
      expect(() => { for (let i = 0; i < 30; i++) erzeugeAufgabeStufe3(id, art, rng); }, `${id}/${art}`).not.toThrow();
    }
  });
});

describe("Jede Lösung stimmt - selbst nachgerechnet", () => {
  it.each(PAKET_IDS)("Paket %s", (id) => {
    for (const a of alleAufgabenStufe3(id)) pruefeAufgabe(a);
  });
});

describe("Die Zahlen passen zur Strategie", () => {
  it("3-07 Hilfsaufgabe: mindestens eine Zahl liegt höchstens drei von einem glatten Hunderter entfernt", () => {
    const distanz = (n: number) => Math.abs(n - Math.round(n / 100) * 100);
    for (const kern of kerneVon("3-07", 100)) {
      if (kern.sorte !== "rechnung") throw new Error("3-07: erwartet einen Rechnungs-Kern");
      expect(Math.min(distanz(kern.a), distanz(kern.b)), `${kern.a} ${kern.op} ${kern.b}`).toBeLessThanOrEqual(3);
    }
  });

  it("3-20 nutzt dieselbe Hilfsaufgabe-Bedingung wie 3-07", () => {
    const distanz = (n: number) => Math.abs(n - Math.round(n / 100) * 100);
    for (const kern of kerneVon("3-20", 100)) {
      if (kern.sorte !== "rechnung") throw new Error("3-20: erwartet einen Rechnungs-Kern");
      expect(Math.min(distanz(kern.a), distanz(kern.b))).toBeLessThanOrEqual(3);
    }
  });

  // Unabhängige Übertrags-/Ausleihzählung - dupliziert absichtlich NICHT die
  // Zählung aus kerne-stufe3.ts, sondern rechnet mit einer eigenen, kleinen
  // Ziffernsimulation nach.
  function carryPlus(a: number, b: number): number {
    const da = String(a).padStart(4, "0").split("").reverse().map(Number);
    const db = String(b).padStart(4, "0").split("").reverse().map(Number);
    let carry = 0, count = 0;
    for (let i = 0; i < 4; i++) { const s = da[i] + db[i] + carry; carry = s >= 10 ? 1 : 0; if (carry) count++; }
    return count;
  }
  function borrowMinus(a: number, b: number): number {
    const da = String(a).padStart(4, "0").split("").reverse().map(Number);
    const db = String(b).padStart(4, "0").split("").reverse().map(Number);
    let borrow = 0, count = 0;
    for (let i = 0; i < 4; i++) { const xd = da[i] - borrow; const yd = db[i]; if (xd < yd) { count++; borrow = 1; } else borrow = 0; }
    return count;
  }
  const hatNullAnZehnerstelle = (n: number) => Math.floor(n / 10) % 10 === 0;

  it("3-10 Schriftlich Plus: mindestens ein Drittel mit Übertrag, Nullen an kritischer Stelle kommen vor", () => {
    const kerne = kerneVon("3-10", 150).filter((k): k is Extract<Kern, { sorte: "rechnung" }> => k.sorte === "rechnung");
    const mitUebertrag = kerne.filter((k) => carryPlus(k.a, k.b) >= 1).length;
    expect(mitUebertrag).toBeGreaterThanOrEqual(Math.floor(kerne.length / 3));
    expect(kerne.some((k) => hatNullAnZehnerstelle(k.a) || hatNullAnZehnerstelle(k.b))).toBe(true);
  });

  it("3-11 Schriftlich Minus (Ergänzungsverfahren): mindestens ein Drittel mit Übertrag, Nullen an kritischer Stelle kommen vor", () => {
    const kerne = kerneVon("3-11", 150).filter((k): k is Extract<Kern, { sorte: "rechnung" }> => k.sorte === "rechnung");
    const mitUebertrag = kerne.filter((k) => borrowMinus(k.a, k.b) >= 1).length;
    expect(mitUebertrag).toBeGreaterThanOrEqual(Math.floor(kerne.length / 3));
    expect(kerne.some((k) => hatNullAnZehnerstelle(k.a))).toBe(true);
  });

  it("3-12 Schriftlich Minus (Abziehverfahren): mindestens ein Drittel mit Übertrag, Nullen an kritischer Stelle kommen vor", () => {
    const kerne = kerneVon("3-12", 150).filter((k): k is Extract<Kern, { sorte: "rechnung" }> => k.sorte === "rechnung");
    const mitUebertrag = kerne.filter((k) => borrowMinus(k.a, k.b) >= 1).length;
    expect(mitUebertrag).toBeGreaterThanOrEqual(Math.floor(kerne.length / 3));
    expect(kerne.some((k) => hatNullAnZehnerstelle(k.a))).toBe(true);
  });

  it("3-17 Division ohne Rest geht immer auf", () => {
    for (const kern of kerneVon("3-17", 100)) {
      if (kern.sorte !== "rechnung") throw new Error("3-17: erwartet einen Rechnungs-Kern");
      expect(kern.a % kern.b, `${kern.a} /${kern.b}`).toBe(0);
    }
  });

  it("3-18 Division mit Rest hat nie Rest null", () => {
    for (const kern of kerneVon("3-18", 100)) {
      if (kern.sorte !== "rechnung") throw new Error("3-18: erwartet einen Rechnungs-Kern");
      expect(kern.rest, `${kern.a} /${kern.b}`).toBeGreaterThan(0);
    }
  });

  it("3-04 (1000 teilen) geht immer auf", () => {
    for (const kern of kerneVon("3-04", 60)) {
      if (kern.sorte !== "rechnung") throw new Error("3-04: erwartet einen Rechnungs-Kern");
      expect(kern.a % kern.b, `${kern.a} /${kern.b}`).toBe(0);
    }
  });

  it("3-15 Zehner-Einmaleins geht in jeder Form glatt auf - auch in der Päckchen-Form", () => {
    // Der Kern selbst: sowohl die Mal- als auch die Teilrichtung gehen auf.
    for (const kern of kerneVon("3-15", 100)) {
      if (kern.sorte !== "rechnung") throw new Error("3-15: erwartet einen Rechnungs-Kern");
      if (kern.op === "geteilt") expect(kern.a % kern.b, `${kern.a} /${kern.b}`).toBe(0);
    }
    // Die Form "folge": jede der vier Zeilen einzeln nachgerechnet, nicht nur
    // die letzte - bei einer Division muss jede Zeile ohne Rest aufgehen.
    const rng = zufall(77);
    for (let i = 0; i < 80; i++) {
      const a = erzeugeAufgabeStufe3("3-15", "folge", rng);
      const zeilen = a.angabe.split("\n");
      for (let z = 0; z < zeilen.length; z++) {
        const voll = z === zeilen.length - 1 ? zeilen[z] + a.loesung : zeilen[z];
        const g = nachrechnen(voll);
        expect(g, voll).not.toBeNull();
        if (g!.zeichen === "/") expect(g!.a % g!.b, voll).toBe(0);
      }
    }
  });
});

describe("Keine Zahl verlässt den Zahlenraum der Stufe", () => {
  const obergrenze = new Map<string, number>();
  for (const p of PAKETE) {
    if (!p.id.startsWith("3-")) continue;
    const m = /^0-(\d+)$/.exec(p.zr);
    obergrenze.set(p.id, m ? Number(m[1]) : Infinity);
  }

  it.each(PAKET_IDS)("Paket %s", (id) => {
    const grenze = obergrenze.get(id)!;
    for (const kern of kerneVon(id, 60)) {
      const werte =
        kern.sorte === "rechnung" ? [kern.a, kern.b, kern.ergebnis, ...(kern.rest !== undefined ? [kern.rest] : [])]
        : kern.sorte === "reihe" ? kern.glieder
        : kern.zahlen;
      for (const w of werte) {
        expect(w, `${id}: ${JSON.stringify(kern)}`).toBeGreaterThanOrEqual(0);
        expect(w, `${id}: ${JSON.stringify(kern)}`).toBeLessThanOrEqual(grenze);
      }
    }
  });
});

describe("Die Zeile bleibt lesbar", () => {
  it("keine Angabe ist länger als 40 Zeichen je Zeile", () => {
    for (const id of PAKET_IDS) {
      for (const a of alleAufgabenStufe3(id, 20)) {
        for (const zeile of a.angabe.split("\n")) {
          expect(zeile.length, `${id}: ${zeile}`).toBeLessThanOrEqual(40);
        }
      }
    }
  });

  it("benutzt den gewöhnlichen Bindestrich, nie das typografische Minus", () => {
    for (const id of PAKET_IDS) {
      for (const a of alleAufgabenStufe3(id, 20)) {
        expect(a.angabe, id).not.toContain("−");
        expect(a.loesung, id).not.toContain("−");
      }
    }
  });

  it("schreibt Dezimalzahlen mit Komma, nie mit Punkt", () => {
    for (const id of PAKET_IDS) {
      for (const a of alleAufgabenStufe3(id, 20)) {
        expect(a.angabe, id).not.toMatch(/\d\.\d/);
      }
    }
  });
});

describe("★ 3-09 Überschlag - mitgelesen am 23.09.2026", () => {
  const kerne = () => {
    const rng = zufall(309);
    return Array.from({ length: 80 }, () => ZUORDNUNG_STUFE3["3-09"](rng));
  };

  it("die Schätzung allein gilt, die genauere auch", () => {
    // Nur die ganze Zeile `600 -200 =400` galt - `400` war „Noch nicht".
    for (const k of kerne()) {
      if (k.sorte !== "direkt") continue;
      const a: Aufgabe = { paket: "3-09", art: "wahr_falsch", op: k.op, angabe: k.angabe, loesung: k.loesung, auchRichtig: k.auchRichtig, zahlen: [] };
      const schaetzung = k.loesung.split("=").at(-1)!;
      expect(istRichtig(schaetzung, a), k.angabe).toBe(true);
      const [x, zeichen, y] = /^Überschlage: (\d+) ([-+])(\d+)$/.exec(k.angabe)!.slice(1);
      const z = (n: string) => Math.round(Number(n) / 10) * 10;
      const zehner = zeichen === "+" ? z(x) + z(y) : z(x) - z(y);
      expect(istRichtig(String(zehner), a), `${k.angabe} ${zehner}`).toBe(true);
      expect(istRichtig(String(Number(schaetzung) + 300), a), k.angabe).toBe(false);
    }
  });

  it("kein Überschlag, der 0 ergibt", () => {
    // `834 -767` wurde zu `800 -800 =0` - das schätzt nichts.
    for (const k of kerne()) if (k.sorte === "direkt") expect(k.loesung, k.angabe).not.toMatch(/=0$/);
  });
});
