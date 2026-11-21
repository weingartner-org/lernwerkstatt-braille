/**
 * Bereich `abzeichen` - Polski: grupy, nazwy i opisy odznak.
 * Opisy w formie bezosobowej (zebrano, opanowano) - bez czasu przeszłego z rodzajem.
 * Nazwy odznak to swobodne gry słów; niepewne słowa są w raporcie pod „Unsicher".
 */
import type { abzeichen as De } from "../de/abzeichen";

/** Liczba mnoga po polsku: 1 / 2-4 (bez 12-14) / 5+. */
const lm = (n: number, jeden: string, kilka: string, wiele: string): string => {
  if (n === 1) return jeden;
  const r10 = n % 10;
  const r100 = n % 100;
  return r10 >= 2 && r10 <= 4 && (r100 < 12 || r100 > 14) ? kilka : wiele;
};

export const abzeichen: typeof De = {
  gruppen: {
    sterne: "Gwiazdki",
    bestnote: "Najlepszy wynik",
    klangwelten: "Światy dźwięków",
    diktat: "Dyktando",
    baumeister: "Budowniczy",
    lese: "Koncert czytania",
    lieder: "Scena piosenek",
    geheim: "Tajemnica",
  },
  namen: {
    "stern-1": "Spadająca gwiazdka",
    "stern-2": "Zbieracz gwiazdek",
    "stern-3": "Łowca gwiazd",
    "stern-4": "Gwiaździste niebo",
    "drei-1": "Pierwszy strzał w dziesiątkę",
    "drei-2": "Kolekcja szóstek",
    "drei-3": "Muzyczny blask",
    "welt-1": "Odkrywca światów",
    "welt-2": "Wędrowiec światów",
    "welt-3": "Zdobywca światów",
    "welt-4": "Mistrz wszystkich światów",
    "diktat-1": "Detektyw dyktand",
    "diktat-2": "Mistrz dyktand",
    "takt-1": "Murarz taktów",
    "takt-2": "Architekt taktów",
    "lese-1": "Czytelnik nut",
    "lese-2": "Koncertowy czytelnik",
    "lied-1": "Debiut na scenie",
    "lied-2": "Miłośnik piosenek",
    "lied-3": "Gwiazda sceny",
    "erstes-werk": "Mały kompozytor",
    "voller-schrank": "Pełna szafa utworów",
    "alles-gemeistert": "Król dźwięków",
  },
  sterneGesammelt: (n: number) => `Zebrano ${n} ${lm(n, "gwiazdkę", "gwiazdki", "gwiazdek")}.`,
  ersterVolltreffer: "Pierwszy rozdział opanowany na 3 gwiazdki.",
  volltreffer: (n: number) => `${n} ${lm(n, "rozdział opanowany", "rozdziały opanowane", "rozdziałów opanowanych")} na 3 gwiazdki.`,
  welt1: "Cały świat dźwięków opanowany.",
  welt2: "Trzy światy dźwięków opanowane.",
  welt3: "Sześć światów dźwięków opanowanych.",
  welt4: "Wszystkie dziewięć światów dźwięków opanowanych.",
  diktate: (n: number) => `${n} ${lm(n, "dyktando napisane", "dyktanda napisane", "dyktand napisanych")} bez błędu.`,
  takte: (n: number) => `${n} ${lm(n, "pełny takt zbudowany", "pełne takty zbudowane", "pełnych taktów zbudowanych")} od początku do końca.`,
  zeilen: (n: number) => `${n} ${lm(n, "linijka zagrana", "linijki zagrane", "linijek zagranych")} z pamięci bez błędu.`,
  lied1: "Pierwsza piosenka zagrana do końca.",
  lieder: (n: number) => `${n} ${lm(n, "piosenka zagrana", "różne piosenki zagrane", "różnych piosenek zagranych")} do końca.`,
  erstesWerk: "Pierwszy własny utwór zapisany.",
  vollerSchrank: "Pięć własnych utworów na półce - szafa jest pełna.",
  alleKapitel: "Wszystkie rozdziały Klangpunkte opanowane.",
};
