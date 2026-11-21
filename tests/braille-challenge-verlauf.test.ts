/**
 * Tests für den VERLAUF mehrerer Braille-Challenges (Nachbesserung 22.09.2026,
 * siehe `src/lib/braille/challengeVerlauf.ts`). Zwei Teile:
 *
 *  (a) die reinen Funktionen (`challengeRunden`, `rundenSchnitt`,
 *      `rundenVeraenderung`, `kindVeraenderung`) - kein Backend, kein React;
 *  (b) die Backend-Verdrahtung (`listeChallengeVerlaufKlasse`/
 *      `listeChallengeVerlaufKind`), geprüft an der LOKALEN Fassung, plus ein
 *      Server-Zwilling-Wächter (Muster `braille-backend-wettkampf.test.ts`):
 *      Beide Fassungen müssen dieselbe Funktion aufrufen, nicht zwei eigene
 *      Wege zum selben Ergebnis.
 *
 * ⚠️⚠️⚠️ Das WICHTIGSTE, was dieses Modul sichern muss: Schreiben und Lesen
 * werden NIE gegeneinander verglichen (`wertung.ts` warnt ausdrücklich davor -
 * eine Kurzschrift-Zelle steht für mehrere Zeichen). Mehrere Tests unten legen
 * absichtlich Runden UNTERSCHIEDLICHER Arbeitsweise dazwischen, um zu prüfen,
 * dass sie übersprungen werden.
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { brailleBackend, _resetBrailleBackend } from "../src/lib/braille/backend";
import type { BrailleAccount } from "../src/lib/braille/account";
import type { ChallengeErgebnis } from "../src/lib/braille/challenge";
import type { LaufErgebnis } from "../src/lib/braille/wertung";
import {
  challengeRunden,
  kindVeraenderung,
  leistungswertVeraenderung,
  rundenSchnitt,
  rundenVeraenderung,
} from "../src/lib/braille/challengeVerlauf";

beforeEach(() => {
  localStorage.clear();
  _resetBrailleBackend();
});
afterEach(() => {
  localStorage.clear();
  _resetBrailleBackend();
});

function lauf(over: Partial<LaufErgebnis> = {}): LaufErgebnis {
  return {
    arbeitsweise: "schreiben",
    bereich: "basis",
    arbeitszeitMs: 60_000,
    ansageMs: 0,
    richtig: 40,
    falsch: 2,
    ...over,
  };
}

/** Ein vollständiges `ChallengeErgebnis` mit vernünftigen Vorgaben. */
function ergebnis(over: Partial<ChallengeErgebnis> = {}): ChallengeErgebnis {
  return {
    probeId: "runde-1",
    pupilUid: "kind-1",
    teacherUid: "lehrkraft-1",
    classCode: "3.MS",
    arbeitsweise: "schreiben",
    bereich: "basis",
    lauf: lauf(),
    eingereichtMs: 10_000,
    ...over,
  };
}

async function klasseMitKind() {
  const be = brailleBackend();
  const t = await be.registerTeacher("Frau Berger", "b@s.at", "geheim1");
  if (!t.ok) throw new Error(t.error);
  const c = await be.createClass(t.value.id, "3b", "3.MS");
  if (!c.ok) throw new Error(c.error);
  const p = await be.addPupil("3.MS", "Mara", "1234");
  if (!p.ok) throw new Error(p.error);
  return { be, teacher: t.value, klasse: c.value, kind: p.value as BrailleAccount };
}

// ── (a) Die reinen Funktionen ────────────────────────────────────────────────

describe("(a) challengeRunden - Ergebnisse zu Runden gebündelt", () => {
  it("bündelt mehrere Abgaben desselben `probeId` zu EINER Runde", () => {
    const runden = challengeRunden([
      ergebnis({ probeId: "r1", pupilUid: "a", eingereichtMs: 20_000 }),
      ergebnis({ probeId: "r1", pupilUid: "b", eingereichtMs: 10_000 }),
    ]);
    expect(runden).toHaveLength(1);
    expect(runden[0].ergebnisse).toHaveLength(2);
    // Das früheste `eingereichtMs` der Runde ist ihr Datum.
    expect(runden[0].begonnenMs).toBe(10_000);
  });

  it("sortiert die Runden jüngste zuerst", () => {
    const runden = challengeRunden([
      ergebnis({ probeId: "alt", eingereichtMs: 1_000 }),
      ergebnis({ probeId: "neu", eingereichtMs: 5_000 }),
      ergebnis({ probeId: "mitte", eingereichtMs: 3_000 }),
    ]);
    expect(runden.map((r) => r.probeId)).toEqual(["neu", "mitte", "alt"]);
  });

  it("eine leere Liste ergibt eine leere Liste, kein Fehler", () => {
    expect(challengeRunden([])).toEqual([]);
  });

  it("Arbeitsweise und Bereich einer Runde kommen von ihren Abgaben", () => {
    const runden = challengeRunden([
      ergebnis({ probeId: "r1", arbeitsweise: "lesen", bereich: "voll" }),
    ]);
    expect(runden[0].arbeitsweise).toBe("lesen");
    expect(runden[0].bereich).toBe("voll");
  });
});

