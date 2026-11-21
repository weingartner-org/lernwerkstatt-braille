/**
 * ★★★ WÄCHTER: Die Lehrerseite von Plus - Mitschrift, Überblick, Einstellungen.
 * ===========================================================================
 *
 * Johannes, 16.10.2026: „die Lehrerseite von Plus gibt viel zu wenig
 * Metadaten über die übenden Schüler frei. Zudem ist kaum etwas einzustellen."
 *
 * WOHIN SICH DIESER WÄCHTER BEWEGT, WENN ES SCHLECHTER WIRD:
 *
 *  (a) Zählt eine Antwort nicht in `taeglich`/`jeArt`/`jePaket`, sind die
 *      Zeiträume der Lehrkraft leer - (a) rot. Und: Wird dort je eine UHRZEIT
 *      oder DAUER mitgeschrieben, wird (a) auch rot (nur Zähler, nie Zeit).
 *  (b) Rechnen die Zeiträume falsch (Fenster, Woche ab Montag, Schuljahr ab
 *      1. August), wird (b) rot.
 *  (c) Reiht ein „Hinweis" Kinder nach Leistung statt nach dem Alphabet, wird
 *      (c) rot.
 *  (d) Wirkt eine Einstellung der Klasse nicht beim Kind - oder gilt sie für
 *      jemanden, der selbst lernt -, wird (d) rot.
 *  (e) Schreibt der Reiter eine Einstellung nur bei einem Kind statt bei
 *      allen, wird (e) rot.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";

import {
  heileBeschluss, heileKlasse, mitKlasse, raetselNach,
} from "@/lib/plus/beschluss";
import { heile, leererFortschritt, zaehleAntwortFuerLehrkraft, type PlusFortschritt } from "@/lib/plus/fortschritt";
import {
  fenster, hinweise, kindBlick, klassenBlick, montagVon, schuljahrBeginn, wochenSaeulen, zuletztSatz,
} from "@/lib/plus/klassenblick";
import { PlusStart } from "@/components/plus/PlusStart";
import { addPupil, createClass, getAccount, registerTeacher } from "@/lib/typing/account";

const daten = vi.hoisted(() => ({ staende: {} as Record<string, unknown> }));
vi.mock("@/lib/plus/fortschritt", async (echt) => ({
  ...(await echt<typeof import("@/lib/plus/fortschritt")>()),
  liesKlasse: () => Promise.resolve(daten.staende),
}));
const { PlusReiter } = await import("@/components/lernwerkstatt/klasse/PlusReiter");

beforeEach(() => {
  localStorage.clear();
  daten.staende = {};
});
afterEach(cleanup);

/* ══ (a) Die Mitschrift ═════════════════════════════════════════════════════ */

describe("(a) Jede Antwort wird gezählt - und nur gezählt", () => {
  it("★★★ taeglich, jeArt und jePaket zaehlen mit", () => {
    let z = { taeglich: {}, jeArt: {}, jePaket: {} } as Pick<PlusFortschritt, "taeglich" | "jeArt" | "jePaket">;
    z = zaehleAntwortFuerLehrkraft(z, 20000, "3-01", "plus", true);
    z = zaehleAntwortFuerLehrkraft(z, 20000, "3-01", "plus", false);
    z = zaehleAntwortFuerLehrkraft(z, 20001, "3-02", "minus", true);
    expect(z.taeglich).toEqual({ 20000: [2, 1], 20001: [1, 1] });
    expect(z.jeArt).toEqual({ plus: [2, 1], minus: [1, 1] });
    expect(z.jePaket).toEqual({ "3-01": [2, 1], "3-02": [1, 1] });
  });

  it("★★ ohne Rechenart zaehlen Tag und Uebung trotzdem", () => {
    const z = zaehleAntwortFuerLehrkraft(leererFortschritt(), 5, "1-01", undefined, true);
    expect(z.taeglich).toEqual({ 5: [1, 1] });
    expect(z.jeArt).toEqual({});
  });

  it("★★★ nur Zaehler - nie eine Uhrzeit oder Dauer im gespeicherten Stand", () => {
    const z = zaehleAntwortFuerLehrkraft(leererFortschritt(), 20000, "3-01", "plus", true);
    // jeder Wert ist ein Paar kleiner ganzer Zahlen
    for (const tabelle of [z.taeglich, z.jeArt, z.jePaket]) {
      for (const v of Object.values(tabelle)) {
        expect(v).toHaveLength(2);
        expect(v.every((n) => Number.isInteger(n) && n < 1_000_000)).toBe(true);
      }
    }
  });

  it("★★ ein alter Stand ohne die Felder wird beim Lesen ganz", () => {
    const alt = heile({ gerechnet: 5, richtige: 4 });
    expect(alt.taeglich).toEqual({});
    expect(alt.jeArt).toEqual({});
    expect(alt.jePaket).toEqual({});
  });

  it("★★ kaputte Paare fallen weg, die jüngsten 400 Tage bleiben", () => {
    const roh: Record<string, unknown> = { a: "x", b: [3, 5], c: [-1, 0], 20000: [4, 2] };
    for (let t = 1; t <= 450; t++) roh[String(t + 30000)] = [1, 1];
    const f = heile({ taeglich: roh });
    expect(f.taeglich.a).toBeUndefined(); // kein Paar
    expect(f.taeglich.b).toBeUndefined(); // mehr richtig als gerechnet
    expect(f.taeglich.c).toBeUndefined(); // negativ
    expect(Object.keys(f.taeglich)).toHaveLength(400);
    expect(f.taeglich["30450"]).toEqual([1, 1]); // die jüngsten bleiben
    expect(f.taeglich["30001"]).toBeUndefined();
  });
});

