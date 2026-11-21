/**
 * Die Braille-Challenge (`challenge.ts`) - Plan, Phasen und die Regel „eine
 * Abgabe je Kind und Runde ist unmoeglich". Vorbild `typing/schreibprobe.ts`
 * (dort „Tippchallenge"), bewusst dupliziert (siehe Kopfkommentar der
 * geprueften Datei).
 */
import { describe, it, expect } from "vitest";
import {
  BRAILLE_CHALLENGE_WORT,
  BRAILLE_BEZUGSTEMPO,
  CHALLENGE_EINSTIEGSFENSTER_MIN,
  CHALLENGE_DAUER_MIN_KLEINST,
  CHALLENGE_DAUER_MIN_GROESST,
  CHALLENGE_ANSAGE_BEI_SEKUNDEN,
  CHALLENGE_LEERER_STAND,
  CHALLENGE_UHR_SPIELRAUM_MS,
  challengePlanAusRoh,
  challengePhaseVon,
  challengeEinstiegBisMs,
  challengeDauerMs,
  challengeRestMs,
  kannAbgeben,
  challengeWertung,
  neueChallengeId,
  challengeRestGesprochen,
  type ChallengePlan,
  type ChallengeKindStand,
} from "../src/lib/braille/challenge";

function plan(partial: Partial<ChallengePlan> = {}): ChallengePlan {
  return {
    id: "bc1",
    arbeitsweise: "schreiben",
    bereich: "basis",
    startMs: 1_000_000,
    dauerMin: 10,
    angelegtMs: 900_000,
    ...partial,
  };
}

describe("das eine Wort", () => {
  it("heisst Braille-Challenge", () => {
    expect(BRAILLE_CHALLENGE_WORT).toBe("Braille-Challenge");
  });
});

describe("BRAILLE_BEZUGSTEMPO", () => {
  it("ist 78 - das hoechste Tempo-Ziel aus stars.ts (STUFE_TARGET_CPM[10])", () => {
    expect(BRAILLE_BEZUGSTEMPO).toBe(78);
  });
});

describe("challengePlanAusRoh", () => {
  it("liest einen gueltigen Plan", () => {
    const roh = {
      id: "bc1",
      arbeitsweise: "lesen",
      bereich: "voll",
      startMs: 1_000_000,
      dauerMin: 12,
      angelegtMs: 900_000,
    };
    expect(challengePlanAusRoh(roh)).toEqual({
      id: "bc1",
      arbeitsweise: "lesen",
      bereich: "voll",
      startMs: 1_000_000,
      dauerMin: 12,
      angelegtMs: 900_000,
    });
  });

  it("wehrhaft: kein Objekt ⇒ null", () => {
    expect(challengePlanAusRoh(null)).toBeNull();
    expect(challengePlanAusRoh("unsinn")).toBeNull();
    expect(challengePlanAusRoh(42)).toBeNull();
  });

  it("wehrhaft: fehlende id ⇒ null", () => {
    expect(challengePlanAusRoh({ arbeitsweise: "schreiben", bereich: "basis", startMs: 1, dauerMin: 5 })).toBeNull();
  });

  it("wehrhaft: falsche Arbeitsweise ⇒ null (kein Rateergebnis)", () => {
    expect(
      challengePlanAusRoh({ id: "x", arbeitsweise: "tippen", bereich: "basis", startMs: 1, dauerMin: 5 }),
    ).toBeNull();
  });

  it("wehrhaft: fehlender Schriftbereich ⇒ null", () => {
    expect(
      challengePlanAusRoh({ id: "x", arbeitsweise: "schreiben", startMs: 1, dauerMin: 5 }),
    ).toBeNull();
  });

  it("wehrhaft: startMs 0 oder negativ ⇒ null", () => {
    expect(
      challengePlanAusRoh({ id: "x", arbeitsweise: "schreiben", bereich: "basis", startMs: 0, dauerMin: 5 }),
    ).toBeNull();
  });

  it(`wehrhaft: dauerMin ausserhalb [${CHALLENGE_DAUER_MIN_KLEINST}, ${CHALLENGE_DAUER_MIN_GROESST}] ⇒ null`, () => {
    expect(
      challengePlanAusRoh({ id: "x", arbeitsweise: "schreiben", bereich: "basis", startMs: 1, dauerMin: 0 }),
    ).toBeNull();
    expect(
      challengePlanAusRoh({
        id: "x",
        arbeitsweise: "schreiben",
        bereich: "basis",
        startMs: 1,
        dauerMin: CHALLENGE_DAUER_MIN_GROESST + 1,
      }),
    ).toBeNull();
  });

  it("angelegtMs faellt auf startMs zurueck, wenn es fehlt", () => {
    const p = challengePlanAusRoh({ id: "x", arbeitsweise: "schreiben", bereich: "basis", startMs: 5000, dauerMin: 5 });
    expect(p?.angelegtMs).toBe(5000);
  });
});

