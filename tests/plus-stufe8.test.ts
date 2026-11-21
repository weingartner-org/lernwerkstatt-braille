/**
 * Plus - Wächter für den Aufgabengenerator der Stufe 8 (reelle Zahlen,
 * Bruchterme, der Kopfrechen-Kanon).
 *
 * Wie bei den Wächtern für Stufe 1/2 und Stufe 4: es wird nicht dem
 * Generator geglaubt. Jede Lösung wird HIER, unabhängig, aus der Angabe
 * nachgerechnet - nie aus `a.zahlen`, das der Kern zwar mitträgt, das aber
 * dieselbe (möglicherweise fehlerhafte) Quelle wäre wie die Lösung selbst.
 *
 * ★ 8-17 bis 8-20 haben noch keine Form (ueberschlag, strategiewahl, sach,
 * fermi, umwandeln fehlen in `formen.ts`) - für sie wird die Bauart direkt
 * aufgerufen, wie schon bei 4-17/4-18.
 */
import { describe, expect, it } from "vitest";
import { istRichtig, normal, zahl, zufall, type Aufgabe } from "../src/lib/plus/aufgabe";
import { paket, PAKETE } from "../src/lib/plus/stoffplan";
import { formeAufgabe, RECHNENDE_FORMEN } from "../src/lib/plus/generator/formen";
import { ZUORDNUNG_STUFE8 } from "../src/lib/plus/generator/zuordnung-stufe8";

const IDS = PAKETE.filter((p) => p.id.startsWith("8-")).map((p) => p.id);
const KERN_NUR = ["8-17", "8-18", "8-19", "8-20"];

/* ------------------------------------------------------------------ */
/* Ein unabhängiger Leser: Angabe -> Zahl, ohne der Bauart zu glauben    */
/* ------------------------------------------------------------------ */

function alsZahl(s: string): number {
  return Number(s.replace(",", "."));
}

function istQuadratzahl(n: number): boolean {
  const w = Math.round(Math.sqrt(n));
  return w * w === n;
}

const ZAHL = String.raw`-?\d+(?:,\d+)?`;

/** Liest `48 +27 =` oder `48 +27 =75`. */
function nachrechnenRechnung(angabe: string): { erwartet: number; a: number; b: number; zeichen: string } | null {
  const m = new RegExp(`^(${ZAHL}) ([-+*/])(${ZAHL}) =(${ZAHL})?$`).exec(angabe.trim());
  if (!m) return null;
  const a = alsZahl(m[1]);
  const b = alsZahl(m[3]);
  const zeichen = m[2];
  const erwartet = zeichen === "+" ? a + b : zeichen === "-" ? a - b : zeichen === "*" ? a * b : a / b;
  return { erwartet, a, b, zeichen };
}

/**
 * Ein kleiner Ausdrucksauswerter für Terme und Bruchterme: Zahlen, eine
 * einbuchstabige Variable (Koeffizient direkt davor, z. B. "3x", "5x^2"),
 * Klammern, Potenzen, "*" und "/". Er wertet die Angabe- UND die
 * Lösungsseite bei mehreren x-Werten aus - stimmen sie an jeder Stelle
 * überein, ist die algebraische Umformung richtig. Das prüft Terme,
 * binomische Formeln UND Bruchterme mit demselben Werkzeug, unabhängig
 * davon, was der Generator selbst meint.
 */
