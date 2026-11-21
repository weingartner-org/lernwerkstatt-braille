/**
 * ★★★★★ VORLESEZEIT RAUS - AUCH BEI GANZEN TEXTEN (22.09.2026, Nachtrag).
 *
 * Johannes' Entscheidung vom 22.09.2026 („vorlesen muss raus") war bis zu
 * dieser Datei nur an ZWEI Stellen gebaut: `WritePanel.completeWord` und
 * `ReadPanel.check` (siehe `lib/braille/lesezeit.ts` Dateikopf). Die beiden
 * Text-Panels - `TextPanel` („Text schreiben", ganzer Fliesstext in Braille)
 * und `TextReadPanel` („Text lesen", ganzer Braille-Text in Druckschrift) -
 * verbuchten `ms` weiterhin ROH und schrieben `spokenMs` nie ans Ereignis.
 * Genau dort wird am meisten vorgelesen (b14, e15, e20, e20b, kurz-Texte).
 *
 * ⚠️ Eine Besonderheit, die reines Kopieren der beiden anderen Panels
 * verfaelscht haette: `TextPanel` startet seine Uhr NICHT beim Mount wie
 * `WritePanel`/`ReadPanel`/`TextReadPanel`, sondern erst beim ERSTEN
 * Anschlag (`begin()`, `startRef` bleibt bis dahin `null`). Die
 * Vorlese-Ansage des ganzen Textes VOR dem ersten Anschlag steckt darum
 * ohnehin nie in `ms` - wuerde `spokenAtStartRef` trotzdem beim Mount
 * gesetzt, zoege `typingGapMs` spaeter Sprechzeit ab, die gar nicht im
 * gemessenen Fenster lag (Szenario C unten belegt das mit Zahlen: eine
 * 4-Sekunden-Ansage VOR dem ersten Anschlag darf weder `ms` noch `spokenMs`
 * veraendern). `spokenAtStartRef` wird darum in `TextPanel` GENAU dort
 * gesetzt, wo auch `startRef` gesetzt wird - in `begin()`, nicht im
 * Mount-Effekt.
 *
 * `TextReadPanel` startet die Uhr dagegen schon beim Mount (wie `ReadPanel`)
 * - dort passt die Kopie 1:1, Szenario E belegt das.
 *
 * Die Sprachausgabe ist gestellt (jsdom kennt keine echte Web Speech API):
 * `spokenMs`/`isSpeaking` lesen eine Liste „gesprochener" Zeitfenster auf der
 * gestellten Uhr - Bauart wie in `tests/typing-eine-messart.test.ts`.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";

const sprache = vi.hoisted(() => ({ abschnitte: [] as [number, number][] }));

vi.mock("@/lib/braille/voice", async (importOriginal) => {
  const echt = await importOriginal<typeof import("@/lib/braille/voice")>();
  return {
    ...echt,
    spokenMs: () => {
      const jetzt = Date.now();
      return sprache.abschnitte.reduce(
        (s, [von, bis]) => s + Math.max(0, Math.min(bis, jetzt) - von),
        0,
      );
    },
    isSpeaking: () => {
      const jetzt = Date.now();
      return sprache.abschnitte.some(([von, bis]) => jetzt >= von && jetzt < bis);
    },
  };
});

import { TextPanel, TextReadPanel } from "@/components/braille/BrailleTrainer";
import { BLANK, CHORD_NACHLAUF_MS, cellDots, textToCells, type Cell } from "@/lib/braille";

const T0 = Date.UTC(2026, 8, 22, 9, 0, 0);

beforeEach(() => {
  vi.useFakeTimers({ now: T0 });
  sprache.abschnitte = [];
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

const DOT_KEY: Record<number, string> = {
  1: "KeyF",
  2: "KeyD",
  3: "KeyS",
  4: "KeyJ",
  5: "KeyK",
  6: "KeyL",
};

function tippeZelle(el: HTMLElement, cell: Cell) {
  if (cell === BLANK) {
    fireEvent.keyDown(el, { code: "Space" });
    fireEvent.keyUp(el, { code: "Space" });
    return;
  }
  const codes = cellDots(cell).map((d) => DOT_KEY[d]);
  for (const code of codes) fireEvent.keyDown(el, { code });
  for (const code of codes) fireEvent.keyUp(el, { code });
  // Die Zelle wartet die Nachfrist ab (nicht ganz gleichzeitige Tasten).
  act(() => {
    vi.advanceTimersByTime(CHORD_NACHLAUF_MS);
  });
}

const TEXT = "am see";
const TEXT_CELLS = textToCells(TEXT, { system: "basis", grossschreibzeichen: true });

/** Echte Zeit, die die Nachfrist der Akkord-Eingabe beim Tippen dieser Zellen
 *  verstreichen lässt (jede Punkt-Zelle wartet einmal). */