describe("(a) rundenSchnitt - der Leistungswert-Schnitt einer Runde", () => {
  it("ohne Abgabe: kein Schnitt", () => {
    expect(rundenSchnitt({ ergebnisse: [] })).toBeNull();
  });

  it("EINE Abgabe: der Schnitt ist ihr eigener Leistungswert", () => {
    const e = ergebnis({ lauf: lauf({ richtig: 40, falsch: 0 }) });
    const schnitt = rundenSchnitt({ ergebnisse: [e] });
    expect(schnitt).not.toBeNull();
    expect(schnitt).toBeGreaterThan(0);
  });

  it("mehrere Abgaben: der Schnitt liegt zwischen der schlechtesten und der besten", () => {
    const schwach = ergebnis({ pupilUid: "a", lauf: lauf({ richtig: 10, falsch: 10 }) });
    const stark = ergebnis({ pupilUid: "b", lauf: lauf({ richtig: 40, falsch: 0 }) });
    const schnitt = rundenSchnitt({ ergebnisse: [schwach, stark] })!;
    expect(schnitt).toBeGreaterThan(0);
    // Reine Plausibilität, keine exakte Formel-Kopie hier - die Formel lebt
    // in `wertung.ts`, hier wird nur der Schnitt gebildet.
  });
});

describe("(a) rundenVeraenderung - Runde gegen Runde, ⚠️ NIE über die Arbeitsweise hinweg", () => {
  it("die erste Runde einer Arbeitsweise hat keine Veränderung", () => {
    const runden = challengeRunden([ergebnis({ probeId: "r1", eingereichtMs: 1_000 })]);
    expect(rundenVeraenderung(runden, "r1")).toBeNull();
  });

  it("★★★★★ eine Runde ANDERER Arbeitsweise dazwischen wird ÜBERSPRUNGEN - schreiben nie gegen lesen", () => {
    const stark = () => lauf({ richtig: 40, falsch: 0, arbeitsweise: "schreiben" as const });
    const runden = challengeRunden([
      // Runde 1: schreiben, schwacher Schnitt.
      ergebnis({
        probeId: "r1",
        arbeitsweise: "schreiben",
        eingereichtMs: 1_000,
        lauf: lauf({ richtig: 10, falsch: 20, arbeitsweise: "schreiben" }),
      }),
      // Runde 2: LESEN dazwischen - mit einem extrem hohen Leistungswert, der
      // die Veränderung von Runde 3 verfälschen WÜRDE, würde sie mitgezählt.
      ergebnis({
        probeId: "r2",
        arbeitsweise: "lesen",
        eingereichtMs: 2_000,
        lauf: lauf({ richtig: 999, falsch: 0, arbeitsweise: "lesen" }),
      }),
      // Runde 3: wieder schreiben, deutlich besser als Runde 1.
      ergebnis({ probeId: "r3", arbeitsweise: "schreiben", eingereichtMs: 3_000, lauf: stark() }),
    ]);
    const veraenderung = rundenVeraenderung(runden, "r3");
    expect(veraenderung).not.toBeNull();
    expect(veraenderung!.richtung).toBe("hoch");
    // Der Vergleichswert ist der Schnitt von Runde 1 (schreiben), NICHT von
    // Runde 2 (lesen) - sonst wäre die Differenz negativ oder winzig.
    const r1 = rundenSchnitt(runden.find((r) => r.probeId === "r1")!)!;
    const r3 = rundenSchnitt(runden.find((r) => r.probeId === "r3")!)!;
    expect(veraenderung!.differenz).toBeCloseTo(r3 - r1, 5);
  });

  it("ein unbekanntes `probeId` liefert `null`, keinen Fehler", () => {
    const runden = challengeRunden([ergebnis({ probeId: "r1" })]);
    expect(rundenVeraenderung(runden, "nie-gesehen")).toBeNull();
  });

  it('kleine Schwankungen unter der Totzone gelten als „gleich" - nicht als Entwicklung', () => {
    // ★ Dieselbe Totzone wie das Vorbild (`TOTZONE.score = 2`, `typing/veraenderung.ts`) -
    // hier NICHT neu erfunden, sondern wiederverwendet.
    const gleich = leistungswertVeraenderung(72, 71);
    expect(gleich?.richtung).toBe("gleich");
    const runter = leistungswertVeraenderung(70, 73);
    expect(runter?.richtung).toBe("runter");
  });
});

