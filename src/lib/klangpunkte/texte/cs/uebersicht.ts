/**
 * Bereich `uebersicht` - Čeština: die Shell (`Klangpunkte.tsx`: výběr kapitol, hlášení,
 * odznaky, denní mix), das Akustik-Menü und die Klassen-Matrix für Lehrkräfte.
 * Kinder: „ty"; Lehrkraft-Texte unpersönlich. Vor Zahlen: `zZe()` statt festem „z/ze",
 * Mehrzahl 1 / 2-4 / 5+. Unsichere Wörter stehen im Bericht unter „Unsicher".
 */
import type { uebersicht as De } from "../de/uebersicht";
import { zZe } from "@/lib/bedienSprache/predlozkyCs";

/** Tvar podstatného jména podle počtu: 1 · 2-4 · 0 a 5+. */
const tvarCs = (n: number, one: string, few: string, many: string): string =>
  n === 1 ? one : n >= 2 && n <= 4 ? few : many;

export const uebersicht: typeof De = {
  // --- Hlášení a zprávy -----------------------------------------------------
  kapitelwahlAnsage: "Výběr kapitol. Všechny kapitoly si můžeš vybrat volně - hvězdičky ukazují, jak ti to jde.",
  kapitelAnsage: (nr: number, welt: string, i: number, n: number, kapitel: string) =>
    `Zvukový svět ${nr}, ${welt} - kapitola ${i} ${zZe(n)} ${n}: ${kapitel}.`,
  kapitelAnsageOhneWelt: (kapitel: string) => `Kapitola: ${kapitel}.`,
  neuesAbzeichen: (name: string) => `Nový odznak: ${name}!`,
  neueAbzeichen: (namen: string[]) => `Nové odznaky: ${namen.join(", ")}!`,
  geschafftMitSternen: (sterne: number) => `Hotovo! +30 XP · hvězdičky za tuto kapitolu: ${sterne} ze 3`,
  geschafft: "Hotovo! +30 XP",
  zeichenlisteOffen: "Seznam znaků je otevřený.",
  zeichenlisteZu: "Seznam znaků je zavřený.",
  weltInArbeit: (nr: number, name: string) =>
    `Zvukový svět ${nr}, ${name}, se ještě připravuje - přijde v pozdější verzi.`,
  zeichenAreaLabel: "Klangpunkte",
  zeichenAreaBlurb: "Braillské noty: poslouchat, hmatat, psát.",

  // --- Horní lišta ----------------------------------------------------------
  rangCaption: "Hodnost",
  rangLabel: (level: number, rest: number) => `Hodnost ${level} - do další hodnosti chybí ještě ${rest} XP.`,
  xpHinweis: (xp: number) => `${xp} XP - 2 za každou správnou odpověď, 30 za kapitolu.`,
  xpText: (xp: number) => `${xp} XP`,
  sterneHinweis: (n: number, max: number) => `Hvězdičky: ${n} ${zZe(max)} ${max} - až 3 za kapitolu.`,
  weltName: (nr: number, titel: string) => `Zvukový svět ${nr}: ${titel}`,
  weltKopf: (nr: number, titel: string, i: number, n: number) =>
    `Zvukový svět ${nr}: ${titel} - kapitola ${i} ${zZe(n)} ${n}`,
  voriges: "Předchozí kapitola",
  naechstes: "Další kapitola",
  kapitelSelect: "Vybrat kapitolu - listovat šipkou nahoru a dolů",
  kapitelOption: (i: number, titel: string, sterne: number | null) =>
    `Kapitola ${i}: ${titel}${sterne === null ? "" : ` - zvládnuto, hvězdičky: ${sterne} ze 3`}`,
  landkarte: (kapitel: number, welten: number) =>
    `${kapitel} ${tvarCs(kapitel, "kapitola", "kapitoly", "kapitol")}, ${welten} ${tvarCs(welten, "zvukový svět", "zvukové světy", "zvukových světů")} - všechno si můžeš vybrat volně`,
  kapitelwahlKnopf: "Výběr kapitol",
  kapitelwahlTitel: "Všechny zvukové světy a kapitoly s tvými hvězdičkami (Alt + U)",
  zeichenlisteKnopf: "Seznam znaků",
  zeichenlisteTitel: "Seznam všech notových znaků seřazený podle tvé cesty učení (Alt + L)",

  // --- Výběr kapitol --------------------------------------------------------
  kapitelwahlUeberschrift: "Výběr kapitol - vyber si, co chceš cvičit",
  mixTitel: "Denní mix",
  mixText: "Pět minut pestře namícháno - úkoly napříč tvými zvládnutými kapitolami, bez hvězdiček, jen pro udržení kondice.",
  loslegen: "Začít",
  mixZuWenig: (n: number) =>
    `Zvládnuté kapitoly zatím: ${n} - nejdřív zvládni aspoň 3, pak tu bude tvůj denní mix.`,
  weltStand: (fertig: number, n: number, sterne: number, max: number) =>
    `Zvládnuté kapitoly: ${fertig} ${zZe(n)} ${n} · hvězdičky: ${sterne} ${zZe(max)} ${max}`,
  kapitelZeile: (i: number, titel: string) => `Kapitola ${i}: ${titel}`,
  werkeText: (n: number) => ` · uložená díla: ${n} z 5`,
  besucht: "✓ navštíveno",
  srBesucht: "- navštíveno.",
  srNichtBesucht: "- zatím nenavštíveno.",
  srGemeistert: (sterne: number) => `- zvládnuto (hvězdičky: ${sterne} ze 3).`,
  srNichtGemeistert: "- zatím nezvládnuto.",

  // --- Galerie odznaků ------------------------------------------------------
  abzeichenTitel: "Odznaky",
  abzeichenStand: (verdient: number, alle: number) =>
    `Získané odznaky: ${verdient} ${zZe(alle)} ${alle} - sbírej hvězdičky, zvládej světy, piš diktáty, stavěj takty a hraj písničky zpaměti.`,
  geheimAbzeichen: "Tajný odznak",
  geheimBeschreibung: "Ještě zamčeno - zjisti, co se skrývá!",
  srVerdient: "získáno.",
  srGeheim: "tajné, zatím nezískáno.",
  srNichtVerdient: "zatím nezískáno.",

  // --- Denní mix ------------------------------------------------------------
  mixIntro:
    "Denní mix - krátké, pestré opakování napříč tvými zvládnutými kapitolami. V klidu: nic se tu nepočítá a hvězdičky tu nejsou.",
  mixStart: (n: number) => `Denní mix začíná - zvládnuté kapitoly: ${n}, pět minut opakování.`,
  mixEnde: (vomKind: boolean, richtig: number, gesamt: number) =>
    `${vomKind ? "Kolo skončilo." : "Čas vypršel!"} Správně vyřešeno: ${richtig} ${zZe(gesamt)} ${gesamt} ${gesamt === 1 ? "úkolu" : "úkolů"}.`,
  mixGeschafft: "Denní mix je hotový!",
  mixErgebnis: (richtig: number, gesamt: number) =>
    `Správně: ${richtig} ${zZe(gesamt)} ${gesamt} ${gesamt === 1 ? "úkolu" : "úkolů"}`,
  mixProzent: (pct: number) => ` · ${pct} %`,
  mixFein: "Pěkné opakování - postup ve hře zůstává, jak byl.",
  nochEineRunde: "Ještě jedno kolo",
  zurKapitelwahl: "Zpět na výběr kapitol",
  mixBunt: (n: number) => `Pestrý mix ze zvládnutých kapitol (počet: ${n})`,
  mixTimer: (min: number, sek: number) =>
    `Zbývající čas: ${min} ${tvarCs(min, "minuta", "minuty", "minut")} a ${sek} ${tvarCs(sek, "sekunda", "sekundy", "sekund")}`,
  mixRichtigLabel: (richtig: number, gesamt: number) => `Správně: ${richtig} ${zZe(gesamt)} ${gesamt}`,
  mixRichtig: "správně",
  beenden: "Ukončit",

  // --- Nabídka zvuku --------------------------------------------------------
  akustikMusik: "Hudba",
  akustikMusikErklaerung:
    "Nástroje hrají noty z úkolů. Jsou součástí úkolu - proto se nedají vypnout, jen ztišit.",
  akustikInstrument: "Nástroj",
  akustikInstrumentErklaerung: "Jakým nástrojem noty zazní. Po změně zahraje na ukázku tón c.",
  akustikLautstaerke: "Hlasitost hudby",
  akustikLautstaerkeErklaerung:
    "Jak nahlas nástroje hrají. 100 % je zhruba stejně nahlas jako hlas. Úplně ztichne hudba jen při 0 %.",

  // --- Přehled třídy (vyučující) --------------------------------------------
  matrixSterne: (n: number) => `${n} ${tvarCs(n, "hvězdička", "hvězdičky", "hvězdiček")}`,
  matrixLaedt: "načítá se",
  matrixKapitelImEinzelnen: "Kapitoly podrobně",
  matrixAufklappLabel: (name: string, offen: boolean) =>
    `Kapitoly podrobně: ${name} - ${offen ? "sbalit" : "rozbalit"}`,
  matrixAufklappTipp: (name: string) => `Kapitoly - ${name}: každá kapitola s hvězdičkami.`,
  matrixWeltSr: (nr: number, titel: string, fertig: number, n: number, sterne: string) =>
    `Zvukový svět ${nr}, ${titel}: zvládnuté kapitoly ${fertig} ${zZe(n)} ${n}, ${sterne}.`,
  matrixGesamtSr: (fertig: number, n: number, sterne: string) =>
    `Celkem zvládnuté kapitoly ${fertig} ${zZe(n)} ${n}, ${sterne}.`,
  matrixRegion: (name: string) => `Kapitoly podrobně: ${name}`,
  matrixGemeistert: (sterne: string) => `zvládnuto, ${sterne}`,
  matrixNichtGemeistert: "zatím nezvládnuto",
  matrixTabelle: "Pokrok třídy v Klangpunkte",
  matrixName: "Jméno",
  matrixWeltKurz: (nr: number) => `S${nr}`,
  matrixWeltTitel: (nr: number, titel: string) => `Zvukový svět ${nr}: ${titel}`,
  matrixWeltSpalteSr: (nr: number, titel: string) => `: zvukový svět ${nr}, ${titel}`,
  matrixGesamt: "Celkem",
  matrixZuletzt: "Naposledy",
  matrixFuss:
    "Číslo v políčku = zvládnuté kapitoly tohoto zvukového světa. Šipka před jménem ukáže každou kapitolu s hvězdičkami. Zobrazuje se přesně to, co dítě vidí samo o sobě - nic víc.",
};
