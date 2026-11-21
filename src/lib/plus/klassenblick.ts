/**
 * DER BLICK DER LEHRKRAFT AUF IHRE KLASSE - Zeiträume, Kennzahlen, Hinweise.
 * ============================================================================
 *
 * > **Johannes, 16.10.2026:** „die Lehrerseite von Plus gibt viel zu wenig
 * > Metadaten über die übenden Schüler frei. Zudem ist kaum etwas einzustellen.
 * > Gestalte die Seite nach der Verwaltungsseite von Tastenflow, überlege dir,
 * > welche Parameter sinnvoll sind, mach auch einiges als Klassenüberblick und
 * > dann jeder Schüler zum genau Schauen."
 *
 * ★★★★★ WAS SICH GEGENÜBER 23.09.2026 GEÄNDERT HAT - UND WAS NICHT.
 *
 * Bis dahin galt: „Die Lehrkraft sieht genau das, was das Kind über sich selbst
 * sieht - nicht mehr" (`klassenstand.ts`). Das war eine Vorsicht, keine
 * Vorgabe von Johannes - und sie hat die Seite unbrauchbar gemacht: Wer eine
 * Klasse unterrichtet, muss sehen, wer seit zwei Wochen nicht gerechnet hat und
 * wo die Klasse hängt. Jetzt sieht die Lehrkraft MEHR als das Kind:
 *
 *   • zuletzt gerechnet, Aufgaben und Quote je Zeitraum, Wochenzahlen,
 *   • je Rechenart und je Übung die Quote,
 *   • woran der Coach bei einem Kind gerade arbeitet (Muster, die sich über
 *     mehrere Läufe gezeigt haben - als Arbeitsstand, nie als Befund).
 *
 * Was GEBLIEBEN ist, weil es zum Wesen der App gehört (Johannes 22.09.2026:
 * „kein Zeitdruck, keine Rangliste"):
 *
 *   • **Jede Zeit fehlt.** Plus misst keine Dauer und kein Tempo; auch die neue
 *     Mitschrift `taeglich` zählt Aufgaben je TAG, nie Minuten.
 *   • **Jede Reihung fehlt.** Alle Listen stehen nach Namen oder in fester
 *     Reihenfolge der Sache, nie nach Leistung. Die „Hinweise" nennen Gründe,
 *     keine Plätze.
 *   • **Kein Etikett.** Ein Hinweis sagt, was zu tun sein könnte („Stufe
 *     prüfen"), nie, was ein Kind ist.
 *
 * Gelesen wird aus `PlusFortschritt`; geschrieben wird nichts (die
 * Beschlüsse laufen über `beschluss.ts`).
 */
import type { Operation } from "./aufgabe";
import { kalenderwoche } from "./abzeichen";
import { haelt, schublade, type Vermutung } from "./fehler";
import type { PlusFortschritt } from "./fortschritt";
import { kindStand, uebungenDerStufe, type KindStand } from "./klassenstand";
import { rueckblick, type Rueckblick } from "./rueckblick";

/* ══ Zeiträume ══════════════════════════════════════════════════════════════ */

export type Zeitraum = "woche" | "monat" | "schuljahr" | "gesamt";

export const ZEITRAEUME: { key: Zeitraum; name: string; satz: string }[] = [
  { key: "woche", name: "7 Tage", satz: "den letzten 7 Tagen" },
  { key: "monat", name: "30 Tage", satz: "den letzten 30 Tagen" },
  { key: "schuljahr", name: "Schuljahr", satz: "diesem Schuljahr" },
  { key: "gesamt", name: "Gesamt", satz: "der ganzen Zeit" },
];

/** Der erste Tag des Schuljahres (1. August), das den Tag `heute` enthält - als Tagesnummer. */
export function schuljahrBeginn(heute: number): number {
  const d = new Date(heute * 86_400_000);
  const jahr = d.getUTCMonth() >= 7 ? d.getUTCFullYear() : d.getUTCFullYear() - 1;
  return Math.floor(Date.UTC(jahr, 7, 1) / 86_400_000);
}

/** Von und bis (beide einschließlich) - dazu der gleich lange Zeitraum davor. `null` = gesamt. */
export interface Fenster { von: number; bis: number; vorVon: number | null; vorBis: number | null }

