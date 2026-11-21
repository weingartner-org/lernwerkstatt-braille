/**
 * ════════════════════════════════════════════════════════════════════════════
 * PORTUGIESISCH (pt, br) - TEXT → BRAILLEZELLEN, NACH DER GRAFIA BRAILLE 2018
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Gebaut nach dem Norm-Dokument (Tabelle: `zeichen.ts`), NICHT nach liblouis: liblouis `pt-pt-g1`
 * weicht bei « » ‘ ’ (vertauscht), beim Halbgeviertstrich – und bei den Klammern um Zahlen ab
 * (`BEFUND-2026-11-07-PUNKTGENAU-PT-BR-NORM.md`). Es gilt die Norm. Portugal und Brasilien teilen
 * diese Engine: die Norm ist für beide dieselbe (kein Unterschied der Zeichen, siehe Befund).
 *
 * Regeln (Paragrafen und Seiten der Norm):
 *  - Großschreibung (§ 10, S. 27): Punkt 4-6 vor JEDEM Großbuchstaben (auch mitten im Wort:
 *    McDonald = .m c .d onald). Ein Wort oder eine Sigle ganz aus Großbuchstaben (zwei und mehr)
 *    bekommt EIN Doppelzeichen 4-6 4-6 davor (§ 10.1, § 11, S. 27-28). Siglen mit Punkten (O.N.U.):
 *    4-6 vor jeder Initiale, der Punkt (3) bleibt (§ 11.1, S. 28). Die freie Form 25 46 46 für mehr als
 *    drei Großwörter (§ 10.2) wird nicht geschrieben. Zwei Großbuchstaben in Folge in einem Wort, das nicht
 *    ganz groß ist (ONGs), regelt die Norm nicht: `unknown`.
 *  - Zahlen (§ 12-14, S. 29-30): Zahlzeichen 3-4-5-6 EINMAL vor der Zahl, dann a-j. Dezimalkomma = Punkt 2.
 *    Punkt zwischen Dreiergruppen = Punkt 3, aber nur bei mehr als vier Ziffern im ganzen Teil („costuma-se",
 *    § 14); bei vier oder weniger Ziffern (1.234) bleibt die Frage offen: `unknown`. Ein Punkt zwischen
 *    Ziffern, dem keine genau drei Ziffern folgen (Datum 22.04.1500), regelt die Norm für diesen Fall
 *    nicht: `unknown`. Leerzeichen als Gruppentrenner (10 000) schreibt der Text selbst: jedes Teil bekommt sein Zahlzeichen.
 *  - Buchstabe hinter einer Zahl (§ 16 c-d, S. 31): beginnt die Buchstabenfolge mit a-j (klein), steht Punkt 5
 *    davor (17a = #ag"a, 6ab = #f"ab - EINMAL, vor dem ersten Buchstaben); jeder andere Anfang ohne Zusatz (4k, 5x);
 *    ein Großbuchstabe hat sein 4-6 (4D = #d.d).
 *  - Rechenzeichen (§ 22, S. 36): + 2-3-5, − 3-6, × 2-3-6, ÷ 2-5-6, = 2-3-5-6 - ohne Zwischenraum (7+2 = #g6#b);
 *    nach dem Zeichen bekommt jede Zahl ihr Zahlzeichen. Mit Zwischenraum geschrieben, bleibt der Zwischenraum.
 *  - Klammern und eckige Klammern (§ 37, S. 50-53): STANDARD ist die zusammengesetzte Form (126 3 ... 6 345);
 *    die einfache (126 ... 345) steht, wenn die Klammer direkt vor einer Zahl öffnet („(1809-1852)", „(5 min)"),
 *    und hinter einer Zahl schließt, die nicht in der Klammer geöffnet wurde („1)"). Beginnt der Inhalt mit einem
 *    Buchstaben und endet mit einer Ziffer, regelt die Norm es nicht: `unknown`.
 *  - Anführungszeichen (§ 38, S. 54): “ ” " = 2-3-6; ‘ ’ = 6 2-3-6; « » = 5-6 2-3-6.
 *  - Apostroph zwischen Buchstaben (§ 35, S. 48) = Punkt 3. Reticências ("..." und …) = 3 3 3 (§ 36).
 *  - Hífen - = 3-6, Travessão – und — = 3-6 3-6 (§ 39, S. 57). Ein Strich allein zwischen Leerzeichen oder am
 *    Satzanfang ist in Tastaturtexten ein Gedankenstrich, den die Norm als Travessão schreibt: der Lehrgang
 *    enthält solche Zeilen nicht (Wächter im Test).
 *
 * Grenzen (bewusst, nicht geraten): ü (die Norm 2018 kennt es im Alphabet nicht), Ordinalzahlen º ª (5. Reihe),
 * Brüche, Währungen, Prozent, Maße, Datum, Hervorhebung (35 ... 35) - alle `unknown`.
 */
