/**
 * „Klangpunkte" — Shell des eigenständigen Braille-Musik-Lernprogramms.
 *
 * Zwei Ansichten:
 *  • Kapitelwahl — die Lern-Landkarte: Klangwelten als Abschnitte, jedes
 *    Kapitel frei wählbar (kein Freischalt-Gate), mit Sterne-Stand (0–3 ★)
 *    und „gemeistert"-Kennzeichnung. Erster Bildschirm für Neulinge.
 *  • Üben — Kopfleisten (Rang/XP/Sterne · Runden-Striche · Kapitel-Navigation)
 *    + der bewährte KlangpunkteRunner. Resume: das zuletzt geübte Kapitel
 *    öffnet sich beim nächsten Besuch von selbst (lastPlace).
 *
 * Bewertung wie gehabt: Mastery-Fenster (≥ 12 Aufgaben, ≥ 90 %) → Kapitel
 * gemeistert; Sterne ≥ 97 % → 3, ≥ 92 % → 2, sonst 1 (Bestwert bleibt).
 * XP: +2 je richtiger Antwort/Zelle, +30 je gemeistertem Kapitel.
 *
 * A11y nach den etablierten Mustern: feste ARIA-Live-Regionen, Ansagen bei
 * jedem Umschalten, RoundTicks (Alt+Z), Zeichenliste (Alt+L, wiederverwendet
 * aus Punktgenau über eine Pseudo-Area), Alt+U = Kapitelwahl (bis 30.08.2026 Alt+K).
 */
import { altAnzeige } from "@/lib/altTaste";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  type BrailleProgress,
} from "@/lib/braille";
import { sprich } from "@/lib/klangpunkte/sprechen";
import { useKlangTexte, useKlangSprache } from "@/lib/klangpunkte/sprache";
import { useVoice, useAvailableVoices } from "@/lib/braille/voice";
import { stimmeFuer } from "@/lib/sprechen/stimmeFuer";
import { STIMME_HINWEIS, STIMME_HINWEIS_NIE } from "@/lib/klangpunkte/texte/stimmeHinweis";
import type { KlangSprache } from "@/lib/klangpunkte/tonnamen";
import { playLevelJingle } from "@/lib/braille/earcons";
import { useBraillePlay } from "@/lib/braille/play";
import type { Area } from "@/lib/braille/areas";
import {
  awardKlangBadges,
  earnedKlangBadges,
  KLANG_BADGES,
  type KlangBadgeEvent,
} from "@/lib/klangpunkte/badges";
import {
  getKapitelMastery,
  loadKlangProgressMigrated,
  MAX_WERKE,
  playerLevel,
  saveKlangProgress,
  totalStars,
  type KlangProgress,
  type Werk,
} from "@/lib/klangpunkte/progress";
import {
  KAPITEL,
  KLANG_WELTEN,
  kapitelById,
  kapitelIndex,
  weltByNr,
  weltOfKapitel,
} from "@/lib/klangpunkte/welten";
import { nextKlangTask } from "@/lib/klangpunkte/etappen";
import { useMusicSettings } from "@/lib/klangpunkte/store";
import type { Etappe } from "@/lib/braille/etappen";
import { KlangpunkteRunner } from "./KlangpunkteRunner";
import { BrailleZeichenliste } from "@/components/braille/BrailleZeichenliste";
import {
  BrailleZoomBar,
  ProgressRing,
  RoundTicks,
  type AnnounceCallback,
  type RingInfo,
  type TaskOutcome,
} from "@/components/braille/BrailleTrainer";

/** ARIA-Live: erst leeren, dann verzögert füllen (erzwingt Wiederholung — der
 *  50-ms-Abstand ist der NVDA-erprobte Weg, siehe Punktgenau). */
/**
 * Ruhiger Hinweis: „Vorlesen" ist an, aber für die Sprache gibt es auf dem Gerät keine Stimme
 * (`stimmeFuer` liefert `null`; `voice.ts` liest dann nicht vor). Kein Live-Region, kein Fokus.
 * Erst zeigen, wenn die Stimmenliste geladen ist (`voiceschanged`, d. h. die Liste ist nicht
 * mehr leer) oder nach 1,5 s. Für `de` und `en` (alter Weg) nie - dort rendert er nichts.
 */
function StimmeHinweis() {
  const sprache = useKlangSprache();
  const vorlesen = useVoice((st) => st.enabled);
  const stimmen = useAvailableVoices();
  const [spaet, setSpaet] = useState(false);
  useEffect(() => {
    const id = window.setTimeout(() => setSpaet(true), 1500);
    return () => window.clearTimeout(id);
  }, []);
  if (!vorlesen || STIMME_HINWEIS_NIE.includes(sprache)) return null;
  if (stimmen.length === 0 && !spaet) return null;
  const text = STIMME_HINWEIS[sprache as KlangSprache];
  if (!text || stimmeFuer(sprache, stimmen)) return null;
  return (
    <p className="card p-3 text-sm text-ink-muted" lang={sprache === "br" ? "pt-BR" : sprache} data-testid="kp-stimme-hinweis">
      {text}
    </p>
  );
}

