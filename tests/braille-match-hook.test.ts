/**
 * WÄCHTER über den SERVER-HAKEN des Braille-Klassenmatchs (Zubau 22.09.2026).
 *
 * ── (a)+(b): Text-Wächter, Muster `tests/tastenflow-klassenmatch-server.test.ts` ──
 * Liest `setup.mjs`/`br_match.pb.js`/`br_match_lib.pb.js` als TEXT und prüft
 * die drei Zusagen, die kein Bauteil-Test sehen kann: Lehrkräfte haben KEINE
 * Leseregel (F10), Kinder lesen/schreiben nur ihre eigene Klasse/Zeile, und
 * die Grenzen (Übergänge, Zeiten, Aufräumen) stehen im Hook.
 *
 * ⚠️ WAS DIESE TEXT-WÄCHTER NICHT BEWEISEN: Dass PocketBase die Regeln so
 * AUSWERTET, wie sie dastehen, sehen sie nicht
 * ([[reference_pocketbase_antwort_umgeht_viewrule]]).
 *
 * ── (c): DER SERVER-ZWILLING - funktional, nicht nur Text ──────────────────
 * Muster `tests/tastenflow-wochenziel-server-zwilling.test.ts`: `br_match_lib.
 * pb.js` wird wie goja sie sieht geladen (CommonJS, `new Function`) und dann
 * WIRKLICH AUSGEFÜHRT - die exportierte Übergänge-Tabelle wird gegen
 * `erlaubterUebergang()` aus `klassenmatch.ts` (der pure-function-Referenz)
 * für JEDE Kombination aus Zuständen geprüft, nicht nur an ein paar
 * Textschnipseln. Das ist der Beleg, dass die zwangsweise doppelte
 * Übergänge-Tabelle (ein Hook kann `klassenmatch.ts` nicht importieren,
 * [[reference_pocketbase_hook_scope]]) wirklich dasselbe sagt wie das
 * Original.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  erlaubterUebergang,
  MATCH_DAUER_MIN,
  MATCH_COUNTDOWN_MS,
  MATCH_AUFRAEUM_MS,
  type MatchStatus,
} from "../src/lib/braille/klassenmatch";

function lies(pfad: string): string {
  return readFileSync(resolve(process.cwd(), pfad), "utf8");
}

const setup = () => lies("pocketbase/setup.mjs");
const hook = () => lies("pocketbase/pb_hooks/br_match.pb.js");
const lib = () => lies("pocketbase/pb_hooks/br_match_lib.pb.js");

interface GojaMatchLib {
  BR_MATCH_DAUER_MIN: number;
  BR_COUNTDOWN_MS: number;
  BR_UEBERGAENGE: Record<string, string[]>;
  brStandVomServer: unknown;
  brMatchMussEsGeben: unknown;
  brKlassenmatchAbgeschaltet: unknown;
}

/** Die Hook-Lib so laden, wie goja sie sieht: als CommonJS-Modul. */
function ladeLib(): GojaMatchLib {
  const code = lib();
  const mod = { exports: {} };
  new Function("module", "exports", "require", code)(mod, mod.exports, () => ({}));
  return mod.exports as GojaMatchLib;
}

const ALLE_ZUSTAENDE: MatchStatus[] = ["einladung", "countdown", "laeuft", "fertig", "abgebrochen"];

// ── (a) Die Regeln der beiden Sammlungen ────────────────────────────────────

