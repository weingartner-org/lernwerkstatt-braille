/**
 * Lieder für die „Lieder-Werkstatt" (kp14) — zwei Regale: Kinderlieder und
 * Klassik/Evergreens für Erwachsene. ALLE Melodien sind gemeinfrei
 * (traditionell bzw. Komponist:in seit weit über 70 Jahren verstorben);
 * die einstimmigen Fassungen hier sind EIGENE Transkriptionen — keine
 * fremden Notensätze/Arrangements kopiert.
 *
 * Kompakte Melodie-Notation (parseLine):
 *   Ton (c d e f g a h, optional is/es: „fis"), Oktave (4 = eingestrichen),
 *   Wert (g=ganze, h=halbe, v=viertel, a=achtel), „." = punktiert,
 *   „p"+Wert = Pause, „|" = Taktstrich. Beispiel: "g4v e4v e4h | f4v d4v d4h"
 */
import {
  bar,
  note,
  rest,
  type Accidental,
  type Articulation,
  type MusicEvent,
  type NoteValue,
  type ToneName,
} from "./notation";
import { klangSprache } from "./sprache";

const VALUE_CODE: Record<string, NoteValue> = {
  g: "ganze",
  h: "halbe",
  v: "viertel",
  a: "achtel",
  s: "sechzehntel",
};

/**
 * Eine Zeile Kompakt-Notation → Events (wirft bei Tippfehlern im Datensatz).
 *
 * RÜCKWÄRTSKOMPATIBLE Ausdrucks-Erweiterung (Stufe 5, §11.2): Die 18 Bestands-
 * lieder enthalten KEINES der neuen Zeichen und bleiben deshalb zeichengleich.
 *  • Note-Suffixe (fließen ins MusicNote und klingen): `~` Haltebogen (tie),
 *    `'` staccato, `_` tenuto/legato, `^` akzent.
 *  • `(` … `)` = Bindebogen-Gruppe: die eingeschlossenen Noten klingen legato
 *    (tenuto), sofern sie kein eigenes Artikulationssuffix tragen.
 *  • Freistehende Vortrags-Tokens `!p !f !mf !cr( !cr) !fermate` werden erkannt
 *    und übersprungen (sie haben kein MusicEvent-Zuhause — die Dynamik der
 *    Bühnen-Lieder spielt der Aufgaben-Generator ein, §9.2).
 */
export function parseLine(line: string): MusicEvent[] {
  const out: MusicEvent[] = [];
  let slurGroup = false; // innerhalb einer (…)-Bindebogen-Gruppe?
  for (let raw of line.trim().split(/\s+/)) {
    if (!raw) continue;
    if (raw === "|") {
      out.push(bar);
      continue;
    }
    // Freistehende Vortrags-Tokens (kein Event-Zuhause) — erkennen und überspringen.
    if (raw.startsWith("!")) continue;
    // Bindebogen-Gruppe: führendes „(" öffnet, abschließendes „)" schließt.
    let closeAfter = false;
    if (raw.startsWith("(")) {
      slurGroup = true;
      raw = raw.slice(1);
    }
    if (raw.endsWith(")")) {
      closeAfter = true;
      raw = raw.slice(0, -1);
    }
    // Ausdrucks-Suffixe am Token-Ende einsammeln (mehrere erlaubt).
    let tie = false;
    let artic: Articulation | undefined;
    while (raw.length && "~'_^".includes(raw[raw.length - 1])) {
      const s = raw[raw.length - 1];
      if (s === "~") tie = true;
      else if (s === "'") artic = "staccato";
      else if (s === "_") artic = "tenuto";
      else if (s === "^") artic = "akzent";
      raw = raw.slice(0, -1);
    }
    if (raw) {
      const m = /^(p)?([cdefgah])?(is|es)?([1-7])?([ghvas])(\.)?$/.exec(raw);
      if (!m) throw new Error(`Klangpunkte: unlesbares Melodie-Token „${raw}"`);
      const [, p, tone, accRaw, oct, val, dot] = m;
      const value = VALUE_CODE[val];
      if (p) {
        out.push(rest(value, !!dot));
      } else {
        if (!tone || !oct) throw new Error(`Klangpunkte: Note ohne Ton/Oktave „${raw}"`);
        const accidental: Accidental | undefined =
          accRaw === "is" ? "kreuz" : accRaw === "es" ? "be" : undefined;
        // In einer Bindebogen-Gruppe klingt jede Note legato, sofern sie kein
        // eigenes Artikulationssuffix trägt.
        const effArtic = artic ?? (slurGroup ? ("tenuto" as const) : undefined);
        out.push(
          note(tone as ToneName, Number(oct), value, {
            ...(dot ? { dotted: true } : {}),
            ...(accidental ? { accidental } : {}),
            ...(tie ? { tie: true } : {}),
            ...(effArtic ? { artic: effArtic } : {}),
          }),
        );
      }
    }
    if (closeAfter) slurGroup = false;
  }
  return out;
}

export interface Song {
  id: string;
  title: string;
  shelf: "kinder" | "erwachsene" | "ausdruck";
  /** Herkunft/Beleg (gemeinfrei). */
  origin: string;
  timeSig?: [number, number];
  /** Je Zeile eine singbare Phrase (mit Taktstrichen). */
  lines: MusicEvent[][];
}

function song(
  id: string,
  title: string,
  shelf: Song["shelf"],
  origin: string,
  timeSig: [number, number] | undefined,
  lines: string[],
): Song {
  return { id, title, shelf, origin, timeSig, lines: lines.map(parseLine) };
}

// --- Die 18 Lieder ------------------------------------------------------------------
// Melodien kreuzgeprüft (Web-Recherche 02.07.2026, je 2 Quellen: Wikipedia-
// LilyPond, lieder-archiv-MusicXML, Mutopia, ABC-Archive); Details/Varianten
// im Recherche-Doc. Bögen der Quellfassungen sind bewusst weggelassen
// (Bögen = spätere Ausbaustufe); Ode Z3/Donau T26: Haltebogen aufgelöst.

