/**
 * ════════════════════════════════════════════════════════════════════════════
 * „MEINE STATISTIK" - DIE EIGENE SICHT DES KINDES (22.09.2026)
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Grundsatz [[feedback_data_transparency]]: ein Kind darf alles über sich
 * selbst sehen, und die Lehrkraft bekommt nie mehr Rechte als das Kind. Bis
 * heute sah nur die Lehrkraft Zahlen über ein Punktgenau-Kind (Reiter
 * „Punktgenau" in „Meine Klassen", `PunktgenauReiter.tsx`) - das Kind selbst
 * sah nichts. Diese Datei zeigt GENAU dieselben Zahlen, aus derselben Quelle
 * gerechnet (`lib/braille/wochenaufgabe.ts`, `areas.ts`, `account.ts`), nur
 * aus der Ich-Perspektive.
 *
 * ── Was aufgenommen ist - und was nicht ────────────────────────────────────
 * AUFGENOMMEN, weil die Lehrkraft es über dieses Kind sieht: Übezeit (mit
 * wählbarem Zeitraum, wie am Zeitraum-Kopf der Lehrkraft-Tabelle), Aufgaben,
 * Treffsicherheit mit Veränderungspfeil (Schreiben/Lesen einzeln), gemeisterte
 * Etappen je Schriftbereich, XP und Rang, Tagesserie, der Stand der
 * Wochenaufgabe, die häufigsten Verwechslungen (`BrailleConfusionPanel`) und
 * das Abzeichen-Regal (`AbzeichenRegal`, eigens dafür gebaut, sich hier
 * einzuhängen).
 *
 * BEWUSST WEGGELASSEN: der Eigenständigkeits-/KI-Check (`SuspicionChip` in
 * `PunktgenauReiter.tsx`). Er ist ein Integritäts-Werkzeug für die Lehrkraft -
 * einem Kind „Eigenständigkeit 3 von 10, auffällig" zu zeigen wäre
 * entmutigend und würde zugleich verraten, woran der Verdacht hängt (dasselbe
 * Vorbild wie `PupilSelfStats.tsx` in Tastenflow, das ihn ebenso ausblendet).
 *
 * ── „Meine Braille-Challenges" (Zubau 22.09.2026) ──────────────────────────
 * Die Lehrkraft sieht seit Kurzem den Verlauf über mehrere Challenge-Runden
 * (`BrailleChallengeKasten.tsx`, `lib/braille/challengeVerlauf.ts`) - das Kind
 * sah bis hierher nur das Ergebnis der gerade gelaufenen Runde, nicht seinen
 * eigenen Verlauf. Das verletzt [[feedback_data_transparency]]: die Lehrkraft
 * bekommt nie mehr Rechte als das Kind. Diese Datei holt darum zusätzlich
 * `backend.listeChallengeVerlaufKind(account.id)` und zeigt jede eigene Runde,
 * neueste zuerst, mit derselben Veränderung ggü. der vorigen Runde DERSELBEN
 * Arbeitsweise, die auch die Lehrkraft sieht (`kindVeraenderung` - eigens
 * dafür gebaut, siehe Dateikopf von `challengeVerlauf.ts`). Anders als bei der
 * Lehrkraft gibt es hier keine Rangliste und keine Tabelle je Kind - jede
 * Runde ist ohnehin schon die eigene, einzelne Abgabe.
 *
 * ⚠️ Challenge-Abgaben schreiben KEIN `TaskEvent` (kein `recordEvent` in
 * `useBrailleChallenge.ts`) - ein Kind, das bislang ausschliesslich an
 * Braille-Challenges teilgenommen und sonst nie geübt hat, hätte mit der alten
 * Bedingung `events.length === 0` nie irgendetwas gesehen, auch nicht seinen
 * Challenge-Verlauf. Die leere Seite prüft darum jetzt BEIDE Quellen.
 *
 * Tabelle: `SortierTabelle`/`Spaltenkopf` (wie schon `Diagramme.tsx` bei
 * dieser Datei mitbenutzt) statt eines eigenen Baus - `aria-sort` und die
 * Tastatur-Bedienung kommen damit mit, ohne sie ein zweites Mal zu schreiben
 * ([[feedback_zwei_stellen_die_voneinander_nichts_wissen]]).
 *
 * ── ★★★ Diagramme (Bauart siehe Kopf von `components/statistik/Diagramme.tsx`) ─
 * Jedes Bild ist `aria-hidden`, trägt eine Bildunterschrift in Worten UND
 * dieselben Zahlen als echte, nur optisch verborgene Tabelle (`sr-only`, nie
 * `display:none`). Genau EINE Datenreihe je Bild, keine Legende, keine Farbe
 * als einzige Information. Veränderungspfeile tragen die Aussage als
 * ausgeschriebenen Satz (`Veraenderungspfeil`, selbst `aria-hidden` am
 * Zeichen) - nie eine Farbe nach Richtung (ein roter Pfeil wäre ein Urteil
 * über das Kind, [[feedback_nie_gegen_das_kind]]).
 *
 * ── ★ Keine Wertung ─────────────────────────────────────────────────────────
 * Keine Zahl hier wird kommentiert - kein „leider", kein „nur", kein „schon".
 * Auch die Bild-Bildunterschriften sind reine Zahlen-Sätze, keine Urteile.
 */
