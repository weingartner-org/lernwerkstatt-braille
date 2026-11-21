import { Icon } from "@/components/Icon";
import { abzeichen, type Wochenziel } from "@/lib/plus/abzeichen";
import { usePlusTexte } from "@/lib/plus/sprache";
import { motivBild } from "@/lib/abzeichen/motivBild";
import { useContrast } from "@/lib/contrast";
import type { Jahresweg } from "@/lib/plus/jahresweg";
import { useUeberschriftFokus } from "./fokus";

/**
 * Die Startseite von Plus (Entwurf A, Johannes 23.09.2026: „Weiterrechnen").
 *
 * ★ „Mein Training" steht vorne, als große Karte mit der Etappe, an der das
 * Kind gerade ist. Bis 23.09.2026 stand „Ich wähle" an erster Stelle - fünf
 * gleich große Knöpfe, und keiner sagte, wo es weitergeht. „Ich wähle" bleibt
 * eine Tür auf derselben Seite, nie gesperrt, nie versteckt.
 *
 * ★ „Meine Zahlen" ist keine Tür mehr. Die Statistik liegt im Konto-Menü der
 * Kopfzeile - wie in Tastenflow und Punktgenau.
 *
 * ★ Farben nur aus der Suite (`accent-solid`, `card`, `hairline`). Das Grün
 * des Zeichens bleibt im Zeichen: Eine eigene Farbe hier liefe am Dunkel-
 * und am Kontrastmodus vorbei, die alle Apps über dieselben Variablen führen.
 */
export interface PlusStartProps {
  /** Der Vorname aus dem Konto - ohne Konto nichts. */
  name?: string | null;
  angemeldet: boolean;
  gerechnet: number;
  /** Der Weg durch die Stufe - fehlt, solange noch keine Stufe feststeht. */
  weg: Jahresweg | null;
  /** Die Abzeichen, in der Reihenfolge, in der sie gefunden wurden. */
  gefunden: readonly string[];
  wochenziel: Wochenziel;
  /** Die Klasse kann „Ich wähle" und die Spiele ausschalten (Einstellungen der Klasse). */
  freieWahl?: boolean;
  spiele?: boolean;
  /** „Meine Sammlung" (Abzeichen) - in Sprachen ohne übersetzte Abzeichen aus. */
  sammlung?: boolean;
  onWahl: () => void;
  onTraining: () => void;
  onSammlung: () => void;
  onSpiele: () => void;
  onAnmelden?: () => void;
  /**
   * Die Übung für alle, die die Lehrkraft gestartet hat und die das Kind noch
   * nicht fertig hat - sonst `null`. Sie steht dann ganz oben.
   */
  fuerAlle?: { namen: string; anzahl: number } | null;
  onFuerAlle?: () => void;
}

/** Der Ring des Wochenziels - nur fürs Auge; die Zahl steht daneben als Text. */
function Ring({ anteil, kontrast }: { anteil: number; kontrast: boolean }) {
  const r = 26;
  const umfang = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 64 64" className="h-16 w-16 shrink-0" aria-hidden="true">
      {/* Im Kontrastmodus ist die Spur nur ein dünner Strich - in voller Stärke
          sähe ein leerer Ring dort aus wie ein voller. */}
      <circle cx="32" cy="32" r={r} fill="none" strokeWidth={kontrast ? 2 : 8} className={kontrast ? "stroke-ink" : "stroke-accent-soft"} />
      <circle
        cx="32" cy="32" r={r} fill="none" strokeWidth="8" strokeLinecap="round"
        className={kontrast ? "stroke-ink" : "stroke-accent"}
        strokeDasharray={`${(umfang * Math.min(1, anteil)).toFixed(1)} ${umfang.toFixed(1)}`}
        transform="rotate(-90 32 32)"
      />
    </svg>
  );
}

function Tuer({ titel, satz, icon, onClick }: { titel: string; satz: string; icon: "list" | "sparkles" | "book"; onClick: () => void }) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className="card flex min-h-[44px] w-full items-center gap-4 p-4 text-left text-ink hover:bg-surface-sunken"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
          <Icon name={icon} size={22} />
        </span>
        <span>
          <span className="block text-lg font-semibold">{titel}</span>
          <span className="block text-ink-muted">{satz}</span>
        </span>
      </button>
    </li>
  );
}

