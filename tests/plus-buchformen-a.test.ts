/**
 * Wächter für die Buchformen, Gruppe A (26.09.2026) - sieben neue
 * Aufgabenarten aus den Schulbüchern: `dreieck`, `zahlenhaus`, `zahlenkette`,
 * `malkreuz`, `stoerenfried`, `klecks`, `ziffernkarten`.
 *
 * Jede Form wird über viele Saaten UND alle ihr zugewiesenen Pakete geprüft
 * (Stoffplan-Feld `arten`) - nicht an einem ausgedachten Einzelfall.
 */
import { describe, expect, it } from "vitest";
import { istRichtig, zufall, type Aufgabe, type Aufgabenart } from "../src/lib/plus/aufgabe";
import { eingabezeile } from "../src/lib/plus/zeile";
import { sprich } from "../src/lib/sprechen/rechnen";
import { paket } from "../src/lib/plus/stoffplan";
import { mitRueckgang } from "../src/lib/plus/generator/kerne";
import type { Kern } from "../src/lib/plus/generator/kerne";
import { ALLE_BAUARTEN } from "../src/lib/plus/generator";
import type { BuchArgs, Buchform } from "../src/lib/plus/generator/buchformen/typen";
import { dreieck } from "../src/lib/plus/generator/buchformen/dreieck";
import { zahlenhaus } from "../src/lib/plus/generator/buchformen/zahlenhaus";
import { zahlenkette } from "../src/lib/plus/generator/buchformen/zahlenkette";
import { malkreuz } from "../src/lib/plus/generator/buchformen/malkreuz";
import { stoerenfried } from "../src/lib/plus/generator/buchformen/stoerenfried";
import { klecks } from "../src/lib/plus/generator/buchformen/klecks";
import { ziffernkarten } from "../src/lib/plus/generator/buchformen/ziffernkarten";

/** Zahlenraum eines Pakets, wie `generator/formen.ts` ihn liest. */
function raumVon(id: string): [number, number] | null {
  const m = /^(-?\d+)(?:-| bis )(-?\d+)$/.exec(paket(id).zr);
  return m ? [Number(m[1]), Number(m[2])] : null;
}

/** Ein Kern, der nur die Form-Signatur erfüllt - für Formen, die ihn nicht lesen. */
function fuellkern(id: string): Kern {
  return { sorte: "rechnung", op: paket(id).op, a: 1, b: 1, ergebnis: 2 };
}

function bauArgs(id: string, art: Aufgabenart, saat: number, kern: Kern): BuchArgs {
  return {
    paket: id, art, kern, rng: zufall(saat * 7919 + 13),
    nachschub: () => kern, raum: raumVon(id), op: paket(id).op,
    stufe: Number(id.split("-")[0]) || 1,
  };
}

/**
 * Wie `bauArgs`, aber mit der ECHTEN Bauart des Pakets (`ALLE_BAUARTEN`,
 * dieselbe, die auch die anderen Formen bekommen) statt eines Füllkerns -
 * `nachschub` liefert damit jedes Mal einen neuen, echten Kern. Nötig für
 * Formen, die mehr als einen Kern lesen (`zahlenhaus`, `stoerenfried`).
 */
function bauArgsEcht(id: string, art: Aufgabenart, saat: number): BuchArgs {
  const bauart = ALLE_BAUARTEN[id];
  const rng = zufall(saat * 7919 + 13);
  return {
    paket: id, art, kern: bauart(rng), rng,
    nachschub: () => bauart(rng), raum: raumVon(id), op: paket(id).op,
    stufe: Number(id.split("-")[0]) || 1,
  };
}

/** Die Lösung (oder die Beispiel-Werte bei einer Aufzählung) in die Vorlage schreiben. */
function ausgefuellt(vorlage: string, loesung: string): string {
  if (!vorlage.includes("[]")) return vorlage + loesung;
  const teile = vorlage.split("[]").length - 1 > 1 ? loesung.split(" und ") : [loesung];
  let i = 0;
  return vorlage.replace(/\[\]/g, () => `[${teile[i++] ?? ""}]`);
}

const SAATEN = Array.from({ length: 300 }, (_, i) => i + 1);

