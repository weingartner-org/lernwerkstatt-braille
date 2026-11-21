/**
 * Plus - Wächter für den Aufgabengenerator der Stufe 7 (jetzt wird das
 * Rechnen allgemein: rationale Zahlen, Potenzen, Terme, Gleichungen).
 *
 * Wie bei den anderen Stufen: es wird nicht dem Generator geglaubt, sondern
 * die Angabe gelesen und selbst nachgerechnet - mit einem eigenen
 * Vorrang-Auswerter (Klammer, Potenz, Punkt, Strich), nie aus `a.zahlen`.
 *
 * ★ `ZUORDNUNG_STUFE7` ist noch nicht in `ZUORDNUNG` (generator/zuordnung.ts)
 * eingehängt - dieser Test ruft die Bauarten direkt auf und baut die
 * Aufgabe selbst über `formeAufgabe`, statt `erzeugeAufgabe` zu benutzen.
 */
import { describe, expect, it } from "vitest";
import { istRichtig, zahl, zufall, type Aufgabe } from "../src/lib/plus/aufgabe";
import { paket, PAKETE } from "../src/lib/plus/stoffplan";
import { formeAufgabe, RECHNENDE_FORMEN } from "../src/lib/plus/generator/formen";
import { ZUORDNUNG_STUFE7 } from "../src/lib/plus/generator/zuordnung-stufe7";

const IDS = PAKETE.filter((p) => p.id.startsWith("7-")).map((p) => p.id);

/* ------------------------------------------------------------------ */
/* Ein unabhängiger Vorrang-Auswerter: Klammer, Potenz, Punkt, Strich    */
/* ------------------------------------------------------------------ */

/** Wertet einen Ausdruck mit +, -, *, /, ^ und Klammern korrekt aus. */
function auswerten(ausdruck: string): number {
  const s = ausdruck.replace(/,/g, ".").replace(/\s+/g, "");
  let i = 0;

  function parseNumber(): number {
    const start = i;
    while (i < s.length && /[0-9.]/.test(s[i])) i++;
    if (i === start) throw new Error(`Zahl erwartet in "${s}" an Stelle ${i}`);
    return Number(s.slice(start, i));
  }
  function parseAtom(): number {
    if (s[i] === "(") {
      i++;
      const v = parseExpr();
      if (s[i] !== ")") throw new Error(`")" erwartet in "${s}"`);
      i++;
      return v;
    }
    if (s[i] === "-") {
      i++;
      return -parseAtom();
    }
    return parseNumber();
  }
  function parsePow(): number {
    const basis = parseAtom();
    if (s[i] === "^") {
      i++;
      return Math.pow(basis, parsePow());
    }
    return basis;
  }
  function parseTerm(): number {
    let v = parsePow();
    while (s[i] === "*" || s[i] === "/") {
      const op = s[i];
      i++;
      const rhs = parsePow();
      v = op === "*" ? v * rhs : v / rhs;
    }
    return v;
  }
  function parseExpr(): number {
    let v = parseTerm();
    while (s[i] === "+" || s[i] === "-") {
      const op = s[i];
      i++;
      const rhs = parseTerm();
      v = op === "+" ? v + rhs : v - rhs;
    }
    return v;
  }

  return parseExpr();
}

/** Dieselben Zeichen, aber strikt von links nach rechts - ohne Vorrang. */
function auswertenLinks(ausdruck: string): number {
  const s = ausdruck.replace(/\s+/g, "");
  const tokens = s.match(/\d+\.?\d*|[+\-*/^]/g);
  if (!tokens) throw new Error(`keine Zahlen in "${s}"`);
  let acc = Number(tokens[0]);
  for (let k = 1; k < tokens.length; k += 2) {
    const op = tokens[k];
    const val = Number(tokens[k + 1]);
    acc = op === "+" ? acc + val : op === "-" ? acc - val : op === "*" ? acc * val : op === "/" ? acc / val : Math.pow(acc, val);
  }
  return acc;
}

/** Angabe ohne das abschließende " =" (oder " =<Ergebnis>"). */
function ohneGleich(angabe: string): string {
  return angabe.replace(/ =.*$/, "");
}

/* ------------------------------------------------------------------ */
/* Ein unabhängiger Term-Vereinfacher: Koeffizienten je Variable summieren */
/* ------------------------------------------------------------------ */

