/**
 * Wächter für die Vorlesefunktion und ihre Einstellung.
 *
 * ★ Die Trennung, an der alles hängt: Was im Dokument steht, liest die
 * Braillezeile. Was die App spricht, kommt aus ihrer eigenen Stimme. Beides
 * sagt nie dasselbe doppelt - die kurze Form wird nie ausgeschrieben, die
 * gesprochene nie angezeigt.
 */
import { eingabezeile } from "../src/lib/plus/zeile";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PlusUebung } from "../src/components/plus/PlusUebung";
import { STIMME_HINWEIS } from "../src/lib/plus/stimme";
import { erzeugeLauf } from "../src/lib/plus/generator";

const ERSTE = erzeugeLauf("1-08", { anzahl: 8, saat: 4 })[0];

describe("Zeile oder Wort", () => {
  it("zeigt normalerweise die kurze Form - sie ist die Schulschreibweise", () => {
    render(<PlusUebung paketId="1-08" onZurueck={() => {}} saat={4} />);
    expect(screen.getByText(ERSTE.angabe)).toBeInTheDocument();
  });

  it("schreibt auf Wunsch aus - für Kinder, die nur zuhören", () => {
    render(<PlusUebung paketId="1-08" onZurueck={() => {}} saat={4} ausschreiben />);
    expect(screen.queryByText(ERSTE.angabe)).toBeNull();
    // Der Aufgabenkasten trägt die Wortform - ohne ein einziges Rechenzeichen.
    const kasten = screen.getByText("zwei plus eins ist");
    expect(kasten.textContent).not.toMatch(/[+*=\d]/);
  });

  it("★ sagt nie beides doppelt", () => {
    // Weder steht die Wortform neben der kurzen, noch umgekehrt.
    const { container } = render(
      <PlusUebung paketId="1-08" onZurueck={() => {}} saat={4} ausschreiben />,
    );
    const text = container.textContent ?? "";
    expect(text).not.toContain(eingabezeile(ERSTE)!.vorlage);
  });

  it("spricht in beiden Einstellungen denselben Satz", () => {
    // Die Stimme hängt nicht an der Anzeige: was gesprochen wird, ist immer
    // die ausformulierte Form.
    const kurz = vi.fn();
    const lang = vi.fn();
    const { unmount } = render(<PlusUebung paketId="1-08" onZurueck={() => {}} saat={4} ansagen={kurz} />);
    unmount();
    render(<PlusUebung paketId="1-08" onZurueck={() => {}} saat={4} ansagen={lang} ausschreiben />);
    expect(lang.mock.calls[0][0]).toBe(kurz.mock.calls[0][0]);
  });
});

describe("Der Hinweis beim Einschalten", () => {
  it("sagt, wofür die Stimme gut ist", () => {
    // Ohne ihn schaltet niemand sie ein - „Ton aus" ist der Normalfall.
    expect(STIMME_HINWEIS).toBe(
      "Deine Sprachausgabe liest Rechenzeichen nicht mit. Die Stimme von Plus schon.",
    );
  });
});
