/** Bereich `uebersicht` - Nederlands. */
import type { uebersicht as De } from "../de/uebersicht";

export const uebersicht: typeof De = {
  // --- Aankondigingen en meldingen ------------------------------------------
  kapitelwahlAnsage: "Lijst met hoofdstukken. Elk hoofdstuk kun je kiezen - sterren laten zien hoe ver je bent.",
  kapitelAnsage: (nr, welt, i, n, kapitel) => `Klankwereld ${nr}, ${welt} - hoofdstuk ${i} van ${n}: ${kapitel}.`,
  kapitelAnsageOhneWelt: (kapitel) => `Hoofdstuk: ${kapitel}.`,
  neuesAbzeichen: (name) => `Nieuwe badge: ${name}!`,
  neueAbzeichen: (namen) => `Nieuwe badges: ${namen.join(", ")}!`,
  geschafftMitSternen: (sterne) => `Klaar! +30 XP · ${sterne} van 3 sterren voor dit hoofdstuk`,
  geschafft: "Klaar! +30 XP",
  zeichenlisteOffen: "Tekenlijst geopend.",
  zeichenlisteZu: "Tekenlijst gesloten.",
  weltInArbeit: (nr, name) => `Klankwereld ${nr}, ${name}, wordt nog gemaakt - die komt in een latere update.`,
  zeichenAreaLabel: "Klangpunkte",
  zeichenAreaBlurb: "Braillemuziek: luisteren, voelen, schrijven.",

  // --- Kopregel -------------------------------------------------------------
  rangCaption: "Rang",
  rangLabel: (level, rest) => `Rang ${level} - nog ${rest} XP tot de volgende.`,
  xpHinweis: (xp) => `${xp} XP - 2 voor elk goed antwoord, 30 voor elk hoofdstuk.`,
  xpText: (xp) => `${xp} XP`,
  sterneHinweis: (n, max) => `${n} van ${max} sterren - tot 3 per hoofdstuk.`,
  weltName: (nr, titel) => `Klankwereld ${nr}: ${titel}`,
  weltKopf: (nr, titel, i, n) => `Klankwereld ${nr}: ${titel} - hoofdstuk ${i} van ${n}`,
  voriges: "Vorig hoofdstuk",
  naechstes: "Volgend hoofdstuk",
  kapitelSelect: "Kies een hoofdstuk - ga er met de pijltjes omhoog en omlaag doorheen",
  kapitelOption: (i, titel, sterne) =>
    `Hoofdstuk ${i}: ${titel}${sterne === null ? "" : ` - onder de knie, ${sterne} van 3 sterren`}`,
  landkarte: (kapitel, welten) => `${kapitel} hoofdstukken in ${welten} klankwerelden - allemaal te kiezen`,
  kapitelwahlKnopf: "Hoofdstukkenlijst",
  kapitelwahlTitel: "Alle klankwerelden en hoofdstukken met je sterren (Alt + U)",
  zeichenlisteKnopf: "Tekenlijst",
  zeichenlisteTitel: "Lijst van alle muzieksymbolen, in de volgorde waarin je ze leert (Alt + L)",

  // --- Hoofdstukkenkeuze ----------------------------------------------------
  kapitelwahlUeberschrift: "Hoofdstukkenlijst - kies wat je wilt oefenen",
  mixTitel: "Dagelijkse mix",
  mixText: "Vijf minuten gemengde opdrachten uit de hoofdstukken die je onder de knie hebt, zonder sterren, gewoon om in vorm te blijven.",
  loslegen: "Start",
  mixZuWenig: (n) => `Zet eerst een paar hoofdstukken onder de knie (minstens 3), dan staat je dagelijkse mix hier. Tot nu toe: ${n}.`,
  weltStand: (fertig, n, sterne, max) => `${fertig} van ${n} hoofdstukken onder de knie · ${sterne} van ${max} sterren`,
  kapitelZeile: (i, titel) => `Hoofdstuk ${i}: ${titel}`,
  werkeText: (n) => ` · ${n} van 5 stukken`,
  besucht: "✓ bezocht",
  srBesucht: "- bezocht.",
  srNichtBesucht: "- nog niet bezocht.",
  srGemeistert: (sterne) => `- onder de knie, ${sterne} van 3 sterren.`,
  srNichtGemeistert: "- nog niet onder de knie.",

  // --- Badge-galerij --------------------------------------------------------
  abzeichenTitel: "Badges",
  abzeichenStand: (verdient, alle) =>
    `${verdient} van ${alle} badges verdiend - verzamel sterren, zet werelden onder de knie, schrijf dictees, bouw maten en speel liedjes uit het hoofd.`,
  geheimAbzeichen: "Geheime badge",
  geheimBeschreibung: "Nog op slot - ontdek hoe je hem opent!",
  srVerdient: "verdiend.",
  srGeheim: "geheim, nog niet verdiend.",
  srNichtVerdient: "nog niet verdiend.",

  // --- Dagmix ---------------------------------------------------------------
  mixIntro:
    "Dagelijkse mix - een korte, gemengde oefenronde uit de hoofdstukken die je onder de knie hebt. Ontspan: hier telt niets mee, en er zijn geen sterren.",
  mixStart: (n) => `Dagelijkse mix begonnen - vijf minuten oefenen uit ${n} hoofdstukken die je onder de knie hebt.`,
  mixEnde: (vomKind, richtig, gesamt) =>
    `${vomKind ? "Ronde afgelopen." : "De tijd is om!"} Je had ${richtig} van ${gesamt} ${gesamt === 1 ? "opdracht" : "opdrachten"} goed.`,
  mixGeschafft: "Dagelijkse mix klaar!",
  mixErgebnis: (richtig, gesamt) => `${richtig} van ${gesamt} ${gesamt === 1 ? "opdracht" : "opdrachten"} goed`,
  mixProzent: (pct) => ` · ${pct} %`,
  mixFein: "Mooi geoefend - je voortgang blijft zoals hij was.",
  nochEineRunde: "Nog een ronde",
  zurKapitelwahl: "Terug naar de hoofdstukkenlijst",
  mixBunt: (n) => `Gemengd uit ${n} hoofdstukken die je onder de knie hebt`,
  mixTimer: (min, sek) => `Nog ${min} minuten en ${sek} seconden`,
  mixRichtigLabel: (richtig, gesamt) => `${richtig} van ${gesamt} goed`,
  mixRichtig: "goed",
  beenden: "Stoppen",

  // --- Geluidsmenu ----------------------------------------------------------
  akustikMusik: "Muziek",
  akustikMusikErklaerung:
    "De instrumenten spelen de noten van de opdrachten. Ze horen bij de opdracht - daarom is er geen uitschakelaar, alleen het volume.",
  akustikInstrument: "Instrument",
  akustikInstrumentErklaerung: "Welk instrument de noten speelt. Na het wijzigen speelt het een C om het uit te proberen.",
  akustikLautstaerke: "Volume van de muziek",
  akustikLautstaerkeErklaerung:
    "Hoe hard de instrumenten spelen. 100 % is ongeveer even hard als de stem. De muziek is pas helemaal stil bij 0 %.",

  // --- Klassenoverzicht (leerkrachten) --------------------------------------
  matrixSterne: (n) => `${n} ${n === 1 ? "ster" : "sterren"}`,
  matrixLaedt: "laden …",
  matrixKapitelImEinzelnen: "Hoofdstukken in detail",
  matrixAufklappLabel: (name, offen) => `Hoofdstukken in detail: ${name} ${offen ? "inklappen" : "uitklappen"}`,
  matrixAufklappTipp: (name) => `Hoofdstukken van ${name} - elk hoofdstuk met zijn sterren.`,
  matrixWeltSr: (nr, titel, fertig, n, sterne) =>
    `Klankwereld ${nr}, ${titel}: ${fertig} van ${n} hoofdstukken onder de knie, ${sterne}.`,
  matrixGesamtSr: (fertig, n, sterne) => `Totaal ${fertig} van ${n} hoofdstukken onder de knie, ${sterne}.`,
  matrixRegion: (name) => `Hoofdstukken in detail: ${name}`,
  matrixGemeistert: (sterne) => `onder de knie, ${sterne}`,
  matrixNichtGemeistert: "nog niet onder de knie",
  matrixTabelle: "Klangpunkte-voortgang van de klas",
  matrixName: "Naam",
  matrixWeltKurz: (nr) => `W${nr}`,
  matrixWeltTitel: (nr, titel) => `Klankwereld ${nr}: ${titel}`,
  matrixWeltSpalteSr: (nr, titel) => `: klankwereld ${nr}, ${titel}`,
  matrixGesamt: "Totaal",
  matrixZuletzt: "Laatst",
  matrixFuss:
    "Het getal in elk vakje = hoofdstukken die onder de knie zijn in die klankwereld. De pijl voor de naam toont elk hoofdstuk met zijn sterren. Je ziet precies wat het kind over zichzelf ziet - niet meer.",
};
