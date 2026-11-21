/**
 * Punktgenau på svenska - gränssnittet (Bauplan 2026-11-06 §4, Schritt 3, Schwedisch).
 *
 * ★ Dieselben Bereiche und Schlüssel wie `fr.ts` (der Typ `PgTexte` kommt von dort).
 * ★ Anrede: Punktgenau ist für Kinder - „du", wie Tastenflow auf Schwedisch (`typing/curriculumSv.ts`).
 *   Das Schwedische hat keine Höflichkeitsform: wo die Oberfläche auch Erwachsene anspricht
 *   („address" = "sie"), steht ebenfalls „du".
 * ★ Schreibregeln: nur „-" (kein „—"), echte Buchstaben å ä ö, Person zuerst, keine Maus-Wörter
 *   („tryck på / välj / aktivera", nie „klicka").
 * ★ Wörter wie die Norm (Svenska skrivregler för punktskrift, 2009): „punktskrift", „cell",
 *   „punkt 1-2-4", „siffertecken", „versaltecken"; Tastennamen wie `tastenErklaerungSv.ts`
 *   (Skift, Mellanslag, Retur).
 * ★ Von keiner Person mit Schwedisch als Erstsprache gelesen (offene Frage im Befund).
 * ★ Nicht übersetzt (bleibt deutsch, im Schwedisch-Modus nicht erreichbar oder gesondert): Konto,
 *   Klassen, Lehrkraft, Statistik, Challenge, Klassenmatch, Abzeichen-Regal, Wochenaufgabe.
 */
import type { PgTexte } from "./index";

/** Das Schwedische kennt kein „Sie": beide Anreden sind dasselbe „du". */
const adresse = (_a: "du" | "sie", du: string, _sie?: string): string => du;

const plural = (n: number, eins: string, mehr: string): string => (n > 1 ? mehr : eins);

