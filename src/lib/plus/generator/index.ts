/**
 * Plus - der Aufgabengenerator.
 *
 * Eine Aufgabe entsteht in zwei Schritten: die Bauart liefert den Kern (was
 * gerechnet wird), die Form gibt ihm Gestalt (wie gefragt wird). Beides ist
 * im Stoffplan festgelegt.
 *
 * Der Zufall hat eine Saat. Derselbe Lauf lässt sich damit wiederherstellen -
 * für die Tests, und für ein Kind, das einen Lauf fortsetzt.
 */
import { zufall, type Aufgabe, type Aufgabenart } from "../aufgabe";
import { plusSprache } from "../aktuelleSprache";
import { aufgabeFuerSprache } from "../sprachfilter";
import { messeMitRohplan, paket, PAKETE, setzePaketErlaubnis } from "../stoffplan";
import type { Bauauftrag } from "./zuordnung";
import { formeAufgabe, GEBAUTE_FORMEN, NochNichtGebaut } from "./formen";
import { ZUORDNUNG } from "./zuordnung";
import { ZUORDNUNG_STUFE3 } from "./zuordnung-stufe3";
import { ZUORDNUNG_STUFE4 } from "./zuordnung-stufe4";
import { ZUORDNUNG_STUFE5 } from "./zuordnung-stufe5";
import { ZUORDNUNG_STUFE6 } from "./zuordnung-stufe6";
import { ZUORDNUNG_STUFE7 } from "./zuordnung-stufe7";
import { ZUORDNUNG_STUFE8 } from "./zuordnung-stufe8";

export { NochNichtGebaut, GEBAUTE_FORMEN } from "./formen";
export { ZUORDNUNG } from "./zuordnung";

/**
 * Alle Bauarten aller acht Stufen - 161 Pakete.
 *
 * Jede Stufe liegt in einer eigenen Datei, weil sie von einem eigenen Agenten
 * gebaut wurde und sich so nichts überschreiben konnte. Hier laufen sie
 * zusammen; ab hier kennt die App nur noch eine Liste.
 */
export const ALLE_BAUARTEN: Record<string, Bauauftrag> = {
  ...ZUORDNUNG, ...ZUORDNUNG_STUFE3, ...ZUORDNUNG_STUFE4, ...ZUORDNUNG_STUFE5,
  ...ZUORDNUNG_STUFE6, ...ZUORDNUNG_STUFE7, ...ZUORDNUNG_STUFE8,
};

/**
 * ★ Formen, die höchstens EINMAL je Runde kommen - und nur halb so oft gewählt
 * werden wie die übrigen. Johannes, 26.09.2026: „Rechendreiecke seltener"
 * (in einer Probe-Runde der 1. Stufe waren es drei von acht).
 */
export const SELTENE_FORMEN: readonly Aufgabenart[] = ["dreieck"];

/** Pakete, für die noch keine Bauart hinterlegt ist. Soll leer bleiben. */
export function fehlendeBauarten(alleIds: readonly string[] = PAKETE.map((p) => p.id)): string[] {
  return alleIds.filter((id) => !ALLE_BAUARTEN[id]);
}

/**
 * Eine Aufgabe aus einem Paket, in irgendeiner Form, die es hergibt.
 *
 * Für den Coach: der stellt einen Lauf aus mehreren Paketen zusammen und
 * braucht je Paket genau eine Aufgabe - welche Form, ist ihm gleich, solange
 * es nicht immer dieselbe ist.
 */
export function erzeugeEine(paketId: string, rng: () => number): Aufgabe {
  const arten = paket(paketId).arten.filter((a) => GEBAUTE_FORMEN.includes(a));
  if (!arten.length) throw new NochNichtGebaut(paketId, paket(paketId).arten[0]);
  // Die Leitform öfter als die übrigen - aber nicht immer.
  const reihe = [arten[0], ...arten];
  for (let i = 0; i < reihe.length * 3; i++) {
    const art = reihe[Math.floor(rng() * reihe.length)];
    try { return erzeugeAufgabe(paketId, art, rng); } catch { /* die nächste Form */ }
  }
  return erzeugeAufgabe(paketId, arten[0], rng);
}

