/**
 * Der Reiter „Plus" in „Meine Klasse" - die Lehrkraft-Ansicht von Plus.
 * ============================================================================
 *
 * > **Johannes, 23.09.2026:** „mach einen Reiter in »Meine Klasse«" - und
 * > danach: „a) je Übung, bau es ein", dazu: Die Schulstufe eines Kindes in
 * > einer Klasse bestimmt die Klasse, nicht das Kind.
 *
 * > **Johannes, 16.10.2026:** „die Lehrerseite von Plus gibt viel zu wenig
 * > Metadaten über die übenden Schüler frei. Zudem ist kaum etwas
 * > einzustellen. Gestalte die Seite nach der Verwaltungsseite von Tastenflow …
 * > mach auch einiges als Klassenüberblick und dann jeder Schüler zum genau
 * > Schauen."
 *
 * ★★★★★ LESEN: WAS DIE LEHRKRAFT SEHEN DARF, STEHT IN `lib/plus/klassenblick.ts`.
 * Seit 16.10.2026 sieht sie MEHR als das Kind über sich selbst (zuletzt
 * gerechnet, Quote je Zeitraum, je Rechenart, je Übung, woran der Coach
 * arbeitet). Was GEBLIEBEN ist: keine Zeit, kein Tempo, keine Reihung, kein
 * Etikett - dort steht auch, warum.
 *
 * ★★★★★ SCHREIBEN: WIE IN TASTENFLOW, NIE IN DEN FORTSCHRITT.
 * Die Lehrkraft setzt BESCHLÜSSE (Schulstufe je Kind, Einstufung je Übung, die
 * Übung für alle, die Einstellungen der Klasse). Sie landen im Konto des
 * Kindes (`tt_pupils.plusBeschluss`); die App des Kindes liest sie. Den
 * Fortschritt (`lw_progress`) schreibt weiter nur das Kind. Regeln:
 * `lib/plus/beschluss.ts`.
 *
 * AUFBAU (wie `TastenflowReiter`): Leiste mit Schaltern, die je einen Kasten
 * aufklappen (Übung für alle · Einstellungen der Klasse · Staffel) - dann der
 * Klassenüberblick - dann die Tabelle, je Kind aufklappbar.
 *
 * Anrede „Sie" (K21).
 */
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Aufklappen } from "@/components/Aufklappen";
import {
  AUFKLAPP_KNOPF_ZELLE,
  AUFKLAPP_ZEILE,
  AufklappHuelle,
  AufklappKnopf,
  aufklappGrund,
} from "@/components/lernwerkstatt/klasse/AufklappKnopf";
import { LwPupilMessageButton } from "@/components/lernwerkstatt/LwTeacherCompose";
import { PlusUeberblick, Wochensaeulen } from "@/components/lernwerkstatt/klasse/PlusUeberblick";
import { typingBackend, type TypingAccount, type TypingClass } from "@/lib/typing";
import { aktuelleSchulstufe } from "@/lib/typing/klassenEinstellungen";
import { WOCHENZIELE, kalenderwoche } from "@/lib/plus/abzeichen";
import {
  PLUS_STUFE_MAX, PLUS_STUFE_MIN, heileBeschluss, heileKlasse, mitFuerAlle, mitKindBraille, mitKlasse, mitStufe, mitUebung,
  plusStufeAusKlasse, type KindBraille, type KlassenEinstellung, type PlusBeschluss, type UebungsBeschluss,
} from "@/lib/plus/beschluss";
import {
  BRAILLESCHRIFTEN, BRAILLESCHRIFT_NAME, EINGABEWEGE, EINGABEWEG_NAME, ZEILENBREITEN, ZEILENBREITE_NAME,
  type BrailleSchrift, type Eingabeweg, type Zeilenbreite,
} from "@/lib/plus/einstellungen";
import { tagesnummer } from "@/lib/plus/coach";
import {
  FUER_ALLE_ANZAHLEN, FUER_ALLE_MAX_PAKETE, namenFuerAlle, neueUebungFuerAlle, stufenFuerAlle,
  type UebungFuerAlle,
} from "@/lib/plus/lehrerUebung";
import { paketeDerStufe } from "@/lib/plus/stoffplan";
import { liesKlasse, type PlusFortschritt } from "@/lib/plus/fortschritt";
import {
  UEBUNGEN_GESAMT, WIE_LEHRKRAFT, klassenSatz, stufenSatz,
} from "@/lib/plus/klassenstand";
import {
  ZEITRAEUME, artZeilen, besserGeworden, hinweise as klassenHinweise, kindBlick, klassenBlick, musterZeilen,
  prozent, trendQuote, uebungsZeilen, wochenSaeulen, wochenSaeulenKind, zuletztSatz,
  type KindBlick, type Zeitraum,
} from "@/lib/plus/klassenblick";
import { staffelFuer, stand as staffelStand } from "@/lib/plus/staffel";
import { liesTafelFuer, type Tafel } from "@/lib/plus/staffelTafel";

/** Wie viele Spalten die Tabelle hat - für `colSpan` der Aufklapp-Zeile. */
const SPALTEN = 10;

const PLUS_STUFEN = Array.from(
  { length: PLUS_STUFE_MAX - PLUS_STUFE_MIN + 1 },
  (_, i) => PLUS_STUFE_MIN + i,
);

const WAHL_UEBUNG: { wert: "" | UebungsBeschluss; text: string }[] = [
  { wert: "", text: "wie der Coach sagt" },
  { wert: "sitzt", text: "sitzt" },
  { wert: "offen", text: "noch einmal üben" },
];

const auswahlKlasse =
  "rounded-lg border border-hairline bg-surface-raised px-2 py-1 text-sm text-ink";

/** Die Schalter der Leiste - dieselben Klassen wie in Tastenflow. */
const leistenSchalter = "btn-secondary btn-toggle btn-umriss aria-expanded:bg-accent-soft";

function anteil(teil: number, ganz: number): string {
  if (ganz <= 0) return "-";
  return `${teil} von ${ganz} (${Math.round((teil / ganz) * 100)} Prozent)`;
}

/** Was die Auswahl „wie die Klasse" heisst - je nachdem, ob die Klasse eine Stufe hat. */
function wieDieKlasse(plusKlasse: number | null): string {
  return plusKlasse === null ? "frei wählen" : `wie die Klasse (${plusKlasse}.)`;
}

/** Ein Pfeil mit Zahl für „mehr oder weniger als im Zeitraum davor" - ab 10 Prozent, mindestens 3. */
function trendZahl(jetzt: number, davor: number | null): { pfeil: "↗" | "↘" | "→"; d: number } | null {
  if (davor === null) return null;
  const d = jetzt - davor;
  const schwelle = Math.max(3, Math.round(davor * 0.1));
  return { pfeil: d >= schwelle ? "↗" : d <= -schwelle ? "↘" : "→", d };
}

/** Eine Zelle mit Zahl und Pfeil; die Sprachausgabe bekommt den ganzen Satz. */
function ZahlMitPfeil({
  wert, satz, pfeil, pfeilSatz,
}: { wert: string; satz: string; pfeil?: string; pfeilSatz?: string }) {
  return (
    <>
      <span aria-hidden="true">
        {wert}
        {pfeil ? <span className="ml-1 text-ink-muted">{pfeil}</span> : null}
      </span>
      <span className="sr-only">{satz}{pfeilSatz ? `, ${pfeilSatz}` : ""}</span>
    </>
  );
}

/* ══ Die Einstellungen der Klasse ═══════════════════════════════════════════ */

function schluesselKlasse(k: KlassenEinstellung): string {
  return JSON.stringify(heileKlasse(k));
}

