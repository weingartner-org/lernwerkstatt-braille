/**
 * Bereichs-Modell für „Punktgenau" (die neue, etappen-getriebene Braille-App).
 *
 * Reine Daten/Logik - kein React. Die App zeigt fünf Bereiche als Schalter; jeder
 * Bereich ist eine GEORDNETE Etappen-Reihe aus der neuen Didaktik (etappen.ts /
 * kurzschrift / ueb). Das alte „spring irgendwohin"-Level-Curriculum wird
 * NICHT mehr für die Navigation genutzt - `curriculum.ts` dient nur noch als
 * Wortpool-Quelle (Daten), an die die Etappen andocken.
 *
 * Knackpunkt: Mehrere Etappen teilen sich eine `levelId` (z. B. E1+E2 →
 * „l1-reihe1"). Damit jede Etappe ihren EIGENEN Mastery-Strang bekommt (und
 * Etappe 2 nicht durch Etappe 1 als „fertig" gilt), läuft die Mastery-/
 * Telemetrie-id über `etappeRunId()` = die etappen-eigene id. Kurzschrift-
 * Etappen behalten dabei „kurz-…", weil der Runner daran den liblouis-de-g2-
 * Lösungspfad erkennt.
 */
import type { BrailleSystem } from "./tables";
import { levelById, type Level, type LevelKind } from "./curriculum";
import { ETAPPEN, GRENZFALL_ETAPPEN, KURZ_ETAPPEN, STRICHE_ETAPPEN, UEB_ETAPPEN, type Etappe } from "./etappen";
import { isLevelMastered, type LevelMastery } from "./adaptive";
import { getLevelMastery, type BrailleProgress } from "./progress";
import { EXPRESS_IDS, EXTENDED_NUMBER_IDS } from "./setup";
import type { LehrSprache } from "./sprachen/aktuell";
import { SPRACH_BEREICHE, sprachLevelById, type SprachAreaKey } from "./sprachen/lehrgaenge";

// "noten" ist seit 08.07.2026 KEIN Punktgenau-Bereich mehr (Klangpunkte ist
// ein eigenständiges Programm unter /programme/klangpunkte). Der Schlüssel
// bleibt im Typ: gespeicherte lastPlace-Altwerte dürfen ihn noch enthalten
// (der Resume-Fallback fängt das ab), und Klangpunkte reicht der
// BrailleZeichenliste eine Pseudo-Area mit key "noten".
// ★ Sprachen-Apps (Bauplan 2026-11-06 §4): je Sprache ein EIGENER Bereich, nur mit
// Probe-Schalter `?punktgenau-sprachen=1` sichtbar (`buildAreasFuer`). "fr-voll" =
// Französisch, braille intégral. Die anderen Schlüssel sind für die nächsten Sprachen
// vorgesehen (es it sv nl pt br) und bleiben ungenutzt, bis ihr Lehrgang steht.
export type { SprachAreaKey };
export type AreaKey =
  | "basis" | "voll" | "computer" | "kurzschrift" | "ueb" | "noten"
  | SprachAreaKey;

export interface Area {
  key: AreaKey;
  /** Schalter-Beschriftung. */
  label: string;
  /** Ein-Satz-Charakter des Bereichs (Kopfzeile). */
  blurb: string;
  system: BrailleSystem;
  /** 8-Punkt-Raster (Computerbraille). */
  eightDot: boolean;
  /** Geordnete Etappen-Reihe dieses Bereichs. */
  etappen: Etappe[];
}

/** Etappen aus einem Pool in EXPLIZITER Reihenfolge ziehen (ETAPPEN-Array ist
 *  nicht durchgängig sortiert - die E8a-e Mathe-Zusätze stehen z. B. vorne). */
function byId(ids: string[], pool: readonly Etappe[]): Etappe[] {
  return ids
    .map((id) => pool.find((e) => e.id === id))
    .filter((e): e is Etappe => Boolean(e));
}

// Basisschrift = 14 Etappen in Kniese-Reihenfolge (b1-b14). Die zuschaltbaren
// „erweiterten Zahlen" b13a-b13e stehen NICHT hier (wie bisher nur über
// setup.extendedNumbers / getActiveEtappen sichtbar).
const BASIS_IDS = ["b1", "b2", "b3", "b-suchen", "b4", "b5", "b6", "b7", "b8", "b9", "b10", "b11", "b12", "b-satzzeichen2", "b13", "b-rechnen-plus", "b-rechnen-minus", "b-rechnen-mal", "b14"];
const VOLL_IDS = ["e11", "e12", "e13", "e14", "voll-grenz", "voll-satzzeichen2", "e15"];
const COMPUTER_IDS = ["e16", "e17", "e18", "e19", "e-comp-satz", "e-comp-code", "e-comp-netz", "e-comp-sym", "e20", "e20b"];