describe("challengePhaseVon", () => {
  it("keine Challenge geplant ⇒ keine", () => {
    expect(challengePhaseVon(null, CHALLENGE_LEERER_STAND, 0)).toBe("keine");
  });

  it("vor dem Start (ausserhalb des Uhr-Spielraums) ⇒ keine", () => {
    const p = plan({ startMs: 1_000_000 });
    const jetzt = p.startMs - CHALLENGE_UHR_SPIELRAUM_MS - 1;
    expect(challengePhaseVon(p, CHALLENGE_LEERER_STAND, jetzt)).toBe("keine");
  });

  it("innerhalb des Uhr-Spielraums VOR dem Start gilt schon als offen", () => {
    const p = plan({ startMs: 1_000_000 });
    const jetzt = p.startMs - CHALLENGE_UHR_SPIELRAUM_MS + 1;
    expect(challengePhaseVon(p, CHALLENGE_LEERER_STAND, jetzt)).toBe("offen");
  });

  it("im Einstiegsfenster, noch nicht begonnen ⇒ offen", () => {
    const p = plan({ startMs: 1_000_000 });
    expect(challengePhaseVon(p, CHALLENGE_LEERER_STAND, p.startMs + 60_000)).toBe("offen");
  });

  it("Einstiegsfenster zu, nie begonnen ⇒ verpasst", () => {
    const p = plan({ startMs: 1_000_000 });
    const nachFenster = challengeEinstiegBisMs(p) + 1;
    expect(challengePhaseVon(p, CHALLENGE_LEERER_STAND, nachFenster)).toBe("verpasst");
  });

  it("begonnen, Zeit laeuft noch ⇒ laeuft", () => {
    const p = plan({ dauerMin: 10 });
    const stand: ChallengeKindStand = { beginnMs: 1_000_000, abgegeben: false, abgemeldet: false };
    expect(challengePhaseVon(p, stand, 1_000_000 + 5 * 60_000)).toBe("laeuft");
  });

  it("begonnen, Zeit abgelaufen (aber nicht abgegeben) ⇒ abgegeben", () => {
    const p = plan({ dauerMin: 10 });
    const stand: ChallengeKindStand = { beginnMs: 1_000_000, abgegeben: false, abgemeldet: false };
    expect(challengePhaseVon(p, stand, 1_000_000 + 11 * 60_000)).toBe("abgegeben");
  });

  it("abgegeben ⇒ abgegeben, unabhaengig von der Uhr", () => {
    const p = plan();
    const stand: ChallengeKindStand = { beginnMs: 1_000_000, abgegeben: true, abgemeldet: false };
    expect(challengePhaseVon(p, stand, 0)).toBe("abgegeben");
  });

  it("abgemeldet ⇒ keine", () => {
    const p = plan();
    const stand: ChallengeKindStand = { beginnMs: 0, abgegeben: false, abgemeldet: true };
    expect(challengePhaseVon(p, stand, p.startMs)).toBe("keine");
  });
});

