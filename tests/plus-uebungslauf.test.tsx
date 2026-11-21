/**
 * Wächter für den Übungslauf und die Auswahl.
 *
 * Geprüft wird, was ein Kind erlebt: die Aufgabe steht da, die Antwort kommt
 * an, der Lauf geht weiter - und niemand wird gehetzt.
 */
import { eingabezeile, eingabezeileBraille } from "../src/lib/plus/zeile";
import { uebersetze } from "../src/components/plus/PlusEingabe";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PlusUebung } from "../src/components/plus/PlusUebung";
import { PlusWahl } from "../src/components/plus/PlusWahl";
import { erzeugeLauf } from "../src/lib/plus/generator";
import { paketeDerStufe } from "../src/lib/plus/stoffplan";

/** Denselben Lauf wie die Oberfläche - die Saat macht ihn wiederholbar. */
const lauf = (paketId: string) => erzeugeLauf(paketId, { anzahl: 8, saat: 4 });

describe("Der Übungslauf", () => {
  it("zeigt die erste Aufgabe und zählt mit", () => {
    render(<PlusUebung paketId="1-08" onZurueck={() => {}} saat={4} />);
    expect(screen.getByText("Aufgabe 1 von 8")).toBeInTheDocument();
    // Johannes, 19.10.2026: ohne Braillezeile steht die Rechnung oben.
    expect(screen.getByText(lauf("1-08")[0].angabe)).toBeInTheDocument();
  });

  it("sagt die Aufgabe im ganzen Satz an - nicht die Zeichen", () => {
    // Die Zeile heisst `1 +3 =`, gesagt wird „eins plus drei ist".
    const ansagen = vi.fn();
    render(<PlusUebung paketId="1-08" onZurueck={() => {}} saat={4} ansagen={ansagen} />);
    const satz = ansagen.mock.calls[0][0] as string;
    expect(satz).not.toMatch(/[+*=\d]/);
    expect(satz.length).toBeGreaterThan(0);
  });

  it("nimmt die richtige Antwort an und geht sofort weiter", () => {
    const aufgaben = lauf("1-08");
    render(<PlusUebung paketId="1-08" onZurueck={() => {}} saat={4} />);
    fireEvent.change(screen.getByLabelText("Deine Antwort"), { target: { value: aufgaben[0].loesung } });
    fireEvent.click(screen.getByRole("button", { name: "Prüfen" }));
    // ★ Johannes, 12.10.2026: Eingabetaste prüft UND bringt die nächste Rechnung.
    // Kein Zeitdruck bleibt: es gibt keine Uhr, nur die eigene Eingabetaste.
    expect(screen.getByRole("status")).toHaveTextContent("Richtig.");
    expect(screen.getByText("Aufgabe 2 von 8")).toBeInTheDocument();
  });

  it("★★ das Feld zeigt richtig und falsch verschieden - und beides nur, solange es zutrifft", () => {
    const aufgaben = lauf("1-08");
    render(<PlusUebung paketId="1-08" onZurueck={() => {}} saat={4} />);
    const feld = screen.getByLabelText("Deine Antwort") as HTMLTextAreaElement;
    expect(feld.dataset.ton).toBe("offen");
    // Falsch: gestrichelter Rand, das Zeichen „noch einmal“ - kein Rot, kein Kreuz.
    fireEvent.change(feld, { target: { value: "99999" } });
    fireEvent.click(screen.getByRole("button", { name: "Prüfen" }));
    expect(feld.dataset.ton).toBe("falsch");
    expect(feld.className).toContain("border-dashed");
    // Ändert das Kind etwas, ist es wieder ein gewöhnliches Feld.
    fireEvent.change(feld, { target: { value: aufgaben[0].loesung } });
    expect(feld.dataset.ton).toBe("offen");
    // Richtig: ein weicher Ring und das Häkchen (die Aufgabe danach steht schon da).
    fireEvent.click(screen.getByRole("button", { name: "Prüfen" }));
    expect(feld.dataset.ton).toBe("richtig");
    expect(feld.className).toContain("plus-fx-richtig");
    expect(feld.className).not.toContain("border-dashed");
  });

  it("wertet falsch als falsch, ohne das Kind zu bewerten", () => {
    render(<PlusUebung paketId="1-08" onZurueck={() => {}} saat={4} />);
    fireEvent.change(screen.getByLabelText("Deine Antwort"), { target: { value: "99999" } });
    fireEvent.click(screen.getByRole("button", { name: "Prüfen" }));
    const meldung = screen.getByRole("status").textContent ?? "";
    expect(meldung).toContain("Noch nicht");
    expect(meldung).not.toMatch(/falsch|leider|Fehler/i);
  });

  it("merkt, wenn noch nichts dasteht", () => {
    const ansagen = vi.fn();
    render(<PlusUebung paketId="1-08" onZurueck={() => {}} saat={4} ansagen={ansagen} />);
    fireEvent.click(screen.getByRole("button", { name: "Prüfen" }));
    expect(ansagen).toHaveBeenCalledWith("Da steht noch nichts.");
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
  });

  it("zählt am Ende, wie viele richtig waren", () => {
    const aufgaben = lauf("1-08");
    render(<PlusUebung paketId="1-08" onZurueck={() => {}} saat={4} />);
    for (let i = 0; i < 8; i++) {
      fireEvent.change(screen.getByLabelText("Deine Antwort"), { target: { value: aufgaben[i].loesung } });
      fireEvent.click(screen.getByRole("button", { name: "Prüfen" }));
    }
    expect(screen.getByText("Geschafft")).toBeInTheDocument();
    expect(screen.getByText("8 von 8 richtig.")).toBeInTheDocument();
  });

  it("hängt kein aria-label an den Rechenausdruck", () => {
    // Mit einem Label läse der Screenreader den Ausdruck am Stück - das
    // Wort-für-Wort-Lesen auf der Braillezeile fiele weg.
    const { container } = render(<PlusUebung paketId="1-08" onZurueck={() => {}} saat={4} />);
    for (const el of container.querySelectorAll(".font-mono")) {
      expect(el.getAttribute("aria-label")).toBeNull();
    }
  });
});

