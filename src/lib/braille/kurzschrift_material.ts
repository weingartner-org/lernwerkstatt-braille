/**
 * Kurzschrift-Übungsmaterial der 48 KFA-Lektionen (Umbau 03.07.2026).
 *
 * REINE DATEN — lädt das build-time generierte, geprüfte Material
 * (generated/kfa-material.generated.json). Jedes Wort und jeder Satz ist per
 * liblouis de-g2 verifiziert: Er braucht AUSSCHLIESSLICH Kürzungen aus Lektionen
 * ≤ N (KFA-Grundprinzip — keine fehlerhaft gekürzten Wörter, die ein Kind falsch
 * lernen könnte). Erzeugt von scripts/kfa/gen-material.mjs; nie von Hand ändern.
 *
 * Die Braille-Zellen kommen zur Laufzeit aus liblouis de-g2 (nie aus dieser
 * Datei) — hier stehen nur die Druckschrift-Aufgaben.
 */
import raw from "./generated/kfa-material.generated.json";

interface LessonMaterial {
  /** Einzelwörter (kurze Aufgaben, für niedrige Anforderungsstufe). */
  words: string[];
  /** Ganze Sätze (längere Aufgaben, für höhere Anforderungsstufe). */
  sentences: string[];
}

const MATERIAL = (raw as { lessons: Record<string, LessonMaterial> }).lessons;

/** key aus Lektions-id: "kfa01" bleibt "kfa01"; Level-id "kurz-kfa01" → "kfa01". */
function normId(lessonId: string): string {
  return lessonId.startsWith("kurz-") ? lessonId.slice(5) : lessonId;
}

/** Übungswörter der Lektion (leer bei Namen/Sonderzeichen-Lektionen). */
export function kfaWords(lessonId: string): string[] {
  return MATERIAL[normId(lessonId)]?.words ?? [];
}

/** Übungssätze der Lektion. */
export function kfaSentences(lessonId: string): string[] {
  return MATERIAL[normId(lessonId)]?.sentences ?? [];
}

/**
 * Kompletter Aufgaben-Vorrat einer Lektion (Wörter + Sätze) für den Runner.
 * Der adaptive Picker (shortBias) bevorzugt kurze Wörter bei niedriger Stufe
 * und schaltet mit steigender Sicherheit die Sätze frei.
 */
export function kfaItems(lessonId: string): string[] {
  const m = MATERIAL[normId(lessonId)];
  if (!m) return [];
  return [...m.words, ...m.sentences];
}

// ─── Übungsmaterial der Striche-Etappen (additiv, 22.09.2026) ───────────────
/**
 * Anders als das KFA-Material oben ist dies KEIN generiertes, sondern
 * hand-ausgewähltes Material - die vier Striche-Etappen kommen NACH allen 48
 * KFA-Lektionen, brauchen also nie den „nur gelernte Kürzungen"-Checker (nach
 * Lektion 48 sind alle Kürzungen ohnehin gelernt). Jedes Wort/jeder Satz wurde
 * vor der Aufnahme händisch gegen liblouis de-g2 geprüft (Belege in der
 * Übergabe) und ist zusätzlich in tests/braille-striche.test.ts gegen das
 * exakt erwartete Punktmuster (angekündigt/unangekündigt) abgesichert. Alle
 * Sätze sind eigenformuliert - KEIN Satz stammt aus der Quelle (Akademie-
 * lehrgang „Striche", s. kurzschrift_content.ts).
 */
