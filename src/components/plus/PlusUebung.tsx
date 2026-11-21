/**
 * Eine Runde: acht Aufgaben aus einem Paket oder aus dem Plan des Coachs.
 *
 * ★ Seit 26.09.2026 rundenbasiert (Johannes: „8 Rechnungen und nach 3 Runden
 * kommt ein Rätsel, das man auch überspringen kann"). Ist diese Runde die
 * dritte, bringt die Seite das Rätsel mit (`raetsel`), und es erscheint nach
 * der letzten Aufgabe - vor dem Abschluss.
 *
 * ★ Kein Zeitdruck. Es gibt keine Uhr, keinen Countdown und keine Reihung
 * gegen andere Kinder. Weitergehen darf nur, wer selbst weitergeht - auch
 * nach einer richtigen Antwort. Wer rechnet, soll denken dürfen.
 *
 * ★ Die Angabe steht in kurzer Schreibweise da (`48 +27 =`), damit die
 * Braillezeile die Schulschreibweise zeigt. ★★ Seit 25.09.2026 steht die
 * Rechenzeile IM EINGABEFELD (`6 +[] =10`, Schreibmarke in der Lücke); über
 * dem Feld bleibt nur, was nicht in die Zeile gehört - Musterzeilen, Fragen. Gesprochen wird der ausformulierte
 * Satz - aus `sprich()`. Nie beides doppelt, und nie ein `aria-label` am
 * Ausdruck: der würde am Stück angesagt, und Wort-für-Wort-Lesen fiele weg.
 */
import { istAltBuchstabe } from "@/lib/altTaste";
import { PlusPerlen, PlusRundenKette, PlusWegzeile, danachSatz, type Wegzeile } from "./PlusFortschritt";
import { HakenZeichen, LautsprecherZeichen, NochmalZeichen } from "./PlusZeichen";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { pruefe, zufall, type Aufgabe } from "@/lib/plus/aufgabe";
import { erzeugeFolge, erzeugeLauf } from "@/lib/plus/generator";
import { RUNDE } from "@/lib/plus/coach";
import { paket } from "@/lib/plus/stoffplan";
import { eingabezeile, eingabezeileBraille } from "@/lib/plus/zeile";
import { sprichPlus as sprich } from "@/lib/plus/sprich";
import { usePlusLang, usePlusTexte } from "@/lib/plus/sprache";
import { useEinstellungen } from "@/lib/plus/einstellungen";
import { doppelUmschaltSchritt, type DoppelStand } from "@/lib/computer/doppelUmschalt";
import { laufweiteText, useDeviceZeichenabstand } from "@/lib/typing/zeichenabstand";
import { PlusEingabe, vorlageInZellen, type Eingabeart } from "./PlusEingabe";
import { PlusRaetsel, type RaetselEnde } from "./PlusRaetsel";
import { PlusReise } from "./PlusReise";
import { etappenSatz, type EtappeFertig } from "@/lib/plus/reise";
import { spieleRichtigTon } from "@/lib/plus/ton";

