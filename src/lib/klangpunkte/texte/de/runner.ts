/**
 * Bereich `runner` - Deutsch. Bestand 1:1 aus `KlangpunkteRunner.tsx`, `NotenZeile.tsx`
 * und `KlangpunkteTouchEingabe.tsx` (Stand 06.11.2026, Byte für Byte; der Wächter
 * `tests/klangpunkte-deutsch-unveraendert.test.tsx` misst es).
 * Aufgabentexte (`prompt`, `explain`) stehen in den Aufgaben-Bereichen, nicht hier.
 */
export const runner = {
  /** Kopfzeile der Übungsfläche: Anhören, Instrument, Namen, Rhythmussprache, Lied. */
  kopf: {
    anhoeren: "Anhören",
    stopp: "Stopp",
    anhoerenTitel: "Aufgabe anhören (Alt + W sagt sie zusätzlich an)",
    instrument: "Instrument",
    namenKnopf: "do-re-mi",
    /** a = „do, re, mi", b = „c, d, e" (je Sprache aus den Tonnamen). */
    namenTitel: (a: string, b: string): string => `Notennamen als ${a} (feste Solmisation) statt ${b}`,
    rhythmusKnopf: "ta ti-ti",
    rhythmusTitel: "Rhythmussprache: zusätzlich ta, ti-ti hinter den Notenwerten ansagen",
    anderesLied: "Anderes Lied",
    /** Ansagen beim Umschalten (a, b, c = die ersten drei Tonnamen der jeweiligen Schreibweise). */
    namenAn: (a: string, b: string, c: string): string => `Notennamen: ${a}, ${b}, ${c}.`,
    rhythmusAn: "Rhythmussprache an: ta, ti-ti.",
    rhythmusAus: "Rhythmussprache aus.",
    zurueckLiedauswahl: "Zurück zur Liedauswahl.",
  },

  /** Ansagen rund um die Aufgabe und das Vorspielen. */
  aufgabe: {
    liesBrailleZeile: "Lies die Braille-Zeile.",
    handNurKlavier: "Der Hand-Wechsel gilt nur im Klavier-Kapitel mit zwei Zeilen.",
    weiter: (prompt: string): string => `Weiter geht’s. ${prompt}`,
    zeichenlisteHinweis: "Alle Noten-Zeichen dieser Etappe findest du in der Zeichenliste: Alt und L.",
    songGanzGeschafft: (titel: string): string => `${titel} — ganz geschafft!`,
    songZeile: (zeile: number, von: number): string => ` · Zeile ${zeile} von ${von}`,
  },

  /** Ergebnis-Karte „Geschafft", Sterne und Fortschritt. */
  geschafft: {
    geschafft: "Geschafft!",
    mitSternen: (n: number): string => `Geschafft! ${n} von 3 Sternen.`,
    alsNaechstesAnsage: (titel: string): string => ` Als Nächstes: ${titel}.`,
    alsNaechstesKarte: (titel: string): string => `Als Nächstes: ${titel}`,
    weiterUeben: "Weiter üben",
    weiter: "Weiter",
  },
  fortschritt: {
    caption: "Übung",
    aria: (n: number, min: number, prozent: number): string =>
      `Etappen-Fortschritt: ${n} von mindestens ${min} Aufgaben, ${prozent} Prozent geschafft.`,
    rundeGeschafft: "Runde geschafft — die Etappe sitzt.",
    runde: (n: number, min: number, noch: number): string =>
      `Runde: ${n} von mindestens ${min} Aufgaben geschafft` +
      (noch > 0 ? `, noch mindestens ${noch}.` : ", gleich sitzt die Etappe."),
  },

  /** Liedauswahl (Lieder-Werkstatt). */
  lieder: {
    kinder: "🧒 Kinderlieder",
    erwachsene: "🎼 Klassik & Evergreens",
  },

  /** Hand-Fokus (Alt + Q) in der zweizeiligen Klavier-Ansicht. */
  hand: {
    /** Der Satz unter der Notenzeile, hinter der Tastenbeschriftung. */
    hinweis: (f: "both" | "rh" | "lh"): string =>
      " - eine Hand allein groß sehen & hören (" +
      (f === "rh"
        ? "gerade: nur die rechte Hand"
        : f === "lh"
          ? "gerade: nur die linke Hand"
          : "gerade: beide Hände") +
      ")",
  },

  /** Antwort-Aufgaben (choice). */
  wahl: {
    richtig: "Richtig!",
    richtigWaere: (antwort: string): string => `Richtig wäre: ${antwort}.`,
    antworten: "Antworten (auch Zifferntasten 1 bis 4)",
  },

  /** Klopf-Aufgaben (tap). */
  tap: {
    aria: (n: number): string => `Rhythmus klopfen: Leertaste. Bisher ${n} Schläge.`,
    vor: "Klopf hier mit der ",
    stark: "Leertaste",
    nach: (n: number, von: number): string => ` — ${n} von ${von} Schlägen`,
    knopf: (n: number, von: number): string => `Klopfen (${n} von ${von})`,
    puls: "Noch nicht ganz gleichmäßig — spür den Grundschlag und halt ihn ruhig.",
    kurz: "kurz",
    lang: "lang",
    fast: (muster: string): string => `Fast! Das Muster war: ${muster}. Hör noch einmal hin.`,
    genauImPuls: "Genau im Puls!",
    genauImTakt: "Genau im Takt!",
  },

  /** Nachspiel-Klaviatur (play) mit Lese-Konzert, Memory und Spielwiese. */
  spielen: {
    /** `namen` = „c d e f g a h" (je Sprache). */
    ariaKlaviatur: (namen: string): string =>
      `Nachspiel-Klaviatur: D F G H J K L sind ${namen}. Pfeil rauf und runter wechselt die Oktave. `,
    ariaFrei: (n: number, von: number): string => `Spiel frei über dem Bordun — ${n} von ${von} Tönen. `,
    ariaMemory: (laenge: number): string => `Aktuelle Länge ${laenge} Töne. `,
    ariaTon: (i: number, von: number): string => `Ton ${i} von ${von}. `,
    ariaLesen:
      "Lese-Konzert: Lies die Braille-Zeile. Drück Enter oder „Fertig gelesen“, wenn du sie im Kopf hast.",
    lesenVor: "Lies die Zeile in Braille — sie wird ",
    lesenStark: "nicht",
    lesenMitte: " vorgespielt. Wenn du sie im Kopf hast, ",
    lesenNach: " oder „Fertig gelesen\".",
    fertigGelesen: "Fertig gelesen",
    nachLesen: "Jetzt aus dem Gedächtnis nachspielen — D F G H J K L, Pfeil wechselt die Oktave.",
    freiVor: "Spiel frei mit ",
    freiNach: (n: number, von: number): string => ` (Pentatonik) — ${n} von ${von} Tönen · über dem Quint-Bordun`,
    nachspielenVor: "Spiel nach mit ",
    nachspielenMitte: " — ",
    laenge: (n: number): string => `Länge ${n}`,
    tonVon: (i: number, von: number): string => `Ton ${i} von ${von}`,
    oktaveNach: (oktave: string): string => ` Oktave (${oktave})`,
    oktaveRauf: "Oktave rauf",
    oktaveRunter: "Oktave runter",
    freiGeschafft: (n: number): string =>
      `Schön gespielt — ${n} Töne! Die Werkstatt ist besucht. Über „Weiter üben“ spielst du einfach weiter.`,
    falscherTon: (gespielt: string, gesucht: string): string => `Das war ${gespielt} — gesucht ist ${gesucht}.`,
    nichtsMehr: "nichts mehr",
    memoryWeiter: (n: number): string => `Geschafft — ${n} Töne! Jetzt kommt einer dazu.`,
    memoryEnde: (best: number): string =>
      `Lauf zu Ende — du hast ${best} ${best === 1 ? "Ton" : "Töne"} am Stück geschafft. Ich spiele die Folge noch einmal auf.`,
    genauRichtig: "Genau richtig!",
    fertig: "Fertig.",
  },

  /** Schreib-Aufgaben (write) und Diktat. */
  schreiben: {
    aria: (zelle: number, von: number): string =>
      `Braille-Eingabe: f d s und j k l sind die Punkte, Leertaste der Taktstrich. Zelle ${zelle} von ${von}. Umschalt gedrückt halten zeigt und sagt die Tasten der Zelle.`,
    nochmalAnhoeren: "Nochmal anhören",
    diktat: "Hör so oft du willst — es zählt nicht als Fehler. Schreib dann Zelle für Zelle, was du gehört hast.",
    vor: "Schreib mit ",
    mitte: (zelle: number, von: number): string => ` — Zelle ${zelle} von ${von} · `,
    umschalt: "⇧ Umschalt",
    nach: " zeigt die Zelle",
    taktstrichTitel: "Taktstrich (Leertaste)",
    gedrueckt: (punkte: string): string => `Gedrückt: Punkte ${punkte}`,
    aktuelleStelleLeertaste: "Aktuelle Stelle: die Leertaste — der Taktstrich.",
    genauRichtig: "Genau richtig!",
    fertig: "Fertig.",
  },

  /** Takt-Baumeister (build). */
  takt: {
    aria: (n: number): string =>
      `Takt-Baumeister: Schreib mit f d s j k l Noten oder Pausen; jede klingt sofort. Rücktaste löscht die letzte Zelle, Enter prüft den Takt. Bisher ${n} Zellen.`,
    vor: "Bau den Takt mit ",
    mitte: " — jede Note/Pause klingt. ",
    loescht: " löscht, ",
    pruefen: (a: number, b: number): string => ` prüft. Taktart ${a}/${b}.`,
    nochLeer: "Noch leer — leg los.",
    taktPruefen: "Takt prüfen (Enter)",
    loeschen: "Löschen (⌫)",
    pause: "Pause",
    /** Nominativ der Zähl-Einheit („2 Schläge"); die Einheit kommt im Dativ („Schlägen"). */
    nominativ: (dativ: string): string => dativ.replace("Schlägen", "Schläge"),
    /** Eine Pause aus dem Notenwort bilden („Viertelnote" -> „Viertelpause"). */
    pauseAus: (notenwort: string, _pausenwort: string): string => notenwort.replace("note", "pause"),
    keineZelle: "Das ist keine Noten- oder Pausenzelle. Nimm eine Note (f d s j k l) oder eine Pause.",
    alsGelesen: (wert: string): string => ` — als ${wert} gelesen, weil das noch passt`,
    zusammen: (label: string, ambi: string, summe: string, ganz: string, einheit: string): string =>
      `${label}${ambi}. Zusammen ${summe} von ${ganz} ${einheit}.`,
    letzteGeloescht: (anzahl: string, einheit: string): string => `Letzte Zelle gelöscht. Jetzt: ${anzahl} ${einheit}.`,
    fehlen: (einzahl: boolean, anzahl: string, einheit: string): string =>
      `Da ${einzahl ? "fehlt" : "fehlen"} noch ${anzahl} ${einheit} bis zum vollen Takt.`,
    zuViel: (einzahl: boolean, anzahl: string, einheit: string): string =>
      `Das ${einzahl ? "ist" : "sind"} ${anzahl} ${einheit} zu viel. Nimm etwas weg.`,
    mindestensNoten: (n: number): string => `Der Takt ist voll, aber es sollen mindestens ${n} Noten sein.`,
    mindestensPause: "Der Takt ist voll — aber es soll mindestens eine Pause dabei sein.",
    voll: "Voller Takt! Hör ihn dir an.",
    vollSauber: "Genau voll — ein sauberer Takt! Hör ihn dir an.",
  },

  /** Komponier-Werkstatt (sandbox). */
  werkstatt: {
    aria: (zellen: number, werke: number): string =>
      `Komponier-Werkstatt: Schreib frei mit f d s j k l, Leertaste ist der Taktstrich. Anhören, Löschen und Speichern über die Knöpfe. Bisher ${zellen} Zellen, ${werke} von 5 Werken gespeichert.`,
    vor: "Schreib frei mit ",
    mitte: " — Leertaste = Taktstrich, ",
    nach: " löscht die letzte Zelle.",
    leeresBlatt: "Leeres Blatt — komponier drauflos.",
    anhoeren: "Anhören",
    loeschen: "Löschen",
    nameFuerWerk: "Name für dein Werk",
    speichern: "Speichern",
    nochNichtsGeschrieben: "Noch nichts geschrieben — schreib zuerst ein paar Noten.",
    geleert: "Werkstatt geleert.",
    schonFuenf: "Du hast schon fünf Werke gespeichert. Lösche eines, dann geht es wieder.",
    nochNichtsSpeichern: "Noch nichts zu speichern.",
    meinWerk: (n: number): string => `Mein Werk ${n}`,
    gespeichert: (name: string, n: number): string => `„${name}" gespeichert. Du hast jetzt ${n} von 5 Werken.`,
    gespeicherteListe: (namen: string, n: number): string => `Gespeichert: ${namen} (${n} von 5)`,
  },

  /** Beschriftungen der Notenzeile (`NotenZeile.tsx`). */
  notenzeile: {
    handFokus: {
      rh: "Nur die rechte Hand (oben, Violinschlüssel)",
      lh: "Nur die linke Hand (unten, Bassschlüssel)",
      both: "Beide Hände",
    },
    rechteHand: "Rechte Hand · Violinschlüssel",
    linkeHand: "Linke Hand · Bassschlüssel",
  },

  /** Eingabe per Berührung (`KlangpunkteTouchEingabe.tsx`). */
  touch: {
    gruppe: "Eingabe per Berührung",
    anleitungVor: "Tippe die Punkte der Zelle an, dann ",
    zelleSetzen: "Zelle setzen",
    anleitungNach: ".",
    punkteGruppe: "Die sechs Punkte einer Zelle",
    punkt: (p: number): string => `Punkt ${p}`,
    taktstrich: "Taktstrich",
    pause: "Pause",
    letzteLoeschen: "Letzte Zelle löschen",
    taktPruefen: "Takt prüfen",
    bsiTitel: "Braille-Bildschirmeingabe von VoiceOver",
    bsiHinweis:
      "Stell den Rotor auf Braille-Bildschirmeingabe und tippe die Zellen in dieses Feld. Wischen nach rechts mit einem Finger ist der Taktstrich, nach links löscht die letzte Zelle.",
    testen: "Brailleeingabe testen - was kommt an?",
    nochNichts: "Noch nichts eingegeben.",
    verlauf: (text: string, codepoints: string, ergebnis: string): string => `„${text}" (${codepoints}) → ${ergebnis}`,
    keineZelleErkannt: "keine Zelle erkannt",
    nochKeinPunkt: "Noch kein Punkt gewählt. Tippe erst auf die Punkte, dann auf Zelle setzen.",
    unbekannt: (zeichen: string): string =>
      `Das Zeichen ${zeichen} kann ich nicht als Punkte lesen. Nimm die Punkt-Knöpfe.`,
  },
};
