/**
 * Rechengeschichten - die Sachaufgaben von Plus.
 *
 * ★ Warum das Texte und keine Zahlenreihen sind: Ein Kind, das `7 +5 =`
 * rechnen kann, scheitert oft an „Lena hat sieben Murmeln und bekommt fünf
 * dazu". Der Schritt vom Text zur Rechnung ist ein eigener Lerngegenstand -
 * und er ist der, an dem Kinder mit Blindheit am wenigsten Hilfe bekommen,
 * weil die üblichen Sachaufgaben-Seiten mit Bildern arbeiten.
 *
 * ★ Die Regeln für jeden Text:
 *   · Kurz. Stufe 1 und 2 ein Satz um sechs Wörter, später etwas mehr.
 *   · ★ JEDER SATZ EINE ZEILE, und jede Zeile unter 40 Zeichen. So breit ist
 *     eine Braillezeile. Ein Satz, der über zwei Zeilen läuft, zwingt zum
 *     Weiterblättern mitten im Gedanken - und beim Zurückblättern ist die
 *     Zahl vom Anfang weg.
 *   · Kein Bild, keine Tabelle, nichts, was man sehen muss.
 *   · Die Zahlen stehen in der Schreibweise von Plus - und im Text als
 *     Ziffern, nicht als Wörter: sie sollen auf der Braillezeile als Zahl
 *     lesbar sein.
 *   · Namen aus einem breiten Vorrat, ohne Rollenzuschreibung. Wer kocht,
 *     wer baut, wer sammelt - das wechselt.
 *
 * ★★★ DER ANTWORTSATZ IST ENTSCHIEDEN (Johannes, 23.09.2026): „nur die Zahl
 * reicht". Der Stoffplan verlangt ihn für Stufe 1 und 2 - Plus verlangt ihn
 * nicht. Freien Text zu bewerten hiesse raten, und eine zweite, ungeprüfte
 * Zeile wäre eine Aufgabe, die niemandem antwortet. Die Frage ist deshalb so
 * gestellt, dass eine Zahl die Antwort ist. ⚠️ Das ist keine offene Frage
 * mehr; wer sie wieder aufmacht, fragt Johannes, nicht den Stoffplan.
 */
import { saetzeUmbrechen } from "@/lib/sprechen/ordnungszahl";
import { ganz, zahl, type Operation } from "../aufgabe";
import { plusSprache } from "../aktuelleSprache";
import { aktuelleRegion } from "../einstellungen";
import { regionalerText } from "../regionen";
import type { Kern } from "./kerne";
import { NAMEN_EN, SACHAUFGABEN_EN } from "./sachaufgabenEn";
import { NAMEN_FR, SACHAUFGABEN_FR } from "./sachaufgabenFr";
import { NAMEN_ES, SACHAUFGABEN_ES } from "./sachaufgabenEs";

/** Eine fertige Rechengeschichte - ein Kern, der seinen Text mitbringt. */
export type Geschichte = Extract<Kern, { sorte: "direkt" }>;

/** Namen für die Geschichten - kurz, verschieden, ohne Rollenbild. */
const NAMEN = [
  "Lena", "Jonas", "Mira", "Ali", "Emma", "Nico", "Sara", "Tom", "Ida", "Leo",
  "Nina", "Ben", "Yara", "Elias", "Mia", "Paul", "Ella", "Jan", "Lara", "Finn",
];

export interface SachVorlage {
  /** Der Text. `{a}`, `{b}`, `{c}` und `{n}` werden ersetzt - `{n}` ist der Name. */
  text: string;
  op: Operation;
  a: [number, number];
  b: [number, number];
  /** Dritte Zahl - mehrschrittige Aufgaben ab der dritten Schulstufe. */
  c?: [number, number];
  rechne: (a: number, b: number, c: number) => number;
  /** Damit die Zahlen zueinander passen - etwa a größer als b. */
  passt?: (a: number, b: number, c: number) => boolean;
  /** Steht hinter der Antwort eine Einheit? */
  einheit?: string;
  /** Nachkommastellen der Antwort - für Geld und Größen. */
  nachkomma?: number;
}

/* ------------------------------------------------------------------ */
/* Stufe 1 - Rechengeschichten bis 20                                   */
/* ------------------------------------------------------------------ */

