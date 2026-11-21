/**
 * ★★★★★ NACH DEM PRÜFEN STEHT DER STAND AUF DER ZEILE - auch in Punktgenau.
 * ============================================================================
 * > **Johannes, 09.09.2026:** „soll gleich auf der zeile stehen richtig oder
 * > probiers nochmal" - gemeldet am eine andere App der Plattform , am selben Tag nachgezogen
 * > (`BAUART-ARBEITSBLATT-BARRIEREFREI.md` §16, Eintrag 09.09.).
 *
 * ⚠️⚠️ WARUM ES HIER DASSELBE PROBLEM WAR. Nach einer richtigen Antwort bleibt
 * der Schreibzeiger im Eingabefeld stehen - das ist Absicht (`readOnly` statt
 * `disabled`, Bauart §3, sonst fiele der Fokus an den Dokumentenanfang). Die
 * Braillezeile zeigt dann NAMEN, ART und INHALT dieses Feldes. Der Satz
 * „Richtig gelesen!" stand ausschliesslich in einer `role="status"`-Fläche
 * darunter: Er verdrängt die Zeile vier Sekunden lang und ist danach weg
 * ([[reference_live_region_ist_braille_blitzmeldung]]). Wer in diesem
 * Augenblick nachliest, wo er steht, fand nur seine eigene Antwort.
 *
 * ⇒ Der Stand steht jetzt VORNE im Namen des Feldes.
 *
 * ⚠️ Diese Probe lädt die ECHTE SEITE und geht den Weg des Kindes: auf „Lesen"
 * umschalten, die Lösung tippen, prüfen. Ein Test am Bauteil allein bewiese
 * nur, dass sich ein `aria-label` setzen lässt
 * ([[feedback_gruener_waechter_beweist_was]]).
 */
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { PunktgenauPage } from "@/features/public/PunktgenauPage";

afterEach(cleanup);

function zeigeSeite() {
  render(
    <MemoryRouter initialEntries={["/programme/punktgenau"]}>
      <PunktgenauPage />
    </MemoryRouter>,
  );
}

/**
 * In den Lese-Modus wechseln und warten, bis eine Aufgabe steht.
 *
 * ★ Die Lösung steht im Kennzeichen der Aufgabe (`data-aufgabe="lesen-<wort>"`) -
 * dieselbe Stelle, an der auch die Lesestelle und der Fokus-Wächter ansetzen.
 * Der Test muss sie also nicht raten und nicht die Übersetzung nachbauen.
 */
async function leseAufgabe(): Promise<{ wort: string; feld: HTMLInputElement }> {
  // ⚠️ Über den TEXT, nicht über den Namen der Rolle: Der Schalter trägt eine
  // eigene Ansage („Lesen üben, ausgewählt"), und ein Test, der auf den
  // sichtbaren Text zeigt, überlebt deren Umformulierung.
  const lesen = Array.from(document.querySelectorAll("button")).find(
    (b) => b.textContent?.trim() === "Lesen",
  );
  if (!lesen) throw new Error("kein Schalter „Lesen“");
  fireEvent.click(lesen);
  return await waitFor(
    () => {
      const karte = document.querySelector('[data-aufgabe^="lesen-"]');
      const feld = document.querySelector("#read-answer") as HTMLInputElement | null;
      if (!karte || !feld) throw new Error("noch keine Leseaufgabe");
      const wort = karte.getAttribute("data-aufgabe")!.slice("lesen-".length);
      if (!wort) throw new Error("kein Wort");
      return { wort, feld };
    },
    { timeout: 8000 },
  );
}

describe("★★★★★ Punktgenau: der Stand steht im Namen des Feldes", () => {
  it("vor dem Prüfen gibt es KEIN `aria-label` - dann gilt die sichtbare Beschriftung", async () => {
    zeigeSeite();
    const { feld } = await leseAufgabe();
    // ⚠️ Ein `aria-label`, das immer dasteht, verdeckt die `<label>`-Zeile und
    // schafft eine zweite Wahrheit. Ohne Stand also nichts.
    expect(feld.getAttribute("aria-label")).toBeNull();
  });

  it("★★★★ richtig gelesen ⇒ der Stand steht VORNE im Namen, und der Fokus bleibt im Feld", async () => {
    zeigeSeite();
    const { wort, feld } = await leseAufgabe();
    fireEvent.focus(feld);
    fireEvent.change(feld, { target: { value: wort } });
    fireEvent.submit(feld.closest("form")!);

    await waitFor(() => expect(feld.getAttribute("aria-label")).toMatch(/^Richtig gelesen\. /));
    // ★★★ Der sichtbare Text der Beschriftung bleibt vollständig enthalten
    // (WCAG 2.5.3) - er wird nur vorne ergänzt, nie ersetzt.
    expect(feld.getAttribute("aria-label")).toContain("Was steht hier?");
    // ⚠️ Und das Feld behält den Schreibzeiger - genau deshalb muss der Stand
    // überhaupt dorthin.
    expect(feld.readOnly).toBe(true);
    expect(feld.getAttribute("disabled")).toBeNull();
  }, 15000);
});
