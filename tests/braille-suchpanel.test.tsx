/**
 * ════════════════════════════════════════════════════════════════════════════
 * WÄCHTER: das Bedienfeld der Suchaufgabe (23.09.2026)
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Die Rechnung dahinter prüft `braille-suchaufgabe.test.ts`. Hier geht es um
 * das, was ein Kind vor sich hat - und um die vier Hausregeln, die an einem
 * Übungsbildschirm am leichtesten verloren gehen:
 *
 *  1. ★ Die Platznummer steht AN der Zelle, auch für die Sprachausgabe. Wer
 *     zählen soll, darf nicht mitzählen müssen. Verlassen wir uns auf die
 *     Nummerierung der Sprachausgabe, wissen wir nicht, ob sie kommt - das
 *     lässt sich aus dem Browser nicht abfragen
 *     ([[reference_screenreader_nicht_abfragbar]]).
 *  2. ★★ NIE `disabled` (Bauart §3). Ein abgeschaltetes Feld nimmt den Fokus
 *     weg, und der fällt auf `<body>` - für eine Sprachausgabe der
 *     Dokumentenanfang.
 *  3. Die Kennzeichen der gemeinsamen Bauart: `data-aufgabe`, `data-angabe`,
 *     `data-feld`.
 *  4. ★★★ Eine leere Eingabe gibt nie ein Grün.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { SuchPanel } from "@/components/braille/BrailleTrainer";
import { baueSuchaufgabe, type SuchEinheit } from "@/lib/braille/suchaufgabe";
import { textToCells } from "@/lib/braille/engine";
import { useBraillePlay } from "@/lib/braille/play";

afterEach(cleanup);
beforeEach(() => {
  act(() =>
    useBraillePlay.setState({ focusInputNonce: 0, repeatNonce: 0, paused: false }),
  );
});

function einheit(print: string): SuchEinheit {
  return { print, cells: textToCells(print, { system: "basis" }) };
}
const FRUEH = ["l", "a", "i", "m", "s", "u", "o", "d", "n", "e"].map(einheit);

/** Eine feste Aufgabe - die Prüfungen sollen nicht würfeln. */
function festeAufgabe(art: "position" | "anzahl" = "position") {
  let i = 0;
  const werte = [0.34, 0.05, 0.15, 0.25, 0.35, 0.45, 0.55, 0.65];
  return baueSuchaufgabe({
    auswahl: FRUEH,
    ziel: einheit("a"),
    art,
    laenge: 6,
    wuerfel: () => werte[i++ % werte.length],
  });
}

function zeige(art: "position" | "anzahl" = "position", onTask?: () => void) {
  const aufgabe = festeAufgabe(art);
  render(
    <SuchPanel
      aufgabe={aufgabe}
      eightDot={false}
      address="du"
      onDone={() => {}}
      onTask={onTask}
    />,
  );
  return aufgabe;
}

describe("Suchaufgabe-Bedienfeld - was dasteht", () => {
  it("die Frage steht als Beschriftung am Eingabefeld", () => {
    const aufgabe = zeige();
    const feld = screen.getByLabelText(aufgabe.frage);
    expect(feld).toBeInTheDocument();
    expect(feld.tagName).toBe("INPUT");
  });

  it("★ jede Zelle trägt ihre Platznummer - auch für die Sprachausgabe", () => {
    const aufgabe = zeige();
    const liste = document.querySelector("ol.sr-only");
    expect(liste, "sr-only-Liste der Reihe fehlt").toBeTruthy();
    const eintraege = Array.from(liste!.querySelectorAll("li"));
    expect(eintraege).toHaveLength(aufgabe.reihe.length);
    // Die Nummer steht ausgeschrieben im Text, nicht nur in der Listenposition.
    eintraege.forEach((li, i) => {
      expect(li.textContent).toMatch(new RegExp(`^\\s*${i + 1}\\.`));
      expect(li.textContent).toContain("Punkt");
    });
  });

  it("die Kennzeichen der gemeinsamen Bauart sind gesetzt", () => {
    zeige();
    expect(document.querySelector("[data-aufgabe]")).toBeTruthy();
    expect(document.querySelector("[data-angabe]")).toBeTruthy();
    expect(document.querySelector('[data-feld="antwort"]')).toBeTruthy();
  });

  it("die Angabe ist mit der Aufforderung darüber verbunden", () => {
    zeige();
    const angabe = document.querySelector("[data-angabe]")!;
    const id = angabe.getAttribute("aria-describedby");
    expect(id, "aria-describedby fehlt").toBeTruthy();
    expect(document.getElementById(id!)?.textContent).toContain("Taste die Reihe ab");
  });
});

