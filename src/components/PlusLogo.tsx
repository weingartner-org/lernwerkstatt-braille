/**
 * Plus-Zeichen (29.09.2026): zwei Sprechblasen auf einer grünen Taste.
 * In der hinteren, kleinen steht „plus" in Braille, in der vorderen, großen
 * das Pluszeichen. Johannes hat es aus zwei Runden Entwürfen gewählt
 * („jetzt ist das fesch"); die Entwürfe liegen auf den Flächen
 * (Entwurf, nicht veröffentlicht) und
 * (Entwurf, nicht veröffentlicht).
 *
 * ★ WARUM NICHT MEHR DAS SCHLICHTE PLUS VOM 23.09. Ein weißes Plus auf
 * grüner Fläche liest sich wie ein Apothekenschild. Die Sprechblasen sagen
 * dagegen, was die App tut: Sie sagt die Rechnung an, und das Kind rechnet
 * im Kopf und auf der Zeile.
 *
 * Dieselbe Bauart wie die Geschwister und aus denselben Gründen:
 *   - Ein gerundetes QUADRAT, kein Kreis. Der Kreis gehört dem
 *     Sensorik-Zeichen und damit der ganzen Plattform; das Quadrat
 *     kennzeichnet eine App darin.
 *   - Alles ist GEZEICHNET, kein `<text>`. Ein Favicon lädt keine
 *     Schriften nach; mit Text stünde je nach System eine andere Schrift da.
 *   - Dieselbe leichte Plastik: ein Verlauf, der nach unten NUR abdunkelt.
 *
 * ★★ DAS BRAILLE. „plus" in Basisschrift, ohne Großschreibzeichen:
 * p 1234 · l 123 · u 136 · s 234 - abgeglichen mit der Tabelle von
 * Punktgenau (`src/lib/braille/tables.ts`), nicht aus dem Gedächtnis. Die
 * Punkte sind AUSSPARUNGEN in Tastenfarbe, keine dritte Farbe - wie die
 * Braillepunkte im Zeichen von Punktgenau. Bei 16 Punkten wird das Braille
 * zum Muster; lesbar bleibt dort das Plus in der großen Blase. Johannes
 * wollte die Braille-Blase ausdrücklich klein und die Plus-Blase groß.
 *
 * Farbe #00AA9E (helles Türkis, 21.10.2026, wie die App - vorher #1F8427 Grün):
 * die Blasen bleiben WEISS (Johannes, 21.10.2026), Braillepunkte dunkel (#032B28, 5,4:1 gegen
 * die Taste), das Plus in mittlerem Türkis #00857C (Johannes: erst „heller", dann „nicht so hell"; 4,5:1 auf Weiß). ⚠️ Die weiße Blase gegen die Taste nur
 * etwa 2,9:1 - getragen von Schlagschatten und Rand der vorderen Blase. (Älterer Text:) Johannes: der Schiefer sei schön, aber nicht positiv. Das
 * Grün ist reiner und heller als Oliv (Hörbuch-Studio) und Türkis
 * (eine andere App der Plattform ); die Farbe ist ohnehin nie die einzige Auskunft.
 *
 * Quelle ist mit `public/plus-logo.svg` (Favicon/Manifest) und dem Startbild
 * in `index.html` identisch zu halten; der Wächter
 * `tests/mathecoach-zeichen.test.ts` vergleicht alle drei. Darum stehen die
 * 13 Punkte einzeln da und nicht in einer Schleife: Der Wächter vergleicht
 * die Farben in der Quelle. Die PNG-Fassungen erzeugt
 * `node scripts/plus-logo-png.mjs` aus derselben SVG-Datei.
 *
 * Zwei Auftritte, wie bei den Geschwistern:
 *   - ohne `beschreibung`: dekorativ (`aria-hidden`), der Name „Plus" steht
 *     als Text daneben (Kopfzeile, Startbild).
 *   - mit `beschreibung`: ein ECHTES Bild mit Bildbeschreibung. Wer mit dem
 *     Screenreader darauf kommt, erfährt, wie das Zeichen aussieht - dieselbe
 *     Teilhabe an der sichtbaren Welt wie bei den Abzeichen. Der Text
 *     beschreibt das Aussehen, nicht die Funktion; die steht im Titel daneben.
 */
