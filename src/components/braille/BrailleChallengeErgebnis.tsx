/**
 * ★★★ DIE AUSWERTUNG EINER BRAILLE-CHALLENGE - was ein Kind sofort danach liest.
 *
 * Vorbild `typing/SchreibprobeErgebnis.tsx` - dieselben Regeln, übernommen
 * ohne Abstriche:
 *
 * ★★★★★ **Kein Wort über die Zahlen.** Kein "leider", kein "nur", kein
 * "schon wieder" - und auch kein beruhigendes "das zählt nicht gegen dich"
 * ([[feedback_nie_gegen_das_kind]]). Die Zahlen stehen da, das Kind liest sie.
 * Wer sie einordnet, ist die Lehrkraft.
 *
 * ★★★★★ **UND KEIN RANG.** Der eigene Leistungswert steht hier, der Platz in
 * der Klasse nicht. Ein Kind kennt die Ergebnisse der anderen nicht.
 *
 * Schreiben und Lesen sind NICHT vergleichbar (siehe `wertung.ts` Kopf) -
 * diese Karte beschriftet die Zahl darum je nach {@link ChallengeErgebnis.arbeitsweise}
 * anders: "Zellen je Minute" beim Schreiben, "Zeichen je Minute" beim Lesen.
 */
import {
  challengeWertung,
  BRAILLE_CHALLENGE_WORT,
  type ChallengeErgebnis,
} from "@/lib/braille/challenge";
import { tempo, treffsicherheit } from "@/lib/braille/wertung";
import { AREAS } from "@/lib/braille/areas";
// Zeitformatierung wiederverwendet statt neu geschrieben (dasselbe Bauteil,
// das auch challenge.ts/klassenmatch.ts für die Braillezeile heranziehen).
import { mmss } from "@/lib/typing/schreibprobe";

function eineStelle(n: number): string {
  return n.toFixed(1).replace(".", ",");
}

function Zeile({ was, wert }: { was: string; wert: string }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 border-b border-hairline/60 py-1.5 last:border-b-0">
      <dt className="m-0 text-ink-soft">{was}</dt>
      <dd className="m-0 font-medium tabular-nums text-ink">{wert}</dd>
    </div>
  );
}

function Kachel({ was, wert, einheit }: { was: string; wert: string; einheit?: string }) {
  return (
    <div className="flex min-w-[7rem] flex-col rounded-2xl border border-hairline bg-surface-sunken px-3 py-2">
      <dt className="m-0 text-xs text-ink-soft">{was}</dt>
      <dd className="m-0 text-xl font-semibold tabular-nums text-ink">
        {wert}
        {einheit ? <span className="ml-0.5 text-sm font-normal text-ink-soft">{einheit}</span> : null}
      </dd>
    </div>
  );
}

export function BrailleChallengeErgebnis({
  ergebnis,
  onWeiter,
}: {
  ergebnis: ChallengeErgebnis;
  /** "Weiter üben" - zurück in den normalen Trainer. */
  onWeiter?: () => void;
}) {
  const bereichLabel = AREAS.find((a) => a.key === ergebnis.bereich)?.label ?? ergebnis.bereich;
  const istSchreiben = ergebnis.arbeitsweise === "schreiben";
  const tempoLabel = istSchreiben ? "Zellen je Minute" : "Zeichen je Minute";
  const richtigLabel = istSchreiben ? "Richtige Zellen" : "Richtige Zeichen";
  const falschLabel = istSchreiben ? "Falsche Zellen" : "Falsche Zeichen";
  const w = challengeWertung(ergebnis);
  const tempoWert = Math.round(tempo(ergebnis.lauf));
  const treffWert = Math.round(treffsicherheit(ergebnis.lauf) * 100);

  return (
    <div className="card mx-auto w-full max-w-prose p-5 sm:p-6">
      <h2
        data-challenge-titel
        tabIndex={-1}
        className="m-0 text-xl font-semibold text-ink outline-none"
      >
        Deine {BRAILLE_CHALLENGE_WORT}
      </h2>
      <p className="mb-4 mt-1 text-ink-soft">
        {bereichLabel} · {istSchreiben ? "Schreiben" : "Lesen"}
      </p>

      <dl className="m-0 flex flex-wrap gap-3">
        <Kachel was={tempoLabel} wert={String(tempoWert)} />
        <Kachel was="Treffsicherheit" wert={String(treffWert)} einheit="%" />
        <Kachel was="Leistungswert" wert={eineStelle(w.wert)} />
      </dl>

      <dl className="m-0 mt-4">
        <Zeile was={richtigLabel} wert={String(ergebnis.lauf.richtig)} />
        <Zeile was={falschLabel} wert={String(ergebnis.lauf.falsch)} />
        <Zeile was="Arbeitszeit" wert={mmss(ergebnis.lauf.arbeitszeitMs)} />
        {ergebnis.lauf.ansageMs > 0 ? (
          <Zeile was="Abgezogene Vorlesezeit" wert={mmss(ergebnis.lauf.ansageMs)} />
        ) : null}
      </dl>

      {onWeiter ? (
        <div className="mt-6">
          <button type="button" className="btn-primary" onClick={onWeiter}>
            Weiter üben
          </button>
          <p className="mb-0 mt-2 text-sm text-ink-muted">Escape bringt dich auch zurück zum Üben.</p>
        </div>
      ) : null}
    </div>
  );
}
