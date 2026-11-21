/**
 * eine andere App der Plattform — „Sag mir noch einmal, was ich tun soll" (Etappe E-D).
 *
 * Johannes, 06.08.: „wenn etwas auszuführen ist soll mit doppelklick auf die
 * umschalttaste (wie bei tastenflow) noch einmal angesagt/angezeigt werden was
 * jetzt zu tun ist."
 *
 * ── Warum genau dieser Griff ────────────────────────────────────────────────
 *
 * Der Tastenflow kennt ihn seit dem Textwelt-Umbau: Umschalt zweimal kurz
 * hintereinander sagt dort den Finger an (`TypingSession.tsx`). Dieselbe
 * Handlung, dieselbe Frist (**450 ms**), dieselbe Bedeutung — „hilf mir
 * gerade" ([[feedback_shortcut_konzept]]). Ein Kind, das beide Programme
 * benutzt, muss nichts Neues lernen.
 *
 * Die Umschalttaste ist dafür die richtige: Sie ist auf JEDER Tastatur zweimal
 * vorhanden (links und rechts), groß, gut zu finden — und ein Doppeldruck
 * bedeutet für sich genommen nirgends etwas. Ein weiteres Alt-Kürzel hätte
 * dagegen eine Taste weggenommen und müsste in `isAppShortcut` gepflegt werden.
 *
 * ── Die vier Regeln ─────────────────────────────────────────────────────────
 *
 * 1. **Nur die pure Umschalttaste zählt.** Umschalt+irgendetwas ist ein
 *    Tastendruck des Kindes, kein Ruf nach Hilfe.
 * 2. **`e.repeat` zählt nie.** Eine gehaltene Taste wiederholt sich; niemand
 *    hat zweimal gedrückt.
 * 3. **Jede andere Taste löscht die Erkennung.** Sonst gälte Umschalt … tippen
 *    … Umschalt eine halbe Sekunde später noch als Doppeldruck.
 * 4. **In einem Eingabefeld gilt der Griff nicht** (das entscheidet der
 *    Aufrufer). In einem Namensfeld ist die Umschalttaste das Werkzeug für
 *    Großbuchstaben — dort wäre die Hilfe eine Störung.
 *
 * Reiner Reducer ohne DOM und ohne Uhr: Die Zeit kommt von außen, damit der
 * Wächter sie steuern kann.
 */

/** Frist zwischen den beiden Drücken — dieselbe wie im Tastenflow. */
export const DOPPEL_UMSCHALT_MS = 450;

/**
 * Was der Erkenner sich merkt: der Zeitpunkt des letzten einzelnen
 * Umschalt-Drucks (oder `null`, wenn gerade keiner offen ist).
 */
export type DoppelStand = number | null;

export interface DoppelSchritt {
  /** Der neue Stand. */
  stand: DoppelStand;
  /** true, wenn DIESER Druck den Doppelgriff vollendet hat. */
  ausgeloest: boolean;
}

export interface DoppelEreignis {
  key: string;
  repeat?: boolean;
  ctrlKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
}

/**
 * Einen Tastendruck verarbeiten.
 *
 * @param stand  bisheriger Stand (Zeitpunkt des ersten Drucks oder null)
 * @param e      der Tastendruck
 * @param jetzt  Zeit in Millisekunden
 */
export function doppelUmschaltSchritt(
  stand: DoppelStand,
  e: DoppelEreignis,
  jetzt: number,
): DoppelSchritt {
  if (e.key !== "Shift") {
    // Regel 3: alles andere löscht die Erkennung. Modifier-Tasten für sich
    // (Strg, Alt, Cmd) bleiben davon unberührt — wer Strg schon hält und dann
    // Umschalt drückt, meint ohnehin einen Akkord, und der fällt gleich unten
    // durch die Modifier-Prüfung.
    return { stand: null, ausgeloest: false };
  }
  // Regel 2: eine gehaltene Taste ist kein zweiter Druck — und sie darf den
  // ersten auch nicht löschen.
  if (e.repeat) return { stand, ausgeloest: false };
  // Regel 1: Umschalt MIT einem anderen Modifikator ist ein Akkord.
  if (e.ctrlKey || e.altKey || e.metaKey) return { stand: null, ausgeloest: false };

  if (stand !== null && jetzt - stand < DOPPEL_UMSCHALT_MS) {
    // Vollendet — und der Stand wird geleert, damit ein DRITTER Druck nicht
    // sofort wieder auslöst.
    return { stand: null, ausgeloest: true };
  }
  return { stand: jetzt, ausgeloest: false };
}

/**
 * Wie die Wiederholung eingeleitet wird. Der Satz steht davor, damit ein Kind
 * hört, dass es die ANTWORT auf seinen Griff ist und nicht eine neue Aufgabe.
 */
export const DOPPEL_UMSCHALT_VORSPANN = "Das ist zu tun:";

/** Überschrift der eingeblendeten Fläche. */
export const DOPPEL_UMSCHALT_TITEL = "Das ist jetzt zu tun";

/** Was dasteht, wenn gerade gar keine Aufgabe offen ist. */
export const DOPPEL_UMSCHALT_LEER =
  "Gerade ist keine Aufgabe offen. Sobald eine läuft, sage ich sie dir hier noch einmal.";

/** Der Hinweis, der unter den Übungen steht — einmal formuliert, überall gleich. */
export const DOPPEL_UMSCHALT_HINWEIS =
  "Umschalttaste zweimal: Aufgabe noch einmal";
