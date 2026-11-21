/**
 * ════════════════════════════════════════════════════════════════════════════
 * WÄCHTER: Suchaufgaben (23.09.2026)
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Die Rechnung hinter „wo steht es?" und „wie oft?". Geprüft wird mit ECHTEN
 * Zellen aus der Engine - eine Suchaufgabe, die mit erfundenen Zellen rechnet,
 * bewiese nichts über das, was das Kind sieht.
 *
 * ★ DIE ZWEI FEHLER, DIE HIER NICHT PASSIEREN DÜRFEN:
 *  1. Bei „das wievielte Zeichen ist es" steht das Ziel MEHRMALS in der Reihe.
 *     Dann hat die Frage mehrere richtige Antworten, und ein Kind bekommt ein
 *     Rot für eine Lösung, die stimmt. Das ist der Fall aus
 *     [[feedback_nie_gegen_das_kind]] - die App zählt etwas gegen das Kind,
 *     was seine Schuld nicht ist.
 *  2. Die leere Eingabe gilt als richtig. Wer nichts tippt, darf kein Grün
 *     bekommen.
 */
import { describe, expect, it } from "vitest";
import {
  ablenkerNachSchwierigkeit,
  baueSuchaufgabe,
  einheitsAbstand,
  punktAbstand,
  reiheAlsText,
  suchAntwortStimmt,
  type SuchEinheit,
} from "@/lib/braille/suchaufgabe";
import { textToCells } from "@/lib/braille/engine";
import { cellToUnicode } from "@/lib/braille/cell";

/** Eine Einheit mit den Zellen, die die App wirklich erzeugt. */
function einheit(print: string): SuchEinheit {
  return { print, cells: textToCells(print, { system: "basis" }) };
}

/** Der Wortschatz der ersten Basis-Etappen - was ein Kind früh kennt. */
const FRUEH = ["l", "a", "i", "m", "s", "u", "o", "d", "n", "e"].map(einheit);

/** Fester Würfel, damit die Prüfungen nicht wackeln. */
function festerWuerfel(werte: number[]): () => number {
  let i = 0;
  return () => werte[i++ % werte.length];
}

describe("Punktabstand - die Grundlage der Schwierigkeit", () => {
  it("dieselbe Zelle hat Abstand 0", () => {
    expect(punktAbstand(0b000001, 0b000001)).toBe(0);
  });

  it("★ a und b unterscheiden sich in genau EINEM Punkt", () => {
    // a = Punkt 1, b = Punkte 1 und 2. Das ist der schwerste Fall überhaupt,
    // und er ist gerechnet, nicht aufgeschrieben.
    const a = textToCells("a", { system: "basis" })[0];
    const b = textToCells("b", { system: "basis" })[0];
    expect(punktAbstand(a, b)).toBe(1);
  });

  it("weit auseinanderliegende Zeichen haben einen grossen Abstand", () => {
    const a = textToCells("a", { system: "basis" })[0];
    const y = textToCells("y", { system: "basis" })[0];
    expect(punktAbstand(a, y)).toBeGreaterThan(2);
  });

  it("der Abstand ist symmetrisch", () => {
    for (const x of FRUEH) {
      for (const y of FRUEH) {
        expect(einheitsAbstand(x, y)).toBe(einheitsAbstand(y, x));
      }
    }
  });
});

describe("Ablenker - vom schwersten zuerst", () => {
  it("das Ziel selbst ist nie Ablenker", () => {
    const ziel = einheit("a");
    const ablenker = ablenkerNachSchwierigkeit(ziel, FRUEH);
    expect(ablenker.map((e) => e.print)).not.toContain("a");
  });

  it("★ die Liste ist nach Punktabstand geordnet - vorne das Schwerste", () => {
    const ziel = einheit("a");
    const ablenker = ablenkerNachSchwierigkeit(ziel, FRUEH);
    const abstaende = ablenker.map((e) => einheitsAbstand(e, ziel));
    for (let i = 1; i < abstaende.length; i++) {
      expect(abstaende[i], `${ablenker[i - 1].print} vor ${ablenker[i].print}`)
        .toBeGreaterThanOrEqual(abstaende[i - 1]);
    }
  });
});

describe("★★★ Suchaufgabe „wo steht es?\" - das Ziel steht GENAU EINMAL", () => {
  it("★ über 200 gewürfelte Aufgaben hat jede genau einen Treffer", () => {
    // Stünde das Ziel zweimal, hätte die Frage zwei richtige Antworten und das
    // Kind bekäme für eine davon ein Rot.
    for (let n = 0; n < 200; n++) {
      const ziel = FRUEH[n % FRUEH.length];
      const a = baueSuchaufgabe({ auswahl: FRUEH, ziel, art: "position", laenge: 8 });
      const treffer = a.reihe.filter((e) => e.print === ziel.print).length;
      expect(treffer, `${ziel.print}: ${a.reihe.map((e) => e.print).join("")}`).toBe(1);
    }
  });

  it("die Lösung zeigt wirklich auf den Platz des Ziels", () => {
    for (let n = 0; n < 200; n++) {
      const ziel = FRUEH[n % FRUEH.length];
      const a = baueSuchaufgabe({ auswahl: FRUEH, ziel, art: "position", laenge: 8 });
      expect(a.reihe[a.loesung - 1].print).toBe(ziel.print);
    }
  });

  it("die Reihe hat die verlangte Länge", () => {
    for (const laenge of [2, 5, 8, 12]) {
      const a = baueSuchaufgabe({ auswahl: FRUEH, ziel: einheit("a"), art: "position", laenge });
      expect(a.reihe).toHaveLength(laenge);
    }
  });

  it("die Frage nennt das gesuchte Zeichen und duzt", () => {
    const a = baueSuchaufgabe({ auswahl: FRUEH, ziel: einheit("m"), art: "position" });
    expect(a.frage).toContain("m");
    expect(a.frage).not.toMatch(/\bSie\b/);
  });
});

