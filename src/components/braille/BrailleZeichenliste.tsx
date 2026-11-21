/**
 * Zeichenliste (Alt+L) — das Nachschlagewerk von „Punktgenau": ALLE Zeichen und
 * Kürzungen des aktiven Bereichs, gegliedert nach Etappen und in exakt der
 * Lernreihenfolge (die Didaktik ist eingefroren — die Liste ZEIGT sie nur).
 * Auch „Klangpunkte" (eigenständige Musik-App) nutzt sie — über eine
 * Pseudo-Area mit key "noten" und allen Kapiteln in Welten-Reihenfolge.
 *
 * Barrierefreiheit als Bauprinzip:
 *  • Beim Öffnen landet der Fokus auf der Etappen-Überschrift, bei der man
 *    gerade übt — Screenreader lesen ab dort einfach weiter.
 *  • Das Suchfeld ist ein normales Eingabefeld ganz oben: die Schnellnavigation
 *    „e" von NVDA/JAWS springt direkt hinein (so von Johannes gewünscht).
 *  • Jede Zeile ist EIN durchgehender Text (Liste, keine Tabelle): Zeichen,
 *    Punkte, echtes Unicode-Braillezeichen — eine Braillezeile zeigt damit die
 *    ganze Zeile am Stück, inklusive ertastbarem Punktmuster.
 *  • Kurzschrift/UEB lösen ihre echten Kürzungszellen async über liblouis
 *    (gleicher Weg wie „Meine Tasten"); bis dahin steht „…" statt der Punkte.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import {
  BLANK,
  type Cell,
  cellDots,
  cellToUnicode,
  dotsLabel,
  solveUeb,
  textToCells,
  toBraille,
  UEB_CELLS,
  unicodeToCells,
} from "@/lib/braille";
import { isEtappeDone, type Area } from "@/lib/braille/areas";
import { klangUnitCells } from "@/lib/klangpunkte/etappen";
import { KFA_ZEICHEN_DOTS, kuerzungsZeichen } from "@/lib/braille/kurzschrift_content";
import { dots as dotsToCell } from "@/lib/braille/cell";
import type { BrailleProgress } from "@/lib/braille";
import { speakUi } from "@/lib/braille/voice";
import { pg } from "@/lib/braille/sprachen/pg";
import { Modal } from "@/components/Modal";
import { BrailleCellRow } from "./BrailleCell";

/** Eine Zeile der Liste: ein Zeichen bzw. eine Kürzung. */
interface Row {
  /** Druckschrift-Schlüssel (c, sch, die, …). */
  key: string;
  /** Sprech-Label, wenn es mehr sagt als der Schlüssel (z. B. „großes A"). */
  spoken?: string;
  /** Bedeutung (UEB: „b" bedeutet „but"). */
  gloss?: string;
  /** Braille-Zellen (null = liblouis löst noch). */
  cells: Cell[] | null;
  /** Konzept-Zeile ohne eigenes Punktmuster (z. B. „kein Kürzel"). */
  concept?: boolean;
}

/** Einmal gelöste Kürzungen im Modul merken — der Dialog öffnet oft mehrfach. */
const solvedCache = new Map<string, Cell[]>();

function rowDots(cells: Cell[]): string {
  const filled = cells.filter((c) => c !== BLANK);
  if (!filled.length) return pg("leere Zelle", (t) => t.zeichenliste.leereZelle);
  return filled.map(dotsLabel).join(" · ");
}

function rowUnicode(cells: Cell[]): string {
  return cells
    .filter((c) => c !== BLANK)
    .map(cellToUnicode)
    .join("");
}

/** Kurzschrift/UEB: echte Kürzungszellen je Einheit — identischer Lösungsweg
 *  wie die „Meine Tasten"-Legende (de-g2 bzw. en-ueb-g2; UEB-Welt 1 löst die
 *  BEDEUTUNG, weil der bloße Buchstabe sonst ein Grad-1-Zeichen bekäme). */
