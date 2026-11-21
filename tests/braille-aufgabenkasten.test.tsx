/**
 * ★★★★★ „EIN KASTEN" (Charge 20.09.2026 Abend) — Angabe und Feld waren zwei
 * Karten übereinander, Johannes' Screenshot zeigte Tastenflow als ruhigeres
 * Vorbild: EIN gerahmter Kasten mit Kopfzeile, Trennlinie und Tippzeile
 * darunter (`src/components/typing/TypingSession.tsx`, um
 * `zeilenTitel`/`tt-ticks`). Vier Änderungen, die dieser Wächter festhält:
 *
 *  1. Angabe (`data-angabe`) und Feld (`data-feld`) stehen jetzt in EINEM
 *     `data-aufgabe`-Kasten statt in zwei getrennten Karten - die Marker
 *     selbst sind unverändert (Lesestelle §6.2, Fokus-Wächter §3).
 *  2. Die Runden-Striche (`#pl-round-ticks`) sind aus der oberen Rang/Stufe-
 *     Karte in die KOPFZEILE des Aufgaben-Kastens gewandert, oben rechts
 *     neben der Angabe (NICHT unten beim Feld - zweite Korrektur Johannes
 *     20.09.2026 Abend, Vorbild `TypingSession.tsx`: dort steht `tt-ticks`
 *     genauso neben dem Finger-Hinweis). Ohne Runden-Daten (eingebettete
 *     Einzelübung, geprüft direkt an `WritePanel`/`ReadPanel`) wird nichts
 *     gezeichnet.
 *  3. Schreiben/Lesen steht jetzt in der Rang/Stufe-Zeile, an der Stelle, an
 *     der bis dahin die Runden-Striche standen - weiterhin eine Radiogruppe
 *     mit Pfeiltasten-Navigation.
 *  4. Die Aufforderung („Schreib in Braille:" / „Lies die Brailleschrift:")
 *     steht seit der dritten Korrektur (noch am selben Abend) NICHT mehr im
 *     Rahmen, sondern schlank darüber - `data-angabe` bleibt am
 *     Aufgabenwort/der Vorlage IM Kasten. `aria-describedby` hält die
 *     Aufforderung als Beschreibung an der Angabe fest, damit eine
 *     Sprachausgabe beide weiter als EINE Einheit vorliest.
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { PunktgenauPage } from "@/features/public/PunktgenauPage";
import { useBraillePlay } from "@/lib/braille/play";
import { WritePanel, ReadPanel, RoundTicks, type RoundInfo } from "@/components/braille/BrailleTrainer";

afterEach(cleanup);
beforeEach(() => {
  act(() =>
    useBraillePlay.setState({
      focusInputNonce: 0,
      roundNonce: 0,
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

function altTaste(code: string, key?: string) {
  fireEvent.keyDown(document, key === undefined ? { code, altKey: true } : { code, key, altKey: true });
}

/** Der eine Aufgaben-Kasten, in dem Angabe UND Feld stehen. */
function aufgabenKasten(): HTMLElement {
  const angabe = document.querySelector("[data-angabe]");
  if (!angabe) throw new Error("Keine Angabe im Dokument.");
  const kasten = angabe.closest("[data-aufgabe]");
  if (!kasten) throw new Error("Angabe liegt in keinem [data-aufgabe]-Kasten.");
  return kasten as HTMLElement;
}