function pushLive(set: (s: string) => void, text: string): void {
  set("");
  setTimeout(() => set(text), 50);
}

/** Noch nicht gebaute Klangwelten (Nummern bleiben reserviert). Seit Stufe 5
 *  sind alle neun Welten gebaut — die Liste ist leer. */
const GEPLANTE_WELTEN: Record<number, string> = {};

/** Kapitel ohne Sterne-Gate — sie laufen auf „Häkchen besucht" (§12). */
const NO_STAR_KAPITEL = new Set(["kp-spielwiese", "kp-komponier"]);

/** Kapitel, die NICHT in den Tages-Mix wandern: Lied-, Sandbox-, Freispiel- und
 *  Memory-Kapitel — sie brauchen eine eigene Auswahl bzw. laufen ohne kurze
 *  Einzelaufgabe und passen nicht in eine schnelle Wiederholrunde. */
const NOT_FOR_MIX = new Set([
  "kp14",
  "kp-komponier",
  "kp-spielwiese",
  "kp-lesekonzert",
  "kp-melodie-memory",
  "kp-lieder2",
]);

/** Der Tages-Mix läuft fünf Minuten. */
const MIX_SECONDS = 300;

/** Sterne als Text fürs Auge (★★☆) — Screenreader bekommen den Satz daneben. */
function starGlyphs(n: number): string {
  return "★".repeat(n) + "☆".repeat(Math.max(0, 3 - n));
}

