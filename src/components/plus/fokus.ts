/**
 * Der Fokus nach einem Wechsel - er darf nicht ins Leere fallen.
 *
 * ★ Gemessen am 23.09.2026 im Browser: nach jedem Türwechsel stand der Fokus
 * auf `body`. Wer mit Screenreader liest, verliert damit seine Stelle und muss
 * die Seite von oben neu durchgehen. Der Knopf, den man gedrückt hat, ist ja
 * weg - der Fokus fällt mit ihm.
 *
 * Deshalb bekommt jeder Bereich seine Überschrift als Fokusziel: Ein
 * Screenreader liest sie vor, und damit weiß das Kind, wo es gelandet ist.
 * Die Übung ist die Ausnahme - dort ist das Eingabefeld das Ziel, weil dort
 * gerechnet wird.
 */
import { useEffect, useRef } from "react";

/**
 * Die Überschrift eines Bereichs in den Fokus nehmen.
 *
 * Sie braucht `tabIndex={-1}`: fokussierbar für das Programm, aber nicht im
 * Tabulator-Weg - sonst müsste sich jedes Kind durch die Überschriften tabben.
 */
export function useUeberschriftFokus<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    ref.current?.focus();
  }, []);
  return ref;
}
