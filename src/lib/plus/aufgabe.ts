/**
 * Plus - Grundtypen, Schreibweise und Vergleich.
 *
 * Die Schreibweise ist nicht erfunden: sie stammt aus den für Kinder mit
 * Blindheit adaptierten Schulbüchern (BookAccess Linz, „Alles klar! 4") und
 * aus „Mathematik in linearer Darstellung" (E. Stanetty, BBI 2010). Beide
 * schreiben gleich - Leerzeichen VOR dem Rechenzeichen, keines nach dem
 * Gleichheitszeichen:
 *
 *     48 +27 =75
 *     700 +[] =1000
 *     474 /3 =158
 *
 * Volle Begründung: „Plus - Didaktisch-methodische Struktur", Abschnitt 3.
 *
 * ★ Zwei Festlegungen, die leicht zu übersehen sind:
 * - Minus ist der gewöhnliche Bindestrich U+002D, nie das typografische
 *   Minuszeichen U+2212. NVDA meldet nur den Bindestrich.
 * - Zahlen tragen KEINE Tausendertrennung. Auf der Braillezeile ist ein
 *   Leerzeichen mitten in der Zahl eine Stolperstelle, und das Kind müsste
 *   es beim Antworten mittippen.
 */
import { pruefeWort } from "@/lib/arbeitsblatt/schreibhilfe";
import {
  antwortNachRechnung, aufzaehlungStimmt, aufzaehlungUrteil, einheitenImText, einheitSchluessel, istAufzaehlung, istWortloesung,
  klammerUmZahlWeg, restForm, verlangtOrdnung, wahrheitswert, wortGeputzt, zahlUndEinheit,
  zeichenGlaetten, ZEICHEN_IN_WORTEN,
} from "./antwortformen";
import { dezimalzeichen, plusSprache } from "./aktuelleSprache";
import { gleicherTerm } from "./term";
import { antwortAus, type Eingabezeile } from "./zeile";

export type Operation =
  | "plus" | "minus" | "mal" | "geteilt" | "gemischt"
  | "zahlen" | "bruch" | "prozent" | "potenz" | "wurzel" | "term";

export type Aufgabenart =
  | "ergebnis" | "luecke_zahl" | "luecke_zeichen" | "kette" | "mauer"
  | "folge" | "ueberschlag" | "probe" | "fehler_finden" | "strategiewahl"
  | "sach" | "fermi" | "wahr_falsch" | "menge" | "umwandeln" | "zeilen"
  // ★ Aus den neuen Schulbüchern (Befund 25.09.2026, gebaut 26.09.) - jede
  // steht dort mit Buch und Zeile. Die Formen liegen in `generator/buchformen/`.
  | "dreieck" | "zahlenhaus" | "zahlenkette" | "malkreuz" | "stoerenfried"
  | "klecks" | "ziffernkarten" | "erfinden" | "wege" | "lesen" | "stimmt_das"
  // Das Rätsel nach jeder dritten Runde - nie in einem Paket.
  | "knobel";

/** Das Rechenzeichen, wie es auf der Zeile steht. */
export const ZEICHEN: Record<string, string> = {
  plus: "+",
  minus: "-",
  mal: "*",
  geteilt: "/",
};

