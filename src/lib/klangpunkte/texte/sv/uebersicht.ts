/** Bereich `uebersicht` - Svenska. */
import type { uebersicht as De } from "../de/uebersicht";

export const uebersicht: typeof De = {
  // --- Upplästa meddelanden ----------------------------------------------
  kapitelwahlAnsage: "Kapitellista. Varje kapitel kan väljas - stjärnorna visar hur långt du har kommit.",
  kapitelAnsage: (nr, welt, i, n, kapitel) => `Klangvärld ${nr}, ${welt} - kapitel ${i} av ${n}: ${kapitel}.`,
  kapitelAnsageOhneWelt: (kapitel) => `Kapitel: ${kapitel}.`,
  neuesAbzeichen: (name) => `Nytt märke: ${name}!`,
  neueAbzeichen: (namen) => `Nya märken: ${namen.join(", ")}!`,
  geschafftMitSternen: (sterne) => `Klart! +30 XP · ${sterne} av 3 stjärnor för det här kapitlet`,
  geschafft: "Klart! +30 XP",
  zeichenlisteOffen: "Teckenlistan öppnad.",
  zeichenlisteZu: "Teckenlistan stängd.",
  weltInArbeit: (nr, name) => `Klangvärld ${nr}, ${name}, byggs fortfarande - den kommer i en senare uppdatering.`,
  zeichenAreaLabel: "Klangpunkte",
  zeichenAreaBlurb: "Punktskriftsmusik: lyssna, känn, skriv.",

  // --- Namnlisten ----------------------------------------------------------
  rangCaption: "Rang",
  rangLabel: (level, rest) => `Rang ${level} - ${rest} XP kvar till nästa.`,
  xpHinweis: (xp) => `${xp} XP - 2 för varje rätt svar, 30 för varje kapitel.`,
  xpText: (xp) => `${xp} XP`,
  sterneHinweis: (n, max) => `${n} av ${max} stjärnor - upp till 3 för varje kapitel.`,
  weltName: (nr, titel) => `Klangvärld ${nr}: ${titel}`,
  weltKopf: (nr, titel, i, n) => `Klangvärld ${nr}: ${titel} - kapitel ${i} av ${n}`,
  voriges: "Föregående kapitel",
  naechstes: "Nästa kapitel",
  kapitelSelect: "Välj ett kapitel - gå igenom dem med pilarna upp och ned",
  kapitelOption: (i, titel, sterne) =>
    `Kapitel ${i}: ${titel}${sterne === null ? "" : ` - avklarat, ${sterne} av 3 stjärnor`}`,
  landkarte: (kapitel, welten) => `${kapitel} kapitel i ${welten} klangvärldar - alla kan väljas`,
  kapitelwahlKnopf: "Kapitellista",
  kapitelwahlTitel: "Alla klangvärldar och kapitel med dina stjärnor (Alt + U)",
  zeichenlisteKnopf: "Teckenlista",
  zeichenlisteTitel: "Lista över alla musiktecken, i den ordning du lär dig dem (Alt + L)",

  // --- Kapitelval ----------------------------------------------------------
  kapitelwahlUeberschrift: "Kapitellista - välj vad du vill öva",
  mixTitel: "Dagens mix",
  mixText: "Fem minuter blandade uppgifter från kapitlen du har avklarat, utan stjärnor, bara för att hålla igång.",
  loslegen: "Starta",
  mixZuWenig: (n) => `Klara några kapitel först (minst 3), så dyker din dagens mix upp här. Hittills: ${n}.`,
  weltStand: (fertig, n, sterne, max) => `${fertig} av ${n} kapitel avklarade · ${sterne} av ${max} stjärnor`,
  kapitelZeile: (i, titel) => `Kapitel ${i}: ${titel}`,
  werkeText: (n) => ` · ${n} av 5 stycken`,
  besucht: "✓ besökt",
  srBesucht: "- besökt.",
  srNichtBesucht: "- inte besökt än.",
  srGemeistert: (sterne) => `- avklarat, ${sterne} av 3 stjärnor.`,
  srNichtGemeistert: "- inte avklarat än.",

  // --- Märkesgalleriet -----------------------------------------------------
  abzeichenTitel: "Märken",
  abzeichenStand: (verdient, alle) =>
    `${verdient} av ${alle} märken förtjänade - samla stjärnor, klara världar, skriv diktat, bygg takter och spela sånger utantill.`,
  geheimAbzeichen: "Hemligt märke",
  geheimBeschreibung: "Fortfarande låst - ta reda på hur du öppnar det!",
  srVerdient: "förtjänat.",
  srGeheim: "hemligt, inte förtjänat än.",
  srNichtVerdient: "inte förtjänat än.",

  // --- Dagens mix ----------------------------------------------------------
  mixIntro:
    "Dagens mix - en kort, blandad övningsrunda från kapitlen du har avklarat. Slappna av: här räknas inget, och det finns inga stjärnor.",
  mixStart: (n) => `Dagens mix startad - fem minuter övning från ${n} avklarade kapitel.`,
  mixEnde: (vomKind, richtig, gesamt) =>
    `${vomKind ? "Rundan är slut." : "Tiden är ute!"} Du fick ${richtig} av ${gesamt} ${gesamt === 1 ? "uppgift" : "uppgifter"} rätt.`,
  mixGeschafft: "Dagens mix klar!",
  mixErgebnis: (richtig, gesamt) => `${richtig} av ${gesamt} ${gesamt === 1 ? "uppgift" : "uppgifter"} rätt`,
  mixProzent: (pct) => ` · ${pct} %`,
  mixFein: "Bra övat - dina framsteg är kvar som de var.",
  nochEineRunde: "En runda till",
  zurKapitelwahl: "Tillbaka till kapitellistan",
  mixBunt: (n) => `Blandat från ${n} avklarade kapitel`,
  mixTimer: (min, sek) => `${min} minuter och ${sek} sekunder kvar`,
  mixRichtigLabel: (richtig, gesamt) => `${richtig} av ${gesamt} rätt`,
  mixRichtig: "rätt",
  beenden: "Avsluta",

  // --- Ljudmenyn -----------------------------------------------------------
  akustikMusik: "Musik",
  akustikMusikErklaerung:
    "Instrumenten spelar uppgifternas toner. De hör till uppgiften - därför finns ingen avstängningsknapp, bara volymen.",
  akustikInstrument: "Instrument",
  akustikInstrumentErklaerung: "Vilket instrument som spelar tonerna. När du byter spelar det ett C för att prova.",
  akustikLautstaerke: "Musikens volym",
  akustikLautstaerkeErklaerung:
    "Hur starkt instrumenten spelar. 100 % är ungefär lika starkt som rösten. Musiken blir helt tyst först vid 0 %.",

  // --- Klasstabellen (lärare) ----------------------------------------------
  matrixSterne: (n) => `${n} ${n === 1 ? "stjärna" : "stjärnor"}`,
  matrixLaedt: "laddar …",
  matrixKapitelImEinzelnen: "Kapitel i detalj",
  matrixAufklappLabel: (name, offen) => `Kapitel i detalj: ${name} ${offen ? "fäll ihop" : "fäll ut"}`,
  matrixAufklappTipp: (name) => `Kapitel för ${name} - varje kapitel med sina stjärnor.`,
  matrixWeltSr: (nr, titel, fertig, n, sterne) =>
    `Klangvärld ${nr}, ${titel}: ${fertig} av ${n} kapitel avklarade, ${sterne}.`,
  matrixGesamtSr: (fertig, n, sterne) => `Totalt ${fertig} av ${n} kapitel avklarade, ${sterne}.`,
  matrixRegion: (name) => `Kapitel i detalj: ${name}`,
  matrixGemeistert: (sterne) => `avklarat, ${sterne}`,
  matrixNichtGemeistert: "inte avklarat än",
  matrixTabelle: "Klangpunkte-framsteg för klassen",
  matrixName: "Namn",
  matrixWeltKurz: (nr) => `V${nr}`,
  matrixWeltTitel: (nr, titel) => `Klangvärld ${nr}: ${titel}`,
  matrixWeltSpalteSr: (nr, titel) => `: klangvärld ${nr}, ${titel}`,
  matrixGesamt: "Totalt",
  matrixZuletzt: "Senast",
  matrixFuss:
    "Siffran i varje ruta = avklarade kapitel i den klangvärlden. Pilen framför namnet visar varje kapitel med dess stjärnor. Du ser exakt det barnet ser om sig självt - inget mer.",
};