async function solveUnit(areaKey: Area["key"], etappeId: string, key: string): Promise<Cell[] | null> {
  const cacheKey = `${areaKey}:${etappeId}:${key}`;
  const hit = solvedCache.get(cacheKey);
  if (hit) return hit;
  try {
    let brl: string | null;
    if (areaKey === "ueb") {
      // Gruppenkürzungen (ch, tion …) greifen bei liblouis NUR im Wort — isoliert
      // gäben sie die unkontrahierten Buchstaben. Darum die vorab aus der Regel-
      // tabelle extrahierte Zelle (UEB_CELLS) nehmen; nur Nicht-Kürzungen der
      // Brücke (A, 1, ., …) fallen auf solveUeb zurück.
      brl = UEB_CELLS[key.toLowerCase()] ?? (await solveUeb(key));
    } else {
      // Zeichen der Kürzung aus der Regel - allein übersetzt gäbe liblouis
      // bei Lautgruppen Vollschrift („ll" ⠇⠇ statt ⠟) und bei „ich-2" das „-2" mit.
      brl = kuerzungsZeichen(key) ?? (await toBraille(key, "de-g2"));
    }
    if (brl == null) return null;
    const cells = unicodeToCells(brl);
    solvedCache.set(cacheKey, cells);
    return cells;
  } catch {
    return null; // einzelne Einheit nicht übersetzbar → Zeile ohne Punkte
  }
}

