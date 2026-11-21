/**
 * ★★★ WÄCHTER: „Wo stehe ich, was kommt dann?" - die Anzeige in der Übung.
 * ===========================================================================
 *
 * Johannes, 16.10.2026: „Schüler brauchen während dem Üben mehr Überblick …
 * für die Kleinen A, ab der 6. Schulstufe B2."
 *
 *  (a) Alle Schulstufen zeigen die Perlen auf der durchgehenden Linie (Johannes,
 *      16.10.2026: „nimm die Zahlenleiste von A3") - kommen Felder zurück, wird (a) rot.
 *  (b) Die Bilder sind stumm (`aria-hidden`); der Satz „Aufgabe n von 8" bleibt
 *      Text, dazu „Danach kommt ein Rätsel" nur für Sprachausgabe - wird die
 *      Anzeige vorgelesen oder fehlt der Satz, wird (b) rot.
 *  (c) Kein Zeichen für richtig/falsch in der Anzeige: Sie kennt nur
 *      geschafft, jetzt, offen - wird ein Fehler markiert, wird (c) rot.
 *  (d) Nur „Mein Training" hat die Wegzeile; die Rundenkette steht im Abschluss.
 */
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

import { PlusUebung } from "@/components/plus/PlusUebung";
import { PlusPerlen, PlusRundenKette, PlusWegzeile, danachSatz } from "@/components/plus/PlusFortschritt";

afterEach(cleanup);

describe("(a) Eine Zahlenleiste für alle Schulstufen", () => {
  it("★★★ Stufe 3 und Stufe 7 zeigen dieselben Perlen - in der echten Übung", () => {
    const klein = render(<PlusUebung paketId="3-01" saat={1} onZurueck={() => {}} />);
    expect(klein.container.querySelector('[data-plus-anzeige="perlen"]')).not.toBeNull();
    klein.unmount();
    const gross = render(<PlusUebung paketId="7-01" saat={1} onZurueck={() => {}} />);
    expect(gross.container.querySelector('[data-plus-anzeige="perlen"]')).not.toBeNull();
    expect(gross.container.querySelector('[data-plus-anzeige="felder"]')).toBeNull();
  });

  it("★★ Die Perlen liegen auf EINER durchgehenden Linie: zwischen zwei Perlen ein Strich, am Ende die Fahne", () => {
    const { container } = render(<PlusPerlen nr={2} gesamt={8} raetsel={false} />);
    const perlen = container.querySelectorAll("[data-perle]");
    expect(perlen).toHaveLength(8);
    // Je Perle ein Verbindungsstrich, der die freie Breite füllt (`flex-1`).
    expect(container.querySelectorAll("span.flex-1")).toHaveLength(8);
  });

  it("★★ die Perlen zählen: zwei geschafft, eine jetzt, der Rest offen", () => {
    const { container } = render(<PlusPerlen nr={3} gesamt={8} raetsel={false} />);
    expect(container.querySelectorAll('[data-perle="fertig"]')).toHaveLength(2);
    expect(container.querySelectorAll('[data-perle="jetzt"]')).toHaveLength(1);
    expect(container.querySelectorAll('[data-perle="offen"]')).toHaveLength(5);
  });
});

describe("(b) Stumm fürs Auge - der Satz bleibt", () => {
  it("★★★ die Bilder sind aria-hidden, der Satz ist Text", () => {
    const { container } = render(<PlusUebung paketId="3-01" saat={1} onZurueck={() => {}} />);
    expect(screen.getByText("Aufgabe 1 von 8")).toBeInTheDocument();
    const anzeige = container.querySelector('[data-plus-anzeige="perlen"]') as HTMLElement;
    expect(anzeige.getAttribute("aria-hidden")).toBe("true");
  });

  it("★★ Der Satz „Danach kommt ein Rätsel“ steht nur dann da, wenn eines kommt", () => {
    expect(danachSatz(4, 8, true)).toBe("Noch 4 danach. Danach kommt ein Rätsel.");
    expect(danachSatz(4, 8, false)).toBe("Noch 4 danach.");
    expect(danachSatz(7, 8, false)).toBe("Noch eine danach.");
    expect(danachSatz(8, 8, false)).toBe("Das ist die letzte.");
  });
});

describe("(c) Nichts markiert einen Fehler", () => {
  it("★★★ die Anzeige kennt nur geschafft, jetzt und offen", () => {
    const { container } = render(<PlusPerlen nr={5} gesamt={8} raetsel />);
    const arten = [...container.querySelectorAll("[data-perle]")].map((e) => e.getAttribute("data-perle"));
    expect(new Set(arten)).toEqual(new Set(["fertig", "jetzt", "offen"]));
    expect(container.innerHTML).not.toMatch(/falsch|fehler|red|✗|✕/i);
  });
});

describe("(d) Wegzeile und Rundenkette", () => {
  it("★★ die Wegzeile nennt Etappe und Namen als Text", () => {
    render(<PlusWegzeile weg={{ nr: 3, gesamt: 12, name: "Plus bis 100" }} />);
    expect(screen.getByText("Etappe 3 von 12: Plus bis 100")).toBeInTheDocument();
  });

  it("★★ die Übung ohne Training hat keine Wegzeile", () => {
    const { container } = render(<PlusUebung paketId="3-01" saat={1} onZurueck={() => {}} />);
    expect(container.querySelector('[data-plus-anzeige="wegzeile"]')).toBeNull();
  });

  it("★★ die Rundenkette: zwei von drei Runden sind geschafft", () => {
    const { container } = render(<PlusRundenKette alle={3} bis={1} />);
    expect(container.querySelectorAll("span.rounded-full.border-dashed")).toHaveLength(1);
    expect(container.querySelector('[data-plus-anzeige="rundenkette"]')?.getAttribute("aria-hidden")).toBe("true");
  });
});
