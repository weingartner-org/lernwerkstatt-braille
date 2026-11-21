/**
 * ════════════════════════════════════════════════════════════════════════════
 * ITALIENISCH (it) - DER LEHRGANG „CODICE BRAILLE A SEI PUNTI" (Bauplan 2026-11-06 §4)
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Gleiche Etappen-Logik wie die deutsche Basisschrift (`etappen.ts`) und der
 * französische/spanische Lehrgang: kleine Gruppen neuer Zeichen, danach Wörter und
 * Sätze nur aus dem, was schon gelernt ist, am Ende ganze Texte.
 *
 * ★ REIHENFOLGE DER BUCHSTABEN = HÄUFIGKEIT IM ITALIENISCHEN. Quelle: Wikipedia en,
 *   „Letter frequency", Spalte Italian, nach Simon Singh / Stefano Galli, *Codici e
 *   Segreti* (Rizzoli, Mailand 1999; abgerufen 07.11.2026):
 *   e a i o n l r t s c d p u m v g z f b q h w y j k x. Die Akzentbuchstaben stehen
 *   in derselben Tabelle: à 0,635 % · è 0,263 % · ù 0,166 % · ì 0,030 % · ò 0,002 %; das
 *   é (Norm 6), S. 7) steht dort nicht und kommt zuletzt. Sie kommen NACH den 26 Buchstaben.
 * ★ SCHRIFTART: „Codice Braille Italiano a sei punti" (so heißt Teil 1 der Norm, BIC 2022),
 *   der Bereich heißt „Codice braille a sei punti". Hier ohne Kürzungen (die gibt es im
 *   Italienischen nicht, Recherche §2).
 * ★ ZAHLEN: Segnanumero 3-4-5-6 und die Buchstaben a-j (BIC 121), S. 21) - vor Rechenzeichen
 *   steht KEIN Modifikator. ÷ wird nicht gelehrt (Befund: offene Frage).
 * ★ WÖRTER UND SÄTZE kommen aus den Tastenflow-Korpora für Italienisch (`typing/wordsIt.ts`,
 *   `corpusIt*Kids.ts`), vorgefiltert von `scripts/it-lehrgang-erzeugen.mts` nach
 *   `generated/it-lehrgang.generated.json` (eigene Zeilen, keine Tatoeba-Sätze).
 * ★ ANSPRACHE: Kinder „tu", wie Tastenflow auf Italienisch (`curriculumIt.ts`); Lehrkraft „Lei".
 */
import { type BuchstabenGruppe, einheitenAus, lehrgangBauer, namenMit, saetzeMit, woerterMit } from "../lehrgangBauen";
import POOL from "./generated/it-lehrgang.generated.json";

/** Reihenfolge der Buchstaben: Häufigkeit (siehe Kopf). */
export const IT_BUCHSTABEN_REIHENFOLGE = "eaionlrtscdpumvgzfbqhwyjkxàèùìòé";

/** Sprechbare Namen (für Vorlesen und Merkhilfe), wie man sie auf Italienisch sagt. */
const BUCHSTABENNAME: Record<string, string> = {
  a: "a", b: "bi", c: "ci", d: "di", e: "e", f: "effe", g: "gi", h: "acca", i: "i", j: "i lunga", k: "cappa",
  l: "elle", m: "emme", n: "enne", o: "o", p: "pi", q: "cu", r: "erre", s: "esse", t: "ti", u: "u",
  v: "vi", w: "doppia vu", x: "ics", y: "ipsilon", z: "zeta", à: "a accento grave", è: "e accento grave",
  ù: "u accento grave", ì: "i accento grave", ò: "o accento grave", é: "e accento acuto",
};
const ZEICHENNAME: Record<string, string> = {
  ".": "punto", ",": "virgola", "'": "apostrofo", "?": "punto interrogativo",
  "!": "punto esclamativo", ";": "punto e virgola", ":": "due punti", "-": "trattino",
  "(": "parentesi tonda", ")": "parentesi tonda", "«": "virgolette aperte", "»": "virgolette chiuse",
  "+": "più", "−": "meno", "=": "uguale", "×": "per",
  NUM: "segnanumero", "1": "uno", "2": "due", "3": "tre", "4": "quattro", "5": "cinque", "6": "sei",
  "7": "sette", "8": "otto", "9": "nove", "0": "zero",
  MAJ: "segno di maiuscola",
};
const einheiten = einheitenAus({ ...BUCHSTABENNAME, ...ZEICHENNAME });

