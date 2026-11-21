/**
 * Das Rechen-Wörterbuch auf Spanisch: aus einer Plus-Zeile wird ein Satz
 * (Gegenstück zu `rechnen.ts` deutsch und `rechnenEn.ts` englisch).
 *
 * ★ Zahlwörter: `typing/zahlwort.ts` (`zahlwortEs(n)`, von Tastenflow, 0 bis
 *   999, EINE Fassung für Spanien und Lateinamerika) - hier werden Tausender
 *   und Millionen zusammengesetzt („dos mil quinientos", „un millón"), jede
 *   Gruppe mit demselben Wörterbuch. Vor „mil" und „millones" und vor einem
 *   männlichen Hauptwort heißt es „un" / „veintiún", vor einem weiblichen
 *   „una" / „veintiuna", und die Hunderter gleichen sich an („doscientas").
 * ★ Dezimalzeichen ist das Komma: „3,5" heißt „tres coma cinco", Ziffer für
 *   Ziffer nach dem Komma (wie im Deutschen und Englischen).
 * ★ Gebaut ist, was Plus in Spanisch anbietet (`sprachfilter.ts`): Zahlen mit
 *   Dezimalkomma, Brüche, Prozent, Euro, + - * / = < > Klammern, Lücke `[]`.
 *   Einheiten und Buchstaben stehen in den spanischen Aufgaben nur als Wörter.
 * ★ `=` heißt „igual a" - neutral für Spanien und Lateinamerika.
 */
import { zahlwortEs } from "@/lib/typing/zahlwort";

/** „un" statt „uno", „veintiún" statt „veintiuno" am Ende (vor „mil", „millones" und männlichen Hauptwörtern). */
function kurzEs(wort: string): string {
  return wort.replace(/veintiuno$/, "veintiún").replace(/uno$/, "un");
}

/** Vor einem Hauptwort: männlich „un", weiblich „una" und „doscientas". */
function vorHauptwort(wort: string, weiblich: boolean): string {
  if (!weiblich) return kurzEs(wort);
  return wort.replace(/ientos\b/g, "ientas").replace(/veintiuno$/, "veintiuna").replace(/uno$/, "una");
}

/** 0 bis 999 999 999 in Worten. */
export function zahlwortEsGross(n: number): string {
  if (n < 1000) return zahlwortEs(n);
  const mio = Math.floor(n / 1_000_000);
  const tsd = Math.floor((n % 1_000_000) / 1000);
  const rest = n % 1000;
  const teile: string[] = [];
  if (mio) teile.push(mio === 1 ? "un millón" : `${kurzEs(zahlwortEsGross(mio))} millones`);
  if (tsd) teile.push(tsd === 1 ? "mil" : `${kurzEs(zahlwortEs(tsd))} mil`);
  if (rest) teile.push(zahlwortEs(rest));
  return teile.join(" ");
}

/** „3,5" als „tres coma cinco". */
export function dezimalwortEs(text: string): string {
  const [ganz, nach] = text.split(",");
  const kopf = zahlwortEsGross(Number(ganz));
  return nach === undefined ? kopf : `${kopf} coma ${[...nach].map((d) => zahlwortEs(Number(d))).join(" ")}`;
}

const NENNER_ES: Record<number, [string, string]> = {
  2: ["medio", "medios"], 3: ["tercio", "tercios"], 4: ["cuarto", "cuartos"], 5: ["quinto", "quintos"],
  6: ["sexto", "sextos"], 7: ["séptimo", "séptimos"], 8: ["octavo", "octavos"], 9: ["noveno", "novenos"],
  10: ["décimo", "décimos"], 11: ["onceavo", "onceavos"], 12: ["doceavo", "doceavos"],
  13: ["treceavo", "treceavos"], 14: ["catorceavo", "catorceavos"], 15: ["quinceavo", "quinceavos"],
  16: ["dieciseisavo", "dieciseisavos"], 17: ["diecisieteavo", "diecisieteavos"],
  18: ["dieciochoavo", "dieciochoavos"], 19: ["diecinueveavo", "diecinueveavos"], 20: ["veinteavo", "veinteavos"],
};

/** 3/4 als „tres cuartos", 1/2 als „un medio"; ohne gebräuchlichen Namen „tres sobre veintitrés". */
export function bruchwortEs(zaehler: number, nenner: number): string {
  const name = NENNER_ES[nenner];
  if (!name) return `${zahlwortEsGross(zaehler)} sobre ${zahlwortEsGross(nenner)}`;
  if (zaehler === 1) return `un ${name[0]}`;
  return `${kurzEs(zahlwortEsGross(zaehler))} ${name[1]}`;
}