describe("challengeDauerMs / challengeRestMs", () => {
  it("volle Dauer, solange nicht begonnen", () => {
    const p = plan({ dauerMin: 10 });
    expect(challengeDauerMs(p)).toBe(600_000);
    expect(challengeRestMs(p, CHALLENGE_LEERER_STAND, 999_999_999)).toBe(600_000);
  });

  it("zaehlt seit dem ersten Anschlag, nie negativ", () => {
    const p = plan({ dauerMin: 10 });
    const stand: ChallengeKindStand = { beginnMs: 1_000_000, abgegeben: false, abgemeldet: false };
    expect(challengeRestMs(p, stand, 1_000_000 + 100_000)).toBe(500_000);
    expect(challengeRestMs(p, stand, 1_000_000 + 999_000_000)).toBe(0);
  });
});

describe("kannAbgeben", () => {
  it("nur waehrend die Runde fuer dieses Kind laeuft", () => {
    const p = plan({ dauerMin: 10 });
    const nichtBegonnen: ChallengeKindStand = { beginnMs: 0, abgegeben: false, abgemeldet: false };
    expect(kannAbgeben(p, nichtBegonnen, p.startMs + 60_000)).toBe(false);

    const laeuft: ChallengeKindStand = { beginnMs: p.startMs, abgegeben: false, abgemeldet: false };
    expect(kannAbgeben(p, laeuft, p.startMs + 60_000)).toBe(true);

    const schonAb: ChallengeKindStand = { beginnMs: p.startMs, abgegeben: true, abgemeldet: false };
    expect(kannAbgeben(p, schonAb, p.startMs + 60_000)).toBe(false);
  });
});

describe("challengeWertung", () => {
  it("rechnet mit BRAILLE_BEZUGSTEMPO", () => {
    const w = challengeWertung({
      lauf: {
        arbeitsweise: "schreiben",
        bereich: "basis",
        arbeitszeitMs: 60_000,
        ansageMs: 0,
        richtig: BRAILLE_BEZUGSTEMPO, // = Bezugstempo je Minute
        falsch: 0,
      },
    });
    expect(w.tempoAnteil).toBeCloseTo(1, 5);
    expect(w.guete).toBeCloseTo(1, 5);
    expect(w.wert).toBeCloseTo(100, 1);
  });
});

describe("neueChallengeId", () => {
  it("liefert eindeutige, mit bc beginnende Kennungen", () => {
    const a = neueChallengeId(1_000_000);
    const b = neueChallengeId(1_000_000);
    expect(a.startsWith("bc")).toBe(true);
    expect(a).not.toBe(b);
  });
});

describe("challengeRestGesprochen - keine tickende Meldung", () => {
  it("sagt nur runde Minuten/Sekunden, nie Sekundenbruchteile", () => {
    expect(challengeRestGesprochen(300_000)).toBe("Noch 5 Minuten.");
    expect(challengeRestGesprochen(60_000)).toBe("Noch 1 Minute.");
    expect(challengeRestGesprochen(10_000)).toBe("Noch 10 Sekunden.");
    expect(challengeRestGesprochen(0)).toBe("Die Zeit ist um.");
  });

  it("CHALLENGE_ANSAGE_BEI_SEKUNDEN nennt genau die Momente, zu denen angesagt werden darf", () => {
    expect(CHALLENGE_ANSAGE_BEI_SEKUNDEN).toEqual([300, 60, 10]);
  });

  it(`das Einstiegsfenster ist ${CHALLENGE_EINSTIEGSFENSTER_MIN} Minuten`, () => {
    const p = plan({ startMs: 0 });
    expect(challengeEinstiegBisMs(p)).toBe(CHALLENGE_EINSTIEGSFENSTER_MIN * 60_000);
  });
});
