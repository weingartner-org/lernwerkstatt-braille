/**
 * Gemeinsame Bausteine der Sprach-Lehrgänge von Punktgenau (es, it; fr hat seine eigene Kopie
 * in `fr/lehrgang.ts`, die nicht angefasst wird - Französisch bleibt Byte für Byte).
 *
 * Gleiche Etappen-Logik wie die deutsche Basisschrift (`etappen.ts`): kleine Gruppen neuer
 * Zeichen, danach Wörter und Sätze nur aus dem, was schon gelernt ist, am Ende ganze Texte.
 * Die Sprache liefert nur ihre Texte, ihre Reihenfolge und ihre Wortvorräte.
 */
import type { Level } from "../curriculum";
import { defaultGate, type Etappe, type EtappenUnit } from "../etappen";
import type { LehrSprache } from "./aktuell";

export interface Wortvorraete {
  woerter: readonly string[];
  namen: readonly string[];
  saetze: readonly string[];
  texte: readonly string[];
}

/** Eine Gruppe neuer Buchstaben (Kind „tú/tu", Lehrkraft „usted/Lei"). */
export interface BuchstabenGruppe {
  id: string;
  /** Wie viele Buchstaben der Reihenfolge nach dieser Gruppe bekannt sind. */
  bis: number;
  titel: string;
  du: string;
  sie: string;
}

export interface LehrgangBauer {
  etappen: Etappe[];
  levels: Level[];
  dazu: (
    e: Omit<Etappe, "levelId" | "system" | "masteryGate" | "lang" | "items"> & {
      kind: Level["kind"];
      items: () => string[];
    },
  ) => void;
}

export function lehrgangBauer(sprache: LehrSprache): LehrgangBauer {
  const levels: Level[] = [];
  const etappen: Etappe[] = [];
  return {
    etappen,
    levels,
    dazu(e) {
      const { kind, items, ...rest } = e;
      levels.push({
        id: e.id,
        title: e.title,
        kind,
        system: "voll",
        intro: e.introDu,
        legend: e.legend || undefined,
        zeichen: e.zeichen,
        items: items(),
      });
      etappen.push({
        ...rest,
        levelId: e.id,
        system: "voll",
        items: (alle) => alle,
        masteryGate: defaultGate(),
        lang: sprache,
      });
    },
  };
}

export const menge = (buchstaben: string, extra = ""): Set<string> => new Set([...buchstaben, ...extra]);

/** Wörter (mindestens 2 Buchstaben) nur aus den gelernten Buchstaben. */
export const woerterMit =
  (woerter: readonly string[], buchstaben: string) => (): string[] => {
    const s = menge(buchstaben);
    return woerter.filter((w) => w.length >= 2 && [...w].every((c) => s.has(c)));
  };

/** Namen (Großbuchstabe vorn) nur aus den gelernten Buchstaben. */
export const namenMit =
  (namen: readonly string[], buchstaben: string) => (): string[] => {
    const s = menge(buchstaben);
    return namen.filter((w) => [...w.toLowerCase()].every((c) => s.has(c)));
  };

/** Sätze nur aus allen Buchstaben und den bis dahin gelernten Satzzeichen, mit mindestens einem neuen. */
export const saetzeMit =
  (saetze: readonly string[], alleBuchstaben: string, satzzeichen: string, neu: string, maxLaenge = 70) =>
  (): string[] => {
    const erlaubt = new Set([...alleBuchstaben, ...satzzeichen]);
    return saetze.filter(
      (t) =>
        t.length <= maxLaenge &&
        [...t.toLowerCase()].every((c) => erlaubt.has(c) || c === " ") &&
        [...neu].some((z) => t.includes(z)),
    );
  };

export const einheitenAus =
  (namen: Record<string, string>) =>
  (zeichen: string): EtappenUnit[] =>
    [...zeichen].map((k) => ({ key: k, spoken: namen[k] ?? k }));
