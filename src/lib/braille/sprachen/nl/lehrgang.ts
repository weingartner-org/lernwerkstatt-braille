/**
 * ════════════════════════════════════════════════════════════════════════════
 * NIEDERLÄNDISCH (nl) - DER LEHRGANG „BRAILLESTANDAARD" (Bauplan 2026-11-06 §4)
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Gleiche Etappen-Logik wie die deutsche Basisschrift (`etappen.ts`) und die Lehrgänge fr, es, it, sv:
 * kleine Gruppen neuer Zeichen, danach Wörter und Sätze nur aus dem, was schon gelernt ist, am Ende ganze Texte.
 *
 * ★ REIHENFOLGE DER BUCHSTABEN = HÄUFIGKEIT IM NIEDERLÄNDISCHEN. Quelle: Wikipedia (en) „Letter frequency", Spalte
 *   Dutch, nach Genootschap Onze Taal, „Letterfrequenties" (abgerufen 07.11.2026):
 *   e n a t i r o d s l g v h k m u b p w j z c f x y q. é ë ï kommen danach (die Quelle kennt sie nicht; die Einordnung ist
 *   EIGENE Entscheidung, keine Messung). Die übrigen Akzentbuchstaben der Norm (è ö ç ê ...) stehen in Zeichentabelle und
 *   Engine, aber in keinem Übungswort der Korpora: nicht im Lehrgang.
 * ★ SCHRIFTART: „Braillestandaard" (so heißt die Norm: Braille Autoriteit, *Braillestandaard voor algemeen gebruik in het
 *   Nederlandse taalgebied*, versie 2019). Hier ohne jede Kürzung (die Norm kennt für Niederländisch keine Kurzschrift mehr).
 *   Zeichen und Regeln: `zeichen.ts` und `engine.ts`; Abweichungen von liblouis `nl-NL-g0` (Stand 2017): BEFUND-2026-11-07.
 * ★ ZAHLEN: Cijferteken 3-4-5-6 und die Buchstaben a-j (Norm 3.1, S. 30); der Punkt (256) trennt Tausender, das Komma (2) ist
 *   Dezimaltrenner; ein Leerzeichen beendet die Zahl.
 * ★ WÖRTER UND SÄTZE kommen aus den Tastenflow-Korpora für Niederländisch (`typing/wordsNl.ts`, `lexikonNachtragNl.ts`,
 *   `corpusNlWegCharge1Kids.ts`, `serienNlKids1.ts` - Kinder-Texte), vorgefiltert von `scripts/nl-lehrgang-erzeugen.mts` nach
 *   `generated/nl-lehrgang.generated.json`.
 * ★ ANSPRACHE: Kinder „je", wie Tastenflow auf Niederländisch (`curriculumNl.ts`); Lehrkraft „u".
 */
import { type BuchstabenGruppe, einheitenAus, lehrgangBauer, namenMit, saetzeMit, woerterMit } from "../lehrgangBauen";
import POOL from "./generated/nl-lehrgang.generated.json";

/** Reihenfolge der Buchstaben: Häufigkeit (siehe Kopf). */
export const NL_BUCHSTABEN_REIHENFOLGE = "enatirodslgvhkmubpwjzcfxyqéëï";

/** Sprechbare Namen (für Vorlesen und Merkhilfe), wie man sie auf Niederländisch sagt. */
const BUCHSTABENNAME: Record<string, string> = {
  a: "a", b: "be", c: "ce", d: "de", e: "e", f: "ef", g: "ge", h: "ha", i: "ie", j: "je", k: "ka",
  l: "el", m: "em", n: "en", o: "o", p: "pe", q: "kuu", r: "er", s: "es", t: "te", u: "uu",
  v: "ve", w: "we", x: "iks", y: "ij", z: "zet", é: "e accent aigu", ë: "e trema", ï: "i trema",
};
const ZEICHENNAME: Record<string, string> = {
  ".": "punt", ",": "komma", "?": "vraagteken", "!": "uitroepteken", ";": "puntkomma", ":": "dubbele punt",
  "-": "liggend streepje", "(": "haakje openen", ")": "haakje sluiten", '"': "aanhalingsteken", "'": "apostrof",
  "+": "plus", "−": "min", "=": "is gelijk aan", "×": "maal",
  NUM: "cijferteken", "1": "een", "2": "twee", "3": "drie", "4": "vier", "5": "vijf", "6": "zes",
  "7": "zeven", "8": "acht", "9": "negen", "0": "nul",
  HOOFD: "hoofdletterteken",
};
const einheiten = einheitenAus({ ...BUCHSTABENNAME, ...ZEICHENNAME });

