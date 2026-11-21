/**
 * Das Akustik-Menü von Plus - es klappt unter dem runden Lautsprecher in der
 * Kopfzeile auf (Johannes, 17.10.2026: „ein Menü mit allen Akustik-
 * Einstellungen mit Schiebereglern und Erklärung beim Darüberfahren").
 *
 * Fünf Einstellungen: Vorlesen an/aus, Sprechtempo, Lautstärke der Stimme,
 * Töne an/aus, Lautstärke der Töne. Alles gilt auf diesem Gerät.
 *
 * ★ Die Erklärung kommt aus dem `Tipp`-Baustein der Kopfzeile: sofort da, in
 * lesbarer Größe, beim Darüberfahren UND beim Fokus - und per
 * `aria-describedby` am Bedienelement, damit Sprachausgabe und Braillezeile
 * sie auch bekommen.
 *
 * ★ Schieberegler sind hier keine Zieh-Aufgabe: Pfeiltasten verschieben in
 * kleinen Schritten, Bild auf/ab in großen, Pos1/Ende an den Rand. Jeder
 * Regler sagt seinen Wert als Wort (`aria-valuetext`), nicht als nackte Zahl.
 *
 * ★ Eine Hörprobe nach dem Verschieben - aber nur, wenn das, was geprobt
 * wird, auch an ist. Ein ausgeschaltetes Vorlesen spricht nicht, nur weil
 * jemand am Tempo dreht.
 */
import { useState, type ReactNode } from "react";
import {
  AkustikKarte, AkustikRahmen, AkustikRegler, akustikKnopfTipp, kurzProzent, prozentText, tempoText,
} from "@/components/AkustikBausteine";
import {
  TEMPO_MAX, TEMPO_MIN, sage, setzeStimmeLautstaerke, setzeStimmeTempo,
  stimmeLautstaerke, stimmeTempo,
} from "@/lib/plus/stimme";
import { setzeTonLautstaerke, spieleRichtigTon, tonLautstaerke } from "@/lib/plus/ton";
import { usePlusTexte } from "@/lib/plus/sprache";

// Die Bausteine (Schalter, Regler, Erklärung) stehen seit dem Abend des
// 17.10.2026 in `components/AkustikBausteine.tsx` - für alle Apps einmal.
export { prozentText, tempoText };

export const AKUSTIK_TIPP = akustikKnopfTipp();

export interface PlusAkustikProps {
  vorlesen: boolean;
  onVorlesen: () => void;
  toene: boolean;
  onToene: () => void;
}

export function PlusAkustik({ vorlesen, onVorlesen, toene, onToene }: PlusAkustikProps): ReactNode {
  const texte = usePlusTexte();
  const t = texte.akustik;
  const [tempo, setTempo] = useState(stimmeTempo);
  const [stimmLaut, setStimmLaut] = useState(stimmeLautstaerke);
  const [tonLaut, setTonLaut] = useState(tonLautstaerke);
  const probeStimme = () => { if (vorlesen) sage(t.probe); };
  const probeTon = () => { if (toene) spieleRichtigTon(); };
  return (
    // ★ Kartenform wie Tastenflow (Johannes, 18.10.2026: „alle Akustik-Menüs
    // bekommen die Kartenform von Tastenflow"). Die Breite liefert der Rahmen
    // der Kopfzeile - hier KEIN eigenes w-80.
    <div className="max-h-[80vh] w-full overflow-y-auto">
      <AkustikRahmen titel={t.kopf} titelSichtbar={false}>
        <AkustikKarte
          symbol="vorlesen"
          titel={t.vorlesenTitel}
          an={vorlesen}
          onWechsel={onVorlesen}
          erklaerung={t.vorlesenErkl(texte.seite.stimmeHinweis)}
        >
          {vorlesen && (
            <>
              <AkustikRegler
                symbol="tempo"
                name={t.tempo}
                wert={tempo}
                min={TEMPO_MIN}
                max={TEMPO_MAX}
                schritt={0.1}
                wertText={tempoText(tempo)}
                kurzText={kurzProzent(tempo)}
                erklaerung={t.tempoErkl}
                onWert={(w) => { setzeStimmeTempo(w); setTempo(stimmeTempo()); }}
                onProbe={probeStimme}
              />
              <AkustikRegler
                symbol="lautsprecherLeise"
                name={t.lautStimme}
                wert={stimmLaut}
                min={0}
                max={1}
                schritt={0.1}
                wertText={prozentText(stimmLaut)}
                kurzText={kurzProzent(stimmLaut)}
                erklaerung={t.lautStimmeErkl}
                onWert={(w) => { setzeStimmeLautstaerke(w); setStimmLaut(stimmeLautstaerke()); }}
                onProbe={probeStimme}
              />
            </>
          )}
        </AkustikKarte>

        <AkustikKarte
          symbol="glocke"
          titel={t.toene}
          an={toene}
          onWechsel={onToene}
          erklaerung={t.toeneErkl}
        >
          <AkustikRegler
            symbol="lautsprecher"
            gedimmt={!toene}
            name={t.lautToene}
            wert={tonLaut}
            min={0}
            max={1}
            schritt={0.1}
            wertText={prozentText(tonLaut)}
            kurzText={kurzProzent(tonLaut)}
            erklaerung={t.lautToeneErkl}
            onWert={(w) => { setzeTonLautstaerke(w); setTonLaut(tonLautstaerke()); }}
            onProbe={probeTon}
          />
        </AkustikKarte>
      </AkustikRahmen>
    </div>
  );
}
