/**
 * Die Lehrkraft-Handbücher — EINE Liste für alle Stellen, die sie anbieten
 * (Johannes, 07.09.2026: „Lehrerhandbuch muss auch bei meine klassen
 * downloadbar sein").
 *
 * ★★★★ WARUM EINE LISTE: Bis heute standen die Handbücher an drei Stellen,
 * jede mit eigenem Text und eigener Größenangabe - die eine andere App der Plattform-Seite
 * (zwei Verweise samt „(PDF, 10 MB)"), die Tastenflow-Lehrer-Hilfe (eigener
 * Lade-Knopf) und nirgends sonst. Drei Fassungen derselben Sache, von denen
 * beim nächsten neuen Handbuch zwei zurückblieben
 * ([[feedback_zwei_stellen_die_voneinander_nichts_wissen]]).
 *
 * ★★★ DIE GRÖSSEN WERDEN GEMESSEN, NICHT GESCHÄTZT. `bytes` steht hier als
 * Zahl, und `tests/handbuecher.test.ts` hält sie gegen die echte Datei in
 * `public/`. Eine Angabe „(PDF, 10 MB)" im Fließtext veraltet beim ersten
 * Nachdruck, ohne dass es jemand bemerkt; dieser Test fällt dann durch.
 *
 * ⚠️ DER WEG IST GESCHÜTZT. `/handbuecher/…` liefert ohne Anmeldung 404 - und
 * zwar absichtlich (`pb_hooks/geschuetzte_inhalte.pb.js`, „nur angemeldete
 * Lehrer/Schüler", Johannes 03.08.). Wer eine dieser Dateien lädt, holt vorher
 * den Datei-Ausweis; das erledigt `HandbuchKnopf`.
 *
 * ★★★ DIE EINE AUSNAHME: `oeffentlich: true` (19.09.2026, das Tastenflow-Plakat).
 * Die Regel vom 03.08. schützt Handbücher, weil sie „Lehrmaterial, kein
 * Werbematerial" sind ([[feedback_handbuecher_nur_angemeldet]]). Ein Plakat,
 * das in einer Schule oder Einrichtung ausgedruckt und aufgehängt werden soll,
 * IST Werbematerial - und es steht auch in der Hilfe der Kinder, die Gäste
 * ohne Anmeldung sehen. Ein so gekennzeichneter Eintrag liegt darum offen in
 * `pb_public` (Adresse `/<datei>`, siehe `downloadAdresse`); das Deploy-Skript
 * schliesst ihn NICHT aus, und `tests/lehrinhalte-schutz.test.ts` prüft beide
 * Richtungen: jeder andere Eintrag bleibt geschützt, und öffentlich ist genau
 * das Plakat.
 */
import type { LwProgramKey } from "./klassen";
import type { Lang } from "../typing/account";
import { istGeruestSprache } from "../typing/sprachRegister";

/**
 * Die Sprachen, in denen ein Handbuch angeboten wird (= Bedienungssprachen).
 * ★ E15 (26.09.2026): „fr" dazu - der französische Lehrgang hat ein eigenes
 * Handbuch (`scripts/tastenflow-handbuch-fr.mts`).
 *
 * ★ ES-F2 (27.09.2026): „es" dazu - GERÜST NUR, kein eigenes spanisches
 * Handbuch (kommt mit ES-O). `Handbuch` bekommt bewusst KEIN eigenes `es?`-
 * Feld - {@link handbuchInSprache} bildet „es" auf die englische Fassung ab,
 * wie „fr" es ohne eigene Datei auch täte.
 */
type Sprache = Lang;

/**
 * ★★ DIE ENGLISCHE FASSUNG EINES EINTRAGS (EN7, 19.09.2026).
 *
 * Zwei Fälle, EIN Feld:
 *  · MIT `datei`: Es gibt eine eigene englische Ausgabe (Tastenflow). Die
 *    englische Bedienung bietet sie an - mit eigenem Speichernamen und eigener,
 *    GEMESSENER Größe (`tests/handbuecher.test.ts` hält sie gegen `public/`).
 *  · OHNE `datei`: Das Heft gibt es nur deutsch (eine andere App der Plattform). Die englische
 *    Bedienung nennt es englisch und sagt dazu, dass es deutsch ist - eine
 *    Lehrkraft soll vor dem Laden wissen, was sie bekommt.
 *
 * ⚠️ Nur die Tastenflow-Bedienung kennt eine englische Sprache; alle anderen
 * Stellen (eine andere App der Plattform-Seite) haben keinen aktiven Provider und bekommen immer
 * die deutsche Zeile - genau wie vorher.
 */
