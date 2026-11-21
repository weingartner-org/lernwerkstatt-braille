/**
 * Tests für die Backend-Verdrahtung der drei Zubauten (22.09.2026):
 * Braille-Challenge, Klassenmatch, eigene Übungen. Geprüft wird die LOKALE
 * Fassung (`LocalBrailleBackend`/`account.ts`) - der PocketBase-Pfad ist ohne
 * Server nicht testbar (Muster `braille-backend.test.ts`). Beide Fassungen
 * rufen dieselben ungeänderten reinen Funktionen aus `challenge.ts`/
 * `klassenmatch.ts`/`eigeneUebung.ts` auf (`erlaubterUebergang`,
 * `reiheMitNeuer`, `challengePlanAusRoh`) - das IST der Server-Zwilling: Wo
 * die lokale Fassung hier ein Ergebnis bringt, bringt die Server-Fassung
 * dasselbe, weil beide dieselbe Entscheidung derselben Funktion befragen
 * (siehe „(d) Server-Zwilling" unten, und `tests/braille-match-hook.test.ts`
 * für den funktionalen Zwilling des Hooks selbst).
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { brailleBackend, _resetBrailleBackend } from "../src/lib/braille/backend";
import type { BrailleAccount } from "../src/lib/braille/account";
import {
  erlaubterUebergang,
  MATCH_DAUER_MIN,
  type MatchStatus,
} from "../src/lib/braille/klassenmatch";
import { neueChallengeId, type ChallengeErgebnis } from "../src/lib/braille/challenge";
import { EIGENE_UEBUNGEN_HOECHSTENS } from "../src/lib/braille/eigeneUebung";
import type { LaufErgebnis } from "../src/lib/braille/wertung";

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

// ── (a) Braille-Challenge ────────────────────────────────────────────────────

describe("(a) Braille-Challenge", () => {
  it("★★★★★ Plan schreiben lässt Tastenflow-Nachbarn im selben Topf stehen", async () => {
    const { be, teacher, klasse } = await klasseMitKind();
    // Ein fremder Tastenflow-Wert liegt schon im selben JSON-Topf.
    await be.updateClassSettings(teacher.id, klasse.code, {
      unterrichtstag: 3,
      unterrichtstagAbMs: 1_756_000_000_000,
      unterrichtsende: 840,
    });

    const plan = {
      id: neueChallengeId(1_000),
      arbeitsweise: "schreiben" as const,
      bereich: "basis" as const,
      startMs: 2_000_000,
      dauerMin: 10,
      angelegtMs: 1_000,
    };
    const r = await be.setChallengePlan(teacher.id, klasse.code, plan);
    expect(r.ok).toBe(true);

    const settings = await be.getClassSettings(klasse.code);
    expect(settings?.punktgenau?.challenge).toEqual(plan);
    // ★ Der Tastenflow-Nachbar bleibt stehen (dieselbe Regel wie beim
    // Wochenaufgabe-Befund, `braille-klassen-einstellungen-topf.test.ts`).
    expect(settings?.unterrichtstag).toBe(3);
    expect(settings?.unterrichtsende).toBe(840);
  });

  it("★★★★★ zweimal abgeben ist unmöglich (derselbe Riegel wie der eindeutige Index am Server)", async () => {
    const { be, teacher, klasse, kind } = await klasseMitKind();
    const ergebnis: ChallengeErgebnis = {
      probeId: "runde-1",
      pupilUid: kind.id,
      teacherUid: teacher.id,
      classCode: klasse.code,
      arbeitsweise: "schreiben",
      bereich: "basis",
      lauf: lauf(),
      eingereichtMs: 5_000,
    };

    const erste = await be.meldeChallengeErgebnis(ergebnis);
    expect(erste.ok).toBe(true);

    // ★★★★★ Der zweite Versuch derselben Runde - nachgestellt wie verlangt.
    const zweite = await be.meldeChallengeErgebnis({
      ...ergebnis,
      lauf: lauf({ richtig: 999 }), // selbst ein "besseres" zweites Ergebnis zählt nicht
    });
    expect(zweite.ok).toBe(false);

    // Und es steht weiterhin das ERSTE Ergebnis, nicht das zweite.
    const gespeichert = await be.holeChallengeErgebnis(kind.id, "runde-1");
    expect(gespeichert?.lauf.richtig).toBe(40);
  });

  it("eine andere Runde (anderes probeId) darf dasselbe Kind sehr wohl abgeben", async () => {
    const { be, teacher, klasse, kind } = await klasseMitKind();
    const basis = {
      pupilUid: kind.id,
      teacherUid: teacher.id,
      classCode: klasse.code,
      arbeitsweise: "schreiben" as const,
      bereich: "basis" as const,
      lauf: lauf(),
      eingereichtMs: 5_000,
    };
    expect((await be.meldeChallengeErgebnis({ ...basis, probeId: "runde-1" })).ok).toBe(true);
    expect((await be.meldeChallengeErgebnis({ ...basis, probeId: "runde-2" })).ok).toBe(true);
  });

  it("listet alle Abgaben einer Runde für die Lehrkraft-Übersicht", async () => {
    const { be, teacher, klasse, kind } = await klasseMitKind();
    const p2 = await be.addPupil(klasse.code, "Toprak", "1234");
    if (!p2.ok) throw new Error(p2.error);

    for (const pupilUid of [kind.id, p2.value.id]) {
      await be.meldeChallengeErgebnis({
        probeId: "runde-1",
        pupilUid,
        teacherUid: teacher.id,
        classCode: klasse.code,
        arbeitsweise: "schreiben",
        bereich: "basis",
        lauf: lauf(),
        eingereichtMs: 5_000,
      });
    }
    const liste = await be.listeChallengeErgebnisse(klasse.code, "runde-1");
    expect(liste.map((e) => e.pupilUid).sort()).toEqual([kind.id, p2.value.id].sort());
  });

  it("ohne Abgabe meldet holeChallengeErgebnis null", async () => {
    const { be, kind } = await klasseMitKind();
    expect(await be.holeChallengeErgebnis(kind.id, "nie-abgegeben")).toBeNull();
  });
});

// ── (b) Klassenmatch ─────────────────────────────────────────────────────────

describe("(b) Klassenmatch", () => {
  it('das Häkchen „Klassenmatch aus" verhindert das Ausschreiben', async () => {
    const { be, teacher, klasse, kind } = await klasseMitKind();
    expect((await be.setKlassenmatchAus(teacher.id, klasse.code, true)).ok).toBe(true);
    await expect(be.erstelleMatch(kind, "schreiben", "basis")).rejects.toThrow(/ausgeschaltet/);

    // Und wieder erlaubt.
    expect((await be.setKlassenmatchAus(teacher.id, klasse.code, false)).ok).toBe(true);
    const match = await be.erstelleMatch(kind, "schreiben", "basis");
    expect(match?.status).toBe("einladung");
  });

  it("★★★ folgt streng den erlaubten Übergängen - genau wie `erlaubterUebergang()`", async () => {
    const { be, kind } = await klasseMitKind();
    const match = await be.erstelleMatch(kind, "schreiben", "basis");
    if (!match) throw new Error("kein Match");

    // einladung → laeuft ist NICHT erlaubt (der Countdown fehlt).
    expect(erlaubterUebergang("einladung", "laeuft")).toBe(false);
    expect(await be.aktualisiereMatch(match.id, "laeuft")).toBeNull();

    // einladung → countdown: erlaubt, UND der „Server" setzt die Zeiten.
    const nachCountdown = await be.aktualisiereMatch(match.id, "countdown");
    expect(nachCountdown?.status).toBe("countdown");
    expect(nachCountdown?.startMs).toBeGreaterThan(Date.now());
    expect(nachCountdown?.endeMs).toBeGreaterThan(nachCountdown!.startMs);
    expect(nachCountdown?.dauerMin).toBe(MATCH_DAUER_MIN);

    // countdown → laeuft: erlaubt.
    expect((await be.aktualisiereMatch(match.id, "laeuft"))?.status).toBe("laeuft");

    // laeuft → fertig: erlaubt.
    expect((await be.aktualisiereMatch(match.id, "fertig"))?.status).toBe("fertig");

    // fertig → irgendwas: nie mehr erlaubt.
    expect(await be.aktualisiereMatch(match.id, "countdown")).toBeNull();
    expect(await be.aktualisiereMatch(match.id, "abgebrochen")).toBeNull();
  });

  it("beitreten (die eigene Stand-Zeile) legt EINE Zeile an und schreibt sie fort, nicht zweimal", async () => {
    const { be, kind } = await klasseMitKind();
    const match = await be.erstelleMatch(kind, "schreiben", "basis");
    if (!match) throw new Error("kein Match");

    const erst = await be.schreibeMatchStand(kind, match.id, "schreiben", "basis", {
      status: "dabei",
      lauf: lauf({ richtig: 0, falsch: 0 }),
    });
    expect(erst?.status).toBe("dabei");

    const danach = await be.schreibeMatchStand(kind, match.id, "schreiben", "basis", {
      status: "schreibt",
      lauf: lauf({ richtig: 12 }),
    });
    expect(danach?.id).toBe(erst?.id); // dieselbe Zeile, fortgeschrieben

    const staende = await be.listeMatchStaende(match.id, "schreiben", "basis");
    expect(staende).toHaveLength(1);
    expect(staende[0].lauf.richtig).toBe(12);
    // ⚠️ `lauf` wird vollständig rekonstruiert - inkl. Arbeitsweise/Bereich,
    // die die Stand-Zeile selbst nicht trägt (siehe `setup.mjs`).
    expect(staende[0].lauf.arbeitsweise).toBe("schreiben");
    expect(staende[0].lauf.bereich).toBe("basis");
  });

  it("in ein fertiges/abgesagtes Match kann niemand mehr seinen Stand schreiben", async () => {
    const { be, kind } = await klasseMitKind();
    const match = await be.erstelleMatch(kind, "schreiben", "basis");
    if (!match) throw new Error("kein Match");
    await be.aktualisiereMatch(match.id, "abgebrochen");

    const stand = await be.schreibeMatchStand(kind, match.id, "schreiben", "basis", {
      status: "dabei",
      lauf: lauf(),
    });
    expect(stand).toBeNull();
  });

  it("listeMatches zeigt nur die Matches der eigenen Klasse", async () => {
    const { be, kind, klasse } = await klasseMitKind();
    await be.erstelleMatch(kind, "schreiben", "basis");

    // Eine zweite Klasse (eigene Lehrkraft) mit einem eigenen Match daneben.
    const t2 = await be.registerTeacher("Herr Novak", "n@s.at", "geheim1");
    if (!t2.ok) throw new Error(t2.error);
    const c2 = await be.createClass(t2.value.id, "4a", "4.MS");
    if (!c2.ok) throw new Error(c2.error);
    const p2 = await be.addPupil(c2.value.code, "Ben", "1234");
    if (!p2.ok) throw new Error(p2.error);
    await be.erstelleMatch(p2.value, "schreiben", "basis");

    const liste = await be.listeMatches(klasse.code);
    expect(liste.every((m) => m.classCode === klasse.code)).toBe(true);
    expect(liste.length).toBe(1);
  });

  it("Echtzeit: beobachteMatches meldet sich bei einer Änderung", async () => {
    const { be, kind, klasse } = await klasseMitKind();
    const gesehen: string[] = [];
    const stopp = be.beobachteMatches(klasse.code, (m) => gesehen.push(m.status));
    const match = await be.erstelleMatch(kind, "schreiben", "basis");
    if (!match) throw new Error("kein Match");
    await be.aktualisiereMatch(match.id, "countdown");
    stopp();
    expect(gesehen).toContain("einladung");
    expect(gesehen).toContain("countdown");
  });
});

// ── (c) Eigene Übungen ───────────────────────────────────────────────────────

describe("(c) Eigene Übungen", () => {
  it("eine neue Übung wird an die Reihe GEHÄNGT, nicht ersetzt", async () => {
    const { be, teacher, klasse } = await klasseMitKind();
    const erste = await be.starteEigeneUebung(klasse.code, teacher.id, {
      dateiname: "lesetext1.txt",
      arbeitsweise: "lesen",
      bereich: "basis",
      zeilen: ["Hallo Welt"],
    });
    expect(erste?.map((e) => e.dateiname)).toEqual(["lesetext1.txt"]);

    const zweite = await be.starteEigeneUebung(klasse.code, teacher.id, {
      dateiname: "lesetext2.txt",
      arbeitsweise: "lesen",
      bereich: "basis",
      zeilen: ["Zweiter Text"],
    });
    expect(zweite?.map((e) => e.dateiname)).toEqual(["lesetext1.txt", "lesetext2.txt"]);

    const reihe = await be.listeEigeneUebungen(klasse.code);
    expect(reihe).toHaveLength(2);
  });

  it("★★★ über der Obergrenze fällt die älteste FERTIGE Übung heraus (Muster `reiheMitNeuer`)", async () => {
    const { be, teacher, klasse } = await klasseMitKind();
    let reihe = await be.starteEigeneUebung(klasse.code, teacher.id, {
      dateiname: "text-0.txt",
      arbeitsweise: "lesen",
      bereich: "basis",
      zeilen: ["x"],
    });
    const ersteId = reihe![0].textId;

    for (let i = 1; i < EIGENE_UEBUNGEN_HOECHSTENS; i++) {
      reihe = await be.starteEigeneUebung(klasse.code, teacher.id, {
        dateiname: `text-${i}.txt`,
        arbeitsweise: "lesen",
        bereich: "basis",
        zeilen: ["x"],
      });
    }
    expect(reihe).toHaveLength(EIGENE_UEBUNGEN_HOECHSTENS);

    // Die (EIGENE_UEBUNGEN_HOECHSTENS+1)-te Übung: die erste ist "von allen
    // fertig" - sie fällt heraus, nicht irgendeine andere.
    reihe = await be.starteEigeneUebung(
      klasse.code,
      teacher.id,
      { dateiname: "text-neu.txt", arbeitsweise: "lesen", bereich: "basis", zeilen: ["x"] },
      [ersteId],
    );
    expect(reihe).toHaveLength(EIGENE_UEBUNGEN_HOECHSTENS);
    expect(reihe!.some((e) => e.textId === ersteId)).toBe(false);
    expect(reihe!.some((e) => e.dateiname === "text-neu.txt")).toBe(true);
  });

  it('„Beenden" nimmt die Übung aus der Reihe, der Inhalt bleibt lesbar', async () => {
    const { be, teacher, klasse } = await klasseMitKind();
    const reihe = await be.starteEigeneUebung(klasse.code, teacher.id, {
      dateiname: "lesetext.txt",
      arbeitsweise: "lesen",
      bereich: "basis",
      zeilen: ["Erste Zeile", "Zweite Zeile"],
    });
    const textId = reihe![0].textId;

    const nachBeenden = await be.beendeEigeneUebung(klasse.code, textId);
    expect(nachBeenden).toHaveLength(0);
    expect((await be.listeEigeneUebungen(klasse.code))).toHaveLength(0);

    // Der Inhalt selbst bleibt lesbar - nur die Reihe ist leer.
    const text = await be.leseEigenenText(textId);
    expect(text?.zeilen).toEqual(["Erste Zeile", "Zweite Zeile"]);
  });

  it('★★★ „Fertig" steht je Kind UND je Text, am Konto', async () => {
    const { be, teacher, klasse, kind } = await klasseMitKind();
    const p2 = await be.addPupil(klasse.code, "Toprak", "1234");
    if (!p2.ok) throw new Error(p2.error);

    const reihe = await be.starteEigeneUebung(klasse.code, teacher.id, {
      dateiname: "lesetext.txt",
      arbeitsweise: "lesen",
      bereich: "basis",
      zeilen: ["Hallo"],
    });
    const textId = reihe![0].textId;

    expect((await be.leseEigeneUebungFortschritt(kind.id))?.[textId]).toBeUndefined();

    expect(await be.meldeEigeneUebungFertig(kind.id, textId)).toBe(true);
    expect((await be.leseEigeneUebungFortschritt(kind.id))?.[textId]?.fertig).toBe(true);
    // Das ANDERE Kind ist unberührt - „je Kind" gilt wörtlich.
    expect((await be.leseEigeneUebungFortschritt(p2.value.id))?.[textId]).toBeUndefined();

    const fortschritte = await be.leseEigeneUebungFortschritteDerKlasse(klasse.code);
    const fertigeZahl = fortschritte.filter((f) => f?.[textId]?.fertig).length;
    expect(fertigeZahl).toBe(1);
  });
});

// ── (d) Server-Zwilling: lokale und Server-Fassung benutzen dieselbe Logik ──

describe("(d) Server-Zwilling: account.ts und pbBackend.ts befragen dieselben reinen Funktionen", () => {
  const account = () => readFileSync(resolve(process.cwd(), "src/lib/braille/account.ts"), "utf8");
  const pb = () => readFileSync(resolve(process.cwd(), "src/lib/braille/pbBackend.ts"), "utf8");

  it("★★★★★ beide benutzen `erlaubterUebergang` aus `klassenmatch.ts` - keine eigene Kopie der Übergänge", () => {
    expect(account()).toContain("erlaubterUebergang");
    expect(pb()).not.toContain("MATCH_UEBERGAENGE"); // die Tabelle selbst ist NICHT exportiert - nur die Funktion
  });

  it("beide benutzen `reiheMitNeuer` aus `eigeneUebung.ts` - keine eigene Kappungslogik", () => {
    expect(account()).toContain("reiheMitNeuer");
    expect(pb()).toContain("reiheMitNeuer");
  });

  it("★★★ beide führen den Punktgenau-Plan zusammen statt ihn zu ersetzen (`einstellungenZusammenfuehren`)", () => {
    expect(account()).toContain("einstellungenZusammenfuehren");
    expect(pb()).toContain("einstellungenZusammenfuehren");
    // Und keine der beiden Stellen ersetzt `settings` direkt mit dem rohen Teil.
    expect(pb()).not.toMatch(/update\(rec\.id,\s*\{\s*settings:\s*teil\s*\}\)/);
  });

  it("`aktualisiereMatchStatus` (lokal) entscheidet für JEDE Kombination genau wie `erlaubterUebergang`", async () => {
    const alle: MatchStatus[] = ["einladung", "countdown", "laeuft", "fertig", "abgebrochen"];
    const kette: MatchStatus[] = ["einladung", "countdown", "laeuft", "fertig"];

    async function bringeInZustand(
      be: ReturnType<typeof brailleBackend>,
      matchId: string,
      ziel: MatchStatus,
    ) {
      if (ziel === "einladung") return;
      if (ziel === "abgebrochen") {
        await be.aktualisiereMatch(matchId, "abgebrochen");
        return;
      }
      const bis = kette.indexOf(ziel);
      for (let i = 1; i <= bis; i++) await be.aktualisiereMatch(matchId, kette[i]);
    }

    for (const von of alle) {
      for (const nach of alle) {
        _resetBrailleBackend();
        localStorage.clear();
        const { be, kind } = await klasseMitKind();
        const match = await be.erstelleMatch(kind, "schreiben", "basis");
        if (!match) throw new Error("kein Match");
        await bringeInZustand(be, match.id, von);
        const ergebnis = await be.aktualisiereMatch(match.id, nach);
        const erwartet = nach === von || erlaubterUebergang(von, nach);
        expect(ergebnis !== null, `${von} → ${nach}`).toBe(erwartet);
      }
    }
  });
});
