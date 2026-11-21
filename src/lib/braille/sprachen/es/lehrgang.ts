/**
 * ════════════════════════════════════════════════════════════════════════════
 * SPANISCH (es) - DER LEHRGANG „SIGNOGRAFÍA BÁSICA" (Bauplan 2026-11-06 §4)
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Gleiche Etappen-Logik wie die deutsche Basisschrift (`etappen.ts`) und der
 * französische Lehrgang (`fr/lehrgang.ts`): kleine Gruppen neuer Zeichen, danach
 * Wörter und Sätze nur aus dem, was schon gelernt ist, am Ende ganze Texte.
 *
 * ★ REIHENFOLGE DER BUCHSTABEN = HÄUFIGKEIT IM SPANISCHEN. Quelle: Wikipedia es,
 *   „Frecuencia de aparición de letras", Tabelle nach Fletcher Pratt, *Secret and
 *   Urgent* (Blue Ribbon Books, 1939, S. 254-255; abgerufen 07.11.2026):
 *   e a o s r n i d l c t u m p b g v y q h f z j ñ x k w. Die Quelle ist alt und
 *   kennt keine Akzentbuchstaben: á é í ó ú ü kommen nach den 27 Buchstaben (diese
 *   Einordnung ist EIGENE Entscheidung, keine Messung).
 * ★ SCHRIFTART: „Signografía básica" (so heißt die Norm: CBE/ONCE, Documento técnico
 *   B 2, 2025). Hier ohne jede Kürzung (Estenografía B 16 ist nicht Teil dieses Auftrags).
 *   Zeichen und Regeln: `zeichen.ts` und `engine.ts`; Abweichungen von liblouis: BEFUND-2026-11-07.
 * ★ ZAHLEN: Zahlzeichen 3-4-5-6 und die Buchstaben a-j (CBE B 2, 8.1, S. 17) - anders als im
 *   Französischen steht vor Rechenzeichen KEIN Modifikator.
 * ★ WÖRTER UND SÄTZE kommen aus den Tastenflow-Korpora für Spanisch (`typing/wordsEs.ts`,
 *   `corpusEs*Kids.ts`), vorgefiltert von `scripts/es-lehrgang-erzeugen.mts` nach
 *   `generated/es-lehrgang.generated.json` (eigene Zeilen, keine Tatoeba-Sätze).
 * ★ ANSPRACHE: Kinder „tú", wie Tastenflow auf Spanisch (`curriculumEs.ts`); Lehrkraft „usted".
 */
import { type BuchstabenGruppe, einheitenAus, lehrgangBauer, namenMit, saetzeMit, woerterMit } from "../lehrgangBauen";
import POOL from "./generated/es-lehrgang.generated.json";

/** Reihenfolge der Buchstaben: Häufigkeit (siehe Kopf). */
export const ES_BUCHSTABEN_REIHENFOLGE = "eaosrnidlctumpbgvyqhfzjñxkwáéíóúü";

/** Sprechbare Namen (für Vorlesen und Merkhilfe), wie man sie auf Spanisch sagt. */
const BUCHSTABENNAME: Record<string, string> = {
  a: "a", b: "be", c: "ce", d: "de", e: "e", f: "efe", g: "ge", h: "hache", i: "i", j: "jota", k: "ka",
  l: "ele", m: "eme", n: "ene", ñ: "eñe", o: "o", p: "pe", q: "cu", r: "erre", s: "ese", t: "te", u: "u",
  v: "uve", w: "uve doble", x: "equis", y: "ye", z: "zeta", á: "a con tilde", é: "e con tilde",
  í: "i con tilde", ó: "o con tilde", ú: "u con tilde", ü: "u con diéresis",
};
const ZEICHENNAME: Record<string, string> = {
  ".": "punto", ",": "coma", "?": "cerrar interrogación", "¿": "abrir interrogación",
  "!": "cerrar exclamación", "¡": "abrir exclamación", ";": "punto y coma", ":": "dos puntos",
  "-": "guion", "(": "abrir paréntesis", ")": "cerrar paréntesis", '"': "comillas",
  "+": "más", "−": "menos", "=": "igual", "×": "por", "÷": "entre",
  NUM: "signo de número", "1": "uno", "2": "dos", "3": "tres", "4": "cuatro", "5": "cinco", "6": "seis",
  "7": "siete", "8": "ocho", "9": "nueve", "0": "cero",
  MAJ: "signo de mayúscula",
};
const einheiten = einheitenAus({ ...BUCHSTABENNAME, ...ZEICHENNAME });