describe("Die Auswahl", () => {
  it("fragt zuerst nach der Schulstufe - acht Schalter statt 161", () => {
    render(<PlusWahl stufe={null} onStufe={() => {}} onPaket={() => {}} />);
    expect(screen.getAllByRole("button")).toHaveLength(8);
  });

  it("zeigt in der Stufe nur, was wirklich spielbar ist", () => {
    const onPaket = vi.fn();
    render(<PlusWahl stufe={1} onStufe={() => {}} onPaket={onPaket} />);
    fireEvent.click(screen.getByRole("button", { name: "Tauschaufgabe" }));
    expect(onPaket).toHaveBeenCalledWith("1-10");
  });

  it("schweigt, solange nichts fehlt - seit 23.09.2026 ist das überall so", () => {
    render(<PlusWahl stufe={1} onStufe={() => {}} onPaket={() => {}} />);
    expect(screen.queryByText(/noch\s+nicht fertig/)).toBeNull();
  });

  it("sagt im Klartext, wie viele Übungen fehlen, sobald wieder eine fehlt", () => {
    // Die Zeile bleibt geprüft, auch wenn sie gerade nirgends erscheint: das
    // nächste neue Paket ist wieder eines, das noch nicht fertig ist.
    const alle = paketeDerStufe(1).map((p) => p.id);
    render(
      <PlusWahl stufe={1} onStufe={() => {}} onPaket={() => {}} bedienbar={alle.slice(0, -2)} />,
    );
    expect(screen.getByText(/2 Übungen dieser Stufe sind noch nicht fertig/)).toBeInTheDocument();
  });

  it("macht nichts unbenutzbar - kein Schalter ist abgeschaltet", () => {
    // `disabled` nimmt einen Schalter der Tastatur ganz weg. In Plus gibt es
    // keinen einzigen.
    const { container } = render(<PlusWahl stufe={3} onStufe={() => {}} onPaket={() => {}} />);
    expect(container.querySelectorAll("[disabled]")).toHaveLength(0);
  });
});

