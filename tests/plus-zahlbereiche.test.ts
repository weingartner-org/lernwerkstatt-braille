/**
 * Plus - Wächter für die Bauarten der Sekundarstufe (Stufe 5 bis 8).
 *
 * Wie beim Grundstufe-Wächter (`plus-generator.test.ts`) rechnet der Test
 * NICHT mit den Zahlen, die der Kern mitliefert. Er liest die Angabe, so wie
 * ein Kind sie liest, rechnet mit eigenem Code nach und vergleicht mit der
 * Lösung. Nur so fängt der Test einen Generator, der sich selbst falsch
 * versteht.
 */
import { describe, expect, it } from "vitest";
import { LUECKE, normal, rechnung, zahl, zufall } from "../src/lib/plus/aufgabe";
import type { Kern, Zufall } from "../src/lib/plus/generator/kerne";
import * as K from "../src/lib/plus/generator/kerne-zahlbereiche";

/* ------------------------------------------------------------------ */
/* Allgemeine Wächter - für jeden Kern                                  */
/* ------------------------------------------------------------------ */

/** Zeile einer Angabe/Lösung: Braillezeile fasst 40 Zeichen. */
function pruefeZeilenbreite(text: string, kontext: string) {
  for (const zeile of text.split("\n")) {
    expect(zeile.length, `${kontext}: "${zeile}" (${zeile.length} Zeichen)`).toBeLessThanOrEqual(40);
  }
}

/** Kein U+2212, keine Tausendertrennung, kein NaN/undefined. */
function pruefeSchreibweise(text: string, kontext: string) {
  expect(text.includes("−"), `${kontext}: echtes Minuszeichen U+2212 in "${text}"`).toBe(false);
  expect(text.includes("NaN"), `${kontext}: NaN in "${text}"`).toBe(false);
  expect(text.includes("undefined"), `${kontext}: undefined in "${text}"`).toBe(false);
  expect(/\d \d{3}\b/.test(text), `${kontext}: Tausendertrennung in "${text}"`).toBe(false);
}

/** Holt Angabe/Lösung aus einem Kern - unabhängig von der Sorte. */
function angabeUndLoesung(k: Kern): { angabe: string; loesung: string } {
  if (k.sorte === "direkt") return { angabe: k.angabe, loesung: k.loesung };
  if (k.sorte === "rechnung") return { angabe: rechnung(k.a, k.op, k.b), loesung: zahl(k.ergebnis) };
  throw new Error(`Sorte "${k.sorte}" wird von den Zahlbereich-Bauarten nicht erzeugt.`);
}

/**
 * Läuft eine Bauart `anzahl` Mal, prüft die allgemeinen Regeln und ruft für
 * jeden Kern `pruefe` mit (Kern, Angabe, Lösung) auf - dort steckt die
 * eigenständige Nachrechnung.
 */
function laufe(
  anzahl: number,
  erzeuge: (rng: Zufall) => Kern,
  pruefe: (k: Kern, angabe: string, loesung: string) => void,
  saat = 2026,
) {
  const rng = zufall(saat);
  for (let i = 0; i < anzahl; i++) {
    const k = erzeuge(rng);
    const { angabe, loesung } = angabeUndLoesung(k);
    expect(angabe.length, `Kern ${i}: leere Angabe`).toBeGreaterThan(0);
    expect(loesung.length, `Kern ${i}: leere Lösung`).toBeGreaterThan(0);
    pruefeZeilenbreite(angabe, `Kern ${i} Angabe`);
    pruefeZeilenbreite(loesung, `Kern ${i} Lösung`);
    pruefeSchreibweise(angabe, `Kern ${i} Angabe`);
    pruefeSchreibweise(loesung, `Kern ${i} Lösung`);
    if (k.sorte === "direkt") {
      for (const z of k.zahlen) expect(Number.isFinite(z), `Kern ${i}: Zahl nicht endlich (${z})`).toBe(true);
    }
    pruefe(k, angabe, loesung);
  }
}

/* ------------------------------------------------------------------ */
/* Eigenständige Rechenwerkzeuge für den Test                            */
/* ------------------------------------------------------------------ */

function ggTt(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}
function kgVt(a: number, b: number): number {
  return Math.abs(a * b) / ggTt(a, b);
}
function bruchTextT(z: number, n: number): string {
  if (z === 0) return "0";
  if (n < 0) { z = -z; n = -n; }
  const g = ggTt(z, n);
  const zz = z / g, nn = n / g;
  const vz = zz < 0 ? "-" : "";
  const az = Math.abs(zz);
  if (nn === 1) return `${vz}${az}`;
  if (az < nn) return `${vz}${az}/${nn}`;
  const ganzzahl = Math.floor(az / nn);
  const rest = az % nn;
  return rest === 0 ? `${vz}${ganzzahl}` : `${vz}${ganzzahl} ${rest}/${nn}`;
}
function alsFloat(s: string): number {
  return Number(s.trim().replace(",", "."));
}
function nahe(a: number, b: number, eps = 1e-6): boolean {
  return Math.abs(a - b) < eps;
}

/* ================================================================== */
/* Brüche                                                                */
/* ================================================================== */

