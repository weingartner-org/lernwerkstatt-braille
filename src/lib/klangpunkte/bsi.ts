/**
 * Braille-Bildschirmeingabe (BSI) von VoiceOver → Zellen.
 *
 * Die BSI schreibt KEINE Punkte in die Seite, sondern TEXT: Sie übersetzt jede
 * getippte Zelle mit der eingestellten Brailletabelle (Deutsch Vollschrift,
 * Deutsch Kurzschrift, UEB ...) in Buchstaben. Für Noten müssen wir den Weg
 * zurückgehen: Text → die Zelle, die das Kind getippt hat.
 *
 * ★ Das ist eine Umkehrung mit Lücken, und sie ist am Gerät ungeprüft:
 *  - Muster, für die die Tabelle keinen Buchstaben hat, kommen vielleicht
 *    gar nicht oder als Sonderzeichen an (Oktavzeichen 4, 45, 5, 46 ...).
 *  - Ein Zahlzeichen (3456) und ein Großschreibzeichen (46) erzeugen selbst
 *    keinen Text, sondern verändern das NÄCHSTE Zeichen.
 * Darum zeigt die Eingabe unter „Brailleeingabe testen", was wirklich
 * ankommt - daraus wird die Tabelle dann fest gemacht.
 *
 * Reine Logik, ohne React. Erwartet wird ein Ereignis je Zelle (BSI liefert
 * pro Zelle ein `input`-Ereignis).
 */
import { BLANK, dots, type Cell } from "@/lib/braille/cell";
import {
  CAPS_LETTER,
  CONTRACTIONS_VOLL,
  DIGIT_CELLS,
  LETTERS_6,
  MULTI_SYMBOLS_6,
  NUMSIGN,
  SYMBOLS_6,
} from "@/lib/braille/tables";

export interface BsiKontext {
  /** Das vorige Zeichen war eine Ziffer: kein neues Zahlzeichen davor. */
  zifferLaeuft: boolean;
}

/** Eine erkannte Einheit: die Textlänge, die sie verbraucht hat, und ihre Zellen.
 *  Eine Lautgruppe ("ch") oder ein Grossbuchstabe (2 Zellen: Ankündigung +
 *  Buchstabe) ist EINE Einheit - wichtig fürs Löschen: Eine Rücktaste, die nur
 *  EIN Zeichen aus dem Text nimmt, muss die ganze Einheit rückgängig machen,
 *  nicht bloss einen Bruchteil ihrer Zellen. */
export interface BsiEinheit {
  text: string;
  cells: Cell[];
}

export interface BsiErgebnis {
  cells: Cell[];
  /** Wie `cells`, aber nach Einheiten gruppiert - Grundlage fürs Löschen. */
  einheiten: BsiEinheit[];
  /** Zeichen, für die keine Zelle bekannt ist (als Text, zur Anzeige). */
  unbekannt: string[];
  kontext: BsiKontext;
}

export const BSI_ANFANG: BsiKontext = { zifferLaeuft: false };

/**
 * Zeichen, die die deutsche liblouis-Tabelle (de-chardefs6.cti) EINZELNEN
 * Zellen zuordnet, die weder Buchstabe noch Satzzeichen unserer Übungen sind.
 * Für Noten gebraucht: 12346 (e halbe/ganze ...), 123456, 12356, 23456.
 * ⚠ Aus liblouis übernommen, nicht aus Apples eigener Tabelle - ob VoiceOver
 * diese Zeichen so liefert, zeigt erst die Messung am Gerät.
 */
const EXTRA_ZEICHEN: Record<string, Cell> = {
  "%": dots(1, 2, 3, 4, 5, 6),
  "&": dots(1, 2, 3, 4, 6),
  "{": dots(1, 2, 3, 5, 6),
  "}": dots(2, 3, 4, 5, 6),
  "|": dots(3, 4),
  "#": dots(3, 4, 5, 6),
};

const IST_GROSS = /\p{Lu}/u;
const IST_ZIFFER = /^[0-9]$/;

/** Braille-Muster als Unicode (U+2800 bis U+28FF) - falls eine Tabelle sie direkt liefert. */
function alsBrailleUnicode(ch: string): Cell | null {
  const cp = ch.codePointAt(0);
  if (cp === undefined || cp < 0x2800 || cp > 0x28ff) return null;
  return cp - 0x2800;
}

