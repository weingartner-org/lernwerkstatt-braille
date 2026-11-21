/**
 * Der gemeinsame Typ aller Plus-Texte (Bauplan 2026-11-06 §5, Schritt 4).
 *
 * Jede Sprache bekommt EINE Datei `texte/<sprache>.ts` mit diesem Typ
 * (`de.ts` ist der Bestand, `en.ts` die erste Übersetzung). Fehlt ein Feld,
 * rechnet `tsc` nicht - so bleibt keine Stelle still deutsch.
 *
 * ★ `de.ts` trägt die deutschen Sätze WÖRTLICH, so wie sie vorher in den
 *   Bauteilen standen. Der Wächter `tests/plus-deutsch-unveraendert.test.tsx`
 *   misst das HTML davor und danach.
 */
import type { BrailleSchrift, Eingabeart, Eingabeweg, Zeilenbreite } from "@/lib/plus/einstellungen";
import type { ZeichenabstandFaktor } from "@/lib/typing/zeichenabstand";
import type { PlusRegion } from "@/lib/plus/regionen";

/** Die Hinweise des Lesers (Zellen -> Rechenzeile). Schlüssel statt Satz im Code. */
export interface PlusHinweise {
  // Marburger Mathematikschrift - die acht deutschen Sätze aus `marburger.ts`.
  funktionsname: string;
  altesGeteilt: string;
  kommaOhneZahl: string;
  bruchstrichZahlzeichen: string;
  griechisch: string;
  schliesstOhneOffen: string;
  unbekanntesZeichen: string;
  klammerOffen: string;
  // Dazu für UEB.
  kommaInZahl: string;
  buchstabeNichtGebaut: string;
}

export interface PlusStoffStufe {
  name: string;
  zahlenraum: string;
  leitidee: string;
}

export interface PlusTexte {
  /** `de` oder die Sprache dieser Datei. */
  sprache: string;
  /** „3. Schulstufe" / „Level 3". */
  stufe: (nr: number) => string;
  zurueck: string;
  /** Bildbeschreibung des Plus-Zeichens in der Kopfzeile (NVDA-Fund 07.11.2026: war in en deutsch). */
  logoBeschreibung: string;

  start: {
    hallo: (vorname: string) => string;
    willkommen: string;
    wiederDa: string;
    neu: string;
    fuerAlleKopf: string;
    fuerAlleAnzahl: (n: number) => string;
    losGeht: string;
    trainingMarke: (stufe: number | null) => string;
    trainingSucht: string;
    etappe: (nr: number, name: string) => string;
    allesGeschafft: string;
    rundeInfo: string;
    weiterrechnen: string;
    etappenGeschafft: (geschafft: number, gesamt: number) => string;
    wochenzielTitel: string;
    wochenstand: (geschafft: number, ziel: number) => string;
    oder: string;
    wahlTitel: string;
    wahlSatz: string;
    spieleTitel: string;
    spieleSatz: string;
    sammlungTitel: string;
    sammlungLeer: string;
    sammlungAnzahl: (n: number) => string;
    anmeldenSatz: string;
    anmelden: string;
  };

  stufenwahl: {
    trainingTitel: string;
    trainingHinweis: string;
  };

  wahl: {
    stufenTitel: string;
    paketTitel: (stufe: string) => string;
    offen: (n: number) => string;
    feste: string;
    andere: string;
  };

  seite: {
    bereichTraining: string;
    bereichWahl: string;
    bereichStart: string;
    bereichFuerAlle: string;
    einstellungen: string;
    einstellungenZurueck: string;
    stimmeFehlt: string;
    vorlesenAn: string;
    stimmeHinweis: string;
    fuerAlleGestartet: string;
    passwortTitel: string;
    hilfeTitel: string;
    /** Nur wo die Kürzelliste übersetzt ist (de: die Liste in `PlusPage.tsx`). */
    kuerzel?: ReadonlyArray<readonly [string, string]>;
    /** Nur wo die Hilfe übersetzt ist (de: der Text in `PlusPage.tsx`). */
    hilfe?: ReadonlyArray<string>;
    macHinweis?: string;
  };

