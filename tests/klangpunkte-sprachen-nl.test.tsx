/**
 * Klangpunkte auf Niederländisch: Tonnamen do-re-mi, keine deutschen/englischen Wörter,
 * Lieder da. (Deutsch Byte für Byte: `klangpunkte-deutsch-unveraendert.test.tsx`.)
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

vi.mock("@/lib/typing/sound", () => ({ playBadgeSound: vi.fn(), playUnlockFanfare: vi.fn() }));

import { KlangpunktePage } from "@/features/public/KlangpunktePage";
import { Klangpunkte } from "@/components/klangpunkte/Klangpunkte";
import { KlangpunkteRunner } from "@/components/klangpunkte/KlangpunkteRunner";
import { KLANG_ETAPPEN, nextKlangTask } from "@/lib/klangpunkte/etappen";
import { KLANG_WELTEN } from "@/lib/klangpunkte/welten";
import { KLANG_BADGES } from "@/lib/klangpunkte/badges";
import { SONGS_NL, SONGS, aktuelleSongs } from "@/lib/klangpunkte/songs";
import * as N from "@/lib/klangpunkte/notation";
import { setzeKlangSprache, KlangSpracheProvider, KLANG_SPRACHEN_FERTIG } from "@/lib/klangpunkte/sprache";
import { emptyMastery } from "@/lib/braille/adaptive";
import { emptyKlangProgress } from "@/lib/klangpunkte/progress";
import { useVoice } from "@/lib/braille/voice";

/** Typische englische Wörter (ganze Wörter; "note", "rest", "bar" gibt es auch auf Niederländisch und fehlen deshalb). */
const ENGLISCH =
  /(the|and|you|your|listen|write|which|chapter|chapters|with|crotchet|quaver|sharp|flat|beats|tune|done|bar line)/i;

/** Typische deutsche Wörter der Klangpunkte-Texte (ganze Wörter). */
// "Pause" fehlt bewusst: das ist auch der italienische Plural von "pausa".
const DEUTSCH =
  /\b(und|nicht|oder|Aufgabe|Hör|hör|Takt|Viertel\w*|Achtel\w*|Kreuz|Oktave|Lied|Schreib|Welche|Zeichen|Klangwelt|Geschafft|Kapitel|Noten|Töne|Tonleiter|Auflösung\w*)\b/;

function suche(...ps: string[]) {
  window.history.replaceState(null, "", `/programme/klangpunkte?${ps.join("&")}`);
}

beforeEach(() => {
  let n = 0;
  vi.spyOn(Math, "random").mockImplementation(() => ((n = (n * 9301 + 49297) % 233280) / 233280));
  window.localStorage.clear();
  useVoice.setState({ enabled: false });
});
afterEach(() => {
  cleanup();
  setzeKlangSprache("de");
  vi.restoreAllMocks();
});

describe("Tonnamen und Wörter", () => {
  it("Buchstaben mit B als Standard, Notenwerte und Vorzeichen niederländisch", () => {
    setzeKlangSprache("nl");
    expect(N.standardNameStyle()).toBe("buchstaben");
    expect(N.toneName("c", "buchstaben")).toBe("C");
    expect(N.toneName("h", "buchstaben")).toBe("B");
    expect(N.toneName("c", "solmisation")).toBe("do");
    expect(N.VALUE_LABELS.viertel).toBe("kwartnoot");
    expect(N.VALUE_LABELS.achtel).toBe("achtste noot");
    expect(N.VALUE_LABELS.halbe).toBe("halve noot");
    expect(N.VALUE_LABELS.ganze).toBe("hele noot");
    expect(N.VALUE_LABELS.sechzehntel).toBe("zestiende noot");
    expect(N.ACCIDENTAL_LABELS.kreuz).toBe("kruis");
    expect(N.ACCIDENTAL_LABELS.be).toBe("mol");
    expect(N.REST_LABELS.viertel).toBe("kwartrust");
  });
  it("der Wähler bietet nl an; ?sprache=nl zeigt Niederländisch", () => {
    expect([...KLANG_SPRACHEN_FERTIG]).toContain("nl");
    suche("klangpunkte-sprachen=1", "sprache=nl");
    render(<MemoryRouter><KlangpunktePage /></MemoryRouter>);
    expect(N.VALUE_LABELS.viertel).toBe("kwartnoot");
  });
});

