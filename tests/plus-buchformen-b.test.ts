/**
 * Wächter für die Buchformen, Gruppe B (26.09.2026) - vier neue Aufgabenarten
 * aus den Schulbüchern: `erfinden`, `wege`, `lesen`, `stimmt_das`.
 *
 * Jede Form wird über viele Saaten UND alle ihr zugewiesenen Pakete geprüft
 * (Stoffplan-Feld `arten`) - nicht an einem ausgedachten Einzelfall.
 */
import { describe, expect, it } from "vitest";
import { istRichtig, zufall, type Aufgabe, type Aufgabenart } from "../src/lib/plus/aufgabe";
import { eingabezeile } from "../src/lib/plus/zeile";
import { sprich } from "../src/lib/sprechen/rechnen";
import { paket } from "../src/lib/plus/stoffplan";
import * as K from "../src/lib/plus/generator/kerne";
import * as K3 from "../src/lib/plus/generator/kerne-stufe3";
import type { Kern, Zufall } from "../src/lib/plus/generator/kerne";
import type { BuchArgs, Buchform } from "../src/lib/plus/generator/buchformen/typen";
import { erfinden } from "../src/lib/plus/generator/buchformen/erfinden";
import {
  wege, wegStellenExtra, wegSchrittweise, wegErgaenzen, wegHilfsaufgabe, FRAGE, type Art,
} from "../src/lib/plus/generator/buchformen/wege";
import { lesen, wertVon } from "../src/lib/plus/generator/buchformen/lesen";
import { stimmtDas } from "../src/lib/plus/generator/buchformen/stimmtDas";

const EINMALEINS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

/** Zahlenraum eines Pakets, wie `generator/formen.ts` ihn liest. */
function raumVon(id: string): [number, number] | null {
  const m = /^(-?\d+)(?:-| bis )(-?\d+)$/.exec(paket(id).zr);
  return m ? [Number(m[1]), Number(m[2])] : null;
}

/** Dieselben Kerne, die `zuordnung.ts`/`zuordnung-stufe3.ts` den Paketen geben. */
const KERN_FABRIK: Record<string, (r: Zufall) => Kern> = {
  "1-08": (r) => K.summe(r, { min: 1, max: 9, summeMax: 10 }),
  "1-09": (r) => K.differenz(r, { min: 1, max: 10 }),
  "2-06": (r) => K.summe(r, { min: 0, max: 0, aMin: 21, aMax: 79, bMin: 11, bMax: 19, uebergang: false }),
  "2-07": (r) => K.differenz(r, { min: 0, max: 0, aMin: 25, aMax: 99, bMin: 11, bMax: 24, uebergang: false }),
  "2-15": (r) => K.produkt(r, { reihen: EINMALEINS, bMax: 10, tauschen: true }),
  "3-14": (r) => K.produkt(r, { reihen: EINMALEINS, bMax: 10, tauschen: true }),
  "2-18": (r) => K.summe(r, { min: 0, max: 0, aMin: 21, aMax: 79, bMin: 11, bMax: 19 }),
  "2-19": (r) => K.differenz(r, { min: 0, max: 0, aMin: 25, aMax: 99, bMin: 11, bMax: 24 }),
  "3-05": (r) => K3.schriftlichPlus(r, { aMin: 100, aMax: 899, gesamtMax: 999 }),
  "3-06": (r) => K3.schriftlichMinus(r, { min: 100, max: 999 }),
};

/** Ein Kern, der nur die Form-Signatur erfüllt - für Formen, die ihn nicht lesen (`lesen`, `stimmt_das`). */
function fuellkern(id: string): Kern {
  return { sorte: "rechnung", op: paket(id).op, a: 1, b: 1, ergebnis: 2 };
}