export const SONGS: Song[] = [
  // ---- Kinder-Regal ----
  song(
    "haenschen",
    "Hänschen klein",
    "kinder",
    "Volkslied (trad., 19. Jh.) — Referenzstück des BBI-Workshops",
    [2, 4],
    [
      "g4a e4a e4v | f4a d4a d4v | c4a d4a e4a f4a | g4a g4a g4v",
      "g4a e4a e4v | f4a d4a d4v | c4a e4a g4a g4a | c4h",
      "d4a d4a d4a d4a | d4a e4a f4v | e4a e4a e4a e4a | e4a f4a g4v",
      "g4a e4a e4v | f4a d4a d4v | c4a e4a g4a g4a | c4h",
    ],
  ),
  song(
    "entchen",
    "Alle meine Entchen",
    "kinder",
    "Volkslied (trad.)",
    [2, 4],
    [
      "c4a d4a e4a f4a | g4v g4v",
      "a4a a4a a4a a4a | g4v pv",
      "a4a a4a a4a a4a | g4v pv",
      "f4a f4a f4a f4a | e4v e4v",
      "d4a d4a d4a d4a | c4h",
    ],
  ),
  song(
    "kuckuck",
    "Kuckuck, Kuckuck, ruft's aus dem Wald",
    "kinder",
    "Volkslied (trad., Text Hoffmann von Fallersleben)",
    [3, 4],
    [
      "g4v e4v pv | g4v e4v pv | d4v c4v d4v | c4h.",
      "d4v d4v e4v | f4h d4v | e4v e4v f4v | g4h e4v",
      "g4h e4v | g4h e4v | f4v e4v d4v | c4h.",
    ],
  ),
  song(
    "bruder-jakob",
    "Bruder Jakob",
    "kinder",
    "Volkslied (trad., Frère Jacques) — als Kanon singbar",
    [4, 4],
    [
      "c4v d4v e4v c4v | c4v d4v e4v c4v",
      "e4v f4v g4h | e4v f4v g4h",
      "g4a a4a g4a f4a e4v c4v | g4a a4a g4a f4a e4v c4v",
      "c4v g3v c4h | c4v g3v c4h",
    ],
  ),
  song(
    "summ",
    "Summ, summ, summ",
    "kinder",
    "Volkslied (trad., Text Hoffmann von Fallersleben)",
    [2, 4],
    [
      "g4v f4v | e4v pv | d4a e4a f4a d4a | c4v pv",
      "e4a f4a g4a e4a | d4a e4a f4a d4a | e4a f4a g4a e4a | d4a e4a f4a d4a",
      "g4v f4v | e4v pv | d4a e4a f4a d4a | c4v pv",
    ],
  ),
  song(
    "fuchs",
    "Fuchs, du hast die Gans gestohlen",
    "kinder",
    "Volkslied (trad.)",
    [2, 4],
    [
      "c4a d4a e4a f4a | g4a g4a g4a g4a | a4a f4a c5a a4a | g4v pv",
      "a4a f4a c5a a4a | g4v pv | g4a f4a f4a f4a | f4a e4a e4a e4a",
      "e4a d4a e4a d4a | c4a e4a g4v | g4a f4a f4a f4a | f4a e4a e4a e4a",
      "e4a d4a e4a d4a | c4v pv",
    ],
  ),
  song(
    "hopp",
    "Hopp, hopp, hopp",
    "kinder",
    "Volkslied (trad., Melodie C. G. Hering)",
    [2, 4],
    [
      "c4v e4v | g4v pv | g4a f4a e4a d4a | c4v pv",
      "d4a d4a h3a g3a | g4a g4a e4a c4a | d4a d4a h3a g3a | g4a g4a e4a c4a",
      "c4a d4a e4a f4a | g4v pv | g4a f4a e4a d4a | c4v pv",
    ],
  ),
  song(
    "dumpa",
    "Es wird scho glei dumpa",
    "kinder",
    "Österreichisches Volkslied (Text A. Reidinger, Melodie trad.)",
    [3, 4],
    [
      "g3v | c4v c4v d4v | e4a. g4s g4v. f4a | e4v e4v d4v | c4h g3v",
      "c4v c4v d4v | e4a. g4s g4v. f4a | e4v e4v d4v | c4h e4a f4a",
      "g4v e4v g4v | g4a f4a d4v. f4a | e4v c4v e4v | d4h g3v",
      "c4v c4v d4v | e4a. g4s g4v. f4a | e4v e4v d4v",
      "c4h e4a g3a | c4h e4a g3a | c4v. g3a c4a e4a | g4v e4a c4a d4a g3a | c4h pv",
    ],
  ),

  // ---- Erwachsenen-Regal: Klassik ----
  song(
    "ode",
    "Ode an die Freude (Beethoven)",
    "erwachsene",
    "L. v. Beethoven, 9. Sinfonie (1824), Chorthema — Europahymne",
    [4, 4],
    [
      "e4v e4v f4v g4v | g4v f4v e4v d4v | c4v c4v d4v e4v | e4v. d4a d4h",
      "e4v e4v f4v g4v | g4v f4v e4v d4v | c4v c4v d4v e4v | d4v. c4a c4h",
      "d4v d4v e4v c4v | d4v e4a f4a e4v c4v | d4v e4a f4a e4v d4v | c4v d4v g3v e4v",
      "e4v e4v f4v g4v | g4v f4v e4v d4v | c4v c4v d4v e4v | d4v. c4a c4h",
    ],
  ),
  song(
    "nachtmusik",
    "Eine kleine Nachtmusik (Mozart)",
    "erwachsene",
    "W. A. Mozart, KV 525 (1787), 1. Satz, Kopfthema (vereinfacht)",
    [4, 4],
    [
      "c5v pa g4a c5v pa g4a | c5a g4a c5a e5a g5v pv",
      "f5v pa d5a f5v pa d5a | f5a d5a h4a d5a g4v pv",
      "c5a pa c5v. e5a d5a c5a | c5a h4a h4v. d5a f5a h4a",
      "d5a c5a c5v. e5a d5a c5a | c5a h4a h4v. d5a f5a h4a",
      "c5a c5a h4a a4s h4s c5a c5a d5a c5s d5s | e5a e5a f5a e5s f5s g5v pv",
    ],
  ),
  song(
    "fuer-elise",
    "Für Elise (Beethoven)",
    "erwachsene",
    "L. v. Beethoven, WoO 59 (1810), Anfangsthema — mit dem berühmten dis!",
    [3, 8],
    [
      "e5s dis5s | e5s dis5s e5s h4s d5s c5s | a4a ps c4s e4s a4s | h4a ps e4s gis4s h4s | c5a ps e4s e5s dis5s",
      "e5s dis5s e5s h4s d5s c5s | a4a ps c4s e4s a4s | h4a ps e4s c5s h4s | a4v",
    ],
  ),
  song(
    "donau",
    "An der schönen blauen Donau (Strauss)",
    "erwachsene",
    "Johann Strauss II, op. 314 (1867), Walzer Nr. 1, Hauptthema",
    [3, 4],
    [
      "c4v | c4v e4v g4v | g4h g5v | g5h e5v | e5h c4v",
      "c4v e4v g4v | g4h g5v | g5h f5v | f5h h3v",
      "h3v d4v a4v | a4h a5v | a5h f5v | f5h h3v",
      "h3v d4v a4v | a4h a5v | a5h e5v | e5h c4v",
      "e5v c5v e4v | e4h d4v | a4h g4v | c4v. c5a c5v | c5v ph",
    ],
  ),
  song(
    "morgenstimmung",
    "Morgenstimmung (Grieg)",
    "erwachsene",
    "E. Grieg, Peer-Gynt-Suite Nr. 1, op. 46 (1875), Anfangsthema",
    [6, 8],
    [
      "g4a e4a d4a c4a d4a e4a | g4a e4a d4a c4a d4s e4s d4s e4s",
      "g4a e4a g4a a4a e4a a4a | g4a e4a d4a c4v pa",
    ],
  ),

  // ---- Erwachsenen-Regal: Evergreens ----
  song(
    "saints",
    "Oh When the Saints",
    "erwachsene",
    "Gospel (trad., USA)",
    [4, 4],
    [
      "c4v e4v f4v | g4g | pv c4v e4v f4v | g4g",
      "pv c4v e4v f4v | g4h e4h | c4h e4h | d4g",
      "pv e4v e4v d4v | c4g | e4h g4h | g4v f4h.",
      "ph e4v f4v | g4h e4h | c4h d4h | c4g",
    ],
  ),
  song(
    "amazing-grace",
    "Amazing Grace",
    "erwachsene",
    "Hymne (trad., Melodie New Britain) — komplett pentatonisch",
    [3, 4],
    [
      "g3v | c4h e4a c4a | e4h d4v | c4h a3v | g3h g3v",
      "c4h e4a c4a | e4h d4v | g4h e4v | g4v. e4a g4a e4a",
      "c4h g3v | a3v. c4a c4a a3a | g3h g3v",
      "c4h e4a c4a | e4h d4v | c4h.",
    ],
  ),
  song(
    "greensleeves",
    "Greensleeves",
    "erwachsene",
    "England (trad., 16. Jh.)",
    [6, 4],
    [
      "a4v | c5h d5v e5v. f5a e5v | d5h h4v g4v. a4a h4v | c5h a4v a4v. gis4a a4v | h4h gis4v e4h a4v",
      "c5h d5v e5v. f5a e5v | d5h h4v g4v. a4a h4v | c5v. h4a a4v gis4v. fis4a gis4v | a4h. a4h pv",
      "g5h. g5v. f5a e5v | d5h h4v g4v. a4a h4v | c5h a4v a4v. gis4a a4v | h4h gis4v e4h pv",
      "g5h. g5v. f5a e5v | d5h h4v g4v. a4a h4v | c5v. h4a a4v gis4v. fis4a gis4v | a4h. a4h",
    ],
  ),
  song(
    "auld-lang-syne",
    "Auld Lang Syne",
    "erwachsene",
    "Schottland (trad., Text R. Burns) — das Silvesterlied",
    [4, 4],
    [
      "g3v | c4v. c4a c4v e4v | d4v. c4a d4v e4v | c4v. c4a e4v g4v | a4h. a4v",
      "g4v. e4a e4v c4v | d4v. c4a d4v e4v | c4v. a3a a3v g3v | c4h. a4v",
      "g4v. e4a e4v c4v | d4v. c4a d4v a4v | g4v. e4a e4v g4v | a4h. a4v",
      "g4v. e4a e4v c4v | d4v. c4a d4v e4v | c4v. a3a a3v g3v | c4h.",
    ],
  ),
  song(
    "rising-sun",
    "House of the Rising Sun",
    "erwachsene",
    "USA (trad. Ballade; hier die dokumentierte Volksfassung, nicht das 1964er-Arrangement)",
    [3, 4],
    [
      "e4v | a3h h3a a3a | c4h d4a dis4a | e4h c4a h3a | a3h e4v",
      "a4h e4v | g4h e4a d4a | e4h. | e4v pv e4a e4a",
      "a4h a3v | c4h d4v | e4a e4v. c4a h3a | a3h e4v",
      "e4h e4v | e4a e4v. c4a h3a | a3h. | a3h",
    ],
  ),

  // ---- Ausdrucks-Regal: dieselben gemeinfreien Melodien, jetzt MIT Ausdruck ----
  // Drittes Regal der Lieder-Bühne (Stufe 5, §9.2): Bögen, Artikulation und
  // Haltebögen in der Kompaktnotation (parseLine-Erweiterung). Bindebogen-Gruppe
  // „(…)" = legato, „'" = staccato, „_" = tenuto, „~" = Haltebogen. Alle Melodien
  // gemeinfrei, eigene Transkriptionen.
  song(
    "weihnachtsmann",
    "Morgen kommt der Weihnachtsmann",
    "ausdruck",
    "Melodie „Ah! vous dirai-je, maman“ (trad., 18. Jh.); Text Hoffmann von Fallersleben — gemeinfrei",
    [4, 4],
    [
      "(c4v c4v g4v g4v) | a4v a4v g4h",
      "f4v' f4v' e4v' e4v' | d4v d4v c4h",
    ],
  ),
  song(
    "haenschen-ausdruck",
    "Hänschen klein — mit Ausdruck",
    "ausdruck",
    "Volkslied (trad., 19. Jh.) — Bindebogen und Fermate als Vortragsübung",
    [2, 4],
    [
      "(g4a e4a e4v) | (f4a d4a d4v) | c4a d4a e4a f4a | g4a g4a g4v",
      "g4a e4a e4v | f4a d4a d4v | c4a e4a g4a g4a | c4h",
    ],
  ),
  song(
    "freude-ausdruck",
    "Ode an die Freude — mit Ausdruck",
    "ausdruck",
    "L. v. Beethoven, 9. Sinfonie (1824), Chorthema — legato und staccato im Kontrast",
    [4, 4],
    [
      "(e4v e4v f4v g4v) | (g4v f4v e4v d4v) | c4v' c4v' d4v' e4v' | e4v. d4a d4h",
    ],
  ),
];

