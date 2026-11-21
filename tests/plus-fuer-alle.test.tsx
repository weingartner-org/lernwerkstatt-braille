/**
 * ★★★ WÄCHTER: Die Übung für alle (Johannes, 28.09.2026: „aus den
 * vorgegebenen Bereichen starten alle die selbe Übung - so wie die eigene
 * Übung bei Tastenflow").
 *
 * WOHIN ER SICH BEWEGT, WENN ES SCHLECHTER WIRD:
 *  (a) Bekommen zwei Kinder aus demselben Auftrag verschiedene Aufgaben -
 *      etwa weil die Saat doch auf dem Gerät gewürfelt wird -, wird (a) rot.
 *  (b) Wischt ein anderer Beschluss der Lehrkraft (Stufe, Einstufung) die
 *      laufende Übung weg, wird (b) rot.
 *  (c) Landet der Start nicht bei JEDEM Kind der Liste, wird (c) rot.
 *  (d) Sieht das Kind die Übung nicht, oder sieht es sie nach dem Rechnen
 *      noch, wird (d) rot.
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { erzeugeFolge } from "@/lib/plus/generator";
import { zufall } from "@/lib/plus/aufgabe";
import { heileBeschluss, mitStufe, mitUebung } from "@/lib/plus/beschluss";
import {
  heileFuerAlle, namenFuerAlle, neueUebungFuerAlle, planFuerAlle, type UebungFuerAlle,
} from "@/lib/plus/lehrerUebung";
import { heile } from "@/lib/plus/fortschritt";
import { addPupil, createClass, getAccount, registerTeacher } from "@/lib/typing/account";
import { useTypingAuth } from "@/components/typing/useTypingAuth";
import { PlusReiter } from "@/components/lernwerkstatt/klasse/PlusReiter";
import { PlusPage } from "@/features/public/PlusPage";

beforeEach(() => {
  localStorage.clear();
  useTypingAuth.setState({ account: null });
});
afterEach(() => {
  cleanup();
  useTypingAuth.setState({ account: null });
});

const AUFTRAG: UebungFuerAlle = {
  id: "fa-test", pakete: ["2-01", "2-02"], anzahl: 8, saat: 424242, am: 1000,
};

function klasseMitZweiKindern() {
  const t = registerTeacher("Frau Berger", "berger@example.org", "geheim123");
  if (!t.ok) throw new Error(t.error);
  const c = createClass(t.value.id, "3b", "3B");
  if (!c.ok) throw new Error(c.error);
  const mia = addPupil(c.value.code, "Mia", "pw1234");
  const ben = addPupil(c.value.code, "Ben", "pw1234");
  if (!mia.ok || !ben.ok) throw new Error("Kinder");
  return { mia: mia.value, ben: ben.value };
}

/* ══ (a) Dieselben Aufgaben für alle ════════════════════════════════════════ */

describe("(a) Aus demselben Auftrag entstehen dieselben Aufgaben", () => {
  it("★★★ zwei Geräte, derselbe Auftrag: Zeichen für Zeichen dieselbe Folge", () => {
    const eins = erzeugeFolge(planFuerAlle(AUFTRAG), zufall(AUFTRAG.saat)).map((a) => a.angabe);
    const zwei = erzeugeFolge(planFuerAlle(AUFTRAG), zufall(AUFTRAG.saat)).map((a) => a.angabe);
    expect(eins).toHaveLength(8);
    expect(zwei).toEqual(eins);
  });

  it("★★ jede gewählte Übung kommt gleich oft dran", () => {
    const plan = planFuerAlle({ ...AUFTRAG, pakete: ["2-01", "2-02", "2-03"], anzahl: 24 });
    for (const id of ["2-01", "2-02", "2-03"]) expect(plan.filter((x) => x === id)).toHaveLength(8);
  });

  it("★★ die Saat entsteht bei der Lehrkraft, einmal", () => {
    const u = neueUebungFuerAlle(["2-01"], 16, 5000, () => 0.5);
    expect(u).toMatchObject({ pakete: ["2-01"], anzahl: 16, saat: 500000000, am: 5000 });
    expect(heileFuerAlle(u)).toEqual(u);
  });

  it("★ Unsinn aus dem Konto wird keine Übung", () => {
    expect(heileFuerAlle(null)).toBeNull();
    expect(heileFuerAlle({ ...AUFTRAG, pakete: ["99-99"] })).toBeNull();
    expect(heileFuerAlle({ ...AUFTRAG, anzahl: 1000 })).toBeNull();
    expect(heileFuerAlle({ ...AUFTRAG, id: "" })).toBeNull();
  });
});

/* ══ (b) Andere Beschlüsse lassen sie stehen ═══════════════════════════════ */

describe("(b) Die Übung überlebt die anderen Beschlüsse", () => {
  it("★★★ Stufe und Einstufung ändern - die Übung für alle bleibt", () => {
    const b = heileBeschluss({ fuerAlle: AUFTRAG });
    expect(heileBeschluss(mitStufe(b, 2)).fuerAlle).toEqual(AUFTRAG);
    expect(heileBeschluss(mitUebung(b, "2-01", "sitzt")).fuerAlle).toEqual(AUFTRAG);
  });
});

/* ══ (c) Die Lehrkraft startet und beendet ═════════════════════════════════ */

