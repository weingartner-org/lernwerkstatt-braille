/**
 * Eine Braillezelle als exaktes SVG-Punktraster (font-unabhängig, kontraststark,
 * barrierefrei). Gesetzte Punkte sind gefüllt, leere Positionen bleiben als
 * feiner Ring sichtbar — so erkennt man die 6- bzw. 8-Punkt-Form.
 *
 * Theme-sicher über CSS-Variablen (hell + dunkel). Die Zelle kennt die Engine-
 * Punkte-Logik (Bitmaske) und beschriftet sich selbst per aria-label.
 */
import { Cell, cellsToFontString, dotsLabel, hasDot } from "@/lib/braille";

// Punktnummer → [Spalte (0/1), Zeile (0..3)]
const DOT_POS: Record<number, [number, number]> = {
  1: [0, 0], 2: [0, 1], 3: [0, 2], 7: [0, 3],
  4: [1, 0], 5: [1, 1], 6: [1, 2], 8: [1, 3],
};

export interface BrailleCellProps {
  cell: Cell;
  /** 8-Punkt-Raster (2×4) statt 6-Punkt (2×3). */
  eightDot?: boolean;
  /** Höhe in Pixeln (Breite folgt dem Seitenverhältnis). */
  size?: number;
  /** Punkte, die zur Lernhilfe hervorgehoben werden. */
  highlightDots?: readonly number[];
  /** Färbung für Rückmeldung. */
  state?: "neutral" | "correct" | "wrong" | "pending";
  /** Leere Punktpositionen andeuten (Default an). */
  showEmpty?: boolean;
  /** aria-label überschreiben (sonst „Punkte 1, 2, 4"). */
  label?: string;
  className?: string;
}

const COL_X = [18, 42]; // Spaltenmitten im viewBox (Breite 60)
const ROW_Y = [15, 45, 75, 105];
const R = 10;

export function BrailleCell({
  cell,
  eightDot = false,
  size,
  highlightDots = [],
  state = "neutral",
  showEmpty = true,
  label,
  className,
}: BrailleCellProps) {
  const rows = eightDot ? 4 : 3;
  const vbH = rows * 30;
  const height = size ?? (eightDot ? 100 : 76);
  const width = (60 / vbH) * height;
  const dotList = eightDot ? [1, 2, 3, 7, 4, 5, 6, 8] : [1, 2, 3, 4, 5, 6];

  const activeColor =
    state === "correct"
      ? "rgb(var(--c-success))"
      : state === "wrong"
        ? "rgb(var(--c-danger))"
        : state === "pending"
          ? "rgb(var(--c-accent))"
          : "rgb(var(--c-ink))";

  return (
    <svg
      role="img"
      aria-label={label ?? dotsLabel(cell)}
      /* ★ Der Zustand gehört ins DOM, nicht nur in eine Füllfarbe (09.09.2026).
         Im Windows-Kontrastmodus ersetzt das Betriebssystem jede Farbe - auch
         `fill` und `stroke` -, und dann sehen „richtig", „falsch" und „gerade
         dran" gleich aus. Über dieses Attribut hängt `index.css` im
         Kontrastmodus eine FORM daran (Umriss). Punktgenau und Klangpunkte
         benutzen dieselbe Zelle, es wirkt also in beiden. */
      data-zustand={state}
      viewBox={`0 0 60 ${vbH}`}
      width={width}
      height={height}
      className={className}
    >
      {dotList.map((d) => {
        const pos = DOT_POS[d];
        const cx = COL_X[pos[0]];
        const cy = ROW_Y[pos[1]];
        const active = hasDot(cell, d);
        const highlighted = highlightDots.includes(d);
        if (!active && !showEmpty && !highlighted) return null;
        if (active) {
          return (
            <circle
              key={d}
              cx={cx}
              cy={cy}
              r={R}
              fill={activeColor}
              stroke={highlighted ? "rgb(var(--c-accent))" : "none"}
              strokeWidth={highlighted ? 3 : 0}
            />
          );
        }
        // leere Position bzw. hervorgehobener (noch nicht gesetzter) Punkt
        return (
          <circle
            key={d}
            cx={cx}
            cy={cy}
            r={R - 1.5}
            fill="none"
            stroke={highlighted ? "rgb(var(--c-accent))" : "rgb(var(--c-hairline))"}
            strokeWidth={highlighted ? 3 : 1.5}
            strokeDasharray={highlighted ? "4 3" : undefined}
            opacity={highlighted ? 1 : 0.7}
          />
        );
      })}
    </svg>
  );
}