// --- Englische Lieder (en-GB, Probe-Schalter ?klangpunkte-sprachen=1) -----------------
// Nur gemeinfreie Melodien UND Texte (vor 1900), die Kinder in England kennen.
// Eigene Transkriptionen einstimmig, ohne Liedtext (es gibt in Klangpunkte keine
// Braille-Liedtexte; die UEB-Tabelle würde dafür nötig, `src/lib/braille/` bleibt
// unberührt). Die internationalen Melodien der deutschen Liste (Beethoven, Mozart,
// Strauss, Grieg, Gospel, Hymne, Greensleeves, Auld Lang Syne, Rising Sun) gelten
// unverändert, mit englischem Titel und englischer Herkunft.
const deLied = (id: string): Song => SONGS.find((x) => x.id === id) as Song;
const enVon = (id: string, title: string, origin: string): Song => ({ ...deLied(id), title, origin });

export const SONGS_EN: Song[] = [
  // ---- Kinder-Regal ----
  song("twinkle", "Twinkle, Twinkle, Little Star", "kinder",
    "Traditional (melody \"Ah! vous dirai-je, maman\", 18th century; words Jane Taylor, 1806) - public domain",
    [4, 4],
    [
      "c4v c4v g4v g4v | a4v a4v g4h | f4v f4v e4v e4v | d4v d4v c4h",
      "g4v g4v f4v f4v | e4v e4v d4h | g4v g4v f4v f4v | e4v e4v d4h",
      "c4v c4v g4v g4v | a4v a4v g4h | f4v f4v e4v e4v | d4v d4v c4h",
    ]),
  song("mary-lamb", "Mary Had a Little Lamb", "kinder",
    "Traditional (words Sarah Josepha Hale, 1830) - public domain",
    [4, 4],
    [
      "e4v d4v c4v d4v | e4v e4v e4h | d4v d4v d4h | e4v g4v g4h",
      "e4v d4v c4v d4v | e4v e4v e4v e4v | d4v d4v e4v d4v | c4g",
    ]),
  song("hot-cross-buns", "Hot Cross Buns", "kinder",
    "Traditional London street cry (18th century) - public domain",
    [4, 4],
    [
      "e4v d4v c4h | e4v d4v c4h",
      "c4a c4a c4a c4a d4a d4a d4a d4a | e4v d4v c4h",
    ]),
  song("london-bridge", "London Bridge Is Falling Down", "kinder",
    "Traditional nursery rhyme (17th century) - public domain",
    [4, 4],
    [
      "g4v. a4a g4v f4v | e4v f4v g4h | d4v e4v f4h | e4v f4v g4h",
      "g4v. a4a g4v f4v | e4v f4v g4h | d4v g4v e4v c4v",
    ]),
  song("are-you-sleeping", "Are You Sleeping?", "kinder",
    "Traditional (French \"Frère Jacques\", 18th century) - can be sung as a round - public domain",
    [4, 4],
    [
      "c4v d4v e4v c4v | c4v d4v e4v c4v",
      "e4v f4v g4h | e4v f4v g4h",
      "g4a a4a g4a f4a e4v c4v | g4a a4a g4a f4a e4v c4v",
      "c4v g3v c4h | c4v g3v c4h",
    ]),
  song("jingle-bells", "Jingle Bells", "kinder",
    "J. Pierpont (1857) - public domain",
    [4, 4],
    [
      "e4v e4v e4h | e4v e4v e4h | e4v g4v c4v. d4a | e4g",
      "f4v f4v f4v. f4a | f4v e4v e4v e4a e4a | e4v d4v d4v e4v | d4h g4h",
    ]),
  // ---- Regal für Erwachsene ----
  enVon("ode", "Ode to Joy (Beethoven)", "L. van Beethoven, Symphony No. 9 (1824), choral theme - the European anthem"),
  enVon("nachtmusik", "Eine kleine Nachtmusik (Mozart)", "W. A. Mozart, K. 525 (1787), 1st movement, main theme (simplified)"),
  enVon("fuer-elise", "Für Elise (Beethoven)", "L. van Beethoven, WoO 59 (1810), opening theme - with the famous D sharp!"),
  enVon("donau", "The Blue Danube (Strauss)", "Johann Strauss II, op. 314 (1867), Waltz No. 1, main theme"),
  enVon("morgenstimmung", "Morning Mood (Grieg)", "E. Grieg, Peer Gynt Suite No. 1, op. 46 (1875), opening theme"),
  enVon("saints", "When the Saints Go Marching In", "Gospel (traditional, USA)"),
  enVon("amazing-grace", "Amazing Grace", "Hymn (traditional, tune New Britain) - completely pentatonic"),
  enVon("greensleeves", "Greensleeves", "England (traditional, 16th century)"),
  enVon("auld-lang-syne", "Auld Lang Syne", "Scotland (traditional, words Robert Burns) - the New Year song"),
  enVon("rising-sun", "House of the Rising Sun", "USA (traditional ballad; the documented folk version, not the 1964 arrangement)"),
  // ---- Ausdruck ----
  { ...deLied("weihnachtsmann"), id: "twinkle-ausdruck", title: "Twinkle, Twinkle - with expression",
    origin: "Traditional (\"Ah! vous dirai-je, maman\", 18th century) - public domain" },
  { ...deLied("haenschen-ausdruck"), id: "mary-ausdruck", title: "Mary Had a Little Lamb - with expression",
    origin: "Traditional - slur and fermata as an expression exercise",
    lines: [
      "(e4v d4v c4v d4v) | (e4v e4v e4h) | d4v d4v d4h | e4v g4v g4h",
      "e4v d4v c4v d4v | e4v e4v e4v e4v | d4v d4v e4v d4v | c4g",
    ].map(parseLine), timeSig: [4, 4] },
  { ...deLied("freude-ausdruck"), title: "Ode to Joy - with expression",
    origin: "L. van Beethoven, Symphony No. 9 (1824), choral theme - legato and staccato in contrast" },
];

