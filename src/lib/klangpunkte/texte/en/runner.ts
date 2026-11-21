/** Bereich `runner` - Englisch (en-GB). */
import type { runner as De } from "../de/runner";

export const runner: typeof De = {
  kopf: {
    anhoeren: "Listen",
    stopp: "Stop",
    anhoerenTitel: "Listen to the task (Alt + W also reads it out)",
    instrument: "Instrument",
    namenKnopf: "do-re-mi",
    namenTitel: (a: string, b: string): string => `Note names as ${a} (fixed do) instead of ${b}`,
    rhythmusKnopf: "ta ti-ti",
    rhythmusTitel: "Rhythm words: also say ta, ti-ti after the note lengths",
    anderesLied: "Another song",
    namenAn: (a: string, b: string, c: string): string => `Note names: ${a}, ${b}, ${c}.`,
    rhythmusAn: "Rhythm words on: ta, ti-ti.",
    rhythmusAus: "Rhythm words off.",
    zurueckLiedauswahl: "Back to the song choice.",
  },

  aufgabe: {
    liesBrailleZeile: "Read the braille line.",
    handNurKlavier: "Switching hands only works in the piano chapter with two staves.",
    weiter: (prompt: string): string => `Carry on. ${prompt}`,
    zeichenlisteHinweis: "You can find all the music signs of this chapter in the sign list: Alt and L.",
    songGanzGeschafft: (titel: string): string => `${titel} - all done!`,
    songZeile: (zeile: number, von: number): string => ` · Line ${zeile} of ${von}`,
  },

  geschafft: {
    geschafft: "Done!",
    mitSternen: (n: number): string => `Done! ${n} of 3 stars.`,
    alsNaechstesAnsage: (titel: string): string => ` Next: ${titel}.`,
    alsNaechstesKarte: (titel: string): string => `Next: ${titel}`,
    weiterUeben: "Keep practising",
    weiter: "Next",
  },
  fortschritt: {
    caption: "Practice",
    aria: (n: number, min: number, prozent: number): string =>
      `Chapter progress: ${n} of at least ${min} tasks, ${prozent} per cent done.`,
    rundeGeschafft: "Round done - the chapter is secure.",
    runde: (n: number, min: number, noch: number): string =>
      `Round: ${n} of at least ${min} tasks done` +
      (noch > 0 ? `, at least ${noch} to go.` : ", the chapter is nearly secure."),
  },

  lieder: {
    kinder: "🧒 Children's songs",
    erwachsene: "🎼 Classical & evergreens",
  },

  hand: {
    hinweis: (f: "both" | "rh" | "lh"): string =>
      " - see and hear one hand on its own, large (" +
      (f === "rh"
        ? "now: right hand only"
        : f === "lh"
          ? "now: left hand only"
          : "now: both hands") +
      ")",
  },

  wahl: {
    richtig: "Correct!",
    richtigWaere: (antwort: string): string => `The right answer is: ${antwort}.`,
    antworten: "Answers (you can also press the number keys 1 to 4)",
  },

  tap: {
    aria: (n: number): string => `Tap the rhythm: space bar. So far ${n} taps.`,
    vor: "Tap here with the ",
    stark: "space bar",
    nach: (n: number, von: number): string => ` - ${n} of ${von} taps`,
    knopf: (n: number, von: number): string => `Tap (${n} of ${von})`,
    puls: "Not quite steady yet - feel the beat and keep it calm.",
    kurz: "short",
    lang: "long",
    fast: (muster: string): string => `Nearly! The pattern was: ${muster}. Listen once more.`,
    genauImPuls: "Right on the pulse!",
    genauImTakt: "Right in time!",
  },

  spielen: {
    ariaKlaviatur: (namen: string): string =>
      `Copy-the-tune keyboard: D F G H J K L are ${namen}. Up and down arrows change the octave. `,
    ariaFrei: (n: number, von: number): string => `Play freely over the drone - ${n} of ${von} notes. `,
    ariaMemory: (laenge: number): string => `Current length ${laenge} notes. `,
    ariaTon: (i: number, von: number): string => `Note ${i} of ${von}. `,
    ariaLesen:
      "Reading concert: read the braille line. Press Enter or ‘Done reading’ when you have it in your head.",
    lesenVor: "Read the line in braille - it will ",
    lesenStark: "not",
    lesenMitte: " be played. When you have it in your head, press ",
    lesenNach: " or ‘Done reading’.",
    fertigGelesen: "Done reading",
    nachLesen: "Now play it from memory - D F G H J K L, the arrows change the octave.",
    freiVor: "Play freely with ",
    freiNach: (n: number, von: number): string => ` (pentatonic) - ${n} of ${von} notes · over the fifth drone`,
    nachspielenVor: "Copy it with ",
    nachspielenMitte: " - ",
    laenge: (n: number): string => `Length ${n}`,
    tonVon: (i: number, von: number): string => `Note ${i} of ${von}`,
    oktaveNach: (oktave: string): string => ` Octave (${oktave})`,
    oktaveRauf: "Octave up",
    oktaveRunter: "Octave down",
    freiGeschafft: (n: number): string =>
      `Lovely playing - ${n} notes! You have visited the workshop. Press ‘Keep practising’ to carry on playing.`,
    falscherTon: (gespielt: string, gesucht: string): string => `That was ${gespielt} - we need ${gesucht}.`,
    nichtsMehr: "nothing more",
    memoryWeiter: (n: number): string => `Done - ${n} notes! One more is coming.`,
    memoryEnde: (best: number): string =>
      `Run over - you got ${best} ${best === 1 ? "note" : "notes"} in a row. I will play the sequence once more.`,
    genauRichtig: "Exactly right!",
    fertig: "Finished.",
  },

  schreiben: {
    aria: (zelle: number, von: number): string =>
      `Braille input: f d s and j k l are the dots, the space bar is the bar line. Cell ${zelle} of ${von}. Hold Shift to show and hear the keys for the cell.`,
    nochmalAnhoeren: "Listen again",
    diktat: "Listen as often as you like - it does not count as a mistake. Then write what you heard, cell by cell.",
    vor: "Write with ",
    mitte: (zelle: number, von: number): string => ` - cell ${zelle} of ${von} · `,
    umschalt: "⇧ Shift",
    nach: " shows the cell",
    taktstrichTitel: "Bar line (space bar)",
    gedrueckt: (punkte: string): string => `Held down: dots ${punkte}`,
    aktuelleStelleLeertaste: "Current place: the space bar - the bar line.",
    genauRichtig: "Exactly right!",
    fertig: "Finished.",
  },

  takt: {
    aria: (n: number): string =>
      `Bar builder: write notes or rests with f d s j k l; each one sounds straight away. Backspace deletes the last cell, Enter checks the bar. So far ${n} cells.`,
    vor: "Build the bar with ",
    mitte: " - each note or rest sounds. ",
    loescht: " deletes, ",
    pruefen: (a: number, b: number): string => ` checks. Time signature ${a}/${b}.`,
    nochLeer: "Still empty - off you go.",
    taktPruefen: "Check bar (Enter)",
    loeschen: "Delete (⌫)",
    pause: "Rest",
    nominativ: (dativ: string): string => dativ,
    pauseAus: (_notenwort: string, pausenwort: string): string => pausenwort,
    keineZelle: "That is not a note or rest cell. Use a note (f d s j k l) or a rest.",
    alsGelesen: (wert: string): string => ` - read as a ${wert} because that still fits`,
    zusammen: (label: string, ambi: string, summe: string, ganz: string, einheit: string): string =>
      `${label}${ambi}. Together ${summe} of ${ganz} ${einheit}.`,
    letzteGeloescht: (anzahl: string, einheit: string): string => `Last cell deleted. Now: ${anzahl} ${einheit}.`,
    fehlen: (einzahl: boolean, anzahl: string, einheit: string): string =>
      `There ${einzahl ? "is" : "are"} still ${anzahl} ${einheit} missing before the bar is full.`,
    zuViel: (_einzahl: boolean, anzahl: string, einheit: string): string =>
      `That is ${anzahl} ${einheit} too many. Take something away.`,
    mindestensNoten: (n: number): string => `The bar is full, but it needs at least ${n} notes.`,
    mindestensPause: "The bar is full - but it needs at least one rest.",
    voll: "Full bar! Listen to it.",
    vollSauber: "Exactly full - a clean bar! Listen to it.",
  },

  werkstatt: {
    aria: (zellen: number, werke: number): string =>
      `Composing workshop: write freely with f d s j k l, the space bar is the bar line. Use the buttons to listen, delete and save. So far ${zellen} cells, ${werke} of 5 pieces saved.`,
    vor: "Write freely with ",
    mitte: " - space bar = bar line, ",
    nach: " deletes the last cell.",
    leeresBlatt: "Empty page - just start composing.",
    anhoeren: "Listen",
    loeschen: "Delete",
    nameFuerWerk: "Name for your piece",
    speichern: "Save",
    nochNichtsGeschrieben: "Nothing written yet - write a few notes first.",
    geleert: "Workshop cleared.",
    schonFuenf: "You have already saved five pieces. Delete one and then it works again.",
    nochNichtsSpeichern: "Nothing to save yet.",
    meinWerk: (n: number): string => `My piece ${n}`,
    gespeichert: (name: string, n: number): string => `“${name}” saved. You now have ${n} of 5 pieces.`,
    gespeicherteListe: (namen: string, n: number): string => `Saved: ${namen} (${n} of 5)`,
  },

  notenzeile: {
    handFokus: {
      rh: "Right hand only (top, treble clef)",
      lh: "Left hand only (bottom, bass clef)",
      both: "Both hands",
    },
    rechteHand: "Right hand · treble clef",
    linkeHand: "Left hand · bass clef",
  },

  touch: {
    gruppe: "Input by touch",
    anleitungVor: "Tap the dots of the cell, then ",
    zelleSetzen: "Set cell",
    anleitungNach: ".",
    punkteGruppe: "The six dots of a cell",
    punkt: (p: number): string => `Dot ${p}`,
    taktstrich: "Bar line",
    pause: "Rest",
    letzteLoeschen: "Delete last cell",
    taktPruefen: "Check bar",
    bsiTitel: "VoiceOver braille screen input",
    bsiHinweis:
      "Set the rotor to braille screen input and type the cells into this field. Swiping right with one finger is the bar line, swiping left deletes the last cell.",
    testen: "Test braille input - what arrives?",
    nochNichts: "Nothing entered yet.",
    verlauf: (text: string, codepoints: string, ergebnis: string): string => `“${text}” (${codepoints}) → ${ergebnis}`,
    keineZelleErkannt: "no cell recognised",
    nochKeinPunkt: "No dot chosen yet. Tap the dots first, then Set cell.",
    unbekannt: (zeichen: string): string =>
      `I cannot read the character ${zeichen} as dots. Use the dot buttons.`,
  },
};