/** Die Einstellung, die bei den meisten Kindern steht - und die Kinder, bei denen sie anders ist. */
function klassenStand(konten: readonly TypingAccount[]): { aktuell: KlassenEinstellung; abweichend: TypingAccount[] } {
  const zaehler = new Map<string, { k: KlassenEinstellung; n: number }>();
  for (const konto of konten) {
    const k = heileBeschluss(konto.plusBeschluss).klasse ?? {};
    const s = schluesselKlasse(k);
    const e = zaehler.get(s) ?? { k, n: 0 };
    e.n += 1;
    zaehler.set(s, e);
  }
  // Bei Gleichstand gewinnt die Einstellung mit mehr Inhalt: Wer etwas eingestellt hat, wollte es.
  const beste = [...zaehler.values()].sort((a, b) => b.n - a.n || Object.keys(b.k).length - Object.keys(a.k).length)[0];
  const aktuell = beste?.k ?? {};
  const s = schluesselKlasse(aktuell);
  return {
    aktuell,
    abweichend: konten.filter((konto) => schluesselKlasse(heileBeschluss(konto.plusBeschluss).klasse ?? {}) !== s),
  };
}

/** Ein Satz über die Einstellungen - für die Leiste und die Statuszeile. */
export function klassenEinstellungSatz(k: KlassenEinstellung): string {
  const teile: string[] = [];
  teile.push(k.wochenziel ? `Wochenziel ${k.wochenziel}` : "Wochenziel frei");
  if (k.raetsel === 0) teile.push("keine Rätsel");
  else if (k.raetsel === 5) teile.push("Rätsel alle 5 Runden");
  if (k.freieWahl === false) teile.push("ohne „Ich wähle“");
  if (k.spiele === false) teile.push("ohne Spiele");
  if (k.rechenweg === false) teile.push("ohne Rechenweg");
  if (k.braillezeile) teile.push("Braillezeile an");
  if (k.schrift) teile.push(BRAILLESCHRIFT_NAME[k.schrift]);
  if (k.breite) teile.push(`${k.breite} Zeichen`);
  if (k.eingabe) teile.push(EINGABEWEG_NAME[k.eingabe]);
  return teile.join(" · ");
}

/**
 * ★ Die drei Braille-Einstellungen (Johannes, 19.10.2026: „die neuen Einstellungen soll
 * auch der Lehrer unter Meine Klassen / Plus einstellen können"): Braillezeile, Schrift
 * und 40 oder 80 Zeichen. Für die Klasse und für ein einzelnes Kind dieselben Menüs; die
 * erste Wahl heißt immer „das Kind wählt selbst" bzw. „wie die Klasse" - dann steht nichts im Beschluss.
 */
function BrailleWahl({
  id, wert, onWert, ohne, zeileAus,
}: {
  id: string;
  wert: KindBraille;
  onWert: (neu: KindBraille) => void;
  /** Der Text der Wahl „nichts festlegen". */
  ohne: string;
  /** Gibt es die Wahl „aus"? (Nur beim einzelnen Kind: die Klasse kann es nicht erzwingen, nur vorgeben.) */
  zeileAus: boolean;
}) {
  const setze = (teil: Partial<KindBraille>, weg?: keyof KindBraille) => {
    const neu: KindBraille = { ...wert, ...teil };
    if (weg) delete neu[weg];
    onWert(neu);
  };
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="block text-sm text-ink" htmlFor={`${id}-zeile`}>
        Braillezeile
        <select
          id={`${id}-zeile`}
          className={`${auswahlKlasse} mt-1 block`}
          value={wert.braillezeile === undefined ? "" : wert.braillezeile ? "an" : "aus"}
          onChange={(e) => e.target.value === ""
            ? setze({}, "braillezeile")
            : setze({ braillezeile: e.target.value === "an" })}
        >
          <option value="">{ohne}</option>
          <option value="an">Arbeiten mit Braillezeile: an</option>
          {zeileAus && <option value="aus">Arbeiten mit Braillezeile: aus</option>}
        </select>
      </label>
      <label className="block text-sm text-ink" htmlFor={`${id}-schrift`}>
        Braille-Schrift
        <select
          id={`${id}-schrift`}
          className={`${auswahlKlasse} mt-1 block`}
          value={wert.schrift ?? ""}
          onChange={(e) => e.target.value === ""
            ? setze({}, "schrift")
            : setze({ schrift: e.target.value as BrailleSchrift })}
        >
          <option value="">{ohne}</option>
          {BRAILLESCHRIFTEN.map((b) => <option key={b} value={b}>{BRAILLESCHRIFT_NAME[b]}</option>)}
        </select>
      </label>
      <label className="block text-sm text-ink" htmlFor={`${id}-eingabe`}>
        Wie die Kinder schreiben
        <select
          id={`${id}-eingabe`}
          className={`${auswahlKlasse} mt-1 block`}
          value={wert.eingabe ?? ""}
          onChange={(e) => e.target.value === ""
            ? setze({}, "eingabe")
            : setze({ eingabe: e.target.value as Eingabeweg })}
        >
          <option value="">{ohne}</option>
          {EINGABEWEGE.map((b) => <option key={b} value={b}>{EINGABEWEG_NAME[b]}</option>)}
        </select>
      </label>
      <label className="block text-sm text-ink" htmlFor={`${id}-breite`}>
        Zeichen je Zeile
        <select
          id={`${id}-breite`}
          className={`${auswahlKlasse} mt-1 block`}
          value={wert.breite ?? ""}
          onChange={(e) => e.target.value === ""
            ? setze({}, "breite")
            : setze({ breite: Number(e.target.value) as Zeilenbreite })}
        >
          <option value="">{ohne}</option>
          {ZEILENBREITEN.map((b) => <option key={b} value={b}>Braillezeile mit {ZEILENBREITE_NAME[b]}</option>)}
        </select>
      </label>
    </div>
  );
}

