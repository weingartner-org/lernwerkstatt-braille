/**
 * Plus - die Kerne: was gerechnet wird, noch ohne Form.
 *
 * Ein Kern ist die nackte Rechnung (48 und 27 und Plus ergibt 75). Welche
 * Gestalt daraus wird - Ergebnisaufgabe, Lücke, Zahlenfolge, Probe -,
 * entscheidet erst `formen.ts`. So braucht es nicht 161 Generatoren, sondern
 * gut zwei Dutzend Bauarten und eine Zuordnung.
 *
 * ★ Die Zahlen werden nicht blind gewürfelt. Zu jedem Paket steht im
 * Stoffplan, welche Strategie geübt wird - und die Strategie bestimmt, welche
 * Zahlen überhaupt taugen. „701 -698" lädt zum Ergänzen ein, „734 -251" nicht.
 * Ein Zufallsgenerator macht das Strategiepaket wertlos.
 */
import type { Aufgabenart } from "../aufgabe";
import { ganz, eines, type Operation } from "../aufgabe";

export type Kern =
  /** Eine Rechnung mit zwei Zahlen. */
  | {
      sorte: "rechnung"; op: Operation; a: number; b: number; ergebnis: number; rest?: number;
      /**
       * Welche Zahl wandert, wenn aus der Aufgabe ein operatives Päckchen wird
       * (5 +5, 6 +6, 7 +7 statt 5 +5, 6 +5, 7 +5). Ohne Angabe wandert a.
       */
      variiere?: "a" | "b" | "beide";
    }
  /** Eine Reihe von Zahlen mit fester Schrittweite. */
  | { sorte: "reihe"; op: Operation; glieder: number[]; schritt: number }
  /** Alles, was sich nicht als Rechnung schreiben lässt (Nachbarzahlen usw.). */
  | {
      sorte: "direkt"; op: Operation; angabe: string; loesung: string;
      auchRichtig?: string[]; zahlen: number[];
      /**
       * ★ Die Schreibweise ist hier der Lerngegenstand - siehe `Aufgabe`.
       * Nur beim Kürzen und Erweitern von Brüchen.
       */
      formZaehlt?: true;
      /**
       * ★ Weitere Fassungen derselben Sache - andere Frage, anderer Zugang.
       * Ohne sie liefert ein Paket in jeder Form dieselbe Frage, und genau das
       * ist die Eintönigkeit, die Plus vermeiden soll. Die Form wählt eine aus.
       */
      varianten?: { angabe: string; loesung: string; auchRichtig?: string[] }[];
      /**
       * ★ Das hier ist eine Rechengeschichte, kein gerechneter Term.
       * Die Form „sach" nimmt nur solche Kerne. Ohne diese Marke galten
       * Pakete als spielbar, die in Wahrheit `156 -127 =` unter dem Namen
       * „Sachaufgabe" auslieferten (gemessen 23.09.2026).
       */
      geschichte?: true;
      /**
       * ★ Dieser Kern IST bereits eine Aufgabe dieser Art - er braucht keine
       * Form, die ihn erst dazu macht. „3,20; 5,80; 1,40 / rund =" ist ein
       * Überschlag, „5 km = [] m" eine Umwandlung. Ohne diese Angabe müsste
       * die Form raten, und drei Formen lehnen einen fertigen Kern zu Recht
       * ab (siehe `formen.ts`).
       */
      eigeneArt?: Aufgabenart;
      /**
       * Bei Fermi-Aufgaben: der Bereich, in dem eine Schätzung gut ist.
       * Eine Fermi-Aufgabe hat keine eine richtige Antwort, sondern eine
       * Größenordnung.
       */
      bereich?: [number, number];
    };

export type Zufall = () => number;

/** Hat die Addition einen Zehnerübergang? */
export function mitUebergang(a: number, b: number): boolean {
  return (a % 10) + (b % 10) > 9;
}

/** Muss bei der Subtraktion über den Zehner zurückgegangen werden? */
export function mitRueckgang(a: number, b: number): boolean {
  return a % 10 < b % 10;
}

/* ------------------------------------------------------------------ */

export interface SummeP { min: number; max: number; aMin?: number; aMax?: number; bMin?: number; bMax?: number; summeMax?: number; uebergang?: boolean }

export function summe(rng: Zufall, p: SummeP): Kern {
  for (let versuch = 0; versuch < 200; versuch++) {
    const a = ganz(rng, p.aMin ?? p.min, p.aMax ?? p.max);
    const b = ganz(rng, p.bMin ?? p.min, p.bMax ?? p.max);
    if (p.summeMax !== undefined && a + b > p.summeMax) continue;
    if (p.uebergang !== undefined && mitUebergang(a, b) !== p.uebergang) continue;
    return { sorte: "rechnung", op: "plus", a, b, ergebnis: a + b };
  }
  throw new Error("summe: keine passenden Zahlen gefunden - Bedingungen prüfen");
}

export interface DifferenzP { min: number; max: number; aMin?: number; aMax?: number; bMin?: number; bMax?: number; uebergang?: boolean; negativErlaubt?: boolean }

