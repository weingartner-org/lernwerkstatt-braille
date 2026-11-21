/**
 * „Punktgenau" — Einstellungen (Alt + O).
 *
 * ★★★ CHARGE „SCHLANK" (20.09.2026, Auftrag Johannes anhand eines
 * Screenshots): Die Übungsfläche trug bis dahin ZWEI Karten übereinander -
 * die zweite („Leiste 2") war reine Schalter-Leiste: Schriftsystem, Sounds,
 * Fehler-Tipp, Vorlesen samt Tempo und Stimme. Für ein Kind, das gerade
 * schreiben oder lesen übt, stand das immer im Weg, obwohl es fast nie
 * gebraucht wird.
 *
 * ★★ KORREKTUR JOHANNES (noch am selben Abend): Nur DREI der vier Gruppen
 * wandern hinter das Zahnrad - Sounds, Fehler-Tipp und der Vorlesen-Block.
 * Die Schrift-Ausklappliste bleibt SICHTBAR: Sie steht jetzt in der oberen
 * Karte (`Punktgenau.tsx`), direkt links neben der Etappen-Liste
 * ([Schrift] ← [Etappe] →) - Johannes wollte den Bereichswechsel nicht hinter
 * einem zusätzlichen Klick verstecken.
 *
 * ★ Die Zustände selbst (Sounds, Fehler-Tipp) bleiben, wo sie schon waren - in
 * `Punktgenau.tsx`. Dieses Fenster ist nur die ANSICHT darauf, wie
 * `BrailleZeichenliste` es für die Zeichenliste schon vormacht: EIN Ort führt
 * den Zustand, kein zweiter Speicher, der auseinanderlaufen könnte
 * ([[feedback_zwei_stellen_die_voneinander_nichts_wissen]]).
 *
 * ⚠️ Keine Emoji als Gruppen-Sinnbild (Bauart dieser App: Braillezeilen zeigen
 * sie als Füllmuster) - anders als das Vorbild in eine andere App der Plattform. Hier reichen
 * Überschriften.
 */
import { altAnzeige } from "@/lib/altTaste";
import type { ReactNode } from "react";
import { Modal } from "@/components/Modal";
import { pg } from "@/lib/braille/sprachen/pg";

const SCHALTER = "btn-toggle";

/** Eine beschriftete Gruppe im Fenster — wie `Gruppe` in eine andere App der Plattforms
 *  EinstellungenModal, nur ohne Icon-Spalte (siehe Kopf dieser Datei). */
function Gruppe({
  titel,
  hinweis,
  children,
}: {
  titel: string;
  hinweis?: string;
  children: ReactNode;
}) {
  return (
    <section className="border-t border-hairline pt-4 first:border-t-0 first:pt-0">
      <h3 className="font-semibold text-ink">{titel}</h3>
      {hinweis && <p className="mt-1 text-ink-muted">{hinweis}</p>}
      <div className="mt-2">{children}</div>
    </section>
  );
}

export interface PunktgenauEinstellungenProps {
  onClose: () => void;
  /** Gelten gerade Großschreibzeichen (Ankündigungszelle vor großen
   *  Buchstaben in Basis-/Vollschrift)? Der schon fertig gerechnete Wert aus
   *  `Punktgenau.tsx` - eigene Einstellung ohne Klasse, sonst die der
   *  Lehrkraft. */
  grossschreibzeichen: boolean;
  /** Gehört diese Person zu keiner Klasse (siehe `ohneKlasse` in
   *  `Punktgenau.tsx`)? Nur dann zeigt diese Gruppe einen Schalter - sonst
   *  nur den Hinweis, wer einstellt. */
  ohneKlasse: boolean;
  /** Nur aufgerufen, wenn `ohneKlasse` - schaltet die eigene, gespeicherte
   *  Einstellung um. */
  onToggleGrossschreibzeichen: () => void;
}

export function PunktgenauEinstellungen({
  onClose,
  grossschreibzeichen,
  ohneKlasse,
  onToggleGrossschreibzeichen,
}: PunktgenauEinstellungenProps) {
  return (
    <Modal
      title={pg("Einstellungen — Punktgenau", (t) => t.einstellungen.titel)}
      onClose={onClose}
      // xl wie in den Geschwister-Apps seit dem 19.09.2026 (schmal machte den
      // Vorlesen-Block mit zwei Pulldowns eng).
      size="xl"
      zurueck={pg("Zurück zur Übung", (t) => t.einstellungen.zurueck)}
      kompakt
    >
      <div className="space-y-5 text-sm">
        {/* ── Großschreibzeichen ─────────────────────────────────────────── */}
        <Gruppe
          titel={pg("Großschreibzeichen", (t) => t.einstellungen.grossTitel)}
          hinweis={
            ohneKlasse
              ? pg(
                  "Vor jedem großen Buchstaben steht eine eigene Ankündigungszelle. Du kannst sie abschalten und später wieder dazuschalten.",
                  (t) => t.einstellungen.grossHinweis,
                )
              : undefined
          }
        >
          {ohneKlasse ? (
            <button
              type="button"
              aria-pressed={grossschreibzeichen}
              onClick={onToggleGrossschreibzeichen}
              className={(grossschreibzeichen ? "btn-primary" : "btn-secondary") + " " + SCHALTER}
            >
              {pg(
                grossschreibzeichen ? "Großschreibzeichen an" : "Großschreibzeichen aus",
                (t) => (grossschreibzeichen ? t.einstellungen.grossAn : t.einstellungen.grossAus),
              )}
            </button>
          ) : (
            // ⚠️ Kein abgeblendeter Schalter (Bauart §3: nie `disabled`) und
            // kein Satz, der klingt, als hätte das Kind etwas falsch gemacht
            // - nur die sachliche Zuständigkeit samt aktuellem Stand.
            <p className="text-ink-muted">
              {pg(
                `Das stellt deine Lehrkraft für die Klasse ein. Großschreibzeichen sind gerade ${grossschreibzeichen ? "an" : "aus"}.`,
                (t) => t.einstellungen.klasse(grossschreibzeichen),
              )}
            </p>
          )}
        </Gruppe>

        {/* ── Ton und Vorlesen ──────────────────────────────────────────────
            ★ Seit 17.10.2026 NUR im Menü unter dem Lautsprecher (Johannes:
            „nur noch im Menü unter dem Lautsprecher, aus den
            Einstellungsfenstern raus") - Sounds, Fehler-Tipp, Tempo, Stimme
            und die Lautstärken. Hier bleibt der Wegweiser dorthin. */}
        <Gruppe titel={pg("Klang und Vorlesen", (t) => t.einstellungen.klangTitel)}>
          <p className="text-ink-muted">
            {pg(
              `Vorlesen, Sprechtempo, Stimme, Fehler-Tipp, Töne und Lautstärke stellst du im Menü unter dem Lautsprecher in der Kopfzeile ein. ${altAnzeige("Alt + V")} schaltet das Vorlesen direkt um.`,
              (t) => t.einstellungen.klangText(altAnzeige("Alt + V")),
            )}
          </p>
        </Gruppe>
      </div>
    </Modal>
  );
}
