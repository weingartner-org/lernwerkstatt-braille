/**
 * ════════════════════════════════════════════════════════════════════════════
 * SUCHAUFGABEN - „wo steht es?" und „wie oft?" (23.09.2026)
 * ════════════════════════════════════════════════════════════════════════════
 *
 * REINE DATEN UND RECHNUNG - kein React, kein Storage, keine ARIA-Logik.
 *
 * Vorbild: Punktum-Kurs des DBSV. Von seinen 18 Aufgabentypen sind fünf
 * Suchaufgaben („Zeichen finden", „verstecktes Zeichen", „Zeichen im Wort
 * finden" …); Punktgenau hatte bisher nur Schreiben und Lesen. Die Idee ist
 * übernommen, das Material ist unseres.
 *
 * ★★★ WARUM DAS KEINE DRITTE RICHTUNG IST: `direction` steht an 17 Stellen als
 * `"write" | "read"` - im gespeicherten Lernstand, in der Telemetrie und in der
 * Lesezeit-Rechnung, die NUR aus Lese-Aufgaben lernt (`lesezeit.ts`). Eine
 * Suchaufgabe IST eine Lese-Aufgabe, nur mit einer anderen Frage: nicht „was
 * steht da", sondern „wo steht es". Deshalb bleibt `direction` unangetastet -
 * die Suchaufgabe ist eine Eigenschaft der Aufgabe, nicht des Programms.
 *
 * ★ DIE SCHWIERIGKEIT KOMMT AUS DEM PUNKTABSTAND, nicht aus einer Liste.
 * Punktum steigert seine Unterscheidungsübungen so: erst Zeichen, die sich
 * deutlich unterscheiden, „ab Seite 8 unterscheiden sich manche der Zeichen nur
 * noch in einem einzigen Braille-Punkt". Weil eine Zelle bei uns eine Zahl ist
 * (ein Bit je Punkt), lässt sich dieser Abstand ausrechnen statt aufschreiben -
 * er gilt damit für jedes Zeichen jedes Systems, auch für künftige.
 *
 * ⚠️ Die Zellen kommen NIE aus dieser Datei. Sie wird mit fertigen Zellen
 * gefüttert (aus der Engine oder aus liblouis) und ordnet sie nur an.
 */
import type { Cell } from "./cell";

/** Zwei Arten von Suchaufgabe - beide werden mit einer ZAHL beantwortet. */
export type SuchArt = "position" | "anzahl";

export interface SuchEinheit {
  /** Druckschrift-Form, z. B. "a" oder "ei". */
  print: string;
  /** Die Zelle(n) dazu - aus der Engine, nie von Hand. */
  cells: Cell[];
}

export interface Suchaufgabe {
  art: SuchArt;
  /** Die Reihe, die das Kind abtastet. */
  reihe: SuchEinheit[];
  /** Das gesuchte Zeichen. */
  ziel: SuchEinheit;
  /** Die richtige Antwort - bei "position" 1-basiert, bei "anzahl" die Menge. */
  loesung: number;
  /** Die Frage im Klartext (Du-Ansprache). */
  frage: string;
}

/**
 * Wie viele Punkte unterscheiden zwei Zellen? Eine Zelle ist eine Zahl mit
 * einem Bit je Punkt - der Abstand ist die Zahl der gesetzten Bits in der
 * Differenz (Hamming-Abstand).
 *
 * 0 = dieselbe Zelle · 1 = der schwerste Fall (ein Punkt Unterschied,
 * z. B. e ⠑ gegen i ⠊ ist 2, aber a ⠁ gegen b ⠃ ist 1).
 */
export function punktAbstand(a: Cell, b: Cell): number {
  let v = (a ^ b) & 0xff;
  let n = 0;
  while (v) {
    n += v & 1;
    v >>= 1;
  }
  return n;
}

/** Abstand zweier Einheiten: die kleinste Zell-Differenz, die vorkommt. */
export function einheitsAbstand(a: SuchEinheit, b: SuchEinheit): number {
  if (a.cells.length !== b.cells.length) return 8; // verschieden lang = leicht
  let summe = 0;
  for (let i = 0; i < a.cells.length; i++) summe += punktAbstand(a.cells[i], b.cells[i]);
  return summe;
}

/**
 * Die Ablenker zu einem Ziel, vom SCHWERSTEN zuerst: je kleiner der
 * Punktabstand, desto schwerer die Unterscheidung. Das Ziel selbst ist nie
 * dabei (Abstand 0), sonst stünde es zweimal in der Reihe.
 */
export function ablenkerNachSchwierigkeit(
  ziel: SuchEinheit,
  auswahl: readonly SuchEinheit[],
): SuchEinheit[] {
  return auswahl
    .filter((e) => e.print !== ziel.print && einheitsAbstand(e, ziel) > 0)
    .map((e) => ({ e, d: einheitsAbstand(e, ziel) }))
    .sort((x, y) => x.d - y.d || x.e.print.localeCompare(y.e.print))
    .map((x) => x.e);
}