export function fenster(z: Zeitraum, heute: number): Fenster | null {
  if (z === "gesamt") return null;
  if (z === "schuljahr") return { von: schuljahrBeginn(heute), bis: heute, vorVon: null, vorBis: null };
  const lang = z === "woche" ? 7 : 30;
  return { von: heute - lang + 1, bis: heute, vorVon: heute - 2 * lang + 1, vorBis: heute - lang };
}

/** Der Montag der Woche, in der `tag` liegt. 1.1.1970 (Tag 0) war ein Donnerstag. */
export function montagVon(tag: number): number {
  return tag - ((tag + 3) % 7);
}

function summe(
  taeglich: PlusFortschritt["taeglich"], von: number, bis: number,
): { gerechnet: number; richtige: number; tage: number } {
  let gerechnet = 0, richtige = 0, tage = 0;
  for (const [k, [g, r]] of Object.entries(taeglich)) {
    const t = Number(k);
    if (t < von || t > bis) continue;
    gerechnet += g; richtige += r; tage += 1;
  }
  return { gerechnet, richtige, tage };
}

/* ══ Ein Kind ═══════════════════════════════════════════════════════════════ */

export interface KindBlick extends KindStand {
  /** Aufgaben und richtige im gewählten Zeitraum. */
  zGerechnet: number;
  zRichtige: number;
  /** An wie vielen Tagen im Zeitraum gerechnet wurde. */
  zTage: number;
  /** Aufgaben im Zeitraum davor - `null` bei Schuljahr und Gesamt. */
  vorGerechnet: number | null;
  vorRichtige: number | null;
  /** Vor wie vielen Tagen zuletzt gerechnet wurde - `null`: noch nie. */
  zuletztVor: number | null;
  /** Das Wochenziel DIESER Woche: gerechnet und Ziel. */
  woche: { geschafft: number; ziel: number };
  runden: number;
  raetsel: number;
  /** Mitschrift je Tag vorhanden? Ohne sie bleiben die Zeiträume leer, nur „Gesamt" zählt. */
  mitgezaehlt: boolean;
}

export function kindBlick(
  kind: { id: string; name: string },
  f: PlusFortschritt | null,
  z: Zeitraum,
  heute: number,
): KindBlick {
  const basis = kindStand(kind, f);
  if (!f) {
    return {
      ...basis, zGerechnet: 0, zRichtige: 0, zTage: 0, vorGerechnet: null, vorRichtige: null,
      zuletztVor: null, woche: { geschafft: 0, ziel: 0 }, runden: 0, raetsel: 0, mitgezaehlt: false,
    };
  }
  const mitgezaehlt = Object.keys(f.taeglich).length > 0;
  const w = fenster(z, heute);
  const jetzt = w ? summe(f.taeglich, w.von, w.bis) : { gerechnet: f.gerechnet, richtige: f.richtige, tage: f.tage.length };
  const davor = w && w.vorVon !== null && w.vorBis !== null ? summe(f.taeglich, w.vorVon, w.vorBis) : null;
  const letzter = f.tage.length ? Math.max(...f.tage) : null;
  const dieseWoche = f.wochenziel.woche === kalenderwoche(new Date(heute * 86_400_000 + 43_200_000));
  return {
    ...basis,
    zGerechnet: jetzt.gerechnet,
    zRichtige: jetzt.richtige,
    zTage: jetzt.tage,
    vorGerechnet: davor?.gerechnet ?? null,
    vorRichtige: davor?.richtige ?? null,
    zuletztVor: letzter === null ? null : Math.max(0, heute - letzter),
    woche: { geschafft: dieseWoche ? f.wochenziel.geschafft : 0, ziel: f.wochenziel.ziel },
    runden: f.runden,
    raetsel: f.raetselGeloest,
    mitgezaehlt,
  };
}

/** „heute" · „gestern" · „vor 5 Tagen" · „vor 3 Wochen" · „noch nie". */
export function zuletztSatz(vor: number | null): string {
  if (vor === null) return "noch nie";
  if (vor === 0) return "heute";
  if (vor === 1) return "gestern";
  if (vor < 14) return `vor ${vor} Tagen`;
  return `vor ${Math.round(vor / 7)} Wochen`;
}

/** Prozent, ganzzahlig - `null`, wenn nichts gerechnet wurde. */
export function prozent(richtige: number, gerechnet: number): number | null {
  return gerechnet > 0 ? Math.round((richtige / gerechnet) * 100) : null;
}

