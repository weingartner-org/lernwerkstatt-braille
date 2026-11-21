/**
 * Der Coach - was ein Kind als Nächstes rechnet.
 *
 * Grundlage: „Plus - Der Coach" (22.09.2026). Jede Zahl hier steht dort, und
 * jede Regel hier ist eine Regel von dort. Was das Dokument nicht sagt, sagt
 * dieser Code auch nicht.
 *
 * ★ Zwei Türen, eine Maschine. „Ich wähle" nimmt ein Paket, „Mein Training"
 * lässt Plus mischen. Die Wahl des Kindes hat immer Vorrang - `stelleLauf`
 * wird in der ersten Tür gar nicht erst gefragt.
 *
 * ★ Was der Coach NICHT tut, ist genauso wichtig: kein Nachbohren an der
 * Schwäche, keine geblockten Drill-Serien, keine Zeitwertung, kein Etikett,
 * das bleibt. Ein Kind, das bei einer Rechenart schwach ist, bekommt sie
 * NICHT besonders oft - es bekommt die Voraussetzung, und zwar kurz.
 */
import type { Operation } from "./aufgabe";
import { PAKETE, paket, paketeDerStufe, type Paket, type PaketArt } from "./stoffplan";

/* ------------------------------------------------------------------ */
/* Was Plus über ein Kind weiß                                          */
/* ------------------------------------------------------------------ */

export interface PaketStand {
  /** Schwierigkeit dieses Pakets für dieses Kind (Elo). */
  elo: number;
  versuche: number;
  richtigeInFolge: number;
  /** Abgeschlossene Läufe an diesem Paket. */
  laeufe: number;
  /** Läufe, welche die Aufstiegsregel des Stoffplans erfüllt haben. */
  guteLaeufe: number;
  geschafft: boolean;
  /** Karteistufe 0 bis 5 - 0 heißt: noch nicht in der Kartei. */
  kartei: number;
  /** Tagesnummer, an der es wieder drankommt. */
  faellig: number | null;
  /**
   * Ab welchem Versuch der Coach neu zählt - gesetzt, wenn die Lehrkraft
   * „noch einmal üben" beschlossen hat (23.09.2026). Fehlt = ab dem ersten.
   * Siehe {@link sitzt} und {@link ueberschreibe}.
   */
  neuAb?: number;
}

export interface Stand {
  /** Können je Rechenart (Elo). */
  koennen: Partial<Record<Operation, number>>;
  pakete: Record<string, PaketStand>;
  /** Der Tag, auf den sich die Tageszähler beziehen. */
  tag: number;
  /** Wie viele Aufgaben je Paket heute schon - für die Tagesgrenze. */
  heuteJePaket: Record<string, number>;
  /** Zuletzt geübtes Paket - nie zweimal hintereinander am selben Tag. */
  zuletzt: string | null;
}

export const START_ELO = 1000;

/** Tagesnummer aus einem Datum - der Coach rechnet in Tagen, nicht in Uhrzeit. */
export function tagesnummer(datum: Date = new Date()): number {
  return Math.floor(Date.UTC(datum.getFullYear(), datum.getMonth(), datum.getDate()) / 86400000);
}

export function neuerStand(tag = tagesnummer()): Stand {
  return { koennen: {}, pakete: {}, tag, heuteJePaket: {}, zuletzt: null };
}

export function standVon(stand: Stand, id: string): PaketStand {
  return stand.pakete[id] ?? {
    elo: START_ELO, versuche: 0, richtigeInFolge: 0, laeufe: 0,
    guteLaeufe: 0, geschafft: false, kartei: 0, faellig: null,
  };
}

/* ------------------------------------------------------------------ */
/* Das Niveau - Elo                                                     */
/* ------------------------------------------------------------------ */

/**
 * Wie stark rückt ein Wert nach einer Antwort?
 *
 * Anfangs schnell, später träge: die ersten Antworten sagen viel, die
 * hundertste wenig. Das ist der ganze Unterschied zwischen „Plus weiß nach
 * fünf Aufgaben ungefähr Bescheid" und „Plus braucht eine Woche".
 */
