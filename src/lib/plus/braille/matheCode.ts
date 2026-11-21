/**
 * ════════════════════════════════════════════════════════════════════════════
 * DIE SCHNITTSTELLE „MATHE-CODE" (Bauplan 2026-11-06 §5 Nr. 2; Befund
 * `BEFUND-2026-11-07-PLUS-MATHE-CODES.md` §6)
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Jede Sprache von Plus hat einen Mathe-Code: de die Marburger
 * Mathematikschrift, en UEB Technical; es (CMU Iberoamérica), br (CMU
 * Português) und sv (MTM) kommen als eigene Dateien dazu.
 *
 * ★ `marburger.ts` bleibt, wie es ist (Wächter: `git diff` leer). `marburgCode`
 *   hängt sich nur an seine drei Ausgänge - und tauscht die deutschen Sätze der
 *   Hinweise gegen die Texttabelle der Sprache (für Deutsch derselbe Wortlaut).
 * ★ Jeder Code hat seinen EIGENEN Automaten (`ueb.ts`, später `cmuEs.ts` ...).
 *   Kein gemeinsames Tabellenfeld: dieselbe Zelle heißt je Code etwas anderes
 *   (Befund §6).
 * ★ Die Plus-Zeile bleibt die Mitte (`48 +27 =75`): Das Lesen übersetzt Zellen
 *   in sie, das Schreiben sie in Zellen. Nur das Dezimalzeichen wechselt.
 *
 * Was ein neuer Code liefern muss, steht im Bericht von Schritt 4 (en) und
 * unten in `MatheCode`.
 */
import type { Lang } from "@/lib/typing/account";
import { de as texteDe } from "../texte/de";
import type { PlusHinweise } from "../texte/typ";
import { leseMarburger, marburgerZuText, schreibeMarburger, type Hinweis, type Lesemodus, type Lesung } from "./marburger";
import { leseUeb, schreibeUeb, uebZuText, UEB_ZEICHEN } from "./ueb";
import { frZuText, FR_ZEICHEN, leseFr, schreibeFr } from "./mathFr";
import { CMU_ES_ZEICHEN, cmuEsZuText, leseCmuEs, schreibeCmuEs } from "./cmuEs";

export type { Hinweis, Lesemodus, Lesung };

export type MatheCodeId = "marburg" | "ueb" | "nmb-fr" | "cmu-es" | "cmu-br" | "mtm-sv";

export interface MatheZeichen {
  konstrukt: string;
  zellen: string;
  /** Dokument + gedruckte Seite. */
  quelle: string;
  /** Eine Plus-Zeile, die genau dieses Zeichen schreibt - der Wächter prüft `schreibe(zeile)` darauf. */
  zeile?: string;
}

export interface MatheCode {
  id: MatheCodeId;
  /** Sprache der Oberfläche, für die dieser Code gilt. */
  sprache: Lang;
  /** Dezimalzeichen der Plus-Zeile UND der Prüfung (de/es/br/sv ",", en "."). */
  dezimalzeichen: "," | ".";
  /** Zellen -> Plus-Zeile. Hinweise in der Sprache des Kindes (Texttabelle). */
  lese(zellen: string, modus?: Lesemodus, hinweise?: PlusHinweise): Lesung;
  /** Plus-Zeile -> Zellen, `null` wenn der Code die Zeile nicht kann (Wörter, Lücke, nicht Belegtes). */
  schreibe(zeile: string): string | null;
  zuText(zellen: string, modus?: Lesemodus): string;
  /** Was der Code NICHT kennt - der Wächter misst es, statt es zu behaupten. */
  kann: {
    /** `[]`: es gibt keine Zelle; die Eingabe streicht die Klammern und setzt die Marke in die Lücke. */
    luecke: boolean;
    /** `158 (1 Rest)`: in keiner Norm. */
    rest: boolean;
    verhaeltnisDoppelpunkt: boolean;
    /** Das Zahlzeichen muss nach jedem Leerzeichen neu stehen. */
    zahlzeichenWiederholt: boolean;
    /** Buchstaben, Variable, Einheiten (`cm`). */
    buchstaben: boolean;
    /** Hochzahl und Wurzel. */
    potenzUndWurzel: boolean;
    /** Vorzeichen (`-5`). */
    vorzeichen: boolean;
  };
  /** Tabelle Konstrukt -> Zelle, zum Prüfen gegen die Norm (Wächter). */
  zeichen: ReadonlyArray<MatheZeichen>;
}

/** Den deutschen Satz eines Hinweises (Marburg) gegen die Texttabelle tauschen. */
function hinweisSatz(satz: string, hinweise: PlusHinweise): string {
  const schluessel = (Object.keys(texteDe.hinweise) as Array<keyof PlusHinweise>).find((k) => texteDe.hinweise[k] === satz);
  return schluessel ? hinweise[schluessel] : satz;
}

const BSKDL = "BSKDL, Das System der Mathematikschrift in der Deutschen Brailleschrift, 1. Aufl. 2015";