describe("Brüche", () => {
  it("bruchRechnung: plus gleichnamig", () => {
    laufe(200, (r) => K.bruchRechnung(r, "plus", { nennerMax: 12, gleichnamig: true }), (_k, angabe, loesung) => {
      const m = /^(\d+)\/(\d+) \+(\d+)\/(\d+) =$/.exec(angabe)!;
      expect(m, angabe).not.toBeNull();
      const [, za, na, zb, nb] = m.map(Number) as unknown as number[];
      expect(na).toBe(nb);
      expect(loesung).toBe(bruchTextT(za + zb, na));
    });
  });

  it("bruchRechnung: plus ungleichnamig, kgV bleibt sinnvoll", () => {
    laufe(200, (r) => K.bruchRechnung(r, "plus", { nennerMax: 12, gleichnamig: false }), (_k, angabe, loesung) => {
      const m = /^(\d+)\/(\d+) \+(\d+)\/(\d+) =$/.exec(angabe)!;
      expect(m, angabe).not.toBeNull();
      const [, za, na, zb, nb] = m.map(Number) as unknown as number[];
      expect(na, angabe).not.toBe(nb);
      expect(kgVt(na, nb), angabe).toBeLessThanOrEqual(12 * 3);
      const g = kgVt(na, nb);
      expect(loesung).toBe(bruchTextT(za * (g / na) + zb * (g / nb), g));
    });
  });

  it("bruchRechnung: minus - nie negativ", () => {
    laufe(200, (r) => K.bruchRechnung(r, "minus", { nennerMax: 12 }), (_k, angabe, loesung) => {
      const m = /^(\d+)\/(\d+) -(\d+)\/(\d+) =$/.exec(angabe)!;
      expect(m, angabe).not.toBeNull();
      const [, za, na, zb, nb] = m.map(Number) as unknown as number[];
      const g = kgVt(na, nb);
      const wert = za * (g / na) - zb * (g / nb);
      expect(wert, angabe).toBeGreaterThanOrEqual(0);
      expect(loesung).toBe(bruchTextT(wert, g));
      expect(loesung.startsWith("-"), loesung).toBe(false);
    });
  });

  it("bruchRechnung: mal - etwa die Hälfte vorher kürzbar", () => {
    let kuerzbar = 0;
    const anzahl = 200;
    laufe(anzahl, (r) => K.bruchRechnung(r, "mal", { nennerMax: 12 }), (_k, angabe, loesung) => {
      const m = /^(\d+)\/(\d+) \*(\d+)\/(\d+) =$/.exec(angabe)!;
      expect(m, angabe).not.toBeNull();
      const [, za, na, zb, nb] = m.map(Number) as unknown as number[];
      if (ggTt(za, nb) > 1 || ggTt(zb, na) > 1) kuerzbar++;
      expect(loesung).toBe(bruchTextT(za * zb, na * nb));
    });
    expect(kuerzbar, `${kuerzbar} von ${anzahl} kürzbar`).toBeGreaterThan(anzahl * 0.3);
    expect(kuerzbar, `${kuerzbar} von ${anzahl} kürzbar`).toBeLessThan(anzahl * 0.7);
  });

  it("bruchRechnung: geteilt über den Kehrwert", () => {
    laufe(200, (r) => K.bruchRechnung(r, "geteilt", { nennerMax: 12 }), (_k, angabe, loesung) => {
      const m = /^(\d+)\/(\d+) \/(\d+)\/(\d+) =$/.exec(angabe)!;
      expect(m, angabe).not.toBeNull();
      const [, za, na, zb, nb] = m.map(Number) as unknown as number[];
      expect(loesung).toBe(bruchTextT(za * nb, na * zb));
    });
  });

  it("bruchKuerzen", () => {
    laufe(200, (r) => K.bruchKuerzen(r, { nennerMax: 24, faktorMax: 6 }), (_k, angabe, loesung) => {
      const m = /^(\d+)\/(\d+) =$/.exec(angabe)!;
      expect(m, angabe).not.toBeNull();
      const [, z, n] = m.map(Number) as unknown as number[];
      expect(loesung).toBe(bruchTextT(z, n));
    });
  });

  it("bruchErweitern", () => {
    laufe(200, (r) => K.bruchErweitern(r, { nennerMax: 12, zielNennerMax: 48 }), (_k, angabe, loesung) => {
      // Ein Bruch: kein Abstand vor dem Bruchstrich (Stanetty S. 35).
      const m = new RegExp(`^(\\d+)/(\\d+) =\\${LUECKE}/(\\d+)$`).exec(angabe)!;
      expect(m, angabe).not.toBeNull();
      const [, za, na, nb] = m.map(Number) as unknown as number[];
      expect(nb % na, angabe).toBe(0);
      expect(loesung).toBe(String(za * (nb / na)));
    });
  });

  it("bruchVergleichen", () => {
    laufe(200, (r) => K.bruchVergleichen(r, { nennerMax: 12 }), (_k, angabe, loesung) => {
      const m = new RegExp(`^(\\d+)/(\\d+) \\${LUECKE} (\\d+)/(\\d+)$`).exec(angabe)!;
      expect(m, angabe).not.toBeNull();
      const [, za, na, zb, nb] = m.map(Number) as unknown as number[];
      const va = za * nb, vb = zb * na;
      const erwartet = va > vb ? ">" : va < vb ? "<" : "=";
      expect(loesung).toBe(erwartet);
    });
  });

  it("bruchArt", () => {
    laufe(200, (r) => K.bruchArt(r, { nennerMax: 12 }), (_k, angabe, loesung) => {
      const gemischtM = /^(\d+) (\d+)\/(\d+): echt, unecht oder gemischt\?$/.exec(angabe);
      if (gemischtM) {
        expect(loesung).toBe("gemischt");
        return;
      }
      const m = /^(\d+)\/(\d+): echt, unecht oder gemischt\?$/.exec(angabe)!;
      expect(m, angabe).not.toBeNull();
      const [, z, n] = m.map(Number) as unknown as number[];
      expect(loesung).toBe(z < n ? "echt" : "unecht");
    });
  });

  it("anteilVonMenge", () => {
    laufe(200, (r) => K.anteilVonMenge(r, { nennerMax: 12, mengeMax: 240 }), (_k, angabe, loesung) => {
      const m = /^(\d+)\/(\d+) von (\d+) =$/.exec(angabe)!;
      expect(m, angabe).not.toBeNull();
      const [, z, n, menge] = m.map(Number) as unknown as number[];
      expect(menge % n, angabe).toBe(0);
      expect(loesung).toBe(String((menge / n) * z));
    });
  });
});

