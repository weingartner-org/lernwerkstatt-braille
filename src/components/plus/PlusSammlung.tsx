/**
 * Meine Sammlung - Abzeichen, Wochenziel und die Meldungs-Chronik.
 *
 * ★ Drei Entscheidungen, die man der Seite ansieht:
 *   · Ob ein Abzeichen gefunden ist, steht als WORT da - nie nur als Farbe.
 *   · Die geheimen zeigen ihre Bedingung nicht. Sie sollen überraschen; wer
 *     sie abarbeiten kann, hat kein Geheimnis mehr.
 *   · Die Chronik ist kein Beiwerk. Live-Meldungen kommen auf der Braillezeile
 *     unzuverlässig an und verdrängen, was gerade unter den Fingern liegt -
 *     hier stehen sie zum Nachlesen.
 */
import { useState } from "react";
import { useUeberschriftFokus } from "./fokus";
import { motivBild } from "@/lib/abzeichen/motivBild";
import { useContrast } from "@/lib/contrast";
import { uebersicht, type Einstufung, type Stand } from "@/lib/plus/coach";
import { STUFEN } from "@/lib/plus/stoffplan";
import {
  ABZEICHEN, WOCHENZIELE, wochenstand, type Familie, type Wochenziel,
} from "@/lib/plus/abzeichen";

const FAMILIENNAME: Record<Familie, string> = {
  menge: "Fleißige Rechner",
  treffsicherheit: "Genau hingeschaut",
  vielfalt: "Weit herumgekommen",
  tage: "Dranbleiber",
  mut: "Mutig weitergemacht",
  miteinander: "Miteinander",
  geheimnis: "Geheimnisse",
};

const REIHENFOLGE: Familie[] = ["menge", "treffsicherheit", "vielfalt", "tage", "mut", "miteinander", "geheimnis"];

/** Die drei Worte, in denen Plus einen Stand ausdrückt. Nie eine Note. */
const WIE: Record<Einstufung, string> = {
  sitzt: "Kann ich",
  wackelt: "Fast",
  offen: "Noch nicht dran",
};

export interface PlusSammlungProps {
  /** Der Stand des Coaches - für „Was ich schon kann". */
  stand: Stand;
  /** Welche Stufe zuerst gezeigt wird. */
  stufe: number | null;
  gefunden: readonly string[];
  wochenziel: Wochenziel;
  /** Die Lehrkraft hat das Wochenziel der Klasse vorgegeben - dann wählt das Kind nicht. */
  wochenzielVonLehrkraft?: boolean;
  chronik: readonly { tag: number; text: string }[];
  onWochenziel: (ziel: number) => void;
  onZurueck: () => void;
}

