/**
 * ════════════════════════════════════════════════════════════════════════════
 * Reiter „Punktgenau“ in „Meine Klassen“ (MK-E3)
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Johannes am 07.09.2026: *„es braucht viel mehr statistik für Lehrer,
 * übernehme von Tastenflow was sinnvoll ist“* · *„Wochenaufgaben, wie in
 * tastenflow“* · *„in punktgenau muss lehrer etappen zuweisen freischalten
 * können (nicht alle auf einmal)“*.
 *
 * ── Was aus Tastenflow übernommen ist - und was nicht ──────────────────────
 * ÜBERNOMMEN, weil es dieselbe Frage beantwortet:
 *   · der **Zeitraum-Kopf** (Woche · Schuljahr · Gesamt, mit Alt + ← / →),
 *     samt fester Wochengrenze Montag 08:00 (`WOCHENZIEL_GRENZE`, seit
 *     19.09.2026 - siehe `lib/braille/wochenaufgabe.ts`),
 *   · **sortierbare Spaltenköpfe** (`Spaltenkopf`),
 *   · die **Wochenaufgabe** als Idee: was in dieser Woche zu tun ist, je
 *     Klasse und abweichend je Kind, mit Ziel-Kalenderwochen und Nachholen,
 *   · der **Veränderungspfeil** an der Treffsicherheit.
 *
 * NICHT übernommen, weil Punktgenau anderes misst:
 *   · „Anschläge je Minute“ - es gibt keine Anschläge, es gibt Zellen,
 *   · „Einheiten zu je x Minuten“ - Punktgenau zählt Aufgaben und Etappen
 *     (die Übersetzung steht im Kopf von `lib/braille/wochenaufgabe.ts`),
 *   · die Jahreskarte - sie hängt an Tastenflows Lektionsaufbau.
 *
 * ── Grundsätze, die hier gelten ────────────────────────────────────────────
 * · [[feedback_data_transparency]]: nie mehr, als das Kind über sich selbst
 *   sieht. Anrede „Sie“ (K21).
 * · [[feedback_fokus_pflicht_alle_apps]]: nichts wird je `disabled` - die
 *   Sperre steckt im Handler und sagt ihren Grund in der Statuszeile (R5).
 * · [[feedback_nie_gegen_das_kind]]: eine Freigabe nimmt nie etwas weg, ein
 *   Rückstand entsteht nie in der laufenden Woche.
 * · [[feedback_zusammenfassung_ist_kein_beleg]]: Wo die gespeicherte
 *   Aufgabenliste am Anschlag ist, steht das dabei - statt eine zu kleine Zahl
 *   als vollständig auszugeben.
 *
 * ⚠️ DIE ÜBEZEIT-SPALTE AM 22.09.2026: An diesem Tag änderte sich die
 * Rechnung ZWEIMAL (volle Geschichte: `lib/braille/lesezeit.ts` Dateikopf).
 * Seit dem Abend gilt: keine Pause zählt mehr mit, aber eine vorgelesene
 * Aufgabe bekommt eine aus dem gelernten Lesetempo GERECHNETE Lesezeit dazu -
 * tastende und vorlesen lassende Kinder bekommen für dieselbe Aufgabe jetzt
 * dieselbe Übezeit angerechnet. Die Minuten-Spalte dieser Tabelle
 * (`minutenAus`, aus `wochenaufgabe.ts`, mit dem gelernten Lesetempo jedes
 * Kindes) kann sich dadurch gegenüber älteren Ständen verschieben - kein
 * Messfehler, sondern die Umstellung.
 *
 * ── Zubau 22.09.2026: Braille-Challenge, eigene Übung, Klassenmatch ────────
 * Die Bedienung für die Lehrkraft dazu steckt in zwei eigenen Kästen
 * (`BrailleChallengeKasten.tsx`, `BrailleEigeneUebungKasten.tsx`) und einem
 * schlichten Schalter hier im Reiter (Klassenmatch). Die Logik selbst liegt
 * unverändert in `lib/braille/challenge.ts`/`klassenmatch.ts`/`eigeneUebung.ts`.
 */
import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import {
  BrailleAccount,
  BrailleClassSettings,
  PunktgenauKindplan,
  PupilStats,
  TaskEvent,
  statsFromEvents,
} from "@/lib/braille";
import { brailleBackend } from "@/lib/braille/backend";
import { SpendenBanner } from "@/components/SpendenBanner";
import { spendenBannerImHalbjahr } from "@/lib/spendenbanner";
import {
  buildAreas,
  doneCount,
  etappeRunId,
  type Area,
} from "@/lib/braille/areas";
import {
  emptyProgress,
  type BrailleProgress,
} from "@/lib/braille/progress";
import {
  ereignisseZwischen,
  etappenZwischen,
  hatWochenaufgabe,
  leereWochenaufgabe,
  minutenAus,
  verlaufAmAnschlag,
  wochenaufgabeSatz,
  wochenstand,
  VERLAUF_LAENGE,
  type Wochenaufgabe,
} from "@/lib/braille/wochenaufgabe";
import { leseTempoAus } from "@/lib/braille/lesezeit";
import { LwPupilMessageButton } from "@/components/lernwerkstatt/LwTeacherCompose";
import { BrailleConfusionPanel } from "@/components/braille/BrailleConfusionPanel";
import {
  ZeitraumKopf,
  blaettereZeitraum,
  wochenBlaetternTaste,
} from "@/components/typing/ZeitraumKopf";
import { Spaltenkopf, type Sortierung } from "@/components/typing/Spaltenkopf";
import { Veraenderungspfeil } from "@/components/typing/Veraenderungspfeil";
import { WeekMultiSelect } from "@/components/typing/WeekMultiSelect";
import {
  AUFKLAPP_KNOPF_ZELLE,
  AUFKLAPP_ZEILE,
  AufklappHuelle,
  AufgabenLeiste,
  AufklappKnopf,
  aufklappGrund,
} from "@/components/lernwerkstatt/klasse/AufklappKnopf";
import { veraenderung } from "@/lib/typing/veraenderung";
import {
  ZEITRAUM_VORGABE_TABELLE,
  grenzen,
  schuljahrVersetzt,
  vergleichsGrenzen,
  vergleichsName,
  wochenBereichKompakt,
  monatBereichKompakt,
  zeitraumTitel,
  type Zeitraum,
} from "@/lib/typing/zeitraum";
import { schuljahrVon } from "@/lib/typing/jahreskarte";
// ★ 18.09.2026 (Bauplan E1): dieselbe Bezeichnung „Klasse 3b" wie bei
// Tastenflow - EINE Stelle rechnet sie, keine zweite, die abweichen könnte.
import { klassenBezeichnung } from "@/lib/typing/excelMarke";
import { WOCHENZIEL_GRENZE } from "@/lib/typing/wochenziel";
import { Tipp } from "@/components/Tipp";
// ★★★ „Eine Stunde sperren" (22.09.2026, `lib/braille/sperre.ts`): GETEILTER
// Zeitraum mit Tastenflow an `tt_classes.gesperrteZeiten` - siehe Dateikopf
// von `sperre.ts` für die Begründung, warum dieses Modul dafür direkt
// `typingBackend()` benutzt statt eines eigenen Punktgenau-Feldes.
import {
  gesperrtBisKnopf,
  holeGesperrteZeitenStand,
  klasseSperreAufheben,
  klasseStundeSperren,
  laufendeSperre,
  SPERRE_AUFGEHOBEN_STATUS,
  SPERRE_BEENDEN_TIPP,
  SPERRE_NICHT_AUFGEHOBEN_STATUS,
  SPERREN_TIPP,
  STUNDE_NICHT_GESPERRT_STATUS,
  STUNDE_SPERREN_KNOPF,
  stundeGesperrtStatus,
  type GesperrteZeit,
} from "@/lib/braille/sperre";
// ── Zubau 22.09.2026: Braille-Challenge, eigene Übung, Klassenmatch ─────────
import { BrailleChallengeKasten } from "./BrailleChallengeKasten";
import { BrailleEigeneUebungKasten } from "./BrailleEigeneUebungKasten";
import { klassenmatchErlaubt } from "@/lib/braille/klassenmatch";

