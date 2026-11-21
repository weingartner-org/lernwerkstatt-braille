/**
 * Bereich `aufgabenC` - Deutsch: Aufgabentexte der Welten 7 (Theorie-Spielplatz),
 * 8 (Instrumentenkunde) und 9 (Lieder-Bühne) aus `etappen.ts`.
 * Wörtlich der Bestand (Stand 06.11.2026); der Wächter
 * `tests/klangpunkte-deutsch-unveraendert.test.tsx` misst jedes Zeichen.
 * Reihenfolge der Auswahllisten = Reihenfolge im Code (fester Zufall).
 */
export const aufgabenC = {
  /** Beschriftungen einzelner Braille-Zellen beim Schreiben (auch Lieder-Zeilen). */
  zellen: {
    oktavzeichenDer: (oktave: string): string => `das Oktavzeichen der ${oktave}`,
    oktavzeichen: "das Oktavzeichen",
    vorzeichen: "das Vorzeichen",
    verlaengerungspunkt: "der Verlängerungspunkt — Punkt 3",
    taktstrich: "Taktstrich — die Leertaste",
  },

  // --- Welt 7 „Theorie-Spielplatz" -----------------------------------------
  tonleitern: {
    spielNach:
      "Spiel die C-Dur-Tonleiter aufwärts nach: c d e f g a h c — auf der Klaviatur D F G H J K L, dann Oktave rauf und noch einmal D.",
    spielNachErkl: "Acht Stufen von c bis zum nächsten c.",
    durMollFrage: "Hör die Tonleiter — Dur (hell) oder Moll (dunkel)?",
    durMollWahl: ["Dur", "Moll"],
    durMollErklMoll: "Die dritte Stufe ist erniedrigt — natürliches Moll.",
    durMollErklDur: "Reine Dur-Tonleiter.",
    fehlerFrage: "In dieser Dur-Tonleiter ist EIN Ton verrutscht. Welche Stufe war falsch?",
    fehlerWahl: ["Stufe 3", "Stufe 4", "Stufe 5", "Stufe 6", "Stufe 7"],
    fehlerErkl: (stufe: number): string => `Die ${stufe}. Stufe klang zu hoch.`,
    schreibe:
      "Schreib die G-Dur-Tonleiter: g a h c d e — und dann fis, also ein Kreuz vor dem f (das ist das eine Vorzeichen von G-Dur).",
    schreibeErkl: "G-Dur hat ein Kreuz: das f wird zu fis.",
  },

  quintenzirkel: {
    /** Vorzeichen-Wort je Art: Einzahl / Mehrzahl. */
    vz: {
      kreuz: { ein: "Kreuz", mehr: "Kreuze" },
      be: { ein: "Be", mehr: "Bes" },
    },
    anzahlFrage: (name: string, mehr: string): string => `Station: ${name}. Wie viele ${mehr} hat diese Tonart?`,
    anzahlErkl: (name: string, n: number, wort: string): string => `${name} hat ${n} ${wort}.`,
    nameFrage: (n: number, wort: string): string => `${n} ${wort} — welche Dur-Tonart ist das?`,
    nameErkl: (n: number, wort: string, name: string): string => `${n} ${wort}: das ist ${name}.`,
    lesenFrage: "Lies die Vorzeichnung in Braille — welche Tonart?",
    lesenErkl: (name: string): string => `Diese Vorzeichnung gehört zu ${name}.`,
  },

  rhythmusdiktat: {
    blattFrage: "Lies den Rhythmus in der Notenzeile und klopf ihn mit der Leertaste — vom Blatt.",
    diktatFrage: (rhythm: boolean): string =>
      `Rhythmus-Diktat: Ich klopfe einen Takt auf dem Ton g. Schreib die Werte, die du hörst${rhythm ? " (Rhythmussprache ist an)" : ""}. Startton ist g. Anhören so oft du willst.`,
    diktatErkl: "Zähl die Schläge je Ton: Viertel = ein Schlag, Halbe = zwei.",
  },

  melodiediktat: {
    frage: (startton: string, anzahl: number): string =>
      `Melodie-Diktat: Der Startton ist ${startton}. Hör die ${anzahl} Töne und schreib sie — sie gehen in kleinen Schritten. Anhören so oft du magst.`,
    erkl: "Vergleich Ton für Ton mit dem Startton: geht es aufwärts oder abwärts?",
  },

  detektiv: {
    frage: "Lies die Braille-Zeile und hör die Aufnahme. An welcher Stelle weicht der Klang von den Noten ab?",
    note: (n: number): string => `Note ${n}`,
    allesRichtig: "Alles richtig",
    erklRichtig: "Alles stimmte — Klang und Noten waren gleich.",
    erklAnders: (n: number): string => `Note ${n} klang anders als geschrieben.`,
  },

  baumeister: {
    dreiViertel: "Bau einen vollen 3/4-Takt: schreib Noten und Pausen mit f d s j k l, bis die Schläge genau 3 ergeben. Enter prüft.",
    mitPause: "Bau einen 4/4-Takt mit mindestens EINER Pause. Enter prüft.",
    mitNoten: "Bau einen 4/4-Takt mit mindestens DREI Noten. Enter prüft.",
    sechsAchtel: "Kür: bau einen vollen 6/8-Takt (sechs Achtel-Schläge). Enter prüft.",
  },

  spielwiese: {
    frage:
      "Klang-Spielwiese: Über dem leisen Bordun kannst du frei spielen — mit D F G J K (Pentatonik). Kein Ton kann falsch sein. Erzähl eine kleine Geschichte: erst leise, dann laut. Ab 30 Tönen ist die Werkstatt besucht.",
  },

  kadenzen: {
    schlussFrage: "Zwei Akkorde als Schluss — klingt das fertig oder geht es noch weiter?",
    schlussWahl: ["Fertig — ein richtiger Schluss", "Offen — es geht noch weiter"],
    schlussErklOffen: "Auf der Dominante (V) bleibt es offen — Halbschluss.",
    schlussErklZu: "Von der Dominante zurück zum Grundakkord — das klingt fertig (Ganzschluss).",
    artFrage: "Welche Schlusswendung ist das?",
    artWahl: ["Authentisch — von der Dominante (V) zum Grundakkord", "Plagal — der „Amen“-Schluss von der Subdominante (IV)"],
    artErklPlagal: "IV zu I — der weiche „Amen“-Schluss (plagal).",
    artErklAuth: "V zu I — der starke, authentische Schluss.",
    funktionFrage: "Welche Funktion hat dieser Akkord in C-Dur?",
    funktionWahl: ["Tonika (Stufe I)", "Subdominante (Stufe IV)", "Dominante (Stufe V)"],
    funktionErkl: [
      "Tonika (T) — der Grundakkord auf Stufe I.",
      "Subdominante (S) — Stufe IV.",
      "Dominante (D) — Stufe V.",
    ],
  },

  komponier: {
    frage:
      "Komponier-Werkstatt: Schreib frei mit f d s j k l, hör dir dein Werk an und speichere es (bis zu 5). Die Werkstatt ist besucht, sobald du ein Werk gespeichert hast.",
  },

  // --- Welt 8 „Instrumentenkunde" ------------------------------------------
  fingersatz: {
    lesenFrage: "Lies Note und Fingersatz: Welcher Finger soll die Note spielen? (Der Fingersatz steht NACH der Note.)",
    lesenErkl: (finger: string): string => `Die kleine Ziffer nach der Note ist der ${finger}.`,
    schreibenFrage: (ton: string, finger: string): string =>
      `Schreib die Note ${ton} und häng den Fingersatz für den ${finger} an — er steht NACH der Note.`,
    fingerZelle: (finger: string): string => `${finger} — der Fingersatz`,
    schreibenErkl: (finger: string): string => `Der ${finger} bekommt seine Ziffer direkt hinter die Note.`,
    positionFrage: "Wo steht der Fingersatz — vor oder nach der Note?",
    positionWahl: ["Nach der Note", "Vor der Note"],
    positionErkl: "Anders als die Artikulation steht der Fingersatz NACH der Note (vor einem eventuellen Haltebogen).",
  },

  klavier: {
    /** Am Mac „Wahl + Q": der Code reicht den Text durch `altAnzeige`. */
    zweiFrage:
      "Zwei Zeilen - oben die rechte Hand (Violinschlüssel), unten die linke Hand (Bassschlüssel). Wie viele Töne spielt die LINKE Hand? Mit Alt + Q kannst du eine Hand allein groß sehen und hören.",
    zweiWahl: (n: number): string => `${n} Töne`,
    zweiErkl: "Zähl die Notenköpfe in der unteren Zeile - oder hör die tiefe Hand allein (Alt + Q).",
    handFrage: "Diese Zeile beginnt mit einem Hand-Zeichen. Für welche Hand ist sie?",
    handWahl: ["Rechte Hand", "Linke Hand"],
    handErklLinks: "Punkte 4, 5, 6 und dann 3, 4, 5: das Zeichen der linken Hand.",
    handErklRechts: "Punkte 4, 6 und dann 3, 4, 5: das Zeichen der rechten Hand.",
    melodieFrage:
      "Zwei Hände nacheinander: eine spielt die Melodie (höher, beweglich), die andere begleitet tief. Welche kam als Melodie?",
    melodieWahl: ["Die zuerst gespielte Stimme", "Die zweite Stimme"],
    melodieErkl: "Die Melodie ist die höhere, bewegliche Stimme — meist die rechte Hand.",
    rechteHandFrage: (ton: string): string =>
      `Schreib das Zeichen der rechten Hand (Punkte 4, 6 · 3, 4, 5) und danach die Note ${ton} mit Oktavzeichen.`,
    rechteHandZellen: ["rechte Hand, erste Zelle — Punkte 4, 6", "rechte Hand, zweite Zelle — Punkte 3, 4, 5"],
    rechteHandErkl: "Nach dem Hand-Zeichen beginnt die Stimme mit einem Oktavzeichen.",
    pedalFrage: "Welches Pedal-Zeichen ist das — und steht es vor oder nach der Note?",
    pedalWahl: ["Pedal nieder — VOR der Note", "Pedal auf — NACH der Note"],
    pedalErklNieder: "Pedal nieder (Punkte 1, 2, 6 · 1, 4) steht vor der Note, ab der getreten wird.",
    pedalErklAuf: "Pedal auf (Punkte 1, 6 · 1, 4) steht nach der Note, mit der losgelassen wird.",
  },

  gesang: {
    melismaFrage: "Auf der Silbe „la“ — wie viele Töne singt die Stimme? (Mehrere Töne auf einer Silbe heißen Melisma.)",
    melismaWahl: ["Einen Ton", "Zwei Töne", "Drei Töne"],
    melismaErkl: (n: number): string =>
      `Die Silbe bekommt ${n} Töne — ein Melisma. In Braille verbindet sie der Silben-Bindebogen (Punkte 1, 4).`,
    bogenFrage:
      "Eine Silbe auf zwei Tönen: schreib die erste Note, den Silben-Bindebogen (Punkte 1, 4) und die zweite Note.",
    bogenZelle: "Silben-Bindebogen — Punkte 1, 4",
    bogenErkl: "Der Silben-Bindebogen sagt: beide Töne gehören zu einer Silbe.",
    atemFrage: "In dieser Zeile steht ein Atemzeichen. Nach welchem Ton wird geatmet?",
    atemWahl: ["Nach dem ersten Ton", "Nach dem zweiten Ton", "Nach dem dritten Ton"],
    atemErkl: "Das halbe Atemzeichen (Punkte 3, 4, 5 · 2) steht gleich nach dem ersten Ton.",
    zeilenFrage: "Im Gesang wechseln sich Textzeilen und Musikzeilen ab. Welches Präfix kündigt eine TEXTzeile an?",
    zeilenWahl: ["Text-Präfix (Punkte 5, 6 · 2, 3)", "Musik-Präfix (Punkt 6 · 3)"],
    zeilenErkl: "Die Textzeile trägt das Präfix Punkte 5, 6 · 2, 3; die Musikzeile Punkt 6 · Punkt 3.",
  },

  gitarre: {
    saiteFrage:
      "Das Saitenzeichen (Punkte 1, 4, 6) und eine Ziffer sagen, auf welcher Saite gespielt wird. Welche Saite ist das?",
    saiteWahl: (s: number): string => `${s}. Saite`,
    saiteErkl: (s: number): string => `Saitenzeichen plus Ziffer ${s}: die ${s}. Saite.`,
    schreibenFrage: (saite: number, ton: string): string =>
      `Schreib die Angabe für die ${saite}. Saite und dann die Note ${ton}: erst das Saitenzeichen (Punkte 1, 4, 6), dann die Ziffer, dann die Note.`,
    saitenzeichenZelle: "Saitenzeichen — Punkte 1, 4, 6",
    ziffernZelle: (saite: number): string => `die Ziffer ${saite} — die ${saite}. Saite`,
    schreibenErkl: "Das Saitenzeichen steht vor der Note; danach folgt KEIN Oktavzeichen.",
    akkordSorten: { dur: "Dur-Dreiklang", moll: "Moll-Dreiklang", sept: "Dominantseptakkord (kursive 7)" },
    akkordFrage:
      "Hör den gebrochenen Akkord — welche Sorte ist das? (Kreis, Dreieck und die kursive 7 sind international; die Buchstaben-Symbole wie „C7“ schreibt jedes Land etwas anders.)",
    akkordErkl: (sorte: string): string => `Das war ein ${sorte}.`,
  },

  generalbass: {
    aussetzungFrage:
      "Die Bassnote ist mit einer 6 beziffert. Welche Aussetzung klingt richtig — mit Sexte oder mit Quinte über dem Bass?",
    aussetzungWahl: ["Terz und Sexte über dem Bass", "Terz und Quinte über dem Bass"],
    aussetzungErklSext: "Eine 6 verlangt die Sexte über dem Bass — der Sextakkord.",
    aussetzungErklQuint: "Ohne Bezifferung (oder 5/3) klingt der Grundakkord mit der Quinte.",
    stufeFrage: "Der Generalbass denkt in Stufen. Welche Hauptstufe hörst du hier?",
    stufeWahl: ["Tonika (Stufe I)", "Subdominante (Stufe IV)", "Dominante (Stufe V)"],
    stufeErkl: [
      "Das war die Tonika (Stufe I) — die Brücke von der Kadenz zum Generalbass.",
      "Das war die Subdominante (Stufe IV) — die Brücke von der Kadenz zum Generalbass.",
      "Das war die Dominante (Stufe V) — die Brücke von der Kadenz zum Generalbass.",
    ],
    schreibenFrage:
      "Schreib eine bezifferte Bassnote: das c und darunter die Bezifferung 6 (Zahlzeichen und die tiefe Ziffer 6).",
    zahlzeichenZelle: "Zahlzeichen — Punkte 3, 4, 5, 6",
    ziffer6Zelle: "die tiefe Ziffer 6 — Punkte 2, 3, 5",
    schreibenErkl: "Die Generalbass-Ziffern stehen als TIEFE Ziffern hinter dem Zahlzeichen.",
  },

  partitur: {
    auftakt: {
      frage: "Ein Stück beginnt mit einem Auftakt. Welche Nummer trägt dieser erste, unvollständige Takt?",
      wahl: ["Takt 0", "Takt 1", "Takt 2"],
      erkl: "Der Auftakt zählt als Takt 0 — der erste volle Takt ist dann Takt 1.",
    },
    taktzahl: {
      frage: "So sieht eine Taktzahl am Zeilenrand aus (hier: 16). Steht davor ein Zahlzeichen?",
      wahl: ["Nein — Taktzahlen stehen ohne Zahlzeichen", "Ja — immer mit Zahlzeichen"],
      erkl: "Marginale Taktzahlen stehen ohne Zahlzeichen — nur die Ziffern selbst.",
    },
    format: {
      frage: "Wie ordnet die Braille-Partitur zwei Hände oder Stimmen an, damit man sie takt-für-takt vergleichen kann?",
      wahl: ["Abschnittsweise Zeile über Zeile (bar-over-bar)", "Alles in eine einzige lange Zeile"],
      erkl: "Im bar-over-bar-Format stehen die Stimmen abschnittsweise übereinander — Takt neben Takt lesbar.",
    },
    quellen: {
      frage: "Wo bekommt man fertige Braille-Notenausgaben zum Lesen?",
      wahl: ["Bei Blindenbüchereien wie der dzb lesen oder der SBS", "Nur selbst abschreiben"],
      erkl: "Bibliotheken wie die dzb lesen (Leipzig) und die SBS (Zürich) halten tausende Titel in Braille-Noten bereit.",
    },
  },

  orchester: {
    /** Familien der Instrumente (angeschlagen / gezupft / geblasen). */
    familieKlavier: "Saitenklinger (angeschlagen)",
    familieGitarre: "Saitenklinger (gezupft)",
    familieBlas: "Luftklinger (geblasen)",
    hoerenFrage: "Hör das kurze Motiv — zu welcher Instrumentenfamilie gehört dieser Klang?",
    hoerenWahl: ["Saitenklinger — gezupft oder angeschlagen", "Luftklinger — geblasen", "Fellklinger — geschlagen"],
    hoerenErkl: (instrument: string, familie: string): string => `${instrument} ist ein ${familie}.`,
    /** Familie-Fragen: richtige Antwort und falsche (Reihenfolge wie im Code, fester Zufall). */
    fragen: [
      { frage: "Zu welcher Familie gehört die Trommel (nach Hornbostel-Sachs)?", richtig: "Fellklinger", falsch: ["Saitenklinger", "Luftklinger"] },
      { frage: "Zu welcher Familie gehört die Geige?", richtig: "Saitenklinger", falsch: ["Luftklinger", "Fellklinger"] },
      { frage: "Zu welcher Familie gehört die Blockflöte?", richtig: "Luftklinger", falsch: ["Fellklinger", "Selbstklinger"] },
      { frage: "Zu welcher Familie gehört die Triangel?", richtig: "Selbstklinger", falsch: ["Fellklinger", "Saitenklinger"] },
    ],
    familieErkl: (richtig: string): string => `Richtig: ${richtig}.`,
  },

  // --- Welt 9 „Lieder-Bühne" -----------------------------------------------
  lieder2: {
    dazuWahl: [
      "Es wurde lauter — ein crescendo",
      "Die Töne wurden kurz — staccato",
      "Die Töne flossen weich ineinander — legato",
    ],
    dazuDynamikFrage: (titel: string): string => `„${titel}“ — erst trocken, dann mit Ausdruck. Was kam dazu?`,
    dazuDynamikErkl: "Die zweite Fassung wurde lauter — ein crescendo.",
    dazuStaccatoFrage: (titel: string): string => `„${titel}“ — was kam zur trockenen Fassung dazu?`,
    dazuStaccatoErkl: "Die Töne wurden kurz und spitz — staccato.",
    dazuLegatoFrage: (titel: string): string => `„${titel}“ — was kam dazu?`,
    dazuLegatoErkl: "Die Töne wurden weich gebunden — legato, der Bindebogen.",
    articFrage: (titel: string): string => `„${titel}“ — gebunden (legato) oder kurz (staccato) gespielt?`,
    articWahl: ["Gebunden — legato", "Kurz — staccato"],
    articErklLegato: "Die Töne flossen ineinander — legato.",
    articErklStaccato: "Jeder Ton kurz abgesetzt — staccato.",
  },

  lesekonzert: {
    frage:
      "Lese-Konzert: Lies die Braille-Zeile (sie wird NICHT vorgespielt!), präg sie dir ein und drück „Fertig gelesen“. Dann spiel die Töne aus dem Gedächtnis auf der Klaviatur nach.",
    erkl: "Lesen, merken, spielen — genau so liest man Braille-Noten am Instrument.",
  },

  liederquiz: {
    hoerenFrage: "Hör den Anfang — welches Lied ist das?",
    hoerenErkl: (titel: string): string => `Das war der Anfang von „${titel}“.`,
    lesenFrage: "Lies die Anfangszeile in Braille — ohne Ton! Welches Lied erkennst du?",
    lesenErkl: (titel: string): string => `Diese Zeile ist der Anfang von „${titel}“ — stilles Lesen mit dem inneren Ohr.`,
  },

  /** Lied-Zeile schreiben (auch Kapitel 14, Lieder-Werkstatt). */
  liedZeile: {
    frage: (titel: string, zeile: number): string =>
      `${titel}, Zeile ${zeile}: erst anhören, dann Note für Note schreiben — jetzt MIT Oktavzeichen.`,
  },
};
