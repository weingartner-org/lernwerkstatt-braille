/**
 * ════════════════════════════════════════════════════════════════════════════
 * FRANZÖSISCH (fr) - DER LEHRGANG „BRAILLE INTÉGRAL" (Bauplan 2026-11-06 §4)
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Gleiche Etappen-Logik wie die deutsche Basisschrift (`etappen.ts`): kleine
 * Gruppen neuer Zeichen, danach Wörter und Sätze nur aus dem, was schon gelernt
 * ist, am Ende ganze Texte. Eigene Reihenfolge, eigene Wörter:
 *
 * ★ REIHENFOLGE DER BUCHSTABEN = HÄUFIGKEIT IM FRANZÖSISCHEN. Quelle: Wikipedia
 *   fr, „Fréquence d'apparition des lettres", Tabelle nach dem Korpus
 *   *REDAC WikipédiaFR2008* (CLLE-ERSS, Université de Toulouse, 2008; abgerufen
 *   06.11.2026):  e a i s n r t o l u d c m p é g b v h f q y x j è à k w z ê ç
 *   ô â î û ù ï ü ë (œ steht dort nicht, kommt zuletzt). Innerhalb der Gruppen
 *   gilt diese Reihenfolge; die Gruppen sind so geschnitten, dass sich die
 *   Wortvorräte sofort füllen.
 * ★ SCHRIFTART: „braille intégral" (Norm: CBFU 2008, S. 36 und 28 - das Gegenstück
 *   zum „braille abrégé"). Hier ohne jede Kürzung. Zeichen und Regeln:
 *   `zeichen.ts` und `engine.ts`; Abweichungen von liblouis: BEFUND-2026-11-07.
 * ★ ZAHLEN: nur die Antoine-Notation (CBFU 1.2 a, S. 27) - Punkt 6, dann die
 *   Ziffer. Die Louis-Braille-Ziffern (Tableau 2a, S. 20) werden nicht gelehrt.
 * ★ WÖRTER UND SÄTZE kommen aus den Tastenflow-Korpora für Französisch
 *   (`typing/wordsFr.ts`, `corpusFr*Kids.ts`), vorgefiltert von
 *   `scripts/fr-lehrgang-erzeugen.mts` nach `generated/fr-lehrgang.generated.json`
 *   (eigene Zeilen, keine Tatoeba-Sätze). Hier wird nur noch auf die schon
 *   gelernten Zeichen gefiltert.
 * ★ ANSPRACHE: Kinder „tu", wie Tastenflow auf Französisch (`curriculumFr.ts`).
 */
import type { Level } from "../../curriculum";
import { defaultGate, type Etappe, type EtappenUnit } from "../../etappen";
import POOL from "./generated/fr-lehrgang.generated.json";

/** Reihenfolge der Buchstaben: Häufigkeit (siehe Kopf). œ steht in der Quelle nicht und kommt zuletzt. */
export const FR_BUCHSTABEN_REIHENFOLGE = "eaisnrtolucdmpégbvhfqyxjèàkwzêçôâîûùïüëœ";

/** Sprechbare Namen (für Vorlesen und Merkhilfe), wie man sie auf Französisch sagt. */
const BUCHSTABENNAME: Record<string, string> = {
  a: "a", b: "bé", c: "cé", d: "dé", e: "e", f: "effe", g: "gé", h: "hache", i: "i", j: "ji", k: "ka",
  l: "elle", m: "emme", n: "enne", o: "o", p: "pé", q: "ku", r: "erre", s: "esse", t: "té", u: "u",
  v: "vé", w: "double vé", x: "ixe", y: "i grec", z: "zède", ç: "c cédille", é: "e accent aigu",
  è: "e accent grave", à: "a accent grave", ù: "u accent grave", â: "a accent circonflexe",
  ê: "e accent circonflexe", î: "i accent circonflexe", ô: "o accent circonflexe",
  û: "u accent circonflexe", ë: "e tréma", ï: "i tréma", ü: "u tréma", œ: "o e dans l'o",
};
const ZEICHENNAME: Record<string, string> = {
  ".": "point", ",": "virgule", "'": "apostrophe", "?": "point d'interrogation",
  "!": "point d'exclamation", ";": "point-virgule", ":": "deux-points", "-": "trait d'union",
  "(": "parenthèse ouvrante", ")": "parenthèse fermante", '"': "guillemet",
  "+": "plus", "−": "moins", "=": "égale", "×": "multiplié par", "÷": "divisé par",
  MOD: "modificateur mathématique", "1": "un", "2": "deux", "3": "trois", "4": "quatre",
  "5": "cinq", "7": "sept", "8": "huit", "9": "neuf", "0": "zéro",
  "MAJ": "indicateur de majuscule",
};

