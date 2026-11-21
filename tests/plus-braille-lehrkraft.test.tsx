/**
 * Wächter: Die Lehrkraft stellt die Braillezeile ein - unter Meine Klasse / Plus
 * (Johannes, 19.10.2026: „die neuen Einstellungen soll auch der Lehrer unter
 * Meine Klassen / Plus einstellen können").
 *
 * Gemessen wird, was im Konto steht (`plusBeschluss`) - nicht, was auf dem Bildschirm aussieht.
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { PlusPage } from "@/features/public/PlusPage";
import { useEinstellungen } from "@/lib/plus/einstellungen";
import { useTypingAuth } from "@/components/typing/useTypingAuth";
import { addPupil, createClass, getAccount, registerTeacher } from "@/lib/typing/account";
import { PlusReiter } from "@/components/lernwerkstatt/klasse/PlusReiter";
import { braillevorgabe, heileBeschluss } from "@/lib/plus/beschluss";

beforeEach(() => localStorage.clear());
afterEach(() => {
  cleanup();
  useTypingAuth.setState({ account: null });
  useEinstellungen.getState().setVorgabe({});
  useEinstellungen.getState().setEingabeart("normal");
});

function klasseMitZwei() {
  const t = registerTeacher("Frau Berger", "berger@example.org", "geheim123");
  if (!t.ok) throw new Error(t.error);
  const c = createClass(t.value.id, "3b", "3B");
  if (!c.ok) throw new Error(c.error);
  const mia = addPupil(c.value.code, "Mia", "pw1234");
  const ben = addPupil(c.value.code, "Ben", "pw1234");
  if (!mia.ok || !ben.ok) throw new Error("Kinder");
  return { mia: mia.value, ben: ben.value };
}

describe("Braillezeile für die Klasse", () => {
  it("★★★ Braillezeile, Schrift und 80 Zeichen gelten für beide Kinder - und gehen wieder zurück", async () => {
    const { mia, ben } = klasseMitZwei();
    render(<PlusReiter pupils={[mia, ben]} cls={{ code: "3B", schulstufe: 3 }} />);
    fireEvent.click(await screen.findByRole("button", { name: /^Einstellungen der Klasse/ }));
    const kasten = (await screen.findByRole("heading", { name: "Einstellungen der Klasse" })).closest("div") as HTMLElement;

    fireEvent.change(within(kasten).getByLabelText("Zeichen je Zeile"), { target: { value: "80" } });
    await waitFor(() => {
      for (const id of [mia.id, ben.id]) expect(heileBeschluss(getAccount(id)?.plusBeschluss).klasse?.breite).toBe(80);
    });
    fireEvent.change(within(kasten).getByLabelText("Braillezeile"), { target: { value: "an" } });
    await waitFor(() => expect(heileBeschluss(getAccount(ben.id)?.plusBeschluss).klasse?.braillezeile).toBe(true));
    fireEvent.change(within(kasten).getByLabelText("Wie die Kinder schreiben"), { target: { value: "braille" } });
    await waitFor(() => expect(heileBeschluss(getAccount(ben.id)?.plusBeschluss).klasse?.eingabe).toBe("braille"));
    fireEvent.change(within(kasten).getByLabelText("Braille-Schrift"), { target: { value: "marburger" } });
    await waitFor(() => expect(heileBeschluss(getAccount(mia.id)?.plusBeschluss).klasse?.schrift).toBe("marburger"));
    // Die 80 von vorhin sind noch da.
    const klasse = heileBeschluss(getAccount(mia.id)?.plusBeschluss).klasse;
    expect(klasse).toMatchObject({ braillezeile: true, schrift: "marburger", breite: 80, eingabe: "braille" });
    expect(braillevorgabe(true, heileBeschluss(getAccount(mia.id)?.plusBeschluss)))
      .toEqual({ braillezeile: true, schrift: "marburger", breite: 80, eingabe: "braille" });

    fireEvent.change(within(kasten).getByLabelText("Zeichen je Zeile"), { target: { value: "" } });
    await waitFor(() => expect(heileBeschluss(getAccount(ben.id)?.plusBeschluss).klasse?.breite).toBeUndefined());
    expect(heileBeschluss(getAccount(ben.id)?.plusBeschluss).klasse?.braillezeile).toBe(true);
  });
});

describe("Braillezeile für ein einzelnes Kind", () => {
  it("★★★ nur dieses Kind bekommt sie, und sie geht vor die Klasse", async () => {
    const { mia, ben } = klasseMitZwei();
    render(<PlusReiter pupils={[mia, ben]} cls={{ code: "3B", schulstufe: 3 }} />);
    fireEvent.click(await screen.findByRole("button", { name: "Ben: Einzelheiten aufklappen" }));
    const abschnitt = (await screen.findByText("Braillezeile für Ben")).closest("details") as HTMLDetailsElement;
    abschnitt.open = true;

    fireEvent.change(within(abschnitt).getByLabelText("Braillezeile"), { target: { value: "an" } });
    await waitFor(() => expect(heileBeschluss(getAccount(ben.id)?.plusBeschluss).braille?.braillezeile).toBe(true));
    fireEvent.change(within(abschnitt).getByLabelText("Zeichen je Zeile"), { target: { value: "80" } });
    await waitFor(() => expect(heileBeschluss(getAccount(ben.id)?.plusBeschluss).braille).toEqual({ braillezeile: true, breite: 80 }));
    // Mia bleibt unberührt.
    expect(heileBeschluss(getAccount(mia.id)?.plusBeschluss).braille).toBeUndefined();
    // „Wie die Klasse" nimmt es zurück.
    fireEvent.change(within(abschnitt).getByLabelText("Braillezeile"), { target: { value: "" } });
    await waitFor(() => expect(heileBeschluss(getAccount(ben.id)?.plusBeschluss).braille).toEqual({ breite: 80 }));
    fireEvent.change(within(abschnitt).getByLabelText("Zeichen je Zeile"), { target: { value: "" } });
    await waitFor(() => expect(heileBeschluss(getAccount(ben.id)?.plusBeschluss).braille).toBeUndefined());
  });
});

describe("Auf der Seite des Kindes", () => {
  it("★★★ die Vorgabe der Lehrkraft gilt, das Kind sieht sie als Satz und kann sie nicht ändern", async () => {
    const { mia } = klasseMitZwei();
    useTypingAuth.setState({
      account: { ...mia, plusBeschluss: { klasse: { braillezeile: true, breite: 80 }, braille: { schrift: "marburger" } } },
    });
    render(<MemoryRouter><PlusPage /></MemoryRouter>);
    await waitFor(() => {
      const s = useEinstellungen.getState();
      expect([s.braillezeile, s.schrift, s.breite]).toEqual([true, "marburger", 80]);
    });
    fireEvent.keyDown(window, { altKey: true, code: "KeyO", key: "o" });
    const fenster = await screen.findByRole("dialog");
    expect(within(fenster).queryByRole("switch", { name: "Arbeiten mit Braillezeile" })).toBeNull();
    expect(within(fenster).queryByRole("combobox", { name: "Braillezeile mit 40 oder 80 Zeichen" })).toBeNull();
    expect(within(fenster).getAllByText(/Das hat deine Lehrkraft für dich eingestellt/).length).toBe(3);
    useEinstellungen.getState().setBreite(40);
    expect(useEinstellungen.getState().breite).toBe(80);
  });

  it("★★ wer in keiner Klasse ist, bekommt nie eine Vorgabe", async () => {
    const t = registerTeacher("Frau Berger", "berger@example.org", "geheim123");
    if (!t.ok) throw new Error(t.error);
    useTypingAuth.setState({ account: null });
    render(<MemoryRouter><PlusPage /></MemoryRouter>);
    await screen.findAllByRole("button");
    expect(useEinstellungen.getState().vorgabe).toEqual({});
  });
});
