/**
 * Unified English Braille (UEB), Technical - vom Braillezeichen zur Rechenzeile
 * und zurück. Der Mathe-Code von Plus für Englisch (Bauplan 2026-11-06 §5).
 *
 * ★★★ NUR GEBAUT, WAS BELEGT IST. Jede Zelle in diesem Modul steht im
 * Befund `BEFUND-2026-11-07-PLUS-MATHE-CODES.md` §2.1 mit Seitenzahl; die
 * Quellen sind
 *   GTM   = „Unified English Braille: Guidelines for Technical Material",
 *           2008, updated August 2014 (ICEB), und
 *   Rules = „The Rules of Unified English Braille", 3rd Edition 2024 (ICEB).
 * Die Gegenprobe gegen MathCAT UEB macht `tests/plus-en.test.tsx`. Was die
 * Norm im Befund nicht eindeutig sagt, ist NICHT gebaut - `schreibeUeb`
 * liefert dann `null` und der Generator lässt die Aufgabe für Englisch weg
 * (`lib/plus/sprachfilter.ts`). Das sind:
 *
 *  - Buchstaben, Variable, Einheiten (`cm`, `kg`): in UEB ist ein einzelner
 *    Buchstabe zugleich Kurzform („g" = go, „m" = more ...); wann das
 *    Grad-1-Zeichen `⠰` davorstehen muss, sagt der Befund nur an zwei
 *    Beispielen. Ohne Regel keine Zellen.
 *  - Hochzahl mit Zahl als Basis (`2^3`): belegt ist `⠔` und das Beispiel
 *    `x²`; die Zahl-Basis ist nicht an einem Beispiel gesehen.
 *  - Wurzel: Beispiel `√9 = ⠰⠩⠼⠊⠬`, aber MathCAT setzt das `⠰` nur „wenn
 *    nötig". Wann, steht nicht im Befund.
 *  - negative Zahlen / Vorzeichen: GTM 3.3 S. 17 sagt nur „Bindestrich `⠤`,
 *    wo im Druck nicht unterscheidbar" - kein Beispiel für `-5`.
 *  - Währung £ (Pfund): im Befund nicht belegt (nur Euro und Cent). Die
 *    englischen Sachaufgaben fragen deshalb nach einer blossen Zahl.
 *  - Grad, Promille, Verhältnis-Doppelpunkt, Rest, Tausendertrennung.
 *  - Platzhalter `[]`: GTM 3.6 S. 19 hat Auswahl (Quadrat `⠫⠼⠙`, `⠬`, ...).
 *    Johannes' Festlegung (Befund §7 Nr. 1, vorläufig): wie Marburg - keine
 *    Zelle, die Klammern fallen weg, die Schreibmarke sitzt in der Lücke.
 *
 * ★ Schreibweise im Plus-Feld (Befund §2.1, GTM 1.1.2 S. 1): für jüngere
 *   Kinder Leerzeichen VOR UND NACH Rechen- und Vergleichszeichen. Die Zelle
 *   des Zeichens bleibt dieselbe, auch mit Leerzeichen (Beispielzeile
 *   `⠼⠉ ⠐⠖ ⠼⠑ ⠐⠶ ⠼⠓` = 3 + 5 = 8, GTM 3 S. 15). Gelesen werden beide Arten,
 *   mit und ohne Leerzeichen. Ob die Schule eng oder weit schreibt, ist offen
 *   (Befund §7 Nr. 2).
 *
 * ★ Die Plus-Zeile bleibt die Mitte: `48 +27 =75`, Bruch `3/4`, Dezimalpunkt
 *   `0.5`, Mal `*`, Geteilt `/`. Sie ist in Englisch dieselbe wie in Deutsch,
 *   nur das Dezimalzeichen ist der Punkt.
 */

/* ------------------------------------------------------------------ */
/* Die Zellen - jede mit Fundstelle                                     */
/* ------------------------------------------------------------------ */