/** Die Richtung gegenüber dem Zeitraum davor: ↗ besser, ↘ schlechter, → gleich. Ab drei Punkten. */
export function trendQuote(k: KindBlick): { pfeil: "↗" | "↘" | "→"; punkte: number } | null {
  if (k.vorGerechnet === null || k.vorRichtige === null) return null;
  const jetzt = prozent(k.zRichtige, k.zGerechnet);
  const davor = prozent(k.vorRichtige, k.vorGerechnet);
  if (jetzt === null || davor === null) return null;
  const d = jetzt - davor;
  return { pfeil: d >= 3 ? "↗" : d <= -3 ? "↘" : "→", punkte: d };
}

/* ══ Wochensäulen ═══════════════════════════════════════════════════════════ */

export interface WochenSaeule {
  /** Tagesnummer des Montags. */
  montag: number;
  aufgaben: number;
  richtige: number;
  /** Wie viele Kinder in dieser Woche gerechnet haben. */
  aktive: number;
}

/** Die letzten `anzahl` Kalenderwochen (die laufende zuletzt), Aufgaben je Woche. */
export function wochenSaeulen(
  fortschritte: readonly (PlusFortschritt | null)[], heute: number, anzahl = 8,
): WochenSaeule[] {
  const ersterMontag = montagVon(heute) - 7 * (anzahl - 1);
  const reihe: WochenSaeule[] = Array.from({ length: anzahl }, (_, i) => ({
    montag: ersterMontag + 7 * i, aufgaben: 0, richtige: 0, aktive: 0,
  }));
  for (const f of fortschritte) {
    if (!f) continue;
    const aktivIn = new Set<number>();
    for (const [k, [g, r]] of Object.entries(f.taeglich)) {
      const i = Math.floor((montagVon(Number(k)) - ersterMontag) / 7);
      if (i < 0 || i >= anzahl) continue;
      reihe[i].aufgaben += g;
      reihe[i].richtige += r;
      aktivIn.add(i);
    }
    for (const i of aktivIn) reihe[i].aktive += 1;
  }
  return reihe;
}

/** „2. Okt." für den Montag einer Woche. */
export function tagKurz(tag: number): string {
  const d = new Date(tag * 86_400_000);
  const monate = ["Jän.", "Feb.", "März", "Apr.", "Mai", "Juni", "Juli", "Aug.", "Sep.", "Okt.", "Nov.", "Dez."];
  return `${d.getUTCDate()}. ${monate[d.getUTCMonth()]}`;
}

/* ══ Die Klasse ═════════════════════════════════════════════════════════════ */

export interface KlassenBlick {
  kinder: number;
  /** Haben Plus schon geöffnet. */
  begonnen: number;
  /** Haben im Zeitraum gerechnet. */
  aktiv: number;
  aufgaben: number;
  richtige: number;
  /** Aufgaben je Kind, das im Zeitraum gerechnet hat - gerundet. */
  jeKind: number | null;
  /** Wochenziel dieser Woche erreicht: wie viele von wie vielen mit Ziel. */
  zielErreicht: number;
  mitZiel: number;
  sitzt: number;
  runden: number;
  raetsel: number;
  /** Mit Mitschrift je Tag - für den Satz „zählt ab 16.10. mit". */
  mitgezaehlt: number;
}

export function klassenBlick(kinder: readonly KindBlick[]): KlassenBlick {
  const aktive = kinder.filter((k) => k.zGerechnet > 0);
  const aufgaben = kinder.reduce((s, k) => s + k.zGerechnet, 0);
  const mitZiel = kinder.filter((k) => k.begonnen && k.woche.ziel > 0);
  return {
    kinder: kinder.length,
    begonnen: kinder.filter((k) => k.begonnen).length,
    aktiv: aktive.length,
    aufgaben,
    richtige: kinder.reduce((s, k) => s + k.zRichtige, 0),
    jeKind: aktive.length ? Math.round(aufgaben / aktive.length) : null,
    zielErreicht: mitZiel.filter((k) => k.woche.geschafft >= k.woche.ziel).length,
    mitZiel: mitZiel.length,
    sitzt: kinder.reduce((s, k) => s + k.sitzt, 0),
    runden: kinder.reduce((s, k) => s + k.runden, 0),
    raetsel: kinder.reduce((s, k) => s + k.raetsel, 0),
    mitgezaehlt: kinder.filter((k) => k.mitgezaehlt).length,
  };
}

