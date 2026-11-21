/**
 * Plus - die Kerne der Stufe 4: der große Zahlenraum bis eine Million.
 *
 * Dieselbe Idee wie in `kerne.ts`: ein Kern ist die nackte Rechnung, noch
 * ohne Form. Hier kommen die Bauarten dazu, die es für den großen
 * Zahlenraum, für Größen und für Brüche noch nicht gab.
 *
 * ★ Eine stille Falle der Form "folge" (operatives Päckchen): sie lässt eine
 * Zahl um +1, +2, +3 wandern und rechnet die Zeile neu. Bei einer Division
 * geht das nur auf, wenn die Zahl auch nach dem Wandern noch aufgeht - sonst
 * entsteht eine hässliche Dezimalzahl mitten im Päckchen. Darum bauen die
 * Stufenzahlen (4-04) ihre Folge selbst, als fertige Zahlenreihe, statt sich
 * auf das Wandern zu verlassen. Das Stellen-Einmaleins (4-12) bleibt bei
 * „mal" - das geht bei jedem Wandern auf.
 */
import { ganz, eines, LUECKE, zahl, type Operation } from "../aufgabe";
import { ergaenzung, type Kern, type Zufall } from "./kerne";

/* ------------------------------------------------------------------ */
/* 4-01 Stellenwert bis zur Million                                     */
/* ------------------------------------------------------------------ */

const STELLEN = ["Einer", "Zehner", "Hunderter", "Tausender", "Zehntausender", "Hunderttausender"] as const;

export interface StellenwertP { min: number; max: number }

/**
 * Stellenwert, Nachfolger oder nächste Hunderttausenderzahl - dieselbe
 * große Zahl, dreimal anders gefragt. ★ Alle drei Fassungen stecken in
 * jedem Kern (eine als Hauptfassung, zwei als `varianten`); `formen.ts`
 * wählt zufällig eine aus. So wiederholt sich in einem Lauf nicht zwölfmal
 * dieselbe Frage.
 */
export function stellenwertGross(rng: Zufall, p: StellenwertP): Kern {
  const z = ganz(rng, p.min + 1, p.max - 1);
  const ziffern = String(z).split("").reverse();
  const stelleIdx = ganz(rng, 0, ziffern.length - 1);
  const stelle = STELLEN[stelleIdx];
  const naechsterHunderttausender = Math.ceil((z + 1) / 100000) * 100000;

  const fassungen = [
    { angabe: `Welche Zahl kommt nach ${zahl(z)}?`, loesung: zahl(z + 1) },
    { angabe: `${zahl(z)} - Ziffer der ${stelle}?`, loesung: ziffern[stelleIdx] },
    { angabe: `${zahl(z)} - nächste Hunderttausenderzahl?`, loesung: zahl(naechsterHunderttausender) },
  ];
  const haupt = eines(rng, fassungen);
  const varianten = fassungen.filter((f) => f !== haupt);
  return { sorte: "direkt", op: "zahlen", angabe: haupt.angabe, loesung: haupt.loesung, zahlen: [z], varianten };
}

/* ------------------------------------------------------------------ */
/* 4-02 Runden im großen Zahlenraum                                     */
/* ------------------------------------------------------------------ */

const RUNDUNGSSTELLEN = [
  { stufe: 10, wort: "Zehner" },
  { stufe: 100, wort: "Hunderter" },
  { stufe: 1000, wort: "Tausender" },
  { stufe: 10000, wort: "Zehntausender" },
  { stufe: 100000, wort: "Hunderttausender" },
] as const;

export interface RundenP { min: number; max: number }

/**
 * Auf Zehner bis Hunderttausender runden - die Stelle wechselt je Aufgabe.
 * Zwei weitere Fassungen derselben Rundung: die Aufforderung umgestellt,
 * und eine Wahr-Falsch-Behauptung über das Ergebnis (zweizeilig, sonst
 * sprengt „Hunderttausender" plus zwei sechsstellige Zahlen die 40 Zeichen).
 */
