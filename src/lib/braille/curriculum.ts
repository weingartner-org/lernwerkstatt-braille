import type { SuchArt } from "./suchaufgabe";
/**
 * Lehrplan (Level-Kurve) für den Braille-Trainer. Jedes Schriftsystem hat
 * SEINEN EIGENEN Level-Strang (unterschiedlich viele):
 *  - Basisschrift: Buchstaben → Wörter → Sätze → Zahlen → Satzzeichen → Rechnen.
 *  - Vollschrift: dieselbe Grundlage, aber der Schwerpunkt sind die Lautgruppen
 *    (au, eu, äu, ei, ie, ch, sch, st) - die es in Basis/Computer NICHT gibt.
 *  - Computerbraille (8 Punkt): Buchstaben, Großbuchstaben (Punkt 7), Zahlen
 *    ohne Zahlzeichen, Sonderzeichen. KEINE Lautgruppen/Kürzel.
 *
 * Reine Daten (kein React) - so testbar und leicht erweiterbar.
 */
import { BrailleSystem } from "./tables";
import {
  TEXTE_BASIS,
  TEXTE_COMPUTER_ERWACHSENE,
  TEXTE_COMPUTER_JUGEND,
  TEXTE_KURZ,
  TEXTE_VOLL,
} from "./texts";
import {
  COMP_BUCHSTABEN,
  COMP_CODE,
  COMP_GROSS,
  COMP_NETZ,
  COMP_SATZ,
  COMP_SONDERZEICHEN,
  COMP_SYM,
  L1_AJ,
  L2_KT,
  L3_REST,
  L4_WOERTER,
  BASIS_SATZZEICHEN,
  L5_SAETZE,
  L7_SATZZEICHEN,
  VOLL_SATZZEICHEN,
  VOLL_AU_EU_AEU,
  VOLL_CH_SCH_ST,
  VOLL_EI_IE,
  VOLL_SAETZE,
  VOLL_WOERTER,
  VOLL_GRENZ_FALLEN,
  VOLL_GRENZ_GEGEN,
  VOLL_GRENZ_SAETZE,
} from "./vocab";
import { GRENZFALL_LESSONS, KFA_LESSONS, STRICHE_LESSONS } from "./kurzschrift_content";
import { grenzfallItems, kfaItems, stricheItems } from "./kurzschrift_material";

export type LevelKind =
  | "letters"
  | "words"
  | "sentences"
  | "numbers"
  | "punctuation"
  | "math"
  | "contractions"
  | "text";

export interface Level {
  id: string;
  title: string;
  kind: LevelKind;
  /** Schriftsystem, das dieses Level übt. */
  system: BrailleSystem;
  /** Kurze Einführung (Studi „Sie" - der Schüler-Modus formuliert später um). */
  intro: string;
  /** Neue Zeichen für die Legende (Druckschrift → Braille). */
  legend?: string;
  /**
   * Additiv (22.09.2026): reine Lernzeichen für die Kästchen unter der
   * Legende, wenn `legend` ein SATZ für Menschen ist (z. B. „ei = ⠩ (1-4-6)
   * · ie = ⠬ (3-4-6)") und nicht Zeichen-für-Zeichen zerlegt werden darf.
   * Fehlt es, zerlegt `Legend` weiterhin `legend` wie bisher - unverändert
   * für alle Level, deren Legende schon eine reine Zeichenliste ist.
   */
  zeichen?: string[];
  /**
   * Additiv (23.09.2026): Dieses Level stellt SUCHAUFGABEN statt Lese-Aufgaben
   * - "wo steht es?" oder "wie oft?". Es bleibt eine Lese-Richtung; die Frage
   * ist eine andere (Begründung im Kopf von `lib/braille/suchaufgabe.ts`).
   * `items` sind dann die GESUCHTEN Zeichen, die Reihe wird daraus gebaut.
   * Fehlt das Feld, ändert sich nichts.
   */
  suche?: SuchArt;
  /** Aufgaben-Vorrat (Wörter/Zeichen/Sätze/Rechnungen). */
  items: string[];
}

