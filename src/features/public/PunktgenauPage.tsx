import { OHNE_KLASSE_HILFE } from "@/components/lernwerkstatt/SchuelerAnmeldung";
import { AKUSTIK_KNOPF_NAME } from "@/components/AkustikBausteine";
import { BRAILLE_AKUSTIK_TIPP, BrailleAkustik } from "@/components/braille/BrailleAkustik";
import { meineKlasseHref } from "@/lib/adressen";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AppKopfzeile } from "@/components/AppKopfzeile";
import { Tipp } from "@/components/Tipp";
import { PunktgenauLogo } from "@/components/PunktgenauLogo";
import { ChangeOwnPasswordCard } from "@/components/typing/PasswordControls";
import { Modal } from "@/components/Modal";
import { SpendenBanner } from "@/components/SpendenBanner";
import { spendenBannerImHalbjahr } from "@/lib/spendenbanner";
import { minutenAus } from "@/lib/braille/wochenaufgabe";
import { leseTempoAus } from "@/lib/braille/lesezeit";
import { applyTheme } from "@/lib/theme";
import { Punktgenau } from "@/components/braille/Punktgenau";
import { MeineStatistik } from "@/components/braille/MeineStatistik";
import { BrailleExercise } from "@/components/braille/BrailleTrainer";
import { BrailleAuth } from "@/components/braille/BrailleAuth";
import { BrailleConfusionPanel } from "@/components/braille/BrailleConfusionPanel";
import { useBrailleAuth } from "@/components/braille/useBrailleAuth";
import { useBrailleA11y } from "@/lib/braille/a11y";
import { PUNKTGENAU_ESC, useBraillePlay } from "@/lib/braille/play";
// Bewusst direkt aus dem Modul (wie `Modal.tsx`): `focusField.ts` hat selbst
// keine Abhaengigkeiten und zieht damit nichts aus Tastenflow nach.
import { FOCUS_FIELD_EVENT } from "@/lib/typing/focusField";
import { primeSpeech, speakUi, speakUiAlways, speakUiThen, useVoice } from "@/lib/braille/voice";
// ★ NUR DER WORTLAUT, NICHT DIE STIMME (31.08.2026). `ansageGewaehlt` ist eine
// reine Textfunktion („<was> gewählt." / "<was> selected.") ohne eigene
// Abhängigkeiten - der Satz, den ein Kind in Tastenflow längst hört, wenn es
// die Sprache oder die Textstufe wählt. Gesprochen wird er hier mit
// `speakUi` aus `lib/braille/voice`, also mit der Stimme UND dem An/Aus-
// Schalter DIESER App. Die Sprache wird ausdrücklich mitgegeben („de"):
// sonst entschiede über den Satz die Inhaltssprache von Tastenflow.
import { ansageGewaehlt } from "@/lib/ansageGewaehlt";
import { GEMEINSAME_KUERZEL, istNormalgroesseTaste, zoomKeyDirection } from "@/lib/shortcuts";
import { altAnzeige, istAltBuchstabe, istMacSystem } from "@/lib/altTaste";
import { ueberschriftSpringen } from "@/lib/arbeitsblatt/ueberschriftSprung";
import { doppelUmschaltSchritt, type DoppelStand } from "@/lib/computer/doppelUmschalt";
import { gehoertDemFeld } from "@/lib/braille/kuerzelImFeld";
import { useLesestelle } from "@/lib/arbeitsblatt/lesestelle";
import { Zeichenerklaerung } from "@/lib/arbeitsblatt/Zeichenerklaerung";
import { fokuswacheStarten } from "@/lib/arbeitsblatt/fokuswache";
import { fokusMitteStarten } from "@/lib/arbeitsblatt/fokusMitte";
import { meldeVorfall } from "@/lib/arbeitsblatt/fokusmeldung";
import { brailleBackend } from "@/lib/braille/backend";
import type {
  BrailleAccount,
  BrailleClassSettings,
  BrailleProgress,
  TaskEvent,
} from "@/lib/braille";
import { RechtlichesFusszeile } from "@/components/RechtlichesFusszeile";
import { istBeta } from "@/lib/allPrograms";

import { useReichweiteApp } from "@/lib/reichweiteApp";
import { PgSpracheProvider, pg, pgTexte, usePgSprache } from "@/lib/braille/sprachen/sprache";
import { lehrSprache, setzeLehrSprache, type LehrSprache } from "@/lib/braille/sprachen/aktuell";
import type { AnsageSprache } from "@/lib/ansageGewaehlt";
import { PunktgenauHilfeFr } from "@/components/braille/PunktgenauHilfeFr";
/**
 * Standalone-Seite des Braille-Trainers „Punktgenau" — die neue, etappen-
 * getriebene Brailleschrift-App (ersetzt den alten Level-Trainer unter
 * /programme/braille). Öffentlich verlinkt unter /programme/punktgenau; die
 * alte Route /programme/braille bleibt zusätzlich bestehen (Arbeitsheft-
 * Embeds referenzieren sie fest). Üben geht ohne Konto (Fortschritt lokal); mit Konto wird
 * der Spielstand serverseitig gesichert. Konten + Klassen sind mit „Tastenflow" geteilt (tt_*). Der Embed-Modus `?level=…&bare=1` bleibt unverändert
 * (Einzel-Übung fürs Arbeitsheft) und nutzt weiter die bestehende Übung.
 */
/**
 * Sinnbild einer Braille-Zelle (2 Spalten × 3 Reihen, gefüllte UND offene
 * Punkte) für den Zeichenlisten-Knopf in der Kopfzeile — ersetzt das frühere
 * 📖 (Charge „SCHLANK", 20.09.2026). Inline-SVG statt Emoji: Auf einer
 * Braillezeile erscheinen Emoji je nach Tabelle als Füllmuster, ein
 * `aria-hidden`-SVG dagegen gar nicht - der Sinn steht im `aria-label` des
 * Knopfes, nicht im Zeichen selbst.
 *
 * Zeigt ein „p" (Punkte 1 2 3 4 — Johannes 20.09.2026 abends: bisher waren
 * 1 3 4 5 gefüllt, das ist ein „n"). Zählung: linke Spalte von oben 1 2 3,
 * rechte Spalte von oben 4 5 6 — hier also links alle drei, rechts nur oben.
 *
 * ⚠️ Offene Ringe dürfen nicht größer wirken als volle Punkte: ein voller
 * Punkt hat `r="2.4"` ohne Rand, sein Außenrand liegt bei 2,4. Ein Ring mit
 * `r="2.4"` UND `strokeWidth="1.6"` läge dagegen bei 2,4 + 1,6/2 = 3,2 - ein
 * Drittel größer. Der Ring-Radius wird darum um die halbe Strichstärke
 * zurückgezogen: r = 2,4 − 1,6/2 = 1,6. Damit liegt sein Außenrand bei
 * 1,6 + 1,6/2 = 2,4 - genau wie beim vollen Punkt.
 */
function BrailleZellenZeichen({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      stroke="currentColor"
      fill="none"
      strokeWidth="1.6"
    >
      <circle cx="8" cy="6" r="2.4" fill="currentColor" stroke="none" />
      <circle cx="16" cy="6" r="2.4" fill="currentColor" stroke="none" />
      <circle cx="8" cy="12" r="2.4" fill="currentColor" stroke="none" />
      <circle cx="16" cy="12" r="1.6" />
      <circle cx="8" cy="18" r="2.4" fill="currentColor" stroke="none" />
      <circle cx="16" cy="18" r="1.6" />
    </svg>
  );
}

/**
 * Runder 36-px-Knopf wie die Kopfzeilen-Familie (Hilfe, Kurztasten,
 * Einstellungen, Konto) - dieselben Maße, damit die Zeichenliste sich als Teil
 * dieser Reihe liest. `AppKopfzeile.tsx` selbst bleibt unangetastet (die Datei
 * gehört fünf Apps); dieser Knopf lebt darum hier, im `extra`-Slot.
 */
const ZEICHENLISTE_RUND =
  "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border " +
  "text-sm font-semibold transition-colors ";
const zeichenlisteRundKlasse = (offen: boolean) =>
  ZEICHENLISTE_RUND +
  (offen
    ? "border-accent bg-accent-soft text-ink"
    : "border-hairline bg-surface-raised text-ink hover:bg-surface-sunken");

/**
 * Alle Tastenkürzel von Punktgenau — EINE Quelle für Hilfe UND Kürzel-Liste.
 * Bewusst als einfache Liste gerendert (keine Tabelle): eine Braillezeile
 * liest so jedes Kürzel als EINE Zeile am Stück, statt Zelle für Zelle mit
 * Tabellennavigation (Johannes-Vorgabe 2026-07-02).
 */