export function runden(rng: Zufall, p: RundenP): Kern {
  const z = ganz(rng, p.min, p.max);
  const { stufe, wort } = eines(rng, RUNDUNGSSTELLEN);
  const gerundet = Math.round(z / stufe) * stufe;

  const kandidaten = [gerundet + stufe, gerundet - stufe].filter((x) => x >= 0 && x <= 1000000 && x !== gerundet);
  const behauptet = rng() < 0.5 || !kandidaten.length ? gerundet : eines(rng, kandidaten);
  const stimmt = behauptet === gerundet;

  return {
    sorte: "direkt", op: "zahlen",
    angabe: `${zahl(z)} auf den ${wort} runden`,
    loesung: zahl(gerundet),
    zahlen: [z],
    varianten: [
      { angabe: `Runde ${zahl(z)} auf den ${wort}`, loesung: zahl(gerundet) },
      {
        angabe: `${zahl(z)} auf ${wort} runden.\n${zahl(behauptet)} - stimmt das?`,
        loesung: stimmt ? "ja" : "nein",
        auchRichtig: stimmt ? ["stimmt", "richtig"] : ["stimmt nicht", "falsch"],
      },
    ],
  };
}

/* ------------------------------------------------------------------ */
/* 4-03 Ergänzen bis eine Million                                       */
/* ------------------------------------------------------------------ */

export interface ErgaenzenGrossP { min: number; max: number }

/** Ergänzen auf den nächsten Tausender - oder gleich auf eine Million. */
export function ergaenzenGross(rng: Zufall, p: ErgaenzenGrossP): Kern {
  const ziel: "tausender" | number = rng() < 0.5 ? "tausender" : 1000000;
  return ergaenzung(rng, { ziel, min: p.min, max: p.max });
}

/* ------------------------------------------------------------------ */
/* 4-04 Stufenzahlen mal und geteilt durch 10, 100, 1000                */
/* ------------------------------------------------------------------ */

export interface StufenzahlReiheP { basisMin: number; basisMax: number }

/**
 * Eine Stufenzahlreihe: dieselbe Zahl, mal 10, mal 100, mal 1000 - oder
 * rückwärts gelesen geteilt. Als fertige Reihe gebaut (siehe Kopf der
 * Datei), damit die Lücke nie eine Dezimalzahl trifft.
 */
export function stufenzahlReihe(rng: Zufall, p: StufenzahlReiheP): Kern {
  const basis = ganz(rng, p.basisMin, p.basisMax);
  const aufwaerts = rng() < 0.5;
  const glieder = aufwaerts
    ? [basis, basis * 10, basis * 100, basis * 1000]
    : [basis * 1000, basis * 100, basis * 10, basis];
  return { sorte: "reihe", op: "gemischt", glieder, schritt: 0 };
}

/* ------------------------------------------------------------------ */
/* 4-06 Schriftlich Minus mit Nullen im Minuenden                       */
/* ------------------------------------------------------------------ */

export interface DifferenzMitNullP { min: number; max: number }

/**
 * Subtraktion, bei der der Minuend mindestens eine Null enthält - genau das
 * belegte Fehlermuster („Nullen im Minuenden"), das ohne diese Bedingung nie
 * geübt würde.
 */
export function differenzMitNull(rng: Zufall, p: DifferenzMitNullP): Kern {
  for (let versuch = 0; versuch < 300; versuch++) {
    const a = ganz(rng, p.min, p.max);
    if (!/0/.test(String(a))) continue;
    const b = ganz(rng, p.min, a);
    return { sorte: "rechnung", op: "minus", a, b, ergebnis: a - b };
  }
  throw new Error("differenzMitNull: keine passenden Zahlen gefunden - Bedingungen prüfen");
}

/* ------------------------------------------------------------------ */
/* 4-07 Schriftlich Mal, zweistelliger Multiplikator                    */
/* ------------------------------------------------------------------ */

export interface MalGrossP { aMin: number; aMax: number; bMin: number; bMax: number }

/** Vierstellig mal zweistellig - schriftliches Multiplizieren. */
export function malGross(rng: Zufall, p: MalGrossP): Kern {
  const a = ganz(rng, p.aMin, p.aMax);
  const b = ganz(rng, p.bMin, p.bMax);
  return { sorte: "rechnung", op: "mal", a, b, ergebnis: a * b };
}

/* ------------------------------------------------------------------ */
/* 4-08 Division durch eine Zehnerzahl                                  */
/* ------------------------------------------------------------------ */

export interface TeilenDurchZehnerzahlP { divisoren: readonly number[]; aMin: number; aMax: number }

/** Division ohne Rest durch eine Zehnerzahl (20 bis 90) - Nullen kürzen. */
export function teilenDurchZehnerzahl(rng: Zufall, p: TeilenDurchZehnerzahlP): Kern {
  for (let versuch = 0; versuch < 300; versuch++) {
    const d = eines(rng, p.divisoren);
    const minF = Math.ceil(p.aMin / d);
    const maxF = Math.floor(p.aMax / d);
    if (minF > maxF) continue;
    const f = ganz(rng, minF, maxF);
    return { sorte: "rechnung", op: "geteilt", a: d * f, b: d, ergebnis: f };
  }
  throw new Error("teilenDurchZehnerzahl: keine passenden Zahlen gefunden - Bedingungen prüfen");
}

