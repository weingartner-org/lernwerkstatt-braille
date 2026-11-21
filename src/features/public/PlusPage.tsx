/**
 * „Plus - Rechnen im Kopf und auf der Zeile", die eigene Seite.
 *
 * Erster Ausbau (Baustufe 3 und 4 der Aufträge): eine Übung wählen und sie
 * rechnen. Noch nicht hier: der Coach („Mein Training"), Abzeichen, Spiele,
 * Statistik und das Speichern des Fortschritts auf dem Server.
 *
 * ★ Die Ausschlussregel dieser App: Was ein Kind mit Braillezeile nicht
 * gleichwertig machen kann, wird nicht gebaut. Deshalb gibt es hier keine
 * Zeitmessung, keine Rangliste, kein Ziehen mit der Maus und keine Farbe, die
 * als einzige Information etwas bedeutet.
 */
import { AKUSTIK_KNOPF_NAME } from "@/components/AkustikBausteine";
import { useEffect, useMemo, useRef, useState } from "react";
import { AppKopfzeile, unsereAltTaste } from "@/components/AppKopfzeile";
import { PlusLogo } from "@/components/PlusLogo";
import { Modal } from "@/components/Modal";
import { RechtlichesFusszeile } from "@/components/RechtlichesFusszeile";
import { PlusUebung } from "@/components/plus/PlusUebung";
import { PlusSammlung } from "@/components/plus/PlusSammlung";
import { PlusSpiele } from "@/components/plus/PlusSpiele";
import { PlusStatistik } from "@/components/plus/PlusStatistik";
import { PlusStart } from "@/components/plus/PlusStart";
import { PlusStufenwahl } from "@/components/plus/PlusStufenwahl";
import { PlusWahl } from "@/components/plus/PlusWahl";
import { PlusEinstellungen } from "@/components/plus/PlusEinstellungen";
import { AKUSTIK_TIPP, PlusAkustik } from "@/components/plus/PlusAkustik";
import { usePlusFortschritt } from "@/components/plus/usePlusFortschritt";
import { usePlusTasten } from "@/components/plus/usePlusTasten";
import { usePlusFlaeche } from "@/lib/plus/flaeche";
import { useSchriftartAnwenden } from "@/lib/typing/schriftart";
import { aktuelleRegion, useEinstellungen } from "@/lib/plus/einstellungen";
import { plusSprache } from "@/lib/plus/aktuelleSprache";
import { GEMEINSAME_KUERZEL, UNIVERSAL_SHORTCUTS } from "@/lib/shortcuts";
import { altAnzeige, istMacSystem } from "@/lib/altTaste";
import { ueberschriftSpringen } from "@/lib/arbeitsblatt/ueberschriftSprung";
import { useDeviceZeichenabstand } from "@/lib/typing/zeichenabstand";
import { meldung } from "@/lib/plus/abzeichen";
import { hinweisFuer } from "@/lib/plus/fehler";
import { sitzt, tagesnummer } from "@/lib/plus/coach";
import { neueEtappe } from "@/lib/plus/reise";
import { RUNDE, RUNDEN_BIS_RAETSEL, stelleLauf } from "@/lib/plus/coach";
import { raetselFuer } from "@/lib/plus/raetsel";
import type { Aufgabe } from "@/lib/plus/aufgabe";
import { stimmeFehltFuerSprache, useStimme } from "@/lib/plus/stimme";
import { PlusSpracheProvider, usePlusDokumentSprache, usePlusLang, usePlusTexte } from "@/lib/plus/sprache";
import { setzeTonStumm, tonIstStumm } from "@/lib/plus/ton";
import { istBeta } from "@/lib/allPrograms";
import { useReichweiteApp } from "@/lib/reichweiteApp";
import { meineKlasseHref } from "@/lib/adressen";
import { TypingAuth } from "@/components/typing/TypingAuth";
import { ChangeOwnPasswordCard } from "@/components/typing/PasswordControls";
import { anredeFuer } from "@/lib/typing/skin";
import { jahresweg, trainingsStufe } from "@/lib/plus/jahresweg";
import { PAKETE, paket } from "@/lib/plus/stoffplan";
import { braillevorgabe, festeStufe, heileBeschluss, raetselNach } from "@/lib/plus/beschluss";
import { namenFuerAlle, planFuerAlle, type UebungFuerAlle } from "@/lib/plus/lehrerUebung";
import { klasseFuer, useTypingAuth } from "@/components/typing/useTypingAuth";
import { gehoertEinerKlasse } from "@/lib/typing/account";
import { aktuelleSchulstufe } from "@/lib/typing/klassenEinstellungen";

/*
 * ★ Die Kürzel-Liste aus der GEMEINSAMEN Quelle (Johannes, 18.10.2026: „die
 * Tastenkürzel sollen möglichst einheitlich bei allen Lern-Apps sein"):
 * `GEMEINSAME_KUERZEL` für dieselben Funktionen wie in den anderen Apps,
 * `UNIVERSAL_SHORTCUTS` für das, was überall gilt (Hilfe, Liste, Konto,
 * Nachrichten, Farben, Größe, Melden), dazwischen das, was nur Plus kennt.
 * Am Mac steht „Wahl" statt „Alt" (`altAnzeige` beim Zeichnen).
 */
