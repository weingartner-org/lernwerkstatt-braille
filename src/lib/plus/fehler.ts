/**
 * Denkfehler erkennen - und vor allem: sie nicht zu erkennen glauben.
 *
 * Grundlage: „Plus - Der Coach", Abschnitt „Wie Plus einen Denkfehler
 * erkennt", und die Fehlermuster des Stoffplans. Das Verfahren ist alt und
 * gut belegt (Brown & Burton, BUGGY/DEBUGGY): Jedes Muster ist eine kleine
 * Rechenvorschrift. Plus rechnet aus, was bei diesem Muster herauskäme, und
 * vergleicht mit dem, was das Kind geschrieben hat. 503 minus 8 mit der
 * Antwort 505 ist spaltenweise Unterschiedsbildung - eindeutig.
 *
 * ★★★ Der wichtigste Teil sind die Bremsen:
 *   · Nie auf eine einzelne falsche Antwort hin umsteuern.
 *   · Eine Vermutung fällt, sobald sie mehr als ein Drittel der Antworten
 *     falsch vorhersagt.
 *   · Ein Hinweis verfällt, wenn er sich wochenlang nicht bestätigt.
 *   · Etwa die Hälfte aller Kinder zeigt gar kein stabiles Muster. Plus
 *     rechnet damit und tut dann nichts Besonderes.
 *
 * ★ Kein Kind trägt ein Etikett. Was hier steht, ist eine Vermutung über eine
 * Rechnung, nicht eine Aussage über ein Kind - und sie hat ein Ablaufdatum.
 *
 * NICHT erkennbar und deshalb nicht gebaut: `zaehlendes_rechnen` (das ist ein
 * Zeitmuster, und Plus misst keine Zeit) und `verfahren_vermischt` (das zeigt
 * sich im Rechenweg, nicht im Ergebnis). Beides bleibt im Topf „unklar", und
 * der bleibt groß.
 */
import { normal, type Aufgabe } from "./aufgabe";
import { paket } from "./stoffplan";

/* ------------------------------------------------------------------ */
/* Was ein Muster vorhersagt                                            */
/* ------------------------------------------------------------------ */

/** Eine Vorhersage je Muster: was stünde da, wenn das Kind so dächte? */
type Vorhersage = (a: Aufgabe) => string[];

/** Die Ziffern einer Zahl, von hinten - Einer zuerst. */
function stellen(n: number): number[] {
  return [...String(Math.abs(Math.trunc(n)))].reverse().map(Number);
}

function ausStellen(s: number[]): number {
  return Number([...s].reverse().join("")) || 0;
}