  uebung: {
    fallbackTitel: string;
    nochNichts: string;
    luecke: string;
    veraendert: string;
    richtig: string;
    fastRichtig: (schreibung: string) => string;
    einheit: (hinweis: string | undefined) => string;
    restFehlt: string;
    nochNicht: (hinweis: string) => string;
    nochNichtLeer: string;
    uebersprungen: string;
    aufgabeKurz: (kurzform: string) => string;
    etappeVon: (nr: number, gesamt: number) => string;
    aufgabeVon: (nr: number, gesamt: number) => string;
    aufgabeLabel: (nr: number, gesamt: number) => string;
    danachRaetsel: string;
    genug: string;
    raetselVorspann: (richtige: number, gewertet: number) => string;
    geschafft: string;
    richtigVon: (richtige: number, gewertet: number) => string;
    uebersprungenSatz: (n: number) => string;
    rundenBis: (n: number) => string;
    weiterNaechste: string;
    andereUebung: string;
    genugHeute: string;
    nochDurchgang: string;
    danachMarke: (raetsel: boolean) => string;
    danachSatz: (nr: number, gesamt: number, raetsel: boolean) => string;
    merke: string;
    zeigWeg: string;
    nochSchritt: string;
    nochmalAnsagen: string;
    tastenExtra: string;
    weiter: string;
    pruefen: string;
    loesungEine: (l: string) => string;
    loesung: (l: string) => string;
    nichtWeiter: string;
    ueberspringen: string;
    beenden: string;
    etappeZeile: (nr: number, gesamt: number, name: string) => string;
  };

  eingabe: {
    arten: Record<Eingabeart, string>;
    antwort: string;
    tasteArt: string;
    tasteGroesse: string;
    tasteZeile: string;
    tasteZurueck: string;
    artAnsage: (art: string, steht: boolean) => string;
    anfang: string;
    feldLeer: string;
    geloescht: string;
    punkte: (p: string) => string;
    keineRechnung: string;
    rechnungDa: string;
    soLese: string;
    nochNichts: string;
    tastenFuer: string;
  };

  hinweise: PlusHinweise;

  einstellungen: {
    gruppeEingabe: string;
    gruppeAnzeige: string;
    gruppeKlang: string;
    braillezeile: string;
    zeilenAn: string;
    zeilenAus: string;
    unterwegsVor: string;
    unterwegsNach: string;
    schrift: string;
    schriftNamen: Record<BrailleSchrift, string>;
    schriftErkl: (schrift: BrailleSchrift, eingabe: Eingabeweg) => string;
    wieDuSchreibst: string;
    wegNamen: Record<Eingabeweg, string>;
    breite: string;
    breiteKurz: string;
    breiteNamen: Record<Zeilenbreite, string>;
    breiteErkl: Record<Zeilenbreite, string>;
    festgelegtNach: string;
    an: string;
    aus: string;
    soSteht: (beispiel: string) => string;
    ausschreiben: string;
    ausschreibenJa: string;
    ausschreibenNein: string;
    ausschreibenErkl: string;
    textgroesse: string;
    prozent: (n: number) => string;
    groesseA: string;
    groesseB: string;
    groesseC: string;
    groesseD: string;
    abstand: string;
    abstandErkl: string;
    schriftWahlName: string;
    schriftWahlHinweis: string;
    farbenA: string;
    farbenB: string;
    klangA: string;
    klangB: string;
    klangC: string;
    strg: string;
    abstandNamen: Record<ZeichenabstandFaktor, string>;
    /** Land/Region (nur Spanisch und Französisch zeigen das Feld; de und en tragen den Text für die Vollständigkeit). */
    region: string;
    regionErkl: string;
    regionNamen: Record<PlusRegion, string>;
  };

  akustik: {
    kopf: string;
    probe: string;
    vorlesenTitel: string;
    vorlesenErkl: (hinweis: string) => string;
    tempo: string;
    tempoErkl: string;
    lautStimme: string;
    lautStimmeErkl: string;
    toene: string;
    toeneErkl: string;
    lautToene: string;
    lautToeneErkl: string;
  };

  /** Stoffplan in dieser Sprache - fehlt bei `de` (dort gilt `stoffplan.json`). */
  stoff?: {
    stufen: Record<number, PlusStoffStufe>;
    pakete: Record<string, string>;
  };
}
