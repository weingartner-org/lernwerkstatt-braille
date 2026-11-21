/**
 * Notation mathématique braille (Französisch) - vom Braillezeichen zur
 * Rechenzeile und zurück. Der Mathe-Code von Plus für Französisch.
 *
 * ★★★ NUR GEBAUT, WAS GELESEN IST. Die Quelle ist
 *   NMB = „Notation Mathématique Braille", Commission Évolution du Braille
 *         Français (CEBF), INJA und AVH, Paris, Januar 2007 (81 Seiten, gültig
 *         seit 01.09.2007; Nachfolgerin der Ausgabe von 1971/2001).
 *   Die PDF ist ein Scan; die Zellen wurden als Bild gelesen, jede mit der
 *   Punktangabe der Tabelle und der gedruckten Seite (`Page N sur 81`). Die
 *   Fundstellen stehen in `FR_ZEICHEN` und in
 *   `BEFUND-2026-11-10-PLUS-FR-MATHE-CODE.md`. Der Quebecer Code (CNFB 2001,
 *   Übertragung des Nemeth-Codes) ist ein ANDERER Code und wird hier NICHT
 *   benutzt.
 *
 * ★ Wie die Zeichen entstehen (NMB S. 7 Nr. 2, S. 12): Jede Ziffer ist EIN
 *   Zeichen mit Punkt 6 (1 = Punkte 1-6, 2 = 1-2-6, ... 0 = 3-4-5-6). Es gibt
 *   KEIN Zahlzeichen vor der Zahl. Steht ein Ausdruck mitten im Text, geht ihm
 *   der „modificateur mathématique" (Punkt 6) voraus; steht er für sich, „peut
 *   être omis" (S. 8 Nr. 3) - Plus-Zeilen stehen für sich, also ohne.
 * ★ Leerzeichen (S. 9 Nr. 6): „En braille, on ne met généralement pas d'espaces
 *   dans une formule." Plus schreibt darum ohne Leerzeichen um die Zeichen
 *   (anders als die Plus-Zeile `48 +27 =75`); gelesen werden beide Arten.
 * ★ Komma: Dezimalkomma = Punkt 2 (Beispiel `0,5` S. 25; Satzzeichen sind die
 *   des Code général, S. 9 Nr. 7). Brüche: Zeichen Punkte 3-4 (S. 25), Division
 *   Punkte 2-5 (S. 17, 25).
 *
 * Was die gelesenen Seiten NICHT eindeutig sagen, ist NICHT gebaut -
 * `schreibeFr` liefert dann `null`, und der Generator lässt die Aufgabe für
 * Französisch weg (`lib/plus/sprachfilter.ts`):
 *  - Buchstaben, Variable, Einheiten (`cm`, `kg`): Abkürzungsregeln des
 *    Kurzschrift-Codes (S. 9-10 Nr. 8), nicht ausgelesen.
 *  - Hochzahl (`x²`: Punkt 4, S. 17, 29) und Wurzel (Kap. 10): nur mit Blöcken
 *    für Zusammengesetztes; hier nicht gebaut.
 *  - negative Zahlen / Vorzeichen: das Zeichen „moins" (3-6) steht in der
 *    Tabelle der Rechenzeichen (S. 17); ob es als Vorzeichen dasselbe ist, und
 *    wann Blöcke nötig sind (S. 26), wurde nicht ausgelesen.
 *  - gemischte Zahl (`2 1/2`), Tausenderabstand (Punkt 3 zwischen Ziffern-
 *    gruppen, S. 7 - Plus schreibt keine Tausendertrennung), Verhältnis `:`,
 *    Rest, Währung €, Grad.
 *  - Platzhalter `[]`: keine Zelle (wie Marburg und UEB): die Klammern fallen
 *    weg, die Schreibmarke sitzt in der Lücke.
 */

/** Punktnummern 1-8 -> Braillezeichen (U+2800 + Bitmuster). */
const p = (...punkte: number[]): string =>
  String.fromCodePoint(0x2800 + punkte.reduce((s, n) => s + (1 << (n - 1)), 0));