export const PLUS_LOGO_BESCHREIBUNG =
  "Das Plus-Zeichen: eine türkise Taste mit abgerundeten Ecken. " +
  "Darauf zwei weiße Sprechblasen. In der hinteren, kleinen steht das Wort " +
  "plus in Braille, in der vorderen, großen ein Pluszeichen.";

export function PlusLogo({
  className,
  beschreibung,
}: {
  className?: string;
  /** true = Standard-Bildbeschreibung; eigener Text überschreibt sie. */
  beschreibung?: boolean | string;
}) {
  const label =
    typeof beschreibung === "string"
      ? beschreibung
      : beschreibung
        ? PLUS_LOGO_BESCHREIBUNG
        : undefined;
  return (
    <svg
      // viewBox auf die Taste ZUGESCHNITTEN, wie bei den Geschwistern: Kein
      // Leerrand - bei gleicher CSS-Größe ist die Taste damit exakt so hoch
      // wie der Sensorik-Kreis und wie die Tastenflow-Taste.
      viewBox="4 4 56 56"
      className={className}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : "true"}
      focusable="false"
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      {/* Leichte Plastik (08.09.2026): der Verlauf über der Taste dunkelt
          nach unten ab und hellt NIE auf - sonst fiele der weiße Glyph unter
          seine gemessenen 4,5:1. Dieselben Werte stehen in
          public/plus-logo.svg und im Startbild in index.html. */}
      <defs>
        <linearGradient id="plus-tiefe" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#000000" stopOpacity="0" />
          <stop offset="0.55" stopColor="#000000" stopOpacity="0.05" />
          <stop offset="1" stopColor="#000000" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="56" height="56" rx="13" fill="#00AA9E" />
      <rect x="4" y="4" width="56" height="56" rx="13" fill="url(#plus-tiefe)" />
      {/* Schlagschatten (11.10.2026): schwarz, nur auf der Taste. Aufgehellt
          wird nie (Wächter), der Kontrast der Blasen bleibt unberührt. */}
      <rect x="26" y="9.2" width="30" height="17" rx="6" fill="#000000" fillOpacity="0.18" />
      <rect x="7" y="24.4" width="38" height="28" rx="9" fill="#000000" fillOpacity="0.2" />
      {/* hintere Blase mit „plus" in Braille */}
      <rect x="26" y="8" width="30" height="17" rx="6" fill="#FBFBFD" />
      <path d="M50 23 L53.5 28.5 L45 24.5 Z" fill="#FBFBFD" stroke="#FBFBFD" strokeWidth="1.2" />
      <circle cx="30.4" cy="13.9" r="0.95" fill="#032B28" />
      <circle cx="30.4" cy="16.5" r="0.95" fill="#032B28" />
      <circle cx="30.4" cy="19.1" r="0.95" fill="#032B28" />
      <circle cx="33" cy="13.9" r="0.95" fill="#032B28" />
      <circle cx="36.6" cy="13.9" r="0.95" fill="#032B28" />
      <circle cx="36.6" cy="16.5" r="0.95" fill="#032B28" />
      <circle cx="36.6" cy="19.1" r="0.95" fill="#032B28" />
      <circle cx="42.8" cy="13.9" r="0.95" fill="#032B28" />
      <circle cx="42.8" cy="19.1" r="0.95" fill="#032B28" />
      <circle cx="45.4" cy="19.1" r="0.95" fill="#032B28" />
      <circle cx="49" cy="16.5" r="0.95" fill="#032B28" />
      <circle cx="49" cy="19.1" r="0.95" fill="#032B28" />
      <circle cx="51.6" cy="13.9" r="0.95" fill="#032B28" />
      {/* vordere Blase mit dem Pluszeichen; der Rand in Tastenfarbe trennt
          sie von der hinteren */}
      <rect x="7" y="23" width="38" height="28" rx="9" fill="#FBFBFD" stroke="#00AA9E" strokeWidth="1.6" />
      <path d="M13.5 49.5 C13.5 53.5 12 55.5 9.5 57 C14.5 57 19.5 55 23.5 49.5 Z" fill="#FBFBFD" stroke="#FBFBFD" strokeWidth="0.8" />
      <path d="M26 29 V45 M18 37 H34" stroke="#00857C" strokeWidth="6" fill="none" />
    </svg>
  );
}