/** Ein Eintrag mit dem gemeinsamen Wortlaut aller Lern-Apps (`GEMEINSAME_KUERZEL`). */
const gemeinsam = (k: keyof typeof GEMEINSAME_KUERZEL): [string, string] => [...GEMEINSAME_KUERZEL[k]];

const PUNKTGENAU_SHORTCUTS: [string, string][] = [
  // ★★★ Escape steht ganz oben, weil es die Taste ist, die immer geht
  //   (Johannes 07.09.2026: „esc muss eingabefeld fokusieren immer und
  //   ueberall"). Wortlaut wie in Tastenflow.
  [
    "Esc",
    "Schließt alles Offene - Hilfe, Tastenkürzel, Zeichenliste, Konto-Menü - und der Fokus steht danach immer im Übungsfeld. Auch wenn nichts offen ist: Esc holt dich zurück zur Aufgabe",
  ],
  ["Alt + 1", "Bereich Basisschrift"],
  ["Alt + 2", "Bereich Vollschrift"],
  ["Alt + 3", "Bereich Computerbraille"],
  ["Alt + 4", "Bereich Kurzschrift"],
  ["Alt + 5", "Bereich UEB (Englisch)"],
  ["Alt + E", "Fokus ins Eingabefeld der Aufgabe (dasselbe Ziel wie Esc, ohne etwas zu schließen)"],
  ["Alt + U", "Zur Kapitel-Auswahl springen - dann mit ↑ ↓ blättern"],
  // ★ 18.10.2026 (Johannes: „die Tastenkürzel sollen möglichst einheitlich
  //   bei allen Lern-Apps sein"): W, G, V, S und Strg im gemeinsamen Wortlaut.
  gemeinsam("nochmal"),
  [
    GEMEINSAME_KUERZEL.umschaltZweimal[0],
    "Kurz hintereinander: die Aufgabe noch einmal ansagen, wie Alt + W",
  ],
  gemeinsam("ueberschrift"),
  ["Alt + M", "Zu „Meine Tasten“ springen (neue Zeichen dieser Etappe)"],
  ["Alt + Z", "Runde ansagen: wie viele Aufgaben du geschafft hast und wie lange die Übung noch geht - Esc springt zurück ins Eingabefeld"],
  ["Alt + L", "Zeichenliste: alle Zeichen und Kürzungen des Bereichs öffnen / schließen"],
  ["Alt + O", "Einstellungen: Schriftsystem, Sounds, Fehler-Tipp und Vorlesen öffnen / schließen"],
  ["Alt + P", "Pause an / aus - im Klassenmatch: alle Plätze ansagen"],
  gemeinsam("vorlesen"),
  // ★★★ 04.09.2026 (Johannes: „egal an welcher Stelle gelesen wird, mit Strg
  //   muss es sofort leise werden" - „mach das auch für die anderen Apps").
  //   Die einzige Zeile dieser Liste ohne Alt: die Stumm-Geste jeder
  //   Sprachausgabe. Wortlaut wie in Tastenflow und eine andere App der Plattform.
  gemeinsam("still"),
  gemeinsam("statistik"),
  ["Alt + N", "Nachrichten öffnen / schließen (wenn angemeldet)"],
  ["Alt + K", "Farben und Kontrast öffnen / schließen"],
  ["Alt + J", "Mein Konto öffnen / schließen - angemeldet das Konto-Menü, sonst die Anmeldung"],
  ["Alt + H", "Hilfe öffnen / schließen"],
  ["Alt + T", "Tastenkürzel-Liste öffnen / schließen"],
  ["Alt + +", "Übungsbereich größer"],
  ["Alt + −", "Übungsbereich kleiner"],
  // ★ 18.10.2026: Alt + 0 gab es nur in Plus - jetzt in allen Lern-Apps.
  ["Alt + 0", "Normale Größe (zurück auf 100 %)"],
  // ★ 18.10.2026: wirkt seit dem 23.09. auf jeder Seite (`MeldenKuerzel`),
  //   stand aber in keiner Liste. Wortlaut wie `UNIVERSAL_SHORTCUTS`.
  ["Alt + Umschalt + P", "Fehler melden - mit einem Bild des Fensters"],
  ["⇧ Umschalt", "Gedrückt halten: zeigt und sagt die Tasten der aktuellen Zelle"],
];

/** Die Sprache der „Gewählt"-Ansage: die Lehrsprache, wenn die Ansage sie kennt (fr es it pt br), sonst Deutsch. */
function ansageSprache(l: LehrSprache): AnsageSprache {
  return l === "fr" || l === "es" || l === "it" || l === "pt" || l === "br" ? l : "de";
}

/**
 * ★ 18.10.2026 (Johannes: „beim Mac überall ‚Wahl', wenn nicht, dann mit
 * Fußnote"): Die Liste schreibt am Mac „Wahl + …" (`altAnzeige`), sonst
 * „Alt + …" mit der Fußnote. Reine Anzeige - geprüft wird `e.code`.
 */
function ShortcutList() {
  const mac = istMacSystem();
  const fremd = pgTexte();
  return (
    <>
      <ul className="m-0 mt-2 list-none space-y-1.5 p-0 text-sm">
        {(fremd ? fremd.kurztasten : PUNKTGENAU_SHORTCUTS).map(([k, l]) => (
          <li key={k} className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <kbd className="whitespace-nowrap rounded border border-hairline bg-surface-sunken px-1.5 py-0.5 font-mono text-xs text-ink">
              {altAnzeige(k, mac)}
            </kbd>
            <span className="text-ink-muted">- {altAnzeige(l, mac)}</span>
          </li>
        ))}
      </ul>
      {mac ? null : (
        <p className="mt-2 text-xs text-ink-muted">
          {pg("Alt + Taste - auf dem Mac: Wahltaste (⌥) + Taste.", (t) => t.kopf.macHinweis)}
        </p>
      )}
    </>
  );
}

/**
 * ★ Sprachen-Apps (Bauplan 2026-11-06 §4): Die Seite hängt unter dem Sprach-Kontext
 * von Punktgenau. Ohne Probe-Schalter `?punktgenau-sprachen=1` ist das ein
 * durchsichtiger Rahmen: kein Wähler, kein `lang`, die Seite bleibt Byte für Byte.
 */
export function PunktgenauPage() {
  // Beim Verlassen der Seite wieder Deutsch: die Lehrsprache ist eine Merkstelle im Speicher
  // (`sprachen/aktuell.ts`), die sonst in Klangpunkte und den anderen Apps stehen bliebe.
  useEffect(() => () => setzeLehrSprache("de"), []);
  return (
    <PgSpracheProvider>
      <PunktgenauSeite />
    </PgSpracheProvider>
  );
}

