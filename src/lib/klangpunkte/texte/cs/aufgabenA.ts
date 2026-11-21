/**
 * Bereich `aufgabenA` - Čeština. Úlohy z `etappen.ts`: kp1 až kp13, druhý stupeň
 * (vázací oblouk až triola) a svět 1 „Bystrá ouška". Kinder: „ty".
 * Fachwörter aus `tonnamen.ts` Eintrag `cs`; Mehrzahl 1 / 2-4 / 5+; keine feste Präposition
 * vor einem Platzhalter. Unsichere Wörter stehen im Bericht unter „Unsicher".
 */
import type { aufgabenA as De } from "../de/aufgabenA";
import { jednotkaCs } from "./musik";

/** Tvar podstatného jména podle počtu: 1 · 2-4 · 0 a 5+. */
const tvarCs = (n: number, one: string, few: string, many: string): string =>
  n === 1 ? one : n >= 2 && n <= 4 ? few : many;

/** „křížky" -> „křížků" (2. pád množného čísla) pro otázku „Kolik ...?". */
const KOLIK_CS: Record<string, string> = { "křížky": "křížků", "béčka": "béček" };

export const aufgabenA: typeof De = {
  gemeinsam: {
    taktstrichZelle: "taktová čára - mezerník",
    zahlzeichen: "číselný znak",
    obereZahl: (n: number): string => `číslo ${n} (horní číslo)`,
    tiefeZahl: (n: number): string => `číslo ${n} jako dolní číslo`,
    schlagzahl: (b: number): string => (Number.isInteger(b) ? String(b) : String(b).replace(".", ",")),
  },
  hilfe: {
    schreibNote: (ton: string, wert: string): string => `Napiš: ${ton} - ${wert}.`,
    welcheNote: "Která nota to je? Poslouchej a ohmatej buňku.",
    dasWar: (ton: string, wert: string): string => `Bylo to ${ton} - ${wert}.`,
  },
  kp1: {
    zweiHoeher: "Dva tóny. Který byl vyšší?",
    dreiHoechster: "Tři tóny. Který byl nejvyšší?",
    ordinale: ["První", "Druhý", "Třetí"],
    hoechsterErklaer: (i: number): string =>
      `${["První", "Druhý", "Třetí"][i]} tón byl nejvyšší.`,
    leiter: "Malá stupnice. Jde nahoru, nebo dolů?",
    leiterWahl: ["Nahoru", "Dolů"],
    leiterRauf: "Šla nahoru.",
    leiterRunter: "Šla dolů.",
  },
  kp2: {
    prompt: (len: number): string =>
      `Poslechni si rytmus a vyťukej ho mezerníkem - ${len} ${tvarCs(len, "úder", "údery", "úderů")}.`,
  },
  kp3: {
    grundform: " (Základní tvar je osminová nota.)",
  },
  kp4: {
    prompt: "Poslechni si melodii a napiš ji notu po notě.",
  },
  kp5: {
    viertelHinweis: " (Čtvrťová = přidej bod 6 - jako bod 3 u písmen k až t.)",
    melodie: "Napiš melodii - samé čtvrťové noty.",
    frage: "Osminová, nebo čtvrťová?",
    wahl: ["Osminová nota", "Čtvrťová nota"],
    erklaerAchtel: "Bez přidaného bodu dole: osminová nota.",
    erklaerViertel: "S přidaným bodem 6: čtvrťová nota.",
  },
  kp6: {
    halbeHinweis: " (Půlová = přidej bod 3.)",
    ganzeHinweis: " (Celá = přidej body 3 a 6.)",
    frage: "Jaká je to hodnota noty?",
    erklaer: (wert: string): string => `Byla to ${wert}.`,
  },
  kp7: {
    schreibPause: (pause: string): string => `Napiš: ${pause}.`,
    taktart: "Jaké taktové označení tu stojí?",
    taktartErklaer: (a: number, b: number): string =>
      `Byl to takt ${a}/${b}: číselný znak, ${a} nahoře, ${b} jako dolní číslo dole.`,
    taktstrich: (ton1: string, ton2: string): string =>
      `Napiš: ${ton1} půlová, taktová čára (mezerník), ${ton2} půlová.`,
    taktstrichErklaer: "Taktová čára je v Braillově písmu mezera.",
  },
  kp8: {
    prompt: (ton: string, wert: string): string =>
      `Napiš: ${ton} - ${wert} s tečkou. (Prodlužovací tečka je bod 3 ve VLASTNÍ buňce.)`,
    punktZelle: "prodlužovací tečka - bod 3",
  },
  kp9: {
    prompt: (vorzeichen: string, ton: string): string =>
      `Napiš: ${vorzeichen}, potom ${ton} jako čtvrťovou notu. (Posuvka stojí hned PŘED notou.)`,
  },
  kp10: {
    lage: "V jaké poloze to zní?",
    lageWahl: ["Nízko (malá oktáva)", "Uprostřed (jednočárkovaná)", "Vysoko (dvoučárkovaná)"],
    lageErklaer: (oktave: string): string => `Byla to ${oktave}.`,
    schreib: (ton: string, oktave: string): string =>
      `Napiš jako PRVNÍ notu skladby: ${ton}, ${oktave}, čtvrťová nota. (Nejdřív oktávový znak, potom nota.)`,
    zeichenZelle: (oktave: string): string => `oktávový znak - ${oktave}`,
  },
  kp11: {
    gleich: "stejná nota",
    sekundeTerz: "sekunda nebo tercie",
    quarteQuinte: "kvarta nebo kvinta",
    sexteMehr: "sexta nebo víc",
    regelKlein: "Sekunda a tercie NIKDY nepotřebují oktávový znak.",
    regelMittel: "Kvarta a kvinta ho potřebují JEN tehdy, když se mění oktáva.",
    regelGross: "Od sexty potřebuje nota oktávový znak VŽDYCKY.",
    prompt: (ton1: string, oktave1: string, ton2: string, oktave2: string): string =>
      `První nota: ${ton1}, ${oktave1}. Potom: ${ton2}, ${oktave2}. Potřebuje druhá nota oktávový znak?`,
    wahl: ["Ano", "Ne"],
    erklaer: (sprung: string, regel: string): string => `Skok: ${sprung}. ${regel}`,
  },
  kp12: {
    grossPrompt: "V taktu 4/4 vyplní JEDNA jediná buňka celý takt. Celá nota, nebo šestnáctinová?",
    grossWahl: ["Celá nota", "Šestnáctinová nota"],
    grossErklaer:
      "Jediná buňka, která má vyplnit čtyři doby, je VELKÁ hodnota: celá nota. Šestnáctinová by byla moc krátká.",
    kleinPrompt: "V taktu 2/4 stojí OSM stejných buněk za sebou. Celé noty, nebo šestnáctinové?",
    kleinWahl: ["Celé noty", "Šestnáctinové noty"],
    kleinErklaer:
      "Osm celých not se nikdy nevejde do dvou dob - musí to být MALÉ hodnoty: šestnáctinové. Rozhoduje takt a souvislosti.",
  },
  kp13: {
    similePrompt: "Napiš braillský znak opakování taktu (celý takt zahrát ještě jednou).",
    simileZelle: "znak opakování taktu - body 2, 3, 5, 6",
    simileErklaer: "Tahle zkratka existuje jen v Braillově písmu - chytřejší než tištěné noty!",
    startPrompt: "Napiš: ZAČÁTEK repetice (dvě buňky).",
    startZellen: ["první buňka - body 1, 2, 6", "druhá buňka - body 2, 3, 5, 6"],
    endePrompt: "Napiš: KONEC repetice (dvě buňky).",
    endeZellen: ["první buňka - body 1, 2, 6", "druhá buňka - body 2, 3"],
    schluss: "Závěrečná čára (konec skladby)",
    anfang: "Začátek repetice",
    ende: "Konec repetice",
    erkennenPrompt: "Který znak formy to je?",
    erkannt: (zeichen: string): string => `Bylo to: ${zeichen}.`,
  },
  haltebogen: {
    hoerenPrompt: "Dvě půlové noty na stejném tónu. Zahrané jednou, nebo dvakrát?",
    hoerenWahl: ["Jednou - spojené (vázací oblouk)", "Dvakrát - oddělené"],
    hoerenGebunden: "Jen jeden úhoz: vázací oblouk spojí dvě noty do JEDNOHO dlouhého tónu.",
    hoerenGetrennt: "Dva úhozy: tady nebyl vázací oblouk - každá nota začíná znovu.",
    schreibPrompt: (ton: string): string =>
      `Napiš: ${ton} půlová, vázací oblouk (dvě buňky: bod 4, potom 1 a 4), ještě jednou ${ton} půlová.`,
    zelle1: "vázací oblouk, první buňka - bod 4",
    zelle2: "vázací oblouk, druhá buňka - body 1, 4",
    klingtWeiter: (note: string): string => `${note} - zní dál, bez nového úhozu`,
    schreibErklaer: "Vázací oblouk stojí hned ZA první notou.",
    taktPrompt: (ton: string): string =>
      `Spojit přes taktovou čáru: ${ton} půlová, vázací oblouk, taktová čára (mezerník), ${ton} půlová.`,
    taktErklaer: "Tak zní tón dál i přes taktovou čáru.",
  },
  auftakt: {
    vollPrompt: (a: number, b: number): string =>
      `Takt ${a}/${b}. Poslechni si takt a počítej: je úplný?`,
    vollWahl: ["Úplný", "Neúplný - předtaktí nebo neúplný takt"],
    vollJa: (ziel: string): string => `Vychází přesně: ${ziel} ${jednotkaCs(ziel, "doba")}.`,
    vollNein: (summe: string, ziel: string): string =>
      `Něco chybí: jen ${summe} ${jednotkaCs(summe, "doba")}, plný takt má ${ziel} ${jednotkaCs(ziel, "doba")} - neúplný takt. Na začátku skladby se mu říká předtaktí.`,
    bindestrichPrompt: "Takt na konci řádku ještě není hotový. Napiš hudební spojovník (bod 5).",
    bindestrichZelle: "hudební spojovník - bod 5",
    bindestrichErklaer: "Bod 5 na konci řádku říká: tento takt pokračuje na dalším řádku.",
    schreibPrompt: (ton: string): string =>
      `Napiš předtaktí: ${ton} čtvrťová, taktová čára (mezerník), potom celý takt.`,
    auftaktZelle: (note: string): string => `${note} - předtaktí`,
    schreibErklaer: "Předtaktí je neúplný první takt - píše se úplně normálně.",
  },
  pausen2: {
    vielePrompt: (n: number): string =>
      `Napiš pomlku přes více taktů (počet taktů: ${n}) - číselný znak, číslo ${n}, potom celá pomlka.`,
    zahlzeichenZelle: "číselný znak - body 3, 4, 5, 6",
    zahlZelle: (n: number): string => `číslo ${n}`,
    ganzePauseZelle: "celá pomlka - body 1, 3, 4",
    vieleErklaer: "Od čtyř prázdných taktů píše Braillovo písmo počet jako číslo před celou pomlku.",
    kleinPrompt: (n: number): string =>
      `Napiš: ${n} ${tvarCs(n, "prázdný takt", "prázdné takty", "prázdných taktů")} - do tří taktů prostě celou pomlku ${n === 2 ? "dvakrát" : "třikrát"}.`,
    kleinZelle: (i: number): string => `celá pomlka ${i} - jeden celý prázdný takt`,
    kleinErklaer: "Celá pomlka vyplní VŽDYCKY celý takt - v jakémkoli taktovém označení.",
    lesenPrompt: "Kolik tichých taktů tu stojí?",
    takte: (n: number): string => `${n} ${tvarCs(n, "takt", "takty", "taktů")}`,
    lesenKlein: (n: number): string =>
      `${n} ${tvarCs(n, "celá pomlka", "celé pomlky", "celých pomlk")} za sebou = ${n} ${tvarCs(n, "prázdný takt", "prázdné takty", "prázdných taktů")}.`,
    lesenGross: (n: number): string =>
      `Číselný znak + ${n} + celá pomlka = ${n} ${tvarCs(n, "takt ticha", "takty ticha", "taktů ticha")} v kuse.`,
    stillePrompt: "Tři takty - jeden z nich je úplně tichý. Který?",
    stilleWahl: ["Na začátku", "Uprostřed", "Na konci"],
    stilleErklaer: (i: number): string =>
      `Ticho bylo ${["na začátku", "uprostřed", "na konci"][i]} - celý takt pomlka.`,
  },
  tonart: {
    keyNames: {
      kreuz: ["G dur", "D dur", "A dur", "E dur"],
      be: ["F dur", "B dur", "Es dur", "As dur"],
    },
    kreuz: "křížek",
    be: "béčko",
    kreuze: "křížky",
    bes: "béčka",
    lesenPrompt: (mehrzahl: string): string =>
      `Na začátku skladby stojí toto předznamenání. Kolik je tam ${KOLIK_CS[mehrzahl] ?? mehrzahl}?`,
    lesenErklaer: (n: number, name: string, tonart: string, ab4: boolean): string =>
      `${n} ${name} - předznamenání tóniny ${tonart}. ${
        ab4 ? "Od čtyř stojí počet před znakem jako číslo." : "Do tří se znak prostě opakuje."
      }`,
    schreibKlein: (n: number, name: string, zeichen: string): string =>
      `Napiš předznamenání: ${n} ${name} - ${zeichen} prostě napiš ${n === 1 ? "jednou" : n === 2 ? "dvakrát" : "třikrát"}.`,
    schreibGross: (n: number, mehrzahl: string, zeichen: string): string =>
      `Napiš předznamenání: ${n} ${mehrzahl} - od čtyř s číselným znakem: číselný znak, číslo ${n}, potom ${zeichen}.`,
    zeichenZelle: (name: string, i: number, punkte: string): string => `${name} ${i} - body ${punkte}`,
    zahlzeichenZelle: "číselný znak - body 3, 4, 5, 6",
    zahlZelle: (n: number): string => `číslo ${n}`,
    dasZeichen: (name: string): string => `${name}`,
    istVorzeichnung: (tonart: string): string => `To je předznamenání tóniny ${tonart}.`,
    kopfPrompt: (n: number, name: string, a: number, b: number): string =>
      `Napiš hlavičku skladby: nejdřív předznamenání (${n} ${name}), hned za ním taktové označení ${a}/${b} - bez mezery mezi nimi.`,
    kopfZelle: (name: string, i: number): string => `${name} ${i}`,
    kopfErklaer: "Tónina a taktové označení stojí spolu na začátku skladby - nejdřív předznamenání, potom takt.",
    regelPrompt: "Předznamenání na začátku skladby - jak dlouho platí?",
    regelWahl: ["Pro celou skladbu", "Jen pro první takt", "Jen pro první notu"],
    regelErklaer:
      "Předznamenání platí pro celou skladbu - posuvka uprostřed taktu naopak jen do taktové čáry.",
  },
  taktwechsel: {
    sonderPrompt: "Jaké taktové označení to je?",
    sonderWahl: ["C - čtyřčtvrťový takt", "Alla breve - dvoupůlový takt", "Takt 3/4"],
    sonderErklaerC: "Body 4, 6 před c: C čtyřčtvrťového taktu.",
    sonderErklaerAb: "Body 4, 5, 6 před c: alla breve - takt udávají půlové noty.",
    sonderSchreibenC: "Napiš znak taktu C: body 4 a 6, potom c (body 1, 4).",
    sonderSchreibenAb: "Napiš alla breve: body 4, 5 a 6, potom c (body 1, 4).",
    vorzeichenC: "předznak - body 4, 6",
    vorzeichenAb: "předznak - body 4, 5, 6",
    dasC: "c - body 1, 4",
    wechselPrompt: "Po několika notách stojí DRUHÉ taktové označení. Co to znamená?",
    wechselWahl: (a: number, b: number): string[] => [
      `Takt se mění na ${a}/${b}`,
      "Mění se tónina",
      "Skladba končí",
    ],
    wechselErklaer: (a: number, b: number): string =>
      `Nové taktové označení uprostřed skladby znamená: odtud platí takt ${a}/${b}.`,
    wechselSchreiben: (a: number, b: number): string =>
      `Uprostřed skladby se mění takt: napiš taktovou čáru (mezerník), potom nové taktové označení ${a}/${b}.`,
  },
  schluessel: {
    lesenPrompt: "Jaký notový klíč tu stojí (tři buňky)?",
    lesenErklaer: (schluessel: string): string =>
      `Byl to ${schluessel}. Všechny klíče začínají body 3, 4, 5 a končí body 1, 2, 3 - liší se prostředkem.`,
    mitteViolin: "body 3, 4",
    mitteBass: "body 3, 4, 5, 6",
    schreibPrompt: (schluessel: string, mitte: string): string =>
      `Napiš ${schluessel} - tři buňky: body 3, 4, 5 · ${mitte} · body 1, 2, 3.`,
    ankuendigung: "ohlášení klíče - body 3, 4, 5",
    gZeichen: "znak G - body 3, 4",
    fZeichen: "znak F - body 3, 4, 5, 6",
    abschluss: "zakončení - body 1, 2, 3",
    wissenPrompt: "Potřebuje Braillovo notové písmo klíče, aby určilo výšku tónu?",
    wissenWahl: ["Ne - polohu říkají oktávové znaky", "Ano - bez klíče to nejde"],
    wissenErklaer:
      "Znaky klíčů jsou v Braillově písmu jen informace o tištěných notách - polohu určují vždycky oktávové znaky.",
  },
  sechzehntel: {
    hoerenPrompt: "Malý běh. Osminové - nebo dvakrát hbitější šestnáctinové?",
    hoerenWahl: ["Osminové", "Šestnáctinové"],
    hoerenSchnell: "Byly to šestnáctinové - čtyři na jednu dobu.",
    hoerenLangsam: "Byly to osminové - dvě na jednu dobu.",
    gruppePrompt:
      "Napiš šestnáctinovou čtveřici: jen PRVNÍ nota dostane body 3 a 6, ostatní tři napíšeš jako osminové (seskupení).",
    ersteZelle: (ton: string): string => `${ton} jako šestnáctinová - s body 3 a 6`,
    andereZelle: (ton: string): string => `${ton} - napsaná jako osminová (patří do skupiny)`,
    gruppeErklaer: "Seskupení dělá rychlé běhy čitelnými: body hodnoty jen na první notě skupiny.",
    regelPrompt:
      "Čtyři šestnáctinové na jednu dobu, napsané jako skupina: kolik buněk nese body hodnoty 3 a 6?",
    regelWahl: ["Jen první", "Všechny čtyři", "První a poslední"],
    regelErklaer:
      "Hodnotu ukazuje jen první nota skupiny - ostatní vypadají jako osminové. Braillský protějšek trámců v tištěných notách.",
    einzelnPrompt: (ton: string): string =>
      `Napiš: ${ton} jako šestnáctinovou notu. (Pozor - stejná buňka jako celá nota; rozhoduje takt!)`,
  },
  triolen: {
    hoerenPrompt: "Mezi dvěma klidnými dobami: kolik tónů se dělí o JEDNU dobu - dva, nebo tři?",
    hoerenWahl: ["Dva - normální osminové", "Tři - triola"],
    hoerenTriole: "Tři stejně dlouhé tóny na jednu dobu: triola.",
    hoerenZwei: "Dvě osminové - normální dělení.",
    schreibPrompt: "Napiš triolu: nejdřív znak trioly (body 2, 3), potom tři osminové.",
    triolenZeichen: "znak trioly - body 2, 3",
    achtelZelle: (ton: string): string => `${ton}, osminová nota - třetina doby`,
    schreibErklaer: "Znak trioly stojí JEDNOU před skupinou - ze dvou osminových udělá tři.",
    lesenPrompt: "Před třemi osminovými stojí tato první buňka (body 2, 3). Co znamená?",
    lesenWahl: ["Triolu - tři tóny na jednu dobu", "Osminovou pomlku", "Oktávový znak"],
    lesenErklaer: "Body 2, 3 před skupinou not = triola.",
  },
  puls: {
    klopfPrompt: (n: number): string =>
      `Ucíť základní dobu a ťukej ji mezerníkem pravidelně s hudbou - ${n} ${tvarCs(n, "doba", "doby", "dob")}.`,
    metrumPrompt: "Poslouchej přízvučné doby: pochoduje to na dvě, nebo se to točí ve valčíku na tři?",
    metrumWahl: ["Pochod - na dvě", "Valčík - na tři"],
    metrumDrei: "Přízvučná je vždycky první ze tří dob: na tři - valčíkový krok.",
    metrumZwei: "Přízvučná je vždycky první ze dvou dob: na dvě - pochodový krok.",
    abstandPrompt: "Počítej doby od jednoho přízvuku k dalšímu: kolik jich je?",
    abstandWahl: ["2 doby", "3 doby", "4 doby"],
    abstandErklaer: (n: number): string =>
      `Od přízvuku k přízvuku: ${n} ${tvarCs(n, "doba", "doby", "dob")} - takt ${n}/4.`,
  },
  dauer: {
    vergleichPrompt: "Dva tóny po sobě. Který zněl déle?",
    vergleichWahl: ["První", "Druhý"],
    vergleichErster: "První byla půlová nota - dvakrát tak dlouhá jako čtvrťová po ní.",
    vergleichZweiter: "Druhá byla půlová nota - dvakrát tak dlouhá jako čtvrťová před ní.",
    schlaegePrompt: "Nejdřív dvě doby pulsu, potom dlouhý tón: kolik dob zněl?",
    schlaegeWahl: ["1 doba - čtvrťová nota", "2 doby - půlová nota", "4 doby - celá nota"],
    schlaegeErklaer: (wert: string, zahl: number): string =>
      `Byla to ${wert} - délka: ${zahl} ${tvarCs(zahl, "doba", "doby", "dob")}.`,
    paarPrompt: "Dva tóny: stejně dlouhé - nebo druhý dvakrát tak dlouhý?",
    paarWahl: ["Stejně dlouhé", "Druhý dvakrát tak dlouhý"],
    paarGleich: "Dvě stejně dlouhé čtvrťové noty.",
    paarDoppelt: "Nejdřív čtvrťová, potom půlová - dvakrát tak dlouhá.",
  },
  dynamik: {
    lautPrompt: "Poslechni si malou frázi: zahraná nahlas, nebo potichu?",
    lautWahl: ["Nahlas", "Potichu"],
    lautErklaer: "Zahráno silně - později se tomu říká forte.",
    leiseErklaer: "Zahráno úplně jemně - později se tomu říká piano.",
    rampePrompt: "Fráze zesiluje, nebo zeslabuje?",
    rampeWahl: ["Zesiluje", "Zeslabuje"],
    cresc: "Od tichého k hlasitému - později se tomu říká crescendo.",
    decresc: "Od hlasitého k tichému - později se tomu říká decrescendo.",
    akzentPrompt: "Jeden tón má zvláštní důraz. Kde byl?",
    akzentWahl: ["Na začátku", "Uprostřed", "Na konci"],
    akzentErklaer: (i: number): string =>
      `Přízvučný tón byl ${["na začátku", "uprostřed", "na konci"][i]}.`,
  },
  inst: {
    merk: {
      klavier: "Klavír - úderový nástroj, jasný úhoz s doznívajícím zvukem.",
      gitarre: "Kytara - drnkací nástroj, perkusivní a strunný zvuk.",
      sax: "Saxofon - dechový nástroj, zpěvný, se zvukem plátku.",
      floete: "Příčná flétna - dechový nástroj, měkká a jasná.",
    },
    hoerenPrompt: "Který nástroj tu hraje?",
    vergleichPrompt: "Dva motivy po sobě: stejný nástroj, nebo různé?",
    vergleichWahl: ["Stejný nástroj", "Různé nástroje"],
    vergleichGleich: "Oba motivy zahrál stejný nástroj.",
    vergleichErklaer: (a: string, b: string): string => `Nejdřív ${a}, potom ${b}.`,
    zuerstPrompt: "Dva nástroje po sobě. Který hrál první?",
    zuerstErklaer: (a: string): string => `Jako první zazněl nástroj: ${a}.`,
  },
  echo: {
    prompt: (len: number): string =>
      `Hra na ozvěnu: poslechni si ${len} ${tvarCs(len, "tón", "tóny", "tónů")} a zahraj je na klaviatuře - D F G H J K L jsou c d e f g a h. Počítá se jen řada tónů, rytmus je volný.`,
    erklaer: "Zahraj tóny v pořadí, v jakém zazněly.",
  },
  memory: {
    prompt:
      "Pexeso melodií: já zahraju řadu tónů, ty ji zahraješ po mně (D F G H J K L = c d e f g a h). Když to zvládneš, jeden tón přibude - jak daleko se dostaneš?",
  },
};
