/**
 * ★★★★★ DAS RANKING WÄHREND DES MATCHS - Platz · Name · Strich mit Kugel.
 *
 * Vorbild `typing/KlassenmatchRanking.tsx`.
 *
 * ── ⚠️⚠️⚠️ DER GANZE BEREICH IST `aria-hidden` - das ist der Kern ───────────
 * Er ändert sich laufend und bei jedem Platzwechsel. Stünde davon auch nur
 * eine Zeile in einer Live-Region, verdrängte sie die Braillezeile für je
 * vier Sekunden ([[reference_live_region_ist_braille_blitzmeldung]]) - und
 * auf genau diese Zeile arbeitet das Kind gerade. **Es gibt hier keine
 * Ansage bei Platzwechsel, nie.** Wer den Stand wissen will, fragt mit
 * Alt + X (`BrailleKlassenmatchLauf`).
 *
 * ── Warum die Zeilen im DOM nicht die Plätze tauschen ───────────────────────
 * Die Reihenfolge im Bild macht `order` (Flexbox), nicht die Reihenfolge der
 * Knoten - ein Platzwechsel bewegt darum keinen Knoten und kann keinen
 * Fokus mitnehmen.
 *
 * ── Im Kontrastmodus zählt die Form, nicht die Farbe ────────────────────────
 * Die eigene Zeile ist fett und trägt einen Rahmen; die Kugel ist ein
 * gefüllter Kreis mit Umriss.
 */
import { kugelPositionen, type RanglistenEintrag } from "@/lib/braille/klassenmatch";

export function BrailleKlassenmatchRanking({
  liste,
  eigeneUid,
  verstrichenMs,
  dauerMs,
}: {
  liste: readonly RanglistenEintrag[];
  eigeneUid: string;
  verstrichenMs: number;
  dauerMs: number;
}) {
  const positionen = kugelPositionen(liste, verstrichenMs, dauerMs);
  const stabil = liste
    .map((e, i) => ({ e, pos: positionen[i] }))
    .sort((a, b) => a.e.stand.pupilUid.localeCompare(b.e.stand.pupilUid));

  return (
    <div aria-hidden className="flex flex-col gap-1.5 px-1 py-2">
      {stabil.map(({ e, pos }) => {
        const eigen = e.stand.pupilUid === eigeneUid;
        return (
          <div
            key={e.stand.pupilUid}
            style={{ order: e.platz }}
            className={
              "flex items-center gap-3 rounded-xl px-2 py-1 " +
              (eigen ? "border border-hairline bg-surface-sunken font-semibold text-ink" : "text-ink-soft")
            }
          >
            <span className="w-8 shrink-0 text-right tabular-nums">{e.platz}.</span>
            <span className="w-28 shrink-0 truncate sm:w-36">{e.stand.name}</span>
            <span className="relative h-3 min-w-0 flex-1">
              <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-hairline" />
              <span
                className={
                  "absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border " +
                  (eigen ? "border-ink bg-accent" : "border-hairline bg-ink-muted")
                }
                style={{
                  left: `${Math.round(pos * 1000) / 10}%`,
                  transition: "left 600ms linear",
                }}
              />
            </span>
          </div>
        );
      })}
    </div>
  );
}
