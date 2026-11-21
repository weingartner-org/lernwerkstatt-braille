/**
 * Der Fortschritt als Hook - laden, mitzählen, speichern.
 *
 * ★ Am Ende jedes Laufs wird geschrieben - und zwischendurch gebremst, etwa
 * alle zwei Sekunden. Zwölf einzelne Schreibvorgänge wären zwölfmal Wartezeit
 * im schlechten Netz; gar nichts dazwischen zu schreiben kostet einem Kind,
 * das mitten im Lauf aufhört, die ganze Arbeit. Gemessen am 22.09.2026: genau
 * das passierte beim Knopf „Übung beenden".
 */
import { useCallback, useEffect, useRef, useState } from "react";
import {
  leererZaehlstand, meldung, neueAbzeichen, verdient, zaehleWoche, type Zaehlstand,
} from "@/lib/plus/abzeichen";
import type { Aufgabe } from "@/lib/plus/aufgabe";
import { nachAntwort, nachLauf, tagesnummer } from "@/lib/plus/coach";
import { heileBeschluss, wendeBeschluesseAn } from "@/lib/plus/beschluss";
import { nachAntwort as nachAntwortFehler } from "@/lib/plus/fehler";
import {
  aktuellesKonto, leererFortschritt, plusBackend, zaehleAntwortFuerLehrkraft, type PlusFortschritt,
} from "@/lib/plus/fortschritt";

export interface AntwortLage {
  paketId: string;
  richtig: boolean;
  /** Die richtige Lösung - für die geheimen Abzeichen. */
  loesung?: string;
  /** Womit geschrieben wurde: Zahlen, Computerbraille, Mathematikschrift. */
  eingabeart?: string;
  /** Die ganze Aufgabe und die Eingabe - für die Fehlererkennung. */
  aufgabe?: Aufgabe;
  eingabe?: string;
}

/**
 * Besonderheiten, die ein geheimes Abzeichen auslösen. Sie hängen am
 * ERGEBNIS, nie an Zeit oder Tempo.
 */
function mitBesonderheit(schon: readonly string[], loesung: string): string[] {
  const ziffern = loesung.replace(/[^0-9]/g, "");
  const dazu: string[] = [];
  if (ziffern.length >= 2 && ziffern === [...ziffern].reverse().join("")) dazu.push("palindrom");
  if (ziffern.length >= 2 && new Set(ziffern).size === 1) dazu.push("gleiche_ziffern");
  const neu = dazu.filter((d) => !schon.includes(d));
  return neu.length ? [...schon, ...neu] : [...schon];
}

/** Was die Abzeichen zählen - aus dem Fortschritt abgelesen, nicht doppelt geführt. */
export function zaehlstand(f: PlusFortschritt): Zaehlstand {
  const tage = [...f.tage].sort((a, b) => a - b);
  return {
    ...leererZaehlstand(),
    gerechnet: f.gerechnet,
    laeufeOhneFehler: f.laeufeOhneFehler,
    verschiedene: Object.keys(f.stand.pakete).length,
    tage: tage.length,
    braille: f.braille,
    stufen: f.stufen.length,
    besondere: f.besondere,
    pauseTage: tage.length >= 2 ? tage[tage.length - 1] - tage[tage.length - 2] : 0,
    raetsel: f.raetselGeloest,
  };
}

