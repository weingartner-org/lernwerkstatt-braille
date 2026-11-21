/**
 * ════════════════════════════════════════════════════════════════════════════
 * DIAGRAMME DER STATISTIKSEITE (08.09.2026)
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Johannes: *„ich möchte diagramme zur veranschaulichung von den daten."*
 *
 * ── ★★★ WARUM JEDES DIAGRAMM NUR EINE REIHE ZEIGT ──────────────────────────
 * Zwei Reihen in einem Bild brauchen eine Legende, und eine Legende trägt ihre
 * Bedeutung in der FARBE. Auf einer Braillezeile kommt Farbe nicht an, und im
 * Kontrastmodus des Betriebssystems verschwindet sie ganz. Deshalb zeigt jedes
 * Bild hier genau eine Grösse; alles Weitere steht in der Tabelle daneben, wo
 * es eine eigene Spalte mit eigener Überschrift bekommt.
 *
 * ── ★★★ WIE DIE BILDER FÜR EINE SPRACHAUSGABE AUSSEHEN ─────────────────────
 * Jedes SVG ist `aria-hidden` - eine Sprachausgabe würde sonst eine Folge von
 * Pfad-Koordinaten vorlesen. Die Aussage steht stattdessen zweimal in echtem
 * Text: als Bildunterschrift in Worten und als vollständige Tabelle, die nur
 * optisch verborgen ist. Damit gilt in beide Richtungen dasselbe: Wer sieht,
 * liest das Bild; wer hört oder tastet, liest die Tabelle - niemand bekommt
 * eine Zusammenfassung statt der Zahlen.
 * (Memory: feedback_grafik_werkzeuge_blindenpaedagogik - Beschreibung ist
 * Pflicht, das Bild ist die Zugabe.)
 *
 * ── Farben ──────────────────────────────────────────────────────────────────
 * Nur `rgb(var(--c-accent))` und die Flächen-Token des Hauses - nie ein fester
 * Farbwert. Sonst bricht das Bild im dunklen Modus (Memory:
 * feedback_baukasten_layout).
 */
import type { ReactNode } from "react";

/* ══ Rahmen: Bild + Unterschrift + verborgene Tabelle ════════════════════════ */

export function Bildrahmen({
  titel,
  aussage,
  tabelle,
  children,
}: {
  titel: string;
  /** Die Kernaussage in einem Satz - sie steht sichtbar unter dem Bild. */
  aussage: string;
  /** Dieselben Daten als echte Tabelle (nur optisch verborgen). */
  tabelle: ReactNode;
  children: ReactNode;
}) {
  return (
    <figure className="m-0">
      <h3 className="text-sm font-semibold text-ink">{titel}</h3>
      <div className="mt-2">{children}</div>
      <figcaption className="mt-2 text-xs leading-relaxed text-ink-muted">
        {aussage}
      </figcaption>
      {/*
        ⚠️ `sr-only` statt `hidden`: Was `display:none` trägt, liest AUCH eine
        Sprachausgabe nicht - die Tabelle wäre dann für genau die Menschen weg,
        für die sie gebaut ist.
      */}
      <div className="sr-only">{tabelle}</div>
    </figure>
  );
}

/* ══ Waagerechte Balken - „welches Programm wie viel?" ═══════════════════════ */

export type BalkenWert = {
  label: string;
  wert: number;
  /** Was rechts am Balken steht. Fehlt es, steht dort die Zahl. */
  anzeige?: string;
};

export function Balken({
  werte,
  einheit,
}: {
  werte: BalkenWert[];
  /** Wortform für die verborgene Tabelle, z. B. "Besuche". */
  einheit: string;
}) {
  const max = Math.max(1, ...werte.map((w) => w.wert));
  return (
    <ul className="space-y-1.5" aria-hidden="true">
      {werte.map((w) => {
        const anteil = Math.max(0, w.wert / max);
        return (
          <li key={w.label} className="grid grid-cols-[10rem_1fr_5rem] items-center gap-2">
            <span className="truncate text-xs text-ink-muted" title={w.label}>
              {w.label}
            </span>
            {/*
              Der Balken ist ein `div` mit Breite in Prozent, kein SVG: Er muss
              mit der Schriftgrösse mitwachsen, wenn jemand die Seite auf 200 %
              zoomt (WCAG 1.4.4) - ein SVG mit fester viewBox täte das nicht.
              4 px runde Enden, an der Grundlinie verankert.
            */}
            <span className="block h-3 rounded-r bg-surface-sunken">
              <span
                className="block h-3 rounded-r"
                style={{
                  width: `${(anteil * 100).toFixed(1)}%`,
                  backgroundColor: "rgb(var(--c-accent))",
                  minWidth: w.wert > 0 ? "2px" : "0",
                }}
              />
            </span>
            <span className="text-right text-xs tabular-nums text-ink">
              {w.anzeige ?? w.wert.toLocaleString("de-AT")}
            </span>
          </li>
        );
      })}
      <li className="sr-only">{einheit}</li>
    </ul>
  );
}

