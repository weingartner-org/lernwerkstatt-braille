/**
 * Verwechslungs-Matrix für einen Lernenden — eine Komponente, zwei Aufrufer:
 * Lehrkraft (über fremde pupil.id) und Kind/Studi (über eigene account.id).
 * Datentransparenz-Prinzip: Lehrkraft sieht NIE mehr als das Kind selbst.
 * Bauvertrag §4: Anspruchsstufe (SystemStufe) wird hier NICHT angezeigt.
 */
import { useEffect, useState } from "react";
import { confusionFromEvents, mnemonicFor, type ConfusionMatrix } from "@/lib/braille/confuse";
import type { TaskEvent } from "@/lib/braille/account";
import { brailleBackend } from "@/lib/braille/backend";
import { pg } from "@/lib/braille/sprachen/pg";

interface Props {
  accountId: string;
  /** Wer schaut? "lehrkraft" | "schueler" — bestimmt den Hinweistext bei leerer Matrix. */
  viewer?: "lehrkraft" | "schueler";
}

export function BrailleConfusionPanel({ accountId, viewer = "schueler" }: Props) {
  const [matrix, setMatrix] = useState<ConfusionMatrix | null>(null);

  useEffect(() => {
    let alive = true;
    brailleBackend()
      .getEvents(accountId)
      .then((ev: TaskEvent[]) => {
        if (!alive) return;
        setMatrix(confusionFromEvents(ev));
      });
    return () => {
      alive = false;
    };
  }, [accountId]);

  if (!matrix) {
    return <p className="text-sm text-ink-muted">{pg("Verwechslungen werden geladen …", (t) => t.verwechslungen.laedt)}</p>;
  }

  if (matrix.rows.length === 0) {
    const hint =
      viewer === "lehrkraft"
        ? pg("Noch keine Verwechslungen aufgezeichnet.", (t) => t.verwechslungen.leerLehrkraft)
        : pg("Du hast noch keine Zeichen verwechselt. Super!", (t) => t.verwechslungen.leerKind);
    return <p className="text-sm text-ink-muted">{hint}</p>;
  }

  // Kind-Ansicht: eine LISTE, ein Satz pro Soll-Zeichen — eine Braillezeile
  // liest jede Verwechslung als EINE Zeile am Stück, statt mit Tabellen-
  // navigation Zelle für Zelle zu springen (Johannes-Vorgabe 2026-07-02).
  // Die Lehrkraft behält die Vergleichs-Tabelle (Überblick über viele Kinder).
  if (viewer === "schueler") {
    return (
      <ul
        aria-label={pg("Meine Verwechslungen", (t) => t.verwechslungen.listeName)}
        className="m-0 list-none space-y-1.5 p-0 text-sm"
      >
        {matrix.rows.map((row) => {
          const topTyped = row.confusedWith[0]?.typed;
          const tip = topTyped ? mnemonicFor(row.expected, topTyped) : undefined;
          const errorPct = Math.round(row.errorRate * 100);
          const mixups = row.confusedWith
            .slice(0, 5)
            .map((c) => `${c.typed} (${c.count}×)`)
            .join(", ");
          return (
            <li key={row.expected} className="border-t border-hairline/60 py-1.5 first:border-t-0">
              <span className="font-mono font-semibold text-ink">{row.expected}</span>
              <span className="text-ink-soft">
                {": "}
                {pg(`${errorPct} % Fehler, verwechselt mit ${mixups}.`, (t) => t.verwechslungen.zeile(errorPct, mixups))}
              </span>
              {tip && <span className="text-ink-muted"> {pg("Tipp:", (t) => t.verwechslungen.tipp)} {tip}</span>}
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table
        className="w-full text-sm"
        aria-label={pg("Verwechslungs-Matrix", (t) => t.verwechslungen.tabelleName)}
      >
        <caption className="sr-only">
          {pg("Verwechslungs-Matrix: Soll-Zeichen, Fehlerquote und häufigste Verwechslungen", (t) => t.verwechslungen.tabelleBeschreibung)}
        </caption>
        <thead>
          <tr className="text-center text-ink-muted">
            <th scope="col" className="py-1.5 pr-3">{pg("Soll-Zeichen", (t) => t.verwechslungen.spalteSoll)}</th>
            <th scope="col" className="py-1.5 pr-3">{pg("Fehlerquote", (t) => t.verwechslungen.spalteQuote)}</th>
            <th scope="col" className="py-1.5 pr-3">{pg("Verwechselt mit", (t) => t.verwechslungen.spalteMit)}</th>
            <th scope="col" className="py-1.5">{pg("Merktipp", (t) => t.verwechslungen.spalteTipp)}</th>
          </tr>
        </thead>
        <tbody className="text-center [&_td]:py-1.5 [&_td]:pr-3 [&_tr]:border-t [&_tr]:border-hairline/60">
          {matrix.rows.map((row) => {
            const topTyped = row.confusedWith[0]?.typed;
            const tip = topTyped ? mnemonicFor(row.expected, topTyped) : undefined;
            const errorPct = Math.round(row.errorRate * 100);
            const highError = row.errorRate > 0.1;

            return (
              <tr key={row.expected}>
                <td className="font-mono font-semibold text-ink">
                  {row.expected}
                </td>
                <td>
                  <span
                    className={
                      highError
                        ? "inline-block rounded px-1.5 py-0.5 text-xs font-medium bg-danger-soft text-ink"
                        : "text-ink-muted"
                    }
                  >
                    {errorPct} %
                  </span>
                </td>
                <td>
                  {/* justify-center: ein Flex-Block erbt `text-center` nicht
                      (10.09.2026, Johannes: alle Tabellenspalten mittig). */}
                  <span className="flex flex-wrap justify-center gap-1">
                    {row.confusedWith.slice(0, 5).map((c) => (
                      <span
                        key={c.typed}
                        className="inline-block rounded bg-canvas-muted px-1.5 py-0.5 font-mono text-xs text-ink"
                        title={`${c.typed}: ${c.count}×`}
                      >
                        {c.typed} ×{c.count}
                      </span>
                    ))}
                  </span>
                </td>
                <td className="text-xs text-ink-muted">
                  {tip ?? ""}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