function nachfrist(cells: readonly Cell[]): number {
  return CHORD_NACHLAUF_MS * cells.filter((c) => c !== BLANK).length;
}

describe("TextPanel (Text schreiben) - Vorlesezeit raus", () => {
  function schreibfeld(): HTMLElement {
    return screen.getByRole("textbox", { name: "Text in Braille schreiben" });
  }

  it("ohne Sprachausgabe: ms bleibt die rohe Zeit seit dem ersten Anschlag, spokenMs bleibt leer", () => {
    const onTask = vi.fn();
    render(
      <TextPanel
        text={TEXT}
        system="basis"
        eightDot={false}
        onRepeat={() => {}}
        onNext={null}
        onTask={onTask}
      />,
    );
    // Denkpause VOR dem ersten Anschlag - die Uhr startet erst bei `begin()`.
    act(() => {
      vi.advanceTimersByTime(4000);
    });
    act(() => {
      for (const c of TEXT_CELLS) tippeZelle(schreibfeld(), c);
    });

    expect(onTask).toHaveBeenCalledTimes(1);
    const meta = onTask.mock.calls[0][1];
    expect(meta.cells).toBe(TEXT_CELLS.length);
    expect(meta.spokenMs).toBeUndefined();
    // Sofortige Eingabe ⇒ seit `begin()` (= erste Zelle fertig) vergeht nur
    // die Nachfrist der übrigen Zellen - die 4 s Denkpause davor stehen zu
    // Recht nicht drin.
    expect(meta.ms).toBe(nachfrist(TEXT_CELLS) - CHORD_NACHLAUF_MS);
  });

  it("Sprachausgabe WÄHREND des Tippens (z. B. Alt+W liest den Text erneut) wird von ms abgezogen und als spokenMs gemeldet", () => {
    const onTask = vi.fn();
    render(
      <TextPanel
        text={TEXT}
        system="basis"
        eightDot={false}
        onRepeat={() => {}}
        onNext={null}
        onTask={onTask}
      />,
    );
    act(() => {
      vi.advanceTimersByTime(2000); // Denkpause vor dem ersten Anschlag
    });
    // Erste Haelfte des Textes sofort getippt ("am ").
    act(() => {
      for (const c of TEXT_CELLS.slice(0, 3)) tippeZelle(schreibfeld(), c);
    });
    // Jetzt liest die App den ganzen Text noch einmal vor (5 s) - mitten in
    // der Aufgabe, NACH dem ersten Anschlag.
    const sprichBeginn = Date.now();
    sprache.abschnitte = [[sprichBeginn, sprichBeginn + 5000]];
    act(() => {
      vi.advanceTimersByTime(5000); // die Ansage laeuft ab
    });
    act(() => {
      vi.advanceTimersByTime(1500); // echte Tippzeit danach, fuer den Rest
    });
    act(() => {
      for (const c of TEXT_CELLS.slice(3)) tippeZelle(schreibfeld(), c);
    });

    expect(onTask).toHaveBeenCalledTimes(1);
    const meta = onTask.mock.calls[0][1];
    // Rohe Zeit seit `begin()`: 5000 ms Ansage + 1500 ms echtes Tippen = 6500 ms.
    // spokenMs zieht genau die 5000 ms Ansage ab ⇒ 1500 ms faire Tippzeit.
    // Dazu die Nachfristen aller Zellen nach der ersten.
    expect(meta.spokenMs).toBe(5000);
    expect(meta.ms).toBe(1500 + nachfrist(TEXT_CELLS) - CHORD_NACHLAUF_MS);
  });

  it("Sprachausgabe VOR dem ersten Anschlag (die Text-Ansage beim Start der Aufgabe) veraendert weder ms noch spokenMs", () => {
    const onTask = vi.fn();
    render(
      <TextPanel
        text={TEXT}
        system="basis"
        eightDot={false}
        onRepeat={() => {}}
        onNext={null}
        onTask={onTask}
      />,
    );
    // Die Aufgaben-Ansage liest den GANZEN Text vor, bevor das Kind zu tippen
    // beginnt - genau der Regelfall bei „Text schreiben" (Diktat).
    sprache.abschnitte = [[T0, T0 + 4000]];
    act(() => {
      vi.advanceTimersByTime(4000); // die Ansage laeuft ab, noch kein Anschlag
    });
    act(() => {
      for (const c of TEXT_CELLS) tippeZelle(schreibfeld(), c);
    });

    expect(onTask).toHaveBeenCalledTimes(1);
    const meta = onTask.mock.calls[0][1];
    // Die Uhr startete erst NACH der Ansage (`begin()`) - `spokenAtStartRef`
    // faengt die schon verstrichene Ansage-Zeit ab. Weder ms noch spokenMs
    // duerfen die 4 s der Ansage zeigen.
    expect(meta.spokenMs).toBeUndefined();
    expect(meta.ms).toBe(nachfrist(TEXT_CELLS) - CHORD_NACHLAUF_MS);
  });
});