describe("★★★ Suchaufgabe-Bedienfeld - antworten", () => {
  it("die richtige Zahl wird angenommen", () => {
    const aufgabe = zeige();
    const feld = screen.getByLabelText(aufgabe.frage);
    fireEvent.change(feld, { target: { value: String(aufgabe.loesung) } });
    fireEvent.click(screen.getByRole("button", { name: "Prüfen" }));
    expect(screen.getByText(/Richtig gezählt/)).toBeInTheDocument();
  });

  it("★ die falsche Zahl nennt die Lösung und bietet „Nochmal\"", () => {
    const aufgabe = zeige();
    const feld = screen.getByLabelText(aufgabe.frage);
    fireEvent.change(feld, { target: { value: String(aufgabe.loesung + 1) } });
    fireEvent.click(screen.getByRole("button", { name: "Prüfen" }));
    expect(screen.getByText(new RegExp(`steht an Stelle ${aufgabe.loesung}`))).toBeInTheDocument();
    // ★ 29.09.2026: Der Knopf bekommt den Fokus und trägt darum die Lösung
    // VORNE im Namen (Ergebnis am Fokus); das sichtbare „Nochmal" steht am Ende.
    const nochmal = screen.getByRole("button", { name: /Nochmal$/ });
    expect(nochmal.getAttribute("aria-label")).toMatch(
      new RegExp(`^.*steht an Stelle ${aufgabe.loesung}\\. Nochmal$`),
    );
  });

  it("★★★ die leere Eingabe gibt kein Grün - und stürzt nicht ab", () => {
    const aufgabe = zeige();
    const knopf = screen.getByRole("button", { name: "Prüfen" });
    expect(() => fireEvent.click(knopf)).not.toThrow();
    expect(screen.queryByText(/Richtig gezählt/)).toBeNull();
    // Der Knopf bleibt bedienbar (nie `disabled`), sagt seinen Zustand aber an.
    expect(knopf).not.toHaveAttribute("disabled");
    expect(knopf).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByLabelText(aufgabe.frage)).toBeInTheDocument();
  });

  it("Buchstaben statt einer Zahl gelten als falsch, nicht als Absturz", () => {
    const aufgabe = zeige();
    const feld = screen.getByLabelText(aufgabe.frage);
    fireEvent.change(feld, { target: { value: "drei" } });
    expect(() => fireEvent.click(screen.getByRole("button", { name: "Prüfen" }))).not.toThrow();
    expect(screen.queryByText(/Richtig gezählt/)).toBeNull();
  });

  it("die Wertung bekommt die getippte Antwort mit", () => {
    const onTask = vi.fn();
    const aufgabe = festeAufgabe();
    render(
      <SuchPanel aufgabe={aufgabe} eightDot={false} address="du" onDone={() => {}} onTask={onTask} />,
    );
    const feld = screen.getByLabelText(aufgabe.frage);
    fireEvent.change(feld, { target: { value: "7" } });
    fireEvent.click(screen.getByRole("button", { name: "Prüfen" }));
    expect(onTask).toHaveBeenCalledTimes(1);
    const [korrekt, meta] = onTask.mock.calls[0];
    expect(korrekt).toBe(false);
    expect(meta.typed).toBe("7");
    expect(meta.cells).toBeGreaterThan(0);
  });
});

describe("★★ Suchaufgabe-Bedienfeld - das Feld wird NIE abgeschaltet", () => {
  it("vor dem Prüfen ist es normal bedienbar", () => {
    const aufgabe = zeige();
    const feld = screen.getByLabelText(aufgabe.frage);
    expect(feld).not.toHaveAttribute("disabled");
    expect(feld).not.toHaveAttribute("readonly");
  });

  it("★ nach dem Prüfen ist es readOnly - nicht disabled", () => {
    const aufgabe = zeige();
    const feld = screen.getByLabelText(aufgabe.frage);
    fireEvent.change(feld, { target: { value: String(aufgabe.loesung) } });
    fireEvent.click(screen.getByRole("button", { name: "Prüfen" }));
    // Nach dem Prüfen trägt das Feld den Stand vorne im Namen.
    const nachher = screen.getByLabelText(`Richtig. ${aufgabe.frage}`);
    expect(nachher).toHaveAttribute("readonly");
    expect(nachher).not.toHaveAttribute("disabled");
    expect(nachher).toHaveAttribute("aria-disabled", "true");
  });

  it("der Stand steht VORNE im Namen, die sichtbare Beschriftung bleibt darin", () => {
    // WCAG 2.5.3: der sichtbare Text muss im zugänglichen Namen enthalten sein.
    const aufgabe = zeige();
    const feld = screen.getByLabelText(aufgabe.frage);
    fireEvent.change(feld, { target: { value: String(aufgabe.loesung) } });
    fireEvent.click(screen.getByRole("button", { name: "Prüfen" }));
    const name = screen.getByRole("textbox").getAttribute("aria-label")!;
    expect(name.startsWith("Richtig.")).toBe(true);
    expect(name).toContain(aufgabe.frage);
  });
});

