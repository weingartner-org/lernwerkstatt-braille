/**
 * SVG-Notenzeile für „Klangpunkte": 5 Linien, Violinschlüssel, echte Noten
 * (Köpfe/Hälse/Fähnchen), Pausen, Vorzeichen, Taktart, Taktstriche — und
 * darunter die Braille-Zellen JEDES Events (Parallel-Darstellung wie im
 * BBI-Workshop: Grundpunkte in Tintenfarbe, WERT-Punkte 3/6 hervorgehoben).
 *
 * Die Grafik ist dekorativ-parallel (aria-hidden): die maßgebliche
 * Repräsentation für Screenreader/Braillezeile läuft über Ansagen +
 * Live-Region im Runner. Theme-sicher über CSS-Variablen.
 */
import type { ReactNode } from "react";
import { klangTexte, useKlangTexte } from "@/lib/klangpunkte/sprache";
import { cellDots, type Cell } from "@/lib/braille";
import {
  diatonicIndex,
  transcribe,
  VALUE_DOTS,
  type Melody,
  type MusicNote,
} from "@/lib/klangpunkte/notation";

// --- Layout-Konstanten (viewBox-Einheiten) ------------------------------------

const TOP = 26; // y der obersten Notenlinie
const GAP = 10; // Linienabstand
const BOTTOM = TOP + 4 * GAP; // unterste Linie (e4)
const MID = TOP + 2 * GAP;
const STEP = GAP / 2; // diatonischer Schritt
const E4_INDEX = diatonicIndex("e", 4); // unterste Linie
const BRAILLE_Y = BOTTOM + 34; // Oberkante der Braille-Zellen
const CELL_W = 13;
const CELL_H = 19;
const H = BRAILLE_Y + CELL_H + 8;

