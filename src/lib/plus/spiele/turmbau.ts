/**
 * Das Spiel „Turmbau": vor jedem Zug wählen, wie schwer es sein soll.
 *
 * ★ Das ist das einzige Spiel, in dem die Selbsteinschätzung der Lerngegenstand
 * ist. Ein Kind, das sich immer für leicht entscheidet, baut einen kleinen
 * Turm; eines, das sich überschätzt, auch. Die Rückmeldung kommt vom Turm, und
 * sie ist stumm: niemand sagt „du hättest schwerer nehmen sollen".
 *
 * ★ Nichts stürzt ein. Eine falsche Antwort baut kein Stockwerk, aber sie
 * nimmt auch keines weg. Verlustangst ist der Mechanismus, den die großen
 * Lern-Apps benutzen und den Plus ausdrücklich nicht will.
 *
 * ★ Keine Uhr. Zehn Züge, und die Höhe am Ende ist die eigene Marke - kein
 * Vergleich mit anderen.
 */
import { ganz, zahl, type Operation } from "../aufgabe";

export type Schwere = "leicht" | "mittel" | "schwer";

/** Wie viele Stockwerke ein richtiger Zug baut. */
export const STOCKWERKE: Record<Schwere, number> = { leicht: 1, mittel: 2, schwer: 3 };

export const SCHWEREN: Schwere[] = ["leicht", "mittel", "schwer"];

export interface Turmaufgabe {
  angabe: string;
  loesung: string;
  schwere: Schwere;
  op: Operation;
}

/**
 * Eine Aufgabe zur gewählten Schwere - passend zur Schulstufe.
 *
 * Die Grenzen sind bewusst grob: das Spiel soll fordern, nicht prüfen. Was
 * genau geübt wird, entscheiden die Übungspakete, nicht der Turm.
 */
export function turmaufgabe(rng: () => number, stufe: number, schwere: Schwere): Turmaufgabe {
  const raum = stufe <= 1 ? 20 : stufe <= 2 ? 100 : stufe <= 4 ? 1000 : 10000;

  if (schwere === "leicht") {
    const a = ganz(rng, 2, Math.min(20, raum));
    const b = ganz(rng, 1, Math.min(9, raum));
    if (rng() < 0.5) {
      return { angabe: `${zahl(a)} +${zahl(b)} =`, loesung: zahl(a + b), schwere, op: "plus" };
    }
    // ★ Beim Minus die größere Zahl nach vorn: negative Ergebnisse gibt es
    // erst in der 7. Schulstufe, und im Turmbau nie.
    const [oben, unten] = a >= b ? [a, b] : [b, a];
    return { angabe: `${zahl(oben)} -${zahl(unten)} =`, loesung: zahl(oben - unten), schwere, op: "minus" };
  }

  if (schwere === "mittel") {
    if (stufe <= 2) {
      const a = ganz(rng, 11, Math.min(90, raum));
      const b = ganz(rng, 4, 9);
      return { angabe: `${zahl(a)} +${zahl(b)} =`, loesung: zahl(a + b), schwere, op: "plus" };
    }
    const a = ganz(rng, 3, 9);
    const b = ganz(rng, 3, 9);
    return { angabe: `${zahl(a)} *${zahl(b)} =`, loesung: zahl(a * b), schwere, op: "mal" };
  }

  // schwer
  if (stufe <= 2) {
    const a = ganz(rng, 21, Math.min(89, raum));
    const b = ganz(rng, 12, 39);
    return { angabe: `${zahl(a)} +${zahl(b)} =`, loesung: zahl(a + b), schwere, op: "plus" };
  }
  const a = ganz(rng, 12, Math.min(99, Math.floor(raum / 10)));
  const b = ganz(rng, 3, 9);
  return rng() < 0.5
    ? { angabe: `${zahl(a)} *${zahl(b)} =`, loesung: zahl(a * b), schwere, op: "mal" }
    : { angabe: `${zahl(a * b)} /${zahl(b)} =`, loesung: zahl(a), schwere, op: "geteilt" };
}

export interface Turm {
  /** Wie hoch der Turm steht. */
  hoehe: number;
  /** Wie viele Züge schon gemacht sind. */
  zuege: number;
  /** Wie viele Züge das Spiel hat. */
  gesamt: number;
}

export function neuerTurm(gesamt = 10): Turm {
  return { hoehe: 0, zuege: 0, gesamt };
}

/** Einen Zug verbuchen. Falsch kostet nichts - es baut nur nichts. */
export function nachTurmzug(turm: Turm, schwere: Schwere, richtig: boolean): Turm {
  return {
    ...turm,
    hoehe: turm.hoehe + (richtig ? STOCKWERKE[schwere] : 0),
    zuege: turm.zuege + 1,
  };
}

export function turmFertig(turm: Turm): boolean {
  return turm.zuege >= turm.gesamt;
}

/**
 * Was der Turm am Ende sagt - über den Turm, nie über das Kind.
 *
 * ★ Kein „du hättest schwerer nehmen sollen". Die Höchsthöhe steht daneben,
 * damit das Kind selbst rechnen kann, und mehr nicht.
 */
export function turmSatz(turm: Turm): string {
  const hoechstens = turm.gesamt * STOCKWERKE.schwer;
  return `Dein Turm hat ${turm.hoehe} ${turm.hoehe === 1 ? "Stockwerk" : "Stockwerke"}. Mehr als ${hoechstens} gehen nicht.`;
}