/**
 * Die Gestalt einer Aufgabe - ihre Zahlen weggedacht.
 *
 * ★ Damit erkennt Plus, dass „Welche Zahl kommt vor 13?" und „Welche Zahl
 * kommt vor 5?" dieselbe Frage sind. Ohne diesen Blick käme im Training
 * viermal hintereinander dieselbe Frage mit anderen Zahlen - genau die
 * Eintönigkeit, die Plus vermeiden soll.
 */
export function gestalt(angabe: string): string {
  return angabe.replace(/\d+/g, "N");
}

/**
 * Einen Lauf aus einem fertigen Plan bauen - je Paket eine Aufgabe.
 *
 * Der Coach sagt, WELCHE Pakete drankommen; hier wird dafür gesorgt, dass
 * nicht zweimal hintereinander dieselbe Frage steht.
 */
export function erzeugeFolge(plan: readonly string[], rng: () => number): Aufgabe[] {
  const aufgaben: Aufgabe[] = [];
  let vorige = "";
  // Eine seltene Form, die in dieser Runde schon dran war, kommt nicht wieder.
  const schonDa = (a: Aufgabe) => SELTENE_FORMEN.includes(a.art) && aufgaben.some((x) => x.art === a.art);
  for (const id of plan) {
    let gewaehlt: Aufgabe | null = null;
    for (let versuch = 0; versuch < 8; versuch++) {
      let a: Aufgabe;
      try { a = erzeugeEine(id, rng); } catch { break; }
      if (schonDa(a) || (SELTENE_FORMEN.includes(a.art) && rng() < 0.5)) {
        // ★ Nur, wenn es noch Versuche gibt - sonst lieber die seltene Form
        // als gar keine Aufgabe. Ganz ausgeschlossen wird sie mit der Leitform.
        if (versuch < 7) continue;
        const leit = paket(id).arten.find((x) => GEBAUTE_FORMEN.includes(x) && !SELTENE_FORMEN.includes(x));
        if (leit) { try { a = erzeugeAufgabe(id, leit, rng); } catch { /* dann bleibt sie */ } }
      }
      gewaehlt = a;
      if (gestalt(a.angabe) !== vorige) break;
    }
    if (!gewaehlt) continue;
    vorige = gestalt(gewaehlt.angabe);
    aufgaben.push(gewaehlt);
  }
  return aufgaben;
}

/** Eine einzelne Aufgabe aus einem Paket. */
export function erzeugeAufgabe(paketId: string, art: Aufgabenart, rng: () => number): Aufgabe {
  const bauart = ALLE_BAUARTEN[paketId];
  if (!bauart) throw new NochNichtGebaut(paketId, art);
  const kern = bauart(rng);
  const aufgabe = formeAufgabe({ paket: paketId, art, kern, rng, nachschub: () => bauart(rng) });
  // ★ Andere Sprachen als Deutsch zeigen nur, was sie übersetzt UND im Mathe-Code der
  // Sprache schreiben können (`sprachfilter.ts`). Deutsch geht ungeprüft durch.
  const sprache = plusSprache();
  if (sprache !== "de" && !aufgabeFuerSprache(aufgabe, sprache)) throw new NochNichtGebaut(paketId, art);
  return aufgabe;
}

export interface LaufWunsch {
  /** Wie viele Aufgaben. Ein Lauf hat 10 bis 20 - mehr ermüdet. */
  anzahl?: number;
  /** Saat für den Zufall; gleiche Saat, gleicher Lauf. */
  saat?: number;
  /** Nur diese Formen verwenden. Sonst die des Pakets. */
  arten?: Aufgabenart[];
}

/**
 * Ein Übungslauf aus EINEM Paket - die Tür „Ich wähle".
 *
 * Die Formen wechseln innerhalb des Laufs: die Leitform des Pakets kommt am
 * häufigsten, die übrigen mischen sich dazwischen. Zwanzig gleiche Aufgaben
 * hintereinander sind genau das, was die Excel-Mappe getan hat und was Plus
 * nicht tut.
 */
