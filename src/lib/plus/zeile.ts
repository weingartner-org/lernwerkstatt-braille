/**
 * Die Rechnung steht im Eingabefeld - und die Antwort wird aus ihr gelesen.
 *
 * ★★★ Johannes, 25.09.2026: „Rechnungen, bei denen etwas auszufüllen ist,
 * sollen gleich in der Eingabezeile stehen, und der Cursor soll im
 * Eingabefeld stehen, z. B. `6 +[] =10`." Und: „Auch wenn schriftlich
 * gerechnet werden muss, wie `3456 /34 =`, muss die Rechnung bereits im
 * Eingabefeld stehen; zudem muss es mit der Eingabetaste mehrzeilig werden."
 *
 * ★ Warum das mehr ist als Bequemlichkeit: So schreibt ein Kind mit
 * Braillezeile in den adaptierten Büchern. Die Zeile steht da, die
 * Schreibmarke sitzt in der Lücke, und die Hand bleibt an der Stelle, an der
 * gerechnet wird. Vorher stand die Rechnung über dem Feld, und das Kind musste
 * zwischen zwei Stellen hin- und herlesen.
 *
 * ★★ Die Antwort ist, was das Kind IN DIE LÜCKE oder HINTER DAS `=` schreibt.
 * Die Zeile selbst ist Angabe, nicht Antwort. Wer sie abschreibt, hat nichts
 * gerechnet - und wer sie löscht und nur die Zahl hinschreibt, hat trotzdem
 * gerechnet.
 */
import type { Aufgabe } from "./aufgabe";

/** Die Lücke, wie sie in den adaptierten Büchern steht (dieselbe wie `LUECKE`). */
const LUECKE = "[]";

export interface Eingabezeile {
  /** Was im Feld steht, bevor das Kind etwas tut: `6 +[] =10`. */
  vorlage: string;
  /** Die Zeilen darüber - sie bleiben als Angabe über dem Feld stehen. */
  davor: string[];
  /**
   * Wo die Schreibmarke hinkommt: zwischen die Klammern der ersten Lücke,
   * sonst ans Ende der Zeile.
   */
  marke: number;
  /**
   * Schriftlich rechnen: die Eingabetaste macht eine neue Zeile, geprüft wird
   * mit Alt + P. Sonst prüft die Eingabetaste, wie bisher.
   */
  mehrzeilig: boolean;
}

/**
 * ★ Textbeispiele: hier bleibt die Angabe über dem Feld stehen. Sie ist zum
 * Lesen da (Geschichten, Fragen zu Zeilen, Bilder in Zeilen), nicht zum
 * Weiterschreiben. Alles andere kommt ganz ins Feld (Johannes, 12.10.2026:
 * „alle Angaben sollen - außer bei Textbeispielen - in die Eingabezeile").
 */
const TEXTARTEN: ReadonlySet<string> = new Set([
  "sach", "fermi", "lesen", "stimmt_das", "wege", "fehler_finden", "stoerenfried",
  "strategiewahl", "erfinden", "knobel", "zahlenhaus", "malkreuz", "mauer",
]);

/**
 * Welche Zeile gehört ins Feld? `null`, wenn keine - dann bleibt alles wie
 * bisher: die Angabe steht darüber, das Feld ist leer.
 *
 * ★ Ins Feld kommt die LETZTE Zeile der Angabe, wenn sie eine Lücke trägt oder
 * auf `=` endet. Das ist die Rechnung, an der gerechnet wird; die Zeilen
 * darüber sind Beispiel oder Muster (`8 +8 =16` über `8 +9 =`).
 *
 * ⚠️ Nicht, wenn auch eine FRÜHERE Zeile eine Lücke hat. Das ist die
 * Zahlenmauer (`[]` oben, `5 | []` darunter) - sie ist ein Bild in Zeilen, und
 * ihre Lücken lassen sich nicht in EINE Zeile schreiben.
 */
