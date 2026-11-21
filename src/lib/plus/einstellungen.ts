/**
 * Die Einstellungen von Plus, die ein Kind selbst wählt - eigener Speicher.
 *
 * ★ Was hier steht und was nicht:
 *  • „Arbeiten mit Braillezeile" (Schalter) und die Braille-Schrift
 *    (Computerbraille · 6-Punkt-Braille) - seit 19.10.2026 zwei Einstellungen
 *    statt einer Eingabemethode. Alt + B wechselt von jeder Stelle der Seite
 *    aus (Zahlen tippen ⇒ Computerbraille ⇒ 6-Punkt ⇒ zurück).
 *  • Textgröße der Angabezeile und der Eingabezeile (Alt + Plus / Alt + Minus).
 *    Dieselbe Leiter wie Tastenflow, Punktgenau und eine andere App der Plattform 
 *    (`ZOOM_STUFEN`, 100 % bis 800 %).
 *  • Zeichenabstand groß (CVI) und Kontrast liegen NICHT hier: der Abstand
 *    kommt aus `useDeviceZeichenabstand` (gilt in allen Apps gleich), der
 *    Kontrast aus dem Farbschalter der Kopfzeile (Alt + K).
 *
 * Johannes, 12.10.2026: „mit alt ++ muss angabezeile und eingabezeile ganz
 * groß werden - in den einstellungen muss man die eingabemethode festlegen
 * können".
 */
import { create } from "zustand";
import { ZOOM_STUFEN } from "@/lib/arbeitsblatt/vergroesserung";
import { plusSprache } from "./aktuelleSprache";
import {
  STIMM_KENNUNG, hatRegion, istRegionFuer, vorgabeRegion,
  type PlusRegion, type RegionSprache,
} from "./regionen";

export type Eingabeart = "normal" | "computer" | "marburger";

export const EINGABEARTEN: readonly Eingabeart[] = ["normal", "computer", "marburger"];

/** Der Name jeder Eingabeart - er wird angesagt, also ist er ein ganzer Satz wert. */
export const EINGABEART_NAME: Record<Eingabeart, string> = {
  normal: "Zahlen tippen",
  computer: "Computerbraille",
  marburger: "Mathematikschrift, 6 Punkte",
};

/** Die nächste Art in der Runde - Alt + B geht immer vorwärts. */
export function naechsteArt(art: Eingabeart): Eingabeart {
  return EINGABEARTEN[(EINGABEARTEN.indexOf(art) + 1) % EINGABEARTEN.length];
}

const KEY = "plus_einstellungen";

/** Die Schrift, in der mit Braillezeile gegriffen wird. */
export type BrailleSchrift = Exclude<Eingabeart, "normal">;

export const BRAILLESCHRIFTEN: readonly BrailleSchrift[] = ["computer", "marburger"];

/** Die zwei Schriften, wie das Kind sie nennt. */
export const BRAILLESCHRIFT_NAME: Record<BrailleSchrift, string> = {
  computer: "Computerbraille (8 Punkte)",
  marburger: "6-Punkt-Braille (Mathematikschrift)",
};

/**
 * ★ Johannes, 19.10.2026: Der Schalter „Arbeiten mit Braillezeile" kommt zuerst,
 * dann die Wahl der Schrift. Gespeichert wird beides; die Eingabeart, die die
 * Seiten kennen, ergibt sich daraus (`eingabeartAus`).
 */
interface Gespeichert {
  braillezeile: boolean;
  schrift: BrailleSchrift;
  /** Wie viele Zeichen die Braillezeile hat - und damit eine Zeile des Eingabefelds. */
  breite: Zeilenbreite;
  zoomIndex: number;
  /**
   * Land/Region je Sprache (nur es und fr; 10.11.2026). FEHLT die Wahl, gilt die
   * Vorgabe aus der Browser-Sprache (`vorgabeRegion`) - darum bleibt das Feld
   * leer, solange das Kind nicht gewählt hat, und alte Stände ohne das Feld
   * laufen unverändert weiter (und werden ohne Wahl auch nicht umgeschrieben).
   */
  region?: Partial<Record<RegionSprache, PlusRegion>>;
}

/**
 * ★ Johannes, 22.10.2026: „Der Schalter Greifen ist sehr verwirrend - wer oben 6-Punkt oder
 * 8-Punkt Ausgabe angibt, soll sie automatisch auch eingeben." Es gibt keine eigene Wahl mehr:
 * MIT Braillezeile greift das Kind in der gewählten Schrift, OHNE tippt es Zahlen. Nur die
 * Lehrkraft kann es für ein Kind oder die Klasse anders festlegen (`Vorgabe.eingabe`);
 * bis 22.10. wählte das Kind selbst („Wie du schreibst", Standard Tastatur, 19.10.2026).
 */