describe("Punktgenau — ein Kasten statt zwei Karten (Charge 20.09.2026 Abend)", () => {
  it("★★★★★ data-aufgabe/data-angabe/data-feld bleiben erhalten - Angabe und Feld im selben Kasten", () => {
    zeigeSeite();

    const angabe = document.querySelector("[data-angabe]");
    const feld = document.querySelector("[data-feld]");
    expect(angabe).toBeTruthy();
    expect(feld).toBeTruthy();

    // Dieselbe Verschachtelung wie vorher: beide liegen im selben
    // `[data-aufgabe]`-Behälter (Lesestelle §6.2, Fokus-Wächter §3 suchen
    // genau daran entlang).
    expect(angabe!.closest("[data-aufgabe]")).toBe(feld!.closest("[data-aufgabe]"));
  });

  it("★★★★ die Runden-Striche stehen IM Aufgaben-Kasten (Kopfzeile, bei der Angabe) - nicht mehr in der oberen Rang/Stufe-Karte, nicht beim Feld", () => {
    zeigeSeite();

    const ticks = document.getElementById("pl-round-ticks");
    expect(ticks).toBeTruthy();

    const kasten = aufgabenKasten();
    // Innerhalb desselben Kastens wie Angabe und Feld …
    expect(kasten.contains(ticks!)).toBe(true);

    // … und zwar bei der ANGABE (Kopfzeile), nicht innerhalb des Feldes.
    const angabe = document.querySelector("[data-angabe]")!;
    const feld = document.querySelector('[data-feld="braillezellen"]');
    expect(angabe.parentElement!.contains(ticks!)).toBe(true);
    if (feld) expect(feld.contains(ticks!)).toBe(false);

    // … und NICHT mehr in der oberen Karte (Rang/Stufe).
    const rang = screen.getByRole("img", { name: /^Rang / });
    const obereKarte = rang.closest(".card");
    expect(obereKarte).toBeTruthy();
    expect(obereKarte!.contains(ticks!)).toBe(false);
  });

  it("★★★★ #pl-round-ticks kommt genau EINMAL im Dokument vor", () => {
    zeigeSeite();
    expect(document.querySelectorAll('[id="pl-round-ticks"]')).toHaveLength(1);
  });

  it("★★★ Alt+Z setzt den Fokus auf die Runden-Striche; Esc von dort führt zurück ins Eingabefeld", () => {
    zeigeSeite();

    // ★ 18.10.2026: Alt + Z zählt nach dem AUFGEDRUCKTEN Buchstaben
    //   (`istAltBuchstabe`). Bis dahin genügte hier ein nackter `KeyZ` - auf der
    //   deutschen Tastatur (so ist der Test eingestellt) ist das aber die
    //   Y-Taste. Die Z-Taste meldet `KeyY` mit dem Buchstaben „z".
    act(() => altTaste("KeyY", "z"));
    const ticks = document.getElementById("pl-round-ticks")!;
    expect(document.activeElement).toBe(ticks);

    fireEvent.keyDown(ticks, { key: "Escape" });
    const feld = document.querySelector('[data-feld="braillezellen"]');
    expect(feld).toBeTruthy();
    expect(document.activeElement).toBe(feld);
  });

  it("★★★ ohne Runden-Daten wird nichts gezeichnet (eingebettete Einzelübung, direkt am Panel geprüft)", () => {
    // WritePanel/ReadPanel ohne `round`-Prop — genau der Weg, auf dem die
    // eingebettete Einzelübung `BrailleExercise` sie aufruft (kein
    // `showRound` am LevelRunner). Kein leerer Platzhalter, kein Strich.
    const { unmount } = render(
      <WritePanel
        prompt="ab"
        system="basis"
        eightDot={false}
        onDone={() => {}}
      />,
    );
    expect(document.getElementById("pl-round-ticks")).toBeNull();
    unmount();

    render(
      <ReadPanel
        prompt="ab"
        system="basis"
        eightDot={false}
        onDone={() => {}}
      />,
    );
    expect(document.getElementById("pl-round-ticks")).toBeNull();
  });

  it("★★★ Schreiben/Lesen steht in derselben Kopfleisten-Zeile wie Rang/Stufe (Fassung A - Trennlinien) und bleibt eine Radiogruppe mit Pfeiltasten", () => {
    zeigeSeite();

    const rang = screen.getByRole("img", { name: /^Rang / });
    const radiogroup = screen.getByRole("radiogroup", { name: "Übungsrichtung" });

    // Seit der Charge „A - Trennlinien" (20.09.2026) stehen Rang/Stufe und
    // Schreiben/Lesen als ZWEI Gruppen NEBENEINANDER in derselben Zeile,
    // getrennt durch eine haarfeine Linie - nicht mehr in einem gemeinsamen
    // Gruppen-`div`. Beide bleiben trotzdem in derselben Kopfleisten-Karte.
    const kopfleiste = document.querySelector('[data-kopfleiste]');
    expect(kopfleiste).toBeTruthy();
    expect(kopfleiste!.contains(rang)).toBe(true);
    expect(kopfleiste!.contains(radiogroup)).toBe(true);
    // Nicht mehr in derselben Gruppe wie der Rang-Kreis.
    const rangGruppe = rang.closest(".flex.flex-wrap.items-center.gap-2")!;
    expect(rangGruppe.contains(radiogroup)).toBe(false);

    // Pfeiltasten-Navigation bleibt unverändert.
    const schreiben = screen.getByRole("radio", { name: "Schreiben" });
    const lesen = screen.getByRole("radio", { name: "Lesen" });
    expect(schreiben.getAttribute("aria-checked")).toBe("true");
    schreiben.focus();
    fireEvent.keyDown(radiogroup, { key: "ArrowRight" });
    expect(lesen.getAttribute("aria-checked")).toBe("true");
  });

  it("★★★★ die Aufforderung steht ÜBER dem Kasten, nicht mehr im Rahmen - bleibt aber als Beschreibung an der Angabe hängen", () => {
    zeigeSeite();

    const angabe = document.querySelector("[data-angabe]")!;
    // Die Angabe selbst trägt nicht mehr den Aufforderungssatz als eigenen
    // Text - der steht jetzt außerhalb, in einem eigenen Absatz davor.
    expect(angabe.textContent).not.toMatch(/Schreib(en Sie)? in Braille/);

    const beschreibungsId = angabe.getAttribute("aria-describedby");
    expect(beschreibungsId).toBeTruthy();
    const aufforderung = document.getElementById(beschreibungsId!);
    expect(aufforderung).toBeTruthy();
    expect(aufforderung!.textContent).toMatch(/Schreib in Braille/);

    // Die Aufforderung steht NICHT im Rahmen (der `.card`-Kasten selbst),
    // sondern davor - sie darf aber weiter im `[data-aufgabe]`-Behälter
    // liegen (Fokus-Wächter §3 sucht daran entlang).
    const rahmen = angabe.closest(".card")!;
    expect(rahmen).toBeTruthy();
    expect(rahmen.contains(aufforderung!)).toBe(false);
    expect(aufgabenKasten().contains(aufforderung!)).toBe(true);

    // Der zugängliche Zusammenhang bleibt erhalten: die Beschreibung der
    // Angabe enthält die Aufforderung.
    expect(angabe).toHaveAccessibleDescription(/Schreib in Braille/);
  });
});

