/**
 * Acht Schalter, eine Frage: welche Schulstufe?
 *
 * Dieselbe Liste wie in der Übungsauswahl, aber mit anderem Ziel - hier
 * beginnt danach sofort ein Lauf, den der Coach zusammenstellt.
 */
import { stufenFuerSprache } from "@/lib/plus/stoffplan";
import { usePlusTexte } from "@/lib/plus/sprache";
import { useUeberschriftFokus } from "./fokus";

export interface PlusStufenwahlProps {
  titel: string;
  hinweis?: string;
  onStufe: (nr: number) => void;
  onZurueck: () => void;
}

export function PlusStufenwahl({ titel, hinweis, onStufe, onZurueck }: PlusStufenwahlProps) {
  const ueberschrift = useUeberschriftFokus<HTMLHeadingElement>();
  const t = usePlusTexte();
  return (
    <section className="space-y-3" aria-labelledby="plus-stufenwahl-titel">
      <h2 id="plus-stufenwahl-titel" ref={ueberschrift} tabIndex={-1} className="text-xl font-semibold text-ink">{titel}</h2>
      {hinweis && <p className="text-sm text-ink-muted">{hinweis}</p>}
      <ul className="m-0 grid list-none gap-2 p-0 sm:grid-cols-2">
        {stufenFuerSprache().map((s) => (
          <li key={s.nr}>
            <button
              type="button"
              className="w-full rounded border border-hairline px-3 py-2 text-left text-ink"
              onClick={() => onStufe(s.nr)}
            >
              <span className="font-medium">{t.stufe(s.nr)}</span>
              <span className="block text-sm text-ink-muted">{s.zahlenraum}</span>
            </button>
          </li>
        ))}
      </ul>
      <button type="button" className="rounded border border-hairline px-3 py-2 text-ink" onClick={onZurueck}>
        {t.zurueck}
      </button>
    </section>
  );
}
