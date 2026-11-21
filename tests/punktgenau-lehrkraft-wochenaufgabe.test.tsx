/**
 * ★★★ DER LEHRKRAFT-REITER VON PUNKTGENAU (07.09.2026).
 *
 * Auftrag Johannes: mehr Statistik, Wochenaufgaben wie in Tastenflow, und
 * Etappen einzeln freischalten können.
 *
 * Geprüft wird, was eine Lehrkraft tatsächlich tut - eintragen, speichern,
 * ablesen - und dabei besonders das, was beim Bauen leicht danebengeht:
 *
 *  · Der Reiter ist SOFORT bedienbar. (Ein `if (lädt) return <p>…` war schon
 *    einmal drin: Wer nur ein Häkchen umlegen will, wartete auf Zahlen, die er
 *    nicht braucht - und für eine Sprachausgabe wird dabei der ganze Baum
 *    ausgetauscht, der Fokus fällt auf `<body>`.)
 *  · Gespeichert wird der PLAN, nicht ein neues Einstellungs-Objekt: Was
 *    andere Programme in denselben Topf gelegt haben, bleibt stehen.
 *  · Die Zahlen der Tabelle sind gerechnet, nicht geraten.
 */
import { oeffneLeiste } from "./klassenleiste-helfer";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { PunktgenauReiter } from "@/components/lernwerkstatt/klasse/PunktgenauReiter";
import { brailleBackend } from "@/lib/braille/backend";
import type { BrailleAccount, BrailleClass, TaskEvent } from "@/lib/braille";
import { emptyProgress } from "@/lib/braille/progress";
import { buildAreas, etappeRunId } from "@/lib/braille/areas";

const BASIS = buildAreas()[0];

const KINDER: BrailleAccount[] = [
  { id: "k1", role: "schueler", name: "Mia", classCode: "3B", createdAt: 0 },
  { id: "k2", role: "schueler", name: "Noah", classCode: "3B", createdAt: 0 },
];

const KLASSE: BrailleClass = {
  code: "3B",
  name: "3B",
  teacherId: "t1",
  createdAt: 0,
};

/** Aufgaben, die HEUTE (also in dieser Woche) gelöst wurden. */
function heute(anzahl: number, minutenJe = 1): TaskEvent[] {
  return Array.from({ length: anzahl }, (_, i) => ({
    ts: Date.now() - (i + 1) * 60_000,
    level: etappeRunId(BASIS.etappen[0]),
    system: "basis",
    direction: i % 2 === 0 ? ("write" as const) : ("read" as const),
    correct: i !== 0, // eine falsch, damit die Treffsicherheit nicht 100 % ist
    ms: minutenJe * 60_000,
    cells: 3,
  }));
}

let gespeichert: Record<string, unknown> | null = null;

