/**
 * Musikbegriffe und Beschriftungen der Notenzeichen (Bereich `musik`) - Französisch.
 * Fachwörter der französischen Musikpädagogik (solfège): noire, croche, mesure, portée,
 * liaison, nuances. Unsichere Wörter stehen im Bericht unter „Unsicher".
 */
import type { musik as MusikDe } from "../de/musik";

export const musik: typeof MusikDe = {
  taktstrich: "barre de mesure",
  tonMitVorzeichen: (vorzeichen: string, ton: string): string => `${ton} ${vorzeichen}`,
  punktiert: "pointée",
  mitHaltebogen: "avec une liaison de prolongation",
  pausenSilbe: "chut",
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
    violin: "clé de sol",
    bass: "clé de fa",
    alt: "clé d'ut (par exemple pour l'alto)",
  },
  artikulation: {
    staccato: "staccato (court et détaché)",
    staccatissimo: "staccatissimo (très piqué)",
    portato: "mezzo-staccato (légèrement détaché, porté)",
    tenuto: "tenuto (tenu pleinement)",
    akzent: "accent (appuyé)",
    marcato: "marcato (fortement appuyé)",
  },
  dynamik: {
    p: "piano (doux)",
    f: "forte (fort)",
    mf: "mezzo forte (moyennement fort)",
    pp: "pianissimo (très doux)",
    ff: "fortissimo (très fort)",
  },
  verzierung: {
    vorschlag: "appoggiature brève",
    "vorschlag-lang": "appoggiature longue",
    triller: "trille",
    doppelschlag: "gruppetto",
    "doppelschlag-ueber": "gruppetto au-dessus de la note",
    pralltriller: "pincé (mordant supérieur bref)",
    "pralltriller-lang": "long pincé",
    mordent: "mordant",
    "mordent-lang": "long mordant",
  },
  intervall: {
    2: "seconde (deux degrés)",
    3: "tierce (trois degrés)",
    4: "quarte (quatre degrés)",
    5: "quinte (cinq degrés)",
    6: "sixte (six degrés)",
    7: "septième (sept degrés)",
    8: "octave (huit degrés)",
  },
  finger: {
    1: "pouce (doigt 1)",
    2: "index (doigt 2)",
    3: "majeur (doigt 3)",
    4: "annulaire (doigt 4)",
    5: "auriculaire (doigt 5)",
  },
  hand: { r: "main droite", l: "main gauche" },
  akkord: {
    dim: "diminué (cercle)",
    halbdim: "semi-diminué",
    maj7: "septième majeure (triangle)",
    sept: "septième de dominante (7 en italique)",
  },
  oktaven: {
    1: "octave 1",
    2: "octave 2",
    3: "octave 3",
    4: "octave 4 (celle du do central)",
    5: "octave 5",
    6: "octave 6",
    7: "octave 7",
  },
  schlagEinheit: {
    achtel: { one: "croche", many: "croches" },
    sonst: { one: "temps", many: "temps" },
  },
  schlaege: (n: number): string => {
    const rounded = Math.round(n * 4) / 4;
    if (Number.isInteger(rounded)) return String(rounded);
    if (Math.abs((rounded % 1) - 0.5) < 1e-9) {
      const whole = Math.floor(rounded);
      if (whole === 0) return "un demi";
      if (whole === 1) return "un et demi";
      const WORDS = ["", "", "deux", "trois", "quatre", "cinq", "six", "sept"];
      return WORDS[whole] ? `${WORDS[whole]} et demi` : `${whole},5`;
    }
    return String(rounded).replace(".", ",");
  },
};