describe("Der Hinweis bei einem Denkfehler", () => {
  it("★ schweigt, solange sich nichts gezeigt hat - das ist der Normalfall", () => {
    render(<PlusUebung paketId="1-08" onZurueck={() => {}} saat={4} />);
    fireEvent.change(screen.getByLabelText("Deine Antwort"), { target: { value: "99999" } });
    fireEvent.click(screen.getByRole("button", { name: "Prüfen" }));
    expect(screen.getByRole("status")).toHaveTextContent("Noch nicht. Schau es dir noch einmal an.");
  });

  it("sagt einen kurzen Satz, wenn der Coach einen mitgibt", () => {
    render(
      <PlusUebung
        paketId="1-08"
        onZurueck={() => {}}
        saat={4}
        hinweisZu={() => "Denk an den Übertrag."}
      />,
    );
    fireEvent.change(screen.getByLabelText("Deine Antwort"), { target: { value: "99999" } });
    fireEvent.click(screen.getByRole("button", { name: "Prüfen" }));
    expect(screen.getByRole("status")).toHaveTextContent("Noch nicht. Denk an den Übertrag.");
    // Und er verschwindet mit der nächsten Aufgabe - er klebt nicht am Kind.
    fireEvent.change(screen.getByLabelText("Deine Antwort"), { target: { value: lauf("1-08")[0].loesung } });
    fireEvent.click(screen.getByRole("button", { name: "Prüfen" }));
    expect(screen.getByRole("status")).not.toHaveTextContent("Übertrag");
  });

  it("reicht die ganze Aufgabe weiter - die Fehlererkennung braucht sie", () => {
    const onAntwort = vi.fn();
    render(<PlusUebung paketId="1-08" onZurueck={() => {}} saat={4} onAntwort={onAntwort} />);
    fireEvent.change(screen.getByLabelText("Deine Antwort"), { target: { value: "42" } });
    fireEvent.click(screen.getByRole("button", { name: "Prüfen" }));
    expect(onAntwort).toHaveBeenCalledWith(expect.objectContaining({
      paketId: "1-08", richtig: false, eingabe: "42", eingabeart: "normal",
      aufgabe: expect.objectContaining({ angabe: lauf("1-08")[0].angabe }),
    }));
  });
});

