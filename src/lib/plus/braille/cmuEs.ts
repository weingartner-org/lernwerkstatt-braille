/**
 * Código Matemático Unificado para Iberoamérica (CMU), 2.ª edición, abril 2024
 * - vom Braillezeichen zur Rechenzeile und zurück. Der Mathe-Code von Plus für
 * Spanisch (Bauplan 2026-11-06 §5).
 *
 * ★★★ NUR GEBAUT, WAS BELEGT IST. Jede Zelle in diesem Modul steht im Befund
 * `BEFUND-2026-11-07-PLUS-MATHE-CODES.md` §2.2 mit Seite (gedruckte Seitenzahl
 * der CMU 2024; Quelle: Consejo Iberoamericano del Braille / ONCE). Was die
 * Norm im Befund nicht sagt, ist NICHT gebaut - `schreibeCmuEs` liefert dann
 * `null` und der Generator lässt die Aufgabe für Spanisch weg
 * (`lib/plus/sprachfilter.ts`). Das sind:
 *
 *  - Buchstaben, Variable, Einheiten (`cm`, `kg`, `l`, `h`, `min`): Liter,
 *    Stunde, Minute, Tonne stehen im Befund NICHT (Anhang 1 S. 111-114 nennt
 *    nur SI-Einheiten); die Regel für Einheit ohne Leerzeichen (Punkt 5) ist
 *    nur an einem Beispiel gesehen (Befund §7 Nr. 6).
 *  - Hochzahl mit Zahl als Basis (`2^3`): belegt ist `⠡` und das Beispiel
 *    `x²` mit Buchstaben.
 *  - Wurzel: belegt ist `⠫⠱⠼⠓` (√8); wie weit der Radikand reicht und wann
 *    Hilfsklammern `⠢ ⠔` stehen, steht nicht im Befund.
 *  - negative Zahlen / Vorzeichen: Befund: „`⠤` vor der Zahl" - ob vor oder
 *    hinter dem Zahlzeichen, ist nicht belegt.
 *  - Währung (Euro `⠸⠑`): „je Land vor oder nach der Zahl" - welche Seite,
 *    sagt der Befund nicht. Die spanischen Sachaufgaben fragen deshalb nach
 *    einer blossen Zahl; der Text über dem Feld braucht keine Mathe-Zellen.
 *  - Grad, Promille, Verhältnis-Doppelpunkt (als Plus-Zeichen), Rest.
 *  - Platzhalter `[]`: die CMU hat keine Regel (Befund §2.2, §7 Nr. 1).
 *    Festlegung wie bei Marburg und UEB: keine Zelle, die Klammern fallen
 *    weg, die Schreibmarke sitzt in der Lücke (`PlusEingabe`).
 *
 * ★ Wie Plus schreibt (Festlegungen, im Befund nicht entschieden - §7):
 *  - Leerzeichen VOR UND NACH Rechen- und Vergleichszeichen, wie die
 *    Plus-Zeile `48 +27 =75` es für Kinder zeigt. Die CMU zeigt ihre
 *    Beispiele eng (`3:4` = `⠼⠉⠐⠂⠼⠙`); beides wird gelesen. Mit Leerzeichen
 *    ist ein Zeichen wie `⠖` (Plus, aber auch gesenkte 6) nie verwechselbar.
 *  - Mal als Kreuz `⠦` (eine Zelle). Der Mal-Punkt `⠠` + Leerzelle wird
 *    gelesen und als Mal verstanden. Geteilt `/` als `⠲` („exclusivamente
 *    cuando indica división"); `⠐⠂` (`:` und `÷`) wird gelesen.
 *  - Dezimalkomma `⠂` (Norm 2.3 S. 19). Die Plus-Zeile hat keine Tausender-
 *    trennung, also schreibt Plus auch keine; die Norm-Trennung Punkt 3 `⠄`
 *    zwischen Ziffern (`31.720`) wird gelesen und verschluckt (offen: ob die
 *    Norm sie ab fünf Ziffern verlangt).
 *  - Bruch: Zähler mit Zahlzeichen, Nenner GESENKT (5. Reihe: `⠂⠆⠒⠲⠢⠖⠶⠦⠔⠴`
 *    für 1-9, 0 - die Definition der Reihe; belegt an `¾ = ⠼⠉⠲␣` und
 *    `⠼⠉⠼⠁⠢`), danach eine LEERZELLE (Norm 2.4 S. 19-20). Der Leser nimmt
 *    eine gesenkte Folge nach Ziffern als Nenner, wenn Leerzelle, Zeilenende
 *    oder eine schliessende Klammer folgt; sonst ist es ein Rechenzeichen.
 *    Darum: eng geschriebenes `5=` am Zeilenende lässt sich nicht von `5/7`
 *    unterscheiden - Plus schreibt immer mit Leerzeichen davor.
 *  - Prozent `⠸⠴` ohne Leerzeichen zur Zahl (Norm 5.4 S. 60); die
 *    Plus-Zeile hat `25 %` mit Leerzeichen.
 *
 * ★ Die Plus-Zeile bleibt die Mitte: `48 +27 =75`, Bruch `3/4`, Dezimalkomma
 *   `0,5`, Mal `*`, Geteilt `/`. Dezimalzeichen wie Deutsch: das Komma.
 */

