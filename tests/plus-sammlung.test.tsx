/**
 * Wächter für die Sammlung.
 *
 * Die Fragen: Verrät ein Geheimnis sich vorzeitig? Steht irgendwo nur Farbe,
 * wo ein Wort stehen muss? Und kommt ein Kind an sein Wochenziel heran?
 */
import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PlusSammlung } from "../src/components/plus/PlusSammlung";
import { ABZEICHEN, neuesWochenziel } from "../src/lib/plus/abzeichen";
import { nachAntwort, nachLauf, neuerStand } from "../src/lib/plus/coach";

const geheime = ABZEICHEN.filter((a) => a.geheim);

/** Ein Kind, das ein Paket der ersten Stufe sicher kann. */
function standMitKoennen() {
  let s = neuerStand(100);
  for (let i = 0; i < 6; i++) s = nachAntwort(s, { paketId: "1-08", richtig: true, tag: 100 });
  return nachLauf(nachLauf(s, "1-08", 10, 10, 100), "1-08", 10, 10, 100);
}

function zeige(gefunden: string[] = [], chronik: { tag: number; text: string }[] = []) {
  const onWochenziel = vi.fn();
  render(
    <PlusSammlung
      stand={standMitKoennen()}
      stufe={1}
      gefunden={gefunden}
      wochenziel={{ ...neuesWochenziel(50), geschafft: 12 }}
      chronik={chronik}
      onWochenziel={onWochenziel}
      onZurueck={() => {}}
    />,
  );
  return { onWochenziel };
}

describe("Die Geheimnisse", () => {
  it("★ verraten nichts, solange sie nicht gefunden sind", () => {
    zeige([]);
    for (const a of geheime) {
      expect(screen.queryByText(new RegExp(a.name)), a.id).toBeNull();
      expect(screen.queryByText(new RegExp(a.bedingung.slice(0, 20))), a.id).toBeNull();
    }
    expect(screen.getAllByText(/Ein Geheimnis - noch nicht gefunden/)).toHaveLength(geheime.length);
  });

  it("zeigen sich, sobald sie gefunden sind", () => {
    zeige([geheime[0].id]);
    expect(screen.getByText(new RegExp(geheime[0].name))).toBeInTheDocument();
    expect(screen.getAllByText(/Ein Geheimnis/)).toHaveLength(geheime.length - 1);
  });
});

describe("Gefunden oder offen steht als Wort da", () => {
  it("★ nie nur als Farbe - ein Kind mit Braillezeile liest keine Farbe", () => {
    zeige(["plus-nilpferd"]);
    const kamel = screen.getByText(/Nilpferd/).closest("li")!;
    expect(within(kamel).getByText("Gefunden.")).toBeInTheDocument();
    const wal = screen.getByText(/Wal/).closest("li")!;
    expect(within(wal).getByText("Noch offen.")).toBeInTheDocument();
  });

  it("versteckt das Bild vor der Sprachausgabe - der Name sagt es schon", () => {
    const { container } = render(
      <PlusSammlung stand={standMitKoennen()} stufe={1} gefunden={["plus-nilpferd"]}
        wochenziel={neuesWochenziel(50)} chronik={[]}
        onWochenziel={() => {}} onZurueck={() => {}} />,
    );
    for (const bild of container.querySelectorAll("img")) {
      expect(bild.getAttribute("aria-hidden")).toBe("true");
      expect(bild.getAttribute("alt")).toBe("");
    }
  });

  it("zählt, wie viele es insgesamt gibt", () => {
    zeige(["plus-nilpferd", "plus-lupe"]);
    expect(screen.getByText(`Meine Abzeichen: 2 von ${ABZEICHEN.length}`)).toBeInTheDocument();
  });
});

describe("Das Wochenziel", () => {
  it("lässt sich jederzeit ändern", () => {
    const { onWochenziel } = zeige();
    fireEvent.click(screen.getByRole("button", { name: /^200 Aufgaben/ }));
    expect(onWochenziel).toHaveBeenCalledWith(200);
  });

  it("sagt, welches gewählt ist - als Wort und als Zustand", () => {
    zeige();
    const gewaehlt = screen.getByRole("button", { name: /50 Aufgaben \(gewählt\)/ });
    expect(gewaehlt).toHaveAttribute("aria-pressed", "true");
  });

  it("zeigt den Stand der Woche", () => {
    zeige();
    expect(screen.getByText("Diese Woche: 12 von 50 Aufgaben.")).toBeInTheDocument();
  });
});

