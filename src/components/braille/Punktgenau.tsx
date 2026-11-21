/**
 * „Punktgenau" — der neue, etappen-getriebene Braille-Trainer.
 *
 * Oberfläche wie der bisherige Trainer (Kopf mit Rang/Sternen, Schalter-Leiste,
 * Übungsbereich), aber mit der NEUEN Didaktik statt des alten Level-Pulldowns:
 *  • fünf Bereiche als Schalter (Basis · Voll · Computer · Kurzschrift · UEB),
 *  • je Bereich eine GEORDNETE Etappen-Reihe mit Lehrtext (Du-Ansprache) und
 *  • Mastery-Gate: die nächste Etappe schaltet erst frei, wenn die aktuelle sitzt.
 *
 * Die Aufgaben-Mechanik kommt unverändert aus dem bewährten LevelRunner/
 * TextLevelRunner (inkl. async Kurzschrift via liblouis de-g2). Punktgenau
 * füttert ihm pro Etappe ein synthetisches Level (siehe lib/braille/areas.ts).
 */
import { altAnzeige } from "@/lib/altTaste";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  loadProgress,
  saveProgress,
  playerLevel,
  getSystemStufe,
  getLevelMastery,
  type BrailleClassSettings,
  type BrailleProgress,
  type TaskEvent,
} from "@/lib/braille";
import { useEigeneGrossschreibzeichen } from "@/lib/braille/eigeneGrossschreibzeichen";
import {
  hatWochenaufgabe,
  wochenstand,
  wochenstandSatz,
  type Wochenaufgabe,
} from "@/lib/braille/wochenaufgabe";
import {
  beginneAufgabe,
  formatUebezeit,
  heutigeUebezeitMs,
  primeUebeUhr,
  uebezeitMs,
  verbucheUebezeit,
} from "@/lib/braille/uebeUhr";
import {
  cpmAusEreignis,
  leseTempoAus,
  naechstesLeseTempo,
  uebezeitFuerEreignis,
} from "@/lib/braille/lesezeit";
import { mitTastenzeit } from "@/lib/tastenuhr";
import {
  holeGesperrteZeitenStand,
  type BrailleGesperrteZeitenStand,
} from "@/lib/braille/sperre";
import { speakUi, speakUiThen } from "@/lib/braille/voice";
import { PUNKTGENAU_ESC, useBraillePlay } from "@/lib/braille/play";
import { pg, usePgSprache } from "@/lib/braille/sprachen/sprache";
import { lehrSprache } from "@/lib/braille/sprachen/aktuell";
import { SPRACH_BEREICHE } from "@/lib/braille/sprachen/lehrgaenge";
import {
  buildAreasFuer,
  currentIndex,
  etappeToLevel,
  isEtappeDone,
  type AreaKey,
} from "@/lib/braille/areas";
import { BrailleZeichenliste } from "./BrailleZeichenliste";
import { PunktgenauEinstellungen } from "./PunktgenauEinstellungen";
import { AbzeichenRegal } from "./AbzeichenRegal";
import { awardAbzeichen } from "@/lib/braille/abzeichen";
import { Modal } from "@/components/Modal";
import { Tipp } from "@/components/Tipp";
import {
  LevelRunner,
  ProgressRing,
  TextLevelRunner,
  type AnnounceCallback,
  type RingInfo,
  type TaskOutcome,
  type TrainerTaskEvent,
} from "./BrailleTrainer";
// ── Zubau 22.09.2026: Braille-Challenge, Klassenmatch, eigene Übungen ────────
// Die Zustandsmaschinen (`challenge.ts`/`klassenmatch.ts`/`eigeneUebung.ts`)
// und die Server-Funktionen (`backend.ts`) bleiben unangetastet - diese Haken
// verdrahten sie nur (Dateihoheit siehe Bericht des bauenden Agenten).
import type { BrailleAccount } from "@/lib/braille/account";
import { useBrailleChallenge } from "./useBrailleChallenge";
import { BrailleChallengeLauf } from "./BrailleChallengeLauf";
import { useBrailleKlassenmatch } from "./useBrailleKlassenmatch";
import { BrailleKlassenmatchEinladung } from "./BrailleKlassenmatchEinladung";
import { BrailleKlassenmatchLauf } from "./BrailleKlassenmatchLauf";
import { BrailleKlassenmatchStarten } from "./BrailleKlassenmatchStarten";
import { BrailleKlassenmatchWahl } from "./BrailleKlassenmatchWahl";
import { useBrailleEigeneUebung } from "./useBrailleEigeneUebung";
import { useBrailleEigeneUebungAnkuendigung } from "./useBrailleEigeneUebungAnkuendigung";
import { BrailleEigeneUebungAnkuendigung } from "./BrailleEigeneUebungAnkuendigung";
import { BrailleEigeneUebungLauf } from "./BrailleEigeneUebungLauf";

/** ARIA-Live: erst leeren, dann verzögert füllen (erzwingt Wiederholung, auch bei
 *  identischem Text — z. B. Alt+W). requestAnimationFrame (~16 ms) ist manchen
 *  Screenreadern (NVDA unter Windows) zu knapp, um Leer- und Füll-Zustand als
 *  zwei getrennte Änderungen zu registrieren — die eigene Sprachausgabe (Web
 *  Speech API) hört das trotzdem, weil sie nicht über die Live-Region läuft.
 *  Ein kurzer setTimeout ist die gängige, robustere Variante (NVDA-Test 2026-07-01). */
function pushLive(set: (s: string) => void, text: string): void {
  set("");
  setTimeout(() => set(text), 50);
}

/**
 * Vorlesen-Schalter + (wenn an) Geschwindigkeit und Stimme — wie bei Tastenflow, aber OHNE Zeichen/Wort/Satz-Auswahl: die passende Stufe ergibt sich
 * automatisch aus dem vorgelesenen Aufgabentext. Aktiver Zustand ist sichtbar
 * (btn-primary), nicht nur per aria-pressed.
 */
// (Die Stimmenliste nur de/en - `VOICE_LANGS` - steht seit 17.10.2026 in
// `BrailleAkustik.tsx`, mit derselben Begründung: die übrigen Systemstimmen
// lesen hier nie vor und müllten die Auswahl nur zu.)

/**
 * ★★★ Erklärungen für JEDES Feld der Kopfleiste (20.09.2026, Johannes:
 * „auf alle Felder dieses Bereiches muss es eine Mouse-over-Erklärung
 * geben"). Wörtlich vorgegeben, Kind-Ansprache (du) - `Punktgenau` reicht
 * bisher nirgends eine „Sie"-Ansprache herein (`address` ist hier fest
 * "du"), darum gibt es keine zweite Fassung.
 */
const KOPFLEISTE_TIPP = {
  rang: "Rang - wie weit du insgesamt gekommen bist. Er wächst mit deinen XP.",
  xp: "XP - 2 für jede gelöste Aufgabe, 30 für eine geschaffte Etappe.",
  sterne: "Sterne - bis zu 3 für jede Etappe, je nachdem wie sicher sie sitzt.",
  stufe:
    "Stufe - wie schwer die Aufgaben gerade sind. Sie passt sich dir an, du stellst sie nicht selbst ein.",
  schreiben: "Schreiben - du bekommst ein Wort und tippst es in Braille.",
  lesen: "Lesen - du bekommst Braille und tippst das Wort in Druckschrift.",
  schrift: "Schrift - welches Braille-System du übst. Alt + 1 bis Alt + 5 springen direkt hin.",
  etappenListe: "Etappe - der Abschnitt, den du gerade übst. Mit Pfeil rauf und runter blätterst du.",
  etappeZurueck: "Eine Etappe zurück",
  etappeWeiter: "Eine Etappe weiter",
  wochenaufgabe: "Wochenaufgabe - was die Lehrkraft dir für diese Woche aufgetragen hat und wie weit du damit bist.",
  abzeichen: "Abzeichen - deine verdienten Medaillen und deine nächsten Ziele.",
  uebezeit: "Heute geübte Zeit. Zählt das Schreiben und Lesen deiner Aufgaben, nicht das Warten dazwischen.",
} as const;

/**
 * ★ Etappennamen in der Liste werden GEKÜRZT (20.09.2026): der Titel trägt
 * oft einen zweiten, erklärenden Halbsatz hinter einem Gedankenstrich
 * („l, a, i, m — die ersten Tastbilder") - in der schmalen Liste wird er
 * ohnehin abgeschnitten. Nur der Teil VOR dem Gedankenstrich bleibt; Titel
 * OHNE einen von Leerzeichen umgebenen Gedankenstrich (z. B. „a–z", eine
 * Buchstaben-Spanne ohne Leerzeichen) bleiben unangetastet. Der volle Titel
 * bleibt überall sonst (Etappen-Einführung, Zeichenliste, Ansagen) stehen -
 * diese Funktion wird NUR für die Liste unten gerufen.
 */
/** Der Hinweistext eines Feldes der Kopfleiste - deutsch aus `KOPFLEISTE_TIPP`, sonst aus `texte/<sprache>.ts`. */
const kopfTipp = (k: keyof typeof KOPFLEISTE_TIPP): string =>
  pg<string>(KOPFLEISTE_TIPP[k], (t) => t.leiste.tipp[k]);

function kurzerEtappenname(title: string): string {
  const treffer = title.match(/^(.+?)\s[–—]\s/);
  return treffer ? treffer[1] : title;
}

/**
 * ★ Die haarfeine Trennlinie zwischen den vier Gruppen der Kopfleiste
 * (Fassung „A - Trennlinien", von Johannes gewählt 20.09.2026). Nur ab `lg`
 * sichtbar: Auf schmalen Geräten blendet die Zeile um (`flex-wrap`), und
 * eine senkrechte Linie am Zeilenende hinge in der Luft (gemessen bei
 * 320 px). `aria-hidden`, damit eine Sprachausgabe sie nicht als Inhalt
 * liest.
 */
function KopfleisteTrenner() {
  return (
    <div
      aria-hidden="true"
      className="hidden h-11 w-px shrink-0 self-center bg-hairline lg:block"
    />
  );
}

