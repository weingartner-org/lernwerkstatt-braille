/**
 * ★★★★★ DIE ÜBEZEIT-UHR WÄHREND DER ECHTEN OBERFLÄCHE (22.09.2026, zuletzt
 * Nacht - DECKEL).
 *
 * Bis zum 22.09.2026 (Nachmittag) trug jedes gemeldete `TaskEvent` ein Feld
 * `activeMs` (der grosszügige, pausentolerante Uhr-Zuwachs) - siehe die
 * Vorfassung dieser Datei. Johannes hat diese Rechnung NOCH AM SELBEN ABEND
 * verworfen: sie benachteiligte ein Kind, das eine Aufgabe auf der
 * Braillezeile TASTET, gegenüber einem, das sie sich VORLESEN lässt (volle
 * Begründung: `lib/braille/lesezeit.ts` Dateikopf). Von da an bis zur Nacht
 * trug KEIN Ereignis mehr ein Zusatzfeld.
 *
 * SEIT DER NACHT (Deckel, „zwei Anweisungen zusammengeführt") trägt ein
 * Ereignis `activeMs` WIEDER - diesmal aber die ECHTE, von der Tastenuhr
 * gemessene Tastenzeit (`meldeAufgabe`, `mitTastenzeit`), nicht mehr die
 * verworfene Pausentoleranz. Ohne angeschlossene Tastenuhr (so wie in den
 * meisten Tests dieser Datei: sie rendern `<Punktgenau>` direkt, nicht
 * `<PunktgenauPage>`, das über `useReichweiteApp` anschliesst) bleibt das
 * Feld unverändert unbesetzt - `mitTastenzeit` gibt das Ereignis dann
 * unangetastet zurück (siehe `lib/tastenuhr.ts`).
 *
 * Was unverändert gilt:
 *  · Die Uhr in der Kopfleiste läuft sichtbar WÄHREND einer offenen
 *    Aufgabe mit (nicht nur bei jeder Abgabe) - über den provisorischen
 *    Posten, den `beginneAufgabe()` bei jeder neu angesagten Aufgabe startet
 *    (`Punktgenau.tsx`, `announce`) und `meldeAufgabe` bei der Abgabe wieder
 *    durch die ECHTE, gerechnete (und ggf. gedeckelte) Zeit ersetzt.
 *
 * Getippt wird über die ECHTEN Punkt-Tasten (f d s / j k l, siehe
 * `tests/braille-chord.test.ts`) - der Soll-Text kommt aus `data-aufgabe`
 * (Bauart §13), die Soll-Zellen aus `textToCells` (derselben Engine, die auch
 * der Trainer benutzt) - unabhängig davon, welcher Buchstabe gerade dran ist.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Punktgenau } from "@/components/braille/Punktgenau";
import { CHORD_NACHLAUF_MS, cellDots, textToCells, type Cell } from "@/lib/braille";
import { resetUebeUhr, uebezeitMs } from "@/lib/braille/uebeUhr";
import { tastenuhrAnschliessen, tastenuhrZuruecksetzen } from "@/lib/tastenuhr";
import type { TrainerTaskEvent } from "@/components/braille/BrailleTrainer";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});
beforeEach(() => {
  resetUebeUhr();
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 8, 22, 9, 0, 0).getTime());
});

const DOT_KEY: Record<number, string> = {
  1: "KeyF",
  2: "KeyD",
  3: "KeyS",
  4: "KeyJ",
  5: "KeyK",
  6: "KeyL",
};

function feld(): HTMLElement {
  return screen.getByRole("textbox", { name: "Braille-Eingabefeld" });
}

/** Der Soll-Text der aktuellen Aufgabe, aus `data-aufgabe` (Bauart §13). */
function aktuellerPrompt(): string {
  const el = document.querySelector("[data-aufgabe]");
  if (!el) throw new Error("Keine Aufgabe im Dokument.");
  const attr = el.getAttribute("data-aufgabe") ?? "";
  const prompt = attr.replace(/^schreiben-/, "");
  if (prompt === attr) throw new Error(`Kein Schreib-Kasten: "${attr}"`);
  return prompt;
}