describe("Die Chronik", () => {
  it("★ hält fest, was eine Blitzmeldung verschluckt hätte", () => {
    // Live-Meldungen kommen auf der Braillezeile unzuverlässig an und
    // verdrängen, was unter den Fingern liegt.
    zeige(["plus-nilpferd"], [{ tag: 1, text: "Neues Abzeichen: Nilpferd." }]);
    expect(screen.getByText("Neues Abzeichen: Nilpferd.")).toBeInTheDocument();
  });

  it("bleibt weg, solange es nichts zu melden gab", () => {
    zeige([]);
    expect(screen.queryByText(/Was Plus dir gemeldet hat/)).toBeNull();
  });
});

describe("★ Genau eine Live-Region", () => {
  it("Plus bringt nie zwei Blitzmeldungen gleichzeitig mit", async () => {
    // Eine Live-Region verdrängt auf der Braillezeile etwa vier Sekunden lang,
    // was unter den Fingern liegt. Zwei verdrängen sie zweimal. Gemessen am
    // 23.09.2026: die Seite hatte drei.
    const { PlusUebung } = await import("../src/components/plus/PlusUebung");
    const { container } = render(
      <PlusUebung paketId="1-08" onZurueck={() => {}} saat={4} zusatzmeldung="Neues Abzeichen: Nilpferd." />,
    );
    expect(container.querySelectorAll('[role="status"], [aria-live]')).toHaveLength(1);
  });

  it("schickt die Abzeichen-Meldung durch dieselbe Region wie die Rückmeldung", async () => {
    const { PlusUebung } = await import("../src/components/plus/PlusUebung");
    render(<PlusUebung paketId="1-08" onZurueck={() => {}} saat={4} zusatzmeldung="Neues Abzeichen: Nilpferd." />);
    expect(screen.getByRole("status")).toHaveTextContent("Neues Abzeichen: Nilpferd.");
  });

  it("die Sammlung selbst meldet gar nichts - sie ist zum Lesen da", () => {
    const { container } = render(
      <PlusSammlung stand={standMitKoennen()} stufe={1} gefunden={["plus-nilpferd"]}
        wochenziel={neuesWochenziel(50)} chronik={[]}
        onWochenziel={() => {}} onZurueck={() => {}} />,
    );
    expect(container.querySelectorAll('[role="status"], [aria-live]')).toHaveLength(0);
  });
});

describe("Was ich schon kann", () => {
  it("★ sagt den Stand in Worten - nie als Note und nie als Prozentwert", () => {
    zeige();
    expect(screen.getByText(/Kann ich/)).toBeInTheDocument();
    const text = document.body.innerText ?? "";
    expect(text).not.toMatch(/\d+\s?%/);
    expect(text).not.toMatch(/Note|Punkte|Prozent/);
  });

  it("zählt die Stufe zusammen, ohne zu werten", () => {
    zeige();
    expect(screen.getByText(/Schulstufe: \d+ kann ich, \d+ fast, \d+ noch nicht dran\./))
      .toBeInTheDocument();
  });

  it("lässt die Stufe wechseln", () => {
    zeige();
    const wahl = screen.getByLabelText("Schulstufe") as HTMLSelectElement;
    fireEvent.change(wahl, { target: { value: "5" } });
    expect(screen.getByText(/^5\. Schulstufe: /)).toBeInTheDocument();
  });
});

describe("★ Die Abzeichen-Bilder folgen dem Kontrastmodus", () => {
  it("nimmt im Kontrastmodus die Strichzeichnung", async () => {
    // Farbige Motive malen sich in ihrer eigenen Farbe und ignorieren jede
    // Kontrasteinstellung - derselbe Fehler, den die Kopfzeile mit ihren
    // Emoji hatte (gemessen 30.08.2026: Gelb auf Blau 2,05:1).
    const { useContrast } = await import("../src/lib/contrast");
    useContrast.setState({ mode: "gb" });
    const { container } = render(
      <PlusSammlung stand={standMitKoennen()} stufe={1} gefunden={["plus-nilpferd"]}
        wochenziel={neuesWochenziel(50)} chronik={[]} onWochenziel={() => {}} onZurueck={() => {}} />,
    );
    const bild = container.querySelector("img")!;
    expect(bild.getAttribute("src")).toContain("/kontrast/");
    useContrast.setState({ mode: "hell" });
  });

  it("nimmt sonst das farbige Bild", () => {
    const { container } = render(
      <PlusSammlung stand={standMitKoennen()} stufe={1} gefunden={["plus-nilpferd"]}
        wochenziel={neuesWochenziel(50)} chronik={[]} onWochenziel={() => {}} onZurueck={() => {}} />,
    );
    expect(container.querySelector("img")!.getAttribute("src")).toContain("/color/");
  });
});
