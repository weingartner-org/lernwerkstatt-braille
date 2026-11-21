/** Bereich `uebersicht` - Italienisch. */
import type { uebersicht as De } from "../de/uebersicht";

export const uebersicht: typeof De = {
  // --- Annunci e messaggi ---------------------------------------------------
  kapitelwahlAnsage: "Elenco dei capitoli. Ogni capitolo si può scegliere liberamente - le stelle mostrano a che punto sei.",
  kapitelAnsage: (nr, welt, i, n, kapitel) => `Mondo sonoro ${nr}, ${welt} - capitolo ${i} di ${n}: ${kapitel}.`,
  kapitelAnsageOhneWelt: (kapitel) => `Capitolo: ${kapitel}.`,
  neuesAbzeichen: (name) => `Nuovo distintivo: ${name}!`,
  neueAbzeichen: (namen) => `Nuovi distintivi: ${namen.join(", ")}!`,
  geschafftMitSternen: (sterne) => `Fatto! +30 XP · ${sterne} stelle su 3 per questo capitolo`,
  geschafft: "Fatto! +30 XP",
  zeichenlisteOffen: "Elenco dei segni aperto.",
  zeichenlisteZu: "Elenco dei segni chiuso.",
  weltInArbeit: (nr, name) => `Il mondo sonoro ${nr}, ${name}, è ancora in costruzione - arriverà con un prossimo aggiornamento.`,
  zeichenAreaLabel: "Klangpunkte",
  zeichenAreaBlurb: "Musica in braille: ascolta, senti, scrivi.",

  // --- Barra superiore ------------------------------------------------------
  rangCaption: "Livello",
  rangLabel: (level, rest) => `Livello ${level} - mancano ${rest} XP al successivo.`,
  xpHinweis: (xp) => `${xp} XP - 2 per ogni risposta giusta, 30 per ogni capitolo.`,
  xpText: (xp) => `${xp} XP`,
  sterneHinweis: (n, max) => `${n} stelle su ${max} - fino a 3 per ogni capitolo.`,
  weltName: (nr, titel) => `Mondo sonoro ${nr}: ${titel}`,
  weltKopf: (nr, titel, i, n) => `Mondo sonoro ${nr}: ${titel} - capitolo ${i} di ${n}`,
  voriges: "Capitolo precedente",
  naechstes: "Capitolo successivo",
  kapitelSelect: "Scegli un capitolo - scorri con le frecce su e giù",
  kapitelOption: (i, titel, sterne) =>
    `Capitolo ${i}: ${titel}${sterne === null ? "" : ` - superato, ${sterne} stelle su 3`}`,
  landkarte: (kapitel, welten) => `${kapitel} capitoli in ${welten} mondi sonori - tutti da scegliere liberamente`,
  kapitelwahlKnopf: "Elenco dei capitoli",
  kapitelwahlTitel: "Tutti i mondi sonori e i capitoli con le tue stelle (Alt + U)",
  zeichenlisteKnopf: "Elenco dei segni",
  zeichenlisteTitel: "Elenco di tutti i segni musicali, nell'ordine in cui li impari (Alt + L)",

  // --- Scelta del capitolo --------------------------------------------------
  kapitelwahlUeberschrift: "Elenco dei capitoli - scegli che cosa vuoi esercitare",
  mixTitel: "Mix del giorno",
  mixText: "Cinque minuti di esercizi misti dei capitoli che hai superato, senza stelle, solo per restare in allenamento.",
  loslegen: "Inizia",
  mixZuWenig: (n) => `Prima supera qualche capitolo (almeno 3), poi arriverà il tuo Mix del giorno. Finora: ${n}.`,
  weltStand: (fertig, n, sterne, max) => `${fertig} capitoli su ${n} superati · ${sterne} stelle su ${max}`,
  kapitelZeile: (i, titel) => `Capitolo ${i}: ${titel}`,
  werkeText: (n) => ` · ${n} brani su 5`,
  besucht: "✓ visitato",
  srBesucht: "- visitato.",
  srNichtBesucht: "- non ancora visitato.",
  srGemeistert: (sterne) => `- superato, ${sterne} stelle su 3.`,
  srNichtGemeistert: "- non ancora superato.",

  // --- Galleria dei distintivi ----------------------------------------------
  abzeichenTitel: "Distintivi",
  abzeichenStand: (verdient, alle) =>
    `${verdient} distintivi su ${alle} ottenuti - raccogli stelle, supera i mondi, scrivi dettati, costruisci battute e suona canzoni a memoria.`,
  geheimAbzeichen: "Distintivo segreto",
  geheimBeschreibung: "Ancora bloccato - scopri come aprirlo!",
  srVerdient: "ottenuto.",
  srGeheim: "segreto, non ancora ottenuto.",
  srNichtVerdient: "non ancora ottenuto.",

  // --- Mix del giorno -------------------------------------------------------
  mixIntro:
    "Mix del giorno - un breve giro di esercizi misti dei capitoli che hai superato. Con calma: qui nulla conta e non ci sono stelle.",
  mixStart: (n) => `Mix del giorno avviato - cinque minuti di esercizi da ${n} capitoli superati.`,
  mixEnde: (vomKind, richtig, gesamt) =>
    `${vomKind ? "Giro finito." : "Il tempo è scaduto!"} Hai risposto bene a ${richtig} esercizi su ${gesamt}.`,
  mixGeschafft: "Mix del giorno completato!",
  mixErgebnis: (richtig, gesamt) => `${richtig} esercizi giusti su ${gesamt}`,
  mixProzent: (pct) => ` · ${pct} %`,
  mixFein: "Bell'allenamento - i tuoi progressi restano come prima.",
  nochEineRunde: "Un altro giro",
  zurKapitelwahl: "Torna all'elenco dei capitoli",
  mixBunt: (n) => `Misto da ${n} capitoli superati`,
  mixTimer: (min, sek) => `Mancano ${min} minuti e ${sek} secondi`,
  mixRichtigLabel: (richtig, gesamt) => `${richtig} giusti su ${gesamt}`,
  mixRichtig: "giusti",
  beenden: "Termina",

  // --- Menu dell'audio ------------------------------------------------------
  akustikMusik: "Musica",
  akustikMusikErklaerung:
    "Gli strumenti suonano le note degli esercizi. Fanno parte dell'esercizio - perciò non c'è un interruttore per spegnerli, solo il volume.",
  akustikInstrument: "Strumento",
  akustikInstrumentErklaerung: "Quale strumento suona le note. Dopo il cambio suona un do per provare.",
  akustikLautstaerke: "Volume della musica",
  akustikLautstaerkeErklaerung:
    "Quanto forte suonano gli strumenti. Il 100 % è circa forte come la voce. La musica tace del tutto solo allo 0 %.",

  // --- Matrice della classe (insegnanti) ------------------------------------
  matrixSterne: (n) => `${n} ${n === 1 ? "stella" : "stelle"}`,
  matrixLaedt: "caricamento …",
  matrixKapitelImEinzelnen: "Capitoli nel dettaglio",
  matrixAufklappLabel: (name, offen) => `Capitoli nel dettaglio: ${name} ${offen ? "comprimi" : "espandi"}`,
  matrixAufklappTipp: (name) => `Capitoli di ${name} - ogni capitolo con le sue stelle.`,
  matrixWeltSr: (nr, titel, fertig, n, sterne) =>
    `Mondo sonoro ${nr}, ${titel}: ${fertig} capitoli su ${n} superati, ${sterne}.`,
  matrixGesamtSr: (fertig, n, sterne) => `In totale ${fertig} capitoli su ${n} superati, ${sterne}.`,
  matrixRegion: (name) => `Capitoli nel dettaglio: ${name}`,
  matrixGemeistert: (sterne) => `superato, ${sterne}`,
  matrixNichtGemeistert: "non ancora superato",
  matrixTabelle: "Progressi della classe in Klangpunkte",
  matrixName: "Nome",
  matrixWeltKurz: (nr) => `M${nr}`,
  matrixWeltTitel: (nr, titel) => `Mondo sonoro ${nr}: ${titel}`,
  matrixWeltSpalteSr: (nr, titel) => `: mondo sonoro ${nr}, ${titel}`,
  matrixGesamt: "Totale",
  matrixZuletzt: "Ultimo",
  matrixFuss:
    "Numero in ogni casella = capitoli superati in quel mondo sonoro. La freccia davanti al nome mostra ogni capitolo con le sue stelle. Vedi esattamente ciò che il bambino vede di sé - niente di più.",
};
