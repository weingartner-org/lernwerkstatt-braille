/**
 * Klangpunkte in mehreren Sprachen (Bauplan 2026-11-06 §3, Schritt 2 Teil 1):
 * Tonnamen-Tabelle für alle 12 Sprachen, Englisch ohne deutsche Wörter,
 * Schalter aus = Deutsch, Wähler bietet nur fertige Sprachen an.
 * (Dass Deutsch Byte für Byte gleich bleibt, misst
 * `klangpunkte-deutsch-unveraendert.test.tsx`.)
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup, screen, act, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

vi.mock("@/lib/typing/sound", () => ({ playBadgeSound: vi.fn(), playUnlockFanfare: vi.fn() }));

import { KlangpunktePage } from "@/features/public/KlangpunktePage";
import { Klangpunkte } from "@/components/klangpunkte/Klangpunkte";
import { KlangpunkteRunner } from "@/components/klangpunkte/KlangpunkteRunner";
import { KLANG_ETAPPEN, nextKlangTask } from "@/lib/klangpunkte/etappen";
import { KLANG_WELTEN } from "@/lib/klangpunkte/welten";
import { KLANG_BADGES } from "@/lib/klangpunkte/badges";
import { SONGS_EN, SONGS, aktuelleSongs } from "@/lib/klangpunkte/songs";
import { SONGS_FR } from "@/lib/klangpunkte/songs";
import { STIMME_HINWEIS } from "@/lib/klangpunkte/texte/stimmeHinweis";
import * as N from "@/lib/klangpunkte/notation";
import { KLANG_SPRACHEN_PLAN, TONNAMEN, TON_SCHLUESSEL, WERT_SCHLUESSEL } from "@/lib/klangpunkte/tonnamen";
import { setzeKlangSprache, KlangSpracheProvider, KLANG_SPRACHEN_FERTIG } from "@/lib/klangpunkte/sprache";
import { emptyMastery } from "@/lib/braille/adaptive";
import { emptyKlangProgress } from "@/lib/klangpunkte/progress";
import { useVoice } from "@/lib/braille/voice";

/** Typische deutsche Wörter der Klangpunkte-Texte (ganze Wörter). */
const DEUTSCH =
  /\b(und|nicht|oder|Aufgabe|Hör|hör|Takt|Viertel\w*|Achtel\w*|Kreuz|Oktave|Pause|Lied|Schreib|Welche|Zeichen|Klangwelt|Geschafft|Kapitel|Noten|Töne|Tonleiter|Auflösung\w*)\b/;

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

describe("Tonnamen-Tabelle", () => {
  it("alle 12 Sprachen des Plans, jede vollständig", () => {
    expect([...KLANG_SPRACHEN_PLAN].sort()).toEqual(["br", "cs", "de", "en", "es", "fr", "hu", "it", "nl", "pl", "pt", "sv"]);
    for (const s of KLANG_SPRACHEN_PLAN) {
      const t = TONNAMEN[s];
      for (const k of TON_SCHLUESSEL) {
        expect(t.buchstaben[k], `${s} Buchstabe ${k}`).toBeTruthy();
        expect(t.solmisation[k], `${s} Solmisation ${k}`).toBeTruthy();
      }
      for (const w of WERT_SCHLUESSEL) {
        expect(t.noten[w], `${s} Note ${w}`).toBeTruthy();
        expect(t.pausen[w], `${s} Pause ${w}`).toBeTruthy();
      }
      for (const v of Object.values(t.vorzeichen)) expect(v).toBeTruthy();
      for (const [k, v] of Object.entries(t.begriffe)) expect(v, `${s} Begriff ${k}`).toBeTruthy();
    }
  });
  it("Systeme: H-Sprachen de cs pl hu sv, B-Sprachen en nl, do-re-mi fr es it pt br", () => {
    for (const s of ["de", "cs", "pl", "hu", "sv"] as const) expect(TONNAMEN[s].buchstaben.h.toLowerCase()).toBe("h");
    for (const s of ["en", "nl"] as const) expect(TONNAMEN[s].buchstaben.h).toBe("B");
    for (const s of ["fr", "es", "it", "pt", "br"] as const) expect(TONNAMEN[s].standardStil).toBe("solmisation");
  });
  it("Englisch: britische Notenwerte und Tonnamen", () => {
    setzeKlangSprache("en");
    expect(N.toneName("h", "buchstaben")).toBe("B");
    expect(N.toneName("c", "solmisation")).toBe("do");
    expect(N.VALUE_LABELS.viertel).toBe("crotchet");
    expect(N.VALUE_LABELS.achtel).toBe("quaver");
    expect(N.ACCIDENTAL_LABELS.kreuz).toBe("sharp");
    expect(N.REST_LABELS.halbe).toBe("minim rest");
  });
});