export interface PlusUebungProps {
  /** Die Tür „Ich wähle": ein Paket, acht Aufgaben daraus. */
  paketId?: string;
  /**
   * Die Tür „Mein Training": der Coach hat die Pakete schon gemischt, je
   * Eintrag eine Aufgabe. Die Reihenfolge ist seine, nicht unsere.
   */
  plan?: string[];
  /** Überschrift, wenn der Plan aus mehreren Paketen kommt. */
  titel?: string;
  /** Nach jeder Antwort - der Coach rechnet damit weiter. */
  onAntwort?: (lage: {
    paketId: string; richtig: boolean; loesung: string; eingabeart: string;
    aufgabe: Aufgabe; eingabe: string;
  }) => void;
  /**
   * Ein Satz, wenn sich ein Denkfehler über mehrere Läufe gezeigt hat.
   * Leer heißt: schweigen. Das ist der Normalfall.
   */
  hinweisZu?: (aufgabe: Aufgabe, eingabe: string) => string;
  /**
   * Was die Seite sonst noch zu melden hat - ein neues Abzeichen etwa.
   * Es geht durch DIESELBE Live-Region wie die Rückmeldung; eine zweite
   * würde die Braillezeile ein zweites Mal verdrängen.
   */
  zusatzmeldung?: string;
  /**
   * „Rechnungen ausschreiben": dann steht die Wortform da, und der
   * Screenreader liest sie selbst richtig. ★ Nie beides zugleich - die kurze
   * Form wird nie ausgeschrieben, die gesprochene nie angezeigt.
   */
  ausschreiben?: boolean;
  /** Am Ende des Laufs: wie viele von wie vielen. */
  onFertig?: (richtige: number, gesamt: number) => void;
  /** Zurück zur Auswahl. */
  onZurueck: () => void;
  /**
   * Nur in „Mein Training": eine neue Runde, frisch gemischt vom Coach.
   * ★ Das Training geht immer weiter (Johannes, 23.09.2026) - am Ende einer
   * Runde steht deshalb „Weiter", nicht „Noch ein Durchgang" mit denselben
   * Paketen.
   */
  onNaechsteRunde?: () => void;
  /** Die Stimme der App. */
  ansagen?: (satz: string) => void;
  /** Saat für den Zufall - die Tests setzen sie, sonst entscheidet die Uhr. */
  saat?: number;
  /** Eingabeart, die das Kind zuletzt gewählt hat. */
  art?: Eingabeart;
  onArt?: (art: Eingabeart) => void;
  /**
   * Das Rätsel nach dieser Runde - nur jede dritte Runde, sonst leer. Die
   * Seite entscheidet das beim Start der Runde.
   */
  raetsel?: Aufgabe | null;
  /** Das Rätsel ist vorbei: gelöst, aufgelöst oder übersprungen. */
  onRaetselEnde?: (ende: RaetselEnde, raetsel: Aufgabe) => void;
  /**
   * Wie viele Runden es nach dieser noch bis zum nächsten Rätsel sind - für
   * einen kurzen Satz im Abschluss. Ohne Angabe: kein Satz.
   */
  rundenBisRaetsel?: number;
  /**
   * Die Etappe, die diese Runde geschafft hat (`lib/plus/reise.ts`) - ihre
   * Szene steht im Abschluss. Leer: keine neue Etappe.
   */
  etappe?: EtappeFertig | null;
  /**
   * Eine Aufgabe wurde nach einem Fehler oder mit dem Rechenweg richtig
   * gelöst - für die Abzeichen „Durchgehalten" und „Hilfe genutzt".
   */
  onBesonderes?: (art: "durchgehalten" | "hilfe") => void;
  /** Die Klasse kann den Rechenweg auf Knopfdruck ausschalten (Einstellungen der Klasse). */
  rechenwegErlaubt?: boolean;
  /**
   * Liest Plus vor (Vorlesemodus, Alt + V)? Nur dann steht der Knopf „Aufgabe
   * noch einmal ansagen" da (Johannes, 16.10.2026). Das Kürzel Umschalt
   * zweimal gilt immer - es bringt die Aufgabe auch auf die Braillezeile.
   */
  vorlesen?: boolean;
  /** Nur „Mein Training": die Etappe als dünne Zeile über der Aufgabe. */
  wegzeile?: Wegzeile | null;
  /** Nach so vielen Runden kommt ein Rätsel - für die Kette im Abschluss. */
  rundenAlleRaetsel?: number;
}

type Stand = "offen" | "richtig" | "falsch";

/**
 * ★ Die Familie der Aufgabenart färbt den Rechenbereich (Johannes, 21.10.2026: „je nach
 * Beispielart den Rechenbereich eingefärbt"). Nur Farbe - die Art steht weiter im Text.
 */
function artFamilie(art: Aufgabe["art"]): "rechnen" | "muster" | "pruefen" | "sach" | "knobel" {
  switch (art) {
    case "folge": case "mauer": case "dreieck": case "zahlenhaus": case "zahlenkette": case "malkreuz": case "ziffernkarten":
      return "muster";
    case "ueberschlag": case "probe": case "fehler_finden": case "strategiewahl": case "stimmt_das": case "wahr_falsch": case "stoerenfried": case "klecks":
      return "pruefen";
    case "sach": case "fermi": case "lesen": case "erfinden": case "wege": case "menge":
      return "sach";
    case "knobel":
      return "knobel";
    default:
      return "rechnen";
  }
}