export function Klangpunkte({
  loadFn = loadKlangProgressMigrated,
  saveFn = saveKlangProgress,
}: {
  loadFn?: () => KlangProgress;
  saveFn?: (p: KlangProgress) => void;
} = {}) {
  const t = useKlangTexte().uebersicht;
  const [progress, setProgress] = useState<KlangProgress>(() => loadFn());
  // Resume: das zuletzt geübte Kapitel wieder öffnen; sonst die Kapitelwahl.
  const [kapitelId, setKapitelId] = useState<string | null>(() => {
    const saved = progress.lastPlace?.kapitelId;
    return saved && kapitelById(saved) ? saved : null;
  });
  // Toast-Warteschlange: mehrere Meldungen (z. B. „Geschafft!" UND ein neu
  // verdientes Abzeichen, die im selben Tick feuern) nacheinander zeigen, statt
  // dass die zweite die erste sofort überschreibt.
  const [toastQueue, setToastQueue] = useState<string[]>([]);
  const toast = toastQueue[0] ?? "";
  const enqueueToast = (msg: string) =>
    setToastQueue((q) => (q[q.length - 1] === msg ? q : [...q, msg]));
  const clearToasts = () => setToastQueue([]);
  // Solange mehr als eine Meldung wartet, nach kurzer Standzeit weiterrücken; die
  // LETZTE bleibt stehen (wie bisher), bis eine Aktion sie ersetzt oder leert.
  useEffect(() => {
    if (toastQueue.length <= 1) return;
    const id = window.setTimeout(() => setToastQueue((q) => q.slice(1)), 3200);
    return () => window.clearTimeout(id);
  }, [toastQueue]);
  const [ring, setRing] = useState<RingInfo | null>(null);
  // Tages-Mix (§11.4): läuft statt eines Kapitels; quer durch gemeisterte Kapitel.
  const [mixActive, setMixActive] = useState(false);
  const wahlHeadingRef = useRef<HTMLHeadingElement>(null);

  // Pool für den Tages-Mix: gemeisterte Kapitel, die sich für kurze Einzelaufgaben
  // eignen (keine Lieder-/Sandbox-/Freispiel-Kapitel).
  const mixPool = useMemo(
    () =>
      KAPITEL.filter(
        (et) => progress.levels[et.id]?.completed && !NOT_FOR_MIX.has(et.id),
      ).map((et) => et.id),
    [progress],
  );

  // ARIA-Live-Kanäle (immer gemountet, nie bedingt).
  const [taskMsg, setTaskMsg] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [alertMsg, setAlertMsg] = useState("");
  const announce: AnnounceCallback = ({ channel, text, brailleText, voice }) => {
    const liveText = brailleText ? `${text} ${brailleText}` : text;
    if (channel === "task") pushLive(setTaskMsg, liveText);
    else if (channel === "status") pushLive(setStatusMsg, liveText);
    else pushLive(setAlertMsg, liveText);
    if (voice !== false) sprich(text);
  };

  // progressRef spiegelt den zuletzt persistierten Stand SYNCHRON — nötig, weil
  // beim Speichern eines Werks saveWerk und applyResult im selben Tick nacheinander
  // persistieren; ohne Ref würde der zweite Aufruf den ersten (stale) überschreiben.
  const progressRef = useRef(progress);
  progressRef.current = progress;
  const persist = (
    p: KlangProgress | ((prev: KlangProgress) => KlangProgress),
  ) => {
    const next = typeof p === "function" ? p(progressRef.current) : p;
    progressRef.current = next;
    setProgress(next);
    saveFn(next);
  };

  const kapitel = kapitelId ? kapitelById(kapitelId) : null;
  const welt = kapitelId ? weltOfKapitel(kapitelId) : null;
  const flatIdx = kapitelId ? kapitelIndex(kapitelId) : -1;
  const nextKapitel = flatIdx >= 0 ? (KAPITEL[flatIdx + 1] ?? null) : null;

  /** Kapitel öffnen (id) bzw. zur Kapitelwahl zurück (null). */
  const selectKapitel = (id: string | null, focusWahl = false) => {
    clearToasts();
    setRing(null);
    setMixActive(false);
    if (id === null) {
      setKapitelId(null);
      announce({
        channel: "status",
        text: t.kapitelwahlAnsage,
      });
      if (focusWahl)
        window.setTimeout(() => wahlHeadingRef.current?.focus({ preventScroll: true }), 60);
      return;
    }
    const et = kapitelById(id);
    if (!et) return;
    const w = weltOfKapitel(id);
    const idxInWelt = w ? w.etappen.findIndex((e) => e.id === id) : -1;
    setKapitelId(id);
    persist({ ...progress, lastPlace: { kapitelId: id } });
    announce({
      channel: "status",
      text: w
        ? t.kapitelAnsage(w.nr, w.title, idxInWelt + 1, w.etappen.length, et.title)
        : t.kapitelAnsageOhneWelt(et.title),
    });
  };

  // Abzeichen-Ereignis verbuchen (§12): Zähler + neu verdiente Abzeichen; bei
  // Neuzugang „Ta-daa"-Jingle + Ansage. Der persist-Updater bleibt rein — die
  // neu verdienten Abzeichen sammelt der Closure synchron ein.
  const bumpBadges = (event: KlangBadgeEvent) => {
    let names: string[] = [];
    persist((prev) => {
      const { progress: next, newly } = awardKlangBadges(prev, event, Date.now());
      names = newly.map((b) => b.name);
      return next;
    });
    if (names.length) {
      playLevelJingle();
      const label = names.length === 1 ? t.neuesAbzeichen(names[0]) : t.neueAbzeichen(names);
      enqueueToast(label);
      announce({ channel: "status", text: label });
    }
  };

  // Ein Aufgaben-Ergebnis verbuchen (Mastery + Sterne-Bestwert + XP).
  const applyResult = (r: TaskOutcome) => {
    if (!kapitelId) return;
    persist((prev) => {
      const rec = prev.levels[kapitelId];
      return {
        ...prev,
        xp: prev.xp + (r.correct ? 2 : 0) + (r.masteredNow ? 30 : 0),
        levels: r.masteredNow
          ? {
              ...prev.levels,
              [kapitelId]: {
                completed: true,
                bestStars: Math.max(rec?.bestStars ?? 0, r.stars),
                attempts: (rec?.attempts ?? 0) + 1,
              },
            }
          : prev.levels,
        mastery: { ...(prev.mastery ?? {}), [kapitelId]: r.mastery },
        lastPlace: { kapitelId },
      };
    });
    if (r.masteredNow) {
      // Sternlose Kapitel (Spielwiese/Komponier): kein „0 von 3 Sternen" —
      // das klänge nach Misserfolg, obwohl das Häkchen verdient ist.
      enqueueToast(
        r.stars > 0 ? t.geschafftMitSternen(r.stars) : t.geschafft,
      );
      // Gemeistertes Kapitel kann Sterne-/Welten-/Bestnoten-Abzeichen auslösen.
      bumpBadges({ kind: "mastered" });
    }
  };

  // Komponier-Werkstatt (kp-komponier, §4.5): ein Werk speichern (max. 5,
  // ältestes fällt heraus). Das Häkchen setzt der Runner über applyResult.
  const saveWerk = (w: Werk) => {
    persist((prev) => ({ ...prev, werke: [...(prev.werke ?? []), w].slice(-MAX_WERKE) }));
    // Erstes/fünftes Werk = Geheim-Abzeichen (§12).
    bumpBadges({ kind: "werk" });
  };

  // Alt+L — Zeichenliste öffnen/schließen (geteiltes Nonce-Muster).
  const charsNonce = useBraillePlay((s) => s.charsNonce);
  const [showZeichen, setShowZeichen] = useState(false);
  const toggleZeichen = (next: boolean) => {
    setShowZeichen(next);
    sprich(next ? t.zeichenlisteOffen : t.zeichenlisteZu);
  };
  const prevCharsRef = useRef(0);
  useEffect(() => {
    if (charsNonce === 0 || charsNonce === prevCharsRef.current) return;
    prevCharsRef.current = charsNonce;
    toggleZeichen(!showZeichen);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [charsNonce]);
  useEffect(() => {
    useBraillePlay.getState().setCharsOpen(showZeichen);
    return () => useBraillePlay.getState().setCharsOpen(false);
  }, [showZeichen]);

  // Alt+Z — Runden-Anzeige ansagen + fokussieren (Esc → zurück ins Eingabefeld).
  const roundNonce = useBraillePlay((s) => s.roundNonce);
  const ringRef = useRef<RingInfo | null>(ring);
  ringRef.current = ring;
  const prevRoundRef = useRef(0);
  useEffect(() => {
    if (roundNonce === 0 || roundNonce === prevRoundRef.current) return;
    prevRoundRef.current = roundNonce;
    const el = document.getElementById("pl-round-ticks");
    const label = ringRef.current?.round?.label;
    if (!el || !label) return;
    el.focus({ preventScroll: true });
    // ⚠️ KEIN `behavior: "smooth"` (29.09.2026): Ein ausdrückliches „smooth"
    // übergeht „weniger Bewegung" - die Regel in `index.css` schaltet nur das
    // CSS-`scroll-behavior` ab. Ohne Angabe folgt der Sprung dieser Regel.
    // Wächter: tests/klangpunkte-fokus-und-bewegung.test.ts.
    el.scrollIntoView({ block: "nearest" });
    sprich(label);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundNonce]);

  // Alt+U — zur Kapitelwahl (die Lern-Landkarte); bis 30.08.2026 Alt+K.
  const focusEtappeNonce = useBraillePlay((s) => s.focusEtappeNonce);
  const prevFocusEtappeRef = useRef(0);
  useEffect(() => {
    if (focusEtappeNonce === 0 || focusEtappeNonce === prevFocusEtappeRef.current) return;
    prevFocusEtappeRef.current = focusEtappeNonce;
    selectKapitel(null, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusEtappeNonce]);

  // Alt+1…9 — Klangwelt direkt anspringen (erstes Kapitel der Welt).
  const areaRequest = useBraillePlay((s) => s.areaRequest);
  const prevAreaNonceRef = useRef(0);
  useEffect(() => {
    if (!areaRequest || areaRequest.nonce === prevAreaNonceRef.current) return;
    prevAreaNonceRef.current = areaRequest.nonce;
    const nr = Number(areaRequest.key);
    if (!Number.isInteger(nr)) return;
    const w = weltByNr(nr);
    if (w && w.etappen.length) {
      selectKapitel(w.etappen[0].id);
    } else if (GEPLANTE_WELTEN[nr]) {
      announce({
        channel: "status",
        text: t.weltInArbeit(nr, GEPLANTE_WELTEN[nr]),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [areaRequest]);

  // Rang + Sterne über alle Kapitel — die sternlosen Kapitel (Spielwiese/
  // Komponier) zählen nicht zum Maximum, sonst wäre es nie erreichbar.
  const pl = playerLevel(progress.xp);
  const starsAll = totalStars(progress);
  const maxStars = KAPITEL.filter((et) => !NO_STAR_KAPITEL.has(et.id)).length * 3;

  // Zeichenliste: Pseudo-Area „noten" mit ALLEN Kapiteln in Welten-Reihenfolge
  // (BrailleZeichenliste löst Musik-Schlüssel über klangUnitCells auf).
  const zeichenArea: Area = useMemo(
    () => ({
      key: "noten",
      label: t.zeichenAreaLabel,
      blurb: t.zeichenAreaBlurb,
      system: "basis",
      eightDot: false,
      etappen: KAPITEL,
    }),
    [t],
  );
  // Die Zeichenliste erwartet einen Braille-Spielstand — Klangpunkte hat die
  // gleichen Felder (xp/levels/mastery), nur lastPlace ist anders geformt.
  const zeichenProgress: BrailleProgress = useMemo(
    () => ({ xp: progress.xp, levels: progress.levels, mastery: progress.mastery }),
    [progress],
  );

  return (
    <div className="not-prose space-y-5">
      {/* Feste ARIA-Live-Regionen */}
      <div id="kp-live-task" aria-live="assertive" aria-atomic="true" className="sr-only">{taskMsg}</div>
      <div id="kp-live-status" role="status" aria-live="polite" aria-atomic="true" className="sr-only">{statusMsg}</div>
      <div id="kp-live-alert" role="alert" aria-live="assertive" aria-atomic="true" className="sr-only">{alertMsg}</div>

      {/* Leiste 1: Rang + XP/Sterne + Runden-Anzeige + Kapitel-Navigation */}
      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
          <div className="flex items-center gap-2">
            <ProgressRing
              value={pl.need ? pl.into / pl.need : 0}
              number={pl.level}
              caption={t.rangCaption}
              ariaLabel={t.rangLabel(pl.level, pl.need - pl.into)}
            />
            <span className="text-xs leading-tight text-ink-muted">
              <span
                role="img"
                title={t.xpHinweis(progress.xp)}
                aria-label={t.xpHinweis(progress.xp)}
              >
                {t.xpText(progress.xp)}
              </span>
              <br />
              <span
                role="img"
                title={t.sterneHinweis(starsAll, maxStars)}
                aria-label={t.sterneHinweis(starsAll, maxStars)}
              >
                {starsAll} ★
              </span>
            </span>
          </div>

          {kapitel && ring && (
            <ProgressRing
              value={ring.value}
              number={ring.number}
              caption={ring.caption}
              ariaLabel={ring.ariaLabel}
            />
          )}
          {kapitel && ring?.round && <RoundTicks round={ring.round} />}

          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 sm:ml-auto">
            {kapitel && welt ? (
              <>
                {/* `min-w-0`: ohne das weigert sich dieser Block, unter seine
                    Textbreite zu schrumpfen (Flexbox-Falle „min-width: auto"),
                    und reisst bei 320 px die ganze Seite waagrecht auf
                    (Prüfpunkt 8.2, gemessen 25./26.08. - identisches Muster wie
                    in Punktgenau.tsx). Der Text bricht dadurch normal um -
                    nichts wird abgeschnitten. */}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink">
                    {t.weltKopf(welt.nr, welt.title, welt.etappen.findIndex((e) => e.id === kapitel.id) + 1, welt.etappen.length)}
                  </p>
                  <p className="text-xs text-ink-muted">{welt.blurb}</p>
                </div>
                {/* `flex-wrap`: identisches Muster wie in Punktgenau.tsx -
                    der ausgewählte Kapitelname im `<select>` kann lang sein
                    und passt bei 320 px nicht mehr neben die beiden Pfeil-
                    Knöpfe in eine Zeile. Das war die eigentliche Ursache des
                    73-px-Überlaufs (nicht der Text daneben, s.o.): ohne
                    Umbruch presst der Browser das `<select>` schmäler und
                    schneidet den sichtbaren Namen mit „…" ab (Prüfpunkt 8.2,
                    gemessen 25./26.08.). */}
                <div className="flex flex-wrap items-center gap-1">
                  <button
                    type="button"
                    className="btn-secondary btn-toggle"
                    onClick={() => flatIdx > 0 && selectKapitel(KAPITEL[flatIdx - 1].id)}
                    // ★★★ `aria-disabled`, nie `disabled` (Bauart §3): Wer sich
                    // zum ersten Kapitel zurueckblaettert, steht mit dem Fokus
                    // auf genau diesem Knopf - und faellt sonst an den
                    // Dokumentenanfang. Der Riegel steht schon im `onClick`.
                    aria-disabled={flatIdx <= 0 || undefined}
                    aria-label={t.voriges}
                  >
                    <span aria-hidden="true">←</span>
                  </button>
                  <select
                    aria-label={t.kapitelSelect}
                    value={kapitel.id}
                    onChange={(e) => selectKapitel(e.target.value)}
                    className="max-w-[18rem] rounded-xl border border-hairline bg-surface-raised px-3 py-2 text-sm text-ink focus:border-accent"
                  >
                    {KLANG_WELTEN.map((w) => (
                      <optgroup key={w.key} label={t.weltName(w.nr, w.title)}>
                        {w.etappen.map((et, i) => {
                          const rec = progress.levels[et.id];
                          // Status als TEXT (Braillezeile: Emojis wären Füllmuster).
                          const sterne = rec?.completed ? rec.bestStars : null;
                          return (
                            <option key={et.id} value={et.id}>
                              {t.kapitelOption(i + 1, et.title, sterne)}
                            </option>
                          );
                        })}
                      </optgroup>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="btn-secondary btn-toggle"
                    onClick={() => nextKapitel && selectKapitel(nextKapitel.id)}
                    // ★★★ Wie beim Zurueck-Knopf.
                    aria-disabled={!nextKapitel || undefined}
                    aria-label={t.naechstes}
                  >
                    <span aria-hidden="true">→</span>
                  </button>
                </div>
              </>
            ) : (
              <p className="text-sm font-semibold text-ink">
                {t.landkarte(KAPITEL.length, KLANG_WELTEN.length)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Leiste 2: Kapitelwahl · Zeichenliste (Ton und Vorlesen: Menü unter dem Lautsprecher) */}
      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            aria-pressed={!kapitel && !mixActive}
            onClick={() =>
              kapitel || mixActive ? selectKapitel(null, true) : undefined
            }
            aria-keyshortcuts="Alt+U"
            className={(!kapitel && !mixActive ? "btn-primary" : "btn-secondary") + " btn-toggle"}
            title={altAnzeige(t.kapitelwahlTitel)}
          >
            <span aria-hidden="true">🗺</span> {t.kapitelwahlKnopf}
          </button>

          <button
            type="button"
            aria-pressed={showZeichen}
            onClick={() => toggleZeichen(!showZeichen)}
            aria-keyshortcuts="Alt+L"
            className="btn-secondary btn-toggle"
            title={altAnzeige(t.zeichenlisteTitel)}
          >
            <span aria-hidden="true">📖</span> {t.zeichenlisteKnopf}
          </button>

          {/* ★ Sounds, Sprechtempo und Stimme stehen seit 17.10.2026 NUR im Menü
              unter dem Lautsprecher (Johannes: „aus der Klangpunkte-Leiste raus"). */}
        </div>
      </div>

      <StimmeHinweis />

      {toast && (
        <p
          role="status"
          className="rounded-xl border border-success/40 bg-success-soft p-3 text-center text-sm font-medium text-ink"
        >
          {toast}
        </p>
      )}

      {mixActive ? (
        <>
          <BrailleZoomBar />
          <TagesMix
            pool={mixPool}
            progress={progress}
            onAnnounce={announce}
            onExit={() => selectKapitel(null, true)}
          />
        </>
      ) : kapitel ? (
        <>
          <BrailleZoomBar />
          <KlangpunkteRunner
            key={kapitel.id}
            etappe={kapitel}
            initialMastery={getKapitelMastery(progress, kapitel.id)}
            onResult={applyResult}
            onNext={nextKapitel ? () => selectKapitel(nextKapitel.id) : null}
            nextTitle={nextKapitel?.title}
            onProgress={setRing}
            onAnnounce={announce}
            werke={progress.werke ?? []}
            onSaveWerk={saveWerk}
            onBadge={bumpBadges}
            bestStarsSoFar={progress.levels[kapitel.id]?.bestStars ?? 0}
            noStars={NO_STAR_KAPITEL.has(kapitel.id)}
          />
        </>
      ) : (
        /* --- Kapitelwahl: die Lern-Landkarte ------------------------------- */
        <div className="space-y-5">
          <h2
            ref={wahlHeadingRef}
            tabIndex={-1}
            className="m-0 text-lg font-semibold text-ink outline-none"
          >
            {t.kapitelwahlUeberschrift}
          </h2>

          {/* Tages-Mix: kurze Wiederholrunde quer durch gemeisterte Kapitel. */}
          <section className="card p-4" aria-labelledby="kw-mix-h">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <h3 id="kw-mix-h" className="m-0 text-base font-semibold text-ink">
                  <span aria-hidden="true">🎲 </span>{t.mixTitel}
                </h3>
                <p className="m-0 mt-0.5 text-sm text-ink-muted">
                  {t.mixText}
                </p>
              </div>
              {mixPool.length >= 3 ? (
                <button
                  type="button"
                  className="btn-primary btn-toggle shrink-0"
                  onClick={() => {
                    clearToasts();
                    setMixActive(true);
                  }}
                >
                  {t.loslegen} <span aria-hidden="true">→</span>
                </button>
              ) : (
                <p className="m-0 max-w-[16rem] text-xs text-ink-muted">
                  {t.mixZuWenig(mixPool.length)}
                </p>
              )}
            </div>
          </section>

          {KLANG_WELTEN.map((w) => {
            const doneCount = w.etappen.filter((et) => progress.levels[et.id]?.completed).length;
            const starSum = w.etappen.reduce(
              (s, et) => s + (progress.levels[et.id]?.bestStars ?? 0),
              0,
            );
            return (
              <section key={w.key} className="card p-4" aria-labelledby={`kw-h-${w.key}`}>
                <h3 id={`kw-h-${w.key}`} className="m-0 text-base font-semibold text-ink">
                  {t.weltName(w.nr, w.title)}
                </h3>
                <p className="m-0 mt-0.5 text-sm text-ink-muted">{w.blurb}</p>
                <p className="m-0 mt-1 text-xs text-ink-muted">
                  {t.weltStand(doneCount, w.etappen.length, starSum, w.etappen.filter((et) => !NO_STAR_KAPITEL.has(et.id)).length * 3)}
                </p>
                <ul className="m-0 mt-3 grid list-none gap-2 p-0 sm:grid-cols-2">
                  {w.etappen.map((et, i) => {
                    const rec = progress.levels[et.id];
                    const s = rec?.bestStars ?? 0;
                    // Spielwiese/Komponier laufen ohne Sterne — Häkchen „besucht"
                    // (§12); Komponier zeigt zusätzlich die Werke-Zahl.
                    const noStars = NO_STAR_KAPITEL.has(et.id);
                    const werkeN = et.id === "kp-komponier" ? (progress.werke?.length ?? 0) : 0;
                    return (
                      <li key={et.id}>
                        <button
                          type="button"
                          onClick={() => selectKapitel(et.id)}
                          className="card flex w-full items-center justify-between gap-3 border border-hairline bg-surface-raised px-3 py-2.5 text-left text-sm hover:bg-surface-sunken focus-visible:outline focus-visible:outline-[4.5px] focus-visible:outline-offset-2 focus-visible:outline-accent"
                        >
                          <span className="font-medium text-ink">
                            {t.kapitelZeile(i + 1, et.title)}
                            {et.id === "kp-komponier" && werkeN > 0 && (
                              <span className="text-ink-muted">{t.werkeText(werkeN)}</span>
                            )}
                          </span>
                          {noStars ? (
                            <span aria-hidden="true" className="shrink-0 text-sm text-ink-muted">
                              {rec?.completed ? t.besucht : "☐"}
                            </span>
                          ) : (
                            <span aria-hidden="true" className="shrink-0 tracking-wide text-amber-500">
                              {starGlyphs(s)}
                            </span>
                          )}
                          <span className="sr-only">
                            {noStars
                              ? rec?.completed
                                ? t.srBesucht
                                : t.srNichtBesucht
                              : rec?.completed
                                ? t.srGemeistert(s)
                                : t.srNichtGemeistert}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
          <BadgeGallery progress={progress} />
        </div>
      )}

      {showZeichen && (
        <BrailleZeichenliste
          area={zeichenArea}
          activeIndex={Math.max(0, flatIdx)}
          progress={zeichenProgress}
          // ★ 18.10.2026: Esc (und ✕) führen zurück ins Übungsfeld - Hausregel
          //   „Esc ⇒ Eingabezeile", wie Hilfe und Kürzel-Liste der Seite.
          onClose={() => {
            toggleZeichen(false);
            useBraillePlay.getState().requestFocusInput();
          }}
        />
      )}
    </div>
  );
}

/** Abzeichen-Galerie auf der Kapitelwahl (§12): verdiente Abzeichen mit Emoji +
 *  Name, noch verschlossene ausgegraut (Geheim-Abzeichen bleiben „???"). */
function BadgeGallery({ progress }: { progress: KlangProgress }) {
  const t = useKlangTexte().uebersicht;
  const earned = earnedKlangBadges(progress);
  const earnedIds = new Set(earned.map((e) => e.def.id));
  return (
    <section className="card p-4" aria-labelledby="kp-badges-h">
      <h3 id="kp-badges-h" className="m-0 text-base font-semibold text-ink">
        {t.abzeichenTitel}
      </h3>
      <p className="m-0 mt-0.5 text-sm text-ink-muted">
        {t.abzeichenStand(earned.length, KLANG_BADGES.length)}
      </p>
      <ul className="m-0 mt-3 grid list-none gap-2 p-0 sm:grid-cols-2 lg:grid-cols-3">
        {KLANG_BADGES.map((b) => {
          const has = earnedIds.has(b.id);
          const hidden = b.secret && !has;
          return (
            <li
              key={b.id}
              className={
                "flex items-center gap-2 rounded-xl border px-3 py-2 " +
                (has ? "border-accent/40 bg-accent-soft" : "border-hairline bg-surface-raised opacity-70")
              }
            >
              <span aria-hidden="true" className="text-xl">
                {hidden ? "❓" : b.emoji}
              </span>
              <span className="min-w-0 text-sm">
                <span className="block truncate font-medium text-ink">
                  {hidden ? t.geheimAbzeichen : b.name}
                </span>
                <span className="block text-xs text-ink-muted">
                  {hidden ? t.geheimBeschreibung : b.description}
                </span>
              </span>
              <span className="sr-only">
                {has ? t.srVerdient : hidden ? t.srGeheim : t.srNichtVerdient}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/**
 * Tages-Mix (§11.4): eine fünfminütige Wiederholrunde quer durch die gemeisterten
 * Kapitel (Spacing/Wachhalten). Reine Wiederholung — es werden keine Sterne
 * vergeben und der Spielstand bleibt unberührt (der Runner läuft im mix-Modus).
 */
function TagesMix({
  pool,
  progress,
  onAnnounce,
  onExit,
}: {
  pool: string[];
  progress: KlangProgress;
  onAnnounce: AnnounceCallback;
  onExit: () => void;
}) {
  const t = useKlangTexte().uebersicht;
  const nameStyle = useMusicSettings((s) => s.nameStyle);
  const rhythmSilben = useMusicSettings((s) => s.rhythmSilben);
  const [left, setLeft] = useState(MIX_SECONDS);
  const [done, setDone] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [total, setTotal] = useState(0);
  const poolRef = useRef(pool);
  poolRef.current = pool;
  const doneHeadingRef = useRef<HTMLHeadingElement>(null);
  // „Zeit um!" nur, wenn wirklich die Zeit ablief — nicht beim Beenden-Knopf.
  const endedByUserRef = useRef(false);

  const mixEtappe = useMemo(
    () =>
      ({
        id: "__mix__",
        title: t.mixTitel,
        introDu: t.mixIntro,
      }) as unknown as Etappe,
    [t],
  );

  const pick = () => {
    const ids = poolRef.current;
    if (!ids.length) return null;
    const id = ids[Math.floor(Math.random() * ids.length)];
    return nextKlangTask(id, nameStyle, rhythmSilben);
  };

  // Start-Ansage (einmalig).
  useEffect(() => {
    onAnnounce({
      channel: "status",
      text: t.mixStart(pool.length),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Countdown im Sekundentakt.
  useEffect(() => {
    if (done) return;
    if (left <= 0) {
      setDone(true);
      return;
    }
    const id = window.setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(id);
  }, [left, done]);

  // Abschluss-Ansage + Fokus.
  useEffect(() => {
    if (!done) return;
    onAnnounce({
      channel: "status",
      text: t.mixEnde(endedByUserRef.current, correct, total),
    });
    window.setTimeout(() => doneHeadingRef.current?.focus({ preventScroll: true }), 60);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  const restart = () => {
    setCorrect(0);
    setTotal(0);
    setLeft(MIX_SECONDS);
    endedByUserRef.current = false;
    setDone(false);
  };

  const mm = Math.floor(left / 60);
  const ss = String(left % 60).padStart(2, "0");

  if (done) {
    const pct = total ? Math.round((correct / total) * 100) : 0;
    return (
      <div className="card space-y-4 p-6 text-center">
        <h2
          ref={doneHeadingRef}
          tabIndex={-1}
          className="m-0 text-lg font-semibold text-ink outline-none"
        >
          <span aria-hidden="true">🎲 </span>{t.mixGeschafft}
        </h2>
        <p className="text-base text-ink">
          {t.mixErgebnis(correct, total)}
          {total > 0 && <span className="text-ink-muted">{t.mixProzent(pct)}</span>}
        </p>
        <p className="text-sm text-ink-muted">
          {t.mixFein}
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <button type="button" className="btn-primary" onClick={restart}>
            {t.nochEineRunde}
          </button>
          <button type="button" className="btn-secondary" onClick={onExit}>
            {t.zurKapitelwahl}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="card flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="min-w-0">
          <p className="m-0 text-base font-semibold text-ink">
            <span aria-hidden="true">🎲 </span>{t.mixTitel}
          </p>
          <p className="m-0 text-sm text-ink-muted">
            {t.mixBunt(pool.length)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span
            role="timer"
            aria-label={t.mixTimer(mm, left % 60)}
            className="font-mono text-lg font-semibold tabular-nums text-ink"
          >
            {mm}:{ss}
          </span>
          <span
            className="text-sm text-ink-muted"
            aria-label={t.mixRichtigLabel(correct, total)}
          >
            {correct}/{total} <span aria-hidden="true">{t.mixRichtig}</span>
          </span>
          <button
            type="button"
            className="btn-secondary btn-toggle"
            onClick={() => {
              endedByUserRef.current = true;
              setDone(true);
            }}
          >
            {t.beenden}
          </button>
        </div>
      </div>
      <KlangpunkteRunner
        key="tages-mix"
        etappe={mixEtappe}
        initialMastery={getKapitelMastery(progress, "__mix__")}
        onResult={() => {}}
        onNext={null}
        onProgress={() => {}}
        onAnnounce={onAnnounce}
        mix={{ pick }}
        onMix={(c) => {
          setTotal((t) => t + 1);
          if (c) setCorrect((x) => x + 1);
        }}
      />
    </div>
  );
}
