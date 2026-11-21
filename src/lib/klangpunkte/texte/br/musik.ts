/**
 * Musikbegriffe und Beschriftungen der Notenzeichen (Bereich `musik`) - Portugiesisch (br, Brasilien).
 * Wortschatz der brasilianischen Musikpädagogik: semibreve, mínima, semínima, colcheia,
 * semicolcheia; pauta (auch pentagrama), compasso, sustenido, bemol, bequadro. Die Brailleschrift
 * der Noten bleibt die internationale. Unsichere Wörter stehen im Bericht unter „Unsicher".
 */
import type { musik as MusikDe } from "../de/musik";

export const musik: typeof MusikDe = {
  taktstrich: "barra de compasso",
  tonMitVorzeichen: (vorzeichen: string, ton: string): string => `${ton} ${vorzeichen}`,
  punktiert: "pontuada",
  mitHaltebogen: "com ligadura de prolongamento",
  pausenSilbe: "xiu",
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
    violin: "clave de sol",
    bass: "clave de fá",
    alt: "clave de dó (por exemplo para a viola)",
  },
  artikulation: {
    staccato: "staccato (curto e destacado)",
    staccatissimo: "staccatissimo (muito curto e seco)",
    portato: "mezzo-staccato (sustentado e levemente destacado)",
    tenuto: "tenuto (sustentado até o fim do valor)",
    akzent: "acento (marcado)",
    marcato: "marcato (bem marcado)",
  },
  dynamik: {
    p: "piano (suave)",
    f: "forte (forte)",
    mf: "mezzoforte (meio forte)",
    pp: "pianissimo (bem suave)",
    ff: "fortissimo (bem forte)",
  },
  verzierung: {
    vorschlag: "apojatura curta",
    "vorschlag-lang": "apojatura longa",
    triller: "trinado",
    doppelschlag: "grupeto",
    "doppelschlag-ueber": "grupeto sobre a nota",
    pralltriller: "trinado curto (mordente superior)",
    "pralltriller-lang": "trinado curto longo (mordente superior longo)",
    mordent: "mordente",
    "mordent-lang": "mordente longo",
  },
  intervall: {
    2: "segunda (dois graus)",
    3: "terça (três graus)",
    4: "quarta (quatro graus)",
    5: "quinta (cinco graus)",
    6: "sexta (seis graus)",
    7: "sétima (sete graus)",
    8: "oitava (oito graus)",
  },
  finger: {
    1: "polegar (dedo 1)",
    2: "indicador (dedo 2)",
    3: "médio (dedo 3)",
    4: "anelar (dedo 4)",
    5: "dedo mínimo (dedo 5)",
  },
  hand: { r: "mão direita", l: "mão esquerda" },
  akkord: {
    dim: "diminuto (círculo)",
    halbdim: "meio-diminuto",
    maj7: "sétima maior (triângulo)",
    sept: "sétima de dominante (7 em itálico)",
  },
  oktaven: {
    1: "oitava de contra",
    2: "oitava grande",
    3: "oitava pequena",
    4: "oitava de uma linha (a oitava do dó central)",
    5: "oitava de duas linhas",
    6: "oitava de três linhas",
    7: "oitava de quatro linhas",
  },
  /** Zähl-Einheit des Takt-Baumeisters: Achteltakte zählen in Achteln, alle anderen in Vierteln. */
  schlagEinheit: {
    achtel: { one: "pulso de colcheia", many: "pulsos de colcheia" },
    sonst: { one: "tempo", many: "tempos" },
  },
  /** Schlagzahl als gesprochener Text („ein halber", „anderthalb", „zweieinhalb", Dezimalkomma). */
  schlaege: (n: number): string => {
    const rounded = Math.round(n * 4) / 4;
    if (Number.isInteger(rounded)) return String(rounded);
    if (Math.abs((rounded % 1) - 0.5) < 1e-9) {
      const whole = Math.floor(rounded);
      if (whole === 0) return "meio";
      if (whole === 1) return "um e meio";
      const WORDS = ["", "", "dois", "três", "quatro", "cinco", "seis", "sete"];
      return WORDS[whole] ? `${WORDS[whole]} e meio` : `${whole},5`;
    }
    return String(rounded).replace(".", ",");
  },
};