/** „2,50 euros" als „dos euros con cincuenta" (mit `peso`: „dos pesos con cincuenta" - Region Latinoamérica). */
export function geldwortEs(betrag: string, einheit: "euro" | "peso" = "euro"): string {
  const [euro, cent] = betrag.split(",");
  const e = Number(euro);
  const kopf = `${e === 1 ? "un" : kurzEs(zahlwortEsGross(e))} ${e === 1 ? einheit : `${einheit}s`}`;
  if (!cent) return kopf;
  const c = Number(cent.length === 1 ? `${cent}0` : cent);
  return c === 0 ? kopf : `${kopf} con ${zahlwortEs(c)}`;
}

const OPERATOR: Array<[RegExp, string]> = [
  [/\s*>=\s*/g, " mayor o igual que "],
  [/\s*<=\s*/g, " menor o igual que "],
  [/\s*!=\s*/g, " distinto de "],
  [/\s*<\s*/g, " menor que "],
  [/\s*>\s*/g, " mayor que "],
  [/\s*\+\s*/g, " más "],
  [/\s*\*\s*/g, " por "],
  [/\s+\/\s*/g, " dividido entre "],
  [/\s*-\s*/g, " menos "],
  [/\s*=\s*/g, " igual a "],
];

/** Wörter hinter einer Zahl, die kein Hauptwort sind (dort bleibt „uno"). */
const KEIN_HAUPTWORT = new Set([
  "y", "o", "de", "del", "por", "con", "en", "a", "al", "entre", "para", "como", "que", "es", "son",
  "más", "menos", "igual", "mayor", "menor", "distinto", "dividido", "sobre", "coma", "veces", "si", "se",
]);

function eineZeileEs(zeile: string): string {
  let s = zeile.trim();
  if (!s || /^-{3,}$/.test(s)) return "";
  const nurRechnung = !/[A-Za-zÁ-ÿ]{2,}/.test(s.replace(/\[\]/g, ""));

  // ★ Zuerst die Zeichen, dann die Zahlwörter.
  if (nurRechnung) {
    s = s.replace(/\(/g, " abre paréntesis ").replace(/\)/g, " cierra paréntesis ");
    s = s.replace(/\[\]/g, " hueco ").replace(/\[/g, " abre corchete ").replace(/\]/g, " cierra corchete ");
    s = s.replace(/\{/g, " abre llave ").replace(/\}/g, " cierra llave ");
    for (const [muster, wort] of OPERATOR) s = s.replace(muster, wort);
  }
  s = s.replace(/(\d+(?:,\d{1,2})?) (euro|peso)s?\b/g, (_, b, art) => geldwortEs(b, art));
  s = s.replace(/\b(\d+) (\d+)\/(\d+)\b/g, (_, g, z, n) => `${zahlwortEsGross(Number(g))} y ${bruchwortEs(Number(z), Number(n))}`);
  s = s.replace(/(?<![\d,])(\d+)\/(\d+)(?![\d,])/g, (_, z, n) => bruchwortEs(Number(z), Number(n)));
  s = s.replace(/(\d+(?:,\d+)?)\s*%/g, (_, z) => `${dezimalwortEs(z)} por ciento`);
  s = s.replace(/\d+(?:,\d+)?/g, (z, stelle: number, ganz: string) => {
    if (z.includes(",")) return dezimalwortEs(z);
    const wort = zahlwortEsGross(Number(z));
    if (nurRechnung) return wort;
    const danach = /^\s+([a-záéíóúñü]+)/i.exec(ganz.slice(stelle + z.length));
    if (!danach || KEIN_HAUPTWORT.has(danach[1].toLowerCase())) return wort;
    return vorHauptwort(wort, /(?:a|as)$/i.test(danach[1]));
  });
  return s.replace(/\s+/g, " ").trim();
}

/** Eine (auch mehrzeilige) Angabe in einen gesprochenen Satz verwandeln. */
export function sprichEs(zeile: string): string {
  return zeile
    .split("\n")
    .map(eineZeileEs)
    .filter((z) => z.length > 0)
    .reduce((satz, z) => (satz ? `${satz}${/[.?!]$/.test(satz) ? " " : ". "}${z}` : z), "");
}
