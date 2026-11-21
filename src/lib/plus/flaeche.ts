/**
 * Das Grün von Plus - gilt, solange Plus offen ist.
 *
 * ★ Johannes, 16.10.2026 („A2 neu"): Die Übung trägt das Grün des Zeichens
 * (#1F8427) statt des Blaus der Suite. Die Farbwerte stehen in `src/index.css`
 * unter `.plus-flaeche`; hier wird nur die Klasse an `<html>` gesetzt und beim
 * Verlassen der Seite wieder weggenommen - sonst bliebe Tastenflow grün.
 * An `<html>` statt an der Seite, damit auch das Zahnrad und die Hilfe, die
 * ausserhalb der Seite zeichnen, dieselben Farben tragen.
 *
 * Nur in Hell und Dunkel: die fünf Kontrastmodi tragen ihre eigene Palette.
 */
import { useEffect } from "react";

export const PLUS_FLAECHE_KLASSE = "plus-flaeche";

export function usePlusFlaeche(): void {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add(PLUS_FLAECHE_KLASSE);
    return () => root.classList.remove(PLUS_FLAECHE_KLASSE);
  }, []);
}
