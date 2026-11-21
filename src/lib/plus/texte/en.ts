/**
 * Plus in English (en-GB). Gleiche Felder wie `de.ts` (Typ `PlusTexte`).
 *
 * ★ Kinder werden geduzt wie im deutschen Bestand („you"), warm und kurz, so
 *   wie Tastenflow en sie anspricht. Nichts Österreichisches: keine
 *   „Schulstufe", keine Lehrplan-Namen - „Level" zählt Plus selbst.
 * ★ „Maths", nicht „math" (britisch). Die Mathematikschrift heißt hier
 *   „UEB maths braille" (Unified English Braille, Technical).
 * ★ Stoffplan: `stoffEn.ts` (Stufen und Übungen, nur was Englisch heute
 *   anbietet).
 */
import { ZEICHENABSTAND_LABELS_EN } from "@/lib/typing/zeichenabstand";
import type { PlusTexte } from "./typ";
import { STOFF_EN } from "./stoffEn";

export const en: PlusTexte = {
  sprache: "en",
  stufe: (nr) => `Level ${nr}`,
  zurueck: "Back",
  logoBeschreibung:
    "The Plus logo: a turquoise key with rounded corners. On it two white speech bubbles. " +
    "In the small one at the back, the word plus is written in braille. In the large one at the front, it is a plus sign.",

  start: {
    hallo: (v) => `Hello ${v}!`,
    willkommen: "Welcome to Plus!",
    wiederDa: "Good to see you again.",
    neu: "Maths in your head. No clock, no pressure.",
    fuerAlleKopf: "Class activity",
    fuerAlleAnzahl: (n) => `${n} questions. Everyone does the same ones.`,
    losGeht: "Let's go",
    trainingMarke: (stufe) => `My training${stufe !== null ? ` · Level ${stufe}` : ""}`,
    trainingSucht: "Plus picks the questions.",
    etappe: (nr, name) => `Stage ${nr}: ${name}`,
    allesGeschafft: "All done!",
    rundeInfo: "8 questions per round. No clock.",
    weiterrechnen: "Keep going",
    etappenGeschafft: (g, n) => `${g} of ${n} stages done.`,
    wochenzielTitel: "Weekly goal",
    wochenstand: (g, z) => (g >= z ? `Weekly goal reached: ${g} of ${z}.` : `This week: ${g} of ${z} questions.`),
    oder: "Or would you rather …",
    wahlTitel: "I choose",
    wahlSatz: "Pick a practice.",
    spieleTitel: "Games",
    spieleSatz: "Maths, but different.",
    sammlungTitel: "My collection",
    sammlungLeer: "Badges and weekly goal.",
    sammlungAnzahl: (n) => `${n} badges.`,
    anmeldenSatz: "Sign in. Then your progress is on every device.",
    anmelden: "Sign in",
  },

  stufenwahl: {
    trainingTitel: "My training - which level?",
    trainingHinweis: "Plus mixes the round from what you already know, what comes next and a little revision.",
  },

  wahl: {
    stufenTitel: "Which level?",
    paketTitel: (stufe) => `${stufe} - which practice?`,
    offen: (n) => (n === 1 ? "One practice at this level is not ready yet." : `${n} practices at this level are not ready yet.`),
    feste: "Your teacher sets the level.",
    andere: "Another level",
  },

  seite: {
    bereichTraining: "My training",
    bereichWahl: "I choose",
    bereichStart: "Start",
    bereichFuerAlle: "Class activity",
    einstellungen: "Settings",
    einstellungenZurueck: "Back to the maths",
    stimmeFehlt: "There is no English voice installed on this device.",
    vorlesenAn: "Reading aloud is on.",
    stimmeHinweis: "Your screen reader does not read the maths signs aloud. The Plus voice does.",
    fuerAlleGestartet: "Your teacher has started a class activity.",
    passwortTitel: "Change password",
    hilfeTitel: "Plus - Help",
    macHinweis: "On a Mac the Alt key is called the Option key (⌥).",
    hilfe: [
      "My training takes you through the maths of your level. Stage by stage, always moving on.",
      "You can also use: I choose (pick a practice). Your numbers are in the account menu at the top right.",
      "A round has eight questions. There is no clock and no time pressure.",
      "You can type the answer as numbers or enter it in braille. Alt + B switches between typing numbers, computer braille and UEB maths braille with six dots.",
      "The sum is already in the box. You write into the gap or after the equals sign. If the sum has gone: pressing Shift twice says the question again and puts the sum back in the box. Alt + W says the question again. Alt + Z says where you are. Alt + E takes you to the box.",
      "With \"Skip question\" you move to the next question. A skipped question counts neither as right nor as wrong.",
      "In braille entry the box shows what you entered. What Plus reads from it is shown underneath.",
      "In written sums you can ask to see the working - step by step, as often as you like.",
      "Alt + V makes Plus read everything aloud. Ctrl stops it at once. The loudspeaker in the header opens a menu where you set speed, volume and sounds.",
    ],
    kuerzel: [
      ["Alt + B", "Change the way you write, from anywhere: numbers - computer braille - UEB maths braille 6 dots"],
      ["Shift twice", "The question again - and the sum is back in the box"],
      ["Alt + W", "Say the question again"],
      ["Alt + Z", "Say where you are (question 3 of 8)"],
      ["Alt + E", "Go to the answer box"],
      ["Enter", "Check the answer - and after a right answer, move on"],
      ["Alt + P", "Check - also in written sums, where Enter makes a new line"],
      ["Ctrl + Enter", "Check - same as Alt + P"],
      ["⌫", "In braille entry: delete the last cell"],
      ["F D S  J K L", "The six braille keys (like on a braille writer)"],
      ["A  ;", "Dot 7 and dot 8 - only in computer braille"],
      ["Esc", "Close a window - back to the answer box"],
      ["Alt + G", "Go to the next heading"],
      ["Ctrl", "Stop at once: the spoken message ends. Reading aloud stays on"],
      ["Alt + V", "Reading aloud on / off - speed, volume and sounds are in the menu under the loudspeaker"],
      ["Alt + O", "Open / close settings"],
      ["Alt + H", "Open / close help"],
      ["Alt + T", "Open / close the list of keyboard shortcuts"],
      ["Alt + J", "Open / close my account"],
      ["Alt + K", "Open / close colours and contrast"],
      ["Alt + +", "Bigger (text and answer box)"],
      ["Alt + -", "Smaller"],
      ["Alt + 0", "Normal size"],
      ["Alt + Shift + P", "Report a problem - with a picture of the window"],
    ],
  },

  uebung: {
    fallbackTitel: "My training",
    nochNichts: "Nothing there yet.",
    luecke: "A gap is still empty.",
    veraendert: "The sum has changed at the front. Press Shift twice to bring it back.",
    richtig: "Correct.",
    fastRichtig: (s) => `Nearly right. It is spelt: ${s}.`,
    einheit: (h) => `Worked out correctly - ${h ?? "watch the unit"}.`,
    restFehlt: "Worked out correctly - the remainder is still missing.",
    nochNicht: (h) => `Not yet. ${h}`,
    nochNichtLeer: "Not yet. Have another look.",
    uebersprungen: "Skipped.",
    aufgabeKurz: (k) => `Question: ${k}`,
    etappeVon: (nr, g) => `Stage ${nr} of ${g}.`,
    aufgabeVon: (nr, g) => `Question ${nr} of ${g}.`,
    aufgabeLabel: (nr, g) => `Question ${nr} of ${g}`,
    danachRaetsel: "A puzzle comes next.",
    genug: "That is enough for today. Come back tomorrow.",
    raetselVorspann: (r, g) => `${r} of ${g} correct. Now comes a puzzle.`,
    geschafft: "Well done",
    richtigVon: (r, g) => `${r} of ${g} correct.`,
    uebersprungenSatz: (n) => ` ${n === 1 ? "One question" : `${n} questions`} skipped.`,
    rundenBis: (n) => (n === 1 ? "A puzzle comes after the next round." : `${n} more rounds until the puzzle.`),
    weiterNaechste: "Next round",
    andereUebung: "Choose another practice",
    genugHeute: "Enough for today",
    nochDurchgang: "Another go",
    danachMarke: (r) => (r ? "next: puzzle" : "next: summary"),
    danachSatz: (nr, gesamt, raetsel) => {
      const rest = gesamt - nr;
      const noch = rest === 0 ? "This is the last one." : rest === 1 ? "One more after this." : `${rest} more after this.`;
      return `${noch}${raetsel ? " A puzzle comes next." : ""}`;
    },
    merke: "Remember:",
    zeigWeg: "Show me the working",
    nochSchritt: "One more step",
    nochmalAnsagen: "Say the question again",
    tastenExtra: "Shift key twice: the question again - the sum is back in the box",
    weiter: "Next",
    pruefen: "Check",
    loesungEine: (l) => `One answer is ${l}.`,
    loesung: (l) => `The answer is ${l}.`,
    nichtWeiter: "I am stuck",
    ueberspringen: "Skip question",
    beenden: "End practice",
    etappeZeile: (nr, g, name) => `Stage ${nr} of ${g}: ${name}`,
  },

  eingabe: {
    arten: {
      normal: "Type numbers",
      computer: "Computer braille",
      marburger: "UEB maths braille, 6 dots",
    },
    antwort: "Your answer",
    tasteArt: "Alt + B changes the way you write",
    tasteGroesse: "Alt + Plus bigger · Alt + Minus smaller · Alt + 0 reset",
    tasteZeile: "Enter: new line · Alt + P checks",
    tasteZurueck: "Shift key twice: bring the sum back",
    artAnsage: (art, steht) => `${art}. ${steht ? "The sum is back in the box." : "The box is empty again."}`,
    anfang: "At the start of the line.",
    feldLeer: "The box is empty.",
    geloescht: "deleted",
    punkte: (p) => `Dots ${p === "leer" ? "empty" : p}`,
    keineRechnung: "There is no sum to bring back here.",
    rechnungDa: "The sum is back.",
    soLese: "This is how I read it:",
    nochNichts: "nothing yet",
    tastenFuer: "Keys for this practice",
  },

  einstellungen: {
    gruppeEingabe: "Input",
    gruppeAnzeige: "Display",
    gruppeKlang: "Sound and reading aloud",
    braillezeile: "Working with a braille display",
    zeilenAn: "The whole question is in the answer box - word problems too. The lines wrap so that you jump about as little as possible. You write into the gap.",
    zeilenAus: "The question is at the top and the answer box is empty. You type digits and maths signs on the keyboard.",
    unterwegsVor: "On the go,",
    unterwegsNach: " switches it.",
    schrift: "Braille code",
    schriftNamen: { computer: "Computer braille (8 dots)", marburger: "UEB maths braille (6 dots)" },
    schriftErkl: (schrift, eingabe) => {
      const aus = schrift === "computer"
        ? "The question is in the box in computer braille. It has eight dots, and every sign is one cell, like on your braille display."
        : "The question is in the box in UEB maths braille with six dots. Numbers get the number sign in front - like in a school book.";
      const ein = eingabe === "tastatur"
        ? "You type the numbers on the keyboard and the box turns them into cells."
        : schrift === "computer"
          ? "You enter braille with F D S and J K L, plus A and ; for dots 7 and 8."
          : "You enter braille with six dots: F D S and J K L.";
      return `${aus} ${ein}`;
    },
    wieDuSchreibst: "How you write",
    wegNamen: { tastatur: "Numbers on the keyboard", braille: "Entering braille" },
    breite: "Braille display with 40 or 80 characters",
    breiteKurz: "Braille display",
    breiteNamen: { 40: "40 characters", 80: "80 characters" },
    breiteErkl: {
      40: "The box is at most 40 characters wide, like a braille display with 40 cells. Long questions wrap more often.",
      80: "The box is at most 80 characters wide, like a braille display with 80 cells. Most questions fit on one line.",
    },
    festgelegtNach: ". Your teacher has set this for you.",
    an: "on",
    aus: "off",
    soSteht: (b) => `This is how ${b} looks in the box:`,
    ausschreiben: "Write sums out in words",
    ausschreibenJa: "Yes - in words: 48 plus 27 is",
    ausschreibenNein: "No - short: 48 +27 =",
    ausschreibenErkl: "In words is for children who only listen. With a braille display the short form is used - it is the better one there.",
    textgroesse: "Text size",
    prozent: (n) => `${n} percent`,
    groesseA: "Makes the question and the answer box bigger; the rest of the program stays as it is. ",
    groesseB: " bigger, ",
    groesseC: " smaller, ",
    groesseD: " back to normal.",
    abstand: "Letter spacing",
    abstandErkl: "More space between the characters if they run into each other (CVI). Applies on this device, in Tastenflow too.",
    schriftWahlName: "Font of the question and the answer box",
    schriftWahlHinweis: "Changes only the question and your answer box - the program itself stays as it is. Applies on this device.",
    farbenA: "Colours and contrast: ",
    farbenB: " or the colour switch in the header.",
    klangA: "You set reading aloud, speed, volume and sounds in the menu under the loudspeaker in the header.",
    klangB: " switches reading aloud on and off directly, ",
    klangC: " stops it at once.",
    strg: "Ctrl",
    abstandNamen: ZEICHENABSTAND_LABELS_EN,
    region: "Country",
    regionErkl: "The country changes the money in the word problems, a few words, the voice and how numbers are spoken. The braille cells stay the same.",
    regionNamen: {
      es: "Spain (euros)", latam: "Latin America (pesos)",
      fr: "France (euros)", be: "Belgium (euros)",
      "ch-huitante": "Switzerland: Vaud, Valais, Fribourg (francs, huitante)",
      "ch-quatre-vingts": "Switzerland: Geneva, Neuchâtel, Bern, Jura (francs, quatre-vingts)",
      ca: "Québec (dollars)",
    },
  },

  akustik: {
    kopf: "Sound and reading aloud",
    probe: "This is how Plus sounds.",
    vorlesenTitel: "Plus reads aloud",
    vorlesenErkl: (h) => `Plus says questions and feedback in its own voice. ${h} Alt + V switches it, Ctrl stops it at once.`,
    tempo: "Speaking speed",
    tempoErkl: "How fast the Plus voice speaks. 100 % is normal, further right is faster.",
    lautStimme: "Volume of the voice",
    lautStimmeErkl: "How loud the Plus voice speaks. 100 % is as loud as your device is set - it cannot be louder.",
    toene: "Sounds",
    toeneErkl: "A short chime when you have worked it out correctly. \"Correct\" is always written down as well.",
    lautToene: "Volume of the sounds",
    lautToeneErkl: "How loud the chimes are. At 0 % it stays quiet, even if the sounds are on.",
  },

  hinweise: {
    funktionsname: "Plus does not know function names such as log or sin yet.",
    altesGeteilt: "That old division sign is no longer used.",
    kommaOhneZahl: "A comma with no number before it.",
    bruchstrichZahlzeichen: "After the fraction line, a number sign belongs before the number.",
    griechisch: "Plus does not know Greek letters.",
    schliesstOhneOffen: "This closes something that is not open.",
    unbekanntesZeichen: "Plus does not know this sign.",
    klammerOffen: "A bracket is still open.",
    kommaInZahl: "A comma inside a number: Plus cannot tell whether it is a decimal sign or a thousands sign. Use the decimal point.",
    buchstabeNichtGebaut: "Letters and units are not part of this braille maths yet.",
  },

  stoff: STOFF_EN,
};
