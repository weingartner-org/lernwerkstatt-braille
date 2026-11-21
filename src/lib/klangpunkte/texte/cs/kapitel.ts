/**
 * Bereich `kapitel` - Čeština. Názvy, úvody (introDu: dítě, „ty"; introSie: dospělí a
 * vyučující, neosobně) a popisy jednotek kapitol (`KLANG_ETAPPEN`).
 * Fachwörter: tschechische Musiklehre (osminová, čtvrťová, půlová, celá, šestnáctinová nota,
 * křížek, béčko, odrážka, notová osnova, vázací oblouk, předtaktí). Quellenangaben bleiben.
 * Unsichere Wörter stehen im Bericht unter „Unsicher".
 */
import type { kapitel as De } from "../de/kapitel";

export const kapitel: typeof De = {
  noteSatz: (ton: string, wert: string): string => `${ton} jako ${wert}`,
  noteWert: {
    achtel: "osminová nota",
    viertel: "čtvrťová nota",
    halbe: "půlová nota",
    ganze: "celá nota",
    sechzehntel: "šestnáctinová nota (stejná buňka jako celá nota)",
  },
  kap: {
    "kp1": {
      titel: "Vysoko, nebo nízko? - Uši nastražit",
      introDu: "Než začneme noty hmatat, procvičíme to nejdůležitější: pozorně poslouchat. Výš, nebo níž, nahoru, nebo dolů - rozhoduje tvoje ucho.",
      introSie: "Hudební připravenost před písmem (Taesch, Phase One): sluchové rozlišení výšky a směru tónu jako základ čtení not.",
      einheiten: {},
    },
    "kp2": {
      titel: "Vyťukej rytmus",
      introDu: "Hudba má tep srdce. Poslechni si vzor z dlouhých a krátkých tónů a vyťukej ho mezerníkem.",
      introSie: "Rytmická reprodukce před rovinou symbolů (RNIB: jedna ruka čte, druhá ťuká - tady jako předstupeň s mezerníkem).",
      einheiten: {},
    },
    "kp3": {
      titel: "Noty jsou staří známí",
      introDu: "Překvapení: noty už znáš! c d e f g a h jsou braillská písmena d e f g h i j - abeceda posunutá o jeden krok. Základní tvar je osminová nota.",
      introSie: "Jádro analogie dekád (workshop Schmid/BBI): výšky tónů c-h = písmena d-j; osminový tvar jako logický základní tvar znaku (Krolick, odst. 1-1).",
      einheiten: {},
    },
    "kp4": {
      titel: "První melodie",
      introDu: "Teď to bude hudba: malé melodie z tvých nových not - poslechnout, číst s nimi, napsat. Každá správná nota zazní!",
      introSie: "Smysl od začátku: krátké motivy místo izolovaných znaků (princip Hadley: zvuk ke každému cvičení).",
      einheiten: {},
    },
    "kp5": {
      titel: "Čtvrťové noty - přidej bod 6",
      introDu: "Trik s hodnotami: u čtvrťové noty se prostě přidá bod 6 - přesně jako když z abecedy od a do j vznikne další řada. Stejná nota, delší tón.",
      introSie: "Hodnoty not pomocí mechaniky dekád (bod 6 = čtvrťová), De Garmo, kap. 3.",
      einheiten: {},
    },
    "kp6": {
      titel: "Půlové a celé noty",
      introDu: "Bod 3 navíc = půlová nota. Body 3 A 6 = celá nota. Tím znáš všechny čtyři základní hodnoty - a slyšíš, jak různě dlouho znějí.",
      introSie: "Doplnění řady hodnot (De Garmo, kap. 4-5): půlová (+3), celá (+3+6).",
      einheiten: {},
    },
    "kp7": {
      titel: "Pomlky a takt",
      introDu: "I ticho je hudba: čtyři pomlky. A to nejbláznivější na braillských notách: taktová čára je prostě mezera!",
      introSie: "Znaky pomlk (Krolick, tab. 1A) + taktové označení a taktová čára (odst. 3-6, 1-7): taktová čára = mezera.",
      einheiten: {
        "r:ganze": "celá pomlka",
        "r:halbe": "půlová pomlka",
        "r:viertel": "čtvrťová pomlka",
        "r:achtel": "osminová pomlka",
        "sig:4/4": "taktové označení čtyři čtvrtě",
        "sig:3/4": "taktové označení tři čtvrtě",
      },
    },
    "kp8": {
      titel: "Noty s tečkou",
      introDu: "Tečka prodlouží notu o polovinu. V Braillově písmu dostane VLASTNÍ buňku: bod 3, hned za notou.",
      introSie: "Prodlužovací tečka jako následná buňka (Krolick, odst. 1-2).",
      einheiten: {
        "dot": "prodlužovací tečka (nota s tečkou)",
      },
    },
    "kp9": {
      titel: "Křížek, béčko a odrážka",
      introDu: "Někdy se tón posune o půl kroku: křížek ho zvýší, béčko sníží a odrážka to vrátí zpátky. Znak stojí hned PŘED notou.",
      introSie: "Posuvky před notou (Krolick, kap. III, De Garmo, kap. 6 - záměrně PŘED oktávovými znaky).",
      einheiten: {
        "acc:kreuz": "křížek",
        "acc:be": "béčko",
        "acc:aufloesung": "odrážka",
      },
    },
    "kp10": {
      titel: "Oktávové znaky - poloha",
      introDu: "V Braillově písmu není žádný notový klíč! Místo něj oktávové znaky říkají, JAK vysoko nota leží. První nota skladby dostane oktávový znak vždycky.",
      introSie: "Oktávové znaky místo klíče (Krolick, odst. 1-8/1-9; De Garmo, kap. 7 - po řadě hodnot).",
      einheiten: {
        "oct:3": "oktávový znak malé oktávy",
        "oct:4": "oktávový znak jednočárkované oktávy",
        "oct:5": "oktávový znak dvoučárkované oktávy",
      },
    },
    "kp11": {
      titel: "Oktávové znaky - pravidla",
      introDu: "Kdy potřebuje nota oktávový znak? Sekunda a tercie: nikdy. Kvarta a kvinta: jen při změně oktávy. Od sexty: vždycky. Staň se oktávovým detektivem!",
      introSie: "Pravidla psaní (Krolick, odst. 1-10) jako rozhodovací úlohy - podle dokumentace nejčastější technická překážka (NLS).",
      einheiten: {},
    },
    "kp12": {
      titel: "Celá, nebo šestnáctinová?",
      introDu: "Tajemství braillských not: stejná buňka může znamenat celou notu NEBO šestnáctinovou! Co je myšleno, ti prozradí takt. Detektivní práce!",
      introSie: "Dvojznačnost hodnot (Krolick, kap. 1, Whole Note or 16th?): rozlišení podle taktu a souvislostí.",
      einheiten: {},
    },
    "kp13": {
      titel: "Opakování a forma",
      introDu: "Hudba se ráda opakuje - a Braillovo písmo chytře zkracuje: vlastní znak říká: tenhle takt ještě jednou! K tomu repetice a závěrečná čára.",
      introSie: "Znaky opakování a formy (Krolick, kap. IX): simile ⠶ jako zkratka vlastní Braillovu písmu, repetice, závěrečná čára.",
      einheiten: {
        "sim": "opakování taktu (simile)",
        "rep-start": "začátek repetice",
        "rep-end": "konec repetice",
        "final": "závěrečná čára",
      },
    },
    "kp14": {
      titel: "Písničková dílna",
      introDu: "Teď hraješ skutečnou hudbu! Vyber si písničku - poslechnout, přečíst v Braillově písmu, napsat zpaměti. Nejdřív číst, pak slyšet v hlavě, pak hrát.",
      introSie: "Použití na skutečném repertoáru: přečíst - zapamatovat si - zahrát (RNIB) + melodický diktát (Taesch); dvě police (dětské písničky / klasika a evergreeny), všechny melodie volná díla, vlastní přepisy.",
      einheiten: {},
    },
    "kp-haltebogen": {
      titel: "Vázací oblouk",
      introDu: "Dvě stejné noty, JEDEN dlouhý tón: vázací oblouk je spojí - druhá se znovu nehraje. V Braillově písmu jsou to dvě buňky hned za notou.",
      introSie: "Vázací oblouk (Krolick, kap. VI): ⠈⠉ za notou; nejdřív sluchové rozlišení spojeno/odděleno, potom zápis (De Garmo spojuje vázání brzy s půlovými notami, kap. 4).",
      einheiten: {
        "tie": "vázací oblouk (dvě buňky: bod 4, potom body 1 a 4)",
      },
    },
    "kp-auftakt": {
      titel: "Předtaktí a neúplné takty",
      introDu: "Ne každý takt je plný: na začátku smí stát krátké předtaktí, na konci zbytek taktu. A když řádek skončí uprostřed taktu, pomůže hudební spojovník.",
      introSie: "Neúplné takty a předtaktí + hudební spojovník (Krolick, kap. III/IX; De Garmo: incomplete measures): počítání taktu jako poslechové a písemné cvičení.",
      einheiten: {
        "hyphen": "hudební spojovník (takt pokračuje na dalším řádku)",
      },
    },
    "kp-pausen2": {
      titel: "Dlouhé ticho",
      introDu: "Když mlčí hodně taktů, Braillovo písmo chytře počítá: do tří prázdných taktů se celá pomlka prostě napíše víckrát - od čtyř stojí před ní počet jako číslo.",
      introSie: "Vícetaktové pomlky (Krolick, odst. 1-7): ⠍⠍⠍ nebo číslo + celá pomlka; cvičení na počítání, psaní a poslech.",
      einheiten: {
        "mrest:4": "vícetaktová pomlka (číselný znak, počet, celá pomlka)",
      },
    },
    "kp-tonart": {
      titel: "Tónina stojí na začátku",
      introDu: "Křížky nebo béčka úplně na začátku platí pro CELOU skladbu: předznamenání. Do tří se znak opakuje, od čtyř stojí před ním číslo - a hned za ním přijde taktové označení.",
      introSie: "Předznamenání tóniny (Krolick, odst. 3-4; De Garmo, kap. 6): opakovací tvar do 3, číselný tvar od 4; hlavička skladby = tónina + taktové označení spolu (odst. 3-5).",
      einheiten: {
        "key:2:kreuz": "předznamenání: dva křížky (D dur)",
        "key:2:be": "předznamenání: dvě béčka (B dur)",
        "key:4:kreuz": "předznamenání: čtyři křížky - od čtyř s číselným znakem (E dur)",
      },
    },
    "kp-taktwechsel": {
      titel: "Takt se mění",
      introDu: "Uprostřed skladby může stát nové taktové označení - od té chvíle se počítá jinak. K tomu dva zvláštní znaky: C (čtyřčtvrťový takt) a alla breve (dvoupůlový takt).",
      introSie: "Změna taktu + zvláštní taktová označení C/alla breve (Krolick, odst. 3-6/3-8; De Garmo, kap. 10).",
      einheiten: {
        "csig": "C - čtyřčtvrťový takt",
        "acsig": "alla breve - dvoupůlový takt",
      },
    },
    "kp-schluessel": {
      titel: "Klíče - jen pro znalost",
      introDu: "Houslový a basový klíč existují i v Braillově písmu - ale jen jako informace o tištěných notách! Polohu ti vždycky řeknou oktávové znaky. Hodí se to znát pro rozhovory s lidmi, kteří hrají z tištěných not, a pro MuseScore.",
      introSie: "Znaky klíčů (Krolick, kap. II - výslovně informativní; kontrola music21): most k černotisku.",
      einheiten: {
        "clef:violin": "houslový klíč (tři buňky)",
        "clef:bass": "basový klíč (tři buňky)",
        "clef:alt": "klíč C (tři buňky)",
      },
    },
    "kp-sechzehntel": {
      titel: "Hbité šestnáctinové noty",
      introDu: "Šestnáctinové noty používají STEJNOU buňku jako celá nota - ten trik znáš z kapitoly „Celá, nebo šestnáctinová?“. Nové je: ve skupinách nese body hodnoty jen PRVNÍ nota, ostatní vypadají jako osminové.",
      introSie: "Malé hodnoty + pravidlo seskupování (Krolick, odst. 4-2; De Garmo, kap. 15): body hodnoty jen na první notě skupiny - braillský protějšek trámců.",
      einheiten: {},
    },
    "kp-triolen": {
      titel: "Trioly a nepravidelné skupiny",
      introDu: "Tři tóny se dělí o jednu dobu, kde jinak bydlí dva: triola. V Braillově písmu stojí její znak (body 2, 3) jednou před skupinou.",
      introSie: "Nepravidelné skupiny (Krolick, kap. IV; De Garmo, kap. 16): znak trioly ⠆; duolu a triolu nejdřív rozlišit sluchem.",
      einheiten: {
        "tri": "znak trioly (jednou před trojicí not)",
      },
    },
    "kp-puls": {
      titel: "Lovení pulsu",
      introDu: "Každá hudba má tep srdce - základní dobu. Chyť ji: ťukej ji pravidelně s hudbou, poslouchej přízvučné doby a rozliš pochod (na dvě) od valčíku (na tři).",
      introSie: "Cit pro puls před písmem (KOMU MKe, ABRSM Aural G1): držet základní dobu, rozlišit dvoudobý a třídobý takt podle přízvuku - ukotveno pohybem (praxe nevidomých: ťukat, ne jen poslouchat).",
      einheiten: {},
    },
    "kp-lauschen-dauer": {
      titel: "Dlouhý, nebo krátký?",
      introDu: "Než začneš psát hodnoty not, uslyšíš je: Který tón zněl déle? Kolik dob trval? Tvoje ucho se učí poznat čtvrťovou, půlovou a celou notu jako ZVUK.",
      introSie: "Zvuk před znakem (Taesch): délky tónů nejdřív sluchem porovnat a pojmenovat (KOMU MKe, předstupeň k hodnotám v kp5/kp6).",
      einheiten: {},
    },
    "kp-lauschen-dynamik": {
      titel: "Nahlas a potichu",
      introDu: "Hudba žije ze střídání hlasitě a potichu. Poslouchej: nahlas, nebo potichu? Zesiluje, nebo zeslabuje? Kde je přízvučný tón? To je přípravné cvičení k dynamice v Braillově písmu.",
      introSie: "Sluchová příprava dynamiky (Aural G1): forte/piano, crescendo/decrescendo a akcent nejdřív slyšet - dřív než svět 4 přinese jejich znaky.",
      einheiten: {},
    },
    "kp-instrumente": {
      titel: "Který nástroj?",
      introDu: "Klavír, kytara, saxofon nebo příčná flétna - každý zní jinak. Poslouchej barvu zvuku: Který nástroj hraje? Hrají dva motivy stejné, nebo různé nástroje?",
      introSie: "Rozlišování barvy zvuku (KOMU MKe): úderové, drnkací, dechové - se čtyřmi syntetickými hlasy.",
      einheiten: {},
    },
    "kp-echo": {
      titel: "Hra na ozvěnu",
      introDu: "Já hraju, ty hraješ po mně! Poslechni si malou řadu tónů a zahraj ji na klaviatuře - D F G H J K L jsou c d e f g a h. Počítají se jen tóny, rytmus je volný.",
      introSie: "Přehrávání ozvěnou jako první stupeň schodiště dovedností (Gordon Aural/Oral): tónový prostor g-e, pak +a, pak pentatonika (Kodály), zadání se slyšitelně přehraje zpět.",
      einheiten: {},
    },
    "kp-melodie-memory": {
      titel: "Pexeso melodií",
      introDu: "Jako pexeso, jen s tóny: když řadu zvládneš, jeden tón přibude. Jak daleko se dostaneš? Paměťová hra pro vnitřní ucho.",
      introSie: "Paměť audiace (princip hry Simon, Gordon): přehrávat rostoucí řady tónů; hvězdičky podle nejlepší délky (§12).",
      einheiten: {},
    },
    "kp-bindebogen": {
      titel: "Legatový oblouk (legato)",
      introDu: "Legatový oblouk říká: hraj tyto tóny měkce spojené, legato. Nezaměnit s vázacím obloukem! Ten spojí stejné tóny do JEDNOHO - legatový oblouk spojuje různé.",
      introSie: "Frázování (Krolick, kap. VI, §6-2/3): legatový oblouk ⠉ za každou notou kromě poslední, zdvojení nad čtyřmi notami; záměna vázací/legatový oblouk se aktivně staví do kontrastu.",
      einheiten: {
        "slur": "legatový oblouk (body 1, 4 - za každou notou kromě poslední)",
        "slur-bracket": "frázovací oblouk v podobě závorek (jen na poznání)",
      },
    },
    "kp-artikulation": {
      titel: "Staccato, akcent a spol.",
      introDu: "Jak se tón zahraje? Krátce odděleně (staccato), plně podržený (tenuto), nebo s důrazem (akcent)? Tyto znaky stojí PŘED notou - jen koruna, která zastaví závěr, stojí za ní.",
      introSie: "Artikulace (Krolick, kap. X, slovník KOMU MK1): staccato/tenuto/akcent před notou (zdvojení od 4), koruna za notou a nikdy zdvojená.",
      einheiten: {
        "art:staccato": "staccato (body 2, 3, 6 - před notou)",
        "art:tenuto": "tenuto (body 4, 5, 6 · body 2, 3, 6)",
        "art:akzent": "akcent (body 4, 6 · body 2, 3, 6)",
        "fermate": "koruna (za notou: body 1, 2, 6 · body 1, 2, 3)",
      },
    },
    "kp-dynamik": {
      titel: "Nahlas a potichu v Braillově písmu",
      introDu: "Teď dostane hlasitost své znaky: před každým přednesovým slovem stojí slovní znak (body 3, 4, 5), potom následuje f (forte), p (piano) a spol. A vidlice ukazují crescendo a decrescendo.",
      introSie: "Dynamika v Braillově písmu (Krolick, kap. X, §10-2 až 6): slovní znak + písmena textového písma, vidlice cresc/decr; navazuje na poslech z 1.5.",
      einheiten: {
        "dyn:p": "piano (slovní znak a p)",
        "dyn:f": "forte (slovní znak a f)",
        "dyn:mf": "mezzoforte (slovní znak, m, f)",
        "dyn:pp": "pianissimo (slovní znak a dvakrát p)",
        "dyn:ff": "fortissimo (slovní znak a dvakrát f)",
        "dyn:cr": "začátek vidlice crescendo (345-14)",
        "dyn:decr": "začátek vidlice decrescendo (345-145)",
      },
    },
    "kp-tempo": {
      titel: "Tempová označení a metronom",
      introDu: "Largo, Andante, Presto - tempová označení říkají, jak rychle se hraje. Poslechni si je, nauč se, co znamenají, a napiš přesný údaj metronomu „čtvrťová nota rovná se 60“.",
      introSie: "Tempo (seznam KOMU MK1 + accel/rit): jako poslechová a vědomostní slovní zásoba; údaj metronomu (Krolick §14-17: buňka noty, rovnítko, číselný znak, číslice).",
      einheiten: {
        "metronom": "údaj metronomu (čtvrťová nota, rovnítko, číselný znak, číslice)",
      },
    },
    "kp-verzierungen1": {
      titel: "Ozdoby I - příraz a trylek",
      introDu: "Malé ozdobné tóny zdobí melodii: příraz (jeden tón předtím) a trylek (rychlé střídání). Jejich znaky stojí vždycky PŘED notou.",
      introSie: "Ozdoby (Krolick, kap. XI, §11-3/6/7): krátký/dlouhý příraz, trylek - zvuk přes ornamentToEvents, znak před notou.",
      einheiten: {
        "orn:vorschlag": "krátký příraz (body 2, 6)",
        "orn:vorschlag-lang": "dlouhý příraz (bod 5 · body 2, 6)",
        "orn:triller": "trylek (body 2, 3, 5)",
      },
    },
    "kp-verzierungen2": {
      titel: "Ozdoby II - obal, mordent, tremolo",
      introDu: "Ještě víc ozdob: obal se ovine kolem tónu, nátryl a mordent ho krátce rozechvějí, tremolo ho nechá rychle opakovat. Zapamatuj si, kde který znak stojí.",
      introSie: "Další ozdoby (Krolick, kap. XI/VII, nepovinné): obal/nátryl/mordent před notou, opakovací tremolo za notou, rozložené tremolo mezi notami.",
      einheiten: {
        "orn:doppelschlag": "obal (body 2, 5, 6)",
        "orn:pralltriller": "nátryl (bod 5 · body 2, 3, 5)",
        "orn:mordent": "mordent (bod 5 · body 2, 3, 5 · body 1, 2, 3)",
        "trem:rep8": "opakovací tremolo v osminách (body 4, 5 · body 1, 2)",
        "trem:alt8": "rozložené tremolo v osminách (body 4, 6 · body 1, 2)",
      },
    },
    "kp-ausdruck-lied": {
      titel: "S citem! - v písničce",
      introDu: "Teď dáš všechno dohromady: vezmi začátek skutečné písničky a poslechni si ho nebo ho napiš S výrazem - jednou spojeně, jednou krátce, jednou s přednesovým slovem před ním. Tak zní hudba živě.",
      introSie: "Celek - část - celek (pravidlo 4): výrazové znaky ze světa 4 použít na skutečné písničky z polic; porovnat suchou verzi a verzi s výrazem.",
      einheiten: {},
    },
    "kp-braillerepeats": {
      titel: "Braillovo písmo šetří práci",
      introDu: "Braillovo písmo je chytré: místo aby stejný takt psalo ještě jednou, napíše znak simile - a s číslem za ním dokonce řekne, kolikrát. Ale pozor: ne na první době řádku!",
      introSie: "Zkracování opakování (Krolick, kap. IX, §9-15/36): pravidla simile do hloubky, počítané opakování 2356-3456-N; zkratka vlastní Braillovu písmu.",
      einheiten: {
        "count-rep": "počítané opakování (simile, číselný znak, počet)",
      },
    },
    "kp-volten": {
      titel: "Volty, da capo a segno",
      introDu: "Jak se čtou ukazatele formy? Volta 1 a volta 2 dají opakování nový konec, segno a coda označují cíle skoků a „D.C.“ znamená: od začátku!",
      introSie: "Znaky formy (Krolick, kap. IX, §9-6/8/9): volta s DOLNÍMI číslicemi, segno/coda, pravidlo da capo jako text; pořadí hraní jako hlavolam.",
      einheiten: {
        "volta:1": "volta 1, první volta (číselný znak, dolní 1)",
        "volta:2": "volta 2, druhá volta (číselný znak, dolní 2)",
        "segno": "segno (body 3, 4, 6)",
        "coda": "coda (body 3, 4, 6 · body 1, 2, 3)",
      },
    },
    "kp-formen": {
      titel: "Poslouchat formy",
      introDu: "Hudba má stavební plány: Vrátí se začátek (A-B-A)? Kolikrát se v rondu vrátí refrén? Je opakování přesné - nebo je to variace? Poslouchej formu.",
      introSie: "Hudební forma (rakouský učební plán nižšího sekundárního stupně, 2. ročník, ABRSM Aural G2): písňová forma, rondo, variace poslechem stavebních kamenů motivu.",
      einheiten: {},
    },
    "kp-intervalle1": {
      titel: "Poslouchat intervaly I",
      introDu: "Dva tóny - jak daleko jsou od sebe? Nejdřív kontrast primy, kvinty a oktávy, potom přibudou tercie. Zapamatuj si kukaččí tercii a kvartu z Amazing Grace.",
      introSie: "Poslech intervalů (KOMU MK1, písně na zapamatování): nejdřív prima/kvinta/oktáva, potom tercie, kvarta, sexta - po sobě, potom současně.",
      einheiten: {},
    },
    "kp-intervalle2": {
      titel: "Intervaly v Braillově písmu",
      introDu: "Teď píšeš dvojzvuky: v horním hlasu stojí NEJVYŠŠÍ nota a intervalový znak se počítá směrem dolů. Tak jediný znak přidá druhý tón.",
      introSie: "Intervalové znaky (Krolick, kap. V, tab. 5A): 34/346/3456/35/356/25/36 a směr čtení v diskantu (nejvyšší nota, intervaly dolů).",
      einheiten: {
        "int:2": "sekunda (body 3, 4)",
        "int:3": "tercie (body 3, 4, 6)",
        "int:4": "kvarta (body 3, 4, 5, 6)",
        "int:5": "kvinta (body 3, 5)",
        "int:6": "sexta (body 3, 5, 6)",
        "int:7": "septima (body 2, 5)",
        "int:8": "oktáva (body 3, 6)",
      },
    },
    "kp-intervalle3": {
      titel: "Poslouchat intervaly II",
      introDu: "Nepovinná část: teď přibudou drsné intervaly - sekunda a septima - a odhaduješ, jestli je souzvuk větší, nebo menší než kvinta. Nahoru i dolů.",
      introSie: "Jemné určování intervalů (KOMU MK2): sekunda/septima/tritón, nahoru i dolů, odhadové úlohy kolem kvinty.",
      einheiten: {},
    },
    "kp-akkorde1": {
      titel: "Dur, nebo moll?",
      introDu: "Tři tóny dohromady jsou trojzvuk. Zní jasně (dur), nebo tmavě (moll)? A přicházejí tóny jednotlivě (rozloženě), nebo všechny najednou? Tvoje ucho se učí barvu akordů.",
      introSie: "Poslech akordů (KOMU MK1): rozlišit dur/moll, rozložený vs. současný, nepovinně zmenšený.",
      einheiten: {},
    },
    "kp-akkorde2": {
      titel: "Psát akordy",
      introDu: "Trojzvuk píšeš jako dvojzvuk: nejvyšší notu, potom intervalové znaky pro tercii a kvintu směrem dolů. Jeden tón, dva znaky - a akord je hotový.",
      introSie: "Zápis akordů (Krolick, kap. V): základní tón plus intervalové znaky (pravidlo diskantu: nejvyšší nota, tercie a kvinta dolů), zdvojení oktávy.",
      einheiten: {},
    },
    "kp-inakkord": {
      titel: "Dva hlasy, jeden řádek",
      introDu: "Jak se píšou dva hlasy do JEDNOHO braillského řádku? Rozdělí je znak in-accord: nejdřív horní hlas, potom znak, potom dolní hlas - každý s vlastním oktávovým znakem.",
      introSie: "In-accord (Krolick, kap. V, §5-11/12): in-accord celého taktu 126-345, potom nový oktávový znak; brána ke klavírní hudbě.",
      einheiten: {
        "inacc": "in-accord celého taktu (body 1, 2, 6 · body 3, 4, 5)",
        "inacc-teil": "in-accord části taktu (bod 5 · bod 2)",
      },
    },
    "kp-tonleitern": {
      titel: "Stupnice",
      introDu: "Osm stupňů od jednoho tónu k dalšímu stejnému: stupnice. Zahraj stupnici C dur, poslechni si rozdíl mezi dur a moll a najdi posunutý stupeň.",
      introSie: "Stupnice (ABRSM G1, KOMU MK1): hrát C dur, poslouchat dur/moll, najít chybný stupeň, napsat G dur s křížkem.",
      einheiten: {},
    },
    "kp-quintenzirkel": {
      titel: "Rallye kvintovým kruhem",
      introDu: "Rallye tóninami: Kolik křížků má G dur? Která tónina má dvě béčka? Nauč se předznamenání do čtyř křížků a čtyř béček - dopředu i pozpátku.",
      introSie: "Kvintový kruh (jádro KOMU MK1): tónina ↔ počet předznamenání do 4♯/4♭, číst předznamenání v Braillově písmu.",
      einheiten: {},
    },
    "kp-rhythmusdiktat": {
      titel: "Rytmický diktát",
      introDu: "Já vyťukám takt - ty napíšeš hodnoty. Počítá se jen rytmus, výška tónu zůstává stejná. A naopak: přečti rytmus z listu a vyťukej ho.",
      introSie: "Rytmický diktát (KOMU MKe → MK1): zapisovat hodnoty podle sluchu (diktát) a ťukat z listu (obrácená úloha); rytmické slabiky při řešení.",
      einheiten: {},
    },
    "kp-melodiediktat": {
      titel: "Melodický diktát",
      introDu: "Královské cvičení: já zahraju malou melodii, ty ji napíšeš. Začíná malými kroky, první tón se vždycky řekne a poslouchat můžeš, kolikrát chceš.",
      introSie: "Melodický diktát (KOMU MK1 → MK2): 3-5 sousedních tónů od ohlášeného prvního tónu, stupňování až po skoky o tercii a hodnoty; neomezený poslech bez postihu.",
      einheiten: {},
    },
    "kp-detektiv": {
      titel: "Detektiv chyb",
      introDu: "Buď detektivem oprav: přečti braillský řádek a poslechni si nahrávku. Na jednom jediném místě se zvuk liší od not - nebo je všechno v pořádku. Najdeš to místo?",
      introSie: "Korektura (praxe nevidomých: porovnat zápis a zvuk): najít jednu odchylku - cílová dovednost čtení Braillova písma.",
      einheiten: {},
    },
    "kp-baumeister": {
      titel: "Stavitel taktů",
      introDu: "Postav vlastní takty: piš noty a pomlky, dokud doby přesně nesedí k taktovému označení. Málo? Moc? Tvůj takt ti to řekne - a když sedí, zazní.",
      introSie: "Stavitel taktů (build-Engine §4.4): volné buňky not a pomlk, součet hodnot == taktové označení, dvojznačnost podle logiky čtení z kp12; tvořivost + počítání taktu.",
      einheiten: {},
    },
    "kp-spielwiese": {
      titel: "Hrací louka",
      introDu: "Volná hra nad tichým bordunem: s pentatonickými klávesami nemůže žádný tón znít špatně. Vyprávěj malý příběh - jednou potichu, jednou nahlas. Prostě to zkus.",
      introSie: "Orffovská improvizace (§7.7): pentatonika nad kvintovým bordunem, žádný špatný tón, bez hvězdiček - fajfka od 30 zahraných tónů (§12).",
      einheiten: {},
    },
    "kp-kadenzen": {
      titel: "Jak to končí",
      introDu: "Jak zní závěr? Zůstane hudba otevřená (půlzávěr), nebo se uklidní (celý závěr)? A je to silný závěr z dominanty, nebo měkký závěr „amen“?",
      introSie: "Kadence (ABRSM Aural G5, KOMU MK2): půlzávěr vs. celý závěr, plagální vs. autentická, funkce T/S/D.",
      einheiten: {},
    },
    "kp-komponier": {
      titel: "Skladatelská dílna",
      introDu: "Tvůj vlastní list: piš volně, poslechni si své dílo a ulož ho. Do police se vejde až pět děl. Dílna je navštívená, jakmile uložíš první dílo.",
      introSie: "Skladatelská dílna (sandbox-Engine §4.5): volné psaní, poslech, uložení až 5 děl; bez hvězdiček - fajfka od prvního díla (§12).",
      einheiten: {},
    },
    "kp-fingersatz": {
      titel: "Prstoklad",
      introDu: "Který prst hraje kterou notu? Řekne to malá číslice ZA notou: 1 je palec, 5 malíček. Tak ruka vždycky ví, kam.",
      introSie: "Prstoklad (Krolick, kap. XV, tab. 15): prsty 1-5 = 1/12/123/2/13, ZA notou (před vázacím obloukem).",
      einheiten: {
        "finger:1": "palec, prst 1 (bod 1)",
        "finger:2": "ukazováček, prst 2 (body 1, 2)",
        "finger:3": "prostředníček, prst 3 (body 1, 2, 3)",
        "finger:4": "prsteníček, prst 4 (bod 2)",
        "finger:5": "malíček, prst 5 (body 1, 3)",
      },
    },
    "kp-klavier": {
      titel: "Klavírní hudba",
      introDu: "Dvě ruce, dva znaky: pravá ruka většinou hraje melodii, levá doprovází níž. Znak ruky na začátku řádku říká, která ruka je na řadě - a pedál dodá zvuku plnost.",
      introSie: "Klavírní notace (Krolick, kap. XV, tab. 15A): znaky ruky 46-345 / 456-345 (+ oktávový znak za nimi), pedál 126-14 (před) / 16-14 (za).",
      einheiten: {
        "hand:r": "pravá ruka (body 4, 6 · body 3, 4, 5)",
        "hand:l": "levá ruka (body 4, 5, 6 · body 3, 4, 5)",
        "pedal:ab": "pedál dolů (body 1, 2, 6 · body 1, 4)",
        "pedal:auf": "pedál nahoru (body 1, 6 · body 1, 4)",
      },
    },
    "kp-gesang": {
      titel: "Zpěv s Braillovým písmem",
      introDu: "Při zpěvu patří tóny a slabiky k sobě: víc tónů na jedné slabice spojí slabikový oblouk a dechová znaménka říkají, kde se nadechnout. Řádky textu a hudby se střídají.",
      introSie: "Vokální notace (Krolick, kap. XVI): slabikový oblouk 14, nádech 345-2 / 6-34, 2 slabiky na notu 12, předpony řádků 56-23 / 6-3.",
      einheiten: {
        "vocal:silbenbogen": "slabikový oblouk (body 1, 4)",
        "vocal:atem-halb": "poloviční dechové znaménko (body 3, 4, 5 · bod 2)",
        "vocal:atem-voll": "plné dechové znaménko (bod 6 · body 3, 4)",
        "vocal:silben2": "dvě slabiky na jedné notě (body 1, 2)",
      },
    },
    "kp-gitarre": {
      titel: "Kytara a akordové značky",
      introDu: "Na kytaře se počítá struna a poloha: znak struny s číslicí říká, na kterou strunu se drnká, znak polohy, kde ruka hmatá. A akordové značky (kroužek, trojúhelník, 7 kurzívou) prozradí druh akordu.",
      introSie: "Kytarová notace (Krolick, kap. XVII, tab. 17A-C): struny 146+číslice, polohy 345+intervalový znak (7. poloha zvláštní případ 6-345-25), barré 456/45; mezinárodní akordové značky (§3-UNSICHER-3: písmenné značky se v jednotlivých zemích liší).",
      einheiten: {
        "string:3": "struna 3 (znak struny a body 1, 2, 3)",
        "fret:5": "poloha 5 (znak polohy a kvinta)",
        "fret:7": "poloha 7 - zvláštní případ s bodem 6 navíc",
        "barre:voll": "celé barré (body 4, 5, 6)",
        "chordsym:sept": "dominantní septakord, 7 kurzívou",
      },
    },
    "kp-generalbass": {
      titel: "Generálbas a stupně",
      introDu: "Generálbas je zkratkopis pro doprovod: číslovaná basová nota říká, které tóny nad ní zní. A všechno se myslí ve stupních - tónika, subdominanta, dominanta.",
      introSie: "Generálbas (Krolick, kap. XII, §12-15 až 27): předpona části 56-345, číslice = číselný znak + DOLNÍ číslice (nejnižší tištěná číslice první); stupně I-IV-V jako most ke kadenci.",
      einheiten: {
        "gb": "předpona generálbasu (body 5, 6 · body 3, 4, 5)",
      },
    },
    "kp-partitur": {
      titel: "Partitura a tištěný obraz",
      introDu: "Jak je postavená braillská partitura? Čísla taktů stojí bez číselného znaku na okraji (předtaktí je takt 0) a hlasy leží po úsecích nad sebou. Tak se v ní člověk vyzná.",
      introSie: "Nauka o partituře (Krolick, kap. XIV, §14-10 až 13): čísla taktů bez číselného znaku, předtaktí = takt 0, formát takt nad taktem, zdroje (dzb lesen, SBS). Čistě znalosti.",
      einheiten: {
        "taktnr:1": "číslo taktu (horní číslice, bez číselného znaku)",
      },
    },
    "kp-orchester": {
      titel: "Dechy, bicí a spol.",
      introDu: "Nástroje se dají rozdělit do rodin: strunné, vzduchové, blanozvučné a samozvučné - podle toho, co vytváří zvuk. Poslouchej a přiřaď barvy zvuku.",
      introSie: "Nauka o nástrojích (KOMU MK2, Hornbostel-Sachs pro děti): rodiny nástrojů + poslechové přiřazování se čtyřmi syntetickými hlasy. Přehled, žádný dril znaků.",
      einheiten: {},
    },
    "kp-lieder2": {
      titel: "Písničky s výrazem",
      introDu: "Tytéž písničky, teď s citem: spojeně nebo krátce, potichu nebo nahlas. Poslechni si rozdíl mezi suchou a výraznou verzí - a napiš řádky.",
      introSie: "Písničky s výrazem (§9.2): třetí police s dynamikou, artikulací a oblouky; výrazový diktát (suše vs. s výrazem) + psaní řádků. Rozšíření parseLine.",
      einheiten: {},
    },
    "kp-lesekonzert": {
      titel: "Koncert čtení",
      introDu: "Královská disciplína: přečti braillský řádek bez poslechu - vtiskni si ho do paměti - a pak ho zahraj zpaměti. Přesně tak se hraje z listu, protože při hraní se číst nedá.",
      introSie: "Koncert čtení (§9.3, RNIB: přečíst - zapamatovat si - zahrát): ukázat Braillovo písmo → číst → zahrát zpaměti na klaviatuře → správné řešení pro kontrolu. Počítá se řada tónů, ne doba čtení (§12).",
      einheiten: {},
    },
    "kp-liederquiz": {
      titel: "Písničkový kvíz",
      introDu: "Poznáš písničku jen podle jejího braillského řádku - bez jediného tónu? Nebo najdeš ke slyšené melodii správnou písničku? To je tiché čtení vnitřním uchem.",
      introSie: "Písničkový kvíz (§9.4): přečíst první braillský řádek → pojmenovat písničku, a poslechnout melodii → pojmenovat písničku. Vrchol plynulého čtení braillských not.",
      einheiten: {},
    },
  },
};
