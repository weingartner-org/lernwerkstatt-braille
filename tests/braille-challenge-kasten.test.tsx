/**
 * WÄCHTER über den Kasten „Braille-Challenge" im Reiter „Punktgenau" von
 * „Meine Klassen" (22.09.2026, Zubau Lehrkraft-Bedienung).
 *
 * Geprüft wird die BEDIENUNG - nicht die reine Rechnung (die steht schon in
 * `tests/braille-challenge.test.ts`, `tests/braille-wertung.test.ts`):
 *  · Zugeklappt stehen die drei wichtigen Dinge trotzdem da (Arbeitsweise,
 *    Bereich, Minuten, „Jetzt starten") - Muster `SchreibprobeKasten.tsx`.
 *  · „Jetzt starten" schreibt einen `ChallengePlan` mit der gewählten
 *    Arbeitsweise über `backend.setChallengePlan` und legt den Fokus auf
 *    „läuft" (R1-R6, [[feedback_fokus_pflicht_alle_apps]]).
 *  · „… absagen" fragt zurück und nimmt die Runde zurück, ohne bereits
 *    abgegebene Ergebnisse zu löschen.
 *  · Die Ergebnistabelle zeigt „nicht angetreten" für ein Kind ohne Ergebnis -
 *    nie eine Wertung gegen das Kind ([[feedback_nie_gegen_das_kind]]).
 *  · Nichts wird je `disabled` (R5).
 */
import { oeffneLeiste } from "./klassenleiste-helfer";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PunktgenauReiter } from "@/components/lernwerkstatt/klasse/PunktgenauReiter";
import { brailleBackend, _resetBrailleBackend } from "@/lib/braille/backend";
import type { BrailleAccount } from "@/lib/braille";

const CODE = "3B-CH";

async function klasseMitKind(zweitesKind = false) {
  const be = brailleBackend();
  const t = await be.registerTeacher("Frau Berger", "berger-challenge@schule.at", "geheim1");
  if (!t.ok) throw new Error(t.error);
  const c = await be.createClass(t.value.id, "3b", CODE);
  if (!c.ok) throw new Error(c.error);
  const p = await be.addPupil(CODE, "Mara", "1234");
  if (!p.ok) throw new Error(p.error);
  const kinder: BrailleAccount[] = [p.value as BrailleAccount];
  if (zweitesKind) {
    const p2 = await be.addPupil(CODE, "Toprak", "1234");
    if (!p2.ok) throw new Error(p2.error);
    kinder.push(p2.value as BrailleAccount);
  }
  return { be, teacherId: t.value.id, kinder };
}

function nutzer() {
  return userEvent.setup({ delay: null, advanceTimers: vi.advanceTimersByTime });
}

beforeEach(() => {
  localStorage.clear();
  _resetBrailleBackend();
  vi.useFakeTimers({ shouldAdvanceTime: true });
  vi.setSystemTime(new Date(2026, 8, 22, 9, 0, 0).getTime()); // Dienstag, 09:00
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.useRealTimers();
  localStorage.clear();
  _resetBrailleBackend();
});

describe("Im Panel stehen die drei wichtigen Dinge sofort da", () => {
  it("zeigt Arbeitsweise, Bereich, Minuten und 'Jetzt starten' ohne weiteres Aufklappen", async () => {
    const { teacherId, kinder } = await klasseMitKind();
    render(<PunktgenauReiter classCode={CODE} teacherId={teacherId} pupils={kinder} />);
    oeffneLeiste("Braille-Challenge");
    await act(async () => {});

    const schalter = screen.getByRole("button", { name: "Braille-Challenge" });
    expect(schalter.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByLabelText("Arbeitsweise - Braille-Challenge: schreiben oder lesen")).toBeTruthy();
    expect(screen.getByLabelText("Schriftbereich - Braille-Challenge")).toBeTruthy();
    expect(screen.getByLabelText("Zeit je Kind (Minuten)")).toBeTruthy();
    const start = screen.getByRole("button", { name: "Jetzt starten" });
    expect(start.hasAttribute("disabled")).toBe(false); // R5: nie `disabled`
  });
});

