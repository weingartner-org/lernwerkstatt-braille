/**
 * Punktgenau in italiano - l'interfaccia (Bauplan 2026-11-06 §4, Schritt 3, Italienisch).
 *
 * ★ Dieselben Bereiche und Schlüssel wie `fr.ts` (der Typ `PgTexte` kommt von dort).
 * ★ Anrede: Punktgenau ist für Kinder - „tu", wie Tastenflow auf Italienisch (`typing/curriculumIt.ts`).
 *   Wo die Oberfläche auch Erwachsene anspricht („address" = "sie"), steht „Lei".
 * ★ Schreibregeln: nur „-" (kein „—"), echte Akzente, Person zuerst, keine Maus-Wörter
 *   („premi / scegli / attiva", nie „clicca").
 * ★ Wörter wie die Norm (Codice Braille Italiano 2022): „codice braille a sei punti", „cella", „punti 1-2-4", „tappa".
 * ★ Nicht übersetzt (bleibt deutsch, im Italienisch-Modus nicht erreichbar oder gesondert): Konto,
 *   Klassen, Lehrkraft, Statistik, Challenge, Klassenmatch, Abzeichen-Regal, Wochenaufgabe.
 */
import type { PgTexte } from "./index";

const adresse = (a: "du" | "sie", du: string, sie: string): string => (a === "du" ? du : sie);

const plural = (n: number, eins: string, mehr: string): string => (n > 1 ? mehr : eins);