// --- Italienische Lieder (it, Probe-Schalter ?klangpunkte-sprachen=1) ---------------------
// Nur gemeinfreie Melodien UND Texte. Einstimmige eigene Transkriptionen, ohne Liedtext.
// Aus dem Gedaechtnis gesetzt, NICHT gegen eine Quelle geprueft (Mutopia/IMSLP): vor dem
// Freischalten hoeren und mit einem Notenbuch abgleichen. Santa Lucia, Funiculi Funicula,
// Il Canto degli Italiani, Giro girotondo, La bella lavanderina sind NICHT gebaut, weil die
// Melodie nicht sicher bekannt war (siehe Bericht).
const itVon = (id: string, title: string, origin: string): Song => ({ ...deLied(id), title, origin });

export const SONGS_IT: Song[] = [
  // ---- Kinder-Regal ----
  song("fra-martino", "Fra Martino Campanaro", "kinder",
    "Tradizionale (variante italiana di \"Frère Jacques\", XVIII secolo) - si può cantare a canone - pubblico dominio",
    [4, 4],
    [
      "c4v d4v e4v c4v | c4v d4v e4v c4v",
      "e4v f4v g4h | e4v f4v g4h",
      "g4a a4a g4a f4a e4v c4v | g4a a4a g4a f4a e4v c4v",
      "c4v g3v c4h | c4v g3v c4h",
    ]),
  song("brilla-stella", "Brilla, brilla, piccola stella", "kinder",
    "Melodia tradizionale \"Ah ! vous dirai-je, maman\" (Francia, stampata nel 1761) - solo melodia, pubblico dominio",
    [4, 4],
    [
      "c4v c4v g4v g4v | a4v a4v g4h | f4v f4v e4v e4v | d4v d4v c4h",
      "g4v g4v f4v f4v | e4v e4v d4h | g4v g4v f4v f4v | e4v e4v d4h",
      "c4v c4v g4v g4v | a4v a4v g4h | f4v f4v e4v e4v | d4v d4v c4h",
    ]),
  song("jingle-bells-it", "Jingle Bells", "kinder",
    "J. Pierpont (1857) - pubblico dominio (melodia originale, senza testo)",
    [4, 4],
    [
      "e4v e4v e4h | e4v e4v e4h | e4v g4v c4v. d4a | e4g",
      "f4v f4v f4v. f4a | f4v e4v e4v e4a e4a | e4v d4v d4v e4v | d4h g4h",
    ]),
  // ---- Regal für Erwachsene ----
  itVon("ode", "Inno alla gioia (Beethoven)", "L. van Beethoven, Nona sinfonia (1824), tema del coro - l'inno europeo"),
  itVon("nachtmusik", "Eine kleine Nachtmusik (Mozart)", "W. A. Mozart, K. 525 (1787), primo movimento, tema principale (semplificato)"),
  itVon("fuer-elise", "Per Elisa (Beethoven)", "L. van Beethoven, WoO 59 (1810), tema iniziale - con il famoso re diesis!"),
  itVon("donau", "Il bel Danubio blu (Strauss)", "Johann Strauss figlio, op. 314 (1867), primo valzer, tema principale"),
  itVon("morgenstimmung", "Il mattino (Grieg)", "E. Grieg, Peer Gynt, Suite n. 1, op. 46 (1875), tema iniziale"),
  itVon("saints", "When the Saints Go Marching In", "Gospel (tradizionale, USA)"),
  itVon("amazing-grace", "Amazing Grace", "Inno (tradizionale, melodia New Britain) - interamente pentatonico"),
  itVon("greensleeves", "Greensleeves", "Inghilterra (tradizionale, XVI secolo)"),
  itVon("auld-lang-syne", "Auld Lang Syne", "Scozia (tradizionale, testo di Robert Burns) - la canzone di Capodanno"),
  itVon("rising-sun", "The House of the Rising Sun", "USA (ballata tradizionale; la versione popolare documentata, non l'arrangiamento del 1964)"),
  // ---- Ausdruck ----
  { ...deLied("weihnachtsmann"), id: "brilla-ausdruck", title: "Brilla, brilla, piccola stella - con espressione",
    origin: "Melodia tradizionale \"Ah ! vous dirai-je, maman\" (1761) - pubblico dominio" },
  { ...deLied("haenschen-ausdruck"), id: "martino-ausdruck", title: "Fra Martino Campanaro - con espressione",
    origin: "Tradizionale - legatura e corona come esercizio d'espressione",
    lines: [
      "(c4v d4v e4v c4v) | (c4v d4v e4v c4v)",
      "e4v f4v g4h | e4v f4v g4h",
      "g4a a4a g4a f4a e4v c4v | g4a a4a g4a f4a e4v c4v",
      "c4v g3v c4h | c4v g3v c4g",
    ].map(parseLine), timeSig: [4, 4] },
  { ...deLied("freude-ausdruck"), title: "Inno alla gioia - con espressione",
    origin: "L. van Beethoven, Nona sinfonia (1824), tema del coro - legato e staccato a contrasto" },
];

// --- Spanische Lieder (es, Spanien; Probe-Schalter ?klangpunkte-sprachen=1) ---------------
// Nur gemeinfreie Melodien UND Texte. Einstimmige eigene Transkriptionen, ohne Liedtext.
// Aus dem Gedaechtnis gesetzt, NICHT gegen eine Quelle geprueft (Mutopia/IMSLP): vor dem
// Freischalten hoeren und mit einem Notenbuch abgleichen. Die spanischen Volkslieder des
// Befunds (Arroz con leche, Debajo de un boton, Los cinco lobitos, El patio de mi casa,
// Estaba la pajara pinta) sind NICHT gebaut, weil die Melodien nicht sicher bekannt waren
// (siehe Bericht); "Los pollitos dicen" und Lorca-Fassungen bewusst nicht.
const esVon = (id: string, title: string, origin: string): Song => ({ ...deLied(id), title, origin });

export const SONGS_ES: Song[] = [
  // ---- Kinder-Regal ----
  song("fray-santiago", "Fray Santiago", "kinder",
    "Tradicional (melodía francesa \"Frère Jacques\", siglo XVIII) - se puede cantar como canon - dominio público",
    [4, 4],
    [
      "c4v d4v e4v c4v | c4v d4v e4v c4v",
      "e4v f4v g4h | e4v f4v g4h",
      "g4a a4a g4a f4a e4v c4v | g4a a4a g4a f4a e4v c4v",
      "c4v g3v c4h | c4v g3v c4h",
    ]),
  song("estrellita", "Estrellita, ¿dónde estás?", "kinder",
    "Melodía tradicional \"Ah ! vous dirai-je, maman\" (Francia, impresa en 1761) - solo la melodía, dominio público",
    [4, 4],
    [
      "c4v c4v g4v g4v | a4v a4v g4h | f4v f4v e4v e4v | d4v d4v c4h",
      "g4v g4v f4v f4v | e4v e4v d4h | g4v g4v f4v f4v | e4v e4v d4h",
      "c4v c4v g4v g4v | a4v a4v g4h | f4v f4v e4v e4v | d4v d4v c4h",
    ]),
  song("cumpleanos-feliz", "Cumpleaños feliz", "kinder",
    "Melodía de \"Good Morning to All\" (Mildred y Patty Hill, 1893; autoras fallecidas en 1916 y 1946) - dominio público; solo la melodía",
    [3, 4],
    [
      "g4a. g4s | a4v g4v c5v | h4h. | g4a. g4s | a4v g4v d5v | c5h.",
      "g4a. g4s | g5v e5v c5v | h4v a4v f5a. f5s | e5v c5v d5v | c5h.",
    ]),
  // ---- Regal für Erwachsene ----
  esVon("ode", "Himno a la alegría (Beethoven)", "L. van Beethoven, Novena sinfonía (1824), tema del coro - el himno europeo"),
  esVon("nachtmusik", "Pequeña serenata nocturna (Mozart)", "W. A. Mozart, K. 525 (1787), primer movimiento, tema principal (simplificado)"),
  esVon("fuer-elise", "Para Elisa (Beethoven)", "L. van Beethoven, WoO 59 (1810), tema inicial - ¡con el famoso re sostenido!"),
  esVon("donau", "El Danubio azul (Strauss)", "Johann Strauss hijo, op. 314 (1867), primer vals, tema principal"),
  esVon("morgenstimmung", "La mañana (Grieg)", "E. Grieg, Peer Gynt, suite n.º 1, op. 46 (1875), tema inicial"),
  esVon("saints", "When the Saints Go Marching In", "Gospel (tradicional, EE. UU.)"),
  esVon("amazing-grace", "Amazing Grace", "Himno (tradicional, melodía New Britain) - totalmente pentatónico"),
  esVon("greensleeves", "Greensleeves", "Inglaterra (tradicional, siglo XVI)"),
  esVon("auld-lang-syne", "Auld Lang Syne", "Escocia (tradicional, texto de Robert Burns) - la canción de Nochevieja"),
  esVon("rising-sun", "La casa del sol naciente", "EE. UU. (balada tradicional; la versión popular documentada, no el arreglo de 1964)"),
  // ---- Ausdruck ----
  { ...deLied("weihnachtsmann"), id: "estrellita-ausdruck", title: "Estrellita, ¿dónde estás? - con expresión",
    origin: "Melodía tradicional \"Ah ! vous dirai-je, maman\" (1761) - dominio público" },
  { ...deLied("haenschen-ausdruck"), id: "fray-santiago-ausdruck", title: "Fray Santiago - con expresión",
    origin: "Tradicional - ligadura de expresión y calderón como ejercicio de expresión",
    lines: [
      "(c4v d4v e4v c4v) | (c4v d4v e4v c4v)",
      "e4v f4v g4h | e4v f4v g4h",
      "g4a a4a g4a f4a e4v c4v | g4a a4a g4a f4a e4v c4v",
      "c4v g3v c4h | c4v g3v c4g",
    ].map(parseLine), timeSig: [4, 4] },
  { ...deLied("freude-ausdruck"), title: "Himno a la alegría - con expresión",
    origin: "L. van Beethoven, Novena sinfonía (1824), tema del coro - legato y staccato en contraste" },
];