const R = NL_BUCHSTABEN_REIHENFOLGE;
const bis = (n: number): string => R.slice(0, n);
/** Die ersten `n` Buchstaben der Reihenfolge. */
export const nlBuchstabenBis = bis;

const GRUPPEN: BuchstabenGruppe[] = [
  {
    id: "nl-1", bis: 4, titel: "e, n, a, t: de eerste letters",
    du: "We beginnen met vier heel gewone letters: e, n, a en t. Daarmee kun je al «een», «net» en «tent» schrijven. Schrijf met de punten: je hoort meteen of het goed is.",
    sie: "De letters worden aangeleerd naar frequentie in het Nederlands (Genootschap Onze Taal, via Wikipedia: Letter frequency): e, n, a, t. De meest voorkomende komen eerst, zodat er snel echte woorden ontstaan.",
  },
  {
    id: "nl-2", bis: 8, titel: "i, r, o, d: echte woorden",
    du: "Nog vier letters: i, r, o en d. Nu schrijf je «dier», «rood» en «rond». Kijk goed naar de vorm van elke cel.",
    sie: "De frequentievolgorde loopt door: i, r, o, d. Met acht letters kun je al veel korte woorden maken.",
  },
  {
    id: "nl-3", bis: 12, titel: "s, l, g, v: twaalf letters",
    du: "Met s, l, g en v heb je twaalf letters. Nu schrijf je «slot», «vlag» en «glas». De d (punten 1-4-5), de g (1-2-4-5) en de v (1-2-3-6) kun je met je vinger makkelijk door elkaar halen: neem er de tijd voor.",
    sie: "De frequentievolgorde loopt door: s, l, g, v. De d (145) en de g (1245) liggen dicht bij elkaar en worden met de tastzin makkelijk verward.",
  },
  {
    id: "nl-4", bis: 16, titel: "h, k, m, u: meer woorden",
    du: "Nu h, k, m en u. Je schrijft «huis», «kam», «muis» en «koud». Ga op je eigen tempo: elke goede cel brengt je bij de volgende.",
    sie: "De frequentievolgorde loopt door: h, k, m, u. Met zestien letters groeit de woordenvoorraad naar honderden woorden.",
  },
  {
    id: "nl-5", bis: 20, titel: "b, p, w, j: twintig letters",
    du: "Nog vier letters: b, p, w en j. De w (punten 2-4-5-6) staat in het Nederlandse braille na de ö en niet bij de andere letters. Je schrijft «boek», «pijp», «wiel» en «jas».",
    sie: "De frequentievolgorde loopt door: b, p, w, j. De w (2456) is in de braillestandaard aangeduid als 1.40 (blz. 10), na de letters met trema.",
  },
];

const GRUPPEN_NA_HOOFD: BuchstabenGruppe[] = [
  {
    id: "nl-6", bis: 24, titel: "z, c, f, x: bijna alle letters",
    du: "Hier komen z, c, f en x. Je schrijft «zon», «cent», «fiets» en «taxi». Er zijn nog maar een paar zeldzame letters over.",
    sie: "De frequentievolgorde loopt door: z, c, f, x. Met vierentwintig letters worden bijna alle korte woorden gelezen.",
  },
  {
    id: "nl-7", bis: 26, titel: "y en q: zeldzame letters",
    du: "Twee zeldzame letters: y (punten 1-3-4-5-6) en q (1-2-3-4-5). Je schrijft «yoga» en «quiz».",
    sie: "De frequentievolgorde loopt door: y, q. De y (13456) en de q (12345) komen in het Nederlands zelden voor.",
  },
  {
    id: "nl-8", bis: 29, titel: "é, ë, ï: letters met accent en trema",
    du: "De laatste drie: é (alle zes de punten: 1-2-3-4-5-6), ë (1-2-4-6) en ï (1-2-4-5-6). Je schrijft «één», «café», «reëel» en «naïef». Nu ken je alle letters!",
    sie: "é (123456, blz. 9), ë (1246) en ï (12456, blz. 10): de braillestandaard geeft elk van deze letters een eigen teken. Daarna zijn alle letters bekend. De plaats van é ë ï is een eigen keuze: de frequentiebron bevat ze niet.",
  },
];

