/** Bereich `aufgabenA` - Italienisch. */
import type { aufgabenA as De } from "../de/aufgabenA";

export const aufgabenA: typeof De = {
  gemeinsam: {
    taktstrichZelle: "Stanghetta - la barra spaziatrice",
    zahlzeichen: "il segno di numero",
    obereZahl: (n: number): string => `il ${n} (numero alto)`,
    tiefeZahl: (n: number): string => `il ${n} come numero basso`,
    schlagzahl: (b: number): string => String(b),
  },
  hilfe: {
    schreibNote: (ton: string, wert: string): string => `Scrivi: ${ton} - ${wert}.`,
    welcheNote: "Che nota è questa? Ascolta con attenzione e senti la cella.",
    dasWar: (ton: string, wert: string): string => `Era ${ton} - ${wert}.`,
  },
  kp1: {
    zweiHoeher: "Due note. Quale era più acuta?",
    dreiHoechster: "Tre note. Quale era la più acuta?",
    ordinale: ["La prima", "La seconda", "La terza"],
    hoechsterErklaer: (i: number): string => `${["La prima", "La seconda", "La terza"][i]} nota era la più acuta.`,
    leiter: "Una piccola scala. Sale o scende?",
    leiterWahl: ["Sale", "Scende"],
    leiterRauf: "È salita.",
    leiterRunter: "È scesa.",
  },
  kp2: {
    prompt: (len: number): string => `Ascolta il ritmo e ribattilo con la barra spaziatrice - ${len} colpi.`,
  },
  kp3: {
    grundform: " (La forma base è la croma.)",
  },
  kp4: {
    prompt: "Ascolta la melodia e scrivila nota per nota.",
  },
  kp5: {
    viertelHinweis: " (Semiminima = aggiungi il punto 6 - proprio come il punto 3 per le lettere da k a t.)",
    melodie: "Scrivi la melodia - tutte semiminime.",
    frage: "Croma o semiminima?",
    wahl: ["Croma", "Semiminima"],
    erklaerAchtel: "Nessun punto in più in basso: una croma.",
    erklaerViertel: "Con il punto 6 in più: una semiminima.",
  },
  kp6: {
    halbeHinweis: " (Minima = aggiungi il punto 3.)",
    ganzeHinweis: " (Semibreve = aggiungi i punti 3 e 6.)",
    frage: "Che durata è questa?",
    erklaer: (wert: string): string => `Era una ${wert}.`,
  },
  kp7: {
    schreibPause: (pause: string): string => `Scrivi: ${pause}.`,
    taktart: "Che indicazione di tempo è questa?",
    taktartErklaer: (a: number, b: number): string =>
      `Era il tempo ${a}/${b}: segno di numero, ${a} in alto, ${b} sotto come numero basso.`,
    taktstrich: (ton1: string, ton2: string): string =>
      `Scrivi: ${ton1} minima, stanghetta (barra spaziatrice), ${ton2} minima.`,
    taktstrichErklaer: "In braille la stanghetta è uno spazio.",
  },
  kp8: {
    prompt: (ton: string, wert: string): string =>
      `Scrivi: ${ton} - ${wert} puntata. (Il punto che allunga la nota è il punto 3 in una cella TUTTA SUA.)`,
    punktZelle: "il punto che allunga la nota - punto 3",
  },
  kp9: {
    prompt: (vorzeichen: string, ton: string): string =>
      `Scrivi: ${vorzeichen}, poi ${ton} come semiminima. (L'alterazione sta subito PRIMA della nota.)`,
  },
  kp10: {
    lage: "In quale ottava suona?",
    lageWahl: ["Grave (terza ottava)", "Centrale (quarta ottava)", "Acuta (quinta ottava)"],
    lageErklaer: (oktave: string): string => `Era la ${oktave}.`,
    schreib: (ton: string, oktave: string): string =>
      `Scrivi ${ton} nella ${oktave} come PRIMA nota di un brano, una semiminima. (Prima il segno d'ottava, poi la nota.)`,
    zeichenZelle: (oktave: string): string => `il segno d'ottava per la ${oktave}`,
  },
  kp11: {
    gleich: "la stessa nota",
    sekundeTerz: "una seconda o una terza",
    quarteQuinte: "una quarta o una quinta",
    sexteMehr: "una sesta o più",
    regelKlein: "Una seconda o una terza NON ha MAI bisogno del segno d'ottava.",
    regelMittel: "Una quarta o una quinta ha bisogno del segno SOLO quando cambia l'ottava.",
    regelGross: "Dalla sesta in su la nota ha SEMPRE bisogno del segno d'ottava.",
    prompt: (ton1: string, oktave1: string, ton2: string, oktave2: string): string =>
      `Prima nota: ${ton1}, ${oktave1}. Poi: ${ton2}, ${oktave2}. La seconda nota ha bisogno del segno d'ottava?`,
    wahl: ["Sì", "No"],
    erklaer: (sprung: string, regel: string): string => `Il salto è ${sprung}. ${regel}`,
  },
  kp12: {
    grossPrompt: "Nel tempo di 4/4 UNA sola cella riempie l'intera battuta. Semibreve o semicroma?",
    grossWahl: ["Una semibreve", "Una semicroma"],
    grossErklaer:
      "Una cella sola che deve riempire quattro tempi è la nota LUNGA: la semibreve. Una semicroma sarebbe troppo breve.",
    kleinPrompt: "Nel tempo di 2/4 stanno in fila OTTO celle uguali. Semibrevi o semicrome?",
    kleinWahl: ["Semibrevi", "Semicrome"],
    kleinErklaer:
      "Otto semibrevi non entrerebbero mai in due tempi - devono essere le note BREVI: semicrome. Decidono l'indicazione di tempo e il contesto.",
  },
  kp13: {
    similePrompt: "Scrivi il segno braille di ripetizione di battuta (suona di nuovo tutta la battuta).",
    simileZelle: "il segno di ripetizione di battuta - punti 2, 3, 5, 6",
    simileErklaer: "Questa scorciatoia esiste solo in braille - più furba della stampa!",
    startPrompt: "Scrivi: INIZIO del ritornello (due celle).",
    startZellen: ["prima cella - punti 1, 2, 6", "seconda cella - punti 2, 3, 5, 6"],
    endePrompt: "Scrivi: FINE del ritornello (due celle).",
    endeZellen: ["prima cella - punti 1, 2, 6", "seconda cella - punti 2, 3"],
    schluss: "La doppia stanghetta finale (fine del brano)",
    anfang: "Inizio del ritornello",
    ende: "Fine del ritornello",
    erkennenPrompt: "Che segno di forma è questo?",
    erkannt: (zeichen: string): string => `Era: ${zeichen}.`,
  },
  haltebogen: {
    hoerenPrompt: "Due minime sulla stessa nota. Suonate una volta o due?",
    hoerenWahl: ["Una volta - legate", "Due volte - separate"],
    hoerenGebunden: "Un solo attacco: la legatura di valore unisce le due note in UNA sola nota lunga.",
    hoerenGetrennt: "Due attacchi: qui non c'era legatura - ogni nota riparte.",
    schreibPrompt: (ton: string): string =>
      `Scrivi: ${ton} minima, legatura di valore (due celle: punto 4, poi punti 1 e 4), poi ancora ${ton} minima.`,
    zelle1: "legatura di valore, prima cella - punto 4",
    zelle2: "legatura di valore, seconda cella - punti 1, 4",
    klingtWeiter: (note: string): string => `${note} - continua a suonare, senza un nuovo attacco`,
    schreibErklaer: "La legatura di valore sta subito DOPO la prima nota.",
    taktPrompt: (ton: string): string =>
      `Legatura oltre la stanghetta: ${ton} minima, legatura di valore, stanghetta (barra spaziatrice), ${ton} minima.`,
    taktErklaer: "Così una nota continua a suonare oltre la stanghetta.",
  },
  auftakt: {
    vollPrompt: (a: number, b: number): string =>
      `Tempo ${a}/${b}. Ascolta la battuta e conta con me: è completa?`,
    vollWahl: ["Completa", "Incompleta - un'anacrusi o una battuta parziale"],
    vollJa: (ziel: string): string => `Torna esattamente: ${ziel} tempi.`,
    vollNein: (summe: string, ziel: string): string =>
      `Manca qualcosa: solo ${summe} tempi su ${ziel} - una battuta parziale. All'inizio di un brano si chiama anacrusi.`,
    bindestrichPrompt: "La battuta non è finita alla fine della riga. Scrivi il trattino musicale (punto 5).",
    bindestrichZelle: "il trattino musicale - punto 5",
    bindestrichErklaer: "Il punto 5 alla fine di una riga dice: questa battuta continua nella riga successiva.",
    schreibPrompt: (ton: string): string =>
      `Scrivi l'anacrusi: ${ton} semiminima, stanghetta (barra spaziatrice), poi la battuta intera.`,
    auftaktZelle: (note: string): string => `${note} - l'anacrusi`,
    schreibErklaer: "Un'anacrusi è una prima battuta incompleta - si scrive come ogni altra.",
  },
  pausen2: {
    vielePrompt: (n: number): string => `Scrivi: ${n} battute di pausa - segno di numero, il ${n}, poi la pausa di semibreve.`,
    zahlzeichenZelle: "il segno di numero - punti 3, 4, 5, 6",
    zahlZelle: (n: number): string => `il numero ${n}`,
    ganzePauseZelle: "la pausa di semibreve - punti 1, 3, 4",
    vieleErklaer: "Da quattro battute vuote in poi il braille scrive il conteggio come numero davanti alla pausa di semibreve.",
    kleinPrompt: (n: number): string =>
      `Scrivi: ${n} battute vuote - fino a tre battute, scrivi semplicemente la pausa di semibreve ${n === 2 ? "due volte" : "tre volte"}.`,
    kleinZelle: (i: number): string => `pausa di semibreve ${i} - un'intera battuta vuota`,
    kleinErklaer: "La pausa di semibreve riempie SEMPRE un'intera battuta - qualunque sia l'indicazione di tempo.",
    lesenPrompt: "Quante battute di silenzio ci sono?",
    takte: (n: number): string => `${n} battute`,
    lesenKlein: (n: number): string => `${n} pause di semibreve di fila = ${n} battute vuote.`,
    lesenGross: (n: number): string => `Segno di numero + ${n} + pausa di semibreve = ${n} battute di silenzio in una volta.`,
    stillePrompt: "Tre battute - una di esse è completamente muta. Dov'è?",
    stilleWahl: ["All'inizio", "In mezzo", "Alla fine"],
    stilleErklaer: (i: number): string =>
      `Il silenzio era ${["all'inizio", "in mezzo", "alla fine"][i]} - un'intera battuta di pausa.`,
  },
  tonart: {
    keyNames: {
      kreuz: ["sol maggiore", "re maggiore", "la maggiore", "mi maggiore"],
      be: ["fa maggiore", "si bemolle maggiore", "mi bemolle maggiore", "la bemolle maggiore"],
    },
    kreuz: "diesis",
    be: "bemolle",
    kreuze: "diesis",
    bes: "bemolli",
    lesenPrompt: (mehrzahl: string): string =>
      `Questa armatura di chiave sta all'inizio del brano. Quanti ${mehrzahl} ci sono?`,
    lesenErklaer: (n: number, name: string, tonart: string, ab4: boolean): string =>
      `${n} ${name} - l'armatura di chiave di ${tonart}. ${
        ab4 ? "Da quattro in poi il numero sta davanti." : "Fino a tre il segno si ripete semplicemente."
      }`,
    schreibKlein: (n: number, name: string, zeichen: string): string =>
      `Scrivi l'armatura di chiave: ${n} ${name} - scrivi il segno ${zeichen} ${n === 1 ? "una volta" : n === 2 ? "due volte" : "tre volte"}.`,
    schreibGross: (n: number, mehrzahl: string, zeichen: string): string =>
      `Scrivi l'armatura di chiave: ${n} ${mehrzahl} - da quattro in poi con un segno di numero: segno di numero, il ${n}, poi il segno ${zeichen}.`,
    zeichenZelle: (name: string, i: number, punkte: string): string => `${name} ${i} - punti ${punkte}`,
    zahlzeichenZelle: "il segno di numero - punti 3, 4, 5, 6",
    zahlZelle: (n: number): string => `il numero ${n}`,
    dasZeichen: (name: string): string => `il segno di ${name}`,
    istVorzeichnung: (tonart: string): string => `Questa è l'armatura di chiave di ${tonart}.`,
    kopfPrompt: (n: number, name: string, a: number, b: number): string =>
      `Scrivi l'intestazione di un brano: prima l'armatura di chiave (${n} ${name}), subito dopo l'indicazione di tempo ${a}/${b} - senza spazio in mezzo.`,
    kopfZelle: (name: string, i: number): string => `${name} ${i}`,
    kopfErklaer: "Armatura di chiave e indicazione di tempo stanno insieme all'inizio di un brano - prima l'armatura, poi l'indicazione di tempo.",
    regelPrompt: "L'armatura di chiave all'inizio di un brano - quanto dura?",
    regelWahl: ["Per tutto il brano", "Solo per la prima battuta", "Solo per la prima nota"],
    regelErklaer:
      "L'armatura di chiave vale per tutto il brano - un'alterazione a metà battuta, invece, vale solo fino alla stanghetta.",
  },
  taktwechsel: {
    sonderPrompt: "Che indicazione di tempo è questa?",
    sonderWahl: ["C - tempo comune (quattro tempi di semiminima)", "Alla breve - tempo tagliato (due tempi di minima)", "Tempo di 3/4"],
    sonderErklaerC: "I punti 4, 6 davanti al c: il C del tempo comune.",
    sonderErklaerAb: "I punti 4, 5, 6 davanti al c: alla breve - le minime portano la pulsazione.",
    sonderSchreibenC: "Scrivi il segno del tempo C: punti 4 e 6, poi il c (punti 1, 4).",
    sonderSchreibenAb: "Scrivi l'alla breve: punti 4, 5 e 6, poi il c (punti 1, 4).",
    vorzeichenC: "il segno - punti 4, 6",
    vorzeichenAb: "il segno - punti 4, 5, 6",
    dasC: "il c - punti 1, 4",
    wechselPrompt: "Dopo alcune note compare una SECONDA indicazione di tempo. Che cosa significa?",
    wechselWahl: (a: number, b: number): string[] => [
      `L'indicazione di tempo cambia in ${a}/${b}`,
      "La tonalità cambia",
      "Il brano è finito",
    ],
    wechselErklaer: (a: number, b: number): string =>
      `Una nuova indicazione di tempo a metà brano significa: da qui in poi vale il tempo di ${a}/${b}.`,
    wechselSchreiben: (a: number, b: number): string =>
      `L'indicazione di tempo cambia a metà brano: scrivi una stanghetta (barra spaziatrice), poi la nuova indicazione di tempo ${a}/${b}.`,
  },
  schluessel: {
    lesenPrompt: "Che chiave è questa (tre celle)?",
    lesenErklaer: (schluessel: string): string =>
      `Era la ${schluessel}. Tutte le chiavi iniziano con i punti 3, 4, 5 e finiscono con i punti 1, 2, 3 - la cella di mezzo le distingue.`,
    mitteViolin: "punti 3, 4",
    mitteBass: "punti 3, 4, 5, 6",
    schreibPrompt: (schluessel: string, mitte: string): string =>
      `Scrivi la ${schluessel} - tre celle: punti 3, 4, 5 · ${mitte} · punti 1, 2, 3.`,
    ankuendigung: "l'apertura della chiave - punti 3, 4, 5",
    gZeichen: "il segno del sol - punti 3, 4",
    fZeichen: "il segno del fa - punti 3, 4, 5, 6",
    abschluss: "la chiusura - punti 1, 2, 3",
    wissenPrompt: "La musica braille ha bisogno delle chiavi per capire l'altezza?",
    wissenWahl: ["No - i segni d'ottava dicono l'ottava", "Sì - senza chiave non funziona niente"],
    wissenErklaer:
      "In braille i segni di chiave danno solo un'informazione sulla pagina stampata - l'ottava è sempre fissata dai segni d'ottava.",
  },
  sechzehntel: {
    hoerenPrompt: "Una piccola corsa. Crome - oppure le semicrome, due volte più veloci?",
    hoerenWahl: ["Crome", "Semicrome"],
    hoerenSchnell: "Erano semicrome - quattro per ogni tempo.",
    hoerenLangsam: "Erano crome - due per ogni tempo.",
    gruppePrompt:
      "Scrivi il gruppo di quattro semicrome: solo la PRIMA nota riceve i punti 3 e 6, e le altre tre le scrivi come crome (raggruppamento).",
    ersteZelle: (ton: string): string => `${ton} come semicroma - con i punti 3 e 6`,
    andereZelle: (ton: string): string => `${ton} - scritta come una croma (appartiene al gruppo)`,
    gruppeErklaer: "Il raggruppamento rende facili da leggere le corse veloci: i punti di durata vanno solo sulla prima nota del gruppo.",
    regelPrompt:
      "Quattro semicrome in un tempo, scritte come gruppo: quante celle portano i punti di durata 3 e 6?",
    regelWahl: ["Solo la prima", "Tutte e quattro", "La prima e l'ultima"],
    regelErklaer:
      "Solo la prima nota del gruppo mostra la durata - le altre sembrano crome. È l'equivalente braille del gruppo con la barra di unione in stampa.",
    einzelnPrompt: (ton: string): string =>
      `Scrivi: ${ton} come semicroma. (Attenzione - è la stessa cella della semibreve; decide l'indicazione di tempo!)`,
  },
  triolen: {
    hoerenPrompt: "Tra due pulsazioni regolari: quante note si dividono UN tempo - due o tre?",
    hoerenWahl: ["Due - crome normali", "Tre - una terzina"],
    hoerenTriole: "Tre note di uguale durata in un tempo: una terzina.",
    hoerenZwei: "Due crome - la divisione normale.",
    schreibPrompt: "Scrivi la terzina: prima il segno di terzina (punti 2, 3), poi le tre crome.",
    triolenZeichen: "il segno di terzina - punti 2, 3",
    achtelZelle: (ton: string): string => `${ton}, croma - un terzo del tempo`,
    schreibErklaer: "Il segno di terzina sta UNA volta davanti al gruppo - trasforma due crome in tre.",
    lesenPrompt: "Davanti a tre crome c'è questa prima cella (punti 2, 3). Che cosa significa?",
    lesenWahl: ["Una terzina - tre note in un tempo", "Una pausa di croma", "Un segno d'ottava"],
    lesenErklaer: "I punti 2, 3 davanti a un gruppo di note = terzina.",
  },
  puls: {
    klopfPrompt: (n: number): string =>
      `Senti la pulsazione regolare e battila con uguaglianza sulla barra spaziatrice - ${n} colpi.`,
    metrumPrompt: "Ascolta i tempi forti: è una marcia a due o un valzer a tre?",
    metrumWahl: ["Marcia - a due", "Valzer - a tre"],
    metrumDrei: "Il primo di ogni tre tempi è accentato: un tre - il passo del valzer.",
    metrumZwei: "Il primo di ogni due tempi è accentato: un due - il passo della marcia.",
    abstandPrompt: "Conta i tempi da un accento al successivo: quanti sono?",
    abstandWahl: ["2 tempi", "3 tempi", "4 tempi"],
    abstandErklaer: (n: number): string => `Da un accento all'altro ci sono ${n} tempi - tempo di ${n}/4.`,
  },
  dauer: {
    vergleichPrompt: "Due note, una dopo l'altra. Quale è durata di più?",
    vergleichWahl: ["La prima", "La seconda"],
    vergleichErster: "La prima era una minima - lunga il doppio della semiminima che la segue.",
    vergleichZweiter: "La seconda era una minima - lunga il doppio della semiminima che la precede.",
    schlaegePrompt: "Prima due pulsazioni, poi una nota lunga: quanti tempi è durata?",
    schlaegeWahl: ["1 tempo - una semiminima", "2 tempi - una minima", "4 tempi - una semibreve"],
    schlaegeErklaer: (wert: string, zahl: number): string =>
      `Era una ${wert} - lunga ${zahl} ${zahl === 1 ? "tempo" : "tempi"}.`,
    paarPrompt: "Due note: della stessa durata - o la seconda lunga il doppio?",
    paarWahl: ["Della stessa durata", "La seconda lunga il doppio"],
    paarGleich: "Due semiminime della stessa durata.",
    paarDoppelt: "Prima una semiminima, poi una minima - lunga il doppio.",
  },
  dynamik: {
    lautPrompt: "Ascolta la piccola frase: suonata forte o piano?",
    lautWahl: ["Forte", "Piano"],
    lautErklaer: "Suonata con forza - più avanti la chiamerai forte.",
    leiseErklaer: "Suonata con delicatezza - più avanti la chiamerai piano.",
    rampePrompt: "La frase diventa più forte o più piano?",
    rampeWahl: ["Più forte", "Più piano"],
    cresc: "Da piano a forte - più avanti si chiama crescendo.",
    decresc: "Da forte a piano - più avanti si chiama diminuendo.",
    akzentPrompt: "Una nota è accentata in modo particolare. Dov'era?",
    akzentWahl: ["All'inizio", "In mezzo", "Alla fine"],
    akzentErklaer: (i: number): string =>
      `La nota accentata era ${["all'inizio", "in mezzo", "alla fine"][i]}.`,
  },
  inst: {
    merk: {
      klavier: "Pianoforte - percosso, un attacco chiaro che continua a risuonare.",
      gitarre: "Chitarra - pizzicata, secca e di corde.",
      sax: "Sassofono - soffiato, morbido e ad ancia.",
      floete: "Flauto - soffiato, dolce e limpido.",
    },
    hoerenPrompt: "Quale strumento sta suonando qui?",
    vergleichPrompt: "Due piccole melodie, una dopo l'altra: lo stesso strumento o strumenti diversi?",
    vergleichWahl: ["Lo stesso strumento", "Strumenti diversi"],
    vergleichGleich: "Entrambe le melodie venivano dallo stesso strumento.",
    vergleichErklaer: (a: string, b: string): string => `Prima ${a}, poi ${b}.`,
    zuerstPrompt: "Due strumenti, uno dopo l'altro. Quale ha suonato per primo?",
    zuerstErklaer: (a: string): string => `Per primo è venuto: ${a}.`,
  },
  echo: {
    prompt: (len: number): string =>
      `Gioco dell'eco: ascolta le ${len} note e riproducile sulla tastiera - i tasti D F G H J K L sono le note do re mi fa sol la si. Conta solo l'ordine delle note; il ritmo è libero.`,
    erklaer: "Riproduci le note nell'ordine in cui le hai sentite.",
  },
  memory: {
    prompt:
      "Memoria di melodie: io suono una successione di note e tu la riproduci (i tasti D F G H J K L sono le note do re mi fa sol la si). Se ci riesci, si aggiunge una nota - fin dove arrivi?",
  },
};
