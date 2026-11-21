/**
 * ★★★ DAS ENDE DES MATCHS - die Platzierungsliste. Vorbild `typing/KlassenmatchErgebnis.tsx`.
 *
 * "Pokal für 1, Silber für 2, Bronze für 3" - jeweils Zeichen PLUS Wort. Es
 * gibt hier KEIN "letzter Platz", keine rote Zeile, keinen Vergleich in
 * Worten ([[feedback_nie_gegen_das_kind]]). Auch der Leistungswert steht
 * bewusst NICHT dabei: Das Match ist ein Spiel, keine Messung.
 *
 * Gespeichert wird NICHTS (siehe `klassenmatch.ts` Kopf, "Was NICHT
 * gespeichert wird").
 */
import { useEffect, useRef } from "react";
import type { RanglistenEintrag } from "@/lib/braille/klassenmatch";
import { istGelistet, lobSatz, sichtbareRangliste } from "@/lib/klassenmatch/obereHaelfte";

function ehrenzeichen(platz: number): { zeichen: string; wort: string } | null {
  if (platz === 1) return { zeichen: "🏆", wort: "Pokal" };
  if (platz === 2) return { zeichen: "🥈", wort: "Silber" };
  if (platz === 3) return { zeichen: "🥉", wort: "Bronze" };
  return null;
}

export function BrailleKlassenmatchErgebnis({
  liste,
  eigeneUid,
  onWeiter,
}: {
  liste: readonly RanglistenEintrag[];
  eigeneUid: string;
  onWeiter: () => void;
}) {
  const titelRef = useRef<HTMLHeadingElement>(null);
  // ★★★★★ Nach dem Match nur die obere Hälfte (Johannes 18.11.2026,
  // `obereHaelfte.ts`). Wer nicht gelistet ist, bekommt ein Lob, keinen Platz.
  const sichtbar = sichtbareRangliste(liste);
  useEffect(() => {
    titelRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onWeiter();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onWeiter]);

  return (
    <div className="card mx-auto w-full max-w-prose p-5 sm:p-6">
      <h2
        ref={titelRef}
        tabIndex={-1}
        data-match-titel
        className="m-0 text-xl font-semibold text-ink outline-none"
      >
        Das Klassenmatch ist vorbei
      </h2>
      <ol className="m-0 mt-4 list-none space-y-1 p-0">
        {sichtbar.map((e) => {
          const ehre = ehrenzeichen(e.platz);
          const eigen = e.stand.pupilUid === eigeneUid;
          return (
            <li
              key={e.stand.pupilUid}
              className={
                "flex flex-wrap items-baseline gap-x-3 rounded-xl px-3 py-1.5 " +
                (eigen ? "border border-hairline bg-surface-sunken font-semibold text-ink" : "text-ink")
              }
            >
              <span className="w-8 shrink-0 text-right tabular-nums">{e.platz}.</span>
              <span className="min-w-0 flex-1 truncate">{e.stand.name}</span>
              {ehre ? (
                <span className="shrink-0 whitespace-nowrap">
                  <span aria-hidden="true" className="text-2xl align-middle">
                    {ehre.zeichen}
                  </span>{" "}
                  {ehre.wort}
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
      {!istGelistet(sichtbar, eigeneUid) ? (
        <p data-match-lob className="m-0 mt-4 text-lg font-semibold text-ink">
          {lobSatz()}
        </p>
      ) : null}
      <div className="mt-6">
        <button type="button" className="btn-primary" onClick={onWeiter}>
          Weiter üben
        </button>
        <p className="mb-0 mt-2 text-sm text-ink-muted">Escape bringt dich auch zurück zum Üben.</p>
      </div>
    </div>
  );
}
