/**
 * WÄCHTER über den Kasten „Eigene Übung" (Braille) im Reiter „Punktgenau" von
 * „Meine Klassen" (22.09.2026, Zubau Lehrkraft-Bedienung).
 *
 * Geprüft wird die BEDIENUNG - nicht die reine Rechnung (die steht schon in
 * `tests/braille-eigene-uebung.test.ts`):
 *  · Datei hochladen (.txt) → Vorschau → „Eigene Übung starten" ruft
 *    `backend.starteEigeneUebung` mit Arbeitsweise, Bereich und den Zeilen der
 *    Datei auf.
 *  · ★★★★★ Eine .txt vom Windows-Editor („ANSI", Windows-1252) behält ihre
 *    Umlaute (23.09.2026, `dekodiereTextdatei` - geteilt mit Tastenflow).
 *  · ★★★ Die Zeichen-Prüfung (Schritt 3 des Auftrags): Ein Text mit Zeichen,
 *    die ein Kind im gewählten Bereich noch nie gesehen hat, wird VOR dem
 *    Start angezeigt - der Start bleibt trotzdem möglich (nicht `disabled`).
 *  · „Beenden" nimmt eine Übung nach Rückfrage (`Modal`) aus der Reihe.
 */
import { oeffneLeiste } from "./klassenleiste-helfer";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PunktgenauReiter } from "@/components/lernwerkstatt/klasse/PunktgenauReiter";
import { brailleBackend, _resetBrailleBackend } from "@/lib/braille/backend";
import type { BrailleAccount } from "@/lib/braille";

const CODE = "3B-EU";

async function klasseMitKind() {
  const be = brailleBackend();
  const t = await be.registerTeacher("Frau Berger", "berger-eigene-uebung@schule.at", "geheim1");
  if (!t.ok) throw new Error(t.error);
  const c = await be.createClass(t.value.id, "3b", CODE);
  if (!c.ok) throw new Error(c.error);
  const p = await be.addPupil(CODE, "Mara", "1234");
  if (!p.ok) throw new Error(p.error);
  return { be, teacherId: t.value.id, kind: p.value as BrailleAccount };
}

function txtDatei(name: string, inhalt: string): File {
  return new File([inhalt], name, { type: "text/plain" });
}

function nutzer() {
  return userEvent.setup({ delay: null });
}

beforeEach(() => {
  localStorage.clear();
  _resetBrailleBackend();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  localStorage.clear();
  _resetBrailleBackend();
});

describe("Ohne Zuweisung", () => {
  it("zeigt 'nicht zugewiesen'", async () => {
    const { teacherId, kind } = await klasseMitKind();
    render(<PunktgenauReiter classCode={CODE} teacherId={teacherId} pupils={[kind]} />);
    oeffneLeiste("Eigene Übung");
    await act(async () => {});
    expect(screen.getByText(/nicht zugewiesen/)).toBeInTheDocument();
  });
});

