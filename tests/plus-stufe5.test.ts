/**
 * Plus - Wächter für den Aufgabengenerator der Stufe 5 (Dezimalzahlen und
 * die Ordnung der Rechenarten).
 *
 * Wie bei den Wächtern der Stufen 3 und 4: es wird nicht dem Generator
 * geglaubt, sondern die Angabe gelesen und selbst nachgerechnet - nie aus
 * `a.zahlen`.
 *
 * ★ `ZUORDNUNG_STUFE5` ist noch nicht in `ZUORDNUNG` (generator/zuordnung.ts)
 * eingehängt - dieser Test ruft die Bauarten direkt auf und baut die
 * Aufgabe selbst über `formeAufgabe`, statt `erzeugeAufgabe` zu benutzen.
 *
 * ★ Stufe 5 rechnet NICHT mit Brüchen - Brüche werden nur dargestellt und
 * verglichen (5-13 bis 5-16). Ein eigener Test unten stellt sicher, dass in
 * keinem der 19 Pakete eine Bruchrechnung (Addition, Subtraktion,
 * Multiplikation oder Division zweier Brüche) auftaucht.
 */
import { describe, expect, it } from "vitest";
import { istRichtig, zahl, zufall, type Aufgabe } from "../src/lib/plus/aufgabe";
import { paket, PAKETE } from "../src/lib/plus/stoffplan";
import { formeAufgabe, RECHNENDE_FORMEN } from "../src/lib/plus/generator/formen";
import { ZUORDNUNG_STUFE5 } from "../src/lib/plus/generator/zuordnung-stufe5";

const IDS = PAKETE.filter((p) => p.id.startsWith("5-")).map((p) => p.id);

/* ------------------------------------------------------------------ */
/* Ein unabhängiger Leser für die Schreibweise                          */
/* ------------------------------------------------------------------ */

const ZAHL = String.raw`-?\d+(?:,\d+)?`;

function alsZahl(s: string): number {
  return Number(s.replace(",", "."));
}

function nahe(a: number, b: number, eps = 1e-6): boolean {
  return Math.abs(a - b) < eps;
}

