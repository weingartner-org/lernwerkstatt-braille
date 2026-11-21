import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AKUSTIK_KNOPF_NAME } from "@/components/AkustikBausteine";
import { BRAILLE_AKUSTIK_TIPP } from "@/components/braille/BrailleAkustik";
import { KlangpunkteAkustik } from "@/components/klangpunkte/KlangpunkteAkustik";
import { meineKlasseHref } from "@/lib/adressen";
import { Link } from "react-router-dom";
import { AppKopfzeile } from "@/components/AppKopfzeile";
import { KlangpunkteLogo } from "@/components/KlangpunkteLogo";
import { ChangeOwnPasswordCard } from "@/components/typing/PasswordControls";
import { Modal } from "@/components/Modal";
import { Klangpunkte } from "@/components/klangpunkte/Klangpunkte";
import { OHNE_KLASSE_HILFE } from "@/components/lernwerkstatt/SchuelerAnmeldung";
import { BrailleAuth } from "@/components/braille/BrailleAuth";
import { useBrailleAuth } from "@/components/braille/useBrailleAuth";
import { useBrailleA11y } from "@/lib/braille/a11y";
import { useBraillePlay } from "@/lib/braille/play";
import { primeSpeech, useVoice } from "@/lib/braille/voice";
import { sprich, sprichImmer, sprichDann } from "@/lib/klangpunkte/sprechen";
import { KlangSpracheProvider, klangSprache, useKlangTexte } from "@/lib/klangpunkte/sprache";
import type { KlangTexte } from "@/lib/klangpunkte/texte";
// ★ NUR DER WORTLAUT, NICHT DIE STIMME (31.08.2026) - siehe denselben Vermerk
// in `PunktgenauPage.tsx`. `ansageGewaehlt` ist eine reine Textfunktion
// („<was> gewählt."); gesprochen wird sie mit `speakUi` aus
// `lib/braille/voice`, also mit dem An/Aus-Schalter DIESER App.
import { ansageGewaehlt, type AnsageSprache } from "@/lib/ansageGewaehlt";
import { GEMEINSAME_KUERZEL, istNormalgroesseTaste, zoomKeyDirection } from "@/lib/shortcuts";
import { altAnzeige, istAltBuchstabe, istMacSystem } from "@/lib/altTaste";
import { gehoertDemFeld } from "@/lib/braille/kuerzelImFeld";
import { ueberschriftSpringen } from "@/lib/arbeitsblatt/ueberschriftSprung";
import { doppelUmschaltSchritt, type DoppelStand } from "@/lib/computer/doppelUmschalt";
import { FOCUS_FIELD_EVENT } from "@/lib/typing/focusField";
import { useLesestelle } from "@/lib/arbeitsblatt/lesestelle";
import { Zeichenerklaerung } from "@/lib/arbeitsblatt/Zeichenerklaerung";
import { fokuswacheStarten } from "@/lib/arbeitsblatt/fokuswache";
import { fokusMitteStarten } from "@/lib/arbeitsblatt/fokusMitte";
import { meldeVorfall } from "@/lib/arbeitsblatt/fokusmeldung";
import { brailleBackend } from "@/lib/braille/backend";
import { klangBackend } from "@/lib/klangpunkte/backend";
import { migrateFromBraille, type KlangProgress } from "@/lib/klangpunkte/progress";
import type { BrailleAccount, BrailleProgress } from "@/lib/braille";
import { RechtlichesFusszeile } from "@/components/RechtlichesFusszeile";
import { istBeta } from "@/lib/allPrograms";

import { useReichweiteApp } from "@/lib/reichweiteApp";
/**
 * Standalone-Seite von „Klangpunkte" — dem eigenständigen Braille-Musik-
 * Lernprogramm (herausgelöst aus Punktgenau am 08.07.2026, /programme/
 * klangpunkte). Üben geht ohne Konto (Fortschritt lokal); mit Konto wird der
 * Spielstand serverseitig gesichert (lw_progress, program="klangpunkte").
 * Konten + Klassen sind die geteilten Lernwerkstatt-Konten (tt_*) — ein
 * Login für Tastenflow, Punktgenau, eine andere App der Plattform und Klangpunkte. Die Sterne der
 * 14 Ur-Kapitel werden beim ersten Öffnen einmalig aus dem Punktgenau-
 * Spielstand übernommen (anonym UND mit Konto).
 */
