/**
 * ════════════════════════════════════════════════════════════════════════════
 * DER STAND DES BRAILLE-KLASSENMATCHS - aus Sicht EINES Kindes (Zubau 22.09.2026).
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Vorbild `lib/typing/useKlassenmatch.ts` (Tastenflow) - Ablauf und Namen
 * folgen dort, wo Braille nichts anderes braucht. Reine Verdrahtung: die
 * Zustandsmaschine kommt aus `lib/braille/klassenmatch.ts`, die
 * Server-Funktionen aus `lib/braille/backend.ts`.
 *
 * ⚠️ Wie bei {@link useBrailleChallenge}: dieser Haken liegt unter
 * `src/components/braille/`, weil dort die Dateihoheit dieses Zubaus endet
 * (siehe Bericht) - nicht, weil er React bräuchte.
 *
 * ── Vereinfacht gegenüber dem Tastenflow-Vorbild ────────────────────────────
 * Das Vorbild kennt einen ausführlichen "warum ging es nicht los"-Satz
 * (`meldung`) und einen "das ist gerade passiert, bevor die nächste Einladung
 * kam"-Vorsatz (`einladungVorsatz`). Beides ist hier bewusst schmaler
 * gehalten (nur `meldung` für einen fehlgeschlagenen Versuch selbst
 * einzuladen) - der Kern (Zustände, Fristen, Rangliste, "nichts wird
 * gespeichert") ist unverändert aus `klassenmatch.ts` übernommen, siehe
 * Bericht für die Abwägung.
 *
 * ── Ein Match nach einem Neuladen wiederfinden (seit 02.10.2026) ────────────
 * Beim Öffnen werden die Matches der Klasse EINMAL gelesen (`listeMatches`),
 * und bei jedem offenen fremden Match die eigene Stand-Zeile nachgesehen.
 * Steht sie auf `dabei`, und das Match wartet noch (Einladung/Countdown), geht
 * das Kind zurück ins Wartefenster - genau wie ein Gastgeber zu seinem eigenen.
 * ⚠️ LÄUFT das Match schon, wird NICHT zurückgeholt: Der Lauf finge mit null
 * Zellen an und überschriebe den Stand des Kindes. Das Kind ist dann bis zum
 * Ende „gebunden" (keine Einladung, kein zweites Match - {@link matchSperre}).
 *
 * ── Ein Kind, ein Match - und keine Einladung mitten im Spiel (02.10.2026) ──
 * Nachgezogen aus Tastenflow (`lib/typing/useKlassenmatch.ts`, Commit
 * 92cb986d), Johannes: „ja, mach Punktgenau genauso". Bis dahin rechnete
 * dieser Haken die Einladung OHNE die eigenen Stand-Zeilen
 * (`alleStaende = []`) - ein Kind in einem laufenden Match bekam jede neue
 * Einladung der Klasse geliefert; nur ein Zusatz in `Punktgenau.tsx`
 * (`!meinMatch`) hielt das Fenster zurück, und nach einem Neuladen nicht
 * einmal der. Jetzt gilt: Eine Einladung gibt es nur, wenn das Kind FREI ist -
 * kein eigenes Match, oder es sitzt vor der Platzierungsliste eines VORBEI-en
 * Matches ({@link BrailleKlassenmatchStand.aufRangliste}), und
 * {@link matchSperre} meldet nichts.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { brailleBackend } from "@/lib/braille/backend";
import {
  gebundeneKinder,
  klassenmatchErlaubt,
  matchOffen,
  matchPhaseVon,
  matchSperre,
  nimmtTeil,
  offeneMatches,
  unentschiedenZahl,
  wartetOderSpielt,
  type BrailleMatch,
  type BrailleMatchStand,
  type MatchPhase,
  type MatchStandStatus,
} from "@/lib/braille/klassenmatch";
import type { Arbeitsweise, LaufErgebnis } from "@/lib/braille/wertung";
import type { AreaKey } from "@/lib/braille/areas";
import type { BrailleAccount, BrailleClassSettings } from "@/lib/braille/account";

function leererLauf(arbeitsweise: Arbeitsweise, bereich: AreaKey): LaufErgebnis {
  return { arbeitsweise, bereich, arbeitszeitMs: 0, ansageMs: 0, richtig: 0, falsch: 0 };
}

export interface BrailleKlassenmatchStand {
  /** Darf dieses Kind ein Match ausschreiben oder annehmen? */
  erlaubt: boolean;
  geladen: boolean;
  /**
   * Warum "einladen" oder "Bin dabei" gerade nicht ging - leer, wenn nichts
   * schiefging. ★ Seit 02.10.2026 auch der Satz des SERVERS beim Beitreten
   * („Du bist schon in einem anderen Klassenmatch dabei. …") - nie still
   * verschluckt. `Punktgenau.tsx` zeigt und spricht ihn.
   */
  meldung: string;
  meldungLoeschen: () => void;
  /** Eine offene Einladung von jemand anderem - oder `null`. Nur, wenn dieses Kind frei ist. */
  einladung: BrailleMatch | null;
  /** Das eigene Match (ausgeschrieben oder beigetreten) - oder `null`. */
  meinMatch: BrailleMatch | null;
  phase: MatchPhase;
  binGastgeber: boolean;
  /**
   * Die Stand-Zeilen des eigenen Matches - NUR die, die teilnehmen
   * ({@link nimmtTeil}). Eine `eingeladen`- oder `abgelehnt`-Zeile kommt hier
   * nie an: Rangliste, „3 dabei" und die Platzierungsliste lesen diese Liste.
   */
  staende: BrailleMatchStand[];
  /** "Starten" geht erst, wenn ausser mir jemand WARTET (`dabei`/`schreibt`). */
  kannStarten: boolean;
  /**
   * ★★★ Wie viele Kinder haben die Einladung bekommen und sich noch nicht
   * entschieden? (02.10.2026, nur beim Gastgeber) - Grundlage der Rückfrage
   * „3 Kinder haben sich noch nicht entschieden. Trotzdem starten?".
   */
  unentschieden: number;
  /**
   * Steht dieses Kind gerade vor der Platzierungsliste eines VORBEI-en
   * Matches? Dann ist es frei (02.10.2026): Eine neue Einladung geht über der
   * Liste auf, und „Jetzt nicht" führt dorthin zurück.
   */
  aufRangliste: boolean;
  /**
   * ★★★ „Arne lädt gerade ein. Mitmachen oder selbst einladen?" (02.10.2026) -
   * die fremde Einladung, zu der gerade gefragt wird, sonst `null`.
   */
  rueckfrage: BrailleMatch | null;
  /**
   * Der Schalter „Klassenmatch": Steht eine fremde Einladung offen, wird
   * zuerst gefragt (`rueckfrage`) und `true` zurückgegeben - sonst `false`,
   * und das Fenster „Klassenmatch ausschreiben" darf aufgehen.
   */
  fragen: () => boolean;
  /** „Mitmachen": der offenen Einladung beitreten. */
  rueckfrageMitmachen: () => void;
  /** „Selbst einladen": die Frage schliessen - danach geht das Ausschreiben auf. */
  rueckfrageSelbst: () => void;
  /** Escape: nichts tun, zurück zum Üben. */
  rueckfrageSchliessen: () => void;
  /** Das Einladungsfenster ist auf DIESEM Gerät aufgegangen - die eigene Zeile geht auf `eingeladen`. */
  einladungGezeigt: (matchId: string) => void;
  einladen: (arbeitsweise: Arbeitsweise, bereich: AreaKey) => void;
  beitreten: (matchId: string) => void;
  ablehnen: (matchId: string) => void;
  starten: () => void;
  absagen: () => void;
  standMelden: (lauf: LaufErgebnis, status?: MatchStandStatus) => void;
  fertigMelden: (lauf: LaufErgebnis) => void;
  /** "Weiter üben" nach dem Ergebnis - das Match loslassen. */
  verlassen: () => void;
  /** "Verlassen" mitten im Durchgang - die eigene Zeile geht mit den bisherigen Zahlen auf "fertig". */
  mittendrinVerlassen: (lauf: LaufErgebnis) => void;
  /** "Doch nicht" aus dem Wartefenster. */
  aussteigen: () => void;
}