// ★ `VoiceControls` (Sprechtempo und Stimme in der Leiste bzw. im
// Einstellungsfenster) ist am 17.10.2026 entfallen: Ton und Vorlesen stehen nur
// noch im Menü unter dem Lautsprecher (`components/braille/BrailleAkustik.tsx`).

export function Punktgenau({
  loadFn = loadProgress,
  saveFn = saveProgress,
  onTask,
  classSettings,
  accountId,
  classCode,
  ohneKlasse = false,
  events,
  account = null,
}: {
  loadFn?: () => BrailleProgress;
  saveFn?: (p: BrailleProgress) => void;
  /**
   * Jede gelöste Aufgabe, wie `BrailleTrainer.tsx` sie meldet - seit
   * 22.09.2026 (Nacht) mit `activeMs` ANGEREICHERT (`meldeAufgabe` unten,
   * `mitTastenzeit`/`lib/tastenuhr.ts`), BEVOR sie hier ankommt: Ohne
   * angeschlossene Tastenuhr (z. B. in dieser Datei ausserhalb von
   * `PunktgenauPage.tsx`, siehe `reichweiteApp.ts`) bleibt das Feld einfach
   * unbesetzt, genau wie vorher.
   */
  onTask?: (e: TrainerTaskEvent) => void;
  /** Lern-Einstellungen der Klasse (stellt die Lehrkraft ein); ohne Konto/
   *  Klasse: Standard-Lernweg mit Freischalt-Gate. */
  classSettings?: BrailleClassSettings | null;
  /** Konto-id - entscheidet, ob für DIESES Kind etwas Eigenes eingetragen ist
   *  (Wochenaufgabe, Etappen-Freigabe). Ohne Konto gilt der Klassen-Plan bzw.
   *  gar keiner. */
  accountId?: string;
  /**
   * ★★★ Klassencode - NUR für die gesperrten Unterrichtsstunden der Klasse
   * (22.09.2026, siehe „STUNDE GESPERRT WIRKT AUCH BEIM KIND" unten). Fehlt
   * er (kein Konto, keine Klasse, Selbstlernende), gibt es keine Sperre zu
   * laden - `holeGesperrteZeitenStand` behandelt das selbst (siehe dort).
   */
  classCode?: string;
  /**
   * Gehört diese Person zu KEINER Klasse? Gilt für alle, die gar nicht
   * angemeldet sind, ein selbstlernendes Konto haben, Lehrkraft oder
   * Studierende sind. Die SEITE entscheidet das (sie kennt das Konto), nicht
   * diese Komponente. Fehlt die Prop, gilt „gehört zu einer Klasse" (wie
   * bisher).
   *
   * ★ EIN Name für ZWEI Folgen (20.09.2026, Johannes): dieselbe Bedingung
   * entschied bisher unter zwei getrennten Namen dasselbe und drohte damit,
   * irgendwann auseinanderzulaufen [[feedback_zwei_stellen_die_voneinander_nichts_wissen]] -
   * genau der Fehler, den es hier schon gab. Die Prop hieß bis zum
   * Umbenennen `freieEtappenwahl` und trug nur Folge 1; jetzt trägt sie
   * beide:
   *  1. Etappen ohne Reihenfolge-Sperre (freie Wahl statt Freischalt-Gate).
   *  2. Großschreibzeichen: die eigene, selbst gespeicherte Einstellung
   *     statt der Klassen-Einstellung der Lehrkraft gilt.
   */
  ohneKlasse?: boolean;
  /** Bisherige Aufgaben des Kindes - nur für den Stand der Wochenaufgabe.
   *  Beim Üben ohne Konto leer; die laufende Sitzung zählt live dazu. */
  events?: readonly TaskEvent[];
  /**
   * ★★★ ZUBAU 22.09.2026 (Braille-Challenge, Klassenmatch, eigene Übungen):
   * das VOLLE Konto - `accountId` allein reicht nicht, das Klassenmatch
   * braucht zusätzlich den Namen (`BrailleMatch.hostName`/`BrailleMatchStand.name`,
   * siehe `klassenmatch.ts`). Fehlt diese Prop (Vorgabe `null`), bleibt vom
   * Zubau nur die Braille-Challenge nutzbar (sie braucht nur `accountId`) -
   * Klassenmatch bietet sich dann nicht an. `PunktgenauPage.tsx` reicht das
   * Konto bisher NICHT durch (ausserhalb der Dateihoheit dieses Baus,
   * siehe Bericht) - ohne diese Ergänzung bleibt Klassenmatch für echte
   * Kinder unerreichbar, obwohl der Code dafür steht.
   */
  account?: BrailleAccount | null;
} = {}) {
  // ★ Sprachen-Apps: Deutsch (Probe-Schalter aus) bleibt der alte Weg. Mit Schalter
  //   `?punktgenau-sprachen=1` und gewählter Sprache (fr) gilt deren eigener Bereich.
  const sprache = usePgSprache();
  const [progress, setProgress] = useState<BrailleProgress>(() => loadFn());
  // Synchroner Spiegel des Spielstands: alle Schreib-Pfade lesen hierüber,
  // damit zwei Persists kurz nacheinander (z. B. Aufgaben-Wertung während der
  // verzögerten Richtungs-Ansage) nicht mit veraltetem Closure-Stand
  // überschreiben (K9-Muster der Plattform, Befund 2026-07-09).
  const progressRef = useRef(progress);
  const [areaKey, setAreaKey] = useState<AreaKey>(() => {
    // Alte Spielstände können area "noten" enthalten (Klangpunkte ist seit
    // 08.07. ein eigenes Programm) — auf einen echten Bereich zurückfallen,
    // sonst zeigt das Schrift-Pulldown eine leere Auswahl.
    const saved = progress.lastPlace?.area;
    // Ein gemerkter Sprach-Bereich ("fr-voll") gilt nur in seiner Sprache; die
    // Oberflächensprache entscheidet (fr: immer der französische Bereich).
    const eigen = SPRACH_BEREICHE[lehrSprache()];
    if (eigen) return eigen.key;
    return saved && saved !== "noten" && !saved.endsWith("-voll") ? saved : "basis";
  });
  // Bereiche nach Klassen-Einstellungen bauen (erweiterte Zahlen, Express).
  // classSettings ist über die Lebensdauer der Komponente stabil (der
  // Konto-Wrapper lädt sie VOR dem Mount) — useMemo genügt.
  const areas = useMemo(
    () =>
      buildAreasFuer(lehrSprache(), {
        extendedNumbers: classSettings?.extendedNumbers,
        expressComputer: classSettings?.expressComputer,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `sprache` ändert den Inhalt über `lehrSprache()`
    [classSettings?.extendedNumbers, classSettings?.expressComputer, sprache],
  );
  /**
   * ★★★ ALLE ETAPPEN SIND FÜR ALLE OFFEN (Johannes 18.11.2026).
   *
   * „Wir wollen die Kapitel in allen Brailleschriftsystemen freischalten, jeder
   * soll sich das einstellen können, aber trotzdem wie bisher weiterarbeiten
   * können." Die Etappenliste sperrt nichts mehr; der Lernweg (Weiter-Knopf,
   * „Wo war ich?") läuft unverändert an `currentIndex` entlang. Darum gibt es
   * weder die Klassen-Einstellung „Etappen frei wählbar" noch die Freigabe je
   * Kapitel in der Lehrkraft-Verwaltung.
   */

  /**
   * ★★★ WAS DIE LEHRKRAFT FÜR DIESES KIND EINGETRAGEN HAT (07.09.2026).
   *
   * Zwei Ebenen, und die engere gewinnt: Steht für das Kind etwas Eigenes da,
   * gilt das; sonst der Plan der ganzen Klasse. Fehlt beides, ändert sich
   * nichts - Punktgenau verhält sich dann exakt wie vorher.
   */
  const plan = classSettings?.punktgenau;
  const kindplan = accountId ? plan?.kinder?.[accountId] : undefined;
  const wochenaufgabe: Wochenaufgabe | undefined =
    kindplan?.wochenaufgabe ?? plan?.wochenaufgabe;

  /**
   * ★★★ WESSEN GROSSSCHREIBZEICHEN-EINSTELLUNG GILT? (Johannes 20.09.2026)
   *
   * „Wer nicht angemeldet ist oder selbst übt, darf immer alles selbst
   * einstellen. Schüler einer Klasse werden von den Lehrkräften eingestellt."
   *
   * Genau dieselbe Unterscheidung wie bei der freien Etappenwahl oben, darum
   * auch dieselbe Prop (`ohneKlasse`): EINE Stelle rechnet das Ergebnis aus,
   * alle Runner unten lesen nur noch diesen Wert.
   *  - `ohneKlasse`: die eigene, im Browser gespeicherte Einstellung
   *    (`eigeneGrossschreibzeichen.ts`, Standard AN).
   *  - Kind in einer Klasse: die Klassen-Einstellung der Lehrkraft, wie
   *    bisher (fehlt sie, gilt AN).
   */
  const eigenesGrossschreibzeichen = useEigeneGrossschreibzeichen(
    (s) => s.grossschreibzeichen,
  );
  const toggleEigenesGrossschreibzeichen = useEigeneGrossschreibzeichen(
    (s) => s.toggleGrossschreibzeichen,
  );
  const grossschreibzeichen = ohneKlasse
    ? eigenesGrossschreibzeichen
    : classSettings?.grossschreibzeichen !== false;

  const [direction, setDirection] = useState<"write" | "read">(
    () => progress.lastPlace?.direction ?? "write",
  );
  // ★ Töne, Fehler-Tipp und Vorlesen stellt seit 17.10.2026 nur noch das Menü
  //   unter dem Lautsprecher ein (`BrailleAkustik`) - hier kein Zustand mehr.
  const [toast, setToast] = useState("");

  const area = areas.find((a) => a.key === areaKey) ?? areas[0];
  // Aktive Etappe: beim Bereichswechsel auf die erste offene springen. Beim
  // allerersten Mount zuerst versuchen, die zuletzt geübte Etappe wieder-
  // zufinden (per id — Etappenreihen können sich je Klassen-Einstellung
  // ändern); nicht mehr vorhandene ids fallen sauber auf currentIndex() zurück.
  const [activeIndex, setActiveIndex] = useState<number>(() => {
    const savedId = progress.lastPlace?.etappeId;
    if (savedId) {
      const idx = area.etappen.findIndex((et) => et.id === savedId);
      if (idx !== -1) return idx;
    }
    return currentIndex(area, progress);
  });

  // ARIA-Live-Kanäle (immer gemountet, nie bedingt).
  const [taskMsg, setTaskMsg] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [alertMsg, setAlertMsg] = useState("");
  const [liveLang, setLiveLang] = useState<string>("de");
  const announce: AnnounceCallback = ({ channel, text, brailleText, lang, voice, spoken }) => {
    // brailleText: echte Braillezeichen NUR für die Live-Region (tastbar auf
    // der Zeile); voice:false = das Panel spricht selbst (Lese-Sequenzen).
    const liveText = brailleText ? `${text} ${brailleText}` : text;
    if (channel === "task") {
      pushLive(setTaskMsg, liveText);
      // ★ Übezeit-Uhr (22.09.2026 Abend): JEDE neu angesagte Aufgabe startet
      //   den provisorischen „läuft gerade"-Posten der Uhr neu (`uebeUhr.ts`
      //   Dateikopf) - so tickt die Anzeige sichtbar, statt nur bei jeder
      //   abgegebenen Antwort zu springen. `meldeAufgabe` beendet ihn wieder,
      //   sobald die Aufgabe fertig ist.
      beginneAufgabe();
    } else if (channel === "status") pushLive(setStatusMsg, liveText);
    else pushLive(setAlertMsg, liveText);
    setLiveLang(lang ?? lehrSprache());
    if (voice !== false) speakUi(spoken ?? text, lang);
  };

  const persist = (p: BrailleProgress) => {
    progressRef.current = p; // synchron — Folge-Persists im selben Tick bauen darauf auf
    setProgress(p);
    saveFn(p);
  };

  // Resume: merkt sich Bereich+Etappe+Richtung fürs nächste Öffnen (anonym
  // über localStorage, mit Konto über den Server — beides läuft schon über
  // persist()/saveFn(), kein neuer Speicherweg).
  const persistPlace = (key: AreaKey, idx: number, dir: "write" | "read") => {
    const a = areas.find((x) => x.key === key) ?? areas[0];
    const etappeId = a.etappen[idx]?.id;
    if (!etappeId) return;
    persist({ ...progressRef.current, lastPlace: { area: key, etappeId, direction: dir } });
  };

  const selectArea = (key: AreaKey) => {
    const a = areas.find((x) => x.key === key) ?? areas[0];
    const idx = currentIndex(a, progress);
    setAreaKey(key);
    setActiveIndex(idx);
    setToast("");
    persistPlace(key, idx, direction);
    // Hörbar machen, WO man gelandet ist (der Bereichswechsel springt still
    // auf die aktuelle Etappe des neuen Bereichs — Befund 2026-07-02).
    const et2 = a.etappen[idx];
    announce({
      channel: "status",
      text: pg(
        `${a.label}, Etappe ${idx + 1} von ${a.etappen.length}${et2 ? `: ${et2.title}` : ""}.`,
        (t) => t.leiste.bereichAnsage(a.label, idx + 1, a.etappen.length, et2?.title),
      ),
    });
  };

  const selectEtappe = (i: number) => {
    if (i < 0 || i >= area.etappen.length) return;
    setActiveIndex(i);
    setToast("");
    persistPlace(areaKey, i, direction);
  };

  const et = area.etappen[activeIndex];
  const level = et ? etappeToLevel(et) : null;
  // Kurzschrift erlaubt jetzt auch Lesen (ReadPanel zeigt die de-g2-Anzeige).
  const dir: "write" | "read" = direction;

  // Rang + Sterne (Spielstand-übergreifend).
  const pl = playerLevel(progress.xp);
  const totalStars = Object.values(progress.levels).reduce(
    (s, r) => s + (r.bestStars ?? 0),
    0,
  );

  // Neu verdiente Abzeichen ansagen (nie beim stillen Nachtrag - der liefert
  // bewusst eine leere Liste, siehe `awardAbzeichen`/„KATALOG_VERSION").
  const meldeNeueAbzeichen = (neu: { name: string; description: string }[]) => {
    for (const b of neu) speakUi(pg(`Neues Abzeichen: ${b.name}. ${b.description}`, (t) => t.leiste.neuesAbzeichen(b.name, b.description)));
  };

  // Ein Aufgaben-Ergebnis verbuchen (wie im alten Trainer, aber je Etappe-eigene id).
  /**
   * ★★★ ZUBAU 22.09.2026: `ctx` ist NEU und OPTIONAL - ohne ihn verhält sich
   * diese Funktion GENAU wie vorher (Etappe/Bereich/Richtung der aktuell
   * BESUCHTEN Etappe). Mit `ctx` verbucht sie das Ergebnis einer ANDEREN
   * Etappe - das Klassenmatch lässt jedes Kind auf SEINEM eigenen Stand
   * schreiben (`BrailleKlassenmatchLauf.tsx`), und das ist meist nicht die
   * Etappe, die gerade auf dem Bildschirm steht. Dieselbe Persistenz statt
   * einer zweiten Abschrift ([[feedback_zwei_stellen_die_voneinander_nichts_wissen]]).
   */
  const applyResult = (
    r: TaskOutcome,
    ctx?: { levelId: string; areaKey: AreaKey; direction: "write" | "read"; isLast: boolean },
  ) => {
    if (!ctx && !level) return;
    const id = ctx?.levelId ?? level!.id;
    const areaKey = ctx?.areaKey ?? area.key;
    const richtung = ctx?.direction ?? direction;
    const p = progressRef.current;
    const prev = p.levels[id];
    // Meister-Bonus höchstens EINMAL je Etappe — Doppelschutz zusätzlich zum
    // Runner (everMastered), gegen die XP-Farm von 2026-07-09.
    const firstMaster = r.masteredNow && !prev?.completed;
    const jetzt = Date.now();
    const next: BrailleProgress = {
      ...p,
      xp: p.xp + (r.correct ? 2 : 0) + (firstMaster ? 30 : 0),
      levels: r.masteredNow
        ? {
            ...p.levels,
            [id]: {
              completed: true,
              bestStars: Math.max(prev?.bestStars ?? 0, r.stars),
              attempts: (prev?.attempts ?? 0) + 1,
            },
          }
        : p.levels,
      mastery: { ...(p.mastery ?? {}), [id]: r.mastery },
      // Stufe je BEREICH (nicht je Schriftsystem): Voll, Kurzschrift und UEB
      // teilen system "voll" — mit dem System-Key rissen UEB-Fehler die
      // Vollschrift-Stufe mit herunter (Befund 2026-07-09; die Hilfe verspricht
      // eine eigene Stufe je Bereich).
      stufen: { ...(p.stufen ?? {}), [areaKey]: r.stufe },
      // ★ WANN gemeistert - nur beim ERSTEN Mal (siehe `gemeistertAm` in
      //   progress.ts). Ohne diese Zahl lässt sich „Etappen diese Woche" nicht
      //   beantworten, und das ist eine der drei Zahlen der Wochenaufgabe.
      gemeistertAm: firstMaster
        ? { ...(p.gemeistertAm ?? {}), [id]: jetzt }
        : p.gemeistertAm,
    };
    // Abzeichen NACH dem Fortschreiben des Spielstands auswerten (Schritt 3,
    // Auftrag Abzeichen 22.09.2026) - sonst sähen "Etappen gemeistert"/"Sterne
    // gesamt" den Stand VOR dieser Aufgabe. `firstMaster` reicht als Etappen-
    // Meisterung; „fehlerfrei" nur, wenn das ganze Übungs-Fenster stimmte.
    const { progress: mitAbzeichen, neu } = awardAbzeichen(
      next,
      {
        areaKey,
        richtung,
        aufgabeRichtig: r.correct,
        etappeGemeistert: firstMaster,
        fehlerfreiGemeistert: firstMaster ? r.mastery.window.every((a) => a.correct) : undefined,
      },
      jetzt,
      areas,
    );
    persist(mitAbzeichen);
    if (firstMaster) {
      const isLast = ctx?.isLast ?? activeIndex >= area.etappen.length - 1;
      setToast(
        pg(
          `Punktgenau! +30 XP${isLast ? " · Bereich geschafft!" : " · nächste Etappe frei"}`,
          (t) => t.leiste.geschafft(isLast),
        ),
      );
    }
    meldeNeueAbzeichen(neu);
  };

  // Text-Etappen (b14/e15/e20/e20b/kurz-texte) haben kein Mastery-Fenster —
  // ein vollständig geschriebener bzw. fehlerfrei gelesener Text schließt die
  // Etappe ab (completed) und schaltet damit die nächste frei. Vorher war z. B.
  // e20b für immer gesperrt (Befund 2026-07-09).
  /** ★★★ ZUBAU 22.09.2026: `ctx` optional - siehe `applyResult` oben. */
  const applyTextComplete = (ctx?: {
    levelId: string;
    areaKey: AreaKey;
    direction: "write" | "read";
    isLast: boolean;
  }) => {
    if (!ctx && !level) return;
    const id = ctx?.levelId ?? level!.id;
    const areaKey = ctx?.areaKey ?? area.key;
    const richtung = ctx?.direction ?? direction;
    const p = progressRef.current;
    const prev = p.levels[id];
    const first = !prev?.completed;
    const jetzt = Date.now();
    const next: BrailleProgress = {
      ...p,
      xp: p.xp + 2 + (first ? 30 : 0),
      levels: {
        ...p.levels,
        [id]: {
          completed: true,
          bestStars: prev?.bestStars ?? 0,
          attempts: (prev?.attempts ?? 0) + 1,
        },
      },
      // ★ Wie in `applyResult`: Text-Etappen sind Etappen und zählen für die
      //   Wochenaufgabe genauso mit.
      gemeistertAm: first
        ? { ...(p.gemeistertAm ?? {}), [id]: jetzt }
        : p.gemeistertAm,
    };
    // Text-Etappen haben kein Übungs-Fenster (s. Dateikopf oben) - darum bleibt
    // `fehlerfreiGemeistert` hier unbesetzt: lieber keine Zahl als eine
    // erfundene (die Familie „Fehlerfrei" zählt bei ihnen ehrlich nicht mit).
    const { progress: mitAbzeichen, neu } = awardAbzeichen(
      next,
      { areaKey, richtung, etappeGemeistert: first },
      jetzt,
      areas,
    );
    persist(mitAbzeichen);
    if (first) {
      const isLast = ctx?.isLast ?? activeIndex >= area.etappen.length - 1;
      setToast(
        pg(
          `Punktgenau! +30 XP${isLast ? " · Bereich geschafft!" : " · nächste Etappe frei"}`,
          (t) => t.leiste.geschafft(isLast),
        ),
      );
    }
    meldeNeueAbzeichen(neu);
  };

  const [ring, setRing] = useState<RingInfo | null>(null);

  // ══════════════════════════════════════════════════════════════════════
  // ZUBAU 22.09.2026: BRAILLE-CHALLENGE, KLASSENMATCH, EIGENE ÜBUNGEN
  // ══════════════════════════════════════════════════════════════════════
  // Reihenfolge, wenn mehreres gleichzeitig ansteht (Vorbild
  // `TippenTrainerPage.tsx`, dort ausführlich begründet):
  //   1. Braille-Challenge (Prüfung) - geht allem vor.
  //   2. Klassenmatch, dem dieses Kind schon beigetreten ist/das es
  //      ausgeschrieben hat - ein verabredetes Spiel geht der Bücherei vor.
  //   3. Das Ankündigungsfenster der eigenen Übung - wartet, solange 1./2. laufen.
  //   4. Die eigene Übung selbst.
  //   5. Das gewöhnliche Üben.
  // Eine EINLADUNG (noch nicht angenommen) ist kein Bildschirm-Übernehmer,
  // sondern ein Fenster ÜBER der Seite - sie bleibt darum ausserhalb dieser
  // Rangfolge und wird unten separat gerendert (wie die Zeichenliste).
  const challenge = useBrailleChallenge(account, classSettings);
  const klassenmatch = useBrailleKlassenmatch(account, classSettings);
  const eigeneUebung = useBrailleEigeneUebung(account);
  const [zeigeKlassenmatchStarten, setZeigeKlassenmatchStarten] = useState(false);
  // ★ 02.10.2026: Warum ausschreiben/beitreten nicht ging, wird EINMAL gemeldet
  // und gesprochen (`announce` = Live-Region + Vorlesen) - je neuer Satz, nicht
  // je Rendern. Im Fenster „Klassenmatch ausschreiben" zeigt das Fenster ihn selbst.
  const gemeldeterMatchSatz = useRef("");
  useEffect(() => {
    const satz = klassenmatch.meldung;
    if (!satz) {
      gemeldeterMatchSatz.current = "";
      return;
    }
    if (zeigeKlassenmatchStarten || satz === gemeldeterMatchSatz.current) return;
    gemeldeterMatchSatz.current = satz;
    announce({ channel: "alert", text: satz });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [klassenmatch.meldung, zeigeKlassenmatchStarten]);
  const eigeneUebungAnkuendigung = useBrailleEigeneUebungAnkuendigung({
    dran: eigeneUebung.dran,
    zeiger: eigeneUebung.zeiger,
    gesperrt: challenge.dran || klassenmatch.meinMatch !== null,
    angekuendigt: eigeneUebung.angekuendigt,
    merkeBestaetigt: eigeneUebung.bestaetigeAnkuendigung,
  });

  // Alt+L — Zeichenliste (alle Zeichen/Kürzungen des Bereichs) öffnen/schließen.
  // Kommt als Nonce aus dem Play-Store (die Seite fängt das Kürzel global ab).
  const charsNonce = useBraillePlay((s) => s.charsNonce);
  const [showZeichen, setShowZeichen] = useState(false);
  // Öffnen/Schließen hörbar machen (Knopf, Alt+L und Escape/Schließen-Knopf
  // laufen alle hier durch). Screenreader melden Dialog bzw. aria-pressed selbst.
  const toggleZeichen = (next: boolean) => {
    setShowZeichen(next);
    speakUi(pg(next ? "Zeichenliste geöffnet." : "Zeichenliste geschlossen.", (t) => t.leiste.zeichenlisteAnsage(next)));
  };
  const prevCharsRef = useRef(0);
  useEffect(() => {
    if (charsNonce === 0 || charsNonce === prevCharsRef.current) return;
    prevCharsRef.current = charsNonce;
    toggleZeichen(!showZeichen);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [charsNonce]);
  // Offen-Status in den Store spiegeln (Dialog-Guard der Seiten-Kürzel).
  useEffect(() => {
    useBraillePlay.getState().setCharsOpen(showZeichen);
    return () => useBraillePlay.getState().setCharsOpen(false);
  }, [showZeichen]);

  /**
   * Alt+O — Einstellungen (Schriftsystem, Sounds, Fehler-Tipp, Vorlesen)
   * öffnen/schließen. Dasselbe Nonce-Muster wie Alt+L oben: Das Zahnrad sitzt
   * in der Kopfzeile (`PunktgenauPage`), der Zustand bleibt hier — Charge
   * „SCHLANK" (20.09.2026), Leiste 2 ist damit weg.
   */
  const settingsNonce = useBraillePlay((s) => s.settingsNonce);
  const [showSettings, setShowSettings] = useState(false);
  const toggleSettings = (next: boolean) => {
    setShowSettings(next);
    speakUi(pg(next ? "Einstellungen geöffnet." : "Einstellungen geschlossen.", (t) => t.leiste.einstellungenAnsage(next)));
  };
  const prevSettingsRef = useRef(0);
  useEffect(() => {
    if (settingsNonce === 0 || settingsNonce === prevSettingsRef.current) return;
    prevSettingsRef.current = settingsNonce;
    toggleSettings(!showSettings);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settingsNonce]);
  useEffect(() => {
    useBraillePlay.getState().setSettingsOpen(showSettings);
    return () => useBraillePlay.getState().setSettingsOpen(false);
  }, [showSettings]);

  /**
   * Abzeichen-Regal (Auftrag Abzeichen, 22.09.2026) - vorerst nur über einen
   * eigenen Knopf in der Kopfleiste erreichbar (Schritt 4), noch ohne
   * Alt-Kürzel/Nonce wie Zeichenliste/Einstellungen. `Modal` (gemeinsamer
   * Baustein) bringt Fokus-Falle und Escape schon mit - kein eigener Code nötig.
   */
  const [showAbzeichen, setShowAbzeichen] = useState(false);
  const toggleAbzeichen = (next: boolean) => {
    setShowAbzeichen(next);
    speakUi(pg(next ? "Abzeichen geöffnet." : "Abzeichen geschlossen.", (t) => t.leiste.abzeichenAnsage(next)));
  };

  /**
   * ★★★ Escape schliesst AUCH die Zeichenliste UND die Einstellungen
   * (07.09.2026, Einstellungen dazu am 20.09.2026).
   *
   * Beide sind eigene Fenster mit eigenem Zustand - die Seite kann sie nicht
   * zumachen, ohne ihn zu kennen. Statt den Zustand nach oben zu heben (und
   * damit zwei Stellen zu haben, die ihn fuehren), hoert dieser Baustein
   * selbst auf das Escape-Ereignis der Seite. Der Fokus geht die Seite an:
   * Sie ruft danach `requestFocusInput()`.
   *
   * ⚠️ Ohne die showZeichen-/showSettings-Pruefung spraeche die App bei JEDEM
   * Escape „… geschlossen." - auch wenn gar nichts offen war.
   */
  useEffect(() => {
    const zu = () => {
      if (useBraillePlay.getState().charsOpen) toggleZeichen(false);
      if (useBraillePlay.getState().settingsOpen) toggleSettings(false);
    };
    window.addEventListener(PUNKTGENAU_ESC, zu);
    return () => window.removeEventListener(PUNKTGENAU_ESC, zu);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Alt+Z — Runden-Anzeige ansagen + fokussieren („wie lange geht die Übung
  // noch", wie „Zeile X von Y" in Tastenflow). Danach springt Esc auf der
  // Anzeige zurück ins Eingabefeld (RoundTicks fängt das ab).
  const roundNonce = useBraillePlay((s) => s.roundNonce);
  const ringRef = useRef<RingInfo | null>(ring);
  ringRef.current = ring;
  const prevRoundRef = useRef(0);
  useEffect(() => {
    if (roundNonce === 0 || roundNonce === prevRoundRef.current) return;
    prevRoundRef.current = roundNonce;
    const el = document.getElementById("pl-round-ticks");
    const label = ringRef.current?.round?.label;
    if (!el || !label) return;
    el.focus({ preventScroll: true });
    // ⚠️ KEIN `behavior: "smooth"` (29.09.2026): Ein ausdrückliches „smooth"
    // übergeht „weniger Bewegung" - die Regel in `index.css` schaltet nur das
    // CSS-`scroll-behavior` ab. Ohne Angabe folgt der Sprung dieser Regel
    // (weich, ausser bei „weniger Bewegung"). Wächter: tests/braille-fokus-und-bewegung.test.ts.
    el.scrollIntoView({ block: "nearest" });
    // Für Lernende ohne Screenreader (Vorlesen) hörbar machen; Screenreader
    // liest die aria-label der fokussierten Anzeige ohnehin selbst.
    speakUi(label);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundNonce]);

  // Alt+1…5 — Bereich (Schriftsystem) direkt wählen (Johannes 2026-07-02:
  // „Brailleschriftsysteme können nicht gut umgestellt werden").
  const areaRequest = useBraillePlay((s) => s.areaRequest);
  const prevAreaNonceRef = useRef(0);
  useEffect(() => {
    if (!areaRequest || areaRequest.nonce === prevAreaNonceRef.current) return;
    prevAreaNonceRef.current = areaRequest.nonce;
    const key = areaRequest.key as AreaKey;
    if (areas.some((a) => a.key === key)) selectArea(key);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [areaRequest]);

  // Alt+U — Fokus ins Kapitel-Auswahlfeld springen (bis 30.08.2026 Alt+K); von dort blättert man mit
  // Pfeil rauf/runter direkt durch die Etappen (Johannes 03.07.).
  const focusEtappeNonce = useBraillePlay((s) => s.focusEtappeNonce);
  const etappeSelectRef = useRef<HTMLSelectElement>(null);
  const prevFocusEtappeRef = useRef(0);
  useEffect(() => {
    if (focusEtappeNonce === 0 || focusEtappeNonce === prevFocusEtappeRef.current) return;
    prevFocusEtappeRef.current = focusEtappeNonce;
    etappeSelectRef.current?.focus();
    announce({
      channel: "status",
      text: pg("Kapitel-Auswahl. Mit Pfeil rauf und runter blätterst du durch die Etappen.", (t) => t.leiste.kapitelAuswahlAnsage),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusEtappeNonce]);

  const hasNext = activeIndex < area.etappen.length - 1;
  const goNext = () => selectEtappe(activeIndex + 1);

  // Pfeiltasten-Navigation für die Übungsrichtung-Radiogruppe (Schreiben/Lesen)
  // — EIN Gruppen-Stopp mit Pfeiltasten statt eines Tab-Stopps je Option, wie es
  // das ARIA-Radiogroup-Muster verlangt. Die Bereiche sind jetzt ein Pulldown
  // (Johannes 03.07.), das seine Pfeiltasten-Navigation selbst mitbringt.

  // Richtungswechsel hörbar machen: erst „Schreiben."/„Lesen." sprechen, DANN
  // umschalten — der Wechsel remountet das Panel, das sofort die neue Aufgabe
  // ansagt und die Zustands-Ansage sonst per cancel() abwürgen würde. Für
  // Screenreader reicht der Radio-Zustand (aria-checked), keine Live-Region.
  const selectDirection = (next: "write" | "read") => {
    if (next === direction) return;
    speakUiThen(pg(next === "write" ? "Schreiben." : "Lesen.", (t) => (next === "write" ? t.leiste.schreibenAnsage : t.leiste.lesenAnsage)), () => {
      setDirection(next);
      persistPlace(areaKey, activeIndex, next);
    });
  };

  /**
   * ★★★ DER STAND DER WOCHENAUFGABE - für das Kind (07.09.2026).
   *
   * Eine Aufgabe, die nur die Lehrkraft sieht, ist keine Aufgabe. Sie steht
   * darum in der obersten Leiste, gleich neben Rang und Etappe.
   *
   * ⚠️ Die gespeicherten Aufgaben (`events`) kennen die laufende Sitzung noch
   * nicht - sie werden beim Öffnen EINMAL geladen. Was ein Kind gerade eben
   * geübt hat, kommt darum aus `sitzungsEvents` dazu: Sonst stünde nach zehn
   * Aufgaben immer noch „0 von 20", und das Kind hielte die Anzeige für kaputt.
   */
  const [sitzungsEvents, setSitzungsEvents] = useState<TaskEvent[]>([]);
  /**
   * Jede Aufgabe geht an den Aufrufer (der sie speichert) UND in die
   * Sitzungs-Liste. Bewusst DIESELBE Meldung, nicht zwei Zählungen: Der
   * Zeitstempel entsteht hier genau einmal.
   *
   * ★★★★★ SEIT 22.09.2026 (Nacht, DECKEL): diese Funktion verbucht die für
   * DIESE Aufgabe gerechnete Übezeit direkt in der Uhr
   * ({@link verbucheUebezeit}, `uebeUhr.ts`) und lernt bei einer selbst
   * gelesenen Aufgabe das persönliche Lesetempo dazu (`lib/braille/lesezeit.ts`)
   * - dieselbe EINE Rechnung, die auch Wochenaufgabe/Statistik/
   * Lehrkraft-Tabelle benutzen.
   *
   * ⚠️ `activeMs` wird HIER angehängt (`mitTastenzeit`, `lib/tastenuhr.ts`) -
   * NICHT erst beim Speichern (`pbBackend.ts`, `recordEvent`). Sonst sähe die
   * tickende Uhr oben (rechnet SOFORT mit dem Ereignis, siehe unten) eine
   * andere - ungedeckelte - Zahl als die Wochenaufgabe/Statistik, die aus dem
   * GESPEICHERTEN Ereignis rechnen: „Die Uhr oben muss dieselbe Zahl zeigen"
   * (Auftrag 22.09.2026). `mitTastenzeit` ist idempotent (überspringt ein
   * schon gesetztes `activeMs`) - ein zweiter Aufruf beim Speichern schadet
   * darum nicht, liest aber auch nichts mehr nach.
   */
  const meldeAufgabe = (e: TrainerTaskEvent) => {
    const ereignis = mitTastenzeit(e);
    const cpm = leseTempoAus(progressRef.current);
    // ★ Übezeit-Uhr: verbucht die gerechnete Übezeit dieser Aufgabe endgültig
    //   und beendet damit den provisorischen „läuft gerade"-Posten - die
    //   nächste Aufgabe startet ihn neu, sobald sie angesagt wird (`announce`,
    //   `channel: "task"`, siehe `beginneAufgabe` unten).
    verbucheUebezeit(uebezeitFuerEreignis(ereignis, cpm));
    // ★ Lesetempo lernen (Johannes 22.09.2026: „lerne die Lesegeschwindigkeit
    //   des Schülers"): NUR aus selbst gelesenen Aufgaben (kein `spokenMs`) -
    //   `cpmAusEreignis` liefert `null`, wenn sich daraus nichts Verlässliches
    //   lernen lässt (siehe `lesezeit.ts`); eine vorgelesene Aufgabe verändert
    //   das gelernte Tempo nicht. `activeMs` spielt dabei bewusst KEINE Rolle
    //   (Begründung: `lesezeit.ts`, Kommentar über `cpmAusEreignis`).
    const gemessen = cpmAusEreignis(ereignis);
    if (gemessen !== null) {
      persist({
        ...progressRef.current,
        leseTempoCpm: naechstesLeseTempo(progressRef.current.leseTempoCpm, gemessen),
      });
    }
    onTask?.(ereignis);
    if (hatWochenaufgabe(wochenaufgabe))
      setSitzungsEvents((alt) => [...alt, { ts: Date.now(), ...ereignis }]);
  };
  /**
   * ★★★ STUNDE GESPERRT WIRKT AUCH BEIM KIND (22.09.2026, Befund: der
   * Lehrkraft-Reiter sperrt eine Unterrichtsstunde für die Wochenaufgabe,
   * `wochenstand()` nimmt den `gesperrt`-Parameter seit kurzem entgegen -
   * aber diese Komponente reichte bis hierhin nichts durch, das Kind merkte
   * also NICHTS von der Sperre).
   *
   * Geladen wird über das schon vorhandene `holeGesperrteZeitenStand()`
   * (`lib/braille/sperre.ts`) - dieselbe Quelle (`tt_classes.gesperrteZeiten`),
   * die auch der Lehrkraft-Reiter liest/schreibt. `classCode` fehlt bei
   * Gästen/Selbstlernenden - `holeGesperrteZeitenStand` behandelt das selbst
   * (leere Liste, sofort „geladen").
   *
   * ⚠️ Der Fehler aus dem Vorbild (`useGesperrteZeitenStand`, EN10-Befund)
   * darf sich nicht wiederholen: Vor der ersten echten Antwort (Erfolg ODER
   * Fehlschlag) steht hier `zeiten: []` mit `geladen: false` - das ist
   * GENAU der Zustand, den es vor dieser Änderung überall gab (kein `gesperrt`
   * durchgereicht = `[]`), also keine Verschlechterung. Erst mit der echten
   * Antwort wechselt der Stand auf den wahren Wert; nichts wird dazwischen
   * als „ungesperrt" FESTGESCHRIEBEN - die Wochenaufgaben-Kachel ist eine
   * live neu berechnete Anzeige, kein einmaliger, gespeicherter Haken.
   */
  /* ⚠️ Ohne Klassencode steht schon beim ersten Zeichnen fest, dass es keine
     Sperre geben kann - ein Konto ohne Klasse hat keine Unterrichtsstunde, die
     jemand sperren koennte. Dann gilt der Stand sofort als geladen, und es
     wird gar nichts nachgeladen. Das ist nicht nur schneller: ein Nachladen,
     das erst im naechsten Durchgang antwortet, setzt den Zustand ausserhalb
     des Zeichnens - in Tests meldet React das als nicht eingefasste
     Aenderung, und dieses Rauschen verdeckt spaeter echte Fehler. */
  const [gesperrteZeitenStand, setGesperrteZeitenStand] =
    useState<BrailleGesperrteZeitenStand>(() => ({
      zeiten: [],
      geladen: !classCode,
    }));
  useEffect(() => {
    if (!classCode) {
      setGesperrteZeitenStand({ zeiten: [], geladen: true });
      return;
    }
    let lebt = true;
    void holeGesperrteZeitenStand(classCode).then((stand) => {
      if (lebt) setGesperrteZeitenStand(stand);
    });
    return () => {
      lebt = false;
    };
  }, [classCode]);

  const wochenstandJetzt = useMemo(() => {
    if (!hatWochenaufgabe(wochenaufgabe)) return null;
    return wochenstand(
      wochenaufgabe,
      [...(events ?? []), ...sitzungsEvents],
      progress,
      Date.now(),
      0,
      // ★★★ „Stunde sperren" wirkt jetzt auch beim Kind (22.09.2026) - siehe
      // die Ladung oben. Vor dem ersten geladenen Stand gilt `[]` (noch
      // keine Sperre BEKANNT, siehe dort) - genau der Zustand, den es auch
      // vorher, ohne diese Änderung, überall gab.
      gesperrteZeitenStand.zeiten,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wochenaufgabe, events, sitzungsEvents, progress, gesperrteZeitenStand]);

  /**
   * ★★★ ÜBEZEIT-UHR (22.09.2026, Johannes: „oben eine mitlaufende Uhr mit der
   * heutigen Übezeit - so wie in Tastenflow, und zwar immer"). `primeUebeUhr`
   * setzt die Uhr auf die heute schon gespeicherte Zeit auf - SEIT 22.09.2026
   * (Abend) die EINE Rechnung aus `lesezeit.ts` ({@link heutigeUebezeitMs}
   * summiert `uebezeitFuerEreignis` je Ereignis), mit dem aktuell gelernten
   * Lesetempo dieses Kindes ({@link leseTempoAus}) - keine Pausentoleranz
   * mehr (siehe `uebeUhr.ts` Dateikopf für die volle Geschichte).
   *
   * `accountId` fehlt bei Gästen (kein Konto) - dann gilt "anon" und leere
   * Ereignisse, also nur der Startwert. `events` kommt hier bewusst NICHT um
   * `sitzungsEvents` ergänzt: Die Uhr zählt live über `verbucheUebezeit`
   * (`meldeAufgabe`) mit, sie braucht die gerade erst gemeldeten Aufgaben
   * nicht zusätzlich als Basis.
   */
  useEffect(() => {
    const jetzt = Date.now();
    primeUebeUhr(accountId ?? "anon", heutigeUebezeitMs(events, leseTempoAus(progress), jetzt), jetzt);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId, events]);

  // Die Anzeige tickt unabhängig von der Uhr-Logik selbst (reiner React-
  // State fürs Neuzeichnen, wie `PracticeClock.tsx` im Vorbild).
  const [uebezeit, setUebezeit] = useState(() => uebezeitMs());
  useEffect(() => {
    const id = window.setInterval(() => setUebezeit(uebezeitMs()), 500);
    return () => window.clearInterval(id);
  }, []);

  const dirBtnRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const onDirectionKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const next = direction === "write" ? "read" : "write";
    selectDirection(next);
    dirBtnRefs.current[next]?.focus();
  };

  return (
    <div className="not-prose space-y-5">
      {/* Feste ARIA-Live-Regionen — lang folgt der Inhaltssprache (UEB = en),
          damit NVDA/JAWS englische Wörter mit englischer Synthese lesen. */}
      <div id="pl-live-task" lang={liveLang} aria-live="assertive" aria-atomic="true" className="sr-only">{taskMsg}</div>
      <div id="pl-live-status" lang={liveLang} role="status" aria-live="polite" aria-atomic="true" className="sr-only">{statusMsg}</div>
      <div id="pl-live-alert" lang={liveLang} role="alert" aria-live="assertive" aria-atomic="true" className="sr-only">{alertMsg}</div>

      {/* Leiste 1: Rang + Stufe + Richtung + Schrift + Etappe.
          ★★★ FASSUNG „A - TRENNLINIEN" (20.09.2026, aus drei Entwürfen von
          Johannes gewählt): ALLES in EINER Zeile, vier Gruppen, dazwischen
          je eine haarfeine senkrechte Linie (`KopfleisteTrenner`, nur ab
          `lg` sichtbar - auf schmalen Geräten blendet die Zeile um, s. dort).
          Reihenfolge: [Rang · XP/Sterne · Stufe] │ [Schreiben · Lesen] │
          [Schrift] │ [← Etappe →]. Vorher standen Rang/Stufe/Richtung links
          und Schrift/Etappe rechts, je auf einer eigenen Zeile.
          ★★★ JEDES Feld trägt jetzt einen `Tipp` (`aria-describedby`) statt
          eines `title` - der native `title` ist tastaturtaub und erscheint
          erst nach rund einer Sekunde (Bauart, gemessen 10.09.2026).
          `data-kopfleiste` markiert die Karte für den Wächter/die Messung
          „keine `title`-Attribute im Kopfbereich". */}
      <div className="card p-4" data-kopfleiste="punktgenau">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
          {/* Gruppe 1: Rang-Kreis, XP/Sterne, Stufe-Kreis. */}
          <div className="flex flex-wrap items-center gap-2">
            <Tipp text={kopfTipp("rang")} ausrichtung="links">
              {(tippId) => (
                // ★ 20.09.2026: `size={36}` statt der Vorgabe (46) - NUR hier
                // in Punktgenau (Auftrag Johannes). Die Vorgabe in
                // `BrailleTrainer.tsx` bleibt unangetastet, sonst schrumpfen
                // auch Klangpunktes Kreise mit. `ohneTitle`/`describedBy`/
                // `tabIndex` sind neue, optionale Props - Klangpunktes Aufruf
                // (`Klangpunkte.tsx`) setzt sie nicht und bleibt unverändert.
                <ProgressRing
                  size={36}
                  value={pl.need ? pl.into / pl.need : 0}
                  number={pl.level}
                  caption={pg("Rang", (t) => t.leiste.rang)}
                  ariaLabel={pg(`Rang ${pl.level} — noch ${pl.need - pl.into} XP bis zum nächsten.`, (t) => t.leiste.rangAria(pl.level, pl.need - pl.into))}
                  ohneTitle
                  describedBy={tippId}
                  tabIndex={0}
                />
              )}
            </Tipp>
            <span className="flex flex-col text-xs leading-tight text-ink-muted">
              <Tipp text={kopfTipp("xp")} ausrichtung="links">
                {(tippId) => (
                  <span tabIndex={0} aria-describedby={tippId}>
                    {progress.xp} XP
                  </span>
                )}
              </Tipp>
              <Tipp text={kopfTipp("sterne")} ausrichtung="links">
                {(tippId) => (
                  <span tabIndex={0} aria-describedby={tippId}>
                    {totalStars} ★
                  </span>
                )}
              </Tipp>
            </span>

            {ring && (
              <Tipp
                text={ring.caption === pg("Stufe", (t) => t.leiste.stufe) ? kopfTipp("stufe") : `${ring.caption} - ${ring.ariaLabel}`}
                ausrichtung="links"
              >
                {(tippId) => (
                  <ProgressRing
                    size={36}
                    value={ring.value}
                    number={ring.number}
                    caption={ring.caption}
                    ariaLabel={ring.ariaLabel}
                    ohneTitle
                    describedBy={tippId}
                    tabIndex={0}
                  />
                )}
              </Tipp>
            )}

            {/* Abzeichen-Regal (Auftrag 22.09.2026) - eigener Knopf, öffnet
                das Regal als Fenster (`Modal`, s. u.); Fokus-Falle und Escape
                bringt der gemeinsame Baustein schon mit. */}
            <Tipp text={kopfTipp("abzeichen")} ausrichtung="links">
              {(tippId) => (
                <button
                  type="button"
                  className="btn-secondary btn-toggle"
                  aria-haspopup="dialog"
                  aria-expanded={showAbzeichen}
                  aria-describedby={tippId}
                  onClick={() => toggleAbzeichen(!showAbzeichen)}
                >
                  {pg("Abzeichen", (t) => t.leiste.abzeichen)}
                </button>
              )}
            </Tipp>

            {/* ★★★ Übezeit-Uhr (22.09.2026) - IMMER sichtbar, auch ohne
                Wochenaufgabe (anders als die Kachel unten, die nur mit
                gestellter Aufgabe erscheint). Bewusst KEINE `aria-live`-
                Region: Eine tickende Zahl würde die Braillezeile alle paar
                Sekunden verdrängen (siehe `PracticeClock.tsx`/
                `KlassenmatchLauf.tsx`). Erreichbar bleibt sie trotzdem - über
                `tabIndex` und den Hinweistext, genau wie XP/Sterne oben. */}
            <Tipp text={kopfTipp("uebezeit")} ausrichtung="links">
              {(tippId) => (
                <div
                  role="timer"
                  tabIndex={0}
                  aria-describedby={tippId}
                  aria-label={pg(`Heute geübt: ${formatUebezeit(uebezeit)}.`, (t) => t.leiste.heuteGeuebt(formatUebezeit(uebezeit)))}
                  className="flex shrink-0 items-center gap-1.5 rounded-lg border border-hairline bg-surface-sunken px-2 py-1"
                >
                  <span aria-hidden="true" className="text-xs text-ink-muted">
                    {pg("Heute", (t) => t.leiste.heute)}
                  </span>
                  <span
                    aria-hidden="true"
                    className="font-mono text-sm font-semibold tabular-nums tracking-wide text-ink"
                  >
                    {formatUebezeit(uebezeit)}
                  </span>
                </div>
              )}
            </Tipp>
          </div>

          {et && <KopfleisteTrenner />}

          {/* Gruppe 2: Richtung (Schreiben/Lesen) — weiterhin eine
              Radiogruppe mit Pfeiltasten-Navigation
              (`onDirectionKeyDown`/`selectDirection`, unverändert). */}
          {et && (
            <div
              role="radiogroup"
              aria-label={pg("Übungsrichtung", (t) => t.leiste.richtung)}
              className="flex items-center gap-1"
              onKeyDown={onDirectionKeyDown}
            >
              <Tipp text={kopfTipp("schreiben")}>
                {(tippId) => (
                  <button
                    ref={(el) => {
                      dirBtnRefs.current.write = el;
                    }}
                    type="button"
                    role="radio"
                    aria-checked={direction === "write"}
                    tabIndex={direction === "write" ? 0 : -1}
                    onClick={() => selectDirection("write")}
                    aria-describedby={tippId}
                    className={(direction === "write" ? "btn-primary" : "btn-secondary") + " btn-toggle"}
                  >
                    {pg("Schreiben", (t) => t.leiste.schreiben)}
                  </button>
                )}
              </Tipp>
              <Tipp text={kopfTipp("lesen")}>
                {(tippId) => (
                  <button
                    ref={(el) => {
                      dirBtnRefs.current.read = el;
                    }}
                    type="button"
                    role="radio"
                    aria-checked={direction === "read"}
                    tabIndex={direction === "read" ? 0 : -1}
                    onClick={() => selectDirection("read")}
                    aria-describedby={tippId}
                    className={(direction === "read" ? "btn-primary" : "btn-secondary") + " btn-toggle"}
                  >
                    {pg("Lesen", (t) => t.leiste.lesen)}
                  </button>
                )}
              </Tipp>
            </div>
          )}

          {/* ★★★ Die Wochenaufgabe der Lehrkraft. Sie erscheint NUR, wenn eine
              gestellt ist - ohne sie sieht die Leiste aus wie bisher.
              `role="status"` und der volle Satz statt „12/20": Auf einer
              Braillezeile ist ein Bruchstrich ohne Bezugswort nichts. */}
          {wochenstandJetzt?.aktiv && (
            <Tipp text={kopfTipp("wochenaufgabe")}>
              {(tippId) => (
                <div
                  role="status"
                  tabIndex={0}
                  aria-describedby={tippId}
                  className={
                    "flex shrink-0 flex-col gap-0.5 rounded-lg px-2 py-1 " +
                    (wochenstandJetzt.erfuellt
                      ? "bg-success-soft"
                      : "bg-surface-sunken")
                  }
                >
                  <span className="text-[10px] font-medium uppercase tracking-wide text-ink-muted">
                    Wochenaufgabe
                  </span>
                  <span className="text-sm font-semibold text-ink">
                    {wochenstandSatz(wochenstandJetzt, "du")}
                  </span>
                </div>
              )}
            </Tipp>
          )}

          <KopfleisteTrenner />

          {/* Gruppe 3: Schrift (Brailleschriftsystem) als Pulldown (Johannes
              03.07., Platz bestätigt 20.09.). Alt+1…5 springen weiter direkt
              in einen Bereich. Das `aria-label` allein muss reichen - eine
              sichtbare Textzeile mit dem Bereichsnamen gibt es seit der
              zweiten Korrektur nicht mehr: eine Sprachausgabe sagt bei einem
              `<select>` IMMER Name UND gewählten Wert an. Der Blurb-Halbsatz
              stand bis 20.09.2026 als `title` am Pulldown - jetzt trägt der
              `Tipp` die (kürzere, einheitliche) Erklärung. */}
          <label className="flex min-w-0 flex-wrap items-center gap-1.5 text-sm font-medium text-ink">
            <span className="text-ink-muted">{pg("Schrift:", (t) => t.leiste.schrift)}</span>
            <Tipp text={altAnzeige(kopfTipp("schrift"))}>
              {(tippId) => (
                <select
                  aria-label={pg("Brailleschriftsystem (Bereich) auswählen", (t) => t.leiste.schriftWahl)}
                  value={areaKey}
                  onChange={(e) => selectArea(e.target.value as AreaKey)}
                  aria-describedby={tippId}
                  className="min-w-0 max-w-[14rem] rounded-xl border border-hairline bg-surface-raised px-3 py-2 text-sm font-medium text-ink focus:border-accent"
                >
                  {areas.map((a) => (
                    <option key={a.key} value={a.key}>
                      {a.label}
                    </option>
                  ))}
                </select>
              )}
            </Tipp>
          </label>

          <KopfleisteTrenner />

          {/* Gruppe 4: Etappe (Schrittfolge). `flex-wrap`: der ausgewählte
              Kapitelname im `<select>` kann lang sein - bei 320 px passt er
              neben den beiden Pfeil-Knöpfen nicht mehr in eine Zeile.
              Gemessen war das die eigentliche Ursache des 73-px-Überlaufs
              (nicht der Text daneben, s.o.): ohne Umbruch presst der Browser
              das `<select>` schmäler und schneidet den sichtbaren Namen mit
              „…" ab - für sehende Kinder mit Sehrest genau der Verlust, den
              Prüfpunkt 8.2 verhindern soll. Der Umbruch lässt das `<select>`
              stattdessen in voller Breite in eine eigene Zeile rutschen
              (Prüfpunkt 8.2, gemessen 25./26.08.). Die Einträge zeigen den
              GEKÜRZTEN Namen (`kurzerEtappenname`, s. o.) - die Marken
              „— gemeistert" bleibt. */}
          <div className="flex flex-wrap items-center gap-1">
            <Tipp text={kopfTipp("etappeZurueck")}>
              {(tippId) => (
                <button
                  type="button"
                  className="btn-secondary btn-toggle"
                  onClick={() => selectEtappe(activeIndex - 1)}
                  // ★★★ `aria-disabled`, nie `disabled` (Bauart §3): Wer sich
                  // zur ersten Etappe zurueckblaettert, steht mit dem Fokus auf
                  // genau diesem Knopf. `selectEtappe` verriegelt selbst
                  // (`if (i < 0 …) return`).
                  aria-disabled={activeIndex <= 0 || undefined}
                  aria-label={pg("Vorige Etappe", (t) => t.leiste.etappeZurueck)}
                  aria-describedby={tippId}
                >
                  <span aria-hidden="true">←</span>
                </button>
              )}
            </Tipp>
            <Tipp text={kopfTipp("etappenListe")}>
              {(tippId) => (
                <select
                  ref={etappeSelectRef}
                  aria-label={pg("Kapitel (Etappe) auswählen — mit Pfeil rauf und runter blättern", (t) => t.leiste.etappeWahl)}
                  value={activeIndex}
                  onChange={(e) => selectEtappe(Number(e.target.value))}
                  aria-describedby={tippId}
                  // `order-first` nur auf schmalen Geraeten: dort passt die
                  // Liste nicht neben die Pfeile, und ohne diese Zeile landete
                  // jedes der drei Elemente in einer eigenen Reihe (gemessen bei
                  // 320 px am 20.09.2026). So steht die Liste oben und die
                  // beiden Pfeile nebeneinander darunter; ab `sm` wieder
                  // ← Liste → in einer Zeile.
                  className="order-first w-full max-w-[18rem] rounded-xl border border-hairline bg-surface-raised px-3 py-2 text-sm text-ink focus:border-accent sm:order-none sm:w-auto"
                >
                  {area.etappen.map((e2, i) => {
                    const done = isEtappeDone(e2, progress);
                    // Status als TEXT statt ✓/🔒-Emoji: auf der Braillezeile
                    // erscheinen Emojis je nach Tabelle als Füllmuster.
                    const mark = done ? pg(" — gemeistert", (t) => t.leiste.gemeistert) : "";
                    return (
                      <option key={e2.id} value={i}>
                        {pg(
                          `Etappe ${i + 1}: ${kurzerEtappenname(e2.title)}${mark}`,
                          (t) => t.leiste.etappeOption(i + 1, kurzerEtappenname(e2.title), mark),
                        )}
                      </option>
                    );
                  })}
                </select>
              )}
            </Tipp>
            <Tipp text={kopfTipp("etappeWeiter")}>
              {(tippId) => (
                <button
                  type="button"
                  className="btn-secondary btn-toggle"
                  onClick={() => selectEtappe(activeIndex + 1)}
                  // ★★★ Wie beim Zurueck-Knopf. `selectEtappe` prueft beide
                  // Bedingungen selbst - auch die Sperre.
                  aria-disabled={
                    !hasNext || undefined
                  }
                  aria-label={pg("Nächste Etappe", (t) => t.leiste.etappeWeiter)}
                  aria-describedby={tippId}
                >
                  <span aria-hidden="true">→</span>
                </button>
              )}
            </Tipp>
          </div>
        </div>
      </div>

      {toast && (
        <p
          role="status"
          className="rounded-xl border border-success/40 bg-success-soft p-3 text-center text-sm font-medium text-ink"
        >
          {toast}
        </p>
      )}

      {/*
        ★★★ ZUBAU 22.09.2026 - DIE REIHENFOLGE, WENN MEHRERES GLEICHZEITIG
        ANSTEHT (siehe Begründung bei den Haken oben, Vorbild
        `TippenTrainerPage.tsx`): Braille-Challenge vor Klassenmatch vor der
        Ankündigung der eigenen Übung vor der eigenen Übung selbst vor dem
        gewöhnlichen Üben. Jede Stufe braucht ein Konto (`account`) - ohne
        Konto (Gast, Selbstlernende ohne Klasse) gibt es keinen Zubau, und es
        bleibt bei der letzten Stufe.
      */}
      {account && challenge.dran ? (
        <BrailleChallengeLauf
          challenge={challenge}
          areas={areas}
          progress={progress}
          grossschreibzeichen={grossschreibzeichen}
          onTask={meldeAufgabe}
          onAnnounce={announce}
        />
      ) : account && klassenmatch.meinMatch ? (
        <BrailleKlassenmatchLauf
          /* ★ 02.10.2026: je Match ein eigener Lauf - aus der Platzierungsliste
             heraus („Bin dabei" zu einer neuen Einladung) darf nichts vom
             vorigen Match mitwandern (Zählung, „schon fertig"). */
          key={klassenmatch.meinMatch.id}
          match={klassenmatch.meinMatch}
          klassenmatch={klassenmatch}
          account={account}
          areas={areas}
          progress={progress}
          grossschreibzeichen={grossschreibzeichen}
          onErgebnis={(areaKey, levelId, r) => {
            const matchArea = areas.find((a) => a.key === areaKey);
            const idx = matchArea ? currentIndex(matchArea, progress) : 0;
            applyResult(r, {
              levelId,
              areaKey,
              direction: klassenmatch.meinMatch!.arbeitsweise === "schreiben" ? "write" : "read",
              isLast: matchArea ? idx >= matchArea.etappen.length - 1 : false,
            });
          }}
          onTextFertig={(areaKey, levelId) => {
            const matchArea = areas.find((a) => a.key === areaKey);
            const idx = matchArea ? currentIndex(matchArea, progress) : 0;
            applyTextComplete({
              levelId,
              areaKey,
              direction: klassenmatch.meinMatch!.arbeitsweise === "schreiben" ? "write" : "read",
              isLast: matchArea ? idx >= matchArea.etappen.length - 1 : false,
            });
          }}
          onTask={meldeAufgabe}
          onAnnounce={announce}
          onWeiter={() => {
            klassenmatch.verlassen();
            useBraillePlay.getState().requestFocusInput();
          }}
        />
      ) : account && eigeneUebungAnkuendigung.zeigen ? (
        <BrailleEigeneUebungAnkuendigung onWeiter={eigeneUebungAnkuendigung.bestaetigen} />
      ) : account && eigeneUebung.dran ? (
        <BrailleEigeneUebungLauf
          stand={eigeneUebung}
          grossschreibzeichen={grossschreibzeichen}
          onTask={meldeAufgabe}
          onAnnounce={announce}
        />
      ) : level && et ? (
        <>
          {/* Der Lehrtext der Etappe (introDu) + die Zeichen-Legende kommen aus
              dem Runner selbst (er zeigt level.intro/level.legend immer an) —
              hier NICHT doppeln. Die Etappen-Überschrift steht in der Schrittfolge. */}
            <>
              {level.kind === "text" ? (
                <TextLevelRunner
                  key={level.id + dir + areaKey}
                  level={level}
                  system={area.system}
                  direction={dir}
                  address="du"
                  grossschreibzeichen={grossschreibzeichen}
                  onProgress={setRing}
                  // ★ Die Runden-Striche zeigt NUR Punktgenau selbst im
                  //   Aufgaben-Kasten (siehe `showRound`-Doku am LevelRunner) -
                  //   der eingebettete Lektions-Baustein `BrailleExercise`
                  //   lässt den Schalter aus wie bisher.
                  showRound
                  onTask={meldeAufgabe}
                  onComplete={applyTextComplete}
                  onAnnounce={announce}
                />
              ) : (
                <LevelRunner
                  key={level.id + dir + areaKey}
                  level={level}
                  system={area.system}
                  direction={dir}
                  initialMastery={getLevelMastery(progress, level.id)}
                  initialStufe={getSystemStufe(progress, area.key)}
                  initialBestStars={progress.levels[level.id]?.bestStars ?? 0}
                  address="du"
                  grossschreibzeichen={grossschreibzeichen}
                  onResult={applyResult}
                  onNext={hasNext ? goNext : null}
                  nextTitle={hasNext ? area.etappen[activeIndex + 1]?.title : undefined}
                  onProgress={setRing}
                  showRound
                  onTask={meldeAufgabe}
                  onAnnounce={announce}
                />
              )}
            </>
        </>
      ) : null}

      {/*
        ★ "Klassenmatch starten" - eigener Knopf statt eines Kürzels (in
        Braille sind Alt + 1…5 schon die Bereichswahl, ein weiteres
        Alt-Kürzel läge dicht daneben). Nur sichtbar, wenn ein Konto UND eine
        Klasse da sind UND die Lehrkraft Klassenmatches nicht abgeschaltet
        hat - und nur, solange gerade NICHTS anderes den Bildschirm hält.
      */}
      {account &&
      klassenmatch.erlaubt &&
      !challenge.dran &&
      !klassenmatch.meinMatch &&
      !eigeneUebungAnkuendigung.zeigen &&
      !eigeneUebung.dran ? (
        <div className="flex justify-start">
          <button
            type="button"
            className="btn-secondary btn-toggle"
            onClick={() => {
              // ★ Die Meldung von vorhin gehört nicht ins neue Fenster.
              klassenmatch.meldungLoeschen();
              // ★★★ Steht eine fremde Einladung offen, wird zuerst gefragt
              // („Arne lädt gerade ein. Mitmachen oder selbst einladen?").
              if (!klassenmatch.fragen()) setZeigeKlassenmatchStarten(true);
            }}
          >
            <span aria-hidden="true">⚔️ </span>Klassenmatch
          </button>
        </div>
      ) : null}

      {/*
        ★★★★ WARUM ES NICHT GING (02.10.2026) - ausschreiben oder beitreten,
        abgewiesen vom Server („Du bist schon in einem anderen Klassenmatch
        dabei. …") oder vom Gerät. Bis dahin stand der Satz nur im Fenster
        „Klassenmatch ausschreiben" - das aber schon zu war, wenn die Antwort
        kam; ein abgewiesenes „Bin dabei" blieb ganz still. Sichtbar hier,
        gemeldet und gesprochen EINMAL über `announce` (siehe Effekt oben).
      */}
      {account && klassenmatch.meldung && !zeigeKlassenmatchStarten && !klassenmatch.meinMatch ? (
        <p className="m-0 rounded-xl border border-hairline bg-surface-sunken p-3 text-sm text-ink" data-match-meldung>
          {klassenmatch.meldung}
        </p>
      ) : null}

      {/*
        ★★★ „Arne lädt gerade ein. Mitmachen oder selbst einladen?"
        (02.10.2026) - steht AN STELLE des Einladungsfensters, nie darüber:
        zwei Fenster übereinander wären zwei Fokusfallen.
      */}
      {account && klassenmatch.rueckfrage && !challenge.dran ? (
        <BrailleKlassenmatchWahl
          key={klassenmatch.rueckfrage.id}
          hostName={klassenmatch.rueckfrage.hostName}
          onMitmachen={klassenmatch.rueckfrageMitmachen}
          onSelbst={() => {
            klassenmatch.rueckfrageSelbst();
            setZeigeKlassenmatchStarten(true);
          }}
          onSchliessen={klassenmatch.rueckfrageSchliessen}
        />
      ) : null}

      {zeigeKlassenmatchStarten && (
        <BrailleKlassenmatchStarten
          areas={areas}
          bereichVorgabe={areaKey}
          meldung={klassenmatch.meldung}
          onEinladen={(arbeitsweise, bereich) => {
            klassenmatch.einladen(arbeitsweise, bereich);
            setZeigeKlassenmatchStarten(false);
          }}
          onClose={() => {
            setZeigeKlassenmatchStarten(false);
            klassenmatch.meldungLoeschen();
          }}
        />
      )}

      {/*
        ★★★ DIE EINLADUNG ZUM KLASSENMATCH liegt ÜBER der Seite (Vorbild
        `TippenTrainerPage.tsx`) - nicht während einer laufenden Braille-
        Challenge (wer gerade eine Prüfung schreibt, bekommt kein Fenster
        vor die Zeile) und nicht, solange dieses Kind schon in einem eigenen
        Match steckt (`useBrailleKlassenmatch.einladung` kennt - anders als
        das Tastenflow-Vorbild - nicht die Stand-Zeilen ANDERER Matches,
        siehe Bericht; `!klassenmatch.meinMatch` fängt genau den Fall ab, in
        dem dasselbe Kind gerade erst beigetreten ist).
      */}
      {/*
        ★★★★★ SEIT 02.10.2026: `klassenmatch.einladung` kommt nur noch, wenn
        dieses Kind FREI ist (`useBrailleKlassenmatch`: kein eigenes Match,
        oder es sitzt vor der Platzierungsliste eines VORBEI-en Matches, und
        es steckt in keinem anderen) - mitten im Spiel nie. Über der
        Platzierungsliste führt „Jetzt nicht" zu deren Überschrift zurück,
        denn eine Übungszeile gibt es dort nicht. Nicht über einem anderen
        Fenster des Klassenmatchs (Ausschreiben, Rückfrage).
      */}
      {account &&
      klassenmatch.einladung &&
      !challenge.dran &&
      !klassenmatch.rueckfrage &&
      !zeigeKlassenmatchStarten &&
      (!klassenmatch.meinMatch || klassenmatch.aufRangliste) ? (
        <BrailleKlassenmatchEinladung
          key={klassenmatch.einladung.id}
          hostName={klassenmatch.einladung.hostName}
          onDabei={() => klassenmatch.beitreten(klassenmatch.einladung!.id)}
          onNichtJetzt={() => klassenmatch.ablehnen(klassenmatch.einladung!.id)}
          onGezeigt={() => klassenmatch.einladungGezeigt(klassenmatch.einladung!.id)}
          fokusNachNein={
            klassenmatch.aufRangliste
              ? () => document.querySelector<HTMLElement>("[data-match-titel]")?.focus()
              : undefined
          }
        />
      ) : null}

      {showZeichen && (
        <BrailleZeichenliste
          area={area}
          activeIndex={activeIndex}
          progress={progress}
          onClose={() => {
            toggleZeichen(false);
            // ★ „Escape immer und ueberall ins Uebungsfeld" (07.09.2026):
            //   Die Zeichenliste ist ein `Modal` - es faengt Escape in der
            //   Abfangphase ab, die Seite sieht die Taste also nie. Ohne diese
            //   Zeile gaebe das Modal den Fokus an den Listen-Knopf zurueck
            //   und das Kind muesste sich zurueck zur Aufgabe tabben.
            useBraillePlay.getState().requestFocusInput();
          }}
        />
      )}

      {showSettings && (
        <PunktgenauEinstellungen
          grossschreibzeichen={grossschreibzeichen}
          ohneKlasse={ohneKlasse}
          onToggleGrossschreibzeichen={() => {
            toggleEigenesGrossschreibzeichen();
            const next = !eigenesGrossschreibzeichen;
            speakUi(pg(next ? "Großschreibzeichen an." : "Großschreibzeichen aus.", (t) => t.leiste.grossAnsage(next)));
          }}
          onClose={() => {
            toggleSettings(false);
            // Wie bei der Zeichenliste (s.o.): Escape immer und überall ins
            // Übungsfeld (07.09.2026).
            useBraillePlay.getState().requestFocusInput();
          }}
        />
      )}

      {showAbzeichen && (
        <Modal title="Abzeichen" onClose={() => toggleAbzeichen(false)}>
          <AbzeichenRegal progress={progress} areas={areas} selfView />
        </Modal>
      )}
    </div>
  );
}