describe("Der Rechenweg in Zeilen", () => {
  /** Ein Paket, dessen Leitform das schriftliche Rechnen in Zeilen ist. */
  const SCHRIFTLICH = "3-10";

  it("★ zeigt sich nie von selbst", () => {
    // „Schritt für Schritt, auf Tastendruck, nie automatisch." Wer ihn
    // einblendet, nimmt dem Kind das Rechnen ab.
    render(<PlusUebung paketId={SCHRIFTLICH} onZurueck={() => {}} saat={4} />);
    expect(screen.queryByText(/Ich addiere die Einer/)).toBeNull();
    expect(screen.getByRole("button", { name: "Zeig mir den Rechenweg" })).toBeInTheDocument();
  });

  it("deckt einen Schritt nach dem anderen auf", () => {
    render(<PlusUebung paketId={SCHRIFTLICH} onZurueck={() => {}} saat={4} />);
    fireEvent.click(screen.getByRole("button", { name: "Zeig mir den Rechenweg" }));
    expect(screen.getByText(/Ich addiere die Einer/)).toBeInTheDocument();
    expect(screen.queryByText(/Ich addiere die Zehner/)).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Noch ein Schritt" }));
    expect(screen.getByText(/Ich addiere die Zehner/)).toBeInTheDocument();
  });

  it("sagt jeden Schritt an - der Weg ist zum Hören da", () => {
    const ansagen = vi.fn();
    render(<PlusUebung paketId={SCHRIFTLICH} onZurueck={() => {}} saat={4} ansagen={ansagen} />);
    fireEvent.click(screen.getByRole("button", { name: "Zeig mir den Rechenweg" }));
    expect(ansagen).toHaveBeenCalledWith(expect.stringContaining("Ich addiere die Einer"));
  });

  it("★ bietet den Übertrag als Merkhilfe an - er wird nicht notiert", () => {
    render(<PlusUebung paketId={SCHRIFTLICH} onZurueck={() => {}} saat={4} />);
    const lauf = erzeugeLauf(SCHRIFTLICH, { anzahl: 8, saat: 4 });
    const mitMerke = (lauf[0].weg ?? []).some((s) => s.merke > 0);
    fireEvent.click(screen.getByRole("button", { name: "Zeig mir den Rechenweg" }));
    if (mitMerke) expect(screen.getByText(/Merke:/)).toBeInTheDocument();
  });

  it("fängt bei der nächsten Aufgabe wieder von vorn an", () => {
    const aufgaben = erzeugeLauf(SCHRIFTLICH, { anzahl: 8, saat: 4 });
    render(<PlusUebung paketId={SCHRIFTLICH} onZurueck={() => {}} saat={4} />);
    fireEvent.click(screen.getByRole("button", { name: "Zeig mir den Rechenweg" }));
    fireEvent.change(screen.getByLabelText("Deine Antwort"), { target: { value: aufgaben[0].loesung } });
    fireEvent.click(screen.getByRole("button", { name: "Prüfen" }));
    // Der aufgedeckte Schritt ist weg. Ob die nächste Aufgabe überhaupt einen
    // Weg hat, entscheidet ihre Form - der Lauf mischt sie.
    expect(screen.queryByText(/Ich addiere die Einer/)).toBeNull();
  });

  it("★ nach dem letzten Schritt fällt der Fokus nicht ins Leere", () => {
    // Gemessen am 23.09.2026 im Browser (Paket 4-09): der Knopf „Noch ein
    // Schritt" verschwindet mit dem letzten Schritt - und der Fokus stand auf
    // `body`. Jetzt geht er ins Antwortfeld: dort wird weitergerechnet.
    const aufgaben = erzeugeLauf(SCHRIFTLICH, { anzahl: 8, saat: 4 });
    render(<PlusUebung paketId={SCHRIFTLICH} onZurueck={() => {}} saat={4} />);
    const schritte = aufgaben[0].weg?.length ?? 0;
    expect(schritte).toBeGreaterThan(1);
    const knopf = screen.getByRole("button", { name: "Zeig mir den Rechenweg" });
    knopf.focus();
    fireEvent.click(knopf);
    for (let i = 1; i < schritte; i++) {
      const weiterKnopf = screen.getByRole("button", { name: "Noch ein Schritt" });
      weiterKnopf.focus();
      fireEvent.click(weiterKnopf);
    }
    expect(screen.queryByRole("button", { name: "Noch ein Schritt" })).toBeNull();
    expect(document.activeElement).toBe(screen.getByLabelText("Deine Antwort"));
  });

  it("zeigt keinen Knopf, wo es keinen Weg gibt", () => {
    render(<PlusUebung paketId="1-08" onZurueck={() => {}} saat={4} />);
    expect(screen.queryByRole("button", { name: /Rechenweg/ })).toBeNull();
  });
});

describe("★ Der Coach-Lauf wiederholt nicht dieselbe Frage", () => {
  it("stellt nie zweimal hintereinander dieselbe Gestalt", async () => {
    // Gemessen am 23.09.2026: am ersten Tag kamen viermal „Welche Zahl kommt
    // vor …?" hintereinander - genau die Eintönigkeit der Excel-Mappe.
    const { erzeugeFolge, gestalt } = await import("../src/lib/plus/generator");
    const { zufall } = await import("../src/lib/plus/aufgabe");
    const plan = Array.from({ length: 12 }, () => "1-01");
    const aufgaben = erzeugeFolge(plan, zufall(2026));
    expect(aufgaben.length).toBeGreaterThan(8);
    for (let i = 1; i < aufgaben.length; i++) {
      expect(gestalt(aufgaben[i].angabe), `Stelle ${i}`).not.toBe(gestalt(aufgaben[i - 1].angabe));
    }
  });

  it("sieht durch die Zahlen hindurch", async () => {
    const { gestalt } = await import("../src/lib/plus/generator");
    expect(gestalt("Welche Zahl kommt vor 13?")).toBe(gestalt("Welche Zahl kommt vor 5?"));
    expect(gestalt("48 +27 =")).not.toBe(gestalt("48 -27 ="));
  });
});