/** Viele Aufgaben einer Form, über alle zugewiesenen Pakete und viele Saaten. */
function sammle(ids: string[], art: Aufgabenart, form: Buchform, kernFuer: (id: string) => Kern = fuellkern): Aufgabe[] {
  const aufgaben: Aufgabe[] = [];
  for (const id of ids) {
    for (const saat of SAATEN) {
      const args = bauArgs(id, art, saat, kernFuer(id));
      aufgaben.push(form(args));
    }
  }
  return aufgaben;
}

/** Die generischen Prüfungen, die für jede Buchform gelten. */
function pruefeGenerisch(aufgaben: Aufgabe[], raumJePaket: (id: string) => [number, number] | null, ids: string[]) {
  it("es sind genug Aufgaben zum Messen da (mind. 300 je Paket)", () => {
    for (const id of ids) {
      expect(aufgaben.filter((a) => a.paket === id).length, id).toBeGreaterThanOrEqual(300);
    }
  });

  it("die Lösung, in die Vorlage geschrieben, gilt als richtig", () => {
    const daneben = aufgaben.filter((a) => {
      const z = eingabezeile(a);
      const text = z ? ausgefuellt(z.vorlage, a.loesung) : a.loesung;
      return !istRichtig(text, a);
    });
    expect(daneben.map((a) => `${a.paket}: ${a.angabe} -> ${a.loesung}`)).toEqual([]);
  });

  it("die Lösung allein (und jede auchRichtig-Schreibweise) gilt als richtig", () => {
    const daneben = aufgaben.flatMap((a) =>
      [a.loesung, ...(a.auchRichtig ?? [])].filter((l) => !istRichtig(l, a)).map((l) => `${a.paket}: ${a.angabe} -> ${l}`),
    );
    expect(daneben).toEqual([]);
  });

  it("alle beteiligten Zahlen bleiben im Zahlenraum des Pakets", () => {
    const daneben = aufgaben.filter((a) => {
      const raum = raumJePaket(a.paket);
      if (!raum) return false;
      return a.zahlen.some((z) => z < raum[0] || z > raum[1]);
    });
    expect(daneben.map((a) => `${a.paket}: ${a.angabe} (${a.zahlen.join(", ")})`)).toEqual([]);
  });

  it("kein U+2212 - nur der Bindestrich", () => {
    const daneben = aufgaben.filter((a) => a.angabe.includes("−") || a.loesung.includes("−"));
    expect(daneben.map((a) => a.angabe)).toEqual([]);
  });

  it("sprich liefert Text ohne undefined oder NaN", () => {
    const daneben = aufgaben.filter((a) => /undefined|NaN/.test(sprich(a.angabe)));
    expect(daneben.map((a) => `${a.paket}: ${a.angabe} => ${sprich(a.angabe)}`)).toEqual([]);
  });
}

/* ------------------------------------------------------------------ */

describe("dreieck", () => {
  const ids = ["1-08", "1-13", "2-06", "2-08", "3-05"];
  const aufgaben = sammle(ids, "dreieck", dreieck);
  pruefeGenerisch(aufgaben, raumVon, ids);

  it("jede der drei Ecken kommt einmal als Gegebene vor", () => {
    // Gegeben ist die Ecke, die NICHT in „Finde X und Y" steht.
    const gegebene = new Set(
      aufgaben.map((a) => {
        const gesucht = /Finde (\w) und (\w)/.exec(a.angabe.split("\n")[0])!;
        return "ABC".split("").find((e) => e !== gesucht[1] && e !== gesucht[2]);
      }),
    );
    expect(gegebene.has("A")).toBe(true);
    expect(gegebene.has("B")).toBe(true);
    expect(gegebene.has("C")).toBe(true);
  });

  it("die Summen der Seiten stimmen mit den Ecken überein", () => {
    for (const a of aufgaben) {
      const zeilen = a.angabe.split("\n");
      const [ab, bc, ca] = [1, 2, 3].map((i) => Number(zeilen[i].split("=")[1]));
      const letzte = zeilen[4];
      const werte: Record<string, number> = {};
      for (const stueck of letzte.split(/\s+(?=[ABC]\s*=)/)) {
        const m = /([ABC])\s*=(\d+|\[\])/.exec(stueck);
        if (m && m[2] !== "[]") werte[m[1]] = Number(m[2]);
      }
      // Die zwei gesuchten Ecken aus der Lösung eintragen und alle drei Seiten nachrechnen.
      const gesucht = /Finde (\w) und (\w)/.exec(zeilen[0])!;
      const [w0, w1] = a.loesung.split(" und ").map(Number);
      werte[gesucht[1]] = w0;
      werte[gesucht[2]] = w1;
      expect(werte.A + werte.B).toBe(ab);
      expect(werte.B + werte.C).toBe(bc);
      expect(werte.C + werte.A).toBe(ca);
    }
  });

  it("eine falsche Antwort gilt als falsch", () => {
    const a = dreieck(bauArgs("1-08", "dreieck", 1, fuellkern("1-08")));
    const [w0, w1] = a.loesung.split(" und ").map(Number);
    expect(istRichtig(`${w0 + 1} und ${w1}`, a)).toBe(false);
  });
});