describe("RoundTicks — Zahl unter statt neben den Strichen, NUR über eine neue Prop (Charge 20.09.2026 Abend)", () => {
  const round: RoundInfo = { done: 5, total: 12, label: "Runde: 5 von 12" };

  it("★★★★★ OHNE die Prop (Klangpunktes Aufruf) bleibt es beim alten Aussehen: Zahl und Striche in DERSELBEN Zeile, „Runde“ eine eigene Zeile darunter", () => {
    render(<RoundTicks round={round} />);

    const ticks = document.getElementById("pl-round-ticks")!;
    // Zeilen-Layout, kein Spalten-Stapel.
    expect(ticks.className).not.toMatch(/flex-col/);

    // Zahl und Strich-Reihe sind direkte Geschwister IM selben Element -
    // die „Zeile", die Johannes' Prop erst umbaut.
    const strichReihe = ticks.querySelector(".tt-ticks")!;
    expect(strichReihe.parentElement).toBe(ticks);
    const direkteKinder = Array.from(ticks.children);
    expect(direkteKinder).toHaveLength(2);
    const zahlSpanne = direkteKinder.find((el) => el !== strichReihe)!;
    expect(zahlSpanne.parentElement).toBe(ticks);
    expect(zahlSpanne.textContent).toBe("5/12");

    // „Runde" bleibt eine EIGENE Zeile NACH dem Strich-Block - nicht
    // innerhalb von `#pl-round-ticks` verschachtelt (das wäre die neue
    // `zahlUnten`-Form).
    const rundeText = screen.getByText("Runde");
    expect(ticks.contains(rundeText)).toBe(false);
    expect(rundeText.previousElementSibling).toBe(ticks);
  });

  it("★★★ MIT `zahlUnten` (Punktgenaus Aufgaben-Kasten) stehen die Striche oben, Zahl + „Runde“ zusammen in EINER Zeile darunter - zwei Zeilen wie vorher, id/aria-label/Esc unverändert", () => {
    render(<RoundTicks round={round} zahlUnten />);

    const ticks = document.getElementById("pl-round-ticks")!;
    expect(ticks.getAttribute("aria-label")).toBe(round.label);
    expect(document.querySelectorAll('[id="pl-round-ticks"]')).toHaveLength(1);

    const direkteKinder = Array.from(ticks.children);
    // Genau zwei Zeilen: [Striche], [Zahl + Runde].
    expect(direkteKinder).toHaveLength(2);
    expect(direkteKinder[0].className).toMatch(/tt-ticks/);
    expect(direkteKinder[1].textContent).toBe("5/12Runde");

    fireEvent.keyDown(ticks, { key: "Escape" });
    // Esc-Verhalten unverändert: löst den Fokus-Sprung ins Eingabefeld aus
    // (derselbe Speicher-Aufruf wie im Aufgaben-Kasten) - hier ohne
    // gemountetes Eingabefeld genügt, dass es nicht wirft.
    expect(() => fireEvent.keyDown(ticks, { key: "Escape" })).not.toThrow();
  });
});

