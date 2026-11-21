/**
 * Bereich `seite` - Deutsch (Seite `/programme/klangpunkte`: Kürzel-Liste, Ansagen,
 * Fenster, Hilfe). Bestand 1:1, Byte für Byte (Wächter
 * `tests/klangpunkte-deutsch-unveraendert.test.tsx`).
 *
 * Kürzel-Zeilen sind Paare `[Taste, Beschreibung]`. Ein `null` heißt: die Zeile
 * kommt auf Deutsch aus `GEMEINSAME_KUERZEL` (`lib/shortcuts.ts`); Englisch
 * bringt eigene Texte mit.
 */
import { KLANGPUNKTE_LOGO_BESCHREIBUNG } from "@/components/KlangpunkteLogo";
type Paar = [string, string];
/** Ein Stück Text, eventuell hervorgehoben (`stark` = <strong>, `em` = <em>). */
type Stueck = { t: string; stark?: true; em?: true };

export const seite = {
  // ─── Kürzel-Liste ────────────────────────────────────────────────────────
  kuerzelWelt: ["Alt + 1 … 9", "Klangwelt direkt wählen (1 Ohrenspitzer · 2 Notenwerkstatt · 3 Kreuz & Lage · 4 Ausdruck · 5 Formenbau · 6 Zusammenklang · 7 Theorie-Spielplatz · 8 Instrumentenkunde · 9 Lieder-Bühne)"] as Paar,
  kuerzelNachspiel: ["D F G H J K L", "Nachspiel-Klaviatur (Echo-Spiel, Melodie-Memory, Tonleitern, Spielwiese, Lese-Konzert): die weißen Tasten c d e f g a h; Pfeil rauf/runter wechselt die Oktave"] as Paar,
  kuerzelTakt: ["Enter / ⌫", "Takt-Baumeister: Enter prüft den Takt, Rücktaste löscht die letzte Zelle"] as Paar,
  kuerzelHand: ["Alt + Q", "Hand am Klavier umschalten (Klavier-Kapitel): beide Hände · nur rechte · nur linke - die gewählte Hand groß sehen und einzeln hören"] as Paar,
  kuerzelKapitel: ["Alt + U", "Kapitelwahl öffnen - alle Klangwelten und dein Sterne-Stand"] as Paar,
  kuerzelEingabefeld: null as Paar | null,
  kuerzelNochmal: null as Paar | null,
  /** Wird an den gemeinsamen Text von Alt + W gehängt, wenn `kuerzelNochmal` null ist. */
  kuerzelNochmalZusatz: " - und anspielen",
  /** Taste von „zweimal Umschalt": null = aus `GEMEINSAME_KUERZEL`. */
  kuerzelUmschaltZweimalTaste: null as string | null,
  kuerzelUmschaltZweimalText: "Zweimal kurz hintereinander: die Aufgabe noch einmal ansagen und anspielen - wie Alt + W",
  kuerzelUeberschrift: null as Paar | null,
  kuerzelZeichenHinweis: ["Alt + M", "Hinweis auf die Zeichenliste (die neuen Zeichen des Kapitels)"] as Paar,
  kuerzelStandTaste: null as string | null,
  kuerzelStandText: "Runde ansagen: wie viele Aufgaben du geschafft hast und wie lange die Übung noch geht - Esc springt zurück ins Übungsfeld",
  kuerzelZeichenListe: ["Alt + L", "Zeichenliste: alle Noten-Zeichen öffnen / schließen"] as Paar,
  kuerzelPause: ["Alt + P", "Pause an / aus"] as Paar,
  kuerzelVorlesen: null as Paar | null,
  kuerzelStill: null as Paar | null,
  kuerzelZumFeld: null as Paar | null,
  kuerzelNachrichten: ["Alt + N", "Nachrichten öffnen / schließen (wenn angemeldet)"] as Paar,
  kuerzelFarben: ["Alt + K", "Farben und Kontrast öffnen / schließen"] as Paar,
  kuerzelKonto: ["Alt + J", "Mein Konto öffnen / schließen - angemeldet das Konto-Menü, sonst die Anmeldung"] as Paar,
  kuerzelHilfe: ["Alt + H", "Hilfe öffnen / schließen"] as Paar,
  kuerzelListe: ["Alt + T", "Tastenkürzel-Liste öffnen / schließen"] as Paar,
  kuerzelGroesser: ["Alt + +", "Übungsbereich größer"] as Paar,
  kuerzelKleiner: ["Alt + −", "Übungsbereich kleiner"] as Paar,
  kuerzelNormal: ["Alt + 0", "Normale Größe"] as Paar,
  kuerzelMelden: ["Alt + Umschalt + P", "Fehler melden - mit einem Bild des Fensters"] as Paar,
  kuerzelUmschalt: ["⇧ Umschalt", "Gedrückt halten: zeigt und sagt die Tasten der aktuellen Zelle"] as Paar,
  kuerzelLehrkraft: ["Alt + S", "Meine Klassen (für Lehrkräfte)"] as Paar,
  kuerzelFussnote: "Alt + Taste - auf dem Mac: Wahltaste (⌥) + Taste.",

  // ─── Ansagen (sichtbar und gesprochen) ───────────────────────────────────
  vorlesenStatusAn: "Vorlesen ist jetzt an.",
  vorlesenStatusAus: "Vorlesen ist jetzt aus.",
  vorlesenAn: "Vorlesen an.",
  vorlesenAus: "Vorlesen aus.",

  // ─── Beschriftungen und Fenster ──────────────────────────────────────────
  meineKlassen: "Meine Klassen",
  meineKlassenTitel: "Meine Klassen (Alt + S) - Klassen, Kinder und der Stand in allen Lernprogrammen",
  passwortTitel: "Passwort ändern",
  hilfeTitel: "Klangpunkte — Hilfe",
  kuerzelTitel: "Tastenkürzel",
  spielstandLaedt: "Spielstand wird geladen …",

  // ─── Hilfe ───────────────────────────────────────────────────────────────
  hilfeWasIstTitel: "Was ist Klangpunkte?",
  hilfeWasIst: [
    { t: "Klangpunkte bringt dir die " },
    { t: "Braille-Notenschrift", stark: true },
    { t: " und die Grundlagen der " },
    { t: "Musiktheorie", stark: true },
    { t: " — mit echten Tönen (Klavier, Gitarre, Saxophon oder Querflöte wählbar), einer Notenzeile fürs sehende Umfeld und auf Wunsch mit do-re-mi-Namen (Solmisation). Jede richtige Note klingt." },
  ] as Stueck[],
  hilfeNotenTitel: "Die Noten kennst du schon",
  hilfeNoten: "Die Töne c d e f g a h sind die Braille-Buchstaben d e f g h i j — das Alphabet, einen Schritt weitergerückt. Die Notenwerte entstehen mit den Punkten 3 und 6: ohne Zusatz eine Achtel, mit Punkt 6 eine Viertel, mit Punkt 3 eine Halbe, mit beiden eine Ganze — derselbe Trick, mit dem aus a bis j die Reihen k bis t und u bis z werden.",
  zeichenTitel: "Diese Zeichen stehen im Text",
  zeichenPunkt: "trennt zwei Tasten oder zwei Angaben, die zusammengehören - „f d s · j k l“.",
  zeichenRuecktaste: "die Rücktaste - sie löscht die letzte Zelle.",
  zeichenEnter: "die Enter-Taste.",
  zeichenPfeil: "dann, oder: das wird daraus.",
  hilfeSterneTitel: "Klangwelten, Kapitel und Sterne",
  /** `alt` = „Alt + U" (am Mac schon in „Wahl + U" umgeschrieben). */
  hilfeSterne: (alt: string): Stueck[] => [
    { t: "Die Kapitel sind in " },
    { t: "Klangwelten", stark: true },
    { t: " gebündelt (Ohrenspitzer · Notenwerkstatt · Kreuz & Lage · Ausdruck · Formenbau · Zusammenklang · Theorie-Spielplatz · Instrumentenkunde · Lieder-Bühne) und " },
    { t: "immer frei wählbar", stark: true },
    { t: " — die Reihenfolge ist eine Empfehlung, kein Zwang. Ein Kapitel gilt als " },
    { t: "gemeistert", stark: true },
    { t: ", wenn du in den letzten Aufgaben sicher bist (mindestens 12 Aufgaben, 90 Prozent richtig). Beim Meistern bekommst du " },
    { t: "1 bis 3 Sterne", stark: true },
    { t: `: 3 ab 97 Prozent, 2 ab 92 Prozent, sonst 1 — gespeichert wird immer dein Bestwert, Sterne können nur wachsen. Die Kapitelwahl (${alt}) zeigt alle Welten mit deinem Sterne-Stand.` },
  ],
  hilfeRangTitel: "Rang und XP",
  hilfeRang: "Für jede richtige Antwort oder Zelle gibt es 2 XP, für jedes gemeisterte Kapitel 30 XP. Der Rang wächst mit den XP (alle 100 ein Rang mehr) und sinkt nie.",
  hilfeUmzugTitel: "Aus Punktgenau umgezogen",
  hilfeUmzugVor: "Klangpunkte war bis Juli 2026 ein Bereich der Brailleschrift-App ",
  hilfeUmzugLink: "Punktgenau",
  hilfeUmzugNach: " und ist jetzt ein eigenes Programm. Deine dort verdienten Sterne und Stände wurden beim ersten Öffnen automatisch übernommen — nichts ist verloren. Die Brailleschrift selbst (Buchstaben, Kurzschrift und mehr) übst du weiterhin in Punktgenau.",
  hilfeNeunTitel: "Alle neun Klangwelten",
  hilfeNeunVor: "Klangpunkte ist jetzt vollständig: neun Klangwelten von den ersten Hörübungen bis zur Instrumentenkunde. Zusammenklang (Intervalle, Akkorde, zwei Stimmen), der Theorie-Spielplatz (Tonleitern, Quintenzirkel, Diktate, Takt-Baumeister, Spielwiese und Komponier-Werkstatt), die Instrumentenkunde (Fingersatz, Klavier, Gesang, Gitarre, Generalbass, Partitur) und die Lieder-Bühne mit dem Lese-Konzert — lesen, merken, aus dem Gedächtnis spielen. Für das Üben gibt es jetzt auch ",
  hilfeNeunStark: "Abzeichen",
  hilfeNeunNach: ": Sterne, gemeisterte Welten, saubere Diktate, gebaute Takte und durchgespielte Lieder.",
  hilfeKontoTitel: "Konto und Spielstand",
  hilfeKonto: "Ohne Anmeldung bleibt der Fortschritt auf diesem Gerät gespeichert. Mit einem Lernwerkstatt-Konto (dasselbe wie in Punktgenau und Plus) wird der Spielstand auf dem Server gesichert.",
  hilfeQuellenTitel: "Quellen",
  hilfeQuellen: [
    { t: "New International Manual of Braille Music Notation", em: true },
    { t: " (Braille Music Subcommittee der Weltblindenunion, zusammengestellt von Bettye Krolick, 1996; deutsch: " },
    { t: "Neues internationales Handbuch der Braillenotenschrift", em: true },
    { t: ", Braille Press Zürich 1998, frei auf braille.ch/musik) — der weltweite Standard · BANA: " },
    { t: "Music Braille Code 2015", em: true },
    { t: " (deckungsgleich) · Lernreihenfolge nach De Garmo (" },
    { t: "Introduction to Braille Music Transcription", em: true },
    { t: ", Library of Congress), Krolick (" },
    { t: "How to Read Braille Music", em: true },
    { t: "), Taesch (" },
    { t: "An Introduction to Music for the Blind Student", em: true },
    { t: ", „Klang vor Zeichen“) und dem RNIB Braille Music Course („read–memorise–play“) · Deutschsprachig: Huwyler (" },
    { t: "Musik-Punkte", em: true },
    { t: ", SBS Zürich) und Schmid (" },
    { t: "Blindennotenschrift für Anfänger", em: true },
    { t: ", BBI Wien) · Der Noten-als-Buchstaben-Ansatz folgt dem Workshop " },
    { t: "Braille-Musiknotation und MuseScore 4", em: true },
    { t: " (E. Schmid / B. Hofer, BBI Wien) · Gegenprobe der Punktmuster: music21 (BSD). Melodien: ausschließlich gemeinfreie Lieder, eigene Transkriptionen. Alle Aufgaben- und Merktexte sind selbst formuliert — kein Lehrbuch-Text kopiert." },
  ] as Stueck[],
  hilfeKuerzelTitel: "Tastenkombinationen",
  /** `alt` = „Alt + V" (am Mac umgeschrieben). */
  hilfeScreenreader: (alt: string) =>
    `Hast du schon einen Screenreader (NVDA/VoiceOver)? Dann lass Vorlesen (${alt}) aus - der Screenreader liest bereits alle Ansagen über die ARIA-Regionen.`,
  /** Bildbeschreibung des Logos (Bestand: `KLANGPUNKTE_LOGO_BESCHREIBUNG`). */
  logoBeschreibung: KLANGPUNKTE_LOGO_BESCHREIBUNG,
};