/** Zahlzeichen: GTM 1.2.2 S. 2; Rules 6.1 S. 65-66. */
const ZAHLZEICHEN = "⠼";

/** Ziffern 1-9, 0 hinter dem Zahlzeichen: GTM 1.2.2 S. 2. */
const ZIFFER_ZELLE: Record<string, string> = {
  "1": "⠁", "2": "⠃", "3": "⠉", "4": "⠙", "5": "⠑",
  "6": "⠋", "7": "⠛", "8": "⠓", "9": "⠊", "0": "⠚",
};
const ZELLE_ZIFFER: Record<string, string> = Object.fromEntries(
  Object.entries(ZIFFER_ZELLE).map(([z, c]) => [c, z]),
);

/** Dezimalpunkt `8.93 = ⠼⠓⠲⠊⠉`: GTM 2.2 S. 9. */
const DEZIMALPUNKT = "⠲";
/** Bruchstrich in einfachen Zahlenbrüchen `⠼⠑⠌⠓`: GTM 6.1 S. 31. */
const BRUCHSTRICH = "⠌";

/** Die Zeichen mit ihren Zellen, in der Reihenfolge der Plus-Zeile. */
const OP_ZELLE: Record<string, string> = {
  "+": "⠐⠖",     // Plus: GTM 3 S. 15
  "-": "⠐⠤",     // Minus: GTM 3 S. 15
  "*": "⠐⠦",     // Mal Kreuz ×: GTM 3 S. 15
  "/": "⠐⠌",     // Geteilt ÷: GTM 3 S. 15
  "=": "⠐⠶",     // Gleich: GTM 3 S. 15
  "<": "⠈⠣",     // kleiner: GTM 3 S. 15
  ">": "⠈⠜",     // größer: GTM 3 S. 15
  "<=": "⠸⠈⠣",   // kleiner gleich: GTM 3 S. 15
  ">=": "⠸⠈⠜",   // größer gleich: GTM 3 S. 15
  "!=": "⠐⠶⠈⠱",  // ungleich: GTM 3 S. 15
};
/** Mal Punkt `·` ⠐⠲ (GTM 3 S. 15): wird gelesen und als `*` verstanden, geschrieben wird ×. */
const MAL_PUNKT = "⠐⠲";

const KLAMMER_ZELLE: Record<string, string> = {
  "(": "⠐⠣", ")": "⠐⠜",    // rund: GTM 5 S. 30
  "[": "⠨⠣", "]": "⠨⠜",    // eckig: GTM 5 S. 30
  "{": "⠸⠣", "}": "⠸⠜",    // geschweift: GTM 5 S. 30
};

/** Prozent `15% = ⠼⠁⠑⠨⠴`: GTM 2.10 S. 12, Beispiel S. 14. */
const PROZENT = "⠨⠴";

