/**
 * Musikbegriffe und Beschriftungen der Notenzeichen (Bereich `musik`) - Italienisch.
 * Wortschatz der italienischen Musikpädagogik (semibreve, minima, semiminima, croma, semicroma;
 * pentagramma, battuta, diesis, bemolle, bequadro). Nicht gegen ein Lehrwerk geprüft
 * (siehe Bericht "Unsicher").
 */
import type { musik as MusikDe } from "../de/musik";

export const musik: typeof MusikDe = {
  taktstrich: "stanghetta",
  tonMitVorzeichen: (vorzeichen: string, ton: string): string => `${ton} ${vorzeichen}`,
  punktiert: "puntata",
  mitHaltebogen: "con legatura di valore",
  pausenSilbe: "sh",
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
    violin: "chiave di violino",
    bass: "chiave di basso",
    alt: "chiave di do (per esempio per la viola)",
  },
  artikulation: {
    staccato: "staccato (corto e staccato)",
    staccatissimo: "staccatissimo (cortissimo e secco)",
    portato: "mezzo staccato (leggermente staccato, portato)",
    tenuto: "tenuto (tenuto per tutto il suo valore)",
    akzent: "accento (sottolineato)",
    marcato: "marcato (molto accentato)",
  },
  dynamik: {
    p: "piano (piano, sottovoce)",
    f: "forte (forte)",
    mf: "mezzoforte (abbastanza forte)",
    pp: "pianissimo (pianissimo)",
    ff: "fortissimo (fortissimo)",
  },
  verzierung: {
    vorschlag: "acciaccatura (nota d'abbellimento breve)",
    "vorschlag-lang": "appoggiatura (nota d'abbellimento lunga)",
    triller: "trillo",
    doppelschlag: "gruppetto",
    "doppelschlag-ueber": "gruppetto sopra la nota",
    pralltriller: "mordente superiore (trillo breve)",
    "pralltriller-lang": "mordente superiore lungo",
    mordent: "mordente inferiore",
    "mordent-lang": "mordente inferiore lungo",
  },
  intervall: {
    2: "seconda (due gradi)",
    3: "terza (tre gradi)",
    4: "quarta (quattro gradi)",
    5: "quinta (cinque gradi)",
    6: "sesta (sei gradi)",
    7: "settima (sette gradi)",
    8: "ottava (otto gradi)",
  },
  finger: {
    1: "pollice (dito 1)",
    2: "indice (dito 2)",
    3: "medio (dito 3)",
    4: "anulare (dito 4)",
    5: "mignolo (dito 5)",
  },
  hand: { r: "mano destra", l: "mano sinistra" },
  akkord: {
    dim: "diminuito (cerchietto)",
    halbdim: "semidiminuito",
    maj7: "settima maggiore (triangolo)",
    sept: "settima di dominante (7 corsivo)",
  },
  oktaven: {
    1: "prima ottava",
    2: "seconda ottava",
    3: "terza ottava",
    4: "quarta ottava (l'ottava del do centrale)",
    5: "quinta ottava",
    6: "sesta ottava",
    7: "settima ottava",
  },
  schlagEinheit: {
    achtel: { one: "pulsazione di croma", many: "pulsazioni di croma" },
    sonst: { one: "pulsazione", many: "pulsazioni" },
  },
  schlaege: (n: number): string => {
    const rounded = Math.round(n * 4) / 4;
    if (Number.isInteger(rounded)) return String(rounded);
    if (Math.abs((rounded % 1) - 0.5) < 1e-9) {
      const whole = Math.floor(rounded);
      if (whole === 0) return "mezza";
      if (whole === 1) return "una e mezza";
      const WORDS = ["", "", "due", "tre", "quattro", "cinque", "sei", "sette"];
      return WORDS[whole] ? `${WORDS[whole]} e mezza` : `${whole},5`;
    }
    return String(rounded).replace(".", ",");
  },
};