/** Marburger Mathematikschrift - unverändert, nur umhüllt. */
export const marburgCode: MatheCode = {
  id: "marburg",
  sprache: "de",
  dezimalzeichen: ",",
  lese: (zellen, modus = "streng", hinweise = texteDe.hinweise) => {
    const l = leseMarburger(zellen, modus);
    return { text: l.text, hinweise: l.hinweise.map((h) => ({ stelle: h.stelle, text: hinweisSatz(h.text, hinweise) })) };
  },
  schreibe: schreibeMarburger,
  zuText: marburgerZuText,
  kann: {
    luecke: false, rest: false, verhaeltnisDoppelpunkt: false, zahlzeichenWiederholt: true,
    buchstaben: true, potenzUndWurzel: true, vorzeichen: true,
  },
  zeichen: [
    { konstrukt: "Plus", zellen: "⠖", quelle: `${BSKDL}, Kap. 5`, zeile: "1 +1" },
    { konstrukt: "Minus", zellen: "⠤", quelle: `${BSKDL}, Kap. 5`, zeile: "1 -1" },
    { konstrukt: "Mal Punkt", zellen: "⠄", quelle: `${BSKDL}, Kap. 5 Z. 2511`, zeile: "1 *1" },
    { konstrukt: "Geteilt", zellen: "⠒", quelle: `${BSKDL}, Kap. 5 Z. 2512`, zeile: "1 /1" },
    { konstrukt: "Gleich", zellen: "⠶", quelle: `${BSKDL}, Kap. 5`, zeile: "1 =1" },
    { konstrukt: "Zahlzeichen", zellen: "⠼", quelle: `${BSKDL}, Kap. 2.1.1`, zeile: "1" },
    { konstrukt: "Dezimalkomma", zellen: "⠂", quelle: `${BSKDL}, Kap. 2.1.3`, zeile: "2,5" },
  ],
};

/** UEB Technical (Englisch). Quellen und Lücken: Kopf von `ueb.ts`. */
export const uebCode: MatheCode = {
  id: "ueb",
  sprache: "en",
  dezimalzeichen: ".",
  lese: (zellen, _modus, hinweise = texteDe.hinweise) => {
    const l = leseUeb(zellen);
    return { text: l.text, hinweise: l.hinweise.map((h) => ({ stelle: h.stelle, text: hinweise[h.schluessel] })) };
  },
  schreibe: schreibeUeb,
  zuText: (zellen) => uebZuText(zellen),
  kann: {
    luecke: false, rest: false, verhaeltnisDoppelpunkt: false, zahlzeichenWiederholt: true,
    buchstaben: false, potenzUndWurzel: false, vorzeichen: false,
  },
  zeichen: UEB_ZEICHEN,
};

/** Notation mathématique braille (Französisch). Quellen und Lücken: Kopf von `mathFr.ts`. */
export const nmbFrCode: MatheCode = {
  id: "nmb-fr",
  sprache: "fr",
  dezimalzeichen: ",",
  lese: (zellen, _modus, hinweise = texteDe.hinweise) => {
    const l = leseFr(zellen);
    return { text: l.text, hinweise: l.hinweise.map((h) => ({ stelle: h.stelle, text: hinweise[h.schluessel] })) };
  },
  schreibe: schreibeFr,
  zuText: (zellen) => frZuText(zellen),
  kann: {
    luecke: false, rest: false, verhaeltnisDoppelpunkt: false, zahlzeichenWiederholt: false,
    buchstaben: false, potenzUndWurzel: false, vorzeichen: false,
  },
  zeichen: FR_ZEICHEN,
};

/** Código Matemático Unificado para Iberoamérica (Spanisch). Quellen und Lücken: Kopf von `cmuEs.ts`. */
export const cmuEsCode: MatheCode = {
  id: "cmu-es",
  sprache: "es",
  dezimalzeichen: ",",
  lese: (zellen, _modus, hinweise = texteDe.hinweise) => {
    const l = leseCmuEs(zellen);
    return { text: l.text, hinweise: l.hinweise.map((h) => ({ stelle: h.stelle, text: hinweise[h.schluessel] })) };
  },
  schreibe: schreibeCmuEs,
  zuText: (zellen) => cmuEsZuText(zellen),
  kann: {
    luecke: false, rest: false, verhaeltnisDoppelpunkt: false, zahlzeichenWiederholt: true,
    buchstaben: false, potenzUndWurzel: false, vorzeichen: false,
  },
  zeichen: CMU_ES_ZEICHEN,
};

/** Die fertigen Codes. es (`cmu-es`), br (`cmu-br`), sv (`mtm-sv`) tragen sich hier ein. */
export const MATHE_CODES: Readonly<Partial<Record<MatheCodeId, MatheCode>>> = {
  marburg: marburgCode,
  ueb: uebCode,
  "nmb-fr": nmbFrCode,
  "cmu-es": cmuEsCode,
};

const CODE_JE_SPRACHE: Readonly<Partial<Record<Lang, MatheCodeId>>> = { de: "marburg", en: "ueb", fr: "nmb-fr", es: "cmu-es" };

/** Der Mathe-Code einer Sprache. Wirft für Sprachen ohne Code - nie still Marburg. */
export function matheCodeFuer(sprache: Lang): MatheCode {
  const id = CODE_JE_SPRACHE[sprache];
  const code = id ? MATHE_CODES[id] : undefined;
  if (!code) throw new Error(`Für ${sprache} gibt es noch keinen Mathe-Code in Plus.`);
  return code;
}
