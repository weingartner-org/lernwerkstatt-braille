/**
 * Das Rechen-Wörterbuch auf Französisch: aus einer Plus-Zeile wird ein Satz
 * (Gegenstück zu `rechnen.ts` deutsch und `rechnenEn.ts` englisch).
 *
 * ★ Zahlwörter: `typing/zahlwort.ts` (`zahlwortFr(n, "fr-FR")`, von Tastenflow)
 *   kann 0 bis 9999 mit allen Regeln für 70 bis 99 (soixante-dix, quatre-vingts,
 *   quatre-vingt-dix ...) - es wird nicht neu geschrieben. Hier werden Tausender
 *   und Millionen zusammengesetzt. Frankreich ist die Grundform; Belgien und die
 *   Schweiz (septante, nonante) hat Plus nicht (Plus kennt keine Landesvariante).
 * ★ Dezimalzahlen mit „virgule", nach dem Komma Ziffer für Ziffer (0,75 wird
 *   „zéro virgule" und zwei Ziffernwörter): die zweite Form wäre bei 0,75 und 0,075 fast gleich.
 * ★ Gebaut ist, was Plus in Französisch anbietet (`sprachfilter.ts`): Zahlen mit
 *   Komma, Brüche, Prozent, Euro, + - * / = < > Klammern, Lücke `[]`.
 * ★ `=` heißt „égale": „quarante-huit plus vingt-sept égale" - wie „ist" im Deutschen.
 */
import { zahlwortFr, type FranzZaehlweise } from "@/lib/typing/zahlwort";

const FR = "fr-FR" as const;

/**
 * ★ Landesvariante beim Vorlesen (Plus-Region, 10.11.2026): wie 70/80/90 heissen
 *   (`FranzZaehlweise`) und welche Währung ausgesprochen wird. Ohne Angabe gilt
 *   Frankreich - die alten Aufrufe ändern sich nicht.
 */
export interface FranzSprechweise {
  zaehlweise?: FranzZaehlweise;
}

/** 0 bis 999 999 999 in Worten. */
export function zahlwortFrGross(n: number, z: FranzZaehlweise = FR): string {
  if (n < 10000) return zahlwortFr(n, z);
  if (n >= 1_000_000_000) return String(n);
  const mio = Math.floor(n / 1_000_000);
  const tsd = Math.floor((n % 1_000_000) / 1000);
  const rest = n % 1000;
  // Vor „mille" kein Plural-s: „deux-cent-mille", „quatre-vingt-mille".
  const vorMille = (m: number) => zahlwortFr(m, z).replace(/(?:cents|vingts)$/, (w) => w.slice(0, -1));
  const unten: string[] = [];
  if (tsd) unten.push(tsd === 1 ? "mille" : `${vorMille(tsd)}-mille`);
  if (rest) unten.push(zahlwortFr(rest, z));
  const kopf = mio ? (mio === 1 ? "un million" : `${zahlwortFrGross(mio, z)} millions`) : "";
  return [kopf, unten.join("-")].filter(Boolean).join(" ");
}

/** „3,5" als „trois virgule cinq". */
export function dezimalwortFr(text: string, z: FranzZaehlweise = FR): string {
  const [ganz, nach] = text.split(",");
  const kopf = zahlwortFrGross(Number(ganz), z);
  return nach === undefined ? kopf : `${kopf} virgule ${[...nach].map((d) => zahlwortFr(Number(d), z)).join(" ")}`;
}

const NENNER_FR: Record<number, string> = {
  3: "tiers", 4: "quart", 5: "cinquième", 6: "sixième", 7: "septième", 8: "huitième",
  9: "neuvième", 10: "dixième", 11: "onzième", 12: "douzième", 13: "treizième", 14: "quatorzième",
  15: "quinzième", 16: "seizième", 17: "dix-septième", 18: "dix-huitième", 19: "dix-neuvième", 20: "vingtième",
};

/** 3/4 als „trois quarts", 1/2 als „un demi"; ohne gebräuchlichen Namen „trois sur vingt-trois". */
export function bruchwortFr(zaehler: number, nenner: number, z: FranzZaehlweise = FR): string {
  if (nenner === 2) return zaehler === 1 ? "un demi" : `${zahlwortFrGross(zaehler, z)} demis`;
  const name = NENNER_FR[nenner];
  if (!name) return `${zahlwortFrGross(zaehler, z)} sur ${zahlwortFrGross(nenner, z)}`;
  if (zaehler === 1) return `un ${name}`;
  return `${zahlwortFrGross(zaehler, z)} ${name}${name.endsWith("s") ? "" : "s"}`;
}

