/**
 * Bedienung per Berührung (Handy, Tablet ohne Tastatur).
 *
 * Bis 21.09.2026 war Klangpunkte für die Tastatur gebaut: Die Spielflächen und
 * Hilfsknöpfe waren `aria-hidden`, die Eingabeflächen `role="application"`.
 * Auf dem Handy heisst das: VoiceOver kommt mit Wischen nicht an die Knöpfe,
 * und es gibt keine Tasten zum Schreiben.
 *
 * Die Berührbedienung ist ADDITIV: Tastatur und Tastenkürzel bleiben, sie
 * bekommen nur Knöpfe, die per Wischen und Doppeltippen erreichbar sind.
 */
import { useEffect, useState } from "react";

type MedienQuelle = Pick<Window, "matchMedia"> & { location?: Pick<Location, "search"> };

/**
 * Ist das Gerät ein Berührgerät?
 *
 * Grob-Zeiger (Finger) UND kein Fein-Zeiger (Maus, Trackpad) irgendwo
 * angeschlossen. Ein iPad mit Trackpad zählt damit als Tastaturgerät; das
 * passt, denn dort liegt meist auch eine Tastatur.
 *
 * `?touch=1` / `?touch=0` in der Adresse erzwingt es - zum Ausprobieren am
 * Rechner und für Lehrkräfte, die es am Gerät prüfen wollen.
 */
export function istTouchGeraet(win: MedienQuelle | undefined = typeof window === "undefined" ? undefined : window): boolean {
  if (!win) return false;
  const frage = win.location?.search ?? "";
  if (/[?&]touch=1(&|$)/.test(frage)) return true;
  if (/[?&]touch=0(&|$)/.test(frage)) return false;
  if (typeof win.matchMedia !== "function") return false;
  const grob = win.matchMedia("(pointer: coarse)").matches;
  const fein = win.matchMedia("(any-pointer: fine)").matches;
  return grob && !fein;
}

/** Reagiert darauf, dass ein Zeiger (Maus) an- oder abgesteckt wird. */
export function useTouchBedienung(): boolean {
  const [touch, setTouch] = useState<boolean>(() => istTouchGeraet());
  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const listen = [window.matchMedia("(pointer: coarse)"), window.matchMedia("(any-pointer: fine)")];
    const neu = () => setTouch(istTouchGeraet());
    for (const m of listen) m.addEventListener?.("change", neu);
    return () => {
      for (const m of listen) m.removeEventListener?.("change", neu);
    };
  }, []);
  return touch;
}