/** Ziffern: NMB S. 12 (Punktangaben der Tabelle „1. Chiffres et signe de l'infini"). */
const ZIFFER_ZELLE: Record<string, string> = {
  "1": p(1, 6), "2": p(1, 2, 6), "3": p(1, 4, 6), "4": p(1, 4, 5, 6), "5": p(1, 5, 6),
  "6": p(1, 2, 4, 6), "7": p(1, 2, 4, 5, 6), "8": p(1, 2, 5, 6), "9": p(2, 4, 6), "0": p(3, 4, 5, 6),
};
const ZELLE_ZIFFER: Record<string, string> = Object.fromEntries(
  Object.entries(ZIFFER_ZELLE).map(([z, c]) => [c, z]),
);

/** Dezimalkomma: Punkt 2, Beispiel `0,5` NMB S. 25. */
const KOMMA = p(2);
/** Bruchstrich: Punkte 3-4, NMB S. 25. */
const BRUCHSTRICH = p(3, 4);
/** Modificateur mathématique: Punkt 6, NMB S. 8 Nr. 3 (vor einem Ausdruck im Text). */
const MODIFIKATOR = p(6);

/** Rechen- und Vergleichszeichen: NMB S. 17 (Rechnen), S. 19 (Gleich/Ungleich). */
const OP_ZELLE: Record<string, string> = {
  "+": p(2, 3, 5),                  // plus: S. 17
  "-": p(3, 6),                     // moins: S. 17
  "*": p(3, 5),                     // multiplié par ×: S. 17
  "/": p(2, 5),                     // divisé par ÷: S. 17, 25
  "=": p(2, 3, 5, 6),               // égal: S. 19
  "<": p(5) + p(1, 2, 6),           // plus petit que: S. 19
  ">": p(5) + p(3, 4, 5),           // plus grand que: S. 19
  "<=": p(4, 5) + p(1, 2, 6),       // plus petit ou égal: S. 19
  ">=": p(4, 5) + p(3, 4, 5),       // plus grand ou égal: S. 19
  "!=": p(4, 6) + p(2, 3, 5, 6),    // différent de: S. 19
};
/** Mal-Punkt `·` (Punkte 3-5, 3-5, S. 17): wird gelesen und als `*` verstanden, geschrieben wird ×. */
const MAL_PUNKT = p(3, 5) + p(3, 5);

/** Klammern: NMB S. 21 (Zeile; die Zeichen für mehrere Zeilen und „grandes" sind nicht gebaut). */
const KLAMMER_ZELLE: Record<string, string> = {
  "(": p(2, 3, 6), ")": p(3, 5, 6),
  "[": p(1, 2, 3, 5, 6), "]": p(2, 3, 4, 5, 6),
  "{": p(4, 6) + p(2, 3, 6), "}": p(4, 6) + p(3, 5, 6),
};

/** Prozent „pour cent": Punkt 5, Punkte 3-4-6, NMB S. 67 (16.4), Beispiel `5%` ebenda. */
const PROZENT = p(5) + p(3, 4, 6);

/** Alle Zellfolgen zum Lesen, längste zuerst. */
const LESE: Array<[string, { text: string; op?: boolean; klammer?: "auf" | "zu"; prozent?: boolean }]> = [
  [OP_ZELLE["!="], { text: "!=", op: true }],
  [OP_ZELLE["<="], { text: "<=", op: true }],
  [OP_ZELLE[">="], { text: ">=", op: true }],
  [OP_ZELLE["<"], { text: "<", op: true }],
  [OP_ZELLE[">"], { text: ">", op: true }],
  [OP_ZELLE["+"], { text: "+", op: true }],
  [OP_ZELLE["-"], { text: "-", op: true }],
  [OP_ZELLE["*"], { text: "*", op: true }],
  [MAL_PUNKT, { text: "*", op: true }],
  [OP_ZELLE["/"], { text: "/", op: true }],
  [OP_ZELLE["="], { text: "=", op: true }],
  [KLAMMER_ZELLE["("], { text: "(", klammer: "auf" }],
  [KLAMMER_ZELLE[")"], { text: ")", klammer: "zu" }],
  [KLAMMER_ZELLE["["], { text: "[", klammer: "auf" }],
  [KLAMMER_ZELLE["]"], { text: "]", klammer: "zu" }],
  [KLAMMER_ZELLE["{"], { text: "{", klammer: "auf" }],
  [KLAMMER_ZELLE["}"], { text: "}", klammer: "zu" }],
  [PROZENT, { text: "%", prozent: true }],
];
LESE.sort((a, b) => b[0].length - a[0].length);

