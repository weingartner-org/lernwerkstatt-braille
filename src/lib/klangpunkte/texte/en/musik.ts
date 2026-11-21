/**
 * Musikbegriffe und Beschriftungen der Notenzeichen (Bereich `musik`) - Englisch (en-GB).
 * Quellen: New International Manual (Table 1 A: semibreve ... semi-quaver; Table 10
 * Nuances; Table 11 Ornaments; Table 15 Keyboard; Table 17 String Instruments),
 * ABRSM-Wortschatz für Verzierungen und Artikulation. Unsichere Wörter stehen im
 * Befund unter „Offene Fragen".
 */
import type { musik as MusikDe } from "../de/musik";

export const musik: typeof MusikDe = {
  taktstrich: "bar line",
  tonMitVorzeichen: (vorzeichen: string, ton: string): string => `${ton} ${vorzeichen}`,
  punktiert: "dotted",
  mitHaltebogen: "with a tie",
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
    violin: "treble clef",
    bass: "bass clef",
    alt: "C clef (for example for the viola)",
  },
  artikulation: {
    staccato: "staccato (short and detached)",
    staccatissimo: "staccatissimo (very short and sharp)",
    portato: "mezzo-staccato (lightly detached, carried)",
    tenuto: "tenuto (held for its full length)",
    akzent: "accent (stressed)",
    marcato: "marcato (strongly stressed)",
  },
  dynamik: {
    p: "piano (quiet)",
    f: "forte (loud)",
    mf: "mezzo forte (fairly loud)",
    pp: "pianissimo (very quiet)",
    ff: "fortissimo (very loud)",
  },
  verzierung: {
    vorschlag: "short grace note",
    "vorschlag-lang": "long grace note",
    triller: "trill",
    doppelschlag: "turn",
    "doppelschlag-ueber": "turn above the note",
    pralltriller: "short trill (upper mordent)",
    "pralltriller-lang": "long short trill (long upper mordent)",
    mordent: "mordent",
    "mordent-lang": "long mordent",
  },
  intervall: {
    2: "second (two steps)",
    3: "third (three steps)",
    4: "fourth (four steps)",
    5: "fifth (five steps)",
    6: "sixth (six steps)",
    7: "seventh (seven steps)",
    8: "octave (eight steps)",
  },
  finger: {
    1: "thumb (finger 1)",
    2: "index finger (finger 2)",
    3: "middle finger (finger 3)",
    4: "ring finger (finger 4)",
    5: "little finger (finger 5)",
  },
  hand: { r: "right hand", l: "left hand" },
  akkord: {
    dim: "diminished (circle)",
    halbdim: "half-diminished",
    maj7: "major seventh (triangle)",
    sept: "dominant seventh (italic 7)",
  },
  oktaven: {
    1: "first octave",
    2: "second octave",
    3: "third octave",
    4: "fourth octave (the octave of middle C)",
    5: "fifth octave",
    6: "sixth octave",
    7: "seventh octave",
  },
  schlagEinheit: {
    achtel: { one: "quaver beat", many: "quaver beats" },
    sonst: { one: "beat", many: "beats" },
  },
  schlaege: (n: number): string => {
    const rounded = Math.round(n * 4) / 4;
    if (Number.isInteger(rounded)) return String(rounded);
    if (Math.abs((rounded % 1) - 0.5) < 1e-9) {
      const whole = Math.floor(rounded);
      if (whole === 0) return "half a";
      if (whole === 1) return "one and a half";
      const WORDS = ["", "", "two", "three", "four", "five", "six", "seven"];
      return WORDS[whole] ? `${WORDS[whole]} and a half` : `${whole}.5`;
    }
    return String(rounded);
  },
};
