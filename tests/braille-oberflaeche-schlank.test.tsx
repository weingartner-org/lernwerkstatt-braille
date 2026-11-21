/**
 * ★★★★★ CHARGE „SCHLANK" (20.09.2026) — Leiste 2 ist weg.
 *
 * Johannes (Screenshot): die Oberfläche trug zwei Karten übereinander. Die
 * zweite („Bereiche · Richtung · Sounds · Vorlesen/Geschw./Stimme") stand IMMER
 * im Weg, obwohl fast nichts davon beim Üben selbst gebraucht wird. Dieser
 * Wächter hält den Umbau fest:
 *
 *  1. Leiste 2 ist WIRKLICH weg — „Sounds" und „Fehler-Tipp" stehen erst nach
 *     dem Öffnen der Einstellungen (Alt + O) im Baum. Die „Schrift:"-Liste
 *     dagegen bleibt SICHTBAR (erste Korrektur Johannes, noch am selben
 *     Abend): sie zieht in die obere Karte, über die Etappen-Liste, statt
 *     hinter das Zahnrad zu verschwinden.
 *  2. Die Zeichenliste (früher 📖 in Leiste 2) sitzt jetzt in der Kopfzeile:
 *     ein Knopf mit zugänglichem Namen, per Tastatur erreichbar, öffnet die
 *     Liste über denselben Speicher wie Alt + L.
 *  3. Schreiben/Lesen zog in die obere Karte, direkt unter Rang und Stufe —
 *     und bleibt die bewährte Radiogruppe mit Pfeiltasten-Navigation.
 *  4. Die frühere Textzeile über der Etappen-Liste („Basisschrift · Etappe …
 *     · … gemeistert") ist GANZ weg (zweite Korrektur Johannes: „den Text
 *     brauchen wir nicht, er steht ja in den Schaltern") - beide Listen
 *     bleiben trotzdem über ihren zugänglichen Namen auffindbar, und der
 *     lange Blurb-Halbsatz steht nirgends mehr sichtbar im Dokument.
 *  5. Alt + L und Alt + O lösen weiterhin aus, was sie sollen; Alt + 1…5
 *     springen weiterhin direkt in einen Bereich.
 *
 * ⚠️ Warum dieser Wächter die ganze Seite lädt (wie
 * `punktgenau-esc-ins-eingabefeld.test.tsx`) und nicht nur Bausteine:
 * Zeichenliste UND Einstellungen hängen an Kürzeln, die in `PunktgenauPage`
 * behandelt werden — ein Test nur an `Punktgenau` sähe die Kopfzeile gar
 * nicht ([[feedback_gruener_waechter_beweist_was]]).
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { PunktgenauPage } from "@/features/public/PunktgenauPage";
import { useBraillePlay } from "@/lib/braille/play";

afterEach(cleanup);
beforeEach(() => {
  act(() =>
    useBraillePlay.setState({
      focusInputNonce: 0,
      charsOpen: false,
      charsNonce: 0,
      settingsOpen: false,
      settingsNonce: 0,
      paused: false,
    }),
  );
});

function zeigeSeite() {
  render(
    <MemoryRouter initialEntries={["/programme/punktgenau"]}>
      <PunktgenauPage />
    </MemoryRouter>,
  );
}

function altTaste(code: string) {
  fireEvent.keyDown(document, { code, altKey: true });
}

describe("Punktgenau — Oberfläche schlank (Charge 20.09.2026)", () => {
  it("★★★★★ Leiste 2 ist weg: Töne und Fehler-Tipp stehen im Menü unter dem Lautsprecher", () => {
    zeigeSeite();

    // Im Übungsbildschirm stehen die alten Schalter NICHT mehr.
    expect(screen.queryByRole("button", { name: /^Sounds/ })).toBeNull();
    expect(screen.queryByRole("button", { name: /Fehler-Tipp/ })).toBeNull();
    expect(screen.queryByRole("dialog")).toBeNull();

    // ★ Seit 17.10.2026 stehen beide im Menü unter dem Lautsprecher (Johannes:
    //   „nur noch im Menü unter dem Lautsprecher, aus den Einstellungsfenstern
    //   raus") - als Schalter „Töne" und „Fehler-Tipp".
    const lautsprecher = screen.getByRole("button", { name: "Klang und Vorlesen" });
    fireEvent.click(lautsprecher);
    const menue = document.getElementById(lautsprecher.getAttribute("aria-controls")!) as HTMLElement;
    expect(within(menue).getByRole("switch", { name: "Töne" })).toBeTruthy();
    expect(within(menue).getByRole("switch", { name: "Fehler-Tipp" })).toBeTruthy();
    fireEvent.click(lautsprecher);

    // Alt + O öffnet die Einstellungen — dort stehen sie NICHT mehr.
    act(() => altTaste("KeyO"));

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).queryByRole("button", { name: /^Sounds/ })).toBeNull();
    expect(within(dialog).queryByRole("button", { name: /Fehler-Tipp/ })).toBeNull();
    // Die Schrift-Liste steht NICHT im Einstellungs-Dialog - sie ist ja schon
    // sichtbar im Übungsbildschirm (nächster Test).
    expect(within(dialog).queryByText("Schrift:")).toBeNull();
  });

  it("★★★★ die Schrift-Liste bleibt sichtbar - über der Etappen-Liste, ohne die Einstellungen zu öffnen", () => {
    zeigeSeite();

    expect(screen.queryByRole("dialog")).toBeNull();
    const schrift = screen.getByRole("combobox", {
      name: "Brailleschriftsystem (Bereich) auswählen",
    });
    const etappe = screen.getByRole("combobox", {
      name: /Kapitel \(Etappe\) auswählen/,
    });
    expect(schrift).toBeTruthy();
    expect(etappe).toBeTruthy();

    // Übereinander, nicht nebeneinander (zweite Korrektur Johannes): beide
    // Listen stehen im selben Block, die Schrift-Liste kommt im Dokument VOR
    // der Etappen-Liste.
    const gemeinsamerBlock = schrift.closest("div");
    expect(gemeinsamerBlock?.contains(etappe)).toBe(true);
    const position = schrift.compareDocumentPosition(etappe);
    // eslint-disable-next-line no-bitwise
    expect(position & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("★★★★ die Zeichenliste sitzt jetzt in der Kopfzeile — zugänglich und per Tastatur erreichbar", async () => {
    zeigeSeite();

    const knopf = screen.getByRole("button", { name: "Zeichenliste" });
    // Nicht `disabled`, kein negativer tabindex (Bauart §3 dieser App).
    expect(knopf.hasAttribute("disabled")).toBe(false);
    const tabindex = knopf.getAttribute("tabindex");
    expect(tabindex === null || Number(tabindex) >= 0).toBe(true);

    expect(useBraillePlay.getState().charsOpen).toBe(false);
    fireEvent.click(knopf);
    await waitFor(() => expect(useBraillePlay.getState().charsOpen).toBe(true));

    // Öffnet wirklich die Liste (eigenes Fenster).
    expect(screen.getByRole("dialog")).toBeTruthy();
  });

  it("★★★ Schreiben/Lesen steht in der oberen Karte (bei Rang/Stufe) und bleibt eine Radiogruppe mit Pfeiltasten", () => {
    zeigeSeite();

    const rang = screen.getByRole("img", { name: /^Rang / });
    const radiogroup = screen.getByRole("radiogroup", { name: "Übungsrichtung" });

    // Dieselbe Karte wie die Rang-Anzeige — nicht mehr die zweite, jetzt
    // abgeschaffte Leiste.
    const obereKarte = rang.closest(".card");
    expect(obereKarte).toBeTruthy();
    expect(obereKarte?.contains(radiogroup)).toBe(true);

    // Pfeiltasten-Navigation bleibt unverändert: „Schreiben" ist der
    // Ausgangszustand, ArrowRight wechselt auf „Lesen" und setzt den Fokus.
    const schreiben = within(radiogroup).getByRole("radio", { name: "Schreiben" });
    const lesen = within(radiogroup).getByRole("radio", { name: "Lesen" });
    expect(schreiben.getAttribute("aria-checked")).toBe("true");
    schreiben.focus();
    fireEvent.keyDown(radiogroup, { key: "ArrowRight" });
    expect(lesen.getAttribute("aria-checked")).toBe("true");
  });

  it("★★★ die frühere Textzeile ist ganz weg - beide Listen bleiben trotzdem über ihren Namen auffindbar", () => {
    zeigeSeite();

    // Kein „Basisschrift · Etappe … · … gemeistert" mehr - auch nicht gekürzt
    // (zweite Korrektur Johannes: „den Text brauchen wir nicht, er steht ja
    // in den Schaltern").
    expect(screen.queryByText(/Etappe \d+ von \d+ · \d+ gemeistert/)).toBeNull();
    // Der lange Blurb-Halbsatz stand schon vorher nicht mehr sichtbar im
    // Dokument (er lebt nur noch als `title` am Schrift-Pulldown).
    expect(
      screen.queryByText(/Die sechs Punkte, Buchstabe für Buchstabe/),
    ).toBeNull();

    // Beide Listen sagen ihren Inhalt selbst: die Schrift-Liste zeigt
    // „Basisschrift", die Etappen-Liste „Etappe 1: …" - eine Sprachausgabe
    // bekommt Name UND gewählten Wert von jedem `<select>` ohnehin.
    const schrift = screen.getByRole("combobox", {
      name: "Brailleschriftsystem (Bereich) auswählen",
    });
    const etappe = screen.getByRole("combobox", {
      name: /Kapitel \(Etappe\) auswählen/,
    });
    expect((schrift as HTMLSelectElement).value).toBe("basis");
    expect(within(etappe).getByText(/^Etappe 1:/)).toBeTruthy();
  });

  it("★★★ Alt + L und Alt + O lösen aus, was sie sollen", async () => {
    zeigeSeite();

    act(() => altTaste("KeyL"));
    await waitFor(() => expect(useBraillePlay.getState().charsOpen).toBe(true));
    // Wieder zu — dasselbe Kürzel schaltet um.
    act(() => altTaste("KeyL"));
    await waitFor(() => expect(useBraillePlay.getState().charsOpen).toBe(false));

    expect(screen.queryByRole("dialog")).toBeNull();

    act(() => altTaste("KeyO"));
    await waitFor(() => expect(useBraillePlay.getState().settingsOpen).toBe(true));
    expect(screen.getByRole("dialog", { name: /Einstellungen/ })).toBeTruthy();

    act(() => altTaste("KeyO"));
    await waitFor(() => expect(useBraillePlay.getState().settingsOpen).toBe(false));
  });
});
