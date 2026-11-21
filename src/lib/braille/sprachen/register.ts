/**
 * ════════════════════════════════════════════════════════════════════════════
 * DAS REGISTER DER SPRACHEN VON PUNKTGENAU (Bauplan 2026-11-06 §4)
 * ════════════════════════════════════════════════════════════════════════════
 *
 * `BrailleSystem = "basis" | "voll" | "computer"` ist deutsch gedacht
 * (Basisschrift, Vollschrift, Computerbraille). Dieses Register hängt jede
 * Sprache an: Sprache → Schriftarten → liblouis-Tabelle → Zeichensatz.
 *
 *  - `de` und `en` (UEB) sind HIER NUR ABGEBILDET, was heute schon so läuft
 *    (`liblouis.ts` liest seine Tabellen jetzt von hier). Am deutschen Braille
 *    ändert sich nichts - Wächter `tests/punktgenau-deutsch-unveraendert.test.tsx`
 *    und die Golden-Tests der deutschen Etappen.
 *  - Welle 1 (fr es it sv nl pt br): nur die Vollschrift OHNE Kürzungen. Eine
 *    Sprache ist erst `fertig`, wenn ihr Norm-Befund, ihr Lehrgang und ihre
 *    Oberfläche stehen; der Sprachwähler bietet nur fertige an (`sprache.ts`).
 *  - `tabelle` ist die liblouis-Tabelle der GEGENPROBE, nicht die Vorlage:
 *    gebaut wird nach dem Norm-Dokument; bei Abweichung gilt die Norm.
 *  - Neue Tabellen: `liblouis.types.ts` (LouTable), `liblouis.worker.ts`
 *    (TABLE_PATH, Dateien unter `vendor/tables39/`), `scripts/liblouis-de.mjs`.
 */
import type { LouTable } from "../liblouis.types";
import type { BrailleSystem } from "../tables";
import type { LehrSprache } from "./aktuell";

/** Welcher Zeichensatz (Punkttabelle) die Zellen liefert. */
export type Zeichensatz =
  | "de-eigenbau"   // engine.ts / tables.ts (Basisschrift, Vollschrift deutsch)
  | "de-comp8"      // Computerbraille, 8 Punkt
  | "de-kurz"       // Kurzschrift, aus liblouis de-g2 vorgerechnet
  | "en-ueb"        // UEB, aus liblouis en-ueb-g2 vorgerechnet
  | "fr-cbfu"       // sprachen/fr/zeichen.ts + engine.ts (CBFU 2008)
  | "es-cbe" | "it-bic" | "sv-mtm" | "nl-ba" | "pt-grafia"; // Platzhalter der nächsten Sprachen

export interface SchriftArt {
  /** Das deutsche System, an dem die Schriftart im Code hängt (`Etappe.system`). */
  system: BrailleSystem;
  /** liblouis-Tabelle (Gegenprobe bzw. bei de/UEB die Rechenquelle); null = Eigenbau ohne Tabelle. */
  tabelle: LouTable | null;
  zeichensatz: Zeichensatz;
  /** Mit Kürzungen? Welle 1 schreibt nirgends gekürzt. */
  kuerzungen: boolean;
}

export interface SprachEintrag {
  sprache: LehrSprache;
  /** Fertig = Norm-Befund, Lehrgang, Oberfläche stehen; nur dann zeigt der Wähler sie. */
  fertig: boolean;
  /** Das Norm-Dokument, nach dem gebaut wird. */
  norm: { name: string; jahr: number; url: string };
  /** Name der Schriftart in der Sprache selbst (aus der Norm). */
  schriftartName?: string;
  /** Schlüssel: frei gewählter Name der Schriftart (`voll`, `basis`, ...). */
  schriftarten: Record<string, SchriftArt>;
}

