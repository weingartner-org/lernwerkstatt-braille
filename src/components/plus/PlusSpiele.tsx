/**
 * Die Rechenspiele von Plus.
 *
 * ★ Jedes Spiel ist gegen die Ausschlussregel geprüft: keine Uhr, keine
 * Rangliste, kein Ziehen mit der Maus, keine Farbe als einzige Auskunft.
 * Alles steht als Text da und lässt sich mit der Tastatur bedienen.
 *
 * Heute zwei von acht: „Zielzahl" und „Heiß und kalt". Die übrigen sechs
 * stehen in der didaktisch-methodischen Struktur, Abschnitt 11.
 */
import { useCallback, useMemo, useRef, useState } from "react";
import { useUeberschriftFokus } from "./fokus";
import { zufall } from "@/lib/plus/aufgabe";
import { PlusEingabe, type Eingabeart } from "./PlusEingabe";
import { sprich } from "@/lib/sprechen/rechnen";
import {
  antwort, halbierungsVersuche, leseVersuch, nachVersuch, neuesHeissKaltSpiel, zaehltAlsVersuch,
  type HeissKalt,
} from "@/lib/plus/spiele/heisskalt";
import {
  gewonnen, nachZug, neuesZielzahlSpiel, pruefeZug, type Zielzahl,
} from "@/lib/plus/spiele/zielzahl";
import {
  SCHWEREN, STOCKWERKE, nachTurmzug, neuerTurm, turmFertig, turmSatz, turmaufgabe,
  type Schwere, type Turmaufgabe,
} from "@/lib/plus/spiele/turmbau";
import { istRichtig } from "@/lib/plus/aufgabe";
import {
  BREITE, alleGefunden, bewege, lage, nachFund, neuesPaareSpiel, offenePaare, passen,
} from "@/lib/plus/spiele/paare";
import {
  SEITE, feldName, grabaufgabe, grabe, nachGrabung, neuesSchatzgitter,
  type Grabaufgabe,
} from "@/lib/plus/spiele/schatzgitter";
import { anteil, lege, neuerStrahl, wertAn } from "@/lib/plus/spiele/zahlenstrahl";
import {
  duellFertig, duellSatz, duellaufgabe, nachDuellzug, neuesDuell, type Duellaufgabe,
} from "@/lib/plus/spiele/zugumzug";
import { PlusStaffel } from "./PlusStaffel";
import type { AntwortLage } from "./usePlusFortschritt";
import { setzeTonStumm, tonFuerStelle, tonIstStumm } from "@/lib/plus/ton";
import { zahl } from "@/lib/plus/aufgabe";

export type SpielName = "zielzahl" | "heisskalt" | "turmbau" | "paare" | "schatz" | "strahl" | "duell" | "staffel";

export const SPIELE: { name: SpielName; titel: string; was: string; uebt: string }[] = [
  {
    name: "zielzahl",
    titel: "Zielzahl",
    was: "Aus fünf Zahlen die Zielzahl bauen.",
    uebt: "Vorrangregeln, Zerlegen, Überschlag",
  },
  {
    name: "heisskalt",
    titel: "Heiß und kalt",
    was: "Eine versteckte Zahl erraten.",
    uebt: "Halbieren, Größenvorstellung",
  },
  {
    name: "turmbau",
    titel: "Turmbau",
    was: "Vor jedem Zug wählen, wie schwer es sein soll.",
    uebt: "Selbsteinschätzung, gemischte Rechenarten",
  },
  {
    name: "paare",
    titel: "Paare finden",
    was: "Vier mal vier Felder: Aufgabe und Ergebnis gehören zusammen.",
    uebt: "Einmaleins, Merken",
  },
  {
    name: "schatz",
    titel: "Schatzgitter",
    was: "Das Ergebnis nennt das Feld: Spalte 3, Zeile 2.",
    uebt: "Koordinaten, Einmaleins",
  },
  {
    name: "strahl",
    titel: "Zahlenstrahl horchen",
    was: "Ein Ton steigt, je weiter rechts die Zahl liegt.",
    uebt: "Dezimalzahlen, Brüche, Runden",
  },
  {
    name: "duell",
    titel: "Zug um Zug",
    was: "Zu zweit an einem Gerät - nacheinander, nicht gleichzeitig.",
    uebt: "gemischtes Rechnen",
  },
  {
    name: "staffel",
    titel: "Die Staffel der Klasse",
    was: "Die ganze Klasse deckt ein verstecktes Wort auf.",
    uebt: "alles, was du schon kannst",
  },
];