const R = IT_BUCHSTABEN_REIHENFOLGE;
const bis = (n: number): string => R.slice(0, n);
/** Die ersten `n` Buchstaben der Reihenfolge. */
export const itBuchstabenBis = bis;

const GRUPPEN: BuchstabenGruppe[] = [
  {
    id: "it-1", bis: 5, titel: "e, a, i, o, n: le prime lettere",
    du: "Cominciamo con cinque lettere molto frequenti in italiano: e, a, i, o e n. Con loro scrivi già «noi», «non» e «nonno». Scrivi con i punti: senti subito se è giusto.",
    sie: "Le lettere si insegnano secondo la loro frequenza in italiano (Singh e Galli, Codici e Segreti, 1999): e, a, i, o, n. Le più frequenti vengono per prime, così compaiono presto parole vere; con sole quattro lettere il vocabolario sarebbe troppo scarso (due parole), perciò la prima tappa ne ha cinque.",
  },
  {
    id: "it-2", bis: 9, titel: "l, r, t, s: parole vere",
    du: "Altre quattro lettere: l, r, t e s. Ora scrivi «sera», «tanto» e «lista». Senti bene la forma di ogni cella.",
    sie: "Continua l'ordine di frequenza: l, r, t, s. Con nove lettere si formano già molte parole brevi.",
  },
  {
    id: "it-3", bis: 13, titel: "c, d, p, u: tredici lettere",
    du: "Con c, d, p e u hai tredici lettere. Ecco «casa», «dito» e «pausa». La d (punti 1-4-5), la p e la c si somigliano al tatto: prenditi il tuo tempo.",
    sie: "Continua l'ordine di frequenza: c, d, p, u. La d (1-4-5) e la c (1-4) si confondono facilmente al tatto: per questo si confrontano nelle tappe successive.",
  },
  {
    id: "it-4", bis: 17, titel: "m, v, g, z: più parole",
    du: "Adesso m, v, g e z. Scrivi «mela», «uva», «gatto» e «zero». Segui il tuo ritmo: ogni cella giusta ti porta alla prossima.",
    sie: "Continua l'ordine di frequenza: m, v, g, z. Con diciassette lettere il vocabolario degli esercizi cresce a centinaia di parole.",
  },
  {
    id: "it-5", bis: 21, titel: "f, b, q, h: ventuno lettere",
    du: "Quattro lettere in più: f, b, q e h. Scrivi «fiore», «bosco», «quadro» e «hai». L'acca (punti 1-2-5) non si pronuncia, ma si scrive. Mancano solo poche lettere rare.",
    sie: "Continua l'ordine di frequenza: f, b, q, h. La h (125) fa parte dell'alfabeto del Codice Braille Italiano (BIC 2022, p. 7). Con ventuno lettere si leggono quasi tutte le parole corte.",
  },
];

const GRUPPEN_NACH_MAJ: BuchstabenGruppe[] = [
  {
    id: "it-6", bis: 24, titel: "w, y, j: lettere rare",
    du: "Ecco w, y e j. La w (punti 2-4-5-6) viene da altre lingue. Scrivi «yogurt», «jolly» e «web».",
    sie: "Continua l'ordine di frequenza: w, y, j. La w (2456), la y (13456) e la j (245) fanno parte dell'alfabeto del Codice Braille Italiano (BIC 2022, p. 7) anche se poco usate in italiano.",
  },
  {
    id: "it-7", bis: 26, titel: "k, x: le ultime lettere",
    du: "Altre due lettere rare: k (punti 1-3) e x (punti 1-3-4-6). Le trovi in parole come «kiwi» e «taxi». Conosci ora tutte le lettere dell'alfabeto!",
    sie: "Continua l'ordine di frequenza: k, x. Dopo questa tappa si conoscono le 26 lettere dell'alfabeto.",
  },
  {
    id: "it-8", bis: 29, titel: "à, è, ù: gli accenti gravi",
    du: "Ora le vocali con l'accento grave: à (punti 1-2-3-5-6), è (2-3-4-6) e ù (2-3-4-5-6). Scrivi «città», «è» e «più». Ogni vocale accentata è una sola cella.",
    sie: "À, è, ù (12356, 2346, 23456): in braille sono caratteri propri, non una lettera seguita da un accento (BIC 2022, p. 7, voci 3 e 6). L'ordine segue la frequenza (Singh e Galli, 1999).",
  },
  {
    id: "it-9", bis: 32, titel: "ì, ò, é: le ultime vocali accentate",
    du: "Le ultime tre: ì (punti 3-4), ò (3-4-6) e la e con l'accento acuto é (1-2-3-4-5-6). Scrivi «così», «però» e «perché». Conosci tutte le lettere dell'italiano!",
    sie: "Ì, ò, é (34, 346, 123456): ultimi caratteri accentati dell'alfabeto (BIC 2022, p. 7). La é (accento acuto) non compare nella tabella di frequenza e viene per ultima.",
  },
];

