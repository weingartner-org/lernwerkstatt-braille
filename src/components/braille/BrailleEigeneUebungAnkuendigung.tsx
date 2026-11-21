/**
 * ★★★★★ "WEITER GEHT ES MIT EINER ÜBUNG VON DEINER LEHRKRAFT."
 *
 * Vorbild `typing/EigeneUebungAnkuendigung.tsx`. Auftrag wörtlich: "Kinder
 * können nur auf 'Weiter' klicken, nicht ablehnen." - `Modal` schliesst über
 * Escape, Klick aussen und das ✕ gleich, es gibt nichts abzulehnen, jeder Weg
 * hinaus ist "Weiter".
 */
import { useEffect, useRef } from "react";
import { Modal } from "@/components/Modal";
import { useBraillePlay } from "@/lib/braille/play";
import { speakUi } from "@/lib/braille/voice";

const TITEL = "Weiter geht es mit einer Übung von deiner Lehrkraft.";

export function BrailleEigeneUebungAnkuendigung({ onWeiter }: { onWeiter: () => void }) {
  const weiterRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    speakUi(TITEL);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const weiter = () => {
    onWeiter();
    useBraillePlay.getState().requestFocusInput();
  };

  return (
    <Modal title={TITEL} onClose={weiter} initialFocus={weiterRef}>
      <div className="flex justify-end">
        <button type="button" ref={weiterRef} className="btn-primary" onClick={weiter}>
          Weiter
        </button>
      </div>
    </Modal>
  );
}