/** Eine fertige Aufgabe, so wie sie das Kind bekommt. */
export interface Aufgabe {
  /** Paket aus dem Stoffplan, z. B. "1-03". */
  paket: string;
  art: Aufgabenart;
  op: Operation;
  /** Was auf der Zeile steht, z. B. "48 +27 =". */
  angabe: string;
  /** Die richtige Antwort, in derselben Schreibweise. */
  loesung: string;
  /** Weitere Schreibweisen, die auch gelten (z. B. "0,5" neben "0,50"). */
  auchRichtig?: string[];
  /**
   * ★★★ Die SCHREIBWEISE ist hier der Lerngegenstand, nicht der Wert.
   *
   * `12/30 =` mit der Lösung `2/5` heißt „kürze". Ein Kind, das `4/10`
   * schreibt, hat denselben Wert hingeschrieben und die Aufgabe nicht
   * gelöst - und `12/30` selbst wäre die Angabe zurückgeschrieben. Überall
   * sonst zählt der Wert: `14/11` ist `1 3/11`.
   */
  formZaehlt?: true;
  /** Die beteiligten Zahlen - die Fehlererkennung rechnet damit nach. */
  zahlen: number[];
  /** Nur bei Division mit Rest. */
  rest?: number;
  /**
   * Nur bei Fermi-Aufgaben: der Bereich, in dem eine Schätzung gut ist.
   * ★ Hier wird keine Zeichenkette verglichen - eine Fermi-Aufgabe, die auf
   * 10 Prozent genau sein will, hat ihren Sinn verfehlt.
   */
  bereich?: [number, number];
  /**
   * Der Rechenweg in Zeilen, Schritt für Schritt - abrufbar, nie automatisch.
   * ★ „Plus baut diesen Sprechweg als abrufbare Hilfe ein - Schritt für
   * Schritt, auf Tastendruck, nie automatisch."
   */
  weg?: { satz: string; zeile: string; merke: number }[];
  /**
   * ★★ Eine OFFENE Aufgabe: mehr als eine Antwort ist richtig
   * („Finde eine Plusaufgabe mit dem Ergebnis 12. Beide Zahlen ungerade.").
   * Dann entscheidet diese Prüfung, nicht der Vergleich mit `loesung` -
   * `loesung` ist nur EIN Beispiel, das gezeigt wird, wenn das Kind nicht
   * weiterkommt. Bekommt die Antwort so, wie sie aus dem Feld gelesen wurde
   * (`5 und 7`).
   */
  passt?: (antwort: string) => boolean;
  /** Nur beim Rätsel: der Name der Rätselart, als Überschrift („Zahlen-Detektiv"). */
  titel?: string;
  /**
   * Nur beim Rätsel: ein Tipp auf Knopfdruck - nie von selbst. Kurz, ein Satz.
   */
  tipp?: string;
  /**
   * Nur beim Rätsel: der Lösungsweg in einem oder zwei Sätzen - gezeigt, wenn
   * das Kind gelöst oder aufgegeben hat. Ein Rätsel ohne Auflösung lässt das
   * Kind mit der Frage allein.
   */
  erklaerung?: string;
}

/* ------------------------------------------------------------------ */
/* Zahlen schreiben                                                     */
/* ------------------------------------------------------------------ */

/**
 * Eine Zahl so schreiben, wie sie auf der Zeile steht: Komma statt Punkt,
 * keine Tausendertrennung, keine unnötigen Nullen am Ende.
 */
export function zahl(n: number, nachkomma?: number): string {
  if (Number.isInteger(n) && nachkomma === undefined) return String(n);
  const feste = nachkomma ?? 10;
  let s = n.toFixed(feste);
  if (nachkomma === undefined) s = s.replace(/0+$/, "").replace(/\.$/, "");
  // ★ Das Dezimalzeichen gehört dem Mathe-Code der Sprache (`braille/matheCode.ts`):
  // de Komma, en Punkt. Ohne Probe-Schalter ist die Sprache immer `de`.
  return s.replace(".", dezimalzeichen());
}

/** Eine Rechnung in der Schreibweise der Bücher: `48 +27 =`. */
export function rechnung(a: number | string, op: Operation, b: number | string): string {
  const z = ZEICHEN[op];
  if (!z) throw new Error(`Kein Rechenzeichen für "${op}"`);
  const links = typeof a === "number" ? zahl(a) : a;
  const rechts = typeof b === "number" ? zahl(b) : b;
  return `${links} ${z}${rechts} =`;
}

/** Dieselbe Rechnung mit eingesetztem Ergebnis: `48 +27 =75`. */
export function rechnungMit(a: number | string, op: Operation, b: number | string, erg: number | string): string {
  return rechnung(a, op, b) + (typeof erg === "number" ? zahl(erg) : erg);
}

/** Die Lücke, wie sie in den adaptierten Büchern steht. */
export const LUECKE = "[]";

/* ------------------------------------------------------------------ */
/* Antworten vergleichen                                                */
/* ------------------------------------------------------------------ */

