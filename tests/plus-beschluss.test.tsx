/**
 * ★★★ WÄCHTER: Beschlüsse der Lehrkraft und die Schulstufe der Klasse (Plus).
 * ===========================================================================
 *
 * Johannes, 23.09.2026: „a) je Übung, bau es ein - aber ich möchte nicht, dass
 * das Kind die Schulstufe frei wählen kann, wenn es Teil einer Klasse ist.
 * Bestimmt die Schulstufe die Klasseneinstellung, wer selbst lernt, darf
 * wählen."
 *
 * WOHIN SICH DIESER WÄCHTER BEWEGT, WENN ES SCHLECHTER WIRD
 * ([[feedback_gruener_waechter_beweist_was]]):
 *
 *  (a) Wählt ein Klassenkind wieder frei - oder muss ein Selbstlerner eine
 *      Stufe nehmen, die ihm niemand gegeben hat -, wird (a) rot.
 *  (b) Verpufft „noch einmal üben", weil die alte Elo-Zahl sofort wieder
 *      „sitzt" sagt, wird (b) rot. Genau so war `coach.ueberschreibe` gebaut,
 *      bevor es zum ersten Mal benutzt wurde.
 *  (c) Wirkt ein Beschluss zweimal - etwa bei jedem Öffnen neu, obwohl der
 *      Coach inzwischen anders entschieden hat -, wird (c) rot.
 *  (d) Darf ein Kind das Feld selbst schreiben (fehlt es in der Sperrliste des
 *      Feldschutzes) oder fehlt es im Schema, wird (d) rot.
 *  (e) Steht im Reiter eine Auswahl, die nichts speichert, wird (e) rot.
 *  (f) Sieht ein Klassenkind in Plus wieder die Stufenliste - oder steckt es
 *      in „Ich wähle" ohne Rückweg fest -, wird (f) rot.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { nachAntwort, neuerStand, sitzt, ueberschreibe, type Stand } from "@/lib/plus/coach";
import {
  PLUS_STUFE_MAX, festeStufe, heileBeschluss, mitStufe, mitUebung, plusStufeAusKlasse,
  wendeBeschluesseAn,
} from "@/lib/plus/beschluss";
import { heile, leererFortschritt } from "@/lib/plus/fortschritt";
import { SCHULSTUFE_ERWACHSEN, schuljahrStartjahr } from "@/lib/typing/klassenEinstellungen";
import {
  addPupil, createClass, getAccount, registerTeacher, setClassEinstellungen,
} from "@/lib/typing/account";
import { useTypingAuth } from "@/components/typing/useTypingAuth";
import { PlusReiter } from "@/components/lernwerkstatt/klasse/PlusReiter";
import { PlusPage } from "@/features/public/PlusPage";

const WURZEL = resolve(__dirname, "..");
const lies = (pfad: string) => readFileSync(resolve(WURZEL, pfad), "utf8");

beforeEach(() => {
  localStorage.clear();
  useTypingAuth.setState({ account: null });
});
afterEach(() => {
  cleanup();
  useTypingAuth.setState({ account: null });
});

/** Ein Stand, in dem ein Paket nach der Elo-Rechnung klar sitzt - ohne `geschafft`. */
function klarSitzend(id: string): Stand {
  let s = neuerStand(1);
  for (let i = 0; i < 12; i++) s = nachAntwort(s, { paketId: id, richtig: true, tag: 1 });
  return s;
}

/* ══ (a) Wer bestimmt die Schulstufe? ═════════════════════════════════════ */

