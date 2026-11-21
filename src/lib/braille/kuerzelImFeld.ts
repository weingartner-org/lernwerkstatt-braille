/**
 * ★★★ Gilt ein Alt-Kürzel, während der Fokus in einem Eingabefeld steht?
 * ============================================================================
 * Gemessen am 29.09.2026: Die Kürzel-Wache in `PunktgenauPage.tsx` schaltete
 * JEDES Alt-Kürzel ab, sobald der Fokus in einem `<input>` oder `<textarea>`
 * stand. Beim Lesen steht ein Kind aber IMMER im Antwortfeld - Alt + W
 * (nochmal ansagen), Alt + Z (Runde), Alt + P (Pause), Alt + V, Alt + 1 bis 5
 * und die übrigen Seitenkürzel waren dort tot, obwohl Hilfe und Kurztastenliste
 * sie versprechen. Dieselbe Lücke hatte der eine andere App der Plattform  am 07.09. (Kommentar an
 * `unsereAltTaste` in `AppKopfzeile.tsx`).
 *
 * ⇒ Wie dort: Ein Feld mit `data-kuerzel="an"` lässt die Kürzel durch. Die
 * Anmeldefelder tragen es NICHT - dort gilt weiter der Schutz aus dem
 * NVDA-Test vom 01.07.2026.
 *
 * ⚠️⚠️ DER PREIS AM MAC.
 * Am Mac schreibt die Wahltaste Zeichen. Im Bereich Computerbraille liest ein
 * Kind z. B. `@`, `[` oder `€` und muss es eintippen - auf der deutschen
 * Mac-Tastatur Wahl + L, Wahl + 5, Wahl + E. Genau das sind Alt + L
 * (Zeichenliste), Alt + 5 (Bereich UEB) und Alt + E (ins Eingabefeld). Ohne
 * Vorsicht öffnete also die Aufgabe „tippe das @" die Zeichenliste.
 *
 * Darum gilt: **Erzeugt die Wahltaste ein Zeichen, das man zum Schreiben
 * braucht, gehört der Druck dem Feld.** Gemeint sind alle Satzzeichen und
 * Währungszeichen (Unicode `P` und `Sc`) und die druckbaren ASCII-Zeichen
 * ohne Buchstaben und Ziffern. Gemessen an den Aufgaben am 29.09.2026: Sie
 * verlangen `„ “ « » ‚ € § @ [ ] | ~` - am deutschen Mac Wahl + Umschalt + W,
 * Wahl + 2, Wahl + Q, Wahl + S, Wahl + E, Wahl + L, Wahl + 5 …
 *
 * Unter Windows trifft das nie zu (Alt + L meldet `l`, AltGr kommt als
 * Strg + Alt und scheitert schon früher) - dort wirkt JEDES Kürzel aus dem
 * Feld. Am Mac wirken Alt + W, Z, M, P, V, O, H und U, weil `∑ Ω µ π √ ø ª`
 * niemand für eine Braille-Aufgabe tippt.
 * ⚠️ Der Preis, am Mac mit deutscher Tastatur: Alt + L, S, E und 1 bis 5
 * wirken aus dem Antwortfeld heraus NICHT (`@ ‚ € ¡ “ ¶ ¢ [`) - wie vor dem
 * 29.09. auch; es ist also nichts verloren, nur vieles dazugekommen. Esc und
 * Tab führen wie immer aus dem Feld, dort wirken sie alle.
 * (Alt + T ergibt am Mac `†` und bleibt damit hier liegen - die Kurztasten
 * öffnet dann die gemeinsame Kopfzeile, die dieselbe Freigabe liest und
 * sonst zurücktritt, siehe `tests/kuerzel-alt-t.test.tsx`.)
 */
import type { KeyboardEvent as ReactKeyboardEvent } from "react";

type TastenDruck = Pick<KeyboardEvent | ReactKeyboardEvent, "key" | "target">;

/** Ein Zeichen, das eine Antwort enthalten kann und am Mac mit der Wahltaste kommt. */
export function istSchreibzeichen(key: string): boolean {
  if ([...key].length !== 1) return false;
  // Satzzeichen („ “ « » ‚ … @ [ ] § ¡ ¶ †) und Währungszeichen (€ ¢ $).
  if (/^[\p{P}\p{Sc}]$/u.test(key)) return true;
  // Übriges druckbares ASCII ohne Leerzeichen, Buchstaben und Ziffern (| ~ ^ ` + < = >).
  return /^[\x21-\x7e]$/.test(key) && !/^[a-z0-9]$/i.test(key);
}

/**
 * `true`, wenn die Seiten-Kürzel diesen Alt-Druck NICHT behandeln dürfen,
 * weil er einem Eingabefeld gehört.
 */
export function gehoertDemFeld(e: TastenDruck): boolean {
  const ziel = e.target as HTMLElement | null;
  const tag = ziel?.tagName;
  if (tag !== "INPUT" && tag !== "SELECT" && tag !== "TEXTAREA") return false;
  // `dataset?.` mit Fragezeichen: Ein Ziel ohne `dataset` (z. B. `document`)
  // darf hier nicht werfen - siehe `unsereAltTaste` in `AppKopfzeile.tsx`.
  if (ziel?.dataset?.kuerzel !== "an") return true;
  return istSchreibzeichen(e.key);
}
