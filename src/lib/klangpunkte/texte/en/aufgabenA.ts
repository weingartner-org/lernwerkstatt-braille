/** Bereich `aufgabenA` - Englisch (en-GB). */
import type { aufgabenA as De } from "../de/aufgabenA";

export const aufgabenA: typeof De = {
  gemeinsam: {
    taktstrichZelle: "Bar line - the space bar",
    zahlzeichen: "the number sign",
    obereZahl: (n: number): string => `the ${n} (top number)`,
    tiefeZahl: (n: number): string => `the ${n} as a lowered number`,
    schlagzahl: (b: number): string => String(b),
  },
  hilfe: {
    schreibNote: (ton: string, wert: string): string => `Write: ${ton} - ${wert}.`,
    welcheNote: "Which note is this? Listen carefully and feel the cell.",
    dasWar: (ton: string, wert: string): string => `That was ${ton} - ${wert}.`,
  },
  kp1: {
    zweiHoeher: "Two notes. Which one was higher?",
    dreiHoechster: "Three notes. Which one was the highest?",
    ordinale: ["The first", "The second", "The third"],
    hoechsterErklaer: (i: number): string => `${["The first", "The second", "The third"][i]} note was the highest.`,
    leiter: "A little scale. Does it go up or down?",
    leiterWahl: ["Up", "Down"],
    leiterRauf: "It went up.",
    leiterRunter: "It went down.",
  },
  kp2: {
    prompt: (len: number): string => `Listen to the rhythm and tap it back on the space bar - ${len} beats.`,
  },
  kp3: {
    grundform: " (The basic form is the quaver.)",
  },
  kp4: {
    prompt: "Listen to the tune and write it note by note.",
  },
  kp5: {
    viertelHinweis: " (Crotchet = add dot 6 - just like dot 3 for the letters k to t.)",
    melodie: "Write the tune - all crotchets.",
    frage: "Quaver or crotchet?",
    wahl: ["Quaver", "Crotchet"],
    erklaerAchtel: "No extra dot at the bottom: a quaver.",
    erklaerViertel: "With dot 6 added: a crotchet.",
  },
  kp6: {
    halbeHinweis: " (Minim = add dot 3.)",
    ganzeHinweis: " (Semibreve = add dots 3 and 6.)",
    frage: "Which note length is this?",
    erklaer: (wert: string): string => `It was a ${wert}.`,
  },
  kp7: {
    schreibPause: (pause: string): string => `Write: ${pause}.`,
    taktart: "Which time signature is this?",
    taktartErklaer: (a: number, b: number): string =>
      `It was ${a}/${b} time: number sign, ${a} on top, ${b} as the lowered number underneath.`,
    taktstrich: (ton1: string, ton2: string): string =>
      `Write: ${ton1} minim, bar line (space bar), ${ton2} minim.`,
    taktstrichErklaer: "In braille, the bar line is a space.",
  },
  kp8: {
    prompt: (ton: string, wert: string): string =>
      `Write: ${ton} - dotted ${wert}. (The dot that makes a note longer is dot 3 in its OWN cell.)`,
    punktZelle: "the dot that makes the note longer - dot 3",
  },
  kp9: {
    prompt: (vorzeichen: string, ton: string): string =>
      `Write: ${vorzeichen}, then ${ton} as a crotchet. (The accidental comes straight BEFORE the note.)`,
  },
  kp10: {
    lage: "Which octave does this sound in?",
    lageWahl: ["Low (third octave)", "Middle (fourth octave)", "High (fifth octave)"],
    lageErklaer: (oktave: string): string => `That was the ${oktave}.`,
    schreib: (ton: string, oktave: string): string =>
      `Write ${ton} in the ${oktave} as the FIRST note of a piece, a crotchet. (First the octave sign, then the note.)`,
    zeichenZelle: (oktave: string): string => `the octave sign for the ${oktave}`,
  },
  kp11: {
    gleich: "the same note",
    sekundeTerz: "a second or a third",
    quarteQuinte: "a fourth or a fifth",
    sexteMehr: "a sixth or more",
    regelKlein: "A second or a third NEVER needs an octave sign.",
    regelMittel: "A fourth or a fifth ONLY needs one when the octave changes.",
    regelGross: "From a sixth upwards, the note ALWAYS needs an octave sign.",
    prompt: (ton1: string, oktave1: string, ton2: string, oktave2: string): string =>
      `First note: ${ton1}, ${oktave1}. Then: ${ton2}, ${oktave2}. Does the second note need an octave sign?`,
    wahl: ["Yes", "No"],
    erklaer: (sprung: string, regel: string): string => `The jump is ${sprung}. ${regel}`,
  },
  kp12: {
    grossPrompt: "In 4/4 time, ONE single cell fills the whole bar. Semibreve or semiquaver?",
    grossWahl: ["A semibreve", "A semiquaver"],
    grossErklaer:
      "A single cell that has to fill four beats is the LONG note: the semibreve. A semiquaver would be far too short.",
    kleinPrompt: "In 2/4 time, EIGHT identical cells stand in a row. Semibreves or semiquavers?",
    kleinWahl: ["Semibreves", "Semiquavers"],
    kleinErklaer:
      "Eight semibreves would never fit into two beats - they must be the SHORT notes: semiquavers. The time signature and the context decide.",
  },
  kp13: {
    similePrompt: "Write the braille bar repeat sign (play the whole bar again).",
    simileZelle: "the bar repeat sign - dots 2, 3, 5, 6",
    simileErklaer: "This shortcut only exists in braille - cleverer than print!",
    startPrompt: "Write: repeat START (two cells).",
    startZellen: ["first cell - dots 1, 2, 6", "second cell - dots 2, 3, 5, 6"],
    endePrompt: "Write: repeat END (two cells).",
    endeZellen: ["first cell - dots 1, 2, 6", "second cell - dots 2, 3"],
    schluss: "The final bar line (end of the piece)",
    anfang: "Repeat start",
    ende: "Repeat end",
    erkennenPrompt: "Which form sign is this?",
    erkannt: (zeichen: string): string => `It was: ${zeichen}.`,
  },
  haltebogen: {
    hoerenPrompt: "Two minims on the same note. Played once or twice?",
    hoerenWahl: ["Once - tied", "Twice - separate"],
    hoerenGebunden: "Only one attack: the tie joins the two notes into ONE long note.",
    hoerenGetrennt: "Two attacks: there was no tie here - each note starts again.",
    schreibPrompt: (ton: string): string =>
      `Write: ${ton} minim, tie (two cells: dot 4, then dots 1 and 4), then ${ton} minim again.`,
    zelle1: "tie, first cell - dot 4",
    zelle2: "tie, second cell - dots 1, 4",
    klingtWeiter: (note: string): string => `${note} - keeps sounding, with no new attack`,
    schreibErklaer: "The tie comes straight AFTER the first note.",
    taktPrompt: (ton: string): string =>
      `Tie across the bar line: ${ton} minim, tie, bar line (space bar), ${ton} minim.`,
    taktErklaer: "This is how a note keeps sounding across the bar line.",
  },
  auftakt: {
    vollPrompt: (a: number, b: number): string =>
      `${a}/${b} time. Listen to the bar and count along: is it complete?`,
    vollWahl: ["Complete", "Incomplete - an upbeat or a part bar"],
    vollJa: (ziel: string): string => `It adds up exactly: ${ziel} beats.`,
    vollNein: (summe: string, ziel: string): string =>
      `Something is missing: only ${summe} of ${ziel} beats - a part bar. At the start of a piece it is called an upbeat.`,
    bindestrichPrompt: "The bar is not finished at the end of the line. Write the music hyphen (dot 5).",
    bindestrichZelle: "the music hyphen - dot 5",
    bindestrichErklaer: "Dot 5 at the end of a line says: this bar carries on in the next line.",
    schreibPrompt: (ton: string): string =>
      `Write the upbeat: ${ton} crotchet, bar line (space bar), then the full bar.`,
    auftaktZelle: (note: string): string => `${note} - the upbeat`,
    schreibErklaer: "An upbeat is an incomplete first bar - it is written just like any other.",
  },
  pausen2: {
    vielePrompt: (n: number): string => `Write: ${n} bars of rest - number sign, the ${n}, then the semibreve rest.`,
    zahlzeichenZelle: "the number sign - dots 3, 4, 5, 6",
    zahlZelle: (n: number): string => `the number ${n}`,
    ganzePauseZelle: "the semibreve rest - dots 1, 3, 4",
    vieleErklaer: "From four empty bars on, braille writes the count as a number in front of the semibreve rest.",
    kleinPrompt: (n: number): string =>
      `Write: ${n} empty bars - up to three bars, just write the semibreve rest ${n === 2 ? "twice" : "three times"}.`,
    kleinZelle: (i: number): string => `semibreve rest ${i} - one whole empty bar`,
    kleinErklaer: "The semibreve rest ALWAYS fills a whole bar - whatever the time signature.",
    lesenPrompt: "How many silent bars are there?",
    takte: (n: number): string => `${n} bars`,
    lesenKlein: (n: number): string => `${n} semibreve rests in a row = ${n} empty bars.`,
    lesenGross: (n: number): string => `Number sign + ${n} + semibreve rest = ${n} bars of silence in one go.`,
    stillePrompt: "Three bars - one of them is completely silent. Where?",
    stilleWahl: ["At the start", "In the middle", "At the end"],
    stilleErklaer: (i: number): string =>
      `The silence was ${["at the start", "in the middle", "at the end"][i]} - a whole bar of rest.`,
  },
  tonart: {
    keyNames: {
      kreuz: ["G major", "D major", "A major", "E major"],
      be: ["F major", "B flat major", "E flat major", "A flat major"],
    },
    kreuz: "sharp",
    be: "flat",
    kreuze: "sharps",
    bes: "flats",
    lesenPrompt: (mehrzahl: string): string =>
      `This key signature stands at the start of the piece. How many ${mehrzahl} are there?`,
    lesenErklaer: (n: number, name: string, tonart: string, ab4: boolean): string =>
      `${n} ${name} - the key signature of ${tonart}. ${
        ab4 ? "From four on, the number stands in front." : "Up to three, the sign is simply repeated."
      }`,
    schreibKlein: (n: number, name: string, zeichen: string): string =>
      `Write the key signature: ${n} ${name} - just write the ${zeichen} sign ${n === 1 ? "once" : n === 2 ? "twice" : "three times"}.`,
    schreibGross: (n: number, mehrzahl: string, zeichen: string): string =>
      `Write the key signature: ${n} ${mehrzahl} - from four on, with a number sign: number sign, the ${n}, then the ${zeichen}.`,
    zeichenZelle: (name: string, i: number, punkte: string): string => `${name} ${i} - dots ${punkte}`,
    zahlzeichenZelle: "the number sign - dots 3, 4, 5, 6",
    zahlZelle: (n: number): string => `the number ${n}`,
    dasZeichen: (name: string): string => `the ${name}`,
    istVorzeichnung: (tonart: string): string => `That is the key signature of ${tonart}.`,
    kopfPrompt: (n: number, name: string, a: number, b: number): string =>
      `Write the head of a piece: first the key signature (${n} ${name}), straight after it the time signature ${a}/${b} - with no space in between.`,
    kopfZelle: (name: string, i: number): string => `${name} ${i}`,
    kopfErklaer: "Key and time signature stand together at the start of a piece - first the key signature, then the time signature.",
    regelPrompt: "The key signature at the start of a piece - how long does it last?",
    regelWahl: ["For the whole piece", "Only for the first bar", "Only for the first note"],
    regelErklaer:
      "The key signature lasts for the whole piece - an accidental in the middle of a bar, however, only lasts until the bar line.",
  },
  taktwechsel: {
    sonderPrompt: "Which time signature is this?",
    sonderWahl: ["C - common time (four crotchet beats)", "Alla breve - cut time (two minim beats)", "3/4 time"],
    sonderErklaerC: "Dots 4, 6 before the c: the C of common time.",
    sonderErklaerAb: "Dots 4, 5, 6 before the c: alla breve - the minims carry the beat.",
    sonderSchreibenC: "Write the C time sign: dots 4 and 6, then the c (dots 1, 4).",
    sonderSchreibenAb: "Write alla breve: dots 4, 5 and 6, then the c (dots 1, 4).",
    vorzeichenC: "the sign - dots 4, 6",
    vorzeichenAb: "the sign - dots 4, 5, 6",
    dasC: "the c - dots 1, 4",
    wechselPrompt: "After a few notes there is a SECOND time signature. What does that mean?",
    wechselWahl: (a: number, b: number): string[] => [
      `The time signature changes to ${a}/${b}`,
      "The key changes",
      "The piece is over",
    ],
    wechselErklaer: (a: number, b: number): string =>
      `A new time signature in the middle of a piece means: from here on, ${a}/${b} time applies.`,
    wechselSchreiben: (a: number, b: number): string =>
      `The time signature changes in the middle of the piece: write a bar line (space bar), then the new time signature ${a}/${b}.`,
  },
  schluessel: {
    lesenPrompt: "Which clef is this (three cells)?",
    lesenErklaer: (schluessel: string): string =>
      `It was the ${schluessel}. All clefs begin with dots 3, 4, 5 and end with dots 1, 2, 3 - the middle cell tells them apart.`,
    mitteViolin: "dots 3, 4",
    mitteBass: "dots 3, 4, 5, 6",
    schreibPrompt: (schluessel: string, mitte: string): string =>
      `Write the ${schluessel} - three cells: dots 3, 4, 5 · ${mitte} · dots 1, 2, 3.`,
    ankuendigung: "the clef opening - dots 3, 4, 5",
    gZeichen: "the G sign - dots 3, 4",
    fZeichen: "the F sign - dots 3, 4, 5, 6",
    abschluss: "the ending - dots 1, 2, 3",
    wissenPrompt: "Does braille music need clefs to work out the pitch?",
    wissenWahl: ["No - the octave signs tell you the octave", "Yes - nothing works without a clef"],
    wissenErklaer:
      "In braille, clef signs only give information about the printed page - the octave is always set by the octave signs.",
  },
  sechzehntel: {
    hoerenPrompt: "A little run. Quavers - or the semiquavers that are twice as quick?",
    hoerenWahl: ["Quavers", "Semiquavers"],
    hoerenSchnell: "Those were semiquavers - four to a beat.",
    hoerenLangsam: "Those were quavers - two to a beat.",
    gruppePrompt:
      "Write the group of four semiquavers: only the FIRST note gets dots 3 and 6, and you write the other three like quavers (grouping).",
    ersteZelle: (ton: string): string => `${ton} as a semiquaver - with dots 3 and 6`,
    andereZelle: (ton: string): string => `${ton} - written like a quaver (it belongs to the group)`,
    gruppeErklaer: "Grouping makes fast runs easy to read: the length dots only go on the first note of the group.",
    regelPrompt:
      "Four semiquavers in one beat, written as a group: how many cells carry the length dots 3 and 6?",
    regelWahl: ["Only the first", "All four", "The first and the last"],
    regelErklaer:
      "Only the first note of the group shows the length - the rest look like quavers. This is the braille counterpart of the beamed group in print.",
    einzelnPrompt: (ton: string): string =>
      `Write: ${ton} as a semiquaver. (Careful - it is the same cell as the semibreve; the time signature decides!)`,
  },
  triolen: {
    hoerenPrompt: "Between two steady beats: how many notes share ONE beat - two or three?",
    hoerenWahl: ["Two - ordinary quavers", "Three - a triplet"],
    hoerenTriole: "Three notes of equal length in one beat: a triplet.",
    hoerenZwei: "Two quavers - the ordinary split.",
    schreibPrompt: "Write the triplet: first the triplet sign (dots 2, 3), then the three quavers.",
    triolenZeichen: "the triplet sign - dots 2, 3",
    achtelZelle: (ton: string): string => `${ton}, quaver - one third of the beat`,
    schreibErklaer: "The triplet sign comes ONCE before the group - it turns two quavers into three.",
    lesenPrompt: "In front of three quavers stands this first cell (dots 2, 3). What does it mean?",
    lesenWahl: ["A triplet - three notes in one beat", "A quaver rest", "An octave sign"],
    lesenErklaer: "Dots 2, 3 in front of a group of notes = triplet.",
  },
  puls: {
    klopfPrompt: (n: number): string =>
      `Feel the steady beat and tap it evenly on the space bar - ${n} beats long.`,
    metrumPrompt: "Listen to the stressed beats: is this marching in twos or waltzing in threes?",
    metrumWahl: ["March - in twos", "Waltz - in threes"],
    metrumDrei: "The first of every three beats is stressed: a three - the waltz step.",
    metrumZwei: "The first of every two beats is stressed: a two - the marching step.",
    abstandPrompt: "Count the beats from one stress to the next: how many are there?",
    abstandWahl: ["2 beats", "3 beats", "4 beats"],
    abstandErklaer: (n: number): string => `From stress to stress there are ${n} beats - ${n}/4 time.`,
  },
  dauer: {
    vergleichPrompt: "Two notes, one after the other. Which one sounded longer?",
    vergleichWahl: ["The first", "The second"],
    vergleichErster: "The first was a minim - twice as long as the crotchet after it.",
    vergleichZweiter: "The second was a minim - twice as long as the crotchet before it.",
    schlaegePrompt: "First two beats of the pulse, then one long note: how many beats long did it sound?",
    schlaegeWahl: ["1 beat - a crotchet", "2 beats - a minim", "4 beats - a semibreve"],
    schlaegeErklaer: (wert: string, zahl: number): string =>
      `That was a ${wert} - ${zahl} ${zahl === 1 ? "beat" : "beats"} long.`,
    paarPrompt: "Two notes: the same length - or the second twice as long?",
    paarWahl: ["The same length", "The second twice as long"],
    paarGleich: "Two crotchets of the same length.",
    paarDoppelt: "First a crotchet, then a minim - twice as long.",
  },
  dynamik: {
    lautPrompt: "Listen to the little phrase: played loudly or quietly?",
    lautWahl: ["Loud", "Quiet"],
    lautErklaer: "Played strongly - later you will call this forte.",
    leiseErklaer: "Played very gently - later you will call this piano.",
    rampePrompt: "Does the phrase get louder or quieter?",
    rampeWahl: ["Louder", "Quieter"],
    cresc: "From quiet to loud - later this is called crescendo.",
    decresc: "From loud to quiet - later this is called decrescendo.",
    akzentPrompt: "One note is stressed in particular. Where was it?",
    akzentWahl: ["At the start", "In the middle", "At the end"],
    akzentErklaer: (i: number): string =>
      `The stressed note was ${["at the start", "in the middle", "at the end"][i]}.`,
  },
  inst: {
    merk: {
      klavier: "Piano - struck, a bright attack that rings on.",
      gitarre: "Guitar - plucked, percussive and stringy.",
      sax: "Saxophone - blown, smooth and reedy.",
      floete: "Flute - blown, soft and clear.",
    },
    hoerenPrompt: "Which instrument is playing here?",
    vergleichPrompt: "Two little tunes, one after the other: the same instrument or different ones?",
    vergleichWahl: ["The same instrument", "Different instruments"],
    vergleichGleich: "Both tunes came from the same instrument.",
    vergleichErklaer: (a: string, b: string): string => `First ${a}, then ${b}.`,
    zuerstPrompt: "Two instruments, one after the other. Which one played first?",
    zuerstErklaer: (a: string): string => `First came the ${a}.`,
  },
  echo: {
    prompt: (len: number): string =>
      `Echo game: listen to the ${len} notes and play them back on the keyboard - the keys D F G H J K L are the notes C D E F G A B. Only the order of the notes counts; the rhythm is free.`,
    erklaer: "Play the notes back in the order you heard them.",
  },
  memory: {
    prompt:
      "Tune memory: I play a run of notes and you play it back (the keys D F G H J K L are the notes C D E F G A B). If you get it right, one more note is added - how far can you get?",
  },
};
