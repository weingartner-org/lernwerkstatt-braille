/**
 * Zeichen von Punktgenau (07.09.2026): ein großes P mit den Braillepunkten
 * des Buchstabens p.
 * 
 * ★★★ p = PUNKTE 1, 2, 3, 4 - gemessen in src/lib/braille/tables.ts, nicht
 * aus dem Gedächtnis. Die Punkte 1, 2, 3 sind die ganze linke Spalte der
 * Zelle und bilden den senkrechten Strich des P; Punkt 4 sitzt oben rechts
 * im Bogen, auf DERSELBEN ZEILE wie Punkt 1.
 * 
 * ★★ DAS AUGE IST NEU GESETZT. Der Wulst rundet Außenecken, an der
 * Innenkontur bleibt die Ecke stehen - oben links ragte das Loch 1,8 höher
 * als der Rest und sah aus wie ein Eckerl (Johannes, 07.09.). Deshalb:
 * erst das Loch mit Weiß ganz schließen, dann ein symmetrisches Auge in
 * Grundfarbe setzen. Oberer Balken 6,7 und unterer Bogen 6,8 sind damit
 * gleich dick. Gemessen wurde das alte Loch AM BILD (x 26,90..37,00,
 * y 20,90..30,20) - die Bounding-Box der Kontur taugt dafür nicht, sie
 * enthält auch Kontrollpunkte außerhalb der Kurve.
 * 
 * Das P kommt aus Atkinson Hyperlegible Regular (Größe 46, Grundlinie 48),
 * in Pfade umgewandelt - ein Favicon lädt keine Schriften nach. Gerundet
 * über den Wulst (füllen UND umranden, 3,6 breit ⇒ Radius 1,8).
 * 
 * ZWEI Farben (Johannes, 07.09.): Taste #B04380 - das Okabe-Ito-Purpurrot,
 * abgedunkelt auf 5,13:1 - und der weiße Buchstabe. Die Braillepunkte
 * tragen die Tastenfarbe, sind also AUSSPARUNGEN im Buchstaben und keine
 * dritte Farbe. Eine dreifarbige Fassung mit blauen Punkten war gebaut und
 * wurde verworfen.
 * 
 * ⚠️ Diese Datei, src/components/PunktgenauLogo.tsx und das Startbild in
 * index.html müssen dieselbe Geometrie tragen; der Wächter
 * tests/mathecoach-zeichen.test.ts vergleicht sie.
 * PNGs: node scripts/punktgenau-logo-png.mjs
 *
 * Zwei Auftritte, wie bei den Geschwistern: ohne `beschreibung` dekorativ
 * (aria-hidden, der Name steht daneben), mit `beschreibung` ein echtes Bild
 * mit Bildbeschreibung - wer mit dem Screenreader darauf kommt, erfährt, wie
 * das Zeichen aussieht.
 */
export const PUNKTGENAU_LOGO_BESCHREIBUNG =
  "Das Zeichen von Punktgenau: eine purpurrote Taste mit abgerundeten Ecken. " +
  "Darin ein großes weißes P; im senkrechten Strich des P liegen drei " +
  "dunkelblaue Punkte untereinander, im Bogen ein vierter - zusammen die " +
  "Braillepunkte des Buchstabens p.";

export function PunktgenauLogo({
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
        ? PUNKTGENAU_LOGO_BESCHREIBUNG
        : undefined;
  return (
    <svg
      viewBox="4 4 56 56"
      className={className}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : "true"}
      focusable="false"
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      {/* Leichte Plastik (08.09.2026): der Verlauf über der Taste
          dunkelt nach unten ab und hellt NIE auf - sonst fällt der
          weiße Glyph unter seine gemessenen 4,5:1. Dieselben Werte
          stehen in public/punktgenau-logo.svg und im Startbild in index.html. */}
      <defs>
        <linearGradient id="punktgenau-tiefe" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#000000" stopOpacity="0" />
          <stop offset="0.55" stopColor="#000000" stopOpacity="0.05" />
          <stop offset="1" stopColor="#000000" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="56" height="56" rx="13" fill="#B04380" />
      <rect x="4" y="4" width="56" height="56" rx="13" fill="url(#punktgenau-tiefe)" />
      {/* das P aus Atkinson Hyperlegible Regular, in Pfade umgewandelt */}
      <path d="M20.80 17.27L30.41 17.27Q33.22 17.27 35.56 17.66Q37.91 18.05 39.61 19.09Q41.31 20.12 42.26 21.92Q43.20 23.71 43.20 26.56Q43.20 29.42 42.26 31.21Q41.31 33 39.61 34.02Q37.91 35.03 35.56 35.40Q33.22 35.76 30.41 35.76L25.12 35.76L25.12 47.95L20.80 47.95L20.80 17.27M25.12 20.91L25.12 32.04L30.78 32.04Q32.44 32.04 33.91 31.88Q35.38 31.72 36.46 31.16Q37.54 30.61 38.16 29.53Q38.78 28.45 38.78 26.56Q38.78 24.68 38.16 23.55Q37.54 22.42 36.46 21.85Q35.38 21.27 33.91 21.09Q32.44 20.91 30.78 20.91" fill="#FBFBFD" stroke="#FBFBFD" strokeWidth="3.6" />
      {/* das Auge: erst ganz schliessen, dann symmetrisch neu setzen */}
      <rect x="26.3" y="20.3" width="11.3" height="10.5" fill="#FBFBFD" />
      <rect x="26.9" y="22.2" width="10.1" height="8" rx="3.2" fill="#B04380" />
      {/* die Braillepunkte des p: 1, 2, 3 im Strich, 4 im Bogen */}
      <circle cx="22.87" cy="19.34" r="2.5" fill="#B04380" />
      <circle cx="22.87" cy="32.64" r="2.5" fill="#B04380" />
      <circle cx="22.87" cy="45.93" r="2.5" fill="#B04380" />
      <circle cx="36.16" cy="19.34" r="2.5" fill="#B04380" />
    </svg>
  );
}
