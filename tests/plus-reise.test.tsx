/**
 * Wächter für die Reise (16.10.2026) - Szene am Ende einer Etappe.
 *
 * Entwurf: zwei Tonlagen (Geschichte bis Stufe 4, Akten ab Stufe 5), alles als
 * Text, keine Rechnungen in den Szenen, kein Zeitdruck.
 */
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PlusReise } from "../src/components/plus/PlusReise";
import { PlusUebung } from "../src/components/plus/PlusUebung";
import {
  etappenSatz, etappenWort, neueEtappe, reiseBisher, szene, szenenTitel, tonlage,
} from "../src/lib/plus/reise";
import { paketeDerStufe, STUFEN } from "../src/lib/plus/stoffplan";

describe("Die Tonlage richtet sich nach der Schulstufe", () => {
  it("Geschichte bis Stufe 4, Akten danach", () => {
    for (const s of [1, 2, 3, 4]) expect(tonlage(s)).toBe("geschichte");
    for (const s of [5, 6, 7, 8]) expect(tonlage(s)).toBe("akte");
    expect(etappenWort(3)).toBe("Etappe");
    expect(etappenWort(7)).toBe("Fall");
  });

  it("Titel zählen Ort und Akte", () => {
    expect(szenenTitel(3, 4)).toBe("Ort 4: Die Muscheln");
    expect(szenenTitel(7, 4)).toBe("Akte 4: Der Brief");
  });
});

describe("Die Szenen", () => {
  it("★ gibt es für jede Etappe jeder Stufe - die Reihe beginnt sonst von vorn", () => {
    for (const st of STUFEN) {
      const n = paketeDerStufe(st.nr).length;
      for (let nr = 1; nr <= n; nr += 1) {
        const s = szene(st.nr, nr);
        expect(s.ort.length, `${st.nr}/${nr}`).toBeGreaterThan(2);
        expect(s.text.length).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it("★ enthalten keine Rechnung und keine Zeitangabe", () => {
    for (const stufe of [3, 7]) {
      for (let nr = 1; nr <= 12; nr += 1) {
        const alles = szene(stufe, nr).text.join(" ");
        expect(alles, `${stufe}/${nr}`).not.toMatch(/[=+*^]|\d ?\/ ?\d/);
        expect(alles).not.toMatch(/Minute|Sekunde|schnell|Zeit/i);
        // Sätze kurz halten.
        for (const satz of szene(stufe, nr).text) expect(satz.split(/\s+/).length).toBeLessThanOrEqual(10);
      }
    }
  });

  it("★ die Akten loben nicht - die Geschichte darf freundlich sein, aber nie kindisch-belehrend", () => {
    for (let nr = 1; nr <= 12; nr += 1) {
      const akte = szene(7, nr).text.join(" ");
      expect(akte).not.toMatch(/toll|super|klug|prima|bravo|stolz/i);
    }
  });
});

describe("Welche Etappe ist neu?", () => {
  it("nennt die neue Etappe, ihre Nummer und die nächste", () => {
    const liste = paketeDerStufe(3);
    const vorher = new Set([liste[0].id, liste[1].id, liste[2].id]);
    const jetzt = new Set([...vorher, liste[3].id]);
    const e = neueEtappe(vorher, jetzt)!;
    expect(e.stufe).toBe(3);
    expect(e.nr).toBe(4);
    expect(e.gesamt).toBe(liste.length);
    expect(e.paketName).toBe(liste[3].name);
    expect(e.naechste).toBe(liste[4].name);
    expect(etappenSatz(e)).toBe(`Etappe 4 von ${liste.length} geschafft: ${liste[3].name}.`);
  });

  it("★ ohne neues Paket gibt es keine Etappe", () => {
    const s = new Set(["3-01"]);
    expect(neueEtappe(s, s)).toBeNull();
    expect(neueEtappe(new Set(["3-01", "3-02"]), s)).toBeNull();
  });

  it("zählt die Reise bisher bis zur n-ten Etappe", () => {
    const r = reiseBisher(7, 3);
    expect(r).toHaveLength(3);
    expect(r[2].titel).toBe("Akte 3: Der Keller");
  });
});

describe("Die Karte", () => {
  const liste = paketeDerStufe(7);
  const etappe = neueEtappe(new Set(), new Set([liste[3].id]))!;

  it("zeigt Stand und Szene als Text - der Balken ist stumm", () => {
    const { container } = render(<PlusReise etappe={etappe} />);
    expect(screen.getByRole("heading", { name: "Fall 4 geschafft" })).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`Fall 4 von ${liste.length} · ${liste[3].name}`))).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Akte 4: Der Brief" })).toBeInTheDocument();
    expect(container.querySelector('[aria-hidden="true"]')).not.toBeNull();
  });

  it("★ „Die Reise bisher lesen“ ist ein Schalter und lässt den Fokus liegen", () => {
    render(<PlusReise etappe={etappe} />);
    const knopf = screen.getByRole("button", { name: "Die Reise bisher lesen" });
    expect(knopf).toHaveAttribute("aria-expanded", "false");
    knopf.focus();
    fireEvent.click(knopf);
    expect(knopf).toHaveAttribute("aria-expanded", "true");
    expect(document.activeElement).toBe(knopf);
    expect(screen.getByText(/Akte 1: Der Auftrag\./)).toBeInTheDocument();
  });
});

describe("Am Ende der Runde", () => {
  function rechne(saat: number) {
    // Eine Runde aus „1-08" richtig rechnen.
    return import("../src/lib/plus/generator").then(({ erzeugeLauf }) => {
      for (const a of erzeugeLauf("1-08", { anzahl: 8, saat })) {
        fireEvent.change(screen.getByLabelText("Deine Antwort"), { target: { value: a.loesung } });
        fireEvent.click(screen.getByRole("button", { name: "Prüfen" }));
      }
    });
  }

  it("zeigt die Karte, wenn eine Etappe neu ist, und sagt sie in der Live-Region", async () => {
    const e = neueEtappe(new Set(), new Set(["1-08"]))!;
    render(<PlusUebung paketId="1-08" saat={4} onZurueck={() => {}} etappe={e} />);
    await rechne(4);
    expect(await screen.findByText("Geschafft")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /^Etappe \d+ geschafft$/ })).toBeInTheDocument();
    const live = screen.getAllByRole("status").find((n) => n.textContent?.includes("geschafft:"));
    expect(live?.textContent).toBe(etappenSatz(e));
  });

  it("★ zeigt ohne neue Etappe keine Karte", async () => {
    render(<PlusUebung paketId="1-08" saat={4} onZurueck={() => {}} />);
    await rechne(4);
    expect(await screen.findByText("Geschafft")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /geschafft$/ })).toBeNull();
  });
});

