/**
 * ★★★ WÄCHTER: Der Reiter „Plus" in „Meine Klasse".
 * ===========================================================================
 *
 * Gebaut am 23.09.2026 auf Johannes' Entscheidung „mach einen Reiter in
 * Meine Klasse". Der Reiter ist die erste Stelle des Projekts, an der eine
 * ERWACHSENE Person die Zahlen eines Kindes sieht - und damit die Stelle, an
 * der zwei Hausregeln zugleich auf dem Spiel stehen:
 * [[feedback_data_transparency]] (nie mehr als das Kind über sich selbst) und
 * [[feedback_nie_gegen_das_kind]] (kein Etikett, keine Reihung, keine Zeit).
 *
 * WOHIN SICH DIESER WÄCHTER BEWEGT, WENN ES SCHLECHTER WIRD
 * ([[feedback_gruener_waechter_beweist_was]]) - er prüft FEHLERKLASSEN, nicht
 * die Stellen, die heute gebaut wurden:
 *
 *  (a) ★ GEÄNDERT 16.10.2026 (Johannes: „gibt viel zu wenig Metadaten über die
 *      übenden Schüler frei"): Die Lehrkraft sieht jetzt MEHR als das Kind -
 *      Quote je Zeitraum, je Rechenart, je Übung und, was der Coach gerade
 *      übt. Geblieben ist die Fehlerklasse „ein ROHES Feld wandert in den
 *      Bildschirm": Ein erfundenes Fehlermuster darf nie auftauchen, ein
 *      bekanntes nur als der Satz aus `klassenblick.ts`, nie als Schlüssel,
 *      und nur, wenn es sich über mehrere Tage gezeigt hat.
 *  (b) Rechnen Kind und Lehrkraft die Schulstufen je selbst aus, laufen die
 *      Zahlen irgendwann auseinander. (b) rendert BEIDE Seiten mit DEMSELBEN
 *      Fortschritt und vergleicht die Sätze Zeichen für Zeichen.
 *  (c) Wird die Tabelle je nach Leistung sortiert, wird (c) rot - die Kinder
 *      kommen dort in Leistungsreihenfolge herein und müssen alphabetisch
 *      herauskommen.
 *  (d) Wird aus „hat Plus noch nicht geöffnet" wieder eine Reihe Nullen,
 *      wird (d) rot.
 *  (e) Kommt eine Zeit-, Tempo- oder Dauer-Angabe dazu, wird (e) rot.
 *  (f) Bekommt ein Programm einen Schlüssel, aber keinen Fall in
 *      `MeineKlassePage`, wird (f) rot. Diese Falle ist echt: Die
 *      Verzweigung dort endet in einem `default`, TypeScript hätte das
 *      Fehlen NICHT gemeldet.
 *  (g) Wird Plus in „Meine Klasse" sichtbar, bevor der Admin es freigibt,
 *      wird (g) rot.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { ueberschreibe } from "@/lib/plus/coach";
import { leererFortschritt, type PlusFortschritt } from "@/lib/plus/fortschritt";
import { kindStand, stufenSatz, stufenZeilen } from "@/lib/plus/klassenstand";
import { tagesnummer } from "@/lib/plus/coach";
import { LW_PROGRAMS, programsOfClass } from "@/lib/lernwerkstatt/klassen";
import type { TypingAccount } from "@/lib/typing";

/* ── Die zwei Server-Wege werden gefälscht, nicht die Rechnung ───────────── */

const daten = vi.hoisted(() => ({
  staende: {} as Record<string, unknown>,
  tafel: null as { gelaufen: number[]; wortGeraten: boolean } | null,
  /** Der Server antwortet nicht - das langsame Schulnetz. */
  haengt: false,
}));

vi.mock("@/lib/plus/fortschritt", async (echt) => ({
  ...(await echt<typeof import("@/lib/plus/fortschritt")>()),
  liesKlasse: () =>
    daten.haengt ? new Promise(() => {}) : Promise.resolve(daten.staende),
}));

vi.mock("@/lib/plus/staffelTafel", async (echt) => ({
  ...(await echt<typeof import("@/lib/plus/staffelTafel")>()),
  liesTafelFuer: async () => daten.tafel,
}));

