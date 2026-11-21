/**
 * Wächter für den Fortschritt.
 *
 * Die eine Frage: geht etwas verloren? Ein Kind, das zwölf Aufgaben gerechnet
 * hat und beim nächsten Öffnen wieder bei null steht, hört auf zu üben.
 */
import { beforeEach, describe, expect, it } from "vitest";
import { nachAntwort, nachLauf, neuerStand, standVon } from "../src/lib/plus/coach";
import {
  aktuellesKonto, backendZuruecksetzen, heile, leererFortschritt, liesKlasse, plusBackend,
} from "../src/lib/plus/fortschritt";
import { liesTafelFuer, staffelTafel, tafelZuruecksetzen } from "../src/lib/plus/staffelTafel";

beforeEach(() => {
  localStorage.clear();
  backendZuruecksetzen();
});

describe("Speichern und Wiederfinden", () => {
  it("findet ohne Konto wieder, was im Browser liegt", async () => {
    const b = plusBackend();
    const f = { ...leererFortschritt(), gerechnet: 12, richtige: 9, stufe: 3 };
    await b.schreib("", f);
    const zurueck = await b.lies("");
    expect(zurueck.gerechnet).toBe(12);
    expect(zurueck.stufe).toBe(3);
  });

  it("hält die Konten auseinander", async () => {
    const b = plusBackend();
    await b.schreib("kind-a", { ...leererFortschritt(), gerechnet: 5 });
    await b.schreib("kind-b", { ...leererFortschritt(), gerechnet: 99 });
    expect((await b.lies("kind-a")).gerechnet).toBe(5);
    expect((await b.lies("kind-b")).gerechnet).toBe(99);
  });

  it("nimmt den ganzen Stand des Coaches mit", async () => {
    const b = plusBackend();
    let stand = neuerStand(100);
    for (let i = 0; i < 4; i++) stand = nachAntwort(stand, { paketId: "1-08", richtig: true, tag: 100 });
    stand = nachLauf(stand, "1-08", 10, 10, 100);
    await b.schreib("", { ...leererFortschritt(), stand });

    const zurueck = await b.lies("");
    expect(standVon(zurueck.stand, "1-08").versuche).toBe(4);
    expect(standVon(zurueck.stand, "1-08").richtigeInFolge).toBe(4);
    expect(standVon(zurueck.stand, "1-08").kartei).toBeGreaterThanOrEqual(0);
  });

  it("beginnt bei leerem Speicher bei null, statt zu scheitern", async () => {
    expect((await plusBackend().lies("")).gerechnet).toBe(0);
  });
});

describe("Was aus dem Speicher kommt, ist nie ganz", () => {
  it.each([
    [null], [undefined], ["kaputt"], [42], [{}], [{ stand: null }], [{ gerechnet: "viele" }],
  ])("macht aus %s einen brauchbaren Stand", (roh) => {
    const f = heile(roh);
    expect(f.version).toBe(1);
    expect(f.gerechnet).toBe(0);
    expect(f.stand.pakete).toEqual({});
  });

  it("behält, was brauchbar ist", () => {
    const f = heile({ gerechnet: 7, richtige: 5, stufe: 2, stand: { pakete: { "1-01": { elo: 900 } } } });
    expect(f.gerechnet).toBe(7);
    expect(f.stufe).toBe(2);
    expect(f.stand.pakete["1-01"].elo).toBe(900);
  });
});

describe("Die Anmeldung gehört der Lernwerkstatt", () => {
  it("liest das Konto nur mit - und kommt ohne eines zurecht", () => {
    expect(aktuellesKonto()).toBe("");
    localStorage.setItem("tt_pb_auth", JSON.stringify({ record: { id: "kind-7" } }));
    expect(aktuellesKonto()).toBe("kind-7");
    localStorage.setItem("tt_pb_auth", "kein JSON");
    expect(aktuellesKonto()).toBe("");
  });
});

describe("Die Klasse lesen - fuer den Reiter der Lehrkraft (23.09.2026)", () => {
  it("★★ findet, was das Kind geschrieben hat, und laesst weg, wer nichts hat", async () => {
    // Das Kind rechnet - DERSELBE Weg wie in der App.
    await plusBackend().schreib("kind-a", { ...leererFortschritt(), gerechnet: 7 });
    const klasse = await liesKlasse(["kind-a", "kind-b"]);
    expect(klasse["kind-a"]?.gerechnet).toBe(7);
    // ★ kind-b fehlt - es steht NICHT mit einem leeren Stand da. Der Reiter
    // unterscheidet daran „noch nicht geöffnet" von „0 Aufgaben".
    expect("kind-b" in klasse).toBe(false);
  });

  it("★ eine leere Kinderliste fragt gar nicht erst", async () => {
    expect(await liesKlasse([])).toEqual({});
  });

  it("★★ die Lehrkraft liest dieselbe Staffel-Tafel, die das Kind beschreibt", async () => {
    tafelZuruecksetzen();
    await staffelTafel().trageEin("2026-39", 2);
    const t = await liesTafelFuer("3B", "2026-39");
    expect(t?.gelaufen).toEqual([2]);
  });
});