const STRICHE_MATERIAL: Record<string, LessonMaterial> = {
  striche01: {
    // Bindestrich ohne Ankündigung - zusammengesetzte Wörter, Ortsnamen, Zahlen.
    words: [
      "U-Boot", "U-Bahn", "Fair-Play", "Öko-Strom", "Bio-Laden",
      "Mini-Marathon", "Gartenbau-Amt", "Wien-Favoriten", "Kaffee-Ersatz",
      "Test-Frage", "10-12", "8-14",
      // Bindestrich NACH einer Abkuerzung - aus Johannes' Liste "Woerter und
      // Ausnahmen" (23.09.2026). Sie stehen hier und nicht bei den Grenzfaellen,
      // weil bei ihnen der Bindestrich der Gegenstand ist, nicht die Kuerzung.
      "ICE-Versuchsstrecke", "USA-Versand",
    ],
    sentences: [
      "Das U-Boot taucht ganz langsam ab.",
      "Im Gartenbau-Amt wachsen viele Pflanzen.",
      "Er trinkt lieber Kaffee-Ersatz als echten Kaffee.",
      "In Wien-Favoriten wohnen viele Kinder.",
      "Die Pause dauert von 10-12 Uhr.",
      "Wir üben von 8-14 Uhr im Sportverein.",
      "Sie kauft Öko-Strom für ihr Haus.",
      "Am Wochenende ist Mini-Marathon in der Stadt.",
      "Das Spiel endet mit Fair-Play.",
      "Er stellt eine Test-Frage an die Klasse.",
      "Die ICE-Versuchsstrecke ist heute gesperrt.",
      "Der USA-Versand dauert zwei Wochen.",
    ],
  },
  striche02: {
    // Ersatzstrich - Wortende (unangekündigt) und Wortanfang (angekündigt).
    // Reine Satz-Lektion (wie KFA-Lektion 47/48): Die Regel braucht immer
    // zwei zusammengehörende Wörter, ein einzelnes Wort zeigt sie nicht.
    words: [],
    sentences: [
      "Der Ein- und Ausgang ist heute gesperrt.",
      "Wir nehmen die Hin- und Rückfahrt mit dem Zug.",
      "Der Sonnenaufgang und -untergang ist im Sommer besonders schön.",
      "Die Groß- und Kleinschreibung übt sie jeden Tag.",
      "Sie mag Vor- und Nachspeise gleichermaßen.",
      "Zwischen Schulanfang und -ende liegen viele Stunden.",
    ],
  },
  striche03: {
    // Gedankenstrich (mitten im Satz) und Streckenstrich (zwischen Orten) -
    // beide brauchen den echten langen Strich (Halbgeviertstrich), sonst
    // bliebe die Ankündigung aus (Beleg: kurzschrift_content.ts, Kopfkommentar).
    words: ["Wien–Berlin", "Hamburg–Köln", "Salzburg–Dornbirn"],
    sentences: [
      "Die Strecke Wien–Berlin dauert vier Stunden.",
      "Der Zug fährt die Strecke Hamburg–Köln entlang.",
      "Wir reisen von Salzburg–Dornbirn mit dem Bus.",
      "Heute – so glaube ich – bleibt es lange hell.",
      "Am Ende – das war klar – gewann die Klasse.",
      "Er kommt – so glaubt sie – morgen wieder.",
    ],
  },
  striche04: {
    // Schrägstrich - ohne Leerzeichen, zwischen Monaten oder Maßeinheiten.
    words: ["Juli/August", "Import/Export", "Oktober/November"],
    sentences: [
      "Wir fahren im Juli/August in den Urlaub.",
      "Der Betrieb lebt vom Import/Export mit anderen Ländern.",
      "Zwischen Oktober/November wird es kalt.",
      "Er fährt 130 km/h auf der Autobahn.",
      "Das Rennrad schafft 45 km/h bergab.",
    ],
  },
};

/** Übungswörter einer Striche-Etappe ("striche01".."striche04" oder "kurz-striche01" …). */
export function stricheWords(lessonId: string): string[] {
  return STRICHE_MATERIAL[normId(lessonId)]?.words ?? [];
}

/** Übungssätze einer Striche-Etappe. */
export function stricheSentences(lessonId: string): string[] {
  return STRICHE_MATERIAL[normId(lessonId)]?.sentences ?? [];
}

/** Kompletter Aufgaben-Vorrat einer Striche-Etappe (Wörter + Sätze). */
export function stricheItems(lessonId: string): string[] {
  const m = STRICHE_MATERIAL[normId(lessonId)];
  if (!m) return [];
  return [...m.words, ...m.sentences];
}

// ─── Übungsmaterial der Grenzfall-Etappen (additiv, 23.09.2026) ─────────────
/**
 * Die Wörter stammen aus Johannes' Liste „Wörter und Ausnahmen" (Freigabe
 * 22.09.2026), die Sätze darum herum sind eigenformuliert - wie überall im
 * Kurzschrift-Material. Jedes Wort und jeder Satz ist gegen liblouis de-g2 am
 * Lektion-48-Checker geprüft (tests/braille-grenzfaelle.test.ts treibt dieselbe
 * Prüfung, die auch das generierte Material absichert).
 *
 * ⚠️ Diese Etappen kommen NACH Lektion 48 - deshalb ist hier jede Kürzung
 * erlaubt und der „nur gelernte Kürzungen"-Checker kann nicht mehr greifen.
 * Was ihn ersetzt: jedes Wort wurde einzeln übersetzt und die Zellzahl
 * festgehalten (siehe Test). Ein Wort, das seine Übersetzung ändert, fällt auf.
 */
