/**
 * Verwechslungs-Matrix aus TaskEvent-Telemetrie.
 * Reine Funktionen (kein React, kein Storage) — wie der Engine-Bestand.
 * Alle Felder optional via Guard lesen (Abwärtskompatibilität, Bauvertrag §3.3).
 */
import type { TaskEvent } from "./account";
import { pgTexte } from "./sprachen/pg";

/** Eine Verwechslung: Soll-Einheit `expected` wurde als `typed` getippt. */
export interface ConfusionCell {
  expected: string;
  typed: string;
  count: number;
}

/** Eine Zeile der Matrix: alle Verwechsler einer Soll-Einheit, häufigste zuerst. */
export interface ConfusionRow {
  expected: string;
  total: number;
  seen: number;
  errorRate: number;
  confusedWith: ConfusionCell[];
}

export interface ConfusionMatrix {
  rows: ConfusionRow[];
  totalErrors: number;
}

/**
 * Verwechslungs-Matrix aus einer Event-Liste.
 * Berücksichtigt NUR Events mit gesetztem `unit`. `seen` zählt alle Events
 * mit diesem `unit` (richtig + falsch); Verwechsler-Einträge entstehen nur
 * bei `correct === false && typed` gesetzt und `typed !== unit`.
 * Abwärtskompatibel: Events ohne `unit` werden übersprungen (kein Throw).
 */
export function confusionFromEvents(ev: readonly TaskEvent[]): ConfusionMatrix {
  const seenByUnit = new Map<string, number>();
  const pairs = new Map<string, Map<string, number>>();

  for (const e of ev) {
    if (!e.unit) continue;

    seenByUnit.set(e.unit, (seenByUnit.get(e.unit) ?? 0) + 1);

    if (e.correct === false && e.typed && e.typed !== e.unit) {
      let inner = pairs.get(e.unit);
      if (!inner) {
        inner = new Map<string, number>();
        pairs.set(e.unit, inner);
      }
      inner.set(e.typed, (inner.get(e.typed) ?? 0) + 1);
    }
  }

  const rows: ConfusionRow[] = [];

  for (const [expected, inner] of pairs) {
    const confusedWith: ConfusionCell[] = [];
    for (const [typed, count] of inner) {
      confusedWith.push({ expected, typed, count });
    }
    confusedWith.sort((a, b) => b.count - a.count);

    const total = confusedWith.reduce((s, c) => s + c.count, 0);
    const seen = seenByUnit.get(expected) ?? 0;
    const errorRate = total / Math.max(1, seen);

    rows.push({ expected, total, seen, errorRate, confusedWith });
  }

  rows.sort((a, b) => b.total - a.total);
  const totalErrors = rows.reduce((s, r) => s + r.total, 0);

  return { rows, totalErrors };
}

/** Die N häufigsten Verwechslerpaare global (für die kompakte Kachel). */
export function topConfusions(ev: readonly TaskEvent[], n: number): ConfusionCell[] {
  const { rows } = confusionFromEvents(ev);
  const all: ConfusionCell[] = rows.flatMap((r) => r.confusedWith);
  all.sort((a, b) => b.count - a.count);
  return all.slice(0, n);
}

/**
 * Mnemonik-Tabelle — eigene Merksätze (Du-Ansprache), KEIN BSKDL/KFA-Zitat.
 * Schlüssel = sortiertes Paar "a|b" (symmetrisch nachschlagen).
 */
const MNEMONICS: Record<string, string> = {
  // ★ 14.11.2026: Vorher stand hier „d hat einen Punkt weniger als f" - beide haben drei Punkte.
  "d|f": "d und f haben beide Punkt 1 und 4 - d hat dazu Punkt 5 (rechts), f Punkt 2 (links).",
  // ★ 14.11.2026: „denk an ‚ice': e zuerst, dann i" gestrichen - in „ice" kommt i zuerst.
  "e|i": "e steht oben (Punkt 1·5), i sitzt tiefer (Punkt 2·4).",
  "r|w": "r ist Punkt 1·2·3·5, w ist Punkt 2·4·5·6 — w ist der Sonderling ganz am Ende.",
  "m|u": "m ist oben (Punkt 1·3·4), u sitzt unten (Punkt 1·3·6).",
  "h|j": "h ist Punkt 1·2·5, j ist Punkt 2·4·5 — j rutscht nach rechts.",
  "n|z": "n ist Punkt 1·3·4·5, z ist Punkt 1·3·5·6.",
  // Kurzschrift-Verwechsler (P4) — eigene Merksätze, Du-Ansprache.
  "un|und": "„und“ ist das ganze Wort, „un“ nur ein Baustein im Wort. Steht es allein zwischen zwei Lücken? Dann ist es „und“.",
  "ei|ie": "„ei“ klingt hell wie in „mein“, „ie“ tief wie in „Liebe“. Sprich das Wort leise mit — dann hörst du, welches gemeint ist.",
  "au|eu": "„au“ wie in „Haus“, „eu“ wie in „heute“. Das e in „eu“ macht den Klang spitzer.",
  "sich|sie": "„sich“ und „sie“ sind beide eigene kleine Wörter — aber „sich“ gehört zu einer Tätigkeit (sich freuen), „sie“ meint eine Person.",
  "das|die": "der/die/das sind eine Familie. Achte aufs Wort danach: „die Blume“, „das Haus“ — das verrät dir, welches Zeichen passt.",
  "den|der": "„der“ und „den“ liegen nah beieinander. „den“ kommt, wenn etwas das Ziel ist: „Ich sehe den Hund.“",
};

/**
 * Mnemonik-Vorschlag zu einem Verwechslerpaar — symmetrisch: (a,b) und (b,a)
 * treffen denselben Eintrag. Unbekanntes Paar → undefined.
 */
export function mnemonicFor(expected: string, typed: string): string | undefined {
  const key = [expected, typed].sort().join("|");
  // ★ Andere Sprache (Meldung Testerin 10.11.2026): der Tipp aus `texte/<sprache>.ts` - und
  // fehlt er dort (deutsche Kurzschrift-Paare), gar keiner statt eines deutschen.
  const t = pgTexte();
  if (t) return (t.verwechslungen.merktipps as Readonly<Record<string, string>>)[key];
  return MNEMONICS[key];
}