import { useEffect, useState, type ReactNode } from "react";
import type { BrailleAccount, BrailleClassSettings, TaskEvent } from "@/lib/braille/account";
import { brailleBackend } from "@/lib/braille/backend";
import { buildAreas, doneCount, etappeRunId } from "@/lib/braille/areas";
import { playerLevel, type BrailleProgress } from "@/lib/braille/progress";
import {
  ereignisseZwischen,
  minutenAus,
  verlaufAmAnschlag,
  wochenstand,
  wochenstandSatz,
  VERLAUF_LAENGE,
} from "@/lib/braille/wochenaufgabe";
import { leseTempoAus } from "@/lib/braille/lesezeit";
import { holeGesperrteZeitenStand, type GesperrteZeit } from "@/lib/braille/sperre";
// ★ Zubau 22.09.2026: der eigene Challenge-Verlauf - siehe Dateikopf.
import { challengeRunden, kindVeraenderung } from "@/lib/braille/challengeVerlauf";
import {
  BRAILLE_CHALLENGE_WORT,
  BRAILLE_CHALLENGE_WORT_MEHRZAHL,
  challengeWertung,
  type ChallengeErgebnis,
} from "@/lib/braille/challenge";
import {
  arbeitsweiseLabel,
  eineStelle,
  einheitLabel,
  tempo,
  treffsicherheit,
} from "@/lib/braille/wertung";
import { mmss } from "@/lib/typing/schreibprobe";
import { AbzeichenRegal } from "./AbzeichenRegal";
import { BrailleConfusionPanel } from "./BrailleConfusionPanel";
import { Kennzahl } from "@/components/typing/Kennzahl";
import { Veraenderungspfeil } from "@/components/typing/Veraenderungspfeil";
import { SortierTabelle } from "@/components/statistik/SortierTabelle";
import { ZeitraumKopf, blaettereZeitraum, wochenBlaetternTaste } from "@/components/typing/ZeitraumKopf";
import {
  ZEITRAUM_VORGABE_TABELLE,
  grenzen,
  vergleichsGrenzen,
  vergleichsName,
  wochenBereichKompakt,
  monatBereichKompakt,
  schuljahrVersetzt,
  zeitraumTitel,
  type Zeitraum,
} from "@/lib/typing/zeitraum";
import { WOCHENZIEL_GRENZE } from "@/lib/typing/wochenziel";
import { veraenderung } from "@/lib/typing/veraenderung";
import { schuljahrVon } from "@/lib/typing/jahreskarte";
import { Bildrahmen, Balken, Verlauf, type BalkenWert } from "@/components/statistik/Diagramme";

