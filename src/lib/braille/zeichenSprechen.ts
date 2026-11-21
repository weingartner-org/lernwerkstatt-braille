/**
 * ★★★ JEDES ZEICHEN WIRD VORGELESEN (Johannes 07.10.2026: „die sonderzeichen
 * werden gar nicht angesagt, das geht überhaupt nicht, jedes zeichen muss bei
 * vorlesen kommen").
 *
 * Die Sprachausgabe des Browsers verschluckt Satz- und Sonderzeichen: „Toll!"
 * klingt wie „Toll", „info@post.at" wie „info post at". Beim Schreiben in
 * Braille ist aber gerade das Zeichen die Aufgabe - ein Kind mit Blindheit
 * hörte nicht, dass es ein Ausrufezeichen schreiben soll.
 *
 * ⇒ Für die SPRACHE wird jedes Zeichen, das kein Buchstabe, keine Ziffer und
 *   kein Leerzeichen ist, durch seinen Namen ersetzt: „Toll Ausrufezeichen".
 *   Die Braillezeile (Live-Region, Schreibzeile) bekommt weiter den echten
 *   Text - dort steht das Zeichen selbst.
 *
 * Die Namen der Satzzeichen sind dieselben wie in den Etappen
 * (`etappen.ts`, `introducedUnits[].spoken`).
 */

import type { LehrSprache } from "./sprachen/aktuell";

const NAMEN_DE: Record<string, string> = {
  ".": "Punkt",
  ",": "Komma",
  "?": "Fragezeichen",
  "!": "Ausrufezeichen",
  ":": "Doppelpunkt",
  ";": "Strichpunkt",
  "-": "Bindestrich",
  "‐": "Bindestrich",
  "–": "Gedankenstrich",
  "—": "Gedankenstrich",
  "…": "Auslassungspunkte",
  "'": "Apostroph",
  "’": "Apostroph",
  "‚": "Anführungszeichen unten",
  "‘": "Anführungszeichen oben",
  "„": "Anführungszeichen unten",
  "“": "Anführungszeichen oben",
  "”": "Anführungszeichen oben",
  '"': "Anführungszeichen",
  "»": "Anführungszeichen",
  "«": "Anführungszeichen",
  "›": "Anführungszeichen",
  "‹": "Anführungszeichen",
  "(": "Klammer auf",
  ")": "Klammer zu",
  "[": "eckige Klammer auf",
  "]": "eckige Klammer zu",
  "{": "geschweifte Klammer auf",
  "}": "geschweifte Klammer zu",
  "<": "kleiner als",
  ">": "größer als",
  "/": "Schrägstrich",
  "\\": "umgekehrter Schrägstrich",
  "|": "senkrechter Strich",
  "&": "und-Zeichen",
  "§": "Paragraf",
  "%": "Prozent",
  "‰": "Promille",
  "€": "Euro",
  "$": "Dollar",
  "£": "Pfund",
  "¢": "Cent",
  "@": "at-Zeichen",
  "#": "Raute",
  "*": "Stern",
  "+": "Plus",
  "=": "Gleich",
  "×": "mal",
  "·": "mal",
  "÷": "geteilt durch",
  "−": "minus",
  "±": "plus minus",
  "≈": "ungefähr gleich",
  "≠": "ungleich",
  "≤": "kleiner gleich",
  "≥": "größer gleich",
  "√": "Wurzel",
  "²": "hoch 2",
  "³": "hoch 3",
  "π": "pi",
  "~": "Tilde",
  "^": "Zirkumflex",
  "`": "Gravis",
  "´": "Akut",
  "_": "Unterstrich",
  "°": "Grad",
  "©": "Copyright",
  "†": "Kreuz",
  "½": "ein halb",
  "¼": "ein Viertel",
  "¾": "drei Viertel",
};

const NAMEN_EN: Record<string, string> = {
  ".": "period",
  ",": "comma",
  "?": "question mark",
  "!": "exclamation mark",
  ":": "colon",
  ";": "semicolon",
  "-": "hyphen",
  "–": "dash",
  "—": "dash",
  "…": "ellipsis",
  "'": "apostrophe",
  "’": "apostrophe",
  "‘": "opening quote",
  "“": "opening quote",
  "”": "closing quote",
  '"': "quote",
  "(": "open parenthesis",
  ")": "close parenthesis",
  "[": "open bracket",
  "]": "close bracket",
  "{": "open brace",
  "}": "close brace",
  "<": "less than",
  ">": "greater than",
  "/": "slash",
  "\\": "backslash",
  "|": "vertical bar",
  "&": "ampersand",
  "%": "percent",
  "€": "euro",
  "$": "dollar",
  "£": "pound",
  "@": "at sign",
  "#": "number sign",
  "*": "asterisk",
  "+": "plus",
  "−": "minus",
  "×": "times",
  "÷": "divided by",
  "=": "equals",
  "~": "tilde",
  "^": "caret",
  "_": "underscore",
  "°": "degree",
};

