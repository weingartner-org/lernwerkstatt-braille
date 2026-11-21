/**
 * Musikbegriffe und Beschriftungen der Notenzeichen (Bereich `musik`) - Magyar.
 * Fachwörter: ungarische Musiklehre (egész hang, fél hang, negyed hang, nyolcad hang,
 * tizenhatod hang; ötvonalas rendszer, kereszt, bé, feloldójel - aus `tonnamen.ts` Eintrag `hu`),
 * Notenschrift-Braille. Rhythmussilben nach Kodály (tá, ti-ti, tiri, Pausensilbe „szün").
 * Nach Zahlen steht im Ungarischen die Einzahl („2 ütés", „6 nyolcad").
 * Unsichere Wörter stehen im Bericht unter „Unsicher".
 */
import type { musik as MusikDe } from "../de/musik";

/** „kereszt" -> „keresztes" usw. (Eigenschaftswort vor dem Ton); unbekannte Wörter bleiben, wie sie sind. */
const MIT_ZEICHEN: Record<string, string> = {
  kereszt: "keresztes",
  "bé": "bés",
  "feloldójel": "feloldott",
};

export const musik: typeof MusikDe = {
  taktstrich: "ütemvonal",
  tonMitVorzeichen: (vorzeichen: string, ton: string): string => `${MIT_ZEICHEN[vorzeichen] ?? vorzeichen} ${ton}`,
  punktiert: "pontozott",
  mitHaltebogen: "kötőívvel",
  pausenSilbe: "szün",
  rhythmus: {
    ganze: "tá-á-á-á",
    halbe: "tá-á",
    viertel: "tá",
    achtel: "ti",
    sechzehntel: "tiri",
    achtelPaar: "ti-ti",
    sechzehntelVier: "tiri-tiri",
    punktiertSuffix: "-i",
  },
  schluessel: {
    violin: "violinkulcs",
    bass: "basszuskulcs",
    alt: "C-kulcs (például brácsa)",
  },
  artikulation: {
    staccato: "staccato (röviden elválasztva)",
    staccatissimo: "staccatissimo (nagyon röviden, élesen)",
    portato: "portato (hordozva, finoman elválasztva)",
    tenuto: "tenuto (teljes hosszában kitartva)",
    akzent: "akcentus (hangsúlyos)",
    marcato: "marcato (erősen hangsúlyos)",
  },
  dynamik: {
    p: "piano (halkan)",
    f: "forte (hangosan)",
    mf: "mezzoforte (közepesen hangosan)",
    pp: "pianissimo (nagyon halkan)",
    ff: "fortissimo (nagyon hangosan)",
  },
  verzierung: {
    vorschlag: "rövid előke",
    "vorschlag-lang": "hosszú előke",
    triller: "trilla",
    doppelschlag: "gruppetto",
    "doppelschlag-ueber": "gruppetto a hang fölött",
    pralltriller: "felső mordent",
    "pralltriller-lang": "hosszú felső mordent",
    mordent: "alsó mordent",
    "mordent-lang": "hosszú alsó mordent",
  },
  intervall: {
    2: "szekund (két fok)",
    3: "terc (három fok)",
    4: "kvart (négy fok)",
    5: "kvint (öt fok)",
    6: "szext (hat fok)",
    7: "szeptim (hét fok)",
    8: "oktáv (nyolc fok)",
  },
  finger: {
    1: "hüvelykujj (1-es ujj)",
    2: "mutatóujj (2-es ujj)",
    3: "középső ujj (3-as ujj)",
    4: "gyűrűsujj (4-es ujj)",
    5: "kisujj (5-ös ujj)",
  },
  hand: { r: "jobb kéz", l: "bal kéz" },
  akkord: {
    dim: "szűkített (kör)",
    halbdim: "félszűkített",
    maj7: "nagy szeptim (háromszög)",
    sept: "domináns szeptimakkord (dőlt 7)",
  },
  oktaven: {
    1: "kontra oktáv",
    2: "nagy oktáv",
    3: "kis oktáv",
    4: "egyvonalas oktáv",
    5: "kétvonalas oktáv",
    6: "háromvonalas oktáv",
    7: "négyvonalas oktáv",
  },
  /** Nach einer Zahl steht im Ungarischen die Einzahl: „1 ütés", „3 ütés", „6 nyolcad". */
  schlagEinheit: {
    achtel: { one: "nyolcad", many: "nyolcad" },
    sonst: { one: "ütés", many: "ütés" },
  },
  schlaege: (n: number): string => {
    const rounded = Math.round(n * 4) / 4;
    if (Number.isInteger(rounded)) return String(rounded);
    if (Math.abs((rounded % 1) - 0.5) < 1e-9) {
      const whole = Math.floor(rounded);
      if (whole === 0) return "fél";
      if (whole === 1) return "másfél";
      const WORDS = ["", "", "két", "három", "négy", "öt", "hat", "hét"];
      return WORDS[whole] ? `${WORDS[whole]} és fél` : `${whole},5`;
    }
    return String(rounded).replace(".", ",");
  },
};
