/** Bereich `aufgabenC` - Svenska: världarna 7, 8 och 9. */
import type { aufgabenC as De } from "../de/aufgabenC";

export const aufgabenC: typeof De = {
  zellen: {
    oktavzeichenDer: (oktave: string): string => `oktavtecknet för ${oktave}`,
    oktavzeichen: "oktavtecknet",
    vorzeichen: "förtecknet",
    verlaengerungspunkt: "punkten som gör noten längre - punkt 3",
    taktstrich: "taktstreck - mellanslagstangenten",
  },

  // --- Värld 7 „Teorilekplatsen" ---------------------------------------------
  tonleitern: {
    spielNach:
      "Spela C-durskalan uppåt: C D E F G A B C - på tangenterna D F G H J K L, sedan en oktav upp och D igen.",
    spielNachErkl: "Åtta steg från C till nästa C.",
    durMollFrage: "Lyssna på skalan - dur (ljus) eller moll (mörk)?",
    durMollWahl: ["Dur", "Moll"],
    durMollErklMoll: "Det tredje steget är sänkt - naturlig moll.",
    durMollErklDur: "En vanlig durskala.",
    fehlerFrage: "I den här durskalan har EN ton glidit iväg. Vilket steg var fel?",
    fehlerWahl: ["Steg 3", "Steg 4", "Steg 5", "Steg 6", "Steg 7"],
    fehlerErkl: (stufe: number): string => `Steg ${stufe} lät för högt.`,
    schreibe:
      "Skriv G-durskalan: G A B C D E - och sedan F kors, alltså ett kors före F (det är det enda korset i G-dur).",
    schreibeErkl: "G-dur har ett kors: F blir F-kors.",
  },

  quintenzirkel: {
    vz: {
      kreuz: { ein: "kors", mehr: "kors" },
      be: { ein: "b", mehr: "b" },
    },
    anzahlFrage: (name: string, mehr: string): string =>
      `Stanna på kvintcirkeln: ${name}. Hur många ${mehr} har den här tonarten?`,
    anzahlErkl: (name: string, n: number, wort: string): string => `${name} har ${n} ${wort}.`,
    nameFrage: (n: number, wort: string): string => `${n} ${wort} - vilken durtonart är det?`,
    nameErkl: (n: number, wort: string, name: string): string => `${n} ${wort}: det är ${name}.`,
    lesenFrage: "Läs tonarten i punktskrift - vilken tonart är det?",
    lesenErkl: (name: string): string => `Den här tonarten hör till ${name}.`,
  },

  rhythmusdiktat: {
    blattFrage: "Läs rytmen på notsystemet och klappa den på mellanslagstangenten - rakt från sidan.",
    diktatFrage: (rhythm: boolean): string =>
      `Rytmdiktat: jag klappar en takt på tonen G. Skriv ner notvärdena du hör${rhythm ? " (rytmorden är påslagna)" : ""}. Starttonen är G. Lyssna så ofta du vill.`,
    diktatErkl: "Räkna slagen för varje ton: fjärdedelsnot = ett slag, halvnot = två.",
  },

  melodiediktat: {
    frage: (startton: string, anzahl: number): string =>
      `Melodidiktat: starttonen är ${startton}. Lyssna på de ${anzahl} tonerna och skriv ner dem - de rör sig i små steg. Lyssna så ofta du vill.`,
    erkl: "Jämför ton för ton med starttonen: går det uppåt eller nedåt?",
  },

  detektiv: {
    frage: "Läs punktskriftsraden och lyssna på inspelningen. Var skiljer sig ljudet från noterna?",
    note: (n: number): string => `Ton ${n}`,
    allesRichtig: "Allt stämmer",
    erklRichtig: "Allt stämde - ljudet och noterna var likadana.",
    erklAnders: (n: number): string => `Ton ${n} lät annorlunda än det som stod skrivet.`,
  },

  baumeister: {
    dreiViertel:
      "Bygg en hel 3/4-takt: skriv noter och pauser med f d s j k l tills slagen blir exakt 3. Enter kontrollerar det.",
    mitPause: "Bygg en 4/4-takt med minst EN paus. Enter kontrollerar det.",
    mitNoten: "Bygg en 4/4-takt med minst TRE noter. Enter kontrollerar det.",
    sechsAchtel: "Utmaning: bygg en hel 6/8-takt (sex slag av åttondelar). Enter kontrollerar det.",
  },

  spielwiese: {
    frage:
      "Klanglekplatsen: över den tysta bordunen kan du spela fritt - med D F G J K (pentatonisk skala). Ingen ton kan vara fel. Berätta en liten historia: först tyst, sedan starkt. Efter 30 toner räknas verkstaden som besökt.",
  },

  kadenzen: {
    schlussFrage: "Två ackord som avslutning - låter det färdigt, eller fortsätter det?",
    schlussWahl: ["Färdigt - en ordentlig avslutning", "Öppet - det fortsätter"],
    schlussErklOffen: "Att stanna på dominanten (V) känns öppet - en ofullkomlig kadens (halvslut).",
    schlussErklZu: "Från dominanten tillbaka till grundackordet - det låter färdigt (en fullkomlig kadens).",
    artFrage: "Vilken sorts avslutning är det här?",
    artWahl: [
      "Fullkomlig - från dominanten (V) till grundackordet",
      "Plagal - „Amen“-avslutningen från subdominanten (IV)",
    ],
    artErklPlagal: "IV till I - den mjuka „Amen“-avslutningen (plagal).",
    artErklAuth: "V till I - den starka, fullkomliga avslutningen.",
    funktionFrage: "Vilken uppgift har det här ackordet i C-dur?",
    funktionWahl: ["Tonika (ackord I)", "Subdominant (ackord IV)", "Dominant (ackord V)"],
    funktionErkl: [
      "Tonika (T) - grundackordet, ackord I.",
      "Subdominant (S) - ackord IV.",
      "Dominant (D) - ackord V.",
    ],
  },

  komponier: {
    frage:
      "Komponerverkstad: skriv fritt med f d s j k l, lyssna på ditt stycke och spara det (upp till 5). Verkstaden räknas som besökt så snart du har sparat ett stycke.",
  },

  // --- Värld 8 „Instrumenten" ------------------------------------------------
  fingersatz: {
    lesenFrage: "Läs noten och fingersättningen: vilket finger ska spela tonen? (Fingersättningen kommer EFTER noten.)",
    lesenErkl: (finger: string): string => `Den lilla siffran efter noten är ${finger}.`,
    schreibenFrage: (ton: string, finger: string): string =>
      `Skriv tonen ${ton} och lägg till fingersättningen för ${finger} - den kommer EFTER tonen.`,
    fingerZelle: (finger: string): string => `${finger} - fingersättningen`,
    schreibenErkl: (finger: string): string => `${finger} får sin siffra direkt efter tonen.`,
    positionFrage: "Var kommer fingersättningen - före eller efter noten?",
    positionWahl: ["Efter noten", "Före noten"],
    positionErkl: "Till skillnad från artikulationstecknet kommer fingersättningen EFTER noten (före en bindebåge, om det finns en).",
  },

  klavier: {
    zweiFrage:
      "Två rader - överst högerhanden (violinnyckel), underst vänsterhanden (basnyckel). Hur många toner spelar VÄNSTERhanden? Med Alt + Q ser och hör du en hand för sig, i stor storlek.",
    zweiWahl: (n: number): string => `${n} toner`,
    zweiErkl: "Räkna nothuvudena på den nedre raden - eller lyssna på den låga handen för sig (Alt + Q).",
    handFrage: "Den här raden börjar med ett handtecken. Vilken hand är det för?",
    handWahl: ["Högerhand", "Vänsterhand"],
    handErklLinks: "Punkterna 4, 5, 6 och sedan 3, 4, 5: tecknet för vänsterhanden.",
    handErklRechts: "Punkterna 4, 6 och sedan 3, 4, 5: tecknet för högerhanden.",
    melodieFrage:
      "Två händer efter varandra: den ena spelar melodin (högre, rörlig), den andra ackompanjerar nere. Vilken var melodin?",
    melodieWahl: ["Stämman som spelades först", "Den andra stämman"],
    melodieErkl: "Melodin är den högre stämman som rör sig - oftast högerhanden.",
    rechteHandFrage: (ton: string): string =>
      `Skriv tecknet för högerhanden (punkterna 4, 6 och sedan 3, 4, 5) och efter det tonen ${ton} med dess oktavtecken.`,
    rechteHandZellen: ["högerhand, första cellen - punkterna 4, 6", "högerhand, andra cellen - punkterna 3, 4, 5"],
    rechteHandErkl: "Efter handtecknet börjar stämman med ett oktavtecken.",
    pedalFrage: "Vilket pedaltecken är det här - och kommer det före eller efter noten?",
    pedalWahl: ["Pedal ned - FÖRE noten", "Pedal upp - EFTER noten"],
    pedalErklNieder: "Pedal ned (punkterna 1, 2, 6 och sedan 1, 4) kommer före tonen där pedalen trycks ned.",
    pedalErklAuf: "Pedal upp (punkterna 1, 6 och sedan 1, 4) kommer efter tonen där pedalen släpps.",
  },

  gesang: {
    melismaFrage: "På stavelsen „la“ - hur många toner sjunger rösten? (Flera toner på en stavelse kallas en melisma.)",
    melismaWahl: ["En ton", "Två toner", "Tre toner"],
    melismaErkl: (n: number): string =>
      `Stavelsen får ${n} toner - en melisma. I punktskrift binder stavelsebågen (punkterna 1, 4) ihop dem.`,
    bogenFrage:
      "En stavelse på två toner: skriv den första tonen, stavelsebågen (punkterna 1, 4) och den andra tonen.",
    bogenZelle: "stavelsebåge - punkterna 1, 4",
    bogenErkl: "Stavelsebågen säger: båda tonerna hör till en stavelse.",
    atemFrage: "Den här raden har ett andningstecken. Efter vilken ton andas du?",
    atemWahl: ["Efter den första tonen", "Efter den andra tonen", "Efter den tredje tonen"],
    atemErkl: "Det halva andningstecknet (punkterna 3, 4, 5 och sedan 2) kommer direkt efter den första tonen.",
    zeilenFrage: "I vokalmusik turas rader med ord och rader med noter om. Vilket förtecken anger en rad med ORD?",
    zeilenWahl: ["Ordförtecken (punkterna 5, 6 och sedan 2, 3)", "Musikförtecken (punkt 6 och sedan punkt 3)"],
    zeilenErkl: "Ordraden har förtecknet punkterna 5, 6 och sedan 2, 3; musikraden har punkt 6 och sedan punkt 3.",
  },

  gitarre: {
    saiteFrage:
      "Strängtecknet (punkterna 1, 4, 6) och en siffra säger vilken sträng du ska spela. Vilken sträng är det här?",
    saiteWahl: (s: number): string => `Sträng ${s}`,
    saiteErkl: (s: number): string => `Strängtecknet plus siffran ${s}: sträng ${s}.`,
    schreibenFrage: (saite: number, ton: string): string =>
      `Skriv tecknet för sträng ${saite} och sedan tonen ${ton}: först strängtecknet (punkterna 1, 4, 6), sedan siffran, sedan tonen.`,
    saitenzeichenZelle: "strängtecken - punkterna 1, 4, 6",
    ziffernZelle: (saite: number): string => `siffran ${saite} - sträng ${saite}`,
    schreibenErkl: "Strängtecknet kommer före tonen; INGET oktavtecken följer efter det.",
    akkordSorten: { dur: "durackord", moll: "mollackord", sept: "dominantseptackord (kursiv 7)" },
    akkordFrage:
      "Lyssna på det brutna ackordet - vilken sort är det? (Cirkeln, triangeln och den kursiva 7:an är internationella; bokstavsbeteckningar som „C7“ skrivs lite olika i varje land.)",
    akkordErkl: (sorte: string): string => `Det var ett ${sorte}.`,
  },

  generalbass: {
    aussetzungFrage:
      "Basstonen är siffersatt med en 6. Vilken utskrivning låter rätt - med en sext eller med en kvint ovanför basen?",
    aussetzungWahl: ["Ters och sext ovanför basen", "Ters och kvint ovanför basen"],
    aussetzungErklSext: "En 6 kräver sexten ovanför basen - ackordet i första omvändningen.",
    aussetzungErklQuint: "Utan siffror (eller med 5/3) låter ackordet i grundläge, med kvinten.",
    stufeFrage: "Generalbasen tänker i ackord byggda på skalans steg. Vilket huvudackord hör du här?",
    stufeWahl: ["Tonika (ackord I)", "Subdominant (ackord IV)", "Dominant (ackord V)"],
    stufeErkl: [
      "Det var tonikan (ackord I) - bron från kadenserna till generalbasen.",
      "Det var subdominanten (ackord IV) - bron från kadenserna till generalbasen.",
      "Det var dominanten (ackord V) - bron från kadenserna till generalbasen.",
    ],
    schreibenFrage:
      "Skriv en baston med siffror: C och under den siffran 6 (siffertecknet och den låga siffran 6).",
    zahlzeichenZelle: "siffertecken - punkterna 3, 4, 5, 6",
    ziffer6Zelle: "den låga siffran 6 - punkterna 2, 3, 5",
    schreibenErkl: "Generalbasens siffror skrivs som LÅGA siffror efter siffertecknet.",
  },

  partitur: {
    auftakt: {
      frage: "Ett stycke börjar med en upptakt. Vilket nummer har den här första, ofullständiga takten?",
      wahl: ["Takt 0", "Takt 1", "Takt 2"],
      erkl: "Upptakten räknas som takt 0 - den första fulla takten är då takt 1.",
    },
    taktzahl: {
      frage: "Så här ser ett taktnummer vid radkanten ut (här: 16). Står det ett siffertecken framför?",
      wahl: ["Nej - taktnummer har inget siffertecken", "Ja - alltid med siffertecken"],
      erkl: "Taktnummer i marginalen har inget siffertecken - bara siffrorna själva.",
    },
    format: {
      frage: "Hur ordnar en punktskriftspartitur två händer eller stämmor, så att du kan jämföra dem takt för takt?",
      wahl: ["Avsnitt för avsnitt, rad över rad (takt över takt)", "Allt på en enda lång rad"],
      erkl: "I takt-över-takt-formatet ligger stämmorna ovanpå varandra avsnitt för avsnitt - takt bredvid takt, lätt att läsa.",
    },
    quellen: {
      frage: "Var kan du få färdig punktskriftsmusik att läsa?",
      wahl: ["Från bibliotek för synskadade, som har punktskriftsmusik", "Bara genom att kopiera den själv"],
      erkl: "Bibliotek för blinda och synskadade, till exempel i Sverige, har tusentals titlar i punktskriftsmusik.",
    },
  },

  orchester: {
    familieKlavier: "stränginstrument (slaget)",
    familieGitarre: "stränginstrument (plockat)",
    familieBlas: "blåsinstrument (blåst)",
    hoerenFrage: "Lyssna på den korta melodin - till vilken instrumentfamilj hör det här ljudet?",
    hoerenWahl: ["Stränginstrument - plockade eller slagna", "Blåsinstrument - blåsta", "Membraninstrument - slagna"],
    hoerenErkl: (instrument: string, familie: string): string => `${instrument}: ${familie}.`,
    fragen: [
      { frage: "Till vilken familj hör trumman (enligt Hornbostel-Sachs)?", richtig: "Membraninstrument", falsch: ["Stränginstrument", "Blåsinstrument"] },
      { frage: "Till vilken familj hör violinen?", richtig: "Stränginstrument", falsch: ["Blåsinstrument", "Membraninstrument"] },
      { frage: "Till vilken familj hör blockflöjten?", richtig: "Blåsinstrument", falsch: ["Membraninstrument", "Självklingande instrument"] },
      { frage: "Till vilken familj hör triangeln?", richtig: "Självklingande instrument", falsch: ["Membraninstrument", "Stränginstrument"] },
    ],
    familieErkl: (richtig: string): string => `Rätt: ${richtig}.`,
  },

  // --- Värld 9 „Sångscenen" ---------------------------------------------------
  lieder2: {
    dazuWahl: [
      "Det blev starkare - ett crescendo",
      "Tonerna blev korta - staccato",
      "Tonerna flöt mjukt in i varandra - legato",
    ],
    dazuDynamikFrage: (titel: string): string => `„${titel}“ - först vanligt, sedan med uttryck. Vad lades till?`,
    dazuDynamikErkl: "Den andra versionen blev starkare - ett crescendo.",
    dazuStaccatoFrage: (titel: string): string => `„${titel}“ - vad lades till i den vanliga versionen?`,
    dazuStaccatoErkl: "Tonerna blev korta och lätta - staccato.",
    dazuLegatoFrage: (titel: string): string => `„${titel}“ - vad lades till?`,
    dazuLegatoErkl: "Tonerna var mjukt sammanbundna - legato, legatobågen.",
    articFrage: (titel: string): string => `„${titel}“ - spelades sammanbundet (legato) eller kort (staccato)?`,
    articWahl: ["Sammanbundet - legato", "Kort - staccato"],
    articErklLegato: "Tonerna flöt in i varandra - legato.",
    articErklStaccato: "Varje ton klipptes kort - staccato.",
  },

  lesekonzert: {
    frage:
      "Läskonsert: läs punktskriftsraden (den SPELAS INTE för dig!), lär dig den utantill och tryck på „Klar med läsningen“. Spela sedan tonerna utantill på tangentbordet.",
    erkl: "Läs, minnas, spela - just så läser du punktskriftsmusik vid ett instrument.",
  },

  liederquiz: {
    hoerenFrage: "Lyssna på början - vilken sång är det?",
    hoerenErkl: (titel: string): string => `Det var början på „${titel}“.`,
    lesenFrage: "Läs den första raden i punktskrift - utan ljud! Vilken sång känner du igen?",
    lesenErkl: (titel: string): string => `Den här raden är början på „${titel}“ - tyst läsning med det inre örat.`,
  },

  liedZeile: {
    frage: (titel: string, zeile: number): string =>
      `${titel}, rad ${zeile}: lyssna först, skriv sedan not för not - nu MED oktavtecken.`,
  },
};
