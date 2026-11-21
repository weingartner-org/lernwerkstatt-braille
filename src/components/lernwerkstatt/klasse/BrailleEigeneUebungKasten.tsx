/**
 * ════════════════════════════════════════════════════════════════════════════
 * „EIGENE ÜBUNG" AUS DER SICHT DER LEHRKRAFT (Braille) - ein Kasten im Reiter
 * „Punktgenau" von „Meine Klassen" (22.09.2026).
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Auftrag: Datei hochladen (.txt/.docx) wie im Vorbild `EigeneUebungKasten.tsx`
 * (Tastenflow), dazu Arbeitsweise und Schriftbereich. ZUSÄTZLICH zum Vorbild:
 * `lib/braille/eigeneUebung.ts` prüft, ob die Zeichen des Textes im gewählten
 * Schriftbereich überhaupt vorkommen - ein Text mit Zeichen, die ein Kind noch
 * nie gesehen hat, ist keine Übung, sondern eine Sackgasse. Diese Prüfung steht
 * VOR dem Start; sie verbietet ihn nicht, sondern sagt klar, was auffällt.
 *
 * ── Was dieser Kasten ist und was er NICHT ist ─────────────────────────────
 * Die REIHE, das Anhängen, das „Beenden" und die Zeichen-Prüfung sind
 * vollständig in `lib/braille/eigeneUebung.ts` beschrieben - hier wird nichts
 * davon nachgerechnet ([[feedback_zwei_stellen_die_voneinander_nichts_wissen]]).
 * Das Glätten typografischer Zeichen (Gedankenstrich, „schöne" Anführungs-
 * zeichen) wird bewusst von `lib/typing/eigenerText.ts` WIEDERVERWENDET
 * (`glaetteZeichen` - eine reine Funktion ohne Tastatur-Bezug); die
 * TASTATUR-spezifische Prüfung „untippbare Zeichen" des Vorbilds bleibt dort,
 * sie passt nicht auf Braille (dort entscheidet die Zelle, nicht die Taste).
 *
 * ── Anders als beim Vorbild: kein „Meine Texte", keine „Vorlagen" ─────────
 * Das Braille-Backend kennt keine eigene Text-Ablage der Lehrkraft und keine
 * Vorlagen-Sammlung (`backend.ts` hat dafür keine Funktion) - nur den Weg
 * „Datei hochladen". Käme das dazu, bräuchte es zuerst eine Backend-Funktion
 * wie `speichereMeinenText`/`listeMeineTexte` (siehe Bericht).
 *
 * ── Die Zeichen-Prüfung: JE KIND, nicht nur je Bereich ─────────────────────
 * `textPasstZuSchriftbereich()` braucht den FORTSCHRITT eines Kindes - welche
 * Etappen es im gewählten Bereich schon erreicht hat. Diese Klasse bekommt
 * einen ganzen Text zugewiesen, unabhängig vom Stand der einzelnen Kinder -
 * darum wird die Prüfung für JEDES Kind einzeln gerechnet und dann
 * zusammengefasst: bei wem kommen Zeichen vor, die es dort noch nicht gesehen
 * hat, und welche.
 *
 * ── Pflichten dieses Repositories ────────────────────────────────────────
 *  • Nichts wird je `disabled` (R5) - `aria-disabled` plus Sperre im Handler.
 *  • Rückfrage vor „Beenden" über `Modal`, nie `window.confirm`.
 *  • Nie etwas gegen ein Kind: die Zeichen-Prüfung nennt Namen und Zeichen als
 *    Tatsache, ohne Wertung ([[feedback_nie_gegen_das_kind]]).
 */
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { brailleBackend } from "@/lib/braille/backend";
import type { Area, AreaKey } from "@/lib/braille/areas";
import type { BrailleProgress } from "@/lib/braille/progress";
import {
  EIGENE_UEBUNGEN_HOECHSTENS,
  fertigeKinder,
  textPasstZuSchriftbereich,
  vonAllenFertig,
  type EigeneUebungEintrag,
  type EigeneUebungFortschritt,
} from "@/lib/braille/eigeneUebung";
import type { Arbeitsweise } from "@/lib/braille/wertung";
// Reine Textbereinigung und das Lesen der Datei, geteilt mit „Eigene Übung"/der
// Tippchallenge bei Tastenflow - keine zweite Stelle, die eine eigene
// Glätt-Tabelle oder eine eigene Kodierungs-Regel pflegt.
import { dekodiereTextdatei, glaetteZeichen } from "@/lib/typing/eigenerText";
import { fileExtension, extractDocxText } from "@/lib/filePreview";
import { dateiBytes } from "@/lib/lernwerkstatt/kinderImport";
import { Tipp } from "@/components/Tipp";
import { Aufklappen } from "@/components/Aufklappen";
import { Modal } from "@/components/Modal";