/* ══ Zum Hinschauen ═════════════════════════════════════════════════════════ */

export interface Hinweis {
  id: "nichtGeoeffnet" | "langeNichtGerechnet" | "vieleFehler" | "unterfordert" | "zielErreicht";
  /** Der ganze Satz - ohne die Namen. */
  satz: string;
  /** Die Namen, nach dem Alphabet. */
  namen: string[];
  /** Ein guter Hinweis (Wochenziel) oder einer zum Hinschauen. */
  gut: boolean;
}

/** Ab so vielen Tagen ohne Rechnen gilt „länger nicht gerechnet". */
export const LANGE_PAUSE_TAGE = 8;
/** Für die Quote der letzten Tage braucht es mindestens so viele Aufgaben. */
export const QUOTE_MIN_AUFGABEN = 20;

/**
 * Was die Lehrkraft sich ansehen könnte. ★ Keine Reihung: Es sind Gründe mit
 * Namen, alphabetisch; kein Kind steht „oben" und keines „unten". ★ Die
 * Schwellen stehen hier, damit der Hinweis im Reiter dieselben nennt.
 *
 * `letzte14` ist die Mitschrift der letzten 14 Tage je Kind - die Quote wird
 * hier gebildet, nicht im KindBlick, weil sie vom gewählten Zeitraum
 * unabhängig sein muss.
 */
export function hinweise(
  kinder: readonly { k: KindBlick; f: PlusFortschritt | null }[], heute: number,
): Hinweis[] {
  const namen = (liste: { k: KindBlick }[]) =>
    liste.map((x) => x.k.name).sort((a, b) => a.localeCompare(b, "de"));
  const aus: Hinweis[] = [];

  const nie = kinder.filter((x) => !x.k.begonnen);
  if (nie.length) aus.push({ id: "nichtGeoeffnet", satz: "Haben Plus noch nicht geöffnet", namen: namen(nie), gut: false });

  const pause = kinder.filter((x) => x.k.begonnen && x.k.zuletztVor !== null && x.k.zuletztVor >= LANGE_PAUSE_TAGE);
  if (pause.length) {
    aus.push({
      id: "langeNichtGerechnet", satz: `Seit ${LANGE_PAUSE_TAGE} Tagen oder länger nicht gerechnet`,
      namen: namen(pause), gut: false,
    });
  }

  const zwei = kinder.map((x) => {
    const s = x.f ? summe(x.f.taeglich, heute - 13, heute) : { gerechnet: 0, richtige: 0, tage: 0 };
    return { ...x, s };
  });
  const viele = zwei.filter((x) => x.s.gerechnet >= QUOTE_MIN_AUFGABEN && x.s.richtige / x.s.gerechnet < 0.6);
  if (viele.length) {
    aus.push({
      id: "vieleFehler",
      satz: "In den letzten 14 Tagen unter 60 Prozent richtig - die Schulstufe oder die Übungen prüfen",
      namen: namen(viele), gut: false,
    });
  }
  const leicht = zwei.filter((x) => x.s.gerechnet >= 2 * QUOTE_MIN_AUFGABEN && x.s.richtige / x.s.gerechnet >= 0.95);
  if (leicht.length) {
    aus.push({
      id: "unterfordert",
      satz: "In den letzten 14 Tagen 95 Prozent oder mehr richtig - vielleicht reicht eine höhere Schulstufe",
      namen: namen(leicht), gut: false,
    });
  }

  const ziel = kinder.filter((x) => x.k.begonnen && x.k.woche.ziel > 0 && x.k.woche.geschafft >= x.k.woche.ziel);
  if (ziel.length) aus.push({ id: "zielErreicht", satz: "Wochenziel diese Woche erreicht", namen: namen(ziel), gut: true });

  return aus;
}

/* ══ Ein Kind genau ═════════════════════════════════════════════════════════ */

export const ART_NAME: Record<Operation, string> = {
  plus: "Plus", minus: "Minus", mal: "Mal", geteilt: "Geteilt", gemischt: "Gemischt",
  zahlen: "Zahlen", bruch: "Brüche", prozent: "Prozent", potenz: "Potenzen", wurzel: "Wurzeln", term: "Terme",
};

