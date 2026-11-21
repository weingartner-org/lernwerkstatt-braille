/** Bereich `aufgabenC` - Italienisch: Welten 7, 8 und 9. */
import type { aufgabenC as De } from "../de/aufgabenC";

export const aufgabenC: typeof De = {
  zellen: {
    oktavzeichenDer: (oktave: string): string => `il segno d'ottava per la ${oktave}`,
    oktavzeichen: "il segno d'ottava",
    vorzeichen: "l'alterazione",
    verlaengerungspunkt: "il punto che allunga la nota - punto 3",
    taktstrich: "stanghetta - la barra spaziatrice",
  },

  // --- Mondo 7 "Parco giochi della teoria" ---------------------------------
  tonleitern: {
    spielNach:
      "Suona in salita la scala di do maggiore: do re mi fa sol la si do - sui tasti D F G H J K L, poi un'ottava sopra e di nuovo D.",
    spielNachErkl: "Otto gradini dal do al do successivo.",
    durMollFrage: "Ascolta la scala - maggiore (luminosa) o minore (scura)?",
    durMollWahl: ["Maggiore", "Minore"],
    durMollErklMoll: "Il terzo grado è abbassato - minore naturale.",
    durMollErklDur: "Una semplice scala maggiore.",
    fehlerFrage: "In questa scala maggiore UNA nota è scivolata. Quale grado era sbagliato?",
    fehlerWahl: ["Grado 3", "Grado 4", "Grado 5", "Grado 6", "Grado 7"],
    fehlerErkl: (stufe: number): string => `Il grado ${stufe} suonava troppo acuto.`,
    schreibe:
      "Scrivi la scala di sol maggiore: sol la si do re mi - e poi fa diesis, quindi un diesis davanti al fa (è l'unico diesis della tonalità di sol maggiore).",
    schreibeErkl: "Sol maggiore ha un diesis: il fa diventa fa diesis.",
  },

  quintenzirkel: {
    vz: {
      kreuz: { ein: "diesis", mehr: "diesis" },
      be: { ein: "bemolle", mehr: "bemolli" },
    },
    anzahlFrage: (name: string, mehr: string): string =>
      `Tappa sul circolo delle quinte: ${name}. Quanti ${mehr} ha questa tonalità?`,
    anzahlErkl: (name: string, n: number, wort: string): string => `${name} ha ${n} ${wort}.`,
    nameFrage: (n: number, wort: string): string => `${n} ${wort} - quale tonalità maggiore è?`,
    nameErkl: (n: number, wort: string, name: string): string => `${n} ${wort}: è ${name}.`,
    lesenFrage: "Leggi l'armatura di chiave in braille - quale tonalità è?",
    lesenErkl: (name: string): string => `Questa armatura di chiave appartiene a ${name}.`,
  },

  rhythmusdiktat: {
    blattFrage: "Leggi il ritmo sul pentagramma e battilo con la barra spaziatrice - direttamente dalla pagina.",
    diktatFrage: (rhythm: boolean): string =>
      `Dettato ritmico: batto una battuta sulla nota sol. Scrivi le durate che senti${rhythm ? " (le sillabe del ritmo sono attive)" : ""}. La nota iniziale è sol. Ascolta quante volte vuoi.`,
    diktatErkl: "Conta i tempi di ogni nota: semiminima = un tempo, minima = due.",
  },

  melodiediktat: {
    frage: (startton: string, anzahl: number): string =>
      `Dettato melodico: la nota iniziale è ${startton}. Ascolta le ${anzahl} note e scrivile - procedono per piccoli passi. Ascolta quante volte vuoi.`,
    erkl: "Confronta nota per nota con la nota iniziale: sale o scende?",
  },

  detektiv: {
    frage: "Leggi la riga braille e ascolta la registrazione. Dove il suono è diverso dalle note?",
    note: (n: number): string => `Nota ${n}`,
    allesRichtig: "Tutto giusto",
    erklRichtig: "Tutto coincideva - il suono e le note erano uguali.",
    erklAnders: (n: number): string => `La nota ${n} suonava diversa da come era scritta.`,
  },

  baumeister: {
    dreiViertel:
      "Costruisci una battuta completa di 3/4: scrivi note e pause con f d s j k l finché i tempi fanno esattamente 3. Invio la controlla.",
    mitPause: "Costruisci una battuta di 4/4 con almeno UNA pausa. Invio la controlla.",
    mitNoten: "Costruisci una battuta di 4/4 con almeno TRE note. Invio la controlla.",
    sechsAchtel: "Sfida: costruisci una battuta completa di 6/8 (sei tempi di croma). Invio la controlla.",
  },

  spielwiese: {
    frage:
      "Parco giochi sonoro: sopra il bordone tranquillo puoi suonare liberamente - con D F G J K (scala pentatonica). Nessuna nota può essere sbagliata. Racconta una piccola storia: prima piano, poi forte. Dopo 30 note il laboratorio conta come visitato.",
  },

  kadenzen: {
    schlussFrage: "Due accordi come conclusione - suona finito, o continua?",
    schlussWahl: ["Finito - una vera conclusione", "Aperto - continua"],
    schlussErklOffen: "Fermarsi sulla dominante (V) dà un senso di apertura - una semicadenza.",
    schlussErklZu: "Dalla dominante all'accordo di casa - suona finito (una cadenza perfetta).",
    artFrage: "Che tipo di conclusione è questa?",
    artWahl: [
      "Perfetta - dalla dominante (V) all'accordo di casa",
      "Plagale - la conclusione dell'“Amen” dalla sottodominante (IV)",
    ],
    artErklPlagal: "IV-I - la dolce conclusione dell'“Amen” (plagale).",
    artErklAuth: "V-I - la conclusione forte e perfetta.",
    funktionFrage: "Che funzione ha questo accordo in do maggiore?",
    funktionWahl: ["Tonica (accordo I)", "Sottodominante (accordo IV)", "Dominante (accordo V)"],
    funktionErkl: [
      "Tonica (T) - l'accordo di casa, accordo I.",
      "Sottodominante (S) - accordo IV.",
      "Dominante (D) - accordo V.",
    ],
  },

  komponier: {
    frage:
      "Laboratorio di composizione: scrivi liberamente con f d s j k l, ascolta il tuo brano e salvalo (fino a 5). Il laboratorio conta come visitato appena hai salvato un brano.",
  },

  // --- Mondo 8 "Strumenti" ---------------------------------------------------
  fingersatz: {
    lesenFrage: "Leggi la nota e la diteggiatura: quale dito deve suonare la nota? (La diteggiatura sta DOPO la nota.)",
    lesenErkl: (finger: string): string => `La piccola cifra dopo la nota indica: ${finger}.`,
    schreibenFrage: (ton: string, finger: string): string =>
      `Scrivi la nota ${ton} e aggiungi la diteggiatura (${finger}) - sta DOPO la nota.`,
    fingerZelle: (finger: string): string => `${finger} - la diteggiatura`,
    schreibenErkl: (finger: string): string => `Per questo dito (${finger}) la cifra sta subito dopo la nota.`,
    positionFrage: "Dove va la diteggiatura - prima o dopo la nota?",
    positionWahl: ["Dopo la nota", "Prima della nota"],
    positionErkl: "A differenza del segno d'articolazione, la diteggiatura sta DOPO la nota (prima di una legatura, se c'è).",
  },

  klavier: {
    zweiFrage:
      "Due righe - in alto la mano destra (chiave di violino), in basso la mano sinistra (chiave di basso). Quante note suona la mano SINISTRA? Con Alt + Q vedi e senti una mano da sola, in grande.",
    zweiWahl: (n: number): string => `${n} note`,
    zweiErkl: "Conta le teste delle note sulla riga inferiore - oppure ascolta da sola la mano bassa (Alt + Q).",
    handFrage: "Questa riga comincia con un segno di mano. Per quale mano è?",
    handWahl: ["Mano destra", "Mano sinistra"],
    handErklLinks: "Punti 4, 5, 6 e poi 3, 4, 5: il segno della mano sinistra.",
    handErklRechts: "Punti 4, 6 e poi 3, 4, 5: il segno della mano destra.",
    melodieFrage:
      "Due mani una dopo l'altra: una suona la melodia (più acuta, in movimento), l'altra accompagna in basso. Quale suonava la melodia?",
    melodieWahl: ["La parte suonata per prima", "La seconda parte"],
    melodieErkl: "La melodia è la parte più acuta che si muove - di solito la mano destra.",
    rechteHandFrage: (ton: string): string =>
      `Scrivi il segno della mano destra (punti 4, 6 poi 3, 4, 5) e dopo di esso la nota ${ton} con il suo segno d'ottava.`,
    rechteHandZellen: ["mano destra, prima cella - punti 4, 6", "mano destra, seconda cella - punti 3, 4, 5"],
    rechteHandErkl: "Dopo il segno di mano la parte comincia con un segno d'ottava.",
    pedalFrage: "Che segno di pedale è questo - e sta prima o dopo la nota?",
    pedalWahl: ["Pedale giù - PRIMA della nota", "Pedale su - DOPO la nota"],
    pedalErklNieder: "Pedale giù (punti 1, 2, 6 poi 1, 4) sta prima della nota in cui si preme il pedale.",
    pedalErklAuf: "Pedale su (punti 1, 6 poi 1, 4) sta dopo la nota in cui si lascia il pedale.",
  },

  gesang: {
    melismaFrage: "Sulla sillaba “la” - quante note canta la voce? (Più note su una sillaba si chiamano vocalizzo o melisma.)",
    melismaWahl: ["Una nota", "Due note", "Tre note"],
    melismaErkl: (n: number): string =>
      `La sillaba riceve ${n} note - un melisma. In braille la legatura di sillaba (punti 1, 4) le unisce.`,
    bogenFrage:
      "Una sillaba su due note: scrivi la prima nota, la legatura di sillaba (punti 1, 4) e la seconda nota.",
    bogenZelle: "legatura di sillaba - punti 1, 4",
    bogenErkl: "La legatura di sillaba dice: entrambe le note appartengono a una sillaba.",
    atemFrage: "Questa riga ha un segno di respiro. Dopo quale nota prendi fiato?",
    atemWahl: ["Dopo la prima nota", "Dopo la seconda nota", "Dopo la terza nota"],
    atemErkl: "Il segno di mezzo respiro (punti 3, 4, 5 poi 2) sta subito dopo la prima nota.",
    zeilenFrage: "Nella musica vocale si alternano righe di parole e righe di musica. Quale prefisso annuncia una riga di PAROLE?",
    zeilenWahl: ["Prefisso delle parole (punti 5, 6 poi 2, 3)", "Prefisso della musica (punto 6 poi 3)"],
    zeilenErkl: "La riga di parole ha il prefisso punti 5, 6 poi 2, 3; la riga di musica ha il punto 6 poi il punto 3.",
  },

  gitarre: {
    saiteFrage:
      "Il segno di corda (punti 1, 4, 6) e un numero ti dicono quale corda suonare. Che corda è questa?",
    saiteWahl: (s: number): string => `Corda ${s}`,
    saiteErkl: (s: number): string => `Segno di corda più il numero ${s}: corda ${s}.`,
    schreibenFrage: (saite: number, ton: string): string =>
      `Scrivi il segno per la corda ${saite} e poi la nota ${ton}: prima il segno di corda (punti 1, 4, 6), poi il numero, poi la nota.`,
    saitenzeichenZelle: "segno di corda - punti 1, 4, 6",
    ziffernZelle: (saite: number): string => `il numero ${saite} - corda ${saite}`,
    schreibenErkl: "Il segno di corda sta prima della nota; NESSUN segno d'ottava lo segue.",
    akkordSorten: { dur: "accordo maggiore", moll: "accordo minore", sept: "accordo di settima di dominante (7 corsivo)" },
    akkordFrage:
      "Ascolta l'accordo arpeggiato - di che tipo è? (Il cerchietto, il triangolo e il 7 corsivo sono internazionali; le sigle con lettere come “C7” si scrivono in modo un po' diverso in ogni paese.)",
    akkordErkl: (sorte: string): string => `Era un ${sorte}.`,
  },

  generalbass: {
    aussetzungFrage:
      "La nota di basso ha una cifra 6. Quale realizzazione suona giusta - con una sesta o con una quinta sopra il basso?",
    aussetzungWahl: ["Terza e sesta sopra il basso", "Terza e quinta sopra il basso"],
    aussetzungErklSext: "Un 6 chiede la sesta sopra il basso - l'accordo in primo rivolto.",
    aussetzungErklQuint: "Senza cifre (o con 5/3) suona l'accordo in stato fondamentale, con la quinta.",
    stufeFrage: "Il basso numerato ragiona per accordi costruiti sui gradi della scala. Quale accordo principale senti qui?",
    stufeWahl: ["Tonica (accordo I)", "Sottodominante (accordo IV)", "Dominante (accordo V)"],
    stufeErkl: [
      "Era la tonica (accordo I) - il ponte dalle cadenze al basso numerato.",
      "Era la sottodominante (accordo IV) - il ponte dalle cadenze al basso numerato.",
      "Era la dominante (accordo V) - il ponte dalle cadenze al basso numerato.",
    ],
    schreibenFrage:
      "Scrivi una nota di basso con le cifre: il do e sotto la cifra 6 (il segno di numero e la cifra bassa 6).",
    zahlzeichenZelle: "segno di numero - punti 3, 4, 5, 6",
    ziffer6Zelle: "la cifra bassa 6 - punti 2, 3, 5",
    schreibenErkl: "I numeri del basso numerato si scrivono come cifre BASSE dopo il segno di numero.",
  },

  partitur: {
    auftakt: {
      frage: "Un brano comincia con un'anacrusi. Che numero ha questa prima battuta incompleta?",
      wahl: ["Battuta 0", "Battuta 1", "Battuta 2"],
      erkl: "L'anacrusi conta come battuta 0 - la prima battuta intera è allora la battuta 1.",
    },
    taktzahl: {
      frage: "Così appare un numero di battuta al margine della riga (qui: 16). Davanti c'è un segno di numero?",
      wahl: ["No - i numeri di battuta non hanno il segno di numero", "Sì - sempre con il segno di numero"],
      erkl: "I numeri di battuta al margine non hanno il segno di numero - solo le cifre.",
    },
    format: {
      frage: "Come dispone una partitura braille due mani o due parti, così da poterle confrontare battuta per battuta?",
      wahl: ["Sezione per sezione, riga sopra riga (battuta su battuta)", "Tutto in un'unica lunga riga"],
      erkl: "Nel formato battuta su battuta le parti stanno una sopra l'altra sezione per sezione - battuta accanto a battuta, facile da leggere.",
    },
    quellen: {
      frage: "Dove si trova musica braille già pronta da leggere?",
      wahl: ["Nelle biblioteche per persone cieche, come dzb lesen o la SBS", "Solo copiandola da sé"],
      erkl: "Biblioteche come dzb lesen (Lipsia) e la SBS (Zurigo) possiedono migliaia di titoli in musica braille.",
    },
  },

  orchester: {
    familieKlavier: "strumento a corde (percosse)",
    familieGitarre: "strumento a corde (pizzicate)",
    familieBlas: "strumento a fiato (soffiato)",
    hoerenFrage: "Ascolta la breve melodia - a quale famiglia di strumenti appartiene questo suono?",
    hoerenWahl: ["Strumenti a corde - pizzicate o percosse", "Strumenti a fiato - soffiati", "Strumenti a pelle - battuti"],
    hoerenErkl: (instrument: string, familie: string): string => `${instrument}: ${familie}.`,
    fragen: [
      { frage: "A quale famiglia appartiene il tamburo (nel sistema Hornbostel-Sachs)?", richtig: "Strumenti a pelle", falsch: ["Strumenti a corde", "Strumenti a fiato"] },
      { frage: "A quale famiglia appartiene il violino?", richtig: "Strumenti a corde", falsch: ["Strumenti a fiato", "Strumenti a pelle"] },
      { frage: "A quale famiglia appartiene il flauto dolce?", richtig: "Strumenti a fiato", falsch: ["Strumenti a pelle", "Strumenti a suono proprio"] },
      { frage: "A quale famiglia appartiene il triangolo?", richtig: "Strumenti a suono proprio", falsch: ["Strumenti a pelle", "Strumenti a corde"] },
    ],
    familieErkl: (richtig: string): string => `Giusto: ${richtig}.`,
  },

  // --- Mondo 9 "Palcoscenico delle canzoni" ---------------------------------
  lieder2: {
    dazuWahl: [
      "È diventato più forte - un crescendo",
      "Le note sono diventate corte - staccato",
      "Le note scorrevano dolcemente l'una nell'altra - legato",
    ],
    dazuDynamikFrage: (titel: string): string => `“${titel}” - prima semplice, poi con espressione. Che cosa è stato aggiunto?`,
    dazuDynamikErkl: "La seconda versione è diventata più forte - un crescendo.",
    dazuStaccatoFrage: (titel: string): string => `“${titel}” - che cosa è stato aggiunto alla versione semplice?`,
    dazuStaccatoErkl: "Le note sono diventate corte e leggere - staccato.",
    dazuLegatoFrage: (titel: string): string => `“${titel}” - che cosa è stato aggiunto?`,
    dazuLegatoErkl: "Le note erano unite dolcemente - legato, la legatura di portamento.",
    articFrage: (titel: string): string => `“${titel}” - suonato ben unito (legato) o corto (staccato)?`,
    articWahl: ["Ben unito - legato", "Corto - staccato"],
    articErklLegato: "Le note scorrevano l'una nell'altra - legato.",
    articErklStaccato: "Ogni nota era tagliata corta - staccato.",
  },

  lesekonzert: {
    frage:
      "Concerto di lettura: leggi la riga braille (NON viene suonata per te!), impara a memoria e premi “Lettura finita”. Poi suona le note a memoria sulla tastiera.",
    erkl: "Leggi, ricorda, suona - è esattamente così che si legge la musica braille a uno strumento.",
  },

  liederquiz: {
    hoerenFrage: "Ascolta l'inizio - quale canzone è?",
    hoerenErkl: (titel: string): string => `Era l'inizio di “${titel}”.`,
    lesenFrage: "Leggi la prima riga in braille - senza suono! Quale canzone riconosci?",
    lesenErkl: (titel: string): string => `Questa riga è l'inizio di “${titel}” - lettura silenziosa con l'orecchio interno.`,
  },

  liedZeile: {
    frage: (titel: string, zeile: number): string =>
      `${titel}, riga ${zeile}: prima ascolta, poi scrivi nota per nota - ora CON i segni d'ottava.`,
  },
};
