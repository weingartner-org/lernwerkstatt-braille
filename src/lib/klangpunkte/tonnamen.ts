/**
 * ════════════════════════════════════════════════════════════════════════════
 * KLANGPUNKTE: TONNAMEN, VORZEICHEN, NOTENWERTE UND MUSIKBEGRIFFE JE SPRACHE
 * (Bauplan 2026-11-06 §3 Nr. 2 und 3; Befund `BEFUND-2026-11-06-KLANGPUNKTE-BESTAND.md`)
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Die Brailleschrift der NOTEN ist international (New International Manual of
 * Braille Music Notation, Krolick 1996/97): c d e f g a h(b) sind in jedem Land
 * dieselben Zellen. Verschieden sind nur WORTE: wie der Ton heisst, wie das
 * Vorzeichen heisst, wie die Note und die Pause heissen, und die Fachwörter.
 * Diese Tabelle ist der einzige Ort dafür. `notation.ts` und die Texte holen
 * sich ihre Wörter von hier.
 *
 * ★ Deutsch ist der Bestand und bleibt Byte für Byte, wie er in `notation.ts`
 *   stand (Wächter `tests/klangpunkte-deutsch-unveraendert.test.tsx`).
 * ★ Die interne Tonbezeichnung bleibt `c d e f g a h` (so heisst der siebte Ton
 *   im Code, in den Liedern und im Spielstand). Nur die ANZEIGE ändert sich.
 * ★ Englisch ist en-GB (das Manual selbst schreibt: semibreve, minim, crotchet,
 *   quaver, semi-quaver - Table 1 A).
 * ★ Tonnamen-Systeme (Recherche §4): Buchstaben mit H: de cs pl hu sv.
 *   Buchstaben mit B: en nl (und für Akkordbuchstaben auch fr es it pt br).
 *   do-re-mi (fester Anker): fr es it pt br. Dazu bietet jede Sprache beide
 *   Schreibweisen an, wie Klangpunkte es heute auf Deutsch tut.
 * ★ Wörter, bei denen die Quelle nicht eindeutig ist, tragen im Befund den
 *   Vermerk „unsicher" (Abschnitt „Offene Fragen").
 */

/** Die zwölf Sprachen des Plans für Klangpunkte (de en fr es it | nl sv pt br pl cs hu). */
export type KlangSprache = "de" | "en" | "fr" | "es" | "it" | "nl" | "sv" | "pt" | "br" | "pl" | "cs" | "hu";

export const KLANG_SPRACHEN_PLAN: readonly KlangSprache[] = [
  "de", "en", "fr", "es", "it", "nl", "sv", "pt", "br", "pl", "cs", "hu",
];

type Ton = "c" | "d" | "e" | "f" | "g" | "a" | "h";
type Wert = "ganze" | "halbe" | "viertel" | "achtel" | "sechzehntel";

export type TonSystem = "buchstaben-h" | "buchstaben-b" | "do-re-mi";

/** Die Fachwörter, die Klangpunkte in Sätzen braucht (Grundform, kleingeschrieben). */
export interface Musikbegriffe {
  takt: string; // Takt (Zeiteinheit)
  taktstrich: string;
  pause: string; // Pause, Stille
  oktave: string;
  notenzeile: string; // Notenzeile / Notensystem
  notenschluessel: string;
  vorzeichen: string; // Oberbegriff für Kreuz, Be, Auflösung
  tonleiter: string;
  melodie: string;
  lied: string;
  punktiert: string; // punktierte Note
  haltebogen: string;
  bindebogen: string;
  taktart: string;
  akkord: string;
  lautstaerke: string;
  tempo: string;
  note: string; // „Note" allgemein (Zeichen)
  ton: string; // „Ton" (Klang)
}

export interface Tonnamen {
  system: TonSystem;
  /** Namen der sieben Stammtöne als Buchstaben (c d e f g a h bzw. c d e f g a b). */
  buchstaben: Record<Ton, string>;
  /** Namen mit festem do (c = do). */
  solmisation: Record<Ton, string>;
  /** Welche Schreibweise Kinder zuerst sehen. */
  standardStil: "buchstaben" | "solmisation";
  vorzeichen: { kreuz: string; be: string; aufloesung: string };
  /** Notenwert und Pause je Wert (Wörter, die gesprochen und angezeigt werden). */
  noten: Record<Wert, string>;
  pausen: Record<Wert, string>;
  begriffe: Musikbegriffe;
  /** Woher die Wörter stammen (Fachsprache, Norm, Lehrwerk) - Einzelheiten im Befund. */
  quelle: string;
}

