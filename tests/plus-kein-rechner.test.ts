/**
 * ★★★★★ PLUS STELLT KEINE AUFGABEN FÜR DEN TASCHENRECHNER.
 *
 * > **Johannes, 23.09.2026**, vor der Aufgabe `'w(140) rund auf zwei
 * > Nachkommastellen =`:
 * >
 * > „das ist nicht sinnvoll: solche aufgaben brauchen wir nicht, um das auf
 * > zwei nachkommastellen zu runden muss man die wurzel auf 3 stellen
 * > berechnen, in der 8. Klasse macht man das mit dem Rechner. Da macht einen
 * > Sinn, wir wollen nicht aufgaben in einen rechner kopieren, was man hier
 * > sagen kann, runde auf ganze zahlen, dann ist es im kopf lösbar und
 * > sinnvoll! … Wir wollen keine rechnungen für den taschenrechner, keine
 * > 3stelligen divisionen, keine ewig langen multiplikationen. Achte darauf
 * > dass die schulbücher ab der 7 schulstufe davon ausgehen dass schüler den
 * > rechner verwenden."
 *
 * ⚠️⚠️ DAS IST DER GRUND, WARUM ES PLUS GIBT. „Rechnen im Kopf und auf der
 * Zeile" heisst der Titel. Eine Aufgabe, die man in einen Rechner tippt, übt
 * das Tippen - und ein Kind mit Blindheit tippt sie zweimal so lange.
 *
 * ⚠️ Und die Schulbücher helfen hier NICHT: Ab der 7. Schulstufe setzen sie
 * den Rechner voraus. Was dort steht, lässt sich für Plus darum nicht
 * übernehmen, sondern muss auf die Frage zurückgeführt werden, die im Kopf
 * beantwortbar ist. Beim Zinseszins ist das der Änderungsfaktor, bei der
 * Wurzel die ganze Zahl.
 *
 * GEFUNDEN AM 23.09.2026, an 5152 erzeugten Aufgaben gemessen:
 *   8-02  51 Wurzeln „rund auf zwei Nachkommastellen"   ⇒ jetzt ganze Zahlen
 *   8-06  32 dasselbe                                   ⇒ rundet jetzt eine
 *                                                          Zahl, die dasteht
 *   8-13  29 Zinseszins mit ausgerechnetem Endwert      ⇒ jetzt der
 *                                                          Änderungsfaktor
 */
import { describe, expect, it } from "vitest";
import { PAKETE } from "../src/lib/plus/stoffplan";
import { bedienbarePakete, erzeugeLauf } from "../src/lib/plus/generator";
import type { Aufgabe } from "../src/lib/plus/aufgabe";

const ALLE: Aufgabe[] = [];
const spielbar = new Set(bedienbarePakete());
for (const p of PAKETE) {
  if (!spielbar.has(p.id)) continue;
  for (const saat of [1, 2, 3, 4, 5]) {
    try { ALLE.push(...erzeugeLauf(p.id, { anzahl: 8, saat })); } catch { /* Paket sagt ab */ }
  }
}

/** Die Angabe in einer Zeile - für die Ausdrücke unten. */
const zeile = (a: Aufgabe) => a.angabe.replace(/\n/g, " ");

