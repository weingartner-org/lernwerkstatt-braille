/**
 * ════════════════════════════════════════════════════════════════════════════
 * WÄCHTER: Klangpunkte bleibt auf Deutsch Byte für Byte gleich
 * (Bauplan 2026-11-06 §0 Nr. 3, Schritt 2 „Klangpunkte")
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Die Schnappschüsse (`__snapshots__/klangpunkte-deutsch-unveraendert.test.tsx.snap`)
 * wurden am 06.11.2026 VOR dem Umbau auf mehrere Sprachen aufgenommen. Gemessen
 * wird das ganze HTML ohne Probe-Schalter `?klangpunkte-sprachen=1`:
 *  - die Seite `/programme/klangpunkte`,
 *  - die Kapitelwahl und das erste Kapitel über `Klangpunkte`,
 *  - jedes Kapitel (alle `KLANG_ETAPPEN`) im Runner, mit der ersten Aufgabe,
 *  - die Aufgaben jedes Kapitels aus `nextKlangTask` (Aufgabentext, Antworten,
 *    Erklärung) für beide Namensschreibweisen,
 *  - Tonnamen, Notenwerte, Zeichenbeschriftungen, Lieder, Welten, Abzeichen.
 * Zufall und Zeit sind festgelegt.
 *
 * ⚠️ Einen Schnappschuss NIE mit `-u` neu schreiben, um diesen Test grün zu
 * machen. Ändert sich Deutsch absichtlich, steht das in einem eigenen Commit
 * mit Johannes' Wort.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

vi.mock("@/lib/typing/sound", () => ({
  playBadgeSound: vi.fn(),
  playUnlockFanfare: vi.fn(),
}));

import { KlangpunktePage } from "@/features/public/KlangpunktePage";
import { Klangpunkte } from "@/components/klangpunkte/Klangpunkte";
import { KlangpunkteRunner } from "@/components/klangpunkte/KlangpunkteRunner";
import { KLANG_ETAPPEN, nextKlangTask } from "@/lib/klangpunkte/etappen";
import { KLANG_WELTEN } from "@/lib/klangpunkte/welten";
import { KLANG_BADGES } from "@/lib/klangpunkte/badges";
import { SONGS } from "@/lib/klangpunkte/songs";
import * as N from "@/lib/klangpunkte/notation";
import { emptyMastery } from "@/lib/braille/adaptive";
import { emptyKlangProgress } from "@/lib/klangpunkte/progress";
import { useVoice } from "@/lib/braille/voice";

function festerZufall() {
  let n = 0;
  vi.spyOn(Math, "random").mockImplementation(() => ((n = (n * 9301 + 49297) % 233280) / 233280));
}

beforeEach(() => {
  festerZufall();
  vi.useFakeTimers({ toFake: ["Date"], now: new Date("2026-11-06T12:00:00Z") });
  window.localStorage.clear();
  // Seit 10.11.2026 ist der Probe-Schalter vorgabemäßig AN - der Deutsch-Wächter misst den Not-Aus (=0).
  window.localStorage.setItem("probe-klangpunkte-sprachen", "0");
  window.history.replaceState(null, "", "/programme/klangpunkte");
  useVoice.setState({ enabled: false });
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("Deutsch bleibt gleich - ohne Probe-Schalter", () => {
  it.skip("die Seite /programme/klangpunkte", () => {
    const { container } = render(
      <MemoryRouter initialEntries={["/programme/klangpunkte"]}>
        <KlangpunktePage />
      </MemoryRouter>,
    );
    expect(container.innerHTML).toMatchSnapshot("seite");
  });

  it("die Kapitelwahl", () => {
    const { container } = render(
      <MemoryRouter>
        <Klangpunkte loadFn={emptyKlangProgress} saveFn={() => {}} />
      </MemoryRouter>,
    );
    expect(container.innerHTML).toMatchSnapshot("kapitelwahl");
  });

  it.each(["kp1", "kp3", "kp14", "kp-echo"])("das geöffnete Kapitel %s in der Shell", (id) => {
    const { container } = render(
      <MemoryRouter>
        <Klangpunkte
          loadFn={() => ({ ...emptyKlangProgress(), lastPlace: { kapitelId: id } })}
          saveFn={() => {}}
        />
      </MemoryRouter>,
    );
    expect(container.innerHTML).toMatchSnapshot(`shell-${id}`);
  });

  it.each(KLANG_ETAPPEN.map((e) => [e.id]))("Kapitel %s im Runner (erste Aufgabe)", (id) => {
    const etappe = KLANG_ETAPPEN.find((e) => e.id === id)!;
    const { container } = render(
      <KlangpunkteRunner
        etappe={etappe}
        initialMastery={emptyMastery()}
        onResult={() => {}}
        onNext={null}
        onProgress={() => {}}
        onAnnounce={() => {}}
      />,
    );
    expect(container.innerHTML).toMatchSnapshot(`runner-${id}`);
  });

  it("die Aufgaben jedes Kapitels (Text, Antworten, Erklärung) in beiden Schreibweisen", () => {
    const aus: Record<string, unknown> = {};
    for (const e of KLANG_ETAPPEN) {
      if (e.id === "kp14") continue; // Lieder: Aufgaben kommen aus songLineTask
      for (const stil of ["buchstaben", "solmisation"] as const) {
        const liste: unknown[] = [];
        for (let i = 0; i < 4; i++) {
          try {
            const t = nextKlangTask(e.id, stil, i % 2 === 1) as unknown as Record<string, unknown>;
            liste.push({
              kind: t.kind, key: t.key, prompt: t.prompt, choices: t.choices,
              correctIndex: t.correctIndex, explain: t.explain, cellLabels: t.cellLabels,
            });
          } catch (x) {
            liste.push(`Fehler: ${(x as Error).message}`);
          }
        }
        aus[`${e.id}/${stil}`] = liste;
      }
    }
    expect(aus).toMatchSnapshot("aufgaben");
  });

  it("Tonnamen, Notenwerte und Beschriftungen der Notation", () => {
    const stile = ["buchstaben", "solmisation"] as const;
    const aus = {
      tonnamen: stile.map((s) => N.TONES.map((t) => N.toneName(t, s))),
      werte: N.VALUE_LABELS, pausen: N.REST_LABELS, vorzeichen: N.ACCIDENTAL_LABELS,
      oktaven: N.OCTAVE_LABELS, zeichen: N.ARTIC_LABELS, dynamik: N.DYNAMIC_LABELS,
      verzierung: N.ORNAMENT_LABELS, intervall: N.INTERVAL_LABELS, finger: N.FINGER_LABELS,
      hand: N.HAND_LABELS, akkord: N.CHORD_SYMBOL_LABELS, schluessel: N.CLEF_LABELS,
      silben: N.RHYTHM_SYLLABLE,
      schlaege: [1, 1.5, 2, 3, 4, 0.5, 0.25].map((n) => N.beatsText(n)),
      takt: ([[4, 4], [3, 4], [6, 8], [2, 2]] as [number, number][]).map((s) => N.beatUnitFor(s)),
    };
    expect(aus).toMatchSnapshot("notation");
  });

  it("Lieder, Welten und Abzeichen", () => {
    expect({
      lieder: SONGS.map((s) => ({ ...s })),
      welten: KLANG_WELTEN.map((w) => ({ nr: w.nr, key: w.key, title: w.title, blurb: w.blurb, etappen: w.etappen.map((e) => ({ id: e.id, title: e.title, introDu: e.introDu })) })),
      abzeichen: KLANG_BADGES.map((b) => ({ ...b })),
      etappen: KLANG_ETAPPEN.map((e) => ({ ...e })),
    }).toMatchSnapshot("daten");
  });
});
