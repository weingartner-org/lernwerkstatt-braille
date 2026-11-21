/**
 * Plus - Wächter für den Aufgabengenerator der Stufe 4 (der große
 * Zahlenraum bis eine Million).
 *
 * Wie beim Wächter für Stufe 1/2: es wird nicht dem Generator geglaubt,
 * sondern die Angabe gelesen und selbst nachgerechnet.
 *
 * ★ `ZUORDNUNG_STUFE4` ist noch nicht in `ZUORDNUNG` (generator/zuordnung.ts)
 * eingehängt - dieser Test ruft die Bauarten direkt auf und baut die
 * Aufgabe selbst über `formeAufgabe`, statt `erzeugeAufgabe` zu benutzen.
 */
import { describe, expect, it } from "vitest";
import { istRichtig, normal, zahl, zufall, type Aufgabe } from "../src/lib/plus/aufgabe";
import { paket, PAKETE } from "../src/lib/plus/stoffplan";
import { formeAufgabe, RECHNENDE_FORMEN } from "../src/lib/plus/generator/formen";
import { ZUORDNUNG_STUFE4 } from "../src/lib/plus/generator/zuordnung-stufe4";
import { ggt } from "../src/lib/plus/generator/kerne-stufe4";

const IDS = PAKETE.filter((p) => p.id.startsWith("4-")).map((p) => p.id);

/* ------------------------------------------------------------------ */
/* Ein unabhängiger Leser für die Schreibweise                          */
/* ------------------------------------------------------------------ */

const ZAHL = String.raw`-?\d+(?:,\d+)?`;

function alsZahl(s: string): number {
  return Number(s.replace(",", "."));
}

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

/** Liest `899999 +99999 =999998 - stimmt das?` (auch mit Rest). */
function nachrechnenProbe(angabe: string): { wahr: boolean } | null {
  const m = /^(-?\d+) ([-+*/])(-?\d+) =(\d+)(?: \((\d+) Rest\))? - stimmt das\?$/.exec(angabe);
  if (!m) return null;
  const [, sa, z, sb, serg, srest] = m;
  const x = Number(sa), y = Number(sb), erg = Number(serg);
  const wahr =
    z === "+" ? x + y === erg
    : z === "-" ? x - y === erg
    : z === "*" ? x * y === erg
    : Math.floor(x / y) === erg && (srest === undefined ? x % y === 0 : x % y === Number(srest));
  return { wahr };
}