/**
 * Eingabe des Kindes auf eine Vergleichsform bringen: Leerzeichen weg,
 * Punkt als Komma, angehängte Nullen weg, führende Nullen weg.
 *
 * Absichtlich großzügig. Ein Kind, das „0.5" statt „0,5" tippt, hat richtig
 * gerechnet - und ein Kind an einer Braillezeile tippt Zahlen oft mit dem
 * Ziffernblock, der einen Punkt liefert.
 */
export function normal(eingabe: string): string {
  // ★ `(-5)` ist `-5`, und `–` vom Mac ist Minus - siehe `antwortformen.ts`.
  let s = klammerUmZahlWeg(zeichenGlaetten(eingabe)).trim().replace(/\s+/g, "").replace(/\./g, ",");
  // ★ Verhältnis und Division sind dasselbe Zeichen, sobald Braille im Spiel
  // ist: die Mathematikschrift kennt für „geteilt durch" nur `⠒` (Kap. 5,
  // Z. 2512). Ein Kind, das `3 : 7` greift, kann nur `3 /7` zurückbekommen -
  // und hätte trotzdem recht.
  s = s.replace(/:/g, "/");
  if (s.startsWith("+")) s = s.slice(1);
  // Nachkommanullen und führende Nullen kürzen, Vorzeichen behalten
  const m = /^(-?)(\d*)(?:,(\d*))?$/.exec(s);
  if (!m) return s;
  const [, vz, ganz, nach = ""] = m;
  const g = ganz.replace(/^0+(?=\d)/, "") || "0";
  const n = nach.replace(/0+$/, "");
  return vz + g + (n ? "," + n : "");
}

/**
 * Der Zahlenwert einer Antwort - ganze Zahl, Kommazahl, Bruch, gemischte Zahl.
 * `null`, wenn dort nicht GENAU eine Zahl steht.
 *
 * ★★★ EIN BRUCH IST EIN WERT, KEINE ZWEI ZAHLEN - der teuerste Fund des
 * eine andere App der Plattform  (26.08.2026, dort in `antwort.ts`): `3/8 +2/8 =5/8` galt als
 * falsch, weil die letzte Zahl der Nenner `8` war. Das traf die ganze
 * Bruchrechnung.
 *
 * ★★ `-2 1/2` ist -2,5, nicht -1,5: das Vorzeichen gehört vor die GANZE Zahl.
 *
 * ⚠️ Das Leerzeichen in `1 3/11` ist bedeutungstragend und darf nicht
 * weggeputzt werden - sonst wird daraus `13/11`.
 */
export function wert(text: string): number | null {
  const s = klammerUmZahlWeg(zeichenGlaetten(String(text))).trim().replace(/\s+/g, " ").replace(/\./g, ",");
  const gemischt = /^(-?)(\d+) (\d+)\/(\d+)$/.exec(s);
  if (gemischt) {
    const unten = Number(gemischt[4]);
    if (unten === 0) return null;
    const betrag = Number(gemischt[2]) + Number(gemischt[3]) / unten;
    return gemischt[1] === "-" ? -betrag : betrag;
  }
  const bruch = /^(-?\d+) ?\/ ?(\d+)$/.exec(s);
  if (bruch) {
    const unten = Number(bruch[2]);
    // ⚠️ Nenner 0 ist keine Zahl. `Infinity` wäre schlimmer als „keine
    // Antwort": zwei Unendlichkeiten verglichen sich als gleich.
    if (unten === 0) return null;
    return Number(bruch[1]) / unten;
  }
  return /^-?\d+(,\d+)?$/.test(s) ? Number(s.replace(",", ".")) : null;
}

/**
 * ★★★ Steht dieser Bruch schon in der Angabe?
 *
 * ⚠️ GEMESSEN am 23.09.2026, nachdem der Wertvergleich eingebaut war: `4/9 /6/9 =`
 * hat die Lösung `2/3` - und `6/9`, der DIVISOR aus der Angabe, hat denselben
 * Wert. Ein Kind, das die Angabe zur Hälfte zurückschreibt, bekam „richtig".
 * 10 von 534 Rechenzeilen mit Brüchen waren so zu knacken.
 *
 * ★ Die wörtliche Prüfung steht weiter oben und bleibt unberührt: Wo die
 * Lösung selbst in der Angabe vorkommt („Was ist größer: 1/2 oder 2/2?"),
 * greift sie schon, bevor der Wert überhaupt gefragt wird.
 */