const einheiten = (zeichen: string): EtappenUnit[] =>
  [...zeichen].map((k) => ({ key: k, spoken: BUCHSTABENNAME[k] ?? ZEICHENNAME[k] ?? k }));

// ─── Wortvorräte (aus dem Erzeuger-Skript, hier nur gefiltert) ───────────────
const WOERTER: readonly string[] = POOL.woerter;
const NAMEN: readonly string[] = POOL.namen;
const SAETZE: readonly string[] = POOL.saetze;
const TEXTE: readonly string[] = POOL.texte;

const menge = (buchstaben: string, extra = ""): Set<string> => new Set([...buchstaben, ...extra]);
/** Die ersten `n` Buchstaben der Reihenfolge. */
export const frBuchstabenBis = (n: number): string => FR_BUCHSTABEN_REIHENFOLGE.slice(0, n);

const woerterMit = (buchstaben: string) => (): string[] => {
  const s = menge(buchstaben);
  return WOERTER.filter((w) => w.length >= 2 && [...w].every((c) => s.has(c)));
};
const namenMit = (buchstaben: string) => (): string[] => {
  const s = menge(buchstaben);
  return NAMEN.filter((w) => [...w.toLowerCase()].every((c) => s.has(c)));
};
const saetzeMit = (satzzeichen: string, neu: string, maxLaenge = 70) => (): string[] => {
  const s = menge(FR_BUCHSTABEN_REIHENFOLGE);
  const erlaubt = new Set([...s, ...satzzeichen]);
  return SAETZE.filter(
    (t) =>
      t.length <= maxLaenge &&
      [...t.toLowerCase()].every((c) => erlaubt.has(c) || c === " ") &&
      [...neu].some((z) => t.includes(z)),
  );
};

// ─── Die Gruppen neuer Buchstaben ────────────────────────────────────────────
interface BuchstabenGruppe {
  id: string;
  /** Wie viele Buchstaben der Reihenfolge nach dieser Gruppe bekannt sind. */
  bis: number;
  titel: string;
  du: string;
  sie: string;
}

const GRUPPEN: BuchstabenGruppe[] = [
  {
    id: "fr-1", bis: 4, titel: "e, a, i, s : les premières lettres",
    du: "On commence par quatre lettres très fréquentes en français : e, a, i et s. Avec elles, tu écris déjà « ai », « as », « sa » et « si ». Tape avec les points : tu entends tout de suite si c'est juste.",
    sie: "Les lettres sont enseignées dans l'ordre de leur fréquence en français (corpus WikipédiaFR 2008, CLLE-ERSS) : e, a, i, s. Les plus fréquentes viennent d'abord, pour que de vrais mots apparaissent très tôt.",
  },
  {
    id: "fr-2", bis: 8, titel: "n, r, t, o : de vrais mots",
    du: "Quatre lettres de plus : n, r, t et o. Tu peux écrire « rose », « train » et « sortie ». Écoute bien la forme de chaque cellule.",
    sie: "Suite de l'ordre de fréquence : n, r, t, o. Huit lettres suffisent déjà pour une centaine de mots.",
  },
  {
    id: "fr-3", bis: 12, titel: "l, u, d, c : douze lettres",
    du: "Avec l, u, d et c, tu as douze lettres. Voici « lune », « lundi » et « salade ». Chaque lettre a sa place dans la cellule : l, u et d se ressemblent, prends ton temps.",
    sie: "Suite de l'ordre de fréquence : l, u, d, c. Les trois lettres l (1-2-3), u (1-3-6) et d (1-4-5) se confondent facilement au toucher : elles sont enseignées ensemble pour être comparées.",
  },
  {
    id: "fr-4", bis: 16, titel: "m, p, é, g : le premier é",
    du: "Voici m, p, g et ton premier accent : é (points 1-2-3-4-5-6, la cellule pleine). Tu écris « maman », « pomme » et « été ».",
    sie: "Suite de l'ordre de fréquence : m, p, é, g. Le é est la lettre accentuée la plus fréquente (1,94 %) ; en braille, c'est un caractère à part entière (CBFU, tableau 1, p. 16), pas une lettre suivie d'un accent.",
  },
  {
    id: "fr-5", bis: 20, titel: "b, v, h, f : vingt lettres",
    du: "Quatre lettres de plus : b, v, h et f. Tu écris « vélo », « bateau » et « fleur ». Il ne te manque plus que quelques lettres rares.",
    sie: "Suite de l'ordre de fréquence : b, v, h, f. Vingt lettres sont connues ; l'apprenant peut lire la plupart des mots courts.",
  },
];

