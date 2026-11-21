/**
 * Brailleeingabe - die Mechanik: Tasten werden zu Punkten, Punkte zu Zeichen.
 *
 * Ein Kind kann im Eingabefeld auf Brailleeingabe umschalten und dann so
 * tippen, wie es auf einer Punktschriftmaschine schreibt: mehrere Tasten
 * gleichzeitig, ein Griff ist ein Zeichen. Die Belegung ist die uebliche
 * Perkins-Anordnung auf der deutschen Tastatur.
 *
 *     Punkt 1 = F    Punkt 4 = J
 *     Punkt 2 = D    Punkt 5 = K
 *     Punkt 3 = S    Punkt 6 = L
 *     Punkt 7 = A    Punkt 8 = Ö        (nur in Computerbraille)
 *
 * Diese Datei kennt KEINE Bedeutung. Sie macht aus einem Griff ein
 * Braillezeichen - was das Zeichen bedeutet, entscheiden die Tabellen in
 * `computerbraille.ts` und `marburger.ts`. Die Trennung ist Absicht: die
 * Mechanik ist überall gleich, die Bedeutung nicht.
 */

/** Die Tastenbelegung. Kleinbuchstaben, wie `event.key` sie liefert. */
export const TASTE_ZU_PUNKT: Record<string, number> = {
  f: 1, d: 2, s: 3, j: 4, k: 5, l: 6, a: 7, "ö": 8,
};

/** Alle Tasten, die in der Brailleeingabe einen Punkt bedeuten. */
export const BRAILLE_TASTEN = Object.keys(TASTE_ZU_PUNKT);

/**
 * Aus einer Punktmenge das Unicode-Braillezeichen.
 *
 * Unicode legt die Punkte als Bitmuster ab: Punkt 1 ist das unterste Bit,
 * Punkt 8 das achte. U+2800 ist das leere Zeichen.
 */
export function punkteZuZeichen(punkte: Iterable<number>): string {
  let bits = 0;
  for (const p of punkte) {
    if (p < 1 || p > 8) throw new Error(`Punkt ${p} gibt es nicht - erlaubt sind 1 bis 8.`);
    bits |= 1 << (p - 1);
  }
  return String.fromCodePoint(0x2800 + bits);
}

/** Der umgekehrte Weg: aus einem Braillezeichen die Punkte, aufsteigend. */
export function zeichenZuPunkte(zeichen: string): number[] {
  const code = zeichen.codePointAt(0) ?? 0;
  if (code < 0x2800 || code > 0x28ff) return [];
  const bits = code - 0x2800;
  const punkte: number[] = [];
  for (let p = 1; p <= 8; p++) if (bits & (1 << (p - 1))) punkte.push(p);
  return punkte;
}

/** Die Punktschreibweise, wie sie in den Regelwerken steht: „3-4-5-6". */
export function punkteText(punkte: Iterable<number>): string {
  const liste = [...punkte].sort((a, b) => a - b);
  return liste.length ? liste.join("-") : "leer";
}

/** Aus „3-4-5-6" wieder eine Punktmenge - für Tabellen und Tests. */
export function textZuPunkte(text: string): number[] {
  if (!text || text === "leer") return [];
  return text.split("-").map((t) => {
    const n = Number(t);
    if (!Number.isInteger(n) || n < 1 || n > 8) throw new Error(`„${text}" ist keine Punktangabe.`);
    return n;
  });
}

/* ------------------------------------------------------------------ */
/* Der Griff                                                            */
/* ------------------------------------------------------------------ */

/**
 * Ein Griff sammelt Tasten, solange mindestens eine gedrueckt ist, und gibt
 * das Zeichen ab, wenn die letzte losgelassen wird.
 *
 * ★ Warum beim Loslassen und nicht beim Druecken: Kinder treffen die Tasten
 * eines Griffs nie gleichzeitig. Wer beim ersten Tastendruck abgibt, schreibt
 * aus einem beabsichtigten Punkt 1-4-5 drei einzelne Zeichen.
 *
 * ★ Warum die HOECHSTE Punktzahl zaehlt und nicht die zuletzt gedrueckte:
 * wer die Tasten ungleichmaessig loslaesst, soll trotzdem den ganzen Griff
 * bekommen. Gesammelt wird deshalb, was waehrend des Griffs irgendwann
 * gedrueckt war.
 */
export class Griff {
  private gedrueckt = new Set<number>();
  private gesammelt = new Set<number>();

  /** Eine Taste wurde gedrueckt. Gibt zurueck, ob sie zur Brailleeingabe gehoert. */
  nieder(taste: string): boolean {
    const punkt = TASTE_ZU_PUNKT[taste.toLowerCase()];
    if (!punkt) return false;
    this.gedrueckt.add(punkt);
    this.gesammelt.add(punkt);
    return true;
  }

  /**
   * Eine Taste wurde losgelassen. Ist es die letzte des Griffs, kommt das
   * fertige Zeichen zurueck - sonst `null`.
   */
  hoch(taste: string): string | null {
    const punkt = TASTE_ZU_PUNKT[taste.toLowerCase()];
    if (!punkt) return null;
    this.gedrueckt.delete(punkt);
    if (this.gedrueckt.size > 0) return null;
    const zeichen = this.gesammelt.size ? punkteZuZeichen(this.gesammelt) : null;
    this.gesammelt.clear();
    return zeichen;
  }

  /** Alles fallen lassen - beim Verlassen des Feldes oder beim Umschalten. */
  loslassen(): void {
    this.gedrueckt.clear();
    this.gesammelt.clear();
  }

  /** Laeuft gerade ein Griff? */
  get laeuft(): boolean {
    return this.gedrueckt.size > 0;
  }

  /** Was bisher gesammelt ist - fuer die Anzeige waehrend des Griffs. */
  get stand(): number[] {
    return [...this.gesammelt].sort((a, b) => a - b);
  }
}

/** Das Leerzeichen in Braille: keine Punkte. */
export const BRAILLE_LEER = punkteZuZeichen([]);