/** Zuschaltbare Lernwege (stellt die Lehrkraft je Klasse ein). */
export interface AreaBuildOpts {
  /** Erweiterte Zahlen (röm./Datum/Bruch/%/§) nach der Zahlen-Etappe b13. */
  extendedNumbers?: boolean;
  /** Computer-Strang als Express-Umstieg u1-u8 (statt e16-e20b) - für Kinder,
   *  die die Vollschrift sicher können; übt gezielt die Unterschiede. */
  expressComputer?: boolean;
}

/**
 * Die fünf Bereiche bauen - Standard ohne Optionen; mit Optionen werden die
 * vorbereiteten Zusatz-/Umstiegs-Etappen eingehängt. Die Grund-Didaktik bleibt
 * eingefroren: Optionen fügen nur hinzu bzw. wählen den vorbereiteten
 * Alternativ-Strang, nichts wird umsortiert.
 */
export function buildAreas(opts: AreaBuildOpts = {}): Area[] {
  const basisIds = opts.extendedNumbers
    ? BASIS_IDS.flatMap((id) => (id === "b13" ? ["b13", ...EXTENDED_NUMBER_IDS] : [id]))
    : BASIS_IDS;
  const computerIds = opts.expressComputer ? EXPRESS_IDS : COMPUTER_IDS;
  return [
    {
      key: "basis",
      label: "Basisschrift",
      blurb: "Die sechs Punkte, Buchstabe für Buchstabe bis zum ganzen Text.",
      system: "basis",
      eightDot: false,
      etappen: byId(basisIds, ETAPPEN),
    },
    {
      key: "voll",
      label: "Vollschrift",
      blurb: "Lautgruppen wie ei, au und sch werden zu einer Zelle.",
      system: "voll",
      eightDot: false,
      etappen: byId(VOLL_IDS, ETAPPEN),
    },
    {
      key: "computer",
      label: "Computer",
      blurb: opts.expressComputer
        ? "Express-Umstieg: von der Vollschrift direkt zu den acht Punkten."
        : "Acht Punkte — die Schrift, die der Rechner Zeichen für Zeichen zeigt.",
      system: "computer",
      eightDot: true,
      etappen: byId(computerIds, ETAPPEN),
    },
    {
      key: "kurzschrift",
      label: "Kurzschrift",
      blurb: "Wortkürzungen in neun Welten — die schnelle Schrift der Geübten.",
      system: "voll",
      eightDot: false,
      // Neun Wort-Welten + Striche (additiv, 22.09.2026 - NACH den 48 KFA-
      // Lektionen, VOR der Text-Abschlussetappe; Begründung in
      // kurzschrift_content.ts) + Abschluss-Etappe mit ganzen Texten.
      etappen: [...KURZ_ETAPPEN, ...STRICHE_ETAPPEN, ...GRENZFALL_ETAPPEN, ...byId(["kurz-texte"], ETAPPEN)],
    },
    {
      key: "ueb",
      label: "UEB (Englisch)",
      blurb: "Englisches Braille Grade 2 — der offizielle Lehrgang, Lektion für Lektion.",
      system: "voll",
      eightDot: false,
      etappen: UEB_ETAPPEN,
    },
  ];
}

/** Standard-Bereiche (ohne zuschaltbare Lernwege). */
export const AREAS: Area[] = buildAreas();

/**
 * Die Bereiche der Lehrsprache. Deutsch (und jede Sprache ohne eigenen
 * Lehrgang) liefert genau `buildAreas(opts)` - unverändert. Eine fertige
 * Sprache (heute: fr es) liefert NUR ihren eigenen Bereich: die deutschen
 * Bereiche (Basis, Voll, Computer, Kurzschrift, UEB) lehren deutsches Braille.
 * Neue Sprache: Bereich hier eintragen (Etappen aus `sprachen/<sprache>/lehrgang.ts`).
 */
