/**
 * Das Spiel „Paare finden": vier mal vier Felder, Aufgabe und Ergebnis
 * gehören zusammen.
 *
 * ★ Die eine Regel, die aus der Forschung kommt und das ganze Gitter bestimmt:
 * räumliche Zusatzaufgaben stören das taktile Arbeitsgedächtnis deutlich
 * stärker als Kopfrechnen selbst. Deshalb wird hier nie gleichzeitig navigiert
 * und gerechnet - erst das Feld, dann sein Inhalt, und die Rechnung steht
 * still da, solange das Kind sie liest.
 *
 * ★ Die Lage wird angesagt: „Zeile 2, Spalte 3". Ein Gitter, das man nur sieht,
 * ist kein Gitter für dieses Kind.
 *
 * Kein Tempo, keine Zugbegrenzung. Wer lange sucht, sucht lange.
 */
import { ganz, zahl } from "../aufgabe";

export interface Karte {
  /** Was auf der Karte steht. */
  text: string;
  /** Welches Paar - zwei Karten mit derselben Nummer gehören zusammen. */
  paar: number;
  /** Aufgabe oder Ergebnis? Nur für die Ansage. */
  art: "aufgabe" | "ergebnis";
  gefunden: boolean;
}

export interface PaareSpiel {
  /** Vier mal vier Karten, zeilenweise. */
  karten: Karte[];
  /** Wie viele Paare es gibt. */
  paare: number;
}

export const BREITE = 4;
export const HOEHE = 4;

/**
 * Ein Spiel bauen - acht Paare aus dem Einmaleins der Schulstufe.
 *
 * Die Aufgaben sind absichtlich verschieden im Ergebnis: zwei Karten mit
 * derselben Zahl wären nicht zu unterscheiden.
 */
export function neuesPaareSpiel(rng: () => number, stufe = 3): PaareSpiel {
  const bis = stufe <= 2 ? 10 : stufe <= 4 ? 10 : 15;
  const gesehen = new Set<number>();
  const paare: { aufgabe: string; ergebnis: string }[] = [];

  for (let versuch = 0; versuch < 400 && paare.length < (BREITE * HOEHE) / 2; versuch++) {
    const a = ganz(rng, 2, bis);
    const b = ganz(rng, 2, bis);
    const ergebnis = a * b;
    if (gesehen.has(ergebnis)) continue;
    gesehen.add(ergebnis);
    paare.push({ aufgabe: `${zahl(a)} *${zahl(b)} =`, ergebnis: zahl(ergebnis) });
  }

  const karten: Karte[] = [];
  paare.forEach((p, i) => {
    karten.push({ text: p.aufgabe, paar: i, art: "aufgabe", gefunden: false });
    karten.push({ text: p.ergebnis, paar: i, art: "ergebnis", gefunden: false });
  });

  // Mischen - mit dem Zufall, den der Aufrufer mitbringt.
  for (let i = karten.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [karten[i], karten[j]] = [karten[j], karten[i]];
  }

  return { karten, paare: paare.length };
}

/** Die Lage eines Feldes in Worten - so wird sie angesagt. */
export function lage(index: number): string {
  const zeile = Math.floor(index / BREITE) + 1;
  const spalte = (index % BREITE) + 1;
  return `Zeile ${zeile}, Spalte ${spalte}`;
}

/** Ein Schritt mit den Pfeiltasten - er bleibt im Gitter. */
export function bewege(index: number, richtung: "hoch" | "runter" | "links" | "rechts"): number {
  const zeile = Math.floor(index / BREITE);
  const spalte = index % BREITE;
  if (richtung === "hoch") return zeile > 0 ? index - BREITE : index;
  if (richtung === "runter") return zeile < HOEHE - 1 ? index + BREITE : index;
  if (richtung === "links") return spalte > 0 ? index - 1 : index;
  return spalte < BREITE - 1 ? index + 1 : index;
}

/** Gehören die beiden Karten zusammen? */
export function passen(spiel: PaareSpiel, a: number, b: number): boolean {
  if (a === b) return false;
  return spiel.karten[a].paar === spiel.karten[b].paar;
}

/** Ein gefundenes Paar eintragen. */
export function nachFund(spiel: PaareSpiel, a: number, b: number): PaareSpiel {
  const karten = spiel.karten.map((k, i) => (i === a || i === b ? { ...k, gefunden: true } : k));
  return { ...spiel, karten };
}

export function alleGefunden(spiel: PaareSpiel): boolean {
  return spiel.karten.every((k) => k.gefunden);
}

/** Wie viele Paare stehen noch offen? */
export function offenePaare(spiel: PaareSpiel): number {
  return spiel.karten.filter((k) => !k.gefunden).length / 2;
}