function auswerteAusdruck(quelle: string, x: number): number {
  const str = quelle.trim().replace(/=\s*$/, "").trim();
  let pos = 0;

  function skipSpace(): void {
    while (str[pos] === " ") pos++;
  }

  function parseExpr(): number {
    skipSpace();
    let sign = 1;
    if (str[pos] === "-") { sign = -1; pos++; } else if (str[pos] === "+") pos++;
    let total = sign * parseTerm();
    skipSpace();
    while (str[pos] === "+" || str[pos] === "-") {
      sign = str[pos] === "-" ? -1 : 1;
      pos++;
      total += sign * parseTerm();
      skipSpace();
    }
    return total;
  }

  function parseTerm(): number {
    let val = parseFactor();
    skipSpace();
    while (str[pos] === "*" || str[pos] === "/") {
      const op = str[pos];
      pos++;
      const f = parseFactor();
      val = op === "*" ? val * f : val / f;
      skipSpace();
    }
    return val;
  }

  function parseFactor(): number {
    skipSpace();
    let basis: number;
    if (str[pos] === "(") {
      pos++;
      basis = parseExpr();
      skipSpace();
      if (str[pos] !== ")") throw new Error(`erwarte ')' in "${str}" @ ${pos}`);
      pos++;
    } else {
      basis = parseMonom();
    }
    skipSpace();
    if (str[pos] === "^") {
      pos++;
      const s0 = pos;
      while (/\d/.test(str[pos] ?? "")) pos++;
      basis = Math.pow(basis, Number(str.slice(s0, pos)));
    }
    return basis;
  }

  function parseMonom(): number {
    const s0 = pos;
    while (/\d/.test(str[pos] ?? "")) pos++;
    const zahlStr = str.slice(s0, pos);
    const koeff = zahlStr === "" ? 1 : Number(zahlStr);
    if (/[a-zA-Z]/.test(str[pos] ?? "")) {
      pos++;
      let exp = 1;
      if (str[pos] === "^") {
        pos++;
        const e0 = pos;
        while (/\d/.test(str[pos] ?? "")) pos++;
        exp = Number(str.slice(e0, pos));
      }
      return koeff * Math.pow(x, exp);
    }
    return koeff;
  }

  return parseExpr();
}

/** Stimmen zwei Ausdrücke bei mehreren x-Werten überein? */
function algebraischGleich(links: string, rechts: string): boolean {
  return [2, 3, 5, 7].every((x) => Math.abs(auswerteAusdruck(links, x) - auswerteAusdruck(rechts, x)) < 1e-6);
}

function bauart(paketId: string) {
  const b = ZUORDNUNG_STUFE8[paketId];
  if (!b) throw new Error(`${paketId}: keine Bauart in ZUORDNUNG_STUFE8`);
  return b;
}

/** Aufgaben für alle heute gebauten Arten - dieselbe Saat für Wiederholbarkeit. */
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

/** Wie "Mein Training": n Aufgaben hintereinander, mit derselben Saat. */
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

/** Abstand einer Zahl zum nächsten Hunderter - misst, ob der Kniff sich lohnt. */
function abstandZurGlattenZahl(n: number): number {
  const rest = ((n % 100) + 100) % 100;
  return Math.min(rest, 100 - rest);
}

/* ------------------------------------------------------------------ */

describe("Stufe 8: 20 Pakete im Stoffplan", () => {
  it("es gibt genau die Pakete 8-01 bis 8-20", () => {
    expect(IDS).toHaveLength(20);
    expect(IDS[0]).toBe("8-01");
    expect(IDS[19]).toBe("8-20");
  });

  it.each(IDS)("Paket %s: hat eine Bauart in ZUORDNUNG_STUFE8", (id) => {
    expect(typeof ZUORDNUNG_STUFE8[id]).toBe("function");
  });

  it.each(IDS)("Paket %s: liefert Aufgaben, ohne zu werfen", (id) => {
    expect(() => alleAufgaben(id, 20)).not.toThrow();
  });

  it.each(IDS)("Paket %s: die Bauart selbst wirft nie, auch nicht ohne Form", (id) => {
    const b = bauart(id);
    const rng = zufall(1);
    for (let i = 0; i < 40; i++) expect(() => b(rng)).not.toThrow();
  });
});