/** Der jüngere von zwei Ständen derselben Zeile (Realtime und Erst-Lesen können sich überholen). */
function juenger(alt: BrailleMatchStand | undefined, neu: BrailleMatchStand): BrailleMatchStand {
  return alt && alt.updatedMs > neu.updatedMs ? alt : neu;
}

export function useBrailleKlassenmatch(
  account: BrailleAccount | null | undefined,
  classSettings: BrailleClassSettings | null | undefined,
): BrailleKlassenmatchStand {
  const classCode = account?.role === "schueler" ? account.classCode : undefined;
  const accountId = account?.id ?? "";
  const erlaubt =
    !!account && account.role === "schueler" && !!classCode && klassenmatchErlaubt(classSettings?.punktgenau);

  const [geladen, setGeladen] = useState(false);
  const [matches, setMatches] = useState<Record<string, BrailleMatch>>({});
  const [aktuellesMatchId, setAktuellesMatchId] = useState<string | null>(null);
  const [staende, setStaende] = useState<Record<string, BrailleMatchStand>>({});
  const [abgelehnt, setAbgelehnt] = useState<Set<string>>(new Set());
  const [meldung, setMeldung] = useState("");
  const [jetztMs, setJetztMs] = useState(() => Date.now());
  /**
   * ★★★ Die EIGENEN Stand-Zeilen, Match für Match (02.10.2026) - geschrieben
   * von diesem Gerät, oder beim Öffnen am Server nachgesehen. Daraus rechnet
   * {@link matchSperre}, ob dieses Kind schon in einem Match steckt.
   */
  const [eigeneZeilen, setEigeneZeilen] = useState<Record<string, MatchStandStatus>>({});
  /**
   * Ist das Erst-Lesen (Matches + eigene Zeilen) durch? Bis dahin geht kein
   * Einladungsfenster auf - es könnte ein `dabei` mit `eingeladen`
   * überschreiben, und ein Fenster, das auf- und gleich wieder zugeht, ist
   * auf der Braillezeile zwei Blitzmeldungen.
   */
  const [erstGelesen, setErstGelesen] = useState(false);
  /** Matches, die dieses Gerät losgelassen hat - sie holen das Kind nie von selbst zurück. */
  const losgelassen = useRef(new Set<string>());
  const [rueckfrageId, setRueckfrageId] = useState<string | null>(null);

  const aktuellesRef = useRef(aktuellesMatchId);
  aktuellesRef.current = aktuellesMatchId;

  // Die Uhr - nur, wenn Klassenmatches überhaupt erlaubt sind.
  useEffect(() => {
    if (!erlaubt) return;
    const t = window.setInterval(() => setJetztMs(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, [erlaubt]);

  const merkeEigene = useCallback((matchId: string, status: MatchStandStatus) => {
    setEigeneZeilen((alt) => (alt[matchId] === status ? alt : { ...alt, [matchId]: status }));
  }, []);

  // Die Matches der Klasse beobachten (Realtime) - und EINMAL lesen.
  useEffect(() => {
    if (!erlaubt || !classCode) {
      setGeladen(true);
      return;
    }
    setGeladen(false);
    setErstGelesen(false);
    let aus = false;
    const weg = brailleBackend().beobachteMatches(classCode, (m) => {
      setMatches((alt) => ({ ...alt, [m.id]: m }));
      setGeladen(true);
    });
    /*
      ★★★ ERST-LESEN (02.10.2026): Die Beobachtung am Server meldet nur
      ÄNDERUNGEN - ein Match, das schon vor dem Öffnen der Seite bestand,
      kannte dieser Haken bis zur nächsten Änderung nicht. Für jedes offene
      fremde Match wird dazu die EIGENE Zeile nachgesehen (nach einem
      Neuladen weiss das Gerät sonst nicht, wo das Kind schon dabei ist oder
      abgesagt hat). Bis beides da ist, geht kein Einladungsfenster auf
      (`erstGelesen`).
    */
    void brailleBackend()
      .listeMatches(classCode)
      .then(async (liste) => {
        if (aus) return;
        setMatches((alt) => {
          const neu = { ...alt };
          for (const m of liste) if (!neu[m.id]) neu[m.id] = m;
          return neu;
        });
        setGeladen(true);
        const jetzt = Date.now();
        const fremdOffen = liste.filter((m) => m.hostUid !== accountId && matchOffen(m, jetzt));
        await Promise.all(
          fremdOffen.map(async (m) => {
            try {
              const zeilen = await brailleBackend().listeMatchStaende(m.id, m.arbeitsweise, m.bereich);
              const eigene = zeilen.find((z) => z.pupilUid === accountId);
              if (eigene && !aus) merkeEigene(m.id, eigene.status);
            } catch {
              // Nicht lesbar: dann eben nicht bekannt - der Server bleibt das Netz.
            }
          }),
        );
      })
      .catch(() => {
        // Kein Netz: die Beobachtung bleibt.
      })
      .finally(() => {
        if (!aus) setErstGelesen(true);
      });
    return () => {
      aus = true;
      weg();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [erlaubt, classCode]);

  /*
    ★★★ ZURÜCK INS EIGENE MATCH (auch nach einem Neuladen): als Gastgeber zu
    seinem eigenen, als Kind mit einer Zeile auf `dabei` zu dem, dem es
    beigetreten ist - aber NUR, solange es noch wartet (Einladung/Countdown,
    siehe Dateikopf). ⚠️ Nie zu einem Match, das dieses Gerät losgelassen hat
    („Absagen", „Verlassen", „Weiter üben") - bis 02.10.2026 holte genau diese
    Stelle einen Gastgeber nach „Verlassen" sofort in sein laufendes Match
    zurück.
  */
  useEffect(() => {
    if (aktuellesMatchId || !account) return;
    const jetzt = Date.now();
    const meins = Object.values(matches).find((m) => {
      if (losgelassen.current.has(m.id)) return false;
      const p = matchPhaseVon(m, jetzt);
      if (p !== "einladung" && p !== "countdown") return false;
      const eigene = eigeneZeilen[m.id];
      if (eigene === "fertig" || eigene === "abgelehnt") return false;
      return m.hostUid === account.id || eigene === "dabei" || eigene === "schreibt";
    });
    if (meins) setAktuellesMatchId(meins.id);
  }, [matches, account, aktuellesMatchId, eigeneZeilen]);

  const meinMatch = aktuellesMatchId ? matches[aktuellesMatchId] ?? null : null;
  const meinMatchId = meinMatch?.id ?? null;
  const meinArbeitsweise = meinMatch?.arbeitsweise;
  const meinBereich = meinMatch?.bereich;

  // Die Stände DIESES Matches beobachten (Realtime) - und einmal lesen, damit
  // auch wer schon vorher dabei war, gleich im Wartefenster steht.
  useEffect(() => {
    setStaende({});
    if (!meinMatchId || !meinArbeitsweise || !meinBereich) return;
    let aus = false;
    const nimm = (s: BrailleMatchStand) => {
      if (aus || s.matchId !== meinMatchId) return;
      setStaende((alt) => ({ ...alt, [s.pupilUid]: juenger(alt[s.pupilUid], s) }));
    };
    const weg = brailleBackend().beobachteMatchStaende(meinMatchId, meinArbeitsweise, meinBereich, nimm);
    void brailleBackend()
      .listeMatchStaende(meinMatchId, meinArbeitsweise, meinBereich)
      .then((liste) => liste.forEach(nimm))
      .catch(() => {});
    return () => {
      aus = true;
      weg();
    };
  }, [meinMatchId, meinArbeitsweise, meinBereich]);

  /*
    ★★★ ZWEI LISTEN (02.10.2026): `alleZeilen` trägt auch die Zeilen auf
    `eingeladen`/`abgelehnt` - nur für die Zahl der Unentschiedenen. ALLES
    andere (Rangliste, „3 dabei", Starten) liest `staendeListe`, und dort steht
    nur, wer teilnimmt ({@link nimmtTeil}).
  */
  const alleZeilen = useMemo(
    () => Object.values(staende).filter((s) => s.matchId === meinMatchId),
    [staende, meinMatchId],
  );
  const staendeListe = useMemo(() => alleZeilen.filter(nimmtTeil), [alleZeilen]);

  const phase = matchPhaseVon(meinMatch, jetztMs);
  const binGastgeber = !!meinMatch && !!account && meinMatch.hostUid === account.id;

  /*
    ★★★★★ AUF DER RANGLISTE IST EIN KIND FREI (02.10.2026, Johannes: *„Ist das
    Match vorbei, ist das Kind frei, auch wenn die Rangliste noch steht."*).
    „Vorbei" heisst: die eigene letzte Zeile ist geschrieben (`fertig`) - oder
    das Ende liegt schon drei Sekunden zurück. Die Uhr allein reicht nicht: In
    der Sekunde nach dem Ende schreibt der Lauf noch seine letzte Zeile, und
    ein „Bin dabei" genau dann hängte ihn aus, bevor sie beim Server ist.
  */
  const eigeneZeileFertig =
    eigeneZeilen[meinMatchId ?? ""] === "fertig" ||
    staendeListe.some((s) => s.pupilUid === accountId && s.status === "fertig");
  const aufRangliste =
    !!aktuellesMatchId &&
    !!meinMatch &&
    phase === "fertig" &&
    (eigeneZeileFertig || jetztMs >= (meinMatch.endeMs || 0) + 3_000);

  /** Die eigenen Zeilen als Stand-Zeilen - für {@link matchSperre}. */
  const eigeneStaende = useMemo(
    () => Object.entries(eigeneZeilen).map(([matchId, status]) => ({ matchId, pupilUid: accountId, status })),
    [eigeneZeilen, accountId],
  );
  /** Steckt dieses Kind (laut Gerät) schon in einem ANDEREN offenen Match? Leer heisst nein. */
  const sperreSatz = account
    ? matchSperre(account.id, Object.values(matches), eigeneStaende, jetztMs, aktuellesMatchId ?? "")
    : "";
  /** Frei für eine neue Einladung oder ein eigenes Match. */
  const frei = (!aktuellesMatchId || aufRangliste) && !sperreSatz;
  const freiRef = useRef(frei);
  freiRef.current = frei;

  // Die älteste offene Einladung, von der ich nicht ausgeschlossen bin - NUR, wenn ich frei bin.
  const einladung = useMemo<BrailleMatch | null>(() => {
    if (!erlaubt || !account || !frei || !erstGelesen) return null;
    const alleMatches = Object.values(matches);
    const gebunden = gebundeneKinder(alleMatches, eigeneStaende, jetztMs);
    if (gebunden.has(account.id)) return null;
    const offene = offeneMatches(alleMatches, jetztMs).filter(
      (m) =>
        m.status === "einladung" &&
        m.hostUid !== account.id &&
        m.id !== aktuellesMatchId &&
        !abgelehnt.has(m.id) &&
        eigeneZeilen[m.id] !== "abgelehnt" &&
        eigeneZeilen[m.id] !== "fertig",
    );
    return offene[offene.length - 1] ?? null;
  }, [erlaubt, account, frei, erstGelesen, matches, eigeneStaende, jetztMs, aktuellesMatchId, abgelehnt, eigeneZeilen]);

  // "Starten" geht ab EINEM weiteren Kind, das WARTET - `eingeladen`,
  // `abgelehnt` und „Doch nicht" (`fertig`) zählen nicht.
  const kannStarten = binGastgeber && staendeListe.some((s) => s.pupilUid !== accountId && wartetOderSpielt(s));
  const unentschieden = binGastgeber ? unentschiedenZahl(alleZeilen, accountId) : 0;

  const meldungLoeschen = () => setMeldung("");

  /*
    ★★★ DIE MELDUNGEN GEHEN NACHEINANDER RAUS (02.10.2026, Muster
    `useKlassenmatch`): `eingeladen`, `dabei` und `abgelehnt` schreiben
    dieselbe Zeile. Drückt ein Kind „Bin dabei", während das `eingeladen` noch
    unterwegs ist, könnten sich beide am Server überholen - und die Zeile
    stünde wieder auf `eingeladen`, obwohl das Kind im Wartefenster sitzt.
  */
  const kette = useRef<Promise<unknown>>(Promise.resolve());
  const nacheinander = useCallback(<T,>(tun: () => Promise<T>): Promise<T> => {
    const p = kette.current.then(tun, tun);
    kette.current = p.catch(() => {});
    return p;
  }, []);

  /** Bei welchen Matches hat dieses Gerät schon `eingeladen` oder eine Entscheidung gemeldet? */
  const gemeldet = useRef(new Set<string>());

  /** Die offenen fremden Einladungen, älteste zuerst (um sie sammelt sich die Klasse). */
  const fremdeEinladungen = useCallback(
    (jetzt: number) =>
      offeneMatches(Object.values(matches), jetzt)
        .filter((m) => m.status === "einladung" && m.hostUid !== accountId)
        .reverse(),
    [matches, accountId],
  );

  const ablehnen = (matchId: string) => {
    setAbgelehnt((s) => new Set(s).add(matchId));
    /*
      ★★★ Die Absage geht seit 02.10.2026 auch an den Server (`abgelehnt`) -
      nur so zählt der Gastgeber dieses Kind nicht mehr zu denen, die noch
      überlegen.
    */
    const match = matches[matchId];
    if (!account || !match) return;
    gemeldet.current.add(matchId);
    merkeEigene(matchId, "abgelehnt");
    void nacheinander(() =>
      brailleBackend().schreibeMatchStand(account, matchId, match.arbeitsweise, match.bereich, {
        status: "abgelehnt",
        lauf: leererLauf(match.arbeitsweise, match.bereich),
      }),
    ).catch(() => {});
  };

  const einladungGezeigt = (matchId: string) => {
    const match = matches[matchId];
    if (!account || !match || gemeldet.current.has(matchId)) return;
    gemeldet.current.add(matchId);
    void nacheinander(() =>
      brailleBackend().schreibeMatchStand(account, matchId, match.arbeitsweise, match.bereich, {
        status: "eingeladen",
        lauf: leererLauf(match.arbeitsweise, match.bereich),
      }),
    ).catch(() => {
      // Nicht gemeldet heisst nur: Der Gastgeber zählt dieses Kind nicht zu
      // denen, die noch überlegen. Er fragt dann eben nicht nach.
    });
  };

  const einladen = (arbeitsweise: Arbeitsweise, bereich: AreaKey) => {
    if (!account || !erlaubt) return;
    setMeldung("");
    if (!freiRef.current) {
      // Ein Kind, ein Match - im Gerät. Der Satz ist derselbe wie am Server.
      if (sperreSatz) setMeldung(sperreSatz);
      return;
    }
    // ★ Wer selbst einlädt, hat sich gegen die offenen fremden Einladungen
    // entschieden - sie gehen als Absage an ihre Gastgeber.
    for (const m of fremdeEinladungen(Date.now())) {
      if (eigeneZeilen[m.id] !== "abgelehnt") ablehnen(m.id);
    }
    brailleBackend()
      .erstelleMatch(account, arbeitsweise, bereich)
      .then((m) => {
        if (!m) return;
        if (aktuellesRef.current) losgelassen.current.add(aktuellesRef.current);
        setMatches((alt) => ({ ...alt, [m.id]: m }));
        setAktuellesMatchId(m.id);
      })
      .catch((e: unknown) => {
        setMeldung(e instanceof Error ? e.message : "Das Klassenmatch liess sich nicht ausschreiben.");
      });
  };

  const beitreten = (matchId: string) => {
    const match = matches[matchId];
    if (!account || !match) return;
    /*
      ★★★★★ EIN KIND, EIN MATCH - im Gerät (02.10.2026). Wer in einem offenen
      Match steckt, tritt keinem zweiten bei. ⚠️ Das Gerät weiss das nicht
      immer sicher - das eigentliche Netz ist der Server (`brStandSperre` in
      `br_match_lib.pb.js`), und sein Satz kommt unten an.
    */
    if (aktuellesRef.current && aktuellesRef.current !== matchId && !aufRangliste) return;
    if (sperreSatz) {
      setMeldung(sperreSatz);
      return;
    }
    setRueckfrageId(null);
    setMeldung("");
    if (aktuellesRef.current && aktuellesRef.current !== matchId) losgelassen.current.add(aktuellesRef.current);
    losgelassen.current.delete(matchId);
    gemeldet.current.add(matchId);
    setAktuellesMatchId(matchId);
    void nacheinander(() =>
      brailleBackend().schreibeMatchStand(
        account,
        matchId,
        match.arbeitsweise,
        match.bereich,
        { status: "dabei", lauf: leererLauf(match.arbeitsweise, match.bereich) },
        { fehlerMelden: true },
      ),
    )
      .then((stand) => {
        if (stand) merkeEigene(matchId, "dabei");
      })
      .catch((err: unknown) => {
        /*
          ★★★★ NIE STILL VERSCHLUCKEN: Hat der Server mit einem eigenen Satz
          abgewiesen („Du bist schon in einem anderen Klassenmatch dabei. …"),
          sässe das Kind sonst in einem Wartefenster, in dem es gar nicht
          steht. Es wird losgelassen, der Satz steht am Bildschirm und wird
          gesprochen (`Punktgenau.tsx`). Ohne Satz (kein Netz) bleibt es wie
          bisher - der nächste Stand schreibt die Zeile.
        */
        const grund = err instanceof Error ? err.message.trim() : "";
        if (!grund || aktuellesRef.current !== matchId) return;
        losgelassen.current.add(matchId);
        setAktuellesMatchId(null);
        setMeldung(grund);
      });
  };

  const rueckfrage = useMemo(() => {
    if (!rueckfrageId || !erlaubt) return null;
    return fremdeEinladungen(jetztMs).find((m) => m.id === rueckfrageId) ?? null;
  }, [rueckfrageId, erlaubt, fremdeEinladungen, jetztMs]);

  const fragen = () => {
    if (!account || !erlaubt) return false;
    /*
      ★★★★ STEHT EINE FREMDE EINLADUNG OFFEN, WIRD ZUERST GEFRAGT (02.10.2026,
      Johannes: *„Arne lädt gerade ein. Mitmachen oder selbst einladen?"*).
      Gefragt wird auch, wenn das Kind diese Einladung schon abgelehnt hat -
      ein ausdrückliches „Klassenmatch" ist eine neue Frage des Kindes.
    */
    const offen = fremdeEinladungen(Date.now())[0];
    if (!offen) return false;
    setRueckfrageId(offen.id);
    return true;
  };
  const rueckfrageMitmachen = () => {
    const id = rueckfrage?.id;
    setRueckfrageId(null);
    if (id) beitreten(id);
  };
  const rueckfrageSelbst = () => setRueckfrageId(null);
  const rueckfrageSchliessen = () => setRueckfrageId(null);

  /** Die Antwort des Servers gleich übernehmen - nicht erst auf die Beobachtung warten. */
  const uebernimm = (m: BrailleMatch | null) => {
    if (m) setMatches((alt) => ({ ...alt, [m.id]: m }));
  };

  const starten = () => {
    if (!meinMatch || !binGastgeber) return;
    void brailleBackend().aktualisiereMatch(meinMatch.id, "countdown").then(uebernimm);
  };

  const loslassen = () => {
    if (aktuellesRef.current) losgelassen.current.add(aktuellesRef.current);
    setAktuellesMatchId(null);
  };

  const absagen = () => {
    if (!meinMatch || !binGastgeber) return;
    void brailleBackend().aktualisiereMatch(meinMatch.id, "abgebrochen").then(uebernimm);
    loslassen();
  };

  const letzterStandRef = useRef(0);
  const standMelden = (lauf: LaufErgebnis, status: MatchStandStatus = "schreibt") => {
    if (!meinMatch || !account) return;
    // Gedrosselt - höchstens alle 800 ms, damit ein schnelles Kind nicht die
    // Klasse mit Schreibzugriffen flutet (Muster `MATCH_TAKT_MS`).
    const jetzt = Date.now();
    if (status === "schreibt" && jetzt - letzterStandRef.current < 800) return;
    letzterStandRef.current = jetzt;
    merkeEigene(meinMatch.id, status);
    void brailleBackend().schreibeMatchStand(account, meinMatch.id, meinMatch.arbeitsweise, meinMatch.bereich, {
      status,
      lauf,
    });
  };

  const fertigMelden = (lauf: LaufErgebnis) => {
    standMelden(lauf, "fertig");
  };

  const mittendrinVerlassen = (lauf: LaufErgebnis) => {
    if (!meinMatch || !account) return;
    merkeEigene(meinMatch.id, "fertig");
    void brailleBackend().schreibeMatchStand(account, meinMatch.id, meinMatch.arbeitsweise, meinMatch.bereich, {
      status: "fertig",
      lauf,
    });
    loslassen();
  };

  const verlassen = () => loslassen();

  const aussteigen = () => {
    if (!meinMatch || !account) return;
    const eigenerStand = staende[account.id];
    merkeEigene(meinMatch.id, "fertig");
    void brailleBackend().schreibeMatchStand(account, meinMatch.id, meinMatch.arbeitsweise, meinMatch.bereich, {
      status: "fertig",
      lauf: eigenerStand?.lauf ?? leererLauf(meinMatch.arbeitsweise, meinMatch.bereich),
    });
    loslassen();
  };

  return {
    erlaubt,
    geladen,
    meldung,
    meldungLoeschen,
    einladung,
    meinMatch,
    phase,
    binGastgeber,
    staende: staendeListe,
    kannStarten,
    unentschieden,
    aufRangliste,
    rueckfrage,
    fragen,
    rueckfrageMitmachen,
    rueckfrageSelbst,
    rueckfrageSchliessen,
    einladungGezeigt,
    einladen,
    beitreten,
    ablehnen,
    starten,
    absagen,
    standMelden,
    fertigMelden,
    verlassen,
    mittendrinVerlassen,
    aussteigen,
  };
}
