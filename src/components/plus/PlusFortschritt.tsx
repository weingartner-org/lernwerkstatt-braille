/**
 * Wo stehe ich, was kommt dann? - die Anzeige während der Übung.
 * ============================================================================
 *
 * > **Johannes, 16.10.2026:** „Schüler brauchen während dem Üben mehr Überblick
 * > über das Ganze … man soll wissen, wo man steht. Jetzt kommt eine Übung nach
 * > der anderen, oben steht klein »Aufgabe 1 von 8«." Entwurf:
 * > (Entwurf, nicht veröffentlicht) - gewählt: „wie dein
 * > Vorschlag, außer für die Kleinen A, ab der 6. Schulstufe B2."
 *
 *   • **Perlen** (ALLE Schulstufen seit 16.10.2026 - vorher ab der 6. Felder):
 *     jede Aufgabe eine Perle auf einer durchgehenden Linie - geschafft =
 *     gefüllt mit Haken, jetzt = groß mit Zahl, offen = leer; am Ende die Fahne
 *     oder das Rätsel. Johannes nach dem Entwurf „A2 neu": „nimm die
 *     Zahlenleiste von A3".
 *   • **Wegzeile** (nur „Mein Training"): Etappe n von m als dünner Balken.
 *   • **Rundenkette** (im Abschluss): wie viele Runden es noch bis zum Rätsel sind.
 *
 * ★★★ NUR FÜRS AUGE. Alles hier ist `aria-hidden` - die Sprachausgabe und die
 * Braillezeile bekommen weiter den einen Satz „Aufgabe 4 von 8" (im Aufrufer),
 * dazu bei Bedarf „Danach kommt ein Rätsel" (`sr-only`). Keine neue Live-Region
 * (die verdrängt die Braillezeile), keine Uhr, und KEIN Zeichen für richtig
 * oder falsch: geschafft ist geschafft ([[feedback_nie_gegen_das_kind]]).
 *
 * ★ Die Form trägt die Information, nicht die Farbe: gefüllt mit Haken ·
 * groß mit dickem Rand · gestrichelt. Im Kontrastmodus keine eigene Fläche,
 * sondern die zwei Farben des Kindes (wie `PlusStart`).
 */
import { Fragment } from "react";
import { useContrast } from "@/lib/contrast";
import { plusTexte, usePlusTexte } from "@/lib/plus/sprache";

function useKontrast(): boolean {
  const modus = useContrast((s) => s.mode);
  return modus !== "hell" && modus !== "dunkel";
}

const fuellung = (kontrast: boolean): { className: string; style?: React.CSSProperties } =>
  kontrast
    ? { className: "border-ink bg-ink text-surface-raised" }
    : {
        className: "border-transparent",
        style: { background: "rgb(var(--c-accent-solid))", color: "rgb(var(--c-on-accent))" },
      };