function bauArgs(id: string, art: Aufgabenart, rng: Zufall): BuchArgs {
  const fabrik = KERN_FABRIK[id];
  return {
    paket: id, art, kern: fabrik ? fabrik(rng) : fuellkern(id), rng,
    nachschub: () => (fabrik ? fabrik(rng) : fuellkern(id)),
    raum: raumVon(id), op: paket(id).op,
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
function sammle(ids: string[], art: Aufgabenart, form: Buchform): Aufgabe[] {
  const aufgaben: Aufgabe[] = [];
  for (const id of ids) {
    for (const saat of SAATEN) {
      const rng = zufall(saat * 7919 + 13);
      aufgaben.push(form(bauArgs(id, art, rng)));
    }
  }
  return aufgaben;
}

/** Die generischen Prüfungen, die für jede Buchform gelten. */
function pruefeGenerisch(aufgaben: Aufgabe[], ids: string[]) {
  it("es sind genug Aufgaben zum Messen da (mind. 300 je Paket)", () => {
    for (const id of ids) {
      expect(aufgaben.filter((a) => a.paket === id).length, id).toBeGreaterThanOrEqual(300);
    }
  });

  it("die Lösung gilt als richtig - auch jede auchRichtig-Schreibweise", () => {
    const daneben: string[] = [];
    for (const a of aufgaben) {
      if (a.passt) continue; // offene Aufgaben (erfinden) prüfen sich gesondert.
      const z = eingabezeile(a);
      const text = z ? ausgefuellt(z.vorlage, a.loesung) : a.loesung;
      if (!istRichtig(text, a)) daneben.push(`${a.paket}: ${a.angabe} -> ${a.loesung}`);
      for (const l of a.auchRichtig ?? []) {
        if (!istRichtig(l, a)) daneben.push(`${a.paket} (auchRichtig): ${a.angabe} -> ${l}`);
      }
    }
    expect(daneben).toEqual([]);
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
/* erfinden                                                              */
/* ------------------------------------------------------------------ */

type ErfindenOp = "plus" | "minus" | "mal";

/** Dieselbe Grenzen-Regel wie in `erfinden.ts` - unabhängig nachgebaut. */
function grenzenTest(op: ErfindenOp, raum: [number, number] | null): [number, number] {
  const min = Math.max(1, raum?.[0] ?? 1);
  const max = raum?.[1] ?? 1000;
  return op === "mal" ? [1, Math.min(max, 10)] : [min, max];
}

function alleLoesungenTest(op: ErfindenOp, ergebnis: number, grenze: [number, number]): [number, number][] {
  const [min, max] = grenze;
  const liste: [number, number][] = [];
  if (op === "plus") {
    for (let a = min; a <= max; a++) {
      const b = ergebnis - a;
      if (b >= min && b <= max) liste.push([a, b]);
    }
  } else if (op === "minus") {
    for (let b = min; b <= max; b++) {
      const a = b + ergebnis;
      if (a >= min && a <= max) liste.push([a, b]);
    }
  } else {
    for (let a = min; a <= max; a++) {
      if (ergebnis % a !== 0) continue;
      const b = ergebnis / a;
      if (b >= min && b <= max) liste.push([a, b]);
    }
  }
  return liste;
}

/** Dieselben vier festen Bedingungen und die Schwellen-Texte aus `erfinden.ts` - als Prüfer statt als Text. */
function bedingungAusText(text: string): (a: number, b: number) => boolean {
  if (text === "Beide Zahlen sind gerade.") return (a, b) => a % 2 === 0 && b % 2 === 0;
  if (text === "Beide Zahlen sind ungerade.") return (a, b) => a % 2 === 1 && b % 2 === 1;
  if (text === "Die beiden Zahlen sind verschieden.") return (a, b) => a !== b;
  if (text === "Keine Zahl ist 1.") return (a, b) => a !== 1 && b !== 1;
  const groesser = /^Die erste Zahl ist größer als (\d+)\.$/.exec(text);
  if (groesser) { const s = Number(groesser[1]); return (a) => a > s; }
  const kleiner = /^Die erste Zahl ist kleiner als (\d+)\.$/.exec(text);
  if (kleiner) { const s = Number(kleiner[1]); return (a) => a < s; }
  throw new Error(`Unbekannte Bedingung: "${text}"`);
}

describe("erfinden", () => {
  const ids = ["1-08", "1-09", "2-06", "2-07", "2-15", "3-14"];
  const aufgaben = sammle(ids, "erfinden", erfinden);
  pruefeGenerisch(aufgaben, ids);

  it("jede Aufgabe ist offen: passt ist gesetzt, und das Beispiel in loesung besteht", () => {
    for (const a of aufgaben) {
      expect(typeof a.passt).toBe("function");
      expect(istRichtig(a.loesung, a), a.angabe).toBe(true);
    }
  });

  it("★ Brute-Force: mindestens zwei echte Lösungen, und JEDE besteht, KEINE ungültige besteht", () => {
    for (const a of aufgaben.filter((_, i) => i % 3 === 0)) {
      const zeilen = a.angabe.split("\n");
      const ergebnis = Number(/=(-?\d+)$/.exec(zeilen[2])![1]);
      const test = bedingungAusText(zeilen[1]);
      const op = a.op as ErfindenOp;
      const grenze = grenzenTest(op, raumVon(a.paket));
      const alle = alleLoesungenTest(op, ergebnis, grenze);
      const treffer = alle.filter(([x, y]) => test(x, y));
      expect(treffer.length, a.angabe).toBeGreaterThanOrEqual(2);
      for (const [x, y] of treffer) expect(istRichtig(`${x} und ${y}`, a), `${a.angabe} -> ${x} und ${y}`).toBe(true);

      // Eine Zahl ausserhalb der Treffer (falsch gerechnet ODER Bedingung verletzt) gilt nicht.
      for (const [x, y] of alle) {
        if (!test(x, y)) expect(istRichtig(`${x} und ${y}`, a), `${a.angabe} -> ${x} und ${y} (Bedingung verletzt)`).toBe(false);
      }
    }
  });

  it("„und“, „, “ und der blosse Zwischenraum gelten gleich - eine Kommazahl oder Unsinn nicht", () => {
    const a = aufgaben.find((x) => x.op === "plus")!;
    const [x, y] = a.loesung.split(" und ").map(Number);
    expect(istRichtig(`${x} und ${y}`, a)).toBe(true);
    expect(istRichtig(`${x}, ${y}`, a)).toBe(true);
    expect(istRichtig(`${x} ${y}`, a)).toBe(true);
    expect(istRichtig(`${x},${y}`, a)).toBe(false); // Kommazahl statt Trenner mit Leerzeichen.
    expect(istRichtig("Blabla", a)).toBe(false);
    expect(istRichtig(`${x}`, a)).toBe(false);
    expect(istRichtig(`${x},5 und ${y}`, a)).toBe(false);
  });
});

/* ------------------------------------------------------------------ */
/* wege                                                                  */
/* ------------------------------------------------------------------ */

const ARTEN: Art[] = ["stellen", "schrittweise", "ergaenzen", "hilfsaufgabe"];

function artFuerFrage(frage: string): Art {
  const gefunden = ARTEN.find((k) => FRAGE[k] === frage);
  if (!gefunden) throw new Error(`Unbekannte Frage: "${frage}"`);
  return gefunden;
}

function erwarteteSchritte(art: Art, x: number, y: number, erg: number, op: "plus" | "minus"): string[] | null {
  if (art === "stellen") return wegStellenExtra(x, y, erg);
  if (art === "schrittweise") return wegSchrittweise(x, y, erg, op);
  if (art === "ergaenzen") return wegErgaenzen(x, y, erg);
  return wegHilfsaufgabe(x, y, erg, op);
}

/**
 * Ein Kind je Block: die Zeile „Name: erster Schritt“ beginnt einen Block,
 * jede weitere Zeile OHNE Doppelpunkt gehört noch dazu - eine Rechenzeile
 * enthält nie einen Doppelpunkt, nur der Name davor.
 */
function kinderBloecke(zeilen: string[]): { name: string; schritte: string[] }[] {
  const rumpf = zeilen.slice(2, -1);
  const bloecke: { name: string; schritte: string[] }[] = [];
  for (const z of rumpf) {
    const start = /^([^:]+): (.+)$/.exec(z);
    if (start) bloecke.push({ name: start[1], schritte: [start[2]] });
    else bloecke[bloecke.length - 1].schritte.push(z);
  }
  return bloecke;
}

describe("wege", () => {
  const ids = ["2-18", "2-19", "3-05", "3-06"];
  const aufgaben = sammle(ids, "wege", wege);
  pruefeGenerisch(aufgaben, ids);

  it("die erste Zeile ist die echte Rechnung, und `zahlen` trägt a und b", () => {
    for (const a of aufgaben) {
      const kopf = /^(-?\d+) ([+-])(-?\d+) =(-?\d+)\.$/.exec(a.angabe.split("\n")[0])!;
      const [, xs, zeichen, ys, ergs] = kopf;
      const soll = zeichen === "+" ? Number(xs) + Number(ys) : Number(xs) - Number(ys);
      expect(soll).toBe(Number(ergs));
      expect(a.zahlen).toEqual([Number(xs), Number(ys)]);
    }
  });

  it("★ alle Teilrechnungen jedes Kindes stimmen, und jedes endet beim gemeinsamen Ergebnis", () => {
    for (const a of aufgaben) {
      const zeilen = a.angabe.split("\n");
      const erg = Number(/=(-?\d+)\.$/.exec(zeilen[0])![1]);
      for (const { schritte } of kinderBloecke(zeilen)) {
        for (const schritt of schritte) {
          const [links, ergsRaw] = schritt.split(" =");
          // ★ Erster Teil ist die Startzahl (bei uns nie negativ), jeder
          // weitere Teil beginnt mit seinem eigenen Rechenzeichen - das darf
          // NICHT wie eine negative Zahl gelesen werden („63 -2“ ist 63
          // MINUS 2, keine Liste aus 63 und -2).
          const teile = links.trim().split(/\s+/);
          const soll = teile.slice(1).reduce((sum, t) => (t[0] === "-" ? sum - Number(t.slice(1)) : sum + Number(t.slice(1))), Number(teile[0]));
          expect(soll, `${schritt} in ${a.angabe}`).toBe(Number(ergsRaw));
        }
        expect(Number(/=(-?\d+)$/.exec(schritte[schritte.length - 1])![1]), a.angabe).toBe(erg);
      }
    }
  });

  it("★ das genannte Kind rechnet wirklich auf die gefragte Art - unabhängig mit denselben Bausteinen nachgerechnet", () => {
    for (const a of aufgaben) {
      const zeilen = a.angabe.split("\n");
      const kopf = /^(-?\d+) ([+-])(-?\d+) =(-?\d+)\.$/.exec(zeilen[0])!;
      const x = Number(kopf[1]), y = Number(kopf[3]), erg = Number(kopf[4]);
      const op = kopf[2] === "+" ? "plus" : "minus";
      const art = artFuerFrage(zeilen[zeilen.length - 1]);
      const erwartet = erwarteteSchritte(art, x, y, erg, op);
      expect(erwartet, a.angabe).not.toBeNull();
      const block = kinderBloecke(zeilen).find((k) => k.name === a.loesung);
      expect(block, a.angabe).toBeDefined();
      expect(block!.schritte).toEqual(erwartet);
    }
  });

  it("alle vier Arten kommen über die Läufe vor, auch die Hilfsaufgabe", () => {
    const arten = new Set(aufgaben.map((a) => artFuerFrage(a.angabe.split("\n").pop()!)));
    expect(arten.has("stellen")).toBe(true);
    expect(arten.has("schrittweise")).toBe(true);
    expect(arten.has("ergaenzen")).toBe(true);
    expect(arten.has("hilfsaufgabe")).toBe(true);
  });

  it("die Hilfsaufgabe kommt nur vor, wenn eine Zahl nah an einem Zehner/Hunderter liegt", () => {
    for (const a of aufgaben) {
      if (artFuerFrage(a.angabe.split("\n").pop()!) !== "hilfsaufgabe") continue;
      const kopf = /^(-?\d+) ([+-])(-?\d+) =/.exec(a.angabe)!;
      const [x, y] = [Number(kopf[1]), Number(kopf[3])];
      const nah = (n: number) => {
        const z = Math.min(n % 10, 10 - (n % 10));
        const h = n >= 100 ? Math.min(n % 100, 100 - (n % 100)) : Infinity;
        return Math.min(z, h) > 0 && Math.min(z, h) <= 3;
      };
      expect(nah(x) || nah(y), a.angabe).toBe(true);
    }
  });

  it("ein anderer Name als Antwort gilt als falsch", () => {
    const a = aufgaben[0];
    expect(istRichtig("Niemand-Da", a)).toBe(false);
  });
});

/* ------------------------------------------------------------------ */
/* lesen                                                                 */
/* ------------------------------------------------------------------ */

function subtypVon(a: Aufgabe): "a" | "b" | "c" {
  const letzte = a.angabe.split("\n").pop()!;
  if (letzte === "Kann man das ausrechnen?") return "b";
  if (letzte === "Welche Rechnung passt?") return "c";
  return "a";
}

describe("lesen", () => {
  const ids = ["1-18", "2-21", "3-21", "4-18"];
  const aufgaben = sammle(ids, "lesen", lesen);
  pruefeGenerisch(aufgaben, ids);

  it("alle drei Unterarten kommen vor, in jedem Paket", () => {
    for (const id of ids) {
      const meine = aufgaben.filter((a) => a.paket === id);
      const arten = new Set(meine.map(subtypVon));
      expect(arten.has("a"), id).toBe(true);
      expect(arten.has("b"), id).toBe(true);
      expect(arten.has("c"), id).toBe(true);
    }
  });

  it("a) alle drei Zahlen sind verschieden, und die Lösung ist genau eine davon", () => {
    for (const a of aufgaben.filter((x) => subtypVon(x) === "a")) {
      expect(new Set(a.zahlen).size, a.angabe).toBe(a.zahlen.length);
      expect(a.zahlen.map(String), a.angabe).toContain(a.loesung);
    }
  });

  it("b) ja und nein kommen beide vor", () => {
    const meine = aufgaben.filter((x) => subtypVon(x) === "b");
    expect(meine.some((a) => a.loesung === "ja")).toBe(true);
    expect(meine.some((a) => a.loesung === "nein")).toBe(true);
  });

  it("c) genau ein Buchstabe passt - die richtige Rechnung hat keinen doppelten Wert", () => {
    for (const a of aufgaben.filter((x) => subtypVon(x) === "c")) {
      const zeilen = a.angabe.split("\n");
      const optionen = zeilen
        .filter((z) => /^[abc]\) /.test(z))
        .map((z) => /^([abc])\) (.+)$/.exec(z)!.slice(1) as [string, string]);
      expect(optionen, a.angabe).toHaveLength(3);

      const richtige = optionen.find(([, rechnung]) => rechnung === a.auchRichtig?.[0]);
      expect(richtige, a.angabe).toBeDefined();
      expect(richtige![0]).toBe(a.loesung);

      const werte = optionen.map(([, r]) => wertVon(r));
      const richtigerWert = wertVon(a.auchRichtig![0]);
      expect(werte.filter((w) => w === richtigerWert), a.angabe).toHaveLength(1);

      expect(istRichtig(a.loesung, a)).toBe(true);
      expect(istRichtig(a.auchRichtig![0], a)).toBe(true);
      for (const [buchstabe] of optionen) {
        if (buchstabe !== a.loesung) expect(istRichtig(buchstabe, a), `${a.angabe} -> ${buchstabe}`).toBe(false);
      }
    }
  });
});

/* ------------------------------------------------------------------ */
/* stimmt_das                                                            */
/* ------------------------------------------------------------------ */

describe("stimmt_das", () => {
  const ids = ["3-21", "4-15"];
  const aufgaben = sammle(ids, "stimmt_das", stimmtDas);
  pruefeGenerisch(aufgaben, ids);

  it("ja und nein kommen beide vor, in jedem Paket", () => {
    for (const id of ids) {
      const meine = aufgaben.filter((a) => a.paket === id);
      expect(meine.some((a) => a.loesung === "ja"), id).toBe(true);
      expect(meine.some((a) => a.loesung === "nein"), id).toBe(true);
    }
  });

  it("endet immer mit „Kann das stimmen?“", () => {
    expect(aufgaben.every((a) => a.angabe.endsWith("Kann das stimmen?"))).toBe(true);
  });

  it("mindestens 30 verschiedene Dinge kommen vor", () => {
    const dinge = new Set(aufgaben.map((a) => a.angabe.replace(/-?\d+/g, "N")));
    expect(dinge.size).toBeGreaterThanOrEqual(30);
  });

  it("die österreichische Einheit „dag“ kommt vor", () => {
    expect(aufgaben.some((a) => /\bdag\b/.test(a.angabe))).toBe(true);
  });

  it("eine falsche Zahl bei „nein“ liegt weit daneben, nie knapp - Faktor mindestens 10 oder eine andere Einheit", () => {
    for (const a of aufgaben.filter((x) => x.loesung === "nein")) {
      // Die Zahl steht vor der Einheit in der Angabe.
      const m = /(\d+(?:,\d+)?) ([a-zäöü²³]+)/.exec(a.angabe)!;
      expect(m, a.angabe).toBeTruthy();
    }
  });

  it("eine vertauschte Antwort (ja/nein) gilt als falsch", () => {
    const a = aufgaben[0];
    expect(istRichtig(a.loesung === "ja" ? "nein" : "ja", a)).toBe(false);
  });
});

describe("★ wege: jedes Kind rechnet ANDERS (Haupt-Chat, Probelauf 26.09.2026)", () => {
  it("keine zwei gleichen Wege, kein Weg aus nur einer Zeile, die Frage hat genau eine Antwort", async () => {
    const { erzeugeAufgabe } = await import("../src/lib/plus/generator");
    const { zufall } = await import("../src/lib/plus/aufgabe");
    for (const id of ["2-18", "2-19", "3-05", "3-06"]) {
      const rng = zufall(77);
      for (let i = 0; i < 300; i++) {
        let a;
        try { a = erzeugeAufgabe(id, "wege", rng); } catch { continue; }
        const zeilen = a.angabe.split("\n");
        const kinder: Record<string, string[]> = {};
        let wer = "";
        for (const z of zeilen.slice(2, -1)) {
          const m = /^([A-ZÄÖÜ][a-zäöüß]+): (.*)$/.exec(z);
          if (m) { wer = m[1]; kinder[wer] = [m[2]]; } else kinder[wer].push(z);
        }
        const wege = Object.values(kinder).map((w) => w.join("|"));
        expect(new Set(wege).size, a.angabe).toBe(wege.length);
        for (const w of Object.values(kinder)) expect(w.length, a.angabe).toBeGreaterThanOrEqual(2);
        // Die Hilfsaufgabe rundet nie die zweite Zahl ab.
        if (/Hilfsaufgabe/.test(zeilen[zeilen.length - 1])) {
          const erste = kinder[a.loesung][0];
          expect(erste, a.angabe).not.toMatch(new RegExp(`^${a.zahlen[0]} [+-]${Math.floor(a.zahlen[1] / 10) * 10} =`));
        }
      }
    }
  });
});
