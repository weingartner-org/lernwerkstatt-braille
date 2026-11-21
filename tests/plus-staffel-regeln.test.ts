/**
 * Wächter für die Server-Regeln der Staffel.
 *
 * ★★★★★ Die Staffel ist der EINZIGE Ort in Plus, an dem mehrere Kinder
 * dasselbe lesen. Damit das nie zu einem Fenster in die Daten eines anderen
 * Kindes wird, prüft dieser Wächter die Regeln in `setup.mjs` Zeichen für
 * Zeichen - nicht ihre Wirkung (die prüft der Server), sondern dass sie
 * dastehen und niemand sie beim Aufräumen wegnimmt.
 *
 * Siehe [[feedback_security_first]] und [[feedback_data_transparency]].
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const SETUP = readFileSync(resolve(__dirname, "../pocketbase/setup.mjs"), "utf8");

/** Der Block der Sammlung - vom Namen bis zur schliessenden Klammer. */
function block(): string {
  const start = SETUP.indexOf('"plus_staffel"');
  expect(start, "plus_staffel steht nicht in setup.mjs").toBeGreaterThan(-1);
  return SETUP.slice(start, start + 2600);
}

describe("Die Staffel-Sammlung", () => {
  it("es gibt sie", () => {
    expect(block()).toContain('"plus_staffel"');
  });

  it("★★★★★ sie trägt keine Kennung und keinen Namen eines Kindes", () => {
    const b = block().slice(0, block().indexOf("indexes"));
    for (const verboten of ["pupilUid", "teacherUid", "name", "vorname"]) {
      expect(b, `Spalte ${verboten} hat hier nichts verloren`).not.toContain(`T("${verboten}")`);
    }
    // Was sie trägt, und mehr nicht.
    expect(b).toContain('T("classCode"), T("woche"), T("art"), N("etappe"), N("createdAtMs")');
  });

  it("★★★★ nur anlegen - ändern und löschen sind für alle zu", () => {
    const b = block();
    expect(b).toMatch(/update:\s*null/);
    expect(b).toMatch(/del:\s*null/);
  });

  it("★★★ anlegen darf nur ein Kind, und nur für die eigene Klasse", () => {
    const b = block();
    expect(b).toContain("TT_PUPIL");
    expect(b).toContain("@request.body.classCode = @request.auth.classCode");
  });

  it("★★ nur die zwei Arten, die es gibt", () => {
    expect(block()).toContain('@request.body.art = "etappe" || @request.body.art = "wort"');
  });

  it("★★ lesen darf die Klasse - und nur die Klasse", () => {
    const b = block();
    expect(b).toContain("@request.auth.classCode = classCode");
    expect(b).toContain('ttClassStaff("classCode")');
  });

  it("★★★ dieselbe Etappe zählt nur einmal", () => {
    expect(block()).toContain(
      "CREATE UNIQUE INDEX `idx_plus_staffel` ON `plus_staffel` (`classCode`, `woche`, `art`, `etappe`)",
    );
  });
});
