/**
 * ★★★ DIE AUFGABE STEHT AUF DER BRAILLEZEILE (Johannes 07.10.2026: „in
 * punktgenau steht nicht auf der zeile was geschrieben werden soll, das ist
 * aber wichtig, mach es so wie in tastenflow").
 *
 * Wie in Tastenflow ist das Schreibfeld ein Textfeld, dessen WERT die Aufgabe
 * ist. Die Braillezeile zeigt damit den Text, der zu schreiben ist, und der
 * Schreibzeiger steht an der Stelle, die als Nächstes dran ist.
 *
 * Diese Datei rechnet nur aus, WO der Zeiger im Text steht - aus der Zahl der
 * schon geschriebenen Zellen. Das ist nicht 1:1: Ein Großbuchstabe braucht zwei
 * Zellen (Großschreibzeichen + Buchstabe), „sch" in Vollschrift nur eine.
 */
import { BLANK, cellToUnicode, type Cell } from "./cell";

/**
 * Stelle des Schreibzeigers im Text (0 = vor dem ersten Zeichen).
 *
 * - Die Wörter werden an den Lücken gezählt: Jede Leer-Zelle im Ziel ist ein
 *   Leerzeichen im Text. So stimmt der Wortanfang in JEDEM System, auch in der
 *   Kurzschrift.
 * - Innerhalb des Wortes rückt der Zeiger erst, wenn die Zellen eines
 *   Zeichens VOLLSTÄNDIG geschrieben sind (`zellenFuer` übersetzt den Anfang
 *   des Wortes). Ohne `zellenFuer` (Kurzschrift - die Übersetzung kommt erst
 *   später vom Server) bleibt er am Wortanfang.
 */
export function zeigerImText(
  text: string,
  ziel: readonly Cell[],
  geschrieben: number,
  zellenFuer?: (wortAnfang: string) => readonly Cell[],
): number {
  if (geschrieben <= 0) return 0;
  if (geschrieben >= ziel.length) return text.length;

  // Welches Wort, wie viele Zellen davon schon?
  let wort = 0;
  let wortBeginnZelle = 0;
  for (let i = 0; i < geschrieben; i++) {
    if (ziel[i] === BLANK) {
      wort++;
      wortBeginnZelle = i + 1;
    }
  }
  const imWort = geschrieben - wortBeginnZelle;

  const woerter = [...text.matchAll(/\S+/g)];
  const treffer = woerter[wort];
  if (!treffer) return text.length;
  const start = treffer.index ?? 0;
  if (imWort === 0 || !zellenFuer) return start;

  // Wortende im Ziel: bis zur nächsten Lücke.
  let wortEndeZelle = wortBeginnZelle;
  while (wortEndeZelle < ziel.length && ziel[wortEndeZelle] !== BLANK) wortEndeZelle++;
  const zielWort = ziel.slice(wortBeginnZelle, wortEndeZelle);

  // Der längste Wortanfang, dessen Zellen genau den Anfang des Ziels bilden
  // und schon ganz geschrieben sind.
  const w = treffer[0];
  let beste = 0;
  for (let p = 1; p <= w.length; p++) {
    let zellen: readonly Cell[];
    try {
      zellen = zellenFuer(w.slice(0, p));
    } catch {
      continue;
    }
    if (zellen.length > imWort) continue;
    let passt = true;
    for (let k = 0; k < zellen.length; k++) {
      if (zellen[k] !== zielWort[k]) {
        passt = false;
        break;
      }
    }
    if (passt) beste = p;
  }
  return start + beste;
}

/** Punkt 7 allein - der Platzhalter für eine noch nicht geschriebene Zelle. */
export const PUNKT_7 = String.fromCodePoint(0x2840);

/**
 * ★★★ KURZSCHRIFT: WIE VIELE ZELLEN HAT DIE GEKÜRZTE FORM? (Johannes
 * 07.10.2026: „bei kurzschrift muss der schüler auf der braillezeile sehen
 * wieviel zeichen die gekürzte ausgabe hat mit dem 7er punkt").
 *
 * Hinter dem Wort, das dran ist, stehen nach drei Leerzeichen so viele Zellen,
 * wie die gekürzte Form hat: geschriebene als sie selbst, fehlende als Punkt 7.
 * „Haus" mit einer geschriebenen Zelle: „Haus", drei Leerzeichen, das h, zweimal
 * Punkt 7. Der Zeiger steht auf der
 * nächsten Zelle. Beim Text steht die Gruppe mitten in der Zeile, direkt hinter
 * dem aktuellen Wort - dort, wo die Finger gerade sind.
 */
export function kurzschriftZeile(
  text: string,
  ziel: readonly Cell[],
  eingabe: readonly Cell[],
): { wert: string; zeiger: number } {
  if (ziel.length === 0) return { wert: text, zeiger: 0 };
  const geschrieben = Math.min(eingabe.length, ziel.length);

  let wort = 0;
  let wortBeginnZelle = 0;
  for (let i = 0; i < geschrieben; i++) {
    if (ziel[i] !== BLANK) continue;
    // Am Ende des Textes bleibt das letzte Wort stehen.
    if (i === ziel.length - 1) break;
    wort++;
    wortBeginnZelle = i + 1;
  }
  let wortEndeZelle = wortBeginnZelle;
  while (wortEndeZelle < ziel.length && ziel[wortEndeZelle] !== BLANK) wortEndeZelle++;

  let gruppe = "";
  for (let k = wortBeginnZelle; k < wortEndeZelle; k++) {
    gruppe += k < geschrieben ? cellToUnicode(eingabe[k]) : PUNKT_7;
  }
  const imWort = Math.min(geschrieben - wortBeginnZelle, wortEndeZelle - wortBeginnZelle);

  const treffer = [...text.matchAll(/\S+/g)][wort];
  if (!treffer) {
    const vor = `${text}   `;
    return { wert: vor + gruppe, zeiger: vor.length + imWort };
  }
  const ende = (treffer.index ?? 0) + treffer[0].length;
  const vor = `${text.slice(0, ende)}   `;
  const nach = text.slice(ende).replace(/^\s+/, "");
  return {
    wert: vor + gruppe + (nach ? `   ${nach}` : ""),
    zeiger: vor.length + imWort,
  };
}
