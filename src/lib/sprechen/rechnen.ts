/**
 * Das Rechen-Wörterbuch: aus einer Zeile wird ein Satz.
 *
 * Der Screenreader liest Rechnungen falsch. NVDA verschluckt in der
 * Grundeinstellung das Pluszeichen, den Stern, das Dach und die Klammern;
 * JAWS sagt „star" und „caret". Aus `48 +27 =` wird „48 27". Wer nur zuhört,
 * bekommt die Aufgabe gar nicht.
 *
 * ★ Die Trennung, an der alles hängt: im Dokument steht die kurze Form, damit
 * die Braillezeile die Schulschreibweise zeigt. Die Stimme der App sagt den
 * ausformulierten Satz. Beides sagt nie dasselbe doppelt. Ein `aria-label` am
 * Ausdruck wäre der falsche Weg - der Ausdruck würde dann am Stück angesagt,
 * Wort-für-Wort-Lesen und Anhalten fielen weg.
 *
 * Jede Zeile der Tabellen in „Plus - Die Vorlesefunktion" ist hier eine Regel
 * und im Test ein Fall.
 */
import { bruchwort, dezimalwort, geldwort, zahlwort } from "./zahlwort";
import { ordnungszahlenSprechen } from "./ordnungszahl";

/** Maßeinheiten, ausgeschrieben - nie als Kürzel gesprochen. */
const EINHEITEN: Record<string, { eine: string; viele: string; name: string }> = {
  // Bei genau eins zählt der Artikel: „eine Tonne", aber „ein Kilogramm".
  t: { eine: "eine Tonne", viele: "Tonnen", name: "Tonne" },
  kg: { eine: "ein Kilogramm", viele: "Kilogramm", name: "Kilogramm" },
  dag: { eine: "ein Dekagramm", viele: "Dekagramm", name: "Dekagramm" },
  g: { eine: "ein Gramm", viele: "Gramm", name: "Gramm" },
  km: { eine: "ein Kilometer", viele: "Kilometer", name: "Kilometer" },
  m: { eine: "ein Meter", viele: "Meter", name: "Meter" },
  dm: { eine: "ein Dezimeter", viele: "Dezimeter", name: "Dezimeter" },
  cm: { eine: "ein Zentimeter", viele: "Zentimeter", name: "Zentimeter" },
  mm: { eine: "ein Millimeter", viele: "Millimeter", name: "Millimeter" },
  l: { eine: "ein Liter", viele: "Liter", name: "Liter" },
  ml: { eine: "ein Milliliter", viele: "Milliliter", name: "Milliliter" },
  h: { eine: "eine Stunde", viele: "Stunden", name: "Stunde" },
  min: { eine: "eine Minute", viele: "Minuten", name: "Minute" },
  s: { eine: "eine Sekunde", viele: "Sekunden", name: "Sekunde" },
  EUR: { eine: "ein Euro", viele: "Euro", name: "Euro" },
  Cent: { eine: "ein Cent", viele: "Cent", name: "Cent" },
};

/** Stellenwert-Kürzel aus dem schriftlichen Rechnen. */
const STELLEN: Record<string, string> = {
  H: "Hunderter",
  Z: "Zehner",
  E: "Einer",
  T: "Tausender",
};

const ZEICHENWORT: Record<string, string> = {
  "+": "plus",
  "-": "minus",
  "*": "mal",
  "/": "durch",
};

export interface SprechEinstellung {
  /** Statt „ist" das längere „ist gleich" - für Gleichungen. */
  istGleich?: boolean;
  /** Abkürzungen beim ersten Mal ausschreiben, danach kurz. */
  kuerzelAusschreiben?: boolean;
}

/**
 * Eine Zeile in einen gesprochenen Satz verwandeln.
 *
 * Mehrzeilige Angaben werden Zeile für Zeile übersetzt und mit einem Punkt
 * verbunden - der Punkt erzeugt in jeder Sprachausgabe die Pause, die ein
 * Rechenweg braucht.
 */
