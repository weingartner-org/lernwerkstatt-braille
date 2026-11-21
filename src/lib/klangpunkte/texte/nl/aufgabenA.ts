/** Bereich `aufgabenA` - Nederlands. */
import type { aufgabenA as De } from "../de/aufgabenA";

export const aufgabenA: typeof De = {
  gemeinsam: {
    taktstrichZelle: "Maatstreep - de spatiebalk",
    zahlzeichen: "het cijferteken",
    obereZahl: (n: number): string => `de ${n} (bovenste getal)`,
    tiefeZahl: (n: number): string => `de ${n} als verlaagd getal`,
    schlagzahl: (b: number): string => String(b),
  },
  hilfe: {
    schreibNote: (ton: string, wert: string): string => `Schrijf: ${ton} - ${wert}.`,
    welcheNote: "Welke noot is dit? Luister goed en voel de cel.",
    dasWar: (ton: string, wert: string): string => `Dat was ${ton} - ${wert}.`,
  },
  kp1: {
    zweiHoeher: "Twee noten. Welke was hoger?",
    dreiHoechster: "Drie noten. Welke was de hoogste?",
    ordinale: ["De eerste", "De tweede", "De derde"],
    hoechsterErklaer: (i: number): string => `De ${["eerste", "tweede", "derde"][i]} noot was de hoogste.`,
    leiter: "Een kleine toonladder. Gaat hij omhoog of omlaag?",
    leiterWahl: ["Omhoog", "Omlaag"],
    leiterRauf: "Hij ging omhoog.",
    leiterRunter: "Hij ging omlaag.",
  },
  kp2: {
    prompt: (len: number): string => `Luister naar het ritme en tik het na op de spatiebalk - ${len} tellen.`,
  },
  kp3: {
    grundform: " (De basisvorm is de achtste noot.)",
  },
  kp4: {
    prompt: "Luister naar het liedje en schrijf het noot voor noot.",
  },
  kp5: {
    viertelHinweis: " (Kwartnoot = punt 6 erbij - net als punt 3 voor de letters k tot t.)",
    melodie: "Schrijf het liedje - allemaal kwartnoten.",
    frage: "Achtste of kwartnoot?",
    wahl: ["Achtste noot", "Kwartnoot"],
    erklaerAchtel: "Geen extra punt onderaan: een achtste noot.",
    erklaerViertel: "Met punt 6 erbij: een kwartnoot.",
  },
  kp6: {
    halbeHinweis: " (Halve noot = punt 3 erbij.)",
    ganzeHinweis: " (Hele noot = punten 3 en 6 erbij.)",
    frage: "Welke notenwaarde is dit?",
    erklaer: (wert: string): string => `Het was een ${wert}.`,
  },
  kp7: {
    schreibPause: (pause: string): string => `Schrijf: ${pause}.`,
    taktart: "Welke maatsoort is dit?",
    taktartErklaer: (a: number, b: number): string =>
      `Het was ${a}/${b}-maat: cijferteken, ${a} boven, ${b} eronder als verlaagd getal.`,
    taktstrich: (ton1: string, ton2: string): string =>
      `Schrijf: ${ton1} halve noot, maatstreep (spatiebalk), ${ton2} halve noot.`,
    taktstrichErklaer: "In braille is de maatstreep een spatie.",
  },
  kp8: {
    prompt: (ton: string, wert: string): string =>
      `Schrijf: ${ton} - gepunte ${wert}. (De punt die een noot langer maakt is punt 3 in een EIGEN cel.)`,
    punktZelle: "de punt die de noot langer maakt - punt 3",
  },
  kp9: {
    prompt: (vorzeichen: string, ton: string): string =>
      `Schrijf: ${vorzeichen}, dan ${ton} als kwartnoot. (Het voorteken staat meteen VOOR de noot.)`,
  },
  kp10: {
    lage: "In welk octaaf klinkt dit?",
    lageWahl: ["Laag (derde octaaf)", "Midden (vierde octaaf)", "Hoog (vijfde octaaf)"],
    lageErklaer: (oktave: string): string => `Dat was het ${oktave}.`,
    schreib: (ton: string, oktave: string): string =>
      `Schrijf ${ton} in het ${oktave} als EERSTE noot van een stuk, een kwartnoot. (Eerst het octaafteken, dan de noot.)`,
    zeichenZelle: (oktave: string): string => `het octaafteken voor het ${oktave}`,
  },
  kp11: {
    gleich: "dezelfde noot",
    sekundeTerz: "een secunde of een terts",
    quarteQuinte: "een kwart of een kwint",
    sexteMehr: "een sext of meer",
    regelKlein: "Een secunde of een terts heeft NOOIT een octaafteken nodig.",
    regelMittel: "Een kwart of een kwint heeft ALLEEN een octaafteken als het octaaf verandert.",
    regelGross: "Vanaf een sext omhoog heeft de noot ALTIJD een octaafteken nodig.",
    prompt: (ton1: string, oktave1: string, ton2: string, oktave2: string): string =>
      `Eerste noot: ${ton1}, ${oktave1}. Dan: ${ton2}, ${oktave2}. Heeft de tweede noot een octaafteken nodig?`,
    wahl: ["Ja", "Nee"],
    erklaer: (sprung: string, regel: string): string => `De sprong is ${sprung}. ${regel}`,
  },
  kp12: {
    grossPrompt: "In 4/4-maat vult ÉÉN enkele cel de hele maat. Hele noot of zestiende noot?",
    grossWahl: ["Een hele noot", "Een zestiende noot"],
    grossErklaer:
      "Een enkele cel die vier tellen moet vullen is de LANGE noot: de hele noot. Een zestiende noot zou veel te kort zijn.",
    kleinPrompt: "In 2/4-maat staan ACHT gelijke cellen na elkaar. Hele noten of zestiende noten?",
    kleinWahl: ["Hele noten", "Zestiende noten"],
    kleinErklaer:
      "Acht hele noten zouden nooit in twee tellen passen - het moeten de KORTE noten zijn: zestiende noten. De maatsoort en de context beslissen.",
  },
  kp13: {
    similePrompt: "Schrijf het braille-herhalingsteken voor de maat (speel de hele maat nog eens).",
    simileZelle: "het herhalingsteken voor de maat - punten 2, 3, 5, 6",
    simileErklaer: "Deze verkorting bestaat alleen in braille - slimmer dan in druk!",
    startPrompt: "Schrijf: het BEGIN van een herhaling (twee cellen).",
    startZellen: ["eerste cel - punten 1, 2, 6", "tweede cel - punten 2, 3, 5, 6"],
    endePrompt: "Schrijf: het EIND van een herhaling (twee cellen).",
    endeZellen: ["eerste cel - punten 1, 2, 6", "tweede cel - punten 2, 3"],
    schluss: "De slotmaatstreep (einde van het stuk)",
    anfang: "Begin van de herhaling",
    ende: "Einde van de herhaling",
    erkennenPrompt: "Welk vormteken is dit?",
    erkannt: (zeichen: string): string => `Het was: ${zeichen}.`,
  },
  haltebogen: {
    hoerenPrompt: "Twee halve noten op dezelfde toon. Eén keer gespeeld of twee keer?",
    hoerenWahl: ["Eén keer - gebonden", "Twee keer - apart"],
    hoerenGebunden: "Maar één aanslag: de overbinding voegt de twee noten samen tot ÉÉN lange noot.",
    hoerenGetrennt: "Twee aanslagen: hier was geen overbinding - elke noot begint opnieuw.",
    schreibPrompt: (ton: string): string =>
      `Schrijf: ${ton} halve noot, overbinding (twee cellen: punt 4, dan punten 1 en 4), dan weer ${ton} halve noot.`,
    zelle1: "overbinding, eerste cel - punt 4",
    zelle2: "overbinding, tweede cel - punten 1, 4",
    klingtWeiter: (note: string): string => `${note} - klinkt door, zonder nieuwe aanslag`,
    schreibErklaer: "De overbinding komt meteen NA de eerste noot.",
    taktPrompt: (ton: string): string =>
      `Overbinding over de maatstreep: ${ton} halve noot, overbinding, maatstreep (spatiebalk), ${ton} halve noot.`,
    taktErklaer: "Zo klinkt een noot door over de maatstreep heen.",
  },
  auftakt: {
    vollPrompt: (a: number, b: number): string =>
      `${a}/${b}-maat. Luister naar de maat en tel mee: is hij compleet?`,
    vollWahl: ["Compleet", "Onvolledig - een opmaat of een onvolledige maat"],
    vollJa: (ziel: string): string => `Het klopt precies: ${ziel} tellen.`,
    vollNein: (summe: string, ziel: string): string =>
      `Er ontbreekt iets: er zijn maar ${summe} van de ${ziel} tellen - een onvolledige maat. Aan het begin van een stuk heet dat een opmaat.`,
    bindestrichPrompt: "De maat is aan het eind van de regel nog niet af. Schrijf het muziekstreepje (punt 5).",
    bindestrichZelle: "het muziekstreepje - punt 5",
    bindestrichErklaer: "Punt 5 aan het eind van een regel zegt: deze maat gaat verder op de volgende regel.",
    schreibPrompt: (ton: string): string =>
      `Schrijf de opmaat: ${ton} kwartnoot, maatstreep (spatiebalk), dan de volle maat.`,
    auftaktZelle: (note: string): string => `${note} - de opmaat`,
    schreibErklaer: "Een opmaat is een onvolledige eerste maat - hij wordt net zo geschreven als elke andere.",
  },
  pausen2: {
    vielePrompt: (n: number): string => `Schrijf: ${n} maten rust - cijferteken, de ${n}, dan de hele rust.`,
    zahlzeichenZelle: "het cijferteken - punten 3, 4, 5, 6",
    zahlZelle: (n: number): string => `het getal ${n}`,
    ganzePauseZelle: "de hele rust - punten 1, 3, 4",
    vieleErklaer: "Vanaf vier lege maten schrijft braille het aantal als getal vóór de hele rust.",
    kleinPrompt: (n: number): string =>
      `Schrijf: ${n} lege maten - tot drie maten schrijf je gewoon de hele rust ${n === 2 ? "twee" : "drie"} keer.`,
    kleinZelle: (i: number): string => `hele rust ${i} - één hele lege maat`,
    kleinErklaer: "De hele rust vult ALTIJD een hele maat - welke maatsoort het ook is.",
    lesenPrompt: "Hoeveel stille maten zijn er?",
    takte: (n: number): string => `${n} maten`,
    lesenKlein: (n: number): string => `${n} hele rusten na elkaar = ${n} lege maten.`,
    lesenGross: (n: number): string => `Cijferteken + ${n} + hele rust = ${n} maten stilte in één keer.`,
    stillePrompt: "Drie maten - één ervan is helemaal stil. Waar?",
    stilleWahl: ["Aan het begin", "In het midden", "Aan het eind"],
    stilleErklaer: (i: number): string =>
      `De stilte was ${["aan het begin", "in het midden", "aan het eind"][i]} - een hele maat rust.`,
  },
  tonart: {
    keyNames: {
      kreuz: ["G-groot", "D-groot", "A-groot", "E-groot"],
      be: ["F-groot", "B-groot", "Es-groot", "As-groot"],
    },
    kreuz: "kruis",
    be: "mol",
    kreuze: "kruizen",
    bes: "mollen",
    lesenPrompt: (mehrzahl: string): string =>
      `Deze toonsoort staat aan het begin van het stuk. Hoeveel ${mehrzahl} zijn er?`,
    lesenErklaer: (n: number, name: string, tonart: string, ab4: boolean): string =>
      `${n} ${name} - de toonsoort van ${tonart}. ${
        ab4 ? "Vanaf vier staat het getal ervoor." : "Tot drie wordt het teken gewoon herhaald."
      }`,
    schreibKlein: (n: number, name: string, zeichen: string): string =>
      `Schrijf de toonsoort: ${n} ${name} - schrijf gewoon het teken ${zeichen} ${n === 1 ? "één keer" : n === 2 ? "twee keer" : "drie keer"}.`,
    schreibGross: (n: number, mehrzahl: string, zeichen: string): string =>
      `Schrijf de toonsoort: ${n} ${mehrzahl} - vanaf vier met een cijferteken: cijferteken, de ${n}, dan het ${zeichen}.`,
    zeichenZelle: (name: string, i: number, punkte: string): string => `${name} ${i} - punten ${punkte}`,
    zahlzeichenZelle: "het cijferteken - punten 3, 4, 5, 6",
    zahlZelle: (n: number): string => `het getal ${n}`,
    dasZeichen: (name: string): string => `het ${name}`,
    istVorzeichnung: (tonart: string): string => `Dat is de toonsoort van ${tonart}.`,
    kopfPrompt: (n: number, name: string, a: number, b: number): string =>
      `Schrijf het begin van een stuk: eerst de toonsoort (${n} ${name}), direct daarna de maatsoort ${a}/${b} - zonder spatie ertussen.`,
    kopfZelle: (name: string, i: number): string => `${name} ${i}`,
    kopfErklaer: "Toonsoort en maatsoort staan samen aan het begin van een stuk - eerst de toonsoort, dan de maatsoort.",
    regelPrompt: "De toonsoort aan het begin van een stuk - hoe lang geldt hij?",
    regelWahl: ["Voor het hele stuk", "Alleen voor de eerste maat", "Alleen voor de eerste noot"],
    regelErklaer:
      "De toonsoort geldt voor het hele stuk - een voorteken midden in een maat geldt echter alleen tot de maatstreep.",
  },
  taktwechsel: {
    sonderPrompt: "Welke maatsoort is dit?",
    sonderWahl: ["C - gewone maat (vier kwarttellen)", "Alla breve - halve maat (twee halve-noottellen)", "3/4-maat"],
    sonderErklaerC: "Punten 4, 6 vóór de c: de C van de gewone maat.",
    sonderErklaerAb: "Punten 4, 5, 6 vóór de c: alla breve - de halve noten dragen de tel.",
    sonderSchreibenC: "Schrijf het C-maatteken: punten 4 en 6, dan de c (punten 1, 4).",
    sonderSchreibenAb: "Schrijf alla breve: punten 4, 5 en 6, dan de c (punten 1, 4).",
    vorzeichenC: "het teken - punten 4, 6",
    vorzeichenAb: "het teken - punten 4, 5, 6",
    dasC: "de c - punten 1, 4",
    wechselPrompt: "Na een paar noten staat er een TWEEDE maatsoort. Wat betekent dat?",
    wechselWahl: (a: number, b: number): string[] => [
      `De maatsoort verandert naar ${a}/${b}`,
      "De toonsoort verandert",
      "Het stuk is afgelopen",
    ],
    wechselErklaer: (a: number, b: number): string =>
      `Een nieuwe maatsoort midden in een stuk betekent: vanaf hier geldt ${a}/${b}-maat.`,
    wechselSchreiben: (a: number, b: number): string =>
      `De maatsoort verandert midden in het stuk: schrijf een maatstreep (spatiebalk), dan de nieuwe maatsoort ${a}/${b}.`,
  },
  schluessel: {
    lesenPrompt: "Welke sleutel is dit (drie cellen)?",
    lesenErklaer: (schluessel: string): string =>
      `Het was de ${schluessel}. Alle sleutels beginnen met punten 3, 4, 5 en eindigen met punten 1, 2, 3 - de middelste cel maakt het verschil.`,
    mitteViolin: "punten 3, 4",
    mitteBass: "punten 3, 4, 5, 6",
    schreibPrompt: (schluessel: string, mitte: string): string =>
      `Schrijf de ${schluessel} - drie cellen: punten 3, 4, 5 · ${mitte} · punten 1, 2, 3.`,
    ankuendigung: "het begin van de sleutel - punten 3, 4, 5",
    gZeichen: "het G-teken - punten 3, 4",
    fZeichen: "het F-teken - punten 3, 4, 5, 6",
    abschluss: "het slot - punten 1, 2, 3",
    wissenPrompt: "Heeft braillemuziek sleutels nodig om de toonhoogte te bepalen?",
    wissenWahl: ["Nee - de octaaftekens vertellen het octaaf", "Ja - zonder sleutel werkt niets"],
    wissenErklaer:
      "In braille geven de sleuteltekens alleen informatie over de gedrukte pagina - het octaaf wordt altijd door de octaaftekens bepaald.",
  },
  sechzehntel: {
    hoerenPrompt: "Een korte loop. Achtste noten - of de zestiende noten, die twee keer zo snel zijn?",
    hoerenWahl: ["Achtste noten", "Zestiende noten"],
    hoerenSchnell: "Dat waren zestiende noten - vier per tel.",
    hoerenLangsam: "Dat waren achtste noten - twee per tel.",
    gruppePrompt:
      "Schrijf de groep van vier zestiende noten: alleen de EERSTE noot krijgt punten 3 en 6, de andere drie schrijf je als achtste noten (groepering).",
    ersteZelle: (ton: string): string => `${ton} als zestiende noot - met punten 3 en 6`,
    andereZelle: (ton: string): string => `${ton} - geschreven als achtste noot (hoort bij de groep)`,
    gruppeErklaer: "Groepering maakt snelle loopjes makkelijk te lezen: de lengtepunten komen alleen op de eerste noot van de groep.",
    regelPrompt:
      "Vier zestiende noten in één tel, als groep geschreven: hoeveel cellen dragen de lengtepunten 3 en 6?",
    regelWahl: ["Alleen de eerste", "Alle vier", "De eerste en de laatste"],
    regelErklaer:
      "Alleen de eerste noot van de groep toont de lengte - de rest ziet eruit als achtste noten. Dit is de brailletegenhanger van de bij elkaar getrokken groep in druk.",
    einzelnPrompt: (ton: string): string =>
      `Schrijf: ${ton} als zestiende noot. (Let op - het is dezelfde cel als de hele noot; de maatsoort beslist!)`,
  },
  triolen: {
    hoerenPrompt: "Tussen twee gelijke tellen: hoeveel noten delen ÉÉN tel - twee of drie?",
    hoerenWahl: ["Twee - gewone achtste noten", "Drie - een triool"],
    hoerenTriole: "Drie even lange noten in één tel: een triool.",
    hoerenZwei: "Twee achtste noten - de gewone verdeling.",
    schreibPrompt: "Schrijf het triool: eerst het trioolteken (punten 2, 3), dan de drie achtste noten.",
    triolenZeichen: "het trioolteken - punten 2, 3",
    achtelZelle: (ton: string): string => `${ton}, achtste noot - een derde van de tel`,
    schreibErklaer: "Het trioolteken komt ÉÉN keer vóór de groep - het maakt van twee achtste noten er drie.",
    lesenPrompt: "Vóór drie achtste noten staat deze eerste cel (punten 2, 3). Wat betekent dat?",
    lesenWahl: ["Een triool - drie noten in één tel", "Een achtste rust", "Een octaafteken"],
    lesenErklaer: "Punten 2, 3 vóór een groep noten = triool.",
  },
  puls: {
    klopfPrompt: (n: number): string =>
      `Voel de gelijkmatige tel en tik hem netjes op de spatiebalk - ${n} tellen lang.`,
    metrumPrompt: "Luister naar de beklemtoonde tellen: marcheert dit in tweeën of wiegt het in drieën?",
    metrumWahl: ["Mars - in tweeën", "Wals - in drieën"],
    metrumDrei: "Elke eerste van drie tellen is beklemtoond: een drie - de wals.",
    metrumZwei: "Elke eerste van twee tellen is beklemtoond: een twee - de mars.",
    abstandPrompt: "Tel de tellen van de ene beklemtoning tot de volgende: hoeveel zijn het er?",
    abstandWahl: ["2 tellen", "3 tellen", "4 tellen"],
    abstandErklaer: (n: number): string => `Van beklemtoning tot beklemtoning zijn het ${n} tellen - ${n}/4-maat.`,
  },
  dauer: {
    vergleichPrompt: "Twee noten, de ene na de andere. Welke klonk langer?",
    vergleichWahl: ["De eerste", "De tweede"],
    vergleichErster: "De eerste was een halve noot - twee keer zo lang als de kwartnoot erna.",
    vergleichZweiter: "De tweede was een halve noot - twee keer zo lang als de kwartnoot ervoor.",
    schlaegePrompt: "Eerst twee tellen van de puls, dan één lange noot: hoeveel tellen duurde hij?",
    schlaegeWahl: ["1 tel - een kwartnoot", "2 tellen - een halve noot", "4 tellen - een hele noot"],
    schlaegeErklaer: (wert: string, zahl: number): string =>
      `Dat was een ${wert} - ${zahl} ${zahl === 1 ? "tel" : "tellen"} lang.`,
    paarPrompt: "Twee noten: even lang - of de tweede twee keer zo lang?",
    paarWahl: ["Even lang", "De tweede twee keer zo lang"],
    paarGleich: "Twee kwartnoten van dezelfde lengte.",
    paarDoppelt: "Eerst een kwartnoot, dan een halve noot - twee keer zo lang.",
  },
  dynamik: {
    lautPrompt: "Luister naar de korte frase: hard of zacht gespeeld?",
    lautWahl: ["Luid", "Zacht"],
    lautErklaer: "Krachtig gespeeld - later noem je dit forte.",
    leiseErklaer: "Heel zacht gespeeld - later noem je dit piano.",
    rampePrompt: "Wordt de frase steeds luider of steeds zachter?",
    rampeWahl: ["Luider", "Zachter"],
    cresc: "Van zacht naar luid - later heet dit crescendo.",
    decresc: "Van luid naar zacht - later heet dit decrescendo.",
    akzentPrompt: "Eén noot is er extra beklemtoond. Waar was hij?",
    akzentWahl: ["Aan het begin", "In het midden", "Aan het eind"],
    akzentErklaer: (i: number): string =>
      `De beklemtoonde noot was ${["aan het begin", "in het midden", "aan het eind"][i]}.`,
  },
  inst: {
    merk: {
      klavier: "Piano - aangeslagen, een heldere aanslag die doorklinkt.",
      gitarre: "Gitaar - getokkeld, pokkend en snarig.",
      sax: "Saxofoon - geblazen, zacht en riedig.",
      floete: "Fluit - geblazen, zacht en helder.",
    },
    hoerenPrompt: "Welk instrument speelt hier?",
    vergleichPrompt: "Twee kleine deuntjes, de ene na de andere: hetzelfde instrument of verschillende?",
    vergleichWahl: ["Hetzelfde instrument", "Verschillende instrumenten"],
    vergleichGleich: "Beide deuntjes kwamen van hetzelfde instrument.",
    vergleichErklaer: (a: string, b: string): string => `Eerst ${a}, dan ${b}.`,
    zuerstPrompt: "Twee instrumenten, de ene na de andere. Welke speelde eerst?",
    zuerstErklaer: (a: string): string => `Eerst kwam de ${a}.`,
  },
  echo: {
    prompt: (len: number): string =>
      `Echospel: luister naar de ${len} noten en speel ze na op het toetsenbord - de toetsen D F G H J K L zijn de noten C D E F G A B. Alleen de volgorde van de noten telt; het ritme is vrij.`,
    erklaer: "Speel de noten na in de volgorde waarin je ze hoorde.",
  },
  memory: {
    prompt:
      "Melodiegeheugen: ik speel een reeks noten en jij speelt hem na (de toetsen D F G H J K L zijn de noten C D E F G A B). Lukt het, dan komt er één noot bij - hoe ver kom je?",
  },
};
