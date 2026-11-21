/** Bereich `uebersicht` - Englisch (en-GB). */
import type { uebersicht as De } from "../de/uebersicht";

export const uebersicht: typeof De = {
  // --- Ansagen und Meldungen ------------------------------------------------
  kapitelwahlAnsage: "Chapter list. Every chapter is open to choose - stars show how far you have got.",
  kapitelAnsage: (nr, welt, i, n, kapitel) => `Sound world ${nr}, ${welt} - chapter ${i} of ${n}: ${kapitel}.`,
  kapitelAnsageOhneWelt: (kapitel) => `Chapter: ${kapitel}.`,
  neuesAbzeichen: (name) => `New badge: ${name}!`,
  neueAbzeichen: (namen) => `New badges: ${namen.join(", ")}!`,
  geschafftMitSternen: (sterne) => `Done! +30 XP · ${sterne} of 3 stars for this chapter`,
  geschafft: "Done! +30 XP",
  zeichenlisteOffen: "Sign list opened.",
  zeichenlisteZu: "Sign list closed.",
  weltInArbeit: (nr, name) => `Sound world ${nr}, ${name}, is still being built - it will come in a later update.`,
  zeichenAreaLabel: "Klangpunkte",
  zeichenAreaBlurb: "Braille music: listen, feel, write.",

  // --- Kopfleiste -----------------------------------------------------------
  rangCaption: "Rank",
  rangLabel: (level, rest) => `Rank ${level} - ${rest} XP to go until the next one.`,
  xpHinweis: (xp) => `${xp} XP - 2 for each right answer, 30 for each chapter.`,
  xpText: (xp) => `${xp} XP`,
  sterneHinweis: (n, max) => `${n} of ${max} stars - up to 3 for each chapter.`,
  weltName: (nr, titel) => `Sound world ${nr}: ${titel}`,
  weltKopf: (nr, titel, i, n) => `Sound world ${nr}: ${titel} - chapter ${i} of ${n}`,
  voriges: "Previous chapter",
  naechstes: "Next chapter",
  kapitelSelect: "Choose a chapter - move through them with the up and down arrow keys",
  kapitelOption: (i, titel, sterne) =>
    `Chapter ${i}: ${titel}${sterne === null ? "" : ` - mastered, ${sterne} of 3 stars`}`,
  landkarte: (kapitel, welten) => `${kapitel} chapters in ${welten} sound worlds - all open to choose`,
  kapitelwahlKnopf: "Chapter list",
  kapitelwahlTitel: "All sound worlds and chapters with your stars (Alt + U)",
  zeichenlisteKnopf: "Sign list",
  zeichenlisteTitel: "List of all music signs, in the order you learn them (Alt + L)",

  // --- Kapitelwahl ----------------------------------------------------------
  kapitelwahlUeberschrift: "Chapter list - choose what you want to practise",
  mixTitel: "Daily Mix",
  mixText: "Five minutes of mixed tasks from the chapters you have mastered, with no stars, just to keep you in practice.",
  loslegen: "Start",
  mixZuWenig: (n) => `Master a few chapters first (at least 3), then your Daily Mix will be here. So far: ${n}.`,
  weltStand: (fertig, n, sterne, max) => `${fertig} of ${n} chapters mastered · ${sterne} of ${max} stars`,
  kapitelZeile: (i, titel) => `Chapter ${i}: ${titel}`,
  werkeText: (n) => ` · ${n} of 5 pieces`,
  besucht: "✓ visited",
  srBesucht: "- visited.",
  srNichtBesucht: "- not visited yet.",
  srGemeistert: (sterne) => `- mastered, ${sterne} of 3 stars.`,
  srNichtGemeistert: "- not mastered yet.",

  // --- Abzeichen-Galerie ----------------------------------------------------
  abzeichenTitel: "Badges",
  abzeichenStand: (verdient, alle) =>
    `${verdient} of ${alle} badges earned - collect stars, master worlds, write dictations, build bars and play songs from memory.`,
  geheimAbzeichen: "Secret badge",
  geheimBeschreibung: "Still locked - find out how to open it!",
  srVerdient: "earned.",
  srGeheim: "secret, not earned yet.",
  srNichtVerdient: "not earned yet.",

  // --- Tages-Mix ------------------------------------------------------------
  mixIntro:
    "Daily Mix - a short, mixed round of practice from the chapters you have mastered. Relax: nothing counts here, and there are no stars.",
  mixStart: (n) => `Daily Mix started - five minutes of practice from ${n} mastered chapters.`,
  mixEnde: (vomKind, richtig, gesamt) =>
    `${vomKind ? "Round finished." : "Time is up!"} You got ${richtig} of ${gesamt} ${gesamt === 1 ? "task" : "tasks"} right.`,
  mixGeschafft: "Daily Mix done!",
  mixErgebnis: (richtig, gesamt) => `${richtig} of ${gesamt} ${gesamt === 1 ? "task" : "tasks"} right`,
  mixProzent: (pct) => ` · ${pct} %`,
  mixFein: "Nice practice - your progress stays as it was.",
  nochEineRunde: "Another round",
  zurKapitelwahl: "Back to the chapter list",
  mixBunt: (n) => `Mixed from ${n} mastered chapters`,
  mixTimer: (min, sek) => `${min} minutes and ${sek} seconds left`,
  mixRichtigLabel: (richtig, gesamt) => `${richtig} of ${gesamt} right`,
  mixRichtig: "right",
  beenden: "Finish",

  // --- Akustik-Menü ---------------------------------------------------------
  akustikMusik: "Music",
  akustikMusikErklaerung:
    "The instruments play the notes of the tasks. They are part of the task - so there is no off switch, only the volume.",
  akustikInstrument: "Instrument",
  akustikInstrumentErklaerung: "Which instrument plays the notes. After you change it, it plays a C to try it out.",
  akustikLautstaerke: "Volume of the music",
  akustikLautstaerkeErklaerung:
    "How loud the instruments play. 100 % is about as loud as the voice. The music only goes completely quiet at 0 %.",

  // --- Klassen-Matrix (Lehrkräfte) ------------------------------------------
  matrixSterne: (n) => `${n} ${n === 1 ? "star" : "stars"}`,
  matrixLaedt: "loading …",
  matrixKapitelImEinzelnen: "Chapters in detail",
  matrixAufklappLabel: (name, offen) => `Chapters in detail: ${name} ${offen ? "collapse" : "expand"}`,
  matrixAufklappTipp: (name) => `Chapters of ${name} - each chapter with its stars.`,
  matrixWeltSr: (nr, titel, fertig, n, sterne) =>
    `Sound world ${nr}, ${titel}: ${fertig} of ${n} chapters mastered, ${sterne}.`,
  matrixGesamtSr: (fertig, n, sterne) => `Total ${fertig} of ${n} chapters mastered, ${sterne}.`,
  matrixRegion: (name) => `Chapters in detail: ${name}`,
  matrixGemeistert: (sterne) => `mastered, ${sterne}`,
  matrixNichtGemeistert: "not mastered yet",
  matrixTabelle: "Klangpunkte progress of the class",
  matrixName: "Name",
  matrixWeltKurz: (nr) => `W${nr}`,
  matrixWeltTitel: (nr, titel) => `Sound world ${nr}: ${titel}`,
  matrixWeltSpalteSr: (nr, titel) => `: sound world ${nr}, ${titel}`,
  matrixGesamt: "Total",
  matrixZuletzt: "Latest",
  matrixFuss:
    "Number in each box = chapters mastered in that sound world. The arrow in front of the name shows every chapter with its stars. You see exactly what the child sees about themselves - nothing more.",
};
