/**
 * Bereich `uebersicht` - Magyar: die Shell (`Klangpunkte.tsx`: fejezetválasztó, bejelentések,
 * jelvények, Napi mix), das Akustik-Menü und die Klassen-Matrix für Lehrkräfte.
 * Kinder: tegezés; Lehrkraft-Texte unpersönlich. „X von Y" als „Y-ból X" mit festem Wort
 * („3 csillagból 2", „12 feladatból 9") oder „összesen", damit kein Suffix von der Zahl abhängt.
 * Unsichere Wörter stehen im Bericht unter „Unsicher".
 */
import type { uebersicht as De } from "../de/uebersicht";

export const uebersicht: typeof De = {
  // --- Bejelentések és üzenetek ---------------------------------------------
  kapitelwahlAnsage: "Fejezetválasztó. Minden fejezet szabadon választható - a csillagok mutatják, hol tartasz.",
  kapitelAnsage: (nr: number, welt: string, i: number, n: number, kapitel: string) =>
    `${nr}. hangvilág, ${welt} - ${i}. fejezet (összesen ${n}): ${kapitel}.`,
  kapitelAnsageOhneWelt: (kapitel: string) => `Fejezet: ${kapitel}.`,
  neuesAbzeichen: (name: string) => `Új jelvény: ${name}!`,
  neueAbzeichen: (namen: string[]) => `Új jelvények: ${namen.join(", ")}!`,
  geschafftMitSternen: (sterne: number) => `Sikerült! +30 XP · 3 csillagból ${sterne} ezért a fejezetért`,
  geschafft: "Sikerült! +30 XP",
  zeichenlisteOffen: "A jelek listája megnyílt.",
  zeichenlisteZu: "A jelek listája bezárult.",
  weltInArbeit: (nr: number, name: string) =>
    `${nr}. hangvilág, ${name}: még készül - egy későbbi bővítéssel érkezik.`,
  zeichenAreaLabel: "Klangpunkte",
  zeichenAreaBlurb: "Braille-kotta: hallani, tapintani, írni.",

  // --- Fejléc ---------------------------------------------------------------
  rangCaption: "Rang",
  rangLabel: (level: number, rest: number) => `${level}. rang - még ${rest} XP a következőig.`,
  xpHinweis: (xp: number) => `${xp} XP - 2 minden helyes válaszért, 30 minden fejezetért.`,
  xpText: (xp: number) => `${xp} XP`,
  sterneHinweis: (n: number, max: number) => `${max} csillagból ${n} - fejezetenként legfeljebb 3 csillag.`,
  weltName: (nr: number, titel: string) => `${nr}. hangvilág: ${titel}`,
  weltKopf: (nr: number, titel: string, i: number, n: number) =>
    `${nr}. hangvilág: ${titel} - ${i}. fejezet (összesen ${n})`,
  voriges: "Előző fejezet",
  naechstes: "Következő fejezet",
  kapitelSelect: "Fejezet kiválasztása - lapozás a fel és le nyíllal",
  kapitelOption: (i: number, titel: string, sterne: number | null) =>
    `${i}. fejezet: ${titel}${sterne === null ? "" : ` - teljesítve, 3 csillagból ${sterne}`}`,
  landkarte: (kapitel: number, welten: number) => `${kapitel} fejezet ${welten} hangvilágban - mind szabadon választható`,
  kapitelwahlKnopf: "Fejezetválasztó",
  kapitelwahlTitel: "Minden hangvilág és fejezet a csillagaiddal (Alt + U)",
  zeichenlisteKnopf: "Jelek listája",
  zeichenlisteTitel: "Az összes kottajel listája a tanulási utad szerint rendezve (Alt + L)",

  // --- Fejezetválasztó ------------------------------------------------------
  kapitelwahlUeberschrift: "Fejezetválasztó - válaszd ki, mit szeretnél gyakorolni",
  mixTitel: "Napi mix",
  mixText: "Öt perc vegyesen - feladatok a teljesített fejezeteidből, csillagok nélkül, csak frissen tartásra.",
  loslegen: "Rajta",
  mixZuWenig: (n: number) =>
    `Előbb teljesíts néhány fejezetet (legalább hármat), akkor itt vár a Napi mixed. Eddig teljesítve: ${n} fejezet.`,
  weltStand: (fertig: number, n: number, sterne: number, max: number) =>
    `${n} fejezetből ${fertig} teljesítve · ${max} csillagból ${sterne}`,
  kapitelZeile: (i: number, titel: string) => `${i}. fejezet: ${titel}`,
  werkeText: (n: number) => ` · 5 műből ${n}`,
  besucht: "✓ meglátogatva",
  srBesucht: "- meglátogatva.",
  srNichtBesucht: "- még nincs meglátogatva.",
  srGemeistert: (sterne: number) => `- teljesítve, ${sterne} csillaggal (3 közül).`,
  srNichtGemeistert: "- még nincs teljesítve.",

  // --- Jelvénygaléria -------------------------------------------------------
  abzeichenTitel: "Jelvények",
  abzeichenStand: (verdient: number, alle: number) =>
    `${alle} jelvényből ${verdient} megszerezve - gyűjts csillagokat, teljesíts világokat, írj diktálást, építs ütemeket, és játssz dalokat emlékezetből.`,
  geheimAbzeichen: "Titkos jelvény",
  geheimBeschreibung: "Még zárva van - fedezd fel!",
  srVerdient: "megszerezve.",
  srGeheim: "titkos, még nincs megszerezve.",
  srNichtVerdient: "még nincs megszerezve.",

  // --- Napi mix -------------------------------------------------------------
  mixIntro:
    "Napi mix - rövid, tarka ismétlő kör a teljesített fejezeteidből. Csak lazán: itt semmi sem számít, csillagok sincsenek.",
  mixStart: (n: number) => `A Napi mix elindult - öt perc ismétlés ${n} teljesített fejezetből.`,
  mixEnde: (vomKind: boolean, richtig: number, gesamt: number) =>
    `${vomKind ? "A kör véget ért." : "Lejárt az idő!"} ${gesamt} feladatból ${richtig} feladatot oldottál meg helyesen.`,
  mixGeschafft: "A Napi mix kész!",
  mixErgebnis: (richtig: number, gesamt: number) =>
    `${gesamt} feladatból ${richtig} helyes`,
  mixProzent: (pct: number) => ` · ${pct} %`,
  mixFein: "Szép ismétlés volt - a játékállás olyan marad, amilyen volt.",
  nochEineRunde: "Még egy kör",
  zurKapitelwahl: "Vissza a fejezetválasztóhoz",
  mixBunt: (n: number) => `Vegyesen ${n} teljesített fejezetből`,
  mixTimer: (min: number, sek: number) => `Még ${min} perc és ${sek} másodperc`,
  mixRichtigLabel: (richtig: number, gesamt: number) => `${gesamt} feladatból ${richtig} helyes`,
  mixRichtig: "helyes",
  beenden: "Befejezés",

  // --- Akusztika menü -------------------------------------------------------
  akustikMusik: "Zene",
  akustikMusikErklaerung:
    "A hangszerek a feladatok hangjait játsszák. Ezek a feladat részei - ezért nincs kikapcsoló, csak hangerő.",
  akustikInstrument: "Hangszer",
  akustikInstrumentErklaerung: "Melyik hangszeren szólalnak meg a hangok. Váltás után próbaként egy c hangot játszik.",
  akustikLautstaerke: "A zene hangereje",
  akustikLautstaerkeErklaerung:
    "Milyen hangosan szólnak a hangszerek. A 100 % nagyjából olyan hangos, mint a beszéd. Teljesen csak 0 %-nál némul el a zene.",

  // --- Osztálytáblázat (tanároknak) -----------------------------------------
  matrixSterne: (n: number) => `${n} csillag`,
  matrixLaedt: "betöltés",
  matrixKapitelImEinzelnen: "Fejezetek egyenként",
  matrixAufklappLabel: (name: string, offen: boolean) =>
    `Fejezetek egyenként: ${name} - ${offen ? "becsukás" : "kinyitás"}`,
  matrixAufklappTipp: (name: string) => `${name} fejezetei - minden fejezet a csillagokkal.`,
  matrixWeltSr: (nr: number, titel: string, fertig: number, n: number, sterne: string) =>
    `${nr}. hangvilág, ${titel}: ${n} fejezetből ${fertig} teljesítve, ${sterne}.`,
  matrixGesamtSr: (fertig: number, n: number, sterne: string) =>
    `Összesen ${n} fejezetből ${fertig} teljesítve, ${sterne}.`,
  matrixRegion: (name: string) => `Fejezetek egyenként: ${name}`,
  matrixGemeistert: (sterne: string) => `teljesítve, ${sterne}`,
  matrixNichtGemeistert: "még nincs teljesítve",
  matrixTabelle: "Az osztály előrehaladása a Klangpunkte programban",
  matrixName: "Név",
  matrixWeltKurz: (nr: number) => `V${nr}`,
  matrixWeltTitel: (nr: number, titel: string) => `${nr}. hangvilág: ${titel}`,
  matrixWeltSpalteSr: (nr: number, titel: string) => `: ${nr}. hangvilág, ${titel}`,
  matrixGesamt: "Összesen",
  matrixZuletzt: "Utoljára",
  matrixFuss:
    "A mezőben álló szám = az adott hangvilág teljesített fejezetei. A név előtti nyíl minden fejezetet megmutat a csillagokkal. Itt pontosan az látható, amit a gyerek önmagáról lát - semmi több.",
};