const ART_FOLGE = Object.keys(ART_NAME) as Operation[];

export interface ArtZeile { art: string; name: string; gerechnet: number; richtige: number }

/** Je Rechenart - in der festen Reihenfolge der Sache, nicht nach Leistung. Nur Gerechnetes. */
export function artZeilen(f: PlusFortschritt | null): ArtZeile[] {
  if (!f) return [];
  return ART_FOLGE
    .filter((a) => (f.jeArt[a]?.[0] ?? 0) > 0)
    .map((a) => ({ art: a, name: ART_NAME[a], gerechnet: f.jeArt[a][0], richtige: f.jeArt[a][1] }));
}

export interface UebungsZeile {
  id: string;
  name: string;
  wie: ReturnType<typeof uebungenDerStufe>[number]["wie"];
  laeufe: number;
  gerechnet: number;
  richtige: number;
}

/** Die Übungen einer Schulstufe mit Stand, Läufen und Quote. */
export function uebungsZeilen(f: PlusFortschritt | null, stufe: number): UebungsZeile[] {
  return uebungenDerStufe(f, stufe).map((u) => ({
    ...u,
    laeufe: f?.stand.pakete[u.id]?.laeufe ?? 0,
    gerechnet: f?.jePaket[u.id]?.[0] ?? 0,
    richtige: f?.jePaket[u.id]?.[1] ?? 0,
  }));
}

/**
 * Woran der Coach bei diesem Kind gerade arbeitet - ein Satz je Muster, das
 * sich über mehrere Läufe gezeigt hat und noch hält.
 *
 * ★ Ein ARBEITSSTAND mit Ablaufdatum (21 Tage), kein Befund: Fällt die
 * Quote eines Musters unter zwei Drittel, verschwindet es von selbst. Das
 * Kind sieht diese Muster nicht; es bekommt nur den kurzen Merksatz bei der
 * passenden Aufgabe. Die Lehrkraft sieht sie, damit sie dasselbe sagen kann.
 */
const MUSTER_FUER_LEHRKRAFT: Record<string, string> = {
  umkehrfehler: "Zieht die kleinere Zahl von der größeren ab, auch wenn es umgekehrt gemeint ist",
  uebertrag: "Vergisst den Übertrag beim Addieren oder Subtrahieren",
  null_fehler: "Lässt die Null in der Mitte oder am Ende aus",
  komma: "Setzt das Komma an die falsche Stelle",
  stellen_quotient: "Zählt die Stellen im Ergebnis der Division falsch",
  stellenwert: "Vertauscht Zehner und Einer",
  gleichnamig: "Rechnet bei gleichnamigen Brüchen auch die Nenner zusammen",
  vorrang: "Rechnet von links nach rechts statt Punkt vor Strich",
};

export interface MusterZeile { id: string; satz: string; zuletztVor: number; trefferTage: number }

export function musterZeilen(f: PlusFortschritt | null, heute: number): MusterZeile[] {
  if (!f) return [];
  return f.vermutungen
    // Aus dem Speicher kann ein halbes Muster kommen - ohne Tage ist es keines.
    .filter((v: Vermutung) => Array.isArray(v.tage) && Number.isFinite(v.treffer) && Number.isFinite(v.zuletzt))
    .filter((v: Vermutung) => haelt(v, heute) && schublade(v) === "systematisch" && MUSTER_FUER_LEHRKRAFT[v.muster])
    .map((v) => ({
      id: v.muster,
      satz: MUSTER_FUER_LEHRKRAFT[v.muster],
      zuletztVor: Math.max(0, heute - v.zuletzt),
      trefferTage: v.tage.length,
    }))
    .sort((a, b) => a.id.localeCompare(b.id));
}

/** Wo es besser geworden ist - dieselbe Rechnung wie „Ich gegen früher" des Kindes. */
export function besserGeworden(f: PlusFortschritt | null, heute: number): Rueckblick {
  if (!f) return { sitztJetzt: [], wirdBesser: [] };
  return rueckblick(f.verlauf, f.stand, heute);
}

/** Die Wochensäulen EINES Kindes - dieselbe Rechnung wie die der Klasse. */
export function wochenSaeulenKind(f: PlusFortschritt | null, heute: number, anzahl = 8): WochenSaeule[] {
  return wochenSaeulen([f], heute, anzahl);
}