function bauart(paketId: string) {
  const b = ZUORDNUNG_STUFE4[paketId];
  if (!b) throw new Error(`${paketId}: keine Bauart in ZUORDNUNG_STUFE4`);
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

/**
 * Simuliert "Mein Training" für ein Paket: n Aufgaben hintereinander, mit
 * derselben Saat - wie ein echter Übungslauf. Die Art wechselt reihum, ist
 * aber für einen `direkt`-Kern ohne Belang (er bringt seine Fassungen
 * selbst mit, siehe `varianten`).
 */
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

/** Welche der Fassungen eines `direkt`-Kerns steckt in dieser Angabe? */
function klassifiziere4_01(angabe: string): string {
  if (angabe.startsWith("Welche Zahl kommt nach")) return "nachfolger";
  if (angabe.includes("nächste Hunderttausenderzahl")) return "hunderttausender";
  return "stelle";
}
function klassifiziere4_02(angabe: string): string {
  if (angabe.includes("\n")) return "wahrFalsch";
  if (angabe.startsWith("Runde ")) return "paraphrase";
  return "haupt";
}
function klassifiziere4_13(angabe: string): string {
  if (angabe.includes("stimmt das?")) return "wahrFalsch";
  if (angabe.includes("[]")) return "luecke";
  return "vergleich";
}
function klassifiziere4_14(angabe: string): string {
  return angabe.includes("=[]") ? "vorwaerts" : "rueckfrage";
}
function klassifiziere4_15(angabe: string): string {
  if (angabe.includes("\n")) return "vergleich";
  if (/= \[\] \S+ \[\] \S+$/.test(angabe)) return "rueckwaerts";
  return "vorwaerts";
}

/* ------------------------------------------------------------------ */

describe("Stufe 4: 18 Pakete im Stoffplan", () => {
  it("es gibt genau die Pakete 4-01 bis 4-18", () => {
    expect(IDS).toHaveLength(18);
    expect(IDS[0]).toBe("4-01");
    expect(IDS[17]).toBe("4-18");
  });

  it.each(IDS)("Paket %s: hat eine Bauart in ZUORDNUNG_STUFE4", (id) => {
    expect(typeof ZUORDNUNG_STUFE4[id]).toBe("function");
  });

  it.each(IDS)("Paket %s: liefert Aufgaben, ohne zu werfen", (id) => {
    expect(() => alleAufgaben(id, 20)).not.toThrow();
  });

  it.each(IDS)("Paket %s: die Bauart selbst wirft nie, auch nicht ohne Form", (id) => {
    // Auch die Pakete, deren Form (sach, fermi, strategiewahl, fehler_finden)
    // noch nicht gebaut ist, müssen einen Kern liefern - das prüft dieser
    // Test unabhängig von `formeAufgabe`.
    const b = bauart(id);
    const rng = zufall(1);
    for (let i = 0; i < 30; i++) expect(() => b(rng)).not.toThrow();
  });
});

describe("Jede Lösung stimmt - je Paket eigens geprüft", () => {
  it("4-01 Stellenwert: Nachfolger, Ziffer an der Stelle, nächster Hunderttausender - drei Fassungen", () => {
    const stellen = ["Einer", "Zehner", "Hunderter", "Tausender", "Zehntausender", "Hunderttausender"];
    const gesehen = new Set<string>();
    for (const a of alleAufgaben("4-01")) {
      const nach = /^Welche Zahl kommt nach (\d+)\?$/.exec(a.angabe);
      const stelle = /^(\d+) - Ziffer der (\w+)\?$/.exec(a.angabe);
      const hunderttausender = /^(\d+) - nächste Hunderttausenderzahl\?$/.exec(a.angabe);
      if (nach) {
        gesehen.add("nachfolger");
        expect(a.loesung, a.angabe).toBe(zahl(Number(nach[1]) + 1));
        continue;
      }
      if (hunderttausender) {
        gesehen.add("hunderttausender");
        const z = Number(hunderttausender[1]);
        expect(a.loesung, a.angabe).toBe(zahl(Math.ceil((z + 1) / 100000) * 100000));
        continue;
      }
      expect(stelle, a.angabe).not.toBeNull();
      gesehen.add("stelle");
      const [, sz] = stelle!;
      const ziffern = sz.split("").reverse();
      const idx = stellen.indexOf(stelle![2]);
      expect(idx, a.angabe).toBeGreaterThanOrEqual(0);
      expect(a.loesung, a.angabe).toBe(ziffern[idx]);
    }
    expect(gesehen.size, "es sollten alle drei Fassungen vorkommen").toBe(3);
  });

  it("4-02 Runden: alle drei Fassungen stimmen mit dem Rundungsergebnis überein", () => {
    const stufen: Record<string, number> = {
      Zehner: 10, Hunderter: 100, Tausender: 1000, Zehntausender: 10000, Hunderttausender: 100000,
    };
    const gesehen = new Set<string>();
    for (const a of alleAufgaben("4-02")) {
      const haupt = /^(\d+) auf den (\w+) runden$/.exec(a.angabe);
      const paraphrase = /^Runde (\d+) auf den (\w+)$/.exec(a.angabe);
      const wahrFalsch = /^(\d+) auf (\w+) runden\.\n(\d+) - stimmt das\?$/.exec(a.angabe);
      if (haupt) {
        gesehen.add("haupt");
        const stufe = stufen[haupt[2]];
        expect(stufe, a.angabe).toBeDefined();
        expect(a.loesung, a.angabe).toBe(zahl(Math.round(Number(haupt[1]) / stufe) * stufe));
        continue;
      }
      if (paraphrase) {
        gesehen.add("paraphrase");
        const stufe = stufen[paraphrase[2]];
        expect(stufe, a.angabe).toBeDefined();
        expect(a.loesung, a.angabe).toBe(zahl(Math.round(Number(paraphrase[1]) / stufe) * stufe));
        continue;
      }
      expect(wahrFalsch, a.angabe).not.toBeNull();
      gesehen.add("wahrFalsch");
      const [, sz, wort, sBehauptet] = wahrFalsch!;
      const stufe = stufen[wort];
      expect(stufe, a.angabe).toBeDefined();
      const gerundet = Math.round(Number(sz) / stufe) * stufe;
      const stimmt = Number(sBehauptet) === gerundet;
      expect(a.loesung, a.angabe).toBe(stimmt ? "ja" : "nein");
    }
    expect(gesehen.size, "es sollten alle drei Fassungen vorkommen").toBe(3);
  });

  it("4-03 Ergänzen: die Summe trifft den nächsten Tausender oder eine Million", () => {
    for (const a of alleAufgaben("4-03")) {
      const gelesen = nachrechnenRechnung(a.angabe.includes("[]") ? a.angabe.replace("[]", a.loesung) : a.angabe);
      if (!gelesen) continue;
      const ziel = gelesen.a + gelesen.b;
      const trifftTausender = ziel % 1000 === 0;
      expect(trifftTausender || ziel === 1000000, a.angabe).toBe(true);
    }
  });

  it("4-04 Stufenzahlen: die Reihe geht in Zehnerschritten, die Lücke stimmt", () => {
    for (const a of alleAufgaben("4-04")) {
      expect(a.zahlen, a.angabe).toHaveLength(4);
      for (let i = 1; i < 4; i++) {
        const auf = a.zahlen[i] === a.zahlen[i - 1] * 10;
        const ab = a.zahlen[i] === a.zahlen[i - 1] / 10;
        expect(auf || ab, a.angabe).toBe(true);
      }
      const teile = a.angabe.split(", ");
      const weg = teile.indexOf("[]");
      expect(weg, a.angabe).toBeGreaterThanOrEqual(0);
      expect(a.loesung, a.angabe).toBe(zahl(a.zahlen[weg]));
    }
  });

  it("4-05 Schriftlich Plus: die Probe stimmt", () => {
    for (const a of alleAufgaben("4-05")) {
      const p = nachrechnenProbe(a.angabe);
      expect(p, a.angabe).not.toBeNull();
      expect(a.loesung, a.angabe).toBe(p!.wahr ? "ja" : "nein");
    }
  });

  it("4-06 Schriftlich Minus: die Probe stimmt UND der Minuend hat eine Null", () => {
    for (const a of alleAufgaben("4-06")) {
      const p = nachrechnenProbe(a.angabe);
      expect(p, a.angabe).not.toBeNull();
      expect(a.loesung, a.angabe).toBe(p!.wahr ? "ja" : "nein");
      const m = /^(\d+) -/.exec(a.angabe);
      expect(m, a.angabe).not.toBeNull();
      expect(/0/.test(m![1]), a.angabe).toBe(true);
    }
  });

  it("4-07 Schriftlich Mal: die Probe stimmt UND vierstellig mal zweistellig", () => {
    for (const a of alleAufgaben("4-07")) {
      const p = nachrechnenProbe(a.angabe);
      expect(p, a.angabe).not.toBeNull();
      expect(a.loesung, a.angabe).toBe(p!.wahr ? "ja" : "nein");
      const m = /^(\d+) \*(\d+) =/.exec(a.angabe);
      expect(m, a.angabe).not.toBeNull();
      expect(m![1].length, a.angabe).toBe(4);
      expect(m![2].length, a.angabe).toBeGreaterThanOrEqual(1);
      expect(m![2].length, a.angabe).toBeLessThanOrEqual(2);
    }
  });

  it("4-08 Division durch Zehnerzahl: die Probe stimmt UND geht ohne Rest auf", () => {
    for (const a of alleAufgaben("4-08")) {
      const p = nachrechnenProbe(a.angabe);
      expect(p, a.angabe).not.toBeNull();
      expect(a.loesung, a.angabe).toBe(p!.wahr ? "ja" : "nein");
      const m = /^(\d+) \/(\d+) =/.exec(a.angabe);
      expect(m, a.angabe).not.toBeNull();
      const divisor = Number(m![2]);
      expect(divisor % 10, a.angabe).toBe(0);
      expect(Number(m![1]) % divisor, a.angabe).toBe(0);
    }
  });

  it("4-09 Division zweistellig: die Probe stimmt, mal mit, mal ohne Rest", () => {
    let mitRest = 0, ohneRest = 0;
    for (const a of alleAufgaben("4-09")) {
      const p = nachrechnenProbe(a.angabe);
      expect(p, a.angabe).not.toBeNull();
      expect(a.loesung, a.angabe).toBe(p!.wahr ? "ja" : "nein");
      if (a.rest !== undefined) mitRest++; else ohneRest++;
    }
    expect(mitRest, "keine Aufgabe mit Rest dabei").toBeGreaterThan(0);
    expect(ohneRest, "keine Aufgabe ohne Rest dabei").toBeGreaterThan(0);
  });

  it("4-10 Überschlag: wahr/falsch stimmt", () => {
    for (const a of alleAufgaben("4-10")) {
      const p = nachrechnenProbe(a.angabe);
      expect(p, a.angabe).not.toBeNull();
      expect(a.loesung, a.angabe).toBe(p!.wahr ? "ja" : "nein");
    }
  });

  it("4-11 Probe bei Mal und Geteilt: stimmt, mal mit, mal ohne Rest", () => {
    for (const a of alleAufgaben("4-11")) {
      const p = nachrechnenProbe(a.angabe);
      expect(p, a.angabe).not.toBeNull();
      expect(a.loesung, a.angabe).toBe(p!.wahr ? "ja" : "nein");
    }
  });

  it("4-12 Stellen-Einmaleins: Ergebnis und operatives Päckchen stimmen", () => {
    for (const a of alleAufgaben("4-12")) {
      if (a.art === "ergebnis") {
        const gelesen = nachrechnenRechnung(a.angabe);
        expect(gelesen, a.angabe).not.toBeNull();
        expect(normal(a.loesung), a.angabe).toBe(normal(String(gelesen!.erwartet)));
        continue;
      }
      // folge: drei gerechnete Zeilen, die vierte offen
      const zeilen = a.angabe.split("\n");
      expect(zeilen, a.angabe).toHaveLength(4);
      for (let i = 0; i < 3; i++) {
        const g = nachrechnenRechnung(zeilen[i]);
        expect(g, zeilen[i]).not.toBeNull();
        expect(g!.erwartet, zeilen[i]).toBe(g!.a * g!.b);
      }
      const letzte = nachrechnenRechnung(zeilen[3]);
      expect(letzte, zeilen[3]).not.toBeNull();
      expect(a.loesung, a.angabe).toBe(zahl(letzte!.a * letzte!.b));
    }
  });

  it("4-13 Brüche anschaulich: alle drei Fassungen stimmen", () => {
    const gesehen = new Set<string>();
    for (const a of alleAufgaben("4-13")) {
      const wahrFalsch = /^(\d+) von (\d+) Teilen sind (\d+)\/(\d+) - stimmt das\?$/.exec(a.angabe);
      const luecke = /^(\d+) von (\d+) Teilen sind \[\]$/.exec(a.angabe);
      const vergleich = /^Was ist größer: (\d+)\/(\d+) oder (\d+)\/(\d+)\?$/.exec(a.angabe);
      if (wahrFalsch) {
        gesehen.add("wahrFalsch");
        const [, sRichtig, sNenner1, sGezeigt, sNenner2] = wahrFalsch;
        expect(sNenner1, a.angabe).toBe(sNenner2);
        expect([2, 4, 8], a.angabe).toContain(Number(sNenner1));
        const stimmt = sRichtig === sGezeigt;
        expect(a.loesung, a.angabe).toBe(stimmt ? "ja" : "nein");
        continue;
      }
      if (luecke) {
        gesehen.add("luecke");
        expect([2, 4, 8], a.angabe).toContain(Number(luecke[2]));
        expect(a.loesung, a.angabe).toBe(`${luecke[1]}/${luecke[2]}`);
        continue;
      }
      expect(vergleich, a.angabe).not.toBeNull();
      gesehen.add("vergleich");
      const [, z1, n1, z2, n2] = vergleich!;
      const w1 = Number(z1) / Number(n1);
      const w2 = Number(z2) / Number(n2);
      const erwartet = w1 === w2 ? "gleich groß" : w1 > w2 ? `${z1}/${n1}` : `${z2}/${n2}`;
      expect(a.loesung, a.angabe).toBe(erwartet);
    }
    expect(gesehen.size, "es sollten alle drei Fassungen vorkommen").toBe(3);
  });

  it("4-13 Vergleich: nie derselbe Bruch in derselben Schreibweise auf beiden Seiten", () => {
    for (const a of alleAufgaben("4-13", 80)) {
      const vergleich = /^Was ist größer: (\d+)\/(\d+) oder (\d+)\/(\d+)\?$/.exec(a.angabe);
      if (!vergleich) continue;
      const [, z1, n1, z2, n2] = vergleich;
      expect(`${z1}/${n1}` === `${z2}/${n2}`, a.angabe).toBe(false);
    }
  });

  it("4-13 Lücke: bei kürzbaren Brüchen gilt auch die gekürzte Form", () => {
    let kuerzbareGesehen = 0;
    for (const a of alleAufgaben("4-13", 80)) {
      const luecke = /^(\d+) von (\d+) Teilen sind \[\]$/.exec(a.angabe);
      if (!luecke) continue;
      const zaehler = Number(luecke[1]);
      const nenner = Number(luecke[2]);
      const t = ggt(zaehler, nenner);
      if (t === 1) continue; // schon vollständig gekürzt - nichts zu prüfen
      kuerzbareGesehen++;
      const gekuerzt = `${zaehler / t}/${nenner / t}`;
      expect(a.auchRichtig, a.angabe).toContain(gekuerzt);
      expect(istRichtig(gekuerzt, a), `${a.angabe}: ${gekuerzt} sollte gelten`).toBe(true);
    }
    expect(kuerzbareGesehen, "kein kürzbarer Bruch dabei - 2/4, 4/8 & Co. fehlen").toBeGreaterThan(0);
  });

  it("★ 4-13 und 4-14 nehmen jeden gleichwertigen Bruch an", () => {
    // Gemessen am 23.09.2026: „4 min sind wie viel von 4 min?" verlangte
    // `2/2` - `1` und `4/4` galten als falsch. Und zu „45 m von 60 m" galt
    // nur `3/4`, nicht `6/8`. Kürzen ist hier nicht die Aufgabe.
    let gesehen = 0;
    for (const id of ["4-13", "4-14"]) {
      for (const a of alleAufgaben(id)) {
        const m = /^(\d+)\/(\d+)$/.exec(a.loesung);
        if (!m) continue;
        gesehen++;
        const z = Number(m[1]), n = Number(m[2]);
        expect(istRichtig(`${z * 2}/${n * 2}`, a), `${a.angabe} ${z * 2}/${n * 2}`).toBe(true);
        if (z === n) expect(istRichtig("1", a), `${a.angabe} 1`).toBe(true);
        const t = ggt(z, n);
        expect(istRichtig(`${z / t}/${n / t}`, a), a.angabe).toBe(true);
        expect(istRichtig(`${z + 1}/${n}`, a), a.angabe).toBe(false);
      }
    }
    expect(gesehen).toBeGreaterThan(5);
  });

  it("4-14 Bruchteile von Größen: beide Fassungen stimmen, die Größe ist teilbar", () => {
    const gesehen = new Set<string>();
    for (const a of alleAufgaben("4-14")) {
      const [zaehler, nenner, groesse] = a.zahlen;
      expect(groesse % nenner, a.angabe).toBe(0);
      const anteil = (groesse / nenner) * zaehler;
      const vorwaerts = /^\d+\/\d+ von \d+ \S+ =\[\] \S+$/.exec(a.angabe);
      if (vorwaerts) {
        gesehen.add("vorwaerts");
        expect(normal(a.loesung), a.angabe).toBe(normal(zahl(anteil)));
        continue;
      }
      expect(/^\d+ \S+ sind wie viel von \d+ \S+\?$/.test(a.angabe), a.angabe).toBe(true);
      gesehen.add("rueckfrage");
      expect(a.loesung, a.angabe).toBe(`${zaehler}/${nenner}`);
    }
    expect(gesehen.size, "es sollten beide Fassungen vorkommen").toBeGreaterThanOrEqual(2);
  });

  it("4-15 Größen umwandeln: alle drei Fassungen stimmen", () => {
    const gesehen = new Set<string>();
    for (const a of alleAufgaben("4-15")) {
      const [grossAnzahl, kleinAnzahl, faktor] = a.zahlen;
      const gesamt = grossAnzahl * faktor + kleinAnzahl;
      const vorwaerts = /^\d+ \S+ \d+ \S+ = \[\] \S+$/.exec(a.angabe);
      const rueckwaerts = /^\d+ \S+ = \[\] \S+ \[\] \S+$/.exec(a.angabe);
      if (vorwaerts) {
        gesehen.add("vorwaerts");
        expect(a.loesung, a.angabe).toBe(zahl(gesamt));
        continue;
      }
      if (rueckwaerts) {
        gesehen.add("rueckwaerts");
        expect(a.loesung, a.angabe).toBe(`${grossAnzahl} und ${kleinAnzahl}`);
        continue;
      }
      // Vergleich: zweizeilig, "A oder B?" dann "Was ist ...?"
      const zeilen = a.angabe.split("\n");
      expect(zeilen, a.angabe).toHaveLength(2);
      gesehen.add("vergleich");
      expect(zeilen[1], a.angabe).toMatch(/^Was ist .+\?$/);
      const [seiteA, seiteBmitFragezeichen] = zeilen[0].split(" oder ");
      const seiteB = seiteBmitFragezeichen.replace(/\?$/, "");
      expect([seiteA, seiteB], a.angabe).toContain(a.loesung);
    }
    expect(gesehen.size, "es sollten alle drei Fassungen vorkommen").toBe(3);
  });

  it("4-15 Größen umwandeln: mindestens zwei verschiedene Einheiten-Paare je Lauf", () => {
    const gesehen = new Set<string>();
    for (const a of alleAufgaben("4-15", 40)) {
      const m = /^\d+ (\S+) \d+ (\S+) = \[\] \S+$/.exec(a.angabe);
      if (m) gesehen.add(`${m[1]}-${m[2]}`);
    }
    expect(gesehen.size).toBeGreaterThanOrEqual(2);
  });

  it("4-16 Direkte Proportionalität: die Kette rechnet sich zweimal richtig", () => {
    for (const a of alleAufgaben("4-16")) {
      const m = /^(\d+) \*(\d+) =\[\] \*(\d+) =\[\]$/.exec(a.angabe);
      expect(m, a.angabe).not.toBeNull();
      const [, sa, sb, sc] = m!;
      const zwischen = Number(sa) * Number(sb);
      const ende = zwischen * Number(sc);
      expect(a.loesung, a.angabe).toBe(`${zahl(zwischen)} und ${zahl(ende)}`);
    }
  });

  it("4-17 Wie rechnest du das?: der Kern liefert Zahlen nahe an einem Hunderter", () => {
    const b = bauart("4-17");
    const rng = zufall(55);
    for (let i = 0; i < 60; i++) {
      const kern = b(rng);
      expect(kern.sorte).toBe("rechnung");
      if (kern.sorte !== "rechnung") continue;
      expect(kern.op === "plus" || kern.op === "minus", JSON.stringify(kern)).toBe(true);
      expect(kern.op === "plus" ? kern.ergebnis : kern.ergebnis, JSON.stringify(kern)).toBe(
        kern.op === "plus" ? kern.a + kern.b : kern.a - kern.b,
      );
      if (kern.op === "minus") expect(kern.ergebnis, JSON.stringify(kern)).toBeGreaterThanOrEqual(0);
    }
  });

  it("4-18 Rechengeschichten: Text, Zahlen und Lösung passen zusammen", () => {
    // ★ Seit 23.09.2026 ist das ein Text und keine nackte Rechnung mehr.
    // Die Sprachregeln und die Zeilenbreite prüft `plus-sachaufgaben.test.ts`;
    // hier steht, was für DIESE Stufe gelten muss.
    const b = bauart("4-18");
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
      const wert = Number(normal(kern.loesung.replace(/[^0-9,-]/g, "")).replace(",", "."));
      expect(Number.isFinite(wert), kern.angabe).toBe(true);
      expect(wert, kern.angabe).toBeGreaterThanOrEqual(0);
      expect(wert, kern.angabe).toBeLessThanOrEqual(1000000);
    }
  });
});

