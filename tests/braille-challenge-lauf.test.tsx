/**
 * ★★★ DIE BRAILLE-CHALLENGE AUF DEM BILDSCHIRM DES KINDES (Zubau 22.09.2026).
 *
 * Prüft `Punktgenau.tsx` + `BrailleChallengeLauf.tsx` gegen die Auftragslage:
 *  · Die Startkarte hat Vorrang vor dem gewöhnlichen Üben und zeigt beide
 *    Wege ("Beginnen"/"Ich schreibe nicht mit") gleichwertig.
 *  · "verpasst" zeigt NICHTS - kein Vorhalt an ein Kind, das das
 *    Einstiegsfenster verpasst hat ([[feedback_nie_gegen_das_kind]]).
 *  · "Ich schreibe nicht mit" gibt sofort das gewöhnliche Üben frei.
 *  · Ohne geplante Challenge bleibt der Bildschirm unverändert (kein Zubau
 *    ohne Grund sichtbar).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Punktgenau } from "@/components/braille/Punktgenau";
import { brailleBackend, _resetBrailleBackend } from "@/lib/braille/backend";
import type { BrailleAccount } from "@/lib/braille/account";
import { neueChallengeId, type ChallengePlan } from "@/lib/braille/challenge";

const T0 = new Date(2026, 8, 22, 9, 0, 0).getTime();

beforeEach(() => {
  localStorage.clear();
  _resetBrailleBackend();
  vi.useFakeTimers({ shouldAdvanceTime: true });
  vi.setSystemTime(T0);
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  localStorage.clear();
  _resetBrailleBackend();
});

async function klasseMitKind(code: string) {
  const be = brailleBackend();
  const t = await be.registerTeacher("Frau Berger", `berger-${code}@schule.at`, "geheim1");
  if (!t.ok) throw new Error(t.error);
  const c = await be.createClass(t.value.id, "3b", code);
  if (!c.ok) throw new Error(c.error);
  const p = await be.addPupil(code, "Mara", "1234");
  if (!p.ok) throw new Error(p.error);
  return { be, teacher: t.value, klasse: c.value, kind: p.value as BrailleAccount };
}

describe("Braille-Challenge - Bildschirm des Kindes", () => {
  it("die Startkarte zeigt beide gleichwertigen Wege und hat Vorrang", async () => {
    const { teacher, klasse, kind } = await klasseMitKind("3BCH1");
    const plan: ChallengePlan = {
      id: neueChallengeId(T0),
      arbeitsweise: "schreiben",
      bereich: "basis",
      startMs: T0,
      dauerMin: 5,
      angelegtMs: T0,
    };
    const gesetzt = await brailleBackend().setChallengePlan(teacher.id, klasse.code, plan);
    expect(gesetzt.ok).toBe(true);
    const settings = await brailleBackend().getClassSettings(klasse.code);

    render(
      <Punktgenau account={kind} accountId={kind.id} classCode={klasse.code} classSettings={settings} />,
    );

    expect(await screen.findByText("Braille-Challenge")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Beginnen" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ich schreibe nicht mit" })).toBeInTheDocument();
    // Die Dauer steht da, lesbar, bevor irgendetwas läuft. ("Schreiben" und
    // "Basisschrift" stehen zusätzlich auch in der gewöhnlichen Kopfleiste -
    // die Dauer ist der eindeutige Beleg, dass die Plan-Angaben ankommen.)
    expect(screen.getByText("5 Minuten")).toBeInTheDocument();
  });

  it(`„verpasst" zeigt nichts - kein Vorhalt an ein Kind, das das Zeitfenster verpasst hat`, async () => {
    const { teacher, klasse, kind } = await klasseMitKind("3BCH2");
    // Start liegt 20 Minuten zurück, das Einstiegsfenster (10 Min) ist zu.
    const plan: ChallengePlan = {
      id: neueChallengeId(T0),
      arbeitsweise: "schreiben",
      bereich: "basis",
      startMs: T0 - 20 * 60_000,
      dauerMin: 5,
      angelegtMs: T0 - 20 * 60_000,
    };
    await brailleBackend().setChallengePlan(teacher.id, klasse.code, plan);
    const settings = await brailleBackend().getClassSettings(klasse.code);

    render(
      <Punktgenau account={kind} accountId={kind.id} classCode={klasse.code} classSettings={settings} />,
    );

    // Der Kopf/die Kopfleiste wird trotzdem geladen (Beweis, dass die Seite
    // normal steht) - nur die Challenge-Karte fehlt.
    await screen.findByText("Rang");
    expect(screen.queryByText("Braille-Challenge")).not.toBeInTheDocument();
  });

  it(`„Ich schreibe nicht mit" gibt sofort das gewöhnliche Üben frei`, async () => {
    const { teacher, klasse, kind } = await klasseMitKind("3BCH3");
    const plan: ChallengePlan = {
      id: neueChallengeId(T0),
      arbeitsweise: "schreiben",
      bereich: "basis",
      startMs: T0,
      dauerMin: 5,
      angelegtMs: T0,
    };
    await brailleBackend().setChallengePlan(teacher.id, klasse.code, plan);
    const settings = await brailleBackend().getClassSettings(klasse.code);

    render(
      <Punktgenau account={kind} accountId={kind.id} classCode={klasse.code} classSettings={settings} />,
    );

    const nichtMit = await screen.findByRole("button", { name: "Ich schreibe nicht mit" });
    fireEvent.click(nichtMit);

    expect(await screen.findByText(/Basisschrift/)).toBeInTheDocument();
    expect(screen.queryByText("Braille-Challenge")).not.toBeInTheDocument();
  });

  it("ohne geplante Challenge bleibt der Bildschirm unverändert", async () => {
    const { kind, klasse } = await klasseMitKind("3BCH4");
    const settings = await brailleBackend().getClassSettings(klasse.code);

    render(
      <Punktgenau account={kind} accountId={kind.id} classCode={klasse.code} classSettings={settings} />,
    );

    await screen.findByText("Rang");
    expect(screen.queryByText("Braille-Challenge")).not.toBeInTheDocument();
  });
});