const VORHERSAGEN: Record<string, Vorhersage> = {
  /**
   * Spaltenweise Unterschiedsbildung: stellenweise die kleinere von der
   * größeren Ziffer, egal in welcher Reihenfolge. 503 -8 ergibt 505.
   */
  umkehrfehler: (a) => {
    if (a.op !== "minus" || a.zahlen.length < 2) return [];
    const [x, y] = a.zahlen;
    if (x < 0 || y < 0) return [];
    const ox = stellen(x), oy = stellen(y);
    const aus: number[] = [];
    for (let i = 0; i < Math.max(ox.length, oy.length); i++) {
      aus.push(Math.abs((ox[i] ?? 0) - (oy[i] ?? 0)));
    }
    return [String(ausStellen(aus))];
  },

  /** Übertrag vergessen: das Ergebnis ist genau um eine Zehnerpotenz zu klein. */
  uebertrag: (a) => {
    const richtig = Number(normal(a.loesung).replace(",", "."));
    if (!Number.isFinite(richtig)) return [];
    return [10, 100, 1000].map((z) => String(richtig - z)).filter((s) => Number(s) >= 0);
  },

  /** Null-Fehler: 0 minus x wird 0, x minus 0 wird 0. */
  null_fehler: (a) => {
    if (a.op !== "minus" || a.zahlen.length < 2) return [];
    const [x, y] = a.zahlen;
    if (x < 0 || y < 0) return [];
    const ox = stellen(x), oy = stellen(y);
    const aus: number[] = [];
    for (let i = 0; i < Math.max(ox.length, oy.length); i++) {
      const o = ox[i] ?? 0, u = oy[i] ?? 0;
      aus.push(o === 0 || u === 0 ? 0 : Math.abs(o - u));
    }
    return [String(ausStellen(aus))];
  },

  /** Komma verrutscht: die Ziffern stimmen, der Faktor nicht. */
  komma: (a) => {
    const richtig = Number(normal(a.loesung).replace(",", "."));
    if (!Number.isFinite(richtig) || richtig === 0) return [];
    return [richtig * 10, richtig / 10, richtig * 100, richtig / 100]
      .map((z) => String(z).replace(".", ","));
  },

  /** Stellenzahl des Quotienten: eine Stelle zu wenig oder zu viel. */
  stellen_quotient: (a) => {
    if (a.op !== "geteilt") return [];
    const richtig = Number(normal(a.loesung).replace(",", "."));
    if (!Number.isFinite(richtig) || richtig === 0) return [];
    return [richtig * 10, richtig / 10].map((z) => String(z).replace(".", ","));
  },

  /** Zahlendreher: Zehner und Einer vertauscht. */
  stellenwert: (a) => {
    const richtig = Number(normal(a.loesung));
    if (!Number.isFinite(richtig) || Math.abs(richtig) < 10) return [];
    const s = stellen(richtig);
    [s[0], s[1]] = [s[1], s[0]];
    const gedreht = ausStellen(s);
    return gedreht === richtig ? [] : [String(gedreht)];
  },

  /** Nenner mitaddiert: aus 1/2 plus 1/3 wird 2/5. */
  gleichnamig: (a) => {
    const m = /^(\d+)\/(\d+) ([+\-])(\d+)\/(\d+) =$/.exec(a.angabe);
    if (!m) return [];
    const [, z1, n1, zeichen, z2, n2] = m;
    const z = zeichen === "+" ? Number(z1) + Number(z2) : Number(z1) - Number(z2);
    const n = zeichen === "+" ? Number(n1) + Number(n2) : Number(n1) - Number(n2);
    return n === 0 ? [] : [`${z}/${n}`];
  },

  /** Vorrangregel missachtet: von links nach rechts gerechnet. */
  vorrang: (a) => {
    const wert = vonLinksNachRechts(a.angabe);
    if (wert === null) return [];
    const richtig = Number(normal(a.loesung).replace(",", "."));
    return wert === richtig ? [] : [String(wert).replace(".", ",")];
  },
};

/**
 * Eine Rechenzeile stur von links nach rechts ausrechnen - das ist der Fehler,
 * den die Vorrangregel verhindert. `null`, wenn die Zeile keine reine
 * Zahlenrechnung ist.
 */
export function vonLinksNachRechts(angabe: string): number | null {
  const zeile = angabe.replace(/=\s*$/, "").trim();
  if (!/^\d+( [+\-*/]\d+)+$/.test(zeile)) return null;
  const teile = zeile.split(" ");
  let wert = Number(teile[0]);
  for (let i = 1; i < teile.length; i++) {
    const zeichen = teile[i][0];
    const zahl = Number(teile[i].slice(1));
    if (zeichen === "+") wert += zahl;
    else if (zeichen === "-") wert -= zahl;
    else if (zeichen === "*") wert *= zahl;
    else if (zeichen === "/") { if (zahl === 0) return null; wert /= zahl; }
  }
  return wert;
}

/** Alle Muster, für die Plus eine Vorhersage rechnen kann. */
export function berechenbareMuster(): string[] {
  return Object.keys(VORHERSAGEN);
}

/** Formen, deren Lösung kein Rechenergebnis ist - siehe `passendeMuster`. */
const OHNE_FEHLERMUSTER = new Set<Aufgabe["art"]>([
  "dreieck", "zahlenhaus", "zahlenkette", "malkreuz", "stoerenfried", "klecks",
  "ziffernkarten", "erfinden", "wege", "lesen", "stimmt_das", "knobel",
]);

