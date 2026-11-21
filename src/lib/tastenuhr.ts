/**
 * DIE TASTENUHR - Übezeit für ALLE Programme (21.09.2026)
 * ============================================================================
 * Johannes, 21.09.2026: *„wenn jemand mehrere Sekunden keine Taste drückt, zählt
 * das nicht zur Übezeit - Programm geöffnet ist kein Üben. Überall so werten wie
 * bei der Tastenflow-Übezeit."*
 *
 * ── Was Tastenflow tut (`typing/practiceClock.ts`) ─────────────────────────
 * Jeder Anschlag hält die Uhr bis zur Pausentoleranz danach am Laufen; folgt
 * innerhalb dieser Spanne der nächste, läuft sie nahtlos weiter. Die Uhr ist die
 * VEREINIGUNG der Intervalle [Anschlag, Anschlag + Toleranz] - rein aus
 * Zeitstempeln gerechnet, ohne Hintergrund-Timer. Diese Datei ist dieselbe
 * Rechnung, nur ohne Tastenflows Innereien (Konto, Wochenziel, Lehrkraft-Rhythmus)
 * und deshalb für jedes Programm brauchbar.
 *
 * ── Warum die Toleranz hier eine EIGENE Zahl ist ───────────────────────────
 * `practiceClock.ts` zieht `typing/account` mit (Konten, PocketBase). Diese Uhr
 * läuft in jedem Programm und in der Reichweiten-Meldung; ein solcher Import
 * risikiert genau den Ring, der am 08.09.2026 die Verwaltungsseite zerlegt hat
 * („Cannot access 'x' before initialization"). Darum steht die Zahl zweimal da -
 * und `tests/tastenuhr.test.ts` vergleicht beide, damit sie nicht auseinander
 * laufen ([[feedback_zwei_stellen_die_voneinander_nichts_wissen]]).
 * Die Toleranz ist bewusst FEST: Tastenflow rechnet sie je Kind (5-60 s) aus dem
 * Tempo der Zeilenwechsel; hier gibt es keine Zeilen, aus denen sich das rechnen
 * ließe. 20 s ist Tastenflows Voreinstellung.
 *
 * ── Was als „Anschlag" zählt ───────────────────────────────────────────────
 * Eine Taste (nicht ihr Dauerdruck), eine Eingabe (Bildschirmtastatur, IME) und
 * ein Tippen oder Klicken (Tablets ohne Tastatur). NICHT: Mausbewegung, Scrollen,
 * ein offener Tab. Wer die Seite nur offen lässt, übt nicht.
 *
 * ── Mehrere Leser, eine Uhr ────────────────────────────────────────────────
 * Zwei Stellen brauchen die Zeit und dürfen sie einander nicht wegnehmen: die
 * Tagesbilanz der Nicht-Angemeldeten (`reichweiteApp`) und die Ereignisse der
 * angemeldeten Kinder. Jeder hat einen eigenen {@link leser} mit eigener Marke.
 */

/** Pausentoleranz in ms. MUSS `IDLE_CAP_MS` aus `typing/practiceClock.ts` gleichen. */
export const TASTEN_TOLERANZ_MS = 20_000;

export interface Tastenuhr {
  /** Ein Anschlag zur Zeit `jetzt`. */
  anschlag(jetzt?: number): void;
  /** Gesamte Tastenzeit seit Beginn (ms), gerechnet bis `jetzt`. */
  gesamt(jetzt?: number): number;
  /**
   * Ein unabhängiger Leser: liefert bei jedem Aufruf die Tastenzeit seit SEINEM
   * letzten Aufruf. Beginnt bei der Tastenzeit von jetzt - was vorher lief, gehört
   * nicht ihm.
   */
  leser(jetzt?: number): (jetzt?: number) => number;
}

export function makeTastenuhr(toleranz: number = TASTEN_TOLERANZ_MS): Tastenuhr {
  let summe = 0; // fertige Abschnitte
  let start = -1; // Beginn des laufenden Abschnitts (-1: keiner)
  let ende = -1; // letzter Anschlag + Toleranz

  const gesamt = (jetzt: number = Date.now()): number => {
    if (start < 0) return summe;
    return summe + Math.max(0, Math.min(jetzt, ende) - start);
  };

  return {
    anschlag(jetzt: number = Date.now()) {
      if (start >= 0 && jetzt <= ende) {
        ende = jetzt + toleranz; // nahtlos weiter
        return;
      }
      if (start >= 0) summe += ende - start; // der alte Abschnitt ist zu Ende
      start = jetzt;
      ende = jetzt + toleranz;
    },
    gesamt,
    leser(jetzt: number = Date.now()) {
      let marke = gesamt(jetzt);
      return (bis: number = Date.now()) => {
        const g = gesamt(bis);
        const zuwachs = Math.max(0, g - marke);
        marke = g;
        return zuwachs;
      };
    },
  };
}