function stehtSchonDa(eingabe: string, zeile: string): boolean {
  return (zeile.match(/-?\d+ ?\/ ?\d+|-?\d+(,\d+)?/g) ?? []).some((t) => normal(t) === eingabe);
}

/** Steht dort ein Bruch oder eine gemischte Zahl? */
function istBruchform(text: string): boolean {
  return /^-?\d+( \d+)?\/\d+$/.test(String(text).trim());
}

/**
 * Wie eine Antwort steht - und es sind mehr Stände als zwei.
 *
 * ★★★ Aus dem eine andere App der Plattform  übernommen (`Teilstand`, 25.08. und 04.09.2026).
 * Johannes dort: „Ich brauch eine App, die so pädagogisch ist, dass sie so was
 * erkennt: Also Differenz stimmt, aber du hast es falsch geschrieben." Und:
 * „du sagst richtig gerechnet, aber es war eine andere Einheit verlangt."
 *
 * - `richtig` · `falsch` - wie bisher.
 * - `leer` - es steht noch nichts da, oder die Zeile ist, wie sie kam. Kein
 *   Versuch, kein „Noch nicht".
 * - `teilweise` - eine Lücke ist gefüllt, eine andere noch nicht.
 * - `veraendert` - vorne an der Rechnung hat sich etwas verschoben. Darüber
 *   wird nicht geurteilt; es ist kein Rechenfehler.
 * - `schreibfehler` - das Wort ist gemeint, nur anders geschrieben („nien").
 * - `einheit` - die Zahl stimmt, die Einheit nicht (`12 kg` statt `12 l`).
 * - `rest` - der Quotient stimmt, der Rest fehlt.
 *
 * ⚠️ Die drei letzten sind bewusst KEIN `richtig`. Die Antwort ist noch nicht
 * fertig - aber das Kind hört zuerst, was stimmt
 * ([[feedback_nie_gegen_das_kind]]).
 */
export type Pruefstand =
  | "richtig" | "falsch" | "leer" | "teilweise" | "veraendert"
  | "schreibfehler" | "einheit" | "rest";

export interface Urteil {
  stand: Pruefstand;
  /** Was als Antwort gelesen wurde - ohne die Rechnung davor. */
  antwort: string;
  /** Nur bei `schreibfehler`: wie das Wort geschrieben wird. */
  schreibung?: string;
  /**
   * ★★★★ Was das Kind noch braucht (16.10.2026): bei `falsch` mit mehreren
   * Werten, welcher noch nicht stimmt („8 stimmt, 11 noch nicht"); bei
   * `einheit`, welche Einheit fehlt („Einheit fehlt: Euro").
   */
  hinweis?: string;
}

/**
 * ★★★★★ EINHEIT VERGESSEN IST NOCH NICHT RICHTIG (Johannes, 16.10.2026, im
 * eine andere App der Plattform  entschieden und für Plus übernommen: „Wenn Einheiten angegeben
 * werden sollen und das Ergebnis richtig ist, dann soll beim Prüfen stehen:
 * Einheit vergessen" - noch nicht richtig).
 *
 * ⚠️ Bis heute galt in Plus das Gegenteil: „Keine Einheit geschrieben: gilt."
 * Die Sachaufgaben trugen dafür die blosse Zahl in `auchRichtig`.
 *
 * Gilt nicht, wo die Angabe die Einheit schon hinter die Lücke oder das `=`
 * schreibt (`1/5 von 410 g =[] g`), und nicht beim Schätzen (Fermi).
 */
function fehlendeEinheit(antwort: string, a: Aufgabe): string | null {
  if (a.bereich) return null;
  const soll = zahlUndEinheit(a.loesung);
  if (!soll?.einheit) return null;
  const ist = zahlUndEinheit(antwort);
  if (!ist || ist.einheit) return null;
  if (normal(ist.zahl) !== normal(soll.zahl) && wert(ist.zahl) !== wert(soll.zahl)) return null;
  const dahinter = /(?:\[\]|=)\s*([^\s\d=[\]]+)/.exec(zeichenGlaetten(a.angabe));
  if (dahinter && einheitSchluessel(dahinter[1]) === soll.einheit) return null;
  return soll.roh || soll.einheit;
}