// --- Französische Lieder (fr, Probe-Schalter ?klangpunkte-sprachen=1) ----------------------
// Nur gemeinfreie Melodien UND Texte. Eigene einstimmige Transkriptionen, ohne Liedtext.
// Quellen der Melodien: siehe Bericht (Frère Jacques / Ah ! vous dirai-je = Bestand der deutschen
// Liste, Au clair de la lune = Melodienliste von Tastenflow, Sur le pont d'Avignon und Savez-vous
// planter les choux = ABC-Transkriptionen aus Wikibooks bzw. Galouvielle, Cadet Rousselle =
// Druck von 1858 in einer ABC-Abschrift). Die internationalen Melodien der deutschen Liste
// gelten unverändert mit französischem Titel.
const frVon = (id: string, title: string, origin: string): Song => ({ ...deLied(id), title, origin });

export const SONGS_FR: Song[] = [
  // ---- Kinder-Regal ----
  song("frere-jacques", "Frère Jacques", "kinder",
    "Traditionnel (France, XVIIIe siècle) - se chante en canon - domaine public",
    [4, 4],
    [
      "c4v d4v e4v c4v | c4v d4v e4v c4v",
      "e4v f4v g4h | e4v f4v g4h",
      "g4a a4a g4a f4a e4v c4v | g4a a4a g4a f4a e4v c4v",
      "c4v g3v c4h | c4v g3v c4h",
    ]),
  song("ah-vous-dirai-je", "Ah ! vous dirai-je, maman", "kinder",
    "Traditionnel (air imprimé en 1761, XVIIIe siècle) - domaine public",
    [4, 4],
    [
      "c4v c4v g4v g4v | a4v a4v g4h | f4v f4v e4v e4v | d4v d4v c4h",
      "g4v g4v f4v f4v | e4v e4v d4h | g4v g4v f4v f4v | e4v e4v d4h",
      "c4v c4v g4v g4v | a4v a4v g4h | f4v f4v e4v e4v | d4v d4v c4h",
    ]),
  song("au-clair-de-la-lune", "Au clair de la lune", "kinder",
    "Traditionnel (France, XVIIIe siècle, auteur inconnu) - domaine public",
    [4, 4],
    [
      "c4v c4v c4v d4v | e4h d4h | c4v e4v d4v d4v | c4g",
      "c4v c4v c4v d4v | e4h d4h | c4v e4v d4v d4v | c4g",
      "d4v d4v d4v d4v | a3h a3h | d4v c4v h3v a3v | g3g",
      "c4v c4v c4v d4v | e4h d4h | c4v e4v d4v d4v | c4g",
    ]),
  song("sur-le-pont-davignon", "Sur le pont d'Avignon", "kinder",
    "Traditionnel (France, XVe-XVIe siècle) - version populaire, domaine public",
    [4, 4],
    [
      "c4v c4v c4h | d4v d4v d4h | e4v f4v g4v c4v | h3v c4v d4v g3v",
      "c4v c4v c4h | d4v d4v d4h | e4v f4v g4v c4v | d4v h3v c4h",
    ]),
  song("savez-vous-planter-les-choux", "Savez-vous planter les choux", "kinder",
    "Traditionnel (France, ronde) - domaine public",
    [4, 4],
    [
      "g3a g3a e4a e4a d4a e4a c4v | h3a c4a d4a d4a c4a d4a e4a c4a",
      "g3a g3a e4a e4a d4a e4a c4v | h3a c4a d4a f4a e4a d4a c4v",
    ]),
  song("cadet-rousselle", "Cadet Rousselle", "kinder",
    "Chanson populaire (France, fin du XVIIIe siècle ; mélodie d'après un recueil de 1858) - domaine public",
    [6, 8],
    [
      "g3a a3a h3a | c4v c4a c4v e4a | c4v. d4a d4a d4a | d4v c4a h3v a3a",
      "g3v. g3a a3a h3a | c4v c4a c4v e4a | c4v. d4a d4a d4a | d4v c4a h3v a3a",
      "g3v. d4a d4a d4a | d4v e4a f4v e4a | e4v d4a d4a d4a d4a | d4v e4a f4v e4a",
      "e4v d4a c4v. | c4v. c4a h3a a3a | g3v. c4a h3a c4a | d4v d4a c4v h3a | c4h.",
    ]),
  // ---- Regal für Erwachsene ----
  frVon("ode", "Ode à la joie (Beethoven)", "L. van Beethoven, 9e symphonie (1824), thème du chœur - l'hymne européen"),
  frVon("nachtmusik", "Petite musique de nuit (Mozart)", "W. A. Mozart, K. 525 (1787), 1er mouvement, thème principal (simplifié)"),
  frVon("fuer-elise", "Pour Élise (Beethoven)", "L. van Beethoven, WoO 59 (1810), thème initial - avec le célèbre ré dièse !"),
  frVon("donau", "Le Beau Danube bleu (Strauss)", "Johann Strauss fils, op. 314 (1867), valse no 1, thème principal"),
  frVon("morgenstimmung", "Le Matin (Grieg)", "E. Grieg, Peer Gynt, suite no 1, op. 46 (1875), thème initial"),
  frVon("saints", "When the Saints Go Marching In", "Gospel (traditionnel, États-Unis)"),
  frVon("amazing-grace", "Amazing Grace", "Hymne (traditionnel, mélodie New Britain) - entièrement pentatonique"),
  frVon("greensleeves", "Greensleeves", "Angleterre (traditionnel, XVIe siècle)"),
  frVon("auld-lang-syne", "Auld Lang Syne", "Écosse (traditionnel, texte de Robert Burns) - la chanson du Nouvel An"),
  frVon("rising-sun", "The House of the Rising Sun", "États-Unis (ballade traditionnelle ; la version populaire documentée, pas l'arrangement de 1964)"),
  // ---- Ausdruck ----
  { ...deLied("weihnachtsmann"), id: "ah-vous-dirai-je-ausdruck", title: "Ah ! vous dirai-je, maman - avec expression",
    origin: "Traditionnel (air imprimé en 1761) - domaine public" },
  { ...deLied("haenschen-ausdruck"), id: "au-clair-ausdruck", title: "Au clair de la lune - avec expression",
    origin: "Traditionnel - liaison et staccato comme exercice d'interprétation",
    lines: [
      "(c4v c4v c4v d4v) | e4h d4h | c4v' e4v' d4v' d4v' | c4g",
      "c4v c4v c4v d4v | (e4h d4h) | c4v e4v d4v d4v | c4g",
    ].map(parseLine), timeSig: [4, 4] },
  { ...deLied("freude-ausdruck"), title: "Ode à la joie - avec expression",
    origin: "L. van Beethoven, 9e symphonie (1824), thème du chœur - legato et staccato en contraste" },
];

