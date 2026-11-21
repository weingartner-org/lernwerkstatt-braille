/**
 * Musikbegriffe und Beschriftungen der Notenzeichen (Bereich `musik`) - Polski.
 * Fachwörter: polnische Musiktheorie (cała nuta, półnuta, ćwierćnuta, ósemka, szesnastka;
 * pięciolinia, krzyżyk, bemol, kasownik - aus `tonnamen.ts` Eintrag `pl`), Notenschrift-Braille.
 * Unsichere Wörter stehen im Bericht unter „Unsicher".
 */
import type { musik as MusikDe } from "../de/musik";

/** „krzyżyk" -> „z krzyżykiem" usw. (Narzędnik); unbekannte Wörter bleiben, wie sie sind. */
const Z_ZNAKIEM: Record<string, string> = {
  "krzyżyk": "z krzyżykiem",
  bemol: "z bemolem",
  kasownik: "z kasownikiem",
};

export const musik: typeof MusikDe = {
  taktstrich: "kreska taktowa",
  tonMitVorzeichen: (vorzeichen: string, ton: string): string =>
    Z_ZNAKIEM[vorzeichen] ? `${ton} ${Z_ZNAKIEM[vorzeichen]}` : `${ton} ${vorzeichen}`,
  punktiert: "z kropką",
  mitHaltebogen: "z łukiem przedłużającym",
  pausenSilbe: "sz",
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
    violin: "klucz wiolinowy",
    bass: "klucz basowy",
    alt: "klucz C (altowy, na przykład dla altówki)",
  },
  artikulation: {
    staccato: "staccato (krótko, oddzielnie)",
    staccatissimo: "staccatissimo (bardzo krótko i ostro)",
    portato: "mezzostaccato (lekko oddzielone, niesione)",
    tenuto: "tenuto (wytrzymane przez całą wartość)",
    akzent: "akcent (zaakcentowane)",
    marcato: "marcato (mocno zaakcentowane)",
  },
  dynamik: {
    p: "piano (cicho)",
    f: "forte (głośno)",
    mf: "mezzoforte (średnio głośno)",
    pp: "pianissimo (bardzo cicho)",
    ff: "fortissimo (bardzo głośno)",
  },
  verzierung: {
    vorschlag: "krótki przednutek",
    "vorschlag-lang": "długi przednutek",
    triller: "tryl",
    doppelschlag: "obiegnik",
    "doppelschlag-ueber": "obiegnik nad nutą",
    pralltriller: "mordent górny (krótki tryl)",
    "pralltriller-lang": "długi mordent górny",
    mordent: "mordent dolny",
    "mordent-lang": "długi mordent dolny",
  },
  intervall: {
    2: "sekunda (dwa stopnie)",
    3: "tercja (trzy stopnie)",
    4: "kwarta (cztery stopnie)",
    5: "kwinta (pięć stopni)",
    6: "seksta (sześć stopni)",
    7: "septyma (siedem stopni)",
    8: "oktawa (osiem stopni)",
  },
  finger: {
    1: "kciuk (palec 1)",
    2: "palec wskazujący (palec 2)",
    3: "palec środkowy (palec 3)",
    4: "palec serdeczny (palec 4)",
    5: "mały palec (palec 5)",
  },
  hand: { r: "prawa ręka", l: "lewa ręka" },
  akkord: {
    dim: "zmniejszony (kółko)",
    halbdim: "półzmniejszony",
    maj7: "septyma wielka (trójkąt)",
    sept: "akord dominanty septymowej (7 kursywą)",
  },
  oktaven: {
    1: "oktawa kontra",
    2: "oktawa wielka",
    3: "oktawa mała",
    4: "oktawa razkreślna",
    5: "oktawa dwukreślna",
    6: "oktawa trzykreślna",
    7: "oktawa czterokreślna",
  },
  schlagEinheit: {
    achtel: { one: "miara ósemkowa", many: "miar ósemkowych" },
    sonst: { one: "miara", many: "miar" },
  },
  schlaege: (n: number): string => {
    const rounded = Math.round(n * 4) / 4;
    if (Number.isInteger(rounded)) return String(rounded);
    if (Math.abs((rounded % 1) - 0.5) < 1e-9) {
      const whole = Math.floor(rounded);
      if (whole === 0) return "pół";
      if (whole === 1) return "półtorej";
      const WORDS = ["", "", "dwie", "trzy", "cztery", "pięć", "sześć", "siedem"];
      return WORDS[whole] ? `${WORDS[whole]} i pół` : `${whole},5`;
    }
    return String(rounded).replace(".", ",");
  },
};