/* ------------------------------------------------------------------ */
/* Auf der Seite                                                       */
/* ------------------------------------------------------------------ */

import { waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach } from "vitest";
import { useTypingAuth } from "../src/components/typing/useTypingAuth";
import { PlusPage } from "../src/features/public/PlusPage";
import { tagesnummer } from "../src/lib/plus/coach";
import { backendZuruecksetzen } from "../src/lib/plus/fortschritt";

describe("Auf der Seite: die Etappe kommt, wenn ein Paket neu sitzt", () => {
  beforeEach(() => {
    localStorage.clear();
    useTypingAuth.setState({ account: null });
    backendZuruecksetzen();
  });

  function seed(versuche: number) {
    localStorage.setItem("plus:stand:anonym", JSON.stringify({
      stand: {
        koennen: { plus: 2200 },
        pakete: {
          "1-10": { elo: 200, versuche, richtigeInFolge: 0, laeufe: 0, guteLaeufe: 0, geschafft: false, kartei: 0, faellig: null },
        },
        tag: tagesnummer(), heuteJePaket: {}, zuletzt: null,
      },
    }));
  }

  async function rundeInTauschaufgabe() {
    render(<MemoryRouter><PlusPage /></MemoryRouter>);
    await waitFor(() => screen.getByText("Willkommen bei Plus!"));
    fireEvent.click(screen.getByRole("button", { name: /Ich wähle/ }));
    fireEvent.click(screen.getByRole("button", { name: /1\. Schulstufe/ }));
    fireEvent.click(screen.getByRole("button", { name: "Tauschaufgabe" }));
    for (let i = 0; i < 8; i++) {
      for (let v = 0; v < 2; v++) {
        fireEvent.change(screen.getByLabelText("Deine Antwort"), { target: { value: "99999" } });
        fireEvent.click(screen.getByRole("button", { name: "Prüfen" }));
      }
      fireEvent.click(screen.getByRole("button", { name: "Ich komme nicht weiter" }));
      fireEvent.click(screen.getByRole("button", { name: "Weiter" }));
    }
    await waitFor(() => screen.getByText("Geschafft"));
  }

  it("★ ein Paket, das in dieser Runde zu sitzen beginnt, bringt die Szene", async () => {
    seed(3);
    await rundeInTauschaufgabe();
    const kopf = await screen.findByRole("heading", { name: /^Etappe \d+ geschafft$/ });
    expect(kopf).toBeInTheDocument();
    expect(screen.getByText(/Etappe \d+ von 18 · Tauschaufgabe/)).toBeInTheDocument();
  });

  it("★ saß es schon vor der Runde, kommt keine Szene - sie wird nicht zweimal verschenkt", async () => {
    seed(30);
    await rundeInTauschaufgabe();
    expect(screen.queryByRole("heading", { name: /^Etappe \d+ geschafft$/ })).toBeNull();
  });
});