/** Alle Zellfolgen zum Lesen, längste zuerst: Zellen -> Zeichen der Plus-Zeile. */
const LESE: Array<[string, { text: string; op?: boolean; klammer?: "auf" | "zu"; prozent?: boolean }]> = [
  [OP_ZELLE["!="], { text: "!=", op: true }],
  [OP_ZELLE["<="], { text: "<=", op: true }],
  [OP_ZELLE[">="], { text: ">=", op: true }],
  [OP_ZELLE["+"], { text: "+", op: true }],
  [OP_ZELLE["-"], { text: "-", op: true }],
  [OP_ZELLE["*"], { text: "*", op: true }],
  [MAL_PUNKT, { text: "*", op: true }],
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
/* Was herauskommt (gleiche Form wie bei Marburg)                       */
/* ------------------------------------------------------------------ */

export interface UebHinweis {
  stelle: number;
  /** Schlüssel in `PlusTexte.hinweise` - der Text kommt aus der Texttabelle. */
  schluessel: "unbekanntesZeichen" | "kommaInZahl" | "buchstabeNichtGebaut" | "klammerOffen" | "schliesstOhneOffen";
}

export interface UebLesung {
  text: string;
  hinweise: UebHinweis[];
}

const ist_ziffernzelle = (z: string | undefined): boolean => !!z && z in ZELLE_ZIFFER;

/**
 * UEB-Zellen in die Rechenzeile von Plus lesen.
 *
 * Zahlzeichen `⠼` schaltet den Zahlmodus ein; er läuft über Dezimalpunkt und
 * Bruchstrich weiter und endet am Leerzeichen und an jedem Zeichen (GTM 1.2.2
 * S. 2, 2.1 S. 8, 6.1 S. 31). Ein zweites `⠼` mitten in einer Zahl ist die
 * gemischte Zahl `⠼⠃⠼⠁⠌⠃` = `2 1/2` (GTM 6.2 S. 31).
 */
export function leseUeb(eingabe: string): UebLesung {
  const zellen = [...eingabe];
  const hinweise: UebHinweis[] = [];
  let aus = "";
  let zahlmodus = false;
  let ziffern = 0;
  let leerzeichen = false;
  let klammern = 0;

  const merke = (stelle: number, schluessel: UebHinweis["schluessel"]) => hinweise.push({ stelle, schluessel });
  const termende = () => /[0-9)\]}%?]/.test(aus.slice(-1));
  /** Vor einem Zahl-/Klammerzeichen: ein Leerzeichen der Eingabe wird eines, wo ein Term endet. */
  const vorToken = () => {
    if (leerzeichen && termende()) aus += " ";
    leerzeichen = false;
  };
  const beendeZahl = () => { zahlmodus = false; ziffern = 0; };

  for (let i = 0; i < zellen.length; i++) {
    const z = zellen[i];
    const naechstes = zellen[i + 1];

    if (z === "⠀") { beendeZahl(); leerzeichen = true; continue; }

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
      if (ist_ziffernzelle(z)) { aus += ZELLE_ZIFFER[z]; ziffern++; continue; }
      if (z === DEZIMALPUNKT && ziffern > 0 && ist_ziffernzelle(naechstes)) { aus += "."; continue; }
      if (z === BRUCHSTRICH && ziffern > 0 && ist_ziffernzelle(naechstes)) { aus += "/"; ziffern = 0; continue; }
      if (z === "⠂" && ziffern > 0 && ist_ziffernzelle(naechstes)) {
        // Das Komma ist laut Rules 6.2.1 Dezimalzeichen oder Tausendertrenner
        // (GTM 2.1 S. 8) - welches, entscheidet nur der Leser. Plus rät nicht.
        merke(i, "kommaInZahl");
        aus += "?";
        continue;
      }
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

    // Alles andere: Buchstaben, Grad-1-Zeichen und Zeichen, die Plus in
    // Englisch noch nicht baut - nicht raten.
    beendeZahl();
    const buchstabe = z === "⠰" || /[⠁-⠵]/.test(z);
    merke(i, buchstabe ? "buchstabeNichtGebaut" : "unbekanntesZeichen");
    vorToken();
    aus += "?";
  }

  if (klammern > 0) merke(zellen.length, "klammerOffen");
  return { text: aus.trimEnd(), hinweise };
}

/** Die Kurzform, wenn nur der Text gebraucht wird. */
export function uebZuText(eingabe: string): string {
  return leseUeb(eingabe).text;
}

/* ------------------------------------------------------------------ */
/* Der Weg zurück: Rechenzeile -> UEB                                    */
/* ------------------------------------------------------------------ */

type Teil =
  | { art: "zahl"; zellen: string }
  | { art: "op"; zellen: string }
  | { art: "auf" | "zu"; zellen: string }
  | { art: "prozent"; zellen: string };

