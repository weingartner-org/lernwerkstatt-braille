/**
 * Ich gegen früher - der Vergleich mit sich selbst.
 *
 * Entwurf 16.10.2026. Die Statistik zeigt, was besser geworden ist: „Vor
 * 2 Wochen: 3 von 8 richtig. Letzter Lauf: 8 von 8 richtig."
 *
 * ★ Nur Fortschritt, nie Rückschritt. Wo es nicht besser geworden ist, steht
 * nichts - kein „schlechter als früher". Wertungen dienen dem Lernen, nicht
 * der Beurteilung.
 *
 * ★ Nur mit sich selbst. Kein Vergleich mit der Klasse, keine Reihung.
 * Die Zahlen liegen im Fortschritt des Kindes (`verlauf`) und werden dem
 * Kind in „Meine Statistik" gezeigt; der Reiter der Lehrkraft rechnet sie
 * nicht mit.
 *
 * ★ „Früher" heißt mindestens drei Tage her. Zwei Läufe am selben Nachmittag
 * sind kein Vergleich, sondern Zufall.
 */
import { sitzt } from "./coach";
import type { Stand } from "./coach";
import type { Verlauf } from "./fortschritt";
import { paket } from "./stoffplan";

export const MIN_ABSTAND_TAGE = 3;
const MAX_JE_GRUPPE = 3;

export interface RueckblickZeile {
  id: string;
  name: string;
  /** „Vor 2 Wochen: 3 von 8 richtig. Letzter Lauf: 8 von 8 richtig." */
  satz: string;
}

export interface Rueckblick {
  /** Früher wacklig, jetzt sitzt es. */
  sitztJetzt: RueckblickZeile[];
  /** Besser geworden, aber noch nicht ganz. */
  wirdBesser: RueckblickZeile[];
}

/** „Vor 5 Tagen", „Vor 2 Wochen", „Vor 3 Monaten". */
export function vorWie(tage: number): string {
  if (tage < 14) return `Vor ${tage} Tagen`;
  if (tage < 60) {
    const w = Math.round(tage / 7);
    return `Vor ${w} Wochen`;
  }
  const m = Math.round(tage / 30);
  return `Vor ${m} Monaten`;
}

function quote(r: { richtige: number; gesamt: number }): number {
  return r.gesamt > 0 ? r.richtige / r.gesamt : 0;
}

export function rueckblick(
  verlauf: Record<string, Verlauf>,
  stand: Stand,
  heute: number,
): Rueckblick {
  const sitztJetzt: RueckblickZeile[] = [];
  const wirdBesser: RueckblickZeile[] = [];
  for (const [id, v] of Object.entries(verlauf)) {
    let name: string;
    try { name = paket(id).name; } catch { continue; }
    if (heute - v.erst.tag < MIN_ABSTAND_TAGE) continue;
    if (v.jetzt.tag <= v.erst.tag) continue;
    // Besser heißt: mindestens zwei Aufgaben mehr richtig, im selben Maß gemessen.
    const vorher = quote(v.erst);
    const nachher = quote(v.jetzt);
    if (nachher - vorher < 2 / Math.max(v.jetzt.gesamt, 1)) continue;
    const satz =
      `${vorWie(heute - v.erst.tag)}: ${v.erst.richtige} von ${v.erst.gesamt} richtig. ` +
      `Letzter Lauf: ${v.jetzt.richtige} von ${v.jetzt.gesamt} richtig.`;
    const zeile = { id, name, satz };
    if (sitzt(stand, id) && vorher < 0.75) sitztJetzt.push(zeile);
    else wirdBesser.push(zeile);
  }
  // Der größte Sprung zuerst - das ist der, über den man sich freut.
  const sprung = (z: RueckblickZeile) => {
    const v = verlauf[z.id];
    return quote(v.jetzt) - quote(v.erst);
  };
  sitztJetzt.sort((a, b) => sprung(b) - sprung(a));
  wirdBesser.sort((a, b) => sprung(b) - sprung(a));
  return { sitztJetzt: sitztJetzt.slice(0, MAX_JE_GRUPPE), wirdBesser: wirdBesser.slice(0, MAX_JE_GRUPPE) };
}
