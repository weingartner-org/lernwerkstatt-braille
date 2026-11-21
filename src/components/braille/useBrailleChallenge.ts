/**
 * ════════════════════════════════════════════════════════════════════════════
 * DER STAND DER BRAILLE-CHALLENGE - aus Sicht EINES Kindes (Zubau 22.09.2026).
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Reine Verdrahtung: Zustände, Fristen und die Wertung kommen unverändert
 * aus `lib/braille/challenge.ts`/`wertung.ts`, die Server-Funktionen aus
 * `lib/braille/backend.ts`. Vorbild ist `lib/typing/useSchreibprobe.ts`
 * (Tastenflow) - Ablauf und Namen folgen dort, wo Braille nichts anderes
 * braucht.
 *
 * ⚠️ Dieser Haken liegt bewusst unter `src/components/braille/` und NICHT
 * unter `src/lib/braille/` - dort endet die Dateihoheit dieses Zubaus (siehe
 * Bericht des bauenden Agenten). Reine Logik ohne React wäre in `lib/`
 * richtiger aufgehoben; das ist eine Abweichung vom Vorbild, die allein aus
 * der Revier-Grenze folgt.
 *
 * ── Begonnen/abgemeldet überlebt ein Neuladen, die Zahlen des Laufs nicht ──
 * `beginnMs` (wann diese Prüfungszeit zu laufen begann) und `abgemeldet`
 * ("ich schreibe nicht mit") werden GERÄTEWEISE gemerkt (localStorage) -
 * ein Neuladen mitten in der Prüfung darf die Uhr nicht neu starten. Die
 * ANGESAMMELTEN Zellen/Zeichen eines laufenden Versuchs dagegen leben nur im
 * Bildschirm-Speicher von `BrailleChallengeLauf` - ein Neuladen mitten drin
 * verliert sie (bewusste Vereinfachung gegenüber dem Tastenflow-Vorbild,
 * siehe Bericht). Die Uhr bleibt davon unberührt, ein Kind bekommt also
 * keine Zusatzzeit geschenkt.
 *
 * ── Die Abgabe selbst ist serverseitig einmalig ─────────────────────────────
 * `meldeChallengeErgebnis` weist eine zweite Abgabe ab (eindeutiger
 * Schlüssel `probeId::pupilUid`, siehe `challenge.ts`/`account.ts`) - dieser
 * Haken ist nur die ERSTE, freundliche Hürde.
 */
import { useEffect, useState } from "react";
import { brailleBackend } from "@/lib/braille/backend";
import {
  CHALLENGE_LEERER_STAND,
  challengeEinstiegBisMs,
  challengePhaseVon,
  challengeRestMs,
  type ChallengeErgebnis,
  type ChallengeKindStand,
  type ChallengePhase,
  type ChallengePlan,
} from "@/lib/braille/challenge";
import type { LaufErgebnis } from "@/lib/braille/wertung";
import type { BrailleAccount, BrailleClassSettings } from "@/lib/braille/account";

function standSchluessel(probeId: string, pupilUid: string): string {
  return `punktgenau:challenge:${probeId}:${pupilUid}`;
}

function leseGeraeteStand(
  probeId: string,
  pupilUid: string,
): { beginnMs: number; abgemeldet: boolean } {
  try {
    const roh = localStorage.getItem(standSchluessel(probeId, pupilUid));
    if (!roh) return { beginnMs: 0, abgemeldet: false };
    const p = JSON.parse(roh) as { beginnMs?: number; abgemeldet?: boolean };
    return {
      beginnMs: typeof p.beginnMs === "number" ? p.beginnMs : 0,
      abgemeldet: p.abgemeldet === true,
    };
  } catch {
    return { beginnMs: 0, abgemeldet: false };
  }
}

function schreibeGeraeteStand(
  probeId: string,
  pupilUid: string,
  stand: { beginnMs: number; abgemeldet: boolean },
): void {
  try {
    localStorage.setItem(standSchluessel(probeId, pupilUid), JSON.stringify(stand));
  } catch {
    /* localStorage nicht verfügbar - der Lauf funktioniert trotzdem, nur ohne Neuladen-Schutz */
  }
}

export interface BrailleChallengeStand {
  /** Der Plan der Klasse, oder `null` (der Normalfall). */
  plan: ChallengePlan | null;
  /** Wo DIESES Kind gerade steht. */
  phase: ChallengePhase;
  stand: ChallengeKindStand;
  /**
   * ★★★ Soll die Challenge JETZT den ganzen Bildschirm übernehmen? Vorrang
   * vor allem anderen (Klassenmatch, eigene Übung, gewöhnliches Üben) -
   * siehe Bericht zur Reihenfolge.
   */
  dran: boolean;
  /** Ist die Abgabe-Abfrage für den aktuellen Plan schon durch? */
  geladen: boolean;
  jetztMs: number;
  /** Verbleibende Prüfungszeit (ms, nie negativ). */
  restMs: number;
  /** Ende des Einstiegsfensters (ms). */
  einstiegBisMs: number;
  /** Den ersten Anschlag vermerken - ruft der Lauf, nicht die Seite. */
  beginne: () => void;
  /** "Ich schreibe nicht mit" - dieses Kind übt normal weiter. */
  melde: () => void;
  /** Das fertige Ergebnis abgeben. */
  gibAb: (lauf: LaufErgebnis) => Promise<void>;
  /** Das eigene Ergebnis, sobald bekannt (aus dem Server ODER frisch abgegeben). */
  ergebnis: ChallengeErgebnis | null;
  /** "Weiter üben" nach dem Abgeben - die Auswertung ist gelesen. */
  schliesseErgebnis: () => void;
}