beforeEach(() => {
  gespeichert = null;
  const b = brailleBackend();
  vi.spyOn(b, "getClassSettings").mockResolvedValue({});
  vi.spyOn(b, "getProgress").mockImplementation(async (id: string) => ({
    ...emptyProgress(),
    xp: id === "k1" ? 120 : 10,
    gemeistertAm: id === "k1" ? { [etappeRunId(BASIS.etappen[0])]: Date.now() } : {},
    levels:
      id === "k1"
        ? { [etappeRunId(BASIS.etappen[0])]: { completed: true, bestStars: 3, attempts: 7 } }
        : {},
  }));
  vi.spyOn(b, "getEvents").mockImplementation(async (id: string) =>
    id === "k1" ? heute(6, 2) : [],
  );
  vi.spyOn(b, "updateClassSettings").mockImplementation(async (_t, _c, s) => {
    gespeichert = s as Record<string, unknown>;
    return { ok: true as const, value: KLASSE };
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function zeige(panel: string = "Wochenaufgabe") {
  render(
    <PunktgenauReiter
      classCode="3B"
      teacherId="t1"
      pupils={KINDER}
    />,
  );
  // Seit 20.10.2026 hinter den Schaltern der Leiste (wie Tastenflow).
  oeffneLeiste(panel);
}

describe("Der Reiter ist sofort bedienbar", () => {
  it("★★★ zeigt die Wochenaufgabe-Felder, ohne auf den Stand der Kinder zu warten", () => {
    zeige();
    // Kein await: Die Felder stehen im ersten Rendern da.
    expect(screen.getByLabelText("Minuten je Woche")).toBeTruthy();
    expect(screen.getByLabelText("Aufgaben je Woche")).toBeTruthy();
    expect(screen.getByLabelText("Etappen je Woche")).toBeTruthy();
  });

  it("sagt in der Tabelle, dass die Zahlen noch kommen", () => {
    zeige();
    expect(screen.getByText(/Stand der Kinder wird geladen/)).toBeTruthy();
  });
});

describe("Wochenaufgabe eintragen", () => {
  it("★★★★ speichert den Plan - und nur den Plan", async () => {
    zeige();
    fireEvent.change(screen.getByLabelText("Aufgaben je Woche"), {
      target: { value: "12" },
    });
    await act(async () => {
      fireEvent.click(screen.getAllByRole("button", { name: "Wochenaufgabe speichern" })[0]);
    });

    await waitFor(() => expect(gespeichert).not.toBeNull());
    // Der Plan steht in seinem eigenen Unterobjekt - der gemeinsame Topf
    // bekommt nur diesen einen Schlüssel dazu.
    expect(gespeichert).toEqual({
      punktgenau: { wochenaufgabe: { minuten: 0, aufgaben: 12, etappen: 0 } },
    });
  });

  it("★★ ein Druck ohne Änderung wird nicht still verschluckt, sondern gesagt", async () => {
    zeige();
    const knopf = screen.getAllByRole("button", { name: "Wochenaufgabe speichern" })[0];
    // Bauart §14/R5: nie `disabled` - der Knopf bleibt fokussierbar.
    expect(knopf.hasAttribute("disabled")).toBe(false);
    expect(knopf.getAttribute("aria-disabled")).toBe("true");

    await act(async () => {
      fireEvent.click(knopf);
    });

    expect(gespeichert).toBeNull();
    expect(screen.getByRole("status").textContent).toMatch(/nichts geändert/);
  });
});

describe("Die gespeicherte Aufgabe steht in den Feldern", () => {
  it("★★★★ übernimmt, was nach dem ersten Aufbau nachgeladen wird", async () => {
    // Gemessen am 07.09.2026 IM BROWSER: Die Einstellungen der Klasse kommen
    // später als die Felder. `useState` merkt sich den ersten Wert für immer -
    // auf dem Schirm stand „0 / 0 / 0“, obwohl der Klasse „30 / 25 / 1“
    // hinterlegt war. Wer darauf gespeichert hätte, hätte die Wochenaufgabe
    // mit drei Nullen überschrieben, ohne zu ahnen, dass es je eine gab.
    vi.spyOn(brailleBackend(), "getClassSettings").mockResolvedValue({
      punktgenau: { wochenaufgabe: { minuten: 30, aufgaben: 25, etappen: 1 } },
    });
    zeige();
    // Erster Aufbau: noch leer - die Einstellungen sind unterwegs.
    expect((screen.getByLabelText("Minuten je Woche") as HTMLInputElement).value).toBe("0");

    await waitFor(() =>
      expect((screen.getByLabelText("Minuten je Woche") as HTMLInputElement).value).toBe("30"),
    );
    expect((screen.getByLabelText("Aufgaben je Woche") as HTMLInputElement).value).toBe("25");
    expect((screen.getByLabelText("Etappen je Woche") as HTMLInputElement).value).toBe("1");
    // Und nichts gilt als geändert - sonst hielte die Lehrkraft den geladenen
    // Stand für eine ungespeicherte Eingabe.
    expect(
      screen.getAllByRole("button", { name: "Wochenaufgabe speichern" })[0]
        .getAttribute("aria-disabled"),
    ).toBe("true");
  });

  it("★★★★ nach dem Speichern steht in den Feldern, was eingetragen wurde", async () => {
    // Das ist der Weg über die ZWEITE Antwort: Speichern ändert die
    // Einstellungen, der Abgleich läuft ein zweites Mal. Er darf die Eingabe
    // dann nicht mehr anfassen (siehe die Abwägung im Quelltext).
    zeige();
    fireEvent.change(screen.getByLabelText("Minuten je Woche"), {
      target: { value: "45" },
    });
    await act(async () => {
      fireEvent.click(
        screen.getAllByRole("button", { name: "Wochenaufgabe speichern" })[0],
      );
    });

    await waitFor(() => expect(gespeichert).not.toBeNull());
    expect((screen.getByLabelText("Minuten je Woche") as HTMLInputElement).value).toBe("45");
    // Und der Knopf meldet wieder „nichts geändert" - es ist ja gespeichert.
    await waitFor(() =>
      expect(
        screen
          .getAllByRole("button", { name: "Wochenaufgabe speichern" })[0]
          .getAttribute("aria-disabled"),
      ).toBe("true"),
    );
  });

});

/*
  ⚠️ 08.09.2026: HIER STAND `describe("Etappen freischalten")`.

  Er prüfte den `FreigabeEditor` - die Oberfläche des zweiten Kastens. Beide
  Kästen sind einer geworden (Johannes: „die zwei kästen sollen einer
  werden"), der Editor ist gelöscht, und was er konnte, prüfen jetzt zwei
  Dateien genauer als vorher:

    tests/lektions-freigabe-ui.test.tsx   der EINE Kasten am Bildschirm,
                                          für alle vier Programme
    tests/braille-freigabe.test.ts        die REGEL - inklusive der Fälle,
                                          die es vorher nicht gab
                                          („nicht dran", Kind sticht Klasse)

  Ersatzlos gestrichen wäre falsch gewesen; hierher gehört er nicht mehr.
*/

describe("Die Zahlen der Tabelle", () => {
  it("★★★ rechnet Übezeit, Aufgaben und Treffsicherheit aus den Ereignissen", async () => {
    zeige();
    // Mia: 6 Aufgaben zu je 2 Minuten = 12 Minuten, 5 davon richtig = 83 %.
    await screen.findAllByText("12 min");
    const zeile = screen.getByRole("row", { name: /Mia/ });
    expect(zeile.textContent).toContain("6");
    expect(zeile.textContent).toContain("83 %");
    // Noah hat nichts geübt - dort steht ein Strich, keine erfundene Null.
    const noah = screen.getByRole("row", { name: /Noah/ });
    expect(noah.textContent).toContain("-");
  });

  it("★★ zählt gemeisterte Etappen über alle Bereiche", async () => {
    zeige();
    await screen.findAllByText("12 min");
    const alle = buildAreas().reduce((n, a) => n + a.etappen.length, 0);
    expect(screen.getByRole("row", { name: /Mia/ }).textContent).toContain(`1/${alle}`);
  });

  it("★★ der Überblick summiert die Klasse", async () => {
    zeige();
    await screen.findAllByText("12 min");
    // „Übezeit“ steht zweimal: als Kennzahl im Überblick (<dt>) und als
    // Spaltenkopf der Tabelle. Gemeint ist hier die Kennzahl.
    const kennzahl = screen
      .getAllByText("Übezeit")
      .find((el) => el.tagName === "DT");
    expect(kennzahl?.parentElement?.textContent).toContain("12 min");
  });
});

// ★ Johannes 18.09.2026 - Punktgenau startet wie Tastenflow auf „Schuljahr".
describe(`★ Die Tabelle öffnet auf „Schuljahr", nicht auf „Woche"`, () => {
  it(`„Schuljahr" ist beim ersten Rendern gedrückt, „Woche" nicht`, () => {
    zeige();
    expect(
      screen.getByRole("button", { name: /^Schuljahr \d{4}\/\d{2}$/ }).getAttribute("aria-pressed"),
    ).toBe("true");
    expect(screen.getByRole("button", { name: "Woche" }).getAttribute("aria-pressed")).toBe(
      "false",
    );
  });
});

describe("Alle Kapitel sind offen (18.11.2026)", () => {
  it("★★★★ die Verwaltung bietet weder „Kapitel freischalten“ noch „Etappen frei wählbar“ an", () => {
    zeige();
    expect(screen.queryByText(/Kapitel freischalten/)).toBeNull();
    expect(screen.queryByText(/Etappen frei wählbar/)).toBeNull();
  });
});
