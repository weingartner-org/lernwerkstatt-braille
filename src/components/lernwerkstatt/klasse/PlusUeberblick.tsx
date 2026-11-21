/**
 * Der Klassenüberblick im Reiter „Plus" - Zeitraum, Kennzahlen, Wochensäulen,
 * „Zum Hinschauen". Aufbau wie der Klassenüberblick in Tastenflow
 * (`Klassenueberblick.tsx`): links Umschalter und Kennzahlen, rechts das
 * Diagramm, darunter die Hinweise.
 *
 * ★ Nichts hier reiht Kinder. Die Kennzahlen sind Summen und Mittel der Klasse;
 * die Hinweise nennen einen Grund und die Namen dazu, alphabetisch. Die Regeln
 * stehen in `lib/plus/klassenblick.ts`.
 *
 * ★ Die Säulen sind nur fürs Auge. Dieselben Zahlen stehen als Tabelle für die
 * Sprachausgabe und die Braillezeile daneben (`sr-only`).
 */
import {
  ZEITRAEUME, prozent, tagKurz,
  type Hinweis, type KlassenBlick, type WochenSaeule, type Zeitraum,
} from "@/lib/plus/klassenblick";

export function Zeitraumwahl({
  wert, onWahl, gruppenName = "Zeitraum",
}: {
  wert: Zeitraum;
  onWahl: (z: Zeitraum) => void;
  gruppenName?: string;
}) {
  return (
    <div role="group" aria-label={gruppenName} className="flex flex-wrap gap-2">
      {ZEITRAEUME.map((z) => (
        <button
          key={z.key}
          type="button"
          aria-pressed={wert === z.key}
          onClick={() => onWahl(z.key)}
          className={`${wert === z.key ? "btn-primary" : "btn-secondary"} btn-toggle btn-umriss whitespace-nowrap text-sm`}
        >
          {z.name}
        </button>
      ))}
    </div>
  );
}

/** Eine Kennzahl: Name und Wert, dazu der ganze Satz für die Sprachausgabe. */
function Kennzahl({ name, wert, satz }: { name: string; wert: string; satz: string }) {
  return (
    <div className="flex flex-col">
      <dt className="text-sm text-ink-muted">{name}</dt>
      <dd className="m-0 text-2xl font-semibold text-ink">
        <span aria-hidden="true">{wert}</span>
        <span className="sr-only">{satz}</span>
      </dd>
    </div>
  );
}