export function useBrailleChallenge(
  account: BrailleAccount | null | undefined,
  classSettings: BrailleClassSettings | null | undefined,
): BrailleChallengeStand {
  const pupilUid = account?.id ?? "";
  const plan: ChallengePlan | null = classSettings?.punktgenau?.challenge ?? null;
  const planId = plan?.id ?? "";

  const [jetztMs, setJetztMs] = useState(() => Date.now());
  const [geladen, setGeladen] = useState(false);
  const [standLocal, setStandLocal] = useState<ChallengeKindStand>(CHALLENGE_LEERER_STAND);
  const [ergebnis, setErgebnis] = useState<ChallengeErgebnis | null>(null);
  const [geschlossen, setGeschlossen] = useState(false);

  // Die Uhr - nur wenn überhaupt eine Challenge geplant ist (kein Takt, der
  // immer läuft, wenn er nirgends gebraucht wird).
  useEffect(() => {
    if (!plan) return;
    const t = window.setInterval(() => setJetztMs(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, [plan]);

  // Bei jedem neuen Plan (neue Runde, oder Ende der vorigen): den Abgabe-
  // Stand prüfen und den Geräte-Stand (Beginn/Abmeldung) lesen.
  useEffect(() => {
    setGeschlossen(false);
    setErgebnis(null);
    if (!plan || !pupilUid) {
      setStandLocal(CHALLENGE_LEERER_STAND);
      setGeladen(true);
      return;
    }
    setGeladen(false);
    const geraet = leseGeraeteStand(planId, pupilUid);
    let lebt = true;
    void brailleBackend()
      .holeChallengeErgebnis(pupilUid, planId)
      .then((e) => {
        if (!lebt) return;
        setErgebnis(e);
        setStandLocal({
          beginnMs: geraet.beginnMs,
          abgegeben: e !== null,
          abgemeldet: geraet.abgemeldet,
        });
        setGeladen(true);
      })
      .catch(() => {
        if (!lebt) return;
        setStandLocal({
          beginnMs: geraet.beginnMs,
          abgegeben: false,
          abgemeldet: geraet.abgemeldet,
        });
        setGeladen(true);
      });
    return () => {
      lebt = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planId, pupilUid]);

  const phase = challengePhaseVon(plan, standLocal, jetztMs);
  const restMs = plan ? challengeRestMs(plan, standLocal, jetztMs) : 0;
  const einstiegBisMs = plan ? challengeEinstiegBisMs(plan) : 0;

  const beginne = () => {
    if (!plan || standLocal.beginnMs > 0) return;
    const beginnMs = Date.now();
    setStandLocal((s) => ({ ...s, beginnMs }));
    schreibeGeraeteStand(planId, pupilUid, { beginnMs, abgemeldet: standLocal.abgemeldet });
  };

  const melde = () => {
    if (!plan) return;
    setStandLocal((s) => ({ ...s, abgemeldet: true }));
    schreibeGeraeteStand(planId, pupilUid, {
      beginnMs: standLocal.beginnMs,
      abgemeldet: true,
    });
  };

  const gibAb = async (lauf: LaufErgebnis): Promise<void> => {
    if (!plan || !account || standLocal.abgegeben) return;
    const eintrag: ChallengeErgebnis = {
      probeId: plan.id,
      pupilUid: account.id,
      // ⚠️ Die Lehrkraft-Kennung kennt dieser Haken nicht - der Plan trägt
      // sie nicht, und Punktgenau.tsx bekommt bisher nur `classSettings`
      // (nicht die `BrailleClass` mit `teacherId`). Siehe Bericht.
      teacherUid: "",
      classCode: account.classCode ?? "",
      arbeitsweise: plan.arbeitsweise,
      bereich: plan.bereich,
      lauf,
      eingereichtMs: Date.now(),
    };
    const r = await brailleBackend().meldeChallengeErgebnis(eintrag);
    if (r.ok) {
      setErgebnis(eintrag);
      setStandLocal((s) => ({ ...s, abgegeben: true }));
    }
  };

  const schliesseErgebnis = () => setGeschlossen(true);

  const dran =
    !!plan &&
    geladen &&
    (phase === "offen" || phase === "laeuft" || (phase === "abgegeben" && !geschlossen));

  return {
    plan,
    phase,
    stand: standLocal,
    dran,
    geladen,
    jetztMs,
    restMs,
    einstiegBisMs,
    beginne,
    melde,
    gibAb,
    ergebnis,
    schliesseErgebnis,
  };
}