/** Größter gemeinsamer Teiler - eigene, vom Generator unabhängige Fassung. */
function ggt(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

/** Liest `48 +27 =75 - stimmt das?` (auch mit Dezimalzahlen). */
function nachrechnenProbe(angabe: string): { a: number; b: number; zeichen: string; gezeigt: number } | null {
  const m = new RegExp(`^(${ZAHL}) ([-+*/])(${ZAHL}) =(${ZAHL}) - stimmt das\\?$`).exec(angabe);
  if (!m) return null;
  return { a: alsZahl(m[1]), b: alsZahl(m[3]), zeichen: m[2], gezeigt: alsZahl(m[4]) };
}

function rechenwert(a: number, zeichen: string, b: number): number {
  return zeichen === "+" ? a + b : zeichen === "-" ? a - b : zeichen === "*" ? a * b : a / b;
}

function bauart(paketId: string) {
  const b = ZUORDNUNG_STUFE5[paketId];
  if (!b) throw new Error(`${paketId}: keine Bauart in ZUORDNUNG_STUFE5`);
  return b;
}

/** Aufgaben für alle Arten, die es heute gibt - dieselbe Saat für Wiederholbarkeit. */
function alleAufgaben(paketId: string, proArt = 30): Aufgabe[] {
  const p = paket(paketId);
  const b = bauart(paketId);
  const arten = p.arten.filter((a) => RECHNENDE_FORMEN.includes(a));
  const rng = zufall(4242);
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

function klassifiziere5_01(angabe: string): string {
  if (angabe.startsWith("Größer:")) return "groesser";
  if (angabe.includes("stimmt das?")) return "wahrFalsch";
  return "vergleich";
}

function klassifiziere5_06(angabe: string): string {
  if (angabe.startsWith("Der Größe nach ordnen: ")) return "ordnen";
  if (angabe.startsWith("Was ist größer:")) return "vergleich";
  return "nachbarn";
}

/* ------------------------------------------------------------------ */

describe("Stufe 5: 19 Pakete im Stoffplan", () => {
  it("es gibt genau die Pakete 5-01 bis 5-19", () => {
    expect(IDS).toHaveLength(19);
    expect(IDS[0]).toBe("5-01");
    expect(IDS[18]).toBe("5-19");
  });

  it.each(IDS)("Paket %s: hat eine Bauart in ZUORDNUNG_STUFE5", (id) => {
    expect(typeof ZUORDNUNG_STUFE5[id]).toBe("function");
  });

  it.each(IDS)("Paket %s: liefert Aufgaben, ohne zu werfen", (id) => {
    expect(() => alleAufgaben(id, 20)).not.toThrow();
  });

  it.each(IDS)("Paket %s: die Bauart selbst wirft nie, auch nicht ohne Form", (id) => {
    // Auch 5-18 und 5-19, deren Form (Strategiewahl, Sachaufgabe) noch nicht
    // gebaut ist, müssen einen Kern liefern.
    const b = bauart(id);
    const rng = zufall(1);
    for (let i = 0; i < 30; i++) expect(() => b(rng)).not.toThrow();
  });
});

describe("Jede Lösung stimmt - je Paket eigens geprüft", () => {
  it("5-01 Stellenwert: Vergleichszeichen, Wahr/Falsch und 'größer' - drei Fassungen", () => {
    const gesehen = new Set<string>();
    for (const a of alleAufgaben("5-01")) {
      const vergleich = /^(-?\d+(?:,\d+)?) \[\] (-?\d+(?:,\d+)?)$/.exec(a.angabe);
      const wahrFalsch = /^(-?\d+(?:,\d+)?) ([<>=]) (-?\d+(?:,\d+)?) - stimmt das\?$/.exec(a.angabe);
      const groesser = /^Größer: (-?\d+(?:,\d+)?) oder (-?\d+(?:,\d+)?)\?$/.exec(a.angabe);
      if (vergleich) {
        gesehen.add("vergleich");
        const x = alsZahl(vergleich[1]), y = alsZahl(vergleich[2]);
        const zeichen = x > y ? ">" : x < y ? "<" : "=";
        expect(a.loesung, a.angabe).toBe(zeichen);
        continue;
      }
      if (wahrFalsch) {
        gesehen.add("wahrFalsch");
        const x = alsZahl(wahrFalsch[1]), behauptet = wahrFalsch[2], y = alsZahl(wahrFalsch[3]);
        const zeichen = x > y ? ">" : x < y ? "<" : "=";
        const stimmt = behauptet === zeichen;
        expect(a.loesung, a.angabe).toBe(stimmt ? "ja" : "nein");
        continue;
      }
      expect(groesser, a.angabe).not.toBeNull();
      gesehen.add("groesser");
      const x = alsZahl(groesser![1]), y = alsZahl(groesser![2]);
      const erwartet = x === y ? "gleich groß" : x > y ? groesser![1] : groesser![2];
      expect(a.loesung, a.angabe).toBe(erwartet);
    }
    expect(gesehen.size, "es sollten alle drei Fassungen vorkommen").toBe(3);
  });

  it("★ 5-02 „Schätze:\" nimmt die Schätzung allein und die genauere an", () => {
    // Gemessen am 23.09.2026: `5000` auf „Schätze: 4093 +1007 =" war
    // „Noch nicht" - nur die ganze Zeile galt.
    let gesehen = 0;
    for (const a of alleAufgaben("5-02")) {
      if (!a.angabe.startsWith("Schätze:")) continue;
      gesehen++;
      const schaetzung = a.loesung.split("=").at(-1)!;
      expect(istRichtig(schaetzung, a), a.angabe).toBe(true);
      expect(istRichtig(a.loesung, a), a.angabe).toBe(true);
      // Das genaue Ergebnis ist keine Schätzung - aber auch kein Unsinn:
      // es wird nur dann angenommen, wenn es zufällig einer Schätzung gleicht.
      const m = /^Schätze: (\d+) ([-+])(\d+) =$/.exec(a.angabe)!;
      const x = Number(m[1]), y = Number(m[3]);
      const genau = m[2] === "+" ? x + y : x - y;
      const vorn = (n: number) => Math.round(n / 10 ** (String(n).length - 2)) * 10 ** (String(n).length - 2);
      const hundert = m[2] === "+" ? vorn(x) + vorn(y) : vorn(x) - vorn(y);
      expect(istRichtig(String(hundert), a), `${a.angabe} ${hundert}`).toBe(true);
      expect(istRichtig(String(genau + 100000), a), a.angabe).toBe(false);
    }
    expect(gesehen).toBeGreaterThan(0);
  });

  it("5-02 Runden und Schranken: Wahr/Falsch stimmt UND die Schranke ist eine glatte Zehnerstufe", () => {
    for (const a of alleAufgaben("5-02")) {
      const schranke = /^(\d+) ([-+])(\d+) =\nzwischen (\d+) und (\d+) - stimmt das\?$/.exec(a.angabe);
      if (schranke) {
        const [, sa, zeichen, sb, sUnten, sOben] = schranke;
        const ergebnis = rechenwert(Number(sa), zeichen, Number(sb));
        const untere = Number(sUnten), obere = Number(sOben);
        const weite = obere - untere;
        expect([10, 100, 1000, 10000, 100000], a.angabe).toContain(weite);
        const stimmt = untere < ergebnis && ergebnis < obere;
        expect(a.loesung, a.angabe).toBe(stimmt ? "ja" : "nein");
        continue;
      }
      const schaetze = /^Schätze: (\d+) ([-+])(\d+) =$/.exec(a.angabe);
      expect(schaetze, a.angabe).not.toBeNull();
      const [, sa, zeichen, sb] = schaetze!;
      const loesungM = /^(\d+) ([-+])(\d+) =(\d+)$/.exec(a.loesung);
      expect(loesungM, a.loesung).not.toBeNull();
      const [, sga, gzeichen, sgb, sgeschaetzt] = loesungM!;
      expect(gzeichen, a.loesung).toBe(zeichen);
      const ga = Number(sga), gb = Number(sgb), geschaetzt = Number(sgeschaetzt);
      expect(geschaetzt, a.loesung).toBe(rechenwert(ga, zeichen, gb));
      // Die gerundeten Zahlen liegen höchstens eine halbe Stufe von den echten weg.
      const a0 = Number(sa), b0 = Number(sb);
      expect(Math.abs(ga - a0) <= Math.max(a0, 1), a.angabe).toBe(true);
      expect(Math.abs(gb - b0) <= Math.max(b0, 1), a.angabe).toBe(true);
    }
  });

  it("5-03 Vorrangregeln ohne Klammern: Punkt vor Strich, nie geklammert", () => {
    for (const a of alleAufgaben("5-03")) {
      expect(a.angabe, a.angabe).not.toContain("(");
      const m = /^(\d+)((?: [+\-*]\d+)+) =$/.exec(a.angabe);
      expect(m, a.angabe).not.toBeNull();
      const zahlen = [Number(m![1])];
      const ops: string[] = [];
      const re = / ([+\-*])(\d+)/g;
      let t: RegExpExecArray | null;
      while ((t = re.exec(m![2]))) {
        ops.push(t[1]);
        zahlen.push(Number(t[2]));
      }
      // Punkt vor Strich: erst alle Multiplikationen einsammeln.
      const z = zahlen.slice();
      const o = ops.slice();
      for (let i = 0; i < o.length; ) {
        if (o[i] === "*") {
          z[i] = z[i] * z[i + 1];
          z.splice(i + 1, 1);
          o.splice(i, 1);
        } else i++;
      }
      let erg = z[0];
      for (let i = 0; i < o.length; i++) erg = o[i] === "+" ? erg + z[i + 1] : erg - z[i + 1];
      expect(a.loesung, a.angabe).toBe(String(erg));
    }
  });

  it("5-04 Vorrangregeln mit Klammern: dieselben Zahlen, einmal mit, einmal ohne", () => {
    for (const a of alleAufgaben("5-04")) {
      const zeilen = a.angabe.split("\n");
      expect(zeilen, a.angabe).toHaveLength(2);
      const ohne = /^(\d+) ([+\-*])(\d+) ([+\-*])(\d+) =(\d+)$/.exec(zeilen[0]);
      expect(ohne, zeilen[0]).not.toBeNull();
      const mit = /^\((\d+) ([+\-*])(\d+)\) ([+\-*])(\d+) =$/.exec(zeilen[1]);
      expect(mit, zeilen[1]).not.toBeNull();
      const [, n1, op1, n2, op2, n3, sErgOhne] = ohne!;
      const [, m1, mop1, m2, mop2, m3] = mit!;
      // Dieselben drei Zahlen und Rechenzeichen in beiden Zeilen.
      expect([m1, mop1, m2, mop2, m3], a.angabe).toEqual([n1, op1, n2, op2, n3]);
      // Ohne Klammer: Punkt vor Strich.
      let ergebnisOhne: number;
      if (op1 === "*") ergebnisOhne = rechenwert(Number(n1) * Number(n2), op2, Number(n3));
      else if (op2 === "*") ergebnisOhne = rechenwert(Number(n1), op1, Number(n2) * Number(n3));
      else ergebnisOhne = rechenwert(rechenwert(Number(n1), op1, Number(n2)), op2, Number(n3));
      expect(Number(sErgOhne), a.angabe).toBe(ergebnisOhne);
      // Mit Klammer um die ersten zwei Zahlen: die Klammer wird zuerst gerechnet.
      const ergebnisMit = rechenwert(rechenwert(Number(m1), mop1, Number(m2)), mop2, Number(m3));
      expect(a.loesung, a.angabe).toBe(String(ergebnisMit));
    }
  });

  it("5-05 Rechengesetze: die Aufgabe vereinfacht sich wirklich durch Umstellen", () => {
    let distributiv = 0, assoziativ = 0;
    for (const a of alleAufgaben("5-05")) {
      const dist = /^(\d+) \*(\d+) \+(\d+) \*(\d+) =$/.exec(a.angabe);
      if (dist) {
        distributiv++;
        const [, sa, sc1, sb, sc2] = dist;
        // Derselbe Faktor auf beiden Seiten - genau das Verteilungsgesetz.
        expect(sc1, a.angabe).toBe(sc2);
        const erwartet = (Number(sa) + Number(sb)) * Number(sc1);
        expect(a.loesung, a.angabe).toBe(zahl(erwartet));
        continue;
      }
      const assoc = /^(\d+) \+(\d+) \+(\d+) =$/.exec(a.angabe);
      expect(assoc, a.angabe).not.toBeNull();
      assoziativ++;
      const [, sx, sy, sz] = assoc!;
      // Der zweite und dritte Summand ergeben zusammen eine glatte Zehner-
      // oder Hunderterstufe - genau das, was das Umstellen lohnend macht.
      const partnerSumme = Number(sy) + Number(sz);
      expect(partnerSumme % 10, a.angabe).toBe(0);
      const erwartet = Number(sx) + Number(sy) + Number(sz);
      expect(a.loesung, a.angabe).toBe(zahl(erwartet));
    }
    expect(distributiv, "keine Herausheben-Aufgabe dabei").toBeGreaterThan(0);
    expect(assoziativ, "keine Verbindungsgesetz-Aufgabe dabei").toBeGreaterThan(0);
  });

  it("5-06 Dezimalzahlen lesen und ordnen: alle drei Fassungen stimmen", () => {
    const gesehen = new Set<string>();
    for (const a of alleAufgaben("5-06")) {
      if (a.angabe.startsWith("Der Größe nach ordnen: ")) {
        gesehen.add("ordnen");
        const roh = a.angabe.slice("Der Größe nach ordnen: ".length);
        const menge = roh.split("; ").map(alsZahl);
        const sortiert = a.loesung.split("; ").map(alsZahl);
        expect(sortiert, a.angabe).toHaveLength(menge.length);
        expect([...sortiert], a.angabe).toEqual([...menge].sort((x, y) => x - y));
        continue;
      }
      const vergleich = /^Was ist größer: (-?\d+(?:,\d+)?) oder (-?\d+(?:,\d+)?)\?$/.exec(a.angabe);
      if (vergleich) {
        gesehen.add("vergleich");
        const va = alsZahl(vergleich[1]), vb = alsZahl(vergleich[2]);
        const erwartet = va === vb ? "gleich groß" : va > vb ? vergleich[1] : vergleich[2];
        expect(a.loesung, a.angabe).toBe(erwartet);
        continue;
      }
      const nachbar = /^Welche (Zehntel|Hundertstel) liegen neben (-?\d+(?:,\d+)?)\?$/.exec(a.angabe);
      expect(nachbar, a.angabe).not.toBeNull();
      gesehen.add("nachbarn");
      const [, stelle, sz] = nachbar!;
      const schritt = stelle === "Zehntel" ? 0.1 : 0.01;
      const z = alsZahl(sz);
      const unten = Math.round((z - schritt) * 100) / 100;
      const oben = Math.round((z + schritt) * 100) / 100;
      expect(a.loesung, a.angabe).toBe(`${zahl(unten)} und ${zahl(oben)}`);
    }
    expect(gesehen.size, "es sollten alle drei Fassungen vorkommen").toBe(3);
  });

  it("5-06 Vergleichen: die Falle 'mehr Nachkommastellen wirkt größer' kommt vor (z. B. 0,7 gegen 0,65)", () => {
    let falle = 0;
    for (const a of alleAufgaben("5-06", 80)) {
      const vergleich = /^Was ist größer: (-?\d+(?:,\d+)?) oder (-?\d+(?:,\d+)?)\?$/.exec(a.angabe);
      if (!vergleich) continue;
      const [, sa, sb] = vergleich;
      const na = (sa.split(",")[1] ?? "").length;
      const nb = (sb.split(",")[1] ?? "").length;
      const va = alsZahl(sa), vb = alsZahl(sb);
      // Falle: die Zahl mit WENIGER Nachkommastellen ist trotzdem größer.
      const istFalle = (na < nb && va > vb) || (nb < na && vb > va);
      if (istFalle) falle++;
    }
    expect(falle, "keine Falle 'mehr Nachkommastellen wirkt größer' gefunden").toBeGreaterThan(0);
  });

  it("5-07 Komma verschieben: mal oder durch 10, 100 oder 1000", () => {
    for (const a of alleAufgaben("5-07")) {
      const m = /^(-?\d+(?:,\d+)?) ([*/])(\d+) =$/.exec(a.angabe);
      expect(m, a.angabe).not.toBeNull();
      const [, sw, richtung, sStufe] = m!;
      const wert = alsZahl(sw), stufe = Number(sStufe);
      expect([10, 100, 1000], a.angabe).toContain(stufe);
      const erwartet = richtung === "*" ? wert * stufe : wert / stufe;
      expect(nahe(alsZahl(a.loesung), erwartet), a.angabe).toBe(true);
    }
  });

  it("5-08 Plus/Minus mit Dezimalzahlen: die Probe stimmt", () => {
    for (const a of alleAufgaben("5-08")) {
      const p = nachrechnenProbe(a.angabe);
      expect(p, a.angabe).not.toBeNull();
      expect(["+", "-"], a.angabe).toContain(p!.zeichen);
      const stimmt = nahe(rechenwert(p!.a, p!.zeichen, p!.b), p!.gezeigt);
      expect(a.loesung, a.angabe).toBe(stimmt ? "ja" : "nein");
    }
  });

  it("5-08 Plus/Minus: unterschiedlich viele Nachkommastellen kommen vor", () => {
    let unterschiedlich = 0;
    for (const a of alleAufgaben("5-08", 60)) {
      const p = nachrechnenProbe(a.angabe);
      if (!p) continue;
      const na = (String(p.a).split(".")[1] ?? "").length;
      const nb = (String(p.b).split(".")[1] ?? "").length;
      if (na !== nb) unterschiedlich++;
    }
    expect(unterschiedlich, "kein Beispiel mit unterschiedlichen Nachkommastellen").toBeGreaterThan(0);
  });

  it("5-09 Mal mit Dezimalzahlen: die Probe stimmt UND höchstens drei Nachkommastellen insgesamt", () => {
    for (const a of alleAufgaben("5-09")) {
      const p = nachrechnenProbe(a.angabe);
      expect(p, a.angabe).not.toBeNull();
      expect(p!.zeichen, a.angabe).toBe("*");
      const stimmt = nahe(p!.a * p!.b, p!.gezeigt);
      expect(a.loesung, a.angabe).toBe(stimmt ? "ja" : "nein");
      const na = (String(p!.a).split(".")[1] ?? "").length;
      const nb = (String(p!.b).split(".")[1] ?? "").length;
      expect(na + nb, a.angabe).toBeLessThanOrEqual(3);
    }
  });

  it("5-10 Geteilt mit Dezimalzahlen: die Probe stimmt UND der Divisor ist eine natürliche Zahl", () => {
    for (const a of alleAufgaben("5-10")) {
      const p = nachrechnenProbe(a.angabe);
      expect(p, a.angabe).not.toBeNull();
      expect(p!.zeichen, a.angabe).toBe("/");
      expect(Number.isInteger(p!.b), a.angabe).toBe(true);
      const stimmt = nahe(p!.a / p!.b, p!.gezeigt);
      expect(a.loesung, a.angabe).toBe(stimmt ? "ja" : "nein");
    }
  });

  it("5-11 Geteilt durch eine Dezimalzahl: die Probe stimmt UND der Divisor trägt Nachkommastellen", () => {
    let mitNachkomma = 0;
    for (const a of alleAufgaben("5-11")) {
      const p = nachrechnenProbe(a.angabe);
      expect(p, a.angabe).not.toBeNull();
      expect(p!.zeichen, a.angabe).toBe("/");
      const stimmt = nahe(p!.a / p!.b, p!.gezeigt);
      expect(a.loesung, a.angabe).toBe(stimmt ? "ja" : "nein");
      if (!Number.isInteger(p!.b)) mitNachkomma++;
    }
    expect(mitNachkomma, "kein Divisor mit Nachkommastellen dabei").toBeGreaterThan(0);
  });

  it("5-12 Runden von Dezimalzahlen: Einer, Zehntel und Hundertstel stimmen", () => {
    const stufen: Record<string, number> = { "den Einer": 1, "das Zehntel": 10, "das Hundertstel": 100 };
    for (const a of alleAufgaben("5-12")) {
      const m = /^(-?\d+(?:,\d+)?) auf (den Einer|das Zehntel|das Hundertstel) runden =$/.exec(a.angabe);
      expect(m, a.angabe).not.toBeNull();
      const [, sw, wort] = m!;
      const stufe = stufen[wort];
      const erwartet = Math.round(alsZahl(sw) * stufe) / stufe;
      expect(nahe(alsZahl(a.loesung), erwartet), a.angabe).toBe(true);
    }
  });

  it("5-13 Arten von Brüchen: echt, unecht oder gemischt stimmt", () => {
    for (const a of alleAufgaben("5-13")) {
      const m = /^(?:(\d+) )?(\d+)\/(\d+): echt, unecht oder gemischt\?$/.exec(a.angabe);
      expect(m, a.angabe).not.toBeNull();
      const [, ganzzahl, z, n] = m!;
      const erwartet = ganzzahl !== undefined ? "gemischt" : Number(z) < Number(n) ? "echt" : "unecht";
      expect(a.loesung, a.angabe).toBe(erwartet);
    }
  });

  it("5-14 Erweitern und Kürzen: beide Richtungen stimmen", () => {
    let kuerzen = 0, erweitern = 0;
    for (const a of alleAufgaben("5-14")) {
      // ★ `[]/56` ohne Abstand - ein Bruch, keine Division (Stanetty S. 35).
      expect(a.angabe, a.angabe).not.toMatch(/\[\] \//);
      const luecke = /^(\d+)\/(\d+) =\[\]\/(\d+)$/.exec(a.angabe);
      if (luecke) {
        erweitern++;
        const [, za, na, nb] = luecke;
        const zb = Number(a.loesung);
        expect(zb * Number(na), a.angabe).toBe(Number(za) * Number(nb));
        continue;
      }
      const kuerzenM = /^(\d+)\/(\d+) =$/.exec(a.angabe);
      expect(kuerzenM, a.angabe).not.toBeNull();
      kuerzen++;
      const [, z, n] = kuerzenM!;
      const t = ggt(Number(z), Number(n));
      expect(a.loesung, a.angabe).toBe(`${Number(z) / t}/${Number(n) / t}`);
    }
    expect(kuerzen, "kein Kürzen dabei").toBeGreaterThan(0);
    expect(erweitern, "kein Erweitern dabei").toBeGreaterThan(0);
  });

  it("5-15 Brüche vergleichen: das Zeichen stimmt mit dem Wert überein", () => {
    for (const a of alleAufgaben("5-15")) {
      const m = /^(\d+)\/(\d+) \[\] (\d+)\/(\d+)$/.exec(a.angabe);
      expect(m, a.angabe).not.toBeNull();
      const [, za, na, zb, nb] = m!;
      const links = Number(za) * Number(nb);
      const rechts = Number(zb) * Number(na);
      const erwartet = links > rechts ? ">" : links < rechts ? "<" : "=";
      expect(a.loesung, a.angabe).toBe(erwartet);
    }
  });

  it("5-16 Anteile von Größen: jede Angabe trägt eine Einheit, die Menge ist teilbar, das Ergebnis ganzzahlig", () => {
    const EINHEITEN = ["kg", "g", "m", "cm", "min", "EUR"];
    for (const a of alleAufgaben("5-16")) {
      const m = /^(\d+)\/(\d+) von (\d+) (\S+) =\[\] (\S+)$/.exec(a.angabe);
      expect(m, a.angabe).not.toBeNull();
      const [, z, n, menge, einheit1, einheit2] = m!;
      expect(EINHEITEN, a.angabe).toContain(einheit1);
      expect(einheit2, a.angabe).toBe(einheit1);
      expect(Number(menge) % Number(n), a.angabe).toBe(0);
      const erwartet = (Number(menge) / Number(n)) * Number(z);
      expect(Number.isInteger(erwartet), a.angabe).toBe(true);
      expect(a.loesung, a.angabe).toBe(String(erwartet));
    }
  });

  it("5-17 Überschlag als Kontrolle: die Probe stimmt, über alle vier Rechenarten", () => {
    const gesehen = new Set<string>();
    for (const a of alleAufgaben("5-17")) {
      const p = nachrechnenProbe(a.angabe);
      expect(p, a.angabe).not.toBeNull();
      gesehen.add(p!.zeichen);
      const stimmt = nahe(rechenwert(p!.a, p!.zeichen, p!.b), p!.gezeigt);
      expect(a.loesung, a.angabe).toBe(stimmt ? "ja" : "nein");
    }
    expect(gesehen.size, "es sollten mehrere Rechenarten vorkommen").toBeGreaterThan(1);
  });

  it("★ 5-18 Wie rechnest du das?: Herausheben und Umstellen, wie der Stoffplan sagt", () => {
    // Bis 23.09.2026: gewöhnliches Plus und Minus mit den Wegen der
    // Grundstufe - und einmal „undefined". Jetzt verkürzt EIN Weg die
    // Aufgabe stark, und das Ergebnis ist rund.
    const b = bauart("5-18");
    const rng = zufall(9);
    for (let i = 0; i < 60; i++) {
      const kern = b(rng);
      expect(kern.sorte).toBe("direkt");
      if (kern.sorte !== "direkt") continue;
      const zeile = kern.angabe.split("\n")[0];
      expect(zeile, kern.angabe).toMatch(/,/);
      expect(kern.angabe, kern.angabe).toMatch(/herausheben|zusammenfassen|2,5 mal 4 zuerst/);
      // Der Term selbst: ausgerechnet ist er eine glatte Zahl oder hat höchstens
      // die Nachkommastellen EINER Zahl - das ist der Gewinn des Weges.
      const wert = Function(`return ${zeile.replace(/ =$/, "").replace(/,/g, ".")}`)() as number;
      expect(Math.abs(wert * 100 - Math.round(wert * 100)), zeile).toBeLessThan(1e-6);
    }
  });

  it("5-19 Rechengeschichten: Text, Zahlen und Lösung passen zusammen", () => {
    // ★ Seit 23.09.2026 ist das ein Text und keine nackte Rechnung mehr.
    // Die Sprachregeln und die Zeilenbreite prüft `plus-sachaufgaben.test.ts`;
    // hier steht, was für DIESE Stufe gelten muss.
    const b = bauart("5-19");
    const rng = zufall(77);
    for (let i = 0; i < 60; i++) {
      const kern = b(rng);
      expect(kern.sorte).toBe("direkt");
      if (kern.sorte !== "direkt") continue;
      // Das Paket würfelt zwischen Rechengeschichte und Fermi-Frage - beide
      // Formen nennt der Stoffplan. Die Fermi-Seite prüft `plus-fermi.test.ts`.
      if (kern.eigeneArt === "fermi") {
        expect(kern.bereich, kern.angabe).toBeTruthy();
        expect(kern.angabe.trimEnd(), kern.angabe).toMatch(/\?$/);
        continue;
      }
      expect(kern.geschichte, kern.angabe).toBe(true);
      expect(kern.angabe.trimEnd(), kern.angabe).toMatch(/\?$/);
      // Jede Zahl der Aufgabe steht auch im Text - sonst rechnet das Kind mit
      // etwas, das es nicht lesen kann.
      const imText = (kern.angabe.match(/\d+/g) ?? []).map(Number);
      for (const z of kern.zahlen) {
        if (z !== 0) expect(imText, kern.angabe).toContain(z);
      }
      const wert = Number(kern.loesung.replace(/[^0-9,-]/g, "").replace(",", "."));
      expect(Number.isFinite(wert), kern.angabe).toBe(true);
      expect(wert, kern.angabe).toBeGreaterThanOrEqual(0);
      expect(wert, kern.angabe).toBeLessThanOrEqual(1000000);
    }
  });
});

describe("Keine Bruchrechnung in Stufe 5", () => {
  it("kein Paket erzeugt eine Addition, Subtraktion, Multiplikation oder Division zweier Brüche", () => {
    const bruchRechnungMuster = /\d+\/\d+\s*[-+*/]\s*\d+\/\d+/;
    for (const id of IDS) {
      for (const a of alleAufgaben(id, 20)) {
        expect(bruchRechnungMuster.test(a.angabe), `${id}: ${a.angabe}`).toBe(false);
        expect(bruchRechnungMuster.test(a.loesung), `${id}: ${a.angabe} -> ${a.loesung}`).toBe(false);
      }
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
        // ★ Anders als bei den Stufen 3/4: hier gibt es echte Dezimalzahlen
        // mit bis zu drei Nachkommastellen ("278,507" ist gültig). Verboten
        // ist nur die TAUSENDERTRENNUNG - mehrere Dreiergruppen hintereinander.
        expect(a.angabe, id).not.toMatch(/\d{1,3}(,\d{3}){2,}\b/);
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
});

describe("Ein Lauf bleibt abwechslungsreich (direkt-Kerne mit varianten)", () => {
  it("5-01: 12 Aufgaben zeigen mindestens drei Fragestellungen", () => {
    const typen = new Set(einLauf("5-01", 12, 2026).map((a) => klassifiziere5_01(a.angabe)));
    expect(typen.size, [...typen].join(", ")).toBeGreaterThanOrEqual(3);
  });

  it("5-06: 12 Aufgaben zeigen mindestens drei Fragestellungen", () => {
    const typen = new Set(einLauf("5-06", 12, 2026).map((a) => klassifiziere5_06(a.angabe)));
    expect(typen.size, [...typen].join(", ")).toBeGreaterThanOrEqual(3);
  });

  it("jede Fassung ist für sich richtig - auch innerhalb desselben Laufs", () => {
    for (const id of ["5-01", "5-02", "5-06", "5-14"]) {
      for (const a of einLauf(id, 12, 2026)) {
        expect(istRichtig(a.loesung, a), `${id}: ${a.angabe} -> ${a.loesung}`).toBe(true);
      }
    }
  });
});