/* ══ (b) Die Zeiträume ══════════════════════════════════════════════════════ */

describe("(b) Zeiträume und Wochen stimmen", () => {
  // 15.10.2026 (Donnerstag)
  const HEUTE = Math.floor(Date.UTC(2026, 9, 15) / 86_400_000);

  it("★★★ der Montag der Woche - auch ueber Sonntag und Donnerstag", () => {
    const montag = Math.floor(Date.UTC(2026, 9, 12) / 86_400_000);
    expect(new Date(montag * 86_400_000).getUTCDay()).toBe(1);
    expect(montagVon(HEUTE)).toBe(montag);
    expect(montagVon(montag)).toBe(montag);
    expect(montagVon(montag + 6)).toBe(montag); // Sonntag
    expect(montagVon(montag + 7)).toBe(montag + 7);
  });

  it("★★ 7 und 30 Tage haben einen gleich langen Zeitraum davor, Schuljahr und Gesamt nicht", () => {
    const w = fenster("woche", HEUTE)!;
    expect(w.bis - w.von).toBe(6);
    expect(w.vorBis).toBe(w.von - 1);
    expect(w.vorBis! - w.vorVon!).toBe(6);
    expect(fenster("monat", HEUTE)!.von).toBe(HEUTE - 29);
    expect(fenster("schuljahr", HEUTE)!.vorVon).toBeNull();
    expect(fenster("gesamt", HEUTE)).toBeNull();
  });

  it("★★ das Schuljahr beginnt am 1. August - auch im Juli noch im alten", () => {
    expect(new Date(schuljahrBeginn(HEUTE) * 86_400_000).toISOString().slice(0, 10)).toBe("2026-08-01");
    const juli = Math.floor(Date.UTC(2027, 6, 10) / 86_400_000);
    expect(new Date(schuljahrBeginn(juli) * 86_400_000).toISOString().slice(0, 10)).toBe("2026-08-01");
    const august = Math.floor(Date.UTC(2027, 7, 2) / 86_400_000);
    expect(new Date(schuljahrBeginn(august) * 86_400_000).toISOString().slice(0, 10)).toBe("2027-08-01");
  });

  it("★★★ die Zahlen eines Kindes im Zeitraum und im Zeitraum davor", () => {
    const f = leererFortschritt();
    f.gerechnet = 100;
    f.richtige = 80;
    f.tage = [HEUTE, HEUTE - 3, HEUTE - 10];
    f.taeglich = { [HEUTE]: [10, 9], [HEUTE - 3]: [10, 5], [HEUTE - 10]: [20, 10] };
    const k = kindBlick({ id: "k", name: "Mia" }, f, "woche", HEUTE);
    expect(k.zGerechnet).toBe(20);
    expect(k.zRichtige).toBe(14);
    expect(k.zTage).toBe(2);
    expect(k.vorGerechnet).toBe(20); // HEUTE-10 liegt im Zeitraum davor (-13..-7)
    expect(k.zuletztVor).toBe(0);
    // „Gesamt" nimmt die Summen des Kindes, nicht die Mitschrift
    const g = kindBlick({ id: "k", name: "Mia" }, f, "gesamt", HEUTE);
    expect(g.zGerechnet).toBe(100);
    expect(g.vorGerechnet).toBeNull();
  });

  it("★★ Wochensaeulen: je Kalenderwoche, die laufende zuletzt", () => {
    const f = leererFortschritt();
    f.taeglich = { [HEUTE]: [5, 4], [HEUTE - 7]: [6, 6], [HEUTE - 100]: [9, 9] };
    const reihe = wochenSaeulen([f, null], HEUTE, 4);
    expect(reihe).toHaveLength(4);
    expect(reihe[3].montag).toBe(montagVon(HEUTE));
    expect(reihe[3].aufgaben).toBe(5);
    expect(reihe[2].aufgaben).toBe(6);
    expect(reihe[3].aktive).toBe(1);
    expect(reihe.reduce((s, w) => s + w.aufgaben, 0)).toBe(11); // die alte Woche zählt nicht mit
  });

  it("★ zuletztSatz", () => {
    expect(zuletztSatz(null)).toBe("noch nie");
    expect(zuletztSatz(0)).toBe("heute");
    expect(zuletztSatz(1)).toBe("gestern");
    expect(zuletztSatz(5)).toBe("vor 5 Tagen");
    expect(zuletztSatz(21)).toBe("vor 3 Wochen");
  });
});