describe("★ Gezählt wird der erste Versuch", () => {
  it("wer noch einmal nachdenkt, zählt nicht zweimal", () => {
    // Sonst stuft der Coach ein Kind fünfmal für dieselbe Aufgabe herunter,
    // und das Wochenziel zählt eine Aufgabe mehrfach.
    const onAntwort = vi.fn();
    render(<PlusUebung paketId="1-08" onZurueck={() => {}} saat={4} onAntwort={onAntwort} />);
    const feld = screen.getByLabelText("Deine Antwort");
    for (const versuch of ["11", "12", "13"]) {
      fireEvent.change(feld, { target: { value: versuch } });
      fireEvent.click(screen.getByRole("button", { name: "Prüfen" }));
    }
    expect(onAntwort).toHaveBeenCalledTimes(1);
    expect(onAntwort.mock.calls[0][0].eingabe).toBe("11");
  });

  it("die nächste Aufgabe zählt wieder", () => {
    const aufgaben = lauf("1-08");
    const onAntwort = vi.fn();
    render(<PlusUebung paketId="1-08" onZurueck={() => {}} saat={4} onAntwort={onAntwort} />);
    const feld = screen.getByLabelText("Deine Antwort");
    fireEvent.change(feld, { target: { value: aufgaben[0].loesung } });
    fireEvent.click(screen.getByRole("button", { name: "Prüfen" }));
    fireEvent.change(screen.getByLabelText("Deine Antwort"), { target: { value: "99" } });
    fireEvent.click(screen.getByRole("button", { name: "Prüfen" }));
    expect(onAntwort).toHaveBeenCalledTimes(2);
  });

  it("die Rückmeldung kommt trotzdem bei jedem Versuch", () => {
    render(<PlusUebung paketId="1-08" onZurueck={() => {}} saat={4} />);
    const feld = screen.getByLabelText("Deine Antwort");
    fireEvent.change(feld, { target: { value: "11" } });
    fireEvent.click(screen.getByRole("button", { name: "Prüfen" }));
    expect(screen.getByRole("status")).toHaveTextContent("Noch nicht");
    fireEvent.change(feld, { target: { value: lauf("1-08")[0].loesung } });
    fireEvent.click(screen.getByRole("button", { name: "Prüfen" }));
    expect(screen.getByRole("status")).toHaveTextContent("Richtig.");
  });
});

describe("★ Niemand sitzt fest", () => {
  it("nach zwei Fehlversuchen gibt es einen Ausweg", () => {
    // Vorher konnte ein Kind, das eine Aufgabe nicht lösen kann, nur die
    // ganze Übung abbrechen.
    render(<PlusUebung paketId="1-08" onZurueck={() => {}} saat={4} />);
    const feld = screen.getByLabelText("Deine Antwort");
    fireEvent.change(feld, { target: { value: "111" } });
    fireEvent.click(screen.getByRole("button", { name: "Prüfen" }));
    expect(screen.queryByRole("button", { name: "Ich komme nicht weiter" })).toBeNull();
    fireEvent.change(feld, { target: { value: "222" } });
    fireEvent.click(screen.getByRole("button", { name: "Prüfen" }));
    expect(screen.getByRole("button", { name: "Ich komme nicht weiter" })).toBeInTheDocument();
  });

  it("der Ausweg zeigt die Lösung und führt weiter", () => {
    const aufgaben = lauf("1-08");
    render(<PlusUebung paketId="1-08" onZurueck={() => {}} saat={4} />);
    const feld = screen.getByLabelText("Deine Antwort");
    for (const falsch of ["111", "222"]) {
      fireEvent.change(feld, { target: { value: falsch } });
      fireEvent.click(screen.getByRole("button", { name: "Prüfen" }));
    }
    fireEvent.click(screen.getByRole("button", { name: "Ich komme nicht weiter" }));
    expect(screen.getByRole("status")).toHaveTextContent(`Die Lösung ist ${aufgaben[0].loesung}.`);
    fireEvent.click(screen.getByRole("button", { name: "Weiter" }));
    expect(screen.getByText("Aufgabe 2 von 8")).toBeInTheDocument();
  });

  it("★ zählt den Ausweg nicht als weitere Antwort", () => {
    const onAntwort = vi.fn();
    render(<PlusUebung paketId="1-08" onZurueck={() => {}} saat={4} onAntwort={onAntwort} />);
    const feld = screen.getByLabelText("Deine Antwort");
    for (const falsch of ["111", "222"]) {
      fireEvent.change(feld, { target: { value: falsch } });
      fireEvent.click(screen.getByRole("button", { name: "Prüfen" }));
    }
    fireEvent.click(screen.getByRole("button", { name: "Ich komme nicht weiter" }));
    expect(onAntwort).toHaveBeenCalledTimes(1);
  });
});

