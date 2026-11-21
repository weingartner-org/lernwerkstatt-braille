/**
 * Abzeichen (Badges) von „Punktgenau" - das Motivations-System der Braille-App.
 *
 * Vorbild ist Klangpunkte (`lib/klangpunkte/badges.ts`, kleine App, gleiche
 * Größenordnung) und, für die Bauart der Vergabe, der Tipptrainer
 * (`lib/typing/badges.ts`: WENIGE FAMILIEN mit Steigerungs-Stufen, stiller
 * Nachtrag über eine Katalog-Fassung, Geheim-Abzeichen als Überraschung).
 *
 * ★★ KEINE NEUE DIDAKTIK. Jede Bedingung ist aus dem abgeleitet, was
 * Punktgenau schon misst:
 *   - Etappen gemeistert            → `progress.gemeistertAm`
 *   - Sterne / 3-Sterne-Etappen     → `progress.levels[…].bestStars`
 *   - XP und Rang                   → `playerLevel(progress.xp)` (xp.ts/progress.ts)
 *   - Tagesserie                    → `progress.streak.bestCount` (streak.ts)
 *   - je Bereich ein Abzeichen      → `doneCount()`/`areas.ts` (5 Bereiche)
 *   - fehlerfreie Meisterungen      → das Mastery-Fenster einer Etappe ganz
 *                                      ohne Fehler durchlaufen (adaptive.ts)
 *   - Trefferserien                 → richtige Aufgaben in Folge, über alle
 *                                      Etappen hinweg (Lebenszeit-Zähler)
 *   - aktive Tage / aktive Wochen   → wie „Dranbleiben"/„Übungswochen" im
 *                                      Tipptrainer, hier eigens geführt, weil
 *                                      Punktgenau keinen Runden-Verlauf hält
 *   - Geheim-Abzeichen              → Momente, die beim normalen Üben nebenbei
 *                                      passieren (Wochenende, früh/spät,
 *                                      Rückkehr nach Pause, beide Richtungen,
 *                                      alle Bereiche, zwei Etappen an einem
 *                                      Tag, Ferienzeit) - die Bedingung wird
 *                                      NICHT verraten, auch nicht per Sprache.
 *
 * Reine, testbare Logik (kein React, kein Audio, kein Storage-Zugriff außer
 * über `BrailleProgress`, das der Aufrufer lädt/speichert).
 *
 * ★ Speicherung additiv im vorhandenen Spielstand: `progress.abzeichen`
 * (id → Verdien-Zeitpunkt) und `progress.abzeichenZaehler` (Lebenszeit-Zähler,
 * die sich nicht allein aus `levels`/`gemeistertAm`/`streak` ablesen lassen).
 * Beide Felder sind optional - Altstände ohne Abzeichen-System laden
 * unverändert weiter.
 *
 * ★ STILLER NACHTRAG (wie beim Tipptrainer, 09.08.2026 dort entschieden):
 * Wächst {@link KATALOG_VERSION}, holt ein BESTANDSKONTO einmalig ohne Ton
 * und ohne Ansage nach, was es schon verdient hätte. Ein Konto OHNE jede
 * bisherige Übung (kein XP, keine Etappe, keine Meisterung) gilt als NEUES
 * Kind - für das gibt es nichts nachzutragen, es soll jedes Abzeichen selbst
 * erleben. Weil dieses ganze System am 22.09.2026 zum ersten Mal existiert,
 * ist `progress.abzeichen` bei JEDEM Kind zunächst leer - die Unterscheidung
 * „Bestandskonto vs. neues Kind" hängt darum NICHT an `abzeichen` selbst,
 * sondern an `xp`/`levels`/`gemeistertAm` (siehe {@link istBestandskonto}).
 *
 * Motive: jedes Emoji ist ein plattformweit FREIES Motiv aus dem gemeinsamen
 * Pool (`lib/abzeichen/motivpool.ts`, `sucheFreieMotive()`/`freieMotive()`);
 * `baueVergabe()` dort ist additiv um diesen Katalog ergänzt, damit der
 * Kollisions-Wächter (`tests/abzeichen-motivpool.test.ts`) auch Punktgenau
 * prüft.
 */
import type { Area, AreaKey, SprachAreaKey } from "./areas";
import { doneCount } from "./areas";
import type { BrailleProgress } from "./progress";
import { playerLevel } from "./progress";

// --- Definitionen ---------------------------------------------------------

