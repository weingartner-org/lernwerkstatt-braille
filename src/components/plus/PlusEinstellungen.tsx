/**
 * Die Einstellungen von Plus - der INHALT des Fensters, das Alt + O öffnet.
 *
 * ★ Johannes, 17.10.2026: „ansprechender gestalten, mehr Auswahlmenüs,
 * Erklärungen direkt auf der Seite" - und: „ein eigenes Fenster wie bei
 * Tastenflow, nicht den Inhalt nach unten schieben". Bis dahin stand hier eine
 * lange Spalte aus Optionsfeldern über der Übung; sie schob das Eingabefeld
 * unter den Bildschirmrand (gemessen: y = 1117 bei 900 px Fensterhöhe). Wer
 * das sah, hielt das Feld für verschwunden.
 *
 * Aufbau nach dem Vorbild `TypingSettings` (Tastenflow): benannte Gruppen in
 * Karten. Anders als dort steht die Erklärung SICHTBAR unter jedem Menü - nicht
 * erst beim Überfahren - und sie ist zugleich per `aria-describedby` an das
 * Menü gehängt: Sprachausgabe und Braillezeile bekommen denselben Satz.
 *
 * Das Fenster selbst (Escape, Fokusfalle, „Zurück zum Rechnen") ist das
 * gemeinsame `Modal`; welches Ziel der Fokus danach hat, regelt `PlusPage`.
 */
import { altAnzeige } from "@/lib/altTaste";
import { useId, type ReactNode, type RefObject } from "react";
import { SchriftWahl } from "@/components/typing/SchriftWahl";
import {
  BRAILLESCHRIFTEN, ZEILENBREITEN, eingabeartAus,
  type BrailleSchrift, type Eingabeweg, type Vorgabe, type Zeilenbreite,
} from "@/lib/plus/einstellungen";
import { ZOOM_STUFEN } from "@/lib/arbeitsblatt/vergroesserung";
import { ZEICHENABSTAND_FAKTOREN, type ZeichenabstandFaktor } from "@/lib/typing/zeichenabstand";
import { vorlageInZellen } from "./PlusEingabe";
import { usePlusTexte } from "@/lib/plus/sprache";
import { plusSprache } from "@/lib/plus/aktuelleSprache";
import { REGIONEN, hatRegion, type PlusRegion } from "@/lib/plus/regionen";

/** Was der Schalter bewirkt - in einem Satz für das Kind, je nach Stand. */
export const BRAILLEZEILE_ERKLAERUNG = {
  an: "Die ganze Aufgabe steht im Eingabefeld - auch Textaufgaben. Die Zeilen brechen so um, dass du wenig springst. Du schreibst in die Lücke.",
  aus: "Die Aufgabe steht oben, das Eingabefeld ist leer. Du tippst Ziffern und Rechenzeichen auf der Tastatur.",
} as const;

/**
 * Was jede Braille-Schrift heißt, in einem Satz für das Kind - je nachdem, wie es schreibt.
 * ★ Die Schrift bestimmt die AUSGABE (wie die Aufgabe im Feld steht); der Eingabeweg nur, wie geschrieben wird.
 */
export function brailleschriftErklaerung(schrift: BrailleSchrift, eingabe: Eingabeweg): string {
  const aus = schrift === "computer"
    ? "Die Aufgabe steht in Computerbraille im Feld - acht Punkte, jedes Zeichen ist eine Zelle, wie auf deiner Braillezeile."
    : "Die Aufgabe steht in der Mathematikschrift mit sechs Punkten im Feld. Zahlen bekommen das Zahlzeichen davor - wie im Schulbuch.";
  const ein = eingabe === "tastatur"
    ? "Du tippst die Zahlen auf der Tastatur, im Feld wird daraus die Zelle."
    : schrift === "computer"
      ? "Du greifst mit F D S und J K L, dazu A und Ö für Punkt 7 und 8."
      : "Du greifst mit sechs Punkten: F D S und J K L.";
  return `${aus} ${ein}`;
}

