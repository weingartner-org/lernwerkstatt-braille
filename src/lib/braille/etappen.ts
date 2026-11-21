/**
 * Etappen-Pipeline für den Braille-Trainer (Bauvertrag §1.2).
 *
 * Reine Daten - kein React, kein Storage, keine ARIA-Logik.
 * Die Etappen docken per `levelId` an die eingefrorenen Level-ids an;
 * die Level-ids selbst werden NICHT verändert.
 *
 * Basisschrift b1-b14 (Kniese-Reihenfolge nach Lang/Hofer Tab. 1.4 / Kniese-Fibel;
 * Quellen siehe vocab.ts BASIS_KNIESE + Punktgenau-Hilfe). Verwechselpaar-Trennung
 * über die Etappenfolge. Voll/Computer (e11-e20b), Express (u1-u8) und Kurzschrift
 * (k1-k9) bleiben unverändert.
 */
import type { LehrSprache } from "./sprachen/aktuell";
import type { BrailleSystem } from "./tables";
import { MASTERY_ACC, MASTERY_MIN_ATTEMPTS, isLevelMastered } from "./adaptive";
import type { LevelMastery } from "./adaptive";
import type { BrailleProgress } from "./progress";
import { getLevelMastery, isLevelUnlocked } from "./progress";
import { hasGroupVoll } from "./engine";
import { firstLevelOf } from "./curriculum";
import { BASIS_KNIESE, BASIS_NAMEN } from "./vocab";
import { GRENZFALL_LESSONS, KFA_LESSONS, STRICHE_LESSONS, kfaSpoken } from "./kurzschrift_content";
import { grenzfallItems, kfaItems, stricheItems } from "./kurzschrift_material";
import { UEB_LESSONS, uebSpoken } from "./ueb_content";
import { uebItems } from "./ueb_material";

// --- Portierte Konstanten (aus typing/letters.ts, eigene Deklaration) --------
/** Tempo-freie saubere Lesungen je Einheit, die als „sitzt" gelten (PATIENCE_SAMPLES). */
export const PATIENCE_BRAILLE = 16;
/** So viele wackelige Einheiten erlauben noch die nächste Freischaltung. */
export const MAX_WOBBLY = 3;
/** Versuche je Einheit vor dem ersten Urteil. */
export const MIN_SAMPLES = 5;
/** Treffsicherheit „sitzt" (= MASTERY_ACC). */
export const TARGET_ACC = 0.9;
/** Darunter „hakt" - blockiert Freischaltung. */
export const STRUGGLE_ACC = 0.8;
/** Milde tempo-freie Brücke Basis→Voll. */
export const BRIDGE_ACC = 0.75;
/** Fenster der Pro-Einheit-Statistik. */
export const RECENT_WINDOW = 20;

// --- Interfaces (Bauvertrag §1.2) --------------------------------------------

/** Freischaltbare Einheit innerhalb einer Etappe (ein Zeichen, eine Lautgruppe). */
export interface EtappenUnit {
  /** Stabiler Schlüssel - geht in Telemetrie `typed`/`unit` ein. */
  key: string;
  /** Sprechbares Label fürs Kind / ARIA. */
  spoken: string;
}

/** Mastery-Tor einer Etappe. */
export interface EtappenGate {
  minAcc: number;
  minAttempts: number;
  /** Tempo-freie saubere Lesungen = „sitzt" (Geduldsregel). 0 = aus. */
  patience: number;
}

/** Feinste Lerneinheit innerhalb eines bestehenden Levels. */
export interface Etappe {
  /** Stabile Etappen-id - NICHT die Level-id. */
  id: string;
  /** Eingefrorene Level-id (Andockpunkt). */
  levelId: string;
  system: BrailleSystem;
  title: string;
  /** Neu eingeführte Einheiten (in didaktischer Reihenfolge). */
  introducedUnits: EtappenUnit[];
  /** Kind-Ansprache „Du" - eigener Merksatz, NIE BSKDL/KFA-Zitat. */
  introDu: string;
  /** Studi-Ansprache „Sie" - Erklärtext mit Berufsbezug. */
  introSie: string;
  /** Legende Druckschrift→Braille; "" wenn keine neue Einheit. */
  legend: string;
  /**
   * Additiv (22.09.2026): reine Lernzeichen für die Kästchen unter der
   * Legende, wenn `legend` ein SATZ für Menschen ist (Punktnummern, „=",
   * das Braille-Zeichen selbst - z. B. „ei = ⠩ (1-4-6) · ie = ⠬ (3-4-6)")
   * und nicht Zeichen-für-Zeichen bzw. wortweise zerlegt werden darf. Fehlt
   * es, zerlegt `Legend` weiterhin `legend` selbst wie bisher - unverändert
   * für jede Etappe, deren Legende schon eine reine Zeichenliste ist (z. B.
   * "l a i m").
   */
  zeichen?: string[];
  /** Aufgaben-Filter: welche Items dieser Etappe „gehören". Pure Funktion. */
  items: (allItems: readonly string[]) => readonly string[];
  masteryGate: EtappenGate;
  /**
   * NEU (P5, additiv): Lernsprache. Fehlt = "de" (alle P1-P4-Etappen).
   * "en" setzen nur UEB-Etappen - steuert Adapter-Tabelle + Kind-Texte.
   * Geht NICHT in system-Telemetrie ein.
   */
  lang?: LehrSprache;
  /**
   * Aufgaben-Art-Override (additiv): Etappen mit EIGENEM festen Aufgaben-Pool,
   * die an ein Generator-Level (kind "numbers"/"math") andocken, setzen hier
   * "words" - sonst verwirft der Runner ihre items() und würfelt Zufallszahlen
   * (Befund 2026-07-09: b13a-e stellten „91,5" statt römischer Zahlen).
   */
  kindOverride?: "words";
}

/** Pro-Einheit-Statistik (Fenster RECENT_WINDOW), aus TaskEvent abgeleitet. */
export interface UnitStat {
  hits: number;
  misses: number;
  recent: number[];
}

export type UnitLevel = "neu" | "hakt" | "wackelig" | "sitzt";

// --- Hilfsfunktionen (pure) --------------------------------------------------

/** Default-Tor: { minAcc: 0.9, minAttempts: 12, patience: 16 }. */
export function defaultGate(): EtappenGate {
  return {
    minAcc: MASTERY_ACC,
    minAttempts: MASTERY_MIN_ATTEMPTS,
    patience: PATIENCE_BRAILLE,
  };
}

/**
 * Filtert Items, deren Buchstaben (lowercased, ohne Leer-/Satzzeichen) ⊆ allowed.
 * `allowDigits`: Ziffern ebenfalls durchlassen.
 */
function onlyLetters(
  allowed: Set<string>,
  allowDigits = false,
): (items: readonly string[]) => string[] {
  return (items) =>
    items.filter((w) => {
      for (const ch of w.toLowerCase()) {
        if (ch === " " || ".,?!;:-/'–—„“”«»".includes(ch))
          continue;
        if (allowDigits && "0123456789".includes(ch)) continue;
        if (!allowed.has(ch)) return false;
      }
      return true;
    });
}

// Kumulative Kniese-Buchstabenmengen je Basis-Etappe (Lang/Hofer Tab. 1.4 -
// Kniese-Stiftung: l,a,i,m,s,u,o,d,n,e; Fortsetzung nach taktiler Distinktheit).
const SET_B1 = new Set(["l", "a", "i", "m"]);
const SET_B2 = new Set([...SET_B1, "s", "u", "o"]);
const SET_B3 = new Set([...SET_B2, "d", "n", "e"]); // Kniese-10 komplett
const SET_B5 = new Set([...SET_B3, "r", "t", "h"]);
const SET_B6 = new Set([...SET_B5, "g", "b", "k"]);
const SET_B7 = new Set([...SET_B6, "w", "f", "z"]);
const SET_B8 = new Set([...SET_B7, "p", "v", "j"]);
const SET_B9 = new Set([...SET_B8, "c", "q", "x", "y"]); // alle 26 Buchstaben
const SET_B10 = new Set([...SET_B9, "ä", "ö", "ü", "ß"]); // + Umlaute/ß

const DG = defaultGate();

