/**
 * DIE STAFFEL DER KLASSE - das Spiel, das man nicht allein gewinnt.
 * ============================================================================
 *
 * > **Johannes, 23.09.2026:** „staffel der klasse finde ich toll, gemeinsam an
 * > einer sache tüfteln kann genial sein, bitte lass uns das bauen"
 *
 * Eine Klasse bekommt jede Woche EINE Staffel: eine Reihe von Etappen und ein
 * verstecktes Wort. Wer eine Etappe läuft, deckt einen Buchstaben auf - nicht
 * den nächsten, sondern einen aus der Mitte, kreuz und quer. Wer das Wort
 * errät, bevor alle Etappen gelaufen sind, hat es für die ganze Klasse
 * erraten. Das ist das Tüfteln: Man kann raten, sobald man genug Buchstaben
 * hat, und man muss nicht warten, bis die Letzte fertig ist.
 *
 * ★★★★★ JEDE ETAPPE KOMMT IN DER STUFE DES KINDES, DAS SIE LÄUFT.
 *
 * Das ist die Entscheidung, an der alles hängt. Eine Staffel mit festen
 * Schwierigkeiten hätte die Klasse zerlegt: Das Kind der 2. Schulstufe käme an
 * der Etappe der 7. nicht vorbei, und die Staffel bliebe stehen - ausgerechnet
 * an dem Kind, das am wenigsten dafür kann. So aber ist die Etappe für alle
 * DIESELBE Etappe (sie deckt denselben Buchstaben auf), und die Rechnung
 * darin gehört dem Kind, das sie nimmt. Niemand rechnet unter seinem Niveau,
 * niemand steht vor einer Mauer, und beide haben gleich viel beigetragen.
 *
 * ★★★★ KEIN NAME, KEINE REIHUNG, KEINE ZEIT. Die Tafel der Klasse zeigt, wie
 * weit die KLASSE ist - nie, wer wie viel gelaufen ist. Wer zählen will, zählt
 * seine eigenen Etappen, und die stehen nur im eigenen Fortschritt.
 * Siehe [[feedback_nie_gegen_das_kind]].
 *
 * ⚠️ WAS DIE KLASSE TEILT, IST EINE ZAHL - sonst nichts. Der gemeinsame
 * Speicher trägt Klassencode, Woche und die Nummer der gelaufenen Etappe.
 * Keine Kennung, kein Name, kein Ergebnis. Ein Kind darf die Zeilen der
 * anderen Kinder nicht lesen - hier gibt es nichts zu lesen, was einem Kind
 * gehört. Genau daran ist die Staffel im September dreimal gescheitert, bevor
 * sie so gebaut wurde.
 */
import { erzeugeAufgabe, bedienbarePakete } from "./generator";
import { paketeDerStufe } from "./stoffplan";
import { zufall, type Aufgabe } from "./aufgabe";

/**
 * Die Wörter, die sich verstecken lassen. Alles Mathematik, alles aus dem
 * Unterricht, alles ohne Umlaut - ein Umlaut ist auf der Braillezeile EINE
 * Zelle, aber beim Raten eine Stolperstelle („HAELFTE" oder „HÄLFTE"?).
 */
export const WOERTER = [
  "SUMME", "PRODUKT", "QUOTIENT", "DIFFERENZ", "RECHNEN", "ZAHLEN",
  "TEILEN", "MESSEN", "DREIECK", "QUADRAT", "KREIS", "METER", "LITER",
  "GRAMM", "MINUTE", "STUNDE", "MUSTER", "REIHE", "DOPPELT", "ZEHNER",
  "HUNDERT", "TAUSEND", "PROZENT", "BRUCH", "WURZEL", "POTENZ", "RECHTECK",
  "SPIEGEL", "WUERFEL", "ZAEHLEN", "TEILER", "VIELFACHE", "NENNER", "ZAEHLER",
] as const;

/** Höchstens so viele Etappen läuft EIN Kind an EINEM Tag. */
export const ETAPPEN_JE_KIND_AM_TAG = 5;

export interface Staffel {
  /** Die Woche, für die sie gilt - `2026-KW39`. */
  woche: string;
  /** Das versteckte Wort. ⚠️ Steht im Code des Kindes; das ist Absicht. */
  wort: string;
  /** Wie viele Etappen die Klasse zu laufen hat. */
  anzahl: number;
  /**
   * Welcher Buchstabe bei welcher Etappe auffliegt - kreuz und quer, damit
   * man raten kann, statt nur zuzusehen. `reihenfolge[i]` ist die Stelle im
   * Wort, die nach der (i+1)-ten Etappe sichtbar wird.
   */
  reihenfolge: number[];
}

export interface Etappe {
  /** Die Nummer der Etappe - für alle dieselbe. */
  nr: number;
  /** Die Rechnung. ★ In der Stufe des Kindes, das sie läuft. */
  aufgabe: Aufgabe;
}

/** Eine Zahl aus einer Zeichenkette - damit dieselbe Klasse dieselbe Staffel bekommt. */
function saatAus(...teile: (string | number)[]): number {
  let h = 2166136261;
  for (const t of teile.join("|")) h = Math.imul(h ^ t.charCodeAt(0), 16777619);
  return h >>> 0;
}