function parseGlieder(s: string): Map<string, number> {
  const map = new Map<string, number>();
  for (const t of s.trim().split(/\s+/).filter(Boolean)) {
    const m = /^([+-]?)(\d*)([a-z])$/.exec(t);
    if (!m) throw new Error(`Kein Term-Glied: "${t}"`);
    const [, vz, num, v] = m;
    let k = num === "" ? 1 : Number(num);
    if (vz === "-") k = -k;
    map.set(v, (map.get(v) ?? 0) + k);
  }
  return map;
}

function formatGlieder(map: Map<string, number>): string {
  const eintraege = [...map.entries()].filter(([, k]) => k !== 0);
  if (!eintraege.length) return "0";
  return eintraege
    .map(([v, k], i) => {
      const az = Math.abs(k);
      const zahlteil = az === 1 ? "" : String(az);
      const kern = `${zahlteil}${v}`;
      if (i === 0) return k < 0 ? `-${kern}` : kern;
      return k < 0 ? `-${kern}` : `+${kern}`;
    })
    .join(" ");
}

/** Wie `parseGlieder`, aber ohne gleiche Variablen zusammenzufassen - für
 * `ausmultiplizieren`: der Generator lässt „9y" und „4y" bewusst nebeneinander
 * stehen, statt sie zu 13y zu verschmelzen. */
function parseGliederListe(s: string): { k: number; v: string }[] {
  return s
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((t) => {
      const m = /^([+-]?)(\d*)([a-z])$/.exec(t);
      if (!m) throw new Error(`Kein Term-Glied: "${t}"`);
      const [, vz, num, v] = m;
      let k = num === "" ? 1 : Number(num);
      if (vz === "-") k = -k;
      return { k, v };
    });
}

function formatGliederListe(glieder: { k: number; v: string }[]): string {
  return glieder
    .map(({ k, v }, i) => {
      const az = Math.abs(k);
      const zahlteil = az === 1 ? "" : String(az);
      const kern = `${zahlteil}${v}`;
      if (i === 0) return k < 0 ? `-${kern}` : kern;
      return k < 0 ? `-${kern}` : `+${kern}`;
    })
    .join(" ");
}