export const SPRACHEN_REGISTER: Readonly<Record<LehrSprache, SprachEintrag>> = {
  de: {
    sprache: "de", fertig: true,
    norm: { name: "System der deutschen Brailleschrift", jahr: 2015, url: "" },
    schriftarten: {
      basis: { system: "basis", tabelle: null, zeichensatz: "de-eigenbau", kuerzungen: false },
      voll: { system: "voll", tabelle: "de-g1", zeichensatz: "de-eigenbau", kuerzungen: false },
      computer: { system: "computer", tabelle: "de-comp8", zeichensatz: "de-comp8", kuerzungen: false },
      kurz: { system: "voll", tabelle: "de-g2", zeichensatz: "de-kurz", kuerzungen: true },
    },
  },
  en: {
    // fertig=false: UEB läuft als eigener Bereich IM deutschen Lehrgang; eine englische
    // Oberfläche von Punktgenau gibt es nicht (der Wähler zeigt nur Oberflächen-Sprachen).
    sprache: "en", fertig: false,
    norm: { name: "Rules of Unified English Braille", jahr: 2013, url: "https://iceb.org/Rules%20of%20Unified%20English%20Braille%202013.pdf" },
    schriftarten: {
      ueb: { system: "voll", tabelle: "en-ueb-g2", zeichensatz: "en-ueb", kuerzungen: true },
    },
  },
  fr: {
    sprache: "fr", fertig: true,
    norm: {
      name: "Code braille français uniformisé pour la transcription des textes imprimés (CBFU)", jahr: 2008,
      url: "https://solidarites-sante.gouv.fr/fichiers/bo/2014/14-02/ste_20140002_0000_0086.pdf",
    },
    schriftartName: "Braille intégral",
    schriftarten: {
      voll: { system: "voll", tabelle: "fr-bfu-comp6", zeichensatz: "fr-cbfu", kuerzungen: false },
    },
  },
  es: {
    sprache: "es", fertig: true,
    norm: {
      name: "CBE/ONCE B2 Signografía básica", jahr: 2025,
      url: "https://www.once.es/servicios-sociales/braille/comision-braille-espanola/documentos-tecnicos/documentos-tecnicos-relacionados-con-el-braille",
    },
    schriftartName: "Signografía básica",
    schriftarten: { voll: { system: "voll", tabelle: "es-g1", zeichensatz: "es-cbe", kuerzungen: false } },
  },
  it: {
    sprache: "it", fertig: true,
    norm: { name: "Codice Braille (Biblioteca Italiana per i Ciechi)", jahr: 2022, url: "https://www.bibliotecaciechi.it/wp-content/uploads/2022/03/Codice_Braille.pdf" },
    schriftartName: "Codice braille a sei punti",
    schriftarten: { voll: { system: "voll", tabelle: "it-it-comp6", zeichensatz: "it-bic", kuerzungen: false } },
  },
  sv: {
    sprache: "sv", fertig: true,
    norm: { name: "Svenska skrivregler för punktskrift (MTM)", jahr: 2009, url: "https://www.mtm.se/punktskriftsnamnden/skrivregler-och-riktlinjer/svenska-skrivregler-for-punktskrift/" },
    schriftartName: "Svensk punktskrift",
    schriftarten: { voll: { system: "voll", tabelle: "sv-g0", zeichensatz: "sv-mtm", kuerzungen: false } },
  },
  nl: {
    sprache: "nl", fertig: true,
    schriftartName: "Braillestandaard",
    norm: {
      name: "Braillestandaard voor algemeen gebruik in het Nederlandse taalgebied", jahr: 2019,
      url: "https://braille-autoriteit.org/documenten/braillestandaard_voor_algemeen_gebruik_in_het_Nederlandse_taalgebied_versie_2019.pdf",
    },
    schriftarten: { voll: { system: "voll", tabelle: "nl-NL-g0", zeichensatz: "nl-ba", kuerzungen: false } },
  },
  pt: {
    sprache: "pt", fertig: true,
    // Die gemeinsame Grafia (3.ª ed. 2018, MEC/IBC, mit der Comissão de Braille de Portugal erarbeitet); eine eigene
    // portugiesische Ausgabe war unter inr.pt/grafias nicht zu finden (siehe Befund).
    norm: {
      name: "Grafia Braille para a Língua Portuguesa (Portugal: gemeinsame Ausgabe, INR/Comissão de Braille)", jahr: 2018,
      url: "https://www.gov.br/ibc/pt-br/pesquisa-e-tecnologia/materiais-especializados-1/livros-em-braille-1/o-sistema-braille-arquivos/grafia-braille-para-a-lingua-portuguesa-pdf.pdf",
    },
    schriftartName: "Grafia Braille",
    schriftarten: { voll: { system: "voll", tabelle: "pt-pt-g1", zeichensatz: "pt-grafia", kuerzungen: false } },
  },
  br: {
    sprache: "br", fertig: true,
    norm: {
      name: "Grafia Braille para a Língua Portuguesa (Brasil: IBC)", jahr: 2018,
      url: "https://www.gov.br/ibc/pt-br/pesquisa-e-tecnologia/materiais-especializados-1/livros-em-braille-1/o-sistema-braille-arquivos/grafia-braille-para-a-lingua-portuguesa-pdf.pdf",
    },
    schriftartName: "Grafia Braille",
    schriftarten: { voll: { system: "voll", tabelle: "pt-pt-g1", zeichensatz: "pt-grafia", kuerzungen: false } },
  },
};

/** Die liblouis-Tabelle einer Schriftart (oder null, wenn es keine gibt). */
export function tabelleFuer(sprache: LehrSprache, schriftart: string): LouTable | null {
  return SPRACHEN_REGISTER[sprache].schriftarten[schriftart]?.tabelle ?? null;
}

/** Die Sprachen, die fertig sind (der Wähler bietet nur diese an). */
export function fertigeSprachen(): LehrSprache[] {
  return (Object.values(SPRACHEN_REGISTER) as SprachEintrag[]).filter((e) => e.fertig).map((e) => e.sprache);
}