export interface PlusSpieleProps {
  stufe: number;
  ansagen?: (satz: string) => void;
  onZurueck: () => void;
  /** Saat für den Zufall - die Tests setzen sie. */
  saat?: number;
  /**
   * ★ Die Eingabeart gilt auch in den Spielen. Ein Kind, das Braille
   * schreibt, muss mitspielen können - sonst sind die Spiele genau das, was
   * die Ausschlussregel verbietet: etwas, das es nicht gleichwertig machen
   * kann. Gemessen am 23.09.2026: die Spiele hatten nackte Textfelder.
   */
  art?: Eingabeart;
  onArt?: (art: Eingabeart) => void;
  /**
   * ★ Nur die Staffel meldet Antworten weiter: Ihre Etappen sind echte
   * Aufgaben aus dem Stoffplan und zählen für Coach, Wochenziel und
   * Abzeichen. Die anderen sieben Spiele rechnen mit eigenen Zahlen und
   * bleiben Spiel.
   */
  onAntwort?: (lage: AntwortLage) => void;
  /** Nur für Tests: feste Kalenderwoche. */
  woche?: string;
}

export function PlusSpiele({ stufe, ansagen, onZurueck, saat, art, onArt, onAntwort, woche }: PlusSpieleProps) {
  const [gewaehlt, setGewaehlt] = useState<SpielName | null>(null);
  const [eigeneArt, setEigeneArt] = useState<Eingabeart>("normal");
  const eingabeart = art ?? eigeneArt;
  const setzeArt = onArt ?? setEigeneArt;
  const ueberschrift = useUeberschriftFokus<HTMLHeadingElement>();

  if (!gewaehlt) {
    return (
      <section className="space-y-3" aria-labelledby="plus-spiele">
        <h2 id="plus-spiele" ref={ueberschrift} tabIndex={-1} className="text-xl font-semibold text-ink">Spiele</h2>
        <ul className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2">
          {SPIELE.map((s) => (
            <li key={s.name}>
              <button
                type="button"
                className="w-full rounded border border-hairline px-4 py-3 text-left text-ink"
                onClick={() => setGewaehlt(s.name)}
              >
                <span className="block font-medium">{s.titel}</span>
                <span className="block text-sm text-ink-muted">{s.was}</span>
                <span className="block text-sm text-ink-muted">Übt: {s.uebt}</span>
              </button>
            </li>
          ))}
        </ul>
        <button type="button" className="rounded border border-hairline px-3 py-2 text-ink" onClick={onZurueck}>
          Zurück
        </button>
      </section>
    );
  }

  const zurueck = () => setGewaehlt(null);
  if (gewaehlt === "zielzahl") return <ZielzahlSpiel stufe={stufe} ansagen={ansagen} saat={saat} onZurueck={zurueck} art={eingabeart} onArt={setzeArt} />;
  if (gewaehlt === "heisskalt") return <HeissKaltSpiel stufe={stufe} ansagen={ansagen} saat={saat} onZurueck={zurueck} art={eingabeart} onArt={setzeArt} />;
  if (gewaehlt === "turmbau") return <TurmbauSpiel stufe={stufe} ansagen={ansagen} saat={saat} onZurueck={zurueck} art={eingabeart} onArt={setzeArt} />;
  if (gewaehlt === "paare") return <PaareSpielAnsicht stufe={stufe} ansagen={ansagen} saat={saat} onZurueck={zurueck} art={eingabeart} onArt={setzeArt} />;
  if (gewaehlt === "schatz") return <SchatzgitterSpiel stufe={stufe} ansagen={ansagen} saat={saat} onZurueck={zurueck} art={eingabeart} onArt={setzeArt} />;
  if (gewaehlt === "strahl") return <ZahlenstrahlSpiel stufe={stufe} ansagen={ansagen} saat={saat} onZurueck={zurueck} art={eingabeart} onArt={setzeArt} />;
  if (gewaehlt === "staffel") {
    return (
      <PlusStaffel
        stufe={stufe}
        ansagen={ansagen}
        onZurueck={zurueck}
        onAntwort={onAntwort}
        art={eingabeart}
        onArt={setzeArt}
        woche={woche}
      />
    );
  }
  return <DuellSpiel stufe={stufe} ansagen={ansagen} saat={saat} onZurueck={zurueck} art={eingabeart} onArt={setzeArt} />;
}

/* ------------------------------------------------------------------ */