export const it: PgTexte = {
  /** Kopfzeile der Seite (`PunktgenauPage`). */
  kopf: {
    zeichenliste: "Elenco dei caratteri",
    zeichenlisteTipp: "Elenco di tutti i caratteri di questo ambito (Alt + L)",
    logoBeschreibung:
      "Il logo di Punktgenau: una tessera rosso porpora con gli angoli arrotondati. Dentro, una grande P bianca; nel tratto verticale della P tre punti blu scuro uno sotto l'altro, nella curva un quarto - insieme, i punti braille della lettera p.",
    klangUndVorlesen: "Suono e lettura ad alta voce",
    klangTipp: (alt: string) => `Regolare il suono e la lettura ad alta voce (${alt} attiva o disattiva la lettura)`,
    titelHilfe: "Punktgenau - Aiuto",
    titelKurztasten: "Scorciatoie da tastiera",
    vorlesenAn: "La lettura ad alta voce è attiva.",
    vorlesenAnKurz: "Lettura ad alta voce attiva.",
    vorlesenAus: "La lettura ad alta voce è disattivata.",
    vorlesenAusKurz: "Lettura ad alta voce disattivata.",
    macHinweis: "Alt + tasto - su Mac: tasto Opzione (⌥) + tasto.",
    screenreaderHinweis: (alt: string) =>
      `Hai già un lettore di schermo (NVDA, VoiceOver)? Allora lascia disattivata la lettura ad alta voce (${alt}): il lettore di schermo legge già tutti gli avvisi.`,
  },

  /** Kopfleiste in `Punktgenau.tsx`: Rang, Etappe, Richtung. */
  leiste: {
    rang: "Grado",
    rangAria: (stufe: number, rest: number) => `Grado ${stufe} - mancano ${rest} XP al prossimo.`,
    stufe: "Livello",
    abzeichen: "Distintivi",
    heute: "Oggi",
    heuteGeuebt: (zeit: string) => `Esercitato oggi: ${zeit}.`,
    richtung: "Direzione dell'esercizio",
    schreiben: "Scrivere",
    lesen: "Leggere",
    schrift: "Scrittura:",
    schriftWahl: "Scegliere il sistema braille (ambito)",
    etappeZurueck: "Tappa precedente",
    etappeWeiter: "Tappa successiva",
    etappeWahl: "Scegliere un capitolo (tappa) - scorrere con le frecce su e giù",
    gemeistert: " - superata",
    gesperrt: " - ancora bloccata",
    etappeOption: (nr: number, titel: string, marke: string) => `Tappa ${nr}: ${titel}${marke}`,
    tipp: {
      rang: "Grado - fin dove sei arrivato in tutto. Cresce con i tuoi XP.",
      xp: "XP - 2 per ogni esercizio riuscito, 30 per ogni tappa superata.",
      sterne: "Stelle - fino a 3 per tappa, secondo la sicurezza che hai raggiunto.",
      stufe: "Livello - la difficoltà degli esercizi in questo momento. Si adatta a te, non lo regoli tu.",
      schreiben: "Scrivere - ricevi una parola e la scrivi in braille.",
      lesen: "Leggere - ricevi del braille e scrivi la parola con le lettere normali.",
      schrift: "Scrittura - il sistema braille che stai esercitando. Alt + 1 ti porta direttamente.",
      etappenListe: "Tappa - la parte che stai esercitando. Scorrile con le frecce su e giù.",
      etappeZurueck: "Una tappa indietro",
      etappeWeiter: "Una tappa avanti",
      wochenaufgabe: "Compito della settimana - ciò che il tuo insegnante ti ha chiesto questa settimana e a che punto sei.",
      abzeichen: "Distintivi - le tue medaglie conquistate e i prossimi traguardi.",
      uebezeit: "Tempo esercitato oggi. Conta la scrittura e la lettura dei tuoi esercizi, non l'attesa tra uno e l'altro.",
    },
    bereichAnsage: (label: string, nr: number, von: number, titel?: string) =>
      `${label}, tappa ${nr} di ${von}${titel ? `: ${titel}` : ""}.`,
    neuesAbzeichen: (name: string, beschreibung: string) => `Nuovo distintivo: ${name}. ${beschreibung}`,
    geschafft: (letzte: boolean) => `Punktgenau! +30 XP${letzte ? " · ambito completato!" : " · tappa successiva aperta"}`,
    zeichenlisteAnsage: (auf: boolean): string => (auf ? "Elenco dei caratteri aperto." : "Elenco dei caratteri chiuso."),
    einstellungenAnsage: (auf: boolean): string => (auf ? "Impostazioni aperte." : "Impostazioni chiuse."),
    abzeichenAnsage: (auf: boolean): string => (auf ? "Distintivi aperti." : "Distintivi chiusi."),
    kapitelAuswahlAnsage: "Scelta del capitolo. Con le frecce su e giù scorri le tappe.",
    schreibenAnsage: "Scrivere.",
    lesenAnsage: "Leggere.",
    grossAnsage: (an: boolean): string => (an ? "Segno di maiuscola attivato." : "Segno di maiuscola disattivato."),
  },

  /** Übungsfläche (`BrailleTrainer.tsx`). */
  trainer: {
    rundeWort: "Serie",
    pause: "Pausa - Alt+P per continuare",
    eingabefeld: "Campo di inserimento braille",
    tasten: "Tasti:",
    tastenRegel: "premili tutti insieme, poi rilascia. Quando la cella è giusta, la successiva viene da sola.",
    altW: "Alt e W",
    leertaste: "Spazio",
    leertasteBedeutung: "spazio tra due parole",
    loeschen: "cancellare l'ultima cella",
    meineTasten: "I miei tasti: i caratteri nuovi di questa tappa",
    meineTastenKurz: "I miei tasti:",
    schreibPrompt: (a: "du" | "sie") => adresse(a, "Scrivi in braille:", "Scriva in braille:"),
    schreibHilfe:
      "Premi insieme i tasti f d s e j k l, poi rilascia: ottieni una cella. Quando la cella è giusta, la successiva viene da sola. Spazio per separare le parole, backspace per cancellare. Tieni premuto Maiusc per sentire la cella successiva.",
    aktuelleStelleLeer: "Posizione attuale: spazio - la separazione tra due parole.",
    aktuelleStelleAria: "posizione attuale: premere la barra spaziatrice",
    richtigesZeichenLabel: (punkte: string) => `carattere giusto: ${punkte} - da ripetere`,
    aktuelleZelle: "cella attuale",
    aktuelleZelleKopf: (nr: number, von: number) => `Cella attuale (${nr} di ${von}):`,
    lueckeKlammer: "(spazio)",
    richtigesZeichen: "È il carattere giusto - scrivilo anche tu.",
    geschafftWeiter: "Fatto! Avanti …",
    weiter: "Avanti …",
    lesenAufgabe: "Leggi e scrivi la parola.",
    frage: (a: "du" | "sie") =>
      adresse(a, "Che cosa c'è scritto? Scrivilo con le lettere normali:", "Che cosa c'è scritto? Lo scriva con le lettere normali:"),
    liesPrompt: (a: "du" | "sie") => adresse(a, "Leggi il braille:", "Legga il braille:"),
    vorlageAria: "Modello braille, cella per cella",
    vorlageHinweis: (altW: string) =>
      `Il modello braille è subito sopra il campo di inserimento - leggilo cella per cella. ${altW} lo ripete.`,
    richtigGelesenAria: (frage: string) => `Letto bene. ${frage}`,
    loesung: (a: "du" | "sie") => adresse(a, "La tua soluzione …", "La Sua soluzione …"),
    pruefen: "Controllare",
    richtigGelesen: "Letto bene! Avanti …",
    richtigWaere: "La risposta giusta:",
    richtigWaereAria: (prompt: string) => `La risposta giusta: ${prompt}. Ancora`,
    nochmal: "Ancora",
    runde: (gemeistert: boolean, geschafft: number, gesamt: number, rest: number) =>
      gemeistert
        ? "Serie finita - la tappa è superata."
        : `Serie: ${geschafft} esercizi riusciti su almeno ${gesamt}` +
          (rest > 0 ? `, ne mancano almeno ${rest}.` : ", la tappa sarà presto superata."),
    stufeAria: (n: number, max: number, prozent: number) =>
      `Livello ${n} di ${max} - si adatta alla tua sicurezza. Tappa padroneggiata al ${prozent} per cento.`,
    geschafft: "Fatto - ora lo sai!",
    sterne: (n: number) => `${n} ${plural(n, "stella", "stelle")} su 3`,
    zuverlaessig: (titel: string) => `${titel}: riconosciuto con sicurezza.`,
    naechsteFrei: "La tappa successiva è ora aperta.",
    weiterUeben: "Puoi continuare a esercitarti.",
    geschafftAria1: "Fatto, ora lo sai. Continuare a esercitarsi",
    weiterUebenKnopf: "Continuare a esercitarsi",
    geschafftAria2: "Fatto, ora lo sai. Tappa successiva",
    naechstesLevel: "Tappa successiva →",
    neueZeichen: "Caratteri nuovi di questa tappa",
    doppelpunkt: ":",
    // Texte (ganze Texte)
    textKopf: "Testo",
    textWort: (nr: number, von: number) => `Parola ${nr} di ${von}`,
    textNr: (nr: number, von: number) => `Testo ${nr} di ${von}`,
    geschriebeneZellen: "Celle scritte, cella per cella",
    textHilfe:
      "Premi insieme i tasti dei punti, poi rilascia; tra due parole, la barra spaziatrice. Con il backspace puoi correggere - un errore viene contato comunque.",
    textSchreiben: "Scrivere il testo in braille",
    hierTippen: "Scrivi qui … Premi insieme i tasti dei punti, poi rilascia.",
    textGeschafft: "Testo finito!",
    textErgebnis: (fehler: number, zeit: string, zeichen: number) =>
      `${fehler === 0 ? "Senza errori" : `${fehler} ${plural(fehler, "errore", "errori")}`} · tempo ${zeit} · ${zeichen} caratteri`,
    textErgebnisSatz: (fehler: number) =>
      `Testo finito. ${fehler === 0 ? "Senza errori" : `${fehler} ${plural(fehler, "errore", "errori")}`}.`,
    gleichenText: "Rifare lo stesso testo",
    naechsterTextOhnePfeil: "Testo successivo",
    naechsterText: "Testo successivo →",
    textLesenAufgabe: "Leggi il testo e scrivilo.",
    allesRichtigSatz: "Tutto letto bene.",
    wortSatz: (richtig: number, von: number) => `${richtig} parole giuste su ${von}.`,
    wortSatzKurz: (richtig: number, von: number) => `${richtig} parole giuste su ${von}`,
    textLiesPrompt: (a: "du" | "sie") =>
      adresse(a, "Leggi tutto il testo e scrivilo con le lettere normali:", "Legga tutto il testo e lo scriva con le lettere normali:"),
    textLoesung: (a: "du" | "sie") => adresse(a, "La tua soluzione (testo intero):", "La Sua soluzione (testo intero):"),
    textPlatzhalter: "Scrivi qui il testo letto …",
    allesRichtig: "Tutto letto bene!",
  },

  /** Ansagen (`announce.ts`). */
  announce: {
    lesenAufgabe: "Leggi e scrivi la parola.",
    und: "e",
    richtig: "Giusto.",
    leertaste: "Barra spaziatrice.",
    /** Zusatz hinter den Punkten der Soll-Zelle (Fehler-Tipp). */
    unterschied: (fehlt: number[], zuViel: number[]): string => {
      const pos: Record<number, string> = {
        1: "in alto a sinistra", 2: "al centro a sinistra", 3: "in basso a sinistra",
        4: "in alto a destra", 5: "al centro a destra", 6: "in basso a destra",
        7: "più in basso a sinistra", 8: "più in basso a destra",
      };
      if (fehlt.length === 1 && zuViel.length === 0) return `. Manca il punto ${fehlt[0]} - ${pos[fehlt[0]]}.`;
      if (zuViel.length === 1 && fehlt.length === 0) return `. Il punto ${zuViel[0]} - ${pos[zuViel[0]]} - è di troppo.`;
      const teile: string[] = [];
      if (fehlt.length) teile.push(fehlt.length === 1 ? `manca il punto ${fehlt[0]}` : `mancano i punti ${fehlt.join(", ")}`);
      if (zuViel.length) teile.push(zuViel.length === 1 ? `il punto ${zuViel[0]} è di troppo` : `i punti ${zuViel.join(", ")} sono di troppo`);
      if (!teile.length) return "";
      const satz = teile.join(" e ");
      return `. ${satz.charAt(0).toUpperCase()}${satz.slice(1)}.`;
    },
    stern: (n: number) => `Una stella in più - ${n} su 3.`,
    schneller: "Stai diventando più veloce.",
    freischaltung: (titel: string) => `Bravo! Si apre una porta nuova: ${titel}.`,
    levelDone: (sterne: number, naechster?: string) =>
      `Fatto! ${sterne} ${plural(sterne, "stella", "stelle")} su 3.` + (naechster ? ` Poi: ${naechster}.` : ""),
    textDone: (fehler: number) => (fehler === 0 ? "Testo finito. Senza errori." : `Testo finito. ${fehler} ${plural(fehler, "errore", "errori")}.`),
    cellHint: (tasten: string, punkte: string) => `Cella attuale: ${tasten}. ${punkte}.`,
    pause: "Pausa. Premi Alt e P per continuare.",
    keineNeuenZeichen: "Qui non ci sono caratteri nuovi.",
  },

  /** Hilfe-Fenster (kurz; die deutsche Hilfe erklärt das deutsche System). */
  hilfe: {
    tastaturTitel: "La tastiera come macchina da scrivere braille",
    tastaturText:
      "Sei tasti corrispondono ai sei punti di una cella braille. Se premi più tasti insieme, ottieni un carattere:",
    punkteLinks: "punti 1, 2, 3 (a sinistra)",
    punkteRechts: "punti 4, 5, 6 (a destra)",
    leertasteAlsLuecke: "spazio",
    zeichenErklaerung: [
      { zeichen: "␣", bedeutung: "qui c'è uno spazio - premi la barra spaziatrice." },
      { zeichen: "·", bedeutung: "separa due tasti o due indicazioni che vanno insieme." },
      { zeichen: "⌫", bedeutung: "il backspace - cancella l'ultima cella." },
      { zeichen: "→", bedeutung: "poi, oppure: ecco che cosa risulta." },
    ] as Array<{ zeichen: string; bedeutung: string }>,
    zeichenTitel: "Questi segni compaiono nel testo",
    warumTitel: "A che serve una barra braille?",
    warumText:
      "Il braille è una scrittura tattile: si legge con la punta delle dita, non con gli occhi. Sullo schermo vedi i punti; aiuta a scrivere e a riconoscere le forme. Ma si impara a leggere il braille davvero solo quando si sentono i punti. Una barra braille fa salire piccoli perni sotto ogni cella e il carattere mostrato diventa palpabile. Punktgenau può comandare una barra collegata dove il browser lo permette.",
    bereicheTitel: "Ambito e tappe",
    bereicheText:
      "In alto, l'ambito è «Codice braille a sei punti»: ogni lettera si scrive nella sua cella, senza nessuna abbreviazione. Le tappe si susseguono: ognuna porta caratteri nuovi e apre la successiva solo quando è ben padroneggiata.",
    reihenfolgeTitel: "Perché quest'ordine delle lettere?",
    reihenfolgeText:
      "Le lettere arrivano in ordine di frequenza in italiano (Singh e Galli, 1999): e, a, i, o, n, l, r, t, s, c … Così compaiono presto parole vere. Le maiuscole, la punteggiatura e i numeri vengono dopo; le vocali accentate arrivano alla fine delle lettere. Le parole degli esercizi vengono dai testi di Tastenflow in italiano.",
    normTitel: "Quale norma?",
    normText:
      "I caratteri seguono il Codice Braille Italiano a sei punti (Biblioteca Italiana per i Ciechi «Regina Margherita», 2022). I numeri si scrivono con il segnanumero (punti 3-4-5-6) e le lettere da a a j. In questa versione non ci sono abbreviazioni.",
    kontoTitel: "Account e progressi",
    kontoText: "Senza registrarti, i tuoi progressi restano salvati su questo dispositivo.",
    tastenkombinationen: "Scorciatoie da tastiera",
  },

  /** Tastenkürzel (`ShortcutList`). */
  kurztasten: [
    ["Esc", "Chiude tutto ciò che è aperto - aiuto, scorciatoie, elenco dei caratteri - e il cursore torna sempre nel campo dell'esercizio. Anche se non è aperto nulla, Esc ti riporta all'esercizio"],
    ["Alt + 1", "Ambito «Codice braille a sei punti»"],
    ["Alt + E", "Cursore nel campo dell'esercizio (stessa meta di Esc, senza chiudere nulla)"],
    ["Alt + U", "Andare alla scelta del capitolo - poi scorrere con ↑ ↓"],
    ["Alt + W", "Ripetere l'esercizio"],
    ["Maiusc, due volte di seguito", "Ripetere l'esercizio, come Alt + W"],
    ["Alt + M", "Andare a «I miei tasti» (caratteri nuovi di questa tappa)"],
    ["Alt + Z", "Annunciare la serie: quanti esercizi hai fatto bene e quanti ne mancano - Esc torna nel campo di inserimento"],
    ["Alt + L", "Elenco dei caratteri: aprire / chiudere tutti i caratteri dell'ambito"],
    ["Alt + O", "Impostazioni: aprire / chiudere"],
    ["Alt + P", "Pausa attivata / disattivata - nel Klassenmatch: annuncia tutti i posti"],
    ["Alt + V", "Lettura ad alta voce attivata / disattivata"],
    ["Alt + K", "Colori e contrasto: aprire / chiudere"],
    ["Alt + J", "Il mio account: aprire / chiudere"],
    ["Alt + H", "Aiuto: aprire / chiudere"],
    ["Alt + T", "Elenco delle scorciatoie: aprire / chiudere"],
    ["Alt + +", "Area dell'esercizio più grande"],
    ["Alt + −", "Area dell'esercizio più piccola"],
    ["Alt + 0", "Dimensione normale (ritorno al 100 %)"],
    ["⇧ Maiusc", "Tenuto premuto: mostra e dice i tasti della cella attuale"],
  ] as Array<[string, string]>,

  /** Zeichenliste (`BrailleZeichenliste.tsx`). */
  zeichenliste: {
    leereZelle: "cella vuota",
    ansage: (bereich: string, nr?: number, titel?: string) =>
      `Elenco dei caratteri ${bereich} aperto.` + (titel ? ` Sei alla tappa ${nr}: ${titel}.` : ""),
    titel: (bereich: string) => `Tutti i caratteri - ${bereich}`,
    einfuehrung:
      "L'elenco segue esattamente il tuo percorso: tappa dopo tappa, nell'ordine in cui arrivano i caratteri. Sei alla tappa che stai esercitando adesso.",
    suchen: "Cercare un carattere:",
    platzhalter: "p. es. à, è, o punti come 1, 4",
    keineTreffer: "Nessun risultato.",
    einTreffer: "1 risultato.",
    treffer: (n: number) => `${n} risultati.`,
    etappe: (nr: number, titel: string, aktuell: boolean, fertig: boolean) =>
      `Tappa ${nr}: ${titel}${aktuell ? " - sei qui" : fertig ? " - superata" : ""}`,
    laedt: "Caricamento dei punti …",
    keineEigenen: "Questo ambito non introduce caratteri propri.",
  },

  /** Einstellungen (`PunktgenauEinstellungen.tsx`). */
  einstellungen: {
    titel: "Impostazioni - Punktgenau",
    zurueck: "Tornare all'esercizio",
    grossTitel: "Segno di maiuscola",
    grossHinweis:
      "Prima di ogni maiuscola c'è una cella di avviso (punti 4-6). Puoi disattivarla e riattivarla più tardi.",
    grossAn: "Segno di maiuscola attivato",
    grossAus: "Segno di maiuscola disattivato",
    klasse: (an: boolean) =>
      `Il tuo insegnante lo regola per la classe. Il segno di maiuscola è ora ${an ? "attivato" : "disattivato"}.`,
    klangTitel: "Suono e lettura ad alta voce",
    klangText: (alt: string) =>
      `La lettura ad alta voce, la velocità, la voce, l'aiuto in caso di errore, i suoni e il volume si regolano nel menu sotto l'altoparlante, nell'intestazione. ${alt} attiva o disattiva direttamente la lettura ad alta voce.`,
  },

  /** Meine Verwechslungen (`PunktgenauPage`, `BrailleConfusionPanel.tsx`). Merktipps nur für die Buchstaben;
   *  die deutschen Kurzschrift-Tipps (un/und, ei/ie …) gibt es hier nicht. */
  verwechslungen: {
    knopfZeigen: "▼ Mostra le mie confusioni",
    knopfAusblenden: "▲ Nascondi le mie confusioni",
    laedt: "Caricamento delle confusioni …",
    leerLehrkraft: "Ancora nessuna confusione registrata.",
    leerKind: "Non hai ancora confuso nessun carattere. Bravo!",
    listeName: "Le mie confusioni",
    zeile: (prozent: number, mit: string) => `${prozent} % di errori, confuso con ${mit}.`,
    tipp: "Suggerimento:",
    tabelleName: "Matrice delle confusioni",
    tabelleBeschreibung: "Matrice delle confusioni: carattere atteso, percentuale di errori e confusioni più frequenti",
    spalteSoll: "Carattere atteso",
    spalteQuote: "Percentuale di errori",
    spalteMit: "Confuso con",
    spalteTipp: "Suggerimento",
    merktipps: {
      "d|f": "d e f hanno tutte e due i punti 1 e 4 - d ha in più il punto 5 (a destra), f il punto 2 (a sinistra).",
      "e|i": "e sta in alto (punti 1·5), i sta più in basso (punti 2·4).",
      "r|w": "r sono i punti 1·2·3·5, w i punti 2·4·5·6 - w è quella strana, alla fine di tutto.",
      "m|u": "m sta in alto (punti 1·3·4), u sta in basso (punti 1·3·6).",
      "h|j": "h sono i punti 1·2·5, j i punti 2·4·5 - j scivola verso destra.",
      "n|z": "n sono i punti 1·3·4·5, z i punti 1·3·5·6.",
    },
  },
};
