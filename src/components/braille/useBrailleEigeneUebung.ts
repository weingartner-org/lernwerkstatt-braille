/**
 * ════════════════════════════════════════════════════════════════════════════
 * DER STAND DER "EIGENEN ÜBUNG" - aus Sicht EINES Kindes (Zubau 22.09.2026).
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Vorbild `lib/typing/useEigeneUebung.ts`. Reine Verdrahtung: die Reihe kommt
 * aus `lib/braille/eigeneUebung.ts`, die Server-Funktionen aus
 * `lib/braille/backend.ts`.
 *
 * ⚠️ Wie bei den anderen beiden Zubauten: dieser Haken liegt unter
 * `src/components/braille/`, weil dort die Dateihoheit endet (siehe Bericht).
 *
 * ── Vereinfacht gegenüber dem Tastenflow-Vorbild ────────────────────────────
 * Kein eigener Realtime-Kanal je Klasse (der Tastenflow-Haken beobachtet die
 * Klasse fortlaufend) - dieser Haken fragt beim Mount UND bei jedem Wechsel
 * der Reihen-Länge einmal neu ab. Auf einem geteilten Klassenrechner kann
 * eine frisch zugewiesene Übung darum bis zu einer Minute brauchen, bis sie
 * ankommt, statt sofort (siehe Bericht).
 */
import { useEffect, useState } from "react";
import { brailleBackend } from "@/lib/braille/backend";
import {
  naechsteOffeneUebung,
  type EigeneUebungEintrag,
  type EigeneUebungFortschritt,
} from "@/lib/braille/eigeneUebung";
import type { BrailleAccount } from "@/lib/braille/account";

const ANGEKUENDIGT_SCHLUESSEL = "punktgenau:eigene-uebung:angekuendigt";

function leseAngekuendigt(): Set<string> {
  try {
    const roh = localStorage.getItem(ANGEKUENDIGT_SCHLUESSEL);
    return roh ? new Set(JSON.parse(roh) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

function schreibeAngekuendigt(menge: Set<string>): void {
  try {
    localStorage.setItem(ANGEKUENDIGT_SCHLUESSEL, JSON.stringify([...menge]));
  } catch {
    /* localStorage nicht verfügbar */
  }
}

export interface BrailleEigeneUebungStand {
  /** Die Übung, an der dieses Kind jetzt arbeitet - `null` = nichts offen. */
  zeiger: EigeneUebungEintrag | null;
  dran: boolean;
  geladen: boolean;
  /** Der Text zu `zeiger` (Zeilen), sobald geladen. */
  text: { dateiname: string; zeilen: string[] } | null;
  angekuendigt: boolean;
  bestaetigeAnkuendigung: () => void;
  /** "Fertig" für `zeiger` festhalten - am Konto, nicht am Gerät. */
  meldeFertig: () => void;
}

export function useBrailleEigeneUebung(
  account: BrailleAccount | null | undefined,
): BrailleEigeneUebungStand {
  const classCode = account?.role === "schueler" ? account.classCode : undefined;
  const [reihe, setReihe] = useState<EigeneUebungEintrag[]>([]);
  const [fortschritt, setFortschritt] = useState<EigeneUebungFortschritt>({});
  const [geladen, setGeladen] = useState(false);
  const [text, setText] = useState<{ dateiname: string; zeilen: string[] } | null>(null);
  const [angekuendigtMenge, setAngekuendigtMenge] = useState<Set<string>>(() => leseAngekuendigt());

  useEffect(() => {
    if (!classCode || !account) {
      setGeladen(true);
      return;
    }
    let lebt = true;
    const backend = brailleBackend();
    void Promise.all([backend.listeEigeneUebungen(classCode), backend.leseEigeneUebungFortschritt(account.id)])
      .then(([r, f]) => {
        if (!lebt) return;
        setReihe(r);
        setFortschritt(f);
        setGeladen(true);
      })
      .catch(() => {
        if (lebt) setGeladen(true);
      });
    return () => {
      lebt = false;
    };
  }, [classCode, account]);

  const zeiger = naechsteOffeneUebung(reihe, fortschritt);

  useEffect(() => {
    if (!zeiger) {
      setText(null);
      return;
    }
    let lebt = true;
    void brailleBackend()
      .leseEigenenText(zeiger.textId)
      .then((t) => {
        if (lebt) setText(t);
      })
      .catch(() => {
        if (lebt) setText(null);
      });
    return () => {
      lebt = false;
    };
  }, [zeiger?.textId]); // eslint-disable-line react-hooks/exhaustive-deps

  const angekuendigt = zeiger ? angekuendigtMenge.has(zeiger.textId) : false;

  const bestaetigeAnkuendigung = () => {
    if (!zeiger) return;
    const neu = new Set(angekuendigtMenge);
    neu.add(zeiger.textId);
    setAngekuendigtMenge(neu);
    schreibeAngekuendigt(neu);
  };

  const meldeFertig = () => {
    if (!zeiger || !account) return;
    void brailleBackend()
      .meldeEigeneUebungFertig(account.id, zeiger.textId)
      .then((ok) => {
        if (!ok) return;
        setFortschritt((f) => ({ ...f, [zeiger.textId]: { fertig: true } }));
      });
  };

  return {
    zeiger,
    // `naechsteOffeneUebung` liefert nur eine Übung, die dieses Kind noch
    // nicht fertig hat - `zeiger !== null` genügt darum.
    dran: geladen && zeiger !== null,
    geladen,
    text,
    angekuendigt,
    bestaetigeAnkuendigung,
    meldeFertig,
  };
}