const EIGENE_UEBUNG_WORT = "Eigene Übung";

/** Grosszügig, aber nicht grenzenlos - eine Übung ist Fliesstext, kein Archiv. Muster `MAX_DATEIGROESSE`. */
const MAX_DATEIGROESSE = 2 * 1024 * 1024;

function arbeitsweiseLabel(a: Arbeitsweise): string {
  return a === "lesen" ? "Lesen" : "Schreiben";
}

/** Zeilenenden vereinheitlichen (über `glaetteZeichen`) und Rand-Leerzeilen abschneiden. */
function zeilenAusText(rohtext: string): string[] {
  const { text } = glaetteZeichen(rohtext);
  const zeilen = text.split("\n").map((z) => z.trimEnd());
  while (zeilen.length > 0 && zeilen[0] === "") zeilen.shift();
  while (zeilen.length > 0 && zeilen[zeilen.length - 1] === "") zeilen.pop();
  return zeilen;
}

/**
 * ⚠️ NICHT `file.text()`/`file.arrayBuffer()` direkt - `dateiBytes` weicht auf
 * `FileReader` aus, wo `Blob.arrayBuffer` fehlt (Muster `useEigenerTextUpload.ts`).
 */
async function leseDatei(file: File): Promise<string> {
  const bytes = new Uint8Array(await dateiBytes(file));
  const ext = fileExtension(file.name);
  if (ext === "docx") return extractDocxText(bytes);
  // ★ Nicht blind UTF-8: Eine Windows-Datei („ANSI") verlor so alle Umlaute
  // (Tastenflow, 23.09.2026 - hier dieselbe Stelle) - siehe `dekodiereTextdatei`.
  return dekodiereTextdatei(bytes);
}

interface Vorschau {
  zeilen: string[];
  text: string;
  zeichenGesamt: number;
}

/** Wer aus dieser Klasse kennt die Zeichen des Textes im gewählten Bereich noch nicht? */
interface SchriftbereichSammelbefund {
  betroffeneKinder: string[];
  unbekannteZeichen: string[];
}

function schriftbereichSammelbefund(
  text: string,
  area: Area,
  kinder: readonly { name: string; progress: BrailleProgress }[],
): SchriftbereichSammelbefund {
  const betroffeneKinder: string[] = [];
  const zeichen = new Set<string>();
  for (const k of kinder) {
    const befund = textPasstZuSchriftbereich(text, area, k.progress);
    if (!befund.passt) {
      betroffeneKinder.push(k.name);
      for (const z of befund.unbekannt) zeichen.add(z);
    }
  }
  return { betroffeneKinder, unbekannteZeichen: [...zeichen] };
}

