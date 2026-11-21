/**
 * Bereich `aufgabenC` - Magyar: Aufgabentexte der Welten 7 (Elmélet-játszótér),
 * 8 (Hangszerismeret) und 9 (Dalszínpad) aus `etappen.ts`. Kinder: tegezés.
 * Fachwörter: ungarische Musiklehre (skála, dúr, moll, kvintkör, előjegyzés, félzárlat, egészzárlat,
 * tonika, szubdomináns, domináns, számozott basszus, húr, fekvés; Hangszercsaládok nach
 * Hornbostel-Sachs: húros, fúvós, hártyás, önhangú hangszer). Tonarten: G-dúr, B-dúr, Esz-dúr.
 * Der bestimmte Artikel („a" / „az") richtet sich nach dem Anlaut, siehe `az()` und `azHang()`.
 * Unsichere Wörter stehen im Bericht unter „Unsicher".
 */
import type { aufgabenC as De } from "../de/aufgabenC";

/** „a" oder „az" vor einem Wort (nach dem ersten Laut). */
const az = (szo: string): string => (/^[aáeéiíoóöőuúüű]/i.test(szo) ? "az" : "a");
/** „A" oder „Az" am Satzanfang vor einem Ton- oder Tonartnamen (A, E, F, Esz, Asz mit Vokal gesprochen). */
const AzHang = (nev: string): string => (/^[aeiofu]/i.test(nev) ? "Az" : "A");
const azHang = (nev: string): string => AzHang(nev).toLowerCase();
/** „1-es", „3-as", „5-ös", „6-os" usw. nach einer Zahl. */
/** „a" oder „az" vor einer Zahl (1 „egy", 5 „öt" beginnen mit Vokal). */
const azSzam = (n: number): string => (/^[15]/.test(String(n)) ? "az" : "a");
const rag = (n: number): string => (["-es", "-es", "-es", "-as", "-es", "-ös", "-os", "-es", "-as", "-es"][n % 10] ?? "-es");