function ZielzahlSpiel({ stufe, ansagen, onZurueck, saat, art, onArt }: PlusSpieleProps) {
  const ueberschrift = useUeberschriftFokus<HTMLHeadingElement>();
  const [runde, setRunde] = useState(0);
  const spiel = useMemo<Zielzahl>(
    () => neuesZielzahlSpiel(zufall((saat ?? 1) + runde * 17), stufe),
    [stufe, saat, runde],
  );
  const [offen, setOffen] = useState<number[]>(spiel.zahlen);
  const [zuege, setZuege] = useState<string[]>([]);
  const [meldung, setMeldung] = useState("");
  const [wegGezeigt, setWegGezeigt] = useState(false);
  const [eingabe, setEingabe] = useState("");
  const feld = useRef<HTMLTextAreaElement>(null);

  const fertig = gewonnen(offen, spiel.ziel);

  const neu = useCallback(() => {
    const naechste = runde + 1;
    const frisch = neuesZielzahlSpiel(zufall((saat ?? 1) + naechste * 17), stufe);
    setRunde(naechste);
    setOffen(frisch.zahlen);
    setZuege([]);
    setMeldung("");
    setWegGezeigt(false);
    setEingabe("");
    feld.current?.focus();
  }, [runde, saat, stufe]);

  const zieh = () => {
    const gelesen = pruefeZug(eingabe, offen);
    if ("fehler" in gelesen) {
      setMeldung(gelesen.fehler.satz);
      ansagen?.(gelesen.fehler.satz);
      return;
    }
    const naechste = nachZug(offen, gelesen.zug);
    setOffen(naechste);
    setZuege((z) => [...z, gelesen.zug.zeile]);
    setEingabe("");
    const satz = gewonnen(naechste, spiel.ziel)
      ? `Geschafft! Die ${spiel.ziel} steht da.`
      : `Jetzt liegen da: ${naechste.join(", ")}.`;
    setMeldung(satz);
    ansagen?.(satz);
  };

  return (
    <section className="space-y-4" aria-labelledby="plus-zielzahl">
      <h2 id="plus-zielzahl" ref={ueberschrift} tabIndex={-1} className="text-xl font-semibold text-ink">Zielzahl</h2>
      <p className="text-ink">
        {fertig ? (
          <>Geschafft - die <strong>{spiel.ziel}</strong> steht da.</>
        ) : (
          <>Bau die <strong>{spiel.ziel}</strong>. Du hast: <span className="font-mono">{offen.join(", ")}</span></>
        )}
      </p>
      {!fertig && (
        <p className="text-sm text-ink-muted">
          Ein Zug ist eine Zeile, zum Beispiel <span className="font-mono">3 *4 =12</span>.
          Die beiden Zahlen sind danach weg, das Ergebnis liegt dafür da.
        </p>
      )}

      {zuege.length > 0 && (
        <ol className="m-0 list-none space-y-1 p-0 font-mono text-ink">
          {zuege.map((z, i) => <li key={i}>{z}</li>)}
        </ol>
      )}

      {!fertig && (
        <div className="space-y-2">
          <PlusEingabe
            wert={eingabe} onWert={setEingabe} art={art ?? "normal"} onArt={onArt ?? (() => {})}
            onPruefen={zieh} ansagen={ansagen} feldRef={feld} beschriftung="Dein Zug"
          />
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {!fertig && (
          <button type="button" className="rounded border border-hairline px-3 py-2 text-ink" onClick={zieh}>
            Zug machen
          </button>
        )}
        <button type="button" className="rounded border border-hairline px-3 py-2 text-ink" onClick={neu}>
          Neues Spiel
        </button>
        {!fertig && !wegGezeigt && (
          <button
            type="button"
            className="rounded border border-hairline px-3 py-2 text-ink"
            onClick={() => { setWegGezeigt(true); ansagen?.(spiel.weg.map((z) => sprich(z)).join(". ")); }}
          >
            Ich komme nicht weiter
          </button>
        )}
        <button type="button" className="rounded border border-hairline px-3 py-2 text-ink" onClick={onZurueck}>
          Anderes Spiel
        </button>
      </div>

      {wegGezeigt && (
        <div>
          <h3 className="text-base font-medium text-ink">Ein Weg zum Ziel</h3>
          <ol className="m-0 list-none space-y-1 p-0 font-mono text-ink">
            {spiel.weg.map((z, i) => <li key={i}>{z}</li>)}
          </ol>
        </div>
      )}

      <p role="status" className="min-h-6 text-ink">{meldung}</p>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function HeissKaltSpiel({ stufe, ansagen, onZurueck, saat, art, onArt }: PlusSpieleProps) {
  const ueberschrift = useUeberschriftFokus<HTMLHeadingElement>();
  const [runde, setRunde] = useState(0);
  const [spiel, setSpiel] = useState<HeissKalt>(() => neuesHeissKaltSpiel(zufall((saat ?? 1) + runde), stufe));
  const [meldung, setMeldung] = useState("");
  const [fertig, setFertig] = useState(false);
  const [eingabe, setEingabe] = useState("");
  const feld = useRef<HTMLTextAreaElement>(null);

  const raten = () => {
    // ★ `leseVersuch` statt `Number()`: ein leeres Feld ist kein Versuch „0".
    const versuch = leseVersuch(eingabe);
    const r = antwort(spiel, versuch ?? Number.NaN);
    setMeldung(r.satz);
    ansagen?.(r.satz);
    if (zaehltAlsVersuch(spiel, versuch)) setSpiel((s) => nachVersuch(s, versuch));
    if (r.getroffen) setFertig(true);
    setEingabe("");
  };

  const neu = () => {
    const naechste = runde + 1;
    setRunde(naechste);
    setSpiel(neuesHeissKaltSpiel(zufall((saat ?? 1) + naechste), stufe));
    setMeldung("");
    setFertig(false);
    setEingabe("");
    feld.current?.focus();
  };

  return (
    <section className="space-y-4" aria-labelledby="plus-heisskalt">
      <h2 id="plus-heisskalt" ref={ueberschrift} tabIndex={-1} className="text-xl font-semibold text-ink">Heiß und kalt</h2>
      <p className="text-ink">
        Ich denke an eine Zahl zwischen {spiel.von} und {spiel.bis}.
      </p>
      {spiel.versuche.length > 0 && (
        <p className="text-sm text-ink-muted">
          Deine Versuche: <span className="font-mono">{spiel.versuche.join(", ")}</span>
        </p>
      )}

      {!fertig && (
        <div className="space-y-2">
          <PlusEingabe
            wert={eingabe} onWert={setEingabe} art={art ?? "normal"} onArt={onArt ?? (() => {})}
            onPruefen={raten} ansagen={ansagen} feldRef={feld} beschriftung="Deine Zahl"
          />
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {!fertig && (
          <button type="button" className="rounded border border-hairline px-3 py-2 text-ink" onClick={raten}>
            Raten
          </button>
        )}
        <button type="button" className="rounded border border-hairline px-3 py-2 text-ink" onClick={neu}>
          Neues Spiel
        </button>
        <button type="button" className="rounded border border-hairline px-3 py-2 text-ink" onClick={onZurueck}>
          Anderes Spiel
        </button>
      </div>

      {/* ★ Die Lehre kommt erst NACH dem Raten - vorher wäre sie die Lösung. */}
      {fertig && (
        <p className="text-ink">
          Mit dem Halbieren geht es immer in höchstens {halbierungsVersuche(spiel)} Versuchen.
        </p>
      )}

      <p role="status" className="min-h-6 text-ink">{meldung}</p>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function TurmbauSpiel({ stufe, ansagen, onZurueck, saat, art, onArt }: PlusSpieleProps) {
  const ueberschrift = useUeberschriftFokus<HTMLHeadingElement>();
  const [runde, setRunde] = useState(0);
  const rng = useMemo(() => zufall((saat ?? 1) + runde * 31), [saat, runde]);
  const [turm, setTurm] = useState(() => neuerTurm(10));
  const [aufgabe, setAufgabe] = useState<Turmaufgabe | null>(null);
  const [eingabe, setEingabe] = useState("");
  const [meldung, setMeldung] = useState("");
  const feld = useRef<HTMLTextAreaElement>(null);

  const waehle = (schwere: Schwere) => {
    const a = turmaufgabe(rng, stufe, schwere);
    setAufgabe(a);
    setEingabe("");
    setMeldung("");
    ansagen?.(sprich(a.angabe));
    setTimeout(() => feld.current?.focus(), 0);
  };

  const pruefe = () => {
    if (!aufgabe) return;
    const richtig = istRichtig(eingabe, {
      paket: "turmbau", art: "ergebnis", op: aufgabe.op,
      angabe: aufgabe.angabe, loesung: aufgabe.loesung, zahlen: [],
    });
    const neu = nachTurmzug(turm, aufgabe.schwere, richtig);
    setTurm(neu);
    const satz = richtig
      ? `Richtig. ${STOCKWERKE[aufgabe.schwere]} ${STOCKWERKE[aufgabe.schwere] === 1 ? "Stockwerk" : "Stockwerke"} dazu.`
      : `Noch nicht. Der Turm bleibt, wie er ist.`;
    setMeldung(turmFertig(neu) ? `${satz} ${turmSatz(neu)}` : satz);
    ansagen?.(satz);
    setAufgabe(null);
  };

  const neuesSpiel = () => {
    setRunde((n) => n + 1);
    setTurm(neuerTurm(10));
    setAufgabe(null);
    setEingabe("");
    setMeldung("");
  };

  const fertig = turmFertig(turm);

  return (
    <section className="space-y-4" aria-labelledby="plus-turmbau">
      <h2 id="plus-turmbau" ref={ueberschrift} tabIndex={-1} className="text-xl font-semibold text-ink">Turmbau</h2>
      <p className="text-ink">
        Dein Turm: {turm.hoehe} {turm.hoehe === 1 ? "Stockwerk" : "Stockwerke"}.
        {" "}Zug {Math.min(turm.zuege + 1, turm.gesamt)} von {turm.gesamt}.
      </p>

      {!fertig && !aufgabe && (
        <div className="space-y-2">
          <p className="text-ink">Wie schwer soll es sein?</p>
          <div className="flex flex-wrap gap-2">
            {SCHWEREN.map((s) => (
              <button
                key={s}
                type="button"
                className="rounded border border-hairline px-3 py-2 text-ink"
                onClick={() => waehle(s)}
              >
                {s} ({STOCKWERKE[s]} {STOCKWERKE[s] === 1 ? "Stockwerk" : "Stockwerke"})
              </button>
            ))}
          </div>
        </div>
      )}

      {aufgabe && (
        <div className="space-y-2">
          <p className="font-mono text-lg text-ink">{aufgabe.angabe}</p>
          <PlusEingabe
            wert={eingabe} onWert={setEingabe} art={art ?? "normal"} onArt={onArt ?? (() => {})}
            onPruefen={pruefe} ansagen={ansagen} feldRef={feld} beschriftung="Deine Antwort"
          />
          <button type="button" className="rounded border border-hairline px-3 py-2 text-ink" onClick={pruefe}>
            Prüfen
          </button>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button type="button" className="rounded border border-hairline px-3 py-2 text-ink" onClick={neuesSpiel}>
          Neues Spiel
        </button>
        <button type="button" className="rounded border border-hairline px-3 py-2 text-ink" onClick={onZurueck}>
          Anderes Spiel
        </button>
      </div>

      <p role="status" className="min-h-6 text-ink">{meldung}</p>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function PaareSpielAnsicht({ stufe, ansagen, onZurueck, saat }: PlusSpieleProps) {
  const ueberschrift = useUeberschriftFokus<HTMLHeadingElement>();
  const [runde, setRunde] = useState(0);
  const [spiel, setSpiel] = useState(() => neuesPaareSpiel(zufall((saat ?? 1) + runde * 13), stufe));
  const [wo, setWo] = useState(0);
  const [offen, setOffen] = useState<number[]>([]);
  const [meldung, setMeldung] = useState("");

  const sageFeld = (index: number, spielstand = spiel) => {
    const karte = spielstand.karten[index];
    const inhalt = karte.gefunden || offen.includes(index) ? karte.text : "zugedeckt";
    ansagen?.(`${lage(index)}: ${inhalt === "zugedeckt" ? inhalt : sprich(inhalt) || inhalt}`);
  };

  const aufTaste = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const richtungen: Record<string, "hoch" | "runter" | "links" | "rechts"> = {
      ArrowUp: "hoch", ArrowDown: "runter", ArrowLeft: "links", ArrowRight: "rechts",
    };
    const richtung = richtungen[e.key];
    if (richtung) {
      e.preventDefault();
      const neu = bewege(wo, richtung);
      setWo(neu);
      sageFeld(neu);
      return;
    }
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      decke(wo);
    }
  };

  const decke = (index: number) => {
    if (spiel.karten[index].gefunden || offen.includes(index)) return;
    const jetzt = [...offen, index];
    if (jetzt.length < 2) {
      setOffen(jetzt);
      const text = spiel.karten[index].text;
      setMeldung(`${lage(index)}: ${text}`);
      ansagen?.(sprich(text) || text);
      return;
    }
    const [a, b] = jetzt;
    if (passen(spiel, a, b)) {
      const neu = nachFund(spiel, a, b);
      setSpiel(neu);
      setOffen([]);
      const satz = alleGefunden(neu)
        ? "Alle Paare gefunden."
        : `Das gehört zusammen. Noch ${offenePaare(neu)} ${offenePaare(neu) === 1 ? "Paar" : "Paare"}.`;
      setMeldung(satz);
      ansagen?.(satz);
    } else {
      setOffen([]);
      const satz = `${spiel.karten[a].text} und ${spiel.karten[b].text} gehören nicht zusammen.`;
      setMeldung(satz);
      ansagen?.(satz);
    }
  };

  const neuesSpiel = () => {
    const naechste = runde + 1;
    setRunde(naechste);
    setSpiel(neuesPaareSpiel(zufall((saat ?? 1) + naechste * 13), stufe));
    setWo(0);
    setOffen([]);
    setMeldung("");
  };

  return (
    <section className="space-y-4" aria-labelledby="plus-paare">
      <h2 id="plus-paare" ref={ueberschrift} tabIndex={-1} className="text-xl font-semibold text-ink">Paare finden</h2>
      <p className="text-sm text-ink-muted">
        Mit den Pfeiltasten gehst du im Gitter herum, mit der Eingabetaste deckst du auf.
        Erst das Feld, dann die Rechnung.
      </p>

      {/* ★ Das Gitter ist eine Tabelle - eine Braillezeile liest Zeile und
          Spalte daraus, ein Kasten voller Knöpfe nicht. */}
      {/* ★ `aria-activedescendant` zeigt auf das Feld, auf dem man steht.
          Ohne das bleibt der Fokus am Gitter kleben, und eine Sprachausgabe
          sagt beim Gehen mit den Pfeiltasten gar nichts - nur die Stimme von
          Plus spräche, und die ist voreingestellt aus. Gemessen 23.09.2026. */}
      <div
        role="grid"
        aria-label="Paare finden, vier mal vier Felder"
        tabIndex={0}
        aria-activedescendant={`plus-paare-feld-${wo}`}
        onKeyDown={aufTaste}
        className="inline-block rounded border border-hairline p-2"
      >
        {Array.from({ length: spiel.karten.length / BREITE }, (_, z) => (
          <div key={z} role="row" className="flex">
            {spiel.karten.slice(z * BREITE, z * BREITE + BREITE).map((k, sp) => {
              const index = z * BREITE + sp;
              const sichtbar = k.gefunden || offen.includes(index);
              return (
                <div
                  key={index}
                  id={`plus-paare-feld-${index}`}
                  role="gridcell"
                  aria-selected={index === wo}
                  aria-label={`${lage(index)}: ${sichtbar ? k.text : "zugedeckt"}`}
                  // ★ Am Telefon schmäler: vier Felder zu 96 px plus Rand
                  // passen nicht auf 375 px, und ein Gitter, das seitlich
                  // hinausläuft, ist mit einer Hand nicht zu bedienen.
                  className={`m-0.5 min-w-16 rounded border px-1 py-2 text-center font-mono text-sm text-ink sm:m-1 sm:min-w-24 sm:px-2 sm:text-base ${
                    index === wo ? "border-2 border-ink" : "border-hairline"
                  }`}
                  onClick={() => { setWo(index); decke(index); }}
                >
                  {sichtbar ? k.text : "·"}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <button type="button" className="rounded border border-hairline px-3 py-2 text-ink" onClick={() => decke(wo)}>
          Feld aufdecken
        </button>
        <button type="button" className="rounded border border-hairline px-3 py-2 text-ink" onClick={neuesSpiel}>
          Neues Spiel
        </button>
        <button type="button" className="rounded border border-hairline px-3 py-2 text-ink" onClick={onZurueck}>
          Anderes Spiel
        </button>
      </div>

      <p role="status" className="min-h-6 text-ink">{meldung}</p>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function SchatzgitterSpiel({ stufe, ansagen, onZurueck, saat, art, onArt }: PlusSpieleProps) {
  const ueberschrift = useUeberschriftFokus<HTMLHeadingElement>();
  const [runde, setRunde] = useState(0);
  const rng = useMemo(() => zufall((saat ?? 1) + runde * 23), [saat, runde]);
  const [spiel, setSpiel] = useState(() => neuesSchatzgitter(rng));
  const [aufgabe, setAufgabe] = useState<Grabaufgabe>(() => grabaufgabe(rng, stufe));
  const [eingabe, setEingabe] = useState("");
  const [meldung, setMeldung] = useState("");
  const [fertig, setFertig] = useState(false);
  const feld = useRef<HTMLTextAreaElement>(null);

  const grabeJetzt = () => {
    // ★ Dieselbe Prüfung wie jede Plus-Aufgabe (Durchsicht 29.09.2026): „=21",
    // „10 +11 =21" und „(21)" gelten; vorher las `Number()` nur die nackte Zahl.
    const richtig = istRichtig(eingabe, {
      paket: "schatzgitter", art: "ergebnis", op: aufgabe.angabe.includes("*") ? "mal" : "plus",
      angabe: aufgabe.angabe, loesung: aufgabe.loesung, zahlen: [],
    });
    if (!richtig) {
      const satz = "Rechne noch einmal nach. Das Ergebnis sagt dir das Feld.";
      setMeldung(satz);
      ansagen?.(satz);
      return;
    }
    const ergebnis = grabe(spiel, aufgabe.feld);
    setSpiel((s) => nachGrabung(s, aufgabe.feld));
    setMeldung(ergebnis.satz);
    ansagen?.(ergebnis.satz);
    setEingabe("");
    if (ergebnis.gefunden) setFertig(true);
    else {
      const naechste = grabaufgabe(rng, stufe);
      setAufgabe(naechste);
      setTimeout(() => feld.current?.focus(), 0);
    }
  };

  const neuesSpiel = () => {
    const naechste = runde + 1;
    const frisch = zufall((saat ?? 1) + naechste * 23);
    setRunde(naechste);
    setSpiel(neuesSchatzgitter(frisch));
    setAufgabe(grabaufgabe(frisch, stufe));
    setEingabe("");
    setMeldung("");
    setFertig(false);
  };

  return (
    <section className="space-y-4" aria-labelledby="plus-schatz">
      <h2 id="plus-schatz" ref={ueberschrift} tabIndex={-1} className="text-xl font-semibold text-ink">Schatzgitter</h2>
      <p className="text-sm text-ink-muted">
        Das Gitter hat {SEITE} Spalten und {SEITE} Zeilen. Rechne - das Ergebnis sagt dir,
        wo du gräbst: die Zehnerziffer ist die Spalte, die Einerziffer die Zeile.
      </p>

      {spiel.gegraben.length > 0 && (
        <p className="text-sm text-ink-muted">
          Schon gegraben: {spiel.gegraben.map(feldName).join(" · ")}
        </p>
      )}

      {!fertig && (
        <div className="space-y-2">
          <p className="font-mono text-lg text-ink">{aufgabe.angabe}</p>
          <PlusEingabe
            wert={eingabe} onWert={setEingabe} art={art ?? "normal"} onArt={onArt ?? (() => {})}
            onPruefen={grabeJetzt} ansagen={ansagen} feldRef={feld} beschriftung="Dein Ergebnis"
          />
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {!fertig && (
          <button type="button" className="rounded border border-hairline px-3 py-2 text-ink" onClick={grabeJetzt}>
            Graben
          </button>
        )}
        <button type="button" className="rounded border border-hairline px-3 py-2 text-ink" onClick={neuesSpiel}>
          Neues Spiel
        </button>
        <button type="button" className="rounded border border-hairline px-3 py-2 text-ink" onClick={onZurueck}>
          Anderes Spiel
        </button>
      </div>

      <p role="status" className="min-h-6 text-ink">{meldung}</p>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function ZahlenstrahlSpiel({ stufe, ansagen, onZurueck, saat }: PlusSpieleProps) {
  const ueberschrift = useUeberschriftFokus<HTMLHeadingElement>();
  const [runde, setRunde] = useState(0);
  const strahl = useMemo(() => neuerStrahl(zufall((saat ?? 1) + runde * 19), stufe), [saat, runde, stufe]);
  const [stelle, setStelle] = useState(0);
  const [meldung, setMeldung] = useState("");
  const [fertig, setFertig] = useState(false);
  const [stumm, setStumm] = useState(() => tonIstStumm());

  const gehe = (schritt: number) => {
    const neu = Math.min(strahl.schritte, Math.max(0, stelle + schritt));
    setStelle(neu);
    tonFuerStelle(anteil(strahl, neu));
    ansagen?.(zahl(wertAn(strahl, neu)));
  };

  const legeAb = () => {
    const r = lege(strahl, stelle);
    setMeldung(r.satz);
    ansagen?.(r.satz);
    if (r.getroffen) setFertig(true);
  };

  const neuesSpiel = () => {
    setRunde((n) => n + 1);
    setStelle(0);
    setMeldung("");
    setFertig(false);
  };

  return (
    <section className="space-y-4" aria-labelledby="plus-strahl">
      <h2 id="plus-strahl" ref={ueberschrift} tabIndex={-1} className="text-xl font-semibold text-ink">Zahlenstrahl horchen</h2>
      <p className="text-ink">
        Wohin gehört <strong>{strahl.text}</strong>?
        {" "}Der Strahl geht von {zahl(strahl.von)} bis {zahl(strahl.bis)}.
      </p>

      {/* ★ Der Ton ist eine Hilfe, nie die einzige Auskunft: wo man steht,
          steht auch da und wird gesagt. */}
      <div
        role="slider"
        tabIndex={0}
        aria-label="Zahlenstrahl"
        aria-valuemin={strahl.von}
        aria-valuemax={strahl.bis}
        aria-valuenow={wertAn(strahl, stelle)}
        aria-valuetext={zahl(wertAn(strahl, stelle))}
        className="rounded border border-hairline px-3 py-3 font-mono text-lg text-ink"
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft" || e.key === "ArrowDown") { e.preventDefault(); gehe(-1); }
          if (e.key === "ArrowRight" || e.key === "ArrowUp") { e.preventDefault(); gehe(1); }
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); legeAb(); }
        }}
      >
        Du stehst bei {zahl(wertAn(strahl, stelle))}
      </div>

      <p className="text-sm text-ink-muted">
        Pfeiltasten gehen nach links und rechts, die Eingabetaste legt die Zahl ab.
      </p>

      <div className="flex flex-wrap gap-2">
        <button type="button" className="rounded border border-hairline px-3 py-2 text-ink" onClick={() => gehe(-1)}>
          Nach links
        </button>
        <button type="button" className="rounded border border-hairline px-3 py-2 text-ink" onClick={() => gehe(1)}>
          Nach rechts
        </button>
        {!fertig && (
          <button type="button" className="rounded border border-hairline px-3 py-2 text-ink" onClick={legeAb}>
            Hier ablegen
          </button>
        )}
        <button type="button" className="rounded border border-hairline px-3 py-2 text-ink" onClick={neuesSpiel}>
          Neue Zahl
        </button>
        <button
          type="button"
          className="rounded border border-hairline px-3 py-2 text-ink"
          aria-pressed={stumm}
          onClick={() => { const neu = !stumm; setStumm(neu); setzeTonStumm(neu); }}
        >
          {stumm ? "Ton an" : "Ton aus"}
        </button>
        <button type="button" className="rounded border border-hairline px-3 py-2 text-ink" onClick={onZurueck}>
          Anderes Spiel
        </button>
      </div>

      <p role="status" className="min-h-6 text-ink">{meldung}</p>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function DuellSpiel({ stufe, ansagen, onZurueck, saat, art, onArt }: PlusSpieleProps) {
  const ueberschrift = useUeberschriftFokus<HTMLHeadingElement>();
  const [runde, setRunde] = useState(0);
  const rng = useMemo(() => zufall((saat ?? 1) + runde * 29), [saat, runde]);
  const [spiel, setSpiel] = useState(() => neuesDuell());
  const [gestartet, setGestartet] = useState(false);
  const [aufgabe, setAufgabe] = useState<Duellaufgabe | null>(null);
  const [eingabe, setEingabe] = useState("");
  const [meldung, setMeldung] = useState("");
  const feld = useRef<HTMLTextAreaElement>(null);

  const starte = () => {
    setGestartet(true);
    const erste = duellaufgabe(rng, stufe, 0);
    setAufgabe(erste);
    ansagen?.(`${spiel.namen[0]} ist dran. ${sprich(erste.angabe)}`);
    setTimeout(() => feld.current?.focus(), 0);
  };

  const pruefe = () => {
    if (!aufgabe) return;
    const richtig = istRichtig(eingabe, {
      paket: "duell", art: "ergebnis", op: aufgabe.op,
      angabe: aufgabe.angabe, loesung: aufgabe.loesung, zahlen: [],
    });
    const neu = nachDuellzug(spiel, richtig);
    setSpiel(neu);
    setEingabe("");
    if (duellFertig(neu)) {
      setAufgabe(null);
      const satz = `${richtig ? "Richtig." : "Noch nicht."} ${duellSatz(neu)}`;
      setMeldung(satz);
      ansagen?.(satz);
      return;
    }
    const naechste = duellaufgabe(rng, stufe, Math.floor(neu.zuege / 2));
    setAufgabe(naechste);
    const satz = `${richtig ? "Richtig." : "Noch nicht."} Jetzt ist ${neu.namen[neu.dran]} dran.`;
    setMeldung(satz);
    ansagen?.(`${satz} ${sprich(naechste.angabe)}`);
    setTimeout(() => feld.current?.focus(), 0);
  };

  const neuesSpiel = () => {
    setRunde((n) => n + 1);
    setSpiel(neuesDuell(spiel.namen));
    setGestartet(false);
    setAufgabe(null);
    setEingabe("");
    setMeldung("");
  };

  return (
    <section className="space-y-4" aria-labelledby="plus-duell">
      <h2 id="plus-duell" ref={ueberschrift} tabIndex={-1} className="text-xl font-semibold text-ink">Zug um Zug</h2>

      {!gestartet ? (
        <div className="space-y-3">
          <p className="text-ink">
            Zu zweit an einem Gerät. Immer ist genau eines dran, und es hat so lange, wie es braucht.
          </p>
          {[0, 1].map((i) => (
            <div key={i} className="space-y-1">
              <label className="block text-sm font-medium text-ink" htmlFor={`plus-duell-name-${i}`}>
                Name {i + 1}
              </label>
              <input
                id={`plus-duell-name-${i}`}
                data-kuerzel="an"
                type="text"
                autoComplete="off"
                className="w-full rounded border border-hairline bg-surface-sunken px-3 py-2 text-ink"
                value={spiel.namen[i]}
                onChange={(e) => {
                  const namen: [string, string] = [...spiel.namen] as [string, string];
                  namen[i] = e.target.value;
                  setSpiel((s) => ({ ...s, namen }));
                }}
              />
            </div>
          ))}
          <div className="flex flex-wrap gap-2">
            <button type="button" className="rounded border border-hairline px-3 py-2 text-ink" onClick={starte}>
              Losgehen
            </button>
            <button type="button" className="rounded border border-hairline px-3 py-2 text-ink" onClick={onZurueck}>
              Anderes Spiel
            </button>
          </div>
        </div>
      ) : (
        <>
          <p className="text-ink">
            {spiel.punkte[0]} zu {spiel.punkte[1]} · Runde {Math.floor(spiel.zuege / 2) + 1} von {spiel.runden}
          </p>

          {aufgabe && (
            <div className="space-y-2">
              <p className="text-ink"><strong>{spiel.namen[spiel.dran]}</strong> ist dran.</p>
              <p className="font-mono text-lg text-ink">{aufgabe.angabe}</p>
              <PlusEingabe
                wert={eingabe} onWert={setEingabe} art={art ?? "normal"} onArt={onArt ?? (() => {})}
                onPruefen={pruefe} ansagen={ansagen} feldRef={feld} beschriftung="Antwort"
              />
              <button type="button" className="rounded border border-hairline px-3 py-2 text-ink" onClick={pruefe}>
                Prüfen und weitergeben
              </button>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <button type="button" className="rounded border border-hairline px-3 py-2 text-ink" onClick={neuesSpiel}>
              Neues Spiel
            </button>
            <button type="button" className="rounded border border-hairline px-3 py-2 text-ink" onClick={onZurueck}>
              Anderes Spiel
            </button>
          </div>
        </>
      )}

      <p role="status" className="min-h-6 text-ink">{meldung}</p>
    </section>
  );
}