export function schrittweite(versuche: number): number {
  if (versuche < 10) return 60;
  if (versuche < 30) return 40;
  return 20;
}

/** Wie wahrscheinlich ist ein Treffer? Die Elo-Formel, unverändert. */
export function erwartung(koennen: number, schwierigkeit: number): number {
  return 1 / (1 + 10 ** ((schwierigkeit - koennen) / 400));
}

/**
 * Die Zielquote: drei von vier Aufgaben richtig.
 *
 * ★ Nicht 0,85. Die 85-Prozent-Regel stammt aus Versuchen mit einfachen
 * Ja-Nein-Aufgaben, nicht aus dem Rechenunterricht. 0,75 ist mit Kindern
 * erprobt (Math Garden, 3 648 Kinder).
 */
export const ZIELQUOTE = 0.75;

/** Bei Angstzeichen wird es leichter, nicht schwerer - mehr Erfolg, mehr Ausdauer. */
export const ZIELQUOTE_SCHONEND = 0.82;

/* ------------------------------------------------------------------ */
/* Nach einer Antwort                                                   */
/* ------------------------------------------------------------------ */

export interface AntwortLage {
  paketId: string;
  richtig: boolean;
  tag?: number;
}

/**
 * Eine Antwort einarbeiten. Beide Werte rücken - das Können des Kindes und
 * die Schwierigkeit des Pakets für dieses Kind.
 */
export function nachAntwort(stand: Stand, lage: AntwortLage): Stand {
  const tag = lage.tag ?? stand.tag;
  const p = paket(lage.paketId);
  const alt = standVon(stand, lage.paketId);
  const koennen = stand.koennen[p.op] ?? START_ELO;
  const e = erwartung(koennen, alt.elo);
  const r = lage.richtig ? 1 : 0;
  const k = schrittweite(alt.versuche);

  const neu: PaketStand = {
    ...alt,
    elo: alt.elo - k * (r - e),
    versuche: alt.versuche + 1,
    richtigeInFolge: lage.richtig ? alt.richtigeInFolge + 1 : 0,
  };

  // Ein neuer Tag setzt die Tageszähler zurück - nicht die Kartei.
  const frischerTag = tag !== stand.tag;
  const heuteJePaket = frischerTag ? {} : { ...stand.heuteJePaket };
  heuteJePaket[lage.paketId] = (heuteJePaket[lage.paketId] ?? 0) + 1;

  return {
    ...stand,
    tag,
    heuteJePaket,
    zuletzt: lage.paketId,
    koennen: { ...stand.koennen, [p.op]: koennen + k * (r - e) },
    pakete: { ...stand.pakete, [lage.paketId]: neu },
  };
}

/* ------------------------------------------------------------------ */
/* Nach einem Lauf                                                      */
/* ------------------------------------------------------------------ */

/**
 * Die Aufstiegsregeln des Stoffplans, in Zahlen.
 *
 * ⚠️ Nur der messbare Teil. Die Regel für `fakten` verlangt zusätzlich, dass
 * Aufgaben mit Übergang beim selben Kind nicht deutlich länger dauern als die
 * ohne - das ist eine Zeitmessung am Kind gegen sich selbst, kein Zeitdruck,
 * und sie hängt an der Fehlererkennung. Bis die steht, zählt hier die Quote.
 */
/*
 * ★ Seit 26.09.2026 hat eine Runde ACHT Aufgaben (Johannes: „rundenbasiert …
 * 8 Rechnungen"). Mit 0,9 hätte eine Runde fehlerlos sein müssen - 7 von 8 sind
 * 0,875. Die Quote steht deshalb auf 0,875: EIN Fehler je Runde ist erlaubt,
 * wie vorher einer von zwölf.
 */