const R = ES_BUCHSTABEN_REIHENFOLGE;
const bis = (n: number): string => R.slice(0, n);
/** Die ersten `n` Buchstaben der Reihenfolge. */
export const esBuchstabenBis = bis;

const GRUPPEN: BuchstabenGruppe[] = [
  {
    id: "es-1", bis: 4, titel: "e, a, o, s: las primeras letras",
    du: "Empezamos con cuatro letras muy frecuentes en español: e, a, o y s. Con ellas ya escribes «eso», «oso» y «sea». Escribe con los puntos: enseguida oyes si está bien.",
    sie: "Las letras se enseñan según su frecuencia en español (Pratt, 1939, citado en Wikipedia: Frecuencia de aparición de letras): e, a, o, s. Las más frecuentes van primero para que aparezcan palabras reales muy pronto.",
  },
  {
    id: "es-2", bis: 8, titel: "r, n, i, d: palabras de verdad",
    du: "Cuatro letras más: r, n, i y d. Ya puedes escribir «rosa», «nido» y «sonrisa». Fíjate bien en la forma de cada celda.",
    sie: "Continúa el orden de frecuencia: r, n, i, d. Con ocho letras ya se forman muchas palabras cortas.",
  },
  {
    id: "es-3", bis: 12, titel: "l, c, t, u: doce letras",
    du: "Con l, c, t y u tienes doce letras. Ahora escribes «luna», «cuatro» y «cuento». La l, la c y la d se parecen al tacto: tómate tu tiempo.",
    sie: "Continúa el orden de frecuencia: l, c, t, u. La l (1-2-3), la u (1-3-6) y la d (1-4-5) se confunden con facilidad al tacto; por eso se comparan en las etapas siguientes.",
  },
  {
    id: "es-4", bis: 16, titel: "m, p, b, g: más palabras",
    du: "Ahora m, p, b y g. Escribes «mapa», «bomba» y «pimienta». Sigue tu ritmo: cada celda correcta te lleva a la siguiente.",
    sie: "Continúa el orden de frecuencia: m, p, b, g. Con dieciséis letras el vocabulario de ejercicio se amplía a cientos de palabras.",
  },
  {
    id: "es-5", bis: 20, titel: "v, y, q, h: veinte letras",
    du: "Cuatro letras más: v, y, q y h. Escribes «vaca», «queso» y «hoy». Te faltan solo unas pocas letras poco frecuentes.",
    sie: "Continúa el orden de frecuencia: v, y, q, h. Con veinte letras se leen casi todas las palabras cortas.",
  },
];

const GRUPPEN_NACH_MAJ: BuchstabenGruppe[] = [
  {
    id: "es-6", bis: 24, titel: "f, z, j, ñ: la eñe y otras letras",
    du: "Aquí vienen f, z, j y la ñ (puntos 1-2-4-5-6). Escribes «faro», «zorro», «jirafa» y «niño». La eñe es una letra con su propia celda.",
    sie: "Continúa el orden de frecuencia: f, z, j, ñ. La ñ (12456) es un carácter propio del alfabeto braille español (CBE B 2, cap. 4, p. 11).",
  },
  {
    id: "es-7", bis: 27, titel: "x, k, w: letras poco frecuentes",
    du: "Tres letras raras: x, k y w. La w (puntos 2-4-5-6) viene de otros idiomas. Escribes «taxi», «koala» y «kiwi».",
    sie: "Continúa el orden de frecuencia: x, k, w. La w (2456) figura en el alfabeto braille español tras la t y la u (CBE B 2, p. 11).",
  },
  {
    id: "es-8", bis: 30, titel: "á, é, í: letras con tilde",
    du: "Tres letras con tilde: á (1-2-3-5-6), é (2-3-4-6) e í (3-4). Escribes «papá», «café» y «tío». Cada vocal con tilde es una sola celda.",
    sie: "Á, é, í (12356, 2346, 34): en braille son caracteres propios, no una letra seguida de un acento (CBE B 2, p. 11). El orden entre las vocales con tilde es una decisión propia: la fuente de frecuencia no las incluye.",
  },
  {
    id: "es-9", bis: 33, titel: "ó, ú, ü: las últimas letras",
    du: "Las últimas: ó (3-4-6), ú (2-3-4-5-6) y la u con diéresis ü (1-2-5-6). Escribes «camión», «azúcar» y «pingüino». ¡Ya conoces todas las letras del español!",
    sie: "Ó, ú, ü (346, 23456, 1256): últimos caracteres del alfabeto (CBE B 2, p. 11). Tras esta etapa se conocen todas las letras.",
  },
];

