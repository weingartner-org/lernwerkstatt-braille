/**
 * Die Auswahl: erst die Schulstufe, dann die Übung.
 *
 * ★ Zwei Listen statt einer langen. 161 Übungen in einer Liste wären auf der
 * Braillezeile eine Wanderung - Zeile für Zeile, 40 Zeichen auf einmal. Mit
 * der Stufe davor sind es acht Schalter und danach höchstens zwei Dutzend.
 *
 * ★ Was noch nicht fertig ist, steht nicht in der Liste. Ein Schalter, der
 * nichts tut, ist schlimmer als keiner - und `disabled` nimmt ihn der
 * Tastatur ganz weg. Wie viele fehlen, steht darunter im Klartext.
 */
import { useMemo } from "react";
import { useUeberschriftFokus } from "./fokus";
import { bedienbarePakete } from "@/lib/plus/generator";
import { stufenFuerSprache } from "@/lib/plus/stoffplan";
import { usePlusTexte } from "@/lib/plus/sprache";

export interface PlusWahlProps {
  /** Die gewählte Stufe, oder nichts - dann steht die Stufenliste da. */
  stufe: number | null;
  onStufe: (nr: number | null) => void;
  onPaket: (id: string) => void;
  /**
   * Zurück zum Start. ★ Bis 23.09.2026 fehlte er: „Ich wähle" war eine
   * Sackgasse - aus der Stufenliste führte nichts hinaus, und aus der
   * Übungsliste nur „Andere Schulstufe", also wieder in die Stufenliste.
   * Aufgefallen, als ein Kind einer Klasse gar keine Stufenliste mehr sieht.
   */
  onZurueck?: () => void;
  /**
   * Welche Pakete spielbar sind. Ohne Angabe misst die Auswahl selbst.
   * ★ Seit 23.09.2026 sind alle 161 spielbar - die Zeile „noch nicht fertig"
   * erscheint nirgends mehr. Der Wächter braucht sie trotzdem: sobald ein
   * Paket dazukommt, das noch nicht fertig ist, muss sie wieder stimmen.
   */
  bedienbar?: readonly string[];
  /**
   * Die Stufe steht fest - das Kind gehört einer Klasse an (23.09.2026). Dann
   * gibt es keinen Knopf „Andere Schulstufe", sondern einen Satz, der sagt,
   * warum. Ein Knopf, der nichts tun darf, wäre ein Knopf zu viel.
   */
  feste?: boolean;
}

export function PlusWahl({
  stufe, onStufe, onPaket, bedienbar: vorgabe, feste = false, onZurueck,
}: PlusWahlProps) {
  const ueberschrift = useUeberschriftFokus<HTMLHeadingElement>();
  const t = usePlusTexte();
  const STUFEN = stufenFuerSprache();
  // Gemessen, nicht behauptet: die Liste entsteht, indem der Generator jedem
  // Paket wirklich eine Aufgabe baut.
  const bedienbar = useMemo(() => new Set(vorgabe ?? bedienbarePakete()), [vorgabe]);

  if (stufe === null) {
    return (
      <section className="space-y-3" aria-labelledby="plus-stufenwahl">
        <h2 id="plus-stufenwahl" ref={ueberschrift} tabIndex={-1} className="text-xl font-semibold text-ink">{t.wahl.stufenTitel}</h2>
        <ul className="m-0 grid list-none gap-2 p-0 sm:grid-cols-2">
          {STUFEN.map((s) => (
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
        {onZurueck && (
          <button type="button" className="rounded border border-hairline px-3 py-2 text-ink" onClick={onZurueck}>
            {t.zurueck}
          </button>
        )}
      </section>
    );
  }

  const daten = STUFEN.find((s) => s.nr === stufe);
  if (!daten) return null;
  const offen = daten.pakete.filter((p) => !bedienbar.has(p.id));
  const fertig = daten.pakete.filter((p) => bedienbar.has(p.id));

  return (
    <section className="space-y-3" aria-labelledby="plus-paketwahl">
      <h2 id="plus-paketwahl" ref={ueberschrift} tabIndex={-1} className="text-xl font-semibold text-ink">
        {t.wahl.paketTitel(t.stufe(daten.nr))}
      </h2>
      <p className="text-sm text-ink-muted">{daten.leitidee}</p>
      <ul className="m-0 list-none space-y-2 p-0">
        {fertig.map((p) => (
          <li key={p.id}>
            <button
              type="button"
              className="w-full rounded border border-hairline px-3 py-2 text-left text-ink"
              onClick={() => onPaket(p.id)}
            >
              {p.name}
            </button>
          </li>
        ))}
      </ul>
      {offen.length > 0 && (
        <p className="text-sm text-ink-muted">
          {t.wahl.offen(offen.length)}
        </p>
      )}
      {feste && <p className="text-sm text-ink-muted">{t.wahl.feste}</p>}
      <div className="flex flex-wrap gap-2">
        {!feste && (
          <button
            type="button"
            className="rounded border border-hairline px-3 py-2 text-ink"
            onClick={() => onStufe(null)}
          >
            {t.wahl.andere}
          </button>
        )}
        {onZurueck && (
          <button type="button" className="rounded border border-hairline px-3 py-2 text-ink" onClick={onZurueck}>
            {t.zurueck}
          </button>
        )}
      </div>
    </section>
  );
}