describe("(a) Die Regeln von br_matches/br_match_stand", () => {
  it("★★★★★ gibt Lehrkräften KEINE Leseregel auf Matches und Stände (F10)", () => {
    const s = setup();
    const von = s.indexOf('"br_matches"');
    const bis = s.indexOf("idx_br_ms_class");
    expect(von, "br_matches fehlt in setup.mjs").toBeGreaterThan(0);
    expect(bis).toBeGreaterThan(von);
    const abschnitt = s.slice(von, bis);
    expect(abschnitt).not.toContain("TT_TEACHER");
    expect(abschnitt).not.toContain("ttOwnerTeacher");
    expect(abschnitt).not.toContain("ttCoTeacher");
    expect(abschnitt).not.toContain("ttClassStaff");
    expect(abschnitt).not.toContain("ttOwnsClass");
  });

  it("★★★ lässt Kinder nur ihre eigene Klasse lesen", () => {
    const s = setup();
    const regel = "${TT_PUPIL} && @request.auth.classCode = classCode";
    const treffer = s.split(regel).length - 1;
    expect(treffer, "die Kinder-Leseregel fehlt je Klasse").toBeGreaterThanOrEqual(4);
  });

  it("★★ lässt ein Kind nur SEINE eigene Stand-Zeile schreiben", () => {
    const s = setup();
    expect(s).toContain(
      "create: `${TT_PUPIL} && @request.auth.id = @request.body.pupilUid && @request.auth.classCode = @request.body.classCode`",
    );
    expect(s).toContain("@request.auth.id = pupilUid");
    expect(s).toContain("@request.body.matchId:isset = false || @request.body.matchId = matchId");
  });

  it("★★ lässt das Match nur seinen Gastgeber ändern - und niemanden löschen", () => {
    const s = setup();
    expect(s).toContain(
      "create: `${TT_PUPIL} && @request.auth.id = @request.body.hostUid && @request.auth.classCode = @request.body.classCode`",
    );
    expect(s).toContain("update: `${TT_PUPIL} && @request.auth.id = hostUid");
    const von = s.indexOf('"br_matches"');
    const bis = s.indexOf("idx_br_ms_class");
    const abschnitt = s.slice(von, bis);
    expect(abschnitt.split("del: null").length - 1, "beide Sammlungen brauchen del: null").toBe(2);
  });

  it("hat einen eindeutigen Index je Match und Kind - eine Zeile, nicht zwei", () => {
    expect(setup()).toContain(
      "CREATE UNIQUE INDEX `idx_br_ms_match_pupil` ON `br_match_stand` (`matchId`, `pupilUid`)",
    );
  });

  it("★★★★★ br_match_verlauf ist für NIEMANDEN über die Schnittstelle lesbar", () => {
    const s = setup();
    const von = s.indexOf('"br_match_verlauf"');
    const bis = s.indexOf("idx_br_mv_pupil");
    expect(von).toBeGreaterThan(0);
    const abschnitt = s.slice(von, bis);
    expect(abschnitt.split(": null").length - 1).toBeGreaterThanOrEqual(5);
  });
});

// ── (b) Der Hook ─────────────────────────────────────────────────────────

