/** Bereich `runner` - Italienisch. */
import type { runner as De } from "../de/runner";

export const runner: typeof De = {
  kopf: {
    anhoeren: "Ascolta",
    stopp: "Stop",
    anhoerenTitel: "Ascolta l'esercizio (Alt + W lo legge anche a voce alta)",
    instrument: "Strumento",
    namenKnopf: "do-re-mi",
    namenTitel: (a: string, b: string): string => `Nomi delle note come ${a} (do fisso) invece di ${b}`,
    rhythmusKnopf: "ta ti-ti",
    rhythmusTitel: "Parole del ritmo: dopo le durate dice anche ta, ti-ti",
    anderesLied: "Un'altra canzone",
    namenAn: (a: string, b: string, c: string): string => `Nomi delle note: ${a}, ${b}, ${c}.`,
    rhythmusAn: "Parole del ritmo attive: ta, ti-ti.",
    rhythmusAus: "Parole del ritmo disattivate.",
    zurueckLiedauswahl: "Torna alla scelta della canzone.",
  },

  aufgabe: {
    liesBrailleZeile: "Leggi la riga braille.",
    handNurKlavier: "Il cambio di mano funziona solo nel capitolo di pianoforte con due pentagrammi.",
    weiter: (prompt: string): string => `Avanti. ${prompt}`,
    zeichenlisteHinweis: "Trovi tutti i segni musicali di questo capitolo nell'elenco dei segni: Alt e L.",
    songGanzGeschafft: (titel: string): string => `${titel} - tutto fatto!`,
    songZeile: (zeile: number, von: number): string => ` · Riga ${zeile} di ${von}`,
  },

  geschafft: {
    geschafft: "Fatto!",
    mitSternen: (n: number): string => `Fatto! ${n} stelle su 3.`,
    alsNaechstesAnsage: (titel: string): string => ` Prossimo: ${titel}.`,
    alsNaechstesKarte: (titel: string): string => `Prossimo: ${titel}`,
    weiterUeben: "Continua a esercitarti",
    weiter: "Avanti",
  },
  fortschritt: {
    caption: "Allenamento",
    aria: (n: number, min: number, prozent: number): string =>
      `Progresso del capitolo: ${n} esercizi su almeno ${min}, ${prozent} per cento completato.`,
    rundeGeschafft: "Giro completato - il capitolo è sicuro.",
    runde: (n: number, min: number, noch: number): string =>
      `Giro: ${n} esercizi su almeno ${min} fatti` +
      (noch > 0 ? `, ne mancano almeno ${noch}.` : ", il capitolo è quasi sicuro."),
  },

  lieder: {
    kinder: "🧒 Canzoni per bambini",
    erwachsene: "🎼 Classici e sempreverdi",
  },

  hand: {
    hinweis: (f: "both" | "rh" | "lh"): string =>
      " - vedi e ascolta una mano da sola, in grande (" +
      (f === "rh"
        ? "ora: solo la mano destra"
        : f === "lh"
          ? "ora: solo la mano sinistra"
          : "ora: entrambe le mani") +
      ")",
  },

  wahl: {
    richtig: "Giusto!",
    richtigWaere: (antwort: string): string => `La risposta giusta è: ${antwort}.`,
    antworten: "Risposte (puoi anche premere i tasti numerici da 1 a 4)",
  },

  tap: {
    aria: (n: number): string => `Batti il ritmo: barra spaziatrice. Finora ${n} colpi.`,
    vor: "Batti qui con la ",
    stark: "barra spaziatrice",
    nach: (n: number, von: number): string => ` - ${n} colpi su ${von}`,
    knopf: (n: number, von: number): string => `Batti (${n} su ${von})`,
    puls: "Non ancora regolare - senti la pulsazione e mantienila calma.",
    kurz: "corto",
    lang: "lungo",
    fast: (muster: string): string => `Quasi! Il modello era: ${muster}. Ascolta ancora una volta.`,
    genauImPuls: "Esattamente a tempo con la pulsazione!",
    genauImTakt: "Esattamente a tempo!",
  },

  spielen: {
    ariaKlaviatur: (namen: string): string =>
      `Tastiera per rifare la melodia: D F G H J K L sono ${namen}. Le frecce su e giù cambiano ottava. `,
    ariaFrei: (n: number, von: number): string => `Suona liberamente sul bordone - ${n} note su ${von}. `,
    ariaMemory: (laenge: number): string => `Lunghezza attuale ${laenge} note. `,
    ariaTon: (i: number, von: number): string => `Nota ${i} di ${von}. `,
    ariaLesen:
      "Concerto di lettura: leggi la riga braille. Premi Invio o ‘Lettura finita’ quando ce l'hai in testa.",
    lesenVor: "Leggi la riga in braille - ",
    lesenStark: "non",
    lesenMitte: " verrà suonata. Quando ce l'hai in testa, premi ",
    lesenNach: " o ‘Lettura finita’.",
    fertigGelesen: "Lettura finita",
    nachLesen: "Ora suonala a memoria - D F G H J K L, le frecce cambiano ottava.",
    freiVor: "Suona liberamente con ",
    freiNach: (n: number, von: number): string => ` (pentatonica) - ${n} note su ${von} · sul bordone di quinta`,
    nachspielenVor: "Riproducila con ",
    nachspielenMitte: " - ",
    laenge: (n: number): string => `Lunghezza ${n}`,
    tonVon: (i: number, von: number): string => `Nota ${i} di ${von}`,
    oktaveNach: (oktave: string): string => ` Ottava (${oktave})`,
    oktaveRauf: "Ottava sopra",
    oktaveRunter: "Ottava sotto",
    freiGeschafft: (n: number): string =>
      `Bel suono - ${n} note! Hai visitato il laboratorio. Premi ‘Continua a esercitarti’ per continuare a suonare.`,
    falscherTon: (gespielt: string, gesucht: string): string => `Era ${gespielt} - serve ${gesucht}.`,
    nichtsMehr: "nient'altro",
    memoryWeiter: (n: number): string => `Fatto - ${n} note! Ne arriva ancora una.`,
    memoryEnde: (best: number): string =>
      `Giro finito - hai ripetuto ${best} ${best === 1 ? "nota" : "note"} di fila. Ti suono ancora una volta la sequenza.`,
    genauRichtig: "Esattamente giusto!",
    fertig: "Finito.",
  },

  schreiben: {
    aria: (zelle: number, von: number): string =>
      `Scrittura braille: f d s j k l sono i punti, la barra spaziatrice è la stanghetta. Cella ${zelle} di ${von}. Tieni premuto Maiusc per vedere e sentire i tasti della cella.`,
    nochmalAnhoeren: "Ascolta di nuovo",
    diktat: "Ascolta quante volte vuoi - non conta come errore. Poi scrivi ciò che hai sentito, cella per cella.",
    vor: "Scrivi con ",
    mitte: (zelle: number, von: number): string => ` - cella ${zelle} di ${von} · `,
    umschalt: "⇧ Maiusc",
    nach: " mostra la cella",
    taktstrichTitel: "Stanghetta (barra spaziatrice)",
    gedrueckt: (punkte: string): string => `Tenuto premuto: punti ${punkte}`,
    aktuelleStelleLeertaste: "Punto attuale: la barra spaziatrice - la stanghetta.",
    genauRichtig: "Esattamente giusto!",
    fertig: "Finito.",
  },

  takt: {
    aria: (n: number): string =>
      `Costruttore di battute: scrivi note o pause con f d s j k l; ognuna suona subito. Backspace cancella l'ultima cella, Invio controlla la battuta. Finora ${n} celle.`,
    vor: "Costruisci la battuta con ",
    mitte: " - ogni nota o pausa suona. ",
    loescht: " cancella, ",
    pruefen: (a: number, b: number): string => ` controlla. Indicazione di tempo ${a}/${b}.`,
    nochLeer: "Ancora vuota - al lavoro.",
    taktPruefen: "Controlla la battuta (Invio)",
    loeschen: "Cancella (⌫)",
    pause: "Pausa",
    nominativ: (dativ: string): string => dativ,
    pauseAus: (_notenwort: string, pausenwort: string): string => pausenwort,
    keineZelle: "Questa non è una cella di nota o di pausa. Usa una nota (f d s j k l) o una pausa.",
    alsGelesen: (wert: string): string => ` - letta come ${wert} perché ci sta ancora`,
    zusammen: (label: string, ambi: string, summe: string, ganz: string, einheit: string): string =>
      `${label}${ambi}. Insieme ${summe} su ${ganz} ${einheit}.`,
    letzteGeloescht: (anzahl: string, einheit: string): string => `Ultima cella cancellata. Ora: ${anzahl} ${einheit}.`,
    fehlen: (einzahl: boolean, anzahl: string, einheit: string): string =>
      `${einzahl ? "Manca ancora" : "Mancano ancora"} ${anzahl} ${einheit} prima che la battuta sia piena.`,
    zuViel: (_einzahl: boolean, anzahl: string, einheit: string): string =>
      `Sono ${anzahl} ${einheit} di troppo. Togli qualcosa.`,
    mindestensNoten: (n: number): string => `La battuta è piena, ma servono almeno ${n} note.`,
    mindestensPause: "La battuta è piena - ma serve almeno una pausa.",
    voll: "Battuta piena! Ascoltala.",
    vollSauber: "Esattamente piena - una battuta pulita! Ascoltala.",
  },

  werkstatt: {
    aria: (zellen: number, werke: number): string =>
      `Laboratorio di composizione: scrivi liberamente con f d s j k l, la barra spaziatrice è la stanghetta. Con i pulsanti ascolti, cancelli e salvi. Finora ${zellen} celle, ${werke} brani su 5 salvati.`,
    vor: "Scrivi liberamente con ",
    mitte: " - barra spaziatrice = stanghetta, ",
    nach: " cancella l'ultima cella.",
    leeresBlatt: "Foglio vuoto - inizia pure a comporre.",
    anhoeren: "Ascolta",
    loeschen: "Cancella",
    nameFuerWerk: "Nome del tuo brano",
    speichern: "Salva",
    nochNichtsGeschrieben: "Non hai ancora scritto nulla - scrivi prima qualche nota.",
    geleert: "Laboratorio svuotato.",
    schonFuenf: "Hai già salvato cinque brani. Cancellane uno e poi funziona di nuovo.",
    nochNichtsSpeichern: "Non c'è ancora nulla da salvare.",
    meinWerk: (n: number): string => `Il mio brano ${n}`,
    gespeichert: (name: string, n: number): string => `“${name}” salvato. Ora hai ${n} brani su 5.`,
    gespeicherteListe: (namen: string, n: number): string => `Salvati: ${namen} (${n} su 5)`,
  },

  notenzeile: {
    handFokus: {
      rh: "Solo la mano destra (in alto, chiave di violino)",
      lh: "Solo la mano sinistra (in basso, chiave di basso)",
      both: "Entrambe le mani",
    },
    rechteHand: "Mano destra · chiave di violino",
    linkeHand: "Mano sinistra · chiave di basso",
  },

  touch: {
    gruppe: "Scrittura con il tocco",
    anleitungVor: "Tocca i punti della cella, poi ",
    zelleSetzen: "Inserisci cella",
    anleitungNach: ".",
    punkteGruppe: "I sei punti di una cella",
    punkt: (p: number): string => `Punto ${p}`,
    taktstrich: "Stanghetta",
    pause: "Pausa",
    letzteLoeschen: "Cancella l'ultima cella",
    taktPruefen: "Controlla la battuta",
    bsiTitel: "Scrittura braille su schermo di VoiceOver",
    bsiHinweis:
      "Imposta il rotore su scrittura braille su schermo e digita le celle in questo campo. Scorrere a destra con un dito è la stanghetta, scorrere a sinistra cancella l'ultima cella.",
    testen: "Prova la scrittura braille - che cosa arriva?",
    nochNichts: "Non è stato inserito ancora nulla.",
    verlauf: (text: string, codepoints: string, ergebnis: string): string => `“${text}” (${codepoints}) → ${ergebnis}`,
    keineZelleErkannt: "nessuna cella riconosciuta",
    nochKeinPunkt: "Nessun punto scelto. Tocca prima i punti, poi Inserisci cella.",
    unbekannt: (zeichen: string): string =>
      `Non riesco a leggere il carattere ${zeichen} come punti. Usa i pulsanti dei punti.`,
  },
};
