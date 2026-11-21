/**
 * Punktgenau in het Nederlands - de interface (Bauplan 2026-11-06 §4, Schritt 3, Niederländisch).
 *
 * ★ Dieselben Bereiche und Schlüssel wie `fr.ts` (der Typ `PgTexte` kommt von dort).
 * ★ Anrede: Punktgenau ist für Kinder - „je", wie Tastenflow auf Niederländisch (`typing/curriculumNl.ts`).
 *   Wo die Oberfläche auch Erwachsene anspricht („address" = "sie"), steht „u".
 * ★ Schreibregeln: nur „-" (kein „—"), echte Akzente und Trema, Person zuerst, keine Maus-Wörter
 *   („druk op / kies / schakel in", nie „klik").
 * ★ Wörter wie die Norm (Braillestandaard 2019): „braille", „cel", „punt 1-2-4", „cijferteken", „hoofdletterteken",
 *   „etappe"; Tastennamen wie `tastenErklaerungNl.ts` (Shift, Spatiebalk, Backspace).
 * ★ Von keiner Person mit Niederländisch als Erstsprache gelesen (offene Frage im Befund).
 * ★ Nicht übersetzt (bleibt deutsch, im Niederländisch-Modus nicht erreichbar oder gesondert): Konto,
 *   Klassen, Lehrkraft, Statistik, Challenge, Klassenmatch, Abzeichen-Regal, Wochenaufgabe.
 */
import type { PgTexte } from "./index";

const adresse = (a: "du" | "sie", du: string, sie: string): string => (a === "du" ? du : sie);

const plural = (n: number, eins: string, mehr: string): string => (n > 1 ? mehr : eins);

