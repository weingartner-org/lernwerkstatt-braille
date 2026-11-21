/**
 * Das Braille-Klassenmatch (`klassenmatch.ts`) - Zustaende, Rangliste und der
 * feste Braillezeilen-Vorspann. Vorbild `typing/klassenmatch.ts`, bewusst
 * dupliziert (siehe Kopfkommentar der geprueften Datei).
 */
import { describe, it, expect } from "vitest";
import {
  MATCH_DAUER_MIN,
  MATCH_DAUER_MS,
  MATCH_VORSPANN_BREITE,
  MATCH_ANSAGE_BEI_SEKUNDEN,
  erlaubterUebergang,
  matchPhaseVon,
  matchOffen,
  offeneMatches,
  gebundeneKinder,
  einladbar,
  klassenmatchErlaubt,
  matchWert,
  rangliste,
  kugelPositionen,
  matchZeitstand,
  einladungSatz,
  dabeiSatz,
  dabeiNamen,
  platzSatz,
  matchRestGesprochen,
  countdownAnsage,
  MATCH_NIEMAND_DABEI,
  type BrailleMatch,
  type BrailleMatchStand,
} from "../src/lib/braille/klassenmatch";
import type { LaufErgebnis } from "../src/lib/braille/wertung";

function match(partial: Partial<BrailleMatch> = {}): BrailleMatch {
  return {
    id: "m1",
    classCode: "AB12",
    hostUid: "p1",
    hostName: "Sarah",
    arbeitsweise: "schreiben",
    bereich: "basis",
    status: "einladung",
    startMs: 0,
    endeMs: 0,
    dauerMin: MATCH_DAUER_MIN,
    createdMs: 1000,
    ...partial,
  };
}

function lauf(partial: Partial<LaufErgebnis> = {}): LaufErgebnis {
  return {
    arbeitsweise: "schreiben",
    bereich: "basis",
    arbeitszeitMs: 60_000,
    ansageMs: 0,
    richtig: 20,
    falsch: 0,
    ...partial,
  };
}

function stand(partial: Partial<BrailleMatchStand> = {}): BrailleMatchStand {
  return {
    id: "s1",
    matchId: "m1",
    classCode: "AB12",
    pupilUid: "p1",
    name: "Sarah",
    status: "schreibt",
    lauf: lauf(),
    updatedMs: 1000,
    ...partial,
  };
}

describe("Zustaende und erlaubte Uebergaenge", () => {
  it("Einladung -> Countdown -> laeuft -> fertig ist erlaubt", () => {
    expect(erlaubterUebergang("einladung", "countdown")).toBe(true);
    expect(erlaubterUebergang("countdown", "laeuft")).toBe(true);
    expect(erlaubterUebergang("laeuft", "fertig")).toBe(true);
  });

  it("jeder offene Zustand darf abbrechen", () => {
    expect(erlaubterUebergang("einladung", "abgebrochen")).toBe(true);
    expect(erlaubterUebergang("countdown", "abgebrochen")).toBe(true);
    expect(erlaubterUebergang("laeuft", "abgebrochen")).toBe(true);
  });

  it("fertig und abgebrochen sind Endzustaende", () => {
    expect(erlaubterUebergang("fertig", "laeuft")).toBe(false);
    expect(erlaubterUebergang("abgebrochen", "countdown")).toBe(false);
  });

  it("verbietet einen Ruecksprung (laeuft -> einladung)", () => {
    expect(erlaubterUebergang("laeuft", "einladung")).toBe(false);
  });

  it("verbietet, eine Stufe zu ueberspringen (Einladung -> laeuft)", () => {
    expect(erlaubterUebergang("einladung", "laeuft")).toBe(false);
  });
});