/*
 * ★★ DIE KÜRZEL-LISTE (Alt + T und Hilfe) - seit 18.10.2026 im gemeinsamen
 * Wortlaut (Johannes: „die Tastenkürzel sollen möglichst einheitlich bei allen
 * Lern-Apps sein"). Was es auch in den Geschwistern gibt, kommt aus
 * `GEMEINSAME_KUERZEL` in `lib/shortcuts.ts`; nur was Klangpunkte allein kennt
 * (Klaviatur, Takt-Baumeister, Hand am Klavier), steht in `texte/<sprache>/seite.ts`.
 * Deutsch zieht die gemeinsamen Zeilen weiter aus `shortcuts.ts` (Eintrag `null`
 * in `texte/de/seite.ts`); Englisch bringt eigene Texte mit.
 *
 * ⚠️ Alt + S gehört seit dem 18.10. überall „Meine Statistik". Klangpunkte hat
 * für Kinder keine Statistik-Ansicht - die Taste steht darum NUR für
 * Lehrkräfte in der Liste (die Kopfzeile führt sie nach „Meine Klassen"). Ein
 * Kürzel, das nichts tut, darf in der Liste nicht stehen (Tiefentest 10.07.).
 * „Hand am Klavier" ist dafür auf Alt + Q gewandert.
 */
function kuerzelListe(t: KlangTexte["seite"]): [string, string][] {
  const g = GEMEINSAME_KUERZEL;
  return [
    t.kuerzelWelt,
    t.kuerzelNachspiel,
    t.kuerzelTakt,
    // ★ 18.10.2026: bis dahin Alt + S - die Taste gehört jetzt „Meine Statistik".
    t.kuerzelHand,
    t.kuerzelKapitel,
    t.kuerzelEingabefeld ?? [g.eingabefeld[0], g.eingabefeld[1]],
    t.kuerzelNochmal ?? [g.nochmal[0], `${g.nochmal[1]}${t.kuerzelNochmalZusatz}`],
    // ★ 18.10.2026: derselbe Griff wie in Tastenflow, eine andere App der Plattform und Plus.
    [t.kuerzelUmschaltZweimalTaste ?? g.umschaltZweimal[0], t.kuerzelUmschaltZweimalText],
    t.kuerzelUeberschrift ?? [g.ueberschrift[0], g.ueberschrift[1]],
    t.kuerzelZeichenHinweis,
    [t.kuerzelStandTaste ?? g.stand[0], t.kuerzelStandText],
    t.kuerzelZeichenListe,
    t.kuerzelPause,
    t.kuerzelVorlesen ?? [g.vorlesen[0], g.vorlesen[1]],
    // ★★★ 04.09.2026 (Johannes: „egal an welcher Stelle gelesen wird, mit Strg
    //   muss es sofort leise werden" - „mach das auch für die anderen Apps").
    //   Die einzige Zeile dieser Liste ohne Alt: die Stumm-Geste jeder
    //   Sprachausgabe. Wortlaut wie in Tastenflow und eine andere App der Plattform.
    t.kuerzelStill ?? [g.still[0], g.still[1]],
    // ★ 18.10.2026: Esc führt immer zurück ins Übungsfeld (Hausregel, wie Punktgenau).
    t.kuerzelZumFeld ?? [g.zumFeld[0], g.zumFeld[1]],
    t.kuerzelNachrichten,
    t.kuerzelFarben,
    t.kuerzelKonto,
    t.kuerzelHilfe,
    t.kuerzelListe,
    t.kuerzelGroesser,
    t.kuerzelKleiner,
    // ★ 18.10.2026 (Vergleich der Kürzel aller Lern-Apps): Alt + 0 und das
    //   Melden mit Bild gelten in jeder App - Wortlaut aus `UNIVERSAL_SHORTCUTS`.
    t.kuerzelNormal,
    t.kuerzelMelden,
    t.kuerzelUmschalt,
  ];
}

/**
 * ★ Am Mac heißt die Taste „Wahl" (18.10.2026, `lib/altTaste.ts`): Liste und
 * Hilfe schreiben dann „Wahl + W" und brauchen die Fußnote nicht. Sonst „Alt"
 * mit der Fußnote für alle, die zwischen den Geräten wechseln.
 */
function ShortcutList({ lehrkraft = false }: { lehrkraft?: boolean }) {
  const t = useKlangTexte().seite;
  const mac = istMacSystem();
  const liste = lehrkraft ? [...kuerzelListe(t), t.kuerzelLehrkraft] : kuerzelListe(t);
  return (
    <>
      <ul className="m-0 mt-2 list-none space-y-1.5 p-0 text-sm">
        {liste.map(([k, l]) => (
          <li key={k} className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <kbd className="whitespace-nowrap rounded border border-hairline bg-surface-sunken px-1.5 py-0.5 font-mono text-xs text-ink">
              {altAnzeige(k, mac)}
            </kbd>
            <span className="text-ink-muted">- {altAnzeige(l, mac)}</span>
          </li>
        ))}
      </ul>
      {!mac && (
        <p className="mt-2 text-xs text-ink-muted">
          {t.kuerzelFussnote}
        </p>
      )}
    </>
  );
}