/* ================================================================== */
/* Dezimalzahlen                                                        */
/* ================================================================== */

const DEZ_ZAHL = String.raw`-?\d+(?:,\d+)?`;

function nachrechnenDezimal(angabe: string): { a: number; op: string; b: number } {
  const m = new RegExp(`^(${DEZ_ZAHL}) ([-+*/])(${DEZ_ZAHL}) =$`).exec(angabe.trim())!;
  expect(m, angabe).not.toBeNull();
  return { a: alsFloat(m[1]), op: m[2], b: alsFloat(m[3]) };
}

describe("Dezimalzahlen", () => {
  it("dezimalRechnung: plus/minus mit unterschiedlichen Nachkommastellen", () => {
    let unterschiedlich = 0;
    const anzahl = 200;
    laufe(anzahl, (r) => K.dezimalRechnung(r, r() < 0.5 ? "plus" : "minus", { nachkommaMax: 3, ganzMax: 50, unterschiedlich: true }), (_k, angabe, loesung) => {
      const { a, op, b } = nachrechnenDezimal(angabe);
      const na = (String(a).split(".")[1] ?? "").length;
      const nb = (String(b).split(".")[1] ?? "").length;
      if (na !== nb) unterschiedlich++;
      const erwartet = op === "+" ? a + b : a - b;
      expect(nahe(alsFloat(loesung), erwartet), angabe).toBe(true);
      if (op === "-") expect(a, angabe).toBeGreaterThanOrEqual(b);
    });
    expect(unterschiedlich, `${unterschiedlich} von ${anzahl} mit unterschiedlichen Nachkommastellen`).toBeGreaterThan(0);
  });

  it("dezimalRechnung: mal", () => {
    laufe(200, (r) => K.dezimalRechnung(r, "mal", { nachkommaMax: 2, ganzMax: 20 }), (_k, angabe, loesung) => {
      const { a, op, b } = nachrechnenDezimal(angabe);
      expect(op).toBe("*");
      expect(nahe(alsFloat(loesung), a * b), angabe).toBe(true);
    });
  });

  it("dezimalRechnung: geteilt, natürlicher Divisor", () => {
    laufe(200, (r) => K.dezimalRechnung(r, "geteilt", { nachkommaMax: 2, ganzMax: 20 }), (_k, angabe, loesung) => {
      const { a, op, b } = nachrechnenDezimal(angabe);
      expect(op).toBe("/");
      expect(Number.isInteger(b), angabe).toBe(true);
      expect(nahe(alsFloat(loesung), a / b), angabe).toBe(true);
    });
  });

  it("dezimalRechnung: geteilt durch eine Dezimalzahl", () => {
    laufe(200, (r) => K.dezimalRechnung(r, "geteilt", { nachkommaMax: 2, ganzMax: 20, divisorNachkomma: 2 }), (_k, angabe, loesung) => {
      const { a, op, b } = nachrechnenDezimal(angabe);
      expect(op).toBe("/");
      expect(nahe(alsFloat(loesung), a / b), angabe).toBe(true);
    });
  });

  it("kommaVerschieben", () => {
    laufe(200, (r) => K.kommaVerschieben(r, { stufen: [10, 100, 1000], nachkommaMax: 3, ganzMax: 40 }), (_k, angabe, loesung) => {
      const m = new RegExp(`^(${DEZ_ZAHL}) ([*/])(\\d+) =$`).exec(angabe)!;
      expect(m, angabe).not.toBeNull();
      const wert = alsFloat(m[1]);
      const stufe = Number(m[3]);
      const erwartet = m[2] === "*" ? wert * stufe : wert / stufe;
      expect(nahe(alsFloat(loesung), erwartet), angabe).toBe(true);
    });
  });

  it("dezimalRunden", () => {
    laufe(200, (r) => K.dezimalRunden(r, { stellen: ["einer", "zehntel", "hundertstel"], nachkommaMax: 3, ganzMax: 30 }), (_k, angabe, loesung) => {
      const m = new RegExp(`^(${DEZ_ZAHL}) auf (den Einer|das Zehntel|das Hundertstel) runden =$`).exec(angabe)!;
      expect(m, angabe).not.toBeNull();
      const wert = alsFloat(m[1]);
      const faktor = m[2] === "den Einer" ? 1 : m[2] === "das Zehntel" ? 10 : 100;
      expect(nahe(alsFloat(loesung), Math.round(wert * faktor) / faktor), angabe).toBe(true);
    });
  });

  it("dezimalOrdnen", () => {
    laufe(200, (r) => K.dezimalOrdnen(r, { anzahl: 4, nachkommaMax: 2, ganzMax: 30 }), (_k, angabe, loesung) => {
      const m = /^Der Größe nach ordnen: (.+)$/.exec(angabe)!;
      expect(m, angabe).not.toBeNull();
      const werte = m[1].split("; ").map(alsFloat);
      const sortiert = [...werte].sort((a, b) => a - b);
      const gelesen = loesung.split("; ").map(alsFloat);
      expect(gelesen).toEqual(sortiert);
    });
  });
});