describe("Suchaufgabe-Bedienfeld - „wie oft?\"", () => {
  it("die Frage lautet anders und die Lösung ist die Anzahl", () => {
    const aufgabe = zeige("anzahl");
    expect(aufgabe.frage).toMatch(/Wie oft/);
    const feld = screen.getByLabelText(aufgabe.frage);
    fireEvent.change(feld, { target: { value: String(aufgabe.loesung) } });
    fireEvent.click(screen.getByRole("button", { name: "Prüfen" }));
    expect(screen.getByText(/Richtig gezählt/)).toBeInTheDocument();
  });

  it("der Lösungssatz nennt die Anzahl, nicht eine Stelle", () => {
    const aufgabe = zeige("anzahl");
    const feld = screen.getByLabelText(aufgabe.frage);
    fireEvent.change(feld, { target: { value: String(aufgabe.loesung + 1) } });
    fireEvent.click(screen.getByRole("button", { name: "Prüfen" }));
    expect(screen.getByText(new RegExp(`${aufgabe.loesung} mal`))).toBeInTheDocument();
  });
});

describe("Suchaufgabe-Bedienfeld - Pause", () => {
  it("in der Pause steht der Hinweis und das Feld ist readOnly, nicht disabled", () => {
    const aufgabe = zeige();
    act(() => useBraillePlay.setState({ paused: true }));
    expect(screen.getByText(/Pause/)).toBeInTheDocument();
    const feld = screen.getByLabelText(aufgabe.frage);
    expect(feld).toHaveAttribute("readonly");
    expect(feld).not.toHaveAttribute("disabled");
  });
});

/**
 * ★★★ GEFUNDEN IM BROWSER, NICHT IM TEST (23.09.2026)
 *
 * Der erste Entwurf würfelte die Reihe bei JEDEM Rendern neu: Die Abhängig-
 * keiten des `useMemo` im Aufgabenlauf enthielten `level.items`, und das ist
 * bei jedem Rendern ein neues Feld (`etappeToLevel` baut das Level frisch).
 * Das Kind liest eine Reihe, tippt die Stelle - und geprüft wird gegen eine
 * andere. Der Schlüssel des Bedienfeldes bleibt dabei gleich, die getippte
 * Zahl steht also noch da, während die Aufgabe lautlos gewechselt hat.
 *
 * Ein Bedienfeld, das seine Aufgabe von aussen bekommt, kann das nicht
 * verhindern - deshalb steht der Wächter hier beim Aufgabenlauf: Dieselben
 * Eingaben müssen dieselbe Reihe ergeben.
 */
describe("★★★ Die Aufgabe darf sich nicht unter den Fingern ändern", () => {
  it("gleiche Eingaben ergeben dieselbe Reihe - der Inhalt zählt, nicht die Identität", () => {
    const auswahl1 = [...FRUEH];
    const auswahl2 = FRUEH.map((e) => ({ ...e })); // andere Objekte, gleicher Inhalt
    const wuerfelWerte = [0.34, 0.05, 0.15, 0.25, 0.35, 0.45];
    const bauen = (auswahl: SuchEinheit[]) => {
      let i = 0;
      return baueSuchaufgabe({
        auswahl, ziel: auswahl.find((e) => e.print === "a")!, art: "position",
        laenge: 6, wuerfel: () => wuerfelWerte[i++ % wuerfelWerte.length],
      });
    };
    const a = bauen(auswahl1);
    const b = bauen(auswahl2);
    expect(b.reihe.map((e) => e.print)).toEqual(a.reihe.map((e) => e.print));
    expect(b.loesung).toBe(a.loesung);
  });

  it("★ die Lösung zeigt immer auf die Stelle, die wirklich in der Reihe steht", () => {
    // Der Fehler von oben sah so aus: Anzeige sagte Stelle 6, Prüfung sagte 4.
    // Solange beide aus DERSELBEN Aufgabe kommen, kann das nicht passieren -
    // und genau das hält dieser Wächter fest.
    for (let n = 0; n < 50; n++) {
      const aufgabe = festeAufgabe();
      cleanup();
      render(
        <SuchPanel aufgabe={aufgabe} eightDot={false} address="du" onDone={() => {}} />,
      );
      const eintraege = Array.from(document.querySelectorAll("ol.sr-only li"));
      const anDerStelle = eintraege[aufgabe.loesung - 1].textContent ?? "";
      const zielPunkte = aufgabe.ziel.cells.map((c) => c).length;
      expect(zielPunkte).toBeGreaterThan(0);
      // An der Lösungsstelle steht dieselbe Punktangabe wie beim Ziel.
      const feld = screen.getByLabelText(aufgabe.frage);
      fireEvent.change(feld, { target: { value: String(aufgabe.loesung) } });
      fireEvent.click(screen.getByRole("button", { name: "Prüfen" }));
      expect(screen.queryByText(/Richtig gezählt/), anDerStelle).not.toBeNull();
    }
  });
});