export const nl: PgTexte = {
  /** Kopfzeile der Seite (`PunktgenauPage`). */
  kopf: {
    zeichenliste: "Tekenlijst",
    zeichenlisteTipp: "Lijst van alle tekens in dit onderdeel (Alt + L)",
    logoBeschreibung:
      "Het logo van Punktgenau: een roodpaars blokje met afgeronde hoeken. Erin een grote witte P; in de verticale streep van de P drie donkerblauwe punten onder elkaar, in de bocht een vierde - samen de braillepunten van de letter p.",
    klangUndVorlesen: "Geluid en voorlezen",
    klangTipp: (alt: string) => `Geluid en voorlezen instellen (${alt} zet het voorlezen aan of uit)`,
    titelHilfe: "Punktgenau - Help",
    titelKurztasten: "Sneltoetsen",
    vorlesenAn: "Het voorlezen staat aan.",
    vorlesenAnKurz: "Voorlezen aan.",
    vorlesenAus: "Het voorlezen staat uit.",
    vorlesenAusKurz: "Voorlezen uit.",
    macHinweis: "Alt + toets - op de Mac: de Option-toets (⌥) + toets.",
    screenreaderHinweis: (alt: string) =>
      `Heb je al een schermlezer (NVDA, VoiceOver)? Laat het voorlezen (${alt}) dan uit: de schermlezer leest alle meldingen al voor.`,
  },

  /** Kopfleiste in `Punktgenau.tsx`: Rang, Etappe, Richtung. */
  leiste: {
    rang: "Rang",
    rangAria: (stufe: number, rest: number) => `Rang ${stufe} - nog ${rest} XP tot de volgende.`,
    stufe: "Niveau",
    abzeichen: "Insignes",
    heute: "Vandaag",
    heuteGeuebt: (zeit: string) => `Vandaag geoefend: ${zeit}.`,
    richtung: "Richting van de oefening",
    schreiben: "Schrijven",
    lesen: "Lezen",
    schrift: "Schrift:",
    schriftWahl: "Kies het braillesysteem (onderdeel)",
    etappeZurueck: "Vorige etappe",
    etappeWeiter: "Volgende etappe",
    etappeWahl: "Kies een hoofdstuk (etappe) - blader met pijl omhoog en pijl omlaag",
    gemeistert: " - gehaald",
    gesperrt: " - nog op slot",
    etappeOption: (nr: number, titel: string, marke: string) => `Etappe ${nr}: ${titel}${marke}`,
    tipp: {
      rang: "Rang - hoe ver je in totaal bent. Hij groeit met je XP.",
      xp: "XP - 2 voor elke goede oefening, 30 voor elke gehaalde etappe.",
      sterne: "Sterren - tot 3 per etappe, naargelang hoe zeker je bent geworden.",
      stufe: "Niveau - hoe moeilijk de oefeningen nu zijn. Het past zich aan jou aan, jij stelt het niet in.",
      schreiben: "Schrijven - je krijgt een woord en schrijft het in braille.",
      lesen: "Lezen - je krijgt braille en schrijft het woord met gewone letters.",
      schrift: "Schrift - het braillesysteem dat je oefent. Alt + 1 brengt je er meteen heen.",
      etappenListe: "Etappe - het deel dat je oefent. Blader met pijl omhoog en pijl omlaag.",
      etappeZurueck: "Een etappe terug",
      etappeWeiter: "Een etappe vooruit",
      wochenaufgabe: "Weekopdracht - wat je leraar je deze week gevraagd heeft en hoe het gaat.",
      abzeichen: "Insignes - je verdiende medailles en je volgende doelen.",
      uebezeit: "Tijd die je vandaag geoefend hebt. Het schrijven en lezen in je oefeningen telt, het wachten tussendoor niet.",
    },
    bereichAnsage: (label: string, nr: number, von: number, titel?: string) =>
      `${label}, etappe ${nr} van ${von}${titel ? `: ${titel}` : ""}.`,
    neuesAbzeichen: (name: string, beschreibung: string) => `Nieuw insigne: ${name}. ${beschreibung}`,
    geschafft: (letzte: boolean) => `Punktgenau! +30 XP${letzte ? " · onderdeel klaar!" : " · volgende etappe open"}`,
    zeichenlisteAnsage: (auf: boolean) => (auf ? "Tekenlijst geopend." : "Tekenlijst gesloten."),
    einstellungenAnsage: (auf: boolean) => (auf ? "Instellingen geopend." : "Instellingen gesloten."),
    abzeichenAnsage: (auf: boolean) => (auf ? "Insignes geopend." : "Insignes gesloten."),
    kapitelAuswahlAnsage: "Hoofdstukkeuze. Met pijl omhoog en pijl omlaag blader je door de etappes.",
    schreibenAnsage: "Schrijven.",
    lesenAnsage: "Lezen.",
    grossAnsage: (an: boolean) => (an ? "Hoofdletterteken aan." : "Hoofdletterteken uit."),
  },

  /** Übungsfläche (`BrailleTrainer.tsx`). */
  trainer: {
    rundeWort: "Reeks",
    pause: "Pauze - Alt+P om door te gaan",
    eingabefeld: "Invoerveld voor braille",
    tasten: "Toetsen:",
    tastenRegel: "druk ze allemaal tegelijk in en laat los. Als de cel goed is, komt de volgende vanzelf.",
    altW: "Alt en W",
    leertaste: "Spatiebalk",
    leertasteBedeutung: "spatie tussen twee woorden",
    loeschen: "de laatste cel wissen",
    meineTasten: "Mijn toetsen: de nieuwe tekens van deze etappe",
    meineTastenKurz: "Mijn toetsen:",
    schreibPrompt: (a: "du" | "sie") => adresse(a, "Schrijf in braille:", "Schrijf in braille:"),
    schreibHilfe:
      "Druk tegelijk op de toetsen f d s en j k l en laat los: dat is één cel. Als de cel goed is, komt de volgende vanzelf. Spatiebalk tussen woorden, backspace om te wissen. Houd Shift ingedrukt om de volgende cel te horen.",
    aktuelleStelleLeer: "Huidige plaats: spatie - de afstand tussen twee woorden.",
    aktuelleStelleAria: "huidige plaats: druk op de spatiebalk",
    richtigesZeichenLabel: (punkte: string) => `juist teken: ${punkte} - om te herhalen`,
    aktuelleZelle: "huidige cel",
    aktuelleZelleKopf: (nr: number, von: number) => `Huidige cel (${nr} van ${von}):`,
    lueckeKlammer: "(spatie)",
    richtigesZeichen: "Dat is het juiste teken - schrijf het zelf ook.",
    geschafftWeiter: "Gelukt! Verder …",
    weiter: "Verder …",
    lesenAufgabe: "Lees en schrijf het woord.",
    frage: (a: "du" | "sie") =>
      adresse(a, "Wat staat er? Schrijf het met gewone letters:", "Wat staat er? Schrijf het met gewone letters:"),
    liesPrompt: (a: "du" | "sie") => adresse(a, "Lees de braille:", "Lees de braille:"),
    vorlageAria: "Braillevoorbeeld, cel voor cel",
    vorlageHinweis: (altW: string) =>
      `Het braillevoorbeeld staat vlak boven het invoerveld - lees het cel voor cel. ${altW} herhaalt het.`,
    richtigGelesenAria: (frage: string) => `Goed gelezen. ${frage}`,
    loesung: (a: "du" | "sie") => adresse(a, "Jouw antwoord …", "Uw antwoord …"),
    pruefen: "Controleren",
    richtigGelesen: "Goed gelezen! Verder …",
    richtigWaere: "Het juiste antwoord:",
    richtigWaereAria: (prompt: string) => `Het juiste antwoord: ${prompt}. Opnieuw`,
    nochmal: "Opnieuw",
    runde: (gemeistert: boolean, geschafft: number, gesamt: number, rest: number) =>
      gemeistert
        ? "Reeks klaar - de etappe is gehaald."
        : `Reeks: ${geschafft} goede oefeningen van minstens ${gesamt}` +
          (rest > 0 ? `, nog minstens ${rest}.` : ", de etappe is zo gehaald."),
    stufeAria: (n: number, max: number, prozent: number) =>
      `Niveau ${n} van ${max} - past zich aan je zekerheid aan. Etappe voor ${prozent} procent beheerst.`,
    geschafft: "Gelukt - nu kun je het!",
    sterne: (n: number) => `${n} ${plural(n, "ster", "sterren")} van 3`,
    zuverlaessig: (titel: string) => `${titel}: zeker herkend.`,
    naechsteFrei: "De volgende etappe is nu open.",
    weiterUeben: "Je kunt verder oefenen.",
    geschafftAria1: "Gelukt, nu kun je het. Verder oefenen",
    weiterUebenKnopf: "Verder oefenen",
    geschafftAria2: "Gelukt, nu kun je het. Volgende etappe",
    naechstesLevel: "Volgende etappe →",
    neueZeichen: "Nieuwe tekens in deze etappe",
    doppelpunkt: ":",
    // Texte (ganze Texte)
    textKopf: "Tekst",
    textWort: (nr: number, von: number) => `Woord ${nr} van ${von}`,
    textNr: (nr: number, von: number) => `Tekst ${nr} van ${von}`,
    geschriebeneZellen: "Geschreven cellen, cel voor cel",
    textHilfe:
      "Druk tegelijk op de puntentoetsen en laat los; tussen twee woorden de spatiebalk. Met backspace kun je verbeteren - een fout telt toch mee.",
    textSchreiben: "De tekst in braille schrijven",
    hierTippen: "Schrijf hier … Druk tegelijk op de puntentoetsen en laat los.",
    textGeschafft: "Tekst klaar!",
    textErgebnis: (fehler: number, zeit: string, zeichen: number) =>
      `${fehler === 0 ? "Geen fouten" : `${fehler} ${plural(fehler, "fout", "fouten")}`} · tijd ${zeit} · ${zeichen} tekens`,
    textErgebnisSatz: (fehler: number) =>
      `Tekst klaar. ${fehler === 0 ? "Geen fouten" : `${fehler} ${plural(fehler, "fout", "fouten")}`}.`,
    gleichenText: "Dezelfde tekst herhalen",
    naechsterTextOhnePfeil: "Volgende tekst",
    naechsterText: "Volgende tekst →",
    textLesenAufgabe: "Lees de tekst en schrijf hem.",
    allesRichtigSatz: "Alles goed gelezen.",
    wortSatz: (richtig: number, von: number) => `${richtig} goede woorden van ${von}.`,
    wortSatzKurz: (richtig: number, von: number) => `${richtig} goede woorden van ${von}`,
    textLiesPrompt: (a: "du" | "sie") =>
      adresse(a, "Lees de hele tekst en schrijf hem met gewone letters:", "Lees de hele tekst en schrijf hem met gewone letters:"),
    textLoesung: (a: "du" | "sie") => adresse(a, "Jouw antwoord (hele tekst):", "Uw antwoord (hele tekst):"),
    textPlatzhalter: "Schrijf hier de gelezen tekst …",
    allesRichtig: "Alles goed gelezen!",
  },

  /** Ansagen (`announce.ts`). */
  announce: {
    lesenAufgabe: "Lees en schrijf het woord.",
    und: "en",
    richtig: "Juist.",
    leertaste: "Spatiebalk.",
    /** Zusatz hinter den Punkten der Soll-Zelle (Fehler-Tipp). */
    unterschied: (fehlt: number[], zuViel: number[]): string => {
      const pos: Record<number, string> = {
        1: "linksboven", 2: "linksmidden", 3: "linksonder",
        4: "rechtsboven", 5: "rechtsmidden", 6: "rechtsonder",
        7: "helemaal linksonder", 8: "helemaal rechtsonder",
      };
      if (fehlt.length === 1 && zuViel.length === 0) return `. Punt ${fehlt[0]} ontbreekt - ${pos[fehlt[0]]}.`;
      if (zuViel.length === 1 && fehlt.length === 0) return `. Punt ${zuViel[0]} is te veel - ${pos[zuViel[0]]}.`;
      const teile: string[] = [];
      if (fehlt.length) teile.push(fehlt.length === 1 ? `punt ${fehlt[0]} ontbreekt` : `punten ${fehlt.join(", ")} ontbreken`);
      if (zuViel.length) teile.push(zuViel.length === 1 ? `punt ${zuViel[0]} is te veel` : `punten ${zuViel.join(", ")} zijn te veel`);
      if (!teile.length) return "";
      const satz = teile.join(" en ");
      return `. ${satz.charAt(0).toUpperCase()}${satz.slice(1)}.`;
    },
    stern: (n: number) => `Nog een ster - ${n} van 3.`,
    schneller: "Je wordt sneller.",
    freischaltung: (titel: string) => `Goed zo! Er gaat een nieuwe deur open: ${titel}.`,
    levelDone: (sterne: number, naechster?: string) =>
      `Gelukt! ${sterne} ${plural(sterne, "ster", "sterren")} van 3.` + (naechster ? ` Hierna: ${naechster}.` : ""),
    textDone: (fehler: number) => (fehler === 0 ? "Tekst klaar. Geen fouten." : `Tekst klaar. ${fehler} ${plural(fehler, "fout", "fouten")}.`),
    cellHint: (tasten: string, punkte: string) => `Huidige cel: ${tasten}. ${punkte}.`,
    pause: "Pauze. Druk op Alt en P om door te gaan.",
    keineNeuenZeichen: "Hier zijn geen nieuwe tekens.",
  },

  /** Hilfe-Fenster (kurz; die deutsche Hilfe erklärt das deutsche System). */
  hilfe: {
    tastaturTitel: "Het toetsenbord als brailleschrijfmachine",
    tastaturText:
      "Zes toetsen horen bij de zes punten van een braillecel. Als je meerdere toetsen tegelijk indrukt, krijg je één teken:",
    punkteLinks: "punten 1, 2, 3 (links)",
    punkteRechts: "punten 4, 5, 6 (rechts)",
    leertasteAlsLuecke: "spatie",
    zeichenErklaerung: [
      { zeichen: "␣", bedeutung: "hier staat een spatie - je drukt op de spatiebalk." },
      { zeichen: "·", bedeutung: "scheidt twee toetsen of twee aanwijzingen die bij elkaar horen." },
      { zeichen: "⌫", bedeutung: "backspace - wist de laatste cel." },
      { zeichen: "→", bedeutung: "daarna, of: dit is wat eruit komt." },
    ] as Array<{ zeichen: string; bedeutung: string }>,
    zeichenTitel: "Deze tekens staan in de tekst",
    warumTitel: "Waarvoor dient een brailleleesregel?",
    warumText:
      "Braille is een tastschrift: je leest het met je vingertoppen, niet met je ogen. Op het scherm zie je de punten; dat helpt bij het schrijven en bij het herkennen van de vormen. Maar braille leer je pas echt lezen als je de punten voelt. Een brailleleesregel laat kleine pinnetjes onder elke cel omhoogkomen, zodat je het teken kunt voelen. Punktgenau kan een aangesloten leesregel aansturen waar de browser dat toestaat.",
    bereicheTitel: "Onderdeel en etappes",
    bereicheText:
      "Het onderdeel bovenaan is «Braillestandaard»: elke letter staat in een eigen cel, zonder afkortingen. De etappes volgen op elkaar: elke etappe brengt nieuwe tekens en opent de volgende pas als hij goed beheerst wordt.",
    reihenfolgeTitel: "Waarom deze volgorde van de letters?",
    reihenfolgeText:
      "De letters komen in de volgorde waarin ze in het Nederlands voorkomen (Genootschap Onze Taal): e, n, a, t, i, r, o, d, s, l … Zo ontstaan heel snel echte woorden. Hoofdletters, leestekens en getallen komen daarna; é, ë en ï komen als laatste bij de letters. De oefenwoorden komen uit de Nederlandse teksten van Tastenflow.",
    normTitel: "Welke standaard?",
    normText:
      "De tekens volgen de Braillestandaard voor algemeen gebruik in het Nederlandse taalgebied, versie 2019, van de Braille Autoriteit. Getallen schrijf je met het cijferteken (punten 3-4-5-6) en de letters a tot j. In deze versie zijn er geen afkortingen.",
    kontoTitel: "Account en voortgang",
    kontoText: "Zonder in te loggen wordt je voortgang op dit apparaat bewaard.",
    tastenkombinationen: "Sneltoetsen",
  },

  /** Tastenkürzel (`ShortcutList`). */
  kurztasten: [
    ["Esc", "Sluit alles wat open is - help, sneltoetsen, tekenlijst - en de cursor gaat altijd terug naar het oefenveld. Ook als er niets open is, brengt Esc je terug naar de oefening"],
    ["Alt + 1", "Onderdeel «Braillestandaard»"],
    ["Alt + E", "Cursor naar het oefenveld (hetzelfde doel als Esc, zonder iets te sluiten)"],
    ["Alt + U", "Naar de hoofdstukkeuze - daarna bladeren met ↑ ↓"],
    ["Alt + W", "De oefening herhalen"],
    ["Shift, twee keer achter elkaar", "De oefening herhalen, zoals Alt + W"],
    ["Alt + M", "Naar «Mijn toetsen» (nieuwe tekens van deze etappe)"],
    ["Alt + Z", "De reeks voorlezen: hoeveel oefeningen je goed hebt en hoeveel er nog nodig zijn - Esc brengt je terug naar het invoerveld"],
    ["Alt + L", "Tekenlijst: alle tekens van het onderdeel openen / sluiten"],
    ["Alt + O", "Instellingen: openen / sluiten"],
    ["Alt + P", "Pauze aan / uit - in de Klassenmatch: alle plaatsen voorlezen"],
    ["Alt + V", "Voorlezen aan / uit"],
    ["Alt + K", "Kleuren en contrast: openen / sluiten"],
    ["Alt + J", "Mijn account: openen / sluiten"],
    ["Alt + H", "Help: openen / sluiten"],
    ["Alt + T", "Lijst met sneltoetsen: openen / sluiten"],
    ["Alt + +", "Groter oefenvlak"],
    ["Alt + −", "Kleiner oefenvlak"],
    ["Alt + 0", "Normale grootte (terug naar 100 %)"],
    ["⇧ Shift", "Ingedrukt houden: toont en zegt de toetsen van de huidige cel"],
  ] as Array<[string, string]>,

  /** Zeichenliste (`BrailleZeichenliste.tsx`). */
  zeichenliste: {
    leereZelle: "lege cel",
    ansage: (bereich: string, nr?: number, titel?: string) =>
      `Tekenlijst ${bereich} geopend.` + (titel ? ` Je bent bij etappe ${nr}: ${titel}.` : ""),
    titel: (bereich: string) => `Alle tekens - ${bereich}`,
    einfuehrung:
      "De lijst volgt precies jouw route: etappe na etappe, in de volgorde waarin de tekens komen. Je staat bij de etappe die je nu oefent.",
    suchen: "Een teken zoeken:",
    platzhalter: "bijv. é, ë, of punten zoals 1, 4",
    keineTreffer: "Geen resultaten.",
    einTreffer: "1 resultaat.",
    treffer: (n: number) => `${n} resultaten.`,
    etappe: (nr: number, titel: string, aktuell: boolean, fertig: boolean) =>
      `Etappe ${nr}: ${titel}${aktuell ? " - je bent hier" : fertig ? " - gehaald" : ""}`,
    laedt: "De punten worden geladen …",
    keineEigenen: "Dit onderdeel voert geen eigen tekens in.",
  },

  /** Einstellungen (`PunktgenauEinstellungen.tsx`). */
  einstellungen: {
    titel: "Instellingen - Punktgenau",
    zurueck: "Terug naar de oefening",
    grossTitel: "Hoofdletterteken",
    grossHinweis:
      "Voor elke hoofdletter staat een waarschuwingscel (punten 4-6). Je kunt die uitzetten en later weer aanzetten.",
    grossAn: "Hoofdletterteken aan",
    grossAus: "Hoofdletterteken uit",
    klasse: (an: boolean) =>
      `Je leraar stelt dit in voor de klas. Het hoofdletterteken staat nu ${an ? "aan" : "uit"}.`,
    klangTitel: "Geluid en voorlezen",
    klangText: (alt: string) =>
      `Voorlezen, snelheid, stem, hulp bij fouten, geluiden en volume stel je in via het menu onder de luidspreker in de kop. ${alt} zet het voorlezen direct aan of uit.`,
  },

  /** Meine Verwechslungen (`PunktgenauPage`, `BrailleConfusionPanel.tsx`). Merktipps nur für die Buchstaben;
   *  die deutschen Kurzschrift-Tipps (un/und, ei/ie …) gibt es hier nicht. */
  verwechslungen: {
    knopfZeigen: "▼ Mijn verwisselingen tonen",
    knopfAusblenden: "▲ Mijn verwisselingen verbergen",
    laedt: "Verwisselingen worden geladen …",
    leerLehrkraft: "Nog geen verwisselingen opgeslagen.",
    leerKind: "Je hebt nog geen tekens verwisseld. Goed zo!",
    listeName: "Mijn verwisselingen",
    zeile: (prozent: number, mit: string) => `${prozent} % fout, verwisseld met ${mit}.`,
    tipp: "Tip:",
    tabelleName: "Verwisselingstabel",
    tabelleBeschreibung: "Verwisselingstabel: juiste teken, foutpercentage en vaakste verwisselingen",
    spalteSoll: "Juiste teken",
    spalteQuote: "Foutpercentage",
    spalteMit: "Verwisseld met",
    spalteTipp: "Tip",
    merktipps: {
      "d|f": "d en f hebben allebei punt 1 en 4 - d heeft daarbij punt 5 (rechts), f punt 2 (links).",
      "e|i": "e staat boven (punten 1·5), i zit lager (punten 2·4).",
      "r|w": "r is punten 1·2·3·5, w is punten 2·4·5·6 - w is het buitenbeentje helemaal aan het eind.",
      "m|u": "m staat boven (punten 1·3·4), u zit onder (punten 1·3·6).",
      "h|j": "h is punten 1·2·5, j is punten 2·4·5 - j schuift naar rechts.",
      "n|z": "n is punten 1·3·4·5, z is punten 1·3·5·6.",
    },
  },
};
