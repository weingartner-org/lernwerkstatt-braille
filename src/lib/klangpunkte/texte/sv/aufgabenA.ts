/** Bereich `aufgabenA` - Svenska. */
import type { aufgabenA as De } from "../de/aufgabenA";

export const aufgabenA: typeof De = {
  gemeinsam: {
    taktstrichZelle: "Taktstreck - mellanslagstangenten",
    zahlzeichen: "siffertecknet",
    obereZahl: (n: number): string => `${n} (övre siffran)`,
    tiefeZahl: (n: number): string => `${n} som sänkt siffra`,
    schlagzahl: (b: number): string => String(b),
  },
  hilfe: {
    schreibNote: (ton: string, wert: string): string => `Skriv: ${ton} - ${wert}.`,
    welcheNote: "Vilken not är det här? Lyssna noga och känn cellen.",
    dasWar: (ton: string, wert: string): string => `Det var ${ton} - ${wert}.`,
  },
  kp1: {
    zweiHoeher: "Två toner. Vilken var högre?",
    dreiHoechster: "Tre toner. Vilken var den högsta?",
    ordinale: ["Den första", "Den andra", "Den tredje"],
    hoechsterErklaer: (i: number): string => `${["Den första", "Den andra", "Den tredje"][i]} tonen var den högsta.`,
    leiter: "En liten skala. Går den uppåt eller nedåt?",
    leiterWahl: ["Uppåt", "Nedåt"],
    leiterRauf: "Den gick uppåt.",
    leiterRunter: "Den gick nedåt.",
  },
  kp2: {
    prompt: (len: number): string => `Lyssna på rytmen och klappa den tillbaka på mellanslagstangenten - ${len} slag.`,
  },
  kp3: {
    grundform: " (Grundformen är åttondelsnoten.)",
  },
  kp4: {
    prompt: "Lyssna på sången och skriv den not för not.",
  },
  kp5: {
    viertelHinweis: " (Fjärdedelsnot = lägg till punkt 6 - precis som punkt 3 för bokstäverna k till t.)",
    melodie: "Skriv sången - bara fjärdedelsnoter.",
    frage: "Åttondelsnot eller fjärdedelsnot?",
    wahl: ["Åttondelsnot", "Fjärdedelsnot"],
    erklaerAchtel: "Ingen extra punkt nedtill: en åttondelsnot.",
    erklaerViertel: "Med punkt 6 tillagd: en fjärdedelsnot.",
  },
  kp6: {
    halbeHinweis: " (Halvnot = lägg till punkt 3.)",
    ganzeHinweis: " (Helnot = lägg till punkterna 3 och 6.)",
    frage: "Vilket notvärde är det här?",
    erklaer: (wert: string): string => `Det var en ${wert}.`,
  },
  kp7: {
    schreibPause: (pause: string): string => `Skriv: ${pause}.`,
    taktart: "Vilken taktart är det här?",
    taktartErklaer: (a: number, b: number): string =>
      `Det var ${a}/${b}-takt: siffertecknet, ${a} överst, ${b} under som sänkt siffra.`,
    taktstrich: (ton1: string, ton2: string): string =>
      `Skriv: ${ton1} halvnot, taktstreck (mellanslagstangenten), ${ton2} halvnot.`,
    taktstrichErklaer: "I punktskrift är taktstrecket ett mellanslag.",
  },
  kp8: {
    prompt: (ton: string, wert: string): string =>
      `Skriv: ${ton} - punkterad ${wert}. (Punkten som gör noten längre är punkt 3 i en EGEN cell.)`,
    punktZelle: "punkten som gör noten längre - punkt 3",
  },
  kp9: {
    prompt: (vorzeichen: string, ton: string): string =>
      `Skriv: ${vorzeichen}, sedan ${ton} som fjärdedelsnot. (Förtecknet står direkt FÖRE noten.)`,
  },
  kp10: {
    lage: "I vilken oktav låter det här?",
    lageWahl: ["Lågt (tredje oktaven)", "Mitten (fjärde oktaven)", "Högt (femte oktaven)"],
    lageErklaer: (oktave: string): string => `Det var ${oktave}.`,
    schreib: (ton: string, oktave: string): string =>
      `Skriv ${ton} i ${oktave} som FÖRSTA noten i ett stycke, en fjärdedelsnot. (Först oktavtecknet, sedan noten.)`,
    zeichenZelle: (oktave: string): string => `oktavtecknet för ${oktave}`,
  },
  kp11: {
    gleich: "samma ton",
    sekundeTerz: "en sekund eller en ters",
    quarteQuinte: "en kvart eller en kvint",
    sexteMehr: "en sext eller mer",
    regelKlein: "En sekund eller en ters behöver ALDRIG ett oktavtecken.",
    regelMittel: "En kvart eller en kvint behöver BARA ett oktavtecken när oktaven byts.",
    regelGross: "Från en sext uppåt behöver noten ALLTID ett oktavtecken.",
    prompt: (ton1: string, oktave1: string, ton2: string, oktave2: string): string =>
      `Första tonen: ${ton1}, ${oktave1}. Sedan: ${ton2}, ${oktave2}. Behöver den andra tonen ett oktavtecken?`,
    wahl: ["Ja", "Nej"],
    erklaer: (sprung: string, regel: string): string => `Språnget är ${sprung}. ${regel}`,
  },
  kp12: {
    grossPrompt: "I 4/4-takt fyller EN enda cell hela takten. Helnot eller sextondelsnot?",
    grossWahl: ["En helnot", "En sextondelsnot"],
    grossErklaer:
      "En enda cell som ska fylla fyra slag är den LÅNGA noten: helnoten. En sextondelsnot skulle bli alldeles för kort.",
    kleinPrompt: "I 2/4-takt står ÅTTA likadana celler efter varandra. Helnoter eller sextondelsnoter?",
    kleinWahl: ["Helnoter", "Sextondelsnoter"],
    kleinErklaer:
      "Åtta helnoter skulle aldrig få plats i två slag - de måste vara de KORTA noterna: sextondelsnoter. Taktarten och sammanhanget avgör.",
  },
  kp13: {
    similePrompt: "Skriv punktskriftens upprepningstecken för takten (spela hela takten igen).",
    simileZelle: "upprepningstecknet för takten - punkterna 2, 3, 5, 6",
    simileErklaer: "Den här förkortningen finns bara i punktskrift - smartare än i tryck!",
    startPrompt: "Skriv: början på en upprepning (två celler).",
    startZellen: ["första cellen - punkterna 1, 2, 6", "andra cellen - punkterna 2, 3, 5, 6"],
    endePrompt: "Skriv: slutet på en upprepning (två celler).",
    endeZellen: ["första cellen - punkterna 1, 2, 6", "andra cellen - punkterna 2, 3"],
    schluss: "Slutstrecket (slutet på stycket)",
    anfang: "Början på upprepningen",
    ende: "Slutet på upprepningen",
    erkennenPrompt: "Vilket formtecken är det här?",
    erkannt: (zeichen: string): string => `Det var: ${zeichen}.`,
  },
  haltebogen: {
    hoerenPrompt: "Två halvnoter på samma ton. Spelades de en gång eller två gånger?",
    hoerenWahl: ["En gång - bunden", "Två gånger - skilda"],
    hoerenGebunden: "Bara ett anslag: bindebågen binder ihop de två tonerna till EN lång ton.",
    hoerenGetrennt: "Två anslag: här fanns ingen bindebåge - varje ton börjar om.",
    schreibPrompt: (ton: string): string =>
      `Skriv: ${ton} halvnot, bindebåge (två celler: punkt 4, sedan punkterna 1 och 4), sedan ${ton} halvnot igen.`,
    zelle1: "bindebåge, första cellen - punkt 4",
    zelle2: "bindebåge, andra cellen - punkterna 1, 4",
    klingtWeiter: (note: string): string => `${note} - klingar vidare, utan nytt anslag`,
    schreibErklaer: "Bindebågen kommer direkt EFTER den första noten.",
    taktPrompt: (ton: string): string =>
      `Bindebåge över taktstrecket: ${ton} halvnot, bindebåge, taktstreck (mellanslagstangenten), ${ton} halvnot.`,
    taktErklaer: "Så fortsätter en ton att klinga över taktstrecket.",
  },
  auftakt: {
    vollPrompt: (a: number, b: number): string =>
      `${a}/${b}-takt. Lyssna på takten och räkna med: är den komplett?`,
    vollWahl: ["Komplett", "Ofullständig - en upptakt eller en del av en takt"],
    vollJa: (ziel: string): string => `Det stämmer exakt: ${ziel} slag.`,
    vollNein: (summe: string, ziel: string): string =>
      `Något saknas: det är bara ${summe} av ${ziel} slag - en ofullständig takt. I början av ett stycke kallas den en upptakt.`,
    bindestrichPrompt: "Takten är inte slut vid radslutet. Skriv musikbindestrecket (punkt 5).",
    bindestrichZelle: "musikbindestrecket - punkt 5",
    bindestrichErklaer: "Punkt 5 i slutet av en rad betyder: den här takten fortsätter på nästa rad.",
    schreibPrompt: (ton: string): string =>
      `Skriv upptakten: ${ton} fjärdedelsnot, taktstreck (mellanslagstangenten), sedan hela takten.`,
    auftaktZelle: (note: string): string => `${note} - upptakten`,
    schreibErklaer: "En upptakt är en ofullständig första takt - den skrivs precis som alla andra.",
  },
  pausen2: {
    vielePrompt: (n: number): string => `Skriv: ${n} takter paus - siffertecknet, ${n}:an, sedan helpausen.`,
    zahlzeichenZelle: "siffertecknet - punkterna 3, 4, 5, 6",
    zahlZelle: (n: number): string => `siffran ${n}`,
    ganzePauseZelle: "helpausen - punkterna 1, 3, 4",
    vieleErklaer: "Från fyra tomma takter och uppåt skriver punktskriften antalet som en siffra före helpausen.",
    kleinPrompt: (n: number): string =>
      `Skriv: ${n} tomma takter - upp till tre takter skriver du helt enkelt helpausen ${n === 2 ? "två" : "tre"} gånger.`,
    kleinZelle: (i: number): string => `helpaus ${i} - en hel tom takt`,
    kleinErklaer: "Helpausen fyller ALLTID en hel takt - oavsett taktart.",
    lesenPrompt: "Hur många tysta takter finns det?",
    takte: (n: number): string => `${n} takter`,
    lesenKlein: (n: number): string => `${n} helpauser i rad = ${n} tomma takter.`,
    lesenGross: (n: number): string => `Siffertecknet + ${n} + helpaus = ${n} takter tystnad på en gång.`,
    stillePrompt: "Tre takter - en av dem är helt tyst. Vilken?",
    stilleWahl: ["I början", "I mitten", "I slutet"],
    stilleErklaer: (i: number): string =>
      `Tystnaden var ${["i början", "i mitten", "i slutet"][i]} - en hel takt paus.`,
  },
  tonart: {
    keyNames: {
      kreuz: ["G-dur", "D-dur", "A-dur", "E-dur"],
      be: ["F-dur", "B-dur", "Ess-dur", "As-dur"],
    },
    kreuz: "kors",
    be: "b",
    kreuze: "kors",
    bes: "b",
    lesenPrompt: (mehrzahl: string): string =>
      `Den här tonarten står i början av stycket. Hur många ${mehrzahl} finns det?`,
    lesenErklaer: (n: number, name: string, tonart: string, ab4: boolean): string =>
      `${n} ${name} - tonarten ${tonart}. ${
        ab4 ? "Från fyra och uppåt står siffran framför." : "Upp till tre upprepas tecknet helt enkelt."
      }`,
    schreibKlein: (n: number, name: string, zeichen: string): string =>
      `Skriv tonarten: ${n} ${name} - skriv helt enkelt tecknet ${zeichen} ${n === 1 ? "en gång" : n === 2 ? "två gånger" : "tre gånger"}.`,
    schreibGross: (n: number, mehrzahl: string, zeichen: string): string =>
      `Skriv tonarten: ${n} ${mehrzahl} - från fyra med ett siffertecken: siffertecknet, ${n}:an, sedan ${zeichen}.`,
    zeichenZelle: (name: string, i: number, punkte: string): string => `${name} ${i} - punkterna ${punkte}`,
    zahlzeichenZelle: "siffertecknet - punkterna 3, 4, 5, 6",
    zahlZelle: (n: number): string => `siffran ${n}`,
    dasZeichen: (name: string): string => `${name}-tecknet`,
    istVorzeichnung: (tonart: string): string => `Det är tonarten ${tonart}.`,
    kopfPrompt: (n: number, name: string, a: number, b: number): string =>
      `Skriv början på ett stycke: först tonarten (${n} ${name}), direkt efter den taktarten ${a}/${b} - utan mellanslag emellan.`,
    kopfZelle: (name: string, i: number): string => `${name} ${i}`,
    kopfErklaer: "Tonart och taktart står tillsammans i början av ett stycke - först tonarten, sedan taktarten.",
    regelPrompt: "Tonarten i början av ett stycke - hur länge gäller den?",
    regelWahl: ["För hela stycket", "Bara för första takten", "Bara för första noten"],
    regelErklaer:
      "Tonarten gäller för hela stycket - ett förtecken mitt i en takt gäller däremot bara fram till taktstrecket.",
  },
  taktwechsel: {
    sonderPrompt: "Vilken taktart är det här?",
    sonderWahl: ["C - vanlig takt (fyra fjärdedelsslag)", "Alla breve - halvtakt (två halvnotsslag)", "3/4-takt"],
    sonderErklaerC: "Punkterna 4, 6 före c: C i vanlig takt.",
    sonderErklaerAb: "Punkterna 4, 5, 6 före c: alla breve - halvnoterna bär slagen.",
    sonderSchreibenC: "Skriv C-taktecknet: punkterna 4 och 6, sedan c (punkterna 1, 4).",
    sonderSchreibenAb: "Skriv alla breve: punkterna 4, 5 och 6, sedan c (punkterna 1, 4).",
    vorzeichenC: "tecknet - punkterna 4, 6",
    vorzeichenAb: "tecknet - punkterna 4, 5, 6",
    dasC: "c - punkterna 1, 4",
    wechselPrompt: "Efter några toner kommer en ANDRA taktart. Vad betyder det?",
    wechselWahl: (a: number, b: number): string[] => [
      `Taktarten byts till ${a}/${b}`,
      "Tonarten byts",
      "Stycket är slut",
    ],
    wechselErklaer: (a: number, b: number): string =>
      `En ny taktart mitt i ett stycke betyder: från och med här gäller ${a}/${b}-takt.`,
    wechselSchreiben: (a: number, b: number): string =>
      `Taktarten byts mitt i stycket: skriv ett taktstreck (mellanslagstangenten), sedan den nya taktarten ${a}/${b}.`,
  },
  schluessel: {
    lesenPrompt: "Vilken nyckel är det här (tre celler)?",
    lesenErklaer: (schluessel: string): string =>
      `Det var ${schluessel}. Alla nycklar börjar med punkterna 3, 4, 5 och slutar med punkterna 1, 2, 3 - den mellersta cellen skiljer dem åt.`,
    mitteViolin: "punkterna 3, 4",
    mitteBass: "punkterna 3, 4, 5, 6",
    schreibPrompt: (schluessel: string, mitte: string): string =>
      `Skriv ${schluessel} - tre celler: punkterna 3, 4, 5 · ${mitte} · punkterna 1, 2, 3.`,
    ankuendigung: "nyckelns början - punkterna 3, 4, 5",
    gZeichen: "G-tecknet - punkterna 3, 4",
    fZeichen: "F-tecknet - punkterna 3, 4, 5, 6",
    abschluss: "slutet - punkterna 1, 2, 3",
    wissenPrompt: "Behöver punktskriftsmusik nycklar för att räkna ut tonhöjden?",
    wissenWahl: ["Nej - oktavtecknen talar om oktaven", "Ja - utan nyckel fungerar ingenting"],
    wissenErklaer:
      "I punktskrift ger nyckeltecknen bara information om den tryckta sidan - oktaven bestäms alltid av oktavtecknen.",
  },
  sechzehntel: {
    hoerenPrompt: "En kort slinga. Åttondelsnoter - eller sextondelsnoterna, som är dubbelt så snabba?",
    hoerenWahl: ["Åttondelsnoter", "Sextondelsnoter"],
    hoerenSchnell: "Det var sextondelsnoter - fyra per slag.",
    hoerenLangsam: "Det var åttondelsnoter - två per slag.",
    gruppePrompt:
      "Skriv gruppen med fyra sextondelsnoter: bara den FÖRSTA noten får punkterna 3 och 6, och de tre andra skriver du som åttondelsnoter (gruppering).",
    ersteZelle: (ton: string): string => `${ton} som sextondelsnot - med punkterna 3 och 6`,
    andereZelle: (ton: string): string => `${ton} - skriven som åttondelsnot (den hör till gruppen)`,
    gruppeErklaer: "Gruppering gör snabba löpningar lätta att läsa: längdpunkterna kommer bara på gruppens första not.",
    regelPrompt:
      "Fyra sextondelsnoter i ett slag, skrivna som en grupp: hur många celler bär längdpunkterna 3 och 6?",
    regelWahl: ["Bara den första", "Alla fyra", "Den första och den sista"],
    regelErklaer:
      "Bara gruppens första not visar längden - resten ser ut som åttondelsnoter. Det här är punktskriftens motsvarighet till den ihopbundna gruppen i tryck.",
    einzelnPrompt: (ton: string): string =>
      `Skriv: ${ton} som sextondelsnot. (Se upp - det är samma cell som helnoten; taktarten avgör!)`,
  },
  triolen: {
    hoerenPrompt: "Mellan två jämna slag: hur många toner delar på ETT slag - två eller tre?",
    hoerenWahl: ["Två - vanliga åttondelsnoter", "Tre - en triol"],
    hoerenTriole: "Tre lika långa toner på ett slag: en triol.",
    hoerenZwei: "Två åttondelsnoter - den vanliga delningen.",
    schreibPrompt: "Skriv trion: först trioltecknet (punkterna 2, 3), sedan de tre åttondelsnoterna.",
    triolenZeichen: "trioltecknet - punkterna 2, 3",
    achtelZelle: (ton: string): string => `${ton}, åttondelsnot - en tredjedel av slaget`,
    schreibErklaer: "Trioltecknet kommer EN gång före gruppen - det gör två åttondelsnoter till tre.",
    lesenPrompt: "Före tre åttondelsnoter står den här första cellen (punkterna 2, 3). Vad betyder den?",
    lesenWahl: ["En triol - tre toner på ett slag", "En åttondelspaus", "Ett oktavtecken"],
    lesenErklaer: "Punkterna 2, 3 före en grupp toner = triol.",
  },
  puls: {
    klopfPrompt: (n: number): string =>
      `Känn det jämna slaget och klappa det jämnt på mellanslagstangenten - ${n} slag långt.`,
    metrumPrompt: "Lyssna på de betonade slagen: marscherar det i tvåtakt eller svänger det i tretakt?",
    metrumWahl: ["Marsch - i tvåtakt", "Vals - i tretakt"],
    metrumDrei: "Var första av tre slag är betonat: en tretakt - valsen.",
    metrumZwei: "Var första av två slag är betonat: en tvåtakt - marschen.",
    abstandPrompt: "Räkna slagen från en betoning till nästa: hur många är det?",
    abstandWahl: ["2 slag", "3 slag", "4 slag"],
    abstandErklaer: (n: number): string => `Från betoning till betoning är det ${n} slag - ${n}/4-takt.`,
  },
  dauer: {
    vergleichPrompt: "Två toner, den ena efter den andra. Vilken klingade längre?",
    vergleichWahl: ["Den första", "Den andra"],
    vergleichErster: "Den första var en halvnot - dubbelt så lång som fjärdedelsnoten efter den.",
    vergleichZweiter: "Den andra var en halvnot - dubbelt så lång som fjärdedelsnoten före den.",
    schlaegePrompt: "Först två slag av pulsen, sedan en lång ton: hur många slag varade den?",
    schlaegeWahl: ["1 slag - en fjärdedelsnot", "2 slag - en halvnot", "4 slag - en helnot"],
    schlaegeErklaer: (wert: string, zahl: number): string =>
      `Det var en ${wert} - ${zahl} ${zahl === 1 ? "slag" : "slag"} lång.`,
    paarPrompt: "Två toner: lika långa - eller den andra dubbelt så lång?",
    paarWahl: ["Lika långa", "Den andra dubbelt så lång"],
    paarGleich: "Två fjärdedelsnoter av samma längd.",
    paarDoppelt: "Först en fjärdedelsnot, sedan en halvnot - dubbelt så lång.",
  },
  dynamik: {
    lautPrompt: "Lyssna på den korta frasen: spelades den starkt eller svagt?",
    lautWahl: ["Starkt", "Svagt"],
    lautErklaer: "Spelad kraftigt - senare kallar du det forte.",
    leiseErklaer: "Spelad mycket mjukt - senare kallar du det piano.",
    rampePrompt: "Blir frasen starkare eller svagare?",
    rampeWahl: ["Starkare", "Svagare"],
    cresc: "Från svagt till starkt - senare kallas det crescendo.",
    decresc: "Från starkt till svagt - senare kallas det decrescendo.",
    akzentPrompt: "En ton är särskilt betonad. Var satt den?",
    akzentWahl: ["I början", "I mitten", "I slutet"],
    akzentErklaer: (i: number): string =>
      `Den betonade tonen var ${["i början", "i mitten", "i slutet"][i]}.`,
  },
  inst: {
    merk: {
      klavier: "Piano - slaget, ett klart anslag som klingar vidare.",
      gitarre: "Gitarr - plockad, knäppande och strängig.",
      sax: "Saxofon - blåst, mjuk och rörig.",
      floete: "Flöjt - blåst, mjuk och klar.",
    },
    hoerenPrompt: "Vilket instrument spelar här?",
    vergleichPrompt: "Två små melodier, den ena efter den andra: samma instrument eller olika?",
    vergleichWahl: ["Samma instrument", "Olika instrument"],
    vergleichGleich: "Båda melodierna kom från samma instrument.",
    vergleichErklaer: (a: string, b: string): string => `Först ${a}, sedan ${b}.`,
    zuerstPrompt: "Två instrument, det ena efter det andra. Vilket spelade först?",
    zuerstErklaer: (a: string): string => `Först kom ${a}.`,
  },
  echo: {
    prompt: (len: number): string =>
      `Ekospel: lyssna på de ${len} tonerna och spela dem efter på tangentbordet - tangenterna D F G H J K L är tonerna C D E F G A B. Bara tonernas ordning räknas; rytmen är fri.`,
    erklaer: "Spela tonerna efter i samma ordning som du hörde dem.",
  },
  memory: {
    prompt:
      "Melodiminne: jag spelar en följd toner och du spelar den efter (tangenterna D F G H J K L är tonerna C D E F G A B). Om du klarar det läggs en ton till - hur långt kommer du?",
  },
};
