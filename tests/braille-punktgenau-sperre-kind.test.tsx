/**
 * ★★★★★ „STUNDE GESPERRT" WIRKT AUCH BEIM KIND (22.09.2026, Lücke 3 - „eine
 * Übezeit statt zwei").
 *
 * Befund: Die Lehrkraft konnte eine Unterrichtsstunde sperren
 * (`PunktgenauReiter.tsx`), `wochenstand()` (`wochenaufgabe.ts`) nimmt den
 * `gesperrt`-Parameter seit kurzem entgegen und klammert Ereignisse darin für
 * die Wochenaufgabe aus - aber `Punktgenau.tsx` (die Kind-Seite) reichte
 * nichts durch. Die Lehrkraft sperrte, das Kind sah trotzdem den vollen Stand.
 *
 * Dieser Wächter prüft die Kind-Seite direkt:
 *  · Die Sperrliste lädt über das schon vorhandene `holeGesperrteZeitenStand()`
 *    (`lib/braille/sperre.ts`), DASSELBE Feld wie im Lehrkraft-Reiter
 *    (`tt_classes.gesperrteZeiten`, geteilt mit Tastenflow).
 *  · ★ Der EN10-Fehler aus dem Vorbild (`useGesperrteZeitenStand`) darf sich
 *    nicht wiederholen: Direkt nach dem Rendern (kein Tick vergangen, die
 *    Antwort ist noch nicht da) steht die Wochenaufgabe GENAU so da wie vor
 *    dieser Änderung überall (keine Sperre bekannt = keine Ausklammerung) -
 *    nichts wird als „ungesperrt" FESTGESCHRIEBEN, es ist nur der normale
 *    Anfangszustand einer noch ladenden Anzeige.
 *  · Erst mit der echten Antwort ändert sich das Bild: Aufgaben, die WÄHREND
 *    der gesperrten Stunde geschrieben wurden, zählen für die Wochenaufgabe
 *    nicht mehr mit.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, render, screen } from "@testing-library/react";
import { Punktgenau } from "@/components/braille/Punktgenau";
import { emptyProgress } from "@/lib/braille/progress";
import type { BrailleClassSettings, TaskEvent } from "@/lib/braille";
import { createClass, registerTeacher } from "@/lib/typing/account";
import { typingBackend } from "@/lib/typing/backend";

const CODE = "3B";
let T0 = 0;

beforeEach(async () => {
  localStorage.clear();
  // ★ Wie im Vorbild (`tests/braille-sperre-reiter.test.tsx`): `shouldAdvanceTime`,
  // sonst tickt unter `vi.useFakeTimers()` nichts, und ein `await` liefe in
  // den Test-Timeout.
  vi.useFakeTimers({ shouldAdvanceTime: true });
  T0 = new Date(2026, 8, 22, 9, 0, 0).getTime(); // Dienstag, 09:00
  vi.setSystemTime(T0);

  const teacher = registerTeacher(
    "Frau Beispiel",
    "lehrkraft-sperre-kind@beispiel.at",
    "geheim1",
  );
  if (!teacher.ok) throw new Error(teacher.error);
  const cls = createClass(teacher.value.id, "Klasse 3B", CODE);
  if (!cls.ok) throw new Error(cls.error);

  // Die Stunde ist JETZT schon gesperrt (60 Minuten) - genau der Zustand, in
  // dem ein Kind die Seite öffnet, während die Lehrkraft schon gesperrt hat.
  const gesperrteKlasse = await typingBackend().stundeSperren(CODE);
  if (!gesperrteKlasse) throw new Error("Sperren fehlgeschlagen");
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

/** `anzahl` Aufgaben, alle WÄHREND der gesperrten Stunde (ab `T0`). */
function heute(anzahl: number): TaskEvent[] {
  return Array.from({ length: anzahl }, (_, i) => ({
    ts: T0 + (i + 1) * 60_000,
    level: "l1-reihe1",
    system: "basis",
    direction: "write" as const,
    correct: true,
    ms: 60_000,
    cells: 3,
  }));
}

const SETTINGS: BrailleClassSettings = {
  punktgenau: { wochenaufgabe: { minuten: 0, aufgaben: 10, etappen: 0 } },
};

function zeige(events: TaskEvent[]) {
  render(
    <Punktgenau
      loadFn={() => emptyProgress()}
      saveFn={() => {}}
      classSettings={SETTINGS}
      accountId="k1"
      classCode={CODE}
      events={events}
    />,
  );
}

describe("Stunde gesperrt wirkt auch beim Kind", () => {
  it("★★★★★ vor dem Laden zählt der übliche Anfangsstand, danach klammert die Sperre die vier Aufgaben aus", async () => {
    zeige(heute(4));

    // Direkt nach dem Rendern ist noch kein Mikrotask vergangen - die
    // Sperrliste ist noch nicht da. Der Stand zählt darum unverändert alle
    // vier Aufgaben (GENAU der Zustand, den es vor dieser Änderung überall
    // gab - keine Verschlechterung, nichts wird „ungesperrt" festgeschrieben).
    expect(screen.getByText(/4 von 10 Aufgaben/)).toBeTruthy();

    // Die echte Antwort trifft ein.
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    // Jetzt zählt die Sperre: alle vier Aufgaben lagen in der gesperrten
    // Stunde, die Wochenaufgabe steht bei null.
    expect(screen.getByText(/0 von 10 Aufgaben/)).toBeTruthy();
    expect(screen.queryByText(/4 von 10 Aufgaben/)).toBeNull();
  });

  it("Aufgaben AUSSERHALB der gesperrten Stunde zählen unverändert", async () => {
    // Eine Aufgabe eine Stunde VOR der Sperre - liegt nicht im Sperrzeitraum.
    const vorher: TaskEvent = {
      ts: T0 - 3_600_000,
      level: "l1-reihe1",
      system: "basis",
      direction: "write",
      correct: true,
      ms: 60_000,
      cells: 3,
    };
    zeige([vorher, ...heute(2)]);

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    // Zwei der drei Aufgaben lagen in der gesperrten Stunde, eine nicht.
    expect(screen.getByText(/1 von 10 Aufgaben/)).toBeTruthy();
  });

  it("ohne Klassencode (Selbstlernende/Gäste) gibt es nichts zu laden - keine Sperre möglich", async () => {
    render(
      <Punktgenau
        loadFn={() => emptyProgress()}
        saveFn={() => {}}
        classSettings={SETTINGS}
        accountId="k1"
        events={heute(4)}
        ohneKlasse
      />,
    );
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(screen.getByText(/4 von 10 Aufgaben/)).toBeTruthy();
  });
});