describe("Jede Lösung stimmt - je Paket eigens geprüft", () => {
  it("8-01 Zahlenmengen: die Zugehörigkeit stimmt, unabhängig aus der Angabe bestimmt", () => {
    const gesehen = new Set<string>();
    for (const a of alleAufgaben("8-01")) {
      const m = /^Ist (.+) eine (natürliche|ganze|rationale|irrationale|reelle) Zahl\?$/.exec(a.angabe);
      expect(m, a.angabe).not.toBeNull();
      const [, text, menge] = m!;
      gesehen.add(a.loesung);
      let inN = false, inZ = false, inQ = false, inI = false;
      if (/^\d+$/.test(text)) {
        inN = true; inZ = true; inQ = true;
      } else if (/^-\d+$/.test(text)) {
        inZ = true; inQ = true;
      } else if (/^\d+\/\d+$/.test(text)) {
        inQ = true;
      } else {
        const wm = /^'w\((\d+)\)$/.exec(text);
        expect(wm, a.angabe).not.toBeNull();
        expect(istQuadratzahl(Number(wm![1])), a.angabe).toBe(false);
        inI = true;
      }
      const erwartet = menge === "natürliche" ? inN
        : menge === "ganze" ? inZ
        : menge === "rationale" ? inQ
        : menge === "irrationale" ? inI
        : true;
      expect(a.loesung, a.angabe).toBe(erwartet ? "ja" : "nein");
    }
    expect(gesehen.size, "es sollten sowohl ja als auch nein vorkommen").toBe(2);
  });

  /**
   * ★★★★★ KEINE RECHNER-AUFGABEN (Johannes, 23.09.2026).
   *
   * > „um das auf zwei nachkommastellen zu runden muss man die wurzel auf 3
   * > stellen berechnen, in der 8. Klasse macht man das mit dem Rechner …
   * > runde auf ganze zahlen, dann ist es im kopf lösbar und sinnvoll!"
   *
   * Eine Näherung ist in Plus deshalb eine GANZE Zahl - oder die Frage, zwischen
   * welchen ganzen Zahlen die Wurzel liegt.
   */
  it("8-02 Quadratwurzel: exakt oder auf ganze Zahlen gerundet", () => {
    for (const a of alleAufgaben("8-02")) {
      const exakt = /^'w\((\d+)\) =$/.exec(a.angabe);
      const gerundet = /^'w\((\d+)\) rund auf ganze Zahlen =$/.exec(a.angabe);
      const dazwischen = /^Zwischen welchen Zahlen liegt 'w\((\d+)\)\?$/.exec(a.angabe);
      if (exakt) {
        const wurzel = Math.sqrt(Number(exakt[1]));
        expect(Number.isInteger(wurzel), a.angabe).toBe(true);
        expect(a.loesung, a.angabe).toBe(String(wurzel));
        continue;
      }
      if (dazwischen) {
        const untere = Math.floor(Math.sqrt(Number(dazwischen[1])));
        expect(a.loesung, a.angabe).toBe(`${untere} und ${untere + 1}`);
        continue;
      }
      expect(gerundet, a.angabe).not.toBeNull();
      expect(a.loesung, a.angabe).toBe(String(Math.round(Math.sqrt(Number(gerundet![1])))));
    }
  });

  it("★★★ 8-02 stellt keine Aufgabe, die man nur mit dem Rechner lösen kann", () => {
    for (const a of alleAufgaben("8-02")) {
      expect(a.angabe, a.angabe).not.toMatch(/Nachkommastelle/);
      // Und die Rundung muss im Kopf ENTSCHEIDBAR sein: der Radikand liegt
      // nie dicht an der Mitte zwischen zwei Quadratzahlen.
      const m = /'w\((\d+)\)/.exec(a.angabe);
      if (!m) continue;
      const r = Number(m[1]);
      const untere = Math.floor(Math.sqrt(r));
      if (untere * untere === r) continue;
      expect(Math.abs(r - (untere + 0.5) ** 2), a.angabe).toBeGreaterThanOrEqual(3);
    }
  });

  it("8-03 Kubikwurzel: die dritte Potenz der Lösung trifft den Radikanden", () => {
    for (const a of alleAufgaben("8-03")) {
      const m = /^'w\[3\]\((\d+)\) =$/.exec(a.angabe);
      expect(m, a.angabe).not.toBeNull();
      const radikand = Number(m![1]);
      const wurzel = Number(a.loesung);
      expect(wurzel * wurzel * wurzel, a.angabe).toBe(radikand);
    }
  });

  it("8-04 Teilweises Wurzelziehen: Vorfaktor zum Quadrat mal Rest trifft den Radikanden", () => {
    for (const a of alleAufgaben("8-04")) {
      const angabeM = /^'w\((\d+)\) =$/.exec(a.angabe);
      expect(angabeM, a.angabe).not.toBeNull();
      const radikand = Number(angabeM![1]);
      const loesungM = /^(\d+) \*'w\((\d+)\)$/.exec(a.loesung);
      expect(loesungM, a.loesung).not.toBeNull();
      const vorFaktor = Number(loesungM![1]);
      const rest = Number(loesungM![2]);
      expect(vorFaktor, a.angabe).toBeGreaterThanOrEqual(2);
      expect(vorFaktor * vorFaktor * rest, a.angabe).toBe(radikand);
      // ★ Unter der Wurzel bleibt keine Quadratzahl stecken: `'w(200) =5 *'w(8)`
      // ist nicht fertig - richtig ist `10 *'w(2)`. Gemessen am 23.09.2026.
      for (let q = 2; q * q <= rest; q++) expect(rest % (q * q), `${a.angabe} => ${a.loesung}`).not.toBe(0);
      expect(istRichtig(`${vorFaktor}'w(${rest})`, a), a.angabe).toBe(true);
    }
  });

  it("8-05 Rechenregeln für Wurzeln: wahr und falsch stimmen, auch die Summe (immer falsch)", () => {
    const gesehen = new Set<string>();
    let summeGesehen = 0;
    for (const a of alleAufgaben("8-05")) {
      const m = /^'w\((\d+)\) ([+*/])'w\((\d+)\) ='w\((\d+)\) - stimmt das\?$/.exec(a.angabe);
      expect(m, a.angabe).not.toBeNull();
      const [, sa, zeichen, sb, sc] = m!;
      const av = Math.sqrt(Number(sa));
      const bv = Math.sqrt(Number(sb));
      const cv = Math.sqrt(Number(sc));
      const links = zeichen === "+" ? av + bv : zeichen === "*" ? av * bv : av / bv;
      const stimmt = Math.abs(links - cv) < 1e-6;
      expect(a.loesung, a.angabe).toBe(stimmt ? "ja" : "nein");
      gesehen.add(a.loesung);
      if (zeichen === "+") {
        summeGesehen++;
        expect(a.loesung, `Summe unter der Wurzel darf nie stimmen: ${a.angabe}`).toBe("nein");
      }
    }
    expect(gesehen.size, "es sollten sowohl wahre als auch falsche Behauptungen vorkommen").toBe(2);
    expect(summeGesehen, "kein Beispiel mit der Summenregel dabei").toBeGreaterThan(0);
  });

  /**
   * ★★★ 8-06 rundet eine Zahl, die DASTEHT - nicht eine, die man erst
   * ausrechnen müsste. Der Stoffplan verlangt „Ergebnisse auf eine geforderte
   * Stellenzahl runden"; das ist im Kopf zu machen, sobald die Zahl da ist.
   */
  it("8-06 Näherungswerte: gerundet wird eine Zahl, die dasteht", () => {
    for (const a of alleAufgaben("8-06")) {
      const rund = /^(\d+,\d+) rund auf (ganze Zahlen|eine Nachkommastelle) =$/.exec(a.angabe);
      const dazwischen = /^Zwischen welchen Zahlen liegt 'w\((\d+)\)\?$/.exec(a.angabe);
      if (dazwischen) {
        const untere = Math.floor(Math.sqrt(Number(dazwischen[1])));
        expect(a.loesung, a.angabe).toBe(`${untere} und ${untere + 1}`);
        continue;
      }
      expect(rund, a.angabe).not.toBeNull();
      const wert = Number(rund![1].replace(",", "."));
      const nachkomma = rund![2] === "ganze Zahlen" ? 0 : 1;
      const faktor = 10 ** nachkomma;
      expect(a.loesung, a.angabe).toBe(zahl(Math.round(wert * faktor + Number.EPSILON) / faktor, nachkomma));
    }
  });

  it("8-07 Terme multiplizieren: Angabe und Lösung sind derselbe Term", () => {
    for (const a of alleAufgaben("8-07")) {
      expect(algebraischGleich(a.angabe, a.loesung), `${a.angabe} -> ${a.loesung}`).toBe(true);
    }
  });

  it("8-08 Binomische Formeln: Angabe und Lösung sind derselbe Term, in beide Richtungen", () => {
    for (const a of alleAufgaben("8-08")) {
      expect(algebraischGleich(a.angabe, a.loesung), `${a.angabe} -> ${a.loesung}`).toBe(true);
    }
  });

  it("8-09 Bruchterme kürzen: Angabe und gekürzter Bruchterm sind gleich", () => {
    for (const a of alleAufgaben("8-09")) {
      expect(algebraischGleich(a.angabe, a.loesung), `${a.angabe} -> ${a.loesung}`).toBe(true);
      // ★ Wirklich gekürzt: Zähler und Nenner der Lösung teilen keinen
      // gemeinsamen Faktor mehr über 1.
      const m = /^(\d+)(?:\/(\d+))?$/.exec(a.loesung);
      expect(m, a.loesung).not.toBeNull();
    }
  });

  it("8-10 Bruchterme addieren und subtrahieren: gleichnamig gemacht und richtig verrechnet", () => {
    for (const a of alleAufgaben("8-10")) {
      expect(algebraischGleich(a.angabe, a.loesung), `${a.angabe} -> ${a.loesung}`).toBe(true);
    }
  });

  it("8-11 Bruchterme multiplizieren und dividieren: die Variable kürzt sich korrekt", () => {
    for (const a of alleAufgaben("8-11")) {
      expect(algebraischGleich(a.angabe, a.loesung), `${a.angabe} -> ${a.loesung}`).toBe(true);
    }
  });

  it("8-12 Doppelbrüche: Hauptbruchstrich zuerst, das Ergebnis stimmt", () => {
    for (const a of alleAufgaben("8-12")) {
      // ★ Kein innerer Bruch, der 1 ist: `(7/7)/(8/8)` (gemessen 23.09.2026).
      for (const [, z, n] of a.angabe.matchAll(/\((\d+)\/(\d+)\)/g)) expect(z, a.angabe).not.toBe(n);
      expect(algebraischGleich(a.angabe, a.loesung), `${a.angabe} -> ${a.loesung}`).toBe(true);
    }
  });

  /**
   * ★★★★★ 8-13 fragt nach dem ÄNDERUNGSFAKTOR und der Rechnung, nicht nach
   * dem Endwert. `12600 *1,01^6` ist der Lerngegenstand („Änderungsfaktor hoch
   * Laufzeit", Stoffplan); das Ausrechnen macht in der Schule der Rechner.
   */
  it("8-13 Zinseszins: der Änderungsfaktor und die Rechnung", () => {
    for (const a of alleAufgaben("8-13")) {
      const zeilen = a.angabe.split("\n");
      const faktorfrage = /^Welcher Faktor gehört zu (\d+) %\?$/.exec(zeilen[0]);
      if (faktorfrage) {
        expect(a.loesung, a.angabe).toBe(zahl(1 + Number(faktorfrage[1]) / 100, 2));
        continue;
      }
      const m = /^(\d+) zu (\d+) % Zinseszins, (\d+) Jahre\.$/.exec(zeilen[0]);
      expect(m, a.angabe).not.toBeNull();
      const [, sk, ss, sj] = m!;
      const faktor = zahl(1 + Number(ss) / 100, 2);
      if (zeilen[1] === "Schreib die Rechnung.") {
        expect(a.loesung, a.angabe).toBe(`${sk} *${faktor}^${sj}`);
      } else {
        expect(a.loesung, a.angabe).toBe(sj);
      }
    }
  });

  it("★★★ 8-13 verlangt nie einen ausgerechneten Endwert", () => {
    // `12600 *1,01^6` ist im Kopf nicht auszurechnen - und soll es auch nicht.
    for (const a of alleAufgaben("8-13")) {
      expect(a.loesung, a.angabe).not.toMatch(/^\d{4,},\d\d$/);
    }
  });

  it("8-14 Kopfrechnen mit großen Zahlen: rechnet richtig, mit runden Zahlen", () => {
    for (const a of alleAufgaben("8-14")) {
      const g = nachrechnenRechnung(a.angabe);
      expect(g, a.angabe).not.toBeNull();
      expect(a.loesung, a.angabe).toBe(zahl(g!.erwartet));
      if (g!.zeichen === "/") {
        expect(g!.b % 10, a.angabe).toBe(0);
        expect(g!.a % g!.b, a.angabe).toBe(0);
      }
    }
  });

  it("8-15 Glatte Zahlen: rechnet richtig UND der Kniff lohnt sich (Abstand höchstens 3)", () => {
    for (const a of alleAufgaben("8-15")) {
      const g = nachrechnenRechnung(a.angabe);
      expect(g, a.angabe).not.toBeNull();
      expect(a.loesung, a.angabe).toBe(zahl(g!.erwartet));
      const abstand = Math.min(abstandZurGlattenZahl(g!.a), abstandZurGlattenZahl(g!.b));
      expect(abstand, `${a.angabe}: keine Zahl ist nah genug an einer glatten Zahl`).toBeLessThanOrEqual(3);
    }
  });

  it("8-16 Der Kellner-Kniff: rechnet richtig UND der Subtrahend liegt nah an einer glatten Zahl", () => {
    for (const a of alleAufgaben("8-16")) {
      const g = nachrechnenRechnung(a.angabe);
      expect(g, a.angabe).not.toBeNull();
      expect(a.loesung, a.angabe).toBe(zahl(g!.erwartet));
      expect(g!.zeichen, a.angabe).toBe("-");
      const abstand = Math.min(abstandZurGlattenZahl(g!.a), abstandZurGlattenZahl(g!.b));
      expect(abstand, `${a.angabe}: keine Zahl ist nah genug an einer glatten Zahl`).toBeLessThanOrEqual(3);
    }
  });

  it("8-17 Geldbeträge überschlagen: die Bauart liefert einen stimmigen Überschlag (Kern ohne Form)", () => {
    const b = bauart("8-17");
    const rng = zufall(17);
    for (let i = 0; i < 60; i++) {
      const kern = b(rng);
      expect(kern.sorte).toBe("direkt");
      if (kern.sorte !== "direkt") continue;
      const zeilen = kern.angabe.split("\n");
      expect(zeilen, kern.angabe).toHaveLength(2);
      expect(zeilen[1], kern.angabe).toBe("Ungefähr wie viel Euro zusammen?");
      for (const zeile of zeilen) expect(zeile.length, zeile).toBeLessThanOrEqual(40);
      const preise = zeilen[0].split("; ").map(alsZahl);
      expect(preise.length, kern.angabe).toBeGreaterThanOrEqual(3);
      expect(preise.length, kern.angabe).toBeLessThanOrEqual(5);
      const erwarteterUeberschlag = preise.reduce((s, x) => s + Math.round(x), 0);
      expect(kern.loesung, kern.angabe).toBe(String(erwarteterUeberschlag));
      // ★ Ein Überschlag hat keine einzige richtige Zahl. Gemessen am
      // 23.09.2026: nur die Summe der gerundeten Preise galt - wer genau
      // rechnete (63,15) oder anders rundete (63), bekam „Noch nicht".
      const genau = preise.reduce((s, x) => s + x, 0);
      const a: Aufgabe = { paket: "8-17", art: "ueberschlag", op: "gemischt", angabe: kern.angabe,
        loesung: kern.loesung, bereich: kern.bereich, zahlen: [] };
      expect(istRichtig(kern.loesung, a), kern.angabe).toBe(true);
      expect(istRichtig(String(Math.round(genau)), a), `${kern.angabe} ${genau}`).toBe(true);
      expect(istRichtig(zahl(genau, 2), a), `${kern.angabe} ${genau}`).toBe(true);
      expect(istRichtig(String(Math.round(genau) + 2 * preise.length + 5), a), kern.angabe).toBe(false);
    }
  });

  it("8-18 Größen schätzen und umrechnen: die Umrechnung stimmt (Kern ohne Form)", () => {
    const EINHEITEN = [
      { klein: "g", gross: "kg", faktor: 1000 },
      { klein: "ml", gross: "l", faktor: 1000 },
      { klein: "cm", gross: "m", faktor: 100 },
      { klein: "m", gross: "km", faktor: 1000 },
    ];
    const b = bauart("8-18");
    const rng = zufall(18);
    for (let i = 0; i < 60; i++) {
      const kern = b(rng);
      expect(kern.sorte).toBe("direkt");
      if (kern.sorte !== "direkt") continue;
      const m = /^(-?[\d,]+) (\S+) = \[\] (\S+)$/.exec(kern.angabe);
      expect(m, kern.angabe).not.toBeNull();
      const [, sw, e1, e2] = m!;
      const wert = alsZahl(sw);
      const hoch = EINHEITEN.find((e) => e.klein === e1 && e.gross === e2);
      const runter = EINHEITEN.find((e) => e.gross === e1 && e.klein === e2);
      expect(hoch || runter, kern.angabe).toBeTruthy();
      const erwartet = hoch ? wert / hoch.faktor : wert * runter!.faktor;
      expect(kern.loesung, kern.angabe).toBe(zahl(erwartet));
    }
  });

  it("8-19 Wie rechnest du das?: der Kandidat rechnet sich richtig (Kern ohne Form)", () => {
    const b = bauart("8-19");
    const rng = zufall(19);
    for (let i = 0; i < 60; i++) {
      const kern = b(rng);
      expect(kern.sorte).toBe("rechnung");
      if (kern.sorte !== "rechnung") continue;
      const erwartet = kern.op === "plus" ? kern.a + kern.b
        : kern.op === "minus" ? kern.a - kern.b
        : kern.op === "geteilt" ? kern.a / kern.b
        : kern.a * kern.b;
      expect(kern.ergebnis, JSON.stringify(kern)).toBe(erwartet);
      if (kern.op === "minus") expect(kern.ergebnis, JSON.stringify(kern)).toBeGreaterThanOrEqual(0);
    }
  });

  it("8-20 Rechengeschichten: Text, Zahlen und Lösung passen zusammen", () => {
    // ★ Seit 23.09.2026 ein Text statt einer nackten Rechnung. Sprache und
    // Zeilenbreite prüft `plus-sachaufgaben.test.ts`.
    const b = bauart("8-20");
    const rng = zufall(5);
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
  const FORM_IDS = IDS.filter((id) => !KERN_NUR.includes(id));

  it("keine Angabe ist länger als 40 Zeichen je Zeile (Braillezeile)", () => {
    for (const id of FORM_IDS) {
      for (const a of alleAufgaben(id, 15)) {
        for (const zeile of a.angabe.split("\n")) {
          expect(zeile.length, `${id}: "${zeile}" (${zeile.length})`).toBeLessThanOrEqual(40);
        }
      }
    }
  });

  it("benutzt den gewöhnlichen Bindestrich, nie das typografische Minus", () => {
    for (const id of FORM_IDS) {
      for (const a of alleAufgaben(id, 15)) {
        expect(a.angabe, id).not.toContain("−");
        expect(a.loesung, id).not.toContain("−");
      }
    }
  });

  it("schreibt Zahlen mit Komma, nie mit Punkt, und ohne Tausendertrennzeichen", () => {
    for (const id of FORM_IDS) {
      for (const a of alleAufgaben(id, 15)) {
        expect(a.angabe, id).not.toMatch(/\d\.\d/);
        expect(a.loesung, id).not.toMatch(/\d\.\d/);
        expect(a.angabe, id).not.toMatch(/\d{1,3}(,\d{3})+\b/);
      }
    }
  });

  it("jede Antwort wird von istRichtig auch beim eigenen Wortlaut akzeptiert", () => {
    for (const id of FORM_IDS) {
      for (const a of alleAufgaben(id, 10)) {
        expect(istRichtig(a.loesung, a), `${id}: ${a.angabe} -> ${a.loesung}`).toBe(true);
      }
    }
  });
});

describe("Ein Lauf bleibt abwechslungsreich", () => {
  it("8-01: 12 Aufgaben zeigen mindestens drei Fragestellungen (welche Menge gefragt ist)", () => {
    const typen = new Set(
      einLauf("8-01", 12, 2026).map((a) => /eine (\w+) Zahl\?$/.exec(a.angabe)?.[1] ?? "?"),
    );
    expect(typen.size, [...typen].join(", ")).toBeGreaterThanOrEqual(3);
  });

  it("8-05: 12 Aufgaben zeigen mindestens zwei Rechenregeln (Produkt/Quotient/Summe)", () => {
    const typen = new Set(
      einLauf("8-05", 12, 7).map((a) => /\) ([+*/])'w\(/.exec(a.angabe)?.[1] ?? "?"),
    );
    expect(typen.size, [...typen].join(", ")).toBeGreaterThanOrEqual(2);
  });

  it("8-14: 12 Aufgaben zeigen mindestens zwei Rechenarten (Plus/Minus/Geteilt)", () => {
    const typen = new Set(einLauf("8-14", 12, 5).map((a) => a.op));
    expect(typen.size, [...typen].join(", ")).toBeGreaterThanOrEqual(2);
  });

  it("8-18: 12 Aufgaben zeigen mindestens drei Größen-Umrechnungen (Kern ohne Form)", () => {
    const b = bauart("8-18");
    const rng = zufall(3);
    const typen = new Set<string>();
    for (let i = 0; i < 12; i++) {
      const kern = b(rng);
      if (kern.sorte !== "direkt") continue;
      const m = /^(-?[\d,]+) (\S+) = \[\] (\S+)$/.exec(kern.angabe);
      typen.add(m ? `${m[2]}-${m[3]}` : "?");
    }
    expect(typen.size, [...typen].join(", ")).toBeGreaterThanOrEqual(3);
  });

  it("jede Fassung ist für sich richtig - auch innerhalb desselben Laufs", () => {
    for (const id of ["8-01", "8-02", "8-05", "8-13", "8-14"]) {
      for (const a of einLauf(id, 12, 2026)) {
        expect(istRichtig(a.loesung, a), `${id}: ${a.angabe} -> ${a.loesung}`).toBe(true);
      }
    }
  });
});

describe("normal()/istRichtig bleiben unabhängig vom Wortlaut", () => {
  it("ja/nein-Antworten aus 8-01 und 8-05 werden bei Gross-/Kleinschreibung nicht geprüft - istRichtig ist exakt", () => {
    for (const a of [...alleAufgaben("8-01", 5), ...alleAufgaben("8-05", 5)]) {
      expect(normal(a.loesung)).toBe(a.loesung);
    }
  });
});