export function buildAreasFuer(sprache: LehrSprache, opts: AreaBuildOpts = {}): Area[] {
  const eigen = SPRACH_BEREICHE[sprache];
  if (eigen) {
    return [
      {
        key: eigen.key,
        label: eigen.label,
        blurb: eigen.blurb,
        system: "voll",
        eightDot: false,
        etappen: eigen.etappen,
      },
    ];
  }
  return buildAreas(opts);
}

export function areaByKey(key: AreaKey): Area {
  return AREAS.find((a) => a.key === key) ?? AREAS[0];
}

/** Ist diese Etappe eine Kurzschrift-Welt (async de-g2-Lösung im Runner)? */
export function isKurzEtappe(et: Etappe): boolean {
  return et.levelId.startsWith("kurz-");
}

/** Etappen-eigene id für Mastery + Telemetrie (Kurz behält „kurz-…"). */
export function etappeRunId(et: Etappe): string {
  return isKurzEtappe(et) ? et.levelId : et.id;
}

/** Aufgaben-Vorrat der Etappe (Etappen-Filter über den kanonischen Wortpool). */
export function etappeItems(et: Etappe): string[] {
  const pool = (levelById(et.levelId) ?? sprachLevelById(et.levelId))?.items ?? [];
  return [...et.items(pool)];
}

/** Etappe → Level-Objekt für den bewährten LevelRunner/TextLevelRunner. */
export function etappeToLevel(et: Etappe): Level {
  const base = levelById(et.levelId) ?? sprachLevelById(et.levelId);
  // kindOverride: Etappen mit eigenem festen Pool an einem Generator-Level
  // (b13a-e an l6-zahlen) - sonst würfelt der Runner Zufallszahlen statt
  // der Etappen-Items (Befund 2026-07-09).
  const kind: LevelKind = et.kindOverride ?? base?.kind ?? "words";
  return {
    id: etappeRunId(et),
    title: et.title,
    kind,
    system: et.system,
    intro: et.introDu, // „Du"-Ansprache fürs Kind
    legend: et.legend || base?.legend,
    zeichen: et.legend ? et.zeichen : base?.zeichen,
    // ★ `suche` kommt vom Level, nicht von der Etappe - und muss hier
    // MITGENOMMEN werden. Diese Funktion baut ein frisches Level-Objekt; jedes
    // Feld, das hier fehlt, ist im Lehrgang still weg. Genau so war die
    // Suchaufgabe am 23.09. zuerst unsichtbar
    // ([[feedback_zwei_stellen_die_voneinander_nichts_wissen]]).
    suche: base?.suche,
    items: etappeItems(et),
  };
}

export function etappeMasteryOf(et: Etappe, p: BrailleProgress): LevelMastery {
  return getLevelMastery(p, etappeRunId(et));
}

export function isEtappeDone(et: Etappe, p: BrailleProgress): boolean {
  // Text-Etappen haben kein Mastery-Fenster (der TextLevelRunner zählt keine
  // recordAttempt-Versuche) - sie gelten über das completed-Flag als gemeistert
  // (gesetzt nach dem ersten vollständig geschriebenen/gelesenen Text). Ohne
  // diesen Zweig war z. B. e20b für immer gesperrt, weil sein Vorgänger e20
  // (Lesetext) nie „sitzen" konnte (Befund 2026-07-09).
  if (p.levels[etappeRunId(et)]?.completed) return true;
  return isLevelMastered(etappeMasteryOf(et, p));
}

/** Index der ersten noch nicht gemeisterten Etappe (oder der letzten, wenn alle
 *  schon sitzen - dann übt man die letzte einfach weiter). */
export function currentIndex(area: Area, p: BrailleProgress): number {
  const i = area.etappen.findIndex((et) => !isEtappeDone(et, p));
  return i === -1 ? Math.max(0, area.etappen.length - 1) : i;
}

/** Freigeschaltet = erste Etappe oder die vorige ist gemeistert. */
export function isUnlocked(area: Area, index: number, p: BrailleProgress): boolean {
  if (index <= 0) return true;
  const prev = area.etappen[index - 1];
  return prev ? isEtappeDone(prev, p) : true;
}

/** Wie viele Etappen des Bereichs sind gemeistert (für die Fortschrittsanzeige). */
export function doneCount(area: Area, p: BrailleProgress): number {
  return area.etappen.reduce((n, et) => n + (isEtappeDone(et, p) ? 1 : 0), 0);
}