function EinstellungenKasten({
  id, konten, klassenStufe, plusKlasse, onSetze,
}: {
  id: string;
  konten: TypingAccount[];
  klassenStufe: number | null;
  plusKlasse: number | null;
  onSetze: (k: KlassenEinstellung) => Promise<void>;
}) {
  const { aktuell, abweichend } = useMemo(() => klassenStand(konten), [konten]);
  const [arbeitet, setArbeitet] = useState(false);
  const feld = useId();

  const setze = async (teil: Partial<KlassenEinstellung>, ohne: (keyof KlassenEinstellung)[] = []) => {
    if (arbeitet) return;
    const neu: KlassenEinstellung = { ...aktuell, ...teil };
    for (const k of ohne) delete neu[k];
    setArbeitet(true);
    await onSetze(neu);
    setArbeitet(false);
  };

  const haken = (
    schluessel: "freieWahl" | "spiele" | "rechenweg", text: string, hilfe: string,
  ) => (
    <label className="flex items-start gap-2 text-sm text-ink">
      <input
        type="checkbox"
        className="mt-1"
        checked={aktuell[schluessel] !== false}
        onChange={(e) => void (e.target.checked ? setze({}, [schluessel]) : setze({ [schluessel]: false }))}
      />
      <span>
        {text}
        <span className="block text-xs text-ink-muted">{hilfe}</span>
      </span>
    </label>
  );

  return (
    <div id={id} className="space-y-3 rounded-xl border border-hairline bg-surface-sunken p-4">
      <h3 className="m-0 text-base font-semibold text-ink">Einstellungen der Klasse</h3>

      <p className="m-0 text-sm text-ink">
        {plusKlasse === null
          ? "Für diese Klasse ist keine Schulstufe eingetragen. Die Kinder wählen ihre Stufe in Plus darum selbst - bis Sie eine eintragen (Einstellungen der Klasse oben auf der Seite) oder in der Tabelle für ein Kind eine festlegen."
          : klassenStufe !== null && klassenStufe > PLUS_STUFE_MAX
            ? `Die Klasse rechnet in Plus in der ${plusKlasse}. Schulstufe - Plus reicht bis zur ${PLUS_STUFE_MAX}. Für ein einzelnes Kind können Sie in der Tabelle eine andere Stufe wählen.`
            : `Die Klasse rechnet in Plus in der ${plusKlasse}. Schulstufe, wie in den Einstellungen der Klasse eingetragen. Für ein einzelnes Kind können Sie in der Tabelle eine andere wählen.`}
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm text-ink" htmlFor={`${feld}-ziel`}>
          Wochenziel
          <select
            id={`${feld}-ziel`}
            className={`${auswahlKlasse} mt-1 block`}
            value={aktuell.wochenziel ?? ""}
            onChange={(e) => void (e.target.value === ""
              ? setze({}, ["wochenziel"])
              : setze({ wochenziel: Number(e.target.value) }))}
          >
            <option value="">Jedes Kind wählt selbst</option>
            {WOCHENZIELE.map((z) => (
              <option key={z} value={z}>{z} Aufgaben pro Woche für alle</option>
            ))}
          </select>
        </label>

        <label className="block text-sm text-ink" htmlFor={`${feld}-raetsel`}>
          Rätsel zwischen den Runden
          <select
            id={`${feld}-raetsel`}
            className={`${auswahlKlasse} mt-1 block`}
            value={aktuell.raetsel === undefined ? "" : String(aktuell.raetsel)}
            onChange={(e) => void (e.target.value === ""
              ? setze({}, ["raetsel"])
              : setze({ raetsel: Number(e.target.value) as 0 | 5 }))}
          >
            <option value="">Nach jeder dritten Runde</option>
            <option value="5">Nach jeder fünften Runde</option>
            <option value="0">Keine Rätsel</option>
          </select>
        </label>
      </div>

      <fieldset className="m-0 space-y-2 border-0 p-0">
        <legend className="mb-1 text-sm text-ink">Was die Kinder in Plus dürfen</legend>
        {haken("freieWahl", "„Ich wähle“ - eine Übung selbst aussuchen",
          "Aus: Es bleiben „Mein Training“ und die Übung für alle - gut für eine Stunde mit einem Thema.")}
        {haken("spiele", "Spiele", "Aus: Der Eingang „Spiele“ fehlt auf dem Start.")}
        {haken("rechenweg", "Rechenweg auf Knopfdruck",
          "Aus: Kein „Zeig mir den Rechenweg“ - etwa in einer Kontrollstunde.")}
      </fieldset>

      <fieldset className="m-0 space-y-2 border-0 p-0">
        <legend className="mb-1 text-sm text-ink">Braillezeile der Kinder</legend>
        <BrailleWahl
          id={`${feld}-braille`}
          wert={{ braillezeile: aktuell.braillezeile, schrift: aktuell.schrift, breite: aktuell.breite, eingabe: aktuell.eingabe }}
          ohne="Jedes Kind wählt selbst"
          zeileAus={false}
          onWert={(neu) => void setze(
            { braillezeile: neu.braillezeile ? true : undefined, schrift: neu.schrift, breite: neu.breite, eingabe: neu.eingabe },
            [
              ...(neu.braillezeile ? [] : ["braillezeile" as const]),
              ...(neu.schrift ? [] : ["schrift" as const]),
              ...(neu.breite ? [] : ["breite" as const]),
              ...(neu.eingabe ? [] : ["eingabe" as const]),
            ],
          )}
        />
        <p className="m-0 text-xs text-ink-muted">
          Was Sie hier festlegen, gilt für alle Kinder der Klasse; sie können es in ihren Einstellungen nicht ändern.
          Offen gelassen wählt jedes Kind selbst. Für ein einzelnes Kind stellen Sie es in der Tabelle ein. Mit
          Braillezeile steht die ganze Aufgabe im Eingabefeld; die Zeilen brechen so um, dass das Kind wenig springt.
        </p>
      </fieldset>

      {abweichend.length > 0 && (
        <div className="space-y-2 rounded-lg bg-canvas-muted p-3">
          <p className="m-0 text-sm text-ink">
            Bei {abweichend.map((k) => k.name).sort((a, b) => a.localeCompare(b, "de")).join(", ")}{" "}
            stehen die Einstellungen noch anders - etwa, weil{" "}
            {abweichend.length === 1 ? "das Kind" : "die Kinder"} erst später in die Klasse gekommen {abweichend.length === 1 ? "ist" : "sind"}.
          </p>
          <button type="button" className="btn-secondary" onClick={() => void setze({})} aria-busy={arbeitet}>
            Bei allen Kindern übernehmen
          </button>
        </div>
      )}

      <p className="m-0 text-xs text-ink-muted">
        Jede Änderung gilt sofort für alle Kinder der Klasse und wird gespeichert; ein Kind sieht sie beim
        nächsten Öffnen von Plus. Das Wochenziel zählt Aufgaben, nie Minuten - Plus misst keine Zeit.
      </p>
    </div>
  );
}

/** Die Kurzfassung der Braille-Einstellungen eines Kindes für die Kopfzeile des Abschnitts. */
function brailleKurz(b: KindBraille | undefined): string {
  if (!b || Object.keys(b).length === 0) return "wie die Klasse";
  const t: string[] = [];
  if (b.braillezeile !== undefined) t.push(b.braillezeile ? "an" : "aus");
  if (b.schrift) t.push(BRAILLESCHRIFT_NAME[b.schrift]);
  if (b.breite) t.push(`${b.breite} Zeichen`);
  if (b.eingabe) t.push(EINGABEWEG_NAME[b.eingabe]);
  return `${t.join(", ")} (festgelegt)`;
}

/* ══ Eine Zeile: ein Kind ═══════════════════════════════════════════════════ */

interface ZeileProps {
  k: KindBlick;
  f: PlusFortschritt | null;
  beschluss: PlusBeschluss;
  plusKlasse: number | null;
  classCode: string;
  index: number;
  heute: number;
  zeitraum: Zeitraum;
  /** Ist die Antwort des Servers schon da? */
  geladen: boolean;
  onStufe: (stufe: number | null) => void;
  onBraille: (neu: KindBraille) => void;
  onUebung: (id: string, name: string, wert: UebungsBeschluss | null) => void;
}

/** Ein Abschnitt in der aufgeklappten Zeile: eine Kopfzeile mit Kurzfassung, darunter der Inhalt. */
function Abschnitt({ titel, kurz, children }: { titel: string; kurz?: string; children: React.ReactNode }) {
  return (
    <details className="border-t border-hairline py-2 first:border-t-0">
      <summary className="cursor-pointer text-sm text-ink">
        <span className="font-semibold">{titel}</span>
        {kurz ? <span className="text-ink-muted"> - {kurz}</span> : null}
      </summary>
      <div className="mt-2 space-y-2 pl-4">{children}</div>
    </details>
  );
}

