/**
 * Musikbegriffe und Beschriftungen der Notenzeichen (Bereich `musik`) - Nederlands.
 * Fachwörter: Nederlandse muziektheorie (hele/halve/kwart/achtste noot, maatstreep, octaafteken).
 * Unsichere Wörter stehen im Bericht unter „Unsicher".
 */
import type { musik as MusikDe } from "../de/musik";

export const musik: typeof MusikDe = {
  taktstrich: "maatstreep",
  tonMitVorzeichen: (vorzeichen: string, ton: string): string => `${ton} ${vorzeichen}`,
  punktiert: "gepunt",
  mitHaltebogen: "met overbinding",
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
    violin: "violinsleutel",
    bass: "bassleutel",
    alt: "C-sleutel (bijvoorbeeld voor de altviool)",
  },
  artikulation: {
    staccato: "staccato (kort en los)",
    staccatissimo: "staccatissimo (heel kort en scherp)",
    portato: "mezzostaccato (licht los, gedragen)",
    tenuto: "tenuto (de volle lengte aangehouden)",
    akzent: "accent (beklemtoond)",
    marcato: "marcato (sterk beklemtoond)",
  },
  dynamik: {
    p: "piano (zacht)",
    f: "forte (luid)",
    mf: "mezzoforte (redelijk luid)",
    pp: "pianissimo (heel zacht)",
    ff: "fortissimo (heel luid)",
  },
  verzierung: {
    vorschlag: "korte voorslag",
    "vorschlag-lang": "lange voorslag",
    triller: "triller",
    doppelschlag: "dubbele slag",
    "doppelschlag-ueber": "dubbele slag boven de noot",
    pralltriller: "korte triller (bovenmordent)",
    "pralltriller-lang": "lange korte triller (lange bovenmordent)",
    mordent: "mordent",
    "mordent-lang": "lange mordent",
  },
  intervall: {
    2: "secunde (twee stappen)",
    3: "terts (drie stappen)",
    4: "kwart (vier stappen)",
    5: "kwint (vijf stappen)",
    6: "sext (zes stappen)",
    7: "septime (zeven stappen)",
    8: "octaaf (acht stappen)",
  },
  finger: {
    1: "duim (vinger 1)",
    2: "wijsvinger (vinger 2)",
    3: "middelvinger (vinger 3)",
    4: "ringvinger (vinger 4)",
    5: "pink (vinger 5)",
  },
  hand: { r: "rechterhand", l: "linkerhand" },
  akkord: {
    dim: "verminderd (cirkel)",
    halbdim: "halfverminderd",
    maj7: "grote septime (driehoek)",
    sept: "dominantseptiemakkoord (schuine 7)",
  },
  oktaven: {
    1: "eerste octaaf",
    2: "tweede octaaf",
    3: "derde octaaf",
    4: "vierde octaaf (het octaaf van de middel-c)",
    5: "vijfde octaaf",
    6: "zesde octaaf",
    7: "zevende octaaf",
  },
  schlagEinheit: {
    achtel: { one: "achtste-tel", many: "achtste-tellen" },
    sonst: { one: "tel", many: "tellen" },
  },
  schlaege: (n: number): string => {
    const rounded = Math.round(n * 4) / 4;
    if (Number.isInteger(rounded)) return String(rounded);
    if (Math.abs((rounded % 1) - 0.5) < 1e-9) {
      const whole = Math.floor(rounded);
      if (whole === 0) return "half";
      if (whole === 1) return "anderhalf";
      const WORDS = ["", "", "twee", "drie", "vier", "vijf", "zes", "zeven"];
      return WORDS[whole] ? `${WORDS[whole]} en een half` : `${whole},5`;
    }
    return String(rounded);
  },
};