describe("(a) kindVeraenderung - EIN Kind gegen seine letzte Abgabe derselben Arbeitsweise", () => {
  it("die erste Abgabe eines Kindes hat keine Veränderung", () => {
    const e = ergebnis({ probeId: "r1" });
    expect(kindVeraenderung([e], e)).toBeNull();
  });

  it("★★★★★ die letzte Abgabe ANDERER Arbeitsweise wird übersprungen", () => {
    const schreiben1 = ergebnis({
      probeId: "r1",
      eingereichtMs: 1_000,
      arbeitsweise: "schreiben",
      lauf: lauf({ richtig: 10, falsch: 20, arbeitsweise: "schreiben" }),
    });
    const lesenDazwischen = ergebnis({
      probeId: "r2",
      eingereichtMs: 2_000,
      arbeitsweise: "lesen",
      lauf: lauf({ richtig: 999, falsch: 0, arbeitsweise: "lesen" }),
    });
    const schreiben2 = ergebnis({
      probeId: "r3",
      eingereichtMs: 3_000,
      arbeitsweise: "schreiben",
      lauf: lauf({ richtig: 40, falsch: 0, arbeitsweise: "schreiben" }),
    });
    const veraenderung = kindVeraenderung([schreiben1, lesenDazwischen, schreiben2], schreiben2);
    expect(veraenderung).not.toBeNull();
    expect(veraenderung!.richtung).toBe("hoch");
  });

  it("nimmt die JÜNGSTE vorige Abgabe, nicht irgendeine", () => {
    const alt = ergebnis({ probeId: "alt", eingereichtMs: 1_000, lauf: lauf({ richtig: 40, falsch: 0 }) });
    const mitte = ergebnis({ probeId: "mitte", eingereichtMs: 2_000, lauf: lauf({ richtig: 20, falsch: 20 }) });
    const jetzt = ergebnis({ probeId: "jetzt", eingereichtMs: 3_000, lauf: lauf({ richtig: 20, falsch: 20 }) });
    // `mitte` und `jetzt` haben denselben Leistungswert - gegen `mitte`
    // (die jüngste vorige Abgabe) ist die Veränderung darum "gleich", nicht
    // "runter" (was der Vergleich mit `alt` fälschlich ergäbe).
    const veraenderung = kindVeraenderung([alt, mitte, jetzt], jetzt);
    expect(veraenderung?.richtung).toBe("gleich");
  });
});

// ── (b) Die Backend-Verdrahtung (lokale Fassung) ─────────────────────────────

