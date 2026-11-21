/**
 * Das Akustik-Menü von Klangpunkte - das gemeinsame Menü der Braille-Apps
 * (`BrailleAkustik`) und dazu die Musik: Instrument und Lautstärke der Musik
 * (Johannes, 17.10.2026: „bau auch so einen Schalter ein").
 *
 * ★ Die Instrumente sind in Klangpunkte INHALT, nicht Rückmeldung - darum
 * lassen sie sich nicht abschalten, nur leiser stellen (`audio.ts` Kopf).
 * Das Instrument ist derselbe Speicher wie die Auswahl im Aufgabenkopf
 * (`useMusicSettings`); wer hier wählt, sieht es dort auch.
 */
import { useState } from "react";
import { AkustikAuswahl, AkustikKarte, AkustikRegler, kurzProzent, prozentText } from "@/components/AkustikBausteine";
import { BrailleAkustik } from "@/components/braille/BrailleAkustik";
import {
  INSTRUMENTS, INSTRUMENT_LABELS, musikLautstaerke, playTone, setzeMusikLautstaerke,
} from "@/lib/klangpunkte/audio";
import { note } from "@/lib/klangpunkte/notation";
import { useKlangTexte } from "@/lib/klangpunkte/sprache";
import { useMusicSettings } from "@/lib/klangpunkte/store";

/** Der Ton der Hörprobe: ein C, so wie beim Wechsel des Instruments im Aufgabenkopf. */
const PROBE_TON = note("c", 4, "viertel");

export function KlangpunkteAkustik({ onVorlesen }: { onVorlesen: () => void }) {
  const t = useKlangTexte().uebersicht;
  const instrument = useMusicSettings((s) => s.instrument);
  const setInstrument = useMusicSettings((s) => s.setInstrument);
  const [laut, setLaut] = useState(musikLautstaerke);
  return (
    <BrailleAkustik
      onVorlesen={onVorlesen}
      extra={
        // ★ Eine Karte OHNE Schalter: die Musik ist hier Inhalt, nicht abschaltbar.
        <AkustikKarte
          symbol="note"
          titel={t.akustikMusik}
          erklaerung={t.akustikMusikErklaerung}
        >
          <AkustikAuswahl
            symbol="note"
            name={t.akustikInstrument}
            wert={instrument}
            optionen={INSTRUMENTS.map((i) => ({ wert: i, name: INSTRUMENT_LABELS[i] }))}
            erklaerung={t.akustikInstrumentErklaerung}
            onWert={(w) => {
              const inst = INSTRUMENTS.find((i) => i === w) ?? "klavier";
              setInstrument(inst);
              playTone(PROBE_TON, inst, 0.6);
            }}
          />
          <AkustikRegler
            symbol="lautsprecher"
            name={t.akustikLautstaerke}
            wert={laut}
            min={0}
            max={1}
            schritt={0.1}
            wertText={prozentText(laut)}
            kurzText={kurzProzent(laut)}
            erklaerung={t.akustikLautstaerkeErklaerung}
            onWert={(w) => { setzeMusikLautstaerke(w); setLaut(musikLautstaerke()); }}
            onProbe={() => playTone(PROBE_TON, useMusicSettings.getState().instrument, 0.5)}
          />
        </AkustikKarte>
      }
    />
  );
}