/** Die Säulen: Aufgaben der Klasse (oder eines Kindes) je Woche. */
export function Wochensaeulen({
  reihe, name, einheit = "Aufgaben",
}: {
  reihe: readonly WochenSaeule[];
  name: string;
  einheit?: string;
}) {
  const hoechste = Math.max(1, ...reihe.map((w) => w.aufgaben));
  return (
    <div>
      <p className="m-0 mb-2 text-sm font-medium text-ink">{name}</p>
      <div className="flex h-28 items-end gap-2" aria-hidden="true">
        {reihe.map((w, i) => (
          <div key={w.montag} className="flex h-full flex-1 flex-col items-center justify-end">
            <span className="text-xs text-ink-muted">{w.aufgaben || ""}</span>
            <div
              className={`w-full rounded-t ${i === reihe.length - 1 ? "bg-accent" : "bg-accent/60"}`}
              style={{ height: `${Math.max(w.aufgaben > 0 ? 4 : 1, Math.round((w.aufgaben / hoechste) * 80))}%` }}
            />
          </div>
        ))}
      </div>
      <div className="mt-1 flex gap-2 text-xs text-ink-muted" aria-hidden="true">
        {reihe.map((w) => (
          <span key={w.montag} className="flex-1 text-center">{tagKurz(w.montag).replace(/\.$/, "")}</span>
        ))}
      </div>
      <table className="sr-only">
        <caption>{name}</caption>
        <thead>
          <tr>
            <th scope="col">Woche ab Montag</th>
            <th scope="col">{einheit}</th>
            <th scope="col">Richtig</th>
          </tr>
        </thead>
        <tbody>
          {reihe.map((w) => (
            <tr key={w.montag}>
              <th scope="row">{tagKurz(w.montag)}</th>
              <td>{w.aufgaben}</td>
              <td>{prozent(w.richtige, w.aufgaben) === null ? "-" : `${prozent(w.richtige, w.aufgaben)} Prozent`}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function kinderWort(n: number): string {
  return n === 1 ? "Kind" : "Kindern";
}

export function PlusUeberblick({
  blick, zeitraum, onZeitraum, saeulen, hinweise, zeitraumSatz, vorKurzem, geladen, klassenSatz,
}: {
  blick: KlassenBlick;
  zeitraum: Zeitraum;
  onZeitraum: (z: Zeitraum) => void;
  saeulen: readonly WochenSaeule[];
  hinweise: readonly Hinweis[];
  /** „den letzten 30 Tagen" - für die Sätze der Kennzahlen. */
  zeitraumSatz: string;
  /** Keine Mitschrift je Tag: der Zeitraum zählt noch nichts. */
  vorKurzem: boolean;
  geladen: boolean;
  /** Der Satz über die ganze Klasse (`klassenSatz`) - für die Sprachausgabe an der ersten Kennzahl. */
  klassenSatz: string;
}) {
  const quote = prozent(blick.richtige, blick.aufgaben);
  return (
    <section aria-labelledby="plus-ueberblick" className="space-y-4 rounded-xl border border-hairline bg-surface-sunken p-4">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <h3 id="plus-ueberblick" className="m-0 text-base font-semibold text-ink">Klassenüberblick</h3>
            <Zeitraumwahl wert={zeitraum} onWahl={onZeitraum} />
          </div>

          {!geladen ? (
            <p role="status" className="m-0 text-ink-muted">Lädt …</p>
          ) : blick.kinder === 0 ? (
            <p className="m-0 text-ink">In dieser Klasse ist noch kein Kind angelegt.</p>
          ) : (
            <dl className="m-0 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
              <Kennzahl
                name="Rechnen mit Plus"
                wert={`${blick.begonnen} von ${blick.kinder}`}
                satz={klassenSatz}
              />
              <Kennzahl
                name={zeitraum === "gesamt" ? "Aktiv" : "Aktiv im Zeitraum"}
                wert={`${blick.aktiv} von ${blick.kinder}`}
                satz={`${blick.aktiv} von ${blick.kinder} ${kinderWort(blick.kinder)} haben in ${zeitraumSatz} gerechnet.`}
              />
              <Kennzahl
                name="Aufgaben"
                wert={String(blick.aufgaben)}
                satz={`${blick.aufgaben} ${blick.aufgaben === 1 ? "Aufgabe" : "Aufgaben"} in ${zeitraumSatz}${
                  blick.jeKind !== null ? `, im Mittel ${blick.jeKind} je Kind, das gerechnet hat` : ""
                }.`}
              />
              <Kennzahl
                name="Richtig"
                wert={quote === null ? "-" : `${quote} %`}
                satz={quote === null ? "Noch nichts gerechnet." : `${quote} Prozent richtig in ${zeitraumSatz}.`}
              />
              <Kennzahl
                name="Wochenziel erreicht"
                wert={blick.mitZiel ? `${blick.zielErreicht} von ${blick.mitZiel}` : "-"}
                satz={blick.mitZiel
                  ? `${blick.zielErreicht} von ${blick.mitZiel} ${kinderWort(blick.mitZiel)} haben ihr Wochenziel diese Woche erreicht.`
                  : "Noch kein Kind mit Wochenziel."}
              />
              <Kennzahl
                name="Übungen, die sitzen"
                wert={String(blick.sitzt)}
                satz={`${blick.sitzt} ${blick.sitzt === 1 ? "Übung sitzt" : "Übungen sitzen"} bei allen Kindern zusammen.`}
              />
            </dl>
          )}

          {geladen && vorKurzem && zeitraum !== "gesamt" && (
            <p className="m-0 text-xs text-ink-muted">
              Für diesen Zeitraum zählt Plus erst seit dem 16.10.2026 mit; frühere Aufgaben stehen nur
              unter „Gesamt".
            </p>
          )}
        </div>

        <Wochensaeulen reihe={saeulen} name="Aufgaben der Klasse je Woche" />
      </div>

      {geladen && hinweise.length > 0 && (
        <div className="border-t border-hairline pt-3">
          <h4 className="m-0 mb-2 text-sm font-semibold text-ink">Zum Hinschauen</h4>
          <ul className="m-0 list-none space-y-1 p-0 text-sm text-ink">
            {hinweise.map((h) => (
              <li key={h.id}>
                <span aria-hidden="true">{h.gut ? "✓ " : "• "}</span>
                <strong className="font-medium">{h.satz}:</strong> {h.namen.join(", ")}
              </li>
            ))}
          </ul>
          <p className="m-0 mt-2 text-xs text-ink-muted">
            Das sind Anlässe zum Nachsehen, keine Urteile - und keine Reihung: Die Namen stehen nach dem Alphabet.
          </p>
        </div>
      )}
    </section>
  );
}