// --- Violinschlüssel: echtes, gemeinfreies Glyph statt handgezeichnet ----------
// Quelle: Wikimedia Commons „Treble clef.svg" (Public Domain,
// https://commons.wikimedia.org/wiki/File:Treble_clef.svg). Im Original liegen die
// fünf Notenlinien bei y = 6378…8740 und der linkeste Glyphpunkt bei x = 1186.
// Daraus wird der Schlüssel per translate+scale passgenau auf UNSERE Notenzeile
// (TOP…BOTTOM) gelegt — die G-Schnecke sitzt so von selbst auf der g-Linie.
const CLEF_PATH =
  "M 2002,7851 C 1941,7868 1886,7906 1835,7964 C 1784,8023 1759,8088 1759,8158 C 1759,8202 1774,8252 1803,8305 C 1832,8359 1876,8398 1933,8423 C 1952,8427 1961,8437 1961,8451 C 1961,8456 1954,8461 1937,8465 C 1846,8442 1771,8393 1713,8320 C 1655,8246 1625,8162 1623,8066 C 1626,7963 1657,7867 1716,7779 C 1776,7690 1853,7627 1947,7590 L 1878,7235 C 1724,7363 1599,7496 1502,7636 C 1405,7775 1355,7926 1351,8089 C 1353,8162 1368,8233 1396,8301 C 1424,8370 1466,8432 1522,8489 C 1635,8602 1782,8661 1961,8667 C 2022,8663 2087,8652 2157,8634 L 2002,7851 z M 2074,7841 L 2230,8610 C 2384,8548 2461,8413 2461,8207 C 2452,8138 2432,8076 2398,8021 C 2365,7965 2321,7921 2265,7889 C 2209,7857 2146,7841 2074,7841 z M 1869,6801 C 1902,6781 1940,6746 1981,6697 C 2022,6649 2062,6592 2100,6528 C 2139,6463 2170,6397 2193,6330 C 2216,6264 2227,6201 2227,6143 C 2227,6118 2225,6093 2220,6071 C 2216,6035 2205,6007 2186,5988 C 2167,5970 2143,5960 2113,5960 C 2053,5960 1999,5997 1951,6071 C 1914,6135 1883,6211 1861,6297 C 1838,6384 1825,6470 1823,6557 C 1828,6656 1844,6737 1869,6801 z M 1806,6859 C 1761,6697 1736,6532 1731,6364 C 1732,6256 1743,6155 1764,6061 C 1784,5967 1813,5886 1851,5816 C 1888,5746 1931,5693 1979,5657 C 2022,5625 2053,5608 2070,5608 C 2083,5608 2094,5613 2104,5622 C 2114,5631 2127,5646 2143,5666 C 2262,5835 2322,6039 2322,6277 C 2322,6390 2307,6500 2277,6610 C 2248,6719 2205,6823 2148,6920 C 2090,7018 2022,7103 1943,7176 L 2024,7570 C 2068,7565 2098,7561 2115,7561 C 2191,7561 2259,7577 2322,7609 C 2385,7641 2439,7684 2483,7739 C 2527,7793 2561,7855 2585,7925 C 2608,7995 2621,8068 2621,8144 C 2621,8262 2590,8370 2528,8467 C 2466,8564 2373,8635 2248,8681 C 2256,8730 2270,8801 2291,8892 C 2311,8984 2326,9057 2336,9111 C 2346,9165 2350,9217 2350,9268 C 2350,9347 2331,9417 2293,9479 C 2254,9541 2202,9589 2136,9623 C 2071,9657 1999,9674 1921,9674 C 1811,9674 1715,9643 1633,9582 C 1551,9520 1507,9437 1503,9331 C 1506,9284 1517,9240 1537,9198 C 1557,9156 1584,9122 1619,9096 C 1653,9069 1694,9055 1741,9052 C 1780,9052 1817,9063 1852,9084 C 1886,9106 1914,9135 1935,9172 C 1955,9209 1966,9250 1966,9294 C 1966,9353 1946,9403 1906,9444 C 1866,9485 1815,9506 1754,9506 L 1731,9506 C 1770,9566 1834,9597 1923,9597 C 1968,9597 2014,9587 2060,9569 C 2107,9550 2146,9525 2179,9493 C 2212,9461 2234,9427 2243,9391 C 2260,9350 2268,9293 2268,9222 C 2268,9174 2263,9126 2254,9078 C 2245,9031 2231,8968 2212,8890 C 2193,8813 2179,8753 2171,8712 C 2111,8727 2049,8735 1984,8735 C 1875,8735 1772,8713 1675,8668 C 1578,8623 1493,8561 1419,8481 C 1346,8401 1289,8311 1248,8209 C 1208,8108 1187,8002 1186,7892 C 1190,7790 1209,7692 1245,7600 C 1281,7507 1327,7419 1384,7337 C 1441,7255 1500,7180 1561,7113 C 1623,7047 1704,6962 1806,6859 z";
const CLEF_SVG_TOP = 6378; // oberste Notenlinie im Original
const CLEF_SVG_BOTTOM = 8740; // unterste Notenlinie im Original
const CLEF_SVG_LEFT = 1186; // linkester Glyphpunkt im Original
const CLEF_SCALE = (BOTTOM - TOP) / (CLEF_SVG_BOTTOM - CLEF_SVG_TOP);
const CLEF_TX = 8 - CLEF_SCALE * CLEF_SVG_LEFT; // Schlüssel links platzieren
const CLEF_TY = TOP - CLEF_SCALE * CLEF_SVG_TOP; // Notenlinien deckungsgleich

