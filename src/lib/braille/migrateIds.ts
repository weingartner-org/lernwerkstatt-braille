/**
 * Level-id-Migration — Sicherheitsnetz (anfangs leer, Bauvertrag §6).
 * Reine Funktionen, idempotent. Nur aktivieren, wenn Johannes eine
 * bewusste Umbenennung von Level-ids beschließt (Konzept-Entscheidung 7).
 *
 * Solange ID_RENAMES leer ist, geben alle Funktionen ihre Eingabe unverändert zurück.
 */
import type { BrailleProgress } from "./progress";
import type { TaskEvent } from "./account";

/**
 * Stabile Umbenennungs-Tabelle (alt → neu).
 * Leer = keine Migration aktiv (Default: Level-ids bleiben eingefroren, Bauvertrag §1.1).
 */
export const ID_RENAMES: Record<string, string> = {};

/**
 * Benennt Level-ids in einem Progress-Objekt um.
 * Idempotent: bereits migrierte Stände (alter Key nicht mehr vorhanden) bleiben unverändert.
 * Kollision (neuer Key existiert schon): den Stand mit mehr `attempts` behalten.
 */
export function migrateProgressIds(p: BrailleProgress): BrailleProgress {
  if (Object.keys(ID_RENAMES).length === 0) return p;

  const levels = { ...p.levels };
  const mastery = p.mastery ? { ...p.mastery } : undefined;
  const introduced = p.introduced ? { ...p.introduced } : undefined;

  for (const [oldId, newId] of Object.entries(ID_RENAMES)) {
    // levels
    if (oldId in levels) {
      const existing = levels[newId];
      const migrating = levels[oldId];
      if (existing) {
        levels[newId] =
          (migrating.attempts ?? 0) >= (existing.attempts ?? 0) ? migrating : existing;
      } else {
        levels[newId] = migrating;
      }
      delete levels[oldId];
    }

    // mastery
    if (mastery && oldId in mastery) {
      const existingM = mastery[newId];
      const migratingM = mastery[oldId];
      if (existingM) {
        mastery[newId] =
          (migratingM.window?.length ?? 0) >= (existingM.window?.length ?? 0)
            ? migratingM
            : existingM;
      } else {
        mastery[newId] = migratingM;
      }
      delete mastery[oldId];
    }

    // introduced
    if (introduced && oldId in introduced) {
      if (!(newId in introduced)) {
        introduced[newId] = introduced[oldId];
      }
      delete introduced[oldId];
    }
  }

  return { ...p, levels, mastery, introduced };
}

/**
 * Benennt `level` in einer Event-Liste um.
 * Gibt ein neues Array zurück; Events mit unbekanntem level bleiben unverändert.
 */
export function migrateEventIds(ev: readonly TaskEvent[]): TaskEvent[] {
  if (Object.keys(ID_RENAMES).length === 0) return ev as TaskEvent[];
  return ev.map((e) => {
    const newLevel = ID_RENAMES[e.level];
    return newLevel ? { ...e, level: newLevel } : e;
  });
}
