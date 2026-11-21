/**
 * Die Karte am Ende einer Etappe - Szene und Stand der Reise.
 *
 * Regeln und Begründung: `lib/plus/reise.ts`. Hier nur das Äußere:
 *   · Alles steht als Text da; der Balken ist `aria-hidden`, die Zahl daneben
 *     sagt dasselbe.
 *   · „Die Reise bisher lesen" ist ein Schalter mit `aria-expanded`; die Liste
 *     erscheint direkt dahinter, der Fokus bleibt auf dem Schalter.
 *   · Keine Farbe als einzige Information, im Kontrastmodus Rahmen.
 */
import { useState } from "react";
import {
  etappenWort, reiseBisher, szene, szenenTitel, type EtappeFertig,
} from "@/lib/plus/reise";

export function PlusReise({ etappe }: { etappe: EtappeFertig }) {
  const [offen, setOffen] = useState(false);
  const wort = etappenWort(etappe.stufe);
  const s = szene(etappe.stufe, etappe.nr);
  const prozent = Math.round((etappe.nr / etappe.gesamt) * 100);

  return (
    <section className="space-y-3 rounded border-2 border-hairline p-4" aria-labelledby="plus-etappe">
      <h3 id="plus-etappe" className="text-lg font-semibold text-ink">
        {wort} {etappe.nr} geschafft
      </h3>
      <p className="text-ink">
        {wort} {etappe.nr} von {etappe.gesamt} · {etappe.paketName}
      </p>
      <div aria-hidden="true" className="h-3 overflow-hidden rounded-full bg-surface-sunken">
        <div className="h-full bg-ink" style={{ width: `${prozent}%` }} />
      </div>
      <div className="space-y-1 rounded bg-surface-sunken p-3">
        <h4 className="text-base font-semibold text-ink">{szenenTitel(etappe.stufe, etappe.nr)}</h4>
        {s.text.map((satz, i) => (
          <p key={i} className="m-0 text-ink">{satz}</p>
        ))}
      </div>
      {etappe.naechste && (
        <p className="text-ink">Als Nächstes: {etappe.naechste}</p>
      )}
      <button
        type="button"
        className="rounded border border-hairline px-3 py-2 text-ink"
        aria-expanded={offen}
        aria-controls="plus-reise-bisher"
        onClick={() => setOffen((v) => !v)}
      >
        Die Reise bisher lesen
      </button>
      {offen && (
        <ol id="plus-reise-bisher" className="m-0 list-none space-y-2 p-0">
          {reiseBisher(etappe.stufe, etappe.nr).map((z) => (
            <li key={z.titel} className="text-ink">
              <b>{z.titel}.</b> {z.text}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