describe("Die Zahlen bleiben im Rahmen", () => {
  it("keine Zahl über 1 000 000 - außer wo der Stoffplan es sagt (4-03 auf eine Million)", () => {
    for (const id of IDS) {
      for (const a of alleAufgaben(id, 15)) {
        for (const z of a.zahlen) {
          const grenze = id === "4-03" ? 1000000 : 999999;
          expect(z, `${id}: ${a.angabe}`).toBeLessThanOrEqual(grenze);
        }
      }
    }
  });

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

describe("Ein Lauf bleibt abwechslungsreich (direkt-Kerne mit varianten)", () => {
  it("4-01: 12 Aufgaben zeigen mindestens drei Fragestellungen", () => {
    const typen = new Set(einLauf("4-01", 12, 2026).map((a) => klassifiziere4_01(a.angabe)));
    expect(typen.size, [...typen].join(", ")).toBeGreaterThanOrEqual(3);
  });

  it("4-02: 12 Aufgaben zeigen mindestens drei Fragestellungen", () => {
    const typen = new Set(einLauf("4-02", 12, 2026).map((a) => klassifiziere4_02(a.angabe)));
    expect(typen.size, [...typen].join(", ")).toBeGreaterThanOrEqual(3);
  });

  it("4-13: 12 Aufgaben zeigen mindestens drei Fragestellungen", () => {
    const typen = new Set(einLauf("4-13", 12, 2026).map((a) => klassifiziere4_13(a.angabe)));
    expect(typen.size, [...typen].join(", ")).toBeGreaterThanOrEqual(3);
  });

  it("4-14: 12 Aufgaben zeigen mindestens zwei Fragestellungen", () => {
    const typen = new Set(einLauf("4-14", 12, 2026).map((a) => klassifiziere4_14(a.angabe)));
    expect(typen.size, [...typen].join(", ")).toBeGreaterThanOrEqual(2);
  });

  it("4-15: 12 Aufgaben zeigen mindestens drei Fragestellungen", () => {
    const typen = new Set(einLauf("4-15", 12, 2026).map((a) => klassifiziere4_15(a.angabe)));
    expect(typen.size, [...typen].join(", ")).toBeGreaterThanOrEqual(3);
  });

  it("jede Fassung ist für sich richtig - auch innerhalb desselben Laufs", () => {
    for (const id of ["4-01", "4-02", "4-13", "4-14", "4-15"]) {
      for (const a of einLauf(id, 12, 2026)) {
        expect(istRichtig(a.loesung, a), `${id}: ${a.angabe} -> ${a.loesung}`).toBe(true);
      }
    }
  });
});
