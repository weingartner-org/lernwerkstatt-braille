/**
 * Wie viele Möglichkeiten? - Kombinatorik zum Kopfrechnen.
 *
 * Beleg: BEFUND …, B5 - „3 Mützen, 4 Hemden, 2 Hosen" (Knobel 1759, Beleg im Ursprungs-Repository,
 * Beleg im Ursprungs-Repository).
 *
 * - Stufe 1-2: zwei Kleidungsarten, Grundprinzip des Zählens.
 * - Stufe 3-4: drei Kleidungsarten ODER Ziffernkarten (wie viele Zahlen aus
 *   lauter verschiedenen Ziffern).
 * - Stufe 5-8: Händeschütteln (jeder mit jedem) ODER Wege in einem Gitter
 *   (nur rechts oder runter).
 *
 * ★ Nur Kleidung, die als Paar (oder Dreiergespann) auch wirklich zusammen
 * angezogen wird - Rückmeldung 26.09.2026: KEINE Handschuhe (die kommen
 * selbst schon als Paar, das verwirrt beim Zählen). Und die Frage ist konkret
 * gestellt („Wie viele Paare?"), nicht als abstraktes „alles kombinieren".
 */
import type { Aufgabe } from "../aufgabe";
import { ganz, eines } from "../aufgabe";
import { ohneWiederholung, binomial, fakultaet } from "./hilfen";

interface Kategorie { plural: string; erste: string }

const PAARE: readonly [Kategorie, Kategorie][] = [
  [{ plural: "Mützen", erste: "die erste Mütze" }, { plural: "Schals", erste: "der erste Schal" }],
  [{ plural: "T-Shirts", erste: "das erste T-Shirt" }, { plural: "Hosen", erste: "die erste Hose" }],
  [{ plural: "Jacken", erste: "die erste Jacke" }, { plural: "Schals", erste: "der erste Schal" }],
];

const TRIPEL: readonly [Kategorie, Kategorie, Kategorie][] = [
  [
    { plural: "Mützen", erste: "die erste Mütze" },
    { plural: "Schals", erste: "der erste Schal" },
    { plural: "Jacken", erste: "die erste Jacke" },
  ],
  [
    { plural: "T-Shirts", erste: "das erste T-Shirt" },
    { plural: "Hosen", erste: "die erste Hose" },
    { plural: "Socken", erste: "die erste Socke" },
  ],
];

function kleidungPaar(rng: () => number, stufe: number) {
  const [a, b] = eines(rng, PAARE);
  const na = ganz(rng, 2, 4);
  const nb = ganz(rng, 2, 4);
  const antwort = na * nb;
  return {
    angabe: `Du hast ${na} ${a.plural} und ${nb} ${b.plural}.\nWie viele verschiedene Paare kannst du anziehen?\nAnzahl =[]`,
    loesung: String(antwort), zahlen: [na, nb, antwort],
    tipp: `Nimm ${a.erste}. Wie viele ${b.plural} passen?`,
    // ★ In Stufe 1 gibt es noch kein Mal - die Erklärung zählt wiederholt
    // zusammen, wie das Kind es auch rechnen kann. Gemessen am 26.09.2026 in
    // der Vorschau: „Gelöst! 3 *2 =6." in Stufe 1.
    erklaerung: stufe <= 1
      ? `Zu jedem der ${na} ${a.plural} passen ${nb} ${b.plural}: ${Array(na).fill(nb).join(" +")} =${antwort}.`
      : `Zu jedem der ${na} ${a.plural} passen ${nb} ${b.plural}: ${na} *${nb} =${antwort}.`,
  };
}

function kleidungDrei(rng: () => number) {
  const [a, b, c] = eines(rng, TRIPEL);
  const anzahlen = [ganz(rng, 2, 4), ganz(rng, 2, 4), ganz(rng, 2, 4)];
  const antwort = anzahlen[0] * anzahlen[1] * anzahlen[2];
  return {
    angabe: `Du hast ${anzahlen[0]} ${a.plural}, ${anzahlen[1]} ${b.plural} und ${anzahlen[2]} ${c.plural}.\nWie viele verschiedene Kombinationen kannst du anziehen?\nAnzahl =[]`,
    loesung: String(antwort), zahlen: [...anzahlen, antwort],
    tipp: `Nimm ${a.erste}. Wie viele ${b.plural} und ${c.plural} passen dazu?`,
    erklaerung: `${anzahlen.join(" *")} =${antwort}.`,
  };
}

function ziffernkarten(rng: () => number) {
  const gezogen = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => rng() - 0.5).slice(0, 3).sort((a, b) => a - b);
  const antwort = fakultaet(3);
  return {
    angabe: `Du hast die Ziffernkarten ${gezogen[0]}, ${gezogen[1]} und ${gezogen[2]}.\nWie viele verschiedene dreistellige Zahlen kannst du legen?\nAnzahl =[]`,
    loesung: String(antwort), zahlen: [...gezogen, antwort],
    tipp: "Für die erste Stelle hast du 3 Karten, dann noch 2, dann noch 1.",
    erklaerung: `3 *2 *1 =${antwort} verschiedene Zahlen.`,
  };
}

function haendeschuetteln(rng: () => number, stufe: number) {
  const n = ganz(rng, stufe <= 6 ? 4 : 5, stufe <= 6 ? 6 : 12);
  const antwort = (n * (n - 1)) / 2;
  return {
    angabe: `${n} Kinder geben einander einmal die Hand.\nJedes Kind gibt jedem anderen Kind die Hand.\nWie oft wird sich die Hand gegeben?\nAnzahl =[]`,
    loesung: String(antwort), zahlen: [n, antwort],
    tipp: `Das erste Kind gibt ${n - 1} Hände, das zweite noch ${n - 2} neue - und so weiter.`,
    erklaerung: `${n} *${n - 1} /2 =${antwort} Händedrücke.`,
  };
}

function wegeImGitter(rng: () => number) {
  const rechts = ganz(rng, 2, 4);
  const runter = ganz(rng, 2, 3);
  const antwort = binomial(rechts + runter, rechts);
  return {
    angabe: `Du gehst von oben links nach unten rechts.\nDu darfst nur nach rechts oder nach unten gehen.\nEs sind ${rechts} Schritte rechts und ${runter} Schritte runter.\nWie viele verschiedene Wege gibt es?\nAnzahl =[]`,
    loesung: String(antwort), zahlen: [rechts, runter, antwort],
    tipp: "Jeder Weg hat dieselben Schritte, nur anders angeordnet.",
    erklaerung: `Von ${rechts + runter} Schritten sind ${rechts} „rechts" - das ergibt ${antwort} Wege.`,
  };
}

export function wieVieleMoeglichkeiten(stufe: number, rng: () => number, bekannt?: readonly string[]): Aufgabe {
  return ohneWiederholung(bekannt, () => {
    let teil;
    if (stufe <= 2) {
      teil = kleidungPaar(rng, stufe);
    } else if (stufe <= 4) {
      teil = rng() < 0.5 ? kleidungDrei(rng) : ziffernkarten(rng);
    } else {
      teil = rng() < 0.5 ? haendeschuetteln(rng, stufe) : wegeImGitter(rng);
    }
    return {
      paket: `raetsel-${stufe}`, art: "knobel", op: "zahlen", titel: "Wie viele Möglichkeiten?",
      ...teil,
    } satisfies Aufgabe;
  });
}
