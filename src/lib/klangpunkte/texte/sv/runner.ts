/** Bereich `runner` - Svenska. */
import type { runner as De } from "../de/runner";

export const runner: typeof De = {
  kopf: {
    anhoeren: "Lyssna",
    stopp: "Stopp",
    anhoerenTitel: "Lyssna på uppgiften (Alt + W läser också upp den)",
    instrument: "Instrument",
    namenKnopf: "do-re-mi",
    namenTitel: (a: string, b: string): string => `Tonnamn som ${a} (fast do) i stället för ${b}`,
    rhythmusKnopf: "ta ti-ti",
    rhythmusTitel: "Rytmord: säg också ta, ti-ti efter notvärdena",
    anderesLied: "En annan sång",
    namenAn: (a: string, b: string, c: string): string => `Tonnamn: ${a}, ${b}, ${c}.`,
    rhythmusAn: "Rytmord på: ta, ti-ti.",
    rhythmusAus: "Rytmord av.",
    zurueckLiedauswahl: "Tillbaka till sångvalet.",
  },

  aufgabe: {
    liesBrailleZeile: "Läs punktskriftsraden.",
    handNurKlavier: "Att byta hand fungerar bara i pianokapitlet med två system.",
    weiter: (prompt: string): string => `Fortsätt. ${prompt}`,
    zeichenlisteHinweis: "Alla musiktecken i det här kapitlet finns i teckenlistan: Alt och L.",
    songGanzGeschafft: (titel: string): string => `${titel} - helt klart!`,
    songZeile: (zeile: number, von: number): string => ` · Rad ${zeile} av ${von}`,
  },

  geschafft: {
    geschafft: "Klart!",
    mitSternen: (n: number): string => `Klart! ${n} av 3 stjärnor.`,
    alsNaechstesAnsage: (titel: string): string => ` Nästa: ${titel}.`,
    alsNaechstesKarte: (titel: string): string => `Nästa: ${titel}`,
    weiterUeben: "Fortsätt öva",
    weiter: "Nästa",
  },
  fortschritt: {
    caption: "Övning",
    aria: (n: number, min: number, prozent: number): string =>
      `Framsteg i kapitlet: ${n} av minst ${min} uppgifter, ${prozent} procent klart.`,
    rundeGeschafft: "Rundan klar - kapitlet sitter säkert.",
    runde: (n: number, min: number, noch: number): string =>
      `Runda: ${n} av minst ${min} uppgifter klara` +
      (noch > 0 ? `, minst ${noch} kvar.` : ", kapitlet sitter nästan säkert."),
  },

  lieder: {
    kinder: "🧒 Barnvisor",
    erwachsene: "🎼 Klassiskt & evergreens",
  },

  hand: {
    hinweis: (f: "both" | "rh" | "lh"): string =>
      " - se och hör en hand för sig, stor (" +
      (f === "rh"
        ? "nu: bara högerhanden"
        : f === "lh"
          ? "nu: bara vänsterhanden"
          : "nu: båda händerna") +
      ")",
  },

  wahl: {
    richtig: "Rätt!",
    richtigWaere: (antwort: string): string => `Rätt svar är: ${antwort}.`,
    antworten: "Svar (du kan också trycka på siffertangenterna 1 till 4)",
  },

  tap: {
    aria: (n: number): string => `Klappa rytmen: mellanslagstangenten. Hittills ${n} klappar.`,
    vor: "Klappa här med ",
    stark: "mellanslagstangenten",
    nach: (n: number, von: number): string => ` - ${n} av ${von} klappar`,
    knopf: (n: number, von: number): string => `Klappa (${n} av ${von})`,
    puls: "Inte riktigt jämnt än - känn pulsen och håll den lugn.",
    kurz: "kort",
    lang: "lång",
    fast: (muster: string): string => `Nästan! Mönstret var: ${muster}. Lyssna en gång till.`,
    genauImPuls: "Precis på pulsen!",
    genauImTakt: "Precis i takt!",
  },

  spielen: {
    ariaKlaviatur: (namen: string): string =>
      `Tangentbord för att spela efter: D F G H J K L är ${namen}. Pilarna upp och ner ändrar oktaven. `,
    ariaFrei: (n: number, von: number): string => `Spela fritt över bordunen - ${n} av ${von} toner. `,
    ariaMemory: (laenge: number): string => `Nuvarande längd ${laenge} toner. `,
    ariaTon: (i: number, von: number): string => `Ton ${i} av ${von}. `,
    ariaLesen:
      "Läskonsert: läs punktskriftsraden. Tryck på Enter eller ‘Klar med läsningen’ när du har den i huvudet.",
    lesenVor: "Läs raden i punktskrift - den kommer att ",
    lesenStark: "inte",
    lesenMitte: " spelas. När du har den i huvudet, tryck på ",
    lesenNach: " eller ‘Klar med läsningen’.",
    fertigGelesen: "Klar med läsningen",
    nachLesen: "Spela den nu utantill - D F G H J K L, pilarna ändrar oktaven.",
    freiVor: "Spela fritt med ",
    freiNach: (n: number, von: number): string => ` (pentatoniskt) - ${n} av ${von} toner · över kvintbordunen`,
    nachspielenVor: "Spela efter med ",
    nachspielenMitte: " - ",
    laenge: (n: number): string => `Längd ${n}`,
    tonVon: (i: number, von: number): string => `Ton ${i} av ${von}`,
    oktaveNach: (oktave: string): string => ` Oktav (${oktave})`,
    oktaveRauf: "Oktav upp",
    oktaveRunter: "Oktav ned",
    freiGeschafft: (n: number): string =>
      `Fint spelat - ${n} toner! Du har besökt verkstaden. Tryck på ‘Fortsätt öva’ för att spela vidare.`,
    falscherTon: (gespielt: string, gesucht: string): string => `Det var ${gespielt} - vi behöver ${gesucht}.`,
    nichtsMehr: "inget mer",
    memoryWeiter: (n: number): string => `Klart - ${n} toner! Det kommer en till.`,
    memoryEnde: (best: number): string =>
      `Slut - du fick ${best} ${best === 1 ? "ton" : "toner"} i rad rätt. Jag spelar följden en gång till.`,
    genauRichtig: "Helt rätt!",
    fertig: "Klart.",
  },

  schreiben: {
    aria: (zelle: number, von: number): string =>
      `Punktskriftsinmatning: f d s och j k l är punkterna, mellanslagstangenten är taktstrecket. Cell ${zelle} av ${von}. Håll ned Shift för att visa och höra tangenterna för cellen.`,
    nochmalAnhoeren: "Lyssna igen",
    diktat: "Lyssna så ofta du vill - det räknas inte som fel. Skriv sedan det du hörde, cell för cell.",
    vor: "Skriv med ",
    mitte: (zelle: number, von: number): string => ` - cell ${zelle} av ${von} · `,
    umschalt: "⇧ Shift",
    nach: " visar cellen",
    taktstrichTitel: "Taktstreck (mellanslagstangenten)",
    gedrueckt: (punkte: string): string => `Nedtryckt: punkter ${punkte}`,
    aktuelleStelleLeertaste: "Nuvarande plats: mellanslagstangenten - taktstrecket.",
    genauRichtig: "Helt rätt!",
    fertig: "Klart.",
  },

  takt: {
    aria: (n: number): string =>
      `Taktbyggaren: skriv noter eller pauser med f d s j k l; varje not hörs direkt. Backsteg tar bort den sista cellen, Enter kontrollerar takten. Hittills ${n} celler.`,
    vor: "Bygg takten med ",
    mitte: " - varje not eller paus hörs. ",
    loescht: " tar bort, ",
    pruefen: (a: number, b: number): string => ` kontrollerar. Taktart ${a}/${b}.`,
    nochLeer: "Fortfarande tomt - sätt igång.",
    taktPruefen: "Kontrollera takten (Enter)",
    loeschen: "Ta bort (⌫)",
    pause: "Paus",
    nominativ: (dativ: string): string => dativ,
    pauseAus: (_notenwort: string, pausenwort: string): string => pausenwort,
    keineZelle: "Det är ingen not- eller pausruta. Använd en not (f d s j k l) eller en paus.",
    alsGelesen: (wert: string): string => ` - läst som ${wert} eftersom det fortfarande passar`,
    zusammen: (label: string, ambi: string, summe: string, ganz: string, einheit: string): string =>
      `${label}${ambi}. Tillsammans ${summe} av ${ganz} ${einheit}.`,
    letzteGeloescht: (anzahl: string, einheit: string): string => `Sista cellen borttagen. Nu: ${anzahl} ${einheit}.`,
    fehlen: (_einzahl: boolean, anzahl: string, einheit: string): string =>
      `Det saknas fortfarande ${anzahl} ${einheit} innan takten är full.`,
    zuViel: (_einzahl: boolean, anzahl: string, einheit: string): string =>
      `Det är ${anzahl} ${einheit} för mycket. Ta bort något.`,
    mindestensNoten: (n: number): string => `Takten är full, men den behöver minst ${n} noter.`,
    mindestensPause: "Takten är full - men den behöver minst en paus.",
    voll: "Full takt! Lyssna på den.",
    vollSauber: "Precis full - en ren takt! Lyssna på den.",
  },

  werkstatt: {
    aria: (zellen: number, werke: number): string =>
      `Komponerverkstaden: skriv fritt med f d s j k l, mellanslagstangenten är taktstrecket. Använd knapparna för att lyssna, ta bort och spara. Hittills ${zellen} celler, ${werke} av 5 stycken sparade.`,
    vor: "Skriv fritt med ",
    mitte: " - mellanslag = taktstreck, ",
    nach: " tar bort den sista cellen.",
    leeresBlatt: "Tom sida - börja bara komponera.",
    anhoeren: "Lyssna",
    loeschen: "Ta bort",
    nameFuerWerk: "Namn på ditt stycke",
    speichern: "Spara",
    nochNichtsGeschrieben: "Inget skrivet än - skriv några noter först.",
    geleert: "Verkstaden rensad.",
    schonFuenf: "Du har redan sparat fem stycken. Ta bort ett, så fungerar det igen.",
    nochNichtsSpeichern: "Inget att spara än.",
    meinWerk: (n: number): string => `Mitt stycke ${n}`,
    gespeichert: (name: string, n: number): string => `“${name}” sparat. Du har nu ${n} av 5 stycken.`,
    gespeicherteListe: (namen: string, n: number): string => `Sparade: ${namen} (${n} av 5)`,
  },

  notenzeile: {
    handFokus: {
      rh: "Bara högerhanden (övre, violinnyckel)",
      lh: "Bara vänsterhanden (nedre, basnyckel)",
      both: "Båda händerna",
    },
    rechteHand: "Högerhand · violinnyckel",
    linkeHand: "Vänsterhand · basnyckel",
  },

  touch: {
    gruppe: "Inmatning med beröring",
    anleitungVor: "Tryck på rutans punkter och tryck sedan på ",
    zelleSetzen: "Sätt cell",
    anleitungNach: ".",
    punkteGruppe: "De sex punkterna i en cell",
    punkt: (p: number): string => `Punkt ${p}`,
    taktstrich: "Taktstreck",
    pause: "Paus",
    letzteLoeschen: "Ta bort sista cellen",
    taktPruefen: "Kontrollera takten",
    bsiTitel: "VoiceOver-inmatning för punktskrift",
    bsiHinweis:
      "Ställ rotorn på punktskriftsinmatning och skriv cellerna i det här fältet. Ett svep åt höger med ett finger är taktstrecket, ett svep åt vänster tar bort den sista cellen.",
    testen: "Testa punktskriftsinmatningen - vad kommer fram?",
    nochNichts: "Inget inmatat än.",
    verlauf: (text: string, codepoints: string, ergebnis: string): string => `“${text}” (${codepoints}) → ${ergebnis}`,
    keineZelleErkannt: "ingen cell känd igen",
    nochKeinPunkt: "Ingen punkt vald än. Tryck först på punkterna och tryck sedan på Sätt cell.",
    unbekannt: (zeichen: string): string =>
      `Jag kan inte läsa tecknet ${zeichen} som punkter. Använd punktknapparna.`,
  },
};
