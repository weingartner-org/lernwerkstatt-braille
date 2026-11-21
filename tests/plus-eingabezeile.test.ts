/**
 * Wächter: Die Rechnung steht im Feld - und die Prüfung liest sie richtig.
 *
 * Johannes, 25.09.2026: „Rechnungen, bei denen etwas auszufüllen ist, sollen
 * gleich in der Eingabezeile stehen." Damit ändert sich, WAS geprüft wird: nicht
 * mehr die blosse Zahl, sondern eine Zeile, in der die Zahl steckt.
 *
 * ★ Gemessen wird über ALLE Pakete, nicht an ausgedachten Beispielen. Jede
 * Aufgabe muss vier Dinge können:
 *   1. Die Zeile, wie sie kam, ist LEER - kein Versuch, kein „Noch nicht".
 *   2. Die Zeile mit der Lösung darin ist RICHTIG.
 *   3. Die Lösung allein ist RICHTIG - wer die Zeile löscht, hat gerechnet.
 *   4. Die Zeile mit einer falschen Zahl ist NICHT richtig.
 */
import { describe, expect, it } from "vitest";
import { istRichtig, pruefe, type Aufgabe } from "../src/lib/plus/aufgabe";
import { erzeugeLauf } from "../src/lib/plus/generator";
import { PAKETE } from "../src/lib/plus/stoffplan";
import { antwortAus, eingabezeile } from "../src/lib/plus/zeile";

/** Alle Aufgaben aus allen Paketen - drei Läufe je Paket. */
const ALLE: Aufgabe[] = PAKETE.flatMap((p) =>
  [11, 22, 33].flatMap((saat) => erzeugeLauf(p.id, { anzahl: 12, saat })),
);

/** Die Lösung in die Zeile schreiben - so, wie ein Kind es tut. */
function ausgefuellt(vorlage: string, loesung: string): string {
  if (!vorlage.includes("[]")) return vorlage + loesung;
  const teile = vorlage.split("[]").length - 1 > 1 ? loesung.split(" und ") : [loesung];
  let i = 0;
  return vorlage.replace(/\[\]/g, () => `[${teile[i++] ?? ""}]`);
}

describe("Die Rechnung steht im Feld", () => {
  it("in jeder Aufgabe, die eine Lücke hat oder auf = endet", () => {
    const mitZeile = ALLE.filter((a) => eingabezeile(a));
    // Die meisten Aufgaben sind Rechenzeilen - wäre es plötzlich nur eine
    // Handvoll, hätte sich die Erkennung verschluckt.
    expect(mitZeile.length / ALLE.length).toBeGreaterThan(0.5);
    for (const a of mitZeile) {
      const z = eingabezeile(a)!;
      const letzte = a.angabe.split("\n").pop()!;
      // Die Klammern stehen IMMER da (Johannes, 13.10.2026); ohne sie beginnt die Zeile wie die Angabe.
      const ohne = z.vorlage.replace(/ ?\[\]$/, "");
      expect(letzte.startsWith(ohne.trimEnd()) || a.angabe.replace(/\n/g, " ").startsWith(ohne.trimEnd()) || a.angabe.split("\n").map((x) => x.trim()).filter(Boolean).join(" ") === ohne.trimEnd() || letzte.includes("[]"), a.angabe).toBe(true);
      expect(z.vorlage, a.angabe).toContain("[]");
      // Die Schreibmarke steht IN der Lücke.
      expect(z.vorlage.slice(z.marke - 1, z.marke + 1)).toBe("[]");
    }
  });

  it("aber nicht in der Zahlenmauer - ihre Lücken stehen in mehreren Zeilen", () => {
    const mauer = ALLE.filter((a) => a.art === "mauer" && a.angabe.includes("\n"));
    expect(mauer.length).toBeGreaterThan(0);
    for (const a of mauer) expect(eingabezeile(a)).toBeNull();
  });

  it("mehrzeilig nur beim schriftlichen Rechnen", () => {
    const mehr = ALLE.filter((a) => eingabezeile(a)?.mehrzeilig);
    expect(mehr.length).toBeGreaterThan(0);
    for (const a of mehr) expect(a.art).toBe("zeilen");
  });
});

