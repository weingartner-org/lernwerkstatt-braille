/**
 * Bereich `runner` - Magyar (gyakorlófelület, kottasor, érintéses bevitel).
 * Fachwörter: ungarische Musiklehre (hang, szünet, ütem, ütemvonal, ütemmutató - aus `tonnamen.ts`
 * Eintrag `hu`). Kinder: tegezés. Nach einer Zahl steht die Einzahl („3 hang", „2 ütés");
 * „X von Y" als „Y-ból X" mit festem Wort oder „X/Y", damit kein Suffix von der Zahl abhängt.
 * Unsichere Wörter stehen im Bericht unter „Unsicher".
 */
import type { runner as De } from "../de/runner";

/** Endung nach der Punktzahl: „1-es pont", „3-as pont", „5-ös pont", „6-os pont". */
const PONT_RAG: Record<number, string> = { 1: "-es", 2: "-es", 3: "-as", 4: "-es", 5: "-ös", 6: "-os" };

export const runner: typeof De = {
  kopf: {
    anhoeren: "Meghallgatás",
    stopp: "Állj",
    anhoerenTitel: "A feladat meghallgatása (az Alt + W ki is mondja)",
    instrument: "Hangszer",
    namenKnopf: "do-re-mi",
    namenTitel: (a: string, b: string): string => `Hangnevek így: ${a} (rögzített szolmizáció), nem így: ${b}`,
    rhythmusKnopf: "tá ti-ti",
    rhythmusTitel: "Ritmusnyelv: a hangértékek után a tá, ti-ti szótagok is elhangzanak",
    anderesLied: "Másik dal",
    namenAn: (a: string, b: string, c: string): string => `Hangnevek: ${a}, ${b}, ${c}.`,
    rhythmusAn: "Ritmusnyelv be: tá, ti-ti.",
    rhythmusAus: "Ritmusnyelv ki.",
    zurueckLiedauswahl: "Vissza a dalválasztáshoz.",
  },

  aufgabe: {
    liesBrailleZeile: "Olvasd el a Braille-sort.",
    handNurKlavier: "A kézváltás csak a kétsoros zongorás fejezetben működik.",
    weiter: (prompt: string): string => `Folytassuk. ${prompt}`,
    zeichenlisteHinweis: "A szakasz összes kottajelét megtalálod a jelek listájában: Alt és L.",
    songGanzGeschafft: (titel: string): string => `${titel} - végig sikerült!`,
    songZeile: (zeile: number, von: number): string => ` · ${zeile}. sor (összesen ${von})`,
  },

  geschafft: {
    geschafft: "Sikerült!",
    mitSternen: (n: number): string => `Sikerült! 3 csillagból ${n} a tiéd.`,
    alsNaechstesAnsage: (titel: string): string => ` Következik: ${titel}.`,
    alsNaechstesKarte: (titel: string): string => `Következik: ${titel}`,
    weiterUeben: "Gyakorlás tovább",
    weiter: "Tovább",
  },
  fortschritt: {
    caption: "Gyakorlás",
    aria: (n: number, min: number, prozent: number): string =>
      `A szakasz állása: ${n} feladat a legalább ${min} feladatból, ${prozent} százalék kész.`,
    rundeGeschafft: "A kör kész - a szakasz megy.",
    runde: (n: number, min: number, noch: number): string =>
      `Kör: ${n} feladat kész a legalább ${min} feladatból` +
      (noch > 0 ? `, még legalább ${noch} feladat van hátra.` : ", mindjárt megy a szakasz."),
  },

  lieder: {
    kinder: "🧒 Gyerekdalok",
    erwachsene: "🎼 Klasszikus és örökzöld dalok",
  },

  hand: {
    hinweis: (f: "both" | "rh" | "lh"): string =>
      " - egy kéz külön, nagyban látva és hallva (" +
      (f === "rh"
        ? "most: csak a jobb kéz"
        : f === "lh"
          ? "most: csak a bal kéz"
          : "most: mindkét kéz") +
      ")",
  },

  wahl: {
    richtig: "Helyes!",
    richtigWaere: (antwort: string): string => `A helyes válasz: ${antwort}.`,
    antworten: "Válaszok (az 1-4 számbillentyűvel is)",
  },

  tap: {
    aria: (n: number): string => `Ritmus kopogása: szóköz. Eddig ${n} ütés.`,
    vor: "Kopogj itt a ",
    stark: "szóközzel",
    nach: (n: number, von: number): string => ` - ${von} ütésből ${n}`,
    knopf: (n: number, von: number): string => `Kopogás (${n}/${von})`,
    puls: "Még nem egészen egyenletes - érezd az alaplüktetést, és tartsd nyugodtan.",
    kurz: "rövid",
    lang: "hosszú",
    fast: (muster: string): string => `Majdnem! A minta ez volt: ${muster}. Hallgasd meg még egyszer.`,
    genauImPuls: "Pontosan a lüktetésben!",
    genauImTakt: "Pontosan ütemre!",
  },

  spielen: {
    ariaKlaviatur: (namen: string): string =>
      `Utánjátszó billentyűzet: a D F G H J K L billentyű a ${namen} hang. A fel és le nyíl oktávot vált. `,
    ariaFrei: (n: number, von: number): string => `Játssz szabadon a bordun fölött - ${von} hangból eddig ${n} hang. `,
    ariaMemory: (laenge: number): string => `Jelenlegi hossz: ${laenge} hang. `,
    ariaTon: (i: number, von: number): string => `${i}. hang (összesen ${von}). `,
    ariaLesen:
      "Olvasókoncert: olvasd el a Braille-sort. Nyomd meg az Enter billentyűt vagy a „Kész, elolvastam” gombot, ha már a fejedben van.",
    lesenVor: "Olvasd el a sort Braille-ben - ",
    lesenStark: "nem",
    lesenMitte: " játsszuk le. Ha már a fejedben van, nyomd meg az ",
    lesenNach: " billentyűt vagy a „Kész, elolvastam” gombot.",
    fertigGelesen: "Kész, elolvastam",
    nachLesen: "Most játszd el emlékezetből - D F G H J K L, a nyíl oktávot vált.",
    freiVor: "Játssz szabadon a ",
    freiNach: (n: number, von: number): string => ` billentyűkkel (pentaton) - ${von} hangból ${n} · a kvint-bordun fölött`,
    nachspielenVor: "Játszd utánam a ",
    nachspielenMitte: " billentyűkkel - ",
    laenge: (n: number): string => `Hossz: ${n}`,
    tonVon: (i: number, von: number): string => `${i}. hang (összesen ${von})`,
    oktaveNach: (oktave: string): string => ` oktáv (${oktave})`,
    oktaveRauf: "Egy oktávval feljebb",
    oktaveRunter: "Egy oktávval lejjebb",
    freiGeschafft: (n: number): string =>
      `Szépen játszottál - ${n} hang! A műhelyt meglátogattad. A „Gyakorlás tovább” gombbal egyszerűen játszhatsz tovább.`,
    falscherTon: (gespielt: string, gesucht: string): string => `Ez ${gespielt} volt - a keresett hang: ${gesucht}.`,
    nichtsMehr: "semmi több",
    memoryWeiter: (n: number): string => `Sikerült - ${n} hang! Most jön még egy.`,
    memoryEnde: (best: number): string =>
      `Vége a körnek - egyhuzamban ${best} hangot sikerült eljátszanod. Még egyszer lejátszom a sort.`,
    genauRichtig: "Pontosan így!",
    fertig: "Kész.",
  },

  schreiben: {
    aria: (zelle: number, von: number): string =>
      `Braille-bevitel: az f d s és a j k l a pontok, a szóköz az ütemvonal. ${zelle}. cella (összesen ${von}). A Shift billentyű lenyomva tartva megmutatja és kimondja a cella billentyűit.`,
    nochmalAnhoeren: "Meghallgatás újra",
    diktat: "Hallgasd meg, ahányszor csak akarod - ez nem számít hibának. Aztán írd le cellánként, amit hallottál.",
    vor: "Írj a ",
    mitte: (zelle: number, von: number): string => ` billentyűkkel - ${zelle}. cella (összesen ${von}) · `,
    umschalt: "⇧ Shift",
    nach: " megmutatja a cellát",
    taktstrichTitel: "Ütemvonal (szóköz)",
    gedrueckt: (punkte: string): string => `Lenyomott pontok: ${punkte}`,
    aktuelleStelleLeertaste: "Aktuális hely: a szóköz - az ütemvonal.",
    genauRichtig: "Pontosan így!",
    fertig: "Kész.",
  },

  takt: {
    aria: (n: number): string =>
      `Ütemépítő: írj hangokat vagy szüneteket az f d s j k l billentyűkkel; mindegyik azonnal megszólal. A Backspace billentyű törli az utolsó cellát, az Enter ellenőrzi az ütemet. Eddig ${n} cella.`,
    vor: "Építsd fel az ütemet a ",
    mitte: " billentyűkkel - minden hang és szünet megszólal. ",
    loescht: " töröl, ",
    pruefen: (a: number, b: number): string => ` ellenőriz (ütemmutató: ${a}/${b}).`,
    nochLeer: "Még üres - kezdj hozzá.",
    taktPruefen: "Ütem ellenőrzése (Enter)",
    loeschen: "Törlés (⌫)",
    pause: "Szünet",
    /** Im Ungarischen ändert sich das Wort nach der Zahl nicht („2 ütés"). */
    nominativ: (dativ: string): string => dativ,
    /** Ungarisch hat ein eigenes Pausenwort („negyed szünet"). */
    pauseAus: (_notenwort: string, pausenwort: string): string => pausenwort,
    keineZelle: "Ez nem hang- vagy szünetcella. Válassz egy hangot (f d s j k l) vagy egy szünetet.",
    alsGelesen: (wert: string): string => ` - ${wert} értéknek olvasva, mert az még belefér`,
    zusammen: (label: string, ambi: string, summe: string, ganz: string, einheit: string): string =>
      `${label}${ambi}. Összesen ${summe} ${einheit}, a teljes ütem ${ganz} ${einheit}.`,
    letzteGeloescht: (anzahl: string, einheit: string): string => `Az utolsó cella törölve. Most: ${anzahl} ${einheit}.`,
    fehlen: (_einzahl: boolean, anzahl: string, einheit: string): string =>
      `Még ${anzahl} ${einheit} hiányzik a teljes ütemhez.`,
    zuViel: (_einzahl: boolean, anzahl: string, einheit: string): string =>
      `Ennyivel több a kelleténél: ${anzahl} ${einheit}. Vegyél el valamit.`,
    mindestensNoten: (n: number): string => `Az ütem tele van, de legalább ${n} hangnak kell benne lennie.`,
    mindestensPause: "Az ütem tele van - de legalább egy szünetnek is kell benne lennie.",
    voll: "Teljes ütem! Hallgasd meg.",
    vollSauber: "Pontosan tele - tiszta ütem! Hallgasd meg.",
  },

  werkstatt: {
    aria: (zellen: number, werke: number): string =>
      `Zeneszerző műhely: írj szabadon az f d s j k l billentyűkkel, a szóköz az ütemvonal. Meghallgatás, törlés és mentés a gombokkal. Eddig ${zellen} cella, 5 műből ${werke} elmentve.`,
    vor: "Írj szabadon a ",
    mitte: " billentyűkkel - szóköz = ütemvonal, ",
    nach: " törli az utolsó cellát.",
    leeresBlatt: "Üres lap - komponálj bátran.",
    anhoeren: "Meghallgatás",
    loeschen: "Törlés",
    nameFuerWerk: "A műved címe",
    speichern: "Mentés",
    nochNichtsGeschrieben: "Még semmit sem írtál - előbb írj néhány hangot.",
    geleert: "A műhely kiürítve.",
    schonFuenf: "Már öt művet mentettél. Törölj egyet, és akkor újra lehet menteni.",
    nochNichtsSpeichern: "Még nincs mit menteni.",
    meinWerk: (n: number): string => `Saját mű ${n}`,
    gespeichert: (name: string, n: number): string => `„${name}” elmentve. Most 5 műből ${n} a tiéd.`,
    gespeicherteListe: (namen: string, n: number): string => `Elmentve: ${namen} (${n}/5)`,
  },

  notenzeile: {
    handFokus: {
      rh: "Csak a jobb kéz (fent, violinkulcs)",
      lh: "Csak a bal kéz (lent, basszuskulcs)",
      both: "Mindkét kéz",
    },
    rechteHand: "Jobb kéz · violinkulcs",
    linkeHand: "Bal kéz · basszuskulcs",
  },

  touch: {
    gruppe: "Érintéses bevitel",
    anleitungVor: "Érintsd meg a cella pontjait, aztán ezt: ",
    zelleSetzen: "Cella beírása",
    anleitungNach: ".",
    punkteGruppe: "Egy cella hat pontja",
    punkt: (p: number): string => `${p}${PONT_RAG[p] ?? "-es"} pont`,
    taktstrich: "Ütemvonal",
    pause: "Szünet",
    letzteLoeschen: "Az utolsó cella törlése",
    taktPruefen: "Ütem ellenőrzése",
    bsiTitel: "A VoiceOver Braille-képernyőbevitele",
    bsiHinweis:
      "Állítsd a rotort Braille-képernyőbevitelre, és érintéssel írd be a cellákat ebbe a mezőbe. Egy ujjal jobbra söpörve ütemvonal kerül be, balra söpörve törlődik az utolsó cella.",
    testen: "Braille-bevitel kipróbálása - mi érkezik meg?",
    nochNichts: "Még nincs bevitel.",
    verlauf: (text: string, codepoints: string, ergebnis: string): string => `„${text}” (${codepoints}) → ${ergebnis}`,
    keineZelleErkannt: "nem ismerhető fel cella",
    nochKeinPunkt: "Még nincs pont kiválasztva. Előbb érintsd meg a pontokat, aztán a Cella beírása gombot.",
    unbekannt: (zeichen: string): string =>
      `Ezt a jelet nem tudom pontokként olvasni: ${zeichen}. Használd a pontgombokat.`,
  },
};