// ─── Etappen und Levels ──────────────────────────────────────────────────────
const B = lehrgangBauer("nl");
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
  id: "nl-hoofd", title: "Hoofdletters: namen",
  introducedUnits: [{ key: "CAPS", spoken: ZEICHENNAME.HOOFD }],
  introDu:
    "In braille bestaat geen grote A. Punten 4 en 6 zeggen: «nu komt een hoofdletter». Ze staan vlak voor de letter: zo wordt «noor» tot «Noor». Je oefent met namen.",
  introSie:
    "Hoofdletterteken (punten 4-6) direct vóór de hoofdletter (Braillestandaard 2019, 2.11, blz. 20). Twee of meer opeenvolgende hoofdletters krijgen één permanent hoofdletterteken (4-5) voor zich; dat wordt hier niet geoefend. Een hoofdletter midden in een woord (MacLean) krijgt zijn eigen hoofdletterteken. «IJ» aan het begin van een woord (IJsselmeer) regelt de standaard niet en wordt niet geschreven.",
  legend: "Noor = ⠨ n o o r",
  kind: "words",
  items: namenMit(NAMEN, bis(20)),
});

for (const g of GRUPPEN_NA_HOOFD) {
  const neu = R.slice(vorher, g.bis);
  dazu({
    id: g.id, title: g.titel, introducedUnits: einheiten(neu), introDu: g.du, introSie: g.sie,
    legend: [...neu].join(" "), kind: "words", items: woerterMit(WOERTER, bis(g.bis)),
  });
  vorher = g.bis;
}

dazu({
  id: "nl-gemengd", title: "Alle letters door elkaar",
  introducedUnits: [],
  introDu: "Je kent alle letters. Hier staan gemengde woorden: herken elke cel.",
  introSie: "Herhaling: alle woorden, zonder nieuw teken.",
  legend: "",
  kind: "words",
  items: () => woerterMit(WOERTER, R)().filter((w) => w.length >= 3),
});

dazu({
  id: "nl-zin1", title: "De punt en de komma",
  introducedUnits: einheiten(".,"),
  introDu:
    "De komma (punt 2) en de punt (punten 2-5-6) staan vlak achter het woord, zonder spatie. Let op: de punt is in braille een cel met drie punten: 2-5-6. Nu schrijf je echte zinnen.",
  introSie:
    "Komma 2 en punt 256 (Braillestandaard 2019, 2.14 en 2.17, blz. 25-27). In een getal is de komma het decimaalteken (2) en de punt het scheidingsteken voor duizendtallen (256, 3.1, blz. 30).",
  legend: ". ,",
  zeichen: [".", ","],
  kind: "sentences",
  items: saetzeMit(SAETZE, R, ".,", ".,", 60),
});

dazu({
  id: "nl-zin2", title: "? en !: vragen en uitroepen",
  introducedUnits: einheiten("?!"),
  introDu:
    "Het vraagteken heeft de punten 2-6 en het uitroepteken de punten 2-3-5. Beide staan direct achter het laatste woord.",
  introSie:
    "Vraagteken 26 en uitroepteken 235 (blz. 25). Het uitroepteken heeft dezelfde cel als het plusteken; de spatieregel (3.2, blz. 32) onderscheidt ze.",
  legend: "? !",
  zeichen: ["?", "!"],
  kind: "sentences",
  items: saetzeMit(SAETZE, R, ".,?!", "?!", 60),
});

dazu({
  id: "nl-zin3", title: ": ; - ( ) aanhalingstekens en apostrof",
  introducedUnits: einheiten(':;-()"\''),
  introDu:
    "De dubbele punt (punten 2-5), de puntkomma (2-3), het liggend streepje (3-6), haakje openen (2-3-6) en haakje sluiten (3-5-6). Het aanhalingsteken (2-3-5-6) is hetzelfde bij het openen en het sluiten. De apostrof is punt 3.",
  introSie:
    "Dubbele punt 25 en puntkomma 23 (blz. 25), liggend streepje 36 (2.15, blz. 26), rond haakje 236 en 356 (2.9, blz. 18), dubbel aanhalingsteken 2356 voor alle soorten dubbele aanhalingstekens, apostrof en enkel aanhalingsteken 3 (2.1, blz. 12). Het gedachtestreepje is hetzelfde liggend streepje (36); in de toetsenbordteksten staat het als «-».",
  legend: ': ; - ( ) " \'',
  zeichen: [":", ";", "-", "(", ")", '"', "'"],
  kind: "sentences",
  items: saetzeMit(SAETZE, R, ".,?!:;-()\"'", ":;-()\"'", 70),
});