describe("Schalter aus = Deutsch", () => {
  it("mit Not-Aus (=0) bleibt die Sprache Deutsch, auch mit ?sprache=en", () => {
    suche("klangpunkte-sprachen=0", "sprache=en");
    render(<MemoryRouter><KlangpunktePage /></MemoryRouter>);
    expect(N.VALUE_LABELS.viertel).toBe("Viertelnote");
    expect(N.toneName("h", "buchstaben")).toBe("h");
    expect(document.querySelector("[data-sprachschalter]")).toBeNull(); // Not-Aus: kein Sprachwähler
  });
  it("der Wähler bietet nur fertige Sprachen an", () => {
    expect([...KLANG_SPRACHEN_FERTIG].slice(0, 2)).toEqual(["de", "en"]);
    suche("klangpunkte-sprachen=1", "sprache=ro"); // ro ist noch nicht fertig -> Deutsch (pl ist seit 07.11.2026 fertig)
    render(<MemoryRouter><KlangpunktePage /></MemoryRouter>);
    // Der Sprachwähler der Kopfzeile (Weltkugel): aufklappen, jede fertige Sprache ist ein Eintrag.
    fireEvent.click(document.querySelector("[data-sprachschalter]")!);
    expect(screen.getAllByRole("option")).toHaveLength(KLANG_SPRACHEN_FERTIG.length);
    expect(N.VALUE_LABELS.viertel).toBe("Viertelnote");
  });
  it("mit Schalter und ?sprache=en: Tonnamen und Wörter englisch", () => {
    suche("klangpunkte-sprachen=1", "sprache=en");
    render(<MemoryRouter><KlangpunktePage /></MemoryRouter>);
    expect(N.VALUE_LABELS.viertel).toBe("crotchet");
    expect(document.querySelector("[data-sprachschalter]")).toBeInTheDocument();
  });
});

