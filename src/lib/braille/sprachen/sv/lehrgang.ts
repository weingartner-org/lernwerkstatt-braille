/**
 * ════════════════════════════════════════════════════════════════════════════
 * SCHWEDISCH (sv) - DER LEHRGANG „SVENSK PUNKTSKRIFT" (Bauplan 2026-11-06 §4)
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Gleiche Etappen-Logik wie die deutsche Basisschrift (`etappen.ts`) und der französische,
 * spanische und italienische Lehrgang: kleine Gruppen neuer Zeichen, danach Wörter und Sätze
 * nur aus dem, was schon gelernt ist, am Ende ganze Texte.
 *
 * ★ REIHENFOLGE DER BUCHSTABEN = HÄUFIGKEIT IM SCHWEDISCHEN. Quelle: Wikipedia (en) „Letter
 *   frequency", Spalte Swedish, nach practicalcryptography.com (abgerufen 07.11.2026):
 *   e a n r t s i l d o m k g v h f u p ä b c å ö y j x w z q. é kommt danach (die Quelle kennt es nicht;
 *   die Einordnung ist EIGENE Entscheidung, keine Messung). à è ü stehen in der Norm, aber in keinem
 *   Übungswort der Korpora: sie sind in Zeichentabelle und Engine, nicht im Lehrgang.
 * ★ SCHRIFTART: „Svensk punktskrift" (so heißt die Skriftserie der Norm: Punktskriftsnämnden / MTM,
 *   *Svenska skrivregler för punktskrift*, 2009). Hier ohne jede Kürzung (Kortskrift 1-4 ist nicht
 *   Teil dieses Auftrags). Zeichen und Regeln: `zeichen.ts` und `engine.ts`; Abweichungen von
 *   liblouis: BEFUND-2026-11-07-PUNKTGENAU-SV-NORM.md.
 * ★ ZAHLEN: Siffertecken 3-4-5-6 und die Buchstaben a-j (Norm 5.1, S. 49). In der Zahl bleiben Komma
 *   und Punkt, ein Leerzeichen beendet sie (100 000 = zwei Siffertecken, 5.3, S. 50).
 * ★ WÖRTER UND SÄTZE kommen aus den Tastenflow-Korpora für Schwedisch (`typing/wordsSv.ts`,
 *   `lexikonNachtragSv.ts`, `corpusSvWegCharge1Kids.ts`, `serienSvKids1.ts` - Kinder-Texte), vorgefiltert von
 *   `scripts/sv-lehrgang-erzeugen.mts` nach `generated/sv-lehrgang.generated.json`.
 * ★ ANSPRACHE: „du" - wie Tastenflow auf Schwedisch (`curriculumSv.ts`). Das Schwedische hat keine
 *   Höflichkeitsform; für Lehrkräfte steht deshalb dasselbe „du" (Texte „sie" = Fachtext ohne Anrede).
 */
import { type BuchstabenGruppe, einheitenAus, lehrgangBauer, namenMit, saetzeMit, woerterMit } from "../lehrgangBauen";
import POOL from "./generated/sv-lehrgang.generated.json";

/** Reihenfolge der Buchstaben: Häufigkeit (siehe Kopf). */
export const SV_BUCHSTABEN_REIHENFOLGE = "eanrtsildomkgvhfupäbcåöyjxwzqé";

/** Sprechbare Namen (für Vorlesen und Merkhilfe), wie man sie auf Schwedisch sagt. */
const BUCHSTABENNAME: Record<string, string> = {
  a: "a", b: "be", c: "se", d: "de", e: "e", f: "eff", g: "ge", h: "hå", i: "i", j: "ji", k: "kå",
  l: "ell", m: "emm", n: "enn", o: "o", p: "pe", q: "ku", r: "ärr", s: "ess", t: "te", u: "u",
  v: "ve", w: "dubbel-ve", x: "ex", y: "y", z: "säta", å: "å", ä: "ä", ö: "ö", é: "e med akut accent",
};
const ZEICHENNAME: Record<string, string> = {
  ".": "punkt", ",": "komma", "?": "frågetecken", "!": "utropstecken", ";": "semikolon", ":": "kolon",
  "-": "bindestreck", "(": "vänsterparentes", ")": "högerparentes", '"': "citattecken",
  "+": "plus", "−": "minus", "=": "likhetstecken", "×": "gånger", "/": "snedstreck",
  NUM: "siffertecken", "1": "ett", "2": "två", "3": "tre", "4": "fyra", "5": "fem", "6": "sex",
  "7": "sju", "8": "åtta", "9": "nio", "0": "noll",
  VERSAL: "versaltecken",
};
const einheiten = einheitenAus({ ...BUCHSTABENNAME, ...ZEICHENNAME });

