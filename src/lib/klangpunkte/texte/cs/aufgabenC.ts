/**
 * Bereich `aufgabenC` - Čeština: texty úloh světů 7 (Hřiště teorie), 8 (Svět nástrojů)
 * a 9 (Písničkové pódium) z `etappen.ts`. Kinder: „ty". Pořadí výběrů = pořadí v kódu.
 * Instrumentenfamilien nach Hornbostel-Sachs (strunné, vzduchové, blanozvučné, samozvučné).
 * Mehrzahl 1 / 2-4 / 5+. Unsichere Wörter stehen im Bericht unter „Unsicher".
 */
import type { aufgabenC as De } from "../de/aufgabenC";

/** Tvar podstatného jména podle počtu: 1 · 2-4 · 0 a 5+. */
const tvarCs = (n: number, one: string, few: string, many: string): string =>
  n === 1 ? one : n >= 2 && n <= 4 ? few : many;

/** První písmeno velké („palec" -> „Palec") na začátku věty. */
const velkeCs = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);

/** „křížky" -> „křížků" (2. pád množného čísla) pro otázku „Kolik ...?". */
const KOLIK_CS: Record<string, string> = { "křížky": "křížků", "béčka": "béček" };

export const aufgabenC: typeof De = {
  zellen: {
    oktavzeichenDer: (oktave: string): string => `oktávový znak - ${oktave}`,
    oktavzeichen: "oktávový znak",
    vorzeichen: "předznak",
    verlaengerungspunkt: "prodlužovací tečka - bod 3",
    taktstrich: "taktová čára - mezerník",
  },

  // --- Svět 7 „Hřiště teorie" -----------------------------------------------
  tonleitern: {
    spielNach:
      "Zahraj stupnici C dur nahoru: c d e f g a h c - na klaviatuře D F G H J K L, potom oktávu nahoru a ještě jednou D.",
    spielNachErkl: "Osm stupňů od c k dalšímu c.",
    durMollFrage: "Poslechni si stupnici - dur (jasná), nebo moll (tmavá)?",
    durMollWahl: ["Dur", "Moll"],
    durMollErklMoll: "Třetí stupeň je snížený - přirozená moll.",
    durMollErklDur: "Čistá durová stupnice.",
    fehlerFrage: "V této durové stupnici se posunul JEDEN tón. Který stupeň byl špatně?",
    fehlerWahl: ["Stupeň 3", "Stupeň 4", "Stupeň 5", "Stupeň 6", "Stupeň 7"],
    fehlerErkl: (stufe: number): string => `${stufe}. stupeň zněl příliš vysoko.`,
    schreibe:
      "Napiš stupnici G dur: g a h c d e - a potom fis, tedy křížek před f (to je jediné předznamenání G dur).",
    schreibeErkl: "G dur má jeden křížek: z f se stane fis.",
  },

  quintenzirkel: {
    vz: {
      kreuz: { ein: "křížek", mehr: "křížky" },
      be: { ein: "béčko", mehr: "béčka" },
    },
    anzahlFrage: (name: string, mehr: string): string =>
      `Zastávka: ${name}. Kolik ${KOLIK_CS[mehr] ?? mehr} má tato tónina?`,
    anzahlErkl: (name: string, n: number, wort: string): string => `${name} má ${n} ${wort}.`,
    nameFrage: (n: number, wort: string): string => `${n} ${wort} - která durová tónina to je?`,
    nameErkl: (n: number, wort: string, name: string): string => `${n} ${wort}: to je ${name}.`,
    lesenFrage: "Přečti předznamenání v Braillově písmu - která tónina?",
    lesenErkl: (name: string): string => `Toto předznamenání patří k tónině ${name}.`,
  },

  rhythmusdiktat: {
    blattFrage: "Přečti rytmus v notové osnově a vyťukej ho mezerníkem - z listu.",
    diktatFrage: (rhythm: boolean): string =>
      `Rytmický diktát: vyťukám takt na tónu g. Napiš hodnoty, které slyšíš${rhythm ? " (rytmické slabiky jsou zapnuté)" : ""}. První tón je g. Poslouchat můžeš, kolikrát chceš.`,
    diktatErkl: "Počítej doby u každého tónu: čtvrťová = jedna doba, půlová = dvě.",
  },

  melodiediktat: {
    frage: (startton: string, anzahl: number): string =>
      `Melodický diktát: první tón je ${startton}. Poslechni si ${anzahl} ${tvarCs(anzahl, "tón", "tóny", "tónů")} a napiš je - jdou malými kroky. Poslouchat můžeš, kolikrát chceš.`,
    erkl: "Porovnej tón po tónu s prvním tónem: jde to nahoru, nebo dolů?",
  },

  detektiv: {
    frage: "Přečti braillský řádek a poslechni si nahrávku. Na kterém místě se zvuk liší od not?",
    note: (n: number): string => `Nota ${n}`,
    allesRichtig: "Všechno správně",
    erklRichtig: "Všechno sedělo - zvuk a noty byly stejné.",
    erklAnders: (n: number): string => `Nota ${n} zněla jinak, než je napsáno.`,
  },

  baumeister: {
    dreiViertel: "Postav plný takt 3/4: piš noty a pomlky klávesami f d s j k l, dokud doby nedají přesně tři. Enter takt zkontroluje.",
    mitPause: "Postav takt 4/4 s aspoň JEDNOU pomlkou. Enter takt zkontroluje.",
    mitNoten: "Postav takt 4/4 s aspoň TŘEMI notami. Enter takt zkontroluje.",
    sechsAchtel: "Nepovinná úloha: postav plný takt 6/8 (šest osminových dob). Enter takt zkontroluje.",
  },

  spielwiese: {
    frage:
      "Hrací louka: nad tichým bordunem můžeš hrát volně - klávesami D F G J K (pentatonika). Žádný tón nemůže být špatně. Vyprávěj malý příběh: nejdřív potichu, potom nahlas. Od třiceti tónů je dílna navštívená.",
  },

  kadenzen: {
    schlussFrage: "Dva akordy jako závěr - zní to hotově, nebo to ještě pokračuje?",
    schlussWahl: ["Hotově - skutečný závěr", "Otevřeně - ještě to pokračuje"],
    schlussErklOffen: "Na dominantě (V) to zůstane otevřené - půlzávěr.",
    schlussErklZu: "Z dominanty zpět k základnímu akordu - to zní hotově (celý závěr).",
    artFrage: "Jaký závěrečný obrat to je?",
    artWahl: ["Autentický - z dominanty (V) k základnímu akordu", "Plagální - závěr „amen“ ze subdominanty (IV)"],
    artErklPlagal: "IV do I - měkký závěr „amen“ (plagální).",
    artErklAuth: "V do I - silný, autentický závěr.",
    funktionFrage: "Jakou funkci má tento akord v C dur?",
    funktionWahl: ["Tónika (stupeň I)", "Subdominanta (stupeň IV)", "Dominanta (stupeň V)"],
    funktionErkl: [
      "Tónika (T) - základní akord na stupni I.",
      "Subdominanta (S) - stupeň IV.",
      "Dominanta (D) - stupeň V.",
    ],
  },

  komponier: {
    frage:
      "Skladatelská dílna: piš volně klávesami f d s j k l, poslechni si své dílo a ulož ho (až pět děl). Dílna je navštívená, jakmile uložíš první dílo.",
  },

  // --- Svět 8 „Svět nástrojů" -----------------------------------------------
  fingersatz: {
    lesenFrage: "Přečti notu a prstoklad: Který prst má notu hrát? (Prstoklad stojí ZA notou.)",
    lesenErkl: (finger: string): string => `Malá číslice za notou: ${finger}.`,
    schreibenFrage: (ton: string, finger: string): string =>
      `Napiš notu ${ton} a připoj prstoklad (${finger}) - stojí ZA notou.`,
    fingerZelle: (finger: string): string => `${finger} - prstoklad`,
    schreibenErkl: (finger: string): string => `${velkeCs(finger)} dostane svou číslici hned za notu.`,
    positionFrage: "Kde stojí prstoklad - před notou, nebo za ní?",
    positionWahl: ["Za notou", "Před notou"],
    positionErkl: "Na rozdíl od artikulace stojí prstoklad ZA notou (před případným vázacím obloukem).",
  },

  klavier: {
    zweiFrage:
      "Dva řádky - nahoře pravá ruka (houslový klíč), dole levá ruka (basový klíč). Kolik tónů hraje LEVÁ ruka? Klávesami Alt + Q můžeš jednu ruku vidět zvětšeně a slyšet samostatně.",
    zweiWahl: (n: number): string => `${n} ${tvarCs(n, "tón", "tóny", "tónů")}`,
    zweiErkl: "Spočítej hlavičky not v dolním řádku - nebo si poslechni samotnou nízkou ruku (Alt + Q).",
    handFrage: "Tento řádek začíná znakem ruky. Pro kterou ruku je?",
    handWahl: ["Pravá ruka", "Levá ruka"],
    handErklLinks: "Body 4, 5, 6 a potom 3, 4, 5: znak levé ruky.",
    handErklRechts: "Body 4, 6 a potom 3, 4, 5: znak pravé ruky.",
    melodieFrage:
      "Dvě ruce po sobě: jedna hraje melodii (výš, pohyblivě), druhá doprovází nízko. Která přišla jako melodie?",
    melodieWahl: ["Hlas zahraný jako první", "Druhý hlas"],
    melodieErkl: "Melodie je vyšší, pohyblivý hlas - většinou pravá ruka.",
    rechteHandFrage: (ton: string): string =>
      `Napiš znak pravé ruky (body 4, 6 · 3, 4, 5) a potom notu ${ton} s oktávovým znakem.`,
    rechteHandZellen: ["pravá ruka, první buňka - body 4, 6", "pravá ruka, druhá buňka - body 3, 4, 5"],
    rechteHandErkl: "Za znakem ruky začíná hlas oktávovým znakem.",
    pedalFrage: "Který znak pedálu to je - a stojí před notou, nebo za ní?",
    pedalWahl: ["Pedál dolů - PŘED notou", "Pedál nahoru - ZA notou"],
    pedalErklNieder: "Pedál dolů (body 1, 2, 6 · 1, 4) stojí před notou, od které se pedál sešlápne.",
    pedalErklAuf: "Pedál nahoru (body 1, 6 · 1, 4) stojí za notou, se kterou se pedál pustí.",
  },

  gesang: {
    melismaFrage: "Na slabice „la“ - kolik tónů hlas zpívá? (Víc tónů na jedné slabice se říká melisma.)",
    melismaWahl: ["Jeden tón", "Dva tóny", "Tři tóny"],
    melismaErkl: (n: number): string =>
      `Slabika dostane ${n} ${tvarCs(n, "tón", "tóny", "tónů")} - melisma. V Braillově písmu je spojí slabikový oblouk (body 1, 4).`,
    bogenFrage:
      "Jedna slabika na dvou tónech: napiš první notu, slabikový oblouk (body 1, 4) a druhou notu.",
    bogenZelle: "slabikový oblouk - body 1, 4",
    bogenErkl: "Slabikový oblouk říká: oba tóny patří k jedné slabice.",
    atemFrage: "V tomto řádku stojí dechové znaménko. Po kterém tónu se nadechuje?",
    atemWahl: ["Po prvním tónu", "Po druhém tónu", "Po třetím tónu"],
    atemErkl: "Poloviční dechové znaménko (body 3, 4, 5 · 2) stojí hned po prvním tónu.",
    zeilenFrage: "Ve zpěvu se střídají řádky textu a řádky hudby. Která předpona ohlašuje řádek TEXTU?",
    zeilenWahl: ["Předpona textu (body 5, 6 · 2, 3)", "Předpona hudby (bod 6 · 3)"],
    zeilenErkl: "Řádek textu nese předponu body 5, 6 · 2, 3; řádek hudby bod 6 · bod 3 (dvě buňky).",
  },

  gitarre: {
    saiteFrage:
      "Znak struny (body 1, 4, 6) a číslice říkají, na které struně se hraje. Která struna to je?",
    saiteWahl: (s: number): string => `${s}. struna`,
    saiteErkl: (s: number): string => `Znak struny plus číslice ${s}: ${s}. struna.`,
    schreibenFrage: (saite: number, ton: string): string =>
      `Napiš údaj pro ${saite}. strunu a potom notu ${ton}: nejdřív znak struny (body 1, 4, 6), potom číslici, potom notu.`,
    saitenzeichenZelle: "znak struny - body 1, 4, 6",
    ziffernZelle: (saite: number): string => `číslice ${saite} - ${saite}. struna`,
    schreibenErkl: "Znak struny stojí před notou; potom NENÁSLEDUJE oktávový znak.",
    akkordSorten: { dur: "durový trojzvuk", moll: "mollový trojzvuk", sept: "dominantní septakord (7 kurzívou)" },
    akkordFrage:
      "Poslechni si rozložený akord - jaký druh to je? (Kroužek, trojúhelník a 7 kurzívou jsou mezinárodní; písmenné značky jako „C7“ píše každá země trochu jinak.)",
    akkordErkl: (sorte: string): string => `Byl to ${sorte}.`,
  },

  generalbass: {
    aussetzungFrage:
      "Basová nota má číslování 6 (šestka). Které provedení zní správně - se sextou, nebo s kvintou nad basem?",
    aussetzungWahl: ["Tercie a sexta nad basem", "Tercie a kvinta nad basem"],
    aussetzungErklSext: "Číslo 6 žádá sextu nad basem - sextakord.",
    aussetzungErklQuint: "Bez čísla (nebo 5/3) zní základní akord s kvintou.",
    stufeFrage: "Generálbas myslí ve stupních. Který hlavní stupeň tu slyšíš?",
    stufeWahl: ["Tónika (stupeň I)", "Subdominanta (stupeň IV)", "Dominanta (stupeň V)"],
    stufeErkl: [
      "Byla to tónika (stupeň I) - most od kadence ke generálbasu.",
      "Byla to subdominanta (stupeň IV) - most od kadence ke generálbasu.",
      "Byla to dominanta (stupeň V) - most od kadence ke generálbasu.",
    ],
    schreibenFrage:
      "Napiš číslovanou basovou notu: c a pod ním číslování 6 (číselný znak a dolní číslice 6).",
    zahlzeichenZelle: "číselný znak - body 3, 4, 5, 6",
    ziffer6Zelle: "dolní číslice 6 - body 2, 3, 5",
    schreibenErkl: "Číslice generálbasu stojí jako DOLNÍ číslice za číselným znakem.",
  },

  partitur: {
    auftakt: {
      frage: "Skladba začíná předtaktím. Jaké číslo má tento první, neúplný takt?",
      wahl: ["Takt 0", "Takt 1", "Takt 2"],
      erkl: "Předtaktí se počítá jako takt 0 - první plný takt je potom takt číslo jedna.",
    },
    taktzahl: {
      frage: "Takhle vypadá číslo taktu na okraji řádku (tady: 16). Stojí před ním číselný znak?",
      wahl: ["Ne - čísla taktů stojí bez číselného znaku", "Ano - vždycky s číselným znakem"],
      erkl: "Čísla taktů na okraji stojí bez číselného znaku - jen samotné číslice.",
    },
    format: {
      frage: "Jak braillská partitura uspořádá dvě ruce nebo hlasy, aby se daly porovnávat takt po taktu?",
      wahl: ["Po úsecích řádek nad řádkem (takt nad taktem)", "Všechno do jediného dlouhého řádku"],
      erkl: "Ve formátu takt nad taktem stojí hlasy po úsecích nad sebou - čitelné takt vedle taktu.",
    },
    quellen: {
      frage: "Kde se dají sehnat hotová vydání braillských not ke čtení?",
      wahl: ["V knihovnách pro nevidomé, jako je dzb lesen nebo SBS", "Jedině je vlastnoručně opsat"],
      erkl: "Knihovny jako dzb lesen (Lipsko) a SBS (Curych) nabízejí tisíce titulů v braillských notách.",
    },
  },

  orchester: {
    familieKlavier: "strunný nástroj (úderový)",
    familieGitarre: "strunný nástroj (drnkací)",
    familieBlas: "vzduchový nástroj (dechový)",
    hoerenFrage: "Poslechni si krátký motiv - do které rodiny nástrojů patří tento zvuk?",
    hoerenWahl: ["Strunné nástroje - drnkací nebo úderové", "Vzduchové nástroje - dechové", "Blanozvučné nástroje - bicí"],
    hoerenErkl: (instrument: string, familie: string): string => `${instrument}: ${familie}.`,
    fragen: [
      { frage: "Do které rodiny patří buben (podle Hornbostela a Sachse)?", richtig: "Blanozvučné nástroje", falsch: ["Strunné nástroje", "Vzduchové nástroje"] },
      { frage: "Do které rodiny patří housle?", richtig: "Strunné nástroje", falsch: ["Vzduchové nástroje", "Blanozvučné nástroje"] },
      { frage: "Do které rodiny patří zobcová flétna?", richtig: "Vzduchové nástroje", falsch: ["Blanozvučné nástroje", "Samozvučné nástroje"] },
      { frage: "Do které rodiny patří triangl?", richtig: "Samozvučné nástroje", falsch: ["Blanozvučné nástroje", "Strunné nástroje"] },
    ],
    familieErkl: (richtig: string): string => `Správně: ${richtig}.`,
  },

  // --- Svět 9 „Písničkové pódium" -------------------------------------------
  lieder2: {
    dazuWahl: [
      "Zesilovalo se - crescendo",
      "Tóny byly krátké - staccato",
      "Tóny do sebe měkce plynuly - legato",
    ],
    dazuDynamikFrage: (titel: string): string => `„${titel}“ - nejdřív suše, potom s výrazem. Co přibylo?`,
    dazuDynamikErkl: "Druhá verze zesilovala - crescendo.",
    dazuStaccatoFrage: (titel: string): string => `„${titel}“ - co přibylo k suché verzi?`,
    dazuStaccatoErkl: "Tóny byly krátké a špičaté - staccato.",
    dazuLegatoFrage: (titel: string): string => `„${titel}“ - co přibylo?`,
    dazuLegatoErkl: "Tóny byly měkce spojené - legato, legatový oblouk.",
    articFrage: (titel: string): string => `„${titel}“ - zahráno spojeně (legato), nebo krátce (staccato)?`,
    articWahl: ["Spojeně - legato", "Krátce - staccato"],
    articErklLegato: "Tóny do sebe plynuly - legato.",
    articErklStaccato: "Každý tón krátce oddělený - staccato.",
  },

  lesekonzert: {
    frage:
      "Koncert čtení: přečti braillský řádek (NEBUDE se přehrávat!), vtiskni si ho do paměti a stiskni „Dočteno“. Potom zahraj tóny zpaměti na klaviatuře.",
    erkl: "Číst, zapamatovat si, hrát - přesně tak se čtou braillské noty u nástroje.",
  },

  liederquiz: {
    hoerenFrage: "Poslechni si začátek - která písnička to je?",
    hoerenErkl: (titel: string): string => `Byl to začátek písničky „${titel}“.`,
    lesenFrage: "Přečti první řádek v Braillově písmu - bez zvuku! Kterou písničku poznáš?",
    lesenErkl: (titel: string): string => `Tento řádek je začátek písničky „${titel}“ - tiché čtení vnitřním uchem.`,
  },

  liedZeile: {
    frage: (titel: string, zeile: number): string =>
      `${titel}, řádek ${zeile}: nejdřív poslechnout, potom psát notu po notě - teď S oktávovými znaky.`,
  },
};