export function differenz(rng: Zufall, p: DifferenzP): Kern {
  for (let versuch = 0; versuch < 200; versuch++) {
    const a = ganz(rng, p.aMin ?? p.min, p.aMax ?? p.max);
    const b = ganz(rng, p.bMin ?? p.min, p.bMax ?? p.max);
    if (!p.negativErlaubt && b > a) continue;
    if (p.uebergang !== undefined && mitRueckgang(a, b) !== p.uebergang) continue;
    return { sorte: "rechnung", op: "minus", a, b, ergebnis: a - b };
  }
  throw new Error("differenz: keine passenden Zahlen gefunden - Bedingungen prüfen");
}

export interface ProduktP { reihen: readonly number[]; bMin?: number; bMax: number; tauschen?: boolean }

export function produkt(rng: Zufall, p: ProduktP): Kern {
  const r = eines(rng, p.reihen);
  const b = ganz(rng, p.bMin ?? 1, p.bMax);
  const tausch = p.tauschen && rng() < 0.5;
  const a = tausch ? b : r;
  const zwei = tausch ? r : b;
  return { sorte: "rechnung", op: "mal", a, b: zwei, ergebnis: a * zwei, variiere: "a" };
}

export interface QuotientP { divisoren: readonly number[]; maxFaktor: number; rest?: boolean; aMin?: number; aMax?: number }

export function quotient(rng: Zufall, p: QuotientP): Kern {
  // ★ Der Dividend bleibt, wo der Stoffplan ihn haben will. Gemessen am
  // 23.09.2026: 2-17 („Dividend von 5 bis 20") stellte `24 /5`.
  let d = 0, f = 0, rest = 0, a = 0;
  for (let v = 0; v < 100; v++) {
    d = eines(rng, p.divisoren);
    f = ganz(rng, 1, p.maxFaktor);
    rest = p.rest ? ganz(rng, 1, d - 1) : 0;
    a = d * f + rest;
    if (a >= (p.aMin ?? 0) && a <= (p.aMax ?? Infinity)) break;
  }
  return p.rest
    ? { sorte: "rechnung", op: "geteilt", a, b: d, ergebnis: f, rest }
    : { sorte: "rechnung", op: "geteilt", a, b: d, ergebnis: f };
}

export interface ZerlegungP { ganzeZahl?: number; max: number }

/** n zerlegen: a plus wie viel ergibt n? */
export function zerlegung(rng: Zufall, p: ZerlegungP): Kern {
  const n = p.ganzeZahl ?? ganz(rng, 2, p.max);
  const a = ganz(rng, 1, n - 1);
  return { sorte: "rechnung", op: "plus", a, b: n - a, ergebnis: n };
}

export interface ErgaenzungP { ziel: "zehner" | "hunderter" | "tausender" | number; min: number; max: number }

/** Ergänzen: von a aus bis zum nächsten Zehner, Hunderter oder zu einer festen Zahl. */
export function ergaenzung(rng: Zufall, p: ErgaenzungP): Kern {
  const stufe = p.ziel === "zehner" ? 10 : p.ziel === "hunderter" ? 100 : p.ziel === "tausender" ? 1000 : 0;
  for (let versuch = 0; versuch < 200; versuch++) {
    const a = ganz(rng, p.min, p.max);
    const ziel = stufe ? Math.ceil((a + 1) / stufe) * stufe : (p.ziel as number);
    if (ziel <= a) continue;
    return { sorte: "rechnung", op: "plus", a, b: ziel - a, ergebnis: ziel };
  }
  throw new Error("ergaenzung: keine passenden Zahlen gefunden");
}

export function verdoppeln(rng: Zufall, p: { min: number; max: number }): Kern {
  const a = ganz(rng, p.min, p.max);
  return { sorte: "rechnung", op: "plus", a, b: a, ergebnis: 2 * a, variiere: "beide" };
}

export function halbieren(rng: Zufall, p: { min: number; max: number }): Kern {
  const h = ganz(rng, Math.ceil(p.min / 2), Math.floor(p.max / 2));
  return { sorte: "rechnung", op: "geteilt", a: 2 * h, b: 2, ergebnis: h, variiere: "a" };
}

export interface ZahlenreiheP { min: number; max: number; frage?: readonly ("vorgaenger" | "nachfolger" | "nachbarn" | "nachbarzehner")[] }

export function zahlenreihe(rng: Zufall, p: ZahlenreiheP): Kern {
  const frage = eines(rng, p.frage ?? ["vorgaenger", "nachfolger", "nachbarn"]);
  const z = ganz(rng, p.min + 1, p.max - 1);
  if (frage === "vorgaenger")
    return { sorte: "direkt", op: "zahlen", angabe: `Welche Zahl kommt vor ${z}?`, loesung: String(z - 1), zahlen: [z] };
  if (frage === "nachfolger")
    return { sorte: "direkt", op: "zahlen", angabe: `Welche Zahl kommt nach ${z}?`, loesung: String(z + 1), zahlen: [z] };
  if (frage === "nachbarzehner") {
    const unten = Math.floor(z / 10) * 10;
    return {
      sorte: "direkt", op: "zahlen",
      angabe: `Zwischen welchen Zehnern liegt ${z}?`,
      loesung: `${unten} und ${unten + 10}`,
      auchRichtig: [`${unten}, ${unten + 10}`, `${unten} ${unten + 10}`],
      zahlen: [z],
    };
  }
  return {
    sorte: "direkt", op: "zahlen",
    angabe: `Wie heißen die Nachbarn von ${z}?`,
    loesung: `${z - 1} und ${z + 1}`,
    auchRichtig: [`${z - 1}, ${z + 1}`, `${z - 1} ${z + 1}`],
    zahlen: [z],
  };
}