/** Alle Schreibweisen, die als Lösung gelten. */
function loesungen(a: Aufgabe): string[] {
  return [a.loesung, ...(a.auchRichtig ?? [])];
}

/**
 * Was steht im Feld, und wie steht es? Das Feld darf die ganze Rechnung tragen
 * (`6 +[4] =10`, `48 +27 =75`) oder nur die Antwort (`4`).
 */
export function pruefe(eingabe: string, a: Aufgabe, zeile?: Eingabezeile | null): Urteil {
  const gelesen = antwortAus(eingabe, a, zeile);
  // ★ Mehrere Werte mit Rechenweg (`9 -1 =8 und 9 +1 =10`) sieht die Zeile als
  // „verändert" an - bei einer Aufzählung ist es eine Antwort (16.10.2026).
  if (gelesen.stand === "veraendert" && istAufzaehlung(a.loesung)) {
    const u = aufzaehlungUrteil(eingabe, a.loesung, wert, a.angabe.includes(LUECKE) || verlangtOrdnung(a.angabe));
    if (u?.stimmt) return { stand: "richtig", antwort: eingabe.trim() };
    if (u?.hinweis) return { stand: "falsch", antwort: eingabe.trim(), hinweis: u.hinweis };
  }
  if (gelesen.stand !== "antwort") return { stand: gelesen.stand, antwort: "" };
  const antwort = gelesen.antwort;
  // ★ Die offene Aufgabe kennt nur ihre eigene Prüfung. Der Vergleich mit dem
  // Beispiel darunter würde „5 und 7" für falsch halten, weil „3 und 9" als
  // Beispiel dasteht.
  if (a.passt) return { stand: a.passt(antwort) ? "richtig" : "falsch", antwort };
  // ★ Fermi hat sein eigenes Urteil - der Zahlenvergleich darunter kennt nur
  // die Musterantwort, nicht den Bereich.
  if (a.bereich) return { stand: fermiPasst(antwort, a) ? "richtig" : "falsch", antwort };
  if (antwortStimmt(antwort, a)) {
    const fehlt = fehlendeEinheit(antwort, a);
    return fehlt ? { stand: "einheit", antwort, hinweis: `Einheit fehlt: ${fehlt}` } : { stand: "richtig", antwort };
  }
  // ★ Rechnung, Ergebnis, dann die Antwort ohne „=" (`antwortNachRechnung`, 15.10.2026).
  const nachRechnung = antwortNachRechnung(eingabe);
  if (nachRechnung !== null && antwortStimmt(nachRechnung, a)) {
    const fehlt = fehlendeEinheit(nachRechnung, a);
    return fehlt ? { stand: "einheit", antwort: nachRechnung, hinweis: `Einheit fehlt: ${fehlt}` } : { stand: "richtig", antwort: nachRechnung };
  }

  if (istWortloesung(a.loesung) && a.op !== "term") {
    const wort = pruefeWort(antwort, loesungen(a).filter(istWortloesung));
    if (wort.stand === "schreibfehler") return { stand: "schreibfehler", antwort, schreibung: wort.schreibung };
  }
  const ist = zahlUndEinheit(antwort);
  if (ist?.einheit && loesungen(a).some((l) => {
    const soll = zahlUndEinheit(l);
    return !!soll && normal(soll.zahl) === normal(ist.zahl);
  })) {
    return { stand: "einheit", antwort };
  }
  const mitRest = restForm(a.loesung);
  if (mitRest && mitRest.rest > 0 && normal(antwort) === String(mitRest.quotient)) {
    return { stand: "rest", antwort };
  }
  // ★ Mehrere Werte: welcher stimmt noch nicht? (16.10.2026)
  if (istAufzaehlung(a.loesung)) {
    const u = aufzaehlungUrteil(antwort, a.loesung, wert, a.angabe.includes(LUECKE) || verlangtOrdnung(a.angabe));
    if (u?.hinweis) return { stand: "falsch", antwort, hinweis: u.hinweis };
  }
  return { stand: "falsch", antwort };
}

