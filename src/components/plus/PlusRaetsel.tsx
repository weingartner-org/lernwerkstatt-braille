/**
 * Das Rätsel nach jeder dritten Runde.
 *
 * ★★ Johannes, 26.09.2026: „rundenbasiert aufbauen, 8 Rechnungen und nach 3
 * Runden kommt ein Rätsel, das man auch überspringen kann". Das Überspringen
 * ist deshalb kein versteckter Ausweg, sondern ein Knopf, der von Anfang an
 * dasteht. Ein Rätsel ist ein Angebot, keine Pflicht - und wer überspringt,
 * wird nirgends gezählt.
 *
 * Die Rätsel selbst kommen aus `lib/plus/raetsel/`; hier werden sie nur
 * gezeigt und geprüft - mit derselben Prüfung und demselben Feld wie jede
 * andere Aufgabe in Plus. Ein Rätsel ist keine Sonderwelt: Die Schreibweise
 * ist dieselbe, die Braille-Eingabe auch.
 *
 * ★ Kein Zeitdruck, kein Tempo. Der Tipp kommt nur auf Knopfdruck, die
 * Lösung erst nach zwei Versuchen - vorher nicht, sonst übt das Kind das
 * Durchklicken.
 *
 * ★ Genau EINE Live-Region, solange das Rätsel steht. Die Runde davor hat
 * ihre eigene nicht mehr: Diese Seite ersetzt ihren Abschluss.
 *
 * Fokus-Führung: Beim Erscheinen steht die Schreibmarke im Feld. Ist das
 * Rätsel gelöst oder aufgelöst, verschwinden Prüfen, Tipp und Überspringen -
 * der Fokus geht auf „Weiter", nie auf `body`.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { pruefe, type Aufgabe } from "@/lib/plus/aufgabe";
import { eingabezeile, eingabezeileBraille } from "@/lib/plus/zeile";
import { sprich } from "@/lib/sprechen/rechnen";
import { PlusEingabe, vorlageInZellen, type Eingabeart } from "./PlusEingabe";
import { spieleRichtigTon } from "@/lib/plus/ton";

export type RaetselEnde = "geloest" | "aufgeloest" | "uebersprungen";

export interface PlusRaetselProps {
  aufgabe: Aufgabe;
  /** Was die Runde davor ergab - „7 von 8 richtig." Steht über dem Rätsel. */
  vorspann?: string;
  ansagen?: (satz: string) => void;
  art: Eingabeart;
  onArt: (art: Eingabeart) => void;
  /** „Rechnungen ausschreiben": alles in Worten, das Feld beginnt leer. */
  ausschreiben?: boolean;
  onEnde: (ende: RaetselEnde) => void;
}

type Stand = "offen" | "geloest" | "aufgeloest";

