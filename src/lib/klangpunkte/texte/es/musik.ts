/**
 * Musikbegriffe und Beschriftungen der Notenzeichen (Bereich `musik`) - Spanisch (es, Spanien).
 * Wortschatz der spanischen Musikpädagogik (Conservatorios): redonda, blanca, negra, corchea,
 * semicorchea; pentagrama, compás, sostenido, bemol, becuadro. Die Brailleschrift der Noten
 * bleibt die internationale. Unsichere Wörter stehen im Bericht unter „Unsicher".
 */
import type { musik as MusikDe } from "../de/musik";

export const musik: typeof MusikDe = {
  taktstrich: "barra de compás",
  tonMitVorzeichen: (vorzeichen: string, ton: string): string => `${ton} ${vorzeichen}`,
  punktiert: "con puntillo",
  mitHaltebogen: "con ligadura de unión",
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
    violin: "clave de sol",
    bass: "clave de fa",
    alt: "clave de do (por ejemplo para la viola)",
  },
  artikulation: {
    staccato: "staccato (corto y separado)",
    staccatissimo: "staccatissimo (muy corto y seco)",
    portato: "mezzostaccato (separado con suavidad, sostenido)",
    tenuto: "tenuto (sostenido durante todo su valor)",
    akzent: "acento (marcado)",
    marcato: "marcato (muy marcado)",
  },
  dynamik: {
    p: "piano (suave)",
    f: "forte (fuerte)",
    mf: "mezzoforte (bastante fuerte)",
    pp: "pianissimo (muy suave)",
    ff: "fortissimo (muy fuerte)",
  },
  verzierung: {
    vorschlag: "apoyatura corta",
    "vorschlag-lang": "apoyatura larga",
    triller: "trino",
    doppelschlag: "grupeto",
    "doppelschlag-ueber": "grupeto sobre la nota",
    pralltriller: "trino corto (mordente superior)",
    "pralltriller-lang": "trino corto largo (mordente superior largo)",
    mordent: "mordente",
    "mordent-lang": "mordente largo",
  },
  intervall: {
    2: "segunda (dos grados)",
    3: "tercera (tres grados)",
    4: "cuarta (cuatro grados)",
    5: "quinta (cinco grados)",
    6: "sexta (seis grados)",
    7: "séptima (siete grados)",
    8: "octava (ocho grados)",
  },
  finger: {
    1: "pulgar (dedo 1)",
    2: "índice (dedo 2)",
    3: "corazón (dedo 3)",
    4: "anular (dedo 4)",
    5: "meñique (dedo 5)",
  },
  hand: { r: "mano derecha", l: "mano izquierda" },
  akkord: {
    dim: "disminuido (círculo)",
    halbdim: "semidisminuido",
    maj7: "séptima mayor (triángulo)",
    sept: "séptima de dominante (7 en cursiva)",
  },
  oktaven: {
    1: "primera octava",
    2: "segunda octava",
    3: "tercera octava",
    4: "cuarta octava (la octava del do central)",
    5: "quinta octava",
    6: "sexta octava",
    7: "séptima octava",
  },
  schlagEinheit: {
    achtel: { one: "pulso de corchea", many: "pulsos de corchea" },
    sonst: { one: "pulso", many: "pulsos" },
  },
  schlaege: (n: number): string => {
    const rounded = Math.round(n * 4) / 4;
    if (Number.isInteger(rounded)) return String(rounded);
    if (Math.abs((rounded % 1) - 0.5) < 1e-9) {
      const whole = Math.floor(rounded);
      if (whole === 0) return "medio";
      if (whole === 1) return "uno y medio";
      const WORDS = ["", "", "dos", "tres", "cuatro", "cinco", "seis", "siete"];
      return WORDS[whole] ? `${WORDS[whole]} y medio` : `${whole},5`;
    }
    return String(rounded).replace(".", ",");
  },
};