/* ================================================================== */
/* Teilbarkeit                                                          */
/* ================================================================== */

function teilerT(n: number): number[] {
  const t: number[] = [];
  for (let i = 1; i <= n; i++) if (n % i === 0) t.push(i);
  return t;
}
function primfaktorenT(n: number): number[] {
  const f: number[] = [];
  let rest = n;
  for (let t = 2; t * t <= rest; t++) while (rest % t === 0) { f.push(t); rest /= t; }
  if (rest > 1) f.push(rest);
  return f;
}

describe("Teilbarkeit", () => {
  it("teilermenge", () => {
    laufe(200, (r) => K.teilermenge(r, { min: 12, max: 100 }), (_k, angabe, loesung) => {
      const m = /^T\((\d+)\) =$/.exec(angabe)!;
      const n = Number(m[1]);
      expect(loesung).toBe(`{${teilerT(n).join("; ")}}`);
    });
  });

  it("vielfachenmenge", () => {
    laufe(200, (r) => K.vielfachenmenge(r, { min: 2, max: 20, anzahlMax: 8 }), (_k, angabe, loesung) => {
      const m = /^V\((\d+)\) bis (\d+) =$/.exec(angabe)!;
      const n = Number(m[1]), schranke = Number(m[2]);
      const v: number[] = [];
      for (let k = n; k <= schranke; k += n) v.push(k);
      expect(loesung).toBe(`{${v.join("; ")}}`);
    });
  });

  it("teilbarkeitsregel: Ja/Nein stimmt", () => {
    laufe(200, (r) => K.teilbarkeitsregel(r, { regeln: [2, 3, 4, 5, 9, 10, 25], max: 1000 }), (_k, angabe, loesung) => {
      const m = /^Ist (\d+) durch (\d+) teilbar\?$/.exec(angabe)!;
      const n = Number(m[1]), d = Number(m[2]);
      expect(loesung).toBe(n % d === 0 ? "ja" : "nein");
    });
  });

  it("primfaktoren: Produkt ergibt wieder die Zahl, alle Faktoren prim", () => {
    laufe(200, (r) => K.primfaktoren(r, { min: 12, max: 200 }), (_k, angabe, loesung) => {
      const m = /^(\d+) in Primfaktoren zerlegen =$/.exec(angabe)!;
      const n = Number(m[1]);
      const faktoren = loesung.split(" *").map(Number);
      expect(faktoren.reduce((a, b) => a * b, 1)).toBe(n);
      for (const f of faktoren) expect(primfaktorenT(f)).toEqual([f]);
      expect(faktoren).toEqual(primfaktorenT(n));
    });
  });

  it("ggtKgv: zwei und drei Zahlen", () => {
    for (const anzahl of [2, 3] as const) {
      laufe(200, (r) => K.ggtKgv(r, { anzahl, max: 100 }), (_k, angabe, loesung) => {
        const m = /^(ggT|kgV)\(([\d; ]+)\) =$/.exec(angabe)!;
        const zahlen = m[2].split("; ").map(Number);
        const erwartet = m[1] === "ggT" ? zahlen.reduce((a, b) => ggTt(a, b)) : zahlen.reduce((a, b) => kgVt(a, b));
        expect(loesung).toBe(String(erwartet));
      });
    }
  });
});

/* ================================================================== */
/* Prozent                                                               */
/* ================================================================== */