/** Hilfe-Text aus Stücken: `stark` ⇒ <strong>, `em` ⇒ <em>. */
function Stuecke({ teile }: { teile: readonly { t: string; stark?: true; em?: true }[] }) {
  return (
    <>
      {teile.map((x, i) =>
        x.stark ? <strong key={i}>{x.t}</strong> : x.em ? <em key={i}>{x.t}</em> : x.t,
      )}
    </>
  );
}

/** Sprache für `ansageGewaehlt`: die der App, soweit der gemeinsame Satz sie kennt, sonst Englisch. */
const ANSAGE_SPRACHEN: readonly string[] = ["de", "en", "fr", "es", "it", "pl", "tr", "cs"];
function ansageSprache(): AnsageSprache {
  const s = klangSprache();
  return (ANSAGE_SPRACHEN.includes(s) ? s : "en") as AnsageSprache;
}

/** Die Seite trägt ihren eigenen Sprach-Provider (ohne Probe-Schalter fügt er nichts ein). */
export function KlangpunktePage() {
  return (
    <KlangSpracheProvider>
      <KlangpunkteSeite />
    </KlangSpracheProvider>
  );
}

function KlangpunkteSeite() {
  const t = useKlangTexte().seite;
  /*
    Reichweite (08.09.2026): meldet Besuch und Verweildauer von Klangpunkte.
    Der Hook holt sich selbst, ob gerade ein Kind angemeldet ist - daraus
    entsteht die Antwort auf „wie viele üben OHNE Anmeldung". Er muss ganz
    oben stehen: Ein Hook hinter einem frühen `return` liefe nicht bei jedem
    Rendern, und React bricht dann ab.
  */
  useReichweiteApp("klangpunkte");

  const account = useBrailleAuth((s) => s.account);
  const logout = useBrailleAuth((s) => s.logout);
  // „Passwort ändern" — seit 10.08.2026 im Konto-Menü (Johannes).
  const [showPasswort, setShowPasswort] = useState(false);
  const zoom = useBrailleA11y((s) => s.zoom);
  const zoomIn = useBrailleA11y((s) => s.zoomIn);
  const zoomOut = useBrailleA11y((s) => s.zoomOut);
  const resetZoom = useBrailleA11y((s) => s.resetZoom);

  /**
   * ★★★ DIE ÜBUNGSFLÄCHE - Behälter für die Ränder (§6.1), Anker für die
   * Lesestelle (§6.2) und Bereich des Fokus-Wächters (§3).
   *
   * ⚠️ Die Kennzeichen aus §13 allein tun nichts. Erst diese Zeilen hängen
   * Wächter und Lesestelle daran.
   */
  const blattflaeche = useRef<HTMLDivElement>(null);

  /**
   * ★★★ DIE LESESTELLE BLEIBT BEIM VERGRÖSSERN STEHEN (§6.2) - bei BEIDEN
   * Vergrößerungen. Strg/Cmd + Plus geht nicht durch unseren Code; darum merkt
   * `useLesestelle` fortlaufend mit.
   */
  const { merken, halten } = useLesestelle(() => blattflaeche.current);

  // ⚠️ `useLayoutEffect`: gerollt wird NACH dem neuen Umbruch und VOR dem
  // Zeichnen - sonst sieht man die Seite springen.
  useLayoutEffect(() => {
    halten();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom]);

  /**
   * ★★★ DER FOKUS-WÄCHTER (§3) - gegen den Sprung an den Dokumentenanfang.
   * ⚠️ Er rettet, aber die Rettung ist nicht die Heilung: Jeder Vorfall geht
   * in die Konsole und nach `__fokusvorfaelle`.
   */
  useEffect(() => {
    const w = blattflaeche.current;
    if (!w) return;
    return fokuswacheStarten(w, meldeVorfall);
  }, []);

  /**
   * ★★★★★ DIE ARBEITSSTELLE ROLLT IN DIE MITTE (§6.4, Johannes 09.09.2026:
   * „das wäre eine riesige Unterstützung für Menschen mit Sehbehinderung").
   *
   * Der Browser rollt ein neu fokussiertes Element so WENIG wie möglich ins
   * Bild - die Arbeitsstelle klebt dadurch am Rand. Bei starker Vergrösserung
   * sieht man von seiner Aufgabe dann nur die Zeile, in der man steht.
   *
   * ⚠️ Zuerst nur im eine andere App der Plattform  gebaut und am 09.09. nachgezogen. Das Bauteil
   * gehört allen (`lib/arbeitsblatt/fokusMitte.ts`); die drei Fallen stehen
   * dort: `instant` statt `auto`, `pointerdown` statt `keydown`, `setTimeout`
   * statt `requestAnimationFrame`.
   */
  useEffect(() => {
    const w = blattflaeche.current;
    if (!w) return;
    return fokusMitteStarten(w);
  }, []);

  const [showAuth, setShowAuth] = useState(false);
  const authTriggerRef = useRef<HTMLButtonElement>(null);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const showShortcutsRef = useRef(showShortcuts);
  showShortcutsRef.current = showShortcuts;
  const showHelpRef = useRef(showHelp);
  showHelpRef.current = showHelp;
  const accountRef = useRef(account);
  accountRef.current = account;
  // Seiten-eigene Statuszeile für Kürzel-Rückmeldungen außerhalb des Trainers.
  const [pageStatus, setPageStatus] = useState("");
  const pushPageStatus = (text: string) => {
    setPageStatus("");
    window.setTimeout(() => setPageStatus(text), 50);
  };

  /**
   * ★★ VORLESEN AN/AUS - EIN ZUSTAND, MEHRERE TUEREN (30.08.2026).
   *
   * Seit dem 30.08. gibt es dafuer einen Knopf in der Kopfzeile. Er und das
   * Kuerzel Alt + V laufen durch DIESE eine Funktion und schreiben in denselben
   * Speicher (`useVoice`). Ein zweiter Weg mit eigener Umschaltung waere genau
   * die Doppelung, die einander nicht kennt: Zwei Stellen, die dasselbe tun,
   * sagen es beim naechsten Nachbessern verschieden
   * [[feedback_zwei_stellen_die_voneinander_nichts_wissen]].
   *
   * Die Ansage gehoert dazu, nicht zum Knopf: Wer nicht sehen kann, ob der
   * Schalter umgesprungen ist, hoert es hier. „an" spricht regulaer und laesst
   * danach die Aufgabe wiederholen; „aus" muss an der An/Aus-Pruefung vorbei
   * (`speakUiAlways`), weil der Schalter da schon aus ist - sonst schaltet der
   * Knopf still, und ein Kind ohne Screenreader bekommt keine Rueckmeldung.
   */
  const vorlesenAn = useVoice((s) => s.enabled);
  const vorlesenUmschalten = () => {
    const on = !useVoice.getState().enabled;
    useVoice.getState().setEnabled(on);
    if (on) {
      primeSpeech();
      pushPageStatus(t.vorlesenStatusAn);
      sprichDann(t.vorlesenAn, () => useBraillePlay.getState().requestRepeat());
    } else {
      pushPageStatus(t.vorlesenStatusAus);
      sprichImmer(t.vorlesenAus);
    }
  };
  // Ueber ein Ref, nicht ueber die Abhaengigkeitsliste: Der Kuerzel-Effekt
  // unten wird nicht bei jedem Zustandswechsel neu aufgesetzt und riefe sonst
  // die Fassung von damals.
  const vorlesenUmschaltenRef = useRef(vorlesenUmschalten);
  vorlesenUmschaltenRef.current = vorlesenUmschalten;

  const authVisible = showAuth && !account;
  const isTeacher = account?.role === "lehrkraft";

  /**
   * ★★★ DER HEIMWEG: ein Klick auf den Programmnamen oben schließt alles
   * Offene (07.09.2026, Johannes: „auch oben auf Tastenflow kann geklickt
   * werden um es zu schließen … so soll es bei allen apps sein").
   *
   * Bis heute gab es diesen Weg NUR in Tastenflow - in allen anderen Apps
   * blieb die Überschrift schlichter Text, weil `onZumProgramm` fehlte.
   *
   * ⚠️ `showAuth` gehört NICHT dazu: Wer mitten in der Anmeldung steht, soll
   * sie nicht durch einen Klick auf die Überschrift verlieren.
   */
  const zurueckInsProgramm = () => {
    setShowHelp(false);
    setShowShortcuts(false);
    setShowPasswort(false);
  };

  /**
   * ★★★ ZURÜCK INS ÜBUNGSFELD - Esc führt immer heim (18.10.2026, Hausregel
   * „Esc ⇒ Eingabezeile", wie Punktgenau seit dem 07.09.2026).
   *
   * Bis heute schloss Esc hier nur Hilfe oder Kürzel-Liste - und der Fokus
   * blieb auf dem Hilfe-Knopf der Kopfzeile. War nichts offen, tat Esc gar
   * nichts; der Hinweis an der Runden-Anzeige („Esc springt zurück ins
   * Eingabefeld") versprach also etwas, das keiner einlöste.
   *
   * Ein Weg für alles: die Taste, jedes `onClose` der Fenster unten und - über
   * `escAfterClose` - Esc im Konto-, Farb- und Klang-Menü der Kopfzeile.
   * Anders als beim Klick auf den Programmnamen schließt Esc auch die
   * Anmeldung (wie in Punktgenau).
   *
   * ⚠️ Das Übungsfeld gehört dem gerade gemounteten Runner, nicht dieser Seite.
   * Der Ruf geht darum über den Play-Speicher (`requestFocusInput`, derselbe
   * Weg wie Alt + E).
   */
  const zurueckInsUebungsfeld = () => {
    zurueckInsProgramm();
    setShowAuth(false);
    useBraillePlay.getState().requestFocusInput();
  };
  // ⚠️ Über ein Ref: Der Kürzel-Effekt unten wird nicht bei jedem
  // Zustandswechsel neu aufgesetzt und riefe sonst die Fassung von damals.
  const zurueckRef = useRef(zurueckInsUebungsfeld);
  zurueckRef.current = zurueckInsUebungsfeld;

  /**
   * ★ Die Brücke zum gemeinsamen Fokus-Ereignis (18.10.2026, wie Punktgenau):
   * `Modal` gibt den Fokus beim Schließen an den Öffner zurück - steht der
   * nicht mehr im Baum, ruft es `focusPracticeField()`. Ohne Hörer fiele der
   * Fokus dann auf `<body>`; hier geht er ins Übungsfeld.
   */
  useEffect(() => {
    const aufsFeld = () => useBraillePlay.getState().requestFocusInput();
    window.addEventListener(FOCUS_FIELD_EVENT, aufsFeld);
    return () => window.removeEventListener(FOCUS_FIELD_EVENT, aufsFeld);
  }, []);

  /**
   * ★★ UMSCHALT ZWEIMAL = DIE AUFGABE NOCH EINMAL (18.10.2026) - derselbe
   * Griff wie in Tastenflow, eine andere App der Plattform und Plus, dieselbe Frist (450 ms,
   * `lib/computer/doppelUmschalt.ts`), derselbe Weg wie Alt + W
   * (`requestRepeat`).
   *
   * ⚠️ Umschalt GEHALTEN bleibt, was es war: In der Notenschreib-Fläche zeigt
   * und sagt es die Tasten der Zelle (`KlangpunkteRunner`). Ein Doppeldruck
   * blitzt diesen Hinweis kurz auf; die Aufgabe kommt danach - sie ist das
   * Letzte, was das Kind hört.
   * Nicht in einem Eingabefeld ohne `data-kuerzel="an"` (Regel 4 des
   * Erkenners: im Namensfeld ist Umschalt das Werkzeug für Großbuchstaben)
   * und nicht, solange ein Fenster offen ist.
   */
  const doppelStand = useRef<DoppelStand>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const schritt = doppelUmschaltSchritt(doppelStand.current, e, performance.now());
      doppelStand.current = schritt.stand;
      if (!schritt.ausgeloest) return;
      const ziel = e.target as HTMLElement | null;
      const tag = ziel?.tagName;
      const imFeld = tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA";
      if (imFeld && ziel?.dataset?.kuerzel !== "an") return;
      if (document.querySelector('[role="dialog"][aria-modal="true"]')) return;
      useBraillePlay.getState().requestRepeat();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        // ★★ EINE REGEL FÜR ALLES: schließen, was offen ist, und danach steht
        // der Fokus IMMER im Übungsfeld - auch wenn nichts offen war. Fenster
        // mit eigenem Ausweg (`Modal`, die Menüs der Kopfzeile) fangen Esc
        // schon in der Abfangphase ab und führen über ihr `onClose` bzw.
        // `escAfterClose` ebenfalls hierher.
        zurueckRef.current();
        return;
      }
      if (!e.altKey || e.ctrlKey || e.metaKey) return;
      const dir = zoomKeyDirection(e);
      if (dir) {
        // Zoom auch aus Formularen heraus (Cross-App-Konvention).
        e.preventDefault();
        // ★ Vor der Änderung merken, wo das Kind steht - danach hält
        // `useLayoutEffect` die Stelle (§6.2).
        merken();
        if (dir === "in") zoomIn();
        else zoomOut();
        return;
      }
      // ★ Alt + 0 - normale Größe (18.10.2026, in allen Lern-Apps). Wie die
      // beiden Zoom-Tasten auch aus Formularen heraus.
      if (istNormalgroesseTaste(e)) {
        e.preventDefault();
        merken();
        resetZoom();
        return;
      }
      // Buchstaben-Kürzel dürfen das Tippen in Eingabefeldern nicht kapern
      // (NVDA-Test 01.07.2026). ★ 18.10.2026 wie Punktgenau: Ein Feld mit
      // `data-kuerzel="an"` lässt die Kürzel durch - außer den Zeichen, die
      // man zum Schreiben braucht. Regel und Preis: `lib/braille/kuerzelImFeld.ts`.
      if (gehoertDemFeld(e)) return;
      // Offene Dialoge: nur der Toggle des eigenen Dialogs darf durch.
      const dialogOpen = !!document.querySelector('[role="dialog"][aria-modal="true"]');
      // ★ Alt + Z - Runde ansagen. Seit 18.10.2026 nach dem AUFGEDRUCKTEN
      // Buchstaben (`istAltBuchstabe`, Johannes: „Alt + Y nicht mehr mitwirken
      // lassen"). Bis dahin galten beide Codes, `KeyZ` und `KeyY`.
      if (istAltBuchstabe(e, "z")) {
        if (dialogOpen) return;
        e.preventDefault();
        useBraillePlay.getState().requestRound();
        return;
      }
      switch (e.code) {
        case "KeyH":
          if (dialogOpen && !showHelpRef.current) return;
          e.preventDefault();
          setShowHelp((v) => !v);
          break;
        case "KeyT":
          if (dialogOpen && !showShortcutsRef.current) return;
          e.preventDefault();
          setShowShortcuts((v) => !v);
          break;
        case "KeyW":
          if (dialogOpen) return;
          e.preventDefault();
          useBraillePlay.getState().requestRepeat();
          break;
        case "KeyM":
          if (dialogOpen) return;
          e.preventDefault();
          useBraillePlay.getState().requestFocusKeys();
          break;
        case "KeyG":
          // ★ 18.10.2026: Zur nächsten Überschrift (G wie Gliederung), wie in
          //   Tastenflow und eine andere App der Plattform . Der DOM-Kern gehört allen
          //   (`lib/arbeitsblatt/ueberschriftSprung.ts`); gemeldet wird mit
          //   der Stimme UND dem Schalter von Klangpunkte (`braille-voice`) -
          //   die Fassung in `lib/typing/ueberschriften.ts` spräche mit der
          //   Tastenflow-Stimme.
          if (dialogOpen) return;
          e.preventDefault();
          ueberschriftSpringen({ melden: sprich });
          break;
        case "KeyL":
          if (dialogOpen && !useBraillePlay.getState().charsOpen) return;
          e.preventDefault();
          useBraillePlay.getState().requestChars();
          break;
        case "KeyP":
          if (dialogOpen) return;
          e.preventDefault();
          useBraillePlay.getState().togglePause();
          break;
        case "KeyV": {
          if (dialogOpen) return;
          e.preventDefault();
          vorlesenUmschaltenRef.current();
          break;
        }
        case "KeyE":
          if (dialogOpen) return;
          e.preventDefault();
          useBraillePlay.getState().requestFocusInput();
          break;
        case "KeyU":
          // Kapitelwahl (die Lern-Landkarte) öffnen.
          // ★ 30.08.2026 von Alt + K auf Alt + U umbelegt (Entscheidung
          //   Johannes): Alt + K ist seither plattformweit der Farbschalter der
          //   Kopfzeile, Alt + U plattformweit die Kapitel-/Unit-Auswahl.
          //   Begründung und der ehrliche Preis stehen in `src/lib/shortcuts.ts`.
          if (dialogOpen) return;
          e.preventDefault();
          useBraillePlay.getState().requestFocusEtappe();
          break;
        case "KeyQ":
          // Hand am Klavier umschalten (nur zweizeilige Klavier-Aufgaben).
          // ★ 18.10.2026 von Alt + S hierher (Johannes): Alt + S ist in allen
          //   Lern-Apps „Meine Statistik" und wird von der Kopfzeile behandelt.
          //   Klangpunkte hat für Kinder keine Statistik - die Taste bleibt
          //   für sie frei; eine Lehrkraft führt sie nach „Meine Klassen".
          if (dialogOpen) return;
          e.preventDefault();
          useBraillePlay.getState().requestHandSwitch();
          break;
        // ★ Die Konto-Taste (seit 25.08.2026 Alt + A, heute Alt + J) wird von
        // der gemeinsamen Kopfzeile behandelt (`AppKopfzeile`), damit sie in
        // allen Programmen dasselbe tut: abgemeldet die Anmeldung, angemeldet
        // das Konto-Menü.
        // Hier stand bis dahin ein eigener Zweig, der im angemeldeten Zustand
        // nur „Du bist schon angemeldet als …" sagte - eine Sackgasse. Bliebe
        // er stehen, liefe die Taste doppelt.
        default: {
          // Alt+1…9 — Klangwelt direkt wählen.
          const m = /^(?:Digit|Numpad)([1-9])$/.exec(e.code);
          if (m) {
            if (dialogOpen) return;
            e.preventDefault();
            useBraillePlay.getState().requestArea(m[1]);
          }
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [zoomIn, zoomOut, resetZoom]);

  return (
    <div className="min-h-screen px-4 py-6">
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {pageStatus}
      </div>
      <div className={`mx-auto w-full${zoom <= 1 ? " max-w-[100rem]" : ""}`}>
        <div className="mb-4">
          <AppKopfzeile
            onZumProgramm={zurueckInsProgramm}
            titel="Klangpunkte"
            // Das App-Zeichen steht VOR dem Titel - wie in den Geschwistern.
            zeichen={<KlangpunkteLogo beschreibung={t.logoBeschreibung} className="h-9 w-9" />}
            beta={istBeta("klangpunkte")}
            onHilfe={() => setShowHelp(true)}
            onKurztasten={() => setShowShortcuts((v) => !v)}
            kurztastenOffen={showShortcuts}
            account={
              account
                ? {
                    id: account.id,
                    name: account.name,
                    classCode: account.classCode,
                    istLehrkraft: isTeacher,
                    // ★ Entscheidet, WO „Melden" steht (Johannes 02.09.2026):
                    // im Konto-Menü über „Abmelden". Siehe `KopfKonto`.
                    selbstlernend: !!account.selfManaged,
                  }
                : null
            }
            onAbmelden={logout}
            onAnmelden={() => setShowAuth(true)}
            anmeldenRef={authTriggerRef}
            onPasswort={account ? () => setShowPasswort(true) : undefined}
            // ★ 18.10.2026: derselbe Reiter wie der Schalter „Meine Klassen"
            //   unten - Alt + S führt eine Lehrkraft über diesen Wert dorthin.
            //   Bis dahin stand hier der Punktgenau-Reiter („braille").
            klasseHref={meineKlasseHref("klangpunkte")}
            // ★ 31.08.2026: Die Farbwahl (Alt + K) war stumm - gemessen in
            // `pruefstand/kind/protokolle/farbwahl-vier-apps-vorher.txt`. Die
            // Kopfzeile meldet nur das Etikett; gesprochen wird hier, mit der
            // Stimme und dem Schalter von Klangpunkte (`braille-voice`).
            onFarbeGewaehlt={(label) => sprich(ansageGewaehlt(label, ansageSprache()))}
            bellAfterClose={() => useBraillePlay.getState().requestFocusInput()}
            // ★★ Esc im Konto-, Farb- und Klang-Menü folgt derselben Hausregel:
            //    zurück ins Übungsfeld (18.10.2026, wie Punktgenau).
            escAfterClose={zurueckInsUebungsfeld}
            // ★ Vorlese-Schalter in der Kopfzeile (30.08.2026, Auftrag
            //   Johannes). Er greift auf denselben Weg zu wie Alt + V und der
            //   Knopf in der Werkzeugzeile - kein eigener Zustand, keine
            //   zweite Ansage.
            onVorlesen={vorlesenUmschalten}
            vorlesenAn={vorlesenAn}
            // ★ Johannes, 17.10.2026: unter dem Lautsprecher ein Menü mit allen
            //   Akustik-Einstellungen - das der Braille-Apps, dazu die Musik.
            akustikMenue={{
              tipp: BRAILLE_AKUSTIK_TIPP,
              name: AKUSTIK_KNOPF_NAME, // ★ in allen Apps gleich (Johannes, 18.10.2026)
              inhalt: <KlangpunkteAkustik onVorlesen={vorlesenUmschalten} />,
            }}
          />
        </div>

        {/* ★★★ `blatt-flaeche` - der Behälter, an dem die Ränder gemessen werden
            (Bauart §6.1). Er misst den PLATZ, nicht unseren Vergrößerungs-
            Faktor, und deckt damit beide Vergrößerungen ab: die des Browsers
            (Strg/Cmd + Plus, die die Kinder benutzen) und unsere eigene. Wird
            es eng, werden Innenränder und Ecken schmäler, statt dem Text den
            Platz wegzunehmen. Solange Platz da ist, ändert sich nichts. */}
        <div ref={blattflaeche} className="blatt-flaeche mt-2">
          {authVisible ? (
            <BrailleAuth
              onCancel={() => {
                setShowAuth(false);
                authTriggerRef.current?.focus();
              }}
            />
          ) : account && isTeacher ? (
            <div className="space-y-4">
              {/* „Meine Klassen" ist seit 03.08. ein eigener Bereich für alle
                  vier Lernprogramme (MK-E5) — hier nur noch der Weg dorthin. */}
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  to={meineKlasseHref("klangpunkte")}
                  className="btn-secondary btn-toggle"
                  aria-keyshortcuts="Alt+S"
                  title={altAnzeige(t.meineKlassenTitel)}
                >
                  {t.meineKlassen}
                </Link>
              </div>
              <AccountKlangpunkte key={account.id} account={account} />
            </div>
          ) : account ? (
            <AccountKlangpunkte key={account.id} account={account} />
          ) : (
            <Klangpunkte key="anon" />
          )}
        </div>

      </div>

      {showPasswort && account && (
        <Modal title={t.passwortTitel} onClose={zurueckInsUebungsfeld}>
          <ChangeOwnPasswordCard
            minLen={isTeacher ? 6 : 4}
            tone={isTeacher ? "sie" : "du"}
            change={(a, n) => brailleBackend().changeOwnPassword(a, n)}
            immerOffen
          />
        </Modal>
      )}

      {showHelp ? (
        <Modal title={t.hilfeTitel} onClose={zurueckInsUebungsfeld} size="lg">
          <div className="space-y-4 text-sm">
            <div>
              <p className="font-semibold text-ink">{t.hilfeWasIstTitel}</p>
              <p className="mt-1 text-ink-muted">
                <Stuecke teile={t.hilfeWasIst} />
              </p>
            </div>
            <div>
              <p className="font-semibold text-ink">{t.hilfeNotenTitel}</p>
              <p className="mt-1 text-ink-muted">
                {t.hilfeNoten}
              </p>
            </div>
            {/* ★★ DIE ZEICHENERKLÄRUNG (Bauart §7.1) - kurz, und an EINER
                Stelle. Wer ein Zeichen benutzt, erklärt es. */}
            <Zeichenerklaerung
              titel={t.zeichenTitel}
              zeichen={[
                { zeichen: "·", bedeutung: t.zeichenPunkt },
                { zeichen: "⌫", bedeutung: t.zeichenRuecktaste },
                { zeichen: "⏎", bedeutung: t.zeichenEnter },
                { zeichen: "→", bedeutung: t.zeichenPfeil },
              ]}
            />
            <div>
              <p className="font-semibold text-ink">{t.hilfeSterneTitel}</p>
              <p className="mt-1 text-ink-muted">
                <Stuecke teile={t.hilfeSterne(altAnzeige("Alt + U"))} />
              </p>
            </div>
            <div>
              <p className="font-semibold text-ink">{t.hilfeRangTitel}</p>
              <p className="mt-1 text-ink-muted">
                {t.hilfeRang}
              </p>
            </div>
            <div>
              <p className="font-semibold text-ink">{t.hilfeUmzugTitel}</p>
              <p className="mt-1 text-ink-muted">
                {t.hilfeUmzugVor}
                <Link to="/programme/punktgenau" className="text-accent underline underline-offset-2">
                  {t.hilfeUmzugLink}
                </Link>
                {t.hilfeUmzugNach}
              </p>
            </div>
            <div>
              <p className="font-semibold text-ink">{t.hilfeNeunTitel}</p>
              <p className="mt-1 text-ink-muted">
                {t.hilfeNeunVor}<strong>{t.hilfeNeunStark}</strong>{t.hilfeNeunNach}
              </p>
            </div>
            <div>
              <p className="font-semibold text-ink">{t.hilfeKontoTitel}</p>
              <p className="mt-1 text-ink-muted">
                {t.hilfeKonto}
              </p>
              {/* Eigenes Konto ohne Klasse — Wortlaut aus der gemeinsamen
                  Anmeldung, damit er in allen vier Programmen gleich lautet. */}
              <p className="mt-1 text-ink-muted">{OHNE_KLASSE_HILFE}</p>
            </div>
            <div>
              <p className="font-semibold text-ink">{t.hilfeQuellenTitel}</p>
              <p className="mt-1 text-xs text-ink-muted">
                <Stuecke teile={t.hilfeQuellen} />
              </p>
            </div>
            <hr className="border-hairline" />
            <div>
              <p className="font-semibold text-ink">{t.hilfeKuerzelTitel}</p>
              <ShortcutList lehrkraft={isTeacher} />
              <p className="mt-2 text-xs text-ink-muted">
                {t.hilfeScreenreader(altAnzeige("Alt + V"))}
              </p>
            </div>
          </div>
        </Modal>
      ) : null}

      {showShortcuts ? (
        <Modal title={t.kuerzelTitel} onClose={zurueckInsUebungsfeld}>
          <ShortcutList lehrkraft={isTeacher} />
        </Modal>
      ) : null}
      <RechtlichesFusszeile unterstuetzenApp="klangpunkte" />
    </div>
  );
}

/**
 * Übungs-Ansicht für ein angemeldetes Konto: Klangpunkte-Spielstand kommt vom
 * Server (lw_progress/klangpunkte); beim ersten Mal wird der kp*-Stand aus dem
 * Punktgenau-Spielstand übernommen (Sterne bleiben erhalten).
 */
function AccountKlangpunkte({ account }: { account: BrailleAccount }) {
  const t = useKlangTexte().seite;
  const [initial, setInitial] = useState<KlangProgress | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const kb = klangBackend();
      let p = await kb.getProgress(account.id);
      if (!p.migratedFromBraille) {
        let br: BrailleProgress | null = null;
        try {
          br = await brailleBackend().getProgress(account.id);
        } catch {
          br = null;
        }
        p = migrateFromBraille(p, br);
        void kb.saveProgress(account.id, p);
      }
      if (alive) setInitial(p);
    })();
    return () => {
      alive = false;
    };
  }, [account.id]);

  if (!initial) {
    return <p className="text-ink-muted">{t.spielstandLaedt}</p>;
  }

  return (
    <Klangpunkte
      loadFn={() => initial}
      saveFn={(p) => {
        void klangBackend().saveProgress(account.id, p);
      }}
    />
  );
}