export const AUFSTIEG: Record<PaketArt, { quote: number; laeufe: number }> = {
  fakten: { quote: 0.875, laeufe: 2 },      // 7 von 8, zweimal
  strategie: { quote: 0.7, laeufe: 2 },     // 6 von 8
  schriftlich: { quote: 0.875, laeufe: 2 }, // 7 von 8
  zahlbegriff: { quote: 0.875, laeufe: 1 }, // ein Lauf reicht - hier wird verstanden
  groessen: { quote: 0.8, laeufe: 2 },      // 7 von 8
  sach: { quote: 0, laeufe: 0 },            // kein Aufstieg über die Quote
};

/** Ein Lauf ist zu Ende. Das entscheidet über Aufstieg und Kartei. */
export function nachLauf(stand: Stand, paketId: string, richtige: number, gesamt: number, tag?: number): Stand {
  // ★ Alles übersprungen (17.10.2026): kein Lauf, der etwas sagt - und nie
  // einer, der die Serie guter Läufe zurücksetzt.
  if (gesamt <= 0) return stand;
  const p = paket(paketId);
  const alt = standVon(stand, paketId);
  const regel = AUFSTIEG[p.art];
  const quote = gesamt > 0 ? richtige / gesamt : 0;
  const gut = regel.laeufe > 0 && quote >= regel.quote;
  const guteLaeufe = gut ? alt.guteLaeufe + 1 : 0;   // die Läufe müssen aufeinander folgen
  const geschafft = alt.geschafft
    || (regel.laeufe > 0 && guteLaeufe >= regel.laeufe && alt.richtigeInFolge >= 3);

  const heute = tag ?? stand.tag;
  const kartei = geschafft ? Math.min(5, Math.max(1, gut ? alt.kartei + 1 : 1)) : alt.kartei;

  return {
    ...stand,
    pakete: {
      ...stand.pakete,
      [paketId]: {
        ...alt,
        laeufe: alt.laeufe + 1,
        guteLaeufe,
        geschafft,
        kartei,
        faellig: kartei > 0 ? heute + KARTEI_TAGE[kartei - 1] : alt.faellig,
      },
    },
  };
}

/**
 * Die Kartei: nach 1, 3, 7, 21 und 60 Tagen.
 *
 * Gleichmäßig wachsend, nicht steiler. Im Langzeitvergleich schlägt das die
 * steigenden Abstände - deshalb steht hier keine Verdopplung.
 */
export const KARTEI_TAGE = [1, 3, 7, 21, 60];

/* ------------------------------------------------------------------ */
/* Die Auswahl                                                          */
/* ------------------------------------------------------------------ */

/**
 * ★ So viele Aufgaben hat eine Runde - in „Mein Training" wie in „Ich wähle".
 * Johannes, 26.09.2026: „rundenbasiert aufbauen, 8 Rechnungen und nach 3 Runden
 * kommt ein Rätsel". Kürzer als die zwölf von vorher: Das Ende einer Runde ist
 * ein Ziel, das man sieht.
 */
export const RUNDE = 8;

/** Nach so vielen Runden kommt ein Rätsel. */
export const RUNDEN_BIS_RAETSEL = 3;

export interface LaufWunsch {
  stufe: number;
  anzahl?: number;
  tag?: number;
  /** Zufall mit Saat - derselbe Stand ergibt denselben Lauf. */
  rng?: () => number;
  /** Schonender Zielwert bei Angstzeichen. */
  schonend?: boolean;
}

export interface LaufPlan {
  /** Die Pakete in der Reihenfolge, in der sie drankommen. */
  pakete: string[];
  /** Woher jedes Paket kommt - für die Lehrkraft-Ansicht und die Tests. */
  herkunft: Record<string, "sitzt" | "baustelle" | "kartei" | "andere" | "voraussetzung">;
  /**
   * Warum der Lauf leer blieb. Das passiert, wenn an einem Tag von jeder
   * Rechenart schon genug gerechnet wurde - die Grenze ist Absicht, und die
   * Oberfläche sagt es dem Kind, statt ein leeres Feld zu zeigen.
   */
  hinweis?: string;
}