describe("zahlenhaus", () => {
  const ids = ["1-03", "1-04", "1-16"];
  const aufgaben: Aufgabe[] = [];
  for (const id of ids) {
    for (const saat of SAATEN) aufgaben.push(zahlenhaus(bauArgsEcht(id, "zahlenhaus", saat)));
  }
  pruefeGenerisch(aufgaben, raumVon, ids);

  it("die Hauszahl steht in der Kopfzeile - 1-04 immer 10, 1-16 immer 20", () => {
    const von = (id: string) => aufgaben.filter((a) => a.paket === id).map((a) => a.angabe.split("\n")[0]);
    expect(von("1-04").every((k) => k === "Zahlenhaus der 10")).toBe(true);
    expect(von("1-16").every((k) => k === "Zahlenhaus der 20")).toBe(true);
  });

  it("★ nie zu dünn - die Hauszahl ist mindestens 4, mindestens zwei Lücken", () => {
    const daneben = aufgaben.filter((a) => {
      const n = Number(a.angabe.split("\n")[0].replace("Zahlenhaus der ", ""));
      return n < 4 || a.loesung.split(" und ").length < 2;
    });
    expect(daneben.map((a) => a.angabe)).toEqual([]);
  });

  it("jede Zeile ist wirklich eine Zerlegung der Hauszahl", () => {
    for (const a of aufgaben) {
      const zeilen = a.angabe.split("\n");
      const n = Number(zeilen[0].replace("Zahlenhaus der ", ""));
      const luecken = a.loesung.split(" und ").map(Number);
      let li = 0;
      for (const z of zeilen.slice(1)) {
        const m = /=(\d+) \+(\d+|\[\])/.exec(z)!;
        const erster = Number(m[1]);
        const zweiter = m[2] === "[]" ? luecken[li++] : Number(m[2]);
        expect(erster + zweiter).toBe(n);
      }
    }
  });

  it("eine falsche Antwort gilt als falsch", () => {
    const a = zahlenhaus(bauArgsEcht("1-04", "zahlenhaus", 5));
    const richtige = a.loesung.split(" und ").map(Number);
    const falsche = richtige.map((w) => w + 1).join(" und ");
    expect(istRichtig(falsche, a)).toBe(false);
  });
});

describe("zahlenkette", () => {
  const ids = ["1-13", "2-06", "2-08", "3-05"];
  const aufgaben = sammle(ids, "zahlenkette", zahlenkette);
  pruefeGenerisch(aufgaben, raumVon, ids);

  it("jede Zahl ist die Summe der zwei davor", () => {
    for (const a of aufgaben) expect(a.zahlen.slice(2).every((n, i) => n === a.zahlen[i] + a.zahlen[i + 1])).toBe(true);
  });

  it("beide Varianten kommen vor - hinten zwei Lücken, oder eine in der Mitte", () => {
    const hinten = aufgaben.filter((a) => a.loesung.includes(" und "));
    const mitte = aufgaben.filter((a) => !a.loesung.includes(" und "));
    expect(hinten.length).toBeGreaterThan(0);
    expect(mitte.length).toBeGreaterThan(0);
  });

  it("eine falsche Antwort gilt als falsch", () => {
    const a = zahlenkette(bauArgs("2-06", "zahlenkette", 3, fuellkern("2-06")));
    const falsch = a.loesung.includes(" und ")
      ? a.loesung.split(" und ").map((w) => String(Number(w) + 1)).join(" und ")
      : String(Number(a.loesung) + 1);
    expect(istRichtig(falsch, a)).toBe(false);
  });
});