describe("Suchaufgabe „wie oft?\"", () => {
  it("die Lösung stimmt mit der Reihe überein", () => {
    for (let n = 0; n < 200; n++) {
      const ziel = FRUEH[n % FRUEH.length];
      const a = baueSuchaufgabe({ auswahl: FRUEH, ziel, art: "anzahl", laenge: 8 });
      const treffer = a.reihe.filter((e) => e.print === ziel.print).length;
      expect(treffer).toBe(a.loesung);
    }
  });

  it("das Ziel kommt mindestens einmal vor - eine Null-Antwort wäre eine Falle", () => {
    for (let n = 0; n < 100; n++) {
      const a = baueSuchaufgabe({ auswahl: FRUEH, ziel: einheit("a"), art: "anzahl" });
      expect(a.loesung).toBeGreaterThanOrEqual(1);
    }
  });
});

describe("Die Stufen unterscheiden sich wirklich", () => {
  it("★ Stufe 3 stellt nähere Ablenker daneben als Stufe 1", () => {
    // Ohne diese Prüfung könnten alle drei Stufen dasselbe liefern und der
    // Aufbau wäre eine Behauptung ([[feedback_gruener_waechter_beweist_was]]).
    const ziel = einheit("a");
    const wuerfel = () => 0.5;
    const mittel = (stufe: 1 | 2 | 3) => {
      const a = baueSuchaufgabe({ auswahl: FRUEH, ziel, art: "position", stufe, laenge: 20, wuerfel });
      const ablenker = a.reihe.filter((e) => e.print !== ziel.print);
      return ablenker.reduce((s, e) => s + einheitsAbstand(e, ziel), 0) / ablenker.length;
    };
    expect(mittel(3)).toBeLessThan(mittel(1));
  });
});

describe("★★★ Die Antwort - was gilt und was nicht", () => {
  const aufgabe = baueSuchaufgabe({
    auswahl: FRUEH, ziel: einheit("a"), art: "position", laenge: 6,
    wuerfel: festerWuerfel([0.34, 0.1, 0.2, 0.3, 0.4, 0.5]),
  });

  it("die blosse Zahl stimmt", () => {
    expect(suchAntwortStimmt(aufgabe, String(aufgabe.loesung))).toBe(true);
  });

  it("Leerzeichen und ein Punkt dahinter stören nicht", () => {
    expect(suchAntwortStimmt(aufgabe, ` ${aufgabe.loesung} `)).toBe(true);
    expect(suchAntwortStimmt(aufgabe, `${aufgabe.loesung}.`)).toBe(true);
  });

  it("★ die leere Eingabe ist NIE richtig", () => {
    expect(suchAntwortStimmt(aufgabe, "")).toBe(false);
    expect(suchAntwortStimmt(aufgabe, "   ")).toBe(false);
  });

  it("eine falsche Zahl ist falsch", () => {
    expect(suchAntwortStimmt(aufgabe, String(aufgabe.loesung + 1))).toBe(false);
  });

  it("Buchstaben statt Zahl sind falsch, nicht ein Absturz", () => {
    for (const eingabe of ["a", "drei", "?", "3a", "-3"]) {
      expect(() => suchAntwortStimmt(aufgabe, eingabe)).not.toThrow();
      expect(suchAntwortStimmt(aufgabe, eingabe)).toBe(false);
    }
  });
});

describe("Die Reihe als Text", () => {
  it("★ gibt echte Braillezeichen - die Braillezeile zeigt genau diese Reihe", () => {
    const a = baueSuchaufgabe({ auswahl: FRUEH, ziel: einheit("a"), art: "position", laenge: 6 });
    const text = reiheAlsText(a, cellToUnicode);
    expect(text).toHaveLength(6);
    expect(text).toMatch(/^[⠀-⣿]+$/);
    // Und an der Lösungsstelle steht wirklich das Ziel.
    expect(text[a.loesung - 1]).toBe(cellToUnicode(a.ziel.cells[0]));
  });
});

describe("Grenzfälle, die nicht abstürzen dürfen", () => {
  it("eine Auswahl ohne Ablenker sagt, was fehlt - statt still Unsinn zu bauen", () => {
    const nur = [einheit("a")];
    expect(() => baueSuchaufgabe({ auswahl: nur, ziel: einheit("a"), art: "position" }))
      .toThrow(/kein Ablenker/);
  });

  it("eine Reihe der Länge 2 geht noch", () => {
    const a = baueSuchaufgabe({ auswahl: FRUEH, ziel: einheit("a"), art: "position", laenge: 2 });
    expect(a.reihe).toHaveLength(2);
    expect(a.loesung).toBeGreaterThanOrEqual(1);
    expect(a.loesung).toBeLessThanOrEqual(2);
  });
});