export interface SchritteP { von: number; bis: number; schritte: readonly number[]; glieder?: number }

export function schritte(rng: Zufall, p: SchritteP): Kern {
  const gewuenscht = p.glieder ?? 5;
  // ★ Nur Schrittweiten, mit denen die Reihe im Zahlenraum bleibt. Ohne diese
  // Prüfung lief „bis 20" mit Zehnerschritten bis 40.
  const passend = p.schritte.filter((s) => p.von + s * (gewuenscht - 1) <= p.bis);
  const s = passend.length ? eines(rng, passend) : Math.min(...p.schritte);
  const anzahl = Math.max(4, Math.min(gewuenscht, Math.floor((p.bis - p.von) / s) + 1));
  const maxStart = p.bis - s * (anzahl - 1);
  const start = ganz(rng, p.von, Math.max(p.von, maxStart));
  const glieder: number[] = [];
  for (let i = 0; i < anzahl; i++) glieder.push(start + i * s);
  return { sorte: "reihe", op: "zahlen", glieder, schritt: s };
}

export type PaarSorte = "tausch" | "umkehr" | "nachbar" | "verdoppeln1";
export interface PaarP { sorte: PaarSorte; min: number; max: number; summeMax?: number }

/**
 * Ein Aufgabenpaar: erst die bekannte Aufgabe, dann die, die man aus ihr
 * ableiten kann. Der Kern trägt die ZWEITE Aufgabe; die erste steht in der
 * Angabe davor, damit das Kind den Zusammenhang sieht.
 */
export function paar(rng: Zufall, p: PaarP): Kern {
  const a = ganz(rng, p.min, p.max);
  const b = ganz(rng, p.min, p.max);
  if (p.sorte === "tausch") {
    return { sorte: "direkt", op: "plus", angabe: `${a} +${b} =${a + b}\n${b} +${a} =`, loesung: String(a + b), zahlen: [b, a] };
  }
  if (p.sorte === "umkehr") {
    return { sorte: "direkt", op: "minus", angabe: `${a} +${b} =${a + b}\n${a + b} -${b} =`, loesung: String(a), zahlen: [a + b, b] };
  }
  if (p.sorte === "verdoppeln1") {
    return { sorte: "direkt", op: "plus", angabe: `${a} +${a} =${2 * a}\n${a} +${a + 1} =`, loesung: String(2 * a + 1), zahlen: [a, a + 1] };
  }
  const mehr = rng() < 0.5 ? 1 : -1;
  return { sorte: "direkt", op: "plus", angabe: `${a} +${b} =${a + b}\n${a} +${b + mehr} =`, loesung: String(a + b + mehr), zahlen: [a, b + mehr] };
}

/**
 * Kraft der Fünf: beide Zahlen liegen zwischen 5 und 9, die Summe geht über
 * zehn. Genau dann trägt der Weg „5 und 5 sind 10, dazu der Rest".
 */
export function kraftDerFuenf(rng: Zufall): Kern {
  const a = ganz(rng, 5, 9);
  const b = ganz(rng, 5, 9);
  return { sorte: "rechnung", op: "plus", a, b, ergebnis: a + b };
}

/** Zerlegen einer zweistelligen Zahl in Zehner und Einer. */
export function stellenZerlegung(rng: Zufall, p: { min: number; max: number }): Kern {
  const z = ganz(rng, p.min, p.max);
  const zehner = Math.floor(z / 10) * 10;
  const einer = z % 10;
  return {
    sorte: "direkt", op: "zahlen",
    angabe: `${z} = [] Zehner und [] Einer`,
    loesung: `${zehner / 10} und ${einer}`,
    auchRichtig: [`${zehner / 10}, ${einer}`, `${zehner / 10} ${einer}`],
    zahlen: [z],
  };
}

/** Verdoppeln oder halbieren, je nach Zufall - so steht es als ein Paket im Plan. */
export function verdoppelnHalbieren(rng: Zufall, p: { min: number; max: number }): Kern {
  return rng() < 0.5 ? verdoppeln(rng, p) : halbieren(rng, p);
}

/** Quadratzahlen: beide Faktoren gleich. */
export function quadratzahl(rng: Zufall, p: { max: number }): Kern {
  const a = ganz(rng, 1, p.max);
  return { sorte: "rechnung", op: "mal", a, b: a, ergebnis: a * a, variiere: "beide" };
}