// ---------------------------------------------------------------------------
// Kleine Helfer
// ---------------------------------------------------------------------------

function fmtDate(ts: number | null): string {
  if (!ts) return "-";
  return new Date(ts).toLocaleDateString("de-AT", {
    day: "2-digit",
    month: "2-digit",
  });
}

/** Minuten als „1 h 12“ bzw. „12 min“ - nie als Kommazahl. */
function fmtMinuten(min: number): string {
  const m = Math.round(min);
  if (m <= 0) return "-";
  if (m < 60) return `${m} min`;
  return `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, "0")}`;
}

function pct(anteil: number): string {
  return `${Math.round(anteil * 100)} %`;
}

/** Treffsicherheit einer Ereignisliste; `null`, wenn nichts geübt wurde. */
function treffer(ev: readonly TaskEvent[]): number | null {
  if (ev.length === 0) return null;
  return ev.filter((e) => e.correct).length / ev.length;
}

/**
 * Zeigen „Schuljahr“ und „Gesamt“ dasselbe? Dann sagt der Kopf es - sonst hält
 * man zwei Schalter, die dasselbe tun, für einen Fehler. (Gleiche Regel wie
 * `schuljahrIstAlles` in Tastenflow; hier über die Braille-Ereignisse.)
 */
function alleImSchuljahr(ev: readonly TaskEvent[], jetztMs: number): boolean {
  if (ev.length === 0) return true;
  const sj = schuljahrVon(jetztMs);
  return ev.every((e) => e.ts >= sj.vonMs && e.ts <= sj.bisMs);
}

// ---------------------------------------------------------------------------
// Der Stand EINES Kindes, wie ihn diese Ansicht braucht
// ---------------------------------------------------------------------------

interface KindDaten {
  pupil: BrailleAccount;
  events: TaskEvent[];
  progress: BrailleProgress;
  /** Der Stand konnte nicht gelesen werden - die Zahlen sind dann KEINE Messung. */
  fehler: boolean;
}

/** Was in einer Tabellenzeile steht - einmal gerechnet, mehrfach benutzt. */
interface Zeile {
  daten: KindDaten;
  stats: PupilStats;
  imZeitraum: TaskEvent[];
  minuten: number;
  aufgaben: number;
  treffer: number | null;
  trefferDavor: number | null;
  trefferSchreiben: number | null;
  trefferLesen: number | null;
  /** Im Zeitraum neu gemeisterte Etappen. */
  etappenNeu: number;
  /** Insgesamt gemeisterte Etappen (alle Bereiche). */
  etappenGesamt: number;
  etappenMoeglich: number;
  xp: number;
  wochenaufgabe: Wochenaufgabe | undefined;
  wochenErfuellt: boolean | null;
  wochenText: string;
  zuletzt: number | null;
}

// ---------------------------------------------------------------------------
// Lern-Einstellungen der Klasse (die drei bestehenden Schalter)
// ---------------------------------------------------------------------------

const OPTIONEN: {
  key: "extendedNumbers" | "expressComputer" | "grossschreibzeichen";
  label: string;
  text: string;
  /**
   * Fehlt das Feld in `settings`, gilt der Schalter trotzdem als AN (statt
   * wie bei den übrigen Schaltern als AUS) - für `grossschreibzeichen`, damit
   * sich für bestehende Klassen nichts ändert (siehe `account.ts`).
   */
  invertDefault?: boolean;
}[] = [
  {
    key: "extendedNumbers",
    label: "Erweiterte Zahlen (Basisschrift)",
    text: "Fünf Zusatz-Etappen direkt nach den Zahlen: römische Zahlen, Datum, Brüche, Prozent und Paragraf. Der übrige Lernweg bleibt unverändert.",
  },
  {
    key: "expressComputer",
    label: "Express-Umstieg Computerbraille",
    text: "Für Kinder, die die Vollschrift schon sicher können: Der Bereich Computer zeigt statt des regulären Aufbaus acht kompakte Umstiegs-Etappen, die gezielt die Unterschiede üben (z. B. Großschreibung über Punkt 7, Zahlen ohne Zahlzeichen). Der reguläre Computer-Aufbau ist dann ausgeblendet; dort Gemeistertes bleibt gespeichert.",
  },
  {
    key: "grossschreibzeichen",
    label: "Großschreibzeichen",
    text: "Vor jedem großen Buchstaben steht in der Basis- und Vollschrift eine eigene Ankündigungszelle. Schalten Sie sie ab, wenn das am Anfang noch zu viel ist - später wieder dazuschalten geht jederzeit. Die Computerschrift ist davon nicht betroffen, dort zeigt sich Großschreibung anders (über Punkt 7 im Zeichen selbst).",
    invertDefault: true,
  },
];

function LernEinstellungen({
  settings,
  speichern,
  melden,
  speichert,
}: {
  settings: BrailleClassSettings;
  speichern: (s: Partial<BrailleClassSettings>) => void;
  melden: (t: string) => void;
  speichert: boolean;
}) {
  return (
    <fieldset className="m-0 rounded-xl border border-hairline p-3" aria-busy={speichert}>
      <legend className="px-1 text-sm font-semibold text-ink">
        Lernweg dieser Klasse
      </legend>
      <ul className="m-0 list-none space-y-3 p-0">
        {OPTIONEN.map((o) => {
          // Bei `invertDefault` gilt ein fehlendes Feld als AN, sonst als AUS
          // (siehe Kommentar am Typ oben).
          const aktiv = o.invertDefault ? settings[o.key] !== false : !!settings[o.key];
          return (
          <li key={o.key}>
            <label className="flex items-start gap-2">
              {/*
                ★ Fokus-Pflicht (WCAG 2.4.3, [[feedback_fokus_pflicht_alle_apps]]):
                `aria-disabled` statt `disabled`. Ein `disabled` gesetztes
                Häkchen verliert im selben Augenblick den Fokus - genau das
                geschah hier bei JEDEM Umlegen, weil `speichert` sofort greift.
                Die Lehrkraft stand danach wieder am Anfang der Seite.
              */}
              <input
                type="checkbox"
                className="mt-1 aria-disabled:opacity-40"
                checked={aktiv}
                aria-disabled={speichert}
                onChange={() => {
                  if (speichert) {
                    melden(
                      "Einen Augenblick - die vorige Einstellung wird noch gespeichert.",
                    );
                    return;
                  }
                  speichern({ [o.key]: !aktiv });
                }}
                aria-describedby={`cls-set-${o.key}`}
              />
              <span>
                <span className="text-sm font-medium text-ink">{o.label}</span>
                <span id={`cls-set-${o.key}`} className="block text-xs text-ink-muted">
                  {o.text}
                </span>
              </span>
            </label>
          </li>
          );
        })}
      </ul>
    </fieldset>
  );
}

// ---------------------------------------------------------------------------
// Wochenaufgabe - der Editor (Klasse oder EIN Kind)
// ---------------------------------------------------------------------------

/**
 * Drei Zahlen, jede für sich abschaltbar (0 = kein Ziel). Der Editor ist
 * derselbe für die ganze Klasse und für ein einzelnes Kind - eine Fassung,
 * damit die Felder nicht auseinanderlaufen.
 */