/* ══ (c) Hinweise ohne Reihung ══════════════════════════════════════════════ */

describe("(c) Zum Hinschauen: Gründe mit Namen, alphabetisch", () => {
  const HEUTE = Math.floor(Date.UTC(2026, 9, 15) / 86_400_000);

  function kindMit(name: string, tage: Record<number, [number, number]>): { k: ReturnType<typeof kindBlick>; f: PlusFortschritt } {
    const f = leererFortschritt();
    f.taeglich = Object.fromEntries(Object.entries(tage));
    f.tage = Object.keys(tage).map(Number);
    f.gerechnet = Object.values(tage).reduce((s, [g]) => s + g, 0);
    f.richtige = Object.values(tage).reduce((s, [, r]) => s + r, 0);
    return { k: kindBlick({ id: name, name }, f, "monat", HEUTE), f };
  }

  it("★★★ die Gründe, die Namen nach dem Alphabet", () => {
    const liste = [
      kindMit("Zoe", { [HEUTE - 12]: [10, 9] }),                           // lange nicht
      kindMit("Anna", { [HEUTE - 20]: [10, 9] }),                          // lange nicht
      kindMit("Ben", { [HEUTE - 1]: [30, 10] }),                           // unter 60 %
      kindMit("Cleo", { [HEUTE - 1]: [25, 25], [HEUTE - 2]: [25, 24] }),   // über 95 %
      { k: kindBlick({ id: "x", name: "Dora" }, null, "monat", HEUTE), f: null },
    ];
    const h = hinweise(liste as never, HEUTE);
    const nach = (id: string) => h.find((x) => x.id === id);
    expect(nach("langeNichtGerechnet")?.namen).toEqual(["Anna", "Zoe"]);
    expect(nach("vieleFehler")?.namen).toEqual(["Ben"]);
    expect(nach("unterfordert")?.namen).toEqual(["Cleo"]);
    expect(nach("nichtGeoeffnet")?.namen).toEqual(["Dora"]);
  });

  it("★★ zu wenige Aufgaben: kein Hinweis auf die Quote", () => {
    const h = hinweise([kindMit("Ben", { [HEUTE - 1]: [10, 2] })] as never, HEUTE);
    expect(h.find((x) => x.id === "vieleFehler")).toBeUndefined();
  });

  it("★★ die Klassenzahlen sind Summen", () => {
    const a = kindMit("A", { [HEUTE]: [10, 8] });
    const b = kindMit("B", { [HEUTE]: [30, 24] });
    const klasse = klassenBlick([a.k, b.k]);
    expect(klasse.aufgaben).toBe(40);
    expect(klasse.richtige).toBe(32);
    expect(klasse.jeKind).toBe(20);
    expect(klasse.aktiv).toBe(2);
  });
});

/* ══ (d) Die Einstellungen der Klasse beim Kind ═════════════════════════════ */

describe("(d) Einstellungen der Klasse", () => {
  it("★★★ nur Abweichungen werden gespeichert - leer heißt: wie immer", () => {
    expect(heileKlasse({})).toEqual({});
    expect(heileKlasse({ spiele: true, rechenweg: true, freieWahl: true })).toEqual({});
    expect(heileKlasse({ spiele: false, wochenziel: 100, raetsel: 5, unbekannt: 1 })).toEqual({
      spiele: false, wochenziel: 100, raetsel: 5,
    });
    expect(heileKlasse({ wochenziel: 77 })).toEqual({}); // nicht aus der Leiter
    expect(heileKlasse({ raetsel: 3 })).toEqual({});     // 3 ist der Standard, also nichts
    const b = mitKlasse({}, { spiele: false });
    expect(b.klasse).toEqual({ spiele: false });
    expect(mitKlasse(b, {}).klasse).toBeUndefined();
    expect(heileBeschluss({ klasse: { freieWahl: false } }).klasse).toEqual({ freieWahl: false });
  });

  it("★★ Rätsel: Standard 3, auf Wunsch 5 oder nie", () => {
    expect(raetselNach(undefined, 3)).toBe(3);
    expect(raetselNach({}, 3)).toBe(3);
    expect(raetselNach({ raetsel: 5 }, 3)).toBe(5);
    expect(raetselNach({ raetsel: 0 }, 3)).toBeNull();
  });

  const startProps = {
    angemeldet: true, gerechnet: 3, weg: null, gefunden: [] as string[],
    wochenziel: { woche: "2026-42", ziel: 50, geschafft: 5 },
    onWahl: () => {}, onTraining: () => {}, onSammlung: () => {}, onSpiele: () => {},
  };

  it("★★★ „Ich wähle“ und Spiele verschwinden vom Start, Mein Training und Sammlung bleiben", () => {
    render(<PlusStart {...startProps} freieWahl={false} spiele={false} />);
    expect(screen.queryByRole("button", { name: /Ich wähle/ })).toBeNull();
    expect(screen.queryByRole("button", { name: /Spiele/ })).toBeNull();
    expect(screen.getByRole("button", { name: /Meine Sammlung/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Weiterrechnen|Los geht/ })).toBeInTheDocument();
  });

  it("★★ ohne Einstellung stehen alle drei Türen da", () => {
    render(<PlusStart {...startProps} />);
    expect(screen.getByRole("button", { name: /Ich wähle/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Spiele/ })).toBeInTheDocument();
  });
});