describe("TextReadPanel (Text lesen) - Vorlesezeit raus", () => {
  function antwortfeld(): HTMLElement {
    // `address` ist standardmaessig "sie" (LMS-Embed-Voreinstellung).
    return screen.getByLabelText("Ihre Lösung (ganzer Text):");
  }
  function pruefen() {
    fireEvent.click(screen.getByRole("button", { name: "Prüfen" }));
  }

  it("ohne Sprachausgabe: ms bleibt die rohe Zeit seit dem Mount, spokenMs bleibt leer", () => {
    const onTask = vi.fn();
    render(
      <TextReadPanel
        text={TEXT}
        system="basis"
        eightDot={false}
        onRepeat={() => {}}
        onNext={null}
        onTask={onTask}
      />,
    );
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    act(() => {
      fireEvent.change(antwortfeld(), { target: { value: TEXT } });
    });
    act(() => {
      pruefen();
    });

    expect(onTask).toHaveBeenCalledTimes(1);
    const meta = onTask.mock.calls[0][1];
    expect(meta.spokenMs).toBeUndefined();
    expect(meta.ms).toBe(3000);
  });

  it("die automatische Text-Ansage beim Mount wird von ms abgezogen und als spokenMs gemeldet", () => {
    const onTask = vi.fn();
    render(
      <TextReadPanel
        text={TEXT}
        system="basis"
        eightDot={false}
        onRepeat={() => {}}
        onNext={null}
        onTask={onTask}
      />,
    );
    // Die Uhr startet hier - anders als bei TextPanel - schon beim Mount, wie
    // bei ReadPanel: die Ansage des ganzen Textes beginnt im selben Moment.
    sprache.abschnitte = [[T0, T0 + 2500]];
    act(() => {
      vi.advanceTimersByTime(2500); // die Ansage laeuft ab
    });
    act(() => {
      vi.advanceTimersByTime(1800); // echte Zeit danach: lesen/tippen der Antwort
    });
    act(() => {
      fireEvent.change(antwortfeld(), { target: { value: TEXT } });
    });
    act(() => {
      pruefen();
    });

    expect(onTask).toHaveBeenCalledTimes(1);
    const meta = onTask.mock.calls[0][1];
    // Rohe Zeit seit Mount: 2500 ms Ansage + 1800 ms danach = 4300 ms.
    // spokenMs zieht genau die 2500 ms Ansage ab ⇒ 1800 ms faire Zeit.
    expect(meta.spokenMs).toBe(2500);
    expect(meta.ms).toBe(1800);
  });
});
