/**
 * Zahl zu Zahlwort - gemeinsames Modul.
 *
 * ★ Warum hier und nicht in einer App: dieselbe Regel lag bisher doppelt im
 * Baum (`lib/typing/zahlwort.ts` und eine zweite Fassung in
 * `lib/computer/fuerSprachausgabe.ts`), die Ordnungszahl-Regel sogar dreifach.
 * Jede Verbesserung musste an mehreren Stellen nachgezogen werden - und wurde
 * es nachweislich nicht. Neue Regeln kommen ab jetzt hierher; die bestehenden
 * Apps ziehen nach, wenn ohnehin etwas an ihrer Sprachausgabe geändert wird.
 * Mit Johannes abgestimmt am 22.09.2026.
 *
 * Deckt ganze Zahlen bis 999 999 999, negative Zahlen und Dezimalzahlen ab.
 */

const EINER = [
  "null", "eins", "zwei", "drei", "vier", "fünf", "sechs", "sieben", "acht", "neun",
  "zehn", "elf", "zwölf", "dreizehn", "vierzehn", "fünfzehn", "sechzehn", "siebzehn", "achtzehn", "neunzehn",
];
const ZEHNER = ["", "", "zwanzig", "dreißig", "vierzig", "fünfzig", "sechzig", "siebzig", "achtzig", "neunzig"];

/** Die Form, die in Zusammensetzungen steht: „einundzwanzig", nicht „einsundzwanzig". */
function einerForm(n: number): string {
  return n === 1 ? "ein" : EINER[n];
}

/** Vor „tausend" und „Millionen" heißt es „ein", nicht „eins". */
function praefix(wort: string): string {
  return wort === "eins" ? "ein" : wort;
}

function unter100(n: number): string {
  if (n < 20) return EINER[n];
  const z = Math.floor(n / 10);
  const e = n % 10;
  return e ? `${einerForm(e)}und${ZEHNER[z]}` : ZEHNER[z];
}

function unter1000(n: number): string {
  if (n < 100) return unter100(n);
  const h = Math.floor(n / 100);
  const r = n % 100;
  return `${einerForm(h)}hundert${r ? unter100(r) : ""}`;
}

/**
 * Eine ganze Zahl als Wort. Über einer Milliarde gibt die Funktion die Ziffern
 * zurück - so weit reicht keine Rechenaufgabe dieser App, und eine falsche
 * Ansage wäre schlimmer als gar keine.
 */
export function zahlwort(n: number): string {
  if (!Number.isFinite(n)) return String(n);
  if (n < 0) return `minus ${zahlwort(-n)}`;
  if (!Number.isInteger(n)) return dezimalwort(n);
  if (n === 0) return "null";
  if (n >= 1_000_000_000) return String(n);

  const mio = Math.floor(n / 1_000_000);
  const tsd = Math.floor((n % 1_000_000) / 1000);
  const rest = n % 1000;

  // Tausender und Rest werden zusammengeschrieben („zweitausendsechsundzwanzig"),
  // Millionen stehen als eigenes Wort davor.
  let unten = "";
  if (tsd) unten += `${praefix(unter1000(tsd))}tausend`;
  if (rest) unten += unter1000(rest);

  const teile: string[] = [];
  if (mio) teile.push(mio === 1 ? "eine Million" : `${praefix(unter1000(mio))} Millionen`);
  if (unten) teile.push(unten);
  return teile.join(" ");
}

/**
 * Eine Dezimalzahl: die Ganzen als Wort, nach dem Komma Ziffer für Ziffer.
 *
 * ★ „null Komma sieben fünf", nicht „null Komma fünfundsiebzig". Die zweite
 * Form ist mehrdeutig - 0,75 und 0,075 klängen fast gleich.
 */
export function dezimalwort(n: number): string {
  if (n < 0) return `minus ${dezimalwort(-n)}`;
  const s = String(n).replace(".", ",");
  const [ganz, nach] = s.split(",");
  const kopf = zahlwort(Number(ganz));
  if (!nach) return kopf;
  const ziffern = nach.split("").map((z) => EINER[Number(z)]).join(" ");
  return `${kopf} Komma ${ziffern}`;
}

/**
 * Ein Geldbetrag: „3 Euro 50", nie „drei Komma fünf null Euro".
 * Ohne Cent-Anteil einfach „3 Euro".
 */
export function geldwort(betrag: number): string {
  const negativ = betrag < 0;
  const wert = Math.round(Math.abs(betrag) * 100);
  const euro = Math.floor(wert / 100);
  const cent = wert % 100;
  const kopf = `${zahlwort(euro)} Euro`;
  const voll = cent ? `${kopf} ${zahlwort(cent)}` : kopf;
  return negativ ? `minus ${voll}` : voll;
}

/**
 * Der Nennername eines Bruchs: 4 wird zu „Viertel".
 * Über zwanzig gibt es keine gebräuchliche Form - dann `null`, und der
 * Aufrufer sagt „drei durch dreiundzwanzig".
 */
const NENNER: Record<number, string> = {
  2: "Halbe", 3: "Drittel", 4: "Viertel", 5: "Fünftel", 6: "Sechstel", 7: "Siebtel",
  8: "Achtel", 9: "Neuntel", 10: "Zehntel", 11: "Elftel", 12: "Zwölftel", 13: "Dreizehntel",
  14: "Vierzehntel", 15: "Fünfzehntel", 16: "Sechzehntel", 17: "Siebzehntel",
  18: "Achtzehntel", 19: "Neunzehntel", 20: "Zwanzigstel",
};

export function nennerName(nenner: number): string | null {
  return NENNER[nenner] ?? null;
}

/**
 * Ein Bruch als Wort: 3/4 wird zu „drei Viertel", 1/2 zu „ein Halbes".
 * Was keinen Namen hat, wird zu „drei durch dreiundzwanzig".
 */
export function bruchwort(zaehler: number, nenner: number): string {
  const name = nennerName(nenner);
  if (!name) return `${zahlwort(zaehler)} durch ${zahlwort(nenner)}`;
  if (zaehler === 1) return nenner === 2 ? "ein Halbes" : `ein ${name}`;
  return `${zahlwort(zaehler)} ${name}`;
}
