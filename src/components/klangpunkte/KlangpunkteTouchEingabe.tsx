/**
 * Zellen schreiben ohne Tastatur - für Handy und Tablet.
 *
 * Zwei Wege, beide erreichbar per Wischen (VoiceOver) und Antippen:
 *
 *  1. Punkt-Knöpfe: sechs Schalter (Punkt 1 bis 6) und „Zelle setzen".
 *     Langsam, aber es funktioniert für alle Kinder, auch ohne Braillekenntnis
 *     der Eingabeart.
 *  2. Braille-Bildschirmeingabe von VoiceOver: ein Textfeld, in das die
 *     Zellen wie in jedes andere Feld geschrieben werden (Rotor →
 *     „Braille-Bildschirmeingabe"). Die Zellen kommen als TEXT an und werden
 *     mit lib/klangpunkte/bsi.ts in Punktmuster zurückverwandelt.
 *
 * Bewusst NICHT innerhalb der Eingabefläche mit `role="application"`: Deren
 * Tastenbehandlung (f d s j k l, Leertaste) würde die Zeichen im Textfeld
 * schlucken.
 */
import { useEffect, useId, useRef, useState } from "react";
import { BLANK, cellToUnicode, dotsLabel, type Cell } from "@/lib/braille";
import type { AnnounceCallback } from "@/components/braille/BrailleTrainer";
import { useKlangTexte } from "@/lib/klangpunkte/sprache";
import { BSI_ANFANG, bsiZuZellen, type BsiKontext } from "@/lib/klangpunkte/bsi";

/** Punkte in der Reihenfolge, wie sie in der Zelle stehen: links 1-2-3, rechts 4-5-6. */
const PUNKT_REIHENFOLGE = [1, 4, 2, 5, 3, 6] as const;

interface Eintrag {
  text: string;
  codepoints: string;
  ergebnis: string;
}

export interface KlangpunkteTouchEingabeProps {
  /** Eine Zelle wurde geschrieben; `BLANK` ist der Taktstrich. */
  onZelle: (cell: Cell) => void;
  /** Letzte Zelle löschen. Fehlt es, gibt es in dieser Aufgabe kein Löschen. */
  onLoeschen?: () => void;
  /** Eingabe prüfen (Takt-Baumeister). */
  onPruefen?: () => void;
  onAnnounce: AnnounceCallback;
  /** Wechselt mit der Aufgabe: setzt Auswahl und Textfeld zurück. */
  aufgabe: string;
  /** Text für den Taktstrich-Knopf. */
  taktstrichText?: string;
  /** Textfeld der Bildschirmeingabe zeigen (nur wenn Zellen getippt werden). */
  mitBildschirmBraille?: boolean;
}

function punkteAlsZelle(punkte: Iterable<number>): Cell {
  let c = 0;
  for (const p of punkte) c |= 1 << (p - 1);
  return c;
}