export function erzeugeLauf(paketId: string, wunsch: LaufWunsch = {}): Aufgabe[] {
  const p = paket(paketId);
  const anzahl = Math.min(20, Math.max(1, wunsch.anzahl ?? 12));
  const rng = zufall(wunsch.saat ?? 1);

  const moegliche = (wunsch.arten ?? p.arten).filter((a) => GEBAUTE_FORMEN.includes(a));
  if (!moegliche.length) throw new NochNichtGebaut(paketId, (wunsch.arten ?? p.arten)[0]);

  const aufgaben: Aufgabe[] = [];
  const gesehen = new Set<string>();
  for (let i = 0; aufgaben.length < anzahl && i < anzahl * 60; i++) {
    // Die Leitform etwa doppelt so oft wie die übrigen.
    const art = i % 2 === 0 || moegliche.length === 1
      ? moegliche[0]
      : moegliche[1 + Math.floor(rng() * (moegliche.length - 1))];
    // ★ Seltene Formen: höchstens einmal je Runde, und nur jedes zweite Mal,
    // wenn sie gezogen werden (siehe `SELTENE_FORMEN`).
    if (SELTENE_FORMEN.includes(art) && moegliche.length > 1
      && (aufgaben.some((a) => a.art === art) || rng() < 0.5)) continue;
    // Eine Form kann für einen bestimmten Kern absagen - dann nimmt der Lauf
    // die nächste. Er bricht nicht ab: das Kind soll seine zwölf Aufgaben
    // bekommen.
    let a: Aufgabe;
    try {
      a = erzeugeAufgabe(paketId, art, rng);
    } catch (fehler) {
      if (fehler instanceof NochNichtGebaut) continue;
      throw fehler;
    }
    const neu = !gesehen.has(a.angabe);
    // Kleine Pakete - das Einspluseins hat nur so viele Aufgaben - dürfen
    // wiederholen. Nur nie zweimal dieselbe hintereinander.
    const schonGenug = gesehen.size >= 8 || i > anzahl * 8;
    if (!neu && !schonGenug) continue;
    if (aufgaben.length && aufgaben[aufgaben.length - 1].angabe === a.angabe) continue;
    gesehen.add(a.angabe);
    aufgaben.push(a);
  }
  return aufgaben;
}

/**
 * Welche Pakete kann der Generator heute bedienen?
 *
 * ★ Gemessen, nicht geschlossen: die Liste entsteht, indem tatsächlich eine
 * Aufgabe gebaut wird. Dass ein Paket eine gebaute Form NENNT, heisst noch
 * nicht, dass die Form mit seinem Kern zurechtkommt - und eine Liste, die das
 * behauptet, waere schlimmer als gar keine.
 */
export function bedienbarePakete(): string[] {
  if (plusSprache() !== "de") return bedienbareFuerSprache();
  const rng = zufall(1);
  return PAKETE.filter((p) => {
    if (!ALLE_BAUARTEN[p.id]) return false;
    return p.arten.some((art) => {
      if (!GEBAUTE_FORMEN.includes(art)) return false;
      try { erzeugeAufgabe(p.id, art, rng); return true; } catch { return false; }
    });
  }).map((p) => p.id);
}

/**
 * Welche Pakete bietet die aktuelle Sprache an? ★ GEMESSEN: ein Paket zählt, wenn
 * mindestens eine seiner Formen bei 24 Versuchen mindestens 12 Aufgaben liefert, die
 * `aufgabeFuerSprache` annimmt. Das Ergebnis steht je Sprache im Speicher (die
 * Messung baut ein paar tausend Aufgaben).
 */
const ANGEBOT = new Map<string, ReadonlySet<string>>();

export function bedienbareFuerSprache(): string[] {
  const sprache = plusSprache();
  if (sprache === "de") return bedienbarePakete();
  let menge = ANGEBOT.get(sprache);
  if (!menge) {
    menge = new Set(
      messeMitRohplan(() => {
        const rng = zufall(20261107);
        return PAKETE.filter((p) => {
          if (!ALLE_BAUARTEN[p.id]) return false;
          return p.arten.some((art) => {
            if (!GEBAUTE_FORMEN.includes(art)) return false;
            let treffer = 0;
            for (let i = 0; i < 24; i++) {
              try { erzeugeAufgabe(p.id, art, rng); treffer++; } catch { /* nächster Versuch */ }
            }
            // Mindestens die Hälfte: ein Paket, dessen Aufgaben fast alle ausfallen, trägt sein
            // Thema nicht mehr („Mal mit negativen Zahlen" ohne negative Zahlen).
            return treffer >= 12;
          });
        }).map((p) => p.id);
      }),
    );
    ANGEBOT.set(sprache, menge);
  }
  return [...menge];
}

// Der Stoffplan fragt nach, wenn er für eine andere Sprache die Pakete filtert.
setzePaketErlaubnis((id) => bedienbareFuerSprache().includes(id));
