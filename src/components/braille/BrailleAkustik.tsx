/**
 * Das Akustik-Menü von Punktgenau und Klangpunkte - es klappt unter dem
 * runden Lautsprecher der Kopfzeile auf (Johannes, 17.10.2026: „schau die
 * anderen Apps der Lernwerkstatt an … und bau auch so einen Schalter ein").
 *
 * Beide Apps sprechen über denselben Motor (`lib/braille/voice.ts`) und
 * klingen über dieselben Töne (`lib/braille/sound.ts`, `earcons.ts`) - darum
 * EIN Menü. Klangpunkte hängt seine Musik (Instrument, Lautstärke der Musik)
 * über `extra` an.
 *
 * ★ Kartenform wie Tastenflow seit 18.10.2026: je Bereich eine Karte mit
 * Symbol, Name und Schalter, darunter schlanke Regler mit Symbol.
 *
 * Neu dabei (vorher fehlte es in beiden Apps): Lautstärke der Stimme,
 * Lautstärke der Töne, Sprechtempo stufenlos statt in vier Stufen.
 * Alles gilt auf diesem Gerät. Die Bausteine: `components/AkustikBausteine.tsx`.
 */
import type { ReactNode } from "react";
import {
  AkustikAuswahl, AkustikKarte, AkustikRahmen, AkustikRegler, akustikKnopfTipp, kurzProzent, prozentText, tempoText,
} from "@/components/AkustikBausteine";
import { primeSpeech, speak, useAvailableVoices, useVoice } from "@/lib/braille/voice";
import { setSoundMuted, setTonLautstaerke, useBrailleTon } from "@/lib/braille/sound";
import { playCorrectTick } from "@/lib/braille/earcons";

export const BRAILLE_AKUSTIK_TIPP = akustikKnopfTipp();

const VOICE_LANGS = new Set(["de", "en"]);

export interface BrailleAkustikProps {
  /** Der Weg der Seite, der auch die Ansage „Vorlesen an/aus" macht - derselbe wie Alt + V. */
  onVorlesen: () => void;
  /** Nur Punktgenau: der Fehler-Tipp (welcher Punkt fehlt oder zu viel ist). */
  fehlerTipp?: boolean;
  /** Weitere Einstellungen der App (Klangpunkte: Musik). */
  extra?: ReactNode;
}

export function BrailleAkustik({ onVorlesen, fehlerTipp = false, extra }: BrailleAkustikProps) {
  const an = useVoice((s) => s.enabled);
  const rate = useVoice((s) => s.rate);
  const setRate = useVoice((s) => s.setRate);
  const volume = useVoice((s) => s.volume);
  const setVolume = useVoice((s) => s.setVolume);
  const voiceURI = useVoice((s) => s.voiceURI);
  const setVoiceURI = useVoice((s) => s.setVoiceURI);
  const verbalize = useVoice((s) => s.verbalizeErrors);
  const setVerbalize = useVoice((s) => s.setVerbalizeErrors);
  const muted = useBrailleTon((s) => s.muted);
  const laut = useBrailleTon((s) => s.laut);
  const voices = useAvailableVoices();
  // Die gewählte Stimme bleibt immer in der Liste, auch wenn sie nicht de/en ist.
  const stimmen = voices
    .filter((v) => VOICE_LANGS.has(v.lang.toLowerCase().slice(0, 2)) || v.voiceURI === voiceURI)
    .sort((a, b) => {
      const ad = a.lang.toLowerCase().startsWith("de") ? 0 : 1;
      const bd = b.lang.toLowerCase().startsWith("de") ? 0 : 1;
      return ad - bd || a.name.localeCompare(b.name);
    });
  /** Hörprobe der Stimme - nur, wenn das Vorlesen an ist. */
  const probeStimme = (satz = "So lese ich jetzt vor.") => {
    if (!useVoice.getState().enabled) return;
    primeSpeech();
    speak(satz);
  };
  const probeTon = () => { if (!muted) playCorrectTick(); };

  return (
    // ★ Kartenform wie Tastenflow (Johannes, 18.10.2026: „alle Akustik-Menüs
    // bekommen die Kartenform von Tastenflow"). Die Breite liefert der Rahmen
    // der Kopfzeile - hier KEIN eigenes w-80.
    <div className="max-h-[80vh] w-full overflow-y-auto">
      <AkustikRahmen titelSichtbar={false}>
        <AkustikKarte
          symbol="vorlesen"
          titel="Vorlesen"
          an={an}
          onWechsel={onVorlesen}
          erklaerung="Die App liest Aufgaben, Punkte und Rückmeldungen mit eigener Stimme vor. Mit einem Screenreader brauchst du das meist nicht. Alt + V schaltet um, Strg macht sofort still."
        >
          {an && (
            <>
              <AkustikRegler
                symbol="tempo"
                name="Sprechtempo"
                wert={rate}
                min={0.6}
                max={2}
                schritt={0.1}
                wertText={tempoText(rate)}
                kurzText={kurzProzent(rate)}
                erklaerung="Wie schnell vorgelesen wird. 100 % ist normal, weiter rechts ist schneller."
                onWert={setRate}
                onProbe={() => probeStimme()}
              />
              <AkustikRegler
                symbol="lautsprecherLeise"
                name="Lautstärke der Stimme"
                wert={volume}
                min={0.1}
                max={1}
                schritt={0.1}
                wertText={prozentText(volume)}
                kurzText={kurzProzent(volume)}
                erklaerung="Wie laut vorgelesen wird. 100 % ist so laut, wie dein Gerät gerade eingestellt ist - lauter geht es nicht."
                onWert={setVolume}
                onProbe={() => probeStimme()}
              />
              <AkustikAuswahl
                symbol="stimme"
                name="Stimme"
                wert={voiceURI}
                optionen={[{ wert: "", name: "automatisch" }, ...stimmen.map((v) => ({ wert: v.voiceURI, name: `${v.name} (${v.lang})` }))]}
                erklaerung="Welche Stimme dieses Geräts vorliest. Klingt eine Stimme bei ä, ö und ü undeutlich, wähle eine andere."
                onWert={(uri) => { setVoiceURI(uri); probeStimme("Hallo! So klingt diese Stimme."); }}
              />
            </>
          )}
        </AkustikKarte>

        {fehlerTipp && (
          <AkustikKarte
            symbol="liste"
            titel="Fehler-Tipp"
            an={verbalize}
            onWechsel={() => setVerbalize(!verbalize)}
            erklaerung="Tippst du eine falsche Zelle, sagt die Stimme zusätzlich, welcher Punkt fehlt oder zu viel ist, samt Lage - zum Beispiel: Es fehlt Punkt 1, oben links."
          />
        )}

        <AkustikKarte
          symbol="glocke"
          titel="Töne"
          an={!muted}
          onWechsel={() => setSoundMuted(!muted)}
          erklaerung="Ein kurzer Ton bei richtig und bei falsch, eine kleine Melodie, wenn eine Etappe geschafft ist. Was der Ton sagt, steht immer auch da."
        >
          <AkustikRegler
            symbol="lautsprecher"
            gedimmt={muted}
            name="Lautstärke der Töne"
            wert={laut}
            min={0}
            max={1}
            schritt={0.1}
            wertText={prozentText(laut)}
            kurzText={kurzProzent(laut)}
            erklaerung="Wie laut die Töne sind. Bei 0 % bleibt es still, auch wenn die Töne an sind."
            onWert={setTonLautstaerke}
            onProbe={probeTon}
          />
        </AkustikKarte>

        {extra}
      </AkustikRahmen>
    </div>
  );
}
