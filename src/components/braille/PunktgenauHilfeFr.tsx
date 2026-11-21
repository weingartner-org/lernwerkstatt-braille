/**
 * Der Hilfetext von Punktgenau in anderen Sprachen (Bauplan 2026-11-06 §4).
 *
 * Die deutsche Hilfe erklärt das deutsche System (Basis-, Voll-, Kurzschrift, Computerbraille, UEB,
 * Wochenaufgabe, Konto ...) und steht weiter in `PunktgenauPage.tsx`. Für eine andere Sprache gilt
 * dieser kurze Text aus `texte/<sprache>.ts` (Bereich `hilfe`). Die Tastenliste (`kurztasten`)
 * kommt von der Seite als Kinder-Element, damit es nur EINE Liste gibt.
 */
import type { ReactNode } from "react";
import { Zeichenerklaerung } from "@/lib/arbeitsblatt/Zeichenerklaerung";
import { pgTexte } from "@/lib/braille/sprachen/pg";

export function PunktgenauHilfeFr({ tastenliste, hinweis }: { tastenliste: ReactNode; hinweis: ReactNode }) {
  const t = pgTexte();
  if (!t) return null;
  const h = t.hilfe;
  return (
    <div className="space-y-4 text-sm">
      <div>
        <p className="font-semibold text-ink">{h.tastaturTitel}</p>
        <p className="mt-1 text-ink-muted">{h.tastaturText}</p>
        <ul className="m-0 mt-2 list-none space-y-1 p-0 text-sm">
          <li>
            <span className="font-mono">F · D · S</span> <span className="text-ink-muted">- {h.punkteLinks}</span>
          </li>
          <li>
            <span className="font-mono">J · K · L</span> <span className="text-ink-muted">- {h.punkteRechts}</span>
          </li>
          <li>
            <span className="font-mono">{t.trainer.leertaste}</span>{" "}
            <span className="text-ink-muted">- {h.leertasteAlsLuecke}</span>
          </li>
        </ul>
      </div>
      <Zeichenerklaerung zeichen={h.zeichenErklaerung} titel={h.zeichenTitel} />
      <div>
        <p className="font-semibold text-ink">{h.warumTitel}</p>
        <p className="mt-1 text-ink-muted">{h.warumText}</p>
      </div>
      <div>
        <p className="font-semibold text-ink">{h.bereicheTitel}</p>
        <p className="mt-1 text-ink-muted">{h.bereicheText}</p>
      </div>
      <div>
        <p className="font-semibold text-ink">{h.reihenfolgeTitel}</p>
        <p className="mt-1 text-ink-muted">{h.reihenfolgeText}</p>
      </div>
      <div>
        <p className="font-semibold text-ink">{h.normTitel}</p>
        <p className="mt-1 text-ink-muted">{h.normText}</p>
      </div>
      <div>
        <p className="font-semibold text-ink">{h.kontoTitel}</p>
        <p className="mt-1 text-ink-muted">{h.kontoText}</p>
      </div>
      <hr className="border-hairline" />
      <div>
        <p className="font-semibold text-ink">{h.tastenkombinationen}</p>
        {tastenliste}
        <p className="mt-2 text-xs text-ink-muted">{hinweis}</p>
      </div>
    </div>
  );
}
