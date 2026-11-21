/**
 * Wächter für die Oberfläche der Spiele.
 *
 * Die Frage ist immer dieselbe: kommt ein Kind mit Braillezeile gleichwertig
 * durch? Also: alles als Text, alles mit der Tastatur, nirgends eine Uhr.
 */
import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PlusSpiele, SPIELE } from "../src/components/plus/PlusSpiele";
import { zufall } from "../src/lib/plus/aufgabe";
import { neuesZielzahlSpiel } from "../src/lib/plus/spiele/zielzahl";

const SAAT = 5;

function oeffne(spiel: string, ansagen = vi.fn()) {
  render(<PlusSpiele stufe={4} saat={SAAT} ansagen={ansagen} onZurueck={() => {}} />);
  fireEvent.click(screen.getByRole("button", { name: new RegExp(spiel) }));
  return { ansagen };
}

describe("Die Spielauswahl", () => {
  it("sagt bei jedem Spiel, was man übt", () => {
    render(<PlusSpiele stufe={4} saat={SAAT} onZurueck={() => {}} />);
    for (const s of SPIELE) {
      const knopf = screen.getByRole("button", { name: new RegExp(s.titel) });
      expect(within(knopf).getByText(new RegExp(s.uebt))).toBeInTheDocument();
    }
  });
});

describe("Zielzahl", () => {
  it("nennt das Ziel und die Zahlen, die daliegen", () => {
    const spiel = neuesZielzahlSpiel(zufall(SAAT), 4);
    oeffne("Zielzahl");
    expect(screen.getByText(String(spiel.ziel))).toBeInTheDocument();
    expect(screen.getByText(spiel.zahlen.join(", "))).toBeInTheDocument();
  });

  it("nimmt einen Zug in der Schreibweise von Plus an", () => {
    const spiel = neuesZielzahlSpiel(zufall(SAAT), 4);
    const [a, b] = spiel.zahlen;
    oeffne("Zielzahl");
    fireEvent.change(screen.getByLabelText("Dein Zug"), { target: { value: `${a} +${b} =${a + b}` } });
    fireEvent.click(screen.getByRole("button", { name: "Zug machen" }));
    expect(screen.getByRole("status")).toHaveTextContent("Jetzt liegen da:");
  });

  it("★ sagt bei einem falschen Zug, WAS nicht stimmt", () => {
    oeffne("Zielzahl");
    fireEvent.change(screen.getByLabelText("Dein Zug"), { target: { value: "drei mal vier" } });
    fireEvent.click(screen.getByRole("button", { name: "Zug machen" }));
    expect(screen.getByRole("status")).toHaveTextContent("Schreib es so: 3 *4 =12");
  });

  it("zeigt den Weg erst, wenn das Kind danach fragt", () => {
    const spiel = neuesZielzahlSpiel(zufall(SAAT), 4);
    oeffne("Zielzahl");
    expect(screen.queryByText("Ein Weg zum Ziel")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Ich komme nicht weiter" }));
    expect(screen.getByText("Ein Weg zum Ziel")).toBeInTheDocument();
    expect(screen.getByText(spiel.weg[0])).toBeInTheDocument();
  });
});

describe("Heiß und kalt", () => {
  it("sagt größer oder kleiner - in Worten, nie in Farbe", () => {
    const { ansagen } = oeffne("Heiß und kalt");
    fireEvent.change(screen.getByLabelText("Deine Zahl"), { target: { value: "1" } });
    fireEvent.click(screen.getByRole("button", { name: "Raten" }));
    const meldung = screen.getByRole("status").textContent ?? "";
    expect(meldung).toMatch(/Größer|Kleiner|Getroffen/);
    expect(ansagen).toHaveBeenCalledWith(meldung);
  });

  it("merkt sich die Versuche", () => {
    oeffne("Heiß und kalt");
    for (const z of ["10", "20"]) {
      fireEvent.change(screen.getByLabelText("Deine Zahl"), { target: { value: z } });
      fireEvent.click(screen.getByRole("button", { name: "Raten" }));
    }
    expect(screen.getByText("10, 20")).toBeInTheDocument();
  });

  it("★ verrät die Lehre erst nach dem Spiel - vorher wäre sie die Lösung", () => {
    oeffne("Heiß und kalt");
    expect(screen.queryByText(/Halbieren/)).toBeNull();
  });
});

describe("★ Was in keinem Spiel vorkommt", () => {
  it("keine Uhr, keine Punkte, keine Rangliste", () => {
    for (const s of SPIELE) {
      const { container, unmount } = render(
        <PlusSpiele stufe={4} saat={SAAT} onZurueck={() => {}} />,
      );
      fireEvent.click(screen.getByRole("button", { name: new RegExp(s.titel) }));
      const text = container.textContent ?? "";
      expect(text, s.titel).not.toMatch(/Sekunde|Zeit|Punkte|Platz \d|Rangliste|schnell/i);
      unmount();
    }
  });

  it("kein Bedienteil ist abgeschaltet", () => {
    const { container } = render(<PlusSpiele stufe={4} saat={SAAT} onZurueck={() => {}} />);
    expect(container.querySelectorAll("[disabled]")).toHaveLength(0);
  });
});

describe("Turmbau", () => {
  it("fragt zuerst, wie schwer es sein soll", () => {
    oeffne("Turmbau");
    expect(screen.getByText("Wie schwer soll es sein?")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /leicht/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /schwer \(3 Stockwerke\)/ })).toBeInTheDocument();
  });

  it("stellt erst nach der Wahl eine Aufgabe", () => {
    oeffne("Turmbau");
    expect(screen.queryByLabelText("Deine Antwort")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /mittel/ }));
    expect(screen.getByLabelText("Deine Antwort")).toBeInTheDocument();
  });

  it("★ nimmt bei einer falschen Antwort nichts weg", () => {
    oeffne("Turmbau");
    fireEvent.click(screen.getByRole("button", { name: /schwer/ }));
    fireEvent.change(screen.getByLabelText("Deine Antwort"), { target: { value: "99999" } });
    fireEvent.click(screen.getByRole("button", { name: "Prüfen" }));
    expect(screen.getByRole("status")).toHaveTextContent("Der Turm bleibt, wie er ist.");
    expect(screen.getByText(/Dein Turm: 0 Stockwerke/)).toBeInTheDocument();
  });

  it("sagt die Aufgabe an - sie steht nur als Zeile da", () => {
    const { ansagen } = oeffne("Turmbau");
    fireEvent.click(screen.getByRole("button", { name: /leicht/ }));
    expect(ansagen).toHaveBeenCalled();
    const satz = ansagen.mock.calls[0][0] as string;
    expect(satz).not.toMatch(/[+*=]/);
  });
});