export function usePlusFortschritt() {
  const [fortschritt, setFortschritt] = useState<PlusFortschritt>(leererFortschritt);
  const [geladen, setGeladen] = useState(false);
  const [neue, setNeue] = useState<string[]>([]);
  const konto = useRef(aktuellesKonto());
  const neueste = useRef<PlusFortschritt | null>(null);
  const bremse = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** Sofort schreiben - beim Ende eines Laufs und beim Verlassen. */
  const sichere = useCallback((f?: PlusFortschritt) => {
    if (bremse.current) { clearTimeout(bremse.current); bremse.current = null; }
    const stand = f ?? neueste.current;
    if (stand) void plusBackend().schreib(konto.current, stand);
  }, []);

  /** Gebremst schreiben - während gerechnet wird. */
  const spaeter = useCallback((f: PlusFortschritt) => {
    neueste.current = f;
    if (bremse.current) return;
    bremse.current = setTimeout(() => { bremse.current = null; sichere(); }, 2000);
  }, [sichere]);

  // Beim Verlassen der Seite nicht mitten im Zählen stehen bleiben.
  useEffect(() => () => sichere(), [sichere]);

  useEffect(() => {
    let lebt = true;
    plusBackend().lies(konto.current).then((f) => {
      if (!lebt) return;
      // ★ Nachtragen, was der Stand längst verdient hat. Sonst stünde die
      // Sammlung bei null, obwohl 220 Aufgaben gerechnet sind - gemessen am
      // 22.09.2026 im Browser. Die Abzeichen kommen in die Chronik, aber
      // nicht als Blitzmeldung: sie sind nicht in diesem Augenblick entstanden.
      const offen = neueAbzeichen(zaehlstand(f), f.abzeichen);
      const ganz = offen.length
        ? {
            ...f,
            abzeichen: [...f.abzeichen, ...offen],
            chronik: [...f.chronik, ...offen.map((id) => ({ tag: tagesnummer(), text: meldung(id) }))].slice(-30),
          }
        : f;
      setFortschritt(ganz);
      setGeladen(true);
      if (offen.length) void plusBackend().schreib(konto.current, ganz);
    });
    return () => { lebt = false; };
  }, []);

  const merkeAntwort = useCallback((lage: AntwortLage) => {
    const { paketId, richtig, loesung = "", eingabeart = "normal", aufgabe, eingabe = "" } = lage;
    const tag = tagesnummer();
    setFortschritt((f) => {
      const stufe = Number(paketId.split("-")[0]);
      const neu: PlusFortschritt = {
        ...f,
        stand: nachAntwort(f.stand, { paketId, richtig, tag }),
        gerechnet: f.gerechnet + 1,
        richtige: f.richtige + (richtig ? 1 : 0),
        tage: f.tage.includes(tag) ? f.tage : [...f.tage, tag],
        stufen: Number.isFinite(stufe) && !f.stufen.includes(stufe) ? [...f.stufen, stufe] : f.stufen,
        braille: eingabeart !== "normal" && !f.braille.includes(eingabeart)
          ? [...f.braille, eingabeart] : f.braille,
        besondere: richtig ? mitBesonderheit(f.besondere, loesung) : f.besondere,
        wochenziel: zaehleWoche(f.wochenziel),
        ...zaehleAntwortFuerLehrkraft(f, tag, paketId, aufgabe?.op, richtig),
        // Jede Antwort zählt für die Fehlererkennung - auch die richtige.
        // Sie ist die Gegenprobe, ohne die jede Vermutung ewig lebte.
        vermutungen: aufgabe
          ? nachAntwortFehler(f.vermutungen, aufgabe, eingabe, richtig, tag)
          : f.vermutungen,
      };
      spaeter(neu);
      return neu;
    });
  }, [spaeter]);

  const merkeLauf = useCallback((paketId: string, richtige: number, gesamt: number) => {
    const tag = tagesnummer();
    setFortschritt((f) => {
      const ohneFehler = gesamt > 0 && richtige === gesamt;
      const zwischen: PlusFortschritt = {
        ...f,
        stand: nachLauf(f.stand, paketId, richtige, gesamt, tag),
        laeufeOhneFehler: f.laeufeOhneFehler + (ohneFehler ? 1 : 0),
        // ★ Jeder fertige Lauf ist eine Runde - nach jeder dritten kommt ein
        // Rätsel. Abgebrochene Läufe kommen hier nie an.
        runden: f.runden + 1,
        // ★ Ich gegen früher: der erste Lauf bleibt, der letzte wird ersetzt.
        verlauf: gesamt > 0
          ? {
              ...f.verlauf,
              [paketId]: {
                erst: f.verlauf[paketId]?.erst ?? { tag, richtige, gesamt },
                jetzt: { tag, richtige, gesamt },
              },
            }
          : f.verlauf,
      };
      const frisch = neueAbzeichen(zaehlstand(zwischen), zwischen.abzeichen);
      const neu: PlusFortschritt = frisch.length
        ? {
            ...zwischen,
            abzeichen: [...zwischen.abzeichen, ...frisch],
            // Die Chronik hält die letzten dreißig Meldungen - mehr braucht
            // niemand, weniger verliert zu schnell.
            chronik: [...zwischen.chronik, ...frisch.map((id) => ({ tag, text: meldung(id) }))].slice(-30),
          }
        : zwischen;
      if (frisch.length) setNeue((v) => [...v, ...frisch]);
      sichere(neu);
      return neu;
    });
  }, [sichere]);

  const merkeStufe = useCallback((stufe: number | null) => {
    setFortschritt((f) => {
      const neu = { ...f, stufe };
      sichere(neu);
      return neu;
    });
  }, []);

  /**
   * Die Beschlüsse der Lehrkraft übernehmen (23.09.2026) - roh aus dem Konto,
   * geprüft in `lib/plus/beschluss.ts`. Jeder wirkt genau einmal; was schon
   * übernommen ist, bleibt unberührt. Gibt zurück, wie viele neu waren.
   *
   * ⚠️ Erst NACH dem Laden: Vorher läge der Beschluss auf einem leeren Stand,
   * und das Laden schriebe ihn gleich danach wieder zu.
   */
  const uebernimmBeschluss = useCallback((roh: unknown): number => {
    if (!geladen) return 0;
    let neu = 0;
    setFortschritt((f) => {
      const r = wendeBeschluesseAn(f.stand, f.beschlussAngewandt, heileBeschluss(roh));
      neu = r.neu;
      if (r.neu === 0) return f;
      const aus = { ...f, stand: r.stand, beschlussAngewandt: r.angewandt };
      sichere(aus);
      return aus;
    });
    return neu;
  }, [geladen, sichere]);

  /**
   * Ein Rätsel ist vorbei - gelöst, aufgelöst oder übersprungen. Nur das
   * Gelöste zählt und kommt auf die Liste, die Wiederholungen verhindert.
   * ★ Übersprungen ist kein Makel und wird nirgends gezählt.
   */
  const merkeRaetsel = useCallback((angabe: string, geloest: boolean) => {
    if (!geloest) return;
    const tag = tagesnummer();
    setFortschritt((f) => {
      const zwischen = {
        ...f,
        raetselGeloest: f.raetselGeloest + 1,
        raetsel: [...f.raetsel.filter((r) => r !== angabe), angabe].slice(-60),
      };
      // ★ „Knobelei gelöst" kommt sofort, nicht erst mit der nächsten Runde.
      const frisch = neueAbzeichen(zaehlstand(zwischen), zwischen.abzeichen);
      const neu: PlusFortschritt = frisch.length
        ? {
            ...zwischen,
            abzeichen: [...zwischen.abzeichen, ...frisch],
            chronik: [...zwischen.chronik, ...frisch.map((id) => ({ tag, text: meldung(id) }))].slice(-30),
          }
        : zwischen;
      if (frisch.length) setNeue((v) => [...v, ...frisch]);
      sichere(neu);
      return neu;
    });
  }, [sichere]);

  /**
   * Eine Aufgabe, die nach einem Fehler oder mit dem Rechenweg gelöst wurde.
   * Es wird nur die Besonderheit gemerkt; das Abzeichen kommt am Ende der
   * Runde wie alle anderen. ★ Nie ein Zähler der Fehler, nur „kam vor".
   */
  const merkeBesonderes = useCallback((art: "durchgehalten" | "hilfe") => {
    setFortschritt((f) => {
      if (f.besondere.includes(art)) return f;
      const neu = { ...f, besondere: [...f.besondere, art] };
      spaeter(neu);
      return neu;
    });
  }, [spaeter]);

  /** Die Übung für alle ist fertig gerechnet - einmal gemerkt, nie zurückgenommen. */
  const merkeFuerAlleFertig = useCallback((id: string) => {
    setFortschritt((f) => {
      if (f.fuerAlleFertig.includes(id)) return f;
      const neu = { ...f, fuerAlleFertig: [...f.fuerAlleFertig, id].slice(-20) };
      sichere(neu);
      return neu;
    });
  }, [sichere]);

  const merkeWochenziel = useCallback((ziel: number) => {
    setFortschritt((f) => {
      const neu = { ...f, wochenziel: { ...f.wochenziel, ziel } };
      sichere(neu);
      return neu;
    });
  }, [sichere]);

  return {
    fortschritt, geladen, merkeAntwort, merkeLauf, merkeStufe, merkeWochenziel, merkeRaetsel, merkeBesonderes, merkeFuerAlleFertig, uebernimmBeschluss,
    sichere, neue, quittiere: () => setNeue([]), konto: konto.current,
    // ★ Angezeigt wird, was der Stand HERGIBT - nicht die gespeicherte Liste.
    // Zwei Quellen für dieselbe Frage laufen sonst auseinander, und die
    // Anzeige ist die, der ein Kind glaubt.
    gefunden: verdient(zaehlstand(fortschritt)),
  };
}
