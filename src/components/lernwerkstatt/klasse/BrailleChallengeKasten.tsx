/**
 * ════════════════════════════════════════════════════════════════════════════
 * DIE BRAILLE-CHALLENGE AUS DER SICHT DER LEHRKRAFT - ein Kasten im Reiter
 * „Punktgenau" von „Meine Klassen" (22.09.2026).
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Auftrag: Arbeitsweise (schreiben oder lesen) · Schriftbereich · Minuten ·
 * „Jetzt starten". Danach: läuft/Restzeit/Bereit-Stand/„Absagen", am Ende die
 * Ergebnistabelle. Gebaut nach dem Vorbild `SchreibprobeKasten.tsx`
 * (Tastenflow) - zugeklappt voreingestellt, aber auch zugeklappt bleiben die
 * drei wichtigen Dinge sichtbar (Arbeitsweise, Bereich, Minuten, Starten).
 *
 * ── Was dieser Kasten ist und was er NICHT ist ─────────────────────────────
 * Er ist die BEDIENUNG einer Sache, die vollständig in `lib/braille/challenge.ts`
 * beschrieben ist: Zeiten, Phasen, die Wertung kommt aus `lib/braille/wertung.ts`.
 * Hier wird nichts davon nachgerechnet - jede Zahl kommt aus einer Funktion
 * dort ([[feedback_zwei_stellen_die_voneinander_nichts_wissen]]).
 *
 * ── Die Arbeitsweise ist der Unterschied zu Tastenflow ─────────────────────
 * Anders als bei der Tippchallenge wählt die Lehrkraft hier zusätzlich, ob die
 * Klasse schreibt (Punkte tasten) oder liest (ein Punktmuster erkennen und in
 * Druckschrift eintippen) - klar beschriftet, ohne Braille-Fachjargon.
 *
 * ── Kein „Bereit"-Stand (anders als beim Vorbild) ──────────────────────────
 * Das Vorbild zeigt „Bereit: 12 von 14" aus einem Signal, das ein Kind sendet,
 * sobald sein Gerät den Plan kennt (`probeBereit`, Realtime-Beobachtung). Für
 * die Braille-Challenge gibt es dieses Signal (noch) nicht - weder ein Feld am
 * Konto noch eine Beobachtungs-Funktion im Backend. Diese Zeile zeigt darum
 * dieselbe Zahl, die das Vorbild ZEIGT, WENN „Bereit" fehlt: „Abgegeben: X von
 * Y" (siehe `zeilenLauf`-Zweig in `SchreibprobeKasten.tsx`).
 *
 * ── Der Verlauf über mehrere Runden (Nachbesserung 22.09.2026) ─────────────
 * Bis hierher gab es nur `listeChallengeErgebnisse(classCode, probeId)` -
 * Ergebnisse EINER Runde; dieser Kasten merkte sich darum selbst die zuletzt
 * bekannte Runde (`letzterPlan`), um nach „Absagen" oder Zeitablauf noch
 * etwas zu zeigen - weder die Lehrkraft noch ein Kind konnten sehen, wie sich
 * etwas über MEHRERE Runden entwickelt hat.
 *
 * Seit `backend.listeChallengeVerlaufKlasse(classCode)` ALLE Abgaben der
 * Klasse liefert (nicht nur eine Runde) und `lib/braille/challengeVerlauf.ts`
 * sie zu Runden bündelt (`challengeRunden`), ist der Eigenbau überflüssig und
 * entfernt: Die laufende Runde bleibt oben sichtbar, solange sie läuft;
 * darunter steht der ECHTE Verlauf - jede vergangene Runde als eigene
 * aufklappbare Zeile (Muster `SchreibprobenListe.tsx`), mit dem
 * Leistungswert-Schnitt und seiner Veränderung gegenüber der VORIGEN Runde
 * DERSELBEN Arbeitsweise (schreiben nie gegen lesen verglichen -
 * `wertung.ts` warnt ausdrücklich davor). Der Pfeil dafür ist
 * `Veraenderungspfeil` (Tastenflow) - kein eigener Bau, keine Farbe nach
 * Richtung ([[feedback_nie_gegen_das_kind]]).
 *
 * ── Pflichten dieses Repositories ────────────────────────────────────────
 *  • Nichts wird je `disabled`(R5) - `aria-disabled` plus Sperre im Handler.
 *  • Jeder Schalter hat ein Fokus-Ziel: nach „Jetzt starten" steht der Fokus
 *    auf „läuft", nach „Absagen" auf dem Kopf-Schalter.
 *  • Keine tickende Meldung: Die laufende Zahl ist `aria-hidden`, daneben steht
 *    ein Satz ohne Ticken ([[reference_live_region_ist_braille_blitzmeldung]]).
 *  • Nie etwas gegen ein Kind: „nicht angetreten" ist eine Tatsache, mehr steht
 *    da nicht ([[feedback_nie_gegen_das_kind]]).
 */