describe("matchPhaseVon", () => {
  it("kein Match ⇒ keine", () => {
    expect(matchPhaseVon(null, 0)).toBe("keine");
  });

  it("status einladung, kein startMs ⇒ einladung", () => {
    expect(matchPhaseVon(match({ status: "einladung", startMs: 0 }), 5000)).toBe("einladung");
  });

  it("vor dem Start ⇒ countdown", () => {
    const m = match({ status: "countdown", startMs: 10_000 });
    expect(matchPhaseVon(m, 5000)).toBe("countdown");
  });

  it("nach dem Start, vor dem Ende ⇒ laeuft", () => {
    const m = match({ status: "laeuft", startMs: 10_000, endeMs: 10_000 + MATCH_DAUER_MS });
    expect(matchPhaseVon(m, 10_000 + 60_000)).toBe("laeuft");
  });

  it("nach dem Ende ⇒ fertig, auch wenn der Server es noch nicht weiss", () => {
    const m = match({ status: "laeuft", startMs: 10_000, endeMs: 10_000 + MATCH_DAUER_MS });
    expect(matchPhaseVon(m, 10_000 + MATCH_DAUER_MS + 1)).toBe("fertig");
  });

  it("status fertig/abgebrochen ⇒ fertig", () => {
    expect(matchPhaseVon(match({ status: "fertig" }), 0)).toBe("fertig");
    expect(matchPhaseVon(match({ status: "abgebrochen" }), 0)).toBe("fertig");
  });
});

describe("matchOffen / offeneMatches", () => {
  it("nur einladung/countdown/laeuft gelten als offen", () => {
    expect(matchOffen(match({ status: "einladung" }), 0)).toBe(true);
    expect(matchOffen(match({ status: "fertig" }), 0)).toBe(false);
  });

  it("offeneMatches sortiert juengstes zuerst", () => {
    const a = match({ id: "a", createdMs: 100 });
    const b = match({ id: "b", createdMs: 200 });
    expect(offeneMatches([a, b], 0).map((m) => m.id)).toEqual(["b", "a"]);
  });
});

describe("Kind laedt Kind ein: gebundeneKinder / einladbar", () => {
  it("der Gastgeber eines offenen Matches ist gebunden", () => {
    const m = match({ hostUid: "p1", status: "einladung" });
    const gebunden = gebundeneKinder([m], [], 0);
    expect(gebunden.has("p1")).toBe(true);
  });

  it("ein Kind mit Stand dabei/schreibt in einem offenen Match ist gebunden", () => {
    const m = match({ id: "m1", status: "laeuft", startMs: 0, endeMs: MATCH_DAUER_MS });
    const s = stand({ matchId: "m1", pupilUid: "p2", status: "schreibt" });
    expect(gebundeneKinder([m], [s], 1000).has("p2")).toBe(true);
  });

  it("fertig bindet nicht - sofort wieder einladbar", () => {
    const m = match({ id: "m1", status: "laeuft", startMs: 0, endeMs: MATCH_DAUER_MS });
    const s = stand({ matchId: "m1", pupilUid: "p2", status: "fertig" });
    expect(einladbar("p2", [m], [s], 1000)).toBe(true);
  });

  it("ein unbeteiligtes Kind ist einladbar", () => {
    const m = match({ hostUid: "p1", status: "einladung" });
    expect(einladbar("p3", [m], [], 0)).toBe(true);
  });
});

describe("klassenmatchErlaubt", () => {
  it("erlaubt ohne Einstellung", () => {
    expect(klassenmatchErlaubt(undefined)).toBe(true);
    expect(klassenmatchErlaubt(null)).toBe(true);
    expect(klassenmatchErlaubt({})).toBe(true);
  });

  it("die Lehrkraft kann es abschalten", () => {
    expect(klassenmatchErlaubt({ klassenmatchAus: true })).toBe(false);
  });
});

describe("Rangliste - nur EINE Arbeitsweise", () => {
  it("bester Wert zuerst", () => {
    const schwach = stand({ pupilUid: "p1", name: "A", lauf: lauf({ richtig: 5 }) });
    const stark = stand({ pupilUid: "p2", name: "B", lauf: lauf({ richtig: 40 }) });
    const liste = rangliste([schwach, stark], "schreiben");
    expect(liste[0].stand.pupilUid).toBe("p2");
    expect(liste[0].platz).toBe(1);
    expect(liste[1].platz).toBe(2);
  });

  it("Staende einer ANDEREN Arbeitsweise werden nicht mitgezaehlt", () => {
    const schreiben = stand({ pupilUid: "p1", lauf: lauf({ arbeitsweise: "schreiben", richtig: 10 }) });
    const lesen = stand({ pupilUid: "p2", lauf: lauf({ arbeitsweise: "lesen", richtig: 999 }) });
    const liste = rangliste([schreiben, lesen], "schreiben");
    expect(liste).toHaveLength(1);
    expect(liste[0].stand.pupilUid).toBe("p1");
  });

  it("Gleichstand: mehr richtige zuerst, dann der Name", () => {
    const a = stand({ pupilUid: "p1", name: "Zenta", lauf: lauf({ richtig: 20, falsch: 0 }) });
    const b = stand({ pupilUid: "p2", name: "Anna", lauf: lauf({ richtig: 20, falsch: 0 }) });
    const liste = rangliste([a, b], "schreiben");
    // Gleicher Wert UND gleiche Anzahl Richtige -> Name entscheidet (Anna vor Zenta).
    expect(liste[0].stand.name).toBe("Anna");
  });

  it("matchWert ist immer >= 0 und endlich", () => {
    const s = stand({ lauf: lauf({ richtig: 0, falsch: 0, arbeitszeitMs: 0 }) });
    const w = matchWert(s);
    expect(Number.isFinite(w)).toBe(true);
    expect(w).toBeGreaterThanOrEqual(0);
  });
});