/** Was die Breite bedeutet, in einem Satz für das Kind. */
export const BREITE_ERKLAERUNG: Record<Zeilenbreite, string> = {
  40: "Das Feld ist höchstens 40 Zeichen breit, wie eine Braillezeile mit 40 Zellen. Lange Aufgaben brechen öfter um.",
  80: "Das Feld ist höchstens 80 Zeichen breit, wie eine Braillezeile mit 80 Zellen. Die meisten Aufgaben stehen auf einer Zeile.",
};

/**
 * ★ Was die Lehrkraft festgelegt hat, steht als Satz da - kein ausgegrauter
 * Schalter (nichts wird `disabled`, jeder Schalter hat ein Fokus-Ziel).
 */
function Festgelegt({ label, wert }: { label: string; wert: string }) {
  const t = usePlusTexte().einstellungen;
  return (
    <p className="m-0 rounded-lg bg-surface-sunken px-3 py-2 text-sm text-ink">
      <span className="font-medium">{label}:</span> {wert}{t.festgelegtNach}
    </p>
  );
}

/** Die Rechnung, an der jede Methode gezeigt wird - endet auf `=`, damit sie auch die Mathematikschrift trägt. */
const BEISPIEL = "48 +27 =";

const MENUE =
  "w-full rounded-lg border border-hairline bg-surface-raised px-3 py-2 text-base text-ink";

/** Eine Gruppe mit Überschrift - wie in Tastenflow, eine Karte je Thema. */
function Gruppe({ titel, zeichen, children, breit }: { titel: string; zeichen: string; children: ReactNode; breit?: boolean }) {
  const id = useId();
  return (
    <section
      role="group"
      aria-labelledby={id}
      className={`rounded-xl border border-hairline bg-surface p-4 ${breit ? "md:col-span-2" : ""}`}
    >
      <h3 id={id} className="m-0 mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-ink-muted">
        <span aria-hidden="true" className="text-base">{zeichen}</span>
        {titel}
      </h3>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

/**
 * Ein Auswahlmenü mit sichtbarer Erklärung darunter.
 *
 * ★ Die Erklärung ist kein `title` und kein Hinweis beim Überfahren: Sie steht
 * da, und sie hängt per `aria-describedby` am Menü - EIN Satz für alle.
 */
function Menue({
  label,
  erklaerung,
  zusatz,
  wert,
  onWert,
  optionen,
  menueRef,
}: {
  label: string;
  erklaerung: ReactNode;
  zusatz?: ReactNode;
  wert: string;
  onWert: (wert: string) => void;
  optionen: readonly { wert: string; name: string }[];
  menueRef?: RefObject<HTMLSelectElement>;
}) {
  const id = useId();
  const erklaerungId = useId();
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block font-medium text-ink">{label}</label>
      <select
        ref={menueRef}
        id={id}
        aria-describedby={erklaerungId}
        // Alt + O schließt das Fenster auch von hier aus, Alt + B wechselt die Eingabe.
        data-kuerzel="an"
        className={MENUE}
        value={wert}
        onChange={(e) => onWert(e.target.value)}
      >
        {optionen.map((o) => (
          <option key={o.wert} value={o.wert}>{o.name}</option>
        ))}
      </select>
      <p id={erklaerungId} className="m-0 text-sm leading-relaxed text-ink-muted">{erklaerung}</p>
      {zusatz}
    </div>
  );
}

/** Eine Taste, wie sie in der Erklärung genannt wird. */
function Taste({ children }: { children: ReactNode }) {
  // ★ Am Mac heißt die Taste „Wahl" (Johannes, 18.10.2026: „beim Mac überall Wahl").
  const text = typeof children === "string" ? altAnzeige(children) : children;
  return (
    <kbd className="whitespace-nowrap rounded border border-hairline bg-surface-sunken px-1.5 py-0.5 font-mono text-xs text-ink">
      {text}
    </kbd>
  );
}

/** Ein Schalter an/aus mit Erklärung - `role="switch"`, damit „an" oder „aus" mitgesagt wird. */
function SchalterZeile({
  label, erklaerung, an, onUm, schalterRef, zusatz,
}: {
  label: string; erklaerung: ReactNode; an: boolean; onUm: (an: boolean) => void;
  schalterRef?: RefObject<HTMLButtonElement>; zusatz?: ReactNode;
}) {
  const id = useId();
  const erklaerungId = useId();
  const t = usePlusTexte().einstellungen;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-3">
        <span id={id} className="font-medium text-ink">{label}</span>
        <button
          ref={schalterRef}
          type="button"
          role="switch"
          aria-checked={an}
          aria-labelledby={id}
          aria-describedby={erklaerungId}
          data-kuerzel="an"
          onClick={() => onUm(!an)}
          className={`relative inline-flex h-8 w-14 shrink-0 items-center rounded-full border-2 transition-colors ${an ? "border-accent bg-accent" : "border-ink-muted bg-surface-sunken"}`}
        >
          <span
            aria-hidden="true"
            className={`inline-block h-5 w-5 rounded-full bg-surface-raised shadow transition-transform ${an ? "translate-x-7" : "translate-x-1"}`}
          />
          <span className="sr-only">{an ? t.an : t.aus}</span>
        </button>
      </div>
      <p id={erklaerungId} className="m-0 text-sm leading-relaxed text-ink-muted">{erklaerung}</p>
      {zusatz}
    </div>
  );
}