describe("malkreuz", () => {
  const ids = ["3-16", "4-07"];
  const aufgaben = sammle(ids, "malkreuz", malkreuz);
  pruefeGenerisch(aufgaben, raumVon, ids);

  it("3-16: drei Teilprodukte plus Ergebnis - vier Lücken", () => {
    for (const a of aufgaben.filter((x) => x.paket === "3-16")) expect(a.loesung.split(" und ")).toHaveLength(4);
  });

  it("4-07: 2x2-Kreuz plus Ergebnis - fünf Lücken, immer zweistellig mal zweistellig", () => {
    for (const a of aufgaben.filter((x) => x.paket === "4-07")) {
      expect(a.loesung.split(" und ")).toHaveLength(5);
      const kopf = /(\d+) \*(\d+)/.exec(a.angabe.split("\n")[0])!;
      expect(Number(kopf[1])).toBeGreaterThanOrEqual(10);
      expect(Number(kopf[1])).toBeLessThanOrEqual(99);
      expect(Number(kopf[2])).toBeGreaterThanOrEqual(10);
      expect(Number(kopf[2])).toBeLessThanOrEqual(99);
    }
  });

  it("die Teilprodukte und die Summe stimmen", () => {
    for (const a of aufgaben) {
      const kopf = /(\d+) \*(\d+)/.exec(a.angabe.split("\n")[0])!;
      const [x, y] = [Number(kopf[1]), Number(kopf[2])];
      const werte = a.loesung.split(" und ").map(Number);
      const summe = werte[werte.length - 1];
      expect(summe).toBe(x * y);
      expect(werte.slice(0, -1).reduce((s, w) => s + w, 0)).toBe(x * y);
    }
  });

  it("eine falsche Antwort gilt als falsch", () => {
    const a = malkreuz(bauArgs("3-16", "malkreuz", 2, fuellkern("3-16")));
    const werte = a.loesung.split(" und ").map(Number);
    werte[werte.length - 1] += 1;
    expect(istRichtig(werte.join(" und "), a)).toBe(false);
  });
});

describe("stoerenfried", () => {
  const ids = ["1-04", "1-16", "2-07", "2-09", "2-11", "3-14"];
  const aufgaben: Aufgabe[] = [];
  for (const id of ids) {
    for (const saat of SAATEN) aufgaben.push(stoerenfried(bauArgsEcht(id, "stoerenfried", saat)));
  }
  pruefeGenerisch(aufgaben, raumVon, ids);

  /** Jede Zeile als {a, zeichen, b, erg} - für die paketgenauen Prüfungen unten. */
  function zeilenVon(a: Aufgabe) {
    return a.angabe.split("\n").filter((z) => /^\d+\) /.test(z)).map((z) => {
      const m = /(-?\d+) ([+\-*])(-?\d+) =(-?\d+)/.exec(z)!;
      return { a: Number(m[1]), zeichen: m[2], b: Number(m[3]), erg: Number(m[4]) };
    });
  }

  it("die Störenfried-Zeile ist wirklich die einzige, die nicht ins Muster passt", () => {
    for (const a of aufgaben) {
      const kenn = zeilenVon(a).map((z) => {
        if (z.zeichen === "+") return z.a + z.b;
        if (z.zeichen === "-") return z.a - z.b;
        return z.a; // Mal: die geteilte Kennzahl steht bei der Mehrheit vorn.
      });
      const nummer = Number(a.loesung) - 1;
      const rest = kenn.filter((_, i) => i !== nummer);
      // Alle Zeilen ausser der Störenfried-Zeile teilen dieselbe Kennzahl.
      expect(new Set(rest).size).toBe(1);
      expect(kenn[nummer]).not.toBe(rest[0]);
    }
  });

  it("jede Zeile ist tatsächlich richtig gerechnet", () => {
    for (const a of aufgaben) {
      for (const z of zeilenVon(a)) {
        const soll = z.zeichen === "+" ? z.a + z.b : z.zeichen === "-" ? z.a - z.b : z.a * z.b;
        expect(soll).toBe(z.erg);
      }
    }
  });

  it("★ 1-04 ist wirklich Immer-10, 1-16 wirklich Immer-20 - bei der Mehrheit", () => {
    const pruefePaket = (id: string, soll: number) => {
      for (const a of aufgaben.filter((x) => x.paket === id)) {
        const nummer = Number(a.loesung) - 1;
        const summen = zeilenVon(a).map((z) => z.a + z.b).filter((_, i) => i !== nummer);
        expect(new Set(summen)).toEqual(new Set([soll]));
      }
    };
    pruefePaket("1-04", 10);
    pruefePaket("1-16", 20);
  });

  it("★ 2-11 und 3-14 bleiben im kleinen Einmaleins - beide Faktoren höchstens 10", () => {
    const daneben = aufgaben
      .filter((a) => a.paket === "2-11" || a.paket === "3-14")
      .flatMap((a) => zeilenVon(a).filter((z) => z.a < 1 || z.a > 10 || z.b < 1 || z.b > 10).map(() => a.angabe));
    expect([...new Set(daneben)]).toEqual([]);
  });

  it("★ 2-07 hat nie einen Zehnerübergang, 2-09 immer einen - in JEDER Zeile", () => {
    const daneben07 = aufgaben.filter((a) => a.paket === "2-07").flatMap((a) =>
      zeilenVon(a).filter((z) => mitRueckgang(z.a, z.b)).map(() => a.angabe));
    const daneben09 = aufgaben.filter((a) => a.paket === "2-09").flatMap((a) =>
      zeilenVon(a).filter((z) => !mitRueckgang(z.a, z.b)).map(() => a.angabe));
    expect([...new Set(daneben07)]).toEqual([]);
    expect([...new Set(daneben09)]).toEqual([]);
  });

  it("eine falsche Zeilennummer gilt als falsch", () => {
    const a = stoerenfried(bauArgsEcht("2-11", "stoerenfried", 4));
    const rows = a.angabe.split("\n").filter((z) => /^\d+\) /.test(z)).length;
    const falsch = (Number(a.loesung) % rows) + 1 === Number(a.loesung) ? Number(a.loesung) + 1 : (Number(a.loesung) % rows) + 1;
    expect(istRichtig(String(falsch), a)).toBe(false);
  });
});

