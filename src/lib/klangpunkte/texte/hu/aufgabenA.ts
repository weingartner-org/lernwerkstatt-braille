/**
 * Bereich `aufgabenA` - Magyar. Aufgaben-Erzeuger in `etappen.ts`: kp1 bis kp13, Stufe 2
 * (kötőív bis triola) und Welt 1 „Fülhegyező". Kinder: tegezés.
 * Fachwörter: ungarische Musiklehre (nyolcad hang, negyed hang, kereszt, bé, előjegyzés, ütemmutató -
 * aus `tonnamen.ts` Eintrag `hu`). Nach Zahlen steht die Einzahl („3 ütés", „2 kereszt").
 * Der bestimmte Artikel („a" / „az") richtet sich nach dem Anlaut, siehe `az()` und `azHang()`.
 * Unsichere Wörter stehen im Bericht unter „Unsicher".
 */
import type { aufgabenA as De } from "../de/aufgabenA";

/** „a" oder „az" vor einem Wort (nach dem ersten Laut). */
const az = (szo: string): string => (/^[aáeéiíoóöőuúüű]/i.test(szo) ? "az" : "a");
/** „a" oder „az" vor einem Ton- oder Tonartnamen (A, E, F, Esz, Asz werden mit Vokal gesprochen). */
const azHang = (nev: string): string => (/^[aeiofu]/i.test(nev) ? "az" : "a");
/** „3/4-es ütem", „6/8-os ütem" (Endung nach dem Nenner). */
const utem = (a: number, b: number): string => `${a}/${b}-${b >= 8 ? "os" : "es"} ütem`;