const STUFE1: SachVorlage[] = [
  { text: "{n} hat {a} Murmeln. {n} bekommt {b} dazu. Wie viele sind es jetzt?",
    op: "plus", a: [3, 12], b: [2, 8], rechne: (a, b) => a + b },
  { text: "Im Korb liegen {a} Äpfel. {n} legt {b} dazu. Wie viele liegen jetzt drin?",
    op: "plus", a: [4, 12], b: [2, 8], rechne: (a, b) => a + b },
  { text: "{n} baut einen Turm aus {a} Steinen. {b} Steine fallen herunter. Wie viele stehen noch?",
    op: "minus", a: [8, 20], b: [2, 7], rechne: (a, b) => a - b, passt: (a, b) => a > b },
  { text: "{a} Kinder spielen im Hof. {b} gehen nach Hause. Wie viele bleiben?",
    op: "minus", a: [8, 20], b: [2, 8], rechne: (a, b) => a - b, passt: (a, b) => a > b },
  { text: "{n} sammelt {a} Kastanien. Am nächsten Tag noch {b}. Wie viele sind es zusammen?",
    op: "plus", a: [5, 12], b: [3, 8], rechne: (a, b) => a + b },
  { text: "Auf dem Teller liegen {a} Kekse. {n} isst {b}. Wie viele bleiben liegen?",
    op: "minus", a: [6, 18], b: [2, 6], rechne: (a, b) => a - b, passt: (a, b) => a > b },
  { text: "{n} hat {a} Sticker. {n} schenkt {b} her. Wie viele bleiben?",
    op: "minus", a: [9, 20], b: [3, 8], rechne: (a, b) => a - b, passt: (a, b) => a > b },
  { text: "In der Kiste sind {a} Bauklötze. {n} findet noch {b}. Wie viele sind es jetzt?",
    op: "plus", a: [6, 13], b: [2, 7], rechne: (a, b) => a + b },
  { text: "{n} zählt {a} Vögel. {b} fliegen weg. Wie viele sitzen noch da?",
    op: "minus", a: [7, 19], b: [2, 6], rechne: (a, b) => a - b, passt: (a, b) => a > b },
  { text: "{n} hat {a} Euro. {n} bekommt {b} Euro dazu. Wie viel ist das?",
    op: "plus", a: [4, 12], b: [3, 8], rechne: (a, b) => a + b, einheit: "Euro" },
  { text: "Auf der Wiese stehen {a} Kühe. {b} kommen dazu. Wie viele sind es jetzt?",
    op: "plus", a: [4, 12], b: [2, 8], rechne: (a, b) => a + b },
  { text: "{n} hat {a} Luftballons. {b} platzen. Wie viele bleiben?",
    op: "minus", a: [7, 20], b: [2, 6], rechne: (a, b) => a - b, passt: (a, b) => a > b },
  { text: "Im Glas sind {a} Bonbons. {n} nimmt {b} heraus. Wie viele bleiben?",
    op: "minus", a: [8, 20], b: [3, 7], rechne: (a, b) => a - b, passt: (a, b) => a > b },
  { text: "{n} malt {a} Sterne. Dann noch {b}. Wie viele sind es zusammen?",
    op: "plus", a: [5, 12], b: [3, 8], rechne: (a, b) => a + b },
  { text: "{a} Enten schwimmen im Teich. {b} gehen an Land. Wie viele schwimmen noch?",
    op: "minus", a: [9, 20], b: [3, 8], rechne: (a, b) => a - b, passt: (a, b) => a > b },
  { text: "{n} braucht {a} Perlen. {n} hat erst {b}. Wie viele fehlen?",
    op: "minus", a: [10, 20], b: [3, 9], rechne: (a, b) => a - b, passt: (a, b) => a > b },
  { text: "In der Schachtel sind {a} Stifte. {n} legt {b} dazu. Wie viele sind es dann?",
    op: "plus", a: [5, 13], b: [2, 7], rechne: (a, b) => a + b },
  { text: "{a} Kinder sitzen im Kreis. {b} stehen auf. Wie viele sitzen noch?",
    op: "minus", a: [8, 20], b: [2, 7], rechne: (a, b) => a - b, passt: (a, b) => a > b },
];

/* ------------------------------------------------------------------ */
/* Stufe 2 - Rechengeschichten bis 100                                  */
/* ------------------------------------------------------------------ */