/* ------------------------------------------------------------------ */
/* 4-09/4-11 Division durch eine zweistellige Zahl, mit und ohne Rest   */
/* ------------------------------------------------------------------ */

export interface TeilenZweistelligP { divisorMin: number; divisorMax: number; dividendMin: number; dividendMax: number }

/** Division durch eine zweistellige Zahl - mal mit, mal ohne Rest. */
export function teilenZweistellig(rng: Zufall, p: TeilenZweistelligP): Kern {
  const mitRest = rng() < 0.5;
  for (let versuch = 0; versuch < 300; versuch++) {
    const d = ganz(rng, p.divisorMin, p.divisorMax);
    const minF = Math.max(1, Math.ceil(p.dividendMin / d));
    const maxF = Math.floor(p.dividendMax / d);
    if (minF > maxF) continue;
    const f = ganz(rng, minF, maxF);
    const rest = mitRest ? ganz(rng, 1, d - 1) : 0;
    const a = d * f + rest;
    if (a > p.dividendMax) continue;
    return mitRest
      ? { sorte: "rechnung", op: "geteilt", a, b: d, ergebnis: f, rest }
      : { sorte: "rechnung", op: "geteilt", a, b: d, ergebnis: f };
  }
  throw new Error("teilenZweistellig: keine passenden Zahlen gefunden - Bedingungen prüfen");
}

/* ------------------------------------------------------------------ */
/* 4-10 Überschlag bei Mal und Geteilt                                  */
/* ------------------------------------------------------------------ */

export interface GrosseRechnungP { aMin: number; aMax: number; bMin: number; bMax: number }

/** Große Zahlen für Mal oder Geteilt - der Stoff für den Überschlag. */
export function grosseRechnung(rng: Zufall, p: GrosseRechnungP): Kern {
  if (rng() < 0.5) {
    const a = ganz(rng, p.aMin, p.aMax);
    const b = ganz(rng, p.bMin, p.bMax);
    return { sorte: "rechnung", op: "mal", a, b, ergebnis: a * b };
  }
  const b = ganz(rng, p.bMin, p.bMax);
  const f = ganz(rng, p.aMin, p.aMax);
  return { sorte: "rechnung", op: "geteilt", a: b * f, b, ergebnis: f };
}

/* ------------------------------------------------------------------ */
/* 4-12 Stellen-Einmaleins                                              */
/* ------------------------------------------------------------------ */