export interface AbzeichenDef {
  id: string;
  /** Emoji - rein dekorativ (aria-hidden); die Sprachausgabe hört den Namen
   *  und die Beschreibung, nie das Zeichen selbst. Zugleich der Schlüssel
   *  zum Medaillenbild im gemeinsamen Motivpool (`motivCode()`). */
  emoji: string;
  /** Das Motiv in Worten, für die Sprachausgabe der Medaille. */
  bildbeschreibung: string;
  /** Anzeige-Name (auch vorgelesen). */
  name: string;
  /** Beschreibung (Bedingung) OHNE direkte Anrede - nie gegen das Kind. */
  description: string;
  /** Anzeige-Familie im Regal. */
  group: string;
  /** Geheim: vor dem Verdienen erscheint nur „???" - auch die Bedingung
   *  bleibt verborgen, auch für die Sprachausgabe. */
  secret?: boolean;
}

/** Schwellen der Steigerungs-Familien (gebündelt, leicht tunbar). */
export const ETAPPEN_TIERS = [1, 5, 15, 30, 50] as const;
export const STERNE_TIERS = [10, 30, 75, 150] as const;
export const BESTNOTE_TIERS = [1, 5, 15, 30] as const;
export const RANG_TIERS = [5, 10, 20, 40] as const;
export const SERIE_TIERS = [3, 7, 14, 30] as const;
export const FEHLERFREI_TIERS = [1, 5, 15, 30] as const;
export const TREFFER_TIERS = [10, 30, 75, 150] as const;
export const TAGE_TIERS = [3, 7, 20, 50, 100] as const;
export const WOCHEN_TIERS = [4, 12, 26] as const;

/** Nach so langer Pause zählt die Rückkehr als „Zurück im Sattel" (Geheim). */
export const COMEBACK_TAGE = 14;
export const COMEBACK_MS = COMEBACK_TAGE * 86_400_000;

const ETAPPEN_IDS = ["etappe-1", "etappe-5", "etappe-15", "etappe-30", "etappe-50"] as const;
const STERNE_IDS = ["sterne-10", "sterne-30", "sterne-75", "sterne-150"] as const;
const BESTNOTE_IDS = ["bestnote-1", "bestnote-5", "bestnote-15", "bestnote-30"] as const;
const RANG_IDS = ["rang-5", "rang-10", "rang-20", "rang-40"] as const;
const SERIE_IDS = ["serie-3", "serie-7", "serie-14", "serie-30"] as const;
const FEHLERFREI_IDS = ["fehlerfrei-1", "fehlerfrei-5", "fehlerfrei-15", "fehlerfrei-30"] as const;
const TREFFER_IDS = ["treffer-10", "treffer-30", "treffer-75", "treffer-150"] as const;
const TAGE_IDS = ["tage-3", "tage-7", "tage-20", "tage-50", "tage-100"] as const;
const WOCHEN_IDS = ["wochen-4", "wochen-12", "wochen-26"] as const;

/** Die fünf echten Punktgenau-Bereiche (ohne die Klangpunkte-Pseudo-Area „noten"). */
const BEREICH_KEYS: readonly Exclude<AreaKey, "noten" | SprachAreaKey>[] = [
  "basis",
  "voll",
  "computer",
  "kurzschrift",
  "ueb",
];
const BEREICH_BADGE: Record<Exclude<AreaKey, "noten" | SprachAreaKey>, string> = {
  basis: "bereich-basis",
  voll: "bereich-voll",
  computer: "bereich-computer",
  kurzschrift: "bereich-kurzschrift",
  ueb: "bereich-ueb",
};