const STUFE2: SachVorlage[] = [
  { text: "In der Klasse sind {a} Bücher. {b} kommen dazu. Wie viele sind es dann?",
    op: "plus", a: [20, 70], b: [10, 30], rechne: (a, b) => a + b },
  { text: "{n} spart {a} Euro. {n} gibt {b} Euro aus. Wie viel bleibt?",
    op: "minus", a: [30, 95], b: [10, 28], rechne: (a, b) => a - b, passt: (a, b) => a > b, einheit: "Euro" },
  { text: "Ein Beutel hat {a} Nüsse. {n} nimmt {b} heraus. Wie viele bleiben im Beutel?",
    op: "minus", a: [40, 99], b: [12, 35], rechne: (a, b) => a - b, passt: (a, b) => a > b },
  { text: "{n} läuft {a} Meter. Dann noch {b} Meter. Wie weit ist das zusammen?",
    op: "plus", a: [20, 60], b: [15, 40], rechne: (a, b) => a + b, einheit: "m" },
  { text: "{a} Kinder fahren mit dem Bus. Bei der Haltestelle steigen {b} aus. Wie viele bleiben?",
    op: "minus", a: [25, 60], b: [8, 20], rechne: (a, b) => a - b, passt: (a, b) => a > b },
  { text: "{n} packt {b} Eier in jede Schachtel. {a} Schachteln werden voll. Wie viele Eier sind das?",
    op: "mal", a: [3, 9], b: [2, 10], rechne: (a, b) => a * b },
  { text: "{a} Kekse werden auf {b} Teller verteilt. Wie viele kommen auf einen Teller?",
    op: "geteilt", a: [12, 60], b: [2, 6], rechne: (a, b) => a / b, passt: (a, b) => a % b === 0 },
  { text: "Im Regal stehen {a} Gläser. {n} stellt {b} dazu. Wie viele stehen dann dort?",
    op: "plus", a: [30, 70], b: [12, 25], rechne: (a, b) => a + b },
  { text: "{n} hat {a} Karten. {n} verliert {b}. Wie viele hat {n} noch?",
    op: "minus", a: [40, 90], b: [15, 30], rechne: (a, b) => a - b, passt: (a, b) => a > b },
  { text: "Jede Reihe hat {b} Stühle. Es gibt {a} Reihen. Wie viele Stühle sind das?",
    op: "mal", a: [3, 9], b: [3, 10], rechne: (a, b) => a * b },
  { text: "{n} sammelt {a} Muscheln. {b} gibt {n} weiter. Wie viele bleiben?",
    op: "minus", a: [40, 95], b: [12, 30], rechne: (a, b) => a - b, passt: (a, b) => a > b },
  { text: "Ein Sack hat {a} Kartoffeln. {b} kommen dazu. Wie viele sind es dann?",
    op: "plus", a: [30, 70], b: [10, 28], rechne: (a, b) => a + b },
  { text: "{n} zählt {a} Autos. Später noch {b}. Wie viele sind das zusammen?",
    op: "plus", a: [25, 60], b: [12, 35], rechne: (a, b) => a + b },
  { text: "{a} Blumen stehen im Beet. {b} verblühen. Wie viele blühen noch?",
    op: "minus", a: [40, 90], b: [15, 30], rechne: (a, b) => a - b, passt: (a, b) => a > b },
  { text: "{b} Kinder teilen sich {a} Äpfel. Wie viele bekommt jedes?",
    op: "geteilt", a: [12, 60], b: [3, 6], rechne: (a, b) => a / b, passt: (a, b) => a % b === 0 },
  { text: "{n} klebt {b} Marken auf jede Seite. Es sind {a} Seiten. Wie viele Marken sind das?",
    op: "mal", a: [3, 9], b: [3, 10], rechne: (a, b) => a * b },
  { text: "Im Bus sitzen {a} Menschen. Bei der Haltestelle steigen {b} ein. Wie viele sind es dann?",
    op: "plus", a: [20, 60], b: [8, 25], rechne: (a, b) => a + b },
  { text: "{n} hat {a} Seiten gelesen. Das Buch hat {b} Seiten. Wie viele fehlen noch?",
    op: "minus", a: [20, 60], b: [70, 99], rechne: (a, b) => b - a, passt: (a, b) => b > a },
];


/* ------------------------------------------------------------------ */
/* Stufe 3 - zwei Rechenschritte bis 1000                               */
/* ------------------------------------------------------------------ */

