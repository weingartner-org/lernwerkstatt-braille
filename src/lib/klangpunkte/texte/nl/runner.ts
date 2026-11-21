/** Bereich `runner` - Nederlands. */
import type { runner as De } from "../de/runner";

export const runner: typeof De = {
  kopf: {
    anhoeren: "Luisteren",
    stopp: "Stop",
    anhoerenTitel: "Luister naar de opdracht (Alt + W leest hem ook voor)",
    instrument: "Instrument",
    namenKnopf: "do-re-mi",
    namenTitel: (a: string, b: string): string => `Notennamen als ${a} (vaste do) in plaats van ${b}`,
    rhythmusKnopf: "ta ti-ti",
    rhythmusTitel: "Ritmewoorden: zeg na de notenwaarden ook ta, ti-ti",
    anderesLied: "Een ander liedje",
    namenAn: (a: string, b: string, c: string): string => `Notennamen: ${a}, ${b}, ${c}.`,
    rhythmusAn: "Ritmewoorden aan: ta, ti-ti.",
    rhythmusAus: "Ritmewoorden uit.",
    zurueckLiedauswahl: "Terug naar de keuze van de liedjes.",
  },

  aufgabe: {
    liesBrailleZeile: "Lees de brailleregel.",
    handNurKlavier: "Van hand wisselen werkt alleen in het pianohoofdstuk met twee balken.",
    weiter: (prompt: string): string => `Ga verder. ${prompt}`,
    zeichenlisteHinweis: "Alle muzieksymbolen van dit hoofdstuk vind je in de tekenlijst: Alt en L.",
    songGanzGeschafft: (titel: string): string => `${titel} - helemaal klaar!`,
    songZeile: (zeile: number, von: number): string => ` · Regel ${zeile} van ${von}`,
  },

  geschafft: {
    geschafft: "Klaar!",
    mitSternen: (n: number): string => `Klaar! ${n} van 3 sterren.`,
    alsNaechstesAnsage: (titel: string): string => ` Volgende: ${titel}.`,
    alsNaechstesKarte: (titel: string): string => `Volgende: ${titel}`,
    weiterUeben: "Blijf oefenen",
    weiter: "Volgende",
  },
  fortschritt: {
    caption: "Oefenen",
    aria: (n: number, min: number, prozent: number): string =>
      `Voortgang hoofdstuk: ${n} van minstens ${min} opdrachten, ${prozent} procent klaar.`,
    rundeGeschafft: "Ronde klaar - het hoofdstuk zit goed vast.",
    runde: (n: number, min: number, noch: number): string =>
      `Ronde: ${n} van minstens ${min} opdrachten klaar` +
      (noch > 0 ? `, nog minstens ${noch} te gaan.` : ", het hoofdstuk zit bijna vast."),
  },

  lieder: {
    kinder: "🧒 Kinderliedjes",
    erwachsene: "🎼 Klassiek & evergreens",
  },

  hand: {
    hinweis: (f: "both" | "rh" | "lh"): string =>
      " - bekijk en hoor één hand alleen, groot (" +
      (f === "rh"
        ? "nu: alleen rechterhand"
        : f === "lh"
          ? "nu: alleen linkerhand"
          : "nu: beide handen") +
      ")",
  },

  wahl: {
    richtig: "Goed!",
    richtigWaere: (antwort: string): string => `Het juiste antwoord is: ${antwort}.`,
    antworten: "Antwoorden (je kunt ook de cijfertoetsen 1 tot 4 gebruiken)",
  },

  tap: {
    aria: (n: number): string => `Tik het ritme: spatiebalk. Tot nu toe ${n} keer getikt.`,
    vor: "Tik hier met de ",
    stark: "spatiebalk",
    nach: (n: number, von: number): string => ` - ${n} van ${von} keer getikt`,
    knopf: (n: number, von: number): string => `Tik (${n} van ${von})`,
    puls: "Nog niet helemaal gelijkmatig - voel de beat en houd het rustig.",
    kurz: "kort",
    lang: "lang",
    fast: (muster: string): string => `Bijna! Het patroon was: ${muster}. Luister nog eens.`,
    genauImPuls: "Precies op de beat!",
    genauImTakt: "Precies op de tel!",
  },

  spielen: {
    ariaKlaviatur: (namen: string): string =>
      `Toetsenbord melodie nadoen: D F G H J K L zijn ${namen}. Pijltjes omhoog en omlaag veranderen de octaaf. `,
    ariaFrei: (n: number, von: number): string => `Speel vrij over de bourdon - ${n} van ${von} noten. `,
    ariaMemory: (laenge: number): string => `Huidige lengte ${laenge} noten. `,
    ariaTon: (i: number, von: number): string => `Noot ${i} van ${von}. `,
    ariaLesen:
      "Leesconcert: lees de brailleregel. Druk op Enter of op ‘Klaar met lezen’ als je hem in je hoofd hebt.",
    lesenVor: "Lees de regel in braille - hij wordt ",
    lesenStark: "niet",
    lesenMitte: " gespeeld. Als je hem in je hoofd hebt, druk je op ",
    lesenNach: " of ‘Klaar met lezen’.",
    fertigGelesen: "Klaar met lezen",
    nachLesen: "Speel hem nu uit het hoofd - D F G H J K L, de pijltjes veranderen de octaaf.",
    freiVor: "Speel vrij met ",
    freiNach: (n: number, von: number): string => ` (pentatonisch) - ${n} van ${von} noten · over de kwintbourdon`,
    nachspielenVor: "Speel het na met ",
    nachspielenMitte: " - ",
    laenge: (n: number): string => `Lengte ${n}`,
    tonVon: (i: number, von: number): string => `Noot ${i} van ${von}`,
    oktaveNach: (oktave: string): string => ` Octaaf (${oktave})`,
    oktaveRauf: "Octaaf omhoog",
    oktaveRunter: "Octaaf omlaag",
    freiGeschafft: (n: number): string =>
      `Mooi gespeeld - ${n} noten! Je hebt de werkplaats bezocht. Druk op ‘Blijf oefenen’ om door te spelen.`,
    falscherTon: (gespielt: string, gesucht: string): string => `Dat was ${gespielt} - we zoeken ${gesucht}.`,
    nichtsMehr: "niets meer",
    memoryWeiter: (n: number): string => `Klaar - ${n} noten! Er komt nog één bij.`,
    memoryEnde: (best: number): string =>
      `Afgelopen - je hebt ${best} ${best === 1 ? "noot" : "noten"} achter elkaar goed. Ik speel de reeks nog één keer.`,
    genauRichtig: "Precies goed!",
    fertig: "Klaar.",
  },

  schreiben: {
    aria: (zelle: number, von: number): string =>
      `Brailleinvoer: f d s en j k l zijn de punten, de spatiebalk is de maatstreep. Cel ${zelle} van ${von}. Houd Shift ingedrukt om de toetsen van de cel te tonen en te horen.`,
    nochmalAnhoeren: "Nog eens luisteren",
    diktat: "Luister zo vaak als je wilt - het telt niet als fout. Schrijf daarna op wat je hoorde, cel voor cel.",
    vor: "Schrijf met ",
    mitte: (zelle: number, von: number): string => ` - cel ${zelle} van ${von} · `,
    umschalt: "⇧ Shift",
    nach: " toont de cel",
    taktstrichTitel: "Maatstreep (spatiebalk)",
    gedrueckt: (punkte: string): string => `Ingedrukt: punten ${punkte}`,
    aktuelleStelleLeertaste: "Huidige plaats: de spatiebalk - de maatstreep.",
    genauRichtig: "Precies goed!",
    fertig: "Klaar.",
  },

  takt: {
    aria: (n: number): string =>
      `Maatbouwer: schrijf noten of rusten met f d s j k l; elke noot klinkt meteen. Backspace wist de laatste cel, Enter controleert de maat. Tot nu toe ${n} cellen.`,
    vor: "Bouw de maat met ",
    mitte: " - elke noot of rust klinkt. ",
    loescht: " wist, ",
    pruefen: (a: number, b: number): string => ` controleert. Maatsoort ${a}/${b}.`,
    nochLeer: "Nog leeg - aan de slag.",
    taktPruefen: "Maat controleren (Enter)",
    loeschen: "Wissen (⌫)",
    pause: "Rust",
    nominativ: (dativ: string): string => dativ,
    pauseAus: (_notenwort: string, pausenwort: string): string => pausenwort,
    keineZelle: "Dat is geen noot- of rustcel. Gebruik een noot (f d s j k l) of een rust.",
    alsGelesen: (wert: string): string => ` - gelezen als ${wert}, omdat dat nog past`,
    zusammen: (label: string, ambi: string, summe: string, ganz: string, einheit: string): string =>
      `${label}${ambi}. Samen ${summe} van ${ganz} ${einheit}.`,
    letzteGeloescht: (anzahl: string, einheit: string): string => `Laatste cel gewist. Nu: ${anzahl} ${einheit}.`,
    fehlen: (einzahl: boolean, anzahl: string, einheit: string): string =>
      `Er ${einzahl ? "ontbreekt" : "ontbreken"} nog ${anzahl} ${einheit} voordat de maat vol is.`,
    zuViel: (_einzahl: boolean, anzahl: string, einheit: string): string =>
      `Dat is ${anzahl} ${einheit} te veel. Haal er iets weg.`,
    mindestensNoten: (n: number): string => `De maat is vol, maar er moeten minstens ${n} noten in.`,
    mindestensPause: "De maat is vol - maar er moet minstens één rust in.",
    voll: "Volle maat! Luister ernaar.",
    vollSauber: "Precies vol - een keurige maat! Luister ernaar.",
  },

  werkstatt: {
    aria: (zellen: number, werke: number): string =>
      `Componeerwerkplaats: schrijf vrij met f d s j k l, de spatiebalk is de maatstreep. Met de knoppen luister, wis en bewaar je. Tot nu toe ${zellen} cellen, ${werke} van 5 stukken bewaard.`,
    vor: "Schrijf vrij met ",
    mitte: " - spatiebalk = maatstreep, ",
    nach: " wist de laatste cel.",
    leeresBlatt: "Lege pagina - begin gewoon met componeren.",
    anhoeren: "Luisteren",
    loeschen: "Wissen",
    nameFuerWerk: "Naam voor je stuk",
    speichern: "Bewaren",
    nochNichtsGeschrieben: "Nog niets geschreven - schrijf eerst een paar noten.",
    geleert: "Werkplaats leeggemaakt.",
    schonFuenf: "Je hebt al vijf stukken bewaard. Wis er één, dan werkt het weer.",
    nochNichtsSpeichern: "Nog niets om te bewaren.",
    meinWerk: (n: number): string => `Mijn stuk ${n}`,
    gespeichert: (name: string, n: number): string => `“${name}” bewaard. Je hebt nu ${n} van 5 stukken.`,
    gespeicherteListe: (namen: string, n: number): string => `Bewaard: ${namen} (${n} van 5)`,
  },

  notenzeile: {
    handFokus: {
      rh: "Alleen rechterhand (boven, violinsleutel)",
      lh: "Alleen linkerhand (onder, bassleutel)",
      both: "Beide handen",
    },
    rechteHand: "Rechterhand · violinsleutel",
    linkeHand: "Linkerhand · bassleutel",
  },

  touch: {
    gruppe: "Invoer met aanraking",
    anleitungVor: "Tik de punten van de cel aan, en daarna ",
    zelleSetzen: "Cel zetten",
    anleitungNach: ".",
    punkteGruppe: "De zes punten van een cel",
    punkt: (p: number): string => `Punt ${p}`,
    taktstrich: "Maatstreep",
    pause: "Rust",
    letzteLoeschen: "Laatste cel wissen",
    taktPruefen: "Maat controleren",
    bsiTitel: "VoiceOver-brailleinvoer",
    bsiHinweis:
      "Zet de rotor op brailleinvoer en tik de cellen in dit veld. Met één vinger naar rechts is de maatstreep, naar links wist het de laatste cel.",
    testen: "Brailleinvoer testen - wat komt aan?",
    nochNichts: "Nog niets ingevoerd.",
    verlauf: (text: string, codepoints: string, ergebnis: string): string => `“${text}” (${codepoints}) → ${ergebnis}`,
    keineZelleErkannt: "geen cel herkend",
    nochKeinPunkt: "Nog geen punt gekozen. Tik eerst de punten aan, dan Cel zetten.",
    unbekannt: (zeichen: string): string =>
      `Ik kan het teken ${zeichen} niet als punten lezen. Gebruik de puntknoppen.`,
  },
};