import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { BrailleAccount, BrailleClassSettings } from "@/lib/braille";
import { brailleBackend } from "@/lib/braille/backend";
import type { Area, AreaKey } from "@/lib/braille/areas";
import {
  BRAILLE_CHALLENGE_WORT,
  CHALLENGE_DAUER_MIN_GROESST,
  CHALLENGE_DAUER_MIN_KLEINST,
  CHALLENGE_DAUER_VORGABE,
  challengeDauerMs,
  challengeEinstiegBisMs,
  challengePlanAusRoh,
  challengeWertung,
  neueChallengeId,
  type ChallengeErgebnis,
  type ChallengePlan,
} from "@/lib/braille/challenge";
// ★ Zubau 22.09.2026: der Verlauf über mehrere Runden - reine Funktionen,
// siehe Dateikopf und `challengeVerlauf.ts` selbst.
import {
  challengeRunden,
  rundenSchnitt,
  rundenVeraenderung,
  type ChallengeRunde,
} from "@/lib/braille/challengeVerlauf";
import {
  arbeitsweiseLabel,
  eineStelle,
  einheitLabel,
  rangprozent,
  tempo,
  treffsicherheit,
  type Arbeitsweise,
  type GruppenWert,
} from "@/lib/braille/wertung";
// Reine Zeitformatierung, geteilt mit `klassenmatch.ts` - keine zweite Stelle,
// die eine eigene Minuten:Sekunden-Rechnung schreibt.
import { mmss } from "@/lib/typing/schreibprobe";
import type { Veraenderung } from "@/lib/typing/veraenderung";
// ★★★ Kein eigener Pfeil: derselbe Baustein wie beim Tippen - das Pfeilzeichen
// ist `aria-hidden`, die Aussage steht als Satz, keine Farbe nach Richtung
// ([[feedback_nie_gegen_das_kind]]).
import { Veraenderungspfeil } from "@/components/typing/Veraenderungspfeil";
import { Tipp } from "@/components/Tipp";
import { Aufklappen } from "@/components/Aufklappen";

/** So oft wird nachgefragt, SOLANGE eine Braille-Challenge läuft (ms). Muster `NACHFRAGE_MS`. */
const NACHFRAGE_MS = 45_000;

function pct(anteil: number): string {
  return `${Math.round(anteil * 100)} %`;
}

function arbeitsweiseVerb(a: Arbeitsweise): string {
  return a === "lesen" ? "liest" : "schreibt";
}

/**
 * Wann ist die Braille-Challenge für die GANZE Klasse sicher vorbei?
 * Spätester Einstieg + volle Arbeitszeit - Muster `klasseVorbeiMs()` aus
 * `typing/schreibprobe.ts`, hier ohne Zeitzuschlag (den kennt Braille nicht).
 */
function klasseVorbeiMs(plan: ChallengePlan): number {
  return challengeEinstiegBisMs(plan) + challengeDauerMs(plan);
}