export const ABZEICHEN: AbzeichenDef[] = [
  // Familie „Etappenpfad" - gesamt gemeisterte Etappen, über alle Bereiche.
  { id: "etappe-1", emoji: "👣", bildbeschreibung: "zwei Fußabdrücke", name: "Erste Schritte", group: "Etappenpfad", description: "Die erste Etappe gemeistert." },
  { id: "etappe-5", emoji: "🌱", bildbeschreibung: "ein kleiner Sprössling", name: "Kleiner Sprössling", group: "Etappenpfad", description: "5 Etappen gemeistert." },
  { id: "etappe-15", emoji: "🪜", bildbeschreibung: "eine Leiter", name: "Sprossenweise", group: "Etappenpfad", description: "15 Etappen gemeistert." },
  { id: "etappe-30", emoji: "🦮", bildbeschreibung: "ein Blindenführhund", name: "Sicher unterwegs", group: "Etappenpfad", description: "30 Etappen gemeistert." },
  { id: "etappe-50", emoji: "🗺", bildbeschreibung: "eine Landkarte", name: "Große Reise", group: "Etappenpfad", description: "50 Etappen gemeistert." },
  // Familie „Bereiche" - je Bereich EIN Abzeichen, wenn er ganz geschafft ist.
  { id: "bereich-basis", emoji: "🧱", bildbeschreibung: "ein Ziegelstein", name: "Fundament gelegt", group: "Bereiche", description: "Die ganze Basisschrift gemeistert." },
  { id: "bereich-voll", emoji: "📖", bildbeschreibung: "ein aufgeschlagenes Buch", name: "Ganze Vollschrift", group: "Bereiche", description: "Die ganze Vollschrift gemeistert." },
  { id: "bereich-computer", emoji: "💻", bildbeschreibung: "ein Laptop", name: "Acht Punkte gemeistert", group: "Bereiche", description: "Den ganzen Bereich Computer (8-Punkt-Braille) gemeistert." },
  { id: "bereich-kurzschrift", emoji: "💨", bildbeschreibung: "eine Staubwolke, die davonsaust", name: "Kurz und schnell", group: "Bereiche", description: "Die ganze Kurzschrift gemeistert." },
  { id: "bereich-ueb", emoji: "🌐", bildbeschreibung: "eine Weltkugel mit Längen- und Breitengraden", name: "Weltweite Schrift", group: "Bereiche", description: "Das ganze UEB (Englisch) gemeistert." },
  // Familie „Sterne" - Sterne gesamt, über alle Etappen.
  { id: "sterne-10", emoji: "❇️", bildbeschreibung: "ein funkelndes Sternchen", name: "Erster Glanz", group: "Sterne", description: "10 Sterne gesammelt." },
  { id: "sterne-30", emoji: "🎇", bildbeschreibung: "ein Wunderkerzen-Feuerwerk", name: "Funkenregen", group: "Sterne", description: "30 Sterne gesammelt." },
  { id: "sterne-75", emoji: "🌃", bildbeschreibung: "eine Stadt bei Nacht unter Sternen", name: "Sternennacht", group: "Sterne", description: "75 Sterne gesammelt." },
  { id: "sterne-150", emoji: "🔯", bildbeschreibung: "ein sechszackiger Stern mit einem Punkt in der Mitte", name: "Sechs-Punkte-Stern", group: "Sterne", description: "150 Sterne gesammelt - so viele Punkte wie eine Braillezelle Ecken hat, hundertfach." },
  // Familie „Bestnote" - Etappen mit vollen 3 Sternen.
  { id: "bestnote-1", emoji: "🥉", bildbeschreibung: "eine Bronze-Medaille", name: "Erste Bestnote", group: "Bestnote", description: "Die erste Etappe mit 3 Sternen gemeistert." },
  { id: "bestnote-5", emoji: "🥈", bildbeschreibung: "eine Silber-Medaille", name: "Fünf Bestnoten", group: "Bestnote", description: "5 Etappen mit 3 Sternen gemeistert." },
  { id: "bestnote-15", emoji: "🥇", bildbeschreibung: "eine Gold-Medaille", name: "Fünfzehn Bestnoten", group: "Bestnote", description: "15 Etappen mit 3 Sternen gemeistert." },
  { id: "bestnote-30", emoji: "🎖️", bildbeschreibung: "ein Orden mit Band", name: "Dreißig Bestnoten", group: "Bestnote", description: "30 Etappen mit 3 Sternen gemeistert." },
  // Familie „Rang" - Spielstufe aus der Gesamt-XP.
  { id: "rang-5", emoji: "🐿️", bildbeschreibung: "ein Streifenhörnchen", name: "Wächst weiter", group: "Rang", description: "Rang 5 erreicht." },
  { id: "rang-10", emoji: "🦔", bildbeschreibung: "ein Igel", name: "Stachelig stark", group: "Rang", description: "Rang 10 erreicht." },
  { id: "rang-20", emoji: "🦋", bildbeschreibung: "ein Schmetterling", name: "Verwandlung", group: "Rang", description: "Rang 20 erreicht." },
  { id: "rang-40", emoji: "🦚", bildbeschreibung: "ein Pfau mit aufgestelltem Rad", name: "Stolz und bunt", group: "Rang", description: "Rang 40 erreicht." },
  // Familie „Tagesserie" - Tage in Folge geübt (mit einem Gnadentag, streak.ts).
  { id: "serie-3", emoji: "🕯️", bildbeschreibung: "eine brennende Kerze", name: "Licht an", group: "Tagesserie", description: "3 Tage in Folge geübt." },
  { id: "serie-7", emoji: "🐝", bildbeschreibung: "eine Biene", name: "Fleißig wie eine Biene", group: "Tagesserie", description: "7 Tage in Folge geübt." },
  { id: "serie-14", emoji: "🦦", bildbeschreibung: "ein Fischotter", name: "Beharrlich dran", group: "Tagesserie", description: "14 Tage in Folge geübt." },
  { id: "serie-30", emoji: "🔥", bildbeschreibung: "eine Flamme", name: "Die Serie brennt", group: "Tagesserie", description: "30 Tage in Folge geübt." },
  // Familie „Fehlerfrei" - Etappen, die ganz ohne einen Fehler im Übungs-Fenster gemeistert wurden.
  { id: "fehlerfrei-1", emoji: "🫧", bildbeschreibung: "Seifenblasen", name: "Blitzblank", group: "Fehlerfrei", description: "Die erste Etappe ganz ohne Fehler gemeistert." },
  { id: "fehlerfrei-5", emoji: "🧹", bildbeschreibung: "ein Besen", name: "Reiner Weg", group: "Fehlerfrei", description: "5 Etappen ganz ohne Fehler gemeistert." },
  { id: "fehlerfrei-15", emoji: "🔷", bildbeschreibung: "eine blaue Raute", name: "Glasklar", group: "Fehlerfrei", description: "15 Etappen ganz ohne Fehler gemeistert." },
  { id: "fehlerfrei-30", emoji: "🔶", bildbeschreibung: "eine orangefarbene Raute", name: "Makellos", group: "Fehlerfrei", description: "30 Etappen ganz ohne Fehler gemeistert." },
  // Familie „Trefferserien" - richtige Aufgaben in Folge, über alle Etappen hinweg.
  { id: "treffer-10", emoji: "🏹", bildbeschreibung: "Pfeil und Bogen", name: "Zielsicher", group: "Trefferserien", description: "10 Aufgaben in Folge richtig." },
  { id: "treffer-30", emoji: "🧨", bildbeschreibung: "ein Knallfrosch", name: "Kettenreaktion", group: "Trefferserien", description: "30 Aufgaben in Folge richtig." },
  { id: "treffer-75", emoji: "🪁", bildbeschreibung: "ein Drachen am Himmel", name: "Hoch hinaus", group: "Trefferserien", description: "75 Aufgaben in Folge richtig." },
  { id: "treffer-150", emoji: "🥏", bildbeschreibung: "eine fliegende Scheibe", name: "Volle Fahrt", group: "Trefferserien", description: "150 Aufgaben in Folge richtig." },
  // Familie „Aktive Tage" - verschiedene Übungstage (zählt nur aufwärts).
  { id: "tage-3", emoji: "🐹", bildbeschreibung: "ein Hamster", name: "Immer wieder da", group: "Aktive Tage", description: "An 3 verschiedenen Tagen geübt." },
  { id: "tage-7", emoji: "🦭", bildbeschreibung: "eine Robbe", name: "Ganz schön ausdauernd", group: "Aktive Tage", description: "An 7 verschiedenen Tagen geübt." },
  { id: "tage-20", emoji: "🐺", bildbeschreibung: "ein Wolf", name: "Fest im Rudel", group: "Aktive Tage", description: "An 20 verschiedenen Tagen geübt." },
  { id: "tage-50", emoji: "🐪", bildbeschreibung: "ein Kamel", name: "Weiter Weg", group: "Aktive Tage", description: "An 50 verschiedenen Tagen geübt." },
  { id: "tage-100", emoji: "🦒", bildbeschreibung: "eine Giraffe", name: "Über allem hinaus", group: "Aktive Tage", description: "An 100 verschiedenen Tagen geübt - fast ein ganzes Schuljahr." },
  // Familie „Aktive Wochen" - verschiedene Kalenderwochen mit mindestens einem Übungstag.
  { id: "wochen-4", emoji: "🍁", bildbeschreibung: "ein Ahornblatt", name: "Ein Monat dabei", group: "Aktive Wochen", description: "In 4 verschiedenen Wochen geübt." },
  { id: "wochen-12", emoji: "🍀", bildbeschreibung: "ein vierblättriges Kleeblatt", name: "Ein Vierteljahr dabei", group: "Aktive Wochen", description: "In 12 verschiedenen Wochen geübt." },
  { id: "wochen-26", emoji: "🌈", bildbeschreibung: "ein Regenbogen", name: "Ein halbes Jahr dabei", group: "Aktive Wochen", description: "In 26 verschiedenen Wochen geübt." },
  // Geheim-Abzeichen (vor dem Verdienen nur „???" - auch die Bedingung bleibt verborgen).
  { id: "geheim-nachteule", emoji: "🌙", bildbeschreibung: "ein Halbmond", name: "Nachteule", group: "Geheim", secret: true, description: "Eine Aufgabe nach 21 Uhr gelöst." },
  { id: "geheim-fruehaufsteher", emoji: "🌅", bildbeschreibung: "ein Sonnenaufgang übers Meer", name: "Früher Vogel", group: "Geheim", secret: true, description: "Eine Aufgabe vor 7 Uhr gelöst." },
  { id: "geheim-wochenende", emoji: "🎊", bildbeschreibung: "ein Konfettiball", name: "Wochenend-Schreiber", group: "Geheim", secret: true, description: "An einem Samstag und an einem Sonntag geübt." },
  { id: "geheim-comeback", emoji: "🔃", bildbeschreibung: "zwei im Kreis laufende Pfeile", name: "Zurück im Sattel", group: "Geheim", secret: true, description: `Nach mehr als ${COMEBACK_TAGE} Tagen Pause wieder geübt - Wiederkommen zählt.` },
  { id: "geheim-beide-richtungen", emoji: "🔀", bildbeschreibung: "zwei gekreuzte Pfeile", name: "Zwei Wege an einem Tag", group: "Geheim", secret: true, description: "An einem Tag geschrieben UND gelesen." },
  { id: "geheim-alle-bereiche", emoji: "🧩", bildbeschreibung: "ein Puzzleteil", name: "Alle Teile", group: "Geheim", secret: true, description: "In jedem der fünf Bereiche schon geübt." },
  { id: "geheim-doppelt-gemeistert", emoji: "🎉", bildbeschreibung: "eine Partyknalltüte", name: "Doppelt gefeiert", group: "Geheim", secret: true, description: "Zwei Etappen an einem einzigen Tag gemeistert." },
  { id: "geheim-ferienkind", emoji: "⛺", bildbeschreibung: "ein Zelt", name: "Ferienkind", group: "Geheim", secret: true, description: "Mitten im Sommer geübt - im Juli oder August." },
];