// ─── Etappen und Levels ──────────────────────────────────────────────────────
const B = lehrgangBauer("it");
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
  id: "it-maj", title: "Le maiuscole: i nomi",
  introducedUnits: [{ key: "CAPS", spoken: ZEICHENNAME.MAJ }],
  introDu:
    "In braille non esiste la A maiuscola. I punti 4 e 6 avvisano: «adesso viene una maiuscola». Si scrivono subito davanti alla lettera: così «luca» diventa «Luca». Ti eserciti con i nomi.",
  introSie:
    "Segno di maiuscola (punti 4-6) davanti a ogni lettera maiuscola (BIC 2022, p. 7, voce 1). Una parola tutta maiuscola riceve due segni (4-6, 4-6; voce 2); non si insegna in questa tappa.",
  legend: "Luca = ⠨ l u c a",
  kind: "words",
  items: namenMit(NAMEN, bis(21)),
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
  id: "it-gemischt", title: "Tutte le lettere, mescolate",
  introducedUnits: [],
  introDu: "Conosci tutte le lettere. Ecco parole varie: riconosci ogni cella.",
  introSie: "Tappa di consolidamento: tutte le parole, senza nessun carattere nuovo.",
  legend: "",
  kind: "words",
  items: () => woerterMit(WOERTER, R)().filter((w) => w.length >= 3),
});

dazu({
  id: "it-satz1", title: "Il punto, la virgola e l'apostrofo",
  introducedUnits: einheiten(".,'"),
  introDu:
    "Il punto fermo (punti 2-5-6) e la virgola (punto 2) si scrivono subito dopo la parola, senza spazio. L'apostrofo è il punto 3: «l'amico», «un'ora». Adesso scrivi frasi vere.",
  introSie:
    "Punto fermo 2-5-6, virgola 2, apostrofo 3 (BIC 2022, pp. 8-9, voci 14, 15, 23). Attenzione: il punto singolo 3 serve anche per l'abbreviazione e per i puntini di sospensione (voce 16); il punto fermo è un altro segno.",
  legend: ". , '",
  zeichen: [".", ",", "'"],
  kind: "sentences",
  items: saetzeMit(SAETZE, R, ".,'", ".,'", 60),
});

dazu({
  id: "it-satz2", title: "? ! ; : i segni che parlano",
  introducedUnits: einheiten("?!;:"),
  introDu:
    "Il punto interrogativo (punti 2-6), il punto esclamativo (2-3-5), il punto e virgola (2-3) e i due punti (2-5). Si scrivono attaccati alla parola, come il punto.",
  introSie:
    "Punto interrogativo 2-6, esclamativo 2-3-5, punto e virgola 2-3, due punti 2-5 (BIC 2022, p. 9, voci 17-20).",
  legend: "? ! ; :",
  zeichen: ["?", "!", ";", ":"],
  kind: "sentences",
  items: saetzeMit(SAETZE, R, ".,'?!;:", "?!;:", 60),
});

dazu({
  id: "it-satz3", title: "Trattino, parentesi e virgolette",
  introducedUnits: einheiten("-()«»"),
  introDu:
    "Il trattino (punti 3-6) e le parentesi tonde: aperta e chiusa si scrivono uguali, punti 2-3-5-6. Le virgolette hanno due segni: aperte « (punti 2-3-6) e chiuse » (punti 3-5-6).",
  introSie:
    "Trattino 3-6, parentesi tonda 2-3-5-6 sia aperta sia chiusa (voce 24), virgolette aperte 2-3-6 e chiuse 3-5-6 (voce 22) (BIC 2022, p. 9). Le virgolette dritte \" si scrivono come aperte o chiuse a seconda della posizione.",
  legend: "- ( ) « »",
  zeichen: ["-", "(", ")", "«", "»"],
  kind: "sentences",
  items: saetzeMit(SAETZE, R, ".,'?!;:-()\"«»", "-()\"«»", 70),
});

