/** Bereich `aufgabenC` - Nederlands: Werelden 7, 8 en 9. */
import type { aufgabenC as De } from "../de/aufgabenC";

export const aufgabenC: typeof De = {
  zellen: {
    oktavzeichenDer: (oktave: string): string => `het octaafteken voor het ${oktave}`,
    oktavzeichen: "het octaafteken",
    vorzeichen: "het voorteken",
    verlaengerungspunkt: "de punt die de noot langer maakt - punt 3",
    taktstrich: "maatstreep - de spatiebalk",
  },

  // --- Wereld 7 „Theorie-speeltuin" -----------------------------------------
  tonleitern: {
    spielNach:
      "Speel de C-groot toonladder omhoog: C D E F G A B C - op de toetsen D F G H J K L, dan een octaaf hoger en weer D.",
    spielNachErkl: "Acht stappen van C naar de volgende C.",
    durMollFrage: "Luister naar de toonladder - groot (helder) of klein (donker)?",
    durMollWahl: ["Groot", "Klein"],
    durMollErklMoll: "De derde stap is verlaagd - natuurlijk klein.",
    durMollErklDur: "Een gewone grote toonladder.",
    fehlerFrage: "In deze grote toonladder is ÉÉN noot verschoven. Welke stap was verkeerd?",
    fehlerWahl: ["Stap 3", "Stap 4", "Stap 5", "Stap 6", "Stap 7"],
    fehlerErkl: (stufe: number): string => `Stap ${stufe} klonk te hoog.`,
    schreibe:
      "Schrijf de G-groot toonladder: G A B C D E - en dan F kruis, dus een kruis vóór de F (dat is het ene kruis in de toonsoort G-groot).",
    schreibeErkl: "G-groot heeft één kruis: de F wordt Fis.",
  },

  quintenzirkel: {
    vz: {
      kreuz: { ein: "kruis", mehr: "kruizen" },
      be: { ein: "mol", mehr: "mollen" },
    },
    anzahlFrage: (name: string, mehr: string): string =>
      `Stop op de kwintencirkel: ${name}. Hoeveel ${mehr} heeft deze toonsoort?`,
    anzahlErkl: (name: string, n: number, wort: string): string => `${name} heeft ${n} ${wort}.`,
    nameFrage: (n: number, wort: string): string => `${n} ${wort} - welke grote toonsoort is dat?`,
    nameErkl: (n: number, wort: string, name: string): string => `${n} ${wort}: dat is ${name}.`,
    lesenFrage: "Lees de toonsoort in braille - welke toonsoort is het?",
    lesenErkl: (name: string): string => `Deze toonsoort hoort bij ${name}.`,
  },

  rhythmusdiktat: {
    blattFrage: "Lees het ritme op de notenbalk en tik het op de spatiebalk - rechtstreeks van de pagina.",
    diktatFrage: (rhythm: boolean): string =>
      `Ritmedictee: ik tik één maat op de noot G. Schrijf de notenwaarden op die je hoort${rhythm ? " (de ritmewoorden staan aan)" : ""}. De beginnoot is G. Luister zo vaak als je wilt.`,
    diktatErkl: "Tel de tellen per noot: kwartnoot = één tel, halve noot = twee.",
  },

  melodiediktat: {
    frage: (startton: string, anzahl: number): string =>
      `Melodiedictee: de beginnoot is ${startton}. Luister naar de ${anzahl} noten en schrijf ze op - ze gaan in kleine stapjes. Luister zo vaak als je wilt.`,
    erkl: "Vergelijk noot voor noot met de beginnoot: gaat het omhoog of omlaag?",
  },

  detektiv: {
    frage: "Lees de brailleregel en luister naar de opname. Waar wijkt het geluid af van de noten?",
    note: (n: number): string => `Noot ${n}`,
    allesRichtig: "Alles klopt",
    erklRichtig: "Alles klopte - het geluid en de noten waren hetzelfde.",
    erklAnders: (n: number): string => `Noot ${n} klonk anders dan er geschreven stond.`,
  },

  baumeister: {
    dreiViertel:
      "Bouw een volle 3/4-maat: schrijf noten en rusten met f d s j k l tot de tellen precies 3 zijn. Enter controleert het.",
    mitPause: "Bouw een 4/4-maat met minstens ÉÉN rust. Enter controleert het.",
    mitNoten: "Bouw een 4/4-maat met minstens DRIE noten. Enter controleert het.",
    sechsAchtel: "Uitdaging: bouw een volle 6/8-maat (zes tellen van achtste noten). Enter controleert het.",
  },

  spielwiese: {
    frage:
      "Klankspeeltuin: over de zachte bourdon kun je vrij spelen - met D F G J K (pentatonische toonladder). Geen enkele noot kan verkeerd zijn. Vertel een klein verhaal: eerst zacht, dan luid. Na 30 noten geldt de werkplaats als bezocht.",
  },

  kadenzen: {
    schlussFrage: "Twee akkoorden als slot - klinkt dat af, of gaat het verder?",
    schlussWahl: ["Af - een echt slot", "Open - het gaat verder"],
    schlussErklOffen: "Blijven hangen op de dominant (V) klinkt open - een onvolkomen cadens (halve sluiting).",
    schlussErklZu: "Van de dominant terug naar het grondakkoord - dat klinkt af (een volkomen cadens).",
    artFrage: "Welk soort slot is dit?",
    artWahl: [
      "Volkomen - van de dominant (V) naar het grondakkoord",
      "Plagaal - het „Amen“-slot vanuit de subdominant (IV)",
    ],
    artErklPlagal: "IV naar I - het zachte „Amen“-slot (plagaal).",
    artErklAuth: "V naar I - het sterke, volkomen slot.",
    funktionFrage: "Welke taak heeft dit akkoord in C-groot?",
    funktionWahl: ["Tonica (akkoord I)", "Subdominant (akkoord IV)", "Dominant (akkoord V)"],
    funktionErkl: [
      "Tonica (T) - het grondakkoord, akkoord I.",
      "Subdominant (S) - akkoord IV.",
      "Dominant (D) - akkoord V.",
    ],
  },

  komponier: {
    frage:
      "Componeerwerkplaats: schrijf vrij met f d s j k l, luister naar je stuk en bewaar het (tot 5). De werkplaats geldt als bezocht zodra je één stuk hebt bewaard.",
  },

  // --- Wereld 8 „Instrumenten" ----------------------------------------------
  fingersatz: {
    lesenFrage: "Lees de noot en de vingerzetting: welke vinger moet de noot spelen? (De vingerzetting komt NA de noot.)",
    lesenErkl: (finger: string): string => `Het kleine getal na de noot is de ${finger}.`,
    schreibenFrage: (ton: string, finger: string): string =>
      `Schrijf de noot ${ton} en voeg de vingerzetting voor de ${finger} toe - die komt NA de noot.`,
    fingerZelle: (finger: string): string => `${finger} - de vingerzetting`,
    schreibenErkl: (finger: string): string => `De ${finger} krijgt zijn getal direct na de noot.`,
    positionFrage: "Waar komt de vingerzetting - vóór of na de noot?",
    positionWahl: ["Na de noot", "Vóór de noot"],
    positionErkl: "Anders dan het artikulatieteken komt de vingerzetting NA de noot (vóór een overbinding, als die er is).",
  },

  klavier: {
    zweiFrage:
      "Twee regels - boven de rechterhand (violinsleutel), onder de linkerhand (bassleutel). Hoeveel noten speelt de LINKERhand? Met Alt + Q zie en hoor je één hand alleen, in grote weergave.",
    zweiWahl: (n: number): string => `${n} noten`,
    zweiErkl: "Tel de nootkoppen op de onderste regel - of luister naar de lage hand alleen (Alt + Q).",
    handFrage: "Deze regel begint met een handteken. Voor welke hand is het?",
    handWahl: ["Rechterhand", "Linkerhand"],
    handErklLinks: "Punten 4, 5, 6 en dan 3, 4, 5: het teken voor de linkerhand.",
    handErklRechts: "Punten 4, 6 en dan 3, 4, 5: het teken voor de rechterhand.",
    melodieFrage:
      "Twee handen na elkaar: de ene speelt het deuntje (hoger, bewegend), de andere begeleidt laag. Welke was het deuntje?",
    melodieWahl: ["Het eerst gespeelde stuk", "Het tweede stuk"],
    melodieErkl: "Het deuntje is het hogere stuk dat beweegt - meestal de rechterhand.",
    rechteHandFrage: (ton: string): string =>
      `Schrijf het teken voor de rechterhand (punten 4, 6 en dan 3, 4, 5) en daarna de noot ${ton} met zijn octaafteken.`,
    rechteHandZellen: ["rechterhand, eerste cel - punten 4, 6", "rechterhand, tweede cel - punten 3, 4, 5"],
    rechteHandErkl: "Na het handteken begint de partij met een octaafteken.",
    pedalFrage: "Welk pedaalteken is dit - en komt het vóór of na de noot?",
    pedalWahl: ["Pedaal in - VÓÓR de noot", "Pedaal los - NA de noot"],
    pedalErklNieder: "Pedaal in (punten 1, 2, 6 en dan 1, 4) komt vóór de noot waar het pedaal wordt ingedrukt.",
    pedalErklAuf: "Pedaal los (punten 1, 6 en dan 1, 4) komt na de noot waar het pedaal wordt losgelaten.",
  },

  gesang: {
    melismaFrage: "Op de lettergreep „la“ - hoeveel noten zingt de stem? (Meerdere noten op één lettergreep heten een melisme.)",
    melismaWahl: ["Eén noot", "Twee noten", "Drie noten"],
    melismaErkl: (n: number): string =>
      `De lettergreep krijgt ${n} noten - een melisme. In braille verbindt de lettergreepbinding (punten 1, 4) ze.`,
    bogenFrage:
      "Eén lettergreep op twee noten: schrijf de eerste noot, de lettergreepbinding (punten 1, 4) en de tweede noot.",
    bogenZelle: "lettergreepbinding - punten 1, 4",
    bogenErkl: "De lettergreepbinding zegt: beide noten horen bij één lettergreep.",
    atemFrage: "Deze regel heeft een ademteken. Na welke noot adem je?",
    atemWahl: ["Na de eerste noot", "Na de tweede noot", "Na de derde noot"],
    atemErkl: "Het halve ademteken (punten 3, 4, 5 en dan 2) komt direct na de eerste noot.",
    zeilenFrage: "In vocale muziek wisselen regels met woorden en regels met noten elkaar af. Welk voorteken kondigt een regel met WOORDEN aan?",
    zeilenWahl: ["Woordenvoorteken (punten 5, 6 en dan 2, 3)", "Muziekvoorteken (punt 6 en dan punt 3)"],
    zeilenErkl: "De woordenregel heeft het voorteken punten 5, 6 en dan 2, 3; de muziekregel heeft punt 6 en dan punt 3.",
  },

  gitarre: {
    saiteFrage:
      "Het snarenteken (punten 1, 4, 6) en een getal vertellen welke snaar je speelt. Welke snaar is dit?",
    saiteWahl: (s: number): string => `Snaar ${s}`,
    saiteErkl: (s: number): string => `Snarenteken plus het getal ${s}: snaar ${s}.`,
    schreibenFrage: (saite: number, ton: string): string =>
      `Schrijf het teken voor snaar ${saite} en dan de noot ${ton}: eerst het snarenteken (punten 1, 4, 6), dan het getal, dan de noot.`,
    saitenzeichenZelle: "snarenteken - punten 1, 4, 6",
    ziffernZelle: (saite: number): string => `het getal ${saite} - snaar ${saite}`,
    schreibenErkl: "Het snarenteken komt vóór de noot; er volgt GEEN octaafteken.",
    akkordSorten: { dur: "groot akkoord", moll: "klein akkoord", sept: "dominantseptiemakkoord (schuine 7)" },
    akkordFrage:
      "Luister naar het gebroken akkoord - wat voor soort is het? (De cirkel, de driehoek en de schuine 7 zijn internationaal; letteraanduidingen als „C7“ worden in elk land iets anders geschreven.)",
    akkordErkl: (sorte: string): string => `Dat was een ${sorte}.`,
  },

  generalbass: {
    aussetzungFrage:
      "De baston is bezift met een 6. Welke uitwerking klinkt goed - met een sext of met een kwint boven de bas?",
    aussetzungWahl: ["Terts en sext boven de bas", "Terts en kwint boven de bas"],
    aussetzungErklSext: "Een 6 vraagt om de sext boven de bas - het akkoord in de eerste omkering.",
    aussetzungErklQuint: "Zonder cijfers (of met 5/3) klinkt het akkoord in grondpositie, met de kwint.",
    stufeFrage: "De gecijferde bas denkt in akkoorden op de treden van de toonladder. Welk hoofdakkoord hoor je hier?",
    stufeWahl: ["Tonica (akkoord I)", "Subdominant (akkoord IV)", "Dominant (akkoord V)"],
    stufeErkl: [
      "Dat was de tonica (akkoord I) - de brug van de cadensen naar de gecijferde bas.",
      "Dat was de subdominant (akkoord IV) - de brug van de cadensen naar de gecijferde bas.",
      "Dat was de dominant (akkoord V) - de brug van de cadensen naar de gecijferde bas.",
    ],
    schreibenFrage:
      "Schrijf een baston met cijfers: de C en eronder het cijfer 6 (het cijferteken en het lage cijfer 6).",
    zahlzeichenZelle: "cijferteken - punten 3, 4, 5, 6",
    ziffer6Zelle: "het lage cijfer 6 - punten 2, 3, 5",
    schreibenErkl: "De cijfers van de gecijferde bas worden als LAGE cijfers na het cijferteken geschreven.",
  },

  partitur: {
    auftakt: {
      frage: "Een stuk begint met een opmaat. Welk nummer heeft deze eerste, onvolledige maat?",
      wahl: ["Maat 0", "Maat 1", "Maat 2"],
      erkl: "De opmaat telt als maat 0 - de eerste volle maat is dan maat 1.",
    },
    taktzahl: {
      frage: "Zo ziet een maatnummer aan de rand van de regel eruit (hier: 16). Staat er een cijferteken voor?",
      wahl: ["Nee - maatnummers hebben geen cijferteken", "Ja - altijd met een cijferteken"],
      erkl: "Maatnummers in de kantlijn hebben geen cijferteken - alleen de cijfers zelf.",
    },
    format: {
      frage: "Hoe ordent een braille-partituur twee handen of partijen, zodat je ze maat voor maat kunt vergelijken?",
      wahl: ["Deel voor deel, regel boven regel (maat-boven-maat)", "Alles in één lange regel"],
      erkl: "In het maat-boven-maat-formaat liggen de partijen deel voor deel boven elkaar - maat naast maat, makkelijk te lezen.",
    },
    quellen: {
      frage: "Waar kun je kant-en-klare braillemuziek vandaan halen?",
      wahl: ["Uit bibliotheken voor blinde mensen, zoals de Nederlandse Bibliotheek voor blinden (Dedicon)", "Alleen door het zelf over te schrijven"],
      erkl: "Bibliotheken voor blinde mensen, zoals Dedicon in Nederland, bewaren duizenden titels braillemuziek.",
    },
  },

  orchester: {
    familieKlavier: "snaarinstrument (aangeslagen)",
    familieGitarre: "snaarinstrument (getokkeld)",
    familieBlas: "blaasinstrument (geblazen)",
    hoerenFrage: "Luister naar het korte deuntje - tot welke instrumentenfamilie hoort dit klankbeeld?",
    hoerenWahl: ["Snaarinstrumenten - getokkeld of aangeslagen", "Blaasinstrumenten - geblazen", "Membraaninstrumenten - geslagen"],
    hoerenErkl: (instrument: string, familie: string): string => `${instrument}: ${familie}.`,
    fragen: [
      { frage: "Tot welke familie hoort de trom (in het systeem van Hornbostel-Sachs)?", richtig: "Membraaninstrumenten", falsch: ["Snaarinstrumenten", "Blaasinstrumenten"] },
      { frage: "Tot welke familie hoort de viool?", richtig: "Snaarinstrumenten", falsch: ["Blaasinstrumenten", "Membraaninstrumenten"] },
      { frage: "Tot welke familie hoort de blokfluit?", richtig: "Blaasinstrumenten", falsch: ["Membraaninstrumenten", "Zelfklinkende instrumenten"] },
      { frage: "Tot welke familie hoort de triangel?", richtig: "Zelfklinkende instrumenten", falsch: ["Membraaninstrumenten", "Snaarinstrumenten"] },
    ],
    familieErkl: (richtig: string): string => `Juist: ${richtig}.`,
  },

  // --- Wereld 9 „Liedpodium" ------------------------------------------------
  lieder2: {
    dazuWahl: [
      "Het werd luider - een crescendo",
      "De noten werden kort - staccato",
      "De noten vloeiden zacht in elkaar over - legato",
    ],
    dazuDynamikFrage: (titel: string): string => `„${titel}“ - eerst gewoon, dan met expressie. Wat is toegevoegd?`,
    dazuDynamikErkl: "De tweede versie werd luider - een crescendo.",
    dazuStaccatoFrage: (titel: string): string => `„${titel}“ - wat is er bij de gewone versie toegevoegd?`,
    dazuStaccatoErkl: "De noten werden kort en licht - staccato.",
    dazuLegatoFrage: (titel: string): string => `„${titel}“ - wat is er toegevoegd?`,
    dazuLegatoErkl: "De noten werden zacht aaneengesloten - legato, de legatoboog.",
    articFrage: (titel: string): string => `„${titel}“ - gespeeld aaneengesloten (legato) of kort (staccato)?`,
    articWahl: ["Aaneengesloten - legato", "Kort - staccato"],
    articErklLegato: "De noten vloeiden in elkaar over - legato.",
    articErklStaccato: "Elke noot werd kort afgebroken - staccato.",
  },

  lesekonzert: {
    frage:
      "Leesconcert: lees de brailleregel (die wordt NIET voor je gespeeld!), leer hem uit het hoofd en druk op „Klaar met lezen“. Speel de noten daarna uit het hoofd op het toetsenbord.",
    erkl: "Lezen, onthouden, spelen - zo lees je braillemuziek bij een instrument.",
  },

  liederquiz: {
    hoerenFrage: "Luister naar het begin - welk liedje is het?",
    hoerenErkl: (titel: string): string => `Dat was het begin van „${titel}“.`,
    lesenFrage: "Lees de eerste regel in braille - zonder geluid! Welk liedje herken je?",
    lesenErkl: (titel: string): string => `Deze regel is het begin van „${titel}“ - stil lezen met je innerlijke oor.`,
  },

  liedZeile: {
    frage: (titel: string, zeile: number): string =>
      `${titel}, regel ${zeile}: luister eerst, schrijf het dan noot voor noot - nu MET octaaftekens.`,
  },
};