/* ------------------------------------------------------------------ */
/* Was herauskommt (gleiche Form wie bei UEB)                           */
/* ------------------------------------------------------------------ */

export interface FrHinweis {
  stelle: number;
  /** Schlüssel in `PlusTexte.hinweise` - der Text kommt aus der Texttabelle. */
  schluessel: "unbekanntesZeichen" | "kommaInZahl" | "buchstabeNichtGebaut" | "klammerOffen" | "schliesstOhneOffen";
}

export interface FrLesung {
  text: string;
  hinweise: FrHinweis[];
}

const istZiffer = (z: string | undefined): boolean => !!z && z in ZELLE_ZIFFER;

/**
 * Zellen in die Rechenzeile von Plus lesen. Jede Ziffer ist ein Zeichen für
 * sich; ein einzelner Punkt 6 vor einer Ziffer ist der Modificateur und fällt weg.
 */
export function leseFr(eingabe: string): FrLesung {
  const zellen = [...eingabe];
  const hinweise: FrHinweis[] = [];
  let aus = "";
  let leerzeichen = false;
  let klammern = 0;

  const merke = (stelle: number, schluessel: FrHinweis["schluessel"]) => hinweise.push({ stelle, schluessel });
  const termende = () => /[0-9)\]}%?]/.test(aus.slice(-1));
  const vorToken = () => {
    if (leerzeichen && termende()) aus += " ";
    leerzeichen = false;
  };
  const endetMitZiffer = () => /[0-9]$/.test(aus);

  for (let i = 0; i < zellen.length; i++) {
    const z = zellen[i];
    const naechstes = zellen[i + 1];

    if (z === "⠀") { leerzeichen = true; continue; }

    if (z === MODIFIKATOR && istZiffer(naechstes)) continue;

    if (istZiffer(z)) {
      // Direkt hinter einer Ziffer gehört sie zur selben Zahl (auch über ein Leerzeichen hinweg
      // bleibt es eine neue Zahl: das Leerzeichen der Eingabe wird eines der Zeile).
      if (!endetMitZiffer() || leerzeichen) vorToken();
      aus += ZELLE_ZIFFER[z];
      continue;
    }

    if (z === KOMMA) {
      if (endetMitZiffer() && !leerzeichen && (naechstes === undefined || istZiffer(naechstes))) { aus += ","; continue; }
      merke(i, "unbekanntesZeichen");
      vorToken();
      aus += "?";
      continue;
    }

    if (z === BRUCHSTRICH) {
      if (endetMitZiffer() && !leerzeichen) { aus += "/"; continue; }
      merke(i, "unbekanntesZeichen");
      vorToken();
      aus += "?";
      continue;
    }

    let treffer: (typeof LESE)[number] | null = null;
    for (const eintrag of LESE) {
      if (zellen.slice(i, i + eintrag[0].length).join("") === eintrag[0]) { treffer = eintrag; break; }
    }
    if (treffer) {
      const [folge, f] = treffer;
      if (f.op) {
        aus += termende() ? " " + f.text : f.text;
        leerzeichen = false;
      } else if (f.prozent) {
        aus += termende() ? " %" : "%";
        leerzeichen = false;
      } else if (f.klammer === "auf") {
        vorToken();
        klammern++;
        aus += f.text;
      } else {
        if (klammern === 0) merke(i, "schliesstOhneOffen");
        klammern = Math.max(0, klammern - 1);
        aus += f.text;
        leerzeichen = false;
      }
      i += folge.length - 1;
      continue;
    }

    // Alles andere: Buchstaben (Punkte 1-5 ohne 6), Zeichen, die Plus in Französisch nicht baut.
    const code = z.codePointAt(0)! - 0x2800;
    // Punkte 1-5 allein: die Buchstaben des Alphabets (NMB S. 7); ihre Regeln (Abkürzung, Klein/Groß) sind nicht gebaut.
    const buchstabe = code > 0 && code < 0x20;
    merke(i, buchstabe ? "buchstabeNichtGebaut" : "unbekanntesZeichen");
    vorToken();
    aus += "?";
  }

  if (klammern > 0) merke(zellen.length, "klammerOffen");
  return { text: aus.trimEnd(), hinweise };
}