/**
 * Höchstens so viele Aufgaben EINES Pakets am Tag - danach zurück in die
 * Mischung, auch wenn es noch nicht sitzt.
 *
 * ★★★★★ EINE ZAHL FÜR ALLE WAR FALSCH. Johannes, 23.09.2026:
 *
 * > „das kommt total auf die rechnungen an. wer 1x1 automatisieren kann soll
 * > 50-100 rechnungen machen, wer textaufgaben lösen soll wird nach 4 genug
 * > haben … abwechslung ist wichtig"
 *
 * Bis dahin standen hier zehn - für jedes Paket dieselben. Das ist gleich
 * zweimal daneben: Ein Kind, das das Einmaleins automatisiert, wurde nach der
 * zehnten Aufgabe weggeschickt, obwohl genau die Wiederholung der Lerngegenstand
 * ist. Und ein Kind, das Rechengeschichten liest, bekam zehn davon an einem
 * Tag, obwohl nach der vierten nichts mehr dazukommt außer Müdigkeit.
 *
 * Die Grenze hängt deshalb an der ART des Pakets, die im Stoffplan steht:
 *
 * | Art         | am Tag | warum                                        |
 * |-------------|--------|----------------------------------------------|
 * | fakten      |   100  | Automatisieren IST Wiederholung (1x1, 1+1)   |
 * | zahlbegriff |    30  | kurze Fragen, schnell beantwortet            |
 * | groessen    |    20  | Umwandeln, mit Einheiten                     |
 * | strategie   |    12  | jede Aufgabe will überlegt sein              |
 * | schriftlich |     8  | ein Verfahren in Zeilen dauert               |
 * | sach        |     4  | „wird nach 4 genug haben"                    |
 *
 * ⚠️ Die Grenze gilt NUR für „Mein Training". „Ich wähle" ist die Wahl des
 * Kindes und hat immer Vorrang - wer den ganzen Nachmittag Rechengeschichten
 * lesen will, darf das.
 */
export const TAGESGRENZE: Record<PaketArt, number> = {
  fakten: 100,
  zahlbegriff: 30,
  groessen: 20,
  strategie: 12,
  schriftlich: 8,
  sach: 4,
};

/** Wie viele Aufgaben dieses Pakets heute noch drankommen dürfen. */
export function tagesgrenze(id: string): number {
  return TAGESGRENZE[paket(id).art] ?? 12;
}

/** Wer mehr als zehn Läufe an einem Paket sitzt, bekommt kein elftes. */
export const LAUFGRENZE_JE_PAKET = 10;

/**
 * Sitzt das Paket? Geschafft - oder die Trefferaussicht hat die Zielquote
 * erreicht, und zwar über mindestens vier Versuche SEIT dem letzten Beschluss
 * „noch einmal üben" (`neuAb`). Ohne diese Grenze setzte die alte Elo-Zahl den
 * Beschluss der Lehrkraft sofort wieder ausser Kraft.
 */
export function sitzt(stand: Stand, id: string): boolean {
  const s = standVon(stand, id);
  if (s.geschafft) return true;
  if (s.versuche - (s.neuAb ?? 0) < 4) return false;
  const p = paket(id);
  return erwartung(stand.koennen[p.op] ?? START_ELO, s.elo) >= ZIELQUOTE;
}

/** Sind alle Voraussetzungen erfüllt? */
export function offen(stand: Stand, p: Paket): boolean {
  return !sitzt(stand, p.id) && p.braucht.every((v) => sitzt(stand, v));
}

/**
 * Die Baustelle: das erste Paket der Stufe, das offen ist und dessen
 * Voraussetzungen sitzen. Der Stoffplan ist geordnet, also ist „das erste"
 * auch „das nächste".
 */
export function baustelle(stand: Stand, stufe: number): string | null {
  const liste = paketeDerStufe(stufe);
  // Erst das nächste Paket, dessen Voraussetzungen sitzen.
  const naechstes = liste.find((p) => offen(stand, p));
  if (naechstes) return naechstes.id;
  // ★ Sonst trotzdem der Stufenstoff. Ein Kind, das neu in die 3. Schulstufe
  // kommt, hat keine der Voraussetzungen aus der 2. abgehakt - es soll
  // deswegen nicht ohne Baustelle dastehen. Die fehlenden Voraussetzungen
  // holt der kurze Einschub, nicht ein Umzug in die tiefere Stufe.
  return liste.find((p) => !sitzt(stand, p.id))?.id ?? null;
}