const ZAHLEN = ["1", "2", "5", "8", "10", "12", "20", "42", "100", "2026", "3,5", "7", "9", "15", "36", "1999", "300", "64"];
dazu({
  id: "it-zahlen", title: "I numeri",
  introducedUnits: [{ key: "#", spoken: ZEICHENNAME.NUM }, ...einheiten("1234567890")],
  introDu:
    "Per i numeri scrivi prima il segnanumero (punti 3-4-5-6), poi le lettere da a a j: a è 1, b è 2 ... i è 9 e j è 0. Il segnanumero si scrive una volta sola davanti a tutto il numero: 2026 è «segnanumero, b, j, b, f».",
  introSie:
    "Segnanumero (3-4-5-6) davanti alle lettere a-j (BIC 2022, p. 21, voce 121); si scrive una volta per ogni numero. La virgola decimale è il punto 2; il separatore delle migliaia è l'apostrofo 3 (voci 132-133, p. 22). Una lettera attaccata a una cifra non è regolata dalla norma: non si esercita.",
  legend: "1 2 3 4 5 6 7 8 9 0",
  zeichen: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
  kind: "words",
  items: () => ZAHLEN,
});

dazu({
  id: "it-plus", title: "Più, meno e uguale",
  introducedUnits: einheiten("+−="),
  introDu:
    "I segni di calcolo: più (punti 2-3-5), meno (3-6) e uguale (2-3-5-6). Ogni numero ha il suo segnanumero: «2 + 3 = 5».",
  introSie:
    "Più 2-3-5 e meno 3-6 (BIC 2022, p. 22, voci 135-136), uguale 2-3-5-6 (p. 23, voce 142). Nessun prefisso; ogni numero ha il suo segnanumero. Il segno meno e il trattino hanno la stessa cella (3-6).",
  legend: "+ − =",
  zeichen: ["+", "−", "="],
  kind: "words",
  items: () => ["2 + 3 = 5", "7 − 4 = 3", "6 + 6 = 12", "9 − 5 = 4", "10 + 5 = 15", "8 − 3 = 5", "1 + 1 = 2", "20 − 10 = 10"],
});

dazu({
  id: "it-mal", title: "Per",
  introducedUnits: einheiten("×"),
  introDu:
    "Un segno in più: «per» × (punti 2-3-6). Si scrive come gli altri segni di calcolo: «3 × 4 = 12».",
  introSie:
    "Per (×) 2-3-6 (BIC 2022, p. 23, voce 139). Coincide con le virgolette aperte (2-3-6): lo decide il contesto. Il segno ÷ non è nominato dalla norma (voce 140 cita solo : e /) e non si insegna.",
  legend: "×",
  zeichen: ["×"],
  kind: "words",
  items: () => ["3 × 4 = 12", "2 × 5 = 10", "5 × 5 = 25", "7 × 2 = 14", "4 × 4 = 16", "6 × 3 = 18", "9 × 2 = 18", "8 × 5 = 40"],
});

dazu({
  id: "it-texte", title: "Leggere e scrivere testi interi",
  introducedUnits: [],
  introDu: "Bravo, conosci tutto il braille a sei punti! Adesso leggi e scrivi piccoli testi interi.",
  introSie:
    "Tappa finale: testi continui che riuniscono tutti i caratteri insegnati (lettere, accenti, maiuscole, punteggiatura comune).",
  legend: "",
  kind: "text",
  items: () => [...TEXTE],
});

/** Alle Etappen des italienischen Lehrgangs, in Reihenfolge. */
export const IT_ETAPPEN = B.etappen;
/** Die zugehörigen Levels (Aufgabenvorrat je Etappe). */
export const IT_LEVELS = B.levels;

export function itLevelById(id: string) {
  return IT_LEVELS.find((l) => l.id === id);
}

/** Die Wortvorräte (für Tests und Werkzeuge). */
export const IT_POOL = { woerter: WOERTER, namen: NAMEN, saetze: SAETZE, texte: TEXTE };
