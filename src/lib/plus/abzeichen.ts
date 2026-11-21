/**
 * Die Abzeichen von Plus.
 *
 * Grundlage: „Plus - Didaktisch-methodische Struktur", Abschnitt 10
 * („Belohnung, die nicht schadet"). Belohnung ist in dieser App ausdrücklich
 * erwünscht - und sie ist der Teil, bei dem man am leichtesten Schaden
 * anrichtet. Deshalb stehen die Verbote hier vor den Abzeichen:
 *
 *   · **Kein Abzeichen für Tempo.** Zeitdruck erzeugt Rechenangst und
 *     benachteiligt ein Kind mit Screenreader ein zweites Mal, weil die
 *     Vorlesezeit mitläuft.
 *   · **Kein Abzeichen dafür, nicht ausgesetzt zu haben.** Die Serien-Mechanik
 *     der großen Lern-Apps arbeitet mit Verlustangst. Hier zählen Tage nur
 *     aufwärts: ein verpasster Tag zerstört nichts.
 *   · **Sechs Familien mit Stufen** statt vieler Einzelabzeichen - und seit
 *     16.10.2026 die siebente, „Mut“ (Johannes, Entwurf Motivation).
 *   · **Sechs geheime.** Überraschungsabzeichen sind der unbedenklichste Typ,
 *     weil die Untergrabung der eigenen Motivation vor allem ERWARTETE
 *     Belohnungen trifft.
 *
 * ⚠️ Jedes Motiv gibt es plattformweit nur einmal (Entscheidung Johannes
 * 22.08.2026). Die Liste unten ist deshalb in `lib/abzeichen/motivpool.ts`
 * eingetragen; der Wächter dort schlägt an, wenn zwei Programme dasselbe Bild
 * greifen wollen.
 */

export type Familie =
  | "menge" | "treffsicherheit" | "vielfalt" | "tage" | "mut" | "miteinander" | "geheimnis";

export interface Abzeichen {
  id: string;
  /** Das Motiv. Zu jedem gibt es im Pool ein Bild. */
  emoji: string;
  /** Das Motiv in Worten - für die Sprachausgabe. Kurz halten. */
  bildbeschreibung: string;
  name: string;
  familie: Familie;
  /** Wofür es das gibt - ein Satz, kindgerecht. */
  bedingung: string;
  /** Geheime stehen erst in der Sammlung, wenn sie gefunden sind. */
  geheim?: boolean;
}