export interface PlusEinstellungenProps {
  /** „Arbeiten mit Braillezeile" - der Schalter, der alles Weitere bestimmt. */
  braillezeile: boolean;
  onBraillezeile: (an: boolean) => void;
  /** Die Schrift, in der gegriffen wird - gilt nur mit Braillezeile. */
  schrift: BrailleSchrift;
  onSchrift: (schrift: BrailleSchrift) => void;
  /** Wie viele Zeichen die Braillezeile hat: 40 oder 80. */
  breite: Zeilenbreite;
  onBreite: (breite: Zeilenbreite) => void;
  /** Wie das Kind schreibt - folgt der Braillezeile; nur eine Vorgabe der Lehrkraft ändert es. */
  eingabe: Eingabeweg;
  /** Was die Lehrkraft festgelegt hat - das Kind ändert es hier nicht. */
  vorgabe?: Vorgabe;
  zoomIndex: number;
  onZoomIndex: (i: number) => void;
  zeichenabstand: ZeichenabstandFaktor;
  onZeichenabstand: (f: ZeichenabstandFaktor) => void;
  ausschreiben: boolean;
  onAusschreiben: (an: boolean) => void;
  /**
   * Land/Region (nur Spanisch und Französisch; 10.11.2026): die Region, die gerade gilt
   * (Wahl des Kindes oder Vorgabe aus der Browser-Sprache), und was bei einer Wahl geschieht.
   * Fehlt `onRegion`, oder ist die Sprache de oder en, steht das Feld nicht da.
   */
  region?: PlusRegion | null;
  onRegion?: (region: PlusRegion) => void;
  /** Das erste Menü - dort steht der Fokus, wenn das Fenster aufgeht. */
  ersterRef?: RefObject<HTMLButtonElement>;
}