/** Französisch: so nennt die Norm (CBFU, Tableau 1 und 3) die Zeichen. */
const NAMEN_FR: Record<string, string> = {
  ".": "point", ",": "virgule", "?": "point d'interrogation", "!": "point d'exclamation",
  ":": "deux-points", ";": "point-virgule", "-": "trait d'union", "‐": "trait d'union",
  "–": "tiret", "—": "tiret", "…": "points de suspension", "'": "apostrophe", "’": "apostrophe",
  "‘": "apostrophe", '"': "guillemet", "«": "guillemet ouvrant", "»": "guillemet fermant",
  "“": "guillemet ouvrant", "”": "guillemet fermant", "(": "parenthèse ouvrante",
  ")": "parenthèse fermante", "/": "barre oblique", "@": "arobase", "+": "plus", "=": "égale",
  "×": "multiplié par", "÷": "divisé par", "−": "moins", "%": "pour cent", "*": "astérisque",
  "€": "euro", "&": "et commercial", "#": "dièse", "_": "trait de soulignement",
};

/** Spanisch: so nennt die Norm (CBE B 2) die Zeichen. */
const NAMEN_ES: Record<string, string> = {
  ".": "punto", ",": "coma", "?": "interrogación", "¿": "abrir interrogación", "!": "exclamación",
  "¡": "abrir exclamación", ":": "dos puntos", ";": "punto y coma", "-": "guion", "‐": "guion",
  "–": "guion", "—": "raya", "…": "puntos suspensivos", "'": "apóstrofo", "’": "apóstrofo",
  "‘": "apóstrofo", '"': "comillas", "«": "abrir comillas", "»": "cerrar comillas",
  "“": "abrir comillas", "”": "cerrar comillas", "(": "abrir paréntesis", ")": "cerrar paréntesis",
  "[": "abrir corchete", "]": "cerrar corchete", "/": "barra", "@": "arroba", "+": "más", "=": "igual",
  "×": "por", "÷": "dividido entre", "−": "menos", "%": "por ciento", "*": "asterisco",
  "€": "euro", "&": "y comercial", "#": "almohadilla", "_": "guion bajo",
};

/** Italienisch: so nennt der Codice Braille Italiano (BIC 2022) die Zeichen. */
const NAMEN_IT: Record<string, string> = {
  ".": "punto", ",": "virgola", "?": "punto interrogativo", "!": "punto esclamativo",
  ":": "due punti", ";": "punto e virgola", "-": "trattino", "‐": "trattino", "–": "lineetta",
  "—": "lineetta", "…": "puntini di sospensione", "'": "apostrofo", "’": "apostrofo",
  "‘": "apostrofo", '"': "virgolette", "«": "virgolette aperte", "»": "virgolette chiuse",
  "“": "virgolette aperte", "”": "virgolette chiuse", "(": "parentesi aperta", ")": "parentesi chiusa",
  "[": "parentesi quadra aperta", "]": "parentesi quadra chiusa", "/": "barra", "@": "chiocciola",
  "+": "più", "=": "uguale", "×": "per", "÷": "diviso", "−": "meno", "%": "per cento",
  "*": "asterisco", "€": "euro", "&": "e commerciale", "#": "cancelletto", "_": "trattino basso",
};

/** Portugiesisch (Portugal und Brasilien gleich): so nennt die Grafia Braille 2018 die Zeichen. */
const NAMEN_PT: Record<string, string> = {
  ".": "ponto", ",": "vírgula", "?": "ponto de interrogação", "!": "ponto de exclamação",
  ":": "dois-pontos", ";": "ponto e vírgula", "-": "hífen", "‐": "hífen", "–": "travessão",
  "—": "travessão", "…": "reticências", "'": "apóstrofo", "’": "apóstrofo", "‘": "abre aspas simples",
  '"': "aspas", "«": "abre aspas angulares", "»": "fecha aspas angulares", "“": "abre aspas",
  "”": "fecha aspas", "(": "abre parênteses", ")": "fecha parênteses", "[": "abre colchetes",
  "]": "fecha colchetes", "/": "barra", "@": "arroba", "+": "mais", "=": "igual", "×": "vezes",
  "÷": "dividido por", "−": "menos", "%": "por cento", "*": "asterisco", "€": "euro", "&": "e comercial",
};