// ---------------------------------------------------------------------------
// Kleine Helfer - eigene, schlanke Fassungen (dieselbe Rechnung wie
// `PunktgenauReiter.tsx`, das diese Helfer nicht exportiert).
// ---------------------------------------------------------------------------

function fmtMinuten(min: number): string {
  const m = Math.round(min);
  if (m <= 0) return "-";
  if (m < 60) return `${m} min`;
  return `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, "0")}`;
}

function pct(anteil: number): string {
  return `${Math.round(anteil * 100)} %`;
}

function treffer(ev: readonly TaskEvent[]): number | null {
  if (ev.length === 0) return null;
  return ev.filter((e) => e.correct).length / ev.length;
}

function fmtDate(ts: number | null): string {
  if (!ts) return "-";
  return new Date(ts).toLocaleDateString("de-AT", { day: "2-digit", month: "2-digit" });
}

/** Zeigen „Schuljahr" und „Gesamt" dasselbe? Dann sagt der Zeitraum-Kopf es. */
function alleImSchuljahr(ev: readonly TaskEvent[], jetztMs: number): boolean {
  if (ev.length === 0) return true;
  const sj = schuljahrVon(jetztMs);
  return ev.every((e) => e.ts >= sj.vonMs && e.ts <= sj.bisMs);
}

/**
 * EINE Zeile wie {@link Kennzahl}, aber mit einem beliebigen Wert (hier: dem
 * Veränderungspfeil) statt einer reinen Textzahl - `Kennzahl` selbst nimmt nur
 * `value: string` entgegen und lässt sich dafür nicht wiederverwenden. Gleiche
 * Klassen, damit die Zeile sich optisch nicht von ihren Nachbarn abhebt.
 */