const GRUPPEN_NACH_MAJ: BuchstabenGruppe[] = [
  {
    id: "fr-6", bis: 24, titel: "q, y, x, j : les lettres plus rares",
    du: "Voici q, y, x et j. Tu écris « jeu », « taxi » et « quatre ». Ces lettres sont rares, mais elles sont partout dans les mots.",
    sie: "Suite de l'ordre de fréquence : q, y, x, j.",
  },
  {
    id: "fr-7", bis: 29, titel: "è, à, k, w, z : accents grave et lettres étrangères",
    du: "Ici, é a deux cousins : è (points 2-3-4-6) et à (points 1-2-3-5-6). Tu apprends aussi k, w et z. Exemples : « mère », « là », « zéro ».",
    sie: "Suite de l'ordre de fréquence : è (2346), à (12356), k, w (2456, après le ï dans le tableau de la norme), z. Les accents graves sont des caractères à part entière.",
  },
  {
    id: "fr-8", bis: 32, titel: "ê, ç, ô : les lettres rares",
    du: "Maintenant ê, ç et ô. Tu écris « fête », « garçon » et « côté ».",
    sie: "Suite de l'ordre de fréquence : ê (126), ç (12346), ô (1456).",
  },
  {
    id: "fr-9", bis: 36, titel: "â, î, û, ù : les derniers accents",
    du: "Encore quatre accents : â, î, û et ù. Ils sont rares, mais tu les croises dans « âne », « où » ou « sûr ».",
    sie: "Suite de l'ordre de fréquence : â (16), î (146), û (156), ù (23456). La nouvelle orthographe supprime l'accent circonflexe de î et û dans beaucoup de mots ; il reste quand il distingue deux mots (sûr, dû).",
  },
  {
    id: "fr-10", bis: 40, titel: "ï, ü, ë, œ : les dernières lettres",
    du: "Voici les quatre dernières : ï, ü, ë et œ. Tu écris « maïs », « Noël » et « cœur ». Tu connais maintenant toutes les lettres du français !",
    sie: "Suite de l'ordre de fréquence : ï (12456), ü (1256), ë (1246), œ (246). Le œ ne figure pas dans la table de fréquence utilisée ; il vient donc en dernier.",
  },
];

// ─── Etappen und Levels ──────────────────────────────────────────────────────
const LEVELS: Level[] = [];
const ETAPPEN: Etappe[] = [];

function dazu(
  e: Omit<Etappe, "levelId" | "system" | "masteryGate" | "lang" | "items"> & {
    kind: Level["kind"];
    items: () => string[];
  },
): void {
  const { kind, items, ...rest } = e;
  const levelId = e.id;
  LEVELS.push({
    id: levelId,
    title: e.title,
    kind,
    system: "voll",
    intro: e.introDu,
    legend: e.legend || undefined,
    zeichen: e.zeichen,
    items: items(),
  });
  ETAPPEN.push({
    ...rest,
    levelId,
    system: "voll",
    items: (alle) => alle,
    masteryGate: defaultGate(),
    lang: "fr",
  });
}

let vorher = 0;
for (const g of GRUPPEN) {
  const neu = FR_BUCHSTABEN_REIHENFOLGE.slice(vorher, g.bis);
  dazu({
    id: g.id, title: g.titel, introducedUnits: einheiten(neu), introDu: g.du, introSie: g.sie,
    legend: [...neu].join(" "), kind: "words", items: woerterMit(FR_BUCHSTABEN_REIHENFOLGE.slice(0, g.bis)),
  });
  vorher = g.bis;
}