/** Schwedisch: so nennt *Svenska skrivregler för punktskrift* (MTM 2009) die Zeichen. */
const NAMEN_SV: Record<string, string> = {
  ".": "punkt", ",": "komma", "?": "frågetecken", "!": "utropstecken", ":": "kolon", ";": "semikolon",
  "-": "bindestreck", "‐": "bindestreck", "–": "tankstreck", "—": "tankstreck", "…": "tre punkter",
  "'": "apostrof", "’": "apostrof", "‘": "apostrof", '"': "citattecken", "”": "citattecken",
  "“": "citattecken", "»": "citattecken", "«": "citattecken", "(": "vänsterparentes", ")": "högerparentes",
  "[": "vänster hakparentes", "]": "höger hakparentes", "/": "snedstreck", "@": "snabel-a", "+": "plus",
  "=": "likhetstecken", "×": "gånger", "÷": "delat med", "−": "minus", "%": "procent", "*": "asterisk",
  "€": "euro", "&": "och-tecken", "#": "fyrkant", "_": "understreck", "§": "paragraftecken",
};

/** Niederländisch: so nennt die Braillestandaard 2019 (Braille Autoriteit) die Zeichen. */
const NAMEN_NL: Record<string, string> = {
  ".": "punt", ",": "komma", "?": "vraagteken", "!": "uitroepteken", ":": "dubbele punt", ";": "puntkomma",
  "-": "liggend streepje", "‐": "liggend streepje", "–": "gedachtestreepje", "—": "gedachtestreepje",
  "…": "drie puntjes", "'": "apostrof", "’": "apostrof", "‘": "apostrof", '"': "aanhalingsteken",
  "“": "aanhalingsteken", "”": "aanhalingsteken", "„": "aanhalingsteken", "«": "aanhalingsteken",
  "»": "aanhalingsteken", "(": "haakje openen", ")": "haakje sluiten", "[": "vierkant haakje openen",
  "]": "vierkant haakje sluiten", "{": "accolade openen", "}": "accolade sluiten", "/": "slash",
  "@": "apenstaartje", "+": "plus", "=": "is gelijk aan", "×": "maal", "÷": "gedeeld door", "−": "min",
  "%": "procent", "*": "sterretje", "€": "euro", "&": "ampersand", "#": "hekje", "_": "underscore",
  "§": "paragraafteken",
};

const NAMEN_JE_SPRACHE: Partial<Record<string, Record<string, string>>> = {
  fr: NAMEN_FR, es: NAMEN_ES, it: NAMEN_IT, sv: NAMEN_SV, nl: NAMEN_NL, pt: NAMEN_PT, br: NAMEN_PT,
};

/** Sprachen, in denen Zeichennamen gesprochen werden (Deutsch/Englisch alter Weg, sonst Sprachen-Apps). */
export type ZeichenLang = "de" | "en" | LehrSprache;

/** Name eines Zeichens für die Sprachausgabe, `undefined` für Buchstaben,
 *  Ziffern und Leerraum (die liest die Stimme selbst). */
export function zeichenName(z: string, lang: ZeichenLang = "de"): string | undefined {
  if (/^[\p{L}\p{N}\s]$/u.test(z)) return undefined;
  const fremd = NAMEN_JE_SPRACHE[lang];
  if (fremd) return fremd[z];
  const namen = lang === "en" ? NAMEN_EN : NAMEN_DE;
  return namen[z] ?? NAMEN_DE[z];
}

/**
 * Text für die Sprachausgabe: jedes Satz- und Sonderzeichen beim Namen.
 * „Toll!" → „Toll Ausrufezeichen" · „E-Mail" → „E Bindestrich Mail".
 * Ein Zeichen ohne bekannten Namen bleibt stehen, wie es ist.
 */
export function mitZeichenNamen(text: string, lang: ZeichenLang = "de"): string {
  let aus = "";
  for (const z of text) {
    const name = zeichenName(z, lang);
    aus += name ? ` ${name} ` : z;
  }
  return aus.replace(/\s+/g, " ").trim();
}