export function eingabezeile(a: Aufgabe): Eingabezeile | null {
  const zeilen = a.angabe.split("\n");
  const letzte = zeilen[zeilen.length - 1];
  const davor = zeilen.slice(0, -1);
  if (davor.some((z) => z.includes(LUECKE))) return null;
  const hatLuecke = letzte.includes(LUECKE);
  if (!hatLuecke && !/=\s*$/.test(letzte)) {
    // ★ Eine Frage oder Anweisung („Welche Zahl kommt nach 11?", „Runde 461 auf
    // Hunderter.", „670 +315 = / Zwischen welchen Hundertern?"): die ganze
    // Angabe steht in EINER Zeile im Feld, die Antwort kommt dahinter.
    // Zwei Zeilen nur, wenn die erste eine Rechnung ist (`670 +315 =`) - sonst
    // ist es ein Text.
    if (TEXTARTEN.has(a.art) || zeilen.length > 2 || a.angabe.includes(LUECKE)) return null;
    if (zeilen.length === 2 && !/=\s*$/.test(zeilen[0])) return null;
    const alles = zeilen.map((z) => z.trim()).filter(Boolean).join(" ");
    if (!alles) return null;
    // ★ Die Klammern stehen immer da; geprüft wird, was darin steht (Johannes, 13.10.2026).
    return { vorlage: `${alles} ${LUECKE}`, davor: [], marke: alles.length + 2, mehrzeilig: false };
  }
  // ★ Johannes, 13.10.2026: „es sollen immer diese [] als Eingabefelder stehen,
  // und dieser Inhalt in den Klammern wird geprüft." Auch hinter dem `=`.
  const vorlage = hatLuecke ? letzte : letzte.trimEnd() + LUECKE;
  return {
    vorlage,
    davor,
    marke: vorlage.indexOf(LUECKE) + 1,
    mehrzeilig: a.art === "zeilen" && !!a.weg?.length,
  };
}

/**
 * ★ Mit Braillezeile (Johannes, 19.10.2026): „jede Rechnung, auch Textbeispiele,
 * muss in dem Eingabefeld sein." Wo `eingabezeile` nichts hergibt (Textarten,
 * Zahlenmauer, mehr als zwei Zeilen), wird die ganze Angabe in EINE Zeile
 * gelegt und die Lücke dahinter gesetzt - die Schreibmarke kommt in die erste
 * Lücke. Zeilen werden mit Leerzeichen verbunden; den Umbruch auf 40 Zeichen
 * setzt `umbruch.ts`.
 */
export function eingabezeileBraille(a: Aufgabe): Eingabezeile | null {
  const z = eingabezeile(a);
  if (z) {
    // ★ Niko Adam, 10.11.2026 (Meldung blufboplwevfzd5): Mit Braillezeile sprang der
    // Cursor ins Feld, und die Musterzeilen und Fragen DARÜBER (`8 +5 =13`,
    // „Tintenklecks: Welche Ziffer fehlt?") waren auf der Zeile nicht zu lesen.
    // Johannes, 11.11.2026: „wenn es irgendwie möglich ist soll die Aufgabe im
    // Eingabefeld stehen." Darum kommen sie ins Feld, Zeile für Zeile durch
    // ` / ` getrennt (wie `kurzform`). Nicht beim schriftlichen Rechnen: dort
    // macht die Eingabetaste eine neue Zeile, und die Zeilen darüber sind Teil
    // des Wegs. Gerechnet wird weiter mit der letzten Zeile (nach dem letzten `=`).
    if (z.davor.length > 0 && !z.mehrzeilig) {
      const vorn = z.davor.map((x) => x.trim()).filter(Boolean).join(" / ") + " / ";
      return { vorlage: vorn + z.vorlage, davor: [], marke: vorn.length + z.marke, mehrzeilig: false };
    }
    return z;
  }
  const alles = a.angabe.split("\n").map((x) => x.trim()).filter(Boolean).join(" ");
  if (!alles) return null;
  const vorlage = alles.includes(LUECKE) ? alles : `${alles} ${LUECKE}`;
  return { vorlage, davor: [], marke: vorlage.indexOf(LUECKE) + 1, mehrzeilig: false };
}