/**
 * Bei einer Lücke einen Schritt zurück - aber nie aus der Stufe hinaus.
 *
 * ★ Nicht mehr vom Gleichen. Ein Kind, das an 3-11 scheitert, übt 1-14 ein
 * paar Aufgaben lang und kehrt zurück. Eine Auswertung über 100 000 Klassen
 * zeigt: wer Kinder zum Nachholen aus dem Stufenstoff nimmt, macht es
 * schlechter, nicht besser. Deshalb ist das hier ein EINSCHUB, kein Umzug.
 */
export function voraussetzungFuer(stand: Stand, id: string): string | null {
  const gesehen = new Set<string>();
  const suche = (pid: string): string | null => {
    if (gesehen.has(pid)) return null;
    gesehen.add(pid);
    for (const v of paket(pid).braucht) {
      if (!sitzt(stand, v)) return suche(v) ?? v;
    }
    return null;
  };
  return suche(id);
}

/** Fällige Wiederholungen aus der Kartei. */
export function faellig(stand: Stand, tag: number, stufe?: number): string[] {
  return Object.entries(stand.pakete)
    .filter(([id, s]) => s.kartei > 0 && s.faellig !== null && s.faellig <= tag
      && (stufe === undefined || paket(id).id.startsWith(`${stufe}-`)))
    .sort((a, b) => (a[1].faellig ?? 0) - (b[1].faellig ?? 0))
    .map(([id]) => id);
}

/**
 * „Mein Training": den Lauf zusammenstellen.
 *
 * Die Mischung steht im Coach-Dokument und ist fest:
 *   etwa die Hälfte   Pakete, die sitzen - Erfolg trägt
 *   höchstens ein Viertel  die Baustelle - nie mehr davon
 *   etwa ein Viertel  Wiederholung aus der Kartei
 *   zwei bis drei     eine andere Rechenart
 *
 * Das Verschachteln ist kein Beiwerk: 61 gegen 38 Prozent in einer
 * Klassenstudie, gegenüber geblockten Serien.
 */
