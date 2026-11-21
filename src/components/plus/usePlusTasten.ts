/**
 * Die seitenweiten Kürzel von Plus - sie wirken von jeder Stelle der Seite aus.
 *
 *  • Alt + B: die nächste Eingabeart (Zahlen tippen ·
 *    Computerbraille · Mathematikschrift). Keine Ansage hier - das
 *    Eingabefeld sagt die neue Art selbst an, wenn sie sich ändert.
 *  • Alt + Plus / Alt + Minus: Textgröße größer oder kleiner. Alt + 0 setzt
 *    sie zurück. Jeweils mit Ansage „Textgröße ... Prozent".
 *
 * Erkannt wird die Taste (`e.code`), nicht das Zeichen: am Mac macht Alt aus
 * dem b ein „∫", und `e.key` würde dort nicht passen.
 */
import { useEffect, useRef } from "react";
import { useEinstellungen, zoomSatz } from "@/lib/plus/einstellungen";

export function usePlusTasten(ansagen?: (satz: string) => void): void {
  // Die Stimme wird über eine Ref frisch gehalten, damit der Listener nicht
  // bei jedem Rendern neu gesetzt wird.
  const ansagenRef = useRef(ansagen);
  useEffect(() => {
    ansagenRef.current = ansagen;
  }, [ansagen]);

  useEffect(() => {
    const taste = (e: KeyboardEvent) => {
      // Nur Alt - mit Strg oder Meta dazu gehört das Kürzel jemand anderem.
      if (!e.altKey || e.ctrlKey || e.metaKey) return;
      // Hat schon jemand die Taste beansprucht, gehört sie ihm.
      if (e.defaultPrevented) return;
      // ★ Fehler behoben (18.10.2026, Vergleich der Kürzel): Hinter einem offenen
      // Fenster (Hilfe, Passwort …) wechselten Alt + B und die Größe still die
      // Übung dahinter. Nur das Einstellungsfenster lässt sie durch - dort
      // sieht man die Wahl sofort.
      const fenster = document.querySelector<HTMLElement>('[role="dialog"][aria-modal="true"]');
      if (fenster) {
        const titel = document.getElementById(fenster.getAttribute("aria-labelledby") ?? "")?.textContent ?? "";
        if (titel !== "Einstellungen") return;
      }

      const code = e.code;
      // ★ Alt + 8 ist weg (18.10.2026, Johannes): doppelt zu Alt + B, und in
      // Tastenflow heißt Alt + 8 „Klang der Melodie vor".
      const eingabeart = code === "KeyB";
      // ★ Das Minus liegt nicht überall auf `Minus`: auf der deutschen Tastatur
      // ist es die Taste `Slash`, das Plus liegt auf `BracketRight`. Darum
      // zählt auch das Zeichen - mit Alt am Mac kommt aus dem - ein Halbgeviert-
      // strich, aus dem + ein ±.
      const kleiner = code === "Minus" || code === "NumpadSubtract" || ["-", "–", "—", "−"].includes(e.key);
      const groesser = !kleiner && (code === "Equal" || code === "NumpadAdd" || ["+", "±"].includes(e.key));
      const zurueck = code === "Digit0" || code === "Numpad0";
      const eigenes = eingabeart || groesser || kleiner || zurueck;
      if (!eigenes) return;

      // Ein fremder Handler, der schon `preventDefault` gesetzt hat, wird bei
      // einem eigenen Kürzel überstimmt - unser Kürzel gilt immer.
      e.preventDefault();
      const s = useEinstellungen.getState();
      if (eingabeart) {
        s.naechsteEingabeart();
        return;
      }
      if (groesser) s.zoomIn();
      else if (kleiner) s.zoomOut();
      else s.resetZoom();
      ansagenRef.current?.(zoomSatz(useEinstellungen.getState().zoom));
    };

    window.addEventListener("keydown", taste);
    return () => window.removeEventListener("keydown", taste);
  }, []);
}