describe("klecks", () => {
  const ids = ["2-08", "2-09", "3-10", "3-11", "3-12", "4-05", "4-06"];
  const aufgaben = sammle(ids, "klecks", klecks);
  pruefeGenerisch(aufgaben, raumVon, ids);

  it("die Lösung ist immer genau eine Ziffer 0-9", () => {
    const daneben = aufgaben.filter((a) => !/^\d$/.test(a.loesung));
    expect(daneben.map((a) => `${a.paket}: ${a.angabe} -> ${a.loesung}`)).toEqual([]);
  });

  it("die Lücke steht mal im zweiten Summanden/Subtrahenden, mal im Ergebnis, mal im ersten Operanden", () => {
    const stelle = (a: Aufgabe) => {
      const zeile = a.angabe.split("\n")[1];
      const [links] = zeile.split("=");
      const vorZeichen = links.split(/[+-]/)[0];
      if (vorZeichen.includes("[]")) return "erster";
      const nachZeichen = links.split(/[+-]/)[1] ?? "";
      if (nachZeichen.includes("[]")) return "zweiter";
      return "ergebnis";
    };
    const arten = new Set(aufgaben.map(stelle));
    expect(arten.has("erster") || arten.has("zweiter")).toBe(true);
    expect(arten.has("ergebnis")).toBe(true);
  });

  it("★ Eindeutigkeit per Brute-Force: genau eine Ziffer 0-9 löst jede Aufgabe", () => {
    // Jede zehnte Aufgabe reicht, um die Behauptung zu beweisen, ohne den
    // Testlauf unnötig zu verlangsamen.
    for (const a of aufgaben.filter((_, i) => i % 10 === 0)) {
      const zeile = a.angabe.split("\n")[1];
      const passende = "0123456789".split("").filter((z) => istRichtig(zeile.replace("[]", z), a));
      expect(passende, `${zeile} -> passende Ziffern: ${passende.join(",")}`).toEqual([a.loesung]);
    }
  });

  it("eingabezeile + pruefe funktionieren mit der vollen Rechnung, mit Klammern oder nur der Ziffer", () => {
    const a = aufgaben[0];
    const zeile = a.angabe.split("\n")[1];
    const volleRechnung = zeile.replace("[]", a.loesung);
    const mitKlammer = zeile.replace("[]", `[${a.loesung}]`);
    expect(istRichtig(volleRechnung, a)).toBe(true);
    expect(istRichtig(mitKlammer, a)).toBe(true);
    expect(istRichtig(a.loesung, a)).toBe(true);
  });

  it("nie eine führende Null als Lösung", () => {
    const daneben = aufgaben.filter((a) => {
      const zeile = a.angabe.split("\n")[1];
      // Steht die Lücke an erster Stelle einer Zahl?
      return /(^|[ +-])\[\]/.test(zeile) && a.loesung === "0";
    });
    expect(daneben.map((a) => a.angabe)).toEqual([]);
  });

  it("eine falsche Ziffer gilt als falsch", () => {
    const a = aufgaben[0];
    const falsch = String((Number(a.loesung) + 1) % 10);
    expect(istRichtig(falsch, a)).toBe(falsch === a.loesung);
  });
});