// Kurzschrift-Level: 48 KFA-Lektionen (Umbau 03.07.2026). Struktur + Inventar
// exakt nach „Kurzschrift für alle"; system "voll" (Kurzschrift ist 6-Punkt),
// kind "contractions". Die Aufgaben-Lösungen kommen zur Laufzeit aus liblouis
// de-g2; Level.items ist das build-time geprüfte Lektions-Material (nur
// Kürzungen bereits gelernter Lektionen). intro „Sie" aus der Lektion.
const KURZ_LEVELS: Level[] = KFA_LESSONS.map((l) => ({
  id: `kurz-${l.id}`, // "kurz-kfa01".."kurz-kfa48"
  title: `Kurzschrift · Lektion ${l.nr}: ${l.title}`,
  kind: "contractions" as const,
  system: "voll" as const,
  intro: l.introSie,
  legend: l.units.map((u) => u.print).join(" · "),
  items: kfaItems(l.id),
}));

// Kurzschrift-Level: Striche (additiv, 22.09.2026) - vier Etappen NACH den 48
// KFA-Lektionen, VOR „kurz-texte" (Begründung + Regelquelle: Kopfkommentar
// STRICHE_LESSONS in kurzschrift_content.ts). Gleiches Muster wie KURZ_LEVELS,
// nur mit hand-geprüftem statt generiertem Material (stricheItems).
const KURZ_STRICHE_LEVELS: Level[] = STRICHE_LESSONS.map((l) => ({
  id: `kurz-${l.id}`, // "kurz-striche01".."kurz-striche04"
  title: `Kurzschrift · Striche ${l.nr}: ${l.title}`,
  kind: "contractions" as const,
  system: "voll" as const,
  intro: l.introSie,
  legend: l.units.map((u) => u.print).join(" · "),
  items: stricheItems(l.id),
}));

// Kurzschrift-Level: Grenzfaelle (additiv, 23.09.2026) - vier Etappen NACH den
// Striche-Etappen (Quelle + Begruendung: Kopfkommentar GRENZFALL_LESSONS in
// kurzschrift_content.ts). Gleiches Muster wie die Striche-Level.
const KURZ_GRENZFALL_LEVELS: Level[] = GRENZFALL_LESSONS.map((l) => ({
  id: `kurz-${l.id}`, // "kurz-grenz01".."kurz-grenz04"
  title: `Kurzschrift · Grenzfälle ${l.nr}: ${l.title}`,
  kind: "contractions" as const,
  system: "voll" as const,
  intro: l.introSie,
  legend: l.units.map((u) => u.print).join(" · "),
  items: grenzfallItems(l.id),
}));