describe("Jetzt starten", () => {
  it("★★★ speichert die gewählte Arbeitsweise und legt den Fokus auf 'läuft'", async () => {
    const { teacherId, kinder } = await klasseMitKind();
    const user = nutzer();
    render(<PunktgenauReiter classCode={CODE} teacherId={teacherId} pupils={kinder} />);
    oeffneLeiste("Braille-Challenge");
    await act(async () => {});

    await user.selectOptions(screen.getByLabelText("Arbeitsweise - Braille-Challenge: schreiben oder lesen"), "lesen");
    const dauer = screen.getByLabelText("Zeit je Kind (Minuten)");
    await user.clear(dauer);
    await user.type(dauer, "5");
    await user.click(screen.getByRole("button", { name: "Jetzt starten" }));

    await waitFor(() => expect(screen.getByText("läuft")).toBeTruthy());

    const settings = await brailleBackend().getClassSettings(CODE);
    expect(settings?.punktgenau?.challenge?.arbeitsweise).toBe("lesen");
    expect(settings?.punktgenau?.challenge?.dauerMin).toBe(5);
    expect(settings?.punktgenau?.challenge?.bereich).toBe("basis");

    // Fokus-Ziel: „läuft" - nicht der Seitenanfang.
    expect(document.activeElement?.textContent).toMatch(/läuft/);
  });

  it("eine zu kurze/lange Zeit wird abgewiesen - es wird nichts gespeichert", async () => {
    const { teacherId, kinder } = await klasseMitKind();
    const user = nutzer();
    render(<PunktgenauReiter classCode={CODE} teacherId={teacherId} pupils={kinder} />);
    oeffneLeiste("Braille-Challenge");
    await act(async () => {});

    const dauer = screen.getByLabelText("Zeit je Kind (Minuten)");
    await user.clear(dauer);
    await user.type(dauer, "999");
    await user.click(screen.getByRole("button", { name: "Jetzt starten" }));

    await waitFor(() =>
      expect(screen.getByText(/muss zwischen .* Minuten liegen/)).toBeTruthy(),
    );
    const settings = await brailleBackend().getClassSettings(CODE);
    expect(settings?.punktgenau?.challenge).toBeUndefined();
  });
});

describe("Absagen", () => {
  it("★★★ nimmt eine laufende Braille-Challenge nach Rückfrage zurück", async () => {
    const { teacherId, kinder } = await klasseMitKind();
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const user = nutzer();
    render(<PunktgenauReiter classCode={CODE} teacherId={teacherId} pupils={kinder} />);
    oeffneLeiste("Braille-Challenge");
    await act(async () => {});

    await user.click(screen.getByRole("button", { name: "Jetzt starten" }));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /Braille-Challenge absagen/ })).toBeTruthy(),
    );

    await user.click(screen.getByRole("button", { name: /Braille-Challenge absagen/ }));

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Jetzt starten" })).toBeTruthy(),
    );
    const settings = await brailleBackend().getClassSettings(CODE);
    expect(settings?.punktgenau?.challenge).toBeUndefined();
  });

  it("bei 'Abbrechen' der Rückfrage bleibt die Runde bestehen", async () => {
    const { teacherId, kinder } = await klasseMitKind();
    vi.spyOn(window, "confirm").mockReturnValue(false);
    const user = nutzer();
    render(<PunktgenauReiter classCode={CODE} teacherId={teacherId} pupils={kinder} />);
    oeffneLeiste("Braille-Challenge");
    await act(async () => {});

    await user.click(screen.getByRole("button", { name: "Jetzt starten" }));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /Braille-Challenge absagen/ })).toBeTruthy(),
    );
    await user.click(screen.getByRole("button", { name: /Braille-Challenge absagen/ }));

    const settings = await brailleBackend().getClassSettings(CODE);
    expect(settings?.punktgenau?.challenge).toBeTruthy();
  });
});

describe("Die Ergebnistabelle", () => {
  it("zeigt ein abgegebenes Ergebnis und 'nicht angetreten' für den Rest der Klasse - nie eine Wertung gegen ein Kind", async () => {
    const { be, teacherId, kinder } = await klasseMitKind(true);
    const user = nutzer();
    render(<PunktgenauReiter classCode={CODE} teacherId={teacherId} pupils={kinder} />);
    oeffneLeiste("Braille-Challenge");
    await act(async () => {});

    await user.click(screen.getByRole("button", { name: "Jetzt starten" }));
    await waitFor(() => expect(screen.getByText("läuft")).toBeTruthy());

    const settings = await be.getClassSettings(CODE);
    const plan = settings!.punktgenau!.challenge!;
    await be.meldeChallengeErgebnis({
      probeId: plan.id,
      pupilUid: kinder[0].id,
      teacherUid: teacherId,
      classCode: CODE,
      arbeitsweise: plan.arbeitsweise,
      bereich: plan.bereich,
      lauf: {
        arbeitsweise: plan.arbeitsweise,
        bereich: plan.bereich,
        arbeitszeitMs: 60_000,
        ansageMs: 0,
        richtig: 40,
        falsch: 2,
      },
      eingereichtMs: Date.now(),
    });

    // Der Kasten fragt Ergebnisse nur alle 45 s neu ab (NACHFRAGE_MS) -
    // ohne einen Vorlauf stünde noch der Stand von vor der Abgabe da.
    await act(async () => {
      vi.advanceTimersByTime(45_000);
    });

    // Das Panel ist schon offen (Leiste, `oeffneLeiste` oben).
    const tabelle = await waitFor(() =>
      screen.getByRole("table", { name: /Ergebnisse der Braille-Challenge/ }),
    );
    expect(within(tabelle).getByText("Mara")).toBeTruthy();
    expect(within(tabelle).getByText("Toprak")).toBeTruthy();
    expect(within(tabelle).getByText("nicht angetreten")).toBeTruthy();
  });
});