const R = SV_BUCHSTABEN_REIHENFOLGE;
const bis = (n: number): string => R.slice(0, n);
/** Die ersten `n` Buchstaben der Reihenfolge. */
export const svBuchstabenBis = bis;

const GRUPPEN: BuchstabenGruppe[] = [
  {
    id: "sv-1", bis: 4, titel: "e, a, n, r: de första bokstäverna",
    du: "Vi börjar med fyra mycket vanliga bokstäver: e, a, n och r. Med dem kan du redan skriva «en», «ren» och «arn». Skriv med punkterna: du hör direkt om det blev rätt.",
    sie: "Bokstäverna lärs ut efter frekvens i svenskan (Practical Cryptography, via Wikipedia: Letter frequency): e, a, n, r. De vanligaste kommer först så att riktiga ord dyker upp tidigt.",
  },
  {
    id: "sv-2", bis: 8, titel: "t, s, i, l: riktiga ord",
    du: "Fyra bokstäver till: t, s, i och l. Nu kan du skriva «tal», «sil» och «lista». Titta noga på hur varje cell ser ut.",
    sie: "Frekvensordningen fortsätter: t, s, i, l. Med åtta bokstäver går det redan att bilda många korta ord.",
  },
  {
    id: "sv-3", bis: 12, titel: "d, o, m, k: tolv bokstäver",
    du: "Med d, o, m och k har du tolv bokstäver. Nu skriver du «mord», «kloka» och «mormor». D (punkt 1-4-5), k (punkt 1-3) och m (punkt 1-3-4) är lätta att blanda ihop med fingret: ta det lugnt.",
    sie: "Frekvensordningen fortsätter: d, o, m, k. D (145), k (13) och m (134) ligger nära varandra och förväxlas lätt med känseln.",
  },
  {
    id: "sv-4", bis: 16, titel: "g, v, h, f: fler ord",
    du: "Nu g, v, h och f. Du skriver «gata», «hav» och «fågel». Ta din egen takt: varje rätt cell tar dig till nästa.",
    sie: "Frekvensordningen fortsätter: g, v, h, f. Med sexton bokstäver växer övningsorden till hundratals.",
  },
  {
    id: "sv-5", bis: 20, titel: "u, p, ä, b: ä som egen bokstav",
    du: "Fyra bokstäver till: u, p, b och ä. Ä (punkt 3-4-5) är en egen bokstav med en egen cell, inte ett a med prickar. Du skriver «bäst», «päron» och «uppe».",
    sie: "Frekvensordningen fortsätter: u, p, ä, b. Ä (345) är ett eget tecken i det svenska punktskriftsalfabetet, inte a med tillägg (Svenska skrivregler för punktskrift, avsnitt 1.1, s. 14).",
  },
];

const GRUPPEN_NACH_VERSAL: BuchstabenGruppe[] = [
  {
    id: "sv-6", bis: 24, titel: "c, å, ö, y: å och ö",
    du: "Här kommer c, å, ö och y. Å (punkt 1-6) och ö (punkt 2-4-6) har varsin egen cell. Du skriver «cykel», «åka», «öga» och «ryssjan».",
    sie: "Frekvensordningen fortsätter: c, å, ö, y. Å (16) och ö (246) är egna tecken (avsnitt 1.1, s. 14). Alfabetet i boken är ordnat efter systematiken i punkterna och har w, å, ä, ö på en egen rad.",
  },
  {
    id: "sv-7", bis: 28, titel: "j, x, w, z: sällsynta bokstäver",
    du: "Fyra sällsynta bokstäver: j, x, w och z. W (punkt 2-4-5-6) kommer från andra språk. Du skriver «jul», «taxi», «webb» och «zebra».",
    sie: "Frekvensordningen fortsätter: j, x, w, z. W (2456) står i det svenska alfabetet efter z och före å (avsnitt 1.1, s. 14).",
  },
  {
    id: "sv-8", bis: 30, titel: "q och é: de sista bokstäverna",
    du: "De sista: q (punkt 1-2-3-4-5) och é med akut accent (punkt 1-2-3-4-5-6, alla sex punkter). Du skriver «quiz», «idé» och «kafé». Nu kan du alla bokstäver!",
    sie: "q (12345) och é (123456; avsnitt 4.1.1, s. 39: en av fyra bokstäver med diakritiskt tecken som har ett eget tecken). Efter den här etappen är alla bokstäverna kända. Placeringen av é är ett eget val: frekvenskällan tar inte med den.",
  },
];