/**
 * Eine Braillezelle als HBS-Schriftzeichen statt gezeichnetem Punktraster -
 * für Augen, die die Schwellform besser lesen als den SVG-Punktkreis
 * (Johannes 22.09.2026: "als braillefont nimm bitte eine die mit den augen
 * besser zu lesen ist"; siehe `lib/braille/render.ts`, die fertige Brücke
 * Zelle -> HBS-Zeichen).
 *
 * ⚠️⚠️⚠️ IMMER `aria-hidden` - nie weglassen. Die HBS-Schrift bildet
 * Braillezellen als LATEINISCHE Zeichen ab (kein Unicode-Braille): die Zelle
 * für "der" wird zum Zeichen "." - eine Sprachausgabe läse "Punkt" statt
 * der eigentlichen Zelle. Die Auskunft für die Sprachausgabe steht darum bei
 * JEDEM Aufrufer eigens daneben (z. B. `dotsLabel` in einer sr-only-Liste) -
 * dieses Bauteil selbst trägt keine.
 */
export function BrailleFontCell({
  cell,
  eightDot = false,
  size,
  state = "neutral",
  className,
}: {
  cell: Cell;
  eightDot?: boolean;
  /** Schriftgröße in Pixeln - ersetzt die SVG-Höhe von `BrailleCell`. */
  size?: number;
  /** Färbung für Rückmeldung - wie bei `BrailleCell`. */
  state?: "neutral" | "correct" | "wrong" | "pending";
  className?: string;
}) {
  const color =
    state === "correct"
      ? "rgb(var(--c-success))"
      : state === "wrong"
        ? "rgb(var(--c-danger))"
        : state === "pending"
          ? "rgb(var(--c-accent))"
          : "rgb(var(--c-ink))";
  return (
    <span
      aria-hidden="true"
      // ★ Der Zustand gehört ins DOM, nicht nur in die Textfarbe - siehe
      // `BrailleCell`: derselbe `data-zustand`-Haken trägt den Kontrastmodus-
      // Umriss (index.css) auch hier, `outline` wirkt genauso auf einen
      // <span> wie auf ein SVG.
      data-zustand={state}
      className={(eightDot ? "font-braille-8" : "font-braille-6") + (className ? " " + className : "")}
      style={{ color, ...(size ? { fontSize: `${size}px` } : undefined) }}
    >
      {cellsToFontString([cell], eightDot)}
    </span>
  );
}

/**
 * Eine Zellfolge als HBS-Schriftzeichen in EINEM Textfluss statt als Reihe
 * gezeichneter Kästchen - Wort-Lücken werden zu echten Leerzeichen
 * (`render.ts` bildet die Leerzelle auf " " ab), der Text bricht am
 * Zeilenende also von selbst um. IMMER `aria-hidden` - siehe `BrailleFontCell`.
 */
export function BrailleFontText({
  cells,
  eightDot = false,
  size,
  className,
}: {
  cells: readonly Cell[];
  eightDot?: boolean;
  size?: number;
  className?: string;
}) {
  if (cells.length === 0) {
    return <span className="text-ink-muted">{"—"}</span>;
  }
  return (
    <span
      aria-hidden="true"
      className={(eightDot ? "font-braille-8" : "font-braille-6") + (className ? " " + className : "")}
      style={size ? { fontSize: `${size}px` } : undefined}
    >
      {cellsToFontString(cells, eightDot)}
    </span>
  );
}

/** Eine Folge von Zellen als Punktraster-Reihe (z. B. ein Braille-Wort). */
export function BrailleCellRow({
  cells,
  eightDot = false,
  size,
  className,
  ariaLabel,
}: {
  cells: readonly Cell[];
  eightDot?: boolean;
  size?: number;
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <div
      className={"flex flex-wrap items-start gap-2 " + (className ?? "")}
      role={ariaLabel ? "group" : undefined}
      aria-label={ariaLabel}
    >
      {cells.map((c, i) => (
        <BrailleCell key={i} cell={c} eightDot={eightDot} size={size} />
      ))}
      {cells.length === 0 && (
        <span className="text-ink-muted">{"—"}</span>
      )}
    </div>
  );
}