export function stelleLauf(stand: Stand, wunsch: LaufWunsch): LaufPlan {
  const anzahl = Math.min(20, Math.max(RUNDE, wunsch.anzahl ?? 12));
  const tag = wunsch.tag ?? stand.tag;
  const rng = wunsch.rng ?? Math.random;
  const stufe = paketeDerStufe(wunsch.stufe);
  const frischerTag = tag !== stand.tag;
  const heuteJePaket = frischerTag ? {} : stand.heuteJePaket;
  const spielbar = (id: string) =>
    standVon(stand, id).laeufe < LAUFGRENZE_JE_PAKET
    && (heuteJePaket[id] ?? 0) < tagesgrenze(id);

  const herkunft: LaufPlan["herkunft"] = {};
  const nimm = (id: string, woher: LaufPlan["herkunft"][string]) => {
    if (!herkunft[id]) herkunft[id] = woher;
  };

  // 1. Die Baustelle - höchstens ein Viertel des Laufs.
  let bau = baustelle(stand, wunsch.stufe);
  if (bau && !spielbar(bau)) {
    // Wer zehn Läufe an einem Paket sitzt, bekommt kein elftes, sondern die
    // Voraussetzung.
    const zurueck = voraussetzungFuer(stand, bau);
    if (zurueck && spielbar(zurueck)) { nimm(zurueck, "voraussetzung"); bau = null; }
  }
  if (bau && spielbar(bau)) nimm(bau, "baustelle");

  // 2. Die Voraussetzung, wenn die Baustelle hakt - der kurze Einschub.
  if (bau && standVon(stand, bau).versuche >= 4 && !sitzt(stand, bau)) {
    const zurueck = voraussetzungFuer(stand, bau);
    if (zurueck && spielbar(zurueck)) nimm(zurueck, "voraussetzung");
  }

  // 3. Fällige Wiederholungen.
  for (const id of faellig(stand, tag).filter(spielbar).slice(0, 3)) nimm(id, "kartei");

  // 4. Pakete, die sitzen - die tragende Hälfte.
  const sitzen = stufe.filter((p) => sitzt(stand, p.id) && spielbar(p.id)).map((p) => p.id);
  for (const id of mischen(sitzen, rng).slice(0, 4)) nimm(id, "sitzt");

  // 5. Eine andere Rechenart - das Verschachteln.
  const artDerBaustelle = bau ? paket(bau).op : null;
  const andere = stufe
    .filter((p) => p.op !== artDerBaustelle && spielbar(p.id) && (sitzt(stand, p.id) || offen(stand, p)))
    .map((p) => p.id);
  for (const id of mischen(andere, rng).slice(0, 2)) nimm(id, "andere");

  // 6. Auffüllen, falls die Stufe noch jung ist und kaum etwas sitzt.
  for (const p of stufe) {
    if (Object.keys(herkunft).length >= 4) break;
    if (spielbar(p.id) && p.braucht.every((v) => sitzt(stand, v))) nimm(p.id, "baustelle");
  }

  const quellen = Object.keys(herkunft);
  if (!quellen.length) {
    return { pakete: [], herkunft, hinweis: "Für heute ist die Mischung ausgeschöpft." };
  }

  // Jede Quelle bekommt ihren Anteil - die Mischung des Coach-Dokuments.
  const viertel = Math.max(1, Math.floor(anzahl / 4));
  const anteil: Record<string, number> = {};
  /**
   * ★★★ Was heute noch drankommen darf. Ohne diesen Deckel hätte die Mischung
   * die Tagesgrenze im selben Lauf überrannt: Ein Paket mit Rechengeschichten
   * darf vier am Tag, ein Lauf hat zwölf Aufgaben - und `anteil` füllte
   * notfalls alle zwölf aus einem Paket auf.
   */
  const rest = (id: string) => Math.max(0, tagesgrenze(id) - (heuteJePaket[id] ?? 0));
  const setze = (id: string, n: number) => {
    anteil[id] = Math.min(rest(id), Math.max(anteil[id] ?? 0, n));
    if (anteil[id] <= 0) delete anteil[id];
  };
  for (const id of quellen) {
    const woher = herkunft[id];
    if (woher === "baustelle") setze(id, viertel);
    else if (woher === "voraussetzung") setze(id, Math.min(3, viertel));  // „ein paar Aufgaben lang"
    else if (woher === "kartei") setze(id, Math.max(1, Math.round(viertel / 2)));
    else if (woher === "andere") setze(id, 1);
    else setze(id, Math.max(2, Math.round(anzahl / 2 / Math.max(1, sitzendeQuellen(herkunft)))));
  }

  // Auffüllen und Kürzen, bis die Summe stimmt. Aufgefüllt wird mit dem, was
  // sitzt - und wenn nichts sitzt, mit der Baustelle: lieber zwölf Aufgaben
  // aus einem Paket als ein Lauf, der nach drei Aufgaben aufhört.
  const fuellId = quellen.find((id) => herkunft[id] === "sitzt") ?? quellen[0];
  let summe = Object.values(anteil).reduce((a, b) => a + b, 0);
  // ★ Aufgefüllt wird nur, wo heute noch Platz ist. Ist nirgends mehr Platz,
  // wird der Lauf kürzer - das ist die Absicht der Grenze, kein Mangel.
  while (summe < anzahl) {
    const id = (anteil[fuellId] ?? 0) < rest(fuellId)
      ? fuellId
      : quellen.find((q) => (anteil[q] ?? 0) < rest(q));
    if (!id) break;
    anteil[id] = (anteil[id] ?? 0) + 1;
    summe++;
  }
  while (summe > anzahl) {
    const groesste = Object.entries(anteil).sort((a, b) => b[1] - a[1])[0];
    anteil[groesste[0]]--;
    if (anteil[groesste[0]] <= 0) delete anteil[groesste[0]];
    summe--;
  }

  // Verschränken: immer das Paket mit dem größten Rest, aber nie dasselbe
  // zweimal hintereinander - es sei denn, es gibt nur eines.
  const folge: string[] = [];
  while (folge.length < anzahl) {
    const uebrig = Object.entries(anteil).filter(([, n]) => n > 0);
    if (!uebrig.length) break;
    const vorher = folge[folge.length - 1];
    const wahl = uebrig.filter(([id]) => id !== vorher).sort((a, b) => b[1] - a[1])[0] ?? uebrig[0];
    anteil[wahl[0]]--;
    folge.push(wahl[0]);
  }
  return { pakete: folge, herkunft };
}

