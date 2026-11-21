/**
 * ★★★ DER KNOPF „STUNDE SPERREN" IM PUNKTGENAU-REITER (22.09.2026).
 *
 * Prüft die OBERFLÄCHE (die reine Rechnung steht in `tests/braille-sperre.test.ts`):
 *  · Der Knopf ist SOFORT da, ohne auf den Kinder-Stand zu warten.
 *  · Ein Druck sperrt 60 Minuten - über `typingBackend()`, DASSELBE Feld
 *    (`tt_classes.gesperrteZeiten`), das auch der Reiter „Tastenflow" schreibt
 *    ([[project_ordner_je_app]], siehe `lib/braille/sperre.ts` Dateikopf).
 *  · Läuft schon eine Sperre - egal ob von hier oder „von Tastenflow"
 *    gestartet -, zeigt der Knopf „Gesperrt bis …" und hebt sie auf, statt
 *    eine zweite zu beginnen.
 *  · Der Hinweis nennt IMMER beide Programme, damit keine Lehrkraft überrascht
 *    wird ([[feedback_nie_gegen_das_kind]]: der Text spricht über die
 *    Unterrichtsstunde, nie über ein Kind).
 *  · Nichts wird je `disabled` (R5, [[feedback_fokus_pflicht_alle_apps]]).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { PunktgenauReiter } from "@/components/lernwerkstatt/klasse/PunktgenauReiter";
import { brailleBackend } from "@/lib/braille/backend";
import type { BrailleAccount } from "@/lib/braille";
import { emptyProgress } from "@/lib/braille/progress";
import { createClass, getClass, registerTeacher } from "@/lib/typing/account";
import { typingBackend } from "@/lib/typing/backend";

const CODE = "3B";

const KINDER: BrailleAccount[] = [
  { id: "k1", role: "schueler", name: "Mia", classCode: CODE, createdAt: 0 },
];

let teacherId = "";

beforeEach(() => {
  localStorage.clear();
  // ★ Wie im Vorbild (`tastenflow-wochenziel-anzeige.test.tsx`):
  // `shouldAdvanceTime`, sonst tickt unter `vi.useFakeTimers()` nichts, und
  // ein `await`/`waitFor` liefe in den Test-Timeout.
  vi.useFakeTimers({ shouldAdvanceTime: true });
  vi.setSystemTime(new Date(2026, 8, 22, 9, 0, 0).getTime()); // Dienstag, 09:00

  // Die Klasse existiert auf der TYPING-Seite (`tt_classes`, geteilt mit
  // Tastenflow) - genau dort schreibt/liest `sperre.ts` über `typingBackend()`.
  const teacher = registerTeacher("Frau Beispiel", "lehrkraft-sperre@beispiel.at", "geheim1");
  if (!teacher.ok) throw new Error(teacher.error);
  teacherId = teacher.value.id;
  const cls = createClass(teacherId, "3B", CODE);
  if (!cls.ok) throw new Error(cls.error);

  // Punktgenaus EIGENE Braille-Einstellungen (getrennter lokaler Speicher) -
  // hier nur gemockt, sie sind für diesen Wächter nicht das Thema.
  const b = brailleBackend();
  vi.spyOn(b, "getClassSettings").mockResolvedValue({});
  vi.spyOn(b, "getProgress").mockResolvedValue(emptyProgress());
  vi.spyOn(b, "getEvents").mockResolvedValue([]);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

function zeige() {
  render(<PunktgenauReiter classCode={CODE} teacherId={teacherId} pupils={KINDER} />);
}

describe("Der Knopf ist sofort da", () => {
  it("★★★ steht schon im ersten Rendern, ohne auf den Kinder-Stand zu warten", async () => {
    zeige();
    const knopf = screen.getByRole("button", { name: "Stunde sperren" });
    expect(knopf).toBeTruthy();
    expect(knopf.hasAttribute("disabled")).toBe(false); // R5: nie `disabled`
    // Nichts wird geprüft, was von hier ab noch käme - dieser Tick räumt nur
    // die Sperr-Ladeantwort weg, damit sie keinem SPÄTEREN Test dazwischenfunkt.
    await act(async () => {});
  });

  it("nennt in seinem Hinweis IMMER beide Programme, nie ein Kind", async () => {
    zeige();
    await act(async () => {});
    const knopf = screen.getByRole("button", { name: "Stunde sperren" });
    const hinweisId = knopf.getAttribute("aria-describedby");
    expect(hinweisId).toBeTruthy();
    const hinweis = document.getElementById(hinweisId!);
    expect(hinweis?.textContent).toMatch(/Tastenflow/);
    expect(hinweis?.textContent).toMatch(/Punktgenau/);
    expect(hinweis?.textContent).not.toMatch(/Kind|Schüler/);
    // Seit 20.10.2026 (Leiste wie Tastenflow) steht kein Dauer-Satz mehr daneben -
    // der Hinweis am Schalter ist die einzige Auskunft.
  });
});

describe("Eine Stunde sperren", () => {
  it("★★★★ schreibt auf `tt_classes.gesperrteZeiten` - dasselbe Feld wie Tastenflow", async () => {
    zeige();
    const vorDemKlick = Date.now();
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Stunde sperren" }));
    });

    const cls = getClass(CODE);
    expect(cls?.gesperrteZeiten?.length).toBe(1);
    const zeitraum = cls!.gesperrteZeiten![0];
    // ★ `shouldAdvanceTime` lässt die Systemzeit während des `await` echt
    // weiterlaufen - der Zeitraum beginnt darum irgendwann ZWISCHEN dem Klick
    // und dieser Prüfung, nicht exakt bei einem der beiden Zeitpunkte.
    expect(zeitraum.abMs).toBeGreaterThanOrEqual(vorDemKlick);
    expect(zeitraum.abMs).toBeLessThanOrEqual(Date.now());
    expect(zeitraum.bisMs - zeitraum.abMs).toBe(60 * 60_000); // 60 Minuten

    // Der Knopf zeigt jetzt „Gesperrt bis …" - Fokus-Ziel bleibt derselbe
    // Knopf (nichts wird ausgehängt).
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /^Gesperrt bis \d{2}:\d{2} - aufheben$/ })),
    );
    expect(screen.getByRole("status").textContent).toMatch(/Tastenflow.*Punktgenau|Punktgenau.*Tastenflow/);
  });

  it("★★★★ eine SCHON LAUFENDE Sperre (\"von Tastenflow gestartet\") wird angezeigt, nicht verdoppelt", async () => {
    // Genau das tut `TastenflowReiter` beim Druck auf seinen eigenen Knopf -
    // hier direkt über `typingBackend()` nachgebaut, ohne den fremden Reiter
    // zu laden (der ist nicht mein Revier).
    await typingBackend().stundeSperren(CODE);
    const vorher = getClass(CODE)!.gesperrteZeiten!;
    expect(vorher.length).toBe(1);

    zeige();
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /^Gesperrt bis \d{2}:\d{2} - aufheben$/ })),
    );
    // Ein Druck HEBT AUF, statt eine zweite Sperre zu beginnen.
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /^Gesperrt bis/ }));
    });
    const nachher = getClass(CODE)!.gesperrteZeiten!;
    expect(nachher.length).toBe(1); // keine zweite entstanden
    expect(nachher[0].bisMs).toBeLessThanOrEqual(Date.now());
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Stunde sperren" })).toBeTruthy(),
    );
  });

  it("aufheben meldet es in der Statuszeile - für beide Programme", async () => {
    await typingBackend().stundeSperren(CODE);
    zeige();
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /^Gesperrt bis/ })),
    );
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /^Gesperrt bis/ }));
    });
    await waitFor(() =>
      expect(screen.getByRole("status").textContent).toMatch(/Sperre aufgehoben/),
    );
    expect(screen.getByRole("status").textContent).toMatch(/Tastenflow/);
    expect(screen.getByRole("status").textContent).toMatch(/Punktgenau/);
  });
});