export const LEVELS: Level[] = [
  // ===== Basisschrift =======================================================
  {
    id: "l1-reihe1",
    title: "Buchstaben a–j",
    kind: "letters",
    system: "basis",
    intro:
      "Die erste Reihe des Alphabets nutzt nur die oberen vier Punkte (1, 2, 4, 5). Lernen Sie a bis j und schreiben Sie die ersten kleinen Wörter.",
    legend: "abcdefghij",
    items: L1_AJ,
  },
  {
    id: "l2-reihe2",
    title: "Buchstaben k–t",
    kind: "letters",
    system: "basis",
    intro:
      "Die zweite Reihe entsteht aus der ersten durch Hinzufügen von Punkt 3. Damit lassen sich schon viele Wörter bilden.",
    legend: "klmnopqrst",
    items: L2_KT,
  },
  {
    id: "l3-reihe3",
    title: "u–z, Umlaute & ß",
    kind: "letters",
    system: "basis",
    intro:
      "Die dritte Reihe nutzt zusätzlich Punkt 6; w fällt aus der Reihe. Dazu die deutschen Umlaute ä, ö, ü und das ß.",
    legend: "uvwxyzäöüß",
    items: L3_REST,
  },
  {
    id: "l4-woerter",
    title: "Erste Wörter",
    kind: "words",
    system: "basis",
    intro:
      "Jetzt alle Buchstaben gemischt. Bei Hauptwörtern wird der Großbuchstabe mit den Punkten 4 und 6 angekündigt.",
    items: L4_WOERTER,
  },
  {
    id: "l5-saetze",
    title: "Erste Sätze",
    kind: "sentences",
    system: "basis",
    intro:
      "Kurze Sätze mit Leerzeichen, Großbuchstaben und Punkt am Ende. Ein Leerzeichen ist eine leere Zelle.",
    items: L5_SAETZE,
  },
  {
    id: "l6-zahlen",
    title: "Zahlen",
    kind: "numbers",
    system: "basis",
    intro:
      "Vor jeder Zahl steht das Zahlzeichen (Punkte 3, 4, 5, 6). Danach sind die Buchstaben a–j die Ziffern 1–0.",
    legend: "1234567890",
    items: ["1", "2", "5", "8", "10", "12", "20", "42", "100", "2026", "3,5"],  },
  {
    id: "l7-satzzeichen",
    title: "Satzzeichen",
    kind: "punctuation",
    system: "basis",
    intro:
      "Punkt, Komma, Frage- und Ausrufezeichen liegen in der unteren Zellhälfte. Schreiben Sie kurze Ausdrücke mit Satzzeichen.",
    legend: ".,?!",
    items: L7_SATZZEICHEN,
  },
  {
    id: "l8-rechnen",
    title: "Kleine Rechnungen",
    kind: "math",
    system: "basis",
    intro:
      "Die Grundrechenzeichen: Plus (Punkte 2, 3, 5), Minus (3, 6), Mal (2, 3, 6) und Gleich (2, 3, 5, 6). Jede Zahl bekommt ihr Zahlzeichen.",
    legend: "+−×=",
    // Wird von buildLevelDeck (kind "math") ohnehin durch randomCalc() ersetzt -
    // dieses Feld ist nur die Beispiel-Doku. Gleiche Leerzeichenregel wie dort
    // (Marburger Kap. 5, Z. 2639-2641): vor dem Zeichen, nicht danach.
    items: ["2 +3 =5", "7 −4 =3", "3 ×4 =12", "6 +6 =12", "9 −5 =4", "10 +5 =15"],  },

  // ===== Vollschrift (Schwerpunkt Lautgruppen) ==============================
  {
    id: "voll-ei-ie",
    title: "Lautgruppen: ei & ie",
    kind: "contractions",
    system: "voll",
    intro:
      "In der Vollschrift werden häufige Lautgruppen zu einer einzigen Zelle. Den Anfang machen »ei« und »ie« — sie stecken in sehr vielen Wörtern.",
    legend: "ei ie",
    items: VOLL_EI_IE,
  },
  {
    id: "voll-au-eu-aeu",
    title: "Lautgruppen: au, eu & äu",
    kind: "contractions",
    system: "voll",
    intro:
      "Drei weitere Lautgruppen: »au«, »eu« und das umgelautete »äu«. Auch sie sparen je eine Zelle.",
    legend: "au eu äu",
    items: VOLL_AU_EU_AEU,
  },
  {
    id: "voll-ch-sch-st",
    title: "Lautgruppen: ch, sch & st",
    kind: "contractions",
    system: "voll",
    intro:
      "Die Konsonanten-Gruppen »ch«, »sch« und »st«. »sch« ist die längste und wird zuerst geprüft — danach erst »ch«.",
    legend: "ch sch st",
    items: VOLL_CH_SCH_ST,
  },
  {
    id: "voll-woerter",
    title: "Vollschrift: Wörter",
    kind: "words",
    system: "voll",
    intro:
      "Jetzt gemischt: Wörter mit verschiedenen Lautgruppen. Achten Sie darauf, welche Buchstaben zu einer Zelle zusammenfallen.",
    items: VOLL_WOERTER,
  },
  {
    id: "voll-saetze",
    title: "Vollschrift: Sätze",
    kind: "sentences",
    system: "voll",
    intro:
      "Kurze Sätze in Vollschrift — Leerzeichen und Punkt am Ende wie gewohnt, die Lautgruppen mitten in den Wörtern.",
    items: VOLL_SAETZE,
  },

  // ===== Computerbraille (8 Punkt, keine Kürzel) ============================
  {
    id: "comp-buchstaben",
    title: "Computerbraille: Buchstaben",
    kind: "letters",
    system: "computer",
    intro:
      "Computerbraille nutzt acht Punkte: jedes Zeichen ist genau eine Zelle, ohne Ankündigungen. Die Grundbuchstaben sind wie in der Basisschrift.",
    legend: "abcdefghij",
    items: COMP_BUCHSTABEN,
  },
  {
    id: "comp-gross",
    title: "Computerbraille: Großbuchstaben",
    kind: "letters",
    system: "computer",
    intro:
      "Großbuchstaben bekommen einfach Punkt 7 dazu — keine eigene Ankündigungszelle davor wie in der Basisschrift.",
    legend: "ABCDEFGHIJ",
    items: COMP_GROSS,
  },
  {
    id: "comp-zahlen",
    title: "Computerbraille: Zahlen",
    kind: "numbers",
    system: "computer",
    intro:
      "Ziffern haben in Computerbraille eigene Zellen — kein Zahlzeichen davor. Punkt und Komma sind normale Zeichen.",
    legend: "1234567890",
    items: ["1", "2", "5", "42", "2026", "3.14", "1,5", "100", "7", "0"],  },
  {
    id: "comp-sonderzeichen",
    title: "Computerbraille: Sonderzeichen",
    kind: "punctuation",
    system: "computer",
    intro:
      "Die Stärke von Computerbraille: Sonderzeichen wie @, #, & oder % haben feste Zellen — ideal für E-Mail-Adressen und Technik.",
    legend: "@#&%+=",
    items: COMP_SONDERZEICHEN,
  },

  // ===== Texte (Fließtext-Modus, je System ein eigener Schwierigkeitsgrad) ==
  {
    id: "basis-texte",
    title: "Texte",
    kind: "text",
    system: "basis",
    intro:
      "Ganze kurze Texte in Braille schreiben. Der Text wird fortlaufend übersetzt; ein Wort-Zähler läuft mit, die Zeit startet bei der ersten Eingabe. Fehler werden gezählt; mit der Rücktaste kannst du korrigieren — am Ende siehst du Fehler und Zeit.",
    items: TEXTE_BASIS,  },
  {
    id: "voll-texte",
    title: "Texte",
    kind: "text",
    system: "voll",
    intro:
      "Etwas längere Texte (rund 50 Wörter) in Vollschrift schreiben. Der Wort-Zähler läuft mit, die Zeit startet bei der ersten Eingabe; Fehler werden gezählt, korrigieren geht mit der Rücktaste — am Ende folgt die Auswertung.",
    items: TEXTE_VOLL,  },
  {
    id: "comp-texte-jugend",
    title: "Texte – Jugendliche",
    kind: "text",
    system: "computer",
    intro:
      "Längere Sachtexte (rund 100 Wörter) in Computerbraille. Fortlaufend schreiben; die Zeit startet bei der ersten Eingabe, Fehler werden gezählt und lassen sich mit der Rücktaste korrigieren — am Ende gibt es Fehlerzahl und Zeit.",
    items: TEXTE_COMPUTER_JUGEND,  },
  {
    id: "comp-texte-erwachsene",
    title: "Texte – Erwachsene",
    kind: "text",
    system: "computer",
    intro:
      "Anspruchsvolle Fachtexte (rund 100 Wörter) in Computerbraille. Fortlaufend schreiben; die Zeit startet bei der ersten Eingabe, korrigieren geht mit der Rücktaste (jeder Fehler zählt trotzdem) — am Ende folgt die Auswertung mit Fehlern und Zeit.",
    items: TEXTE_COMPUTER_ERWACHSENE,  },

  // ===== Kurzschrift: 48 KFA-Lektionen (Umbau 03.07.2026) ===================
  ...KURZ_LEVELS,

  // ===== Kurzschrift: Striche (additiv, 22.09.2026) =========================
  ...KURZ_STRICHE_LEVELS,
  ...KURZ_GRENZFALL_LEVELS,

  // Kurzschrift-Abschluss: ganze Sachtexte. Bleibt im zusammenhängenden „kurz-"-
  // Block (vor UEB), damit die id mit „kurz-" beginnt (→ async de-g2 im Runner)
  // und die kurz-Level zusammenhängend bleiben. system "voll" (6-Punkt).
  {
    id: "kurz-texte",
    title: "Kurzschrift-Texte",
    kind: "text",
    system: "voll",
    intro:
      "Zusammenhängende Sachtexte in echter Kurzschrift lesen und schreiben. Die Anzeige kommt aus der Kurzschrift-Übersetzung (de-g2) — ganze Wörter und Silben schrumpfen zu wenigen Zeichen. Beim Lesen tippst du den Text in Druckschrift ab; beim Schreiben gibst du die gekürzten Zeichen selbst ein.",
    items: TEXTE_KURZ,
  },

  // UEB Grade 2 (Englisch) läuft NICHT mehr über curriculum-Levels: der neue
  // offizielle Lehrgang (L4-L22, Australian Training Manual) ist als eigene
  // Etappen-Reihe UEB_ETAPPEN modelliert (etappen.ts / ueb_content.ts), mit
  // liblouis-geprüftem Material (ueb_material.ts). Die alten 6 „Welten"-Levels
  // und ihre Wortlisten (vocab UEB_W*_ITEMS) sind entfallen.

  // --- ADDITIV ans Listenende (NACH den 21 eingefrorenen + Kurz/UEB), damit die
  // ersten 21 ids eingefroren bleiben (Arbeitsheft-Embeds / migrateIds). Die
  // Navigation läuft ohnehin über areas.ts (levelById), nicht über die Position.
  {
    // ★ ADDITIV ans Listenende (23.09.2026) - die Suchaufgabe der Basisschrift.
    // `items` sind hier die GESUCHTEN Zeichen; die Reihe baut der Runner
    // daraus. Die zehn Kniese-Erstbuchstaben geben genug Ablenker her, um die
    // Stufen wirklich zu unterscheiden (Drittel nach Punktabstand).
    id: "basis-suchen",
    title: "Basisschrift: Finde das Zeichen",
    kind: "letters",
    system: "basis",
    intro:
      "Suchaufgabe: Das Kind tastet eine Reihe ab und nennt die Stelle des gesuchten Zeichens. Die Ablenker werden mit der Anforderungsstufe ähnlicher.",
    legend: "",
    suche: "position",
    items: ["l", "a", "i", "m", "s", "u", "o", "d", "n", "e"],
  },
  {
    // ★ ADDITIV ans Listenende (23.09.2026) - NICHT in die Mitte einfuegen:\n    // die ersten 21 Level-ids sind eingefroren (Bauvertrag §6.1), und die\n    // Reihenfolge im Lehrgang kommt ohnehin aus areas.ts (VOLL_IDS), nicht\n    // aus der Position hier. Fallen UND
    // Gegenstuecke im selben Topf: ohne die Gegenprobe waere es eine
    // Ausnahmeliste statt einer Unterscheidungsuebung.
    id: "voll-grenz",
    title: "Vollschrift: Vorsicht, hier wird nicht gekürzt",
    kind: "words",
    system: "voll",
    intro:
      "Die acht Lautgruppen gelten nur innerhalb eines Wortteils und nur bei einlautiger Aussprache. Hier stehen die Grenzfälle neben Wörtern, in denen dieselbe Gruppe sehr wohl kürzt.",
    legend: "musste · Haustür · Familie · bisschen · Museum · geirrt · Jubiläum · Comicheft",
    items: [...VOLL_GRENZ_FALLEN, ...VOLL_GRENZ_GEGEN, ...VOLL_GRENZ_SAETZE],
  },
  {
    id: "l-basis-satzzeichen2",
    title: "Mehr Satzzeichen",
    kind: "sentences",
    system: "basis",
    intro:
      "Jetzt die Satzzeichen der geschriebenen Sprache: Doppelpunkt, Semikolon, Apostroph, Klammern und Anführungszeichen.",
    legend: `: ; ' ( ) „ “`,
    items: BASIS_SATZZEICHEN,
  },
  {
    id: "voll-satzzeichen2",
    title: "Vollschrift: Satzzeichen",
    kind: "sentences",
    system: "voll",
    intro:
      "Dieselben Satzzeichen noch einmal — jetzt in Sätzen mit Lautgruppen.",
    legend: `: ; ' ( ) „ “`,
    items: VOLL_SATZZEICHEN,
  },
  {
    id: "l-comp-satz",
    title: "Computer: Satzzeichen",
    kind: "words",
    system: "computer",
    intro:
      "Die Satzzeichen am Computer — jedes ist genau eine 8-Punkt-Zelle: Ausrufezeichen, Fragezeichen, Doppelpunkt, Strichpunkt, Bindestrich, Apostroph.",
    legend: "! ? : ; - '",
    items: COMP_SATZ,
  },
  {
    id: "l-comp-code",
    title: "Computer: Klammern & Code",
    kind: "words",
    system: "computer",
    intro:
      "Die Zeichen zum Programmieren: eckige und geschweifte Klammern, Größer/Kleiner, senkrechter Strich, Backslash, Tilde, Dach und Unterstrich.",
    legend: "[ ] { } < > | \\ ~ ^ _",
    items: COMP_CODE,
  },
  {
    id: "l-comp-netz",
    title: "Computer: E-Mail & Passwörter",
    kind: "words",
    system: "computer",
    intro:
      "E-Mail-Adressen, Webadressen und sichere Passwörter — mit At-Zeichen, Schrägstrich, Punkt, Unterstrich und Bindestrich.",
    legend: "@ / . _ -",
    items: COMP_NETZ,
  },
  {
    id: "l-comp-sym",
    title: "Computer: Währung & Symbole",
    kind: "words",
    system: "computer",
    intro:
      "Euro, Dollar, Paragraf, Grad und Prozent — die Symbole für Preise, Gesetze und Messwerte.",
    legend: "€ $ § ° %",
    items: COMP_SYM,
  },
];