const GRENZFALL_MATERIAL: Record<string, LessonMaterial> = {
  grenz01: {
    words: [
      "abringen", "abbringen", "vorbeidrängen", "dazubleiben", "unproduktiv",
      "anprobieren", "unproblematisch", "Ente", "unentgeltlich", "Rente",
      "Enthusiasmus", "Entomologie", "Verena", "Veranda", "Vase", "Verb",
      "hinaus", "aus", "Haus", "Bistum", "Bison", "zuversichtlich", "Sehrest",
      "Nichtsportler", "Spracharten", "Sondernummer", "Emir", "Mirabelle",
    ],
    sentences: [
      "Ein Bison ist kein kleines Tier.",
      "Die Rente kommt jeden Monat.",
      "Verena stellt die Vase auf die Veranda.",
      "Wir gehen hinaus und lassen das Haus offen.",
      "Der Eintritt war unentgeltlich.",
      "Sie will dem Bruder das Buch abringen.",
      "Er kann ihn davon nicht abbringen.",
      "Der Emir kauft eine Mirabelle am Markt.",
    ],
  },
  grenz02: {
    words: [
      "Fragment", "fragil", "Eleganz", "nirgendwo", "Schlange", "schleicht",
      "Mannequin", "Manna", "Knochen", "dennoch", "Brücke", "Sago", "Lasso",
      "Salamander", "geschwollen", "Hexe", "mexikanisch", "Lexikon",
      "ex officio", "Hattrick", "hatte",
    ],
    sentences: [
      "Das Lexikon steht im Regal.",
      "Die Hexe kocht eine mexikanische Suppe.",
      "Der Salamander schleicht über die Brücke.",
      "Die Schlange war nirgendwo zu finden.",
      "Er hatte einen Hattrick geschafft.",
      "Das Glas ist sehr fragil.",
      "Sie wirft das Lasso über den Knochen.",
    ],
  },
  grenz03: {
    words: [
      "Hoheit", "heiter", "hoheitlich", "dezimal", "normal", "einmalig",
      "minimal", "schmal", "Schwung", "Achtung", "Hunger", "Tennis", "Nisse",
      "Anis", "Blumensamen", "Gesamtheit", "Stiefelschaft", "Barschaft",
      "Herrschaft", "Trichter", "bricht", "Kehricht", "töricht", "möglich",
      "Beschwerde",
    ],
    sentences: [
      "Heute ist das Wetter heiter und schön.",
      "Mit Schwung springt sie über den Graben.",
      "Achtung, der Weg ist sehr schmal!",
      "Nach dem Tennis hat er großen Hunger.",
      "Der Trichter bricht leider entzwei.",
      "Es ist möglich, das einmalig zu schaffen.",
      "Anis und Blumensamen liegen auf dem Tisch.",
    ],
  },
  grenz04: {
    words: [
      "Spion", "Union", "Religion", "Diskussion", "Kürbismus", "Optimismus",
      "überall", "All", "alle", "Alltag", "allgemein", "Allegro", "notfalls",
      "möchte", "möcht'", "Paragraph", "Paragraf", "des Notfalls wegen",
    ],
    sentences: [
      "Im All ist es überall still.",
      "Alle Kinder kennen den Alltag in der Schule.",
      "Sie möchte notfalls später kommen.",
      "Der Paragraf steht im neuen Gesetz.",
      "Mit Optimismus gelingt die Diskussion.",
      "Der Spion liest die Zeitung im Park.",
      "Allegro heißt schnell und munter.",
    ],
  },
};

/** Übungswörter einer Grenzfall-Etappe ("grenz01".."grenz04" oder "kurz-grenz01" …). */
export function grenzfallWords(lessonId: string): string[] {
  return GRENZFALL_MATERIAL[normId(lessonId)]?.words ?? [];
}

/** Übungssätze einer Grenzfall-Etappe. */
export function grenzfallSentences(lessonId: string): string[] {
  return GRENZFALL_MATERIAL[normId(lessonId)]?.sentences ?? [];
}

/** Kompletter Aufgaben-Vorrat einer Grenzfall-Etappe (Wörter + Sätze). */
export function grenzfallItems(lessonId: string): string[] {
  const m = GRENZFALL_MATERIAL[normId(lessonId)];
  if (!m) return [];
  return [...m.words, ...m.sentences];
}
