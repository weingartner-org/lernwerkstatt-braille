/**
 * Rätsel für Plus - gemeinsame Helfer.
 *
 * ★ Eigene Datei, damit jede Rätselart (`detektiv.ts`, `buchstaben.ts`, …) nur
 * das importiert, was sie wirklich braucht, und die Namensliste an einer
 * Stelle gepflegt wird.
 */

/**
 * Namen für Logikrätsel und Textaufgaben - kurz, Mädchen und Buben, aus
 * verschiedenen Herkünften. Keine Ziffern, keine Sonderzeichen: die Bank für
 * das Sitzbank-Rätsel und der Vergleich für das Logikrätsel brauchen nur den
 * Namen selbst.
 */
export const NAMEN: readonly string[] = [
  "Mia", "Ben", "Zoe", "Anna", "Cem", "Lukas", "Sara", "Noah", "Elif", "Paul",
  "Lea", "Omar", "Nina", "Jonas", "Aylin", "Felix", "Amina", "Tom", "Ivan", "Lara",
];

/**
 * Ein Rätsel bauen, ohne die schon bekannte Angabe zu wiederholen - solange
 * es anders geht (`raetselFuer`, JSDoc zu `bekannt`). `bauen` liest bei jedem
 * Versuch neue Zufallszahlen; das ist gewollt, damit dieselbe Saat nicht in
 * eine Endlosschleife läuft.
 */
export function ohneWiederholung<A extends { angabe: string }>(
  bekannt: readonly string[] | undefined,
  bauen: () => A,
  versuche = 30,
): A {
  let letzte: A | null = null;
  for (let i = 0; i < versuche; i++) {
    letzte = bauen();
    if (!bekannt?.includes(letzte.angabe)) return letzte;
  }
  // ★ Alle Versuche liefern eine schon bekannte Angabe (sehr kleiner
  // Zahlenraum, viele bekannte Rätsel) - dann lieber wiederholen als gar
  // kein Rätsel zeigen.
  return letzte!;
}

/**
 * Mehrere Lücken in einer Zeile, die das Kind der Reihe nach ausfüllt
 * (Zahlenmauer-Konvention, siehe `formen.ts`, Fall `mauer`): Leerzeichen,
 * Komma oder „und" gelten alle.
 */
export function mehrereLuecken(werte: readonly (string | number)[]): { loesung: string; auchRichtig: string[] } {
  const s = werte.map(String);
  return { loesung: s.join(" und "), auchRichtig: [s.join(", "), s.join(" ")] };
}

/** Alle Anordnungen einer Liste - für die Brute-Force-Prüfung der Logikrätsel. */
export function alleAnordnungen<T>(liste: readonly T[]): T[][] {
  if (liste.length <= 1) return [liste.slice()];
  const ergebnis: T[][] = [];
  for (let i = 0; i < liste.length; i++) {
    const rest = liste.slice(0, i).concat(liste.slice(i + 1));
    for (const folge of alleAnordnungen(rest)) ergebnis.push([liste[i], ...folge]);
  }
  return ergebnis;
}

export function fakultaet(n: number): number {
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

export function binomial(n: number, k: number): number {
  return Math.round(fakultaet(n) / (fakultaet(k) * fakultaet(n - k)));
}