export type Eingabeweg = "tastatur" | "braille";
export const EINGABEWEGE: readonly Eingabeweg[] = ["tastatur", "braille"];
export const EINGABEWEG_NAME: Record<Eingabeweg, string> = {
  tastatur: "Zahlen auf der Tastatur",
  braille: "Braille greifen",
};

/** Die Braillezeilen, die es gibt: 40 oder 80 Zellen (Johannes, 19.10.2026). */
export type Zeilenbreite = 40 | 80;
export const ZEILENBREITEN: readonly Zeilenbreite[] = [40, 80];
export const ZEILENBREITE_NAME: Record<Zeilenbreite, string> = {
  40: "40 Zeichen",
  80: "80 Zeichen",
};

/**
 * ★ Was die Lehrkraft für das Kind festlegt (Klasse oder einzelnes Kind, siehe
 * `braillevorgabe` in `beschluss.ts`). Was hier steht, gilt - das Kind kann es
 * in den Einstellungen nicht ändern; was fehlt, wählt das Kind selbst.
 */
export interface Vorgabe {
  braillezeile?: boolean;
  schrift?: BrailleSchrift;
  breite?: Zeilenbreite;
  eingabe?: Eingabeweg;
}

/** Aus Schalter und Schrift die Eingabeart: ohne Braillezeile tippt das Kind Zahlen. */
export function eingabeartAus(braillezeile: boolean, schrift: BrailleSchrift): Eingabeart {
  return braillezeile ? schrift : "normal";
}

function heileBreite(b: unknown): Zeilenbreite {
  return b === 80 ? 80 : 40;
}

function klemme(i: number): number {
  return Math.max(0, Math.min(ZOOM_STUFEN.length - 1, Math.round(i)));
}

function heileRegion(r: unknown): Partial<Record<RegionSprache, PlusRegion>> | undefined {
  if (!r || typeof r !== "object") return undefined;
  const aus: Partial<Record<RegionSprache, PlusRegion>> = {};
  for (const sprache of ["es", "fr"] as const) {
    const w = (r as Record<string, unknown>)[sprache];
    if (istRegionFuer(sprache, w)) aus[sprache] = w;
  }
  return Object.keys(aus).length ? aus : undefined;
}

function lese(): Gespeichert {
  try {
    const p = JSON.parse(window.localStorage.getItem(KEY) ?? "{}") as Partial<Gespeichert> & { eingabeart?: Eingabeart };
    // Bis 19.10. stand hier nur die Eingabeart: „computer" oder „marburger" heißt Braillezeile an.
    const alt = p.eingabeart;
    const schrift: BrailleSchrift = BRAILLESCHRIFTEN.includes(p.schrift as BrailleSchrift)
      ? (p.schrift as BrailleSchrift)
      : alt === "marburger" ? "marburger" : "computer";
    return {
      braillezeile: typeof p.braillezeile === "boolean" ? p.braillezeile : alt === "computer" || alt === "marburger",
      schrift,
      breite: heileBreite(p.breite),
      zoomIndex: typeof p.zoomIndex === "number" ? klemme(p.zoomIndex) : 0,
      ...(heileRegion(p.region) ? { region: heileRegion(p.region) } : {}),
    };
  } catch {
    return { braillezeile: false, schrift: "computer", breite: 40, zoomIndex: 0 };
  }
}

function schreibe(s: Gespeichert): void {
  try { window.localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* ohne Speicher eben flüchtig */ }
}

/** Wie geschrieben wird: die Lehrkraft vor der Regel „mit Braillezeile greift das Kind". */
function eingabewegAus(w: Gespeichert, v: Vorgabe): Eingabeweg {
  return v.eingabe ?? (w.braillezeile ? "braille" : "tastatur");
}

interface EinstellungenState extends Gespeichert {
  /** Wie das Kind schreibt - folgt der Braillezeile (siehe `Eingabeweg`). */
  eingabe: Eingabeweg;
  /** Was die Seiten kennen: „normal", wenn die Braillezeile aus ist, sonst die gewählte Schrift. */
  eingabeart: Eingabeart;
  /** Der Faktor zur Stufe (`ZOOM_STUFEN[zoomIndex]`). */
  zoom: number;
  setBraillezeile: (an: boolean) => void;
  setSchrift: (schrift: BrailleSchrift) => void;
  setBreite: (breite: Zeilenbreite) => void;
  /** Die eigene Wahl von Land/Region je Sprache; leer = die Vorgabe aus der Browser-Sprache gilt. */
  region: Partial<Record<RegionSprache, PlusRegion>>;
  setRegion: (sprache: RegionSprache, region: PlusRegion) => void;
  /** Die Vorgabe der Lehrkraft (leer = das Kind wählt alles selbst). */
  vorgabe: Vorgabe;
  setVorgabe: (v: Vorgabe) => void;
  /** Setzt Schalter und Schrift zusammen (Alt + B, ältere Aufrufer). */
  setEingabeart: (art: Eingabeart) => void;
  /** Alt + B: weiter in der Runde. Gibt die neue Art zurück. */
  naechsteEingabeart: () => Eingabeart;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  setZoomIndex: (i: number) => void;
}

