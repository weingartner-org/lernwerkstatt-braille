/**
 * Die Staffel der Klasse - die Ansicht.
 *
 * ★★★ Drei Dinge stehen hier und sonst nichts: wie weit die KLASSE ist, das
 * halb aufgedeckte Wort, und die eigene Etappe. Kein Name, keine Reihung,
 * keine Uhr. Wer wissen will, wie viel er selbst gelaufen ist, findet es
 * unter „Meine Zahlen" - auf der Tafel der Klasse hat es nichts verloren.
 *
 * ★★ Das Wort steht als Zeile da (`_R_D_K_`), nicht als Reihe von Kästchen.
 * Auf der Braillezeile ist der Unterstrich eine Zelle, und die ganze Zeile
 * liegt unter den Fingern - Kästchen wären zwölf Elemente, die man einzeln
 * anfahren müsste.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useUeberschriftFokus } from "./fokus";
import { PlusEingabe, vorlageInZellen, type Eingabeart } from "./PlusEingabe";
import { pruefe as beurteile } from "@/lib/plus/aufgabe";
import { eingabezeile, eingabezeileBraille } from "@/lib/plus/zeile";
import { kalenderwoche } from "@/lib/plus/abzeichen";
import { sprich } from "@/lib/sprechen/rechnen";
import {
  ETAPPEN_JE_KIND_AM_TAG, etappeFuer, geschafft, offeneEtappe, sichtbaresWort,
  staffelFuer, wortStimmt, type Etappe,
} from "@/lib/plus/staffel";
import { LEERE_TAFEL, staffelTafel, type Tafel } from "@/lib/plus/staffelTafel";
import type { AntwortLage } from "./usePlusFortschritt";
import { spieleRichtigTon } from "@/lib/plus/ton";

export interface PlusStaffelProps {
  stufe: number;
  ansagen?: (satz: string) => void;
  onZurueck: () => void;
  /**
   * ★ Eine gelaufene Etappe ist eine gerechnete Aufgabe - sie zählt für den
   * Coach, für das Wochenziel und für die Abzeichen. Alles andere wäre eine
   * zweite Buchhaltung neben der ersten.
   */
  onAntwort?: (lage: AntwortLage) => void;
  art: Eingabeart;
  onArt: (art: Eingabeart) => void;
  /** Nur für Tests: feste Woche. */
  woche?: string;
}