describe("(a) Die Schulstufe: Klasse bestimmt, Selbstlerner waehlen", () => {
  it("★★★ ein Kind ohne Klasse waehlt frei - auch wenn ein Beschluss dasteht", () => {
    expect(festeStufe(false, 3, {})).toBeNull();
    expect(festeStufe(false, 3, { stufe: 5 })).toBeNull();
  });

  it("★★★ ein Klassenkind rechnet in der Stufe seiner Klasse", () => {
    expect(festeStufe(true, 3, {})).toBe(3);
    expect(festeStufe(true, 7, null)).toBe(7);
  });

  it("★★ die eigene Stufe eines Kindes geht der Klasse vor (Foerderbedarf, oder schon weiter)", () => {
    expect(festeStufe(true, 7, { stufe: 3 })).toBe(3);
  });

  it("★★ Klasse ohne Schulstufe: nichts bestimmt, also waehlt das Kind", () => {
    expect(festeStufe(true, null, {})).toBeNull();
  });

  it("★ ueber der 8. und bei Erwachsen gilt die letzte Stufe von Plus", () => {
    expect(PLUS_STUFE_MAX).toBe(8); // Gegenprobe: der Stoffplan hat acht Stufen
    expect(plusStufeAusKlasse(11)).toBe(8);
    expect(plusStufeAusKlasse(SCHULSTUFE_ERWACHSEN)).toBe(8);
    expect(plusStufeAusKlasse(null)).toBeNull();
  });
});

/* ══ (b) „Noch einmal üben" wirkt wirklich ═════════════════════════════════ */

describe("(b) Noch einmal ueben verpufft nicht", () => {
  it("★★★ ein nach Elo klar sitzendes Paket sitzt nach dem Beschluss NICHT mehr", () => {
    const s = klarSitzend("1-01");
    expect(sitzt(s, "1-01")).toBe(true); // Gegenprobe: vorher sitzt es wirklich
    expect(sitzt(ueberschreibe(s, "1-01", "offen"), "1-01")).toBe(false);
  });

  it("★★ danach zaehlt der Coach neu - und nach guter Arbeit sitzt es wieder", () => {
    let s = ueberschreibe(klarSitzend("1-01"), "1-01", "offen");
    for (let i = 0; i < 3; i++) s = nachAntwort(s, { paketId: "1-01", richtig: true, tag: 2 });
    expect(sitzt(s, "1-01")).toBe(false); // drei neue Versuche reichen nicht
    for (let i = 0; i < 6; i++) s = nachAntwort(s, { paketId: "1-01", richtig: true, tag: 2 });
    expect(sitzt(s, "1-01")).toBe(true);
  });

  it("★ die bisherigen Versuche bleiben stehen - Meine Zahlen verliert nichts", () => {
    const vorher = klarSitzend("1-01").pakete["1-01"].versuche;
    const nachher = ueberschreibe(klarSitzend("1-01"), "1-01", "offen").pakete["1-01"].versuche;
    expect(nachher).toBe(vorher);
  });

  it("★ sitzt von Hand sitzt sofort", () => {
    expect(sitzt(ueberschreibe(neuerStand(1), "2-01", "sitzt"), "2-01")).toBe(true);
  });
});

/* ══ (c) Genau einmal ══════════════════════════════════════════════════════ */