const DO_RE_MI_DE: Record<Ton, string> = { c: "do", d: "re", e: "mi", f: "fa", g: "sol", a: "la", h: "si" };
const BUCHSTABEN_H: Record<Ton, string> = { c: "c", d: "d", e: "e", f: "f", g: "g", a: "a", h: "h" };
const BUCHSTABEN_B: Record<Ton, string> = { c: "C", d: "D", e: "E", f: "F", g: "G", a: "A", h: "B" };

export const TONNAMEN: Readonly<Record<KlangSprache, Tonnamen>> = {
  de: {
    system: "buchstaben-h",
    buchstaben: BUCHSTABEN_H,
    solmisation: DO_RE_MI_DE,
    standardStil: "buchstaben",
    vorzeichen: { kreuz: "Kreuz", be: "Be", aufloesung: "Auflösungszeichen" },
    noten: {
      ganze: "ganze Note", halbe: "halbe Note", viertel: "Viertelnote", achtel: "Achtelnote",
      sechzehntel: "Sechzehntelnote",
    },
    pausen: {
      ganze: "ganze Pause", halbe: "halbe Pause", viertel: "Viertelpause", achtel: "Achtelpause",
      sechzehntel: "Sechzehntelpause",
    },
    begriffe: {
      takt: "Takt", taktstrich: "Taktstrich", pause: "Pause", oktave: "Oktave", notenzeile: "Notenzeile",
      notenschluessel: "Notenschlüssel", vorzeichen: "Vorzeichen", tonleiter: "Tonleiter", melodie: "Melodie",
      lied: "Lied", punktiert: "punktiert", haltebogen: "Haltebogen", bindebogen: "Bindebogen", taktart: "Taktart",
      akkord: "Akkord", lautstaerke: "Lautstärke", tempo: "Tempo", note: "Note", ton: "Ton",
    },
    quelle: "Bestand von Klangpunkte (deutsche Musiklehre, wie in der Schule und im Verband Deutscher Musikschulen üblich).",
  },

  en: {
    system: "buchstaben-b",
    buchstaben: BUCHSTABEN_B,
    solmisation: DO_RE_MI_DE, // „do re mi fa sol la ti": Das siebte Wort ist im englischen Sprachraum „ti"
    standardStil: "buchstaben",
    vorzeichen: { kreuz: "sharp", be: "flat", aufloesung: "natural" },
    noten: {
      ganze: "semibreve", halbe: "minim", viertel: "crotchet", achtel: "quaver", sechzehntel: "semiquaver",
    },
    pausen: {
      ganze: "semibreve rest", halbe: "minim rest", viertel: "crotchet rest", achtel: "quaver rest",
      sechzehntel: "semiquaver rest",
    },
    begriffe: {
      takt: "bar", taktstrich: "bar line", pause: "rest", oktave: "octave", notenzeile: "stave",
      notenschluessel: "clef", vorzeichen: "accidental", tonleiter: "scale", melodie: "tune", lied: "song",
      punktiert: "dotted", haltebogen: "tie", bindebogen: "slur", taktart: "time signature", akkord: "chord",
      lautstaerke: "volume", tempo: "speed", note: "note", ton: "pitch",
    },
    quelle:
      "britische Notenschrift (ABRSM/Music Theory), Wortwahl des New International Manual (Table 1 A: semibreve, minim, crotchet, quaver, semi-quaver; „stave“ statt „staff“).",
  },

  fr: {
    system: "do-re-mi",
    buchstaben: BUCHSTABEN_B,
    solmisation: { c: "do", d: "ré", e: "mi", f: "fa", g: "sol", a: "la", h: "si" },
    standardStil: "solmisation",
    vorzeichen: { kreuz: "dièse", be: "bémol", aufloesung: "bécarre" },
    noten: {
      ganze: "ronde", halbe: "blanche", viertel: "noire", achtel: "croche", sechzehntel: "double croche",
    },
    pausen: {
      ganze: "pause", halbe: "demi-pause", viertel: "soupir", achtel: "demi-soupir", sechzehntel: "quart de soupir",
    },
    begriffe: {
      takt: "mesure", taktstrich: "barre de mesure", pause: "silence", oktave: "octave", notenzeile: "portée",
      notenschluessel: "clé", vorzeichen: "altération", tonleiter: "gamme", melodie: "mélodie", lied: "chanson",
      punktiert: "pointée", haltebogen: "liaison de prolongation", bindebogen: "liaison", taktart: "chiffrage de mesure",
      akkord: "accord", lautstaerke: "volume", tempo: "tempo", note: "note", ton: "son",
    },
    quelle:
      "Solfège français (Académie/Conservatoires): ronde, blanche, noire, croche, double croche; pause, demi-pause, soupir, demi-soupir, quart de soupir. Noten-Braille: Code international (Moskau 1982), französische Textzeichen im Manual S. 207-220.",
  },

  es: {
    system: "do-re-mi",
    buchstaben: BUCHSTABEN_B,
    solmisation: { c: "do", d: "re", e: "mi", f: "fa", g: "sol", a: "la", h: "si" },
    standardStil: "solmisation",
    vorzeichen: { kreuz: "sostenido", be: "bemol", aufloesung: "becuadro" },
    noten: {
      ganze: "redonda", halbe: "blanca", viertel: "negra", achtel: "corchea", sechzehntel: "semicorchea",
    },
    pausen: {
      ganze: "silencio de redonda", halbe: "silencio de blanca", viertel: "silencio de negra",
      achtel: "silencio de corchea", sechzehntel: "silencio de semicorchea",
    },
    begriffe: {
      takt: "compás", taktstrich: "barra de compás", pause: "silencio", oktave: "octava", notenzeile: "pentagrama",
      notenschluessel: "clave", vorzeichen: "alteración", tonleiter: "escala", melodie: "melodía", lied: "canción",
      punktiert: "con puntillo", haltebogen: "ligadura de unión", bindebogen: "ligadura de expresión",
      taktart: "indicación de compás", akkord: "acorde", lautstaerke: "volumen", tempo: "tempo", note: "nota", ton: "sonido",
    },
    quelle:
      "Teoría musical española (RAE/Conservatorios): redonda, blanca, negra, corchea, semicorchea; Notenschrift der ONCE (Braille-Musikcode B 4-1/B 4-2).",
  },

  it: {
    system: "do-re-mi",
    buchstaben: BUCHSTABEN_B,
    solmisation: { c: "do", d: "re", e: "mi", f: "fa", g: "sol", a: "la", h: "si" },
    standardStil: "solmisation",
    vorzeichen: { kreuz: "diesis", be: "bemolle", aufloesung: "bequadro" },
    noten: {
      ganze: "semibreve", halbe: "minima", viertel: "semiminima", achtel: "croma", sechzehntel: "semicroma",
    },
    pausen: {
      ganze: "pausa di semibreve", halbe: "pausa di minima", viertel: "pausa di semiminima",
      achtel: "pausa di croma", sechzehntel: "pausa di semicroma",
    },
    begriffe: {
      takt: "battuta", taktstrich: "stanghetta", pause: "pausa", oktave: "ottava", notenzeile: "pentagramma",
      notenschluessel: "chiave", vorzeichen: "alterazione", tonleiter: "scala", melodie: "melodia", lied: "canzone",
      punktiert: "puntata", haltebogen: "legatura di valore", bindebogen: "legatura di portamento",
      taktart: "indicazione di tempo", akkord: "accordo", lautstaerke: "volume", tempo: "tempo", note: "nota", ton: "suono",
    },
    quelle:
      "Teoria musicale italiana (Conservatori): semibreve, minima, semiminima, croma, semicroma; pausa.",
  },

  nl: {
    system: "buchstaben-b",
    buchstaben: BUCHSTABEN_B,
    solmisation: DO_RE_MI_DE,
    standardStil: "buchstaben",
    vorzeichen: { kreuz: "kruis", be: "mol", aufloesung: "herstellingsteken" },
    noten: {
      ganze: "hele noot", halbe: "halve noot", viertel: "kwartnoot", achtel: "achtste noot",
      sechzehntel: "zestiende noot",
    },
    pausen: {
      ganze: "hele rust", halbe: "halve rust", viertel: "kwartrust", achtel: "achtste rust", sechzehntel: "zestiende rust",
    },
    begriffe: {
      takt: "maat", taktstrich: "maatstreep", pause: "rust", oktave: "octaaf", notenzeile: "notenbalk",
      notenschluessel: "sleutel", vorzeichen: "voorteken", tonleiter: "toonladder", melodie: "melodie", lied: "lied",
      punktiert: "met punt", haltebogen: "overbinding", bindebogen: "legatoboog", taktart: "maatsoort", akkord: "akkoord",
      lautstaerke: "volume", tempo: "tempo", note: "noot", ton: "toon",
    },
    quelle:
      "Nederlandse muziektheorie (hele/halve/kwart/achtste noot); Braillemuziek: Dedicon „Basisboek“ 2019 (laut Recherche, nicht eingesehen).",
  },

  sv: {
    system: "buchstaben-h",
    buchstaben: BUCHSTABEN_H,
    solmisation: DO_RE_MI_DE,
    standardStil: "buchstaben",
    vorzeichen: { kreuz: "förtecknet kors", be: "förtecknet b", aufloesung: "återställningstecken" },
    noten: {
      ganze: "helnot", halbe: "halvnot", viertel: "fjärdedelsnot", achtel: "åttondelsnot", sechzehntel: "sextondelsnot",
    },
    pausen: {
      ganze: "helpaus", halbe: "halvpaus", viertel: "fjärdedelspaus", achtel: "åttondelspaus", sechzehntel: "sextondelspaus",
    },
    begriffe: {
      takt: "takt", taktstrich: "taktstreck", pause: "paus", oktave: "oktav", notenzeile: "notrad",
      notenschluessel: "klav", vorzeichen: "förtecken", tonleiter: "skala", melodie: "melodi", lied: "sång",
      punktiert: "punkterad", haltebogen: "bindebåge", bindebogen: "legatobåge", taktart: "taktart", akkord: "ackord",
      lautstaerke: "volym", tempo: "tempo", note: "not", ton: "ton",
    },
    quelle:
      "Svensk musikteori (helnot, halvnot, fjärdedelsnot ...); Notenschrift-Braille: MTM (laut Recherche, nicht eingesehen).",
  },

  pt: {
    system: "do-re-mi",
    buchstaben: BUCHSTABEN_B,
    solmisation: { c: "dó", d: "ré", e: "mi", f: "fá", g: "sol", a: "lá", h: "si" },
    standardStil: "solmisation",
    vorzeichen: { kreuz: "sustenido", be: "bemol", aufloesung: "bequadro" },
    noten: {
      ganze: "semibreve", halbe: "mínima", viertel: "semínima", achtel: "colcheia", sechzehntel: "semicolcheia",
    },
    pausen: {
      ganze: "pausa de semibreve", halbe: "pausa de mínima", viertel: "pausa de semínima",
      achtel: "pausa de colcheia", sechzehntel: "pausa de semicolcheia",
    },
    begriffe: {
      takt: "compasso", taktstrich: "barra de compasso", pause: "pausa", oktave: "oitava", notenzeile: "pauta",
      notenschluessel: "clave", vorzeichen: "acidente", tonleiter: "escala", melodie: "melodia", lied: "canção",
      punktiert: "pontuada", haltebogen: "ligadura de prolongamento", bindebogen: "ligadura de expressão",
      taktart: "fórmula de compasso", akkord: "acorde", lautstaerke: "volume", tempo: "andamento", note: "nota", ton: "som",
    },
    quelle: "Teoria musical portuguesa (semibreve, mínima, semínima, colcheia, semicolcheia; pauta).",
  },

  br: {
    system: "do-re-mi",
    buchstaben: BUCHSTABEN_B,
    solmisation: { c: "dó", d: "ré", e: "mi", f: "fá", g: "sol", a: "lá", h: "si" },
    standardStil: "solmisation",
    vorzeichen: { kreuz: "sustenido", be: "bemol", aufloesung: "bequadro" },
    noten: {
      ganze: "semibreve", halbe: "mínima", viertel: "semínima", achtel: "colcheia", sechzehntel: "semicolcheia",
    },
    pausen: {
      ganze: "pausa de semibreve", halbe: "pausa de mínima", viertel: "pausa de semínima",
      achtel: "pausa de colcheia", sechzehntel: "pausa de semicolcheia",
    },
    begriffe: {
      takt: "compasso", taktstrich: "barra de compasso", pause: "pausa", oktave: "oitava", notenzeile: "pauta",
      notenschluessel: "clave", vorzeichen: "acidente", tonleiter: "escala", melodie: "melodia", lied: "canção",
      punktiert: "pontuada", haltebogen: "ligadura de prolongamento", bindebogen: "ligadura de expressão",
      taktart: "fórmula de compasso", akkord: "acorde", lautstaerke: "volume", tempo: "andamento", note: "nota", ton: "som",
    },
    quelle:
      "Teoria musical brasileira (mesmos nomes de figuras que em Portugal; no Brasil também se diz „pausa de semínima“); Braille-Musik: Código Matemático/Musical da língua portuguesa (laut Recherche, nicht eingesehen).",
  },

  pl: {
    system: "buchstaben-h",
    buchstaben: BUCHSTABEN_H,
    solmisation: DO_RE_MI_DE,
    standardStil: "buchstaben",
    vorzeichen: { kreuz: "krzyżyk", be: "bemol", aufloesung: "kasownik" },
    noten: {
      ganze: "cała nuta", halbe: "półnuta", viertel: "ćwierćnuta", achtel: "ósemka", sechzehntel: "szesnastka",
    },
    pausen: {
      ganze: "pauza całonutowa", halbe: "pauza półnutowa", viertel: "pauza ćwierćnutowa", achtel: "pauza ósemkowa",
      sechzehntel: "pauza szesnastkowa",
    },
    begriffe: {
      takt: "takt", taktstrich: "kreska taktowa", pause: "pauza", oktave: "oktawa", notenzeile: "pięciolinia",
      notenschluessel: "klucz", vorzeichen: "znak chromatyczny", tonleiter: "gama", melodie: "melodia", lied: "piosenka",
      punktiert: "z kropką", haltebogen: "łuk przedłużający", bindebogen: "łuk legato", taktart: "metrum", akkord: "akord",
      lautstaerke: "głośność", tempo: "tempo", note: "nuta", ton: "dźwięk",
    },
    quelle: "Polska teoria muzyki (cała nuta, półnuta, ćwierćnuta, ósemka, szesnastka; pięciolinia).",
  },

  cs: {
    system: "buchstaben-h",
    buchstaben: BUCHSTABEN_H,
    solmisation: DO_RE_MI_DE,
    standardStil: "buchstaben",
    vorzeichen: { kreuz: "křížek", be: "béčko", aufloesung: "odrážka" },
    noten: {
      ganze: "celá nota", halbe: "půlová nota", viertel: "čtvrťová nota", achtel: "osminová nota",
      sechzehntel: "šestnáctinová nota",
    },
    pausen: {
      ganze: "celá pomlka", halbe: "půlová pomlka", viertel: "čtvrťová pomlka", achtel: "osminová pomlka",
      sechzehntel: "šestnáctinová pomlka",
    },
    begriffe: {
      takt: "takt", taktstrich: "taktová čára", pause: "pomlka", oktave: "oktáva", notenzeile: "notová osnova",
      notenschluessel: "klíč", vorzeichen: "posuvka", tonleiter: "stupnice", melodie: "melodie", lied: "píseň",
      punktiert: "s tečkou", haltebogen: "vázací oblouk", bindebogen: "legatový oblouk", taktart: "taktové označení",
      akkord: "akord", lautstaerke: "hlasitost", tempo: "tempo", note: "nota", ton: "tón",
    },
    quelle: "Česká hudební teorie (celá, půlová, čtvrťová, osminová nota; pomlka; notová osnova).",
  },

  hu: {
    system: "buchstaben-h",
    buchstaben: BUCHSTABEN_H,
    solmisation: { c: "do", d: "re", e: "mi", f: "fa", g: "szó", a: "la", h: "ti" },
    standardStil: "buchstaben",
    vorzeichen: { kreuz: "kereszt", be: "bé", aufloesung: "feloldójel" },
    noten: {
      ganze: "egész hang", halbe: "fél hang", viertel: "negyed hang", achtel: "nyolcad hang",
      sechzehntel: "tizenhatod hang",
    },
    pausen: {
      ganze: "egész szünet", halbe: "fél szünet", viertel: "negyed szünet", achtel: "nyolcad szünet",
      sechzehntel: "tizenhatod szünet",
    },
    begriffe: {
      takt: "ütem", taktstrich: "ütemvonal", pause: "szünet", oktave: "oktáv", notenzeile: "ötvonalas rendszer",
      notenschluessel: "kulcs", vorzeichen: "előjegyzés", tonleiter: "skála", melodie: "dallam", lied: "dal",
      punktiert: "pontozott", haltebogen: "kötőív", bindebogen: "legato ív", taktart: "ütemmutató", akkord: "akkord",
      lautstaerke: "hangerő", tempo: "tempó", note: "hang", ton: "hang",
    },
    quelle:
      "Magyar zeneelmélet (Kodály-módszer: relatív szolmizáció do re mi fa szó la ti). ⚠ Das bewegliche Do der Kodály-Methode ist mit der festen Braille-Notenschrift nicht deckungsgleich - Klangpunkte nutzt feste Namen (siehe Befund).",
  },
};

/** Dieselben Ton-Schlüssel wie `ToneName` in `notation.ts` (zur Prüfung per Test). */
export const TON_SCHLUESSEL: readonly Ton[] = ["c", "d", "e", "f", "g", "a", "h"];
export const WERT_SCHLUESSEL: readonly Wert[] = ["ganze", "halbe", "viertel", "achtel", "sechzehntel"];