describe("Paare finden", () => {
  it("★ ist ein Gitter, kein Kasten voller Knöpfe", () => {
    // Eine Braillezeile liest Zeile und Spalte aus einer Tabelle - aus einer
    // Reihe von Schaltern nicht.
    oeffne("Paare finden");
    expect(screen.getByRole("grid")).toBeInTheDocument();
    expect(screen.getAllByRole("gridcell")).toHaveLength(16);
  });

  it("sagt an jedem Feld die Lage - auch zugedeckt", () => {
    oeffne("Paare finden");
    const felder = screen.getAllByRole("gridcell");
    expect(felder[6].getAttribute("aria-label")).toBe("Zeile 2, Spalte 3: zugedeckt");
  });

  it("geht mit den Pfeiltasten und sagt, wo man steht", () => {
    const { ansagen } = oeffne("Paare finden");
    fireEvent.keyDown(screen.getByRole("grid"), { key: "ArrowRight" });
    expect(ansagen).toHaveBeenCalledWith(expect.stringContaining("Zeile 1, Spalte 2"));
  });

  it("deckt mit der Eingabetaste auf", () => {
    oeffne("Paare finden");
    fireEvent.keyDown(screen.getByRole("grid"), { key: "Enter" });
    expect(screen.getByRole("status").textContent).toMatch(/Zeile 1, Spalte 1:/);
  });

  it("★ erst das Feld, dann die Rechnung - nie beides gleichzeitig", () => {
    // Die Rechnung steht still da, solange das Kind sie liest; das Gitter
    // bewegt sich dabei nicht von selbst.
    oeffne("Paare finden");
    const gitter = screen.getByRole("grid");
    fireEvent.keyDown(gitter, { key: "Enter" });
    const vorher = screen.getAllByRole("gridcell").map((z) => z.textContent);
    fireEvent.keyDown(gitter, { key: "ArrowDown" });
    expect(screen.getAllByRole("gridcell").map((z) => z.textContent)).toEqual(vorher);
  });
});

describe("Zahlenstrahl horchen", () => {
  it("★ sagt und zeigt, wo man steht - der Ton ist nur die Beigabe", () => {
    oeffne("Zahlenstrahl horchen");
    const strahl = screen.getByRole("slider", { name: "Zahlenstrahl" });
    expect(strahl).toHaveAttribute("aria-valuetext");
    expect(strahl.textContent).toMatch(/Du stehst bei/);
  });

  it("geht mit den Pfeiltasten und sagt den neuen Wert", () => {
    const { ansagen } = oeffne("Zahlenstrahl horchen");
    fireEvent.keyDown(screen.getByRole("slider"), { key: "ArrowRight" });
    expect(ansagen).toHaveBeenCalled();
    expect(screen.getByRole("slider").getAttribute("aria-valuenow")).not.toBe("0");
  });

  it("lässt den Ton abschalten - in einer ruhigen Klasse stört er", () => {
    oeffne("Zahlenstrahl horchen");
    const knopf = screen.getByRole("button", { name: /^Ton/ });
    fireEvent.click(knopf);
    expect(screen.getByRole("button", { name: "Ton an" })).toBeInTheDocument();
  });
});