export function BrailleEigeneUebungKasten({
  classCode,
  teacherId,
  areas,
  kinderProgress,
  eingebettet = false,
}: {
  classCode: string;
  teacherId: string;
  /** Die Bereiche dieser Klasse, schon mit ihren Zuschaltungen gebaut (Reiter). */
  areas: readonly Area[];
  /**
   * Der Fortschritt jedes Kindes dieser Klasse - für die Zeichen-Prüfung.
   * `null`, solange der Reiter ihn noch lädt (dieselben Daten, die auch die
   * Tabelle „Stand in Punktgenau" benutzt - kein zweiter Abruf).
   */
  kinderProgress: readonly { id: string; name: string; progress: BrailleProgress }[] | null;
  /** ★ 20.10.2026: in der Aufgaben-Leiste - der Schalter dort ersetzt den eigenen Kopf, der Teil steht offen. */
  eingebettet?: boolean;
}) {
  const backend = brailleBackend();

  const [offenGewaehlt, setOffen] = useState(false);
  const offen = eingebettet || offenGewaehlt;
  const [speichert, setSpeichert] = useState(false);
  const [meldung, setMeldung] = useState("");

  const [arbeitsweise, setArbeitsweise] = useState<Arbeitsweise>("schreiben");
  const [bereich, setBereich] = useState<AreaKey>(() => areas[0]?.key ?? "basis");
  const [dateiname, setDateiname] = useState("");
  const [vorschau, setVorschau] = useState<Vorschau | null>(null);
  const [ladeFehler, setLadeFehler] = useState("");

  const [reihe, setReihe] = useState<EigeneUebungEintrag[]>([]);
  const [fortschritte, setFortschritte] = useState<EigeneUebungFortschritt[]>([]);
  const [beendenFrage, setBeendenFrage] = useState<EigeneUebungEintrag | null>(null);

  const schalterRef = useRef<HTMLButtonElement>(null);
  const reiheUeberschriftRef = useRef<HTMLHeadingElement>(null);
  const meldungRef = useRef<HTMLParagraphElement>(null);

  const teilId = useId();
  const arbeitsweiseId = useId();
  const bereichId = useId();
  const dateiId = useId();

  // Die Formularwerte und die Reihe gehören der Klasse.
  useEffect(() => {
    setArbeitsweise("schreiben");
    setBereich(areas[0]?.key ?? "basis");
    setDateiname("");
    setVorschau(null);
    setLadeFehler("");
    setMeldung("");
    setOffen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classCode]);

  useEffect(() => {
    let lebt = true;
    void backend.listeEigeneUebungen(classCode).then((liste) => {
      if (lebt) setReihe(liste);
    });
    void backend.leseEigeneUebungFortschritteDerKlasse(classCode).then((liste) => {
      if (lebt) setFortschritte(liste);
    });
    return () => {
      lebt = false;
    };
  }, [backend, classCode]);

  async function waehleDatei(file: File | null) {
    setVorschau(null);
    setLadeFehler("");
    if (!file) return;
    const ext = fileExtension(file.name);
    if (ext !== "txt" && ext !== "docx") {
      setLadeFehler("Nur .txt- und .docx-Dateien werden angenommen.");
      return;
    }
    if (file.size > MAX_DATEIGROESSE) {
      setLadeFehler("Die Datei ist grösser als 2 MB - das ist für eine Übung ungewöhnlich viel.");
      return;
    }
    setDateiname(file.name);
    try {
      const rohtext = await leseDatei(file);
      const zeilen = zeilenAusText(rohtext);
      const text = zeilen.join("\n");
      if (zeilen.length === 0 || text.trim() === "") {
        setLadeFehler("In dieser Datei steht kein Text.");
        return;
      }
      setVorschau({ zeilen, text, zeichenGesamt: text.length });
    } catch {
      setLadeFehler("Die Datei konnte nicht gelesen werden.");
    }
  }

  const area = useMemo(() => areas.find((a) => a.key === bereich) ?? areas[0], [areas, bereich]);

  const sammelbefund = useMemo(() => {
    if (!vorschau || !area || !kinderProgress) return null;
    return schriftbereichSammelbefund(vorschau.text, area, kinderProgress);
  }, [vorschau, area, kinderProgress]);

  async function starten() {
    if (speichert || !vorschau) return;
    setSpeichert(true);
    const fortschritteFrisch = await backend
      .leseEigeneUebungFortschritteDerKlasse(classCode)
      .catch(() => fortschritte);
    const neu = await backend.starteEigeneUebung(
      classCode,
      teacherId,
      { dateiname, arbeitsweise, bereich, zeilen: vorschau.zeilen },
      vonAllenFertig(reihe, fortschritteFrisch),
    );
    setSpeichert(false);
    if (!neu) {
      setMeldung("Nicht gespeichert. Bitte noch einmal versuchen.");
      return;
    }
    const liefSchon = reihe.length > 0;
    setReihe(neu);
    setFortschritte(fortschritteFrisch);
    setMeldung(
      liefSchon
        ? `Gestartet - die Kinder bekommen sie nach den laufenden Übungen.`
        : `Gestartet - die Kinder bekommen sie jetzt.`,
    );
    setDateiname("");
    setVorschau(null);
    setLadeFehler("");
  }

  async function beendenBestaetigt() {
    const eintrag = beendenFrage;
    if (!eintrag || speichert) return;
    setBeendenFrage(null);
    setSpeichert(true);
    const neu = await backend.beendeEigeneUebung(classCode, eintrag.textId);
    setSpeichert(false);
    if (!neu) {
      setMeldung("Nicht beendet. Bitte noch einmal versuchen.");
      return;
    }
    setReihe(neu);
    setMeldung(
      neu.length === 0
        ? "Beendet - die Klasse übt wieder normal."
        : `„${eintrag.dateiname}" beendet - die übrigen Übungen laufen weiter.`,
    );
    window.setTimeout(() => (reiheUeberschriftRef.current ?? meldungRef.current)?.focus(), 0);
  }

  return (
    <section
      className="rounded-xl border border-hairline bg-surface-sunken px-3 py-1"
      aria-busy={speichert}
    >
      <div className="flex flex-wrap items-center gap-2">
        {!eingebettet && (
        <h3 className="m-0 mr-2">
          <button
            ref={schalterRef}
            type="button"
            className="flex h-9 items-center gap-2 text-sm font-semibold text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
            aria-expanded={offen}
            aria-controls={teilId}
            onClick={() => setOffen((o) => !o)}
          >
            <span aria-hidden="true" className={"text-ink-muted transition" + (offen ? " rotate-90" : "")}>
              ▸
            </span>
            {EIGENE_UEBUNG_WORT}
          </button>
        </h3>
        )}
        <span className="text-sm text-ink-muted">
          {reihe.length === 0
            ? "nicht zugewiesen"
            : reihe.length === 1
              ? `zugewiesen: ${reihe[0].dateiname}`
              : `${reihe.length} zugewiesen, der Reihe nach`}
        </span>
      </div>

      <Aufklappen offen={offen}>
        <div id={teilId} className="mb-2 mt-1 space-y-3 border-t border-hairline pt-3 text-sm">
          <div className="flex flex-wrap items-end gap-2">
            <div className="flex min-w-40 items-center gap-2">
              <label className="field-label mb-0" htmlFor={arbeitsweiseId}>
                Arbeitsweise
              </label>
              <Tipp text="Schreiben: Das Kind tastet die Punkte auf der Tastatur. Lesen: Das Kind liest ein Punktmuster und tippt es in Druckschrift. Beides zählt zur Übezeit und wird gemessen.">
                {(hinweisId) => (
                  <select
                    id={arbeitsweiseId}
                    aria-label={`Arbeitsweise - ${EIGENE_UEBUNG_WORT}: schreiben oder lesen`}
                    aria-describedby={hinweisId}
                    className="field-input feld-schlank"
                    value={arbeitsweise}
                    onChange={(e) => setArbeitsweise(e.target.value as Arbeitsweise)}
                  >
                    <option value="schreiben">Schreiben</option>
                    <option value="lesen">Lesen</option>
                  </select>
                )}
              </Tipp>
            </div>
            <div className="flex min-w-48 flex-1 items-center gap-2">
              <label className="field-label mb-0" htmlFor={bereichId}>
                Bereich
              </label>
              <Tipp text={area ? `Schriftbereich: ${area.blurb}` : "In welchem Schriftbereich die Übung steht."}>
                {(hinweisId) => (
                  <select
                    id={bereichId}
                    aria-label={`Schriftbereich - ${EIGENE_UEBUNG_WORT}`}
                    aria-describedby={hinweisId}
                    className="field-input feld-schlank min-w-0"
                    value={bereich}
                    onChange={(e) => setBereich(e.target.value as AreaKey)}
                  >
                    {areas.map((a) => (
                      <option key={a.key} value={a.key}>
                        {a.label}
                      </option>
                    ))}
                  </select>
                )}
              </Tipp>
            </div>
          </div>

          <div>
            <label className="field-label" htmlFor={dateiId}>
              Eigene Datei hochladen (.txt oder .docx)
            </label>
            <Tipp text="Bis zu 2 MB, .txt oder .docx - aus einer .docx-Datei wird nur der reine Text übernommen, keine Bilder oder Formatierung. Neue Zeichen schaltet die Übung nicht frei - das bestimmt allein die Datei.">
              {(hinweisId) => (
                <input
                  id={dateiId}
                  type="file"
                  accept=".txt,.docx"
                  aria-describedby={hinweisId}
                  onChange={(e) => void waehleDatei(e.target.files?.[0] ?? null)}
                />
              )}
            </Tipp>
          </div>

          {ladeFehler && (
            <p role="alert" className="text-sm text-danger">
              {ladeFehler}
            </p>
          )}

          <Aufklappen offen={!!vorschau}>
            {vorschau && (
              <div className="space-y-2">
                <p className="m-0 text-ink">
                  <span className="font-semibold">„{dateiname}"</span> - {vorschau.zeilen.length}{" "}
                  {vorschau.zeilen.length === 1 ? "Zeile" : "Zeilen"}, {vorschau.zeichenGesamt} Zeichen.
                </p>

                {/*
                  ═══ Die Zeichen-Prüfung (Schritt 3 des Auftrags) ═══════════
                  Verbietet den Start nicht - sagt klar, was auffällt.
                */}
                {!kinderProgress ? (
                  <p className="m-0 text-ink-muted">Es wird geprüft, ob die Zeichen zum Schriftbereich passen …</p>
                ) : sammelbefund && sammelbefund.betroffeneKinder.length > 0 ? (
                  <p className="m-0 rounded-lg bg-warning-soft p-2 text-ink">
                    In {area?.label ?? bereich} kommen Zeichen vor, die {sammelbefund.betroffeneKinder.length}{" "}
                    von {kinderProgress.length}{" "}
                    {kinderProgress.length === 1 ? "Kind" : "Kindern"} dort noch nicht gesehen{" "}
                    {kinderProgress.length === 1 ? "hat" : "haben"}: {sammelbefund.unbekannteZeichen.join(", ")}.
                    Betroffen: {sammelbefund.betroffeneKinder.join(", ")}. Der Start ist trotzdem möglich.
                  </p>
                ) : (
                  <p className="m-0 text-ink-muted">
                    Alle Kinder dieser Klasse kennen die Zeichen dieses Textes in {area?.label ?? bereich} bereits.
                  </p>
                )}

                <Tipp
                  text={`Weist diesen Text der ganzen Klasse zu, unabhängig vom Stand der einzelnen Kinder. Laufen schon Übungen, kommt er danach dran. Zählt zur Übezeit, die Tasten werden gemessen. Höchstens ${EIGENE_UEBUNGEN_HOECHSTENS} Übungen gleichzeitig - die älteste, die schon alle fertig haben, fällt dann zuerst.`}
                  ausrichtung="links"
                >
                  {(hinweisId) => (
                    <button
                      type="button"
                      className="btn-primary"
                      aria-disabled={speichert}
                      aria-describedby={hinweisId}
                      onClick={() => void starten()}
                    >
                      {EIGENE_UEBUNG_WORT} starten
                    </button>
                  )}
                </Tipp>
              </div>
            )}
          </Aufklappen>

          {meldung && (
            <p ref={meldungRef} tabIndex={-1} role="status" className="m-0 text-ink outline-none">
              {meldung}
            </p>
          )}

          {reihe.length > 0 && (
            <div className="space-y-1">
              <h4
                ref={reiheUeberschriftRef}
                tabIndex={-1}
                className="m-0 text-sm font-semibold text-ink outline-none"
              >
                {reihe.length === 1 ? "Laufende Übung" : "Laufende Übungen, der Reihe nach"}
              </h4>
              <ol className="m-0 list-decimal space-y-1 pl-5">
                {reihe.map((e) => {
                  const zahl = fortschritte.length ? fertigeKinder(e.textId, fortschritte) : null;
                  const bereichLabel = areas.find((a) => a.key === e.bereich)?.label ?? e.bereich;
                  return (
                    <li key={e.textId} className="text-sm text-ink">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span className="flex-auto">
                          <strong>„{e.dateiname}"</strong>
                          <span className="block text-ink-muted">
                            {arbeitsweiseLabel(e.arbeitsweise)} · {bereichLabel}
                            {zahl && zahl.gesamt > 0 ? ` · ${zahl.fertig} von ${zahl.gesamt} Kindern fertig` : ""}
                          </span>
                        </span>
                        <Tipp
                          text="Nimmt diese Übung aus der Reihe. Wer gerade darin arbeitet, darf sie fertig machen; alle anderen bekommen sie nicht mehr."
                          ausrichtung="rechts"
                        >
                          {(hinweisId) => (
                            <button
                              type="button"
                              className="btn-secondary min-h-9"
                              aria-disabled={speichert}
                              aria-describedby={hinweisId}
                              onClick={() => {
                                if (speichert) return;
                                setBeendenFrage(e);
                              }}
                            >
                              Beenden
                              <span className="sr-only"> „{e.dateiname}"</span>
                            </button>
                          )}
                        </Tipp>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          )}

          {beendenFrage && (
            <Modal title="Übung beenden" onClose={() => setBeendenFrage(null)}>
              <div className="space-y-3 text-sm text-ink">
                <p className="m-0">
                  „{beendenFrage.dateiname}" beenden? Wer gerade darin arbeitet, darf sie fertig machen;
                  alle anderen bekommen sie nicht mehr.
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="btn-secondary text-danger"
                    onClick={() => void beendenBestaetigt()}
                  >
                    Beenden
                  </button>
                  <button type="button" className="btn-secondary" onClick={() => setBeendenFrage(null)}>
                    Abbrechen
                  </button>
                </div>
              </div>
            </Modal>
          )}
        </div>
      </Aufklappen>
    </section>
  );
}