export const aufgabenA: typeof De = {
  gemeinsam: {
    taktstrichZelle: "ütemvonal - a szóköz",
    zahlzeichen: "a számjel",
    obereZahl: (n: number): string => `${n} (felső szám)`,
    tiefeZahl: (n: number): string => `${n} alsó számként`,
    schlagzahl: (b: number): string => (Number.isInteger(b) ? String(b) : String(b).replace(".", ",")),
  },
  hilfe: {
    schreibNote: (ton: string, wert: string): string => `Írd le: ${ton} - ${wert}.`,
    welcheNote: "Melyik hang ez? Figyelj, és tapintsd meg a cellát.",
    dasWar: (ton: string, wert: string): string => `Ez ${ton} volt - ${wert}.`,
  },
  kp1: {
    zweiHoeher: "Két hang. Melyik volt magasabb?",
    dreiHoechster: "Három hang. Melyik volt a legmagasabb?",
    ordinale: ["Az első", "A második", "A harmadik"],
    hoechsterErklaer: (i: number): string =>
      `${["Az első", "A második", "A harmadik"][i]} hang volt a legmagasabb.`,
    leiter: "Egy kis skála. Felfelé megy vagy lefelé?",
    leiterWahl: ["Felfelé", "Lefelé"],
    leiterRauf: "Felfelé ment.",
    leiterRunter: "Lefelé ment.",
  },
  kp2: {
    prompt: (len: number): string =>
      `Hallgasd meg a ritmust, és kopogd vissza a szóközzel - ${len} ütés.`,
  },
  kp3: {
    grundform: " (Az alapforma a nyolcad hang.)",
  },
  kp4: {
    prompt: "Hallgasd meg a dallamot, és írd le hangról hangra.",
  },
  kp5: {
    viertelHinweis: " (Negyed = hozzájön a 6-os pont - ahogy a k-t sorban a 3-as pont.)",
    melodie: "Írd le a dallamot - csupa negyed hang.",
    frage: "Nyolcad vagy negyed?",
    wahl: ["Nyolcad hang", "Negyed hang"],
    erklaerAchtel: "Alul nincs plusz pont: ez nyolcad hang.",
    erklaerViertel: "Hozzájön a 6-os pont: ez negyed hang.",
  },
  kp6: {
    halbeHinweis: " (Fél hang = hozzájön a 3-as pont.)",
    ganzeHinweis: " (Egész hang = hozzájön a 3-as és a 6-os pont.)",
    frage: "Melyik hangérték ez?",
    erklaer: (wert: string): string => `Ez ${wert} volt.`,
  },
  kp7: {
    schreibPause: (pause: string): string => `Írd le: ${pause}.`,
    taktart: "Melyik ütemmutató áll itt?",
    taktartErklaer: (a: number, b: number): string =>
      `Ez ${utem(a, b)} volt: számjel, fent ${a}, lent ${b} alsó számként.`,
    taktstrich: (ton1: string, ton2: string): string =>
      `Írd le: ${ton1} fél hang, ütemvonal (szóköz), ${ton2} fél hang.`,
    taktstrichErklaer: "A Braille-kottában az ütemvonal egy szóköz.",
  },
  kp8: {
    prompt: (ton: string, wert: string): string =>
      `Írd le: ${ton} - pontozott ${wert}. (A nyújtópont a 3-as pont egy SAJÁT cellában.)`,
    punktZelle: "a nyújtópont - 3-as pont",
  },
  kp9: {
    prompt: (vorzeichen: string, ton: string): string =>
      `Írd le: ${vorzeichen}, aztán ${ton} negyed hangként. (A módosítójel közvetlenül a hang ELŐTT áll.)`,
  },
  kp10: {
    lage: "Milyen fekvésben szól ez?",
    lageWahl: ["Mély (kis oktáv)", "Közép (egyvonalas)", "Magas (kétvonalas)"],
    lageErklaer: (oktave: string): string => `Ez ${az(oktave)} ${oktave} volt.`,
    schreib: (ton: string, oktave: string): string =>
      `Írd le egy darab ELSŐ hangjaként: ${ton}, ${oktave}, negyed hang. (Előbb az oktávjel, aztán a hang.)`,
    zeichenZelle: (oktave: string): string => `oktávjel: ${oktave}`,
  },
  kp11: {
    gleich: "ugyanaz a hang",
    sekundeTerz: "szekund vagy terc",
    quarteQuinte: "kvart vagy kvint",
    sexteMehr: "szext vagy nagyobb",
    regelKlein: "A szekundnak és a tercnek SOHA nem kell oktávjel.",
    regelMittel: "A kvartnak és a kvintnek CSAK akkor kell, ha az oktáv változik.",
    regelGross: "Szexttől felfelé a hangnak MINDIG kell oktávjel.",
    prompt: (ton1: string, oktave1: string, ton2: string, oktave2: string): string =>
      `Első hang: ${ton1}, ${oktave1}. Utána: ${ton2}, ${oktave2}. Kell-e oktávjel a második hangnak?`,
    wahl: ["Igen", "Nem"],
    erklaer: (sprung: string, regel: string): string => `A lépés: ${sprung}. ${regel}`,
  },
  kp12: {
    grossPrompt: "Négynegyedes ütemben EGYETLEN cella tölti ki az egész ütemet. Egész hang vagy tizenhatod?",
    grossWahl: ["Egy egész hang", "Egy tizenhatod hang"],
    grossErklaer:
      "Egyetlen cella, amelynek négy ütést kell kitöltenie, a NAGY érték: az egész hang. Egy tizenhatod túl rövid volna.",
    kleinPrompt: "Kétnegyedes ütemben NYOLC egyforma cella áll egymás után. Egész hangok vagy tizenhatodok?",
    kleinWahl: ["Egész hangok", "Tizenhatod hangok"],
    kleinErklaer:
      "Nyolc egész hang soha nem fér bele két ütésbe - ezek csak a KIS értékek lehetnek: tizenhatodok. Az ütem és a szövegkörnyezet dönt.",
  },
  kp13: {
    similePrompt: "Írd le a Braille ütemismétlő jelét (az egész ütemet még egyszer kell játszani).",
    simileZelle: "az ütemismétlő jel - 2-es, 3-as, 5-ös és 6-os pont",
    simileErklaer: "Ez a rövidítés csak a Braille-ben létezik - okosabb, mint a nyomtatott kotta!",
    startPrompt: "Írd le: ismétlés KEZDETE (két cella).",
    startZellen: ["első cella - 1-es, 2-es és 6-os pont", "második cella - 2-es, 3-as, 5-ös és 6-os pont"],
    endePrompt: "Írd le: ismétlés VÉGE (két cella).",
    endeZellen: ["első cella - 1-es, 2-es és 6-os pont", "második cella - 2-es és 3-as pont"],
    schluss: "A záróvonal (a darab vége)",
    anfang: "Ismétlés kezdete",
    ende: "Ismétlés vége",
    erkennenPrompt: "Melyik formai jel ez?",
    erkannt: (zeichen: string): string => `Ez volt: ${zeichen}.`,
  },
  haltebogen: {
    hoerenPrompt: "Két fél hang ugyanazon a hangon. Egyszer vagy kétszer szólalt meg?",
    hoerenWahl: ["Egyszer - kötve (kötőív)", "Kétszer - külön"],
    hoerenGebunden: "Csak egy megszólalás: a kötőív EGY hosszú hanggá köti a két hangot.",
    hoerenGetrennt: "Két megszólalás: itt nem volt kötőív - minden hang újra kezdődik.",
    schreibPrompt: (ton: string): string =>
      `Írd le: ${ton} fél hang, kötőív (két cella: 4-es pont, aztán 1-es és 4-es pont), még egyszer ${ton} fél hang.`,
    zelle1: "kötőív, első cella - 4-es pont",
    zelle2: "kötőív, második cella - 1-es és 4-es pont",
    klingtWeiter: (note: string): string => `${note} - tovább szól, új megszólalás nélkül`,
    schreibErklaer: "A kötőív közvetlenül az első hang UTÁN áll.",
    taktPrompt: (ton: string): string =>
      `Kötés az ütemvonalon át: ${ton} fél hang, kötőív, ütemvonal (szóköz), ${ton} fél hang.`,
    taktErklaer: "Így szól tovább egy hang az ütemvonalon át.",
  },
  auftakt: {
    vollPrompt: (a: number, b: number): string =>
      `${utem(a, b)}. Hallgasd meg az ütemet, és számolj: teljes?`,
    vollWahl: ["Teljes", "Nem teljes - felütés vagy csonka ütem"],
    vollJa: (ziel: string): string => `Pontosan kijön: ${ziel} ütés.`,
    vollNein: (summe: string, ziel: string): string =>
      `Valami hiányzik: ${ziel} ütésből csak ${summe} - ez csonka ütem. A darab elején felütésnek hívják.`,
    bindestrichPrompt: "A sor végén az ütem még nincs kész. Írd le a zenei kötőjelet (5-ös pont).",
    bindestrichZelle: "a zenei kötőjel - 5-ös pont",
    bindestrichErklaer: "Az 5-ös pont a sor végén azt jelenti: ez az ütem a következő sorban folytatódik.",
    schreibPrompt: (ton: string): string =>
      `Írd le a felütést: ${ton} negyed hang, ütemvonal (szóköz), aztán a teljes ütem.`,
    auftaktZelle: (note: string): string => `${note} - a felütés`,
    schreibErklaer: "A felütés egy nem teljes első ütem - egészen szokásosan írjuk le.",
  },
  pausen2: {
    vielePrompt: (n: number): string => `Írd le: ${n} ütem szünet - számjel, a szám (${n}), aztán az egész szünet.`,
    zahlzeichenZelle: "a számjel - 3-as, 4-es, 5-ös és 6-os pont",
    zahlZelle: (n: number): string => `a szám: ${n}`,
    ganzePauseZelle: "az egész szünet - 1-es, 3-as és 4-es pont",
    vieleErklaer: "Négy üres ütemtől a Braille a darabszámot számként írja az egész szünet elé.",
    kleinPrompt: (n: number): string =>
      `Írd le: ${n} üres ütem - háromig egyszerűen ${n === 2 ? "kétszer" : "háromszor"} az egész szünetet.`,
    kleinZelle: (i: number): string => `egész szünet (${i}) - egy teljes üres ütem`,
    kleinErklaer: "Az egész szünet MINDIG egy teljes ütemet tölt ki - mindegy, milyen az ütemmutató.",
    lesenPrompt: "Hány csendes ütem áll itt?",
    takte: (n: number): string => `${n} ütem`,
    lesenKlein: (n: number): string => `${n} egész szünet egymás után = ${n} üres ütem.`,
    lesenGross: (n: number): string => `Számjel + ${n} + egész szünet = ${n} ütem csend egyhuzamban.`,
    stillePrompt: "Három ütem - az egyik teljesen csendes. Melyik?",
    stilleWahl: ["Az elején", "Középen", "A végén"],
    stilleErklaer: (i: number): string =>
      `A csend ${["az elején", "középen", "a végén"][i]} volt - egy teljes ütemnyi szünet.`,
  },
  tonart: {
    keyNames: {
      kreuz: ["G-dúr", "D-dúr", "A-dúr", "E-dúr"],
      be: ["F-dúr", "B-dúr", "Esz-dúr", "Asz-dúr"],
    },
    kreuz: "kereszt",
    be: "bé",
    kreuze: "kereszt",
    bes: "bé",
    lesenPrompt: (mehrzahl: string): string =>
      `A darab elején ez az előjegyzés áll. Hány ${mehrzahl} van benne?`,
    lesenErklaer: (n: number, name: string, tonart: string, ab4: boolean): string =>
      `${n} ${name} - ez ${azHang(tonart)} ${tonart} előjegyzése. ${
        ab4 ? "Négytől a darabszám számként áll előtte." : "Háromig a jel egyszerűen ismétlődik."
      }`,
    schreibKlein: (n: number, name: string, zeichen: string): string =>
      `Írd le az előjegyzést: ${n} ${name} - a ${zeichen} jelét egyszerűen ${n === 1 ? "egyszer" : n === 2 ? "kétszer" : "háromszor"}.`,
    schreibGross: (n: number, mehrzahl: string, zeichen: string): string =>
      `Írd le az előjegyzést: ${n} ${mehrzahl} - négytől számjellel: számjel, a szám (${n}), aztán a ${zeichen} jele.`,
    zeichenZelle: (name: string, i: number, punkte: string): string => `${name} (${i}) - pontok: ${punkte}`,
    zahlzeichenZelle: "a számjel - 3-as, 4-es, 5-ös és 6-os pont",
    zahlZelle: (n: number): string => `a szám: ${n}`,
    dasZeichen: (name: string): string => `a ${name} jele`,
    istVorzeichnung: (tonart: string): string => `Ez ${azHang(tonart)} ${tonart} előjegyzése.`,
    kopfPrompt: (n: number, name: string, a: number, b: number): string =>
      `Írd le a darab fejét: előbb az előjegyzést (${n} ${name}), közvetlenül utána az ütemmutatót (${a}/${b}) - szóköz nélkül.`,
    kopfZelle: (name: string, i: number): string => `${name} (${i})`,
    kopfErklaer: "A hangnem és az ütemmutató együtt áll a darab elején - előbb az előjegyzés, aztán az ütem.",
    regelPrompt: "Az előjegyzés a darab elején - meddig érvényes?",
    regelWahl: ["Az egész darabra", "Csak az első ütemre", "Csak az első hangra"],
    regelErklaer:
      "Az előjegyzés az egész darabra érvényes - egy ütem közepén álló módosítójel viszont csak az ütemvonalig.",
  },
  taktwechsel: {
    sonderPrompt: "Melyik ütemmutató ez?",
    sonderWahl: ["C - a négynegyedes ütem", "Alla breve - a kétfeles ütem", "A háromnegyedes ütem"],
    sonderErklaerC: "4-es és 6-os pont a c előtt: a négynegyedes ütem C jele.",
    sonderErklaerAb: "4-es, 5-ös és 6-os pont a c előtt: alla breve - a fél hangok adják az ütést.",
    sonderSchreibenC: "Írd le a C ütemjelet: 4-es és 6-os pont, aztán a c (1-es és 4-es pont).",
    sonderSchreibenAb: "Írd le az alla brevét: 4-es, 5-ös és 6-os pont, aztán a c (1-es és 4-es pont).",
    vorzeichenC: "az előjel - 4-es és 6-os pont",
    vorzeichenAb: "az előjel - 4-es, 5-ös és 6-os pont",
    dasC: "a c - 1-es és 4-es pont",
    wechselPrompt: "Néhány hang után egy MÁSODIK ütemmutató áll. Mit jelent ez?",
    wechselWahl: (a: number, b: number): string[] => [
      `Az ütemmutató ${a}/${b} lesz`,
      "A hangnem változik",
      "A darab véget ért",
    ],
    wechselErklaer: (a: number, b: number): string =>
      `Egy új ütemmutató a darab közepén azt jelenti: innentől ${utem(a, b)} érvényes.`,
    wechselSchreiben: (a: number, b: number): string =>
      `A darab közepén változik az ütem: írj ütemvonalat (szóköz), aztán az új ütemmutatót (${a}/${b}).`,
  },
  schluessel: {
    lesenPrompt: "Melyik kulcs áll itt (három cella)?",
    lesenErklaer: (schluessel: string): string =>
      `Ez ${az(schluessel)} ${schluessel} volt. Minden kulcs a 3-as, 4-es és 5-ös ponttal kezdődik, és az 1-es, 2-es és 3-as ponttal végződik - a közepe különbözteti meg őket.`,
    mitteViolin: "3-as és 4-es pont",
    mitteBass: "3-as, 4-es, 5-ös és 6-os pont",
    schreibPrompt: (schluessel: string, mitte: string): string =>
      `Írd le: ${schluessel} - három cella: 3-as, 4-es és 5-ös pont · ${mitte} · 1-es, 2-es és 3-as pont.`,
    ankuendigung: "a kulcs bejelentése - 3-as, 4-es és 5-ös pont",
    gZeichen: "a G jel - 3-as és 4-es pont",
    fZeichen: "az F jel - 3-as, 4-es, 5-ös és 6-os pont",
    abschluss: "a lezárás - 1-es, 2-es és 3-as pont",
    wissenPrompt: "Kell-e a Braille-kottaírásnak kulcs a hangmagasság meghatározásához?",
    wissenWahl: ["Nem - a fekvést az oktávjelek mondják meg", "Igen - kulcs nélkül semmi sem megy"],
    wissenErklaer:
      "A kulcsjelek a Braille-ben csak tájékoztatnak a nyomtatott kottáról - a fekvést mindig az oktávjelek határozzák meg.",
  },
  sechzehntel: {
    hoerenPrompt: "Egy kis futam. Nyolcadok - vagy a kétszer olyan fürge tizenhatodok?",
    hoerenWahl: ["Nyolcadok", "Tizenhatodok"],
    hoerenSchnell: "Ezek tizenhatodok voltak - négy egy ütésre.",
    hoerenLangsam: "Ezek nyolcadok voltak - kettő egy ütésre.",
    gruppePrompt:
      "Írd le a négy tizenhatodból álló csoportot: csak az ELSŐ hang kapja meg a 3-as és a 6-os pontot, a másik hármat nyolcadként írod (csoportosítás).",
    ersteZelle: (ton: string): string => `${ton} tizenhatodként - a 3-as és a 6-os ponttal`,
    andereZelle: (ton: string): string => `${ton} - nyolcadként írva (a csoporthoz tartozik)`,
    gruppeErklaer: "A csoportosítás olvashatóvá teszi a gyors futamokat: értékpontok csak a csoport első hangján.",
    regelPrompt:
      "Négy tizenhatod egy ütésen, csoportként írva: hány cella hordozza a 3-as és a 6-os értékpontot?",
    regelWahl: ["Csak az első", "Mind a négy", "Az első és az utolsó"],
    regelErklaer:
      "Csak a csoport első hangja mutatja az értéket - a többi nyolcadnak látszik. Ez a nyomtatott kotta gerendás csoportjának Braille-megfelelője.",
    einzelnPrompt: (ton: string): string =>
      `Írd le: ${ton} tizenhatodként. (Figyelem - ugyanaz a cella, mint az egész hangé; az ütem dönt!)`,
  },
  triolen: {
    hoerenPrompt: "Két nyugodt ütés között: hány hang osztozik EGY ütésen - kettő vagy három?",
    hoerenWahl: ["Kettő - szokásos nyolcadok", "Három - triola"],
    hoerenTriole: "Három egyforma hosszú hang egy ütésen: triola.",
    hoerenZwei: "Két nyolcad - a szokásos osztás.",
    schreibPrompt: "Írd le a triolát: előbb a triolajelet (2-es és 3-as pont), aztán a három nyolcadot.",
    triolenZeichen: "a triolajel - 2-es és 3-as pont",
    achtelZelle: (ton: string): string => `${ton}, nyolcad hang - az ütés harmada`,
    schreibErklaer: "A triolajel EGYSZER áll a csoport előtt - két nyolcadból hármat csinál.",
    lesenPrompt: "Három nyolcad előtt ez az első cella áll (2-es és 3-as pont). Mit jelent?",
    lesenWahl: ["Triolát - három hang egy ütésen", "Nyolcad szünetet", "Oktávjelet"],
    lesenErklaer: "2-es és 3-as pont egy hangcsoport előtt = triola.",
  },
  puls: {
    klopfPrompt: (n: number): string =>
      `Érezd az alaplüktetést, és kopogd egyenletesen a szóközzel - ${n} ütésen át.`,
    metrumPrompt: "Figyeld a hangsúlyos ütéseket: kettesben menetel, vagy hármasban keringőzik?",
    metrumWahl: ["Induló - kettesben", "Keringő - hármasban"],
    metrumDrei: "Mindig a három számolási egység közül az első hangsúlyos: hármas - a keringő lépése.",
    metrumZwei: "Mindig a két számolási egység közül az első hangsúlyos: kettes - az induló lépése.",
    abstandPrompt: "Számold meg az ütéseket egyik hangsúlytól a következőig: hány van?",
    abstandWahl: ["2 ütés", "3 ütés", "4 ütés"],
    abstandErklaer: (n: number): string => `Hangsúlytól hangsúlyig ${n} ütés van - ez ${utem(n, 4)}.`,
  },
  dauer: {
    vergleichPrompt: "Két hang egymás után. Melyik szólt hosszabban?",
    vergleichWahl: ["Az első", "A második"],
    vergleichErster: "Az első fél hang volt - kétszer olyan hosszú, mint az utána következő negyed.",
    vergleichZweiter: "A második fél hang volt - kétszer olyan hosszú, mint az előtte álló negyed.",
    schlaegePrompt: "Előbb két lüktetésütés, aztán egy hosszú hang: hány ütésig szólt?",
    schlaegeWahl: ["1 ütés - negyed hang", "2 ütés - fél hang", "4 ütés - egész hang"],
    schlaegeErklaer: (wert: string, zahl: number): string =>
      `Ez egy ${wert} volt - ${zahl} ütés hosszú.`,
    paarPrompt: "Két hang: egyforma hosszú - vagy a második kétszer olyan hosszú?",
    paarWahl: ["Egyforma hosszú", "A második kétszer olyan hosszú"],
    paarGleich: "Két egyforma hosszú negyed hang.",
    paarDoppelt: "Előbb egy negyed, aztán egy fél hang - kétszer olyan hosszú.",
  },
  dynamik: {
    lautPrompt: "Hallgasd meg a kis frázist: hangosan vagy halkan szólt?",
    lautWahl: ["Hangosan", "Halkan"],
    lautErklaer: "Erőteljesen szólt - ezt később forténak hívjuk.",
    leiseErklaer: "Nagyon finoman szólt - ezt később pianónak hívjuk.",
    rampePrompt: "Hangosabb lesz a frázis vagy halkabb?",
    rampeWahl: ["Hangosabb", "Halkabb"],
    cresc: "Halkból hangosba - ezt később crescendónak hívjuk.",
    decresc: "Hangosból halkba - ezt később decrescendónak hívjuk.",
    akzentPrompt: "Egy hang különösen hangsúlyos. Hol volt?",
    akzentWahl: ["Az elején", "Középen", "A végén"],
    akzentErklaer: (i: number): string =>
      `A hangsúlyos hang ${["az elején", "középen", "a végén"][i]} volt.`,
  },
  inst: {
    merk: {
      klavier: "Zongora - megütött hang, világos indítás, lecsengéssel.",
      gitarre: "Gitár - pengetett, ütős és húros hangzás.",
      sax: "Szaxofon - fújt, éneklő, nádnyelves hangszín.",
      floete: "Fuvola - fújt, lágy és tiszta.",
    },
    hoerenPrompt: "Melyik hangszer játszik itt?",
    vergleichPrompt: "Két motívum egymás után: ugyanaz a hangszer vagy különböző?",
    vergleichWahl: ["Ugyanaz a hangszer", "Különböző hangszerek"],
    vergleichGleich: "Mindkét motívum ugyanattól a hangszertől szólt.",
    vergleichErklaer: (a: string, b: string): string =>
      `Előbb ${az(a)} ${a.toLowerCase()}, aztán ${az(b)} ${b.toLowerCase()}.`,
    zuerstPrompt: "Két hangszer egymás után. Melyik szólt először?",
    zuerstErklaer: (a: string): string => `Először ${az(a)} ${a.toLowerCase()} szólt.`,
  },
  echo: {
    prompt: (len: number): string =>
      `Visszhangjáték: hallgasd meg a hangokat (${len} hang), és játszd el őket a billentyűzeten - a D F G H J K L billentyű a c d e f g a h hang. Csak a hangsor számít, a ritmus szabad.`,
    erklaer: "Játszd el a hangokat a hallott sorrendben.",
  },
  memory: {
    prompt:
      "Dallammemória: én eljátszom egy hangsort, te utánam játszod (D F G H J K L = c d e f g a h). Ha sikerül, jön hozzá még egy hang - meddig jutsz?",
  },
};