export const sv: PgTexte = {
  /** Kopfzeile der Seite (`PunktgenauPage`). */
  kopf: {
    zeichenliste: "Teckenlista",
    zeichenlisteTipp: "Lista över alla tecken i det här området (Alt + L)",
    logoBeschreibung:
      "Punktgenaus logotyp: en rödlila bricka med rundade hörn. Inuti en stor vit P; i P:ets lodräta streck tre mörkblå punkter under varandra, i bågen en fjärde - tillsammans punktskriftens punkter för bokstaven p.",
    klangUndVorlesen: "Ljud och uppläsning",
    klangTipp: (alt: string) => `Ställ in ljud och uppläsning (${alt} slår på eller av uppläsningen)`,
    titelHilfe: "Punktgenau - Hjälp",
    titelKurztasten: "Kortkommandon",
    vorlesenAn: "Uppläsningen är på.",
    vorlesenAnKurz: "Uppläsning på.",
    vorlesenAus: "Uppläsningen är av.",
    vorlesenAusKurz: "Uppläsning av.",
    macHinweis: "Alt + tangent - på Mac: Alternativ-tangenten (⌥) + tangent.",
    screenreaderHinweis: (alt: string) =>
      `Har du redan en skärmläsare (NVDA, VoiceOver)? Låt då uppläsningen (${alt}) vara av: skärmläsaren läser redan upp alla meddelanden.`,
  },

  /** Kopfleiste in `Punktgenau.tsx`: Rang, Etappe, Richtung. */
  leiste: {
    rang: "Rang",
    rangAria: (stufe: number, rest: number) => `Rang ${stufe} - ${rest} XP kvar till nästa.`,
    stufe: "Nivå",
    abzeichen: "Märken",
    heute: "Idag",
    heuteGeuebt: (zeit: string) => `Övat idag: ${zeit}.`,
    richtung: "Övningsriktning",
    schreiben: "Skriva",
    lesen: "Läsa",
    schrift: "Skrift:",
    schriftWahl: "Välj punktskriftssystem (område)",
    etappeZurueck: "Föregående etapp",
    etappeWeiter: "Nästa etapp",
    etappeWahl: "Välj ett kapitel (etapp) - bläddra med pil upp och pil ned",
    gemeistert: " - klar",
    gesperrt: " - ännu låst",
    etappeOption: (nr: number, titel: string, marke: string) => `Etapp ${nr}: ${titel}${marke}`,
    tipp: {
      rang: "Rang - hur långt du har kommit totalt. Den växer med dina XP.",
      xp: "XP - 2 för varje rätt övning, 30 för varje avklarad etapp.",
      sterne: "Stjärnor - upp till 3 per etapp, efter hur säker du har blivit.",
      stufe: "Nivå - hur svåra övningarna är just nu. Den anpassar sig efter dig, du ställer inte in den.",
      schreiben: "Skriva - du får ett ord och skriver det i punktskrift.",
      lesen: "Läsa - du får punktskrift och skriver ordet med vanliga bokstäver.",
      schrift: "Skrift - det punktskriftssystem du övar på. Alt + 1 tar dig direkt dit.",
      etappenListe: "Etapp - den del du övar på. Bläddra med pil upp och pil ned.",
      etappeZurueck: "En etapp bakåt",
      etappeWeiter: "En etapp framåt",
      wochenaufgabe: "Veckouppgift - det som din lärare har bett dig göra den här veckan och hur det går.",
      abzeichen: "Märken - dina intjänade märken och dina nästa mål.",
      uebezeit: "Tid du har övat idag. Skrivandet och läsandet i dina övningar räknas, inte väntan mellan dem.",
    },
    bereichAnsage: (label: string, nr: number, von: number, titel?: string) =>
      `${label}, etapp ${nr} av ${von}${titel ? `: ${titel}` : ""}.`,
    neuesAbzeichen: (name: string, beschreibung: string) => `Nytt märke: ${name}. ${beschreibung}`,
    geschafft: (letzte: boolean) => `Punktgenau! +30 XP${letzte ? " · området är klart!" : " · nästa etapp är öppen"}`,
    zeichenlisteAnsage: (auf: boolean) => (auf ? "Teckenlistan är öppen." : "Teckenlistan är stängd."),
    einstellungenAnsage: (auf: boolean) => (auf ? "Inställningarna är öppna." : "Inställningarna är stängda."),
    abzeichenAnsage: (auf: boolean) => (auf ? "Märkena är öppna." : "Märkena är stängda."),
    kapitelAuswahlAnsage: "Val av kapitel. Med pil upp och pil ned bläddrar du bland etapperna.",
    schreibenAnsage: "Skriva.",
    lesenAnsage: "Läsa.",
    grossAnsage: (an: boolean) => (an ? "Versaltecknet är på." : "Versaltecknet är av."),
  },

  /** Übungsfläche (`BrailleTrainer.tsx`). */
  trainer: {
    rundeWort: "Omgång",
    pause: "Paus - Alt+P för att fortsätta",
    eingabefeld: "Inmatningsfält för punktskrift",
    tasten: "Tangenter:",
    tastenRegel: "tryck på alla samtidigt och släpp. När cellen är rätt kommer nästa av sig själv.",
    altW: "Alt och W",
    leertaste: "Mellanslag",
    leertasteBedeutung: "mellanrum mellan två ord",
    loeschen: "ta bort den sista cellen",
    meineTasten: "Mina tangenter: de nya tecknen i den här etappen",
    meineTastenKurz: "Mina tangenter:",
    schreibPrompt: (a: "du" | "sie") => adresse(a, "Skriv i punktskrift:"),
    schreibHilfe:
      "Tryck samtidigt på tangenterna f d s och j k l och släpp: det blir en cell. När cellen är rätt kommer nästa av sig själv. Mellanslag mellan orden, backsteg för att ta bort. Håll ned Skift för att höra nästa cell.",
    aktuelleStelleLeer: "Aktuell plats: mellanrum - avståndet mellan två ord.",
    aktuelleStelleAria: "aktuell plats: tryck på mellanslagstangenten",
    richtigesZeichenLabel: (punkte: string) => `rätt tecken: ${punkte} - för att upprepa`,
    aktuelleZelle: "aktuell cell",
    aktuelleZelleKopf: (nr: number, von: number) => `Aktuell cell (${nr} av ${von}):`,
    lueckeKlammer: "(mellanrum)",
    richtigesZeichen: "Det är rätt tecken - skriv det du också.",
    geschafftWeiter: "Klart! Vidare …",
    weiter: "Vidare …",
    lesenAufgabe: "Läs och skriv ordet.",
    frage: (a: "du" | "sie") => adresse(a, "Vad står det? Skriv det med vanliga bokstäver:"),
    liesPrompt: (a: "du" | "sie") => adresse(a, "Läs punktskriften:"),
    vorlageAria: "Punktskriftsförlaga, cell för cell",
    vorlageHinweis: (altW: string) =>
      `Punktskriftsförlagan står rakt ovanför inmatningsfältet - läs den cell för cell. ${altW} upprepar den.`,
    richtigGelesenAria: (frage: string) => `Rätt läst. ${frage}`,
    loesung: (a: "du" | "sie") => adresse(a, "Ditt svar …"),
    pruefen: "Kontrollera",
    richtigGelesen: "Rätt läst! Vidare …",
    richtigWaere: "Rätt svar:",
    richtigWaereAria: (prompt: string) => `Rätt svar: ${prompt}. Igen`,
    nochmal: "Igen",
    runde: (gemeistert: boolean, geschafft: number, gesamt: number, rest: number) =>
      gemeistert
        ? "Omgången är klar - etappen är avklarad."
        : `Omgång: ${geschafft} rätta övningar av minst ${gesamt}` +
          (rest > 0 ? `, minst ${rest} kvar.` : ", etappen blir strax avklarad."),
    stufeAria: (n: number, max: number, prozent: number) =>
      `Nivå ${n} av ${max} - anpassar sig efter din säkerhet. Etappen är behärskad till ${prozent} procent.`,
    geschafft: "Klart - nu kan du det!",
    sterne: (n: number) => `${n} ${plural(n, "stjärna", "stjärnor")} av 3`,
    zuverlaessig: (titel: string) => `${titel}: känns igen med säkerhet.`,
    naechsteFrei: "Nästa etapp är nu öppen.",
    weiterUeben: "Du kan fortsätta öva.",
    geschafftAria1: "Klart, nu kan du det. Fortsätt öva",
    weiterUebenKnopf: "Fortsätt öva",
    geschafftAria2: "Klart, nu kan du det. Nästa etapp",
    naechstesLevel: "Nästa etapp →",
    neueZeichen: "Nya tecken i den här etappen",
    doppelpunkt: ":",
    // Texte (ganze Texte)
    textKopf: "Text",
    textWort: (nr: number, von: number) => `Ord ${nr} av ${von}`,
    textNr: (nr: number, von: number) => `Text ${nr} av ${von}`,
    geschriebeneZellen: "Skrivna celler, cell för cell",
    textHilfe:
      "Tryck samtidigt på punkttangenterna och släpp; mellan två ord mellanslagstangenten. Med backsteg kan du rätta - ett fel räknas ändå.",
    textSchreiben: "Skriv texten i punktskrift",
    hierTippen: "Skriv här … Tryck samtidigt på punkttangenterna och släpp.",
    textGeschafft: "Texten är klar!",
    textErgebnis: (fehler: number, zeit: string, zeichen: number) =>
      `${fehler === 0 ? "Inga fel" : `${fehler} ${plural(fehler, "fel", "fel")}`} · tid ${zeit} · ${zeichen} tecken`,
    textErgebnisSatz: (fehler: number) =>
      `Texten är klar. ${fehler === 0 ? "Inga fel" : `${fehler} ${plural(fehler, "fel", "fel")}`}.`,
    gleichenText: "Upprepa samma text",
    naechsterTextOhnePfeil: "Nästa text",
    naechsterText: "Nästa text →",
    textLesenAufgabe: "Läs texten och skriv den.",
    allesRichtigSatz: "Allt rätt läst.",
    wortSatz: (richtig: number, von: number) => `${richtig} rätta ord av ${von}.`,
    wortSatzKurz: (richtig: number, von: number) => `${richtig} rätta ord av ${von}`,
    textLiesPrompt: (a: "du" | "sie") => adresse(a, "Läs hela texten och skriv den med vanliga bokstäver:"),
    textLoesung: (a: "du" | "sie") => adresse(a, "Ditt svar (hela texten):"),
    textPlatzhalter: "Skriv den lästa texten här …",
    allesRichtig: "Allt rätt läst!",
  },

  /** Ansagen (`announce.ts`). */
  announce: {
    lesenAufgabe: "Läs och skriv ordet.",
    und: "och",
    richtig: "Rätt.",
    leertaste: "Mellanslagstangenten.",
    /** Zusatz hinter den Punkten der Soll-Zelle (Fehler-Tipp). */
    unterschied: (fehlt: number[], zuViel: number[]): string => {
      const pos: Record<number, string> = {
        1: "uppe till vänster", 2: "i mitten till vänster", 3: "nere till vänster",
        4: "uppe till höger", 5: "i mitten till höger", 6: "nere till höger",
        7: "längst ned till vänster", 8: "längst ned till höger",
      };
      if (fehlt.length === 1 && zuViel.length === 0) return `. Punkt ${fehlt[0]} saknas - ${pos[fehlt[0]]}.`;
      if (zuViel.length === 1 && fehlt.length === 0) return `. Punkt ${zuViel[0]} är för mycket - ${pos[zuViel[0]]}.`;
      const teile: string[] = [];
      if (fehlt.length) teile.push(fehlt.length === 1 ? `punkt ${fehlt[0]} saknas` : `punkterna ${fehlt.join(", ")} saknas`);
      if (zuViel.length) teile.push(zuViel.length === 1 ? `punkt ${zuViel[0]} är för mycket` : `punkterna ${zuViel.join(", ")} är för mycket`);
      if (!teile.length) return "";
      const satz = teile.join(" och ");
      return `. ${satz.charAt(0).toUpperCase()}${satz.slice(1)}.`;
    },
    stern: (n: number) => `En stjärna till - ${n} av 3.`,
    schneller: "Du blir snabbare.",
    freischaltung: (titel: string) => `Bra! En ny dörr öppnas: ${titel}.`,
    levelDone: (sterne: number, naechster?: string) =>
      `Klart! ${sterne} ${plural(sterne, "stjärna", "stjärnor")} av 3.` + (naechster ? ` Härnäst: ${naechster}.` : ""),
    textDone: (fehler: number) => (fehler === 0 ? "Texten är klar. Inga fel." : `Texten är klar. ${fehler} fel.`),
    cellHint: (tasten: string, punkte: string) => `Aktuell cell: ${tasten}. ${punkte}.`,
    pause: "Paus. Tryck på Alt och P för att fortsätta.",
    keineNeuenZeichen: "Här finns inga nya tecken.",
  },

  /** Hilfe-Fenster (kurz; die deutsche Hilfe erklärt das deutsche System). */
  hilfe: {
    tastaturTitel: "Tangentbordet som punktskriftsmaskin",
    tastaturText:
      "Sex tangenter motsvarar de sex punkterna i en punktskriftscell. Trycker du på flera tangenter samtidigt får du ett tecken:",
    punkteLinks: "punkt 1, 2, 3 (till vänster)",
    punkteRechts: "punkt 4, 5, 6 (till höger)",
    leertasteAlsLuecke: "mellanrum",
    zeichenErklaerung: [
      { zeichen: "␣", bedeutung: "här är ett mellanrum - du trycker på mellanslagstangenten." },
      { zeichen: "·", bedeutung: "skiljer två tangenter eller två uppgifter som hör ihop." },
      { zeichen: "⌫", bedeutung: "backsteg - tar bort den sista cellen." },
      { zeichen: "→", bedeutung: "sedan, eller: det här blir resultatet." },
    ] as Array<{ zeichen: string; bedeutung: string }>,
    zeichenTitel: "De här tecknen finns i texten",
    warumTitel: "Vad är en punktskriftsskärm bra för?",
    warumText:
      "Punktskrift är en känselskrift: den läses med fingertopparna, inte med ögonen. På skärmen ser du punkterna; det hjälper dig att skriva och känna igen formerna. Men punktskrift lär man sig läsa på riktigt först när man känner punkterna. En punktskriftsskärm lyfter små stift under varje cell, så att tecknet kan kännas. Punktgenau kan styra en ansluten punktskriftsskärm där webbläsaren tillåter det.",
    bereicheTitel: "Område och etapper",
    bereicheText:
      "Området högst upp är «Svensk punktskrift»: varje bokstav skrivs i en egen cell, utan några förkortningar. Etapperna kommer efter varandra: varje etapp ger nya tecken och öppnar nästa först när den är väl behärskad.",
    reihenfolgeTitel: "Varför den här ordningen på bokstäverna?",
    reihenfolgeText:
      "Bokstäverna kommer i den ordning de är vanliga i svenskan (Practical Cryptography): e, a, n, r, t, s, i, l, d, o … Då dyker riktiga ord upp mycket tidigt. Versaler, skiljetecken och siffror kommer sedan; é kommer sist bland bokstäverna. Övningsorden kommer från Tastenflows texter på svenska.",
    normTitel: "Vilken norm?",
    normText:
      "Tecknen följer Svenska skrivregler för punktskrift, andra upplagan 2009, utgiven av Punktskriftsnämnden (MTM) tillsammans med Språkrådet. Siffror skrivs med siffertecknet (punkt 3-4-5-6) och bokstäverna a till j. I den här versionen finns inga förkortningar.",
    kontoTitel: "Konto och framsteg",
    kontoText: "Utan att logga in sparas dina framsteg på den här enheten.",
    tastenkombinationen: "Kortkommandon",
  },

  /** Tastenkürzel (`ShortcutList`). */
  kurztasten: [
    ["Esc", "Stänger allt som är öppet - hjälp, kortkommandon, teckenlista - och markören går alltid tillbaka till övningsfältet. Även när inget är öppet tar Esc dig tillbaka till övningen"],
    ["Alt + 1", "Området «Svensk punktskrift»"],
    ["Alt + E", "Markören till övningsfältet (samma mål som Esc, utan att stänga något)"],
    ["Alt + U", "Gå till kapitelvalet - bläddra sedan med ↑ ↓"],
    ["Alt + W", "Upprepa övningen"],
    ["Skift, två gånger i rad", "Upprepa övningen, som Alt + W"],
    ["Alt + M", "Gå till «Mina tangenter» (nya tecken i den här etappen)"],
    ["Alt + Z", "Läs upp omgången: hur många övningar du har klarat och hur många som återstår - Esc tar dig tillbaka till inmatningsfältet"],
    ["Alt + L", "Teckenlista: öppna / stäng alla tecken i området"],
    ["Alt + O", "Inställningar: öppna / stäng"],
    ["Alt + P", "Paus på / av - i Klassenmatch: läs upp alla placeringar"],
    ["Alt + V", "Uppläsning på / av"],
    ["Alt + K", "Färger och kontrast: öppna / stäng"],
    ["Alt + J", "Mitt konto: öppna / stäng"],
    ["Alt + H", "Hjälp: öppna / stäng"],
    ["Alt + T", "Lista över kortkommandon: öppna / stäng"],
    ["Alt + +", "Större övningsyta"],
    ["Alt + −", "Mindre övningsyta"],
    ["Alt + 0", "Normal storlek (tillbaka till 100 %)"],
    ["⇧ Skift", "Hållen nedtryckt: visar och säger tangenterna för den aktuella cellen"],
  ] as Array<[string, string]>,

  /** Zeichenliste (`BrailleZeichenliste.tsx`). */
  zeichenliste: {
    leereZelle: "tom cell",
    ansage: (bereich: string, nr?: number, titel?: string) =>
      `Teckenlistan ${bereich} är öppen.` + (titel ? ` Du är i etapp ${nr}: ${titel}.` : ""),
    titel: (bereich: string) => `Alla tecken - ${bereich}`,
    einfuehrung:
      "Listan följer exakt din väg: etapp för etapp, i den ordning tecknen kommer. Du är i den etapp du övar på just nu.",
    suchen: "Sök ett tecken:",
    platzhalter: "t.ex. å, ö, eller punkter som 1, 4",
    keineTreffer: "Inga träffar.",
    einTreffer: "1 träff.",
    treffer: (n: number) => `${n} träffar.`,
    etappe: (nr: number, titel: string, aktuell: boolean, fertig: boolean) =>
      `Etapp ${nr}: ${titel}${aktuell ? " - du är här" : fertig ? " - klar" : ""}`,
    laedt: "Laddar punkterna …",
    keineEigenen: "Det här området ger inga egna tecken.",
  },

  /** Einstellungen (`PunktgenauEinstellungen.tsx`). */
  einstellungen: {
    titel: "Inställningar - Punktgenau",
    zurueck: "Tillbaka till övningen",
    grossTitel: "Versaltecken",
    grossHinweis:
      "Före varje stor bokstav står en varningscell (punkt 6). Du kan stänga av den och slå på den igen senare.",
    grossAn: "Versaltecknet är på",
    grossAus: "Versaltecknet är av",
    klasse: (an: boolean) =>
      `Din lärare ställer in det för klassen. Versaltecknet är just nu ${an ? "på" : "av"}.`,
    klangTitel: "Ljud och uppläsning",
    klangText: (alt: string) =>
      `Uppläsning, hastighet, röst, hjälp vid fel, ljud och volym ställer du in i menyn under högtalaren i sidhuvudet. ${alt} slår direkt på eller av uppläsningen.`,
  },

  /** Meine Verwechslungen (`PunktgenauPage`, `BrailleConfusionPanel.tsx`). Merktipps nur für die Buchstaben;
   *  die deutschen Kurzschrift-Tipps (un/und, ei/ie …) gibt es hier nicht. */
  verwechslungen: {
    knopfZeigen: "▼ Visa mina förväxlingar",
    knopfAusblenden: "▲ Dölj mina förväxlingar",
    laedt: "Laddar förväxlingarna …",
    leerLehrkraft: "Inga förväxlingar registrerade än.",
    leerKind: "Du har inte förväxlat något tecken än. Bra jobbat!",
    listeName: "Mina förväxlingar",
    zeile: (prozent: number, mit: string) => `${prozent} % fel, förväxlat med ${mit}.`,
    tipp: "Tips:",
    tabelleName: "Förväxlingsmatris",
    tabelleBeschreibung: "Förväxlingsmatris: rätt tecken, andel fel och vanligaste förväxlingar",
    spalteSoll: "Rätt tecken",
    spalteQuote: "Andel fel",
    spalteMit: "Förväxlat med",
    spalteTipp: "Tips",
    merktipps: {
      "d|f": "d och f har båda punkt 1 och 4 - d har dessutom punkt 5 (till höger), f punkt 2 (till vänster).",
      "e|i": "e sitter högt (punkt 1·5), i sitter längre ner (punkt 2·4).",
      "r|w": "r är punkt 1·2·3·5, w är punkt 2·4·5·6 - w är udda och kommer allra sist.",
      "m|u": "m sitter högt (punkt 1·3·4), u sitter längst ner (punkt 1·3·6).",
      "h|j": "h är punkt 1·2·5, j är punkt 2·4·5 - j glider åt höger.",
      "n|z": "n är punkt 1·3·4·5, z är punkt 1·3·5·6.",
    },
  },
};