describe("Prozent", () => {
  it("prozentRechnung: Prozentwert gesucht", () => {
    laufe(200, (r) => K.prozentRechnung(r, { gesucht: "prozentwert", grundwertMax: 5000 }), (_k, angabe, loesung) => {
      const m = /^(\d+) % von (\d+) =$/.exec(angabe)!;
      const [, satz, grundwert] = m.map(Number) as unknown as number[];
      expect(alsFloat(loesung)).toBe(Math.round((grundwert * satz) / 100));
    });
  });

  it("prozentRechnung: Grundwert gesucht", () => {
    laufe(200, (r) => K.prozentRechnung(r, { gesucht: "grundwert", grundwertMax: 5000 }), (_k, angabe, loesung) => {
      const m = new RegExp(`^(\\d+) sind (\\d+) % von \\${LUECKE}$`).exec(angabe)!;
      const [, wert, satz] = m.map(Number) as unknown as number[];
      const grundwert = Number(loesung);
      expect(Math.round((grundwert * satz) / 100)).toBe(wert);
    });
  });

  it("prozentRechnung: Prozentsatz gesucht", () => {
    laufe(200, (r) => K.prozentRechnung(r, { gesucht: "prozentsatz", grundwertMax: 5000 }), (_k, angabe, loesung) => {
      const m = /^(\d+) von (\d+) sind wie viel %\?$/.exec(angabe)!;
      const [, wert, grundwert] = m.map(Number) as unknown as number[];
      const lm = /^(\d+) %$/.exec(loesung)!;
      expect(Math.round((grundwert * Number(lm[1])) / 100)).toBe(wert);
    });
  });

  it("prozentImKopf", () => {
    laufe(200, (r) => K.prozentImKopf(r, { grundwertMax: 5000, teilbarkeit: 100 }), (_k, angabe, loesung) => {
      const m = /^(\d+) % von (\d+) =$/.exec(angabe)!;
      const [, satz, grundwert] = m.map(Number) as unknown as number[];
      expect(nahe(alsFloat(loesung), (grundwert * satz) / 100)).toBe(true);
    });
  });

  it("zinsen", () => {
    laufe(200, (r) => K.zinsen(r, { kapitalMax: 20000, satzMax: 5 }), (_k, angabe, loesung) => {
      const m = /^(\d+) zu (\d+) % Zinsen für (.+) =$/.exec(angabe)!;
      const kapital = Number(m[1]), satz = Number(m[2]);
      const jahre = m[3] === "1 Jahr" ? 1 : Number(/^(\d+) Jahre$/.exec(m[3])![1]);
      const erwartet = Math.round(((kapital * satz) / 100) * jahre * 100) / 100;
      expect(nahe(alsFloat(loesung), erwartet)).toBe(true);
    });
  });

  it("zinseszins", () => {
    laufe(200, (r) => K.zinseszins(r, { kapitalMax: 20000, satzMax: 5, jahreMax: 10 }), (_k, angabe, loesung) => {
      // ★★★ Gefragt ist der Änderungsfaktor und die RECHNUNG, nie der
      // ausgerechnete Endwert - der gehört in den Rechner (Johannes, 23.09.).
      const m = /^(\d+) zu (\d+) % Zinseszins, (\d+) Jahre\.$/.exec(angabe.split("\n")[0])!;
      expect(m, angabe).not.toBeNull();
      const [, sk, ss, sj] = m;
      const faktor = (1 + Number(ss) / 100).toFixed(2).replace(".", ",");
      expect([`${sk} *${faktor}^${sj}`, sj], angabe).toContain(loesung);
    });
  });
});

/* ================================================================== */
/* Negative Zahlen                                                      */
/* ================================================================== */

describe("Negative Zahlen", () => {
  it("ganzeZahlRechnung: plus/minus", () => {
    laufe(200, (r) => K.ganzeZahlRechnung(r, { min: 1, max: 200, operationen: ["plus", "minus"] }), (_k, angabe, loesung) => {
      const m = /^(-?\d+) ([+-])\(?(-?\d+)\)?( =)$/.exec(angabe.replace(" =", " ="))!;
      expect(m, angabe).not.toBeNull();
      const a = Number(m[1]), op = m[2], b = Number(m[3]);
      const erwartet = op === "+" ? a + b : a - b;
      expect(Number(loesung)).toBe(erwartet);
      expect(angabe.includes("+-"), angabe).toBe(false);
      expect(angabe.includes("--"), angabe).toBe(false);
    });
  });

  it("ganzeZahlRechnung: mal/geteilt, alle Vorzeichenkombinationen", () => {
    const gesehen = new Set<string>();
    laufe(400, (r) => K.ganzeZahlRechnung(r, { min: 1, max: 20, operationen: ["mal", "geteilt"] }), (_k, angabe, loesung) => {
      const m = /^(-?\d+) ([*/])\(?(-?\d+)\)?=$/.exec(angabe.replace(" =", "="))!;
      expect(m, angabe).not.toBeNull();
      const a = Number(m[1]), op = m[2], b = Number(m[3]);
      gesehen.add(`${a < 0 ? "-" : "+"}${op}${b < 0 ? "-" : "+"}`);
      const erwartet = op === "*" ? a * b : a / b;
      expect(Number(loesung)).toBe(erwartet);
      expect(angabe.includes("+-"), angabe).toBe(false);
      expect(angabe.includes("--"), angabe).toBe(false);
    });
    // alle vier Vorzeichenkombinationen sollten bei 400 Läufen vorkommen
    expect(gesehen.size, [...gesehen].join(", ")).toBeGreaterThanOrEqual(4);
  });

  it("betragGegenzahl", () => {
    laufe(200, (r) => K.betragGegenzahl(r, { min: 1, max: 100 }), (_k, angabe, loesung) => {
      const betrag = /^\|(-?\d+)\| =$/.exec(angabe);
      if (betrag) {
        expect(Number(loesung)).toBe(Math.abs(Number(betrag[1])));
        return;
      }
      const m = /^Gegenzahl von (-?\d+) =$/.exec(angabe)!;
      expect(Number(loesung)).toBe(-Number(m[1]));
    });
  });

  it("zahlenOrdnen", () => {
    laufe(200, (r) => K.zahlenOrdnen(r, { anzahl: 4, min: 1, max: 50 }), (_k, angabe, loesung) => {
      const m = /^Der Größe nach ordnen: (.+)$/.exec(angabe)!;
      const werte = m[1].split("; ").map(Number);
      const sortiert = [...werte].sort((a, b) => a - b);
      expect(loesung.split("; ").map(Number)).toEqual(sortiert);
    });
  });
});

/* ================================================================== */
/* Potenzen und Wurzeln                                                  */
/* ================================================================== */

