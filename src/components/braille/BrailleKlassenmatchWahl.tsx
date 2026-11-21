/**
 * ★★★ „Arne lädt gerade ein. Mitmachen oder selbst einladen?" (02.10.2026)
 *
 * Nachgezogen aus Tastenflow (`typing/KlassenmatchWahl.tsx`), Johannes für
 * Punktgenau: „ja, mach Punktgenau genauso". Klasse CSS6, 02.10.2026: Mehrere
 * Kinder legten Matches an, während schon eines einlud - die Klasse zerfiel in
 * kleine Gruppen. Wer den Schalter „Klassenmatch" drückt, während schon jemand
 * anderes einlädt, wird darum zuerst gefragt.
 *
 * ── Zwei Wege, beide gleichwertig ───────────────────────────────────────────
 * „Mitmachen" tritt der Einladung bei (dasselbe wie „Bin dabei"). „Selbst
 * einladen" öffnet danach das gewohnte Fenster „Klassenmatch ausschreiben" -
 * erst dort, beim Einladen, gehen die offenen fremden Einladungen als Absage
 * hinaus. Kein Vorwurf, keine Wertung ([[feedback_nie_gegen_das_kind]]).
 * **Escape tut nichts davon** und führt zurück in die Übungszeile.
 *
 * ── Der Fokus ───────────────────────────────────────────────────────────────
 * Auf „Mitmachen" - der Weg, um den sich die Klasse sammeln soll. Tab führt zu
 * „Selbst einladen". Nach „Mitmachen" übernimmt das Wartefenster den Fokus
 * (seine Überschrift), nach „Selbst einladen" das Ausschreiben-Fenster (sein
 * Knopf „Einladen"), nach Escape die Übungszeile.
 *
 * ⚠️ Keine Live-Region: `Modal` ist ein beschrifteter Dialog und wird beim
 * Öffnen vorgelesen. Gesprochen wird die Frage zusätzlich über `speakUi` - sie
 * ist die Antwort auf einen Tastendruck des Kindes und folgt dem App-Vorlesen.
 */
import { useEffect, useRef } from "react";
import { Modal } from "@/components/Modal";
import { wahlSatz } from "@/lib/braille/klassenmatch";
import { useBraillePlay } from "@/lib/braille/play";
import { speakUi } from "@/lib/braille/voice";

export function BrailleKlassenmatchWahl({
  hostName,
  onMitmachen,
  onSelbst,
  onSchliessen,
}: {
  /** Wer gerade einlädt. */
  hostName: string;
  /** „Mitmachen". */
  onMitmachen: () => void;
  /** „Selbst einladen". */
  onSelbst: () => void;
  /** Escape - nichts tun, zurück zum Üben. */
  onSchliessen: () => void;
}) {
  const mitmachenRef = useRef<HTMLButtonElement>(null);
  const satz = wahlSatz(hostName);

  useEffect(() => {
    speakUi(satz);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const schliessen = () => {
    onSchliessen();
    useBraillePlay.getState().requestFocusInput();
  };

  return (
    <Modal title="Klassenmatch" onClose={schliessen} initialFocus={mitmachenRef}>
      <div className="space-y-3">
        <p className="m-0 text-lg text-ink" data-match-wahl>
          {satz}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          {/* Fokusziel: die Überschrift des Wartefensters (`BrailleKlassenmatchLobby` setzt ihn selbst). */}
          <button type="button" ref={mitmachenRef} className="btn-primary" onClick={onMitmachen}>
            Mitmachen
          </button>
          {/* Fokusziel: „Einladen" im Fenster „Klassenmatch ausschreiben" (dessen `initialFocus`). */}
          <button type="button" className="btn-ghost" onClick={onSelbst}>
            Selbst einladen
          </button>
        </div>
        <p className="m-0 text-sm text-ink-muted">Escape bringt dich zurück zum Üben.</p>
      </div>
    </Modal>
  );
}