/**
 * Welche Fehlermuster erklären genau diese falsche Antwort?
 *
 * Nur Muster, auf die das Paket ausdrücklich achtet - der Stoffplan nennt sie
 * je Paket. Ein Muster, das zufällig passt, aber zum Stoff nicht gehört,
 * erklärt nichts.
 */
export function passendeMuster(aufgabe: Aufgabe, antwort: string): string[] {
  // ★ Die Formen aus den neuen Büchern (26.09.2026) fragen nach einer Ziffer,
  // einem Namen, einer Zeilennummer oder einer von vielen Lösungen. Die
  // Vorhersagen hier rechnen mit `loesung` als Ergebnis der `zahlen` - bei
  // diesen Formen wäre jeder Treffer Zufall, und ein zufälliger Treffer ist
  // eine falsche Vermutung über ein Kind.
  if (OHNE_FEHLERMUSTER.has(aufgabe.art) || aufgabe.passt) return [];
  const erlaubt = new Set(paket(aufgabe.paket).fehler);
  const gegeben = normal(antwort);
  const treffer: string[] = [];
  for (const [name, vorhersage] of Object.entries(VORHERSAGEN)) {
    if (!erlaubt.has(name)) continue;
    if (vorhersage(aufgabe).some((v) => normal(v) === gegeben)) treffer.push(name);
  }
  return treffer;
}

/* ------------------------------------------------------------------ */
/* Die Vermutungen - und ihre Bremsen                                   */
/* ------------------------------------------------------------------ */

export interface Vermutung {
  muster: string;
  /** Wie oft die Vorhersage zutraf. */
  treffer: number;
  /** Wie oft sie danebenlag, obwohl sie etwas vorhersagte. */
  fehlschlaege: number;
  /** An wie vielen verschiedenen Tagen sie zutraf - „über mehrere Läufe". */
  tage: number[];
  /** Tagesnummer des letzten Treffers. */
  zuletzt: number;
}

/** Ab so vielen Beobachtungen wird eine Vermutung überhaupt bewertet. */
export const MINDESTENS = 4;

/** Mehr als ein Drittel falsche Vorhersagen - die Vermutung fällt. */
export const FEHLSCHLAG_GRENZE = 1 / 3;

/** Ohne Bestätigung verfällt ein Hinweis nach drei Wochen. */
export const VERFALL_TAGE = 21;

/** Erst ab drei Treffern an zwei verschiedenen Tagen ist es ein Muster. */
export const SYSTEMATISCH_AB = 3;

export type Schublade = "fluechtigkeit" | "systematisch" | "unklar";

/**
 * Drei Schubladen, mehr nicht.
 *
 * ★ Der Topf „unklar" ist groß und bleibt es. Etwa die Hälfte aller Kinder
 * zeigt gar kein stabiles Muster; wer da trotzdem eines findet, hat sich
 * etwas ausgedacht.
 */
export function schublade(v: Vermutung): Schublade {
  if (v.treffer >= SYSTEMATISCH_AB && v.tage.length >= 2) return "systematisch";
  if (v.treffer === 1) return "fluechtigkeit";
  return "unklar";
}

/** Hält diese Vermutung noch? */
export function haelt(v: Vermutung, heute: number): boolean {
  const gesamt = v.treffer + v.fehlschlaege;
  if (gesamt >= MINDESTENS && v.fehlschlaege / gesamt > FEHLSCHLAG_GRENZE) return false;
  if (heute - v.zuletzt > VERFALL_TAGE) return false;
  return true;
}

/**
 * Eine beantwortete Aufgabe einarbeiten - richtig oder falsch.
 *
 * ★ Auch die RICHTIGE Antwort zählt: Wenn ein Muster für diese Aufgabe etwas
 * vorhergesagt hätte und das Kind richtig gerechnet hat, hat das Muster
 * danebengelegen. Ohne diese Gegenprobe würde jede Vermutung ewig leben.
 */
