/**
 * Richtig gemeint, falsch geschrieben - der dritte Ausgang beim Prüfen.
 * ============================================================================
 *
 * ★★★★ DER ANLASS, und er ist ein alter (Johannes, 25.08.2026):
 *
 * > „Beim ersten Beispiel hab ich absichtlich Differenz und Summe falsch
 * > geschrieben, und du hast es als falsch erkannt. Das ist das Problem, von
 * > dem ich schon so viel gesprochen habe. Die Prüfung ist heikel. Ich brauch
 * > eine App, die so pädagogisch ist, dass sie so was erkennt: Also Differenz
 * > stimmt, aber du hast es falsch geschrieben, es gehört so: …"
 *
 * ★★★ EIN KIND, DAS „SUME" SCHREIBT, WEISS DIE ANTWORT. Ihm „falsch" zu sagen
 * ist nicht nur ungerecht, es ist auch die falsche Auskunft: Es lernt daraus,
 * dass es die Rechenart nicht kann - und dabei kann es sie. Was es nicht kann,
 * ist das Wort zu schreiben, und genau das gehört ihm gesagt.
 *
 * ⚠️ IN EINER RECHENAUFGABE IST DIE SCHREIBUNG NICHT DER GEGENSTAND. In einer
 * Rechtschreibaufgabe ist sie es. Darum entscheidet die Aufgabe, nicht dieses
 * Bauteil - hier steht nur, WIE nahe zwei Wörter beieinander liegen.
 *
 * ---------------------------------------------------------------------------
 *
 * ★★★ WARUM DARAUS KEIN ANTWORT-AUTOMAT WIRD - die Sorge liegt nahe:
 * Wenn die App die richtige Schreibung hinschreibt, könnte ein Kind raten, bis
 * sie es tut. Kann es nicht: Der Weg öffnet sich erst, wenn die Eingabe schon
 * bis auf ein oder zwei Zeichen stimmt UND mit demselben Buchstaben beginnt.
 * Wer so nahe dran ist, hat die Antwort gewusst.
 *
 * ★★ UND ES WIRD NIE ETWAS GEGEN DAS KIND GEWERTET
 * ([[feedback_nie_gegen_das_kind]]). Die Meldung sagt zuerst, dass es stimmt.
 */

/**
 * Ein Wort auf seinen Kern bringen: Kleinbuchstaben, ß wird ss, alles, was
 * kein Buchstabe und keine Ziffer ist, fällt weg.
 *
 * ⚠️ Umlaute bleiben Umlaute. „Hoehe" statt „Höhe" ist ein eigener Fehler und
 * kein Tippfehler - er kommt aus der Zeit, als Umlaute in Dateinamen nicht
 * gingen ([[feedback_umlaute_normal]]), und ein Kind soll die Umlauttaste
 * benutzen lernen. Über den Abstand unten wird er trotzdem erkannt.
 */
export function wortkern(s: string): string {
  return s
    .toLowerCase()
    .replace(/ß/g, "ss")
    .replace(/[^a-zäöü0-9]/g, "");
}

/**
 * Doppelte Buchstaben auf einen zusammenziehen: „summe" wird „sume",
 * „differenz" wird „diferenz".
 *
 * ★★ DAS IST DER HÄUFIGSTE DEUTSCHE SCHREIBFEHLER, und er trifft genau die
 * Wörter, um die es hier geht: Summe, Differenz, Quotient, Nenner, Zähler,
 * Millimeter. Wer ihn getrennt behandelt, erkennt ihn auch dann noch, wenn
 * gleich zwei davon in einem Wort stecken - da käme der Abstand unten schon an
 * seine Grenze.
 */
export function ohneDoppelte(s: string): string {
  return s.replace(/(.)\1+/g, "$1");
}

/**
 * Wie viele Zeichen man ändern, einfügen oder löschen muss, um aus a b zu
 * machen (Levenshtein).
 *
 * ⚠️ Zwei Zeilen statt einer ganzen Tabelle - die Wörter sind kurz, aber diese
 * Rechnung läuft bei jedem Prüfen für jede Möglichkeit.
 */
export function abstand(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let vorige = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const jetzt = [i];
    for (let j = 1; j <= b.length; j++) {
      jetzt[j] = Math.min(
        vorige[j] + 1,
        jetzt[j - 1] + 1,
        vorige[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
    vorige = jetzt;
  }
  return vorige[b.length];
}

/**
 * Wie weit ein Wort danebenliegen darf, um noch als Schreibfehler zu gelten.
 *
 * ★★★ ABSICHTLICH KNAPP. Jede Zeichenstelle mehr macht aus einem anderen Wort
 * einen Tippfehler - und dann bekäme ein Kind „stimmt" für etwas, das es nicht
 * gemeint hat. Das ist derselbe Fehler wie der, den wir am 25.08. beim
 * Ersetzen gefunden haben („schlief" für „lief"), nur andersherum.
 */
function spielraum(laenge: number): number {
  if (laenge <= 3) return 0;
  if (laenge <= 8) return 1;
  return 2;
}

export type Wortstand = "richtig" | "schreibfehler" | "falsch";

/**
 * Wie steht die Eingabe zu einem erwarteten Wort?
 *
 * `richtig`       - dasselbe Wort (Groß- und Kleinschreibung zählen nicht).
 * `schreibfehler` - dasselbe Wort gemeint, anders geschrieben.
 * `falsch`        - ein anderes Wort.
 *
 * ★★ DIE ERSTEN BUCHSTABEN MÜSSEN ÜBEREINSTIMMEN. Ein Schreibfehler ändert
 * fast nie den Anfang eines Wortes; ein anderes Wort fast immer. Ohne diese
 * Bedingung läge „Nenner" einen Schritt von „Renner" entfernt und zwei von
 * „Kenner" - und aus einem falschen Wort würde ein Tippfehler.
 */
export function wortstand(eingabe: string, erwartet: string): Wortstand {
  const e = wortkern(eingabe);
  const r = wortkern(erwartet);
  if (!e || !r) return "falsch";
  if (e === r) return "richtig";
  if (e[0] !== r[0]) return "falsch";
  if (ohneDoppelte(e) === ohneDoppelte(r)) return "schreibfehler";
  return abstand(e, r) <= spielraum(r.length) ? "schreibfehler" : "falsch";
}

export interface Wortpruefung {
  stand: Wortstand;
  /**
   * Wie es geschrieben wird - nur bei `schreibfehler`, und in der Schreibung
   * der Aufgabe, nicht in der des Kindes.
   */
  schreibung?: string;
}

/**
 * Die Eingabe gegen MEHRERE gleichwertige Wörter prüfen.
 *
 * ★ Ein richtig geschriebenes Wort schlägt immer ein falsch geschriebenes: Wer
 * „lief" schreibt und „ging", „lief", „wanderte" wären alle richtig, soll nicht
 * hören, er habe sich verschrieben, nur weil „ging" zuerst in der Liste steht.
 */
export function pruefeWort(eingabe: string, erwartete: readonly string[]): Wortpruefung {
  let fast: string | undefined;
  for (const w of erwartete) {
    const stand = wortstand(eingabe, w);
    if (stand === "richtig") return { stand: "richtig" };
    if (stand === "schreibfehler" && fast === undefined) fast = w.trim();
  }
  return fast ? { stand: "schreibfehler", schreibung: fast } : { stand: "falsch" };
}