const STUFE3: SachVorlage[] = [
  { text: "In der Schule sind {a} Kinder. {b} fahren mit dem Bus. {c} gehen zu Fuß. Wie viele kommen mit dem Rad?",
    op: "minus", a: [300, 900], b: [80, 300], c: [50, 250], rechne: (a, b, c) => a - b - c,
    passt: (a, b, c) => a - b - c > 0 },
  { text: "{n} sammelt {a} Punkte. Dann noch {b}. Davon gibt {n} {c} ab. Wie viele bleiben?",
    op: "gemischt", a: [120, 500], b: [60, 300], c: [40, 200], rechne: (a, b, c) => a + b - c,
    passt: (a, b, c) => a + b - c > 0 && a + b <= 1000 },
  { text: "Ein Buch hat {a} Seiten. {n} liest {b} Seiten. Am nächsten Tag {c}. Wie viele fehlen noch?",
    op: "minus", a: [200, 900], b: [50, 200], c: [40, 180], rechne: (a, b, c) => a - b - c,
    passt: (a, b, c) => a - b - c > 0 },
  { text: "Im Lager stehen {a} Flaschen. Es kommen {b} Kisten zu je {c} dazu. Wie viele sind es dann?",
    op: "gemischt", a: [100, 400], b: [3, 9], c: [6, 12], rechne: (a, b, c) => a + b * c,
    passt: (a, b, c) => a + b * c <= 1000 },
  { text: "{n} hat {a} Euro. {n} kauft {b} Hefte zu {c} Euro. Wie viel bleibt?",
    op: "gemischt", a: [50, 200], b: [3, 8], c: [4, 12], rechne: (a, b, c) => a - b * c,
    passt: (a, b, c) => a - b * c > 0, einheit: "Euro" },
  { text: "Im Saal stehen {b} Reihen zu {c} Stühlen. {a} Stühle sind besetzt. Wie viele sind frei?",
    op: "gemischt", a: [50, 300], b: [8, 20], c: [10, 25], rechne: (a, b, c) => b * c - a,
    passt: (a, b, c) => b * c - a > 0 && b * c <= 1000 },
  { text: "Eine Kiste wiegt {c} kg. {n} lädt {b} Kisten ein. Dazu {a} kg Werkzeug. Wie schwer ist alles?",
    op: "gemischt", a: [20, 200], b: [4, 12], c: [5, 20], rechne: (a, b, c) => a + b * c,
    passt: (a, b, c) => a + b * c <= 1000, einheit: "kg" },
  { text: "{a} Äpfel werden in {b} Kisten gefüllt. Dann fallen {c} herunter. Wie viele sind in einer Kiste?",
    op: "geteilt", a: [120, 600], b: [4, 10], c: [0, 0], rechne: (a, b) => a / b,
    passt: (a, b) => a % b === 0 },
  { text: "{n} spart {b} Wochen lang je {c} Euro. Dann kommen {a} Euro dazu. Wie viel ist es?",
    op: "gemischt", a: [20, 150], b: [5, 15], c: [4, 20], rechne: (a, b, c) => a + b * c,
    passt: (a, b, c) => a + b * c <= 1000, einheit: "Euro" },
  { text: "Von {a} Bäumen sind {b} Laubbäume. Der Rest sind Nadelbäume. Wie viele Nadelbäume sind das?",
    op: "minus", a: [200, 900], b: [60, 400], c: [0, 0], rechne: (a, b) => a - b,
    passt: (a, b) => a - b > 0 },
  { text: "Ein Zug hat {b} Wagen zu {c} Plätzen. {a} Plätze sind besetzt. Wie viele sind frei?",
    op: "gemischt", a: [50, 300], b: [5, 12], c: [20, 60], rechne: (a, b, c) => b * c - a,
    passt: (a, b, c) => b * c - a > 0 && b * c <= 1000 },
  { text: "{n} sammelt {b} Wochen je {c} Karten. Dann verschenkt {n} {a}. Wie viele bleiben?",
    op: "gemischt", a: [10, 100], b: [4, 12], c: [8, 30], rechne: (a, b, c) => b * c - a,
    passt: (a, b, c) => b * c - a > 0 && b * c <= 1000 },
  { text: "Im Lager sind {a} Schrauben. {n} nimmt {b} Packungen zu {c} heraus. Wie viele bleiben?",
    op: "gemischt", a: [300, 900], b: [3, 8], c: [10, 40], rechne: (a, b, c) => a - b * c,
    passt: (a, b, c) => a - b * c > 0 },
  { text: "{a} Kinder fahren auf Reise. In jeden Bus passen {b}. Wie viele Busse braucht man?",
    op: "geteilt", a: [60, 400], b: [20, 50], c: [0, 0], rechne: (a, b) => Math.ceil(a / b),
    passt: (a, b) => a > b },
];

/* ------------------------------------------------------------------ */
/* Stufe 4 - der große Zahlenraum, auch Durchschnitt                    */
/* ------------------------------------------------------------------ */