describe("Zeichenlisten-Sinnbild — „p“ in Braille statt „n“ (Charge 20.09.2026 Abend)", () => {
  it("★★★★ zeigt Punkte 1 2 3 4 gefüllt, 5 und 6 leer - der Außenrand der leeren Ringe ist nicht größer als der Radius der vollen Punkte", () => {
    zeigeSeite();

    const knopf = screen.getByRole("button", { name: "Zeichenliste" });
    const svg = knopf.querySelector("svg")!;
    // React schreibt `strokeWidth` als SVG-Attribut `stroke-width`.
    const strichstaerke = Number(svg.getAttribute("stroke-width"));
    expect(strichstaerke).toBeGreaterThan(0);

    const kreise = Array.from(svg.querySelectorAll("circle"));
    expect(kreise).toHaveLength(6);

    const byPos = (cx: string, cy: string) =>
      kreise.find((c) => c.getAttribute("cx") === cx && c.getAttribute("cy") === cy)!;
    const istGefuellt = (c: Element) => c.getAttribute("fill") === "currentColor";

    // Linke Spalte (Punkte 1 2 3) komplett gefüllt, rechte Spalte nur oben
    // (Punkt 4) - Punkte 5 und 6 leer. Zählung: links von oben 1 2 3, rechts
    // von oben 4 5 6.
    expect(istGefuellt(byPos("8", "6"))).toBe(true); // Punkt 1
    expect(istGefuellt(byPos("8", "12"))).toBe(true); // Punkt 2
    expect(istGefuellt(byPos("8", "18"))).toBe(true); // Punkt 3
    expect(istGefuellt(byPos("16", "6"))).toBe(true); // Punkt 4
    expect(istGefuellt(byPos("16", "12"))).toBe(false); // Punkt 5
    expect(istGefuellt(byPos("16", "18"))).toBe(false); // Punkt 6

    const gefuellt = kreise.filter(istGefuellt);
    const leer = kreise.filter((c) => !istGefuellt(c));
    expect(gefuellt).toHaveLength(4);
    expect(leer).toHaveLength(2);

    // Voller Punkt: `stroke="none"` → Außenrand = r. Leerer Ring: Rand liegt
    // MITTIG auf dem Radius (SVG-Standard) → Außenrand = r + Strichstärke/2.
    // Aus den Attributen gerechnet, nicht aus dem Augenmaß.
    const vollAussen = Math.max(...gefuellt.map((c) => Number(c.getAttribute("r"))));
    const leerAussen = Math.max(
      ...leer.map((c) => Number(c.getAttribute("r")) + strichstaerke / 2),
    );
    // Gleitkomma-Rundung (0,8 + 1,6 kann 2,4000000000000004 ergeben) - darum
    // mit einer winzigen Toleranz statt starr `toBeLessThanOrEqual`.
    expect(leerAussen).toBeLessThanOrEqual(vollAussen + 1e-9);
  });
});