const PLUS_KUERZEL: [string, string][] = [
  ["Alt + B", "Eingabeart wechseln, von jeder Stelle aus: Zahlen · Computerbraille · Mathematikschrift 6 Punkt"],
  [GEMEINSAME_KUERZEL.umschaltZweimal[0], "Die Aufgabe noch einmal - und die Rechnung steht wieder im Feld"],
  [...GEMEINSAME_KUERZEL.nochmal],
  [GEMEINSAME_KUERZEL.stand[0], "Sagen, wo du gerade bist (Aufgabe 3 von 8)"],
  [...GEMEINSAME_KUERZEL.eingabefeld],
  ["Enter", "Antwort prüfen - und nach einer richtigen Antwort weitergehen"],
  ["Alt + P", "Prüfen - auch beim schriftlichen Rechnen, wo Enter eine neue Zeile macht"],
  ["Strg + Enter", "Prüfen - wie Alt + P"],
  ["⌫", "In der Brailleeingabe: die letzte Zelle löschen"],
  ["F D S  J K L", "Die sechs Punkt-Tasten (wie auf der Punktschriftmaschine)"],
  ["A  Ö", "Punkt 7 und Punkt 8 - nur in Computerbraille"],
  ["Pfeiltasten", "In den Spielen: im Gitter und am Zahlenstrahl gehen"],
  ["Enter  Leertaste", "In den Spielen: Karte aufdecken, am Zahlenstrahl ablegen"],
  [...GEMEINSAME_KUERZEL.zumFeld],
  [...GEMEINSAME_KUERZEL.ueberschrift],
  [...GEMEINSAME_KUERZEL.still],
  ["Alt + V", "Vorlesen an / aus - Sprechtempo, Lautstärke und Töne im Menü unter dem Lautsprecher"],
  [...GEMEINSAME_KUERZEL.einstellungen],
  [...GEMEINSAME_KUERZEL.statistik],
  ...UNIVERSAL_SHORTCUTS,
];

/**
 * Zurück ins Eingabefeld - nach Esc und nach dem Schließen jedes Fensters oder
 * Menüs (Hausregel). Ohne Übung gibt es kein Feld; dann steht der Fokus auf der
 * Überschrift des Bereichs, nie auf `body`.
 */
function zurueckInsFeld(): void {
  window.setTimeout(() => {
    const feld = document.getElementById("plus-eingabe");
    if (feld) { feld.focus(); return; }
    const ueberschrift = document.querySelector<HTMLElement>("main h2, main h1");
    if (ueberschrift && document.activeElement === document.body) {
      if (!ueberschrift.hasAttribute("tabindex")) ueberschrift.setAttribute("tabindex", "-1");
      ueberschrift.focus();
    }
  }, 0);
}

/** Wo das Kind gerade steht. Die beiden Türen des Coach-Dokuments. */
type Tuer = "start" | "wahl" | "training" | "sammlung" | "spiele" | "zahlen";

/**
 * ★ Ein Konto, ein Stand. Plus liest seinen Fortschritt beim Öffnen für das
 * Konto, das gerade angemeldet ist. Meldet sich jemand in der Kopfzeile an
 * oder ab, beginnt die Seite neu - sonst rechnete das neue Kind im Stand des
 * vorigen weiter (oder im Stand des Browsers).
 */
export function PlusPage() {
  // Reichweite + Übezeit-Topf (13.11.2026, Johannes: „in der Statistik fehlt die
  // Mathe-App Plus"): Plus meldete als einzige Lernapp keinen Besuch - der Server
  // kannte den Schlüssel "plus" seit 22.09., bekam aber nie eine Zeile. Sitzt hier,
  // VOR dem Konto-Schlüssel, damit ein Kontowechsel keinen zweiten Besuch zählt.
  useReichweiteApp("plus");
  const kontoId = useTypingAuth((s) => s.account?.id ?? "");
  // ★ Der Sprach-Provider sitzt AUSSERHALB des Schlüssels: Ein Kontowechsel startet die Seite
  // neu, nicht die Sprachwahl. Ohne Probe-Schalter `?plus-sprachen=1` fügt er nichts ein.
  return (
    <PlusSpracheProvider>
      <PlusSeite key={kontoId} />
    </PlusSpracheProvider>
  );
}

