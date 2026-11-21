/** Bereich `aufgabenC` - Englisch (en-GB): Welten 7, 8 und 9. */
import type { aufgabenC as De } from "../de/aufgabenC";

export const aufgabenC: typeof De = {
  zellen: {
    oktavzeichenDer: (oktave: string): string => `the octave sign for the ${oktave}`,
    oktavzeichen: "the octave sign",
    vorzeichen: "the accidental",
    verlaengerungspunkt: "the dot that lengthens the note - dot 3",
    taktstrich: "bar line - the space bar",
  },

  // --- World 7 "Theory Playground" -----------------------------------------
  tonleitern: {
    spielNach:
      "Play the C major scale going up: C D E F G A B C - on the keys D F G H J K L, then up an octave and D again.",
    spielNachErkl: "Eight steps from C to the next C.",
    durMollFrage: "Listen to the scale - major (bright) or minor (dark)?",
    durMollWahl: ["Major", "Minor"],
    durMollErklMoll: "The third step is lowered - natural minor.",
    durMollErklDur: "A plain major scale.",
    fehlerFrage: "In this major scale ONE note has slipped. Which step was wrong?",
    fehlerWahl: ["Step 3", "Step 4", "Step 5", "Step 6", "Step 7"],
    fehlerErkl: (stufe: number): string => `Step ${stufe} sounded too high.`,
    schreibe:
      "Write the G major scale: G A B C D E - and then F sharp, so a sharp in front of the F (that is the one sharp in the key of G major).",
    schreibeErkl: "G major has one sharp: the F becomes F sharp.",
  },

  quintenzirkel: {
    vz: {
      kreuz: { ein: "sharp", mehr: "sharps" },
      be: { ein: "flat", mehr: "flats" },
    },
    anzahlFrage: (name: string, mehr: string): string =>
      `Stop on the circle of fifths: ${name}. How many ${mehr} does this key have?`,
    anzahlErkl: (name: string, n: number, wort: string): string => `${name} has ${n} ${wort}.`,
    nameFrage: (n: number, wort: string): string => `${n} ${wort} - which major key is that?`,
    nameErkl: (n: number, wort: string, name: string): string => `${n} ${wort}: that is ${name}.`,
    lesenFrage: "Read the key signature in braille - which key is it?",
    lesenErkl: (name: string): string => `This key signature belongs to ${name}.`,
  },

  rhythmusdiktat: {
    blattFrage: "Read the rhythm on the stave and tap it with the space bar - straight from the page.",
    diktatFrage: (rhythm: boolean): string =>
      `Rhythm dictation: I tap one bar on the note G. Write the note values you hear${rhythm ? " (rhythm syllables are on)" : ""}. The start note is G. Listen as often as you like.`,
    diktatErkl: "Count the beats for each note: crotchet = one beat, minim = two.",
  },

  melodiediktat: {
    frage: (startton: string, anzahl: number): string =>
      `Melody dictation: the start note is ${startton}. Listen to the ${anzahl} notes and write them down - they move in small steps. Listen as often as you like.`,
    erkl: "Compare note by note with the start note: does it go up or down?",
  },

  detektiv: {
    frage: "Read the braille line and listen to the recording. Where does the sound differ from the notes?",
    note: (n: number): string => `Note ${n}`,
    allesRichtig: "All correct",
    erklRichtig: "Everything matched - the sound and the notes were the same.",
    erklAnders: (n: number): string => `Note ${n} sounded different from what was written.`,
  },

  baumeister: {
    dreiViertel:
      "Build a full 3/4 bar: write notes and rests with f d s j k l until the beats add up to exactly 3. Enter checks it.",
    mitPause: "Build a 4/4 bar with at least ONE rest. Enter checks it.",
    mitNoten: "Build a 4/4 bar with at least THREE notes. Enter checks it.",
    sechsAchtel: "Challenge: build a full 6/8 bar (six quaver beats). Enter checks it.",
  },

  spielwiese: {
    frage:
      "Sound playground: over the quiet drone you can play freely - with D F G J K (pentatonic scale). No note can be wrong. Tell a little story: first quiet, then loud. After 30 notes the workshop counts as visited.",
  },

  kadenzen: {
    schlussFrage: "Two chords as an ending - does that sound finished, or does it go on?",
    schlussWahl: ["Finished - a proper ending", "Open - it goes on"],
    schlussErklOffen: "Staying on the dominant (V) feels open - an imperfect cadence (half close).",
    schlussErklZu: "From the dominant back to the home chord - that sounds finished (a perfect cadence).",
    artFrage: "Which kind of ending is this?",
    artWahl: [
      "Perfect - from the dominant (V) to the home chord",
      "Plagal - the “Amen” ending from the subdominant (IV)",
    ],
    artErklPlagal: "IV to I - the soft “Amen” ending (plagal).",
    artErklAuth: "V to I - the strong, perfect ending.",
    funktionFrage: "What job does this chord do in C major?",
    funktionWahl: ["Tonic (chord I)", "Subdominant (chord IV)", "Dominant (chord V)"],
    funktionErkl: [
      "Tonic (T) - the home chord, chord I.",
      "Subdominant (S) - chord IV.",
      "Dominant (D) - chord V.",
    ],
  },

  komponier: {
    frage:
      "Composing workshop: write freely with f d s j k l, listen to your piece and save it (up to 5). The workshop counts as visited as soon as you have saved one piece.",
  },

  // --- World 8 "Instruments" -----------------------------------------------
  fingersatz: {
    lesenFrage: "Read the note and the fingering: which finger should play the note? (The fingering comes AFTER the note.)",
    lesenErkl: (finger: string): string => `The small number after the note is the ${finger}.`,
    schreibenFrage: (ton: string, finger: string): string =>
      `Write the note ${ton} and add the fingering for the ${finger} - it comes AFTER the note.`,
    fingerZelle: (finger: string): string => `${finger} - the fingering`,
    schreibenErkl: (finger: string): string => `The ${finger} gets its number straight after the note.`,
    positionFrage: "Where does the fingering go - before or after the note?",
    positionWahl: ["After the note", "Before the note"],
    positionErkl: "Unlike the articulation sign, the fingering comes AFTER the note (before a tie, if there is one).",
  },

  klavier: {
    zweiFrage:
      "Two lines - at the top the right hand (treble clef), at the bottom the left hand (bass clef). How many notes does the LEFT hand play? With Alt + Q you can see and hear one hand on its own, in large size.",
    zweiWahl: (n: number): string => `${n} notes`,
    zweiErkl: "Count the note heads on the lower line - or listen to the low hand on its own (Alt + Q).",
    handFrage: "This line begins with a hand sign. Which hand is it for?",
    handWahl: ["Right hand", "Left hand"],
    handErklLinks: "Dots 4, 5, 6 and then 3, 4, 5: the sign for the left hand.",
    handErklRechts: "Dots 4, 6 and then 3, 4, 5: the sign for the right hand.",
    melodieFrage:
      "Two hands one after the other: one plays the tune (higher, moving about), the other accompanies down low. Which one was the tune?",
    melodieWahl: ["The part played first", "The second part"],
    melodieErkl: "The tune is the higher part that moves about - usually the right hand.",
    rechteHandFrage: (ton: string): string =>
      `Write the sign for the right hand (dots 4, 6 then 3, 4, 5) and after it the note ${ton} with its octave sign.`,
    rechteHandZellen: ["right hand, first cell - dots 4, 6", "right hand, second cell - dots 3, 4, 5"],
    rechteHandErkl: "After the hand sign, the part begins with an octave sign.",
    pedalFrage: "Which pedal sign is this - and does it come before or after the note?",
    pedalWahl: ["Pedal down - BEFORE the note", "Pedal up - AFTER the note"],
    pedalErklNieder: "Pedal down (dots 1, 2, 6 then 1, 4) comes before the note where the pedal is pressed.",
    pedalErklAuf: "Pedal up (dots 1, 6 then 1, 4) comes after the note where the pedal is let go.",
  },

  gesang: {
    melismaFrage: "On the syllable “la” - how many notes does the voice sing? (Several notes on one syllable are called a melisma.)",
    melismaWahl: ["One note", "Two notes", "Three notes"],
    melismaErkl: (n: number): string =>
      `The syllable gets ${n} notes - a melisma. In braille the syllable slur (dots 1, 4) joins them.`,
    bogenFrage:
      "One syllable on two notes: write the first note, the syllable slur (dots 1, 4) and the second note.",
    bogenZelle: "syllable slur - dots 1, 4",
    bogenErkl: "The syllable slur says: both notes belong to one syllable.",
    atemFrage: "This line has a breath sign. After which note do you breathe?",
    atemWahl: ["After the first note", "After the second note", "After the third note"],
    atemErkl: "The half breath sign (dots 3, 4, 5 then 2) comes straight after the first note.",
    zeilenFrage: "In vocal music, lines of words and lines of music take turns. Which prefix announces a line of WORDS?",
    zeilenWahl: ["Words prefix (dots 5, 6 then 2, 3)", "Music prefix (dot 6 then 3)"],
    zeilenErkl: "The line of words has the prefix dots 5, 6 then 2, 3; the line of music has dot 6 then dot 3.",
  },

  gitarre: {
    saiteFrage:
      "The string sign (dots 1, 4, 6) and a number tell you which string to play. Which string is this?",
    saiteWahl: (s: number): string => `String ${s}`,
    saiteErkl: (s: number): string => `String sign plus the number ${s}: string ${s}.`,
    schreibenFrage: (saite: number, ton: string): string =>
      `Write the sign for string ${saite} and then the note ${ton}: first the string sign (dots 1, 4, 6), then the number, then the note.`,
    saitenzeichenZelle: "string sign - dots 1, 4, 6",
    ziffernZelle: (saite: number): string => `the number ${saite} - string ${saite}`,
    schreibenErkl: "The string sign comes before the note; NO octave sign follows it.",
    akkordSorten: { dur: "major chord", moll: "minor chord", sept: "dominant seventh chord (italic 7)" },
    akkordFrage:
      "Listen to the broken chord - which kind is it? (The circle, the triangle and the italic 7 are international; letter symbols like “C7” are written a little differently in each country.)",
    akkordErkl: (sorte: string): string => `That was a ${sorte}.`,
  },

  generalbass: {
    aussetzungFrage:
      "The bass note is figured with a 6. Which realisation sounds right - with a sixth or with a fifth above the bass?",
    aussetzungWahl: ["Third and sixth above the bass", "Third and fifth above the bass"],
    aussetzungErklSext: "A 6 asks for the sixth above the bass - the chord in first inversion.",
    aussetzungErklQuint: "Without figures (or with 5/3) the chord in root position sounds, with the fifth.",
    stufeFrage: "Figured bass thinks in chords built on the steps of the scale. Which main chord do you hear here?",
    stufeWahl: ["Tonic (chord I)", "Subdominant (chord IV)", "Dominant (chord V)"],
    stufeErkl: [
      "That was the tonic (chord I) - the bridge from cadences to figured bass.",
      "That was the subdominant (chord IV) - the bridge from cadences to figured bass.",
      "That was the dominant (chord V) - the bridge from cadences to figured bass.",
    ],
    schreibenFrage:
      "Write a bass note with figures: the C and under it the figure 6 (the number sign and the low digit 6).",
    zahlzeichenZelle: "number sign - dots 3, 4, 5, 6",
    ziffer6Zelle: "the low digit 6 - dots 2, 3, 5",
    schreibenErkl: "The figured bass numbers are written as LOW digits after the number sign.",
  },

  partitur: {
    auftakt: {
      frage: "A piece begins with a pick-up (anacrusis). Which number does this first, incomplete bar have?",
      wahl: ["Bar 0", "Bar 1", "Bar 2"],
      erkl: "The pick-up counts as bar 0 - the first full bar is then bar 1.",
    },
    taktzahl: {
      frage: "This is how a bar number at the edge of the line looks (here: 16). Is there a number sign in front?",
      wahl: ["No - bar numbers have no number sign", "Yes - always with a number sign"],
      erkl: "Bar numbers in the margin have no number sign - just the digits themselves.",
    },
    format: {
      frage: "How does a braille full score arrange two hands or parts, so you can compare them bar by bar?",
      wahl: ["Section by section, line above line (bar-over-bar)", "Everything in one single long line"],
      erkl: "In the bar-over-bar format the parts sit one above the other section by section - bar next to bar, easy to read.",
    },
    quellen: {
      frage: "Where can you get ready-made braille music to read?",
      wahl: ["From libraries for people who are blind, such as dzb lesen or the SBS", "Only by copying it yourself"],
      erkl: "Libraries such as dzb lesen (Leipzig) and the SBS (Zurich) hold thousands of titles in braille music.",
    },
  },

  orchester: {
    familieKlavier: "string instrument (struck)",
    familieGitarre: "string instrument (plucked)",
    familieBlas: "wind instrument (blown)",
    hoerenFrage: "Listen to the short tune - which instrument family does this sound belong to?",
    hoerenWahl: ["String instruments - plucked or struck", "Wind instruments - blown", "Skin instruments - hit"],
    hoerenErkl: (instrument: string, familie: string): string => `${instrument}: ${familie}.`,
    fragen: [
      { frage: "Which family does the drum belong to (in the Hornbostel-Sachs system)?", richtig: "Skin instruments", falsch: ["String instruments", "Wind instruments"] },
      { frage: "Which family does the violin belong to?", richtig: "String instruments", falsch: ["Wind instruments", "Skin instruments"] },
      { frage: "Which family does the recorder belong to?", richtig: "Wind instruments", falsch: ["Skin instruments", "Self-sounding instruments"] },
      { frage: "Which family does the triangle belong to?", richtig: "Self-sounding instruments", falsch: ["Skin instruments", "String instruments"] },
    ],
    familieErkl: (richtig: string): string => `Correct: ${richtig}.`,
  },

  // --- World 9 "Song Stage" ------------------------------------------------
  lieder2: {
    dazuWahl: [
      "It got louder - a crescendo",
      "The notes became short - staccato",
      "The notes flowed softly into each other - legato",
    ],
    dazuDynamikFrage: (titel: string): string => `“${titel}” - first plain, then with expression. What was added?`,
    dazuDynamikErkl: "The second version got louder - a crescendo.",
    dazuStaccatoFrage: (titel: string): string => `“${titel}” - what was added to the plain version?`,
    dazuStaccatoErkl: "The notes became short and light - staccato.",
    dazuLegatoFrage: (titel: string): string => `“${titel}” - what was added?`,
    dazuLegatoErkl: "The notes were joined softly - legato, the slur.",
    articFrage: (titel: string): string => `“${titel}” - played smoothly (legato) or short (staccato)?`,
    articWahl: ["Smooth - legato", "Short - staccato"],
    articErklLegato: "The notes flowed into each other - legato.",
    articErklStaccato: "Every note was cut short - staccato.",
  },

  lesekonzert: {
    frage:
      "Reading concert: read the braille line (it is NOT played to you!), learn it by heart and press “Finished reading”. Then play the notes from memory on the keyboard.",
    erkl: "Read, remember, play - that is exactly how you read braille music at an instrument.",
  },

  liederquiz: {
    hoerenFrage: "Listen to the beginning - which song is it?",
    hoerenErkl: (titel: string): string => `That was the beginning of “${titel}”.`,
    lesenFrage: "Read the first line in braille - without sound! Which song do you recognise?",
    lesenErkl: (titel: string): string => `This line is the beginning of “${titel}” - silent reading with your inner ear.`,
  },

  liedZeile: {
    frage: (titel: string, zeile: number): string =>
      `${titel}, line ${zeile}: first listen, then write it note by note - now WITH octave signs.`,
  },
};