/** Die Kurzform, wenn nur der Text gebraucht wird. */
export function frZuText(eingabe: string): string {
  return leseFr(eingabe).text;
}

/* ------------------------------------------------------------------ */
/* Der Weg zurück: Rechenzeile -> Zellen                                  */
/* ------------------------------------------------------------------ */

type Teil =
  | { art: "zahl"; zellen: string }
  | { art: "op"; zellen: string }
  | { art: "auf" | "zu"; zellen: string }
  | { art: "prozent"; zellen: string };

/**
 * Eine Rechenzeile in Zellen schreiben - oder `null`.
 *
 * ★ `null` heißt: diese Zeile kann der Schreiber nicht - Wörter, Buchstaben,
 * Einheiten, Hochzahlen, Wurzeln, Vorzeichen, gemischte Zahlen, Platzhalter
 * `[]` (siehe Kopf). Der Generator für Französisch lässt solche Aufgaben weg;
 * das wird gemessen, nicht überspielt (`tests/plus-fr.test.tsx`).
 *
 * Leerzeichen: keines um die Zeichen (NMB S. 9 Nr. 6). Zwei Zahlen mit einem
 * Leerzeichen dazwischen behalten es (sonst wären sie eine Zahl).
 */
export function schreibeFr(zeile: string): string | null {
  const teile: Array<{ teil: Teil; leerzeichenDavor: boolean }> = [];
  let i = 0;
  let leerzeichen = false;
  while (i < zeile.length) {
    const z = zeile[i];
    if (z === " ") { leerzeichen = true; i++; continue; }

    const vorher = teile.length ? teile[teile.length - 1].teil : null;
    const ohneVorzeichen = !vorher || vorher.art === "op" || vorher.art === "auf";

    if (zeile.startsWith("[]", i)) return null;

    const zahl = /^(\d+)(?:,(\d+))?/.exec(zeile.slice(i));
    if (zahl) {
      const rest = zeile.slice(i + zahl[0].length);
      const ganz = !zahl[2];
      const bruch = ganz ? /^\/(\d+)(?![\d,/])/.exec(rest) : null;
      // Gemischte Zahl (`2 1/2`): in den gelesenen Seiten nicht belegt.
      if (ganz && !bruch && /^ \d+\/\d+(?![\d,/])/.test(rest)) return null;
      const ziffern = (n: string) => [...n].map((c) => ZIFFER_ZELLE[c]).join("");
      let zellen: string;
      if (bruch) {
        zellen = ziffern(zahl[1]) + BRUCHSTRICH + ziffern(bruch[1]);
        i += zahl[0].length + bruch[0].length;
      } else {
        zellen = ziffern(zahl[1]) + (zahl[2] ? KOMMA + ziffern(zahl[2]) : "");
        i += zahl[0].length;
      }
      // Hinter einer Zahl ein Buchstabe: Einheit oder Variable - nicht gebaut.
      if (/^[A-Za-z]/.test(zeile.slice(i))) return null;
      teile.push({ teil: { art: "zahl", zellen }, leerzeichenDavor: leerzeichen });
      leerzeichen = false;
      continue;
    }

    // Ein Komma gleich hinter einer Ziffer am Zeilenende: die Zahl wird gerade getippt (`2,`).
    if (z === "," && vorher?.art === "zahl" && !leerzeichen && i === zeile.length - 1 && !teile[teile.length - 1].teil.zellen.includes(KOMMA)) {
      teile[teile.length - 1].teil = { art: "zahl", zellen: teile[teile.length - 1].teil.zellen + KOMMA };
      i++;
      continue;
    }

    if (z === "%") {
      if (!vorher || vorher.art !== "zahl") return null;
      teile.push({ teil: { art: "prozent", zellen: PROZENT }, leerzeichenDavor: false });
      leerzeichen = false;
      i++;
      continue;
    }

    const zwei = zeile.slice(i, i + 2);
    let op: string | null = null;
    if (zwei === "<=" || zwei === ">=" || zwei === "!=") op = zwei;
    else if ("+-*/=<>".includes(z)) op = z;
    if (op) {
      if ((op === "-" || op === "+") && ohneVorzeichen && !leerzeichen) return null;
      if (op === "/" && zeile[i - 1] !== " ") return null;
      teile.push({ teil: { art: "op", zellen: OP_ZELLE[op] }, leerzeichenDavor: leerzeichen });
      leerzeichen = false;
      i += op.length;
      continue;
    }

    if (z in KLAMMER_ZELLE) {
      const auf = z === "(" || z === "[" || z === "{";
      teile.push({ teil: { art: auf ? "auf" : "zu", zellen: KLAMMER_ZELLE[z] }, leerzeichenDavor: leerzeichen });
      leerzeichen = false;
      i++;
      continue;
    }

    return null;   // Wörter, Buchstaben, Platzhalter, Hochzahl, Wurzel ...
  }

  let aus = "";
  let vor: Teil | null = null;
  for (const { teil, leerzeichenDavor } of teile) {
    // Nur zwei Zahlen hintereinander brauchen das Leerzeichen, sonst würden sie eine Zahl.
    if (vor && vor.art === "zahl" && teil.art === "zahl" && leerzeichenDavor) aus += "⠀";
    aus += teil.zellen;
    vor = teil;
  }
  return aus;
}