export function PlusUebung({
  paketId, plan, titel, onZurueck, onNaechsteRunde, ansagen, saat, art, onArt, onAntwort, onFertig, hinweisZu,
  zusatzmeldung = "", ausschreiben = false, raetsel = null, onRaetselEnde, rundenBisRaetsel,
  etappe = null, onBesonderes, rechenwegErlaubt = true, vorlesen = true, wegzeile = null, rundenAlleRaetsel,
}: PlusUebungProps) {
  const texte = usePlusTexte();
  const lang = usePlusLang();
  const t = texte.uebung;
  const ueberschrift = titel ?? (paketId ? paket(paketId).name : t.fallbackTitel);
  const aufgaben = useMemo<Aufgabe[]>(() => {
    const s = saat ?? Math.floor(Math.random() * 1e9);
    if (plan?.length) return erzeugeFolge(plan, zufall(s));
    return paketId ? erzeugeLauf(paketId, { anzahl: RUNDE, saat: s }) : [];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paketId, plan?.join(","), saat]);

  const [nr, setNr] = useState(0);
  const [wert, setWert] = useState("");
  const [stand, setStand] = useState<Stand>("offen");
  /**
   * Was im Feld stand, als es „noch nicht" hieß. Solange das Feld unverändert
   * so dasteht, zeigt es den Rand „noch einmal"; sobald das Kind etwas ändert,
   * ist es wieder ein ganz gewöhnliches Feld.
   */
  const [falschWert, setFalschWert] = useState<string | null>(null);
  const [richtige, setRichtige] = useState(0);
  /** Zählt bei jeder richtigen Antwort hoch - das Eingabefeld blinkt dann grün. */
  const [blitz, setBlitz] = useState(0);
  /** Zählt hoch, wenn die Rechnung zurück ins Feld soll (Umschalt zweimal). */
  const [zurueck, setZurueck] = useState(0);
  /**
   * ★ Übersprungene Aufgaben, die noch nicht gewertet waren (Johannes,
   * 17.10.2026: „es braucht einen kleinen Schalter Aufgabe überspringen").
   * Sie zählen weder richtig noch falsch - die Runde wird über die übrigen
   * gerechnet. Nie etwas gegen das Kind.
   */
  const [uebersprungen, setUebersprungen] = useState(0);
  const [eigeneArt, setEigeneArt] = useState<Eingabeart>("normal");
  /**
   * Was die Live-Region nach dem Prüfen sagt. ★ Ein ganzer Satz, weil es
   * mehr als zwei Ausgänge gibt: „Richtig.", „Noch nicht.", „Fast richtig. Man
   * schreibt es: nein.", „Richtig gerechnet - achte auf die Einheit."
   */
  const [meldung, setMeldung] = useState("");
  /**
   * ★ Gezählt wird der ERSTE Versuch je Aufgabe. Wer noch einmal nachdenkt und
   * es dann richtig hat, soll das dürfen - aber der Coach darf ihn nicht
   * fünfmal für dieselbe Aufgabe herunterstufen, und das Wochenziel zählt
   * keine Aufgabe doppelt.
   */
  const [gezaehlt, setGezaehlt] = useState(false);
  /**
   * ★ Wie oft hat es das Kind bei dieser Aufgabe versucht? Nach zwei
   * Fehlversuchen gibt es einen Ausweg. Vorher nicht - sonst übt das Kind das
   * Durchklicken. Aber gar keinen Ausweg zu haben, ist schlimmer: wer eine
   * Aufgabe nicht lösen kann, sass bis heute fest und konnte nur die ganze
   * Übung abbrechen.
   */
  const [versuche, setVersuche] = useState(0);
  /** Die aufgelöste Lösung, wenn das Kind nicht weiterkam. */
  const [aufgeloest, setAufgeloest] = useState("");
  // Der Rechenweg wird Schritt für Schritt aufgedeckt - nie auf einmal und
  // nie von selbst. Wer ihn automatisch einblendet, nimmt dem Kind das Rechnen.
  const [wegSchritte, setWegSchritte] = useState(0);
  /** Ist das Rätsel dieser Runde vorbei? Erst dann kommt der Abschluss. */
  const [raetselVorbei, setRaetselVorbei] = useState(false);
  const feld = useRef<HTMLTextAreaElement>(null);
  /** Der erste Knopf im Abschluss - dorthin geht der Fokus, wenn die Runde endet. */
  const abschlussKnopf = useRef<HTMLButtonElement>(null);
  /** Schrift und Zeichenabstand der Angabe - von Alt + Plus/Minus und den Einstellungen. */
  const zoom = useEinstellungen((s) => s.zoom);
  const cvi = useDeviceZeichenabstand((s) => s.faktor);
  const schrift = { fontSize: `${zoom * 2}rem`, lineHeight: 1.25, ...laufweiteText(cvi) };
  /** Stand des Doppel-Umschalt-Griffs: Zeit des ersten Drucks, sonst null. */
  const doppelStand = useRef<DoppelStand>(null);

  const gewaehlteArt = art ?? eigeneArt;
  const setzeArt = onArt ?? setEigeneArt;
  const aufgabe = aufgaben[nr];
  const fertig = nr >= aufgaben.length;
  /**
   * Die Rechenzeile, die im Feld steht - oder `null`, dann beginnt es leer.
   *
   * ⚠️ Nicht bei „Rechnungen ausschreiben": dort steht die Aufgabe in Worten
   * da, damit eine Sprachausgabe sie richtig liest, und die kurze Form
   * erscheint nie daneben (siehe `ausschreiben`). Das Feld beginnt leer wie
   * vor dem 25.09.2026.
   */
  // ★ Johannes, 19.10.2026: Mit Braillezeile steht JEDE Aufgabe im Feld, auch Textaufgaben
  // („ausschreiben" gilt dort nicht: auf der Braillezeile ist die kurze Form die bessere).
  // OHNE Braillezeile kommt die Rechnung oben und das Feld ist leer.
  const mitBraille = gewaehlteArt !== "normal";
  const zeile = useMemo(() => (aufgabe && mitBraille ? eingabezeileBraille(aufgabe) : null), [aufgabe, mitBraille]);
  /** Schriftlich rechnen: die Eingabetaste macht eine neue Zeile - mit und ohne Braillezeile. */
  const mehrzeilig = useMemo(() => !!(aufgabe && eingabezeile(aufgabe)?.mehrzeilig), [aufgabe]);

  // Jede neue Aufgabe wird angesagt - in der ausformulierten Form.
  useEffect(() => {
    if (!aufgabe) return;
    ansagen?.(vorsatz.current + sprich(aufgabe.angabe));
    vorsatz.current = "";
    feld.current?.focus();
  }, [aufgabe, ansagen]);

  /** „Richtig. " vor der Ansage der nächsten Aufgabe - sonst schnitte sie die Stimme ab. */
  const vorsatz = useRef("");

  const weiter = useCallback((meldungBehalten = "") => {
    setNr((n) => n + 1);
    setWert("");
    setStand("offen");
    setMeldung(meldungBehalten);
    setWegSchritte(0);
    setGezaehlt(false);
    setVersuche(0);
    setAufgeloest("");
  }, []);

  const pruefen = useCallback(() => {
    if (!aufgabe) return;
    if (stand === "richtig" || aufgeloest) { weiter(); return; }
    const urteil = pruefe(wert, aufgabe, zeile ?? undefined);
    // ★ Nichts geschrieben, eine Lücke offen, vorne verrutscht: das ist kein
    // Versuch. Es wird nicht gezählt und heißt nicht „Noch nicht"
    // (eine andere App der Plattform : „leer" ist nicht „falsch", Bauplan §5.8).
    if (urteil.stand === "leer") { ansagen?.(t.nochNichts); return; }
    if (urteil.stand === "teilweise") { ansagen?.(t.luecke); return; }
    if (urteil.stand === "veraendert") {
      const satz = t.veraendert;
      setMeldung(satz);
      ansagen?.(satz);
      return;
    }
    // ★ Ein Schreibfehler in einem Wort ist Rechtschreibung, nicht Rechnen:
    // für den Coach zählt die Sache, und die stimmt.
    const gut = urteil.stand === "richtig" || urteil.stand === "schreibfehler";
    if (!gezaehlt) {
      setGezaehlt(true);
      onAntwort?.({
        paketId: aufgabe.paket, richtig: gut, loesung: aufgabe.loesung,
        eingabeart: gewaehlteArt, aufgabe, eingabe: urteil.antwort,
      });
    }
    if (urteil.stand === "richtig") {
      // ★ Die Eingabetaste prüft UND geht weiter (Johannes, 12.10.2026: „mit
      // enter soll sofort geprüft werden und die nächste rechnung kommen").
      // „Richtig." bleibt in der Live-Region stehen und wird vor der neuen
      // Angabe gesagt. Falsch bleibt auf der Aufgabe - dort darf man es noch
      // einmal versuchen.
      setRichtige((r) => r + 1);
      setBlitz((b) => b + 1);
      // ★ Nach einem Fehler weitergemacht, oder mit dem Rechenweg gelöst:
      // beides ist Mut und wird mit einem Abzeichen belohnt, nicht notiert.
      if (versuche > 0) onBesonderes?.("durchgehalten");
      if (wegSchritte > 0) onBesonderes?.("hilfe");
      spieleRichtigTon();
      if (nr + 1 < aufgaben.length) vorsatz.current = `${t.richtig} `;
      else ansagen?.(t.richtig);
      weiter(t.richtig);
      return;
    }
    if (urteil.stand === "schreibfehler") {
      // ★ Johannes im eine andere App der Plattform , 25.08.2026: „Sag nicht richtig, weil richtig
      // ist es nicht - sag: fast richtig, man schreibt es …"
      const satz = t.fastRichtig(urteil.schreibung ?? "");
      setMeldung(satz);
      ansagen?.(satz);
      return;
    }
    setVersuche((v) => v + 1);
    setStand("falsch");
    setFalschWert(wert);
    // ★ Was stimmt, kommt zuerst - auch wenn die Antwort noch nicht fertig ist.
    if (urteil.stand === "einheit" || urteil.stand === "rest") {
      const satz = urteil.stand === "einheit"
        ? t.einheit(urteil.hinweis)
        : t.restFehlt;
      setMeldung(satz);
      ansagen?.(satz);
      return;
    }
    // ★ Der Hinweis kommt erst, wenn sich das Muster über mehrere Läufe
    // gezeigt hat - und nur, wenn er zu DIESER Aufgabe passt.
    // ★ Mehrere Werte: was stimmt, kommt zuerst, dann was noch nicht (16.10.2026).
    const hinweis = urteil.hinweis ?? hinweisZu?.(aufgabe, urteil.antwort) ?? "";
    const satz = hinweis ? t.nochNicht(hinweis) : t.nochNichtLeer;
    setMeldung(satz);
    ansagen?.(satz);
  }, [aufgabe, wert, stand, ansagen, weiter, onAntwort, onBesonderes, versuche, wegSchritte, gewaehlteArt, mitBraille, zeile, hinweisZu, gezaehlt, aufgeloest, nr, aufgaben.length]);

  /**
   * ★ Aufgabe überspringen: weiter zur nächsten, ohne Wertung. War sie schon
   * gewertet (ein Fehlversuch), bleibt es dabei - dann zählt sie ganz normal.
   * „Übersprungen." steht vor der Ansage der nächsten Aufgabe, so wie „Richtig.".
   * Der Fokus geht mit der neuen Aufgabe ins Feld, nach der letzten in den
   * Abschluss.
   */
  const ueberspringen = useCallback(() => {
    if (!aufgabe) return;
    if (!gezaehlt) setUebersprungen((u) => u + 1);
    if (nr + 1 < aufgaben.length) vorsatz.current = `${t.uebersprungen} `;
    else ansagen?.(t.uebersprungen);
    weiter(t.uebersprungen);
  }, [aufgabe, gezaehlt, nr, aufgaben.length, ansagen, weiter, t]);

  /**
   * Die kurze Schreibweise, wie sie auf die Braillezeile kommt: die Rechenzeile
   * selbst, davor die Zeilen darüber. Bei „ausschreiben" die Wortform.
   */
  const kurzform = zeile
    ? [...zeile.davor, zeile.vorlage].join(" / ")
    : ausschreiben && aufgabe
      ? sprich(aufgabe.angabe) || aufgabe.angabe
      : (aufgabe?.angabe ?? "").split("\n").join(" / ");

  /**
   * Die Angabe noch einmal: sagen UND auf die Braillezeile bringen. Die
   * Live-Region ist die einzige der Seite - sie blitzt nur, wenn sich ihr Text
   * ändert, darum erst leeren und im nächsten Frame den Satz setzen.
   */
  const nochmal = useCallback(() => {
    if (!aufgabe) return;
    ansagen?.(sprich(aufgabe.angabe));
    // ★ Die Rechnung steht wieder im Feld, wie sie kam - nicht nur gesagt.
    setZurueck((z) => z + 1);
    setFalschWert(null);
    setMeldung("");
    window.setTimeout(() => setMeldung(t.aufgabeKurz(kurzform)), 50);
    feld.current?.focus();
  }, [aufgabe, ansagen, kurzform, t]);

  /**
   * „Aufgabe 3 von 8" - sagen UND auf die Braillezeile bringen, wie `nochmal`.
   * In „Mein Training" kommt die Etappe dazu.
   */
  const standAnsagen = useCallback(() => {
    const satz = [
      wegzeile ? t.etappeVon(wegzeile.nr, wegzeile.gesamt) : "",
      t.aufgabeVon(nr + 1, aufgaben.length),
      raetsel ? t.danachRaetsel : "",
    ].filter(Boolean).join(" ");
    ansagen?.(satz);
    setMeldung("");
    window.setTimeout(() => setMeldung(satz), 50);
  }, [wegzeile, nr, aufgaben.length, raetsel, ansagen, t]);

  /*
   * ★ Doppel-Umschalt: zweimal Umschalt schnell hintereinander sagt die Angabe
   * noch einmal. Der Griff gilt auch im Eingabefeld - Umschalt allein ändert
   * dort nichts. Jede andere Taste löscht den ersten Druck (Regel 3 im
   * Erkenner). Solange eine Aufgabe offen ist.
   */
  const offen = !!aufgabe && !fertig;
  useEffect(() => {
    if (!offen) return;
    const taste = (e: KeyboardEvent) => {
      const schritt = doppelUmschaltSchritt(doppelStand.current, e, performance.now());
      doppelStand.current = schritt.stand;
      if (schritt.ausgeloest) { nochmal(); return; }
      if (e.defaultPrevented || document.querySelector('[role="dialog"][aria-modal="true"]')) return;
      // ★ Alt + W - die Aufgabe noch einmal, wie in allen Lern-Apps (Johannes,
      // 18.10.2026). Derselbe Weg wie Umschalt zweimal.
      if (e.altKey && !e.ctrlKey && !e.metaKey && e.code === "KeyW") {
        e.preventDefault();
        nochmal();
        return;
      }
      // ★ Alt + Z - wo bin ich (Johannes, 18.10.2026: in allen Lern-Apps „Stand
      // ansagen"; bis dahin holte Alt + Z hier die Rechnung zurück). Nach dem
      // AUFDRUCK erkannt - Alt + Y wirkt nicht mit.
      if (istAltBuchstabe(e, "z")) {
        e.preventDefault();
        standAnsagen();
      }
    };
    window.addEventListener("keydown", taste);
    return () => window.removeEventListener("keydown", taste);
  }, [offen, nochmal, standAnsagen]);

  /*
   * ★ Fokus-Pflicht: Mit der letzten Aufgabe verschwindet das Feld, und der
   * Fokus fiele auf `body`. Er geht auf den ersten Knopf des Abschlusses -
   * erst, wenn auch das Rätsel vorbei ist.
   */
  const imAbschluss = fertig && (!raetsel || raetselVorbei);
  useEffect(() => {
    if (!imAbschluss) return;
    const t = setTimeout(() => abschlussKnopf.current?.focus(), 0);
    return () => clearTimeout(t);
  }, [imAbschluss]);

  // Das Ende des Laufs melden - einmal, nicht bei jedem Neuzeichnen.
  // Gerechnet wird über die gewerteten Aufgaben; übersprungene zählen nicht.
  const gewertet = aufgaben.length - uebersprungen;
  const gemeldet = useRef(false);
  useEffect(() => {
    if (fertig && !gemeldet.current) {
      gemeldet.current = true;
      onFertig?.(richtige, gewertet);
    }
  }, [fertig, richtige, gewertet, onFertig]);

  if (!aufgaben.length) {
    return (
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-ink">{ueberschrift}</h2>
        <p className="text-ink">{t.genug}</p>
        <button type="button" className="rounded border border-hairline px-3 py-2 text-ink" onClick={onZurueck}>
          {texte.zurueck}
        </button>
      </section>
    );
  }

  if (fertig && raetsel && !raetselVorbei) {
    return (
      <PlusRaetsel
        aufgabe={raetsel}
        vorspann={t.raetselVorspann(richtige, gewertet)}
        ansagen={ansagen}
        art={gewaehlteArt}
        onArt={setzeArt}
        ausschreiben={ausschreiben}
        onEnde={(ende) => {
          setRaetselVorbei(true);
          onRaetselEnde?.(ende, raetsel);
        }}
      />
    );
  }

  if (fertig) {
    return (
      <section className="space-y-4" aria-labelledby="plus-fertig">
        <h2 id="plus-fertig" className="text-xl font-semibold text-ink">{t.geschafft}</h2>
        <p className="text-ink">
          {t.richtigVon(richtige, gewertet)}
          {uebersprungen > 0 && t.uebersprungenSatz(uebersprungen)}
        </p>
        {/* ★ Ein kurzer Satz, wie weit das nächste Rätsel ist - das Ende der
            Runde soll ein Ziel haben, das man sieht. */}
        {rundenBisRaetsel !== undefined && rundenBisRaetsel > 0 && (
          <p className="text-ink">
            {t.rundenBis(rundenBisRaetsel)}
          </p>
        )}
        {rundenBisRaetsel !== undefined && rundenAlleRaetsel !== undefined && rundenBisRaetsel > 0 && (
          <PlusRundenKette alle={rundenAlleRaetsel} bis={rundenBisRaetsel} />
        )}

        {/* ★ Hier kommt das Abzeichen an. Ohne diese Zeile fiel es durch:
            die Seite zeigt ihre Meldung nur, wenn keine Übung läuft, und die
            Abschluss-Seite hatte gar keine. Gemessen am 23.09.2026. */}
        {etappe && <PlusReise etappe={etappe} />}
        <p role="status" lang={lang} className="min-h-6 text-ink">
          {[etappe ? etappenSatz(etappe) : "", zusatzmeldung].filter(Boolean).join(" ")}
        </p>
        {onNaechsteRunde ? (
          <div className="flex flex-wrap gap-2">
            <button ref={abschlussKnopf} type="button" className="btn-primary" onClick={onNaechsteRunde}>
              {t.weiterNaechste}
            </button>
            <button type="button" className="btn-secondary" onClick={onZurueck}>
              {paketId && !plan?.length ? t.andereUebung : t.genugHeute}
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            <button
              ref={abschlussKnopf}
              type="button"
              className="rounded border border-hairline px-3 py-2 text-ink"
              onClick={() => {
                gemeldet.current = false;
                setNr(0); setRichtige(0); setUebersprungen(0); setWert(""); setStand("offen"); setGezaehlt(false);
                setMeldung(""); setVersuche(0); setAufgeloest(""); setWegSchritte(0);
              }}
            >
              {t.nochDurchgang}
            </button>
            <button type="button" className="rounded border border-hairline px-3 py-2 text-ink" onClick={onZurueck}>
              {t.andereUebung}
            </button>
          </div>
        )}
      </section>
    );
  }

  // ★ Kann das Feld die Zeile nicht tragen (Mathematikschrift kennt weder `[]`
  // noch Buchstaben), bleibt die ganze Angabe über dem Feld stehen.
  const imFeld = !!zeile && vorlageInZellen(zeile.vorlage, zeile.marke, gewaehlteArt) !== null;
  const angabeZeilen = zeile && imFeld ? zeile.davor : aufgabe.angabe.split("\n");

  /** Die Rechenzeile im Weg (Rechenweg) - kleiner als die Angabe, in derselben Schrift. */
  const schriftWeg = { ...schrift, fontSize: `${zoom * 1.5}rem` };
  /** Der Satz der einen Live-Region - und welcher Ton zu ihm gehört (Zeichen und Farbe, nie nur Farbe). */
  const statusText = [aufgeloest ? "" : meldung, aufgeloest, zusatzmeldung].filter(Boolean).join(" ");
  const meldungsTon = stand === "falsch" ? "falsch" : meldung === t.richtig && !aufgeloest ? "richtig" : "neutral";

  return (
    <section className="space-y-5" aria-labelledby="plus-uebung-titel">
      {/* In „Mein Training" sagt die Wegzeile, wo man ist - die Überschrift bleibt für die Gliederung. */}
      <h2 id="plus-uebung-titel" className={wegzeile ? "sr-only" : "text-xl font-semibold text-ink"}>{ueberschrift}</h2>
      {wegzeile && <PlusWegzeile weg={wegzeile} />}

      {/* ★ Der Satz bleibt für Sprachausgabe und Braillezeile; die Perlen sind stumm. */}
      <div className="space-y-1">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4">
          <p className="m-0 text-lg font-bold text-accent">{t.aufgabeLabel(nr + 1, aufgaben.length)}</p>
          <p aria-hidden="true" className="m-0 text-ink-muted">{t.danachMarke(!!raetsel)}</p>
        </div>
        <p className="sr-only">{danachSatz(nr + 1, aufgaben.length, !!raetsel)}</p>
        <PlusPerlen nr={nr + 1} gesamt={aufgaben.length} raetsel={!!raetsel} />
      </div>

      {/* ★ Angabe und Feld rücken zusammen (Johannes, 16.10.2026): EIN Block mit
          engem Abstand, die Angabe steht als Sprechblase direkt über dem Feld. */}
      <div className="space-y-3 plus-rechenbereich" data-art={artFamilie(aufgabe.art)}>
        {/* ★ Über dem Feld steht, was nicht in die Zeile gehört - Musterzeilen
            und Fragen. Die Rechenzeile selbst steht IM Feld; hier noch einmal,
            und die Braillezeile läse sie doppelt. Mit „Rechnungen ausschreiben"
            steht alles in Worten da, auch die Zeile im Feld. */}
        {angabeZeilen.length > 0 && (
          <div
            id="plus-aufgabe"
            className="tt-uebungsschrift font-legible break-words rounded-[1.75rem] rounded-bl-lg border-2 border-hairline bg-surface-raised px-6 py-4 text-ink shadow-card"
            style={schrift}
          >
            {angabeZeilen.map((z, i) => (
              <p key={i} className="m-0">
                {ausschreiben ? sprich(z) || z : z}
              </p>
            ))}
          </div>
        )}

        <PlusEingabe
          wert={wert}
          onWert={setWert}
          art={gewaehlteArt}
          onArt={setzeArt}
          onPruefen={pruefen}
          ansagen={ansagen}
          feldRef={feld}
          beschriebenVon={angabeZeilen.length ? "plus-aufgabe" : undefined}
          vorlage={zeile?.vorlage}
          marke={zeile?.marke}
          neuBei={aufgabe}
          zurueckBei={zurueck}
          umschaltZurueck={false}
          mehrzeilig={mehrzeilig}
          erwartet={aufgabe.loesung.length}
          blitz={blitz}
          falsch={stand === "falsch" && falschWert === wert}
          tastenExtra={[t.tastenExtra]}
          /* ★ Die EINE Live-Region der Seite, solange eine Übung läuft - direkt
             unter dem Feld, wo das Kind hinschaut. Kurz halten: sie blitzt auf
             der Braillezeile auf und verdrängt dabei, was unter den Fingern
             liegt. */
          statusZeile={
            <p
              role="status"
              lang={lang}
              className={`-mt-1 flex min-h-7 items-center gap-2 text-lg font-bold ${
                meldungsTon === "falsch" ? "text-warning" : meldungsTon === "richtig" ? "text-success" : "text-ink"
              }`}
            >
              {meldungsTon === "richtig" && <HakenZeichen groesse={22} />}
              {meldungsTon === "falsch" && <NochmalZeichen groesse={22} />}
              {statusText && <span>{statusText}</span>}
            </p>
          }
          /* ★ Nur im Vorlesemodus (Alt + V). Umschalt zweimal geht immer. */
          linksUnten={
            vorlesen ? (
              <button type="button" className="plus-knopf plus-knopf-zweit plus-knopf-klein" onClick={nochmal}>
                <LautsprecherZeichen groesse={22} />
                {t.nochmalAnsagen}
              </button>
            ) : undefined
          }
        />
      </div>

      {/* ★ Der Rechenweg: auf Tastendruck, Schritt für Schritt. Die Quelle
          dafür ist „Mathematik in linearer Darstellung" (Stanetty 2010) - die
          Sätze stehen dort wörtlich. */}
      {rechenwegErlaubt && aufgabe.weg?.length ? (
        <div className="space-y-2">
          {wegSchritte > 0 && (
            <ol className="m-0 list-none space-y-1 p-0 text-sm">
              {aufgabe.weg.slice(0, wegSchritte).map((s, i) => (
                <li key={i} className="text-ink">
                  {s.satz}
                  <span className="tt-uebungsschrift font-legible block break-words" style={schriftWeg}>{s.zeile}</span>
                  {s.merke > 0 && <span className="block text-ink-muted">{t.merke} {s.merke}</span>}
                </li>
              ))}
            </ol>
          )}
          {wegSchritte < aufgabe.weg.length && (
            <button
              type="button"
              className="plus-knopf plus-knopf-zweit plus-knopf-klein"
              onClick={() => {
                const naechster = aufgabe.weg![wegSchritte];
                setWegSchritte((n) => n + 1);
                ansagen?.(naechster.satz);
                // ★ Mit dem letzten Schritt verschwindet dieser Knopf - und
                // der Fokus fiele auf `body` (gemessen 23.09.2026). Er geht
                // ins Antwortfeld: dort wird weitergerechnet.
                if (wegSchritte + 1 >= aufgabe.weg!.length) feld.current?.focus();
              }}
            >
              {wegSchritte === 0 ? t.zeigWeg : t.nochSchritt}
            </button>
          )}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" className="plus-knopf plus-knopf-haupt" onClick={pruefen}>
          {stand === "richtig" || aufgeloest ? t.weiter : (<><HakenZeichen groesse={26} />{t.pruefen}</>)}
        </button>
        {/* ★ Der Ausweg nach zwei Fehlversuchen. Er zeigt die Lösung und geht
            weiter - festsitzen ist keine Übung. */}
        {stand === "falsch" && versuche >= 2 && (
          <button
            type="button"
            className="plus-knopf plus-knopf-zweit"
            onClick={() => {
              // ★ Eine offene Aufgabe hat viele Lösungen - gezeigt wird eine.
              const satz = aufgabe.passt ? t.loesungEine(aufgabe.loesung) : t.loesung(aufgabe.loesung);
              ansagen?.(sprich(satz) || satz);
              setAufgeloest(satz);
            }}
          >
            {t.nichtWeiter}
          </button>
        )}
        {/* ★ Der kleine Ausweg ohne Wertung (Johannes, 17.10.2026). Nicht nach dem
            Richtig: dann geht „Weiter" ohnehin zur nächsten Aufgabe. */}
        {stand !== "richtig" && !aufgeloest && (
          <button type="button" className="plus-knopf plus-knopf-leise plus-knopf-klein" onClick={ueberspringen}>
            {t.ueberspringen}
          </button>
        )}
        <button type="button" className="plus-knopf plus-knopf-leise ml-auto" onClick={onZurueck}>
          {t.beenden}
        </button>
      </div>
    </section>
  );
}