/** Stimmt die Antwort? Die Kurzform von `pruefe` für alle, die nur Ja oder Nein brauchen. */
export function istRichtig(eingabe: string, a: Aufgabe): boolean {
  return pruefe(eingabe, a).stand === "richtig";
}

/**
 * Passt die Einheit, die das Kind geschrieben hat?
 *
 * ★★★★★ Johannes im eine andere App der Plattform , 04.09.2026: „25 cm sind ja nicht dasselbe wie
 * 25 m, somit müssen Zahl und Einheit in deinem Prüfungsschema vorhanden sein."
 * Gemessen am 25.09.2026 in Plus: `12 kg` war eine richtige Antwort auf
 * „Wie viel bleibt?" mit der Lösung `12 l` - die Einheit wurde weggeputzt, egal
 * welche es war.
 *
 * - Keine Einheit geschrieben: gilt. Wer `40` statt `40 %` schreibt, hat
 *   gerechnet; das Zeichen nachzutragen ist eine andere Übung.
 * - Ein Wort, das keine Einheit ist (`20 Kinder`): gilt.
 * - Dieselbe Einheit, auch anders geschrieben (`EUR`, `Euro`, `€`): gilt.
 * - Trägt die Lösung keine Einheit, gilt die, die die Angabe nennt
 *   (`1/5 von 410 g =[] g`).
 */
function einheitPasst(
  ist: { einheit: string | null; roh: string },
  soll: { einheit: string | null },
  a: Aufgabe,
): boolean {
  if (!ist.einheit) return true;
  if (soll.einheit) return ist.einheit === soll.einheit;
  // ★★★★ Die blosse Zahl in `auchRichtig` erbt die Einheit der Lösung (15.10.2026):
  // `22724 m` ist keine Fläche, auch wenn „m" in der Angabe steht.
  const haupt = zahlUndEinheit(a.loesung)?.einheit;
  if (haupt) return ist.einheit === haupt;
  return einheitenImText(a.angabe).has(ist.einheit);
}

/**
 * ★ Eine Schätzung (Fermi) lesen - mit denselben Werkzeugen wie jede andere
 * Antwort (Durchsicht 29.09.2026). Vorher wurde JEDES Zeichen außer Ziffer,
 * Punkt und Minus weggeputzt: „ca. 1200" wurde „.1200" = 0,12 (falsch).
 *
 * - „ca.", „circa", „etwa", „ungefähr", „rund", „~", „≈" davor: gilt - das
 *   IST eine Schätzung.
 * - Das Geld darf vorne stehen („€ 0,25"), wie überall (`zahlUndEinheit`).
 * - Die Einheit stört NICHT - das ist die Regel vom 23.09.2026
 *   (`plus-fermi.test.ts`, „stört sich nicht an der Einheit"). ⚠️ Die
 *   Durchsicht vom 29.09. hält das für zu großzügig („1200 kg" gilt für eine
 *   Strecke in km) - die Entscheidung liegt bei Johannes.
 * - ⚠️ Ebenfalls offen: „1.200" (Tausenderpunkt), Spannen wie „1000 bis
 *   1400" und umgerechnete Einheiten („144 min" für 2-3 h) gelten NICHT.
 */
function fermiPasst(eingabe: string, a: Aufgabe): boolean {
  if (!a.bereich) return false;
  const ohne = zeichenGlaetten(eingabe).replace(/^\s*(?:ca\.?|circa|etwa|ungefähr|rund|~|≈)\s*/i, "");
  const ist = zahlUndEinheit(ohne);
  const w = ist ? wert(ist.zahl) : null;
  return w !== null && w >= a.bereich[0] && w <= a.bereich[1];
}

/** Rundet vom Betrag her, wie im eine andere App der Plattform : -6,35 wird -6,4. */
function aufStellen(x: number, stellen: number): number {
  const f = 10 ** stellen;
  return Math.sign(x) * Math.round(Math.abs(x) * f + 1e-9) / f;
}