describe("Potenzen und Wurzeln", () => {
  it("potenz: auch negative Basis", () => {
    laufe(200, (r) => K.potenz(r, { basisMin: 1, basisMax: 12, exponentMin: 1, exponentMax: 4, negativErlaubt: true }), (_k, angabe, loesung) => {
      const m = /^\(?(-?\d+)\)?\^(\d+) =$/.exec(angabe)!;
      const basis = Number(m[1]), exponent = Number(m[2]);
      expect(Number(loesung)).toBe(Math.pow(basis, exponent));
    });
  });

  it("potenzRegel: Produkt, Quotient, Potenz einer Potenz", () => {
    laufe(200, (r) => K.potenzRegel(r, { basisMin: 2, basisMax: 9, exponentMax: 5 }), (_k, angabe, loesung) => {
      const produkt = /^(\d+)\^(\d+) \*\1\^(\d+) =$/.exec(angabe);
      if (produkt) {
        expect(loesung).toBe(`${produkt[1]}^${Number(produkt[2]) + Number(produkt[3])}`);
        return;
      }
      const quotient = /^(\d+)\^(\d+) \/\1\^(\d+) =$/.exec(angabe);
      if (quotient) {
        expect(loesung).toBe(`${quotient[1]}^${Number(quotient[2]) - Number(quotient[3])}`);
        return;
      }
      const potvpot = /^\((\d+)\^(\d+)\)\^(\d+) =$/.exec(angabe)!;
      expect(loesung).toBe(`${potvpot[1]}^${Number(potvpot[2]) * Number(potvpot[3])}`);
    });
  });

  it("zehnerpotenz: gross und klein", () => {
    laufe(200, (r) => K.zehnerpotenz(r, { exponentMin: 1, exponentMax: 6 }), (_k, angabe, loesung) => {
      const m = /^10\^(-?\d+) =$/.exec(angabe)!;
      const exponent = Number(m[1]);
      const erwartet = exponent >= 0 ? String(Math.pow(10, exponent)) : zahl(Math.pow(10, exponent), Math.abs(exponent));
      expect(loesung).toBe(erwartet);
    });
  });

  it("quadratwurzel: ganzzahlig und Näherung", () => {
    laufe(200, (r) => K.quadratwurzel(r, { radikandMax: 625, naeherung: true }), (_k, angabe, loesung) => {
      const genau = /^'w\((\d+)\) =$/.exec(angabe);
      if (genau) {
        const radikand = Number(genau[1]);
        const wurzel = Math.round(Math.sqrt(radikand));
        expect(wurzel * wurzel).toBe(radikand);
        expect(Number(loesung)).toBe(wurzel);
        return;
      }
      // ★★★ Eine Näherung ist eine GANZE Zahl - im Kopf lösbar, nicht im
      // Rechner (Johannes, 23.09.2026).
      const naeh = /^'w\((\d+)\) rund auf ganze Zahlen =$/.exec(angabe)!;
      expect(naeh, angabe).not.toBeNull();
      expect(Number(loesung)).toBe(Math.round(Math.sqrt(Number(naeh[1]))));
    });
  });

  it("kubikwurzel", () => {
    laufe(200, (r) => K.kubikwurzel(r, { radikandMax: 1000 }), (_k, angabe, loesung) => {
      const m = /^'w\[3\]\((\d+)\) =$/.exec(angabe)!;
      const radikand = Number(m[1]);
      const wurzel = Number(loesung);
      expect(wurzel * wurzel * wurzel).toBe(radikand);
    });
  });

  it("teilweisesWurzelziehen", () => {
    laufe(200, (r) => K.teilweisesWurzelziehen(r, { radikandMax: 500 }), (_k, angabe, loesung) => {
      const m = /^'w\((\d+)\) =$/.exec(angabe)!;
      const radikand = Number(m[1]);
      const lm = /^(\d+) \*'w\((\d+)\)$/.exec(loesung)!;
      const vorFaktor = Number(lm[1]), rest = Number(lm[2]);
      expect(vorFaktor * vorFaktor * rest).toBe(radikand);
    });
  });
});

/* ================================================================== */
/* Terme und Vorrang                                                    */
/* ================================================================== */

function bewerteT(zahlen: number[], ops: string[], klammerBis?: number): number {
  const z = zahlen.slice(), o = ops.slice();
  if (klammerBis) {
    let acc = z[0];
    for (let i = 0; i < klammerBis; i++) acc = anwendenT(acc, o[i], z[i + 1]);
    z.splice(0, klammerBis + 1, acc);
    o.splice(0, klammerBis);
  }
  for (let i = 0; i < o.length; ) {
    if (o[i] === "*" || o[i] === "/") { z[i] = anwendenT(z[i], o[i], z[i + 1]); z.splice(i + 1, 1); o.splice(i, 1); }
    else i++;
  }
  let erg = z[0];
  for (let i = 0; i < o.length; i++) erg = anwendenT(erg, o[i], z[i + 1]);
  return erg;
}
function anwendenT(a: number, op: string, b: number): number {
  return op === "+" ? a + b : op === "-" ? a - b : op === "*" ? a * b : a / b;
}

/**
 * Zerlegt eine Vorrang-Zeile wie "7 -5 +10 =" in Zahlen und Operatoren.
 * Das Format hat genau EIN Leerzeichen vor jedem Rechenzeichen und keines
 * danach - ein Regex allein kann „-5" (negative Zahl) und „ -5" (Minus als
 * Rechenzeichen vor 5) nicht auseinanderhalten. Deshalb wird an den
 * Leerzeichen gesplittet: das erste Zeichen jedes Folgeteils ist immer das
 * Rechenzeichen, der Rest die Zahl.
 */