/* ══ Verlauf über die Zeit - „wie entwickelt es sich?" ═══════════════════════ */

export function Verlauf({
  werte,
  hoehe = 120,
}: {
  /** Ein Wert je Tag, in zeitlicher Reihenfolge. */
  werte: number[];
  hoehe?: number;
}) {
  if (werte.length < 2) {
    return (
      <p className="rounded-lg border border-hairline p-4 text-xs text-ink-muted">
        Noch zu wenige Tage für eine Kurve - ab dem zweiten Tag steht sie hier.
      </p>
    );
  }
  const B = 600;
  const H = hoehe;
  const max = Math.max(1, ...werte);
  const x = (i: number) => (i / (werte.length - 1)) * B;
  const y = (v: number) => H - 4 - (v / max) * (H - 12);
  const punkte = werte.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  /*
    Die Fläche ist dieselbe Linie, unten am Rand geschlossen. Sie macht den
    Verlauf auf einem kleinen Bildschirm lesbar, wo eine 2-px-Linie allein
    zwischen den Gitterlinien untergeht.
  */
  const flaeche = `0,${H} ${punkte} ${B},${H}`;
  return (
    <svg
      viewBox={`0 0 ${B} ${H}`}
      className="h-[7.5rem] w-full"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <polygon points={flaeche} fill="rgb(var(--c-accent))" opacity={0.14} />
      <polyline
        points={punkte}
        fill="none"
        stroke="rgb(var(--c-accent))"
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/* ══ Kennzahl mit Herkunfts-Etikett ═════════════════════════════════════════ */

/**
 * ★★★ Das `herkunft`-Feld ist hier keine Zierde, sondern der Grund, warum die
 * Seite nicht in die Irre führt: Dieselbe Frage („wie viele Menschen?") hat je
 * nach Quelle eine andere Antwort - Prüfsummen zählen Tagesbesucher, Geräte
 * zählen Wiederkehrer, Konten zählen Angemeldete. Eine Kachel ohne diese Zeile
 * ist eine Zahl ohne Bedeutung.
 */
export function Kennzahl({
  label,
  wert,
  herkunft,
  hinweis,
  kompakt = false,
}: {
  label: string;
  wert: string | number;
  herkunft: string;
  hinweis?: string;
  /** Kleinere Kachel für die Übersichtszeile. */
  kompakt?: boolean;
}) {
  // Kurze Hinweise stehen offen da, lange hinter „Erklärung" - so wird die
  // Seite nicht von Fussnoten gedehnt, und nichts geht verloren.
  const lang = (hinweis?.length ?? 0) > 90;
  return (
    <div className={`rounded-xl border border-hairline bg-surface-raised ${kompakt ? "p-3" : "p-4"}`}>
      <div className="text-sm text-ink-muted">{label}</div>
      <div
        className={`mt-0.5 font-semibold tabular-nums text-ink ${kompakt ? "text-2xl" : "text-3xl"}`}
      >
        {typeof wert === "number" ? wert.toLocaleString("de-AT") : wert}
      </div>
      <div className="mt-1 text-[0.7rem] uppercase tracking-wide text-ink-soft">
        {herkunft}
      </div>
      {hinweis && !lang ? (
        <p className="mt-2 border-t border-hairline pt-2 text-xs leading-relaxed text-ink-muted">
          {hinweis}
        </p>
      ) : null}
      {hinweis && lang ? (
        <details className="group mt-2 border-t border-hairline pt-2">
          <summary className="cursor-pointer list-none text-xs text-ink-muted underline underline-offset-2 hover:text-ink focus-visible:outline focus-visible:outline-[4.5px] focus-visible:outline-offset-2 focus-visible:outline-accent [&::-webkit-details-marker]:hidden">
            Erklärung
          </summary>
          <p className="mt-1.5 text-xs leading-relaxed text-ink-muted">{hinweis}</p>
        </details>
      ) : null}
    </div>
  );
}