dazu({
  id: "fr-maj", title: "Les majuscules : les prénoms",
  introducedUnits: [{ key: "CAPS", spoken: ZEICHENNAME.MAJ }],
  introDu:
    "En braille, il n'y a pas de A majuscule. Les points 4 et 6 annoncent une majuscule : ils se placent juste avant la lettre. Ainsi « lea » devient « Léa ». Tu t'entraines avec des prénoms.",
  introSie:
    "Indicateur de majuscule simple (points 4-6) devant le mot dont l'initiale est en majuscule (CBFU 1.1 a, p. 25). Dans le code de base, un mot entièrement en majuscules reçoit lui aussi UN seul indicateur ; l'indicateur de majuscules multiples (4-6, 4-6) relève des règles complémentaires (2.1, p. 42) et n'est pas enseigné ici.",
  legend: "Léa = ⠨ l é a",
  kind: "words",
  items: namenMit(frBuchstabenBis(20)),
});

for (const g of GRUPPEN_NACH_MAJ) {
  const neu = FR_BUCHSTABEN_REIHENFOLGE.slice(vorher, g.bis);
  dazu({
    id: g.id, title: g.titel, introducedUnits: einheiten(neu), introDu: g.du, introSie: g.sie,
    legend: [...neu].join(" "), kind: "words", items: woerterMit(FR_BUCHSTABEN_REIHENFOLGE.slice(0, g.bis)),
  });
  vorher = g.bis;
}

const ALLE = FR_BUCHSTABEN_REIHENFOLGE;
dazu({
  id: "fr-gemischt", title: "Toutes les lettres, mélangées",
  introducedUnits: [],
  introDu: "Tu connais toutes les lettres. Voici des mots variés : à toi de reconnaitre chaque cellule.",
  introSie: "Étape de consolidation : tous les mots, sans nouveau caractère.",
  legend: "",
  kind: "words",
  items: () => woerterMit(ALLE)().filter((w) => w.length >= 3),
});

dazu({
  id: "fr-satz1", title: "Le point, la virgule et l'apostrophe",
  introducedUnits: einheiten(".,'"),
  introDu:
    "Le point (points 2-5-6) et la virgule (point 2) se placent juste après le mot, sans espace. L'apostrophe est le point 3 : « l'ami », « j'ai ». Tu écris maintenant de vraies phrases.",
  introSie:
    "Point 2-5-6, virgule 2, apostrophe 3 (CBFU, tableau 1, p. 17). Le point et l'apostrophe ne partagent plus le même symbole : chaque symbole braille a une seule valeur typographique (introduction, p. 8). Les ponctuations qui suivent un mot lui sont accolées (1.3 a, p. 31).",
  legend: ". , '",
  zeichen: [".", ",", "'"],
  kind: "sentences",
  items: saetzeMit(".,'", ".,'", 60),
});

dazu({
  id: "fr-satz2", title: "? ! ; : : les signes qui parlent",
  introducedUnits: einheiten("?!;:"),
  introDu:
    "Le point d'interrogation (2-6), le point d'exclamation (2-3-5), le point-virgule (2-3) et les deux-points (2-5). En braille, il n'y a pas d'espace avant ces signes : « Viens ! » s'écrit « Viens! ».",
  introSie:
    "Les ponctuations ? ! ; : sont rapprochées du mot qui précède : l'espace de l'imprimé est supprimé (CBFU 1.3 a, p. 31). Les exercices sont donc écrits sans espace avant ces signes.",
  legend: "? ! ; :",
  zeichen: ["?", "!", ";", ":"],
  kind: "sentences",
  items: saetzeMit(".,'?!;:", "?!;:", 60),
});

dazu({
  id: "fr-satz3", title: "Trait d'union, parenthèses et guillemets",
  introducedUnits: einheiten('-()"'),
  introDu:
    "Le trait d'union (points 3-6), la parenthèse ouvrante (2-3-6) et la fermante (3-5-6). Les guillemets « » ou \" \" s'écrivent tous avec les mêmes points : 2-3-5-6.",
  introSie:
    "Trait d'union 3-6, parenthèses 2-3-6 et 3-5-6, guillemet 2-3-5-6 « quel que soit le caractère typographique utilisé » (CBFU 1.4, p. 33) ; le symbole fermant est rapproché du mot qui précède, l'ouvrant du mot qui suit (1.3 b, p. 31).",
  legend: '- ( ) "',
  zeichen: ["-", "(", ")", '"'],
  kind: "sentences",
  items: saetzeMit(".,'?!;:-()\"", "-()\"", 70),
});