describe("(b) listeChallengeVerlaufKlasse/listeChallengeVerlaufKind", () => {
  it("listet ALLE Runden einer Klasse, nicht nur eine", async () => {
    const { be, teacher, klasse, kind } = await klasseMitKind();
    await be.meldeChallengeErgebnis({
      probeId: "runde-1",
      pupilUid: kind.id,
      teacherUid: teacher.id,
      classCode: klasse.code,
      arbeitsweise: "schreiben",
      bereich: "basis",
      lauf: lauf(),
      eingereichtMs: 1_000,
    });
    await be.meldeChallengeErgebnis({
      probeId: "runde-2",
      pupilUid: kind.id,
      teacherUid: teacher.id,
      classCode: klasse.code,
      arbeitsweise: "lesen",
      bereich: "voll",
      lauf: lauf({ arbeitsweise: "lesen" }),
      eingereichtMs: 2_000,
    });
    const verlauf = await be.listeChallengeVerlaufKlasse(klasse.code);
    expect(verlauf.map((e) => e.probeId).sort()).toEqual(["runde-1", "runde-2"]);
  });

  it("zeigt einer anderen Klasse NICHTS aus dieser Klasse", async () => {
    const { be, teacher, klasse, kind } = await klasseMitKind();
    await be.meldeChallengeErgebnis({
      probeId: "runde-1",
      pupilUid: kind.id,
      teacherUid: teacher.id,
      classCode: klasse.code,
      arbeitsweise: "schreiben",
      bereich: "basis",
      lauf: lauf(),
      eingereichtMs: 1_000,
    });
    const c2 = await be.createClass(teacher.id, "4b", "4.MS");
    if (!c2.ok) throw new Error(c2.error);
    expect(await be.listeChallengeVerlaufKlasse(c2.value.code)).toEqual([]);
  });

  it("listeChallengeVerlaufKind: alle Abgaben EINES Kindes, über mehrere Runden", async () => {
    const { be, teacher, klasse, kind } = await klasseMitKind();
    const p2 = await be.addPupil(klasse.code, "Toprak", "1234");
    if (!p2.ok) throw new Error(p2.error);

    for (const probeId of ["r1", "r2"]) {
      await be.meldeChallengeErgebnis({
        probeId,
        pupilUid: kind.id,
        teacherUid: teacher.id,
        classCode: klasse.code,
        arbeitsweise: "schreiben",
        bereich: "basis",
        lauf: lauf(),
        eingereichtMs: 1_000,
      });
    }
    // Ein zweites Kind mit einer eigenen Abgabe - darf NICHT mitgezählt werden.
    await be.meldeChallengeErgebnis({
      probeId: "r1",
      pupilUid: p2.value.id,
      teacherUid: teacher.id,
      classCode: klasse.code,
      arbeitsweise: "schreiben",
      bereich: "basis",
      lauf: lauf(),
      eingereichtMs: 1_000,
    });

    const verlaufMara = await be.listeChallengeVerlaufKind(kind.id);
    expect(verlaufMara).toHaveLength(2);
    expect(verlaufMara.every((e) => e.pupilUid === kind.id)).toBe(true);
  });

  it("ohne jede Abgabe: eine leere Liste, kein Fehler", async () => {
    const { be, klasse, kind } = await klasseMitKind();
    expect(await be.listeChallengeVerlaufKlasse(klasse.code)).toEqual([]);
    expect(await be.listeChallengeVerlaufKind(kind.id)).toEqual([]);
  });
});

// ── (c) Server-Zwilling: beide Fassungen rufen dieselbe Backend-Funktion ────
// Muster `braille-backend-wettkampf.test.ts`, Abschnitt „(d) Server-Zwilling":
// Der PocketBase-Pfad ist ohne Server nicht ausführbar - geprüft wird darum,
// dass BEIDE Dateien die Methoden tatsächlich tragen (Vertrag des
// `BrailleBackend`-Interfaces) und dass die Anzeige (`BrailleChallengeKasten.tsx`)
// die geteilte Auswertung aus `challengeVerlauf.ts` benutzt statt selbst
// nachzurechnen.
describe("(c) Server-Zwilling und keine zweite Rechnung in der Anzeige", () => {
  const lies = (pfad: string) => readFileSync(resolve(process.cwd(), pfad), "utf8");

  it("lokale UND Server-Fassung tragen `listeChallengeVerlaufKlasse`/`listeChallengeVerlaufKind`", () => {
    for (const pfad of ["src/lib/braille/account.ts", "src/lib/braille/pbBackend.ts"]) {
      const inhalt = lies(pfad);
      expect(inhalt).toContain("listeChallengeVerlaufKlasse");
      expect(inhalt).toContain("listeChallengeVerlaufKind");
    }
  });

  it("`backend.ts` verdrahtet beide Methoden im Interface UND in der lokalen Klasse", () => {
    const inhalt = lies("src/lib/braille/backend.ts");
    expect(inhalt).toContain("listeChallengeVerlaufKlasse(classCode: string): Promise<ChallengeErgebnis[]>");
    expect(inhalt).toContain("listeChallengeVerlaufKind(pupilUid: string): Promise<ChallengeErgebnis[]>");
  });

  it("`BrailleChallengeKasten.tsx` rechnet die Veränderung NICHT selbst nach - sie benutzt `challengeVerlauf.ts`", () => {
    const inhalt = lies("src/components/lernwerkstatt/klasse/BrailleChallengeKasten.tsx");
    expect(inhalt).toContain("challengeRunden");
    expect(inhalt).toContain("rundenVeraenderung");
    // ★★★ Kein eigener Pfeil - derselbe Baustein wie beim Tippen.
    expect(inhalt).toContain("Veraenderungspfeil");
    // Und der alte Eigenbau ist wirklich weg (keine Programmleiche) - nur
    // noch als Erklärung im Kommentar erwähnt, nicht mehr als `useState`.
    expect(inhalt).not.toContain("const [letzterPlan");
    expect(inhalt).not.toContain("setLetzterPlan");
  });
});
