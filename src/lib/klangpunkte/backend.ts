/**
 * Fortschritts-Backend von „Klangpunkte" — nur Spielstand, keine Konten:
 * Anmeldung/Klassen laufen über die GETEILTE Lernwerkstatt-Identität
 * (tt_teachers/tt_pupils, authStore `tt_pb_auth` — via useBrailleAuth).
 *
 * Server-Modus: eigene Zeile im vereinheitlichten Lernwerkstatt-Modell
 * lw_progress mit program="klangpunkte" (unique je (pupilUid, program);
 * die Server-Regeln sind eigentums-basiert — kein Backend-Deploy nötig).
 * Lokal-Modus (VITE_BACKEND ≠ pocketbase): localStorage je Konto.
 */
import PocketBase, { LocalAuthStore } from "pocketbase";
import type { RecordModel } from "pocketbase";
import { emptyKlangProgress, type KlangProgress } from "./progress";
import { backendUrl } from "@/lib/adressen";

const PROGRAM = "klangpunkte";

export interface KlangBackend {
  readonly kind: "local" | "pocketbase";
  getProgress(accountId: string): Promise<KlangProgress>;
  saveProgress(accountId: string, progress: KlangProgress): Promise<void>;
}

class LocalKlangBackend implements KlangBackend {
  readonly kind = "local" as const;

  async getProgress(accountId: string): Promise<KlangProgress> {
    try {
      const raw = localStorage.getItem(`klangpunkte:acct:${accountId}`);
      if (!raw) return emptyKlangProgress();
      return { ...emptyKlangProgress(), ...(JSON.parse(raw) as object) };
    } catch {
      return emptyKlangProgress();
    }
  }

  async saveProgress(accountId: string, progress: KlangProgress): Promise<void> {
    try {
      localStorage.setItem(`klangpunkte:acct:${accountId}`, JSON.stringify(progress));
    } catch {
      /* localStorage nicht verfügbar */
    }
  }
}

class PocketBaseKlangBackend implements KlangBackend {
  readonly kind = "pocketbase" as const;
  private pb: PocketBase;

  constructor() {
    const url = backendUrl();
    // GETEILTER authStore-Schlüssel mit Tastenflow/Punktgenau/eine andere App der Plattform —
    // ein Login für alle Lernwerkstatt-Apps (project_lernwerkstatt_unified).
    this.pb = new PocketBase(url, new LocalAuthStore("tt_pb_auth"));
    this.pb.autoCancellation(false);
  }

  private async findRow(pupilUid: string): Promise<RecordModel | null> {
    try {
      return await this.pb
        .collection("lw_progress")
        .getFirstListItem(
          this.pb.filter("pupilUid={:p} && program={:prog}", {
            p: pupilUid,
            prog: PROGRAM,
          }),
        );
    } catch {
      return null;
    }
  }

  async getProgress(accountId: string): Promise<KlangProgress> {
    const rec = await this.findRow(accountId);
    if (rec?.data) return { ...emptyKlangProgress(), ...(rec.data as object) };
    return emptyKlangProgress();
  }

  async saveProgress(accountId: string, progress: KlangProgress): Promise<void> {
    const classCode = (this.pb.authStore.record?.classCode as string) ?? "";
    const teacherUid = (this.pb.authStore.record?.teacherUid as string) ?? "";
    try {
      const existing = await this.findRow(accountId);
      if (existing) {
        await this.pb
          .collection("lw_progress")
          .update(existing.id, { data: progress, classCode, updatedAtMs: Date.now() });
      } else {
        await this.pb.collection("lw_progress").create({
          pupilUid: accountId,
          program: PROGRAM,
          teacherUid,
          classCode,
          data: progress,
          updatedAtMs: Date.now(),
        });
      }
    } catch {
      // Lehrkraft-Konten dürfen laut Server-Regel keine lw_progress-Zeile
      // anlegen (Kind-eigene Daten) — ihr Übungsstand bleibt dann lokal in
      // dieser Sitzung. Für Kinder schlägt das Speichern praktisch nie fehl.
    }
  }
}

let instance: KlangBackend | null = null;

export function klangBackend(): KlangBackend {
  if (instance) return instance;
  const usePb =
    (import.meta.env.VITE_BACKEND ?? "mock") === "pocketbase" &&
    typeof window !== "undefined";
  instance = usePb ? new PocketBaseKlangBackend() : new LocalKlangBackend();
  return instance;
}

/** Test-Hilfe: Singleton zurücksetzen. */
export function _resetKlangBackend() {
  instance = null;
}