// --- b13 Zusatz-Etappen „erweiterte Zahlen" (zuschaltbar via setup.extendedNumbers) ---
const B13_EXTENDED: Etappe[] = [
  {
    id: "b13a",
    levelId: "l6-zahlen",
    system: "basis",
    title: "Römische Zahlen",
    introducedUnits: [{ key: "röm", spoken: "römische Zahl" }],
    introDu:
      "Römische Zahlen schreibst du mit Großbuchstaben: I, V, X, L, C, D, M. Davor steht die Groß-Ankündigung statt des Zahlzeichens.",
    introSie:
      "Römische Zahlen als Großbuchstabenfolge. Weil mindestens zwei Großbuchstaben aufeinander folgen, steht EINE Wort-Ankündigung (Punkte 4·5) vor der ganzen Zahl - nicht vor jedem Buchstaben eine Buchstaben-Ankündigung (4·6). Gemessen 22.09.2026 an allen acht Items. KEIN Zahlzeichen — wichtiger Sonderfall für Jahreszahlen/Kapitel.",
    legend: "I V X L C D M",
    items: () => ["IV", "IX", "XII", "XL", "MCM", "MMXXVI", "VII", "III"],
    kindOverride: "words",
    masteryGate: DG,
  },
  {
    id: "b13b",
    levelId: "l6-zahlen",
    system: "basis",
    title: "Datum",
    introducedUnits: [{ key: "datum", spoken: "Datum" }],
    introDu:
      "Ein Datum schreibst du mit Punkten zwischen den Zahlen: 28.6.2026. Jede Zahl bekommt wieder ihr Zahlzeichen.",
    introSie:
      "Datumsangaben: Zahlzeichen je Zahlgruppe, Punkt (Punkt 3) als Trenner. Übung des wiederholten Zahlzeichens nach Satzzeichen.",
    legend: ".",
    items: () => ["1.1.2026", "28.6.2026", "3.10.1990", "24.12.", "1.5.", "31.12.2025"],
    kindOverride: "words",
    masteryGate: DG,
  },
  {
    id: "b13c",
    levelId: "l6-zahlen",
    system: "basis",
    title: "Brüche",
    // ★★★ 22.09.2026 (Johannes): Schulbücher werden am PC mit Computerbraille
    // gelesen, aber auf Papier - vor allem in der Volksschule - gilt die
    // 6-Punkt Marburger Mathematikschrift, NICHT die Textschrift-Engine.
    // Kein Schrägstrich: der Nenner rückt eine Punktreihe tiefer (gesenkte
    // Schreibweise, Kap. 9.1) - siehe marburgerMathe.ts. Der Schrägstrich war
    // vorher die abgeschaffte Divisionszeichen-Zelle ⠲ (Kap. 5, Hinweis
    // Z. 2694), lehrte also ein gestrichenes Zeichen.
    introducedUnits: [{ key: "bruch", spoken: "Bruch" }],
    introDu:
      "Beim Bruch schreibst du zuerst den Zähler ganz normal. Der Nenner darunter rutscht eine Punktreihe tiefer - ohne Schrägstrich und ohne eigenes Zahlzeichen: 1/2, 3/4.",
    introSie:
      "Zahlenbrüche aus positiven ganzen Zahlen (Marburger Mathematikschrift, Kap. 9.1): Zähler in Standardschreibweise mit Zahlzeichen, Nenner unmittelbar angeschlossen in gesenkter Schreibweise - ohne Bruchstrich, ohne Leerzeichen, ohne eigenes Zahlzeichen für den Nenner. Kein Divisionszeichen (das frühere ⠲ ist gestrichen und heute die gesenkte 4).",
    legend: "1/2 3/4",
    items: () => ["1/2", "3/4", "1/4", "2/3", "5/8", "7/10"],
    kindOverride: "words",
    masteryGate: DG,
  },
  {
    id: "b13d",
    levelId: "l6-zahlen",
    system: "basis",
    title: "Prozent",
    introducedUnits: [{ key: "%", spoken: "Prozent" }],
    introDu: "Prozent hat ein eigenes Zeichen, das nach der Zahl steht: 50%, 100%.",
    introSie:
      "Prozentangaben. Das 6-Punkt-Prozentzeichen ist dreizellig (Zahlzeichen · j · Punkte 3·5·6) — Muster aus liblouis de-g0 übernommen (verifiziert 2026-07-09).",
    legend: "%",
    items: () => ["50%", "100%", "25%", "10%", "75%", "99%"],
    kindOverride: "words",
    masteryGate: DG,
  },
  {
    id: "b13e",
    levelId: "l6-zahlen",
    system: "basis",
    title: "Paragraf",
    introducedUnits: [{ key: "§", spoken: "Paragraf" }],
    introDu: "Das Paragrafzeichen § steht vor einer Gesetzeszahl: §22, §1.",
    introSie:
      "Paragrafzeichen (Berufsbezug Recht/Verwaltung). Eine Zelle, Punkte 3·4·6 — Muster aus liblouis de-g0/de-chardefs6 übernommen (verifiziert 2026-07-09).",
    legend: "§",
    items: () => ["§1", "§22", "§5", "§90", "§211"],
    kindOverride: "words",
    masteryGate: DG,
  },
];

// --- Kurzschrift: 48 KFA-Lektionen (Umbau 03.07.2026) ------------------------
// Je Lektion EINE Etappe, programmatisch aus kurzschrift_content.ts gebaut.
// Struktur + Kürzungsinventar exakt nach „Kurzschrift für alle" (48 Lektionen,
// Systematik des Regelwerks 2018); alle Texte/Übungen eigenformuliert.
// levelId = "kurz-kfa01".."kurz-kfa48" (das „kurz-"-Präfix schaltet den
// async-de-g2-Löser im Runner). system "voll" - Kurzschrift ist 6-Punkt.
// Die Punktmuster kommen zur Laufzeit aus liblouis de-g2 (nie hier hartkodiert).

/** Die 48 Kurzschrift-Etappen (kfa01..kfa48), aus den Lektions-Daten gebaut. */
export const KURZ_ETAPPEN: Etappe[] = KFA_LESSONS.map((l) => ({
  id: l.id, // "kfa01".."kfa48"
  levelId: `kurz-${l.id}`,
  system: "voll" as const,
  title: `Lektion ${l.nr}: ${l.title}`,
  // L48-Anzeigezeichen (kind "zeichen", keys "zx-…") sind keine übbaren
  // Kürzungen, gehören aber in die Zeichenliste - deren Punktmuster kommen aus
  // KFA_ZEICHEN_DOTS, nicht aus liblouis (die Liste erkennt sie am Präfix).
  // Vorher waren sie herausgefiltert → Lektion 48 fehlte im Nachschlagewerk
  // komplett (Befund 2026-07-09).
  introducedUnits: l.units.map((u) => ({ key: u.key, spoken: kfaSpoken(u) })),
  introDu: l.introDu,
  introSie: l.introSie,
  legend: l.units.map((u) => u.print).join(" · "),
  // Übungs-Items: ausschließlich das build-time geprüfte Lektions-Material
  // (nur Kürzungen bereits gelernter Lektionen - KFA-Grundprinzip).
  items: () => kfaItems(l.id),
  masteryGate: defaultGate(),
}));

// --- Kurzschrift: Striche (additiv, 22.09.2026) ------------------------------
// Vier Etappen NACH den 48 KFA-Lektionen, VOR „kurz-texte" (Begründung + Quelle
// im Kopfkommentar von kurzschrift_content.ts). levelId = "kurz-striche01".."
// kurz-striche04" (dasselbe "kurz-"-Präfix wie KURZ_ETAPPEN schaltet denselben
// async-de-g2-Löser im Runner ein). system "voll" - Kurzschrift ist 6-Punkt.
// Die Punktmuster kommen zur Laufzeit aus liblouis de-g2 (nie hier hartkodiert).
export const STRICHE_ETAPPEN: Etappe[] = STRICHE_LESSONS.map((l) => ({
  id: l.id, // "striche01".."striche04"
  levelId: `kurz-${l.id}`,
  system: "voll" as const,
  title: `Striche ${l.nr}: ${l.title}`,
  introducedUnits: l.units.map((u) => ({ key: u.key, spoken: kfaSpoken(u) })),
  introDu: l.introDu,
  introSie: l.introSie,
  legend: l.units.map((u) => u.print).join(" · "),
  items: () => stricheItems(l.id),
  masteryGate: defaultGate(),
}));

// --- Kurzschrift: Grenzfaelle (additiv, 23.09.2026) --------------------------
// Vier Etappen NACH den Striche-Etappen, VOR "kurz-texte". Sie ueben das
// Gegenteil des uebrigen Materials: Woerter, in denen die Buchstaben einer
// Kuerzung vorkommen, ohne dass eine gilt (Quelle + Begruendung im
// Kopfkommentar von kurzschrift_content.ts). Gleicher Aufbau wie
// STRICHE_ETAPPEN; Punktmuster zur Laufzeit aus liblouis de-g2.
export const GRENZFALL_ETAPPEN: Etappe[] = GRENZFALL_LESSONS.map((l) => ({
  id: l.id, // "grenz01".."grenz04"
  levelId: `kurz-${l.id}`,
  system: "voll" as const,
  title: `Grenzfälle ${l.nr}: ${l.title}`,
  introducedUnits: l.units.map((u) => ({ key: u.key, spoken: kfaSpoken(u) })),
  introDu: l.introDu,
  introSie: l.introSie,
  legend: l.units.map((u) => u.print).join(" · "),
  items: () => grenzfallItems(l.id),
  masteryGate: defaultGate(),
}));

// --- UEB (Englisch Grade 2): 19 Lektionen L4-L22 (Kurzschrift-Kern) ----------
// Je Manual-Lektion EINE Etappe, programmatisch aus ueb_content.ts gebaut.
// Reihenfolge + Kürzungsinventar nach „Unified English Braille: Australian
// Training Manual 2013" (CC BY-NC-ND 3.0) = Grundlage von UEB Online; Regeln:
// ICEB Rules of UEB. Punktmuster zur Laufzeit aus liblouis en-ueb-g2 (solveUeb).
// levelId = id = "ueb-l04".."ueb-l22" (Präfix „ueb-" schaltet den en-ueb-g2-Löser).
// system "voll" (6-Punkt). Texte/Übungen eigenformuliert (siehe ueb_content).
// key der Einheiten = die lösbare Form (wie KFA: key===print) - solveUeb(form).

// Brücken-Etappe „ueb-l00" VOR L4: die UEB-Besonderheiten für Braille-Kundige.
// Zielgruppe kann Voll-/Kurzschrift → Alphabet & Ziffern sind identisch; neu sind
// nur Großzeichen (Punkt 6), Zahlzeichen-Bestätigung und Satzzeichen. Material
// (ueb-l00) ist bewusst KÜRZUNGSFREI (Namen + Zahlen), damit man wirklich bei
// Null starten kann. Keine volle L1-3 (das wäre für die Zielgruppe Doppelarbeit).
const UEB_BRIDGE: Etappe = {
  id: "ueb-l00",
  levelId: "ueb-l00",
  system: "voll",
  title: "Getting started: capitals, numbers, punctuation",
  introducedUnits: [
    { key: "A", spoken: "the capital sign — a dot-six sign before a capital letter" },
    { key: "1", spoken: "the number sign — placed before digits" },
    { key: ".", spoken: "the full stop" },
    { key: ",", spoken: "the comma" },
    { key: "?", spoken: "the question mark" },
    { key: "!", spoken: "the exclamation mark" },
  ],
  introDu:
    "Before the contractions, two little signs you meet everywhere: a dot-six sign in " +
    "front of a letter makes it a CAPITAL, and the number sign goes in front of digits. " +
    "Add the full stop, comma, question mark and exclamation mark and you are ready. You " +
    "already read braille letters and numbers — this is just what English puts on top.",
  introSie:
    "Brücke vor Lektion 4: UEB-Besonderheiten für Braille-Kundige. Großzeichen (Punkt 6 " +
    "vor dem Buchstaben; ganzes Großwort = doppeltes Zeichen), Zahlzeichen (wie bekannt) " +
    "und Satzzeichen. Alphabet und Ziffern sind mit der deutschen Braille identisch — hier " +
    "nur das englisch Zusätzliche. Übung: kürzungsfreie Namen und Zahlen.",
  legend: "A · 1 · . · , · ? · !",
  items: () => uebItems("ueb-l00"),
  masteryGate: defaultGate(),
  lang: "en",
};