export interface HandbuchEnglisch {
  titel: string;
  hinweis: string;
  /** Eigene englische Datei unter `/handbuecher/` - fehlt, wenn es nur die deutsche gibt. */
  datei?: string;
  speicherName?: string;
  bytes?: number;
}

export interface Handbuch {
  /** Dateiname unter `/handbuecher/` (öffentlich: direkt unter `/`) - ein Slug, der NIE umbenannt wird. */
  datei: string;
  /** Was in der Liste steht. */
  titel: string;
  /** Ein Satz: für wen und wofür. */
  hinweis: string;
  /** Zu welchem Programm es gehört (für die Gruppierung). */
  programm: LwProgramKey;
  /**
   * Der Name, unter dem die Datei gespeichert wird.
   * ★ Ohne Rollenwörter im SICHTBAREN Namen (Johannes, 01.09.2026) - die
   * Adresse bleibt `…-lehrerhandbuch.pdf`, weil jeder bestehende Verweis
   * daran hängt.
   */
  speicherName: string;
  /** Gemessene Größe in Byte - der Test hält sie gegen `public/`. */
  bytes: number;
  /** ★ EN7: die englische Fassung dieses Eintrags (siehe {@link HandbuchEnglisch}). */
  en?: HandbuchEnglisch;
  /**
   * ★ E15 (26.09.2026): die französische Fassung - dieselbe Bauart wie `en`.
   * MIT `datei`: eine eigene französische Ausgabe (Tastenflow-Handbuch). OHNE
   * `datei`: es gibt keine französische Datei - dann bietet die französische
   * Bedienung die ENGLISCHE Ausgabe an, wo es eine gibt (eine Lehrkraft in
   * Frankreich liest eher Englisch als Deutsch), sonst die deutsche; der
   * Titel sagt jeweils dazu, in welcher Sprache das Heft ist.
   */
  fr?: HandbuchEnglisch;
  /**
   * ★ ES-O (27.09.2026): die spanische Fassung - dieselbe Bauart. Eine
   * spanische DATEI gibt es noch nicht (Handbuch und Plakat sind eigene
   * Etappen); ohne `datei` bietet die spanische Bedienung die ENGLISCHE
   * Ausgabe an, wo es eine gibt, sonst die deutsche - der spanische Titel sagt
   * jeweils dazu, in welcher Sprache das Heft ist.
   */
  es?: HandbuchEnglisch;
  /**
   * ★ O-IT (02.10.2026): die italienische Fassung - wie `fr`/`es` ohne
   * eigene `datei`: die italienische Bedienung bietet die ENGLISCHE Ausgabe an
   * (Tastenflow-Handbuch, Plakat), sonst die deutsche; der Titel sagt dazu, in
   * welcher Sprache das Heft ist.
   */
  it?: HandbuchEnglisch;
  /**
   * ★ O-PL (02.10.2026): die polnische Fassung - wie `it` ohne eigene `datei`:
   * die polnische Bedienung bietet die ENGLISCHE Ausgabe an (Tastenflow-
   * Handbuch, Plakat), sonst die deutsche; der Titel sagt dazu, in welcher
   * Sprache das Heft ist („po angielsku", „po niemiecku").
   */
  pl?: HandbuchEnglisch;
  /**
   * ★ O-TR (02.10.2026): die türkische Fassung - wie `pl` ohne eigene `datei`:
   * die türkische Bedienung bietet die ENGLISCHE Ausgabe an (Tastenflow-
   * Handbuch, Plakat), sonst die deutsche; der Titel sagt dazu, in welcher
   * Sprache das Heft ist ("(İngilizce)", "(Almanca)").
   */
  tr?: HandbuchEnglisch;
  /**
   * ★ O-CS (03.10.2026): die tschechische Fassung - wie `tr` ohne eigene `datei`:
   * die tschechische Bedienung bietet die ENGLISCHE Ausgabe an (Tastenflow-
   * Handbuch, Plakat), sonst die deutsche; der Titel sagt dazu, in welcher
   * Sprache das Heft ist („v angličtině", „v němčině").
   */
  cs?: HandbuchEnglisch;
  /**
   * ★ O3 (30.10.2026): die neun Wege - dieselbe Bauart, mit eigener Datei (`erzeuge-tastenflow-handbuch.mts --sv --pdf`).
   * ⚠️ `bytes: 0` heisst: das PDF ist noch nicht erzeugt (nur am Mac möglich) und nichts ist gemessen. Bis dahin bietet
   * {@link handbuchInSprache} die ENGLISCHE Ausgabe an, wie vorher - eine erfundene Grösse gibt es nicht.
   */
  bg?: HandbuchEnglisch;
  el?: HandbuchEnglisch;
  hu?: HandbuchEnglisch;
  nl?: HandbuchEnglisch;
  pt?: HandbuchEnglisch;
  br?: HandbuchEnglisch;
  ro?: HandbuchEnglisch;
  sv?: HandbuchEnglisch;
  uk?: HandbuchEnglisch;
  /**
   * ★ 19.09.2026: `true` = für alle, ohne Anmeldung - die Datei liegt offen
   * unter `/<datei>` statt unter `/handbuecher/`. NUR für Werbematerial (das
   * Plakat); ein Handbuch oder eine Checkliste bekommt das nie
   * (`tests/lehrinhalte-schutz.test.ts` nennt die erlaubten Dateien).
   */
  oeffentlich?: boolean;
}

