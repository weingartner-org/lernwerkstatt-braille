/**
 * Musikbegriffe und Beschriftungen der Notenzeichen (Bereich `musik`) - Svenska.
 * Fachwörter: svensk musikteori (helnot, halvnot, fjärdedelsnot ...), Notenschrift-Braille.
 * Unsichere Wörter stehen im Bericht unter „Unsicher".
 */
import type { musik as MusikDe } from "../de/musik";

export const musik: typeof MusikDe = {
  taktstrich: "taktstreck",
  tonMitVorzeichen: (vorzeichen: string, ton: string): string => `${ton} ${vorzeichen}`,
  punktiert: "punkterad",
  mitHaltebogen: "med bindebåge",
  pausenSilbe: "sj",
  rhythmus: {
    ganze: "ta-a-a-a",
    halbe: "ta-a",
    viertel: "ta",
    achtel: "ti",
    sechzehntel: "tika",
    achtelPaar: "ti-ti",
    sechzehntelVier: "tika-tika",
    punktiertSuffix: "-i",
  },
  schluessel: {
    violin: "violinnyckel",
    bass: "basnyckel",
    alt: "altnyckel (C-nyckel, till exempel för altviolen)",
  },
  artikulation: {
    staccato: "staccato (kort och löst)",
    staccatissimo: "staccatissimo (mycket kort och skarpt)",
    portato: "mezzostaccato (lätt avskilt, buret)",
    tenuto: "tenuto (hålls ut hela sitt värde)",
    akzent: "accent (betonad)",
    marcato: "marcato (starkt betonad)",
  },
  dynamik: {
    p: "piano (svagt)",
    f: "forte (starkt)",
    mf: "mezzoforte (ganska starkt)",
    pp: "pianissimo (mycket svagt)",
    ff: "fortissimo (mycket starkt)",
  },
  verzierung: {
    vorschlag: "kort förslag",
    "vorschlag-lang": "långt förslag",
    triller: "triller",
    doppelschlag: "dubbelslag",
    "doppelschlag-ueber": "dubbelslag ovanför tonen",
    pralltriller: "kort triller (övre mordent)",
    "pralltriller-lang": "lång kort triller (lång övre mordent)",
    mordent: "mordent",
    "mordent-lang": "lång mordent",
  },
  intervall: {
    2: "sekund (två steg)",
    3: "ters (tre steg)",
    4: "kvart (fyra steg)",
    5: "kvint (fem steg)",
    6: "sext (sex steg)",
    7: "septim (sju steg)",
    8: "oktav (åtta steg)",
  },
  finger: {
    1: "tumme (finger 1)",
    2: "pekfinger (finger 2)",
    3: "långfinger (finger 3)",
    4: "ringfinger (finger 4)",
    5: "lillfinger (finger 5)",
  },
  hand: { r: "högerhand", l: "vänsterhand" },
  akkord: {
    dim: "förminskat (cirkel)",
    halbdim: "halvförminskat",
    maj7: "stor septim (triangel)",
    sept: "dominantseptackord (kursiv 7)",
  },
  oktaven: {
    1: "första oktaven",
    2: "andra oktaven",
    3: "tredje oktaven",
    4: "fjärde oktaven (oktaven för mellan-c)",
    5: "femte oktaven",
    6: "sjätte oktaven",
    7: "sjunde oktaven",
  },
  schlagEinheit: {
    achtel: { one: "åttondel", many: "åttondelar" },
    sonst: { one: "slag", many: "slag" },
  },
  schlaege: (n: number): string => {
    const rounded = Math.round(n * 4) / 4;
    if (Number.isInteger(rounded)) return String(rounded);
    if (Math.abs((rounded % 1) - 0.5) < 1e-9) {
      const whole = Math.floor(rounded);
      if (whole === 0) return "en halv";
      if (whole === 1) return "en och en halv";
      const WORDS = ["", "", "två", "tre", "fyra", "fem", "sex", "sju"];
      return WORDS[whole] ? `${WORDS[whole]} och en halv` : `${whole},5`;
    }
    return String(rounded);
  },
};