/**
 * ★ Spanisch, Tausenderpunkt (Recherche ES §E.2 Nr. 4, 10.11.2026): `1.250` ist in Chile,
 * Kolumbien und Argentinien 1250, in Mexiko 1,250. Plus schreibt selbst nie eine
 * Tausendertrennung, aber ein Kind kann sie tippen. Darum gilt `x.yyy` (genau drei
 * Stellen nach dem Punkt, Ganzteil ohne führende Null) hier NICHT stillschweigend nur
 * als Dezimalzahl: Es zählt AUCH die Lesart ohne Punkt. Beide Lesarten sind richtig,
 * wenn eine von ihnen die Lösung trifft - nur Spanisch, Deutsch und die anderen Sprachen
 * bleiben, wie sie sind.
 */
function tausenderLesart(eingabe: string): string | null {
  if (plusSprache() !== "es") return null;
  const t = zeichenGlaetten(eingabe).trim();
  return /^[+-]?[1-9]\d{0,2}(?:\.\d{3})+$/.test(t) ? t.replace(/\./g, "") : null;
}

/** Stimmt die Antwort - ohne die Rechnung davor? */
function antwortStimmt(eingabe: string, a: Aufgabe): boolean {
  if (antwortStimmtWoertlich(eingabe, a)) return true;
  const ohnePunkte = tausenderLesart(eingabe);
  return ohnePunkte !== null && antwortStimmtWoertlich(ohnePunkte, a);
}

function antwortStimmtWoertlich(eingabe: string, a: Aufgabe): boolean {
  // Fermi: die Größenordnung zählt, nicht die Ziffer.
  if (a.bereich) return fermiPasst(eingabe, a);
  const e = normal(eingabe);
  if (loesungen(a).some((w) => normal(w) === e)) return true;
  // ★ Ein führendes Gleichheitszeichen ist keine Antwort, sondern Gewohnheit.
  if (e.startsWith("=") && e.slice(1) === normal(a.loesung)) return true;

  // ★ Wörter klein und ohne Satzzeichen: `Ja` ist `ja`, `a)` ist `a`.
  if (istWortloesung(a.loesung) && a.op !== "term") {
    const w = wortGeputzt(eingabe);
    if (loesungen(a).some((l) => wortGeputzt(l) === w)) return true;
  }
  if (ZEICHEN_IN_WORTEN[a.loesung.trim()]?.includes(wortGeputzt(eingabe))) return true;
  // ★ Ja ist wahr, nein ist falsch (`wahrheitswert`, 15.10.2026).
  if (a.op !== "term") {
    const soll = wahrheitswert(a.loesung);
    if (soll !== null && wahrheitswert(eingabe) === soll) return true;
  }

  // ★ Eine MENGE hat keine Reihenfolge: `{1; 2; 4}` und `{4; 1; 2}` sind
  // dasselbe.
  if (istMenge(a.loesung) && gleicheMenge(eingabe, a.loesung)) return true;

  // ★★★ Division mit Rest: Quotient UND Rest, in jeder üblichen Schreibweise.
  // Der Quotient allein ist die halbe Antwort (siehe `pruefe`, Stand `rest`).
  const sollRest = restForm(a.loesung);
  if (sollRest) {
    const istRest = restForm(eingabe);
    return !!istRest && istRest.quotient === sollRest.quotient && istRest.rest === sollRest.rest;
  }

  // ★★★ Eine Aufzählung zählt ganz. Der Reihe nach, wo die Lücken eine Reihe
  // haben oder die Angabe ordnen lässt; sonst als Menge.
  if (istAufzaehlung(a.loesung)) {
    const ordnung = a.angabe.includes(LUECKE) || verlangtOrdnung(a.angabe);
    return loesungen(a).some((l) => istAufzaehlung(l)
      && (aufzaehlungStimmt(eingabe, l, wert, ordnung) || !!aufzaehlungUrteil(eingabe, l, wert, ordnung)?.stimmt));
  }

  // ★★★ Zahl und Einheit - beide, siehe `einheitPasst`.
  const ist = zahlUndEinheit(eingabe);
  if (ist) {
    for (const l of loesungen(a)) {
      const soll = zahlUndEinheit(l);
      if (soll && normal(soll.zahl) === normal(ist.zahl) && einheitPasst(ist, soll, a)) return true;
    }
  }

  /**
   * ★★★★ DER WERT ZÄHLT, NICHT DIE SCHREIBWEISE - bei Brüchen.
   *
   * `4/11 +10/11 =` hat die Lösung `1 3/11`. Ein Kind, das `14/11` schreibt,
   * hat richtig gerechnet; ein Kind, das `0,25` für `1/4` schreibt, auch.
   * Gemessen: 269 Bruch-Lösungen und 35 gemischte Zahlen nahmen ihre eigene
   * andere Form nicht an.
   *
   * ★★★ Und die richtig GERUNDETE Dezimalzahl gilt auch (eine andere App der Plattform , Johannes
   * 11.09.2026: „gerundet auf zwei Kommastellen, oder die exakte Form").
   * `0,33` für `1/3` ist richtig, `0,3` nicht - eine Stelle ist keine Rundung,
   * sondern ein anderer Wert.
   *
   * ⚠️ NUR wenn die Lösung selbst ein Bruch ist. Sonst würde aus der Division
   * `12 /4 =` die zurückgeschriebene Angabe `12 /4` eine richtige Antwort -
   * sie hat ja denselben Wert wie `3`.
   *
   * ⚠️ Und nie, wo die Schreibweise die Aufgabe IST (`formZaehlt`).
   */
  if (!a.formZaehlt && istBruchform(a.loesung) && !stehtSchonDa(e, a.angabe)) {
    const l = wert(a.loesung);
    const k = wert(eingabe);
    if (l !== null && k !== null && Math.abs(l - k) < 1e-9) return true;
    const gerundet = /^-?\d+,(\d{2,})$/.exec(e);
    if (l !== null && k !== null && gerundet && Math.abs(k - aufStellen(l, gerundet[1].length)) < 1e-9) return true;
  }

  // ★ Ein Term gilt in jeder gleichwertigen Schreibweise - in der Form, die
  // die Aufgabe verlangt. Siehe `term.ts`.
  return a.op === "term" && gleicherTerm(klammerUmZahlWeg(zeichenGlaetten(eingabe)).toLowerCase(), a.loesung);
}