export const HANDBUECHER: Handbuch[] = [
];

/** Die Handbücher eines Programms (leer, wo es noch keines gibt). */
export function handbuecherFuer(programm: LwProgramKey): Handbuch[] {
  return HANDBUECHER.filter((h) => h.programm === programm);
}

/** Der Dateiname des Tastenflow-Plakats - ein Slug, der nie umbenannt wird. */
export const PLAKAT_DATEI = "tastenflow-plakat.pdf";

/**
 * Das Tastenflow-Plakat aus der EINEN Liste - gefunden über den Dateinamen,
 * nicht über die Stelle (wirft bei Tippfehler). Lehrer-Hilfe, Kinder-Hilfe
 * und Kasten nehmen Titel, Speichername und Größe von hier.
 */
export function tastenflowPlakat(): Handbuch {
  const h = HANDBUECHER.find((x) => x.datei === PLAKAT_DATEI);
  if (!h) throw new Error("Kein Tastenflow-Plakat in HANDBUECHER");
  return h;
}

/**
 * ★ Wo die Datei zu holen ist (19.09.2026): öffentlich direkt unter
 * `/<datei>` (pb_public), sonst unter `/handbuecher/<datei>` - geschützt,
 * nur mit Datei-Ausweis. `HandbuchKnopf` und die Kinder-Hilfe fragen hier.
 */
export function downloadAdresse(h: Handbuch): string {
  return `/${h.datei}`;
}

/**
 * ★★ Ein Eintrag, wie ihn die Bedienungssprache anbietet (EN7, 19.09.2026).
 *
 * Deutsch: der Eintrag unverändert. Englisch: englischer Titel und Satz - und,
 * wo es eine englische Ausgabe gibt, DEREN Datei, Speichername und Größe. So
 * bleibt die Liste EINE Liste; `HandbuchKnopf` fragt nur hier nach und lädt,
 * was herauskommt. Der Schutz ist derselbe: jede Datei liegt unter
 * `/handbuecher/`, nur für Angemeldete - ausser einem Eintrag mit
 * `oeffentlich: true` (das Plakat; `oeffentlich` wird mitgenommen).
 */