/**
 * Eine Rechenzeile in UEB schreiben - oder `null`.
 *
 * ★ `null` heißt: diese Zeile kann der Schreiber nicht - Wörter, Buchstaben,
 * Einheiten, Hochzahlen, Wurzeln, Vorzeichen, Platzhalter `[]` (siehe Kopf).
 * Der Generator für Englisch lässt solche Aufgaben weg; das wird gemessen,
 * nicht überspielt (`tests/plus-en.test.tsx`).
 *
 * Leerzeichen: zwischen Zahl und Rechenzeichen steht eines, auf beiden Seiten
 * (GTM 1.1.2 S. 1). Innerhalb einer Klammer und vor `%` keines. Das Zahlzeichen
 * steht vor jeder Zahl, auch nach einem Leerzeichen (GTM 2.1 S. 8).
 */
export function schreibeUeb(zeile: string): string | null {
  const teile: Array<{ teil: Teil; leerzeichenDavor: boolean }> = [];
  let i = 0;
  let leerzeichen = false;
  let endetMitLeerzeichen = false;

  while (i < zeile.length) {
    const z = zeile[i];
    if (z === " ") { leerzeichen = true; endetMitLeerzeichen = true; i++; continue; }
    endetMitLeerzeichen = false;

    const vorher = teile.length ? teile[teile.length - 1].teil : null;
    const ohneVorzeichen = !vorher || vorher.art === "op" || vorher.art === "auf";

    // Der Platzhalter `[]` ist keine eckige Klammer: er hat keine Zelle (die Eingabe streicht ihn).
    if (zeile.startsWith("[]", i)) return null;

    const zahl = /^(\d+)(?:\.(\d+))?/.exec(zeile.slice(i));
    if (zahl) {
      const rest = zeile.slice(i + zahl[0].length);
      const ganz = !zahl[2];
      const bruch = ganz ? /^\/(\d+)(?![\d./])/.exec(rest) : null;
      const gemischt = ganz && !bruch ? /^ (\d+)\/(\d+)(?![\d./])/.exec(rest) : null;
      const ziffern = (n: string) => [...n].map((c) => ZIFFER_ZELLE[c]).join("");
      let zellen: string;
      if (gemischt) {
        // GTM 6.2 S. 31: zwei Zahlen ohne Leerzeichen, jede mit Zahlzeichen.
        zellen = ZAHLZEICHEN + ziffern(zahl[1]) + ZAHLZEICHEN + ziffern(gemischt[1]) + BRUCHSTRICH + ziffern(gemischt[2]);
        i += zahl[0].length + gemischt[0].length;
      } else if (bruch) {
        // GTM 6.1 S. 31: Zähler mit Zahlzeichen, Nenner in normalen Ziffern.
        zellen = ZAHLZEICHEN + ziffern(zahl[1]) + BRUCHSTRICH + ziffern(bruch[1]);
        i += zahl[0].length + bruch[0].length;
      } else {
        zellen = ZAHLZEICHEN + ziffern(zahl[1]) + (zahl[2] ? DEZIMALPUNKT + ziffern(zahl[2]) : "");
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
      // Ein Zeichen ohne Leerzeichen davor, am Anfang oder hinter einem Zeichen, ist ein
      // Vorzeichen. Mit Leerzeichen davor ist es ein Rechenzeichen, dem die linke Zahl
      // fehlt (die Lücke `[] -3` ohne ihre Klammern).
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
    if (leer && !aus.endsWith("⠀")) aus += "⠀";
    aus += teil.zellen;
    vor = teil;
  }
  // Ein Leerzeichen am Ende bleibt hinter einem Term stehen (das Kind tippt es
  // vor dem nächsten Zeichen) - nach einem Rechenzeichen ist es überflüssig.
  if (endetMitLeerzeichen && vor && vor.art !== "op" && vor.art !== "auf") aus += "⠀";
  return aus;
}

/* ------------------------------------------------------------------ */
/* Die Zeichentabelle zum Prüfen gegen die Norm                         */
/* ------------------------------------------------------------------ */

export interface UebZeichen {
  konstrukt: string;
  zellen: string;
  /** Dokument + gedruckte Seite. */
  quelle: string;
  /** Eine Plus-Zeile, die genau dieses Zeichen schreibt (für den Wächter). */
  zeile?: string;
}

const GTM = "GTM 2014";
export const UEB_ZEICHEN: readonly UebZeichen[] = [
  { konstrukt: "Zahlzeichen", zellen: "⠼", quelle: `${GTM} 1.2.2 S. 2; Rules 6.1 S. 65-66`, zeile: "1" },
  { konstrukt: "Dezimalpunkt", zellen: "⠲", quelle: `${GTM} 2.2 S. 9`, zeile: "8.93" },
  { konstrukt: "Plus", zellen: "⠐⠖", quelle: `${GTM} 3 S. 15`, zeile: "1 +1" },
  { konstrukt: "Minus", zellen: "⠐⠤", quelle: `${GTM} 3 S. 15`, zeile: "1 -1" },
  { konstrukt: "Mal Kreuz (×)", zellen: "⠐⠦", quelle: `${GTM} 3 S. 15`, zeile: "1 *1" },
  { konstrukt: "Mal Punkt (·), nur gelesen", zellen: "⠐⠲", quelle: `${GTM} 3 S. 15` },
  { konstrukt: "Geteilt (÷)", zellen: "⠐⠌", quelle: `${GTM} 3 S. 15`, zeile: "1 /1" },
  { konstrukt: "Gleich", zellen: "⠐⠶", quelle: `${GTM} 3 S. 15`, zeile: "1 =1" },
  { konstrukt: "kleiner", zellen: "⠈⠣", quelle: `${GTM} 3 S. 15`, zeile: "1 <1" },
  { konstrukt: "größer", zellen: "⠈⠜", quelle: `${GTM} 3 S. 15`, zeile: "1 >1" },
  { konstrukt: "kleiner gleich", zellen: "⠸⠈⠣", quelle: `${GTM} 3 S. 15`, zeile: "1 <=1" },
  { konstrukt: "größer gleich", zellen: "⠸⠈⠜", quelle: `${GTM} 3 S. 15`, zeile: "1 >=1" },
  { konstrukt: "ungleich", zellen: "⠐⠶⠈⠱", quelle: `${GTM} 3 S. 15`, zeile: "1 !=1" },
  { konstrukt: "Bruch, einfach (Nenner normal)", zellen: "⠼⠑⠌⠓", quelle: `${GTM} 6.1 S. 31`, zeile: "5/8" },
  { konstrukt: "gemischte Zahl", zellen: "⠼⠃⠼⠁⠌⠃", quelle: `${GTM} 6.2 S. 31`, zeile: "2 1/2" },
  { konstrukt: "Klammer rund auf", zellen: "⠐⠣", quelle: `${GTM} 5 S. 30`, zeile: "(1)" },
  { konstrukt: "Klammer rund zu", zellen: "⠐⠜", quelle: `${GTM} 5 S. 30`, zeile: "(1)" },
  { konstrukt: "Klammer eckig auf", zellen: "⠨⠣", quelle: `${GTM} 5 S. 30`, zeile: "[1]" },
  { konstrukt: "Klammer eckig zu", zellen: "⠨⠜", quelle: `${GTM} 5 S. 30`, zeile: "[1]" },
  { konstrukt: "Klammer geschweift auf", zellen: "⠸⠣", quelle: `${GTM} 5 S. 30`, zeile: "{1}" },
  { konstrukt: "Klammer geschweift zu", zellen: "⠸⠜", quelle: `${GTM} 5 S. 30`, zeile: "{1}" },
  { konstrukt: "Prozent", zellen: "⠨⠴", quelle: `${GTM} 2.10 S. 12, Beispiel S. 14`, zeile: "15 %" },
];