function PunktgenauSeite() {
  /*
    Reichweite (08.09.2026): meldet Besuch und Verweildauer von Punktgenau.
    Der Hook holt sich selbst, ob gerade ein Kind angemeldet ist - daraus
    entsteht die Antwort auf „wie viele üben OHNE Anmeldung". Er muss ganz
    oben stehen: Ein Hook hinter einem frühen `return` liefe nicht bei jedem
    Rendern, und React bricht dann ab.
  */
  useReichweiteApp("braille");

  const [sp] = useSearchParams();
  const sprache = usePgSprache();
  const account = useBrailleAuth((s) => s.account);
  const logout = useBrailleAuth((s) => s.logout);
  // „Passwort ändern" — seit 10.08.2026 im Konto-Menü (Johannes).
  const [showPasswort, setShowPasswort] = useState(false);
  const zoom = useBrailleA11y((s) => s.zoom);
  const zoomIn = useBrailleA11y((s) => s.zoomIn);
  const zoomOut = useBrailleA11y((s) => s.zoomOut);

  /**
   * ★★★ ZEICHENLISTE — GANZ OBEN IN DER KOPFZEILE (Charge „SCHLANK",
   * 20.09.2026). Der Zustand („offen?") lebt weiter in `Punktgenau.tsx`
   * (`showZeichen`) - hier wird er nur SAUBER DURCHGEREICHT, über denselben
   * Play-Speicher, den auch Alt + L benutzt (`charsOpen`/`requestChars`).
   * Kein zweiter Zustand, der auseinanderlaufen könnte
   * ([[feedback_zwei_stellen_die_voneinander_nichts_wissen]]).
   */
  const zeichenlisteOffen = useBraillePlay((s) => s.charsOpen);

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

  /**
   * Zeichen im Browser-Tab und „am Schreibtisch installieren" (07.09.2026) -
   * dasselbe Muster wie in `TippenTrainerPage`, `eine andere App der Plattform Page` und
   * `ComputerTrainerPage`.
   *
   * Punktgenau hat keine eigene Adresse (nur Tastenflow hat seit dem
   * 22.08.2026 `tastenflow.org` und deshalb ZWEI Manifeste). Hier genügt
   * eines, dessen `scope` den Pfad enthält - ohne das bietet der Browser das
   * Installieren gar nicht erst an.
   *
   * ⚠️ Der Aufräumteil setzt auf die Werte aus `index.html` zurück, NICHT auf
   * den Vorzustand: Beim Direkteinstieg hat das Startbild die Zeichen schon vor
   * React getauscht - der Vorzustand WÄRE also das Punktgenau-Zeichen, und der
   * Tab behielte es auf der Lernwerkstatt.
   */
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "manifest";
    link.href = "/punktgenau-manifest.json";
    document.head.appendChild(link);
    const icons = Array.from(
      document.querySelectorAll<HTMLLinkElement>(
        'link[rel="icon"], link[rel="apple-touch-icon"]',
      ),
    );
    for (const el of icons) {
      el.href = el.href.includes(".svg")
        ? "/punktgenau-logo.svg?v=2"
        : "/punktgenau-logo-180.png?v=2";
    }
    return () => {
      document.head.removeChild(link);
      for (const el of icons) {
        el.href = el.href.includes(".svg") ? "/logo.svg?v=5" : "/logo-180.png?v=5";
      }
    };
  }, []);

  const [showAuth, setShowAuth] = useState(false);
  const authTriggerRef = useRef<HTMLButtonElement>(null);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  // ★★★ „MEINE STATISTIK" (22.09.2026, [[feedback_data_transparency]]): dasselbe
  // Fenster-Muster wie Hilfe/Tastenkürzel - ein Zustand, per Alt + S UND über
  // das Konto-Menü (`onStatistik` an `AppKopfzeile`, dort seit Tastenflow
  // bereitliegend) geöffnet, per Escape/✕ wieder ins Übungsfeld geschlossen.
  const [showStats, setShowStats] = useState(false);
  const showShortcutsRef = useRef(showShortcuts);
  showShortcutsRef.current = showShortcuts;
  const showHelpRef = useRef(showHelp);
  showHelpRef.current = showHelp;
  const showStatsRef = useRef(showStats);
  showStatsRef.current = showStats;
  const accountRef = useRef(account);
  accountRef.current = account;
  // Seiten-eigene Statuszeile (immer gemountet) für Kürzel-Rückmeldungen, die
  // nicht durch den Trainer laufen (Alt + V aus, Alt + G).
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
      pushPageStatus(pg("Vorlesen ist jetzt an.", (t) => t.kopf.vorlesenAn));
      speakUiThen(pg("Vorlesen an.", (t) => t.kopf.vorlesenAnKurz), () => useBraillePlay.getState().requestRepeat());
    } else {
      pushPageStatus(pg("Vorlesen ist jetzt aus.", (t) => t.kopf.vorlesenAus));
      speakUiAlways(pg("Vorlesen aus.", (t) => t.kopf.vorlesenAusKurz));
    }
  };
  // Ueber ein Ref, nicht ueber die Abhaengigkeitsliste: Der Kuerzel-Effekt
  // unten wird nicht bei jedem Zustandswechsel neu aufgesetzt und riefe sonst
  // die Fassung von damals.
  const vorlesenUmschaltenRef = useRef(vorlesenUmschalten);
  vorlesenUmschaltenRef.current = vorlesenUmschalten;

  // Einbettungs-Modus (Arbeitsheft): `?level=…&bare=1` zeigt NUR eine Einzel-
  // Übung, ohne Kopfzeile/Konto. Unverändert übernommen vom alten Trainer.
  const truthy = (v: string | null) => v === "1" || v === "true";
  const levelParam = sp.get("level") ?? "";
  const embed = !!levelParam && (truthy(sp.get("bare")) || truthy(sp.get("lock")));
  const embedDirection = sp.get("direction") === "read" ? "read" : "write";
  const embedToggle = truthy(sp.get("toggle"));

  const themeParam = sp.get("theme");
  useLayoutEffect(() => {
    if (themeParam === "light" || themeParam === "dark") applyTheme(themeParam);
  }, [themeParam]);
  useEffect(() => {
    if (!embed) return;
    const onMsg = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      const d = e.data as { source?: string; theme?: string } | null;
      if (d && d.source === "sehsim-theme" && (d.theme === "light" || d.theme === "dark"))
        applyTheme(d.theme);
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [embed]);

  const authVisible = showAuth && !account;
  const isTeacher = account?.role === "lehrkraft";
  // „Meine Statistik" gehört dem Kind (Klassen- UND selbstlernende Konten,
  // [[feedback_data_transparency]]) - dieselbe Bedingung wie `isPupil` in
  // Tastenflows `TippenTrainerPage.tsx`.
  const isPupil = account?.role === "schueler";

  /**
   * ════════════════════════════════════════════════════════════════════════
   * ★★★★★ ZURUECK INS UEBUNGSFELD - der eine Weg heim (07.09.2026)
   * ════════════════════════════════════════════════════════════════════════
   *
   * Johannes: *„esc muss eingabefeld fokusieren immer und ueberall"*.
   *
   * Bis heute tat Escape auf dieser Seite drei Dinge zu wenig:
   *   1. Es schloss NUR Hilfe und Tastenkuerzel. Zeichenliste (Alt + L),
   *      Passwort-Fenster, Anmeldung und die Verwechslungs-Tafel blieben offen.
   *   2. Es setzte NIRGENDS ein Fokus-Ziel. Wer die Hilfe schloss, stand auf
   *      dem Hilfe-Knopf der Kopfzeile und musste sich zurueck ins Uebungsfeld
   *      tabben - mit Braillezeile ein Weg von einem Dutzend Stationen.
   *   3. War gar nichts offen, tat Escape ueberhaupt nichts. Genau dann
   *      braucht man es am dringendsten: Der Fokus ist irgendwohin gerutscht,
   *      und eine Taste soll zurueck zur Aufgabe fuehren.
   *
   * Das ist dieselbe Regel, die in Tastenflow seit dem 14.08.2026 gilt
   * (`TippenTrainerPage.zurueckInsProgramm`). Sie steht hier bewusst als
   * EIGENE Funktion und nicht als Rumpf im Escape-Zweig: Es gibt zwei Wege
   * hierher - die Taste und jedes `onClose` der Fenster unten. Zwei Abschriften
   * derselben Liste laufen beim naechsten Fenster garantiert auseinander
   * ([[feedback_zwei_stellen_die_voneinander_nichts_wissen]]).
   *
   * ⚠️ Das Uebungsfeld gehoert nicht dieser Seite, sondern dem gerade
   * gemounteten Panel (Schreiben, Lesen, Text). Der Ruf geht darum ueber den
   * Play-Speicher: `requestFocusInput()` zaehlt einen Zaehler hoch, und jedes
   * der vier Panels loest ihn selbst ein. So gibt es KEINE Liste von
   * Feld-Kennungen, die beim naechsten Panel unvollstaendig waere.
   */
  const zurueckInsUebungsfeld = () => {
    setShowHelp(false);
    setShowShortcuts(false);
    setShowPasswort(false);
    setShowStats(false);
    setShowAuth(false);
    // Was anderswo wohnt und sein eigenes Fenster fuehrt (Zeichenliste in
    // `Punktgenau`, Verwechslungs-Tafel im Konto-Trainer), hoert auf dieses
    // Ereignis - wie `tippen-esc` in Tastenflow.
    window.dispatchEvent(new Event(PUNKTGENAU_ESC));
    useBraillePlay.getState().requestFocusInput();
  };
  // ⚠️ Ueber ein Ref, nicht ueber die Abhaengigkeitsliste: Der Kuerzel-Effekt
  // unten haengt an `[embed, zoomIn, zoomOut]` und wird nicht bei jedem
  // Zustandswechsel neu aufgesetzt. Ohne Ref riefe Escape die Fassung von
  // damals - dieselbe Falle, die `showHelpRef` hier schon abfaengt.
  const zurueckRef = useRef(zurueckInsUebungsfeld);
  zurueckRef.current = zurueckInsUebungsfeld;

  /**
   * ★ Die Bruecke zum gemeinsamen Fokus-Ereignis (07.09.2026).
   *
   * `Modal.tsx` gehoert allen fuenf Programmen. Beim Schliessen gibt es den
   * Fokus an den Oeffner zurueck - und wenn der nicht mehr im Baum steht, ruft
   * es `focusPracticeField()`. Im Quelltext dort steht dazu: *„in den drei
   * anderen Programmen hoert niemand auf dieses Ereignis, dort aendert sich
   * damit nichts."* Genau das war die Luecke: In Punktgenau fiel der Fokus in
   * diesem Fall auf `<body>` - fuer eine Sprachausgabe der Dokumentenanfang.
   *
   * Statt einer zweiten Mechanik hoert Punktgenau jetzt auf DIESES Ereignis
   * und leitet es in seinen eigenen Feld-Ruf um. Ein Ereignis, fuenf
   * Programme.
   */
  useEffect(() => {
    if (embed) return;
    const aufsFeld = () => useBraillePlay.getState().requestFocusInput();
    window.addEventListener(FOCUS_FIELD_EVENT, aufsFeld);
    return () => window.removeEventListener(FOCUS_FIELD_EVENT, aufsFeld);
  }, [embed]);

  /**
   * ★★ UMSCHALT ZWEIMAL = DIE AUFGABE NOCH EINMAL (18.10.2026, Johannes: „die
   * Tastenkürzel sollen möglichst einheitlich bei allen Lern-Apps sein").
   * Derselbe Griff wie in Tastenflow, eine andere App der Plattform und Plus, dieselbe Frist
   * (`doppelUmschaltSchritt`, 450 ms), derselbe Weg wie Alt + W.
   * ⚠️ Umschalt GEHALTEN zeigt weiter die Tasten der Zelle (`BrailleTrainer`) -
   * das bleibt; erst der zweite kurze Druck ruft die Wiederholung.
   */
  const umschaltStand = useRef<DoppelStand>(null);

  useEffect(() => {
    if (embed) return;
    const onKey = (e: KeyboardEvent) => {
      // Jeder Tastendruck geht durch den Erkenner - jede andere Taste löscht ihn.
      const schritt = doppelUmschaltSchritt(umschaltStand.current, e, Date.now());
      umschaltStand.current = schritt.stand;
      if (schritt.ausgeloest) {
        // Nicht in fremden Feldern (Anmeldung, Namen): dort schreibt Umschalt
        // Großbuchstaben. Die Antwortfelder (`data-kuerzel="an"`) zählen nicht dazu.
        const ziel = e.target as HTMLElement | null;
        const feld = !!ziel && (/^(INPUT|TEXTAREA|SELECT)$/.test(ziel.tagName) || ziel.isContentEditable);
        const fremdesFeld = feld && ziel?.dataset?.kuerzel !== "an";
        const dialogOffen = !!document.querySelector('[role="dialog"][aria-modal="true"]');
        if (!fremdesFeld && !dialogOffen) useBraillePlay.getState().requestRepeat();
        return;
      }
      if (e.key === "Escape") {
        // ★★ EINE REGEL FUER ALLES: schliessen, was offen ist, und danach
        // steht der Fokus IMMER im Uebungsfeld - auch wenn nichts offen war.
        // Fenster mit eigenem Ausweg (`Modal`) fangen Escape schon in der
        // Abfangphase ab und rufen ihr `onClose` - das fuehrt hierher zurueck.
        zurueckRef.current();
        return;
      }
      if (!e.altKey || e.ctrlKey || e.metaKey) return;
      const dir = zoomKeyDirection(e);
      if (dir) {
        // Zoom soll auch aus Formularen heraus funktionieren, wie in den
        // anderen Apps (ComputerTrainerPage) — kein inForm-Guard hier.
        e.preventDefault();
        // ★ Vor der Änderung merken, wo das Kind steht - danach hält
        // `useLayoutEffect` die Stelle (§6.2).
        merken();
        if (dir === "in") zoomIn();
        else zoomOut();
        return;
      }
      // ★ 18.10.2026: Alt + 0 = normale Größe - in allen Lern-Apps gleich.
      // Wie Alt + Plus/Minus auch aus Formularen heraus.
      if (istNormalgroesseTaste(e)) {
        e.preventDefault();
        merken();
        useBrailleA11y.getState().resetZoom();
        return;
      }
      // Buchstaben-Kürzel dürfen das Tippen in einem Eingabefeld (z. B. beim
      // Anmelden) nicht kapern — sonst frisst der Handler Tastendrücke, noch
      // bevor NVDA/JAWS sie als Eingabe erkennen (NVDA-Test 2026-07-01).
      // ★ 29.09.2026: Die Antwortfelder tragen `data-kuerzel="an"` und lassen
      // die Kürzel durch - dort steht ein Kind beim Lesen die ganze Zeit.
      // Zeichen, die man zum Schreiben braucht (`@` = Wahl + L am Mac),
      // bleiben beim Feld. Begründung und Preis: `lib/braille/kuerzelImFeld.ts`.
      if (gehoertDemFeld(e)) return;
      // Liegt ein modaler Dialog obenauf, wirkten die Trainer-Kürzel sonst auf
      // den VERDECKTEN Hintergrund und rissen den Fokus aus dem Dialog
      // (Befund 2026-07-02). Nur der Toggle, dem der offene Dialog gehört,
      // darf durch — er schließt ihn. Escape/Zoom bleiben immer frei.
      const dialogOpen = !!document.querySelector('[role="dialog"][aria-modal="true"]');
      // ★ 18.10.2026 (Johannes: „Alt + Z = wo bin ich; Alt + Y nicht mehr
      //   mitwirken lassen"): Alt + Z - Runden-Anzeige ansagen (wie „Zeile X
      //   von Y" in Tastenflow); Esc springt danach zurück ins Eingabefeld.
      //   Bis dahin wirkten `KeyZ` UND `KeyY` - jetzt zählt der AUFGEDRUCKTE
      //   Buchstabe (`istAltBuchstabe`), auf QWERTZ wie auf QWERTY.
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
          // ★ 18.10.2026: Alt + G - zur nächsten Überschrift, wie in Tastenflow
          //   und eine andere App der Plattform . Gemeldet mit DIESER App-Stimme (`speakUi` aus
          //   `lib/braille/voice`, dazu die Statuszeile für die Braillezeile) -
          //   die Fassung in `lib/typing/ueberschriften.ts` spräche mit der
          //   Tastenflow-Stimme und deren Schalter.
          if (dialogOpen) return;
          e.preventDefault();
          ueberschriftSpringen({
            melden: (text) => {
              pushPageStatus(text);
              speakUi(text);
            },
            mitteRollen: true,
          });
          break;
        case "KeyL":
          // Alt+L — Zeichenliste (alle Zeichen/Kürzungen des Bereichs) öffnen/
          // schließen. Früher Alt+Z; das ist jetzt die Runden-Anzeige.
          if (dialogOpen && !useBraillePlay.getState().charsOpen) return;
          e.preventDefault();
          useBraillePlay.getState().requestChars();
          break;
        case "KeyO":
          // Alt+O — Einstellungen (Schriftsystem, Sounds, Fehler-Tipp,
          // Vorlesen) öffnen/schließen. Charge „SCHLANK" (20.09.2026): Leiste 2
          // ist weg, ihr Inhalt wohnt jetzt hinter dem Zahnrad der Kopfzeile.
          if (dialogOpen && !useBraillePlay.getState().settingsOpen) return;
          e.preventDefault();
          useBraillePlay.getState().requestSettings();
          break;
        case "KeyS":
          // Alt+S - „Meine Statistik" öffnen/schließen (22.09.2026,
          // [[feedback_data_transparency]]). Nur für ein Kind: eine
          // Lehrkraft hat hier keine eigene Auswertung, und ohne Konto gibt
          // es keine Werte zu zeigen.
          // ★ 18.10.2026 (Johannes: „Alt + S soll überall Meine Statistik
          //   sein"): Für alle anderen geht die Taste OHNE `preventDefault`
          //   weiter - die Kopfzeile führt eine Lehrkraft dann nach „Meine
          //   Klassen" (`klasseHref`). Ein `preventDefault` hier machte sie taub.
          if (accountRef.current?.role !== "schueler") return;
          if (dialogOpen && !showStatsRef.current) return;
          e.preventDefault();
          setShowStats((v) => !v);
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
          // Fokus zurück ins Eingabefeld der Aufgabe (wie bei Tastenflow).
          if (dialogOpen) return;
          e.preventDefault();
          useBraillePlay.getState().requestFocusInput();
          break;
        case "KeyU":
          // Fokus ins Kapitel-Auswahlfeld (Etappe) — dort blättert man dann
          // direkt mit Pfeil rauf/runter durch die Etappen (Johannes 03.07.).
          // ★ 30.08.2026 von Alt + K auf Alt + U umbelegt (Entscheidung
          //   Johannes): Alt + K ist seither plattformweit der Farbschalter der
          //   Kopfzeile, Alt + U plattformweit die Kapitel-/Unit-Auswahl.
          //   Begründung und der ehrliche Preis stehen in `src/lib/shortcuts.ts`.
          if (dialogOpen) return;
          e.preventDefault();
          useBraillePlay.getState().requestFocusEtappe();
          break;
        // ★ Die Konto-Taste (25.08.2026 Alt + A, heute Alt + J) wird von der
        // gemeinsamen Kopfzeile behandelt (`AppKopfzeile`), damit sie in allen
        // Programmen dasselbe tut: abgemeldet die Anmeldung, angemeldet das
        // Konto-Menü.
        // Hier stand bis dahin ein eigener Zweig, der im angemeldeten Zustand
        // nur „Du bist schon angemeldet als …" sagte - eine Sackgasse. Bliebe
        // er stehen, liefe die Taste doppelt.
        case "Digit1":
        case "Numpad1":
          if (dialogOpen) return;
          e.preventDefault();
          useBraillePlay.getState().requestArea("basis");
          break;
        case "Digit2":
        case "Numpad2":
          if (dialogOpen) return;
          e.preventDefault();
          useBraillePlay.getState().requestArea("voll");
          break;
        case "Digit3":
        case "Numpad3":
          if (dialogOpen) return;
          e.preventDefault();
          useBraillePlay.getState().requestArea("computer");
          break;
        case "Digit4":
        case "Numpad4":
          if (dialogOpen) return;
          e.preventDefault();
          useBraillePlay.getState().requestArea("kurzschrift");
          break;
        case "Digit5":
        case "Numpad5":
          if (dialogOpen) return;
          e.preventDefault();
          useBraillePlay.getState().requestArea("ueb");
          break;
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [embed, zoomIn, zoomOut]);

  if (embed) {
    return (
      <div className="min-h-screen p-3">
        <div className="mx-auto w-full max-w-3xl">
          <BrailleExercise
            levelId={levelParam}
            direction={embedDirection}
            allowDirectionToggle={embedToggle}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-6">
      {/* Seiten-Statuszeile für Kürzel-Rückmeldungen — immer gemountet. */}
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {pageStatus}
      </div>
      <div className={`mx-auto w-full${zoom <= 1 ? " max-w-[100rem]" : ""}`}>
        <div className="mb-4">
          <AppKopfzeile
            titel="Punktgenau"
            // Das App-Zeichen steht VOR dem Titel - wie in den Geschwistern.
            // `beschreibung` macht es zu einem echten Bild mit Bildbeschreibung.
            zeichen={
              <PunktgenauLogo
                beschreibung={pg<boolean | string>(true, (t) => t.kopf.logoBeschreibung)}
                className="h-9 w-9"
              />
            }
            beta={istBeta("braille")}
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
            // „Meine Statistik" im Konto-Menü (22.09.2026) - derselbe geteilte
            // Baustein wie in Tastenflow (`AppKopfzeile.onStatistik`), hier
            // zum ersten Mal in Punktgenau angeschlossen. Nur für ein Kind;
            // eine Lehrkraft sieht ihre Klassen unter „Meine Klassen".
            onStatistik={isPupil ? () => setShowStats(true) : undefined}
            klasseHref={meineKlasseHref("braille")}
            // ★ 31.08.2026: Die Farbwahl im Menü Alt + K wechselte den Kontrast
            // auf der ganzen Seite, ohne ein Wort zu sagen (gemessen:
            // `pruefstand/kind/protokolle/farbwahl-vier-apps-vorher.txt`). In
            // Tastenflow ist das seit `df2696b0` behoben; Johannes hat am
            // 31.08. freigegeben, es hier nachzuziehen.
            // Die gemeinsame Kopfzeile spricht NICHT selbst - sie meldet nur
            // das Etikett, und jede App sagt es mit ihrer eigenen Stimme.
            // Spräche die Kopfzeile, redete hier die Tastenflow-Stimme mit,
            // auch wenn ein Kind das Vorlesen in Punktgenau ausgeschaltet hat.
            // `speakUi` prüft genau diesen Schalter (`braille-voice`).
            onFarbeGewaehlt={(label) => speakUi(ansageGewaehlt(label, ansageSprache(lehrSprache())))}
            // Nach dem Nachrichten-Fenster: Fokus zurück ins Braille-Eingabefeld.
            bellAfterClose={() => useBraillePlay.getState().requestFocusInput()}
            // ★★ Escape im Konto- und im Farbmenü folgt derselben Hausregel:
            //    zurück ins Übungsfeld. Beide Rückrufe gibt es an der
            //    gemeinsamen Kopfzeile seit dem 25.08. bzw. 30.08.2026; bisher
            //    hat nur Tastenflow sie benutzt. Punktgenau reicht denselben
            //    Weg herein - kein zweiter Nachbau
            //    ([[feedback_platform_parity]]).
            escAfterClose={zurueckInsUebungsfeld}
            // ★★ Der Schriftzug „Punktgenau" ist der Heimweg: schließt alles
            //    Offene und setzt den Fokus ins Übungsfeld - genau wie Escape.
            onZumProgramm={zurueckInsUebungsfeld}
            // ★ Vorlese-Schalter in der Kopfzeile (30.08.2026, Auftrag
            //   Johannes). Er greift auf denselben Weg zu wie Alt + V und der
            //   Knopf in der Werkzeugzeile - kein eigener Zustand, keine
            //   zweite Ansage.
            onVorlesen={vorlesenUmschalten}
            vorlesenAn={vorlesenAn}
            // ★ Johannes, 17.10.2026: unter dem Lautsprecher ein Menü mit allen
            //   Akustik-Einstellungen - dasselbe Menü wie in Klangpunkte.
            akustikMenue={{
              tipp: pg(BRAILLE_AKUSTIK_TIPP, (t) => t.kopf.klangTipp(altAnzeige("Alt + V"))),
              name: pg(AKUSTIK_KNOPF_NAME, (t) => t.kopf.klangUndVorlesen), // ★ in allen Apps gleich (Johannes, 18.10.2026)
              inhalt: <BrailleAkustik onVorlesen={vorlesenUmschalten} fehlerTipp />,
            }}
            // ⚙ Einstellungen (Alt + O, Charge „SCHLANK" 20.09.2026): Schrift-
            //   system, Sounds, Fehler-Tipp und Vorlesen (Tempo/Stimme) wohnen
            //   jetzt in einem Dialog statt in der zweiten Werkzeugleiste über
            //   der Übung. Der Rückruf läuft über denselben Play-Speicher wie
            //   Alt + O selbst - der Zustand bleibt in `Punktgenau.tsx`, hier
            //   wird nur der Knopf angeschlossen. Kein `einstellungenOffen`:
            //   das Zahnrad öffnet ein FENSTER, keinen Aufklappbereich - die
            //   Kopfzeile setzt dafür von selbst `aria-haspopup="dialog"`
            //   (dieselbe Bauart wie eine andere App der Plattform und Tastenflow).
            onEinstellungen={() => useBraillePlay.getState().requestSettings()}
            // App-eigener Schalter GANZ LINKS in der Werkzeug-Reihe: die
            // Zeichenliste (Alt + L) - bis 20.09.2026 in der zweiten
            // Werkzeugleiste über der Übung, jetzt ganz oben, immer erreichbar.
            // Eigenes Sinnbild statt des früheren 📖 (Bauart dieser App: keine
            // Emoji als Sinnbild).
            extra={
              <>
              <Tipp text={altAnzeige(pg("Liste aller Zeichen und Kürzungen dieses Bereichs (Alt + L)", (t) => t.kopf.zeichenlisteTipp))}>
                {(tippId) => (
                  <button
                    type="button"
                    aria-pressed={zeichenlisteOffen}
                    onClick={() => useBraillePlay.getState().requestChars()}
                    aria-keyshortcuts="Alt+L"
                    aria-label={pg("Zeichenliste", (t) => t.kopf.zeichenliste)}
                    aria-describedby={tippId}
                    className={zeichenlisteRundKlasse(zeichenlisteOffen)}
                  >
                    <BrailleZellenZeichen className="h-[22px] w-[22px]" />
                  </button>
                )}
              </Tipp>
              </>
            }
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
          ) : account ? (
            <AccountTrainer key={sprache === "de" ? account.id : `${account.id}-${sprache}`} account={account} />
          ) : (
            // Nicht angemeldet ⇒ keine Klasse (Johannes 20.09.2026). Siehe
            // `ohneKlasse` in Punktgenau.
            <Punktgenau key={sprache === "de" ? "anon" : `anon-${sprache}`} ohneKlasse />
          )}
        </div>

      </div>

      {showPasswort && account && (
        <Modal title="Passwort ändern" onClose={zurueckInsUebungsfeld}>
          <ChangeOwnPasswordCard
            minLen={isTeacher ? 6 : 4}
            tone={isTeacher ? "sie" : "du"}
            change={(a, n) => brailleBackend().changeOwnPassword(a, n)}
            immerOffen
          />
        </Modal>
      )}

      {showStats && account && (
        <Modal title="Meine Statistik" onClose={zurueckInsUebungsfeld} size="lg">
          <MeineStatistik account={account} />
        </Modal>
      )}

      {showHelp ? (
        <Modal title={pg("Punktgenau — Hilfe", (t) => t.kopf.titelHilfe)} onClose={zurueckInsUebungsfeld} size="lg">
          {pgTexte() ? (
            <PunktgenauHilfeFr
              tastenliste={<ShortcutList />}
              hinweis={pgTexte()!.kopf.screenreaderHinweis(altAnzeige("Alt + V"))}
            />
          ) : (
          <div className="space-y-4 text-sm">
            <div>
              <p className="font-semibold text-ink">Die Tastatur als Braille-Maschine</p>
              <p className="mt-1 text-ink-muted">
                Sechs Tasten entsprechen den sechs Punkten einer Braille-Zelle. Mehrere Tasten gleichzeitig drücken ergibt ein Zeichen:
              </p>
              {/* Liste statt Tabelle: die Braillezeile liest jede Zuordnung als
                  EINE Zeile am Stück (keine Tabellennavigation nötig). */}
              <ul className="m-0 mt-2 list-none space-y-1 p-0 text-sm">
                <li>
                  <span className="font-mono">F · D · S</span>{" "}
                  <span className="text-ink-muted">— Punkte 1, 2, 3 (links)</span>
                </li>
                <li>
                  <span className="font-mono">J · K · L</span>{" "}
                  <span className="text-ink-muted">— Punkte 4, 5, 6 (rechts)</span>
                </li>
                <li>
                  <span className="font-mono">Leertaste</span>{" "}
                  <span className="text-ink-muted">— Leerzeichen</span>
                </li>
              </ul>
            </div>
            {/* ★★ DIE ZEICHENERKLÄRUNG (Bauart §7.1) - kurz, und an EINER
                Stelle. Wer ein Zeichen benutzt, erklärt es. */}
            <Zeichenerklaerung
              zeichen={[
                { zeichen: "␣", bedeutung: "hier gehört eine Lücke hin - du drückst die Leertaste." },
                { zeichen: "·", bedeutung: "trennt zwei Tasten oder zwei Angaben, die zusammengehören." },
                { zeichen: "⌫", bedeutung: "die Rücktaste - sie löscht die letzte Zelle." },
                { zeichen: "→", bedeutung: "dann, oder: das wird daraus." },
              ]}
            />
            <div>
              <p className="font-semibold text-ink">Warum eine Braillezeile?</p>
              <p className="mt-1 text-ink-muted">
                Braille ist eine <strong>Tastschrift</strong> — sie wird mit den
                Fingerkuppen gelesen, nicht mit den Augen. Am Bildschirm siehst du
                die Punkte; das hilft beim Schreiben (mehrere Tasten = eine Zelle)
                und beim Erkennen der Muster. Wirklich <em>lesen</em> lernt man
                Braille aber erst, wenn man die Punkte fühlt. Eine Braillezeile
                hebt unter jeder Zelle kleine Stifte, sodass das angezeigte Zeichen
                ertastbar wird — Punktgenau kann eine angeschlossene Zeile ansteuern
                (wo der Browser es unterstützt; sonst läuft der Tast-Pfad als Audio).
                Erst am echten Punktbild greifen die Lesetechniken: leichter Druck
                („die Punkte streicheln“), beidhändiges Lesen und flüssiges Gleiten
                über die Zeile. Für sehende Studierende ist die Zeile zugleich die
                ehrlichste Erfahrung, warum taktiles Lesen Übung braucht.
              </p>
            </div>
            <div>
              <p className="font-semibold text-ink">Bereiche und Etappen</p>
              <p className="mt-1 text-ink-muted">
                Oben wählst du einen Bereich: Basisschrift, Vollschrift, Computer, Kurzschrift oder UEB (Englisch). Darin geht es Etappe für Etappe weiter — jede Etappe bringt neue Zeichen und schaltet erst die nächste frei, wenn sie sicher sitzt.
              </p>
            </div>
            <div>
              <p className="font-semibold text-ink">Die Wochenaufgabe</p>
              <p className="mt-1 text-ink-muted">
                Deine Lehrkraft kann dir eine Aufgabe für die Woche geben:
                eine Zeit zum Üben, eine Anzahl Aufgaben oder Etappen — oder
                mehrere davon. Sie steht dann oben in der Leiste, zusammen mit
                deinem Stand („4 von 10 Aufgaben“). Sobald du sie geschafft
                hast, steht es dort. Gibt es keine, steht dort auch nichts.
              </p>
              <p className="mt-1 text-ink-muted">
                Wann eine Woche zu Ende ist, hängt an eurer Unterrichtsstunde:
                Ist der Unterricht zum Beispiel am Donnerstag um 14 Uhr aus,
                beginnt die neue Woche genau dann. Ohne eingetragene Stunde
                läuft die Woche von Montag bis Sonntag.
              </p>
            </div>
            <div>
              <p className="font-semibold text-ink">Basisschrift — warum diese Buchstaben-Reihenfolge?</p>
              <p className="mt-1 text-ink-muted">
                Basisschrift schreibt jeden Buchstaben als eigene Zelle, ohne
                jede Kürzung — die Grundlage aller anderen Systeme. Der Lernweg
                folgt nicht dem Alphabet, sondern der erprobten Didaktik des
                Braille-Erstleseunterrichts: zuerst taktil gut unterscheidbare,
                häufige Buchstaben, mit denen sofort echte Wörter entstehen
                (l, a, i, m → „Mama“, „Lama“). Verwechselbare Zeichen werden bewusst
                getrennt eingeführt; die Großschreibung kommt früh über Eigennamen.
                Die Übungswörter sind selbst zusammengestellt, die Lernreihenfolge
                stammt aus der Fachdidaktik.
              </p>
              <p className="mt-2 text-xs text-ink-muted">
                <span className="font-medium text-ink">Quellen:</span> Lang, M.:
                {" "}<em>Lesen und Schreiben</em> (in: Lang/Hofer (Hrsg.),{" "}
                <em>
                  Didaktik des Unterrichts mit blinden und hochgradig
                  sehbehinderten Schülerinnen und Schülern
                </em>
                , Kohlhammer) — Tab. 1.4 „Reihenfolge der ersten 10
                Zeicheneinführungen in Fibeln für blinde Kinder“ ·{" "}
                <em>Fibel für blinde Kinder</em> (Paul-und-Charlotte-Kniese-Stiftung)
                {" "}· Lang, M.: <em>Auf der Taststraße zur Punktschrift</em> ·
                Mangold, S.: <em>Developmental Program of Tactile Perception and
                Braille Letter Recognition</em>.
              </p>
            </div>
            <div>
              <p className="font-semibold text-ink">Vollschrift</p>
              <p className="mt-1 text-ink-muted">
                Vollschrift baut auf der Basisschrift auf und fasst zusätzlich
                acht häufige Lautgruppen (au, äu, eu, ei, ie, ch, sch, st) zu je
                einer Zelle zusammen. Im Alltag ist sie die eigentlich
                gebräuchliche Braille-Grundschrift — reine Basisschrift ohne
                jede Lautgruppen-Zusammenfassung wird kaum genutzt und dient
                hier vor allem als didaktisches Gerüst. Die Reihenfolge
                Basis → Voll → Kurz ist zugleich die amtliche Schul-Reihenfolge:
                Vollschrift sicher bis Ende der Grundschule, Kurzschrift ab
                Klasse 5/6.
              </p>
              <p className="mt-2 text-xs text-ink-muted">
                <span className="font-medium text-ink">Quellen:</span> Regelwerk{" "}
                <em>Das System der deutschen Brailleschrift</em>
                {" "}(Brailleschriftkomitee der deutschsprachigen Länder, BSKDL) —
                es definiert die acht Lautgruppenkürzungen der Vollschrift ·
                Schul-Reihenfolge Basis→Voll→Kurz: LehrplanPLUS Bayern. Die
                Punktmuster stammen aus der Bibliothek <em>liblouis</em>{" "}
                (Tabelle de-g1, LGPL).
              </p>
            </div>
            <div>
              <p className="font-semibold text-ink">Computerbraille</p>
              <p className="mt-1 text-ink-muted">
                Computerbraille nutzt <strong>acht Punkte</strong> (1–8): jedes
                Zeichen ist genau <em>eine</em> Zelle — kein Zahlzeichen, kein
                eigenes Vorzeichen für Großbuchstaben (Großschreibung über
                Punkt 7 in derselben Zelle) und keine Kürzungen. Direkt
                eins-zu-eins, so wie ein Computer oder eine Braillezeile Text
                Zeichen für Zeichen anzeigt — ideal für E-Mail, Passwörter und
                Code.
              </p>
              <p className="mt-2 text-xs text-ink-muted">
                <span className="font-medium text-ink">Quellen:</span> Regelwerk{" "}
                <em>Das System der deutschen Brailleschrift</em>
                {" "}(BSKDL) — es definiert das 8-Punkt-Computerbraille
                (Eurobraille). Die Zusatzzeichen (Klammern, Code- und
                Sonderzeichen) stammen aus liblouis de-chardefs8.cti (LGPL).
              </p>
            </div>
            <div>
              <p className="font-semibold text-ink">Kurzschrift</p>
              <p className="mt-1 text-ink-muted">
                Kurzschrift kürzt ganze Wörter und Wortteile auf wenige Zellen.
                Punktgenau folgt dabei der 48-Lektionen-Struktur von{" "}
                <em>Kurzschrift für alle</em>: die häufigsten einformigen
                Wortkürzungen zuerst (die, der, das, und), dann Lautgruppen,
                Vor- und Nachsilben und Wortstämme — thematisch in „Welten“
                gebündelt.
              </p>
              <p className="mt-2 text-ink-muted">
                Herzlichen Dank an <strong>Petra Aldridge</strong> und{" "}
                <strong>Vivian Aldridge</strong> — sie sind, gemeinsam mit
                Anita Häni, die Urheber:innen dieses Lehrwerks; Aufbau und
                Kürzungsinventar dieses Bereichs folgen ihrem Lehrgang.
              </p>
              <p className="mt-2 text-xs text-ink-muted">
                <span className="font-medium text-ink">Quellen:</span>{" "}
                Aldridge, P. / Aldridge, V. / Häni, A.:{" "}
                <em>Kurzschrift für alle</em> (3. Aufl. 2020, braille.ch/kfa) —
                48-Lektionen-Struktur und Kürzungsinventar · Regelwerk{" "}
                <em>Das System der deutschen Brailleschrift</em> (BSKDL, Regeln
                2018). Die Punktmuster erzeugt liblouis (Tabelle de-g2, LGPL);
                Übungswörter und Merksätze sind selbst formuliert — kein
                Lehrwerks-Text kopiert.
              </p>
            </div>
            <div>
              <p className="font-semibold text-ink">UEB — englische Kurzschrift (Grade 2)</p>
              <p className="mt-1 text-ink-muted">
                Der Bereich <strong>UEB</strong> bringt dir die englische
                Kurzschrift bei (Unified English Braille, Grade 2) — nach
                demselben Prinzip wie die deutsche Kurzschrift, nur mit
                englischen Kürzungen. Eine kurze Brücken-Etappe für bereits
                Braille-kundige Kinder zeigt zuerst Großzeichen, Zahlzeichen und
                Satzzeichen; danach folgt der eigentliche Kurzschrift-Kern mit
                Wortkürzungen, Gruppenkürzungen und Shortforms.
              </p>
              <p className="mt-2 text-xs text-ink-muted">
                <span className="font-medium text-ink">Quellen:</span>{" "}
                <em>Unified English Braille: Australian Training Manual 2013</em>
                {" "}(Howse/Riessen/Holloway, Round Table on Information Access,
                CC BY-NC-ND 3.0) — die 31-Lektionen-Folge, auf der auch UEB
                Online aufbaut; umgesetzt sind die Lektionen 4–22
                (Kurzschrift-Kern) · Kürzungsdefinitionen:{" "}
                <em>The Rules of Unified English Braille</em> (ICEB). Die
                Punktmuster erzeugt liblouis (Tabelle en-ueb-g2, LGPL);
                Übungstexte stammen aus einem eigenen englischen Wortschatz.
              </p>
            </div>
            {/* KI-Transparenz (Art. 50 KI-VO, 2026-08-03): Eigenanteil ehrlich
                benennen — die didaktischen Grundlagen bleiben den genannten
                Urheber:innen zugeschrieben. */}
            <div>
              <p className="font-semibold text-ink">
                Mit KI gebaut — von Menschen geprüft 🤖
              </p>
              <p className="mt-1 text-ink-muted">
                Das Programm selbst sowie die eigenen Übungswörter und
                Merksätze hat Johannes Weingartner{" "}
                <strong>mit Hilfe von künstlicher Intelligenz (KI)</strong>{" "}
                erstellt und selbst geprüft. Die Lernwege stammen von den oben
                genannten Fachleuten: Aufbau und Kürzungsinventar der
                Kurzschrift von Petra Aldridge, Vivian Aldridge und Anita Häni
                (<em>Kurzschrift für alle</em>), der UEB-Bereich vom{" "}
                <em>Australian Training Manual</em>; die Punktmuster liefert
                liblouis.
              </p>
            </div>
            <div>
              <p className="font-semibold text-ink">Rang, Stufe und XP</p>
              <p className="mt-1 text-ink-muted">
                <strong>XP</strong> bekommst du für jede gelöste Aufgabe (2 XP)
                und einen großen Schub, wenn eine Etappe sitzt (30 XP). XP
                zählen über alle Bereiche zusammen und werden nie weniger.
              </p>
              <p className="mt-2 text-ink-muted">
                <strong>Rang</strong> wächst mit deinen gesamten XP (alle 100
                XP ein Rang mehr) — er ist dein Gesamt-Fortschritt in
                Punktgenau und sinkt nie.
              </p>
              <p className="mt-2 text-ink-muted">
                <strong>Stufe</strong> (1 bis 10) zeigt, wie sicher du gerade
                in einem Bereich bist — jeder Bereich (Basisschrift,
                Vollschrift, Computer, Kurzschrift, UEB) hat seine eigene
                Stufe. Tippst du viel richtig, steigt sie; häufen sich Fehler,
                sinkt sie wieder. Bei niedriger Stufe bekommst du mehr
                Unterstützung (z. B. kürzere Wörter); bei hoher Stufe läufst
                du ohne Stütze.
              </p>
            </div>
            <div>
              <p className="font-semibold text-ink">Fehler-Tipp</p>
              <p className="mt-1 text-ink-muted">
                Tippst du eine falsche Zelle, sagt die App die richtigen Punkte
                an — und mit eingeschaltetem <strong>Fehler-Tipp</strong> dazu,
                welcher Punkt fehlt oder zu viel ist, samt Lage (z. B. „Es
                fehlt Punkt 1 — oben links"). Wen das stört, schaltet den Tipp
                über den Knopf „Fehler-Tipp" in der Schalterleiste ab.
              </p>
            </div>
            <div>
              <p className="font-semibold text-ink">
                Einstellungen deiner Lehrkraft
              </p>
              <p className="mt-1 text-ink-muted">
                Alle Etappen sind für alle offen: Du kannst in der Liste jedes
                Kapitel wählen, auch ohne das vorige gemeistert zu haben. Der
                Lernweg läuft trotzdem wie gewohnt weiter - „Nächste Etappe“
                bringt dich zum nächsten Kapitel. Diese Dinge kann deine
                Lehrkraft für die ganze Klasse einstellen:
              </p>
              <ul className="m-0 mt-2 list-none space-y-2 p-0 text-ink-muted">
                <li>
                  <strong className="text-ink">Erweiterte Zahlen</strong> — in
                  der Basisschrift kommen nach den Zahlen fünf Zusatz-Etappen:
                  römische Zahlen, Datum, Brüche, Prozent und Paragraf.
                </li>
                <li>
                  <strong className="text-ink">Express-Umstieg
                  Computerbraille</strong> — für alle, die die Vollschrift
                  schon sicher können: Der Bereich Computer zeigt dann acht
                  kompakte Umstiegs-Etappen, die gezielt die Unterschiede üben
                  (Großschreibung über Punkt 7, Zahlen ohne Zahlzeichen, jedes
                  Zeichen genau eine Zelle) — statt des regulären Aufbaus von
                  Grund auf.
                </li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-ink">Konto und Spielstand</p>
              <p className="mt-1 text-ink-muted">
                Ohne Anmeldung bleibt der Fortschritt auf diesem Gerät gespeichert. Mit einem Schüler:innen-Konto wird der Spielstand auf dem Server gesichert und die Lehrkraft sieht Auswertungen.
              </p>
              <p className="mt-1 text-ink-muted">{OHNE_KLASSE_HILFE}
              </p>
            </div>
            <hr className="border-hairline" />
            <div>
              <p className="font-semibold text-ink">Tastenkombinationen</p>
              <ShortcutList />
              <p className="mt-2 text-xs text-ink-muted">
                Hast du schon einen Screenreader (NVDA/VoiceOver)? Dann lass Vorlesen ({altAnzeige("Alt + V")}) aus - der Screenreader liest bereits alle Ansagen über die ARIA-Regionen.
              </p>
            </div>
          </div>
          )}
        </Modal>
      ) : null}

      {showShortcuts ? (
        // Echte Modal-Komponente statt Hand-Overlay: Fokus-Falle + Fokus-
        // Rückgabe an den Auslöser (das Hand-Overlay hatte beides nicht).
        <Modal title={pg("Tastenkürzel", (t) => t.kopf.titelKurztasten)} onClose={zurueckInsUebungsfeld}>
          <ShortcutList />
        </Modal>
      ) : null}
      <RechtlichesFusszeile unterstuetzenApp="braille" />
    </div>
  );
}

/**
 * Übungs-Ansicht für ein angemeldetes Konto: Spielstand liegt im Backend (lokal
 * oder Server), wird einmal vorgeladen; Speichern + Telemetrie laufen nebenbei.
 */
function AccountTrainer({ account }: { account: BrailleAccount }) {
  const backend = brailleBackend();
  const [initial, setInitial] = useState<BrailleProgress | null>(null);
  // Lern-Einstellungen der Klasse (Lehrkraft-gesteuert) — VOR dem Mount laden,
  // damit Bereiche/Gates von Anfang an stimmen. undefined = lädt noch.
  const [settings, setSettings] = useState<BrailleClassSettings | null | undefined>(
    account.role === "schueler" && account.classCode ? undefined : null,
  );
  const [showMatrix, setShowMatrix] = useState(false);
  // ★ Escape schliesst auch die aufgeklappte Verwechslungs-Tafel; den Fokus
  //   holt danach die Seite ins Uebungsfeld (siehe `zurueckInsUebungsfeld`).
  useEffect(() => {
    const zu = () => setShowMatrix(false);
    window.addEventListener(PUNKTGENAU_ESC, zu);
    return () => window.removeEventListener(PUNKTGENAU_ESC, zu);
  }, []);
  const matrixRef = useRef<HTMLDivElement>(null);
  /**
   * ★ Die bisherigen Aufgaben - NUR für den Stand der Wochenaufgabe
   *   (07.09.2026). Ohne Wochenaufgabe wird die Liste nie gebraucht; geladen
   *   wird sie trotzdem einmal, weil erst die Klassen-Einstellungen sagen, ob
   *   eine gestellt ist, und zwei nacheinander wartende Ladevorgänge den
   *   Trainer sichtbar später starten ließen.
   *   `null` = lädt noch; der Trainer wartet darauf NICHT (er zeigt die
   *   Wochenaufgabe dann eine Wimper später).
   */
  const [events, setEvents] = useState<TaskEvent[] | null>(null);

  useEffect(() => {
    let alive = true;
    backend.getProgress(account.id).then((p) => {
      if (alive) setInitial(p);
    });
    backend
      .getEvents(account.id)
      .then((ev) => {
        if (alive) setEvents(ev);
      })
      // Eine fehlende Ereignisliste darf das Üben nicht anhalten - dann steht
      // die Wochenaufgabe eben ohne bisherigen Stand da.
      .catch(() => {
        if (alive) setEvents([]);
      });
    if (account.role === "schueler" && account.classCode) {
      backend
        .getClassSettings(account.classCode)
        .then((s) => {
          if (alive) setSettings(s);
        })
        .catch(() => {
          if (alive) setSettings(null); // Standard-Lernweg
        });
    }
    return () => {
      alive = false;
    };
  }, [backend, account.id, account.role, account.classCode]);

  if (!initial || settings === undefined) {
    return <p className="text-ink-muted">Spielstand wird geladen …</p>;
  }

  // ★ SPENDENBANNER (18.09.2026), NUR für Selbstlernende ohne Klasse - siehe
  // Tastenflow-Pendant in `TippenTrainerPage.tsx`. `events` trägt hier ohnehin
  // schon die GANZE Geschichte des Kontos (oben geladen für die Wochenaufgabe).
  const spendenbannerStundenGesamt =
    account.selfManaged && events ? minutenAus(events, leseTempoAus(initial)) / 60 : null;
  // ★ 21.09.2026: dasselbe für die letzten sechs Monate (Bitte nach einem Jahr).
  const spendenbannerStundenHalbjahr =
    account.selfManaged && events
      ? minutenAus(spendenBannerImHalbjahr(events), leseTempoAus(initial)) / 60
      : null;

  return (
    <div className="space-y-4">
      {account.selfManaged && (
        <SpendenBanner
          app="braille"
          zielgruppe="selbstlernend"
          kontoId={account.id}
          stundenGesamt={spendenbannerStundenGesamt}
          stundenHalbjahr={spendenbannerStundenHalbjahr}
          name={account.name}
        />
      )}
      <Punktgenau
        loadFn={() => initial}
        saveFn={(p) => {
          void backend.saveProgress(account.id, p);
        }}
        onTask={(e) => {
          void backend.recordEvent(account.id, { ts: Date.now(), ...e });
        }}
        classSettings={settings}
        accountId={account.id}
        /* ★ Das ganze Konto - gebraucht für Klassenmatch und Braille-Challenge
           (22.09.2026). `accountId` allein reicht dort nicht: eine Einladung
           trägt den NAMEN des Kindes, das einlädt, und ohne ihn steht in der
           Einladung der anderen Kinder niemand drin. */
        account={account}
        // ★ Klassencode NUR für die gesperrten Unterrichtsstunden der Klasse
        // (22.09.2026, siehe `Punktgenau.tsx` „STUNDE GESPERRT WIRKT AUCH
        // BEIM KIND") - fehlt er (Selbstlernende, Lehrkraft, Studierende),
        // gibt es nichts zu sperren.
        classCode={account.role === "schueler" ? account.classCode : undefined}
        // ★ Gehört diese Person zu KEINER Klasse (Johannes 20.09.2026)? Das
        // entscheidet ZWEI Dinge zugleich - die Reihenfolge-Sperre („nur
        // Schüler müssen sie der Reihe nach machen oder die Lehrkraft gibt
        // frei") und, seither, ob die Großschreibzeichen-Einstellung der
        // Person selbst gehört oder der Klasse. Selbstlernende Konten,
        // Lehrkräfte und Studierende gehören zu keiner Klasse - für sie gibt
        // es niemanden, dem die Reihenfolge etwas zusichert oder der für sie
        // einstellt. Genau dieselbe Bedingung entscheidet oben, ob überhaupt
        // Klassen-Einstellungen geladen werden.
        ohneKlasse={!(account.role === "schueler" && !!account.classCode)}
        events={events ?? undefined}
      />
      <div className="card p-4">
        <button
          type="button"
          className="btn-secondary text-sm"
          data-verwechslungen=""
          aria-expanded={showMatrix}
          onClick={() => {
            const next = !showMatrix;
            setShowMatrix(next);
            // Reveal-Fokus-Muster: aufgedeckten Inhalt aktiv fokussieren,
            // sonst „passiert" für Screenreader-Nutzer scheinbar nichts.
            if (next) window.setTimeout(() => matrixRef.current?.focus(), 0);
          }}
        >
          {showMatrix
            ? pg("▲ Meine Verwechslungen ausblenden", (t) => t.verwechslungen.knopfAusblenden)
            : pg("▼ Meine Verwechslungen anzeigen", (t) => t.verwechslungen.knopfZeigen)}
        </button>
        {showMatrix && (
          <div ref={matrixRef} tabIndex={-1} className="mt-3 outline-none">
            <BrailleConfusionPanel accountId={account.id} viewer="schueler" />
          </div>
        )}
      </div>
    </div>
  );
}