describe("Zug um Zug", () => {
  it("fragt zuerst nach den Namen", () => {
    oeffne("Zug um Zug");
    expect(screen.getByLabelText("Name 1")).toBeInTheDocument();
    expect(screen.getByLabelText("Name 2")).toBeInTheDocument();
  });

  it("★ sagt vor jedem Zug, wer dran ist", () => {
    const { ansagen } = oeffne("Zug um Zug");
    fireEvent.change(screen.getByLabelText("Name 1"), { target: { value: "Mira" } });
    fireEvent.click(screen.getByRole("button", { name: "Losgehen" }));
    expect(ansagen).toHaveBeenCalledWith(expect.stringContaining("Mira ist dran"));
    expect(screen.getByText("Mira")).toBeInTheDocument();
  });

  it("gibt das Gerät nach jedem Zug weiter", () => {
    oeffne("Zug um Zug");
    fireEvent.click(screen.getByRole("button", { name: "Losgehen" }));
    fireEvent.change(screen.getByLabelText("Antwort"), { target: { value: "0" } });
    fireEvent.click(screen.getByRole("button", { name: "Prüfen und weitergeben" }));
    expect(screen.getByRole("status").textContent).toMatch(/Jetzt ist .* dran/);
  });

  it("kennt keine Uhr", () => {
    const { container } = render(<PlusSpiele stufe={4} saat={SAAT} onZurueck={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: /Zug um Zug/ }));
    expect(container.textContent).not.toMatch(/Sekunde|Zeit|schnell/i);
  });
});

describe("★ Brailleeingabe in den Spielen", () => {
  it.each([["Zielzahl", "Dein Zug"], ["Heiß und kalt", "Deine Zahl"], ["Schatzgitter", "Dein Ergebnis"]])(
    "%s hat das Plus-Eingabefeld mit Alt + B",
    (spiel, beschriftung) => {
      // Ohne Brailleeingabe wären die Spiele genau das, was die
      // Ausschlussregel verbietet: etwas, das ein Kind mit Braillezeile nicht
      // gleichwertig machen kann.
      oeffne(spiel);
      expect(screen.getByLabelText(beschriftung)).toBeInTheDocument();
      // Alt + 8 ist weg (Johannes, 18.10.2026, Kürzel einheitlich) - Alt + B bleibt.
      expect(screen.getByText(/Alt \+ B wechselt/)).toBeInTheDocument();
    },
  );

  it("das Duell ebenso - nach dem Start", () => {
    oeffne("Zug um Zug");
    fireEvent.click(screen.getByRole("button", { name: "Losgehen" }));
    expect(screen.getByLabelText("Antwort")).toBeInTheDocument();
    // Alt + 8 ist weg (Johannes, 18.10.2026, Kürzel einheitlich) - Alt + B bleibt.
      expect(screen.getByText(/Alt \+ B wechselt/)).toBeInTheDocument();
  });

  it("der Turmbau ebenso - nach der Wahl der Schwere", () => {
    oeffne("Turmbau");
    fireEvent.click(screen.getByRole("button", { name: /leicht/ }));
    expect(screen.getByLabelText("Deine Antwort")).toBeInTheDocument();
    // Alt + 8 ist weg (Johannes, 18.10.2026, Kürzel einheitlich) - Alt + B bleibt.
      expect(screen.getByText(/Alt \+ B wechselt/)).toBeInTheDocument();
  });
});

describe("★ Das Gitter sagt auch ohne die Stimme von Plus, wo man steht", () => {
  it("zeigt mit aria-activedescendant auf das Feld", () => {
    // Ohne das bleibt der Fokus am Gitter kleben, und eine Sprachausgabe sagt
    // beim Gehen mit den Pfeiltasten gar nichts. Die Stimme von Plus ist
    // voreingestellt aus - sie darf nicht die einzige Auskunft sein.
    oeffne("Paare finden");
    const gitter = screen.getByRole("grid");
    expect(gitter.getAttribute("aria-activedescendant")).toBe("plus-paare-feld-0");
    fireEvent.keyDown(gitter, { key: "ArrowRight" });
    expect(gitter.getAttribute("aria-activedescendant")).toBe("plus-paare-feld-1");
    fireEvent.keyDown(gitter, { key: "ArrowDown" });
    expect(gitter.getAttribute("aria-activedescendant")).toBe("plus-paare-feld-5");
  });

  it("und das Feld, auf das es zeigt, gibt es auch", () => {
    oeffne("Paare finden");
    const id = screen.getByRole("grid").getAttribute("aria-activedescendant")!;
    expect(document.getElementById(id), id).toBeTruthy();
    expect(document.getElementById(id)!.getAttribute("aria-label")).toContain("Zeile 1, Spalte 1");
  });
});
