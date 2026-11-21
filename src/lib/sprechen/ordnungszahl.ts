/**
 * Ordnungszahlen: „bis zum 80. Jahr", „der 3. Platz" (Durchsicht 29.09.2026).
 *
 * Zwei Stellen trafen dieselbe Zahl falsch:
 *  - Die Vorlesefunktion sprach „bis zum achtzig. Jahr" - jede Zahl war eine
 *    Grundzahl.
 *  - Die Satztrenner der Aufgaben (`[.?!]` + Leerzeichen ⇒ neue Zeile)
 *    brachen nach „80." um: Auf dem Schirm und auf der Braillezeile stand
 *    „…bis zum 80." und darunter „Jahr?".
 *
 * ⚠️ „Zahl, Punkt, großes Wort" ist KEIN Kennzeichen: „Zusammen sind sie 17.
 * Wie alt ist Mia?" (Alters-Rätsel) endet mit einer Grundzahl. Ordnungszahl
 * ist darum nur, was direkt nach einem Artikel steht - dort kann keine
 * Grundzahl mit Satzende stehen. Beide Stellen fragen DIESE Regel, damit
 * Schirm und Stimme nie verschieden entscheiden.
 */
import { zahlwort } from "./zahlwort";

/** Artikel und verschmolzene Präpositionen, nach denen eine Zahl mit Punkt eine Ordnungszahl ist. */
const ARTIKEL = "der|die|das|dem|den|des|zum|zur|am|im|vom|beim|ins|ans";

/** Präpositionen, nach denen „der" Dativ/Genitiv ist („in der 8. Klasse" ⇒ „achten"). */
const PRAEPOSITION = /\b(?:in|an|auf|aus|bei|mit|nach|von|zu|vor|hinter|über|unter|neben|zwischen|seit|wegen|während|trotz|statt)\s+$/i;

/** Artikel + Zahl + Punkt + Leerzeichen + Wort. Gruppen: Artikel, Zahl. */
const ORDNUNGSZAHL = new RegExp(`\\b(${ARTIKEL}) (\\d{1,6})\\.(?= \\S)`, "gi");

/** Endet der Text vor dieser Stelle mit „Artikel Zahl"? Dann ist der Punkt danach eine Ordnungszahl. */
const ENDET_MIT_ORDNUNGSZAHL = new RegExp(`\\b(?:${ARTIKEL}) \\d{1,6}$`, "i");

/**
 * Sätze einer Angabe auf eigene Zeilen - aber nie nach einer Ordnungszahl.
 * Ersetzt das `replace(/(?<=[.?!]) +/g, "\n")` der Generatoren.
 */
export function saetzeUmbrechen(text: string): string {
  return text.replace(/([.?!]) +/g, (treffer, zeichen: string, stelle: number) =>
    zeichen === "." && ENDET_MIT_ORDNUNGSZAHL.test(text.slice(0, stelle)) ? treffer : `${zeichen}\n`,
  );
}

/** Der Stamm einer Ordnungszahl: 1 ⇒ „erst", 3 ⇒ „dritt", 20 ⇒ „zwanzigst". */
function ordnungsstamm(n: number): string {
  const wort = zahlwort(n);
  const hinten = n % 100;
  // Ab 20 (und bei glatten Hundertern) „-st": zwanzigste, hundertste, tausendste.
  if (hinten === 0 || hinten >= 20) return `${wort}st`;
  // Die unregelmäßigen am Wortende: „hunderteins" ⇒ „hunderterst".
  if (wort.endsWith("eins")) return `${wort.slice(0, -4)}erst`;
  if (wort.endsWith("drei") && hinten === 3) return `${wort.slice(0, -4)}dritt`;
  if (wort.endsWith("acht") && hinten === 8) return wort; // achte, nicht achtte
  // „siebente" wie bei den Wurzeln (österreichisch, `WURZEL_ORDNUNG`).
  return `${wort}t`;
}

/**
 * Die Ordnungszahlen einer Zeile als Wort: „bis zum 80. Jahr" ⇒ „bis zum
 * achtzigsten Jahr", „der 3. Platz" ⇒ „der dritte Platz".
 *
 * Die Endung: nach „die"/„das" und nach einem „der" ohne Präposition davor
 * „-e" (der dritte Platz, die dritte Stufe), sonst „-en" (am dritten Tag,
 * in der dritten Klasse).
 */
export function ordnungszahlenSprechen(zeile: string): string {
  return zeile.replace(ORDNUNGSZAHL, (_, artikel: string, zahl: string, stelle: number) => {
    const a = artikel.toLowerCase();
    const davor = zeile.slice(0, stelle);
    const kurz = a === "die" || a === "das" || (a === "der" && !PRAEPOSITION.test(davor));
    return `${artikel} ${ordnungsstamm(Number(zahl))}${kurz ? "e" : "en"}`;
  });
}
