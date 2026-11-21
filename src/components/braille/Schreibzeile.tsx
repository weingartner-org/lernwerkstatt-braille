/**
 * ★★★ DIE SCHREIBZEILE - die Aufgabe steht auf der Braillezeile (Johannes
 * 07.10.2026: „in punktgenau steht nicht auf der zeile was geschrieben werden
 * soll, das ist aber wichtig, mach es so wie in tastenflow").
 *
 * Bis dahin war das Schreibfeld ein `<div role="application">`. Es hat keinen
 * Wert - auf der Braillezeile stand nur sein Name („Braille-Eingabefeld"), die
 * Aufgabe nicht. Ein Kind mit Blindheit musste sie sich merken oder mit Alt + W
 * neu anhören.
 *
 * Jetzt wie in Tastenflow (`TypingSession.tsx`, das `<textarea>`): Das Feld
 * ist ein Textfeld, dessen WERT der Text der Aufgabe ist. Der Schreibzeiger
 * steht an der Stelle, die als Nächstes dran ist (`zeigerImText`). Getippt
 * wird nie hinein - der Wert bleibt fest die Aufgabe, die Punkt-Tasten gehen
 * an die Akkord-Eingabe.
 *
 * - ★ Ein Textfeld schaltet NVDA von selbst in den Fokusmodus - die Punkt-
 *   Tasten kommen roh an, wie vorher mit `role="application"`.
 * - ★ `<textarea rows={1} wrap="off">`, kein `<input>`: Nur ein MEHRZEILIGES
 *   Feld steht bei NVDA hart links auf der Zeile, ohne den Fokuskontext davor
 *   ([[reference_nvda_fokuskontext_textarea_hart_links]]).
 * - Sichtbar bleibt alles wie vorher (die Zellen darunter); das Feld selbst
 *   ist nur für Sprachausgabe und Braillezeile da (`sr-only`).
 * - `data-kuerzel="an"`: Die Alt-Kürzel der Seite wirken aus dem Feld heraus
 *   (`lib/braille/kuerzelImFeld.ts`).
 *
 * ⏳ Mit echtem NVDA und echter Braillezeile ist es NICHT nachgemessen.
 */
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  type ClipboardEvent,
  type KeyboardEvent,
} from "react";

export interface SchreibzeileProps {
  /** Der Text der Aufgabe - steht als Wert im Feld. */
  text: string;
  /** Stelle des Schreibzeigers im Text. */
  zeiger: number;
  label: string;
  describedBy?: string;
  tabIndex: number;
  /** Für den Fokus-Wächter (`data-feld`). */
  feld: string;
  onKeyDown: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
  onKeyUp: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
  onBlur: () => void;
  onPaste?: (e: ClipboardEvent<HTMLTextAreaElement>) => void;
}

export const Schreibzeile = forwardRef<HTMLTextAreaElement, SchreibzeileProps>(
  function Schreibzeile(
    { text, zeiger, label, describedBy, tabIndex, feld, onKeyDown, onKeyUp, onBlur, onPaste },
    ref,
  ) {
    const el = useRef<HTMLTextAreaElement>(null);
    useImperativeHandle(ref, () => el.current as HTMLTextAreaElement);

    const stelle = Math.max(0, Math.min(zeiger, text.length));
    const setzeZeiger = useCallback(() => {
      const t = el.current;
      if (!t || document.activeElement !== t) return;
      if (t.selectionStart === stelle && t.selectionEnd === stelle) return;
      t.setSelectionRange(stelle, stelle);
    }, [stelle]);

    // Nach jeder Zelle: Zeiger an die nächste Stelle.
    useLayoutEffect(setzeZeiger, [setzeZeiger, text]);

    return (
      <textarea
        ref={el}
        className="sr-only"
        rows={1}
        wrap="off"
        value={text}
        aria-label={label}
        aria-describedby={describedBy}
        aria-keyshortcuts="Backspace Space Shift"
        tabIndex={tabIndex}
        data-feld={feld}
        data-kuerzel="an"
        spellCheck={false}
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        // Der Wert bleibt fest die Aufgabe - nichts wird hineingeschrieben.
        onChange={() => {}}
        onBeforeInput={(e) => e.preventDefault()}
        onDrop={(e) => e.preventDefault()}
        onPaste={(e) => {
          e.preventDefault();
          onPaste?.(e);
        }}
        onFocus={setzeZeiger}
        // Pfeiltasten oder ein Routing-Knopf der Braillezeile verschieben den
        // Zeiger - er springt zurück an die Stelle, die dran ist.
        onSelect={setzeZeiger}
        onKeyDown={(e) => {
          // Enter setzt in einem Textarea einen Zeilenumbruch - hier nie.
          if (e.key === "Enter") e.preventDefault();
          onKeyDown(e);
        }}
        onKeyUp={onKeyUp}
        onBlur={onBlur}
      />
    );
  },
);