export function PlusStart({
  name, angemeldet, gerechnet, weg, gefunden, wochenziel, freieWahl = true, spiele = true, sammlung = true,
  onWahl, onTraining, onSammlung, onSpiele, onAnmelden, fuerAlle, onFuerAlle,
}: PlusStartProps) {
  const ueberschrift = useUeberschriftFokus<HTMLHeadingElement>();
  const t = usePlusTexte().start;
  const modus = useContrast((s) => s.mode);
  const kontrast = modus !== "hell" && modus !== "dunkel";
  const neuestes = gefunden.length ? abzeichen(gefunden[gefunden.length - 1]) : undefined;
  const vorname = name?.trim().split(/\s+/)[0];

  const trainingTitel = !weg
    ? t.trainingSucht
    : weg.etappe
      ? t.etappe(weg.etappe.nr, weg.etappe.name)
      : t.allesGeschafft;

  return (
    <section className="space-y-6" aria-labelledby="plus-start">
      <div>
        <h2 id="plus-start" ref={ueberschrift} tabIndex={-1} className="text-3xl font-semibold text-ink">
          {vorname ? t.hallo(vorname) : t.willkommen}
        </h2>
        <p className="mt-1 text-lg text-ink-muted">
          {gerechnet > 0 ? t.wiederDa : t.neu}
        </p>
      </div>

      {/* ★ Die Übung der Lehrkraft steht VOR „Mein Training": In der Stunde
          ist sie das, was jetzt dran ist (Johannes, 28.09.2026). Ein Rahmen,
          keine Fläche - die Fläche gehört dem Training, und zwei gleich laute
          Karten nebeneinander sagen nicht mehr, wo es losgeht. */}
      {fuerAlle && onFuerAlle && (
        <section aria-labelledby="plus-fuer-alle" className="card flex flex-col gap-3 border-2 border-accent p-5">
          <p className="m-0 text-sm font-semibold uppercase tracking-wide text-ink-muted">{t.fuerAlleKopf}</p>
          <h3 id="plus-fuer-alle" className="m-0 text-xl font-semibold text-ink">{fuerAlle.namen}</h3>
          <p className="m-0 text-ink">{t.fuerAlleAnzahl(fuerAlle.anzahl)}</p>
          <button type="button" onClick={onFuerAlle} className="btn-primary self-start px-6 text-lg font-semibold">
            {t.losGeht}
            <Icon name="chevronRight" size={20} />
          </button>
        </section>
      )}

      <div className="grid gap-4 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        {/* Die Karte trägt die Fläche der Hauptknöpfe aller Apps
            (`--c-accent-solid` / `--c-on-accent`) - im Dunkelmodus kehrt sich
            beides mit um. ★ Im Kontrastmodus keine Fläche: Dort hat das Kind
            seine zwei Farben gewählt (etwa Gelb auf Schwarz), und eine blaue
            Fläche bräche genau die Wahl. Dann ein kräftiger Rahmen. */}
        <section
          aria-labelledby="plus-training"
          className={`flex flex-col gap-4 rounded-2xl border-2 p-6 ${kontrast ? "border-ink bg-surface-raised text-ink" : "border-transparent"}`}
          style={kontrast ? undefined : { background: "rgb(var(--c-accent-solid))", color: "rgb(var(--c-on-accent))" }}
        >
          <p className="m-0 text-sm font-semibold uppercase tracking-wide opacity-90">
            {t.trainingMarke(weg ? weg.stufe : null)}
          </p>
          <h3 id="plus-training" className="m-0 text-2xl font-semibold">{trainingTitel}</h3>
          <p className="m-0 opacity-90">{t.rundeInfo}</p>
          <button
            type="button"
            onClick={onTraining}
            className={kontrast
              ? "btn-primary self-start px-6 text-lg font-semibold"
              : "btn self-start bg-surface-raised px-6 text-lg font-semibold text-accent hover:bg-surface-sunken"}
          >
            {weg ? t.weiterrechnen : t.losGeht}
            <Icon name="chevronRight" size={20} />
          </button>
          {weg && (
            <div className="space-y-2">
              <div className="flex gap-1" aria-hidden="true">
                {Array.from({ length: weg.gesamt }, (_, i) => (
                  <span
                    key={i}
                    className="h-2.5 flex-1 rounded-full"
                    style={{
                      background: kontrast ? "currentColor" : "rgb(var(--c-on-accent))",
                      opacity: i < weg.geschafft ? 1 : weg.etappe && i === weg.etappe.nr - 1 ? 0.6 : 0.25,
                    }}
                  />
                ))}
              </div>
              <p className="m-0 text-sm opacity-90">
                {t.etappenGeschafft(weg.geschafft, weg.gesamt)}
              </p>
            </div>
          )}
        </section>

        <div className="flex flex-col gap-4">
          <section aria-labelledby="plus-woche" className="card flex items-center gap-4 p-5">
            <Ring anteil={wochenziel.ziel > 0 ? wochenziel.geschafft / wochenziel.ziel : 0} kontrast={kontrast} />
            <div>
              <h3 id="plus-woche" className="m-0 text-lg font-semibold text-ink">{t.wochenzielTitel}</h3>
              <p className="m-0 text-ink-muted">{t.wochenstand(wochenziel.geschafft, wochenziel.ziel)}</p>
            </div>
          </section>
          {neuestes && (
            <section aria-labelledby="plus-neu" className="card flex items-center gap-4 p-5">
              <img src={motivBild(neuestes.emoji, kontrast)} alt="" aria-hidden="true" className="h-14 w-14 shrink-0" />
              <div>
                <h3 id="plus-neu" className="m-0 text-lg font-semibold text-ink">Zuletzt gefunden</h3>
                <p className="m-0 text-ink-muted">{neuestes.name} - {neuestes.bildbeschreibung}.</p>
              </div>
            </section>
          )}
        </div>
      </div>

      <section aria-labelledby="plus-oder" className="space-y-3">
        <h3 id="plus-oder" className="m-0 text-lg font-semibold text-ink-muted">{t.oder}</h3>
        <ul className={`m-0 grid list-none gap-3 p-0 ${[freieWahl, spiele, sammlung].filter(Boolean).length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
          {freieWahl && <Tuer titel={t.wahlTitel} satz={t.wahlSatz} icon="list" onClick={onWahl} />}
          {spiele && <Tuer titel={t.spieleTitel} satz={t.spieleSatz} icon="sparkles" onClick={onSpiele} />}
          {sammlung && (
            <Tuer
              titel={t.sammlungTitel}
              satz={gefunden.length === 0 ? t.sammlungLeer : t.sammlungAnzahl(gefunden.length)}
              icon="book"
              onClick={onSammlung}
            />
          )}
        </ul>
      </section>

      {!angemeldet && onAnmelden && (
        <p className="flex flex-wrap items-center gap-3 text-ink-muted">
          {t.anmeldenSatz}
          <button type="button" className="btn-secondary" onClick={onAnmelden}>{t.anmelden}</button>
        </p>
      )}
    </section>
  );
}