// Bassschlüssel (F-Schlüssel) — echtes, gemeinfreies Glyph aus DEMSELBEN Satz wie
// der Violinschlüssel oben (Wikimedia Commons „Bass clef.svg", PD-self, Tlusťa
// 2006). Die fünf Notenlinien liegen im Original bei denselben y = 6378…8740 wie
// beim Treble-Glyph — deshalb passen Skalierung und vertikale Lage 1:1; die zwei
// Schlüsselpunkte umrahmen von selbst die F3-Linie (Original y ≈ 6968).
const BASS_CLEF_PATH =
  "M 1239,8245 C 1397,8138 1515,8057 1591,8001 C 1667,7946 1747,7877 1829,7795 C 1911,7713 1980,7620 2036,7517 C 2080,7441 2118,7353 2149,7253 C 2180,7154 2196,7058 2199,6967 C 2199,6882 2188,6801 2165,6725 C 2143,6648 2105,6585 2051,6534 C 1997,6484 1927,6459 1840,6459 C 1756,6459 1677,6476 1603,6509 C 1530,6543 1478,6597 1449,6673 C 1449,6680 1445,6689 1439,6702 C 1441,6718 1449,6730 1464,6739 C 1479,6748 1492,6752 1504,6752 C 1510,6752 1527,6749 1553,6743 C 1580,6737 1602,6733 1620,6733 C 1673,6733 1720,6752 1763,6789 C 1805,6826 1826,6871 1826,6924 C 1826,6962 1815,6998 1794,7031 C 1773,7064 1744,7091 1707,7110 C 1670,7130 1629,7139 1585,7139 C 1505,7139 1437,7115 1381,7066 C 1326,7016 1298,6953 1298,6874 C 1298,6773 1329,6686 1390,6612 C 1452,6538 1530,6483 1626,6446 C 1721,6408 1817,6390 1915,6390 C 2022,6390 2124,6417 2219,6472 C 2315,6526 2390,6601 2446,6694 C 2502,6788 2531,6888 2531,6996 C 2531,7188 2467,7366 2339,7531 C 2211,7696 2053,7839 1864,7961 C 1738,8044 1534,8156 1253,8297 L 1239,8245 z M 2628,6698 C 2628,6662 2641,6632 2667,6608 C 2692,6583 2723,6571 2760,6571 C 2792,6571 2822,6585 2849,6612 C 2876,6638 2889,6669 2889,6703 C 2889,6739 2875,6770 2849,6795 C 2821,6819 2790,6831 2755,6831 C 2718,6831 2688,6819 2664,6792 C 2640,6766 2628,6735 2628,6698 z M 2628,7222 C 2628,7186 2641,7155 2665,7131 C 2690,7106 2721,7094 2760,7094 C 2792,7094 2821,7107 2849,7134 C 2875,7161 2889,7190 2889,7222 C 2889,7261 2876,7292 2851,7317 C 2825,7342 2795,7355 2760,7355 C 2721,7355 2690,7342 2665,7318 C 2641,7294 2628,7262 2628,7222 z";
const BASS_CLEF_LEFT = 1239; // linkester Glyphpunkt im Original
const BASS_TX = 12 - CLEF_SCALE * BASS_CLEF_LEFT; // etwas Rand links
const BASS_TY = TOP - CLEF_SCALE * CLEF_SVG_TOP; // Notenlinien deckungsgleich

export type Clef = "violin" | "bass";

// Unterste Notenlinie je Schlüssel: Violin = e4, Bass = g2. Alle Ton-Höhen
// werden relativ dazu platziert (noteY), damit der Bassschlüssel die tiefen
// Töne der linken Hand ohne Hilfslinien-Wald zeigt.
const G2_INDEX = diatonicIndex("g", 2);
function bottomIndexOf(clef: Clef): number {
  return clef === "bass" ? G2_INDEX : E4_INDEX;
}

function noteY(n: MusicNote, bottomIndex: number): number {
  return BOTTOM - (diatonicIndex(n.tone, n.octave) - bottomIndex) * STEP;
}

// --- Bassschlüssel (F-Schlüssel): echtes gemeinfreies Glyph (s. BASS_CLEF_PATH) --
// Per translate+scale auf UNSERE Notenzeile gelegt — dieselbe Skalierung/Lage wie
// der Violinschlüssel, weil beide Glyphen denselben Original-Linienraster teilen.
function BassClef({ ink }: { ink: string }) {
  return (
    <path
      d={BASS_CLEF_PATH}
      transform={`translate(${BASS_TX} ${BASS_TY}) scale(${CLEF_SCALE})`}
      fill={ink}
    />
  );
}

// --- Braille-Zelle als SVG-Miniatur --------------------------------------------