export function PlusStaffel({
  stufe, ansagen, onZurueck, onAntwort, art, onArt, woche,
}: PlusStaffelProps) {
  const ueberschrift = useUeberschriftFokus<HTMLHeadingElement>();
  const tafelSpeicher = useMemo(() => staffelTafel(), []);
  const dieWoche = woche ?? kalenderwoche();
  const klasse = tafelSpeicher.klasse ?? "allein";
  const staffel = useMemo(() => staffelFuer(klasse, dieWoche), [klasse, dieWoche]);

  const [tafel, setTafel] = useState<Tafel>(LEERE_TAFEL);
  const [geladen, setGeladen] = useState(false);
  const [heute, setHeute] = useState(0);
  const [eingabe, setEingabe] = useState("");
  const [wortEingabe, setWortEingabe] = useState("");
  const [meldung, setMeldung] = useState("");
  const feld = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    let lebt = true;
    tafelSpeicher.lies(dieWoche).then((t) => { if (lebt) { setTafel(t); setGeladen(true); } });
    return () => { lebt = false; };
  }, [tafelSpeicher, dieWoche]);

  const fertig = geschafft(staffel, tafel.gelaufen, tafel.wortGeraten);
  const nr = offeneEtappe(staffel, tafel.gelaufen);
  const etappe: Etappe | null = useMemo(
    () => (nr === null ? null : etappeFuer(klasse, dieWoche, nr, stufe)),
    [klasse, dieWoche, nr, stufe],
  );
  const genugFuerHeute = heute >= ETAPPEN_JE_KIND_AM_TAG;
  /** Die Rechenzeile steht im Feld (Johannes, 25.09.2026) - wie in der Übung. */
  // Ohne Braillezeile: Aufgabe oben, Feld leer (Johannes, 19.10.2026).
  const zeile = useMemo(() => (etappe && art !== "normal" ? eingabezeileBraille(etappe.aufgabe) : null), [etappe, art]);
  const mehrzeilig = useMemo(() => !!(etappe && eingabezeile(etappe.aufgabe)?.mehrzeilig), [etappe]);
  // ★ Was nicht im Feld steht, steht oben im Angabefeld - nie woanders.
  const oben = !etappe ? "" : zeile && vorlageInZellen(zeile.vorlage, zeile.marke, art) !== null
    ? zeile.davor.join("\n") : etappe.aufgabe.angabe;
  const wort = sichtbaresWort(staffel, tafel.gelaufen);
  // ★ Ist die Staffel geschafft, steht das Wort ganz da. Es halb verdeckt zu
  // lassen, während eine Zeile tiefer „Das Wort war MUSTER" steht, wäre die
  // Art von Widerspruch, die ein Kind an sich selbst zweifeln lässt.
  const gezeigtesWort = fertig ? staffel.wort : wort;

  const pruefe = useCallback(() => {
    if (!etappe || nr === null) return;
    const urteil = beurteile(eingabe, etappe.aufgabe, zeile ?? undefined);
    const melde = (richtig: boolean) => onAntwort?.({
      paketId: etappe.aufgabe.paket, richtig, loesung: etappe.aufgabe.loesung,
      eingabeart: art, aufgabe: etappe.aufgabe, eingabe: urteil.antwort,
    });
    // ★ Nichts geschrieben ist kein Versuch - weder für die Staffel noch für
    // den Coach.
    if (urteil.stand === "leer" || urteil.stand === "teilweise") {
      ansagen?.(urteil.stand === "leer" ? "Da steht noch nichts." : "Eine Lücke ist noch leer.");
      return;
    }
    if (urteil.stand !== "richtig") {
      const satz = urteil.stand === "veraendert"
        ? "Vorne hat sich die Rechnung verändert. Zweimal Umschalt holt sie zurück."
        : urteil.stand === "schreibfehler"
          ? `Fast richtig. Man schreibt es: ${urteil.schreibung}.`
          : urteil.stand === "einheit"
            ? `Richtig gerechnet - ${urteil.hinweis ?? "achte auf die Einheit"}.`
            : urteil.stand === "rest"
              ? "Richtig gerechnet - der Rest fehlt noch."
              : urteil.hinweis
                ? `Noch nicht. ${urteil.hinweis}.`
                : "Noch nicht. Schau die Zahlen noch einmal an.";
      setMeldung(satz);
      ansagen?.(satz);
      if (urteil.stand !== "veraendert") melde(urteil.stand === "schreibfehler");
      return;
    }
    melde(true);
    spieleRichtigTon();
    setEingabe("");
    setHeute((h) => h + 1);
    tafelSpeicher.trageEin(dieWoche, nr).then((t) => {
      setTafel(t);
      const neuesWort = sichtbaresWort(staffel, t.gelaufen);
      const satz = neuesWort === wort
        ? `Etappe ${nr} ist gelaufen.`
        : `Etappe ${nr} ist gelaufen. Ein Buchstabe ist da: ${neuesWort.split("").join(" ")}`;
      setMeldung(satz);
      ansagen?.(satz);
      feld.current?.focus();
    });
  }, [etappe, nr, eingabe, ansagen, onAntwort, art, zeile, tafelSpeicher, dieWoche, staffel, wort]);

  const rate = () => {
    if (!wortStimmt(staffel, wortEingabe)) {
      const satz = "Das war es nicht. Du darfst wieder raten, sooft du willst.";
      setMeldung(satz);
      ansagen?.(satz);
      return;
    }
    tafelSpeicher.trageWortEin(dieWoche).then((t) => {
      setTafel(t);
      const satz = `Richtig! Das Wort war ${staffel.wort}. Die Klasse hat die Staffel geschafft.`;
      setMeldung(satz);
      ansagen?.(satz);
    });
  };

  return (
    <section className="space-y-4" aria-labelledby="plus-staffel">
      <h2 id="plus-staffel" ref={ueberschrift} tabIndex={-1} className="text-xl font-semibold text-ink">
        Die Staffel der Klasse
      </h2>

      {tafelSpeicher.klasse === null && (
        <p className="text-sm text-ink-muted">
          Du bist nicht angemeldet. Die Staffel läuft trotzdem - dann bist du die Klasse.
        </p>
      )}

      <p className="text-ink">
        {geladen
          ? `${tafel.gelaufen.length} von ${staffel.anzahl} Etappen sind gelaufen.`
          : "Die Tafel wird geholt."}
      </p>
      <p className="text-ink">
        {fertig ? "Das Wort war: " : "Das versteckte Wort: "}
        <span className="font-mono">{gezeigtesWort.split("").join(" ")}</span>
      </p>

      {fertig && (
        <p className="text-ink">
          Geschafft. Das Wort war <strong>{staffel.wort}</strong>. Nächste Woche gibt es ein neues.
        </p>
      )}

      {!fertig && genugFuerHeute && (
        <p className="text-ink">
          Du bist heute {ETAPPEN_JE_KIND_AM_TAG} Etappen gelaufen. Jetzt sind die anderen dran -
          morgen wieder du.
        </p>
      )}

      {!fertig && !genugFuerHeute && etappe && (
        <div className="space-y-3">
          <p className="text-sm text-ink-muted">Deine Etappe: Nummer {etappe.nr}</p>
          {/* Die Rechenzeile steht im Feld; hier nur, was nicht hineingehört. */}
          {(oben) && (
            <p id="plus-staffel-aufgabe" className="whitespace-pre-line font-mono text-lg text-ink">
              {oben}
            </p>
          )}
          <PlusEingabe
            wert={eingabe}
            onWert={setEingabe}
            art={art}
            onArt={onArt}
            onPruefen={pruefe}
            ansagen={ansagen}
            feldRef={feld}
            beschriebenVon={!zeile || zeile.davor.length ? "plus-staffel-aufgabe" : undefined}
            vorlage={zeile?.vorlage}
            marke={zeile?.marke}
            neuBei={etappe.aufgabe}
            mehrzeilig={mehrzeilig}
            erwartet={etappe.aufgabe.loesung.length}
          />
          <button type="button" className="rounded border border-hairline px-3 py-2 text-ink" onClick={pruefe}>
            Etappe laufen
          </button>
          <button
            type="button"
            className="ml-2 rounded border border-hairline px-3 py-2 text-ink"
            onClick={() => ansagen?.(sprich(etappe.aufgabe.angabe))}
          >
            Vorlesen
          </button>
        </div>
      )}

      {!fertig && (
        <div className="space-y-2 border-t border-hairline pt-3">
          <label className="block text-sm text-ink" htmlFor="plus-staffel-wort">
            Du kennst das Wort schon? Schreib es hin.
          </label>
          <input
            id="plus-staffel-wort"
            data-kuerzel="an"
            type="text"
            className="rounded border border-hairline px-3 py-2 text-ink"
            value={wortEingabe}
            onChange={(e) => setWortEingabe(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") rate(); }}
          />
          <button type="button" className="ml-2 rounded border border-hairline px-3 py-2 text-ink" onClick={rate}>
            Wort raten
          </button>
        </div>
      )}

      {/* ★ GENAU EINE Live-Region, wie in jedem Spiel: Eine Blitzmeldung
          verdrängt auf der Braillezeile etwa vier Sekunden lang, was unter den
          Fingern liegt. Die Seite blendet ihre eigene aus, solange ein Spiel
          läuft. */}
      <p role="status" className="min-h-6 text-ink">{meldung}</p>

      {/* ★ „Anderes Spiel" heißt der Weg zurück in allen acht Spielen. Ein
          eigenes Wort an einer Stelle ist für ein Kind, das die Tasten
          auswendig lernt, ein eigener Weg. */}
      <button type="button" className="rounded border border-hairline px-3 py-2 text-ink" onClick={onZurueck}>
        Anderes Spiel
      </button>
    </section>
  );
}