export function handbuchInSprache(h: Handbuch, gewaehlt: Sprache = "de"): Handbuch {
  // ★ G2a (02.10.2026): it/pl/tr/cs haben noch kein eigenes Heft und bekommen
  // die ENGLISCHE Fassung - nie die deutsche, die `h[sprache]` sonst liefern würde.
  // ★ O-TR (02.10.2026): tr hat jetzt eigene Titel (`h.tr`), die Datei bleibt englisch.
  // ★ O-CS (03.10.2026): cs hat eigene Titel (`h.cs`), die Datei bleibt englisch -
  // damit hat jede Sprache ihren Zweig, kein Rückfall mehr.
  // RÜCKFALL-EN (G2-NEUN): die neun Sprachen des Gerüsts haben noch kein Heft und keine Titel - sie bekommen die
  // ENGLISCHE Fassung, nie die deutsche (`if (!fassung) return h` unten gäbe sonst das deutsche Heft).
  // ★ O3 (30.10.2026): mit einer eigenen, GEMESSENEN Datei bekommen sie diese.
  const eigen = istGeruestSprache(gewaehlt) ? h[gewaehlt] : undefined;
  const sprache = istGeruestSprache(gewaehlt) && !(eigen?.datei && eigen.bytes) ? "en" : gewaehlt;
  if (sprache === "de") return h;
  // ★ ES-O (27.09.2026): spanischer Titel und Satz (`es`); eine spanische
  // Datei gibt es noch nicht - bis dahin die englische, wo es eine gibt.
  const fassung = h[sprache];
  if (!fassung) return h;
  // ★ E15: ohne eigene französische (★ ES-O: oder spanische) Datei die englische, wo es eine gibt.
  const datei = fassung.datei
    ? fassung
    : (sprache === "fr" || sprache === "es" || sprache === "it" || sprache === "pl" || sprache === "tr" || sprache === "cs") && h.en?.datei
      ? h.en
      : undefined;
  return {
    ...h,
    titel: fassung.titel,
    hinweis: fassung.hinweis,
    datei: datei?.datei ?? h.datei,
    speicherName: datei?.speicherName ?? h.speicherName,
    bytes: datei?.datei ? (datei.bytes ?? h.bytes) : h.bytes,
  };
}

/**
 * Größe als Satzteil - „742 KB" / „11,4 MB" (englisch „11.4 MB").
 *
 * ★ Warum das überhaupt dasteht: 11 MB in einem Schul-WLAN sind eine
 * Entscheidung, keine Nebensache. Eine Lehrkraft soll vor dem Antippen wissen,
 * worauf sie sich einlässt.
 */
export function groesse(bytes: number, sprache: Sprache = "de"): string {
  // ★ E15 (26.09.2026): als Tabelle - Französisch mit Komma und „Mo"/„Ko"
  // (Bauplan §9.1: Zahlen französisch).
  const art = GROESSE_ART[sprache];
  const mb = bytes / 1024 / 1024;
  if (mb >= 1) {
    const zahl = mb.toFixed(1);
    return `${art.komma ? zahl.replace(".", ",") : zahl} ${art.mb}`;
  }
  return `${Math.round(bytes / 1024)} ${art.kb}`;
}

const GROESSE_ART: Record<Sprache, { komma: boolean; mb: string; kb: string }> = {
  de: { komma: true, mb: "MB", kb: "KB" },
  en: { komma: false, mb: "MB", kb: "KB" },
  fr: { komma: true, mb: "Mo", kb: "Ko" },
  // ★ ES-O (27.09.2026): Dezimalpunkt wie überall in der spanischen Bedienung (RAE 2010).
  es: { komma: false, mb: "MB", kb: "KB" },
  // ★ O-IT: Dezimalkomma (Glossar Regel 5).
  it: { komma: true, mb: "MB", kb: "KB" },
  // ★ O-PL: Dezimalkomma (Glossar Regel 5, „1,2 MB").
  pl: { komma: true, mb: "MB", kb: "KB" },
  // ★ O-TR: Dezimalkomma (Glossar Regel 5, "1,2 MB").
  tr: { komma: true, mb: "MB", kb: "KB" },
  // ★ O-CS: Dezimalkomma (Glossar Regel 5, „1,2 MB").
  cs: { komma: true, mb: "MB", kb: "KB" },
  // ★ O3 (30.10.2026): alle neun mit Dezimalkomma (Glossare, Regel Zahlen: „1,2 MB"), bis dahin stand hier der englische Punkt.
  bg: { komma: true, mb: "MB", kb: "KB" },
  el: { komma: true, mb: "MB", kb: "KB" },
  hu: { komma: true, mb: "MB", kb: "KB" },
  nl: { komma: true, mb: "MB", kb: "KB" },
  pt: { komma: true, mb: "MB", kb: "KB" },
  br: { komma: true, mb: "MB", kb: "KB" },
  ro: { komma: true, mb: "MB", kb: "KB" },
  sv: { komma: true, mb: "MB", kb: "KB" },
  uk: { komma: true, mb: "MB", kb: "KB" },
};