// --- Niederländische Lieder (nl, Probe-Schalter ?klangpunkte-sprachen=1) ---------------
// Nur Melodien, die sicher bekannt und gemeinfrei sind; ohne Liedtext. Die internationalen
// Melodien der deutschen Liste gelten unverändert, mit niederländischem Titel.
// „Vader Jacob" (Frère-Jacques-Melodie) und „Glinster, glinster, kleine ster" (Ah-vous-
// dirai-je-Melodie) übernehmen die schon gesetzten Noten. Weggelassen: alle anderen
// niederländischen Kinderlieder, deren Melodie nicht sicher gegengeprüft ist.
const nlVon = (id: string, title: string, origin: string): Song => ({ ...deLied(id), title, origin });
const melodieAusEn = (id: string): Song => SONGS_EN.find((x) => x.id === id) as Song;

export const SONGS_NL: Song[] = [
  // ---- Kinder-Regal ----
  { ...deLied("bruder-jakob"), title: "Vader Jacob",
    origin: "Volkslied (trad., Frère Jacques) - als canon te zingen - publiek domein" },
  { ...melodieAusEn("twinkle"), id: "twinkle-nl", title: "Glinster, glinster, kleine ster",
    origin: "Traditioneel (melodie „Ah! vous dirai-je, maman“, 18e eeuw; tekst Jane Taylor, 1806) - publiek domein" },
  // ---- Regal voor volwassenen ----
  nlVon("ode", "Ode aan de vreugde (Beethoven)", "L. van Beethoven, 9e symfonie (1824), koorthema - het Europese volkslied"),
  nlVon("nachtmusik", "Kleine nachtmuziek (Mozart)", "W. A. Mozart, K. 525 (1787), 1e deel, hoofdthema (vereenvoudigd)"),
  nlVon("fuer-elise", "Für Elise (Beethoven)", "L. van Beethoven, WoO 59 (1810), openingsthema - met het bekende dis!"),
  nlVon("donau", "De blauwe Donau (Strauss)", "Johann Strauss zoon, op. 314 (1867), wals nr. 1, hoofdthema"),
  nlVon("morgenstimmung", "Morgenstemming (Grieg)", "E. Grieg, Peer Gynt-suite nr. 1, op. 46 (1875), openingsthema"),
  nlVon("saints", "Als de heiligen binnenmarcheren", "Gospel (traditioneel, Verenigde Staten)"),
  nlVon("amazing-grace", "Amazing Grace", "Hymne (traditioneel, melodie New Britain) - volledig pentatonisch"),
  nlVon("greensleeves", "Greensleeves", "Engeland (traditioneel, 16e eeuw)"),
  nlVon("auld-lang-syne", "Auld Lang Syne", "Schotland (traditioneel, tekst Robert Burns) - het nieuwjaarslied"),
  nlVon("rising-sun", "Het huis van de rijzende zon", "Verenigde Staten (traditionele ballade; de gedocumenteerde volksversie, niet het arrangement van 1964)"),
  // ---- Expressie ----
  { ...deLied("freude-ausdruck"), title: "Ode aan de vreugde - met expressie",
    origin: "L. van Beethoven, 9e symfonie (1824), koorthema - legato en staccato in contrast" },
];

// --- Zweedse Lieder (sv, Probe-Schalter ?klangpunkte-sprachen=1) ----------------------
// Gleiche Regeln wie bei nl: nur sichere, gemeinfreie Melodien, ohne Liedtext.
// „Broder Jakob" (Frère-Jacques-Melodie) und „Blinka lilla stjärna" (Ah-vous-dirai-je-
// Melodie) übernehmen die gesetzten Noten.
const svVon = (id: string, title: string, origin: string): Song => ({ ...deLied(id), title, origin });

export const SONGS_SV: Song[] = [
  // ---- Barnvisor-Regal ----
  { ...deLied("bruder-jakob"), title: "Broder Jakob",
    origin: "Folkvisa (trad., Frère Jacques) - kan sjungas som kanon - allmän egendom" },
  { ...melodieAusEn("twinkle"), id: "twinkle-sv", title: "Blinka lilla stjärna",
    origin: "Traditionell (melodin „Ah! vous dirai-je, maman“, 1700-talet; text Jane Taylor, 1806) - allmän egendom" },
  // ---- Regal för vuxna ----
  svVon("ode", "Ode till glädjen (Beethoven)", "L. van Beethoven, 9:e symfonin (1824), körtemat - Europas hymn"),
  svVon("nachtmusik", "Eine kleine Nachtmusik (Mozart)", "W. A. Mozart, K. 525 (1787), 1:a satsen, huvudtema (förenklat)"),
  svVon("fuer-elise", "Für Elise (Beethoven)", "L. van Beethoven, WoO 59 (1810), inledningstema - med det berömda dis!"),
  svVon("donau", "Den blå Donau (Strauss)", "Johann Strauss d.y., op. 314 (1867), vals nr 1, huvudtema"),
  svVon("morgenstimmung", "Morgonstämning (Grieg)", "E. Grieg, Peer Gynt-svit nr 1, op. 46 (1875), inledningstema"),
  svVon("saints", "När de heliga marscherar in", "Gospel (traditionell, USA)"),
  svVon("amazing-grace", "Amazing Grace", "Psalm (traditionell, melodin New Britain) - helt pentatonisk"),
  svVon("greensleeves", "Greensleeves", "England (traditionell, 1500-talet)"),
  svVon("auld-lang-syne", "Auld Lang Syne", "Skottland (traditionell, text Robert Burns) - nyårssången"),
  svVon("rising-sun", "Soluppgångens hus", "USA (traditionell ballad; den dokumenterade folkversionen, inte arrangemanget från 1964)"),
  // ---- Uttryck ----
  { ...deLied("freude-ausdruck"), title: "Ode till glädjen - med uttryck",
    origin: "L. van Beethoven, 9:e symfonin (1824), körtemat - legato och staccato i kontrast" },
];

// --- Polnische Lieder (pl, Probe-Schalter ?klangpunkte-sprachen=1) --------------------
// Gleiche Regeln wie bei nl/sv: nur sichere, gemeinfreie Melodien, ohne Liedtext.
// „Panie Janie" (Frère-Jacques-Melodie) und „Mrugaj, mrugaj, mała gwiazdko" (Ah-vous-
// dirai-je-Melodie) übernehmen die gesetzten Noten. Weggelassen: polnische Kinderlieder,
// deren Melodie nicht sicher gegengeprüft ist („Wlazł kotek na płotek", „Sto lat" u. a.).
const plVon = (id: string, title: string, origin: string): Song => ({ ...deLied(id), title, origin });

export const SONGS_PL: Song[] = [
  // ---- Półka z piosenkami dla dzieci ----
  { ...deLied("bruder-jakob"), title: "Panie Janie",
    origin: "Piosenka ludowa (trad., Frère Jacques) - można śpiewać jako kanon - domena publiczna" },
  { ...melodieAusEn("twinkle"), id: "twinkle-pl", title: "Mrugaj, mrugaj, mała gwiazdko",
    origin: "Tradycyjna (melodia „Ah! vous dirai-je, maman”, XVIII wiek; angielskie słowa Jane Taylor, 1806) - domena publiczna" },
  // ---- Półka dla dorosłych ----
  plVon("ode", "Oda do radości (Beethoven)", "L. van Beethoven, IX Symfonia (1824), temat chóru - hymn Europy"),
  plVon("nachtmusik", "Mała muzyka nocna (Mozart)", "W. A. Mozart, KV 525 (1787), część 1, temat główny (uproszczony)"),
  plVon("fuer-elise", "Dla Elizy (Beethoven)", "L. van Beethoven, WoO 59 (1810), temat początkowy - ze słynnym dis!"),
  plVon("donau", "Nad pięknym modrym Dunajem (Strauss)", "Johann Strauss syn, op. 314 (1867), walc nr 1, temat główny"),
  plVon("morgenstimmung", "Poranek (Grieg)", "E. Grieg, suita „Peer Gynt” nr 1, op. 46 (1875), temat początkowy"),
  plVon("saints", "Gdy święci maszerują", "Gospel (melodia tradycyjna, USA)"),
  plVon("amazing-grace", "Amazing Grace", "Hymn (melodia tradycyjna New Britain) - w pełni pentatoniczny"),
  plVon("greensleeves", "Greensleeves", "Anglia (melodia tradycyjna, XVI wiek)"),
  plVon("auld-lang-syne", "Auld Lang Syne", "Szkocja (melodia tradycyjna, słowa Robert Burns) - pieśń noworoczna"),
  plVon("rising-sun", "Dom wschodzącego słońca", "USA (ballada tradycyjna; udokumentowana wersja ludowa, nie aranżacja z 1964 roku)"),
  // ---- Ekspresja ----
  { ...deLied("freude-ausdruck"), title: "Oda do radości - z wyrazem",
    origin: "L. van Beethoven, IX Symfonia (1824), temat chóru - legato i staccato w kontraście" },
];