/** Die UEB-Etappen: Brücke (ueb-l00) + 19 Lektionen (ueb-l04..ueb-l22). */
export const UEB_ETAPPEN: Etappe[] = [
  UEB_BRIDGE,
  ...UEB_LESSONS.map((l) => ({
    id: l.id,
    levelId: l.id,
    system: "voll" as const,
    title: `Lesson ${l.nr}: ${l.title}`,
    introducedUnits: l.units.map((u) => ({ key: u.form, spoken: uebSpoken(u) })),
    introDu: l.introDu,
    introSie: l.introSie,
    legend: l.units.map((u) => u.print).join(" · "),
    items: () => uebItems(l.id),
    masteryGate: defaultGate(),
    lang: "en" as const,
  })),
];

// --- Basisschrift b1-b14 (Kniese-Reihenfolge, Lang/Hofer Tab. 1.4) -----------
// Die Buchstaben-Etappen ziehen ihre Wörter aus BASIS_KNIESE (vocab.ts) und
// filtern über die kumulative Buchstabenmenge - die angedockte levelId liefert
// nur kind/Legende. So bleiben die eingefrorenen Level-Wortlisten (Arbeitsheft-
// Embeds) unberührt. Verwechselpaare sind über die Etappenfolge getrennt
// (i in b1 ↔ e in b3; d in b3 ↔ f in b7; h in b5 ↔ j in b8; r in b5 ↔ w in b7).
export const ETAPPEN: Etappe[] = [
  // b1 - l, a, i, m: erste taktil prägnante Buchstaben, sofort echte Wörter
  {
    id: "b1",
    levelId: "l1-reihe1",
    system: "basis",
    title: "l, a, i, m — die ersten Tastbilder",
    introducedUnits: [
      { key: "l", spoken: "el" },
      { key: "a", spoken: "a" },
      { key: "i", spoken: "i" },
      { key: "m", spoken: "em" },
    ],
    introDu:
      "Wir starten mit vier gut zu ertastenden Buchstaben: l, a, i und m. Damit schreibst du sofort echte Wörter — „Mama“ und „Lama“. Tippe mit, dann hörst du, ob es sitzt.",
    introSie:
      "Einstieg nach der Kniese-Fibelreihenfolge (Lang/Hofer, Tab. 1.4): l, a, i, m sind taktil prägnant und schreibmotorisch einfach. Mit ihnen entstehen sofort sinnvolle Wörter (Mama, Lama) — Bedeutung statt isolierter Zeichen (Lang: Ganzwort-Einstieg).",
    legend: "l a i m",
    items: () => onlyLetters(SET_B1)(BASIS_KNIESE),
    masteryGate: DG,
  },

  // b2 - + s, u, o
  {
    id: "b2",
    levelId: "l1-reihe1",
    system: "basis",
    title: "s, u, o — viele neue Wörter",
    introducedUnits: [
      { key: "s", spoken: "es" },
      { key: "u", spoken: "u" },
      { key: "o", spoken: "o" },
    ],
    introDu:
      "Drei neue dazu: s, u und o. Jetzt gelingen schon viele Wörter wie „Maus“, „Oma“ und „Salami“.",
    introSie:
      "Fortsetzung der Kniese-Reihe (s, u, o). Mit den nun sieben Buchstaben wächst der Wortschatz deutlich (Maus, Oma, Salami) — weiter lautorientiert, nicht nach Zell-Systematik.",
    legend: "s u o",
    items: () => onlyLetters(SET_B2)(BASIS_KNIESE),
    masteryGate: DG,
  },

  // b3 - + d, n, e: Kniese-10 komplett
  {
    id: "b3",
    levelId: "l1-reihe1",
    system: "basis",
    title: "d, n, e — die ersten zehn sitzen",
    introducedUnits: [
      { key: "d", spoken: "de" },
      { key: "n", spoken: "en" },
      { key: "e", spoken: "e" },
    ],
    introDu:
      "Mit d, n und e ist der erste Zehnerblock voll. Du tastest jetzt Wörter wie „Nadel“, „Insel“ und „Limonade“.",
    introSie:
      "Abschluss der zehn Kniese-Erstbuchstaben (l,a,i,m,s,u,o,d,n,e). e folgt bewusst spät und weit getrennt von i (taktil ähnlich) — die Reihenfolge selbst trennt die Verwechselpaare. Reichhaltiger Wortschatz aus zehn Buchstaben (Nadel, Insel, Limonade).",
    legend: "d n e",
    items: () => onlyLetters(SET_B3)(BASIS_KNIESE),
    masteryGate: DG,
  },

  // --- Basisschrift: Suchaufgabe (additiv, 23.09.2026) -----------------------
  // NACH b3, wo das Kind die ersten zehn Kniese-Buchstaben kennt - vorher gibt
  // es zu wenige Ablenker. Die Aufgabe ist eine LESE-Aufgabe mit anderer Frage
  // ("wo steht es?"), keine dritte Richtung; Begruendung im Kopf von
  // lib/braille/suchaufgabe.ts. Vorbild: Punktum-Kurs des DBSV, der fuenf
  // solche Aufgabentypen kennt.
  {
    id: "b-suchen",
    levelId: "basis-suchen",
    system: "basis",
    title: "Finde das Zeichen",
    introducedUnits: [],
    introDu:
      "Kein neues Zeichen - eine neue Frage. Unter der Reihe steht bei jedem Zeichen seine Platznummer. Taste die Reihe von links nach rechts ab und zähle mit, bis du das gesuchte Zeichen findest. Je sicherer du wirst, desto ähnlicher werden die Zeichen daneben.",
    introSie:
      "Suchaufgabe statt Lese-Aufgabe: Das Kind tastet eine Reihe ab und nennt die Stelle des gesuchten Zeichens. Geübt wird die Taststrategie (einer Zeile folgen, ohne zu verrutschen) und die Unterscheidung ähnlicher Zellen. Die Ablenker werden mit der Anforderungsstufe ähnlicher - gesteuert über den Punktabstand (Hamming), nicht über eine gepflegte Verwechslerliste. Vorbild: Punktum-Kurs des DBSV (Aufgabentyp \"Zeichen finden\").",
    legend: "",
    items: (all) => all,
    masteryGate: DG,
  },

  // b4 - Großbuchstaben über Eigennamen (früh, Lang: Ganzwort-Einstieg)
  {
    id: "b4",
    levelId: "l4-woerter",
    system: "basis",
    title: "Große Anfangsbuchstaben — Namen",
    introducedUnits: [{ key: "CAPS", spoken: "Groß-Ankündigung" }],
    introDu:
      "Im Braille gibt es kein eigenes großes A. Ein kleines Vorzeichen — Punkte 4 und 6 — kündigt einen Großbuchstaben an. So wird aus „lina“ der Name „Lina“. Wir üben das gleich mit echten Namen.",
    introSie:
      "Großschreibung wird früh über Eigennamen eingeführt (Lang: logographemischer/Ganzwort-Einstieg). Die Groß-Ankündigung (Punkte 4·6) steht direkt vor dem Buchstaben. Die Namen nutzen nur die zehn Kniese-Buchstaben — bewusster Kontrast zu E17 (Computerbraille: Großschreibung über Punkt 7 in derselben Zelle).",
    legend: "Lina = ⠨ l i n a",
    zeichen: ["Lina"],
    items: () => BASIS_NAMEN,
    masteryGate: DG,
  },

  // b5 - + r, t, h
  {
    id: "b5",
    levelId: "l2-reihe2",
    system: "basis",
    title: "r, t, h — noch mehr Buchstaben",
    introducedUnits: [
      { key: "r", spoken: "er" },
      { key: "t", spoken: "te" },
      { key: "h", spoken: "ha" },
    ],
    introDu:
      "Weiter geht's mit r, t und h. Damit kommen Wörter wie „Tante“, „Uhr“ und „Monitor“ dazu.",
    introSie:
      "Fortführung nach taktiler Distinktheit und Häufigkeit (r, t, h). r bleibt durch mehrere Etappen vom später folgenden w getrennt (Verwechslerschutz), h vom später folgenden j.",
    legend: "r t h",
    items: () => onlyLetters(SET_B5)(BASIS_KNIESE),
    masteryGate: DG,
  },

  // b6 - + g, b, k
  {
    id: "b6",
    levelId: "l2-reihe2",
    system: "basis",
    title: "g, b, k",
    introducedUnits: [
      { key: "g", spoken: "ge" },
      { key: "b", spoken: "be" },
      { key: "k", spoken: "ka" },
    ],
    introDu:
      "g, b und k bringen viele neue Wörter: „Berg“, „Garten“, „Krone“.",
    introSie:
      "g, b, k erweitern den Konsonantenbestand — weiter nach taktiler Distinktheit und Häufigkeit.",
    legend: "g b k",
    items: () => onlyLetters(SET_B6)(BASIS_KNIESE),
    masteryGate: DG,
  },

  // b7 - + w, f, z (w getrennt von r)
  {
    id: "b7",
    levelId: "l3-reihe3",
    system: "basis",
    title: "w, f, z",
    introducedUnits: [
      { key: "w", spoken: "we" },
      { key: "f", spoken: "ef" },
      { key: "z", spoken: "zet" },
    ],
    introDu:
      "w, f und z — jetzt gelingen „Wald“, „Fenster“ und „Zwerg“. Achtung: w fühlt sich dem r ähnlich; das w ist breiter und sitzt rechts.",
    introSie:
      "w, f, z. w wird bewusst erst hier eingeführt — mehrere Etappen nach r —, weil r (Punkte 1·2·3·5) und w (Punkte 2·4·5·6) taktil verwechselbar sind (Verwechslerschutz, Lang).",
    legend: "w f z",
    items: () => onlyLetters(SET_B7)(BASIS_KNIESE),
    masteryGate: DG,
  },

  // b8 - + p, v, j (j getrennt von h)
  {
    id: "b8",
    levelId: "l3-reihe3",
    system: "basis",
    title: "p, v, j",
    introducedUnits: [
      { key: "p", spoken: "pe" },
      { key: "v", spoken: "fau" },
      { key: "j", spoken: "jot" },
    ],
    introDu:
      "p, v und j: „Apfel“, „Vogel“, „Januar“. Drei seltenere Buchstaben, die du jetzt sicher dazunimmst.",
    introSie:
      "p, v, j. j folgt mehrere Etappen nach h — die beiden gelten als Verwechselpaar und werden über die Reihenfolge getrennt gehalten.",
    legend: "p v j",
    items: () => onlyLetters(SET_B8)(BASIS_KNIESE),
    masteryGate: DG,
  },

  // b9 - + c, q, x, y: seltene Buchstaben, Alphabet komplett
  {
    id: "b9",
    levelId: "l3-reihe3",
    system: "basis",
    title: "c, q, x, y — die seltenen",
    introducedUnits: [
      { key: "c", spoken: "ce" },
      { key: "q", spoken: "ku" },
      { key: "x", spoken: "iks" },
      { key: "y", spoken: "üpsilon" },
    ],
    introDu:
      "Die seltenen Buchstaben c, q, x und y. Damit schreibst du „Quark“, „Taxi“ und „Yoga“ — und kennst jetzt das ganze Alphabet.",
    introSie:
      "Die selteneren c, q, x, y schließen das Grundalphabet ab (alle 26 Buchstaben eingeführt). Niedrige Häufigkeit → bewusst am Ende der Buchstabenkette.",
    legend: "c q x y",
    items: () => onlyLetters(SET_B9)(BASIS_KNIESE),
    masteryGate: DG,
  },

  // b10 - + ä, ö, ü, ß: Umlaute als geschlossene Gruppe
  {
    id: "b10",
    levelId: "l3-reihe3",
    system: "basis",
    title: "ä, ö, ü und ß",
    introducedUnits: [
      { key: "ä", spoken: "ä" },
      { key: "ö", spoken: "ö" },
      { key: "ü", spoken: "ü" },
      { key: "ß", spoken: "eszett" },
    ],
    introDu:
      "Die deutschen Sonderbuchstaben: ä, ö, ü und das ß. Wir üben sie gleich in echten Wörtern wie „grün“, „süß“ und „Frühling“.",
    introSie:
      "Umlaute und ß als geschlossene Gruppe nach gefestigtem Grundalphabet. Eigenständige Zellen (keine Punkt-Aufstockung). Gefiltert auf Wörter mit mindestens einem Umlaut/ß.",
    legend: "ä ö ü ß",
    items: () =>
      onlyLetters(SET_B10)(BASIS_KNIESE).filter((w) => /[äöüß]/.test(w.toLowerCase())),
    masteryGate: DG,
  },

  // b11 - Festigung: alle Buchstaben gemischt (keine neue Einheit)
  {
    id: "b11",
    levelId: "l4-woerter",
    system: "basis",
    title: "Alle Buchstaben gemischt",
    introducedUnits: [],
    introDu:
      "Kein neues Zeichen — jetzt mischen wir alles. Du tastest ganze Wörter mit allen Buchstaben, die du kennst. Das festigt, was noch wackelt.",
    introSie:
      "Reine Festigungsetappe (keine neuen Einheiten) über den großen gemischten Wortpool (l4-woerter). Das adaptive Gewichtungssystem (pickWeighted) zieht schwächste/zuletzt verwechselte Buchstaben häufiger.",
    legend: "",
    items: (all) => all,
    masteryGate: DG,
  },

  // b12 - Satzzeichen im Kontext
  {
    id: "b12",
    levelId: "l7-satzzeichen",
    system: "basis",
    title: "Punkt, Komma, Frage- und Ausrufezeichen",
    introducedUnits: [
      { key: ".", spoken: "Punkt" },
      { key: ",", spoken: "Komma" },
      { key: "?", spoken: "Fragezeichen" },
      { key: "!", spoken: "Ausrufezeichen" },
    ],
    introDu:
      "Jetzt die Satzzeichen: Punkt, Komma, Fragezeichen und Ausrufezeichen. Sie sitzen alle in der unteren Hälfte der Zelle. Du übst sie gleich in kurzen Ausrufen wie „Toll!“.",
    introSie:
      "Interpunktion im Satzkontext, nicht isoliert: Punkt = Punkte 2·5·6, Komma = Punkt 2, Fragezeichen = Punkte 2·6, Ausrufezeichen = Punkte 2·3·5 — alle in der unteren Zellhälfte, taktiler Kontrast zu Buchstaben bewusst gemacht.",
    legend: ".,?!",
    items: (all) => all,
    masteryGate: DG,
  },

  // b13 - Zahlen mit dem Zahlzeichen (+ optionaler Sammelschalter „erweiterte Zahlen")
  {
    id: "b13",
    levelId: "l6-zahlen",
    system: "basis",
    title: "Zahlen mit dem Zahlzeichen",
    introducedUnits: [
      { key: "#", spoken: "Zahlzeichen" },
      { key: "1", spoken: "Eins" },
      { key: "2", spoken: "Zwei" },
      { key: "3", spoken: "Drei" },
      { key: "4", spoken: "Vier" },
      { key: "5", spoken: "Fünf" },
      { key: "6", spoken: "Sechs" },
      { key: "7", spoken: "Sieben" },
      { key: "8", spoken: "Acht" },
      { key: "9", spoken: "Neun" },
      { key: "0", spoken: "Null" },
    ],
    introDu:
      "Zahlen haben einen Trick: Vor jeder Zahl steht ein Zahlzeichen. Danach sind die Buchstaben a bis j die Ziffern 1 bis 0. a wird zur 1, b zur 2 — und j ist die 0.",
    introSie:
      "Das Zahlzeichen (Punkte 3·4·5·6) schaltet die folgenden Zellen auf Ziffern-Lesart: a–j = 1–9,0. Diese Doppelbelegung ist der zentrale Kontrast zu E18 (Computerbraille ohne Zahlzeichen).",
    legend: "1234567890",
    // l6-zahlen (kind:'numbers') erzeugt Items via buildLevelDeck - items() ist Durchreiche
    items: (all) => all,
    masteryGate: DG,
  },

  // b13a-b13e (zuschaltbar via setup.extendedNumbers)
  ...B13_EXTENDED,

  // b14 - Basisschrift-Lesetext (Fanfare „Basisschrift gemeistert")
  {
    id: "b14",
    levelId: "basis-texte",
    system: "basis",
    title: "Ganze Texte lesen und schreiben",
    introducedUnits: [],
    introDu:
      "Geschafft — du kannst die ganze Basisschrift! Jetzt liest und schreibst du richtige kleine Geschichten. Am Ende wartet eine große Belohnung.",
    introSie:
      "Abschluss-Etappe der Basisschrift: zusammenhängende Texte integrieren alle bisherigen Einheiten. Das Erreichen löst die Fanfare „Basisschrift gemeistert“ (playUnlockFanfare + ARIA-Live) und die milde Brücke (BRIDGE_ACC) zur Vollschrift aus.",
    legend: "",
    items: (all) => all,
    masteryGate: DG,
  },

  // --- Vollschrift E11-E15 (P2) ------------------------------------------------

  // E11 - Lautgruppen: ei & ie
  {
    id: "e11",
    levelId: "voll-ei-ie",
    system: "voll",
    title: "Lautgruppen: ei & ie",
    introducedUnits: [
      { key: "ei", spoken: "die Lautgruppe ei" },
      { key: "ie", spoken: "die Lautgruppe ie" },
    ],
    introDu:
      "Neue Tuer! Ab jetzt werden ei und ie zu einer einzigen Zelle. Hoer genau hin: ei steckt in mein, ie in Liebe. Eine Zelle weniger zu tippen — und du erkennst die beiden sofort.",
    introSie:
      "Die Vollschrift fasst die haeufigsten Lautgruppen zu je einer Zelle zusammen. »ei« (Punkte 1-4-6) und »ie« (Punkte 3-4-6) sind die haeufigsten und damit der Einstieg. Fuer die Praxis zentral: Lernende verwechseln ei und ie gern, weil beide auf einem vollen Vokal-Bild liegen — trennen Sie die beiden im Kopf ueber die Beispielwoerter mein/Liebe.",
    legend: "ei = ⠩ (1-4-6) · ie = ⠬ (3-4-6)",
    zeichen: ["ei", "ie"],
    items: (all) => all.filter((w) => hasGroupVoll(w, "ei") || hasGroupVoll(w, "ie")),
    masteryGate: DG,
  },

  // E12 - Lautgruppen: au, eu & äu
  {
    id: "e12",
    levelId: "voll-au-eu-aeu",
    system: "voll",
    title: "Lautgruppen: au, eu & äu",
    introducedUnits: [
      { key: "au", spoken: "die Lautgruppe au" },
      { key: "eu", spoken: "die Lautgruppe eu" },
      { key: "äu", spoken: "die Lautgruppe äu" },
    ],
    introDu:
      "Drei neue Tueren auf einmal: »au« (Haus), »eu« (heute) und das umgelautete »äu« (Bäume). Sie klingen verwandt — äu ist das ä-Geschwister von au. Jede spart wieder eine Zelle.",
    introSie:
      "»au« (1-6), »eu« (1-2-6) und »äu« (3-4) bilden eine Lautfamilie. Didaktisch wichtig: äu erscheint fast nur im Plural/in Ableitungen (Haus→Häuser, laufen→läuft) — das hilft Lernenden, es vom au zu unterscheiden, statt es als eigenes, beziehungsloses Zeichen zu pauken.",
    legend: "au = ⠡ (1-6) · eu = ⠣ (1-2-6) · äu = ⠌ (3-4)",
    zeichen: ["au", "eu", "äu"],
    items: (all) =>
      all.filter(
        (w) => hasGroupVoll(w, "au") || hasGroupVoll(w, "eu") || hasGroupVoll(w, "äu"),
      ),
    masteryGate: DG,
  },

  // E13 - Lautgruppen: ch, sch & st
  {
    id: "e13",
    levelId: "voll-ch-sch-st",
    system: "voll",
    title: "Lautgruppen: ch, sch & st",
    introducedUnits: [
      { key: "sch", spoken: "die Lautgruppe S-C-H, also sch" },
      { key: "ch", spoken: "die Lautgruppe ch" },
      { key: "st", spoken: "die Lautgruppe S-T, also st" },
    ],
    introDu:
      "Jetzt die Konsonanten-Gruppen: »sch« (Schule), »ch« (ich) und »st« (Stern). Merke: sch ist die LÄNGSTE — sie wird immer zuerst geprueft. Wo ein sch ist, wird kein ch und kein s+t einzeln daraus.",
    introSie:
      "»sch« (1-5-6), »ch« (1-4-5-6), »st« (2-3-4-5-6). Die Reihenfolge ist technisch wie didaktisch entscheidend: sch wird VOR ch geprueft (laengste zuerst), sonst zerfiele »Schule« faelschlich in s-ch-ule. Weisen Sie Lernende explizit darauf hin, dass die drei Konsonantengruppen NICHT ueber Silbengrenzen hinweg gelten (z. B. Haeus·chen — siehe Randfaelle).",
    legend: "sch = ⠱ (1-5-6) · ch = ⠹ (1-4-5-6) · st = ⠾ (2-3-4-5-6)",
    zeichen: ["sch", "ch", "st"],
    items: (all) =>
      all.filter(
        (w) => hasGroupVoll(w, "sch") || hasGroupVoll(w, "ch") || hasGroupVoll(w, "st"),
      ),
    masteryGate: DG,
  },

  // E14 - Vollschrift: Wörter (alle 8 Gruppen gemischt, keine neue Einheit)
  {
    id: "e14",
    levelId: "voll-woerter",
    system: "voll",
    title: "Vollschrift: alle Lautgruppen gemischt",
    introducedUnits: [],
    introDu:
      "Kein neues Zeichen — jetzt alles zusammen! In diesen Wörtern können mehrere Lautgruppen gleichzeitig stecken (»Geschichte« hat sch und ch). Zeig, dass du sie alle auf einen Schlag erkennst.",
    introSie:
      "Mischetappe ohne neue Einheit: festigt die acht Lautgruppen im Zusammenspiel. Wörter mit mehreren Gruppen (Geschichte = ge-sch-i-ch-te) sind das eigentliche Können-Ziel. Das Gewichtungssystem (pickWeighted) zieht automatisch die Wörter mit den zuletzt verwechselten Gruppen häufiger.",
    legend: "",
    items: (all) => all,
    masteryGate: {
      minAcc: MASTERY_ACC,
      minAttempts: MASTERY_MIN_ATTEMPTS,
      patience: 0,
    },
  },

  // --- Vollschrift: Grenzfaelle (additiv, 23.09.2026) ------------------------
  // NACH e14 (alle Lautgruppen gemischt), VOR den Satzzeichen und dem Lesetext.
  // Vorbild: Punktum-Kurs des DBSV, Kapitel 8 hat dafuer eine eigene Seite
  // ("Vorsicht: Nicht kuerzen!"). Die Woerter sind NICHT von dort, sondern in
  // childLex gemessen (Begruendung im Kopf von VOLL_GRENZ_FALLEN in vocab.ts).
  {
    id: "voll-grenz",
    levelId: "voll-grenz",
    system: "voll",
    title: "Vorsicht: hier wird nicht gekürzt",
    introducedUnits: [
      { key: "musste", spoken: "musste, das s und das t gehören nicht zusammen" },
      { key: "Haustür", spoken: "Haustür, aus Haus und Tür" },
      { key: "Familie", spoken: "Familie, das i und das e werden getrennt gesprochen" },
      { key: "bisschen", spoken: "bisschen, das s gehört zu bis, das chen ist die Verkleinerung" },
      { key: "Museum", spoken: "Museum, das e und das u werden getrennt gesprochen" },
      { key: "geirrt", spoken: "geirrt, das e gehört zur Vorsilbe ge" },
      { key: "Jubiläum", spoken: "Jubiläum, das ä und das u werden getrennt gesprochen" },
      { key: "Comicheft", spoken: "Comicheft, aus Comic und Heft" },
    ],
    introDu:
      "Ein neuer Blick auf die acht Lautgruppen: Sie gelten nur, wenn die Buchstaben wirklich zusammengehören. In »Haustür« steckt ein s und ein t - aber das s gehört zu Haus und das t zu Tür, also kein st-Zeichen. In »Familie« stehen i und e nebeneinander, du sprichst sie aber getrennt: Fa-mi-li-e. Sprich jedes Wort langsam mit, dann hörst du es selbst.",
    introSie:
      "Grenzfälle der Vollschrift: Die acht Lautgruppen gelten nur innerhalb eines Morphems und nur bei einlautiger Aussprache. Fünf Familien kommen vor - ss+t und Komposita (musste, Haustür), getrennt gesprochenes ie (Familie, Ferien), die Verkleinerung -chen nach s (Mäuschen), die Vorsilben be-/ge- vor i beziehungsweise u (geirrt, beunruhigt) sowie -eum/-äum. Die Wortauswahl ist in childLex gemessen, nicht gesetzt; für au gibt es im Kinderwortschatz keinen einzigen Fall. Vorbild der Etappe: Punktum-Kurs des DBSV, Kapitel 8.",
    legend: "musste · Haustür · Familie · bisschen · Museum · geirrt · Jubiläum · Comicheft",
    zeichen: ["musste", "Haustür", "Familie", "bisschen", "Museum", "geirrt", "Jubiläum", "Comicheft"],
    items: (all) => all,
    masteryGate: {
      minAcc: MASTERY_ACC,
      minAttempts: MASTERY_MIN_ATTEMPTS,
      patience: 0,
    },
  },

  // E15 - Vollschrift-Lesetext
  {
    id: "e15",
    levelId: "voll-texte",
    system: "voll",
    title: "Vollschrift: Lesetext",
    introducedUnits: [],
    introDu:
      "Die letzte Tür der Vollschrift! Jetzt ein ganzer Text mit allen Lautgruppen mittendrin. Schaffst du ihn, ertönt die große Fanfare: Vollschrift gemeistert.",
    introSie:
      "Abschluss-Lesetext (rund 50 Wörter, TEXTE_VOLL). Die Lautgruppen erscheinen jetzt im natürlichen Fließtext statt isoliert — der Transfer-Test. Erfolg löst die Abschluss-Fanfare und die ARIA-Live-Ansage »Geschafft! Vollschrift gemeistert.« aus.",
    legend: "",
    items: (all) => all,
    masteryGate: {
      minAcc: MASTERY_ACC,
      minAttempts: 6,
      patience: 0,
    },
  },

  // --- Computerbraille E16-E20b (P3) ------------------------------------------

  // E16 - 8-Punkt-Grundbuchstaben (identisch zur 6-Punkt-Zelle → Brücke für Könner)
  {
    id: "e16",
    levelId: "comp-buchstaben",
    system: "computer" as const,
    title: "8-Punkt-Grundbuchstaben a–z",
    introducedUnits: [..."abcdefghijklmnopqrstuvwxyz"].map((k) => ({
      key: k,
      spoken: k,
    })),
    introDu:
      "Am Computer hat jeder Buchstabe seine eigene Zelle — genau wie du a bis z schon kennst. Es ändert sich für die kleinen Buchstaben nichts. Leg los!",
    introSie:
      "Die 8-Punkt-Grundbuchstaben sind deckungsgleich mit der 6-Punkt-Basiszelle (CHAR_TO_CELL_8[ch] = LETTERS_6[ch]). Diese Etappe ist bewusst eine Brücke: Lernende mit Basis-/Vollschrift-Können erreichen das Mastery-Gate schnell. Für Studierende der Einstieg ins 8-Punkt-System ohne neue Belastung.",
    legend: "",
    // Wörter mit ä/ö/ü/ß erst ab E19 - hier ausfiltern
    items: (all) => all.filter((w) => !/[äöüßÄÖÜ]/.test(w)),
    // Brücke: patience=PATIENCE_BRAILLE erlaubt schnelles Überspringen für Könner
    masteryGate: { minAcc: MASTERY_ACC, minAttempts: MASTERY_MIN_ATTEMPTS, patience: PATIENCE_BRAILLE },
  },

  // E17 - Großbuchstaben über Punkt 7 (Kontrast zu E9)
  {
    id: "e17",
    levelId: "comp-gross",
    system: "computer" as const,
    title: "Großbuchstaben mit Punkt 7",
    introducedUnits: [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"].map((k) => ({
      key: k,
      spoken: `großes ${k}`,
    })),
    introDu:
      "Ein großer Buchstabe ist der kleine plus einen Punkt unten links — Punkt 7, deine A-Taste. Kein extra Zeichen davor wie früher. Großes A ist Punkt 1 und 7 in derselben Zelle.",
    introSie:
      "Bewusster Kontrast zu E9 (6-Punkt-Großansage 46 als eigene Zelle davor). Hier: Großbuchstabe = Grundzelle | Punkt 7 in derselben Zelle (LETTERS_6[ch] | DOT7). Diese Gegenüberstellung ist der erste der vier Express-Brüche und wird bei Lernenden, die E9 sicher haben, gezielt provoziert (vgl. U3).",
    legend: "A = 1·7  ·  B = 1·2·7  ·  M = 1·3·4·7",
    zeichen: ["A", "B", "M"],
    items: (all) => all.filter((w) => !/[äöüßÄÖÜ]/.test(w)),
    masteryGate: DG,
  },

  // E18 - Zahlen ohne Zahlzeichen (Kontrast zu E8)
  {
    id: "e18",
    levelId: "comp-zahlen",
    system: "computer" as const,
    title: "Zahlen ohne Zahlzeichen",
    introducedUnits: [..."0123456789"].map((k) => ({ key: k, spoken: k })),
    introDu:
      "Am Computer hat jede Ziffer ihre eigene Taste — du brauchst KEIN Zahlzeichen mehr davor. Die 1 ist Punkt 1 und 6. Tipp einfach die Zahl.",
    introSie:
      "Zweiter Express-Bruch (B2). 6-Punkt (E8): NUMSIGN(3456) + a–j als 1–0. 8-Punkt: jede Ziffer eine eigene Zelle (1=16 … 0=346), kein Präfix. transcribeComputer erzeugt für 5 genau eine Zelle (156), die 6-Punkt-Engine zwei (3456+15). Das ist die häufigste Reflex-Falle, weil das 8-Punkt-#-Zeichen (3456) ausgerechnet die alte Zahlzeichen-Form trägt.",
    legend: "1 = 1·6   2 = 1·2·6   5 = 1·5·6   0 = 3·4·6 — kein Zahlzeichen davor!",
    zeichen: ["1", "2", "5", "0"],
    items: (all) => all,
    masteryGate: DG,
  },

  // E19 - Umlaute abweichend · keine Kürzel · Sonderzeichen
  // Große Umlaute Ä/Ö/Ü sind „uneinheitlich" (SOFT_UNITS), nicht hart bewertet.
  {
    id: "e19",
    levelId: "comp-sonderzeichen",
    system: "computer" as const,
    title: "Umlaute abweichend · keine Kürzel · Sonderzeichen",
    introducedUnits: [
      { key: "ä", spoken: "ä mit Punkt 8" },
      { key: "ö", spoken: "ö mit Punkt 8" },
      { key: "ü", spoken: "ü mit Punkt 8" },
      { key: "ß", spoken: "eszett mit Punkt 8" },
      { key: "no-kuerzel", spoken: "kein Kürzel — jeden Buchstaben einzeln" },
      { key: "@", spoken: "At-Zeichen" },
      { key: "#", spoken: "Raute" },
      { key: "&", spoken: "Und-Zeichen" },
      { key: "%", spoken: "Prozent" },
      { key: "/", spoken: "Schrägstrich" },
      { key: "<", spoken: "kleiner als" },
      { key: ">", spoken: "größer als" },
      { key: "=", spoken: "Gleich" },
      { key: "+", spoken: "Plus" },
      { key: "*", spoken: "Mal-Stern" },
      { key: "(", spoken: "Klammer auf" },
      { key: ")", spoken: "Klammer zu" },
    ],
    introDu:
      "Hier kommt die Stärke vom Computerbraille: für @, #, & und % gibt es feste Zellen — gut für E-Mail-Adressen. Und: keine Lautgruppen mehr! sch ist s, c, h — drei Zellen.",
    introSie:
      "Vereint zwei Express-Brüche: B3 (keine Kürzel) — transcribeComputer kennt CONTRACTIONS_VOLL nicht, jede Lautgruppe zerfällt in Einzelzellen; B4 (abweichende Umlaute) — kleine Umlaute erhalten Punkt 8. Sonderzeichen sind der Mehrwert des Systems für technische Eingaben.",
    legend: "@ = 3·4·5·7   # = 3·4·5·6   & = 1·2·3·4·6   % = alle sechs oberen   ä = ä + Punkt 8",
    zeichen: ["@", "#", "&", "%", "ä"],
    items: (all) => all,
    masteryGate: DG,
  },

  // E20 - Computerbraille-Lesetext (Jugend) + Fanfare
  {
    id: "e20",
    levelId: "comp-texte-jugend",
    system: "computer" as const,
    title: "Computerbraille: Lesetext",
    introducedUnits: [],
    introDu:
      "Jetzt ein ganzer Text am Computer. Alles, was du gelernt hast, kommt zusammen. Schaffst du ihn, ist das ganze Computerbraille gemeistert!",
    introSie:
      "Transfer-Etappe. comp-texte-jugend (≈100 Wörter) zuerst, comp-texte-erwachsene als optionale Steigerung. Bei Abschluss feuert playUnlockFanfare + ARIA-Live 'Geschafft! Computerbraille gemeistert.'",
    legend: "",
    items: (all) => all,
    masteryGate: { minAcc: MASTERY_ACC, minAttempts: 1, patience: 0 },
  },

  // E20b - Computerbraille-Lesetext (Erwachsene), freigeschaltet nach E20
  {
    id: "e20b",
    levelId: "comp-texte-erwachsene",
    system: "computer" as const,
    title: "Computerbraille: Erweiterter Lesetext",
    introducedUnits: [],
    introDu:
      "Noch eine Stufe schwerer: ein längerer Text für geübte Lesende. Zeig, was du kannst!",
    introSie:
      "Optionale Steigerung nach E20. Freigeschaltet wenn comp-texte-jugend gemeistert ist.",
    legend: "",
    items: (all) => all,
    masteryGate: { minAcc: MASTERY_ACC, minAttempts: 1, patience: 0 },
  },

  // --- Express-Pfad U1-U8 (vs-pcbrl, P3) --------------------------------------
  // Für Vollschrift-Könner, die direkt ins Computerbraille einsteigen.
  // Docken an comp-*-Level; system:"computer". Kein eigener BrailleSystem-Wert.

  // U1 - Kontrast-Tour (Erkundung, kein Gate)
  {
    id: "u1",
    levelId: "comp-buchstaben",
    system: "computer" as const,
    title: "Express: Kontrast-Tour",
    introducedUnits: [],
    introDu:
      "Du kennst die Vollschrift — jetzt zeigen wir dir in vier Schritten, was sich am Computer ändert. Hör zu, tipp mit, kein Druck.",
    introSie:
      "Einführungstour für Vollschrift-Könner. Die vier Bruchstellen (Groß/Zahl/Kürzel/Umlaut) werden durchgesprochen; Punkt 7 (A-Taste) und Punkt 8 (ö-Taste) werden erspürt. Keine Bewertung — schaltet U2 sofort frei (minAttempts:0).",
    legend: "",
    items: (all) => all.filter((w) => /^[a-z]+$/.test(w) && w.length <= 5),
    // Sofort frei - reine Erkundung
    masteryGate: { minAcc: 0, minAttempts: 0, patience: 0 },
  },

  // U2 - Umlaute abweichend (B4). Andockpunkt ist der WORT-Pool (comp-buchstaben):
  // comp-sonderzeichen enthält keine Umlaut-Wörter - der items()-Filter lief
  // dort ins Leere und die Etappe stellte GAR KEINE Aufgaben (Befund 2026-07-09).
  {
    id: "u2",
    levelId: "comp-buchstaben",
    system: "computer" as const,
    title: "Express: Umlaute mit Punkt 8 (B4)",
    introducedUnits: [
      { key: "ä", spoken: "ä mit Punkt 8" },
      { key: "ö", spoken: "ö mit Punkt 8" },
      { key: "ü", spoken: "ü mit Punkt 8" },
      { key: "ß", spoken: "eszett mit Punkt 8" },
    ],
    introDu:
      "Erster Bruch: Umlaute bekommen am Computer Punkt 8 dazu. ä = Punkte 3·4·5·8 — merk dir: der Umlaut-Punkt 8 sitzt ganz unten rechts.",
    introSie:
      "Bruchstelle B4: kleine Umlaute ä/ö/ü/ß = 6-Punkt-Basis + Punkt 8. Große Umlaute Ä/Ö/Ü sind uneinheitlich (SOFT_UNITS) und nicht hart bewertet.",
    legend: "ä = 3·4·5·8   ö = 2·4·6·8   ü = 1·2·5·6·8",
    zeichen: ["ä", "ö", "ü"],
    items: (all) => all.filter((w) => /[äöüß]/.test(w.toLowerCase())),
    masteryGate: DG,
  },

  // U3 - Großbuchstaben über Punkt 7, Fokus-Override gegen 4·6-Reflex (B1)
  {
    id: "u3",
    levelId: "comp-gross",
    system: "computer" as const,
    title: "Express: Groß über Punkt 7 (B1)",
    introducedUnits: [
      { key: "A", spoken: "großes A" },
      { key: "B", spoken: "großes B" },
      { key: "M", spoken: "großes M" },
      { key: "S", spoken: "großes S" },
      { key: "T", spoken: "großes T" },
      ...[..."CDEFGHIJKLNOPQRUVWXYZ"].map((k) => ({ key: k, spoken: `großes ${k}` })),
    ],
    introDu:
      "Zweiter Bruch: Kein Ankündigungszeichen mehr! Großes A = Punkt 1 und 7 in einer Zelle — die 7 sitzt auf deiner A-Taste. Einfach mittippen.",
    introSie:
      "Bruchstelle B1: Großbuchstabe = LETTERS_6[ch] | Punkt 7 (eine Zelle), nicht CAPS_LETTER(46) + Buchstabe (zwei Zellen). Fokus-Override provoziert den 4·6-Reflex.",
    legend: "A = 1·7  ·  B = 1·2·7  ·  M = 1·3·4·7",
    zeichen: ["A", "B", "M"],
    items: (all) => all.filter((w) => /[A-Z]/.test(w) && !/[äöüßÄÖÜ]/.test(w)),
    masteryGate: DG,
  },

  // U4 - Groß/Klein gemischt in Abkürzungen/Eigennamen (B1 Vertiefung)
  {
    id: "u4",
    levelId: "comp-gross",
    system: "computer" as const,
    title: "Express: Groß/Klein gemischt (B1 Vertiefung)",
    introducedUnits: [],
    introDu:
      "Jetzt Groß und Klein in einem Wort — zum Beispiel »Berlin« oder »Deutschland«. Jeder große Buchstabe bekommt seinen Punkt 7 direkt in die Zelle.",
    introSie:
      "Vertiefung B1: Override erzwingt Wechsel groß↔klein im selben Wort (Eigennamen aus COMP_GROSS). Keine neuen Einheiten — Festigung des Reflexumbruchs.",
    legend: "",
    items: (all) => all.filter((w) => /[A-Z]/.test(w) && /[a-z]/.test(w)),
    masteryGate: DG,
  },

  // U5 - Ziffern ohne Zahlzeichen, #-Falle (B2)
  {
    id: "u5",
    levelId: "comp-zahlen",
    system: "computer" as const,
    title: "Express: Zahlen ohne Zahlzeichen (B2)",
    introducedUnits: [..."0123456789"].map((k) => ({ key: k, spoken: k })),
    introDu:
      "Dritter Bruch: Am Computer kein Zahlzeichen! Die 5 ist einfach Punkt 1·5·6. Achtung: Punkte 3·4·5·6 ist am PC das Zeichen #, KEINE Zahl.",
    introSie:
      "Bruchstelle B2: Stärkster Override — provoziert das #-vs-Zahlzeichen-Missverständnis. NUMSIGN(3456) und 8-Punkt-#(3456) sind bitgleich: wer das alte Zahlzeichen tippt, erzeugt am PC ein wörtliches #.",
    legend: "1 = 1·6   5 = 1·5·6   0 = 3·4·6   # = 3·4·5·6",
    zeichen: ["1", "5", "0", "#"],
    items: (all) => all,
    masteryGate: DG,
  },

  // U6 - Interpunktion abweichend (kein Voll-Absenkung)
  {
    id: "u6",
    levelId: "comp-sonderzeichen",
    system: "computer" as const,
    title: "Express: Interpunktion ohne Absenkung",
    introducedUnits: [
      { key: "!", spoken: "Ausrufezeichen" },
      { key: '"', spoken: "Anführungszeichen" },
      { key: "?", spoken: "Fragezeichen" },
      { key: ";", spoken: "Semikolon" },
      { key: ":", spoken: "Doppelpunkt" },
      { key: "(", spoken: "Klammer auf" },
      { key: ")", spoken: "Klammer zu" },
    ],
    introDu:
      "Interpunktion im Computerbraille ist ohne die Absenkung aus der Vollschrift. Das Fragezeichen ist einfach Punkt 2·6.",
    introSie:
      "Abweichende Interpunktion: ! = 5, ? = 26, ; = 23, : = 25, ( = 236, ) = 356. Keine Absenkungspräfixe wie in der Vollschrift.",
    legend: "! = 5   ? = 2·6   ; = 2·3   : = 2·5",
    zeichen: ["!", "?", ";", ":"],
    items: (all) => all.filter((w) => /[!?;:()".]/.test(w)),
    masteryGate: DG,
  },

  // U7 - Sonderzeichen-Referenz-Drill
  {
    id: "u7",
    levelId: "comp-sonderzeichen",
    system: "computer" as const,
    title: "Express: Sonderzeichen-Referenz",
    introducedUnits: [
      { key: "@", spoken: "At-Zeichen" },
      { key: "#", spoken: "Raute" },
      { key: "&", spoken: "Und-Zeichen" },
      { key: "%", spoken: "Prozent" },
      { key: "/", spoken: "Schrägstrich" },
      { key: "<", spoken: "kleiner als" },
      { key: ">", spoken: "größer als" },
      { key: "=", spoken: "Gleich" },
      { key: "+", spoken: "Plus" },
      { key: "*", spoken: "Mal-Stern" },
      { key: "-", spoken: "Bindestrich" },
    ],
    introDu:
      "Die technischen Zeichen: @, #, &, % — das Computerbraille ist wie gemacht dafür. Jedes hat seine feste Zelle.",
    introSie:
      "Sonderzeichen mit festen 8-Punkt-Belegungen: @ = 3·4·5·7, # = 3·4·5·6, & = 1·2·3·4·6, % = 1·2·3·4·5·6. Reine Referenz-Memorisierung, kein Ableitungsprinzip.",
    legend: "@ = 3·4·5·7   # = 3·4·5·6   & = 1·2·3·4·6   % = alle sechs",
    zeichen: ["@", "#", "&", "%"],
    items: (all) => all.filter((w) => /[@#&%/<>=+*-]/.test(w)),
    masteryGate: DG,
  },

  // U8 - Transfer-Fließtext, alle vier Brüche gemischt; Fanfare
  {
    id: "u8",
    levelId: "comp-texte-jugend",
    system: "computer" as const,
    title: "Express: Transfer-Text",
    introducedUnits: [],
    introDu:
      "Jetzt ein ganzer Text: Groß, Zahlen, Kürzel, Umlaute — alles auf einmal. Schaffst du ihn, hast du den Express-Übergang geschafft!",
    introSie:
      "Transfer-Etappe für Express-Pfad: alle vier Brüche gemischt im Fließtext. Fanfare bei Abschluss. Entspricht E20 im regulären Pfad.",
    legend: "",
    items: (all) => all,
    masteryGate: { minAcc: MASTERY_ACC, minAttempts: 1, patience: 0 },
  },

  // --- Kurzschrift K1-K9 (P4) - nach den Voll-Etappen, system "voll" ---------
  ...KURZ_ETAPPEN,

  // === ADDITIVE NEUE ETAPPEN (ans Array-Ende, damit die eingefrorene Reihenfolge
  // b1..b14 / e11..e15 / e16..e20b / u1..u8 unberührt bleibt). Die DIDAKTISCHE
  // Einordnung steckt in areas.ts BASIS_IDS/VOLL_IDS, die die Punktgenau-
  // Navigation steuern (b-satzzeichen2 nach b12; Rechnen nach b13; voll-
  // satzzeichen2 nach e14). ===

  // Basis: erweiterte Satzzeichen. : ; ' ( ) „ “ - alle Buchstaben bekannt, NEU
  // nur die Satzzeichen (6-Punkt). In der Vollschrift wiederholt.
  {
    id: "b-satzzeichen2",
    levelId: "l-basis-satzzeichen2",
    system: "basis",
    title: "Mehr Satzzeichen: Doppelpunkt, Klammern & Co.",
    introducedUnits: [
      { key: ":", spoken: "Doppelpunkt, Punkte 2, 5" },
      { key: ";", spoken: "Strichpunkt, Punkte 2, 3" },
      { key: "'", spoken: "Apostroph, Punkt 6" },
      { key: "(", spoken: "Klammer auf, Punkte 2, 3, 6" },
      { key: ")", spoken: "Klammer zu, Punkte 3, 5, 6" },
      { key: "„", spoken: "Anführungszeichen auf, Punkte 2, 3, 6" },
      { key: "“", spoken: "Anführungszeichen zu, Punkte 3, 5, 6" },
    ],
    introDu:
      "Jetzt lernst du die Satzzeichen für ganze Geschichten: den Doppelpunkt :, den Strichpunkt ;, den Apostroph ', die Klammern ( ) und die Anführungszeichen für die wörtliche Rede. Schreib den Satz genau mit.",
    introSie:
      "Erweiterte Interpunktion der 6-Punkt-Schrift: Doppelpunkt (2·5), Semikolon (2·3), Apostroph (6), Klammern (2·3·6 / 3·5·6). Anführungszeichen teilen das Muster der Klammern — der Kontext entscheidet.",
    legend: `: ; ' ( ) „ “`,
    items: (all) => all,
    masteryGate: DG,
  },

  // Basis: kleine Rechnungen, bewusst LEICHT (2. Schulstufe). Gestaffelt nach
  // Operation (+ 2·3·5 und × 2·3·6 sind ein Verwechselpaar → getrennt). Docken an
  // das eingefrorene l8-rechnen (kind „math"); Generator je id in buildLevelDeck.
  {
    id: "b-rechnen-plus",
    levelId: "l8-rechnen",
    system: "basis",
    title: "Plus und Gleich — die ersten Rechnungen",
    introducedUnits: [
      { key: "+", spoken: "Pluszeichen, Punkte 2, 3, 5" },
      { key: "=", spoken: "Gleichzeichen, Punkte 2, 3, 5, 6" },
    ],
    introDu:
      "Jetzt wird gerechnet! Das Pluszeichen + sind die Punkte 2, 3, 5 — das Gleichzeichen = die Punkte 2, 3, 5, 6. Die Zahlen kennst du schon. Vor jedem Rechenzeichen steht ein Leerzeichen, dahinter keines: 2 +3 =5.",
    introSie:
      "Erste Rechenzeichen der 6-Punkt-Schrift: Plus (2·3·5), Gleich (2·3·5·6). Marburger Mathematikschrift Kap. 5: Leerzeichen nur VOR dem Zeichen, keines danach (2 +3 =5, nicht 2 + 3 = 5). Kleiner Zahlenraum — geübt wird das Zeichen, nicht das Rechnen.",
    legend: "+ =",
    items: (all) => all,
    masteryGate: DG,
  },
  {
    id: "b-rechnen-minus",
    levelId: "l8-rechnen",
    system: "basis",
    title: "Minus — wegnehmen",
    introducedUnits: [{ key: "−", spoken: "Minuszeichen, Punkte 3, 6" }],
    introDu:
      "Das Minuszeichen − sind die Punkte 3, 6. Damit nimmst du etwas weg: 7 −4 =3.",
    introSie:
      "Minus (3·6) — dasselbe Muster wie der Binde-/Trennstrich, hier im Rechenkontext. Leerzeichen nur davor, keines danach (7 −4 =3). Ergebnis nie negativ.",
    legend: "−",
    items: (all) => all,
    masteryGate: DG,
  },
  {
    id: "b-rechnen-mal",
    levelId: "l8-rechnen",
    system: "basis",
    title: "Mal — das kleine Einmaleins",
    introducedUnits: [{ key: "×", spoken: "Malzeichen, Punkte 2, 3, 6" }],
    introDu:
      "Das Malzeichen × sind die Punkte 2, 3, 6 — fast wie Plus, nur Punkt 6 statt Punkt 5! Wir bleiben bei leichten Reihen: 2 ×5 =10.",
    introSie:
      "Mal (2·3·6) bewusst NACH Plus (2·3·5) — Verwechselpaar (nur Punkt 5↔6). Leerzeichen nur davor, keines danach (2 ×5 =10). Nur die leichten Reihen 2, 3, 4, 5, 10.",
    legend: "×",
    items: (all) => all,
    masteryGate: DG,
  },

  // Vollschrift: Satzzeichen-WIEDERHOLUNG. Dieselben Zeichen wie b-satzzeichen2,
  // jetzt mit Lautgruppen im Satz; keine neuen Einheiten.
  {
    id: "voll-satzzeichen2",
    levelId: "voll-satzzeichen2",
    system: "voll",
    title: "Vollschrift: Satzzeichen wiederholen",
    introducedUnits: [],
    introDu:
      "Die Satzzeichen kennst du schon aus der Basisschrift. Hier kommen sie noch einmal — mitten in Sätzen mit den Lautgruppen wie ei, au und sch.",
    introSie:
      "Festigung der erweiterten Interpunktion im Vollschrift-Kontext (keine neuen Zeichen; Wiederholung mit Lautgruppen-Wörtern).",
    legend: `: ; ' ( ) „ “`,
    items: (all) => all,
    masteryGate: DG,
  },

  // Computerbraille: erweiterte Sonderzeichen (Navigation: nach e19, vor den
  // Texten e20/e20b). Vier Welten - Satzzeichen, Code, Netz/Passwörter, Symbole.
  // Alle Zeichen sind in CHAR_TO_CELL_8 (Eurobraille, liblouis de-chardefs8).
  {
    id: "e-comp-satz",
    levelId: "l-comp-satz",
    system: "computer" as const,
    title: "Computer: Satzzeichen",
    introducedUnits: [
      { key: "!", spoken: "Ausrufezeichen" },
      { key: "?", spoken: "Fragezeichen" },
      { key: ":", spoken: "Doppelpunkt" },
      { key: ";", spoken: "Strichpunkt" },
      { key: "-", spoken: "Bindestrich" },
      { key: "'", spoken: "Apostroph" },
    ],
    introDu:
      "Am Computer ist jedes Satzzeichen genau eine Zelle mit acht Punkten. Schreib die Ausdrücke genau ab — mit Ausrufe- und Fragezeichen, Doppelpunkt, Strichpunkt, Bindestrich und Apostroph.",
    introSie:
      "8-Punkt-Interpunktion (Eurobraille): jedes Zeichen eine Zelle, ohne 6-Punkt-Mehrdeutigkeit. Transferstufe für die ASCII-Satzzeichen.",
    legend: "! ? : ; - '",
    items: (all) => all,
    masteryGate: DG,
  },
  {
    id: "e-comp-code",
    levelId: "l-comp-code",
    system: "computer" as const,
    title: "Computer: Klammern & Code",
    introducedUnits: [
      { key: "[", spoken: "eckige Klammer auf" },
      { key: "]", spoken: "eckige Klammer zu" },
      { key: "{", spoken: "geschweifte Klammer auf" },
      { key: "}", spoken: "geschweifte Klammer zu" },
      { key: "<", spoken: "kleiner als" },
      { key: ">", spoken: "größer als" },
      { key: "|", spoken: "senkrechter Strich" },
      { key: "\\", spoken: "Backslash" },
      { key: "~", spoken: "Tilde" },
      { key: "^", spoken: "Zirkumflex" },
      { key: "_", spoken: "Unterstrich" },
    ],
    introDu:
      "Jetzt die Zeichen fürs Programmieren: eckige Klammern [ ], geschweifte { }, kleiner < und größer >, der senkrechte Strich |, der Backslash, die Tilde ~, das Dach ^ und der Unterstrich _.",
    introSie:
      "Programmier- und Konsolen-Zeichen des 8-Punkt-Eurobraille (in 6 Punkt gar nicht vorhanden). Kern für Code, Dateipfade und reguläre Ausdrücke.",
    legend: "[ ] { } < > | \\ ~ ^ _",
    items: (all) => all,
    masteryGate: DG,
  },
  {
    id: "e-comp-netz",
    levelId: "l-comp-netz",
    system: "computer" as const,
    title: "Computer: E-Mail & Passwörter",
    introducedUnits: [
      { key: "@", spoken: "At-Zeichen" },
      { key: "/", spoken: "Schrägstrich" },
      { key: "_", spoken: "Unterstrich" },
    ],
    introDu:
      "Hier übst du echte E-Mail-Adressen, Webadressen und sichere Passwörter. Achte genau auf jedes Zeichen — beim Passwort zählt jeder Punkt!",
    introSie:
      "Authentische Eingabe-Strings (E-Mail, URL, Passwort). Der praktische Kern, warum Computerbraille existiert — exakte Zeichengenauigkeit ohne Kürzung.",
    legend: "@ / . _ -",
    items: (all) => all,
    masteryGate: DG,
  },
  {
    id: "e-comp-sym",
    levelId: "l-comp-sym",
    system: "computer" as const,
    title: "Computer: Währung & Symbole",
    introducedUnits: [
      { key: "€", spoken: "Euro-Zeichen" },
      { key: "$", spoken: "Dollar-Zeichen" },
      { key: "§", spoken: "Paragraf-Zeichen" },
      { key: "°", spoken: "Grad-Zeichen" },
      { key: "%", spoken: "Prozent-Zeichen" },
    ],
    introDu:
      "Zum Schluss die Symbole: das Euro-Zeichen €, der Dollar $, der Paragraf §, das Grad-Zeichen ° und das Prozent %.",
    introSie:
      "Währungs- und Fachsymbole im 8-Punkt. Hinweis: das Euro-Zeichen ist historisch nicht streng genormt (hier Eurobraille-Variante 4·5·7).",
    legend: "€ $ § ° %",
    items: (all) => all,
    masteryGate: DG,
  },

  // kurz-texte - Kurzschrift-Abschluss: zusammenhängende Sachtexte (Pendant zu
  // b14 / e15 / e20). levelId beginnt mit „kurz-" → der TextLevelRunner nimmt
  // den asynchronen liblouis-de-g2-Pfad (Anzeige der echten Kürzungen). ADDITIV
  // ans ETAPPEN-Ende; in die kurzschrift-Area gehängt über areas.ts.
  {
    id: "kurz-texte",
    levelId: "kurz-texte",
    system: "voll" as const,
    title: "Texte in Kurzschrift",
    introducedUnits: [],
    introDu:
      "Geschafft — du kennst die wichtigsten Kürzungen! Jetzt liest und schreibst du ganze Sachtexte in echter Kurzschrift. Hier zahlt sich aus, wie viel kürzer die geübte Schrift ist.",
    introSie:
      "Abschluss-Etappe der Kurzschrift: zusammenhängende Sachtexte (rund 100 Wörter) integrieren die in K1–K9 geübten Kürzungen. Anzeige und Soll-Lösung kommen aus liblouis de-g2 (asynchron) — geübt wird Lesen wie Schreiben.",
    legend: "",
    items: (all) => all,
    masteryGate: DG,
  },
];

// --- Computerbraille: uneinheitliche Zeichen (P3) ----------------------------

/**
 * Große Umlaute im 8-Punkt-System: laut Quelle nicht voll genormt.
 * Fehler bei Ä/Ö/Ü zählen NICHT ins Mastery-Gate (neutrale Hinweis-Karte).
 */
export const SOFT_UNITS: ReadonlySet<string> = new Set(["Ä", "Ö", "Ü"]);

/**
 * Wörter mit Ä/Ö/Ü: diese wurden in E16/E17 ausgeblendet und sollen ab E19 wieder
 * verfügbar sein. Für Konsumenten, die den Pool explizit erweitern möchten.
 */
export function unlockUmlautWords(items: readonly string[]): string[] {
  return items.filter((w) => /[ÄÖÜ]/.test(w));
}

// --- Basis-Voll-Brücke (P2) --------------------------------------------------

/** Basis-Level, die alle lebenszeit-treffsicher sein muessen, damit voll-ei-ie direkt einsteigbar ist. */
export const BRIDGE_BASE_LEVELS: readonly string[] = [
  "l1-reihe1",
  "l2-reihe2",
  "l3-reihe3",
];

/**
 * Treffsicherheit eines Levels ueber die Lebenszeit (alle items-Statistiken summiert,
 * tempo-frei). Liefert 0 wenn zu wenig Versuche oder undefined.
 */
export function lifetimeAcc(m: LevelMastery | undefined): number {
  if (!m) return 0;
  let seen = 0,
    wrong = 0;
  for (const stat of Object.values(m.items)) {
    seen += stat.seen;
    wrong += stat.wrong;
  }
  return seen >= MASTERY_MIN_ATTEMPTS ? (seen - wrong) / seen : 0;
}

/**
 * Ist die Basis-Bruecke offen? Ja, wenn alle BRIDGE_BASE_LEVELS lebenszeit-
 * treffsicher (>= BRIDGE_ACC) und je >= MASTERY_MIN_ATTEMPTS Versuche haben.
 */
export function bridgeOpen(
  mastery: Record<string, LevelMastery> | undefined,
): boolean {
  if (!mastery) return false;
  return BRIDGE_BASE_LEVELS.every((id) => lifetimeAcc(mastery[id]) >= BRIDGE_ACC);
}

/**
 * Wie isLevelUnlocked, aber: das ERSTE Level des Voll-Systems gilt auch dann
 * als offen, wenn die Bruecke aus dem Basis-System traegt (bridgeOpen).
 */
export function isLevelUnlockedBraille(
  p: BrailleProgress,
  levelIds: readonly string[],
  id: string,
): boolean {
  // The first Voll-level is gated by the Basis bridge - not by a predecessor.
  // We must NOT delegate to isLevelUnlocked here because it returns true for
  // idx===0 (first element), which would bypass the bridge gate entirely.
  if (id === firstLevelOf("voll").id) return bridgeOpen(p.mastery);
  return isLevelUnlocked(p, levelIds, id);
}

// --- Query-Funktionen ---------------------------------------------------------

export function etappenForLevel(levelId: string): Etappe[] {
  return ETAPPEN.filter((e) => e.levelId === levelId);
}

export function etappenForSystem(system: BrailleSystem): Etappe[] {
  return ETAPPEN.filter((e) => e.system === system);
}

export function etappeById(id: string): Etappe | undefined {
  return ETAPPEN.find((e) => e.id === id);
}

// --- Mastery-Tor -------------------------------------------------------------

/**
 * Ist die Etappe abgeschlossen?
 * Delegiert an `isLevelMastered` (MASTERY_ACC=0.9, MASTERY_MIN_ATTEMPTS=12).
 * Die `patience`-Komponente greift in der Einheiten-Pipeline (unitLevel), nicht hier.
 */
export function etappeMastered(m: LevelMastery, _gate: EtappenGate): boolean {
  return isLevelMastered(m);
}

// --- Einheiten-Pipeline (Port aus letters.ts, tempo-frei) --------------------

export function unitLevel(s: UnitStat | undefined): UnitLevel {
  if (!s) return "neu";
  const n = s.hits + s.misses;
  if (n < MIN_SAMPLES) return "neu";
  const acc = s.hits / n;
  if (n >= PATIENCE_BRAILLE && acc >= TARGET_ACC) return "sitzt"; // Geduldsregel tempo-frei
  if (acc < STRUGGLE_ACC) return "hakt";
  if (acc >= TARGET_ACC) return "sitzt";
  return "wackelig";
}

/** Darf die nächste Einheit freigeschaltet werden? ≤MAX_WOBBLY wackelig, 0 hakend. */
export function canAdvanceUnits(
  introduced: string[],
  stats: Record<string, UnitStat>,
): boolean {
  let notReady = 0;
  for (const k of introduced) {
    const lvl = unitLevel(stats[k]);
    if (lvl === "sitzt") continue;
    if (lvl === "hakt") return false;
    notReady++;
  }
  return notReady <= MAX_WOBBLY;
}

/** Nächste noch nicht eingeführte Einheit der Etappe oder null. */
export function nextUnit(et: Etappe, introduced: string[]): string | null {
  const set = new Set(introduced);
  return et.introducedUnits.map((u) => u.key).find((k) => !set.has(k)) ?? null;
}

// --- Aktuelle Etappe ---------------------------------------------------------

/**
 * Erste nicht-abgeschlossene Etappe für ein System.
 * @param etappenList Optionale gefilterte Liste (z. B. aus getActiveEtappen für setup-Konformanz).
 */
export function currentEtappe(
  system: BrailleSystem,
  progress: BrailleProgress,
  etappenList?: Etappe[],
): Etappe | undefined {
  const list = etappenList ?? etappenForSystem(system);
  for (const et of list) {
    const m = getLevelMastery(progress, et.levelId);
    const unitsDone = progress.introduced?.[et.levelId] ?? [];
    const allUnitsIntroduced = et.introducedUnits.every((u) =>
      unitsDone.includes(u.key),
    );
    if (!(allUnitsIntroduced && etappeMastered(m, et.masteryGate))) return et;
  }
  return undefined; // System komplett gemeistert
}

// --- Migrations-Helfer (Bauvertrag §6.1) -------------------------------------

/**
 * Backfill: ein abgeschlossenes Level gilt als „alle Einheiten freigeschaltet".
 * Altstand mit `completed:true` aber ohne `introduced` → Pipeline nicht auf Null setzen.
 */
export function ensureIntroducedForLevel(
  levelId: string,
  progress: BrailleProgress,
): string[] {
  const existing = progress.introduced?.[levelId];
  if (existing && existing.length > 0) return existing;
  const done = progress.levels[levelId]?.completed;
  if (!done) return []; // frischer Stand → Pipeline beginnt bei Einheit 1
  return etappenForLevel(levelId).flatMap((e) => e.introducedUnits.map((u) => u.key));
}