export const ABZEICHEN: readonly Abzeichen[] = [
  // Fleißige Rechner - die Menge. Zählt Aufgaben, nicht Minuten.
  { id: "plus-nilpferd", emoji: "🦛", bildbeschreibung: "ein Nilpferd", name: "Nilpferd", familie: "menge", bedingung: "50 Aufgaben gerechnet." },
  { id: "plus-eisbaer", emoji: "🐻‍❄️", bildbeschreibung: "ein Eisbär", name: "Eisbär", familie: "menge", bedingung: "200 Aufgaben gerechnet." },
  { id: "plus-nashorn", emoji: "🦏", bildbeschreibung: "ein Nashorn", name: "Nashorn", familie: "menge", bedingung: "500 Aufgaben gerechnet." },
  { id: "plus-wal", emoji: "🐋", bildbeschreibung: "ein Wal", name: "Wal", familie: "menge", bedingung: "1000 Aufgaben gerechnet." },
  { id: "plus-mammut", emoji: "🦣", bildbeschreibung: "ein Mammut", name: "Mammut", familie: "menge", bedingung: "2500 Aufgaben gerechnet." },

  // Genau hingeschaut - Treffsicherheit. Nie Tempo.
  { id: "plus-lupe", emoji: "🔍", bildbeschreibung: "eine Lupe", name: "Lupe", familie: "treffsicherheit", bedingung: "Eine Übung ganz ohne Fehler." },
  { id: "plus-mikroskop", emoji: "🔬", bildbeschreibung: "ein Mikroskop", name: "Mikroskop", familie: "treffsicherheit", bedingung: "Fünf Übungen ohne Fehler." },
  { id: "plus-luchs", emoji: "🐈‍⬛", bildbeschreibung: "eine schwarze Katze", name: "Luchs", familie: "treffsicherheit", bedingung: "Fünfzehn Übungen ohne Fehler." },
  { id: "plus-fernrohr", emoji: "🔭", bildbeschreibung: "ein Fernrohr", name: "Fernrohr", familie: "treffsicherheit", bedingung: "Vierzig Übungen ohne Fehler." },

  // Weit herumgekommen - Vielfalt. Belohnt das Ausprobieren, nicht das Bohren.
  { id: "plus-bruecke", emoji: "🌉", bildbeschreibung: "eine Brücke am Abend", name: "Brücke", familie: "vielfalt", bedingung: "Fünf verschiedene Übungen gerechnet." },
  { id: "plus-weltkugel", emoji: "🌎", bildbeschreibung: "eine Weltkugel", name: "Weltkugel", familie: "vielfalt", bedingung: "Fünfzehn verschiedene Übungen." },
  { id: "plus-segelboot", emoji: "⛵", bildbeschreibung: "ein Segelboot", name: "Segelboot", familie: "vielfalt", bedingung: "Dreißig verschiedene Übungen." },
  { id: "plus-insel", emoji: "🏝️", bildbeschreibung: "eine Insel mit Palme", name: "Insel", familie: "vielfalt", bedingung: "Sechzig verschiedene Übungen." },

  // Dranbleiber - Tage. ★ Gezählt werden TAGE INSGESAMT, keine Serie.
  { id: "plus-zweig", emoji: "🌿", bildbeschreibung: "ein grüner Zweig", name: "Zweig", familie: "tage", bedingung: "An drei Tagen gerechnet." },
  { id: "plus-kaktus", emoji: "🌵", bildbeschreibung: "ein Kaktus", name: "Kaktus", familie: "tage", bedingung: "An sieben Tagen gerechnet." },
  { id: "plus-sonnenblume", emoji: "🌻", bildbeschreibung: "eine Sonnenblume", name: "Sonnenblume", familie: "tage", bedingung: "An zwanzig Tagen gerechnet." },
  { id: "plus-tanne", emoji: "🌲", bildbeschreibung: "eine Tanne", name: "Tanne", familie: "tage", bedingung: "An fünfzig Tagen gerechnet." },

  // Mut - weitermachen, Hilfe holen, knobeln. ★ Für Hilfe holen gibt es ein
  // Abzeichen, nicht einen Makel (Entwurf 16.10.2026). Die Namen sind für alle
  // Altersstufen gleich und kommen ohne Lob-Floskel aus: was ein Kind der
  // 2. Stufe stolz macht, ist einem Kind der 7. Stufe peinlich.
  { id: "plus-kletterer", emoji: "🧗", bildbeschreibung: "eine Person beim Klettern", name: "Durchgehalten", familie: "mut", bedingung: "Nach einem Fehler weitergerechnet." },
  { id: "plus-rettungsring", emoji: "🛟", bildbeschreibung: "ein Rettungsring", name: "Hilfe genutzt", familie: "mut", bedingung: "Mit dem Rechenweg richtig gelöst." },
  { id: "plus-detektiv", emoji: "🕵️", bildbeschreibung: "eine Person mit Hut und Lupe", name: "Knobelei gelöst", familie: "mut", bedingung: "Ein Rätsel gelöst." },

  // Miteinander - Klassenziele. Kommt mit dem Klassenmatch.
  { id: "plus-haende", emoji: "🤝", bildbeschreibung: "zwei Hände, die sich fassen", name: "Hand in Hand", familie: "miteinander", bedingung: "Beim ersten Klassenziel mitgemacht." },
  { id: "plus-zelt", emoji: "🎪", bildbeschreibung: "ein Zirkuszelt", name: "Zelt", familie: "miteinander", bedingung: "Bei fünf Klassenzielen mitgemacht." },
  { id: "plus-burg", emoji: "🏰", bildbeschreibung: "eine Burg", name: "Burg", familie: "miteinander", bedingung: "Ein Klassenziel mit der ganzen Klasse geschafft." },

  // Die sechs Geheimnisse.
  { id: "plus-zauberstab", emoji: "🪄", bildbeschreibung: "ein Zauberstab", name: "Zauberstab", familie: "geheimnis", geheim: true, bedingung: "Ein Ergebnis, das vorwärts wie rückwärts gleich heißt." },
  { id: "plus-kleeblatt", emoji: "☘️", bildbeschreibung: "ein Kleeblatt", name: "Kleeblatt", familie: "geheimnis", geheim: true, bedingung: "Ein Ergebnis aus lauter gleichen Ziffern." },
  { id: "plus-wuerfel", emoji: "🎲", bildbeschreibung: "ein Würfel mit Punkten", name: "Würfel", familie: "geheimnis", geheim: true, bedingung: "Eine Aufgabe in Brailleschrift beantwortet." },
  { id: "plus-trampeltier", emoji: "🐫", bildbeschreibung: "ein Kamel mit zwei Höckern", name: "Trampeltier", familie: "geheimnis", geheim: true, bedingung: "Beide Brailleschriften ausprobiert." },
  { id: "plus-drache", emoji: "🐲", bildbeschreibung: "ein Drachenkopf", name: "Drache", familie: "geheimnis", geheim: true, bedingung: "Eine Aufgabe aus jeder Schulstufe gerechnet." },
  { id: "plus-bahnhof", emoji: "🚉", bildbeschreibung: "ein Bahnhof", name: "Bahnhof", familie: "geheimnis", geheim: true, bedingung: "Nach einer langen Pause zurückgekommen." },
];