function zerlegeVorrang(zeile: string): { zahlen: number[]; ops: string[] } {
  const parseZahlToken = (t: string) => (t.includes("^") ? Math.pow(Number(t.split("^")[0]), 2) : Number(t));
  const teile = zeile.replace(/ =$/, "").split(" ");
  const zahlen = [parseZahlToken(teile[0])];
  const ops: string[] = [];
  for (let i = 1; i < teile.length; i++) {
    ops.push(teile[i][0]);
    zahlen.push(parseZahlToken(teile[i].slice(1)));
  }
  return { zahlen, ops };
}

describe("Terme und Vorrang", () => {
  it("vorrangRechnung: ohne Klammer, Punkt vor Strich", () => {
    laufe(200, (r) => K.vorrangRechnung(r, { glieder: 3, zahlMax: 15 }), (_k, angabe, loesung) => {
      const { zahlen, ops } = zerlegeVorrang(angabe);
      expect(Number(loesung)).toBe(bewerteT(zahlen, ops));
    });
  });

  it("vorrangRechnung: mit Potenzen", () => {
    laufe(200, (r) => K.vorrangRechnung(r, { glieder: 4, zahlMax: 10, mitPotenzen: true }), (_k, angabe, loesung) => {
      const { zahlen, ops } = zerlegeVorrang(angabe.replace("(", "").replace(")", ""));
      expect(Number(loesung)).toBe(bewerteT(zahlen, ops));
    });
  });

  it("vorrangRechnung: Paare mit denselben Zahlen, einmal mit, einmal ohne Klammer", () => {
    laufe(200, (r) => K.vorrangRechnung(r, { glieder: 3, zahlMax: 15, paar: true }), (_k, angabe, loesung) => {
      const [ersteZeile, zweiteZeile] = angabe.split("\n");
      const ohneErg = /^(.+ =)(-?\d+)$/.exec(ersteZeile)!;
      const { zahlen: z1, ops: o1 } = zerlegeVorrang(ohneErg[1]);
      expect(Number(ohneErg[2])).toBe(bewerteT(z1, o1));

      // Klammer und Rest zerlegen - dieselbe Ein-Zeichen-Regel wie in
      // zerlegeVorrang: das erste Zeichen jedes Teils nach der Klammer ist
      // das Rechenzeichen, kein Vorzeichen.
      const klammerM = /^\((.+)\)(.*) =$/.exec(zweiteZeile)!;
      const { zahlen: zi, ops: oi } = zerlegeVorrang(`${klammerM[1]} =`);
      const klammerWert = bewerteT(zi, oi);
      const restTeile = klammerM[2].trim().length ? klammerM[2].trim().split(" ") : [];
      const restOps = restTeile.map((t) => t[0]);
      const restZahlen = restTeile.map((t) => Number(t.slice(1)));
      expect(loesung).toBe(String(bewerteT([klammerWert, ...restZahlen], restOps)));
    });
  });
});

describe("Terme: Zusammenfassen, Klammer, Ausmultiplizieren, Binome", () => {
  it("termZusammenfassen: dieselbe Variable wird zusammengezogen", () => {
    laufe(200, (r) => K.termZusammenfassen(r, { variablen: ["x", "y"], gliederMax: 5, koeffMax: 9 }), (_k, angabe, loesung) => {
      const glieder = angabe.replace(/ =$/, "").match(/[+-]?\d*[a-z]/g)!;
      const summen = new Map<string, number>();
      for (const g of glieder) {
        const m = /^([+-]?\d*)([a-z])$/.exec(g)!;
        const k = m[1] === "" || m[1] === "+" ? 1 : m[1] === "-" ? -1 : Number(m[1]);
        summen.set(m[2], (summen.get(m[2]) ?? 0) + k);
      }
      const erwartet = [...summen.entries()].filter(([, k]) => k !== 0)
        .map(([v, k], i) => `${k < 0 ? "-" : i === 0 ? "" : "+"}${Math.abs(k) === 1 ? "" : Math.abs(k)}${v}`)
        .join(" ") || "0";
      expect(loesung).toBe(erwartet);
    });
  });

  it("klammerAufloesen: Minus vor der Klammer kippt jedes Vorzeichen", () => {
    laufe(200, (r) => K.klammerAufloesen(r, { gliederMax: 3, koeffMax: 9, variablen: ["x"] }), (_k, angabe, loesung) => {
      const m = /^([+-]?\d*[a-z]) -\((.+)\) =$/.exec(angabe)!;
      const vor = m[1];
      const innen = m[2].match(/[+-]?\d*[a-z]/g)!;
      const summen = new Map<string, number>();
      const vm = /^([+-]?\d*)([a-z])$/.exec(vor)!;
      const vk = vm[1] === "" || vm[1] === "+" ? 1 : vm[1] === "-" ? -1 : Number(vm[1]);
      summen.set(vm[2], vk);
      for (const g of innen) {
        const gm = /^([+-]?\d*)([a-z])$/.exec(g)!;
        const k = gm[1] === "" || gm[1] === "+" ? 1 : gm[1] === "-" ? -1 : Number(gm[1]);
        summen.set(gm[2], (summen.get(gm[2]) ?? 0) - k);
      }
      const erwartet = [...summen.entries()].filter(([, k]) => k !== 0)
        .map(([v, k], i) => `${k < 0 ? "-" : i === 0 ? "" : "+"}${Math.abs(k) === 1 ? "" : Math.abs(k)}${v}`)
        .join(" ") || "0";
      expect(loesung).toBe(erwartet);
    });
  });

  it("ausmultiplizieren: beide Richtungen passen zusammen", () => {
    laufe(200, (r) => K.ausmultiplizieren(r, { koeffMax: 9, gliederMax: 3, variablen: ["x"] }), (_k, angabe, loesung) => {
      // Egal in welche Richtung: Faktor mal Klammer muss dasselbe ergeben wie
      // die ausmultiplizierte Summe, für ein paar Testwerte von x.
      const werte = extrahiereTermPaar(angabe, loesung);
      for (const x of [1, 2, 5]) {
        expect(nahe(werteEinsetzen(werte.klammerform, x), werteEinsetzen(werte.summenform, x))).toBe(true);
      }
    });
  });

  it("binom: Binom mal Monom oder Binom mal Binom", () => {
    laufe(200, (r) => K.binom(r, { koeffMax: 9, variablen: ["x"] }), (_k, angabe, loesung) => {
      const v = angabe.match(/[a-z]/)![0];
      for (const x of [1, 2, 3, 5]) {
        expect(nahe(werteEinsetzenSeite(angabe.replace(/ =$/, ""), v, x), werteEinsetzenSeite(loesung, v, x))).toBe(true);
      }
    });
  });

  it("binomischeFormel: alle drei Formeln stimmen für Testwerte", () => {
    laufe(200, (r) => K.binomischeFormel(r, { koeffMax: 9, variable: "x" }), (_k, angabe, loesung) => {
      for (const x of [1, 2, 3, 5]) {
        expect(nahe(werteEinsetzenSeite(angabe.replace(/ =$/, ""), "x", x), werteEinsetzenSeite(loesung, "x", x))).toBe(true);
      }
    });
  });
});