export function nachAntwort(
  vermutungen: readonly Vermutung[],
  aufgabe: Aufgabe,
  antwort: string,
  richtig: boolean,
  tag: number,
): Vermutung[] {
  const erlaubt = new Set(paket(aufgabe.paket).fehler);
  const gegeben = normal(antwort);
  const stand = new Map(vermutungen.map((v) => [v.muster, { ...v, tage: [...v.tage] }]));

  for (const [name, vorhersage] of Object.entries(VORHERSAGEN)) {
    if (!erlaubt.has(name)) continue;
    const sagt = vorhersage(aufgabe).map(normal);
    if (!sagt.length) continue;                       // Das Muster sagt hier nichts.
    const trifft = !richtig && sagt.includes(gegeben);
    const v = stand.get(name) ?? { muster: name, treffer: 0, fehlschlaege: 0, tage: [], zuletzt: tag };
    if (trifft) {
      v.treffer++;
      v.zuletzt = tag;
      if (!v.tage.includes(tag)) v.tage.push(tag);
    } else {
      v.fehlschlaege++;
    }
    stand.set(name, v);
  }

  return [...stand.values()].filter((v) => haelt(v, tag));
}

/**
 * Worauf Plus jetzt eingeht - höchstens eines, und nur wenn es sitzt.
 *
 * ★ Nie auf eine einzelne falsche Antwort hin umsteuern. Was hier
 * herauskommt, hat sich über mehrere Läufe gezeigt.
 */
export function ernstZuNehmen(vermutungen: readonly Vermutung[], heute: number): Vermutung | null {
  const echte = vermutungen.filter((v) => haelt(v, heute) && schublade(v) === "systematisch");
  return echte.sort((a, b) => b.treffer - a.treffer)[0] ?? null;
}

/* ------------------------------------------------------------------ */
/* Was Plus dem Kind sagt                                               */
/* ------------------------------------------------------------------ */

/**
 * Ein Satz je Muster - kurz, in der Sprache der Schule, ohne Vorwurf.
 *
 * ★ Diese Sätze stehen in keiner Quelle; sie sind die üblichen Merksätze des
 * Rechenunterrichts, auf Plus-Länge gebracht. Sie kommen NUR, wenn sich ein
 * Muster über mehrere Läufe gezeigt hat - „keine Hinweise, die man sich
 * durchklicken kann, sonst übt das Kind das Durchklicken".
 */
const HINWEIS: Record<string, string> = {
  umkehrfehler: "Schau auf die Reihenfolge. Abgezogen wird von der oberen Zahl.",
  uebertrag: "Denk an den Übertrag.",
  null_fehler: "Die Null ist auch eine Ziffer.",
  komma: "Wo steht das Komma?",
  stellen_quotient: "Zähl die Stellen im Ergebnis.",
  stellenwert: "Zehner und Einer nicht vertauschen.",
  gleichnamig: "Nur die Zähler zusammenzählen. Der Nenner bleibt.",
  vorrang: "Punkt vor Strich.",
};

/** Der Satz zu einem Muster. Leer, wenn Plus dazu nichts zu sagen hat. */
export function hinweis(muster: string): string {
  return HINWEIS[muster] ?? "";
}

/**
 * Soll Plus bei DIESER Aufgabe etwas sagen?
 *
 * Nur wenn die Vermutung systematisch ist UND das Muster zu dieser Aufgabe
 * überhaupt passt. Ein Merksatz zur Bruchaddition unter einer Minusaufgabe
 * wäre schlimmer als gar keiner.
 */
export function hinweisFuer(
  vermutungen: readonly Vermutung[], aufgabe: Aufgabe, antwort: string, heute: number,
): string {
  const ernst = ernstZuNehmen(vermutungen, heute);
  if (!ernst) return "";
  if (!passendeMuster(aufgabe, antwort).includes(ernst.muster)) return "";
  return hinweis(ernst.muster);
}