export function PlusEinstellungen(p: PlusEinstellungenProps) {
  const t = usePlusTexte().einstellungen;
  const vorgabe = p.vorgabe ?? {};
  const sprache = plusSprache();
  const regionen = hatRegion(sprache) && p.onRegion && p.region ? REGIONEN[sprache] : null;
  const beispiel = p.braillezeile ? vorlageInZellen(BEISPIEL, BEISPIEL.length, eingabeartAus(true, p.schrift)) : null;
  const anAus = (an: string, aus: string) => [
    { wert: "an", name: an },
    { wert: "aus", name: aus },
  ];
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Gruppe titel={t.gruppeEingabe} zeichen="⌨">
        {vorgabe.braillezeile === undefined ? (
          <SchalterZeile
            label={t.braillezeile}
            schalterRef={p.ersterRef}
            an={p.braillezeile}
            onUm={p.onBraillezeile}
            erklaerung={<>{p.braillezeile ? t.zeilenAn : t.zeilenAus} {t.unterwegsVor} <Taste>Alt + B</Taste>{t.unterwegsNach}</>}
          />
        ) : (
          <Festgelegt label={t.braillezeile} wert={p.braillezeile ? t.an : t.aus} />
        )}
        {p.braillezeile && (vorgabe.schrift === undefined ? (
          <Menue
            label={t.schrift}
            wert={p.schrift}
            onWert={(w) => p.onSchrift(w as BrailleSchrift)}
            optionen={BRAILLESCHRIFTEN.map((a) => ({ wert: a, name: t.schriftNamen[a] }))}
            erklaerung={t.schriftErkl(p.schrift, p.eingabe)}
          />
        ) : (
          <Festgelegt label={t.schrift} wert={t.schriftNamen[p.schrift]} />
        ))}
        {p.braillezeile && vorgabe.eingabe !== undefined && (
          <Festgelegt label={t.wieDuSchreibst} wert={t.wegNamen[p.eingabe]} />
        )}
        {p.braillezeile && (vorgabe.breite === undefined ? (
          <Menue
            label={t.breite}
            wert={String(p.breite)}
            onWert={(w) => p.onBreite(Number(w) as Zeilenbreite)}
            optionen={ZEILENBREITEN.map((b) => ({ wert: String(b), name: t.breiteNamen[b] }))}
            erklaerung={t.breiteErkl[p.breite]}
          />
        ) : (
          <Festgelegt label={t.breiteKurz} wert={t.breiteNamen[p.breite]} />
        ))}
        {beispiel && (
          // Das Beispiel ist ein Bild für die Augen - die Erklärungen oben sagen dasselbe in Worten.
          <div aria-hidden="true" className="flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-lg bg-surface-sunken px-3 py-2">
            <span className="text-sm text-ink-muted">{t.soSteht(BEISPIEL)}</span>
            <span className="tt-uebungsschrift font-legible text-2xl text-ink">{beispiel.zellen}</span>
          </div>
        )}
        <Menue
          label={t.ausschreiben}
          wert={p.ausschreiben ? "an" : "aus"}
          onWert={(w) => p.onAusschreiben(w === "an")}
          optionen={anAus(t.ausschreibenJa, t.ausschreibenNein)}
          erklaerung={t.ausschreibenErkl}
        />
        {regionen && p.region && (
          <Menue
            label={t.region}
            wert={p.region}
            onWert={(w) => p.onRegion?.(w as PlusRegion)}
            optionen={regionen.map((r) => ({ wert: r, name: t.regionNamen[r] }))}
            erklaerung={t.regionErkl}
          />
        )}
      </Gruppe>

      <Gruppe titel={t.gruppeAnzeige} zeichen="◐">
        <Menue
          label={t.textgroesse}
          wert={String(p.zoomIndex)}
          onWert={(w) => p.onZoomIndex(Number(w))}
          optionen={ZOOM_STUFEN.map((z, i) => ({ wert: String(i), name: t.prozent(Math.round(z * 100)) }))}
          erklaerung={<>{t.groesseA}<Taste>Alt + Plus</Taste>{t.groesseB}<Taste>Alt + Minus</Taste>{t.groesseC}<Taste>Alt + 0</Taste>{t.groesseD}</>}
        />
        <Menue
          label={t.abstand}
          wert={String(p.zeichenabstand)}
          onWert={(w) => p.onZeichenabstand(Number(w) as ZeichenabstandFaktor)}
          optionen={ZEICHENABSTAND_FAKTOREN.map((f) => ({ wert: String(f), name: t.abstandNamen[f] }))}
          erklaerung={t.abstandErkl}
        />
        {/* ★ Johannes, 16.10.2026: dieselbe Schriftliste wie in Tastenflow, dazu die Schrift gleicher Breite. */}
        <SchriftWahl
          mitMono
          name={t.schriftWahlName}
          hinweis={t.schriftWahlHinweis}
        />
        <p className="m-0 text-sm leading-relaxed text-ink-muted">
          {t.farbenA}<Taste>Alt + K</Taste>{t.farbenB}
        </p>
      </Gruppe>

      {/* ★ Ton und Vorlesen stehen seit 17.10.2026 NUR im Menü unter dem Lautsprecher
          (Johannes: „nur noch im Menü unter dem Lautsprecher, aus den
          Einstellungsfenstern raus"). Hier bleibt der Wegweiser dorthin. */}
      <Gruppe titel={t.gruppeKlang} zeichen="♪" breit>
        <p className="m-0 text-sm leading-relaxed text-ink-muted">
          {t.klangA}
          {" "}<Taste>Alt + V</Taste>{t.klangB}<Taste>{t.strg}</Taste>{t.klangC}
        </p>
      </Gruppe>
    </div>
  );
}