const STUFE4: SachVorlage[] = [
  { text: "Eine Stadt hat {a} Einwohner. {b} ziehen zu, {c} ziehen weg. Wie viele sind es dann?",
    op: "gemischt", a: [20000, 90000], b: [500, 4000], c: [400, 3000], rechne: (a, b, c) => a + b - c },
  { text: "Ein Werk baut {b} Räder am Tag. Wie viele sind das in {c} Tagen?",
    op: "mal", a: [0, 0], b: [120, 900], c: [10, 40], rechne: (_a, b, c) => b * c },
  { text: "{a} Hefte gehen an {b} Schulen. Wie viele bekommt eine Schule?",
    op: "geteilt", a: [1200, 90000], b: [4, 25], c: [0, 0], rechne: (a, b) => a / b,
    passt: (a, b) => a % b === 0 },
  { text: "{n} zählt Besuche: {a}, {b}, {c}. Wie viele sind das im Schnitt?",
    op: "gemischt", a: [300, 5000], b: [300, 5000], c: [300, 5000], rechne: (a, b, c) => (a + b + c) / 3,
    passt: (a, b, c) => (a + b + c) % 3 === 0 },
  { text: "Ein Feld ist {b} m lang und {c} m breit. Wie groß ist es?",
    op: "mal", a: [0, 0], b: [40, 400], c: [20, 200], rechne: (_a, b, c) => b * c, einheit: "m^2" },
  { text: "{n} fährt {b} km hin und zurück. {c} Mal im Jahr. Wie viele km sind das?",
    op: "gemischt", a: [0, 0], b: [40, 500], c: [4, 20], rechne: (_a, b, c) => 2 * b * c, einheit: "km" },
  { text: "Ein Saal fasst {a} Menschen. Es sind {b} Plätze besetzt. Wie viele sind frei?",
    op: "minus", a: [2000, 60000], b: [500, 1900], c: [0, 0], rechne: (a, b) => a - b,
    passt: (a, b) => a > b },
  { text: "Eine Kiste wiegt {c} kg. Der Wagen lädt {b} Kisten. Wie schwer ist die Ladung?",
    op: "mal", a: [0, 0], b: [50, 400], c: [8, 40], rechne: (_a, b, c) => b * c, einheit: "kg" },
  { text: "{a} Menschen kommen zum Fest. Jeder zahlt {b} Euro. Wie viel ist das?",
    op: "mal", a: [200, 3000], b: [3, 25], c: [0, 0], rechne: (a, b) => a * b, einheit: "Euro" },
  { text: "Ein Buch kostet {b} Euro. Die Schule kauft {c} Stück. Sie bekommt {a} Euro Nachlass. Wie viel zahlt sie?",
    op: "gemischt", a: [50, 400], b: [10, 40], c: [20, 120], rechne: (a, b, c) => b * c - a,
    passt: (a, b, c) => b * c - a > 0, einheit: "Euro" },
];

/* ------------------------------------------------------------------ */
/* Stufe 5 - Größen: Preise, Längen, Massen, Zeiten                     */
/* ------------------------------------------------------------------ */

const STUFE5: SachVorlage[] = [
  { text: "Ein Brot kostet {b} Euro {c}. {n} kauft {a} Brote. Wie viel kostet das?",
    op: "mal", a: [2, 6], b: [2, 5], c: [10, 90],
    rechne: (a, b, c) => a * (b + c / 100), passt: (_a, _b, c) => c % 10 === 0,
    einheit: "EUR", nachkomma: 2 },
  { text: "{n} läuft {b} Runden zu {c} m. Wie weit ist das in Kilometern?",
    op: "gemischt", a: [0, 0], b: [4, 12], c: [250, 800],
    rechne: (_a, b, c) => (b * c) / 1000, passt: (_a, b, c) => (b * c) % 100 === 0,
    einheit: "km", nachkomma: 2 },
  { text: "Ein Sack wiegt {b} kg {c} dag. {n} kauft {a} Säcke. Wie schwer ist das?",
    op: "mal", a: [2, 5], b: [3, 12], c: [10, 90],
    rechne: (a, b, c) => a * (b + c / 100), passt: (_a, _b, c) => c % 10 === 0,
    einheit: "kg", nachkomma: 2 },
  { text: "Der Film dauert {b} min. {n} sieht {a} Folgen. Wie viele Minuten sind das?",
    op: "mal", a: [3, 8], b: [22, 55], c: [0, 0],
    rechne: (a, b) => a * b, einheit: "min" },
  { text: "{n} hat {a} Euro. Ein Heft kostet {b} Euro {c}. Wie viele Hefte gehen sich aus?",
    op: "geteilt", a: [10, 40], b: [1, 4], c: [20, 80],
    rechne: (a, b, c) => Math.floor(a / (b + c / 100)), passt: (_a, _b, c) => c % 10 === 0 },
  { text: "Ein Stück Stoff ist {b} m {c} cm lang. {n} braucht {a} davon. Wie viel Stoff ist das?",
    op: "mal", a: [2, 5], b: [1, 6], c: [10, 90],
    rechne: (a, b, c) => a * (b + c / 100), passt: (_a, _b, c) => c % 10 === 0,
    einheit: "m", nachkomma: 2 },
  { text: "{a} l Saft kommen in Flaschen zu {b} l. Wie viele Flaschen werden voll?",
    op: "geteilt", a: [6, 40], b: [1, 3], c: [0, 0],
    rechne: (a, b) => Math.floor(a / b) },
  { text: "Die Fahrt dauert {b} h {c} min. {n} fährt hin und zurück. Wie lange dauert das?",
    op: "mal", a: [0, 0], b: [1, 4], c: [10, 50],
    rechne: (_a, b, c) => 2 * (b * 60 + c), passt: (_a, _b, c) => c % 5 === 0, einheit: "min" },
  { text: "Ein Kilo Äpfel kostet {b} Euro {c}. {n} kauft {a} kg. Wie viel zahlt {n}?",
    op: "mal", a: [2, 6], b: [1, 4], c: [20, 90],
    rechne: (a, b, c) => a * (b + c / 100), passt: (_a, _b, c) => c % 10 === 0,
    einheit: "EUR", nachkomma: 2 },
  { text: "{n} geht {b} Schritte zu je {c} cm. Wie weit ist das in Metern?",
    op: "gemischt", a: [0, 0], b: [200, 900], c: [50, 80],
    rechne: (_a, b, c) => (b * c) / 100, passt: (_a, b, c) => (b * c) % 10 === 0,
    einheit: "m", nachkomma: 1 },
];