/* ------------------------------------------------------------------ */
/* Die Zellen - jede mit Fundstelle                                     */
/* ------------------------------------------------------------------ */

const CMU = "CMU 2024";

/** Zahlzeichen ⠼ (3456) + a-j: 2.1 S. 18. */
const ZAHLZEICHEN = "⠼";
const ZIFFER_ZELLE: Record<string, string> = {
  "1": "⠁", "2": "⠃", "3": "⠉", "4": "⠙", "5": "⠑",
  "6": "⠋", "7": "⠛", "8": "⠓", "9": "⠊", "0": "⠚",
};
const ZELLE_ZIFFER: Record<string, string> = Object.fromEntries(
  Object.entries(ZIFFER_ZELLE).map(([z, c]) => [c, z]),
);

/** Nenner gesenkt, 5. Reihe: 2.4 S. 19-20 (belegt an ⠲ = 4 und ⠢ = 5). */
const GESENKT: Record<string, string> = {
  "1": "⠂", "2": "⠆", "3": "⠒", "4": "⠲", "5": "⠢",
  "6": "⠖", "7": "⠶", "8": "⠦", "9": "⠔", "0": "⠴",
};
const GESENKT_ZIFFER: Record<string, string> = Object.fromEntries(
  Object.entries(GESENKT).map(([z, c]) => [c, z]),
);

/** Dezimalkomma ⠂ (2): 2.3 S. 19. */
const DEZIMALKOMMA = "⠂";
/** Tausendertrennung Punkt 3: 2.2 S. 18 (`31.720` = ⠼⠉⠁⠄⠛⠃⠚). Nur gelesen. */
const TAUSENDER = "⠄";
/** Leerzelle - nach jedem Bruch (2.4 S. 19-20). */
const LEER = "⠀";

const OP_ZELLE: Record<string, string> = {
  "+": "⠖",      // 5.1 S. 55
  "-": "⠤",      // 5.1 S. 55
  "*": "⠦",      // Mal Kreuz ×: 5.1 S. 55
  "/": "⠲",      // Geteilt, Schrägstrich/Bruchstrich: 5.1 S. 55-56
  "=": "⠶",      // 5.1 S. 55; 6.1 S. 64
  "<": "⠪",      // 6.1 S. 65
  ">": "⠕",      // 6.1 S. 65
  "<=": "⠪⠶",    // 6.1 S. 65
  ">=": "⠕⠶",    // 6.1 S. 65
  "!=": "⠘⠶",    // ungleich: 6.2 S. 65
};
/** Geteilt `:` und `÷` in jeder Schreibweise ⠐⠂ (5.1 S. 55; `3:4` S. 56). Nur gelesen. */
const GETEILT_DOPPELPUNKT = "⠐⠂";
/** Mal Punkt `·` = ⠠ + (halbe) Leerzelle (5.1 S. 55-56). Nur gelesen. */
const MAL_PUNKT = "⠠";