function zeitstand(plan: ChallengePlan, jetztMs: number): { rest: number; satz: string; kurz: string } {
  const einstiegBis = challengeEinstiegBisMs(plan);
  const einstiegRest = Math.max(0, einstiegBis - jetztMs);
  if (einstiegRest > 0) {
    const uhr = new Date(einstiegBis).toLocaleTimeString("de-AT", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return {
      rest: einstiegRest,
      satz: `bis das Einstiegsfenster um ${uhr} Uhr schliesst`,
      kurz: `Beginnen bis ${uhr} Uhr`,
    };
  }
  const verb = arbeitsweiseVerb(plan.arbeitsweise);
  return {
    rest: Math.max(0, klasseVorbeiMs(plan) - jetztMs),
    satz: `bis die Arbeitszeit auch des letzten Kindes abgelaufen ist - das Einstiegsfenster ist zu, wer begonnen hat, ${verb} noch`,
    kurz: `Einstieg zu - wer begonnen hat, ${verb} noch`,
  };
}

interface ChallengeZeile {
  id: string;
  name: string;
  ergebnis: ChallengeErgebnis | null;
}

/** Bestes Ergebnis zuerst, „nicht angetreten" zuletzt, sonst nach Namen. */
function rangliste(zeilen: readonly ChallengeZeile[], arbeitsweise: Arbeitsweise) {
  const gruppe: GruppenWert[] = zeilen
    .filter((z): z is ChallengeZeile & { ergebnis: ChallengeErgebnis } => z.ergebnis !== null)
    .map((z) => ({ arbeitsweise, wert: challengeWertung(z.ergebnis).wert }));
  return zeilen
    .map((z) => ({
      zeile: z,
      wert: z.ergebnis ? challengeWertung(z.ergebnis).wert : null,
      rang: z.ergebnis ? rangprozent(challengeWertung(z.ergebnis).wert, gruppe, arbeitsweise) : null,
    }))
    .sort((a, b) => {
      if (a.wert !== null && b.wert !== null) {
        if (b.wert !== a.wert) return b.wert - a.wert;
        return a.zeile.name.localeCompare(b.zeile.name, "de");
      }
      if (a.wert !== null) return -1;
      if (b.wert !== null) return 1;
      return a.zeile.name.localeCompare(b.zeile.name, "de");
    });
}

function ErgebnisTabelle({
  arbeitsweise,
  zeilen,
}: {
  arbeitsweise: Arbeitsweise;
  zeilen: readonly ChallengeZeile[];
}) {
  const mit = zeilen.filter((z) => z.ergebnis !== null);
  if (mit.length === 0) {
    return <p className="m-0 text-sm text-ink-muted">Es liegt noch kein Ergebnis vor.</p>;
  }
  const geordnet = rangliste(zeilen, arbeitsweise);
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-separate border-spacing-0 text-sm">
        <caption className="sr-only">Ergebnisse der {BRAILLE_CHALLENGE_WORT}</caption>
        <thead>
          <tr className="bg-surface-raised text-center text-ink-muted">
            <th scope="col" className="px-2 py-2">Rang</th>
            <th scope="col" className="px-2 py-2">Name</th>
            <th scope="col" className="px-2 py-2">Leistungswert</th>
            <th scope="col" className="px-2 py-2">Vorgelesen</th>
            <th scope="col" className="px-2 py-2">{einheitLabel(arbeitsweise)}/Min</th>
            <th scope="col" className="px-2 py-2">Treffsicherheit</th>
            <th scope="col" className="px-2 py-2">Richtig</th>
            <th scope="col" className="px-2 py-2">Falsch</th>
          </tr>
        </thead>
        <tbody className="text-center [&_td]:border-t [&_td]:border-hairline/60 [&_td]:px-2 [&_td]:py-2 [&_th]:border-t [&_th]:border-hairline/60 [&_th]:px-2 [&_th]:py-2">
          {geordnet.map(({ zeile, wert, rang }) => (
            <tr key={zeile.id}>
              <td className="font-semibold tabular-nums text-ink">
                {rang !== null ? (
                  `${eineStelle(rang)} %`
                ) : zeile.ergebnis ? (
                  <span className="font-normal text-ink-muted">kein Vergleichswert</span>
                ) : null}
              </td>
              <th scope="row" className="font-normal text-ink">
                {zeile.name}
              </th>
              {zeile.ergebnis ? (
                <>
                  <td className="font-semibold tabular-nums text-ink">{eineStelle(wert ?? 0)}</td>
                  <td className="text-ink">
                    {zeile.ergebnis.lauf.ansageMs > 0 ? `ja, ${mmss(zeile.ergebnis.lauf.ansageMs)} abgezogen` : "nein"}
                  </td>
                  <td className="text-ink tabular-nums">{Math.round(tempo(zeile.ergebnis.lauf))}</td>
                  <td className="text-ink">{pct(treffsicherheit(zeile.ergebnis.lauf))}</td>
                  <td className="text-ink tabular-nums">{zeile.ergebnis.lauf.richtig}</td>
                  <td className="text-ink tabular-nums">{zeile.ergebnis.lauf.falsch}</td>
                </>
              ) : (
                /* „nicht angetreten" ist eine Tatsache und bleibt eine -
                   [[feedback_nie_gegen_das_kind]]. */
                <td colSpan={6} className="text-ink-muted">
                  nicht angetreten
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * ★ Zubau 22.09.2026: EINE vergangene Runde, aufklappbar - Muster
 * `ProbenZeile` (`SchreibprobenListe.tsx`, Tastenflow). Zugeklappt steht
 * schon Datum, Arbeitsweise, Bereich, Teilnehmerzahl UND der
 * Leistungswert-Schnitt mit seiner Veränderung da; aufgeklappt kommt die
 * einzelne Zeile je Kind (dieselbe `ErgebnisTabelle` wie oben bei der
 * laufenden Runde).
 *
 * ⚠️ `zeilen` entsteht hier NUR aus den tatsächlichen Abgaben dieser Runde -
 * anders als bei der laufenden Runde wird NICHT gegen die heutige
 * Schülerliste abgeglichen. Der heutige Klassenstand kann sich seit einer
 * vergangenen Runde geändert haben (Kinder kommen, gehen); ein Kind, das
 * damals nicht in der Klasse war, als „nicht angetreten" zu zeigen, wäre
 * eine falsche Tatsachenbehauptung über dieses Kind
 * ([[feedback_nie_gegen_das_kind]]).
 */
function RundenZeile({
  runde,
  veraenderung,
  bereichLabel,
  pupils,
  offenVorgabe,
}: {
  runde: ChallengeRunde;
  /** Die Veränderung des Schnitts ggü. der vorigen Runde DERSELBEN Arbeitsweise. */
  veraenderung: Veraenderung | null;
  bereichLabel: string;
  pupils: readonly BrailleAccount[];
  offenVorgabe: boolean;
}) {
  const schnitt = rundenSchnitt(runde);
  const datum = new Date(runde.begonnenMs).toLocaleDateString("de-AT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const zeilen: ChallengeZeile[] = runde.ergebnisse.map((e) => ({
    id: e.pupilUid,
    name: pupils.find((p) => p.id === e.pupilUid)?.name ?? "Nicht mehr in der Klasse",
    ergebnis: e,
  }));
  return (
    <li className="rounded-xl border border-hairline bg-surface-sunken px-3 py-2">
      {/* Ein echtes `<details>`, kein eigener Aufklapper - siehe `ProbenZeile`. */}
      <details open={offenVorgabe} className="group">
        <summary className="flex cursor-pointer list-none flex-wrap items-baseline gap-x-2 gap-y-1 text-sm font-semibold text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent">
          <span aria-hidden="true" className="text-ink-muted transition group-open:rotate-90">
            ▸
          </span>
          <span>{datum}</span>
          <span className="font-normal text-ink-soft">
            · {arbeitsweiseLabel(runde.arbeitsweise)} · {bereichLabel} · {runde.ergebnisse.length}{" "}
            {runde.ergebnisse.length === 1 ? "Kind" : "Kinder"} ·{" "}
          </span>
          <span className="font-normal text-ink-soft">
            {schnitt === null ? (
              "-"
            ) : (
              <Veraenderungspfeil
                wert={eineStelle(schnitt)}
                veraenderung={veraenderung}
                groesse="score"
                vergleichsName="der letzten Runde mit derselben Arbeitsweise"
                darstellung="wert"
                schlank
                grund={
                  veraenderung
                    ? undefined
                    : "Das ist die erste Runde mit dieser Arbeitsweise - es gibt noch nichts zu vergleichen."
                }
                grundKurz={veraenderung ? undefined : "erste Runde dieser Arbeitsweise"}
              />
            )}
          </span>
        </summary>
        <div className="mt-2">
          <ErgebnisTabelle arbeitsweise={runde.arbeitsweise} zeilen={zeilen} />
        </div>
      </details>
    </li>
  );
}

export function BrailleChallengeKasten({
  classCode,
  teacherId,
  pupils,
  areas,
  settings,
  onSettingsChange,
  eingebettet = false,
}: {
  classCode: string;
  teacherId: string;
  pupils: readonly BrailleAccount[];
  /** Die Bereiche dieser Klasse, schon mit ihren Zuschaltungen gebaut (Reiter). */
  areas: readonly Area[];
  settings: BrailleClassSettings;
  /** Nach jedem Speichern: die aktualisierten Einstellungen melden. */
  onSettingsChange: (naechste: BrailleClassSettings) => void;
  /** ★ 20.10.2026: in der Aufgaben-Leiste - der Schalter dort ersetzt den eigenen Kopf, der Teil steht offen. */
  eingebettet?: boolean;
}) {
  const backend = brailleBackend();
  const plan = useMemo(
    () => challengePlanAusRoh(settings.punktgenau?.challenge),
    [settings.punktgenau?.challenge],
  );

  const [jetzt, setJetzt] = useState(() => Date.now());
  const [speichert, setSpeichert] = useState(false);
  const [meldung, setMeldung] = useState("");
  const [offenGewaehlt, setOffen] = useState(false);
  const offen = eingebettet || offenGewaehlt;

  const [arbeitsweise, setArbeitsweise] = useState<Arbeitsweise>("schreiben");
  const [bereich, setBereich] = useState<AreaKey>(() => areas[0]?.key ?? "basis");
  const [dauer, setDauer] = useState(String(CHALLENGE_DAUER_VORGABE));

  const schalterRef = useRef<HTMLButtonElement>(null);
  const laufRef = useRef<HTMLSpanElement>(null);
  const [fokusZiel, setFokusZiel] = useState<"schalter" | "lauf" | null>(null);

  const teilId = useId();
  const arbeitsweiseId = useId();
  const bereichId = useId();
  const dauerId = useId();

  const vorbei = plan !== null && jetzt >= klasseVorbeiMs(plan);
  const ansicht: "formular" | "lauf" = plan === null || vorbei ? "formular" : "lauf";

  // Die Formularwerte gehören der Klasse - beim Wechsel fängt die Lehrkraft neu an.
  useEffect(() => {
    setArbeitsweise("schreiben");
    setBereich(areas[0]?.key ?? "basis");
    setDauer(String(CHALLENGE_DAUER_VORGABE));
    setOffen(false);
    setMeldung("");
    setFokusZiel(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classCode]);

  // Die Uhr läuft nur, solange eine Braille-Challenge läuft.
  useEffect(() => {
    if (!plan || vorbei) return;
    const t = window.setInterval(() => setJetzt(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, [plan, vorbei]);

  /**
   * ★ Zubau 22.09.2026: DER VERLAUF - ALLE Abgaben der Klasse, über alle
   * Runden hinweg (ersetzt den alten `letzterPlan`-Eigenbau, siehe
   * Dateikopf). Wird nachgefragt, solange eine Runde läuft (Muster
   * `NACHFRAGE_MS`); sonst einmal beim Öffnen/Klassenwechsel.
   */
  const [verlauf, setVerlauf] = useState<ChallengeErgebnis[]>([]);
  const [geladen, setGeladen] = useState(false);
  useEffect(() => {
    let lebt = true;
    const hole = () => {
      void backend
        .listeChallengeVerlaufKlasse(classCode)
        .then((liste) => {
          if (!lebt) return;
          setVerlauf(liste);
          setGeladen(true);
        })
        .catch(() => {
          if (lebt) setGeladen(true);
        });
    };
    hole();
    if (ansicht !== "lauf") return () => {
      lebt = false;
    };
    const t = window.setInterval(hole, NACHFRAGE_MS);
    return () => {
      lebt = false;
      window.clearInterval(t);
    };
  }, [backend, classCode, ansicht]);

  /** Alle Runden dieser Klasse, jüngste zuerst - das Fundament von allem Weiteren hier. */
  const rundenAlle = useMemo(() => challengeRunden(verlauf), [verlauf]);

  /**
   * ★ Welche Runde oben als „Ergebnisse" gezeigt wird: die LAUFENDE Runde,
   * wenn es eine gibt - sonst die jüngste, zu der es überhaupt Abgaben gibt.
   * Muster des alten `letzterPlan` (siehe Dateikopf), nur jetzt aus dem
   * ECHTEN Verlauf gelesen statt aus lokalem React-Zustand - ein Neuladen der
   * Seite verliert die zuletzt bekannte Runde darum nicht mehr.
   */
  const aktuelleRundeId = plan?.id ?? rundenAlle[0]?.probeId ?? null;
  const aktuelleRundeArbeitsweise: Arbeitsweise =
    plan?.arbeitsweise ?? rundenAlle[0]?.arbeitsweise ?? "schreiben";
  const aktuelleRundeErgebnisse = useMemo(() => {
    if (plan) return verlauf.filter((e) => e.probeId === plan.id);
    return rundenAlle[0]?.ergebnisse ?? [];
  }, [verlauf, plan, rundenAlle]);

  /**
   * Die VERGANGENEN Runden für die Verlaufsliste - die oben als „Ergebnisse"
   * gezeigte Runde bleibt aussen vor, damit dieselbe Runde nicht doppelt
   * dasteht (einmal mit ihrem genauen Stand oben, einmal in der Liste).
   */
  const vergangeneRunden = useMemo(
    () => rundenAlle.filter((r) => r.probeId !== aktuelleRundeId),
    [rundenAlle, aktuelleRundeId],
  );

  useEffect(() => {
    if (!fokusZiel) return;
    const ziel = fokusZiel === "lauf" ? laufRef.current : schalterRef.current;
    if (!ziel) return;
    ziel.focus();
    setFokusZiel(null);
  }, [fokusZiel, ansicht]);

  function belegt(): boolean {
    if (!speichert) return false;
    setMeldung("Einen Augenblick - die vorige Änderung wird noch gespeichert.");
    return true;
  }

  async function starten() {
    if (belegt()) return;
    const dauerMin = Math.round(Number(dauer));
    if (
      !Number.isFinite(dauerMin) ||
      dauerMin < CHALLENGE_DAUER_MIN_KLEINST ||
      dauerMin > CHALLENGE_DAUER_MIN_GROESST
    ) {
      setMeldung(
        `Die Zeit muss zwischen ${CHALLENGE_DAUER_MIN_KLEINST} und ${CHALLENGE_DAUER_MIN_GROESST} Minuten liegen. Nichts gespeichert.`,
      );
      return;
    }
    setSpeichert(true);
    const neuerPlan: ChallengePlan = {
      id: neueChallengeId(),
      arbeitsweise,
      bereich,
      startMs: Date.now(),
      dauerMin,
      angelegtMs: Date.now(),
    };
    const r = await backend.setChallengePlan(teacherId, classCode, neuerPlan);
    setSpeichert(false);
    if (!r.ok) {
      setMeldung(r.error);
      return;
    }
    onSettingsChange({
      ...settings,
      punktgenau: { ...(settings.punktgenau ?? {}), challenge: neuerPlan },
    });
    setJetzt(Date.now());
    const bereichLabel = areas.find((a) => a.key === bereich)?.label ?? bereich;
    setMeldung(
      `Gestartet: ${dauerMin} Minuten, ${arbeitsweiseLabel(arbeitsweise).toLowerCase()}, ${bereichLabel}.`,
    );
    setFokusZiel("lauf");
  }

  async function absagen() {
    if (belegt()) return;
    if (
      !window.confirm(
        `${BRAILLE_CHALLENGE_WORT} wirklich absagen? Kinder, die schon abgegeben haben, behalten ihr Ergebnis.`,
      )
    ) {
      setMeldung("Abgesagt wurde nichts.");
      return;
    }
    setSpeichert(true);
    const r = await backend.setChallengePlan(teacherId, classCode, null);
    setSpeichert(false);
    if (!r.ok) {
      setMeldung("Nicht abgesagt. Bitte noch einmal versuchen.");
      return;
    }
    onSettingsChange({
      ...settings,
      punktgenau: { ...(settings.punktgenau ?? {}), challenge: undefined },
    });
    setMeldung(`${BRAILLE_CHALLENGE_WORT} ist abgesagt. Sie können eine neue starten.`);
    setFokusZiel("schalter");
  }

  const zeilen: ChallengeZeile[] = useMemo(
    () =>
      pupils.map((p) => ({
        id: p.id,
        name: p.name,
        ergebnis: aktuelleRundeErgebnisse.find((e) => e.pupilUid === p.id) ?? null,
      })),
    [pupils, aktuelleRundeErgebnisse],
  );
  const abgegebenAnzahl = zeilen.filter((z) => z.ergebnis !== null).length;

  const bereichHinweis = useMemo(() => {
    const a = areas.find((x) => x.key === bereich);
    return a ? `Schriftbereich: ${a.blurb}` : "In welchem Schriftbereich die Klasse arbeitet.";
  }, [areas, bereich]);

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
            {BRAILLE_CHALLENGE_WORT}
          </button>
        </h3>
        )}

        {ansicht === "formular" && (
          <>
            <div className="flex min-w-40 items-center gap-2">
              <label className="field-label mb-0" htmlFor={arbeitsweiseId}>
                Arbeitsweise
              </label>
              <Tipp text="Schreiben: Das Kind tastet die Punkte auf der Tastatur. Lesen: Das Kind liest ein Punktmuster und tippt es in Druckschrift. Beides wird gemessen und gewertet.">
                {(hinweisId) => (
                  <select
                    id={arbeitsweiseId}
                    aria-label={`Arbeitsweise - ${BRAILLE_CHALLENGE_WORT}: schreiben oder lesen`}
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
              <Tipp text={bereichHinweis}>
                {(hinweisId) => (
                  <select
                    id={bereichId}
                    aria-label={`Schriftbereich - ${BRAILLE_CHALLENGE_WORT}`}
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
            <div className="flex items-center gap-2">
              <label className="field-label mb-0" htmlFor={dauerId}>
                Min
              </label>
              <Tipp text="Wie lange jedes Kind ab dem ersten Anschlag Zeit hat." ausrichtung="rechts">
                {(hinweisId) => (
                  <input
                    id={dauerId}
                    aria-label="Zeit je Kind (Minuten)"
                    aria-describedby={hinweisId}
                    type="number"
                    inputMode="numeric"
                    min={CHALLENGE_DAUER_MIN_KLEINST}
                    max={CHALLENGE_DAUER_MIN_GROESST}
                    className="field-input feld-schlank w-20"
                    value={dauer}
                    onChange={(e) => setDauer(e.target.value)}
                  />
                )}
              </Tipp>
            </div>
            <Tipp text={`Startet die ${BRAILLE_CHALLENGE_WORT} sofort für die ganze Klasse.`} ausrichtung="rechts">
              {(hinweisId) => (
                <button
                  type="button"
                  className="btn-primary"
                  aria-disabled={speichert}
                  aria-describedby={hinweisId}
                  onClick={() => void starten()}
                >
                  Jetzt starten
                </button>
              )}
            </Tipp>
          </>
        )}

        {ansicht === "lauf" &&
          plan &&
          (() => {
            const { rest, kurz } = zeitstand(plan, jetzt);
            return (
              <>
                <p className="m-0 flex flex-1 flex-wrap items-baseline gap-x-3 gap-y-1 text-sm text-ink">
                  <span
                    ref={laufRef}
                    tabIndex={-1}
                    className="font-semibold outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <span className="sr-only">{BRAILLE_CHALLENGE_WORT} </span>
                    läuft
                  </span>
                  <span aria-hidden="true" className="font-semibold tabular-nums">
                    {mmss(rest)}
                  </span>
                  <span className="text-ink-muted">{kurz}</span>
                  <span>
                    Abgegeben: {abgegebenAnzahl} von {pupils.length}
                  </span>
                </p>
                <Tipp
                  text={`Nimmt die laufende ${BRAILLE_CHALLENGE_WORT} zurück. Wer schon abgegeben hat, behält sein Ergebnis.`}
                  ausrichtung="rechts"
                >
                  {(hinweisId) => (
                    <button
                      type="button"
                      className="btn-secondary btn-umriss"
                      aria-disabled={speichert}
                      aria-describedby={hinweisId}
                      onClick={() => void absagen()}
                    >
                      {BRAILLE_CHALLENGE_WORT} absagen
                    </button>
                  )}
                </Tipp>
              </>
            );
          })()}
      </div>

      <Aufklappen offen={offen}>
        <div id={teilId} className="mb-2 mt-1 space-y-3 border-t border-hairline pt-3 text-sm">
          {ansicht === "formular" && (
            <p className="m-0 text-ink-muted">
              Arbeitsweise, Schriftbereich und Zeit gelten für die ganze Klasse. Die{" "}
              {BRAILLE_CHALLENGE_WORT} startet sofort - kein Termin im Voraus.
            </p>
          )}

          {ansicht === "lauf" && plan && (
            <div className="space-y-2">
              <dl className="m-0 grid gap-x-4 gap-y-1 sm:grid-cols-[auto_1fr]">
                <dt className="font-semibold text-ink">Arbeitsweise</dt>
                <dd className="m-0 text-ink">{arbeitsweiseLabel(plan.arbeitsweise)}</dd>
                <dt className="font-semibold text-ink">Bereich</dt>
                <dd className="m-0 text-ink">
                  {areas.find((a) => a.key === plan.bereich)?.label ?? plan.bereich}
                </dd>
                <dt className="font-semibold text-ink">Zeit je Kind</dt>
                <dd className="m-0 text-ink">{plan.dauerMin} Minuten, ab dem ersten Anschlag</dd>
              </dl>
              <p className="m-0 text-ink-muted">Noch {zeitstand(plan, jetzt).satz}.</p>
              {geladen ? (
                <div className="space-y-1">
                  <p className="m-0 text-ink">
                    <span className="font-semibold">
                      Abgegeben: {abgegebenAnzahl} von {pupils.length}
                    </span>
                    {abgegebenAnzahl > 0 &&
                      ` - ${zeilen
                        .filter((z) => z.ergebnis !== null)
                        .map((z) => z.name)
                        .join(", ")}`}
                  </p>
                  <p className="m-0 text-ink-muted">
                    {abgegebenAnzahl === pupils.length
                      ? "Alle Kinder haben abgegeben."
                      : `Noch nicht abgegeben: ${zeilen
                          .filter((z) => z.ergebnis === null)
                          .map((z) => z.name)
                          .join(", ")}`}
                  </p>
                </div>
              ) : (
                <p className="m-0 text-ink-muted">Es wird nachgesehen, wer schon abgegeben hat.</p>
              )}
            </div>
          )}

          <div>
            <h4 className="m-0 text-sm font-semibold text-ink">Ergebnisse</h4>
            {aktuelleRundeId ? (
              <ErgebnisTabelle arbeitsweise={aktuelleRundeArbeitsweise} zeilen={zeilen} />
            ) : (
              <p className="m-0 text-ink-muted">
                Es ist noch keine {BRAILLE_CHALLENGE_WORT} zu Ende gegangen - ihre Ergebnisse stehen
                danach hier.
              </p>
            )}
          </div>

          <div>
            <h4 className="m-0 text-sm font-semibold text-ink">Verlauf</h4>
            {!geladen ? (
              <p className="m-0 text-ink-muted">Der Verlauf wird geladen.</p>
            ) : vergangeneRunden.length === 0 ? (
              <p className="m-0 text-ink-muted">
                Noch keine weitere {BRAILLE_CHALLENGE_WORT} - der Verlauf zeigt sich, sobald es eine
                zweite gibt.
              </p>
            ) : (
              <ul className="m-0 list-none space-y-2 p-0">
                {vergangeneRunden.map((runde, i) => (
                  <RundenZeile
                    key={runde.probeId}
                    runde={runde}
                    veraenderung={rundenVeraenderung(vergangeneRunden, runde.probeId)}
                    bereichLabel={areas.find((a) => a.key === runde.bereich)?.label ?? runde.bereich}
                    pupils={pupils}
                    offenVorgabe={i === 0}
                  />
                ))}
              </ul>
            )}
          </div>
        </div>
      </Aufklappen>

      {/*
        ⚠️ NICHT dauerhaft im Baum (anders als das Hauptvorbild
        `SchreibprobeKasten.tsx`, siehe dessen Begründung): Dieser Kasten
        steht im selben Reiter wie „Stunde sperren" und dessen eigene
        Statuszeile - zwei ständig gemountete `role="status"`-Bereiche auf
        einer Seite sind nicht mehr eindeutig ansprechbar. Muster
        `EigeneUebungKasten.tsx` (Tastenflow), das dieselbe Zeile ebenfalls
        nur BEI einer Meldung rendert.
      */}
      {meldung && (
        <p role="status" aria-live="polite" className="m-0 pb-1 text-sm text-ink-muted">
          {meldung}
        </p>
      )}
    </section>
  );
}