/* ------------------------------------------------------------------ */
/* Stufe 6 - Brüche und Prozent im Alltag                               */
/* ------------------------------------------------------------------ */

const STUFE6: SachVorlage[] = [
  { text: "Eine Jacke kostet {a} Euro. Es gibt {b} % Nachlass. Wie viel zahlt man?",
    op: "prozent", a: [40, 300], b: [10, 50], c: [0, 0],
    rechne: (a, b) => a - (a * b) / 100, passt: (a, b) => (a * b) % 100 === 0, einheit: "Euro" },
  { text: "Von {a} Kindern fahren {b} % mit dem Rad. Wie viele Kinder sind das?",
    op: "prozent", a: [50, 400], b: [10, 60], c: [0, 0],
    rechne: (a, b) => (a * b) / 100, passt: (a, b) => (a * b) % 100 === 0 },
  { text: "{n} liest {b} Viertel von {a} Seiten. Wie viele Seiten sind das?",
    op: "bruch", a: [40, 400], b: [1, 3], c: [0, 0],
    rechne: (a, b) => (a * b) / 4, passt: (a, b) => (a * b) % 4 === 0 },
  { text: "Ein Feld ist {a} m^2 groß. {b} Fünftel werden bepflanzt. Wie groß ist die Fläche?",
    op: "bruch", a: [100, 900], b: [1, 4], c: [0, 0],
    rechne: (a, b) => (a * b) / 5, passt: (a, b) => (a * b) % 5 === 0, einheit: "m^2" },
  { text: "Ein Preis steigt von {a} Euro um {b} %. Wie hoch ist er jetzt?",
    op: "prozent", a: [40, 400], b: [5, 30], c: [0, 0],
    rechne: (a, b) => a + (a * b) / 100, passt: (a, b) => (a * b) % 100 === 0, einheit: "Euro" },
  { text: "{a} l Saft sind da. {n} trinkt {b} Achtel davon. Wie viel bleibt?",
    op: "bruch", a: [8, 40], b: [1, 5], c: [0, 0],
    rechne: (a, b) => a - (a * b) / 8, passt: (a, b) => (a * b) % 8 === 0, einheit: "l" },
  { text: "{b} % einer Klasse sind {c} Kinder. Wie viele Kinder sind in der Klasse?",
    op: "prozent", a: [0, 0], b: [20, 50], c: [4, 15],
    rechne: (_a, b, c) => (c * 100) / b, passt: (_a, b, c) => (c * 100) % b === 0 },
  { text: "Ein Weg ist {a} km lang. {n} hat {b} Drittel geschafft. Wie weit ist das?",
    op: "bruch", a: [9, 90], b: [1, 2], c: [0, 0],
    rechne: (a, b) => (a * b) / 3, passt: (a, b) => (a * b) % 3 === 0, einheit: "km" },
  { text: "Von {a} Euro spendet {n} {b} %. Wie viel bleibt?",
    op: "prozent", a: [50, 500], b: [5, 40], c: [0, 0],
    rechne: (a, b) => a - (a * b) / 100, passt: (a, b) => (a * b) % 100 === 0, einheit: "Euro" },
  { text: "Eine Schachtel hat {a} Stück. {b} Zehntel sind rot. Wie viele sind rot?",
    op: "bruch", a: [20, 300], b: [1, 7], c: [0, 0],
    rechne: (a, b) => (a * b) / 10, passt: (a, b) => (a * b) % 10 === 0 },
];

/* ------------------------------------------------------------------ */
/* Stufe 7 - aus dem Text wird eine Gleichung                           */
/* ------------------------------------------------------------------ */