const KLAMMER_ZELLE: Record<string, string> = {
  "(": "⠣", ")": "⠜",        // 3.1 S. 23
  "[": "⠷", "]": "⠾",        // 3.1 S. 23
  "{": "⠐⠇", "}": "⠸⠂",      // 3.1 S. 23
};

/** Prozent ⠸⠴, keine Leerzelle zur Zahl: 5.4 S. 60 (`21 %` = ⠼⠃⠁⠸⠴). */
const PROZENT = "⠸⠴";

/** Zellfolgen zum Lesen, längste zuerst: Zellen -> Zeichen der Plus-Zeile. */
const LESE: Array<[string, { text: string; op?: boolean; klammer?: "auf" | "zu"; prozent?: boolean }]> = [
  [OP_ZELLE["!="], { text: "!=", op: true }],
  [OP_ZELLE["<="], { text: "<=", op: true }],
  [OP_ZELLE[">="], { text: ">=", op: true }],
  [GETEILT_DOPPELPUNKT, { text: "/", op: true }],
  [OP_ZELLE["+"], { text: "+", op: true }],
  [OP_ZELLE["-"], { text: "-", op: true }],
  [OP_ZELLE["*"], { text: "*", op: true }],
  [OP_ZELLE["/"], { text: "/", op: true }],
  [OP_ZELLE["="], { text: "=", op: true }],
  [OP_ZELLE["<"], { text: "<", op: true }],
  [OP_ZELLE[">"], { text: ">", op: true }],
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

export interface CmuEsHinweis {
  stelle: number;
  /** Schlüssel in `PlusTexte.hinweise` - der Text kommt aus der Texttabelle. */
  schluessel: "unbekanntesZeichen" | "buchstabeNichtGebaut" | "klammerOffen" | "schliesstOhneOffen";
}

export interface CmuEsLesung {
  text: string;
  hinweise: CmuEsHinweis[];
}

const istZiffernzelle = (z: string | undefined): boolean => !!z && z in ZELLE_ZIFFER;

/** Wie viele gesenkte Zellen stehen ab `von`? */
function gesenkteFolge(zellen: string[], von: number): number {
  let n = 0;
  while (von + n < zellen.length && zellen[von + n] in GESENKT_ZIFFER) n++;
  return n;
}

/**
 * CMU-Zellen in die Rechenzeile von Plus lesen.
 *
 * Zahlzeichen `⠼` schaltet den Zahlmodus ein; er läuft über Dezimalkomma und
 * Tausendertrennung weiter und endet am Leerzeichen und an jedem Zeichen
 * (2.1-2.3 S. 18-19). Ein zweites `⠼` mitten in einer Zahl ist die gemischte
 * Zahl `⠼⠉⠼⠁⠢` = `3 1/5` (2.4 S. 19-20). Gesenkte Zellen direkt nach Ziffern
 * sind der Nenner, wenn Leerzelle, Zeilenende oder eine schliessende Klammer
 * folgt.
 */
export function leseCmuEs(eingabe: string): CmuEsLesung {
  const zellen = [...eingabe];
  const hinweise: CmuEsHinweis[] = [];
  let aus = "";
  let zahlmodus = false;
  let ziffern = 0;
  let leerzeichen = false;
  let klammern = 0;

  const merke = (stelle: number, schluessel: CmuEsHinweis["schluessel"]) => hinweise.push({ stelle, schluessel });
  const termende = () => /[0-9)\]}%?]/.test(aus.slice(-1));
  const vorToken = () => {
    if (leerzeichen && termende()) aus += " ";
    leerzeichen = false;
  };
  const beendeZahl = () => { zahlmodus = false; ziffern = 0; };

  for (let i = 0; i < zellen.length; i++) {
    const z = zellen[i];
    const naechstes = zellen[i + 1];

    if (z === LEER) { beendeZahl(); leerzeichen = true; continue; }

    if (z === ZAHLZEICHEN) {
      if (zahlmodus && ziffern > 0) {
        // Gemischte Zahl: die Ganzen, dann der Bruch mit eigenem Zahlzeichen.
        aus += " ";
        ziffern = 0;
      } else {
        vorToken();
        zahlmodus = true;
        ziffern = 0;
      }
      continue;
    }

    if (zahlmodus) {
      if (istZiffernzelle(z)) { aus += ZELLE_ZIFFER[z]; ziffern++; continue; }
      if (ziffern > 0 && z === DEZIMALKOMMA && istZiffernzelle(naechstes)) { aus += ","; continue; }
      if (ziffern > 0 && z === TAUSENDER && istZiffernzelle(naechstes)) continue;
      if (ziffern > 0 && z in GESENKT_ZIFFER) {
        const lang = gesenkteFolge(zellen, i);
        const danach = zellen[i + lang];
        if (danach === undefined || danach === LEER || danach === KLAMMER_ZELLE[")"] || danach === KLAMMER_ZELLE["]"]) {
          aus += "/" + zellen.slice(i, i + lang).map((c) => GESENKT_ZIFFER[c]).join("");
          i += lang - 1;
          beendeZahl();
          continue;
        }
      }
    }

    // Mal Punkt: ⠠ + Leerzelle (5.1 S. 55-56).
    if (z === MAL_PUNKT && naechstes === LEER) {
      beendeZahl();
      aus += termende() ? " *" : "*";
      leerzeichen = false;
      continue;
    }

    // Zeichen aus mehreren Zellen, längste zuerst.
    let treffer: (typeof LESE)[number] | null = null;
    for (const eintrag of LESE) {
      if (zellen.slice(i, i + eintrag[0].length).join("") === eintrag[0]) { treffer = eintrag; break; }
    }
    if (treffer) {
      const [folge, f] = treffer;
      beendeZahl();
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

    // Alles andere: Buchstaben und Zeichen, die Plus in Spanisch noch nicht
    // baut - nicht raten.
    beendeZahl();
    merke(i, /[⠁-⠵]/.test(z) ? "buchstabeNichtGebaut" : "unbekanntesZeichen");
    vorToken();
    aus += "?";
  }

  if (klammern > 0) merke(zellen.length, "klammerOffen");
  return { text: aus.trimEnd(), hinweise };
}