import { BLANK, parseDots, type Cell } from "../../cell";
import type { Unit } from "../../engine";
import { PT_ALLE, PT_APOSTROPH, PT_KLAMMER_EINFACH, PT_STEUER } from "./zeichen";

const ZELLEN: Map<string, Cell[]> = new Map(
  PT_ALLE.filter((z) => !/^[0-9]$/.test(z.zeichen)).map((z) => [z.zeichen, z.punkte.split(" ").map(parseDots)]),
);
/** Ziffern: der Buchstabe a-j, dessen Zelle sie schreibt (Norm § 12). */
const ZIFFER_ZELLE: Map<string, Cell[]> = new Map(
  PT_ALLE.filter((z) => /^[0-9]$/.test(z.zeichen)).map((z) => [z.zeichen, z.punkte.split(" ").map(parseDots)]),
);
// Gleichwertige Druckzeichen
const GLEICH: Record<string, string> = { "‐": "-", "‑": "-", "„": "“" };

const MAJUSKEL = parseDots(PT_STEUER.maiuscula.punkte);
const ZAHLZEICHEN = parseDots(PT_STEUER.zahl.punkte);
const LATINA = parseDots(PT_STEUER.latinaMinuscula.punkte);
const APOSTROPH = parseDots(PT_APOSTROPH.punkte);
const KLASSEN = parseDots(PT_STEUER.klassenPunkt.punkte);
const DEZIMAL = parseDots(PT_STEUER.dezimal.punkte);

const RE_BUCHSTABE = /\p{L}/u;
const RE_ZIFFER = /[0-9]/;
const RE_LEER = /\s/;
const RECHENZEICHEN = new Set(["+", "−", "×", "÷", "="]);
const ERSTE_REIHE = new Set([..."abcdefghij"]);
const OEFFNER = new Set(["(", "["]);
const SCHLIESSER: Record<string, string> = { ")": "(", "]": "[" };

function istGross(c: string): boolean {
  return RE_BUCHSTABE.test(c) && c !== c.toLowerCase();
}

type KlammerForm = "einfach" | "zusammen" | "unbekannt";

/** Für jede Klammer die Form nach § 37 (siehe Kopf). */
function klammerFormen(chars: string[]): Map<number, KlammerForm> {
  const formen = new Map<number, KlammerForm>();
  const stapel: number[] = [];
  const paare: [number, number][] = [];
  chars.forEach((c, i) => {
    if (OEFFNER.has(c)) stapel.push(i);
    else if (c in SCHLIESSER) {
      const o = stapel.length && chars[stapel[stapel.length - 1]] === SCHLIESSER[c] ? stapel.pop()! : undefined;
      if (o !== undefined) paare.push([o, i]);
      else {
        // geschlossen ohne Öffner in diesem Text: nach einer Zahl einfach (b, S. 51), sonst zusammengesetzt
        formen.set(i, i > 0 && RE_ZIFFER.test(chars[i - 1]) ? "einfach" : "zusammen");
      }
    }
  });
  for (const o of stapel) formen.set(o, "zusammen");
  for (const [o, s] of paare) {
    const inhalt = chars.slice(o + 1, s);
    const form: KlammerForm = !inhalt.length
      ? "zusammen"
      : RE_ZIFFER.test(inhalt[0])
        ? "einfach"
        : RE_ZIFFER.test(inhalt[inhalt.length - 1])
          ? "unbekannt"
          : "zusammen";
    formen.set(o, form);
    formen.set(s, form);
  }
  return formen;
}