/**
 * Was ein einzelnes BSI-Ereignis (`data` des input-Ereignisses) an Zellen
 * bedeutet. Ein Ereignis ist meist ein Zeichen, bei Lautgruppen der
 * Vollschrift ("ch", "sch", "au" ...) aber EINE Zelle mit mehreren Buchstaben.
 */
export function bsiZuZellen(text: string, kontext: BsiKontext = BSI_ANFANG): BsiErgebnis {
  const cells: Cell[] = [];
  const einheiten: BsiEinheit[] = [];
  const unbekannt: string[] = [];
  let ziffer = kontext.zifferLaeuft;
  const zeichen = [...text];
  let i = 0;
  const einheit = (verbraucht: number, einheitCells: Cell[]) => {
    cells.push(...einheitCells);
    einheiten.push({ text: zeichen.slice(i, i + verbraucht).join(""), cells: einheitCells });
  };

  while (i < zeichen.length) {
    const ch = zeichen[i];

    if (ch === " " || ch === " ") {
      einheit(1, [BLANK]);
      ziffer = false;
      i++;
      continue;
    }

    const braille = alsBrailleUnicode(ch);
    if (braille !== null) {
      einheit(1, [braille]);
      ziffer = false;
      i++;
      continue;
    }

    if (IST_ZIFFER.test(ch)) {
      einheit(1, ziffer ? [DIGIT_CELLS[Number(ch)]] : [NUMSIGN, DIGIT_CELLS[Number(ch)]]);
      ziffer = true;
      i++;
      continue;
    }

    // Lautgruppe der Vollschrift (längste zuerst) - nur, wenn sie ab hier steht.
    const rest = zeichen.slice(i).join("").toLowerCase();
    const gruppe = CONTRACTIONS_VOLL.find((c) => rest.startsWith(c.seq));
    if (gruppe) {
      const vor = IST_GROSS.test(ch) ? [CAPS_LETTER] : [];
      einheit(gruppe.seq.length, [...vor, gruppe.cell]);
      ziffer = false;
      i += gruppe.seq.length;
      continue;
    }

    const klein = ch.toLowerCase();
    if (Object.hasOwn(LETTERS_6, klein)) {
      const vor = IST_GROSS.test(ch) ? [CAPS_LETTER] : [];
      einheit(1, [...vor, LETTERS_6[klein]]);
      ziffer = false;
      i++;
      continue;
    }

    if (Object.hasOwn(EXTRA_ZEICHEN, ch)) {
      einheit(1, [EXTRA_ZEICHEN[ch]]);
      ziffer = false;
      i++;
      continue;
    }

    if (Object.hasOwn(MULTI_SYMBOLS_6, ch)) {
      einheit(1, [...MULTI_SYMBOLS_6[ch]]);
      ziffer = false;
      i++;
      continue;
    }

    if (Object.hasOwn(SYMBOLS_6, ch)) {
      einheit(1, [SYMBOLS_6[ch]]);
      // Komma und Punkt innerhalb einer Zahl lassen die Zahl weiterlaufen.
      if (!(ziffer && (ch === "," || ch === "."))) ziffer = false;
      i++;
      continue;
    }

    unbekannt.push(ch);
    ziffer = false;
    i++;
  }

  return { cells, einheiten, unbekannt, kontext: { zifferLaeuft: ziffer } };
}

/** Wie viele der 63 6-Punkt-Muster (1 bis 63) lassen sich über Text erreichen? */
export function bsiErreichbareMuster(): Set<Cell> {
  const menge = new Set<Cell>();
  const eingaben: string[] = [
    ...Object.keys(LETTERS_6),
    ...Object.keys(SYMBOLS_6),
    ...Object.keys(MULTI_SYMBOLS_6),
    ...Object.keys(EXTRA_ZEICHEN),
    ...CONTRACTIONS_VOLL.map((c) => c.seq),
    "0123456789",
    "A",
  ];
  for (const e of eingaben) {
    for (const c of bsiZuZellen(e).cells) if (c !== BLANK) menge.add(c);
  }
  return menge;
}