export function PlusRaetsel({
  aufgabe, vorspann = "", ansagen, art, onArt, ausschreiben = false, onEnde,
}: PlusRaetselProps) {
  const [wert, setWert] = useState("");
  const [stand, setStand] = useState<Stand>("offen");
  const [versuche, setVersuche] = useState(0);
  const [tipp, setTipp] = useState(false);
  const [meldung, setMeldung] = useState("");
  const feld = useRef<HTMLTextAreaElement>(null);
  const weiterKnopf = useRef<HTMLButtonElement>(null);

  const mitBraille = art !== "normal";
  // Ohne Braillezeile: Aufgabe oben, Feld leer (Johannes, 19.10.2026).
  const zeile = useMemo(() => (mitBraille ? eingabezeileBraille(aufgabe) : null), [aufgabe, mitBraille]);
  const mehrzeilig = useMemo(() => !!eingabezeile(aufgabe)?.mehrzeilig, [aufgabe]);
  // ★ Was das Feld nicht tragen kann (Mathematikschrift), steht ganz oben im Angabefeld.
  const imFeld = !!zeile && vorlageInZellen(zeile.vorlage, zeile.marke, art) !== null;
  const zeilen = zeile && imFeld ? zeile.davor : aufgabe.angabe.split("\n");
  const titel = aufgabe.titel ?? "Rätsel";

  // Beim Erscheinen: ansagen, dann ins Feld.
  useEffect(() => {
    ansagen?.(`Rätsel: ${titel}. ${aufgabe.angabe.split("\n").map((z) => sprich(z) || z).join(" ")}`);
    const t = setTimeout(() => feld.current?.focus(), 0);
    return () => clearTimeout(t);
  }, [aufgabe, titel, ansagen]);

  // Gelöst oder aufgelöst: der Fokus geht auf „Weiter".
  useEffect(() => {
    if (stand === "offen") return;
    const t = setTimeout(() => weiterKnopf.current?.focus(), 0);
    return () => clearTimeout(t);
  }, [stand]);

  const sage = useCallback((satz: string) => {
    setMeldung(satz);
    ansagen?.(satz);
  }, [ansagen]);

  const loesungSatz = aufgabe.passt ? `Eine Lösung ist ${aufgabe.loesung}.` : `Die Lösung ist ${aufgabe.loesung}.`;

  const pruefen = useCallback(() => {
    if (stand !== "offen") { onEnde(stand === "geloest" ? "geloest" : "aufgeloest"); return; }
    const urteil = pruefe(wert, aufgabe, zeile ?? undefined);
    if (urteil.stand === "leer") { ansagen?.("Da steht noch nichts."); return; }
    if (urteil.stand === "teilweise") { ansagen?.("Eine Lücke ist noch leer."); return; }
    if (urteil.stand === "veraendert") {
      sage("Vorne hat sich etwas verändert. Zweimal Umschalt holt die Zeile zurück.");
      return;
    }
    if (urteil.stand === "richtig" || urteil.stand === "schreibfehler") {
      setStand("geloest");
      if (urteil.stand === "richtig") spieleRichtigTon();
      const vorn = urteil.stand === "schreibfehler" ? `Gelöst! Man schreibt es: ${urteil.schreibung}.` : "Gelöst!";
      sage([vorn, aufgabe.erklaerung].filter(Boolean).join(" "));
      return;
    }
    setVersuche((v) => v + 1);
    if (urteil.hinweis) { sage(urteil.stand === "einheit" ? `Richtig gerechnet - ${urteil.hinweis}.` : `Noch nicht. ${urteil.hinweis}.`); return; }
    sage(aufgabe.tipp && !tipp ? "Noch nicht. Ein Tipp hilft vielleicht." : "Noch nicht. Denk noch einmal nach.");
  }, [stand, wert, aufgabe, ansagen, sage, tipp, onEnde, mitBraille, zeile]);

  const knopf = "rounded border border-hairline px-3 py-2 text-ink";

  return (
    <section className="space-y-4" aria-labelledby="plus-raetsel-titel">
      {vorspann && <p className="m-0 text-ink">{vorspann}</p>}
      <h2 id="plus-raetsel-titel" className="text-xl font-semibold text-ink">Rätsel: {titel}</h2>

      {zeilen.length > 0 && (
        <div id="plus-raetsel-angabe" className="rounded border border-hairline bg-surface-sunken p-3">
          {zeilen.map((z, i) => (
            <p key={i} className={`m-0 text-lg text-ink${ausschreiben ? "" : " font-mono"}`}>
              {ausschreiben ? sprich(z) || z : z}
            </p>
          ))}
        </div>
      )}

      <PlusEingabe
        wert={wert}
        onWert={setWert}
        art={art}
        onArt={onArt}
        onPruefen={pruefen}
        ansagen={ansagen}
        feldRef={feld}
        beschriebenVon={zeilen.length ? "plus-raetsel-angabe" : undefined}
        vorlage={zeile?.vorlage}
        marke={zeile?.marke}
        neuBei={aufgabe}
        mehrzeilig={mehrzeilig}
        erwartet={aufgabe.loesung.length}
      />

      {tipp && aufgabe.tipp && <p className="m-0 text-ink">Tipp: {aufgabe.tipp}</p>}

      <div className="flex flex-wrap gap-2">
        {stand === "offen" ? (
          <>
            <button type="button" className={knopf} onClick={pruefen}>Prüfen</button>
            {aufgabe.tipp && !tipp && (
              <button
                type="button"
                className={knopf}
                onClick={() => {
                  setTipp(true);
                  ansagen?.(`Tipp: ${aufgabe.tipp}`);
                  feld.current?.focus();
                }}
              >
                Tipp
              </button>
            )}
            {/* ★ Die Lösung erst nach zwei Versuchen - wie in jeder Übung. */}
            {versuche >= 2 && (
              <button
                type="button"
                className={knopf}
                onClick={() => {
                  setStand("aufgeloest");
                  sage([loesungSatz, aufgabe.erklaerung].filter(Boolean).join(" "));
                }}
              >
                Lösung zeigen
              </button>
            )}
            <button
              type="button"
              className={knopf}
              onClick={() => {
                ansagen?.(aufgabe.angabe.split("\n").map((z) => sprich(z) || z).join(" "));
                feld.current?.focus();
              }}
            >
              Rätsel noch einmal sagen
            </button>
            {/* ★ Von Anfang an da - „das man auch überspringen kann". */}
            <button type="button" className={knopf} onClick={() => onEnde("uebersprungen")}>
              Überspringen
            </button>
          </>
        ) : (
          <button
            ref={weiterKnopf}
            type="button"
            className="btn-primary"
            onClick={() => onEnde(stand === "geloest" ? "geloest" : "aufgeloest")}
          >
            Weiter
          </button>
        )}
      </div>

      <p role="status" className="min-h-6 text-ink">{meldung}</p>
    </section>
  );
}