// ─── Etappen und Levels ──────────────────────────────────────────────────────
const B = lehrgangBauer("es");
const { dazu } = B;
const WOERTER = POOL.woerter;
const NAMEN = POOL.namen;
const SAETZE = POOL.saetze;
const TEXTE = POOL.texte;

let vorher = 0;
for (const g of GRUPPEN) {
  const neu = R.slice(vorher, g.bis);
  dazu({
    id: g.id, title: g.titel, introducedUnits: einheiten(neu), introDu: g.du, introSie: g.sie,
    legend: [...neu].join(" "), kind: "words", items: woerterMit(WOERTER, bis(g.bis)),
  });
  vorher = g.bis;
}

dazu({
  id: "es-maj", title: "Las mayúsculas: los nombres",
  introducedUnits: [{ key: "CAPS", spoken: ZEICHENNAME.MAJ }],
  introDu:
    "En braille no existe la A mayúscula. Los puntos 4 y 6 avisan: «ahora viene una mayúscula». Se escriben justo delante de la palabra: así «lola» se convierte en «Lola». Practicas con nombres.",
  introSie:
    "Signo de mayúscula (puntos 4-6) delante de la palabra cuya primera letra es mayúscula (CBE B 2, cap. 7, p. 15). Las siglas llevan dos signos delante (4-6, 4-6; 7.1, p. 15); no se enseñan en esta etapa. Una mayúscula en medio de una palabra (McDonald) no está regulada y no se escribe.",
  legend: "Lola = ⠨ l o l a",
  kind: "words",
  items: namenMit(NAMEN, bis(20)),
});

for (const g of GRUPPEN_NACH_MAJ) {
  const neu = R.slice(vorher, g.bis);
  dazu({
    id: g.id, title: g.titel, introducedUnits: einheiten(neu), introDu: g.du, introSie: g.sie,
    legend: [...neu].join(" "), kind: "words", items: woerterMit(WOERTER, bis(g.bis)),
  });
  vorher = g.bis;
}

dazu({
  id: "es-gemischt", title: "Todas las letras, mezcladas",
  introducedUnits: [],
  introDu: "Ya conoces todas las letras. Aquí hay palabras variadas: reconoce cada celda.",
  introSie: "Etapa de consolidación: todas las palabras, sin ningún carácter nuevo.",
  legend: "",
  kind: "words",
  items: () => woerterMit(WOERTER, R)().filter((w) => w.length >= 3),
});

dazu({
  id: "es-satz1", title: "El punto y la coma",
  introducedUnits: einheiten(".,"),
  introDu:
    "El punto (punto 3) y la coma (punto 2) van pegados a la palabra, sin espacio antes. Ahora escribes frases de verdad.",
  introSie:
    "Punto 3 y coma 2 (CBE B 2, cap. 6.1, p. 13). Atención: el punto (3) y la coma (2) son signos distintos del punto decimal, que se escribe con el punto 2 (8.1, p. 18).",
  legend: ". ,",
  zeichen: [".", ","],
  kind: "sentences",
  items: saetzeMit(SAETZE, R, ".,", ".,", 60),
});

dazu({
  id: "es-satz2", title: "¿? ¡!: preguntas y exclamaciones",
  introducedUnits: einheiten("¿?¡!"),
  introDu:
    "En español las preguntas y las exclamaciones se abren y se cierran: ¿ ... ? y ¡ ... !. La interrogación es el mismo signo al abrir y al cerrar: puntos 2-6. La exclamación también: puntos 2-3-5.",
  introSie:
    "Abrir y cerrar interrogación: puntos 2-6; abrir y cerrar exclamación: puntos 2-3-5 (CBE B 2, cap. 6.1, p. 13). Cada signo se escribe en su lugar, aunque el braille no distingue entre apertura y cierre.",
  legend: "¿ ? ¡ !",
  zeichen: ["¿", "?", "¡", "!"],
  kind: "sentences",
  items: saetzeMit(SAETZE, R, ".,¿?¡!", "¿?¡!", 60),
});

dazu({
  id: "es-satz3", title: "; : - ( ) y comillas",
  introducedUnits: einheiten(';:-()"'),
  introDu:
    "El punto y coma (puntos 2-3), los dos puntos (2-5), el guion (3-6), el paréntesis que abre (1-2-6) y el que cierra (3-4-5). Las comillas « » o \" \" se escriben todas con los mismos puntos: 2-3-6.",
  introSie:
    "Punto y coma 2-3, dos puntos 2-5 (6.1, p. 13), guion 3-6 (6.2, p. 14), paréntesis 1-2-6 y 3-4-5, comillas 2-3-6 «sean cuales sean» (6.1, p. 13). No se enseñan los signos que la norma no define con claridad para este nivel (apóstrofo, barra inclinada).",
  legend: '; : - ( ) "',
  zeichen: [";", ":", "-", "(", ")", '"'],
  kind: "sentences",
  items: saetzeMit(SAETZE, R, ".,¿?¡!;:-()\"", ';:-()"', 70),
});

