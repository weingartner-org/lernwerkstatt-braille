/**
 * ★★★ "EIGENE ÜBUNG" AUF DEM BILDSCHIRM DES KINDES (Zubau 22.09.2026).
 *
 * Prüft `Punktgenau.tsx` + `BrailleEigeneUebungAnkuendigung.tsx`/
 * `BrailleEigeneUebungLauf.tsx` gegen die Auftragslage:
 *  · Die Lehrkraft weist eine Datei zu -> das Kind sieht zuerst die
 *    Ankündigung ("Weiter geht es mit einer Übung von deiner Lehrkraft"),
 *    NUR ein Knopf ("Weiter") - nichts zum Ablehnen.
 *  · Nach "Weiter" steht die Übung mit dem Dateinamen da.
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { Punktgenau } from "@/components/braille/Punktgenau";
import { brailleBackend, _resetBrailleBackend } from "@/lib/braille/backend";
import type { BrailleAccount } from "@/lib/braille/account";

beforeEach(() => {
  localStorage.clear();
  _resetBrailleBackend();
});

afterEach(() => {
  cleanup();
  localStorage.clear();
  _resetBrailleBackend();
});

async function klasseMitKind(code: string) {
  const be = brailleBackend();
  const t = await be.registerTeacher("Frau Berger", `berger-${code}@schule.at`, "geheim1");
  if (!t.ok) throw new Error(t.error);
  const c = await be.createClass(t.value.id, "3b", code);
  if (!c.ok) throw new Error(c.error);
  const p = await be.addPupil(code, "Toprak", "1234");
  if (!p.ok) throw new Error(p.error);
  return { be, teacher: t.value, klasse: c.value, kind: p.value as BrailleAccount };
}

describe("Eigene Übung - Bildschirm des Kindes", () => {
  it(`kündigt sich an - nur „Weiter", nichts zum Ablehnen`, async () => {
    const { be, teacher, klasse, kind } = await klasseMitKind("3BEU1");
    const r = await be.starteEigeneUebung(klasse.code, teacher.id, {
      dateiname: "Waldtiere.txt",
      arbeitsweise: "schreiben",
      bereich: "basis",
      zeilen: ["Der Fuchs läuft schnell.", "Der Igel schläft im Winter."],
    });
    expect(r).not.toBeNull();
    const settings = await be.getClassSettings(klasse.code);

    render(
      <Punktgenau account={kind} accountId={kind.id} classCode={klasse.code} classSettings={settings} />,
    );

    expect(
      await screen.findByText("Weiter geht es mit einer Übung von deiner Lehrkraft."),
    ).toBeInTheDocument();

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByRole("button", { name: "Weiter" })).toBeInTheDocument();
    // Keine zweite Auskunft zum Ablehnen - der Auftrag ist wörtlich: "Kinder
    // können nur auf 'Weiter' klicken, nicht ablehnen."
    expect(within(dialog).queryByText(/ablehnen|nicht jetzt|später/i)).not.toBeInTheDocument();
  });

  it(`nach „Weiter" steht die zugewiesene Übung mit ihrem Dateinamen da`, async () => {
    const { be, teacher, klasse, kind } = await klasseMitKind("3BEU2");
    await be.starteEigeneUebung(klasse.code, teacher.id, {
      dateiname: "Waldtiere.txt",
      arbeitsweise: "schreiben",
      bereich: "basis",
      zeilen: ["Der Fuchs läuft schnell."],
    });
    const settings = await be.getClassSettings(klasse.code);

    render(
      <Punktgenau account={kind} accountId={kind.id} classCode={klasse.code} classSettings={settings} />,
    );

    const weiter = await screen.findByRole("button", { name: "Weiter" });
    fireEvent.click(weiter);

    expect(await screen.findByText(/Eigene Übung/)).toBeInTheDocument();
    expect(screen.getByText(/Waldtiere\.txt/)).toBeInTheDocument();
  });

  it("ohne zugewiesene Übung bleibt der Bildschirm unverändert", async () => {
    const { kind, klasse } = await klasseMitKind("3BEU3");
    const settings = await brailleBackend().getClassSettings(klasse.code);

    render(
      <Punktgenau account={kind} accountId={kind.id} classCode={klasse.code} classSettings={settings} />,
    );

    await screen.findByText("Rang");
    expect(screen.queryByText(/Übung von deiner Lehrkraft/)).not.toBeInTheDocument();
  });
});