describe("Niederländisch ohne deutsche und englische Wörter", () => {
  it("Kapitelwahl und geöffnete Kapitel (Shell)", () => {
    suche("klangpunkte-sprachen=1", "sprache=nl");
    for (const id of [undefined, "kp1", "kp3", "kp-echo"]) {
      const { container, unmount } = render(
        <MemoryRouter>
          <KlangSpracheProvider>
            <Klangpunkte
              loadFn={() => ({ ...emptyKlangProgress(), lastPlace: id ? { kapitelId: id } : undefined })}
              saveFn={() => {}}
            />
          </KlangSpracheProvider>
        </MemoryRouter>,
      );
      const text = container.textContent ?? "";
      expect(text.length).toBeGreaterThan(50);
      const treffer = [...(text.match(new RegExp(DEUTSCH.source, "g")) ?? []), ...(text.match(new RegExp(ENGLISCH.source, "gi")) ?? [])];
      expect(treffer, `Shell ${id}`).toEqual([]);
      unmount();
    }
  });

  it("jedes Kapitel im Runner: keine deutschen Wörter, kein leerer Text", () => {
    suche("klangpunkte-sprachen=1", "sprache=nl");
    const schlecht: string[] = [];
    for (const e of KLANG_ETAPPEN) {
      const { container, unmount } = render(
        <KlangSpracheProvider>
          <KlangpunkteRunner
            etappe={e}
            initialMastery={emptyMastery()}
            onResult={() => {}}
            onNext={null}
            onProgress={() => {}}
            onAnnounce={() => {}}
          />
        </KlangSpracheProvider>,
      );
      const text = container.textContent ?? "";
      if (text.length < 20) schlecht.push(`${e.id}: leer`);
      const t = [...(text.match(new RegExp(DEUTSCH.source, "g")) ?? []), ...(text.match(new RegExp(ENGLISCH.source, "gi")) ?? [])];
      if (t.length) schlecht.push(`${e.id}: ${[...new Set(t)].join(",")}`);
      unmount();
    }
    expect(schlecht).toEqual([]);
  });

  it("Aufgaben aller Kapitel (Text, Antworten, Erklärung, Zeichenbeschriftung) in beiden Schreibweisen", () => {
    setzeKlangSprache("nl");
    const schlecht: string[] = [];
    for (const e of KLANG_ETAPPEN) {
      if (e.id === "kp14") continue;
      for (const stil of ["buchstaben", "solmisation"] as const) {
        for (let i = 0; i < 6; i++) {
          const t = nextKlangTask(e.id, stil, i % 2 === 1) as unknown as Record<string, unknown>;
          const alle = [t.prompt, t.explain, ...((t.choices as string[]) ?? []), ...((t.cellLabels as string[]) ?? [])]
            .filter(Boolean)
            .join(" | ");
          if (!String(t.prompt ?? "").trim()) schlecht.push(`${e.id}: Aufgabentext leer`);
          const m = [...(alle.match(new RegExp(DEUTSCH.source, "g")) ?? []), ...(alle.match(new RegExp(ENGLISCH.source, "gi")) ?? [])];
          if (m.length) schlecht.push(`${e.id}/${stil}: ${[...new Set(m)].join(",")} in "${alle.slice(0, 90)}"`);
        }
      }
    }
    expect([...new Set(schlecht)]).toEqual([]);
  });

  it("Welten, Abzeichen, Kapitel-Titel, Lieder", () => {
    setzeKlangSprache("nl");
    const alle: string[] = [];
    for (const w of KLANG_WELTEN)
      alle.push(w.title, w.blurb, ...w.etappen.flatMap((e) => [e.title, e.introDu, e.introSie, ...e.introducedUnits.map((u) => u.spoken)]));
    for (const b of KLANG_BADGES) alle.push(b.name, b.description);
    for (const s of SONGS_NL) alle.push(s.title, s.origin);
    expect(alle.every((x) => x.trim().length > 0)).toBe(true);
    const schlecht = alle.filter((x) => new RegExp(DEUTSCH.source).test(x) || new RegExp(ENGLISCH.source, "i").test(x));
    expect(schlecht).toEqual([]);
  });

  it("Lieder: niederländische Liste, gleiche Regale, gültige Melodien, aktuelleSongs", () => {
    expect(SONGS_NL.length).toBeGreaterThanOrEqual(13);
    expect(new Set(SONGS_NL.map((s) => s.id)).size).toBe(SONGS_NL.length);
    for (const s of SONGS_NL) expect(s.lines.every((l) => l.length > 0), s.id).toBe(true);
    expect(SONGS.length).toBe(21);
    for (const r of ["kinder", "erwachsene", "ausdruck"] as const) expect(SONGS_NL.some((s) => s.shelf === r)).toBe(true);
    expect(SONGS_NL.filter((s) => s.shelf !== "ausdruck").length).toBeGreaterThanOrEqual(4);
    setzeKlangSprache("nl");
    expect(aktuelleSongs()).toBe(SONGS_NL);
    setzeKlangSprache("de");
    expect(aktuelleSongs()).toBe(SONGS);
  });
});