const STUFE7: SachVorlage[] = [
  { text: "Eine Zahl mal {b} plus {c} ergibt {a}. Wie heißt die Zahl?",
    op: "gemischt", a: [20, 400], b: [2, 9], c: [3, 40],
    rechne: (a, b, c) => (a - c) / b, passt: (a, b, c) => a - c > 0 && (a - c) % b === 0 },
  { text: "Zwei Zahlen ergeben zusammen {a}. Eine ist um {b} größer. Wie heißt die kleinere?",
    op: "gemischt", a: [40, 400], b: [4, 60], c: [0, 0],
    rechne: (a, b) => (a - b) / 2, passt: (a, b) => (a - b) > 0 && (a - b) % 2 === 0 },
  { text: "{n} zahlt {a} Euro. Das sind {b} Karten und {c} Euro Gebühr. Was kostet eine Karte?",
    op: "gemischt", a: [50, 400], b: [3, 12], c: [2, 20],
    rechne: (a, b, c) => (a - c) / b, passt: (a, b, c) => (a - c) > 0 && (a - c) % b === 0, einheit: "Euro" },
  { text: "Ein Rechteck hat {a} m Umfang. Eine Seite ist {b} m. Wie lang ist die andere?",
    op: "gemischt", a: [20, 200], b: [4, 40], c: [0, 0],
    rechne: (a, b) => a / 2 - b, passt: (a, b) => a % 2 === 0 && a / 2 - b > 0, einheit: "m" },
  // ★ „doppelt so alt" ohne Bezugswort wäre mehrdeutig - dreimal so alt wie
  // wer? Deshalb steht der Bezug im Satz und die Zeit danach.
  { text: "{n} ist {b} Jahre alt. Mama ist dreimal so alt. Wie alt ist Mama in {c} Jahren?",
    op: "gemischt", a: [0, 0], b: [8, 16], c: [2, 10],
    rechne: (_a, b, c) => 3 * b + c, passt: () => true },
  { text: "Eine Zahl minus {b} ist dreimal {c}. Wie heißt die Zahl?",
    op: "gemischt", a: [0, 0], b: [5, 60], c: [3, 30],
    rechne: (_a, b, c) => b + 3 * c, passt: () => true },
  { text: "{a} l kommen in {b} Kanister. {c} l bleiben übrig. Wie viel fasst ein Kanister?",
    op: "gemischt", a: [40, 400], b: [3, 10], c: [1, 15],
    rechne: (a, b, c) => (a - c) / b, passt: (a, b, c) => (a - c) > 0 && (a - c) % b === 0, einheit: "l" },
  { text: "Das Doppelte einer Zahl plus {b} ist {a}. Wie heißt die Zahl?",
    op: "gemischt", a: [20, 300], b: [4, 50], c: [0, 0],
    rechne: (a, b) => (a - b) / 2, passt: (a, b) => (a - b) > 0 && (a - b) % 2 === 0 },
];

/* ------------------------------------------------------------------ */
/* Stufe 8 - Alltag mit Schätzung und genauer Rechnung                  */
/* ------------------------------------------------------------------ */

const STUFE8: SachVorlage[] = [
  { text: "Ein Handy kostet {a} Euro. Dazu {b} % Steuer. Wie viel zahlt man?",
    op: "prozent", a: [100, 900], b: [10, 20], c: [0, 0],
    rechne: (a, b) => a + (a * b) / 100, passt: (a, b) => (a * b) % 100 === 0, einheit: "Euro" },
  { text: "{n} legt {a} Euro zu {b} % an. Wie viel ist nach einem Jahr da?",
    op: "prozent", a: [500, 9000], b: [1, 6], c: [0, 0],
    rechne: (a, b) => a + (a * b) / 100, passt: (a, b) => (a * b) % 100 === 0, einheit: "Euro" },
  { text: "Ein Auto braucht {b} l auf 100 km. Wie viel sind das auf {a} km?",
    op: "gemischt", a: [200, 900], b: [4, 9], c: [0, 0],
    rechne: (a, b) => (a * b) / 100, passt: (a, b) => (a * b) % 100 === 0, einheit: "l" },
  { text: "Das Zimmer ist {b} m lang und {c} m breit. Es ist {a} m hoch. Wie viel Luft ist darin?",
    op: "mal", a: [2, 4], b: [3, 8], c: [3, 7],
    rechne: (a, b, c) => a * b * c, einheit: "m^3" },
  { text: "{a} Menschen teilen {b} Euro gerecht. Wie viel bekommt einer?",
    op: "geteilt", a: [3, 25], b: [120, 9000], c: [0, 0],
    rechne: (a, b) => b / a, passt: (a, b) => b % a === 0, einheit: "Euro" },
  { text: "Der Preis fällt von {a} auf {b} Euro. Um wie viel Prozent ist das?",
    op: "prozent", a: [100, 100], b: [10, 90], c: [0, 0],
    rechne: (a, b) => ((a - b) * 100) / a, passt: (a, b) => a > b, einheit: "%" },
  { text: "Eine Rolle hat {a} m Draht. {n} schneidet {b} Stücke zu {c} m ab. Wie viel bleibt?",
    op: "gemischt", a: [50, 500], b: [3, 15], c: [2, 20],
    rechne: (a, b, c) => a - b * c, passt: (a, b, c) => a - b * c > 0, einheit: "m" },
  { text: "Ein Tank fasst {a} l. Er ist zu {b} % voll. Wie viele Liter fehlen?",
    op: "prozent", a: [50, 900], b: [20, 80], c: [0, 0],
    rechne: (a, b) => a - (a * b) / 100, passt: (a, b) => (a * b) % 100 === 0, einheit: "l" },
];