const ZAHLEN = ["1", "2", "5", "8", "10", "12", "20", "42", "100", "2026", "3,5", "7", "9", "15", "36", "1999", "300", "64"];
dazu({
  id: "fr-zahlen", title: "Les chiffres (notation Antoine)",
  introducedUnits: [{ key: "#", spoken: ZEICHENNAME.MOD }, ...einheiten("1234567890")],
  introDu:
    "Pour les chiffres, tu mets d'abord le point 6, puis le chiffre. Les chiffres 1 à 9 sont les lettres a à i avec le point 6 en plus : 1 = points 1-6, 2 = points 1-2-6. Le zéro est à part : points 3-4-5-6. Le point 6 compte jusqu'à l'espace suivant : il ne se répète pas dans « 2026 ».",
  introSie:
    "Notation Antoine (CBFU 1.2 a, p. 27, tableau 2, p. 19) : le modificateur mathématique (point 6) précède la chaine de caractères, jusqu'au prochain espace ; les chiffres sont a-j + point 6, le zéro 3-4-5-6. La notation Louis Braille (tableau 2a, p. 20) n'est pas enseignée : le code l'ignore pour le braille littéraire français.",
  legend: "1 2 3 4 5 6 7 8 9 0",
  zeichen: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
  kind: "words",
  items: () => ZAHLEN,
});

dazu({
  id: "fr-plus", title: "Plus, moins et égale",
  introducedUnits: einheiten("+−="),
  introDu:
    "Les signes de calcul : plus (points 2-3-5), moins (3-6) et égale (2-3-5-6). Chaque signe seul, entre deux espaces, reçoit lui aussi le point 6 : « 2 + 3 = 5 ».",
  introSie:
    "Signes arithmétiques de base du tableau 2 (p. 19) : ils ne valent que précédés du modificateur mathématique ; l'exemple de la norme est « 2 × 5 = 10 » (1.2 b, p. 28). Le trait d'union et le signe moins ont la même cellule (3-6).",
  legend: "+ − =",
  zeichen: ["+", "−", "="],
  kind: "words",
  items: () => ["2 + 3 = 5", "7 − 4 = 3", "6 + 6 = 12", "9 − 5 = 4", "10 + 5 = 15", "8 − 3 = 5", "1 + 1 = 2", "20 − 10 = 10"],
});

dazu({
  id: "fr-mal", title: "Fois et divisé par",
  introducedUnits: einheiten("×÷"),
  introDu:
    "Deux signes de plus : « multiplié par » × (points 3-5) et « divisé par » ÷ (points 2-5). Eux aussi s'écrivent après le point 6 : « 3 × 4 = 12 », « 6 ÷ 3 = 2 ».",
  introSie:
    "× (3-5) et ÷ (2-5) du tableau 2 (p. 19) ; exemples de la norme : « 2 × 5 = 10 » et « 6 ÷ 3 = 2 » (1.2 b, p. 28). Attention : liblouis 3.39 écrit ces deux signes autrement (voir le constat 2026-11-07).",
  legend: "× ÷",
  zeichen: ["×", "÷"],
  kind: "words",
  items: () => ["3 × 4 = 12", "2 × 5 = 10", "6 ÷ 3 = 2", "8 ÷ 2 = 4", "5 × 5 = 25", "9 ÷ 3 = 3", "7 × 2 = 14", "12 ÷ 4 = 3"],
});

dazu({
  id: "fr-texte", title: "Lire et écrire des textes entiers",
  introducedUnits: [],
  introDu: "Bravo, tu connais tout le braille intégral ! Maintenant, tu lis et tu écris de petits textes entiers.",
  introSie:
    "Étape finale : textes continus qui réunissent tous les caractères enseignés (lettres, accents, majuscules, ponctuation courante).",
  legend: "",
  kind: "text",
  items: () => [...TEXTE],
});

/** Alle Etappen des französischen Lehrgangs, in Reihenfolge. */
export const FR_ETAPPEN: Etappe[] = ETAPPEN;
/** Die zugehörigen Levels (Aufgabenvorrat je Etappe). */
export const FR_LEVELS: Level[] = LEVELS;

export function frLevelById(id: string): Level | undefined {
  return LEVELS.find((l) => l.id === id);
}

/** Die Wortvorräte (für Tests und Werkzeuge). */
export const FR_POOL = { woerter: WOERTER, namen: NAMEN, saetze: SAETZE, texte: TEXTE };