// ─── Etappen und Levels ──────────────────────────────────────────────────────
const B = lehrgangBauer("sv");
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
  id: "sv-versal", title: "Versaler: namn",
  introducedUnits: [{ key: "CAPS", spoken: ZEICHENNAME.VERSAL }],
  introDu:
    "I punktskrift finns inget stort A. Punkt 6 säger: «nu kommer en stor bokstav». Den skrivs precis framför bokstaven: så blir «lisa» till «Lisa». Du övar på namn.",
  introSie:
    "Versaltecken (punkt 6) framför den bokstav som är versal (Svenska skrivregler för punktskrift, avsnitt 3.2.1, s. 30). Ord som består av bara versaler (SAV) får två versaltecken framför (3.2.2, s. 30); det tränas inte här. En följd av tre eller fler versaler följd av gemener (IKEAs) skriver boken på två olika sätt (3.2.2 och 3.2.4) och skrivs därför inte.",
  legend: "Lisa = ⠠ l i s a",
  kind: "words",
  items: namenMit(NAMEN, bis(20)),
});

for (const g of GRUPPEN_NACH_VERSAL) {
  const neu = R.slice(vorher, g.bis);
  dazu({
    id: g.id, title: g.titel, introducedUnits: einheiten(neu), introDu: g.du, introSie: g.sie,
    legend: [...neu].join(" "), kind: "words", items: woerterMit(WOERTER, bis(g.bis)),
  });
  vorher = g.bis;
}

dazu({
  id: "sv-gemischt", title: "Alla bokstäver, blandat",
  introducedUnits: [],
  introDu: "Nu kan du alla bokstäver. Här kommer blandade ord: känn igen varje cell.",
  introSie: "Repetition: alla ord, utan något nytt tecken.",
  legend: "",
  kind: "words",
  items: () => woerterMit(WOERTER, R)().filter((w) => w.length >= 3),
});

dazu({
  id: "sv-sats1", title: "Punkt och komma",
  introducedUnits: einheiten(".,"),
  introDu:
    "Punkten (punkt 3) och kommat (punkt 2) sitter direkt efter ordet, utan mellanrum. Nu skriver du riktiga meningar.",
  introSie:
    "Punkt 3 och komma 2 (Svenska skrivregler för punktskrift, avsnitt 2.1, s. 19). Observera: i en siffergrupp är komma (2) decimaltecken och punkt (3) decimalpunkt (5.2, s. 49).",
  legend: ". ,",
  zeichen: [".", ","],
  kind: "sentences",
  items: saetzeMit(SAETZE, R, ".,", ".,", 60),
});

dazu({
  id: "sv-sats2", title: "? och !: frågor och utrop",
  introducedUnits: einheiten("?!"),
  introDu:
    "Frågetecknet har punkt 2-6 och utropstecknet punkt 2-3-5. Båda sitter direkt efter sista ordet.",
  introSie:
    "Frågetecken 2-6 och utropstecken 2-3-5 (avsnitt 2.1, s. 19). I svenskan finns inget inledande ? eller !.",
  legend: "? !",
  zeichen: ["?", "!"],
  kind: "sentences",
  items: saetzeMit(SAETZE, R, ".,?!", "?!", 60),
});

dazu({
  id: "sv-sats3", title: ": ; - ( ) och citattecken",
  introducedUnits: einheiten(':;-()"'),
  introDu:
    "Kolon (punkt 2-5), semikolon (2-3), bindestreck (3-6), vänsterparentes (2-3-6) och högerparentes (3-5-6). Citattecknet (punkt 5-6) är likadant när det öppnar och när det stänger.",
  introSie:
    "Kolon 2-5 och semikolon 2-3 (avsnitt 2.1, s. 19), bindestreck 3-6 (2.2, s. 20), rund parentes 2-3-6 och 3-5-6 (2.3, s. 21), citattecken 5-6 för alla slags dubbla citattecken (s. 19). Tankstreck (3-6 3-6) tränas inte: i tangentbordstexterna skrivs det som bindestreck.",
  legend: ': ; - ( ) "',
  zeichen: [":", ";", "-", "(", ")", '"'],
  kind: "sentences",
  items: saetzeMit(SAETZE, R, '.,?!:;-()"', ':;-()"', 70),
});