/* ══ (e) Der Reiter schreibt bei ALLEN Kindern ══════════════════════════════ */

describe("(e) Einstellungen im Reiter landen bei jedem Kind", () => {
  function klasseMitZwei() {
    const t = registerTeacher("Frau Berger", "berger@example.org", "geheim123");
    if (!t.ok) throw new Error(t.error);
    const c = createClass(t.value.id, "3b", "3B");
    if (!c.ok) throw new Error(c.error);
    const mia = addPupil(c.value.code, "Mia", "pw1234");
    const ben = addPupil(c.value.code, "Ben", "pw1234");
    if (!mia.ok || !ben.ok) throw new Error("Kinder");
    return { mia: mia.value, ben: ben.value };
  }

  it("★★★ Wochenziel, Rätsel und Haken gelten für beide Kinder", async () => {
    const { mia, ben } = klasseMitZwei();
    render(<PlusReiter pupils={[mia, ben]} cls={{ code: "3B", schulstufe: 3 }} />);
    fireEvent.click(await screen.findByRole("button", { name: /^Einstellungen der Klasse/ }));

    fireEvent.change(await screen.findByLabelText("Wochenziel"), { target: { value: "100" } });
    await waitFor(() => {
      for (const id of [mia.id, ben.id]) {
        expect(heileBeschluss(getAccount(id)?.plusBeschluss).klasse?.wochenziel).toBe(100);
      }
    });

    fireEvent.change(screen.getByLabelText("Rätsel zwischen den Runden"), { target: { value: "0" } });
    await waitFor(() => expect(heileBeschluss(getAccount(ben.id)?.plusBeschluss).klasse?.raetsel).toBe(0));
    // das Wochenziel von vorhin ist noch da
    expect(heileBeschluss(getAccount(ben.id)?.plusBeschluss).klasse?.wochenziel).toBe(100);

    fireEvent.click(screen.getByLabelText(/Spiele/));
    await waitFor(() => expect(heileBeschluss(getAccount(mia.id)?.plusBeschluss).klasse?.spiele).toBe(false));

    // und wieder zurück auf „wie immer"
    fireEvent.click(screen.getByLabelText(/Spiele/));
    await waitFor(() => expect(heileBeschluss(getAccount(mia.id)?.plusBeschluss).klasse?.spiele).toBeUndefined());
    expect(await screen.findByText(/Einstellungen der Klasse gespeichert/)).toBeInTheDocument();
  });

  it("★★ ein Kind, das später kam, wird gemeldet und mit einem Knopf nachgezogen", async () => {
    const { mia, ben } = klasseMitZwei();
    const mitEinstellung = { ...mia, plusBeschluss: { klasse: { spiele: false } } };
    render(<PlusReiter pupils={[mitEinstellung as typeof mia, ben]} cls={{ code: "3B", schulstufe: 3 }} />);
    fireEvent.click(await screen.findByRole("button", { name: /^Einstellungen der Klasse/ }));
    // Gleichstand 1:1 - die Einstellung mit Inhalt gewinnt; Ben weicht ab
    const kasten = (await screen.findByRole("heading", { name: "Einstellungen der Klasse" })).closest("div") as HTMLElement;
    expect(within(kasten).getByText(/Bei Ben stehen die Einstellungen noch anders/)).toBeInTheDocument();
    fireEvent.click(within(kasten).getByRole("button", { name: "Bei allen Kindern übernehmen" }));
    await waitFor(() => expect(heileBeschluss(getAccount(ben.id)?.plusBeschluss).klasse?.spiele).toBe(false));
  });
});