function KennzahlZeile({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div
      role="listitem"
      className="flex items-baseline justify-between gap-3 border-b border-hairline/60 py-1 text-sm last:border-b-0"
    >
      <dt className="m-0 text-ink-muted">{label}</dt>
      <dd className="m-0 font-semibold tabular-nums text-ink">{children}</dd>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Die Statistik
// ---------------------------------------------------------------------------

export function MeineStatistik({ account }: { account: BrailleAccount }) {
  const backend = brailleBackend();
  const jetztMs = Date.now();

  const [progress, setProgress] = useState<BrailleProgress | null>(null);
  const [events, setEvents] = useState<TaskEvent[] | null>(null);
  const [classSettings, setClassSettings] = useState<BrailleClassSettings | null>(null);
  const [gesperrt, setGesperrt] = useState<readonly GesperrteZeit[]>([]);
  // ★ Zubau 22.09.2026: der eigene Challenge-Verlauf - siehe Dateikopf.
  const [challengeVerlauf, setChallengeVerlauf] = useState<ChallengeErgebnis[] | null>(null);
  const [zeitraum, setZeitraum] = useState<Zeitraum>(ZEITRAUM_VORGABE_TABELLE);

  useEffect(() => {
    let alive = true;
    void Promise.all([
      backend.getProgress(account.id),
      backend.getEvents(account.id),
      account.classCode ? backend.getClassSettings(account.classCode) : Promise.resolve(null),
      holeGesperrteZeitenStand(account.classCode),
      backend.listeChallengeVerlaufKind(account.id),
    ]).then(([p, ev, settings, sperren, challenges]) => {
      if (!alive) return;
      setProgress(p);
      setEvents(ev);
      setClassSettings(settings ?? {});
      setGesperrt(sperren.zeiten);
      setChallengeVerlauf(challenges);
    });
    return () => {
      alive = false;
    };
  }, [backend, account.id, account.classCode]);

  const laedt =
    progress === null || events === null || classSettings === null || challengeVerlauf === null;

  if (laedt) {
    return (
      <p role="status" aria-live="polite" className="m-0 text-sm text-ink-muted">
        Deine Werte werden geladen …
      </p>
    );
  }

  // ★ Zubau 22.09.2026: Challenge-Abgaben schreiben kein `TaskEvent` (siehe
  // Dateikopf) - ein Kind mit ausschliesslich Challenge-Runden hätte sonst nie
  // etwas gesehen, obwohl es einen eigenen Verlauf hat.
  if (events.length === 0 && challengeVerlauf.length === 0) {
    return (
      <p role="status" aria-live="polite" className="m-0 text-sm text-ink-muted">
        Sobald du ein bisschen geübt hast, erscheinen hier deine Werte.
      </p>
    );
  }

  const areas = buildAreas({
    extendedNumbers: classSettings.extendedNumbers,
    expressComputer: classSettings.expressComputer,
  });
  const etappenMoeglich = areas.reduce((n, a) => n + a.etappen.length, 0);

  // ── Meine Braille-Challenges: jede eigene Runde, neueste zuerst ───────────
  // `challengeRunden` bündelt nach `probeId` - bei einem einzelnen Kind bleibt
  // je Runde genau die eine eigene Abgabe übrig (mehr kann es nicht geben,
  // `meldeChallengeErgebnis` weist eine zweite ab). `kindVeraenderung` sucht
  // sich selbst die vorige Runde DERSELBEN Arbeitsweise - hier wird nichts
  // nachgerechnet (Auftrag, [[feedback_zwei_stellen_die_voneinander_nichts_wissen]]).
  const eigeneChallengeRunden = challengeRunden(challengeVerlauf);
  const eigeneChallengeZeilen = eigeneChallengeRunden.map((runde) => {
    const ergebnis = runde.ergebnisse[0];
    return {
      probeId: runde.probeId,
      runde,
      ergebnis,
      bereichLabel: areas.find((a) => a.key === runde.bereich)?.label ?? runde.bereich,
      veraenderung: kindVeraenderung(challengeVerlauf, ergebnis),
    };
  });

  const g = grenzen(zeitraum, jetztMs, WOCHENZIEL_GRENZE);
  const gDavor = vergleichsGrenzen(zeitraum, jetztMs, WOCHENZIEL_GRENZE);
  const imZeitraum = ereignisseZwischen(events, g);
  const davor = ereignisseZwischen(events, gDavor);
  const schreiben = imZeitraum.filter((e) => e.direction === "write");
  const lesen = imZeitraum.filter((e) => e.direction === "read");

  const cpm = leseTempoAus(progress);
  const minuten = minutenAus(imZeitraum, cpm);
  const aufgaben = imZeitraum.length;
  const trefferWert = treffer(imZeitraum);
  const trefferDavor = treffer(davor);
  const trefferSchreiben = treffer(schreiben);
  const trefferLesen = treffer(lesen);
  const etappenGesamt = areas.reduce((n, a) => n + doneCount(a, progress), 0);
  const rang = playerLevel(progress.xp);
  const serie = progress.streak?.count ?? 0;
  const zuletzt = events.length ? Math.max(...events.map((e) => e.ts)) : null;
  const vergleich = vergleichsName(zeitraum, jetztMs);
  const amAnschlag = verlaufAmAnschlag(events);

  const plan = classSettings.punktgenau;
  const eigen = plan?.kinder?.[account.id];
  const wa = eigen?.wochenaufgabe ?? plan?.wochenaufgabe;
  const stand = wochenstand(wa, events, progress, jetztMs, 0, gesperrt);

  // ── Etappen je Bereich: Balken (relativ zum Bereich selbst, in %) + Tabelle ──
  const bereichsZeilen = areas.map((a) => {
    const ids = new Set(a.etappen.map((et) => etappeRunId(et)));
    const ev = imZeitraum.filter((e) => ids.has(e.level));
    const gemeistert = doneCount(a, progress);
    return {
      area: a,
      aufgaben: ev.length,
      treffer: treffer(ev),
      gemeistert,
    };
  });
  const balkenEtappen: BalkenWert[] = bereichsZeilen.map((b) => ({
    label: b.area.label,
    wert: b.area.etappen.length ? Math.round((b.gemeistert / b.area.etappen.length) * 100) : 0,
    anzeige: `${b.gemeistert} von ${b.area.etappen.length}`,
  }));

  // ── Übezeit je Tag im gewählten Zeitraum: Verlauf (letzte 14 Tage mit Übung) ──
  const tageMap = new Map<string, TaskEvent[]>();
  for (const e of imZeitraum) {
    const key = new Date(e.ts).toISOString().slice(0, 10);
    const liste = tageMap.get(key);
    if (liste) liste.push(e);
    else tageMap.set(key, [e]);
  }
  const tage = [...tageMap.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .slice(-14)
    .map(([tag, ev]) => ({ tag, minuten: minutenAus(ev, cpm) }));

  return (
    <div className="space-y-4">
      <ZeitraumKopf
        zeitraum={zeitraum}
        onZeitraum={setZeitraum}
        klasse="Zeitraum"
        titel={zeitraumTitel(zeitraum, jetztMs, WOCHENZIEL_GRENZE)}
        wocheKompakt={wochenBereichKompakt(zeitraum.wochenVersatz, jetztMs, WOCHENZIEL_GRENZE)}
        monatKompakt={monatBereichKompakt(zeitraum.monatVersatz ?? 0, jetztMs, WOCHENZIEL_GRENZE)}
        schuljahrLabel={schuljahrVersetzt(jetztMs, zeitraum.jahrVersatz ?? 0).label}
        gleichbedeutend={alleImSchuljahr(events, jetztMs)}
        titelId="meine-statistik-zeitraum"
      />

      {amAnschlag && (
        <p className="m-0 rounded-lg bg-warning-soft p-2 text-xs text-ink">
          Deine gespeicherte Aufgabenliste ist voll ({VERLAUF_LAENGE} Aufgaben). „Schuljahr" und
          „Gesamt" reichen darum nur so weit zurück - die Wochen-Ansicht ist davon nicht betroffen.
        </p>
      )}

      <div onKeyDown={wochenBlaetternTaste((schritt) => setZeitraum((z) => blaettereZeitraum(z, schritt)))}>
        <h3 id="meine-statistik-werte-titel" className="m-0 mb-1 text-sm font-semibold text-ink">
          Deine Werte im Überblick
        </h3>
        <dl
          className="m-0 grid grid-cols-1 gap-x-6 sm:grid-cols-2"
          role="list"
          aria-labelledby="meine-statistik-werte-titel"
        >
          <Kennzahl label="Übezeit" value={fmtMinuten(minuten)} />
          <Kennzahl label="Aufgaben" value={String(aufgaben)} />
          <KennzahlZeile label="Treffsicherheit">
            <Veraenderungspfeil
              wert={trefferWert === null ? "-" : pct(trefferWert)}
              veraenderung={veraenderung(
                trefferWert === null ? null : trefferWert * 100,
                trefferDavor === null ? null : trefferDavor * 100,
                "treffer",
              )}
              groesse="treffer"
              vergleichsName={vergleich}
            />
          </KennzahlZeile>
          <Kennzahl
            label="Schreiben"
            value={trefferSchreiben === null ? "-" : pct(trefferSchreiben)}
          />
          <Kennzahl label="Lesen" value={trefferLesen === null ? "-" : pct(trefferLesen)} />
          <Kennzahl label="Etappen gemeistert" value={`${etappenGesamt} / ${etappenMoeglich}`} />
          <Kennzahl label="XP" value={String(progress.xp)} />
          <Kennzahl label="Rang" value={String(rang.level)} />
          <Kennzahl label="Tagesserie" value={serie === 1 ? "1 Tag" : `${serie} Tage`} />
          <Kennzahl label="Zuletzt geübt" value={fmtDate(zuletzt)} />
        </dl>
      </div>

      <div>
        <h3 className="m-0 mb-1 text-sm font-semibold text-ink">Wochenaufgabe</h3>
        <p role="status" className="m-0 text-sm text-ink">
          {wochenstandSatz(stand)}
        </p>
      </div>

      {/*
        ★ Zubau 22.09.2026: mein eigener Braille-Challenge-Verlauf - siehe
        Dateikopf. Kein Rang, kein Vergleich mit anderen Kindern (anders als
        die Ranglisten-Tabelle der Lehrkraft): jede Zeile ist ohnehin schon die
        eigene, einzelne Abgabe. `SortierTabelle` bringt `aria-sort` und die
        Tastatur-Bedienung schon mit.
      */}
      <div>
        <h3 className="m-0 mb-1 text-sm font-semibold text-ink">
          Meine {BRAILLE_CHALLENGE_WORT_MEHRZAHL}
        </h3>
        <SortierTabelle
          spalten={[
            {
              schluessel: "datum",
              titel: "Datum",
              wert: (z: (typeof eigeneChallengeZeilen)[number]) => z.runde.begonnenMs,
              zeige: (z: (typeof eigeneChallengeZeilen)[number]) =>
                new Date(z.runde.begonnenMs).toLocaleDateString("de-AT", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                }),
            },
            {
              schluessel: "arbeitsweise",
              titel: "Arbeitsweise",
              wert: (z: (typeof eigeneChallengeZeilen)[number]) =>
                arbeitsweiseLabel(z.runde.arbeitsweise),
            },
            {
              schluessel: "bereich",
              titel: "Bereich",
              wert: (z: (typeof eigeneChallengeZeilen)[number]) => z.bereichLabel,
            },
            {
              schluessel: "leistungswert",
              titel: "Leistungswert",
              hilfe:
                "Fasst Treffsicherheit und Tempo dieser Runde in einer Zahl zusammen.",
              zahl: true,
              wert: (z: (typeof eigeneChallengeZeilen)[number]) =>
                challengeWertung(z.ergebnis).wert,
              zeige: (z: (typeof eigeneChallengeZeilen)[number]) => (
                <Veraenderungspfeil
                  wert={eineStelle(challengeWertung(z.ergebnis).wert)}
                  veraenderung={z.veraenderung}
                  groesse="score"
                  vergleichsName="der letzten Runde mit derselben Arbeitsweise"
                  darstellung="wert"
                  grund={
                    z.veraenderung
                      ? undefined
                      : "Das ist deine erste Runde mit dieser Arbeitsweise - es gibt noch nichts zu vergleichen."
                  }
                  grundKurz={z.veraenderung ? undefined : "erste Runde dieser Arbeitsweise"}
                />
              ),
            },
            {
              schluessel: "tempo",
              titel: "Tempo",
              hilfe: "Zellen bzw. Zeichen je Minute, ohne die abgezogene Vorlesezeit.",
              zahl: true,
              wert: (z: (typeof eigeneChallengeZeilen)[number]) => tempo(z.ergebnis.lauf),
              zeige: (z: (typeof eigeneChallengeZeilen)[number]) =>
                `${Math.round(tempo(z.ergebnis.lauf))} ${einheitLabel(z.runde.arbeitsweise)}/Min`,
            },
            {
              schluessel: "treffsicherheit",
              titel: "Treffsicherheit",
              zahl: true,
              wert: (z: (typeof eigeneChallengeZeilen)[number]) =>
                treffsicherheit(z.ergebnis.lauf) * 100,
              zeige: (z: (typeof eigeneChallengeZeilen)[number]) =>
                pct(treffsicherheit(z.ergebnis.lauf)),
            },
            {
              schluessel: "richtig",
              titel: "Richtig",
              zahl: true,
              wert: (z: (typeof eigeneChallengeZeilen)[number]) => z.ergebnis.lauf.richtig,
            },
            {
              schluessel: "falsch",
              titel: "Falsch",
              zahl: true,
              wert: (z: (typeof eigeneChallengeZeilen)[number]) => z.ergebnis.lauf.falsch,
            },
            {
              schluessel: "vorgelesen",
              titel: "Vorgelesen",
              hilfe: "Ob dir die Aufgabe vorgelesen wurde und wie viel Zeit dafür abgezogen wurde.",
              wert: (z: (typeof eigeneChallengeZeilen)[number]) => z.ergebnis.lauf.ansageMs,
              zeige: (z: (typeof eigeneChallengeZeilen)[number]) =>
                z.ergebnis.lauf.ansageMs > 0
                  ? `ja, ${mmss(z.ergebnis.lauf.ansageMs)} abgezogen`
                  : "nein",
            },
          ]}
          zeilen={eigeneChallengeZeilen}
          schluesselVon={(z) => z.probeId}
          standardSpalte="datum"
          leerText={`Du hast noch an keiner ${BRAILLE_CHALLENGE_WORT} teilgenommen - sobald du eine machst, erscheint sie hier.`}
          beschriftung={`Deine eigenen ${BRAILLE_CHALLENGE_WORT_MEHRZAHL}, neueste zuerst`}
        />
      </div>

      <AbzeichenRegal progress={progress} areas={areas} selfView />

      <Bildrahmen
        titel="Etappen je Bereich"
        aussage={`Insgesamt hast du ${etappenGesamt} von ${etappenMoeglich} möglichen Etappen gemeistert, verteilt auf ${areas.length} Bereiche.`}
        tabelle={
          <table>
            <caption>Etappen je Bereich, mit Aufgaben und Treffsicherheit im gewählten Zeitraum</caption>
            <thead>
              <tr>
                <th scope="col">Bereich</th>
                <th scope="col">Aufgaben</th>
                <th scope="col">Treffsicherheit</th>
                <th scope="col">Etappen gemeistert</th>
              </tr>
            </thead>
            <tbody>
              {bereichsZeilen.map((b) => (
                <tr key={b.area.key}>
                  <th scope="row">{b.area.label}</th>
                  <td>{b.aufgaben || "-"}</td>
                  <td>{b.treffer === null ? "-" : pct(b.treffer)}</td>
                  <td>
                    {b.gemeistert} von {b.area.etappen.length}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        }
      >
        <Balken werte={balkenEtappen} einheit="Prozent der Etappen dieses Bereichs" />
      </Bildrahmen>

      <Bildrahmen
        titel="Übezeit je Tag"
        aussage={
          tage.length >= 2
            ? `Deine Übezeit an den letzten ${tage.length} Tagen mit Übung im gewählten Zeitraum, von ${fmtDate(
                new Date(tage[0].tag).getTime(),
              )} bis ${fmtDate(new Date(tage[tage.length - 1].tag).getTime())}.`
            : "Noch zu wenige Tage mit Übung im gewählten Zeitraum für eine Kurve."
        }
        tabelle={
          <table>
            <caption>Übezeit je Tag im gewählten Zeitraum</caption>
            <thead>
              <tr>
                <th scope="col">Datum</th>
                <th scope="col">Übezeit</th>
              </tr>
            </thead>
            <tbody>
              {tage.map((t) => (
                <tr key={t.tag}>
                  <th scope="row">{fmtDate(new Date(t.tag).getTime())}</th>
                  <td>{fmtMinuten(t.minuten)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        }
      >
        <Verlauf werte={tage.map((t) => t.minuten)} />
      </Bildrahmen>

      <div>
        <h3 className="m-0 mb-1 text-sm font-semibold text-ink">Verwechslungen</h3>
        <BrailleConfusionPanel accountId={account.id} viewer="schueler" />
      </div>
    </div>
  );
}