describe("★ Das Abzeichen kommt am Ende an", () => {
  it("die Abschluss-Seite trägt die Meldung", () => {
    const aufgaben = lauf("1-08");
    render(
      <PlusUebung paketId="1-08" onZurueck={() => {}} saat={4}
        zusatzmeldung="Neues Abzeichen: Nilpferd." />,
    );
    for (let i = 0; i < 8; i++) {
      fireEvent.change(screen.getByLabelText("Deine Antwort"), { target: { value: aufgaben[i].loesung } });
      fireEvent.click(screen.getByRole("button", { name: "Prüfen" }));
    }
    expect(screen.getByText("Geschafft")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Neues Abzeichen: Nilpferd.");
  });

  it("und es bleibt bei genau einer Live-Region", () => {
    const { container } = render(
      <PlusUebung paketId="1-08" onZurueck={() => {}} saat={4} zusatzmeldung="Neues Abzeichen: Nilpferd." />,
    );
    expect(container.querySelectorAll('[role="status"], [aria-live]')).toHaveLength(1);
  });
});

describe("★ Wer im Feld landet, weiß, was zu rechnen ist", () => {
  it("die Rechnung steht im Feld - einmal, nicht noch einmal darüber", () => {
    // Johannes, 25.09.2026: „Rechnungen, bei denen etwas auszufüllen ist,
    // sollen gleich in der Eingabezeile stehen." Eine einzeilige Aufgabe
    // braucht darum keinen Kasten mehr - die Braillezeile läse sie doppelt.
    render(<PlusUebung paketId="1-08" onZurueck={() => {}} saat={4} art="computer" />);
    const feld = screen.getByLabelText("Deine Antwort") as HTMLTextAreaElement;
    expect(feld.tagName).toBe("TEXTAREA");
    expect(uebersetze(feld.value, "computer").text).toBe(eingabezeile(lauf("1-08")[0])!.vorlage);
    expect(document.getElementById("plus-aufgabe")).toBeNull();
    expect(feld.getAttribute("aria-label")).toBeNull();
  });

  it("★ mit Braillezeile stehen auch die Zeilen darüber IM Feld (Niko Adam 10.11., Johannes 11.11.)", () => {
    // Vorher blieb die Musterzeile über dem Feld stehen: der Cursor sprang ins Feld,
    // und auf der Braillezeile kam das Kind nicht zur Angabe. Jetzt steht alles im Feld,
    // Zeile für Zeile durch ` / ` getrennt; gerechnet wird mit der letzten Zeile.
    const saat = [...Array(60).keys()].find((s) => erzeugeLauf("1-10", { anzahl: 8, saat: s })[0].angabe.includes("\n"))!;
    const erste = erzeugeLauf("1-10", { anzahl: 8, saat })[0];
    render(<PlusUebung paketId="1-10" onZurueck={() => {}} saat={saat} art="computer" />);
    const feld = screen.getByLabelText("Deine Antwort") as HTMLTextAreaElement;
    expect(document.getElementById("plus-aufgabe")).toBeNull();
    const imFeld = uebersetze(feld.value, "computer").text.replace(/\n/g, " ");
    const [muster, rechnung] = erste.angabe.split("\n");
    expect(imFeld).toContain(muster);
    expect(imFeld).toContain(rechnung);
    expect(imFeld).toBe(eingabezeileBraille(erste)!.vorlage);
    expect(feld.getAttribute("aria-label")).toBeNull();
  });
});