/** Text → Einheiten (wie `transcribe` im deutschen Engine-Modul). */
export function transcribePt(text: string, opts: { grossschreibzeichen?: boolean } = {}): Unit[] {
  const mitMajuskel = opts.grossschreibzeichen !== false;
  const chars = [...text.normalize("NFC")].map((c) => GLEICH[c] ?? c);
  const klammern = klammerFormen(chars);
  const units: Unit[] = [];
  let i = 0;
  let zahl = false; // Zahlzeichen steht schon; gilt bis zum Ende der Zahlenkette
  let ganzeZiffern = 0; // Ziffern im ganzen Teil der laufenden Zahl
  let nachKomma = false;

  const ziffernAb = (start: number): number => {
    let e = start;
    while (e < chars.length && RE_ZIFFER.test(chars[e])) e++;
    return e - start;
  };
  /** Ziffern des ganzen Teils ab Stelle `start` (über weitere Punkt-Gruppen hinweg, bis Komma oder Ende der Zahl). */
  const ziffernVorwaerts = (start: number): number => {
    let n = 0;
    let k = start;
    while (k < chars.length && (RE_ZIFFER.test(chars[k]) || (chars[k] === "." && RE_ZIFFER.test(chars[k + 1] ?? "")))) {
      if (chars[k] !== ".") n++;
      k++;
    }
    return n;
  };
  const unbekannt = (t: string): void => {
    units.push({ text: t, cells: [], kind: "unknown" });
  };

  while (i < chars.length) {
    const c = chars[i];

    if (RE_LEER.test(c)) {
      zahl = false;
      units.push({ text: c, cells: [BLANK], kind: "space" });
      i++;
      continue;
    }

    // Ziffer: Zahlzeichen einmal, dann der Buchstabe a-j
    if (RE_ZIFFER.test(c)) {
      if (!zahl) {
        units.push({ text: "", cells: [ZAHLZEICHEN], kind: "number" });
        zahl = true;
        ganzeZiffern = 0;
        nachKomma = false;
      }
      if (!nachKomma) ganzeZiffern++;
      units.push({ text: c, cells: ZIFFER_ZELLE.get(c)!, kind: "number" });
      i++;
      continue;
    }

    // Trenner mitten in einer Zahl (§ 13, § 14)
    if (zahl && (c === "," || c === ".") && i + 1 < chars.length && RE_ZIFFER.test(chars[i + 1])) {
      if (c === ",") {
        units.push({ text: c, cells: [DEZIMAL], kind: "number" });
        nachKomma = true;
      } else if (!nachKomma && ziffernAb(i + 1) === 3 && ganzeZiffern + ziffernVorwaerts(i) > 4) {
        units.push({ text: c, cells: [KLASSEN], kind: "number" });
      } else {
        unbekannt(c);
        zahl = false;
      }
      i++;
      continue;
    }

    // Reticências "..." (§ 36)
    if (c === "." && chars[i + 1] === "." && chars[i + 2] === ".") {
      zahl = false;
      units.push({ text: "...", cells: [KLASSEN, KLASSEN, KLASSEN], kind: "punct" });
      i += 3;
      continue;
    }

    // Apostroph zwischen Buchstaben (§ 35)
    if ((c === "'" || c === "’") && i > 0 && RE_BUCHSTABE.test(chars[i - 1]) && RE_BUCHSTABE.test(chars[i + 1] ?? "")) {
      zahl = false;
      units.push({ text: c, cells: [APOSTROPH], kind: "punct" });
      i++;
      continue;
    }

    // Buchstabenfolge
    if (RE_BUCHSTABE.test(c)) {
      let j = i;
      while (j < chars.length && RE_BUCHSTABE.test(chars[j])) j++;
      const wort = chars.slice(i, j);
      const nachZahl = zahl;
      zahl = false;
      if (nachZahl && !istGross(wort[0]) && ERSTE_REIHE.has(wort[0])) {
        // § 16 c: a-j direkt hinter einer Zahl - Punkt 5, einmal vor der Folge
        units.push({ text: "", cells: [LATINA], kind: "punct" });
      }
      const gross = wort.filter(istGross).length;
      const ganzGross = gross === wort.length && wort.length >= 2;
      const grossFolge = wort.some((w, k) => k > 0 && istGross(w) && istGross(wort[k - 1]));
      if (ganzGross && mitMajuskel) {
        units.push({ text: "", cells: [MAJUSKEL], kind: "punct" });
        units.push({ text: "", cells: [MAJUSKEL], kind: "punct" });
      }
      for (let k = 0; k < wort.length; k++) {
        const w = wort[k];
        const klein = w.toLowerCase();
        if (istGross(w) && !ganzGross) {
          if (grossFolge && k > 0 && istGross(wort[k - 1])) {
            unbekannt(w); // ONGs: nicht geregelt
            continue;
          }
          if (mitMajuskel) units.push({ text: "", cells: [MAJUSKEL], kind: "punct" });
        }
        const cells = ZELLEN.get(klein);
        units.push(cells ? { text: w, cells, kind: "letter" } : { text: w, cells: [], kind: "unknown" });
      }
      i = j;
      continue;
    }

    // Klammern (§ 37)
    if (OEFFNER.has(c) || c in SCHLIESSER) {
      zahl = false;
      const form = klammern.get(i) ?? "zusammen";
      if (form === "unbekannt") unbekannt(c);
      else if (form === "einfach") units.push({ text: c, cells: [parseDots(PT_KLAMMER_EINFACH[c].punkte)], kind: "punct" });
      else units.push({ text: c, cells: ZELLEN.get(c)!, kind: "punct" });
      i++;
      continue;
    }

    // Satzzeichen, Rechenzeichen, Symbole beenden eine Zahlenkette
    zahl = false;
    const z = ZELLEN.get(c);
    if (z && !/^\p{L}$/u.test(c)) {
      const kind: Unit["kind"] = RECHENZEICHEN.has(c) ? "math" : "punct";
      units.push({ text: c, cells: z, kind });
    } else {
      unbekannt(c);
    }
    i++;
  }
  return units;
}

/** Text → flache Zellfolge. */
export function textToCellsPt(text: string, opts: { grossschreibzeichen?: boolean } = {}): Cell[] {
  return transcribePt(text, opts).flatMap((u) => u.cells);
}
