/**
 * Bereich `runner` - Čeština (plocha cvičení: `KlangpunkteRunner.tsx`, `NotenZeile.tsx`,
 * `KlangpunkteTouchEingabe.tsx`). Aufgabentexte (`prompt`, `explain`) stehen in den
 * Aufgaben-Bereichen, nicht hier. Kinder: „ty". Vor Zahlen `zZe()` statt festem „z/ze",
 * Zähl-Einheit „doba" über `jednotkaCs` (1 doba, 2-4 doby, 5 dob, půl doby).
 * Unsichere Wörter stehen im Bericht unter „Unsicher".
 */
import type { runner as De } from "../de/runner";
import { zZe } from "@/lib/bedienSprache/predlozkyCs";
import { jednotkaCs } from "./musik";

/** Tvar podstatného jména podle počtu: 1 · 2-4 · 0 a 5+. */
const tvarCs = (n: number, one: string, few: string, many: string): string =>
  n === 1 ? one : n >= 2 && n <= 4 ? few : many;

/** „3 ze 4", „1 z 5" - die Präposition passt zur Zahl. */
const zCs = (n: number, von: number): string => `${n} ${zZe(von)} ${von}`;

export const runner: typeof De = {
  kopf: {
    anhoeren: "Poslechnout",
    stopp: "Stop",
    anhoerenTitel: "Poslechnout úkol (Alt + W ho navíc přečte)",
    instrument: "Nástroj",
    namenKnopf: "do-re-mi",
    namenTitel: (a: string, b: string): string => `Jména not jako ${a} (pevná solmizace) místo ${b}`,
    rhythmusKnopf: "ta ti-ti",
    rhythmusTitel: "Rytmické slabiky: za hodnotami not navíc říkat ta, ti-ti",
    anderesLied: "Jiná písnička",
    namenAn: (a: string, b: string, c: string): string => `Jména not: ${a}, ${b}, ${c}.`,
    rhythmusAn: "Rytmické slabiky zapnuté: ta, ti-ti.",
    rhythmusAus: "Rytmické slabiky vypnuté.",
    zurueckLiedauswahl: "Zpět na výběr písniček.",
  },

  aufgabe: {
    liesBrailleZeile: "Přečti braillský řádek.",
    handNurKlavier: "Přepínání ruky platí jen v klavírní kapitole se dvěma řádky.",
    weiter: (prompt: string): string => `Jdeme dál. ${prompt}`,
    zeichenlisteHinweis: "Všechny notové znaky této etapy najdeš v seznamu znaků: Alt a L.",
    songGanzGeschafft: (titel: string): string => `${titel} - celá hotová!`,
    songZeile: (zeile: number, von: number): string => ` · řádek ${zCs(zeile, von)}`,
  },

  geschafft: {
    geschafft: "Hotovo!",
    mitSternen: (n: number): string => `Hotovo! Hvězdičky: ${n} ze 3, výborně!`,
    alsNaechstesAnsage: (titel: string): string => ` Teď přijde: ${titel}.`,
    alsNaechstesKarte: (titel: string): string => `Teď přijde: ${titel}`,
    weiterUeben: "Cvičit dál",
    weiter: "Dál",
  },
  fortschritt: {
    caption: "Cvičení",
    aria: (n: number, min: number, prozent: number): string =>
      `Pokrok v etapě: hotové úkoly ${n}, potřeba aspoň ${min}, hotovo ${prozent} %.`,
    rundeGeschafft: "Kolo je hotové - etapa sedí.",
    runde: (n: number, min: number, noch: number): string =>
      `Kolo: hotové úkoly ${n}, potřeba aspoň ${min}` +
      (noch > 0 ? `, chybí ještě aspoň ${noch} ${tvarCs(noch, "úkol", "úkoly", "úkolů")}.` : ", za chvíli etapa sedí."),
  },

  lieder: {
    kinder: "🧒 Dětské písničky",
    erwachsene: "🎼 Klasika a evergreeny",
  },

  hand: {
    hinweis: (f: "both" | "rh" | "lh"): string =>
      " - jednu ruku vidět zvětšeně a slyšet samostatně (" +
      (f === "rh"
        ? "teď: jen pravá ruka"
        : f === "lh"
          ? "teď: jen levá ruka"
          : "teď: obě ruce") +
      ")",
  },

  wahl: {
    richtig: "Správně!",
    richtigWaere: (antwort: string): string => `Správně je: ${antwort}.`,
    antworten: "Odpovědi (také číselné klávesy 1 až 4)",
  },

  tap: {
    aria: (n: number): string => `Vyťukat rytmus: mezerník. Zatím ${n} ${tvarCs(n, "úder", "údery", "úderů")}.`,
    vor: "Ťukej tady klávesou ",
    stark: "mezerník",
    nach: (n: number, von: number): string => ` - údery: ${zCs(n, von)}`,
    knopf: (n: number, von: number): string => `Úder (${zCs(n, von)})`,
    puls: "Ještě to není úplně pravidelné - ucíť základní dobu a drž ji v klidu.",
    kurz: "krátce",
    lang: "dlouze",
    fast: (muster: string): string => `Skoro! Vzor byl: ${muster}. Poslechni si to ještě jednou.`,
    genauImPuls: "Přesně v pulsu!",
    genauImTakt: "Přesně v taktu!",
  },

  spielen: {
    ariaKlaviatur: (namen: string): string =>
      `Klaviatura na přehrávání: D F G H J K L jsou ${namen}. Šipka nahoru a dolů mění oktávu. `,
    ariaFrei: (n: number, von: number): string => `Hraj volně nad bordunem - zahráno ${zCs(n, von)} tónů. `,
    ariaMemory: (laenge: number): string => `Aktuální délka: ${laenge} ${tvarCs(laenge, "tón", "tóny", "tónů")}. `,
    ariaTon: (i: number, von: number): string => `Tón ${zCs(i, von)} je na řadě. `,
    ariaLesen:
      "Koncert čtení: Přečti braillský řádek. Stiskni Enter nebo „Dočteno“, až ho máš v hlavě.",
    lesenVor: "Přečti řádek v Braillově písmu - ",
    lesenStark: "nebude",
    lesenMitte: " se přehrávat. Až ho máš v hlavě, stiskni ",
    lesenNach: " nebo „Dočteno\".",
    fertigGelesen: "Dočteno",
    nachLesen: "Teď zahraj zpaměti - D F G H J K L, šipka mění oktávu.",
    freiVor: "Hraj volně klávesami ",
    freiNach: (n: number, von: number): string => ` (pentatonika) - tóny: ${zCs(n, von)} · nad kvintovým bordunem`,
    nachspielenVor: "Zahraj po mně klávesami ",
    nachspielenMitte: " - ",
    laenge: (n: number): string => `Délka: ${n}`,
    tonVon: (i: number, von: number): string => `Tón ${zCs(i, von)}`,
    oktaveNach: (oktave: string): string => ` oktáva (${oktave})`,
    oktaveRauf: "Oktáva nahoru",
    oktaveRunter: "Oktáva dolů",
    freiGeschafft: (n: number): string =>
      `Pěkně zahráno - ${n} ${tvarCs(n, "tón", "tóny", "tónů")}! Dílna je navštívená. Přes „Cvičit dál“ prostě hraješ dál.`,
    falscherTon: (gespielt: string, gesucht: string): string => `To bylo ${gespielt} - hledaný tón je ${gesucht}.`,
    nichtsMehr: "už nic",
    memoryWeiter: (n: number): string => `Hotovo - ${n} ${tvarCs(n, "tón", "tóny", "tónů")}! Teď jeden přibude.`,
    memoryEnde: (best: number): string =>
      `Konec kola - povedlo se ti zahrát ${best} ${tvarCs(best, "tón", "tóny", "tónů")} v kuse. Zahraju tu řadu ještě jednou.`,
    genauRichtig: "Přesně tak!",
    fertig: "Hotovo.",
  },

  schreiben: {
    aria: (zelle: number, von: number): string =>
      `Braillský vstup: f d s a j k l jsou body, mezerník je taktová čára. Buňka ${zCs(zelle, von)} je na řadě. Podržený Shift ukáže a řekne klávesy buňky.`,
    nochmalAnhoeren: "Poslechnout znovu",
    diktat: "Poslouchej, kolikrát chceš - nepočítá se to jako chyba. Pak napiš buňku po buňce, co slyšíš.",
    vor: "Piš klávesami ",
    mitte: (zelle: number, von: number): string => ` - buňka ${zCs(zelle, von)} · `,
    umschalt: "⇧ Shift",
    nach: " ukáže buňku",
    taktstrichTitel: "Taktová čára (mezerník)",
    gedrueckt: (punkte: string): string => `Stisknuto: body ${punkte}`,
    aktuelleStelleLeertaste: "Aktuální místo: mezerník - taktová čára.",
    genauRichtig: "Přesně tak!",
    fertig: "Hotovo.",
  },

  takt: {
    aria: (n: number): string =>
      `Stavitel taktů: Piš klávesami f d s j k l noty nebo pomlky; každá hned zazní. Backspace smaže poslední buňku, Enter takt zkontroluje. Zatím ${n} ${tvarCs(n, "buňka", "buňky", "buněk")}.`,
    vor: "Postav takt klávesami ",
    mitte: " - každá nota nebo pomlka zazní. ",
    loescht: " maže, ",
    pruefen: (a: number, b: number): string => ` kontroluje. Taktové označení: ${a}/${b}.`,
    nochLeer: "Ještě prázdné - pusť se do toho.",
    taktPruefen: "Zkontrolovat takt (Enter)",
    loeschen: "Smazat (⌫)",
    pause: "Pomlka",
    /** Die passende Form bildet erst `jednotkaCs` in den Sätzen unten. */
    nominativ: (dativ: string): string => dativ,
    /** Das Pausenwort steht in `tonnamen.ts` schon fertig („čtvrťová pomlka"). */
    pauseAus: (_notenwort: string, pausenwort: string): string => pausenwort,
    keineZelle: "To není buňka noty ani pomlky. Vezmi notu (f d s j k l) nebo pomlku.",
    alsGelesen: (wert: string): string => ` - čteno jako ${wert}, protože se to ještě vejde`,
    zusammen: (label: string, ambi: string, summe: string, ganz: string, einheit: string): string =>
      `${label}${ambi}. Celkem: ${summe} ${jednotkaCs(summe, einheit)}. Plný takt: ${ganz} ${jednotkaCs(ganz, einheit)}.`,
    letzteGeloescht: (anzahl: string, einheit: string): string =>
      `Poslední buňka smazána. Teď: ${anzahl} ${jednotkaCs(anzahl, einheit)}.`,
    fehlen: (_einzahl: boolean, anzahl: string, einheit: string): string =>
      `Do plného taktu ještě chybí ${anzahl} ${jednotkaCs(anzahl, einheit)}.`,
    zuViel: (_einzahl: boolean, anzahl: string, einheit: string): string =>
      `Navíc: ${anzahl} ${jednotkaCs(anzahl, einheit)}. Něco uber.`,
    mindestensNoten: (n: number): string =>
      `Takt je plný, ale not má být aspoň ${n}. Přidej noty místo pomlk.`,
    mindestensPause: "Takt je plný - ale má v něm být aspoň jedna pomlka.",
    voll: "Plný takt! Poslechni si ho.",
    vollSauber: "Přesně plný - čistý takt! Poslechni si ho.",
  },

  werkstatt: {
    aria: (zellen: number, werke: number): string =>
      `Skladatelská dílna: Piš volně klávesami f d s j k l, mezerník je taktová čára. Poslechnout, smazat a uložit jde přes tlačítka. Zatím ${zellen} ${tvarCs(zellen, "buňka", "buňky", "buněk")}, uložená díla: ${werke} z 5 možných.`,
    vor: "Piš volně klávesami ",
    mitte: " - mezerník = taktová čára, ",
    nach: " smaže poslední buňku.",
    leeresBlatt: "Prázdný list - pusť se do skládání.",
    anhoeren: "Poslechnout",
    loeschen: "Smazat",
    nameFuerWerk: "Název tvého díla",
    speichern: "Uložit",
    nochNichtsGeschrieben: "Ještě tu nic není - nejdřív napiš pár not.",
    geleert: "Dílna je vyprázdněná.",
    schonFuenf: "Uložených děl máš už pět. Jedno smaž, pak to zase půjde.",
    nochNichtsSpeichern: "Zatím není co uložit.",
    meinWerk: (n: number): string => `Moje dílo ${n}`,
    gespeichert: (name: string, n: number): string => `„${name}" je uložené. Uložená díla: ${n} z 5 možných.`,
    gespeicherteListe: (namen: string, n: number): string => `Uloženo: ${namen} (${n} z 5)`,
  },

  notenzeile: {
    handFokus: {
      rh: "Jen pravá ruka (nahoře, houslový klíč)",
      lh: "Jen levá ruka (dole, basový klíč)",
      both: "Obě ruce",
    },
    rechteHand: "Pravá ruka · houslový klíč",
    linkeHand: "Levá ruka · basový klíč",
  },

  touch: {
    gruppe: "Zadávání dotykem",
    anleitungVor: "Dotkni se bodů buňky, potom ",
    zelleSetzen: "Vložit buňku",
    anleitungNach: ".",
    punkteGruppe: "Šest bodů jedné buňky",
    punkt: (p: number): string => `Bod ${p}`,
    taktstrich: "Taktová čára",
    pause: "Pomlka",
    letzteLoeschen: "Smazat poslední buňku",
    taktPruefen: "Zkontrolovat takt",
    bsiTitel: "Braillský vstup na obrazovce ve VoiceOveru",
    bsiHinweis:
      "Nastav rotor na braillský vstup na obrazovce a piš buňky do tohoto pole. Přejetí jedním prstem doprava je taktová čára, doleva smaže poslední buňku.",
    testen: "Vyzkoušet braillský vstup - co dorazí?",
    nochNichts: "Zatím nic nezadáno.",
    verlauf: (text: string, codepoints: string, ergebnis: string): string => `„${text}" (${codepoints}) → ${ergebnis}`,
    keineZelleErkannt: "žádná buňka nerozpoznána",
    nochKeinPunkt: "Zatím není vybraný žádný bod. Nejdřív se dotkni bodů, potom Vložit buňku.",
    unbekannt: (zeichen: string): string =>
      `Znak ${zeichen} nejde přečíst jako body. Použij tlačítka bodů.`,
  },
};
