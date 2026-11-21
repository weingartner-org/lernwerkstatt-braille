/**
 * Bereich `aufgabenA` - Deutsch (Bestand 1:1, Byte für Byte).
 * Aufgaben-Erzeuger in `etappen.ts`: kp1 bis kp13, Stufe-2 (Haltebogen bis Triole)
 * und Welt 1 „Ohrenspitzer". Funktionen = Texte mit eingesetzten Wörtern.
 */
export const aufgabenA = {
  gemeinsam: {
    taktstrichZelle: "Taktstrich — die Leertaste",
    zahlzeichen: "das Zahlzeichen",
    obereZahl: (n: number): string => `die ${n} (obere Zahl)`,
    tiefeZahl: (n: number): string => `die ${n} als tiefe Zahl`,
    /** Schlagzahl lesbar machen („1,5" statt „1.5"). */
    schlagzahl: (b: number): string => (Number.isInteger(b) ? String(b) : String(b).replace(".", ",")),
  },
  hilfe: {
    schreibNote: (ton: string, wert: string): string => `Schreib: ${ton} — ${wert}.`,
    welcheNote: "Welche Note ist das? Hör hin und fühl die Zelle.",
    dasWar: (ton: string, wert: string): string => `Das war ${ton} — ${wert}.`,
  },
  kp1: {
    zweiHoeher: "Zwei Töne. Welcher war höher?",
    dreiHoechster: "Drei Töne. Welcher war am höchsten?",
    ordinale: ["Der erste", "Der zweite", "Der dritte"],
    hoechsterErklaer: (i: number): string =>
      `${["Der erste", "Der zweite", "Der dritte"][i]} Ton war der höchste.`,
    leiter: "Eine kleine Tonleiter. Geht sie rauf oder runter?",
    leiterWahl: ["Rauf", "Runter"],
    leiterRauf: "Sie ging rauf.",
    leiterRunter: "Sie ging runter.",
  },
  kp2: {
    prompt: (len: number): string =>
      `Hör den Rhythmus und klopf ihn mit der Leertaste nach — ${len} Schläge.`,
  },
  kp3: {
    grundform: " (Die Grundform ist die Achtelnote.)",
  },
  kp4: {
    prompt: "Hör die Melodie und schreib sie Note für Note.",
  },
  kp5: {
    viertelHinweis: " (Viertel = Punkt 6 dazu — wie bei k bis t der Punkt 3.)",
    melodie: "Schreib die Melodie — alles Viertelnoten.",
    frage: "Achtel oder Viertel?",
    wahl: ["Achtelnote", "Viertelnote"],
    erklaerAchtel: "Ohne Zusatzpunkt unten: eine Achtelnote.",
    erklaerViertel: "Mit Punkt 6 dazu: eine Viertelnote.",
  },
  kp6: {
    halbeHinweis: " (Halbe = Punkt 3 dazu.)",
    ganzeHinweis: " (Ganze = Punkte 3 und 6 dazu.)",
    frage: "Welcher Notenwert ist das?",
    erklaer: (wert: string): string => `Es war eine ${wert}.`,
  },
  kp7: {
    schreibPause: (pause: string): string => `Schreib: ${pause}.`,
    taktart: "Welche Taktart steht hier?",
    taktartErklaer: (a: number, b: number): string =>
      `Es war der ${a}/${b}-Takt: Zahlzeichen, ${a} oben, ${b} als tiefe Zahl unten.`,
    taktstrich: (ton1: string, ton2: string): string =>
      `Schreib: ${ton1} halbe, Taktstrich (Leertaste), ${ton2} halbe.`,
    taktstrichErklaer: "Der Taktstrich ist in Braille ein Leerzeichen.",
  },
  kp8: {
    prompt: (ton: string, wert: string): string =>
      `Schreib: ${ton} — punktierte ${wert}. (Der Verlängerungspunkt ist Punkt 3 in einer EIGENEN Zelle.)`,
    punktZelle: "der Verlängerungspunkt — Punkt 3",
  },
  kp9: {
    prompt: (vorzeichen: string, ton: string): string =>
      `Schreib: ${vorzeichen}, dann ${ton} als Viertel. (Das Vorzeichen steht direkt VOR der Note.)`,
  },
  kp10: {
    lage: "In welcher Lage klingt das?",
    lageWahl: ["Tief (kleine Oktave)", "Mittel (eingestrichen)", "Hoch (zweigestrichen)"],
    lageErklaer: (oktave: string): string => `Das war die ${oktave}.`,
    schreib: (ton: string, oktave: string): string =>
      `Schreib als ERSTE Note eines Stücks: ${ton} in der ${oktave}, Viertel. (Erst das Oktavzeichen, dann die Note.)`,
    zeichenZelle: (oktave: string): string => `das Oktavzeichen der ${oktave}`,
  },
  kp11: {
    gleich: "die gleiche Note",
    sekundeTerz: "eine Sekunde oder Terz",
    quarteQuinte: "eine Quarte oder Quinte",
    sexteMehr: "eine Sexte oder mehr",
    regelKlein: "Sekunde und Terz brauchen NIE ein Oktavzeichen.",
    regelMittel: "Quarte und Quinte brauchen es NUR, wenn die Oktave wechselt.",
    regelGross: "Ab der Sexte braucht die Note IMMER ein Oktavzeichen.",
    prompt: (ton1: string, oktave1: string, ton2: string, oktave2: string): string =>
      `Erste Note: ${ton1}, ${oktave1}. Danach: ${ton2}, ${oktave2}. Braucht die zweite Note ein Oktavzeichen?`,
    wahl: ["Ja", "Nein"],
    erklaer: (sprung: string, regel: string): string => `Der Sprung ist ${sprung}. ${regel}`,
  },
  kp12: {
    grossPrompt: "Im 4/4-Takt füllt EINE einzige Zelle den ganzen Takt. Ganze Note oder Sechzehntel?",
    grossWahl: ["Eine ganze Note", "Eine Sechzehntelnote"],
    grossErklaer:
      "Eine einzelne Zelle, die vier Schläge füllen muss, ist der GROSSE Wert: die ganze Note. Eine Sechzehntel wäre viel zu kurz.",
    kleinPrompt: "Im 2/4-Takt stehen ACHT gleiche Zellen hintereinander. Ganze Noten oder Sechzehntel?",
    kleinWahl: ["Ganze Noten", "Sechzehntelnoten"],
    kleinErklaer:
      "Acht ganze Noten passen nie in zwei Schläge — es müssen die KLEINEN Werte sein: Sechzehntel. Takt und Zusammenhang entscheiden.",
  },
  kp13: {
    similePrompt: "Schreib das Braille-Taktwiederholungszeichen (den ganzen Takt noch einmal spielen).",
    simileZelle: "das Taktwiederholungszeichen — Punkte 2, 3, 5, 6",
    simileErklaer: "Dieses Kürzel gibt es nur in Braille — schlauer als der Druck!",
    startPrompt: "Schreib: Wiederholung ANFANG (zwei Zellen).",
    startZellen: ["erste Zelle — Punkte 1, 2, 6", "zweite Zelle — Punkte 2, 3, 5, 6"],
    endePrompt: "Schreib: Wiederholung ENDE (zwei Zellen).",
    endeZellen: ["erste Zelle — Punkte 1, 2, 6", "zweite Zelle — Punkte 2, 3"],
    schluss: "Der Schlussstrich (Ende des Stücks)",
    anfang: "Wiederholung Anfang",
    ende: "Wiederholung Ende",
    erkennenPrompt: "Welches Formzeichen ist das?",
    erkannt: (zeichen: string): string => `Es war: ${zeichen}.`,
  },
  haltebogen: {
    hoerenPrompt: "Zwei halbe Noten auf demselben Ton. Einmal oder zweimal angeschlagen?",
    hoerenWahl: ["Einmal — gebunden (Haltebogen)", "Zweimal — getrennt"],
    hoerenGebunden: "Nur ein Anschlag: Der Haltebogen bindet die zwei Noten zu EINEM langen Ton.",
    hoerenGetrennt: "Zwei Anschläge: Hier war kein Haltebogen — jede Note beginnt neu.",
    schreibPrompt: (ton: string): string =>
      `Schreib: ${ton} halbe, Haltebogen (zwei Zellen: Punkt 4, dann 1 und 4), noch einmal ${ton} halbe.`,
    zelle1: "Haltebogen, erste Zelle — Punkt 4",
    zelle2: "Haltebogen, zweite Zelle — Punkte 1, 4",
    klingtWeiter: (note: string): string => `${note} — klingt weiter, ohne neuen Anschlag`,
    schreibErklaer: "Der Haltebogen steht direkt NACH der ersten Note.",
    taktPrompt: (ton: string): string =>
      `Über den Taktstrich binden: ${ton} halbe, Haltebogen, Taktstrich (Leertaste), ${ton} halbe.`,
    taktErklaer: "So klingt ein Ton über den Taktstrich hinweg weiter.",
  },
  auftakt: {
    vollPrompt: (a: number, b: number): string =>
      `${a}/${b}-Takt. Hör den Takt und zähl mit: Ist er vollständig?`,
    vollWahl: ["Vollständig", "Unvollständig — ein Auftakt oder Teiltakt"],
    vollJa: (ziel: string): string => `Er geht genau auf: ${ziel} Schläge.`,
    vollNein: (summe: string, ziel: string): string =>
      `Da fehlt etwas: nur ${summe} von ${ziel} Schlägen — ein Teiltakt. Am Stückanfang heißt er Auftakt.`,
    bindestrichPrompt: "Der Takt ist am Zeilenende noch nicht fertig. Schreib den Musik-Bindestrich (Punkt 5).",
    bindestrichZelle: "der Musik-Bindestrich — Punkt 5",
    bindestrichErklaer: "Punkt 5 am Zeilenende sagt: Dieser Takt geht auf der nächsten Zeile weiter.",
    schreibPrompt: (ton: string): string =>
      `Schreib den Auftakt: ${ton} Viertel, Taktstrich (Leertaste), dann den vollen Takt.`,
    auftaktZelle: (note: string): string => `${note} — der Auftakt`,
    schreibErklaer: "Ein Auftakt ist ein unvollständiger erster Takt — geschrieben wird er ganz normal.",
  },
  pausen2: {
    vielePrompt: (n: number): string => `Schreib: ${n} Takte Pause — Zahlzeichen, die ${n}, dann die ganze Pause.`,
    zahlzeichenZelle: "das Zahlzeichen — Punkte 3, 4, 5, 6",
    zahlZelle: (n: number): string => `die Zahl ${n}`,
    ganzePauseZelle: "die ganze Pause — Punkte 1, 3, 4",
    vieleErklaer: "Ab vier leeren Takten schreibt Braille die Anzahl als Zahl vor die ganze Pause.",
    kleinPrompt: (n: number): string =>
      `Schreib: ${n} leere Takte — bis drei Takte einfach die ganze Pause ${n === 2 ? "zweimal" : "dreimal"}.`,
    kleinZelle: (i: number): string => `ganze Pause ${i} — ein ganzer leerer Takt`,
    kleinErklaer: "Die ganze Pause füllt IMMER einen ganzen Takt — egal in welcher Taktart.",
    lesenPrompt: "Wie viele stille Takte stehen hier?",
    takte: (n: number): string => `${n} Takte`,
    lesenKlein: (n: number): string => `${n} ganze Pausen hintereinander = ${n} leere Takte.`,
    lesenGross: (n: number): string => `Zahlzeichen + ${n} + ganze Pause = ${n} Takte Stille am Stück.`,
    stillePrompt: "Drei Takte — einer davon ist ganz still. Wo?",
    stilleWahl: ["Am Anfang", "In der Mitte", "Am Ende"],
    stilleErklaer: (i: number): string =>
      `Die Stille war ${["am Anfang", "in der Mitte", "am Ende"][i]} — ein ganzer Takt Pause.`,
  },
  tonart: {
    keyNames: {
      kreuz: ["G-Dur", "D-Dur", "A-Dur", "E-Dur"],
      be: ["F-Dur", "B-Dur", "Es-Dur", "As-Dur"],
    },
    kreuz: "Kreuz",
    be: "Be",
    kreuze: "Kreuze",
    bes: "Bes",
    lesenPrompt: (mehrzahl: string): string =>
      `Am Stückanfang steht diese Vorzeichnung. Wie viele ${mehrzahl} sind es?`,
    lesenErklaer: (n: number, name: string, tonart: string, ab4: boolean): string =>
      `${n} ${name} — die Vorzeichnung von ${tonart}. ${
        ab4 ? "Ab vier steht die Anzahl als Zahl davor." : "Bis drei wird das Zeichen einfach wiederholt."
      }`,
    schreibKlein: (n: number, name: string, zeichen: string): string =>
      `Schreib die Vorzeichnung: ${n} ${name} — das ${zeichen}-Zeichen einfach ${n === 1 ? "einmal" : n === 2 ? "zweimal" : "dreimal"}.`,
    schreibGross: (n: number, mehrzahl: string, zeichen: string): string =>
      `Schreib die Vorzeichnung: ${n} ${mehrzahl} — ab vier mit Zahlzeichen: Zahlzeichen, die ${n}, dann das ${zeichen}.`,
    zeichenZelle: (name: string, i: number, punkte: string): string => `${name} ${i} — Punkte ${punkte}`,
    zahlzeichenZelle: "das Zahlzeichen — Punkte 3, 4, 5, 6",
    zahlZelle: (n: number): string => `die Zahl ${n}`,
    dasZeichen: (name: string): string => `das ${name}`,
    istVorzeichnung: (tonart: string): string => `Das ist die Vorzeichnung von ${tonart}.`,
    kopfPrompt: (n: number, name: string, a: number, b: number): string =>
      `Schreib den Stück-Kopf: erst die Vorzeichnung (${n} ${name}), direkt dahinter die Taktangabe ${a}/${b} — ohne Leerzeichen dazwischen.`,
    kopfZelle: (name: string, i: number): string => `${name} ${i}`,
    kopfErklaer: "Tonart und Taktart stehen zusammen am Stückanfang — erst die Vorzeichen, dann der Takt.",
    regelPrompt: "Die Vorzeichnung am Stückanfang — wie lange gilt sie?",
    regelWahl: ["Für das ganze Stück", "Nur für den ersten Takt", "Nur für die erste Note"],
    regelErklaer:
      "Die Vorzeichnung gilt fürs ganze Stück — ein Versetzungszeichen mitten im Takt dagegen nur bis zum Taktstrich.",
  },
  taktwechsel: {
    sonderPrompt: "Welche Taktangabe ist das?",
    sonderWahl: ["C — der Viervierteltakt", "Alla breve — der Zweihalbetakt", "Der 3/4-Takt"],
    sonderErklaerC: "Punkte 4, 6 vor dem c: das C des Viervierteltakts.",
    sonderErklaerAb: "Punkte 4, 5, 6 vor dem c: alla breve — die Halben schlagen den Takt.",
    sonderSchreibenC: "Schreib das C-Taktzeichen: Punkte 4 und 6, dann das c (Punkte 1, 4).",
    sonderSchreibenAb: "Schreib alla breve: Punkte 4, 5 und 6, dann das c (Punkte 1, 4).",
    vorzeichenC: "das Vorzeichen — Punkte 4, 6",
    vorzeichenAb: "das Vorzeichen — Punkte 4, 5, 6",
    dasC: "das c — Punkte 1, 4",
    wechselPrompt: "Nach ein paar Noten steht eine ZWEITE Taktangabe. Was bedeutet das?",
    wechselWahl: (a: number, b: number): string[] => [
      `Die Taktart wechselt zu ${a}/${b}`,
      "Die Tonart wechselt",
      "Das Stück ist zu Ende",
    ],
    wechselErklaer: (a: number, b: number): string =>
      `Eine neue Taktangabe mitten im Stück heißt: Ab hier gilt der ${a}/${b}-Takt.`,
    wechselSchreiben: (a: number, b: number): string =>
      `Mitten im Stück wechselt der Takt: Schreib Taktstrich (Leertaste), dann die neue Taktangabe ${a}/${b}.`,
  },
  schluessel: {
    lesenPrompt: "Welcher Notenschlüssel steht hier (drei Zellen)?",
    lesenErklaer: (schluessel: string): string =>
      `Es war der ${schluessel}. Alle Schlüssel beginnen mit Punkte 3, 4, 5 und enden mit Punkte 1, 2, 3 — die Mitte unterscheidet sie.`,
    mitteViolin: "Punkte 3, 4",
    mitteBass: "Punkte 3, 4, 5, 6",
    schreibPrompt: (schluessel: string, mitte: string): string =>
      `Schreib den ${schluessel} — drei Zellen: Punkte 3, 4, 5 · ${mitte} · Punkte 1, 2, 3.`,
    ankuendigung: "die Schlüssel-Ankündigung — Punkte 3, 4, 5",
    gZeichen: "das G-Zeichen — Punkte 3, 4",
    fZeichen: "das F-Zeichen — Punkte 3, 4, 5, 6",
    abschluss: "der Abschluss — Punkte 1, 2, 3",
    wissenPrompt: "Braucht die Braille-Notenschrift Schlüssel, um die Tonhöhe zu bestimmen?",
    wissenWahl: ["Nein — die Oktavzeichen sagen die Lage", "Ja — ohne Schlüssel geht nichts"],
    wissenErklaer:
      "Schlüsselzeichen sind in Braille nur eine Info über das Druckbild — die Lage bestimmen immer die Oktavzeichen.",
  },
  sechzehntel: {
    hoerenPrompt: "Ein kleiner Lauf. Achtel — oder die doppelt so flinken Sechzehntel?",
    hoerenWahl: ["Achtel", "Sechzehntel"],
    hoerenSchnell: "Das waren Sechzehntel — vier auf einen Schlag.",
    hoerenLangsam: "Das waren Achtel — zwei auf einen Schlag.",
    gruppePrompt:
      "Schreib die Sechzehntel-Vierergruppe: Nur die ERSTE Note bekommt die Punkte 3 und 6, die drei anderen schreibst du wie Achtel (Gruppierung).",
    ersteZelle: (ton: string): string => `${ton} als Sechzehntel — mit den Punkten 3 und 6`,
    andereZelle: (ton: string): string => `${ton} — wie eine Achtel geschrieben (gehört zur Gruppe)`,
    gruppeErklaer: "Die Gruppierung macht schnelle Läufe lesbar: Wert-Punkte nur auf der ersten Note der Gruppe.",
    regelPrompt:
      "Vier Sechzehntel auf einem Schlag, als Gruppe geschrieben: Wie viele Zellen tragen die Wert-Punkte 3 und 6?",
    regelWahl: ["Nur die erste", "Alle vier", "Die erste und die letzte"],
    regelErklaer:
      "Nur die erste Note der Gruppe zeigt den Wert — der Rest sieht aus wie Achtel. Das Braille-Gegenstück zur Balken-Gruppe im Druck.",
    einzelnPrompt: (ton: string): string =>
      `Schreib: ${ton} als Sechzehntel. (Achtung — dieselbe Zelle wie die ganze Note; der Takt entscheidet!)`,
  },
  triolen: {
    hoerenPrompt: "Zwischen zwei ruhigen Schlägen: Wie viele Töne teilen sich EINEN Schlag — zwei oder drei?",
    hoerenWahl: ["Zwei — normale Achtel", "Drei — eine Triole"],
    hoerenTriole: "Drei gleich lange Töne auf einem Schlag: eine Triole.",
    hoerenZwei: "Zwei Achtel — die normale Teilung.",
    schreibPrompt: "Schreib die Triole: erst das Triolenzeichen (Punkte 2, 3), dann die drei Achtel.",
    triolenZeichen: "das Triolenzeichen — Punkte 2, 3",
    achtelZelle: (ton: string): string => `${ton}, Achtelnote — ein Drittel des Schlags`,
    schreibErklaer: "Das Triolenzeichen steht EINMAL vor der Gruppe — es macht aus zwei Achteln drei.",
    lesenPrompt: "Vor drei Achteln steht diese erste Zelle (Punkte 2, 3). Was bedeutet sie?",
    lesenWahl: ["Eine Triole — drei Töne auf einem Schlag", "Eine Achtelpause", "Ein Oktavzeichen"],
    lesenErklaer: "Punkte 2, 3 vor einer Notengruppe = Triole.",
  },
  puls: {
    klopfPrompt: (n: number): string =>
      `Fühl den Grundschlag und klopf ihn gleichmäßig mit der Leertaste mit — ${n} Schläge lang.`,
    metrumPrompt: "Hör die betonten Schläge: marschiert das im Zweier oder walzert das im Dreier?",
    metrumWahl: ["Marsch — im Zweier", "Walzer — im Dreier"],
    metrumDrei: "Immer die erste von drei Zählzeiten ist betont: ein Dreier — der Walzerschritt.",
    metrumZwei: "Immer die erste von zwei Zählzeiten ist betont: ein Zweier — der Marschschritt.",
    abstandPrompt: "Zähl die Schläge von einer Betonung zur nächsten: wie viele sind es?",
    abstandWahl: ["2 Schläge", "3 Schläge", "4 Schläge"],
    abstandErklaer: (n: number): string => `Von Betonung zu Betonung sind es ${n} Schläge — ein ${n}/4-Takt.`,
  },
  dauer: {
    vergleichPrompt: "Zwei Töne nacheinander. Welcher klang länger?",
    vergleichWahl: ["Der erste", "Der zweite"],
    vergleichErster: "Der erste war eine halbe Note — doppelt so lang wie die Viertel danach.",
    vergleichZweiter: "Der zweite war eine halbe Note — doppelt so lang wie die Viertel davor.",
    schlaegePrompt: "Erst zwei Puls-Schläge, dann ein langer Ton: wie viele Schläge lang klang er?",
    schlaegeWahl: ["1 Schlag — eine Viertel", "2 Schläge — eine Halbe", "4 Schläge — eine Ganze"],
    schlaegeErklaer: (wert: string, zahl: number): string =>
      `Das war eine ${wert} — ${zahl} ${zahl === 1 ? "Schlag" : "Schläge"} lang.`,
    paarPrompt: "Zwei Töne: gleich lang — oder der zweite doppelt so lang?",
    paarWahl: ["Gleich lang", "Der zweite doppelt so lang"],
    paarGleich: "Zwei gleich lange Viertelnoten.",
    paarDoppelt: "Erst eine Viertel, dann eine Halbe — doppelt so lang.",
  },
  dynamik: {
    lautPrompt: "Hör die kleine Phrase: laut oder leise gespielt?",
    lautWahl: ["Laut", "Leise"],
    lautErklaer: "Kräftig gespielt — das nennt man später forte.",
    leiseErklaer: "Ganz zart gespielt — das nennt man später piano.",
    rampePrompt: "Wird die Phrase lauter oder leiser?",
    rampeWahl: ["Lauter", "Leiser"],
    cresc: "Von leise nach laut — später heißt das crescendo.",
    decresc: "Von laut nach leise — später heißt das decrescendo.",
    akzentPrompt: "Ein Ton wird besonders betont. Wo war er?",
    akzentWahl: ["Am Anfang", "In der Mitte", "Am Ende"],
    akzentErklaer: (i: number): string =>
      `Der betonte Ton lag ${["am Anfang", "in der Mitte", "am Ende"][i]}.`,
  },
  inst: {
    merk: {
      klavier: "Klavier — angeschlagen, heller Anschlag mit Ausklang.",
      gitarre: "Gitarre — gezupft, perkussiv und saitig.",
      sax: "Saxophon — geblasen, getragen und rohrblattfarben.",
      floete: "Querflöte — geblasen, weich und klar.",
    },
    hoerenPrompt: "Welches Instrument spielt hier?",
    vergleichPrompt: "Zwei Motive nacheinander: gleiches Instrument oder verschieden?",
    vergleichWahl: ["Gleiches Instrument", "Verschiedene Instrumente"],
    vergleichGleich: "Beide Motive kamen vom selben Instrument.",
    vergleichErklaer: (a: string, b: string): string => `Erst ${a}, dann ${b}.`,
    zuerstPrompt: "Zwei Instrumente nacheinander. Welches spielte zuerst?",
    zuerstErklaer: (a: string): string => `Zuerst kam das ${a}.`,
  },
  echo: {
    prompt: (len: number): string =>
      `Echo-Spiel: Hör die ${len} Töne und spiel sie auf der Klaviatur nach — D F G H J K L sind c d e f g a h. Nur die Tonfolge zählt, der Rhythmus ist frei.`,
    erklaer: "Spiel die Töne in der gehörten Reihenfolge nach.",
  },
  memory: {
    prompt:
      "Melodie-Memory: Ich spiele eine Tonfolge, du spielst sie nach (D F G H J K L = c d e f g a h). Schaffst du es, kommt ein Ton dazu — wie weit kommst du?",
  },
};