/** "3x +2" bei x=Wert auswerten (eine Variable, lineare oder quadratische Glieder, auch geklammert und multipliziert). */
function werteEinsetzenSeite(seite: string, v: string, x: number): number {
  // Klammerausdrücke der Form (...)*(...) oder Faktor*(...) zuerst auflösen.
  const doppelt = /^\((.+)\) \*\((.+)\)$/.exec(seite);
  if (doppelt) return werteTermSumme(doppelt[1], v, x) * werteTermSumme(doppelt[2], v, x);
  const einfach = /^(.+?) \*\((.+)\)$/.exec(seite);
  if (einfach) return werteTermSumme(einfach[1], v, x) * werteTermSumme(einfach[2], v, x);
  const quadrat = /^\((.+)\)\^2$/.exec(seite);
  if (quadrat) return Math.pow(werteTermSumme(quadrat[1], v, x), 2);
  return werteTermSumme(seite, v, x);
}

/** Eine Summe von Gliedern wie "3x -2" oder "x^2 +2x -1" bei x=Wert auswerten. */
function werteTermSumme(summe: string, v: string, x: number): number {
  const glieder = summe.match(/[+-]?\d*[a-z](?:\^\d+)?|[+-]?\d+/g) ?? [];
  let erg = 0;
  for (const g of glieder) {
    const pot = new RegExp(`^([+-]?\\d*)${v}(?:\\^(\\d+))?$`).exec(g);
    if (pot) {
      const k = pot[1] === "" || pot[1] === "+" ? 1 : pot[1] === "-" ? -1 : Number(pot[1]);
      const p = pot[2] ? Number(pot[2]) : 1;
      erg += k * Math.pow(x, p);
    } else {
      erg += Number(g);
    }
  }
  return erg;
}

function extrahiereTermPaar(angabe: string, loesung: string): { klammerform: string; summenform: string } {
  if (angabe.includes("(")) return { klammerform: angabe.replace(/ =$/, ""), summenform: loesung };
  return { klammerform: loesung, summenform: angabe.replace(/ =$/, "") };
}
function werteEinsetzen(seite: string, x: number): number {
  return werteEinsetzenSeite(seite, "x", x);
}

/* ================================================================== */
/* Größen und Verhältnisse                                              */
/* ================================================================== */

describe("Größen und Verhältnisse", () => {
  it("verhaeltnisKuerzen", () => {
    laufe(200, (r) => K.verhaeltnisKuerzen(r, { max: 100 }), (_k, angabe, loesung) => {
      const m = /^(\d+) : (\d+) kürzen =$/.exec(angabe)!;
      const a = Number(m[1]), b = Number(m[2]);
      const g = ggTt(a, b);
      expect(loesung).toBe(`${a / g} : ${b / g}`);
    });
  });

  it("massstab", () => {
    laufe(200, (r) => K.massstab(r, { mMax: 50000 }), (_k, angabe, loesung) => {
      const bild = /^1 : (\d+); wirklich (\d+) cm; Bild =$/.exec(angabe);
      if (bild) {
        const m = Number(bild[1]), wirklich = Number(bild[2]);
        expect(loesung).toBe(`${wirklich / m} cm`);
        return;
      }
      const wirklich = /^1 : (\d+); Bild (\d+) cm; wirklich =$/.exec(angabe)!;
      const m = Number(wirklich[1]), bildCm = Number(wirklich[2]);
      expect(loesung).toBe(`${bildCm * m} cm`);
    });
  });
});

/* ================================================================== */
/* Übergreifend                                                         */
/* ================================================================== */

describe("Vergleich bleibt großzügig", () => {
  it("normal() kürzt Brüche/Dezimalzahlen in der Lösung nicht an", () => {
    expect(normal("3/4")).toBe("3/4");
    expect(normal("0,50")).toBe("0,5");
  });
});
