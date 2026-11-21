/**
 * ★★★ WAS DAS KIND VON DER WOCHENAUFGABE MERKT (07.09.2026).
 *
 * Eine Wochenaufgabe, die nur die Lehrkraft sieht, ist keine Aufgabe. Dieser
 * Wächter prüft darum die KINDER-Seite - dieselbe Einstellung, die im
 * Lehrkraft-Reiter gespeichert wird, wirkt hier.
 *
 * ⚠️ Dazu der Lernweg: Ohne Eintrag der Lehrkraft muss sich Punktgenau EXAKT
 * verhalten wie vorher. Eine neue Möglichkeit, die den Standardfall
 * verändert, ist keine Möglichkeit, sondern eine Änderung.
 */
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { Punktgenau } from "@/components/braille/Punktgenau";
import { emptyProgress } from "@/lib/braille/progress";
import type { BrailleClassSettings, TaskEvent } from "@/lib/braille";

afterEach(cleanup);

function heute(anzahl: number, minutenJe = 1): TaskEvent[] {
  return Array.from({ length: anzahl }, (_, i) => ({
    ts: Date.now() - (i + 1) * 60_000,
    level: "l1-reihe1",
    system: "basis",
    direction: "write" as const,
    correct: true,
    ms: minutenJe * 60_000,
    cells: 3,
  }));
}

function zeige(settings: BrailleClassSettings | null, events: TaskEvent[] = []) {
  render(
    <Punktgenau
      loadFn={() => emptyProgress()}
      saveFn={() => {}}
      classSettings={settings}
      accountId="k1"
      events={events}
    />,
  );
}

describe("Die Wochenaufgabe steht beim Kind", () => {
  it("★★★★ zeigt Auftrag und Stand über der Übung", () => {
    zeige(
      {
        punktgenau: {
          wochenaufgabe: { minuten: 0, aufgaben: 10, etappen: 0 },
        },
      },
      heute(4),
    );
    expect(screen.getByText("Wochenaufgabe")).toBeTruthy();
    expect(screen.getByText(/4 von 10 Aufgaben/)).toBeTruthy();
  });

  it("★★★ der eigene Eintrag eines Kindes schlägt den der Klasse", () => {
    zeige(
      {
        punktgenau: {
          wochenaufgabe: { minuten: 0, aufgaben: 10, etappen: 0 },
          kinder: { k1: { wochenaufgabe: { minuten: 0, aufgaben: 3, etappen: 0 } } },
        },
      },
      heute(4),
    );
    // Vier von drei sind mehr als genug - und das steht auch so da.
    expect(screen.getByText(/Wochenaufgabe geschafft/)).toBeTruthy();
    expect(screen.queryByText(/von 10 Aufgaben/)).toBeNull();
  });

  it("★★ ohne Wochenaufgabe steht dort gar nichts", () => {
    zeige({ punktgenau: { wochenaufgabe: { minuten: 0, aufgaben: 0, etappen: 0 } } });
    expect(screen.queryByText("Wochenaufgabe")).toBeNull();
  });
});

describe("Alle Kapitel sind offen (18.11.2026)", () => {
  function etappenAuswahl(): HTMLOptionElement[] {
    const feld = screen.getByRole("combobox", { name: /Kapitel/ }) as HTMLSelectElement;
    return [...feld.options];
  }

  it("★★★★★ ein Kind in der Klasse kann jedes Kapitel wählen - ohne Eintrag der Lehrkraft", () => {
    zeige(null);
    const optionen = etappenAuswahl();
    expect(optionen.length).toBeGreaterThan(5);
    expect(optionen.every((o) => !o.disabled)).toBe(true);
    expect(optionen.some((o) => o.textContent?.includes("gesperrt"))).toBe(false);
  });

  it("★★★★ der Lernweg bleibt: ein neues Kind startet trotzdem bei Etappe 1", () => {
    zeige(null);
    const feld = screen.getByRole("combobox", { name: /Kapitel/ }) as HTMLSelectElement;
    expect(feld.value).toBe("0");
  });
});
