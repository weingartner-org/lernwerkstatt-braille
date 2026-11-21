/**
 * ★ "Klassenmatch" ausschreiben - das kleine Fenster, in dem ein Kind
 * Arbeitsweise UND Schriftbereich wählt, bevor die Einladung an die Klasse
 * geht ({@link useBrailleKlassenmatch.einladen}).
 *
 * Anders als beim Tastenflow-Vorbild (dort immer "schreiben", Niveau kommt
 * aus dem eigenen Lernstand) braucht Braille zusätzlich die Arbeitsweise -
 * "schreiben" und "lesen" sind nicht vergleichbar (`wertung.ts` Kopf), ein
 * Match legt sich also auf eine der beiden fest.
 */
import { useRef, useState } from "react";
import { Modal } from "@/components/Modal";
import { useBraillePlay } from "@/lib/braille/play";
import type { Arbeitsweise } from "@/lib/braille/wertung";
import type { Area, AreaKey } from "@/lib/braille/areas";

export function BrailleKlassenmatchStarten({
  areas,
  bereichVorgabe,
  meldung,
  onEinladen,
  onClose,
}: {
  areas: Area[];
  bereichVorgabe: AreaKey;
  /** Warum das letzte Ausschreiben scheiterte - leer, wenn nichts schiefging. */
  meldung: string;
  onEinladen: (arbeitsweise: Arbeitsweise, bereich: AreaKey) => void;
  onClose: () => void;
}) {
  const [arbeitsweise, setArbeitsweise] = useState<Arbeitsweise>("schreiben");
  const [bereich, setBereich] = useState<AreaKey>(bereichVorgabe);
  const einladenRef = useRef<HTMLButtonElement>(null);

  const schliessen = () => {
    onClose();
    useBraillePlay.getState().requestFocusInput();
  };

  return (
    <Modal title="Klassenmatch ausschreiben" onClose={schliessen} initialFocus={einladenRef}>
      <div className="space-y-4">
        <p className="m-0 text-ink-soft">
          Fünf Minuten schreiben oder lesen - jede und jeder auf dem eigenen Stand. Die anderen aus
          deiner Klasse bekommen sofort eine Einladung.
        </p>

        <fieldset className="m-0 border-0 p-0">
          <legend className="mb-1 text-sm font-medium text-ink">Arbeitsweise</legend>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={arbeitsweise === "schreiben" ? "btn-primary btn-toggle" : "btn-secondary btn-toggle"}
              aria-pressed={arbeitsweise === "schreiben"}
              onClick={() => setArbeitsweise("schreiben")}
            >
              Schreiben
            </button>
            <button
              type="button"
              className={arbeitsweise === "lesen" ? "btn-primary btn-toggle" : "btn-secondary btn-toggle"}
              aria-pressed={arbeitsweise === "lesen"}
              onClick={() => setArbeitsweise("lesen")}
            >
              Lesen
            </button>
          </div>
        </fieldset>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-ink">Schriftbereich</span>
          <select
            className="input w-full"
            value={bereich}
            onChange={(e) => setBereich(e.target.value as AreaKey)}
          >
            {areas.map((a) => (
              <option key={a.key} value={a.key}>
                {a.label}
              </option>
            ))}
          </select>
        </label>

        {meldung ? (
          <p role="alert" className="m-0 text-sm text-error">
            {meldung}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            ref={einladenRef}
            className="btn-primary"
            onClick={() => onEinladen(arbeitsweise, bereich)}
          >
            Einladen
          </button>
          <button type="button" className="btn-ghost" onClick={schliessen}>
            Abbrechen
          </button>
        </div>
      </div>
    </Modal>
  );
}