/** Sieht die Antwort aus wie eine Menge? */
function istMenge(text: string): boolean {
  return /^\s*\{.*\}\s*$/.test(text);
}

/**
 * Zwei Mengen vergleichen - ohne Rücksicht auf die Reihenfolge, und die
 * geschweiften Klammern dürfen fehlen.
 *
 * ★ Auf der Braillezeile sind sie je zwei Zellen. Sie zu verlangen, wäre eine
 * Hürde vor der eigentlichen Aufgabe - die heißt „finde die Teiler".
 */
function gleicheMenge(a: string, b: string): boolean {
  const teile = (t: string) =>
    t.replace(/[{}]/g, "").split(/[;,]/).map((x) => normal(x)).filter(Boolean).sort();
  const x = teile(a), y = teile(b);
  return x.length === y.length && x.every((w, i) => w === y[i]);
}

/* ------------------------------------------------------------------ */
/* Zufall, aber wiederholbar                                            */
/* ------------------------------------------------------------------ */

/**
 * Ein kleiner, schneller Zufallsgeber mit Saat (mulberry32). Wiederholbar,
 * damit ein Lauf reproduzierbar ist: dieselbe Saat, dieselben Aufgaben.
 * Das brauchen die Tests - und ein Kind, das einen Lauf fortsetzt.
 */
export function zufall(saat: number): () => number {
  let z = saat >>> 0;
  return () => {
    z = (z + 0x6d2b79f5) >>> 0;
    let t = Math.imul(z ^ (z >>> 15), 1 | z);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Ganze Zahl von `von` bis `bis`, beide eingeschlossen. */
export function ganz(rng: () => number, von: number, bis: number): number {
  return von + Math.floor(rng() * (bis - von + 1));
}

/** Ein Element aus der Liste. */
export function eines<T>(rng: () => number, liste: readonly T[]): T {
  if (!liste.length) throw new Error("Leere Liste");
  return liste[Math.floor(rng() * liste.length)];
}

/** Liste mischen, ohne das Original zu verändern. */
export function gemischt<T>(rng: () => number, liste: readonly T[]): T[] {
  const a = liste.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