describe("Englisch ohne deutsche Wörter", () => {
  it("★ der Sprachwähler der Kopfzeile schaltet wirklich um (Meldung 10.11.2026: er tat nichts)", () => {
    suche("klangpunkte-sprachen=1");
    render(<MemoryRouter><KlangpunktePage /></MemoryRouter>);
    expect(N.VALUE_LABELS.viertel).toBe("Viertelnote");
    fireEvent.click(document.querySelector("[data-sprachschalter]")!);
    fireEvent.click(screen.getAllByRole("option").find((o) => /English/.test(o.textContent ?? ""))!);
    expect(N.VALUE_LABELS.viertel).not.toBe("Viertelnote");
    expect(window.localStorage.getItem("klangpunkte-sprache")).toBe("en");
  });
  it("Kapitelwahl und geöffnete Kapitel (Shell)", () => {
    suche("klangpunkte-sprachen=1", "sprache=en");
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
      const treffer = text.match(new RegExp(DEUTSCH.source, "g")) ?? [];
      expect(treffer, `Shell ${id}`).toEqual([]);
      unmount();
    }
  });

  it("jedes Kapitel im Runner: keine deutschen Wörter, kein leerer Text", () => {
    suche("klangpunkte-sprachen=1", "sprache=en");
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
      const t = text.match(new RegExp(DEUTSCH.source, "g"));
      if (t) schlecht.push(`${e.id}: ${[...new Set(t)].join(",")}`);
      unmount();
    }
    expect(schlecht).toEqual([]);
  });

  it("Aufgaben aller Kapitel (Text, Antworten, Erklärung, Zeichenbeschriftung) in beiden Schreibweisen", () => {
    setzeKlangSprache("en");
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
          const m = alle.match(new RegExp(DEUTSCH.source, "g"));
          if (m) schlecht.push(`${e.id}/${stil}: ${[...new Set(m)].join(",")} in "${alle.slice(0, 90)}"`);
        }
      }
    }
    expect([...new Set(schlecht)]).toEqual([]);
  });

  it("Welten, Abzeichen, Kapitel-Titel, Lieder", () => {
    setzeKlangSprache("en");
    const alle: string[] = [];
    for (const w of KLANG_WELTEN)
      alle.push(w.title, w.blurb, ...w.etappen.flatMap((e) => [e.title, e.introDu, e.introSie, ...e.introducedUnits.map((u) => u.spoken)]));
    for (const b of KLANG_BADGES) alle.push(b.name, b.description);
    for (const s of SONGS_EN) alle.push(s.title, s.origin);
    expect(alle.every((x) => x.trim().length > 0)).toBe(true);
    const schlecht = alle.filter((x) => new RegExp(DEUTSCH.source).test(x));
    expect(schlecht).toEqual([]);
  });

  it("Lieder: englische Liste, gleiche Regale, gültige Melodien", () => {
    expect(SONGS_EN.length).toBeGreaterThanOrEqual(19);
    expect(new Set(SONGS_EN.map((s) => s.id)).size).toBe(SONGS_EN.length);
    for (const s of SONGS_EN) expect(s.lines.every((l) => l.length > 0), s.id).toBe(true);
    expect(SONGS.length).toBe(21);
    for (const r of ["kinder", "erwachsene", "ausdruck"] as const) expect(SONGS_EN.some((s) => s.shelf === r)).toBe(true);
  });
});

// ─── Französisch (fr) ──────────────────────────────────────────────────────────────────────────
/** Deutsche und englische Schlüsselwörter, die in französischen Texten nie vorkommen dürfen. */
const FREMD_FR =
  /\b(und|nicht|oder|Aufgabe|Hör|hör|Takt|Viertel\w*|Achtel\w*|Kreuz|Oktave|Lied|Schreib|Welche|Zeichen|Klangwelt|Geschafft|Kapitel|Noten|Töne|Tonleiter|Auflösung\w*|and|Write|Listen|crotchet|quaver|sharp|flat|Which|Done|Next|Back)\b/;