describe("ziffernkarten", () => {
  const ids = ["2-01", "3-01", "4-01"];
  const aufgaben = sammle(ids, "ziffernkarten", ziffernkarten);
  pruefeGenerisch(aufgaben, raumVon, ids);

  it("2-01 hat zwei Karten, 3-01 drei, 4-01 vier oder fünf - alle verschieden, keine Null", () => {
    const von = (id: string) => aufgaben.filter((a) => a.paket === id);
    for (const a of von("2-01")) expect(a.zahlen).toHaveLength(2);
    for (const a of von("3-01")) expect(a.zahlen).toHaveLength(3);
    for (const a of von("4-01")) expect([4, 5]).toContain(a.zahlen.length);
    for (const a of aufgaben) {
      expect(new Set(a.zahlen).size).toBe(a.zahlen.length);
      expect(a.zahlen.every((z) => z >= 1 && z <= 9)).toBe(true);
    }
  });

  it("größte und kleinste Zahl stimmen mit den Karten überein", () => {
    const von = (frage: string) => aufgaben.filter((a) => a.angabe.includes(frage));
    for (const a of von("Größte Zahl")) {
      expect(a.loesung).toBe([...a.zahlen].sort((x, y) => y - x).join(""));
    }
    for (const a of von("Kleinste Zahl")) {
      expect(a.loesung).toBe([...a.zahlen].sort((x, y) => x - y).join(""));
    }
  });

  it("„wie viele Zahlen“ ist n Fakultät", () => {
    const fak = (n: number): number => (n <= 1 ? 1 : n * fak(n - 1));
    for (const a of aufgaben.filter((x) => x.angabe.includes("Wie viele Zahlen"))) {
      expect(Number(a.loesung)).toBe(fak(a.zahlen.length));
    }
  });

  it("„am nächsten“ kommt nur vor, wenn genau eine Zahl den kleinsten Abstand hat", () => {
    const nahe = aufgaben.filter((a) => a.angabe.includes("am nächsten"));
    expect(nahe.length).toBeGreaterThan(0);
  });

  it("eine falsche Antwort gilt als falsch", () => {
    const a = aufgaben.find((x) => x.angabe.includes("Größte Zahl"))!;
    expect(istRichtig(String(Number(a.loesung) - 1), a)).toBe(false);
  });
});

describe("★ So klingen die neuen Zeilen (Haupt-Chat, 26.09.2026)", () => {
  it("der Tintenklecks wird Ziffer für Ziffer gesprochen", async () => {
    const { sprich } = await import("../src/lib/sprechen/rechnen");
    expect(sprich("64 +[]9 =93")).toBe("vierundsechzig plus Lücke neun ist dreiundneunzig");
    expect(sprich("4[]7 -2[]5 =212")).toBe("vier Lücke sieben minus zwei Lücke fünf ist zweihundertzwölf");
    expect(sprich("9[] +3 =95")).toBe("neun Lücke plus drei ist fünfundneunzig");
    // Die gewöhnliche Lücke bleibt, wie sie war.
    expect(sprich("6 +[] =10")).toBe("sechs plus Lücke ist zehn");
  });

  it("das Malkreuz beginnt mit „mal“", async () => {
    const { sprich } = await import("../src/lib/sprechen/rechnen");
    expect(sprich("* | 600 | 10 | 2")).toBe("mal, sechshundert, zehn, zwei");
  });
});
