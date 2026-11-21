/**
 * Welche Aufgaben darf eine andere Sprache zeigen? (Bauplan 2026-11-06 §5)
 *
 * ★ Der Generator von Plus ist deutsch: viele Aufgaben tragen deutsche Fragen
 *   („Welche Zahl kommt nach 11?"), Einheiten, Namen. In einer anderen Sprache
 *   gilt der Grundsatz „ohne Übersetzung nicht anbieten - nie Deutsch":
 *   - `sach`: nur die neu geschriebenen Geschichten der Sprache
 *     (`generator/sachaufgabenEn.ts`), geprüft auf deutsche Buchstaben.
 *   - alle anderen Formen: nur, wenn Angabe UND Lösung reine Rechenzeile sind
 *     (Ziffern, Rechen- und Vergleichszeichen, Klammern, Lücke `[]`, `%`) -
 *     Wörter und Buchstaben sind deutsch.
 *   - nie mit Rest (keine Norm in en/es/br/sv, Befund §7 Nr. 7).
 *   - nur, was der MATHE-CODE der Sprache schreiben kann: `code.schreibe` darf
 *     für keine Zeile `null` liefern (Lücke `[]` ausgenommen - die Eingabe
 *     streicht die Klammern). So liest ein Kind in Braille nie etwas, das der
 *     Code nicht belegt kennt.
 *   - das Dezimalzeichen der Sprache: kein Komma in Englisch.
 * ★ Der Generator wirft für eine abgelehnte Aufgabe `NochNichtGebaut` - die
 *   Schleifen von `erzeugeLauf`/`erzeugeEine` nehmen dann die nächste Form.
 */
import type { BedienSprache } from "@/lib/bedienSprache";
import type { Aufgabe } from "./aufgabe";
import { MATHE_CODES, type MatheCode } from "./braille/matheCode";

const REINE_ZEILE = /^[0-9.\s+\-*/=<>()[\]{}%!]*$/;
/** Wie `REINE_ZEILE`, mit dem Komma - für Sprachen, deren Dezimalzeichen das Komma ist (fr). */
const REINE_ZEILE_KOMMA = /^[0-9.,\s+\-*/=<>()[\]{}%!]*$/;
const NUR_ZEICHEN = /^(?:[+\-*/<>=]|<=|>=|!=)$/;
const DEUTSCH = /[äöüßÄÖÜ]|\b(?:und|der|die|das|wie|viele|Euro|Rest|ist|sind|von)\b/;

function codeFuer(sprache: BedienSprache): MatheCode | null {
  const je: Partial<Record<BedienSprache, MatheCode | undefined>> = { en: MATHE_CODES.ueb, fr: MATHE_CODES["nmb-fr"], es: MATHE_CODES["cmu-es"] };
  return je[sprache] ?? null;
}

/** Lässt sich der Text (Zeilen, Lücke ohne Klammern) in Zellen schreiben? */
function schreibbar(text: string, code: MatheCode): boolean {
  return text.split("\n").every((zeile) => {
    const t = zeile.split("[]").join("");
    return t.trim() === "" || code.schreibe(t) !== null;
  });
}

export function aufgabeFuerSprache(a: Aufgabe, sprache: BedienSprache): boolean {
  const code = codeFuer(sprache);
  if (!code) return false;
  if (a.rest !== undefined || /\bRest\b|\bR\d/.test(a.loesung)) return false;
  const alleLoesungen = [a.loesung, ...(a.auchRichtig ?? [])];
  if (code.dezimalzeichen === "." && [a.angabe, ...alleLoesungen].some((t) => /\d,\d/.test(t))) return false;
  const rein = code.dezimalzeichen === "," && sprache !== "de" ? REINE_ZEILE_KOMMA : REINE_ZEILE;
  const loesungOk = (l: string) => rein.test(l) && (NUR_ZEICHEN.test(l.trim()) || schreibbar(l, code));
  if (!alleLoesungen.every(loesungOk)) return false;
  if (a.art === "sach") return !DEUTSCH.test(a.angabe);
  return rein.test(a.angabe) && schreibbar(a.angabe, code);
}