function tippeZelle(cell: Cell) {
  const el = feld();
  if (cell === 0) {
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

/** Tippt die AKTUELLE Aufgabe fehlerfrei fertig - egal, welcher Buchstabe
 *  gerade dran ist (Basisschrift, Grossschreibzeichen an - der Standard). */
function tippeAufgabeFertig() {
  const cells = textToCells(aktuellerPrompt(), {
    system: "basis",
    grossschreibzeichen: true,
  });
  for (const c of cells) tippeZelle(c);
}

describe("meldeAufgabe - activeMs ohne angeschlossene Tastenuhr", () => {
  it("ohne tastenuhrAnschliessen() bleibt ein gemeldetes Ereignis ohne activeMs", () => {
    const events: TrainerTaskEvent[] = [];
    render(<Punktgenau ohneKlasse onTask={(e) => events.push(e)} />);

    act(() => tippeAufgabeFertig());

    expect(events).toHaveLength(1);
    expect(events[0].activeMs).toBeUndefined();
    expect("activeMs" in events[0]).toBe(false);
  });
});

/**
 * ★★★★★ SEIT 22.09.2026 (Nacht, DECKEL): mit angeschlossener Tastenuhr trägt
 * das gemeldete Ereignis `activeMs` - UND die tickende Uhr in der Kopfleiste
 * rechnet damit dieselbe (ggf. gedeckelte) Zahl wie das, was `onTask`
 * meldet. Vorher wurde `activeMs` erst beim Speichern (`pbBackend.ts`)
 * angehängt - zu spät für die Uhr, die schon vorher rechnet
 * (`Punktgenau.tsx`, `meldeAufgabe`).
 */
describe("meldeAufgabe - activeMs MIT angeschlossener Tastenuhr (die Uhr zeigt dieselbe Zahl)", () => {
  afterEach(() => tastenuhrZuruecksetzen());

  it("ein gemeldetes Ereignis trägt activeMs, sobald die Tastenuhr angeschlossen ist", () => {
    const abhaengen = tastenuhrAnschliessen();
    try {
      const events: TrainerTaskEvent[] = [];
      render(<Punktgenau ohneKlasse onTask={(e) => events.push(e)} />);

      act(() => tippeAufgabeFertig());

      expect(events).toHaveLength(1);
      expect(typeof events[0].activeMs).toBe("number");
      // Selbst gelesen (kein spokenMs), sofort getippt: die faire
      // Bearbeitungszeit UND die echte Tastenzeit landen auf derselben Zahl.
      expect(uebezeitMs(Date.now())).toBe(events[0].ms);
    } finally {
      abhaengen();
    }
  });
});

describe("Übezeit-Uhr - läuft während einer offenen Aufgabe sichtbar mit", () => {
  it("★★★★★ tickt schon VOR der ersten Eingabe, nicht erst bei der Abgabe", () => {
    render(<Punktgenau ohneKlasse />);
    expect(uebezeitMs(Date.now())).toBe(0);

    // Drei Sekunden vergehen, bevor das Kind überhaupt zu tippen beginnt -
    // die neu angesagte Aufgabe hat den provisorischen Posten schon gestartet.
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(uebezeitMs(Date.now())).toBe(3000);
  });

  it("★★★★★ ersetzt bei Abgabe den provisorischen Posten durch die echte, gerechnete Zeit", () => {
    const events: TrainerTaskEvent[] = [];
    render(<Punktgenau ohneKlasse onTask={(e) => events.push(e)} />);

    act(() => {
      vi.advanceTimersByTime(3000); // Denkpause, während die Aufgabe offen ist
    });
    act(() => tippeAufgabeFertig()); // sofortige Eingabe danach, keine Sprachausgabe

    // Selbst gelesen (kein spokenMs): die Uhr zeigt genau die faire
    // Bearbeitungszeit des Ereignisses - keine Pause wurde extra addiert.
    expect(events[0].spokenMs).toBeUndefined();
    expect(uebezeitMs(Date.now())).toBe(events[0].ms);
  });

  it("★★★★★ zwei nacheinander gelöste Aufgaben summieren sich in der Uhr", () => {
    const events: TrainerTaskEvent[] = [];
    render(<Punktgenau ohneKlasse onTask={(e) => events.push(e)} />);

    act(() => tippeAufgabeFertig()); // Aufgabe 1, sofort
    act(() => {
      vi.advanceTimersByTime(650); // AUTO_NEXT_MS - nächste Aufgabe wird angesagt
    });
    act(() => tippeAufgabeFertig()); // Aufgabe 2, sofort

    expect(events).toHaveLength(2);
    const summe = events.reduce((s, e) => s + e.ms, 0);
    expect(uebezeitMs(Date.now())).toBe(summe);
  });
});