describe("Französisch (fr)", () => {
  it("Tonnamen do-ré-mi, Notenwerte und Vorzeichen auf Französisch", () => {
    setzeKlangSprache("fr");
    expect((["c", "d", "e", "f", "g", "a", "h"] as const).map((k) => N.toneName(k, "solmisation")).join("-")).toBe("do-ré-mi-fa-sol-la-si");
    expect(N.VALUE_LABELS.viertel).toBe("noire");
    expect(N.VALUE_LABELS.achtel).toBe("croche");
    expect(N.VALUE_LABELS.sechzehntel).toBe("double croche");
    expect(N.ACCIDENTAL_LABELS.kreuz).toBe("dièse");
    expect(N.ACCIDENTAL_LABELS.be).toBe("bémol");
    expect(N.ACCIDENTAL_LABELS.aufloesung).toBe("bécarre");
    expect(N.REST_LABELS.viertel).toBe("soupir");
    expect(N.standardNameStyle()).toBe("solmisation");
  });

  it("Schalter an und ?sprache=fr: der Wähler bietet fr an, Wörter französisch", () => {
    suche("klangpunkte-sprachen=1", "sprache=fr");
    render(<MemoryRouter><KlangpunktePage /></MemoryRouter>);
    expect(KLANG_SPRACHEN_FERTIG).toContain("fr");
    expect(N.VALUE_LABELS.viertel).toBe("noire");
    fireEvent.click(document.querySelector("[data-sprachschalter]")!);
    expect(screen.getAllByRole("option").some((o) => /Français/.test(o.textContent ?? ""))).toBe(true);
  });

  it("Kapitelwahl und geöffnete Kapitel (Shell): keine deutschen/englischen Wörter", () => {
    suche("klangpunkte-sprachen=1", "sprache=fr");
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
      expect(text.match(new RegExp(FREMD_FR.source, "g")) ?? [], `Shell ${id}`).toEqual([]);
      unmount();
    }
  });

  it("jedes Kapitel im Runner: keine fremden Wörter, kein leerer Text", () => {
    suche("klangpunkte-sprachen=1", "sprache=fr");
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
      const t = text.match(new RegExp(FREMD_FR.source, "g"));
      if (t) schlecht.push(`${e.id}: ${[...new Set(t)].join(",")}`);
      unmount();
    }
    expect(schlecht).toEqual([]);
  });

  it("Aufgaben aller Kapitel in beiden Schreibweisen: französisch, Tonnamen do ré mi", () => {
    setzeKlangSprache("fr");
    const schlecht: string[] = [];
    let echo = "";
    for (const e of KLANG_ETAPPEN) {
      if (e.id === "kp14") continue;
      for (const stil of ["buchstaben", "solmisation"] as const) {
        for (let i = 0; i < 6; i++) {
          const t = nextKlangTask(e.id, stil, i % 2 === 1) as unknown as Record<string, unknown>;
          const alle = [t.prompt, t.explain, ...((t.choices as string[]) ?? []), ...((t.cellLabels as string[]) ?? [])]
            .filter(Boolean)
            .join(" | ");
          if (!String(t.prompt ?? "").trim()) schlecht.push(`${e.id}: Aufgabentext leer`);
          const m = alle.match(new RegExp(FREMD_FR.source, "g"));
          if (m) schlecht.push(`${e.id}/${stil}: ${[...new Set(m)].join(",")} in "${alle.slice(0, 90)}"`);
          if (e.id === "kp-echo") echo += String(t.prompt);
        }
      }
    }
    expect([...new Set(schlecht)]).toEqual([]);
    expect(echo).toContain("do ré mi fa sol la si");
  });

  it("Welten, Abzeichen, Kapitel-Titel, Lieder: französisch und nicht leer", () => {
    setzeKlangSprache("fr");
    const alle: string[] = [];
    for (const w of KLANG_WELTEN)
      alle.push(w.title, w.blurb, ...w.etappen.flatMap((e) => [e.title, e.introDu, e.introSie, ...e.introducedUnits.map((u) => u.spoken)]));
    for (const b of KLANG_BADGES) alle.push(b.name, b.description);
    for (const s of SONGS_FR) alle.push(s.title, s.origin);
    expect(alle.every((x) => x.trim().length > 0)).toBe(true);
    expect(alle.filter((x) => new RegExp(FREMD_FR.source).test(x))).toEqual([]);
    expect(KLANG_WELTEN[0].title).toBe("Oreilles fines");
  });

  it("Lieder: französische Liste, alle drei Regale, gültige Melodien", () => {
    expect(SONGS_FR.length).toBeGreaterThanOrEqual(15);
    expect(new Set(SONGS_FR.map((s) => s.id)).size).toBe(SONGS_FR.length);
    for (const s of SONGS_FR) expect(s.lines.every((l) => l.length > 0), s.id).toBe(true);
    for (const r of ["kinder", "erwachsene", "ausdruck"] as const) expect(SONGS_FR.some((s) => s.shelf === r)).toBe(true);
    setzeKlangSprache("fr");
    expect(aktuelleSongs()).toBe(SONGS_FR);
    setzeKlangSprache("de");
    expect(aktuelleSongs()).toBe(SONGS);
    expect(SONGS.length).toBe(21);
  });
});