export function KlangpunkteTouchEingabe({
  onZelle,
  onLoeschen,
  onPruefen,
  onAnnounce,
  aufgabe,
  taktstrichText,
  mitBildschirmBraille = true,
}: KlangpunkteTouchEingabeProps) {
  const tx = useKlangTexte().runner.touch;
  const feldId = useId();
  const [gewaehlt, setGewaehlt] = useState<Set<number>>(new Set());
  const [verlaufLog, setVerlaufLog] = useState<Eintrag[]>([]);
  const vorher = useRef("");
  const kontext = useRef<BsiKontext>(BSI_ANFANG);
  const stapel = useRef<{ zeichen: number; zellen: number }[]>([]);
  const feld = useRef<HTMLTextAreaElement>(null);

  // Neue Aufgabe: alles auf Anfang. Ein liegengebliebener Punkt oder Text aus
  // der vorigen Aufgabe würde sonst in die nächste Zelle rutschen.
  useEffect(() => {
    setGewaehlt(new Set());
    setVerlaufLog([]);
    vorher.current = "";
    kontext.current = BSI_ANFANG;
    stapel.current = [];
    if (feld.current) feld.current.value = "";
  }, [aufgabe]);

  const umschalten = (p: number) =>
    setGewaehlt((alt) => {
      const neu = new Set(alt);
      if (neu.has(p)) neu.delete(p);
      else neu.add(p);
      return neu;
    });

  const zelleSetzen = () => {
    if (gewaehlt.size === 0) {
      onAnnounce({
        channel: "status",
        text: tx.nochKeinPunkt,
      });
      return;
    }
    const zelle = punkteAlsZelle(gewaehlt);
    setGewaehlt(new Set());
    onZelle(zelle);
  };

  const beiEingabe = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const neu = e.currentTarget.value;
    const alt = vorher.current;
    vorher.current = neu;

    // Gemeinsamen Anfang bestimmen: Was danach im alten Text stand, ist
    // gelöscht; was danach im neuen steht, ist neu. So bleibt es richtig,
    // auch wenn das Gerät den Text nachträglich umschreibt.
    let p = 0;
    while (p < alt.length && p < neu.length && alt[p] === neu[p]) p++;
    let weg = alt.length - p;
    const dazu = neu.slice(p);

    // ★ Ein Merkposten je ERKANNTER EINHEIT (Buchstabe, Lautgruppe,
    // Zahlzeichen+Ziffer ...), nicht je Ereignis - sonst würde eine Rücktaste,
    // die nur EIN Zeichen aus dem Text nimmt, gleich mehrere Zellen auf einmal
    // löschen, wenn zuvor mehrere Zeichen in einem Schub angekommen waren
    // (gemessen 21.09.2026: „dd" in einem Ereignis, eine Rücktaste löschte
    // beide c-Achtel statt einer). Nimmt eine Rücktaste nur einen TEIL einer
    // mehrzeichigen Einheit weg (z. B. nur das „h" aus „ch"), wird die ganze
    // Einheit rückgängig gemacht - eine angebrochene Lautgruppe lässt sich
    // ohnehin nicht zur Hälfte "entzellen".
    while (weg > 0 && stapel.current.length) {
      const s = stapel.current.pop()!;
      weg -= s.zeichen;
      for (let i = 0; i < s.zellen; i++) onLoeschen?.();
    }

    if (!dazu) return;
    for (const teil of dazu.split(/(\n)/)) {
      if (teil === "") continue;
      if (teil === "\n") {
        onPruefen?.();
        stapel.current.push({ zeichen: 1, zellen: 0 });
        continue;
      }
      const r = bsiZuZellen(teil, kontext.current);
      kontext.current = r.kontext;
      for (const e of r.einheiten) stapel.current.push({ zeichen: e.text.length, zellen: e.cells.length });
      const cps = [...teil].map((c) => "U+" + c.codePointAt(0)!.toString(16).toUpperCase().padStart(4, "0")).join(" ");
      const ergebnis =
        r.cells.length === 0
          ? tx.keineZelleErkannt
          : r.cells
              .map((c) => (c === BLANK ? tx.taktstrich : `${cellToUnicode(c)} ${dotsLabel(c)}`))
              .join(", ");
      setVerlaufLog((log) => [{ text: teil, codepoints: cps, ergebnis }, ...log].slice(0, 12));
      if (r.unbekannt.length) {
        onAnnounce({
          channel: "alert",
          text: tx.unbekannt(r.unbekannt.join(" ")),
        });
      }
      for (const c of r.cells) onZelle(c);
    }
    // Wächst das Feld, wird das Vorlesen zäh: nur die letzten Zeichen behalten.
    const el = e.currentTarget;
    if (el.value.length > 200) {
      el.value = el.value.slice(-40);
      vorher.current = el.value;
      let rest = el.value.length;
      const behalten: { zeichen: number; zellen: number }[] = [];
      for (let i = stapel.current.length - 1; i >= 0 && rest > 0; i--) {
        behalten.unshift(stapel.current[i]);
        rest -= stapel.current[i].zeichen;
      }
      stapel.current = behalten;
    }
  };

  return (
    <div
      role="group"
      aria-label={tx.gruppe}
      data-feld="beruehrung"
      className="space-y-3 rounded-xl border border-hairline bg-surface-raised p-3"
      // ★★★ Dieses Feld steckt in der Übungsfläche (`role="application"`),
      // deren EIGENE Tastenbehandlung Rücktaste/Enter/f d s j k l abfängt
      // (Befund 21.09.2026: eine physische Rücktaste im Bildschirm-Braille-
      // Feld löschte eine ganze Zelle über den Übungsbereich, statt ein
      // Zeichen im Textfeld - das Textfeld bekam die Taste nie zu sehen).
      // `stopPropagation` hier hält jede Taste an, BEVOR sie den Übungs-
      // bereich erreicht; Knöpfe und Textfeld verhalten sich dadurch normal.
      onKeyDown={(e) => e.stopPropagation()}
      onKeyUp={(e) => e.stopPropagation()}
    >
      <p className="text-sm text-ink-muted">
        {tx.anleitungVor}<strong>{tx.zelleSetzen}</strong>{tx.anleitungNach}
      </p>

      <div
        role="group"
        aria-label={tx.punkteGruppe}
        className="grid w-full max-w-xs grid-cols-2 gap-2"
      >
        {PUNKT_REIHENFOLGE.map((p) => {
          const an = gewaehlt.has(p);
          return (
            <button
              key={p}
              type="button"
              aria-pressed={an}
              aria-label={tx.punkt(p)}
              onClick={() => umschalten(p)}
              className={
                "min-h-[3.5rem] rounded-xl border-2 text-lg font-semibold " +
                (an
                  ? "border-accent bg-accent text-white"
                  : "border-hairline bg-surface text-ink")
              }
            >
              <span aria-hidden="true">{p}</span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn-primary btn-toggle" onClick={zelleSetzen}>
          {tx.zelleSetzen}
        </button>
        <button type="button" className="btn-secondary btn-toggle" onClick={() => onZelle(BLANK)}>
          {taktstrichText ?? tx.taktstrich}
        </button>
        {onLoeschen && (
          <button type="button" className="btn-secondary btn-toggle" onClick={onLoeschen}>
            {tx.letzteLoeschen}
          </button>
        )}
        {onPruefen && (
          <button type="button" className="btn-primary btn-toggle" onClick={onPruefen}>
            {tx.taktPruefen}
          </button>
        )}
      </div>

      {mitBildschirmBraille && (
        <div className="space-y-1.5 border-t border-hairline pt-3">
          <label htmlFor={feldId} className="block text-sm font-semibold text-ink">
            {tx.bsiTitel}
          </label>
          <textarea
            id={feldId}
            ref={feld}
            rows={2}
            autoCapitalize="off"
            autoCorrect="off"
            autoComplete="off"
            spellCheck={false}
            onInput={beiEingabe}
            className="w-full rounded-lg border border-hairline bg-surface px-2 py-1.5 font-mono text-base text-ink"
          />
          <p className="text-xs text-ink-muted">
            {tx.bsiHinweis}
          </p>
          <details>
            <summary className="cursor-pointer text-xs font-semibold text-ink-muted">
              {tx.testen}
            </summary>
            <ul className="mt-1 space-y-0.5 text-xs text-ink-muted" aria-live="off">
              {verlaufLog.length === 0 && <li>{tx.nochNichts}</li>}
              {verlaufLog.map((z, i) => (
                <li key={i}>
                  {tx.verlauf(z.text, z.codepoints, z.ergebnis)}
                </li>
              ))}
            </ul>
          </details>
        </div>
      )}
    </div>
  );
}
