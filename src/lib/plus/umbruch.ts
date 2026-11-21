/**
 * Der Zeilenumbruch im Eingabefeld mit Braillezeile.
 *
 * Johannes, 19.10.2026: „das Feld hat nie mehr als 40 Zeichen Breite, und du
 * wählst die Zeilenumbrüche so klug, dass die Kinder auch beim Rechnen so wenig
 * Zeilensprünge wie möglich haben. Du überlegst, wie viele Zeichen sie
 * voraussichtlich eingeben, rechnest einige mehr dazu und setzt dann den
 * Umbruch klug."
 *
 * ★ Gerechnet wird mit der Zeile, WIE SIE NACH DER ANTWORT aussieht: jede Lücke
 * `[]` zählt mit der erwarteten Antwortlänge plus einer Reserve. So bleibt die
 * Zeile mit der Lücke auch dann unter 40, wenn das Kind die Antwort schreibt -
 * die Schreibmarke bleibt auf EINER Braillezeile, und kein Zeichen rutscht
 * beim Tippen in die nächste.
 *
 * ★ Umbrochen wird nur an Leerzeichen, und das Leerzeichen wird zum Umbruch
 * (gleiche Länge - die Schreibmarke bleibt, wo sie war). Ein Wort wird nie
 * geteilt. Harte Zeilenwechsel der Vorlage (schriftliches Rechnen) bleiben.
 */

/** So viele Zeichen hat eine Braillezeile - und damit höchstens eine Zeile des Feldes. */
export const FELDBREITE = 40;

/** Wie viele Zeichen über die erwartete Antwort hinaus Platz bleibt. */
export const RESERVE = 4;

/** Platz für EINE Lücke: erwartete Antwort + Reserve, nie unter 6, nie über 20. */
export function platzJeLuecke(erwartet: number | undefined, luecken: number): number {
  const je = erwartet === undefined ? 0 : Math.ceil(erwartet / Math.max(1, luecken));
  return Math.max(6, Math.min(20, je + RESERVE));
}

/**
 * Die Vorlage mit Umbrüchen. Die Länge bleibt gleich: Leerzeichen werden zu
 * `\n`, sonst ändert sich nichts - die Schreibmarke (`marke`) gilt weiter.
 */
export function brecheUm(vorlage: string, erwartet?: number, breite: number = FELDBREITE): string {
  const luecken = vorlage.split("[]").length - 1;
  const platz = platzJeLuecke(erwartet, luecken);
  const zeilen = vorlage.split("\n");
  return zeilen
    .map((zeile) => {
      const teile = zeile.split(" ");
      let aus = "";
      let breiteJetzt = 0;
      for (let i = 0; i < teile.length; i++) {
        const t = teile[i];
        const wiegt = t.length + (t.split("[]").length - 1) * platz;
        if (i === 0) { aus = t; breiteJetzt = wiegt; continue; }
        if (breiteJetzt + 1 + wiegt > breite) { aus += "\n" + t; breiteJetzt = wiegt; }
        else { aus += " " + t; breiteJetzt += 1 + wiegt; }
      }
      return aus;
    })
    .join("\n");
}