describe("(b) Die Grenzen und Zeiten im Hook", () => {
  it("★★★ setzt den Namen des Gastgebers SELBST - nie aus dem Rumpf", () => {
    const h = hook();
    expect(h).toContain('e.record.set("hostName", String(kind.getString("name") || ""));');
    expect(h).toContain('e.record.set("hostUid", kind.id);');
  });

  it("★★★★★ setzt auch den Namen in der Stand-Zeile SELBST - beim Anlegen UND beim Ändern", () => {
    const l = lib();
    expect(l).toContain('e.record.set("name", kind ? String(kind.getString("name") || "") : "");');
    const h = hook();
    expect(h.split("L.brStandVomServer(e)").length - 1, "create UND update").toBe(2);
  });

  it("★★★★★ lässt keine Stand-Zeile zu einer erfundenen matchId anlegen", () => {
    const h = hook();
    expect(lib()).toContain("function brMatchMussEsGeben(e)");
    expect(lib()).toContain('e.app.findRecordById("br_matches", matchId)');
    expect(lib()).toContain('String(match.getString("classCode") || "") !== meine');
    expect(lib()).toContain('status === "fertig" || status === "abgebrochen"');
    const create = h.slice(h.indexOf("if (L.brStandVomServer(e)) return;"));
    expect(create).toContain("L.brMatchMussEsGeben(e);");
  });

  it("★★★ weist ab, wo die Lehrkraft das Match abgeschaltet hat", () => {
    const h = hook();
    expect(h).toContain("L.brKlassenmatchAbgeschaltet(e.app, code)");
    expect(h).toMatch(/ausgeschaltet/);
    // ⚠️ Punktgenau hat KEINE eigene Spalte wie Tastenflow
    // (`tt_classes.klassenmatchAus`) - das Häkchen liegt im JSON-Topf.
    expect(lib()).toContain("settings.punktgenau && settings.punktgenau.klassenmatchAus === true");
  });

  it("★★★ lässt nur die erlaubten Übergänge zu - OHNE countdown→fertig (anders als Tastenflow)", () => {
    const l = lib();
    expect(l).toContain('einladung: ["countdown", "abgebrochen"]');
    expect(l).toContain('countdown: ["laeuft", "abgebrochen"]');
    expect(l).not.toContain('countdown: ["laeuft", "fertig", "abgebrochen"]');
    expect(l).toContain('laeuft: ["fertig", "abgebrochen"]');
    expect(l).toContain("fertig: []");
    expect(l).toContain("abgebrochen: []");
  });

  it("★★★★★ setzt startMs und endeMs selbst - genau beim Übergang nach countdown", () => {
    const h = hook();
    expect(lib()).toContain("const BR_COUNTDOWN_MS = 10 * 1000;");
    expect(lib()).toContain("const BR_MATCH_DAUER_MIN = 5;");
    expect(h).toContain('if (nachher === "countdown" && vorher === "einladung")');
    expect(h).toContain("const start = Date.now() + L.BR_COUNTDOWN_MS;");
    expect(h).toContain('e.record.set("endeMs", start + Math.round(dauerMin * 60 * 1000));');
    expect(h).toContain('e.record.set("startMs", alt.getFloat("startMs"));');
  });

  it("★★★ räumt jede Minute auf: auslaufen, abbrechen, löschen (F10) - Verlauf VOR dem Löschen", () => {
    const h = hook();
    expect(h).toContain('cronAdd("br_match_aufraeumen", "* * * * *"');
    expect(h).toContain("const EINLADUNG_FRIST = 60 * 1000;");
    expect(h).toContain("status = 'einladung' && createdMs > 0 && createdMs < {:frist}");
    expect(h).toContain("endeMs > 0 && endeMs < {:jetzt}");
    expect(h).toContain("const AUFRAEUMEN_NACH = 60 * 60 * 1000;");
    const loeschen = h.slice(h.indexOf("AUFRAEUMEN_NACH"));
    expect(loeschen.indexOf('"br_match_verlauf"')).toBeGreaterThan(-1);
    expect(loeschen.indexOf('findCollectionByNameOrId("br_match_verlauf")')).toBeLessThan(
      loeschen.indexOf("$app.delete(rec)"),
    );
    // Und die Stand-Zeilen VOR dem Match selbst.
    expect(loeschen.indexOf("for (const s of staende) $app.delete(s);")).toBeLessThan(
      loeschen.indexOf("$app.delete(rec);"),
    );
  });

  it("★ wiederholt die Fristen IM Cron - er sieht nichts aus dem Dateikopf", () => {
    const h = hook();
    const cron = h.slice(h.indexOf('cronAdd("br_match_aufraeumen"'));
    expect(cron).toContain("const EINLADUNG_FRIST =");
    expect(cron).toContain("const AUFRAEUMEN_NACH =");
  });

  it("ist syntaktisch gültig und meldet keine Route an", () => {
    // Eine Wurzelroute `"/"` wäre ein Alles-Fänger
    // ([[reference_pocketbase_wurzelroute_falle]]) - dieser Hook hat keine.
    expect(hook()).not.toMatch(/routerAdd\(/);
  });
});

// ── (c) Der Server-Zwilling: dieselben Übergänge, funktional geprüft ───────

describe("(c) Server-Zwilling: dieselben Zahlen und Übergänge wie klassenmatch.ts", () => {
  it("★★ Dauer und Countdown stimmen zwischen Hook und Client überein", () => {
    const l = ladeLib();
    expect(l.BR_MATCH_DAUER_MIN).toBe(MATCH_DAUER_MIN);
    expect(l.BR_COUNTDOWN_MS).toBe(MATCH_COUNTDOWN_MS);
  });

  it("★★★★★ die geladene Übergänge-Tabelle stimmt für JEDE Kombination mit `erlaubterUebergang()` überein", () => {
    const l = ladeLib();
    for (const von of ALLE_ZUSTAENDE) {
      for (const nach of ALLE_ZUSTAENDE) {
        const amHook = (l.BR_UEBERGAENGE[von] || []).indexOf(nach) >= 0;
        const amClient = erlaubterUebergang(von, nach);
        expect(amHook, `${von} → ${nach} (Hook)`).toBe(amClient);
      }
    }
  });

  it("★ die Aufräumfrist (eine Stunde) ist dieselbe Zahl wie MATCH_AUFRAEUM_MS", () => {
    expect(MATCH_AUFRAEUM_MS).toBe(60 * 60_000);
    expect(hook()).toContain("const AUFRAEUMEN_NACH = 60 * 60 * 1000;");
  });
});