export function PlusSammlung({
  stand, stufe, gefunden, wochenziel, wochenzielVonLehrkraft = false, chronik, onWochenziel, onZurueck,
}: PlusSammlungProps) {
  const ueberschrift = useUeberschriftFokus<HTMLHeadingElement>();
  /**
   * ★ Im Kontrastmodus die Strichzeichnung statt des farbigen Bildes. Die
   * farbigen Motive malen sich in ihrer eigenen Farbe und ignorieren jede
   * Kontrasteinstellung - genau der Fehler, den die Kopfzeile vor einem Jahr
   * mit ihren Emoji hatte (gemessen 30.08.2026: Gelb auf Blau 2,05:1).
   */
  const modus = useContrast((s) => s.mode);
  const kontrast = modus !== "hell" && modus !== "dunkel";
  const hat = new Set(gefunden);
  const [gezeigt, setGezeigt] = useState(stufe ?? 1);
  const liste = uebersicht(stand, gezeigt);
  const zaehle = (wie: Einstufung) => liste.filter((z) => z.wie === wie).length;

  return (
    <section className="space-y-6" aria-labelledby="plus-sammlung">
      <h2 id="plus-sammlung" ref={ueberschrift} tabIndex={-1} className="text-xl font-semibold text-ink">Meine Sammlung</h2>

      <div className="space-y-2">
        <h3 className="text-lg font-medium text-ink">Mein Wochenziel</h3>
        <p className="text-ink">{wochenstand(wochenziel)}</p>
        {wochenzielVonLehrkraft ? (
          <p className="m-0 text-ink-muted">Dieses Wochenziel hat deine Lehrkraft für die Klasse festgelegt.</p>
        ) : (
        <fieldset className="m-0 border-0 p-0">
          <legend className="text-sm text-ink-muted">So viele Aufgaben möchte ich diese Woche rechnen:</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {WOCHENZIELE.map((z) => (
              <button
                key={z}
                type="button"
                className="rounded border border-hairline px-3 py-2 text-ink"
                aria-pressed={wochenziel.ziel === z}
                onClick={() => onWochenziel(z)}
              >
                {z} Aufgaben{wochenziel.ziel === z ? " (gewählt)" : ""}
              </button>
            ))}
          </div>
        </fieldset>
        )}
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-medium text-ink">Was ich schon kann</h3>
        <p className="text-ink">
          {gezeigt}. Schulstufe: {zaehle("sitzt")} kann ich, {zaehle("wackelt")} fast,{" "}
          {zaehle("offen")} noch nicht dran.
        </p>
        <label className="block text-sm text-ink-muted" htmlFor="plus-stand-stufe">
          Schulstufe
        </label>
        <select
          id="plus-stand-stufe"
          className="rounded border border-hairline bg-surface-sunken px-3 py-2 text-ink"
          value={gezeigt}
          onChange={(e) => setGezeigt(Number(e.target.value))}
        >
          {STUFEN.map((s) => (
            <option key={s.nr} value={s.nr}>{s.nr}. Schulstufe</option>
          ))}
        </select>
        {/* ★ Der Stand steht als WORT da. „Kann ich" ist keine Note und kein
            Prozentwert: Wertungen dienen dem Lernen, nie der Beurteilung. */}
        <ul className="m-0 list-none space-y-1 p-0 text-sm">
          {liste.map((z) => (
            <li key={z.id} className="text-ink">
              {z.name} - <span className="text-ink-muted">{WIE[z.wie]}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-ink">
          Meine Abzeichen: {hat.size} von {ABZEICHEN.length}
        </h3>
        {REIHENFOLGE.map((familie) => {
          const liste = ABZEICHEN.filter((a) => a.familie === familie);
          return (
            <div key={familie}>
              <h4 className="text-base font-medium text-ink">{FAMILIENNAME[familie]}</h4>
              <ul className="m-0 mt-1 list-none space-y-1 p-0">
                {liste.map((a) => {
                  const da = hat.has(a.id);
                  // Ein ungefundenes Geheimnis verrät nichts - auch nicht sein Bild.
                  const geheim = a.geheim && !da;
                  return (
                    <li key={a.id} className="flex items-baseline gap-2 text-sm">
                      {!geheim && (
                        <img src={motivBild(a.emoji, kontrast)} alt="" aria-hidden="true" className="h-6 w-6 shrink-0" />
                      )}
                      <span className="text-ink">
                        {geheim ? (
                          <>Ein Geheimnis - noch nicht gefunden.</>
                        ) : (
                          <>
                            <strong className="font-medium">{a.name}</strong>
                            {" - "}
                            {a.bedingung}
                            {" "}
                            <span className="text-ink-muted">{da ? "Gefunden." : "Noch offen."}</span>
                          </>
                        )}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>

      {chronik.length > 0 && (
        <div className="space-y-1">
          <h3 className="text-lg font-medium text-ink">Was Plus dir gemeldet hat</h3>
          <ul className="m-0 list-none space-y-1 p-0 text-sm text-ink">
            {[...chronik].reverse().map((e, i) => <li key={i}>{e.text}</li>)}
          </ul>
        </div>
      )}

      <button type="button" className="rounded border border-hairline px-3 py-2 text-ink" onClick={onZurueck}>
        Zurück
      </button>
    </section>
  );
}
