/**
 * Bereich `uebersicht` - Deutsch: die Shell (`Klangpunkte.tsx`: Kapitelwahl, Ansagen,
 * Abzeichen, Tages-Mix), das Akustik-Menü und die Klassen-Matrix für Lehrkräfte.
 * Bestand 1:1. Texte mit Zahlen/Namen sind Funktionen.
 */
export const uebersicht = {
  // --- Ansagen und Meldungen ------------------------------------------------
  kapitelwahlAnsage: "Kapitelwahl. Alle Kapitel sind frei wählbar — Sterne zeigen deinen Stand.",
  kapitelAnsage: (nr: number, welt: string, i: number, n: number, kapitel: string) =>
    `Klangwelt ${nr}, ${welt} — Kapitel ${i} von ${n}: ${kapitel}.`,
  kapitelAnsageOhneWelt: (kapitel: string) => `Kapitel: ${kapitel}.`,
  neuesAbzeichen: (name: string) => `Neues Abzeichen: ${name}!`,
  neueAbzeichen: (namen: string[]) => `Neue Abzeichen: ${namen.join(", ")}!`,
  geschafftMitSternen: (sterne: number) => `Geschafft! +30 XP · ${sterne} von 3 Sternen für dieses Kapitel`,
  geschafft: "Geschafft! +30 XP",
  zeichenlisteOffen: "Zeichenliste geöffnet.",
  zeichenlisteZu: "Zeichenliste geschlossen.",
  weltInArbeit: (nr: number, name: string) =>
    `Klangwelt ${nr}, ${name}, ist noch in Arbeit — sie kommt in einer späteren Ausbaustufe.`,
  zeichenAreaLabel: "Klangpunkte",
  zeichenAreaBlurb: "Braille-Noten: hören, fühlen, schreiben.",

  // --- Kopfleiste -----------------------------------------------------------
  rangCaption: "Rang",
  rangLabel: (level: number, rest: number) => `Rang ${level} — noch ${rest} XP bis zum nächsten.`,
  xpHinweis: (xp: number) => `${xp} XP — 2 je richtige Antwort, 30 je Kapitel.`,
  xpText: (xp: number) => `${xp} XP`,
  sterneHinweis: (n: number, max: number) => `${n} von ${max} Sternen — bis zu 3 je Kapitel.`,
  weltName: (nr: number, titel: string) => `Klangwelt ${nr}: ${titel}`,
  weltKopf: (nr: number, titel: string, i: number, n: number) =>
    `Klangwelt ${nr}: ${titel} — Kapitel ${i} von ${n}`,
  voriges: "Voriges Kapitel",
  naechstes: "Nächstes Kapitel",
  kapitelSelect: "Kapitel auswählen — mit Pfeil rauf und runter blättern",
  kapitelOption: (i: number, titel: string, sterne: number | null) =>
    `Kapitel ${i}: ${titel}${sterne === null ? "" : ` — gemeistert, ${sterne} von 3 Sternen`}`,
  landkarte: (kapitel: number, welten: number) => `${kapitel} Kapitel in ${welten} Klangwelten - alle frei wählbar`,
  kapitelwahlKnopf: "Kapitelwahl",
  kapitelwahlTitel: "Alle Klangwelten und Kapitel mit deinem Sterne-Stand (Alt + U)",
  zeichenlisteKnopf: "Zeichenliste",
  zeichenlisteTitel: "Liste aller Noten-Zeichen, sortiert nach deinem Lernweg (Alt + L)",

  // --- Kapitelwahl ----------------------------------------------------------
  kapitelwahlUeberschrift: "Kapitelwahl — such dir aus, was du üben willst",
  mixTitel: "Tages-Mix",
  mixText: "Fünf Minuten bunt gemischt — Aufgaben quer durch deine gemeisterten Kapitel, ohne Sterne, nur zum Wachhalten.",
  loslegen: "Loslegen",
  mixZuWenig: (n: number) =>
    `Meistere erst ein paar Kapitel (mindestens 3), dann gibt es hier deinen Tages-Mix. Bisher: ${n}.`,
  weltStand: (fertig: number, n: number, sterne: number, max: number) =>
    `${fertig} von ${n} Kapiteln gemeistert · ${sterne} von ${max} Sternen`,
  kapitelZeile: (i: number, titel: string) => `Kapitel ${i}: ${titel}`,
  werkeText: (n: number) => ` · ${n} von 5 Werken`,
  besucht: "✓ besucht",
  srBesucht: "— besucht.",
  srNichtBesucht: "— noch nicht besucht.",
  srGemeistert: (sterne: number) => `— gemeistert, ${sterne} von 3 Sternen.`,
  srNichtGemeistert: "— noch nicht gemeistert.",

  // --- Abzeichen-Galerie ----------------------------------------------------
  abzeichenTitel: "Abzeichen",
  abzeichenStand: (verdient: number, alle: number) =>
    `${verdient} von ${alle} Abzeichen verdient — sammle Sterne, meistere Welten, schreib Diktate, bau Takte und spiel Lieder aus dem Gedächtnis.`,
  geheimAbzeichen: "Geheim-Abzeichen",
  geheimBeschreibung: "Noch verschlossen — finde es heraus!",
  srVerdient: "verdient.",
  srGeheim: "geheim, noch nicht verdient.",
  srNichtVerdient: "noch nicht verdient.",

  // --- Tages-Mix ------------------------------------------------------------
  mixIntro:
    "Tages-Mix — eine kurze, bunte Wiederholrunde quer durch deine gemeisterten Kapitel. Locker bleiben: hier zählt nichts, es gibt keine Sterne.",
  mixStart: (n: number) => `Tages-Mix gestartet — fünf Minuten Wiederholung quer durch ${n} gemeisterte Kapitel.`,
  mixEnde: (vomKind: boolean, richtig: number, gesamt: number) =>
    `${vomKind ? "Runde beendet." : "Zeit um!"} Du hast ${richtig} von ${gesamt} ${gesamt === 1 ? "Aufgabe" : "Aufgaben"} richtig gelöst.`,
  mixGeschafft: "Tages-Mix geschafft!",
  mixErgebnis: (richtig: number, gesamt: number) =>
    `${richtig} von ${gesamt} ${gesamt === 1 ? "Aufgabe" : "Aufgaben"} richtig`,
  mixProzent: (pct: number) => ` · ${pct} %`,
  mixFein: "Feine Wiederholung — der Spielstand bleibt, wie er war.",
  nochEineRunde: "Noch eine Runde",
  zurKapitelwahl: "Zur Kapitelwahl",
  mixBunt: (n: number) => `Bunt gemischt aus ${n} gemeisterten Kapiteln`,
  mixTimer: (min: number, sek: number) => `Noch ${min} Minuten und ${sek} Sekunden`,
  mixRichtigLabel: (richtig: number, gesamt: number) => `${richtig} von ${gesamt} richtig`,
  mixRichtig: "richtig",
  beenden: "Beenden",

  // --- Akustik-Menü ---------------------------------------------------------
  akustikMusik: "Musik",
  akustikMusikErklaerung:
    "Die Instrumente spielen die Noten der Aufgaben. Sie sind Teil der Aufgabe - darum gibt es keinen Aus-Schalter, nur die Lautstärke.",
  akustikInstrument: "Instrument",
  akustikInstrumentErklaerung: "Mit welchem Instrument die Noten erklingen. Nach dem Wechsel spielt es ein C zur Probe.",
  akustikLautstaerke: "Lautstärke der Musik",
  akustikLautstaerkeErklaerung:
    "Wie laut die Instrumente spielen. 100 % ist etwa so laut wie die Stimme. Ganz still wird die Musik nur bei 0 %.",

  // --- Klassen-Matrix (Lehrkräfte) ------------------------------------------
  matrixSterne: (n: number) => `${n} ${n === 1 ? "Stern" : "Sterne"}`,
  matrixLaedt: "lädt …",
  matrixKapitelImEinzelnen: "Kapitel im Einzelnen",
  matrixAufklappLabel: (name: string, offen: boolean) =>
    `Kapitel im Einzelnen: ${name} ${offen ? "einklappen" : "ausklappen"}`,
  matrixAufklappTipp: (name: string) => `Kapitel von ${name} - jedes Kapitel mit Sterne-Stand.`,
  matrixWeltSr: (nr: number, titel: string, fertig: number, n: number, sterne: string) =>
    `Klangwelt ${nr}, ${titel}: ${fertig} von ${n} Kapiteln gemeistert, ${sterne}.`,
  matrixGesamtSr: (fertig: number, n: number, sterne: string) =>
    `Gesamt ${fertig} von ${n} Kapiteln gemeistert, ${sterne}.`,
  matrixRegion: (name: string) => `Kapitel im Einzelnen: ${name}`,
  matrixGemeistert: (sterne: string) => `gemeistert, ${sterne}`,
  matrixNichtGemeistert: "noch nicht gemeistert",
  matrixTabelle: "Klangpunkte-Fortschritt der Klasse",
  matrixName: "Name",
  matrixWeltKurz: (nr: number) => `W${nr}`,
  matrixWeltTitel: (nr: number, titel: string) => `Klangwelt ${nr}: ${titel}`,
  matrixWeltSpalteSr: (nr: number, titel: string) => `: Klangwelt ${nr}, ${titel}`,
  matrixGesamt: "Gesamt",
  matrixZuletzt: "Zuletzt",
  matrixFuss:
    "Zahl je Feld = gemeisterte Kapitel dieser Klangwelt. Der Pfeil vor dem Namen zeigt jedes Kapitel mit Sterne-Stand. Sie sehen genau das, was das Kind über sich selbst sieht - nicht mehr.",
};
