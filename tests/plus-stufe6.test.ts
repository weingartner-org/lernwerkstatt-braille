/**
 * Plus - Wächter für den Aufgabengenerator der Stufe 6 (Teiler, Brüche,
 * negative Zahlen, Prozent - die inhaltsreichste Stufe).
 *
 * Wie bei den Wächtern für Stufe 3/4: es wird nicht dem Generator geglaubt,
 * sondern die Angabe gelesen und selbst nachgerechnet - eigene ggT-, kgV-
 * und Bruch-Auswertung, nie `a.zahlen`.
 *
 * ★ `ZUORDNUNG_STUFE6` ist noch nicht in `ZUORDNUNG` (generator/zuordnung.ts)
 * eingehängt - dieser Test ruft die Bauarten direkt auf und baut die
 * Aufgabe selbst über `formeAufgabe`, statt `erzeugeAufgabe` zu benutzen.
 */
import { describe, expect, it } from "vitest";
import { istRichtig, normal, zahl, zufall, type Aufgabe } from "../src/lib/plus/aufgabe";
import { paket, PAKETE } from "../src/lib/plus/stoffplan";
import { formeAufgabe, RECHNENDE_FORMEN } from "../src/lib/plus/generator/formen";
import { ZUORDNUNG_STUFE6 } from "../src/lib/plus/generator/zuordnung-stufe6";

const IDS = PAKETE.filter((p) => p.id.startsWith("6-")).map((p) => p.id);

/* ------------------------------------------------------------------ */
/* Eigene, unabhängige Auswertung - nie die Bauart selbst benutzt        */
/* ------------------------------------------------------------------ */