const ZAHLEN = ["1", "2", "5", "8", "10", "12", "20", "42", "100", "2026", "3,5", "7", "9", "15", "36", "1999", "300", "64"];
dazu({
  id: "es-zahlen", title: "Los números",
  introducedUnits: [{ key: "#", spoken: ZEICHENNAME.NUM }, ...einheiten("1234567890")],
  introDu:
    "Para los números pones primero el signo de número (puntos 3-4-5-6) y después las letras de la a a la j: a es 1, b es 2 ... i es 9 y j es 0. El signo de número se escribe una sola vez delante de todo el número: 2026 es «signo de número, b, j, b, f».",
  introSie:
    "Signo de número (3-4-5-6) delante de las diez primeras letras (CBE B 2, 8.1, p. 17); se escribe una vez por cada número, no por cada cifra. El decimal se escribe con el punto 2, también cuando el original usa punto o apóstrofo (p. 18). Si una letra a-j sigue a una cifra sin espacio, lleva delante el punto 5 (8.2, p. 19); en este nivel no se practica.",
  legend: "1 2 3 4 5 6 7 8 9 0",
  zeichen: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
  kind: "words",
  items: () => ZAHLEN,
});

dazu({
  id: "es-plus", title: "Más, menos e igual",
  introducedUnits: einheiten("+−="),
  introDu:
    "Los signos de cálculo: más (puntos 2-3-5), menos (3-6) e igual (2-3-5-6). Cada número lleva su propio signo de número: «2 + 3 = 5».",
  introSie:
    "Signos de suma 2-3-5, resta 3-6 e igualdad 2-3-5-6 (CBE B 2, cap. 12, p. 30). No llevan prefijo; cada número tiene su signo de número. El signo menos y el guion tienen el mismo signo (3-6).",
  legend: "+ − =",
  zeichen: ["+", "−", "="],
  kind: "words",
  items: () => ["2 + 3 = 5", "7 − 4 = 3", "6 + 6 = 12", "9 − 5 = 4", "10 + 5 = 15", "8 − 3 = 5", "1 + 1 = 2", "20 − 10 = 10"],
});

dazu({
  id: "es-mal", title: "Por y entre",
  introducedUnits: einheiten("×÷"),
  introDu:
    "Dos signos más: «por» × (puntos 2-3-6) y «entre» ÷ (puntos 2-5-6). Se escriben igual que los demás signos de cálculo: «3 × 4 = 12», «6 ÷ 3 = 2».",
  introSie:
    "Multiplicar (aspa) 2-3-6 y dividir 2-5-6 (CBE B 2, cap. 12, p. 30). El signo de multiplicar (2-3-6) coincide con las comillas; el contexto lo decide.",
  legend: "× ÷",
  zeichen: ["×", "÷"],
  kind: "words",
  items: () => ["3 × 4 = 12", "2 × 5 = 10", "6 ÷ 3 = 2", "8 ÷ 2 = 4", "5 × 5 = 25", "9 ÷ 3 = 3", "7 × 2 = 14", "12 ÷ 4 = 3"],
});

dazu({
  id: "es-texte", title: "Leer y escribir textos enteros",
  introducedUnits: [],
  introDu: "¡Muy bien, conoces todo el braille básico! Ahora lees y escribes textos pequeños enteros.",
  introSie:
    "Etapa final: textos continuos que reúnen todos los caracteres enseñados (letras, tildes, mayúsculas, puntuación habitual).",
  legend: "",
  kind: "text",
  items: () => [...TEXTE],
});

/** Alle Etappen des spanischen Lehrgangs, in Reihenfolge. */
export const ES_ETAPPEN = B.etappen;
/** Die zugehörigen Levels (Aufgabenvorrat je Etappe). */
export const ES_LEVELS = B.levels;

export function esLevelById(id: string) {
  return ES_LEVELS.find((l) => l.id === id);
}

/** Die Wortvorräte (für Tests und Werkzeuge). */
export const ES_POOL = { woerter: WOERTER, namen: NAMEN, saetze: SAETZE, texte: TEXTE };
