/**
 * ★★★ DAS KLASSENMATCH AUF DEM BILDSCHIRM DES KINDES (Zubau 22.09.2026).
 *
 * Prüft `Punktgenau.tsx` + `BrailleKlassenmatchStarten.tsx`/`-Einladung.tsx`/
 * `-Lobby.tsx`/`-Ranking.tsx` gegen die Auftragslage:
 *  · Kind lädt Kind ein -> Einladung bei den anderen -> Warteraum, in
 *    Reihenfolge und mit lesbaren Zwischenständen.
 *  · Die Einladung bietet zwei gleichwertige Wege ("Bin dabei"/"Jetzt
 *    nicht"), kein Vorwurf, keine Rückfrage.
 *  · "Starten" geht erst, sobald mindestens ein weiteres Kind dabei ist.
 *  · Die Rangliste während des Laufs ist für die Sprachausgabe unsichtbar
 *    (`aria-hidden`) - geprüft direkt am Bauteil.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Punktgenau } from "@/components/braille/Punktgenau";
import { BrailleKlassenmatchRanking } from "@/components/braille/BrailleKlassenmatchRanking";
import { brailleBackend, _resetBrailleBackend } from "@/lib/braille/backend";
import type { BrailleAccount } from "@/lib/braille/account";
import type { RanglistenEintrag } from "@/lib/braille/klassenmatch";

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

async function klasseMitZweiKindern(code: string) {
  const be = brailleBackend();
  const t = await be.registerTeacher("Frau Berger", `berger-${code}@schule.at`, "geheim1");
  if (!t.ok) throw new Error(t.error);
  const c = await be.createClass(t.value.id, "3b", code);
  if (!c.ok) throw new Error(c.error);
  const s = await be.addPupil(code, "Sarah", "1234");
  if (!s.ok) throw new Error(s.error);
  const f = await be.addPupil(code, "Franz", "1234");
  if (!f.ok) throw new Error(f.error);
  return { be, teacher: t.value, klasse: c.value, sarah: s.value as BrailleAccount, franz: f.value as BrailleAccount };
}

describe("Klassenmatch - Bildschirm des Kindes", () => {
  it(`der Schalter „Klassenmatch" öffnet die Wahl von Arbeitsweise und Bereich`, async () => {
    const { klasse, sarah } = await klasseMitZweiKindern("3BKM1");
    const settings = await brailleBackend().getClassSettings(klasse.code);

    render(
      <Punktgenau account={sarah} accountId={sarah.id} classCode={klasse.code} classSettings={settings} />,
    );

    const knopf = await screen.findByRole("button", { name: /Klassenmatch/ });
    fireEvent.click(knopf);

    expect(await screen.findByText("Klassenmatch ausschreiben")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Einladen" })).toBeInTheDocument();
  });

  it(`Kind lädt Kind ein: die Einladung erreicht das andere Kind, „Bin dabei" führt in den Warteraum`, async () => {
    const { klasse, sarah, franz } = await klasseMitZweiKindern("3BKM2");
    const settings = await brailleBackend().getClassSettings(klasse.code);

    // Sarah schreibt eine Einladung aus.
    const einladung = await brailleBackend().erstelleMatch(sarah, "schreiben", "basis");
    expect(einladung).not.toBeNull();

    // Franz öffnet Punktgenau und sieht die Einladung.
    render(
      <Punktgenau account={franz} accountId={franz.id} classCode={klasse.code} classSettings={settings} />,
    );
    expect(await screen.findByText("Sarah lädt dich zu einem Klassenmatch ein.")).toBeInTheDocument();
    const dabei = screen.getByRole("button", { name: "Bin dabei" });
    const jetztNicht = screen.getByRole("button", { name: "Jetzt nicht" });
    expect(dabei).toBeInTheDocument();
    expect(jetztNicht).toBeInTheDocument();

    fireEvent.click(dabei);

    // Franz steht jetzt im Warteraum.
    expect(await screen.findByRole("heading", { name: /Klassenmatch/ })).toBeInTheDocument();
    // Die Zeile steht doppelt (sichtbar UND in der Live-Region), siehe unten.
    expect((await screen.findAllByText(/1 dabei: Franz/)).length).toBeGreaterThan(0);
  });

  it(`„Starten" geht erst, sobald ein weiteres Kind dabei ist`, async () => {
    const { klasse, sarah, franz } = await klasseMitZweiKindern("3BKM3");
    const settings = await brailleBackend().getClassSettings(klasse.code);

    const einladung = await brailleBackend().erstelleMatch(sarah, "schreiben", "basis");
    if (!einladung) throw new Error("Match nicht erstellt");

    render(
      <Punktgenau account={sarah} accountId={sarah.id} classCode={klasse.code} classSettings={settings} />,
    );

    // Die Zeile steht doppelt (sichtbar UND in der Live-Region für die
    // Sprachausgabe, siehe `BrailleKlassenmatchLobby.tsx`) - darum
    // `findAllByText`, nicht `findByText`.
    expect(
      (
        await screen.findAllByText(
          "Noch niemand dabei - die Einladung ist bei allen aus deiner Klasse, die Punktgenau gerade offen haben.",
        )
      ).length,
    ).toBeGreaterThan(0);
    expect(screen.getByText("„Starten\" geht, sobald jemand dabei ist.")).toBeInTheDocument();

    // Franz tritt (über das Backend, wie ein zweites Gerät) bei.
    await act(async () => {
      await brailleBackend().schreibeMatchStand(franz, einladung.id, "schreiben", "basis", {
        status: "dabei",
        lauf: { arbeitsweise: "schreiben", bereich: "basis", arbeitszeitMs: 0, ansageMs: 0, richtig: 0, falsch: 0 },
      });
    });

    expect((await screen.findAllByText(/1 dabei: Franz/)).length).toBeGreaterThan(0);
    expect(screen.queryByText("„Starten\" geht, sobald jemand dabei ist.")).not.toBeInTheDocument();
  });

  it(`„Jetzt nicht" lehnt ab, ohne Rückfrage, und die Einladung kommt nicht wieder`, async () => {
    const { klasse, sarah, franz } = await klasseMitZweiKindern("3BKM4");
    const settings = await brailleBackend().getClassSettings(klasse.code);
    await brailleBackend().erstelleMatch(sarah, "schreiben", "basis");

    render(
      <Punktgenau account={franz} accountId={franz.id} classCode={klasse.code} classSettings={settings} />,
    );
    const jetztNicht = await screen.findByRole("button", { name: "Jetzt nicht" });
    fireEvent.click(jetztNicht);

    // Kein Rückfrage-Dialog - das Fenster ist einfach zu, Franz übt normal weiter.
    expect(screen.queryByText("Sarah lädt dich zu einem Klassenmatch ein.")).not.toBeInTheDocument();
    await screen.findByText("Rang");
  });

  it("Klassenmatch ausgeschaltet: der Schalter fehlt, und einladen scheitert", async () => {
    const { be, teacher, klasse, sarah } = await klasseMitZweiKindern("3BKM5");
    await be.setKlassenmatchAus(teacher.id, klasse.code, true);
    const settings = await be.getClassSettings(klasse.code);

    render(
      <Punktgenau account={sarah} accountId={sarah.id} classCode={klasse.code} classSettings={settings} />,
    );

    await screen.findByText("Rang");
    expect(screen.queryByRole("button", { name: /Klassenmatch/ })).not.toBeInTheDocument();
  });
});

describe("Klassenmatch - Rangliste während des Laufs", () => {
  it("★★★★★ die Rangliste ist für die Sprachausgabe unsichtbar (aria-hidden)", () => {
    const liste: RanglistenEintrag[] = [
      {
        stand: {
          id: "s1",
          matchId: "m1",
          classCode: "3BKM9",
          pupilUid: "sarah",
          name: "Sarah",
          status: "schreibt",
          lauf: { arbeitsweise: "schreiben", bereich: "basis", arbeitszeitMs: 60_000, ansageMs: 0, richtig: 20, falsch: 1 },
          updatedMs: Date.now(),
        },
        platz: 1,
        wert: 80,
      },
      {
        stand: {
          id: "s2",
          matchId: "m1",
          classCode: "3BKM9",
          pupilUid: "franz",
          name: "Franz",
          status: "schreibt",
          lauf: { arbeitsweise: "schreiben", bereich: "basis", arbeitszeitMs: 60_000, ansageMs: 0, richtig: 10, falsch: 3 },
          updatedMs: Date.now(),
        },
        platz: 2,
        wert: 40,
      },
    ];

    const { container } = render(
      <BrailleKlassenmatchRanking liste={liste} eigeneUid="sarah" verstrichenMs={60_000} dauerMs={300_000} />,
    );

    const bereich = container.querySelector('[aria-hidden]');
    expect(bereich).not.toBeNull();
    // Die Namen stehen im Bild, aber der ganze Bereich bleibt der
    // Sprachausgabe verborgen - ein Platzwechsel wird nie gemeldet.
    expect(bereich?.textContent).toContain("Sarah");
    expect(bereich?.textContent).toContain("Franz");
  });
});