// Erst NACH den Mocks - sonst zieht der Reiter die echten Leser herein.
const { PlusReiter } = await import("@/components/lernwerkstatt/klasse/PlusReiter");
const { PlusStatistik } = await import("@/components/plus/PlusStatistik");

/* ── Hilfen ─────────────────────────────────────────────────────────────── */

const DENKFEHLER = "zzmusterausgedacht";

function kind(id: string, name: string): TypingAccount {
  return { id, role: "schueler", name, classCode: "3B", createdAt: 0 } as TypingAccount;
}

/** Ein Fortschritt mit Übungen in zwei Stufen, davon eine sitzend. */
function fortschritt(gerechnet: number): PlusFortschritt {
  const f = leererFortschritt();
  f.gerechnet = gerechnet;
  f.richtige = Math.round(gerechnet * 0.8);
  f.stufe = 3;
  f.tage = [20000, 20001];
  f.abzeichen = ["erste-runde"];
  f.stand = ueberschreibe(f.stand, "1-01", "sitzt");
  f.stand = ueberschreibe(f.stand, "3-01", "wackelt");
  // ⚠️ Der Arbeitszettel des Coaches - das Kind sieht ihn selbst nicht.
  f.vermutungen = [
    { muster: DENKFEHLER, treffer: 3, daneben: 0, bis: 99999 } as never,
  ];
  return f;
}

/** Die Einzelheiten eines Kindes aufklappen - dort steht alles Genaue. */
async function oeffneKind(name: string) {
  fireEvent.click(await screen.findByRole("button", { name: `${name}: Einzelheiten aufklappen` }));
}

function zeigeReiter(pupils: TypingAccount[], schulstufe: number | undefined = 3) {
  render(<PlusReiter pupils={pupils} cls={{ code: "3B", schulstufe }} />);
}

beforeEach(() => {
  daten.staende = {};
  daten.tafel = null;
  daten.haengt = false;
  localStorage.clear();
});
afterEach(cleanup);

/* ══ (a) Die Obergrenze ════════════════════════════════════════════════════ */

describe("(a) Rohe Felder wandern nie in den Bildschirm", () => {
  it("★★★ ein erfundenes Denkfehler-Muster taucht weder im Stand noch im Bildschirm auf", async () => {
    const f = fortschritt(40);

    // 1. schon die Rechnung gibt sie nicht heraus
    const stand = kindStand({ id: "k1", name: "Mia" }, f);
    expect(JSON.stringify(stand)).not.toContain(DENKFEHLER);

    // 2. und der Bildschirm zeigt sie auch nicht
    daten.staende = { k1: f };
    zeigeReiter([kind("k1", "Mia")]);
    await screen.findByText(/rechnet mit Plus/);
    await oeffneKind("Mia");
    expect(document.body.textContent).not.toContain(DENKFEHLER);
  });

  it("★★ ein bekanntes Muster erscheint als Satz - nur wenn es sich ueber Tage gezeigt hat", async () => {
    const heute = tagesnummer();
    const f = fortschritt(40);
    f.vermutungen = [
      // systematisch: 4 Treffer an 3 Tagen
      { muster: "uebertrag", treffer: 4, fehlschlaege: 0, tage: [heute - 1, heute - 2, heute - 3], zuletzt: heute - 1 },
      // nur ein Zufall: ein Treffer
      { muster: "komma", treffer: 1, fehlschlaege: 0, tage: [heute - 1], zuletzt: heute - 1 },
    ];
    daten.staende = { k1: f };
    zeigeReiter([kind("k1", "Mia")]);
    await oeffneKind("Mia");
    expect(await screen.findByText(/Vergisst den Übertrag/)).toBeInTheDocument();
    expect(screen.queryByText(/Komma an die falsche Stelle/)).toBeNull();
    expect(document.body.textContent).not.toContain("uebertrag"); // nie der Schlüssel
  });

  it("★ die Gegenprobe: das erfundene Muster steht wirklich im Fortschritt", () => {
    // Ohne sie prüfte der Test oben nur, dass irgendein Wort fehlt.
    expect(JSON.stringify(fortschritt(40))).toContain(DENKFEHLER);
  });
});