// --- Tschechische Lieder (cs, Probe-Schalter ?klangpunkte-sprachen=1) -----------------
// Gleiche Regeln wie bei nl/sv/pl: nur sichere, gemeinfreie Melodien, ohne Liedtext.
// „Bratře Kubo" (Frère-Jacques-Melodie) und „Hvězdičko, blikej" (Ah-vous-dirai-je-Melodie,
// Titel unsicher) übernehmen die gesetzten Noten. Weggelassen: tschechische Kinderlieder,
// deren Melodie nicht sicher gegengeprüft ist („Skákal pes", „Pec nám spadla", „Kočka leze
// dírou", „Prší, prší", „Holka modrooká" u. a.).
const csVon = (id: string, title: string, origin: string): Song => ({ ...deLied(id), title, origin });

export const SONGS_CS: Song[] = [
  // ---- Police s dětskými písničkami ----
  { ...deLied("bruder-jakob"), title: "Bratře Kubo",
    origin: "Lidová píseň (tradiční, Frère Jacques) - dá se zpívat jako kánon - volné dílo" },
  { ...melodieAusEn("twinkle"), id: "twinkle-cs", title: "Hvězdičko, blikej",
    origin: "Tradiční (melodie „Ah! vous dirai-je, maman“, 18. století; anglický text Jane Taylor, 1806) - volné dílo" },
  // ---- Police pro dospělé ----
  csVon("ode", "Óda na radost (Beethoven)", "L. van Beethoven, 9. symfonie (1824), téma sboru - hymna Evropy"),
  csVon("nachtmusik", "Malá noční hudba (Mozart)", "W. A. Mozart, KV 525 (1787), 1. věta, hlavní téma (zjednodušené)"),
  csVon("fuer-elise", "Pro Elišku (Beethoven)", "L. van Beethoven, WoO 59 (1810), úvodní téma - se slavným dis!"),
  csVon("donau", "Na krásném modrém Dunaji (Strauss)", "Johann Strauss mladší, op. 314 (1867), valčík č. 1, hlavní téma"),
  csVon("morgenstimmung", "Ranní nálada (Grieg)", "E. Grieg, suita Peer Gynt č. 1, op. 46 (1875), úvodní téma"),
  csVon("saints", "Když svatí pochodují", "Gospel (tradiční melodie, USA)"),
  csVon("amazing-grace", "Amazing Grace", "Hymnus (tradiční melodie New Britain) - celá pentatonická"),
  csVon("greensleeves", "Greensleeves", "Anglie (tradiční melodie, 16. století)"),
  csVon("auld-lang-syne", "Auld Lang Syne", "Skotsko (tradiční melodie, text Robert Burns) - novoroční píseň"),
  csVon("rising-sun", "Dům u vycházejícího slunce", "USA (tradiční balada; doložená lidová verze, ne aranžmá z roku 1964)"),
  // ---- Výraz ----
  { ...deLied("freude-ausdruck"), title: "Óda na radost - s výrazem",
    origin: "L. van Beethoven, 9. symfonie (1824), téma sboru - legato a staccato v kontrastu" },
];

// --- Ungarische Lieder (hu, Probe-Schalter ?klangpunkte-sprachen=1) ------------------
// Gleiche Regeln wie bei cs/pl: nur sichere, gemeinfreie Melodien, ohne Liedtext.
// „János bácsi" (Frère-Jacques-Melodie) übernimmt die gesetzten Noten. Weggelassen: die
// Ah-vous-dirai-je-Melodie (ungarischer Titel nicht sicher) und ungarische Kinderlieder, deren
// Melodie nicht sicher gegengeprüft ist („Boci, boci tarka", „Lánc, lánc, eszterlánc",
// „Hull a pelyhes fehér hó", „Süss fel nap" u. a.). NICHT gegengehört.
const huVon = (id: string, title: string, origin: string): Song => ({ ...deLied(id), title, origin });

export const SONGS_HU: Song[] = [
  // ---- Gyerekdalok polca ----
  { ...deLied("bruder-jakob"), title: "János bácsi",
    origin: "Hagyományos (Franciaország, 18. század; Frère Jacques) - kánonban is énekelhető - közkincs" },
  // ---- Felnőttek polca ----
  huVon("ode", "Örömóda (Beethoven)", "L. van Beethoven, IX. szimfónia (1824), a kórus témája - Európa himnusza"),
  huVon("nachtmusik", "Kis éji zene (Mozart)", "W. A. Mozart, K. 525 (1787), első tétel, főtéma (egyszerűsítve)"),
  huVon("fuer-elise", "Für Elise (Beethoven)", "L. van Beethoven, WoO 59 (1810), nyitótéma - a híres disz hanggal!"),
  huVon("donau", "A szép kék Duna (Strauss)", "ifj. Johann Strauss, op. 314 (1867), első keringő, főtéma"),
  huVon("morgenstimmung", "Reggeli hangulat (Grieg)", "E. Grieg, Peer Gynt, 1. szvit, op. 46 (1875), nyitótéma"),
  huVon("saints", "Amikor a szentek bevonulnak", "Gospel (hagyományos dallam, USA)"),
  huVon("amazing-grace", "Amazing Grace", "Himnusz (hagyományos dallam: New Britain) - teljesen pentaton"),
  huVon("greensleeves", "Greensleeves", "Anglia (hagyományos dallam, 16. század)"),
  huVon("auld-lang-syne", "Auld Lang Syne", "Skócia (hagyományos dallam, szöveg: Robert Burns) - újévi dal"),
  huVon("rising-sun", "A felkelő nap háza", "USA (hagyományos ballada; a dokumentált népi változat, nem az 1964-es feldolgozás)"),
  // ---- Kifejezés ----
  { ...deLied("freude-ausdruck"), title: "Örömóda - kifejezéssel",
    origin: "L. van Beethoven, IX. szimfónia (1824), a kórus témája - legato és staccato ellentétben" },
];

// --- Portugiesische Lieder (pt, Portugal) ---------------------------------------------
// Nur gemeinfreie Melodien, eigene einstimmige Transkriptionen, ohne Liedtext. Melodien der
// deutschen Liste übernommen (Frère Jacques = „bruder-jakob“, Ah! vous dirai-je = „weihnachtsmann“),
// Geburtstagslied nur die Melodie von 1893 (Hill). Aus dem Gedächtnis / aus der Vorlage übertragen,
// NICHT gegengehört: vor dem Einschalten hören und mit einem Notenbuch abgleichen.
const ptVon = (id: string, title: string, origin: string): Song => ({ ...deLied(id), title, origin });