describe("(c) Ein Beschluss wirkt genau einmal", () => {
  it("★★★ ein zweites Oeffnen nimmt denselben Beschluss nicht noch einmal", () => {
    const b = mitUebung({}, "1-01", "sitzt", 5000);
    const erst = wendeBeschluesseAn(neuerStand(1), 0, b);
    expect(erst.neu).toBe(1);
    expect(erst.angewandt).toBe(5000);
    const dann = wendeBeschluesseAn(erst.stand, erst.angewandt, b);
    expect(dann.neu).toBe(0);
    expect(dann.stand).toBe(erst.stand);
  });

  it("★★ ein neuerer Beschluss fuer dieselbe Uebung wirkt wieder", () => {
    const erst = wendeBeschluesseAn(neuerStand(1), 0, mitUebung({}, "1-01", "sitzt", 5000));
    const zweiter = mitUebung({}, "1-01", "offen", 9000);
    const dann = wendeBeschluesseAn(erst.stand, erst.angewandt, zweiter);
    expect(dann.neu).toBe(1);
    expect(sitzt(dann.stand, "1-01")).toBe(false);
  });

  it("★ wie der Coach sagt nimmt nichts zurueck, was schon uebernommen ist", () => {
    const erst = wendeBeschluesseAn(neuerStand(1), 0, mitUebung({}, "1-01", "sitzt", 5000));
    const leer = mitUebung(mitUebung({}, "1-01", "sitzt", 5000), "1-01", null);
    expect(leer.uebungen).toBeUndefined();
    const dann = wendeBeschluesseAn(erst.stand, erst.angewandt, leer);
    expect(sitzt(dann.stand, "1-01")).toBe(true);
  });

  it("★ der Merker ueberlebt Speichern und Laden", () => {
    const f = { ...leererFortschritt(), beschlussAngewandt: 1234 };
    expect(heile(JSON.parse(JSON.stringify(f))).beschlussAngewandt).toBe(1234);
    expect(heile({}).beschlussAngewandt).toBe(0);
  });

  it("★ Unbrauchbares im Konto wird verworfen, nicht geglaubt", () => {
    expect(heileBeschluss(null)).toEqual({});
    expect(heileBeschluss({ stufe: 42, uebungen: { "1-01": { wert: "gut", am: 1 } } })).toEqual({});
    expect(heileBeschluss({ stufe: 3 })).toEqual({ stufe: 3 });
    expect(mitStufe({ stufe: 3 }, null)).toEqual({});
    // Eine Übung, die es nicht gibt, bewegt nichts.
    const r = wendeBeschluesseAn(neuerStand(1), 0, { uebungen: { "9-99": { wert: "sitzt", am: 5 } } });
    expect(r.neu).toBe(0);
  });
});

/* ══ (d) Der Server ════════════════════════════════════════════════════════ */

describe("(d) Nur die Lehrkraft schreibt den Beschluss", () => {
  it("★★★ plusBeschluss steht in der Sperrliste des Feldschutzes", () => {
    const hook = lies("pocketbase/pb_hooks/tt_pupils_field_guard.pb.js");
    const liste = hook.slice(hook.indexOf("const LOCKED = ["), hook.indexOf("];", hook.indexOf("const LOCKED = [")));
    expect(liste).toContain('"plusBeschluss"');
    expect(liste).toContain('"lessonLocks"'); // Gegenprobe: die richtige Liste gelesen
  });

  it("★★ und das Feld steht im Schema von tt_pupils", () => {
    const setup = lies("pocketbase/setup.mjs");
    const anfang = setup.indexOf('name: "tt_pupils"');
    const ende = setup.indexOf("N(\"createdAtMs\")", setup.indexOf('name: "lessonLocks"', anfang));
    expect(anfang).toBeGreaterThan(0);
    expect(setup.slice(anfang, ende)).toMatch(/name: "plusBeschluss", type: "json"/);
  });
});

/* ══ (e) Der Reiter speichert wirklich ═════════════════════════════════════ */

function klasseMitKind(schulstufe?: number) {
  const t = registerTeacher("Frau Berger", "berger@example.org", "geheim123");
  if (!t.ok) throw new Error(t.error);
  const c = createClass(t.value.id, "3b", "3B");
  if (!c.ok) throw new Error(c.error);
  if (schulstufe !== undefined) {
    setClassEinstellungen(c.value.code, t.value.id, {
      schulstufe, schulstufeSchuljahr: schuljahrStartjahr(),
    });
  }
  const p = addPupil(c.value.code, "Mia", "pw1234");
  if (!p.ok) throw new Error(p.error);
  return { lehrkraft: t.value, kind: p.value, code: c.value.code };
}