/**
 * Die Ablenker, die an dieser Stufe erlaubt sind.
 *
 * ⚠️ Die Stufe muss die MENGE einschränken, nicht nur die Reihenfolge: Gezogen
 * wird aus der Liste zufällig, eine Umsortierung wäre also wirkungslos gewesen.
 * Genau das war der erste Entwurf - der Wächter „Stufe 3 stellt nähere Ablenker
 * daneben als Stufe 1" hat ihn gefangen, bevor etwas darauf gebaut war.
 *
 * Aufgeteilt wird nach Punktabstand in Drittel: Stufe 3 bekommt das nächste
 * Drittel (schwer), Stufe 1 das fernste (leicht). Ist die Auswahl zu klein für
 * Drittel, bekommt jede Stufe wenigstens einen Ablenker - lieber eine etwas zu
 * leichte Aufgabe als gar keine.
 */
function ablenkerFuerStufe(
  ziel: SuchEinheit,
  auswahl: readonly SuchEinheit[],
  stufe: number,
): SuchEinheit[] {
  const sortiert = ablenkerNachSchwierigkeit(ziel, auswahl); // nah → fern
  if (sortiert.length <= 2) return sortiert;
  const drittel = Math.max(1, Math.floor(sortiert.length / 3));
  if (stufe >= 3) return sortiert.slice(0, drittel);
  if (stufe === 2) return sortiert.slice(drittel, drittel * 2);
  return sortiert.slice(drittel * 2);
}

export interface SuchOptionen {
  /** Alle Einheiten, die das Kind schon kennt - der Ablenker-Vorrat. */
  auswahl: readonly SuchEinheit[];
  /** Was gesucht wird. Muss in `auswahl` stehen. */
  ziel: SuchEinheit;
  art: SuchArt;
  /** 1 = leicht (weit auseinander), 2 = mittel, 3 = schwer (ein Punkt). */
  stufe?: 1 | 2 | 3;
  /** Länge der Reihe - Vorgabe 8, wie eine kurze Braillezeilen-Strecke. */
  laenge?: number;
  /** Zufall von aussen, damit Tests fest sind. */
  wuerfel?: () => number;
}

/**
 * Baut eine Suchaufgabe.
 *
 * ⚠️ Bei `art: "position"` steht das Ziel GENAU EINMAL in der Reihe - sonst
 * hätte die Frage „das wievielte Zeichen ist es" mehrere richtige Antworten,
 * und das Kind bekäme ein Rot für eine richtige Lösung.
 */
export function baueSuchaufgabe(opts: SuchOptionen): Suchaufgabe {
  const { auswahl, ziel, art } = opts;
  const stufe = opts.stufe ?? 1;
  const laenge = Math.max(2, opts.laenge ?? 8);
  const wuerfel = opts.wuerfel ?? Math.random;

  const ablenker = ablenkerFuerStufe(ziel, auswahl, stufe);
  if (ablenker.length === 0) {
    throw new Error(
      `Suchaufgabe: kein Ablenker für "${ziel.print}" - die Auswahl hat nur dieses Zeichen`,
    );
  }

  // Wie oft steht das Ziel in der Reihe?
  const treffer =
    art === "position" ? 1 : 1 + Math.floor(wuerfel() * Math.min(3, laenge - 1));

  // Plätze für die Treffer ziehen (ohne Wiederholung).
  const plaetze = new Set<number>();
  while (plaetze.size < treffer) plaetze.add(Math.floor(wuerfel() * laenge));

  const reihe: SuchEinheit[] = [];
  for (let i = 0; i < laenge; i++) {
    if (plaetze.has(i)) reihe.push(ziel);
    else reihe.push(ablenker[Math.floor(wuerfel() * ablenker.length)]);
  }

  const loesung =
    art === "position" ? Math.min(...plaetze) + 1 : treffer;
  const frage =
    art === "position"
      ? `Das wievielte Zeichen ist ${ziel.print}?`
      : `Wie oft steht ${ziel.print} in dieser Reihe?`;

  return { art, reihe, ziel, loesung, frage };
}

/**
 * Stimmt die Antwort? Angenommen wird die blosse Zahl - ein Kind, das „3."
 * oder „3 " tippt, hat die Aufgabe gelöst.
 *
 * ⚠️ Leere Eingabe ist NICHT richtig, auch wenn die Lösung 0 wäre: Sonst
 * bekäme ein Kind, das gar nichts eingibt, ein Grün.
 */
export function suchAntwortStimmt(aufgabe: Suchaufgabe, eingabe: string): boolean {
  const roh = eingabe.trim().replace(/[.,;:]+$/, "");
  if (!/^\d+$/.test(roh)) return false;
  return Number(roh) === aufgabe.loesung;
}

/** Die Reihe als echte Braillezeichen - für sr-only und Braillezeile. */
export function reiheAlsText(aufgabe: Suchaufgabe, alsUnicode: (c: Cell) => string): string {
  return aufgabe.reihe.map((e) => e.cells.map(alsUnicode).join("")).join("");
}
