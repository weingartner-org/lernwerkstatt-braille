/**
 * ★★★ "EIGENE ÜBUNG" AUS DER SICHT DES KINDES - Vorbild `typing/EigeneUebungLauf.tsx`.
 *
 * Die Lehrkraft hat eine Datei hochgeladen; die ganze Klasse übt genau diesen
 * Text (die Zeilen `text.zeilen`) - unabhängig vom eigenen Lernstand. Zählt
 * zur Übezeit, aber schaltet KEINE neue Etappe frei: Diese Karte reicht
 * darum keinen `onResult`/`onComplete`-Pfad an den Spielstand weiter (siehe
 * `Punktgenau.tsx`, `applyResult`/`applyTextComplete` bleiben unberührt) -
 * eine Übung mit fremdem Wortschatz darf das Freischalt-Tor weder öffnen
 * noch zuschlagen (dieselbe Regel wie beim Tastenflow-Vorbild).
 *
 * ── Jede Zeile ist EIN eigener Text im Sinn von `TextLevelRunner` ──────────
 * Die hochgeladenen Zeilen werden 1:1 als `level.items` gereicht - jede Zeile
 * wird fertig geschrieben/gelesen, dann "Nächster Text →" (der Baustein
 * bringt das schon mit). Keine neue Bauart, nur ein anderer Wortschatz.
 *
 * ── Wann "fertig" gilt ───────────────────────────────────────────────────────
 * Nach der LETZTEN Zeile (kein "Nächster Text" mehr) meldet dieses Bauteil
 * die ganze Übung als fertig - je Kind UND je Text, am Konto
 * ({@link useBrailleEigeneUebung.meldeFertig}).
 */
import { useRef } from "react";
import type { BrailleEigeneUebungStand } from "./useBrailleEigeneUebung";
import { areaByKey, type AreaKey } from "@/lib/braille/areas";
import type { Level } from "@/lib/braille";
import { TextLevelRunner, type AnnounceCallback, type RingInfo, type TrainerTaskEvent } from "./BrailleTrainer";

export function BrailleEigeneUebungLauf({
  stand,
  grossschreibzeichen,
  onTask,
  onAnnounce,
}: {
  stand: BrailleEigeneUebungStand;
  grossschreibzeichen: boolean;
  onTask: (e: TrainerTaskEvent) => void;
  onAnnounce: AnnounceCallback;
}) {
  const { zeiger, text, meldeFertig } = stand;
  const ringRef = useRef<RingInfo | null>(null);
  const fertigGemeldet = useRef<string | null>(null);

  if (!zeiger || !text || text.zeilen.length === 0) {
    return (
      <p role="status" className="text-sm text-ink-muted">
        Der zugewiesene Text wird geladen …
      </p>
    );
  }

  const bereich: AreaKey = zeiger.bereich;
  const area = areaByKey(bereich);
  const level: Level = {
    id: `eigen-${zeiger.textId}`,
    title: zeiger.dateiname,
    kind: "text",
    system: area.system,
    intro: "",
    items: text.zeilen,
  };
  const direction = zeiger.arbeitsweise === "schreiben" ? "write" : "read";

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-base font-semibold text-ink">Eigene Übung · {text.dateiname}</h2>
      <TextLevelRunner
        key={level.id + direction}
        level={level}
        system={area.system}
        direction={direction}
        address="du"
        grossschreibzeichen={grossschreibzeichen}
        onProgress={(r) => {
          ringRef.current = r;
        }}
        onTask={onTask}
        onComplete={() => {
          const rund = ringRef.current?.round;
          const letzterText = !rund || rund.done >= rund.total - 1;
          if (letzterText && fertigGemeldet.current !== zeiger.textId) {
            fertigGemeldet.current = zeiger.textId;
            meldeFertig();
          }
        }}
        onAnnounce={onAnnounce}
      />
    </div>
  );
}
