/**
 * ★★★★★ WÄCHTER: DIE DREI KLASSENMATCH-ÄNDERUNGEN AUS TASTENFLOW, NACHGEZOGEN
 * IN PUNKTGENAU (02.10.2026).
 *
 * Vorbild `typing-klassenmatch-start-rueckfrage.test.tsx` (Klasse CSS6,
 * Tastenflow, 02.10.2026). Johannes für Punktgenau: „ja, mach Punktgenau
 * genauso". Je Entscheidung ein Block:
 *  (A) Starten mit Unentschiedenen fragt: „3 Kinder haben sich noch nicht
 *      entschieden. Trotzdem starten?" - gezählt wird nur, bei wem die
 *      Einladung wirklich aufging (Zeile `eingeladen`), und eine solche Zeile
 *      ist NIRGENDS eine Teilnahme.
 *  (B) Ein Kind, ein Match - im Gerät UND am Server (der lokale Speicher prüft
 *      mit `matchSperre`, derselben Regel wie `br_match_lib.pb.js`; der echte
 *      Server ist im Bericht gegen ein lokales PocketBase gemessen). Dazu die
 *      Rückfrage „Sarah lädt gerade ein. Mitmachen oder selbst einladen?", und
 *      ein abgewiesenes „Bin dabei" wird gezeigt statt verschluckt.
 *  (C) Keine Einladung mitten im Match - aber auf der Platzierungsliste ist
 *      ein Kind frei: Die Einladung geht über der Liste auf.
 *  (D) Der Cron bricht eine Einladung mit Mitspielenden nicht nach einer
 *      Minute ab, und `eingeladen`/`abgelehnt` kommen nicht in den Verlauf.
 *
 * Jeder Fall war vor der Behebung rot - der Beleg steht im Bericht vom
 * 02.10.2026 (Logik einzeln zurückgedreht, Test lief rot).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, renderHook, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { Punktgenau } from "@/components/braille/Punktgenau";
import { BrailleKlassenmatchLobby } from "@/components/braille/BrailleKlassenmatchLobby";
import { useBrailleKlassenmatch } from "@/components/braille/useBrailleKlassenmatch";
import { brailleBackend, _resetBrailleBackend } from "@/lib/braille/backend";
import type { BrailleAccount, BrailleClassSettings } from "@/lib/braille/account";
import {
  MATCH_COUNTDOWN_MS,
  MATCH_DAUER_MS,
  MATCH_SPERRE_DABEI,
  MATCH_SPERRE_GASTGEBER,
  dabeiNamen,
  matchSperre,
  rangliste,
  type BrailleMatch,
  type BrailleMatchStand,
} from "@/lib/braille/klassenmatch";
import {
  MATCH_SPERRE_DABEI as TT_SPERRE_DABEI,
  MATCH_SPERRE_GASTGEBER as TT_SPERRE_GASTGEBER,
} from "@/lib/typing/klassenmatch";
import type { LaufErgebnis } from "@/lib/braille/wertung";

const T0 = new Date(2026, 9, 2, 10, 0, 0).getTime();

beforeEach(() => {
  localStorage.clear();
  _resetBrailleBackend();
  vi.useFakeTimers({ shouldAdvanceTime: true });
  vi.setSystemTime(T0);
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  localStorage.clear();
  _resetBrailleBackend();
});

async function warte(ms: number) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
}

const LEER: LaufErgebnis = {
  arbeitsweise: "schreiben",
  bereich: "basis",
  arbeitszeitMs: 0,
  ansageMs: 0,
  richtig: 0,
  falsch: 0,
};

interface Klasse {
  code: string;
  settings: BrailleClassSettings | null;
  kinder: Record<"arne" | "matti" | "lena" | "stephan", BrailleAccount>;
}

async function klasse(code: string): Promise<Klasse> {
  const be = brailleBackend();
  const t = await be.registerTeacher("Frau Berger", `berger-${code}@schule.at`, "geheim1");
  if (!t.ok) throw new Error(t.error);
  const c = await be.createClass(t.value.id, "6", code);
  if (!c.ok) throw new Error(c.error);
  const kind = async (name: string) => {
    const r = await be.addPupil(code, name, "1234");
    if (!r.ok) throw new Error(r.error);
    return r.value as BrailleAccount;
  };
  const kinder = {
    arne: await kind("Arne"),
    matti: await kind("Matti"),
    lena: await kind("Lena"),
    stephan: await kind("Stephan"),
  };
  return { code, settings: await be.getClassSettings(code), kinder };
}

function haken(k: Klasse, kind: BrailleAccount) {
  return renderHook(() => useBrailleKlassenmatch(kind, k.settings));
}

// ── (A) Wer hat sich noch nicht entschieden? ─────────────────────────────────

describe("(A) „Noch nicht entschieden“ - gezählt wird, bei wem die Einladung aufging", () => {
  it("★★★★★ Arne lädt ein: Matti sagt zu, Lena hat das Fenster und überlegt ⇒ 1 unentschieden, und Lena zählt NIRGENDS als dabei", async () => {
    const k = await klasse("PGA1");
    const arne = haken(k, k.kinder.arne);
    const matti = haken(k, k.kinder.matti);
    const lena = haken(k, k.kinder.lena);
    await warte(100);
    await act(async () => {
      arne.result.current.einladen("schreiben", "basis");
    });
    await warte(100);
    const id = arne.result.current.meinMatch!.id;
    expect(matti.result.current.einladung?.id).toBe(id);
    expect(lena.result.current.einladung?.id).toBe(id);

    // Beide Fenster gehen auf (das Bauteil meldet es), Matti sagt zu.
    await act(async () => {
      matti.result.current.einladungGezeigt(id);
      lena.result.current.einladungGezeigt(id);
    });
    await warte(100);
    await act(async () => {
      matti.result.current.beitreten(id);
    });
    await warte(100);

    expect(arne.result.current.unentschieden).toBe(1);
    const zeilen = await brailleBackend().listeMatchStaende(id, "schreiben", "basis");
    expect(zeilen.find((s) => s.pupilUid === k.kinder.lena.id)?.status).toBe("eingeladen");
    // ⚠️ Lenas Zeile steht am „Server" - aber nirgends als Teilnahme.
    expect(arne.result.current.staende.map((s) => s.pupilUid)).not.toContain(k.kinder.lena.id);
    expect(dabeiNamen(zeilen, k.kinder.arne.id)).toEqual(["Matti"]);
    expect(rangliste(zeilen, "schreiben").map((e) => e.stand.name)).not.toContain("Lena");
    expect(arne.result.current.kannStarten).toBe(true);

    // Lena sagt „Jetzt nicht" ⇒ niemand überlegt mehr, und das steht am Server.
    await act(async () => {
      lena.result.current.ablehnen(id);
    });
    await warte(100);
    const danach = await brailleBackend().listeMatchStaende(id, "schreiben", "basis");
    expect(danach.find((s) => s.pupilUid === k.kinder.lena.id)?.status).toBe("abgelehnt");
    expect(arne.result.current.unentschieden).toBe(0);
  });

  it("★★★ „Starten“ geht nicht, solange nur eingeladene/abgelehnte Zeilen da sind - sie warten nicht", async () => {
    const k = await klasse("PGA2");
    const arne = haken(k, k.kinder.arne);
    const lena = haken(k, k.kinder.lena);
    await warte(100);
    await act(async () => {
      arne.result.current.einladen("schreiben", "basis");
    });
    await warte(100);
    const id = arne.result.current.meinMatch!.id;
    await act(async () => {
      lena.result.current.einladungGezeigt(id);
    });
    await warte(100);
    expect(arne.result.current.unentschieden).toBe(1);
    expect(arne.result.current.kannStarten).toBe(false);
  });

  it("★★★★ das Wartefenster fragt vor dem Start - Fokus auf „Warten“, Escape heisst „Warten“, nicht „Absagen“", async () => {
    const match: BrailleMatch = {
      id: "m1",
      classCode: "PGA3",
      hostUid: "arne",
      hostName: "Arne",
      arbeitsweise: "schreiben",
      bereich: "basis",
      status: "einladung",
      startMs: 0,
      endeMs: 0,
      dauerMin: 5,
      createdMs: T0,
    };
    const onStarten = vi.fn();
    const onAbbrechen = vi.fn();
    const { rerender } = render(
      <BrailleKlassenmatchLobby
        match={match}
        staende={[]}
        binGastgeber
        imCountdown={false}
        restMs={0}
        kannStarten
        unentschieden={3}
        onStarten={onStarten}
        onAbbrechen={onAbbrechen}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Starten" }));
    expect(onStarten).not.toHaveBeenCalled();
    expect(
      screen.getByRole("group", { name: "3 Kinder haben sich noch nicht entschieden. Trotzdem starten?" }),
    ).toBeInTheDocument();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Warten" }));

    // Escape = Warten: die Frage geht zu, das Match bleibt.
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onAbbrechen).not.toHaveBeenCalled();
    expect(screen.queryByRole("group")).not.toBeInTheDocument();

    // Noch einmal - und diesmal „Trotzdem starten".
    fireEvent.click(screen.getByRole("button", { name: "Starten" }));
    fireEvent.click(screen.getByRole("button", { name: "Trotzdem starten" }));
    expect(onStarten).toHaveBeenCalledTimes(1);

    // Einzahl, und alle entschieden ⇒ kein Umweg.
    rerender(
      <BrailleKlassenmatchLobby
        match={match}
        staende={[]}
        binGastgeber
        imCountdown={false}
        restMs={0}
        kannStarten
        unentschieden={1}
        onStarten={onStarten}
        onAbbrechen={onAbbrechen}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Starten" }));
    expect(screen.getByText("1 Kind hat sich noch nicht entschieden. Trotzdem starten?")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Warten" }));
    rerender(
      <BrailleKlassenmatchLobby
        match={match}
        staende={[]}
        binGastgeber
        imCountdown={false}
        restMs={0}
        kannStarten
        unentschieden={0}
        onStarten={onStarten}
        onAbbrechen={onAbbrechen}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Starten" }));
    expect(onStarten).toHaveBeenCalledTimes(2);
  });
});

// ── (B) Ein Kind, ein Match ─────────────────────────────────────────────────

describe("(B) Ein Kind, ein Match - im Gerät und am „Server“", () => {
  it("★★★★★ ein zweites eigenes Match wird abgewiesen, ebenso ein Match von einem Kind, das schon dabei ist", async () => {
    const k = await klasse("PGB1");
    const be = brailleBackend();
    const m1 = await be.erstelleMatch(k.kinder.arne, "schreiben", "basis");
    expect(m1).not.toBeNull();
    await expect(be.erstelleMatch(k.kinder.arne, "lesen", "basis")).rejects.toThrow(MATCH_SPERRE_GASTGEBER);

    await be.schreibeMatchStand(k.kinder.matti, m1!.id, "schreiben", "basis", { status: "dabei", lauf: LEER });
    await expect(be.erstelleMatch(k.kinder.matti, "schreiben", "basis")).rejects.toThrow(MATCH_SPERRE_DABEI);

    // Einem zweiten Match beitreten: abgewiesen - `eingeladen` geht aber durch
    // (das ist keine Teilnahme), und ohne `fehlerMelden` bleibt es ein stilles null.
    const m2 = await be.erstelleMatch(k.kinder.lena, "schreiben", "basis");
    await expect(
      be.schreibeMatchStand(k.kinder.matti, m2!.id, "schreiben", "basis", { status: "dabei", lauf: LEER }, { fehlerMelden: true }),
    ).rejects.toThrow(MATCH_SPERRE_DABEI);
    expect(
      await be.schreibeMatchStand(k.kinder.matti, m2!.id, "schreiben", "basis", { status: "dabei", lauf: LEER }),
    ).toBeNull();
    expect(
      await be.schreibeMatchStand(k.kinder.matti, m2!.id, "schreiben", "basis", { status: "eingeladen", lauf: LEER }),
    ).not.toBeNull();

    // Wer sein Match als Gastgeber verlassen hat (eigene Zeile `fertig`), ist frei.
    await be.aktualisiereMatch(m1!.id, "countdown");
    await be.schreibeMatchStand(k.kinder.arne, m1!.id, "schreiben", "basis", { status: "fertig", lauf: LEER });
    await be.schreibeMatchStand(k.kinder.matti, m1!.id, "schreiben", "basis", { status: "fertig", lauf: LEER });
    expect(await be.erstelleMatch(k.kinder.arne, "schreiben", "basis")).not.toBeNull();
  });

  it("★★★★★ ein abgewiesenes „Bin dabei“ wird NICHT verschluckt: das Kind wird losgelassen, der Satz steht da", async () => {
    const k = await klasse("PGB2");
    const be = brailleBackend();
    // Zwei Geräte desselben Kindes: Gerät B kennt die Zeile von Gerät A nicht.
    const mattiB = haken(k, k.kinder.matti);
    await warte(100);
    const m1 = await be.erstelleMatch(k.kinder.arne, "schreiben", "basis");
    await act(async () => {
      await be.schreibeMatchStand(k.kinder.matti, m1!.id, "schreiben", "basis", { status: "dabei", lauf: LEER });
      await be.aktualisiereMatch(m1!.id, "countdown");
    });
    const m2 = await be.erstelleMatch(k.kinder.lena, "schreiben", "basis");
    await warte(100);
    expect(mattiB.result.current.einladung?.id).toBe(m2!.id);

    await act(async () => {
      mattiB.result.current.beitreten(m2!.id);
    });
    await warte(100);
    expect(mattiB.result.current.meinMatch).toBeNull();
    expect(mattiB.result.current.meldung).toBe(MATCH_SPERRE_DABEI);
  });

  it("★★★★ „Klassenmatch“, während Sarah einlädt ⇒ „Sarah lädt gerade ein. Mitmachen oder selbst einladen?“", async () => {
    const k = await klasse("PGB3");
    const sarah = k.kinder.arne; // Name im Satz: Arne
    await brailleBackend().erstelleMatch(sarah, "schreiben", "basis");
    render(
      <Punktgenau account={k.kinder.matti} accountId={k.kinder.matti.id} classCode={k.code} classSettings={k.settings} />,
    );
    fireEvent.click(await screen.findByRole("button", { name: "Jetzt nicht" }));
    await warte(50);

    fireEvent.click(screen.getByRole("button", { name: /Klassenmatch/ }));
    expect(await screen.findByText("Arne lädt gerade ein. Mitmachen oder selbst einladen?")).toBeInTheDocument();
    expect(screen.queryByText("Klassenmatch ausschreiben")).not.toBeInTheDocument();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Mitmachen" }));

    // „Selbst einladen" ⇒ das gewohnte Fenster; dort entscheidet das Kind weiter.
    fireEvent.click(screen.getByRole("button", { name: "Selbst einladen" }));
    expect(await screen.findByText("Klassenmatch ausschreiben")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Abbrechen" }));
    await warte(50);

    // Noch einmal - diesmal „Mitmachen" ⇒ das Wartefenster.
    fireEvent.click(screen.getByRole("button", { name: /Klassenmatch/ }));
    fireEvent.click(await screen.findByRole("button", { name: "Mitmachen" }));
    expect((await screen.findAllByText(/1 dabei: Matti/)).length).toBeGreaterThan(0);
  });

  it("★★★ die Sätze der Sperre sind wortgleich: Gerät, Server-Hook und Tastenflow", () => {
    const code = readFileSync(resolve(process.cwd(), "pocketbase/pb_hooks/br_match_lib.pb.js"), "utf8");
    const mod: { exports: Record<string, unknown> } = { exports: {} };
    new Function("module", "exports", "require", code)(mod, mod.exports, () => ({}));
    expect(mod.exports.BR_SPERRE_GASTGEBER).toBe(MATCH_SPERRE_GASTGEBER);
    expect(mod.exports.BR_SPERRE_DABEI).toBe(MATCH_SPERRE_DABEI);
    expect(MATCH_SPERRE_GASTGEBER).toBe(TT_SPERRE_GASTGEBER);
    expect(MATCH_SPERRE_DABEI).toBe(TT_SPERRE_DABEI);
  });

  it("★★★★ Server-Zwilling: `brEinKindEinMatch` (Hook) entscheidet wie `matchSperre` (Gerät)", () => {
    const code = readFileSync(resolve(process.cwd(), "pocketbase/pb_hooks/br_match_lib.pb.js"), "utf8");
    const mod: { exports: Record<string, unknown> } = { exports: {} };
    new Function("module", "exports", "require", code)(mod, mod.exports, () => ({}));
    const brEinKindEinMatch = mod.exports.brEinKindEinMatch as (
      app: unknown,
      kind: string,
      klasse: string,
      ausser: string,
    ) => string;

    const jetzt = Date.now();
    const rec = (o: Record<string, string | number>) => ({
      id: String(o.id),
      getString: (f: string) => String(o[f] ?? ""),
      getFloat: (f: string) => Number(o[f] ?? 0),
    });
    const matches: BrailleMatch[] = [
      { id: "m1", classCode: "K", hostUid: "arne", hostName: "Arne", arbeitsweise: "schreiben", bereich: "basis", status: "einladung", startMs: 0, endeMs: 0, dauerMin: 5, createdMs: jetzt },
      { id: "m2", classCode: "K", hostUid: "lena", hostName: "Lena", arbeitsweise: "schreiben", bereich: "basis", status: "laeuft", startMs: jetzt - 1000, endeMs: jetzt + 60_000, dauerMin: 5, createdMs: jetzt },
      { id: "m3", classCode: "K", hostUid: "stephan", hostName: "Stephan", arbeitsweise: "schreiben", bereich: "basis", status: "laeuft", startMs: jetzt - 400_000, endeMs: jetzt - 100_000, dauerMin: 5, createdMs: jetzt },
    ];
    const zeile = (matchId: string, pupilUid: string, status: BrailleMatchStand["status"]) => ({ matchId, pupilUid, status, classCode: "K" });
    const faelle: { name: string; staende: ReturnType<typeof zeile>[]; kind: string; ausser: string }[] = [
      { name: "Gastgeber einer offenen Einladung", staende: [], kind: "arne", ausser: "" },
      { name: "Gastgeber, eigene Zeile fertig", staende: [zeile("m1", "arne", "fertig")], kind: "arne", ausser: "" },
      { name: "dabei in laufendem Match", staende: [zeile("m2", "matti", "schreibt")], kind: "matti", ausser: "m1" },
      { name: "dabei, aber dasselbe Match", staende: [zeile("m2", "matti", "dabei")], kind: "matti", ausser: "m2" },
      { name: "nur eingeladen", staende: [zeile("m2", "matti", "eingeladen")], kind: "matti", ausser: "m1" },
      { name: "abgelehnt", staende: [zeile("m1", "matti", "abgelehnt")], kind: "matti", ausser: "m2" },
      { name: "dabei in abgelaufenem Match", staende: [zeile("m3", "matti", "schreibt")], kind: "matti", ausser: "m1" },
      { name: "Gastgeber eines abgelaufenen Matches", staende: [], kind: "stephan", ausser: "" },
    ];
    for (const f of faelle) {
      const app = {
        findRecordsByFilter: (coll: string, _f: string, _s: string, _l: number, _o: number, p: Record<string, string>) => {
          if (coll === "br_matches") {
            return matches
              .filter((m) => m.classCode === p.c && m.hostUid === p.k && ["einladung", "countdown", "laeuft"].includes(m.status))
              .map((m) => rec({ ...m }));
          }
          return f.staende
            .filter((s) => s.classCode === p.c && s.pupilUid === p.k && (s.status === "dabei" || s.status === "schreibt"))
            .map((s) => rec({ id: `${s.matchId}-${s.pupilUid}`, ...s }));
        },
        findFirstRecordByFilter: (_coll: string, _f: string, p: Record<string, string>) => {
          const s = f.staende.find((z) => z.matchId === p.m && z.pupilUid === p.k);
          if (!s) throw new Error("nicht gefunden");
          return rec({ id: "x", ...s });
        },
        findRecordById: (_coll: string, id: string) => {
          const m = matches.find((x) => x.id === id);
          if (!m) throw new Error("nicht gefunden");
          return rec({ ...m });
        },
      };
      const server = brEinKindEinMatch(app, f.kind, "K", f.ausser);
      const geraet = matchSperre(f.kind, matches, f.staende, jetzt, f.ausser);
      expect(server, f.name).toBe(geraet);
    }
    // Die Fälle müssen beide Seiten treffen - sonst prüft der Zwilling nur Leere.
    expect(matchSperre("arne", matches, [], jetzt)).toBe(MATCH_SPERRE_GASTGEBER);
    expect(matchSperre("matti", matches, [zeile("m2", "matti", "schreibt")], jetzt, "m1")).toBe(MATCH_SPERRE_DABEI);
  });
});

// ── (C) Keine Einladung mitten im Match - aber auf der Rangliste ────────────

describe("(C) Keine Einladung mitten im Match, aber auf der Platzierungsliste", () => {
  async function mattiImLaufendenMatch(code: string) {
    const k = await klasse(code);
    const arne = haken(k, k.kinder.arne);
    const matti = haken(k, k.kinder.matti);
    await warte(100);
    await act(async () => {
      arne.result.current.einladen("schreiben", "basis");
    });
    await warte(100);
    const m1 = arne.result.current.meinMatch!;
    await act(async () => {
      matti.result.current.beitreten(m1.id);
    });
    await warte(100);
    await act(async () => {
      arne.result.current.starten();
    });
    await warte(100);
    return { k, arne, matti, m1 };
  }

  it("★★★★★ Matti schreibt im Match - Lenas neue Einladung erreicht ihn NICHT (Countdown und Lauf)", async () => {
    const { k, matti, m1 } = await mattiImLaufendenMatch("PGC1");
    expect(matti.result.current.meinMatch?.id).toBe(m1.id);
    const m2 = await brailleBackend().erstelleMatch(k.kinder.lena, "schreiben", "basis");
    expect(m2).not.toBeNull();
    await warte(100);
    expect(matti.result.current.phase).toBe("countdown");
    expect(matti.result.current.einladung).toBeNull();
    await warte(MATCH_COUNTDOWN_MS + 1000);
    expect(matti.result.current.phase).toBe("laeuft");
    expect(matti.result.current.einladung).toBeNull();
  });

  it("★★★★★ auch nach einem Neuladen mitten im Lauf: keine Einladung, kein zweites Match", async () => {
    const { k, matti } = await mattiImLaufendenMatch("PGC2");
    await warte(MATCH_COUNTDOWN_MS + 1000);
    const m1 = matti.result.current.meinMatch!;
    await act(async () => {
      matti.result.current.standMelden({ ...LEER, richtig: 4 }, "schreibt");
    });
    const m2 = await brailleBackend().erstelleMatch(k.kinder.lena, "schreiben", "basis");
    // Neu geladen: ein frischer Haken, der von nichts weiss.
    matti.unmount();
    const neu = haken(k, k.kinder.matti);
    await warte(200);
    expect(neu.result.current.meinMatch).toBeNull(); // ein laufendes Match holt ihn nicht zurück (Stand bliebe sonst bei null)
    expect(neu.result.current.einladung).toBeNull();
    expect(m2?.id).not.toBe(m1.id);
    await act(async () => {
      neu.result.current.einladen("schreiben", "basis");
    });
    await warte(100);
    expect(neu.result.current.meldung).toBe(MATCH_SPERRE_DABEI);
  });

  it("★★★★★ nach einem Neuladen im Wartefenster geht das Kind zurück in SEIN Wartefenster", async () => {
    const k = await klasse("PGC3");
    const be = brailleBackend();
    const m1 = await be.erstelleMatch(k.kinder.arne, "schreiben", "basis");
    await be.schreibeMatchStand(k.kinder.matti, m1!.id, "schreiben", "basis", { status: "dabei", lauf: LEER });
    const matti = haken(k, k.kinder.matti);
    await warte(200);
    expect(matti.result.current.meinMatch?.id).toBe(m1!.id);
    expect(matti.result.current.einladung).toBeNull();
  });

  it("★★★★★ ist das Match vorbei, ist das Kind frei - die Einladung kommt auf der Platzierungsliste", async () => {
    const { k, matti, arne } = await mattiImLaufendenMatch("PGC4");
    const m2 = await brailleBackend().erstelleMatch(k.kinder.lena, "schreiben", "basis");
    await warte(MATCH_COUNTDOWN_MS + MATCH_DAUER_MS - 2000);
    expect(matti.result.current.einladung).toBeNull();
    // Die Zeit ist um, die letzte Zeile geschrieben (das tut der Lauf).
    await warte(3000);
    await act(async () => {
      matti.result.current.fertigMelden({ ...LEER, richtig: 9 });
    });
    await warte(100);
    expect(matti.result.current.phase).toBe("fertig");
    expect(matti.result.current.aufRangliste).toBe(true);
    expect(matti.result.current.einladung?.id).toBe(m2!.id);
    // Arne (Gastgeber, ohne eigene „fertig"-Meldung) ist es drei Sekunden nach dem Ende.
    await warte(3500);
    expect(arne.result.current.aufRangliste).toBe(true);
    expect(arne.result.current.einladung?.id).toBe(m2!.id);

    // „Bin dabei" auf der Liste ⇒ das neue Match.
    await act(async () => {
      matti.result.current.beitreten(m2!.id);
    });
    await warte(100);
    expect(matti.result.current.meinMatch?.id).toBe(m2!.id);
    expect(matti.result.current.meldung).toBe("");
  });

  it("★★★★ am Bildschirm: Einladung über „Das Klassenmatch ist vorbei“, „Jetzt nicht“ führt zur Überschrift der Liste", async () => {
    const k = await klasse("PGC5");
    const be = brailleBackend();
    const m1 = await be.erstelleMatch(k.kinder.arne, "schreiben", "basis");
    render(
      <Punktgenau account={k.kinder.matti} accountId={k.kinder.matti.id} classCode={k.code} classSettings={k.settings} />,
    );
    fireEvent.click(await screen.findByRole("button", { name: "Bin dabei" }));
    await act(async () => {
      await be.aktualisiereMatch(m1!.id, "countdown");
    });
    const m2 = await be.erstelleMatch(k.kinder.lena, "schreiben", "basis");
    await warte(MATCH_COUNTDOWN_MS + 1000);
    // Mitten im Lauf: kein Fenster.
    expect(screen.queryByText("Lena lädt dich zu einem Klassenmatch ein.")).not.toBeInTheDocument();
    // ★ Der Lauf beginnt wirklich (bis 02.10.2026 blieb er im Countdown stehen).
    expect(screen.getByText(/Alt \+ X sagt dir/)).toBeInTheDocument();
    await warte(MATCH_DAUER_MS + 4000);
    expect(await screen.findByText("Das Klassenmatch ist vorbei")).toBeInTheDocument();
    expect(await screen.findByText("Lena lädt dich zu einem Klassenmatch ein.")).toBeInTheDocument();
    expect(m2).not.toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Jetzt nicht" }));
    await warte(50);
    expect(document.activeElement).toBe(screen.getByRole("heading", { name: "Das Klassenmatch ist vorbei" }));
  });
});

// ── (D) Der Server-Haken ────────────────────────────────────────────────────

describe("(D) br_match.pb.js - Cron und Verlauf", () => {
  const hook = () => readFileSync(resolve(process.cwd(), "pocketbase/pb_hooks/br_match.pb.js"), "utf8");

  it("★★★★ eine Einladung MIT wartenden Kindern endet erst nach zehn Minuten, nicht nach einer", () => {
    const h = hook();
    expect(h).toContain("const EINLADUNG_MIT_KINDERN_FRIST = 10 * 60 * 1000;");
    const cron = h.slice(h.indexOf('cronAdd("br_match_aufraeumen"'));
    const abschnitt = cron.slice(0, cron.indexOf("// 2)"));
    expect(abschnitt).toContain('st === "dabei" || st === "schreibt"');
    expect(abschnitt).toContain("if (mitKindern) continue;");
  });

  it("★★★ `eingeladen`/`abgelehnt` kommen nicht in den Verlauf", () => {
    expect(hook()).toContain("staende.filter((s) => L.brNimmtTeil(s))");
  });

  it("★★★ Anlegen und Stand-Zeilen fragen die Sperre", () => {
    const h = hook();
    expect(h).toContain('L.brEinKindEinMatch(e.app, kind.id, code, "")');
    expect(h).toContain("L.brStandSperre(e, false)");
    expect(h).toContain("L.brStandSperre(e, true)");
  });
});