const BY_ID = new Map(ABZEICHEN.map((b) => [b.id, b]));

export function abzeichenById(id: string): AbzeichenDef | undefined {
  return BY_ID.get(id);
}

// --- Lebenszeit-Zähler (Tally) --------------------------------------------

/**
 * Zähler und Merker, die sich nicht allein aus `levels`/`gemeistertAm`/
 * `streak` ablesen lassen - nötig, weil Punktgenau (anders als der
 * Tipptrainer) keinen Runden-Verlauf im Spielstand hält. Alle Felder
 * additiv, alle nur aufwärts bzw. einmal gesetzt (kein Verlust).
 */
export interface AbzeichenZaehler {
  /** Fassung des Katalogs, die dieser Stand schon gesehen hat (stiller Nachtrag). */
  katalog?: number;
  /** Aktuelle Trefferserie (richtige Aufgaben in Folge, über alle Etappen). */
  trefferSerie?: number;
  /** Längste je erreichte Trefferserie. */
  besteTrefferSerie?: number;
  /** Etappen, die beim ERSTEN Meistern ganz ohne Fehler im Übungs-Fenster geschafft wurden. */
  fehlerfreieMeisterungen?: number;
  /** Verschiedene Übungstage, gezählt (wie „Dranbleiben" im Tipptrainer). */
  tage?: number;
  /** Zuletzt gezählter Übungstag (YYYY-MM-DD). */
  letzterTag?: string;
  /** Verschiedene Übungswochen, gezählt. */
  wochen?: number;
  /** Zuletzt gezählte Übungswoche (ISO, z. B. „2026-W38"). */
  letzteWoche?: string;
  /** Schon an einem Samstag / an einem Sonntag geübt? („Wochenend-Schreiber") */
  samstagGeuebt?: boolean;
  sonntagGeuebt?: boolean;
  /** Schon nach 21 Uhr / vor 7 Uhr geübt? („Nachteule"/„Früher Vogel") */
  spaetAbendGeuebt?: boolean;
  fruehMorgensGeuebt?: boolean;
  /** Nach einer langen Pause wieder geübt? („Zurück im Sattel") */
  langePauseZurueck?: boolean;
  /** Zeitpunkt der letzten Aufgabe (für die Pause-Erkennung). */
  letzteAufgabeTs?: number;
  /** Bereiche, in denen schon mindestens eine Aufgabe geübt wurde. */
  bereicheGeuebt?: string[];
  /** In JEDEM der fünf Bereiche schon geübt? („Alle Teile") */
  alleBereicheGeuebt?: boolean;
  /** Tag, für den `richtungenHeute` gilt. */
  richtungenHeuteTag?: string;
  /** Richtungen, die AN DIESEM TAG schon geübt wurden: „w", „r" oder „wr". */
  richtungenHeute?: string;
  /** An einem Tag sowohl geschrieben als auch gelesen? („Zwei Wege an einem Tag") */
  beideRichtungenAnEinemTag?: boolean;
  /** Tag, für den `gemeistertHeuteAnzahl` gilt. */
  gemeistertHeuteTag?: string;
  /** Etappen, die AN DIESEM TAG zum ersten Mal gemeistert wurden. */
  gemeistertHeuteAnzahl?: number;
  /** Zwei Etappen an einem Tag gemeistert? („Doppelt gefeiert") */
  zweiEtappenAnEinemTag?: boolean;
  /** Mitten im Sommer geübt (Juli/August)? („Ferienkind") */
  ferienkind?: boolean;
}