/** Die Kurzform, wenn nur der Text gebraucht wird. */
export function cmuEsZuText(eingabe: string): string {
  return leseCmuEs(eingabe).text;
}

/* ------------------------------------------------------------------ */
/* Der Weg zurück: Rechenzeile -> CMU                                    */
/* ------------------------------------------------------------------ */

type Teil =
  | { art: "zahl"; zellen: string }
  | { art: "op"; zellen: string }
  | { art: "auf" | "zu"; zellen: string }
  | { art: "prozent"; zellen: string };

/**
 * Eine Rechenzeile in CMU schreiben - oder `null`.
 *
 * ★ `null` heißt: diese Zeile kann der Schreiber nicht - Wörter, Buchstaben,
 * Einheiten, Hochzahlen, Wurzeln, Vorzeichen, Platzhalter `[]` (siehe Kopf).
 * Der Generator für Spanisch lässt solche Aufgaben weg; das wird gemessen,
 * nicht überspielt (`tests/plus-es.test.tsx`).
 *
 * Leerzeichen: zwischen Zahl und Rechenzeichen steht eines, auf beiden Seiten.
 * Innerhalb einer Klammer und vor `%` keines. Das Zahlzeichen steht vor jeder
 * Zahl, auch nach einem Leerzeichen (Beispiel `6·2` = ⠼⠋⠠␣⠼⠃, S. 55-56). Nach
 * einem Bruch immer eine Leerzelle (2.4 S. 19-20).
 */
