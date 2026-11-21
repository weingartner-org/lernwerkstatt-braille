import { describe, it, expect, beforeEach } from "vitest";
import {
  addPupil,
  createClass,
  forgetClassCode,
  getProgress,
  getRememberedClassCode,
  listPupils,
  loginPupil,
  loginTeacher,
  pupilStats,
  recordEvent,
  registerTeacher,
  rememberClassCode,
  saveAccountProgress,
  suspicionScore,
  type TaskEvent,
} from "../src/lib/braille";

beforeEach(() => localStorage.clear());

function mkTeacher() {
  const r = registerTeacher("Frau Berger", "berger@schule.at", "geheim1");
  if (!r.ok) throw new Error(r.error);
  return r.value;
}

const ev = (over: Partial<TaskEvent> = {}): TaskEvent => ({
  ts: 1_700_000_000_000,
  level: "l1-reihe1",
  system: "basis",
  direction: "write",
  correct: true,
  ms: 4000,
  cells: 2,
  ...over,
});

describe("Lehrkraft-Konto", () => {
  it("registriert und meldet an", () => {
    const t = mkTeacher();
    expect(t.role).toBe("lehrkraft");
    const ok = loginTeacher("berger@schule.at", "geheim1");
    expect(ok.ok && ok.value.id).toBe(t.id);
  });

  it("lehnt doppelte E-Mail, falsches Passwort und zu kurze Passwörter ab", () => {
    mkTeacher();
    expect(registerTeacher("X", "berger@schule.at", "abcdef").ok).toBe(false);
    expect(registerTeacher("Y", "y@s.at", "kurz").ok).toBe(false);
    expect(loginTeacher("berger@schule.at", "falsch").ok).toBe(false);
  });
});

describe("Klasse + Schüler:innen", () => {
  it("Lehrkraft legt Klasse und Schüler:innen an, Schüler:in meldet sich an", () => {
    const t = mkTeacher();
    const cls = createClass(t.id, "3b");
    expect(cls.ok).toBe(true);
    if (!cls.ok) return;
    const code = cls.value.code;
    expect(code).toHaveLength(6);

    const p = addPupil(code, "Mia", "1234");
    expect(p.ok).toBe(true);
    expect(listPupils(code).map((x) => x.name)).toEqual(["Mia"]);

    expect(loginPupil(code, "Mia", "1234").ok).toBe(true);
    expect(loginPupil(code, "mia", "1234").ok).toBe(true); // Name unabhängig von Groß/Klein
    expect(loginPupil(code, "Mia", "0000").ok).toBe(false);
    expect(loginPupil("XXXXXX", "Mia", "1234").ok).toBe(false);
  });

  it("verhindert doppelte Namen in einer Klasse", () => {
    const t = mkTeacher();
    const cls = createClass(t.id, "3b");
    if (!cls.ok) return;
    addPupil(cls.value.code, "Mia", "1234");
    expect(addPupil(cls.value.code, "Mia", "5678").ok).toBe(false);
  });

  it("Lehrkraft darf den Beitritts-Code selbst wählen (z. B. 3.MS)", () => {
    const t = mkTeacher();
    const r = createClass(t.id, "Mittelschule 3", "3.ms");
    expect(r.ok && r.value.code).toBe("3.MS"); // normalisiert (Großbuchstaben)
    // Schüler:in kann sich mit diesem Code anmelden
    addPupil("3.MS", "Mia", "1234");
    expect(loginPupil("3.MS", "Mia", "1234").ok).toBe(true);
  });

  it("lehnt vergebene und ungültige Wunsch-Codes ab, Zufallscode bleibt möglich", () => {
    const t = mkTeacher();
    expect(createClass(t.id, "A", "3.MS").ok).toBe(true);
    expect(createClass(t.id, "B", "3.ms").ok).toBe(false); // schon vergeben
    expect(createClass(t.id, "C", "x").ok).toBe(false); // zu kurz
    expect(createClass(t.id, "D", "mit leer").ok).toBe(false); // Leerzeichen unerlaubt
    const auto = createClass(t.id, "E"); // ohne Wunsch → Zufallscode
    expect(auto.ok && auto.value.code).toHaveLength(6);
  });
});

describe("Klassencode auf dem Gerät merken", () => {
  it("merkt den Code (normalisiert), liest ihn zurück und vergisst ihn", () => {
    expect(getRememberedClassCode()).toBe("");
    rememberClassCode("abc234");
    expect(getRememberedClassCode()).toBe("ABC234"); // getrimmt + Großbuchstaben
    forgetClassCode();
    expect(getRememberedClassCode()).toBe("");
  });
});

describe("Fortschritt + Telemetrie", () => {
  it("speichert und liest Fortschritt je Konto", () => {
    const t = mkTeacher();
    saveAccountProgress(t.id, { xp: 120, levels: { "l1-reihe1": { completed: true, bestStars: 3, attempts: 1 } } });
    expect(getProgress(t.id).xp).toBe(120);
  });

  it("Eigenständigkeits-Score: sauber niedrig, Paste/Tempo hoch", () => {
    const clean = Array.from({ length: 10 }, () => ev({ ms: 5000 }));
    expect(suspicionScore(clean).score).toBeLessThanOrEqual(2);

    const pasted = Array.from({ length: 10 }, (_, i) => ev({ pasted: i < 3 }));
    expect(suspicionScore(pasted).score).toBeGreaterThan(2);

    const tooFast = Array.from({ length: 10 }, () => ev({ ms: 200, cells: 3 }));
    expect(suspicionScore(tooFast).score).toBeGreaterThanOrEqual(4);
  });

  it("aggregiert Statistik je Schüler:in", () => {
    const t = mkTeacher();
    const cls = createClass(t.id, "3b");
    if (!cls.ok) return;
    const p = addPupil(cls.value.code, "Mia", "1234");
    if (!p.ok) return;
    recordEvent(p.value.id, ev({ correct: true }));
    recordEvent(p.value.id, ev({ correct: false }));
    const st = pupilStats(p.value.id);
    expect(st.tasks).toBe(2);
    expect(st.correct).toBe(1);
    expect(st.accuracy).toBe(0.5);
  });
});