function Haken({ groesse = 18 }: { groesse?: number }) {
  return (
    <svg width={groesse} height={groesse} viewBox="0 0 18 18" aria-hidden="true">
      <path d="M3.5 9.5l3.6 3.6L14.5 5.4" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Fahne() {
  return (
    <svg width="30" height="30" viewBox="0 0 34 34" aria-hidden="true">
      <path d="M9 29V5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M9 6h17l-4 6 4 6H9z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

function Raetsel() {
  return (
    <svg width="32" height="32" viewBox="0 0 34 34" aria-hidden="true">
      <path d="M17 3l13 14-13 14L4 17z" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="5 4" strokeLinejoin="round" />
      <text x="17" y="22" textAnchor="middle" fontSize="14" fontWeight="700" fill="currentColor">?</text>
    </svg>
  );
}

interface AnzeigeProps {
  /** Die laufende Aufgabe, ab 1. */
  nr: number;
  gesamt: number;
  /** Kommt nach dieser Runde ein Rätsel? */
  raetsel: boolean;
}

/** Der Satz, der zusätzlich nur für Sprachausgabe und Braillezeile da ist. */
export function danachSatz(nr: number, gesamt: number, raetsel: boolean): string {
  return plusTexte().uebung.danachSatz(nr, gesamt, raetsel);
}

/* ══ Die Zahlenleiste: Perlen auf einer Linie ═════════════════════════════ */

/**
 * ★ Seit 16.10.2026 für ALLE Schulstufen dieselbe Leiste (Johannes, nach dem
 * Entwurf „A2 neu": „nimm die Zahlenleiste von A3"). Bis dahin standen ab der
 * 6. Schulstufe acht Felder; die sind weg. Die Linie läuft über die ganze
 * Breite, am Ende steht die Fahne oder das Rätsel. Der Satz „Aufgabe n von 8"
 * und „danach: ..." stehen im Aufrufer als Text darüber.
 */
export function PlusPerlen({ nr, gesamt, raetsel }: AnzeigeProps) {
  const kontrast = useKontrast();
  const voll = fuellung(kontrast);
  return (
    <div aria-hidden="true" className="flex items-center overflow-x-auto py-2" data-plus-anzeige="perlen">
      {Array.from({ length: gesamt }, (_, i) => {
        const n = i + 1;
        const art = n < nr ? "fertig" : n === nr ? "jetzt" : "offen";
        return (
          <Fragment key={n}>
            <span
              data-perle={art}
              className={
                art === "fertig"
                  ? `grid h-9 w-9 flex-none place-items-center rounded-full border-2 ${voll.className}`
                  : art === "jetzt"
                    ? `grid h-12 w-12 flex-none place-items-center rounded-full border-2 border-ink text-xl font-bold ring-4 ring-accent-soft ${voll.className}`
                    : "grid h-9 w-9 flex-none place-items-center rounded-full border-2 border-hairline bg-surface-raised text-base font-semibold text-ink-muted"
              }
              style={art === "offen" ? undefined : voll.style}
            >
              {art === "fertig" ? <Haken /> : n}
            </span>
            <span className={`h-1 min-w-3 flex-1 ${n < nr ? "bg-accent" : "bg-hairline"}`} />
          </Fragment>
        );
      })}
      <span className="grid h-9 w-9 flex-none place-items-center text-accent">{raetsel ? <Raetsel /> : <Fahne />}</span>
    </div>
  );
}

/* ══ D: Wegzeile (nur Mein Training) ═══════════════════════════════════════ */

export interface Wegzeile {
  nr: number;
  gesamt: number;
  name: string;
}

export function PlusWegzeile({ weg }: { weg: Wegzeile }) {
  const anteil = weg.gesamt > 0 ? Math.max(0, Math.min(1, (weg.nr - 1) / weg.gesamt)) : 0;
  return (
    <div className="space-y-1" data-plus-anzeige="wegzeile">
      <p className="m-0 text-lg font-medium text-ink">
        {usePlusTexte().uebung.etappeZeile(weg.nr, weg.gesamt, weg.name)}
      </p>
      <div aria-hidden="true" className="h-1.5 w-full overflow-hidden rounded-full border border-hairline bg-surface-raised">
        <div className="h-full bg-accent" style={{ width: `${Math.round(anteil * 100)}%` }} />
      </div>
    </div>
  );
}

/* ══ C: Rundenkette im Abschluss ═══════════════════════════════════════════ */

/**
 * Wie weit die Runden bis zum nächsten Rätsel sind: `alle` Runden, davon
 * `bis` noch offen. Die erste Zeile vor der Kette steht als Satz im Aufrufer.
 */
export function PlusRundenKette({ alle, bis }: { alle: number; bis: number }) {
  const kontrast = useKontrast();
  const voll = fuellung(kontrast);
  const fertig = Math.max(0, Math.min(alle, alle - bis));
  return (
    <div aria-hidden="true" className="flex items-center gap-2" data-plus-anzeige="rundenkette">
      <span className="text-sm text-ink-muted">Runden bis zum Rätsel</span>
      {Array.from({ length: alle }, (_, i) => (
        <span
          key={i}
          className={
            i < fertig
              ? `grid h-6 w-6 place-items-center rounded-full border-2 ${voll.className}`
              : "grid h-6 w-6 place-items-center rounded-full border-2 border-dashed border-hairline"
          }
          style={i < fertig ? voll.style : undefined}
        >
          {i < fertig ? <Haken groesse={12} /> : null}
        </span>
      ))}
      <span className="text-accent"><Raetsel /></span>
    </div>
  );
}
