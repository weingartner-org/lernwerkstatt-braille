/**
 * Bereich `abzeichen` - Čeština: skupiny, názvy a popisy odznaků
 * (Schlüssel = Abzeichen-Id in `badges.ts`). Namen sind freie Wortspiele ohne Personenwörter
 * (kein „sběratel", „mistr", „král" - die gäbe es nur männlich oder weiblich).
 * Mehrzahl 1 / 2-4 / 5+. Unsichere Wörter stehen im Bericht unter „Unsicher".
 */
import type { abzeichen as De } from "../de/abzeichen";

/** Tvar podstatného jména podle počtu: 1 · 2-4 · 0 a 5+. */
const tvarCs = (n: number, one: string, few: string, many: string): string =>
  n === 1 ? one : n >= 2 && n <= 4 ? few : many;

export const abzeichen: typeof De = {
  gruppen: {
    sterne: "Hvězdičky",
    bestnote: "Tři hvězdičky",
    klangwelten: "Zvukové světy",
    diktat: "Diktát",
    baumeister: "Stavba taktů",
    lese: "Koncert čtení",
    lieder: "Písničkové pódium",
    geheim: "Tajné",
  },
  namen: {
    "stern-1": "Padající hvězda",
    "stern-2": "Hrst hvězd",
    "stern-3": "Lapač hvězd",
    "stern-4": "Hvězdné nebe",
    "drei-1": "První trefa do černého",
    "drei-2": "Sbírka tří hvězdiček",
    "drei-3": "Zářivá hudba",
    "welt-1": "Objevná výprava",
    "welt-2": "Pouť po světech",
    "welt-3": "Dobyté světy",
    "welt-4": "Koruna všech světů",
    "diktat-1": "Diktátová lupa",
    "diktat-2": "Mistrovský diktát",
    "takt-1": "Taktová cihla",
    "takt-2": "Architektura taktů",
    "lese-1": "Čtení z listu",
    "lese-2": "Koncertní čtení",
    "lied-1": "Debut na pódiu",
    "lied-2": "Láska k písničkám",
    "lied-3": "Hvězda pódia",
    "erstes-werk": "Malá skladba",
    "voller-schrank": "Plná skříň skladeb",
    "alles-gemeistert": "Koruna zvuků",
  },
  sterneGesammelt: (n: number) => `Nasbíráno ${n} ${tvarCs(n, "hvězdička", "hvězdičky", "hvězdiček")}.`,
  ersterVolltreffer: "První kapitola zvládnutá se 3 hvězdičkami.",
  volltreffer: (n: number) => `Zvládnuto se 3 hvězdičkami: ${n} ${tvarCs(n, "kapitola", "kapitoly", "kapitol")}.`,
  welt1: "Zvládnutý celý zvukový svět.",
  welt2: "Zvládnuté tři zvukové světy.",
  welt3: "Zvládnutých šest zvukových světů.",
  welt4: "Zvládnutých všech devět zvukových světů.",
  diktate: (n: number) => `Bez chyby napsáno: ${n} ${tvarCs(n, "diktát", "diktáty", "diktátů")}.`,
  takte: (n: number) => `Postaveno: ${n} ${tvarCs(n, "plný takt", "plné takty", "plných taktů")}.`,
  zeilen: (n: number) => `Zpaměti a bez chyby zahráno: ${n} ${tvarCs(n, "řádek", "řádky", "řádků")}.`,
  lied1: "První písnička zahraná celá.",
  lieder: (n: number) => `Celé zahráno: ${n} ${tvarCs(n, "různá písnička", "různé písničky", "různých písniček")}.`,
  erstesWerk: "První vlastní skladba je uložená.",
  vollerSchrank: "Pět vlastních skladeb v polici - skříň je plná.",
  alleKapitel: "Zvládnuté všechny kapitoly Klangpunkte.",
};