function ggtEigen(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

function kgvEigen(a: number, b: number): number {
  return Math.abs(a * b) / ggtEigen(a, b);
}

function kuerzeEigen(z: number, n: number): [number, number] {
  if (n < 0) {
    z = -z;
    n = -n;
  }
  const g = ggtEigen(z, n);
  return [z / g, n / g];
}

/** Bruch in der Schreibweise der Bücher - eigene Nachrechnung. */
function bruchTextEigen(z: number, n: number): string {
  if (z === 0) return "0";
  const [zz, nn] = kuerzeEigen(z, n);
  const vz = zz < 0 ? "-" : "";
  const az = Math.abs(zz);
  if (nn === 1) return `${vz}${az}`;
  if (az < nn) return `${vz}${az}/${nn}`;
  const ganzzahl = Math.floor(az / nn);
  const rest = az % nn;
  return rest === 0 ? `${vz}${ganzzahl}` : `${vz}${ganzzahl} ${rest}/${nn}`;
}

function teilerVonEigen(n: number): number[] {
  const t: number[] = [];
  for (let i = 1; i <= n; i++) if (n % i === 0) t.push(i);
  return t;
}

function primfaktorenVonEigen(n: number): number[] {
  const f: number[] = [];
  let rest = n;
  for (let t = 2; t * t <= rest; t++) {
    while (rest % t === 0) {
      f.push(t);
      rest /= t;
    }
  }
  if (rest > 1) f.push(rest);
  return f;
}

/* ------------------------------------------------------------------ */
/* Läufe erzeugen                                                        */
/* ------------------------------------------------------------------ */

function bauart(paketId: string) {
  const b = ZUORDNUNG_STUFE6[paketId];
  if (!b) throw new Error(`${paketId}: keine Bauart in ZUORDNUNG_STUFE6`);
  return b;
}

/** Aufgaben für alle Arten, die es heute gibt - dieselbe Saat für Wiederholbarkeit. */
function alleAufgaben(paketId: string, proArt = 30): Aufgabe[] {
  const p = paket(paketId);
  const b = bauart(paketId);
  const arten = p.arten.filter((a) => RECHNENDE_FORMEN.includes(a));
  const rng = zufall(6060);
  const raus: Aufgabe[] = [];
  for (const art of arten) {
    for (let i = 0; i < proArt; i++) {
      const kern = b(rng);
      raus.push(formeAufgabe({ paket: paketId, art, kern, rng, nachschub: () => b(rng) }));
    }
  }
  return raus;
}

/** Simuliert "Mein Training": n Aufgaben hintereinander, mit derselben Saat. */
function einLauf(paketId: string, n: number, saat: number): Aufgabe[] {
  const p = paket(paketId);
  const b = bauart(paketId);
  const arten = p.arten.filter((a) => RECHNENDE_FORMEN.includes(a));
  const rng = zufall(saat);
  const raus: Aufgabe[] = [];
  for (let i = 0; i < n; i++) {
    const art = arten[i % arten.length];
    const kern = b(rng);
    raus.push(formeAufgabe({ paket: paketId, art, kern, rng, nachschub: () => b(rng) }));
  }
  return raus;
}

function klassifiziere6_18(angabe: string): string {
  if (angabe.startsWith("|")) return "betrag";
  if (angabe.startsWith("Gegenzahl")) return "gegenzahl";
  return "ordnen";
}

/* ------------------------------------------------------------------ */
/* Angaben lesen                                                        */
/* ------------------------------------------------------------------ */

/** `za/na +zb/nb =` oder `za/na -zb/nb =`. */
function lesePlusMinusBruch(angabe: string) {
  const m = /^(\d+)\/(\d+) ([+-])(\d+)\/(\d+) =$/.exec(angabe);
  if (!m) return null;
  return { za: Number(m[1]), na: Number(m[2]), zeichen: m[3], zb: Number(m[4]), nb: Number(m[5]) };
}

/** `za/na *zb/nb =`. */
function leseMalBruch(angabe: string) {
  const m = /^(\d+)\/(\d+) \*(\d+)\/(\d+) =$/.exec(angabe);
  if (!m) return null;
  return { za: Number(m[1]), na: Number(m[2]), zb: Number(m[3]), nb: Number(m[4]) };
}

/** `za/na /zb/nb =`. */
function leseGeteiltBruch(angabe: string) {
  const m = /^(\d+)\/(\d+) \/(\d+)\/(\d+) =$/.exec(angabe);
  if (!m) return null;
  return { za: Number(m[1]), na: Number(m[2]), zb: Number(m[3]), nb: Number(m[4]) };
}

/** `z/n *c =`. */
function leseMalNatuerlich(angabe: string) {
  const m = /^(\d+)\/(\d+) \*(\d+) =$/.exec(angabe);
  if (!m) return null;
  return { z: Number(m[1]), n: Number(m[2]), c: Number(m[3]) };
}

/** `z/n /c =`. */
function leseGeteiltNatuerlich(angabe: string) {
  const m = /^(\d+)\/(\d+) \/(\d+) =$/.exec(angabe);
  if (!m) return null;
  return { z: Number(m[1]), n: Number(m[2]), c: Number(m[3]) };
}

/** `(za/d op1 zb/d) *zc/nc =`. */
function leseVerbindung(angabe: string) {
  const m = /^\((\d+)\/(\d+) ([+-])(\d+)\/(\d+)\) \*(\d+)\/(\d+) =$/.exec(angabe);
  if (!m) return null;
  return {
    za: Number(m[1]), d1: Number(m[2]), zeichen: m[3], zb: Number(m[4]), d2: Number(m[5]),
    zc: Number(m[6]), nc: Number(m[7]),
  };
}

/** `a op(b) =` oder `a op b =`, op nur + oder -. */
function leseGemischt(angabe: string) {
  const m = /^(-?\d+) ([+-])(\(?-?\d+\)?) =$/.exec(angabe);
  if (!m) return null;
  const b = Number(m[3].replace(/[()]/g, ""));
  return { a: Number(m[1]), zeichen: m[2], b };
}

/** `satz % von grundwert =`. */
function leseProzentwert(angabe: string) {
  const m = /^(\d+) % von (\d+) =$/.exec(angabe);
  if (!m) return null;
  return { satz: Number(m[1]), grundwert: Number(m[2]) };
}

/* ------------------------------------------------------------------ */

describe("Stufe 6: 24 Pakete im Stoffplan", () => {
  it("es gibt genau die Pakete 6-01 bis 6-24", () => {
    expect(IDS).toHaveLength(24);
    expect(IDS[0]).toBe("6-01");
    expect(IDS[23]).toBe("6-24");
  });

  it.each(IDS)("Paket %s: hat eine Bauart in ZUORDNUNG_STUFE6", (id) => {
    expect(typeof ZUORDNUNG_STUFE6[id]).toBe("function");
  });

  it.each(IDS)("Paket %s: liefert Aufgaben, ohne zu werfen", (id) => {
    expect(() => alleAufgaben(id, 20)).not.toThrow();
  });

  it.each(IDS)("Paket %s: die Bauart selbst wirft nie, auch nicht ohne Form", (id) => {
    const b = bauart(id);
    const rng = zufall(1);
    for (let i = 0; i < 30; i++) expect(() => b(rng)).not.toThrow();
  });
});

describe("Jede Lösung stimmt - je Strang eigens geprüft", () => {
  /* ---- Teilbarkeit ---- */

  it("6-01 Teilermenge stimmt mit der eigenen Teilersuche überein", () => {
    for (const a of alleAufgaben("6-01")) {
      const m = /^T\((\d+)\) =$/.exec(a.angabe);
      expect(m, a.angabe).not.toBeNull();
      const n = Number(m![1]);
      expect(a.loesung).toBe(`{${teilerVonEigen(n).join("; ")}}`);
    }
  });

  it("6-02 Vielfachenmenge stimmt mit den eigenen Vielfachen überein", () => {
    for (const a of alleAufgaben("6-02")) {
      const m = /^V\((\d+)\) bis (\d+) =$/.exec(a.angabe);
      expect(m, a.angabe).not.toBeNull();
      const n = Number(m![1]);
      const schranke = Number(m![2]);
      const anzahl = schranke / n;
      expect(Number.isInteger(anzahl), a.angabe).toBe(true);
      const v = Array.from({ length: anzahl }, (_, i) => n * (i + 1));
      expect(a.loesung).toBe(`{${v.join("; ")}}`);
    }
  });

  it("6-03 Teilbarkeit durch 2, 5, 10 stimmt", () => {
    for (const a of alleAufgaben("6-03")) {
      const m = /^Ist (\d+) durch (\d+) teilbar\?$/.exec(a.angabe);
      expect(m, a.angabe).not.toBeNull();
      const [n, d] = [Number(m![1]), Number(m![2])];
      expect([2, 5, 10], a.angabe).toContain(d);
      expect(a.loesung).toBe(n % d === 0 ? "ja" : "nein");
    }
  });

  it("6-04 Teilbarkeit durch 3, 4, 9, 25 stimmt", () => {
    for (const a of alleAufgaben("6-04")) {
      const m = /^Ist (\d+) durch (\d+) teilbar\?$/.exec(a.angabe);
      expect(m, a.angabe).not.toBeNull();
      const [n, d] = [Number(m![1]), Number(m![2])];
      expect([3, 4, 9, 25], a.angabe).toContain(d);
      expect(a.loesung).toBe(n % d === 0 ? "ja" : "nein");
    }
  });

  it("6-05 Primfaktoren stimmen mit der eigenen Zerlegung überein", () => {
    for (const a of alleAufgaben("6-05")) {
      const m = /^(\d+) in Primfaktoren zerlegen =$/.exec(a.angabe);
      expect(m, a.angabe).not.toBeNull();
      const n = Number(m![1]);
      expect(a.loesung).toBe(primfaktorenVonEigen(n).join(" *"));
    }
  });

  it("6-06 ggT zweier Zahlen stimmt", () => {
    for (const a of alleAufgaben("6-06")) {
      const m = /^ggT\((\d+); (\d+)\) =$/.exec(a.angabe);
      expect(m, a.angabe).not.toBeNull();
      expect(a.loesung).toBe(String(ggtEigen(Number(m![1]), Number(m![2]))));
    }
  });

  it("6-07 kgV zweier Zahlen stimmt", () => {
    for (const a of alleAufgaben("6-07")) {
      const m = /^kgV\((\d+); (\d+)\) =$/.exec(a.angabe);
      expect(m, a.angabe).not.toBeNull();
      expect(a.loesung).toBe(String(kgvEigen(Number(m![1]), Number(m![2]))));
    }
  });

  it("6-08 ggT und kgV dreier Zahlen stimmt", () => {
    for (const a of alleAufgaben("6-08")) {
      const m = /^(ggT|kgV)\((\d+); (\d+); (\d+)\) =$/.exec(a.angabe);
      expect(m, a.angabe).not.toBeNull();
      const zahlen = [Number(m![2]), Number(m![3]), Number(m![4])];
      const erwartet = m![1] === "ggT" ? zahlen.reduce(ggtEigen) : zahlen.reduce(kgvEigen);
      expect(a.loesung).toBe(String(erwartet));
    }
  });

  it("★ 6-06 bis 6-08 bleiben im Zahlenraum 200 und sind keine Leerläufe", () => {
    // Gemessen am 23.09.2026 beim Mitlesen: `kgV(32; 33; 37) =39072` - der
    // Stoffplan sagt „0-200" - und fünfmal hintereinander ein ggT von 1.
    // Ein ggT, der fast immer 1 ist, fragt nichts ab.
    for (const id of ["6-06", "6-07", "6-08"]) {
      let ggtEins = 0, ggtAlle = 0;
      for (const a of alleAufgaben(id)) {
        const m = /^(ggT|kgV)\(([\d; ]+)\) =$/.exec(a.angabe);
        if (!m) continue;
        const zahlen = m[2].split("; ").map(Number);
        expect(new Set(zahlen).size, `${id}: ${a.angabe}`).toBe(zahlen.length);
        expect(Math.max(...zahlen), `${id}: ${a.angabe}`).toBeLessThanOrEqual(100);
        if (m[1] === "kgV") expect(zahlen.reduce(kgvEigen), `${id}: ${a.angabe}`).toBeLessThanOrEqual(200);
        if (m[1] === "ggT") { ggtAlle++; if (a.loesung === "1") ggtEins++; }
      }
      if (ggtAlle) expect(ggtEins / ggtAlle, `${id}: ggT 1 in ${ggtEins} von ${ggtAlle}`).toBeLessThanOrEqual(0.3);
    }
  });

  /* ---- Bruchrechnen ---- */

  it("6-09 Brüche addieren, gleichnamig - gleiche Nenner, Ergebnis stimmt", () => {
    for (const a of alleAufgaben("6-09")) {
      const g = lesePlusMinusBruch(a.angabe);
      expect(g, a.angabe).not.toBeNull();
      expect(g!.zeichen, a.angabe).toBe("+");
      expect(g!.na, a.angabe).toBe(g!.nb);
      expect(a.loesung).toBe(bruchTextEigen(g!.za + g!.zb, g!.na));
    }
  });

  it("6-10 Brüche addieren, ungleichnamig - Ergebnis stimmt", () => {
    for (const a of alleAufgaben("6-10")) {
      const g = lesePlusMinusBruch(a.angabe);
      expect(g, a.angabe).not.toBeNull();
      expect(g!.zeichen, a.angabe).toBe("+");
      const kgv = kgvEigen(g!.na, g!.nb);
      const zErg = g!.za * (kgv / g!.na) + g!.zb * (kgv / g!.nb);
      expect(a.loesung).toBe(bruchTextEigen(zErg, kgv));
    }
  });

  it("6-11 Brüche subtrahieren, gleichnamig - gleiche Nenner, Ergebnis stimmt", () => {
    for (const a of alleAufgaben("6-11")) {
      const g = lesePlusMinusBruch(a.angabe);
      expect(g, a.angabe).not.toBeNull();
      expect(g!.zeichen, a.angabe).toBe("-");
      expect(g!.na, a.angabe).toBe(g!.nb);
      expect(g!.za, a.angabe).toBeGreaterThanOrEqual(g!.zb);
      expect(a.loesung).toBe(bruchTextEigen(g!.za - g!.zb, g!.na));
    }
  });

  it("6-12 Brüche subtrahieren, ungleichnamig - kein negatives Zwischenergebnis, Ergebnis stimmt", () => {
    for (const a of alleAufgaben("6-12")) {
      const g = lesePlusMinusBruch(a.angabe);
      expect(g, a.angabe).not.toBeNull();
      expect(g!.zeichen, a.angabe).toBe("-");
      const kgv = kgvEigen(g!.na, g!.nb);
      const zaAuf = g!.za * (kgv / g!.na);
      const zbAuf = g!.zb * (kgv / g!.nb);
      expect(zaAuf, a.angabe).toBeGreaterThanOrEqual(zbAuf);
      expect(a.loesung).toBe(bruchTextEigen(zaAuf - zbAuf, kgv));
    }
  });

  it("6-13 Bruch mal natürliche Zahl - nur der Zähler wächst", () => {
    for (const a of alleAufgaben("6-13")) {
      const g = leseMalNatuerlich(a.angabe);
      expect(g, a.angabe).not.toBeNull();
      expect(a.loesung).toBe(bruchTextEigen(g!.z * g!.c, g!.n));
    }
  });

  it("6-14 Bruch mal Bruch - Ergebnis stimmt", () => {
    for (const a of alleAufgaben("6-14")) {
      const g = leseMalBruch(a.angabe);
      expect(g, a.angabe).not.toBeNull();
      expect(a.loesung).toBe(bruchTextEigen(g!.za * g!.zb, g!.na * g!.nb));
    }
  });

  it("6-15 Bruch geteilt durch natürliche Zahl - nur der Nenner wächst", () => {
    for (const a of alleAufgaben("6-15")) {
      const g = leseGeteiltNatuerlich(a.angabe);
      expect(g, a.angabe).not.toBeNull();
      expect(a.loesung).toBe(bruchTextEigen(g!.z, g!.n * g!.c));
    }
  });

  it("6-16 Bruch geteilt durch Bruch - über den Kehrwert, Ergebnis stimmt", () => {
    for (const a of alleAufgaben("6-16")) {
      const g = leseGeteiltBruch(a.angabe);
      expect(g, a.angabe).not.toBeNull();
      expect(a.loesung).toBe(bruchTextEigen(g!.za * g!.nb, g!.na * g!.zb));
    }
  });

  it("6-17 Verbindung der Rechenarten - Klammer zuerst, kein negatives Zwischenergebnis", () => {
    for (const a of alleAufgaben("6-17")) {
      const g = leseVerbindung(a.angabe);
      expect(g, a.angabe).not.toBeNull();
      expect(g!.d1, a.angabe).toBe(g!.d2);
      // ★ Echt größer, nicht nur gleich: `(3/5 -3/5) *4/7` ist immer 0, und
      // die Multiplikation daneben fragt nichts mehr ab. Gemessen am
      // 23.09.2026 beim Mitlesen - vier von sechs Aufgaben eines Laufs.
      if (g!.zeichen === "-") expect(g!.za, a.angabe).toBeGreaterThan(g!.zb);
      expect(a.loesung, a.angabe).not.toBe("0");
      const zwischenZ = g!.zeichen === "+" ? g!.za + g!.zb : g!.za - g!.zb;
      const [zwZ, zwN] = kuerzeEigen(zwischenZ, g!.d1);
      expect(a.loesung).toBe(bruchTextEigen(zwZ * g!.zc, zwN * g!.nc));
    }
  });

  /* ---- Negative Zahlen ---- */

  it("6-18 Negative Zahlen: Betrag, Gegenzahl und Ordnen stimmen", () => {
    for (const a of alleAufgaben("6-18")) {
      const betrag = /^\|(-?\d+)\| =$/.exec(a.angabe);
      const gegenzahl = /^Gegenzahl von (-?\d+) =$/.exec(a.angabe);
      const ordnen = /^Der Größe nach ordnen: (.+)$/.exec(a.angabe);
      if (betrag) {
        expect(a.loesung).toBe(String(Math.abs(Number(betrag[1]))));
        continue;
      }
      if (gegenzahl) {
        expect(a.loesung).toBe(String(-Number(gegenzahl[1])));
        continue;
      }
      expect(ordnen, a.angabe).not.toBeNull();
      const zahlen = ordnen![1].split("; ").map(Number);
      const sortiert = [...zahlen].sort((x, y) => x - y);
      expect(a.loesung).toBe(sortiert.join("; "));
    }
  });

  it("6-19 Plus und Minus mit ganzen Zahlen - nur + und -, Ergebnis stimmt", () => {
    for (const a of alleAufgaben("6-19")) {
      const g = leseGemischt(a.angabe);
      expect(g, a.angabe).not.toBeNull();
      expect(["+", "-"], a.angabe).toContain(g!.zeichen);
      const erwartet = g!.zeichen === "+" ? g!.a + g!.b : g!.a - g!.b;
      expect(a.loesung).toBe(String(erwartet));
    }
  });

  /* ---- Prozent ---- */

  it("6-20 Prozent im Kopf stimmt", () => {
    for (const a of alleAufgaben("6-20")) {
      const g = leseProzentwert(a.angabe);
      expect(g, a.angabe).not.toBeNull();
      expect(a.loesung).toBe(zahl((g!.grundwert * g!.satz) / 100));
    }
  });

  it("6-21 Prozentanteil berechnen stimmt", () => {
    for (const a of alleAufgaben("6-21")) {
      const g = leseProzentwert(a.angabe);
      expect(g, a.angabe).not.toBeNull();
      expect(a.loesung).toBe(String(Math.round((g!.grundwert * g!.satz) / 100)));
    }
  });

  it("6-22 Grundwert und Prozentsatz berechnen stimmt", () => {
    for (const a of alleAufgaben("6-22")) {
      const grundwertGesucht = /^(\d+) sind (\d+) % von \[\]$/.exec(a.angabe);
      const satzGesucht = /^(\d+) von (\d+) sind wie viel %\?$/.exec(a.angabe);
      if (grundwertGesucht) {
        const [wert, satz] = [Number(grundwertGesucht[1]), Number(grundwertGesucht[2])];
        expect(a.loesung).toBe(String(Math.round((wert * 100) / satz)));
        continue;
      }
      expect(satzGesucht, a.angabe).not.toBeNull();
      const [wert, grundwert] = [Number(satzGesucht![1]), Number(satzGesucht![2])];
      expect(a.loesung).toBe(`${Math.round((wert * 100) / grundwert)} %`);
    }
  });

  /* ---- 6-23 und 6-24: nur der Kern, die Form fehlt noch ---- */

  it("6-23 Wie rechnest du das?: Term, Frage und drei Wege", () => {
    // ★ Seit 23.09.2026 baut dieses Paket die Wahl selbst - die allgemeine
    // Form kann aus einem fertigen Term keine Wege ableiten, und raten wäre
    // schlimmer als gar keine Aufgabe. Die Wege prüft
    // `plus-strategiewahl.test.ts`; hier steht, was die Stufe verlangt.
    const b = bauart("6-23");
    const rng = zufall(13);
    for (let i = 0; i < 60; i++) {
      const kern = b(rng);
      expect(kern.sorte).toBe("direkt");
      if (kern.sorte !== "direkt") continue;
      const zeilen = kern.angabe.split("\n");
      expect(zeilen[1], kern.angabe).toMatch(/^Wie rechnest du das am besten\?$|^Welcher Weg passt hier nicht\?$/);
      expect(zeilen).toHaveLength(5);
      expect(["a", "b", "c"], kern.angabe).toContain(kern.loesung);
      expect(kern.eigeneArt, kern.angabe).toMatch(/strategiewahl|fehler_finden/);
    }
  });

  it("6-24 Rechengeschichten: Text, Zahlen und Lösung passen zusammen", () => {
    // ★ Seit 23.09.2026 ist das ein Text und keine nackte Rechnung mehr.
    // Die Sprachregeln und die Zeilenbreite prüft `plus-sachaufgaben.test.ts`;
    // hier steht, was für DIESE Stufe gelten muss.
    const b = bauart("6-24");
    const rng = zufall(77);
    for (let i = 0; i < 60; i++) {
      const kern = b(rng);
      expect(kern.sorte).toBe("direkt");
      if (kern.sorte !== "direkt") continue;
      expect(kern.geschichte, kern.angabe).toBe(true);
      expect(kern.angabe.trimEnd(), kern.angabe).toMatch(/\?$/);
      // Jede Zahl der Aufgabe steht auch im Text - sonst rechnet das Kind mit
      // etwas, das es nicht lesen kann.
      const imText = (kern.angabe.match(/\d+/g) ?? []).map(Number);
      for (const z of kern.zahlen) {
        if (z !== 0) expect(imText, kern.angabe).toContain(z);
      }
      const wert = Number(normal(kern.loesung.replace(/[^0-9,-]/g, "")).replace(",", "."));
      expect(Number.isFinite(wert), kern.angabe).toBe(true);
      expect(wert, kern.angabe).toBeGreaterThanOrEqual(0);
      expect(wert, kern.angabe).toBeLessThanOrEqual(1000000);
    }
  });
});

describe("Stufe 6: kein Paket multipliziert oder dividiert mit negativen Zahlen", () => {
  it("jede 'gemischt'-Aufgabe benutzt nur + oder - als Rechenzeichen (Mal/Geteilt kommen erst in Stufe 7)", () => {
    for (const id of IDS) {
      const b = bauart(id);
      const rng = zufall(9);
      for (let i = 0; i < 40; i++) {
        const kern = b(rng);
        if (kern.sorte !== "direkt" || kern.op !== "gemischt") continue;
        // Nur Beträge/Gegenzahlen (6-18) oder Plus/Minus (6-19) - beide ohne
        // Rechenzeichen *"/" in der Angabe.
        expect(kern.angabe, `${id}: ${kern.angabe}`).not.toMatch(/\*/);
        expect(kern.angabe, `${id}: ${kern.angabe}`).not.toMatch(/=\S*\/\S/);
        const g = leseGemischt(kern.angabe);
        if (g) expect(["+", "-"], `${id}: ${kern.angabe}`).toContain(g.zeichen);
      }
    }
  });
});

describe("Sonderbedingungen", () => {
  it("6-10/6-12 ungleichnamig: die Nenner haben ein sinnvolles kgV, nicht 7 und 13", () => {
    for (const id of ["6-10", "6-12"]) {
      for (const a of alleAufgaben(id, 40)) {
        const g = lesePlusMinusBruch(a.angabe);
        expect(g, a.angabe).not.toBeNull();
        expect(kgvEigen(g!.na, g!.nb), a.angabe).toBeLessThanOrEqual(36);
      }
    }
  });

  it("6-14 Bruch mal Bruch: etwa die Hälfte ist vor dem Rechnen kürzbar", () => {
    let kuerzbar = 0;
    let total = 0;
    for (const a of alleAufgaben("6-14", 60)) {
      const g = leseMalBruch(a.angabe);
      expect(g, a.angabe).not.toBeNull();
      total++;
      if (ggtEigen(g!.za, g!.nb) > 1 || ggtEigen(g!.zb, g!.na) > 1) kuerzbar++;
    }
    expect(kuerzbar, "keine kürzbare Aufgabe dabei").toBeGreaterThan(0);
    expect(total - kuerzbar, "keine unkürzbare Aufgabe dabei").toBeGreaterThan(0);
  });

  it("6-16 Bruch geteilt durch Bruch: das Ergebnis ist immer kürzbar", () => {
    for (const a of alleAufgaben("6-16", 40)) {
      const g = leseGeteiltBruch(a.angabe);
      expect(g, a.angabe).not.toBeNull();
      expect(ggtEigen(g!.za * g!.nb, g!.na * g!.zb), a.angabe).toBeGreaterThan(1);
    }
  });

  it("6-21 Prozentanteil: nur gängige Prozentsätze, keine krummen", () => {
    for (const a of alleAufgaben("6-21", 40)) {
      const g = leseProzentwert(a.angabe);
      expect(g, a.angabe).not.toBeNull();
      expect([5, 10, 20, 25, 50, 75], a.angabe).toContain(g!.satz);
    }
  });
});

describe("Die Zahlen bleiben im Rahmen", () => {
  it("keine Angabe ist länger als 40 Zeichen je Zeile (Braillezeile)", () => {
    for (const id of IDS) {
      for (const a of alleAufgaben(id, 15)) {
        for (const zeile of a.angabe.split("\n")) {
          expect(zeile.length, `${id}: "${zeile}" (${zeile.length})`).toBeLessThanOrEqual(40);
        }
      }
    }
  });

  it("benutzt den gewöhnlichen Bindestrich, nie das typografische Minus", () => {
    for (const id of IDS) {
      for (const a of alleAufgaben(id, 15)) {
        expect(a.angabe, id).not.toContain("−");
        expect(a.loesung, id).not.toContain("−");
      }
    }
  });

  it("schreibt Zahlen mit Komma, nie mit Punkt, und ohne Tausendertrennzeichen", () => {
    for (const id of IDS) {
      for (const a of alleAufgaben(id, 15)) {
        expect(a.angabe, id).not.toMatch(/\d\.\d/);
        expect(a.loesung, id).not.toMatch(/\d\.\d/);
        expect(a.angabe, id).not.toMatch(/\d{1,3}(,\d{3})+\b/);
      }
    }
  });

  it("jede Antwort wird von istRichtig auch beim eigenen Wortlaut akzeptiert", () => {
    for (const id of IDS) {
      for (const a of alleAufgaben(id, 10)) {
        expect(istRichtig(a.loesung, a), `${id}: ${a.angabe} -> ${a.loesung}`).toBe(true);
      }
    }
  });

  it("die Antwort normalisiert sich zu sich selbst (normal ist stabil)", () => {
    for (const id of IDS) {
      for (const a of alleAufgaben(id, 10)) {
        expect(normal(normal(a.loesung)), id).toBe(normal(a.loesung));
      }
    }
  });
});

describe("Ein Lauf bleibt abwechslungsreich", () => {
  it("6-18: 12 Aufgaben zeigen mindestens drei Fragestellungen (Betrag, Gegenzahl, Ordnen)", () => {
    const typen = new Set(einLauf("6-18", 12, 2026).map((a) => klassifiziere6_18(a.angabe)));
    expect(typen.size, [...typen].join(", ")).toBeGreaterThanOrEqual(3);
  });

  it("jede Fassung ist für sich richtig - auch innerhalb desselben Laufs", () => {
    // 6-23 und 6-24 haben noch keine gebaute Form (siehe oben) - ein Lauf
    // wäre für sie leer, `einLauf` würde aber ohne Art nicht durchlaufen.
    for (const id of IDS.filter((i) => i !== "6-23" && i !== "6-24")) {
      for (const a of einLauf(id, 12, 2026)) {
        expect(istRichtig(a.loesung, a), `${id}: ${a.angabe} -> ${a.loesung}`).toBe(true);
      }
    }
  });
});