export function leererAbzeichenZaehler(): AbzeichenZaehler {
  return {};
}

// --- Auswertung -------------------------------------------------------------

/** Ein Ereignis, das Abzeichen auslösen kann - am Rundenende (jede Aufgabe)
 *  UND bei Etappen-Meisterung. Punktgenau meldet Aufgaben-Ergebnisse einzeln
 *  (kein Runden-Batch wie der Tipptrainer); Text-Etappen (kein Mastery-
 *  Fenster) melden nur die Meisterung, ohne `aufgabeRichtig`. */
export interface AbzeichenEreignis {
  /** Bereich, in dem gerade geübt wird. */
  areaKey: AreaKey;
  /** Übungsrichtung dieser Aufgabe/Etappe. */
  richtung: "write" | "read";
  /** Eine einzelne Aufgabe beantwortet? Fehlt bei Text-Etappen (kein
   *  Aufgaben-Fenster - siehe `applyTextComplete` in Punktgenau.tsx). */
  aufgabeRichtig?: boolean;
  /** Wurde mit diesem Ereignis eine Etappe zum ERSTEN Mal gemeistert? */
  etappeGemeistert?: boolean;
  /** War die Meisterung fehlerfrei (kein Fehler im ganzen Übungs-Fenster)?
   *  Nur bei aufgabenbasierten Etappen bekannt - lieber keine Zahl als eine
   *  erfundene, Text-Etappen lassen dieses Feld leer und zählen hier nicht mit. */
  fehlerfreiGemeistert?: boolean;
}