const ZAHLEN = ["1", "2", "5", "8", "10", "12", "20", "42", "100", "2026", "3,5", "7", "9", "15", "36", "1999", "300", "64"];
dazu({
  id: "sv-siffror", title: "Siffror",
  introducedUnits: [{ key: "#", spoken: ZEICHENNAME.NUM }, ...einheiten("1234567890")],
  introDu:
    "För siffror skriver du först siffertecknet (punkt 3-4-5-6) och sedan bokstäverna från a till j: a är 1, b är 2 ... i är 9 och j är 0. Siffertecknet skrivs bara en gång framför hela talet: 2026 är «siffertecken, b, j, b, f».",
  introSie:
    "Siffertecken (3-4-5-6) framför de tio första bokstäverna (Svenska skrivregler för punktskrift, avsnitt 5.1, s. 49). Siffertecknet gäller hela sifferföljden inklusive komma (2) och punkt (3); blanktecken och alla andra tecken upphäver det, så siffertecknet skrivs igen (5.3, s. 50). Följs en siffra av en gemen bokstav a-j ska avslutningstecknet (1-5-6) stå emellan (5.5, s. 55); det tränas inte på den här nivån.",
  legend: "1 2 3 4 5 6 7 8 9 0",
  zeichen: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
  kind: "words",
  items: () => ZAHLEN,
});

dazu({
  id: "sv-plus", title: "Plus, minus och lika med",
  introducedUnits: einheiten("+−="),
  introDu:
    "Räknetecknen: plus (punkt 2-5-6), minus (3-6) och lika med (2-3-5-6). Varje tal får sitt eget siffertecken: «2 + 3 = 5».",
  introSie:
    "Additionstecken (plus) 2-5-6, subtraktionstecken (minus) 3-6 och likhetstecken 2-3-5-6 (Svenska skrivregler för punktskrift, avsnitt 6.1-6.3, s. 57-58). Minus har samma tecken som bindestreck (3-6). Tecknen står med blanktecken omkring.",
  legend: "+ − =",
  zeichen: ["+", "−", "="],
  kind: "words",
  items: () => ["2 + 3 = 5", "7 − 4 = 3", "6 + 6 = 12", "9 − 5 = 4", "10 + 5 = 15", "8 − 3 = 5", "1 + 1 = 2", "20 − 10 = 10"],
});

dazu({
  id: "sv-gange", title: "Gånger och delat med",
  introducedUnits: einheiten("×/"),
  introDu:
    "Två tecken till: «gånger» × (två celler: punkt 1-2-4-5-6 och punkt 1-3-4-6) och «delat med» / (punkt 3-4). Division skrivs utan blanktecken: «3 × 4 = 12», «12/4 = 3».",
  introSie:
    "Multiplikationstecken (kryss) 1-2-4-5-6 följt av 1-3-4-6 (avsnitt 6.4.2, s. 58-59) och snedstreck 3-4 som divisionstecken (6.5.1, s. 60; divisionstecknet bör inte omges av blanktecken). Boken har inget tecken för ÷.",
  legend: "× /",
  zeichen: ["×", "/"],
  kind: "words",
  items: () => ["3 × 4 = 12", "2 × 5 = 10", "12/4 = 3", "8/2 = 4", "5 × 5 = 25", "9/3 = 3", "7 × 2 = 14", "20/5 = 4"],
});

dazu({
  id: "sv-texte", title: "Läsa och skriva hela texter",
  introducedUnits: [],
  introDu: "Bra jobbat, nu kan du all grundläggande punktskrift! Nu läser och skriver du små hela texter.",
  introSie:
    "Slutetapp: sammanhängande texter med alla tecken som lärts ut (bokstäver, versaler, vanlig skiljetecken).",
  legend: "",
  kind: "text",
  items: () => [...TEXTE],
});

/** Alle Etappen des schwedischen Lehrgangs, in Reihenfolge. */
export const SV_ETAPPEN = B.etappen;
/** Die zugehörigen Levels (Aufgabenvorrat je Etappe). */
export const SV_LEVELS = B.levels;

export function svLevelById(id: string) {
  return SV_LEVELS.find((l) => l.id === id);
}

/** Die Wortvorräte (für Tests und Werkzeuge). */
export const SV_POOL = { woerter: WOERTER, namen: NAMEN, saetze: SAETZE, texte: TEXTE };