export function levelById(id: string): Level | undefined {
  return LEVELS.find((l) => l.id === id);
}

export function levelIndex(id: string): number {
  return LEVELS.findIndex((l) => l.id === id);
}

/** Alle Level eines Schriftsystems (eigener Strang je System). */
export function levelsForSystem(system: BrailleSystem): Level[] {
  return LEVELS.filter((l) => l.system === system);
}

/** Erstes Level eines Systems (Fallback: allererstes Level). */
export function firstLevelOf(system: BrailleSystem): Level {
  return levelsForSystem(system)[0] ?? LEVELS[0];
}

/** Nächstes Level INNERHALB desselben Systems (oder undefined am Ende). */
export function nextLevelInSystem(id: string): Level | undefined {
  const lv = levelById(id);
  if (!lv) return undefined;
  const group = levelsForSystem(lv.system);
  const i = group.findIndex((l) => l.id === id);
  return i === -1 ? undefined : group[i + 1];
}

/** Sterne aus der Fehlerzahl einer Level-Runde (3 = fehlerfrei). */
export function starsFor(wrong: number): number {
  if (wrong === 0) return 3;
  if (wrong <= 2) return 2;
  return 1;
}

/** Fisher-Yates-Shuffle (liefert eine neue Liste). */
function shuffle(items: readonly string[]): string[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ===========================================================================
// Stufen: jedes nicht-Text-Level besteht aus STUFEN_PRO_LEVEL Stufen, jede
// Stufe aus ZEILEN_PRO_STUFE Aufgaben („Zeilen", auch nur ein Zeichen möglich).
// ===========================================================================
export const STUFEN_PRO_LEVEL = 10;
export const ZEILEN_PRO_STUFE = 10;
const ZEILEN_PRO_LEVEL = STUFEN_PRO_LEVEL * ZEILEN_PRO_STUFE;

/**
 * ★★★ Leerzeichen NUR VOR Operations-/Relationszeichen, keines danach
 * (Marburger Mathematikschrift Kap. 5, Z. 2639-2641 wörtlich: „Vor beinahe
 * allen Operations- und Relationszeichen ist ein Leerzeichen zu setzen, nach
 * ihnen dagegen nicht."). Zielnotation der Spezifikation: `48 +27 =75`.
 * Johannes, 22.09.2026: gemessener Fehler, vorher stand beidseitig ein
 * Leerzeichen (`3 + 4 = 7`), was in der Braillezelle ein zusätzliches,
 * falsches Leerzeichen NACH dem Zeichen erzeugte.
 */

/** Eine zufällige kleine Rechnung (Grundrechenart) mit korrektem Ergebnis. */
function randomCalc(): string {
  const op = Math.floor(Math.random() * 3);
  if (op === 0) {
    const a = 1 + Math.floor(Math.random() * 50);
    const b = 1 + Math.floor(Math.random() * 50);
    return `${a} +${b} =${a + b}`;
  }
  if (op === 1) {
    const a = 2 + Math.floor(Math.random() * 49); // 2..50
    const b = 1 + Math.floor(Math.random() * (a - 1)); // 1..a-1 → Ergebnis ≥ 1
    return `${a} −${b} =${a - b}`;
  }
  const a = 2 + Math.floor(Math.random() * 8); // 2..9
  const b = 2 + Math.floor(Math.random() * 8); // 2..9
  return `${a} ×${b} =${a * b}`;
}

// --- Gestaffelte, BEWUSST LEICHTE Rechnungen (2. Schulstufe AT: ZR ~20, kleines
// Einmaleins). Es geht um das Braille-Rechenzeichen, NICHT ums Rechnen. ---

/** Leichte Plus-Aufgabe - kleines Einspluseins, einstellige Summanden. */
function randomAdd(): string {
  const a = 1 + Math.floor(Math.random() * 9); // 1..9
  const b = 1 + Math.floor(Math.random() * 9); // 1..9
  return `${a} +${b} =${a + b}`;
}

/** Leichte Minus-Aufgabe - kleiner Zahlenraum, Ergebnis nie negativ. */
function randomSub(): string {
  const a = 2 + Math.floor(Math.random() * 9); // 2..10
  const b = 1 + Math.floor(Math.random() * a); // 1..a → Ergebnis ≥ 0
  return `${a} −${b} =${a - b}`;
}

/** Leichte Mal-Aufgabe - nur die leichten Reihen 2, 3, 4, 5, 10. */
function randomMul(): string {
  const reihen = [2, 3, 4, 5, 10];
  const a = reihen[Math.floor(Math.random() * reihen.length)];
  const b = 1 + Math.floor(Math.random() * 10); // 1..10
  return `${a} ×${b} =${a * b}`;
}

/** Eine zufällige Zahl (meist kurze Ganzzahlen, gelegentlich eine Dezimalzahl). */
function randomNumber(): string {
  const r = Math.random();
  if (r < 0.2) {
    const whole = 1 + Math.floor(Math.random() * 99);
    const frac = 1 + Math.floor(Math.random() * 9);
    return `${whole},${frac}`;
  }
  if (r < 0.6) return String(1 + Math.floor(Math.random() * 99));
  if (r < 0.9) return String(10 + Math.floor(Math.random() * 990));
  return String(1000 + Math.floor(Math.random() * 9000));
}

/**
 * „Shuffle-Bag": zieht jeden Eintrag einmal pro Pool-Durchlauf, ohne direkten
 * Wiederholer an der Nahtstelle. Bei Pool ≥ ZEILEN_PRO_STUFE gibt es damit KEINE
 * Wiederholung innerhalb einer Stufe; über das ganze Level sind Wiederholungen
 * gleichmäßig (mindestens Pool-Länge auseinander) verteilt statt geklumpt.
 */
function shuffleBag(pool: readonly string[], count: number): string[] {
  if (pool.length === 0) return [];
  const window = Math.min(ZEILEN_PRO_STUFE - 1, pool.length - 1);
  const out: string[] = [];
  const recent = new Set<string>();
  let bag: string[] = [];
  while (out.length < count) {
    if (bag.length === 0) bag = shuffle(pool);
    // Ersten Eintrag wählen, der nicht in den letzten `window` Zeilen vorkam -
    // so ist auch über die Bag-Naht hinweg jede Stufe (10 Zeilen) eindeutig.
    let idx = bag.findIndex((c) => !recent.has(c));
    if (idx === -1) idx = 0;
    const pick = bag.splice(idx, 1)[0];
    out.push(pick);
    recent.add(pick);
    if (recent.size > window) recent.delete(out[out.length - 1 - window]);
  }
  return out;
}

/** Deck aus einem Zufallsgenerator, eindeutig je gleitendem Stufen-Fenster. */
function uniqueDeck(gen: () => string, count: number): string[] {
  const out: string[] = [];
  const recent = new Set<string>();
  let guard = 0;
  while (out.length < count && guard < count * 80) {
    guard++;
    const v = gen();
    if (recent.has(v)) continue;
    out.push(v);
    recent.add(v);
    if (out.length > ZEILEN_PRO_STUFE) {
      recent.delete(out[out.length - 1 - ZEILEN_PRO_STUFE]);
    }
  }
  while (out.length < count) out.push(gen()); // Notausgang (kleiner Wertebereich)
  return out;
}

/**
 * Der komplette Aufgaben-Stapel EINES Levels (STUFEN_PRO_LEVEL × ZEILEN_PRO_STUFE).
 * Stufe s nutzt `deck.slice(s · ZEILEN_PRO_STUFE, …)`. Zahlen und Rechnungen
 * werden frisch erzeugt; alle anderen Level ziehen per Shuffle-Bag aus ihrem
 * (großen) Wortschatz, damit sich innerhalb eines Levels möglichst nichts
 * wiederholt.
 */
export function buildLevelDeck(level: Level): string[] {
  if (level.kind === "math") {
    // Gestaffelte Rechen-Etappen wählen ihren Generator über die (sprechende)
    // Etappen-id b-rechnen-plus/-minus/-mal. Das alte l8-rechnen (gemischt) bleibt.
    if (level.id.endsWith("plus")) return uniqueDeck(randomAdd, ZEILEN_PRO_LEVEL);
    if (level.id.endsWith("minus")) return uniqueDeck(randomSub, ZEILEN_PRO_LEVEL);
    if (level.id.endsWith("mal")) return uniqueDeck(randomMul, ZEILEN_PRO_LEVEL);
    return uniqueDeck(randomCalc, ZEILEN_PRO_LEVEL);
  }
  if (level.kind === "numbers") return uniqueDeck(randomNumber, ZEILEN_PRO_LEVEL);
  return shuffleBag(level.items, ZEILEN_PRO_LEVEL);
}