export const aufgabenC: typeof De = {
  zellen: {
    oktavzeichenDer: (oktave: string): string => `oktávjel: ${oktave}`,
    oktavzeichen: "az oktávjel",
    vorzeichen: "az előjel",
    verlaengerungspunkt: "a nyújtópont - 3-as pont",
    taktstrich: "ütemvonal - a szóköz",
  },

  // --- 7. világ „Elmélet-játszótér" -----------------------------------------
  tonleitern: {
    spielNach:
      "Játszd el a C-dúr skálát felfelé: c d e f g a h c - a billentyűzeten D F G H J K L, aztán egy oktávval feljebb még egyszer D.",
    spielNachErkl: "Nyolc fok c-től a következő c-ig.",
    durMollFrage: "Hallgasd meg a skálát - dúr (világos) vagy moll (sötét)?",
    durMollWahl: ["Dúr", "Moll"],
    durMollErklMoll: "A harmadik fok le van szállítva - természetes moll.",
    durMollErklDur: "Tiszta dúr skála.",
    fehlerFrage: "Ebben a dúr skálában EGY hang elcsúszott. Melyik fok volt hibás?",
    fehlerWahl: ["3. fok", "4. fok", "5. fok", "6. fok", "7. fok"],
    fehlerErkl: (stufe: number): string => `${azSzam(stufe) === "az" ? "Az" : "A"} ${stufe}. fok túl magasan szólt.`,
    schreibe:
      "Írd le a G-dúr skálát: g a h c d e - aztán fisz, vagyis egy kereszt az f előtt (ez a G-dúr egyetlen előjegyzése).",
    schreibeErkl: "A G-dúrnak egy keresztje van: az f-ből fisz lesz.",
  },

  quintenzirkel: {
    vz: {
      kreuz: { ein: "kereszt", mehr: "kereszt" },
      be: { ein: "bé", mehr: "bé" },
    },
    anzahlFrage: (name: string, mehr: string): string => `Állomás: ${name}. Hány ${mehr} van ebben a hangnemben?`,
    anzahlErkl: (name: string, n: number, wort: string): string => `${AzHang(name)} ${name} hangnemben ${n} ${wort} van.`,
    nameFrage: (n: number, wort: string): string => `${n} ${wort} - melyik dúr hangnem ez?`,
    nameErkl: (n: number, wort: string, name: string): string => `${n} ${wort}: ez ${azHang(name)} ${name}.`,
    lesenFrage: "Olvasd el az előjegyzést Braille-ben - melyik hangnem?",
    lesenErkl: (name: string): string => `Ez az előjegyzés ${azHang(name)} ${name} hangnemhez tartozik.`,
  },

  rhythmusdiktat: {
    blattFrage: "Olvasd el a ritmust a kottasorban, és kopogd a szóközzel - lapról.",
    diktatFrage: (rhythm: boolean): string =>
      `Ritmusdiktálás: kopogok egy ütemet a g hangon. Írd le az értékeket, amelyeket hallasz${rhythm ? " (a ritmusnyelv be van kapcsolva)" : ""}. A kezdőhang a g. Annyiszor hallgathatod meg, ahányszor akarod.`,
    diktatErkl: "Számold meg az ütéseket hangonként: negyed = egy ütés, fél hang = kettő.",
  },

  melodiediktat: {
    frage: (startton: string, anzahl: number): string =>
      `Dallamdiktálás: a kezdőhang ${startton}. Hallgasd meg a hangokat (${anzahl} hang), és írd le őket - kis lépésekben haladnak. Annyiszor hallgathatod meg, ahányszor szeretnéd.`,
    erkl: "Hasonlítsd össze hangról hangra a kezdőhanggal: felfelé megy vagy lefelé?",
  },

  detektiv: {
    frage: "Olvasd el a Braille-sort, és hallgasd meg a felvételt. Melyik helyen tér el a hangzás a kottától?",
    note: (n: number): string => `${n}. hang`,
    allesRichtig: "Minden helyes",
    erklRichtig: "Minden rendben volt - a hangzás és a kotta egyezett.",
    erklAnders: (n: number): string => `A hangsor ${n}. hangja másképp szólt, mint ahogy le volt írva.`,
  },

  baumeister: {
    dreiViertel: "Építs egy teljes háromnegyedes ütemet: írj hangokat és szüneteket az f d s j k l billentyűkkel, amíg az ütések száma pontosan három lesz. Az Enter ellenőriz.",
    mitPause: "Építs egy négynegyedes ütemet legalább EGY szünettel. Az Enter ellenőriz.",
    mitNoten: "Építs egy négynegyedes ütemet legalább HÁROM hanggal. Az Enter ellenőriz.",
    sechsAchtel: "Szorgalmi: építs egy teljes hatnyolcados ütemet (hat nyolcad ütés). Az Enter ellenőriz.",
  },

  spielwiese: {
    frage:
      "Játékrét: a halk bordun fölött szabadon játszhatsz - a D F G J K billentyűkkel (pentatónia). Egyetlen hang sem lehet hamis. Mesélj el egy kis történetet: előbb halkan, aztán hangosan. Harminc hangtól a műhelyt meglátogattad.",
  },

  kadenzen: {
    schlussFrage: "Két akkord befejezésként - késznek hangzik, vagy még folytatódik?",
    schlussWahl: ["Kész - igazi befejezés", "Nyitott - még folytatódik"],
    schlussErklOffen: "A dominánson (V) nyitva marad - félzárlat.",
    schlussErklZu: "A dominánsról vissza az alaphármasra - ez késznek hangzik (egészzárlat).",
    artFrage: "Melyik zárlatfajta ez?",
    artWahl: ["Autentikus - a dominánsról (V) az alaphármasra", "Plagális - az „ámen”-zárlat a szubdominánsról (IV)"],
    artErklPlagal: "IV-ről I-re - a lágy „ámen”-zárlat (plagális).",
    artErklAuth: "V-ről I-re - az erős, autentikus zárlat.",
    funktionFrage: "Milyen funkciója van ennek az akkordnak C-dúrban?",
    funktionWahl: ["Tonika (I. fok)", "Szubdomináns (IV. fok)", "Domináns (V. fok)"],
    funktionErkl: [
      "Tonika (T) - az alaphármas az I. fokon.",
      "Szubdomináns (S) - a IV. fok.",
      "Domináns (D) - az V. fok.",
    ],
  },

  komponier: {
    frage:
      "Zeneszerző műhely: írj szabadon az f d s j k l billentyűkkel, hallgasd meg a művedet, és mentsd el (legfeljebb ötöt). A műhelyt akkor látogattad meg, amikor elmentettél egy művet.",
  },

  // --- 8. világ „Hangszerismeret" -------------------------------------------
  fingersatz: {
    lesenFrage: "Olvasd el a hangot és az ujjrendet: melyik ujj játssza a hangot? (Az ujjrend a hang UTÁN áll.)",
    lesenErkl: (finger: string): string => `A hang utáni kis számjegy jelentése: ${finger}.`,
    schreibenFrage: (ton: string, finger: string): string =>
      `Írd le a hangot (${ton}), és tedd utána az ujjrendet ehhez: ${finger} - a hang UTÁN áll.`,
    fingerZelle: (finger: string): string => `${finger} - az ujjrend`,
    schreibenErkl: (finger: string): string => `Ennek a számjegye közvetlenül a hang mögé kerül: ${finger}.`,
    positionFrage: "Hol áll az ujjrend - a hang előtt vagy után?",
    positionWahl: ["A hang után", "A hang előtt"],
    positionErkl: "Az artikulációval ellentétben az ujjrend a hang UTÁN áll (egy esetleges kötőív előtt).",
  },

  klavier: {
    zweiFrage:
      "Két sor - fent a jobb kéz (violinkulcs), lent a bal kéz (basszuskulcs). Hány hangot játszik a BAL kéz? Az Alt + Q billentyűkkel egy kezet külön, nagyban láthatsz és hallhatsz.",
    zweiWahl: (n: number): string => `${n} hang`,
    zweiErkl: "Számold meg a hangfejeket az alsó sorban - vagy hallgasd meg külön a mély kezet (Alt + Q).",
    handFrage: "Ez a sor kézjellel kezdődik. Melyik kézé?",
    handWahl: ["Jobb kéz", "Bal kéz"],
    handErklLinks: "4-es, 5-ös és 6-os pont, aztán 3-as, 4-es és 5-ös pont: a bal kéz jele.",
    handErklRechts: "4-es és 6-os pont, aztán 3-as, 4-es és 5-ös pont: a jobb kéz jele.",
    melodieFrage:
      "Két kéz egymás után: az egyik a dallamot játssza (magasabban, mozgékonyan), a másik mélyen kísér. Melyik volt a dallam?",
    melodieWahl: ["Az elsőként játszott szólam", "A második szólam"],
    melodieErkl: "A dallam a magasabb, mozgékony szólam - többnyire a jobb kéz.",
    rechteHandFrage: (ton: string): string =>
      `Írd le a jobb kéz jelét (4-es és 6-os pont · 3-as, 4-es és 5-ös pont), utána a hangot (${ton}) oktávjellel.`,
    rechteHandZellen: ["jobb kéz, első cella - 4-es és 6-os pont", "jobb kéz, második cella - 3-as, 4-es és 5-ös pont"],
    rechteHandErkl: "A kézjel után a szólam oktávjellel kezdődik.",
    pedalFrage: "Melyik pedáljel ez - és a hang előtt vagy után áll?",
    pedalWahl: ["Pedál le - a hang ELŐTT", "Pedál fel - a hang UTÁN"],
    pedalErklNieder: "A pedál le (1-es, 2-es és 6-os pont · 1-es és 4-es pont) azon hang előtt áll, amelytől a pedált lenyomjuk.",
    pedalErklAuf: "A pedál fel (1-es és 6-os pont · 1-es és 4-es pont) azon hang után áll, amellyel a pedált felengedjük.",
  },

  gesang: {
    melismaFrage: "A „la” szótagon - hány hangot énekel a szólam? (Egy szótagon több hangot melizmának hívunk.)",
    melismaWahl: ["Egy hangot", "Két hangot", "Három hangot"],
    melismaErkl: (n: number): string =>
      `A szótag ${n} hangot kap - ez melizma. A Braille-ben a szótagív köti össze őket (1-es és 4-es pont).`,
    bogenFrage:
      "Egy szótag két hangon: írd le az első hangot, a szótagívet (1-es és 4-es pont) és a második hangot.",
    bogenZelle: "szótagív - 1-es és 4-es pont",
    bogenErkl: "A szótagív azt mondja: mindkét hang egy szótaghoz tartozik.",
    atemFrage: "Ebben a sorban levegővételi jel áll. Melyik hang után veszünk levegőt?",
    atemWahl: ["Az első hang után", "A második hang után", "A harmadik hang után"],
    atemErkl: "A fél levegővételi jel (3-as, 4-es és 5-ös pont · 2-es pont) rögtön az első hang után áll.",
    zeilenFrage: "Az éneknél szövegsorok és zenei sorok váltakoznak. Melyik előjel jelez SZÖVEGsort?",
    zeilenWahl: ["Szöveg-előjel (5-ös és 6-os pont · 2-es és 3-as pont)", "Zene-előjel (6-os pont · 3-as pont)"],
    zeilenErkl: "A szövegsor előjele: 5-ös és 6-os pont · 2-es és 3-as pont; a zenei soré: 6-os pont · 3-as pont.",
  },

  gitarre: {
    saiteFrage:
      "A húrjel (1-es, 4-es és 6-os pont) és egy számjegy megmondja, melyik húron kell játszani. Melyik húr ez?",
    saiteWahl: (s: number): string => `${s}. húr`,
    saiteErkl: (s: number): string => `Húrjel és ${s}${rag(s)} számjegy: ez ${azSzam(s)} ${s}. húr.`,
    schreibenFrage: (saite: number, ton: string): string =>
      `Írd le ${azSzam(saite)} ${saite}. húr jelzését, aztán a hangot (${ton}): előbb a húrjel (1-es, 4-es és 6-os pont), aztán a számjegy, aztán a hang.`,
    saitenzeichenZelle: "húrjel - 1-es, 4-es és 6-os pont",
    ziffernZelle: (saite: number): string => `${saite}${rag(saite)} számjegy - ${saite}. húr`,
    schreibenErkl: "A húrjel a hang előtt áll; utána NEM következik oktávjel.",
    akkordSorten: { dur: "dúr hármashangzat", moll: "moll hármashangzat", sept: "domináns szeptimakkord (dőlt 7)" },
    akkordFrage:
      "Hallgasd meg a tört akkordot - milyen fajta? (A kör, a háromszög és a dőlt 7 nemzetközi; a betűs jelzéseket, mint a „C7”, minden ország kicsit másképp írja.)",
    akkordErkl: (sorte: string): string => `Ez egy ${sorte} volt.`,
  },

  generalbass: {
    aussetzungFrage:
      "A basszushang 6-os számozást kapott. Melyik kidolgozás szól helyesen - szexttel vagy kvinttel a basszus fölött?",
    aussetzungWahl: ["Terc és szext a basszus fölött", "Terc és kvint a basszus fölött"],
    aussetzungErklSext: "A 6-os szám szextet kér a basszus fölött - ez a szextakkord.",
    aussetzungErklQuint: "Számozás nélkül (vagy 5/3-mal) az alaphármas szól a kvinttel.",
    stufeFrage: "A számozott basszus fokokban gondolkodik. Melyik fő fokot hallod itt?",
    stufeWahl: ["Tonika (I. fok)", "Szubdomináns (IV. fok)", "Domináns (V. fok)"],
    stufeErkl: [
      "Ez a tonika volt (I. fok) - a híd a zárlattól a számozott basszusig.",
      "Ez a szubdomináns volt (IV. fok) - a híd a zárlattól a számozott basszusig.",
      "Ez a domináns volt (V. fok) - a híd a zárlattól a számozott basszusig.",
    ],
    schreibenFrage:
      "Írj le egy számozott basszushangot: a c-t, alatta a 6-os számozással (számjel és alsó 6-os számjegy).",
    zahlzeichenZelle: "számjel - 3-as, 4-es, 5-ös és 6-os pont",
    ziffer6Zelle: "alsó 6-os számjegy - 2-es, 3-as és 5-ös pont",
    schreibenErkl: "A számozott basszus számjegyei ALSÓ számjegyként állnak a számjel után.",
  },

  partitur: {
    auftakt: {
      frage: "Egy darab felütéssel kezdődik. Milyen számot kap ez az első, nem teljes ütem?",
      wahl: ["0. ütem", "1. ütem", "2. ütem"],
      erkl: "A felütés a nulladik ütemnek számít - az első teljes ütem tehát az első számú ütem.",
    },
    taktzahl: {
      frage: "Így néz ki egy ütemszám a sor szélén (itt: tizenhat). Áll előtte számjel?",
      wahl: ["Nem - az ütemszámok számjel nélkül állnak", "Igen - mindig számjellel"],
      erkl: "A szélen álló ütemszámok számjel nélkül állnak - csak maguk a számjegyek.",
    },
    format: {
      frage: "Hogyan rendezi el a Braille-partitúra a két kezet vagy a szólamokat, hogy ütemről ütemre összevethetők legyenek?",
      wahl: ["Szakaszonként, sor a sor fölött (ütem ütem fölött)", "Mindent egyetlen hosszú sorba"],
      erkl: "Az ütem ütem fölött elrendezésben a szólamok szakaszonként egymás fölött állnak - ütem ütem mellett olvasható.",
    },
    quellen: {
      frage: "Hol lehet kész Braille-kottákat kapni olvasásra?",
      wahl: ["Látássérülteknek szóló könyvtárakban, például a dzb lesen vagy az SBS könyvtárában", "Csak ha magad másolod le"],
      erkl: "Az olyan könyvtárak, mint a dzb lesen (Lipcse) és az SBS (Zürich), több ezer címet kínálnak Braille-kottában.",
    },
  },

  orchester: {
    familieKlavier: "húros hangszer (megütött)",
    familieGitarre: "húros hangszer (pengetett)",
    familieBlas: "fúvós hangszer (fújt)",
    hoerenFrage: "Hallgasd meg a rövid motívumot - melyik hangszercsaládhoz tartozik ez a hangzás?",
    hoerenWahl: ["Húros hangszer - pengetett vagy megütött", "Fúvós hangszer - fújt", "Hártyás hangszer - ütött"],
    hoerenErkl: (instrument: string, familie: string): string => `${instrument}: ${familie}.`,
    fragen: [
      { frage: "Melyik családba tartozik a dob (Hornbostel-Sachs szerint)?", richtig: "Hártyás hangszer", falsch: ["Húros hangszer", "Fúvós hangszer"] },
      { frage: "Melyik családba tartozik a hegedű?", richtig: "Húros hangszer", falsch: ["Fúvós hangszer", "Hártyás hangszer"] },
      { frage: "Melyik családba tartozik a furulya?", richtig: "Fúvós hangszer", falsch: ["Hártyás hangszer", "Önhangú hangszer"] },
      { frage: "Melyik családba tartozik a triangulum?", richtig: "Önhangú hangszer", falsch: ["Hártyás hangszer", "Húros hangszer"] },
    ],
    familieErkl: (richtig: string): string => `Helyes: ${richtig}.`,
  },

  // --- 9. világ „Dalszínpad" ------------------------------------------------
  lieder2: {
    dazuWahl: [
      "Hangosabb lett - crescendo",
      "A hangok rövidek lettek - staccato",
      "A hangok lágyan egymásba folytak - legato",
    ],
    dazuDynamikFrage: (titel: string): string => `„${titel}” - előbb szárazon, aztán kifejezéssel. Mi került hozzá?`,
    dazuDynamikErkl: "A második változat hangosabb lett - ez crescendo.",
    dazuStaccatoFrage: (titel: string): string => `„${titel}” - mi került a száraz változathoz?`,
    dazuStaccatoErkl: "A hangok rövidek és élesek lettek - staccato.",
    dazuLegatoFrage: (titel: string): string => `„${titel}” - mi került hozzá?`,
    dazuLegatoErkl: "A hangok lágyan kötve szóltak - legato, ez a legato ív.",
    articFrage: (titel: string): string => `„${titel}” - kötve (legato) vagy röviden (staccato) szólt?`,
    articWahl: ["Kötve - legato", "Röviden - staccato"],
    articErklLegato: "A hangok egymásba folytak - legato.",
    articErklStaccato: "Minden hang röviden elválasztva - staccato.",
  },

  lesekonzert: {
    frage:
      "Olvasókoncert: olvasd el a Braille-sort (NEM játsszuk le!), vésd az emlékezetedbe, és nyomd meg a „Kész, elolvastam” gombot. Aztán játszd el a hangokat emlékezetből a billentyűzeten.",
    erkl: "Olvasni, megjegyezni, játszani - pontosan így olvassák a Braille-kottát hangszeren játszva.",
  },

  liederquiz: {
    hoerenFrage: "Hallgasd meg az elejét - melyik dal ez?",
    hoerenErkl: (titel: string): string => `Ez ${az(titel)} „${titel}” eleje volt.`,
    lesenFrage: "Olvasd el a kezdősort Braille-ben - hang nélkül! Melyik dalt ismered fel?",
    lesenErkl: (titel: string): string => `Ez a sor ${az(titel)} „${titel}” eleje - csendes olvasás a belső füllel.`,
  },

  liedZeile: {
    frage: (titel: string, zeile: number): string =>
      `${titel}, ${zeile}. sor: előbb hallgasd meg, aztán írd le hangról hangra - most MÁR oktávjellel.`,
  },
};