const STUFENWERTE = [20, 30, 40, 50, 60, 70, 80, 90, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const;

export interface StellenEinmaleinsP { einerMin: number; einerMax: number }

/** Einmaleins in höheren Stellen: a (2 bis 9) mal 20 bis 900. */
export function stellenEinmaleins(rng: Zufall, p: StellenEinmaleinsP): Kern {
  const a = ganz(rng, p.einerMin, p.einerMax);
  const b = eines(rng, STUFENWERTE);
  return { sorte: "rechnung", op: "mal", a, b, ergebnis: a * b, variiere: "a" };
}

/* ------------------------------------------------------------------ */
/* 4-13/4-14 Brüche anschaulich und Bruchteile von Größen                */
/* ------------------------------------------------------------------ */

export interface GroesseFuerBruch { kurz: string; maxVielfaches: number }

const GROESSEN_FUER_BRUCH: readonly GroesseFuerBruch[] = [
  { kurz: "kg", maxVielfaches: 12 },
  { kurz: "g", maxVielfaches: 50 },
  { kurz: "l", maxVielfaches: 12 },
  { kurz: "m", maxVielfaches: 24 },
  { kurz: "min", maxVielfaches: 12 },
  { kurz: "EUR", maxVielfaches: 24 },
];

export type BruchteilModus = "anschaulich" | "groesse";
export interface BruchteilP { modus: BruchteilModus; nenner: readonly number[]; groessen?: readonly GroesseFuerBruch[] }

/** Größter gemeinsamer Teiler - zum Kürzen von Brüchen. */
export function ggt(a: number, b: number): number {
  return b === 0 ? a : ggt(b, a % b);
}

/**
 * Halbe, Viertel, Achtel. Im Modus "anschaulich" (4-13) eine Wahr-Falsch-
 * Aussage über einen Anteil - mit einer Lücken- und einer Vergleichs-
 * Fassung daneben; im Modus "groesse" (4-14) ein Anteil einer Größe (die
 * Größe ist immer durch den Nenner teilbar) - mit der Rückfrage daneben.
 * ★ Drei Fassungen derselben Sache, damit ein Lauf nicht zwölfmal dieselbe
 * Frage stellt (siehe Kopf der Datei zu `varianten`).
 */
/**
 * Jeder Bruch, der denselben Wert hat - gekürzt, erweitert, als ganze Zahl.
 *
 * ★ In 4-13 und 4-14 ist Kürzen nicht die Aufgabe. Gemessen am 23.09.2026:
 * „4 min sind wie viel von 4 min?" verlangte `2/2`, und `1` oder `4/4`
 * galten als falsch; zu „45 m von 60 m" galt `6/8` nicht.
 */
function gleichwertigeBrueche(z: number, n: number, auch: string[] = []): string[] {
  const t = ggt(z, n);
  const zk = z / t, nk = n / t;
  const raus = new Set<string>(auch);
  if (nk === 1) raus.add(String(zk));
  for (let f = 1; nk * f <= 64; f++) raus.add(`${zk * f}/${nk * f}`);
  raus.delete(`${z}/${n}`);
  return [...raus];
}

export function bruchteilAnschaulich(rng: Zufall, p: BruchteilP): Kern {
  const nenner = eines(rng, p.nenner);
  const zaehlerRichtig = ganz(rng, 1, nenner);

  if (p.modus === "groesse") {
    const einheit = eines(rng, p.groessen ?? GROESSEN_FUER_BRUCH);
    const vielfaches = ganz(rng, 1, einheit.maxVielfaches);
    const groesse = nenner * vielfaches;
    const anteil = (groesse / nenner) * zaehlerRichtig;
    return {
      sorte: "direkt", op: "bruch",
      angabe: `${zaehlerRichtig}/${nenner} von ${zahl(groesse)} ${einheit.kurz} =${LUECKE} ${einheit.kurz}`,
      loesung: zahl(anteil),
      zahlen: [zaehlerRichtig, nenner, groesse],
      varianten: [
        {
          angabe: `${zahl(anteil)} ${einheit.kurz} sind wie viel von ${zahl(groesse)} ${einheit.kurz}?`,
          loesung: `${zaehlerRichtig}/${nenner}`,
          // Auch das Verhältnis der Größen selbst: 45 m von 60 m sind 45/60.
          auchRichtig: gleichwertigeBrueche(zaehlerRichtig, nenner, [`${zahl(anteil)}/${zahl(groesse)}`]),
        },
      ],
    };
  }

  const stimmt = rng() < 0.5;
  let zaehlerGezeigt = zaehlerRichtig;
  if (!stimmt) {
    const andere: number[] = [];
    for (let z = 1; z <= nenner; z++) if (z !== zaehlerRichtig) andere.push(z);
    zaehlerGezeigt = eines(rng, andere);
  }

  // Vergleich mit einem zweiten, unabhängig gewürfelten Bruch - auch
  // wertgleiche Brüche (2/4 und 1/2) sind ein zulässiges, lehrreiches
  // Ergebnis: "gleich groß". Nur die SCHREIBWEISE darf nie doppelt
  // vorkommen ("2/4 oder 2/4" ist keine Aufgabe).
  let nenner2 = eines(rng, p.nenner);
  let zaehler2 = ganz(rng, 1, nenner2);
  for (let versuch = 0; versuch < 20 && zaehler2 === zaehlerRichtig && nenner2 === nenner; versuch++) {
    nenner2 = eines(rng, p.nenner);
    zaehler2 = ganz(rng, 1, nenner2);
  }
  if (zaehler2 === zaehlerRichtig && nenner2 === nenner) {
    // Sicherheitsnetz, falls der Zufall zwanzigmal danebengreift: eine
    // Ziffer verschieben, ohne den Bereich zu verlassen.
    zaehler2 = zaehler2 < nenner2 ? zaehler2 + 1 : zaehler2 - 1;
  }
  const wert1 = zaehlerRichtig / nenner;
  const wert2 = zaehler2 / nenner2;
  const vergleichLoesung =
    wert1 === wert2 ? "gleich groß" : wert1 > wert2 ? `${zaehlerRichtig}/${nenner}` : `${zaehler2}/${nenner2}`;

  // Jede gleichwertige Form des Anteils - "2/4", "1/2" und "4/8" sind richtig.
  const bruchAuchRichtig = gleichwertigeBrueche(zaehlerRichtig, nenner);

  return {
    sorte: "direkt", op: "bruch",
    angabe: `${zaehlerRichtig} von ${nenner} Teilen sind ${zaehlerGezeigt}/${nenner} - stimmt das?`,
    loesung: stimmt ? "ja" : "nein",
    auchRichtig: stimmt ? ["stimmt", "richtig"] : ["stimmt nicht", "falsch"],
    zahlen: [zaehlerRichtig, nenner, zaehlerGezeigt],
    varianten: [
      {
        angabe: `${zaehlerRichtig} von ${nenner} Teilen sind ${LUECKE}`,
        loesung: `${zaehlerRichtig}/${nenner}`,
        auchRichtig: bruchAuchRichtig,
      },
      {
        angabe: `Was ist größer: ${zaehlerRichtig}/${nenner} oder ${zaehler2}/${nenner2}?`,
        loesung: vergleichLoesung,
        auchRichtig: vergleichLoesung === "gleich groß"
          ? ["gleich", "beide gleich", "gleich gross"]
          : gleichwertigeBrueche(...(vergleichLoesung.split("/").map(Number) as [number, number])),
      },
    ],
  };
}

/* ------------------------------------------------------------------ */
/* 4-15 Größen umwandeln                                                */
/* ------------------------------------------------------------------ */

export interface EinheitPaar {
  grossKurz: string; kleinKurz: string;
  /** Wie viele kleine Einheiten eine große ergeben. */
  faktor: number;
  /** Höchste Anzahl der großen Einheit, die noch vorkommen darf. */
  maxGross: number;
  /** Vergleichswort für die Vergleichs-Fassung: "länger", "schwerer", "mehr wert". */
  vergleich: string;
}

const GROESSEN_PAARE: readonly EinheitPaar[] = [
  { grossKurz: "km", kleinKurz: "m", faktor: 1000, maxGross: 9, vergleich: "länger" },
  { grossKurz: "t", kleinKurz: "kg", faktor: 1000, maxGross: 9, vergleich: "schwerer" },
  { grossKurz: "kg", kleinKurz: "g", faktor: 1000, maxGross: 9, vergleich: "schwerer" },
  { grossKurz: "h", kleinKurz: "min", faktor: 60, maxGross: 23, vergleich: "länger" },
  { grossKurz: "min", kleinKurz: "s", faktor: 60, maxGross: 59, vergleich: "länger" },
  { grossKurz: "EUR", kleinKurz: "Cent", faktor: 100, maxGross: 99, vergleich: "mehr wert" },
];

export interface GroesseUmwandelnP { paare?: readonly EinheitPaar[] }

/**
 * Eine gemischte Größe (z. B. "1 t 45 kg") in eine einzige Einheit
 * umwandeln. Die Kurzform steht in der Angabe; ausgeschrieben wird die
 * Einheit erst, wenn die Vorlesefunktion sie ansagt.
 *
 * ★ Zwei weitere Fassungen: die Rückrichtung (eine Einheit in zwei
 * zerlegen - Umwandeln muss in beide Richtungen sitzen) und ein Vergleich
 * mit einer zweiten Größe. Der Vergleich steht zweizeilig, sonst sprengen
 * zwei Größen plus Einheiten die 40 Zeichen (siehe 4-02).
 */
export function groesseUmwandeln(rng: Zufall, p: GroesseUmwandelnP = {}): Kern {
  const paar = eines(rng, p.paare ?? GROESSEN_PAARE);
  const grossAnzahl = ganz(rng, 1, paar.maxGross);
  const kleinAnzahl = ganz(rng, 1, paar.faktor - 1);
  const gesamt = grossAnzahl * paar.faktor + kleinAnzahl;
  const mixedText = `${grossAnzahl} ${paar.grossKurz} ${kleinAnzahl} ${paar.kleinKurz}`;

  const abstand = Math.max(1, Math.floor(paar.faktor / 2));
  const andererWert = Math.max(0, gesamt + (rng() < 0.5 ? 1 : -1) * ganz(rng, 1, abstand));
  const andererText = `${zahl(andererWert)} ${paar.kleinKurz}`;
  const mixedIstGroesser = gesamt >= andererWert;

  return {
    sorte: "direkt", op: "gemischt",
    angabe: `${mixedText} = ${LUECKE} ${paar.kleinKurz}`,
    loesung: zahl(gesamt),
    zahlen: [grossAnzahl, kleinAnzahl, paar.faktor],
    varianten: [
      {
        angabe: `${zahl(gesamt)} ${paar.kleinKurz} = ${LUECKE} ${paar.grossKurz} ${LUECKE} ${paar.kleinKurz}`,
        loesung: `${grossAnzahl} und ${kleinAnzahl}`,
        auchRichtig: [`${grossAnzahl}, ${kleinAnzahl}`, `${grossAnzahl} ${kleinAnzahl}`],
      },
      {
        angabe: `${mixedText} oder ${andererText}?\nWas ist ${paar.vergleich}?`,
        loesung: mixedIstGroesser ? mixedText : andererText,
      },
    ],
  };
}

/* ------------------------------------------------------------------ */
/* 4-16 Direkte Proportionalität                                        */
/* ------------------------------------------------------------------ */

export interface ProportionalP { einheiten: readonly number[]; anzahlMax: number }

/**
 * Einfacher Dreisatz mit glatten Zahlen: ein Einzelwert mal eine Menge.
 * ★ Bewusst nur "mal": die Form "kette" verkettet zwei unabhängig
 * gebaute Kerne (siehe `formen.ts`, `rechneAn`) - bei "geteilt" träfe die
 * zweite Zeile oft keine passende Zahl und es entstünde eine Dezimalzahl.
 * Mit reiner Multiplikation geht jede Verkettung immer auf.
 */
export function proportional(rng: Zufall, p: ProportionalP): Kern {
  const einzelwert = eines(rng, p.einheiten);
  const anzahl = ganz(rng, 2, p.anzahlMax);
  return { sorte: "rechnung", op: "mal", a: einzelwert, b: anzahl, ergebnis: einzelwert * anzahl };
}

/* ------------------------------------------------------------------ */
/* 4-17 Wie rechnest du das?                                            */
/* ------------------------------------------------------------------ */

export interface RechenstrategieKandidatP { min: number; max: number }

/**
 * Zahlen nahe an einem Hunderter - genau die Sorte, bei der Zerlegen oder
 * Runden den kürzeren Weg ergibt. Die eigentliche Strategiewahl-Form gibt es
 * noch nicht; das hier ist der Kern, den sie einmal bekommt.
 */
export function rechenstrategieKandidat(rng: Zufall, p: RechenstrategieKandidatP): Kern {
  const basis = ganz(rng, p.min, p.max);
  const naehe = eines(rng, [-2, -1, 1, 2] as const);
  const a = Math.max(1, Math.round(basis / 100) * 100 + naehe);
  const b = ganz(rng, p.min, p.max);
  if (rng() < 0.5) return { sorte: "rechnung", op: "plus", a, b, ergebnis: a + b };
  const groesser = Math.max(a, b);
  const kleiner = Math.min(a, b);
  return { sorte: "rechnung", op: "minus", a: groesser, b: kleiner, ergebnis: groesser - kleiner };
}

/* ------------------------------------------------------------------ */
/* 4-18 Sachaufgaben im großen Zahlenraum                                */
/* ------------------------------------------------------------------ */

export interface DurchschnittP { anzahlWerte: number; schnittMin: number; schnittMax: number; streuung: number }

/**
 * Werte, deren Durchschnitt glatt aufgeht - der letzte Wert gleicht die
 * Streuung der anderen genau aus. Für die spätere Sachaufgaben-Form; die
 * gibt es heute noch nicht.
 */
export function durchschnitt(rng: Zufall, p: DurchschnittP): Kern {
  const n = Math.max(2, p.anzahlWerte);
  const schnitt = ganz(rng, p.schnittMin, p.schnittMax);
  // ★ Die Streuung wird so gedeckelt, dass der letzte Wert (der Ausgleich)
  // immer positiv bleibt: schnitt - (n-1) * streuung muss mindestens 1 sein.
  const streuung = Math.max(0, Math.min(p.streuung, Math.floor((p.schnittMin - 1) / (n - 1))));
  const werte: number[] = [];
  let rest = schnitt * n;
  for (let i = 0; i < n - 1; i++) {
    const w = schnitt + ganz(rng, -streuung, streuung);
    werte.push(w);
    rest -= w;
  }
  werte.push(rest);
  const op: Operation = "zahlen";
  return {
    sorte: "direkt", op,
    angabe: `Durchschnitt von ${werte.map((w) => zahl(w)).join(", ")}`,
    loesung: zahl(schnitt),
    zahlen: werte,
  };
}