/* ------------------------------------------------------------------ */
/* Die Zeichentabelle zum Prüfen gegen die Norm                         */
/* ------------------------------------------------------------------ */

export interface FrZeichen {
  konstrukt: string;
  zellen: string;
  /** Dokument + gedruckte Seite. */
  quelle: string;
  /** Die Punktangabe, wie sie in der Norm steht (der Wächter rechnet sie nach). */
  punkte: string;
  /** Eine Plus-Zeile, die genau dieses Zeichen schreibt (für den Wächter). */
  zeile?: string;
}

const NMB = "NMB 2007";
export const FR_ZEICHEN: readonly FrZeichen[] = [
  { konstrukt: "Ziffer 1", zellen: ZIFFER_ZELLE["1"], punkte: "1-6", quelle: `${NMB} S. 12`, zeile: "1" },
  { konstrukt: "Ziffer 2", zellen: ZIFFER_ZELLE["2"], punkte: "1-2-6", quelle: `${NMB} S. 12`, zeile: "2" },
  { konstrukt: "Ziffer 3", zellen: ZIFFER_ZELLE["3"], punkte: "1-4-6", quelle: `${NMB} S. 12`, zeile: "3" },
  { konstrukt: "Ziffer 4", zellen: ZIFFER_ZELLE["4"], punkte: "1-4-5-6", quelle: `${NMB} S. 12`, zeile: "4" },
  { konstrukt: "Ziffer 5", zellen: ZIFFER_ZELLE["5"], punkte: "1-5-6", quelle: `${NMB} S. 12`, zeile: "5" },
  { konstrukt: "Ziffer 6", zellen: ZIFFER_ZELLE["6"], punkte: "1-2-4-6", quelle: `${NMB} S. 12`, zeile: "6" },
  { konstrukt: "Ziffer 7", zellen: ZIFFER_ZELLE["7"], punkte: "1-2-4-5-6", quelle: `${NMB} S. 12`, zeile: "7" },
  { konstrukt: "Ziffer 8", zellen: ZIFFER_ZELLE["8"], punkte: "1-2-5-6", quelle: `${NMB} S. 12`, zeile: "8" },
  { konstrukt: "Ziffer 9", zellen: ZIFFER_ZELLE["9"], punkte: "2-4-6", quelle: `${NMB} S. 12`, zeile: "9" },
  { konstrukt: "Ziffer 0", zellen: ZIFFER_ZELLE["0"], punkte: "3-4-5-6", quelle: `${NMB} S. 12`, zeile: "0" },
  { konstrukt: "Dezimalkomma (virgule)", zellen: KOMMA, punkte: "2", quelle: `${NMB} S. 25 (Beispiel 0,5)`, zeile: "0,5" },
  { konstrukt: "Plus", zellen: OP_ZELLE["+"], punkte: "2-3-5", quelle: `${NMB} S. 17`, zeile: "1 +1" },
  { konstrukt: "Minus (moins)", zellen: OP_ZELLE["-"], punkte: "3-6", quelle: `${NMB} S. 17`, zeile: "1 -1" },
  { konstrukt: "Mal (multiplié par ×)", zellen: OP_ZELLE["*"], punkte: "3-5", quelle: `${NMB} S. 17`, zeile: "1 *1" },
  { konstrukt: "Mal Punkt (·), nur gelesen", zellen: MAL_PUNKT, punkte: "3-5, 3-5", quelle: `${NMB} S. 17` },
  { konstrukt: "Geteilt (divisé par ÷)", zellen: OP_ZELLE["/"], punkte: "2-5", quelle: `${NMB} S. 17, 25`, zeile: "1 /1" },
  { konstrukt: "Bruchstrich (fraction)", zellen: BRUCHSTRICH, punkte: "3-4", quelle: `${NMB} S. 25 (Beispiel 2/3 = 4/6)`, zeile: "2/3" },
  { konstrukt: "Gleich (égal)", zellen: OP_ZELLE["="], punkte: "2-3-5-6", quelle: `${NMB} S. 19`, zeile: "1 =1" },
  { konstrukt: "kleiner (<)", zellen: OP_ZELLE["<"], punkte: "5, 1-2-6", quelle: `${NMB} S. 19`, zeile: "1 <1" },
  { konstrukt: "größer (>)", zellen: OP_ZELLE[">"], punkte: "5, 3-4-5", quelle: `${NMB} S. 19`, zeile: "1 >1" },
  { konstrukt: "kleiner gleich", zellen: OP_ZELLE["<="], punkte: "4-5, 1-2-6", quelle: `${NMB} S. 19`, zeile: "1 <=1" },
  { konstrukt: "größer gleich", zellen: OP_ZELLE[">="], punkte: "4-5, 3-4-5", quelle: `${NMB} S. 19`, zeile: "1 >=1" },
  { konstrukt: "ungleich (différent de)", zellen: OP_ZELLE["!="], punkte: "4-6, 2-3-5-6", quelle: `${NMB} S. 19`, zeile: "1 !=1" },
  { konstrukt: "Klammer rund auf", zellen: KLAMMER_ZELLE["("], punkte: "2-3-6", quelle: `${NMB} S. 21`, zeile: "(1)" },
  { konstrukt: "Klammer rund zu", zellen: KLAMMER_ZELLE[")"], punkte: "3-5-6", quelle: `${NMB} S. 21`, zeile: "(1)" },
  { konstrukt: "Klammer eckig auf", zellen: KLAMMER_ZELLE["["], punkte: "1-2-3-5-6", quelle: `${NMB} S. 21`, zeile: "[1]" },
  { konstrukt: "Klammer eckig zu", zellen: KLAMMER_ZELLE["]"], punkte: "2-3-4-5-6", quelle: `${NMB} S. 21`, zeile: "[1]" },
  { konstrukt: "Klammer geschweift auf", zellen: KLAMMER_ZELLE["{"], punkte: "4-6, 2-3-6", quelle: `${NMB} S. 21`, zeile: "{1}" },
  { konstrukt: "Klammer geschweift zu", zellen: KLAMMER_ZELLE["}"], punkte: "4-6, 3-5-6", quelle: `${NMB} S. 21`, zeile: "{1}" },
  { konstrukt: "Prozent (pour cent)", zellen: PROZENT, punkte: "5, 3-4-6", quelle: `${NMB} S. 67 (16.4, Beispiel 5%)`, zeile: "15 %" },
  { konstrukt: "Modificateur mathématique (nur gelesen)", zellen: MODIFIKATOR, punkte: "6", quelle: `${NMB} S. 8 Nr. 3, S. 11` },
];