function MiniCell({
  cell,
  x,
  highlight,
  valueDots,
}: {
  cell: Cell;
  x: number;
  highlight: boolean;
  /** Punktnummern, die als WERT-Punkte hervorgehoben werden (3/6). */
  valueDots: readonly number[];
}) {
  const set = new Set(cellDots(cell));
  const out = [] as ReactNode[];
  const colX = [x + 3.5, x + 9.5];
  const rowY = [BRAILLE_Y + 3.5, BRAILLE_Y + 9.5, BRAILLE_Y + 15.5];
  const order: [number, number, number][] = [
    [1, 0, 0], [2, 0, 1], [3, 0, 2], [4, 1, 0], [5, 1, 1], [6, 1, 2],
  ];
  for (const [dot, c, r] of order) {
    const on = set.has(dot);
    const isValue = on && valueDots.includes(dot);
    out.push(
      <circle
        key={dot}
        cx={colX[c]}
        cy={rowY[r]}
        r={on ? 2 : 0.9}
        fill={
          !on
            ? "transparent"
            : isValue
              ? "rgb(var(--c-danger))"
              : highlight
                ? "rgb(var(--c-accent))"
                : "rgb(var(--c-ink))"
        }
        stroke={on ? "none" : "rgb(var(--c-ink) / 0.35)"}
        strokeWidth={on ? 0 : 0.7}
      />,
    );
  }
  return <g>{out}</g>;
}

// --- Pausen (vereinfachte, aber korrekte Silhouetten) ---------------------------

function RestGlyph({ value, x }: { value: MusicNote["value"]; x: number }) {
  const ink = "rgb(var(--c-ink))";
  if (value === "ganze")
    return <rect x={x - 6} y={TOP + GAP} width={12} height={4.5} fill={ink} />;
  if (value === "halbe")
    return <rect x={x - 6} y={MID - 4.5} width={12} height={4.5} fill={ink} />;
  if (value === "viertel")
    return (
      <path
        d={`M ${x - 2} ${TOP + 4} C ${x + 6} ${TOP + 12}, ${x - 5} ${TOP + 16}, ${x + 3} ${TOP + 24} C ${x - 6} ${TOP + 20}, ${x + 1} ${TOP + 30}, ${x - 1} ${TOP + 34}`}
        fill="none"
        stroke={ink}
        strokeWidth={2.6}
        strokeLinecap="round"
      />
    );
  if (value === "achtel")
    return (
      <g stroke={ink} strokeWidth={2} strokeLinecap="round">
        <circle cx={x - 3} cy={MID - 4} r={2.6} fill={ink} stroke="none" />
        <path d={`M ${x + 4} ${MID - 6} Q ${x} ${MID - 1} ${x - 3} ${MID - 2} M ${x + 4} ${MID - 6} L ${x - 1} ${MID + 12}`} fill="none" />
      </g>
    );
  // Sechzehntelpause: wie Achtel, mit zweitem Punkt-Fähnchen
  return (
    <g stroke={ink} strokeWidth={2} strokeLinecap="round">
      <circle cx={x - 3} cy={MID - 4} r={2.4} fill={ink} stroke="none" />
      <circle cx={x - 4.5} cy={MID + 3} r={2.4} fill={ink} stroke="none" />
      <path d={`M ${x + 4} ${MID - 6} Q ${x} ${MID - 1} ${x - 3} ${MID - 2} M ${x + 2.5} ${MID + 1} Q ${x - 1} ${MID + 5} ${x - 4.5} ${MID + 5} M ${x + 4} ${MID - 6} L ${x - 2} ${MID + 14}`} fill="none" />
    </g>
  );
}

// --- Hauptkomponente -------------------------------------------------------------

export interface NotenZeileProps {
  melody: Melody;
  /** Event-Index, der gerade klingt/aktiv ist (Hervorhebung). */
  highlightIndex?: number | null;
  /** Braille-Zeile unter den Noten (Standard an). */
  showBraille?: boolean;
  /** Oktavzeichen in der Braille-Zeile (aus für die frühen Etappen). */
  octaveSigns?: boolean;
  /** Notenschlüssel: Violin (rechte Hand) oder Bass (linke Hand). */
  clef?: Clef;
  className?: string;
}

