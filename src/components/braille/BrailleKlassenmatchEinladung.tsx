/**
 * ★★★ "Sarah lädt dich zu einem Klassenmatch ein" - Vorbild `typing/KlassenmatchEinladung.tsx`.
 *
 * Zwei Wege, und beide sind gleichwertig: "Bin dabei" und "Jetzt nicht". Kein
 * Vorwurf im Wortlaut, keine Rückfrage ([[feedback_nie_gegen_das_kind]]).
 * Escape ist "Jetzt nicht", und die abgelehnte Einladung kommt nicht wieder;
 * eine neue (anderes Match) schon.
 *
 * Der Fokus steht auf "Bin dabei" (`initialFocus` an `Modal`); nach dem
 * Schliessen geht er in die Eingabezeile - `Modal` erledigt das selbst, wenn
 * der Öffner (kein Knopf, sondern ein Ereignis) nicht mehr da ist, darum
 * ruft dieses Bauteil zusätzlich `requestFocusInput()`.
 *
 * ⚠️ KEINE Live-Region: `Modal` trägt `role="dialog"` und beschriftet ihn
 * mit der Überschrift; jeder Screenreader liest ihn beim Öffnen von selbst
 * vor. Eine zusätzliche Meldung wäre dieselbe Auskunft zweimal.
 */
import { useEffect, useRef } from "react";
import { Modal } from "@/components/Modal";
import { useBraillePlay } from "@/lib/braille/play";
import { speakUi } from "@/lib/braille/voice";

export function BrailleKlassenmatchEinladung({
  hostName,
  onDabei,
  onNichtJetzt,
  onGezeigt,
  fokusNachNein,
}: {
  hostName: string;
  onDabei: () => void;
  onNichtJetzt: () => void;
  /**
   * ★ Das Fenster ist aufgegangen (02.10.2026) - einmal beim Öffnen. Der Haken
   * meldet die eigene Zeile dann auf `eingeladen`, damit der Gastgeber weiss,
   * wer noch überlegt („3 Kinder haben sich noch nicht entschieden").
   */
  onGezeigt?: () => void;
  /**
   * ★ Wohin der Fokus nach „Jetzt nicht" geht (02.10.2026). Ohne Angabe in die
   * Übungszeile (Hausregel). Steht das Fenster über der Platzierungsliste
   * eines vorbei-en Matches, geht er dorthin zurück - dort gibt es keine Zeile.
   */
  fokusNachNein?: () => void;
}) {
  const dabeiRef = useRef<HTMLButtonElement>(null);
  const satz = `${hostName} lädt dich zu einem Klassenmatch ein.`;

  useEffect(() => {
    speakUi(satz);
    onGezeigt?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const nichtJetzt = () => {
    onNichtJetzt();
    if (fokusNachNein) {
      // ⚠️ Nach dem Aufräumen des Fensters (`Modal` gibt den Fokus beim
      // Schliessen zurück) - darum im nächsten Takt.
      window.setTimeout(fokusNachNein, 0);
      return;
    }
    useBraillePlay.getState().requestFocusInput();
  };

  return (
    <Modal title="Klassenmatch" onClose={nichtJetzt} initialFocus={dabeiRef}>
      <div className="space-y-3">
        <p className="m-0 text-lg text-ink">{satz}</p>
        <p className="m-0 text-ink-soft">
          Fünf Minuten schreiben oder lesen - jede und jeder auf dem eigenen Stand. Es zählt zu deiner
          Übezeit.
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <button
            type="button"
            ref={dabeiRef}
            className="btn-primary"
            onClick={() => {
              onDabei();
              useBraillePlay.getState().requestFocusInput();
            }}
          >
            Bin dabei
          </button>
          <button type="button" className="btn-ghost" onClick={nichtJetzt}>
            Jetzt nicht
          </button>
        </div>
        <p className="m-0 text-sm text-ink-muted">Escape bringt dich zurück zum Üben.</p>
      </div>
    </Modal>
  );
}
