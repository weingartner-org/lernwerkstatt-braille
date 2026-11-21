/**
 * „Meine Statistik" - die Statistik von Plus, geöffnet aus dem Konto-Menü.
 *
 * ★ Bis 23.09.2026 hieß sie „Meine Zahlen" und war eine Tür auf der
 * Startseite. Jetzt steht sie wie in Tastenflow und Punktgenau im Konto-Menü
 * und heißt dort wie hier - ein Name in der ganzen Suite.
 *
 * ★ Nur die eigenen. Keine Rangliste, kein Vergleich mit der Klasse, keine
 * Note: Ranglisten senken bei schwach platzierten Kindern nachweislich die
 * Beteiligung, und ein Vergleich beantwortet keine Frage, die ein Kind hat.
 *
 * ★ Keine Zeiten. Plus misst keine Dauer und zeigt deshalb auch keine - weder
 * „Minuten geübt" noch „Sekunden je Aufgabe". Was nicht gemessen wird, kann
 * auch nicht gegen ein Kind verwendet werden.
 *
 * ★ Alles als Text. Ein Balken, den nur das Auge liest, ist auf der
 * Braillezeile nichts. Wo ein Verhältnis hilft, steht es in Worten daneben.
 */
import { tagesnummer, type Stand } from "@/lib/plus/coach";
import { rueckblick, type RueckblickZeile } from "@/lib/plus/rueckblick";
import { useUeberschriftFokus } from "./fokus";
import { paket } from "@/lib/plus/stoffplan";
import { UEBUNGEN_GESAMT, stufenSatz, stufenZeilen } from "@/lib/plus/klassenstand";
import type { PlusFortschritt } from "@/lib/plus/fortschritt";

export interface PlusStatistikProps {
  fortschritt: PlusFortschritt;
  onZurueck: () => void;
}

/** Ein Anteil in Worten - „drei von vier". Für den Fall, dass Prozent nichts sagt. */
export function anteilInWorten(teil: number, ganz: number): string {
  if (ganz <= 0) return "noch nichts";
  const prozent = Math.round((teil / ganz) * 100);
  return `${teil} von ${ganz} (${prozent} Prozent)`;
}

export function PlusStatistik({ fortschritt, onZurueck }: PlusStatistikProps) {
  const ueberschrift = useUeberschriftFokus<HTMLHeadingElement>();
  const stand: Stand = fortschritt.stand;
  const geuebt = Object.keys(stand.pakete);

  /*
   * ★ Dieselbe Rechnung wie im Reiter „Plus" der Lehrkraft (23.09.2026):
   * Was das Kind hier über sich liest, ist bis auf die Anrede dasselbe, was
   * die Lehrkraft in „Meine Klasse" sieht - weil es DIESELBE Funktion ist und
   * nicht zwei, die auseinanderlaufen können.
   */
  const jeStufe = stufenZeilen(stand).filter((z) => z.angefasst > 0);
  /*
   * ★ Ich gegen früher (16.10.2026): nur mit sich selbst, nur was besser
   * geworden ist (`lib/plus/rueckblick.ts`).
   */
  const frueher = rueckblick(fortschritt.verlauf ?? {}, stand, tagesnummer());
  const gibtRueckblick = frueher.sitztJetzt.length + frueher.wirdBesser.length > 0;
  const gruppe = (titel: string, zeilen: RueckblickZeile[]) => zeilen.length > 0 && (
    <div>
      <h4 className="text-base font-medium text-ink">{titel}</h4>
      <ul className="m-0 mt-1 list-none space-y-2 p-0 text-ink">
        {zeilen.map((z) => (
          <li key={z.id}><b>{z.name}</b><br />{z.satz}</li>
        ))}
      </ul>
    </div>
  );

  return (
    <section className="space-y-5" aria-labelledby="plus-statistik">
      <h2 id="plus-statistik" ref={ueberschrift} tabIndex={-1} className="text-xl font-semibold text-ink">Meine Statistik</h2>

      <ul className="m-0 list-none space-y-1 p-0 text-ink">
        <li>Gerechnet: {fortschritt.gerechnet} {fortschritt.gerechnet === 1 ? "Aufgabe" : "Aufgaben"}</li>
        <li>Richtig: {anteilInWorten(fortschritt.richtige, fortschritt.gerechnet)}</li>
        <li>Runden: {fortschritt.runden}</li>
        <li>Übungen ohne einen Fehler: {fortschritt.laeufeOhneFehler}</li>
        {/* ★ Nur gelöste Rätsel - übersprungene werden nirgends gezählt. */}
        <li>Rätsel gelöst: {fortschritt.raetselGeloest}</li>
        <li>Tage, an denen du gerechnet hast: {fortschritt.tage.length}</li>
        <li>Verschiedene Übungen: {geuebt.length} von {UEBUNGEN_GESAMT}</li>
        <li>Abzeichen: {fortschritt.abzeichen.length}</li>
      </ul>

      <div className="space-y-2">
        <h3 className="text-lg font-medium text-ink">Ich gegen früher</h3>
        <p className="text-ink">Hier siehst du nur dich selbst.</p>
        {gibtRueckblick ? (
          <>
            {gruppe("Das sitzt jetzt", frueher.sitztJetzt)}
            {gruppe("Das wird besser", frueher.wirdBesser)}
          </>
        ) : (
          <p className="text-ink">Rechne ein paar Tage lang. Dann siehst du hier, was besser geworden ist.</p>
        )}
      </div>

      {jeStufe.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-ink">Nach Schulstufen</h3>
          <ul className="m-0 mt-1 list-none space-y-1 p-0 text-ink">
            {jeStufe.map((z) => (
              <li key={z.nr}>{stufenSatz(z)}</li>
            ))}
          </ul>
        </div>
      )}

      {geuebt.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-ink">Woran du zuletzt gearbeitet hast</h3>
          <ul className="m-0 mt-1 list-none space-y-1 p-0 text-sm text-ink">
            {geuebt.slice(-8).reverse().map((id) => (
              <li key={id}>
                {paket(id).name} - {stand.pakete[id].versuche}{" "}
                {stand.pakete[id].versuche === 1 ? "Aufgabe" : "Aufgaben"}
              </li>
            ))}
          </ul>
        </div>
      )}

      {fortschritt.gerechnet === 0 && (
        <p className="text-ink">Hier stehen deine Zahlen, sobald du gerechnet hast.</p>
      )}

      <button type="button" className="rounded border border-hairline px-3 py-2 text-ink" onClick={onZurueck}>
        Zurück
      </button>
    </section>
  );
}