describe("Datei hochladen und starten", () => {
  it("★★★ weist der Klasse die hochgeladene Datei mit Arbeitsweise und Bereich zu", async () => {
    const { teacherId, kind } = await klasseMitKind();
    const user = nutzer();
    render(<PunktgenauReiter classCode={CODE} teacherId={teacherId} pupils={[kind]} />);
    oeffneLeiste("Eigene Übung");
    await act(async () => {});

    await user.selectOptions(screen.getByLabelText("Arbeitsweise - Eigene Übung: schreiben oder lesen"), "lesen");
    await user.selectOptions(screen.getByLabelText("Schriftbereich - Eigene Übung"), "voll");

    const input = screen.getByLabelText(/Eigene Datei hochladen/) as HTMLInputElement;
    await user.upload(input, txtDatei("winter.txt", "Der Schnee fällt leise."));

    await waitFor(() => expect(screen.getByText(/winter\.txt/)).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: "Eigene Übung starten" }));

    await waitFor(() =>
      expect(screen.getByText(/Gestartet - die Kinder bekommen sie jetzt\./)).toBeInTheDocument(),
    );
    const reihe = await brailleBackend().listeEigeneUebungen(CODE);
    expect(reihe).toHaveLength(1);
    expect(reihe[0]).toMatchObject({ dateiname: "winter.txt", arbeitsweise: "lesen", bereich: "voll" });

    // Zugeklappt nennt die Kopfzeile den Stand.
    expect(screen.getByText(/zugewiesen: winter\.txt/)).toBeInTheDocument();
  });

  it("lehnt eine Datei mit falscher Endung ab, ohne etwas zu speichern", async () => {
    const { teacherId, kind } = await klasseMitKind();
    const user = nutzer();
    render(<PunktgenauReiter classCode={CODE} teacherId={teacherId} pupils={[kind]} />);
    oeffneLeiste("Eigene Übung");
    await act(async () => {});

    const input = screen.getByLabelText(/Eigene Datei hochladen/) as HTMLInputElement;
    const pdf = new File(["x"], "text.pdf", { type: "application/pdf" });
    Object.defineProperty(input, "files", { value: [pdf] });
    await user.click(input); // fokussieren reicht nicht - `fireEvent` löst `change` selbst aus
    const { fireEvent } = await import("@testing-library/react");
    fireEvent.change(input);

    await waitFor(() =>
      expect(screen.getByText(/Nur \.txt- und \.docx-Dateien werden angenommen\./)).toBeInTheDocument(),
    );
    const reihe = await brailleBackend().listeEigeneUebungen(CODE);
    expect(reihe).toHaveLength(0);
  });

  it("★★★★★ 23.09.: eine .txt vom Windows-Editor (ANSI) kommt MIT Umlauten und ß an", async () => {
    // Ein Byte je Zeichen, wie Windows-1252 es speichert (Ä = 0xC4, ü = 0xFC,
    // ß = 0xDF). Bis 23.09. las der Kasten jede .txt als UTF-8 - daraus wurde
    // „�", bei Tastenflow stand am Server „berlegen Sie grundstzlich".
    const text = "Ärger über Öl\r\nÜbung für Mäuse, süß und groß";
    const ansi = Uint8Array.from([...text].map((z) => z.charCodeAt(0)));
    expect(ansi.length).toBe(text.length); // wirklich ein Byte je Zeichen

    const { teacherId, kind } = await klasseMitKind();
    const user = nutzer();
    render(<PunktgenauReiter classCode={CODE} teacherId={teacherId} pupils={[kind]} />);
    oeffneLeiste("Eigene Übung");
    await act(async () => {});

    const input = screen.getByLabelText(/Eigene Datei hochladen/) as HTMLInputElement;
    await user.upload(input, new File([ansi], "Konzentration.txt", { type: "text/plain" }));
    await waitFor(() => expect(screen.getByText(/Konzentration\.txt/)).toBeInTheDocument());
    // Kein Ersatzzeichen - weder in der Vorschau noch in der Zeichen-Prüfung
    // (dort stand bis 23.09. „…noch nicht gesehen hat: �, r, g, …").
    expect((document.body.textContent ?? "").match(/.{0,40}�.{0,10}/g)).toBeNull();

    await user.click(screen.getByRole("button", { name: "Eigene Übung starten" }));
    await waitFor(() =>
      expect(screen.getByText(/Gestartet - die Kinder bekommen sie jetzt\./)).toBeInTheDocument(),
    );
    const reihe = await brailleBackend().listeEigeneUebungen(CODE);
    expect(reihe).toHaveLength(1);
    const gespeichert = await brailleBackend().leseEigenenText(reihe[0].textId);
    expect(gespeichert?.zeilen).toEqual(["Ärger über Öl", "Übung für Mäuse, süß und groß"]);
  });
});

describe("Die Zeichen-Prüfung (Schritt 3 des Auftrags)", () => {
  it("★★★★★ zeigt VOR dem Start, wenn ein Kind Zeichen des Textes im Bereich noch nicht gesehen hat - verbietet den Start aber nicht", async () => {
    const { teacherId, kind } = await klasseMitKind();
    const user = nutzer();
    render(<PunktgenauReiter classCode={CODE} teacherId={teacherId} pupils={[kind]} />);
    oeffneLeiste("Eigene Übung");
    await act(async () => {});

    // Ein frisches Kind hat noch KEINE Etappe gemeistert - „bekannt" ist nur
    // die erste, gerade begonnene Etappe. Ein Text mit ungewöhnlichen Zeichen
    // (§, %, eckige Klammern) fällt darum praktisch sicher auf.
    const input = screen.getByLabelText(/Eigene Datei hochladen/) as HTMLInputElement;
    await user.upload(input, txtDatei("befund.txt", "Paragraf § 5 kostet 10 % [Anmerkung]."));
    await waitFor(() => expect(screen.getByText(/befund\.txt/)).toBeInTheDocument());

    const befundSatz = await waitFor(() =>
      screen.getByText(/kommen Zeichen vor, die .* dort noch nicht gesehen/),
    );
    expect(befundSatz.textContent).toMatch(/Betroffen: Mara/);

    // Der Start bleibt trotzdem möglich - kein `disabled`, keine Sperre.
    const start = screen.getByRole("button", { name: "Eigene Übung starten" });
    expect(start.hasAttribute("disabled")).toBe(false);
    await user.click(start);
    await waitFor(async () => {
      const reihe = await brailleBackend().listeEigeneUebungen(CODE);
      expect(reihe).toHaveLength(1);
    });
  });
});

describe("Beenden", () => {
  it("nimmt eine Übung nach Rückfrage aus der Reihe", async () => {
    const { be, teacherId, kind } = await klasseMitKind();
    await be.starteEigeneUebung(CODE, teacherId, {
      dateiname: "alt.txt",
      arbeitsweise: "schreiben",
      bereich: "basis",
      zeilen: ["ab"],
    });

    const user = nutzer();
    render(<PunktgenauReiter classCode={CODE} teacherId={teacherId} pupils={[kind]} />);
    oeffneLeiste("Eigene Übung");
    await act(async () => {});

    await waitFor(() => expect(screen.getByRole("button", { name: /Beenden/ })).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: /Beenden/ }));

    // Rückfrage über `Modal`, nie `window.confirm`.
    const dialog = screen.getByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: "Beenden" }));

    await waitFor(async () => {
      const reihe = await brailleBackend().listeEigeneUebungen(CODE);
      expect(reihe).toHaveLength(0);
    });
    expect(screen.getByText(/Beendet - die Klasse übt wieder normal\./)).toBeInTheDocument();
  });
});