export function BrailleZeichenliste({
  area,
  activeIndex,
  progress,
  onClose,
}: {
  area: Area;
  /** Etappe, in der gerade geübt wird — dort landet der Fokus. */
  activeIndex: number;
  progress: BrailleProgress;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const needsSolver = area.key === "kurzschrift" || area.key === "ueb";
  // Async gelöste Zellen (nur Kurzschrift/UEB): "etappeId|key" → Zellen.
  const [solved, setSolved] = useState<Record<string, Cell[]>>({});
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Nur Etappen mit eigenen Zeichen/Kürzungen sind Kapitel der Liste
  // (Text-/Misch-Etappen führen nichts Neues ein).
  const chapters = useMemo(
    () =>
      area.etappen
        .map((et, index) => ({ et, index }))
        .filter(({ et }) => et.introducedUnits.length > 0),
    [area],
  );

  // Fokus-Kapitel: die Übungs-Etappe — oder, wenn die nichts Neues einführt
  // (Text-Etappe), das nächstfrühere Kapitel davor.
  const focusIndex = useMemo(() => {
    let best = chapters.length ? chapters[0].index : -1;
    for (const { index } of chapters) {
      if (index <= activeIndex) best = index;
      else break;
    }
    return best;
  }, [chapters, activeIndex]);

  // Kurzschrift/UEB: alle Einheiten einmal lösen (etappenweise nachschieben,
  // damit die Liste sichtbar „auffüllt" statt lange leer zu wirken).
  useEffect(() => {
    if (!needsSolver) return;
    let alive = true;
    // Kein Vorladen des Workers mehr (20.09.2026): Die Zeichen der Lektionen
    // stehen meist schon vorgerechnet bereit (generated/kurz-cells.generated.json).
    // `solveUnit` holt liblouis von selbst nach, wenn wirklich etwas fehlt.
    void (async () => {
        for (const { et } of chapters) {
          const out: Record<string, Cell[]> = {};
          for (const u of et.introducedUnits) {
            // L48-Anzeigezeichen („zx-…") haben feste Punkte (KFA_ZEICHEN_DOTS)
            // — nie über liblouis „übersetzen".
            if (u.key.startsWith("zx-")) continue;
            const cells = await solveUnit(area.key, et.id, u.key);
            if (cells) out[`${et.id}|${u.key}`] = cells;
          }
          if (!alive) return;
          setSolved((prev) => ({ ...prev, ...out }));
        }
    })().catch(() => {
      /* liblouis nicht da → Zeilen bleiben ohne Punktangabe */
    });
    return () => {
      alive = false;
    };
  }, [needsSolver, chapters, area.key]);

  // Beim Öffnen zusätzlich fürs Self-Voicing ansagen (Screenreader bekommen
  // die Info über den Fokus auf der Überschrift).
  useEffect(() => {
    const at = area.etappen[focusIndex];
    speakUi(
      pg(
        `Zeichenliste ${area.label} geöffnet.` +
          (at ? ` Du bist bei Etappe ${focusIndex + 1}: ${at.title}.` : ""),
        (t) => t.zeichenliste.ansage(area.label, focusIndex + 1, at?.title),
      ),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Zeilen je Kapitel (synchron für Basis/Voll/Computer, sonst aus `solved`).
  const rowsByChapter = useMemo(() => {
    const map = new Map<string, Row[]>();
    for (const { et } of chapters) {
      map.set(
        et.id,
        et.introducedUnits.map((u) => {
          // Pseudo-Schlüssel: Konzept-Einheiten, deren Schlüsseltext NICHT
          // wörtlich übersetzt werden darf (das ergäbe irreführende Zellen).
          if (u.key === "CAPS") {
            // Groß-Ankündigung = das Vorzeichen VOR einem Großbuchstaben —
            // die erste Zelle der Übersetzung von „A" (engine-getreu).
            let cells: Cell[] | null = null;
            try {
              cells = textToCells("A", { system: area.system }).slice(0, 1);
            } catch {
              cells = null;
            }
            return { key: u.spoken, cells };
          }
          if (u.key === "no-kuerzel") {
            return { key: u.spoken, cells: null, concept: true };
          }
          if (u.key === "#") {
            // Zahlzeichen = das Vorzeichen VOR einer Ziffer — die erste Zelle
            // der Übersetzung von „1" (engine-getreu; „#" selbst hat in
            // 6 Punkt keine Zelle und stand als „leere Zelle" da, Befund 09.07.).
            let cells: Cell[] | null = null;
            try {
              cells = textToCells("1", { system: area.system }).slice(0, 1);
            } catch {
              cells = null;
            }
            return { key: u.spoken, cells };
          }
          // Konzept-Schlüssel der Zusatz-Etappen (b13a–c): „röm"/„datum"/„bruch"
          // sind Themen-Namen, keine Zeichen — wörtlich transkribiert stünden
          // hier die Buchstaben r-ö-m (Befund 09.07.). Die echten Zeichen
          // (Großbuchstaben, Punkt, Schrägstrich) stehen in ihren Etappen.
          if (u.key === "röm" || u.key === "datum" || u.key === "bruch") {
            return { key: u.spoken, cells: null, concept: true };
          }
          // KFA-Lektion 48: Ankündigungszeichen mit festen Anzeige-Punkten
          // (keine liblouis-Kürzungen; Quelle KFA_ZEICHEN_DOTS, §2.6.7/§4.8).
          if (u.key.startsWith("zx-")) {
            const dots = KFA_ZEICHEN_DOTS[u.key];
            return {
              key: u.spoken,
              cells: dots ? dots.map((ds) => dotsToCell(...ds)) : null,
              concept: !dots,
            };
          }
          // Klangpunkte: Musik-Schlüssel („n:c:viertel", „oct:4" …) NIE als
          // Text übersetzen — die Zellen kommen aus der Notations-Tabelle.
          if (area.key === "noten") {
            return { key: u.spoken, cells: klangUnitCells(u.key) };
          }
          let cells: Cell[] | null = null;
          if (needsSolver) {
            cells = solved[`${et.id}|${u.key}`] ?? null;
          } else {
            try {
              cells = textToCells(u.key, { system: area.system });
            } catch {
              cells = null;
            }
          }
          const spoken =
            u.spoken.toLowerCase() !== u.key.toLowerCase() ? u.spoken : undefined;
          // UEB/Kurzschrift: das Sprech-Label nennt die Bedeutung bereits
          // („the sign for but", „the letter team C-H") — keine separate Gloss.
          return { key: u.key, spoken, gloss: undefined, cells };
        }),
      );
    }
    return map;
  }, [chapters, needsSolver, solved, area]);

  // Suche: trifft Zeichen/Kürzung, Sprech-Label, Bedeutung — oder Punkte
  // (Ziffern-Eingabe wie „14" bzw. „1, 4" trifft jede Zelle, die Punkt 1 UND
  // Punkt 4 gesetzt hat). Teilmengen-Vergleich statt Ziffern-Substring: „14"
  // muss auch f (Punkte 1, 2, 4) treffen — als Textfolge steckt „14" dort
  // nicht drin (Befund 2026-07-09).
  const q = query.trim().toLowerCase();
  const qDigits = /^[\d\s,.+und]+$/i.test(q) ? q.replace(/[^\d]/g, "") : "";
  const qDots = qDigits ? [...new Set([...qDigits].map(Number))] : [];
  const matches = (row: Row): boolean => {
    if (!q) return true;
    if (row.key.toLowerCase().includes(q)) return true;
    if (row.spoken?.toLowerCase().includes(q)) return true;
    if (row.gloss?.toLowerCase().includes(q)) return true;
    if (qDots.length && row.cells) {
      return row.cells.some((c) => {
        const set = new Set(cellDots(c));
        return qDots.every((d) => set.has(d));
      });
    }
    return false;
  };

  const filtered = chapters
    .map(({ et, index }) => ({
      et,
      index,
      rows: (rowsByChapter.get(et.id) ?? []).filter(matches),
    }))
    .filter((c) => c.rows.length > 0);
  const hitCount = filtered.reduce((n, c) => n + c.rows.length, 0);

  return (
    <Modal
      title={pg(`Alle Zeichen und Kürzungen — ${area.label}`, (t) => t.zeichenliste.titel(area.label))}
      onClose={onClose}
      size="lg"
      initialFocus={headingRef}
    >
      <div className="space-y-4">
        <p className="m-0 text-sm text-ink-muted">
          {pg(
            "Die Liste folgt genau deinem Lernweg: Etappe für Etappe, in der Reihenfolge, in der die Zeichen drankommen. Du stehst bei der Etappe, die du gerade übst.",
            (t) => t.zeichenliste.einfuehrung,
          )}
        </p>

        {/* Suche — ein echtes Eingabefeld: die Screenreader-Schnellnavigation
            „e" springt von überall im Dialog direkt hierher. */}
        <div>
          <label className="field-label" htmlFor="zeichenliste-suche">
            {pg("Zeichen oder Kürzung suchen:", (t) => t.zeichenliste.suchen)}
          </label>
          <input
            id="zeichenliste-suche"
            type="search"
            className="field-input w-full"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={pg("z. B. c, sch, ist — oder Punkte wie 1, 4", (t) => t.zeichenliste.platzhalter)}
            autoComplete="off"
          />
          {/* Immer gemountet — Screenreader melden nur Änderungen an schon
              vorhandenen Statusregionen zuverlässig. */}
          <p role="status" className="m-0 mt-1 text-sm text-ink-muted">
            {q
              ? hitCount === 0
                ? pg("Keine Treffer.", (t) => t.zeichenliste.keineTreffer)
                : hitCount === 1
                  ? pg("1 Treffer.", (t) => t.zeichenliste.einTreffer)
                  : pg(`${hitCount} Treffer.`, (t) => t.zeichenliste.treffer(hitCount))
              : ""}
          </p>
        </div>

        {filtered.map(({ et, index, rows }) => {
          const isCurrent = index === activeIndex;
          const done = isEtappeDone(et, progress);
          return (
            <section key={et.id} aria-labelledby={`zl-h-${et.id}`}>
              <h3
                id={`zl-h-${et.id}`}
                ref={index === focusIndex && !q ? headingRef : undefined}
                tabIndex={-1}
                className={
                  "m-0 rounded-lg px-2 py-1.5 text-base font-semibold outline-none " +
                  (isCurrent ? "bg-accent-soft text-ink" : "text-ink")
                }
              >
                {pg(
                  `Etappe ${index + 1}: ${et.title}${isCurrent ? " — hier übst du gerade" : done ? " — gemeistert" : ""}`,
                  (t) => t.zeichenliste.etappe(index + 1, et.title, isCurrent, done),
                )}
              </h3>
              <ul className="m-0 list-none divide-y divide-hairline p-0">
                {rows.map((row) => (
                  <li
                    key={row.key}
                    className="flex flex-wrap items-center gap-x-3 gap-y-1 px-2 py-1.5"
                  >
                    <span className="min-w-[3.5rem] text-lg font-bold text-ink">
                      {row.key}
                    </span>
                    {row.spoken && <span className="sr-only">, {row.spoken},</span>}
                    {row.gloss && (
                      <span className="text-sm text-ink-muted">= {row.gloss}</span>
                    )}
                    {row.cells ? (
                      <>
                        <span aria-hidden="true">
                          <BrailleCellRow
                            cells={row.cells.filter((c) => c !== BLANK)}
                            eightDot={area.eightDot}
                            size={area.eightDot ? 26 : 22}
                          />
                        </span>
                        <span className="text-sm text-ink-soft">{rowDots(row.cells)}</span>
                        {/* Echte Braillezeichen für die Braillezeile (ertastbar) */}
                        <span className="sr-only">{rowUnicode(row.cells)}</span>
                      </>
                    ) : row.concept ? null : (
                      <span className="text-sm text-ink-muted">
                        {needsSolver ? pg("Punkte werden geladen …", (t) => t.zeichenliste.laedt) : "—"}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          );
        })}

        {filtered.length === 0 && !q && (
          <p className="m-0 text-sm text-ink-muted">
            {pg("Dieser Bereich führt keine eigenen Zeichen ein.", (t) => t.zeichenliste.keineEigenen)}
          </p>
        )}
      </div>
    </Modal>
  );
}