describe("Die Prüfung liest die Zeile - über alle Pakete", () => {
  const mitZeile = ALLE.filter((a) => eingabezeile(a) && !a.bereich);

  it("1. die Zeile, wie sie kam, ist leer - nicht falsch", () => {
    const daneben = mitZeile.filter((a) => pruefe(eingabezeile(a)!.vorlage, a).stand !== "leer");
    expect(daneben.map((a) => `${a.paket}: ${a.angabe}`)).toEqual([]);
  });

  it("2. die Zeile mit der Lösung darin ist richtig", () => {
    const daneben = mitZeile.filter((a) => !istRichtig(ausgefuellt(eingabezeile(a)!.vorlage, a.loesung), a));
    expect(daneben.map((a) => `${a.paket}: ${ausgefuellt(eingabezeile(a)!.vorlage, a.loesung)}`)).toEqual([]);
  });

  it("3. die Lösung allein ist richtig - auch jede andere erlaubte Schreibweise", () => {
    // ★ 16.10.2026 (Johannes): Die blosse Zahl einer Lösung mit Einheit ist
    // „Einheit fehlt", nicht richtig - sie steht nur noch in `auchRichtig`,
    // damit „richtig gerechnet" erkannt wird.
    const nurEinheit = (l: string, a: (typeof ALLE)[number]) =>
      /^[\d,]+$/.test(l.trim()) && pruefe(l, a).stand === "einheit";
    const daneben = ALLE.filter((a) => !a.bereich).flatMap((a) =>
      [a.loesung, ...(a.auchRichtig ?? [])].filter((l) => !istRichtig(l, a) && !nurEinheit(l, a)).map((l) => `${a.paket}: ${a.angabe} -> ${l}`),
    );
    expect(daneben).toEqual([]);
  });

  it("4. eine falsche Zahl in der Zeile ist nicht richtig", () => {
    const zahlen = mitZeile.filter((a) => /^-?\d+$/.test(a.loesung));
    expect(zahlen.length).toBeGreaterThan(1000);
    const daneben = zahlen.filter((a) => {
      const falsch = String(Number(a.loesung) + 1);
      return istRichtig(ausgefuellt(eingabezeile(a)!.vorlage, falsch), a);
    });
    expect(daneben.map((a) => a.angabe)).toEqual([]);
  });
});

describe("Die Zeile im Einzelnen", () => {
  const luecke: Aufgabe = { paket: "1-04", art: "luecke_zahl", op: "plus", angabe: "6 +[] =10", loesung: "4", zahlen: [6, 4] };
  const ergebnis: Aufgabe = { paket: "2-08", art: "ergebnis", op: "plus", angabe: "48 +27 =", loesung: "75", zahlen: [48, 27] };
  const kette: Aufgabe = {
    paket: "2-06", art: "kette", op: "plus", angabe: "36 +13 =[] +12 =[]", loesung: "49 und 61",
    auchRichtig: ["49, 61", "49 61"], zahlen: [36, 13, 12],
  };

  it("die Klammern der Lücke dürfen bleiben, fehlen oder doppelt stehen", () => {
    for (const z of ["6 +[4] =10", "6 +4 =10", "6 +[[4]] =10", "6+[ 4 ]=10", "  6 +[4] =10 "]) {
      expect(istRichtig(z, luecke), z).toBe(true);
    }
    expect(istRichtig("6 +[5] =10", luecke)).toBe(false);
  });

  it("wer vorne an der Rechnung etwas ändert, hört das - und bekommt kein Kreuz", () => {
    expect(pruefe("5 +[5] =10", luecke).stand).toBe("veraendert");
    expect(pruefe("48 +28 =76", ergebnis).stand).toBe("veraendert");
  });

  it("die abgeschriebene Angabe ist keine Antwort", () => {
    expect(pruefe("48 +27 =", ergebnis).stand).toBe("leer");
    expect(pruefe("6 +[] =10", luecke).stand).toBe("leer");
  });

  it("zwei Lücken: beide der Reihe nach - und eine leere Lücke ist nicht falsch", () => {
    expect(istRichtig("36 +13 =[49] +12 =[61]", kette)).toBe(true);
    expect(istRichtig("36 +13 =[61] +12 =[49]", kette)).toBe(false);
    expect(pruefe("36 +13 =[49] +12 =[]", kette).stand).toBe("teilweise");
  });

  it("★ was nach dem letzten = steht, ist die Antwort (eine andere App der Plattform , 11.09.2026)", () => {
    const zwei: Aufgabe = { paket: "5-05", art: "ergebnis", op: "gemischt", angabe: "14 *12 +48 *12 =", loesung: "744", zahlen: [14, 12, 48] };
    expect(istRichtig("14 *12 +48 *12 =62 *12 =744", zwei)).toBe(true);
    expect(antwortAus("14 *12 +48 *12 =62 *12 =744", zwei).antwort).toBe("744");
  });

  it("schriftlich: das Ergebnis in der ersten Zeile oder am Ende", () => {
    const schriftlich = ALLE.find((a) => eingabezeile(a)?.mehrzeilig && a.weg && a.op === "geteilt" && a.loesung.includes("Rest"))!;
    expect(schriftlich).toBeDefined();
    const v = eingabezeile(schriftlich)!.vorlage;
    const weg = schriftlich.weg!.map((s) => s.zeile);
    // Ergebnis in die erste Zeile geschrieben, Rechenweg darunter.
    expect(istRichtig([v.replace("[]", `[${schriftlich.loesung}]`), ...weg.slice(0, -1)].join("\n"), schriftlich)).toBe(true);
    // Rechenweg darunter, Ergebnis am Ende - so schließt Stanetty ab.
    expect(istRichtig([v, ...weg, v.replace("[]", `[${schriftlich.loesung}]`)].join("\n"), schriftlich)).toBe(true);
    // ★ Eine Nebenrechnung am Ende ist kein Ergebnis.
    expect(istRichtig([v, ...weg].join("\n"), schriftlich)).toBe(false);
    // Nur die Zeile, nichts gerechnet.
    expect(pruefe(v, schriftlich).stand).toBe("leer");
    expect(pruefe(`${v}\n\n`, schriftlich).stand).toBe("leer");
  });
});