/* ══ (b) EINE Rechnung für Kind und Lehrkraft ══════════════════════════════ */

describe("(b) Kind und Lehrkraft lesen dieselben Zahlen", () => {
  it("★★★ die Schulstufen-Saetze stimmen Zeichen fuer Zeichen ueberein", async () => {
    const f = fortschritt(40);

    // Das Kind in „Meine Zahlen"
    const kindSeite = render(<PlusStatistik fortschritt={f} onZurueck={() => {}} />);
    const kindSaetze = stufenZeilen(f.stand)
      .filter((z) => z.angefasst > 0)
      .map((z) => stufenSatz(z));
    for (const satz of kindSaetze) {
      expect(within(kindSeite.container).getByText(satz)).toBeInTheDocument();
    }
    kindSeite.unmount();

    // Dieselben Sätze bei der Lehrkraft
    daten.staende = { k1: f };
    zeigeReiter([kind("k1", "Mia")]);
    await oeffneKind("Mia");
    for (const satz of kindSaetze) {
      expect(await screen.findByText(satz)).toBeInTheDocument();
    }
    expect(kindSaetze.length).toBeGreaterThan(0); // Gegenprobe: es gab etwas zu vergleichen
  });
});

/* ══ (c) Keine Reihung ═════════════════════════════════════════════════════ */

describe("(c) Die Tabelle steht nach Namen, nie nach Leistung", () => {
  it("★★★ Kinder kommen in Leistungsreihenfolge herein und alphabetisch heraus", async () => {
    daten.staende = { k1: fortschritt(500), k2: fortschritt(3) };
    // Absichtlich: das fleissigste Kind zuerst, alphabetisch das letzte.
    zeigeReiter([kind("k1", "Zoe"), kind("k2", "Anna")]);
    const tabelle = await screen.findByRole("table", { name: /Plus-Stand der Klasse/ });
    const zeilen = within(tabelle).getAllByRole("rowheader");
    expect(zeilen.map((z) => z.textContent?.trim().split("\n")[0])).toEqual(["Anna", "Zoe"]);
  });
});

/* ══ (d) Noch nicht geöffnet ist keine Null ════════════════════════════════ */

describe("(d) Wer Plus noch nicht geoeffnet hat, steht nicht mit Nullen da", () => {
  it("★★ ein Kind ohne Zeile bekommt einen Satz, keine Zahlenreihe", async () => {
    daten.staende = {}; // niemand hat eine Zeile
    zeigeReiter([kind("k1", "Mia")]);
    // Erst die Antwort des Servers abwarten - vorher weiss der Reiter nichts.
    await screen.findByText("Das Kind hat Plus noch nicht geöffnet.");
    const zeile = within(screen.getByRole("table", { name: /Plus-Stand der Klasse/ })).getByRole("rowheader").closest("tr") as HTMLElement;
    expect(within(zeile).getByText("hat Plus noch nicht geöffnet")).toBeInTheDocument();
    expect(within(zeile).queryByText("0")).toBeNull();
  });

  it("★★★ solange der Server nicht antwortet, behauptet der Reiter nichts ueber ein Kind", async () => {
    // Das langsame Schulnetz: Die Antwort kommt nicht.
    daten.haengt = true;
    zeigeReiter([kind("k1", "Mia"), kind("k2", "Anna")]);
    expect(await screen.findAllByText("lädt …")).toHaveLength(2);
    expect(screen.queryByText(/noch nicht geöffnet/)).toBeNull();
  });

  it("★ und ein Kind MIT Zeile, das noch nichts gerechnet hat, ist etwas anderes", async () => {
    const f = leererFortschritt();
    daten.staende = { k1: f };
    zeigeReiter([kind("k1", "Mia")]);
    await waitFor(() =>
      expect(screen.queryByText(/hat Plus noch nicht geöffnet/)).toBeNull(),
    );
  });
});

/* ══ (e) Keine Zeit ════════════════════════════════════════════════════════ */