/** Nachschlagen. */
export function abzeichen(id: string): Abzeichen | undefined {
  return ABZEICHEN.find((a) => a.id === id);
}

/* ------------------------------------------------------------------ */
/* Wofür es sie gibt                                                    */
/* ------------------------------------------------------------------ */

/**
 * Alles, was für die Abzeichen gezählt wird.
 *
 * ⚠️ Hier steht keine Uhr und kein Datum eines einzelnen Fehlers. Was ein
 * Abzeichen nicht braucht, wird nicht gezählt.
 */
export interface Zaehlstand {
  gerechnet: number;
  /** Übungen ohne einen einzigen Fehler. */
  laeufeOhneFehler: number;
  /** Wie viele verschiedene Pakete schon dran waren. */
  verschiedene: number;
  /** An wie vielen Tagen insgesamt gerechnet wurde - keine Serie. */
  tage: number;
  /** Mitgemachte Klassenziele. */
  klassenziele: number;
  /** Klassenziele, welche die Klasse geschafft hat. */
  klassenzieleGeschafft: number;
  /** Welche Brailleschriften schon benutzt wurden. */
  braille: string[];
  /** Aus wie vielen Schulstufen schon etwas gerechnet wurde. */
  stufen: number;
  /** Besonderheiten, die unterwegs auffielen - für die Geheimnisse. */
  besondere: string[];
  /** Tage zwischen der letzten und der vorletzten Übung. */
  pauseTage: number;
  /** Gelöste Rätsel - übersprungene zählen nirgends. */
  raetsel: number;
}

export function leererZaehlstand(): Zaehlstand {
  return {
    gerechnet: 0, laeufeOhneFehler: 0, verschiedene: 0, tage: 0,
    klassenziele: 0, klassenzieleGeschafft: 0, braille: [], stufen: 0,
    besondere: [], pauseTage: 0, raetsel: 0,
  };
}