/**
 * Die Staffel dieser Klasse in dieser Woche.
 *
 * ★ Sie wird gerechnet, nicht gespeichert: Klassencode und Woche ergeben
 * immer dasselbe Wort und dieselbe Reihenfolge. Damit braucht der gemeinsame
 * Speicher nur die Nummern der gelaufenen Etappen - und kein Kind kann die
 * Staffel der Klasse verstellen.
 */
export function staffelFuer(klasse: string, woche: string): Staffel {
  const rng = zufall(saatAus(klasse, woche));
  const wort = WOERTER[Math.floor(rng() * WOERTER.length)];
  // Zwei Etappen je Buchstabe: das Wort füllt sich stetig, und eine Klasse
  // hat eine Woche lang etwas davon.
  const anzahl = wort.length * 2;
  const stellen = wort.split("").map((_, i) => i);
  // Mischen (Fisher-Yates) - die Buchstaben fliegen verstreut auf.
  for (let i = stellen.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [stellen[i], stellen[j]] = [stellen[j], stellen[i]];
  }
  // Jede zweite Etappe deckt einen Buchstaben auf.
  const reihenfolge: number[] = [];
  for (let i = 0; i < anzahl; i++) reihenfolge.push(i % 2 === 1 ? stellen[(i - 1) / 2] : -1);
  return { woche, wort, anzahl, reihenfolge };
}

/**
 * Das Wort, so weit die Klasse es aufgedeckt hat: `_R_D_K_`.
 *
 * ★ Der Unterstrich ist auf der Braillezeile eine einzelne Zelle und steht
 * in jeder Schrift für dasselbe. Ein Punkt wäre ein Satzzeichen, ein
 * Sternchen ein Rechenzeichen.
 */
export function sichtbaresWort(s: Staffel, gelaufen: number[]): string {
  const offen = new Set<number>();
  for (const nr of gelaufen) {
    const stelle = s.reihenfolge[nr - 1];
    if (stelle !== undefined && stelle >= 0) offen.add(stelle);
  }
  return s.wort.split("").map((b, i) => (offen.has(i) ? b : "_")).join("");
}

/** Hat die Klasse die Staffel geschafft? */
export function geschafft(s: Staffel, gelaufen: number[], wortGeraten: boolean): boolean {
  return wortGeraten || gelaufen.length >= s.anzahl;
}

/** Stimmt das geratene Wort? Groß, klein und Leerzeichen sind egal. */
export function wortStimmt(s: Staffel, eingabe: string): boolean {
  return eingabe.trim().toUpperCase().replace(/\s+/g, "") === s.wort;
}

/**
 * Die nächste Etappe, die noch offen ist - die kleinste freie Nummer.
 *
 * ★ Die KLEINSTE, nicht eine zufällige: So läuft die Klasse die Staffel der
 * Reihe nach, und zwei Kinder, die gleichzeitig beginnen, treffen sich auf
 * derselben Etappe statt irgendwo. Dass zwei dieselbe laufen, ist kein
 * Schaden - der Buchstabe fliegt dann eben von zwei Seiten auf.
 */
export function offeneEtappe(s: Staffel, gelaufen: number[]): number | null {
  const fertig = new Set(gelaufen);
  for (let nr = 1; nr <= s.anzahl; nr++) if (!fertig.has(nr)) return nr;
  return null;
}

/**
 * Welche Pakete taugen für eine Etappe?
 *
 * ★ Eine Etappe ist EINE Zeile. Rechengeschichten und Fermi-Fragen gehören
 * nicht hierher - nicht weil sie zu schwer wären, sondern weil sie zu lang
 * sind: Wer eine Staffel läuft, soll den Stab weitergeben, nicht einen Text
 * lesen. Die gibt es in „Ich wähle" und im Training, wo Zeit dafür ist.
 */
function paketeFuerEtappe(stufe: number): string[] {
  const spielbar = new Set(bedienbarePakete());
  return paketeDerStufe(stufe)
    .filter((p) => spielbar.has(p.id) && p.art !== "sach" && p.arten.includes("ergebnis"))
    .map((p) => p.id);
}

/**
 * Die Rechnung für diese Etappe - in der Stufe des Kindes, das sie läuft.
 *
 * ⚠️ Dieselbe Etappe sieht für zwei Kinder verschieden aus. Das ist der Kern
 * der Sache und kein Fehler: Die Etappe ist für beide DIESELBE (sie deckt
 * denselben Buchstaben auf), die Rechnung darin gehört dem Kind.
 */
export function etappeFuer(klasse: string, woche: string, nr: number, stufe: number): Etappe | null {
  const pakete = paketeFuerEtappe(stufe);
  if (!pakete.length) return null;
  const rng = zufall(saatAus(klasse, woche, nr, stufe));
  // Ein paar Anläufe: nicht jedes Paket gibt jede Form her.
  for (let versuch = 0; versuch < 8; versuch++) {
    const id = pakete[Math.floor(rng() * pakete.length)];
    try {
      return { nr, aufgabe: erzeugeAufgabe(id, "ergebnis", rng) };
    } catch { /* nächstes Paket */ }
  }
  return null;
}

/**
 * Der Satz über der Staffel - kurz, und er sagt nur etwas über die Klasse.
 */
export function stand(s: Staffel, gelaufen: number[], wortGeraten: boolean): string {
  if (geschafft(s, gelaufen, wortGeraten)) return `Geschafft! Das Wort war ${s.wort}.`;
  const wort = sichtbaresWort(s, gelaufen);
  return `${gelaufen.length} von ${s.anzahl} Etappen. Das Wort: ${wort}`;
}