export function schreibeCmuEs(zeile: string): string | null {
  const teile: Array<{ teil: Teil; leerzeichenDavor: boolean }> = [];
  let i = 0;
  let leerzeichen = false;
  let endetMitLeerzeichen = false;

  const ziffern = (n: string) => [...n].map((c) => ZIFFER_ZELLE[c]).join("");
  const nenner = (n: string) => [...n].map((c) => GESENKT[c]).join("");

  while (i < zeile.length) {
    const z = zeile[i];
    if (z === " ") { leerzeichen = true; endetMitLeerzeichen = true; i++; continue; }
    endetMitLeerzeichen = false;

    const vorher = teile.length ? teile[teile.length - 1].teil : null;
    const ohneVorzeichen = !vorher || vorher.art === "op" || vorher.art === "auf";

    // Der Platzhalter `[]` ist keine eckige Klammer: er hat keine Zelle (die Eingabe streicht ihn).
    if (zeile.startsWith("[]", i)) return null;

    const zahl = /^(\d+)(?:,(\d+))?/.exec(zeile.slice(i));
    if (zahl) {
      const rest = zeile.slice(i + zahl[0].length);
      const ganz = !zahl[2];
      const bruch = ganz ? /^\/(\d+)(?![\d,/])/.exec(rest) : null;
      const gemischt = ganz && !bruch ? /^ (\d+)\/(\d+)(?![\d,/])/.exec(rest) : null;
      let zellen: string;
      if (gemischt) {
        // 2.4 S. 19-20: Ganze mit Zahlzeichen, dann Bruch mit eigenem Zahlzeichen, Nenner gesenkt.
        zellen = ZAHLZEICHEN + ziffern(zahl[1]) + ZAHLZEICHEN + ziffern(gemischt[1]) + nenner(gemischt[2]) + LEER;
        i += zahl[0].length + gemischt[0].length;
      } else if (bruch) {
        // 2.4 S. 19-20: Zähler mit Zahlzeichen, Nenner gesenkt, dann Leerzelle.
        zellen = ZAHLZEICHEN + ziffern(zahl[1]) + nenner(bruch[1]) + LEER;
        i += zahl[0].length + bruch[0].length;
      } else {
        zellen = ZAHLZEICHEN + ziffern(zahl[1]) + (zahl[2] ? DEZIMALKOMMA + ziffern(zahl[2]) : "");
        i += zahl[0].length;
      }
      // Hinter einer Zahl ein Buchstabe: Einheit oder Variable - nicht gebaut.
      if (/^[A-Za-z]/.test(zeile.slice(i))) return null;
      teile.push({ teil: { art: "zahl", zellen }, leerzeichenDavor: leerzeichen });
      leerzeichen = false;
      continue;
    }

    if (z === "%") {
      if (!vorher || vorher.art !== "zahl") return null;
      // Nach einem Bruch gäbe es zwei Leerzellen vor dem Zeichen - nicht belegt.
      if (vorher.zellen.endsWith(LEER)) return null;
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
      // Vorzeichen (`-5`, `3 *-2`) und `/` ohne Zahl davor: keine belegte Schreibweise.
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

    return null;   // Wörter, Buchstaben, Platzhalter, Hochzahl, Wurzel, Aufzählung ...
  }

  let aus = "";
  let vor: Teil | null = null;
  for (const { teil, leerzeichenDavor } of teile) {
    let leer = false;
    if (vor) {
      if (teil.art === "op" || vor.art === "op") leer = true;
      else if (teil.art === "zu" || teil.art === "prozent") leer = false;
      else if (vor.art === "auf") leer = false;
      else leer = leerzeichenDavor;
    }
    if (leer && !aus.endsWith(LEER)) aus += LEER;
    aus += teil.zellen;
    vor = teil;
  }
  // Ein Leerzeichen am Ende bleibt hinter einem Term stehen (das Kind tippt es
  // vor dem nächsten Zeichen) - nach einem Rechenzeichen ist es überflüssig.
  if (endetMitLeerzeichen && vor && vor.art !== "op" && vor.art !== "auf" && !aus.endsWith(LEER)) aus += LEER;
  return aus;
}

/* ------------------------------------------------------------------ */
/* Die Zeichentabelle zum Prüfen gegen die Norm                         */
/* ------------------------------------------------------------------ */

export interface CmuEsZeichen {
  konstrukt: string;
  zellen: string;
  /** Dokument + gedruckte Seite. */
  quelle: string;
  /** Eine Plus-Zeile, die genau dieses Zeichen schreibt (für den Wächter). */
  zeile?: string;
}

export const CMU_ES_ZEICHEN: readonly CmuEsZeichen[] = [
  { konstrukt: "Zahlzeichen", zellen: "⠼", quelle: `${CMU} 2.1 S. 18`, zeile: "1" },
  { konstrukt: "Dezimalkomma", zellen: "⠂", quelle: `${CMU} 2.3 S. 19`, zeile: "2,5" },
  { konstrukt: "Tausendertrennung Punkt 3, nur gelesen", zellen: "⠄", quelle: `${CMU} 2.2 S. 18` },
  { konstrukt: "Bruch, einfach (Nenner gesenkt, Leerzelle)", zellen: "⠼⠉⠲⠀", quelle: `${CMU} 2.4 S. 19-20`, zeile: "3/4" },
  { konstrukt: "gemischte Zahl", zellen: "⠼⠉⠼⠁⠢", quelle: `${CMU} 2.4 S. 19-20`, zeile: "3 1/5" },
  { konstrukt: "Plus", zellen: "⠖", quelle: `${CMU} 5.1 S. 55`, zeile: "1 +1" },
  { konstrukt: "Minus", zellen: "⠤", quelle: `${CMU} 5.1 S. 55`, zeile: "1 -1" },
  { konstrukt: "Mal Kreuz (×)", zellen: "⠦", quelle: `${CMU} 5.1 S. 55`, zeile: "1 *1" },
  { konstrukt: "Mal Punkt (·), nur gelesen", zellen: "⠠⠀", quelle: `${CMU} 5.1 S. 55-56` },
  { konstrukt: "Geteilt (Schrägstrich)", zellen: "⠲", quelle: `${CMU} 5.1 S. 55-56`, zeile: "1 /1" },
  { konstrukt: "Geteilt : und ÷, nur gelesen", zellen: "⠐⠂", quelle: `${CMU} 5.1 S. 55-56` },
  { konstrukt: "Gleich", zellen: "⠶", quelle: `${CMU} 5.1 S. 55; 6.1 S. 64`, zeile: "1 =1" },
  { konstrukt: "kleiner", zellen: "⠪", quelle: `${CMU} 6.1 S. 65`, zeile: "1 <1" },
  { konstrukt: "größer", zellen: "⠕", quelle: `${CMU} 6.1 S. 65`, zeile: "1 >1" },
  { konstrukt: "kleiner gleich", zellen: "⠪⠶", quelle: `${CMU} 6.1 S. 65`, zeile: "1 <=1" },
  { konstrukt: "größer gleich", zellen: "⠕⠶", quelle: `${CMU} 6.1 S. 65`, zeile: "1 >=1" },
  { konstrukt: "ungleich", zellen: "⠘⠶", quelle: `${CMU} 6.2 S. 65`, zeile: "1 !=1" },
  { konstrukt: "Klammer rund auf", zellen: "⠣", quelle: `${CMU} 3.1 S. 23`, zeile: "(1)" },
  { konstrukt: "Klammer rund zu", zellen: "⠜", quelle: `${CMU} 3.1 S. 23`, zeile: "(1)" },
  { konstrukt: "Klammer eckig auf", zellen: "⠷", quelle: `${CMU} 3.1 S. 23`, zeile: "[1]" },
  { konstrukt: "Klammer eckig zu", zellen: "⠾", quelle: `${CMU} 3.1 S. 23`, zeile: "[1]" },
  { konstrukt: "Klammer geschweift auf", zellen: "⠐⠇", quelle: `${CMU} 3.1 S. 23`, zeile: "{1}" },
  { konstrukt: "Klammer geschweift zu", zellen: "⠸⠂", quelle: `${CMU} 3.1 S. 23`, zeile: "{1}" },
  { konstrukt: "Prozent", zellen: "⠸⠴", quelle: `${CMU} 5.4 S. 60`, zeile: "21 %" },
];