export type Zeilenstand =
  /** Es steht eine Antwort da - sie wird geprüft. */
  | "antwort"
  /** Noch nichts geschrieben: die Zeile ist, wie sie kam. */
  | "leer"
  /** Eine Lücke ist gefüllt, eine andere noch nicht. */
  | "teilweise"
  /** Vorne an der Rechnung hat sich etwas verändert. */
  | "veraendert";

/** Ein Stück Angabe in einen Suchausdruck - Leerzeichen dürfen fehlen oder mehr sein. */
function muster(stueck: string): string {
  return stueck
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((t) => [...t].map((z) => z.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&")).join("\\s*"))
    .join("\\s*");
}

/**
 * ★★★★ WAS NACH DEM LETZTEN `=` STEHT, IST DIE ANTWORT.
 *
 * Übernommen aus dem eine andere App der Plattform  (`nachDemLetztenGleich`, 11.09.2026), wo
 * Johannes es so gesagt hat: „Manchmal schreiben die Schüler ihre Rechnung in
 * das Eingabefeld und das richtige Ergebnis, und es wird als falsch gewertet.
 * … versuch besser zu erkennen, auch wenn du die Rechnung nicht verstehst,
 * was nach dem = steht."
 *
 * In Plus heißt das: `14 *12 +48 *12 =62 *12 =744` - gezählt wird die 744.
 *
 * ⚠️ Die Riegel aus dem eine andere App der Plattform  gelten auch hier:
 * - Trägt die LÖSUNG selbst ein `=` oder ein Vergleichszeichen, gehört es zur
 *   Antwort (`=` als Antwort auf `4 []5 =9`), und nichts wird abgeschnitten.
 * - Ist die Lösung ein WORT, darf ein Kind einen Satz schreiben, und ein `=`
 *   darin ist bedeutungslos.
 * - `<=`, `>=`, `==` sind keine Rechenenden.
 */
export function nachDemLetztenGleich(text: string, loesung: string): string {
  if (/[=<>]/.test(loesung)) return text;
  if (!/\d/.test(loesung) && !/[*/^()]/.test(loesung)) return text;
  let letztes = -1;
  for (let i = 0; i < text.length; i++) {
    if (text[i] !== "=") continue;
    if (i > 0 && "<>!=".includes(text[i - 1])) continue;
    if (text[i + 1] === "=") continue;
    letztes = i;
  }
  return letztes < 0 ? text : text.slice(letztes + 1).trim();
}

/** Klammern um den Inhalt einer Lücke fallen weg: `[4]` und `[[4]]` sind 4. */
function ausDerLuecke(inhalt: string): string {
  return inhalt.trim().replace(/^\[+\s*/, "").replace(/\s*\]+$/, "").trim();
}

/** Eine einzelne Zeile gegen die Vorlage lesen. */
function lies(zeile: string, vorlage: string, loesung: string): { stand: Zeilenstand; antwort: string } {
  const text = zeile.trim();
  if (!text) return { stand: "leer", antwort: "" };

  const stuecke = vorlage.split(LUECKE);
  if (stuecke.length > 1) {
    // ★ Die Klammern der Lücke dürfen bleiben, fehlen oder doppelt stehen.
    // Wer `6 +4 =10` schreibt, hat die Lücke genauso gefüllt wie `6 +[4] =10`.
    const ausdruck = new RegExp(
      "^\\s*" + stuecke.map(muster).join("\\s*(\\[*[^\\]]*?\\]*)\\s*") + "\\s*$",
    );
    const treffer = ausdruck.exec(text);
    if (treffer) {
      const inhalte = treffer.slice(1).map(ausDerLuecke);
      // Steht ein ganzer Rechenweg in der Lücke, zählt, was nach dem letzten `=` kommt.
      if (inhalte.length === 1 && inhalte[0]) inhalte[0] = nachDemLetztenGleich(inhalte[0], loesung) || inhalte[0];
      if (inhalte.every((x) => !x)) return { stand: "leer", antwort: "" };
      if (inhalte.some((x) => !x)) return { stand: "teilweise", antwort: "" };
      return { stand: "antwort", antwort: inhalte.join(" und ") };
    }
  } else {
    const ausdruck = new RegExp("^\\s*" + muster(vorlage) + "(.*)$", "s");
    const treffer = ausdruck.exec(text);
    if (treffer) {
      const rest = nachDemLetztenGleich(treffer[1].trim(), loesung);
      return rest ? { stand: "antwort", antwort: rest } : { stand: "leer", antwort: "" };
    }
  }

  // ★ Die Zeile passt nicht zur Vorlage. Hat das Kind sie gelöscht und nur die
  // Antwort hingeschrieben, gilt die Antwort - so wie bisher, als das Feld
  // leer begann. Steht aber noch ein `=` oder eine Klammer da, hat sich vorne
  // an der Rechnung etwas verändert, und darüber wird nicht geurteilt.
  // ★ Ein führendes `=` ist Gewohnheit, keine veränderte Rechnung: `=7`.
  const nachGleich = /^=\s*([^=[\]]+)$/.exec(text);
  if (nachGleich) return { stand: "antwort", antwort: nachGleich[1].trim() };
  if (/[=[\]]/.test(text) && !/[=<>]/.test(loesung)) return { stand: "veraendert", antwort: "" };
  return { stand: "antwort", antwort: text };
}

/**
 * Die Antwort aus dem, was im Feld steht.
 *
 * ★ Beim schriftlichen Rechnen stehen mehrere Zeilen da. Gezählt wird, was
 * hinter dem `=` der ERSTEN Zeile steht - dort steht die Rechnung, und dort
 * schreibt das Buch das Ergebnis hin (`474 /3 =158`). Steht dort nichts, zählt
 * die LETZTE Zeile: So schließt Stanetty den Rechenweg ab
 * (`34789 /56 =621 (13 Rest)`, S. 51).
 *
 * ⚠️ Die Zeilen dazwischen sind Rechenweg und werden nie gewertet. Eine
 * Nebenrechnung wie `nr: 69 -56 =13` ist kein Ergebnis.
 */
export function antwortAus(
  eingabe: string,
  a: Aufgabe,
  zeile: Eingabezeile | null | undefined = undefined,
): { stand: Zeilenstand; antwort: string } {
  const z = zeile === undefined ? eingabezeile(a) : zeile;
  if (!z) {
    const text = eingabe.trim();
    if (!text) return { stand: "leer", antwort: "" };
    return { stand: "antwort", antwort: nachDemLetztenGleich(text, a.loesung) || text };
  }
  if (!z.mehrzeilig) return lies(eingabe.replace(/\n+/g, " "), z.vorlage, a.loesung);

  const zeilen = eingabe.split("\n").map((x) => x.trim()).filter(Boolean);
  if (!zeilen.length) return { stand: "leer", antwort: "" };
  const erste = lies(zeilen[0], z.vorlage, a.loesung);
  if (erste.stand === "antwort" || zeilen.length === 1) return erste;
  // Die erste Zeile ist leer geblieben - das Ergebnis steht am Ende.
  const letzte = lies(zeilen[zeilen.length - 1], z.vorlage, a.loesung);
  if (letzte.stand === "antwort" && letzte.antwort !== zeilen[zeilen.length - 1]) return letzte;
  const hinten = nachDemLetztenGleich(zeilen[zeilen.length - 1], a.loesung);
  return hinten ? { stand: "antwort", antwort: hinten } : { stand: "leer", antwort: "" };
}