export function sprich(zeile: string, e: SprechEinstellung = {}): string {
  return zeile
    .split("\n")
    .map((z) => eineZeile(z, e))
    .filter((z) => z.length > 0)
    // ★ Kein doppelter Punkt: endet die Zeile schon mit einem Satzzeichen,
    // wird nur ein Leerzeichen angehängt. Gemessen am 23.09.2026: aus zwei
    // Zeilen wurde „vier Kinder.. Wie viele".
    .reduce((satz, zeile) => (satz ? `${satz}${/[.?!]$/.test(satz) ? " " : ". "}${zeile}` : zeile), "");
}

function eineZeile(zeile: string, e: SprechEinstellung): string {
  let s = zeile.trim();
  if (!s || /^-{3,}$/.test(s)) return ""; // Der Trennstrich ist für Auge und Suche, nicht fürs Ohr.

  // ★ Ordnungszahlen zuerst - „bis zum 80. Jahr" hieß „bis zum achtzig. Jahr"
  // (Durchsicht 29.09.2026). Dieselbe Regel entscheidet, wo die Angabe NICHT
  // umbricht; siehe `ordnungszahl.ts`.
  s = ordnungszahlenSprechen(s);

  // Reihenfolge ist wichtig: was mehr Zeichen umfasst, kommt zuerst.
  s = s.replace(/\bnr:/g, "Nebenrechnung:");
  s = s.replace(/\bT\((\d+)\)/g, (_, n) => `Teilermenge von ${zahlwort(Number(n))}`);
  s = s.replace(/\bV\((\d+)\)/g, (_, n) => `Vielfachenmenge von ${zahlwort(Number(n))}`);
  s = s.replace(/\bggT\b/g, "größter gemeinsamer Teiler");
  s = s.replace(/\bkgV\b/g, "kleinstes gemeinsames Vielfaches");

  // ★ Zahl und Variable auseinander: „2a" wird sonst zu „zweia" gesprochen.
  // Gemessen am 23.09.2026 in Stufe 8. Die Einheiten sind ausgenommen - „5 cm"
  // hat seine eigene Regel, und „1 t" darf nicht zu „1 t" mit Lücke werden.
  s = s.replace(/(\d)([a-z])(?![a-z])/g, (treffer, ziffer, buchstabe) =>
    "tkgmlhs".includes(buchstabe) && / $/.test(treffer) ? treffer : `${ziffer} ${buchstabe}`);

  // Wurzeln vor allem anderen - sie tragen Klammern, die sonst umgedeutet würden.
  // ★★★ Die Schreibweise der Buecher: `'w(9)` und `'w[3](27)` (BookAccess).
  // Das gerade Apostroph ist auf der Braillezeile Punkt 6 und weist die
  // Buchstabenfolge ueberhaupt erst als mathematisches Zeichen aus.
  s = s.replace(/'w\[2\]\(([^)]+)\)/g, (_, i) => `Quadratwurzel aus ${sprichInhalt(i, e)}`);
  s = s.replace(/'w\[3\]\(([^)]+)\)/g, (_, i) => `Kubikwurzel aus ${sprichInhalt(i, e)}`);
  s = s.replace(/'w\[(\d+)\]\(([^)]+)\)/g, (_, n, i) => `${WURZEL_ORDNUNG[n] ?? `${n}-te`} Wurzel aus ${sprichInhalt(i, e)}`);
  s = s.replace(/'w\(([^)]+)\)/g, (_, i) => `Wurzel aus ${sprichInhalt(i, e)}`);

  // Flächen- und Raummaße, bevor das Dach zur Potenz wird.
  s = s.replace(/\b(m|cm|dm|km|mm)\^2\b/g, (_, u) => `Quadrat${EINHEITEN[u].name.toLowerCase()}`);
  s = s.replace(/\b(m|cm|dm|km|mm)\^3\b/g, (_, u) => `Kubik${EINHEITEN[u].name.toLowerCase()}`);

  // Geld: „3,50 EUR" wird zu „drei Euro fünfzig", nie zu „drei Komma fünf null Euro".
  s = s.replace(/(-?\d+(?:,\d{1,2})?)\s*(?:EUR|€)/g, (_, z) => geldwort(Number(String(z).replace(",", "."))));

  // Gemischte Zahl vor dem einfachen Bruch: „1 3/4" ist eins und drei Viertel.
  s = s.replace(/\b(\d+) (\d+)\/(\d+)\b/g, (_, g, z, n) =>
    `${zahlwort(Number(g))} und ${bruchwort(Number(z), Number(n))}`);
  // Bruch - aber nur zwischen Ziffern. „474 /3" ist eine Division, kein Bruch:
  // dort steht ein Leerzeichen vor dem Schrägstrich.
  s = s.replace(/(?<![\d,])(\d+)\/(\d+)(?![\d,])/g, (_, z, n) => bruchwort(Number(z), Number(n)));

  // Potenzen
  // ★ Die Basis darf ein Komma haben. Gemessen am 23.09.2026 in 7-08: aus
  // „0,6^2" wurde „null,sechs hoch zwei" - die Regel fasste nur die 6.
  s = s.replace(/(?<![\d,])(\d+(?:,\d+)?)\^(\d+)/g, (_, b, x) => `${zahl(b)} hoch ${zahlwort(Number(x))}`);
  s = s.replace(/\b([a-z])\^(\d+)/g, (_, v, x) => `${v} hoch ${zahlwort(Number(x))}`);

  // Prozent - erst mit Zahl davor, dann jedes übrige Zeichen.
  // ★ Gemessen am 23.09.2026: „sind wie viel %?" blieb als Zeichen stehen.
  s = s.replace(/(\d+(?:,\d+)?)\s*%/g, (_, z) => `${z === "1" ? "ein" : zahl(z)} Prozent`);
  s = s.replace(/\s*%/g, " Prozent");

  // ★ „für 1 Jahr" heißt „für ein Jahr", nicht „für eins Jahr". Gemessen am
  // 23.09.2026 in 7-18. Nur vor Zeitwörtern - „1 Rest" bleibt die Zahl.
  s = s.replace(/(?<![\d,])1 (Jahr|Monat|Tag)\b/g, "ein $1");

  // ★ Das Verhältnis: „1 : 200" heißt „eins zu zweihundert". Gemessen am
  // 23.09.2026 in 7-16: der Doppelpunkt blieb stehen („eins:zweihundert").
  // Nur zwischen Zahlen - „Rest:" und „a:" sind Pausen, keine Verhältnisse.
  s = s.replace(/(\d)\s*:\s*(?=\d)/g, "$1 zu ");

  // Stellenwert-Kürzel: „17 Z" wird zu „siebzehn Zehner".
  s = s.replace(/(\d+)\s+([HZET])\b/g, (_, z, k) => `${zahl(z)} ${STELLEN[k]}`);

  // Maßeinheiten ausschreiben
  s = s.replace(/(\d+(?:,\d+)?)\s*(t|kg|dag|g|km|m|dm|cm|mm|l|ml|h|min|s|Cent)\b/g, (_, z, u) => {
    const wert = Number(String(z).replace(",", "."));
    return wert === 1 ? EINHEITEN[u].eine : `${zahl(z)} ${EINHEITEN[u].viele}`;
  });

  // ★ Eine Zahl mit Tintenklecks (`[]6`, `4[]7`, `9[]`) wird Ziffer für Ziffer
  // gesprochen. Sonst hieß `64 +[]9 =93` „vierundsechzig plus Lückeneun", und
  // `[]96` wäre „Lücke sechsundneunzig" - dabei fehlt die Hunderterziffer vor
  // einer Neun und einer Sechs. Gemessen am 26.09.2026 (Form `klecks`).
  s = s.replace(/(?:\d|\[\])*(?:\d\[\]|\[\]\d)(?:\d|\[\])*/g, (t) => (t.match(/\[\]|\d/g) ?? []).join(" "));

  // ★ Das Malkreuz beginnt mit einem Malzeichen ohne Zahl davor
  // (`* | 600 | 10 | 2`). Es bliebe als Zeichen stehen, und NVDA verschluckt es.
  s = s.replace(/^\*\s*\|/, "mal |");

  // Die Lücke
  // ★ Steht eine Einheit dahinter, wird sie mitgesprochen: „[] min" ist
  // „Lücke Minuten", nicht „Lücke min". Gemessen am 23.09.2026 in 4-14.
  s = s.replace(
    /\[\]\s*(t|kg|dag|g|km|m|dm|cm|mm|l|ml|h|min|s|EUR|Cent)\b/g,
    (_, u: string) => `Lücke ${EINHEITEN[u].viele}`,
  );
  s = s.replace(/\[\]/g, "Lücke");

  // ★ Der Betrag ZUERST - sonst verschluckt ihn die Regel darunter. Gemessen
  // am 23.09.2026: aus „|37| =" wurde „, siebenunddreißig, ist".
  s = s.replace(/\|(-?\d+(?:,\d+)?)\|/g, (_, z) => `Betrag von ${zahl(String(z))}`);
  // Der Spaltentrenner der aufgelösten Bilder wird zur Pause.
  s = s.replace(/\s*\|\s*/g, ", ");

  // Rechenzeichen VOR den Klammern - sonst steht nach dem Ersetzen der Klammer
  // ein Leerzeichen, und das Rechenzeichen davor wird nicht mehr erkannt.
  // Ein Bindestrich direkt vor einer Ziffer und nach einem Zeichen oder
  // Zeilenanfang ist ein Vorzeichen, kein Rechenzeichen.
  // ★ Auch vor einem Buchstaben: „(-a -6)" hieß „in Klammer -a minus sechs".
  // Gemessen am 23.09.2026 in 8-07 und 7-13.
  s = s.replace(/(^|[(=+\-*/\s])-(\d|[a-z](?![a-z]))/g, (_, vor, z) => `${vor}minus ${z}`);
  s = s.replace(/\s([+\-*/])(?=\S)/g, (_, z) => ` ${ZEICHENWORT[z]} `);
  // ★ Ein Schrägstrich, der bis hierher überlebt hat, steht zwischen Termen:
  // `10 x/4 x`. Er heißt „durch". Gemessen am 23.09.2026 in Stufe 8 - dort
  // blieb er als Zeichen stehen, und NVDA verschluckt ihn.
  s = s.replace(/\//g, " durch ");
  s = s.replace(/=/g, e.istGleich ? " ist gleich " : " ist ");

  // Klammern - NVDA liest sie gar nicht, ohne Ansage geht die Vorrangregel verloren.
  // ★ Die Antwortmarken „a)" zuerst - sonst wird daraus „a Klammer zu".
  // Ein Doppelpunkt macht daraus die kurze Pause, die ein Kind hier braucht.
  // ★ Auch die Ziffernmarken „1)" der Fehlersuche - sonst heißt es „eins
  // Klammer zu". Gemessen am 23.09.2026 in 4-07.
  s = s.replace(/(^|\n)\s*([a-d1-9])\)\s*/g, (_, vor, marke) => `${vor}${marke}: `);
  s = s.replace(/\(/g, " in Klammer ").replace(/\)/g, " Klammer zu ");

  // Ein Dach, das keine der Regeln oben gefasst hat, bleibt nicht stumm.
  s = s.replace(/\^/g, " hoch ");

  // Zahlen zuletzt - vorher hätten die Wörter die Muster oben zerstört.
  s = s.replace(/-?\d+(?:,\d+)?/g, (t) => zahl(t));

  return s.replace(/\s+/g, " ").replace(/\s+([.,;:?])/g, "$1").trim();
}

/**
 * Wie die Wurzelordnung gesprochen wird. Nur die Formen, die in der Schule
 * vorkommen; alles darueber bekommt „n-te".
 */
const WURZEL_ORDNUNG: Record<string, string> = {
  "4": "vierte", "5": "fünfte", "6": "sechste", "7": "siebente",
  "8": "achte", "9": "neunte", "10": "zehnte",
};

/** Inhalt einer Wurzelklammer, damit dort dieselben Regeln gelten. */
function sprichInhalt(inhalt: string, e: SprechEinstellung): string {
  return eineZeile(inhalt, e);
}

/** Eine Zahl als Wort - Dezimalzahlen Ziffer für Ziffer nach dem Komma. */
function zahl(text: string): string {
  const n = Number(text.replace(",", "."));
  if (!Number.isFinite(n)) return text;
  return text.includes(",") ? dezimalwort(n) : zahlwort(n);
}