/** Die Schwellen je Abzeichen. Eine Stelle, nicht zwei. */
const BEDINGUNG: Record<string, (z: Zaehlstand) => boolean> = {
  "plus-nilpferd": (z) => z.gerechnet >= 50,
  "plus-eisbaer": (z) => z.gerechnet >= 200,
  "plus-nashorn": (z) => z.gerechnet >= 500,
  "plus-wal": (z) => z.gerechnet >= 1000,
  "plus-mammut": (z) => z.gerechnet >= 2500,

  "plus-lupe": (z) => z.laeufeOhneFehler >= 1,
  "plus-mikroskop": (z) => z.laeufeOhneFehler >= 5,
  "plus-luchs": (z) => z.laeufeOhneFehler >= 15,
  "plus-fernrohr": (z) => z.laeufeOhneFehler >= 40,

  "plus-bruecke": (z) => z.verschiedene >= 5,
  "plus-weltkugel": (z) => z.verschiedene >= 15,
  "plus-segelboot": (z) => z.verschiedene >= 30,
  "plus-insel": (z) => z.verschiedene >= 60,

  "plus-zweig": (z) => z.tage >= 3,
  "plus-kaktus": (z) => z.tage >= 7,
  "plus-sonnenblume": (z) => z.tage >= 20,
  "plus-tanne": (z) => z.tage >= 50,

  "plus-kletterer": (z) => z.besondere.includes("durchgehalten"),
  "plus-rettungsring": (z) => z.besondere.includes("hilfe"),
  "plus-detektiv": (z) => z.raetsel >= 1,

  "plus-haende": (z) => z.klassenziele >= 1,
  "plus-zelt": (z) => z.klassenziele >= 5,
  "plus-burg": (z) => z.klassenzieleGeschafft >= 1,

  "plus-zauberstab": (z) => z.besondere.includes("palindrom"),
  "plus-kleeblatt": (z) => z.besondere.includes("gleiche_ziffern"),
  "plus-wuerfel": (z) => z.braille.length >= 1,
  "plus-trampeltier": (z) => z.braille.length >= 2,
  "plus-drache": (z) => z.stufen >= 8,
  "plus-bahnhof": (z) => z.pauseTage >= 14,
};

/** Welche Abzeichen sind mit diesem Stand verdient? */
export function verdient(z: Zaehlstand): string[] {
  return ABZEICHEN.filter((a) => BEDINGUNG[a.id]?.(z)).map((a) => a.id);
}

/** Was ist NEU dazugekommen? Nur das wird gemeldet. */
export function neueAbzeichen(z: Zaehlstand, schon: readonly string[]): string[] {
  const hat = new Set(schon);
  return verdient(z).filter((id) => !hat.has(id));
}

/**
 * Die Meldung - kurz, und sie geht als `role="status"` hinaus, nie als
 * `assertive`. Eine Blitzmeldung verdrängt auf der Braillezeile das, was
 * unter den Fingern liegt.
 */
export function meldung(id: string): string {
  const a = abzeichen(id);
  if (!a) return "";
  return `Neues Abzeichen: ${a.name}.`;
}

/* ------------------------------------------------------------------ */
/* Das Wochenziel                                                       */
/* ------------------------------------------------------------------ */

/**
 * Das Wochenziel zählt Aufgaben, ist vom Kind selbst gewählt und jederzeit
 * änderbar. Zielsetzung wirkt nur mit Rückmeldung und erreichbarem Ziel -
 * deshalb gibt es kein vorgegebenes Ziel und keine Strafe beim Verfehlen.
 */
export const WOCHENZIELE = [20, 50, 100, 200] as const;

export interface Wochenziel {
  /** Die Kalenderwoche, auf die sich der Zähler bezieht: „2026-39". */
  woche: string;
  ziel: number;
  geschafft: number;
}

/** Die Kalenderwoche nach ISO 8601 - Montag ist der erste Tag. */
export function kalenderwoche(datum: Date = new Date()): string {
  const d = new Date(Date.UTC(datum.getFullYear(), datum.getMonth(), datum.getDate()));
  const wochentag = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - wochentag);
  const jahresanfang = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const nummer = Math.ceil(((d.getTime() - jahresanfang.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-${String(nummer).padStart(2, "0")}`;
}

export function neuesWochenziel(ziel: number = WOCHENZIELE[1], datum = new Date()): Wochenziel {
  return { woche: kalenderwoche(datum), ziel, geschafft: 0 };
}

/** Eine Aufgabe dazuzählen - und in einer neuen Woche bei null anfangen. */
export function zaehleWoche(w: Wochenziel, datum = new Date()): Wochenziel {
  const jetzt = kalenderwoche(datum);
  if (w.woche !== jetzt) return { woche: jetzt, ziel: w.ziel, geschafft: 1 };
  return { ...w, geschafft: w.geschafft + 1 };
}

/** Wie weit ist das Kind? Ein Satz, kurz. */
export function wochenstand(w: Wochenziel): string {
  if (w.geschafft >= w.ziel) return `Wochenziel geschafft: ${w.geschafft} von ${w.ziel}.`;
  return `Diese Woche: ${w.geschafft} von ${w.ziel} Aufgaben.`;
}
