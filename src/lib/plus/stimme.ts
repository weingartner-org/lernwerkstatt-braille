/**
 * Die Stimme von Plus - eigener Schalter, eigener Speicher.
 *
 * ★ Warum Plus eine eigene Stimme bekommt und nicht die von Punktgenau
 * mitbenutzt: Der An/Aus-Schalter gehört dem Kind und der App, in der es
 * gerade sitzt. Wer in Punktgenau den Ton ausmacht, will nicht, dass Plus
 * beim nächsten Öffnen auch stumm ist - und umgekehrt.
 *
 * ★ „Ton aus" ist der Normalfall. Plus fängt still an; wer die Stimme will,
 * schaltet sie ein, und das merkt sich der Browser.
 *
 * ★ Strg macht sofort still. Nicht „nach dem Satz", sondern mitten im Wort -
 * dieselbe Geste wie in Tastenflow, Punktgenau und eine andere App der Plattform. Das Vorlesen
 * bleibt dabei an; es endet nur die laufende Ansage.
 */
import { useCallback, useEffect, useState } from "react";
import { installStummTaste } from "@/lib/stummTaste";
import { stimmeFuer } from "@/lib/sprechen/stimmeFuer";
import { plusSprache } from "./aktuelleSprache";
import { stimmKennungAktuell } from "./einstellungen";
import { plusTexte } from "./sprache";

const SCHLUESSEL = "plus_stimme";
const SCHLUESSEL_AUSSCHREIBEN = "plus_ausschreiben";

/**
 * Der Hinweis beim Einschalten - er sagt, wofür die Stimme gut ist.
 *
 * ★ Ohne ihn schaltet niemand sie ein: die Plattformregel ist „Ton aus ist der
 * Normalfall", und ein Kind, das schon einen Screenreader hört, fragt sich zu
 * Recht, wozu eine zweite Stimme.
 */
export const STIMME_HINWEIS =
  "Deine Sprachausgabe liest Rechenzeichen nicht mit. Die Stimme von Plus schon.";

/** Fehlt für die aktuelle Sprache eine Stimme auf diesem Gerät? (Deutsch: nie gefragt.) */
export function stimmeFehltFuerSprache(): boolean {
  const sprache = plusSprache();
  if (sprache === "de" || !verfuegbar()) return false;
  return !stimmeFuer(sprache, window.speechSynthesis.getVoices(), "plus", stimmKennungAktuell());
}

function verfuegbar(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

/** Sofort still - die laufende Ansage endet, der Schalter bleibt, wie er ist. */
export function stillSofort(): void {
  if (verfuegbar()) window.speechSynthesis.cancel();
}

/*
 * ★ Strg macht sofort still - dieselbe Regel wie in Tastenflow, Punktgenau,
 * Klangpunkte und eine andere App der Plattform (gehaltene Taste nur einmal, AltGr ist kein
 * Stummschalten). Bis 18.10.2026 hatte Plus eine eigene Abschrift.
 */
installStummTaste(stillSofort);

/*
 * ★ Sprechtempo und Lautstärke der Stimme (Johannes, 17.10.2026: „ein Menü mit
 * allen Akustik-Einstellungen mit Schiebereglern"). Gilt auf diesem Gerät.
 * ⚠️ Lauter als das Gerät geht nicht: Die Web-Speech-API kennt nur 0 bis 1,
 * und 1 ist die Lautstärke, die das Gerät gerade hat.
 */
const SCHLUESSEL_TEMPO = "plus_stimme_tempo";
const SCHLUESSEL_LAUT = "plus_stimme_laut";
export const TEMPO_MIN = 0.6;
export const TEMPO_MAX = 1.6;

function liesZahl(schluessel: string, vorgabe: number, min: number, max: number): number {
  try {
    const roh = window.localStorage.getItem(schluessel);
    const n = roh === null ? NaN : Number(roh);
    return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : vorgabe;
  } catch {
    return vorgabe;
  }
}

let tempo = typeof window === "undefined" ? 1 : liesZahl(SCHLUESSEL_TEMPO, 1, TEMPO_MIN, TEMPO_MAX);
let lautstaerke = typeof window === "undefined" ? 1 : liesZahl(SCHLUESSEL_LAUT, 1, 0, 1);

export function stimmeTempo(): number { return tempo; }
export function stimmeLautstaerke(): number { return lautstaerke; }

export function setzeStimmeTempo(wert: number): void {
  tempo = Math.min(TEMPO_MAX, Math.max(TEMPO_MIN, wert));
  try { window.localStorage.setItem(SCHLUESSEL_TEMPO, String(tempo)); } catch { /* egal */ }
}

export function setzeStimmeLautstaerke(wert: number): void {
  lautstaerke = Math.min(1, Math.max(0, wert));
  try { window.localStorage.setItem(SCHLUESSEL_LAUT, String(lautstaerke)); } catch { /* egal */ }
}

/** Einen Satz sagen. Ohne Sprachausgabe im Browser passiert nichts. */
export function sage(satz: string): void {
  if (!verfuegbar() || !satz.trim()) return;
  const sprache = plusSprache();
  // ★ Andere Sprachen als Deutsch: die Stimme der Sprache - und gibt es keine, wird
  // NICHT deutsch (oder sonst etwas) vorgelesen, sondern geschwiegen (Bauplan §1b).
  const stimme = sprache === "de" ? null : stimmeFuer(sprache, window.speechSynthesis.getVoices(), "plus", stimmKennungAktuell());
  if (sprache !== "de" && !stimme) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(satz);
  if (stimme) { u.voice = stimme; u.lang = stimme.lang; } else u.lang = "de-AT";
  u.rate = tempo;
  u.volume = lautstaerke;
  window.speechSynthesis.speak(u);
}

export function useStimme() {
  const [an, setAn] = useState(false);
  /**
   * „Rechnungen ausschreiben" - für Kinder, die keine Braillezeile benutzen,
   * nur zuhören und keine zweite Stimme möchten. Dann steht die Wortform im
   * Dokument, und der Screenreader liest sie selbst richtig.
   *
   * ★ Voreingestellt AUS, weil die kurze Form die Schulschreibweise ist und
   * auf der Braillezeile die richtige.
   */
  const [ausschreiben, setAusschreiben] = useState(false);

  useEffect(() => {
    try {
      setAn(window.localStorage.getItem(SCHLUESSEL) === "an");
      setAusschreiben(window.localStorage.getItem(SCHLUESSEL_AUSSCHREIBEN) === "an");
    } catch { /* ohne Speicher eben still */ }
  }, []);

  // Strg bricht ab, wo immer der Fokus gerade steht - seit 18.10.2026 über die
  // gemeinsame Regel aller Lern-Apps (`lib/stummTaste.ts`, unten beim Laden).

  const umschalten = useCallback(() => {
    setAn((vorher) => {
      const neu = !vorher;
      try { window.localStorage.setItem(SCHLUESSEL, neu ? "an" : "aus"); } catch { /* egal */ }
      if (!neu) stillSofort();
      else sage(`${plusTexte().seite.vorlesenAn} ${plusTexte().seite.stimmeHinweis}`);
      return neu;
    });
  }, []);

  const ausschreibenUmschalten = useCallback(() => {
    setAusschreiben((vorher) => {
      const neu = !vorher;
      try { window.localStorage.setItem(SCHLUESSEL_AUSSCHREIBEN, neu ? "an" : "aus"); } catch { /* egal */ }
      return neu;
    });
  }, []);

  const ansagen = useCallback((satz: string) => { if (an) sage(satz); }, [an]);

  return { an, umschalten, ansagen, ausschreiben, ausschreibenUmschalten };
}