function ggT(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

/* ------------------------------------------------------------------ */

function bauart(paketId: string) {
  const b = ZUORDNUNG_STUFE7[paketId];
  if (!b) throw new Error(`${paketId}: keine Bauart in ZUORDNUNG_STUFE7`);
  return b;
}

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

/* ------------------------------------------------------------------ */

describe("Stufe 7: 20 Pakete im Stoffplan", () => {
  it("es gibt genau die Pakete 7-01 bis 7-20", () => {
    expect(IDS).toHaveLength(20);
    expect(IDS[0]).toBe("7-01");
    expect(IDS[19]).toBe("7-20");
  });

  it.each(IDS)("Paket %s: hat eine Bauart in ZUORDNUNG_STUFE7", (id) => {
    expect(typeof ZUORDNUNG_STUFE7[id]).toBe("function");
  });

  it.each(IDS)("Paket %s: liefert Aufgaben, ohne zu werfen", (id) => {
    expect(() => alleAufgaben(id, 20)).not.toThrow();
  });

  it.each(IDS)("Paket %s: die Bauart selbst wirft nie, auch nicht ohne Form", (id) => {
    // 7-19 (Strategiewahl) und 7-20 (Sachaufgaben) haben noch keine Form -
    // der Kern muss trotzdem stehen, wie schon in Stufe 4.
    const b = bauart(id);
    const rng = zufall(1);
    for (let i = 0; i < 30; i++) expect(() => b(rng)).not.toThrow();
  });
});

describe("Jede Lösung stimmt - unabhängig nachgerechnet", () => {
  it("7-01 Rationale Zahlen ordnen / Betrag / Gegenzahl: alle drei Fassungen stimmen", () => {
    const gesehen = new Set<string>();
    for (const a of alleAufgaben("7-01")) {
      const ordnen = /^Der Größe nach ordnen: (.+)$/.exec(a.angabe);
      const betrag = /^\|(-?\d+)\| =$/.exec(a.angabe);
      const gegenzahl = /^Gegenzahl von (-?\d+) =$/.exec(a.angabe);
      if (ordnen) {
        gesehen.add("ordnen");
        const werte = ordnen[1].split("; ").map(Number);
        const sortiert = [...werte].sort((x, y) => x - y);
        expect(a.loesung, a.angabe).toBe(sortiert.join("; "));
        continue;
      }
      if (betrag) {
        gesehen.add("betrag");
        expect(a.loesung, a.angabe).toBe(String(Math.abs(Number(betrag[1]))));
        continue;
      }
      expect(gegenzahl, a.angabe).not.toBeNull();
      gesehen.add("gegenzahl");
      expect(a.loesung, a.angabe).toBe(String(-Number(gegenzahl![1])));
    }
    expect(gesehen.size, "es sollten alle drei Fassungen vorkommen").toBe(3);
  });

  it("7-02 Mal mit negativen Zahlen: stimmt, alle vier Vorzeichenkombinationen kommen vor", () => {
    const kombis = new Set<string>();
    for (const a of alleAufgaben("7-02")) {
      const erwartet = auswerten(ohneGleich(a.angabe));
      expect(Number(a.loesung), a.angabe).toBe(erwartet);
      const m = /^(-?\d+) \*\(?(-?\d+)\)? =$/.exec(a.angabe);
      expect(m, a.angabe).not.toBeNull();
      kombis.add(`${Number(m![1]) < 0 ? "-" : "+"}${Number(m![2]) < 0 ? "-" : "+"}`);
    }
    expect(kombis, [...kombis].join(", ")).toEqual(new Set(["++", "+-", "-+", "--"]));
  });

  it("7-03 Geteilt mit negativen Zahlen: stimmt, alle vier Vorzeichenkombinationen kommen vor", () => {
    const kombis = new Set<string>();
    for (const a of alleAufgaben("7-03")) {
      const erwartet = auswerten(ohneGleich(a.angabe));
      expect(Number(a.loesung), a.angabe).toBe(erwartet);
      const m = /^(-?\d+) \/\(?(-?\d+)\)? =$/.exec(a.angabe);
      expect(m, a.angabe).not.toBeNull();
      kombis.add(`${Number(m![1]) < 0 ? "-" : "+"}${Number(m![2]) < 0 ? "-" : "+"}`);
    }
    expect(kombis, [...kombis].join(", ")).toEqual(new Set(["++", "+-", "-+", "--"]));
  });

  it("7-04 Verbindung der Rechenarten mit Vorzeichen: alle vier Rechenarten stimmen", () => {
    const gesehen = new Set<string>();
    for (const a of alleAufgaben("7-04")) {
      const erwartet = auswerten(ohneGleich(a.angabe));
      expect(Number(a.loesung), a.angabe).toBeCloseTo(erwartet, 9);
      const zeichen = /^-?\d+ ([-+*/])/.exec(a.angabe);
      expect(zeichen, a.angabe).not.toBeNull();
      gesehen.add(zeichen![1]);
    }
    expect(gesehen.size, "es sollten mehrere Rechenarten vorkommen").toBeGreaterThanOrEqual(3);
  });

  it("7-05 Potenzen verstehen: Basis hoch Exponent stimmt", () => {
    for (const a of alleAufgaben("7-05")) {
      const erwartet = auswerten(ohneGleich(a.angabe));
      expect(Number(a.loesung), a.angabe).toBe(erwartet);
    }
  });

  it("7-06 Quadrat- und Kubikzahlen: nur positive Basis, Exponent 2 oder 3", () => {
    for (const a of alleAufgaben("7-06")) {
      const m = /^(\d+)\^([23]) =$/.exec(a.angabe);
      expect(m, a.angabe).not.toBeNull();
      expect(Number(a.loesung), a.angabe).toBe(Math.pow(Number(m![1]), Number(m![2])));
    }
  });

  it("7-07 Potenzen mit negativer Basis: stimmt, gerade UND ungerade Exponenten kommen vor", () => {
    const paritaeten = new Set<string>();
    for (const a of alleAufgaben("7-07")) {
      const erwartet = auswerten(ohneGleich(a.angabe));
      expect(Number(a.loesung), a.angabe).toBe(erwartet);
      const m = /\^(\d+) =$/.exec(a.angabe);
      expect(m, a.angabe).not.toBeNull();
      const exponent = Number(m![1]);
      const istNegativeBasis = a.angabe.startsWith("(-");
      if (istNegativeBasis) paritaeten.add(exponent % 2 === 0 ? "gerade" : "ungerade");
    }
    expect(paritaeten, [...paritaeten].join(", ")).toEqual(new Set(["gerade", "ungerade"]));
  });

  it("7-08 Potenzen von Dezimalzahlen und Brüchen: beide Fassungen stimmen", () => {
    const gesehen = new Set<string>();
    for (const a of alleAufgaben("7-08")) {
      const dez = /^0,(\d)\^(\d+) =$/.exec(a.angabe);
      const bruch = /^\((\d+)\/(\d+)\)\^(\d+) =$/.exec(a.angabe);
      if (dez) {
        gesehen.add("dezimal");
        const [, z, e] = dez;
        const roh = Math.pow(Number(z), Number(e));
        expect(a.loesung, a.angabe).toBe(`0,${String(roh).padStart(Number(e), "0")}`);
        continue;
      }
      expect(bruch, a.angabe).not.toBeNull();
      gesehen.add("bruch");
      const [, z, n, e] = bruch!;
      expect(a.loesung, a.angabe).toBe(`${Math.pow(Number(z), Number(e))}/${Math.pow(Number(n), Number(e))}`);
    }
    expect(gesehen, [...gesehen].join(", ")).toEqual(new Set(["dezimal", "bruch"]));
  });

  it("★ 7-09 nimmt auch den ausgerechneten Wert an", () => {
    // `6^6 /6^3 =` heißt `6^3` - wer 216 schreibt, hat nicht falsch
    // gerechnet, sondern weiter. Gemessen am 23.09.2026.
    for (const a of alleAufgaben("7-09")) {
      const m = /^(\d+)\^(\d+)$/.exec(a.loesung)!;
      const wert = Number(m[1]) ** Number(m[2]);
      if (wert <= 1e7) expect(istRichtig(String(wert), a), `${a.angabe} ${wert}`).toBe(true);
      expect(istRichtig(String(wert + 1), a), a.angabe).toBe(false);
    }
  });

  it("7-09 Rechenregeln für Potenzen: Produkt, Quotient, Potenz von Potenz", () => {
    const gesehen = new Set<string>();
    for (const a of alleAufgaben("7-09")) {
      // ★ Keine Potenz von Potenz mit Hochzahl 1: `(9^1)^1` fragt keine Regel
      // ab. Gemessen am 23.09.2026 beim Mitlesen.
      expect(a.angabe, a.angabe).not.toMatch(/\^1\)|\)\^1\b/);
      const produkt = /^(\d+)\^(\d+) \*(\d+)\^(\d+) =$/.exec(a.angabe);
      const quotient = /^(\d+)\^(\d+) \/(\d+)\^(\d+) =$/.exec(a.angabe);
      const potPot = /^\((\d+)\^(\d+)\)\^(\d+) =$/.exec(a.angabe);
      if (produkt) {
        gesehen.add("produkt");
        const [, basis1, e1, basis2, e2] = produkt;
        expect(basis1, a.angabe).toBe(basis2);
        expect(a.loesung, a.angabe).toBe(`${basis1}^${Number(e1) + Number(e2)}`);
        continue;
      }
      if (quotient) {
        gesehen.add("quotient");
        const [, basis1, e1, basis2, e2] = quotient;
        expect(basis1, a.angabe).toBe(basis2);
        expect(a.loesung, a.angabe).toBe(`${basis1}^${Number(e1) - Number(e2)}`);
        continue;
      }
      expect(potPot, a.angabe).not.toBeNull();
      gesehen.add("potenzVonPotenz");
      const [, basis, e1, e2] = potPot!;
      expect(a.loesung, a.angabe).toBe(`${basis}^${Number(e1) * Number(e2)}`);
    }
    expect(gesehen.size, [...gesehen].join(", ")).toBeGreaterThanOrEqual(2);
  });

  it("7-10 Zehnerpotenzen: stimmt, groß und klein kommen vor", () => {
    let gross = 0, klein = 0;
    for (const a of alleAufgaben("7-10")) {
      const m = /^10\^(-?\d+) =$/.exec(a.angabe);
      expect(m, a.angabe).not.toBeNull();
      const exponent = Number(m![1]);
      if (exponent >= 0) {
        gross++;
        expect(a.loesung, a.angabe).toBe(String(Math.pow(10, exponent)));
      } else {
        klein++;
        expect(a.loesung, a.angabe).toBe(zahl(Math.pow(10, exponent), -exponent));
      }
    }
    expect(gross, "keine großen Zehnerpotenzen dabei").toBeGreaterThan(0);
    expect(klein, "keine kleinen Zehnerpotenzen dabei").toBeGreaterThan(0);
  });

  it("★ 7-11 Vorrangregeln mit Potenzen: jede Lösung stimmt (eigener Vorrang-Auswerter)", () => {
    for (const a of alleAufgaben("7-11")) {
      const erwartet = auswerten(ohneGleich(a.angabe));
      expect(Number(a.loesung), a.angabe).toBe(erwartet);
    }
  });

  it("★ 7-11: die Vorrangregel entscheidet wirklich - von links nach rechts käme etwas anderes heraus", () => {
    let abweichend = 0;
    for (const a of alleAufgaben("7-11", 20)) {
      const ausdruck = ohneGleich(a.angabe);
      const korrekt = auswerten(ausdruck);
      const linksNachRechts = auswertenLinks(ausdruck);
      if (korrekt !== linksNachRechts) abweichend++;
    }
    expect(abweichend, "keine Aufgabe zeigt einen Unterschied - Vorrang übt nichts").toBeGreaterThan(0);
  });

  it("7-12 Terme zusammenfassen: die Koeffizienten je Variable stimmen", () => {
    for (const a of alleAufgaben("7-12")) {
      const ausdruck = ohneGleich(a.angabe);
      const erwartet = formatGlieder(parseGlieder(ausdruck));
      expect(a.loesung, a.angabe).toBe(erwartet);
    }
  });

  it("7-13 Minus vor der Klammer: alle Klammerglieder kippen korrekt", () => {
    for (const a of alleAufgaben("7-13")) {
      const m = /^(.+) -\((.+)\) =$/.exec(a.angabe);
      expect(m, a.angabe).not.toBeNull();
      const [, vorKlammer, klammerText] = m!;
      const kombi = new Map(parseGlieder(vorKlammer));
      for (const [v, k] of parseGlieder(klammerText)) kombi.set(v, (kombi.get(v) ?? 0) - k);
      expect(a.loesung, a.angabe).toBe(formatGlieder(kombi));
    }
  });

  it("7-14 Ausmultiplizieren und Herausheben: beide Richtungen stimmen", () => {
    let hin = 0, zurueck = 0;
    for (const a of alleAufgaben("7-14")) {
      const vorwaerts = /^(\d+) \*\((.+)\) =$/.exec(a.angabe);
      if (vorwaerts) {
        hin++;
        const [, faktor, klammerText] = vorwaerts;
        const multipliziert = parseGliederListe(klammerText).map(({ k, v }) => ({ k: k * Number(faktor), v }));
        expect(a.loesung, a.angabe).toBe(formatGliederListe(multipliziert));
        continue;
      }
      zurueck++;
      const loesungM = /^(\d+) \*\((.+)\)$/.exec(a.loesung);
      expect(loesungM, `${a.angabe} -> ${a.loesung}`).not.toBeNull();
      const [, faktor, geheftetText] = loesungM!;
      const zurueckMultipliziert = parseGliederListe(geheftetText).map(({ k, v }) => ({ k: k * Number(faktor), v }));
      const ausAngabe = parseGliederListe(ohneGleich(a.angabe));
      expect(formatGliederListe(zurueckMultipliziert), a.angabe).toBe(formatGliederListe(ausAngabe));
      // ★ Der herausgehobene Faktor ist der GANZE: sonst gälte `3 *(2y +4x)`
      // und das bessere `6 *(y +2x)` wäre falsch. Gemessen am 23.09.2026.
      const ggt = (x: number, y: number): number => (y ? ggt(y, x % y) : Math.abs(x));
      expect(ausAngabe.map((g) => g.k).reduce(ggt), a.angabe).toBe(Number(faktor));
    }
    expect(hin, "keine Aufgabe 'hin' (ausmultiplizieren) dabei").toBeGreaterThan(0);
    expect(zurueck, "keine Aufgabe 'zurück' (herausheben) dabei").toBeGreaterThan(0);
  });

  it("7-15 Gleichungen umformen: die Lösung stimmt, einschrittig UND zweischrittig", () => {
    let einschrittig = 0, zweischrittig = 0;
    for (const a of alleAufgaben("7-15")) {
      const additiv = /^x ([+-]\d+) =(-?\d+)$/.exec(a.angabe);
      const zwei = /^(\d+)x ([+-]\d+) =(-?\d+)$/.exec(a.angabe);
      const mult = /^(\d+)x =(-?\d+)$/.exec(a.angabe);
      if (additiv) {
        einschrittig++;
        const [, b, c] = additiv;
        expect(a.loesung, a.angabe).toBe(String(Number(c) - Number(b)));
        continue;
      }
      if (zwei) {
        zweischrittig++;
        const [, aa, b, c] = zwei;
        expect(a.loesung, a.angabe).toBe(String((Number(c) - Number(b)) / Number(aa)));
        continue;
      }
      expect(mult, a.angabe).not.toBeNull();
      einschrittig++;
      const [, aa, c] = mult!;
      expect(a.loesung, a.angabe).toBe(String(Number(c) / Number(aa)));
    }
    expect(einschrittig, "keine einschrittige Gleichung dabei").toBeGreaterThan(0);
    expect(zweischrittig, "keine zweischrittige Gleichung dabei").toBeGreaterThan(0);
  });

  it("7-16 Verhältnisse und Maßstab: Kürzen und Maßstab stimmen", () => {
    const gesehen = new Set<string>();
    for (const a of alleAufgaben("7-16")) {
      const kuerzen = /^(\d+) : (\d+) kürzen =$/.exec(a.angabe);
      const bildGefragt = /^1 : (\d+); wirklich (\d+) cm; Bild =$/.exec(a.angabe);
      const wirklichGefragt = /^1 : (\d+); Bild (\d+) cm; wirklich =$/.exec(a.angabe);
      if (kuerzen) {
        gesehen.add("kuerzen");
        const [, x, y] = kuerzen;
        const g = ggT(Number(x), Number(y));
        expect(a.loesung, a.angabe).toBe(`${Number(x) / g} : ${Number(y) / g}`);
        continue;
      }
      if (bildGefragt) {
        gesehen.add("massstabBild");
        const [, m, wirklich] = bildGefragt;
        expect(a.loesung, a.angabe).toBe(`${Number(wirklich) / Number(m)} cm`);
        continue;
      }
      expect(wirklichGefragt, a.angabe).not.toBeNull();
      gesehen.add("massstabWirklich");
      const [, m, bild] = wirklichGefragt!;
      expect(a.loesung, a.angabe).toBe(`${Number(bild) * Number(m)} cm`);
    }
    expect(gesehen.size, [...gesehen].join(", ")).toBeGreaterThanOrEqual(3);
  });

  it("7-17 Prozent Zu- und Abnahme: stimmt, Prozentsatz liegt zwischen 5 und 50", () => {
    const gesehen = new Set<string>();
    for (const a of alleAufgaben("7-17")) {
      const haupt = /^(\d+) um (\d+) % (erhöht|verringert) =$/.exec(a.angabe);
      const faktor = /^(Zunahme|Abnahme) um (\d+) %: Faktor in % =$/.exec(a.angabe);
      if (haupt) {
        gesehen.add("haupt");
        const [, grundwert, satz, wort] = haupt;
        expect(Number(satz), a.angabe).toBeGreaterThanOrEqual(5);
        expect(Number(satz), a.angabe).toBeLessThanOrEqual(50);
        const differenz = (Number(grundwert) * Number(satz)) / 100;
        const erwartet = wort === "erhöht" ? Number(grundwert) + differenz : Number(grundwert) - differenz;
        expect(Number(a.loesung), a.angabe).toBe(erwartet);
        continue;
      }
      expect(faktor, a.angabe).not.toBeNull();
      gesehen.add("faktor");
      const [, wort, satz] = faktor!;
      const erwartet = wort === "Zunahme" ? 100 + Number(satz) : 100 - Number(satz);
      expect(a.loesung, a.angabe).toBe(`${erwartet} %`);
    }
    expect(gesehen.size, [...gesehen].join(", ")).toBeGreaterThanOrEqual(2);
  });

  it("7-18 Zinsen rechnen: stimmt", () => {
    for (const a of alleAufgaben("7-18")) {
      const m = /^(\d+) zu (\d+) % Zinsen für (\d+ Jahre?) =$/.exec(a.angabe);
      expect(m, a.angabe).not.toBeNull();
      const [, kapital, satz] = m!;
      const erwartet = Math.round(((Number(kapital) * Number(satz)) / 100) * 100) / 100;
      expect(a.loesung, a.angabe).toBe(zahl(erwartet));
    }
  });

  it("7-19 Wie rechnest du das?: Term, Frage und drei Wege", () => {
    // ★ Seit 23.09.2026 baut dieses Paket die Wahl selbst - die allgemeine
    // Form kann aus einem fertigen Term keine Wege ableiten, und raten wäre
    // schlimmer als gar keine Aufgabe. Die Wege prüft
    // `plus-strategiewahl.test.ts`; hier steht, was die Stufe verlangt.
    const b = bauart("7-19");
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

  it("7-20 Rechengeschichten: Text, Zahlen und Lösung passen zusammen", () => {
    // ★ Seit 23.09.2026 ein Text statt einer nackten Rechnung. Sprache und
    // Zeilenbreite prüft `plus-sachaufgaben.test.ts`.
    const b = bauart("7-20");
    const rng = zufall(5);
    for (let i = 0; i < 60; i++) {
      const kern = b(rng);
      expect(kern.sorte).toBe("direkt");
      if (kern.sorte !== "direkt") continue;
      expect(kern.geschichte, kern.angabe).toBe(true);
      expect(kern.angabe.trimEnd(), kern.angabe).toMatch(/\?$/);
      const imText = (kern.angabe.match(/\d+/g) ?? []).map(Number);
      for (const z of kern.zahlen) {
        if (z !== 0) expect(imText, kern.angabe).toContain(z);
      }
      const wert = Number(kern.loesung.replace(/[^0-9,-]/g, "").replace(",", "."));
      expect(Number.isFinite(wert), kern.angabe).toBe(true);
      expect(wert, kern.angabe).toBeGreaterThanOrEqual(0);
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
});

describe("Ein Lauf bleibt abwechslungsreich", () => {
  it("7-01: 12 Aufgaben zeigen mindestens drei Fragestellungen", () => {
    const klass = (angabe: string) =>
      angabe.startsWith("Der Größe") ? "ordnen" : angabe.startsWith("|") ? "betrag" : "gegenzahl";
    const typen = new Set(einLauf("7-01", 12, 2026).map((a) => klass(a.angabe)));
    expect(typen.size, [...typen].join(", ")).toBeGreaterThanOrEqual(3);
  });

  it("7-16: 12 Aufgaben zeigen mindestens drei Fragestellungen", () => {
    const klass = (angabe: string) =>
      angabe.includes("kürzen") ? "kuerzen" : angabe.includes("wirklich (") || /wirklich \d+ cm; Bild/.test(angabe)
        ? "massstabBild" : "massstabWirklich";
    const typen = new Set(einLauf("7-16", 12, 2026).map((a) => klass(a.angabe)));
    expect(typen.size, [...typen].join(", ")).toBeGreaterThanOrEqual(3);
  });

  it("7-17: 12 Aufgaben zeigen mindestens zwei Fragestellungen", () => {
    const klass = (angabe: string) => (angabe.includes("Faktor") ? "faktor" : "haupt");
    const typen = new Set(einLauf("7-17", 12, 2026).map((a) => klass(a.angabe)));
    expect(typen.size, [...typen].join(", ")).toBeGreaterThanOrEqual(2);
  });

  it("jede Fassung ist für sich richtig - auch innerhalb desselben Laufs", () => {
    for (const id of ["7-01", "7-02", "7-16", "7-17"]) {
      for (const a of einLauf(id, 12, 2026)) {
        expect(istRichtig(a.loesung, a), `${id}: ${a.angabe} -> ${a.loesung}`).toBe(true);
      }
    }
  });
});