export function NotenZeile({
  melody,
  highlightIndex = null,
  showBraille = true,
  octaveSigns = true,
  clef = "violin",
  className,
}: NotenZeileProps) {
  const t = transcribe(melody, { octaveSigns });
  const bottomIndex = bottomIndexOf(clef);
  const ink = "rgb(var(--c-ink))";
  const accent = "rgb(var(--c-accent))";

  // x-Layout: Schlüssel, Taktart, dann Events mit Platz je nach Zellenzahl.
  let x = 44;
  const sigX = melody.timeSig ? x + 4 : null;
  if (melody.timeSig) x += 26;
  const positions: number[] = [];
  const widths: number[] = [];
  for (const e of t.events) {
    const w =
      e.event.kind === "bar"
        ? 16
        : Math.max(30, e.cells.length * (CELL_W + 2) + 8);
    positions.push(x + w / 2);
    widths.push(w);
    x += w;
  }
  const W = x + 16;

  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${W} ${H}`}
      className={className}
      style={{ width: "100%", maxWidth: W * 2.2, height: "auto", display: "block" }}
    >
      {/* Notenlinien */}
      {[0, 1, 2, 3, 4].map((i) => (
        <line key={i} x1={8} y1={TOP + i * GAP} x2={W - 8} y2={TOP + i * GAP} stroke={ink} strokeWidth={0.9} opacity={0.8} />
      ))}

      {/* Schlüssel: Violin — echtes, gemeinfreies Glyph (s. CLEF_PATH oben),
          per translate+scale auf die g-Linie gelegt; Bass — stilisierter
          F-Schlüssel auf der F3-Linie. */}
      {clef === "bass" ? (
        <BassClef ink={ink} />
      ) : (
        <path
          d={CLEF_PATH}
          transform={`translate(${CLEF_TX} ${CLEF_TY}) scale(${CLEF_SCALE})`}
          fill={ink}
        />
      )}

      {/* Taktart */}
      {melody.timeSig && sigX !== null && (
        <g
          fill={ink}
          fontFamily="ui-serif, Georgia, serif"
          fontWeight={700}
          fontSize={19}
          textAnchor="middle"
        >
          <text x={sigX + 7} y={MID - 1.5}>{melody.timeSig[0]}</text>
          <text x={sigX + 7} y={BOTTOM - 1.5}>{melody.timeSig[1]}</text>
        </g>
      )}

      {/* Events */}
      {t.events.map((e, i) => {
        const cx = positions[i];
        const hot = highlightIndex === i;
        if (e.event.kind === "bar") {
          return <line key={i} x1={cx} y1={TOP} x2={cx} y2={BOTTOM} stroke={ink} strokeWidth={1.3} />;
        }
        if (e.event.kind === "rest") {
          return (
            <g key={i} opacity={1}>
              {hot && <rect x={cx - 12} y={TOP - 8} width={24} height={BOTTOM - TOP + 16} rx={5} fill={accent} opacity={0.14} />}
              <RestGlyph value={e.event.value} x={cx} />
              {e.event.dotted && <circle cx={cx + 10} cy={MID - 2} r={1.8} fill={ink} />}
            </g>
          );
        }
        const n = e.event;
        const y = noteY(n, bottomIndex);
        const open = n.value === "halbe" || n.value === "ganze";
        const flags = n.value === "achtel" ? 1 : n.value === "sechzehntel" ? 2 : 0;
        const stemUp = y >= MID;
        const stemX = stemUp ? cx + 5.4 : cx - 5.4;
        const stemY2 = stemUp ? y - 30 : y + 30;
        const color = hot ? accent : ink;
        // Hilfslinien (c4 etc.)
        const ledgers: number[] = [];
        for (let ly = BOTTOM + GAP; ly <= y + 1; ly += GAP) ledgers.push(ly);
        for (let ly = TOP - GAP; ly >= y - 1; ly -= GAP) ledgers.push(ly);
        return (
          /* ★ `data-klingt` (09.09.2026): Welche Note gerade klingt, sagte bisher
             allein die Farbe (`hot ? accent : ink`) plus ein Wisch mit 14 %
             Deckkraft. Der Windows-Kontrastmodus erzwingt auch `fill` und
             `stroke` - dann ist nicht mehr zu sehen, wo im Stück das Kind ist.
             `index.css` macht daraus dort einen Umriss um die Note. */
          <g key={i} data-klingt={hot ? "ja" : undefined}>
            {hot && <rect x={cx - 13} y={Math.min(y, stemY2) - 8} width={26} height={Math.abs(y - stemY2) + 20} rx={5} fill={accent} opacity={0.14} />}
            {ledgers.map((ly) => (
              <line key={ly} x1={cx - 9.5} y1={ly} x2={cx + 9.5} y2={ly} stroke={ink} strokeWidth={0.9} />
            ))}
            {n.accidental && (
              <text x={cx - 9} y={y + 4.2} textAnchor="end" fontSize={13} fill={color} fontFamily="ui-serif, Georgia, serif">
                {n.accidental === "kreuz" ? "♯" : n.accidental === "be" ? "♭" : "♮"}
              </text>
            )}
            <ellipse
              cx={cx}
              cy={y}
              rx={6}
              ry={4.4}
              transform={`rotate(-18 ${cx} ${y})`}
              fill={open ? "transparent" : color}
              stroke={color}
              strokeWidth={open ? 1.7 : 0}
            />
            {n.value !== "ganze" && <line x1={stemX} y1={y + (stemUp ? -1.5 : 1.5)} x2={stemX} y2={stemY2} stroke={color} strokeWidth={1.4} />}
            {Array.from({ length: flags }, (_, fi) => {
              const fy = stemY2 + (stemUp ? fi * 7 : -fi * 7);
              return (
                <path
                  key={fi}
                  d={
                    stemUp
                      ? `M ${stemX} ${fy} C ${stemX + 7} ${fy + 5} ${stemX + 8} ${fy + 12} ${stemX + 4.5} ${fy + 19}`
                      : `M ${stemX} ${fy} C ${stemX + 7} ${fy - 5} ${stemX + 8} ${fy - 12} ${stemX + 4.5} ${fy - 19}`
                  }
                  fill="none"
                  stroke={color}
                  strokeWidth={1.8}
                  strokeLinecap="round"
                />
              );
            })}
            {n.dotted && <circle cx={cx + 10} cy={y - 2} r={1.8} fill={color} />}
          </g>
        );
      })}

      {/* Haltebögen: Bogen zur nächsten Note (Taktstriche dazwischen erlaubt) */}
      {t.events.map((e, i) => {
        if (e.event.kind !== "note" || !e.event.tie) return null;
        let j = i + 1;
        while (j < t.events.length && t.events[j].event.kind === "bar") j++;
        const nxt = t.events[j];
        if (!nxt || nxt.event.kind !== "note") return null;
        const y = noteY(e.event, bottomIndex) + 7;
        const x1 = positions[i] + 6;
        const x2 = positions[j] - 6;
        return (
          <path
            key={`tie${i}`}
            d={`M ${x1} ${y} Q ${(x1 + x2) / 2} ${y + 7} ${x2} ${y}`}
            fill="none"
            stroke={ink}
            strokeWidth={1.4}
          />
        );
      })}

      {/* Triolen: kleine kursive 3 über der Gruppe */}
      {(() => {
        const marks: ReactNode[] = [];
        let runStart = -1;
        for (let i = 0; i <= t.events.length; i++) {
          const ev = i < t.events.length ? t.events[i].event : null;
          const isTri = !!ev && ev.kind === "note" && ev.tuplet === 3;
          if (isTri && runStart === -1) runStart = i;
          if (!isTri && runStart !== -1) {
            const mid = (positions[runStart] + positions[i - 1]) / 2;
            marks.push(
              <text
                key={`tri${runStart}`}
                x={mid}
                y={TOP - 8}
                textAnchor="middle"
                fontSize={11}
                fontStyle="italic"
                fill={ink}
                fontFamily="ui-serif, Georgia, serif"
              >
                3
              </text>,
            );
            runStart = -1;
          }
        }
        return marks;
      })()}

      {/* Braille-Zellen unter jedem Event (Wert-Punkte 3/6 hervorgehoben) */}
      {showBraille &&
        t.events.map((e, i) => {
          if (e.event.kind === "bar") return null;
          const totalW = e.cells.length * (CELL_W + 2) - 2;
          const startX = positions[i] - totalW / 2;
          const vDots =
            e.event.kind === "note" ? VALUE_DOTS[e.event.value] : [];
          return (
            <g key={`b${i}`}>
              {e.cells.map((cell, ci) => (
                <MiniCell
                  key={ci}
                  cell={cell}
                  x={startX + ci * (CELL_W + 2)}
                  highlight={highlightIndex === i}
                  // Wert-Punkte nur in der Kern-Zelle der Note markieren
                  valueDots={ci === e.coreIndex && e.event.kind === "note" ? vDots : []}
                />
              ))}
            </g>
          );
        })}
    </svg>
  );
}

// --- Zweizeilige Klavier-Ansicht (GrandStaff) -----------------------------------

/** Hand-Fokus in der zweizeiligen Ansicht: beide · nur rechts · nur links. */
export type HandFocus = "both" | "rh" | "lh";

export const HAND_FOCUS_ORDER: HandFocus[] = ["both", "rh", "lh"];

export function handFocusLabel(f: HandFocus): string {
  return klangTexte().runner.notenzeile.handFokus[f === "rh" ? "rh" : f === "lh" ? "lh" : "both"];
}

export interface GrandStaffProps {
  /** Rechte Hand — Violinschlüssel (obere Zeile). */
  right: Melody;
  /** Linke Hand — Bassschlüssel (untere Zeile). */
  left: Melody;
  /** Aktiver Ton-Index je Hand (nur die klingende Hand wird hervorgehoben). */
  highlightRight?: number | null;
  highlightLeft?: number | null;
  showBraille?: boolean;
  octaveSigns?: boolean;
  /** Welche Hand ist im Fokus? Die andere wird gedimmt + kleiner (Alt+Q). */
  focus?: HandFocus;
  className?: string;
}

/**
 * Zwei gestapelte Notenzeilen als Klavier-System (rechte Hand im Violin-, linke
 * im Bassschlüssel). Rein dekorativ (aria-hidden) — die maßgebliche Fassung für
 * Screenreader/Braillezeile läuft über die Live-Region des Runners. Der
 * Hand-Fokus hebt eine Zeile hervor (größer, volle Deckkraft) und dimmt die
 * andere; „beide" zeigt beide gleichwertig. Für sehbehinderte Nutzung gedacht.
 */
export function GrandStaff({
  right,
  left,
  highlightRight = null,
  highlightLeft = null,
  showBraille = true,
  octaveSigns = true,
  focus = "both",
  className,
}: GrandStaffProps) {
  const tx = useKlangTexte().runner.notenzeile;
  const dim = { opacity: 0.38, transform: "scale(0.9)" } as const;
  const base = { transition: "opacity .2s, transform .2s", transformOrigin: "left center" } as const;
  const rhStyle = focus === "lh" ? { ...base, ...dim } : base;
  const lhStyle = focus === "rh" ? { ...base, ...dim } : base;
  return (
    <div aria-hidden="true" className={className}>
      <div className="flex items-stretch gap-2">
        {/* Systemklammer links */}
        <div className="w-1 shrink-0 self-stretch rounded-full bg-ink/60" />
        <div className="min-w-0 flex-1 space-y-1">
          <div style={rhStyle}>
            <p className="m-0 text-xs font-medium text-ink-muted">{tx.rechteHand}</p>
            <NotenZeile
              melody={right}
              clef="violin"
              highlightIndex={highlightRight}
              showBraille={showBraille}
              octaveSigns={octaveSigns}
            />
          </div>
          <div style={lhStyle}>
            <p className="m-0 text-xs font-medium text-ink-muted">{tx.linkeHand}</p>
            <NotenZeile
              melody={left}
              clef="bass"
              highlightIndex={highlightLeft}
              showBraille={showBraille}
              octaveSigns={octaveSigns}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