/** Die Einzelheiten eines Kindes aufklappen (seit 16.10.2026 steht dort alles Genaue). */
async function oeffneKind(name: string) {
  fireEvent.click(await screen.findByRole("button", { name: `${name}: Einzelheiten aufklappen` }));
}

describe("(e) Die Auswahlen im Reiter landen im Konto des Kindes", () => {
  it("★★★ eigene Schulstufe setzen und wieder auf die Klasse zuruecknehmen", async () => {
    const { kind } = klasseMitKind(3);
    render(<PlusReiter pupils={[kind]} cls={{ code: "3B", schulstufe: 3 }} />);
    await oeffneKind("Mia");
    const wahl = await screen.findByLabelText("Schulstufe in Plus");
    expect((wahl as HTMLSelectElement).value).toBe(""); // wie die Klasse
    expect(within(wahl).getByText("wie die Klasse (3.)")).toBeInTheDocument();

    fireEvent.change(wahl, { target: { value: "2" } });
    await waitFor(() => expect(heileBeschluss(getAccount(kind.id)?.plusBeschluss).stufe).toBe(2));
    expect(await screen.findByText(/Schulstufe in Plus für Mia: 2\. Schulstufe/)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Schulstufe in Plus"), { target: { value: "" } });
    await waitFor(() => expect(heileBeschluss(getAccount(kind.id)?.plusBeschluss).stufe).toBeUndefined());
  });

  it("★★★ eine Uebung auf sitzt stellen - und es steht dabei, wann es wirkt", async () => {
    const { kind } = klasseMitKind(1);
    render(<PlusReiter pupils={[kind]} cls={{ code: "3B", schulstufe: 1 }} />);
    await oeffneKind("Mia");
    const region = await screen.findByRole("region", { name: /Einzelheiten: Mia/ });
    const erste = within(region).getAllByRole("combobox").find((c) =>
      /Einstufung für Mia/.test(c.getAttribute("aria-label") ?? ""),
    ) as HTMLSelectElement;
    const uebung = (erste.getAttribute("aria-label") ?? "").split(":")[0];

    fireEvent.change(erste, { target: { value: "sitzt" } });
    await waitFor(() => {
      const b = heileBeschluss(getAccount(kind.id)?.plusBeschluss);
      expect(Object.values(b.uebungen ?? {}).map((e) => e.wert)).toEqual(["sitzt"]);
    });
    expect(await screen.findByText(new RegExp(`${uebung} für Mia: sitzt\\. Wirkt beim nächsten Öffnen`))).toBeInTheDocument();
    expect(within(region).getByText(/wirkt beim nächsten Öffnen/)).toBeInTheDocument();
  });

  it("★★ Klasse ohne Schulstufe: der Reiter sagt, dass die Kinder selbst waehlen", async () => {
    const { kind } = klasseMitKind();
    render(<PlusReiter pupils={[kind]} cls={{ code: "3B" }} />);
    fireEvent.click(await screen.findByRole("button", { name: /^Einstellungen der Klasse/ }));
    expect(await screen.findByText(/keine Schulstufe eingetragen/)).toBeInTheDocument();
    await oeffneKind("Mia");
    expect(within(await screen.findByLabelText("Schulstufe in Plus")).getByText("frei wählen")).toBeInTheDocument();
  });
});

/* ══ (f) Die Kinderseite ═══════════════════════════════════════════════════ */

function zeigePlus() {
  render(
    <MemoryRouter>
      <PlusPage />
    </MemoryRouter>,
  );
}

describe("(f) In Plus: das Klassenkind waehlt keine Stufe", () => {
  it("★★★ Ich waehle zeigt gleich die Uebungen der Klassenstufe, ohne Stufenliste", async () => {
    const { kind } = klasseMitKind(3);
    useTypingAuth.setState({ account: kind });
    zeigePlus();
    fireEvent.click(await screen.findByRole("button", { name: /Ich wähle/ }));
    expect(await screen.findByRole("heading", { name: /3\. Schulstufe - welche Übung\?/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Andere Schulstufe" })).toBeNull();
    expect(screen.getByText("Die Schulstufe stellt deine Lehrkraft ein.")).toBeInTheDocument();
  });

  it("★★ die eigene Stufe aus dem Beschluss geht der Klasse vor", async () => {
    const { kind } = klasseMitKind(5);
    useTypingAuth.setState({ account: { ...kind, plusBeschluss: { stufe: 2 } } });
    zeigePlus();
    fireEvent.click(await screen.findByRole("button", { name: /Ich wähle/ }));
    expect(await screen.findByRole("heading", { name: /2\. Schulstufe - welche Übung\?/ })).toBeInTheDocument();
  });

  it("★★★ beim Oeffnen uebernimmt Plus den Beschluss - einmal, und speichert ihn", async () => {
    const { kind } = klasseMitKind(1);
    // Plus liest sein Konto aus dem Anmeldespeicher der Plattform.
    localStorage.setItem("tt_pb_auth", JSON.stringify({ record: { id: kind.id } }));
    useTypingAuth.setState({
      account: { ...kind, plusBeschluss: { uebungen: { "1-02": { wert: "sitzt", am: 5000 } } } },
    });
    zeigePlus();
    await waitFor(() => {
      const f = heile(JSON.parse(localStorage.getItem(`plus:stand:${kind.id}`) ?? "null"));
      expect(f.beschlussAngewandt).toBe(5000);
      expect(sitzt(f.stand, "1-02")).toBe(true);
    });
  });

  it("★★ ein Beschluss fuer ein ANDERES Konto wird nicht uebernommen", async () => {
    const { kind } = klasseMitKind(1);
    localStorage.setItem("tt_pb_auth", JSON.stringify({ record: { id: "jemand-anderes" } }));
    useTypingAuth.setState({
      account: { ...kind, plusBeschluss: { uebungen: { "1-02": { wert: "sitzt", am: 5000 } } } },
    });
    zeigePlus();
    await screen.findByRole("button", { name: /Ich wähle/ });
    await new Promise((r) => setTimeout(r, 50));
    const roh = localStorage.getItem("plus:stand:jemand-anderes");
    expect(roh === null || heile(JSON.parse(roh)).beschlussAngewandt === 0).toBe(true);
  });

  it("★★★ wer ohne Klasse lernt, waehlt die Stufe weiter selbst", async () => {
    zeigePlus();
    fireEvent.click(await screen.findByRole("button", { name: /Ich wähle/ }));
    expect(await screen.findByRole("heading", { name: "Welche Schulstufe?" })).toBeInTheDocument();
  });

  it("★★ aus Ich waehle fuehrt ein Weg zurueck zum Start - in beiden Faellen", async () => {
    const { kind } = klasseMitKind(3);
    useTypingAuth.setState({ account: kind });
    zeigePlus();
    fireEvent.click(await screen.findByRole("button", { name: /Ich wähle/ }));
    await screen.findByRole("heading", { name: /3\. Schulstufe - welche Übung/ });
    // Die Kopfzeile nennt den Bereich - nicht mehr „Start" (Befund 23.09.2026).
    expect(screen.getByRole("heading", { level: 1 }).textContent).toMatch(/3\. Schulstufe/);
    fireEvent.click(screen.getByRole("button", { name: "Zurück" }));
    expect(await screen.findByRole("button", { name: /Ich wähle/ })).toBeInTheDocument();

    cleanup();
    useTypingAuth.setState({ account: null });
    zeigePlus();
    fireEvent.click(await screen.findByRole("button", { name: /Ich wähle/ }));
    await screen.findByRole("heading", { name: "Welche Schulstufe?" });
    fireEvent.click(screen.getByRole("button", { name: "Zurück" }));
    expect(await screen.findByRole("button", { name: /Ich wähle/ })).toBeInTheDocument();
  });
});