/** Wie viele Quellen tragen den Lauf, weil sie sitzen? */
function sitzendeQuellen(herkunft: LaufPlan["herkunft"]): number {
  return Object.values(herkunft).filter((w) => w === "sitzt").length;
}

/** Mischen mit dem Zufall, den der Aufrufer mitbringt. */
function mischen<T>(liste: readonly T[], rng: () => number): T[] {
  const a = [...liste];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ------------------------------------------------------------------ */
/* Was die Lehrkraft sieht                                              */
/* ------------------------------------------------------------------ */

export type Einstufung = "sitzt" | "wackelt" | "offen";

/**
 * Der Stand eines Kindes in Worten - einsehbar und überschreibbar.
 *
 * ★ Das ist nicht nur freundlich, es ist Pflicht: eine rein automatische
 * Entscheidung über einen Menschen ist nach der Datenschutz-Grundverordnung
 * nicht zulässig. Deshalb gibt es `ueberschreibe`.
 *
 * Was die Lehrkraft NICHT sieht: Fehlermuster-Listen und Spielzeiten.
 */
export function einstufung(stand: Stand, id: string): Einstufung {
  if (sitzt(stand, id)) return "sitzt";
  const s = standVon(stand, id);
  if (s.versuche === 0) return "offen";
  return s.richtigeInFolge >= 1 || s.guteLaeufe > 0 ? "wackelt" : "offen";
}

/**
 * Die Lehrkraft setzt eine Einstufung von Hand.
 *
 * ★★ Seit 23.09.2026 wirkt das auch in der Richtung „nicht sitzt". Bis dahin
 * wurde nur `geschafft` zurückgenommen - `sitzt()` fragte danach aber die
 * Elo-Rechnung, und die sagte bei einem Kind, das früher viel richtig hatte,
 * sofort wieder „sitzt". Der Beschluss wäre still verpufft. Die Funktion war
 * bis zum Reiter „Plus" in „Meine Klasse" nie benutzt; der Wächter
 * `tests/plus-beschluss.test.ts` hält die Richtung jetzt fest.
 *
 * `neuAb` lässt den Coach ab jetzt neu zählen, OHNE die bisherigen Versuche zu
 * löschen: „Meine Zahlen" zeigt weiter, wie viel das Kind gerechnet hat.
 */
export function ueberschreibe(stand: Stand, id: string, wert: Einstufung): Stand {
  const alt = standVon(stand, id);
  return {
    ...stand,
    pakete: {
      ...stand.pakete,
      [id]: {
        ...alt,
        geschafft: wert === "sitzt",
        guteLaeufe: wert === "sitzt" ? Math.max(alt.guteLaeufe, 2) : 0,
        richtigeInFolge: wert === "offen" ? 0 : alt.richtigeInFolge,
        neuAb: wert === "sitzt" ? alt.neuAb : alt.versuche,
      },
    },
  };
}

/** Alle Pakete einer Stufe mit ihrer Einstufung - die Übersicht der Lehrkraft. */
export function uebersicht(stand: Stand, stufe: number): { id: string; name: string; wie: Einstufung }[] {
  return paketeDerStufe(stufe).map((p) => ({ id: p.id, name: p.name, wie: einstufung(stand, p.id) }));
}

/** Für Wächter: kennt der Coach jedes Paket des Stoffplans? */
export function alleIds(): string[] {
  return PAKETE.map((p) => p.id);
}