function KindZeile({
  k, f, beschluss, plusKlasse, classCode, index, heute, zeitraum, geladen, onStufe, onBraille, onUebung,
}: ZeileProps) {
  const [offen, setOffen] = useState(false);
  const bereich = useRef<HTMLDivElement>(null);
  // Welche Stufe gerade rechnet - die eigene, sonst die der Klasse, sonst die zuletzt gewählte.
  const wirksam = beschluss.stufe ?? plusKlasse ?? k.stufe ?? 1;
  const [gezeigt, setGezeigt] = useState(wirksam);
  useEffect(() => setGezeigt(wirksam), [wirksam]);

  // Beim Aufklappen den Fokus in den Bereich legen (NVDA-Muster, wie bei den
  // Geschwister-Reitern).
  useEffect(() => {
    if (offen) bereich.current?.focus();
  }, [offen]);

  const grund = aufklappGrund(index);

  // ★ 20.10.2026 (Johannes: überall wie in Tastenflow): der Pfeil steht LINKS
  // vor dem Namen, die Einzelheiten öffnen sich als Zeile direkt unter dem Kind.
  const aufklapper = (
    <td className={`${AUFKLAPP_KNOPF_ZELLE} ${grund}`}>
      <AufklappKnopf
        open={offen}
        onToggle={() => setOffen((v) => !v)}
        controls={`plus-detail-${k.id}`}
        label={`${k.name}: ${offen ? "Einzelheiten zuklappen" : "Einzelheiten aufklappen"}`}
        tipp={`Einzelheiten von ${k.name} - Schulstufe, Übungen, Arten von Fehlern und Muster.`}
      />
    </td>
  );

  const name = (
    <th scope="row" className="py-2 pr-3 text-left font-bold text-ink">
      <span className="inline-flex items-center gap-1.5">
        <span>{k.name}</span>
        <LwPupilMessageButton pupilId={k.id} pupilName={k.name} classCode={classCode} iconOnly />
      </span>
    </th>
  );

  /*
   * ★★ Solange geladen wird, weiss der Reiter NICHTS - und sagt das. Im ersten
   * Entwurf stand hier schon „hat Plus noch nicht geöffnet", weil ein Kind ohne
   * geladene Zeile genauso aussieht wie ein Kind ohne Zeile. In einem langsamen
   * Schulnetz las die Lehrkraft das sekundenlang über die ganze Klasse - eine
   * falsche Aussage über jedes Kind. Gefunden vom Wächter
   * `tests/plus-klassenreiter.test.tsx`, beim ersten Lauf.
   */
  if (!geladen) {
    return (
      <tr className={`text-center ${grund}`}>
        {aufklapper}
        {name}
        <td colSpan={SPALTEN - 2} className="text-ink-muted">
          lädt …
        </td>
      </tr>
    );
  }

  const stufenZelle = (
    <td className="text-ink">
      <span aria-hidden="true">{wirksam}.{beschluss.stufe ? " *" : ""}</span>
      <span className="sr-only">
        {wirksam}. Schulstufe{beschluss.stufe ? ", für dieses Kind festgelegt" : ""}
      </span>
    </td>
  );

  const qTrend = trendQuote(k);
  const aTrend = trendZahl(k.zGerechnet, k.vorGerechnet);
  const quote = prozent(k.zRichtige, k.zGerechnet);
  const zeitraumName = ZEITRAEUME.find((z) => z.key === zeitraum)?.satz ?? "";
  const zielErreicht = k.woche.ziel > 0 && k.woche.geschafft >= k.woche.ziel;

  const uebungen = uebungsZeilen(f, gezeigt);
  const angewandt = f?.beschlussAngewandt ?? 0;
  const arten = artZeilen(f);
  const muster = musterZeilen(f, heute);
  const besser = besserGeworden(f, heute);
  const woechentlich = wochenSaeulenKind(f, heute);

  return (
    <>
      {/* Alle Tabellenspalten mittig (Johannes 10.09.2026). */}
      <tr className={`${AUFKLAPP_ZEILE} text-center ${grund}`}>
        {aufklapper}
        {name}
        {stufenZelle}
        {!k.begonnen ? (
          /*
            ★ „hat Plus noch nicht geöffnet" steht als SATZ da, nicht als Reihe
            von Nullen. Eine Zeile aus Nullen liest sich - besonders auf der
            Braillezeile, Zelle für Zelle - wie ein schlechtes Ergebnis, dabei
            ist sie gar kein Ergebnis.
          */
          <td colSpan={SPALTEN - 3} className="text-ink-muted">
            hat Plus noch nicht geöffnet
          </td>
        ) : (
          <>
            <td className="text-ink">{zuletztSatz(k.zuletztVor)}</td>
            <td className="text-ink">
              <ZahlMitPfeil wert={String(k.zTage)} satz={`an ${k.zTage} ${k.zTage === 1 ? "Tag" : "Tagen"} gerechnet in ${zeitraumName}`} />
            </td>
            <td className="text-ink">
              <ZahlMitPfeil
                wert={String(k.zGerechnet)}
                satz={`${k.zGerechnet} ${k.zGerechnet === 1 ? "Aufgabe" : "Aufgaben"} in ${zeitraumName}`}
                pfeil={aTrend ? `${aTrend.pfeil}${aTrend.d !== 0 ? ` ${aTrend.d > 0 ? "+" : ""}${aTrend.d}` : ""}` : undefined}
                pfeilSatz={aTrend ? (aTrend.pfeil === "→" ? "etwa wie im Zeitraum davor" : `${Math.abs(aTrend.d)} ${aTrend.d > 0 ? "mehr" : "weniger"} als im Zeitraum davor`) : undefined}
              />
            </td>
            <td className="text-ink">
              <ZahlMitPfeil
                wert={quote === null ? "-" : `${quote} %`}
                satz={quote === null ? "in diesem Zeitraum nichts gerechnet" : `richtig: ${anteil(k.zRichtige, k.zGerechnet)}`}
                pfeil={qTrend && qTrend.pfeil !== "→" ? qTrend.pfeil : undefined}
                pfeilSatz={qTrend ? (qTrend.pfeil === "→" ? "etwa wie im Zeitraum davor" : `${Math.abs(qTrend.punkte)} Prozentpunkte ${qTrend.punkte > 0 ? "mehr" : "weniger"} als davor`) : undefined}
              />
            </td>
            <td className="text-ink">
              <span aria-hidden="true">
                {k.woche.ziel > 0 ? `${k.woche.geschafft}/${k.woche.ziel}${zielErreicht ? " ✓" : ""}` : "-"}
              </span>
              <span className="sr-only">
                {k.woche.ziel > 0
                  ? `Wochenziel: ${k.woche.geschafft} von ${k.woche.ziel} Aufgaben${zielErreicht ? ", erreicht" : ""}`
                  : "kein Wochenziel"}
              </span>
            </td>
            <td className="text-ink">
              <span aria-hidden="true">{k.angefasst}/{UEBUNGEN_GESAMT}</span>
              <span className="sr-only">{k.angefasst} von {UEBUNGEN_GESAMT} Übungen angefangen</span>
            </td>
            <td className="text-ink">
              <span aria-hidden="true">{k.sitzt}</span>
              <span className="sr-only">{k.sitzt} {k.sitzt === 1 ? "Übung sitzt" : "Übungen sitzen"}</span>
            </td>
          </>
        )}
      </tr>

      <AufklappHuelle offen={offen} spalten={SPALTEN} grund={grund} id={`plus-detail-${k.id}`}>
          <div
            ref={bereich}
            tabIndex={-1}
            role="region"
            aria-label={`Einzelheiten: ${k.name}`}
            className="space-y-1 text-left outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Abschnitt
              titel={`Einstellungen für ${k.name}`}
              kurz={`${wirksam}. Schulstufe${beschluss.stufe ? " (festgelegt)" : plusKlasse !== null ? " (wie die Klasse)" : ""}`}
            >
              <label className="block text-sm text-ink" htmlFor={`plus-stufe-${k.id}`}>
                Schulstufe in Plus
              </label>
              <select
                id={`plus-stufe-${k.id}`}
                className={auswahlKlasse}
                value={beschluss.stufe ?? ""}
                onChange={(e) => onStufe(e.target.value === "" ? null : Number(e.target.value))}
              >
                <option value="">{wieDieKlasse(plusKlasse)}</option>
                {PLUS_STUFEN.map((n) => (
                  <option key={n} value={n}>{n}. Schulstufe</option>
                ))}
              </select>
              <p className="m-0 text-xs text-ink-muted">
                Die Stufe, in der {k.name} in „Mein Training“ rechnet. Sie wirkt, sobald {k.name} Plus das nächste Mal öffnet.
              </p>
            </Abschnitt>

            <Abschnitt
              titel={`Braillezeile für ${k.name}`}
              kurz={brailleKurz(beschluss.braille)}
            >
              <BrailleWahl
                id={`plus-braille-${k.id}`}
                wert={beschluss.braille ?? {}}
                onWert={onBraille}
                ohne="Wie die Klasse"
                zeileAus
              />
              <p className="m-0 text-xs text-ink-muted">
                Gilt nur für {k.name} und geht vor die Einstellung der Klasse. „Wie die Klasse“ heißt: Es gilt, was bei
                den Einstellungen der Klasse steht - und wo dort nichts steht, wählt {k.name} selbst. Sie wirkt, sobald{" "}
                {k.name} Plus das nächste Mal öffnet.
              </p>
            </Abschnitt>

            <Abschnitt
              titel="Verlauf"
              kurz={`${k.gerechnet} ${k.gerechnet === 1 ? "Aufgabe" : "Aufgaben"} insgesamt, an ${k.tage} ${k.tage === 1 ? "Tag" : "Tagen"}`}
            >
              {k.mitgezaehlt ? (
                <Wochensaeulen reihe={woechentlich} name={`Aufgaben von ${k.name} je Woche`} />
              ) : (
                <p className="m-0 text-sm text-ink-muted">
                  Wochenzahlen gibt es ab dem nächsten Mal, wenn {k.name} rechnet - Plus zählt sie seit dem 16.10.2026 mit.
                </p>
              )}
              <p className="m-0 text-sm text-ink">
                Runden: {k.runden} · Rätsel gelöst: {k.raetsel} · Übungen ohne einen Fehler: {k.laeufeOhneFehler} · Abzeichen: {k.abzeichen}
              </p>
            </Abschnitt>

            <Abschnitt
              titel="Rechenarten"
              kurz={arten.length ? arten.map((a) => `${a.name} ${prozent(a.richtige, a.gerechnet)} %`).join(", ") : "noch keine Zahlen"}
            >
              {arten.length === 0 ? (
                <p className="m-0 text-sm text-ink-muted">
                  Die Zahlen je Rechenart zählt Plus seit dem 16.10.2026 mit - sie erscheinen, sobald {k.name} rechnet.
                </p>
              ) : (
                <ul className="m-0 list-none space-y-1 p-0 text-sm text-ink">
                  {arten.map((a) => (
                    <li key={a.art} className="flex flex-wrap items-center gap-3">
                      <span className="w-24">{a.name}</span>
                      <span className="h-2 w-40 rounded-full bg-hairline" aria-hidden="true">
                        <span
                          className="block h-2 rounded-full bg-accent"
                          style={{ width: `${prozent(a.richtige, a.gerechnet) ?? 0}%` }}
                        />
                      </span>
                      <span>
                        {prozent(a.richtige, a.gerechnet)} %{" "}
                        <span className="text-ink-muted">({a.richtige} von {a.gerechnet})</span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Abschnitt>

            <Abschnitt
              titel="Übungen"
              kurz={`${k.angefasst} von ${UEBUNGEN_GESAMT} angefangen, ${k.sitzt} ${k.sitzt === 1 ? "sitzt" : "sitzen"}`}
            >
              {k.jeStufe.length > 0 && (
                <ul className="m-0 list-none space-y-1 p-0 text-sm text-ink">
                  {k.jeStufe.map((z) => (
                    <li key={z.nr}>{stufenSatz(z)}</li>
                  ))}
                </ul>
              )}
              <label className="block text-sm text-ink" htmlFor={`plus-gezeigt-${k.id}`}>
                Übungen der Schulstufe
              </label>
              <select
                id={`plus-gezeigt-${k.id}`}
                className={auswahlKlasse}
                value={gezeigt}
                onChange={(e) => setGezeigt(Number(e.target.value))}
              >
                {PLUS_STUFEN.map((n) => (
                  <option key={n} value={n}>{n}. Schulstufe</option>
                ))}
              </select>
              <ul className="m-0 list-none space-y-1 p-0 text-sm">
                {uebungen.map((u) => {
                  const e = beschluss.uebungen?.[u.id];
                  const wartet = !!e && e.am > angewandt;
                  return (
                    <li key={u.id} className="flex flex-wrap items-center justify-between gap-2 text-ink">
                      <span>
                        {u.name} - <span className="text-ink-muted">{WIE_LEHRKRAFT[u.wie]}</span>
                        {u.gerechnet > 0 && (
                          <span className="text-ink-muted">
                            {" "}· {u.laeufe} {u.laeufe === 1 ? "Lauf" : "Läufe"}, {prozent(u.richtige, u.gerechnet)} % richtig
                          </span>
                        )}
                        {wartet && <span className="text-ink-muted"> · wirkt beim nächsten Öffnen</span>}
                      </span>
                      <select
                        className={auswahlKlasse}
                        value={e?.wert ?? ""}
                        onChange={(ev) =>
                          onUebung(u.id, u.name, ev.target.value === "" ? null : (ev.target.value as UebungsBeschluss))
                        }
                        aria-label={`${u.name}: Einstufung für ${k.name}`}
                      >
                        {WAHL_UEBUNG.map((w) => (
                          <option key={w.wert} value={w.wert}>{w.text}</option>
                        ))}
                      </select>
                    </li>
                  );
                })}
              </ul>
              <p className="m-0 text-xs text-ink-muted">
                Ihre Auswahl wirkt, sobald {k.name} Plus das nächste Mal öffnet - und zwar einmal. Danach
                entscheidet wieder der Coach: Rechnet {k.name} eine Übung, die Sie auf „sitzt“ gestellt haben,
                bleibt sie dabei; eine Übung auf „noch einmal üben“ kommt wieder dran und zählt ab da neu.
              </p>
            </Abschnitt>

            {(besser.sitztJetzt.length > 0 || besser.wirdBesser.length > 0) && (
              <Abschnitt titel="Wo es besser geworden ist" kurz="Vergleich mit dem ersten Lauf">
                <ul className="m-0 list-none space-y-1 p-0 text-sm text-ink">
                  {[...besser.sitztJetzt, ...besser.wirdBesser].map((z) => (
                    <li key={z.id}><strong className="font-medium">{z.name}</strong> - {z.satz}</li>
                  ))}
                </ul>
              </Abschnitt>
            )}

            {muster.length > 0 && (
              <Abschnitt titel="Woran der Coach arbeitet" kurz={`${muster.length} ${muster.length === 1 ? "Muster" : "Muster"}`}>
                <ul className="m-0 list-none space-y-1 p-0 text-sm text-ink">
                  {muster.map((m) => (
                    <li key={m.id}>
                      {m.satz}{" "}
                      <span className="text-ink-muted">
                        (an {m.trefferTage} Tagen aufgefallen, zuletzt {zuletztSatz(m.zuletztVor)})
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="m-0 text-xs text-ink-muted">
                  Ein Arbeitsstand, kein Befund: Plus merkt sich ein Muster erst, wenn es sich über mehrere Tage
                  gezeigt hat, und vergisst es nach drei Wochen oder sobald es nicht mehr stimmt. {k.name} sieht
                  es nicht - bekommt aber bei der passenden Aufgabe einen kurzen Merksatz.
                </p>
              </Abschnitt>
            )}
          </div>
      </AufklappHuelle>
    </>
  );
}

/* ══ Die Übung für alle ════════════════════════════════════════════════════ */

/**
 * ★ Johannes, 28.09.2026: „aus den vorgegebenen Bereichen starten alle die
 * selbe Übung - so wie die eigene Übung bei Tastenflow". Die Lehrkraft wählt
 * Übungen aus dem Stoffplan und die Anzahl; jedes Kind bekommt dieselben
 * Aufgaben. Regel, Speicherort und Grenzen: `lib/plus/lehrerUebung.ts`.
 *
 * ★ Die Lehrkraft sieht je Kind nur „fertig" oder „noch nicht" - kein
 * Ergebnis, keine Zeit. Die Zahlen stehen wie immer in der Tabelle darüber.
 */
function FuerAlleKasten({
  konten,
  staende,
  geladen,
  plusKlasse,
  onStarte,
  onBeende,
  onNeuLaden,
}: {
  konten: TypingAccount[];
  staende: Record<string, PlusFortschritt>;
  geladen: boolean;
  plusKlasse: number | null;
  onStarte: (u: UebungFuerAlle) => Promise<void>;
  onBeende: () => Promise<void>;
  onNeuLaden: () => void;
}) {
  const [stufe, setStufe] = useState(plusKlasse ?? PLUS_STUFE_MIN);
  const [gewaehlt, setGewaehlt] = useState<string[]>([]);
  const [anzahl, setAnzahl] = useState<number>(FUER_ALLE_ANZAHLEN[0]);
  const [hinweis, setHinweis] = useState("");
  const [arbeitet, setArbeitet] = useState(false);

  // Die laufende Übung: die jüngste, die bei einem Kind steht.
  const laufend = useMemo(() => {
    let u: UebungFuerAlle | null = null;
    for (const k of konten) {
      const f = heileBeschluss(k.plusBeschluss).fuerAlle;
      if (f && (!u || f.am > u.am)) u = f;
    }
    return u;
  }, [konten]);

  const nachNamen = [...konten].sort((a, b) => a.name.localeCompare(b.name, "de"));
  const mit = laufend ? nachNamen.filter((k) => heileBeschluss(k.plusBeschluss).fuerAlle?.id === laufend.id) : [];
  const ohne = laufend ? nachNamen.filter((k) => heileBeschluss(k.plusBeschluss).fuerAlle?.id !== laufend.id) : [];
  const fertig = laufend ? mit.filter((k) => staende[k.id]?.fuerAlleFertig.includes(laufend.id)) : [];
  const offen = laufend ? mit.filter((k) => !staende[k.id]?.fuerAlleFertig.includes(laufend.id)) : [];

  const waehle = (id: string, an: boolean) => {
    if (an && gewaehlt.length >= FUER_ALLE_MAX_PAKETE) {
      setHinweis(`Höchstens ${FUER_ALLE_MAX_PAKETE} Übungen auf einmal.`);
      return;
    }
    setHinweis("");
    setGewaehlt((g) => (an ? [...g, id] : g.filter((x) => x !== id)));
  };

  const starte = async () => {
    if (arbeitet) return;
    if (gewaehlt.length === 0) {
      setHinweis("Bitte zuerst mindestens eine Übung wählen.");
      return;
    }
    setArbeitet(true);
    await onStarte(neueUebungFuerAlle(gewaehlt, anzahl));
    setArbeitet(false);
    setGewaehlt([]);
    setHinweis("");
  };

  const beende = async () => {
    if (arbeitet) return;
    setArbeitet(true);
    await onBeende();
    setArbeitet(false);
  };

  const namen = (liste: TypingAccount[]) => liste.map((k) => k.name).join(", ");

  return (
    <div className="card space-y-4 p-4">
      <div>
        <h3 className="m-0 text-lg font-semibold text-ink">Eine Übung für alle</h3>
        <p className="m-0 text-sm text-ink-muted">
          Sie wählen Übungen und die Anzahl der Aufgaben. Jedes Kind bekommt
          dieselben Aufgaben - in Plus steht die Übung ganz oben auf dem Start.
        </p>
      </div>

      {laufend ? (
        <div className="space-y-2 rounded-lg bg-canvas-muted p-3">
          <p className="m-0 font-medium text-ink">
            Läuft: {namenFuerAlle(laufend)} ({stufenFuerAlle(laufend)}), {laufend.anzahl} Aufgaben.
          </p>
          <p className="m-0 text-ink">
            {!geladen
              ? "Lädt …"
              : `Fertig: ${fertig.length} von ${mit.length} ${mit.length === 1 ? "Kind" : "Kindern"}.`}
          </p>
          {geladen && fertig.length > 0 && (
            <p className="m-0 text-sm text-ink">Fertig: {namen(fertig)}</p>
          )}
          {geladen && offen.length > 0 && (
            <p className="m-0 text-sm text-ink">Noch nicht fertig: {namen(offen)}</p>
          )}
          {ohne.length > 0 && (
            <p className="m-0 text-sm text-ink-muted">
              Ohne diese Übung (erst später in die Klasse gekommen): {namen(ohne)}. Starten
              Sie die Übung neu, dann bekommen alle sie.
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn-secondary" onClick={onNeuLaden}>
              Stand neu laden
            </button>
            <button type="button" className="btn-secondary" onClick={() => void beende()} aria-busy={arbeitet}>
              Übung beenden
            </button>
          </div>
        </div>
      ) : (
        <p className="m-0 text-ink">Gerade läuft keine Übung für alle.</p>
      )}

      <div className="space-y-3">
        <h4 className="m-0 font-semibold text-ink">{laufend ? "Neue Übung starten" : "Übung starten"}</h4>
        <label className="block text-sm text-ink">
          Schulstufe{" "}
          <select className={auswahlKlasse} value={stufe} onChange={(e) => setStufe(Number(e.target.value))}>
            {PLUS_STUFEN.map((n) => (
              <option key={n} value={n}>
                {n}. Schulstufe
              </option>
            ))}
          </select>
        </label>
        <fieldset className="m-0 border-0 p-0">
          <legend className="mb-1 text-sm text-ink">
            Übungen der {stufe}. Schulstufe - bis zu {FUER_ALLE_MAX_PAKETE}
          </legend>
          <ul className="m-0 grid list-none gap-1 p-0 text-sm sm:grid-cols-2">
            {paketeDerStufe(stufe).map((pk) => (
              <li key={pk.id}>
                <label className="flex items-start gap-2 text-ink">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={gewaehlt.includes(pk.id)}
                    onChange={(e) => waehle(pk.id, e.target.checked)}
                  />
                  <span>{pk.name}</span>
                </label>
              </li>
            ))}
          </ul>
        </fieldset>
        <p className="m-0 text-sm text-ink">
          {gewaehlt.length === 0
            ? "Noch keine Übung gewählt."
            : `Gewählt: ${namenFuerAlle({ pakete: gewaehlt })}`}
        </p>
        <label className="block text-sm text-ink">
          Aufgaben{" "}
          <select className={auswahlKlasse} value={anzahl} onChange={(e) => setAnzahl(Number(e.target.value))}>
            {FUER_ALLE_ANZAHLEN.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <p role="status" aria-live="polite" className="m-0 min-h-5 text-sm text-ink">
          {hinweis}
        </p>
        <button type="button" className="btn-primary" onClick={() => void starte()} aria-busy={arbeitet}>
          {laufend ? "Neue Übung für alle starten" : "Übung für alle starten"}
        </button>
        {laufend && (
          <p className="m-0 text-xs text-ink-muted">
            Eine neue Übung ersetzt die laufende. Wer die laufende noch nicht fertig hat, bekommt dann die neue.
          </p>
        )}
      </div>
    </div>
  );
}

/* ══ Die Staffel dieser Woche ══════════════════════════════════════════════ */

/**
 * ★ Die Lehrkraft sieht DENSELBEN Satz wie die Klasse - also das versteckte
 * Wort erst, wenn es erraten ist. `staffelStand()` gibt es vorher nur
 * verdeckt heraus, und das bleibt so: Ein Wort, das die Lehrkraft schon kennt,
 * nimmt der Klasse das Tüfteln, sobald es einmal ausgesprochen ist.
 */
function StaffelKasten({ classCode }: { classCode: string }) {
  const woche = useMemo(() => kalenderwoche(), []);
  const staffel = useMemo(() => staffelFuer(classCode, woche), [classCode, woche]);
  const [tafel, setTafel] = useState<Tafel | null>(null);
  const [geladen, setGeladen] = useState(false);

  useEffect(() => {
    let lebt = true;
    void liesTafelFuer(classCode, woche).then((t) => {
      if (!lebt) return;
      setTafel(t);
      setGeladen(true);
    });
    return () => {
      lebt = false;
    };
  }, [classCode, woche]);

  return (
    <div className="card space-y-2 p-4">
      <h3 className="m-0 text-lg font-semibold text-ink">Die Staffel dieser Woche</h3>
      <p className="m-0 text-sm text-ink-muted">
        Jede Woche bekommt die Klasse eine neue Staffel: eine Reihe von Etappen und
        ein verstecktes Wort. Jede gelaufene Etappe deckt einen Buchstaben auf, und
        jede Etappe kommt in der Schulstufe des Kindes, das sie läuft - niemand
        steht vor einer Mauer, und alle tragen gleich viel bei.
      </p>
      <p className="m-0 text-ink" role="status" aria-live="polite">
        {!geladen
          ? "Lädt …"
          : tafel === null
            ? "Der Stand der Staffel lässt sich gerade nicht laden."
            : staffelStand(staffel, tafel.gelaufen, tafel.wortGeraten)}
      </p>
      <p className="m-0 text-xs text-ink-muted">
        ⓘ Hier steht nur, wie weit die <strong>Klasse</strong> ist. Wer welche Etappe
        gelaufen ist, wird nicht gespeichert - auch nicht für Sie.
      </p>
    </div>
  );
}

/* ══ Der Reiter ════════════════════════════════════════════════════════════ */

type Kasten = "uebung" | "einstellungen" | "staffel" | null;

export function PlusReiter({
  pupils,
  cls,
  onChanged,
}: {
  pupils: TypingAccount[];
  /** Die oben ausgewählte Klasse - ihr Code und ihre Schulstufe. */
  cls: Pick<TypingClass, "code" | "schulstufe" | "schulstufeSchuljahr">;
  /** Die Kinder-Liste der Seite neu laden, nachdem ein Beschluss gespeichert ist. */
  onChanged?: () => void;
}) {
  const ids = pupils.map((p) => p.id);
  const schluessel = ids.join(",");
  const [staende, setStaende] = useState<Record<string, PlusFortschritt>>({});
  const [geladen, setGeladen] = useState(false);
  const [status, setStatus] = useState("");
  /** Zählt „Stand neu laden" - ein neuer Wert liest die Stände noch einmal. */
  const [ladeNr, setLadeNr] = useState(0);
  const [zeitraum, setZeitraum] = useState<Zeitraum>("monat");
  const [kasten, setKasten] = useState<Kasten>(null);
  const kastenId = useId();
  const heute = useMemo(() => tagesnummer(), []);

  /*
   * ★ Der gerade gesetzte Beschluss bleibt stehen - dasselbe Muster wie im
   * Reiter eine andere App der Plattform: Die Kinder-Liste der Seite lädt nach einer Änderung
   * still nach, und bis dahin hielte sie noch den ALTEN Wert. Ein gesteuertes
   * Auswahlfeld spränge sonst für einen Wimpernschlag zurück.
   */
  const [nachgezogen, setNachgezogen] = useState<Record<string, TypingAccount>>({});
  const konten = pupils.map((p) => nachgezogen[p.id] ?? p);

  useEffect(() => {
    let lebt = true;
    setGeladen(false);
    void liesKlasse(ids).then((gefunden) => {
      if (!lebt) return;
      setStaende(gefunden);
      setGeladen(true);
    });
    return () => {
      lebt = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schluessel, ladeNr]);

  const klassenStufe = aktuelleSchulstufe(cls);
  const plusKlasse = plusStufeAusKlasse(klassenStufe);

  /*
   * ★ Nach Namen, nie nach Leistung. Eine Tabelle, die man nach „gerechnet"
   * sortieren kann, ist eine Rangliste - und die gibt es in dieser App an
   * keiner Stelle, auch nicht für die Lehrkraft.
   */
  const zeilen = useMemo(
    () =>
      konten
        .map((p) => ({ k: kindBlick(p, staende[p.id] ?? null, zeitraum, heute), konto: p, f: staende[p.id] ?? null }))
        .sort((a, b) => a.k.name.localeCompare(b.k.name, "de")),
    [konten, staende, zeitraum, heute],
  );
  const blick = useMemo(() => klassenBlick(zeilen.map((z) => z.k)), [zeilen]);
  const saeulen = useMemo(() => wochenSaeulen(zeilen.map((z) => z.f), heute), [zeilen, heute]);
  const hinweise = useMemo(() => klassenHinweise(zeilen.map((z) => ({ k: z.k, f: z.f })), heute), [zeilen, heute]);
  const zeitraumSatz = ZEITRAEUME.find((z) => z.key === zeitraum)?.satz ?? "";

  const speichere = async (konto: TypingAccount, neu: PlusBeschluss, meldung: string) => {
    const gespeichert = await typingBackend().setPlusBeschluss?.(konto.id, neu);
    if (!gespeichert) {
      setStatus(`Nicht gespeichert: ${meldung} Bitte noch einmal versuchen.`);
      return;
    }
    setNachgezogen((n) => ({ ...n, [gespeichert.id]: gespeichert }));
    setStatus(meldung);
    onChanged?.();
  };

  const setzeStufe = (konto: TypingAccount, stufe: number | null) => {
    const neu = mitStufe(heileBeschluss(konto.plusBeschluss), stufe);
    const text = stufe === null ? wieDieKlasse(plusKlasse) : `${stufe}. Schulstufe`;
    void speichere(konto, neu, `Schulstufe in Plus für ${konto.name}: ${text}.`);
  };

  const setzeBraille = (konto: TypingAccount, neu: KindBraille) => {
    void speichere(
      konto,
      mitKindBraille(heileBeschluss(konto.plusBeschluss), neu),
      `Braillezeile für ${konto.name}: ${brailleKurz(neu)}. Wirkt beim nächsten Öffnen von Plus.`,
    );
  };

  const setzeUebung = (
    konto: TypingAccount,
    id: string,
    name: string,
    wert: UebungsBeschluss | null,
  ) => {
    const neu = mitUebung(heileBeschluss(konto.plusBeschluss), id, wert);
    const text = WAHL_UEBUNG.find((w) => w.wert === (wert ?? ""))?.text ?? "";
    void speichere(
      konto,
      neu,
      `${name} für ${konto.name}: ${text}.${wert ? " Wirkt beim nächsten Öffnen von Plus." : ""}`,
    );
  };

  /*
   * ★ Die Übung für alle und die Einstellungen der Klasse stehen bei JEDEM
   * Kind (`lehrerUebung.ts`, `KlassenEinstellung`) - also ein Schreiben je
   * Kind. Scheitert eines, sagt es der Satz mit Namen; der Rest bleibt
   * gespeichert, und ein zweiter Versuch überschreibt ohnehin alle.
   */
  const fuerAlleSchreiben = async (
    aendere: (b: PlusBeschluss) => PlusBeschluss,
    liste: TypingAccount[],
  ) => {
    const ergebnisse = await Promise.all(
      liste.map(async (konto) => ({
        konto,
        neu: await typingBackend().setPlusBeschluss?.(konto.id, aendere(heileBeschluss(konto.plusBeschluss))),
      })),
    );
    const gut = ergebnisse.filter((e) => e.neu).map((e) => e.neu as TypingAccount);
    const schlecht = ergebnisse.filter((e) => !e.neu).map((e) => e.konto.name);
    setNachgezogen((n) => ({ ...n, ...Object.fromEntries(gut.map((k) => [k.id, k])) }));
    if (gut.length) onChanged?.();
    return schlecht;
  };

  const starteFuerAlle = async (u: UebungFuerAlle) => {
    if (konten.length === 0) {
      setStatus("In dieser Klasse ist noch kein Kind.");
      return;
    }
    const schlecht = await fuerAlleSchreiben((b) => mitFuerAlle(b, u), konten);
    setStatus(
      schlecht.length
        ? `Nicht gespeichert für: ${schlecht.join(", ")}. Bitte noch einmal starten.`
        : `Übung für alle gestartet: ${namenFuerAlle(u)}, ${u.anzahl} Aufgaben.`,
    );
  };

  const beendeFuerAlle = async () => {
    const mit = konten.filter((k) => heileBeschluss(k.plusBeschluss).fuerAlle);
    const schlecht = await fuerAlleSchreiben((b) => mitFuerAlle(b, null), mit);
    setStatus(
      schlecht.length
        ? `Nicht beendet für: ${schlecht.join(", ")}. Bitte noch einmal versuchen.`
        : "Die Übung für alle ist beendet.",
    );
  };

  const setzeKlasse = async (k: KlassenEinstellung) => {
    if (konten.length === 0) {
      setStatus("In dieser Klasse ist noch kein Kind.");
      return;
    }
    const schlecht = await fuerAlleSchreiben((b) => mitKlasse(b, k), konten);
    setStatus(
      schlecht.length
        ? `Nicht gespeichert für: ${schlecht.join(", ")}. Bitte noch einmal versuchen.`
        : `Einstellungen der Klasse gespeichert: ${klassenEinstellungSatz(heileKlasse(k))}.`,
    );
  };

  const laufend = useMemo(() => {
    let u: UebungFuerAlle | null = null;
    for (const k of konten) {
      const f = heileBeschluss(k.plusBeschluss).fuerAlle;
      if (f && (!u || f.am > u.am)) u = f;
    }
    return u;
  }, [konten]);
  const einstellungSatz = klassenEinstellungSatz(klassenStand(konten).aktuell);

  const wechsle = (neu: Exclude<Kasten, null>) => setKasten((alt) => (alt === neu ? null : neu));

  return (
    <div className="space-y-4">
      <p role="status" aria-live="polite" className="sr-only">
        {status}
      </p>
      <h2 className="sr-only">Plus - Stand der Klasse</h2>

      {/* Die Leiste: je ein Schalter für einen Kasten - wie in Tastenflow. */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={leistenSchalter}
          aria-expanded={kasten === "uebung"}
          aria-controls={`${kastenId}-uebung`}
          onClick={() => wechsle("uebung")}
        >
          Eine Übung für alle{" "}
          <span className="text-ink-muted">
            · {laufend ? `läuft: ${namenFuerAlle(laufend)}` : "nicht gestartet"}
          </span>
        </button>
        <button
          type="button"
          className={leistenSchalter}
          aria-expanded={kasten === "einstellungen"}
          aria-controls={`${kastenId}-einstellungen`}
          onClick={() => wechsle("einstellungen")}
        >
          Einstellungen der Klasse{" "}
          <span className="text-ink-muted">
            · {plusKlasse === null ? "keine Schulstufe" : `${plusKlasse}. Schulstufe`} · {einstellungSatz}
          </span>
        </button>
        <button
          type="button"
          className={leistenSchalter}
          aria-expanded={kasten === "staffel"}
          aria-controls={`${kastenId}-staffel`}
          onClick={() => wechsle("staffel")}
        >
          Staffel dieser Woche
        </button>
      </div>

      <Aufklappen offen={kasten === "uebung"}>
        <div id={`${kastenId}-uebung`}>
          <FuerAlleKasten
            konten={konten}
            staende={staende}
            geladen={geladen}
            plusKlasse={plusKlasse}
            onStarte={starteFuerAlle}
            onBeende={beendeFuerAlle}
            onNeuLaden={() => setLadeNr((n) => n + 1)}
          />
        </div>
      </Aufklappen>
      <Aufklappen offen={kasten === "einstellungen"}>
        <EinstellungenKasten
          id={`${kastenId}-einstellungen`}
          konten={konten}
          klassenStufe={klassenStufe}
          plusKlasse={plusKlasse}
          onSetze={setzeKlasse}
        />
      </Aufklappen>
      <Aufklappen offen={kasten === "staffel"}>
        <div id={`${kastenId}-staffel`}>
          <StaffelKasten classCode={cls.code} />
        </div>
      </Aufklappen>

      <PlusUeberblick
        blick={blick}
        zeitraum={zeitraum}
        onZeitraum={setZeitraum}
        saeulen={saeulen}
        hinweise={hinweise}
        zeitraumSatz={zeitraumSatz}
        vorKurzem={blick.begonnen > blick.mitgezaehlt}
        geladen={geladen}
        klassenSatz={klassenSatz(zeilen.map((z) => z.k))}
      />

      <div className="card overflow-x-auto p-4">
        <table className="w-full text-sm" aria-label={`Plus-Stand der Klasse, Zahlen für ${zeitraumSatz}`}>
          <thead>
            <tr className="text-center text-ink-muted">
              <th scope="col" className={`py-2 ${AUFKLAPP_KNOPF_ZELLE}`}><span className="sr-only">Einzelheiten</span></th>
              <th scope="col" className="py-2 pr-3 text-left">Name</th>
              <th scope="col" className="px-1 py-2">Schulstufe</th>
              <th scope="col" className="px-1 py-2">Zuletzt gerechnet</th>
              <th scope="col" className="px-1 py-2">Tage</th>
              <th scope="col" className="px-1 py-2">Aufgaben</th>
              <th scope="col" className="px-1 py-2">Richtig</th>
              <th scope="col" className="px-1 py-2">Wochenziel</th>
              <th scope="col" className="px-1 py-2">Übungen</th>
              <th scope="col" className="px-1 py-2">Sitzt</th>
            </tr>
          </thead>
          <tbody className="[&_td]:py-2 [&_td]:pr-2 [&_tr]:border-t [&_tr]:border-hairline/60">
            {zeilen.map(({ k, konto, f }, i) => (
              <KindZeile
                key={k.id}
                k={k}
                f={f}
                index={i}
                heute={heute}
                zeitraum={zeitraum}
                beschluss={heileBeschluss(konto.plusBeschluss)}
                plusKlasse={plusKlasse}
                classCode={cls.code}
                geladen={geladen}
                onStufe={(stufe) => setzeStufe(konto, stufe)}
                onBraille={(neu) => setzeBraille(konto, neu)}
                onUebung={(id, name, wert) => setzeUebung(konto, id, name, wert)}
              />
            ))}
          </tbody>
        </table>
        <p className="m-0 mt-3 text-xs text-ink-muted">
          „Schulstufe“ ist die Stufe, in der das Kind in Plus rechnet; ein Stern heißt: von Ihnen festgelegt.
          „Tage“, „Aufgaben“ und „Richtig“ gelten für den gewählten Zeitraum, „Wochenziel“ für diese Woche, die
          Pfeile vergleichen mit dem Zeitraum davor. „Übungen“ zählt, wie viele der {UEBUNGEN_GESAMT} Übungen
          angefangen wurden, „Sitzt“, wie viele davon der Coach als sicher führt. Die Namen stehen nach dem
          Alphabet.{" "}
          <strong>Keine Zeiten:</strong> Plus misst keine Dauer und kein Tempo, also steht hier auch keines.
        </p>
      </div>
    </div>
  );
}
