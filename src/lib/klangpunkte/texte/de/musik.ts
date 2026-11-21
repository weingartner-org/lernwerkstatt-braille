/**
 * Musikbegriffe und Beschriftungen der Notenzeichen (Bereich `musik`) - Deutsch.
 * Wörtlich der Bestand aus `notation.ts` (Stand 06.11.2026); der Wächter
 * `tests/klangpunkte-deutsch-unveraendert.test.tsx` misst jedes Wort.
 */
export const musik = {
  taktstrich: "Taktstrich",
  /** Ton mit Vorzeichen für die Ansage: de „Kreuz c", en „C sharp". */
  tonMitVorzeichen: (vorzeichen: string, ton: string): string => `${vorzeichen} ${ton}`,
  punktiert: "punktiert",
  mitHaltebogen: "mit Haltebogen",
  /** Rhythmussilbe der Pause (Kodály-Option). */
  pausenSilbe: "sch",
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
    violin: "Violinschlüssel",
    bass: "Bassschlüssel",
    alt: "C-Schlüssel (z. B. Bratsche)",
  },
  artikulation: {
    staccato: "Staccato (kurz abgesetzt)",
    staccatissimo: "Staccatissimo (ganz spitz)",
    portato: "Mezzo-Staccato (getragen getupft)",
    tenuto: "Tenuto (voll ausgehalten)",
    akzent: "Akzent (betont)",
    marcato: "Marcato (stark betont)",
  },
  dynamik: {
    p: "piano (leise)",
    f: "forte (laut)",
    mf: "mezzoforte (mittellaut)",
    pp: "pianissimo (sehr leise)",
    ff: "fortissimo (sehr laut)",
  },
  verzierung: {
    vorschlag: "kurzer Vorschlag",
    "vorschlag-lang": "langer Vorschlag",
    triller: "Triller",
    doppelschlag: "Doppelschlag",
    "doppelschlag-ueber": "Doppelschlag über der Note",
    pralltriller: "Pralltriller",
    "pralltriller-lang": "langer Pralltriller",
    mordent: "Mordent",
    "mordent-lang": "langer Mordent",
  },
  intervall: {
    2: "Sekunde (zwei Stufen)",
    3: "Terz (drei Stufen)",
    4: "Quarte (vier Stufen)",
    5: "Quinte (fünf Stufen)",
    6: "Sexte (sechs Stufen)",
    7: "Septime (sieben Stufen)",
    8: "Oktave (acht Stufen)",
  },
  finger: {
    1: "Daumen (1. Finger)",
    2: "Zeigefinger (2. Finger)",
    3: "Mittelfinger (3. Finger)",
    4: "Ringfinger (4. Finger)",
    5: "kleiner Finger (5. Finger)",
  },
  hand: { r: "rechte Hand", l: "linke Hand" },
  akkord: {
    dim: "vermindert (Kreis)",
    halbdim: "halbvermindert",
    maj7: "große Septime (Dreieck)",
    sept: "Dominantseptakkord (kursive 7)",
  },
  oktaven: {
    1: "Kontra-Oktave",
    2: "große Oktave",
    3: "kleine Oktave",
    4: "eingestrichene Oktave",
    5: "zweigestrichene Oktave",
    6: "dreigestrichene Oktave",
    7: "viergestrichene Oktave",
  },
  /** Zähl-Einheit des Takt-Baumeisters: Achteltakte zählen in Achteln, alle anderen in Vierteln. */
  schlagEinheit: {
    achtel: { one: "Achtel-Schlag", many: "Achtel-Schlägen" },
    sonst: { one: "Schlag", many: "Schlägen" },
  },
  /** Schlagzahl als gesprochener Text („ein halber", „anderthalb", „zweieinhalb", Dezimalkomma). */
  schlaege: (n: number): string => {
    const rounded = Math.round(n * 4) / 4;
    if (Number.isInteger(rounded)) return String(rounded);
    if (Math.abs((rounded % 1) - 0.5) < 1e-9) {
      const whole = Math.floor(rounded);
      if (whole === 0) return "ein halber";
      if (whole === 1) return "anderthalb";
      const WORDS = ["", "", "zwei", "drei", "vier", "fünf", "sechs", "sieben"];
      return WORDS[whole] ? `${WORDS[whole]}einhalb` : `${whole},5`;
    }
    return String(rounded).replace(".", ",");
  },
};