/** Die Währungen beim Vorlesen: Wort der Einheit und des Cent-Worts (Plus-Region, 10.11.2026). */
const GELDARTEN = {
  euro: { einheit: "euro", cent: "centime" },
  franc: { einheit: "franc", cent: "centime" },
  dollar: { einheit: "dollar", cent: "cent" },
} as const;

export type FranzGeld = keyof typeof GELDARTEN;

/** „2,50 €" als „deux euros cinquante" (mit `franc`: „deux francs cinquante", mit `dollar`: „deux dollars cinquante"). */
export function geldwortFr(betrag: string, z: FranzZaehlweise = FR, geld: FranzGeld = "euro"): string {
  const w = GELDARTEN[geld];
  const [euro, cent] = betrag.split(",");
  const e = Number(euro);
  const c = cent ? Number(cent.length === 1 ? `${cent}0` : cent) : 0;
  if (e === 0 && c > 0) return `${zahlwortFrGross(c, z)} ${c === 1 ? w.cent : `${w.cent}s`}`;
  const kopf = `${zahlwortFrGross(e, z)} ${e > 1 ? `${w.einheit}s` : w.einheit}`;
  return c === 0 ? kopf : `${kopf} ${zahlwortFrGross(c, z)}`;
}

const OPERATOR: Array<[RegExp, string]> = [
  [/\s*>=\s*/g, " est plus grand ou égal à "],
  [/\s*<=\s*/g, " est plus petit ou égal à "],
  [/\s*!=\s*/g, " est différent de "],
  [/\s*<\s*/g, " est plus petit que "],
  [/\s*>\s*/g, " est plus grand que "],
  [/\s*\+\s*/g, " plus "],
  [/\s*\*\s*/g, " fois "],
  [/\s+\/\s*/g, " divisé par "],
  [/\s*-\s*/g, " moins "],
  [/\s*=\s*/g, " égale "],
];

function eineZeileFr(zeile: string, z: FranzZaehlweise): string {
  let s = zeile.trim();
  if (!s || /^-{3,}$/.test(s)) return "";
  const nurRechnung = !/[A-Za-zÀ-ÿ]{2,}/.test(s.replace(/\[\]/g, ""));

  // ★ Zuerst die Zeichen: die Zahlwörter tragen selbst Bindestriche („quarante-huit").
  if (nurRechnung) {
    s = s.replace(/\(/g, " ouvre la parenthèse ").replace(/\)/g, " ferme la parenthèse ");
    s = s.replace(/\[\]/g, " case vide ").replace(/\[/g, " ouvre le crochet ").replace(/\]/g, " ferme le crochet ");
    s = s.replace(/\{/g, " ouvre l'accolade ").replace(/\}/g, " ferme l'accolade ");
    for (const [muster, wort] of OPERATOR) s = s.replace(muster, wort);
  }
  s = s.replace(/(\d+(?:,\d{1,2})?)\s*€/g, (_, b) => geldwortFr(b, z));
  // Schweiz und Québec schreiben das Geld als Wort („2,50 francs", „2,50 dollars"), siehe `regionen.ts`.
  s = s.replace(/(\d+(?:,\d{1,2})?) (franc|dollar)s?\b/g, (_, b, art) => geldwortFr(b, z, art));
  s = s.replace(/\b(\d+) (\d+)\/(\d+)\b/g, (_, g, zl, n) => `${zahlwortFrGross(Number(g), z)} et ${bruchwortFr(Number(zl), Number(n), z)}`);
  s = s.replace(/(?<![\d,])(\d+)\/(\d+)(?![\d,])/g, (_, zl, n) => bruchwortFr(Number(zl), Number(n), z));
  s = s.replace(/(\d+(?:,\d+)?)\s*%/g, (_, zl) => `${dezimalwortFr(zl, z)} pour cent`);
  s = s.replace(/\d+(?:,\d+)?/g, (zl) => dezimalwortFr(zl, z));
  return s.replace(/\s+/g, " ").trim();
}

/** Eine (auch mehrzeilige) Angabe in einen gesprochenen Satz verwandeln. */
export function sprichFr(zeile: string, weise: FranzSprechweise = {}): string {
  const z = weise.zaehlweise ?? FR;
  return zeile
    .split("\n")
    .map((l) => eineZeileFr(l, z))
    .filter((z) => z.length > 0)
    .reduce((satz, z) => (satz ? `${satz}${/[.?!]$/.test(satz) ? " " : ". "}${z}` : z), "");
}