/** Die Werte, die gelten: die Vorgabe der Lehrkraft vor der eigenen Wahl des Kindes. */
function wirksam(eigene: Gespeichert, v: Vorgabe): Gespeichert {
  return {
    braillezeile: v.braillezeile ?? eigene.braillezeile,
    schrift: v.schrift ?? eigene.schrift,
    breite: v.breite ?? eigene.breite,
    zoomIndex: eigene.zoomIndex,
  };
}

function gleich(a: Vorgabe, b: Vorgabe): boolean {
  return a.braillezeile === b.braillezeile && a.schrift === b.schrift && a.breite === b.breite && a.eingabe === b.eingabe;
}

export const useEinstellungen = create<EinstellungenState>((set, get) => {
  const start = lese();
  // ★ Die eigene Wahl des Kindes liegt im Gerätespeicher; die Vorgabe der Lehrkraft
  // überdeckt sie nur und wird NIE dorthin geschrieben - fällt sie weg, gilt die
  // eigene Wahl wieder.
  let eigene: Gespeichert = start;
  const zeige = (v: Vorgabe) => {
    const w = wirksam(eigene, v);
    set({ ...w, eingabe: eingabewegAus(w, v), eingabeart: eingabeartAus(w.braillezeile, w.schrift), zoom: ZOOM_STUFEN[w.zoomIndex], vorgabe: v });
  };
  const setze = (teil: Partial<Gespeichert>) => {
    // Die Textgröße gehört immer dem Kind; Tests und andere Aufrufer setzen sie auch direkt im Store.
    eigene = { ...eigene, zoomIndex: get().zoomIndex, ...teil };
    schreibe(eigene);
    zeige(get().vorgabe);
  };
  // Alt + B und die Einstellungen ändern nur, was die Lehrkraft nicht festgelegt hat.
  const setzeArt = (art: Eingabeart) => {
    const v = get().vorgabe;
    if (v.braillezeile !== undefined) return;
    if (art === "normal") setze({ braillezeile: false });
    else setze(v.schrift !== undefined ? { braillezeile: true } : { braillezeile: true, schrift: art });
  };
  return {
    ...wirksam(start, {}),
    eingabe: eingabewegAus(wirksam(start, {}), {}),
    eingabeart: eingabeartAus(start.braillezeile, start.schrift),
    zoom: ZOOM_STUFEN[start.zoomIndex],
    vorgabe: {},
    setVorgabe: (v) => { if (!gleich(v, get().vorgabe)) zeige(v); },
    setBraillezeile: (an) => { if (get().vorgabe.braillezeile === undefined) setze({ braillezeile: an }); },
    setSchrift: (schrift) => { if (get().vorgabe.schrift === undefined) setze({ schrift }); },
    setBreite: (breite) => { if (get().vorgabe.breite === undefined) setze({ breite }); },
    region: start.region ?? {},
    setRegion: (sprache, region) => {
      if (!istRegionFuer(sprache, region)) return;
      const neu = { ...get().region, [sprache]: region };
      eigene = { ...eigene, zoomIndex: get().zoomIndex, region: neu };
      schreibe(eigene);
      set({ region: neu });
    },
    setEingabeart: setzeArt,
    naechsteEingabeart: () => {
      setzeArt(naechsteArt(get().eingabeart));
      return get().eingabeart;
    },
    zoomIn: () => setze({ zoomIndex: klemme(get().zoomIndex + 1) }),
    zoomOut: () => setze({ zoomIndex: klemme(get().zoomIndex - 1) }),
    resetZoom: () => setze({ zoomIndex: 0 }),
    setZoomIndex: (i) => setze({ zoomIndex: klemme(i) }),
  };
});

/**
 * Die Region, in der Plus gerade rechnet: die Wahl des Kindes, sonst die Vorgabe aus der
 * Browser-Sprache. `null` für Deutsch und Englisch - dort gibt es keine Regionen, und
 * ohne Probe-Schalter `?plus-sprachen=1` (Sprache immer `de`) ändert sich nirgends etwas.
 */
export function aktuelleRegion(): PlusRegion | null {
  const sprache = plusSprache();
  if (!hatRegion(sprache)) return null;
  return useEinstellungen.getState().region[sprache] ?? vorgabeRegion(sprache);
}

/** Die Stimm-Kennung der Region (`es-MX`) - `undefined` für Sprachen ohne Region. */
export function stimmKennungAktuell(): string | undefined {
  const r = aktuelleRegion();
  return r ? STIMM_KENNUNG[r] : undefined;
}

/** „Textgröße 200 Prozent" für die Ansage. */
export function zoomSatz(faktor: number): string {
  return `Textgröße ${Math.round(faktor * 100)} Prozent`;
}