function tierIds(prefixIds: readonly string[], tiers: readonly number[], value: number): string[] {
  const out: string[] = [];
  for (let i = 0; i < tiers.length; i++) if (value >= tiers[i]) out.push(prefixIds[i]);
  return out;
}

/** Lokales Datum als YYYY-MM-DD (wie im Tipptrainer - nach der Uhr des Kindes). */
function tagSchluessel(ts: number): string {
  const d = new Date(ts);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const t = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${t}`;
}

/** Kalenderwoche nach ISO 8601 („2026-W38"). */
function wochenSchluessel(ts: number): string {
  const d = new Date(ts);
  const datum = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const tag = datum.getUTCDay() || 7;
  datum.setUTCDate(datum.getUTCDate() + 4 - tag);
  const jahresanfang = new Date(Date.UTC(datum.getUTCFullYear(), 0, 1));
  const woche = Math.ceil(((datum.getTime() - jahresanfang.getTime()) / 86_400_000 + 1) / 7);
  return `${datum.getUTCFullYear()}-W${String(woche).padStart(2, "0")}`;
}

/** Gesamt-Sterne, 3-Sterne-Etappen und gemeisterte Etappen aus dem Spielstand. */
function summen(p: BrailleProgress): { etappen: number; sterne: number; dreiSterne: number } {
  const etappen = Object.keys(p.gemeistertAm ?? {}).length;
  let sterne = 0;
  let dreiSterne = 0;
  for (const rec of Object.values(p.levels ?? {})) {
    sterne += rec.bestStars ?? 0;
    if ((rec.bestStars ?? 0) >= 3) dreiSterne += 1;
  }
  return { etappen, sterne, dreiSterne };
}

/**
 * Alle Abzeichen, die sich allein aus dem ZUSTAND ergeben (Spielstand +
 * Zähler) - trägt die normale Vergabe UND den stillen Nachtrag.
 */
function earnedFromState(
  p: BrailleProgress,
  z: AbzeichenZaehler,
  areas: readonly Area[],
): Set<string> {
  const { etappen, sterne, dreiSterne } = summen(p);
  const rang = playerLevel(p.xp ?? 0).level;
  const serie = p.streak?.bestCount ?? 0;
  const earned = new Set<string>([
    ...tierIds(ETAPPEN_IDS, ETAPPEN_TIERS, etappen),
    ...tierIds(STERNE_IDS, STERNE_TIERS, sterne),
    ...tierIds(BESTNOTE_IDS, BESTNOTE_TIERS, dreiSterne),
    ...tierIds(RANG_IDS, RANG_TIERS, rang),
    ...tierIds(SERIE_IDS, SERIE_TIERS, serie),
    ...tierIds(FEHLERFREI_IDS, FEHLERFREI_TIERS, z.fehlerfreieMeisterungen ?? 0),
    ...tierIds(TREFFER_IDS, TREFFER_TIERS, z.besteTrefferSerie ?? 0),
    ...tierIds(TAGE_IDS, TAGE_TIERS, z.tage ?? 0),
    ...tierIds(WOCHEN_IDS, WOCHEN_TIERS, z.wochen ?? 0),
  ]);
  for (const a of areas) {
    if (a.etappen.length === 0) continue;
    const key = a.key as Exclude<AreaKey, "noten" | SprachAreaKey>;
    const id = BEREICH_BADGE[key];
    if (id && doneCount(a, p) >= a.etappen.length) earned.add(id);
  }
  if (z.samstagGeuebt && z.sonntagGeuebt) earned.add("geheim-wochenende");
  if (z.spaetAbendGeuebt) earned.add("geheim-nachteule");
  if (z.fruehMorgensGeuebt) earned.add("geheim-fruehaufsteher");
  if (z.langePauseZurueck) earned.add("geheim-comeback");
  if (z.beideRichtungenAnEinemTag) earned.add("geheim-beide-richtungen");
  if (z.alleBereicheGeuebt) earned.add("geheim-alle-bereiche");
  if (z.zweiEtappenAnEinemTag) earned.add("geheim-doppelt-gemeistert");
  if (z.ferienkind) earned.add("geheim-ferienkind");
  return earned;
}

/** Fassung des Abzeichen-Katalogs - steigt sie, trägt {@link awardAbzeichen}
 *  alles schon Verdiente einem BESTANDSKONTO einmalig still nach. */
export const KATALOG_VERSION = 1;

/** Hat dieses Konto schon irgendetwas geübt (unabhängig von Abzeichen)? Nur
 *  bei einem Bestandskonto trägt der stille Nachtrag nach; ein Konto ganz
 *  ohne Übung ist ein NEUES Kind und soll jedes Abzeichen selbst erleben. */
function istBestandskonto(p: BrailleProgress): boolean {
  return (p.xp ?? 0) > 0 || Object.keys(p.levels ?? {}).length > 0 || Object.keys(p.gemeistertAm ?? {}).length > 0;
}

function backfillSilently(
  p: BrailleProgress,
  z: AbzeichenZaehler,
  jetzt: number,
  areas: readonly Area[],
): Record<string, number> {
  const have = p.abzeichen ?? {};
  if ((z.katalog ?? 0) >= KATALOG_VERSION) return have;
  z.katalog = KATALOG_VERSION;
  if (Object.keys(have).length === 0 && !istBestandskonto(p)) return have;
  const schon = earnedFromState(p, z, areas);
  const dazu = ABZEICHEN.filter((b) => schon.has(b.id) && !(b.id in have));
  if (dazu.length === 0) return have;
  return { ...have, ...Object.fromEntries(dazu.map((b) => [b.id, jetzt])) };
}

/**
 * Ein Ereignis verbuchen: Zähler fortschreiben, neu verdiente Abzeichen
 * ermitteln und in den Spielstand schreiben. Reine, testbare Funktion -
 * `jetzt` und `areas` (die tatsächlich freigeschalteten Bereiche der Klasse,
 * `buildAreas()`/`AREAS`) kommen vom Aufrufer.
 */
export function awardAbzeichen(
  p: BrailleProgress,
  ereignis: AbzeichenEreignis,
  jetzt: number,
  areas: readonly Area[],
): { progress: BrailleProgress; neu: AbzeichenDef[] } {
  const z: AbzeichenZaehler = p.abzeichenZaehler ? { ...p.abzeichenZaehler } : leererAbzeichenZaehler();
  const have = backfillSilently(p, z, jetzt, areas);

  const tag = tagSchluessel(jetzt);
  const woche = wochenSchluessel(jetzt);
  const stunde = new Date(jetzt).getHours();
  const wochentag = new Date(jetzt).getDay(); // 0 = Sonntag, 6 = Samstag
  const monat = new Date(jetzt).getMonth(); // 0 = Januar … 6 = Juli, 7 = August

  if (z.letzterTag !== tag) {
    z.tage = (z.tage ?? 0) + 1;
    z.letzterTag = tag;
  }
  if (z.letzteWoche !== woche) {
    z.wochen = (z.wochen ?? 0) + 1;
    z.letzteWoche = woche;
  }
  if (wochentag === 6) z.samstagGeuebt = true;
  if (wochentag === 0) z.sonntagGeuebt = true;
  if (stunde >= 21) z.spaetAbendGeuebt = true;
  if (stunde < 7) z.fruehMorgensGeuebt = true;
  if (z.letzteAufgabeTs !== undefined && jetzt - z.letzteAufgabeTs > COMEBACK_MS) z.langePauseZurueck = true;
  z.letzteAufgabeTs = jetzt;
  if (monat === 6 || monat === 7) z.ferienkind = true;

  const bereiche = new Set(z.bereicheGeuebt ?? []);
  bereiche.add(ereignis.areaKey);
  z.bereicheGeuebt = [...bereiche];
  if (BEREICH_KEYS.every((k) => bereiche.has(k))) z.alleBereicheGeuebt = true;

  if (z.richtungenHeuteTag !== tag) {
    z.richtungenHeuteTag = tag;
    z.richtungenHeute = "";
  }
  const kuerzel = ereignis.richtung === "write" ? "w" : "r";
  if (!(z.richtungenHeute ?? "").includes(kuerzel)) z.richtungenHeute = (z.richtungenHeute ?? "") + kuerzel;
  if ((z.richtungenHeute ?? "").includes("w") && (z.richtungenHeute ?? "").includes("r"))
    z.beideRichtungenAnEinemTag = true;

  if (ereignis.aufgabeRichtig === true) {
    z.trefferSerie = (z.trefferSerie ?? 0) + 1;
    z.besteTrefferSerie = Math.max(z.besteTrefferSerie ?? 0, z.trefferSerie);
  } else if (ereignis.aufgabeRichtig === false) {
    z.trefferSerie = 0;
  }

  if (ereignis.etappeGemeistert) {
    if (ereignis.fehlerfreiGemeistert) z.fehlerfreieMeisterungen = (z.fehlerfreieMeisterungen ?? 0) + 1;
    if (z.gemeistertHeuteTag !== tag) {
      z.gemeistertHeuteTag = tag;
      z.gemeistertHeuteAnzahl = 0;
    }
    z.gemeistertHeuteAnzahl = (z.gemeistertHeuteAnzahl ?? 0) + 1;
    if (z.gemeistertHeuteAnzahl >= 2) z.zweiEtappenAnEinemTag = true;
  }

  const earned = earnedFromState(p, z, areas);
  const neu = ABZEICHEN.filter((b) => earned.has(b.id) && !(b.id in have));
  const abzeichen = neu.length ? { ...have, ...Object.fromEntries(neu.map((b) => [b.id, jetzt])) } : have;
  return { progress: { ...p, abzeichen, abzeichenZaehler: z }, neu };
}

/** Verdiente Abzeichen (Definitions-Reihenfolge) mit Verdien-Zeitpunkt. */
export function verdienteAbzeichen(p: BrailleProgress): Array<{ def: AbzeichenDef; ts: number }> {
  const have = p.abzeichen ?? {};
  return ABZEICHEN.filter((b) => b.id in have).map((b) => ({ def: b, ts: have[b.id] }));
}

export interface NaechstesZiel {
  def: AbzeichenDef;
  hat: number;
  braucht: number;
  einheit: string;
}

/** Die drei am ehesten erreichbaren nächsten Ziele (relativer Fortschritt). */
export function naechsteZiele(p: BrailleProgress, areas: readonly Area[]): NaechstesZiel[] {
  const z = p.abzeichenZaehler ?? leererAbzeichenZaehler();
  const { etappen, sterne, dreiSterne } = summen(p);
  const rang = playerLevel(p.xp ?? 0).level;
  const serie = p.streak?.bestCount ?? 0;
  const familien: Array<{ ids: readonly string[]; tiers: readonly number[]; hat: number; einheit: string }> = [
    { ids: ETAPPEN_IDS, tiers: ETAPPEN_TIERS, hat: etappen, einheit: "gemeisterte Etappen" },
    { ids: STERNE_IDS, tiers: STERNE_TIERS, hat: sterne, einheit: "Sterne" },
    { ids: BESTNOTE_IDS, tiers: BESTNOTE_TIERS, hat: dreiSterne, einheit: "Etappen mit 3 Sternen" },
    { ids: RANG_IDS, tiers: RANG_TIERS, hat: rang, einheit: "Rang" },
    { ids: SERIE_IDS, tiers: SERIE_TIERS, hat: serie, einheit: "Tage in Folge" },
    { ids: FEHLERFREI_IDS, tiers: FEHLERFREI_TIERS, hat: z.fehlerfreieMeisterungen ?? 0, einheit: "fehlerfreie Meisterungen" },
    { ids: TREFFER_IDS, tiers: TREFFER_TIERS, hat: z.besteTrefferSerie ?? 0, einheit: "Aufgaben in Folge richtig" },
    { ids: TAGE_IDS, tiers: TAGE_TIERS, hat: z.tage ?? 0, einheit: "Übungstage" },
    { ids: WOCHEN_IDS, tiers: WOCHEN_TIERS, hat: z.wochen ?? 0, einheit: "Übungswochen" },
  ];
  const have = p.abzeichen ?? {};
  const ziele: NaechstesZiel[] = [];
  for (const f of familien) {
    for (let i = 0; i < f.tiers.length; i++) {
      const id = f.ids[i];
      if (id in have) continue;
      const def = abzeichenById(id);
      if (def) ziele.push({ def, hat: f.hat, braucht: f.tiers[i], einheit: f.einheit });
      break; // nur das nächste Ziel der Familie
    }
  }
  // Bereichs-Abzeichen als nicht-gestufte „Ziele" mit an Bord (Fortschritt = doneCount/länge).
  for (const a of areas) {
    if (a.etappen.length === 0) continue;
    const key = a.key as Exclude<AreaKey, "noten" | SprachAreaKey>;
    const id = BEREICH_BADGE[key];
    if (id && !(id in have)) {
      const def = abzeichenById(id);
      if (def) ziele.push({ def, hat: doneCount(a, p), braucht: a.etappen.length, einheit: "Etappen im Bereich" });
    }
  }
  return ziele.sort((a, b) => b.hat / b.braucht - a.hat / a.braucht).slice(0, 3);
}