describe("Die Regel", () => {
  it("es gibt genug Aufgaben, um sie zu messen", () => {
    expect(ALLE.length).toBeGreaterThan(4000);
  });

  it("★★★★★ keine Aufgabe verlangt eine Rundung auf zwei Nachkommastellen", () => {
    // Um auf zwei Stellen zu runden, muss man drei ausrechnen. Das ist der
    // Rechner. Auf ganze Zahlen oder eine Stelle zu runden ist Kopfarbeit.
    const rot = ALLE.filter((a) => /zwei Nachkommastellen|drei Nachkommastellen/.test(zeile(a)));
    expect(rot.map((a) => `${a.paket}: ${zeile(a)}`)).toEqual([]);
  });

  it("★★★★ keine Lösung ist ein ausgerechneter Zinseszins", () => {
    // `12600 *1,01^6 = 13375,15` - vierstellig mit Cent ist die Form, die
    // nur aus einer Potenzrechnung kommen kann.
    const rot = ALLE.filter((a) => /^\d{4,},\d\d$/.test(String(a.loesung)));
    expect(rot.map((a) => `${a.paket}: ${zeile(a)} => ${a.loesung}`)).toEqual([]);
  });

  it("★★★★ keine Division durch eine Zahl ab 100, die keine Zehnerzahl ist", () => {
    // Johannes: „keine 3stelligen divisionen". Durch 100, 200 oder 1000 zu
    // teilen ist dagegen Stellenschieben und genau das, was Plus übt.
    const rot: string[] = [];
    for (const a of ALLE) {
      for (const m of zeile(a).matchAll(/(\d+) \/(\d+)/g)) {
        if (Number(m[2]) >= 100 && Number(m[2]) % 10 !== 0) rot.push(`${a.paket}: ${zeile(a)}`);
      }
    }
    expect([...new Set(rot)]).toEqual([]);
  });

  it("★★★★ keine Multiplikation zweier krummer Zahlen ab 100", () => {
    // Johannes: „keine ewig langen multiplikationen". `4700 *1000` bleibt
    // erlaubt - das ist Nullen anhängen, kein Rechenweg.
    const rot: string[] = [];
    for (const a of ALLE) {
      for (const m of zeile(a).matchAll(/(\d+) \*(\d+)/g)) {
        const [x, y] = [Number(m[1]), Number(m[2])];
        if (x >= 100 && y >= 100 && x % 10 !== 0 && y % 10 !== 0) rot.push(`${a.paket}: ${zeile(a)}`);
      }
    }
    expect([...new Set(rot)]).toEqual([]);
  });

  it("★★★ lange Nachkommastellen kommen nur vom Stellenschieben", () => {
    // `40,948 /1000 = 0,040948` ist keine Rechenarbeit, sondern ein Komma,
    // das wandert - der Lerngegenstand von 5-07. Alles andere wäre Rechner.
    const rot = ALLE.filter((a) => {
      const nk = /,(\d+)$/.exec(String(a.loesung));
      if (!nk || nk[1].length <= 3) return false;
      // Erlaubt: durch eine Zehnerzahl teilen oder malnehmen (5-07) und die
      // Zehnerpotenz selbst (`10^-4 =0,0001`, 7-10) - beides Stellenwert,
      // kein Rechenweg.
      return !/ [*/](10|100|1000|10000)\b/.test(zeile(a)) && !/^10\^-\d+ =$/.test(zeile(a));
    });
    expect(rot.map((a) => `${a.paket}: ${zeile(a)} => ${a.loesung}`)).toEqual([]);
  });
});

/**
 * ★★★ DIE SPIELE ERZEUGEN IHRE ZAHLEN SELBST - und fallen damit durch jeden
 * Wächter, der nur die Pakete misst. Johannes am 23.09.2026: „Kontrolliere
 * noch einmal alle wege ob das für alle zutrifft."
 */
