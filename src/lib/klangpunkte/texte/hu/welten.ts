/** Bereich `welten` - Magyar: Titel und Kurzbeschreibung der neun Klangwelten (Schlüssel = `key` in `welten.ts`). Namen sind freie Wortspiele. */
import type { welten as De } from "../de/welten";

export const welten: typeof De = {
  ohren: {
    title: "Fülhegyező",
    blurb: "Előbb hallgasd meg, aztán játszd el: lüktetés, hangmagasság, hangszín és visszhang - kapd el őket a füleddel.",
  },
  werkstatt: {
    title: "Hangjegyműhely",
    blurb: "Hangok, értékek, szünetek és ütem - a Braille-kotta alapjelei.",
  },
  lage: {
    title: "Keresztek és oktávok",
    blurb: "Módosítójelek, hangnemek, oktávjelek - és fürge kis értékek.",
  },
  ausdruck: {
    title: "Kifejezés",
    blurb: "Ívek, artikuláció, dinamika, tempó és díszítések - zene érzéssel.",
  },
  form: {
    title: "Formaépítő",
    blurb: "Ismétlések, voltaívek és formák - a Braille okosan rövidít, a fül meghallja a tervrajzot.",
  },
  zusammenklang: {
    title: "Összhang",
    blurb: "Két vagy több hang egyszerre: hangközök hallása és írása, dúr és moll, két szólam egy sorban.",
  },
  spielplatz: {
    title: "Elmélet-játszótér",
    blurb: "Skálák, kvintkör, diktálás és saját ütemek - kipróbálható zeneelmélet, Játékréttel és Zeneszerző műhellyel.",
  },
  instrumente: {
    title: "Hangszerismeret",
    blurb: "Hogyan írjuk le a hangszerek zenéjét: ujjrend, két kéz a zongorán, éneklés Braille-lel, gitár, számozott basszus és a partitúra felépítése.",
  },
  buehne: {
    title: "Dalszínpad",
    blurb: "Igazi dalok: meghallgatni, Braille-ben olvasni, kifejezéssel játszani és emlékezetből eljátszani.",
  },
};