// ── Die eine Uhr dieses Browsers ────────────────────────────────────────────
let uhr = makeTastenuhr();
let anschluesse = 0;
let abbauen: (() => void) | null = null;
let ereignisLeser: ((jetzt?: number) => number) | null = null;

/**
 * Die Uhr ans Dokument hängen. Ein Aufruf je Seite, die sie braucht; gezählt wird
 * mit, sodass die Horcher erst wieder wegkommen, wenn die letzte Seite geht.
 * @returns Die Funktion zum Abhängen.
 */
export function tastenuhrAnschliessen(): () => void {
  if (typeof document === "undefined") return () => {};
  anschluesse++;
  if (anschluesse === 1) {
    const beiTaste = (e: KeyboardEvent) => {
      if (e.repeat) return; // eine gehaltene Taste ist kein neuer Anschlag
      uhr.anschlag();
    };
    const beiAnderem = () => uhr.anschlag();
    // capture: Die Uhr soll auch Anschläge sehen, die eine Seite mit stopPropagation abfängt.
    document.addEventListener("keydown", beiTaste, true);
    document.addEventListener("input", beiAnderem, true);
    document.addEventListener("pointerdown", beiAnderem, true);
    abbauen = () => {
      document.removeEventListener("keydown", beiTaste, true);
      document.removeEventListener("input", beiAnderem, true);
      document.removeEventListener("pointerdown", beiAnderem, true);
    };
    // Der Leser der Ereignisse beginnt MIT dem Anschluss: Was vor dem Öffnen einer
    // Übungsseite lief, gehört zu keinem Ereignis.
    ereignisLeser = uhr.leser();
  }
  let offen = true;
  return () => {
    if (!offen) return;
    offen = false;
    anschluesse = Math.max(0, anschluesse - 1);
    if (anschluesse === 0 && abbauen) {
      abbauen();
      abbauen = null;
      ereignisLeser = null;
    }
  };
}

/** Einen eigenen Leser der Browser-Uhr holen (für die Tagesbilanz der Nicht-Angemeldeten). */
export function tastenzeitLeser(): (jetzt?: number) => number {
  return uhr.leser();
}

/**
 * Die Tastenzeit seit dem letzten Ereignis - für das nächste Übungsereignis eines
 * angemeldeten Kindes (`activeMs`, dasselbe Feld wie bei Tastenflow).
 *
 * @returns `undefined`, wenn keine Seite die Uhr angeschlossen hat: Dann wurde
 *   nichts gemessen, und `0` würde behaupten, das Kind habe nicht geübt.
 */
export function tastenzeitFuerEreignis(jetzt?: number): number | undefined {
  if (!ereignisLeser) return undefined;
  return Math.round(ereignisLeser(jetzt));
}

/**
 * Ein Übungsereignis um seine Tastenzeit ergänzen (`activeMs`). Die EINE Stelle, an
 * der Punktgenau und eine andere App der Plattform das tun - zwei Kopien wären zwei Gelegenheiten, dass
 * eine davon etwas anderes rechnet.
 *
 * Ohne angeschlossene Uhr oder mit schon gesetztem `activeMs` kommt das Ereignis
 * UNVERÄNDERT zurück: nichts gemessen ist nicht dasselbe wie 0.
 */
export function mitTastenzeit<T extends { activeMs?: number }>(event: T, jetzt?: number): T {
  if (typeof event.activeMs === "number") return event;
  const activeMs = tastenzeitFuerEreignis(jetzt);
  return activeMs === undefined ? event : { ...event, activeMs };
}

/** Nur für Tests: alles auf Anfang. */
export function tastenuhrZuruecksetzen(): void {
  abbauen?.();
  abbauen = null;
  anschluesse = 0;
  ereignisLeser = null;
  uhr = makeTastenuhr();
}
