/**
 * ════════════════════════════════════════════════════════════════════════════
 * SORTIERBARE TABELLE (08.09.2026)
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Johannes: *„Ich möchte tabellen die ich sortieren kann."*
 *
 * ★ Der Spaltenkopf wird NICHT neu gebaut. `components/typing/Spaltenkopf.tsx`
 * kann seit dem 01.09.2026 genau das - anklickbar, mit der Tabulatortaste
 * erreichbar, mit `aria-sort` am richtigen `th` und einem Hinweis, der auch
 * beim Fokussieren gelesen wird. Ein zweiter Kopf daneben wäre die Doppelung,
 * die einander nicht kennt: Wer die Sortier-Ansage dort verbessert, hätte sie
 * hier nicht (Memory: feedback_zwei_stellen_die_voneinander_nichts_wissen).
 *
 * ⚠️ Sortiert wird über `wert`, angezeigt wird `zeige`. Beides zu vermengen
 * wäre der klassische Fehler: „1.284" und „842" sind als TEXT falsch herum
 * sortiert, und „12 Min" käme vor „9 Min".
 */
import { useMemo, useState, type ReactNode } from "react";
import { Spaltenkopf, type Sortierung } from "@/components/typing/Spaltenkopf";

export type Spalte<T> = {
  /** Eindeutiger Schlüssel - er steuert die Sortierung. */
  schluessel: string;
  titel: string;
  /** Der Satz, der beim Überfahren und beim Fokussieren erscheint. */
  hilfe?: string;
  /** Der Wert, nach dem sortiert wird (Zahl oder Text). */
  wert: (zeile: T) => number | string;
  /** Was in der Zelle steht. Fehlt es, steht dort der Wert. */
  zeige?: (zeile: T) => ReactNode;
  /** Zahlen rechts, Text links. */
  zahl?: boolean;
};

export function SortierTabelle<T>({
  spalten,
  zeilen,
  schluesselVon,
  standardSpalte,
  leerText = "Noch keine Daten.",
  beschriftung,
}: {
  spalten: Spalte<T>[];
  zeilen: T[];
  /** Stabiler React-Schlüssel je Zeile. */
  schluesselVon: (zeile: T) => string;
  /** Wonach beim Öffnen sortiert wird (grösster Wert zuerst). */
  standardSpalte: string;
  leerText?: string;
  /** Was die Tabelle zeigt - für die Sprachausgabe (`<caption>`). */
  beschriftung: string;
}) {
  const [sortierung, setSortierung] = useState<Sortierung>({
    spalte: standardSpalte,
    ab: true,
  });

  const sortiert = useMemo(() => {
    if (!sortierung) return zeilen;
    const spalte = spalten.find((s) => s.schluessel === sortierung.spalte);
    if (!spalte) return zeilen;
    const kopie = [...zeilen];
    kopie.sort((a, b) => {
      const wa = spalte.wert(a);
      const wb = spalte.wert(b);
      let v: number;
      if (typeof wa === "number" && typeof wb === "number") v = wa - wb;
      else
        v = String(wa).localeCompare(String(wb), "de-AT", {
          sensitivity: "base",
          numeric: true,
        });
      return sortierung.ab ? -v : v;
    });
    return kopie;
  }, [zeilen, sortierung, spalten]);

  const umschalten = (schluessel: string) => {
    setSortierung((vorher) =>
      vorher && vorher.spalte === schluessel
        ? { spalte: schluessel, ab: !vorher.ab }
        : // ★ Eine neu gewählte Spalte startet mit dem GRÖSSTEN Wert oben.
          // Bei „wie viele Kinder" ist das die Frage, die man stellt; wer
          // aufsteigend will, drückt ein zweites Mal.
          { spalte: schluessel, ab: true },
    );
  };

  if (zeilen.length === 0) {
    return <p className="p-4 text-sm text-ink-muted">{leerText}</p>;
  }

  return (
    /*
      Der eigene Rollbereich ist Pflicht, nicht Geschmack: Eine breite Tabelle
      darf die ganze SEITE nicht waagerecht schieben - sonst wandert bei jedem
      Blättern auch die Navigation aus dem Bild.
    */
    <div className="overflow-x-auto">
      <table className="w-full min-w-[40rem] border-collapse text-sm">
        <caption className="sr-only">{beschriftung}</caption>
        <thead>
          <tr className="border-b border-hairline text-xs text-ink-muted">
            {spalten.map((s, i) => (
              <Spaltenkopf
                key={s.schluessel}
                hilfe={s.hilfe}
                ausrichtung={i >= spalten.length - 2 ? "rechts" : "links"}
                className={`px-2 py-2 font-medium ${s.zahl ? "text-right" : "text-left"}`}
                sortSchluessel={s.schluessel}
                sortierung={sortierung}
                onSortieren={umschalten}
              >
                {s.titel}
              </Spaltenkopf>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortiert.map((z) => (
            <tr key={schluesselVon(z)} className="border-b border-hairline last:border-0">
              {spalten.map((s) => (
                <td
                  key={s.schluessel}
                  className={`px-2 py-2 ${s.zahl ? "text-right tabular-nums" : "text-left"}`}
                >
                  {s.zeige ? s.zeige(z) : String(s.wert(z))}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