describe("(e) Kein Wort ueber Zeit, Tempo oder Dauer", () => {
  it("★★★ der ganze Reiter nennt keine Zeiteinheit", async () => {
    daten.staende = { k1: fortschritt(40) };
    daten.tafel = { gelaufen: [1, 2], wortGeraten: false };
    zeigeReiter([kind("k1", "Mia")]);
    await oeffneKind("Mia");
    const text = document.body.textContent ?? "";
    /*
     * ★ Gesucht wird ein ZEITWERT - eine Zahl mit Zeiteinheit oder eine Rate -,
     * nicht das Wort. Der erste Lauf war rot an genau dem Satz, der der
     * Lehrkraft erklärt, dass Plus KEINE Zeit misst („kein Tempo, keine
     * Dauer"). Wer das Wort verbietet, verbietet die Erklärung.
     * „Woche" und „Tage" sind erlaubt: Sie zählen Termine, nicht Dauer.
     */
    expect(text).not.toMatch(/\d+\s*(?:min|sek|std|minuten?|sekunden?|stunden?)\b/i);
    expect(text).not.toMatch(/pro\s+(?:minute|sekunde|stunde)|je\s+(?:minute|sekunde|aufgabe\s+\d)/i);
    expect(text).not.toMatch(/\d+:\d{2}/); // Uhrzeit oder Stoppuhr
    // Gegenprobe: dieselbe Suche schlägt an, wo ein Zeitwert STEHT.
    expect("Mia: 12 Minuten").toMatch(/\d+\s*(?:min|sek|std|minuten?|sekunden?|stunden?)\b/i);
    expect(text.length).toBeGreaterThan(200); // da stand überhaupt etwas
  });
});

/* ══ Die Staffel ═══════════════════════════════════════════════════════════ */

describe("Die Staffel im Reiter", () => {
  it("★★ nennt den Stand der KLASSE und kein einziges Kind", async () => {
    daten.staende = { k1: fortschritt(40) };
    daten.tafel = { gelaufen: [1, 2, 3], wortGeraten: false };
    zeigeReiter([kind("k1", "Mia")]);
    fireEvent.click(await screen.findByRole("button", { name: /^Staffel dieser Woche/ }));
    const kasten = (await screen.findByRole("heading", { name: /Die Staffel dieser Woche/ })).closest("div") as HTMLElement;
    expect(within(kasten).getByText(/3 von \d+ Etappen/)).toBeInTheDocument();
    expect(kasten.textContent).not.toContain("Mia");
  });

  it("★★ sagt es, wenn der Stand nicht zu laden ist - statt eine Null zu zeigen", async () => {
    daten.tafel = null;
    zeigeReiter([kind("k1", "Mia")]);
    fireEvent.click(await screen.findByRole("button", { name: /^Staffel dieser Woche/ }));
    expect(await screen.findByText(/lässt sich gerade nicht laden/)).toBeInTheDocument();
  });
});

/* ══ (f) Jedes Programm hat einen Fall ═════════════════════════════════════ */

describe("(f) Jedes Programm hat in Meine Klasse einen eigenen Fall", () => {
  const quelle = readFileSync(
    resolve(__dirname, "..", "src/features/public/MeineKlassePage.tsx"),
    "utf8",
  );

  it("★★★ kein Programm faellt still in den default-Zweig", () => {
    // ⚠️ TypeScript meldet das NICHT: Die Verzweigung hat ein `default`, das
    // jeden neuen Schlüssel klaglos schluckt und „keine Ansicht" anzeigt.
    for (const p of LW_PROGRAMS) {
      expect(quelle, `Programm ${p.key} hat keinen Fall in MeineKlassePage`)
        .toContain(`case "${p.key}":`);
    }
    // Gegenprobe: Die Datei wurde wirklich gelesen und enthält nicht einfach alles.
    expect(quelle).not.toContain('case "gibtesnicht":');
    expect(LW_PROGRAMS.length).toBeGreaterThan(1);
  });
});

/* ══ (g) Erst mit der Freigabe ═════════════════════════════════════════════ */

describe("(g) Plus erscheint erst, wenn der Admin es freigibt", () => {
  it("★★★ derselbe Schalter steuert die Karte und den Reiter", () => {
    const gesperrt = programsOfClass(null, (k) => k !== "plus").map((p) => p.key);
    const offen = programsOfClass(null, () => true).map((p) => p.key);
    expect(gesperrt).not.toContain("plus");
    expect(offen).toContain("plus");
  });
});
