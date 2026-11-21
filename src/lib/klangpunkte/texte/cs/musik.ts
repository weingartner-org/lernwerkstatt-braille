/**
 * Musikbegriffe und Beschriftungen der Notenzeichen (Bereich `musik`) - Čeština.
 * Fachwörter: tschechische Musiklehre (celá nota, půlová nota, čtvrťová nota, osminová nota,
 * šestnáctinová nota; notová osnova, křížek, béčko, odrážka - aus `tonnamen.ts` Eintrag `cs`),
 * Notenschrift-Braille. Unsichere Wörter stehen im Bericht unter „Unsicher".
 * Zähl-Einheit „doba" (1 doba, 2-4 doby, 5 dob; Bruch: „1,5 doby"), siehe `jednotkaCs`.
 */
import type { musik as MusikDe } from "../de/musik";

/** „křížek" -> „s křížkem" usw. (7. pád); unbekannte Wörter bleiben, wie sie sind. */
const SE_ZNAKEM: Record<string, string> = {
  "křížek": "s křížkem",
  "béčko": "s béčkem",
  "odrážka": "s odrážkou",
};

/** Die drei Formen der Zähl-Einheiten (1 · 2-4 und Bruch · 0 und 5+). */
const JEDNOTKY: readonly (readonly [string, string, string])[] = [
  ["doba", "doby", "dob"],
  ["osmina", "osminy", "osmin"],
];

/**
 * Die Zähl-Einheit in der Form, die zur Anzahl passt: „1 doba", „2 doby", „5 dob",
 * „půl doby", „1,5 doby". `einheit` ist eine der Formen aus `schlagEinheit`.
 */
export function jednotkaCs(anzahl: string, einheit: string): string {
  const trojice = JEDNOTKY.find((t) => t.includes(einheit));
  if (!trojice) return einheit;
  const [one, few, many] = trojice;
  if (/^\d+$/.test(anzahl.trim())) {
    const n = Number(anzahl);
    if (n === 1) return one;
    if (n >= 2 && n <= 4) return few;
    return many;
  }
  // Bruch („0,25", „půl", „jedna a půl"): 2. pád jednotného čísla.
  return few;
}

export const musik: typeof MusikDe = {
  taktstrich: "taktová čára",
  tonMitVorzeichen: (vorzeichen: string, ton: string): string =>
    SE_ZNAKEM[vorzeichen] ? `${ton} ${SE_ZNAKEM[vorzeichen]}` : `${ton} ${vorzeichen}`,
  punktiert: "s tečkou",
  mitHaltebogen: "s vázacím obloukem",
  pausenSilbe: "pst",
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
    violin: "houslový klíč",
    bass: "basový klíč",
    alt: "klíč C (altový, například pro violu)",
  },
  artikulation: {
    staccato: "staccato (krátce, odděleně)",
    staccatissimo: "staccatissimo (velmi krátce a ostře)",
    portato: "mezzostaccato (lehce oddělené, nesené)",
    tenuto: "tenuto (podržet celou délku)",
    akzent: "akcent (s důrazem)",
    marcato: "marcato (se silným důrazem)",
  },
  dynamik: {
    p: "piano (potichu)",
    f: "forte (nahlas)",
    mf: "mezzoforte (středně nahlas)",
    pp: "pianissimo (velmi potichu)",
    ff: "fortissimo (velmi nahlas)",
  },
  verzierung: {
    vorschlag: "krátký příraz",
    "vorschlag-lang": "dlouhý příraz",
    triller: "trylek",
    doppelschlag: "obal",
    "doppelschlag-ueber": "obal nad notou",
    pralltriller: "nátryl (krátký trylek)",
    "pralltriller-lang": "dlouhý nátryl",
    mordent: "mordent",
    "mordent-lang": "dlouhý mordent",
  },
  intervall: {
    2: "sekunda (dva stupně)",
    3: "tercie (tři stupně)",
    4: "kvarta (čtyři stupně)",
    5: "kvinta (pět stupňů)",
    6: "sexta (šest stupňů)",
    7: "septima (sedm stupňů)",
    8: "oktáva (osm stupňů)",
  },
  finger: {
    1: "palec (prst 1)",
    2: "ukazováček (prst 2)",
    3: "prostředníček (prst 3)",
    4: "prsteníček (prst 4)",
    5: "malíček (prst 5)",
  },
  hand: { r: "pravá ruka", l: "levá ruka" },
  akkord: {
    dim: "zmenšený (kroužek)",
    halbdim: "polozmenšený",
    maj7: "velká septima (trojúhelník)",
    sept: "dominantní septakord (7 kurzívou)",
  },
  oktaven: {
    1: "kontra oktáva",
    2: "velká oktáva",
    3: "malá oktáva",
    4: "jednočárkovaná oktáva",
    5: "dvoučárkovaná oktáva",
    6: "tříčárkovaná oktáva",
    7: "čtyřčárkovaná oktáva",
  },
  /** Die passende Form bildet `jednotkaCs` (der Läufer gibt nur „one" oder „many" weiter). */
  schlagEinheit: {
    achtel: { one: "osmina", many: "osmin" },
    sonst: { one: "doba", many: "dob" },
  },
  schlaege: (n: number): string => {
    const rounded = Math.round(n * 4) / 4;
    if (Number.isInteger(rounded)) return String(rounded);
    if (Math.abs((rounded % 1) - 0.5) < 1e-9) {
      const whole = Math.floor(rounded);
      if (whole === 0) return "půl";
      if (whole === 1) return "jedna a půl";
      const WORDS = ["", "", "dvě", "tři", "čtyři", "pět", "šest", "sedm"];
      return WORDS[whole] ? `${WORDS[whole]} a půl` : `${whole},5`;
    }
    return String(rounded).replace(".", ",");
  },
};