function WochenaufgabeEditor({
  wert,
  /** Was gilt, solange nichts Eigenes eingetragen ist (nur bei EINEM Kind). */
  vorgabe,
  titel,
  idPrefix,
  speichern,
  loeschen,
  melden,
}: {
  wert: Wochenaufgabe | undefined;
  vorgabe?: Wochenaufgabe | undefined;
  titel: string;
  idPrefix: string;
  speichern: (w: Wochenaufgabe) => void;
  /** Nur bei einem Kind: zurück auf die Wochenaufgabe der Klasse. */
  loeschen?: () => void;
  melden: (t: string) => void;
}) {
  const start = wert ?? vorgabe ?? leereWochenaufgabe();
  const [minuten, setMinuten] = useState(String(start.minuten));
  const [aufgaben, setAufgaben] = useState(String(start.aufgaben));
  const [etappen, setEtappen] = useState(String(start.etappen));
  const [wochen, setWochen] = useState<string[]>(start.wochen ?? []);
  const [nachholen, setNachholen] = useState(!!start.nachholen);

  /**
   * ★★★★ DIE GESPEICHERTE AUFGABE KOMMT SPÄTER ALS DIESE FELDER (gemessen am
   * 07.09.2026 im Browser, nicht im Test).
   *
   * Die Einstellungen der Klasse werden nachgeladen; beim ERSTEN Aufbau ist
   * `wert` noch `undefined`, und `useState` merkt sich diesen Anfangswert für
   * immer. Auf dem Schirm stand darum „0 / 0 / 0", obwohl der Klasse
   * „30 Minuten, 25 Aufgaben, 1 Etappe" hinterlegt war.
   *
   * ⚠️⚠️ Das war nicht nur falsch angezeigt, es war GEFÄHRLICH: Wer auf diesem
   * Stand etwas geändert und gespeichert hätte, hätte die Wochenaufgabe der
   * Klasse mit drei Nullen überschrieben - ohne zu ahnen, dass es je eine gab.
   *
   * ★ Warum ein Abgleich und kein `key`-Neuaufbau: Ein neuer `key` baut die
   * Felder neu auf, und der Fokus - der nach dem Speichern auf dem Knopf steht -
   * fiele dabei auf `<body>` ([[feedback_fokus_pflicht_alle_apps]]). Der
   * Abgleich lässt die Elemente stehen und setzt nur ihre Werte.
   *
   * ⚠️ Verglichen wird der INHALT, nicht die Objekt-Identität: Sonst liefe der
   * Abgleich bei jedem Rendern und überschriebe, was gerade getippt wird.
   *
   * ── ⚠️⚠️ DIE ERSTE ANTWORT GEWINNT, JEDE SPÄTERE NICHT ────────────────────
   * Zwei Schäden sind denkbar, und sie sind NICHT gleich schwer:
   *
   *   (a) Der Abgleich läuft nicht ⇒ die Felder zeigen 0, obwohl 30 gespeichert
   *       ist. Wer darauf speichert, LÖSCHT die Wochenaufgabe der Klasse, ohne
   *       je erfahren zu haben, dass es eine gab.
   *   (b) Der Abgleich läuft ⇒ ein Anschlag, der in den wenigen hundert
   *       Millisekunden vor der Antwort fiel, wird ersetzt. Man SIEHT es und
   *       tippt es neu.
   *
   * (a) ist still und zerstörend, (b) sichtbar und folgenlos. Darum: Die ERSTE
   * Antwort wird immer übernommen. Für JEDE SPÄTERE gilt das Gegenteil - dort
   * ist der Fall (a) ausgeschlossen (die Felder stehen ja schon richtig), und
   * getippte Eingaben bleiben stehen.
   */
  const gespeicherteFassung = JSON.stringify(wert ?? vorgabe ?? null);
  const letzteFassung = useRef(gespeicherteFassung);
  const ersteAntwort = useRef(true);
  const beruehrt = useRef(false);
  useEffect(() => {
    if (letzteFassung.current === gespeicherteFassung) return;
    letzteFassung.current = gespeicherteFassung;
    const erste = ersteAntwort.current;
    ersteAntwort.current = false;
    if (!erste && beruehrt.current) return;
    const w = wert ?? vorgabe ?? leereWochenaufgabe();
    setMinuten(String(w.minuten));
    setAufgaben(String(w.aufgaben));
    setEtappen(String(w.etappen));
    setWochen(w.wochen ?? []);
    setNachholen(!!w.nachholen);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gespeicherteFassung]);
  /** Jede Eingabe der Lehrkraft geht durch hier - siehe `beruehrt` oben. */
  const getippt = <T,>(setzen: (v: T) => void) => (v: T) => {
    beruehrt.current = true;
    setzen(v);
  };

  const zahl = (t: string) => {
    const n = Number(t);
    return Number.isFinite(n) && n > 0 ? Math.round(n) : 0;
  };
  const gebaut: Wochenaufgabe = {
    minuten: zahl(minuten),
    aufgaben: zahl(aufgaben),
    etappen: zahl(etappen),
    ...(wochen.length ? { wochen } : {}),
    ...(nachholen ? { nachholen: true } : {}),
  };
  const geaendert =
    JSON.stringify(gebaut) !== JSON.stringify(wert ?? leereWochenaufgabe());

  const felder: {
    id: string;
    label: string;
    hilfe: string;
    max: number;
    wert: string;
    setzen: (t: string) => void;
  }[] = [
    {
      id: `${idPrefix}-min`,
      label: "Minuten je Woche",
      hilfe: "Übezeit, aus den Aufgabenzeiten gerechnet. 0 = kein Ziel.",
      max: 600,
      wert: minuten,
      setzen: getippt(setMinuten),
    },
    {
      id: `${idPrefix}-auf`,
      label: "Aufgaben je Woche",
      hilfe: "Jedes geschriebene oder gelesene Wort ist eine Aufgabe. 0 = kein Ziel.",
      max: 2000,
      wert: aufgaben,
      setzen: getippt(setAufgaben),
    },
    {
      id: `${idPrefix}-eta`,
      label: "Etappen je Woche",
      hilfe: "Neu gemeisterte Etappen. 0 = kein Ziel.",
      max: 60,
      wert: etappen,
      setzen: getippt(setEtappen),
    },
  ];

  return (
    <div className="space-y-2 rounded-lg border border-hairline bg-surface-raised px-3 py-2">
      <h4 className="m-0 text-sm font-semibold text-ink">{titel}</h4>
      <div className="flex flex-wrap items-end gap-2">
        {felder.map((f) => (
          <div key={f.id}>
            <label className="field-label" htmlFor={f.id}>
              {f.label}
            </label>
            <input
              id={f.id}
              type="number"
              min={0}
              max={f.max}
              className="field-input feld-schlank w-28"
              value={f.wert}
              onChange={(e) => f.setzen(e.target.value)}
              aria-describedby={`${f.id}-hilfe`}
            />
            <span id={`${f.id}-hilfe`} className="sr-only">
              {f.hilfe}
            </span>
          </div>
        ))}
        <div>
          <span className="field-label">Ziel-Kalenderwochen</span>
          <WeekMultiSelect value={wochen} onChange={getippt(setWochen)} nowMs={Date.now()} />
        </div>
        {/* ★ R5: `aria-disabled` statt `disabled` - der Knopf verschwände
            sonst AUSGERECHNET NACH dem Speichern aus der Fokus-Ordnung. */}
        <button
          type="button"
          className="btn-secondary btn-toggle btn-umriss aria-disabled:opacity-40"
          aria-disabled={!geaendert || undefined}
          onClick={() => {
            if (!geaendert) {
              melden("An der Wochenaufgabe ist nichts geändert - sie ist schon gespeichert.");
              return;
            }
            speichern(gebaut);
          }}
        >
          Wochenaufgabe speichern
        </button>
        {loeschen && (
          <button
            type="button"
            className="btn-secondary btn-toggle btn-umriss"
            onClick={loeschen}
          >
            Wieder die der Klasse
          </button>
        )}
      </div>
      <label className="flex items-center gap-2 text-sm text-ink">
        <input
          type="checkbox"
          className="h-4 w-4 accent-[rgb(var(--c-accent))]"
          checked={nachholen}
          onChange={(e) => getippt(setNachholen)(e.target.checked)}
        />
        Verpasste Wochen müssen nachgeholt werden
      </label>
      <p className="m-0 text-xs text-ink-muted">
        {/* ★ EINE Formulierung für Lehrkraft und Kind - sie kommt aus
            `wochenaufgabeSatz` und steht nirgends ein zweites Mal. */}
        {wochenaufgabeSatz(gebaut, "sie")} 0 = kein Ziel. Leere Wochen-Auswahl =
        jede Woche. Ohne „nachholen“ ist eine vergangene Woche vorbei - was
        nicht geschafft wurde, bleibt nicht offen.
        {!wert && vorgabe && hatWochenaufgabe(vorgabe) && (
          <>
            {" "}
            Zurzeit gilt hier die Wochenaufgabe der Klasse; sobald Sie
            speichern, gilt für dieses Kind das, was hier steht.
          </>
        )}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Die Zeile eines Kindes + der aufklappbare Teil darunter
// ---------------------------------------------------------------------------

function KindZeile({
  zeile,
  index,
  spalten,
  vergleich,
  einzelheiten,
}: {
  zeile: Zeile;
  index: number;
  /** Wie viele Spalten die Tabelle hat - für die Einzelheiten-Zeile. */
  spalten: number;
  vergleich: string;
  /** Der Teil „im Einzelnen" dieses Kindes - erst gebaut, wenn er offen ist. */
  einzelheiten: () => ReactNode;
}) {
  const { daten } = zeile;
  const p = daten.pupil;
  /*
    ★ 20.10.2026 (Johannes: überall wie in Tastenflow): Der Pfeil steht links
    in der ersten Spalte, die Einzelheiten öffnen sich als Zeile DIREKT unter
    dem Kind. Jedes Kind klappt für sich auf und zu.
  */
  const [offen, setOffen] = useState(false);
  const detailRef = useRef<HTMLDivElement>(null);
  // Öffnet sich der Teil, wandert der Fokus dorthin (NVDA-Test 2026-07-01).
  useEffect(() => {
    if (offen) detailRef.current?.focus();
  }, [offen]);
  const grund = aufklappGrund(index);
  return (
    <>
    <tr className={`${AUFKLAPP_ZEILE} ${grund}`}>
      <td className={`${AUFKLAPP_KNOPF_ZELLE} ${grund}`}>
        <AufklappKnopf
          open={offen}
          onToggle={() => setOffen((o) => !o)}
          controls={`pg-detail-${p.id}`}
          label={`Punktgenau im Einzelnen: ${p.name} ${offen ? "einklappen" : "ausklappen"}`}
          tipp={`Einzelheiten von ${p.name} - Bereiche, Wochenaufgabe und Verwechslungen.`}
        />
      </td>
      <th scope="row" className="py-2 pr-3 font-bold text-ink">
        <span className="inline-flex items-center gap-1.5">
          <span>{p.name}</span>
          <LwPupilMessageButton
            pupilId={p.id}
            pupilName={p.name}
            classCode={p.classCode ?? ""}
            iconOnly
          />
        </span>
        {daten.fehler && (
          <span className="block text-xs text-ink-muted">
            Stand nicht lesbar - die Zahlen dieser Zeile sind keine Messung.
          </span>
        )}
      </th>
      <td className="px-1 py-2 tabular-nums">{fmtMinuten(zeile.minuten)}</td>
      <td className="px-1 py-2 tabular-nums">{zeile.aufgaben || "-"}</td>
      <td className="px-1 py-2 tabular-nums">
        <Veraenderungspfeil
          wert={zeile.treffer === null ? "-" : pct(zeile.treffer)}
          veraenderung={veraenderung(
            zeile.treffer === null ? null : zeile.treffer * 100,
            zeile.trefferDavor === null ? null : zeile.trefferDavor * 100,
            "treffer",
          )}
          groesse="treffer"
          vergleichsName={vergleich}
        />
      </td>
      <td className="px-1 py-2 tabular-nums">
        {zeile.trefferSchreiben === null ? "-" : pct(zeile.trefferSchreiben)}
      </td>
      <td className="px-1 py-2 tabular-nums">
        {zeile.trefferLesen === null ? "-" : pct(zeile.trefferLesen)}
      </td>
      <td className="px-1 py-2 tabular-nums">
        {zeile.etappenNeu > 0 ? `+${zeile.etappenNeu} · ` : ""}
        {zeile.etappenGesamt}/{zeile.etappenMoeglich}
      </td>
      <td className="px-1 py-2 tabular-nums">{zeile.xp}</td>
      <td className="px-1 py-2">
        {zeile.wochenErfuellt === null ? (
          <span className="text-ink-muted">-</span>
        ) : (
          <span
            className={
              "inline-block rounded-lg px-2 py-1 text-xs font-medium " +
              (zeile.wochenErfuellt ? "bg-success-soft text-ink" : "bg-surface-sunken text-ink")
            }
          >
            {zeile.wochenText}
          </span>
        )}
      </td>
      <td className="px-1 py-2">{fmtDate(zeile.zuletzt)}</td>
      <td className="px-1 py-2">
        <SuspicionChip
          score={zeile.stats.suspicion.score}
          reasons={zeile.stats.suspicion.reasons}
        />
      </td>
    </tr>
    <AufklappHuelle offen={offen} spalten={spalten} grund={grund}>
      {offen && (
        <div
          id={`pg-detail-${p.id}`}
          ref={detailRef}
          tabIndex={-1}
          role="region"
          aria-label={`Punktgenau im Einzelnen: ${p.name}`}
          className="space-y-4 outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {einzelheiten()}
        </div>
      )}
    </AufklappHuelle>
    </>
  );
}

function SuspicionChip({ score, reasons }: { score: number; reasons: string[] }) {
  const tone =
    score <= 3
      ? "bg-success-soft text-ink"
      : score <= 6
        ? "bg-warning-soft text-ink"
        : "bg-danger-soft text-ink";
  const label = score <= 3 ? "unauffällig" : score <= 6 ? "auffällig" : "stark auffällig";
  return (
    <span className={"inline-block rounded-lg px-2 py-1 text-xs font-medium " + tone}>
      {score}/10 · {label}
      {/* Begründung auch ohne Maus - `title` erreicht weder Screenreader noch
          Braillezeile. */}
      {reasons.length > 0 && <span className="sr-only">. {reasons.join(" ")}</span>}
    </span>
  );
}

/** Die Bereichs-Aufschlüsselung eines Kindes im gewählten Zeitraum. */
function BereichsTabelle({
  areas,
  zeile,
}: {
  areas: Area[];
  zeile: Zeile;
}) {
  const proBereich = areas.map((a) => {
    const ids = new Set(a.etappen.map((et) => etappeRunId(et)));
    const ev = zeile.imZeitraum.filter((e) => ids.has(e.level));
    return {
      area: a,
      aufgaben: ev.length,
      treffer: treffer(ev),
      gemeistert: doneCount(a, zeile.daten.progress),
    };
  });
  return (
    <table className="w-full text-sm" aria-label={`Bereiche: ${zeile.daten.pupil.name}`}>
      <thead>
        <tr className="text-center text-ink-muted">
          <th scope="col" className="py-1 pr-3">Bereich</th>
          <th scope="col" className="px-1 py-1">Aufgaben</th>
          <th scope="col" className="px-1 py-1">Treffer</th>
          <th scope="col" className="px-1 py-1">Etappen gemeistert</th>
        </tr>
      </thead>
      <tbody className="text-center [&_td]:py-1 [&_td]:pr-2 [&_tr]:border-t [&_tr]:border-hairline/60">
        {proBereich.map((b) => (
          <tr key={b.area.key}>
            <th scope="row" className="py-1 pr-3 font-normal text-ink">
              {b.area.label}
            </th>
            <td className="tabular-nums">{b.aufgaben || "-"}</td>
            <td className="tabular-nums">{b.treffer === null ? "-" : pct(b.treffer)}</td>
            <td className="tabular-nums">
              {b.gemeistert} / {b.area.etappen.length}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ---------------------------------------------------------------------------
// Der Reiter
// ---------------------------------------------------------------------------

export function PunktgenauReiter({
  classCode,
  klassenname,
  teacherId,
  pupils,
}: {
  classCode: string;
  /**
   * ★ 18.09.2026 (Bauplan E1): der Anzeigename der Klasse („3b") für die
   * Überschrift über der Tabelle - `classCode` allein ist der Klassencode zum
   * Beitreten (z. B. „3B-7K2") und nicht zum Anzeigen gedacht. Ohne Angabe
   * (siehe `MeineKlassePage.tsx`, die diesen Namen mitgibt) fällt die
   * Überschrift auf den Code zurück, statt leer zu bleiben.
   */
  klassenname?: string;
  teacherId: string;
  pupils: BrailleAccount[];
}) {
  const backend = brailleBackend();
  const jetztMs = Date.now();

  const [settings, setSettings] = useState<BrailleClassSettings>({});
  const [speichert, setSpeichert] = useState(false);
  const [status, setStatus] = useState("");
  const [daten, setDaten] = useState<KindDaten[] | null>(null);
  // ★ Johannes 18.09.2026 - Punktgenau startet wie Tastenflow auf „Schuljahr".
  const [zeitraum, setZeitraum] = useState<Zeitraum>(ZEITRAUM_VORGABE_TABELLE);
  const [sortierung, setSortierung] = useState<Sortierung>(null);
  const klassenmatchId = useId();
  /** Hat die Lehrkraft schon etwas geändert? (siehe Lade-Effekt unten) */
  const beruehrt = useRef(false);
  /**
   * ★★★ „Eine Stunde sperren" (`lib/braille/sperre.ts`) - die gesperrten
   * Zeiträume DER KLASSE, geteilt mit Tastenflow. `sperrBusy` schützt den
   * Knopf gegen einen zweiten Druck, während der erste noch unterwegs ist
   * (dasselbe Muster wie `speichert` bei den Lern-Einstellungen oben).
   */
  const [gesperrt, setGesperrt] = useState<readonly GesperrteZeit[]>([]);
  const [sperrBusy, setSperrBusy] = useState(false);
  const [sperrPuls, setSperrPuls] = useState(0);

  const melden = (t: string) => setStatus(t);

  // --- Laden ---------------------------------------------------------------
  useEffect(() => {
    let alive = true;
    void backend.getClassSettings(classCode).then((s) => {
      if (!alive) return;
      // ⚠️ Hat die Lehrkraft schon etwas umgelegt, während die Einstellungen
      //    noch unterwegs waren, gewinnt IHRE Änderung. Sonst käme die
      //    Antwort des Servers und stellte den Schalter still zurück.
      if (!beruehrt.current) setSettings(s ?? {});
    });
    return () => {
      alive = false;
    };
  }, [backend, classCode]);

  useEffect(() => {
    let alive = true;
    void holeGesperrteZeitenStand(classCode).then((stand) => {
      if (alive) setGesperrt(stand.zeiten);
    });
    return () => {
      alive = false;
    };
    // ★ `sperrPuls` zieht nach jeder eigenen Sperr-Aktion neu nach (siehe
    //   `onStundeSperren`), nicht nur beim ersten Aufbau.
  }, [classCode, sperrPuls]);

  /** Läuft GERADE eine Sperre? Ein Zeitgeber rechnet neu, sobald sie endet -
   *  sonst bliebe „Gesperrt bis …" stehen, bis irgendetwas anderes die Seite
   *  ohnehin neu zeichnet (dasselbe Muster wie im Reiter „Tastenflow"). */
  const jetztSperre = useMemo(
    () => laufendeSperre(gesperrt, Date.now()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [gesperrt, sperrPuls],
  );
  useEffect(() => {
    if (!jetztSperre) return;
    const wartenMs = Math.max(250, jetztSperre.bisMs - Date.now() + 250);
    const timer = setTimeout(() => setSperrPuls((n) => n + 1), wartenMs);
    return () => clearTimeout(timer);
  }, [jetztSperre]);

  /**
   * Direkte Handlung, keine Rückfrage (wie im Reiter „Tastenflow"): eine
   * Sperre wirkt nur 60 Minuten und lässt sich mit demselben Knopf sofort
   * wieder aufheben. Schreibt über `typingBackend()` auf `tt_classes` - siehe
   * `lib/braille/sperre.ts` Dateikopf, warum das der richtige Weg ist.
   */
  const onStundeSperren = async () => {
    if (sperrBusy) return;
    setSperrBusy(true);
    try {
      if (jetztSperre) {
        const neu = await klasseSperreAufheben(classCode);
        if (!neu) {
          melden(SPERRE_NICHT_AUFGEHOBEN_STATUS);
          return;
        }
        setGesperrt(neu.gesperrteZeiten ?? []);
        melden(SPERRE_AUFGEHOBEN_STATUS);
      } else {
        const neu = await klasseStundeSperren(classCode);
        if (!neu) {
          melden(STUNDE_NICHT_GESPERRT_STATUS);
          return;
        }
        const zeiten = neu.gesperrteZeiten ?? [];
        setGesperrt(zeiten);
        const jetzt = Date.now();
        const zeile = zeiten.find((z) => z.abMs <= jetzt && z.bisMs > jetzt);
        melden(zeile ? stundeGesperrtStatus(zeile.bisMs) : STUNDE_NICHT_GESPERRT_STATUS);
      }
      setSperrPuls((n) => n + 1);
    } finally {
      setSperrBusy(false);
    }
  };

  useEffect(() => {
    let alive = true;
    void Promise.all(
      pupils.map(async (pupil): Promise<KindDaten> => {
        try {
          const [events, progress] = await Promise.all([
            backend.getEvents(pupil.id),
            backend.getProgress(pupil.id),
          ]);
          return { pupil, events, progress, fehler: false };
        } catch {
          // ★ Die Zeile bleibt stehen (die Einstellungen sind ja lesbar) -
          //   aber ihre Zahlen sind KEINE Messung, und das steht dann dabei.
          return { pupil, events: [], progress: emptyProgress(), fehler: true };
        }
      }),
    ).then((d) => {
      if (alive) setDaten(d);
    });
    return () => {
      alive = false;
    };
  }, [backend, pupils]);

  // --- Ableitungen ---------------------------------------------------------
  const areas = useMemo(
    () =>
      buildAreas({
        extendedNumbers: settings.extendedNumbers,
        expressComputer: settings.expressComputer,
      }),
    [settings.extendedNumbers, settings.expressComputer],
  );
  const etappenMoeglich = useMemo(
    () => areas.reduce((n, a) => n + a.etappen.length, 0),
    [areas],
  );

  /**
   * ★ Zubau 22.09.2026: der Fortschritt jedes Kindes für die Zeichen-Prüfung
   * in `BrailleEigeneUebungKasten` - dieselben Daten, die auch die Tabelle
   * unten benutzt (`daten`), kein zweiter Abruf. `null`, solange sie noch
   * geladen werden.
   */
  const kinderProgress = useMemo(
    () =>
      daten
        ? daten.map((d) => ({ id: d.pupil.id, name: d.pupil.name, progress: d.progress }))
        : null,
    [daten],
  );

  const plan = settings.punktgenau;

  const zeilen: Zeile[] = useMemo(() => {
    if (!daten) return [];
    const g = grenzen(zeitraum, jetztMs, WOCHENZIEL_GRENZE);
    const gDavor = vergleichsGrenzen(zeitraum, jetztMs, WOCHENZIEL_GRENZE);
    return daten.map((d) => {
      const imZeitraum = g ? ereignisseZwischen(d.events, g) : [...d.events];
      const davor = gDavor ? ereignisseZwischen(d.events, gDavor) : [];
      const schreiben = imZeitraum.filter((e) => e.direction === "write");
      const lesen = imZeitraum.filter((e) => e.direction === "read");
      const eigen = plan?.kinder?.[d.pupil.id];
      const wa = eigen?.wochenaufgabe ?? plan?.wochenaufgabe;
      // ★★★ Gesperrte Unterrichtsstunden zählen NICHT für die Wochenaufgabe
      // (wohl aber für „Etappen dazu"/„Minuten"/„Aufgaben" oben in der
      // allgemeinen Statistik - dort wird `gesperrt` bewusst NICHT gereicht,
      // siehe `sperre.ts`: nur die Wochenaufgabe klammert die Zeit aus,
      // Übezeit/Statistik/Abzeichen zählen überall sonst unverändert weiter).
      const stand = hatWochenaufgabe(wa)
        ? wochenstand(wa, d.events, d.progress, jetztMs, 0, gesperrt)
        : null;
      return {
        daten: d,
        stats: statsFromEvents(d.events),
        imZeitraum,
        minuten: minutenAus(imZeitraum, leseTempoAus(d.progress)),
        aufgaben: imZeitraum.length,
        treffer: treffer(imZeitraum),
        trefferDavor: treffer(davor),
        trefferSchreiben: treffer(schreiben),
        trefferLesen: treffer(lesen),
        etappenNeu: etappenZwischen(d.progress, g).length,
        etappenGesamt: areas.reduce((n, a) => n + doneCount(a, d.progress), 0),
        etappenMoeglich,
        xp: d.progress.xp,
        wochenaufgabe: wa,
        wochenErfuellt: stand?.aktiv ? stand.erfuellt : null,
        wochenText: stand?.aktiv
          ? [
              stand.sollMinuten > 0
                ? `${Math.round(stand.minutenGeschafft)}/${stand.sollMinuten} min`
                : "",
              stand.sollAufgaben > 0
                ? `${stand.aufgabenGeschafft}/${stand.sollAufgaben} Aufg.`
                : "",
              stand.sollEtappen > 0
                ? `${stand.etappenGeschafft}/${stand.sollEtappen} Et.`
                : "",
            ]
              .filter(Boolean)
              .join(" · ")
          : "",
        zuletzt: d.events.length ? Math.max(...d.events.map((e) => e.ts)) : null,
      };
    });
  }, [daten, zeitraum, jetztMs, plan, areas, etappenMoeglich, gesperrt]);

  const sortiert = useMemo(() => {
    if (!sortierung) return zeilen;
    const wert = (z: Zeile): number | string => {
      switch (sortierung.spalte) {
        case "name":
          return z.daten.pupil.name.toLocaleLowerCase("de");
        case "minuten":
          return z.minuten;
        case "aufgaben":
          return z.aufgaben;
        case "treffer":
          return z.treffer ?? -1;
        case "schreiben":
          return z.trefferSchreiben ?? -1;
        case "lesen":
          return z.trefferLesen ?? -1;
        case "etappen":
          return z.etappenGesamt;
        case "xp":
          return z.xp;
        case "woche":
          return z.wochenErfuellt === null ? -1 : z.wochenErfuellt ? 1 : 0;
        case "zuletzt":
          return z.zuletzt ?? 0;
        case "eigen":
          return z.stats.suspicion.score;
        default:
          return 0;
      }
    };
    const kopie = [...zeilen];
    kopie.sort((a, b) => {
      const x = wert(a);
      const y = wert(b);
      const v =
        typeof x === "string" && typeof y === "string"
          ? x.localeCompare(y, "de")
          : Number(x) - Number(y);
      return sortierung.ab ? -v : v;
    });
    return kopie;
  }, [zeilen, sortierung]);

  const sortieren = (spalte: string) =>
    setSortierung((s) =>
      s?.spalte === spalte ? { spalte, ab: !s.ab } : { spalte, ab: false },
    );

  const alleEreignisse = useMemo(
    () => (daten ?? []).flatMap((d) => d.events),
    [daten],
  );
  const amAnschlag = (daten ?? []).some((d) => verlaufAmAnschlag(d.events));

  // --- Speichern -----------------------------------------------------------
  const speichern = async (teil: Partial<BrailleClassSettings>, meldung?: string) => {
    beruehrt.current = true;
    setSpeichert(true);
    const naechste = { ...settings, ...teil };
    const r = await backend.updateClassSettings(teacherId, classCode, naechste);
    setSpeichert(false);
    if (r.ok) {
      setSettings(naechste);
      melden(meldung ?? "Gespeichert. Bei den Kindern gilt es ab dem nächsten Öffnen der App.");
    } else {
      melden(r.error);
    }
  };

  /**
   * ★ Zubau 22.09.2026: `BrailleChallengeKasten` meldet seine eigenen
   * Speicherungen (`backend.setChallengePlan`) nur als Erfolg/Misserfolg
   * zurück, nicht als aktualisierte Einstellungen (anders als
   * `updateClassSettings`) - der Kasten baut die nächsten Einstellungen darum
   * selbst und reicht sie hier herein. `beruehrt` verhindert, dass eine noch
   * unterwegs befindliche Erst-Ladung diese frische Änderung überschreibt.
   */
  const uebernimmSettings = (naechste: BrailleClassSettings) => {
    beruehrt.current = true;
    setSettings(naechste);
  };

  /**
   * ★ Zubau 22.09.2026: Klassenmatch an-/abschalten - eigene Backend-Funktion
   * (`setKlassenmatchAus`), nicht der allgemeine `speichern()`-Weg (der
   * schriebe über `updateClassSettings` und träfe damit nicht dieselbe,
   * server-seitig abgesicherte Stelle wie am Vorbild, siehe `backend.ts`).
   */
  const [klassenmatchBusy, setKlassenmatchBusy] = useState(false);
  const onKlassenmatchAendern = async (aus: boolean) => {
    if (klassenmatchBusy) {
      melden("Einen Augenblick - die vorige Änderung wird noch gespeichert.");
      return;
    }
    setKlassenmatchBusy(true);
    const r = await backend.setKlassenmatchAus(teacherId, classCode, aus);
    setKlassenmatchBusy(false);
    if (!r.ok) {
      melden(r.error);
      return;
    }
    uebernimmSettings({
      ...settings,
      punktgenau: { ...(settings.punktgenau ?? {}), klassenmatchAus: aus },
    });
    melden(
      aus
        ? "Das Klassenmatch ist für diese Klasse abgeschaltet."
        : "Das Klassenmatch ist für diese Klasse erlaubt.",
    );
  };

  /** Den Punktgenau-Plan ändern - immer über diese eine Stelle. */
  const planSchreiben = (
    aendern: (alt: NonNullable<BrailleClassSettings["punktgenau"]>) => NonNullable<
      BrailleClassSettings["punktgenau"]
    >,
    meldung?: string,
  ) => {
    if (speichert) {
      melden("Einen Augenblick - die vorige Änderung wird noch gespeichert.");
      return;
    }
    void speichern({ punktgenau: aendern(plan ?? {}) }, meldung);
  };

  const kindplanSchreiben = (
    pupilId: string,
    aendern: (alt: PunktgenauKindplan) => PunktgenauKindplan,
    meldung?: string,
  ) =>
    planSchreiben((alt) => {
      const kinder = { ...(alt.kinder ?? {}) };
      const neu = aendern(kinder[pupilId] ?? {});
      if (!neu.wochenaufgabe) delete kinder[pupilId];
      else kinder[pupilId] = neu;
      return { ...alt, kinder };
    }, meldung);

  // --- Anzeige -------------------------------------------------------------
  /*
    ★★★ KEIN GANZ-ODER-GAR-NICHT (gemessen 07.09.2026).
    Hier stand zwischenzeitlich ein `if (!geladen || !daten) return <p>lädt…`.
    Das ist bequem und falsch: Die Bedienelemente hängen nicht am Stand der
    Kinder, und eine Lehrkraft, die nur ein Häkchen umlegen will, wartete auf
    Zahlen, die sie gar nicht braucht. Für eine Sprachausgabe ist es schlimmer -
    der ganze Baum wird ausgetauscht und der Fokus fällt auf `<body>`.
    Jetzt steht alles sofort da; nur die Tabelle sagt, dass sie noch lädt.
  */
  const vergleich = vergleichsName(zeitraum, jetztMs);

  /**
   * ★ SPENDENBANNER (18.09.2026): der Klassen-DURCHSCHNITT der echten Übezeit
   * in Stunden - über die GANZE Geschichte jedes Kindes (`d.events`, nicht
   * `imZeitraum`), nicht nur den gewählten Zeitraum. `null`, solange `daten`
   * noch nicht geladen ist oder die Klasse kein Kind hat.
   */
  const spendenbannerStundenGesamt =
    daten && daten.length > 0
      ? daten.reduce((s, d) => s + minutenAus(d.events, leseTempoAus(d.progress)), 0) /
        daten.length /
        60
      : null;
  /** ★ 21.09.2026: dasselbe für die letzten sechs Monate (Bitte nach einem Jahr). */
  const spendenbannerStundenHalbjahr =
    daten && daten.length > 0
      ? daten.reduce((s, d) => s + minutenAus(spendenBannerImHalbjahr(d.events)), 0) /
        daten.length /
        60
      : null;

  const summeMinuten = zeilen.reduce((s, z) => s + z.minuten, 0);
  const summeAufgaben = zeilen.reduce((s, z) => s + z.aufgaben, 0);
  const summeRichtig = zeilen.reduce(
    (s, z) => s + z.imZeitraum.filter((e) => e.correct).length,
    0,
  );
  const summeEtappenNeu = zeilen.reduce((s, z) => s + z.etappenNeu, 0);
  const mitAufgabe = zeilen.filter((z) => z.wochenErfuellt !== null);
  const erfuellt = mitAufgabe.filter((z) => z.wochenErfuellt).length;

  const SPALTEN: {
    schluessel: string;
    kopf: string;
    hilfe: string;
    ausrichtung?: "links" | "rechts";
  }[] = [
    { schluessel: "name", kopf: "Name", hilfe: "Nach Namen sortieren." },
    {
      schluessel: "minuten",
      kopf: "Übezeit",
      hilfe: "Summe der Aufgabenzeiten im gewählten Zeitraum - keine Stoppuhr. Was zwischen zwei Aufgaben passiert, zählt nicht mit; die Zahl ist damit eher zu klein als zu groß.",
    },
    {
      schluessel: "aufgaben",
      kopf: "Aufgaben",
      hilfe: "Geschriebene und gelesene Wörter im Zeitraum.",
    },
    {
      schluessel: "treffer",
      kopf: "Treffer",
      hilfe: `Anteil richtiger Aufgaben. Der Pfeil vergleicht mit ${vergleich || "nichts - „Gesamt\“ hat kein Davor"}.`,
    },
    {
      schluessel: "schreiben",
      kopf: "Schreiben",
      hilfe: "Treffsicherheit nur bei Schreib-Aufgaben (Punkt-Tasten).",
    },
    {
      schluessel: "lesen",
      kopf: "Lesen",
      hilfe: "Treffsicherheit nur bei Lese-Aufgaben (Braille lesen, Druckschrift tippen).",
    },
    {
      schluessel: "etappen",
      kopf: "Etappen",
      hilfe: "Gemeisterte Etappen insgesamt; davor steht, wie viele im gewählten Zeitraum dazugekommen sind.",
    },
    { schluessel: "xp", kopf: "Punkte", hilfe: "Gesammelte Punkte (XP) insgesamt." },
    {
      schluessel: "woche",
      kopf: "Wochenaufgabe",
      hilfe: "Stand der laufenden Woche - unabhängig vom gewählten Zeitraum, denn die Wochenaufgabe gilt immer für die aktuelle Woche.",
    },
    { schluessel: "zuletzt", kopf: "Zuletzt", hilfe: "Letzte Aufgabe überhaupt." },
    {
      schluessel: "eigen",
      kopf: "Eigenständigkeit",
      hilfe: "Hinweis auf Einfügen, Fokuswechsel und unplausibel schnelle Treffer. Ein Wert ist kein Urteil - er ist ein Anlass nachzufragen.",
      ausrichtung: "rechts",
    },
  ];

  /** Der Teil „im Einzelnen" eines Kindes - sitzt als Zeile direkt unter ihm (20.10.2026). */
  const einzelheitenVon = (offeneZeile: Zeile): ReactNode => (
    <>
      <BereichsTabelle areas={areas} zeile={offeneZeile} />

      <WochenaufgabeEditor
        wert={plan?.kinder?.[offeneZeile.daten.pupil.id]?.wochenaufgabe}
        vorgabe={plan?.wochenaufgabe}
        titel="Wochenaufgabe nur für dieses Kind"
        idPrefix={`pg-wa-${offeneZeile.daten.pupil.id}`}
        melden={melden}
        speichern={(w) =>
          kindplanSchreiben(offeneZeile.daten.pupil.id, (alt) => ({
            ...alt,
            wochenaufgabe: w,
          }))
        }
        loeschen={
          plan?.kinder?.[offeneZeile.daten.pupil.id]?.wochenaufgabe
            ? () =>
                kindplanSchreiben(offeneZeile.daten.pupil.id, (alt) => ({
                  ...alt,
                  wochenaufgabe: undefined,
                }))
            : undefined
        }
      />

      <div>
        <h3 className="m-0 mb-2 text-sm font-semibold text-ink">Verwechslungen</h3>
        <BrailleConfusionPanel accountId={offeneZeile.daten.pupil.id} viewer="lehrkraft" />
      </div>
    </>
  );

  return (
    <div
      className="space-y-5"
      aria-busy={speichert ? true : undefined}
      /* ★★★ ALT + ← / ALT + → blättert die Wochen - wie in Tastenflow. Der
         Horcher hängt HIER und nicht am `window`: Die blanken Pfeiltasten
         bleiben frei für die Tabelle. */
      onKeyDown={wochenBlaetternTaste((schritt) =>
        setZeitraum((z) => blaettereZeitraum(z, schritt)),
      )}
    >
      <p role="status" aria-live="polite" className="sr-only">
        {status}
      </p>

      <SpendenBanner
        app="braille"
        zielgruppe="lehrkraft"
        kontoId={teacherId}
        stundenGesamt={spendenbannerStundenGesamt}
        stundenHalbjahr={spendenbannerStundenHalbjahr}
      />

      {/* ── Überblick ──────────────────────────────────────────────────── */}
      <div className="card space-y-3 p-4">
        <ZeitraumKopf
          zeitraum={zeitraum}
          onZeitraum={setZeitraum}
          klasse={klassenBezeichnung(klassenname ?? classCode)}
          titel={zeitraumTitel(zeitraum, jetztMs, WOCHENZIEL_GRENZE)}
          wocheKompakt={wochenBereichKompakt(zeitraum.wochenVersatz, jetztMs, WOCHENZIEL_GRENZE)}
          // ★ K4 (19.09.2026): derselbe kurze Bereich für „Monat".
          monatKompakt={monatBereichKompakt(zeitraum.monatVersatz ?? 0, jetztMs, WOCHENZIEL_GRENZE)}
          // ★ 18.09.2026: wie in Tastenflow - die Jahreszahl folgt dem
          // Blättern (`jahrVersatz`), nicht dem Kalenderdatum von heute.
          schuljahrLabel={schuljahrVersetzt(jetztMs, zeitraum.jahrVersatz ?? 0).label}
          gleichbedeutend={alleImSchuljahr(alleEreignisse, jetztMs)}
          titelId="mk-pg-zeitraum"
        />
        <dl className="m-0 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {[
            ["Kinder", String(pupils.length)],
            ["Übezeit", fmtMinuten(summeMinuten)],
            ["Aufgaben", String(summeAufgaben)],
            [
              "Treffsicherheit",
              summeAufgaben ? pct(summeRichtig / summeAufgaben) : "-",
            ],
            ["Etappen dazu", String(summeEtappenNeu)],
          ].map(([k, v]) => (
            <div key={k} className="rounded-lg bg-surface-sunken px-3 py-2">
              <dt className="m-0 text-xs text-ink-muted">{k}</dt>
              <dd className="m-0 text-lg font-semibold tabular-nums text-ink">{v}</dd>
            </div>
          ))}
        </dl>
        {mitAufgabe.length > 0 && (
          <p className="m-0 text-sm text-ink">
            Wochenaufgabe: <strong>{erfuellt}</strong> von {mitAufgabe.length}{" "}
            {mitAufgabe.length === 1 ? "Kind hat" : "Kindern haben"} sie diese
            Woche schon geschafft.
          </p>
        )}
        {amAnschlag && (
          <p className="m-0 rounded-lg bg-warning-soft p-2 text-xs text-ink">
            ⚠️ Bei mindestens einem Kind ist die gespeicherte Aufgabenliste voll
            ({VERLAUF_LAENGE} Aufgaben). „Schuljahr“ und „Gesamt“ reichen dort nur
            so weit zurück - die Wochen-Ansicht ist davon nicht betroffen.
          </p>
        )}
      </div>

      {/* ── Aufgaben-Leiste ──────────────────────────────────────────────
          ★ 20.10.2026 (Johannes: wie in Tastenflow): alles, was die Lehrkraft
          an die GANZE KLASSE schickt, steht als Schalter in EINER Reihe; das
          Panel öffnet darunter, höchstens eines. Vorher standen vier Karten
          untereinander. */}
      <AufgabenLeiste
        gruppe="Für die ganze Klasse"
        praefix="mk-pg"
        eintraege={[
          {
            schluessel: "wochenaufgabe",
            label: "Wochenaufgabe",
            tipp: "Was in einer Woche zu tun ist - für die ganze Klasse.",
            inhalt: <>
            <p className="m-0 text-xs text-ink-muted">
              Was in einer Woche zu tun ist. Die Kinder sehen sie in Punktgenau über der Übung, mit
              ihrem Stand. Für einzelne Kinder lässt sie sich im aufgeklappten Kind abweichend eintragen.
            </p>
        <WochenaufgabeEditor
          wert={plan?.wochenaufgabe}
          titel="Für die ganze Klasse"
          idPrefix="pg-klasse"
          melden={melden}
          speichern={(w) => planSchreiben((alt) => ({ ...alt, wochenaufgabe: w }))}
        />
        {Object.keys(plan?.kinder ?? {}).length > 0 && (
          <p className="m-0 text-xs text-ink-muted">
            Eigene Einträge gibt es für:{" "}
            {Object.keys(plan?.kinder ?? {})
              .map((id) => pupils.find((p) => p.id === id)?.name ?? "(gelöschtes Konto)")
              .join(", ")}
            .
          </p>
        )}
          </>,
          },
          {
            schluessel: "challenge",
            label: "Braille-Challenge",
            tipp: "Eine zeitlich begrenzte Prüfung für die ganze Klasse.",
            inhalt: (
        <BrailleChallengeKasten
                eingebettet
          classCode={classCode}
          teacherId={teacherId}
          pupils={pupils}
          areas={areas}
          settings={settings}
          onSettingsChange={uebernimmSettings}
        />
            ),
          },
          {
            schluessel: "uebung",
            label: "Eigene Übung",
            tipp: "Ein Text, den Sie hochladen und der Klasse zuweisen - unabhängig vom Stand der einzelnen Kinder.",
            inhalt: (
        <BrailleEigeneUebungKasten
                eingebettet
          classCode={classCode}
          teacherId={teacherId}
          areas={areas}
          kinderProgress={kinderProgress}
        />
            ),
          },
          {
            schluessel: "sperre",
            label: STUNDE_SPERREN_KNOPF,
            tipp: jetztSperre ? SPERRE_BEENDEN_TIPP : SPERREN_TIPP,
            inhalt: null,
            aktion: {
              onClick: () => void onStundeSperren(),
              busy: sperrBusy,
              label: jetztSperre ? gesperrtBisKnopf(jetztSperre.bisMs) : STUNDE_SPERREN_KNOPF,
            },
          },
          {
            schluessel: "einstellungen",
            label: "Einstellungen der Klasse",
            tipp: "Lernweg, Hilfen und Klassenmatch für die ganze Klasse.",
            inhalt: <>
        <LernEinstellungen
          settings={settings}
          speichern={(s) => void speichern(s)}
          melden={melden}
          speichert={speichert}
        />
        {/*
          ★ Zubau 22.09.2026: Klassenmatch je Klasse abschalten - eigene
          Backend-Funktion (siehe `onKlassenmatchAendern` oben), darum ein
          eigener Schalter neben `LernEinstellungen` statt eines weiteren
          Eintrags in deren Liste. Der Satz sagt ausdrücklich, dass die
          Lehrkraft KEINE Ergebnisse sieht - das ist eine bewusste
          Entscheidung aus dem Vorbild (Tastenflow, F8) und soll nicht wie ein
          Versehen aussehen.
        */}
        <div className="flex items-center gap-2 rounded-xl border border-hairline p-3">
          <Tipp
            text="Die Kinder können einander zu einem kurzen Klassenmatch einladen. Sie als Lehrkraft sehen dabei KEINE Ergebnisse - in der Zeile eines Kindes steht nur, wie oft es mitgemacht hat."
            ausrichtung="links"
          >
            {(hinweisId) => (
              <span className="flex items-center gap-2">
                <input
                  id={klassenmatchId}
                  type="checkbox"
                  className="h-4 w-4 accent-[rgb(var(--c-accent))]"
                  checked={!klassenmatchErlaubt({ klassenmatchAus: plan?.klassenmatchAus })}
                  aria-disabled={klassenmatchBusy}
                  aria-describedby={hinweisId}
                  onChange={(e) => void onKlassenmatchAendern(e.target.checked)}
                />
                <label htmlFor={klassenmatchId} className="text-sm font-medium text-ink">
                  Klassenmatch aus
                </label>
              </span>
            )}
          </Tipp>
        </div>
          </>,
          },
        ]}
      />

      {/* ── Tabelle ────────────────────────────────────────────────────── */}
      <div className="card space-y-3 p-4">
        <div>
          <h2 className="m-0 text-lg font-semibold text-ink" id="mk-pg-tabelle">
            Stand in Punktgenau
          </h2>
          <p className="m-0 text-sm text-ink-muted">
            Alle Zahlen gelten für den oben gewählten Zeitraum - außer der
            Wochenaufgabe, den Punkten und „Zuletzt“. Sie sehen genau das, was
            das Kind über sich selbst sieht - nicht mehr. Jede Überschrift
            sortiert; Alt und Pfeil links oder rechts blättert die Wochen.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table
            className="w-full text-sm"
            aria-labelledby="mk-pg-tabelle"
            /*
              ★ 18.09.2026 (Bauplan E1): „mk-pg-zeitraum" nennt seit E1 nur
              noch die Klasse (die Überschrift im `ZeitraumKopf`) - der
              Zeitraum selbst steht am gedrückten Schalter und bleibt für die
              Sprachausgabe zusätzlich im unsichtbaren Satz
              „mk-pg-zeitraum-periode" erhalten. Beide zusammen sagen: welche
              Klasse UND welcher Zeitraum.
            */
            aria-describedby="mk-pg-zeitraum mk-pg-zeitraum-periode"
          >
            <thead>
              <tr className="text-center text-ink-muted">
                <th scope="col" className={`py-2 ${AUFKLAPP_KNOPF_ZELLE}`}>
                  <span className="sr-only">Einzelheiten zu diesem Kind</span>
                </th>
                {SPALTEN.map((s) => (
                  <Spaltenkopf
                    key={s.schluessel}
                    hilfe={s.hilfe}
                    ausrichtung={s.ausrichtung}
                    className={s.schluessel === "name" ? "py-2 pr-3" : "px-1 py-2"}
                    sortSchluessel={s.schluessel}
                    sortierung={sortierung}
                    onSortieren={sortieren}
                  >
                    {s.kopf}
                  </Spaltenkopf>
                ))}
              </tr>
            </thead>
            <tbody className="text-center [&_td]:py-2 [&_td]:pr-2 [&_tr]:border-t [&_tr]:border-hairline/60">
              {daten === null && (
                <tr>
                  <td colSpan={SPALTEN.length + 1} className="py-2 text-ink-muted">
                    Der Stand der Kinder wird geladen …
                  </td>
                </tr>
              )}
              {daten !== null && sortiert.length === 0 && (
                <tr>
                  <td colSpan={SPALTEN.length + 1} className="py-2 text-ink-muted">
                    In dieser Klasse ist noch niemand angelegt.
                  </td>
                </tr>
              )}
              {sortiert.map((z, i) => (
                <KindZeile
                  key={z.daten.pupil.id}
                  zeile={z}
                  index={i}
                  vergleich={vergleich}
                  spalten={SPALTEN.length + 1}
                  einzelheiten={() => einzelheitenVon(z)}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