/** Alle Vorlagen, nach Paket. */
export const SACHAUFGABEN: Record<string, SachVorlage[]> = {
  "1-18": STUFE1,
  "2-21": STUFE2,
  "3-21": STUFE3,
  "4-18": STUFE4,
  "5-19": STUFE5,
  "6-24": STUFE6,
  "7-20": STUFE7,
  "8-20": STUFE8,
};

/** Für Wächter: zu welchen Paketen gibt es Geschichten? */
export function sachPakete(): string[] {
  return Object.keys(SACHAUFGABEN);
}

/**
 * Eine Rechengeschichte bauen.
 *
 * Die Zahlen werden so lange gezogen, bis sie zur Vorlage passen - eine
 * Minusaufgabe mit negativem Ergebnis wäre in der ersten Schulstufe keine
 * Aufgabe, sondern eine Falle.
 */
export function sachKern(paketId: string, rng: () => number): Geschichte {
  // ★ Englisch hat eigene, neu geschriebene Geschichten (`sachaufgabenEn.ts`); ohne
  // Probe-Schalter ist die Sprache immer `de` und nichts ändert sich.
  // Je Sprache eine Tabelle (Vorrat, Namen) - keine neue Weiche `=== "en" ?` je Sprache.
  const fremd: Partial<Record<string, { vorrat: Record<string, SachVorlage[]>; namen: string[] }>> = {
    en: { vorrat: SACHAUFGABEN_EN, namen: NAMEN_EN },
    fr: { vorrat: SACHAUFGABEN_FR, namen: NAMEN_FR },
    es: { vorrat: SACHAUFGABEN_ES, namen: NAMEN_ES },
  };
  const ihre = fremd[plusSprache()];
  const vorrat = (ihre?.vorrat ?? SACHAUFGABEN)[paketId];
  if (!vorrat?.length) throw new Error(`Für ${paketId} gibt es noch keine Rechengeschichten.`);
  const v = vorrat[Math.floor(rng() * vorrat.length)];
  const namen = ihre?.namen ?? NAMEN;
  const name = namen[Math.floor(rng() * namen.length)];

  const zieh = (): [number, number, number] => [
    ganz(rng, v.a[0], v.a[1]),
    ganz(rng, v.b[0], v.b[1]),
    v.c ? ganz(rng, v.c[0], v.c[1]) : 0,
  ];
  let [a, b, c] = zieh();
  for (let i = 0; i < 300 && v.passt && !v.passt(a, b, c); i++) [a, b, c] = zieh();
  if (v.passt && !v.passt(a, b, c)) throw new Error(`Keine passenden Zahlen für ${paketId}.`);

  const ergebnis = v.rechne(a, b, c);
  // Jeder Satz auf seine eigene Zeile - siehe oben. ★ Nie nach einer
  // Ordnungszahl („zum 80. Jahr"), siehe `saetzeUmbrechen`.
  const text = saetzeUmbrechen(
    // ★ Region (10.11.2026): Währung, Cent-Wort und ein paar Wörter - die Vorgaben (es, fr, be) ändern nichts.
    regionalerText(v.text, aktuelleRegion())
      .replace(/\{a\}/g, zahl(a))
      .replace(/\{b\}/g, zahl(b))
      .replace(/\{c\}/g, zahl(c))
      .replace(/\{n\}/g, name),
  );

  return {
    sorte: "direkt",
    geschichte: true,
    op: v.op,
    angabe: text,
    loesung: v.einheit ? `${zahl(ergebnis, v.nachkomma)} ${v.einheit}` : zahl(ergebnis, v.nachkomma),
    // Die Einheit darf fehlen - gerechnet ist gerechnet.
    auchRichtig: v.einheit ? [zahl(ergebnis, v.nachkomma)] : undefined,
    zahlen: v.c ? [a, b, c] : [a, b],
  };
}