function PlusSeite() {
  // ★ Testerin 10.11.2026 (JAWS): `<html lang>` = Plus-Sprache mit Region, solange Plus offen ist.
  usePlusDokumentSprache();
  const lang = usePlusLang();
  const texte = usePlusTexte();
  const ts = texte.seite;
  // ★ Was nur Deutsch kann: Rätsel, Reise (Etappen-Meldungen), Abzeichen, Spiele, Sammlung,
  // Statistik und die Hinweise zu Denkfehlern sind noch nicht übersetzt - in anderen
  // Sprachen erscheinen sie nicht (nie deutsch in einer fremden Oberfläche).
  const deutsch = texte.sprache === "de";
  const [tuer, setTuer] = useState<Tuer>("start");
  const [stufe, setStufe] = useState<number | null>(null);
  const [paketId, setPaketId] = useState<string | null>(null);
  const [plan, setPlan] = useState<string[] | null>(null);
  // ★ Die Eingabeart kommt aus dem Store - in den Einstellungen festgelegt,
  // mit Alt + B unterwegs gewechselt.
  const art = useEinstellungen((s) => s.eingabeart);
  const setArt = useEinstellungen((s) => s.setEingabeart);
  const braillezeile = useEinstellungen((s) => s.braillezeile);
  const setBraillezeile = useEinstellungen((s) => s.setBraillezeile);
  const brailleSchrift = useEinstellungen((s) => s.schrift);
  const setBrailleSchrift = useEinstellungen((s) => s.setSchrift);
  const eingabeweg = useEinstellungen((s) => s.eingabe);
  const brailleBreite = useEinstellungen((s) => s.breite);
  const setBrailleBreite = useEinstellungen((s) => s.setBreite);
  const vorgabe = useEinstellungen((s) => s.vorgabe);
  const zoomIndex = useEinstellungen((s) => s.zoomIndex);
  const setZoomIndex = useEinstellungen((s) => s.setZoomIndex);
  // Land/Region (nur es und fr): die Wahl des Kindes - ohne Wahl die Vorgabe aus der Browser-Sprache.
  const setRegion = useEinstellungen((s) => s.setRegion);
  useEinstellungen((s) => s.region); // neu zeichnen, wenn gewählt wird
  const zeichenabstand = useDeviceZeichenabstand((s) => s.faktor);
  const setZeichenabstand = useDeviceZeichenabstand((s) => s.setFaktor);
  const [hilfe, setHilfe] = useState(false);
  const [einstellungen, setEinstellungen] = useState(false);
  const ersteEinstellung = useRef<HTMLButtonElement>(null);
  /**
   * ★ Jeder Weg aus den Einstellungen - Escape, Alt + O, das Zahnrad, „Zurück
   * zum Rechnen" - führt zurück ins Eingabefeld, wenn gerade gerechnet wird
   * (R1-R6). `Modal` gibt den Fokus beim Schließen an das Zahnrad zurück; der
   * Sprung ins Feld kommt einen Takt danach und gewinnt. Ohne Übung bleibt
   * er beim Zahnrad.
   */
  const schliesseEinstellungen = () => {
    setEinstellungen(false);
    window.setTimeout(() => document.getElementById("plus-eingabe")?.focus(), 0);
  };
  const schliesseEinstellungenRef = useRef(schliesseEinstellungen);
  schliesseEinstellungenRef.current = schliesseEinstellungen;
  const [tonAn, setTonAn] = useState(() => !tonIstStumm());
  const [kuerzel, setKuerzel] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showPasswort, setShowPasswort] = useState(false);
  /** Zählt die Läufe - ein neuer Lauf ist eine neue Übung, nicht die alte weiter. */
  const [laufNr, setLaufNr] = useState(0);
  /** Die Übung für alle, die gerade läuft - sonst `null`. */
  const [fuerAlleLauf, setFuerAlleLauf] = useState<UebungFuerAlle | null>(null);
  /**
   * Das Rätsel nach DIESER Runde - oder keines. Entschieden beim Start der
   * Runde, nicht an ihrem Ende: Am Ende hat der Zähler schon weitergezählt.
   */
  const [raetsel, setRaetsel] = useState<Aufgabe | null>(null);
  /** Die Etappe, in der die laufende Trainingsrunde begann - sie wandert während der Runde nicht. */
  const [laufWeg, setLaufWeg] = useState<{ nr: number; gesamt: number; name: string } | null>(null);
  const stimme = useStimme();
  usePlusTasten(stimme.ansagen);
  /*
   * ★ Alt + O, Alt + H und Alt + V (17.10.2026). Die Kürzelliste versprach sie
   * seit dem 12.10. - verdrahtet waren sie nie; gemessen im Browser: Alt + O
   * tat nichts. Dieselbe Wache wie die Kopfzeile (`unsereAltTaste`): Das
   * eigene Fenster schließt sich mit seiner Taste, ein fremdes macht sie taub.
   */
  const einstellungenRef = useRef(false);
  einstellungenRef.current = einstellungen;
  const hilfeRef = useRef(false);
  hilfeRef.current = hilfe;
  const stimmeRef = useRef(stimme);
  stimmeRef.current = stimme;
  useEffect(() => {
    const taste = (e: KeyboardEvent) => {
      if (unsereAltTaste(e, "KeyO", einstellungenRef.current)) {
        e.preventDefault();
        if (einstellungenRef.current) schliesseEinstellungenRef.current();
        else setEinstellungen(true);
      } else if (unsereAltTaste(e, "KeyH", hilfeRef.current)) {
        e.preventDefault();
        setHilfe(!hilfeRef.current);
      } else if (unsereAltTaste(e, "KeyV")) {
        e.preventDefault();
        stimmeRef.current.umschalten();
      } else if (unsereAltTaste(e, "KeyE")) {
        // ★ Alt + E - ins Eingabefeld, wie in Tastenflow, Punktgenau und
        // Klangpunkte (Johannes, 18.10.2026).
        const feld = document.getElementById("plus-eingabe");
        if (feld) {
          e.preventDefault();
          feld.focus();
        }
      } else if (unsereAltTaste(e, "KeyG")) {
        // ★ Alt + G - zur nächsten Überschrift, wie in den anderen Lern-Apps.
        // Gemeldet mit der Stimme von Plus (sie spricht nur, wenn sie an ist).
        e.preventDefault();
        ueberschriftSpringen({ melden: (t) => stimmeRef.current.ansagen(t), mitteRollen: true });
      }
    };
    // ★ Esc führt zurück ins Eingabefeld (Hausregel aller Lern-Apps) - wenn
    // nichts anderes die Taste gebraucht hat (Fenster und Menüs schließen
    // sich selbst und fangen sie vorher ab).
    const esc = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || e.defaultPrevented) return;
      if (document.querySelector('[role="dialog"][aria-modal="true"]')) return;
      zurueckInsFeld();
    };
    window.addEventListener("keydown", esc);
    window.addEventListener("keydown", taste);
    return () => {
      window.removeEventListener("keydown", taste);
      window.removeEventListener("keydown", esc);
    };
  }, []);
  // Das Grün des Zeichens, solange Plus offen ist - und die Schrift im Übungsfeld
  // (Tastenflow-Schriftwahl; Plus bietet zusätzlich die Schrift gleicher Breite).
  usePlusFlaeche();
  useSchriftartAnwenden(true);

  /**
   * Favicon und Manifest auf Plus umstellen, solange diese Seite offen ist -
   * wie bei den Geschwistern. Beim Verlassen wird das Sensorik-Zeichen
   * zurückgesetzt, sonst trüge die ganze Plattform das Plus.
   *
   * ★ Das `?v=` bleibt dasselbe wie in `index.html`; wer eine Zahl ändert,
   * ändert sie an beiden Stellen, sonst lädt der Browser zwei Fassungen.
   */
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "manifest";
    link.href = "/plus-manifest.json";
    document.head.appendChild(link);
    const icons = Array.from(
      document.querySelectorAll<HTMLLinkElement>(
        'link[rel="icon"], link[rel="apple-touch-icon"]',
      ),
    );
    for (const el of icons) {
      el.href = el.href.includes(".svg")
        ? "/plus-logo.svg?v=4"
        : "/plus-logo-180.png?v=4";
    }
    return () => {
      document.head.removeChild(link);
      for (const el of icons) {
        el.href = el.href.includes(".svg") ? "/logo.svg?v=5" : "/logo-180.png?v=5";
      }
    };
  }, []);
  const fort = usePlusFortschritt();

  /*
   * ★★★ DIE SCHULSTUFE EINES KLASSENKINDES BESTIMMT DIE KLASSE (Johannes,
   * 23.09.2026): „wenn es Teil einer Klasse ist, bestimmt die Schulstufe die
   * Klasseneinstellung, wer selbst lernt, darf wählen". Die Regel selbst -
   * samt der drei Fälle, die die Klasse allein nicht beantwortet - steht in
   * `lib/plus/beschluss.ts` (`festeStufe`). Hier wird sie nur gefragt.
   *
   * Die Klasse kommt über `klasseFuer` - denselben Weg wie in Tastenflow, mit
   * derselben Zeitgrenze: Hängt das Schulnetz, geht es nach drei Sekunden
   * ohne Klassenwert weiter, statt das Kind vor einer leeren Seite warten zu
   * lassen.
   */
  const konto = useTypingAuth((s) => s.account);
  const logout = useTypingAuth((s) => s.logout);
  const istLehrkraft = konto?.role === "lehrkraft";
  const inKlasse = gehoertEinerKlasse(konto);
  const [klassenStufe, setKlassenStufe] = useState<number | null>(null);
  useEffect(() => {
    let lebt = true;
    if (!inKlasse) { setKlassenStufe(null); return; }
    void klasseFuer(konto).then((cls) => { if (lebt) setKlassenStufe(aktuelleSchulstufe(cls)); });
    return () => { lebt = false; };
  }, [konto, inKlasse]);
  const beschluss = konto?.plusBeschluss;
  const feste = festeStufe(inKlasse, klassenStufe, heileBeschluss(beschluss));
  /*
   * ★ Die Einstellungen der Klasse (Johannes, 16.10.2026) - nur für Kinder in
   * einer Klasse; wer selbst lernt, hat alles wie immer. Regel und Fälle:
   * `KlassenEinstellung` in `lib/plus/beschluss.ts`.
   */
  const klasse = inKlasse ? heileBeschluss(beschluss).klasse ?? {} : {};
  /*
   * ★ Braillezeile, Schrift und Zeilenbreite, die die Lehrkraft festlegt (Johannes,
   * 19.10.2026): sie überdecken die eigene Wahl des Kindes, solange sie dastehen.
   */
  const setVorgabe = useEinstellungen((s) => s.setVorgabe);
  const vorgabeSchluessel = JSON.stringify(braillevorgabe(inKlasse, heileBeschluss(beschluss)));
  useEffect(() => {
    setVorgabe(JSON.parse(vorgabeSchluessel));
    return () => setVorgabe({});
  }, [vorgabeSchluessel, setVorgabe]);

  /*
   * ★ Die Kopfzeile nennt den Bereich, in dem das Kind ist. In „Ich wähle"
   * stand hier bis 23.09.2026 „Start", solange noch keine Stufe gewählt war -
   * und mit fester Stufe der Klasse wird gar keine mehr gewählt.
   */
  const wahlStufe = feste ?? stufe;
  const bereich = fuerAlleLauf ? ts.bereichFuerAlle
    : tuer === "zahlen" ? "Meine Statistik"
    : tuer === "spiele" ? "Spiele"
    : tuer === "sammlung" ? "Meine Sammlung"
    : plan ? ts.bereichTraining
    : paketId ? paket(paketId).name
    : tuer === "wahl" ? (wahlStufe ? texte.stufe(wahlStufe) : ts.bereichWahl)
    : ts.bereichStart;

  /*
   * ★ Die Beschlüsse der Lehrkraft je Übung übernehmen - sobald der
   * Fortschritt da ist, und nur für DASSELBE Konto: Plus liest seinen Stand
   * über `aktuellesKonto()`, die Anmeldung kommt aus `useTypingAuth`. Weichen
   * die beiden je voneinander ab (Konto gewechselt), wird nichts übernommen.
   */
  const { geladen, uebernimmBeschluss, konto: fortKonto } = fort;
  useEffect(() => {
    if (geladen && konto && konto.id === fortKonto) uebernimmBeschluss(beschluss);
  }, [geladen, konto, fortKonto, beschluss, uebernimmBeschluss]);


  /**
   * ★ Nach jeder dritten Runde ein Rätsel (Johannes, 26.09.2026). Gezählt wird
   * über beide Türen: Wer zwei Runden „Ich wähle" und eine Runde Training
   * rechnet, hat drei Runden gerechnet.
   */
  const bereiteRunde = (stufeDerRunde: number) => {
    const f = fort.fortschritt;
    const alle = deutsch ? raetselNach(klasse, RUNDEN_BIS_RAETSEL) : null;
    const faellig = alle !== null && (f.runden + 1) % alle === 0;
    setRaetsel(faellig ? raetselFuer(stufeDerRunde, Math.random, f.raetsel) : null);
  };
  const raetselAlle = deutsch ? raetselNach(klasse, RUNDEN_BIS_RAETSEL) : null;
  const rundenBisRaetsel = raetselAlle === null
    ? undefined
    : raetselAlle - (fort.fortschritt.runden % raetselAlle);
  const raetselEnde = (ende: string, r: Aufgabe) => fort.merkeRaetsel(r.angabe, ende === "geloest");

  // „Mein Training": der Coach mischt, wir zeigen nur an.
  const starteTraining = (nr: number) => {
    const lauf = stelleLauf(fort.fortschritt.stand, { stufe: nr, anzahl: RUNDE });
    bereiteRunde(nr);
    const startWeg = jahresweg(fort.fortschritt.stand, nr);
    setLaufWeg(startWeg.etappe ? { nr: startWeg.etappe.nr, gesamt: startWeg.gesamt, name: startWeg.etappe.name } : null);
    fort.quittiere();
    setStufe(nr);
    setPlan(lauf.pakete);
    setLaufNr((n) => n + 1);
    // Nach dem Lauf geht es zurück auf den Start - dort steht, wie weit der
    // Weg ist. Nicht zurück in die Stufenwahl: gewählt ist schon.
    setTuer("start");
    fort.merkeStufe(nr);
  };

  /*
   * ★ „Mein Training" geht immer weiter (Johannes, 23.09.2026). Gefragt wird
   * nur einmal, beim allerersten Mal, und nur wer selbst lernt - danach geht
   * es in der Stufe weiter, in der das Kind war. Sitzt die ganze Stufe, geht
   * es in die nächste (`trainingsStufe`). Ein Klassenkind bleibt in der Stufe
   * der Klasse.
   */
  const basisStufe = feste ?? fort.fortschritt.stufe;
  const wegStufe = basisStufe !== null
    ? trainingsStufe(fort.fortschritt.stand, basisStufe, feste !== null)
    : null;
  const weg = wegStufe !== null ? jahresweg(fort.fortschritt.stand, wegStufe) : null;
  const weiterImTraining = () => (wegStufe !== null ? starteTraining(wegStufe) : setTuer("training"));

  const zurueck = () => { fort.sichere(); fort.quittiere(); setPaketId(null); setPlan(null); setFuerAlleLauf(null); };

  /*
   * ★ Die Übung für alle (Johannes, 28.09.2026) - von der Lehrkraft gestartet,
   * für jedes Kind dieselben Aufgaben. Sie steht im Beschluss des Kontos und
   * kommt über `kontoBeobachten` in etwa einer Sekunde an, auch wenn Plus
   * schon offen ist. Regel und Begründung: `lib/plus/lehrerUebung.ts`.
   */
  const fuerAlle = inKlasse ? heileBeschluss(beschluss).fuerAlle ?? null : null;
  const fuerAlleOffen = fuerAlle && fort.geladen && !fort.fortschritt.fuerAlleFertig.includes(fuerAlle.id)
    ? fuerAlle
    : null;
  /*
   * ★ Kommt sie, während das Kind schon auf dem Start steht, sagt es EIN Satz
   * in der einen Live-Region der Seite. Eine Karte, die still auftaucht, gibt
   * es für ein Kind mit Screenreader nicht. Beim Öffnen von Plus kein Satz -
   * dann liest das Kind die Karte ohnehin als Erstes.
   */
  const [fuerAlleSatz, setFuerAlleSatz] = useState("");
  const fuerAlleGesehen = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    if (!fort.geladen) return;
    const id = fuerAlleOffen?.id ?? null;
    if (fuerAlleGesehen.current !== undefined && id && id !== fuerAlleGesehen.current) {
      setFuerAlleSatz(ts.fuerAlleGestartet);
    }
    fuerAlleGesehen.current = id;
  }, [fort.geladen, fuerAlleOffen?.id]);

  const starteFuerAlle = () => {
    if (!fuerAlleOffen) return;
    fort.quittiere();
    setFuerAlleSatz("");
    // ★ Kein Rätsel in der Übung für alle: Sie soll bei allen gleich sein.
    setRaetsel(null);
    setPaketId(null);
    setPlan(null);
    setFuerAlleLauf(fuerAlleOffen);
    setLaufNr((n) => n + 1);
    setTuer("start");
  };

  /**
   * ★ Eine neue Übung beginnt mit leerer Meldezeile. Sonst stünde das
   * Abzeichen des letzten Laufs noch da - und die Sprachausgabe läse es bei
   * jeder Antwort mit, weil sich der Inhalt der Live-Region ändert.
   */
  const starteUebung = (id: string) => {
    fort.quittiere();
    bereiteRunde(Number(id.split("-")[0]) || 1);
    setPaketId(id);
    setLaufNr((n) => n + 1);
  };

  /** Das Wochenziel, das gilt: das der Lehrkraft, sonst das eigene. */
  const wochenzielWirksam = klasse.wochenziel
    ? { ...fort.fortschritt.wochenziel, ziel: klasse.wochenziel }
    : fort.fortschritt.wochenziel;

  const abzeichenMeldung = deutsch ? fort.neue.map((id) => meldung(id)).join(" ") : "";

  /*
   * ★ Die Reise (16.10.2026): Eine Etappe ist ein Paket, das jetzt sitzt. Beim
   * Start jeder Runde wird gemerkt, was schon saß; am Ende der Runde ist die
   * Etappe das, was neu dazukam (`lib/plus/reise.ts`).
   */
  const sitztJetzt = useMemo(
    () => new Set(PAKETE.filter((p) => sitzt(fort.fortschritt.stand, p.id)).map((p) => p.id)),
    [fort.fortschritt.stand],
  );
  const sitztVorLauf = useRef<ReadonlySet<string>>(sitztJetzt);
  useEffect(() => {
    sitztVorLauf.current = sitztJetzt;
    // Gemerkt wird nur beim START einer Runde - nie bei jeder Änderung des Stands.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [laufNr, paketId, plan, fuerAlleLauf]);
  const etappe = deutsch ? neueEtappe(sitztVorLauf.current, sitztJetzt) : null;

  const hinweisZu = (aufgabe: Parameters<typeof hinweisFuer>[1], eingabe: string) =>
    (deutsch ? hinweisFuer(fort.fortschritt.vermutungen, aufgabe, eingabe, tagesnummer()) : "");

  return (
    // ★ `px-4 py-6` wie Punktgenau und Klangpunkte (Johannes, 25.09.2026:
    // „die Kopfzeile klebt immer noch total oben, schau das einfach von den
    // anderen Apps ab"). Ohne `py-6` stiess sie an den Fensterrand.
    <div className="min-h-screen bg-surface px-4 py-6">
      {/* ★ So breit wie Tastenflow (Johannes, 17.10.2026: „die ganze Seite breiter").
          Bis dahin 60 rem - die Kopfzeile wurde dadurch früh zweizeilig. */}
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-4">
          <AppKopfzeile
            titel="Plus"
            // ★ Esc in Konto-, Farb- und Klang-Menü führt zurück ins Eingabefeld (Hausregel).
            escAfterClose={zurueckInsFeld}
            // ★ Johannes, 17.10.2026: ein Strich zwischen Sensorik und dem Plus-Zeichen,
            // der Titel mittig im übrigen Platz.
            trennstrich
            zeichen={<PlusLogo beschreibung={texte.logoBeschreibung} className="h-9 w-9" />}
            bereich={bereich}
            beta={istBeta("plus")}
            onHilfe={() => setHilfe(true)}
            onKurztasten={() => setKuerzel((v) => !v)}
            kurztastenOffen={kuerzel}
            onZumProgramm={() => { zurueck(); setTuer("start"); setShowAuth(false); }}
            account={
              konto
                ? {
                    id: konto.id,
                    name: konto.name,
                    classCode: konto.classCode,
                    istLehrkraft,
                    selbstlernend: !!konto.selfManaged,
                  }
                : null
            }
            onAbmelden={() => { zurueck(); logout(); setTuer("start"); }}
            onAnmelden={() => setShowAuth(true)}
            onPasswort={konto ? () => setShowPasswort(true) : undefined}
            // „Meine Statistik" im Konto-Menü (Johannes 23.09.2026: „Statistik
            // gehört ins Benutzerkonto") - derselbe Platz wie in Tastenflow
            // und Punktgenau. Eine Lehrkraft sieht die Zahlen ihrer Kinder
            // in „Meine Klassen".
            onStatistik={deutsch && konto && !istLehrkraft ? () => { zurueck(); setTuer("zahlen"); } : undefined}
            klasseHref={meineKlasseHref("plus")}
            onVorlesen={stimme.umschalten}
            vorlesenAn={stimme.an}
            // ★ Johannes, 17.10.2026: unter dem Lautsprecher ein Menü mit allen
            // Akustik-Einstellungen. Dieselben Zustände wie im Einstellungsfenster.
            akustikMenue={{
              tipp: AKUSTIK_TIPP,
              name: AKUSTIK_KNOPF_NAME, // ★ in allen Apps gleich (Johannes, 18.10.2026)
              inhalt: (
                <PlusAkustik
                  vorlesen={stimme.an}
                  onVorlesen={stimme.umschalten}
                  toene={tonAn}
                  onToene={() => { setzeTonStumm(tonAn); setTonAn(!tonAn); }}
                />
              ),
            }}
            // Ein Fenster geht auf, es klappt nicht auf - darum ohne
            // `einstellungenOffen`: Die Kopfzeile setzt dann `aria-haspopup="dialog"`.
            onEinstellungen={() => (einstellungen ? schliesseEinstellungen() : setEinstellungen(true))}
          />
        </div>

        {/* ★ Die Einstellungen sind ein eigenes Fenster (Johannes, 17.10.2026:
            „wie bei Tastenflow, nicht den Inhalt nach unten schieben"). Bis
            dahin klappten sie über der Übung auf und schoben das Eingabefeld
            unter den Bildschirmrand - es sah aus, als wäre es weg. `Modal`
            bringt Escape, Fokusfalle und „Zurück zum Rechnen" mit. */}
        {einstellungen && (
          <Modal
            title={ts.einstellungen}
            size="xl"
            onClose={schliesseEinstellungen}
            initialFocus={ersteEinstellung}
            zurueck={ts.einstellungenZurueck}
          >
            <PlusEinstellungen
              ersterRef={ersteEinstellung}
              braillezeile={braillezeile}
              onBraillezeile={setBraillezeile}
              schrift={brailleSchrift}
              onSchrift={setBrailleSchrift}
              eingabe={eingabeweg}
              breite={brailleBreite}
              onBreite={setBrailleBreite}
              vorgabe={vorgabe}
              zoomIndex={zoomIndex}
              onZoomIndex={setZoomIndex}
              zeichenabstand={zeichenabstand}
              onZeichenabstand={setZeichenabstand}
              ausschreiben={stimme.ausschreiben}
              onAusschreiben={(an) => { if (an !== stimme.ausschreiben) stimme.ausschreibenUmschalten(); }}
              region={aktuelleRegion()}
              onRegion={(r) => { const sp = plusSprache(); if (sp === "es" || sp === "fr") setRegion(sp, r); }}
            />
          </Modal>
        )}

        {kuerzel && (
          <ul className="m-0 mb-4 list-none space-y-1.5 rounded border border-hairline p-3 text-sm">
            {(ts.kuerzel ?? PLUS_KUERZEL).map(([k, l]) => (
              <li key={k} className="flex flex-wrap items-baseline gap-x-2">
                <kbd className="whitespace-nowrap rounded border border-hairline bg-surface-sunken px-1.5 py-0.5 font-mono text-xs text-ink">
                  {altAnzeige(k)}
                </kbd>
                <span className="text-ink-muted">- {altAnzeige(l)}</span>
              </li>
            ))}
            {/* Am Mac steht „Wahl" schon in der Liste; sonst erklärt die Fußnote. */}
            {!istMacSystem() && (
              <li className="pt-1 text-ink-muted">{ts.macHinweis ?? "Auf dem Mac heißt die Alt-Taste Wahltaste (⌥)."}</li>
            )}
          </ul>
        )}

        {/* ★ GENAU EINE Live-Region in Plus, und nie zwei gleichzeitig.
            Eine Blitzmeldung verdrängt auf der Braillezeile etwa vier Sekunden
            lang, was unter den Fingern liegt; zwei Regionen verdrängen sie
            zweimal. Während einer Übung trägt der Lauf die Meldung - dort
            steht das Kind. Sonst steht sie hier. Gemessen am 23.09.2026: die
            Seite hatte drei. */}
        {!paketId && !plan && !fuerAlleLauf && tuer !== "spiele" && !(showAuth && !konto) && (
          <p role="status" lang={lang} className="min-h-6 text-ink">
            {abzeichenMeldung || fuerAlleSatz || (!deutsch && stimme.an && stimmeFehltFuerSprache() ? ts.stimmeFehlt : "")}
          </p>
        )}

        <main className="pb-8">
          {showAuth && !konto ? (
            <TypingAuth onCancel={() => setShowAuth(false)} />
          ) : fuerAlleLauf ? (
            <PlusUebung
              key={`fuer-alle-${fuerAlleLauf.id}-${laufNr}`}
              plan={planFuerAlle(fuerAlleLauf)}
              saat={fuerAlleLauf.saat}
              titel={ts.bereichFuerAlle}
              art={art}
              onArt={setArt}
              ansagen={stimme.ansagen}
              vorlesen={stimme.an}
              onAntwort={fort.merkeAntwort}
              hinweisZu={hinweisZu}
              zusatzmeldung={abzeichenMeldung}
              etappe={etappe}
              onBesonderes={fort.merkeBesonderes}
              rechenwegErlaubt={klasse.rechenweg !== false}
              ausschreiben={stimme.ausschreiben}
              onFertig={(richtige, gesamt) => {
                fort.merkeFuerAlleFertig(fuerAlleLauf.id);
                const plan = planFuerAlle(fuerAlleLauf);
                const haeufigstes = plan
                  .map((id) => [id, plan.filter((x) => x === id).length] as const)
                  .sort((a, b) => b[1] - a[1])[0]?.[0];
                if (haeufigstes) fort.merkeLauf(haeufigstes, richtige, gesamt);
              }}
              onZurueck={zurueck}
            />
          ) : plan ? (
            <PlusUebung
              key={laufNr}
              plan={plan}
              titel={ts.bereichTraining}
              art={art}
              onArt={setArt}
              ansagen={stimme.ansagen}
              vorlesen={stimme.an}
              onAntwort={fort.merkeAntwort}
              hinweisZu={hinweisZu}
              zusatzmeldung={abzeichenMeldung}
              etappe={etappe}
              onBesonderes={fort.merkeBesonderes}
              rechenwegErlaubt={klasse.rechenweg !== false}
              wegzeile={laufWeg}
              rundenAlleRaetsel={raetselAlle ?? undefined}
              ausschreiben={stimme.ausschreiben}
              onFertig={(richtige, gesamt) => {
                // Im Training gehört jedes Paket zu sich selbst - der Coach
                // verbucht den Lauf beim Paket, das am häufigsten drankam.
                const haeufigstes = plan
                  .map((id) => [id, plan.filter((x) => x === id).length] as const)
                  .sort((a, b) => b[1] - a[1])[0]?.[0];
                if (haeufigstes) fort.merkeLauf(haeufigstes, richtige, gesamt);
              }}
              onNaechsteRunde={weiterImTraining}
              raetsel={raetsel}
              onRaetselEnde={raetselEnde}
              rundenBisRaetsel={rundenBisRaetsel}
              onZurueck={zurueck}
            />
          ) : paketId ? (
            <PlusUebung
              key={`${paketId}-${laufNr}`}
              paketId={paketId}
              art={art}
              onArt={setArt}
              ansagen={stimme.ansagen}
              vorlesen={stimme.an}
              onAntwort={fort.merkeAntwort}
              hinweisZu={hinweisZu}
              zusatzmeldung={abzeichenMeldung}
              etappe={etappe}
              onBesonderes={fort.merkeBesonderes}
              rechenwegErlaubt={klasse.rechenweg !== false}
              ausschreiben={stimme.ausschreiben}
              onFertig={(richtige, gesamt) => fort.merkeLauf(paketId, richtige, gesamt)}
              // ★ Auch hier Runde um Runde mit neuen Aufgaben - früher begann
              // „Noch ein Durchgang" dieselben zwölf von vorn.
              onNaechsteRunde={() => starteUebung(paketId)}
              raetsel={raetsel}
              onRaetselEnde={raetselEnde}
              rundenBisRaetsel={rundenBisRaetsel}
              rundenAlleRaetsel={raetselAlle ?? undefined}
              onZurueck={zurueck}
            />
          ) : tuer === "wahl" ? (
            <PlusWahl
              stufe={feste ?? stufe}
              feste={feste !== null}
              onStufe={setStufe}
              onPaket={starteUebung}
              onZurueck={() => { setStufe(null); setTuer("start"); }}
            />
          ) : tuer === "zahlen" ? (
            <PlusStatistik fortschritt={fort.fortschritt} onZurueck={() => setTuer("start")} />
          ) : tuer === "spiele" ? (
            <PlusSpiele
              stufe={feste ?? fort.fortschritt.stufe ?? 3}
              ansagen={stimme.ansagen}
              art={art}
              onArt={setArt}
              onAntwort={fort.merkeAntwort}
              onZurueck={() => setTuer("start")}
            />
          ) : tuer === "sammlung" ? (
            <PlusSammlung
              stand={fort.fortschritt.stand}
              stufe={feste ?? fort.fortschritt.stufe}
              gefunden={fort.gefunden}
              wochenziel={wochenzielWirksam}
              wochenzielVonLehrkraft={!!klasse.wochenziel}
              chronik={fort.fortschritt.chronik}
              onWochenziel={fort.merkeWochenziel}
              onZurueck={() => setTuer("start")}
            />
          ) : tuer === "training" ? (
            <PlusStufenwahl
              titel={texte.stufenwahl.trainingTitel}
              hinweis={texte.stufenwahl.trainingHinweis}
              onStufe={starteTraining}
              onZurueck={() => setTuer("start")}
            />
          ) : (
            <PlusStart
              name={konto?.name}
              angemeldet={!!konto}
              gerechnet={fort.fortschritt.gerechnet}
              weg={weg}
              gefunden={deutsch ? fort.gefunden : []}
              wochenziel={wochenzielWirksam}
              freieWahl={klasse.freieWahl !== false}
              spiele={deutsch && klasse.spiele !== false}
              sammlung={deutsch}
              onWahl={() => setTuer("wahl")}
              onTraining={weiterImTraining}
              onSammlung={() => setTuer("sammlung")}
              onSpiele={() => setTuer("spiele")}
              onAnmelden={() => setShowAuth(true)}
              fuerAlle={fuerAlleOffen ? { namen: namenFuerAlle(fuerAlleOffen), anzahl: fuerAlleOffen.anzahl } : null}
              onFuerAlle={starteFuerAlle}
            />
          )}
        </main>

        {hilfe && (
          <Modal title={ts.hilfeTitel} onClose={() => { setHilfe(false); zurueckInsFeld(); }}>
            {ts.hilfe ? (
              <div className="space-y-3 text-ink">
                {ts.hilfe.map((absatz, i) => <p key={i}>{altAnzeige(absatz)}</p>)}
              </div>
            ) : (
            <div className="space-y-3 text-ink">
              <p>
                <strong>Mein Training</strong> führt dich durch den Stoff deiner Schulstufe.
                Etappe für Etappe, immer weiter.
              </p>
              <p>
                Außerdem: <strong>Ich wähle</strong> (eine Übung aussuchen), <strong>Spiele</strong>
                {" "}und <strong>Meine Sammlung</strong>. Deine Zahlen stehen im Konto-Menü rechts oben.
              </p>
              <p>
                Eine Runde hat acht Aufgaben. Nach jeder dritten Runde kommt ein Rätsel.
                Du kannst es lösen oder überspringen. Kein Zeitdruck, keine Uhr.
              </p>
              <p>
                {altAnzeige("Du kannst die Antwort als Zahl tippen oder in Braille greifen. Alt + B wechselt zwischen")}
                {" "}Zahlen, Computerbraille und der Mathematikschrift mit sechs Punkten.
              </p>
              <p>
                Die Rechnung steht schon im Feld. Du schreibst in die Lücke oder hinter das =.
                {" "}{altAnzeige("Beim schriftlichen Rechnen macht Enter eine neue Zeile, Alt + P prüft.")}
                {" "}Ist die Rechnung weg: zweimal Umschalt sagt die Aufgabe noch einmal und stellt
                die Rechnung wieder ins Feld. {altAnzeige("Alt + W sagt die Aufgabe noch einmal, Alt + Z sagt, wo du gerade bist, Alt + E bringt dich ins Feld.")}
              </p>
              <p>
                Mit „Aufgabe überspringen" geht es zur nächsten Aufgabe. Eine übersprungene
                Aufgabe zählt nicht - weder richtig noch falsch.
              </p>
              <p>
                In der Brailleeingabe steht im Feld das, was du gegriffen hast. Was Plus daraus liest,
                steht darunter.
              </p>
              <p>
                Beim schriftlichen Rechnen kannst du dir den Rechenweg zeigen lassen - Schritt
                für Schritt, so oft du willst.
              </p>
              <p>
                {altAnzeige("Mit Alt + V liest Plus dir alles vor.")} Strg macht sofort still. Der Lautsprecher in der
                Kopfzeile öffnet ein Menü: Dort stellst du Sprechtempo, Lautstärke und Töne ein.
              </p>
            </div>
            )}
          </Modal>
        )}

        {showPasswort && konto && (
          <Modal title={ts.passwortTitel} onClose={() => { setShowPasswort(false); zurueckInsFeld(); }}>
            <ChangeOwnPasswordCard
              minLen={istLehrkraft ? 6 : 4}
              tone={anredeFuer(konto) === "Sie" ? "sie" : "du"}
              immerOffen
              onErfolg={() => setShowPasswort(false)}
            />
          </Modal>
        )}

        <RechtlichesFusszeile unterstuetzenApp="plus" />
      </div>
    </div>
  );
}
