/**
 * Bereich `abzeichen` - Magyar: Gruppen, Namen und Beschreibungen der Abzeichen
 * (Schlüssel = Abzeichen-Id in `badges.ts`). Namen sind freie, kindgerechte Wortspiele.
 * Nach einer Zahl steht im Ungarischen die Einzahl („5 csillag", „3 diktálás").
 */
import type { abzeichen as De } from "../de/abzeichen";

export const abzeichen: typeof De = {
  gruppen: {
    sterne: "Csillagok",
    bestnote: "Csúcsjegy",
    klangwelten: "Hangvilágok",
    diktat: "Diktálás",
    baumeister: "Ütemépítő",
    lese: "Olvasókoncert",
    lieder: "Dalszínpad",
    geheim: "Titkos",
  },
  namen: {
    "stern-1": "Hullócsillag",
    "stern-2": "Csillaggyűjtő",
    "stern-3": "Csillagvadász",
    "stern-4": "Csillagos ég",
    "drei-1": "Első telitalálat",
    "drei-2": "Csúcsjegy-gyűjtő",
    "drei-3": "Ragyogó zenész",
    "welt-1": "Világfelfedező",
    "welt-2": "Világvándor",
    "welt-3": "Világhódító",
    "welt-4": "Minden világ mestere",
    "diktat-1": "Diktálásdetektív",
    "diktat-2": "Diktálásmester",
    "takt-1": "Ütemkőműves",
    "takt-2": "Ütemépítész",
    "lese-1": "Lapról olvasó",
    "lese-2": "Koncertolvasó",
    "lied-1": "Színpadi bemutatkozás",
    "lied-2": "Dalkedvelő",
    "lied-3": "Színpadi sztár",
    "erstes-werk": "Kis zeneszerző",
    "voller-schrank": "Tele a polc",
    "alles-gemeistert": "Hangkirály",
  },
  sterneGesammelt: (n: number) => `${n} csillag összegyűjtve.`,
  ersterVolltreffer: "Az első fejezet 3 csillaggal teljesítve.",
  volltreffer: (n: number) => `${n} fejezet 3 csillaggal teljesítve.`,
  welt1: "Egy teljes hangvilág teljesítve.",
  welt2: "Három hangvilág teljesítve.",
  welt3: "Hat hangvilág teljesítve.",
  welt4: "Mind a kilenc hangvilág teljesítve.",
  diktate: (n: number) => `${n} diktálás hiba nélkül megírva.`,
  takte: (n: number) => `${n} teljes ütem megépítve.`,
  zeilen: (n: number) => `${n} sor hibátlanul, emlékezetből eljátszva.`,
  lied1: "Az első dal végigjátszva.",
  lieder: (n: number) => `${n} különböző dal végigjátszva.`,
  erstesWerk: "Az első saját mű elmentve.",
  vollerSchrank: "Öt saját mű a polcon - tele a szekrény.",
  alleKapitel: "A Klangpunkte minden fejezete teljesítve.",
};