const GETALLEN = ["1", "2", "5", "8", "10", "12", "20", "42", "100", "2026", "3,5", "1.250", "7", "9", "15", "36", "1999", "300", "64"];
dazu({
  id: "nl-getallen", title: "Getallen",
  introducedUnits: [{ key: "#", spoken: ZEICHENNAME.NUM }, ...einheiten("1234567890")],
  introDu:
    "Voor getallen schrijf je eerst het cijferteken (punten 3-4-5-6) en daarna de letters van a tot j: a is 1, b is 2 ... i is 9 en j is 0. Het cijferteken staat maar één keer voor het hele getal: 2026 is «cijferteken, b, j, b, f». Een komma (punt 2) is het decimaalteken, een punt (2-5-6) scheidt duizendtallen.",
  introSie:
    "Cijferteken (3-4-5-6) voor de eerste tien letters (Braillestandaard 2019, 3.1, blz. 30); het cijferteken blijft van kracht tot een spatie of een niet-cijfer volgt, tenzij dat een komma of punt is. Een kleine letter a-j direct achter het getal krijgt het herstelteken (6, blz. 31); dat wordt op dit niveau niet geoefend.",
  legend: "1 2 3 4 5 6 7 8 9 0",
  zeichen: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
  kind: "words",
  items: () => GETALLEN,
});

dazu({
  id: "nl-plus", title: "Plus, min en is gelijk aan",
  introducedUnits: einheiten("+−="),
  introDu:
    "De rekentekens: plus (punten 2-3-5), min (3-6) en is gelijk aan (2-3-5-6). Elk getal krijgt zijn eigen cijferteken: «2 + 3 = 5». Voor en na het rekenteken staat een spatie.",
  introSie:
    "Plusteken 235, minteken 36 en isgelijkteken 2356 (Braillestandaard 2019, 3.2, blz. 31); in tekstbraille met een spatie ervoor en erna (spatieregel, blz. 32). Het minteken is hetzelfde liggend streepje (36).",
  legend: "+ − =",
  zeichen: ["+", "−", "="],
  kind: "words",
  items: () => ["2 + 3 = 5", "7 − 4 = 3", "6 + 6 = 12", "9 − 5 = 4", "10 + 5 = 15", "8 − 3 = 5", "1 + 1 = 2", "20 − 10 = 10"],
});

dazu({
  id: "nl-maal", title: "Maal",
  introducedUnits: einheiten("×"),
  introDu:
    "Nog één rekenteken: «maal» × (punten 2-3-6). Het wordt geschreven zoals de andere rekentekens, met een spatie ervoor en erna: «3 × 4 = 12».",
  introSie:
    "Maalteken 236 (Braillestandaard 2019, 3.2, blz. 31). Het heeft dezelfde cel als het rond haakje openen; de spatieregel onderscheidt ze. Het deelteken kent de standaard als dubbele punt (256) of slash (34); het teken ÷ staat er niet in en wordt niet geschreven.",
  legend: "×",
  zeichen: ["×"],
  kind: "words",
  items: () => ["3 × 4 = 12", "2 × 5 = 10", "5 × 5 = 25", "7 × 2 = 14", "6 × 3 = 18", "4 × 4 = 16", "9 × 2 = 18", "8 × 5 = 40"],
});

dazu({
  id: "nl-teksten", title: "Hele teksten lezen en schrijven",
  introducedUnits: [],
  introDu: "Goed gedaan, je kent al het gewone braille! Nu lees en schrijf je kleine hele teksten.",
  introSie:
    "Slotetappe: lopende teksten met alle aangeleerde tekens (letters, hoofdletters, gewone leestekens).",
  legend: "",
  kind: "text",
  items: () => [...TEXTE],
});

/** Alle Etappen des niederländischen Lehrgangs, in Reihenfolge. */
export const NL_ETAPPEN = B.etappen;
/** Die zugehörigen Levels (Aufgabenvorrat je Etappe). */
export const NL_LEVELS = B.levels;

export function nlLevelById(id: string) {
  return NL_LEVELS.find((l) => l.id === id);
}

/** Die Wortvorräte (für Tests und Werkzeuge). */
export const NL_POOL = { woerter: WOERTER, namen: NAMEN, saetze: SAETZE, texte: TEXTE };