export const SONGS_PT: Song[] = [
  // ---- Kinder-Regal ----
  song("frei-martinho", "Frei Martinho", "kinder",
    "Tradicional (França, século XVIII; em Portugal „Frei Martinho“) - pode cantar-se em cânone - domínio público",
    [4, 4],
    [
      "c4v d4v e4v c4v | c4v d4v e4v c4v",
      "e4v f4v g4h | e4v f4v g4h",
      "g4a a4a g4a f4a e4v c4v | g4a a4a g4a f4a e4v c4v",
      "c4v g3v c4h | c4v g3v c4h",
    ]),
  song("brilha-estrelinha", "Brilha, brilha, estrelinha", "kinder",
    "Melodia tradicional „Ah! vous dirai-je, maman“ (França, impressa em 1761) - domínio público; só a melodia",
    [4, 4],
    [
      "c4v c4v g4v g4v | a4v a4v g4h | f4v f4v e4v e4v | d4v d4v c4h",
      "g4v g4v f4v f4v | e4v e4v d4h | g4v g4v f4v f4v | e4v e4v d4h",
      "c4v c4v g4v g4v | a4v a4v g4h | f4v f4v e4v e4v | d4v d4v c4h",
    ]),
  song("parabens-ti", "Parabéns a ti", "kinder",
    "Melodia de „Good Morning to All“ (Mildred e Patty Hill, 1893; autoras falecidas em 1916 e 1946) - domínio público; só a melodia",
    [3, 4],
    [
      "g4a. g4s | a4v g4v c5v | h4h. | g4a. g4s | a4v g4v d5v | c5h.",
      "g4a. g4s | g5v e5v c5v | h4v a4v f5a. f5s | e5v c5v d5v | c5h.",
    ]),
  // ---- Regal für Erwachsene ----
  ptVon("ode", "Hino à alegria (Beethoven)", "L. van Beethoven, Nona Sinfonia (1824), tema do coro - o hino europeu"),
  ptVon("nachtmusik", "Pequena serenata noturna (Mozart)", "W. A. Mozart, K. 525 (1787), primeiro andamento, tema principal (simplificado)"),
  ptVon("fuer-elise", "Para Elise (Beethoven)", "L. van Beethoven, WoO 59 (1810), tema inicial - com o famoso ré sustenido!"),
  ptVon("donau", "O Danúbio azul (Strauss)", "Johann Strauss filho, op. 314 (1867), primeira valsa, tema principal"),
  ptVon("morgenstimmung", "A manhã (Grieg)", "E. Grieg, Peer Gynt, suite n.º 1, op. 46 (1875), tema inicial"),
  ptVon("saints", "Quando os santos marcharem", "Gospel (tradicional, EUA; título português)"),
  ptVon("amazing-grace", "Amazing Grace", "Hino (tradicional, melodia New Britain) - totalmente pentatónico"),
  ptVon("greensleeves", "Greensleeves", "Inglaterra (tradicional, século XVI)"),
  ptVon("auld-lang-syne", "Auld Lang Syne", "Escócia (tradicional, texto de Robert Burns) - a canção de Ano Novo"),
  ptVon("rising-sun", "A casa do sol nascente", "EUA (balada tradicional; a versão popular documentada, não o arranjo de 1964)"),
  // ---- Ausdruck ----
  { ...deLied("weihnachtsmann"), id: "brilha-estrelinha-ausdruck", title: "Brilha, brilha, estrelinha - com expressão",
    origin: "Melodia tradicional „Ah! vous dirai-je, maman“ (1761) - domínio público" },
  { ...deLied("bruder-jakob"), id: "frei-martinho-ausdruck", title: "Frei Martinho - com expressão",
    origin: "Tradicional - ligadura de expressão e fermata como exercício de expressão",
    lines: [
      "(c4v d4v e4v c4v) | (c4v d4v e4v c4v)",
      "e4v f4v g4h | e4v f4v g4h",
      "g4a a4a g4a f4a e4v c4v | g4a a4a g4a f4a e4v c4v",
      "c4v g3v c4h | c4v g3v c4g",
    ].map(parseLine), timeSig: [4, 4] },
  { ...deLied("freude-ausdruck"), title: "Hino à alegria - com expressão",
    origin: "L. van Beethoven, Nona Sinfonia (1824), tema do coro - legato e staccato em contraste" },
];

// --- Brasilianische Lieder (br, Brasilien) ----------------------------------------------
// Wie pt, mit brasilianischen Titeln (Anrede „você“, Titel wie im Gebrauch in Brasilien). Unsicher:
// der Titel „Irmão João“ (Frère Jacques in Brasilien) - im Bericht.
const brVon = (id: string, title: string, origin: string): Song => ({ ...deLied(id), title, origin });

export const SONGS_BR: Song[] = [
  // ---- Kinder-Regal ----
  song("irmao-joao", "Irmão João", "kinder",
    "Tradicional (França, século XVIII; no Brasil „Irmão João“) - pode cantar-se em cânone - domínio público",
    [4, 4],
    [
      "c4v d4v e4v c4v | c4v d4v e4v c4v",
      "e4v f4v g4h | e4v f4v g4h",
      "g4a a4a g4a f4a e4v c4v | g4a a4a g4a f4a e4v c4v",
      "c4v g3v c4h | c4v g3v c4h",
    ]),
  song("brilha-estrelinha", "Brilha, brilha, estrelinha", "kinder",
    "Melodia tradicional „Ah! vous dirai-je, maman“ (França, impressa em 1761) - domínio público; só a melodia",
    [4, 4],
    [
      "c4v c4v g4v g4v | a4v a4v g4h | f4v f4v e4v e4v | d4v d4v c4h",
      "g4v g4v f4v f4v | e4v e4v d4h | g4v g4v f4v f4v | e4v e4v d4h",
      "c4v c4v g4v g4v | a4v a4v g4h | f4v f4v e4v e4v | d4v d4v c4h",
    ]),
  song("parabens-voce", "Parabéns a você", "kinder",
    "Melodia de „Good Morning to All“ (Mildred e Patty Hill, 1893; autoras falecidas em 1916 e 1946) - domínio público; só a melodia",
    [3, 4],
    [
      "g4a. g4s | a4v g4v c5v | h4h. | g4a. g4s | a4v g4v d5v | c5h.",
      "g4a. g4s | g5v e5v c5v | h4v a4v f5a. f5s | e5v c5v d5v | c5h.",
    ]),
  // ---- Regal für Erwachsene ----
  brVon("ode", "Hino à Alegria (Beethoven)", "L. van Beethoven, Nona Sinfonia (1824), tema do coro - o hino europeu"),
  brVon("nachtmusik", "Pequena serenata noturna (Mozart)", "W. A. Mozart, K. 525 (1787), primeiro movimento, tema principal (simplificado)"),
  brVon("fuer-elise", "Für Elise (Beethoven)", "L. van Beethoven, WoO 59 (1810), tema inicial - com o famoso ré sustenido!"),
  brVon("donau", "O Danúbio Azul (Strauss)", "Johann Strauss filho, op. 314 (1867), primeira valsa, tema principal"),
  brVon("morgenstimmung", "A manhã (Grieg)", "E. Grieg, Peer Gynt, suíte n.º 1, op. 46 (1875), tema inicial"),
  brVon("saints", "Quando os santos marcharem", "Gospel (tradicional, EUA; título em português)"),
  brVon("amazing-grace", "Amazing Grace", "Hino (tradicional, melodia New Britain) - totalmente pentatônico"),
  brVon("greensleeves", "Greensleeves", "Inglaterra (tradicional, século XVI)"),
  brVon("auld-lang-syne", "Auld Lang Syne", "Escócia (tradicional, texto de Robert Burns) - a canção do Réveillon"),
  brVon("rising-sun", "A Casa do Sol Nascente", "EUA (balada tradicional; a versão popular documentada, não o arranjo de 1964)"),
  // ---- Ausdruck ----
  { ...deLied("weihnachtsmann"), id: "brilha-estrelinha-ausdruck", title: "Brilha, brilha, estrelinha - com expressão",
    origin: "Melodia tradicional „Ah! vous dirai-je, maman“ (1761) - domínio público" },
  { ...deLied("bruder-jakob"), id: "irmao-joao-ausdruck", title: "Irmão João - com expressão",
    origin: "Tradicional - ligadura de expressão e fermata como exercício de expressão",
    lines: [
      "(c4v d4v e4v c4v) | (c4v d4v e4v c4v)",
      "e4v f4v g4h | e4v f4v g4h",
      "g4a a4a g4a f4a e4v c4v | g4a a4a g4a f4a e4v c4v",
      "c4v g3v c4h | c4v g3v c4g",
    ].map(parseLine), timeSig: [4, 4] },
  { ...deLied("freude-ausdruck"), title: "Hino à Alegria - com expressão",
    origin: "L. van Beethoven, Nona Sinfonia (1824), tema do coro - legato e staccato em contraste" },
];

/** Die Lieder der aktuellen Sprache (Deutsch: die 21 deutschen, wie bisher). */
export function aktuelleSongs(): Song[] {
  const s = klangSprache();
  if (s === "de") return SONGS;
  if (s === "fr") return SONGS_FR;
  if (s === "es") return SONGS_ES;
  if (s === "it") return SONGS_IT;
  if (s === "pt") return SONGS_PT;
  if (s === "br") return SONGS_BR;
  if (s === "nl") return SONGS_NL;
  if (s === "sv") return SONGS_SV;
  if (s === "pl") return SONGS_PL;
  if (s === "cs") return SONGS_CS;
  if (s === "hu") return SONGS_HU;
  return SONGS_EN;
}

/** Lieder eines Regals. */
export function songsForShelf(shelf: Song["shelf"]): Song[] {
  return aktuelleSongs().filter((s) => s.shelf === shelf);
}

export function songById(id: string): Song | undefined {
  return aktuelleSongs().find((s) => s.id === id);
}
