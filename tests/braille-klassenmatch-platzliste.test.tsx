/**
 * Johannes 13.11.2026: „bau das auch in Punktgenau ein" - wie in Tastenflow
 * (Tester): Alt + P sagt im laufenden Klassenmatch alle Plätze an.
 * ⚠️ In Punktgenau heißt Alt + P sonst „Pause" (PunktgenauPage.tsx). Im
 * laufenden Match gibt es keine Pause - die Match-Uhr liefe weiter -, darum
 * gehört die Taste dort der Platzliste und die Pause bleibt aus.
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { BrailleKlassenmatchLauf } from "@/components/braille/BrailleKlassenmatchLauf";
import { AREAS } from "@/lib/braille/areas";
import { emptyProgress } from "@/lib/braille/progress";
import { matchPlatzliste, rangliste, type BrailleMatch, type BrailleMatchStand } from "@/lib/braille/klassenmatch";
import type { BrailleAccount } from "@/lib/braille/account";
import type { BrailleKlassenmatchStand } from "@/components/braille/useBrailleKlassenmatch";

const jetzt = Date.now();
const MATCH: BrailleMatch = {
  id: "m1", classCode: "K1", hostUid: "mia", hostName: "Mia", arbeitsweise: "schreiben", bereich: "basis",
  status: "laeuft", startMs: jetzt - 60_000, endeMs: jetzt + 240_000, dauerMin: 5, createdMs: jetzt - 90_000,
} as BrailleMatch;
const stand = (uid: string, name: string, richtig: number): BrailleMatchStand => ({
  id: uid, matchId: "m1", classCode: "K1", pupilUid: uid, name, status: "schreibt", updatedMs: jetzt,
  lauf: { arbeitsweise: "schreiben", bereich: "basis", arbeitszeitMs: 60_000, ansageMs: 0, richtig, falsch: 0 },
} as BrailleMatchStand);
const STAENDE = [stand("mia", "Mia", 30), stand("ben", "Ben", 20), stand("lea", "Lea", 10), stand("toprak", "Toprak", 5)];
const SARAH = { id: "sarah", name: "Sarah", role: "schueler", classCode: "K1" } as unknown as BrailleAccount;

function baue() {
  const km = { staende: STAENDE, binGastgeber: false, standMelden: vi.fn(), fertigMelden: vi.fn(), mittendrinVerlassen: vi.fn(), meinMatch: MATCH, phase: "laeuft" } as unknown as BrailleKlassenmatchStand;
  return render(
    <BrailleKlassenmatchLauf match={MATCH} klassenmatch={km} account={SARAH} areas={AREAS} progress={emptyProgress()}
      grossschreibzeichen={false} onErgebnis={vi.fn()} onTextFertig={vi.fn()} onTask={vi.fn()} onAnnounce={vi.fn()} onWeiter={vi.fn()} />,
  );
}

afterEach(cleanup);

describe("Punktgenau-Klassenmatch: Platzliste (Alt + P)", () => {
  it("nennt alle Plätze", () => {
    expect(matchPlatzliste(rangliste(STAENDE, "schreiben"))).toBe("1. Mia, 2. Ben, 3. Lea, 4. Toprak.");
  });

  it("Alt + P sagt im laufenden Match alle Plätze an - und die Seite bekommt die Taste nicht (keine Pause)", async () => {
    const seite = vi.fn();
    document.addEventListener("keydown", seite);
    const { container } = baue();
    fireEvent.keyDown(document.body, { altKey: true, code: "KeyP", key: "p" });
    await waitFor(() => {
      const t = Array.from(container.querySelectorAll("[aria-live]")).map((b) => b.textContent ?? "").join(" ");
      for (const n of ["Mia", "Ben", "Lea", "Toprak", "Sarah"]) expect(t).toMatch(new RegExp(`\\d\\. ${n}`));
    });
    expect(seite).not.toHaveBeenCalled();
    document.removeEventListener("keydown", seite);
  });
});