describe("(c) Im Reiter: starten und beenden", () => {
  it("★★★ der Start landet bei jedem Kind - mit derselben Kennung und Saat", async () => {
    const { mia, ben } = klasseMitZweiKindern();
    render(<PlusReiter pupils={[mia, ben]} cls={{ code: "3B", schulstufe: 2 }} />);
    fireEvent.click(await screen.findByRole("button", { name: /^Eine Übung für alle/ }));
    expect(await screen.findByText("Gerade läuft keine Übung für alle.")).toBeInTheDocument();

    const erste = screen.getAllByRole("checkbox")[0];
    fireEvent.click(erste);
    fireEvent.change(screen.getByLabelText(/^Aufgaben/), { target: { value: "16" } });
    fireEvent.click(screen.getByRole("button", { name: "Übung für alle starten" }));

    await waitFor(() => {
      const a = heileBeschluss(getAccount(mia.id)?.plusBeschluss).fuerAlle;
      const b = heileBeschluss(getAccount(ben.id)?.plusBeschluss).fuerAlle;
      expect(a?.anzahl).toBe(16);
      expect(b).toEqual(a);
    });
    expect(await screen.findByText(/^Läuft: .*16 Aufgaben\.$/)).toBeInTheDocument();
    expect(await screen.findByText(/Übung für alle gestartet/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Übung beenden" }));
    await waitFor(() => {
      expect(heileBeschluss(getAccount(mia.id)?.plusBeschluss).fuerAlle).toBeUndefined();
      expect(heileBeschluss(getAccount(ben.id)?.plusBeschluss).fuerAlle).toBeUndefined();
    });
  });

  it("★★ ohne gewählte Übung: ein Satz, kein stiller Knopf", async () => {
    const { mia } = klasseMitZweiKindern();
    render(<PlusReiter pupils={[mia]} cls={{ code: "3B", schulstufe: 2 }} />);
    fireEvent.click(await screen.findByRole("button", { name: /^Eine Übung für alle/ }));
    fireEvent.click(await screen.findByRole("button", { name: "Übung für alle starten" }));
    expect(await screen.findByText("Bitte zuerst mindestens eine Übung wählen.")).toBeInTheDocument();
    expect(heileBeschluss(getAccount(mia.id)?.plusBeschluss).fuerAlle).toBeUndefined();
  });

  it("★★ die Lehrkraft sieht, wer fertig ist - sonst nichts", async () => {
    const { mia, ben } = klasseMitZweiKindern();
    const mit = (k: typeof mia) => ({ ...k, plusBeschluss: { fuerAlle: AUFTRAG } });
    localStorage.setItem(`plus:stand:${mia.id}`, JSON.stringify({ fuerAlleFertig: [AUFTRAG.id] }));
    render(<PlusReiter pupils={[mit(mia), mit(ben)]} cls={{ code: "3B", schulstufe: 2 }} />);
    fireEvent.click(await screen.findByRole("button", { name: /^Eine Übung für alle/ }));
    expect(await screen.findByText("Fertig: 1 von 2 Kindern.")).toBeInTheDocument();
    expect(screen.getByText("Fertig: Mia")).toBeInTheDocument();
    expect(screen.getByText("Noch nicht fertig: Ben")).toBeInTheDocument();
  });
});

/* ══ (d) Das Kind ══════════════════════════════════════════════════════════ */

function zeigePlus() {
  render(
    <MemoryRouter>
      <PlusPage />
    </MemoryRouter>,
  );
}

describe("(d) In Plus: die Übung steht oben, und nach dem Rechnen ist sie weg", () => {
  it("★★★ Karte, dieselben Aufgaben, danach als fertig gemerkt", async () => {
    const { mia } = klasseMitZweiKindern();
    localStorage.setItem("tt_pb_auth", JSON.stringify({ record: { id: mia.id } }));
    useTypingAuth.setState({ account: { ...mia, plusBeschluss: { fuerAlle: AUFTRAG } } });
    zeigePlus();

    expect(await screen.findByRole("heading", { name: namenFuerAlle(AUFTRAG) })).toBeInTheDocument();
    expect(screen.getByText("8 Aufgaben. Alle rechnen dieselben.")).toBeInTheDocument();
    const los = screen.getAllByRole("button", { name: /Los geht's/ })[0];
    fireEvent.click(los);

    const aufgaben = erzeugeFolge(planFuerAlle(AUFTRAG), zufall(AUFTRAG.saat));
    for (let i = 0; i < aufgaben.length; i++) {
      expect(await screen.findByText(`Aufgabe ${i + 1} von 8`)).toBeInTheDocument();
      fireEvent.change(screen.getByLabelText("Deine Antwort"), { target: { value: aufgaben[i].loesung } });
      fireEvent.click(screen.getByRole("button", { name: "Prüfen" }));
    }
    expect(await screen.findByText("8 von 8 richtig.")).toBeInTheDocument();
    await waitFor(() => {
      const f = heile(JSON.parse(localStorage.getItem(`plus:stand:${mia.id}`) ?? "null"));
      expect(f.fuerAlleFertig).toContain(AUFTRAG.id);
    });

    fireEvent.click(screen.getByRole("button", { name: /Zurück|Genug für heute|Andere Übung/ }));
    await screen.findByRole("button", { name: /Ich wähle/ });
    expect(screen.queryByRole("heading", { name: namenFuerAlle(AUFTRAG) })).toBeNull();
  });

  it("★★ wer ohne Klasse lernt, bekommt keine Übung für alle", async () => {
    useTypingAuth.setState({
      account: { id: "solo", name: "Solo", role: "schueler", classCode: "", selfManaged: true, plusBeschluss: { fuerAlle: AUFTRAG } } as never,
    });
    zeigePlus();
    await screen.findByRole("button", { name: /Ich wähle/ });
    expect(screen.queryByText("Übung für die Klasse")).toBeNull();
  });
});