describe("Auch die Spiele stellen keine Rechner-Aufgaben", () => {
  const funde = new Set<string>();
  const pruefe = (quelle: string, text: string, loesung = "") => {
    const z = String(text).replace(/\n/g, " ");
    for (const m of z.matchAll(/(\d+) \/(\d+)/g)) {
      if (Number(m[2]) >= 100 && Number(m[2]) % 10 !== 0) funde.add(`${quelle}: ${z}`);
    }
    for (const m of z.matchAll(/(\d+) \*(\d+)/g)) {
      const [x, y] = [Number(m[1]), Number(m[2])];
      if (x >= 100 && y >= 100 && x % 10 !== 0 && y % 10 !== 0) funde.add(`${quelle}: ${z}`);
    }
    if (/zwei Nachkommastellen/.test(z)) funde.add(`${quelle}: ${z}`);
    // Erlaubt wie oben: die Zehnerpotenz selbst (`10^-4 =0,0001`) ist
    // Stellenwert, kein Rechenweg.
    if (/,\d{4,}$/.test(String(loesung)) && !/^10\^-\d+ =$/.test(z.trim())) {
      funde.add(`${quelle}: ${z} => ${loesung}`);
    }
  };

  it("über alle acht Stufen und alle sieben Rechenspiele", async () => {
    const { zufall } = await import("../src/lib/plus/aufgabe");
    const { neuesHeissKaltSpiel } = await import("../src/lib/plus/spiele/heisskalt");
    const { neuesPaareSpiel } = await import("../src/lib/plus/spiele/paare");
    const { grabaufgabe } = await import("../src/lib/plus/spiele/schatzgitter");
    const { SCHWEREN, turmaufgabe } = await import("../src/lib/plus/spiele/turmbau");
    const { neuerStrahl } = await import("../src/lib/plus/spiele/zahlenstrahl");
    const { neuesZielzahlSpiel } = await import("../src/lib/plus/spiele/zielzahl");
    const { duellaufgabe } = await import("../src/lib/plus/spiele/zugumzug");

    for (let stufe = 1; stufe <= 8; stufe++) {
      for (let s = 1; s <= 20; s++) {
        const r = zufall(s * 97 + stufe);
        const zz = neuesZielzahlSpiel(r, stufe);
        pruefe(`zielzahl/${stufe}`, `Ziel ${zz.ziel} aus ${zz.zahlen.join(", ")}`);
        for (const w of zz.weg) pruefe(`zielzahl-weg/${stufe}`, w);
        pruefe(`heisskalt/${stufe}`, String(neuesHeissKaltSpiel(r, stufe).bis));
        for (const k of neuesPaareSpiel(r, stufe).karten) pruefe(`paare/${stufe}`, String(k.text ?? ""));
        const g = grabaufgabe(r, stufe);
        pruefe(`schatz/${stufe}`, g.angabe, String(g.loesung));
        for (const sch of SCHWEREN) {
          const t = turmaufgabe(r, stufe, sch);
          pruefe(`turm/${stufe}/${sch}`, t.angabe, String(t.loesung));
        }
        const st = neuerStrahl(r, stufe);
        pruefe(`strahl/${stufe}`, `${st.von} bis ${st.bis}`, st.text);
        for (const runde of [1, 3, 5]) {
          const d = duellaufgabe(r, stufe, runde);
          pruefe(`duell/${stufe}/${runde}`, d.angabe, String(d.loesung));
        }
      }
    }
    expect([...funde]).toEqual([]);
  });

  it("★★ die Staffel nimmt nur Pakete, die EINE Zeile stellen", async () => {
    const { staffelFuer, etappeFuer } = await import("../src/lib/plus/staffel");
    const s = staffelFuer("3MS", "2026-40");
    for (let stufe = 1; stufe <= 8; stufe++) {
      for (let nr = 1; nr <= s.anzahl; nr++) {
        const e = etappeFuer("3MS", "2026-40", nr, stufe)!;
        pruefe(`staffel/${stufe}/${nr}`, e.aufgabe.angabe, String(e.aufgabe.loesung));
      }
    }
    expect([...funde]).toEqual([]);
  });
});

describe("Der Rechenweg bleibt überschaubar", () => {
  it("★★ kein Zeilenweg ist länger als acht Schritte", () => {
    // Ein Weg, der nicht mehr unter die Finger passt, ist keine Hilfe mehr.
    // Gemessen am 23.09.2026: der längste hat SECHS Schritte (4-05).
    const zuLang = ALLE.filter((a) => (a.weg?.length ?? 0) > 8);
    expect(zuLang.map((a) => `${a.paket}: ${zeile(a)} (${a.weg!.length})`)).toEqual([]);
  });
});

describe("Was an die Stelle getreten ist", () => {
  const von = (id: string) => ALLE.filter((a) => a.paket === id);

  it("8-02 fragt nach der ganzen Zahl - und die ist im Kopf zu finden", () => {
    const fragen = von("8-02").map((a) => zeile(a));
    expect(fragen.some((z) => /rund auf ganze Zahlen/.test(z))).toBe(true);
    expect(fragen.some((z) => /Zwischen welchen Zahlen liegt/.test(z))).toBe(true);
  });

  it("8-13 fragt nach dem Änderungsfaktor und der Rechnung", () => {
    const l = von("8-13").map((a) => String(a.loesung));
    expect(l.some((x) => /^1,\d\d$/.test(x))).toBe(true);
    expect(l.some((x) => /^\d+ \*1,\d\d\^\d+$/.test(x))).toBe(true);
  });

  it("8-06 rundet eine Zahl, die schon dasteht", () => {
    expect(von("8-06").some((a) => /^\d+,\d+ rund auf/.test(zeile(a)))).toBe(true);
  });
});
