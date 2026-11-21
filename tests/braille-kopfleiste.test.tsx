/**
 * ★★★ KOPFLEISTE „A - TRENNLINIEN" (20.09.2026) - Fassung, die Johannes aus
 * drei Entwürfen gewählt hat: Rang/Stufe, Schreiben/Lesen, Schrift und Etappe
 * stehen jetzt in EINER Zeile mit vier Gruppen, getrennt durch haarfeine
 * senkrechte Linien. Dieser Wächter hält vier Dinge fest:
 *
 *  1. Jedes Feld hat einen zugänglichen Hinweis (`Tipp`, über
 *     `aria-describedby` auffindbar) statt eines `title` - der native
 *     `title` ist tastaturtaub und erscheint erst nach rund einer Sekunde
 *     (Bauart, gemessen 10.09.2026 - dieselbe Messung wie hier).
 *  2. Im Kopfbereich gibt es darum KEIN Element mit `title`-Attribut mehr.
 *  3. Die Etappen-Liste zeigt den gekürzten Namen (vor dem Gedankenstrich),
 *     die Marken „— gemeistert" bleibt.
 *  4. Schreiben/Lesen bleibt eine Radiogruppe mit Pfeiltasten-Navigation, und
 *     die Trennlinien sind `aria-hidden`.
 */
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { PunktgenauPage } from "@/features/public/PunktgenauPage";
import { Punktgenau } from "@/components/braille/Punktgenau";

afterEach(cleanup);

function zeigeSeite() {
  render(
    <MemoryRouter initialEntries={["/programme/punktgenau"]}>
      <PunktgenauPage />
    </MemoryRouter>,
  );
}

/** Die Kopfleisten-Karte, in der Rang/Stufe/Richtung/Schrift/Etappe stehen. */
function kopfleiste(): HTMLElement {
  const el = document.querySelector('[data-kopfleiste]');
  if (!el) throw new Error("Keine Kopfleiste ([data-kopfleiste]) im Dokument.");
  return el as HTMLElement;
}

/** Findet den Hinweistext, den `element` über `aria-describedby` trägt. */
function hinweisVon(element: Element): string {
  const id = element.getAttribute("aria-describedby");
  expect(id, `${element.tagName} hat kein aria-describedby`).toBeTruthy();
  const hinweis = document.getElementById(id!);
  expect(hinweis, `kein Element mit id="${id}"`).toBeTruthy();
  return hinweis!.textContent ?? "";
}

describe("Punktgenau — Kopfleiste Fassung A - Trennlinien (20.09.2026)", () => {
  it("★★★★★ jedes Feld hat einen zugänglichen Hinweis mit dem passenden Stichwort", () => {
    zeigeSeite();
    const k = kopfleiste();

    const rang = within(k).getByRole("img", { name: /^Rang / });
    expect(hinweisVon(rang)).toMatch(/Rang/);

    const xp = within(k).getByText(/^\d+ XP$/);
    expect(hinweisVon(xp)).toMatch(/XP/);

    const sterne = within(k).getByText(/★$/);
    expect(hinweisVon(sterne)).toMatch(/Sterne/);

    const schreiben = within(k).getByRole("radio", { name: "Schreiben" });
    expect(hinweisVon(schreiben)).toMatch(/Schreiben/);

    const lesen = within(k).getByRole("radio", { name: "Lesen" });
    expect(hinweisVon(lesen)).toMatch(/Lesen/);

    const schrift = within(k).getByRole("combobox", { name: "Brailleschriftsystem (Bereich) auswählen" });
    expect(hinweisVon(schrift)).toMatch(/Schrift/);

    const etappenListe = within(k).getByRole("combobox", { name: /Kapitel \(Etappe\) auswählen/ });
    expect(hinweisVon(etappenListe)).toMatch(/Etappe/);

    const zurueck = within(k).getByRole("button", { name: "Vorige Etappe" });
    expect(hinweisVon(zurueck)).toMatch(/zurück/);

    const weiter = within(k).getByRole("button", { name: "Nächste Etappe" });
    expect(hinweisVon(weiter)).toMatch(/weiter/);
  });

  it("★★★★★ der Stufe-Kreis (zweiter Ring) hat einen Hinweis mit dem Stichwort Stufe", () => {
    zeigeSeite();
    const k = kopfleiste();
    // Der zweite Ring erscheint erst, sobald der Runner den ersten
    // Fortschritt gemeldet hat (`onProgress`) - direkt beim Mount der Fall.
    const ringe = within(k).getAllByRole("img", { name: /^Rang |^Stufe /});
    const stufe = ringe.find((r) => /^Stufe /.test(r.getAttribute("aria-label") ?? ""));
    expect(stufe, "kein Stufe-Ring gefunden").toBeTruthy();
    expect(hinweisVon(stufe!)).toMatch(/Stufe/);
  });

  it("★★★★★ im Kopfbereich gibt es KEIN Element mit title-Attribut", () => {
    zeigeSeite();
    const k = kopfleiste();
    expect(k.querySelectorAll("[title]")).toHaveLength(0);
  });

  it("★★★★ die Etappen-Liste zeigt den gekürzten Namen - die Marke gemeistert bleibt", () => {
    zeigeSeite();
    const k = kopfleiste();
    const liste = within(k).getByRole("combobox", { name: /Kapitel \(Etappe\) auswählen/ });
    const optionen = Array.from(liste.querySelectorAll("option"));
    expect(optionen.length).toBeGreaterThan(1);

    // b1: voller Titel „l, a, i, m — die ersten Tastbilder" - die Liste zeigt
    // nur den Teil vor dem Gedankenstrich.
    const erste = optionen[0];
    expect(erste.textContent).toBe("Etappe 1: l, a, i, m");
    expect(erste.textContent).not.toMatch(/Tastbilder/);
  });

  it("★★★★ keine Etappe trägt die Marke noch gesperrt - auch mit Konto in einer Klasse (18.11.2026: alle Kapitel offen)", () => {
    cleanup();
    render(<Punktgenau accountId="k1" />);
    const optionen = screen.getAllByRole("option") as HTMLOptionElement[];
    expect(optionen.some((o) => o.textContent?.includes("noch gesperrt") || o.disabled)).toBe(false);
  });

  it("★★★ Schreiben/Lesen ist weiterhin eine Radiogruppe mit Pfeiltasten-Navigation", () => {
    zeigeSeite();
    const k = kopfleiste();
    const radiogroup = within(k).getByRole("radiogroup", { name: "Übungsrichtung" });
    const schreiben = within(k).getByRole("radio", { name: "Schreiben" });
    const lesen = within(k).getByRole("radio", { name: "Lesen" });

    expect(schreiben.getAttribute("aria-checked")).toBe("true");
    schreiben.focus();
    fireEvent.keyDown(radiogroup, { key: "ArrowRight" });
    expect(lesen.getAttribute("aria-checked")).toBe("true");
    fireEvent.keyDown(radiogroup, { key: "ArrowLeft" });
    expect(schreiben.getAttribute("aria-checked")).toBe("true");
  });

  it("★★★ die Trennlinien sind aria-hidden - eine Sprachausgabe darf sie nicht als Inhalt lesen", () => {
    zeigeSeite();
    const k = kopfleiste();
    // Haarfeine senkrechte Linien: `w-px`, `bg-hairline`, immer `aria-hidden`.
    const trenner = Array.from(k.querySelectorAll(".bg-hairline")).filter((el) =>
      el.className.includes("w-px"),
    );
    expect(trenner.length).toBeGreaterThan(0);
    for (const t of trenner) {
      expect(t.getAttribute("aria-hidden")).toBe("true");
    }
  });
});
