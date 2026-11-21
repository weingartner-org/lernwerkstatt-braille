/**
 * Bereich `aufgabenB` - Čeština. Úlohy světů 4 „Výraz", 5 „Stavíme formy" a 6 „Souzvuk"
 * v `etappen.ts`. Kinder: „ty". Fachwörter: tschechische Musiklehre (legatový oblouk,
 * vázací oblouk, koruna, příraz, trylek, obal, nátryl, mordent, volta, prima ... oktáva).
 * Mehrzahl 1 / 2-4 / 5+. Unsichere Wörter stehen im Bericht unter „Unsicher".
 */
import type { aufgabenB as De } from "../de/aufgabenB";

/** Tvar podstatného jména podle počtu: 1 · 2-4 · 0 a 5+. */
const tvarCs = (n: number, one: string, few: string, many: string): string =>
  n === 1 ? one : n >= 2 && n <= 4 ? few : many;

/** První písmeno velké („tercie" -> „Tercie") na začátku věty. */
const velkeCs = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);

export const aufgabenB: typeof De = {
  gemeinsam: {
    taktstrich: "taktová čára - mezerník",
    oktavzeichenDer: (oktave: string): string => `oktávový znak - ${oktave}`,
    oktavzeichen: "oktávový znak",
    verlaengerungspunkt: "prodlužovací tečka - bod 3",
    vorzeichen: "předznak",
    zusatzzelle: "doplňková buňka",
    dasM: "m",
    dasF: "f",
    dasP: "p",
    vorDerNote: "Před notou",
    nachDerNote: "Za notou",
  },

  // --- Svět 4: legatový oblouk ----------------------------------------------
  bindebogen: {
    hoerenPrompt: "Byl motiv zahraný spojeně (legato), nebo odděleně?",
    hoerenChoices: ["Spojeně - legato", "Odděleně"],
    hoerenExplainGebunden: "Tóny do sebe měkce přecházely - legato, legatový oblouk.",
    hoerenExplainGetrennt: "Každý tón byl zřetelně oddělený - ne spojeně.",
    welcherHaltePrompt: "Jeden tón, zapsaný dvakrát, JEDEN úhoz - který oblouk to je?",
    welcherBindePrompt: "Dva RŮZNÉ tóny, měkce spojené, dva úhozy - který oblouk to je?",
    welcherChoices: ["Vázací oblouk - stejná výška, jeden tón", "Legatový oblouk - legato mezi tóny"],
    welcherExplainHalte: "Stejná výška tónu, jediný úhoz: vázací oblouk - bod 4, potom body 1 a 4 (dvě buňky).",
    welcherExplainBinde: "Různé výšky tónů, měkce spojené: legatový oblouk - body 1 a 4 za notou.",
    schreibenPrompt: "Napiš tři tóny legato: za každou notou kromě poslední přijde legatový oblouk (body 1 a 4).",
    bindebogenLabel: "legatový oblouk - body 1, 4",
    letzteFrei: (note: string): string => `${note} - poslední nota zůstává bez oblouku`,
    schreibenExplain: "Legatový oblouk stojí za každou spojenou notou - jen poslední zůstává bez něj.",
    verdopplungPrompt: "Dlouhá fráze přes víc než čtyři noty: legatový oblouk se napíše DVAKRÁT za první notou a jednou za předposlední.",
    verdopplungErste: "zdvojený legatový oblouk, první buňka - body 1, 4",
    verdopplungZweite: "zdvojený legatový oblouk, druhá buňka - body 1, 4",
    verdopplungVorletzte: "jednoduchý legatový oblouk za předposlední notou - body 1, 4",
    verdopplungExplain: "Zdvojení: dva oblouky za první notou, jeden za předposlední - ušetří to spoustu jednotlivých oblouků.",
  },

  // --- Svět 4: artikulace ---------------------------------------------------
  artikulation: {
    hoerenPrompt: "Jak byl motiv zahraný?",
    hoerenChoices: ["Staccato - krátce, odděleně", "Tenuto - plně podržené", "Akcent - zahrané s důrazem"],
    hoerenExplainStaccato: "Krátce a odděleně: staccato.",
    hoerenExplainTenuto: "Každý tón plně podržený: tenuto.",
    hoerenExplainAkzent: "Silně zahrané: akcent.",
    positionPromptFermate: "Kde stojí koruna - před notou, nebo za ní?",
    positionPromptArtic: "Kde stojí staccato, tenuto a akcent - před notou, nebo za ní?",
    positionExplainFermate: "Koruna je výjimka: stojí ZA notou - a nikdy se nezdvojuje.",
    positionExplainArtic: "Artikulační znaky stojí PŘED notou. Jen koruna stojí za ní.",
    staccatoDoppeltErste: "zdvojené staccato, první buňka - body 2, 3, 6",
    staccatoDoppeltZweite: "zdvojené staccato, druhá buňka - body 2, 3, 6",
    staccatoEinfachLetzte: "jednoduché staccato před poslední notou - body 2, 3, 6",
    staccato: "staccato - body 2, 3, 6",
    staccatoVierPrompt: "Staccato na všech čtyřech notách: od čtyř not se znak napíše DVAKRÁT před první a jednou před poslední.",
    staccatoDreiPrompt: "Napiš motiv staccato: před KAŽDOU notu přijde znak staccata (body 2, 3, 6).",
    staccatoVierExplain: "Zdvojení říká: všechny noty až po předposlední jsou staccato.",
    staccatoDreiExplain: "Každá nota dostane před sebe svůj znak staccata.",
    fermateErste: "koruna, první buňka - body 1, 2, 6",
    fermateZweite: "koruna, druhá buňka - body 1, 2, 3",
    fermatePrompt: "Napiš motiv a k poslednímu tónu připoj korunu - stojí ZA notou (body 1, 2, 6 · body 1, 2, 3).",
    fermateExplain: "Koruna zastaví poslední tón - jako jediný artikulační znak stojí za notou.",
    zeichenStaccato: "staccato",
    zeichenTenuto: "tenuto",
    zeichenAkzent: "akcent",
    zeichenFermate: "koruna",
    erkennenPrompt: "Který znak to je?",
    erkennenExplain: (zeichen: string): string => `Byl to znak: ${zeichen}.`,
  },

  // --- Svět 4: dynamika -----------------------------------------------------
  dynamik: {
    lautPrompt: "Forte, nebo piano?",
    lautChoices: ["forte - nahlas", "piano - potichu"],
    lautExplainLaut: "Nahlas - forte, v Braillově písmu slovní znak a f.",
    lautExplainLeise: "Potichu - piano, v Braillově písmu slovní znak a p.",
    rampePrompt: "Crescendo, nebo decrescendo?",
    rampeChoices: ["crescendo - zesilovat", "decrescendo - zeslabovat"],
    rampeExplainCresc: "Zesilovat: crescendo - vidlice 345-14 až 345-25.",
    rampeExplainDecr: "Zeslabovat: decrescendo - vidlice 345-145 až 345-256.",
    schreibenPrompt: (sym: "f" | "p", note: string): string =>
      `Napiš ${sym === "f" ? "forte" : "piano"}, potom notu ${note}: nejdřív slovní znak (body 3, 4, 5), potom ${sym === "f" ? "f" : "p"}, potom notu.`,
    wortzeichen: "slovní znak dynamiky - body 3, 4, 5",
    buchstabeF: "f (forte) - body 1, 2, 4",
    buchstabeP: "p (piano) - body 1, 2, 3, 4",
    schreibenExplain: "Před každé přednesové slovo přijde slovní znak. Když potom následuje nota s body 1, 2 nebo 3, oddělí ji později bod 3 - to se ještě naučíš přesněji.",
    gabelAnfang: "začátek vidlice crescendo - body 3, 4, 5",
    gabelAnfangZweite: "začátek vidlice crescendo, druhá buňka - body 1, 4",
    gabelEnde: "konec vidlice crescendo - body 3, 4, 5",
    gabelEndeZweite: "konec vidlice crescendo, druhá buňka - body 2, 5",
    gabelPrompt: "Dej kolem motivu vidlici crescendo: začátek PŘED první notu (345-14), konec ZA poslední (345-25).",
    gabelExplain: "Začátek vidlice stojí před první notou, konec vidlice za poslední notou místa, které zesiluje.",
    erkennenPrompt: "Který znak dynamiky to je?",
    erkennenExplain: (zeichen: string): string => `Bylo to: ${zeichen}.`,
  },

  // --- Svět 4: tempo --------------------------------------------------------
  tempo: {
    hoerenPrompt: "V jakém tempu melodie zní?",
    largo: "Largo - velmi pomalu",
    andante: "Andante - krokem",
    presto: "Presto - velmi rychle",
    hoerenExplain: (label: string): string => `Bylo to: ${label}.`,
    rampePrompt: "Zrychluje melodie, nebo zpomaluje?",
    rampeChoices: ["Zrychluje - accelerando", "Zpomaluje - ritardando"],
    rampeExplainAcc: "Tempo se zrychluje: accelerando.",
    rampeExplainRit: "Tempo se rozšiřuje: ritardando.",
    wissen: [
      { frage: "Co znamená „a tempo“?", correct: "Zpět do původního tempa", wrong: ["Pořád zrychlovat", "Co nejhlasitěji"] },
      { frage: "Co znamená „ritardando“?", correct: "Zpomalovat", wrong: ["Zesilovat", "Zrychlovat"] },
      { frage: "Co znamená „Allegro“?", correct: "Rychle a vesele", wrong: ["Velmi pomalu", "Úplně potichu"] },
      { frage: "Co znamená „Adagio“?", correct: "Pomalu a klidně", wrong: ["Velmi rychle", "Se silným důrazem"] },
    ],
    wissenExplain: (richtig: string): string => `Správně: ${richtig}.`,
    metronomSchreibenPrompt: (bpm: number): string =>
      `Napiš údaj metronomu „čtvrťová nota = ${bpm}“: čtvrťová nota, rovnítko (body 2, 3, 5, 6), číselný znak, potom číslice.`,
    metronomBezug: "čtvrťová nota jako vztažná hodnota - body 1, 4, 5, 6",
    metronomGleich: "rovnítko metronomu - body 2, 3, 5, 6",
    zahlzeichen: "číselný znak - body 3, 4, 5, 6",
    ziffer: (d: string): string => `číslice ${d}`,
    metronomSchreibenExplain: (bpm: number): string =>
      `Údaj metronomu říká: za minutu má zaznít ${bpm} ${tvarCs(bpm, "čtvrťová nota", "čtvrťové noty", "čtvrťových not")}.`,
    metronomWahl: (bpm: number): string => `${bpm} ${tvarCs(bpm, "čtvrťová nota", "čtvrťové noty", "čtvrťových not")} za minutu`,
    metronomLesenPrompt: "Jaké tempo udává tento údaj metronomu?",
    metronomLesenExplain: (bpm: number): string =>
      `Číselný znak a číslice dávají ${bpm} - tolik čtvrťových not za minutu.`,
  },

  // --- Svět 4: ozdoby -------------------------------------------------------
  verzierungen: {
    obPurPrompt: "Byl tón ozdobený, nebo zahraný čistě?",
    obPurChoices: ["Ozdobený", "Čistě - bez ozdoby"],
    obPurExplainVerziert: "Byl u něj malý ozdobný tón.",
    obPurExplainPur: "Jediný hladký tón - žádná ozdoba.",
    welchePrompt: "Příraz, nebo trylek?",
    welcheChoices: ["Krátký příraz - jeden ozdobný tón předtím", "Trylek - rychlé střídání"],
    welcheExplainTriller: "Rychlé střídání se sousedním tónem: trylek (body 2, 3, 5).",
    welcheExplainVorschlag: "Jediný ozdobný tón před hlavním tónem: příraz (body 2, 6).",
    schreibenPrompt: (zeichen: string, note: string): string =>
      `Napiš ozdobný znak „${zeichen}“ před notu ${note}: nejdřív ozdobný znak, potom notu.`,
    zelleN: (zeichen: string, n: number): string => `${zeichen}, buňka ${n}`,
    zeichenEinzel: (zeichen: string): string => `znak: ${zeichen}`,
    schreibenExplain: "Znaky ozdob stojí vždycky PŘED notou, kterou zdobí.",
    erkennenPrompt: "Která ozdoba to je?",
    erkennenExplain: (zeichen: string): string => `Bylo to: ${zeichen}.`,
    hoerenPrompt: "Kterou ozdobu slyšíš?",
    hoerenDoppelschlag: "Obal - kolem tónu",
    hoerenPralltriller: "Nátryl - krátce nahoru",
    hoerenMordent: "Mordent - krátce dolů",
    zierSchreibenPrompt: (zeichen: string, note: string): string =>
      `Napiš ozdobný znak „${zeichen}“ před notu ${note}.`,
    zierSchreibenExplain: "I tyto ozdoby stojí PŘED notou.",
    tremoloPrompt: (rep8: boolean, note: string): string =>
      `Opakovací tremolo (${rep8 ? "osminové" : "šestnáctinové"}) - stojí ZA notou: nejdřív nota ${note}, potom znak tremola.`,
    tremoloErste: "tremolo, první buňka - body 4, 5",
    tremoloZweite: "tremolo, druhá buňka",
    tremoloExplain: "Opakovací tremolo rychle opakuje tón - jeho znak stojí za notou.",
    positionPromptVor: "Kde stojí obal nebo mordent?",
    positionPromptNach: "Kde stojí opakovací tremolo?",
    positionPromptZwischen: "Kde stojí rozložené tremolo?",
    positionChoices: ["Před notou", "Za notou", "Mezi dvěma notami"],
    positionExplainVor: "Ozdoby jako obal a mordent stojí před notou.",
    positionExplainNach: "Opakovací tremolo stojí za notou.",
    positionExplainZwischen: "Rozložené tremolo stojí mezi dvěma notami - a nikdy se nezdvojuje.",
  },

  // --- Svět 4: výraz v písničce ---------------------------------------------
  ausdruckLied: {
    artikPrompt: (titel: string): string => `„${titel}“ - začátek: zahraný spojeně, nebo krátce?`,
    artikChoices: ["Spojeně - legato", "Krátce - staccato"],
    artikExplainLegato: "Tóny do sebe plynuly - legato.",
    artikExplainStaccato: "Každý tón krátce oddělený - staccato.",
    dazuChoices: ["Zesilovalo se - crescendo", "Tóny byly krátké - staccato", "Závěr byl podržený - koruna"],
    dazuDynPrompt: (titel: string): string => `„${titel}“: Co přibylo k suché verzi?`,
    dazuDynExplain: "To místo zesilovalo - crescendo.",
    dazuPrompt: (titel: string): string => `„${titel}“: Co přibylo?`,
    dazuStaccatoExplain: "Tóny byly krátké a špičaté - staccato.",
    dazuFermateExplain: "Poslední tón byl podržený - jako koruna.",
    schreibenPrompt: (titel: string, sym: "f" | "p" | "mf"): string =>
      `Napiš začátek písničky „${titel}“ a před něj ${sym === "f" ? "forte" : sym === "p" ? "piano" : "mezzoforte"}: nejdřív slovní znak a ${sym}, potom tóny s oktávovým znakem.`,
    schreibenExplain: "Přednesové slovo na začátku řádku říká, jak má celé místo znít.",
  },

  // --- Svět 5: opakování v Braillově písmu ----------------------------------
  wiederholungen: {
    lesenPrompt: "Jeden takt, potom znaky opakování. Kolikrát takt zazní celkem?",
    lesenChoices: ["2krát", "3krát", "4krát"],
    lesenExplain: (times: number): string =>
      `Vypsaný takt plus ${times - 1} ${tvarCs(times - 1, "znak simile", "znaky simile", "znaků simile")} = celkem ${times}krát.`,
    countPrompt: "Napiš takt a nech ho ještě DVAKRÁT zopakovat: takt, mezerník, simile (body 2, 3, 5, 6), číselný znak a nakonec číslo 2 jako počet.",
    countSimile: "simile - body 2, 3, 5, 6",
    countZahlzeichen: "číselný znak - body 3, 4, 5, 6",
    countZwei: "číslo 2 - tolikrát se opakuje",
    countExplain: "Simile a číslo říkají: tento takt ještě tolikrát zopakovat - mnohem kratší, než všechno vypsat.",
    regelPromptErlaubt: "Uprostřed řádku má celý takt zaznít přesně jako ten předtím. Smí tu stát znak simile?",
    regelPromptNein: "Hned PRVNÍ takt nového řádku se má opakovat. Smí tu stát znak simile?",
    regelChoices: ["Ano, to je dovolené", "Ne, tady ne"],
    regelExplainErlaubt: "Celý stejný takt uprostřed řádku se smí zkrátit znakem simile.",
    regelExplainNein: "Simile nesmí stát na první době nového řádku - tam se takt musí vypsat.",
    bestePrompt: "Čtyři stejné takty za sebou - jak to Braillovo písmo nejlépe zkrátí?",
    besteChoices: ["Napsat první takt, potom simile s číslem 4", "Vypsat celé všechny čtyři takty", "Napsat jen celou pomlku"],
    besteExplain: "Jeden takt vypsat, potom simile s číslem 4 - krátce a jednoznačně.",
  },

  // --- Svět 5: volty, segno, coda -------------------------------------------
  volten: {
    dacapoPrompt: "Po části A a části B stojí „D.C.“ (da capo - od začátku). V jakém pořadí části zazní?",
    reihenfolgeChoices: ["A-A-B", "A-B-A", "A-B-B"],
    dacapoExplain: "Da capo znamená „od začátku“: po A a B se A zahraje ještě jednou - A-B-A.",
    voltaPrompt: "Část A stojí mezi znaky repetice, s první a druhou voltou. V jakém pořadí všechno zazní?",
    voltaExplain: "A se opakuje: poprvé s voltou 1, podruhé s voltou 2 (novým koncem) - A-A-B.",
    schreibenPrompt: (n: number): string =>
      `Napiš znak pro voltu ${n}: číselný znak (body 3, 4, 5, 6), potom dolní číslici (${n}).`,
    zahlzeichen: "číselný znak - body 3, 4, 5, 6",
    tiefeZiffer: (n: number): string => `dolní číslice ${n} - ${n === 1 ? "bod 2" : "body 2, 3"}`,
    schreibenExplain: (n: number): string =>
      `Volta ${n} používá DOLNÍ číslici - proto ${n === 1 ? "bod 2" : "body 2 a 3"} (dolní číslice).`,
    segnoCodaPrompt: "Který znak formy to je?",
    segnoCodaChoices: ["Segno - značka pro skok zpět", "Coda - závěrečný dodatek"],
    segnoExplain: "Segno (body 3, 4, 6) označuje místo, kam se skáče zpět.",
    codaExplain: "Coda (346-123) uvádí závěrečný dodatek.",
    dcWissenPrompt: "Ve skladbě stojí „D.C. al Fine“. Co uděláš?",
    dcWissenChoices: ["Hrát od začátku až ke slovu „Fine“", "Hned přestat", "Zesilovat"],
    dcWissenExplain: "Da capo al Fine: ještě jednou od začátku - a u slova „Fine“ je konec.",
  },

  // --- Svět 5: formy --------------------------------------------------------
  formen: {
    abaPrompt: "Tři úseky. Vrátí se první na konci?",
    abaChoices: ["Ano - A-B-A, začátek se vrací", "Ne - A-B-C, všechno je jiné"],
    abaExplainWieder: "Třetí část byla jako první: A-B-A, oblouková forma.",
    abaExplainNein: "Všechny tři části byly různé: A-B-C.",
    rondoPrompt: "Rondo: refrén se mezi ostatními částmi pořád vrací. Kolikrát ho slyšíš?",
    rondoChoices: ["2krát", "3krát", "4krát"],
    rondoExplain: "Refrén A zazněl třikrát: A-B-A-C-A - to je forma ronda.",
    changePrompt: "Stejná melodie dvakrát - podruhé je JEDNA věc jinak. Výška tónu, nebo rytmus?",
    changeChoices: ["Jedna výška tónu byla jiná", "Jeden rytmus byl jiný"],
    changeExplainRhythmus: "Jeden tón byl najednou kratší - změnil se rytmus.",
    changeExplainTonhoehe: "Jeden tón byl výš nebo níž - změnila se výška tónu.",
    variationPrompt: "Melodie, potom ještě jednou: přesně stejně - nebo změněná (variace)?",
    variationChoices: ["Zopakovaná přesně stejně", "Změněná - variace"],
    variationExplainVar: "Podruhé bylo něco jinak: variace.",
    variationExplainGleich: "Dvakrát přesně stejně - skutečné opakování.",
  },

  // --- Svět 6: intervaly ----------------------------------------------------
  intervallName: { 1: "prima", 2: "sekunda", 3: "tercie", 4: "kvarta", 5: "kvinta", 6: "sexta", 7: "septima", 8: "oktáva" },
  intervallWahl: { 1: "Prima", 2: "Sekunda", 3: "Tercie", 4: "Kvarta", 5: "Kvinta", 6: "Sexta", 7: "Septima", 8: "Oktáva" },
  intervalle: {
    wahlMitStufen: (name: string, x: number): string => `${name} (${x} ${tvarCs(x, "stupeň", "stupně", "stupňů")})`,
    gleichzeitigPrompt: "Dva tóny současně - jaký interval tu zní?",
    nacheinanderPrompt: "Dva tóny po sobě - jak daleko jsou od sebe?",
    merkTerz: " Pomůcka: tercie dolů je kukaččí volání.",
    merkQuarte: " Pomůcka: kvarta nahoru zní jako začátek písně „Amazing Grace“.",
    merkOktave: " Oktáva je stejný tón, jen výš.",
    erklaerung: (name: string, n: number, merk: string): string =>
      `Byla to ${name} - ${n} ${tvarCs(n, "stupeň", "stupně", "stupňů")}.${merk}`,
    schreibenPrompt: (note: string, name: string): string =>
      `Napiš dvojzvuk shora: horní notu ${note} a pod ní intervalový znak (${name}). V horním hlasu stojí NEJVYŠŠÍ nota, interval se počítá dolů.`,
    intervallzeichenAbwaerts: (label: string): string => `${label} - intervalový znak dolů`,
    schreibenExplain: (oben: string, name: string, unten: string): string =>
      `Nahoře ${oben}, intervalový znak (${name}) přidá dolní tón ${unten}.`,
    lesenPrompt: "Přečti dvojzvuk v Braillově písmu a poslechni si ho: jaký interval tam stojí?",
    lesenExplain: (name: string): string => `Horní nota plus intervalový znak: ${name}.`,
    regelPrompt: "V horním hlasu (pravá ruka): kterou z obou not napíšeš a která přibude jako intervalový znak?",
    regelChoices: ["NEJVYŠŠÍ notu - intervaly se počítají dolů", "Nejnižší notu - intervaly se počítají nahoru"],
    regelExplain: "Horní hlas: napíše se nejvyšší nota, intervaly pod ní směrem dolů (pravidlo diskantu).",
    hoerenPrompt: (aufwaerts: boolean): string =>
      `Dva tóny ${aufwaerts ? "nahoru" : "dolů"} - jaký interval? (Sekunda a septima drhnou, kvinta zní otevřeně.)`,
    hoerenExplain: (name: string): string => `Byla to ${name}.`,
    schaetzenPrompt: "Je tento interval větší, nebo menší než kvinta?",
    schaetzenChoices: ["Menší než kvinta", "Větší než kvinta"],
    schaetzenExplain: (name: string, groesser: boolean): string =>
      `${velkeCs(name)} je ${groesser ? "větší" : "menší"} než kvinta.`,
  },

  // --- Svět 6: akordy -------------------------------------------------------
  akkorde: {
    durMollPrompt: "Trojzvuk, všechny tóny současně - zní jasně (dur), nebo tmavě (moll)?",
    durMollChoices: ["Dur - jasně", "Moll - tmavě"],
    durMollExplainMoll: "Malá tercie dělá zvuk tmavým - moll.",
    durMollExplainDur: "Velká tercie dělá zvuk jasným - dur.",
    brechungPrompt: "Zazněly tři tóny po sobě, nebo všechny dohromady?",
    brechungChoices: ["Po sobě - malá melodie", "Všechny dohromady - akord"],
    brechungExplainGebrochen: "Tóny přicházely jednotlivě - rozloženě.",
    brechungExplainAkkord: "Všechny tři najednou - akord.",
    verminderterPrompt: "Zní trojzvuk tmavě (moll), nebo napjatě (zmenšený)?",
    verminderterChoices: ["Moll - tmavý, ale klidný", "Zmenšený - napjatý"],
    verminderterExplainVermindert: "I kvinta je zmenšená - to zní napjatě.",
    verminderterExplainMoll: "Jen tercie je malá - moll.",
    schreibenPrompt: (wurzel: string, top: string): string =>
      `Napiš durový trojzvuk se základním tónem ${wurzel} SHORA: nejvyšší notu ${top}, potom znak tercie a znak kvinty směrem dolů.`,
    terzDarunter: (label: string, ton: string): string => `${label} - tercie pod ní (${ton})`,
    quinteDarunter: (label: string, ton: string): string => `${label} - kvinta pod ní (${ton})`,
    schreibenExplain: (top: string, terz: string, grund: string): string =>
      `Nejvyšší nota ${top}, znaky tercie a kvinty přidají ${terz} a ${grund}.`,
    lesenPrompt: "Přečti akord v Braillově písmu a poslechni si ho - dur, nebo moll?",
    lesenChoices: ["Dur", "Moll"],
    lesenExplainMoll: "Tmavě - moll.",
    lesenExplainDur: "Jasně - dur.",
    oktavPrompt: (top: string): string => `Zdvoj základní tón: napiš ${top} a připoj oktávový intervalový znak.`,
    oktaveDarunter: (label: string): string => `${label} - oktáva pod ní`,
    oktavExplain: "Oktávový intervalový znak jsou body 3, 6.",
  },

  // --- Svět 6: in-accord ----------------------------------------------------
  inAccord: {
    hoerenPrompt: "Dva hlasy: nejdřív každý zvlášť, potom spolu. Který hlas byl nahoře?",
    hoerenChoices: ["První (vyšší) hlas", "Druhý (nižší) hlas"],
    hoerenExplain: "Vyšší hlas je horní hlas - v braillském řádku stojí první.",
    lesenPrompt: "V tomto braillském řádku odděluje znak in-accord (body 1, 2, 6 · 3, 4, 5) dva hlasy. Kolik hlasů v taktu zní?",
    lesenChoices: ["Jeden hlas", "Dva hlasy", "Tři hlasy"],
    lesenExplain: "Znak in-accord říká: tady začíná druhý hlas ve stejném taktu.",
    schreibenPrompt: (ober: string, unter: string): string =>
      `Napiš dva hlasy do jednoho taktu: nejdřív horní hlas ${ober}, potom znak in-accord, potom dolní hlas ${unter} - s vlastním oktávovým znakem.`,
    zeichenErste: "in-accord, první buňka - body 1, 2, 6",
    zeichenZweite: "in-accord, druhá buňka - body 3, 4, 5",
    schreibenExplain: "Za znakem in-accord začíná druhý hlas znovu oktávovým znakem.",
  },
};
