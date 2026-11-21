/**
 * Das Rechen-Wörterbuch auf Englisch: aus einer Plus-Zeile wird ein Satz
 * (Gegenstück zu `rechnen.ts`, das deutsch ist).
 *
 * ★ Zahlwörter: `typing/zahlwort.ts` (`zahlwort(n, "en")`, von Tastenflow) kann
 *   nur 0 bis 999 - hier wird für Tausender und Millionen zusammengesetzt, jede
 *   Gruppe mit demselben Wörterbuch. Die Zahlwörter selbst werden nicht neu
 *   geschrieben. Britisch: „one thousand and five".
 * ★ Gebaut ist, was Plus in Englisch anbietet (`sprachfilter.ts`): Zahlen mit
 *   Dezimalpunkt, Brüche, Prozent, Pfund, + - * / = < > Klammern, Lücke `[]`.
 *   Einheiten und Buchstaben kommen in den englischen Aufgaben nicht vor.
 * ★ `=` heißt „is": „two plus three is" - wie „ist" im Deutschen.
 */
import { zahlwort } from "@/lib/typing/zahlwort";

/** 0 bis 999 999 999 in Worten. */
export function zahlwortEn(n: number): string {
  if (n < 1000) return zahlwort(n, "en");
  const mio = Math.floor(n / 1_000_000);
  const tsd = Math.floor((n % 1_000_000) / 1000);
  const rest = n % 1000;
  const teile: string[] = [];
  if (mio) teile.push(`${zahlwortEn(mio)} million`);
  if (tsd) teile.push(`${zahlwort(tsd, "en")} thousand`);
  if (rest) teile.push(rest < 100 ? `and ${zahlwort(rest, "en")}` : zahlwort(rest, "en"));
  return teile.join(" ");
}

/** „3.5" als „three point five". */
export function dezimalwortEn(text: string): string {
  const [ganz, nach] = text.split(".");
  const kopf = zahlwortEn(Number(ganz));
  return nach === undefined ? kopf : `${kopf} point ${[...nach].map((d) => zahlwort(Number(d), "en")).join(" ")}`;
}

const NENNER_EN: Record<number, string> = {
  2: "half", 3: "third", 4: "quarter", 5: "fifth", 6: "sixth", 7: "seventh", 8: "eighth",
  9: "ninth", 10: "tenth", 11: "eleventh", 12: "twelfth", 13: "thirteenth", 14: "fourteenth",
  15: "fifteenth", 16: "sixteenth", 17: "seventeenth", 18: "eighteenth", 19: "nineteenth", 20: "twentieth",
};

/** 3/4 als „three quarters", 1/2 als „one half"; ohne gebräuchlichen Namen „three over twenty-three". */
export function bruchwortEn(zaehler: number, nenner: number): string {
  const name = NENNER_EN[nenner];
  if (!name) return `${zahlwortEn(zaehler)} over ${zahlwortEn(nenner)}`;
  if (zaehler === 1) return `one ${name}`;
  return `${zahlwortEn(zaehler)} ${nenner === 2 ? "halves" : `${name}s`}`;
}

/** „£4.40" als „four pounds forty". */
export function geldwortEn(betrag: string): string {
  const [pfund, pence] = betrag.split(".");
  const p = Number(pfund);
  const kopf = `${zahlwortEn(p)} ${p === 1 ? "pound" : "pounds"}`;
  if (!pence) return kopf;
  const pp = Number(pence.length === 1 ? `${pence}0` : pence);
  return pp === 0 ? kopf : `${kopf} ${zahlwortEn(pp)}`;
}

const OPERATOR: Array<[RegExp, string]> = [
  [/\s*>=\s*/g, " is greater than or equal to "],
  [/\s*<=\s*/g, " is less than or equal to "],
  [/\s*!=\s*/g, " is not equal to "],
  [/\s*<\s*/g, " is less than "],
  [/\s*>\s*/g, " is greater than "],
  [/\s*\+\s*/g, " plus "],
  [/\s*\*\s*/g, " times "],
  [/\s+\/\s*/g, " divided by "],
  [/\s*-\s*/g, " minus "],
  [/\s*=\s*/g, " is "],
];

function eineZeileEn(zeile: string): string {
  let s = zeile.trim();
  if (!s || /^-{3,}$/.test(s)) return "";
  const nurRechnung = !/[A-Za-z]{2,}/.test(s.replace(/\[\]/g, ""));

  // ★ Zuerst die Zeichen: die Zahlwörter tragen selbst Bindestriche („forty-eight").
  if (nurRechnung) {
    s = s.replace(/\(/g, " open bracket ").replace(/\)/g, " close bracket ");
    s = s.replace(/\[\]/g, " blank ").replace(/\[/g, " open square bracket ").replace(/\]/g, " close square bracket ");
    s = s.replace(/\{/g, " open brace ").replace(/\}/g, " close brace ");
    for (const [muster, wort] of OPERATOR) s = s.replace(muster, wort);
  }
  s = s.replace(/£(\d+(?:\.\d{1,2})?)/g, (_, b) => geldwortEn(b));
  s = s.replace(/\b(\d+) (\d+)\/(\d+)\b/g, (_, g, z, n) => `${zahlwortEn(Number(g))} and ${bruchwortEn(Number(z), Number(n))}`);
  s = s.replace(/(?<![\d.])(\d+)\/(\d+)(?![\d.])/g, (_, z, n) => bruchwortEn(Number(z), Number(n)));
  s = s.replace(/(\d+(?:\.\d+)?)\s*%/g, (_, z) => `${dezimalwortEn(z)} percent`);
  s = s.replace(/\d+(?:\.\d+)?/g, (z) => dezimalwortEn(z));
  return s.replace(/\s+/g, " ").trim();
}

/** Eine (auch mehrzeilige) Angabe in einen gesprochenen Satz verwandeln. */
export function sprichEn(zeile: string): string {
  return zeile
    .split("\n")
    .map(eineZeileEn)
    .filter((z) => z.length > 0)
    .reduce((satz, z) => (satz ? `${satz}${/[.?!]$/.test(satz) ? " " : ". "}${z}` : z), "");
}