// ─── Hinweis „keine Stimme" (alle 12 Sprachen; Anzeige in Klangpunkte) ─────────────────────────
describe("Hinweis, wenn für die Sprache keine Stimme installiert ist", () => {
  const stimme = (lang: string) =>
    ({ lang, name: "Test " + lang, default: false, localService: true, voiceURI: lang }) as SpeechSynthesisVoice;
  function setzeStimmen(liste: SpeechSynthesisVoice[]) {
    Object.defineProperty(window, "speechSynthesis", {
      configurable: true,
      value: {
        getVoices: () => liste,
        addEventListener: () => {},
        removeEventListener: () => {},
        cancel: () => {},
        speak: () => {},
        speaking: false,
        pending: false,
      },
    });
  }
  function zeige(sprache: string) {
    suche("klangpunkte-sprachen=1", `sprache=${sprache}`);
    return render(
      <MemoryRouter>
        <KlangSpracheProvider>
          <Klangpunkte loadFn={() => emptyKlangProgress()} saveFn={() => {}} />
        </KlangSpracheProvider>
      </MemoryRouter>,
    );
  }
  const warte = (ms: number) =>
    act(async () => {
      await new Promise((r) => setTimeout(r, ms));
    });
  afterEach(() => {
    delete (window as unknown as Record<string, unknown>).speechSynthesis;
  });

  it("die Tabelle hat einen Text für alle 12 Sprachen des Plans", () => {
    expect(Object.keys(STIMME_HINWEIS).sort()).toEqual([...KLANG_SPRACHEN_PLAN].sort());
    for (const s of KLANG_SPRACHEN_PLAN) expect(STIMME_HINWEIS[s].trim().length, s).toBeGreaterThan(40);
  });

  it("fr, Vorlesen an, keine fr-Stimme: nach 1,5 s steht der Hinweis da (ohne Live-Region)", async () => {
    setzeStimmen([]);
    useVoice.setState({ enabled: true });
    zeige("fr");
    expect(screen.queryByTestId("kp-stimme-hinweis")).toBeNull();
    await warte(1700);
    const h = screen.getByTestId("kp-stimme-hinweis");
    expect(h.textContent).toBe(STIMME_HINWEIS.fr);
    expect(h.getAttribute("lang")).toBe("fr");
    expect(h.getAttribute("role")).toBeNull();
    expect(h.getAttribute("aria-live")).toBeNull();
    expect(h.closest("[aria-live]")).toBeNull();
  });

  it("fr, Stimmenliste geladen, aber nur de/en: Hinweis sofort", async () => {
    setzeStimmen([stimme("de-DE"), stimme("en-GB")]);
    useVoice.setState({ enabled: true });
    zeige("fr");
    await warte(50);
    expect(screen.getByTestId("kp-stimme-hinweis")).toBeInTheDocument();
  });

  it("fr, aber eine fr-Stimme ist da: kein Hinweis", async () => {
    setzeStimmen([stimme("fr-FR")]);
    useVoice.setState({ enabled: true });
    zeige("fr");
    await warte(1700);
    expect(screen.queryByTestId("kp-stimme-hinweis")).toBeNull();
  });

  it("Vorlesen aus: kein Hinweis", async () => {
    setzeStimmen([stimme("de-DE")]);
    useVoice.setState({ enabled: false });
    zeige("fr");
    await warte(1700);
    expect(screen.queryByTestId("kp-stimme-hinweis")).toBeNull();
  });

  it("de und en: nie ein Hinweis, auch ohne Stimmen", async () => {
    setzeStimmen([]);
    useVoice.setState({ enabled: true });
    zeige("en");
    await warte(1700);
    expect(screen.queryByTestId("kp-stimme-hinweis")).toBeNull();
    cleanup();
    window.history.replaceState(null, "", "/programme/klangpunkte"); // Schalter aus: Deutsch
    render(<MemoryRouter><Klangpunkte loadFn={() => emptyKlangProgress()} saveFn={() => {}} /></MemoryRouter>);
    await warte(1700);
    expect(screen.queryByTestId("kp-stimme-hinweis")).toBeNull();
  });
});