describe("kugelPositionen", () => {
  it("die erste Kugel steht nach voller Dauer ganz rechts (Anteil 1)", () => {
    const liste = rangliste([stand({ pupilUid: "p1", lauf: lauf({ richtig: 40 }) })], "schreiben");
    const pos = kugelPositionen(liste, MATCH_DAUER_MS, MATCH_DAUER_MS);
    expect(pos[0]).toBeCloseTo(1, 5);
  });

  it("ohne jeden Wert stehen alle links, keine Division durch 0", () => {
    const liste = rangliste([stand({ lauf: lauf({ richtig: 0 }) })], "schreiben");
    const pos = kugelPositionen(liste, 10_000, MATCH_DAUER_MS);
    expect(pos[0]).toBe(0);
    expect(Number.isFinite(pos[0])).toBe(true);
  });
});

describe("matchZeitstand - fester Braillezeilen-Vorspann", () => {
  it(`ist immer genau ${MATCH_VORSPANN_BREITE} Zellen breit`, () => {
    expect(matchZeitstand(2, 225_000)).toHaveLength(MATCH_VORSPANN_BREITE);
    expect(matchZeitstand(12, 225_000)).toHaveLength(MATCH_VORSPANN_BREITE);
    expect(matchZeitstand(1, 5_000)).toHaveLength(MATCH_VORSPANN_BREITE);
  });

  it("Platz und Restzeit stehen wie im Vorbild: P2 3:45", () => {
    expect(matchZeitstand(2, 225_000)).toBe("P2 3:45 ");
  });
});

describe("gesprochene Saetze", () => {
  it("Einladung nennt den Namen des Gastgebers", () => {
    expect(einladungSatz("Sarah")).toBe("Sarah lädt dich zu einem Klassenmatch ein.");
  });

  it("niemand dabei nennt den Grund", () => {
    expect(dabeiSatz([])).toBe(MATCH_NIEMAND_DABEI);
  });

  it("dabeiSatz nennt die Zahl und die neuesten Namen zuerst", () => {
    expect(dabeiSatz(["Toprak", "Sebastian", "Mustafa"])).toBe("3 dabei: Toprak, Sebastian, Mustafa");
  });

  it("dabeiNamen listet die Neuesten zuerst und laesst den Gastgeber weg", () => {
    const s1 = stand({ pupilUid: "host", name: "Sarah", updatedMs: 500 });
    const s2 = stand({ pupilUid: "p2", name: "Mustafa", updatedMs: 2000 });
    const s3 = stand({ pupilUid: "p3", name: "Toprak", updatedMs: 3000 });
    expect(dabeiNamen([s1, s2, s3], "host")).toEqual(["Toprak", "Mustafa"]);
  });

  it("platzSatz", () => {
    expect(platzSatz(2, 6)).toBe("Platz 2 von 6");
  });

  it("matchRestGesprochen sagt nur runde Zahlen an, wie im ANSAGE_BEI_SEKUNDEN vorgesehen", () => {
    expect(matchRestGesprochen(60_000)).toBe("Noch 1 Minute.");
    expect(matchRestGesprochen(10_000)).toBe("Noch 10 Sekunden.");
    expect(MATCH_ANSAGE_BEI_SEKUNDEN).toEqual([60, 10]);
  });

  it("countdownAnsage spricht nur 3, 2, 1, Los - sonst nichts", () => {
    expect(countdownAnsage(3)).toBe("3");
    expect(countdownAnsage(2)).toBe("2");
    expect(countdownAnsage(1)).toBe("1");
    expect(countdownAnsage(0)).toBe("Los!");
    expect(countdownAnsage(9)).toBeNull();
    expect(countdownAnsage(4)).toBeNull();
  });
});
